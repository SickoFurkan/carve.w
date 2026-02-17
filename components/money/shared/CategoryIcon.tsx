import { cn } from "@/lib/utils"

interface CategoryIconProps {
  icon: string
  color: string
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-12 w-12 text-lg",
}

export function CategoryIcon({
  icon,
  color,
  size = "md",
  className,
}: CategoryIconProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full",
        color,
        sizeClasses[size],
        className
      )}
    >
      {icon}
    </div>
  )
}
