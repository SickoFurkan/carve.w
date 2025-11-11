# Carve Wiki Encyclopedia - Implementation Plan

**Last Updated: 2025-01-10**

---

## 📋 Plan Status: REVISED (Architecture Fixed)

This directory contains the complete implementation plan for the Carve Wiki Encyclopedia feature.

### ⚠️ Important: Read ARCHITECTURE-FIXES.md First

The original plan had **critical architectural issues** identified by Codex code review. All issues have been addressed in `ARCHITECTURE-FIXES.md`. **Read that document first** before implementing.

---

## 📁 Documents in This Directory

### 1. **ARCHITECTURE-FIXES.md** ⭐ START HERE
**Status**: ✅ Complete and Reviewed

Addresses all Codex feedback with concrete solutions:
- ✅ Single source of truth (database-first architecture)
- ✅ Full-body bilingual search (English + Dutch)
- ✅ Privacy-compliant view tracking (client-side, no IP storage)
- ✅ Clear dashboard integration contracts
- ✅ Realistic development flow (seed articles first)

**READ THIS FIRST** before implementing anything.

---

### 2. **wiki-encyclopedia-plan.md**
**Status**: ⚠️ Needs Update (uses original architecture)

Comprehensive 6-phase implementation plan (102 tasks).

**Important**: This document uses the **original architecture** which has been superseded by fixes in `ARCHITECTURE-FIXES.md`.

**Key Differences** (Architecture Fixes vs Original Plan):
- Original: Markdown files at runtime → **Fixed**: Database is runtime source
- Original: Search only title/summary → **Fixed**: Full-body search
- Original: English-only → **Fixed**: Bilingual (EN + NL)
- Original: IP-based tracking → **Fixed**: Client-side localStorage
- Original: Build features before content → **Fixed**: Write seed articles first

**When implementing**: Apply architecture from `ARCHITECTURE-FIXES.md`, not this plan's schema.

---

### 3. **wiki-encyclopedia-context.md**
**Status**: ⚠️ Needs Update

Key design decisions and rationale.

**Important**: Decision #1 (Content Management) is **outdated**. Refer to `ARCHITECTURE-FIXES.md` Fix #1 for correct architecture.

---

### 4. **wiki-encyclopedia-tasks.md**
**Status**: ⚠️ Needs Update

Task checklist (102 tasks).

**Important**: Phase 1 tasks need updates for new database schema. Phase ordering is correct (content system → search → content creation).

---

## 🎯 What Changed (Summary)

### Original Architecture (Problematic)
```
Write .md file → Sync metadata to DB → Runtime reads .md files
Problem: Files and DB drift, can't run in serverless, search can't see content
```

### Fixed Architecture (Correct)
```
Write .md file → Sync FULL CONTENT to DB → Runtime reads DB only
Benefit: Single source of truth, serverless-compatible, search works
```

### Key Technical Changes

| Aspect | Original | Fixed |
|--------|----------|-------|
| **Content Storage** | Metadata only in DB | Full markdown in `content_markdown` field |
| **Runtime Source** | Read .md files | Read from database |
| **Search Scope** | Title + summary + tags | Full article content |
| **Language Support** | English only | English + Dutch (dual vectors) |
| **View Tracking** | IP-based, undefined privacy | localStorage, GDPR-compliant |
| **Development Flow** | Build features → write content | Write 5 seed articles → build features |

---

## 🚀 Implementation Checklist

