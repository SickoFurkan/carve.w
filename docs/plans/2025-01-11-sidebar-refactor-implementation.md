# Sidebar Refactor & Enhanced Navigation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Separate sidebars per section (Wiki/Dashboard/Carve) with loading states, add global search, language switcher, and Hiscores to header.

**Architecture:** Replace single AppSidebar with section-specific sidebar components in nested layouts using Suspense boundaries. Enhance header with search component, language switcher via next-intl, and add Hiscores navigation.

**Tech Stack:** Next.js 14 App Router, React 19, TypeScript, Suspense, next-intl, Supabase

---

## Phase 1: Sidebar Components Foundation

### Task 1: Create Sidebar Skeleton Component

**Files:**
- Create: `components/app/sidebars/sidebar-skeleton.tsx`

**Step 1: Create sidebar skeleton component**

Create the file with this content:

```tsx
export function SidebarSkeleton() {
  return (
    <div
      className="hidden lg:flex lg:flex-col h-full shrink-0 bg-[#ececf1] pb-3"
      style={{ width: "64px" }}
      role="status"
      aria-label="Loading navigation"
    >
      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        {/* Group 1 */}
        <div className="mb-3">
          {/* Group label skeleton */}
          <div className="mb-1.5 flex items-center px-3">
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              <div className="w-2 h-0.5 bg-gray-300 animate-pulse rounded" />
            </div>
          </div>

          {/* Nav items skeleton */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-9 flex items-center rounded-lg px-3 py-1.5 mb-0.5"
            >
              <div className="h-5 w-5 bg-gray-300 animate-pulse rounded shrink-0" />
            </div>
          ))}
        </div>

        {/* Group 2 */}
        <div className="mb-3">
          <div className="mb-1.5 flex items-center px-3">
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              <div className="w-2 h-0.5 bg-gray-300 animate-pulse rounded" />
            </div>
          </div>

          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-9 flex items-center rounded-lg px-3 py-1.5 mb-0.5"
            >
              <div className="h-5 w-5 bg-gray-300 animate-pulse rounded shrink-0" />
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}
```

**Step 2: Verify the component renders**

Run: `pnpm dev` and check the dev server compiles without errors.

**Step 3: Commit**

```bash
git add components/app/sidebars/sidebar-skeleton.tsx
git commit -m "feat: add sidebar skeleton component for loading states"
```

---

### Task 2: Create WikiSidebar Component

**Files:**
- Create: `components/app/sidebars/wiki-sidebar.tsx`

**Step 1: Create WikiSidebar component**

Create the file by copying and adapting the current AppSidebar logic:

```tsx
"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { wikiNavigationGroups } from "@/lib/navigation/wiki-navigation";

// Simple icon components (reuse from app-sidebar.tsx)
const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const BookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const AppleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
  </svg>
);

const DumbbellIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
  </svg>
);

const HeartIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const BeakerIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

// Icon mapping
const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  HomeIcon,
  BookIcon,
  AppleIcon,
  DumbbellIcon,
  HeartIcon,
  BeakerIcon,
};

type NavItem = {
  title: string;
  href: string;
  icon: any;
  description: string;
};

type NavGroup = {
  label: string;
  icon: any;
  items: NavItem[];
};

export function WikiSidebar() {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="hidden lg:flex lg:flex-col h-full shrink-0 transition-all duration-300 ease-in-out bg-[#ececf1] pb-3"
      style={{
        width: isHovered ? "200px" : "64px",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="navigation"
      aria-label="Wiki navigation"
    >
      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        {wikiNavigationGroups.map((group) => (
          <div key={group.label} className="mb-3">
            {/* Group label */}
            <div className="mb-1.5 flex items-center px-3">
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                <span className="text-xs font-semibold text-gray-400">—</span>
              </div>
              <span
                className={cn(
                  "ml-3 text-xs font-semibold text-gray-400 uppercase tracking-wider transition-opacity duration-500",
                  isHovered ? "opacity-100" : "opacity-0"
                )}
              >
                {group.label}
              </span>
            </div>

            {/* Group items */}
            {group.items.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              const IconComponent = iconMap[item.icon.name] || BookIcon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group h-9 flex items-center rounded-lg px-3 py-1.5 mb-0.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-gray-100 text-black shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-black"
                  )}
                >
                  <IconComponent
                    className={cn(
                      "h-5 w-5 shrink-0",
                      isActive ? "text-black" : "text-gray-500 group-hover:text-black"
                    )}
                  />
                  <span
                    className={cn(
                      "ml-3 truncate transition-opacity duration-500",
                      isHovered ? "opacity-100" : "opacity-0"
                    )}
                  >
                    {item.title}
                  </span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </div>
  );
}
```

