'use client'

import { usePathname } from 'next/navigation'
import { AppShell, AppBody } from "@/components/app/app-shell"
import { AppHeader } from "@/components/app/app-header"

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

  // Check if this is an old-style auth route (login, signup, etc.) - exclude /dashboard/login
  const isAuthRoute = (pathname?.includes('/login') || pathname?.includes('/signup') || pathname?.includes('/forgot-password'))
    && !pathname?.includes('/dashboard/login')

  // Old auth routes get minimal layout (no app chrome)
  if (isAuthRoute) {
    return <>{children}</>
  }

  // Regular routes get full app chrome
  return (
    <div className="fixed inset-0 flex flex-col bg-[#ececf1]">
      {/* Fixed header */}
      <div className="shrink-0">
        <AppHeader
          isAuthenticated={isAuthenticated}
          userEmail={userEmail}
          userName={userName}
          userAvatar={userAvatar}
          userRole={userRole}
        />
      </div>

      {/* Main content with padding */}
      <div className="flex-1 min-h-0 p-2 pt-0 md:p-2 md:pt-0 lg:p-3 lg:pt-0">
        <AppShell>
          <AppBody>
            {children}
          </AppBody>
        </AppShell>
      </div>
    </div>
  )
}
