# TDR-0006 — /admin is de cockpit, en haalt zijn cijfers live op

- **Status:** Voorgesteld
- **Datum:** 2026-09-08
- **Beslisser:** Furkan
- **Gerelateerd:** volgt op [TDR-0005](./0005-carve-wiki-is-een-marketingpagina.md)
- **Raakt:** `app/(protected)/admin/page.tsx`, `app/(protected)/admin/referrals/` (weg), `lib/admin/queries.ts`, `lib/admin/sources/` (nieuw), `lib/navigation/admin-navigation.ts`, `components/admin/`, `.env.local`

## Context

Sinds TDR-0005 verkoopt carve.wiki één product: de iOS-app. Het web-platform staat uit. Maar `/admin` meet nog steeds dat uitgezette platform: totaal aantal workouts, maaltijden, referrals, rolverdeling en levelverdeling. Elk van die getallen telt bovendien de zeven testaccounts van de dertien mee, dus geen enkel cijfer op dat scherm klopt.

Wat er wél toe doet ligt op vier plekken die niets van elkaar weten. GA4 kent het bezoek en de klik op de App Store-badge (`app_store_click`, met een `source` per knop). App Store Connect kent de installs, de sterren en de reviews. Meta kent de advertentie-uitgaven. Supabase kent de accounts en wat er in de app gelogd wordt, want de iOS-app deelt dezelfde database.

Geen van die vier dashboards kan de vraag beantwoorden waar het bij een net gelanceerde app om draait: van de mensen die de site zien, hoeveel doorklikken, hoeveel installeren, en hoeveel er daarna één keer iets loggen. Dat gat tussen de systemen is de reden dat hier iets eigens komt te staan, en niet vier bladwijzers.

## Beslissing

**`/admin` wordt de plek waar Carve bestuurd wordt: één overzicht met de trechter over alle vier de bronnen, met het bestaande beheer eronder. Elke bron wordt live opgehaald bij het openen van de pagina; er komt geen eigen metrics-tabel.**

1. **De trechter is het hoofdgerecht.** Bezoekers (GA4) → klik naar de App Store (GA4) → installs (App Store Connect) → account aangemaakt (Supabase) → eerste maaltijd of workout gelogd (Supabase), met de conversie tussen elke stap, over 7 en 30 dagen.
2. **Live ophalen, niet opslaan.** Geen `metrics_daily`-tabel, geen cron, geen migratie. De pagina bevraagt de vier bronnen bij het renderen. Historie komt uit wat de bron zelf teruggeeft.
3. **Eén uitzondering op punt 2: Apple's dagrapporten worden server-side gecachet.** App Store Connect levert één rapportbestand per dag, dus dertig dagen trend zijn dertig downloads. Een afgesloten dag verandert nooit meer, dus die mag onbeperkt in de Next-cache blijven; de dag van vandaag krijgt een korte TTL. Dit is een cache, geen opslag: gooi je hem weg, dan klopt alles nog steeds.
4. **Een bron die ontbreekt of stuk is, laat de rest van de pagina staan.** Elke bron geeft `{ ok, data }` of `{ ok: false, reason }` terug en rendert in het laatste geval een blok dat zegt wat er mist. Een dashboard dat helemaal wit wordt omdat Meta een 500 geeft, wordt niet meer geopend.
5. **Elke telling over eigen data sluit testaccounts uit.** Dat gebeurt op één plek, niet per query. Zonder dat is elk Supabase-getal op dit scherm meer dan een factor twee te hoog.
6. **Referrals verdwijnt** (pagina, navigatie-item en queries). Het hoorde bij het web-platform en er is nooit een referral geweest.

## Alternatieven afgewogen

