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
        "bg-[#1c1f27]",
        "border border-white/[0.06]",
        className
      )}
    >
      {children}
    </div>
  )
}
