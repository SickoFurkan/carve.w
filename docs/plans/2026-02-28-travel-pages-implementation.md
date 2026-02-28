# Travel Pages Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the 4 missing travel pages: Trips, Map, Budget, Settings.

**Architecture:** Each page is a Next.js App Router server component that fetches data from Supabase and passes it to a client component for interactivity. Reuses existing TravelCard, TripCard, TripMap components. No new Supabase tables — all data comes from existing trips, trip_days, trip_activities, trip_accommodations tables. Settings uses a new `travel_preferences` table.

**Tech Stack:** Next.js 15 App Router, Supabase, Tailwind CSS, Framer Motion, Mapbox GL

**Reference:** Design doc at `docs/plans/2026-02-28-travel-pages-design.md`

**Styling reference:** Dark theme — bg `#0c0e14` / `#1c1f27`, text white/`#7a8299`/`#555d70`, accent teal `#b8d8e8`, cards use `TravelCard` component (`rounded-xl p-5 bg-[#1c1f27] border border-white/[0.06]`).

---

### Task 1: Trips Page — Server Component

**Files:**
- Create: `app/(protected)/dashboard/travel/trips/page.tsx`

**Step 1: Create the server page**

```tsx
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TripsPageClient } from "./trips-client"

export default async function TripsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/dashboard/login")

  const { data: trips } = await supabase
    .from("trips")
    .select("id, title, destination, start_date, end_date, total_budget, currency, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return <TripsPageClient trips={trips || []} />
}
```

**Step 2: Verify it compiles (will fail — client component missing)**

Run: `npx tsc --noEmit 2>&1 | grep trips`
Expected: error about missing `./trips-client`

---

### Task 2: Trips Page — Client Component

**Files:**
- Create: `app/(protected)/dashboard/travel/trips/trips-client.tsx`

**Step 1: Create the client component**

```tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { TripCard } from "@/components/travel/widgets/TripCard"
import { TravelCard } from "@/components/travel/shared"
import { cn } from "@/lib/utils"

interface Trip {
  id: string
  title: string
  destination: string
  start_date: string | null
  end_date: string | null
  total_budget: number | null
  currency: string
  status: string
  created_at: string
}

type Tab = "upcoming" | "past" | "all"

export function TripsPageClient({ trips: initialTrips }: { trips: Trip[] }) {
  const [trips, setTrips] = useState(initialTrips)
  const [activeTab, setActiveTab] = useState<Tab>("upcoming")

  const now = new Date().toISOString().split("T")[0]

  const filtered = trips.filter((t) => {
    if (activeTab === "upcoming") return t.status === "planned" || t.status === "active"
    if (activeTab === "past") return t.status === "completed"
    return true
  })

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this trip?")) return
    const res = await fetch(`/api/travel/trips?id=${id}`, { method: "DELETE" })
    if (res.ok) setTrips((prev) => prev.filter((t) => t.id !== id))
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "upcoming", label: "Upcoming" },
    { key: "past", label: "Past" },
    { key: "all", label: "All" },
  ]

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Trips</h1>
          <p className="text-[#7a8299] text-sm mt-0.5">
            {trips.length} {trips.length === 1 ? "trip" : "trips"}
          </p>
        </div>
        <Link
          href="/dashboard/travel/new"
          className="px-4 py-2 text-sm font-medium text-[#b8d8e8] bg-[#b8d8e8]/10 hover:bg-[#b8d8e8]/20 rounded-lg transition-colors"
        >
          Plan a trip
        </Link>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/[0.03] rounded-lg p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
              activeTab === tab.key
                ? "bg-white/[0.08] text-white"
                : "text-[#7a8299] hover:text-white"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Trip list */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((t, idx) => (
            <TripCard
              key={t.id}
              id={t.id}
              title={t.title}
              destination={t.destination}
              startDate={t.start_date}
              endDate={t.end_date}
              totalBudget={t.total_budget}
              currency={t.currency}
              status={t.status}
              index={idx}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <Link href="/dashboard/travel/new">
          <TravelCard className="hover:border-[#b8d8e8]/30 transition-colors cursor-pointer group text-center py-16">
            <div className="text-4xl mb-4 opacity-20">✈</div>
            <h3 className="text-lg font-semibold text-white group-hover:text-[#b8d8e8] transition-colors">
              {activeTab === "past" ? "No past trips yet" : "Plan your first trip"}
            </h3>
            <p className="text-[#7a8299] text-sm mt-1">
              Tell the AI where you want to go and get a complete travel plan
            </p>
          </TravelCard>
        </Link>
      )}
    </div>
  )
}
```

