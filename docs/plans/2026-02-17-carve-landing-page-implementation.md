# Carve Landing Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current /carve page with a dark, brand-aligned marketing landing page featuring a mock scoreboard card as the hero element.

**Architecture:** Single page component (`app/[locale]/carve/page.tsx`) with extracted sub-components for the scoreboard card and phone mockups. Uses framer-motion for entrance animations and the existing ScrollReveal component for scroll-triggered reveals. Dark theme throughout, matching the iOS app's visual identity.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS 4, framer-motion, lucide-react

**Design doc:** `docs/plans/2026-02-17-carve-landing-page-design.md`

---

## Context

### App Shell
- Pages render inside `LayoutWrapper` with header (64px) + sidebar + `AppContent`
- `/carve` is an edge-to-edge route (no padding, no white bg from AppContent)
- AppContent still applies: `rounded-xl border border-gray-300 shadow-sm overflow-hidden`
- Page controls its own background color
- Sidebar shows carve navigation (Roadmap, Vision, FAQ, etc.)

### Available Assets
- App screenshots (dark theme) in `public/screenshots/` — need to be updated with new dark versions
- The user provided 4 dark screenshots via conversation (dashboard, diary, workout, profile)
- Logo: `public/carvewikilogo.png`

### Available Components
- `ScrollReveal`, `StaggerContainer`, `StaggerItem` from `components/ui/scroll-reveal.tsx`
- `framer-motion` (v12) installed
- `lucide-react` (v0.553) installed

### Brand Rules (from docs/BRAND_STORY.md)
- Dark canvas, gold (#D4A843) accent for ranking, green for positive
- No cheerleader/RPG/motivational language
- "Gamify the system, not the language"
- Short, factual, direct copy
- Premium = less, not more

---

## Task 1: Save dark app screenshots

**Files:**
- Create: `public/screenshots/dark-dashboard.png`
- Create: `public/screenshots/dark-diary.png`
- Create: `public/screenshots/dark-workout.png`
- Create: `public/screenshots/dark-profile.png`

**Step 1:** Copy the 4 dark screenshots the user provided to `public/screenshots/` with the `dark-` prefix. The source files are:
- `~/Desktop/Simulator Screenshot - iPhone Air - 2026-02-13 at 00.13.47.png` → `dark-dashboard.png`
- `~/Desktop/Simulator Screenshot - iPhone Air - 2026-02-13 at 00.13.52.png` → `dark-diary.png`
- `~/Desktop/Simulator Screenshot - iPhone Air - 2026-02-13 at 00.13.57.png` → `dark-workout.png`
- `~/Desktop/Simulator Screenshot - iPhone Air - 2026-02-14 at 00.14.00.png` → `dark-profile.png`

> Note: The exact source paths may vary. Ask the user to confirm or use the paths from the conversation images.

**Step 2:** Verify files are accessible:
```bash
ls -la public/screenshots/dark-*.png
```

---

## Task 2: Build the ScoreboardCard component

**Files:**
- Create: `components/carve/ScoreboardCard.tsx`

**Step 1:** Create the mock scoreboard card component that looks like it came from the app:

```tsx
'use client';

import { motion } from 'framer-motion';
import { BarChart3, Dumbbell, Flame, Footprints } from 'lucide-react';

const RANKS = ['Legend', 'Master', 'Elite', 'Advanced', 'Intermediate', 'Beginner', 'Rookie'] as const;
const ACTIVE_RANK_INDEX = 5; // Beginner (0-indexed from top)

export function ScoreboardCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className="w-full max-w-sm mx-auto"
    >
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm p-6 space-y-5">
        {/* Season + Rank header */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/30 mb-1">
            Season 1
          </p>
          <div className="flex items-baseline justify-between">
            <h3 className="text-3xl font-bold text-white">Beginner</h3>
            <span className="text-lg font-bold text-[#D4A843]">148 pts</span>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-1 bg-white/[0.08] rounded-full overflow-hidden">
            <div className="h-full w-[35%] bg-[#D4A843] rounded-full" />
          </div>
        </div>

        {/* World Ranking */}
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5 text-white/40" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/40">
                World Ranking
              </span>
            </div>
          </div>
          <div className="space-y-1.5">
            {RANKS.map((rank, i) => (
              <div
                key={rank}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm ${
                  i === ACTIVE_RANK_INDEX
                    ? 'bg-white/[0.08] text-white font-medium'
                    : 'text-white/25'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  i === ACTIVE_RANK_INDEX ? 'bg-[#D4A843]' : 'border border-white/20'
                }`} />
                {rank}
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="mt-4 pt-3 border-t border-white/[0.08] grid grid-cols-3 text-center">
            <Stat icon={<Dumbbell className="w-3.5 h-3.5" />} value="23" label="Workouts" />
            <Stat icon={<Flame className="w-3.5 h-3.5" />} value="47" label="Streak" />
            <Stat icon={<Footprints className="w-3.5 h-3.5" />} value="12.4K" label="Steps" />
          </div>
        </div>

        {/* Percentile */}
        <div className="text-center">
          <p className="text-white/50 text-sm">
            <span className="text-white font-medium">#312</span>
            {' '}&middot;{' '}
            <span className="text-[#D4A843] font-medium">Top 3%</span>
            {' '}worldwide
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-center text-white/30">{icon}</div>
      <p className="text-white font-bold text-lg">{value}</p>
      <p className="text-white/40 text-[11px]">{label}</p>
    </div>
  );
}
```

**Step 2:** Verify it compiles:
```bash
cd "/Users/furkanceliker/Celiker Studio/Carve/carve.wiki" && npx next lint --file components/carve/ScoreboardCard.tsx
```

---

## Task 3: Build the PhoneShowcase component

**Files:**
- Create: `components/carve/PhoneShowcase.tsx`

**Step 1:** Create a component that renders 3 phone mockups with app screenshots:

```tsx
'use client';

