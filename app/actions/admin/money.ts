'use server'

import { requireAdmin } from '@/lib/admin/auth'
import { summariseMoney, type MoneyRow, type MoneySummary } from '@/lib/admin/business-metrics'

/**
 * De eigen boekhouding voor de Geld-tab.
 *
 * @ai-gotcha: Dit is Furkans eigen administratie en geen productcijfer van Carve. Het
 * staat in dezelfde database omdat het webplatform ooit meerdere domeinen had. Meng deze
 * bedragen dus nooit met de omzet uit `user_subscriptions`: het ene is wat de app
 * oplevert, het andere wat er van zijn rekening af gaat.
 *
 * @ai-why: Alleen de eigen rijen. RLS beperkt `money_transactions` al tot de eigen
 * gebruiker, maar de admin-policies op andere tabellen laten wél alles zien; expliciet
 * op `user_id` filteren zorgt dat dat verschil niet per ongeluk verdwijnt als iemand
 * later een admin-policy toevoegt.
 *
 * @ai-sync: lib/admin/business-metrics.ts
 */

export interface MoneyTransaction {
  id: string
  amount: number
  category: string | null
  description: string | null
  merchant: string | null
  transaction_date: string | null
  is_income: boolean
  is_business: boolean
}

export interface MoneyResult extends MoneySummary {
  recent: MoneyTransaction[]
  count: number
}

export async function fetchMoney(months = 6): Promise<MoneyResult> {
  const { supabase, user } = await requireAdmin()

  const vanaf = new Date()
  vanaf.setMonth(vanaf.getMonth() - months)
  const vanafDatum = vanaf.toISOString().slice(0, 10)

  const { data, error, count } = await supabase
    .from('money_transactions')
    .select(
      'id, amount, category, description, merchant, transaction_date, is_income, is_business',
      { count: 'exact' },
    )
    .eq('user_id', user.id)
    .gte('transaction_date', vanafDatum)
    .order('transaction_date', { ascending: false })

  if (error) throw new Error(`Transacties ophalen mislukte: ${error.message}`)

  const rijen = (data ?? []) as Record<string, unknown>[]

  return {
    ...summariseMoney(rijen as MoneyRow[]),
    count: count ?? rijen.length,
    // @ai-why: De volledige set gaat door de samenvatting, maar er gaan er maar vijftig
    // naar de client. Vijfhonderd transacties door de server-action-grens duwen om er
    // vijftig te tonen is verspilling die je pas merkt als het traag wordt.
    recent: rijen.slice(0, 50).map((row) => ({
      id: String(row.id),
      amount: Number(row.amount ?? 0),
      category: (row.category as string) ?? null,
      description: (row.description as string) ?? null,
      merchant: (row.merchant as string) ?? null,
      transaction_date: (row.transaction_date as string) ?? null,
      is_income: row.is_income === true,
      is_business: row.is_business === true,
    })),
  }
}
