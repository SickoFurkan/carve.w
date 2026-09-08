import type { FunnelStep } from '@/lib/admin/funnel'
import type { SourceFailure } from '@/lib/admin/sources/source'

const BRON_LABEL: Record<FunnelStep['source'], string> = {
  ga4: 'GA4',
  appstore: 'App Store Connect',
  supabase: 'Supabase',
}

function getal(value: number | null): string {
  if (value === null) return '—'
  return new Intl.NumberFormat('nl-NL').format(value)
}

function procent(value: number): string {
  return `${new Intl.NumberFormat('nl-NL', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value)}%`
}

interface FunnelProps {
  steps: FunnelStep[]
  /** Meldingen van bronnen die niets gaven, zodat een gat uitgelegd wordt. */
  failures?: SourceFailure[]
}

/**
 * @ai-why: Geen kaart per stap maar één blok met scheidingslijnen. Vijf losse kaarten
 * lezen als vijf onafhankelijke cijfers, en dat is precies de verkeerde lezing: het gaat
 * hier om wat er tussen twee stappen gebeurt, niet om de stappen zelf.
 *
 * @ai-sync: lib/admin/funnel.ts
 */
export function Funnel({ steps, failures = [] }: FunnelProps) {
  return (
    <section className="rounded-xl border border-subtle bg-surface-raised">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((step, i) => (
          <div
            key={step.key}
            className="relative px-4 py-4 lg:border-l lg:border-subtle lg:first:border-l-0"
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-tertiary">
              {BRON_LABEL[step.source]}
            </div>

            <div
              className={`mt-2 text-[27px] font-semibold leading-none tracking-tight tabular-nums ${
                step.value === null ? 'text-ink-muted' : 'text-ink'
              }`}
            >
              {getal(step.value)}
            </div>

            <div className="mt-1 text-[13px] text-ink-secondary">{step.label}</div>

            {step.conversionFromPrevious !== null && (
              <span
                title={
                  step.suspect
                    ? 'Meer dan 100%: deze twee bronnen meten niet dezelfde mensen.'
                    : undefined
                }
                className={`absolute right-3 top-4 rounded-full border px-2 py-0.5 font-mono text-[11px] tabular-nums lg:-right-[21px] lg:top-1/2 lg:-translate-y-1/2 ${
                  step.suspect
                    ? 'border-warning/40 bg-surface text-warning'
                    : 'border-subtle bg-surface text-ink-secondary'
                }`}
              >
                {procent(step.conversionFromPrevious)}
              </span>
            )}

            {/* Laatste stap krijgt geen conversie, dus geen ruimte reserveren. */}
            {i === steps.length - 1 && null}
          </div>
        ))}
      </div>

      {failures.length > 0 && (
        <ul className="border-t border-subtle px-4 py-3 text-[12px] text-ink-tertiary">
          {failures.map((failure) => (
            <li key={failure.source}>
              <span className="font-mono uppercase tracking-wide">{failure.source}</span>{' '}
              {failure.message}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
