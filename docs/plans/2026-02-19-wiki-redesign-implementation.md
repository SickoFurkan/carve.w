# Wiki Redesign: "Apple Knowledge" Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the wiki from a white knowledge-base layout to a dark glassmorphic "Apple Knowledge" style matching Carve's new website aesthetic.

**Architecture:** Restyle all wiki components to use dark theme (`#0A0A0B` background, glassmorphic cards, category-specific accent colors). Add framer-motion scroll-reveal animations. Reuse existing `ScrollReveal` component from marketing pages.

**Tech Stack:** Next.js App Router, Tailwind CSS, Framer Motion, Supabase (unchanged backend)

**Design doc:** `docs/plans/2026-02-19-wiki-redesign-design.md`

---

### Task 1: Create Category Color Utility

**Files:**
- Create: `lib/wiki/category-colors.ts`

**Step 1: Create the category color mapping**

```typescript
// lib/wiki/category-colors.ts
export const categoryColors = {
  'nutrition': {
    name: 'Emerald',
    tw: 'emerald',
    hex: '#10b981',
    bg: 'bg-emerald-500/10',
    bgHover: 'hover:bg-emerald-500/15',
    border: 'border-emerald-500/20',
    borderHover: 'hover:border-emerald-500/30',
    text: 'text-emerald-400',
    shadow: 'hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)]',
  },
  'exercise-science': {
    name: 'Blue',
    tw: 'blue',
    hex: '#3b82f6',
    bg: 'bg-blue-500/10',
    bgHover: 'hover:bg-blue-500/15',
    border: 'border-blue-500/20',
    borderHover: 'hover:border-blue-500/30',
    text: 'text-blue-400',
    shadow: 'hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)]',
  },
  'physiology': {
    name: 'Purple',
    tw: 'purple',
    hex: '#a855f7',
    bg: 'bg-purple-500/10',
    bgHover: 'hover:bg-purple-500/15',
    border: 'border-purple-500/20',
    borderHover: 'hover:border-purple-500/30',
    text: 'text-purple-400',
    shadow: 'hover:shadow-[0_8px_30px_rgba(168,85,247,0.15)]',
  },
  'training-methods': {
    name: 'Amber',
    tw: 'amber',
    hex: '#f59e0b',
    bg: 'bg-amber-500/10',
    bgHover: 'hover:bg-amber-500/15',
    border: 'border-amber-500/20',
    borderHover: 'hover:border-amber-500/30',
    text: 'text-amber-400',
    shadow: 'hover:shadow-[0_8px_30px_rgba(245,158,11,0.15)]',
  },
  'psychology': {
    name: 'Cyan',
    tw: 'cyan',
    hex: '#06b6d4',
    bg: 'bg-cyan-500/10',
    bgHover: 'hover:bg-cyan-500/15',
    border: 'border-cyan-500/20',
    borderHover: 'hover:border-cyan-500/30',
    text: 'text-cyan-400',
    shadow: 'hover:shadow-[0_8px_30px_rgba(6,182,212,0.15)]',
  },
  'injury-health': {
    name: 'Rose',
    tw: 'rose',
    hex: '#f43f5e',
    bg: 'bg-rose-500/10',
    bgHover: 'hover:bg-rose-500/15',
    border: 'border-rose-500/20',
    borderHover: 'hover:border-rose-500/30',
    text: 'text-rose-400',
    shadow: 'hover:shadow-[0_8px_30px_rgba(244,63,94,0.15)]',
  },
} as const;

export type WikiCategory = keyof typeof categoryColors;

export function getCategoryColor(category: string) {
  return categoryColors[category as WikiCategory] || categoryColors['exercise-science'];
}
```

**Step 2: Commit**

```bash
git add lib/wiki/category-colors.ts
git commit -m "feat(wiki): add category color mapping utility"
```

---

### Task 2: Update Wiki Layout for Dark Theme

**Files:**
- Modify: `app/(wiki-home)/layout.tsx`

**Step 1: Add dark background to the wiki layout wrapper**

```tsx
// app/(wiki-home)/layout.tsx
export default function WikiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      {children}
    </div>
  );
}
```

**Step 2: Also check if there's a layout for article pages**

