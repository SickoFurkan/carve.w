import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { User } from './types'

/**
 * Get the current session from server-side
 * @returns Session data or null if no active session
 */
export async function getSession() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    console.error('Error getting session:', error)
    return null
  }

  return data.session
}

/**
 * Get the current authenticated user from server-side
 * @returns User data or null if not authenticated
 */
export async function getUser(): Promise<User | null> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    console.error('Error getting user:', error)
    return null
  }

  return user
}

/**
 * Require authentication - redirect to login if not authenticated
 * Use this in Server Components or Server Actions that require auth
 * @param redirectTo - Optional path to redirect to after login
 * @returns User data if authenticated (will redirect if not)
 */
export async function requireAuth(redirectTo?: string): Promise<User> {
  const user = await getUser()

  if (!user) {
    const redirectPath = redirectTo
      ? `/login?redirect=${encodeURIComponent(redirectTo)}`
      : '/login'
    redirect(redirectPath)
  }

  return user
}

/**
 * Check if user is authenticated (non-redirecting version)
 * @returns boolean indicating if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getUser()
  return !!user
}
