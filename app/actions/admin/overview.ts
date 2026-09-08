'use server'

import { requireAdmin } from '@/lib/admin/auth'
import { getOverview, type Overview } from '@/lib/admin/overview'

/**
 * Het overzicht voor de Admin-modus in de chat.
 *
 * @ai-why: Deze action is de échte poort, niet het verborgen sidebar-item. Dat item
 * weglaten voor een niet-admin is cosmetica: een server action is een endpoint dat
 * iedereen die de naam kent kan aanroepen. `requireAdmin()` gooit hier, en dat is wat
 * de cijfers beschermt.
 *
 * @ai-why: Dezelfde `getOverview` als de route `/admin`. Twee ingangen naar één
 * implementatie; zodra dit een tweede kopie wordt, lopen de twee schermen uiteen en
 * weet je niet meer welke klopt.
 *
 * @ai-sync: app/(protected)/admin/page.tsx
 * @ai-sync: docs/tdr/0006-admin-is-de-cockpit.md
 */
export async function fetchOverview(days: number): Promise<Overview> {
  const { supabase } = await requireAdmin()
  return getOverview(supabase, days)
}
