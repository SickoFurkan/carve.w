# Carve Pages Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign all /carve pages to match the premium dark aesthetic of the health and money pages.

**Architecture:** Each page is a standalone `'use client'` component using Framer Motion animations, ScrollReveal for scroll-triggered reveals, and Lucide React icons. All pages share the same dark base (#0A0A0B) with glassmorphic card patterns. The ContactForm component needs a dark theme update.

**Tech Stack:** Next.js App Router, React 19, Framer Motion, Tailwind CSS, Lucide React, ScrollReveal component

---

## Shared Patterns Reference

```tsx
// Dark background
className="min-h-screen w-full bg-[#0A0A0B] text-white overflow-y-auto"

// Glassmorphic card
className="rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm p-6"

// Section spacing
className="py-24 md:py-32 px-6"

// Container
className="max-w-5xl mx-auto"

// Hero title
className="text-5xl md:text-7xl font-bold tracking-tight text-white"

// Section title
className="text-3xl md:text-5xl font-bold text-white tracking-tight"

// Body text
className="text-white/50 text-sm leading-relaxed"

// Imports every page needs:
import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import Link from 'next/link';
```

---

### Task 1: Redesign /carve Hub Page

**Files:**
- Modify: `app/carve/page.tsx`

**Goal:** Transform from a minimal 2-card gateway into a premium split-screen hub with product previews and value proposition sections.

**Step 1: Rewrite app/carve/page.tsx**

The new page should have:
1. **Hero** — Large "CARVE" title with "Your life, scored." tagline
2. **Split-screen product cards** — Two large interactive cards side-by-side:
   - Health card: gold accent (#D4A843), Dumbbell icon, "Track. Rank. Compete." tagline, mini ScoreboardCard preview embedded
   - Money card: blue accent (#3B82F6), Wallet icon, "Know where your money goes." tagline, mini MoneyCard preview embedded
   - Hover: accent border glow, subtle scale(1.02) via Framer Motion whileHover
3. **"What is Carve?" section** — 3 pillar cards (Track Everything, Compete Globally, Earn Rewards) with icons
4. **Stats bento-grid** — "482 exercises · 12 muscle groups · AI-powered scanning" in a visual grid
5. **App Store CTA** + footer links (same pattern as money page footer)

Import ScoreboardCard and MoneyCard components. Use ScrollReveal on every section. Match the motion.h1/p hero animation pattern from the health page (staggered opacity+y).

**Step 2: Verify visually**

Run `npm run dev` and check `/carve`. Verify:
- Dark theme matches health/money pages
- Both product cards render with previews
- Hover effects work (accent glow, scale)
- All sections animate on scroll
- Mobile responsive (cards stack vertically)

**Step 3: Commit**

```bash
git add app/carve/page.tsx
git commit -m "feat(carve): redesign hub page with split-screen product cards"
```

---

### Task 2: Redesign /carve/roadmap

**Files:**
- Modify: `app/carve/roadmap/page.tsx`

**Goal:** Transform from light-theme flat cards to a dark premium page with a visual vertical timeline.

**Step 1: Rewrite app/carve/roadmap/page.tsx**

Add `'use client'` directive (currently missing — needed for Framer Motion).

The new page should have:
1. **Hero** — "Roadmap" title with subtle description
2. **Visual timeline** — Vertical line on the left with colored dots per phase:
   - Completed (green #22C55E, checkmark) — dimmed styling, line-through titles
   - In Development (gold #D4A843, pulsing dot animation) — highlighted as current
   - Planned (blue #3B82F6)
   - Considering (purple #A855F7, more transparent cards)
3. **Timeline items** — Each item is a glassmorphic card with:
   - Colored dot connector to the timeline
   - Title, description, priority badge
   - Priority colors: high=red-500, medium=amber-500, low=green-500 (dark variants)
4. **CTA** — "Have a feature request?" linking to /carve/contributing

Updated content for roadmap items:
- **Completed:** Landing Page & Website, Wiki System, Marketing Pages
- **In Development:** iOS App Beta, AI Food Scanner, Scoreboard System
- **Planned:** Social Features & Leaderboards, Money Tracking, Workout Programs, Apple Watch Integration
- **Considering:** AI Coaching, Community Challenges, Android App

Use ScrollReveal on each timeline section. Each dot should have a subtle glow matching its color.

Timeline structure: a relative container with an absolute vertical line (w-px bg-white/[0.08]) on the left, items positioned with left padding. Each item row has:
- An absolute dot (w-3 h-3 rounded-full) positioned on the line
- The card content to the right

**Step 2: Verify visually**

Check `/carve/roadmap`. Verify timeline renders correctly, dots align, animations work, mobile responsive.

**Step 3: Commit**

```bash
git add app/carve/roadmap/page.tsx
git commit -m "feat(carve): redesign roadmap page with dark timeline"
```

---

### Task 3: Redesign /carve/vision

**Files:**
- Modify: `app/carve/vision/page.tsx`

**Goal:** Transform from light emoji-based cards to a premium dark page with Lucide icons and typographic emphasis.

**Step 1: Rewrite app/carve/vision/page.tsx**

Add `'use client'` directive.

The new page should have:
1. **Hero** — "Our Vision" with a radial gradient glow behind (using a pseudo-element or absolute positioned div with bg-gradient-radial). Large mission one-liner: *"Make self-improvement the most rewarding game you'll ever play."*
2. **Core Beliefs** — 4 glassmorphic cards in a 2x2 grid:
   - Gamepad icon → "Fitness Should Be Fun" (gold accent)
   - BarChart3 icon → "Data Drives Progress" (blue accent)
   - Users icon → "Community Amplifies Results" (green accent)
   - Brain icon → "Knowledge Empowers Change" (purple accent)
   - Each card: icon in a colored bg circle, title, description
3. **"The Future" section** — Prose block in a glassmorphic container. Key phrases should use gradient text (bg-gradient-to-r from-white to-white/60 bg-clip-text) or bold white against white/50 body text. 3 paragraphs about the vision.
4. **"Why Now?" section** — 4 cards in 2x2 grid with titles and descriptions
5. **CTA** — Glassmorphic card with "Join the Mission" and link to contributing

No emojis anywhere — only Lucide icons.

**Step 2: Verify visually**

Check `/carve/vision`. Verify dark theme, no emojis, gradient text effects, responsive grid.

**Step 3: Commit**

```bash
git add app/carve/vision/page.tsx
git commit -m "feat(carve): redesign vision page with dark premium theme"
```

---

### Task 4: Redesign /carve/faq

**Files:**
- Modify: `app/carve/faq/page.tsx`

**Goal:** Transform from light accordion to dark premium FAQ with category pills and smooth animations.

**Step 1: Rewrite app/carve/faq/page.tsx**

Keep `'use client'` (already present).

The new page should have:
1. **Hero** — "Frequently Asked Questions" with description
2. **Category pill navigation** — Horizontal row of pills: All, General, Features, Privacy, Development. Active pill has white bg with black text, inactive has white/[0.08] bg. Clicking filters the FAQ items. Use useState for activeCategory.
3. **FAQ items** — Glassmorphic accordion cards:
   - Closed: question text + ChevronDown icon, border-white/[0.08]
   - Open: answer fades in with AnimatePresence, card gets slightly lighter bg (bg-white/[0.06])
   - Smooth height animation using motion.div with animate={{ height: 'auto' }}
   - Each item tagged with a category for filtering
4. **CTA** — "Still have questions?" card linking to /carve/contributing

Updated FAQ content — keep existing questions but add:
- General: "What does Carve stand for?" → "Carve means to shape and define. We help you carve your best self."
- Features: "How does the AI food scanner work?" → "Take a photo of your meal and our AI identifies ingredients, portions, and calculates macros instantly."
- Features: "What is the scoreboard system?" → "Every workout earns XP. Climb ranks from Rookie to Legend. Compete with friends on global and local leaderboards."

**Step 2: Verify visually**

Check `/carve/faq`. Verify pills filter correctly, accordion animations are smooth, dark theme consistent.

**Step 3: Commit**

```bash
git add app/carve/faq/page.tsx
git commit -m "feat(carve): redesign FAQ page with dark theme and category pills"
```

---

### Task 5: Redesign /carve/developer

**Files:**
- Modify: `app/carve/developer/page.tsx`

**Goal:** Transform from light theme with emojis to a premium dark developer showcase with bento-grid tech stack.

**Step 1: Rewrite app/carve/developer/page.tsx**

Add `'use client'` directive.

The new page should have:
1. **Hero** — "Built by" in white/50, then "Furkan Celiker" in larger gradient text (bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent). Subtitle: "Independent developer · Amsterdam"
2. **About card** — Glassmorphic card with bio text (keep existing bio content, adapt to dark text colors). Social links as icon-only buttons in a row: GitHub, LinkedIn, Mail — each in a rounded-lg bg-white/[0.06] hover:bg-white/[0.12] with white/50 icon color.
3. **"Why I'm Building Carve"** — 4 glassmorphic cards in 2x2 grid with Lucide icons (no emojis):
   - Gamepad2 → Gamification Done Right
   - Users → Community First
   - BookOpen → Education Matters
   - Rocket → Building in Public
4. **Tech Stack bento-grid** — Mixed-size grid layout:
   - Large tiles (col-span-2 or row-span-2): Next.js, Supabase, React Native
   - Regular tiles: React, TypeScript, Tailwind CSS, Framer Motion, Vercel, Cloudflare
   - Each tile: glassmorphic card with tech name in bold, role in white/40 below
   - Grid: `grid-cols-2 md:grid-cols-4 gap-3`
5. **Philosophy** — 3 cards in a row: User First (Heart icon), Ship Fast (Rocket icon), Stay Lean (Minimize2 icon)
6. **Support CTA** — Glassmorphic card with Coffee icon, "Support Development" text, "Coming soon" note

**Step 2: Verify visually**

Check `/carve/developer`. Verify bento grid looks good, no emojis, social links work, responsive.

**Step 3: Commit**

```bash
git add app/carve/developer/page.tsx
git commit -m "feat(carve): redesign developer page with dark bento-grid layout"
```

---

### Task 6: Redesign /carve/contributing + Dark ContactForm

**Files:**
- Modify: `app/carve/contributing/page.tsx`
- Modify: `components/carve/ContactForm.tsx`

**Goal:** Transform contributing page to dark theme and update ContactForm for dark mode.

**Step 1: Update ContactForm for dark theme**

The ContactForm currently uses light theme classes (gray-300 borders, gray-700 text, white bg). Update to dark:
- Labels: `text-white/60` instead of `text-gray-700`
- Inputs: `bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30 focus:ring-white/20 focus:border-white/20`
- Select: same dark styling
- Textarea: same dark styling
- Submit button: `bg-white text-black hover:bg-white/90` (inverted for dark)
- Success state: green-400 text on dark, `text-white` for headings
- Error state: dark red card `bg-red-500/10 border-red-500/20 text-red-400`
- "Submit another" link: `text-white/60 hover:text-white`

**Step 2: Rewrite app/carve/contributing/page.tsx**

Add `'use client'` directive.

The new page should have:
1. **Hero** — "Contribute to Carve" with tagline about community
2. **Ways to Contribute** — 4 glassmorphic cards in 2x2 grid, each with a colored accent border on left:
   - Bug (red accent, `border-l-2 border-l-red-500`): Bug icon, title, description, "Report on GitHub" link
   - Feature (gold accent, `border-l-2 border-l-[#D4A843]`): Lightbulb icon, title, description
   - Wiki (blue accent, `border-l-2 border-l-blue-500`): FileEdit icon, title, description
   - Feedback (purple accent, `border-l-2 border-l-purple-500`): MessageSquare icon, title, description
3. **Guidelines** — Clean list with Check icons in white/30, not numbered circles. Each guideline: icon + title + description in a simple row.
4. **Contact Form** — Section title + glassmorphic container with the updated dark ContactForm
5. **Thank You** — Simple glassmorphic card with appreciation text

**Step 3: Verify visually**

Check `/carve/contributing`. Verify form renders in dark theme, accent borders visible, all states work (submit, success, error).

**Step 4: Commit**

```bash
git add app/carve/contributing/page.tsx components/carve/ContactForm.tsx
git commit -m "feat(carve): redesign contributing page and dark ContactForm"
```

---

### Task 7: Final Review & Polish

**Files:**
- All modified pages

**Step 1: Cross-page consistency check**

Navigate through all pages in order:
1. `/carve` → `/carve/health` → back
2. `/carve` → `/carve/money` → back
3. `/carve/roadmap`
4. `/carve/vision`
5. `/carve/faq`
6. `/carve/developer`
7. `/carve/contributing`

Check for:
- Consistent dark background (#0A0A0B) across all pages
- Consistent card styling (border-white/[0.08], bg-white/[0.04])
- Consistent text hierarchy (white, white/50, white/40)
- Consistent section spacing (py-24 md:py-32)
- All ScrollReveal animations working
- Mobile responsive on all pages
- No light theme remnants (gray-50, gray-200, etc.)
- No emojis on any redesigned page
- Footer links consistent where present

**Step 2: Fix any inconsistencies found**

**Step 3: Final commit**

```bash
git add -A
git commit -m "polish(carve): final consistency pass across all pages"
```
