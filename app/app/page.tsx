import { CarveMarketingPage } from '@/components/carve/CarveMarketingPage'
import { APP_STORE_URL } from '@/lib/utils'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://carve.wiki'

// @ai-why: Deze pagina stond tot 2026-09-09 op `/` (TDR-0005) en woont sinds TDR-0007
// op `/app`; `/` stuurt er permanent heen. De reden is een adres dat zegt wat het is,
// nu `/chat` de cockpit is en daar een ingang naar deze pagina hoort. De prijs is een
// extra hop voor advertentieverkeer; dat was in TDR-0005 juist het argument om te
// blijven, en het staat als consequentie in TDR-0007.
// @ai-gotcha: `LandingPage`, `DomainPicker`, `DomainCardLink` en `lib/domains.ts`
// hebben hiermee geen lezer meer. Bewust niet verwijderd; zie TDR-0005.
//
// @ai-gotcha: Hier stond een eigen `openGraph: { title, description }`. Dat blok
// VERVING het `openGraph` van de root-layout in plaats van het aan te vullen, en daarmee
// ook de `images` die `app/opengraph-image.tsx` daar injecteert. Gevolg: `/carve` en
// `/support` kregen wél een `og:image` en `/` niet — precies de URL die gedeeld wordt.
// Gemeten op 2026-09-05 met een `fetch` op de dev-server; in de code is het niet te zien,
// want een ontbrekende voorvertoning geeft geen fout. Zet hier dus geen `openGraph`-object
// neer zonder `images` mee te nemen; de belofte staat al in de root-layout.
// @ai-sync: app/layout.tsx (title, description, openGraph)
// @ai-sync: next.config.ts (/ en /carve sturen hierheen door)
// @ai-sync: docs/tdr/0007-de-marketingpagina-verhuist-naar-app.md
export const metadata = {
  title: 'Carve AI — Fitness Coach',
  description: 'Logs your food from a photo. Tracks the muscles you are skipping. Built by someone who lost 50kg using it.',
}

// @ai-why: Er stond geen structured data op de pagina, dus Google wist niet dat carve.wiki
// over een app gaat. Zonder `MobileApplication` blijft de treffer een gewone blauwe link,
// terwijl elke concurrent in dit vak wél een app-resultaat krijgt. Gecontroleerd op
// 2026-09-07: geen `application/ld+json` in de productie-HTML.
//
// @ai-why: Bewust géén `aggregateRating`. Dat veld is de enige reden dat Google er sterren
// bij zet, en precies daarom is de verleiding groot om er een getal in te zetten dat je
// niet hebt. Verzonnen recensiecijfers zijn een handmatige strafmaatregel waard en de
// pagina bewijst zichzelf al met de 50 kilo. Komt er ooit een echt gemiddelde uit App
// Store Connect, dan mag het erbij — met `ratingCount` uit dezelfde bron.
//
// @ai-gotcha: `offers.price` staat op 0 omdat de download gratis is. Dat is niet hetzelfde
// als "geen abonnement": Pro loopt via in-app aankopen en die horen hier niet als prijs.
// Zet hier dus geen abonnementsbedrag neer, dan claim je dat de app geld kost om te
// installeren.
//
// @ai-sync: components/carve/CarveMarketingPage.tsx (dezelfde belofte en dezelfde prijsuitleg)
// @ai-sync: lib/utils.ts (APP_STORE_URL)
const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'MobileApplication',
  name: 'Carve AI',
  alternateName: 'Carve',
  applicationCategory: 'HealthAndFitnessApplication',
  operatingSystem: 'iOS',
  url: `${SITE_URL}/app`,
  installUrl: APP_STORE_URL,
  sameAs: [APP_STORE_URL],
  image: `${SITE_URL}/opengraph-image`,
  description: metadata.description,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
  },
  author: {
    '@type': 'Organization',
    name: 'Carve AI',
    url: `${SITE_URL}/app`,
    address: { '@type': 'PostalAddress', addressLocality: 'Amsterdam', addressCountry: 'NL' },
  },
}

export default function AppPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <CarveMarketingPage />
    </>
  )
}
