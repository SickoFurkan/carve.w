"use client";

import { Search, Settings, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useTranslations } from 'next-intl';

interface AppHeaderProps {
  className?: string;
  isAuthenticated?: boolean;
  userEmail?: string;
  userName?: string;
  userAvatar?: string;
  userRole?: string;
}

export function AppHeader({
  className,
  isAuthenticated = false,
  userEmail,
  userName,
  userAvatar,
  userRole,
}: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const t = useTranslations('nav');

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
    setIsDropdownOpen(false);
  };

  // Get initials from name or email
  const getInitials = () => {
    if (userName) {
      return userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (userEmail) {
      return userEmail.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  // Feature flags
  const showHiscores = process.env.NEXT_PUBLIC_FEATURE_HISCORES === 'true';

  const navItems = [
    { label: t('wiki'), href: '/' },
    ...(showHiscores ? [{ label: t('hiscores'), href: '/hiscores' }] : []),
    { label: t('carve'), href: '/carve', showIcon: true },
  ];

  return (
    <header
      className={cn(
        'flex items-center h-16 px-4',
        'bg-[#ececf1] text-gray-900',
        'w-full',
        className
      )}
      role="banner"
      aria-label="Carve Wiki header"
    >
      {/* 1. Logo Section - Fixed width */}
      <div className="flex items-center w-[200px]">
        <Link href="/" className="flex items-center">
          <Image
            src="/carvewikilogo.png"
            alt="Carve Wiki logo"
            width={56}
            height={28}
            className="object-contain"
            priority
          />
        </Link>
      </div>

      {/* 2. Navigation Section - takes remaining space, centers content */}
      <nav className="flex-1 flex items-center justify-center pl-12">
        <div className="flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors relative py-2 flex items-center gap-2',
                  isActive
                    ? 'text-gray-900 opacity-100'
                    : 'text-gray-900 opacity-60 hover:opacity-100'
                )}
              >
                {item.label}
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
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 3. User Actions Section - Fixed width */}
      <div className="flex items-center gap-3 justify-end w-[200px]">
        {/* Search Button */}
        <button
          type="button"
          className="h-9 w-9 flex items-center justify-center text-gray-900 opacity-60 hover:opacity-100 transition-all"
        >
          <Search className="h-4 w-4" />
          <span className="sr-only">Zoeken</span>
        </button>

        {/* Language */}
        <LanguageSwitcher />

        {/* User Menu */}
        {isAuthenticated ? (
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 rounded-full"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {userAvatar ? (
                <Image
                  src={userAvatar}
                  alt={userName || 'User'}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-medium">
                  {getInitials()}
                </div>
              )}
            </Button>

            {/* Dropdown */}
            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  {/* User info */}
                  <div className="px-2 py-1.5 border-b border-gray-100">
                    <p className="text-sm font-medium leading-none text-gray-900">
                      {userName || 'User'}
                    </p>
                    <p className="text-xs leading-none text-gray-500 mt-1">
                      {userEmail}
                    </p>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4" />
                      {t('dashboard')}
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      {t('settings')}
                    </Link>
                  </div>

                  {/* Admin link */}
                  {userRole === 'admin' && (
                    <>
                      <div className="border-t border-gray-100" />
                      <Link
                        href="/admin"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center px-2 py-1.5 text-sm text-purple-700 hover:bg-purple-50 cursor-pointer"
                      >
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Admin
                      </Link>
                    </>
                  )}

                  {/* Logout */}
                  <div className="border-t border-gray-100" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('logout')}
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center justify-center h-8 px-3 text-xs font-medium rounded-md bg-black text-white hover:bg-gray-800 transition-colors"
          >
            {t('dashboard')}
          </Link>
        )}
      </div>
    </header>
  );
}
