# Carve Travel Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an AI-powered travel planning module to the Carve dashboard at `/dashboard/travel/`, alongside existing Health and Money sections.

**Architecture:** Carve Travel integrates into the existing carve.w Next.js app as a new dashboard subsection. It follows the exact same patterns as Carve Money: own layout with gradient, own sidebar navigation, own components directory. The AI chat uses Claude API via Vercel AI SDK for streaming trip generation. Database uses Supabase with RLS, following existing migration patterns.

**Tech Stack:** Next.js 15 (App Router), React 19, Tailwind CSS v4, Supabase (auth + DB), Claude API (Anthropic), Vercel AI SDK, Mapbox GL JS, Framer Motion

---

### Task 1: Navigation & Sidebar Integration

**Files:**
- Create: `lib/navigation/travel-navigation.ts`
- Modify: `components/app/app-sidebar-controller.tsx:38-49` (add travel theme + route detection)
- Modify: `components/app/app-header.tsx:33-37` (add Travel to APP_NAV)
- Modify: `components/app/app-header.tsx:77-82` (update isActive to handle travel routes)
- Modify: `components/icons/sidebar-icons.tsx` (add travel icons)

> **Note:** Do NOT add Travel to `MARKETING_NAV` yet — no marketing page exists. That comes in Task 15.

**Step 1: Create travel navigation config**

Create `lib/navigation/travel-navigation.ts`:

```ts
export const travelNavigationGroups = [
  {
    label: 'CARVE TRAVEL',
    icon: { name: 'GlobeIcon' },
    items: [
      {
        title: "Dashboard",
        href: "/dashboard/travel",
        icon: { name: 'DashboardIcon' },
        description: "Trip overview"
      },
      {
        title: "New Trip",
        href: "/dashboard/travel/new",
        icon: { name: 'PlusIcon' },
        description: "Plan a new trip"
      },
    ]
  },
];
```

**Step 2: Add travel icons to sidebar-icons.tsx**

Add `GlobeIcon`, `PlusIcon`, and `MapPinIcon` to `components/icons/sidebar-icons.tsx`. Add them to the `iconMap`.

```tsx
export const GlobeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

export const MapPinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
```

Add to iconMap:
```ts
GlobeIcon,
PlusIcon,
MapPinIcon,
```

**Step 3: Update sidebar controller**

In `components/app/app-sidebar-controller.tsx`:

Add import:
```ts
import { travelNavigationGroups } from '@/lib/navigation/travel-navigation';
```

Add travel theme to `sectionThemes` (after money):
```ts
travel:  { accent: '#b8d8e8', accentBg: 'rgba(184,216,232,0.06)' },
```

Add travel route detection in `getSectionKey` (before health check):
```ts
if (pathname.startsWith('/dashboard/travel')) return 'travel';
```

Add travel route handling in `getSidebarGroups` (before the `/dashboard` check):
```ts
if (path.startsWith('/dashboard/travel')) {
  return travelNavigationGroups as NavigationGroup[];
}
```

**Step 4: Update app header**

In `components/app/app-header.tsx`:

Update `APP_NAV` only (NOT MARKETING_NAV):
```ts
const APP_NAV = [
  { label: 'Health', href: '/dashboard' },
  { label: 'Money', href: '/dashboard/money' },
  { label: 'Travel', href: '/dashboard/travel' },
  { label: 'Wiki', href: '/' },
] as const;
```

Update `isActive` function to handle travel routes:
```ts
const isActive = (href: string) => {
  const itemPath = stripLocale(href);
  if (itemPath === '/') return path === '/' || path.startsWith('/wiki');
  if (itemPath === '/dashboard') return path === '/dashboard' || (path.startsWith('/dashboard') && !path.startsWith('/dashboard/money') && !path.startsWith('/dashboard/travel'));
  return path === itemPath || path.startsWith(itemPath);
};
```

**Step 5: Commit**

```bash
git add lib/navigation/travel-navigation.ts components/app/app-sidebar-controller.tsx components/app/app-header.tsx components/icons/sidebar-icons.tsx
git commit -m "feat(travel): add navigation and sidebar integration for Carve Travel"
```

---

### Task 2: Travel Layout, Pages & Shared Components

**Files:**
- Create: `app/(protected)/dashboard/travel/layout.tsx`
- Create: `app/(protected)/dashboard/travel/page.tsx`
- Create: `app/(protected)/dashboard/travel/loading.tsx`
- Create: `app/(protected)/dashboard/travel/error.tsx`
- Create: `components/travel/shared/TravelCard.tsx`
- Create: `components/travel/shared/index.ts`

**Step 1: Create TravelCard component**

Create `components/travel/shared/TravelCard.tsx` — follows MoneyCard pattern, includes `onClick` support from the start (used by DayTimeline in Task 9):

```tsx
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface TravelCardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
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

**Step 2: Create shared index**

Create `components/travel/shared/index.ts`:

```ts
export { TravelCard } from "./TravelCard"
```

**Step 3: Create travel layout**

Create `app/(protected)/dashboard/travel/layout.tsx` — follows MoneyLayout pattern with teal gradient:

```tsx
export default function TravelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full overflow-y-auto relative">
      {/* Subtle teal gradient glow for Travel section */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_rgba(184,216,232,0.08)_0%,_transparent_70%)] pointer-events-none" />
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  )
}
```

**Step 4: Create travel dashboard page**

Create `app/(protected)/dashboard/travel/page.tsx` — server component placeholder (will be updated in Task 12 to list saved trips):

```tsx
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function TravelPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/dashboard/login")

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Carve Travel
        </h1>
        <p className="text-[#9da6b9] mt-1">Your AI-powered travel planner</p>
      </div>

      <Link href="/dashboard/travel/new">
        <div className="rounded-xl p-5 bg-[#1c1f27] border border-white/[0.06] hover:border-[#b8d8e8]/30 transition-colors cursor-pointer text-center py-16">
          <div className="text-4xl mb-4">✈</div>
          <h3 className="text-lg font-semibold text-white">
            Plan a new trip
          </h3>
          <p className="text-[#9da6b9] text-sm mt-1">
            Tell the AI where you want to go and get a complete travel plan
          </p>
        </div>
      </Link>
    </div>
  )
}
```

**Step 5: Create loading page**

Create `app/(protected)/dashboard/travel/loading.tsx`:

```tsx
export default function TravelLoading() {
  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto animate-pulse">
      <div className="h-9 w-48 bg-white/[0.06] rounded-lg" />
      <div className="h-5 w-64 bg-white/[0.04] rounded-lg" />
      <div className="h-64 bg-white/[0.03] rounded-xl border border-white/[0.06]" />
    </div>
  )
}
```

**Step 6: Create error page**

Create `app/(protected)/dashboard/travel/error.tsx`:

```tsx
"use client"

export default function TravelError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center">
        <h2 className="text-lg font-semibold text-white mb-2">Something went wrong</h2>
        <p className="text-[#9da6b9] text-sm mb-4">{error.message}</p>
        <button
          onClick={reset}
          className="px-4 py-2 text-sm font-medium text-white bg-white/[0.08] hover:bg-white/[0.12] rounded-lg transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