**Step 2: Verify compilation**

Run: `npx tsc --noEmit 2>&1 | grep -i "trips\|travel"`
Expected: no errors

**Step 3: Commit**

```bash
git add app/(protected)/dashboard/travel/trips/
git commit -m "feat(travel): add Trips page with status tabs"
```

---

### Task 3: Map Page — Server Component

**Files:**
- Create: `app/(protected)/dashboard/travel/map/page.tsx`

The map needs trip locations. Since lat/lng lives on `trip_activities`, we fetch the first activity per trip to get the destination coordinates.

**Step 1: Create the server page**

```tsx
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TravelMapClient } from "./map-client"

export default async function MapPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/dashboard/login")

  const { data: trips } = await supabase
    .from("trips")
    .select(`
      id, title, destination, start_date, end_date, total_budget, currency, status,
      trip_days(
        trip_activities(latitude, longitude)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Extract first valid lat/lng per trip as the "pin" location
  const tripsWithCoords = (trips || []).map((trip) => {
    const days = (trip.trip_days as Array<{ trip_activities: Array<{ latitude: number | null; longitude: number | null }> }>) || []
    const activities = days.flatMap((d) => d.trip_activities || [])
    const firstWithCoords = activities.find((a) => a.latitude && a.longitude)

    return {
      id: trip.id,
      title: trip.title,
      destination: trip.destination,
      start_date: trip.start_date,
      end_date: trip.end_date,
      total_budget: trip.total_budget,
      currency: trip.currency,
      status: trip.status,
      latitude: firstWithCoords?.latitude ?? null,
      longitude: firstWithCoords?.longitude ?? null,
    }
  })

  return <TravelMapClient trips={tripsWithCoords} />
}
```

**Step 2: Verify it compiles (will fail — client missing)**

Run: `npx tsc --noEmit 2>&1 | grep map`
Expected: error about missing `./map-client`

---

### Task 4: Map Page — Client Component

**Files:**
- Create: `app/(protected)/dashboard/travel/map/map-client.tsx`

**Step 1: Create the fullscreen map client**

```tsx
"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import "mapbox-gl/dist/mapbox-gl.css"
import type mapboxgl from "mapbox-gl"

interface TripPin {
  id: string
  title: string
  destination: string
  start_date: string | null
  end_date: string | null
  total_budget: number | null
  currency: string
  status: string
  latitude: number | null
  longitude: number | null
}

const STATUS_COLORS: Record<string, string> = {
  planned: "#b8d8e8",
  active: "#10b981",
  completed: "#555d70",
  draft: "#7a8299",
}

