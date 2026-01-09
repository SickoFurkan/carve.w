'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

// Import navigation configs
import { wikiNavigationGroups } from '@/lib/navigation/wiki-navigation';
import { dashboardNavigationGroups, loginNavigationGroups } from '@/lib/navigation/dashboard-navigation';
import { adminNavigationGroups } from '@/lib/navigation/admin-navigation';
import { hiscoresNavigationGroups } from '@/lib/navigation/hiscores-navigation';
import { carveNavigationGroups } from '@/lib/navigation/carve-navigation';
import { supportNavigationGroups } from '@/lib/navigation/support-navigation';

// Import icons
import { iconMap } from '@/components/icons/sidebar-icons';

type NavigationItem = {
  title: string;
  href: string;
  icon: { name: string };
  description: string;
};

type NavigationGroup = {
  label: string;
  icon: { name: string };
  items: NavigationItem[];
};

// Supported locales - strip these from pathname for route matching
const LOCALES = ['en', 'nl', 'de', 'fr', 'es'];

function stripLocale(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0 && LOCALES.includes(segments[0])) {
    return '/' + segments.slice(1).join('/') || '/';
  }
  return pathname;
}

function getSidebarGroups(pathname: string, isAuthenticated: boolean, userRole?: string): NavigationGroup[] | null {
  const path = stripLocale(pathname);

  if (path === '/' || path.startsWith('/wiki')) {
    return wikiNavigationGroups as NavigationGroup[];
  }
  if (path.startsWith('/admin')) {
    if (userRole !== 'admin') return null;
    return adminNavigationGroups as NavigationGroup[];
  }
  if (path.startsWith('/dashboard')) {
    return isAuthenticated
      ? (dashboardNavigationGroups as NavigationGroup[])
      : (loginNavigationGroups as NavigationGroup[]);
  }
  if (path.startsWith('/hiscores')) {
    return hiscoresNavigationGroups as NavigationGroup[];
  }
  if (path.startsWith('/carve')) {
    return carveNavigationGroups as NavigationGroup[];
  }
  if (path.startsWith('/support')) {
    return supportNavigationGroups as NavigationGroup[];
  }
  if (path.startsWith('/login') || path.startsWith('/signup')) {
    return wikiNavigationGroups as NavigationGroup[];
  }

  return wikiNavigationGroups as NavigationGroup[];
}

export function AppSidebarController({
  userRole,
  isAuthenticated = false,
}: {
  userRole?: string;
  isAuthenticated?: boolean;
}) {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const activeItemRef = useRef<HTMLAnchorElement>(null);
  const navRef = useRef<HTMLElement>(null);

  const groups = getSidebarGroups(pathname, isAuthenticated, userRole);
  const safeGroups = groups || [];
  const path = stripLocale(pathname);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setIsHovered(false);
  }, [pathname]);

  useEffect(() => {
    if (activeItemRef.current && navRef.current) {
      const scrollToActiveItem = () => {
        const navElement = navRef.current;
        const activeElement = activeItemRef.current;
        if (!navElement || !activeElement) return;

        const relativeTop = activeElement.offsetTop;
        const navHeight = navElement.clientHeight;
        const activeHeight = activeElement.clientHeight;
        const scrollTop = relativeTop - navHeight / 2 + activeHeight / 2;

        if (navElement.scrollTo) {
          navElement.scrollTo({
            top: Math.max(0, scrollTop),
            behavior: 'smooth',
          });
        } else {
          navElement.scrollTop = Math.max(0, scrollTop);
        }
      };

      const timer = setTimeout(scrollToActiveItem, 100);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  return (
    <>
      {/* Skeleton on first paint */}
      {!isMounted ? (
        <div
          className="hidden lg:flex lg:flex-col h-full max-h-full shrink-0 bg-[#ececf1] pb-3"
          style={{ width: 64, zIndex: 45 }}
          role="navigation"
          aria-label="Navigatie (laden)"
        >
          <nav className="flex-1 px-2 overflow-y-auto scrollbar-thin-auto-hide">
            <div className="mt-2 animate-pulse space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={`skeleton-${i}`} className="h-7 rounded-lg bg-gray-300/70" />
              ))}
            </div>
          </nav>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname.split('/')[1] || 'home'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="hidden lg:flex lg:flex-col h-full max-h-full shrink-0 transition-all duration-300 ease-in-out relative bg-[#ececf1] pb-3"
            style={{
              width: isHovered ? '200px' : '64px',
              zIndex: 45,
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            role="navigation"
            aria-label="Hoofdnavigatie"
          >
            {/* Main Navigation */}
            <nav ref={navRef} className="flex-1 px-2 overflow-y-auto scrollbar-thin-auto-hide">
              {safeGroups.map((group) => (
                <div key={`desktop-${group.label}`} className="mb-2">
                  {/* Group divider with label */}
                  <div className="flex items-center gap-2 px-3 mb-1 min-h-[24px]">
                    <div className="w-4 h-0.5 bg-gray-300 rounded shrink-0" />
                    <span
                      className={cn(
                        'text-[10px] font-bold uppercase tracking-wider text-gray-500 overflow-hidden whitespace-nowrap transition-opacity duration-500',
                        isHovered ? 'opacity-100' : 'opacity-0'
                      )}
                      style={{
                        display: 'inline-block',
                        width: isHovered ? 'auto' : 0,
                        minWidth: 0,
                      }}
                    >
                      {group.label}
                    </span>
                  </div>

                  {/* Group items */}
                  {group.items.map((item, itemIndex) => {
                    const isActive =
                      path === item.href ||
                      (item.href !== '/' && path.startsWith(item.href));

                    const iconName = item.icon?.name || 'HomeIcon';
                    const Icon = iconMap[iconName] || iconMap['HomeIcon'];
                    const uniqueKey = `desktop-${group.label}-${item.href}-${itemIndex}`;

                    return (
                      <div key={uniqueKey} className="mb-0.5">
                        <Link
                          ref={isActive ? activeItemRef : null}
                          href={item.href}
                          className={cn(
                            'group h-7 flex items-center rounded-lg px-3 py-1 text-sm font-medium relative',
                            isActive
                              ? 'bg-white text-gray-900 font-medium shadow-sm'
                              : 'text-gray-600 hover:bg-gray-300/70 hover:text-gray-900'
                          )}
                        >
                          <Icon
                            className={cn(
                              'h-5 w-5 shrink-0',
                              isActive
                                ? 'text-gray-700'
                                : 'text-gray-500 group-hover:text-gray-700'
                            )}
                          />
                          <span
                            className={cn(
                              'flex-1 ml-3 min-w-0 text-sm font-medium truncate overflow-hidden whitespace-nowrap transition-opacity duration-500',
                              isHovered ? 'opacity-100' : 'opacity-0'
                            )}
                            style={{
                              display: 'inline-block',
                              width: isHovered ? 'auto' : 0,
                              minWidth: 0,
                            }}
                          >
                            {item.title}
                          </span>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              ))}
            </nav>
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
}