### Before You Start
- [x] Read `ARCHITECTURE-FIXES.md` in full
- [ ] Review fixed database schema (Fix #1)
- [ ] Understand bilingual search approach (Fix #2)
- [ ] Understand client-side view tracking (Fix #3)
- [ ] Review dashboard data contracts (Fix #4)

### Phase 1: Content System Foundation
- [ ] Create database tables with **fixed schema** (content_markdown, search_vector_en/nl)
- [ ] Build sync script that stores **full markdown** in database
- [ ] Build article pages that read from **database only** (not files)
- [ ] **Write 5 seed articles** before moving to Phase 2

### Phase 2: Search & Discovery
- [ ] Implement **bilingual full-text search** (EN + NL vectors)
- [ ] Build search UI with language detection
- [ ] Build "Populair Vandaag" sidebar (will have real articles from Phase 1)
- [ ] Implement **client-side view tracking** (localStorage, no IP)

### Phase 3-6: Continue as Planned
- Evidence & Credibility system
- Write remaining 10-15 articles
- Dashboard integration (using defined data contracts)
- Polish & testing

---

## 🔧 Database Schema (Correct Version)

**Use this schema, not the one in the original plan:**

```sql
CREATE TABLE wiki_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',

  -- CONTENT (single source of truth)
  content_markdown TEXT NOT NULL,  -- Full markdown
  content_html TEXT,  -- Pre-rendered cache (optional)
  search_text TEXT,  -- Plain text for search

  -- SEARCH VECTORS (bilingual)
  search_vector_en TSVECTOR,  -- English full-text search
  search_vector_nl TSVECTOR,  -- Dutch full-text search

  -- METADATA
  evidence_rating TEXT,
  author TEXT,
  reviewers TEXT[] DEFAULT '{}',
  summary TEXT,
  language TEXT DEFAULT 'en',  -- 'en' or 'nl'

  -- ANALYTICS
  view_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,

  -- TIMESTAMPS
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_wiki_search_en ON wiki_articles USING GIN(search_vector_en);
CREATE INDEX idx_wiki_search_nl ON wiki_articles USING GIN(search_vector_nl);
CREATE INDEX idx_wiki_category ON wiki_articles(category);
CREATE INDEX idx_wiki_view_count ON wiki_articles(view_count DESC);
```

See `ARCHITECTURE-FIXES.md` for full schema + triggers.

---

## 📊 Timeline (Updated)

**8 weeks, part-time (~20hr/week)**

- **Week 1**: Phase 1.1-1.6 (Content System with fixed architecture)
- **Week 2 (first half)**: Phase 1.7 (Write 5 seed articles)
- **Week 2 (second half)**: Phase 2 (Search & Discovery - now has real content)
- **Week 3**: Phase 3 (Evidence & Credibility)
- **Week 4-5**: Phase 4 (Write remaining 10-15 articles)
- **Week 6**: Phase 5 (Dashboard Integration)
- **Week 7**: Phase 6 (Polish & Testing)

---

## ✅ Success Criteria

### Technical
- [ ] Articles stored in database, not read from files at runtime
- [ ] Search works on full article content (not just title)
- [ ] Both English and Dutch queries return relevant results
- [ ] View tracking doesn't store IPs (GDPR-compliant)
- [ ] Dashboard integration works for logged-in and anonymous users

### Content
- [ ] 5 seed articles published by end of Phase 1
- [ ] 15-20 total articles by end of Phase 4
- [ ] All articles have 5+ citations
- [ ] Evidence ratings accurate

### User Experience
- [ ] Search returns results <200ms
- [ ] Article pages load <1s
- [ ] "Populair Vandaag" updates daily
- [ ] Mobile responsive (375px+)

---

## 🆘 If You're Confused

1. **Architecture questions?** → Read `ARCHITECTURE-FIXES.md` again
2. **Schema questions?** → See Fix #1 in `ARCHITECTURE-FIXES.md`
3. **Search questions?** → See Fix #2 in `ARCHITECTURE-FIXES.md`
4. **Privacy questions?** → See Fix #3 in `ARCHITECTURE-FIXES.md`
5. **Dashboard questions?** → See Fix #4 in `ARCHITECTURE-FIXES.md`

---

## 📝 Notes for Future Updates

The original plan documents (`wiki-encyclopedia-plan.md`, `wiki-encyclopedia-context.md`, `wiki-encyclopedia-tasks.md`) should be updated to reflect the fixed architecture. However, since `ARCHITECTURE-FIXES.md` is comprehensive and supersedes them, **you can implement directly from the fixes document**.

If you want to update the original documents:
- Replace Decision #1 in context.md with Fix #1
- Update database schema in plan.md with Fix #1 schema
- Update Phase 1 tasks with new schema
- Add Phase 1.7 (seed articles) to tasks.md

---

**Happy coding! Start with `ARCHITECTURE-FIXES.md` and you'll be on solid ground. 🚀**
