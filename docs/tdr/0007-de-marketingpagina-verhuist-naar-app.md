# TDR-0007 — de marketingpagina verhuist naar `/app`, `/` stuurt door

- **Status:** Voorgesteld
- **Datum:** 2026-09-09
- **Beslisser:** Furkan
- **Gerelateerd:** overrulet beslissing 1 van [TDR-0005](./0005-carve-wiki-is-een-marketingpagina.md) · bouwt voort op [TDR-0006](./0006-admin-is-de-cockpit.md)
- **Raakt:** `app/(landing)/page.tsx` (verplaatst naar `app/app/page.tsx`), `next.config.ts`, `app/sitemap.ts`, `app/robots.ts`, `middleware.ts`, `components/app/layout-wrapper.tsx`, `components/chat/ChatSidebar.tsx`

## Context

TDR-0005 maakte `/` de marketingpagina en wees een redirect expliciet af: *"`/` is de URL die mensen intikken en waar advertenties en de bio-link naartoe wijzen, en een redirect kost daar zowel snelheid als duidelijkheid."* Die redenering klopte toen carve.wiki één ding deed.

Sindsdien is er iets bij gekomen. TDR-0006 maakte van `/chat` de cockpit waarin het hele product bestuurd wordt, en de zijbalk daar heeft een ingang nodig naar "wat ziet een bezoeker". Die ingang naar `/` laten wijzen leest verkeerd: `/` is dan tegelijk de wortel van de site én één specifieke pagina. Bovendien houdt `/` als marketingpagina de deur dicht voor alles wat later op de wortel zou kunnen staan.

De prijs is dat `/` een hop wordt. Die prijs was in TDR-0005 het hele argument om níét te verhuizen; hij is niet verdwenen, hij weegt nu alleen lichter dan een adres dat zegt wat het is.

## Beslissing

**De marketingpagina staat op `/app`. `/` stuurt permanent (308) door naar `/app`.**

1. `app/(landing)/page.tsx` verhuist naar `app/app/page.tsx`. Dezelfde component, dezelfde metadata, dezelfde structured data; alleen de `url` in de JSON-LD wijst naar `/app` in plaats van naar de wortel.
2. `/` krijgt een permanente redirect naar `/app`, in `next.config.ts` naast de bestaande `/carve`-regel. Permanent en niet tijdelijk, want de URL staat in advertenties, in de App Store-listing en in oude links.
3. **`/carve` gaat rechtstreeks naar `/app`** en niet meer naar `/`. Een redirect die op een redirect uitkomt kost een tweede hop en Google waardeert de laatste in de keten.
4. De sitemap noemt `/app` als de pagina met prioriteit 1.0; `/` staat er niet in, want een URL die doorstuurt hoort niet in een sitemap.
5. De App-ingang onderaan de zijbalk in `/chat` wijst naar `/app`.

## Alternatieven afgewogen

| Alternatief | Waarom niet |
|---|---|
| **`/` blijft de pagina, `/app` stuurt erheen** | Breekt niets en kost vijf minuten, maar dan is `carve.wiki/app` een doorverwijzing en geen pagina. Precies het adres dat je in een listing wilt zetten is dan het adres dat niet bestaat. |
| **Allebei renderen, `/app` canonical naar `/`** | Twee URL's die hetzelfde tonen, twee plekken om metadata bij te houden, en de canonical is de enige die het verschil bewaakt. Dat is een afspraak die stil breekt zodra iemand één van de twee aanpast. |
| **`/` leeg laten (404)** | Iedere bestaande advertentieklik en iedere oude link komt dan op niets uit. Een 308 kost een hop; een 404 kost de bezoeker. |

## Consequenties

- **Advertentieverkeer loopt via een redirect.** Elke klik op `carve.wiki` doet één extra hop voordat de pagina laadt. Meetbaar maar klein; de reden dat TDR-0005 dit afwees, en de reden dat deze TDR bestaat in plaats van een stille wijziging.
- **Buiten deze repo moet er drie dingen bij:** de bestemming van de Meta-campagnes, de marketing-URL in de App Store-listing en de bio-link. Zolang die op `/` staan werkt alles nog via de redirect, maar dan meet je een hop die je niet nodig hebt.
- **`/` is nu vrij.** Wat daar ooit komt te staan is een nieuwe keuze; deze TDR zegt er niets over behalve dat de plek open is.
- **De GA4-meting verschuift van pad.** Rapporten die op `/` filterden zien vanaf nu `/app`. Vergelijkingen over de knip heen moeten beide paden meenemen.

## Hoe overrulen

Een opvolger zou moeten laten zien dat de extra hop echt geld kost: een meetbaar lagere conversie van advertentieklik naar App Store-klik ná de verhuizing, over genoeg verkeer om niet toevallig te zijn. Dan gaat de pagina terug naar `/` en wordt `/app` de doorverwijzing.

## Synchronisatie

- `next.config.ts` ↔ `app/sitemap.ts` — geen URL in de sitemap die doorstuurt
- `next.config.ts` ↔ `middleware.ts` — beide kennen de marketingpagina; een redirect naar `/` zou hier op een tweede redirect uitkomen
- `components/app/layout-wrapper.tsx` ↔ `app/app/page.tsx` — de pagina draagt zijn eigen kop, dus de shell moet hem overslaan
- `components/chat/ChatSidebar.tsx` ↔ `app/app/page.tsx` — de App-ingang in de cockpit
