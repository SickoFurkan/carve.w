# Carve Wiki Encyclopedia: Comprehensive Implementation Plan

**Last Updated: 2025-01-10**

---

## Executive Summary

Transform the Carve Wiki from a placeholder homepage into a comprehensive, evidence-based fitness encyclopedia. The wiki will serve as the educational backbone of the Carve ecosystem, evolving from expert-written foundations into a community-maintained knowledge base.

**Core Vision**: A Wikipedia-style fitness encyclopedia with search-first UX, evidence-based credibility, and seamless integration with the Carve dashboard.

**Key Features**:
- Markdown-based content with Git version control
- Search-first discovery with prominent search bar
- Knowledge domain structure (6 main categories)
- Community contribution system with suggestion queue
- Evidence rating and citation system
- Popular articles sidebar ("Populair Vandaag")
- Light integration with dashboard features

**Timeline**: 6-8 weeks for MVP (10-20 foundational articles)

---

## Current State Analysis

### Existing Infrastructure
- **Framework**: Next.js 16 with React 19, TypeScript ✅
- **Database**: Supabase PostgreSQL ✅
- **Styling**: Tailwind CSS 4 ✅
- **Icons**: Lucide React ✅
- **Auth**: Supabase Auth (Google & Apple) ✅

### Current Wiki Implementation
- **Location**: `app/wiki/page.tsx`
- **Status**: Placeholder homepage with 4 category cards
- **Features**: Basic category grid, no actual articles
- **Categories**: Nutrition, Fitness, Health, Science (hardcoded counts)

### Gaps to Address
1. ❌ No article storage or rendering system
2. ❌ No search functionality
3. ❌ No content management for articles
4. ❌ No community contribution system
5. ❌ No evidence/citation system
6. ❌ No popular articles tracking
7. ❌ No version history or edit tracking
8. ❌ No integration with dashboard

---

## Proposed Future State

### Three-Phase Evolution

**Phase 1: Foundation (Months 1-3) - THIS PLAN**
- 10-20 expert-written foundational articles
- Clean, searchable interface
- Markdown-based content system
- No community contributions yet
- Focus: Quality over quantity

**Phase 2: Controlled Growth (Months 4-12) - FUTURE**
- Expand to 50-100 articles
- Open suggestion queue for community edits
- Review and approval workflow
- Build trust with early contributors

**Phase 3: Community Scale (Year 2+) - FUTURE**
- 200+ articles with comprehensive coverage
- Trusted contributor system
- Shift to oversight role
- Self-sustaining resource

**This plan covers Phase 1 only.**

---

## Architecture Overview

### Content Management Architecture (Hybrid Approach)

**Expert Content (Your Articles)**: Markdown files in Git
```
content/
  wiki/
    nutrition/
      protein.md
      carbohydrates.md
      fats.md
    exercise-science/
      muscle-hypertrophy.md
      progressive-overload.md
    physiology/
      energy-systems.md
      recovery.md
    training-methods/
      strength-training.md
      cardio.md
    psychology/
      motivation.md
      habit-formation.md
    injury-health/
      injury-prevention.md
```

**Metadata & Analytics**: Supabase database
```sql
Tables:
- wiki_articles (slug, title, category, tags, view_count, created_at, updated_at)
- wiki_article_views (tracks daily views for "Populair Vandaag")
- wiki_suggestions (future: community edit suggestions)
- wiki_citations (links articles to sources)
```

**Why Hybrid?**
- ✅ Git version control for your content
- ✅ Easy to write in markdown editors
- ✅ Deploy with code (simple)
- ✅ Database for dynamic features (views, search, tags)
- ✅ Can add community features later

### Knowledge Domain Structure

**6 Main Categories** (replacing current 4):

1. **Nutrition** 🍎
   - Subcategories: Macronutrients, Micronutrients, Meal Timing, Supplements, Diets
   - Initial articles: Protein, Carbohydrates, Fats, Calorie Balance, Meal Frequency

2. **Exercise Science** 💪
   - Subcategories: Biomechanics, Exercise Types, Programming, Periodization
   - Initial articles: Muscle Hypertrophy, Progressive Overload, Volume & Frequency

3. **Physiology** 🧬
   - Subcategories: Muscle Growth, Fat Loss, Energy Systems, Recovery, Adaptation
   - Initial articles: Energy Systems, Recovery Science, Muscle Protein Synthesis

