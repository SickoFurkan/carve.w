# iOS Data Linking Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Switch the web health dashboard from old/empty tables to the iOS Carve app's real data tables in Supabase.

**Architecture:** Replace all Supabase queries in dashboard pages to read from iOS tables (`completed_workouts`, `diary_entries`, `user_xp`, `carve_scores`, etc.) instead of old web tables (`workouts`, `meals`, `user_stats`). Write forms also target iOS tables so web and iOS share one data layer.

**Tech Stack:** Next.js App Router, Supabase (server + client), TypeScript, Framer Motion

---

### Task 1: Update main dashboard data fetching

**Files:**
- Modify: `app/(protected)/dashboard/page.tsx`
- Modify: `components/dashboard/sample-data.ts`

**Step 1: Replace data fetching in page.tsx**

Replace the entire server component to fetch from iOS tables instead of `user_stats` and `workouts`:

```tsx
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

  // Fetch XP data from iOS user_xp table
  const { data: xpData } = await supabase
    .from("user_xp")
    .select("total_xp, current_level, xp_in_current_level, current_season, season_xp, peak_tier")
    .eq("user_id", user.id)
    .single()

  // Fetch Carve Score from iOS carve_scores table
  const { data: scoreData } = await supabase
    .from("carve_scores")
    .select("score, tier, components")
    .eq("user_id", user.id)
    .single()

  // Count completed workouts from iOS table
  const { count: workoutCount } = await supabase
    .from("completed_workouts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  // Fetch today's steps
  const today = new Date().toISOString().split("T")[0]
  const { data: stepsData } = await supabase
    .from("daily_steps")
    .select("steps")
    .eq("user_id", user.id)
    .eq("date", today)
    .single()

  // Fetch season ranking for worldwide position
  const { data: rankingData } = await supabase
    .from("user_season_rankings")
    .select("percentile, tier, season_xp")
    .eq("user_id", user.id)
    .order("season_month", { ascending: false })
    .limit(1)
    .single()

  // Fetch active challenge templates + user progress
  const { data: challengeTemplates } = await supabase
    .from("challenge_templates")
    .select("id, timeframe, challenge_title, task_title, task_icon, xp_reward, target_value, category, sort_order")
    .eq("is_active", true)
    .order("sort_order")

  const { data: challengeProgress } = await supabase
    .from("user_challenge_progress")
    .select("template_id, current_value, is_completed, is_claimed, period_key")
    .eq("user_id", user.id)

  // Build challenges array by joining templates with progress
  const challenges = (challengeTemplates || []).map((template) => {
    const progress = (challengeProgress || []).find(
      (p) => p.template_id === template.id
    )
    return {
      id: template.id,
      label: template.task_title || template.challenge_title,
      type: template.timeframe as "daily" | "weekly" | "monthly",
      current: progress?.current_value ?? 0,
      target: template.target_value,
      xpReward: template.xp_reward,
      isCompleted: progress?.is_completed ?? false,
      icon: template.task_icon,
      category: template.category,
    }
  })

  const totalXp = xpData?.total_xp ?? 0
  const currentTier = (scoreData?.tier ?? xpData?.peak_tier ?? "rookie") as string
  // Capitalize first letter
  const displayTier = currentTier.charAt(0).toUpperCase() + currentTier.slice(1)

  return (
    <HealthDashboardClient
      totalXp={totalXp}
      currentTier={displayTier}
      currentLevel={xpData?.current_level ?? 1}
      seasonXp={xpData?.season_xp ?? 0}
      currentSeason={xpData?.current_season ?? 1}
      carveScore={scoreData?.score ?? null}
      scoreComponents={scoreData?.components ?? null}
      workouts={workoutCount ?? 0}
      steps={stepsData?.steps ?? 0}
      percentile={rankingData?.percentile ?? null}
      challenges={challenges}
    />
  )
}
```

**Step 2: Update sample-data.ts to export only types (no sample data)**

