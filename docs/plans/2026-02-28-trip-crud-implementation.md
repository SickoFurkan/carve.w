# Trip CRUD Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add manual trip creation (modal on /trips) and full inline editing on the trip detail page, all with client state only (no new API routes).

**Architecture:** The CreateTripModal uses the existing POST `/api/travel/trips` endpoint to create a trip in the database, then navigates to the detail page. The detail page loads data from Supabase via server component, then the client component holds everything in `useState<TripPlan>` with mutator functions for editing. Edits are client-state only — no persistence yet. Mutator functions are `async` so they can be swapped for API calls later.

**Tech Stack:** Next.js 15 App Router, React client components, Framer Motion, Tailwind CSS

**Reference:** Design doc at `docs/plans/2026-02-28-trip-crud-design.md`

**Existing files to understand:**
- `lib/ai/travel-schemas.ts` — `TripPlan`, `TripDay`, `TripActivity` types
- `components/travel/shared/TravelCard.tsx` — base card component
- `components/travel/widgets/DayTimeline.tsx` — displays days/activities (has `onActivityClick` callback)
- `app/(protected)/dashboard/travel/trips/trips-client.tsx` — trips list with tabs
- `app/(protected)/dashboard/travel/[id]/trip-detail-client.tsx` — trip detail (currently read-only)

---

### Task 1: CreateTripModal Component

**Files:**
- Create: `components/travel/widgets/CreateTripModal.tsx`

**Step 1: Create the modal component**

