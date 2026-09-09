'use client'

import { useEffect, useState } from 'react'
import { ChevronUp } from 'lucide-react'
import { fetchFeedback, setFeedbackStatus } from '@/app/actions/admin/content-list'
import { FEEDBACK_STATUSES, type FeedbackResult, type FeedbackRow } from '@/lib/admin/list-types'

const STATUS_KLEUR: Record<string, string> = {
  new: 'border-[#FF9500]/30 bg-[#FF9500]/10 text-[#FF9500]',
  reviewed: 'border-white/[0.1] bg-white/[0.04] text-white/60',
  planned: 'border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#3B82F6]',
  completed: 'border-[#34C759]/30 bg-[#34C759]/10 text-[#34C759]',
}

function datum(waarde: string | null): string {
  if (!waarde) return '—'
  return new Date(waarde).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
}

/**
 * Feedback en feature requests in het chatvenster.
 *
 * @ai-context: `feature_requests` is op 2026-09-08 leeg. Deze pagina is er dus voor wat
 * komt, niet voor wat er staat. De lege staat zegt dat expliciet, want een leeg scherm
 * zonder uitleg leest als een fout.
 *
 * @ai-sync: app/actions/admin/content-list.ts
 */
export function AdminFeedbackPane() {
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState<'vote_count' | 'created_at'>('vote_count')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<FeedbackResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let afgebroken = false
    setLoading(true)
    setError(null)

    fetchFeedback(status, sort, page)
      .then((d) => !afgebroken && setData(d))
      .catch((e: unknown) => !afgebroken && setError(e instanceof Error ? e.message : String(e)))
      .finally(() => !afgebroken && setLoading(false))

    return () => {
      afgebroken = true
    }
  }, [status, sort, page])

  useEffect(() => {
    setPage(1)
  }, [status, sort])

  async function wisselStatus(item: FeedbackRow, nieuw: string) {
    if (!data) return
    const vorige = item.status
    setError(null)
    setData({
      ...data,
      items: data.items.map((i) => (i.id === item.id ? { ...i, status: nieuw } : i)),
    })

    try {
      await setFeedbackStatus(item.id, nieuw)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
      setData((huidig) =>
        huidig
          ? {
              ...huidig,
              items: huidig.items.map((i) => (i.id === item.id ? { ...i, status: vorige } : i)),
            }
          : huidig,
      )
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl space-y-5 p-6 lg:p-8">
        <header className="border-b border-white/[0.06] pb-4">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Feedback</h1>
          <p className="mt-1 text-[13px] text-white/45">
            {data ? `${data.count} verzoeken` : 'Bezig met laden'}. Wat gebruikers vragen, met
            het aantal stemmen erachter.
          </p>
        </header>

        <div className="flex flex-wrap items-center gap-2">
          {['all', ...FEEDBACK_STATUSES].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`rounded-lg border px-3 py-1.5 text-[12.5px] transition-colors ${
                status === s
                  ? 'border-[#D4A843]/30 bg-[#D4A843]/10 text-[#D4A843]'
                  : 'border-white/[0.06] text-white/45 hover:text-white/70'
              }`}
            >
              {s === 'all' ? 'Alles' : s}
            </button>
          ))}

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as 'vote_count' | 'created_at')}
            className="ml-auto rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-[12.5px] text-white/70 focus:border-white/20 focus:outline-none"
          >
            <option value="vote_count">Meeste stemmen</option>
            <option value="created_at">Nieuwste</option>
          </select>
        </div>

        {error && (
          <div className="rounded-xl border border-[#FF3B30]/30 bg-[#FF3B30]/[0.07] p-4">
            <p className="text-[13px] text-[#FF3B30]">{error}</p>
          </div>
        )}

        <div className={loading ? 'opacity-50 transition-opacity' : 'transition-opacity'}>
          {data && data.items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] px-4 py-10 text-center">
              <p className="text-[13px] text-white/40">
                Nog geen feedback binnen{status !== 'all' ? ` met status "${status}"` : ''}.
              </p>
              <p className="mt-1 text-[12px] text-white/25">
                Dit vult zich zodra gebruikers in de app iets indienen.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {data?.items.map((item) => (
                <li
                  key={item.id}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex min-w-[42px] flex-col items-center rounded-lg border border-white/[0.06] px-2 py-1">
                      <ChevronUp className="h-3 w-3 text-white/30" />
                      <span className="text-[13px] tabular-nums text-white/70">
                        {item.vote_count ?? 0}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[13.5px] font-medium text-white">
                          {item.title ?? 'Zonder titel'}
                        </span>
                        {item.is_visible === false && (
                          <span className="rounded border border-white/[0.08] px-1.5 py-0.5 text-[10.5px] text-white/40">
                            verborgen
                          </span>
                        )}
                        <span className="text-[11.5px] text-white/25">
                          {datum(item.created_at)}
                        </span>
                      </div>

                      {item.description && (
                        <p className="mt-1 text-[12.5px] leading-relaxed text-white/45">
                          {item.description}
                        </p>
                      )}

                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {FEEDBACK_STATUSES.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => wisselStatus(item, s)}
                            className={`rounded-md border px-2 py-0.5 text-[11px] transition-colors ${
                              item.status === s
                                ? STATUS_KLEUR[s]
                                : 'border-white/[0.06] text-white/25 hover:text-white/50'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {data && data.totalPages > 1 && (
            <div className="mt-3 flex items-center justify-between text-[12.5px] text-white/40">
              <span>
                Pagina {data.page} van {data.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={data.page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-white/[0.06] px-3 py-1 hover:text-white/70 disabled:opacity-30"
                >
                  Vorige
                </button>
                <button
                  type="button"
                  disabled={data.page >= data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-white/[0.06] px-3 py-1 hover:text-white/70 disabled:opacity-30"
                >
                  Volgende
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
