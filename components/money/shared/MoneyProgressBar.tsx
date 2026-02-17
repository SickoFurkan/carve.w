import { cn } from "@/lib/utils"

interface MoneyProgressBarProps {
  /** Progress value between 0 and 100. */
  value: number
  /** Tailwind background color class for the filled portion. */
  color?: string
  className?: string
}

export function MoneyProgressBar({
  value,
  color = "bg-primary",
  className,
}: MoneyProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value))

  return (
    <div className={cn("h-[1.5px] w-full rounded-full bg-white/5", className)}>
      <div
        className={cn("h-full rounded-full transition-all", color)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