4. **Training Methods** 🏋️
   - Subcategories: Strength Training, Cardio, Mobility, Sport-Specific
   - Initial articles: Strength Training Basics, HIIT vs LISS, Mobility Work

5. **Psychology** 🧠
   - Subcategories: Motivation, Habits, Goal Setting, Mindset
   - Initial articles: Habit Formation, Motivation Science, Goal Setting

6. **Injury & Health** ❤️
   - Subcategories: Prevention, Rehab, Common Issues, Medical
   - Initial articles: Injury Prevention, Common Lifting Injuries, Rest vs Active Recovery

### Consistent Article Format

Every article follows this structure:

```markdown
---
title: "Article Title"
category: "nutrition" | "exercise-science" | "physiology" | "training-methods" | "psychology" | "injury-health"
tags: ["tag1", "tag2", "tag3"]
evidence_rating: "well-established" | "emerging-research" | "expert-consensus"
author: "Your Name"
reviewers: ["Expert 1", "Expert 2"] (optional)
created_at: "YYYY-MM-DD"
updated_at: "YYYY-MM-DD"
---

# Article Title

## Summary
[2-3 sentence overview of the article]

## Table of Contents
- [Section 1](#section-1)
- [Section 2](#section-2)
- [Sources](#sources)
- [Related Articles](#related-articles)

## Main Content

### Section 1
[Content with inline citations^1]

### Section 2
[More content^2]

## Sources
1. Author et al. (Year). "Title." Journal Name.
2. Another Author (Year). "Title." Publication.

## Related Articles
- [Related Article 1](/wiki/category/article-slug)
- [Related Article 2](/wiki/category/article-slug)
```

### Evidence & Credibility System

**Evidence Rating Badge** (displayed prominently):
- 🟢 **Well-Established**: Strong peer-reviewed consensus
- 🟡 **Emerging Research**: Promising but needs more study
- 🔵 **Expert Consensus**: Based on practitioner experience

**Citation Requirements**:
- Every factual claim has inline citation
- Sources section with full references
- Prefer peer-reviewed journals
- Include meta-analyses when available

**Expert Review Badge** (optional):
- Articles reviewed by credentialed experts
- Shows reviewer credentials
- Adds trust signal

---

## Implementation Phases

### Phase 1: Content System Foundation (Week 1-2)

**Goal**: Set up markdown-based content system, article rendering, and basic navigation.

#### 1.1 Set Up Content Directory Structure [Effort: S]
- Create `content/wiki/` directory structure
- Add 6 category folders
- Create `.gitkeep` files to preserve structure
- Add `README.md` explaining content organization
- **Acceptance**: Directory structure exists, documented

#### 1.2 Create Database Schema [Effort: M]
- Migration: `wiki_articles` table
  - `id` (uuid)
  - `slug` (text, unique)
  - `title` (text)
  - `category` (text)
  - `tags` (text[])
  - `evidence_rating` (text)
  - `view_count` (integer)
  - `created_at`, `updated_at` (timestamptz)
  - `is_published` (boolean)
- Migration: `wiki_article_views` table (for tracking daily views)
  - `id` (uuid)
  - `article_slug` (text, FK to wiki_articles)
  - `view_date` (date)
  - `view_count` (integer)
  - Unique index on (article_slug, view_date)
- Migration: `wiki_citations` table
  - `id` (uuid)
  - `article_slug` (text, FK)
  - `citation_number` (integer)
  - `authors` (text)
  - `year` (integer)
  - `title` (text)
  - `publication` (text)
  - `url` (text, nullable)
- RLS policies (public read access for published articles)
- **Acceptance**: Migrations run, tables created, can insert/query

#### 1.3 Build Markdown Parser Utility [Effort: M]
- Install dependencies: `remark`, `remark-html`, `gray-matter`
- Create `lib/wiki/markdown-parser.ts`
- Parse frontmatter (title, category, tags, etc.)
- Convert markdown to HTML
- Extract headings for table of contents
- Support inline citations (superscript numbers)
- **Acceptance**: Can parse markdown file, return HTML + metadata

#### 1.4 Create Article Sync Script [Effort: M]
- Create `scripts/sync-wiki-articles.ts`
- Scan `content/wiki/` for .md files
- Parse each file
- Upsert to `wiki_articles` table (slug as key)
- Run on build or manually
- **Acceptance**: Script syncs all markdown files to database

