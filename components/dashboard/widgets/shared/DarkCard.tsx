import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DarkCardProps {
  children: ReactNode;
  className?: string;
}

export function DarkCard({ children, className }: DarkCardProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded border border-white/10 bg-[#0a0e1a] p-4 overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  );
}
