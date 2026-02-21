# Health Dashboard Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the health dashboard to mirror the iOS Carve app (dark theme), replacing all old widgets with new components following the money dashboard pattern.

**Architecture:** Server Component page that fetches user data from Supabase, renders a responsive grid of card-based widgets with framer-motion entrance animations. Shared `HealthCard` base component mirrors `MoneyCard` pattern. Client components only where interactivity is needed.

**Tech Stack:** Next.js 15 App Router, Tailwind CSS v4, framer-motion, Supabase server-side data fetching

---

### Task 1: Delete old dashboard components

**Files:**
- Delete: `components/dashboard/widgets/TodayActivityHero.tsx`
- Delete: `components/dashboard/widgets/QuickStat.tsx`
- Delete: `components/dashboard/widgets/ActivityHeatmap.tsx`
- Delete: `components/dashboard/widgets/NutritionSnapshot.tsx`
- Delete: `components/dashboard/widgets/WeeklySchedule.tsx`
- Delete: `components/dashboard/widgets/AchievementProgress.tsx`
- Delete: `components/dashboard/widgets/FriendLeaderboard.tsx`
- Delete: `components/dashboard/widgets/shared/WidgetSkeleton.tsx`
- Delete: `components/dashboard/widgets/shared/WidgetCard.tsx`
- Delete: `components/dashboard/widgets/shared/DarkCard.tsx`
- Delete: `components/dashboard/widgets/shared/ProgressBar.tsx`
- Delete: `components/dashboard/widgets/shared/CircularGauge.tsx`
- Delete: `components/dashboard/widgets/shared/Sparkline.tsx`
- Delete: `components/dashboard/widgets/shared/index.ts`
- Delete: `components/dashboard/DashboardGrid.tsx`
- Delete: `components/dashboard/stat-card.tsx`
- Delete: `components/dashboard/stats-grid.tsx`
- Delete: `components/dashboard/xp-progress-bar.tsx`
- Delete: `components/dashboard/profile-header.tsx`
- Delete: `components/dashboard/RecommendedArticles.tsx`
- Delete: `components/dashboard/SocialFeedHighlights.tsx`
- Delete: `components/dashboard/social-feed-highlights.tsx`
- Delete: `components/dashboard/index.ts`

**Step 1: Delete all old widget files**

```bash
rm components/dashboard/widgets/TodayActivityHero.tsx
rm components/dashboard/widgets/QuickStat.tsx
rm components/dashboard/widgets/ActivityHeatmap.tsx
rm components/dashboard/widgets/NutritionSnapshot.tsx
rm components/dashboard/widgets/WeeklySchedule.tsx
rm components/dashboard/widgets/AchievementProgress.tsx
rm components/dashboard/widgets/FriendLeaderboard.tsx
rm -rf components/dashboard/widgets/shared/
rm components/dashboard/DashboardGrid.tsx
rm components/dashboard/stat-card.tsx
rm components/dashboard/stats-grid.tsx
rm components/dashboard/xp-progress-bar.tsx
rm components/dashboard/profile-header.tsx
rm components/dashboard/RecommendedArticles.tsx
rm components/dashboard/SocialFeedHighlights.tsx
rm components/dashboard/social-feed-highlights.tsx
rm components/dashboard/index.ts
```

**Note:** Keep `components/dashboard/DemoBanner.tsx` — it's used by `app/demo/page.tsx`.

**Step 2: Commit deletion**

```bash
git add -A components/dashboard/
git commit -m "chore: remove old health dashboard components"
```

---

### Task 2: Create HealthCard shared component

**Files:**
- Create: `components/dashboard/shared/HealthCard.tsx`
- Create: `components/dashboard/shared/index.ts`

**Reference:** `components/money/shared/MoneyCard.tsx` — identical pattern, same styling.

**Step 1: Create HealthCard**

