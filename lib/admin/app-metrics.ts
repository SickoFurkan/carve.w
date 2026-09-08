/**
 * De cijfers uit onze eigen database: accounts, activiteit en de eerste log.
 *
 * @ai-why: Los van `lib/admin/queries.ts` en niet erin. Die file bedient de oude
 * beheerpagina's (gebruikerslijst, inhoud, feedback) en meet het web-platform dat sinds
 * TDR-0005 uit staat. Deze meet de iOS-app, die dezelfde Supabase deelt. Ze door elkaar
 * halen zou betekenen dat elke aanroep moet weten welk van de twee producten hij telt.
 *
 * @ai-gotcha: Élke telling hier sluit testaccounts uit. Zeven van de veertien profielen
 * zijn testaccounts van de bouwer, dus zonder die filter is elk getal op dit scherm meer
 * dan een factor twee te hoog. Dat is geen afrondingsfout maar een verkeerde conclusie:
 * je ziet groei die er niet is. Zie TDR-0006 beslissing 5.
 *
 * @ai-sync: docs/tdr/0006-admin-is-de-cockpit.md
 * @ai-sync: supabase/migrations/20260908000001_add_is_test_to_profiles.sql
 */

import type { SupabaseClient } from '@supabase/supabase-js'

export interface AccountRow {
  id: string
  is_test: boolean | null
  created_at: string
}

export interface AccountSplit {
  realIds: string[]
  testCount: number
}

/**
 * @ai-why: `is_test === true` en niet `!is_test`. Een profiel zonder waarde (of een
 * kolom die nog niet gemigreerd is) telt als echt. Andersom zou een nieuwe gebruiker
 * stilletjes uit je cijfers vallen, en dat is precies de gebruiker waar je op wacht.
 */
export function splitAccounts(rows: AccountRow[]): AccountSplit {
  const realIds: string[] = []
  let testCount = 0

  for (const row of rows) {
    if (row.is_test === true) testCount += 1
    else realIds.push(row.id)
  }

  return { realIds, testCount }
}

export interface PeriodBounds {
  from: string
  to: string
}

/**
 * Het venster van `days` dagen terug tot nu, of het even lange venster daarvóór.
 *
 * @ai-why: De vorige periode eindigt exact waar de huidige begint. Een dag overlap
 * telt dezelfde gebeurtenis aan beide kanten mee en maakt elk groeipercentage net
 * verkeerd, op een manier die je nooit opvalt omdat het antwoord plausibel blijft.
 */
export function periodBounds(
  days: number,
  now: Date = new Date(),
  options: { previous?: boolean } = {},
): PeriodBounds {
  const ms = days * 24 * 60 * 60 * 1000
  const end = options.previous ? now.getTime() - ms : now.getTime()

  return {
    from: new Date(end - ms).toISOString(),
    to: new Date(end).toISOString(),
  }
}

export interface AppMetrics {
  /** Accounts die in het venster zijn aangemaakt, testaccounts niet meegerekend. */
  accounts: number
  /** Daarvan: hoeveel er minstens één maaltijd hebben gelogd. */
  firstLogs: number
  /** Echte accounts met activiteit in het venster. */
  activeUsers: number
  /** Gelogde maaltijden in het venster. */
  meals: number
  /** Afgeronde workouts in het venster. */
  workouts: number
  /** Hoeveel profielen als testaccount gemarkeerd staan. */
  testAccounts: number
  /** Alle echte accounts, ongeacht venster. */
  totalRealAccounts: number
}

/**
 * @ai-why: Eerst alle profielen ophalen en daarna filteren op `user_id in (...)`, in
 * plaats van een join of een view. Bij veertien profielen is dat één kleine query en
 * blijft alles leesbaar zonder migratie.
 *
 * @ai-gotcha: Dit schaalt tot ongeveer duizend accounts. Daarboven wordt de `in`-lijst
 * te lang voor een URL en hoort hier een view of een `is_test`-kolom op de logtabellen
 * zelf te komen. Bij die grens is dit bestand de plek om te veranderen, niet de
 * aanroepers.
 */
export async function getAppMetrics(
  supabase: SupabaseClient,
  days: number,
  options: { previous?: boolean; now?: Date } = {},
): Promise<AppMetrics> {
  const { from, to } = periodBounds(days, options.now ?? new Date(), {
    previous: options.previous,
  })

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, is_test, created_at')

  // @ai-why: De fout expliciet doorgooien in plaats van `data ?? []` te gebruiken.
  // supabase-js gooit niet: bij een ontbrekende kolom komt er `{ data: null, error }`
  // terug, en dan toonde dit scherm rustig nul echte accounts terwijl er veertien
  // profielen staan. Een verkeerd cijfer dat er goed uitziet is erger dan een lege kaart,
  // want je gaat er beslissingen op nemen. `fetchSource` maakt hier een leesbaar blok van.
  // @ai-sync: lib/admin/sources/source.ts
  if (error) {
    throw new Error(
      error.message.includes('is_test')
        ? `De kolom profiles.is_test bestaat nog niet. Draai supabase/migrations/20260908000001_add_is_test_to_profiles.sql. (${error.message})`
        : `Profielen ophalen mislukte: ${error.message}`,
    )
  }

  const { realIds, testCount } = splitAccounts((profiles ?? []) as AccountRow[])

  if (realIds.length === 0) {
    return {
      accounts: 0,
      firstLogs: 0,
      activeUsers: 0,
      meals: 0,
      workouts: 0,
      testAccounts: testCount,
      totalRealAccounts: 0,
    }
  }

  const [{ count: accounts }, mealsInPeriod, { count: workouts }, { count: activeUsers }] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .in('id', realIds)
        .gte('created_at', from)
        .lt('created_at', to),
      supabase
        .from('meals')
        .select('user_id')
        .in('user_id', realIds)
        .gte('created_at', from)
        .lt('created_at', to),
      supabase
        .from('completed_workouts')
        .select('*', { count: 'exact', head: true })
        .in('user_id', realIds)
        .gte('created_at', from)
        .lt('created_at', to),
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .in('id', realIds)
        .gte('last_active_at', from),
    ])

  const mealRows = (mealsInPeriod.data ?? []) as { user_id: string }[]

  return {
    accounts: accounts ?? 0,
    // @ai-why: Unieke gebruikers, niet het aantal maaltijden. De trechter vraagt
    // "hoeveel mensen loggen iets", en één iemand die tien keer logt is één mens.
    firstLogs: new Set(mealRows.map((row) => row.user_id)).size,
    activeUsers: activeUsers ?? 0,
    meals: mealRows.length,
    workouts: workouts ?? 0,
    testAccounts: testCount,
    totalRealAccounts: realIds.length,
  }
}
