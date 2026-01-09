"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import React from "react";

interface AppShellProps {
  children: ReactNode;
  className?: string;
  hasGlobalHeader?: boolean;
  headerHeight?: number;
  disablePageScroll?: boolean;
}

/**
 * App Shell Component
 *
 * Provides the main layout container with:
 * - Responsive design
 * - Optional page scroll disable
 * - Consistent styling
 */
export function AppShell({
  children,
  className,
  hasGlobalHeader = false,
  headerHeight = 64,
  disablePageScroll = true,
}: AppShellProps) {
  React.useEffect(() => {
    if (disablePageScroll) {
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.height = '100dvh';
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100dvh';
    }
    return () => {
      if (disablePageScroll) {
        document.documentElement.style.overflow = '';
        document.documentElement.style.height = '';
        document.body.style.overflow = '';
        document.body.style.height = '';
      }
    };
  }, [disablePageScroll]);

  return (
    <div
      className={cn(
        "flex flex-col w-full h-full overflow-hidden",
        "bg-[#ececf1] text-gray-900",
        "rounded-lg",
        "relative z-10",
        className
      )}
      role="main"
      aria-label="App application"
    >
      {children}
    </div>
  );
}

/**
 * App Body Component (Sidebar + Content area)
 */
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
        "flex flex-1 min-h-0 overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * App Content Area Component
 */
interface AppContentProps {
  children: ReactNode;
  className?: string;
  padded?: boolean;
  useFixedHeight?: boolean;
}

export function AppContent({
  children,
  className,
  padded = true,
  useFixedHeight = true,
}: AppContentProps) {
  return (
    <main
      className={cn(
        "flex-1 flex flex-col min-h-0",
        useFixedHeight
          ? "h-full overflow-y-auto scrollbar-auto-hide"
          : "min-h-full",
        // Always keep rounded corners and border for consistent look
        "rounded-xl border border-gray-300",
        "shadow-sm",
        "overflow-hidden", // Clip content to rounded corners
        // Only show white background when padded
        padded && "bg-white text-gray-900",
        "m-0",
        className
      )}
      role="main"
      aria-label="Main content area"
    >
      <section
        className={cn(
          padded ? "max-w-6xl mx-auto w-full" : "w-full h-full",
          padded && "px-2 sm:px-3 lg:px-3 xl:px-4",
          padded && "pt-8 pb-8",
          "flex flex-col flex-1 min-h-0",
          // Make children stretch to fill when edge-to-edge
          !padded && "[&>*]:flex-1 [&>*]:w-full"
        )}
      >
        {children}
      </section>
    </main>
  );
}

/**
 * App Page Container
 */
interface AppPageProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export function AppPage({
  children,
  className,
  title,
}: AppPageProps) {
  return (
    <div
      className={cn(
        "flex flex-col h-full w-full overflow-hidden",
        className
      )}
      role="region"
      aria-label={title ? `${title} page` : "App page"}
    >
      {children}
    </div>
  );
}