import Image from 'next/image';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

const SCREENS = [
  { src: '/screenshots/dark-dashboard.png', alt: 'Dashboard' },
  { src: '/screenshots/dark-diary.png', alt: 'Diary' },
  { src: '/screenshots/dark-workout.png', alt: 'Workout' },
] as const;

export function PhoneShowcase() {
  return (
    <div className="flex gap-6 justify-center items-center overflow-x-auto px-6 pb-4 snap-x snap-mandatory md:snap-none md:overflow-visible">
      {SCREENS.map((screen, i) => (
        <ScrollReveal
          key={screen.alt}
          animation="fade-up"
          delay={i * 0.15}
          className="flex-shrink-0 snap-center"
        >
          <PhoneFrame src={screen.src} alt={screen.alt} />
        </ScrollReveal>
      ))}
    </div>
  );
}

function PhoneFrame({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative w-[220px] md:w-[260px]">
      {/* Phone bezel */}
      <div className="relative bg-gray-900 rounded-[2.5rem] p-[3px] shadow-2xl shadow-black/50 ring-1 ring-white/[0.08]">
        {/* Screen */}
        <div className="bg-black rounded-[2.3rem] overflow-hidden aspect-[9/19.5] relative">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            sizes="260px"
          />
          {/* Home indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10">
            <div className="w-24 h-1 bg-white/30 rounded-full" />
          </div>
        </div>
        {/* Side buttons */}
        <div className="absolute -left-[2px] top-24 w-[2px] h-6 bg-gray-700 rounded-l-sm" />
        <div className="absolute -left-[2px] top-36 w-[2px] h-12 bg-gray-700 rounded-l-sm" />
        <div className="absolute -left-[2px] top-52 w-[2px] h-12 bg-gray-700 rounded-l-sm" />
        <div className="absolute -right-[2px] top-32 w-[2px] h-16 bg-gray-700 rounded-r-sm" />
      </div>
    </div>
  );
}
```

---

## Task 4: Replace the /carve page

**Files:**
- Modify: `app/[locale]/carve/page.tsx` (full replacement)

**Step 1:** Replace the entire file with the new landing page:

```tsx
'use client';

