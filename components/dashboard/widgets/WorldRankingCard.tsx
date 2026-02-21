import { HealthCard } from "@/components/dashboard/shared"

const RANKING_TIERS = [
  "Legend",
  "Master",
  "Elite",
  "Advanced",
  "Intermediate",
  "Beginner",
  "Rookie",
] as const

type RankingTier = (typeof RANKING_TIERS)[number]

interface WorldRankingCardProps {
  currentTier: RankingTier
  workouts: number
  steps: number | string
  worldwideRank: number | string | null
}

export function WorldRankingCard({
  currentTier,
  workouts,
  steps,
  worldwideRank,
}: WorldRankingCardProps) {
  return (
    <HealthCard className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
            <path d="M12 20V10M18 20V4M6 20v-4" />
          </svg>
          <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            World Ranking
          </h3>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>

      {/* Tier list */}
      <div className="space-y-2.5 flex-1">
        {RANKING_TIERS.map((tier) => {
          const isActive = tier === currentTier
          return (
            <div
              key={tier}
              className={`flex items-center gap-3 ${
                isActive ? "text-white" : "text-slate-500"
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                  isActive
                    ? "border-[#c8b86e] bg-[#c8b86e]"
                    : "border-slate-600 bg-transparent"
                }`}
              >
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1c1f27]" />
                )}
              </div>
              <span
                className={`text-sm ${
                  isActive ? "font-semibold text-white" : "text-slate-500"
                }`}
              >
                {tier}
              </span>
            </div>
          )
        })}
      </div>

      {/* Bottom stats */}
      <div className="mt-5 pt-4 border-t border-white/[0.06] grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-lg font-bold text-white">{workouts}</p>
          <p className="text-xs text-slate-500">Workouts</p>
        </div>
        <div>
          <p className="text-lg font-bold text-white">{steps}</p>
          <p className="text-xs text-slate-500">Steps</p>
        </div>
        <div>
          <p className="text-lg font-bold text-white">
            {worldwideRank ?? "—"}
          </p>
          <p className="text-xs text-slate-500">worldwide</p>
        </div>
      </div>
    </HealthCard>
  )
}