```tsx
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TravelCard } from "@/components/travel/shared"

interface CreateTripModalProps {
  open: boolean
  onClose: () => void
  onCreate: (trip: {
    destination: string
    title: string
    start_date: string
    end_date: string
    total_budget: number
    currency: string
  }) => void
}

const CURRENCIES = ["EUR", "USD", "GBP", "CHF", "JPY", "AUD", "CAD"] as const

export function CreateTripModal({ open, onClose, onCreate }: CreateTripModalProps) {
  const [destination, setDestination] = useState("")
  const [title, setTitle] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [budget, setBudget] = useState("")
  const [currency, setCurrency] = useState("EUR")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!destination.trim()) return

    onCreate({
      destination: destination.trim(),
      title: title.trim() || `Trip to ${destination.trim()}`,
      start_date: startDate,
      end_date: endDate,
      total_budget: parseFloat(budget) || 0,
      currency,
    })

    // Reset form
    setDestination("")
    setTitle("")
    setStartDate("")
    setEndDate("")
    setBudget("")
    setCurrency("EUR")
  }

  const inputClass =
    "w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder-[#555d70] focus:outline-none focus:border-[#b8d8e8]/30 transition-colors"

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <TravelCard className="w-full max-w-md" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
              <h2 className="text-lg font-semibold text-white mb-1">Create a trip</h2>
              <p className="text-xs text-[#555d70] mb-5">Fill in the basics — you can edit everything later</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Destination */}
                <div>
                  <label className="block text-xs text-[#7a8299] mb-1.5">Destination *</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Barcelona, Spain"
                    className={inputClass}
                    autoFocus
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs text-[#7a8299] mb-1.5">Trip name</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={destination ? `Trip to ${destination}` : "Summer vacation"}
                    className={inputClass}
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#7a8299] mb-1.5">Start date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#7a8299] mb-1.5">End date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Budget + Currency */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs text-[#7a8299] mb-1.5">Budget</label>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="1500"
                      min="0"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#7a8299] mb-1.5">Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className={inputClass}
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm text-[#7a8299] hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-sm font-medium text-[#0c0e14] bg-[#b8d8e8] hover:bg-[#b8d8e8]/90 rounded-lg transition-colors"
                  >
                    Create trip
                  </button>
                </div>
              </form>
            </TravelCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

**Step 2: Verify compilation**

Run: `npx tsc --noEmit 2>&1 | grep -i "CreateTripModal"`
Expected: no errors (may need to fix TravelCard onClick type — see note below)

**Note:** TravelCard's `onClick` is typed as `() => void`. The modal passes `(e: React.MouseEvent) => e.stopPropagation()` to prevent closing when clicking inside. If this causes a type error, update `TravelCard.tsx` onClick to `((e?: React.MouseEvent) => void)` or use a wrapper div instead.

**Step 3: Commit**

```bash
git add components/travel/widgets/CreateTripModal.tsx
git commit -m "feat(travel): add CreateTripModal component"
```

---

### Task 2: Wire CreateTripModal into Trips Page

**Files:**
- Modify: `app/(protected)/dashboard/travel/trips/trips-client.tsx`

**Step 1: Add modal state, create handler, and replace the "Plan a trip" button**

Replace the entire file with:

```tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { TripCard } from "@/components/travel/widgets/TripCard"
import { CreateTripModal } from "@/components/travel/widgets/CreateTripModal"
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
  const [modalOpen, setModalOpen] = useState(false)
  const router = useRouter()

  const filtered = trips.filter((t) => {
    if (activeTab === "upcoming") return t.status === "planned" || t.status === "active" || t.status === "draft"
    if (activeTab === "past") return t.status === "completed"
    return true
  })

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this trip?")) return
    const res = await fetch(`/api/travel/trips?id=${id}`, { method: "DELETE" })
    if (res.ok) setTrips((prev) => prev.filter((t) => t.id !== id))
  }

  const handleCreate = async (trip: {
    destination: string
    title: string
    start_date: string
    end_date: string
    total_budget: number
    currency: string
  }) => {
    const res = await fetch("/api/travel/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(trip),
    })
    const data = await res.json()
    if (data.id) {
      setModalOpen(false)
      router.push(`/dashboard/travel/${data.id}`)
    }
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
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/travel/new"
            className="px-4 py-2 text-sm font-medium text-[#7a8299] hover:text-white transition-colors"
          >
            Plan with AI
          </Link>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 text-sm font-medium text-[#b8d8e8] bg-[#b8d8e8]/10 hover:bg-[#b8d8e8]/20 rounded-lg transition-colors"
          >
            Create trip
          </button>
        </div>
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
        <TravelCard
          className="cursor-pointer group text-center py-16 hover:border-[#b8d8e8]/30 transition-colors"
          onClick={() => setModalOpen(true)}
        >
          <div className="text-4xl mb-4 opacity-20">✈</div>
          <h3 className="text-lg font-semibold text-white group-hover:text-[#b8d8e8] transition-colors">
            {activeTab === "past" ? "No past trips yet" : "Plan your first trip"}
          </h3>
          <p className="text-[#7a8299] text-sm mt-1">
            Create a trip manually or plan with AI
          </p>
        </TravelCard>
      )}

      {/* Create trip modal */}
      <CreateTripModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  )
}
```

**Step 2: Verify compilation**

Run: `npx tsc --noEmit 2>&1 | grep -i "trips"`
Expected: no errors

**Step 3: Commit**

```bash
git add app/(protected)/dashboard/travel/trips/trips-client.tsx
git commit -m "feat(travel): wire CreateTripModal into trips page"
```

---

### Task 3: ActivityEditForm Component

**Files:**
- Create: `components/travel/widgets/ActivityEditForm.tsx`

**Step 1: Create the expandable activity edit form**

```tsx
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import type { TripActivity } from "@/lib/ai/travel-schemas"

interface ActivityEditFormProps {
  activity: TripActivity
  onSave: (activity: TripActivity) => void
  onDelete: () => void
  onCancel: () => void
  currency?: string
}

const TIME_SLOTS = ["morning", "afternoon", "evening"] as const
const CATEGORIES = ["food", "activity", "transport", "shopping", "other"] as const

