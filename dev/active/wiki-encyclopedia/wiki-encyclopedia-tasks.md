# Wiki Encyclopedia: Task Checklist

**Last Updated: 2025-01-10**

Track your progress through the implementation phases. Mark tasks complete as you go!

---

## Phase 1: Content System Foundation

### 1.1 Set Up Content Directory Structure ✅
- [x] Create `content/wiki/` directory at project root
- [x] Create 6 category folders:
  - [x] `nutrition/`
  - [x] `exercise-science/`
  - [x] `physiology/`
  - [x] `training-methods/`
  - [x] `psychology/`
  - [x] `injury-health/`
- [x] Add `.gitkeep` files to each folder
- [x] Create `content/wiki/README.md` explaining organization
- [x] Create `content/wiki/_template.md` with full article template
- [x] Test: Directory structure exists, documented

### 1.2 Create Database Schema (UPDATED) ✅
- [x] Create migration: `wiki_articles` table
  - [x] Fields: id, slug, title, category, tags, language
  - [x] **Content fields**: content_markdown (TEXT NOT NULL), content_html (TEXT), search_text (TEXT)
  - [x] **Search vectors**: search_vector_en (TSVECTOR), search_vector_nl (TSVECTOR)
  - [x] Metadata: evidence_rating, author, reviewers, summary
  - [x] Analytics: view_count, is_published, needs_update
  - [x] Timestamps: created_at, updated_at
  - [x] Add unique constraint on `slug`
  - [x] Add check constraint on `evidence_rating`
  - [x] Add indexes: category, is_published, view_count DESC
  - [x] **Add GIN indexes on search_vector_en and search_vector_nl**
- [x] Create migration: `wiki_article_views` table
  - [x] Fields: id, article_slug (FK), view_date, view_count
  - [x] Unique constraint on (article_slug, view_date)
  - [x] Index on view_date DESC
- [x] Create migration: `wiki_citations` table
  - [x] Fields: id, article_slug (FK), citation_number, authors, year, title, publication, url
  - [x] Index on article_slug
- [x] Create trigger function: `wiki_update_search_vectors()`
  - [x] Updates both search_vector_en (English) and search_vector_nl (Dutch)
  - [x] Weighted: title (A), summary (B), tags (C), search_text (D)
- [x] Create trigger on wiki_articles: BEFORE INSERT OR UPDATE
- [x] Create trigger for updated_at timestamp
- [x] Create RLS policies (public read for is_published = true)
- [x] Create helper function: `increment_view_count(article_slug TEXT)`
- [x] Create helper function: `upsert_daily_view(article_slug TEXT)`
- [x] Create search function: `search_wiki_articles(query, language)`
- [x] Create function: `get_popular_today(limit_count)`
- [x] Create function: `get_articles_by_category(category, sort_by, limit)`
- [x] Run migrations via Supabase MCP
- [x] Test: Tables created, functions work, RLS enabled

**See `ARCHITECTURE-FIXES.md` Fix #1 for complete SQL schema**

### 1.3 Build Markdown Parser Utility (UPDATED) ✅
- [x] Install dependencies: `pnpm add remark remark-html gray-matter date-fns`
- [x] Create `lib/wiki/markdown-parser.ts`
- [x] Implement frontmatter parsing (gray-matter)
- [x] Implement markdown to HTML conversion (remark + remark-html)
- [x] **Extract plain text for search indexing** (strip HTML tags)
- [x] Extract headings for table of contents
- [x] Support inline citations (convert ^1 to superscript links)
- [x] Add heading IDs for TOC navigation
- [x] Extract summary (auto or from frontmatter)
- [x] Add type definitions for parsed article (ArticleFrontmatter, ParsedArticle, TocEntry)
- [x] Add helper function: `generateSlug(filename)`
- [x] Test: Ready for testing with actual markdown files

**Returns**: `{ frontmatter, markdown, html, searchText, toc }`

### 1.4 Create Article Sync Script (UPDATED) ✅
- [x] Create `scripts/sync-wiki-articles.ts`
- [x] Scan `content/wiki/` recursively for .md files
- [x] For each file:
  - [x] Read file content
  - [x] Parse frontmatter (gray-matter)
  - [x] **Store full markdown in `content_markdown` field**
  - [x] Render to HTML, store in `content_html` field
  - [x] Extract plain text, store in `search_text` field
  - [x] Extract summary (first paragraph or frontmatter field)
  - [x] Generate slug from filename
  - [x] Upsert to wiki_articles table (slug as key)
  - [x] Parse and insert citations to wiki_citations table
