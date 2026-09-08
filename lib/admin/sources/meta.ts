/**
 * Meta Marketing API: wat de advertenties kosten en opleveren.
 *
 * @ai-why: Alleen het advertentieaccount, niet de pixel-events. De pixel meet
 * `AppStoreClick` en dat cijfer heb je al beter uit GA4, waar hetzelfde event met een
 * `source` per knop binnenkomt. Twee metingen van dezelfde klik naast elkaar zetten
 * levert alleen een verschil op dat je niet kunt verklaren.
 *
 * @ai-sync: lib/meta-pixel.ts
 * @ai-sync: docs/tdr/0006-admin-is-de-cockpit.md
 */

import { missingEnv } from './source'

export const META_ENV = ['META_ACCESS_TOKEN', 'META_AD_ACCOUNT_ID'] as const

// @ai-gotcha: Vastgezette API-versie. Meta zet oude versies na ongeveer twee jaar uit;
// een niet-vastgezette aanroep verandert stilletjes van gedrag bij hun volgende release.
const API_VERSION = 'v21.0'

export interface MetaData {
  /** Uitgaven in euro over het venster. */
  spend: number
  clicks: number
  impressions: number
}

export function metaMissing(): string[] {
  return missingEnv(process.env, [...META_ENV])
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export async function loadMeta(days: number, now: Date = new Date()): Promise<MetaData> {
  const until = isoDate(now)
  const since = isoDate(new Date(now.getTime() - days * 24 * 60 * 60 * 1000))

  // @ai-gotcha: Het account-ID hoort met `act_` ervoor. Mensen plakken het nummer zonder
  // prefix uit de Ads Manager-URL, dus we zetten hem hier neer als hij ontbreekt.
  const rawId = process.env.META_AD_ACCOUNT_ID!.trim()
  const accountId = rawId.startsWith('act_') ? rawId : `act_${rawId}`

  const url = new URL(`https://graph.facebook.com/${API_VERSION}/${accountId}/insights`)
  url.searchParams.set('fields', 'spend,clicks,impressions')
  url.searchParams.set('time_range', JSON.stringify({ since, until }))
  url.searchParams.set('access_token', process.env.META_ACCESS_TOKEN!)

  const res = await fetch(url, { cache: 'no-store' })

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null
    throw new Error(body?.error?.message ?? `Meta gaf ${res.status}.`)
  }

  const json = (await res.json()) as {
    data?: { spend?: string; clicks?: string; impressions?: string }[]
  }

  // @ai-gotcha: Geen advertenties in het venster betekent een lege `data`-array, geen
  // rij met nullen. Dat is geen fout; het is een account dat even stilligt.
  const rij = json.data?.[0]

  return {
    spend: Number(rij?.spend ?? 0),
    clicks: Number(rij?.clicks ?? 0),
    impressions: Number(rij?.impressions ?? 0),
  }
}
