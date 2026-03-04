# Marketing 2-Column Layout Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a 2-column layout to all marketing pages with a sticky sidebar CTA panel, and add a prominent "Sign in" button to the header.

**Architecture:** Each marketing page wraps its content with a `MarketingPageLayout` component that provides the 2-col split. A `MarketingSidebar` component renders product-specific feature highlights and CTA, driven by a typed config. Middleware handles `/carve` → `/dashboard` redirect for authenticated users.

**Tech Stack:** Next.js App Router, Tailwind CSS, Framer Motion, Supabase Auth (middleware)

**Design doc:** `docs/plans/2026-03-04-marketing-2col-login-design.md`

---

### Task 1: Create MarketingSidebar component

**Files:**
- Create: `components/carve/MarketingSidebar.tsx`

**Step 1: Create the sidebar config and component**

```tsx
'use client';

import { Check } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

type SidebarConfig = {
  features: string[];
  accent: string;
  accentBg: string;
};

const SIDEBAR_CONFIG: Record<string, SidebarConfig> = {
  '/carve': {
    features: ['Track health & fitness', 'Manage your money', 'Plan your travels', 'Evidence-based wiki'],
    accent: 'text-white/70',
    accentBg: 'bg-white/10',
  },
  '/carve/health': {
    features: ['Track workouts', 'AI coaching', 'Compete on scoreboards', 'Rank progression'],
    accent: 'text-[#D4A843]',
    accentBg: 'bg-[#D4A843]/10',
  },
  '/carve/money': {
    features: ['Budget tracking', 'Spending insights', 'Financial goals', 'Smart categorization'],
    accent: 'text-blue-400',
    accentBg: 'bg-blue-400/10',
  },
  '/carve/travel': {
    features: ['Trip planning', 'Collect moments', 'Travel journal', 'Destination discovery'],
    accent: 'text-orange-400',
    accentBg: 'bg-orange-400/10',
  },
};

export function MarketingSidebar({ page }: { page: string }) {
  const config = SIDEBAR_CONFIG[page] || SIDEBAR_CONFIG['/carve'];

  return (
    <div className="flex flex-col items-start justify-center h-full px-8 lg:px-12">
      <div className="space-y-4 mb-10">
        {config.features.map((feature, i) => (
          <motion.div
            key={feature}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
            className="flex items-center gap-3"
          >
            <div className={`w-6 h-6 rounded-full ${config.accentBg} flex items-center justify-center flex-shrink-0`}>
              <Check className={`w-3.5 h-3.5 ${config.accent}`} />
            </div>
            <span className="text-sm text-white/60 font-medium">{feature}</span>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.7 }}
        className="w-full max-w-[240px] space-y-4"
      >
        <Link
          href="/signup"
          className="block w-full px-6 py-3 bg-white text-black rounded-xl font-semibold text-sm text-center hover:bg-white/90 transition-colors"
        >
          Get Started
        </Link>
        <p className="text-center text-sm text-white/30">
          Already have an account?{' '}
          <Link href="/login" className="text-white/50 hover:text-white transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
```

**Step 2: Verify no build errors**

Run: `npx next build --no-lint 2>&1 | tail -5` (or `npx tsc --noEmit`)
Expected: No errors related to MarketingSidebar

**Step 3: Commit**

```bash
git add components/carve/MarketingSidebar.tsx
git commit -m "feat: add MarketingSidebar component with config-driven features and CTA"
```

---

### Task 2: Create MarketingPageLayout wrapper

**Files:**
- Create: `components/carve/MarketingPageLayout.tsx`

**Step 1: Create the 2-column layout wrapper**

