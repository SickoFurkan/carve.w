# Bucketlist Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a travel bucketlist integrated into the map (golden dots + lines) and dashboard (widget), with trip conversion.

**Architecture:** New `bucketlist_items` Supabase table with RLS. Map page receives bucketlist data from server component, renders golden markers/lines alongside trips. Dashboard gets a compact widget. Bucketlist CRUD via API route. "Plan this trip" converts items to trips.

**Tech Stack:** Next.js 15, Supabase, Leaflet, Framer Motion, Tailwind CSS v4

---

### Task 1: Database — Create bucketlist_items table

**Files:**
- Supabase migration (via MCP tool)

**Step 1: Apply migration**

```sql
CREATE TABLE bucketlist_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL DEFAULT 'destination' CHECK (type IN ('destination', 'experience')),
  title text NOT NULL,
  destination text NOT NULL,
  description text,
  completed boolean NOT NULL DEFAULT false,
  trip_id uuid REFERENCES trips(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE bucketlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own bucketlist items"
  ON bucketlist_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_bucketlist_items_user_id ON bucketlist_items(user_id);
```

**Step 2: Verify table exists**

Run a SELECT query to confirm the table was created.

---

### Task 2: API — Bucketlist CRUD route

**Files:**
- Create: `app/api/travel/bucketlist/route.ts`

**Step 1: Create the API route**

```typescript
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const createSchema = z.object({
  type: z.enum(["destination", "experience"]).default("destination"),
  title: z.string().min(1).max(200),
  destination: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
})

// GET — list user's bucketlist items
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data, error } = await supabase
    .from("bucketlist_items")
    .select("id, type, title, destination, description, completed, trip_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST — create a new bucketlist item
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 })

  const { data, error } = await supabase
    .from("bucketlist_items")
    .insert({ user_id: user.id, ...parsed.data })
    .select("id")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

// DELETE — delete a bucketlist item by id
export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const itemId = req.nextUrl.searchParams.get("id")
  if (!itemId) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const { error } = await supabase
    .from("bucketlist_items")
    .delete()
    .eq("id", itemId)
    .eq("user_id", user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

// PATCH — update a bucketlist item (mark completed, link trip)
export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { id, completed, trip_id } = body as { id: string; completed?: boolean; trip_id?: string }
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const updates: Record<string, unknown> = {}
  if (completed !== undefined) updates.completed = completed
  if (trip_id !== undefined) updates.trip_id = trip_id

  const { error } = await supabase
    .from("bucketlist_items")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
```

**Step 2: Verify the route compiles**

Run: `pnpm build --filter` or check for TypeScript errors.

---

### Task 3: Map — Fetch bucketlist data in server component

**Files:**
- Modify: `app/(protected)/dashboard/travel/map/page.tsx`
- Modify: `app/(protected)/dashboard/travel/map/map-client.tsx` (interface only)

**Step 1: Update page.tsx to fetch bucketlist items**

Add after the `tripsWithCoords` mapping and before the return:

```typescript
const { data: bucketlistItems } = await supabase
  .from("bucketlist_items")
  .select("id, type, title, destination, description, completed, trip_id, created_at")
  .eq("user_id", user.id)
  .order("created_at", { ascending: false })
```

Pass to client: `<TravelMapClient trips={tripsWithCoords} homebase={homebase} bucketlist={bucketlistItems || []} />`

**Step 2: Add BucketlistItem interface to map-client.tsx**

```typescript
interface BucketlistItem {
  id: string
  type: string
  title: string
  destination: string
  description: string | null
  completed: boolean
  trip_id: string | null
  created_at: string
}
```

Update `TravelMapProps` to include `bucketlist: BucketlistItem[]`.

---

### Task 4: Map — Render golden dots, lines, and sidebar section

**Files:**
- Modify: `app/(protected)/dashboard/travel/map/map-client.tsx`

**Step 1: Add bucketlist markers and lines in useEffect**

After the trip markers loop, add:

```typescript
const BUCKETLIST_COLOR = "#f59e0b"

bucketlistWithCoords.forEach((item) => {
  if (!item.lat || !item.lng) return
  bounds.extend([item.lat, item.lng])
  hasPoints = true

  // Golden dashed line from homebase
  if (homeCoords) {
    const latlngs = createCurvedLine(homeCoords, [item.lat, item.lng])
    L.polyline(latlngs, {
      color: BUCKETLIST_COLOR,
      weight: 1.5,
      opacity: item.completed ? 0.1 : 0.2,
      dashArray: "4 6",
      smoothFactor: 1,
    }).addTo(map)
  }

  const icon = L.divIcon({
    className: "",
    html: `<div style="width:10px;height:10px;border-radius:50%;background:${BUCKETLIST_COLOR};border:2px solid rgba(0,0,0,0.4);box-shadow:0 0 8px ${BUCKETLIST_COLOR}40;opacity:${item.completed ? 0.4 : 1};"></div>`,
    iconSize: [10, 10],
    iconAnchor: [5, 5],
  })

  const popupContent = `
    <div style="font-family:system-ui;padding:4px 0;">
      <div style="font-size:14px;font-weight:600;color:#f59e0b;">${item.title}</div>
      <div style="font-size:12px;color:#9da6b9;margin-top:2px;">${item.destination}</div>
      ${item.description ? `<div style="font-size:11px;color:#7a8299;margin-top:4px;">${item.description}</div>` : ""}
      <div style="font-size:10px;color:#555d70;margin-top:4px;">${item.completed ? "Completed" : "Bucketlist"}</div>
    </div>
  `

  const marker = L.marker([item.lat, item.lng], { icon })
    .bindPopup(popupContent, { className: "travel-map-popup", closeButton: false })
    .addTo(map)

  markersRef.current.set(`bl-${item.id}`, marker)
})
```

