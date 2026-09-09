'use server'

import { requireAdmin } from '@/lib/admin/auth'
import { USERS_PER_PAGE, type AdminUserRow, type UsersQuery, type UsersResult } from '@/lib/admin/list-types'

/**
 * De gebruikerslijst voor de Admin-modus in de chat.
 *
 * @ai-why: Rollen worden uit de database gelezen en niet uit een tabel met UUID's in
 * code. `app/(protected)/admin/users/page.tsx` deed dat wel, met dezelfde verouderde
 * admin-UUID die op 2026-09-08 de rolcontrole brak. Eén verkeerde UUID daar betekent een
 * filter die stil niets teruggeeft.
 *
 * @ai-sync: lib/admin/auth.ts
 * @ai-sync: components/admin/chat/AdminUsersPane.tsx
 */

export async function fetchUsers(query: UsersQuery = {}): Promise<UsersResult> {
  const { supabase } = await requireAdmin()

  const page = Math.max(1, query.page ?? 1)
  const from = (page - 1) * USERS_PER_PAGE
  const to = from + USERS_PER_PAGE - 1

  const { data: roleRows } = await supabase.from('user_roles').select('id, name')
  const roles = (roleRows ?? []) as { id: string; name: string }[]

  // @ai-why: Eerst mét is_test proberen. Bestaat de kolom nog niet, dan geeft PostgREST
  // een fout in plaats van te gooien, en vallen we terug op dezelfde query zonder die
  // kolom. Zo blijft de lijst bruikbaar vóór de migratie, terwijl de UI wel kan zeggen
  // dat het aanvinken nog niet kan.
  // @ai-sync: supabase/migrations/20260908000001_add_is_test_to_profiles.sql
  const velden =
    'id, email, display_name, username, bio, created_at, last_active_at, user_roles(name)'

  async function haal(metIsTest: boolean) {
    let q = supabase
      .from('profiles')
      .select(metIsTest ? `${velden}, is_test` : velden, { count: 'exact' })
      .range(from, to)
      .order('created_at', { ascending: false })

    if (query.q) {
      const term = query.q.replace(/[%,()]/g, '')
      q = q.or(`email.ilike.%${term}%,username.ilike.%${term}%,display_name.ilike.%${term}%`)
    }

    if (query.role && query.role !== 'all') {
      const rol = roles.find((r) => r.name === query.role)
      // @ai-gotcha: Een onbekende rolnaam mag niet stilzwijgend alle gebruikers teruggeven.
      // Dan lijkt het filter te werken terwijl het niets doet.
      if (!rol) return { data: [], count: 0, error: null }
      q = q.eq('user_role_id', rol.id)
    }

    return q
  }

  let resultaat = await haal(true)
  let isTestAvailable = true

  if (resultaat.error) {
    isTestAvailable = false
    resultaat = await haal(false)
    if (resultaat.error) throw new Error(`Gebruikers ophalen mislukte: ${resultaat.error.message}`)
  }

  const rows = (resultaat.data ?? []) as Record<string, unknown>[]
  const count = resultaat.count ?? 0

  return {
    users: rows.map((row) => {
      const rolRelatie = row.user_roles as { name?: string } | { name?: string }[] | undefined
      const role = Array.isArray(rolRelatie) ? (rolRelatie[0]?.name ?? null) : (rolRelatie?.name ?? null)

      return {
        id: String(row.id),
        email: (row.email as string) ?? null,
        display_name: (row.display_name as string) ?? null,
        username: (row.username as string) ?? null,
        bio: (row.bio as string) ?? null,
        role,
        created_at: (row.created_at as string) ?? null,
        last_active_at: (row.last_active_at as string) ?? null,
        is_test: row.is_test === true,
      }
    }),
    count,
    page,
    totalPages: Math.max(1, Math.ceil(count / USERS_PER_PAGE)),
    roles: roles.map((r) => r.name),
    isTestAvailable,
  }
}

/**
 * Markeert een profiel als testaccount, of haalt die markering weg.
 *
 * @ai-why: Dit is de handeling waar alle cijfers op het overzicht van afhangen. Zeven van
 * de veertien profielen zijn testaccounts; zolang die niet aangevinkt staan, is elk
 * getal op dat scherm ruim een factor twee te hoog.
 *
 * @ai-sync: lib/admin/app-metrics.ts
 */
export async function setUserIsTest(userId: string, isTest: boolean): Promise<void> {
  const { supabase } = await requireAdmin()

  const { error } = await supabase.from('profiles').update({ is_test: isTest }).eq('id', userId)

  if (error) {
    throw new Error(
      error.message.includes('is_test')
        ? 'De kolom profiles.is_test bestaat nog niet. Draai supabase/migrations/20260908000001_add_is_test_to_profiles.sql.'
        : `Opslaan mislukte: ${error.message}`,
    )
  }
}

/**
 * Werkt naam, gebruikersnaam en bio bij.
 *
 * @ai-sync: components/admin/chat/AdminUsersPane.tsx
 */
export async function updateUserDetails(
  userId: string,
  data: { display_name?: string; username?: string; bio?: string },
): Promise<void> {
  const { supabase } = await requireAdmin()

  const { error } = await supabase
    .from('profiles')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) throw new Error(`Opslaan mislukte: ${error.message}`)
}

/**
 * Zet de rol van een gebruiker, of haalt hem weg.
 *
 * @ai-why: De rol-id komt uit `user_roles` en niet uit een tabel met UUID's in code.
 * De oude `app/actions/admin/users.ts` had er drie hardgecodeerd, waaronder een
 * admin-UUID die niet meer bestaat. Iemand admin maken zette daar dus een rol-id dat
 * nergens naar wijst: geen foutmelding, en die persoon kon er alsnog niet in.
 *
 * @ai-gotcha: Jezelf je eigen adminrol afnemen wordt geweigerd. Er is één adminaccount;
 * lukt dat wel, dan kan niemand meer bij /admin en is er geen weg terug via de UI.
 *
 * @ai-sync: lib/admin/auth.ts
 */
export async function changeUserRole(userId: string, roleName: string | null): Promise<void> {
  const { supabase, user } = await requireAdmin()

  if (user.id === userId && roleName !== 'admin') {
    throw new Error('Je kunt je eigen adminrol niet afnemen.')
  }

  let roleId: string | null = null
  if (roleName) {
    const { data: rol } = await supabase
      .from('user_roles')
      .select('id')
      .eq('name', roleName)
      .single()

    if (!rol) throw new Error(`De rol "${roleName}" bestaat niet in user_roles.`)
    roleId = rol.id
  }

  const { error } = await supabase
    .from('profiles')
    .update({ user_role_id: roleId, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) throw new Error(`Rol wijzigen mislukte: ${error.message}`)
}
