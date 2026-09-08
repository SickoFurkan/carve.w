# TDR-0006 — /admin is de cockpit, en haalt zijn cijfers live op

- **Status:** Voorgesteld, review verwerkt 2026-09-08
- **Datum:** 2026-09-08
- **Beslisser:** Furkan
- **Gerelateerd:** volgt op [TDR-0005](./0005-carve-wiki-is-een-marketingpagina.md)
- **Raakt:** `app/(protected)/admin/page.tsx`, `app/(protected)/admin/referrals/` (weg), `app/(protected)/layout.tsx`, `middleware.ts`, `lib/admin/queries.ts`, `lib/admin/app-metrics.ts` (nieuw), `lib/admin/funnel.ts` (nieuw), `lib/admin/sources/` (nieuw), `lib/navigation/admin-navigation.ts`, `components/admin/`, `supabase/migrations/20260908000001_add_is_test_to_profiles.sql`

## Context

Sinds TDR-0005 verkoopt carve.wiki één product: de iOS-app. Het web-platform staat uit. Maar `/admin` meet nog steeds dat uitgezette platform: totaal aantal workouts, maaltijden, referrals, rolverdeling en levelverdeling. Elk van die getallen telt bovendien de zeven testaccounts van de dertien mee, dus geen enkel cijfer op dat scherm klopt.

Wat er wél toe doet ligt op vier plekken die niets van elkaar weten. GA4 kent het bezoek en de klik op de App Store-badge (`app_store_click`, met een `source` per knop). App Store Connect kent de downloads en de geschreven reviews. Meta kent de advertentie-uitgaven. Supabase kent de accounts en wat er in de app gelogd wordt, want de iOS-app deelt dezelfde database.

Geen van die vier dashboards kan de vraag beantwoorden waar het bij een net gelanceerde app om draait: van de mensen die de site zien, hoeveel doorklikken, hoeveel installeren, en hoeveel er daarna één keer iets loggen. Dat gat tussen de systemen is de reden dat hier iets eigens komt te staan, en niet vier bladwijzers.

## Beslissing

**`/admin` wordt de plek waar Carve bestuurd wordt: één overzicht met de trechter over alle vier de bronnen, met het bestaande beheer eronder. Elke bron wordt live opgehaald bij het openen van de pagina; er komt geen eigen metrics-tabel.**

1. **De trechter is het hoofdgerecht.** Bezoekers (GA4) → klik naar de App Store (GA4) → **downloads** (App Store Connect) → account aangemaakt (Supabase) → eerste maaltijd gelogd (Supabase), met de conversie tussen elke stap, over 7 en 30 dagen. Meta levert geen trechterstap maar de kostenkant ernaast: uitgaven, klikken en de kosten per download en per account.
2. **De derde stap heet Downloads, en dat is een ander getal dan Apple's Installs.** We tellen **Units** uit het SALES/SUMMARY-dagrapport: eerste downloads per Apple-ID, zonder updates en zonder in-app aankopen. Apple's eigen Installations-metric (installaties per apparaat, inclusief herinstallatie) zit alleen in de Analytics Reports API, en die werkt asynchroon: eerst een `analyticsReportRequest` aanmaken, dan via reports → instances → segments ophalen, met de eerste data pas 24 tot 48 uur ná het aanvragen en instances die verlopen. Dat past niet op een pagina die live ophaalt. Gevolg: dit cijfer wijkt structureel af van wat de Analytics-tab in App Store Connect toont, en die twee horen dus niet naast elkaar gezet te worden.
3. **Live ophalen, niet opslaan.** Geen `metrics_daily`-tabel, geen cron, geen migratie voor cijfers. De pagina bevraagt de vier bronnen bij het renderen. Historie komt uit wat de bron zelf teruggeeft.
4. **Eén uitzondering op punt 3: Apple's dagrapporten gaan in de fetch-cache.** Eén rapportbestand per dag betekent dertig aanroepen voor dertig dagen trend. Concreet: `fetch(..., { next: { revalidate: false } })` voor een dag die minstens twee dagen oud is, en `revalidate: 1800` daarbinnen. Niet `"use cache"`: dat vereist `cacheComponents: true`, wat het renderingmodel van de héle app verandert, en het overleeft geen deploy omdat de build-id in de cache key zit. De fetch Data Cache overleeft dat wel.
   **Een 404 wordt nooit als definitieve nul vastgehouden.** Apple geeft 404 voor een dag zonder verkeer én voor een dag waarvan het rapport nog niet klaar is (dat komt de volgende ochtend rond 08:00 Pacific). Zou je die als nul in een eeuwige cache zetten, dan staat er permanent een nul voor een dag waarop wel gedownload is. Vandaar de twee-dagen-grens.
   Dit is een cache en geen opslag: gooi hem weg en alles klopt nog steeds. Hij lost daarmee **niets** op aan het historieprobleem uit de Consequenties; dat is een aparte vraag.
