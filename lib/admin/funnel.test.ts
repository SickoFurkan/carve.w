import { describe, expect, it } from 'vitest'
import { buildFunnel, FUNNEL_ORDER } from './funnel'

const compleet = {
  visitors: 1240,
  appStoreClicks: 186,
  downloads: 92,
  accounts: 31,
  firstLogs: 18,
}

describe('buildFunnel', () => {
  it('geeft de vijf stappen in vaste volgorde', () => {
    const stappen = buildFunnel(compleet)

    expect(stappen.map((s) => s.key)).toEqual([...FUNNEL_ORDER])
    expect(stappen).toHaveLength(5)
  })

  it('rekent elke conversie tegen de vorige stap, op één decimaal', () => {
    const stappen = buildFunnel(compleet)

    expect(stappen[1].conversionFromPrevious).toBe(15)
    expect(stappen[2].conversionFromPrevious).toBe(49.5)
    expect(stappen[3].conversionFromPrevious).toBe(33.7)
    expect(stappen[4].conversionFromPrevious).toBe(58.1)
  })

  it('geeft de eerste stap geen conversie, want er is geen vorige', () => {
    expect(buildFunnel(compleet)[0].conversionFromPrevious).toBeNull()
  })

  it('laat een ontbrekende bron alleen zijn eigen twee conversies wegvallen', () => {
    const stappen = buildFunnel({ ...compleet, downloads: null })

    expect(stappen[2].value).toBeNull()
    expect(stappen[2].conversionFromPrevious).toBeNull()
    expect(stappen[3].conversionFromPrevious).toBeNull()
    // De stappen die niet aan het gat grenzen blijven gewoon rekenen.
    expect(stappen[1].conversionFromPrevious).toBe(15)
    expect(stappen[4].conversionFromPrevious).toBe(58.1)
  })

  it('geeft null en geen Infinity als de vorige stap nul is', () => {
    const stappen = buildFunnel({ ...compleet, visitors: 0 })

    expect(stappen[0].value).toBe(0)
    expect(stappen[1].conversionFromPrevious).toBeNull()
  })

  it('markeert een conversie boven de honderd procent als verdacht', () => {
    // Kan echt gebeuren: Apple telt installs die nooit langs de site kwamen.
    const stappen = buildFunnel({ ...compleet, appStoreClicks: 50, downloads: 92 })

    expect(stappen[2].conversionFromPrevious).toBe(184)
    expect(stappen[2].suspect).toBe(true)
    expect(stappen[1].suspect).toBe(false)
  })

  it('noemt per stap waar het getal vandaan komt', () => {
    const bronnen = buildFunnel(compleet).map((s) => s.source)

    expect(bronnen).toEqual(['ga4', 'ga4', 'appstore', 'supabase', 'supabase'])
  })
})
