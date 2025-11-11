# Wiki Encyclopedia: Architecture Fixes (Response to Codex Review)

**Last Updated: 2025-01-10**

---

## Executive Summary

This document addresses critical architectural issues identified by Codex code review and provides concrete fixes for the wiki encyclopedia plan.

###  Codex Issues Identified:
1. ❌ **Hybrid content architecture has no single source of truth** (markdown files vs database drift)
2. ❌ **Search can't search article content** (only indexes title/summary/tags)
3. ❌ **Bilingual support undefined** (Dutch UI but English-only search dictionary)
4. ❌ **View tracking privacy undefined** (IP storage, session management, GDPR compliance)
5. ❌ **Dashboard integration data contracts missing** (user goals, activity access undefined)
6. ❌ **Phase ordering creates dependency mismatch** (building discovery features before content exists)

### ✅ Solutions Implemented:
1. **Single source of truth**: Store full markdown in `wiki_articles.content_markdown` field
2. **Full-body search**: Index entire article content, support English + Dutch
3. **Privacy-friendly tracking**: Client-side localStorage, no IP storage
4. **Clear data contracts**: Define dashboard integration API surface
5. **Realistic development**: Use seed/mock articles for feature development

---

## Fix 1: Single Source of Truth (Database as Runtime Source)

### Problem
Original plan had articles sync from `content/wiki/*.md` → database (metadata only), but pages re-read files at runtime. This creates:
- Drift between database (search index) and rendered content
- Serverless incompatibility (can't read files at runtime)
- No canonical source for API consumers

### Solution: Database-First Architecture

**Content Flow**:
```
1. Write article → content/wiki/nutrition/protein.md (Git version control)
2. Run sync script → parse + store in database:
   - wiki_articles.content_markdown (full markdown)
   - wiki_articles.content_html (pre-rendered HTML, optional)
   - wiki_articles.search_text (plain text for search)
3. Runtime → read from database only
4. Git history → audit trail, rollback capability
```

**Updated Database Schema**:
```sql
CREATE TABLE wiki_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',

  -- CONTENT (single source of truth)
  content_markdown TEXT NOT NULL,  -- Raw markdown (canonical)
  content_html TEXT,  -- Pre-rendered HTML (cache)
  search_text TEXT,  -- Plain text for search indexing

  -- METADATA
  evidence_rating TEXT,
  author TEXT,
  reviewers TEXT[] DEFAULT '{}',
  summary TEXT,
  language TEXT DEFAULT 'en', -- 'en' or 'nl'

  -- ANALYTICS
  view_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,

  -- TIMESTAMPS
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Sync Script Behavior** (`scripts/sync-wiki-articles.ts`):
```typescript
// For each .md file in content/wiki/
async function syncArticle(filePath: string) {
  // 1. Read file
  const rawContent = await fs.readFile(filePath, 'utf-8');

  // 2. Parse frontmatter + markdown
  const { data: frontmatter, content: markdown } = matter(rawContent);

  // 3. Render to HTML
  const html = await markdownToHtml(markdown);

  // 4. Extract plain text for search
  const searchText = stripHtml(html);

  // 5. Upsert to database
  await supabase.from('wiki_articles').upsert({
    slug: generateSlug(filePath),
    title: frontmatter.title,
    category: frontmatter.category,
    tags: frontmatter.tags,
    content_markdown: markdown,  // CANONICAL SOURCE
    content_html: html,  // OPTIONAL CACHE
    search_text: searchText,  // FOR FULL-TEXT SEARCH
    evidence_rating: frontmatter.evidence_rating,
    author: frontmatter.author,
    language: frontmatter.language || 'en',
    // ... other fields
  }, { onConflict: 'slug' });
}
```

**Runtime Rendering** (`app/wiki/[category]/[slug]/page.tsx`):
```typescript
export default async function ArticlePage({ params }: { params: { slug: string } }) {
  // Fetch from database ONLY (single source of truth)
  const { data: article } = await supabase
    .from('wiki_articles')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!article) notFound();

  // Use pre-rendered HTML (or render markdown on-demand if not cached)
  const html = article.content_html || await markdownToHtml(article.content_markdown);

  return <ArticleLayout article={article} html={html} />;
}
```

**Benefits**:
- ✅ Database is single runtime source (no drift)
- ✅ Serverless-compatible (no file system reads)
- ✅ Git files remain for version control + authoring
- ✅ Search indexes same content users see
- ✅ API consumers get canonical data

---

## Fix 2: Full-Body Search with Bilingual Support

### Problem
Original plan only indexed `title`, `summary`, `tags` → users can't search article content.
Used English dictionary only → Dutch queries fail.

### Solution: Full-Text Search on Article Content + Dual Language Support

**Updated Search Schema**:
```sql
-- Add separate search vectors for each language
ALTER TABLE wiki_articles
  ADD COLUMN search_vector_en TSVECTOR,
  ADD COLUMN search_vector_nl TSVECTOR;

