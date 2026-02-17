import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface MoneyCardProps {
  children: ReactNode
  className?: string
}

export function MoneyCard({ children, className }: MoneyCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl p-5",
        "bg-[rgba(28,31,39,0.7)] backdrop-blur-xl",
        "border border-white/[0.08]",
        "shadow-[0_4px_30px_rgba(0,0,0,0.3)]",
        className
      )}
    >
      {children}
    </div>
  )
}
