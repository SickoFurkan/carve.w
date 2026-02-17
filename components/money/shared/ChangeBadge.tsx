import { cn } from "@/lib/utils"

interface ChangeBadgeProps {
  value: number
  className?: string
}

export function ChangeBadge({ value, className }: ChangeBadgeProps) {
  const isPositive = value >= 0
  const formatted = `${isPositive ? "+" : ""}${value}%`

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        isPositive
          ? "bg-emerald-500/10 text-emerald-400"
          : "bg-red-500/10 text-red-400",
        className
      )}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={cn(!isPositive && "rotate-180")}
      >
        <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z" />
      </svg>
      {formatted}
    </span>
  )
}
