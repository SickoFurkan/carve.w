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
        "rounded-2xl border border-white/10 bg-[#0a0e1a] p-5",
        className
      )}
    >
      {children}
    </div>
  );
}
