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
