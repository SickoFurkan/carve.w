import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface TravelCardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function TravelCard({ children, className, onClick }: TravelCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl p-5",
        "bg-[#1c1f27]",
        "border border-white/[0.06]",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