**Step 2: Verify compilation**

Run: `pnpm dev` and verify no TypeScript errors.

**Step 3: Commit**

```bash
git add components/app/sidebars/wiki-sidebar.tsx
git commit -m "feat: add WikiSidebar component for wiki section"
```

---

### Task 3: Create DashboardSidebar Component

**Files:**
- Create: `components/app/sidebars/dashboard-sidebar.tsx`

**Step 1: Create DashboardSidebar component**

Copy WikiSidebar and adapt for dashboard:

```tsx
"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { dashboardNavigationGroups } from "@/lib/navigation/dashboard-navigation";

// Copy all icon components from WikiSidebar (HomeIcon, BookIcon, etc.)
// Plus additional dashboard-specific icons:

const DashboardIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ChartIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ActivityIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  DashboardIcon,
  ChartIcon,
  ActivityIcon,
  UserIcon,
  SettingsIcon,
};

type NavItem = {
  title: string;
  href: string;
  icon: any;
  description: string;
};

type NavGroup = {
  label: string;
  icon: any;
  items: NavItem[];
};

export function DashboardSidebar() {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="hidden lg:flex lg:flex-col h-full shrink-0 transition-all duration-300 ease-in-out bg-[#ececf1] pb-3"
      style={{
        width: isHovered ? "200px" : "64px",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="navigation"
      aria-label="Dashboard navigation"
    >
      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        {dashboardNavigationGroups.map((group) => (
          <div key={group.label} className="mb-3">
            <div className="mb-1.5 flex items-center px-3">
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                <span className="text-xs font-semibold text-gray-400">—</span>
              </div>
              <span
                className={cn(
                  "ml-3 text-xs font-semibold text-gray-400 uppercase tracking-wider transition-opacity duration-500",
                  isHovered ? "opacity-100" : "opacity-0"
                )}
              >
                {group.label}
              </span>
            </div>

            {group.items.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              const IconComponent = iconMap[item.icon.name] || DashboardIcon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group h-9 flex items-center rounded-lg px-3 py-1.5 mb-0.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-gray-100 text-black shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-black"
                  )}
                >
                  <IconComponent
                    className={cn(
                      "h-5 w-5 shrink-0",
                      isActive ? "text-black" : "text-gray-500 group-hover:text-black"
                    )}
                  />
                  <span
                    className={cn(
                      "ml-3 truncate transition-opacity duration-500",
                      isHovered ? "opacity-100" : "opacity-0"
                    )}
                  >
                    {item.title}
                  </span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </div>
  );
}
```

**Step 2: Verify compilation**

Run: `pnpm dev` and check for errors.

**Step 3: Commit**

```bash
git add components/app/sidebars/dashboard-sidebar.tsx
git commit -m "feat: add DashboardSidebar component for dashboard section"
```

---

### Task 4: Create CarveSidebar Component

**Files:**
- Create: `components/app/sidebars/carve-sidebar.tsx`

**Step 1: Create CarveSidebar component**

Similar structure to WikiSidebar but with carveNavigationGroups:

```tsx
"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { carveNavigationGroups } from "@/lib/navigation/carve-navigation";

const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const InfoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const RocketIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  HomeIcon,
  InfoIcon,
  RocketIcon,
  UsersIcon,
};

type NavItem = {
  title: string;
  href: string;
  icon: any;
  description: string;
};

type NavGroup = {
  label: string;
  icon: any;
  items: NavItem[];
};

export function CarveSidebar() {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="hidden lg:flex lg:flex-col h-full shrink-0 transition-all duration-300 ease-in-out bg-[#ececf1] pb-3"
      style={{
        width: isHovered ? "200px" : "64px",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="navigation"
      aria-label="Carve navigation"
    >
      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        {carveNavigationGroups.map((group) => (
          <div key={group.label} className="mb-3">
            <div className="mb-1.5 flex items-center px-3">
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                <span className="text-xs font-semibold text-gray-400">—</span>
              </div>
              <span
                className={cn(
                  "ml-3 text-xs font-semibold text-gray-400 uppercase tracking-wider transition-opacity duration-500",
                  isHovered ? "opacity-100" : "opacity-0"
                )}
              >
                {group.label}
              </span>
            </div>

            {group.items.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              const IconComponent = iconMap[item.icon.name] || HomeIcon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group h-9 flex items-center rounded-lg px-3 py-1.5 mb-0.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-gray-100 text-black shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-black"
                  )}
                >
                  <IconComponent
                    className={cn(
                      "h-5 w-5 shrink-0",
                      isActive ? "text-black" : "text-gray-500 group-hover:text-black"
                    )}
                  />
                  <span
                    className={cn(
                      "ml-3 truncate transition-opacity duration-500",
                      isHovered ? "opacity-100" : "opacity-0"
                    )}
                  >
                    {item.title}
                  </span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </div>
  );
}
```