```ts
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

export interface Challenge {
  id: string
  label: string
  type: "daily" | "weekly" | "monthly"
  current: number
  target: number
  xpReward: number
  isCompleted: boolean
  icon: string | null
  category: string | null
}

export interface ScoreComponents {
  voeding: number
  beweging: number
  training: number
  consistentie: number
}
```

**Step 3: Verify the page compiles**

Run: `npx next build --no-lint 2>&1 | head -30` or check dev server for errors.

**Step 4: Commit**

```
feat(dashboard): switch main dashboard to iOS app data tables
```

---

### Task 2: Update HealthDashboardClient with new props

**Files:**
- Modify: `components/dashboard/HealthDashboardClient.tsx`

**Step 1: Rewrite client component with new props**

```tsx
"use client"

import { motion } from "framer-motion"
import { HealthStatCard } from "@/components/dashboard/widgets/HealthStatCard"
import { WorldRankingCard } from "@/components/dashboard/widgets/WorldRankingCard"
import { ChallengesCard } from "@/components/dashboard/widgets/ChallengesCard"
import { DailyRoutineCard } from "@/components/dashboard/widgets/DailyRoutineCard"
import { QuickLinkCard } from "@/components/dashboard/widgets/QuickLinkCard"
import type { Challenge, ScoreComponents } from "@/components/dashboard/sample-data"

interface HealthDashboardClientProps {
  totalXp: number
  currentTier: string
  currentLevel: number
  seasonXp: number
  currentSeason: number
  carveScore: number | null
  scoreComponents: ScoreComponents | null
  workouts: number
  steps: number
  percentile: number | null
  challenges: Challenge[]
}

export function HealthDashboardClient({
  totalXp,
  currentTier,
  currentLevel,
  seasonXp,
  currentSeason,
  carveScore,
  scoreComponents,
  workouts,
  steps,
  percentile,
  challenges,
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
              Season {currentSeason}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#c8b86e]/10 px-3 py-1 text-xs font-medium text-[#c8b86e]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c8b86e]" />
              {currentTier}
            </span>
            <span className="text-sm font-semibold text-white">
              {seasonXp} pts
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
        <HealthStatCard
          label="Steps"
          value={steps > 0 ? steps.toLocaleString() : "—"}
        />
        <HealthStatCard
          label="Worldwide"
          value={percentile != null ? `Top ${100 - percentile}%` : "—"}
        />
      </motion.div>

      {/* Carve Score breakdown */}
      {scoreComponents && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <HealthStatCard label="Voeding" value={scoreComponents.voeding} />
          <HealthStatCard label="Beweging" value={scoreComponents.beweging} />
          <HealthStatCard label="Training" value={scoreComponents.training} />
          <HealthStatCard label="Consistentie" value={scoreComponents.consistentie} />
        </motion.div>
      )}

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
          steps={steps > 0 ? steps.toLocaleString() : "—"}
          worldwideRank={percentile != null ? `Top ${100 - percentile}%` : null}
        />
        <ChallengesCard challenges={challenges} />
      </motion.div>

      {/* Daily Routine - keep habits empty for now, managed by iOS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <DailyRoutineCard habits={[]} />
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

**Step 2: Update ChallengesCard to accept new challenge type**

The `ChallengesCard` needs to handle the wider `type` field ("daily" | "weekly" | "monthly") and show `icon` from data. Update the interface in `ChallengesCard.tsx`:

```tsx
import { HealthCard } from "@/components/dashboard/shared"
import type { Challenge } from "@/components/dashboard/sample-data"

interface ChallengesCardProps {
  challenges: Challenge[]
}