```tsx
// components/dashboard/shared/HealthCard.tsx
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface HealthCardProps {
  children: ReactNode
  className?: string
}

export function HealthCard({ children, className }: HealthCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl p-5",
        "bg-[#1c1f27]",
        "border border-white/[0.06]",
        className
      )}
    >
      {children}
    </div>
  )
}
```

**Step 2: Create barrel export**

```tsx
// components/dashboard/shared/index.ts
export { HealthCard } from "./HealthCard"
```

**Step 3: Commit**

```bash
git add components/dashboard/shared/
git commit -m "feat(dashboard): add HealthCard shared component"
```

---

### Task 3: Create HealthStatCard widget

**Files:**
- Create: `components/dashboard/widgets/HealthStatCard.tsx`

**Design:** Matches the 3-stat row in the iOS app (Workouts / Steps / Worldwide). Uses `HealthCard` as wrapper. Displays label (uppercase small), big bold value, and optional unit.

**Step 1: Create HealthStatCard**

```tsx
// components/dashboard/widgets/HealthStatCard.tsx
import { HealthCard } from "@/components/dashboard/shared"

interface HealthStatCardProps {
  label: string
  value: string | number
  unit?: string
}

export function HealthStatCard({ label, value, unit }: HealthStatCardProps) {
  return (
    <HealthCard>
      <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">
        {label}
      </p>
      <p className="text-3xl font-bold text-white tracking-tight">
        {value}
      </p>
      {unit && (
        <p className="text-[#9da6b9] text-sm mt-1">{unit}</p>
      )}
    </HealthCard>
  )
}
```

**Step 2: Commit**

```bash
git add components/dashboard/widgets/HealthStatCard.tsx
git commit -m "feat(dashboard): add HealthStatCard widget"
```

---

### Task 4: Create WorldRankingCard widget

**Files:**
- Create: `components/dashboard/widgets/WorldRankingCard.tsx`

**Design:** Mirrors the iOS app's World Ranking card. Shows tier list (Legend → Rookie) with the user's current tier highlighted using a warm gold accent. Bottom row shows Workouts / Steps / Worldwide stats.

**Step 1: Create WorldRankingCard**

```tsx
// components/dashboard/widgets/WorldRankingCard.tsx
import { HealthCard } from "@/components/dashboard/shared"

const RANKING_TIERS = [
  "Legend",
  "Master",
  "Elite",
  "Advanced",
  "Intermediate",
  "Beginner",
  "Rookie",
] as const

type RankingTier = (typeof RANKING_TIERS)[number]

interface WorldRankingCardProps {
  currentTier: RankingTier
  workouts: number
  steps: number | string
  worldwideRank: number | string | null
}

export function WorldRankingCard({
  currentTier,
  workouts,
  steps,
  worldwideRank,
}: WorldRankingCardProps) {
  return (
    <HealthCard className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
            <path d="M12 20V10M18 20V4M6 20v-4" />
          </svg>
          <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            World Ranking
          </h3>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>

      {/* Tier list */}
      <div className="space-y-2.5 flex-1">
        {RANKING_TIERS.map((tier) => {
          const isActive = tier === currentTier
          return (
            <div
              key={tier}
              className={`flex items-center gap-3 ${
                isActive ? "text-white" : "text-slate-500"
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                  isActive
                    ? "border-[#c8b86e] bg-[#c8b86e]"
                    : "border-slate-600 bg-transparent"
                }`}
              >
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1c1f27]" />
                )}
              </div>
              <span
                className={`text-sm ${
                  isActive ? "font-semibold text-white" : "text-slate-500"
                }`}
              >
                {tier}
              </span>
            </div>
          )
        })}
      </div>

      {/* Bottom stats */}
      <div className="mt-5 pt-4 border-t border-white/[0.06] grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-lg font-bold text-white">{workouts}</p>
          <p className="text-xs text-slate-500">Workouts</p>
        </div>
        <div>
          <p className="text-lg font-bold text-white">{steps}</p>
          <p className="text-xs text-slate-500">Steps</p>
        </div>
        <div>
          <p className="text-lg font-bold text-white">
            {worldwideRank ?? "—"}
          </p>
          <p className="text-xs text-slate-500">worldwide</p>
        </div>
      </div>
    </HealthCard>
  )
}
```

