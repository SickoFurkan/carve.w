# Wiki Encyclopedia: Context & Key Decisions

**Last Updated: 2025-01-10**

---

## Project Context

**Project**: Carve Wiki - Educational encyclopedia for the Carve fitness ecosystem
**Current State**: Placeholder homepage with 4 category cards, no actual articles
**Goal**: Transform into comprehensive, evidence-based fitness encyclopedia with 10-20 foundational articles

---

## Key Design Decisions

### 1. Content Management: Database-First with Git Backup (UPDATED)

**Decision**: Store full markdown content in database, Git files as source and version control

**Architecture**:
```
Write .md file → Sync script → Database (full content) → Runtime reads DB only
```

**Database stores**:
- `content_markdown` (full markdown - CANONICAL SOURCE at runtime)
- `content_html` (pre-rendered HTML cache)
- `search_text` (plain text for full-body search)
- `search_vector_en` + `search_vector_nl` (bilingual full-text search)

**Git files serve as**:
- Source for writing (markdown editor)
- Version control / audit trail
- Backup and rollback capability

**Rationale**:
- ✅ Single source of truth at runtime (database)
- ✅ No drift between search index and rendered content
- ✅ Serverless-compatible (no file system reads)
- ✅ Full-text search on actual article content
- ✅ Git for version control and authoring workflow

**Alternative Considered (Original Plan)**: Metadata-only in database, read files at runtime
- Rejected: Creates drift, incompatible with serverless, search can't index content

**Alternative Considered**: Headless CMS (Contentful, Sanity)
- Rejected: Overkill for 10-20 initial articles, extra dependency

**See**: `ARCHITECTURE-FIXES.md` Fix #1 for detailed implementation

---

### 2. Knowledge Structure: Domain-Based Categories

**Decision**: 6 knowledge domain categories (Nutrition, Exercise Science, Physiology, Training Methods, Psychology, Injury & Health)

