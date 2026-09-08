/**
 * Alles wat het overzichtsscherm nodig heeft, in één aanroep.
 *
 * @ai-why: De pagina zelf haalt niets op. Vier bronnen met elk hun eigen falen levert
 * anders een component vol `if (result.ok)`-vertakkingen, en dan verhuist de vraag "wat
 * doen we als Meta stuk is" naar de JSX. Hier is het één plek.
 *
 * @ai-sync: docs/tdr/0006-admin-is-de-cockpit.md
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { buildFunnel, type FunnelStep } from './funnel'
import { getAppMetrics, type AppMetrics } from './app-metrics'
import { fetchSource, type SourceFailure, type SourceResult } from './sources/source'
import { ga4Missing, loadGa4, type Ga4Data } from './sources/ga4'
import { metaMissing, loadMeta, type MetaData } from './sources/meta'
import { appstoreMissing, loadAppStore, type AppStoreData } from './sources/appstore'

export interface Overview {
  days: number
  funnel: FunnelStep[]
  ga4: SourceResult<Ga4Data>
  meta: SourceResult<MetaData>
  appstore: SourceResult<AppStoreData>
  app: SourceResult<AppMetrics>
  appPrevious: SourceResult<AppMetrics>
  /** Alle bronnen die niets gaven, voor de melding onder de trechter. */
  failures: SourceFailure[]
  /** Uitgaven gedeeld door downloads, als beide er zijn. */
  costPerDownload: number | null
  costPerAccount: number | null
}

function waarde<T>(result: SourceResult<T>, pick: (data: T) => number): number | null {
  return result.ok ? pick(result.data) : null
}

export async function getOverview(
  supabase: SupabaseClient,
  days: number,
): Promise<Overview> {
  const [ga4, meta, appstore, app, appPrevious] = await Promise.all([
    fetchSource('ga4', () => loadGa4(days), { missing: ga4Missing() }),
    fetchSource('meta', () => loadMeta(days), { missing: metaMissing() }),
    // @ai-gotcha: Ruimer budget dan de rest. Dertig dagrapporten bij Apple zijn dertig
    // aanroepen; met een koude cache haalt dat de standaard acht seconden niet.
    fetchSource('appstore', (signal) => loadAppStore(days, signal), {
      missing: appstoreMissing(),
      timeoutMs: 20_000,
    }),
    // @ai-why: Supabase gaat door hetzelfde contract als de externe bronnen, hoewel het
    // onze eigen database is. Reden: de kolom `profiles.is_test` komt uit een migratie
    // die nog niet overal gedraaid hoeft te zijn, en dan is een leesbare melding op het
    // scherm beter dan een pagina die valt.
    fetchSource('supabase', () => getAppMetrics(supabase, days)),
    fetchSource('supabase', () => getAppMetrics(supabase, days, { previous: true })),
  ])

  const funnel = buildFunnel({
    visitors: waarde(ga4, (d) => d.visitors),
    appStoreClicks: waarde(ga4, (d) => d.appStoreClicks),
    downloads: waarde(appstore, (d) => d.downloads),
    accounts: waarde(app, (d) => d.accounts),
    firstLogs: waarde(app, (d) => d.firstLogs),
  })

  const spend = waarde(meta, (d) => d.spend)
  const downloads = waarde(appstore, (d) => d.downloads)
  const accounts = waarde(app, (d) => d.accounts)

  return {
    days,
    funnel,
    ga4,
    meta,
    appstore,
    app,
    appPrevious,
    failures: [ga4, meta, appstore, app].flatMap((r) => (r.ok ? [] : [r.failure])),
    // @ai-why: Delen door nul geeft `null`, niet Infinity. Zie de reden in lib/admin/funnel.ts.
    costPerDownload: spend !== null && downloads ? Math.round((spend / downloads) * 100) / 100 : null,
    costPerAccount: spend !== null && accounts ? Math.round((spend / accounts) * 100) / 100 : null,
  }
}
