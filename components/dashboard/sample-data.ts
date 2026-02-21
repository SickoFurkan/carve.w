export const RANKING_TIERS = [
  "Legend",
  "Master",
  "Elite",
  "Advanced",
  "Intermediate",
  "Beginner",
  "Rookie",
] as const

export type RankingTier = (typeof RANKING_TIERS)[number]

export const sampleChallenges = [
  { id: "daily-workout", label: "Daily", type: "daily" as const, current: 0, target: 5 },
  { id: "monthly-workout", label: "Monthly", type: "monthly" as const, current: 0, target: 12 },
]

export const sampleHabits: { id: string; name: string; completed: boolean }[] = []