-- GIN indexes for fast search
CREATE INDEX idx_wiki_search_en ON wiki_articles USING GIN(search_vector_en);
CREATE INDEX idx_wiki_search_nl ON wiki_articles USING GIN(search_vector_nl);

-- Trigger to update both search vectors
CREATE OR REPLACE FUNCTION wiki_update_search_vectors()
RETURNS TRIGGER AS $$
BEGIN
  -- English search vector (title + summary + tags + full content)
  NEW.search_vector_en :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.summary, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.search_text, '')), 'D');

  -- Dutch search vector
  NEW.search_vector_nl :=
    setweight(to_tsvector('dutch', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('dutch', COALESCE(NEW.summary, '')), 'B') ||
    setweight(to_tsvector('dutch', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C') ||
    setweight(to_tsvector('dutch', COALESCE(NEW.search_text, '')), 'D');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER wiki_articles_search_update
BEFORE INSERT OR UPDATE ON wiki_articles
FOR EACH ROW EXECUTE FUNCTION wiki_update_search_vectors();
```

**Search Function with Language Detection**:
```sql
CREATE OR REPLACE FUNCTION search_wiki_articles(
  search_query TEXT,
  search_language TEXT DEFAULT 'auto'  -- 'auto', 'en', or 'nl'
)
RETURNS TABLE (
  slug TEXT,
  title TEXT,
  category TEXT,
  summary TEXT,
  rank_en REAL,
  rank_nl REAL,
  combined_rank REAL
) AS $$
BEGIN
  RETURN QUERY
  WITH ranked_articles AS (
    SELECT
      a.slug,
      a.title,
      a.category,
      a.summary,
      ts_rank(a.search_vector_en, plainto_tsquery('english', search_query)) AS rank_en,
      ts_rank(a.search_vector_nl, plainto_tsquery('dutch', search_query)) AS rank_nl
    FROM wiki_articles a
    WHERE a.is_published = TRUE
      AND (
        a.search_vector_en @@ plainto_tsquery('english', search_query) OR
        a.search_vector_nl @@ plainto_tsquery('dutch', search_query)
      )
  )
  SELECT
    r.slug,
    r.title,
    r.category,
    r.summary,
    r.rank_en,
    r.rank_nl,
    CASE
      WHEN search_language = 'en' THEN r.rank_en
      WHEN search_language = 'nl' THEN r.rank_nl
      ELSE GREATEST(r.rank_en, r.rank_nl)  -- Auto: use best match
    END AS combined_rank
  FROM ranked_articles r
  ORDER BY combined_rank DESC, view_count DESC NULLS LAST
  LIMIT 50;  -- Increased from 20 for pagination
END;
$$ LANGUAGE plpgsql;
```

**Client-Side Search with Language Detection** (`lib/wiki/search.ts`):
```typescript
// Simple language detection (can be improved)
function detectLanguage(query: string): 'en' | 'nl' | 'auto' {
  const dutchWords = ['voeding', 'fitness', 'training', 'gezondheid', 'spieren'];
  const hasDutch = dutchWords.some(word => query.toLowerCase().includes(word));
  return hasDutch ? 'nl' : 'auto';  // Default to auto (searches both)
}

export async function searchArticles(query: string) {
  const language = detectLanguage(query);
  const { data } = await supabase.rpc('search_wiki_articles', {
    search_query: query,
    search_language: language
  });
  return data;
}
```

**Benefits**:
- ✅ Searches full article content (not just title/summary)
- ✅ Supports both English and Dutch queries
- ✅ Weighted search (title > summary > tags > content)
- ✅ Pagination support (50 results, can add offset)
- ✅ Language detection for better relevance

**Typo Tolerance** (Future Enhancement):
```sql
-- Can add trigram similarity for typo tolerance
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_wiki_title_trgm ON wiki_articles USING GIN (title gin_trgm_ops);

-- Query with similarity threshold
SELECT * FROM wiki_articles
WHERE similarity(title, 'protien') > 0.3  -- Matches "protein"
ORDER BY similarity(title, 'protien') DESC;
```

---

## Fix 3: Privacy-Compliant View Tracking (Client-Side)

### Problem
Original plan: "Deduplicate by IP/session within 1 hour" but never defined:
- How session tokens are generated
- How IPs are stored (hashing? anonymization?)
- GDPR compliance

### Solution: Anonymous Client-Side Tracking with localStorage

**No IP Storage** → Use client-side session tracking:

**Client-Side Tracking** (`components/wiki/ViewTracker.tsx`):
```typescript
'use client'

import { useEffect } from 'react';

// Generate or retrieve persistent session ID
function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = localStorage.getItem('wiki_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('wiki_session_id', sessionId);
  }
  return sessionId;
}

// Check if article viewed today
function hasViewedToday(slug: string): boolean {
  const key = `viewed_${slug}`;
  const viewedDate = localStorage.getItem(key);
  const today = new Date().toDateString();
  return viewedDate === today;
}

// Mark article as viewed today
function markViewedToday(slug: string) {
  const key = `viewed_${slug}`;
  const today = new Date().toDateString();
  localStorage.setItem(key, today);
}

export function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    // Only track if not viewed today
    if (!hasViewedToday(slug)) {
      fetch('/api/wiki/track-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug })
      })
        .then(res => {
          if (res.ok) markViewedToday(slug);
        })
        .catch(() => {}); // Fail silently
    }
  }, [slug]);

  return null; // No UI
}
```

**Server-Side API** (`app/api/wiki/track-view/route.ts`):
```typescript
export async function POST(request: Request) {
  try {
    const { slug } = await request.json();

    // Simply increment counters (no session/IP needed)
    await Promise.all([
      // Increment total view count
      supabase.rpc('increment_view_count', { article_slug: slug }),

      // Increment daily view count for "Populair Vandaag"
      supabase.from('wiki_article_views').upsert({
        article_slug: slug,
        view_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        view_count: 1
      }, {
        onConflict: 'article_slug,view_date',
        // PostgreSQL: ON CONFLICT ... DO UPDATE SET view_count = view_count + 1
      })
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
```

**Database Function** (for atomic increment):
```sql
CREATE OR REPLACE FUNCTION increment_view_count(article_slug TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE wiki_articles
  SET view_count = view_count + 1
  WHERE slug = article_slug;
END;
$$ LANGUAGE plpgsql;
```

**Privacy Benefits**:
- ✅ No IP storage → GDPR-compliant
- ✅ No server-side session management
- ✅ localStorage persists across page reloads
- ✅ Users can clear storage → resets tracking
- ✅ Fails gracefully (view tracking optional)

**Accuracy Trade-offs**:
- ❌ Clearing storage = new views (acceptable for MVP)
- ❌ Incognito mode = not tracked (acceptable)
- ✅ Still accurate enough for "Populair Vandaag"

---

## Fix 4: Dashboard Integration Data Contracts

### Problem
Plan assumes access to "user goals" and "recent activity" without defining:
- What data exists in dashboard
- API surface for accessing it
- Permissions/privacy model

### Solution: Explicit Data Contracts

**Dashboard Data Available** (from project-overview memory):
```typescript
// From user_stats table (dashboard database)
interface UserStats {
  user_id: string;
  level: number;
  total_xp: number;
  current_streak: number;
  total_workouts: number;
  total_meals_logged: number;
  last_activity_date: Date;
}

// From workouts table
interface RecentWorkout {
  id: string;
  user_id: string;
  name: string;
  created_at: Date;
}

// From meals table
interface RecentMeal {
  id: string;
  user_id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  created_at: Date;
}
```

**Wiki Recommendation Logic** (`lib/wiki/recommendations.ts`):
```typescript
export async function getRecommendedArticles(userId: string | null): Promise<Article[]> {
  // If not logged in → show popular articles
  if (!userId) {
    return getPopularArticles(3);
  }

  // Fetch user stats from dashboard database
  const { data: stats } = await supabase
    .from('user_stats')
    .select('total_workouts, total_meals_logged')
    .eq('user_id', userId)
    .single();

  if (!stats) return getPopularArticles(3);

  // Simple heuristic: recommend based on activity
  const articleSlugs: string[] = [];

  if (stats.total_workouts > 0) {
    articleSlugs.push('progressive-overload', 'muscle-hypertrophy');
  }

  if (stats.total_meals_logged > 0) {
    articleSlugs.push('protein', 'calorie-balance');
  }

  // Fallback to popular if user hasn't done anything
  if (articleSlugs.length === 0) {
    return getPopularArticles(3);
  }

  // Fetch recommended articles
  const { data: articles } = await supabase
    .from('wiki_articles')
    .select('slug, title, category, summary')
    .in('slug', articleSlugs)
    .limit(3);

  return articles || [];
}

// Fallback: popular articles
async function getPopularArticles(limit: number) {
  const { data } = await supabase
    .from('wiki_articles')
    .select('slug, title, category, summary')
    .order('view_count', { ascending: false })
    .limit(limit);

  return data || [];
}
```

**Dashboard Integration Points**:

1. **Stat Card Links** → Static links (no user data needed)
   ```tsx
   // components/dashboard/StatCard.tsx
   <StatCard
     label="Total Workouts"
     value={stats.total_workouts}
     learnMoreHref="/wiki/training-methods/training-volume"
   />
   ```

2. **Achievement Articles** → Static mapping (no user data needed)
   ```typescript
   // lib/wiki/achievement-article-map.ts
   export const ACHIEVEMENT_ARTICLES = {
     'first_workout': 'strength-training-basics',
     'first_pr': 'progressive-overload',
     'streak_7': 'habit-formation',
     // ...
   };
   ```

3. **Recommended Reading Widget** → Uses user stats (defined above)
   ```tsx
   // components/dashboard/RecommendedArticles.tsx
   export async function RecommendedArticles({ userId }: { userId: string }) {
     const articles = await getRecommendedArticles(userId);
     return <ArticleList articles={articles} />;
   }
   ```

**Benefits**:
- ✅ Clear data contracts (TypeScript interfaces)
- ✅ Graceful degradation (works for anonymous users)
- ✅ Simple heuristics (no ML needed for MVP)
- ✅ Uses existing dashboard tables (no new data)

---

## Fix 5: Mock Data for Feature Development

### Problem
Original phase order: Build search/discovery (Week 2-3) before writing articles (Week 4-6) → no real content to develop against.

### Solution: Seed Database with Mock Articles in Phase 1

**Add Task 1.7: Create Seed Articles** (Phase 1):

Create 3-5 high-quality seed articles to use during development:

1. **Protein** (nutrition) - ~2000 words, well-cited
2. **Progressive Overload** (exercise-science) - ~1500 words
3. **Energy Systems** (physiology) - ~1800 words
4. **Strength Training Basics** (training-methods) - ~1600 words
5. **Habit Formation** (psychology) - ~1500 words

**Why These 5**:
- Cover all major categories
- Different lengths (test rendering, TOC)
- Different evidence ratings (test badges)
- Provide enough content for search testing (various keywords)

**Task Checklist** (add to Phase 1):
```
### 1.7 Create Seed Articles for Development
- [ ] Write "Protein" article (nutrition, well-established)
- [ ] Write "Progressive Overload" article (exercise-science, well-established)
- [ ] Write "Energy Systems" article (physiology, well-established)
- [ ] Write "Strength Training Basics" (training-methods, expert-consensus)
- [ ] Write "Habit Formation" (psychology, emerging-research)
- [ ] Add 5-8 citations to each
- [ ] Test different article lengths (1500-2000 words)
- [ ] Run sync script to add to database
- [ ] Test: 5 articles searchable, render correctly
```

**Benefits**:
- ✅ Real content for testing search/discovery features
- ✅ Validate article template with actual content
- ✅ Test full-text search with real queries
- ✅ "Populair Vandaag" has articles to display
- ✅ Related articles can reference each other
- ✅ Reduces rework (features built with realistic data)

**Updated Timeline**:
- **Week 1**: Phase 1.1-1.6 (Content System)
- **Week 2 (first half)**: Phase 1.7 (Write 5 seed articles)
- **Week 2 (second half)**: Phase 2 (Search & Discovery - now has real content)
- **Week 3**: Phase 3 (Evidence & Credibility)
- **Week 4-5**: Phase 4 (Write remaining 10-15 articles)
- **Week 6**: Phase 5 (Dashboard Integration)
- **Week 7**: Phase 6 (Polish & Testing)

---

## Updated Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Content Authoring Flow                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Write Article                                             │
│     └─> content/wiki/nutrition/protein.md                     │
│         (Git version control, markdown editor)                │
│                                                               │
│  2. Run Sync Script                                           │
│     └─> scripts/sync-wiki-articles.ts                         │
│         • Parse frontmatter (title, category, tags, etc.)     │
│         • Store content_markdown (canonical source)           │
│         • Pre-render content_html (optional cache)            │
│         • Extract search_text (plain text)                    │
│         • Update search_vector_en + search_vector_nl          │
│                                                               │
│  3. Runtime Serving                                           │
│     └─> app/wiki/[category]/[slug]/page.tsx                   │
│         • Fetch from wiki_articles table                      │
│         • Render content_html (or markdown if not cached)     │
│         • Track view (client-side localStorage)               │
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     Database Schema (Fixed)                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  wiki_articles                                                │
│  ├─ slug (primary key)                                        │
│  ├─ title, category, tags                                     │
│  ├─ content_markdown (CANONICAL SOURCE)                       │
│  ├─ content_html (pre-rendered cache)                         │
│  ├─ search_text (plain text for indexing)                     │
│  ├─ search_vector_en (English full-text search)               │
│  ├─ search_vector_nl (Dutch full-text search)                 │
│  ├─ language ('en' or 'nl')                                   │
│  ├─ evidence_rating, author, reviewers                        │
│  └─ view_count, is_published, created_at, updated_at          │
│                                                               │
│  wiki_article_views (daily tracking)                          │
│  ├─ article_slug (FK)                                         │
│  ├─ view_date (YYYY-MM-DD)                                    │
│  └─ view_count                                                │
│                                                               │
│  wiki_citations                                               │
│  ├─ article_slug (FK)                                         │
│  ├─ citation_number                                           │
│  └─ authors, year, title, publication, url                    │
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Search Flow (Bilingual)                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  User Query: "protein intake" or "eiwit inname"               │
│      ↓                                                        │
│  Language Detection (client-side)                             │
│      ↓                                                        │
│  search_wiki_articles(query, language)                        │
│      • Search both EN and NL vectors                          │
│      • Weighted: title > summary > tags > content             │
│      • Rank by relevance + view_count                         │
│      ↓                                                        │
│  Return Top 50 Results (paginated)                            │
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              View Tracking (Privacy-Compliant)                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Client-Side (localStorage):                                  │
│  • Generate session_id (crypto.randomUUID())                  │
│  • Check if viewed today: localStorage.getItem('viewed_{slug}')│
│  • If not viewed → POST /api/wiki/track-view                  │
│  • Mark viewed: localStorage.setItem('viewed_{slug}', today)  │
│                                                               │
│  Server-Side (no IP storage):                                 │
│  • Increment wiki_articles.view_count                         │
│  • Upsert wiki_article_views (daily tracking)                 │
│  • No session validation (trust client-side dedupe)           │
│                                                               │
│  Privacy:                                                     │
│  ✅ No IP addresses stored                                    │
│  ✅ No server-side sessions                                   │
│  ✅ GDPR-compliant (anonymous tracking)                       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Summary of Changes

| Original Issue | Fix Applied |
|----------------|-------------|
| **Hybrid content drift** | Store `content_markdown` in database as single source of truth. Git files for version control only. |
| **Search doesn't search content** | Index full `search_text` in both `search_vector_en` and `search_vector_nl`. Weighted search (title > summary > content). |
| **English-only search** | Dual search vectors for English + Dutch. Language detection on client. |
| **View tracking privacy undefined** | Client-side localStorage tracking. No IP storage. GDPR-compliant. |
| **Dashboard integration unclear** | Explicit data contracts using `user_stats` table. Graceful degradation for anonymous users. |
| **Phase ordering mismatch** | Add Phase 1.7: Write 5 seed articles before building search/discovery features. |

---

## Next Steps

1. **Update main plan document** with these fixes
2. **Update context document** with new architecture decisions
3. **Update task checklist** with revised Phase 1.7
4. **Begin implementation** with confidence in architecture

---

**End of Architecture Fixes Document**
