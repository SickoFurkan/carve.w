import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Dumbbell, Calendar, Clock, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface Workout {
  id: string;
  name: string;
  notes: string | null;
  duration_minutes: number | null;
  created_at: string;
  exercises: Exercise[];
}

interface Exercise {
  id: string;
  exercise_name: string;
  sets: number;
  reps: number | null;
  weight: number | null;
  weight_unit: string;
  is_pr: boolean;
  notes: string | null;
}

async function getWorkouts(userId: string): Promise<Workout[]> {
  const supabase = await createClient();

  const { data: workouts, error } = await supabase
    .from("workouts")
    .select(
      `
      id,
      name,
      notes,
      duration_minutes,
      created_at,
      exercises (
        id,
        exercise_name,
        sets,
        reps,
        weight,
        weight_unit,
        is_pr,
        notes,
        order_index
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching workouts:", error);
    return [];
  }

  // Sort exercises by order_index
  return (workouts || []).map((workout: any) => ({
    ...workout,
    exercises: (workout.exercises || []).sort(
      (a: any, b: any) => a.order_index - b.order_index
    ),
  }));
}

async function getWorkoutStats(userId: string) {
  const supabase = await createClient();

  const { data: stats } = await supabase
    .from("user_stats")
    .select("total_workouts")
    .eq("user_id", userId)
    .single();

  // Get workouts this week
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const { count: weekCount } = await supabase
    .from("workouts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfWeek.toISOString());

  return {
    total: stats?.total_workouts || 0,
    thisWeek: weekCount || 0,
  };
}

export default async function WorkoutsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/dashboard/login");
  }

  const workouts = await getWorkouts(user.id);
  const stats = await getWorkoutStats(user.id);

  // Group workouts by date
  const groupedWorkouts: { [key: string]: Workout[] } = {};
  workouts.forEach((workout) => {
    const date = format(new Date(workout.created_at), "yyyy-MM-dd");
    if (!groupedWorkouts[date]) {
      groupedWorkouts[date] = [];
    }
    groupedWorkouts[date].push(workout);
  });

  const dates = Object.keys(groupedWorkouts).sort((a, b) => b.localeCompare(a));

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Workout History</h1>
          <p className="text-muted-foreground">
            Track your progress and review past sessions
          </p>
        </div>
        <Link href="/dashboard/workouts/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Log Workout
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Workouts</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">This Week</p>
              <p className="text-2xl font-bold">{stats.thisWeek}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Workout List */}
      {workouts.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <Dumbbell className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No workouts yet</h3>
          <p className="text-muted-foreground mb-4">
            Start logging your workouts to track your progress!
          </p>
          <Link href="/dashboard/workouts/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Log Your First Workout
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-6">
          {dates.map((date) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <h2 className="font-semibold">
                  {format(new Date(date), "EEEE, MMMM d, yyyy")}
                </h2>
              </div>

              <div className="space-y-3">
                {groupedWorkouts[date].map((workout) => (
                  <Card key={workout.id} className="p-5">
                    {/* Workout Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {workout.name}
                        </h3>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {workout.duration_minutes
                              ? `${workout.duration_minutes} min`
                              : "No duration"}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {workout.exercises.length} exercise
                            {workout.exercises.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(workout.created_at), "h:mm a")}
                      </span>
                    </div>

                    {/* Notes */}
                    {workout.notes && (
                      <p className="text-sm text-muted-foreground mb-4 italic">
                        {workout.notes}
                      </p>
                    )}

                    {/* Exercises */}
                    {workout.exercises.length > 0 && (
                      <div className="space-y-2">
                        {workout.exercises.map((exercise) => (
                          <div
                            key={exercise.id}
                            className="flex items-start justify-between p-3 rounded-md bg-muted/30"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">
                                  {exercise.exercise_name}
                                </p>
                                {exercise.is_pr && (
                                  <span className="px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full">
                                    PR!
                                  </span>
                                )}
                              </div>
                              {exercise.notes && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {exercise.notes}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {exercise.sets} × {exercise.reps || "-"} reps
                              </p>
                              {exercise.weight && exercise.weight > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  {exercise.weight} {exercise.weight_unit}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
