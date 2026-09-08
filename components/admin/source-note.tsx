import type { SourceFailure } from '@/lib/admin/sources/source'

const TITEL: Record<SourceFailure['source'], string> = {
  ga4: 'GA4',
  appstore: 'App Store Connect',
  meta: 'Meta',
  supabase: 'Supabase',
}

const WAT_NU: Record<SourceFailure['kind'], string> = {
  unconfigured: 'Nog niet gekoppeld',
  timeout: 'Duurde te lang',
  error: 'Gaf een fout',
}

/**
 * Het blok dat in de plaats komt van een bron die niets gaf.
 *
 * @ai-why: Een lege kaart met een streepje erin laat je raden of er niets gebeurd is of
 * dat er iets stuk is. Dat verschil is het hele punt van dit scherm: nul downloads is
 * een resultaat, geen verbinding is een klus. Vandaar dat de reden er letterlijk staat,
 * inclusief de namen van de env-variabelen die ontbreken.
 *
 * @ai-sync: lib/admin/sources/source.ts
 */
export function SourceNote({ failure, title }: { failure: SourceFailure; title?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-subtle bg-surface p-5">
      <div className="flex items-center gap-2 text-[12.5px] text-ink-secondary">
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-tertiary">
          {TITEL[failure.source]}
        </span>
        <span className="text-ink-muted">·</span>
        <span>{WAT_NU[failure.kind]}</span>
      </div>

      {title && <div className="mt-2 text-[15px] font-medium text-ink-secondary">{title}</div>}

      <p className="mt-1 text-[13px] leading-relaxed text-ink-tertiary">{failure.message}</p>
    </div>
  )
}
