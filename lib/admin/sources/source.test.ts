import { describe, expect, it } from 'vitest'
import { fetchSource, missingEnv } from './source'

describe('missingEnv', () => {
  it('geeft de namen terug die leeg of afwezig zijn', () => {
    const env = { AANWEZIG: 'x', LEEG: '', SPATIES: '   ' }

    expect(missingEnv(env, ['AANWEZIG', 'LEEG', 'SPATIES', 'WEG'])).toEqual([
      'LEEG',
      'SPATIES',
      'WEG',
    ])
  })

  it('geeft een lege lijst als alles er staat', () => {
    expect(missingEnv({ A: '1', B: '2' }, ['A', 'B'])).toEqual([])
  })
})

describe('fetchSource', () => {
  it('geeft de data terug als het goed gaat', async () => {
    const uitkomst = await fetchSource('ga4', () => Promise.resolve(42))

    expect(uitkomst).toEqual({ ok: true, data: 42 })
  })

  it('vangt een gooiende bron in plaats van de pagina mee te slepen', async () => {
    const uitkomst = await fetchSource('meta', () => {
      throw new Error('401 Unauthorized')
    })

    expect(uitkomst.ok).toBe(false)
    if (uitkomst.ok) throw new Error('had moeten falen')
    expect(uitkomst.failure.kind).toBe('error')
    expect(uitkomst.failure.message).toContain('401 Unauthorized')
    expect(uitkomst.failure.source).toBe('meta')
  })

  it('vangt ook een afgewezen promise', async () => {
    const uitkomst = await fetchSource('appstore', () => Promise.reject(new Error('kapot')))

    expect(uitkomst.ok).toBe(false)
  })

  it('geeft een timeout in plaats van eindeloos te wachten', async () => {
    const uitkomst = await fetchSource('appstore', () => new Promise(() => {}), { timeoutMs: 10 })

    expect(uitkomst.ok).toBe(false)
    if (uitkomst.ok) throw new Error('had moeten falen')
    expect(uitkomst.failure.kind).toBe('timeout')
  })

  it('breekt het verzoek af bij een timeout in plaats van het te laten doorlopen', async () => {
    // @ai-why: Zonder abort blijft een hangende Apple-aanroep de function bezig houden
    // nadat het scherm allang "duurde te lang" toont. Bij dertig aanroepen per paginaload
    // is dat het verschil tussen traag en onbetaalbaar.
    let signal: AbortSignal | undefined
    await fetchSource(
      'appstore',
      (s) => {
        signal = s
        return new Promise(() => {})
      },
      { timeoutMs: 10 },
    )

    expect(signal?.aborted).toBe(true)
  })

  it('geeft een signaal mee dat niet afgebroken is als het goed gaat', async () => {
    let signal: AbortSignal | undefined
    await fetchSource('ga4', (s) => {
      signal = s
      return 1
    })

    expect(signal?.aborted).toBe(false)
  })

  it('meldt ontbrekende configuratie zonder de bron aan te roepen', async () => {
    let aangeroepen = false
    const uitkomst = await fetchSource(
      'appstore',
      () => {
        aangeroepen = true
        return Promise.resolve(1)
      },
      { missing: ['APPSTORE_KEY_ID'] },
    )

    expect(aangeroepen).toBe(false)
    expect(uitkomst.ok).toBe(false)
    if (uitkomst.ok) throw new Error('had moeten falen')
    expect(uitkomst.failure.kind).toBe('unconfigured')
    expect(uitkomst.failure.missing).toEqual(['APPSTORE_KEY_ID'])
    // De melding moet zeggen wát er ontbreekt, anders zoek je het zelf uit.
    expect(uitkomst.failure.message).toContain('APPSTORE_KEY_ID')
  })
})
