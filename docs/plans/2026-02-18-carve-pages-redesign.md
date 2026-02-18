# Carve Pages Redesign — Premium Dark Theme

**Date:** 2026-02-18
**Status:** Approved
**Scope:** /carve (hub), /carve/roadmap, /carve/vision, /carve/faq, /carve/developer, /carve/contributing

## Context

The /carve/health and /carve/money pages are production-ready with a premium dark aesthetic. The remaining pages (roadmap, vision, FAQ, developer, contributing) use a light theme with basic cards and minimal animations. The /carve hub page needs to become a proper gateway to Health and Money.

## Design Decisions

- **Unified dark theme** (#0A0A0B) across all pages
- **Content and design both renewed** — fresh copy, new sections, better hierarchy
- **No emoji icons** — Lucide React icons throughout for premium feel
- **Consistent patterns** from health/money: glassmorphic cards, ScrollReveal, Framer Motion

## Shared Design System

```
Background: #0A0A0B
Cards: bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm rounded-2xl
Text: white, white/60, white/40
Spacing: py-24 md:py-32 px-6, max-w-6xl mx-auto
Animations: ScrollReveal fade-up, Framer Motion hover/tap
```

## Page Designs

### 1. /carve — Hub

Split-screen hero with two interactive product cards:
- Left: Health (gold accent #D4A843), ScoreboardCard preview
- Right: Money (blue accent #3B82F6), MoneyCard preview
- Hover: accent glow, scale(1.02)

Below: "What is Carve?" pillars, stats bento-grid, CTA

### 2. /carve/roadmap

Visual vertical timeline with glow-dots per phase:
- Completed (green), In Development (gold, pulsing), Planned (blue), Considering (purple)
- Glassmorphic cards per item with priority badges
- Updated content reflecting actual development state

### 3. /carve/vision

Large hero with radial gradient glow. Mission one-liner. 3-4 pillar cards with Lucide icons and accent colors. Typographic "Future" prose section with gradient text on key phrases. Builder mention + CTA.

### 4. /carve/faq

Pill-navigation for categories (General, Features, Privacy, Development). Glassmorphic accordion items with smooth animations. Client-side search filter. Updated content. "Still have questions?" CTA.

### 5. /carve/developer

"Built by" hero with gradient name. Bio in featured card with social icon buttons. Bento-grid tech stack with sized tiles. Philosophy cards with Lucide icons. GitHub/open source section. Support CTA.

### 6. /carve/contributing

Community hero. 4 glassmorphic cards with accent color borders (red/gold/blue/purple). Clean guidelines list. Dark-themed contact form with glassmorphic inputs. Action-oriented CTAs.