5. **Een bron die ontbreekt of stuk is, laat de rest van de pagina staan.** Elke bron geeft `{ ok, data }` of `{ ok: false, failure }` terug en rendert in het laatste geval een blok dat zegt wat er mist. Een dashboard dat helemaal wit wordt omdat Meta een 500 geeft, wordt niet meer geopend. Timeout per bron: acht seconden, met een `AbortController` zodat het verzoek ook echt stopt en niet alleen het wachten.
6. **Testaccount is een kolom: `profiles.is_test`, handmatig aangevinkt in de gebruikerslijst.** Elke telling over eigen data leest die op één plek (`lib/admin/app-metrics.ts`), niet per query. Zonder dat is elk Supabase-getal op dit scherm meer dan een factor twee te hoog. Een profiel zonder waarde telt als echt, zodat een nieuwe gebruiker nooit stilletjes uit de cijfers valt. Afgewezen: raden op een e-mailpatroon (een misser maakt elk getal fout zonder dat iets faalt) en een lijst UUID's in code (drift zodra er een achtste testaccount komt).
   De tellingen draaien op de **anon key met de admin-sessie**, niet op `SUPABASE_SERVICE_ROLE_KEY`. De RLS-policies staan het toe via `public.is_admin()`; de service-role-key staat wel in `.env.local` en is de voor de hand liggende verkeerde greep zodra een telling leeg terugkomt.
7. **Referrals verdwijnt** (pagina, navigatie-item en queries). Het hoorde bij het web-platform en er is nooit een referral geweest.

## Alternatieven afgewogen

| Alternatief | Waarom niet |
|---|---|
| **Dagelijkse snapshot in Supabase, cron schrijft één rij per bron per dag** | Dit was de aanbeveling: historie die je niet wegschrijft krijg je nooit meer terug. Furkan koos op 2026-09-08 voor live, omdat een tabel, een migratie en een cron onderhoud zijn voor een product met dertien accounts. Bij review bleek het argument grotendeels te kloppen, maar niet overal: GA4 en Meta geven hun eigen historie terug (Meta ~37 maanden), Supabase heeft de rijen zelf, en alleen **Apple** heeft een harde grens van 365 dagen. Het alternatief was in de eerste versie van deze TDR ook te duur geprijsd; zie de volgende rij. |
| **Alleen Apple's dagcijfers wegschrijven in `app_settings`** | Het compromis dat de review voorstelde: `app_settings` (key/value JSONB, admin-only RLS) bestaat al sinds `20260303000001_admin_panel_prerequisites.sql`, dus dit kost geen tabel, geen migratie en geen cron. Eén rij per opgehaalde afgesloten dag wegschrijven bij het renderen is ongeveer tien regels. Niet gekozen voor de eerste bouw, wél expliciet als het antwoord zodra het historiegat gaat knellen. De prijs van uitstel staat hieronder met een datum erbij. |
| **Snapshot voor historie, vandaag live** | Twee codepaden per bron, dus twee plekken waar het stil verkeerd kan gaan. Bij drie bronnen zijn dat zes paden voor één scherm. |
| **De vier dashboards van Apple, Google en Meta blijven gebruiken** | Kost niets te bouwen, maar dan bestaat de trechter nergens. Precies het enige cijfer dat je zelf moet maken is het cijfer dat je dan niet hebt. |
| **Een kant-en-klaar product (Mixpanel, Amplitude, RevenueCat)** | Betaalde afhankelijkheid, en geen van hen ziet zowel de Meta-uitgaven als de rijen in jouw Supabase. Het gat tussen de systemen is precies waar zij ook ophouden. |
| **`/admin` als los project buiten deze repo** | De Supabase-client, de rolcontrole, de tegels en de grafiekschil staan hier al. Een tweede deploy onderhouden om die opnieuw te bouwen levert niets op. |