**Step 2: Verify compilation**

Run: `pnpm dev`

**Step 3: Commit**

```bash
git add components/app/sidebars/carve-sidebar.tsx
git commit -m "feat: add CarveSidebar component for carve section"
```

---

## Phase 2: Layout Restructuring

### Task 5: Create Wiki Layout with Suspense

**Files:**
- Create: `app/wiki/layout.tsx`
- Create: `app/wiki/loading.tsx`

**Step 1: Create wiki layout**

Create `app/wiki/layout.tsx`:

```tsx
import { Suspense } from "react";
import { WikiSidebar } from "@/components/app/sidebars/wiki-sidebar";
import { SidebarSkeleton } from "@/components/app/sidebars/sidebar-skeleton";
import { AppContent } from "@/components/app/app-shell";

export default function WikiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={<SidebarSkeleton />}>
        <WikiSidebar />
      </Suspense>
      <AppContent padded={false}>
        {children}
      </AppContent>
    </>
  );
}
```

**Step 2: Create wiki loading file**

Create `app/wiki/loading.tsx`:

```tsx
export default function WikiLoading() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
}
```

**Step 3: Verify wiki section renders**

Run: `pnpm dev` and navigate to `/wiki` to verify sidebar shows.

**Step 4: Commit**

```bash
git add app/wiki/layout.tsx app/wiki/loading.tsx
git commit -m "feat: add wiki layout with suspense boundary for sidebar"
```

---

### Task 6: Create Dashboard Layout with Suspense

**Files:**
- Create: `app/(protected)/dashboard/layout.tsx`
- Create: `app/(protected)/dashboard/loading.tsx`

**Step 1: Create dashboard layout**

Note: Dashboard is under `(protected)` route group.

Create `app/(protected)/dashboard/layout.tsx`:

```tsx
import { Suspense } from "react";
import { DashboardSidebar } from "@/components/app/sidebars/dashboard-sidebar";
import { SidebarSkeleton } from "@/components/app/sidebars/sidebar-skeleton";
import { AppContent } from "@/components/app/app-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={<SidebarSkeleton />}>
        <DashboardSidebar />
      </Suspense>
      <AppContent padded={false}>
        {children}
      </AppContent>
    </>
  );
}
```

**Step 2: Create dashboard loading file**

Create `app/(protected)/dashboard/loading.tsx`:

```tsx
export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
}
```

**Step 3: Verify dashboard renders**

Run: `pnpm dev`, login, and navigate to `/dashboard`.

**Step 4: Commit**

```bash
git add app/\(protected\)/dashboard/layout.tsx app/\(protected\)/dashboard/loading.tsx
git commit -m "feat: add dashboard layout with suspense boundary for sidebar"
```

---

### Task 7: Create Carve Layout with Suspense

**Files:**
- Create: `app/carve/layout.tsx`
- Create: `app/carve/loading.tsx`

**Step 1: Create carve layout**

Create `app/carve/layout.tsx`:

```tsx
import { Suspense } from "react";
import { CarveSidebar } from "@/components/app/sidebars/carve-sidebar";
import { SidebarSkeleton } from "@/components/app/sidebars/sidebar-skeleton";
import { AppContent } from "@/components/app/app-shell";

export default function CarveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={<SidebarSkeleton />}>
        <CarveSidebar />
      </Suspense>
      <AppContent padded={false}>
        {children}
      </AppContent>
    </>
  );
}
```

**Step 2: Create carve loading file**

Create `app/carve/loading.tsx`:

```tsx
export default function CarveLoading() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
}
```

**Step 3: Verify carve section renders**

Run: `pnpm dev` and navigate to `/carve`.

**Step 4: Commit**

```bash
git add app/carve/layout.tsx app/carve/loading.tsx
git commit -m "feat: add carve layout with suspense boundary for sidebar"
```

---

### Task 8: Update Root Layout (Remove AppSidebar)

**Files:**
- Modify: `app/layout.tsx`

