import { cn } from "@/lib/utils";

interface WidgetSkeletonProps {
  variant?: "light" | "dark";
  height?: "compact" | "medium" | "tall";
  className?: string;
}

export function WidgetSkeleton({
  variant = "light",
  height = "medium",
  className,
}: WidgetSkeletonProps) {
  const heightClass = {
    compact: "min-h-[280px]",
    medium: "min-h-[320px]",
    tall: "min-h-[400px]",
  }[height];

  const isDark = variant === "dark";

  return (
    <div
      className={cn(
        "rounded-2xl p-6 animate-pulse",
        isDark
          ? "border border-white/10 bg-[#0a0e1a]"
          : "border border-black/[0.08] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]",
        heightClass,
        className
      )}
    >
      <div className="flex h-full flex-col space-y-4">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div
            className={cn(
              "h-5 w-32 rounded",
              isDark ? "bg-white/10" : "bg-black/5"
            )}
          />
          <div
            className={cn(
              "h-8 w-8 rounded-lg",
              isDark ? "bg-white/10" : "bg-black/5"
            )}
          />
        </div>

        {/* Content skeleton */}
        <div className="flex-1 space-y-3">
          <div
            className={cn(
              "h-4 w-3/4 rounded",
              isDark ? "bg-white/10" : "bg-black/5"
            )}
          />
          <div
            className={cn(
              "h-4 w-1/2 rounded",
              isDark ? "bg-white/10" : "bg-black/5"
            )}
          />
          <div
            className={cn(
              "h-4 w-5/6 rounded",
              isDark ? "bg-white/10" : "bg-black/5"
            )}
          />
        </div>

        {/* Footer skeleton */}
        <div className="flex gap-2">
          <div
            className={cn(
              "h-10 flex-1 rounded-lg",
              isDark ? "bg-white/10" : "bg-black/5"
            )}
          />
          <div
            className={cn(
              "h-10 flex-1 rounded-lg",
              isDark ? "bg-white/10" : "bg-black/5"
            )}
          />
        </div>
      </div>
    </div>
  );
}
