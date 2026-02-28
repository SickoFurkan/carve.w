# Carve Travel — Pages Design

## Context

Carve Travel has a working dashboard (`/dashboard/travel`) with trip hero, countdown, todos, budget widgets, and AI-powered trip planning via chat. The sidebar has 5 items: Dashboard, Trips, Map, Budget, Settings. Only Dashboard has a page — the other 4 need to be built.

## Existing Infrastructure

- **Supabase tables**: trips, trip_days, trip_activities, trip_todos, trip_accommodations
- **API**: GET/POST/DELETE `/api/travel/trips`
- **Components**: TravelCard, TripCard, TripMap (Mapbox), BudgetWidget, DayTimeline
- **AI chat**: TravelChat with `@ai-sdk/react` for trip planning

---

## Trips (`/dashboard/travel/trips`)

Clean trip list with status tabs.

- **3 tabs**: Upcoming / Past / All
- **"Plan a Trip"** button top-right, links to `/travel/new`
- Trip cards: destination, dates, budget, status badge (planned/active/completed)
- Click opens `/travel/[id]`
- Delete action on hover with confirmation
- Empty state with CTA to trip planning
- **Data**: reuses existing `trips` table and `/api/travel/trips` GET endpoint

## Map (`/dashboard/travel/map`)

Fullscreen Mapbox map with trip pins.

- Fullscreen dark map (Mapbox `dark-v11` theme)
- Pin per trip at destination location
- Color by status: teal = upcoming, green = active, dimmed = completed
- Click pin = popup card with trip name, dates, budget + link to detail
- Stats overlay at top: "X trips · Y countries · Z upcoming"
- Reuses existing `TripMap` component as foundation
- Trips without lat/lng gracefully excluded

## Budget (`/dashboard/travel/budget`)

Simple travel cost overview.

- Header with 2 stats: total spent (all trips), total planned (upcoming)
- Per-trip list: trip name, budget vs estimated costs, progress bar
- Per-category breakdown: food, transport, accommodation, activities — colored bars
- All in default currency
- Data computed from existing `trip_activities.estimated_cost` and `trip_accommodations.price_per_night`

## Settings (`/dashboard/travel/settings`)

Minimal preferences.

- Default currency (dropdown: EUR, USD, GBP, etc.)
- Preferred travel style (budget / mid-range / luxury) — used by AI for trip planning suggestions
- Future: Mapbox token config, data export

---

## Design Principles

- **YAGNI**: no features beyond what's described. Add later if needed.
- **Reuse**: leverage existing components (TravelCard, TripCard, TripMap, BudgetWidget)
- **Dark theme**: consistent with Carve's `#0c0e14` / `#1c1f27` palette, teal `#b8d8e8` accent
- **Server Components by default**: only `'use client'` for interactivity
- **Supabase server-side**: data fetching in page.tsx, pass to client components
