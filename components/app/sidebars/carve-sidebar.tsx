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
