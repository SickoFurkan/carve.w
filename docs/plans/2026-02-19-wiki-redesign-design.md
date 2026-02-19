# Wiki Redesign: "Apple Knowledge" Design

**Date:** 2026-02-19
**Status:** Approved
**Approach:** Functional knowledge base with Carve dark glassmorphic styling

## Design Decisions

- **Goal:** Wiki remains a functional knowledge base (search, read, navigate) with the new premium dark aesthetic
- **Style:** Dark glassmorphic (matching Carve Money dashboard / marketing pages)
- **Categories:** Each wiki category gets a signature accent color
- **Homepage:** Modern, clean, Apple-like — search-first with glassmorphic category cards
- **Article pages:** Magazine-style with glassmorphic content containers and floating TOC
- **Animations:** Subtle framer-motion (scroll reveals, staggered card entrances, smooth transitions)

## Color System

### Base Theme
- Background: `#0A0A0B` (ultra-dark)
- Card background: `rgba(28,31,39,0.7)` with `backdrop-blur-xl`
- Card border: `border-white/[0.08]`
- Card shadow: `shadow-[0_4px_30px_rgba(0,0,0,0.3)]`

### Category Colors
| Category | Color | Tailwind Token |
|----------|-------|----------------|
| Nutrition | Emerald | `emerald-500` |
| Exercise Science | Blue | `blue-500` |
| Physiology | Purple | `purple-500` |
| Training Methods | Amber | `amber-500` |
| Psychology | Cyan | `cyan-500` |
| Injury & Health | Rose | `rose-500` |

Usage: 10-20% opacity for card backgrounds (`bg-{color}-500/10`), 100% for badges, border accents, active states.

### Typography
- Hero title: `text-5xl md:text-7xl font-bold tracking-[0.3em]`
- Section headers: `text-3xl md:text-5xl font-bold tracking-tight`
- Labels: `text-[11px] uppercase tracking-[0.15em] text-white/30`
- Body: `text-white/70` (article prose)
- Headings: `text-white`
- Meta text: `text-white/40`

## Homepage Design

### Layout (top → bottom)

1. **Hero Section**
   - `CARVE` in tracking-[0.3em], white
   - `WIKI` below in white/80
   - Tagline: "Evidence-based fitness knowledge" in `text-white/50 font-light`
   - Glassmorphic search bar (centered, max-w-2xl)
   - Stat pills below: "142 articles · 6 domains · 100% evidence-based" in `text-[11px] uppercase tracking-[0.15em] text-white/30`

2. **Browse by Domain**
   - Section header: "BROWSE BY DOMAIN" uppercase label
   - 3-column grid (responsive: 3 → 2 → 1)
   - Each card: glassmorphic container
     - Emoji icon (large, top-left)
     - Category title (white, font-semibold)
     - Article count (`text-white/40`)
     - Hover: `-translate-y-0.5`, `border-{category-color}/30`, `shadow-[0_8px_30px_rgba({color},0.15)]`
   - Staggered entrance animation (0.1s per card)

3. **Trending Now**
   - Horizontal list or subtle glassmorphic cards
   - Article title + view count
   - Category color accent dot/badge

### Shared Components
- `WikiCard`: Glassmorphic card wrapper (reusable)
- `ScrollReveal`: Existing component from marketing pages
- `GlobalSearch`: Existing search component, restyled for dark theme

## Article Page Design (Magazine Style)

### Layout
- Full-width dark background
- Two-column grid: content (3/4) + TOC sidebar (1/4)

### Components

1. **Breadcrumbs**
   - `text-white/40` links, category in `text-{category-color}`
   - Separator: `/` or `›`

2. **Article Content Container**
   - Glassmorphic card: `bg-[rgba(28,31,39,0.7)]`, `backdrop-blur-xl`, `rounded-xl`, `p-8`
   - Inside:

3. **Article Header**
   - Title: `text-3xl md:text-4xl font-bold text-white tracking-tight`
   - Evidence badge: glassmorphic pill, color-coded (emerald=well-established, amber=emerging, blue=expert-consensus)
   - Meta row: author, date, views — `text-[11px] uppercase tracking-[0.15em] text-white/30`
   - Tags: glassmorphic pills (`bg-white/[0.04]`, `border-white/[0.08]`, `text-white/60`)

4. **Summary Box**
   - `border-l-4 border-{category-color}`, `bg-{category-color}/5`
   - Text: `text-white/70 leading-relaxed`

5. **Prose Content**
   - Dark prose: `prose-invert` variant
   - Body: `text-white/70`
   - Headings: `text-white font-bold`
   - Links: `text-{category-color}`
   - Code blocks: `bg-white/[0.04]` with border
   - Blockquotes: category-colored border-left

6. **Citations**
   - Hover popovers: glassmorphic popup with source details
   - Sources section: numbered list, glassmorphic container

7. **Related Articles**
   - 3-card grid, glassmorphic cards with category color accents

### Table of Contents (Sticky Sidebar)
- Glassmorphic container (`bg-[rgba(28,31,39,0.5)]`)
- "CONTENTS" label: `text-[11px] uppercase tracking-[0.15em] text-white/30`
- Items: `text-white/50`, active: `text-{category-color}` with left border accent
- Smooth scroll on click
- IntersectionObserver for active tracking

## Animation Spec

### Entrance (Page Load)
- Hero elements: sequential fade-in (0s, 0.15s, 0.3s delays)
- Category cards: staggered entrance `i * 0.1s`
- Ease: `[0.25, 0.1, 0.25, 1]` (custom cubic-bezier)

### Scroll Reveals
- Sections fade-up on scroll using `ScrollReveal` component
- `{ opacity: 0, y: 30 }` → `{ opacity: 1, y: 0 }`, duration 0.6s

### Hover States
- Cards: `-translate-y-0.5`, border color enhancement, shadow glow
- Links: color transition 200ms
- TOC items: smooth color transition

### Page Transitions
- Article navigation: opacity crossfade

## Files to Create/Modify

### Modify
- `app/(wiki-home)/page.tsx` — Complete redesign of homepage
- `app/(wiki-home)/layout.tsx` — Dark background wrapper
- `components/wiki/ArticleLayout.tsx` — Magazine-style dark redesign
- `components/wiki/TableOfContents.tsx` — Dark glassmorphic styling + category color
- `components/wiki/SearchBar.tsx` — Dark glassmorphic input styling
- `components/wiki/PopularToday.tsx` — Dark theme + trending redesign
- `components/wiki/EvidenceRating.tsx` — Glassmorphic badge styling
- `components/wiki/RelatedArticles.tsx` — Dark card styling
- `components/wiki/SourcesList.tsx` — Dark theme
- `components/wiki/CitationEnhancer.tsx` — Glassmorphic popover
- `components/wiki/ExpertReviewBadge.tsx` — Dark theme
- `components/wiki/UpdateAlert.tsx` — Dark theme

### Create
- `lib/wiki/category-colors.ts` — Category color mapping utility
- (Optionally) `components/wiki/WikiCard.tsx` — Shared glassmorphic card component

## Category Color Utility

```typescript
export const categoryColors = {
  'nutrition': { color: 'emerald', hex: '#10b981' },
  'exercise-science': { color: 'blue', hex: '#3b82f6' },
  'physiology': { color: 'purple', hex: '#a855f7' },
  'training-methods': { color: 'amber', hex: '#f59e0b' },
  'psychology': { color: 'cyan', hex: '#06b6d4' },
  'injury-health': { color: 'rose', hex: '#f43f5e' },
} as const;
```