**Step 1: Remove AppSidebar from root layout**

Modify `app/layout.tsx` to remove the AppSidebar import and usage:

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppShell, AppBody, AppContent } from "@/components/app/app-shell";
import { AppHeader } from "@/components/app/app-header";
// REMOVE: import { AppSidebar } from "@/components/app/app-sidebar";
import { createClient } from "@/lib/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Carve Wiki - Your Health & Fitness Knowledge Base",
  description: "Evidence-based information on nutrition, fitness, and health. Track your progress with personalized dashboards.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  return (
    <html lang="en">
      <head>
        {/* Plausible Analytics - Privacy-first, no cookies */}
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
          />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#ececf1]`}
      >
        <div className="min-h-screen bg-[#ececf1]">
          {/* Fixed header */}
          <div className="fixed top-0 left-0 right-0 z-50">
            <AppHeader
              isAuthenticated={!!user}
              userEmail={user?.email}
              userName={profile?.display_name || profile?.username || undefined}
              userAvatar={profile?.avatar_image_url || undefined}
            />
          </div>

          {/* Main content with padding - sidebars now in nested layouts */}
          <div className="fixed top-16 left-0 right-2 bottom-2 md:right-2 md:bottom-2 lg:right-3 lg:bottom-3">
            <AppShell>
              <AppBody>
                {/* REMOVE: <AppSidebar /> */}
                {/* Children now include section-specific sidebars via nested layouts */}
                {children}
              </AppBody>
            </AppShell>
          </div>
        </div>
      </body>
    </html>
  );
}
```

**Step 2: Verify all sections still work**

Run: `pnpm dev` and test navigation between `/wiki`, `/dashboard`, `/carve`.

**Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "refactor: remove AppSidebar from root layout, sidebars now in nested layouts"
```

---

### Task 9: Delete Old AppSidebar Component

**Files:**
- Delete: `components/app/app-sidebar.tsx`

**Step 1: Delete the old sidebar file**

```bash
git rm components/app/app-sidebar.tsx
```

**Step 2: Verify no imports remain**

Search for any remaining imports:

```bash
grep -r "app-sidebar" app/ components/ --include="*.tsx" --include="*.ts"
```

Should return no results.

**Step 3: Commit**

```bash
git commit -m "refactor: remove old AppSidebar component"
```

---

## Phase 3: Enhanced Header - Navigation

### Task 10: Add Hiscores to Header Navigation

**Files:**
- Modify: `components/app/app-header.tsx`

**Step 1: Read current header implementation**

Read: `components/app/app-header.tsx` to understand current structure.

**Step 2: Add Hiscores navigation link**

Modify the navigation section in `app-header.tsx` to add Hiscores link alongside existing navigation:

```tsx
// Find the navigation section (likely around line 40-60) and add:
<Link
  href="/hiscores"
  className={cn(
    "px-3 py-2 text-sm font-medium rounded-md transition-colors",
    pathname === "/hiscores" || pathname.startsWith("/hiscores")
      ? "bg-gray-100 text-black"
      : "text-gray-700 hover:bg-gray-50 hover:text-black"
  )}
>
  Hiscores
</Link>
```

Add this after the Dashboard link in the navigation section.

**Step 3: Verify Hiscores link appears**

Run: `pnpm dev` and check header shows "Wiki | Dashboard | Hiscores".

**Step 4: Commit**

```bash
git add components/app/app-header.tsx
git commit -m "feat: add Hiscores navigation link to header"
```

---

## Phase 4: Global Search Implementation

### Task 11: Install Dependencies for Search

**Files:**
- Modify: `package.json`

**Step 1: Install cmdk for command palette UI (optional but recommended)**

```bash
pnpm add cmdk
```

**Step 2: Verify installation**

Check `package.json` includes cmdk.

**Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "deps: add cmdk for search UI"
```

---

### Task 12: Create Global Search Component

**Files:**
- Create: `components/search/global-search.tsx`
- Create: `components/search/search-results.tsx`

**Step 1: Create search results component**

Create `components/search/search-results.tsx`:

```tsx
import Link from "next/link";

type SearchResult = {
  id: string;
  type: "wiki" | "user" | "hiscore";
  title: string;
  description?: string;
  href: string;
};

type SearchResultsProps = {
  results: SearchResult[];
  isLoading: boolean;
  query: string;
};

