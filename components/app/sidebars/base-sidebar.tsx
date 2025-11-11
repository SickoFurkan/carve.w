"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { iconMap } from "@/components/icons/sidebar-icons";

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

interface BaseSidebarProps {
  navigationGroups: NavGroup[];
  ariaLabel: string;
}

export function BaseSidebar({ navigationGroups, ariaLabel }: BaseSidebarProps) {
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
      aria-label={ariaLabel}
    >
      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        {navigationGroups.map((group) => (
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
              const IconComponent = iconMap[item.icon.name];

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