export function ChallengesCard({ challenges }: ChallengesCardProps) {
  const dailyChallenges = challenges.filter((c) => c.type === "daily")
  const weeklyChallenges = challenges.filter((c) => c.type === "weekly")
  const monthlyChallenges = challenges.filter((c) => c.type === "monthly")

  return (
    <HealthCard className="flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm">🏆</span>
        <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
          Challenges
        </h3>
      </div>

      <div className="space-y-3 flex-1">
        {dailyChallenges.map((challenge) => (
          <ChallengeRow key={challenge.id} challenge={challenge} fallbackIcon="⚡" />
        ))}
        {weeklyChallenges.map((challenge) => (
          <ChallengeRow key={challenge.id} challenge={challenge} fallbackIcon="📆" />
        ))}
        {monthlyChallenges.map((challenge) => (
          <ChallengeRow key={challenge.id} challenge={challenge} fallbackIcon="📅" />
        ))}
        {challenges.length === 0 && (
          <p className="text-sm text-slate-500">No active challenges</p>
        )}
      </div>
    </HealthCard>
  )
}

function ChallengeRow({
  challenge,
  fallbackIcon,
}: {
  challenge: Challenge
  fallbackIcon: string
}) {
  const progress = challenge.target > 0
    ? (challenge.current / challenge.target) * 100
    : 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-sm">{challenge.icon || fallbackIcon}</span>
        <span className={`text-sm ${challenge.isCompleted ? "text-emerald-400" : "text-white"}`}>
          {challenge.label}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-16 h-[2px] rounded-full bg-white/5">
          <div
            className={`h-full rounded-full transition-all ${challenge.isCompleted ? "bg-emerald-400" : "bg-emerald-400"}`}
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
        <span className="text-xs text-slate-500 tabular-nums min-w-[36px] text-right">
          {Math.round(challenge.current)}/{Math.round(challenge.target)}
        </span>
      </div>
    </div>
  )
}
```

**Step 3: Update WorldRankingCard type to accept string tier**

Change the `currentTier` prop type from the strict union to `string` since iOS tiers come as lowercase strings:

In `WorldRankingCard.tsx`, change the interface:
```tsx
interface WorldRankingCardProps {
  currentTier: string
  workouts: number
  steps: number | string
  worldwideRank: number | string | null
}
```

And update the tier matching logic to be case-insensitive:
```tsx
const isActive = tier.toLowerCase() === currentTier.toLowerCase()
```

**Step 4: Commit**

```
feat(dashboard): update client components for iOS data
```

---

### Task 3: Switch workouts page to iOS tables

**Files:**
- Modify: `app/(protected)/dashboard/workouts/page.tsx`

**Step 1: Rewrite workouts page to read from `completed_workouts` + `workout_exercises`**

Replace the `getWorkouts` function to query `completed_workouts` with nested `workout_exercises`, and `getWorkoutStats` to count from `completed_workouts`. Key column mapping:

- `workouts.name` → `completed_workouts.name`
- `workouts.duration_minutes` → `completed_workouts.total_duration_minutes`
- `workouts.created_at` → `completed_workouts.workout_date`
- `exercises.workout_id` → `workout_exercises.completed_workout_id`
- `exercises.weight` → `workout_exercises.weight_kg`
- `exercises.weight_unit` → always "kg"

New fields available: `total_volume_kg`, `total_sets`, `total_reps`, `intensity_level`, `muscle_groups_targeted[]`

Update the `Workout` and `Exercise` interfaces:

```tsx
interface Workout {
  id: string;
  name: string;
  notes: string | null;
  total_duration_minutes: number | null;
  total_volume_kg: number | null;
  total_sets: number | null;
  total_reps: number | null;
  intensity_level: string | null;
  muscle_groups_targeted: string[] | null;
  workout_date: string;
  exercises: Exercise[];
}

