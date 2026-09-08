/**
 * GA4: bezoekers en de doorklik naar de App Store.
 *
 * @ai-why: De REST-kant van de Data API met een zelf ondertekende service-account-JWT,
 * niet `@google-analytics/data`. Die SDK trekt gRPC en protobuf mee voor twee
 * rapportaanroepen. Zie lib/admin/sources/jwt.ts voor het ondertekenen.
 *
 * @ai-sync: lib/analytics.ts — de eventnaam `app_store_click` staat aan beide kanten
 * @ai-sync: docs/tdr/0006-admin-is-de-cockpit.md
 */

import { signRS256 } from './jwt'
import { missingEnv } from './source'

export const GA4_ENV = ['GA4_PROPERTY_ID', 'GA4_CLIENT_EMAIL', 'GA4_PRIVATE_KEY'] as const

/** De naam die `track('app_store_click')` in GA4 wegschrijft. */
const APP_STORE_EVENT = 'app_store_click'

export interface Ga4Data {
  visitors: number
  appStoreClicks: number
}

export function ga4Missing(): string[] {
  return missingEnv(process.env, [...GA4_ENV])
}

async function accessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const assertion = signRS256(
    { alg: 'RS256', typ: 'JWT' },
    {
      iss: process.env.GA4_CLIENT_EMAIL,
      scope: 'https://www.googleapis.com/auth/analytics.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    },
    process.env.GA4_PRIVATE_KEY!,
  )

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  })

  if (!res.ok) {
    // @ai-why: De fouttekst van Google meenemen. "invalid_grant" betekent bijna altijd
    // dat de service-account geen leesrechten op de property heeft, en dat wil je op het
    // scherm zien in plaats van een kale 400.
    throw new Error(`Google gaf geen token (${res.status}): ${await res.text()}`)
  }

  const json = (await res.json()) as { access_token?: string }
  if (!json.access_token) throw new Error('Google gaf een antwoord zonder access_token.')
  return json.access_token
}

async function runReport(token: string, body: unknown): Promise<number> {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${process.env.GA4_PROPERTY_ID}:runReport`,
    {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    },
  )

  if (!res.ok) throw new Error(`GA4 gaf ${res.status}: ${await res.text()}`)

  const json = (await res.json()) as { rows?: { metricValues?: { value?: string }[] }[] }
  // @ai-gotcha: Zonder dimensies geeft GA4 één rij terug, en géén rij als er nul verkeer
  // was. Dat laatste is geen fout maar een nul.
  const waarde = json.rows?.[0]?.metricValues?.[0]?.value
  return waarde ? Number(waarde) : 0
}

export async function loadGa4(days: number): Promise<Ga4Data> {
  const token = await accessToken()
  const dateRanges = [{ startDate: `${days}daysAgo`, endDate: 'today' }]

  const [visitors, appStoreClicks] = await Promise.all([
    runReport(token, { dateRanges, metrics: [{ name: 'activeUsers' }] }),
    runReport(token, {
      dateRanges,
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: {
        filter: {
          fieldName: 'eventName',
          stringFilter: { matchType: 'EXACT', value: APP_STORE_EVENT },
        },
      },
    }),
  ])

  return { visitors, appStoreClicks }
}
