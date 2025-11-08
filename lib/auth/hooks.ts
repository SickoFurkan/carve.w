'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User, Profile, AuthState } from './types'

/**
 * Hook to get current auth state (user + loading)
 * Use this in Client Components to get authentication state
 */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    const supabase = createClient()

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setState({ user: null, profile: null, loading: false, error })
        return
      }

      setState({
        user: session?.user ?? null,
        profile: null,
        loading: false,
        error: null,
      })
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        user: session?.user ?? null,
        profile: null,
        loading: false,
        error: null,
      })
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return state
}

/**
 * Hook to get current user
 * Simpler version of useAuth that only returns user
 */
export function useUser(): User | null {
  const { user } = useAuth()
  return user
}

/**
 * Hook to get user profile
 * Fetches the full profile from the database
 */
export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    const fetchProfile = async () => {
      const supabase = createClient()
      setLoading(true)

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        setError(error)
        setProfile(null)
      } else {
        setProfile(data)
        setError(null)
      }

      setLoading(false)
    }

    fetchProfile()
  }, [user])

  return { profile, loading, error }
}

/**
 * Hook to handle sign out
 * Returns a function to sign out the user
 */
export function useSignOut() {
  const router = useRouter()

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return signOut
}