#### 1.5 Build Article Display Page [Effort: L]
- Create `app/wiki/[category]/[slug]/page.tsx`
- Fetch article from database by slug
- Read markdown file from `content/wiki/`
- Render parsed HTML
- Display metadata (evidence rating, author, date)
- Show table of contents (sticky sidebar on desktop)
- Handle 404 for missing articles
- **Acceptance**: Article displays correctly, TOC works, 404 handled

#### 1.6 Update Category Pages [Effort: M]
- Create `app/wiki/[category]/page.tsx`
- List all articles in category
- Show article title, summary, evidence rating
- Sort by: newest, most viewed, alphabetical
- Grid or list layout
- **Acceptance**: Category page lists articles, sorting works

**Dependencies**: None (can start immediately)

---

### Phase 2: Search & Discovery (Week 2-3)

**Goal**: Implement search-first UX with prominent search bar and discovery features.

#### 2.1 Build Search Infrastructure [Effort: L]
- Add `tsvector` column to `wiki_articles` for full-text search
- Create GIN index on `tsvector`
- Trigger to update `tsvector` on article insert/update
- Create search function: `search_wiki_articles(query text)`
- Returns articles ranked by relevance
- **Acceptance**: Search function returns relevant results

#### 2.2 Build Search UI Component [Effort: M]
- Create `components/wiki/SearchBar.tsx`
- Prominent search input with icon
- Real-time search as user types (debounced)
- Show search results dropdown
- Highlight matching text
- Keyboard navigation (arrow keys, enter)
- Mobile-friendly
- **Acceptance**: Search works, results appear, keyboard nav works

#### 2.3 Add Search to Wiki Homepage [Effort: S]
- Add SearchBar above category cards
- Make it hero element (large, centered)
- Placeholder: "Zoek artikelen over fitness, voeding, training..."
- **Acceptance**: Search bar prominent on homepage

#### 2.4 Build "Populair Vandaag" Sidebar [Effort: M]
- Create `components/wiki/PopularToday.tsx`
- Query top 5 articles by view_count from today
- Display in sidebar (desktop) or below categories (mobile)
- Show article title, category, view count
- Link to article
- Update daily (cache for 1 hour)
- **Acceptance**: Sidebar shows top 5 articles, updates correctly

#### 2.5 Implement View Tracking [Effort: M]
- Add API route: `app/api/wiki/track-view/route.ts`
- On article page load, POST to track view
- Increment `wiki_articles.view_count`
- Insert/update `wiki_article_views` for daily tracking
- Deduplicate views (same IP/session within 1 hour)
- **Acceptance**: Views tracked, deduplication works

#### 2.6 Add Related Articles Section [Effort: M]
- Extract related article slugs from article frontmatter
- Query database for related articles
- Display at bottom of article page
- Show title, category, brief description
- Fallback: suggest articles from same category if no related specified
- **Acceptance**: Related articles display, fallback works

**Dependencies**: Phase 1 complete (need article system)

---

### Phase 3: Evidence & Credibility (Week 3-4)

**Goal**: Implement citation system and evidence ratings for credibility.

#### 3.1 Build Citation System [Effort: M]
- Parse citations from markdown (Sources section)
- Insert to `wiki_citations` table on article sync
- Create `components/wiki/Citation.tsx` for inline citations
- Superscript number links to source
- Hover shows preview of source
- Click scrolls to full citation
- **Acceptance**: Citations render, hover preview works

#### 3.2 Create Evidence Rating Badge Component [Effort: S]
- `components/wiki/EvidenceRating.tsx`
- Show color-coded badge: Well-Established (green), Emerging (yellow), Expert Consensus (blue)
- Tooltip explains rating
- Display prominently at top of article
- **Acceptance**: Badge displays correctly with tooltip

#### 3.3 Build Expert Review Badge [Effort: S]
- `components/wiki/ExpertReview.tsx`
- If article has `reviewers` in frontmatter, show badge
- Display reviewer names, credentials
- Optional: link to reviewer profiles
- **Acceptance**: Badge shows for reviewed articles

#### 3.4 Add Fact-Check Alert System [Effort: M]
- Allow marking articles as "needs update" via admin flag
- Display alert banner on article page
- "This article is being reviewed for accuracy"
- Link to discussion or alternative sources
- **Acceptance**: Alert displays when flagged

