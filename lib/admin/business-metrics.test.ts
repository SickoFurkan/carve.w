import { describe, expect, it } from 'vitest'
import {
  classifySubscription,
  summariseAiCosts,
  summariseSubscriptions,
  summariseMoney,
} from './business-metrics'

const nu = new Date('2026-09-09T12:00:00Z')
const straks = '2026-10-01T00:00:00Z'
const eerder = '2026-08-01T00:00:00Z'

describe('classifySubscription', () => {
  it('noemt een lopende betaalperiode betalend', () => {
    expect(classifySubscription({ current_period_end: straks, will_renew: true }, nu)).toBe(
      'betalend',
    )
  })

  it('noemt een opgezegd maar nog lopend abonnement opzeggend', () => {
    // @ai-why: Dit is het enige onderscheid dat ertoe doet voor de omzet van volgende
    // maand. Iemand die opzegt telt vandaag nog als betalend, en als je die twee op één
    // hoop gooit zie je de terugval pas als hij er al is.
    expect(
      classifySubscription({ current_period_end: straks, will_renew: false }, nu),
    ).toBe('opzeggend')
    expect(
      classifySubscription({ current_period_end: straks, cancelled_at: eerder }, nu),
    ).toBe('opzeggend')
  })

  it('noemt een lopende proefperiode proef', () => {
    expect(classifySubscription({ trial_ends_at: straks }, nu)).toBe('proef')
  })

  it('laat een betaalperiode zwaarder wegen dan een proefperiode', () => {
    // Iemand die tijdens zijn proef koopt heeft beide velden gevuld.
    expect(
      classifySubscription({ trial_ends_at: straks, current_period_end: straks }, nu),
    ).toBe('betalend')
  })

  it('noemt alles wat voorbij is verlopen', () => {
    expect(classifySubscription({ current_period_end: eerder }, nu)).toBe('verlopen')
    expect(classifySubscription({ trial_ends_at: eerder }, nu)).toBe('verlopen')
    expect(classifySubscription({}, nu)).toBe('verlopen')
  })
})

describe('summariseSubscriptions', () => {
  it('telt per soort', () => {
    const uit = summariseSubscriptions(
      [
        { current_period_end: straks, will_renew: true },
        { current_period_end: straks, will_renew: true },
        { current_period_end: straks, will_renew: false },
        { trial_ends_at: straks },
        { current_period_end: eerder },
      ],
      nu,
    )

    expect(uit).toEqual({ betalend: 2, opzeggend: 1, proef: 1, verlopen: 1, totaal: 5 })
  })

  it('overleeft een lege lijst', () => {
    expect(summariseSubscriptions([], nu).totaal).toBe(0)
  })
})

describe('summariseAiCosts', () => {
  const rijen = [
    { model: 'claude-opus-5', cost_eur: 0.42, tokens_in: 100, tokens_out: 50 },
    { model: 'claude-opus-5', cost_eur: 0.08, tokens_in: 20, tokens_out: 10 },
    { model: 'gpt-5', cost_eur: 0.1, tokens_in: 30, tokens_out: 5 },
  ]

  it('telt de kosten op', () => {
    expect(summariseAiCosts(rijen).total).toBe(0.6)
  })

  it('rondt af op centen, want een som van floats geeft anders 0,6000000000000001', () => {
    expect(summariseAiCosts([{ cost_eur: 0.1 }, { cost_eur: 0.2 }]).total).toBe(0.3)
  })

  it('splitst per model, aflopend op kosten', () => {
    const per = summariseAiCosts(rijen).byModel

    expect(per[0]).toEqual({ model: 'claude-opus-5', cost: 0.5, calls: 2 })
    expect(per[1]).toEqual({ model: 'gpt-5', cost: 0.1, calls: 1 })
  })

  it('telt een ontbrekend bedrag als nul in plaats van NaN', () => {
    expect(summariseAiCosts([{ model: 'x', cost_eur: null }]).total).toBe(0)
  })

  it('noemt een rij zonder model onbekend', () => {
    expect(summariseAiCosts([{ cost_eur: 1 }]).byModel[0].model).toBe('onbekend')
  })
})

describe('summariseMoney', () => {
  const rijen = [
    { amount: 100, transaction_date: '2026-09-02', category: 'Software', is_income: false },
    { amount: 50, transaction_date: '2026-09-05', category: 'Software', is_income: false },
    { amount: 900, transaction_date: '2026-09-03', category: 'Omzet', is_income: true },
    { amount: 20, transaction_date: '2026-08-11', category: 'Reizen', is_income: false },
  ]

  it('groepeert per maand, nieuwste eerst', () => {
    const maanden = summariseMoney(rijen).months

    expect(maanden.map((m) => m.month)).toEqual(['2026-09', '2026-08'])
    expect(maanden[0]).toEqual({ month: '2026-09', income: 900, spend: 150, net: 750 })
  })

  it('telt uitgaven en inkomsten apart', () => {
    expect(summariseMoney(rijen).months[1]).toEqual({
      month: '2026-08',
      income: 0,
      spend: 20,
      net: -20,
    })
  })

  it('geeft de categorieën van uitgaven, aflopend', () => {
    const cats = summariseMoney(rijen).categories

    expect(cats[0]).toEqual({ category: 'Software', spend: 150 })
    expect(cats[1]).toEqual({ category: 'Reizen', spend: 20 })
    // Inkomsten horen niet in de uitgaven-verdeling.
    expect(cats.find((c) => c.category === 'Omzet')).toBeUndefined()
  })

  it('behandelt een negatief bedrag als uitgave en niet als negatieve inkomst', () => {
    // @ai-why: Sommige importbronnen zetten uitgaven negatief. De absolute waarde
    // gebruiken voorkomt dat één import de maandtotalen omdraait.
    const uit = summariseMoney([
      { amount: -75, transaction_date: '2026-09-01', category: 'Software', is_income: false },
    ])

    expect(uit.months[0].spend).toBe(75)
  })
})
