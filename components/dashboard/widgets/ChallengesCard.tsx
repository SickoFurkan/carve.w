import { HealthCard } from "@/components/dashboard/shared"

interface Challenge {
  id: string
  label: string
  type: "daily" | "monthly"
  current: number
  target: number
}

interface ChallengesCardProps {
  challenges: Challenge[]
}

export function ChallengesCard({ challenges }: ChallengesCardProps) {
  const dailyChallenges = challenges.filter((c) => c.type === "daily")
  const monthlyChallenges = challenges.filter((c) => c.type === "monthly")

  return (
    <HealthCard className="flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm">🏆</span>
        <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
          Challenges
        </h3>
      </div>

      <div className="space-y-3 flex-1">
        {dailyChallenges.map((challenge) => (
          <ChallengeRow key={challenge.id} challenge={challenge} icon="⚡" />
        ))}
        {monthlyChallenges.map((challenge) => (
          <ChallengeRow key={challenge.id} challenge={challenge} icon="📅" />
        ))}
      </div>
    </HealthCard>
  )
}

function ChallengeRow({
  challenge,
  icon,
}: {
  challenge: Challenge
  icon: string
}) {
  const progress = challenge.target > 0
    ? (challenge.current / challenge.target) * 100
    : 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-sm">{icon}</span>
        <span className="text-sm text-white">{challenge.label}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-16 h-[2px] rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-emerald-400 transition-all"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
        <span className="text-xs text-slate-500 tabular-nums min-w-[36px] text-right">
          {challenge.current}/{challenge.target}
        </span>
      </div>
    </div>
  )
}
