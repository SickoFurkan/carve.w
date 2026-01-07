---
name: frontend-dev-guidelines
description: Frontend development guidelines for Carve - Next.js App Router, Tailwind CSS, shadcn/ui, Supabase. Magnus-inspired dark aesthetic with gradient visualizations, dashboard widgets, and modern component patterns. Use when creating components, pages, styling, data fetching, or working with frontend code.
---

# Carve Frontend Development Guidelines

## Purpose

Comprehensive guide for Carve's Next.js development, emphasizing the Magnus-inspired dark aesthetic, proper component patterns, Tailwind CSS styling, and Supabase integration.

## When to Use This Skill

- Creating new components or pages
- Building dashboard widgets
- Styling components with Tailwind + Magnus aesthetic
- Fetching data from Supabase
- Implementing responsive layouts
- Working with i18n (next-intl)
- Performance optimization

---

## Quick Start

### New Component Checklist

Creating a component? Follow this checklist:

- [ ] Use TypeScript with explicit prop interfaces
- [ ] Choose Server Component by default, Client Component only when needed
- [ ] Apply Magnus dark theme colors (see styling guide)
- [ ] Use Tailwind utility classes following project patterns
- [ ] Leverage shadcn/ui components when available
- [ ] No early returns with loading spinners (use Suspense or skeleton states)
- [ ] Responsive design: mobile-first breakpoints
- [ ] `useCallback` for event handlers passed to children
- [ ] Follow file naming: `ComponentName.tsx` (PascalCase)

### New Dashboard Widget Checklist

Creating a dashboard widget? Set up:

- [ ] Create component in `components/dashboard/widgets/`
- [ ] Extend `DarkCard` or `WidgetCard` base components
- [ ] Use Magnus aesthetic: dark gradients, colorful visualizations
- [ ] Implement loading states with consistent card dimensions
- [ ] Add responsive sizing (grid-based layout)
- [ ] Type-safe data interfaces
- [ ] Supabase data fetching (server component or client hook)

---

## Import Aliases Quick Reference

| Alias | Resolves To | Example |
|-------|-------------|---------|
| `@/` | Root directory | `import { Button } from '@/components/ui/button'` |
| `@/components` | Components directory | `import { DarkCard } from '@/components/dashboard/widgets/shared/DarkCard'` |
| `@/lib` | Utilities & helpers | `import { cn } from '@/lib/utils'` |
| `@/app` | App directory | `import { metadata } from '@/app/layout'` |

Defined in: `tsconfig.json` paths

---

## Common Imports Cheatsheet

```typescript
// React & Next.js
import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Next.js App Router
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

// Tailwind merge utility
import { cn } from '@/lib/utils';

// shadcn/ui Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Dashboard Components
import { DarkCard } from '@/components/dashboard/widgets/shared/DarkCard';
import { WidgetCard } from '@/components/dashboard/widgets/shared/WidgetCard';

// Supabase
import { createClient } from '@/lib/supabase/server';

// i18n
import { useTranslations } from 'next-intl';
```

---

## Topic Guides

### 🎨 Component Patterns

**Next.js App Router conventions:**
- **Server Components** by default (async, data fetching)
- **Client Components** when needed (`'use client'` directive)
- File-based routing in `app/[locale]/` directory
- Layout composition with nested layouts

**Key Concepts:**
- Server Components for static/data-heavy content
- Client Components for interactivity (event handlers, hooks)
- Suspense boundaries for streaming
- Component structure: Props → Data Fetching → Render

**[📖 Complete Guide: resources/component-patterns.md](resources/component-patterns.md)**

---

### 🎨 Styling with Magnus Aesthetic

**Magnus Design System:**
- Dark navy/black backgrounds (`#0a0e1a`, `#111827`)
- Gradient visualizations (purple, teal, orange, green)
- Glassmorphism effects
- Generous spacing and modern typography
- Color-coded data visualizations

**Tailwind Patterns:**
- Utility-first approach
- Custom colors via CSS variables
- Responsive breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Dark mode classes (default dark theme)

**[📖 Complete Guide: resources/styling-guide.md](resources/styling-guide.md)**

---

### 📊 Data Fetching

**Server Components (PREFERRED):**
- Direct Supabase queries in async components
- No loading states needed
- Better SEO and performance
- Type-safe with TypeScript

**Client Components:**
- React hooks for interactivity
- `useState`, `useEffect` for client-side data
- Loading skeletons (no early returns!)

**[📖 Complete Guide: resources/data-fetching.md](resources/data-fetching.md)**

---

### 📁 File Organization

**app/ directory structure:**
- `app/[locale]/` - i18n routing
- `app/[locale]/(protected)/dashboard/` - Protected routes
- `components/` - Reusable components
- `components/dashboard/widgets/` - Dashboard-specific widgets
- `lib/` - Utilities, helpers, Supabase client

**Component Organization:**
```
components/
  dashboard/
    widgets/
      shared/          # Shared widget components
        DarkCard.tsx
        WidgetCard.tsx
      AchievementProgress.tsx
      FriendLeaderboard.tsx
```

**[📖 Complete Guide: resources/file-organization.md](resources/file-organization.md)**

---

### ⏳ Loading & Error States

**CRITICAL RULE: No Early Returns**

