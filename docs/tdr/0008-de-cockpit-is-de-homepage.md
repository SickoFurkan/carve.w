# TDR-0008 — `/` is de cockpit, bezoekers gaan naar `/app`

- **Status:** Voorgesteld
- **Datum:** 2026-09-09
- **Beslisser:** Furkan
- **Gerelateerd:** bouwt voort op [TDR-0006](./0006-admin-is-de-cockpit.md) en [TDR-0007](./0007-de-marketingpagina-verhuist-naar-app.md) · overrulet de gate-consequentie van [TDR-0005](./0005-carve-wiki-is-een-marketingpagina.md)
- **Raakt:** `app/page.tsx` (nieuw), `app/(protected)/chat/` (verplaatst), `next.config.ts`, `middleware.ts`, `components/app/layout-wrapper.tsx`, `lib/flags.ts`

## Context

TDR-0007 haalde de marketingpagina van de wortel af en zette hem op `/app`. Dat maakte `/` vrij, en de reden om hem vrij te maken was deze: sinds TDR-0006 wordt Carve bestuurd vanuit `/chat`, en dat is het scherm dat dagelijks open staat. Een cockpit die je bereikt door een pad in te tikken is een cockpit die je minder opent.

Er is één harde randvoorwaarde. `carve.wiki` is het adres in advertenties, in de App Store-listing en in de bio-link. Een bezoeker die daar aankomt en een loginscherm ziet, is een bezoeker die weg is. De chat is bovendien niet af als publiek oppervlak; hij is gebouwd voor één ingelogde gebruiker.

## Beslissing

**`/` toont de cockpit aan wie is ingelogd, en stuurt iedereen zonder sessie door naar `/app`.**

1. `app/(protected)/chat/` verhuist naar `app/page.tsx`. Dezelfde `ChatLayout`, andere plek.
2. **Zonder sessie: 307 naar `/app`.** Dat gebeurt in `middleware.ts`, want die kent zowel het pad als de sessie. Tijdelijk en niet permanent: wie later inlogt hoort de cockpit te zien, en een 308 zou in de browsercache blijven hangen en dat onmogelijk maken.
3. `/chat` wordt een permanente redirect naar `/`. Die URL staat in bladwijzers en in de geschiedenis.
4. **De redirect van `/` naar `/app` in `next.config.ts` gaat eruit.** Config-redirects komen vóór de middleware; laten staan betekent dat de nieuwe homepage nooit rendert.
5. **De cockpit komt achter `SHOW_WEB_APP` vandaan.** Die vlag staat in productie uit, dus anders geeft de homepage daar een 404. De grens wordt de sessie plus de rolcontrole in `lib/admin/auth.ts`, en dat was sowieso de echte grens; de vlag verborg alleen de ingang.
6. `/app` blijft ongewijzigd publiek en blijft in de sitemap staan als de pagina met prioriteit 1.0.

## Alternatieven afgewogen

| Alternatief | Waarom niet |
|---|---|
| **Zonder sessie een loginscherm op `/`** | Elke advertentieklik en elke bezoeker die `carve.wiki` intikt landt dan op een formulier. Dat is precies het verkeer waar je voor betaalt. |
| **`/chat` laten staan en `/` blijven doorsturen** | Werkt, maar dan blijft de cockpit een pad dat je moet onthouden. Dat was de hele reden voor TDR-0007. |
| **`/` publiek maken met de chat erop** | De chat is niet gebouwd voor bezoekers: geen uitleg, geen aanmelding, en de Admin-modus hangt aan een rol. Een vreemde ziet een leeg venster met een invoerveld. |
| **Permanente redirect (308) voor bezoekers** | Blijft in de browsercache staan. Iemand die één keer uitgelogd langskwam, komt na inloggen nog steeds op `/app` uit, en dat is niet te debuggen zonder de cache te legen. |

## Consequenties

- **`/` is niet meer indexeerbaar.** Een crawler heeft geen sessie en wordt doorgestuurd naar `/app`. Dat is de bedoeling: `/app` is de pagina die gevonden moet worden en staat als enige in de sitemap.
- **`SHOW_WEB_APP` dekt de cockpit niet meer.** De vlag blijft bestaan voor de rest van het web-platform (`/workouts`, `/food`, `/money`, `/travel`, `/social`, `/profile`, `/settings`, `/health`, `/dashboard`, `/hiscores`, `/demo`, `/lab`). Zodra dat platform verdwijnt, verdwijnt de vlag mee.
- **De cockpit is in productie bereikbaar.** Dat was tot nu toe niet zo (zie de openstaande beslissing in TDR-0006, hiermee beantwoord). Wie geen adminrol heeft en toch inlogt, ziet de chat maar niet de Admin-modus; de server actions weigeren hem los daarvan.
- **GA4 ziet vanaf nu vrijwel geen verkeer meer op `/`.** Rapporten die de landingspagina op `/` filterden moeten naar `/app`.

## Hoe overrulen

Een opvolger zou moeten laten zien dat de cockpit op de wortel in de weg zit: bijvoorbeeld omdat carve.wiki een echte publieke homepage nodig heeft die geen marketingpagina is. Dan verhuist de cockpit naar een eigen pad en wordt `/` weer publiek.

## Synchronisatie

- `middleware.ts` ↔ `next.config.ts` — geen config-redirect op `/`, anders komt de middleware er nooit aan toe
- `components/app/layout-wrapper.tsx` ↔ `app/page.tsx` — de cockpit draagt zijn eigen volledige venster, dus de shell moet hem overslaan
- `lib/flags.ts` ↔ `app/page.tsx` — de cockpit staat bewust niet achter `SHOW_WEB_APP`
- `app/sitemap.ts` ↔ `next.config.ts` — `/` staat er niet in, `/app` wel
