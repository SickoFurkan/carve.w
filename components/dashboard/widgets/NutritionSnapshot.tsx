"use client";

import { WidgetCard, CircularGauge } from "./shared";
import { Droplet } from "lucide-react";

interface NutritionSnapshotProps {
  caloriesConsumed: number;
  caloriesGoal: number;
  proteinPercent: number;
  waterLiters: number;
  waterGoal: number;
}

export function NutritionSnapshot({
  caloriesConsumed,
  caloriesGoal,
  proteinPercent,
  waterLiters,
  waterGoal,
}: NutritionSnapshotProps) {
  return (
    <WidgetCard>
      <h3 className="mb-6 text-xl font-semibold text-[#1a1a1a]">
        Nutrition Snapshot
      </h3>

      <div className="grid gap-6">
        {/* Calories with CircularGauge */}
        <div className="flex flex-col items-center">
          <CircularGauge
            value={caloriesConsumed}
            max={caloriesGoal}
            size={140}
          />
          <p className="mt-3 text-sm font-medium text-[#6b7280]">
            Daily Calories
          </p>
        </div>

        {/* Protein and Water - Side by side */}
        <div className="grid grid-cols-2 gap-4 border-t border-black/[0.08] pt-4">
          {/* Protein */}
          <div className="text-center">
            <div className="mb-1 text-3xl font-bold text-[#1a1a1a]">
              {Math.round(proteinPercent)}%
            </div>
            <p className="text-sm text-[#6b7280]">Protein Goal</p>
          </div>

          {/* Water */}
          <div className="text-center">
            <div className="mb-1 flex items-center justify-center gap-1">
              <Droplet className="h-5 w-5 text-[#3b82f6]" />
              <span className="text-3xl font-bold text-[#1a1a1a]">
                {waterLiters.toFixed(1)}
              </span>
              <span className="text-sm text-[#6b7280]">/{waterGoal}L</span>
            </div>
            <p className="text-sm text-[#6b7280]">Water Intake</p>
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}
