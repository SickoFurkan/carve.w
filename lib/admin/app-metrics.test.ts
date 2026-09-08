import { describe, expect, it } from 'vitest'
import { getAppMetrics, periodBounds, splitAccounts } from './app-metrics'

describe('splitAccounts', () => {
  const rijen = [
    { id: 'a', is_test: false, created_at: '2026-09-01T10:00:00Z' },
    { id: 'b', is_test: true, created_at: '2026-09-02T10:00:00Z' },
    { id: 'c', is_test: null, created_at: '2026-09-03T10:00:00Z' },
  ]

  it('houdt alleen de echte accounts over', () => {
    expect(splitAccounts(rijen).realIds).toEqual(['a', 'c'])
  })

  it('telt een account zonder markering als echt', () => {
    // @ai-why: Nieuwe accounts komen binnen zonder vlag. Die moeten meetellen, anders
    // verdwijnt precies de gebruiker die je wilde zien uit je eigen cijfers.
    expect(splitAccounts(rijen).realIds).toContain('c')
  })

  it('geeft ook het aantal testaccounts terug, zodat het scherm het kan noemen', () => {
    expect(splitAccounts(rijen).testCount).toBe(1)
  })

  it('overleeft een lege lijst', () => {
    expect(splitAccounts([])).toEqual({ realIds: [], testCount: 0 })
  })
})

describe('periodBounds', () => {
  const nu = new Date('2026-09-08T12:00:00.000Z')

  it('geeft een venster van het gevraagde aantal dagen terug', () => {
    const { from, to } = periodBounds(7, nu)

    expect(to).toBe('2026-09-08T12:00:00.000Z')
    expect(from).toBe('2026-09-01T12:00:00.000Z')
  })

  it('geeft het venster ervoor voor de vergelijking, zonder overlap', () => {
    const huidig = periodBounds(7, nu)
    const vorig = periodBounds(7, nu, { previous: true })

    expect(vorig.from).toBe('2026-08-25T12:00:00.000Z')
    expect(vorig.to).toBe(huidig.from)
  })
})

describe('getAppMetrics', () => {
  // Minimale nabootsing van de supabase-client: alleen de eerste profielen-query.
  function fakeClient(antwoord: { data: unknown; error: { message: string } | null }) {
    return {
      from: () => ({ select: () => Promise.resolve(antwoord) }),
    } as unknown as Parameters<typeof getAppMetrics>[0]
  }

  it('gooit als de profielen-query een fout geeft, in plaats van nullen te tonen', async () => {
    // @ai-why: Dit is precies wat er op 2026-09-08 misging. supabase-js gooit niet bij
    // een ontbrekende kolom; het geeft { data: null, error }. Wie die error negeert
    // toont "0 echte accounts" terwijl er veertien profielen staan, en dat ziet er
    // volkomen normaal uit.
    const client = fakeClient({
      data: null,
      error: { message: 'column profiles.is_test does not exist' },
    })

    await expect(getAppMetrics(client, 7)).rejects.toThrow(/is_test/)
  })

  it('noemt de migratie die gedraaid moet worden', async () => {
    const client = fakeClient({
      data: null,
      error: { message: 'column profiles.is_test does not exist' },
    })

    await expect(getAppMetrics(client, 7)).rejects.toThrow(/20260908000001/)
  })

  it('geeft nullen terug als er echt geen profielen zijn, zonder te gooien', async () => {
    const uit = await getAppMetrics(fakeClient({ data: [], error: null }), 7)

    expect(uit.totalRealAccounts).toBe(0)
    expect(uit.testAccounts).toBe(0)
  })
})