**Step 2: Add bucketlist resolution (same pattern as trips)**

```typescript
const bucketlistResolved = bucketlist.map((item) => {
  const coords = getCityCoords(item.destination)
  return { ...item, lat: coords?.[0] ?? null, lng: coords?.[1] ?? null }
})
const bucketlistWithCoords = bucketlistResolved.filter((b) => b.lat !== null && b.lng !== null)
```

**Step 3: Add flyToBucketlist callback**

```typescript
const flyToBucketlist = useCallback((itemId: string) => {
  const item = bucketlistResolved.find((b) => b.id === itemId)
  if (!item?.lat || !item?.lng || !mapRef.current) return
  setSelectedTripId(`bl-${itemId}`)
  mapRef.current.flyTo([item.lat, item.lng], 8, { duration: 1.2 })
  const marker = markersRef.current.get(`bl-${itemId}`)
  if (marker) setTimeout(() => marker.openPopup(), 600)
}, [bucketlistResolved])
```

**Step 4: Add Bucketlist sidebar section**

Between Completed trips and Empty state, add a "Bucketlist" section with:
- Header with title + "+" button
- List of items (golden dot, title, destination)
- Completed items shown dimmed at bottom
- Each item clickable to flyTo
- "Plan this trip" button on each uncompleted item
- Inline add form (toggled by "+" button): title, destination, type selector

**Step 5: Add inline add form state**

```typescript
const [addingBucketlist, setAddingBucketlist] = useState(false)
const [newBLTitle, setNewBLTitle] = useState("")
const [newBLDestination, setNewBLDestination] = useState("")
const [newBLType, setNewBLType] = useState<"destination" | "experience">("destination")
```

**Step 6: Add handlers for add, delete, plan-this-trip**

```typescript
const addBucketlistItem = async () => {
  if (!newBLTitle.trim() || !newBLDestination.trim()) return
  const res = await fetch("/api/travel/bucketlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: newBLTitle, destination: newBLDestination, type: newBLType }),
  })
  if (res.ok) {
    setNewBLTitle("")
    setNewBLDestination("")
    setAddingBucketlist(false)
    window.location.reload() // simple refresh for now
  }
}

const deleteBucketlistItem = async (id: string) => {
  await fetch(`/api/travel/bucketlist?id=${id}`, { method: "DELETE" })
  window.location.reload()
}

const planBucketlistTrip = async (item: BucketlistItem) => {
  const res = await fetch("/api/travel/trips", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: item.title, destination: item.destination }),
  })
  if (res.ok) {
    const { id: tripId } = await res.json()
    await fetch("/api/travel/bucketlist", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, trip_id: tripId }),
    })
    window.location.href = `/dashboard/travel/${tripId}`
  }
}
```

**Step 7: Update stats overlay**

Add bucketlist count: `<span className="text-sm text-[#f59e0b]">{bucketlist.filter(b => !b.completed).length} bucketlist</span>`

---

### Task 5: Dashboard — Bucketlist widget

**Files:**
- Create: `components/travel/widgets/BucketlistWidget.tsx`
- Modify: `app/(protected)/dashboard/travel/page.tsx` (fetch bucketlist data)
- Modify: `app/(protected)/dashboard/travel/travel-dashboard-client.tsx` (render widget)

**Step 1: Create BucketlistWidget component**

```typescript
"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { TravelCard } from "@/components/travel/shared"

interface BucketlistWidgetProps {
  items: Array<{
    id: string
    title: string
    destination: string
    completed: boolean
  }>
}

export function BucketlistWidget({ items }: BucketlistWidgetProps) {
  const total = items.length
  const completed = items.filter((i) => i.completed).length
  const uncompleted = items.filter((i) => !i.completed).slice(0, 3)

  if (total === 0) return null

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <TravelCard>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Bucketlist</h3>
          <span className="text-xs text-[#f59e0b]">{completed}/{total} done</span>
        </div>
        <div className="space-y-2">
          {uncompleted.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] shrink-0" />
              <span className="text-sm text-[#7a8299] truncate">{item.title}</span>
              <span className="text-xs text-[#555d70] ml-auto shrink-0">{item.destination}</span>
            </div>
          ))}
        </div>
        {total > 3 && (
          <Link
            href="/dashboard/travel/map"
            className="block text-xs text-[#b8d8e8] mt-3 hover:text-[#b8d8e8]/80 transition-colors"
          >
            View all on map →
          </Link>
        )}
      </TravelCard>
    </motion.div>
  )
}
```

**Step 2: Fetch bucketlist in page.tsx**

Add after the allTrips query:

```typescript
const { data: bucketlistItems } = await supabase
  .from("bucketlist_items")
  .select("id, title, destination, completed")
  .eq("user_id", user.id)
  .order("created_at", { ascending: false })
```

Pass `bucketlist={bucketlistItems || []}` to `TravelDashboardClient`.

**Step 3: Add BucketlistWidget to dashboard client**

Import and render `<BucketlistWidget items={bucketlist} />` in the dashboard layout, after the existing widgets.

---

### Task 6: Verify and commit

**Step 1: Test the full flow**

1. Open `/dashboard/travel/map` — verify golden dots appear for bucketlist items
2. Click "+" in sidebar — add a bucketlist item
3. Click the item — verify map flies to destination
4. Click "Plan this trip" — verify trip is created and redirects
5. Open `/dashboard/travel` — verify bucketlist widget shows

**Step 2: Commit**

```bash
git add -A
git commit -m "feat(travel): add bucketlist with map integration and dashboard widget"
```
