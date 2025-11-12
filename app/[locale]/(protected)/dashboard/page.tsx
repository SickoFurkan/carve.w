import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardGrid, TopRow, MiddleRow, BottomRow } from "@/components/dashboard/DashboardGrid";
import { TodayActivityHero } from "@/components/dashboard/widgets/TodayActivityHero";
import { QuickStat } from "@/components/dashboard/widgets/QuickStat";
import { ActivityHeatmap } from "@/components/dashboard/widgets/ActivityHeatmap";
import { NutritionSnapshot } from "@/components/dashboard/widgets/NutritionSnapshot";
import { WeeklySchedule } from "@/components/dashboard/widgets/WeeklySchedule";
import { AchievementProgress } from "@/components/dashboard/widgets/AchievementProgress";
import { FriendLeaderboard } from "@/components/dashboard/widgets/FriendLeaderboard";
import { WidgetSkeleton } from "@/components/dashboard/widgets/shared";

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

  // Fetch last 90 days for heatmap
  const ninetyDaysAgo = new Date(today);
  ninetyDaysAgo.setDate(today.getDate() - 89);

  const { data: heatmapWorkouts } = await supabase
    .from("workouts")
    .select("created_at")
    .eq("user_id", user.id)
    .gte("created_at", ninetyDaysAgo.toISOString())
    .order("created_at", { ascending: true });

  const { data: heatmapMeals } = await supabase
    .from("meals")
    .select("created_at")
    .eq("user_id", user.id)
    .gte("created_at", ninetyDaysAgo.toISOString())
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

  // Build heatmap data for last 90 days
  const heatmapData = Array.from({ length: 90 }, (_, i) => {
    const date = new Date(ninetyDaysAgo);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];

    // Count workouts and meals for this day
    const workoutsCount = heatmapWorkouts?.filter(w =>
      w.created_at.startsWith(dateStr)
    ).length || 0;
    const mealsCount = heatmapMeals?.filter(m =>
      m.created_at.startsWith(dateStr)
    ).length || 0;

    // Calculate XP (50 per workout, 10 per meal)
    const xp = (workoutsCount * 50) + (mealsCount * 10);

    return {
      date: dateStr,
      xp,
    };
  });

  // Fetch user goals for nutrition
  const { data: userGoals } = await supabase
    .from("user_goals")
    .select("daily_calories, daily_protein_g, daily_water_l")
    .eq("user_id", user.id)
    .single();

  // Fetch today's meals for nutrition calculation
  const todayStr = today.toISOString().split("T")[0];
  const { data: todayMeals } = await supabase
    .from("meals")
    .select("calories, protein")
    .eq("user_id", user.id)
    .gte("created_at", todayStr)
    .lt("created_at", `${todayStr}T23:59:59.999Z`);

  // Calculate nutrition metrics
  const caloriesConsumed = todayMeals?.reduce((sum, meal) => sum + (meal.calories || 0), 0) || 0;
  const totalProtein = todayMeals?.reduce((sum, meal) => sum + (Number(meal.protein) || 0), 0) || 0;
  const proteinGoal = userGoals?.daily_protein_g || 150;
  const proteinPercent = (totalProtein / proteinGoal) * 100;

  // TODO: Add water intake tracking table in future
  // For now, using a placeholder value
  const waterLiters = 0;

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

  // Calculate today's metrics
  // Count completed workouts today
  const todayWorkoutsCount = weekWorkouts?.filter(w =>
    w.created_at.startsWith(todayStr)
  ).length || 0;

  // Simple placeholder calculation until we have actual workout duration data
  // Average: 45 minutes per workout, 300 calories per workout
  const activeMinutes = todayWorkoutsCount * 45;
  const caloriesBurned = todayWorkoutsCount * 300;

  // Calculate today's XP from workouts and meals
  const todayXp = weeklyXpData.find(d => d.isToday)?.xp || 0;
  const xpEarned = todayXp;

  const streakMultiplier = stats?.current_workout_streak
    ? stats.current_workout_streak >= 30 ? 2.0
    : stats.current_workout_streak >= 14 ? 1.5
    : stats.current_workout_streak >= 7 ? 1.25
    : stats.current_workout_streak >= 3 ? 1.1
    : 1.0
    : 1.0;

  // Mock achievement data (TODO: Replace with real data from achievements system)
  const recentUnlocks = [
    { code: "first_workout", name: "First Workout", description: "Complete your first workout", tier: "bronze" as const, unlockedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { code: "early_bird", name: "Early Bird", description: "Complete a morning workout", tier: "bronze" as const, unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() }
  ];
  const inProgress = [
    { code: "century_club", name: "Century Club", description: "Complete 100 workouts", progress: 87, max: 100 },
    { code: "protein_master", name: "Protein Master", description: "Hit protein goal 50 times", progress: 42, max: 50 }
  ];

  // Fetch weekly leaderboard data
  interface LeaderboardDbResponse {
    user_id: string;
    username: string;
    display_name: string;
    level: number;
    weekly_xp: number;
    rank: number;
    is_current_user: boolean;
  }

  const { data: leaderboardRaw } = await supabase.rpc("get_weekly_friend_leaderboard", {
    requesting_user_id: user.id,
    limit_count: 5,
  });

  // Transform leaderboard data
  const leaderboardData = (leaderboardRaw || []).map((entry: LeaderboardDbResponse) => ({
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
  nextMonday.setDate(today.getDate() + ((1 + 7 - today.getDay()) % 7 || 7));
  const daysUntilReset = Math.ceil((nextMonday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <DashboardGrid>
      <TopRow
        hero={
          <Suspense key="hero-suspense" fallback={<WidgetSkeleton variant="dark" height="tall" />}>
            <TodayActivityHero
              caloriesBurned={caloriesBurned}
              activeMinutes={activeMinutes}
              xpEarned={xpEarned}
              streakMultiplier={streakMultiplier}
              weeklyXpData={weeklyXpData}
            />
          </Suspense>
        }
        quickStat={
          <Suspense key="quickstat-suspense" fallback={<WidgetSkeleton variant="dark" height="compact" />}>
            <QuickStat
              label="Current Streak"
              value={stats?.current_workout_streak || 0}
              unit="days 🔥"
            />
          </Suspense>
        }
      />

      <MiddleRow>
        <Suspense key="schedule-suspense" fallback={<WidgetSkeleton variant="light" height="medium" />}>
          <WeeklySchedule weekData={weekData} />
        </Suspense>

        <Suspense key="achievements-suspense" fallback={<WidgetSkeleton variant="light" height="tall" />}>
          <AchievementProgress
            recentUnlock={recentUnlocks[0]}
            inProgress={inProgress}
          />
        </Suspense>

        <Suspense key="nutrition-suspense" fallback={<WidgetSkeleton variant="light" height="medium" />}>
          <NutritionSnapshot
            caloriesConsumed={caloriesConsumed}
            caloriesGoal={userGoals?.daily_calories || 2200}
            proteinPercent={proteinPercent}
            waterLiters={waterLiters}
            waterGoal={userGoals?.daily_water_l || 2.5}
          />
        </Suspense>
      </MiddleRow>

      <BottomRow
        heatmap={
          <Suspense key="heatmap-suspense" fallback={<WidgetSkeleton variant="light" height="medium" />}>
            <ActivityHeatmap data={heatmapData} />
          </Suspense>
        }
        leaderboard={
          <Suspense key="leaderboard-suspense" fallback={<WidgetSkeleton variant="light" height="tall" />}>
            <FriendLeaderboard entries={leaderboardData} daysUntilReset={daysUntilReset} />
          </Suspense>
        }
      />
    </DashboardGrid>
  );
}