## Consequenties

- **Apple's venster is 365 dagen, en dat is het enige echte dataverlies.** Rond **2027-09** valt de lanceermaand er als eerste uit; dat is precies de basislijn waar je later tegen wilt vergelijken. GA4 en Meta hebben dit probleem niet in de vorm die telt: GA4's retentie-instelling van twee maanden raakt user- en event-level data in Explorations, niet de geaggregeerde rapportage waar `date` × `eventName` uit komt, en Meta bewaart ad-insights ongeveer 37 maanden. Dit is de bewuste prijs van beslissing 3 en de meest waarschijnlijke reden voor een opvolger-TDR. Zet GA4's retentie desondanks op 14 maanden: het is één klik en het maakt de vraag definitief onbelangrijk.
- **De uitsplitsing per knop moet vandaag aangezet worden, of hij is er nooit.** `app_store_click` draagt een `source` (`hero`, `close`, `dock`, `header`, `pricing`, `marketing_hero`), maar een event-parameter is pas via de Data API opvraagbaar als hij in GA4 als event-scoped custom dimension geregistreerd staat, en **dat werkt niet met terugwerkende kracht**. GA4 draait sinds 2026-09-08. Elke dag uitstel is een dag waarvan je nooit zult weten welke knop de klik leverde.
- **Er bestaat geen API voor het sterrengemiddelde.** `customerReviews` geeft alleen geschréven reviews; verreweg de meeste mensen geven sterren zonder tekst. Het gemiddelde over alleen de geschreven reviews is dus een ander getal dan wat er in de App Store staat. Het sterrencijfer komt daarom van de publieke `itunes.apple.com/lookup`, zonder sleutel en zonder versienummer, en kan dus zonder waarschuwing van vorm veranderen.
- **Drie sets sleutels in de omgeving**, elk met een eigen manier om te verlopen. App Store Connect: issuer ID, key ID, `.p8` en het vendornummer (niet het app-id). GA4: een service-account plus het **numerieke** property-id (niet `G-…`), met dat service-account als Viewer op de property. Meta: een **System User-token uit Business Manager**, want een long-lived user token verloopt na 60 dagen en dan staat er over twee maanden een keurige foutmelding waar een cijfer hoorde. Ontbreekt er één, dan valt alleen dat blok weg (beslissing 5).
- **De paginaload wordt trager en hangt van derden af.** Dertig Apple-aanroepen bij een koude cache passen niet in acht seconden; op zo'n eerste load valt het downloadblok weg en vult het zich op de volgende. Dat is lelijk maar zichtbaar, en dat is beter dan hangen.
- **De trechter is een ondergrens, geen exacte meting.** `app_store_click` vuurt alleen bij bezoekers die de cookiebanner accepteren, en Apple geeft dagtotalen en geen bezoekers. Je legt twee reeksen naast elkaar; je volgt geen individuele reis. Bij dertien accounts is bovendien één account ongeveer 17 procentpunt: de laatste twee stappen zijn voorlopig ruis, en het is een scherm waarop advertentiebeslissingen genomen worden. Lees ze pas als er tientallen accounts staan.
- **Drie tijdzones.** Apple rapporteert in Pacific, GA4 in de tijdzone van de property, Supabase in UTC. Op 7- en 30-daagse totalen wast dat grotendeels uit; daglijnen lopen tot een dag uit de pas. Rapportagetijdzone voor dit scherm is UTC, met Apple's dagen zoals Apple ze levert.
- **Feature flags blijven read-only op het scherm.** `lib/flags.ts` zijn build-time constanten; ze omzetten vanuit het dashboard zou betekenen dat ze naar de database verhuizen. Dat is een eigen beslissing en valt buiten deze TDR.

