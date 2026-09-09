'use client'

import { useEffect, useState } from 'react'
import { fetchArticles, setArticlePublished } from '@/app/actions/admin/content-list'
import type { ArticleRow, ArticlesResult } from '@/lib/admin/list-types'

const FILTERS = [
  { id: 'all', label: 'Alles' },
  { id: 'published', label: 'Gepubliceerd' },
  { id: 'draft', label: 'Concept' },
] as const

type Filter = (typeof FILTERS)[number]['id']

function datum(waarde: string | null): string {
  if (!waarde) return '—'
  return new Date(waarde).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
}

/**
 * De wiki-artikelen in het chatvenster.
 *
 * @ai-gotcha: Publiceren en depubliceren raakt de iOS-app meteen. De Encyclopedie-tab
 * leest `wiki_articles` rechtstreeks, dus een artikel op concept zetten haalt het bij
 * iedereen weg. Vandaar dat de knop zegt wat er gebeurt en niet alleen een schakelaar is.
 *
 * @ai-sync: app/actions/admin/content-list.ts
 */
export function AdminContentPane() {
  const [filter, setFilter] = useState<Filter>('all')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<ArticlesResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bezig, setBezig] = useState<string | null>(null)

  useEffect(() => {
    let afgebroken = false
    setLoading(true)
    setError(null)

    fetchArticles(filter, page)
      .then((d) => !afgebroken && setData(d))
      .catch((e: unknown) => !afgebroken && setError(e instanceof Error ? e.message : String(e)))
      .finally(() => !afgebroken && setLoading(false))

    return () => {
      afgebroken = true
    }
  }, [filter, page])

  useEffect(() => {
    setPage(1)
  }, [filter])

  async function wissel(article: ArticleRow) {
    if (!data) return
    const nieuw = !article.is_published
    setBezig(article.id)
    setError(null)

    setData({
      ...data,
      articles: data.articles.map((a) =>
        a.id === article.id ? { ...a, is_published: nieuw } : a,
      ),
    })

    try {
      await setArticlePublished(article.id, nieuw)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
      setData((huidig) =>
        huidig
          ? {
              ...huidig,
              articles: huidig.articles.map((a) =>
                a.id === article.id ? { ...a, is_published: !nieuw } : a,
              ),
            }
          : huidig,
      )
    } finally {
      setBezig(null)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl space-y-5 p-6 lg:p-8">
        <header className="border-b border-white/[0.06] pb-4">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Inhoud</h1>
          <p className="mt-1 text-[13px] text-white/45">
            {data ? `${data.published} gepubliceerd, ${data.drafts} concept` : 'Bezig met laden'}.
            De Encyclopedie-tab in de app leest deze artikelen rechtstreeks.
          </p>
        </header>

        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-lg border px-3 py-1.5 text-[12.5px] transition-colors ${
                filter === f.id
                  ? 'border-[#D4A843]/30 bg-[#D4A843]/10 text-[#D4A843]'
                  : 'border-white/[0.06] text-white/45 hover:text-white/70'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="rounded-xl border border-[#FF3B30]/30 bg-[#FF3B30]/[0.07] p-4">
            <p className="text-[13px] text-[#FF3B30]">{error}</p>
          </div>
        )}

        <div className={loading ? 'opacity-50 transition-opacity' : 'transition-opacity'}>
          <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <table className="w-full min-w-[600px] text-left">
              <thead>
                <tr className="border-b border-white/[0.06] text-[10.5px] uppercase tracking-[0.1em] text-white/30">
                  <th className="px-4 py-2.5 font-medium">Artikel</th>
                  <th className="px-4 py-2.5 font-medium">Categorie</th>
                  <th className="px-4 py-2.5 font-medium">Bekeken</th>
                  <th className="px-4 py-2.5 font-medium">Bijgewerkt</th>
                  <th className="px-4 py-2.5 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.articles.map((article) => (
                  <tr
                    key={article.id}
                    className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-2.5">
                      <div className="text-[13px] text-white">{article.title ?? 'Zonder titel'}</div>
                      <div className="font-mono text-[11px] text-white/25">{article.slug ?? '—'}</div>
                    </td>
                    <td className="px-4 py-2.5 text-[12.5px] text-white/45">
                      {article.category ?? '—'}
                    </td>
                    <td className="px-4 py-2.5 text-[12.5px] tabular-nums text-white/45">
                      {article.view_count ?? 0}
                    </td>
                    <td className="px-4 py-2.5 text-[12.5px] tabular-nums text-white/45">
                      {datum(article.updated_at)}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        type="button"
                        disabled={bezig === article.id}
                        onClick={() => wissel(article)}
                        title={
                          article.is_published
                            ? 'Op concept zetten haalt dit artikel uit de app'
                            : 'Publiceren zet dit artikel in de app'
                        }
                        className={`rounded-lg border px-2.5 py-1 text-[11.5px] transition-colors disabled:opacity-40 ${
                          article.is_published
                            ? 'border-[#34C759]/30 bg-[#34C759]/10 text-[#34C759]'
                            : 'border-white/[0.08] text-white/35 hover:text-white/60'
                        }`}
                      >
                        {article.is_published ? 'Live' : 'Concept'}
                      </button>
                    </td>
                  </tr>
                ))}

                {data && data.articles.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[13px] text-white/30">
                      Geen artikelen in dit filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

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
