# Dashboard Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the dashboard from basic split-screen layout to modern widget-based design with dark hero cards, gradient visualizations, and friend leaderboard

**Architecture:** New dashboard uses asymmetric grid layout with dark navy hero cards (Activity Summary + Quick Stat) and clean white detail widgets (Schedule, Nutrition, Heatmap, Achievements, Leaderboard). Server components for data fetching, client components only for interactions. Recharts for visualizations.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Supabase, Recharts 2.15.4, date-fns, Lucide React

**Design Reference:** `docs/plans/2025-01-12-dashboard-redesign.md`

---

## Phase 1: Foundation & Layout (Tasks 1-8)

### Task 1: Create shared UI components directory structure

**Files:**
- Create: `components/dashboard/widgets/shared/WidgetCard.tsx`
- Create: `components/dashboard/widgets/shared/DarkCard.tsx`
- Create: `components/dashboard/widgets/shared/index.ts`

**Step 1: Create WidgetCard wrapper component**

Create `components/dashboard/widgets/shared/WidgetCard.tsx`:

```typescript
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface WidgetCardProps {
  children: ReactNode;
  className?: string;
}

export function WidgetCard({ children, className }: WidgetCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-black/[0.08] bg-white p-6",
        "shadow-[0_1px_3px_rgba(0,0,0,0.05)]",
        className
      )}
    >
      {children}
    </div>
  );
}
```

**Step 2: Create DarkCard wrapper component**

Create `components/dashboard/widgets/shared/DarkCard.tsx`:

```typescript
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DarkCardProps {
  children: ReactNode;
  className?: string;
}

export function DarkCard({ children, className }: DarkCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-[#0a0e1a] p-8",
        className
      )}
    >
      {children}
    </div>
  );
}
```

**Step 3: Create index barrel export**

Create `components/dashboard/widgets/shared/index.ts`:

```typescript
export { WidgetCard } from "./WidgetCard";
export { DarkCard } from "./DarkCard";
```

**Step 4: Verify TypeScript compilation**

Run: `pnpm tsc --noEmit`
Expected: No errors

**Step 5: Commit**

```bash
git add components/dashboard/widgets/
git commit -m "feat(dashboard): add shared widget card components

- WidgetCard for white background widgets
- DarkCard for dark navy hero cards
- Shared styling with Tailwind CSS

Part of dashboard redesign Phase 1"
```

---

### Task 2: Create dashboard layout grid component

**Files:**
- Create: `components/dashboard/DashboardGrid.tsx`

**Step 1: Create DashboardGrid component**

Create `components/dashboard/DashboardGrid.tsx`:

```typescript
import { ReactNode } from "react";

interface DashboardGridProps {
  children: ReactNode;
}

export function DashboardGrid({ children }: DashboardGridProps) {
  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      {children}
    </div>
  );
}

interface TopRowProps {
  hero: ReactNode;
  quickStat: ReactNode;
}

export function TopRow({ hero, quickStat }: TopRowProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
      {hero}
      {quickStat}
    </div>
  );
}

interface MiddleRowProps {
  children: ReactNode;
}

export function MiddleRow({ children }: MiddleRowProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {children}
    </div>
  );
}

interface BottomRowProps {
  heatmap: ReactNode;
  leaderboard: ReactNode;
}

export function BottomRow({ heatmap, leaderboard }: BottomRowProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr]">
      {heatmap}
      {leaderboard}
    </div>
  );
}
```

**Step 2: Verify TypeScript compilation**

Run: `pnpm tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add components/dashboard/DashboardGrid.tsx
git commit -m "feat(dashboard): add responsive grid layout

- TopRow: 70/30 split for hero and quick stat
- MiddleRow: 3-column grid for schedule/sleep/nutrition
- BottomRow: 33/67 split for heatmap and leaderboard
- Fully responsive with mobile stacking

Part of dashboard redesign Phase 1"
```

---

### Task 3: Create database migration for workout_plans table

**Files:**
- Create: `supabase/migrations/20251112000001_create_workout_plans.sql`

**Step 1: Create workout_plans table migration**

Create `supabase/migrations/20251112000001_create_workout_plans.sql`:

```sql
-- Create workout_plans table for weekly schedule widget
CREATE TABLE IF NOT EXISTS workout_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  workout_type TEXT CHECK (workout_type IN ('strength', 'cardio', 'rest')),
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'completed', 'skipped')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Add index for user_id and date queries
CREATE INDEX idx_workout_plans_user_date ON workout_plans(user_id, date DESC);

-- Enable RLS
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own workout plans
CREATE POLICY "Users can view own workout plans"
  ON workout_plans
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own workout plans
CREATE POLICY "Users can insert own workout plans"
  ON workout_plans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own workout plans
CREATE POLICY "Users can update own workout plans"
  ON workout_plans
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own workout plans
CREATE POLICY "Users can delete own workout plans"
  ON workout_plans
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_workout_plans_updated_at
  BEFORE UPDATE ON workout_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Step 2: Apply migration via Supabase**

Run via Supabase MCP or local CLI:
```bash
npx supabase db push
```

Expected: Migration applied successfully

**Step 3: Verify table exists**

Query to verify:
```sql
SELECT * FROM workout_plans LIMIT 1;
```

Expected: Empty result set (table exists but no data)

**Step 4: Commit**

```bash
git add supabase/migrations/20251112000001_create_workout_plans.sql
git commit -m "feat(db): add workout_plans table for schedule widget

- Stores planned vs completed workouts
- User-specific with RLS policies
- workout_type: strength, cardio, rest
- status: planned, completed, skipped
- Unique constraint on (user_id, date)