export function SearchResults({ results, isLoading, query }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (query && results.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No results for &quot;{query}&quot;
      </div>
    );
  }

  // Group results by type
  const wikiResults = results.filter((r) => r.type === "wiki");
  const userResults = results.filter((r) => r.type === "user");
  const hiscoreResults = results.filter((r) => r.type === "hiscore");

  return (
    <div className="py-2 max-h-96 overflow-y-auto">
      {wikiResults.length > 0 && (
        <div className="mb-2">
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
            📚 Wiki Articles ({wikiResults.length})
          </div>
          {wikiResults.map((result) => (
            <Link
              key={result.id}
              href={result.href}
              className="block px-4 py-2 hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium text-sm">{result.title}</div>
              {result.description && (
                <div className="text-xs text-gray-500 truncate">{result.description}</div>
              )}
            </Link>
          ))}
        </div>
      )}

      {userResults.length > 0 && (
        <div className="mb-2">
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
            👤 Users ({userResults.length})
          </div>
          {userResults.map((result) => (
            <Link
              key={result.id}
              href={result.href}
              className="block px-4 py-2 hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium text-sm">{result.title}</div>
            </Link>
          ))}
        </div>
      )}

      {hiscoreResults.length > 0 && (
        <div className="mb-2">
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
            🏆 Hiscores
          </div>
          <Link
            href="/hiscores"
            className="block px-4 py-2 hover:bg-gray-50 transition-colors text-sm text-blue-600"
          >
            View all in Hiscores →
          </Link>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Create global search component**

Create `components/search/global-search.tsx`:

```tsx
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SearchResults } from "./search-results";
import { useDebouncedCallback } from "use-debounce";

type SearchResult = {
  id: string;
  type: "wiki" | "user" | "hiscore";
  title: string;
  description?: string;
  href: string;
};

type GlobalSearchProps = {
  className?: string;
  variant?: "compact" | "large";
  autoFocus?: boolean;
};

export function GlobalSearch({ className, variant = "compact", autoFocus = false }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search (300ms)
  const debouncedSearch = useDebouncedCallback(performSearch, 300);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // "/" to focus search
      if (e.key === "/" && !isOpen && variant === "compact") {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      }
      // Escape to close
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        setQuery("");
        setResults([]);
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, variant]);

  // Auto-focus for large variant (homepage)
  useEffect(() => {
    if (autoFocus && variant === "large") {
      inputRef.current?.focus();
    }
  }, [autoFocus, variant]);

  // Compact variant (header)
  if (variant === "compact") {
    return (
      <div className={className}>
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        ) : (
          <div className="relative">
            <div className="flex items-center bg-white rounded-md shadow-sm border border-gray-200">
              <svg className="w-5 h-5 ml-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleInputChange}
                onFocus={() => setIsOpen(true)}
                placeholder="Search everything..."
                className="w-64 px-3 py-2 focus:outline-none bg-transparent"
              />
              <button
                onClick={() => {
                  setIsOpen(false);
                  setQuery("");
                  setResults([]);
                }}
                className="p-2 text-gray-400 hover:text-gray-600"
                aria-label="Close search"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Results dropdown */}
            {isOpen && (query || results.length > 0) && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                <SearchResults results={results} isLoading={isLoading} query={query} />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Large variant (homepage)
  return (
    <div className={className}>
      <div className="relative max-w-2xl mx-auto">
        <div className="flex items-center bg-white rounded-lg shadow-lg border border-gray-300">
          <svg className="w-6 h-6 ml-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search articles, users, rankings..."
            className="w-full px-4 py-4 text-lg focus:outline-none bg-transparent"
          />
        </div>

        {/* Results overlay */}
        {(query || results.length > 0) && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
            <SearchResults results={results} isLoading={isLoading} query={query} />
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 3: Install use-debounce dependency**

```bash
pnpm add use-debounce
```

**Step 4: Verify components compile**

Run: `pnpm dev`

**Step 5: Commit**

```bash
git add components/search/ package.json pnpm-lock.yaml
git commit -m "feat: add global search components with debounced input"
```

---

### Task 13: Create Search API Endpoint

**Files:**
- Create: `app/api/search/route.ts`

**Step 1: Create search API route**

Create `app/api/search/route.ts`:

```tsx
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  try {
    const supabase = await createClient();

    // Search wiki articles
    const { data: wikiArticles } = await supabase
      .from("wiki_articles")
      .select("id, title, slug, category")
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .limit(5);

    // Search user profiles
    const { data: userProfiles } = await supabase
      .from("profiles")
      .select("id, username, display_name")
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .eq("is_public", true)
      .limit(3);

    // Build results
    const results = [
      ...(wikiArticles || []).map((article) => ({
        id: article.id,
        type: "wiki" as const,
        title: article.title,
        description: `${article.category}`,
        href: `/wiki/${article.category}/${article.slug}`,
      })),
      ...(userProfiles || []).map((profile) => ({
        id: profile.id,
        type: "user" as const,
        title: profile.display_name || profile.username,
        href: `/profile/${profile.username}`,
      })),
    ];

    // Add hiscores hint if query might be user-related
    if (query.length > 2) {
      results.push({
        id: "hiscores",
        type: "hiscore" as const,
        title: "Search in Hiscores",
        href: `/hiscores?q=${encodeURIComponent(query)}`,
      });
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ results: [], error: "Search failed" }, { status: 500 });
  }
}
```

**Step 2: Verify API works**

Run: `pnpm dev`
Test: `curl http://localhost:3000/api/search?q=protein`

**Step 3: Commit**

```bash
git add app/api/search/route.ts
git commit -m "feat: add global search API endpoint with wiki and user search"
```

---

### Task 14: Add Search to Header

**Files:**
- Modify: `components/app/app-header.tsx`

**Step 1: Import and add GlobalSearch to header**

Modify `app-header.tsx` to import and render GlobalSearch:

```tsx
import { GlobalSearch } from "@/components/search/global-search";

// In the header's right side (around where user avatar is), add:
<GlobalSearch variant="compact" className="mr-4" />
```

Add this before the language switcher (or where appropriate in the header right section).

**Step 2: Verify search appears in header**

Run: `pnpm dev` and check header has search icon that expands.

**Step 3: Test "/" keyboard shortcut**

Press "/" on any page and verify search opens.

**Step 4: Commit**

```bash
git add components/app/app-header.tsx
git commit -m "feat: integrate global search into header with keyboard shortcut"
```

---

### Task 15: Add Hero Search to Homepage

**Files:**
- Modify: `app/page.tsx`

**Step 1: Read current homepage**

Read: `app/page.tsx` to understand current structure.

**Step 2: Add hero search section**

Modify `app/page.tsx` to add a hero section with large search at the top:

```tsx
import { GlobalSearch } from "@/components/search/global-search";

// Add near the top of the page content:
<section className="py-20 px-4">
  <div className="max-w-4xl mx-auto text-center">
    <h1 className="text-4xl md:text-5xl font-bold mb-4">
      Your Health & Fitness Knowledge Base
    </h1>
    <p className="text-xl text-gray-600 mb-8">
      Search articles, find users, explore rankings
    </p>
    <GlobalSearch variant="large" autoFocus />
  </div>
</section>
```

**Step 3: Verify homepage auto-focuses search**

Run: `pnpm dev`, navigate to `/`, and verify search is auto-focused.

**Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add hero search with auto-focus to homepage"
```

---

## Phase 5: Internationalization (i18n)

### Task 16: Install next-intl

**Files:**
- Modify: `package.json`

**Step 1: Install next-intl**

```bash
pnpm add next-intl
```

**Step 2: Verify installation**

Check `package.json` includes next-intl.

**Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "deps: add next-intl for internationalization"
```

---

### Task 17: Configure next-intl

**Files:**
- Create: `i18n.ts`
- Create: `middleware.ts` (modify if exists)
- Create: `messages/en.json`
- Create: `messages/nl.json`

**Step 1: Create i18n config**

Create `i18n.ts` in root:

```ts
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default
}));
```

**Step 2: Update middleware for locale routing**

Modify or create `middleware.ts`:

```ts
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'nl'],

  // Used when no locale matches
  defaultLocale: 'en',

  // Automatically detect locale from browser
  localeDetection: true,
});

export const config = {
  // Match all pathnames except for
  // - /api (API routes)
  // - /_next (Next.js internals)
  // - /_vercel (Vercel internals)
  // - /static (static files)
  matcher: ['/((?!api|_next|_vercel|static|.*\\..*).*)']
};
```

**Step 3: Create English messages file**

Create `messages/en.json`:

```json
{
  "nav": {
    "wiki": "Wiki",
    "dashboard": "Dashboard",
    "hiscores": "Hiscores",
    "login": "Login",
    "logout": "Logout"
  },
  "search": {
    "placeholder": "Search everything...",
    "placeholderLarge": "Search articles, users, rankings...",
    "noResults": "No results for \"{query}\"",
    "wikiArticles": "Wiki Articles",
    "users": "Users",
    "viewAllHiscores": "View all in Hiscores"
  },
  "common": {
    "loading": "Loading..."
  }
}
```

**Step 4: Create Dutch messages file**

Create `messages/nl.json`:

```json
{
  "nav": {
    "wiki": "Wiki",
    "dashboard": "Dashboard",
    "hiscores": "Hiscores",
    "login": "Inloggen",
    "logout": "Uitloggen"
  },
  "search": {
    "placeholder": "Zoek alles...",
    "placeholderLarge": "Zoek artikelen, gebruikers, rankings...",
    "noResults": "Geen resultaten voor \"{query}\"",
    "wikiArticles": "Wiki Artikelen",
    "users": "Gebruikers",
    "viewAllHiscores": "Bekijk alles in Hiscores"
  },
  "common": {
    "loading": "Laden..."
  }
}
```

**Step 5: Verify middleware works**

Run: `pnpm dev` and check if routes redirect to `/en` or `/nl`.

**Step 6: Commit**

```bash
git add i18n.ts middleware.ts messages/
git commit -m "feat: configure next-intl with EN/NL locales"
```

---

### Task 18: Create Language Switcher Component

**Files:**
- Create: `components/language-switcher.tsx`

**Step 1: Create language switcher**

Create `components/language-switcher.tsx`:

```tsx
"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: "en", label: "EN" },
    { code: "nl", label: "NL" },
  ];

  const handleLanguageChange = (newLocale: string) => {
    // Remove current locale from pathname and add new one
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPathname);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-black rounded-md transition-colors"
        aria-label="Select language"
      >
        {locale.toUpperCase()}
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-24 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors first:rounded-t-md last:rounded-b-md ${
                locale === lang.code ? "font-semibold" : ""
              }`}
            >
              {locale === lang.code && "✓ "}
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Verify component compiles**