**Rationale**:
- Most scalable for encyclopedia-style content
- Matches how scientific research is organized
- Works well with consistent article format
- Neutral (doesn't assume user goals)
- Can grow infinitely within each domain

**Alternative Considered**: Activity-based (Strength, Cardio, etc.)
- Rejected: Less comprehensive, harder to fit all topics

**Alternative Considered**: Outcome-based (Fat Loss, Muscle Gain, etc.)
- Rejected: Too goal-specific, articles don't fit single outcome

**Implementation**:
- Primary structure: Knowledge domains
- Secondary navigation: Tags (activity-based, outcome-based, difficulty)
- Discovery: Search + recommendations

---

### 3. Article Format: Consistent Template

**Decision**: Every article follows same structure (Summary, TOC, Main Content, Sources, Related Articles)

**Rationale**:
- Easier to write at scale (template-based)
- Consistent user experience
- Simpler to maintain
- Can evolve template over time (applies to all articles)

**Alternative Considered**: Varied formats (guides, reference, deep dives)
- Rejected: Adds complexity, harder to maintain consistency

**Template Structure**:
```markdown
# Title
## Summary
## Table of Contents
## Main Content (sections)
## Sources
## Related Articles
```

---

### 4. Evidence System: Multi-Layered Credibility

**Decision**: Evidence ratings + inline citations + expert review badges

**Rationale**:
- Evidence ratings signal confidence at a glance
- Inline citations support specific claims
- Expert review badges add trust signal
- Combination provides robust credibility without being overwhelming

**Evidence Rating Levels**:
- 🟢 Well-Established: Strong peer-reviewed consensus
- 🟡 Emerging Research: Promising but needs more study
- 🔵 Expert Consensus: Based on practitioner experience

**Citation Requirements**:
- Every factual claim has inline citation
- Sources section with full references
- Prefer peer-reviewed journals

---

### 5. Discovery: Search-First with Browse Support (UPDATED)

**Decision**: Prominent search bar as hero element with full-body bilingual search, category browsing secondary

**Search Implementation**:
- **Full-text search** on entire article content (not just title/summary)
- **Bilingual support**: English + Dutch with dual search vectors
- **Weighted ranking**: Title > Summary > Tags > Content
- **Language detection**: Auto-detect Dutch keywords or search both
- **50 results** with pagination support

**Rationale**:
- Search is fastest way to find specific information
- Users expect to search article content, not just titles
- Bilingual support matches UI ("Populair Vandaag" is Dutch)
- Users know what they're looking for (intent-driven)

**Implementation**:
- Large search bar on wiki homepage (above category cards)
- Real-time search with `search_vector_en` + `search_vector_nl`
- Category pages for browsing
- "Populair Vandaag" sidebar for discovery

**Alternative Considered**: Title/summary-only search
- Rejected: Users can't find articles by content keywords

**Alternative Considered**: Browse-first
- Rejected: Slower for users with specific questions

**See**: `ARCHITECTURE-FIXES.md` Fix #2 for search implementation

---

### 6. Popular Articles: "Populair Vandaag" Sidebar (UPDATED)

**Decision**: Right sidebar on homepage showing top 5 articles by views from today, using privacy-friendly client-side tracking

**View Tracking Implementation**:
- **Client-side**: localStorage tracks viewed articles (session ID)
- **No IP storage**: GDPR-compliant, privacy-first
- **Deduplication**: One view per article per day (localStorage key)
- **Server-side**: Simple increment, no session validation

**Rationale**:
- Creates sense of activity and community
- Helps users discover trending topics
- Encourages repeat visits ("what's popular today?")
- Privacy-compliant (no personal data stored)

**Implementation**:
- Track daily views in `wiki_article_views` table
- Query top 5 for current date
- Cache for 1 hour
- Mobile: show below categories (not sidebar)
- Fallback: All-time popular if no views today

**Alternative Considered**: IP-based deduplication
- Rejected: GDPR concerns, requires hashing/anonymization

**See**: `ARCHITECTURE-FIXES.md` Fix #3 for privacy implementation

---

### 7. Dashboard Integration: Light Touch (UPDATED)

**Decision**: Subtle "Learn more" links from dashboard to wiki with explicit data contracts

**Data Contracts Defined**:
- **Available**: `user_stats` (level, XP, workouts, meals, streak)
- **Available**: Recent activity (workouts, meals from last 7 days)
- **NOT available**: User-defined goals (not in schema yet)

**Integration Implementation**:
1. **Stat Card Links** (static, no data needed):
   - Workout count → Training Volume article
   - Nutrition score → Meal Planning article
   - Streak → Habit Formation article

2. **Achievement Articles** (static mapping):
   - first_workout → Strength Training Basics
   - first_pr → Progressive Overload
   - streak_7 → Habit Formation

3. **Recommended Reading** (uses user_stats):
   - If workouts > 0 → exercise articles
   - If meals > 0 → nutrition articles
   - Fallback: popular articles

**Rationale**:
- Dashboard is for tracking, wiki is for learning (distinct purposes)
- Light integration respects user intent
- Clear data contracts prevent implementation blockers
- Works for both logged-in and anonymous users

**Alternative Considered**: Deep integration (wiki snippets in dashboard, required reading)
- Rejected: Overcomplicates both sections, user may not want education while tracking

**See**: `ARCHITECTURE-FIXES.md` Fix #4 for data contracts

---

### 8. Community Contributions: Phased Approach

**Decision**: Phase 1 (no community), Phase 2 (suggestion queue), Phase 3 (trusted contributors)

**Rationale**:
- Phase 1: Ensures quality foundation before opening to community
- Suggestion queue: Maintains control while allowing input
- Trusted contributors: Scales when community proven trustworthy
- Phased approach reduces risk of low-quality contributions

**Phase 1 (This Plan)**:
- You write all 10-20 articles
- No community contribution system yet
- Focus on quality, structure, credibility

**Phase 2 (Future)**:
- Add `wiki_suggestions` table
- Users can suggest edits
- You review and approve
- Gradually build trust

**Phase 3 (Future)**:
- Vetted users can edit directly
- Shift to oversight role
- Wiki becomes self-sustaining

---

### 9. Initial Article Scope: 10-20 Foundational Articles

**Decision**: Launch with 10-20 high-quality articles covering absolute fundamentals

**Rationale**:
- Achievable in 4-6 weeks
- Covers most common user questions
- Establishes credibility early
- Can expand systematically after launch

**Article Distribution**:
- Nutrition: 5 articles (protein, carbs, fats, calories, meal frequency)
- Exercise Science: 3 articles (hypertrophy, progressive overload, volume)
- Physiology: 3 articles (energy systems, recovery, MPS)
- Training Methods: 2 articles (strength training, HIIT vs LISS)
- Psychology: 2 articles (habits, motivation)
- Injury & Health: 2 articles (prevention, common injuries)

**Alternative Considered**: 50-100 articles for comprehensive coverage
- Rejected: Too time-consuming, better to launch lean and iterate

---

## Key Files & Structure

### Current Files
- `app/wiki/page.tsx` - Wiki homepage (placeholder, needs search + sidebar)
- No article system yet

### New Files to Create

**Content Directory**:
```
content/
  wiki/
    nutrition/
      protein.md
      carbohydrates.md
      fats.md
      calorie-balance.md
      meal-frequency.md
    exercise-science/
      muscle-hypertrophy.md
      progressive-overload.md
      training-volume.md
    physiology/
      energy-systems.md
      recovery-science.md
      muscle-protein-synthesis.md
    training-methods/
      strength-training-basics.md
      hiit-vs-liss.md
    psychology/
      habit-formation.md
      motivation-science.md
    injury-health/
      injury-prevention.md
      common-lifting-injuries.md
    _template.md
    README.md
```

**Database Migrations**:
- `supabase/migrations/YYYYMMDDHHMMSS_create_wiki_articles.sql`
- `supabase/migrations/YYYYMMDDHHMMSS_create_wiki_article_views.sql`
- `supabase/migrations/YYYYMMDDHHMMSS_create_wiki_citations.sql`
- `supabase/migrations/YYYYMMDDHHMMSS_create_wiki_search_function.sql`

**Components**:
- `components/wiki/SearchBar.tsx` - Search input + results dropdown
- `components/wiki/PopularToday.tsx` - "Populair Vandaag" sidebar
- `components/wiki/EvidenceRating.tsx` - Evidence rating badge
- `components/wiki/Citation.tsx` - Inline citation (superscript)
- `components/wiki/SourcesList.tsx` - Formatted sources list
- `components/wiki/ExpertReview.tsx` - Expert review badge
- `components/wiki/RelatedArticles.tsx` - Related articles section
- `components/dashboard/RecommendedArticles.tsx` - Dashboard widget

**Pages**:
- `app/wiki/page.tsx` - Wiki homepage (update with search + sidebar)
- `app/wiki/[category]/page.tsx` - Category listing page
- `app/wiki/[category]/[slug]/page.tsx` - Article detail page
- `app/api/wiki/track-view/route.ts` - View tracking API

**Utilities**:
- `lib/wiki/markdown-parser.ts` - Parse markdown + frontmatter
- `lib/wiki/article-loader.ts` - Load article from file system
- `lib/wiki/search.ts` - Search query functions
- `scripts/sync-wiki-articles.ts` - Sync markdown to database

---

## Dependencies

### Already Installed
- `next`: 16.0.1
- `react`: 19.2.0
- `@supabase/supabase-js`: ^2.80.0
- `@supabase/ssr`: ^0.7.0
- `lucide-react`: ^0.553.0
- `tailwindcss`: ^4
- `typescript`: ^5
- `clsx`: ^2.1.1

### To Install
```bash
pnpm add remark remark-html gray-matter date-fns
```

**Rationale**:
- `remark` + `remark-html`: Markdown parsing and HTML rendering
- `gray-matter`: YAML frontmatter parsing
- `date-fns`: Date formatting for "Last updated" timestamps

---

## Database Schema Summary (UPDATED)

### Tables (3 total)

1. **wiki_articles** - Article metadata AND content (single source of truth)
   - `slug`, `title`, `category`, `tags`, `language`
   - **`content_markdown`** (full markdown - CANONICAL SOURCE)
   - **`content_html`** (pre-rendered HTML cache)
   - **`search_text`** (plain text for indexing)
   - **`search_vector_en`** (English full-text search)
   - **`search_vector_nl`** (Dutch full-text search)
   - `evidence_rating`, `author`, `reviewers`, `summary`
   - `view_count`, `is_published`
   - `created_at`, `updated_at`

2. **wiki_article_views** - Daily view tracking
   - `article_slug`, `view_date`, `view_count`
   - Used for "Populair Vandaag"

3. **wiki_citations** - Article sources
   - `article_slug`, `citation_number`
   - `authors`, `year`, `title`, `publication`, `url`

### Key Indexes
- **GIN index on `search_vector_en`** for English full-text search
- **GIN index on `search_vector_nl`** for Dutch full-text search
- Index on `category` for category page queries
- Index on `view_count DESC` for popular articles
- Unique index on `(article_slug, view_date)` for daily views

### Search Function
```sql
search_wiki_articles(
  query TEXT,
  language TEXT DEFAULT 'auto'  -- 'auto', 'en', or 'nl'
) → Returns ranked bilingual results
```

**See `ARCHITECTURE-FIXES.md` for complete SQL schema with triggers.**

---

## Design Patterns

### Content Rendering Pattern
```tsx
// Server component fetches article metadata from DB
// Then reads markdown file from disk
// Parses markdown to HTML
// Renders with components

// app/wiki/[category]/[slug]/page.tsx
export default async function ArticlePage({ params }) {
  // 1. Fetch metadata from Supabase
  const article = await getArticle(params.slug);

  // 2. Read markdown file
  const markdown = await readArticleFile(params.category, params.slug);

  // 3. Parse markdown
  const { html, toc } = await parseMarkdown(markdown);

  // 4. Track view (async, don't await)
  trackView(params.slug);

  // 5. Render
  return (
    <ArticleLayout article={article} toc={toc}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </ArticleLayout>
  );
}
```

### Search Pattern
```tsx
// Client component for search input
// Server action for search query
// Real-time results dropdown

// components/wiki/SearchBar.tsx
'use client'

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = useDebouncedCallback(async (q) => {
    const data = await searchArticles(q); // Server action
    setResults(data);
  }, 300);

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          handleSearch(e.target.value);
        }}
        placeholder="Zoek artikelen..."
      />
      {results.length > 0 && (
        <SearchResults results={results} />
      )}
    </div>
  );
}
```

### View Tracking Pattern
```tsx
// Fire-and-forget API call on article page load
// Deduplicate by IP/session

// app/wiki/[category]/[slug]/page.tsx
export default async function ArticlePage({ params }) {
  // ... render article

  // Track view (don't await, runs in background)
  fetch('/api/wiki/track-view', {
    method: 'POST',
    body: JSON.stringify({ slug: params.slug })
  }).catch(() => {}); // Ignore errors
}

// app/api/wiki/track-view/route.ts
export async function POST(request) {
  const { slug } = await request.json();
  const ip = request.headers.get('x-forwarded-for');

  // Check if already viewed today (Redis or DB)
  const viewed = await checkViewedToday(slug, ip);
  if (viewed) return NextResponse.json({ ok: true });

  // Increment view count
  await incrementViewCount(slug);
  await recordDailyView(slug);
  await markViewedToday(slug, ip);

  return NextResponse.json({ ok: true });
}
```

---

## Risks & Mitigations (Summary)

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Markdown parsing performance | Medium | Medium | Cache parsed HTML, ISR, lazy load parser |
| Search scalability | Low | Medium | PostgreSQL FTS sufficient, can upgrade later |
| Content sync reliability | Low | High | Run in CI/CD, validate markdown, log errors |
| Citation management complexity | Medium | Low | Start simple, can add manager later |
| Content quality at scale | High | High | Phase 1: you write all, Phase 2: approval queue |
| Outdated information | Medium | High | Show last updated, periodic review, flag system |
| Scope creep | High | Medium | Stick to 10-20 articles, resist feature adds |

---

## Open Questions

1. **Citation Format**: APA, MLA, or custom?
   - **Recommendation**: APA (widely recognized in science)
   - **Decision**: TBD in Phase 3

2. **Images in Articles**: Allow embedded images?
   - **Recommendation**: Yes, but optimize (next/image)
   - **Storage**: Supabase Storage or public/ folder
   - **Decision**: TBD when first article needs image

3. **Article Length Guidelines**: Min/max word count?
   - **Recommendation**: 1500-2500 words (comprehensive but readable)
   - **Decision**: Flexible, depends on topic complexity

4. **Internationalization**: Support Dutch?
   - **Recommendation**: Start English only, add Dutch later
   - **Decision**: English for Phase 1

5. **Comments on Articles**: Allow discussion?
   - **Recommendation**: Not in Phase 1, consider for Phase 2
   - **Rationale**: Adds moderation overhead
   - **Decision**: Defer to future

---

## Success Criteria Checklist

**MVP Launch (Phases 1-6)**:
- [ ] 10-15 foundational articles published
- [ ] Search bar functional, returns relevant results
- [ ] "Populair Vandaag" sidebar shows top 5 articles
- [ ] Evidence ratings display on articles
- [ ] Citations render correctly (inline + sources list)
- [ ] Wiki homepage loads <1s
- [ ] Mobile responsive (works on 375px)
- [ ] Dashboard has 3+ "Learn more" links to wiki

**Full Launch (Phases 7-8)**:
- [ ] 15-20 articles published
- [ ] All articles have 5+ citations
- [ ] Related articles suggestions work
- [ ] SEO optimized (Lighthouse >90)
- [ ] Accessible (no critical a11y issues)
- [ ] Documentation complete (README, style guide)

---

**End of Context Document**
