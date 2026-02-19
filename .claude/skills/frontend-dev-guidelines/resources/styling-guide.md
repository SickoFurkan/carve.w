# Carve Design Language

Donker, rustig, laat de data spreken.

---

## Core Philosophy

- **Apple-achtige rust**: veel ademruimte, zachte rondingen, minimaal contrast tussen lagen
- **Premium = terughoudendheid**: als iets er "schreeuwerig" of template-achtig uitziet, is het fout
- **Data is de visual**: grote nummers, ranks, streaks — niet illustraties of decoratie
- **Monochroom + accent > multicolor**: kleur is schaars en betekenisvol

---

## Depth & Layers

Gebruik lagen van donker naar iets lichter om hiërarchie te tonen. Elk niveau is maar een fractie lichter dan het vorige — net genoeg om verschil te zien.

| Laag | Rol | Richtlijn |
|------|-----|-----------|
| Shell | App frame, sidebar | Donkerste tint |
| Content | Hoofdgebied | Iets lichter dan shell |
| Card | Containers, widgets | Solide achtergrond, iets lichter dan content |
| Elevated | Modals, popovers, overlays | Mag glassmorphism gebruiken |

**Borders**: dun, lage opacity wit. Genoeg om te scheiden, niet genoeg om op te vallen.

---

## Color & Accent

- De app is overwegend monochroom donker
- Elke product-sectie (Health, Money, Wiki) mag één eigen subtiel accent hebben
- Het accent moet warm/neutraal aanvoelen — nooit fel of verzadigd
- Statuskleur (groen voor positief, rood voor negatief) mag wel verzadigd zijn — dat is functioneel
- Eén accent per context. Nooit meerdere felle kleuren naast elkaar

### Sectie Accenten

Sectie-accenten zijn subtiel en warm. Ze vallen op door helderheid en warmte, niet door kleurverzadiging. Gebruik ze alleen voor de active state in navigatie en af en toe als highlight — niet als dominante kleur.

---

## Typography

| Element | Stijl | Rol |
|---------|-------|-----|
| Grote waarden | Bold, wit, groot | Trekt het oog — bedragen, scores, stats |
| Labels | Klein, uppercase, tracked, gedempt | Ondersteunt, concurreert niet |
| Secundaire tekst | Grijs (geen wit + lage opacity) | Voorkomt bleed-through op gekleurde achtergronden |
| Links/acties | Accent kleur of subtiel lichter | Klikbaar maar niet schreeuwerig |

---

## Glassmorphism

Glassmorphism mag, maar alleen correct gebruikt:

**Wanneer wel:**
- Modals, sheets, drawers — elementen die boven content zweven
- Floating panels, dropdown menus, command palettes
- Overlays die een achtergrond-context behouden

**Wanneer niet:**
- Inline cards die met de layout meebewegen
- Elementen die resizen bij layout changes (veroorzaakt GPU recompositing = flicker)
- Decoratief zonder functioneel doel

**Hoe:**
- Subtiel: lichte blur + dunne border + lage opacity
- Nooit overdreven melkglas-effect
- Combineer met een semi-transparante achtergrondkleur als fallback

---

## Navigation & Active States

- Active item: accent kleur + subtiele achtergrond highlight
- Geen linker borders, underlines of dikke indicators — die voelen goedkoop
- De meest specifieke route match wint altijd (voorkom dubbele highlights)
- Inactive items zijn gedempt, hover maakt ze iets lichter — niet wit
- Active state wisselt instant (geen `transition-colors`), hover mag subtiel transitioneren

---

## Interaction & Animation

- Layout mag nooit springen door animaties
- Sidebar expand/collapse: gebruik `will-change` hint, transition alleen `width`
- Vermijd `AnimatePresence mode="wait"` op navigatie — veroorzaakt fade-out/fade-in flicker
- Hover states: subtiele achtergrondkleur shift, nooit dramatische kleurveranderingen
- Vermijd animaties die GPU-recompositing van blur/shadow elementen triggeren bij layout reflow

---

## Cards & Containers

- Solide achtergrondkleur, geen transparantie voor inline cards
- Zachte rondingen (`rounded-xl` / `rounded-2xl`)
- Dunne border met lage opacity voor scheiding
- Ruime padding — liever te veel dan te weinig
- Geen zware box-shadows — diepte komt van kleurverschil, niet van schaduw

---

## Responsive Design

- Mobile-first: begin met de smalle layout, voeg complexiteit toe met breakpoints
- Cards stapelen verticaal op mobiel, grid op desktop
- Sidebar alleen op desktop (`hidden lg:flex`)
- Padding schaalt: kleiner op mobiel, groter op desktop

---

## What Not To Do

- `backdrop-blur` op inline elementen die bij layout reflow betrokken zijn
- Felle verzadigde accent kleuren die eruitzien als een fintech template
- Meerdere concurrerende accent kleuren op dezelfde pagina
- `transition-colors` op active state toggles (veroorzaakt flicker)
- Decoratieve elementen die geen informatie dragen
- Wit met lage opacity als tekstkleur (gebruik een specifieke grijstint)
- Zware box-shadows op donkere achtergronden (voegt niets toe)