Run: `pnpm dev`

**Step 3: Commit**

```bash
git add components/language-switcher.tsx
git commit -m "feat: add language switcher component with dropdown"
```

---

### Task 19: Add Language Switcher to Header

**Files:**
- Modify: `components/app/app-header.tsx`

**Step 1: Import and add LanguageSwitcher**

Modify `app-header.tsx`:

```tsx
import { LanguageSwitcher } from "@/components/language-switcher";

// In the header's right side (between search and user section), add:
<LanguageSwitcher />
```

**Step 2: Verify language switcher appears**

Run: `pnpm dev` and check header shows language dropdown.

**Step 3: Test switching languages**

Click EN/NL and verify URL changes and page re-renders.

**Step 4: Commit**

```bash
git add components/app/app-header.tsx
git commit -m "feat: add language switcher to header"
```

---

### Task 20: Update Components to Use Translations

**Files:**
- Modify: `components/app/app-header.tsx`
- Modify: `components/search/global-search.tsx`
- Modify: `components/search/search-results.tsx`

**Step 1: Update header with translations**

Modify `app-header.tsx` to use `useTranslations`:

```tsx
import { useTranslations } from 'next-intl';

export function AppHeader(/* ... */) {
  const t = useTranslations('nav');

  // Replace hardcoded text:
  // "Wiki" → {t('wiki')}
  // "Dashboard" → {t('dashboard')}
  // "Hiscores" → {t('hiscores')}
  // "Login" → {t('login')}
  // "Logout" → {t('logout')}
}
```

