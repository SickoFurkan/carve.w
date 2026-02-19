---
name: frontend-dev-guidelines
description: Frontend development guidelines for Carve - Next.js App Router, Tailwind CSS, shadcn/ui, Supabase. Modern dark aesthetic inspired by Apple's design language — restrained, data-focused, premium. Use when creating components, pages, styling, data fetching, or working with frontend code.
---

# Carve Frontend Development Guidelines

## Design Language

Dark, restrained, Apple-inspired. Premium means less, not more. See [styling-guide.md](resources/styling-guide.md) for the full design philosophy.

---

## Tech Stack

- **Framework**: Next.js 15 App Router
- **Styling**: Tailwind CSS v4 (utility-first)
- **Components**: shadcn/ui (Radix primitives)
- **Database**: Supabase (server-side preferred)
- **Animation**: Framer Motion (use sparingly)
- **Types**: TypeScript strict mode

---

## Project Structure

```
app/
  (protected)/
    dashboard/
      page.tsx                 # Health dashboard
      money/
        page.tsx               # Money dashboard
        analytics/
        subscriptions/
        transactions/
      layout.tsx
  (wiki-home)/
  wiki/
  carve/                       # Marketing pages
  auth/
  layout.tsx                   # Root layout

components/
  app/                         # App shell, sidebar, header
    app-sidebar-controller.tsx
    app-header.tsx
    layout-wrapper.tsx
    app-shell.tsx
  money/                       # Money section components
    shared/                    # MoneyCard, ChangeBadge, etc.
    widgets/                   # SubscriptionTimeline, etc.
  dashboard/
    widgets/
      shared/                  # DarkCard, WidgetCard
  ui/                          # shadcn/ui primitives
  icons/                       # SVG icon components

lib/
  navigation/                  # Sidebar nav configs per section
  supabase/
    server.ts                  # Server-side Supabase client
    client.ts                  # Client-side Supabase client
  utils.ts                     # cn() and helpers
```

---

## Component Conventions

**Server Components by default.** Only add `'use client'` when you need interactivity (event handlers, hooks, browser APIs).

```typescript
// Server Component (default)
interface WidgetProps {
  userId: string;
}

export async function MyWidget({ userId }: WidgetProps) {
  const supabase = createClient();
  const { data } = await supabase.from('table').select('*').eq('user_id', userId);

  return (
    <div className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-5">
      <h3 className="text-lg font-semibold text-white">{data.title}</h3>
    </div>
  );
}
```

```typescript
// Client Component (only when needed)
'use client';

import { useState, useCallback } from 'react';

interface CounterProps {
  initial: number;
}

export function Counter({ initial }: CounterProps) {
  const [count, setCount] = useState(initial);
  const increment = useCallback(() => setCount((c) => c + 1), []);

  return <button onClick={increment}>{count}</button>;
}
```

**Rules:**
- Plain function components, not `React.FC`
- Props interface defined above the component
- `useCallback` for event handlers passed to children
- No early returns with loading spinners — use ternary with skeleton states

---

## Loading States

**Never early return with a spinner.** This causes layout shift.

```typescript
// WRONG
if (isLoading) return <Spinner />;

// RIGHT — maintain layout dimensions
<div className="min-h-[400px]">
  {isLoading ? <Skeleton /> : <Content />}
</div>
```

For Server Components, use `<Suspense>` with a fallback that matches the content dimensions.

---

## Navigation

Sidebar navigation is configured per section in `lib/navigation/`. The `AppSidebarController` picks the right config based on pathname.

**Adding a nav item:** edit the relevant file in `lib/navigation/` (e.g., `money-navigation.ts`).

**Active state:** uses most-specific route matching — `/dashboard/money/transactions` highlights Transactions, not Dashboard.

---

## Performance Guidelines

- Server Components by default (less JS shipped)
- No `backdrop-blur` on inline elements that reflow with layout (causes GPU flicker)
- Use `will-change` hint on elements with width/height transitions
- Active state changes must be instant (no `transition-colors`)
- Hover transitions are fine but keep them subtle
- Dynamic import heavy components: `const Heavy = dynamic(() => import('./Heavy'))`
- Always use Next.js `Image` for images

---

## Supabase Data Fetching

**Server-side (preferred):**
```typescript
import { createClient } from '@/lib/supabase/server';

export async function MyPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('table').select('*');
  // render directly
}
```

**Client-side (when needed for real-time or interactivity):**
```typescript
'use client';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export function LiveData() {
  const [data, setData] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.from('table').select('*').then(({ data }) => setData(data));
  }, []);

  return <div>{/* render */}</div>;
}
```

---

## Quick Reference

| Need to... | Do this |
|---|---|
| Style a component | Read [styling-guide.md](resources/styling-guide.md) |
| Add a sidebar nav item | Edit `lib/navigation/<section>-navigation.ts` |
| Create a new page | Add `page.tsx` in `app/(protected)/dashboard/<route>/` |
| Use a UI primitive | Check `components/ui/` (shadcn/ui) |
| Fetch data | Server Component + `createClient` from `@/lib/supabase/server` |
| Add interactivity | Add `'use client'` directive, use React hooks |
