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
}

export function LayoutWrapper({
  children,
  isAuthenticated,
  userEmail,
  userName,
  userAvatar,
}: LayoutWrapperProps) {
  const pathname = usePathname()

  // Check if this is an auth route (login, signup, etc.)
  const isAuthRoute = pathname?.includes('/login') || pathname?.includes('/signup') || pathname?.includes('/forgot-password')

  // Auth routes get minimal layout (no app chrome)
  if (isAuthRoute) {
    return <>{children}</>
  }

  // Regular routes get full app chrome
  return (
    <div className="min-h-screen bg-[#ececf1]">
      {/* Fixed header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <AppHeader
          isAuthenticated={isAuthenticated}
          userEmail={userEmail}
          userName={userName}
          userAvatar={userAvatar}
        />
      </div>

      {/* Main content with padding */}
      <div className="fixed top-16 left-0 right-2 bottom-2 md:right-2 md:bottom-2 lg:right-3 lg:bottom-3">
        <AppShell>
          <AppBody>
            {children}
          </AppBody>
        </AppShell>
      </div>
    </div>
  )
}
