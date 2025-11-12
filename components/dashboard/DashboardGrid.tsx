import { ReactNode } from "react";

interface DashboardGridProps {
  children: ReactNode;
}

export function DashboardGrid({ children }: DashboardGridProps) {
  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      {children}
    </div>
  );
}

interface TopRowProps {
  hero: ReactNode;
  quickStat: ReactNode;
}

export function TopRow({ hero, quickStat }: TopRowProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
      {hero}
      {quickStat}
    </div>
  );
}

interface MiddleRowProps {
  children: ReactNode;
}

export function MiddleRow({ children }: MiddleRowProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {children}
    </div>
  );
}

interface BottomRowProps {
  heatmap: ReactNode;
  leaderboard: ReactNode;
}

export function BottomRow({ heatmap, leaderboard }: BottomRowProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr]">
      {heatmap}
      {leaderboard}
    </div>
  );
}