import { motion } from 'framer-motion';
import { Dumbbell, BarChart3, Users, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { ScoreboardCard } from '@/components/carve/ScoreboardCard';
import { PhoneShowcase } from '@/components/carve/PhoneShowcase';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

export default function CarvePage() {
  return (
    <div className="min-h-full w-full bg-[#0A0A0B] text-white overflow-y-auto">
      {/* Hero Section */}
      <section className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-20 relative">
        {/* CARVE logo */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-7xl font-bold tracking-[0.3em] text-white mb-3"
        >
          CARVE
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-white/50 mb-12 font-light"
        >
          Fitness with a scoreboard
        </motion.p>

        {/* Scoreboard Card */}
        <ScoreboardCard />

        {/* App Store CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="mt-10 flex flex-col items-center gap-3"
        >
          <div className="px-6 py-3 bg-white text-black rounded-xl font-semibold text-sm flex items-center gap-2 opacity-80 cursor-default">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Download on the App Store
          </div>
          <p className="text-white/30 text-sm">Coming Spring 2026</p>
        </motion.div>
      </section>

      {/* Value Proposition */}
      <section className="py-24 md:py-32 px-6">
        <ScrollReveal animation="fade-up">
          <h2 className="text-3xl md:text-5xl font-bold text-center text-white mb-16 tracking-tight">
            Track. Rank. Compete.
          </h2>
        </ScrollReveal>

        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-4">
          {[
            {
              icon: <Dumbbell className="w-5 h-5" />,
              title: 'Track',
              text: 'Log meals and workouts in seconds.',
            },
            {
              icon: <BarChart3 className="w-5 h-5" />,
              title: 'Rank',
              text: 'Climb from Rookie to Legend.',
            },
            {
              icon: <Users className="w-5 h-5" />,
              title: 'Compete',
              text: 'Play with friends. See who\'s on top.',
            },
          ].map((card, i) => (
            <ScrollReveal key={card.title} animation="fade-up" delay={i * 0.1}>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-6 h-full">
                <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/50 mb-4">
                  {card.icon}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{card.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{card.text}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* App Screenshots */}
      <section className="py-24 md:py-32">
        <ScrollReveal animation="fade">
          <PhoneShowcase />
        </ScrollReveal>
      </section>

      {/* Footer CTA */}
      <section className="py-24 md:py-32 px-6">
        <ScrollReveal animation="fade-up">
          <div className="text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 tracking-tight">
              Where do you rank?
            </h2>
            <div className="flex flex-col items-center gap-3 mb-16">
              <div className="px-6 py-3 bg-white text-black rounded-xl font-semibold text-sm flex items-center gap-2 opacity-80 cursor-default">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Download on the App Store
              </div>
              <p className="text-white/30 text-sm">Coming Spring 2026</p>
            </div>

            {/* Footer links */}
            <div className="border-t border-white/[0.08] pt-8">
              <div className="flex flex-wrap justify-center gap-6 text-sm text-white/30 mb-6">
                <Link href="/carve/roadmap" className="hover:text-white/60 transition-colors">Roadmap</Link>
                <Link href="/carve/vision" className="hover:text-white/60 transition-colors">Vision</Link>
                <Link href="/carve/faq" className="hover:text-white/60 transition-colors">FAQ</Link>
                <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
                <Link href="/terms" className="hover:text-white/60 transition-colors">Terms</Link>
              </div>
              <p className="text-white/20 text-xs">
                2026 Carve AI &middot; Amsterdam
              </p>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
```

**Step 2:** Verify the dev server compiles without errors:
```bash
cd "/Users/furkanceliker/Celiker Studio/Carve/carve.wiki" && npx next lint
```

**Step 3:** Check the page in the browser at `http://localhost:3000/nl/carve`

---

## Task 5: Visual review and refinements

**Step 1:** Open `http://localhost:3000/nl/carve` in the browser and review:
- [ ] Hero section: CARVE logo, tagline, scoreboard card visible and centered
- [ ] Scoreboard card matches app styling (dark cards, gold accent, ranking ladder)
- [ ] Staggered entrance animation plays on load
- [ ] Value proposition section: three cards render correctly
- [ ] Phone screenshots: three phones visible on desktop, scrollable on mobile
- [ ] Footer CTA: "Where do you rank?" + App Store badge + links
- [ ] All text follows brand voice (no cheerleader/RPG language)
- [ ] Dark background fills entire content area
- [ ] Responsive: check at 375px, 768px, 1280px widths

**Step 2:** Fix any visual issues found during review.

**Step 3:** Commit:
```bash
git add app/[locale]/carve/page.tsx components/carve/ScoreboardCard.tsx components/carve/PhoneShowcase.tsx public/screenshots/dark-*.png
git commit -m "feat(carve): redesign landing page with dark scoreboard hero"
```

---

## Task 6: Clean up unused imports

**Files:**
- Check: `components/carve/HowItWorksWithPhone.tsx` — keep file (used elsewhere? check first)
- Check: `components/ui/scroll-expansion-hero.tsx` — still used elsewhere?

**Step 1:** Search for imports of removed components:
```bash
grep -r "ScrollExpandMedia\|HowItWorksWithPhone" --include="*.tsx" --include="*.ts" app/ components/ | grep -v node_modules | grep -v .next
```

**Step 2:** If `HowItWorksWithPhone` is only imported by the old carve page, note it but don't delete (it's a good component that might be reused).

**Step 3:** If `ScrollExpandMedia` is only imported by the old carve page, same — keep but note.

No commit needed for this task (just verification).

---

## Notes

- The AppContent wrapper applies `rounded-xl border border-gray-300` around the page. The dark page inside this light border creates a framed effect. If this looks bad, we may need to override AppContent's border for the /carve route. Evaluate during Task 5.
- Screenshots need to be the actual simulator screenshots from the user's desktop. Paths may need adjustment.
- The App Store button is intentionally non-interactive (no link) with `cursor-default` and reduced opacity since the app isn't live yet. When it launches, wrap it in an `<a>` tag with the store URL.
