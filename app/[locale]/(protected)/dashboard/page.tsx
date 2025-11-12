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
            weeklyXpData={weeklyXpData}
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
