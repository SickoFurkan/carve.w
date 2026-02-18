"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Utensils } from "lucide-react";

const MEAL_TYPES = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
];

export default function NewMealPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [xpAwarded, setXpAwarded] = useState<number | null>(null);

  // Form state
  const [mealType, setMealType] = useState("breakfast");
  const [mealName, setMealName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Insert meal
      const { error: mealError } = await supabase.from("meals").insert({
        user_id: user.id,
        meal_type: mealType,
        name: mealName || null,
        calories: calories ? parseInt(calories) : null,
        protein: protein ? parseFloat(protein) : null,
        carbs: carbs ? parseFloat(carbs) : null,
        fat: fat ? parseFloat(fat) : null,
        notes: notes || null,
      });

      if (mealError) throw mealError;

      // Base XP for meal (will be calculated by trigger with streak multiplier)
      setXpAwarded(10);

      // Show success message briefly, then redirect
      setTimeout(() => {
        router.push("/dashboard/food");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to save meal");
      setLoading(false);
    }
  };

  if (xpAwarded !== null) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Utensils className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Meal Logged!</h2>
            <p className="text-muted-foreground mb-4">
              You earned {xpAwarded} XP for tracking your nutrition!
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting to nutrition history...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Log Meal</h1>
        <p className="text-muted-foreground">
          Track your nutrition and earn XP!
        </p>
      </div>

      {error && (
        <Card className="p-4 mb-6 bg-red-50 border-red-200">
          <p className="text-red-600 text-sm">{error}</p>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Meal Type Selection */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Meal Type</h2>
          <div className="grid grid-cols-2 gap-3">
            {MEAL_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setMealType(type.value)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  mealType === type.value
                    ? "border-primary bg-primary/5 font-semibold"
                    : "border-muted hover:border-primary/50"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Meal Details */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Meal Details</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="mealName">Meal Name (optional)</Label>
              <Input
                id="mealName"
                placeholder="e.g., Chicken Salad, Protein Shake"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="calories">Calories (optional)</Label>
              <Input
                id="calories"
                type="number"
                min="0"
                placeholder="500"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Macros */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            Macros (grams, optional)
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="protein">Protein</Label>
              <Input
                id="protein"
                type="number"
                min="0"
                step="0.1"
                placeholder="30"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="carbs">Carbs</Label>
              <Input
                id="carbs"
                type="number"
                min="0"
                step="0.1"
                placeholder="45"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="fat">Fat</Label>
              <Input
                id="fat"
                type="number"
                min="0"
                step="0.1"
                placeholder="15"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Notes */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Notes (optional)</h2>
          <Textarea
            placeholder="How did you feel? Any observations?"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Card>

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? "Saving..." : "Log Meal & Earn XP"}
          </Button>
        </div>
      </form>
    </div>
  );
}