#### 3.5 Create Sources Reference Component [Effort: M]
- `components/wiki/SourcesList.tsx`
- Render numbered list of sources from `wiki_citations`
- Format: Author (Year). "Title." Publication.
- Links to source URLs if available
- Backlinks to inline citations
- **Acceptance**: Sources list renders correctly

**Dependencies**: Phase 1 complete

---

### Phase 4: Content Creation (Week 4-6)

**Goal**: Write 10-20 foundational articles covering core topics.

#### 4.1 Create Article Template [Effort: S]
- Create `content/wiki/_template.md`
- Include all frontmatter fields
- Add example sections
- Include citation format examples
- Document best practices
- **Acceptance**: Template exists, well-documented

#### 4.2 Write Nutrition Articles [Effort: XL]
**Articles** (5 total):
1. Protein: Function, requirements, sources
2. Carbohydrates: Types, timing, needs
3. Fats: Essential fats, omega-3/6, intake
4. Calorie Balance: TDEE, deficits, surpluses
5. Meal Frequency: Timing, fasting, meal splits

**Process per article**:
- Research and outline
- Write 1500-2500 words
- Add 5-10 citations
- Set evidence rating
- Add to `content/wiki/nutrition/`
- Run sync script

**Acceptance**: 5 nutrition articles published, well-cited

#### 4.3 Write Exercise Science Articles [Effort: L]
**Articles** (3 total):
1. Muscle Hypertrophy: Mechanisms, training for growth
2. Progressive Overload: Principles, progression methods
3. Training Volume & Frequency: Optimal ranges, periodization

**Acceptance**: 3 exercise science articles published

#### 4.4 Write Physiology Articles [Effort: L]
**Articles** (3 total):
1. Energy Systems: ATP-PC, glycolytic, oxidative
2. Recovery Science: Sleep, nutrition, active recovery
3. Muscle Protein Synthesis: MPS, training effect, nutrition

**Acceptance**: 3 physiology articles published

#### 4.5 Write Training Methods Articles [Effort: M]
**Articles** (2 total):
1. Strength Training Basics: Compound lifts, form cues
2. HIIT vs LISS: Benefits, applications, programming

**Acceptance**: 2 training articles published

#### 4.6 Write Psychology & Injury Articles [Effort: M]
**Articles** (2-3 total):
1. Habit Formation: Science of habits, fitness applications
2. Injury Prevention: Warm-up, form, recovery
3. (Optional) Goal Setting: SMART goals, tracking progress

**Acceptance**: 2-3 psychology/injury articles published

**Dependencies**: Phases 1-3 complete (need content system)

---

### Phase 5: Dashboard Integration (Week 6-7)

**Goal**: Light integration between wiki and dashboard features.

#### 5.1 Add "Learn More" Links in Dashboard [Effort: S]
- Identify stat cards that relate to wiki articles
- Add subtle "Learn more" links
- Examples:
  - Workout count → "Training Frequency" article
  - Nutrition score → "Meal Planning" article
  - Streak → "Habit Formation" article
- **Acceptance**: Links present, navigate correctly

#### 5.2 Suggest Articles on Achievements [Effort: M]
- When user unlocks achievement, suggest related article
- Store mapping: achievement code → article slug
- Display in achievement unlock notification
- Example: First PR → "Progressive Overload" article
- **Acceptance**: Article suggestions appear on unlock

#### 5.3 Build "Recommended Reading" Widget [Effort: M]
- Create `components/dashboard/RecommendedArticles.tsx`
- Show 3 personalized article suggestions
- Based on user's goals, recent activity
- Simple algorithm: if tracking nutrition → nutrition articles
- Display in dashboard (optional sidebar or bottom)
- **Acceptance**: Widget shows relevant articles

#### 5.4 Add Wiki Navigation from Dashboard [Effort: S]
- Ensure sidebar includes "Wiki" link
- Highlight when on wiki pages
- Breadcrumbs: Dashboard > Wiki > Category > Article
- **Acceptance**: Navigation clear, breadcrumbs work

**Dependencies**: Phase 2 complete (need article pages)

---

### Phase 6: Polish & Testing (Week 7-8)

**Goal**: UI/UX polish, mobile optimization, edge case handling.

#### 6.1 Mobile Optimization [Effort: M]
- Test all wiki pages on mobile (375px, 768px)
- Responsive category grid (1 col on mobile)
- Sticky TOC becomes dropdown on mobile
- Search bar full-width on mobile
- "Populair Vandaag" below categories on mobile
- **Acceptance**: All pages work well on mobile

