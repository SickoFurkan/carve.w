# Trip CRUD — Design

## Context

Carve Travel has a working dashboard with trip display, AI chat planning, and page navigation. Trips can be created via AI chat and deleted from the trips list. What's missing is manual trip creation and editing — users need to create trips by hand and edit all details (trip info, days, activities) on the detail page.

## Constraints

- **No API calls** — frontend only with client state. APIs will be added later.
- **AI chat stays separate** — existing `/dashboard/travel/new` with AI chat remains unchanged. Manual and AI flows will be connected later.
- **Client state only** — data doesn't persist on refresh. State mutators are structured so they can be swapped for API calls later.

---

## 1. Trip Creation — Modal on /trips

The existing "Plan a trip" button on the Trips page opens a modal form instead of navigating to `/travel/new`.

**Modal fields:**
- Destination (text, required)
- Title (text, optional — defaults to "Trip to {destination}")
- Start date (date picker)
- End date (date picker)
- Budget (number)
- Currency (dropdown: EUR, USD, GBP, CHF, JPY, AUD, CAD)

**Behavior:**
- Submit adds trip to local state array with a generated client-side ID
- Redirects to `/dashboard/travel/[id]` with the new trip
- Small link under form: "Or plan with AI" → links to `/dashboard/travel/new`

**Design:** Dark modal, TravelCard-style card, teal accent submit button.

## 2. Trip Detail Page — Editable

The current read-only trip detail page becomes fully editable.

### Trip Header (inline edit)
- Click title → text input
- Click destination → text input
- Dates and budget → clickable inline edit fields

### Days Section
- "Add day" button at bottom of days list
- Each day has a delete button (visible on hover)
- Day title clickable → inline edit
- New days get auto-incremented day_number

### Activities Per Day
- "Add activity" button per day
- Click activity → expandable inline edit form:
  - Title, time slot (morning/afternoon/evening), location name
  - Estimated cost, cost category (food/activity/transport/shopping/other)
  - Duration in minutes
- Delete button per activity (hover)
- Activities ordered by time slot (morning → afternoon → evening)

### State Management
- Single `useState<TripPlan>` in client component
- Mutator functions: `updateTrip`, `addDay`, `removeDay`, `addActivity`, `updateActivity`, `removeActivity`
- These functions later become API call wrappers — same interface, different implementation

## 3. Components

**New components:**
- `CreateTripModal` — form modal for manual trip creation
- `EditableTripHeader` — inline-editable trip title, destination, dates, budget
- `EditableDaySection` — day with add/delete activity, editable title
- `ActivityEditForm` — expandable form for editing activity details

**Modified components:**
- `trips-client.tsx` — add modal state, local trips array, create handler
- `trip-detail-client.tsx` — replace read-only display with editable components

**Unchanged:**
- TravelChat, ChatMessage, ChatInput (AI flow stays as-is)
- PlanDashboard (used by AI flow)
- Map, Budget, Settings pages

---

## Design Principles

- **YAGNI**: no drag-and-drop, no image upload, no accommodation editing (later)
- **Swap-ready**: state mutators structured as `async` functions so API calls drop in later
- **Dark theme**: consistent with `#0c0e14` / `#1c1f27` palette, teal `#b8d8e8` accent
- **Client components**: all editing components are `'use client'`