Check `app/wiki/[category]/layout.tsx` — if it sets a white background, update it to dark theme as well. The layout validates categories and wraps children, so add `bg-[#0A0A0B] text-white min-h-screen` to its wrapper.

**Step 3: Commit**

```bash
git add app/(wiki-home)/layout.tsx app/wiki/
git commit -m "feat(wiki): set dark theme on wiki layouts"
```

---

### Task 3: Redesign Wiki Homepage

**Files:**
- Modify: `app/(wiki-home)/page.tsx`

**Step 1: Rewrite the homepage with dark glassmorphic design**

The homepage should follow this structure:
1. Hero section with `CARVE` / `WIKI` branding + search
2. Stat pills (article count, domains, evidence-based)
3. Category cards grid (3 cols) with glassmorphic styling + category colors
4. Trending section with PopularToday

Key styling patterns to use:
- Remove all `bg-white`, `text-zinc-*` references
- Hero: `CARVE` with `text-5xl md:text-7xl font-bold tracking-[0.3em] text-white`
- `WIKI` with `text-3xl md:text-5xl font-bold tracking-[0.3em] text-white/80`
- Tagline: `text-lg md:text-xl text-white/50 font-light`
- Stats: `text-[11px] uppercase tracking-[0.15em] text-white/30`
- Category cards: `bg-[rgba(28,31,39,0.7)] backdrop-blur-xl border border-white/[0.08] rounded-xl p-6 hover:-translate-y-0.5 transition-all duration-300`
- Each card gets its category color for hover border + shadow from `getCategoryColor()`
- Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`
- Section labels: `text-[11px] uppercase tracking-[0.15em] text-white/30 mb-6`
- Import and use `ScrollReveal` for entrance animations on sections
- Import and use `motion` from framer-motion for hero entrance (staggered delays: 0s, 0.15s, 0.3s)
- Use `StaggerContainer` and `StaggerItem` for category cards grid
- Remove the `GlobalSearch` import, keep only the wiki-specific `SearchBar`
- Remove the duplicate search/header sections — combine into one clean hero
- Footer stats: glassmorphic container with the 3 stats, `text-white` numbers + `text-white/40` labels

**Step 2: Verify the page renders**

Run: `npm run dev` and check `localhost:3000` — should show dark themed homepage.

**Step 3: Commit**

```bash
git add app/(wiki-home)/page.tsx
git commit -m "feat(wiki): redesign homepage with dark glassmorphic layout"
```

---

### Task 4: Restyle SearchBar for Dark Theme

**Files:**
- Modify: `components/wiki/SearchBar.tsx`

**Step 1: Update all styling to dark glassmorphic**

Changes needed:
- Input: `bg-[rgba(28,31,39,0.7)] backdrop-blur-xl border border-white/[0.08] text-white placeholder:text-white/30 focus:border-white/20 rounded-xl`
- Remove `bg-white`, `shadow-md`, `border-zinc-200`, `focus:ring-2 focus:ring-blue-500`
- Icon colors: `text-white/30` instead of `text-zinc-400`
- Clear button: `hover:bg-white/[0.08]` instead of `hover:bg-zinc-100`
- Results dropdown: `bg-[rgba(28,31,39,0.95)] backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]`
- Result items: `hover:bg-white/[0.04]` instead of `hover:bg-zinc-50`
- Selected item: `bg-white/[0.06]`
- Result text: `text-white` for titles, `text-white/50` for summaries, `text-white/30` for meta
- Tags: `bg-white/[0.04] border border-white/[0.08] text-white/60`
- Highlight match: `bg-amber-500/30 text-white` instead of `bg-yellow-200 text-zinc-900`
- "Geen resultaten" text: `text-white/50`
- Results count: `text-white/30 border-b border-white/[0.06]`
- Spinner: `border-b-2 border-white/50` instead of `border-zinc-900`

**Step 2: Commit**

```bash
git add components/wiki/SearchBar.tsx
git commit -m "feat(wiki): restyle SearchBar for dark glassmorphic theme"
```

---

### Task 5: Restyle PopularToday for Dark Theme

**Files:**
- Modify: `components/wiki/PopularToday.tsx`

**Step 1: Update styling**

Changes needed:
- Container: `bg-[rgba(28,31,39,0.7)] backdrop-blur-xl border border-white/[0.08] rounded-xl p-6`
- Remove `bg-white`, `shadow-sm`
- Header icon: keep `text-orange-500` (works well on dark)
- Header text: `text-white font-semibold` instead of `text-zinc-900`
- Rank badge: keep `bg-zinc-900 text-white` (already dark) or switch to `bg-white/10 text-white`
- Article title: `text-white/80 group-hover:text-white` instead of `text-zinc-900 group-hover:text-blue-600`
- Meta text: `text-white/30` instead of `text-zinc-500`
- Hover bg: `hover:bg-white/[0.04]` instead of `hover:bg-zinc-50`
- View All link: `text-white/40 hover:text-white/60 border-t border-white/[0.06]`
- Import `getCategoryColor` and use it to color the category text with the matching category color

**Step 2: Commit**

```bash
git add components/wiki/PopularToday.tsx
git commit -m "feat(wiki): restyle PopularToday for dark theme"
```

---

### Task 6: Redesign ArticleLayout (Magazine Style)

**Files:**
- Modify: `components/wiki/ArticleLayout.tsx`

**Step 1: Rewrite with dark glassmorphic magazine layout**

Key changes:
- Outer container: `min-h-screen bg-[#0A0A0B]` (remove `bg-[#ececf1]`)
- Breadcrumbs: `text-white/40` links, category name uses `getCategoryColor(category).text`
- Import `getCategoryColor` from `@/lib/wiki/category-colors`
- Article card: `bg-[rgba(28,31,39,0.7)] backdrop-blur-xl border border-white/[0.08] rounded-xl p-8 shadow-[0_4px_30px_rgba(0,0,0,0.3)]`
- Remove `bg-white rounded-lg shadow-sm`
- Title: `text-3xl md:text-4xl font-bold text-white tracking-tight`
- Meta row: `text-[11px] uppercase tracking-[0.15em] text-white/30`
- Border header bottom: `border-white/[0.06]` instead of `border-b pb-6`
- Tags: `bg-white/[0.04] border border-white/[0.08] text-white/60 rounded-full px-3 py-1 text-sm`
- Summary box: `border-l-4` with category color + `bg-{category-color}/5` background, `text-white/70`
- Prose: add dark prose classes:
  ```
  prose prose-invert max-w-none
  prose-headings:text-white prose-headings:font-bold
  prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
  prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
  prose-p:text-white/70 prose-p:leading-relaxed prose-p:mb-4
  prose-a:text-{categoryColor} prose-a:no-underline hover:prose-a:underline
  prose-strong:text-white prose-strong:font-semibold
  prose-ul:my-4 prose-ol:my-4
  prose-li:text-white/70
  prose-code:text-sm prose-code:bg-white/[0.04] prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-white/[0.08]
  prose-pre:bg-[rgba(28,31,39,0.7)] prose-pre:border prose-pre:border-white/[0.08]
  ```
- Sources section border: `border-white/[0.06]`
- Related articles section border: `border-white/[0.06]`
- Pass `category` to `TableOfContents` component (for category color highlighting)

**Step 2: Verify article page renders**

Run dev server, navigate to any article page.

**Step 3: Commit**

```bash
git add components/wiki/ArticleLayout.tsx
git commit -m "feat(wiki): redesign ArticleLayout with magazine-style dark theme"
```

---

### Task 7: Restyle TableOfContents for Dark Glassmorphic

**Files:**
- Modify: `components/wiki/TableOfContents.tsx`

**Step 1: Update styling**

Changes needed:
- Accept optional `category` prop for accent color
- Container: `bg-[rgba(28,31,39,0.5)] backdrop-blur-xl border border-white/[0.08] rounded-xl p-6`
- Remove `bg-white rounded-lg shadow-sm`
- Header: `text-[11px] uppercase tracking-[0.15em] text-white/30 mb-4 font-semibold`
- Label text: "CONTENTS" instead of "Table of Contents"
- Links default: `text-white/50 hover:text-white/80`
- Links active: use category accent color (e.g., `text-emerald-400` for nutrition) + left border `border-l-2 pl-2` in same color
- Import `getCategoryColor` and use it for active styling
- If no category prop provided, default to `text-white` for active

**Step 2: Commit**

```bash
git add components/wiki/TableOfContents.tsx
git commit -m "feat(wiki): restyle TableOfContents with dark glassmorphic theme"
```

---

### Task 8: Restyle EvidenceRating for Dark Theme

**Files:**
- Modify: `components/wiki/EvidenceRating.tsx`

**Step 1: Update rating colors for dark theme**

Changes to `ratingConfig`:
- `well-established`: `bg-emerald-500/10 text-emerald-400 border-emerald-500/20`
- `emerging-research`: `bg-amber-500/10 text-amber-400 border-amber-500/20`
- `expert-consensus`: `bg-blue-500/10 text-blue-400 border-blue-500/20`
- Remove light-theme colors (`bg-green-100 text-green-800` etc.)
- Tooltip: already dark styled (`bg-zinc-900`) — keep as is, or upgrade to glassmorphic: `bg-[rgba(28,31,39,0.95)] backdrop-blur-xl border border-white/[0.08]`

**Step 2: Commit**

```bash
git add components/wiki/EvidenceRating.tsx
git commit -m "feat(wiki): restyle EvidenceRating badges for dark theme"
```

---

### Task 9: Restyle Supporting Components

**Files:**
- Modify: `components/wiki/RelatedArticles.tsx`
- Modify: `components/wiki/SourcesList.tsx`
- Modify: `components/wiki/CitationEnhancer.tsx`
- Modify: `components/wiki/ExpertReviewBadge.tsx`
- Modify: `components/wiki/UpdateAlert.tsx`

**Step 1: Update RelatedArticles**

- Section header: `text-2xl font-bold text-white mb-6` (was `text-zinc-900`)
- Cards: `bg-[rgba(28,31,39,0.7)] backdrop-blur-xl border border-white/[0.08] rounded-xl p-4 hover:bg-white/[0.06] hover:-translate-y-0.5 transition-all`
- Remove `bg-zinc-50 hover:bg-zinc-100`
- Title: `text-white font-semibold` (was `text-zinc-900`)
- Summary: `text-white/50` (was `text-zinc-600`)
- Import `getCategoryColor` and add category color accent (left border or dot)

**Step 2: Update SourcesList**

- Citation text: `text-white/60` (was `text-zinc-700`)
- Citation number: `text-white/80 font-medium` (was `text-zinc-900`)
- Links: `text-blue-400 hover:text-blue-300` (was `text-blue-600`)
- Publication em: `text-white/40`

**Step 3: Update CitationEnhancer**

- Tooltip already uses `bg-zinc-900` — upgrade to glassmorphic: `bg-[rgba(28,31,39,0.95)] backdrop-blur-xl border border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.5)]`
- Text colors: `text-white` for authors, `text-white/70` for title, `text-white/40` for publication
- Highlight on click: change from `bg-yellow-100` to `bg-white/[0.08]` (dark-appropriate highlight)

**Step 4: Update ExpertReviewBadge**

- Container: `bg-blue-500/10 border-l-4 border-blue-500/50 rounded-xl p-4`
- Remove `bg-blue-50`
- Header: `text-blue-400 font-semibold text-sm`
- Text: `text-blue-300/80 text-sm`
- Icon: `text-blue-400`

**Step 5: Update UpdateAlert**

- Container: `bg-amber-500/10 border-l-4 border-amber-500/50 rounded-xl p-4`
- Remove `bg-yellow-50`
- Header: `text-amber-400 font-semibold text-sm`
- Text: `text-amber-300/80 text-sm`
- Icon: `text-amber-400`

**Step 6: Commit**

```bash
git add components/wiki/RelatedArticles.tsx components/wiki/SourcesList.tsx components/wiki/CitationEnhancer.tsx components/wiki/ExpertReviewBadge.tsx components/wiki/UpdateAlert.tsx
git commit -m "feat(wiki): restyle all supporting wiki components for dark theme"
```

---

### Task 10: Add Framer Motion Animations to Homepage

**Files:**
- Modify: `app/(wiki-home)/page.tsx` (if not already done in Task 3)

**Step 1: Ensure animations are properly applied**

This task ensures the homepage has:
- `'use client'` directive at the top (needed for framer-motion)
- OR: Split into a server component that fetches data + a client component that renders with animations

Recommended approach: Keep the page as a server component for data fetching, create a client component `WikiHomeContent` that receives the data and renders with animations:

```tsx
// app/(wiki-home)/page.tsx - server component
import { WikiHomeContent } from './wiki-home-content';

export default async function WikiPage() {
  const counts = await getCategoryCounts();
  return <WikiHomeContent counts={counts} />;
}
```

```tsx
// app/(wiki-home)/wiki-home-content.tsx - client component
'use client';

import { motion } from 'framer-motion';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/scroll-reveal';
// ... rest of the homepage with animations
```

Animations to include:
- Hero CARVE/WIKI: sequential fade-in (0s, 0.15s, 0.3s delay)
- Search bar: fade-in at 0.4s delay
- Stat pills: fade-in at 0.5s delay
- Category cards: `StaggerContainer` + `StaggerItem` with `fade-up` animation
- Trending section: `ScrollReveal` with `fade-up`
- Footer stats: `ScrollReveal` with `fade-up`

**Step 2: Verify animations work**

Run dev server, check homepage loads with smooth animations.

**Step 3: Commit**

```bash
git add app/(wiki-home)/
git commit -m "feat(wiki): add framer-motion entrance animations to homepage"
```

---

### Task 11: Add Animations to Article Page

**Files:**
- Modify: `components/wiki/ArticleLayout.tsx`

**Step 1: Add subtle entrance animations**

Since ArticleLayout is a server component, wrap animated sections in `ScrollReveal`:
- Article header: `ScrollReveal` with `fade-up`
- Summary box: `ScrollReveal` with `fade-up` delay 0.1s
- Content prose: `ScrollReveal` with `fade` (no vertical movement for reading content)
- Sources section: `ScrollReveal` with `fade-up`
- Related articles: `StaggerContainer` + `StaggerItem`

Note: If the ArticleLayout needs to stay a server component (it takes props from server), keep the animations minimal by using CSS animations or wrapping only client-interactive parts.

Alternative: Use CSS `@keyframes` for simple fade-in on page load without framer-motion, since the article page content is server-rendered.

**Step 2: Commit**

```bash
git add components/wiki/ArticleLayout.tsx
git commit -m "feat(wiki): add subtle entrance animations to article pages"
```

---

### Task 12: Final Review and Polish

**Files:**
- All modified files

**Step 1: Visual review**

Check all pages for:
- Consistent dark theme (no white flashes, no light backgrounds)
- Category colors showing correctly on all cards/badges
- Search working properly with dark styling
- TOC active states with correct category colors
- Animations smooth and not distracting
- Mobile responsiveness (check at 375px, 768px, 1024px, 1440px)
- No Tailwind class conflicts or purged classes

**Step 2: Check for any remaining light-theme references**

Search for: `bg-white`, `text-zinc-900`, `text-zinc-600`, `bg-zinc-`, `border-zinc-`, `shadow-sm`, `shadow-md` in wiki components.

Replace any remaining light references with dark equivalents.

**Step 3: Final commit**

```bash
git add .
git commit -m "feat(wiki): polish and finalize dark theme redesign"
```

---

## Summary of Changes

| File | Action | Description |
|------|--------|-------------|
| `lib/wiki/category-colors.ts` | Create | Category color mapping utility |
| `app/(wiki-home)/layout.tsx` | Modify | Dark background wrapper |
| `app/(wiki-home)/page.tsx` | Modify | Complete homepage redesign |
| `app/(wiki-home)/wiki-home-content.tsx` | Create | Client component for animated homepage |
| `app/wiki/[category]/layout.tsx` | Modify | Dark background |
| `components/wiki/ArticleLayout.tsx` | Modify | Magazine-style dark redesign |
| `components/wiki/SearchBar.tsx` | Modify | Dark glassmorphic input + results |
| `components/wiki/TableOfContents.tsx` | Modify | Dark glassmorphic with category colors |
| `components/wiki/PopularToday.tsx` | Modify | Dark theme trending widget |
| `components/wiki/EvidenceRating.tsx` | Modify | Dark badge styling |
| `components/wiki/RelatedArticles.tsx` | Modify | Dark card styling |
| `components/wiki/SourcesList.tsx` | Modify | Dark text styling |
| `components/wiki/CitationEnhancer.tsx` | Modify | Dark glassmorphic tooltips |
| `components/wiki/ExpertReviewBadge.tsx` | Modify | Dark alert styling |
| `components/wiki/UpdateAlert.tsx` | Modify | Dark alert styling |