export function TravelMapClient({ trips }: { trips: TripPin[] }) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)

  const tripsWithCoords = trips.filter((t) => t.latitude && t.longitude)
  const uniqueCountries = new Set(trips.map((t) => t.destination)).size
  const upcomingCount = trips.filter((t) => t.status === "planned" || t.status === "active").length

  useEffect(() => {
    if (!mapContainer.current) return

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) return

    let map: mapboxgl.Map | undefined

    import("mapbox-gl").then((mod) => {
      mod.default.accessToken = token

      map = new mod.default.Map({
        container: mapContainer.current!,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [10, 30],
        zoom: 2,
      })

      mapRef.current = map

      map.on("load", () => {
        const bounds = new mod.default.LngLatBounds()
        let hasPoints = false

        tripsWithCoords.forEach((trip) => {
          if (!trip.latitude || !trip.longitude) return

          hasPoints = true
          bounds.extend([trip.longitude, trip.latitude])

          const color = STATUS_COLORS[trip.status] || STATUS_COLORS.draft
          const currencySymbol = trip.currency === "EUR" ? "\u20AC" : trip.currency === "USD" ? "$" : trip.currency === "GBP" ? "\u00A3" : trip.currency

          // Marker element
          const el = document.createElement("div")
          el.style.cssText = `width:14px;height:14px;border-radius:50%;background:${color};border:2px solid rgba(0,0,0,0.4);cursor:pointer;transition:transform 0.2s;`
          el.addEventListener("mouseenter", () => { el.style.transform = "scale(1.4)" })
          el.addEventListener("mouseleave", () => { el.style.transform = "scale(1)" })

          // Popup
          const dates = trip.start_date && trip.end_date
            ? `${new Date(trip.start_date).toLocaleDateString()} — ${new Date(trip.end_date).toLocaleDateString()}`
            : ""
          const budgetText = trip.total_budget ? `${currencySymbol}${trip.total_budget.toFixed(0)}` : ""

          const popup = new mod.default.Popup({
            offset: 20,
            closeButton: false,
            className: "travel-map-popup",
          }).setHTML(`
            <div style="font-family:system-ui;padding:4px 0;">
              <div style="font-size:14px;font-weight:600;color:white;">${trip.destination}</div>
              <div style="font-size:12px;color:#9da6b9;margin-top:2px;">${trip.title}</div>
              ${dates ? `<div style="font-size:11px;color:#7a8299;margin-top:4px;">${dates}</div>` : ""}
              ${budgetText ? `<div style="font-size:12px;font-weight:500;color:${color};margin-top:4px;">${budgetText}</div>` : ""}
              <a href="/dashboard/travel/${trip.id}" style="display:inline-block;margin-top:8px;font-size:11px;color:#b8d8e8;text-decoration:none;">View trip →</a>
            </div>
          `)

          new mod.default.Marker({ element: el })
            .setLngLat([trip.longitude, trip.latitude])
            .setPopup(popup)
            .addTo(map!)
        })

        if (hasPoints) {
          map!.fitBounds(bounds, { padding: 80, maxZoom: 6 })
        }
      })
    })

    return () => {
      map?.remove()
      mapRef.current = null
    }
  }, [tripsWithCoords])

  return (
    <div className="h-full w-full relative">
      {/* Stats overlay */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3 px-4 py-2 rounded-xl bg-[#0c0e14]/80 backdrop-blur-sm border border-white/[0.06]">
        <span className="text-sm text-white font-medium">{trips.length} trips</span>
        <span className="w-px h-4 bg-white/[0.08]" />
        <span className="text-sm text-[#7a8299]">{uniqueCountries} destinations</span>
        <span className="w-px h-4 bg-white/[0.08]" />
        <span className="text-sm text-[#b8d8e8]">{upcomingCount} upcoming</span>
      </div>

      {/* Map */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Popup styles */}
      <style jsx global>{`
        .travel-map-popup .mapboxgl-popup-content {
          background: #1c1f27;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 12px 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .travel-map-popup .mapboxgl-popup-tip {
          border-top-color: #1c1f27;
        }
      `}</style>
    </div>
  )
}
```

**Step 2: Verify compilation**

Run: `npx tsc --noEmit 2>&1 | grep -i "map"`
Expected: no errors

**Step 3: Commit**

```bash
git add app/(protected)/dashboard/travel/map/
git commit -m "feat(travel): add Map page with fullscreen Mapbox and trip pins"
```

---

### Task 5: Budget Page — Server Component

**Files:**
- Create: `app/(protected)/dashboard/travel/budget/page.tsx`

**Step 1: Create the server page**

```tsx
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BudgetPageClient } from "./budget-client"

