# Travel Bucketlist Design

**Goal:** Add a bucketlist feature integrated into the map (golden dots) and dashboard (widget), with the ability to convert items into real trips.

**Scope:** Destinations and experiences. No separate page — lives in map sidebar and dashboard widget.

---

## Data Model

New `bucketlist_items` table:

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK to auth.users |
| type | text | "destination" or "experience" |
| title | text | e.g. "Northern Lights" or "Tokyo" |
| destination | text | City/country for map placement |
| description | text | Optional notes |
| completed | boolean | Default false |
| trip_id | uuid | Nullable FK to trips — set when converted |
| created_at | timestamptz | Default now() |

Coordinates resolved via existing `CITY_COORDS` lookup in map-client.tsx (no lat/lng columns needed).

RLS: users can only CRUD their own items.

---

## Map Integration

- Golden dots (`#f59e0b`) for bucketlist items on the map
- Dashed golden lines from homebase to bucketlist destinations
- New "Bucketlist" section in map sidebar (below Upcoming/Completed)
- Each item clickable — flyTo on map
- `+` button in section header to add items (inline form in sidebar)
- Completed items shown dimmed or with checkmark

---

## Dashboard Widget

- Compact card: "Bucketlist — 3/12 done"
- Shows 2-3 recent uncompleted items
- Click navigates to map with item selected

---

## Trip Conversion

- "Plan this trip" button on each bucketlist item in sidebar
- Creates new trip via existing POST /api/travel/trips with destination + title pre-filled
- Sets `trip_id` on the bucketlist item to link them
- When a linked trip status becomes "completed", the bucketlist item is marked completed

---

## Not Building

- No separate /bucketlist page
- No image upload
- No AI suggestions for bucketlist
- No drag-and-drop ordering
- No sharing/social features
