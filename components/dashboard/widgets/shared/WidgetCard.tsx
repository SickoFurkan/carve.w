import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface WidgetCardProps {
  children: ReactNode;
  className?: string;
}

export function WidgetCard({ children, className }: WidgetCardProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded border border-black/[0.08] bg-white p-4",
        "shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  );
}
