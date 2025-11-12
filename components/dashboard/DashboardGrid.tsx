import { ReactNode } from "react";

interface DashboardGridProps {
  children: ReactNode;
}

export function DashboardGrid({ children }: DashboardGridProps) {
  return (
    <div className="h-full overflow-hidden p-4">
      <div className="grid h-full max-w-7xl mx-auto w-full grid-rows-[minmax(0,40%)_minmax(0,60%)] gap-4">
        {children}
      </div>
    </div>
  );
}

interface TopRowProps {
  hero: ReactNode;
  quickStat: ReactNode;
}

export function TopRow({ hero, quickStat }: TopRowProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_1fr] h-full">
      {hero}
      {quickStat}
    </div>
  );
}

interface BottomRowProps {
  heatmap: ReactNode;
  schedule: ReactNode;
  nutrition: ReactNode;
  achievements: ReactNode;
  leaderboard: ReactNode;
}

export function BottomRow({ heatmap, schedule, nutrition, achievements, leaderboard }: BottomRowProps) {
  return (
    <div className="grid h-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Left column - Heatmap (full height on desktop, auto on mobile) */}
      <div className="h-full min-h-[200px] lg:row-span-1">
        {heatmap}
      </div>

      {/* Middle column - Schedule + Nutrition (stacked 50/50) */}
      <div className="grid h-full min-h-[200px] grid-rows-2 gap-4">
        {schedule}
        {nutrition}
      </div>

      {/* Right column - Leaderboard (full height) */}
      <div className="h-full min-h-[200px] md:col-span-2 lg:col-span-1">
        {leaderboard}
      </div>
    </div>
  );
}