#### 6.2 SEO Optimization [Effort: M]
- Add metadata to all wiki pages (title, description, OG tags)
- Generate sitemap for wiki articles
- Add canonical URLs
- Structured data for articles (schema.org)
- **Acceptance**: Lighthouse SEO score >90

#### 6.3 Performance Optimization [Effort: M]
- Code split wiki pages
- Lazy load markdown parser
- Cache parsed articles (Redis or in-memory)
- Optimize images in articles (if any)
- Prefetch related articles
- **Acceptance**: Lighthouse performance >90, fast load times

#### 6.4 Accessibility Audit [Effort: S]
- Keyboard navigation (tab order)
- Screen reader test (article structure, citations)
- ARIA labels for interactive elements
- Color contrast check (evidence badges)
- **Acceptance**: No critical a11y issues

#### 6.5 Empty State Handling [Effort: S]
- No articles in category → friendly message
- No search results → suggest popular articles
- No related articles → show category suggestions
- **Acceptance**: All empty states have helpful messaging

#### 6.6 Error Handling [Effort: S]
- Article not found → custom 404 with suggestions
- Markdown parse error → fallback UI
- Search error → graceful degradation
- Network failures → retry logic
- **Acceptance**: App handles errors gracefully

#### 6.7 Documentation [Effort: S]
- Document markdown article format in README
- Add contribution guide (how to suggest articles)
- Document content sync process
- Create style guide for article writing
- **Acceptance**: Docs complete, clear for contributors

**Dependencies**: Phases 1-5 complete

---

## Database Schema Details

### wiki_articles Table
```sql
CREATE TABLE wiki_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  evidence_rating TEXT CHECK (evidence_rating IN ('well-established', 'emerging-research', 'expert-consensus')),
  author TEXT,
  reviewers TEXT[] DEFAULT '{}',
  summary TEXT, -- extracted from article
  view_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wiki_articles_category ON wiki_articles(category);
CREATE INDEX idx_wiki_articles_published ON wiki_articles(is_published);
CREATE INDEX idx_wiki_articles_view_count ON wiki_articles(view_count DESC);

-- Full-text search
ALTER TABLE wiki_articles ADD COLUMN search_vector TSVECTOR;
CREATE INDEX idx_wiki_articles_search ON wiki_articles USING GIN(search_vector);

CREATE TRIGGER wiki_articles_search_update
BEFORE INSERT OR UPDATE ON wiki_articles
FOR EACH ROW EXECUTE FUNCTION
  tsvector_update_trigger(search_vector, 'pg_catalog.english', title, summary, tags);
```

### wiki_article_views Table
```sql
CREATE TABLE wiki_article_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_slug TEXT NOT NULL REFERENCES wiki_articles(slug) ON DELETE CASCADE,
  view_date DATE NOT NULL DEFAULT CURRENT_DATE,
  view_count INTEGER DEFAULT 1,
  UNIQUE(article_slug, view_date)
);

CREATE INDEX idx_wiki_views_date ON wiki_article_views(view_date DESC);
```

### wiki_citations Table
```sql
CREATE TABLE wiki_citations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_slug TEXT NOT NULL REFERENCES wiki_articles(slug) ON DELETE CASCADE,
  citation_number INTEGER NOT NULL,
  authors TEXT NOT NULL,
  year INTEGER,
  title TEXT NOT NULL,
  publication TEXT NOT NULL,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wiki_citations_article ON wiki_citations(article_slug);
```

### Search Function
```sql
CREATE OR REPLACE FUNCTION search_wiki_articles(search_query TEXT)
RETURNS TABLE (
  slug TEXT,
  title TEXT,
  category TEXT,
  summary TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.slug,
    a.title,
    a.category,
    a.summary,
    ts_rank(a.search_vector, plainto_tsquery('english', search_query)) AS rank
  FROM wiki_articles a
  WHERE a.is_published = TRUE
    AND a.search_vector @@ plainto_tsquery('english', search_query)
  ORDER BY rank DESC, a.view_count DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;
```

---

## Technology Stack

### Core Dependencies (Already Installed)
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase client

### New Dependencies to Install
```bash
pnpm add remark remark-html gray-matter
pnpm add date-fns  # for date formatting
pnpm add clsx  # already installed
```

**Rationale**:
- `remark` + `remark-html`: Markdown parsing and HTML conversion
- `gray-matter`: Parse YAML frontmatter from markdown
- `date-fns`: Format dates for "Last updated" timestamps