- [x] Log sync results (added, updated, errors)
- [x] Add script to package.json: `"sync-wiki": "tsx scripts/sync-wiki-articles.ts"`
- [x] Make script executable (chmod +x)
- [x] Test: Ready for testing with actual markdown files

**Database becomes single source of truth at runtime**

### 1.5 Build Article Display Page (UPDATED) ✅
- [x] Create `app/wiki/[category]/[slug]/page.tsx`
- [x] **Fetch full article from Supabase by slug** (content_markdown + metadata)
- [x] **Use pre-rendered content_html** (or render markdown on-demand if not cached)
- [x] Fetch citations from wiki_citations table
- [x] Create `components/wiki/ArticleLayout.tsx`:
  - [x] Header with title, evidence rating, author, date
  - [x] Breadcrumbs navigation
  - [x] Article summary section
  - [x] Article content area (dangerouslySetInnerHTML with content_html)
  - [x] Sources section
  - [x] Related articles section
  - [x] Prose styling for markdown content
- [x] Create `components/wiki/ViewTracker.tsx` (client-side, localStorage)
- [x] Create `components/wiki/EvidenceRating.tsx` with tooltips
- [x] Create `components/wiki/TableOfContents.tsx` with active section highlighting
- [x] Create `components/wiki/SourcesList.tsx` for formatted citations
- [x] Create `components/wiki/RelatedArticles.tsx` (3 from same category)
- [x] Create `app/api/wiki/track-view/route.ts` for view tracking
- [x] Handle 404 for missing articles (Next.js notFound)
- [x] Add metadata for SEO (title, description, OG tags)
- [x] Add generateStaticParams for ISR
- [x] Test: Ready for testing with actual articles

**NO file system reads at runtime** - Database is single source

### 1.6 Update Category Pages ✅
- [x] Create `app/wiki/[category]/page.tsx`
- [x] Define valid categories and category info (names, descriptions, icons)
- [x] Fetch articles using `get_articles_by_category` RPC function
- [x] Display article cards:
  - [x] Title
  - [x] Summary (line-clamp-3)
  - [x] Evidence rating badge
  - [x] View count
  - [x] Last updated date
  - [x] Tags (first 3)
- [x] Add sorting options: newest, popular, alphabetical
- [x] Category header with icon and description
- [x] Breadcrumbs navigation
- [x] Responsive grid layout (1/2/3 columns)
- [x] Handle empty state (no articles in category)
- [x] Add generateStaticParams for all categories
- [x] Add metadata for SEO
- [x] Test: Ready for testing with actual articles

### 1.7 Create Seed Articles for Development (NEW)
**Purpose**: Write 5 high-quality articles BEFORE building search/discovery features

- [ ] Write "Protein" article (nutrition, well-established)
  - [ ] ~2000 words with proper structure
  - [ ] 5-8 peer-reviewed citations
  - [ ] Evidence rating: well-established
  - [ ] Add to `content/wiki/nutrition/protein.md`
- [ ] Write "Progressive Overload" article (exercise-science, well-established)
  - [ ] ~1500 words
  - [ ] 5-8 citations
  - [ ] Evidence rating: well-established
- [ ] Write "Energy Systems" article (physiology, well-established)
  - [ ] ~1800 words
  - [ ] 5-8 citations
  - [ ] Evidence rating: well-established
- [ ] Write "Strength Training Basics" (training-methods, expert-consensus)
  - [ ] ~1600 words
  - [ ] 5-8 citations
  - [ ] Evidence rating: expert-consensus
- [ ] Write "Habit Formation" (psychology, emerging-research)
  - [ ] ~1500 words
  - [ ] 5-8 citations
  - [ ] Evidence rating: emerging-research
- [ ] Test different article lengths (1500-2000 words)
- [ ] Test all frontmatter fields (title, category, tags, evidence_rating, author, related)
- [ ] Run sync script: `pnpm sync-wiki`
- [ ] Verify all 5 articles in database with full content
- [ ] Test search: query for keywords from articles (should find them)
- [ ] Test: Articles render correctly on article pages

**Why**: Provides real content for testing search, "Populair Vandaag", related articles, and other discovery features in Phase 2

