'use client'

import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { AppShell, AppBody, AppContent } from "@/components/app/app-shell"
import { AppHeader } from "@/components/app/app-header"
import { AppSidebarController } from "@/components/app/app-sidebar-controller"
import { MarketingHeader } from "@/components/carve/MarketingHeader"

interface LayoutWrapperProps {
  children: React.ReactNode
  isAuthenticated: boolean
  userEmail?: string
  userName?: string
  userAvatar?: string
  userRole?: string
}

export function LayoutWrapper({
  children,
  isAuthenticated,
  userEmail,
  userName,
  userAvatar,
  userRole,
}: LayoutWrapperProps) {
  const pathname = usePathname()

  // Check if this is an auth route (login, signup, etc.) - exclude /dashboard/login
  const isAuthRoute = (pathname?.includes('/login') || pathname?.includes('/signup') || pathname?.includes('/forgot-password'))
    && !pathname?.includes('/dashboard/login')

  // Marketing pages render without app shell (no header, sidebar, border)
  const strippedPath = pathname?.replace(/^\/(nl|en|de|fr|es)/, '') || ''
  const isMarketingRoute =
    strippedPath === '/carve' ||
    strippedPath === '/carve/health' ||
    strippedPath === '/carve/money'

  // Auth routes get minimal layout (no app chrome)
  if (isAuthRoute) {
    return <>{children}</>
  }

  // Marketing routes: full viewport, own header, no app chrome
  if (isMarketingRoute) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <MarketingHeader isAuthenticated={isAuthenticated} />
        {children}
      </div>
    )
  }

  // Check if route should have edge-to-edge content (no padding)
  // Use includes() to handle locale prefixes like /nl/carve, /en/wiki, etc.
  const isEdgeToEdgeRoute =
    pathname === '/' ||
    pathname?.includes('/wiki') ||
    pathname?.includes('/admin') ||
    pathname?.includes('/carve') ||
    pathname?.includes('/dashboard/money')

  const isMoneyRoute = pathname?.includes('/dashboard/money')

  return (
    <div className={cn("min-h-screen", isMoneyRoute ? "bg-[#111318]" : "bg-[#ececf1]")}>
      {/* Fixed header at top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <AppHeader
          isAuthenticated={isAuthenticated}
          userEmail={userEmail}
          userName={userName}
          userAvatar={userAvatar}
          userRole={userRole}
        />
      </div>

      {/* Shell wrapper - flush left, spacing on right/bottom */}
      <div className="fixed top-16 left-0 right-2 bottom-2 md:right-2 md:bottom-2 lg:right-3 lg:bottom-3">
        <AppShell hasGlobalHeader headerHeight={64} disablePageScroll={true}>
          <AppBody>
            {/* Sidebar controller */}
            <AppSidebarController
              isAuthenticated={isAuthenticated}
              userRole={userRole}
            />
            {/* Main content */}
            <AppContent padded={!isEdgeToEdgeRoute} useFixedHeight={true}>
              {children}
            </AppContent>
          </AppBody>
        </AppShell>
      </div>
    </div>
  )
}