**Step 2: Update search components with translations**

Modify `global-search.tsx`:

```tsx
import { useTranslations } from 'next-intl';

export function GlobalSearch(/* ... */) {
  const t = useTranslations('search');

  // Update placeholders:
  // "Search everything..." → {t('placeholder')}
  // "Search articles, users, rankings..." → {t('placeholderLarge')}
}
```

Modify `search-results.tsx`:

```tsx
import { useTranslations } from 'next-intl';

export function SearchResults(/* ... */) {
  const t = useTranslations('search');

  // Update labels:
  // "No results for" → {t('noResults', { query })}
  // "Wiki Articles" → {t('wikiArticles')}
  // "Users" → {t('users')}
  // "View all in Hiscores" → {t('viewAllHiscores')}
}
```

**Step 3: Verify translations work**

Run: `pnpm dev`, switch languages, and verify text updates.

**Step 4: Commit**

```bash
git add components/app/app-header.tsx components/search/
git commit -m "feat: integrate translations into header and search components"
```

---

## Phase 6: Testing & Polish

### Task 21: Test All Routes and Transitions

**Files:**
- N/A (manual testing)

**Step 1: Test wiki navigation**

1. Navigate to `/wiki`
2. Verify WikiSidebar appears
3. Navigate to different wiki pages
4. Check for skeleton during transitions

