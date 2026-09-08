import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getOverview } from '@/lib/admin/overview'
import { Funnel } from '@/components/admin/funnel'
import { SourceNote } from '@/components/admin/source-note'
import { StatsCard } from '@/components/admin/stats-card'

/**
 * @ai-why: Geen statische render. Elk cijfer op dit scherm komt live uit een externe
 * bron (TDR-0006 beslissing 3); een gecachete pagina zou een uur oude trechter tonen
 * zonder dat je dat ziet. De cache zit één laag lager, op de dagrapporten van Apple.
 */
export const dynamic = 'force-dynamic'

const PERIODES = [7, 30] as const

function getal(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('nl-NL').format(value)
}

function euro(value: number | null): string {
  if (value === null) return '—'
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(value)
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ dagen?: string }>
}) {
  const params = await searchParams
  const days = PERIODES.includes(Number(params.dagen) as (typeof PERIODES)[number])
    ? Number(params.dagen)
    : 7

  const supabase = await createClient()
  const overview = await getOverview(supabase, days)

  const app = overview.app.ok ? overview.app.data : null
  const vorige = overview.appPrevious.ok ? overview.appPrevious.data : null
  const store = overview.appstore.ok ? overview.appstore.data : null

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-7xl space-y-5 p-6 lg:p-10">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-subtle pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-ink">Overzicht</h1>
            <p className="mt-1 text-[13px] text-ink-secondary">
              Van bezoeker tot eerste log, over GA4, App Store Connect, Meta en Supabase.
              {app ? ` ${app.testAccounts} testaccounts tellen niet mee.` : ''}
            </p>
          </div>

          <nav className="flex rounded-lg border border-subtle bg-surface p-0.5">
            {PERIODES.map((p) => (
              <Link
                key={p}
                href={`/admin?dagen=${p}`}
                className={`rounded-md px-3 py-1 text-[12.5px] transition-colors ${
                  p === days ? 'bg-white/[0.07] text-ink' : 'text-ink-tertiary hover:text-ink-secondary'
                }`}
              >
                {p} dagen
              </Link>
            ))}
          </nav>
        </header>

        <Funnel steps={overview.funnel} failures={overview.failures} />

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {overview.meta.ok ? (
            <StatsCard
              title={`Advertentie-uitgaven, ${days} dagen`}
              value={euro(overview.meta.data.spend)}
              icon="Zap"
              description={`${getal(overview.meta.data.clicks)} klikken`}
              index={0}
            />
          ) : (
            <SourceNote failure={overview.meta.failure} title="Advertentie-uitgaven" />
          )}

          <StatsCard
            title="Kosten per download"
            value={euro(overview.costPerDownload)}
            icon="Activity"
            description={`Per account ${euro(overview.costPerAccount)}`}
            index={1}
          />

          {overview.appstore.ok ? (
            <StatsCard
              title="App Store"
              value={store?.averageRating === null ? '—' : `${store?.averageRating} ★`}
              icon="BookOpen"
              description={`${getal(store?.ratingCount)} beoordelingen · ${getal(store?.unanswered)} reviews zonder antwoord`}
              index={2}
            />
          ) : (
            <SourceNote failure={overview.appstore.failure} title="App Store" />
          )}
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatsCard
            title="Echte accounts"
            value={getal(app?.totalRealAccounts)}
            icon="Users"
            description={`${getal(app?.testAccounts)} testaccounts uitgesloten`}
            index={0}
          />
          <StatsCard
            title="Actief"
            value={getal(app?.activeUsers)}
            previousValue={vorige?.activeUsers}
            icon="Activity"
            description={`Laatste ${days} dagen`}
            index={1}
          />
          <StatsCard
            title="Maaltijden gelogd"
            value={getal(app?.meals)}
            previousValue={vorige?.meals}
            icon="UtensilsCrossed"
            description={`Laatste ${days} dagen`}
            index={2}
          />
          <StatsCard
            title="Workouts"
            value={getal(app?.workouts)}
            previousValue={vorige?.workouts}
            icon="Dumbbell"
            description={`Laatste ${days} dagen`}
            index={3}
          />
        </section>

        {!overview.app.ok && (
          <SourceNote failure={overview.app.failure} title="Cijfers uit de eigen database" />
        )}

        {store && store.reviews.length > 0 && (
          <section className="rounded-xl border border-subtle bg-surface-raised p-5">
            <h2 className="text-lg font-semibold text-ink">Laatste reviews</h2>
            <ul className="mt-3 space-y-3">
              {store.reviews.slice(0, 5).map((review) => (
                <li key={review.id} className="border-b border-subtle pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <span className="text-health">{'★'.repeat(review.rating)}</span>
                    <span className="font-medium text-ink">{review.title}</span>
                    {!review.answered && (
                      <span className="rounded border border-warning/30 bg-warning/10 px-1.5 py-0.5 text-[10.5px] text-warning">
                        geen antwoord
                      </span>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-[13px] text-ink-secondary">{review.body}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}