**Step 2: Commit**

```bash
git add components/dashboard/widgets/WorldRankingCard.tsx
git commit -m "feat(dashboard): add WorldRankingCard widget"
```

---

### Task 5: Create ChallengesCard widget

**Files:**
- Create: `components/dashboard/widgets/ChallengesCard.tsx`

**Design:** Mirrors the iOS app's Challenges section. Shows Daily and Monthly challenges with progress counters (e.g., 0/5, 0/12). Each challenge has an icon and a progress indicator.

**Step 1: Create ChallengesCard**

```tsx
// components/dashboard/widgets/ChallengesCard.tsx
import { HealthCard } from "@/components/dashboard/shared"

interface Challenge {
  id: string
  label: string
  type: "daily" | "monthly"
  current: number
  target: number
}

interface ChallengesCardProps {
  challenges: Challenge[]
}

export function ChallengesCard({ challenges }: ChallengesCardProps) {
  const dailyChallenges = challenges.filter((c) => c.type === "daily")
  const monthlyChallenges = challenges.filter((c) => c.type === "monthly")

  return (
    <HealthCard className="flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm">🏆</span>
        <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
          Challenges
        </h3>
      </div>

      <div className="space-y-3 flex-1">
        {dailyChallenges.map((challenge) => (
          <ChallengeRow key={challenge.id} challenge={challenge} icon="⚡" />
        ))}
        {monthlyChallenges.map((challenge) => (
          <ChallengeRow key={challenge.id} challenge={challenge} icon="📅" />
        ))}
      </div>
    </HealthCard>
  )
}

function ChallengeRow({
  challenge,
  icon,
}: {
  challenge: Challenge
  icon: string
}) {
  const progress = challenge.target > 0
    ? (challenge.current / challenge.target) * 100
    : 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-sm">{icon}</span>
        <span className="text-sm text-white">{challenge.label}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-16 h-[2px] rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-emerald-400 transition-all"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
        <span className="text-xs text-slate-500 tabular-nums min-w-[36px] text-right">
          {challenge.current}/{challenge.target}
        </span>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add components/dashboard/widgets/ChallengesCard.tsx
git commit -m "feat(dashboard): add ChallengesCard widget"
```

---

### Task 6: Create DailyRoutineCard widget

**Files:**
- Create: `components/dashboard/widgets/DailyRoutineCard.tsx`

**Design:** Mirrors iOS app's Daily Routine section. Shows a habits list with a "Browse habits" link and an add button. Initially shows placeholder state.

**Step 1: Create DailyRoutineCard**

