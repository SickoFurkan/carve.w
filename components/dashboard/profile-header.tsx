"use client";

import { User, Dumbbell, Utensils } from "lucide-react";
import { XPProgressBar } from "./xp-progress-bar";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ProfileHeaderProps {
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  level: number;
  totalXp: number;
}

export function ProfileHeader({
  username,
  displayName,
  avatarUrl,
  level,
  totalXp,
}: ProfileHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        {/* Left: Avatar + Info */}
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-500 to-pink-500 ring-4 ring-background">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-10 w-10 text-white" />
              )}
            </div>

            {/* Level Badge */}
            <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-bold text-white ring-2 ring-background">
              {level}
            </div>
          </div>

          {/* Name & Username */}
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">{displayName}</h1>
            <p className="text-sm text-muted-foreground">@{username}</p>
          </div>
        </div>

        {/* Right: XP Progress */}
        <div className="flex-1 sm:max-w-md">
          <XPProgressBar level={level} totalXp={totalXp} />
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex gap-3">
        <Link href="/dashboard/workouts/new" className="flex-1 sm:flex-initial">
          <Button className="w-full sm:w-auto bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
            <Dumbbell className="w-4 h-4 mr-2" />
            Log Workout
          </Button>
        </Link>
        <Link href="/dashboard/food/new" className="flex-1 sm:flex-initial">
          <Button className="w-full sm:w-auto bg-gradient-to-br from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
            <Utensils className="w-4 h-4 mr-2" />
            Track Meal
          </Button>
        </Link>
      </div>
    </div>
  );
}