---

## Phase 2: Search & Discovery

**Dependencies**: Phase 1 complete (especially 1.7 - need real articles to test)

### 2.1 Build Search Infrastructure (UPDATED)
- [ ] Create migration: `search_wiki_articles` function
  - [ ] Accept parameters: query (text), language (text, default 'auto')
  - [ ] **Search both search_vector_en AND search_vector_nl**
  - [ ] Return ranked results with combined_rank (best of EN or NL)
  - [ ] Weighted ranking: Title (A) > Summary (B) > Tags (C) > Content (D)
  - [ ] Filter by is_published = true
  - [ ] Order by combined_rank DESC, view_count DESC
  - [ ] Limit to 50 results (increased for pagination)
- [ ] Test search function with English queries ("protein intake")
- [ ] Test search function with Dutch queries ("eiwit inname")
- [ ] Create `lib/wiki/search.ts` utility:
  - [ ] Language detection (simple: check for Dutch keywords)
  - [ ] Call search_wiki_articles RPC
- [ ] Test: Search returns relevant results for both languages

**See `ARCHITECTURE-FIXES.md` Fix #2 for complete SQL**

### 2.2 Build Search UI Component
- [ ] Create `components/wiki/SearchBar.tsx`
- [ ] Large search input with icon (magnifying glass)
- [ ] Real-time search as user types (debounced 300ms)
- [ ] Search results dropdown:
  - [ ] Article title
  - [ ] Category badge
  - [ ] Snippet with highlighted match
  - [ ] View count
- [ ] Keyboard navigation (arrow keys, enter to select)
- [ ] Click outside to close dropdown
- [ ] Mobile-friendly (full-width on small screens)
- [ ] Test: Search works, results appear, keyboard nav works

### 2.3 Add Search to Wiki Homepage
- [ ] Update `app/wiki/page.tsx`
- [ ] Add SearchBar component above category cards
- [ ] Style as hero element (large, centered, prominent)
- [ ] Placeholder text: "Zoek artikelen over fitness, voeding, training..."
- [ ] Test: Search bar prominent, functional

### 2.4 Build "Populair Vandaag" Sidebar
- [ ] Create `components/wiki/PopularToday.tsx`
- [ ] Create function to query top 5 articles by today's views:
  - [ ] Join wiki_articles + wiki_article_views
  - [ ] Filter by view_date = CURRENT_DATE
  - [ ] Order by view_count DESC
  - [ ] Limit 5
- [ ] Display in sidebar (desktop) or below categories (mobile)
- [ ] Show for each article:
  - [ ] Rank number (1-5)
  - [ ] Article title
  - [ ] Category badge
  - [ ] View count
- [ ] Cache results for 1 hour
- [ ] Handle empty state (no views today → show all-time popular)
- [ ] Test: Sidebar shows top 5, updates correctly

### 2.5 Implement View Tracking (UPDATED - Privacy-First)
- [ ] Create `components/wiki/ViewTracker.tsx` (client component)
  - [ ] Generate/retrieve session ID from localStorage (crypto.randomUUID())
  - [ ] Check if article viewed today: localStorage.getItem('viewed_{slug}')
  - [ ] If not viewed today → POST to /api/wiki/track-view
  - [ ] Mark as viewed: localStorage.setItem('viewed_{slug}', today)
- [ ] Create `app/api/wiki/track-view/route.ts`
  - [ ] Accept POST with article slug
  - [ ] **NO IP storage, NO session validation** (trust client-side dedupe)
  - [ ] Increment wiki_articles.view_count (RPC: increment_view_count)
  - [ ] Upsert wiki_article_views (article_slug, today, +1)
  - [ ] Return success response
- [ ] Add ViewTracker to article page
- [ ] Test: Views tracked, client-side deduplication works
- [ ] Test: Clearing localStorage → can view again (acceptable)
- [ ] Test: Incognito mode → not tracked (acceptable)

**Privacy**: No IP addresses, no server-side sessions, GDPR-compliant

**See `ARCHITECTURE-FIXES.md` Fix #3 for complete implementation**

### 2.6 Add Related Articles Section
- [ ] Update article frontmatter schema to include `related` field (array of slugs)
- [ ] Create `components/wiki/RelatedArticles.tsx`
- [ ] Query database for related articles by slugs
- [ ] Display 3-5 related articles:
  - [ ] Article title
  - [ ] Category badge
  - [ ] Brief description
