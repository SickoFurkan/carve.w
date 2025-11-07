"use client";

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AppHeaderProps {
  className?: string;
  isAuthenticated?: boolean;
}

export function AppHeader({
  className,
  isAuthenticated = false,
}: AppHeaderProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Carve', href: '/', showIcon: true },
    { label: 'Wiki', href: '/wiki', showIcon: false },
    { label: 'Dashboard', href: '/dashboard', showIcon: false },
  ];

  return (
    <header
      className={cn(
        'grid grid-cols-3 items-center h-16 px-4 sm:px-6 lg:px-8',
        'bg-[#ececf1]/95 backdrop-blur-sm',
        'border-b border-gray-200/20',
        'w-full',
        className
      )}
      role="banner"
    >
      {/* Logo Section */}
      <Link href="/" className="flex items-center gap-2 justify-self-start">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        </div>
        <span className="text-xl font-bold">Carve</span>
      </Link>

      {/* Navigation Section */}
      <nav className="flex items-center justify-center justify-self-center">
        <div className="flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors relative py-2 flex items-center gap-2',
                  isActive
                    ? 'text-black'
                    : 'text-gray-500 hover:text-black'
                )}
              >
                {item.showIcon && (
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
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                )}
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Actions Section */}
      <div className="flex items-center gap-3 justify-self-end">
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm font-medium hover:text-gray-600 transition-colors"
            >
              Dashboard
            </Link>
            <button
              className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
            >
              Profile
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
