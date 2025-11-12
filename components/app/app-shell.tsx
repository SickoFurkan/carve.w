"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import React from "react";

interface AppShellProps {
  children: ReactNode;
  className?: string;
  hasGlobalHeader?: boolean;
  headerHeight?: number;
  hasSidebar?: boolean;
}

export function AppShell({
  children,
  className,
  hasGlobalHeader = false,
  headerHeight = 64,
  hasSidebar = false,
}: AppShellProps) {
  return (
    <div
      className={cn(
        "flex flex-col w-full h-full min-h-0 overflow-hidden",
        "bg-[#ececf1]",
        "rounded-lg",
        className
      )}
      role="main"
    >
      {children}
    </div>
  );
}

interface AppBodyProps {
  children: ReactNode;
  className?: string;
}

export function AppBody({
  children,
  className,
}: AppBodyProps) {
  return (
    <div
      className={cn(
        "flex flex-1 min-h-0 h-full overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  );
}

interface AppContentProps {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}

export function AppContent({
  children,
  className,
  padded = true,
}: AppContentProps) {
  return (
    <main
      className={cn(
        "flex-1 flex flex-col min-h-0 h-full",
        "bg-white/95",
        "rounded-xl border border-gray-200",
        "shadow-sm",
        "m-0",
        padded ? "overflow-y-auto" : "overflow-hidden",
        className
      )}
      role="main"
    >
      <section
        className={cn(
          padded ? "max-w-7xl mx-auto w-full" : "w-full",
          padded && "px-4 sm:px-6 lg:px-8",
          padded && "py-8",
          !padded && "h-full",
          "flex flex-col flex-1 min-h-0"
        )}
      >
        {children}
      </section>
    </main>
  );
}