---

## Risk Assessment & Mitigation

### Technical Risks

**Risk 1: Markdown Parsing Performance**
- **Likelihood**: Medium
- **Impact**: Medium
- **Mitigation**:
  - Cache parsed HTML in database or Redis
  - Parse at build time for static articles
  - Use incremental static regeneration (ISR)
  - Lazy load markdown parser

**Risk 2: Search Scalability**
- **Likelihood**: Low (with 20 articles)
- **Impact**: Medium (if grows to 200+)
- **Mitigation**:
  - PostgreSQL full-text search sufficient for hundreds of articles
  - Can upgrade to Algolia/Meilisearch later if needed
  - Implement pagination (20 results max)
  - Cache search results

**Risk 3: Content Sync Reliability**
- **Likelihood**: Low
- **Impact**: High
- **Mitigation**:
  - Run sync script in CI/CD pipeline
  - Validate markdown before syncing (check required fields)
  - Log sync errors
  - Fallback: manual sync via admin UI

**Risk 4: Citation Management**
- **Likelihood**: Medium
- **Impact**: Low
- **Mitigation**:
  - Start simple (manual citations in markdown)
  - Can add citation manager later (Zotero export?)
  - Use consistent format (APA or similar)

### Content Risks

**Risk 5: Content Quality at Scale**
- **Likelihood**: High (in Phase 2+)
- **Impact**: High
- **Mitigation**:
  - Phase 1: You write all content (full control)
  - Phase 2: Suggestion queue before opening edits
  - Require citations for all claims
  - Evidence rating system signals confidence

**Risk 6: Outdated Information**
- **Likelihood**: Medium
- **Impact**: High
- **Mitigation**:
  - Show "Last updated" date prominently
  - Periodic review schedule (quarterly)
  - Flag articles for update when new research emerges
  - Community can suggest updates

**Risk 7: Scope Creep**
- **Likelihood**: High
- **Impact**: Medium
- **Mitigation**:
  - Stick to 10-20 articles for Phase 1
  - Resist adding features (comments, likes, etc.)
  - Ship MVP, gather feedback
  - Prioritize search and content over fancy features

---

## Success Metrics

### Launch Metrics (First 30 Days)

**Engagement**:
- 30%+ of dashboard users visit wiki at least once
- Average 2+ articles viewed per wiki visitor
- Search used by 50%+ of wiki visitors

**Content Performance**:
- Top 5 articles account for <50% of views (diverse interest)
- Average time on article >2 minutes
- <5% bounce rate from search results (relevance)

**Technical**:
- Wiki page load time <1s (p95)
- Search results return <200ms
- Zero markdown parsing errors
- 99.5% uptime

### Long-term Metrics (3+ Months)

**Growth**:
- 50+ articles published (including community)
- 10%+ of users have suggested an edit
- 20+ citations per article on average

**Engagement**:
- 50%+ of dashboard users visit wiki monthly
- Average 5+ articles viewed per monthly user
- Wiki-to-dashboard conversion: 10%+ (wiki visitor signs up)

**Quality**:
- 80%+ articles have "Well-Established" evidence rating
- <5% articles flagged for outdated info
- Community contribution acceptance rate >50%

---

## Timeline Estimates

### Aggressive Timeline (6 weeks, full-time)
- **Week 1**: Phase 1 (Content System Foundation)
- **Week 2**: Phase 2 (Search & Discovery)
- **Week 3**: Phase 3 (Evidence & Credibility)
- **Week 4-5**: Phase 4 (Content Creation - 15 articles)
- **Week 6**: Phases 5-6 (Integration + Polish)

### Moderate Timeline (8 weeks, part-time ~20hr/week)
- **Week 1-2**: Phase 1
- **Week 3**: Phase 2
- **Week 4**: Phase 3
- **Week 5-6**: Phase 4 (Content Creation)
- **Week 7**: Phase 5 (Integration)
- **Week 8**: Phase 6 (Polish)

### Conservative Timeline (10 weeks, part-time ~10hr/week)
- **Week 1-2**: Phase 1
- **Week 3-4**: Phase 2
- **Week 5**: Phase 3
- **Week 6-8**: Phase 4 (Content Creation, slower pace)
- **Week 9**: Phase 5
- **Week 10**: Phase 6

**Recommendation**: Moderate timeline (8 weeks). Content creation is the bottleneck—quality articles take time.

---

