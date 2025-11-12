"use client";

import { Flame, Dumbbell, Trophy, Activity, Apple, Zap } from "lucide-react";
import { StatCard } from "./stat-card";

interface StatsGridProps {
  currentStreak: number;
  longestStreak: number;
  totalWorkouts: number;
  workoutsThisWeek: number;
  totalXp: number;
  level: number;
}

export function StatsGrid({
  currentStreak,
  longestStreak,
  totalWorkouts,
  workoutsThisWeek,
  totalXp,
  level,
}: StatsGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {/* Current Streak */}
      <StatCard
        title="Current Streak"
        value={`${currentStreak} days`}
        icon={Flame}
        description={`Best: ${longestStreak} days`}
        learnMoreHref="/psychology/habit-formation"
      />

      {/* Total Workouts */}
      <StatCard
        title="Total Workouts"
        value={totalWorkouts}
        icon={Dumbbell}
        description="All time"
        learnMoreHref="/exercise-science/progressive-overload"
      />

      {/* This Week */}
      <StatCard
        title="This Week"
        value={workoutsThisWeek}
        icon={Activity}
        description="Workouts logged"
        learnMoreHref="/training-methods/strength-training-basics"
      />

      {/* Level */}
      <StatCard
        title="Level"
        value={level}
        icon={Trophy}
        description="Keep training to level up"
      />

      {/* Total XP */}
      <StatCard
        title="Total XP"
        value={totalXp.toLocaleString()}
        icon={Zap}
        description="Experience points earned"
      />

      {/* Nutrition Score */}
      <StatCard
        title="Nutrition Score"
        value="--"
        icon={Apple}
        description="Coming soon"
      />
    </div>
  );
}
