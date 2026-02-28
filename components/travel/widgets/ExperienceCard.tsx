import { TravelCard } from "@/components/travel/shared"

interface ExperienceCardProps {
  title: string
  category: string
  durationMinutes: number
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  food: "from-orange-500/20 to-amber-600/10",
  activity: "from-[#b8d8e8]/20 to-sky-600/10",
  transport: "from-violet-500/20 to-purple-600/10",
  shopping: "from-pink-500/20 to-rose-600/10",
  other: "from-slate-500/20 to-gray-600/10",
}

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function ExperienceCard({ title, category, durationMinutes }: ExperienceCardProps) {
  const gradient = CATEGORY_GRADIENTS[category] || CATEGORY_GRADIENTS.other

  return (
    <div className="w-[180px] shrink-0">
      <div className={`h-[120px] rounded-xl bg-gradient-to-br ${gradient} mb-3 flex items-center justify-center`}>
        <span className="text-2xl opacity-40">
          {category === "food" ? "\uD83C\uDF7D" : category === "activity" ? "\uD83C\uDFAF" : category === "transport" ? "\uD83D\uDE8C" : category === "shopping" ? "\uD83D\uDECD" : "\uD83D\uDCCD"}
        </span>
      </div>
      <h4 className="text-sm font-semibold text-white truncate">{title}</h4>
      <p className="text-xs text-[#555d70] mt-0.5">
        <span className="capitalize">{category}</span> · {formatDuration(durationMinutes)}
      </p>
    </div>
  )
}