- [ ] Fallback: if no related specified, suggest 3 from same category (random or popular)
- [ ] Render at bottom of article page
- [ ] Test: Related articles display, fallback works

---

## Phase 3: Evidence & Credibility

### 3.1 Build Citation System
- [ ] Update markdown parser to extract citations from "## Sources" section
- [ ] Parse citation format: "1. Author (Year). Title. Publication."
- [ ] Insert citations to wiki_citations table on sync
- [ ] Create `components/wiki/Citation.tsx` for inline citations
- [ ] Render ^1 as superscript link: <sup><a href="#cite-1">[1]</a></sup>
- [ ] Add hover preview of source (tooltip)
- [ ] Clicking scrolls to full citation in Sources section
- [ ] Test: Citations render, hover preview works, click scrolls

### 3.2 Create Evidence Rating Badge Component
- [ ] Create `components/wiki/EvidenceRating.tsx`
- [ ] Display color-coded badge:
  - [ ] 🟢 Well-Established (green)
  - [ ] 🟡 Emerging Research (yellow)
  - [ ] 🔵 Expert Consensus (blue)
- [ ] Add tooltip explaining rating:
  - [ ] "Strong peer-reviewed consensus"
  - [ ] "Promising research, needs more study"
  - [ ] "Based on practitioner experience"
- [ ] Display prominently at top of article (near title)
- [ ] Test: Badge displays, tooltip works

### 3.3 Build Expert Review Badge
- [ ] Create `components/wiki/ExpertReview.tsx`
- [ ] Check if article has `reviewers` in frontmatter
- [ ] If yes, display badge: "Reviewed by [Name], [Credentials]"
- [ ] Multiple reviewers: list all
- [ ] Optional: link to reviewer profile pages (future)
- [ ] Style: subtle badge, not overwhelming
- [ ] Test: Badge shows for reviewed articles only

### 3.4 Add Fact-Check Alert System
- [ ] Add `needs_update` boolean field to wiki_articles table
- [ ] Create admin function to flag article as needing update
- [ ] Create `components/wiki/UpdateAlert.tsx`
- [ ] If needs_update = true, display alert banner:
  - [ ] "This article is being reviewed for accuracy"
  - [ ] Optional: link to discussion or alternative sources
- [ ] Style: yellow warning banner at top
- [ ] Test: Alert displays when flagged

### 3.5 Create Sources Reference Component
- [ ] Create `components/wiki/SourcesList.tsx`
- [ ] Fetch citations from wiki_citations table
- [ ] Render numbered list:
  - [ ] [1] Author (Year). "Title." Publication.
  - [ ] If URL exists, make title a link
- [ ] Add backlinks to inline citations (where cited in article)
- [ ] Style: clean, academic reference list
- [ ] Test: Sources list renders, links work

---

## Phase 4: Content Creation

### 4.1 Create Article Template
- [ ] Create `content/wiki/_template.md`
- [ ] Include all required frontmatter fields
- [ ] Add example sections (Summary, TOC, Main Content, Sources, Related)
- [ ] Include citation format examples (APA style)
- [ ] Add comments explaining each section
- [ ] Document best practices in `content/wiki/README.md`:
  - [ ] Word count guidelines (1500-2500)
  - [ ] Citation requirements
  - [ ] Evidence rating criteria
  - [ ] Tone and style guide
- [ ] Test: Template exists, documented

### 4.2 Write Nutrition Articles
**Target: 5 articles**

- [ ] Article: Protein
  - [ ] Research and outline
  - [ ] Write 1500-2500 words
  - [ ] Add 5-10 citations
  - [ ] Set evidence rating
  - [ ] Add related articles
- [ ] Article: Carbohydrates
- [ ] Article: Fats
- [ ] Article: Calorie Balance
- [ ] Article: Meal Frequency
- [ ] Run sync script to add to database
- [ ] Review all articles, edit for clarity
- [ ] Test: All 5 articles published, well-cited

### 4.3 Write Exercise Science Articles
**Target: 3 articles**

- [ ] Article: Muscle Hypertrophy
- [ ] Article: Progressive Overload
- [ ] Article: Training Volume & Frequency
- [ ] Run sync script
- [ ] Test: All 3 articles published

### 4.4 Write Physiology Articles
**Target: 3 articles**

