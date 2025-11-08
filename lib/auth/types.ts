import { User as SupabaseUser } from '@supabase/supabase-js'

export type User = SupabaseUser

export type UserRole = 'admin' | 'dedicated' | 'member' | 'free'

export type Profile = {
  id: string
  role: UserRole
  profile_data: Record<string, any> | null
  created_at: string
  member_until: string | null
  dedicated_since: string | null
  email: string | null
  username: string | null
  display_name: string | null
  auth_provider: string[] | null
  phone_number: string | null
  email_verified: boolean | null
  phone_verified: boolean | null
  first_name: string | null
  last_name: string | null
  date_of_birth: string | null
  gender: string | null
  country_code: string | null
  timezone: string | null
  preferred_language: string | null
  height_cm: number | null
  weight_kg: number | null
  body_fat_percentage: number | null
  fitness_level: string | null
  primary_fitness_goal: string | null
  activity_level: string | null
  subscription_plan_id: string | null
  user_role_id: string | null
  subscription_start_date: string | null
  subscription_end_date: string | null
  subscription_status: string | null
  daily_calorie_goal: number | null
  daily_protein_goal: number | null
  daily_carb_goal: number | null
  daily_fat_goal: number | null
  weekly_workout_goal: number | null
  avatar_type: string | null
  avatar_image_url: string | null
  profile_visibility: string | null
  allow_friend_requests: boolean | null
  push_notifications_enabled: boolean | null
  email_notifications_enabled: boolean | null
  workout_reminders: boolean | null
  social_notifications: boolean | null
  achievement_notifications: boolean | null
  data_sharing_analytics: boolean | null
  data_sharing_research: boolean | null
  is_active: boolean | null
  is_banned: boolean | null
  ban_reason: string | null
  updated_at: string | null
  last_active_at: string | null
  onboarding_completed_at: string | null
  goals: string[] | null
}

export type AuthState = {
  user: User | null
  profile: Profile | null
  loading: boolean
  error: Error | null
}

export type SignUpData = {
  email: string
  password: string
}

export type SignInData = {
  email: string
  password: string
  remember?: boolean
}

export type UpdateProfileData = Partial<
  Pick<
    Profile,
    | 'username'
    | 'display_name'
    | 'first_name'
    | 'last_name'
    | 'date_of_birth'
    | 'gender'
    | 'height_cm'
    | 'weight_kg'
    | 'body_fat_percentage'
    | 'fitness_level'
    | 'primary_fitness_goal'
    | 'activity_level'
    | 'daily_calorie_goal'
    | 'daily_protein_goal'
    | 'daily_carb_goal'
    | 'daily_fat_goal'
    | 'weekly_workout_goal'
    | 'avatar_image_url'
    | 'profile_visibility'
    | 'allow_friend_requests'
    | 'push_notifications_enabled'
    | 'email_notifications_enabled'
    | 'workout_reminders'
    | 'social_notifications'
    | 'achievement_notifications'
    | 'goals'
  >
>
