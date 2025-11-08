import { createClient } from '@/lib/supabase/server'
import type { Profile, UpdateProfileData } from './types'

/**
 * Get the profile for the current authenticated user
 * @returns Profile data or null if not found
 */
export async function getProfile(): Promise<Profile | null> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return null
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getProfile:', error)
    return null
  }
}

/**
 * Get a profile by user ID
 * @param userId - The user ID to fetch profile for
 * @returns Profile data or null if not found
 */
export async function getProfileById(userId: string): Promise<Profile | null> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile by ID:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getProfileById:', error)
    return null
  }
}

/**
 * Update the profile for the current authenticated user
 * @param updates - The profile fields to update
 * @returns Updated profile data or null if update failed
 */
export async function updateProfile(
  updates: UpdateProfileData
): Promise<Profile | null> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('No authenticated user')
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in updateProfile:', error)
    return null
  }
}