export default async function BudgetPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/dashboard/login")

  const { data: trips } = await supabase
    .from("trips")
    .select(`
      id, title, destination, total_budget, currency, status,
      trip_days(
        trip_activities(estimated_cost, cost_category)
      ),
      trip_accommodations(price_per_night)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  type RawTrip = {
    id: string
    title: string
    destination: string
    total_budget: number | null
    currency: string
    status: string
    trip_days: Array<{
      trip_activities: Array<{
        estimated_cost: number | null
        cost_category: string | null
      }>
    }>
    trip_accommodations: Array<{
      price_per_night: number | null
    }>
  }

  const tripBudgets = ((trips || []) as RawTrip[]).map((trip) => {
    const activities = trip.trip_days.flatMap((d) => d.trip_activities || [])
    const activityCost = activities.reduce((sum, a) => sum + (a.estimated_cost || 0), 0)
    const accNights = trip.trip_days.length || 1
    const accCost = (trip.trip_accommodations?.[0]?.price_per_night || 0) * accNights
    const estimatedTotal = activityCost + accCost

    // Category breakdown
    const categories: Record<string, number> = {}
    activities.forEach((a) => {
      const cat = a.cost_category || "other"
      categories[cat] = (categories[cat] || 0) + (a.estimated_cost || 0)
    })
    if (accCost > 0) categories["accommodation"] = (categories["accommodation"] || 0) + accCost

    return {
      id: trip.id,
      title: trip.title,
      destination: trip.destination,
      totalBudget: trip.total_budget,
      currency: trip.currency,
      status: trip.status,
      estimatedTotal,
      categories,
    }
  })

  return <BudgetPageClient trips={tripBudgets} />
}
```

**Step 2: Verify (will fail — client missing)**

Run: `npx tsc --noEmit 2>&1 | grep budget`

---

### Task 6: Budget Page — Client Component

**Files:**
- Create: `app/(protected)/dashboard/travel/budget/budget-client.tsx`

**Step 1: Create the budget client**

```tsx
"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { TravelCard } from "@/components/travel/shared"

interface TripBudget {
  id: string
  title: string
  destination: string
  totalBudget: number | null
  currency: string
  status: string
  estimatedTotal: number
  categories: Record<string, number>
}

const CATEGORY_COLORS: Record<string, string> = {
  food: "#f59e0b",
  activity: "#b8d8e8",
  transport: "#a78bfa",
  accommodation: "#10b981",
  shopping: "#f472b6",
  other: "#9da6b9",
}

export function BudgetPageClient({ trips }: { trips: TripBudget[] }) {
  const totalSpent = trips.reduce((sum, t) => sum + t.estimatedTotal, 0)
  const totalPlanned = trips
    .filter((t) => t.status === "planned" || t.status === "active")
    .reduce((sum, t) => sum + t.estimatedTotal, 0)

  // Aggregate categories across all trips
  const globalCategories: Record<string, number> = {}
  trips.forEach((t) => {
    Object.entries(t.categories).forEach(([cat, amount]) => {
      globalCategories[cat] = (globalCategories[cat] || 0) + amount
    })
  })
  const categoryEntries = Object.entries(globalCategories).sort(([, a], [, b]) => b - a)
  const maxCategoryAmount = categoryEntries[0]?.[1] || 1

  // Use EUR as default display (most trips use EUR)
  const symbol = "\u20AC"

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-white tracking-tight">Budget</h1>
        <p className="text-[#7a8299] text-sm mt-0.5">Travel spending overview</p>
      </motion.div>

      {/* Stats cards */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <TravelCard>
          <p className="text-xs text-[#555d70] uppercase tracking-wider font-semibold">Total Estimated</p>
          <p className="text-3xl font-bold text-white mt-2 tabular-nums">
            {symbol}{totalSpent.toFixed(0)}
          </p>
          <p className="text-xs text-[#7a8299] mt-1">{trips.length} trips</p>
        </TravelCard>
        <TravelCard>
          <p className="text-xs text-[#555d70] uppercase tracking-wider font-semibold">Upcoming Planned</p>
          <p className="text-3xl font-bold text-[#b8d8e8] mt-2 tabular-nums">
            {symbol}{totalPlanned.toFixed(0)}
          </p>
          <p className="text-xs text-[#7a8299] mt-1">
            {trips.filter((t) => t.status === "planned" || t.status === "active").length} upcoming trips
          </p>
        </TravelCard>
      </motion.div>

      {/* Category breakdown */}
      {categoryEntries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-lg font-semibold text-white mb-4">By Category</h2>
          <TravelCard>
            <div className="space-y-4">
              {categoryEntries.map(([cat, amount]) => (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[cat] || CATEGORY_COLORS.other }}
                      />
                      <span className="text-sm text-[#9da6b9] capitalize">{cat}</span>
                    </div>
                    <span className="text-sm font-medium text-white tabular-nums">
                      {symbol}{amount.toFixed(0)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(amount / maxCategoryAmount) * 100}%`,
                        backgroundColor: CATEGORY_COLORS[cat] || CATEGORY_COLORS.other,
                        opacity: 0.6,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </TravelCard>
        </motion.div>
      )}

      {/* Per-trip breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <h2 className="text-lg font-semibold text-white mb-4">By Trip</h2>
        {trips.length > 0 ? (
          <div className="space-y-3">
            {trips.map((trip) => {
              const budget = trip.totalBudget || trip.estimatedTotal
              const pct = budget > 0 ? Math.min(100, (trip.estimatedTotal / budget) * 100) : 0
              const tripSymbol = trip.currency === "EUR" ? "\u20AC" : trip.currency === "USD" ? "$" : trip.currency === "GBP" ? "\u00A3" : trip.currency

              return (
                <Link key={trip.id} href={`/dashboard/travel/${trip.id}`}>
                  <TravelCard className="hover:border-[#b8d8e8]/20 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-white truncate">{trip.destination}</h3>
                        <p className="text-xs text-[#555d70]">{trip.title}</p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="text-sm font-semibold text-white tabular-nums">
                          {tripSymbol}{trip.estimatedTotal.toFixed(0)}
                        </p>
                        {trip.totalBudget && (
                          <p className="text-xs text-[#555d70]">
                            / {tripSymbol}{trip.totalBudget.toFixed(0)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          pct > 90 ? "bg-red-400/60" : pct > 70 ? "bg-amber-400/50" : "bg-[#b8d8e8]/40"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </TravelCard>
                </Link>
              )
            })}
          </div>
        ) : (
          <TravelCard className="text-center py-12">
            <p className="text-[#555d70] text-sm">No trips yet — plan one to start tracking your budget</p>
          </TravelCard>
        )}
      </motion.div>
    </div>
  )
}
```

**Step 2: Verify compilation**

Run: `npx tsc --noEmit 2>&1 | grep -i "budget"`
Expected: no errors

**Step 3: Commit**

```bash
git add app/(protected)/dashboard/travel/budget/
git commit -m "feat(travel): add Budget page with category breakdown and per-trip costs"
```

---

### Task 7: Settings Page — Supabase Migration

**Files:**
- Migration via Supabase MCP

**Step 1: Create travel_preferences table**

Apply migration `create_travel_preferences` with:

```sql
CREATE TABLE IF NOT EXISTS travel_preferences (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  default_currency text DEFAULT 'EUR' NOT NULL,
  travel_style text DEFAULT 'mid-range' NOT NULL CHECK (travel_style IN ('budget', 'mid-range', 'luxury')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE travel_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" ON travel_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON travel_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON travel_preferences
  FOR UPDATE USING (auth.uid() = user_id);
```

**Step 2: Commit migration note**

This is applied via Supabase MCP — no local file needed.

---

### Task 8: Settings Page — API Route

**Files:**
- Create: `app/api/travel/preferences/route.ts`

**Step 1: Create the preferences API**

```tsx
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/travel/preferences
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data } = await supabase
    .from("travel_preferences")
    .select("default_currency, travel_style")
    .eq("user_id", user.id)
    .single()

  return NextResponse.json(data || { default_currency: "EUR", travel_style: "mid-range" })
}

// PUT /api/travel/preferences
export async function PUT(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { default_currency, travel_style } = body

  const { data, error } = await supabase
    .from("travel_preferences")
    .upsert({
      user_id: user.id,
      default_currency: default_currency || "EUR",
      travel_style: travel_style || "mid-range",
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" })
    .select("default_currency, travel_style")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
```

**Step 2: Commit**

```bash
git add app/api/travel/preferences/
git commit -m "feat(travel): add preferences API route"
```

---

### Task 9: Settings Page — UI

**Files:**
- Create: `app/(protected)/dashboard/travel/settings/page.tsx`

**Step 1: Create the settings page (client component)**

```tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { TravelCard } from "@/components/travel/shared"

const CURRENCIES = ["EUR", "USD", "GBP", "CHF", "JPY", "AUD", "CAD"] as const
const STYLES = [
  { value: "budget", label: "Budget", description: "Hostels, street food, public transport" },
  { value: "mid-range", label: "Mid-range", description: "Hotels, restaurants, mix of transport" },
  { value: "luxury", label: "Luxury", description: "Premium hotels, fine dining, private transport" },
] as const

export default function TravelSettingsPage() {
  const [currency, setCurrency] = useState("EUR")
  const [style, setStyle] = useState("mid-range")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch("/api/travel/preferences")
      .then((r) => r.json())
      .then((data) => {
        if (data.default_currency) setCurrency(data.default_currency)
        if (data.travel_style) setStyle(data.travel_style)
      })
  }, [])

  const save = useCallback(async (newCurrency: string, newStyle: string) => {
    setSaving(true)
    setSaved(false)
    await fetch("/api/travel/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ default_currency: newCurrency, travel_style: newStyle }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [])

  const handleCurrencyChange = (val: string) => {
    setCurrency(val)
    save(val, style)
  }

  const handleStyleChange = (val: string) => {
    setStyle(val)
    save(currency, val)
  }

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-[#7a8299] text-sm mt-0.5">Travel preferences</p>
      </motion.div>

      {/* Currency */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <TravelCard>
          <h3 className="text-sm font-semibold text-white mb-1">Default Currency</h3>
          <p className="text-xs text-[#555d70] mb-4">Used for new trips and budget calculations</p>
          <div className="flex flex-wrap gap-2">
            {CURRENCIES.map((c) => (
              <button
                key={c}
                onClick={() => handleCurrencyChange(c)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  currency === c
                    ? "bg-[#b8d8e8]/20 text-[#b8d8e8]"
                    : "text-[#7a8299] bg-white/[0.04] hover:bg-white/[0.08]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </TravelCard>
      </motion.div>

      {/* Travel style */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <TravelCard>
          <h3 className="text-sm font-semibold text-white mb-1">Travel Style</h3>
          <p className="text-xs text-[#555d70] mb-4">The AI uses this to tailor trip suggestions</p>
          <div className="space-y-2">
            {STYLES.map((s) => (
              <button
                key={s.value}
                onClick={() => handleStyleChange(s.value)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  style === s.value
                    ? "bg-[#b8d8e8]/10 border border-[#b8d8e8]/20"
                    : "bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08]"
                }`}
              >
                <span className={`text-sm font-medium ${style === s.value ? "text-[#b8d8e8]" : "text-white"}`}>
                  {s.label}
                </span>
                <p className="text-xs text-[#555d70] mt-0.5">{s.description}</p>
              </button>
            ))}
          </div>
        </TravelCard>
      </motion.div>

      {/* Save indicator */}
      {(saving || saved) && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-[#7a8299] text-center"
        >
          {saving ? "Saving..." : "Saved"}
        </motion.p>
      )}
    </div>
  )
}
```

**Step 2: Verify compilation**

Run: `npx tsc --noEmit 2>&1 | grep -i "settings"`
Expected: no errors

**Step 3: Commit**

```bash
git add app/(protected)/dashboard/travel/settings/ app/api/travel/preferences/
git commit -m "feat(travel): add Settings page with currency and travel style preferences"
```

---

### Task 10: Final Verification

**Step 1: Full TypeScript check**

Run: `npx tsc --noEmit`
Expected: 0 errors

**Step 2: Dev server check**

Run: `pnpm dev`
Manually verify all 4 pages load:
- `/dashboard/travel/trips`
- `/dashboard/travel/map`
- `/dashboard/travel/budget`
- `/dashboard/travel/settings`

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat(travel): complete all travel section pages (trips, map, budget, settings)"
```
