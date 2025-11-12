import { DarkCard, Sparkline } from "./shared";
import Link from "next/link";

interface TodayActivityHeroProps {
  caloriesBurned: number;
  activeMinutes: number;
  xpEarned: number;
  streakMultiplier: number;
  weeklyXpData: Array<{
    day: string;
    xp: number;
    isToday: boolean;
  }>;
}

export function TodayActivityHero({
  caloriesBurned,
  activeMinutes,
  xpEarned,
  streakMultiplier,
  weeklyXpData,
}: TodayActivityHeroProps) {
  return (
    <DarkCard>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">
            Today's Activity
          </h2>
          <p className="mt-1 text-xs text-[#8b92a8]">
            Your Path to Fitness Excellence
          </p>
        </div>

        {/* Metrics */}
        <div className="flex gap-6">
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
            icon="⭐"
            value={xpEarned}
            suffix={`+${streakMultiplier.toFixed(1)}x`}
            label="XP Earned"
          />
        </div>
      </div>

      {/* Sparkline */}
      <div className="mb-3">
        <Sparkline data={weeklyXpData} />
      </div>

      {/* Action button */}
      <div className="flex justify-end">
        <Link
          href="/dashboard/workouts/new"
          className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white transition-colors hover:bg-white/10"
        >
          + Start Workout
        </Link>
      </div>
    </DarkCard>
  );
}

interface MetricProps {
  icon: string;
  value: number;
  unit?: string;
  suffix?: string;
  label: string;
}

function Metric({ icon, value, unit, suffix, label }: MetricProps) {
  return (
    <div className="text-right">
      <div className="mb-0.5 flex items-baseline gap-1">
        <span className="text-xs">{icon}</span>
        <span className="text-xl font-semibold tabular-nums text-white">
          {value}
        </span>
        {unit && <span className="text-xs text-[#8b92a8]">{unit}</span>}
      </div>
      {suffix && (
        <div className="text-xs text-[#8b92a8]">{suffix}</div>
      )}
      <div className="sr-only">{label}</div>
    </div>
  );
}
