# Carve Travel — Design Document

**Datum:** 2026-02-27
**Status:** Goedgekeurd

---

## 1. Product Overview

Carve Travel is een AI-gestuurd reisplanningsmodule binnen het Carve dashboard, op hetzelfde niveau als Carve Health en Carve Money. Solo-reizigers beschrijven in een chat wat voor reis ze willen, de AI stelt vervolgvragen en genereert een compleet visueel reisplan met dagplanning, accommodatiesuggesties en budgetoverzicht.

**Kernwaarde:** Van idee naar compleet reisplan in 2 minuten.

**Route:** `/dashboard/travel/` met eigen sidebar-navigatie en teal kleuraccent (`#b8d8e8`).

**Scope v1:**

- AI-gesprek → reisplan generatie (Claude API)
- Visueel dashboard met dagplanning, Mapbox kaart, accommodatielinks en budget
- Plan bewerken en herplannen via AI ("Dag 3 regent, geef alternatieven")
- Gekoppeld aan bestaand Carve auth systeem (profiles)
- Opgeslagen reisplannen per gebruiker

**Buiten scope v1:**

- Stripe/betalingen (komt later op Carve platform-niveau)
- Boekingen maken (alleen linken naar Booking/Skyscanner)
- Sociale features (delen, groepsplanning)
- Inspiratie/ontdekking feed

**Verschil met bestaande modules:**

- Health = track workouts & voeding
- Money = track uitgaven & abonnementen
- Travel = AI plant je reizen

---

## 2. Gebruikers Flow

### Nieuwe trip

1. Gebruiker navigeert naar `/dashboard/travel/`
2. Klikt "Plan een reis" → opent `/dashboard/travel/new`
3. Split-screen: chat links, plan rechts (leeg)
4. AI opent met: "Waar wil je naartoe? Vertel me over je droomreis."
5. Gebruiker beschrijft reis: "5 dagen Barcelona, budget €800"
6. AI stelt max 3 vervolgvragen (reistijl, accommodatievoorkeur, must-sees)
7. AI genereert compleet plan → verschijnt rechts als visueel dashboard
8. Gebruiker kan tweaken, opslaan

### Terugkerende gebruiker

1. `/dashboard/travel/` toont overzicht van opgeslagen trips
2. Klik op trip → `/dashboard/travel/[id]` met het volledige plan
3. Herplannen: chat openen, beschrijf wat anders moet → AI regenereert alleen dat deel

### Sidebar navigatie (CARVE TRAVEL groep)

- Dashboard — overzicht opgeslagen trips
- New Trip — nieuwe reis plannen

---

## 3. AI Conversatie & Plan Generatie

### Chat-systeem

- Split-screen: chat links, plan rechts
- Streaming responses via Vercel AI SDK voor real-time gevoel
- AI opent met welkomstbericht, stelt max 3 gerichte vervolgvragen:
  - Reistijl (relaxed/avontuurlijk/cultureel/mix)
  - Accommodatievoorkeur (hostel/budget/mid-range/luxe)
  - Must-sees of must-avoids

### Plan generatie

- Claude API met structured output (JSON) — geen vrije tekst
- Per dag: ochtend/middag/avond activiteiten met tijden, locaties (lat/lng), geschatte kosten
- Accommodatie: 2-3 suggesties per prijsklasse met links naar Booking
- Budget: totaaloverzicht per categorie (accommodatie, eten, activiteiten, vervoer)

### Herplannen

- Gebruiker selecteert dag of activiteit, beschrijft wat anders moet
- AI regenereert alleen dat deel, rest blijft intact
- Voorbeeld: "Dag 2 wil ik iets actiefs" → AI vervangt alleen dag 2
- Chat-geschiedenis wordt bewaard voor context

### AI configuratie

- Claude API (Anthropic) via Vercel AI SDK
- System prompt met reisplanning-expertise, lokale kennis, output format
- Structured output via tool use voor betrouwbare JSON

---

## 4. Visueel Dashboard

### Layout

- Split-screen: chat links (inklapbaar), plan rechts
- Na generatie kan chat ingeklapt worden voor volledig scherm dashboard

### Dagplanning (hoofdelement)

- Horizontale tabs per dag (Dag 1, Dag 2, etc.)
- Per dag een tijdlijn met ochtend/middag/avond blokken
- Elk blok: activiteit, tijd, locatie, geschatte kosten
- Klikbaar voor details, drag & drop om te herschikken

### Kaart (Mapbox)