**Step 2: Test dashboard navigation**

1. Login
2. Navigate to `/dashboard`
3. Verify DashboardSidebar appears
4. Check protected routes work

**Step 3: Test carve navigation**

1. Navigate to `/carve`
2. Verify CarveSidebar appears

**Step 4: Test cross-section transitions**

1. Navigate from wiki → dashboard → carve
2. Verify sidebar changes and skeleton shows during transitions
3. Check no layout shifts

**Step 5: Test search functionality**

1. Test "/" keyboard shortcut
2. Test header search (compact)
3. Test homepage search (large)
4. Verify results appear correctly
5. Test clicking results navigates correctly

**Step 6: Test language switching**

1. Switch from EN to NL
2. Verify URL changes
3. Verify translations update
4. Test on different pages

**Step 7: Test mobile responsiveness**

1. Resize browser to mobile
2. Check hamburger menu
3. Verify search overlay on mobile
4. Test navigation

**Step 8: Document any issues found**

Create issues in GitHub or note them for fixes.

---

### Task 22: Add Error Boundaries

**Files:**
- Create: `components/error-boundary.tsx`
- Modify: `app/wiki/error.tsx` (create if doesn't exist)
- Modify: `app/dashboard/error.tsx` (create if doesn't exist)
- Modify: `app/carve/error.tsx` (create if doesn't exist)

**Step 1: Create error boundary component**

Create `components/error-boundary.tsx`:

```tsx
"use client";

import { useEffect } from "react";

export function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-gray-600 mb-4">
        {error.message || "An unexpected error occurred"}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
```

**Step 2: Add error files for each section**

Create `app/wiki/error.tsx`:

```tsx
"use client";

import { ErrorBoundary } from "@/components/error-boundary";

export default ErrorBoundary;
```

Create similar files for dashboard and carve.

**Step 3: Commit**

```bash
git add components/error-boundary.tsx app/wiki/error.tsx app/\(protected\)/dashboard/error.tsx app/carve/error.tsx
git commit -m "feat: add error boundaries for each section"
```

---

### Task 23: Final Verification and Cleanup

**Files:**
- N/A

**Step 1: Run type checking**

```bash
pnpm tsc --noEmit
```

Fix any TypeScript errors.

**Step 2: Run linting**

```bash
pnpm lint
```

Fix any linting issues.

**Step 3: Test production build**

```bash
pnpm build
```

Verify build succeeds without errors.

**Step 4: Check for unused imports/files**

Search for any unused imports or old files that should be removed.

**Step 5: Update documentation**

Verify `docs/plans/2025-01-11-sidebar-refactor-design.md` is up to date with any changes made during implementation.

**Step 6: Final commit**

```bash
git add .
git commit -m "chore: final cleanup and verification"
```

---

## Completion Checklist

- [ ] All sidebar components created (Wiki, Dashboard, Carve)
- [ ] Sidebar skeleton component created
- [ ] Section layouts with Suspense boundaries
- [ ] Root layout updated (AppSidebar removed)
- [ ] Hiscores added to header navigation
- [ ] Global search implemented (header + homepage)
- [ ] Search API endpoint working
- [ ] Language switcher added to header
- [ ] next-intl configured with EN/NL
- [ ] Translations integrated into components
- [ ] Error boundaries added
- [ ] All tests passing (manual testing complete)
- [ ] TypeScript errors resolved
- [ ] Production build successful
- [ ] Documentation updated

---

## Notes for Implementation

**Key principles:**
- DRY: Icon components are duplicated across sidebars initially, but can be extracted to a shared file later if needed
- YAGNI: Search only covers wiki/users/hiscores initially, can expand to exercises/nutrition later
- TDD approach: Not fully applicable here as it's mostly UI work, but API endpoint should have tests in future
- Frequent commits: Each task ends with a commit

**Database requirements:**
- Assumes `wiki_articles` table exists with columns: id, title, slug, category, content
- Assumes `profiles` table has: id, username, display_name, is_public
- Full-text search may require database indexes for performance

**Performance considerations:**
- Search is debounced to 300ms to reduce API calls
- Suspense boundaries prevent blocking navigation
- Skeletons match sidebar dimensions to prevent CLS

**Future enhancements:**
- Extract shared icon components to `components/icons/`
- Add tests for search API
- Implement keyboard navigation for search results (arrow keys)
- Add search analytics tracking
- Cache search results client-side
- Add more granular search filters
