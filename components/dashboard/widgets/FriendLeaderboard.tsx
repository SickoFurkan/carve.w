import { WidgetCard } from "./shared";
import Link from "next/link";

interface LeaderboardEntry {
  userId: string;
  username: string;
  displayName: string;
  level: number;
  weeklyXp: number;
  rank: number;
  isCurrentUser: boolean;
}

interface FriendLeaderboardProps {
  entries: LeaderboardEntry[];
  daysUntilReset: number;
}

export function FriendLeaderboard({
  entries,
  daysUntilReset,
}: FriendLeaderboardProps) {
  const getRankEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "";
  };

  return (
    <WidgetCard>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#1a1a1a]">
          Friend Leaderboard
        </h3>
        <p className="text-xs text-[#6b7280]">
          Resets in {daysUntilReset} {daysUntilReset === 1 ? "day" : "days"}
        </p>
      </div>

      <p className="mb-3 text-sm text-[#6b7280]">This Week's Warriors</p>

      {entries.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-6 text-center">
          <div>
            <p className="text-sm text-[#6b7280]">
              Add friends to see the leaderboard!
            </p>
            <Link
              href="/dashboard/social/friends"
              className="mt-2 inline-block text-sm text-[#3b82f6] hover:underline"
            >
              Add friends →
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 space-y-2 overflow-y-auto">
            {entries.map((entry) => (
              <div
                key={entry.userId}
                className={`flex items-center justify-between rounded-lg p-2.5 transition-colors ${
                  entry.isCurrentUser
                    ? "bg-blue-50"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {/* Rank */}
                  <div className="flex w-7 items-center justify-center">
                    {getRankEmoji(entry.rank) || (
                      <span className="text-sm text-[#6b7280]">
                        {entry.rank}
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <div>
                    <p className="text-sm font-medium text-[#1a1a1a]">
                      {entry.isCurrentUser ? "You" : entry.displayName || entry.username}
                    </p>
                    {!entry.isCurrentUser && (
                      <p className="text-xs text-[#6b7280]">@{entry.username}</p>
                    )}
                  </div>
                </div>

                {/* Level and XP */}
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#3b82f6] text-xs font-semibold text-white">
                    {entry.level}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold tabular-nums text-[#1a1a1a]">
                      {entry.weeklyXp.toLocaleString()}
                    </p>
                    <p className="text-xs text-[#6b7280]">XP</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex justify-end border-t border-gray-100 pt-3">
            <Link
              href="/dashboard/social"
              className="text-sm text-[#3b82f6] hover:underline"
            >
              View full leaderboard →
            </Link>
          </div>
        </>
      )}
    </WidgetCard>
  );
}