```

**Step 7: Commit**

```bash
git add app/(protected)/dashboard/travel/ components/travel/
git commit -m "feat(travel): add travel layout, pages, and shared components"
```

---

### Task 3: Database Schema (Supabase Migration)

**Files:**
- Create: `supabase/migrations/20260227000001_create_trips.sql`

**Step 1: Write the migration**

Create `supabase/migrations/20260227000001_create_trips.sql`:

```sql
-- Carve Travel: trips, days, activities, accommodations, conversations

-- ============================================
-- TRIPS
-- ============================================
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  total_budget DECIMAL(10, 2),
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'draft',
  travel_style TEXT,
  accommodation_preference TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT title_not_empty CHECK (char_length(trim(title)) > 0),
  CONSTRAINT destination_not_empty CHECK (char_length(trim(destination)) > 0),
  CONSTRAINT budget_positive CHECK (total_budget IS NULL OR total_budget > 0),
  CONSTRAINT status_valid CHECK (status IN ('draft', 'planned', 'active', 'completed')),
  CONSTRAINT currency_valid CHECK (char_length(currency) = 3),
  CONSTRAINT dates_valid CHECK (start_date IS NULL OR end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_trips_user_id ON public.trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_user_created ON public.trips(user_id, created_at DESC);

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trips"
  ON public.trips FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trips"
  ON public.trips FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trips"
  ON public.trips FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trips"
  ON public.trips FOR DELETE
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS on_trip_updated ON public.trips;
CREATE TRIGGER on_trip_updated
  BEFORE UPDATE ON public.trips
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- TRIP DAYS
-- ============================================
CREATE TABLE IF NOT EXISTS public.trip_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,

  day_number INTEGER NOT NULL,
  date DATE,
  title TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT day_number_positive CHECK (day_number > 0),
  UNIQUE (trip_id, day_number)
);