export function ActivityEditForm({ activity, onSave, onDelete, onCancel, currency = "EUR" }: ActivityEditFormProps) {
  const [form, setForm] = useState<TripActivity>({ ...activity })

  const currencySymbol = currency === "EUR" ? "\u20AC" : currency === "USD" ? "$" : currency === "GBP" ? "\u00A3" : currency

  const update = <K extends keyof TripActivity>(key: K, value: TripActivity[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const inputClass =
    "w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder-[#555d70] focus:outline-none focus:border-[#b8d8e8]/30 transition-colors"

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="p-4 rounded-xl bg-[#1c1f27] border border-[#b8d8e8]/20 space-y-3">
        {/* Title */}
        <input
          type="text"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="Activity name"
          className={inputClass}
          autoFocus
        />

        {/* Time slot + Category */}
        <div className="grid grid-cols-2 gap-3">
          <select
            value={form.time_slot}
            onChange={(e) => update("time_slot", e.target.value as TripActivity["time_slot"])}
            className={inputClass}
          >
            {TIME_SLOTS.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <select
            value={form.cost_category}
            onChange={(e) => update("cost_category", e.target.value as TripActivity["cost_category"])}
            className={inputClass}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Location */}
        <input
          type="text"
          value={form.location_name}
          onChange={(e) => update("location_name", e.target.value)}
          placeholder="Location name"
          className={inputClass}
        />

        {/* Description */}
        <textarea
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Description (optional)"
          rows={2}
          className={inputClass + " resize-none"}
        />

        {/* Cost + Duration */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#555d70]">{currencySymbol}</span>
            <input
              type="number"
              value={form.estimated_cost || ""}
              onChange={(e) => update("estimated_cost", parseFloat(e.target.value) || 0)}
              placeholder="0"
              min="0"
              className={inputClass + " pl-7"}
            />
          </div>
          <div className="relative">
            <input
              type="number"
              value={form.duration_minutes || ""}
              onChange={(e) => update("duration_minutes", parseInt(e.target.value) || 60)}
              placeholder="60"
              min="15"
              step="15"
              className={inputClass}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#555d70]">min</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={onDelete}
            className="text-xs text-red-400/70 hover:text-red-400 transition-colors"
          >
            Delete activity
          </button>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-3 py-1.5 text-xs text-[#7a8299] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(form)}
              className="px-3 py-1.5 text-xs font-medium text-[#0c0e14] bg-[#b8d8e8] hover:bg-[#b8d8e8]/90 rounded-md transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
```

**Step 2: Verify compilation**

Run: `npx tsc --noEmit 2>&1 | grep -i "ActivityEditForm"`
Expected: no errors

**Step 3: Commit**

```bash
git add components/travel/widgets/ActivityEditForm.tsx
git commit -m "feat(travel): add ActivityEditForm component"
```

---

### Task 4: Rebuild Trip Detail Page with Editing

**Files:**
- Modify: `app/(protected)/dashboard/travel/[id]/trip-detail-client.tsx`

This is the biggest task. We replace the read-only PlanDashboard with an editable layout that has:
- Inline-editable trip header (title, destination, dates, budget)
- Days with add/delete
- Activities with add/edit/delete using ActivityEditForm
- "Replan with AI" side panel stays

**Step 1: Replace trip-detail-client.tsx**

```tsx
"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TravelChat } from "@/components/travel/chat/TravelChat"
import { ActivityEditForm } from "@/components/travel/widgets/ActivityEditForm"
import { TravelCard } from "@/components/travel/shared"
import { cn } from "@/lib/utils"
import type { TripPlan, TripDay, TripActivity } from "@/lib/ai/travel-schemas"

interface TripDetailClientProps {
  trip: {
    id: string
    title: string
    destination: string
    start_date: string | null
    end_date: string | null
    total_budget: number | null
    currency: string
  }
  days: Array<{
    day_number: number
    title: string | null
    trip_activities: Array<{
      time_slot: string
      title: string
      description: string | null
      location_name: string | null
      latitude: number | null
      longitude: number | null
      estimated_cost: number | null
      cost_category: string | null
      duration_minutes: number | null
    }>
  }>
  accommodations: Array<{
    name: string
    price_per_night: number | null
    rating: number | null
    price_tier: string | null
    booking_url: string | null
    latitude: number | null
    longitude: number | null
    distance_to_center: string | null
  }>
}

function toTripPlan(props: TripDetailClientProps): TripPlan {
  return {
    title: props.trip.title,
    destination: props.trip.destination,
    days: props.days.map((d) => ({
      day_number: d.day_number,
      title: d.title || `Day ${d.day_number}`,
      activities: d.trip_activities.map((a) => ({
        time_slot: (a.time_slot || "morning") as TripActivity["time_slot"],
        title: a.title,
        description: a.description || "",
        location_name: a.location_name || "",
        latitude: a.latitude || 0,
        longitude: a.longitude || 0,
        estimated_cost: a.estimated_cost || 0,
        cost_category: (a.cost_category || "other") as TripActivity["cost_category"],
        duration_minutes: a.duration_minutes || 60,
      })),
    })),
    accommodations: props.accommodations.map((a) => ({
      name: a.name,
      price_per_night: a.price_per_night || 0,
      rating: a.rating || 0,
      price_tier: (a.price_tier || "mid-range") as "budget" | "mid-range" | "luxury",
      booking_url: a.booking_url || "#",
      latitude: a.latitude || 0,
      longitude: a.longitude || 0,
      distance_to_center: a.distance_to_center || "",
    })),
    budget_breakdown: { accommodation: 0, food: 0, activities: 0, transport: 0, other: 0, total: 0 },
  }
}

// --- Inline editable text ---
function InlineEdit({
  value,
  onSave,
  className,
  as: Tag = "span",
}: {
  value: string
  onSave: (val: string) => void
  className?: string
  as?: "span" | "h1" | "p"
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  if (editing) {
    return (
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => { onSave(draft); setEditing(false) }}
        onKeyDown={(e) => {
          if (e.key === "Enter") { onSave(draft); setEditing(false) }
          if (e.key === "Escape") { setDraft(value); setEditing(false) }
        }}
        className={cn("bg-transparent border-b border-[#b8d8e8]/30 outline-none", className)}
        autoFocus
      />
    )
  }

  return (
    <Tag
      onClick={() => { setDraft(value); setEditing(true) }}
      className={cn("cursor-pointer hover:text-[#b8d8e8] transition-colors", className)}
      title="Click to edit"
    >
      {value || "Click to set"}
    </Tag>
  )
}

// --- Cost category colors ---
const CATEGORY_COLORS: Record<string, string> = {
  food: "#10b981",
  activity: "#b8d8e8",
  transport: "#f59e0b",
  shopping: "#a78bfa",
  other: "#9da6b9",
}

const TIME_SLOT_ORDER = ["morning", "afternoon", "evening"] as const
const TIME_SLOT_LABELS: Record<string, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
}

export function TripDetailClient(props: TripDetailClientProps) {
  const [plan, setPlan] = useState<TripPlan>(() => toTripPlan(props))
  const [chatOpen, setChatOpen] = useState(false)
  const [activeDay, setActiveDay] = useState(0)
  const [editingActivity, setEditingActivity] = useState<{ dayIdx: number; actIdx: number } | null>(null)
  const [addingToDay, setAddingToDay] = useState<number | null>(null)

  const currency = props.trip.currency
  const currencySymbol = currency === "EUR" ? "\u20AC" : currency === "USD" ? "$" : currency === "GBP" ? "\u00A3" : currency

  // --- Mutator functions (swap for API calls later) ---
  const updateTitle = useCallback(async (title: string) => {
    setPlan((p) => ({ ...p, title }))
  }, [])

  const updateDestination = useCallback(async (destination: string) => {
    setPlan((p) => ({ ...p, destination }))
  }, [])

  const addDay = useCallback(async () => {
    setPlan((p) => ({
      ...p,
      days: [
        ...p.days,
        {
          day_number: p.days.length + 1,
          title: `Day ${p.days.length + 1}`,
          activities: [],
        },
      ],
    }))
  }, [])

  const removeDay = useCallback(async (dayIdx: number) => {
    setPlan((p) => ({
      ...p,
      days: p.days
        .filter((_, i) => i !== dayIdx)
        .map((d, i) => ({ ...d, day_number: i + 1 })),
    }))
    setActiveDay((prev) => Math.max(0, Math.min(prev, plan.days.length - 2)))
  }, [plan.days.length])

  const updateDayTitle = useCallback(async (dayIdx: number, title: string) => {
    setPlan((p) => ({
      ...p,
      days: p.days.map((d, i) => (i === dayIdx ? { ...d, title } : d)),
    }))
  }, [])

  const addActivity = useCallback(async (dayIdx: number, activity: TripActivity) => {
    setPlan((p) => ({
      ...p,
      days: p.days.map((d, i) =>
        i === dayIdx ? { ...d, activities: [...d.activities, activity] } : d
      ),
    }))
    setAddingToDay(null)
  }, [])

  const updateActivity = useCallback(async (dayIdx: number, actIdx: number, activity: TripActivity) => {
    setPlan((p) => ({
      ...p,
      days: p.days.map((d, i) =>
        i === dayIdx
          ? { ...d, activities: d.activities.map((a, j) => (j === actIdx ? activity : a)) }
          : d
      ),
    }))
    setEditingActivity(null)
  }, [])

  const removeActivity = useCallback(async (dayIdx: number, actIdx: number) => {
    setPlan((p) => ({
      ...p,
      days: p.days.map((d, i) =>
        i === dayIdx
          ? { ...d, activities: d.activities.filter((_, j) => j !== actIdx) }
          : d
      ),
    }))
    setEditingActivity(null)
  }, [])

  // --- Computed ---
  const currentDay = plan.days[activeDay]
  const totalEstimated = plan.days.flatMap((d) => d.activities).reduce((s, a) => s + a.estimated_cost, 0)

  const newActivity: TripActivity = {
    time_slot: "morning",
    title: "",
    description: "",
    location_name: "",
    latitude: 0,
    longitude: 0,
    estimated_cost: 0,
    cost_category: "activity",
    duration_minutes: 60,
  }

  return (
    <div className="h-full flex">
      {/* Chat panel */}
      {chatOpen && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 400 }}
          transition={{ duration: 0.3 }}
          className="shrink-0 border-r border-white/[0.06] overflow-hidden bg-[#0c0e14]"
        >
          <div className="w-[400px] h-full">
            <TravelChat tripId={props.trip.id} onPlanGenerated={setPlan} />
          </div>
        </motion.div>
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0 overflow-y-auto p-6 lg:p-10 space-y-6 max-w-5xl">
        {/* AI toggle */}
        <div className="flex justify-end">
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="px-3 py-1.5 text-xs font-medium text-[#b8d8e8] bg-[#b8d8e8]/10 hover:bg-[#b8d8e8]/20 rounded-lg transition-colors"
          >
            {chatOpen ? "Close chat" : "Replan with AI"}
          </button>
        </div>

        {/* Trip header — inline editable */}
        <div>
          <InlineEdit
            value={plan.title}
            onSave={updateTitle}
            as="h1"
            className="text-2xl font-bold text-white tracking-tight block"
          />
          <InlineEdit
            value={plan.destination}
            onSave={updateDestination}
            className="text-[#9da6b9] text-sm mt-1 block"
          />
          <div className="flex items-center gap-4 mt-2 text-xs text-[#555d70]">
            <span>{plan.days.length} days</span>
            {props.trip.total_budget && (
              <span>{currencySymbol}{props.trip.total_budget} budget</span>
            )}
            {totalEstimated > 0 && (
              <span className="text-[#b8d8e8]">{currencySymbol}{totalEstimated.toFixed(0)} estimated</span>
            )}
          </div>
        </div>

        {/* Day tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {plan.days.map((day, idx) => (
            <button
              key={day.day_number}
              onClick={() => setActiveDay(idx)}
              className={cn(
                "shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors group relative",
                activeDay === idx
                  ? "bg-[#b8d8e8]/20 text-[#b8d8e8]"
                  : "text-[#7a8299] hover:text-white hover:bg-white/[0.04]"
              )}
            >
              Day {day.day_number}
              {plan.days.length > 1 && (
                <span
                  onClick={(e) => { e.stopPropagation(); removeDay(idx) }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500/80 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  ×
                </span>
              )}
            </button>
          ))}
          <button
            onClick={addDay}
            className="shrink-0 px-3 py-2 rounded-lg text-sm text-[#555d70] hover:text-[#b8d8e8] hover:bg-white/[0.04] transition-colors"
          >
            + Add day
          </button>
        </div>

        {/* Current day content */}
        {currentDay && (
          <div className="space-y-4">
            {/* Day title */}
            <InlineEdit
              value={currentDay.title}
              onSave={(val) => updateDayTitle(activeDay, val)}
              className="text-lg font-semibold text-white block"
            />

            {/* Activities by time slot */}
            {TIME_SLOT_ORDER.map((slot) => {
              const slotActivities = currentDay.activities
                .map((a, idx) => ({ ...a, _idx: idx }))
                .filter((a) => a.time_slot === slot)

              if (!slotActivities.length && addingToDay !== activeDay) return null

              return (
                <div key={slot}>
                  <p className="text-xs uppercase tracking-wider text-[#555d70] mb-2">
                    {TIME_SLOT_LABELS[slot]}
                  </p>
                  <div className="space-y-2">
                    {slotActivities.map((activity) => {
                      const isEditing =
                        editingActivity?.dayIdx === activeDay &&
                        editingActivity?.actIdx === activity._idx

                      if (isEditing) {
                        return (
                          <ActivityEditForm
                            key={activity._idx}
                            activity={activity}
                            onSave={(a) => updateActivity(activeDay, activity._idx, a)}
                            onDelete={() => removeActivity(activeDay, activity._idx)}
                            onCancel={() => setEditingActivity(null)}
                            currency={currency}
                          />
                        )
                      }

                      return (
                        <motion.div
                          key={activity._idx}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          <TravelCard
                            className="cursor-pointer hover:border-[#b8d8e8]/20 transition-colors"
                            onClick={() => setEditingActivity({ dayIdx: activeDay, actIdx: activity._idx })}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-white truncate">{activity.title}</h4>
                                {activity.location_name && (
                                  <p className="text-xs text-[#7a8299] mt-0.5">{activity.location_name}</p>
                                )}
                                {activity.description && (
                                  <p className="text-xs text-[#555d70] mt-1 line-clamp-2">{activity.description}</p>
                                )}
                              </div>
                              {activity.estimated_cost > 0 && (
                                <span
                                  className="shrink-0 ml-3 text-xs font-medium px-2 py-0.5 rounded-full"
                                  style={{
                                    color: CATEGORY_COLORS[activity.cost_category] || CATEGORY_COLORS.other,
                                    backgroundColor: `${CATEGORY_COLORS[activity.cost_category] || CATEGORY_COLORS.other}15`,
                                  }}
                                >
                                  {currencySymbol}{activity.estimated_cost}
                                </span>
                              )}
                            </div>
                          </TravelCard>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {/* Add activity */}
            {addingToDay === activeDay ? (
              <ActivityEditForm
                activity={newActivity}
                onSave={(a) => addActivity(activeDay, a)}
                onDelete={() => setAddingToDay(null)}
                onCancel={() => setAddingToDay(null)}
                currency={currency}
              />
            ) : (
              <button
                onClick={() => setAddingToDay(activeDay)}
                className="w-full py-3 rounded-xl border border-dashed border-white/[0.08] text-sm text-[#555d70] hover:text-[#b8d8e8] hover:border-[#b8d8e8]/20 transition-colors"
              >
                + Add activity
              </button>
            )}
          </div>
        )}

        {/* Empty state — no days */}
        {plan.days.length === 0 && (
          <TravelCard className="text-center py-12">
            <p className="text-[#555d70] text-sm mb-3">No days planned yet</p>
            <button
              onClick={addDay}
              className="px-4 py-2 text-sm font-medium text-[#b8d8e8] bg-[#b8d8e8]/10 hover:bg-[#b8d8e8]/20 rounded-lg transition-colors"
            >
              Add your first day
            </button>
          </TravelCard>
        )}
      </div>
    </div>
  )
}
```

**Step 2: Verify compilation**

Run: `npx tsc --noEmit 2>&1 | grep -i "trip-detail\|TripDetail"`
Expected: no errors

**Step 3: Commit**

```bash
git add app/(protected)/dashboard/travel/[id]/trip-detail-client.tsx
git commit -m "feat(travel): rebuild trip detail page with inline editing"
```

---

### Task 5: Update TravelCard onClick Type

The `CreateTripModal` and `TripDetailClient` pass events through `onClick` on TravelCard. The current type is `() => void` which doesn't accept `MouseEvent` params.

**Files:**
- Modify: `components/travel/shared/TravelCard.tsx`

**Step 1: Update the onClick type**

Change the `TravelCardProps` interface `onClick` from `() => void` to accept an optional event:

```tsx
import { ReactNode, MouseEvent } from "react"
import { cn } from "@/lib/utils"

interface TravelCardProps {
  children: ReactNode
  className?: string
  onClick?: (e?: MouseEvent<HTMLDivElement>) => void
}

export function TravelCard({ children, className, onClick }: TravelCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl p-5",
        "bg-[#1c1f27]",
        "border border-white/[0.06]",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
```

**Step 2: Verify compilation**

Run: `npx tsc --noEmit`
Expected: 0 errors

**Step 3: Commit**

```bash
git add components/travel/shared/TravelCard.tsx
git commit -m "fix(travel): update TravelCard onClick type to accept MouseEvent"
```

---

### Task 6: Update trips API to accept full trip data on POST

The existing POST `/api/travel/trips` creates a minimal draft. The CreateTripModal sends `destination`, `title`, `start_date`, `end_date`, `total_budget`, `currency`. We need the API to accept and store these fields.

**Files:**
- Modify: `app/api/travel/trips/route.ts`

**Step 1: Read the current route file, then update the POST handler**

Update the POST handler to spread all provided fields into the insert:

The current POST likely does something like:
```ts
.insert({ user_id: user.id, status: "draft" })
```

Change it to:
```ts
const body = await req.json()
const { title, destination, start_date, end_date, total_budget, currency } = body

.insert({
  user_id: user.id,
  title: title || null,
  destination: destination || null,
  start_date: start_date || null,
  end_date: end_date || null,
  total_budget: total_budget || null,
  currency: currency || "EUR",
  status: "planned",
})
```

**Step 2: Verify compilation**

Run: `npx tsc --noEmit 2>&1 | grep -i "route\|trips"`
Expected: no errors

**Step 3: Commit**

```bash
git add app/api/travel/trips/route.ts
git commit -m "feat(travel): accept full trip data on POST /api/travel/trips"
```

---

### Task 7: Final Verification

**Step 1: Full TypeScript check**

Run: `npx tsc --noEmit`
Expected: 0 errors

**Step 2: Verify all pages load**

Start dev server and check:
- `/dashboard/travel/trips` — "Create trip" button opens modal
- `/dashboard/travel/[id]` — inline editing works (title, days, activities)

**Step 3: Commit all remaining changes**

```bash
git add -A
git commit -m "feat(travel): complete trip CRUD with manual creation and inline editing"
```