Part of dashboard redesign Phase 1"
```

---

### Task 4: Create database migration for user_goals table

**Files:**
- Create: `supabase/migrations/20251112000002_create_user_goals.sql`

**Step 1: Create user_goals table migration**

Create `supabase/migrations/20251112000002_create_user_goals.sql`:

```sql
-- Create user_goals table for nutrition targets
CREATE TABLE IF NOT EXISTS user_goals (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  -- Nutrition goals
  daily_calories INTEGER DEFAULT 2200 CHECK (daily_calories > 0),
  daily_protein_g INTEGER DEFAULT 150 CHECK (daily_protein_g > 0),
  daily_carbs_g INTEGER DEFAULT 220 CHECK (daily_carbs_g > 0),
  daily_fats_g INTEGER DEFAULT 73 CHECK (daily_fats_g > 0),
  daily_water_l DECIMAL DEFAULT 2.5 CHECK (daily_water_l > 0),
  -- Activity goals (optional)
  daily_steps INTEGER DEFAULT 10000 CHECK (daily_steps > 0),
  weekly_workouts INTEGER DEFAULT 4 CHECK (weekly_workouts > 0),
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own goals
CREATE POLICY "Users can view own goals"
  ON user_goals
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own goals
CREATE POLICY "Users can insert own goals"
  ON user_goals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own goals
CREATE POLICY "Users can update own goals"
  ON user_goals
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_user_goals_updated_at
  BEFORE UPDATE ON user_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create default goals for existing users
INSERT INTO user_goals (user_id)
SELECT id FROM profiles
ON CONFLICT (user_id) DO NOTHING;
```

**Step 2: Apply migration**

Run: `npx supabase db push`
Expected: Migration applied successfully

**Step 3: Verify default goals created**

Query:
```sql
SELECT user_id, daily_calories, daily_protein_g FROM user_goals LIMIT 5;
```

Expected: Rows with default values (2200, 150, etc.)

**Step 4: Commit**

```bash
git add supabase/migrations/20251112000002_create_user_goals.sql
git commit -m "feat(db): add user_goals table for nutrition targets

- Default nutrition goals (2200 cal, 150g protein, etc.)
- Optional activity goals (steps, weekly workouts)
- Auto-populated for existing users
- RLS policies for user isolation

Part of dashboard redesign Phase 1"
```

---

### Task 5: Create database migration for daily_steps table

**Files:**
- Create: `supabase/migrations/20251112000003_create_daily_steps.sql`

**Step 1: Create daily_steps table migration**

Create `supabase/migrations/20251112000003_create_daily_steps.sql`:

```sql
-- Create daily_steps table for manual step tracking
CREATE TABLE IF NOT EXISTS daily_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  steps INTEGER NOT NULL CHECK (steps >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Add index for user_id and date queries
CREATE INDEX idx_daily_steps_user_date ON daily_steps(user_id, date DESC);

-- Enable RLS
ALTER TABLE daily_steps ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own steps
CREATE POLICY "Users can view own steps"
  ON daily_steps
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own steps
CREATE POLICY "Users can insert own steps"
  ON daily_steps
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own steps
CREATE POLICY "Users can update own steps"
  ON daily_steps
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own steps
CREATE POLICY "Users can delete own steps"
  ON daily_steps
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_daily_steps_updated_at
  BEFORE UPDATE ON daily_steps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Step 2: Apply migration**

Run: `npx supabase db push`
Expected: Migration applied successfully

**Step 3: Verify table exists**

Query:
```sql
SELECT * FROM daily_steps LIMIT 1;
```

Expected: Empty result set (table exists)

**Step 4: Commit**

```bash
git add supabase/migrations/20251112000003_create_daily_steps.sql
git commit -m "feat(db): add daily_steps table for step tracking

- Manual entry of daily step count
- Unique constraint per user per day
- RLS policies for privacy
- Indexed for performance

Part of dashboard redesign Phase 1"
```

---

### Task 6: Create TodayActivityHero skeleton component

**Files:**
- Create: `components/dashboard/widgets/TodayActivityHero.tsx`

**Step 1: Create basic hero component structure**

Create `components/dashboard/widgets/TodayActivityHero.tsx`:

```typescript
import { DarkCard } from "./shared";
import Link from "next/link";

interface TodayActivityHeroProps {
  caloriesBurned: number;
  activeMinutes: number;
  xpEarned: number;
  streakMultiplier: number;
}

export function TodayActivityHero({
  caloriesBurned,
  activeMinutes,
  xpEarned,
  streakMultiplier,
}: TodayActivityHeroProps) {
  return (
    <DarkCard>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-white">
            Today's Activity
          </h2>
          <p className="mt-1 text-sm text-[#8b92a8]">
            Your Path to Fitness Excellence
          </p>
        </div>

        {/* Metrics */}
        <div className="flex gap-8">
          <Metric
            icon="🔥"
            value={caloriesBurned}
            unit="kcal"
            label="Calories Burned"
          />
          <Metric
            icon="⏱️"
            value={activeMinutes}
            unit="min"
            label="Active Minutes"
          />
          <Metric
            icon="⭐"
            value={xpEarned}
            suffix={`+${streakMultiplier.toFixed(1)}x`}
            label="XP Earned"
          />
        </div>
      </div>

      {/* Sparkline placeholder - will add in Phase 2 */}
      <div className="mb-4 h-20 rounded-lg bg-white/5">
        <p className="flex h-full items-center justify-center text-xs text-[#8b92a8]">
          7-day sparkline will appear here
        </p>
      </div>

      {/* Action button */}
      <div className="flex justify-end">
        <Link
          href="/dashboard/workouts/new"
          className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white transition-colors hover:bg-white/10"
        >
          + Start Workout
        </Link>
      </div>
    </DarkCard>
  );
}

interface MetricProps {
  icon: string;
  value: number;
  unit?: string;
  suffix?: string;
  label: string;
}

function Metric({ icon, value, unit, suffix, label }: MetricProps) {
  return (
    <div className="text-right">
      <div className="mb-1 flex items-baseline gap-1">
        <span className="text-xs">{icon}</span>
        <span className="text-2xl font-semibold tabular-nums text-white">
          {value}
        </span>
        {unit && <span className="text-xs text-[#8b92a8]">{unit}</span>}
      </div>
      {suffix && (
        <div className="text-xs text-[#8b92a8]">{suffix}</div>
      )}
      <div className="sr-only">{label}</div>
    </div>
  );
}
```

**Step 2: Verify TypeScript compilation**

Run: `pnpm tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add components/dashboard/widgets/TodayActivityHero.tsx
git commit -m "feat(dashboard): add TodayActivityHero skeleton

- Dark card with title and subtitle
- 3 metrics: calories, active minutes, XP (with streak)
- Placeholder for sparkline visualization
- Quick action: Start Workout link
- Fully typed with TypeScript

Part of dashboard redesign Phase 1"
```

---

### Task 7: Create QuickStat skeleton component

**Files:**
- Create: `components/dashboard/widgets/QuickStat.tsx`

**Step 1: Create QuickStat component**

Create `components/dashboard/widgets/QuickStat.tsx`:

```typescript
import { DarkCard } from "./shared";

interface QuickStatProps {
  label: string;
  value: number | string;
  unit?: string;
}

export function QuickStat({ label, value, unit }: QuickStatProps) {
  return (
    <DarkCard className="flex min-h-[280px] flex-col items-center justify-center">
      <p className="mb-4 text-sm text-[#8b92a8]">{label}</p>

      {/* Glow effect placeholder - will add in Phase 5 */}
      <div className="relative mb-4 h-24 w-24">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-500/20 to-green-500/20 blur-xl" />
      </div>

      {/* Value */}
      <div className="text-center">
        <div className="text-7xl font-bold tabular-nums text-white">
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
        {unit && (
          <div className="mt-2 text-sm text-[#8b92a8]">{unit}</div>
        )}
      </div>
    </DarkCard>
  );
}
```

**Step 2: Verify TypeScript compilation**

Run: `pnpm tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add components/dashboard/widgets/QuickStat.tsx
git commit -m "feat(dashboard): add QuickStat widget skeleton

- Dark card for highlighting single metric
- Large 72px number display
- Placeholder glow effect (gradient blur)
- Supports steps, PR, or streak display

Part of dashboard redesign Phase 1"
```

---

### Task 8: Update dashboard page with new layout

**Files:**
- Modify: `app/(protected)/dashboard/page.tsx`

**Step 1: Replace current dashboard with new grid layout**

Replace contents of `app/(protected)/dashboard/page.tsx`:

```typescript
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardGrid, TopRow, MiddleRow, BottomRow } from "@/components/dashboard/DashboardGrid";
import { TodayActivityHero } from "@/components/dashboard/widgets/TodayActivityHero";
import { QuickStat } from "@/components/dashboard/widgets/QuickStat";
import { WidgetCard } from "@/components/dashboard/widgets/shared";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user stats
  const { data: stats } = await supabase
    .from("user_stats")
    .select("level, total_xp, current_workout_streak")
    .eq("user_id", user.id)
    .single();

  // Calculate today's metrics (temporary simple calculation)
  // TODO: In Phase 2, fetch actual workouts and calculate properly
  const caloriesBurned = 0; // Will calculate from workouts
  const activeMinutes = 0; // Will calculate from workouts
  const xpEarned = 0; // Will fetch from today's activities
  const streakMultiplier = stats?.current_workout_streak
    ? stats.current_workout_streak >= 30 ? 2.0
    : stats.current_workout_streak >= 14 ? 1.5
    : stats.current_workout_streak >= 7 ? 1.25
    : stats.current_workout_streak >= 3 ? 1.1
    : 1.0
    : 1.0;

  return (
    <DashboardGrid>
      <TopRow
        hero={
          <TodayActivityHero
            caloriesBurned={caloriesBurned}
            activeMinutes={activeMinutes}
            xpEarned={xpEarned}
            streakMultiplier={streakMultiplier}
          />
        }
        quickStat={
          <QuickStat
            label="Current Streak"
            value={stats?.current_workout_streak || 0}
            unit="days 🔥"
          />
        }
      />

      <MiddleRow>
        <WidgetCard>
          <h3 className="text-xl font-semibold text-[#1a1a1a]">Weekly Schedule</h3>
          <p className="mt-2 text-sm text-[#6b7280]">Widget coming in Phase 3</p>
        </WidgetCard>

        <WidgetCard>
          <h3 className="text-xl font-semibold text-[#1a1a1a]">Sleep & Recovery</h3>
          <p className="mt-2 text-sm text-[#6b7280]">Optional - Phase 5</p>
        </WidgetCard>

        <WidgetCard>
          <h3 className="text-xl font-semibold text-[#1a1a1a]">Nutrition Snapshot</h3>
          <p className="mt-2 text-sm text-[#6b7280]">Widget coming in Phase 3</p>
        </WidgetCard>
      </MiddleRow>

      <BottomRow
        heatmap={
          <WidgetCard>
            <h3 className="text-xl font-semibold text-[#1a1a1a]">Activity Heatmap</h3>
            <p className="mt-2 text-sm text-[#6b7280]">Widget coming in Phase 2</p>
          </WidgetCard>
        }
        leaderboard={
          <WidgetCard>
            <h3 className="text-xl font-semibold text-[#1a1a1a]">Friend Leaderboard</h3>
            <p className="mt-2 text-sm text-[#6b7280]">Widget coming in Phase 4</p>
          </WidgetCard>
        }
      />
    </DashboardGrid>
  );
}
```

**Step 2: Test build**

Run: `pnpm build`
Expected: Build succeeds with no errors

**Step 3: Test in development**

Run: `pnpm dev`
Navigate to: `http://localhost:3000/dashboard`
Expected: New grid layout renders with hero card, quick stat, and placeholder widgets

**Step 4: Commit**

```bash
git add app/(protected)/dashboard/page.tsx
git commit -m "feat(dashboard): implement Phase 1 layout

- New grid layout with TopRow/MiddleRow/BottomRow
- TodayActivityHero with calculated streak multiplier
- QuickStat showing current streak
- Placeholder widgets for Phase 2-4 features
- All components render without errors

Part of dashboard redesign Phase 1"
```

---

## Phase 2: Data Visualizations (Tasks 9-14)

### Task 9: Create Sparkline chart component

**Files:**
- Create: `components/dashboard/widgets/shared/Sparkline.tsx`

**Step 1: Install Recharts (if needed)**

Check: `grep recharts package.json`
Expected: "recharts": "2.15.4" already exists
Skip: Installation (already installed)

**Step 2: Create Sparkline component**

Create `components/dashboard/widgets/shared/Sparkline.tsx`:

```typescript
"use client";

import { BarChart, Bar, ResponsiveContainer, Tooltip, Cell } from "recharts";

interface SparklineProps {
  data: Array<{
    day: string;
    xp: number;
    isToday: boolean;
  }>;
}

export function Sparkline({ data }: SparklineProps) {
  // Gradient color mapping based on XP value
  const getBarColor = (xp: number, isToday: boolean) => {
    if (isToday) {
      return "#f59e0b"; // Orange for today
    }
    if (xp >= 300) return "#8b5cf6"; // Purple for high XP
    if (xp >= 150) return "#3b82f6"; // Blue for medium XP
    if (xp >= 50) return "#06b6d4"; // Teal for low XP
    return "#4b5563"; // Gray for minimal XP
  };

  return (
    <ResponsiveContainer width="100%" height={80}>
      <BarChart data={data} barGap={2}>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload[0]) {
              return (
                <div className="rounded-lg border border-white/20 bg-[#0a0e1a] px-3 py-2">
                  <p className="text-xs text-[#8b92a8]">{payload[0].payload.day}</p>
                  <p className="text-sm font-semibold text-white">
                    {payload[0].value} XP
                  </p>
                </div>
              );
            }
            return null;
          }}
          cursor={false}
        />
        <Bar dataKey="xp" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={getBarColor(entry.xp, entry.isToday)}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
```

**Step 3: Update shared index exports**

Modify `components/dashboard/widgets/shared/index.ts`:

```typescript
export { WidgetCard } from "./WidgetCard";
export { DarkCard } from "./DarkCard";
export { Sparkline } from "./Sparkline";
```

**Step 4: Verify TypeScript compilation**

Run: `pnpm tsc --noEmit`
Expected: No errors

**Step 5: Commit**

```bash
git add components/dashboard/widgets/shared/Sparkline.tsx
git add components/dashboard/widgets/shared/index.ts
git commit -m "feat(dashboard): add Sparkline visualization component

- 7-day bar chart using Recharts
- Gradient color mapping (purple → blue → teal → orange)
- Today highlighted in orange
- Hover tooltip shows day and XP
- Client component for interactivity

Part of dashboard redesign Phase 2"
```

---

### Task 10: Add sparkline to TodayActivityHero

**Files:**
- Modify: `components/dashboard/widgets/TodayActivityHero.tsx`

**Step 1: Update TodayActivityHero to accept weekly data**

Replace `components/dashboard/widgets/TodayActivityHero.tsx`:

```typescript
import { DarkCard, Sparkline } from "./shared";
import Link from "next/link";

interface TodayActivityHeroProps {
  caloriesBurned: number;
  activeMinutes: number;
  xpEarned: number;
  streakMultiplier: number;
  weeklyXpData: Array<{
    day: string;
    xp: number;
    isToday: boolean;
  }>;
}

export function TodayActivityHero({
  caloriesBurned,
  activeMinutes,
  xpEarned,
  streakMultiplier,
  weeklyXpData,
}: TodayActivityHeroProps) {
  return (
    <DarkCard>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-white">
            Today's Activity
          </h2>
          <p className="mt-1 text-sm text-[#8b92a8]">
            Your Path to Fitness Excellence
          </p>
        </div>

        {/* Metrics */}
        <div className="flex gap-8">
          <Metric
            icon="🔥"
            value={caloriesBurned}
            unit="kcal"
            label="Calories Burned"
          />
          <Metric
            icon="⏱️"
            value={activeMinutes}
            unit="min"
            label="Active Minutes"
          />
          <Metric
            icon="⭐"
            value={xpEarned}
            suffix={`+${streakMultiplier.toFixed(1)}x`}
            label="XP Earned"
          />
        </div>
      </div>

      {/* Sparkline */}
      <div className="mb-4">
        <Sparkline data={weeklyXpData} />
      </div>

      {/* Action button */}
      <div className="flex justify-end">
        <Link
          href="/dashboard/workouts/new"
          className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white transition-colors hover:bg-white/10"
        >
          + Start Workout
        </Link>
      </div>
    </DarkCard>
  );
}

interface MetricProps {
  icon: string;
  value: number;
  unit?: string;
  suffix?: string;
  label: string;
}

function Metric({ icon, value, unit, suffix, label }: MetricProps) {
  return (
    <div className="text-right">
      <div className="mb-1 flex items-baseline gap-1">
        <span className="text-xs">{icon}</span>
        <span className="text-2xl font-semibold tabular-nums text-white">
          {value}
        </span>
        {unit && <span className="text-xs text-[#8b92a8]">{unit}</span>}
      </div>
      {suffix && (
        <div className="text-xs text-[#8b92a8]">{suffix}</div>
      )}
      <div className="sr-only">{label}</div>
    </div>
  );
}
```

**Step 2: Update dashboard page to fetch weekly XP data**

Modify `app/(protected)/dashboard/page.tsx` - add after user fetch:

```typescript
// Fetch last 7 days of XP data
const today = new Date();
const sevenDaysAgo = new Date(today);
sevenDaysAgo.setDate(today.getDate() - 6);

// Get workouts from last 7 days
const { data: recentWorkouts } = await supabase
  .from("workouts")
  .select("created_at")
  .eq("user_id", user.id)
  .gte("created_at", sevenDaysAgo.toISOString())
  .order("created_at", { ascending: true });

// Get meals from last 7 days
const { data: recentMeals } = await supabase
  .from("meals")
  .select("created_at")
  .eq("user_id", user.id)
  .gte("created_at", sevenDaysAgo.toISOString())
  .order("created_at", { ascending: true });

// Build daily XP totals for last 7 days
const weeklyXpData = Array.from({ length: 7 }, (_, i) => {
  const date = new Date(sevenDaysAgo);
  date.setDate(date.getDate() + i);
  const dayStr = date.toLocaleDateString("en-US", { weekday: "short" });
  const dateStr = date.toISOString().split("T")[0];

  // Count workouts and meals for this day
  const workoutsCount = recentWorkouts?.filter(w =>
    w.created_at.startsWith(dateStr)
  ).length || 0;
  const mealsCount = recentMeals?.filter(m =>
    m.created_at.startsWith(dateStr)
  ).length || 0;

  // Calculate XP (50 per workout, 10 per meal)
  const xp = (workoutsCount * 50) + (mealsCount * 10);

  return {
    day: dayStr,
    xp,
    isToday: dateStr === today.toISOString().split("T")[0],
  };
});
```

Then update the TodayActivityHero component call:

```typescript
<TodayActivityHero
  caloriesBurned={caloriesBurned}
  activeMinutes={activeMinutes}
  xpEarned={xpEarned}
  streakMultiplier={streakMultiplier}
  weeklyXpData={weeklyXpData}
/>
```

**Step 3: Test visualization**

Run: `pnpm dev`
Navigate to: `/dashboard`
Expected: Sparkline renders with 7 bars, gradient colors, hover tooltips work

**Step 4: Commit**

```bash
git add components/dashboard/widgets/TodayActivityHero.tsx
git add app/(protected)/dashboard/page.tsx
git commit -m "feat(dashboard): integrate sparkline into hero card

- Fetch last 7 days workout + meal data
- Calculate daily XP totals (50/workout, 10/meal)
- Render sparkline with gradient colors
- Today highlighted in orange
- Hover shows day and XP value

Part of dashboard redesign Phase 2"
```

---

### Task 11: Create ActivityHeatmap component

**Files:**
- Create: `components/dashboard/widgets/ActivityHeatmap.tsx`

**Step 1: Create ActivityHeatmap component**

Create `components/dashboard/widgets/ActivityHeatmap.tsx`:

```typescript
"use client";

import { useState } from "react";
import { WidgetCard } from "./shared";

interface HeatmapDay {
  date: string;
  xp: number;
}

interface ActivityHeatmapProps {
  data: HeatmapDay[];
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);

  // Get color based on XP value
  const getColor = (xp: number) => {
    if (xp === 0) return "#f3f4f6"; // No activity
    if (xp <= 50) return "#dbeafe"; // Very light blue
    if (xp <= 150) return "#93c5fd"; // Light blue
    if (xp <= 300) return "#3b82f6"; // Medium blue
    return "#1e40af"; // Dark blue
  };

  // Group by week (7 days per row)
  const weeks: HeatmapDay[][] = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  return (
    <WidgetCard>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-[#1a1a1a]">Activity Heatmap</h3>
        <p className="text-xs text-[#6b7280]">Last 90 days</p>
      </div>

      <div className="space-y-1">
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="flex gap-1">
            {week.map((day, dayIdx) => (
              <div
                key={dayIdx}
                className="relative h-3 w-3 rounded-sm transition-transform hover:scale-125"
                style={{ backgroundColor: getColor(day.xp) }}
                onMouseEnter={() => setHoveredDay(day)}
                onMouseLeave={() => setHoveredDay(null)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {hoveredDay && (
        <div className="mt-4 rounded-lg bg-[#f3f4f6] p-3 text-sm">
          <p className="font-semibold text-[#1a1a1a]">
            {new Date(hoveredDay.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <p className="text-[#6b7280]">{hoveredDay.xp} XP earned</p>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex items-center justify-end gap-2 text-xs text-[#6b7280]">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="h-3 w-3 rounded-sm bg-[#f3f4f6]" />
          <div className="h-3 w-3 rounded-sm bg-[#dbeafe]" />
          <div className="h-3 w-3 rounded-sm bg-[#93c5fd]" />
          <div className="h-3 w-3 rounded-sm bg-[#3b82f6]" />
          <div className="h-3 w-3 rounded-sm bg-[#1e40af]" />
        </div>
        <span>More</span>
      </div>
    </WidgetCard>
  );
}
```

**Step 2: Verify TypeScript compilation**

Run: `pnpm tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add components/dashboard/widgets/ActivityHeatmap.tsx
git commit -m "feat(dashboard): add ActivityHeatmap widget

- GitHub-style heatmap grid (13 weeks × 7 days)
- Color scale based on XP (5 levels)
- Hover tooltip shows date and XP
- Color legend at bottom
- Client component for interactivity

Part of dashboard redesign Phase 2"
```

---

### Task 12: Integrate ActivityHeatmap into dashboard

**Files:**
- Modify: `app/(protected)/dashboard/page.tsx`

**Step 1: Import ActivityHeatmap**

Add to imports in `app/(protected)/dashboard/page.tsx`:

```typescript
import { ActivityHeatmap } from "@/components/dashboard/widgets/ActivityHeatmap";
```

**Step 2: Fetch 90 days of XP data**

Add after weekly XP data fetch:

```typescript
// Fetch last 90 days of XP data for heatmap
const ninetyDaysAgo = new Date(today);
ninetyDaysAgo.setDate(today.getDate() - 89);

const { data: heatmapWorkouts } = await supabase
  .from("workouts")
  .select("created_at")
  .eq("user_id", user.id)
  .gte("created_at", ninetyDaysAgo.toISOString());

const { data: heatmapMeals } = await supabase
  .from("meals")
  .select("created_at")
  .eq("user_id", user.id)
  .gte("created_at", ninetyDaysAgo.toISOString());

// Build daily XP totals for last 90 days
const heatmapData = Array.from({ length: 90 }, (_, i) => {
  const date = new Date(ninetyDaysAgo);
  date.setDate(date.getDate() + i);
  const dateStr = date.toISOString().split("T")[0];

  const workoutsCount = heatmapWorkouts?.filter(w =>
    w.created_at.startsWith(dateStr)
  ).length || 0;
  const mealsCount = heatmapMeals?.filter(m =>
    m.created_at.startsWith(dateStr)
  ).length || 0;

  const xp = (workoutsCount * 50) + (mealsCount * 10);

  return { date: dateStr, xp };
});
```

**Step 3: Replace heatmap placeholder in BottomRow**

Replace the heatmap WidgetCard:

```typescript
<BottomRow
  heatmap={<ActivityHeatmap data={heatmapData} />}
  leaderboard={
    <WidgetCard>
      <h3 className="text-xl font-semibold text-[#1a1a1a]">Friend Leaderboard</h3>
      <p className="mt-2 text-sm text-[#6b7280]">Widget coming in Phase 4</p>
    </WidgetCard>
  }
/>
```

**Step 4: Test heatmap visualization**

Run: `pnpm dev`
Navigate to: `/dashboard`
Expected:
- Heatmap renders with 90 days of data (13 weeks)
- Hover shows date and XP tooltip
- Colors change based on activity level

**Step 5: Commit**

```bash
git add app/(protected)/dashboard/page.tsx
git commit -m "feat(dashboard): integrate ActivityHeatmap

- Fetch 90 days of workout and meal data
- Calculate daily XP for each day
- Render heatmap in bottom row
- Hover tooltips functional

Part of dashboard redesign Phase 2"
```

---

### Task 13: Create CircularGauge component for nutrition

**Files:**
- Create: `components/dashboard/widgets/shared/CircularGauge.tsx`

**Step 1: Create CircularGauge component**

Create `components/dashboard/widgets/shared/CircularGauge.tsx`:

```typescript
"use client";

interface CircularGaugeProps {
  value: number;
  max: number;
  label: string;
}

export function CircularGauge({ value, max, label }: CircularGaugeProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative">
      {/* SVG Circle */}
      <svg className="h-48 w-48 -rotate-90" viewBox="0 0 200 200">
        {/* Background circle */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          stroke="#f3f4f6"
          strokeWidth="12"
          fill="none"
        />

        {/* Progress circle with gradient */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          stroke="url(#gradient)"
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>

        {/* Radiating lines decoration */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * 15 * Math.PI) / 180;
          const x1 = 100 + Math.cos(angle) * 90;
          const y1 = 100 + Math.sin(angle) * 90;
          const x2 = 100 + Math.cos(angle) * 95;
          const y2 = 100 + Math.sin(angle) * 95;

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          );
        })}
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl font-bold tabular-nums text-[#1a1a1a]">
          {value}
        </div>
        <div className="text-sm text-[#6b7280]">
          / {max} {label}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Update shared index**

Modify `components/dashboard/widgets/shared/index.ts`:

```typescript
export { WidgetCard } from "./WidgetCard";
export { DarkCard } from "./DarkCard";
export { Sparkline } from "./Sparkline";
export { CircularGauge } from "./CircularGauge";
```

**Step 3: Verify TypeScript compilation**

Run: `pnpm tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add components/dashboard/widgets/shared/CircularGauge.tsx
git add components/dashboard/widgets/shared/index.ts
git commit -m "feat(dashboard): add CircularGauge component

- SVG-based circular progress gauge
- Gradient stroke (blue to teal)
- Radiating lines decoration
- Center shows value/max with label
- Smooth transitions on value change

Part of dashboard redesign Phase 2"
```

---

### Task 14: Create NutritionSnapshot widget

**Files:**
- Create: `components/dashboard/widgets/NutritionSnapshot.tsx`

**Step 1: Create NutritionSnapshot component**

Create `components/dashboard/widgets/NutritionSnapshot.tsx`:

```typescript
import { WidgetCard, CircularGauge } from "./shared";
import Link from "next/link";

interface NutritionSnapshotProps {
  caloriesConsumed: number;
  caloriesGoal: number;
  proteinPercent: number;
  waterLiters: number;
  waterGoal: number;
}

export function NutritionSnapshot({
  caloriesConsumed,
  caloriesGoal,
  proteinPercent,
  waterLiters,
  waterGoal,
}: NutritionSnapshotProps) {
  return (
    <WidgetCard>
      <h3 className="mb-4 text-xl font-semibold text-[#1a1a1a]">
        Nutrition Tracking
      </h3>

      {/* Top row metrics */}
      <div className="mb-6 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="mb-1 text-xs text-[#6b7280]">🍽️ Calories</div>
          <div className="text-lg font-semibold tabular-nums text-[#1a1a1a]">
            {caloriesConsumed.toLocaleString()}
          </div>
          <div className="text-xs text-[#6b7280]">
            / {caloriesGoal.toLocaleString()}
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs text-[#6b7280]">💪 Protein</div>
          <div className="text-lg font-semibold tabular-nums text-[#1a1a1a]">
            {proteinPercent}%
          </div>
          <div className="text-xs text-[#6b7280]">of goal</div>
        </div>

        <div>
          <div className="mb-1 text-xs text-[#6b7280]">💧 Water</div>
          <div className="text-lg font-semibold tabular-nums text-[#1a1a1a]">
            {waterLiters.toFixed(1)}L
          </div>
          <div className="text-xs text-[#6b7280]">/ {waterGoal}L</div>
        </div>
      </div>

      {/* Circular gauge */}
      <div className="flex justify-center">
        <CircularGauge
          value={caloriesConsumed}
          max={caloriesGoal}
          label="kcal/day"
        />
      </div>

      {/* Action button */}
      <div className="mt-6 flex justify-end">
        <Link
          href="/dashboard/food/new"
          className="rounded-lg border border-black/10 px-4 py-2 text-sm text-[#1a1a1a] transition-colors hover:bg-black/5"
        >
          + Log meal
        </Link>
      </div>
    </WidgetCard>
  );
}
```

**Step 2: Integrate NutritionSnapshot into dashboard**

Modify `app/(protected)/dashboard/page.tsx`:

Import:
```typescript
import { NutritionSnapshot } from "@/components/dashboard/widgets/NutritionSnapshot";
```

Add after user fetch:
```typescript
// Fetch user goals
const { data: goals } = await supabase
  .from("user_goals")
  .select("daily_calories, daily_protein_g, daily_water_l")
  .eq("user_id", user.id)
  .single();

// Fetch today's meals
const todayStart = new Date(today);
todayStart.setHours(0, 0, 0, 0);

const { data: todayMeals } = await supabase
  .from("meals")
  .select("calories, protein_g")
  .eq("user_id", user.id)
  .gte("created_at", todayStart.toISOString());

// Calculate nutrition totals
const caloriesConsumed = todayMeals?.reduce((sum, meal) => sum + (meal.calories || 0), 0) || 0;
const proteinConsumed = todayMeals?.reduce((sum, meal) => sum + (meal.protein_g || 0), 0) || 0;
const proteinPercent = goals?.daily_protein_g
  ? Math.round((proteinConsumed / goals.daily_protein_g) * 100)
  : 0;

// Water tracking - placeholder (will be manual entry in Phase 5)
const waterLiters = 0;
```

Replace nutrition widget in MiddleRow:
```typescript
<NutritionSnapshot
  caloriesConsumed={caloriesConsumed}
  caloriesGoal={goals?.daily_calories || 2200}
  proteinPercent={proteinPercent}
  waterLiters={waterLiters}
  waterGoal={goals?.daily_water_l || 2.5}
/>
```

**Step 3: Test nutrition widget**

Run: `pnpm dev`
Navigate to: `/dashboard`
Expected:
- Nutrition widget renders with 3 metrics
- Circular gauge shows calorie progress
- "+ Log meal" button visible

**Step 4: Commit**

```bash
git add components/dashboard/widgets/NutritionSnapshot.tsx
git add app/(protected)/dashboard/page.tsx
git commit -m "feat(dashboard): add NutritionSnapshot widget

- 3 top metrics: calories, protein %, water
- Circular gauge for calorie tracking
- Radiating lines decoration
- Fetches user goals and today's meals
- Quick action: Log meal button

Part of dashboard redesign Phase 2 complete ✅"
```

---

## Phase 3: Workout Planning & Goals (Tasks 15-20)

### Task 15: Create WeeklySchedule widget component

**Files:**
- Create: `components/dashboard/widgets/WeeklySchedule.tsx`

**Step 1: Create WeeklySchedule component**

Create `components/dashboard/widgets/WeeklySchedule.tsx`:

```typescript
"use client";

import { WidgetCard } from "./shared";
import { Dumbbell, Activity } from "lucide-react";

interface DayPlan {
  date: string;
  dayOfWeek: string;
  dayNum: number;
  workoutType: "strength" | "cardio" | "rest" | null;
  status: "planned" | "completed" | "skipped" | null;
  isToday: boolean;
}

interface WeeklyScheduleProps {
  weekData: DayPlan[];
  onDayClick?: (date: string) => void;
}

export function WeeklySchedule({ weekData, onDayClick }: WeeklyScheduleProps) {
  const getStatusColor = (status: DayPlan["status"], workoutType: DayPlan["workoutType"]) => {
    if (status === "completed") return "bg-green-500";
    if (status === "skipped") return "bg-red-400";
    if (status === "planned") {
      if (workoutType === "strength") return "bg-purple-500";
      if (workoutType === "cardio") return "bg-blue-500";
      return "bg-gray-400";
    }
    return "bg-gray-200";
  };

  const getIcon = (workoutType: DayPlan["workoutType"]) => {
    if (workoutType === "strength") return <Dumbbell className="h-3 w-3" />;
    if (workoutType === "cardio") return <Activity className="h-3 w-3" />;
    return null;
  };

  return (
    <WidgetCard>
      <h3 className="mb-4 text-xl font-semibold text-[#1a1a1a]">
        Weekly Schedule
      </h3>

      <div className="grid grid-cols-7 gap-2">
        {weekData.map((day) => (
          <button
            key={day.date}
            onClick={() => onDayClick?.(day.date)}
            className={`flex flex-col items-center rounded-lg p-2 transition-colors ${
              day.isToday ? "bg-[#f3f4f6]" : "hover:bg-gray-50"
            }`}
          >
            {/* Day letter */}
            <div className="mb-1 text-xs font-medium text-[#6b7280]">
              {day.dayOfWeek[0]}
            </div>

            {/* Day number */}
            <div className="mb-2 text-sm font-semibold text-[#1a1a1a]">
              {day.dayNum}
            </div>

            {/* Status indicator */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`h-2 w-2 rounded-full ${getStatusColor(
                  day.status,
                  day.workoutType
                )}`}
              />
              {day.workoutType && (
                <div className="text-[#6b7280]">{getIcon(day.workoutType)}</div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-[#6b7280]">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-purple-500" />
          <span>Strength</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
          <span>Cardio</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-gray-200" />
          <span>Rest</span>
        </div>
      </div>

      {/* Action */}
      <div className="mt-4 flex justify-end">
        <button className="rounded-lg border border-black/10 px-4 py-2 text-sm text-[#1a1a1a] transition-colors hover:bg-black/5">
          + Plan workout
        </button>
      </div>
    </WidgetCard>
  );
}
```

**Step 2: Verify TypeScript compilation**

Run: `pnpm tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add components/dashboard/widgets/WeeklySchedule.tsx
git commit -m "feat(dashboard): add WeeklySchedule widget

- 7-column calendar view (Mon-Sun)
- Color-coded dots: strength (purple), cardio (blue), completed (green)
- Today highlighted with background
- Status indicators and icons
- Click handler for planning (modal TBD)

Part of dashboard redesign Phase 3"
```

---

### Task 16: Integrate WeeklySchedule into dashboard

**Files:**
- Modify: `app/(protected)/dashboard/page.tsx`

**Step 1: Import WeeklySchedule**

Add to imports:
```typescript
import { WeeklySchedule } from "@/components/dashboard/widgets/WeeklySchedule";
```

**Step 2: Fetch current week's workout plans and actual workouts**

Add after nutrition data fetch:

```typescript
// Get start of current week (Monday)
const startOfWeek = new Date(today);
startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
startOfWeek.setHours(0, 0, 0, 0);

const endOfWeek = new Date(startOfWeek);
endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
endOfWeek.setHours(23, 59, 59, 999);

// Fetch workout plans for this week
const { data: weekPlans } = await supabase
  .from("workout_plans")
  .select("date, workout_type, status")
  .eq("user_id", user.id)
  .gte("date", startOfWeek.toISOString().split("T")[0])
  .lte("date", endOfWeek.toISOString().split("T")[0]);

// Fetch actual workouts this week
const { data: weekWorkouts } = await supabase
  .from("workouts")
  .select("created_at")
  .eq("user_id", user.id)
  .gte("created_at", startOfWeek.toISOString())
  .lte("created_at", endOfWeek.toISOString());

// Build week data
const weekData = Array.from({ length: 7 }, (_, i) => {
  const date = new Date(startOfWeek);
  date.setDate(date.getDate() + i);
  const dateStr = date.toISOString().split("T")[0];

  // Find plan for this day
  const plan = weekPlans?.find(p => p.date === dateStr);

  // Check if workout was completed
  const hasWorkout = weekWorkouts?.some(w =>
    w.created_at.startsWith(dateStr)
  );

  return {
    date: dateStr,
    dayOfWeek: date.toLocaleDateString("en-US", { weekday: "long" }),
    dayNum: date.getDate(),
    workoutType: plan?.workout_type || null,
    status: hasWorkout ? "completed" : (plan?.status || null),
    isToday: dateStr === today.toISOString().split("T")[0],
  };
});
```

**Step 3: Replace schedule placeholder in MiddleRow**

Replace the schedule WidgetCard:

```typescript
<WeeklySchedule weekData={weekData} />
```

**Step 4: Test schedule widget**

Run: `pnpm dev`
Navigate to: `/dashboard`
Expected:
- 7-column calendar renders
- Today is highlighted
- Legend shows color meanings

**Step 5: Commit**

```bash
git add app/(protected)/dashboard/page.tsx
git commit -m "feat(dashboard): integrate WeeklySchedule widget

- Fetch current week's workout plans
- Fetch actual workouts to mark completed
- Build 7-day data array with status
- Render schedule with color coding

Part of dashboard redesign Phase 3"
```

---

### Task 17: Calculate calories burned and active minutes

**Files:**
- Modify: `app/(protected)/dashboard/page.tsx`

**Step 1: Add calories and duration calculation**

Replace the temporary calculation section with:

```typescript
// Fetch today's workouts with exercises
const { data: todayWorkouts } = await supabase
  .from("workouts")
  .select(`
    id,
    duration_minutes,
    exercises (
      sets,
      reps,
      weight_value
    )
  `)
  .eq("user_id", user.id)
  .gte("created_at", todayStart.toISOString());

// Calculate active minutes
const activeMinutes = todayWorkouts?.reduce(
  (sum, workout) => sum + (workout.duration_minutes || 0),
  0
) || 0;

// Estimate calories burned (simple formula: 5-8 cal/min based on intensity)
// For now, use 6 cal/min average
const caloriesBurned = Math.round(activeMinutes * 6);

// Fetch today's XP from activity_feed
const { data: todayActivities } = await supabase
  .from("activity_feed")
  .select("activity_data")
  .eq("user_id", user.id)
  .gte("created_at", todayStart.toISOString())
  .in("activity_type", ["workout", "meal", "pr"]);

// Sum XP from activities
const xpEarned = todayActivities?.reduce((sum, activity) => {
  const data = activity.activity_data as any;
  return sum + (data.xp_earned || 0);
}, 0) || 0;
```

**Step 2: Update TodayActivityHero with real data**

The component call already uses these values, just verify they're passed correctly:

```typescript
<TodayActivityHero
  caloriesBurned={caloriesBurned}
  activeMinutes={activeMinutes}
  xpEarned={xpEarned}
  streakMultiplier={streakMultiplier}
  weeklyXpData={weeklyXpData}
/>
```

**Step 3: Test calculated metrics**

Run: `pnpm dev`
Navigate to: `/dashboard`
Expected:
- If you have workouts today, calories and active minutes show real values
- XP earned shows today's total

**Step 4: Commit**

```bash
git add app/(protected)/dashboard/page.tsx
git commit -m "feat(dashboard): calculate real calories and active time

- Fetch today's workouts with duration
- Sum active minutes from workout durations
- Estimate calories (6 cal/min average)
- Fetch today's XP from activity_feed
- Display real data in hero card

Part of dashboard redesign Phase 3"
```

---

### Task 18: Create AchievementProgress widget

**Files:**
- Create: `components/dashboard/widgets/AchievementProgress.tsx`

**Step 1: Create ProgressBar sub-component**

Create `components/dashboard/widgets/shared/ProgressBar.tsx`:

```typescript
interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
}

export function ProgressBar({ value, max, color = "#3b82f6" }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#f3f4f6]">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${percentage}%`,
          background: `linear-gradient(90deg, ${color}, ${color}dd)`,
        }}
      />
    </div>
  );
}
```

Update `components/dashboard/widgets/shared/index.ts`:

```typescript
export { WidgetCard } from "./WidgetCard";
export { DarkCard } from "./DarkCard";
export { Sparkline } from "./Sparkline";
export { CircularGauge } from "./CircularGauge";
export { ProgressBar } from "./ProgressBar";
```

**Step 2: Create AchievementProgress component**

Create `components/dashboard/widgets/AchievementProgress.tsx`:

```typescript
import { WidgetCard, ProgressBar } from "./shared";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface Achievement {
  code: string;
  name: string;
  description: string;
  tier?: "bronze" | "silver" | "gold";
  progress?: number;
  max?: number;
  unlockedAt?: string;
}

interface AchievementProgressProps {
  recentUnlock?: Achievement;
  inProgress: Achievement[];
}

export function AchievementProgress({
  recentUnlock,
  inProgress,
}: AchievementProgressProps) {
  const getTierColor = (tier: Achievement["tier"]) => {
    if (tier === "gold") return "#f59e0b";
    if (tier === "silver") return "#9ca3af";
    return "#cd7f32";
  };

  const getProgressColor = (code: string) => {
    if (code.includes("strength")) return "#8b5cf6";
    if (code.includes("streak")) return "#f59e0b";
    return "#3b82f6";
  };

  return (
    <WidgetCard>
      <h3 className="mb-4 text-xl font-semibold text-[#1a1a1a]">
        Achievements
      </h3>

      {/* Recent unlock */}
      {recentUnlock && (
        <div className="mb-6 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 p-4">
          <p className="mb-2 text-xs font-medium text-[#6b7280]">
            ✨ Latest Achievement
          </p>
          <div className="mb-1 flex items-center gap-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full text-lg"
              style={{ backgroundColor: getTierColor(recentUnlock.tier) }}
            >
              🏆
            </span>
            <div>
              <h4 className="font-semibold text-[#1a1a1a]">
                {recentUnlock.name}
              </h4>
              {recentUnlock.tier && (
                <p className="text-xs capitalize text-[#6b7280]">
                  {recentUnlock.tier}
                </p>
              )}
            </div>
          </div>
          {recentUnlock.unlockedAt && (
            <p className="text-xs text-[#6b7280]">
              Unlocked{" "}
              {formatDistanceToNow(new Date(recentUnlock.unlockedAt), {
                addSuffix: true,
              })}
            </p>
          )}
        </div>
      )}

      {/* In progress */}
      <div>
        <p className="mb-3 text-sm font-medium text-[#6b7280]">In Progress</p>
        <div className="space-y-4">
          {inProgress.map((achievement) => {
            const percentage = achievement.progress && achievement.max
              ? Math.round((achievement.progress / achievement.max) * 100)
              : 0;

            return (
              <div key={achievement.code}>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {achievement.code.includes("strength") ? "🏋️" :
                       achievement.code.includes("streak") ? "🔥" : "📈"}
                    </span>
                    <span className="text-sm font-medium text-[#1a1a1a]">
                      {achievement.name}
                    </span>
                  </div>
                  <span className="text-xs tabular-nums text-[#6b7280]">
                    {percentage}%
                  </span>
                </div>
                <ProgressBar
                  value={achievement.progress || 0}
                  max={achievement.max || 100}
                  color={getProgressColor(achievement.code)}
                />
                <p className="mt-1 text-xs text-[#6b7280]">
                  {achievement.progress} / {achievement.max}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* View all */}
      <div className="mt-6 flex justify-end">
        <Link
          href="/dashboard/achievements"
          className="text-sm text-[#3b82f6] hover:underline"
        >
          View all achievements →
        </Link>
      </div>
    </WidgetCard>
  );
}
```

**Step 3: Verify TypeScript compilation**

Run: `pnpm tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add components/dashboard/widgets/shared/ProgressBar.tsx
git add components/dashboard/widgets/shared/index.ts
git add components/dashboard/widgets/AchievementProgress.tsx
git commit -m "feat(dashboard): add AchievementProgress widget

- ProgressBar component with gradient colors
- Recent unlock section with tier badge
- In-progress achievements with % and fraction
- Color-coded by achievement type
- Link to full achievements page

Part of dashboard redesign Phase 3"
```

---

### Task 19: Integrate AchievementProgress into dashboard

**Files:**
- Modify: `app/(protected)/dashboard/page.tsx`

**Step 1: Import AchievementProgress**

Add to imports:
```typescript
import { AchievementProgress } from "@/components/dashboard/widgets/AchievementProgress";
```

**Step 2: Fetch achievement data**

Add after weekly schedule data:

```typescript
// Fetch recent achievement unlocks (last 48 hours)
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(today.getDate() - 2);

const { data: recentUnlocks } = await supabase
  .from("user_achievements")
  .select(`
    unlocked_at,
    tier,
    achievements (
      code,
      name,
      description
    )
  `)
  .eq("user_id", user.id)
  .gte("unlocked_at", twoDaysAgo.toISOString())
  .order("unlocked_at", { ascending: false })
  .limit(1);

const recentUnlock = recentUnlocks && recentUnlocks[0] ? {
  code: (recentUnlocks[0].achievements as any).code,
  name: (recentUnlocks[0].achievements as any).name,
  description: (recentUnlocks[0].achievements as any).description,
  tier: recentUnlocks[0].tier as "bronze" | "silver" | "gold",
  unlockedAt: recentUnlocks[0].unlocked_at,
} : undefined;

// Fetch all achievements to calculate progress
const { data: allAchievements } = await supabase
  .from("achievements")
  .select("code, name, description, requirement_count");

// Calculate progress for each achievement
const achievementsWithProgress = (allAchievements || []).map((achievement) => {
  // Simple progress calculation based on achievement type
  let progress = 0;
  let max = achievement.requirement_count || 100;

  if (achievement.code.includes("workout")) {
    progress = stats?.total_workouts || 0;
  } else if (achievement.code.includes("streak")) {
    progress = stats?.current_workout_streak || 0;
  } else if (achievement.code.includes("level")) {
    progress = stats?.level || 1;
  }

  return {
    code: achievement.code,
    name: achievement.name,
    description: achievement.description,
    progress,
    max,
  };
});

// Filter to in-progress (not completed, >0% progress)
const inProgressAchievements = achievementsWithProgress
  .filter((a) => a.progress > 0 && a.progress < a.max)
  .sort((a, b) => (b.progress / b.max) - (a.progress / a.max))
  .slice(0, 3);
```

**Step 3: Replace "Sleep & Recovery" placeholder with AchievementProgress**

In the MiddleRow, replace the Sleep widget:

```typescript
<MiddleRow>
  <WeeklySchedule weekData={weekData} />

  <AchievementProgress
    recentUnlock={recentUnlock}
    inProgress={inProgressAchievements}
  />

  <NutritionSnapshot
    caloriesConsumed={caloriesConsumed}
    caloriesGoal={goals?.daily_calories || 2200}
    proteinPercent={proteinPercent}
    waterLiters={waterLiters}
    waterGoal={goals?.daily_water_l || 2.5}
  />
</MiddleRow>
```

**Step 4: Test achievement widget**

Run: `pnpm dev`
Navigate to: `/dashboard`
Expected:
- If recent achievement, shows with tier badge and timestamp
- 3 in-progress achievements with progress bars
- Color-coded bars by achievement type

**Step 5: Commit**

```bash
git add app/(protected)/dashboard/page.tsx
git commit -m "feat(dashboard): integrate AchievementProgress

- Fetch recent unlocks from last 48 hours
- Calculate progress for all achievements
- Filter to top 3 in-progress (sorted by %)
- Replace Sleep widget with achievements
- Display with real data

Part of dashboard redesign Phase 3 complete ✅"
```

---

## Phase 4: Social & Gamification (Tasks 20-22)

### Task 20: Create database function for weekly XP leaderboard

**Files:**
- Create: `supabase/migrations/20251112000004_create_weekly_leaderboard_function.sql`

**Step 1: Create weekly leaderboard RPC function**

Create `supabase/migrations/20251112000004_create_weekly_leaderboard_function.sql`:

```sql
-- Function to get friend leaderboard for current week
CREATE OR REPLACE FUNCTION get_weekly_friend_leaderboard(
  requesting_user_id UUID,
  limit_count INTEGER DEFAULT 5
)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  display_name TEXT,
  level INTEGER,
  weekly_xp INTEGER,
  rank INTEGER,
  is_current_user BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH friend_ids AS (
    -- Get all friends (bi-directional)
    SELECT DISTINCT
      CASE
        WHEN f.user_id = requesting_user_id THEN f.friend_id
        ELSE f.user_id
      END AS friend_user_id
    FROM friendships f
    WHERE (f.user_id = requesting_user_id OR f.friend_id = requesting_user_id)
      AND f.status = 'accepted'

    UNION

    -- Include requesting user
    SELECT requesting_user_id AS friend_user_id
  ),
  weekly_xp_totals AS (
    -- Calculate XP earned this week for each friend
    SELECT
      af.user_id,
      COALESCE(SUM((af.activity_data->>'xp_earned')::INTEGER), 0) AS week_xp
    FROM activity_feed af
    INNER JOIN friend_ids fi ON af.user_id = fi.friend_user_id
    WHERE af.created_at >= date_trunc('week', NOW()) -- Monday of current week
      AND af.created_at < date_trunc('week', NOW()) + INTERVAL '7 days'
      AND af.activity_data->>'xp_earned' IS NOT NULL
    GROUP BY af.user_id
  )
  SELECT
    p.id AS user_id,
    p.username,
    p.display_name,
    us.level,
    COALESCE(wxt.week_xp, 0)::INTEGER AS weekly_xp,
    ROW_NUMBER() OVER (ORDER BY COALESCE(wxt.week_xp, 0) DESC, us.level DESC)::INTEGER AS rank,
    (p.id = requesting_user_id) AS is_current_user
  FROM friend_ids fi
  INNER JOIN profiles p ON fi.friend_user_id = p.id
  INNER JOIN user_stats us ON p.id = us.user_id
  LEFT JOIN weekly_xp_totals wxt ON p.id = wxt.user_id
  ORDER BY weekly_xp DESC, us.level DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Step 2: Apply migration**

Run: `npx supabase db push`
Expected: Migration applied successfully

**Step 3: Test function**

Query (replace user_id):
```sql
SELECT * FROM get_weekly_friend_leaderboard('your-user-id', 5);
```

Expected: Returns up to 5 rows with user data, weekly XP, and rank

**Step 4: Commit**

```bash
git add supabase/migrations/20251112000004_create_weekly_leaderboard_function.sql
git commit -m "feat(db): add weekly friend leaderboard function

- Calculates XP earned this week (Monday to Sunday)
- Includes requesting user and all friends
- Sorted by weekly XP DESC, then level DESC
- Returns rank, username, level, weekly XP
- Limited to top N results

Part of dashboard redesign Phase 4"
```

---

### Task 21: Create FriendLeaderboard widget

**Files:**
- Create: `components/dashboard/widgets/FriendLeaderboard.tsx`

**Step 1: Create FriendLeaderboard component**

Create `components/dashboard/widgets/FriendLeaderboard.tsx`:

```typescript
import { WidgetCard } from "./shared";
import Link from "next/link";

interface LeaderboardEntry {
  userId: string;
  username: string;
  displayName: string;
  level: number;
  weeklyXp: number;
  rank: number;
  isCurrentUser: boolean;
}

interface FriendLeaderboardProps {
  entries: LeaderboardEntry[];
  daysUntilReset: number;
}

export function FriendLeaderboard({
  entries,
  daysUntilReset,
}: FriendLeaderboardProps) {
  const getRankEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "";
  };

  return (
    <WidgetCard>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-[#1a1a1a]">
          Friend Leaderboard
        </h3>
        <p className="text-xs text-[#6b7280]">
          Resets in {daysUntilReset} {daysUntilReset === 1 ? "day" : "days"}
        </p>
      </div>

      <p className="mb-4 text-sm text-[#6b7280]">This Week's Warriors</p>

      {entries.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-[#6b7280]">
            Add friends to see the leaderboard!
          </p>
          <Link
            href="/dashboard/social/friends"
            className="mt-2 inline-block text-sm text-[#3b82f6] hover:underline"
          >
            Add friends →
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {entries.map((entry) => (
              <div
                key={entry.userId}
                className={`flex items-center justify-between rounded-lg p-3 transition-colors ${
                  entry.isCurrentUser
                    ? "bg-blue-50"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank */}
                  <div className="flex w-8 items-center justify-center">
                    {getRankEmoji(entry.rank) || (
                      <span className="text-sm text-[#6b7280]">
                        {entry.rank}
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <div>
                    <p className="font-medium text-[#1a1a1a]">
                      {entry.isCurrentUser ? "You" : entry.displayName || entry.username}
                    </p>
                    {!entry.isCurrentUser && (
                      <p className="text-xs text-[#6b7280]">@{entry.username}</p>
                    )}
                  </div>
                </div>

                {/* Level and XP */}
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3b82f6] text-xs font-semibold text-white">
                    {entry.level}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold tabular-nums text-[#1a1a1a]">
                      {entry.weeklyXp.toLocaleString()}
                    </p>
                    <p className="text-xs text-[#6b7280]">XP</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-end">
            <Link
              href="/dashboard/social"
              className="text-sm text-[#3b82f6] hover:underline"
            >
              View full leaderboard →
            </Link>
          </div>
        </>
      )}
    </WidgetCard>
  );
}
```

**Step 2: Verify TypeScript compilation**

Run: `pnpm tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add components/dashboard/widgets/FriendLeaderboard.tsx
git commit -m "feat(dashboard): add FriendLeaderboard widget

- Top 5 friends ranked by weekly XP
- Trophy emojis for top 3
- Current user row highlighted in blue
- Level badges and XP display
- Days until reset countdown
- Empty state with add friends link

Part of dashboard redesign Phase 4"
```

---

### Task 22: Integrate FriendLeaderboard into dashboard

**Files:**
- Modify: `app/(protected)/dashboard/page.tsx`

**Step 1: Import FriendLeaderboard**

Add to imports:
```typescript
import { FriendLeaderboard } from "@/components/dashboard/widgets/FriendLeaderboard";
```

**Step 2: Fetch leaderboard data**

Add after achievement data fetch:

```typescript
// Fetch weekly friend leaderboard
const { data: leaderboardData, error: leaderboardError } = await supabase
  .rpc("get_weekly_friend_leaderboard", {
    requesting_user_id: user.id,
    limit_count: 5,
  });

if (leaderboardError) {
  console.error("Failed to fetch leaderboard:", leaderboardError);
}

const leaderboardEntries = (leaderboardData || []).map((entry: any) => ({
  userId: entry.user_id,
  username: entry.username,
  displayName: entry.display_name,
  level: entry.level,
  weeklyXp: entry.weekly_xp,
  rank: entry.rank,
  isCurrentUser: entry.is_current_user,
}));

// Calculate days until reset (next Monday)
const nextMonday = new Date(today);
nextMonday.setDate(today.getDate() + ((8 - today.getDay()) % 7));
const daysUntilReset = Math.ceil(
  (nextMonday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
);
```

**Step 3: Replace leaderboard placeholder in BottomRow**

Replace the leaderboard WidgetCard:

```typescript
<BottomRow
  heatmap={<ActivityHeatmap data={heatmapData} />}
  leaderboard={
    <FriendLeaderboard
      entries={leaderboardEntries}
      daysUntilReset={daysUntilReset}
    />
  }
/>
```

**Step 4: Test leaderboard widget**

Run: `pnpm dev`
Navigate to: `/dashboard`
Expected:
- If you have friends, shows top 5 with weekly XP
- Your row highlighted in blue
- Trophy emojis for top 3
- If no friends, shows empty state

**Step 5: Commit**

```bash
git add app/(protected)/dashboard/page.tsx
git commit -m "feat(dashboard): integrate FriendLeaderboard

- Call get_weekly_friend_leaderboard RPC function
- Map results to component props
- Calculate days until Monday reset
- Render leaderboard in bottom row
- Handle empty state (no friends)

Part of dashboard redesign Phase 4 complete ✅"
```

---

## Phase 5: Polish & Final Touches (Tasks 23-25)

### Task 23: Add glow effect to QuickStat

**Files:**
- Modify: `components/dashboard/widgets/QuickStat.tsx`

**Step 1: Enhance glow effect with better gradients**

Replace `components/dashboard/widgets/QuickStat.tsx`:

```typescript
import { DarkCard } from "./shared";

interface QuickStatProps {
  label: string;
  value: number | string;
  unit?: string;
}

export function QuickStat({ label, value, unit }: QuickStatProps) {
  return (
    <DarkCard className="relative flex min-h-[280px] flex-col items-center justify-center overflow-hidden">
      <p className="relative z-10 mb-4 text-sm text-[#8b92a8]">{label}</p>

      {/* Enhanced glow effect */}
      <div className="relative z-10 mb-4 h-32 w-32">
        {/* Outer glow */}
        <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-yellow-500/30 via-green-500/20 to-blue-500/10 blur-3xl" />

        {/* Inner glow */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-yellow-400/40 via-green-400/30 to-transparent blur-2xl" />

        {/* Accent glow */}
        <div className="absolute inset-8 rounded-full bg-yellow-300/20 blur-xl" />
      </div>

      {/* Background ambient light */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-blue-500/5" />

      {/* Value */}
      <div className="relative z-10 text-center">
        <div className="text-7xl font-bold tabular-nums text-white">
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
        {unit && (
          <div className="mt-2 text-sm text-[#8b92a8]">{unit}</div>
        )}
      </div>
    </DarkCard>
  );
}
```

**Step 2: Test glow effect**

Run: `pnpm dev`
Navigate to: `/dashboard`
Expected: Quick stat card has organic glowing blob effect with subtle animation

**Step 3: Commit**

```bash
git add components/dashboard/widgets/QuickStat.tsx
git commit -m "feat(dashboard): enhance QuickStat glow effect

- Multi-layer gradient glows (outer, inner, accent)
- Subtle pulse animation
- Ambient background light
- Yellow-green-blue color scheme
- Blur effects for organic feel

Part of dashboard redesign Phase 5"
```

---

### Task 24: Add loading states and skeletons

**Files:**
- Create: `components/dashboard/widgets/shared/WidgetSkeleton.tsx`
- Modify: `app/(protected)/dashboard/loading.tsx`

**Step 1: Create WidgetSkeleton component**

Create `components/dashboard/widgets/shared/WidgetSkeleton.tsx`:

```typescript
import { WidgetCard, DarkCard } from "./";

export function WidgetCardSkeleton() {
  return (
    <WidgetCard>
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-1/3 rounded bg-gray-200" />
        <div className="h-24 rounded bg-gray-100" />
        <div className="h-4 w-1/2 rounded bg-gray-200" />
      </div>
    </WidgetCard>
  );
}

export function DarkCardSkeleton() {
  return (
    <DarkCard>
      <div className="animate-pulse space-y-4">
        <div className="flex justify-between">
          <div className="h-8 w-1/3 rounded bg-white/10" />
          <div className="h-8 w-1/4 rounded bg-white/10" />
        </div>
        <div className="h-20 rounded bg-white/5" />
        <div className="h-4 w-1/4 rounded bg-white/10" />
      </div>
    </DarkCard>
  );
}

export function HeatmapSkeleton() {
  return (
    <WidgetCard>
      <div className="mb-4 flex items-center justify-between">
        <div className="h-6 w-1/3 rounded bg-gray-200" />
        <div className="h-4 w-20 rounded bg-gray-200" />
      </div>
      <div className="space-y-1">
        {Array.from({ length: 13 }).map((_, i) => (
          <div key={i} className="flex gap-1">
            {Array.from({ length: 7 }).map((_, j) => (
              <div key={j} className="h-3 w-3 rounded-sm bg-gray-200" />
            ))}
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}
```

Update `components/dashboard/widgets/shared/index.ts`:

```typescript
export { WidgetCard } from "./WidgetCard";
export { DarkCard } from "./DarkCard";
export { Sparkline } from "./Sparkline";
export { CircularGauge } from "./CircularGauge";
export { ProgressBar } from "./ProgressBar";
export { WidgetCardSkeleton, DarkCardSkeleton, HeatmapSkeleton } from "./WidgetSkeleton";
```

**Step 2: Update dashboard loading page**

Replace `app/(protected)/dashboard/loading.tsx`:

```typescript
import { DashboardGrid, TopRow, MiddleRow, BottomRow } from "@/components/dashboard/DashboardGrid";
import {
  DarkCardSkeleton,
  WidgetCardSkeleton,
  HeatmapSkeleton,
} from "@/components/dashboard/widgets/shared";

export default function DashboardLoading() {
  return (
    <DashboardGrid>
      <TopRow
        hero={<DarkCardSkeleton />}
        quickStat={<DarkCardSkeleton />}
      />

      <MiddleRow>
        <WidgetCardSkeleton />
        <WidgetCardSkeleton />
        <WidgetCardSkeleton />
      </MiddleRow>

      <BottomRow
        heatmap={<HeatmapSkeleton />}
        leaderboard={<WidgetCardSkeleton />}
      />
    </DashboardGrid>
  );
}
```

**Step 3: Test loading state**

Add artificial delay to dashboard page (temporarily):
```typescript
await new Promise(resolve => setTimeout(resolve, 2000));
```

Run: `pnpm dev`
Navigate to: `/dashboard`
Expected: Skeleton screens show for 2 seconds before real content

Remove the delay after testing.

**Step 4: Commit**

```bash
git add components/dashboard/widgets/shared/WidgetSkeleton.tsx
git add components/dashboard/widgets/shared/index.ts
git add app/(protected)/dashboard/loading.tsx
git commit -m "feat(dashboard): add loading skeletons

- WidgetCardSkeleton for white cards
- DarkCardSkeleton for dark hero cards
- HeatmapSkeleton with grid pattern
- Pulse animations for shimmer effect
- Updated dashboard loading.tsx

Part of dashboard redesign Phase 5"
```

---

### Task 25: Final build test and cleanup

**Files:**
- Modify: `app/(protected)/dashboard/page.tsx` (remove old components)

**Step 1: Remove old dashboard components**

Delete unused components:
```bash
rm components/dashboard/profile-header.tsx
rm components/dashboard/stats-grid.tsx
rm components/dashboard/stat-card.tsx
rm components/dashboard/xp-progress-bar.tsx
rm components/dashboard/social-feed-highlights.tsx
```

**Step 2: Clean up imports**

Verify no files import the deleted components:
```bash
grep -r "profile-header\|stats-grid\|stat-card\|xp-progress-bar\|social-feed-highlights" app/ components/ --include="*.tsx" --include="*.ts"
```

Expected: No matches (or only in old backup files)

**Step 3: Run full TypeScript check**

Run: `pnpm tsc --noEmit`
Expected: No errors

**Step 4: Run production build**

Run: `pnpm build`
Expected: Build succeeds with no errors

**Step 5: Test all dashboard features**

Run: `pnpm dev`

Test checklist:
- [ ] Dashboard loads without errors
- [ ] Hero card shows today's activity metrics
- [ ] Sparkline renders with 7 days of data
- [ ] Quick stat shows current streak with glow
- [ ] Weekly schedule shows current week
- [ ] Achievement progress displays recent unlock and in-progress
- [ ] Nutrition snapshot shows calories and macros
- [ ] Activity heatmap renders 90 days
- [ ] Friend leaderboard shows top 5 (or empty state)
- [ ] All widgets responsive on mobile
- [ ] Loading skeletons appear on refresh

**Step 6: Commit cleanup**

```bash
git add .
git commit -m "chore(dashboard): remove old components and finalize

- Deleted old profile-header, stats-grid, etc.
- Verified TypeScript compilation
- Tested production build
- All dashboard features functional

Dashboard redesign Phase 5 complete ✅

Total: 25 tasks completed across 5 phases"
```

---

## Implementation Complete! 🎉

**Summary:**
- ✅ Phase 1: Foundation (8 tasks) - Grid layout, database tables, skeleton widgets
- ✅ Phase 2: Visualizations (6 tasks) - Sparkline, heatmap, circular gauge
- ✅ Phase 3: Planning & Goals (5 tasks) - Weekly schedule, nutrition, achievements
- ✅ Phase 4: Social (3 tasks) - Friend leaderboard with weekly XP
- ✅ Phase 5: Polish (3 tasks) - Glow effects, loading states, cleanup

**Total: 25 tasks** completed

**What's Next:**
- User testing and feedback
- Phase 6 (Future): Custom widgets, drag-and-drop, themes
- Phase 7 (Future): Advanced social features, challenges
- Phase 8 (Future): AI insights and recommendations

---

## Verification Checklist

Before marking complete, verify:

- [ ] All TypeScript compilation passes
- [ ] Production build succeeds
- [ ] No console errors in browser
- [ ] All widgets render correctly
- [ ] Data fetching works (real user data)
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Loading states display properly
- [ ] Database migrations applied successfully
- [ ] RLS policies functional
- [ ] All commits have clear messages