```tsx
// components/dashboard/widgets/DailyRoutineCard.tsx
import Link from "next/link"
import { HealthCard } from "@/components/dashboard/shared"

interface Habit {
  id: string
  name: string
  completed: boolean
}

interface DailyRoutineCardProps {
  habits: Habit[]
}

export function DailyRoutineCard({ habits }: DailyRoutineCardProps) {
  return (
    <HealthCard>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">🔄</span>
          <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            Daily Routine
          </h3>
        </div>
        <button className="text-slate-400 hover:text-white transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      {habits.length === 0 ? (
        <Link
          href="#"
          className="flex items-center justify-between py-3 text-slate-400 hover:text-white transition-colors group"
        >
          <div className="flex items-center gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500 group-hover:text-white transition-colors">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span className="text-sm">Browse habits</span>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-600">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>
      ) : (
        <div className="space-y-2">
          {habits.map((habit) => (
            <div key={habit.id} className="flex items-center gap-3 py-2">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  habit.completed
                    ? "border-emerald-400 bg-emerald-400/20"
                    : "border-slate-600"
                }`}
              >
                {habit.completed && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-emerald-400">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </div>
              <span className={`text-sm ${habit.completed ? "text-slate-500 line-through" : "text-white"}`}>
                {habit.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </HealthCard>
  )
}
```

**Step 2: Commit**

```bash
git add components/dashboard/widgets/DailyRoutineCard.tsx
git commit -m "feat(dashboard): add DailyRoutineCard widget"
```

---

### Task 7: Create QuickLinkCard widget

**Files:**
- Create: `components/dashboard/widgets/QuickLinkCard.tsx`

**Design:** Matches the money dashboard's quick link cards pattern. Each card links to a section (Food, Workouts, Social) with title + description. Hover effect with accent border.

**Step 1: Create QuickLinkCard**

```tsx
// components/dashboard/widgets/QuickLinkCard.tsx
import Link from "next/link"
import { HealthCard } from "@/components/dashboard/shared"

interface QuickLinkCardProps {
  href: string
  title: string
  description: string
  icon: string
}

export function QuickLinkCard({ href, title, description, icon }: QuickLinkCardProps) {
  return (
    <Link href={href}>
      <HealthCard className="hover:border-emerald-400/30 transition-colors cursor-pointer group">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-lg">{icon}</span>
          <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
            {title}
          </h3>
        </div>
        <p className="text-[#9da6b9] text-sm">{description}</p>
      </HealthCard>
    </Link>
  )
}
```

**Step 2: Commit**

```bash
git add components/dashboard/widgets/QuickLinkCard.tsx
git commit -m "feat(dashboard): add QuickLinkCard widget"
```

---

### Task 8: Create sample data for dashboard

**Files:**
- Create: `components/dashboard/sample-data.ts`

**Purpose:** Placeholder data for ranking, challenges, and habits — similar to how money dashboard uses `components/money/sample-data.ts`.

**Step 1: Create sample data**

```tsx
// components/dashboard/sample-data.ts

export const RANKING_TIERS = [
  "Legend",
  "Master",
  "Elite",
  "Advanced",
  "Intermediate",
  "Beginner",
  "Rookie",
] as const

export type RankingTier = (typeof RANKING_TIERS)[number]

export const sampleChallenges = [
  { id: "daily-workout", label: "Daily", type: "daily" as const, current: 0, target: 5 },
  { id: "monthly-workout", label: "Monthly", type: "monthly" as const, current: 0, target: 12 },
]

export const sampleHabits: { id: string; name: string; completed: boolean }[] = []
```

**Step 2: Commit**

```bash
git add components/dashboard/sample-data.ts
git commit -m "feat(dashboard): add sample data for health dashboard"
```

---

### Task 9: Rewrite dashboard page.tsx

**Files:**
- Modify: `app/(protected)/dashboard/page.tsx`

**Design:** Complete rewrite using the new components. Server component that fetches user data, renders the grid layout with framer-motion animations. Follows the money dashboard page structure exactly.

**Step 1: Rewrite page.tsx**

```tsx
// app/(protected)/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { HealthDashboardClient } from "@/components/dashboard/HealthDashboardClient"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/dashboard/login")
  }

  // Fetch user stats
  const { data: stats } = await supabase
    .from("user_stats")
    .select("level, total_xp, current_workout_streak")
    .eq("user_id", user.id)
    .single()

  // Count total workouts
  const { count: workoutCount } = await supabase
    .from("workouts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  // Determine ranking tier based on XP
  const totalXp = stats?.total_xp ?? 0
  const currentTier =
    totalXp >= 50000 ? "Legend"
    : totalXp >= 25000 ? "Master"
    : totalXp >= 10000 ? "Elite"
    : totalXp >= 5000 ? "Advanced"
    : totalXp >= 2000 ? "Intermediate"
    : totalXp >= 500 ? "Beginner"
    : "Rookie"

  return (
    <HealthDashboardClient
      totalXp={totalXp}
      currentTier={currentTier as any}
      workouts={workoutCount ?? 0}
      steps="—"
      worldwideRank={null}
      level={stats?.level ?? 1}
      streak={stats?.current_workout_streak ?? 0}
    />
  )
}
```

**Step 2: Commit**

```bash
git add app/(protected)/dashboard/page.tsx
git commit -m "feat(dashboard): rewrite page with new component structure"
```

---

### Task 10: Create HealthDashboardClient (layout + animations)

**Files:**
- Create: `components/dashboard/HealthDashboardClient.tsx`

**Purpose:** Client component that handles framer-motion animations and composes all widgets into the grid layout. Separated from the server page to keep data fetching server-side while animations are client-side.

**Step 1: Create HealthDashboardClient**

```tsx
// components/dashboard/HealthDashboardClient.tsx
"use client"