```tsx
'use client';

import { MarketingSidebar } from './MarketingSidebar';

interface MarketingPageLayoutProps {
  page: string;
  children: React.ReactNode;
}

export function MarketingPageLayout({ page, children }: MarketingPageLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-[#0A0A0B] text-white">
      {/* Mobile: sidebar above content */}
      <div className="lg:hidden pt-8 pb-4 px-6 border-b border-white/[0.04]">
        <MarketingSidebar page={page} />
      </div>

      {/* Desktop: 2-column layout */}
      <div className="flex">
        {/* Left column: marketing content, scrollable */}
        <div className="w-full lg:w-[65%]">
          {children}
        </div>

        {/* Right column: sticky sidebar */}
        <div className="hidden lg:block lg:w-[35%] border-l border-white/[0.04]">
          <div className="sticky top-4 h-[calc(100vh-5rem)]">
            <MarketingSidebar page={page} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Verify no build errors**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add components/carve/MarketingPageLayout.tsx
git commit -m "feat: add MarketingPageLayout 2-column wrapper with sticky sidebar"
```

---

### Task 3: Update /carve/money page

**Files:**
- Modify: `app/carve/money/page.tsx`

This is the simplest product page — use it as the template.

**Step 1: Wrap with MarketingPageLayout, remove App Store CTAs, reduce hero height**

Changes:
1. Import `MarketingPageLayout`
2. Replace outer `<div>` with `<MarketingPageLayout page="/carve/money">`
3. Change hero `min-h-[100dvh]` to `min-h-[60vh]`
4. Remove the App Store CTA in hero section (lines 46-59)
5. Remove the footer App Store CTA (lines 108-116), keep `<CarveFooter />`
6. Remove `overflow-y-auto` from any wrapper (layout handles scrolling)

The result should look like:
```tsx
'use client';

import { motion } from 'framer-motion';
import { Receipt, PiggyBank, TrendingUp } from 'lucide-react';
import { MoneyCard } from '@/components/carve/MoneyCard';
import { CarveFooter } from '@/components/carve/CarveFooter';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { MarketingPageLayout } from '@/components/carve/MarketingPageLayout';

export default function CarveMoneyPage() {
  return (
    <MarketingPageLayout page="/carve/money">
      {/* Hero Section */}
      <section className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-20 relative">
        {/* CARVE MONEY logo */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-7xl font-bold tracking-[0.3em] text-white mb-1"
        >
          CARVE
        </motion.h1>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-3xl md:text-5xl font-bold tracking-[0.3em] text-[#3B82F6] mb-3"
        >
          MONEY
        </motion.span>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg md:text-xl text-white/50 mb-12 font-light"
        >
          Know where your money goes
        </motion.p>

        <MoneyCard />
      </section>

      {/* Value Proposition — unchanged */}
      <section className="py-24 md:py-32 px-6">
        {/* ... keep existing content ... */}
      </section>

      {/* Footer */}
      <section className="py-24 md:py-32 px-6">
        <ScrollReveal animation="fade-up">
          <div className="text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-16 tracking-tight">
              Where does your money go?
            </h2>
            <CarveFooter />
          </div>
        </ScrollReveal>
      </section>
    </MarketingPageLayout>
  );
}
```

**Step 2: Verify build + visual check**

Run: `npx next build --no-lint 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add app/carve/money/page.tsx
git commit -m "feat: wrap /carve/money with 2-column layout, remove standalone CTAs"
```

---

### Task 4: Update /carve/health page

**Files:**
- Modify: `app/carve/health/page.tsx`

**Step 1: Apply same pattern as money page**

Changes:
1. Import `MarketingPageLayout`
2. Replace outer wrapper with `<MarketingPageLayout page="/carve/health">`
3. Change hero `min-h-[100dvh]` to `min-h-[60vh]`
4. Remove App Store CTA blocks from hero and footer
5. Remove `overflow-y-auto` and `min-h-screen w-full bg-[#0A0A0B] text-white` from the outer div (MarketingPageLayout handles this)

**Step 2: Verify build**

Run: `npx next build --no-lint 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add app/carve/health/page.tsx
git commit -m "feat: wrap /carve/health with 2-column layout, remove standalone CTAs"
```

