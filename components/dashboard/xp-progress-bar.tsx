"use client";

import { Star } from "lucide-react";

// Calculate XP needed for a level (matches our database function)
function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(100 * Math.pow(level, 1.5));
}

interface XPProgressBarProps {
  level: number;
  totalXp: number;
}

export function XPProgressBar({ level, totalXp }: XPProgressBarProps) {
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const xpInCurrentLevel = totalXp - currentLevelXp;
  const xpNeededForNextLevel = nextLevelXp - currentLevelXp;
  const progressPercentage = (xpInCurrentLevel / xpNeededForNextLevel) * 100;

  return (
    <div className="flex flex-col gap-2">
      {/* Level Info */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="font-semibold">Level {level}</span>
        </div>
        <span className="text-muted-foreground">
          {xpInCurrentLevel.toLocaleString()} / {xpNeededForNextLevel.toLocaleString()} XP
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative h-3 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      </div>

      {/* Next Level Preview */}
      <div className="text-xs text-muted-foreground">
        {xpNeededForNextLevel - xpInCurrentLevel > 0 ? (
          <>
            {(xpNeededForNextLevel - xpInCurrentLevel).toLocaleString()} XP to Level {level + 1}
          </>
        ) : (
          <>Level {level + 1} reached!</>
        )}
      </div>
    </div>
  );
}