import { motion } from "framer-motion"
import { HealthStatCard } from "@/components/dashboard/widgets/HealthStatCard"
import { WorldRankingCard } from "@/components/dashboard/widgets/WorldRankingCard"
import { ChallengesCard } from "@/components/dashboard/widgets/ChallengesCard"
import { DailyRoutineCard } from "@/components/dashboard/widgets/DailyRoutineCard"
import { QuickLinkCard } from "@/components/dashboard/widgets/QuickLinkCard"
import { sampleChallenges, sampleHabits } from "@/components/dashboard/sample-data"
import type { RankingTier } from "@/components/dashboard/sample-data"

interface HealthDashboardClientProps {
  totalXp: number
  currentTier: RankingTier
  workouts: number
  steps: string | number
  worldwideRank: number | string | null
  level: number
  streak: number
}

export function HealthDashboardClient({
  totalXp,
  currentTier,
  workouts,
  steps,
  worldwideRank,
  level,
  streak,
}: HealthDashboardClientProps) {
  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Carve Health
            </h1>
            <p className="text-[#9da6b9] mt-1">Your daily breakdown</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider text-slate-500">
              Season 1
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#c8b86e]/10 px-3 py-1 text-xs font-medium text-[#c8b86e]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c8b86e]" />
              {currentTier}
            </span>
            <span className="text-sm font-semibold text-white">
              {totalXp} pts
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <HealthStatCard label="Workouts" value={workouts} />
        <HealthStatCard label="Steps" value={steps} />
        <HealthStatCard
          label="Worldwide"
          value={worldwideRank ?? "—"}
        />
      </motion.div>

      {/* Ranking + Challenges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <WorldRankingCard
          currentTier={currentTier}
          workouts={workouts}
          steps={steps}
          worldwideRank={worldwideRank}
        />
        <ChallengesCard challenges={sampleChallenges} />
      </motion.div>

      {/* Daily Routine */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <DailyRoutineCard habits={sampleHabits} />
      </motion.div>

      {/* Quick links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <QuickLinkCard
          href="/dashboard/food"
          icon="🍽"
          title="Food"
          description="Track your meals and nutrition"
        />
        <QuickLinkCard
          href="/dashboard/workouts"
          icon="💪"
          title="Workouts"
          description="Start or log a workout"
        />
        <QuickLinkCard
          href="/dashboard/social"
          icon="👥"
          title="Social"
          description="Friends and rankings"
        />
      </motion.div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add components/dashboard/HealthDashboardClient.tsx
git commit -m "feat(dashboard): add HealthDashboardClient with full grid layout"
```

---

### Task 11: Verify build and final cleanup

**Step 1: Run build to verify no errors**

```bash
npm run build
```

Expected: Build succeeds without errors.

**Step 2: Check for any remaining imports of deleted components**

Search for any lingering references to removed components. Fix if found.

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat(dashboard): complete health dashboard redesign"
```
