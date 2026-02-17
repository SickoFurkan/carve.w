# Carve Landing Page — Design Document

**Date:** 2026-02-17
**Approach:** "The Scoreboard" — show, don't tell
**Status:** Approved

---

## Goal

Marketing landing page for the Carve iOS app. Converts visitors to App Store downloads (placeholder until live). Replaces the current `/carve` page entirely.

## Design Principles (from Brand Story)

- Dark canvas, no background images — restraint is the flex
- Gold accent for ranking/progress elements
- Show, don't tell — mock scoreboard card sells the product visually
- Gamify the system, not the language — no RPG/cheerleader/motivational copy
- Premium means less, not more
- Data is the visual — real numbers over illustrations
- If it could be on any other fitness app, it's too generic

## Visual System

- **Background:** Near-black (#0C0C0D or similar, matching app)
- **Cards:** Subtle white border (~8% opacity), slightly lighter bg (~white 4%)
- **Text:** White primary, gray secondary (~white 50%), muted labels (~white 30%)
- **Accent:** Gold (#D4A843) for points/rank, Green (#34C759) for positive indicators
- **Labels:** Uppercase, wide tracking (1.5px+), 11-12px, semibold
- **Typography:** System font stack, bold for headlines, medium for body

## Page Structure

### Section 1: Hero (100vh)

Full-viewport dark section. Three elements stacked vertically, centered:

1. **CARVE** — bold white, wide letter-spacing (~0.3em), large (48-64px)
2. **"Fitness with a scoreboard"** — muted gray, 18-20px
3. **Mock Scoreboard Card** — the centerpiece:
   - "SEASON 1" label (uppercase, tracked, muted)
   - "Rookie" rank in large bold + "148 pts" in gold
   - Progress bar (gold fill toward Beginner)
   - "#312 · Top 3% worldwide" — rank and percentile
   - Stats row: 23 Workouts | 47 Streak | 12.4K Steps
   - Card uses app's exact card styling (border, radius, padding)
4. **App Store badge** — Apple "Download on the App Store" black badge
5. **"Coming Spring 2026"** — small muted text

**Animation:** Staggered entrance — logo fades in first, tagline second, card slides up third, CTA last. Subtle, ~300ms delays between each.

### Section 2: Value Proposition (~50vh)

"Track. Rank. Compete." — three words, center-aligned, bold white.

Below: three cards in a row (stacked on mobile):

| Card | Icon | Text |
|------|------|------|
| Track | Dumbbell/utensils | Log meals and workouts in seconds. |
| Rank | BarChart | Climb from Rookie to Legend. |
| Compete | Users | Play with friends. See who's on top. |

Cards use app glass-card styling. Icons from lucide-react. Copy is short, factual, direct.

### Section 3: App Screenshots (~80vh)

Three phone mockups side by side (desktop), horizontally scrollable (mobile).

Screenshots to use (dark theme):
1. Dashboard — Season 1, Rookie, World Ranking
2. Diary — Macro tracking, timeline, quick add
3. Workout — Push/Pull/Legs, schedule, history

Phone frames: dark bezel, rounded corners, side buttons. Reuse PhoneMockup component pattern from existing HowItWorksWithPhone.

No labels or descriptions. Screenshots speak for themselves.

### Section 4: Footer CTA (~30vh)

- "Where do you rank?" — bold white, centered
- App Store badge (repeated)
- "Coming Spring 2026"
- Divider
- Footer links: Roadmap · Wiki · Vision · Privacy · Terms
- "2026 Carve AI · Amsterdam"

## Responsive Behavior

**Desktop (1024px+):**
- Scoreboard card: ~400px wide
- Value cards: 3-column grid
- Phone mockups: 3 side by side

**Tablet (768-1023px):**
- Same layout, slightly smaller cards
- Phone mockups: 2 visible + scroll

**Mobile (< 768px):**
- Full-width scoreboard card (with padding)
- Value cards: stacked vertically
- Phone mockups: horizontal scroll, 1 visible at a time

## Technical Notes

- Replace current `app/[locale]/carve/page.tsx` entirely
- Keep layout.tsx as-is (pass-through)
- Reuse framer-motion for entrance animations
- Reuse lucide-react for icons
- Phone mockup component can be extracted from HowItWorksWithPhone
- New screenshots need to be saved to `public/screenshots/` (dark theme versions)
- App Store badge: use standard Apple SVG/image asset

## Copy (final)

- Hero: "CARVE" / "Fitness with a scoreboard"
- Value prop: "Track. Rank. Compete."
- Card 1: "Log meals and workouts in seconds."
- Card 2: "Climb from Rookie to Legend."
- Card 3: "Play with friends. See who's on top."
- Footer CTA: "Where do you rank?"
- Sub: "Coming Spring 2026"

No motivational language. No exclamation marks. No "journey", "transform", "empower."

## What Gets Deleted

- All current content in `app/[locale]/carve/page.tsx` (StatCard, FeatureBlock, StatusItem, CTACard components)
- The scroll-expand hero dependency for this page
- HowItWorksWithPhone import (component stays, just not used here)

## What Gets Kept

- `components/carve/HowItWorksWithPhone.tsx` — not deleted, just not imported
- `components/ui/scroll-reveal.tsx` — may reuse for subtle fade-in animations
- `components/ui/scroll-expansion-hero.tsx` — not used on this page
