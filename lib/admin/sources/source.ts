/**
 * Het contract dat elke externe bron op /admin deelt.
 *
 * @ai-why: Eén kapotte API mag het scherm niet meenemen. TDR-0006 beslissing 4: een
 * dashboard dat wit wordt omdat Meta een 500 geeft, wordt niet meer geopend, en dan
 * kijk je nooit meer naar de cijfers die het wél had. Daarom levert elke bron een
 * `SourceResult` op in plaats van te gooien, en rendert het scherm per blok wat er mist.
 *
 * @ai-why: De melding is Nederlands en zegt welke env-variabele ontbreekt. Dit scherm
 * heeft één lezer en die moet het zelf kunnen repareren; "Failed to fetch" kost je
 * daar een kwartier zoeken.
 *
 * @ai-sync: docs/tdr/0006-admin-is-de-cockpit.md
 */

export type SourceName = 'ga4' | 'appstore' | 'meta' | 'supabase'

export interface SourceFailure {
  source: SourceName
  kind: 'unconfigured' | 'timeout' | 'error'
  message: string
  /** Bij `unconfigured`: welke env-variabelen er niet staan. */
  missing?: string[]
}

export type SourceResult<T> = { ok: true; data: T } | { ok: false; failure: SourceFailure }

/**
 * @ai-gotcha: Een lege string telt als ontbrekend. Een env-variabele die wel gezet is
 * maar leeg (het klassieke gevolg van een `.env` met `KEY=` erin) geeft anders een 401
 * bij de bron in plaats van een leesbare melding hier.
 */
export function missingEnv(env: Record<string, string | undefined>, names: string[]): string[] {
  return names.filter((name) => !env[name] || env[name]!.trim() === '')
}

interface FetchOptions {
  /** Ontbrekende env-variabelen. Staat hier iets in, dan wordt `load` niet aangeroepen. */
  missing?: string[]
  /**
   * @ai-why: Standaard acht seconden. De pagina bevraagt vier bronnen parallel en
   * rendert op de server, dus de traagste bron bepaalt hoe lang jij naar niets kijkt.
   * Liever een blok dat "duurde te lang" zegt dan een scherm dat blijft hangen.
   */
  timeoutMs?: number
}

const DEFAULT_TIMEOUT_MS = 8_000

/**
 * @ai-gotcha: `load` krijgt een AbortSignal en moet die aan elke `fetch` doorgeven.
 * Zonder dat stopt de timeout alleen het wachten, niet het verzoek: de serverless
 * function blijft dan draaien voor een antwoord dat niemand meer leest, en op een pagina
 * met dertig Apple-aanroepen is dat het verschil tussen traag en onbetaalbaar.
 */
export async function fetchSource<T>(
  source: SourceName,
  load: (signal: AbortSignal) => Promise<T> | T,
  options: FetchOptions = {},
): Promise<SourceResult<T>> {
  const { missing = [], timeoutMs = DEFAULT_TIMEOUT_MS } = options

  if (missing.length > 0) {
    return {
      ok: false,
      failure: {
        source,
        kind: 'unconfigured',
        message: `Niet gekoppeld. Zet ${missing.join(', ')} in de omgeving.`,
        missing,
      },
    }
  }

  const controller = new AbortController()
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    const verlopen = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        controller.abort()
        reject(new TimeoutError())
      }, timeoutMs)
    })

    // @ai-why: `load` in de race en niet ervoor aangeroepen, zodat een functie die
    // synchroon gooit hier landt en niet buiten de try om ontsnapt.
    const data = await Promise.race([
      Promise.resolve().then(() => load(controller.signal)),
      verlopen,
    ])
    return { ok: true, data }
  } catch (error) {
    if (error instanceof TimeoutError) {
      return {
        ok: false,
        failure: {
          source,
          kind: 'timeout',
          message: `Duurde langer dan ${Math.round(timeoutMs / 1000)} seconden.`,
        },
      }
    }
    return {
      ok: false,
      failure: {
        source,
        kind: 'error',
        message: error instanceof Error ? error.message : String(error),
      },
    }
  } finally {
    if (timer) clearTimeout(timer)
  }
}

class TimeoutError extends Error {
  constructor() {
    super('timeout')
    this.name = 'TimeoutError'
  }
}
