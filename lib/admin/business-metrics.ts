/**
 * De kostenkant en de omzetkant: AI-verbruik, abonnementen en de eigen boekhouding.
 *
 * @ai-why: Deze drie zaten in geen enkel scherm terwijl ze alle drie dagelijks groeien.
 * `ai_usage_logs` is de kostenpost die stil kan oplopen (elke coach-aanroep schrijft een
 * rij met `cost_eur`), `user_subscriptions` is de omzet, en `money_transactions` is de
 * eigen boekhouding. Zonder deze cijfers meet de cockpit alleen groei en geen geld.
 *
 * @ai-gotcha: `money_transactions` gaat over Furkans eigen boekhouding en niet over
 * Carve als product. Het staat in dezelfde database omdat het webplatform ooit meerdere
 * domeinen had; het hoort dus in een eigen tab en niet tussen de productcijfers.
 *
 * @ai-sync: docs/tdr/0006-admin-is-de-cockpit.md
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { periodBounds } from './app-metrics'

/** Afronden op centen. Een som van floats geeft anders 0,6000000000000001. */
function centen(bedrag: number): number {
  return Math.round(bedrag * 100) / 100
}

// ─── Abonnementen ──────────────────────────────────────────

export type SubscriptionState = 'betalend' | 'opzeggend' | 'proef' | 'verlopen'

export interface SubscriptionRow {
  current_period_end?: string | null
  trial_ends_at?: string | null
  will_renew?: boolean | null
  cancelled_at?: string | null
}

/**
 * @ai-why: Een lopende betaalperiode weegt zwaarder dan een lopende proef. Wie tijdens
 * zijn proefperiode koopt heeft beide velden gevuld, en die persoon als "proef" tellen
 * maakt van een klant een prospect.
 *
 * @ai-why: "Opzeggend" is een eigen categorie en geen deel van "betalend". Iemand die
 * heeft opgezegd betaalt vandaag nog, maar volgende maand niet. Op één hoop gooien
 * betekent dat je de terugval pas ziet als hij er al is.
 */
export function classifySubscription(row: SubscriptionRow, now: Date): SubscriptionState {
  const periodeLoopt = row.current_period_end ? new Date(row.current_period_end) > now : false

  if (periodeLoopt) {
    return row.will_renew === false || row.cancelled_at ? 'opzeggend' : 'betalend'
  }

  if (row.trial_ends_at && new Date(row.trial_ends_at) > now) return 'proef'

  return 'verlopen'
}

export interface SubscriptionSummary {
  betalend: number
  opzeggend: number
  proef: number
  verlopen: number
  totaal: number
}

export function summariseSubscriptions(
  rows: SubscriptionRow[],
  now: Date = new Date(),
): SubscriptionSummary {
  const som: SubscriptionSummary = {
    betalend: 0,
    opzeggend: 0,
    proef: 0,
    verlopen: 0,
    totaal: rows.length,
  }

  for (const row of rows) som[classifySubscription(row, now)] += 1

  return som
}

// ─── AI-kosten ─────────────────────────────────────────────

export interface AiUsageRow {
  model?: string | null
  cost_eur?: number | string | null
  tokens_in?: number | null
  tokens_out?: number | null
}

export interface AiCostSummary {
  total: number
  calls: number
  byModel: { model: string; cost: number; calls: number }[]
}

export function summariseAiCosts(rows: AiUsageRow[]): AiCostSummary {
  const perModel = new Map<string, { cost: number; calls: number }>()
  let total = 0

  for (const row of rows) {
    // @ai-gotcha: `cost_eur` is numeric in Postgres en komt via PostgREST als string
    // binnen, niet als number. Optellen zonder Number() geeft "0.10.2".
    const kosten = Number(row.cost_eur ?? 0)
    const bedrag = Number.isFinite(kosten) ? kosten : 0
    total += bedrag

    const model = row.model || 'onbekend'
    const huidig = perModel.get(model) ?? { cost: 0, calls: 0 }
    perModel.set(model, { cost: huidig.cost + bedrag, calls: huidig.calls + 1 })
  }

  return {
    total: centen(total),
    calls: rows.length,
    byModel: [...perModel.entries()]
      .map(([model, v]) => ({ model, cost: centen(v.cost), calls: v.calls }))
      .sort((a, b) => b.cost - a.cost),
  }
}

// ─── Eigen boekhouding ─────────────────────────────────────

export interface MoneyRow {
  amount?: number | string | null
  transaction_date?: string | null
  category?: string | null
  is_income?: boolean | null
}

export interface MoneySummary {
  months: { month: string; income: number; spend: number; net: number }[]
  categories: { category: string; spend: number }[]
}

/**
 * @ai-why: De absolute waarde van `amount`. Sommige importbronnen zetten uitgaven
 * negatief en andere positief, met `is_income` als het echte onderscheid. Zonder Math.abs
 * draait één import de maandtotalen om, en dat ziet er plausibel genoeg uit om niet op
 * te vallen.
 */
export function summariseMoney(rows: MoneyRow[]): MoneySummary {
  const maanden = new Map<string, { income: number; spend: number }>()
  const categorieën = new Map<string, number>()

  for (const row of rows) {
    if (!row.transaction_date) continue

    const maand = row.transaction_date.slice(0, 7)
    const bedrag = Math.abs(Number(row.amount ?? 0))
    if (!Number.isFinite(bedrag)) continue

    const huidig = maanden.get(maand) ?? { income: 0, spend: 0 }
    if (row.is_income) huidig.income += bedrag
    else huidig.spend += bedrag
    maanden.set(maand, huidig)

    if (!row.is_income) {
      const cat = row.category || 'Zonder categorie'
      categorieën.set(cat, (categorieën.get(cat) ?? 0) + bedrag)
    }
  }

  return {
    months: [...maanden.entries()]
      .map(([month, v]) => ({
        month,
        income: centen(v.income),
        spend: centen(v.spend),
        net: centen(v.income - v.spend),
      }))
      .sort((a, b) => b.month.localeCompare(a.month)),
    categories: [...categorieën.entries()]
      .map(([category, spend]) => ({ category, spend: centen(spend) }))
      .sort((a, b) => b.spend - a.spend),
  }
}

// ─── Ophalen ───────────────────────────────────────────────

export async function getAiCosts(
  supabase: SupabaseClient,
  days: number,
  options: { previous?: boolean; now?: Date } = {},
): Promise<AiCostSummary> {
  const { from, to } = periodBounds(days, options.now ?? new Date(), {
    previous: options.previous,
  })

  const { data, error } = await supabase
    .from('ai_usage_logs')
    .select('model, cost_eur, tokens_in, tokens_out')
    .gte('created_at', from)
    .lt('created_at', to)

  if (error) throw new Error(`AI-kosten ophalen mislukte: ${error.message}`)

  return summariseAiCosts((data ?? []) as AiUsageRow[])
}

export async function getSubscriptions(
  supabase: SupabaseClient,
  now: Date = new Date(),
): Promise<SubscriptionSummary> {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('current_period_end, trial_ends_at, will_renew, cancelled_at')

  if (error) throw new Error(`Abonnementen ophalen mislukte: ${error.message}`)

  return summariseSubscriptions((data ?? []) as SubscriptionRow[], now)
}