---

### Task 5: Update /carve/travel page

**Files:**
- Modify: `app/carve/travel/page.tsx`

**Step 1: Apply same pattern**

Changes identical to Task 3/4:
1. Import `MarketingPageLayout`
2. Wrap with `<MarketingPageLayout page="/carve/travel">`
3. Hero `min-h-[100dvh]` → `min-h-[60vh]`
4. Remove App Store CTA blocks
5. Remove redundant outer div styles

**Step 2: Verify build**

Run: `npx next build --no-lint 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add app/carve/travel/page.tsx
git commit -m "feat: wrap /carve/travel with 2-column layout, remove standalone CTAs"
```

---

### Task 6: Update /carve main page

**Files:**
- Modify: `app/carve/page.tsx`

This page is more complex — it has `FounderStory`, `AIChatDemo`, `GamificationShowcase`, `PricingHub` components.

**Step 1: Wrap with MarketingPageLayout**

Changes:
1. Import `MarketingPageLayout`
2. Replace outer `<div className="min-h-screen w-full bg-[#0A0A0B] text-white overflow-y-auto">` with `<MarketingPageLayout page="/carve">`
3. Remove the App Store CTA in the closing section (lines 232-237)
4. Keep all other sections (`FounderStory`, `AIChatDemo`, `GamificationShowcase`, `PricingHub`) — they remain in the left column

**Step 2: Verify build**

Run: `npx next build --no-lint 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add app/carve/page.tsx
git commit -m "feat: wrap /carve main page with 2-column layout"
```

---

### Task 7: Add /carve → /dashboard redirect for authenticated users

**Files:**
- Modify: `middleware.ts`

**Step 1: Add redirect rule**

Add after the existing auth page redirect block (line 22):

```typescript
// Redirect authenticated users from /carve to dashboard
if (pathname === '/carve') {
  if (user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
}
```

**Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add middleware.ts
git commit -m "feat: redirect authenticated users from /carve to /dashboard"
```

---

### Task 8: Update header with prominent Sign in button

**Files:**
- Modify: `components/app/app-header.tsx`

**Step 1: Make the "Log in" link more prominent on marketing pages**

Change the existing login link (line 243-248) from plain text to a styled button when on marketing pages:

Replace:
```tsx
<Link
  href="/login"
  className="text-sm font-medium text-white/40 hover:text-white/70 transition-colors px-4 py-2"
>
  Log in
</Link>
```

With:
```tsx
{isMarketing ? (
  <Link
    href="/login"
    className="text-sm font-medium text-white bg-white/10 hover:bg-white/15 transition-colors px-4 py-2 rounded-lg"
  >
    Sign in
  </Link>
) : (
  <Link
    href="/login"
    className="text-sm font-medium text-white/40 hover:text-white/70 transition-colors px-4 py-2"
  >
    Log in
  </Link>
)}
```

**Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add components/app/app-header.tsx
git commit -m "feat: add prominent Sign in button on marketing header"
```

---

### Task 9: Visual QA and final adjustments

**Step 1: Run dev server and check all pages**

Run: `npm run dev`

Check these URLs:
- `http://localhost:3000/carve` — 2-col layout, CTA sidebar visible, hero reduced
- `http://localhost:3000/carve/health` — 2-col with health features in sidebar
- `http://localhost:3000/carve/money` — 2-col with money features in sidebar
- `http://localhost:3000/carve/travel` — 2-col with travel features in sidebar
- Resize browser to < 1024px — sidebar should move above content
- Log in → `/carve` should redirect to `/dashboard`

**Step 2: Fix any visual issues**

Potential adjustments:
- Sidebar vertical centering
- Hero section spacing in narrower left column
- Mobile sidebar padding/spacing
- Border opacity between columns

**Step 3: Final commit**

```bash
git add -A
git commit -m "fix: visual polish for marketing 2-column layout"
```
