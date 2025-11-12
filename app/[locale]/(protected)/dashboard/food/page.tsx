import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Utensils, Calendar, Flame, Apple } from "lucide-react";
import { format } from "date-fns";

interface Meal {
  id: string;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  name: string | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  notes: string | null;
  created_at: string;
}

async function getMeals(userId: string): Promise<Meal[]> {
  const supabase = await createClient();

  const { data: meals, error } = await supabase
    .from("meals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching meals:", error);
    return [];
  }

  return meals || [];
}

async function getNutritionStats(userId: string) {
  const supabase = await createClient();

  const { data: stats } = await supabase
    .from("user_stats")
    .select("total_meals_logged")
    .eq("user_id", userId)
    .single();

  // Get meals this week
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const { count: weekCount } = await supabase
    .from("meals")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfWeek.toISOString());

  return {
    total: stats?.total_meals_logged || 0,
    thisWeek: weekCount || 0,
  };
}

const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

const MEAL_TYPE_ICONS: Record<string, string> = {
  breakfast: "☀️",
  lunch: "🌞",
  dinner: "🌙",
  snack: "🍎",
};

export default async function FoodPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/dashboard/login");
  }

  const meals = await getMeals(user.id);
  const stats = await getNutritionStats(user.id);

  // Group meals by date
  const groupedMeals: { [key: string]: Meal[] } = {};
  meals.forEach((meal) => {
    const date = format(new Date(meal.created_at), "yyyy-MM-dd");
    if (!groupedMeals[date]) {
      groupedMeals[date] = [];
    }
    groupedMeals[date].push(meal);
  });

  const dates = Object.keys(groupedMeals).sort((a, b) => b.localeCompare(a));

  // Calculate daily totals
  const dailyTotals: {
    [key: string]: { calories: number; protein: number; carbs: number; fat: number };
  } = {};
  dates.forEach((date) => {
    const dayMeals = groupedMeals[date];
    dailyTotals[date] = dayMeals.reduce(
      (acc, meal) => ({
        calories: acc.calories + (meal.calories || 0),
        protein: acc.protein + (meal.protein || 0),
        carbs: acc.carbs + (meal.carbs || 0),
        fat: acc.fat + (meal.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  });

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Nutrition Tracking</h1>
          <p className="text-muted-foreground">
            Monitor your meals and macros
          </p>
        </div>
        <Link href="/dashboard/food/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Log Meal
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Meals</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Apple className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">This Week</p>
              <p className="text-2xl font-bold">{stats.thisWeek}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Meal List */}
      {meals.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <Utensils className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No meals logged yet</h3>
          <p className="text-muted-foreground mb-4">
            Start tracking your nutrition to monitor your progress!
          </p>
          <Link href="/dashboard/food/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Log Your First Meal
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

              {/* Daily Totals */}
              <Card className="p-4 mb-3 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">Daily Totals</span>
                  <div className="flex gap-6 text-sm">
                    <div className="flex items-center gap-1">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span className="font-semibold">
                        {Math.round(dailyTotals[date].calories)}
                      </span>
                      <span className="text-muted-foreground">cal</span>
                    </div>
                    {dailyTotals[date].protein > 0 && (
                      <div className="text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          {Math.round(dailyTotals[date].protein)}g
                        </span>{" "}
                        P
                      </div>
                    )}
                    {dailyTotals[date].carbs > 0 && (
                      <div className="text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          {Math.round(dailyTotals[date].carbs)}g
                        </span>{" "}
                        C
                      </div>
                    )}
                    {dailyTotals[date].fat > 0 && (
                      <div className="text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          {Math.round(dailyTotals[date].fat)}g
                        </span>{" "}
                        F
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Individual Meals */}
              <div className="space-y-3">
                {groupedMeals[date].map((meal) => (
                  <Card key={meal.id} className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">
                            {MEAL_TYPE_ICONS[meal.meal_type]}
                          </span>
                          <h3 className="font-semibold">
                            {MEAL_TYPE_LABELS[meal.meal_type]}
                          </h3>
                          {meal.name && (
                            <span className="text-sm text-muted-foreground">
                              — {meal.name}
                            </span>
                          )}
                        </div>

                        {/* Macros */}
                        {(meal.calories ||
                          meal.protein ||
                          meal.carbs ||
                          meal.fat) && (
                          <div className="flex gap-4 text-sm mb-2">
                            {meal.calories && (
                              <div className="flex items-center gap-1">
                                <Flame className="w-3 h-3 text-orange-500" />
                                <span className="font-medium">
                                  {meal.calories}
                                </span>
                                <span className="text-muted-foreground">
                                  cal
                                </span>
                              </div>
                            )}
                            {meal.protein && (
                              <div className="text-muted-foreground">
                                <span className="font-medium text-foreground">
                                  {meal.protein}g
                                </span>{" "}
                                protein
                              </div>
                            )}
                            {meal.carbs && (
                              <div className="text-muted-foreground">
                                <span className="font-medium text-foreground">
                                  {meal.carbs}g
                                </span>{" "}
                                carbs
                              </div>
                            )}
                            {meal.fat && (
                              <div className="text-muted-foreground">
                                <span className="font-medium text-foreground">
                                  {meal.fat}g
                                </span>{" "}
                                fat
                              </div>
                            )}
                          </div>
                        )}

                        {/* Notes */}
                        {meal.notes && (
                          <p className="text-sm text-muted-foreground italic">
                            {meal.notes}
                          </p>
                        )}
                      </div>

                      {/* Time */}
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(meal.created_at), "h:mm a")}
                      </span>
                    </div>
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