```typescript
// ❌ NEVER - Causes layout shift
if (isLoading) {
    return <LoadingSpinner />;
}

// ✅ ALWAYS - Consistent layout
<div className="min-h-[400px]">
    {isLoading ? <Skeleton /> : <Content />}
</div>
```

**Why:** Prevents Cumulative Layout Shift (CLS), better UX

**Loading Patterns:**
- Suspense boundaries for Server Components
- Skeleton states with same dimensions
- Loading overlays when appropriate

**[📖 Complete Guide: resources/loading-and-error-states.md](resources/loading-and-error-states.md)**

---

### ⚡ Performance

**Optimization Patterns:**
- Server Components by default (less JavaScript)
- Dynamic imports for heavy components
- Image optimization with Next.js `Image`
- `useCallback` for event handlers
- `useMemo` for expensive computations
- Proper Suspense boundaries

**[📖 Complete Guide: resources/performance.md](resources/performance.md)**

---

### 📘 TypeScript

**Standards:**
- Strict mode enabled
- Explicit types for props and returns
- Interface over type for component props
- Type imports: `import type { User } from '@/types/user'`

**[📖 Complete Guide: resources/typescript-standards.md](resources/typescript-standards.md)**

---

### 🔧 Common Patterns

**Covered Topics:**
- shadcn/ui component usage
- Dashboard widget patterns
- Dark theme implementation
- Responsive design patterns
- Supabase integration patterns
- i18n with next-intl

**[📖 Complete Guide: resources/common-patterns.md](resources/common-patterns.md)**

---

### 📚 Complete Examples

**Full working examples:**
- Magnus-style dashboard widget
- Server Component with Supabase
- Client Component with interactivity
- Responsive card layout
- Gradient visualization component

**[📖 Complete Guide: resources/complete-examples.md](resources/complete-examples.md)**

---

## Navigation Guide

| Need to... | Read this resource |
|------------|-------------------|
| Create a component | [component-patterns.md](resources/component-patterns.md) |
| Style with Magnus aesthetic | [styling-guide.md](resources/styling-guide.md) |
| Fetch data from Supabase | [data-fetching.md](resources/data-fetching.md) |
| Organize files/folders | [file-organization.md](resources/file-organization.md) |
| Handle loading/errors | [loading-and-error-states.md](resources/loading-and-error-states.md) |
| Optimize performance | [performance.md](resources/performance.md) |
| TypeScript patterns | [typescript-standards.md](resources/typescript-standards.md) |
| See full examples | [complete-examples.md](resources/complete-examples.md) |

---

## Core Principles

1. **Server Components First**: Default to Server Components, Client only when needed
2. **Magnus Dark Aesthetic**: Dark gradients, colorful visualizations, generous spacing
3. **No Early Returns**: Prevents layout shift, use skeletons instead
4. **Tailwind Utility-First**: Compose styles with utilities, extract to components when needed
5. **Type Safety**: Explicit TypeScript types for all props and data
6. **Responsive Design**: Mobile-first, use Tailwind breakpoints
7. **Performance**: Optimize images, lazy load when appropriate
8. **Consistent Spacing**: Follow Magnus patterns for padding/margins

---

## Quick Reference: File Structure

```
app/
  [locale]/
    (protected)/
      dashboard/
        page.tsx           # Dashboard main page
        workouts/
          page.tsx         # Workouts page
    layout.tsx             # Root layout

components/
  dashboard/
    DashboardGrid.tsx      # Main dashboard grid
    widgets/
      shared/
        DarkCard.tsx       # Dark card base
        WidgetCard.tsx     # Widget card base
      AchievementProgress.tsx
      FriendLeaderboard.tsx
  ui/                      # shadcn/ui components
    button.tsx
    card.tsx

lib/
  supabase/
    client.ts              # Supabase client
    server.ts              # Supabase server client
  utils.ts                 # Utilities (cn, etc.)
```

---

## Modern Component Template (Quick Copy)

**Server Component:**
```typescript
import { createClient } from '@/lib/supabase/server';
import { DarkCard } from '@/components/dashboard/widgets/shared/DarkCard';

interface WidgetProps {
  userId: string;
}

export async function MyWidget({ userId }: WidgetProps) {
  const supabase = createClient();

  const { data } = await supabase
    .from('table')
    .select('*')
    .eq('user_id', userId)
    .single();

  return (
    <DarkCard className="p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        {data.title}
      </h3>
      <div className="space-y-2">
        {/* Content */}
      </div>
    </DarkCard>
  );
}
```

**Client Component:**
```typescript
'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { DarkCard } from '@/components/dashboard/widgets/shared/DarkCard';

interface WidgetProps {
  initialData: Data;
}

export function InteractiveWidget({ initialData }: WidgetProps) {
  const [data, setData] = useState(initialData);

  const handleAction = useCallback(() => {
    setData(prev => ({ ...prev, updated: true }));
  }, []);

  return (
    <DarkCard className="p-6">
      <Button onClick={handleAction}>
        Update
      </Button>
    </DarkCard>
  );
}
```

For complete examples, see [resources/complete-examples.md](resources/complete-examples.md)

---

**Skill Status**: Adapted for Carve project with Next.js App Router, Tailwind CSS, and Magnus aesthetic
