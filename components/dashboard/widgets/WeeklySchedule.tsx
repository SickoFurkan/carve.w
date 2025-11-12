"use client";

import { WidgetCard } from "./shared";
import { Dumbbell, Activity, Moon } from "lucide-react";

interface DayPlan {
  date: string;
  dayOfWeek: string;
  dayNum: number;
  workoutType: "strength" | "cardio" | "rest" | null;
  status: "planned" | "completed" | "skipped" | null;
  isToday: boolean;
}

interface WeeklyScheduleProps {
  weekData: DayPlan[];
  onDayClick?: (date: string) => void;
}

export function WeeklySchedule({ weekData, onDayClick }: WeeklyScheduleProps) {
  const getStatusColor = (status: DayPlan["status"], workoutType: DayPlan["workoutType"]) => {
    if (status === "completed") return "bg-green-500";
    if (status === "skipped") return "bg-red-400";
    if (status === "planned") {
      if (workoutType === "strength") return "bg-purple-500";
      if (workoutType === "cardio") return "bg-blue-500";
      return "bg-gray-400";
    }
    return "bg-gray-200";
  };

  const getIcon = (workoutType: DayPlan["workoutType"]) => {
    if (workoutType === "strength") return <Dumbbell className="h-3 w-3" />;
    if (workoutType === "cardio") return <Activity className="h-3 w-3" />;
    if (workoutType === "rest") return <Moon className="h-3 w-3" />;
    return null;
  };

  return (
    <WidgetCard>
      <h3 className="mb-4 text-xl font-semibold text-[#1a1a1a]">
        Weekly Schedule
      </h3>

      <div className="grid grid-cols-7 gap-2">
        {weekData.map((day) => (
          <button
            key={day.date}
            onClick={() => onDayClick?.(day.date)}
            className={`flex flex-col items-center rounded-lg p-2 transition-colors ${
              day.isToday ? "bg-[#f3f4f6]" : "hover:bg-gray-50"
            }`}
          >
            {/* Day letter */}
            <div className="mb-1 text-xs font-medium text-[#6b7280]">
              {day.dayOfWeek[0]}
            </div>

            {/* Day number */}
            <div className="mb-2 text-sm font-semibold text-[#1a1a1a]">
              {day.dayNum}
            </div>

            {/* Status indicator */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`h-2 w-2 rounded-full ${getStatusColor(
                  day.status,
                  day.workoutType
                )}`}
              />
              {day.workoutType && (
                <div className="text-[#6b7280]">{getIcon(day.workoutType)}</div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-[#6b7280]">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-purple-500" />
          <span>Strength</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
          <span>Cardio</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-red-400" />
          <span>Skipped</span>
        </div>
      </div>
    </WidgetCard>
  );
}