- Dark map style passend bij Carve thema
- Pins per activiteit, kleur per dag
- Klik op pin → highlight in dagplanning en vice versa
- Route-lijnen tussen activiteiten van dezelfde dag

### Accommodatie

- Kaart met 2-3 suggesties per prijsklasse
- Naam, prijs per nacht, rating, afstand tot centrum
- Directe link naar Booking.com

### Budget

- Totaal budget bovenaan met voortgangsbalk (€420 / €600 gepland)
- Breakdown per categorie: accommodatie, eten, activiteiten, vervoer
- Per dag zichtbaar hoeveel je uitgeeft
- Waarschuwing als je over budget gaat

### Responsiveness

- Desktop: split-screen chat + dashboard
- Tablet: chat als overlay
- Mobiel: tabbed navigatie (chat / planning / kaart / budget)

---

## 5. Technische Architectuur

### Integratie in carve.w

- Route: `/dashboard/travel/` binnen bestaande `(protected)` groep
- Eigen layout met teal accent (`#b8d8e8`)
- Eigen sidebar navigatie (`lib/navigation/travel-navigation.ts`)
- Sidebar controller herkent `/dashboard/travel/*` routes en schakelt naar travel-navigatie

### Nieuwe bestanden

```
app/(protected)/dashboard/travel/
├── page.tsx                    # Trip overzicht
├── layout.tsx                  # Travel layout (teal accent)
├── loading.tsx
├── error.tsx
├── new/page.tsx                # Chat + plan generatie
└── [id]/page.tsx               # Bestaand plan bekijken/bewerken

components/travel/
├── shared/
│   ├── TravelCard.tsx          # Card wrapper
│   └── index.ts
├── widgets/
│   ├── DayTimeline.tsx         # Dagplanning tijdlijn
│   ├── TripMap.tsx             # Mapbox kaart
│   ├── BudgetOverview.tsx      # Budget breakdown
│   ├── AccommodationCard.tsx   # Accommodatie suggesties
│   └── TripCard.tsx            # Trip preview kaart
├── chat/
│   ├── TravelChat.tsx          # Chat interface
│   ├── ChatMessage.tsx         # Individueel bericht
│   └── ChatInput.tsx           # Input veld
└── plan/
    └── PlanDashboard.tsx       # Hoofd dashboard compositie

lib/
├── ai/
│   ├── travel-client.ts        # Claude API client
│   ├── travel-prompts.ts       # System prompts
│   └── travel-schemas.ts       # Structured output schemas
└── navigation/
    └── travel-navigation.ts    # Sidebar navigatie

app/api/
├── travel/
│   ├── chat/route.ts           # AI conversatie (streaming)
│   ├── trips/route.ts          # CRUD trips
│   └── trips/[id]/
│       └── replan/route.ts     # Herplannen
```

### Database (Supabase migraties)

| Tabel | Doel |
|---|---|
| `trips` | Reisplannen (titel, bestemming, data, budget, status, user_id FK naar profiles) |
| `trip_days` | Dagen per trip (dagnummer, datum) |
| `trip_activities` | Activiteiten per dag (tijd, naam, locatie, lat/lng, kosten, categorie) |
| `trip_accommodations` | Suggesties per trip (naam, prijs, url, rating, prijsklasse) |
| `trip_conversations` | Chat geschiedenis per trip (voor herplan-context) |

### Auth

- Gebruikt bestaand Supabase Auth + profiles systeem
- RLS op alle travel-tabellen: `user_id = auth.uid()`

### API's

- Claude API via Vercel AI SDK (streaming)
- Mapbox GL JS (dark style)
- Links naar Booking.com (geen API integratie)

---

## 6. Beveiliging & Limieten

### Auth & autorisatie

- Bestaand Carve auth systeem — geen aparte login
- RLS op alle travel-tabellen: `user_id = auth.uid()`
- API routes valideren sessie via `supabase.auth.getUser()`

### Rate limiting

- AI chat endpoint: max 20 requests per uur per gebruiker
- Plan generatie: max 5 per uur per gebruiker
- Herplannen: max 10 per uur per gebruiker

### API keys

- `ANTHROPIC_API_KEY` alleen server-side
- `NEXT_PUBLIC_MAPBOX_TOKEN` client-side (publieke token, beperkt via Mapbox dashboard)
- Geen secrets in client bundle

### Data

- Chat gesprekken opgeslagen voor herplan-context
- Gebruiker kan trips verwijderen
- Data-verwijdering volgt bestaand Carve GDPR beleid
