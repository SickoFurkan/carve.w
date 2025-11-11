"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, X, ArrowLeft, Dumbbell } from "lucide-react";

interface Exercise {
  id: string;
  exercise_name: string;
  sets: number;
  reps: number;
  weight: number;
  weight_unit: string;
  notes: string;
}

export default function NewWorkoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [xpAwarded, setXpAwarded] = useState<number | null>(null);

  // Workout form state
  const [workoutName, setWorkoutName] = useState("");
  const [duration, setDuration] = useState("");
  const [workoutNotes, setWorkoutNotes] = useState("");

  // Exercises state
  const [exercises, setExercises] = useState<Exercise[]>([
    {
      id: crypto.randomUUID(),
      exercise_name: "",
      sets: 1,
      reps: 10,
      weight: 0,
      weight_unit: "lbs",
      notes: "",
    },
  ]);

  const addExercise = () => {
    setExercises([
      ...exercises,
      {
        id: crypto.randomUUID(),
        exercise_name: "",
        sets: 1,
        reps: 10,
        weight: 0,
        weight_unit: "lbs",
        notes: "",
      },
    ]);
  };

  const removeExercise = (id: string) => {
    if (exercises.length > 1) {
      setExercises(exercises.filter((ex) => ex.id !== id));
    }
  };

  const updateExercise = (id: string, field: keyof Exercise, value: any) => {
    setExercises(
      exercises.map((ex) =>
        ex.id === id ? { ...ex, [field]: value } : ex
      )
    );
  };

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

      // Insert workout
      const { data: workout, error: workoutError } = await supabase
        .from("workouts")
        .insert({
          user_id: user.id,
          name: workoutName,
          notes: workoutNotes || null,
          duration_minutes: duration ? parseInt(duration) : null,
        })
        .select()
        .single();

      if (workoutError) throw workoutError;

      // Insert exercises
      const exercisesToInsert = exercises
        .filter((ex) => ex.exercise_name.trim() !== "")
        .map((ex, index) => ({
          workout_id: workout.id,
          exercise_name: ex.exercise_name,
          sets: ex.sets,
          reps: ex.reps || null,
          weight: ex.weight || null,
          weight_unit: ex.weight_unit,
          order_index: index,
          notes: ex.notes || null,
        }));

      if (exercisesToInsert.length > 0) {
        const { error: exercisesError } = await supabase
          .from("exercises")
          .insert(exercisesToInsert);

        if (exercisesError) throw exercisesError;
      }

      // Fetch updated user stats to show XP awarded
      const { data: stats } = await supabase
        .from("user_stats")
        .select("total_xp")
        .eq("user_id", user.id)
        .single();

      // Calculate XP awarded (base 50 XP + potential streak multiplier)
      // For simplicity, showing base XP here. Real XP is calculated by trigger.
      setXpAwarded(50);

      // Show success message briefly, then redirect
      setTimeout(() => {
        router.push("/dashboard/workouts");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to save workout");
      setLoading(false);
    }
  };

  if (xpAwarded !== null) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Dumbbell className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Workout Logged!</h2>
            <p className="text-muted-foreground mb-4">
              You earned {xpAwarded} XP for completing this workout!
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting to workout history...
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
        <h1 className="text-3xl font-bold">Log Workout</h1>
        <p className="text-muted-foreground">
          Track your training and earn XP!
        </p>
      </div>

      {error && (
        <Card className="p-4 mb-6 bg-red-50 border-red-200">
          <p className="text-red-600 text-sm">{error}</p>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Workout Details */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Workout Details</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="workoutName">Workout Name *</Label>
              <Input
                id="workoutName"
                placeholder="e.g., Upper Body Day, Leg Day"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                placeholder="60"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="How did you feel? Any observations?"
                rows={3}
                value={workoutNotes}
                onChange={(e) => setWorkoutNotes(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Exercises */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Exercises</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addExercise}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Exercise
            </Button>
          </div>

          <div className="space-y-4">
            {exercises.map((exercise, index) => (
              <div
                key={exercise.id}
                className="p-4 border rounded-lg space-y-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm text-muted-foreground">
                    Exercise {index + 1}
                  </span>
                  {exercises.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExercise(exercise.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div>
                  <Label htmlFor={`exercise-name-${exercise.id}`}>
                    Exercise Name
                  </Label>
                  <Input
                    id={`exercise-name-${exercise.id}`}
                    placeholder="e.g., Bench Press, Squat"
                    value={exercise.exercise_name}
                    onChange={(e) =>
                      updateExercise(exercise.id, "exercise_name", e.target.value)
                    }
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor={`sets-${exercise.id}`}>Sets</Label>
                    <Input
                      id={`sets-${exercise.id}`}
                      type="number"
                      min="1"
                      value={exercise.sets}
                      onChange={(e) =>
                        updateExercise(
                          exercise.id,
                          "sets",
                          parseInt(e.target.value)
                        )
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor={`reps-${exercise.id}`}>Reps</Label>
                    <Input
                      id={`reps-${exercise.id}`}
                      type="number"
                      min="1"
                      value={exercise.reps}
                      onChange={(e) =>
                        updateExercise(
                          exercise.id,
                          "reps",
                          parseInt(e.target.value)
                        )
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor={`weight-${exercise.id}`}>
                      Weight ({exercise.weight_unit})
                    </Label>
                    <Input
                      id={`weight-${exercise.id}`}
                      type="number"
                      min="0"
                      step="0.5"
                      value={exercise.weight}
                      onChange={(e) =>
                        updateExercise(
                          exercise.id,
                          "weight",
                          parseFloat(e.target.value)
                        )
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`exercise-notes-${exercise.id}`}>
                    Notes (optional)
                  </Label>
                  <Input
                    id={`exercise-notes-${exercise.id}`}
                    placeholder="Form notes, difficulty, etc."
                    value={exercise.notes}
                    onChange={(e) =>
                      updateExercise(exercise.id, "notes", e.target.value)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
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
            {loading ? "Saving..." : "Log Workout & Earn XP"}
          </Button>
        </div>
      </form>
    </div>
  );
}
