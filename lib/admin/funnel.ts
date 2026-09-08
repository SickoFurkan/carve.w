/**
 * De trechter van bezoeker tot eerste log, over vier bronnen heen.
 *
 * @ai-why: Dit is het enige cijfer op /admin dat je nergens anders kunt aflezen. GA4
 * kent het bezoek en de klik, App Store Connect de install, Supabase het account en de
 * eerste log. Elk van die vier dashboards stopt bij zijn eigen grens; de vraag "van de
 * mensen die de site zien, hoeveel loggen er uiteindelijk iets" valt precies in de
 * gaten ertussen. Zie docs/tdr/0006-admin-is-de-cockpit.md, beslissing 1.
 *
 * @ai-gotcha: Dit zijn vier metingen naast elkaar, geen gevolgde reis. Niemand koppelt
 * een individuele bezoeker aan een install; Apple geeft alleen dagtotalen. Een conversie
 * hier is dus de verhouding tussen twee onafhankelijke reeksen. Boven de 100% is niet
 * per se een fout (Apple telt ook installs die nooit langs de site kwamen), maar het is
 * wel het signaal dat je de percentages niet als een trechter mag lezen. Vandaar
 * `suspect` in plaats van klemmen op 100.
 *
 * @ai-sync: docs/tdr/0006-admin-is-de-cockpit.md
 */

export const FUNNEL_ORDER = [
  'visitors',
  'appStoreClicks',
  'downloads',
  'accounts',
  'firstLogs',
] as const

export type FunnelKey = (typeof FUNNEL_ORDER)[number]

/** Welke bron dit getal levert. `null` betekent: die bron gaf niets. */
export type FunnelInput = Record<FunnelKey, number | null>

export type FunnelSource = 'ga4' | 'appstore' | 'supabase'

export interface FunnelStep {
  key: FunnelKey
  label: string
  /** Waar dit getal vandaan komt, zodat het scherm de bron kan noemen. */
  source: FunnelSource
  value: number | null
  /** Percentage van de vorige stap, op één decimaal. `null` als het niet te rekenen is. */
  conversionFromPrevious: number | null
  /** Meer dan 100%: de twee reeksen meten niet dezelfde mensen. */
  suspect: boolean
}

const META: Record<FunnelKey, { label: string; source: FunnelSource }> = {
  visitors: { label: 'Bezoekers', source: 'ga4' },
  appStoreClicks: { label: 'Klik naar App Store', source: 'ga4' },
  downloads: { label: 'Downloads', source: 'appstore' },
  accounts: { label: 'Account aangemaakt', source: 'supabase' },
  firstLogs: { label: 'Eerste maaltijd gelogd', source: 'supabase' },
}

/**
 * @ai-why: Deling door nul geeft `null` en niet 0 of Infinity. Nul bezoekers betekent
 * "niet te zeggen", niet "0% converteert", en een Infinity die als "∞%" op het scherm
 * belandt is de soort fout die je pas ziet als je hem uitlegt aan iemand anders.
 */
function conversion(value: number | null, previous: number | null): number | null {
  if (value === null || previous === null || previous === 0) return null
  return Math.round((value / previous) * 1000) / 10
}

export function buildFunnel(input: FunnelInput): FunnelStep[] {
  return FUNNEL_ORDER.map((key, i) => {
    const value = input[key]
    const previous = i === 0 ? null : input[FUNNEL_ORDER[i - 1]]
    const pct = i === 0 ? null : conversion(value, previous)

    return {
      key,
      label: META[key].label,
      source: META[key].source,
      value,
      conversionFromPrevious: pct,
      suspect: pct !== null && pct > 100,
    }
  })
}