CREATE INDEX IF NOT EXISTS idx_trip_days_trip_id ON public.trip_days(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_days_order ON public.trip_days(trip_id, day_number);

ALTER TABLE public.trip_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trip days"
  ON public.trip_days FOR SELECT
  USING (trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own trip days"
  ON public.trip_days FOR INSERT
  WITH CHECK (trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own trip days"
  ON public.trip_days FOR UPDATE
  USING (trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid()))
  WITH CHECK (trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own trip days"
  ON public.trip_days FOR DELETE
  USING (trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid()));

-- ============================================
-- TRIP ACTIVITIES
-- ============================================
CREATE TABLE IF NOT EXISTS public.trip_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id UUID NOT NULL REFERENCES public.trip_days(id) ON DELETE CASCADE,

  time_slot TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location_name TEXT,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  estimated_cost DECIMAL(10, 2),
  cost_category TEXT,
  duration_minutes INTEGER,
  order_index INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT time_slot_valid CHECK (time_slot IN ('morning', 'afternoon', 'evening')),
  CONSTRAINT title_not_empty CHECK (char_length(trim(title)) > 0),
  CONSTRAINT cost_positive CHECK (estimated_cost IS NULL OR estimated_cost >= 0),
  CONSTRAINT cost_category_valid CHECK (cost_category IS NULL OR cost_category IN ('food', 'activity', 'transport', 'shopping', 'other')),
  CONSTRAINT order_non_negative CHECK (order_index >= 0)
);

CREATE INDEX IF NOT EXISTS idx_trip_activities_day_id ON public.trip_activities(day_id);
CREATE INDEX IF NOT EXISTS idx_trip_activities_order ON public.trip_activities(day_id, order_index);

ALTER TABLE public.trip_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trip activities"
  ON public.trip_activities FOR SELECT
  USING (day_id IN (
    SELECT td.id FROM public.trip_days td
    JOIN public.trips t ON td.trip_id = t.id
    WHERE t.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own trip activities"
  ON public.trip_activities FOR INSERT
  WITH CHECK (day_id IN (
    SELECT td.id FROM public.trip_days td
    JOIN public.trips t ON td.trip_id = t.id
    WHERE t.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own trip activities"
  ON public.trip_activities FOR UPDATE
  USING (day_id IN (
    SELECT td.id FROM public.trip_days td
    JOIN public.trips t ON td.trip_id = t.id
    WHERE t.user_id = auth.uid()
  ))
  WITH CHECK (day_id IN (
    SELECT td.id FROM public.trip_days td
    JOIN public.trips t ON td.trip_id = t.id
    WHERE t.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own trip activities"
  ON public.trip_activities FOR DELETE
  USING (day_id IN (
    SELECT td.id FROM public.trip_days td
    JOIN public.trips t ON td.trip_id = t.id
    WHERE t.user_id = auth.uid()
  ));

-- ============================================
-- TRIP ACCOMMODATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS public.trip_accommodations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  price_per_night DECIMAL(10, 2),
  currency TEXT NOT NULL DEFAULT 'EUR',
  rating DECIMAL(2, 1),
  price_tier TEXT,
  booking_url TEXT,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  distance_to_center TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT acc_name_not_empty CHECK (char_length(trim(name)) > 0),
  CONSTRAINT price_positive CHECK (price_per_night IS NULL OR price_per_night > 0),
  CONSTRAINT rating_valid CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5)),
  CONSTRAINT price_tier_valid CHECK (price_tier IS NULL OR price_tier IN ('budget', 'mid-range', 'luxury'))
);

CREATE INDEX IF NOT EXISTS idx_trip_accommodations_trip_id ON public.trip_accommodations(trip_id);

ALTER TABLE public.trip_accommodations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trip accommodations"
  ON public.trip_accommodations FOR SELECT
  USING (trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own trip accommodations"
  ON public.trip_accommodations FOR INSERT
  WITH CHECK (trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own trip accommodations"
  ON public.trip_accommodations FOR UPDATE
  USING (trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid()))
  WITH CHECK (trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own trip accommodations"
  ON public.trip_accommodations FOR DELETE
  USING (trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid()));

-- ============================================
-- TRIP CONVERSATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS public.trip_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,

  role TEXT NOT NULL,
  content TEXT NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT role_valid CHECK (role IN ('user', 'assistant')),
  CONSTRAINT content_not_empty CHECK (char_length(trim(content)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_trip_conversations_trip_id ON public.trip_conversations(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_conversations_order ON public.trip_conversations(trip_id, created_at);

ALTER TABLE public.trip_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trip conversations"
  ON public.trip_conversations FOR SELECT
  USING (trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own trip conversations"
  ON public.trip_conversations FOR INSERT
  WITH CHECK (trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own trip conversations"
  ON public.trip_conversations FOR DELETE
  USING (trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid()));

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE public.trips IS 'Travel plans created by users via AI';
COMMENT ON TABLE public.trip_days IS 'Individual days within a trip plan';
COMMENT ON TABLE public.trip_activities IS 'Activities/events scheduled for each day';
COMMENT ON TABLE public.trip_accommodations IS 'Accommodation suggestions for a trip';
COMMENT ON TABLE public.trip_conversations IS 'Chat history between user and AI for trip planning';
```

**Step 2: Commit**

```bash
git add supabase/migrations/20260227000001_create_trips.sql
git commit -m "feat(travel): add database schema for trips, days, activities, accommodations, conversations"
```

---

### Task 4: Install Dependencies (AI SDK, Mapbox)

**Step 1: Install packages**

```bash
pnpm add ai @ai-sdk/anthropic mapbox-gl
pnpm add -D @types/mapbox-gl
```

**Step 2: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore(travel): add AI SDK, Anthropic provider, and Mapbox GL dependencies"
```

---

### Task 5: AI System Prompts & Schemas

**Files:**
- Create: `lib/ai/travel-prompts.ts`
- Create: `lib/ai/travel-schemas.ts`

**Step 1: Create structured output schemas**

Create `lib/ai/travel-schemas.ts`:

```ts
import { z } from "zod"

export const activitySchema = z.object({
  time_slot: z.enum(["morning", "afternoon", "evening"]),
  title: z.string(),
  description: z.string(),
  location_name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  estimated_cost: z.number(),
  cost_category: z.enum(["food", "activity", "transport", "shopping", "other"]),
  duration_minutes: z.number(),
})

export const daySchema = z.object({
  day_number: z.number(),
  title: z.string(),
  activities: z.array(activitySchema),
})

export const accommodationSchema = z.object({
  name: z.string(),
  price_per_night: z.number(),
  rating: z.number(),
  price_tier: z.enum(["budget", "mid-range", "luxury"]),
  booking_url: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  distance_to_center: z.string(),
})

export const tripPlanSchema = z.object({
  title: z.string(),
  destination: z.string(),
  days: z.array(daySchema),
  accommodations: z.array(accommodationSchema),
  budget_breakdown: z.object({
    accommodation: z.number(),
    food: z.number(),
    activities: z.number(),
    transport: z.number(),
    other: z.number(),
    total: z.number(),
  }),
})

export type TripPlan = z.infer<typeof tripPlanSchema>
export type TripDay = z.infer<typeof daySchema>
export type TripActivity = z.infer<typeof activitySchema>
export type TripAccommodation = z.infer<typeof accommodationSchema>
```

**Step 2: Create system prompts**

Create `lib/ai/travel-prompts.ts`:

```ts
export const TRAVEL_SYSTEM_PROMPT = `You are Carve Travel, an expert AI travel planner for solo travelers. You help create detailed, practical travel plans.

Your personality: friendly, knowledgeable, concise. You speak like a well-traveled friend, not a generic chatbot.

CONVERSATION FLOW:
1. User describes their trip idea (destination, duration, budget)
2. You ask UP TO 3 follow-up questions (one at a time):
   - Travel style (relaxed/adventurous/cultural/mix)
   - Accommodation preference (hostel/budget hotel/mid-range/luxury)
   - Must-sees or must-avoids
3. Once you have enough context, generate the full trip plan

IMPORTANT RULES:
- Always respond in the same language the user writes in
- Keep follow-up questions short and specific
- When generating a plan, use the generate_trip_plan tool
- Be realistic about costs — use actual price ranges for the destination
- Include a mix of popular and off-the-beaten-path suggestions
- Account for travel time between locations
- Suggest activities appropriate for solo travelers
- Include practical tips (best time to visit, how to get there)

BUDGET GUIDELINES:
- Break down costs into: accommodation, food, activities, transport, other
- Prices should reflect the destination's actual cost of living
- Account for the accommodation preference when estimating costs
- The budget_breakdown.accommodation should reflect the cost of ONE accommodation option (the mid-range suggestion) multiplied by the number of nights`

export const REPLAN_SYSTEM_PROMPT = `You are Carve Travel. The user has an existing trip plan and wants to modify part of it.

RULES:
- Only modify the specific day or activity the user mentions
- Keep the rest of the plan intact
- Respond in the same language the user writes in
- Use the generate_trip_plan tool with the COMPLETE plan (all days), with your modifications applied
- Explain briefly what you changed and why`
```

**Step 3: Commit**

```bash
git add lib/ai/travel-schemas.ts lib/ai/travel-prompts.ts
git commit -m "feat(travel): add AI system prompts and structured output schemas"
```

---

### Task 6: AI Chat API Route (Streaming) + saveTripPlan Helper

**Files:**
- Create: `lib/ai/save-trip-plan.ts`
- Create: `app/api/travel/chat/route.ts`

> **Review fix [C4, C5, I1, I2, I7]:** saveTripPlan extracted to shared helper (reused by replan route). Includes error handling. Chat route validates messages input. Conversations are saved to trip_conversations table.

**Step 1: Create shared saveTripPlan helper**

Create `lib/ai/save-trip-plan.ts`:

```ts
import type { TripPlan } from "@/lib/ai/travel-schemas"

type SupabaseClient = Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>

export async function saveTripPlan(
  supabase: SupabaseClient,
  tripId: string,
  plan: TripPlan
) {
  // Update trip metadata
  const { error: updateError } = await supabase
    .from("trips")
    .update({
      title: plan.title,
      destination: plan.destination,
      total_budget: plan.budget_breakdown.total,
      status: "planned",
    })
    .eq("id", tripId)

  if (updateError) {
    console.error("Failed to update trip:", updateError)
    throw new Error("Failed to save trip plan")
  }

  // Delete existing days/activities for this trip (for replanning)
  await supabase.from("trip_days").delete().eq("trip_id", tripId)
  await supabase.from("trip_accommodations").delete().eq("trip_id", tripId)

  // Insert days and activities
  for (const day of plan.days) {
    const { data: dayRow, error: dayError } = await supabase
      .from("trip_days")
      .insert({
        trip_id: tripId,
        day_number: day.day_number,
        title: day.title,
      })
      .select("id")
      .single()

    if (dayError || !dayRow) {
      console.error("Failed to insert day:", dayError)
      continue
    }

    if (day.activities.length > 0) {
      const activities = day.activities.map((act, idx) => ({
        day_id: dayRow.id,
        time_slot: act.time_slot,
        title: act.title,
        description: act.description,
        location_name: act.location_name,
        latitude: act.latitude,
        longitude: act.longitude,
        estimated_cost: act.estimated_cost,
        cost_category: act.cost_category,
        duration_minutes: act.duration_minutes,
        order_index: idx,
      }))

      const { error: actError } = await supabase.from("trip_activities").insert(activities)
      if (actError) console.error("Failed to insert activities:", actError)
    }
  }

  // Insert accommodations
  if (plan.accommodations.length > 0) {
    const accommodations = plan.accommodations.map((acc) => ({
      trip_id: tripId,
      name: acc.name,
      price_per_night: acc.price_per_night,
      rating: acc.rating,
      price_tier: acc.price_tier,
      booking_url: acc.booking_url,
      latitude: acc.latitude,
      longitude: acc.longitude,
      distance_to_center: acc.distance_to_center,
    }))

    const { error: accError } = await supabase.from("trip_accommodations").insert(accommodations)
    if (accError) console.error("Failed to insert accommodations:", accError)
  }
}

export async function saveConversation(
  supabase: SupabaseClient,
  tripId: string,
  messages: Array<{ role: string; content: string }>
) {
  const toInsert = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .filter((m) => m.content && m.content.trim().length > 0)
    .map((m) => ({
      trip_id: tripId,
      role: m.role,
      content: m.content,
    }))

  if (toInsert.length > 0) {
    // Delete existing conversations for this trip first (overwrite)
    await supabase.from("trip_conversations").delete().eq("trip_id", tripId)
    await supabase.from("trip_conversations").insert(toInsert)
  }
}
```

**Step 2: Create the streaming chat endpoint**

Create `app/api/travel/chat/route.ts`:

```ts
import { streamText, tool } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { createClient } from "@/lib/supabase/server"
import { TRAVEL_SYSTEM_PROMPT } from "@/lib/ai/travel-prompts"
import { tripPlanSchema } from "@/lib/ai/travel-schemas"
import { saveTripPlan, saveConversation } from "@/lib/ai/save-trip-plan"
import { z } from "zod"

export const maxDuration = 60

const requestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string(),
  })).min(1).max(50),
  tripId: z.string().uuid().optional(),
})

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const body = await req.json()
  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return new Response("Invalid request body", { status: 400 })
  }

  const { messages, tripId } = parsed.data

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: TRAVEL_SYSTEM_PROMPT,
    messages,
    tools: {
      generate_trip_plan: tool({
        description: "Generate a complete trip plan with daily activities, accommodations, and budget breakdown. Call this when you have enough information to create the plan.",
        parameters: tripPlanSchema,
        execute: async (plan) => {
          if (tripId) {
            await saveTripPlan(supabase, tripId, plan)
            await saveConversation(supabase, tripId, messages)
          }
          return plan
        },
      }),
    },
    maxSteps: 2,
  })

  return result.toDataStreamResponse()
}
```

**Step 3: Commit**

```bash
git add lib/ai/save-trip-plan.ts app/api/travel/chat/route.ts
git commit -m "feat(travel): add streaming AI chat API route with trip plan persistence"
```

---

### Task 7: Trips CRUD API Route

**Files:**
- Create: `app/api/travel/trips/route.ts`

> **Review fix [I3, M8]:** Added Zod input validation and DELETE support.

**Step 1: Create trips CRUD endpoint**

Create `app/api/travel/trips/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const createTripSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  destination: z.string().min(1).max(200).optional(),
})

// GET /api/travel/trips — list user's trips
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: trips, error } = await supabase
    .from("trips")
    .select("id, title, destination, start_date, end_date, total_budget, currency, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(trips)
}

// POST /api/travel/trips — create a new trip (draft)
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = createTripSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const { title, destination } = parsed.data

  const { data: trip, error } = await supabase
    .from("trips")
    .insert({
      user_id: user.id,
      title: title || "New Trip",
      destination: destination || "TBD",
      status: "draft",
    })
    .select("id")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(trip, { status: 201 })
}

// DELETE /api/travel/trips — delete a trip by id (query param)
export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const tripId = req.nextUrl.searchParams.get("id")
  if (!tripId) {
    return NextResponse.json({ error: "Missing trip id" }, { status: 400 })
  }

  const { error } = await supabase
    .from("trips")
    .delete()
    .eq("id", tripId)
    .eq("user_id", user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
```

**Step 2: Commit**

```bash
git add app/api/travel/trips/route.ts
git commit -m "feat(travel): add trips CRUD API route with input validation"
```

---

### Task 8: Chat Interface Components

**Files:**
- Create: `components/travel/chat/ChatMessage.tsx`
- Create: `components/travel/chat/ChatInput.tsx`
- Create: `components/travel/chat/TravelChat.tsx`

> **Review fix [C5]:** TravelChat now accepts `tripId` and creates a draft trip via API when page loads if no tripId is provided. The `onTripCreated` callback passes the new tripId back to the parent.

**Step 1: Create ChatMessage component**

Create `components/travel/chat/ChatMessage.tsx`:

```tsx
"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ChatMessageProps {
  role: "user" | "assistant"
  content: string
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex",
        role === "user" ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          role === "user"
            ? "bg-[#b8d8e8]/20 text-white"
            : "bg-white/[0.04] text-[#e2e8f0] border border-white/[0.06]"
        )}
      >
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </motion.div>
  )
}
```

**Step 2: Create ChatInput component**

Create `components/travel/chat/ChatInput.tsx`:

```tsx
"use client"

import { useState, useRef, useEffect } from "react"

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({ onSend, disabled, placeholder = "Describe your dream trip..." }: ChatInputProps) {
  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [input])

  const handleSubmit = () => {
    const trimmed = input.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setInput("")
  }

  return (
    <div className="border-t border-white/[0.06] p-4">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-[#555d70] focus:outline-none focus:border-[#b8d8e8]/30 transition-colors"
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || !input.trim()}
          className="shrink-0 h-10 w-10 rounded-xl bg-[#b8d8e8]/20 hover:bg-[#b8d8e8]/30 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          <svg className="w-4 h-4 text-[#b8d8e8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  )
}
```

**Step 3: Create TravelChat component**

Create `components/travel/chat/TravelChat.tsx`:

```tsx
"use client"

import { useChat } from "ai/react"
import { useEffect, useRef, useState } from "react"
import { ChatMessage } from "./ChatMessage"
import { ChatInput } from "./ChatInput"
import type { TripPlan } from "@/lib/ai/travel-schemas"

interface TravelChatProps {
  tripId?: string
  onPlanGenerated?: (plan: TripPlan) => void
  onTripCreated?: (tripId: string) => void
}

export function TravelChat({ tripId: initialTripId, onPlanGenerated, onTripCreated }: TravelChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [tripId, setTripId] = useState(initialTripId)

  // Create a draft trip if none provided
  useEffect(() => {
    if (tripId) return
    fetch("/api/travel/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.id) {
          setTripId(data.id)
          onTripCreated?.(data.id)
        }
      })
      .catch(console.error)
  }, [tripId, onTripCreated])

  const { messages, append, isLoading } = useChat({
    api: "/api/travel/chat",
    body: { tripId },
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: "Where would you like to go? Tell me about your dream trip — destination, how many days, and your budget.",
      },
    ],
    onToolCall({ toolCall }) {
      if (toolCall.toolName === "generate_trip_plan" && onPlanGenerated) {
        onPlanGenerated(toolCall.args as unknown as TripPlan)
      }
    },
  })

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = (content: string) => {
    append({ role: "user", content })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <h2 className="text-sm font-semibold text-white">Trip Planner</h2>
        <p className="text-xs text-[#555d70]">AI-powered travel planning</p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            role={message.role as "user" | "assistant"}
            content={message.content}
          />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl px-4 py-3">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#b8d8e8]/40 animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#b8d8e8]/40 animate-pulse [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#b8d8e8]/40 animate-pulse [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <ChatInput onSend={handleSend} disabled={isLoading || !tripId} />
    </div>
  )
}
```

**Step 4: Commit**

```bash
git add components/travel/chat/
git commit -m "feat(travel): add chat interface components with auto draft trip creation"
```

---

### Task 9: Plan Dashboard Components

**Files:**
- Create: `components/travel/widgets/DayTimeline.tsx`
- Create: `components/travel/widgets/BudgetOverview.tsx`
- Create: `components/travel/widgets/AccommodationCard.tsx`
- Create: `components/travel/widgets/TripMap.tsx`

> **Review fix [C2, C3, M2, M5, I5]:** TripMap uses a stored module ref instead of repeated dynamic imports. Proper cleanup on unmount. Mapbox CSS imported. Currency passed through to budget display.

**Step 1: Create DayTimeline component**

Create `components/travel/widgets/DayTimeline.tsx`:

```tsx
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { TravelCard } from "@/components/travel/shared"
import type { TripDay } from "@/lib/ai/travel-schemas"

interface DayTimelineProps {
  days: TripDay[]
  currency?: string
  onActivityClick?: (dayIndex: number, activityIndex: number) => void
}

const TIME_SLOT_LABELS: Record<string, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
}

const COST_CATEGORY_COLORS: Record<string, string> = {
  food: "#10b981",
  activity: "#b8d8e8",
  transport: "#f59e0b",
  shopping: "#a78bfa",
  other: "#9da6b9",
}

export function DayTimeline({ days, currency = "EUR", onActivityClick }: DayTimelineProps) {
  const [activeDay, setActiveDay] = useState(0)
  const currencySymbol = currency === "EUR" ? "\u20AC" : currency === "USD" ? "$" : currency === "GBP" ? "\u00A3" : currency

  if (!days.length) return null

  const currentDay = days[activeDay]

  return (
    <div className="space-y-4">
      {/* Day tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {days.map((day, idx) => (
          <button
            key={day.day_number}
            onClick={() => setActiveDay(idx)}
            className={cn(
              "shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeDay === idx
                ? "bg-[#b8d8e8]/20 text-[#b8d8e8]"
                : "text-[#7a8299] hover:text-white hover:bg-white/[0.04]"
            )}
          >
            Day {day.day_number}
          </button>
        ))}
      </div>

      {/* Day title */}
      <h3 className="text-lg font-semibold text-white">{currentDay.title}</h3>

      {/* Activities timeline */}
      <div className="space-y-3">
        {(["morning", "afternoon", "evening"] as const).map((slot) => {
          const slotActivities = currentDay.activities.filter(
            (a) => a.time_slot === slot
          )
          if (!slotActivities.length) return null

          return (
            <div key={slot}>
              <p className="text-xs uppercase tracking-wider text-[#555d70] mb-2">
                {TIME_SLOT_LABELS[slot]}
              </p>
              <div className="space-y-2">
                {slotActivities.map((activity, idx) => (
                  <motion.div
                    key={`${slot}-${idx}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <TravelCard
                      className="cursor-pointer hover:border-[#b8d8e8]/20 transition-colors"
                      onClick={() => onActivityClick?.(activeDay, idx)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white truncate">
                            {activity.title}
                          </h4>
                          <p className="text-xs text-[#7a8299] mt-0.5">
                            {activity.location_name}
                          </p>
                          {activity.description && (
                            <p className="text-xs text-[#555d70] mt-1 line-clamp-2">
                              {activity.description}
                            </p>
                          )}
                        </div>
                        {activity.estimated_cost > 0 && (
                          <span
                            className="shrink-0 ml-3 text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{
                              color: COST_CATEGORY_COLORS[activity.cost_category] || COST_CATEGORY_COLORS.other,
                              backgroundColor: `${COST_CATEGORY_COLORS[activity.cost_category] || COST_CATEGORY_COLORS.other}15`,
                            }}
                          >
                            {currencySymbol}{activity.estimated_cost}
                          </span>
                        )}
                      </div>
                    </TravelCard>
                  </motion.div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

**Step 2: Create BudgetOverview component**

Create `components/travel/widgets/BudgetOverview.tsx`:

```tsx
"use client"

import { TravelCard } from "@/components/travel/shared"

interface BudgetBreakdown {
  accommodation: number
  food: number
  activities: number
  transport: number
  other: number
  total: number
}

interface BudgetOverviewProps {
  budget: BudgetBreakdown
  totalBudget?: number
  currency?: string
}

const CATEGORIES = [
  { key: "accommodation", label: "Accommodation", color: "#b8d8e8" },
  { key: "food", label: "Food", color: "#10b981" },
  { key: "activities", label: "Activities", color: "#a78bfa" },
  { key: "transport", label: "Transport", color: "#f59e0b" },
  { key: "other", label: "Other", color: "#9da6b9" },
] as const

export function BudgetOverview({ budget, totalBudget, currency = "EUR" }: BudgetOverviewProps) {
  const limit = totalBudget || budget.total
  const overBudget = totalBudget ? budget.total > totalBudget : false
  const currencySymbol = currency === "EUR" ? "\u20AC" : currency === "USD" ? "$" : currency === "GBP" ? "\u00A3" : currency

  return (
    <TravelCard>
      <h3 className="text-sm font-semibold text-white mb-4">Budget</h3>

      {/* Total with progress bar */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-2xl font-bold text-white">
            {currencySymbol}{budget.total.toFixed(0)}
          </span>
          {totalBudget && (
            <span className="text-sm text-[#7a8299]">
              / {currencySymbol}{totalBudget.toFixed(0)}
            </span>
          )}
        </div>
        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min((budget.total / limit) * 100, 100)}%`,
              backgroundColor: overBudget ? "#ef4444" : "#b8d8e8",
            }}
          />
        </div>
        {overBudget && (
          <p className="text-xs text-red-400 mt-1">
            {currencySymbol}{(budget.total - totalBudget!).toFixed(0)} over budget
          </p>
        )}
      </div>

      {/* Category breakdown */}
      <div className="space-y-2">
        {CATEGORIES.map(({ key, label, color }) => {
          const value = budget[key]
          if (value <= 0) return null
          const pct = budget.total > 0 ? (value / budget.total) * 100 : 0

          return (
            <div key={key} className="flex items-center gap-3">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-[#7a8299] flex-1">{label}</span>
              <span className="text-xs font-medium text-white">
                {currencySymbol}{value.toFixed(0)}
              </span>
              <span className="text-xs text-[#555d70] w-8 text-right">
                {pct.toFixed(0)}%
              </span>
            </div>
          )
        })}
      </div>
    </TravelCard>
  )
}
```

**Step 3: Create AccommodationCard component**

Create `components/travel/widgets/AccommodationCard.tsx`:

```tsx
"use client"

import { TravelCard } from "@/components/travel/shared"
import type { TripAccommodation } from "@/lib/ai/travel-schemas"

interface AccommodationCardProps {
  accommodations: TripAccommodation[]
  currency?: string
}

const TIER_LABELS: Record<string, string> = {
  budget: "Budget",
  "mid-range": "Mid-range",
  luxury: "Luxury",
}

export function AccommodationCard({ accommodations, currency = "EUR" }: AccommodationCardProps) {
  if (!accommodations.length) return null
  const currencySymbol = currency === "EUR" ? "\u20AC" : currency === "USD" ? "$" : currency === "GBP" ? "\u00A3" : currency

  return (
    <TravelCard>
      <h3 className="text-sm font-semibold text-white mb-3">Accommodations</h3>
      <div className="space-y-3">
        {accommodations.map((acc, idx) => (
          <a
            key={idx}
            href={acc.booking_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:border-[#b8d8e8]/20 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-white truncate">
                  {acc.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-[#b8d8e8]">
                    {TIER_LABELS[acc.price_tier] || acc.price_tier}
                  </span>
                  {acc.rating > 0 && (
                    <span className="text-xs text-[#7a8299]">
                      ★ {acc.rating.toFixed(1)}
                    </span>
                  )}
                  {acc.distance_to_center && (
                    <span className="text-xs text-[#555d70]">
                      {acc.distance_to_center}
                    </span>
                  )}
                </div>
              </div>
              <div className="shrink-0 ml-3 text-right">
                <p className="text-sm font-semibold text-white">
                  {currencySymbol}{acc.price_per_night}
                </p>
                <p className="text-xs text-[#555d70]">/ night</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </TravelCard>
  )
}
```

**Step 4: Create TripMap component**

Create `components/travel/widgets/TripMap.tsx`:

```tsx
"use client"

import { useEffect, useRef } from "react"
import "mapbox-gl/dist/mapbox-gl.css"
import type { TripDay } from "@/lib/ai/travel-schemas"
import type mapboxgl from "mapbox-gl"

interface TripMapProps {
  days: TripDay[]
  activeDay?: number
}

const DAY_COLORS = [
  "#b8d8e8", "#10b981", "#f59e0b", "#a78bfa",
  "#f472b6", "#fb923c", "#34d399", "#818cf8",
]

export function TripMap({ days, activeDay }: TripMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const mapboxModule = useRef<typeof import("mapbox-gl") | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])

  // Initialize map once
  useEffect(() => {
    if (!mapContainer.current) return

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) return

    let map: mapboxgl.Map | undefined

    import("mapbox-gl").then((mod) => {
      mapboxModule.current = mod
      mod.default.accessToken = token

      map = new mod.default.Map({
        container: mapContainer.current!,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [0, 20],
        zoom: 2,
      })

      mapRef.current = map
    })

    return () => {
      map?.remove()
      mapRef.current = null
      mapboxModule.current = null
    }
  }, [])

  // Update markers when days or activeDay changes
  useEffect(() => {
    const map = mapRef.current
    const mod = mapboxModule.current
    if (!map || !mod) return

    const updateMarkers = () => {
      // Remove existing markers
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []

      const bounds = new mod.default.LngLatBounds()
      let hasPoints = false

      const daysToShow = activeDay !== undefined ? [days[activeDay]] : days

      daysToShow.forEach((day, dayIdx) => {
        const actualDayIdx = activeDay !== undefined ? activeDay : dayIdx
        const color = DAY_COLORS[actualDayIdx % DAY_COLORS.length]

        day.activities.forEach((activity) => {
          if (!activity.latitude || !activity.longitude) return

          hasPoints = true
          bounds.extend([activity.longitude, activity.latitude])

          const el = document.createElement("div")
          el.style.cssText = `width:12px;height:12px;border-radius:50%;background:${color};border:2px solid rgba(0,0,0,0.3);cursor:pointer;`

          const marker = new mod.default.Marker({ element: el })
            .setLngLat([activity.longitude, activity.latitude])
            .addTo(map)

          markersRef.current.push(marker)
        })
      })

      if (hasPoints) {
        map.fitBounds(bounds, { padding: 50, maxZoom: 14 })
      }
    }

    if (map.isStyleLoaded()) {
      updateMarkers()
    } else {
      map.on("load", updateMarkers)
    }
  }, [days, activeDay])

  return (
    <div
      ref={mapContainer}
      className="w-full h-full rounded-xl overflow-hidden border border-white/[0.06]"
      style={{ minHeight: 300 }}
    />
  )
}
```

**Step 5: Commit**

```bash
git add components/travel/widgets/
git commit -m "feat(travel): add plan dashboard components (DayTimeline, BudgetOverview, AccommodationCard, TripMap)"
```

---

### Task 10: New Trip Page (Chat + Dashboard Split View)

**Files:**
- Create: `app/(protected)/dashboard/travel/new/page.tsx`
- Create: `components/travel/plan/PlanDashboard.tsx`

**Step 1: Create PlanDashboard component**

Create `components/travel/plan/PlanDashboard.tsx`:

```tsx
"use client"

import { motion } from "framer-motion"
import { DayTimeline } from "@/components/travel/widgets/DayTimeline"
import { BudgetOverview } from "@/components/travel/widgets/BudgetOverview"
import { AccommodationCard } from "@/components/travel/widgets/AccommodationCard"
import { TripMap } from "@/components/travel/widgets/TripMap"
import type { TripPlan } from "@/lib/ai/travel-schemas"

interface PlanDashboardProps {
  plan: TripPlan
  currency?: string
}

export function PlanDashboard({ plan, currency = "EUR" }: PlanDashboardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-full overflow-y-auto p-6 space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">{plan.title}</h1>
        <p className="text-[#9da6b9] text-sm mt-1">
          {plan.destination} · {plan.days.length} days
        </p>
      </div>

      {/* Map */}
      <div className="h-[300px]">
        <TripMap days={plan.days} />
      </div>

      {/* Grid: Timeline + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DayTimeline days={plan.days} currency={currency} />
        </div>
        <div className="space-y-4">
          <BudgetOverview
            budget={plan.budget_breakdown}
            totalBudget={plan.budget_breakdown.total}
            currency={currency}
          />
          <AccommodationCard accommodations={plan.accommodations} currency={currency} />
        </div>
      </div>
    </motion.div>
  )
}
```

**Step 2: Create new trip page**

Create `app/(protected)/dashboard/travel/new/page.tsx`:

```tsx
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { TravelChat } from "@/components/travel/chat/TravelChat"
import { PlanDashboard } from "@/components/travel/plan/PlanDashboard"
import type { TripPlan } from "@/lib/ai/travel-schemas"

export default function NewTripPage() {
  const [plan, setPlan] = useState<TripPlan | null>(null)
  const [chatCollapsed, setChatCollapsed] = useState(false)

  return (
    <div className="h-full flex">
      {/* Chat panel */}
      <motion.div
        animate={{ width: chatCollapsed ? 0 : 400 }}
        transition={{ duration: 0.3 }}
        className="shrink-0 border-r border-white/[0.06] overflow-hidden bg-[#0c0e14]"
      >
        <div className="w-[400px] h-full">
          <TravelChat onPlanGenerated={setPlan} />
        </div>
      </motion.div>

      {/* Toggle button */}
      <button
        onClick={() => setChatCollapsed(!chatCollapsed)}
        className="shrink-0 w-6 flex items-center justify-center hover:bg-white/[0.04] transition-colors border-r border-white/[0.06]"
      >
        <svg
          className="w-3 h-3 text-[#555d70]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{ transform: chatCollapsed ? "rotate(180deg)" : "none" }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Plan dashboard */}
      <div className="flex-1 min-w-0">
        {plan ? (
          <PlanDashboard plan={plan} />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4 opacity-20">🗺</div>
              <p className="text-[#555d70] text-sm">
                Your trip plan will appear here
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add app/(protected)/dashboard/travel/new/ components/travel/plan/
git commit -m "feat(travel): add new trip page with split-view chat and plan dashboard"
```

---

### Task 11: Trip Detail Page (View/Edit Existing Trip)

**Files:**
- Create: `app/(protected)/dashboard/travel/[id]/page.tsx`
- Create: `app/(protected)/dashboard/travel/[id]/trip-detail-client.tsx`

> **Review fix [I6]:** `toTripPlan` picks the mid-range accommodation (or first) for budget calculation instead of summing all.

**Step 1: Create trip detail page (server)**

Create `app/(protected)/dashboard/travel/[id]/page.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TripDetailClient } from "./trip-detail-client"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TripDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/dashboard/login")

  const { data: trip } = await supabase
    .from("trips")
    .select("*")
    .eq("id", id)
    .single()

  if (!trip) redirect("/dashboard/travel")

  const { data: days } = await supabase
    .from("trip_days")
    .select("*, trip_activities(*)")
    .eq("trip_id", id)
    .order("day_number")

  const { data: accommodations } = await supabase
    .from("trip_accommodations")
    .select("*")
    .eq("trip_id", id)

  return (
    <TripDetailClient
      trip={trip}
      days={days || []}
      accommodations={accommodations || []}
    />
  )
}
```

**Step 2: Create trip detail client component**

Create `app/(protected)/dashboard/travel/[id]/trip-detail-client.tsx`:

```tsx
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { TravelChat } from "@/components/travel/chat/TravelChat"
import { PlanDashboard } from "@/components/travel/plan/PlanDashboard"
import type { TripPlan } from "@/lib/ai/travel-schemas"

interface TripDetailClientProps {
  trip: {
    id: string
    title: string
    destination: string
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
  const allActivities = props.days.flatMap(d => d.trip_activities)
  const totalFood = allActivities.filter(a => a.cost_category === "food").reduce((s, a) => s + (a.estimated_cost || 0), 0)
  const totalActivity = allActivities.filter(a => a.cost_category === "activity").reduce((s, a) => s + (a.estimated_cost || 0), 0)
  const totalTransport = allActivities.filter(a => a.cost_category === "transport").reduce((s, a) => s + (a.estimated_cost || 0), 0)
  const totalOther = allActivities.filter(a => !["food", "activity", "transport"].includes(a.cost_category || "")).reduce((s, a) => s + (a.estimated_cost || 0), 0)

  // Pick mid-range accommodation (or first available) for budget calc
  const midRange = props.accommodations.find(a => a.price_tier === "mid-range")
    || props.accommodations[0]
  const accTotal = midRange ? (midRange.price_per_night || 0) * props.days.length : 0

  return {
    title: props.trip.title,
    destination: props.trip.destination,
    days: props.days.map(d => ({
      day_number: d.day_number,
      title: d.title || `Day ${d.day_number}`,
      activities: d.trip_activities.map(a => ({
        time_slot: a.time_slot as "morning" | "afternoon" | "evening",
        title: a.title,
        description: a.description || "",
        location_name: a.location_name || "",
        latitude: a.latitude || 0,
        longitude: a.longitude || 0,
        estimated_cost: a.estimated_cost || 0,
        cost_category: (a.cost_category || "other") as "food" | "activity" | "transport" | "shopping" | "other",
        duration_minutes: a.duration_minutes || 60,
      })),
    })),
    accommodations: props.accommodations.map(a => ({
      name: a.name,
      price_per_night: a.price_per_night || 0,
      rating: a.rating || 0,
      price_tier: (a.price_tier || "mid-range") as "budget" | "mid-range" | "luxury",
      booking_url: a.booking_url || "#",
      latitude: a.latitude || 0,
      longitude: a.longitude || 0,
      distance_to_center: a.distance_to_center || "",
    })),
    budget_breakdown: {
      accommodation: accTotal,
      food: totalFood,
      activities: totalActivity,
      transport: totalTransport,
      other: totalOther,
      total: accTotal + totalFood + totalActivity + totalTransport + totalOther,
    },
  }
}

export function TripDetailClient(props: TripDetailClientProps) {
  const [plan, setPlan] = useState<TripPlan>(() => toTripPlan(props))
  const [chatOpen, setChatOpen] = useState(false)

  return (
    <div className="h-full flex">
      {/* Chat panel (for replanning) */}
      {chatOpen && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 400 }}
          transition={{ duration: 0.3 }}
          className="shrink-0 border-r border-white/[0.06] overflow-hidden bg-[#0c0e14]"
        >
          <div className="w-[400px] h-full">
            <TravelChat
              tripId={props.trip.id}
              onPlanGenerated={setPlan}
            />
          </div>
        </motion.div>
      )}

      {/* Plan dashboard */}
      <div className="flex-1 min-w-0 relative">
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="absolute top-4 right-4 z-10 px-3 py-1.5 text-xs font-medium text-[#b8d8e8] bg-[#b8d8e8]/10 hover:bg-[#b8d8e8]/20 rounded-lg transition-colors"
        >
          {chatOpen ? "Close chat" : "Replan with AI"}
        </button>
        <PlanDashboard plan={plan} currency={props.trip.currency} />
      </div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add app/(protected)/dashboard/travel/\[id\]/
git commit -m "feat(travel): add trip detail page with replan support"
```

---

### Task 12: Update Travel Dashboard Page (List Saved Trips)

**Files:**
- Modify: `app/(protected)/dashboard/travel/page.tsx`
- Create: `app/(protected)/dashboard/travel/travel-dashboard-client.tsx`
- Create: `components/travel/widgets/TripCard.tsx`

**Step 1: Create TripCard widget**

Create `components/travel/widgets/TripCard.tsx`:

```tsx
"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { TravelCard } from "@/components/travel/shared"

interface TripCardProps {
  id: string
  title: string
  destination: string
  startDate: string | null
  endDate: string | null
  totalBudget: number | null
  currency: string
  status: string
  index: number
}

const STATUS_COLORS: Record<string, string> = {
  draft: "#9da6b9",
  planned: "#b8d8e8",
  active: "#10b981",
  completed: "#7a8299",
}

export function TripCard({
  id, title, destination, startDate, endDate,
  totalBudget, currency, status, index,
}: TripCardProps) {
  const statusColor = STATUS_COLORS[status] || STATUS_COLORS.draft
  const currencySymbol = currency === "EUR" ? "\u20AC" : currency === "USD" ? "$" : currency === "GBP" ? "\u00A3" : currency

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/dashboard/travel/${id}`}>
        <TravelCard className="hover:border-[#b8d8e8]/20 transition-colors cursor-pointer group">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-white group-hover:text-[#b8d8e8] transition-colors truncate">
                {title}
              </h3>
              <p className="text-sm text-[#7a8299] mt-0.5">{destination}</p>
              {startDate && endDate && (
                <p className="text-xs text-[#555d70] mt-1">
                  {new Date(startDate).toLocaleDateString()} — {new Date(endDate).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="shrink-0 ml-4 text-right">
              {totalBudget && (
                <p className="text-sm font-semibold text-white">
                  {currencySymbol}{totalBudget.toFixed(0)}
                </p>
              )}
              <span
                className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1"
                style={{
                  color: statusColor,
                  backgroundColor: `${statusColor}15`,
                }}
              >
                {status}
              </span>
            </div>
          </div>
        </TravelCard>
      </Link>
    </motion.div>
  )
}
```

**Step 2: Create dashboard client component**

Create `app/(protected)/dashboard/travel/travel-dashboard-client.tsx`:

```tsx
"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { TravelCard } from "@/components/travel/shared"
import { TripCard } from "@/components/travel/widgets/TripCard"

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

export function TravelDashboardClient({ trips }: { trips: Trip[] }) {
  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Carve Travel
          </h1>
          <p className="text-[#9da6b9] mt-1">Your AI-powered travel planner</p>
        </div>
        <Link
          href="/dashboard/travel/new"
          className="px-4 py-2 text-sm font-medium text-[#b8d8e8] bg-[#b8d8e8]/10 hover:bg-[#b8d8e8]/20 rounded-lg transition-colors"
        >
          Plan a trip
        </Link>
      </motion.div>

      {trips.length > 0 ? (
        <div className="space-y-3">
          {trips.map((trip, idx) => (
            <TripCard
              key={trip.id}
              id={trip.id}
              title={trip.title}
              destination={trip.destination}
              startDate={trip.start_date}
              endDate={trip.end_date}
              totalBudget={trip.total_budget}
              currency={trip.currency}
              status={trip.status}
              index={idx}
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Link href="/dashboard/travel/new">
            <TravelCard className="hover:border-[#b8d8e8]/30 transition-colors cursor-pointer group text-center py-16">
              <div className="text-4xl mb-4">✈</div>
              <h3 className="text-lg font-semibold text-white group-hover:text-[#b8d8e8] transition-colors">
                Plan your first trip
              </h3>
              <p className="text-[#9da6b9] text-sm mt-1">
                Tell the AI where you want to go and get a complete travel plan
              </p>
            </TravelCard>
          </Link>
        </motion.div>
      )}
    </div>
  )
}
```

**Step 3: Update travel dashboard page to server component with data fetching**

Replace `app/(protected)/dashboard/travel/page.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TravelDashboardClient } from "./travel-dashboard-client"

export default async function TravelPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/dashboard/login")

  const { data: trips } = await supabase
    .from("trips")
    .select("id, title, destination, start_date, end_date, total_budget, currency, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return <TravelDashboardClient trips={trips || []} />
}
```

**Step 4: Commit**

```bash
git add app/(protected)/dashboard/travel/ components/travel/widgets/TripCard.tsx
git commit -m "feat(travel): update dashboard with saved trips list and trip cards"
```

---

### Task 13: Replan API Route

**Files:**
- Create: `app/api/travel/trips/[id]/replan/route.ts`

> **Review fix [C4, M6]:** Replan endpoint now saves modified plan to database using shared saveTripPlan helper. System prompt updated (in Task 5) to generate the full plan with modifications applied.

**Step 1: Create replan endpoint**

Create `app/api/travel/trips/[id]/replan/route.ts`:

```ts
import { streamText, tool } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { createClient } from "@/lib/supabase/server"
import { REPLAN_SYSTEM_PROMPT } from "@/lib/ai/travel-prompts"
import { tripPlanSchema } from "@/lib/ai/travel-schemas"
import { saveTripPlan, saveConversation } from "@/lib/ai/save-trip-plan"
import { z } from "zod"

export const maxDuration = 60

const requestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string(),
  })).min(1).max(50),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: tripId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  // Verify trip belongs to user
  const { data: trip } = await supabase
    .from("trips")
    .select("id")
    .eq("id", tripId)
    .eq("user_id", user.id)
    .single()

  if (!trip) {
    return new Response("Trip not found", { status: 404 })
  }

  const body = await req.json()
  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return new Response("Invalid request body", { status: 400 })
  }

  const { messages } = parsed.data

  // Load existing trip context
  const { data: days } = await supabase
    .from("trip_days")
    .select("*, trip_activities(*)")
    .eq("trip_id", tripId)
    .order("day_number")

  const existingPlanContext = JSON.stringify(days, null, 2)

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: `${REPLAN_SYSTEM_PROMPT}\n\nExisting trip plan:\n${existingPlanContext}`,
    messages,
    tools: {
      generate_trip_plan: tool({
        description: "Generate the complete modified trip plan. Include ALL days (both changed and unchanged).",
        parameters: tripPlanSchema,
        execute: async (plan) => {
          await saveTripPlan(supabase, tripId, plan)
          await saveConversation(supabase, tripId, messages)
          return plan
        },
      }),
    },
    maxSteps: 2,
  })

  return result.toDataStreamResponse()
}
```

**Step 2: Commit**

```bash
git add app/api/travel/trips/\[id\]/replan/route.ts
git commit -m "feat(travel): add replan API route with plan persistence"
```

---

### Task 14: Add Carve Travel to Marketing Navigation & Create Placeholder Page

**Files:**
- Modify: `lib/navigation/carve-navigation.ts`
- Modify: `components/app/layout-wrapper.tsx`
- Modify: `components/app/app-header.tsx` (add to MARKETING_NAV)
- Create: `app/carve/travel/page.tsx`

> **Review fix [M4]:** Creates a placeholder marketing page so `/carve/travel` doesn't 404.

**Step 1: Add Travel to carve marketing navigation**

In `lib/navigation/carve-navigation.ts`, add after the Money item:

```ts
{
  title: "Travel",
  href: "/carve/travel",
  icon: { name: 'GlobeIcon' },
  description: "AI-powered travel planning"
},
```

**Step 2: Add /carve/travel to marketing routes in layout-wrapper**

In `components/app/layout-wrapper.tsx`, add to the `isMarketingRoute` check:

```ts
path === '/carve/travel' ||
```

**Step 3: Add Travel to MARKETING_NAV in app-header**

In `components/app/app-header.tsx`, update `MARKETING_NAV`:

```ts
const MARKETING_NAV = [
  { label: 'Health', href: '/carve/health' },
  { label: 'Money', href: '/carve/money' },
  { label: 'Travel', href: '/carve/travel' },
  { label: 'Wiki', href: '/' },
] as const;
```

**Step 4: Create placeholder marketing page**

Create `app/carve/travel/page.tsx`:

```tsx
import Link from "next/link"

export default function CarveTravelPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <h1 className="text-4xl font-bold text-white tracking-tight mb-4">
          Carve Travel
        </h1>
        <p className="text-[#9da6b9] text-lg mb-8">
          AI-powered travel planning for solo travelers. Describe your dream trip and get a complete plan in minutes.
        </p>
        <Link
          href="/dashboard/travel"
          className="inline-block px-6 py-3 text-sm font-medium text-white bg-[#b8d8e8]/20 hover:bg-[#b8d8e8]/30 rounded-xl transition-colors"
        >
          Start planning
        </Link>
      </div>
    </div>
  )
}
```

**Step 5: Commit**

```bash
git add lib/navigation/carve-navigation.ts components/app/layout-wrapper.tsx components/app/app-header.tsx app/carve/travel/
git commit -m "feat(travel): add Carve Travel to marketing navigation with placeholder page"
```