- [ ] Article: Energy Systems
- [ ] Article: Recovery Science
- [ ] Article: Muscle Protein Synthesis
- [ ] Run sync script
- [ ] Test: All 3 articles published

### 4.5 Write Training Methods Articles
**Target: 2 articles**

- [ ] Article: Strength Training Basics
- [ ] Article: HIIT vs LISS
- [ ] Run sync script
- [ ] Test: All 2 articles published

### 4.6 Write Psychology & Injury Articles
**Target: 2-3 articles**

- [ ] Article: Habit Formation
- [ ] Article: Injury Prevention
- [ ] Article (Optional): Goal Setting
- [ ] Run sync script
- [ ] Test: All articles published

**Total Articles: 15-16**

---

## Phase 5: Dashboard Integration

### 5.1 Add "Learn More" Links in Dashboard
- [ ] Identify stat cards in dashboard
- [ ] Add "Learn more" links:
  - [ ] Workout count → Training Volume article
  - [ ] Nutrition score → Meal Planning article (future)
  - [ ] Streak → Habit Formation article
  - [ ] PR → Progressive Overload article
- [ ] Style: subtle link, not overwhelming
- [ ] Test: Links present, navigate correctly

### 5.2 Suggest Articles on Achievements
- [ ] Create mapping: achievement code → article slug
- [ ] Store in `lib/wiki/achievement-article-map.ts`
- [ ] Update achievement unlock notification to show suggested article
- [ ] Examples:
  - [ ] first_workout → Strength Training Basics
  - [ ] first_pr → Progressive Overload
  - [ ] streak_7 → Habit Formation
- [ ] Test: Article suggestions appear on unlock

### 5.3 Build "Recommended Reading" Widget
- [ ] Create `components/dashboard/RecommendedArticles.tsx`
- [ ] Simple algorithm for recommendations:
  - [ ] If user has workouts → exercise articles
  - [ ] If user has meals → nutrition articles
  - [ ] If new user → "Getting Started" articles
- [ ] Show 3 article suggestions
- [ ] Display: title, category, brief description
- [ ] Optional: add to dashboard (sidebar or bottom)
- [ ] Test: Widget shows relevant articles

### 5.4 Add Wiki Navigation from Dashboard
- [ ] Ensure sidebar has "Wiki" link (check app-sidebar.tsx)
- [ ] Highlight "Wiki" when on wiki pages
- [ ] Add breadcrumbs: Dashboard > Wiki > Category > Article
- [ ] Test: Navigation clear, breadcrumbs work

---

## Phase 6: Polish & Testing

### 6.1 Mobile Optimization
- [ ] Test wiki homepage on mobile (375px, 768px)
  - [ ] Search bar full-width
  - [ ] Category grid: 1 column on mobile
  - [ ] "Populair Vandaag" below categories (not sidebar)
- [ ] Test category page on mobile
  - [ ] Article cards stack vertically
  - [ ] Sorting dropdown works
- [ ] Test article page on mobile
  - [ ] TOC becomes collapsible dropdown (not sidebar)
  - [ ] Article content readable
  - [ ] Citations work
  - [ ] Related articles stack
- [ ] Test search on mobile
  - [ ] Results dropdown works
  - [ ] Touch-friendly
- [ ] Test: All pages work well on mobile

### 6.2 SEO Optimization
- [ ] Add metadata to wiki homepage
  - [ ] Title, description, OG tags
- [ ] Add metadata to category pages
  - [ ] Dynamic title, description based on category
- [ ] Add metadata to article pages
  - [ ] Article title, summary as description
  - [ ] OG image (optional: generate from article)
- [ ] Generate sitemap for wiki articles
  - [ ] Create `app/wiki/sitemap.xml/route.ts`
  - [ ] List all published articles
- [ ] Add canonical URLs to prevent duplicates
- [ ] Add structured data (schema.org Article)
  - [ ] headline, author, datePublished, dateModified
- [ ] Run Lighthouse SEO audit
- [ ] Test: Lighthouse SEO score >90

### 6.3 Performance Optimization
- [ ] Code split wiki pages (already done by Next.js)
- [ ] Lazy load markdown parser (dynamic import)
- [ ] Cache parsed articles:
  - [ ] Option A: Redis cache (HTML + metadata)
  - [ ] Option B: In-memory cache (simple Map)
  - [ ] Choose based on infrastructure
