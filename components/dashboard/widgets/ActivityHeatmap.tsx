"use client";

import { useState } from "react";
import { WidgetCard } from "./shared";

interface HeatmapDay {
  date: string;
  xp: number;
}

interface ActivityHeatmapProps {
  data: HeatmapDay[];
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);

  // Get color based on XP value
  const getColor = (xp: number) => {
    if (xp === 0) return "#f3f4f6"; // No activity
    if (xp <= 50) return "#dbeafe"; // Very light blue
    if (xp <= 150) return "#93c5fd"; // Light blue
    if (xp <= 300) return "#3b82f6"; // Medium blue
    return "#1e40af"; // Dark blue
  };

  // Group by week (7 days per row)
  const weeks: HeatmapDay[][] = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  return (
    <WidgetCard>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-[#1a1a1a]">Activity Heatmap</h3>
        <p className="text-xs text-[#6b7280]">Last 90 days</p>
      </div>

      <div className="space-y-1">
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="flex gap-1">
            {week.map((day, dayIdx) => (
              <div
                key={dayIdx}
                className="relative h-3 w-3 rounded-sm transition-transform hover:scale-125"
                style={{ backgroundColor: getColor(day.xp) }}
                onMouseEnter={() => setHoveredDay(day)}
                onMouseLeave={() => setHoveredDay(null)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {hoveredDay && (
        <div className="mt-4 rounded-lg bg-[#f3f4f6] p-3 text-sm">
          <p className="font-semibold text-[#1a1a1a]">
            {new Date(hoveredDay.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <p className="text-[#6b7280]">{hoveredDay.xp} XP earned</p>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex items-center justify-end gap-2 text-xs text-[#6b7280]">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="h-3 w-3 rounded-sm bg-[#f3f4f6]" />
          <div className="h-3 w-3 rounded-sm bg-[#dbeafe]" />
          <div className="h-3 w-3 rounded-sm bg-[#93c5fd]" />
          <div className="h-3 w-3 rounded-sm bg-[#3b82f6]" />
          <div className="h-3 w-3 rounded-sm bg-[#1e40af]" />
        </div>
        <span>More</span>
      </div>
    </WidgetCard>
  );
}
