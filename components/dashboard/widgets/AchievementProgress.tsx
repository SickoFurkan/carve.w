import { WidgetCard, ProgressBar } from "./shared";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface Achievement {
  code: string;
  name: string;
  description: string;
  tier?: "bronze" | "silver" | "gold";
  progress?: number;
  max?: number;
  unlockedAt?: string;
}

interface AchievementProgressProps {
  recentUnlock?: Achievement;
  inProgress: Achievement[];
}

export function AchievementProgress({
  recentUnlock,
  inProgress,
}: AchievementProgressProps) {
  const getTierColor = (tier: Achievement["tier"]) => {
    if (tier === "gold") return "#f59e0b";
    if (tier === "silver") return "#9ca3af";
    return "#cd7f32";
  };

  const getProgressColor = (code: string) => {
    if (code.includes("strength")) return "#8b5cf6";
    if (code.includes("streak")) return "#f59e0b";
    return "#3b82f6";
  };

  return (
    <WidgetCard>
      <h3 className="mb-4 text-xl font-semibold text-[#1a1a1a]">
        Achievements
      </h3>

      {/* Recent unlock */}
      {recentUnlock && (
        <div className="mb-6 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 p-4">
          <p className="mb-2 text-xs font-medium text-[#6b7280]">
            ✨ Latest Achievement
          </p>
          <div className="mb-1 flex items-center gap-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full text-lg"
              style={{ backgroundColor: getTierColor(recentUnlock.tier) }}
            >
              🏆
            </span>
            <div>
              <h4 className="font-semibold text-[#1a1a1a]">
                {recentUnlock.name}
              </h4>
              {recentUnlock.tier && (
                <p className="text-xs capitalize text-[#6b7280]">
                  {recentUnlock.tier}
                </p>
              )}
            </div>
          </div>
          {recentUnlock.unlockedAt && (
            <p className="text-xs text-[#6b7280]">
              Unlocked{" "}
              {formatDistanceToNow(new Date(recentUnlock.unlockedAt), {
                addSuffix: true,
              })}
            </p>
          )}
        </div>
      )}

      {/* In progress */}
      {inProgress.length > 0 ? (
        <div>
          <p className="mb-3 text-sm font-medium text-[#6b7280]">In Progress</p>
          <div className="space-y-4">
            {inProgress.map((achievement) => {
              const percentage = achievement.progress && achievement.max
                ? Math.round((achievement.progress / achievement.max) * 100)
                : 0;

              return (
                <div key={achievement.code}>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {achievement.code.includes("strength") ? "🏋️" :
                         achievement.code.includes("streak") ? "🔥" : "📈"}
                      </span>
                      <span className="text-sm font-medium text-[#1a1a1a]">
                        {achievement.name}
                      </span>
                    </div>
                    <span className="text-xs tabular-nums text-[#6b7280]">
                      {percentage}%
                    </span>
                  </div>
                  <ProgressBar
                    value={achievement.progress || 0}
                    max={achievement.max || 100}
                    color={getProgressColor(achievement.code)}
                  />
                  <p className="mt-1 text-xs text-[#6b7280]">
                    {achievement.progress} / {achievement.max}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-sm text-[#6b7280]">No achievements in progress</p>
      )}

      {/* View all */}
      <div className="mt-6 flex justify-end">
        <Link
          href="/dashboard/achievements"
          className="text-sm text-[#3b82f6] hover:underline"
        >
          View all achievements →
        </Link>
      </div>
    </WidgetCard>
  );
}