## Openstaande beslissing: `/admin` in productie

`/admin` geeft in productie een 404, want het zit in de `(protected)`-groep en die is dicht zolang `SHOW_WEB_APP` uit staat. Zolang dat zo blijft, is de hele premisse van deze TDR leeg: een cockpit die alleen op `pnpm dev` opengaat, is precies het scherm dat niet gebruikt wordt.

De eerdere schatting in dit document ("één regel in `app/(protected)/layout.tsx`") was fout: **een layout in de App Router krijgt geen pathname**, dus daar valt niets uit te zonderen. De twee werkende vormen zijn:

1. **`/admin` uit de `(protected)`-groep halen** naar een eigen routegroep met een eigen layout die alleen `requireAdminOrRedirect()` draait. De `(protected)`-gate blijft dan exact één regel en `/admin` staat los van de vlag. Dit is de schoonste vorm.
2. De gate naar `middleware.ts` verplaatsen, die de pathname wél kent en `SHOW_WEB_APP` al importeert.

Dit draait een consequentie van [TDR-0005](./0005-carve-wiki-is-een-marketingpagina.md) terug ("`/admin` gaat in productie mee dicht"), en is daarom een beslissing en geen implementatiedetail. De rolcontrole in `lib/admin/auth.ts` blijft er in beide vormen voor staan, dus openzetten betekent niet dat iemand anders erin kan. **Wacht op Furkan.**

## Hoe overrulen

Twee triggers, in de volgorde waarin ze zich waarschijnlijk voordoen.

1. **Latency of breuk.** Een paginaload die zo traag is of zo vaak een dood blok toont dat je het scherm niet meer opent. Dat komt eerder dan het historiegat, want dertig Apple-aanroepen en drie verlopende sleutels zijn dagelijkse kost.
2. **Een vraag over het verleden die onbeantwoordbaar blijkt.** Dit gaat over Apple en alleen over Apple, en het wordt onomkeerbaar rond 2027-09.

Het antwoord op de tweede is niet meteen een `metrics_daily`-tabel: begin bij het goedkope compromis uit de tabel hierboven (Apple's afgesloten dagen wegschrijven in `app_settings`, geen migratie, ongeveer tien regels). Pas als er ook op GA4 en Meta iets bewaard moet worden, is een eigen tabel met een cron de juiste vorm.

## Synchronisatie

- `lib/admin/sources/source.ts` ↔ elke bronmodule — de lijst env-namen staat naast de bron die ze leest, zodat een ontbrekende sleutel bij naam gemeld wordt (`.env.local` zelf is gitignored en dus niet valideerbaar als `@ai-sync`-doel)
- `lib/admin/queries.ts` ↔ de testaccount-filter — één definitie van "dit is geen echte gebruiker", door alle tellingen heen
- `lib/analytics.ts` (`app_store_click`) ↔ `lib/admin/sources/ga4.ts` — de eventnaam staat aan twee kanten en moet gelijk blijven
- `lib/navigation/admin-navigation.ts` ↔ `app/(protected)/admin/` — geen navigatie-item zonder route