## Required Resources & Dependencies

### Development Resources
- 1 Full-stack developer (can be solo)
- Estimated: 40-60 development hours (excluding content writing)
- Content writing: 30-50 hours for 15 articles (~2-3 hours per article)

### Subject Matter Experts (Optional but Recommended)
- Nutrition expert (review nutrition articles)
- Exercise scientist (review training articles)
- Sports psychologist (review psychology articles)

If no experts available:
- Cite high-quality sources heavily
- Use evidence ratings conservatively
- Community can suggest corrections later

### Tools & Services
- Supabase (already set up) ✅
- Markdown editor (VS Code, Obsidian, Typora, etc.)
- Citation manager (optional: Zotero, Mendeley)
- Grammar check (Grammarly, LanguageTool)

---

## Next Steps

1. **Review & Approve Plan**: Ensure alignment on scope, timeline
2. **Set Up Project Board**: Create tasks from this plan
3. **Start Phase 1**: Begin content system foundation
4. **Weekly Progress Check**: Review completed tasks, adjust
5. **Ship MVP**: Deploy with 10-15 articles, gather feedback
6. **Iterate**: Add more articles, refine based on usage

---

## Appendix: Example Article Outline

### Sample Article: "Protein: The Essential Macronutrient"

```markdown
---
title: "Protein: The Essential Macronutrient"
category: "nutrition"
tags: ["protein", "macronutrients", "muscle-building", "recovery"]
evidence_rating: "well-established"
author: "Furkan Celiker"
created_at: "2025-01-15"
updated_at: "2025-01-15"
---

# Protein: The Essential Macronutrient

## Summary
Protein is a macronutrient essential for muscle repair, growth, and countless bodily functions. This article covers protein's roles, daily requirements, optimal timing, and best food sources based on current scientific evidence.

## Table of Contents
- [What is Protein?](#what-is-protein)
- [Protein Requirements](#protein-requirements)
- [Protein Timing](#protein-timing)
- [Best Protein Sources](#best-protein-sources)
- [Common Myths](#common-myths)
- [Sources](#sources)
- [Related Articles](#related-articles)

## What is Protein?

Protein is one of three macronutrients (along with carbohydrates and fats) and is composed of amino acids, the building blocks of muscle tissue, enzymes, hormones, and more^1.

### Essential vs Non-Essential Amino Acids
The body requires 20 amino acids, 9 of which are "essential" (must come from diet) and 11 "non-essential" (body can produce)^2.

## Protein Requirements

### General Population
The Recommended Dietary Allowance (RDA) for protein is 0.8g per kilogram of bodyweight per day for sedentary adults^3. However, this is the minimum to prevent deficiency, not optimal for fitness.

### Athletes & Active Individuals
Research shows athletes benefit from 1.6-2.2g/kg/day to support training adaptations and muscle growth^4. Higher intakes (up to 3.3g/kg/day) may benefit those in caloric deficits^5.

## Protein Timing

### Post-Workout Window
While the "anabolic window" is less critical than once thought, consuming protein within a few hours post-workout optimizes muscle protein synthesis^6.

### Daily Distribution
Spreading protein across 3-4 meals (20-40g per meal) appears superior to consuming most protein in one sitting^7.

## Best Protein Sources

### Complete Proteins (contain all essential amino acids)
- Meat, poultry, fish
- Eggs
- Dairy (milk, yogurt, cheese)
- Soy products (tofu, tempeh)

### Incomplete Proteins (combine for complete profile)
- Legumes (beans, lentils)
- Grains (rice, quinoa)
- Nuts and seeds

## Common Myths

**Myth**: High protein damages kidneys
**Reality**: No evidence in healthy individuals^8. Those with pre-existing kidney disease should consult doctor.

**Myth**: Plant protein is inferior
**Reality**: Plant proteins can meet needs when varied sources consumed^9.

## Sources
1. Phillips SM, et al. (2016). "Protein requirements and recommendations for athletes." *Br J Sports Med*.
2. Institute of Medicine (2005). "Dietary Reference Intakes for Energy."
3. ... (8 more citations)

## Related Articles
- [Muscle Protein Synthesis: How Muscle Grows](/wiki/physiology/muscle-protein-synthesis)
- [Meal Timing: Does It Matter?](/wiki/nutrition/meal-timing)
- [Plant-Based Nutrition for Athletes](/wiki/nutrition/plant-based)
```

---

**End of Plan**