- [ ] Optimize images in articles (use next/image)
- [ ] Prefetch related articles (next/link with prefetch)
- [ ] Run Lighthouse performance audit
- [ ] Test: Lighthouse performance >90, fast load times

### 6.4 Accessibility Audit
- [ ] Keyboard navigation
  - [ ] Tab order logical (search → categories → articles)
  - [ ] Search results navigable with arrow keys
  - [ ] Enter to select
- [ ] Screen reader test (VoiceOver or NVDA)
  - [ ] Article headings announced correctly
  - [ ] Citations read as "Citation 1" with link
  - [ ] TOC navigable
- [ ] ARIA labels for interactive elements
  - [ ] Search input: aria-label="Search articles"
  - [ ] Evidence badge: aria-label="Evidence rating: Well-Established"
- [ ] Color contrast check
  - [ ] Evidence badges meet WCAG AA
  - [ ] All text readable
- [ ] Test: No critical a11y issues

### 6.5 Empty State Handling
- [ ] No articles in category
  - [ ] Display friendly message: "No articles in this category yet. Check back soon!"
  - [ ] Suggest browsing other categories
- [ ] No search results
  - [ ] "No results for '[query]'. Try different keywords."
  - [ ] Show popular articles as suggestions
- [ ] No related articles
  - [ ] Fallback to same-category suggestions
- [ ] No views today (Populair Vandaag)
  - [ ] Fall back to all-time popular articles
- [ ] Test: All empty states have helpful messaging

### 6.6 Error Handling
- [ ] Article not found
  - [ ] Custom 404 page with suggestions
  - [ ] Link back to wiki homepage
  - [ ] Show popular articles
- [ ] Markdown parse error
  - [ ] Catch error, display fallback UI
  - [ ] Log error for debugging
  - [ ] Don't crash entire page
- [ ] Search error
  - [ ] Graceful degradation (hide results, show error)
  - [ ] Don't break search input
- [ ] Network failures (view tracking)
  - [ ] Catch fetch errors, ignore silently
  - [ ] Don't block article rendering
- [ ] Test: App handles errors gracefully

### 6.7 Documentation
- [ ] Update project README.md
  - [ ] Add "Wiki" section
  - [ ] Explain content structure
  - [ ] How to add articles
- [ ] Document markdown article format
  - [ ] Frontmatter fields
  - [ ] Citation format
  - [ ] Evidence ratings
- [ ] Create contribution guide
  - [ ] How to suggest articles (future)
  - [ ] Style guidelines
  - [ ] Review process
- [ ] Document content sync process
  - [ ] When to run sync script
  - [ ] How to deploy new articles
- [ ] Create style guide for article writing
  - [ ] Tone (evidence-based, accessible)
  - [ ] Word count (1500-2500)
  - [ ] Citation requirements (5-10 per article)
  - [ ] Examples of good articles
- [ ] Test: Docs complete, clear for contributors

---

## Quick Reference: Task Counts (UPDATED)

- **Phase 1**: 26 tasks (Content System Foundation + 5 Seed Articles) ⬆️ +7
- **Phase 2**: 17 tasks (Search & Discovery - now with real content)
- **Phase 3**: 12 tasks (Evidence & Credibility)
- **Phase 4**: 19 tasks (Content Creation - remaining 10-15 articles)
- **Phase 5**: 11 tasks (Dashboard Integration)
- **Phase 6**: 24 tasks (Polish & Testing)

**Total**: 109 tasks ⬆️ +7 from original

**Key Changes**:
- ✅ Database schema updated (content_markdown, dual search vectors)
- ✅ Phase 1.7 added (write 5 seed articles before Phase 2)
- ✅ Search updated (bilingual, full-body)
- ✅ View tracking updated (privacy-first, client-side)

---

## Progress Tracking

**Phase 1**: ☐ 0/26 tasks complete
**Phase 2**: ☐ 0/17 tasks complete
**Phase 3**: ☐ 0/12 tasks complete
**Phase 4**: ☐ 0/19 tasks complete
**Phase 5**: ☐ 0/11 tasks complete
**Phase 6**: ☐ 0/24 tasks complete

**Overall**: ☐ 0/109 tasks complete (0%)

**Note**: All architecture fixes from `ARCHITECTURE-FIXES.md` have been integrated into these tasks.

---

**End of Task Checklist**
