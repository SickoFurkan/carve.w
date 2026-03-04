# Marketing Page 2-Column Layout with Smart Header

**Date:** 2026-03-04
**Status:** Approved

## Problem

The header on marketing pages (`/carve/*`) shows Health | Money | Travel links that navigate between marketing pages — redundant when you're already on a marketing page. There's no clear path to login/dashboard from the marketing experience.

## Solution

### 1. Contextual Header Navigation

The header always shows the same labels (Health, Money, Travel) but destinations switch based on auth state:

- **Not authenticated:** Health → `/carve/health`, Money → `/carve/money`, Travel → `/carve/travel`
- **Authenticated:** Health → `/dashboard`, Money → `/dashboard/money`, Travel → `/dashboard/travel`
- Logo "CARVE" always links to `/carve`
- Wiki button remains
- Right side: "Sign in" button (not authenticated) or avatar dropdown (authenticated)

### 2. Two-Column Layout on All Marketing Pages

All marketing pages (`/carve`, `/carve/health`, `/carve/money`, `/carve/travel`) get a 2-column layout:

- **Left column (~65%):** Existing marketing content (hero, features, etc.), scrollable
- **Right column (~35%):** Sticky panel with product-specific feature highlights + CTA

Right column content (not authenticated):
- Product-specific feature checkmarks (e.g., "Track workouts", "AI coaching" for health)
- "Get Started" primary button → `/signup`
- "Already have an account? Sign in" link → `/login`

### 3. Auth-Based Redirects

- **Authenticated user visits `/carve`** → Redirect to `/dashboard`
- **Authenticated user visits product pages** → Not reachable via header nav (header links to dashboard), but if accessed directly, could either redirect or show marketing content

### 4. Mobile Behavior

On mobile (< md breakpoint):
- Right column moves above the marketing content (not sticky)
- Shows: feature highlights + CTA + sign in link
- Marketing content scrolls below
- Header uses hamburger menu as current

### 5. Sticky Behavior (Desktop)

The right column uses `position: sticky; top: 80px` (below header). It stays visible while the left column scrolls. Content is vertically centered within the sticky container.

## Design Tokens

- Background: `bg-[#0A0A0B]` (matches current marketing pages)
- Right panel: subtle border-left or no border, same dark bg
- CTA button: white on dark (`bg-white text-black`) — Apple style
- Feature checkmarks: `text-white/50` with subtle accent per product
- Sticky panel padding: generous whitespace, Apple-like restraint

## Per-Page Right Column Content

### /carve (main)
- ✓ Track health & fitness
- ✓ Manage your money
- ✓ Plan your travels
- ✓ Evidence-based wiki

### /carve/health
- ✓ Track workouts
- ✓ AI coaching
- ✓ Compete on scoreboards
- ✓ Rank progression

### /carve/money
- ✓ Budget tracking
- ✓ Spending insights
- ✓ Financial goals
- ✓ Smart categorization

### /carve/travel
- ✓ Trip planning
- ✓ Collect moments
- ✓ Travel journal
- ✓ Destination discovery

## Files to Modify

1. `components/app/app-header.tsx` — contextual nav links based on auth state
2. `components/app/layout-wrapper.tsx` — 2-column layout for marketing routes
3. `app/carve/page.tsx` — add auth redirect, adapt to left-column layout
4. `app/carve/health/page.tsx` — adapt to left-column layout
5. `app/carve/money/page.tsx` — adapt to left-column layout
6. `app/carve/travel/page.tsx` — adapt to left-column layout
7. New: `components/carve/MarketingSidebar.tsx` — reusable sticky right column component
