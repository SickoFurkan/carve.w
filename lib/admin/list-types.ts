/**
 * Vormen en constanten die de admin-lijsten delen.
 *
 * @ai-why: Losse module en niet in de server actions zelf. Een bestand met `'use server'`
 * mag alleen async functies exporteren; een `export const PER_PAGE = 25` erin laat de
 * build vallen met een foutmelding die niets over die regel zegt. Types verdwijnen bij
 * het compileren en zouden mogen blijven staan, maar dan staan de vorm en het getal op
 * twee plekken en dat drijft uit elkaar.
 *
 * @ai-sync: app/actions/admin/users-list.ts
 * @ai-sync: app/actions/admin/content-list.ts
 */

export const USERS_PER_PAGE = 25
export const PER_PAGE = 25

export const FEEDBACK_STATUSES = ['new', 'reviewed', 'planned', 'completed'] as const

export interface AdminUserRow {
  id: string
  email: string | null
  display_name: string | null
  username: string | null
  bio: string | null
  role: string | null
  created_at: string | null
  last_active_at: string | null
  is_test: boolean
}

export interface UsersResult {
  users: AdminUserRow[]
  count: number
  page: number
  totalPages: number
  roles: string[]
  /** Zet de UI in de "migratie ontbreekt"-staat in plaats van stilletjes false te tonen. */
  isTestAvailable: boolean
}

export interface UsersQuery {
  q?: string
  role?: string
  page?: number
}

export interface ArticleRow {
  id: string
  title: string | null
  slug: string | null
  category: string | null
  view_count: number | null
  is_published: boolean
  updated_at: string | null
}

export interface ArticlesResult {
  articles: ArticleRow[]
  count: number
  page: number
  totalPages: number
  published: number
  drafts: number
}

export interface FeedbackRow {
  id: string
  title: string | null
  description: string | null
  status: string | null
  vote_count: number | null
  /** Zichtbaar voor gebruikers in de app. */
  is_visible: boolean | null
  created_at: string | null
}

export interface FeedbackResult {
  items: FeedbackRow[]
  count: number
  page: number
  totalPages: number
}
