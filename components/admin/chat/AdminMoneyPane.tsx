'use client'

import { useEffect, useState } from 'react'
import { fetchMoney, type MoneyResult } from '@/app/actions/admin/money'

const PERIODES = [3, 6, 12] as const

function euro(bedrag: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(bedrag)
}

function maandnaam(maand: string): string {
  const [jaar, m] = maand.split('-')
  return new Date(Number(jaar), Number(m) - 1).toLocaleDateString('nl-NL', {
    month: 'long',
    year: 'numeric',
  })
}

function dag(datum: string | null): string {
  if (!datum) return '—'
  return new Date(datum).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
}

/**
 * De eigen boekhouding in het chatvenster.
 *
 * @ai-why: Eén scherm in plaats van de zeven pagina's die `/money` had (transacties,
 * insights, budgetting, analytics, subscriptions, settings). Wat je dagelijks wilt weten
 * is: hoeveel ging eruit, hoeveel kwam erin, en waaraan. De rest was navigatie om
 * navigatie.
 *
 * @ai-gotcha: Deze bedragen zijn Furkans eigen administratie, niet de omzet van Carve.
 * Die staat op het Overzicht onder Abonnementen.
 *
 * @ai-sync: app/actions/admin/money.ts
 */
export function AdminMoneyPane() {
  const [months, setMonths] = useState<(typeof PERIODES)[number]>(6)
  const [data, setData] = useState<MoneyResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let afgebroken = false
    setLoading(true)
    setError(null)

    fetchMoney(months)
      .then((d) => !afgebroken && setData(d))
      .catch((e: unknown) => !afgebroken && setError(e instanceof Error ? e.message : String(e)))
      .finally(() => !afgebroken && setLoading(false))

    return () => {
      afgebroken = true
    }
  }, [months])

  const grootste = data?.categories[0]?.spend ?? 1

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl space-y-5 p-6 lg:p-8">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Geld</h1>
            <p className="mt-1 text-[13px] text-white/45">
              {data ? `${data.count} transacties` : 'Bezig met laden'}. Je eigen boekhouding,
              niet de omzet van Carve.
            </p>
          </div>

          <div className="flex rounded-lg border border-white/[0.06] bg-white/[0.02] p-0.5">
            {PERIODES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMonths(m)}
                className={`rounded-md px-3 py-1 text-[12.5px] transition-colors ${
                  m === months ? 'bg-white/[0.07] text-white' : 'text-white/40 hover:text-white/70'
                }`}
              >
                {m} mnd
              </button>
            ))}
          </div>
        </header>

        {error && (
          <div className="rounded-xl border border-[#FF3B30]/30 bg-[#FF3B30]/[0.07] p-4">
            <p className="text-[13px] text-[#FF3B30]">{error}</p>
          </div>
        )}

        <div className={loading ? 'space-y-5 opacity-50 transition-opacity' : 'space-y-5 transition-opacity'}>
          {data && data.months.length > 0 && (
            <section className="overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <table className="w-full min-w-[420px] text-left">
                <thead>
                  <tr className="border-b border-white/[0.06] text-[10.5px] uppercase tracking-[0.1em] text-white/30">
                    <th className="px-4 py-2.5 font-medium">Maand</th>
                    <th className="px-4 py-2.5 text-right font-medium">Erin</th>
                    <th className="px-4 py-2.5 text-right font-medium">Eruit</th>
                    <th className="px-4 py-2.5 text-right font-medium">Netto</th>
                  </tr>
                </thead>
                <tbody>
                  {data.months.map((m) => (
                    <tr key={m.month} className="border-b border-white/[0.04] last:border-0">
                      <td className="px-4 py-2.5 text-[13px] capitalize text-white">
                        {maandnaam(m.month)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-[12.5px] tabular-nums text-[#34C759]">
                        {m.income ? euro(m.income) : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-right text-[12.5px] tabular-nums text-white/60">
                        {m.spend ? euro(m.spend) : '—'}
                      </td>
                      <td
                        className={`px-4 py-2.5 text-right text-[12.5px] tabular-nums ${
                          m.net >= 0 ? 'text-white' : 'text-[#FF9500]'
                        }`}
                      >
                        {euro(m.net)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {data && data.categories.length > 0 && (
            <section className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h2 className="text-[13px] font-medium text-white/70">Waar het heen ging</h2>
              <ul className="mt-3 space-y-2">
                {data.categories.slice(0, 8).map((c) => (
                  <li key={c.category}>
                    <div className="flex items-baseline justify-between gap-3 text-[12.5px]">
                      <span className="truncate text-white/60">{c.category}</span>
                      <span className="shrink-0 tabular-nums text-white/80">{euro(c.spend)}</span>
                    </div>
                    {/* @ai-why: Balk ten opzichte van de grootste categorie, niet van het
                        totaal. Bij twintig categorieën is elk aandeel van het totaal een
                        streepje van niks en zie je geen verschil meer. */}
                    <div className="mt-1 h-1 rounded-full bg-white/[0.05]">
                      <div
                        className="h-1 rounded-full bg-[#3B82F6]/60"
                        style={{ width: `${Math.max(2, (c.spend / grootste) * 100)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {data && data.recent.length > 0 && (
            <section className="overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <table className="w-full min-w-[520px] text-left">
                <thead>
                  <tr className="border-b border-white/[0.06] text-[10.5px] uppercase tracking-[0.1em] text-white/30">
                    <th className="px-4 py-2.5 font-medium">Datum</th>
                    <th className="px-4 py-2.5 font-medium">Omschrijving</th>
                    <th className="px-4 py-2.5 font-medium">Categorie</th>
                    <th className="px-4 py-2.5 text-right font-medium">Bedrag</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]"
                    >
                      <td className="whitespace-nowrap px-4 py-2 text-[12.5px] tabular-nums text-white/45">
                        {dag(t.transaction_date)}
                      </td>
                      <td className="px-4 py-2 text-[12.5px] text-white/80">
                        {t.merchant || t.description || '—'}
                        {t.is_business && (
                          <span className="ml-2 rounded border border-white/[0.08] px-1.5 py-0.5 text-[10px] text-white/35">
                            zakelijk
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-[12.5px] text-white/40">{t.category ?? '—'}</td>
                      <td
                        className={`px-4 py-2 text-right text-[12.5px] tabular-nums ${
                          t.is_income ? 'text-[#34C759]' : 'text-white/70'
                        }`}
                      >
                        {t.is_income ? '+' : '−'} {euro(Math.abs(t.amount))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {data && data.count === 0 && (
            <div className="rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] px-4 py-10 text-center">
              <p className="text-[13px] text-white/40">
                Geen transacties in de laatste {months} maanden.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
