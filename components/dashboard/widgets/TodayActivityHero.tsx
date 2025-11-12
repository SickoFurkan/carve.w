import { DarkCard } from "./shared";
import Link from "next/link";

interface TodayActivityHeroProps {
  caloriesBurned: number;
  activeMinutes: number;
  xpEarned: number;
  streakMultiplier: number;
}

export function TodayActivityHero({
  caloriesBurned,
  activeMinutes,
  xpEarned,
  streakMultiplier,
}: TodayActivityHeroProps) {
  return (
    <DarkCard>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-white">
            Today's Activity
          </h2>
          <p className="mt-1 text-sm text-[#8b92a8]">
            Your Path to Fitness Excellence
          </p>
        </div>

        {/* Metrics */}
        <div className="flex gap-8">
          <Metric
            icon="🔥"
            value={caloriesBurned}
            unit="kcal"
            label="Calories Burned"
          />
          <Metric
            icon="⏱️"
            value={activeMinutes}
            unit="min"
            label="Active Minutes"
          />
          <Metric
            icon="⚡"
            value={xpEarned}
            unit="XP"
            label="XP Earned"
          />
        </div>
      </div>

      {/* Sparkline Placeholder */}
      <div className="mb-8">
        <div className="h-24 rounded-lg bg-white/5 border border-white/10" />
        <p className="mt-2 text-xs text-[#8b92a8]">
          Activity trend coming in Phase 2
        </p>
      </div>

      {/* Bottom Section */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-[#8b92a8]">Streak Multiplier</div>
          <div className="mt-1 text-2xl font-bold text-yellow-400">
            {streakMultiplier.toFixed(1)}x
          </div>
        </div>

        <Link
          href="/workouts/new"
          className="rounded-lg bg-gradient-to-r from-yellow-500 to-green-500 px-6 py-3 font-semibold text-[#0a0e1a] transition-all hover:scale-105"
        >
          Log Workout
        </Link>
      </div>
    </DarkCard>
  );
}

interface MetricProps {
  icon: string;
  value: number;
  unit: string;
  label: string;
}

function Metric({ icon, value, unit, label }: MetricProps) {
  return (
    <div className="text-center">
      <div className="mb-2 text-2xl">{icon}</div>
      <div className="text-2xl font-bold tabular-nums text-white">
        {value}
        <span className="ml-1 text-sm text-[#8b92a8]">{unit}</span>
      </div>
      <div className="mt-1 text-xs text-[#8b92a8]">{label}</div>
    </div>
  );
}