| Alternatief | Waarom niet |
|---|---|
| **Dagelijkse snapshot in Supabase, cron schrijft één rij per bron per dag** | Dit was de aanbeveling: historie die je niet wegschrijft krijg je nooit meer terug, en Apple's venster is eindig. Furkan koos op 2026-09-08 toch voor live, omdat een tabel, een migratie en een cron onderhoud zijn voor een product met dertien accounts, en omdat GA4 en Meta hun eigen historie al teruggeven. De prijs staat onder Consequenties. |
| **Snapshot voor historie, vandaag live** | Twee codepaden per bron, dus twee plekken waar het stil verkeerd kan gaan. Bij drie bronnen zijn dat zes paden voor één scherm. |
| **De vier dashboards van Apple, Google en Meta blijven gebruiken** | Kost niets te bouwen, maar dan bestaat de trechter nergens. Precies het enige cijfer dat je zelf moet maken is het cijfer dat je dan niet hebt. |
| **Een kant-en-klaar product (Mixpanel, Amplitude, RevenueCat)** | Betaalde afhankelijkheid, en geen van hen ziet zowel de Meta-uitgaven als de rijen in jouw Supabase. Het gat tussen de systemen is precies waar zij ook ophouden. |
| **`/admin` als los project buiten deze repo** | De Supabase-client, de rolcontrole, de tegels en de grafiekschil staan hier al. Een tweede deploy onderhouden om die opnieuw te bouwen levert niets op. |

## Consequenties

- **Geen historie voorbij het venster van de bron.** Vraag je over een half jaar "hoe liep de install-conversie in september", dan is het antwoord er alleen als Apple, GA4 en Meta het dan nog geven. Dit is de bewuste prijs van beslissing 2 en de meest waarschijnlijke reden voor een opvolger-TDR.
- **Drie sets sleutels in de omgeving**, elk met een eigen manier om te verlopen: een App Store Connect API-sleutel (issuer ID, key ID, `.p8`), een service-account voor de GA4 Data API, en een Meta Marketing API-token. Ontbreekt er één, dan valt alleen dat blok weg (beslissing 4).
- **De paginaload wordt trager en hangt van derden af.** Vier bronnen parallel, met een timeout per bron. Dat is de reden dat beslissing 4 geen luxe is.
- **De trechter is een ondergrens, geen exacte meting.** `app_store_click` vuurt alleen bij bezoekers die de cookiebanner accepteren, en Apple geeft installs per dag en niet per bezoeker. Je legt dus twee reeksen naast elkaar; je volgt geen individuele reis. Elk conversiepercentage op dat scherm moet zo gelezen worden.
- **Feature flags blijven read-only op het scherm.** `lib/flags.ts` zijn build-time constanten; ze omzetten vanuit het dashboard zou betekenen dat ze naar de database verhuizen. Dat is een eigen beslissing en valt buiten deze TDR.
- **Openstaand punt: `/admin` is in productie onbereikbaar.** Het zit in `(protected)` en die groep geeft een 404 zolang `SHOW_WEB_APP` uit staat. Een dashboard dat je alleen op `pnpm dev` kunt openen, wordt niet gebruikt. De uitzondering is één regel in `app/(protected)/layout.tsx` en de rolcontrole in `lib/admin/auth.ts` blijft er hoe dan ook voor staan, maar het maakt een route in productie bereikbaar en is daarom een keuze van Furkan, niet van de bouw.

## Hoe overrulen

Een opvolger levert één van deze twee: een concrete vraag over het verleden die onbeantwoordbaar bleek omdat er niets is weggeschreven, of een paginaload die zo traag of zo vaak stuk is dat je het scherm niet meer opent. In beide gevallen is het antwoord hetzelfde als het hier afgewezen alternatief: een `metrics_daily`-tabel met een dagelijkse cron ernaast, en dit scherm dat die tabel leest.

## Synchronisatie

- `lib/admin/sources/` ↔ `.env.local` — elke bron leest zijn eigen sleutels en zegt bij ontbreken wélke
- `lib/admin/queries.ts` ↔ de testaccount-filter — één definitie van "dit is geen echte gebruiker", door alle tellingen heen
- `lib/analytics.ts` (`app_store_click`) ↔ `lib/admin/sources/ga4.ts` — de eventnaam staat aan twee kanten en moet gelijk blijven
- `lib/navigation/admin-navigation.ts` ↔ `app/(protected)/admin/` — geen navigatie-item zonder route