interface Exercise {
  id: string;
  exercise_name: string;
  sets: number | null;
  reps: number | null;
  weight_kg: number | null;
  sets_completed: number | null;
  notes: string | null;
}
```

Update `getWorkouts`:
```tsx
async function getWorkouts(userId: string): Promise<Workout[]> {
  const supabase = await createClient();
  const { data: workouts, error } = await supabase
    .from("completed_workouts")
    .select(`
      id, name, notes, total_duration_minutes, total_volume_kg,
      total_sets, total_reps, intensity_level, muscle_groups_targeted,
      workout_date,
      workout_exercises (
        id, exercise_name, sets, reps, weight_kg,
        sets_completed, notes, order_index
      )
    `)
    .eq("user_id", userId)
    .order("workout_date", { ascending: false });

  if (error) {
    console.error("Error fetching workouts:", error);
    return [];
  }

  return (workouts || []).map((workout: any) => ({
    ...workout,
    exercises: (workout.workout_exercises || []).sort(
      (a: any, b: any) => a.order_index - b.order_index
    ),
  }));
}
```

Update `getWorkoutStats`:
```tsx
async function getWorkoutStats(userId: string) {
  const supabase = await createClient();
  const { count: totalCount } = await supabase
    .from("completed_workouts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const { count: weekCount } = await supabase
    .from("completed_workouts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("workout_date", startOfWeek.toISOString());

  return {
    total: totalCount || 0,
    thisWeek: weekCount || 0,
  };
}
```

In the JSX, update references:
- `workout.duration_minutes` → `workout.total_duration_minutes`
- `workout.created_at` → `workout.workout_date`
- `exercise.weight` → `exercise.weight_kg`
- Remove `exercise.weight_unit` references, always show "kg"
- Add `exercise.is_pr` → remove (not in iOS schema), or use `sets_completed`
- Show `intensity_level` and `muscle_groups_targeted` badges

**Step 2: Commit**

```
feat(workouts): read from iOS completed_workouts table
```

---

### Task 4: Switch workouts/new form to write to iOS tables

**Files:**
- Modify: `app/(protected)/dashboard/workouts/new/page.tsx`

**Step 1: Update the form submit handler**

Change `handleSubmit` to write to `completed_workouts` + `workout_exercises`:

```tsx
const { data: workout, error: workoutError } = await supabase
  .from("completed_workouts")
  .insert({
    user_id: user.id,
    name: workoutName,
    notes: workoutNotes || null,
    total_duration_minutes: duration ? parseInt(duration) : null,
    workout_date: new Date().toISOString(),
  })
  .select()
  .single();

if (workoutError) throw workoutError;

const exercisesToInsert = exercises
  .filter((ex) => ex.exercise_name.trim() !== "")
  .map((ex, index) => ({
    completed_workout_id: workout.id,
    exercise_name: ex.exercise_name,
    sets: ex.sets,
    reps: ex.reps || null,
    weight_kg: ex.weight || null,
    order_index: index,
    notes: ex.notes || null,
  }));

if (exercisesToInsert.length > 0) {
  const { error: exercisesError } = await supabase
    .from("workout_exercises")
    .insert(exercisesToInsert);

  if (exercisesError) throw exercisesError;
}
```

Also update the Exercise interface to use `weight_unit` default "kg":
```tsx
// Change weight_unit default from "lbs" to "kg"
weight_unit: "kg",
```

And update label text from `Weight ({exercise.weight_unit})` to `Weight (kg)`.

**Step 2: Commit**

```
feat(workouts): write new workouts to iOS completed_workouts table
```

---

### Task 5: Switch food page to iOS tables

**Files:**
- Modify: `app/(protected)/dashboard/food/page.tsx`

**Step 1: Rewrite food page to read from `diary_entries` + `meals` (new schema)**

The iOS food model is:
- `diary_entries` = one per day, has daily totals + goals + water + mood + weight
- `meals` = individual meals linked to diary_entry, has meal_type, meal_name, total_calories etc.
- `meal_food_items` = individual food items within a meal

Update interfaces:
```tsx
interface DiaryEntry {
  id: string;
  entry_date: string;
  total_calories: number | null;
  total_protein_g: number | null;
  total_carbs_g: number | null;
  total_fat_g: number | null;
  total_fiber_g: number | null;
  water_ml: number | null;
  calorie_goal: number | null;
  protein_goal_g: number | null;
  weight_kg: number | null;
  mood: string | null;
  meals: Meal[];
}

interface Meal {
  id: string;
  meal_type: string;
  meal_name: string | null;
  total_calories: number | null;
  total_protein_g: number | null;
  total_carbs_g: number | null;
  total_fat_g: number | null;
  consumed_at: string | null;
  meal_food_items: MealFoodItem[];
}

interface MealFoodItem {
  id: string;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  servings: number | null;
  serving_unit: string | null;
  notes: string | null;
  category: string | null;
}
```

Rewrite `getMeals` → `getDiaryEntries`:
```tsx
async function getDiaryEntries(userId: string): Promise<DiaryEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("diary_entries")
    .select(`
      id, entry_date, total_calories, total_protein_g, total_carbs_g,
      total_fat_g, total_fiber_g, water_ml, calorie_goal, protein_goal_g,
      weight_kg, mood,
      meals (
        id, meal_type, meal_name, total_calories, total_protein_g,
        total_carbs_g, total_fat_g, consumed_at,
        meal_food_items (
          id, calories, protein_g, carbs_g, fat_g,
          servings, serving_unit, notes, category
        )
      )
    `)
    .eq("user_id", userId)
    .order("entry_date", { ascending: false })
    .limit(30);

  if (error) {
    console.error("Error fetching diary entries:", error);
    return [];
  }
  return data || [];
}
```

Rewrite `getNutritionStats`:
```tsx
async function getNutritionStats(userId: string) {
  const supabase = await createClient();
  const { count: totalMeals } = await supabase
    .from("meals")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const { count: weekCount } = await supabase
    .from("meals")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfWeek.toISOString());

  return {
    total: totalMeals || 0,
    thisWeek: weekCount || 0,
  };
}
```

Update the JSX to render diary entries → meals → food items hierarchy instead of grouped meals. Show daily goals progress, water intake, mood if available.

**Step 2: Commit**

```
feat(food): read from iOS diary_entries and meals tables
```

---

### Task 6: Switch food/new form to write to iOS tables

**Files:**
- Modify: `app/(protected)/dashboard/food/new/page.tsx`

**Step 1: Update form submit to write to `diary_entries` + `meals` (new schema)**

The write flow:
1. Upsert a `diary_entries` row for today (create if doesn't exist)
2. Insert a `meals` row linked to that diary entry

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const today = new Date().toISOString().split("T")[0];

    // Upsert diary entry for today
    const { data: diaryEntry, error: diaryError } = await supabase
      .from("diary_entries")
      .upsert(
        { user_id: user.id, entry_date: today },
        { onConflict: "user_id,entry_date" }
      )
      .select()
      .single();

    if (diaryError) throw diaryError;

    // Insert meal linked to diary entry
    const { error: mealError } = await supabase.from("meals").insert({
      diary_entry_id: diaryEntry.id,
      user_id: user.id,
      meal_type: mealType,
      meal_name: mealName || null,
      total_calories: calories ? parseInt(calories) : null,
      total_protein_g: protein ? parseFloat(protein) : null,
      total_carbs_g: carbs ? parseFloat(carbs) : null,
      total_fat_g: fat ? parseFloat(fat) : null,
      notes: notes || null,
      consumed_at: new Date().toISOString(),
    });

    if (mealError) throw mealError;

    setXpAwarded(10);
    setTimeout(() => {
      router.push("/dashboard/food");
    }, 2000);
  } catch (err: any) {
    setError(err.message || "Failed to save meal");
    setLoading(false);
  }
};
```

**Step 2: Commit**

```
feat(food): write new meals to iOS diary_entries and meals tables
```

---

### Task 7: Verify and final commit

**Step 1:** Run `npx next build --no-lint` to verify all pages compile.

**Step 2:** Test in dev server: `npm run dev` and check each page loads.

**Step 3:** Final commit if any fixes needed.

```
fix(dashboard): resolve any build issues from iOS data migration
```
