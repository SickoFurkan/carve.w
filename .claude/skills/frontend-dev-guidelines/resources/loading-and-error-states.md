# Loading & Error States - Next.js Patterns

**CRITICAL**: Proper loading and error state handling prevents layout shift and provides better user experience in Next.js App Router applications.

---

## ⚠️ CRITICAL RULE: Never Use Early Returns

### The Problem

```typescript
// ❌ NEVER DO THIS - Early return with loading spinner
export default function Component() {
  const [isLoading, setIsLoading] = useState(true);

  // WRONG: This causes layout shift and poor UX
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return <Content />;
}
```

**Why this is bad:**
1. **Layout Shift**: Content position jumps when loading completes
2. **CLS (Cumulative Layout Shift)**: Poor Core Web Vital score
3. **Jarring UX**: Page structure changes suddenly
4. **Lost Scroll Position**: User loses place on page

### The Solutions

**Option 1: Next.js Suspense with loading.tsx (PREFERRED for routes)**

```typescript
// app/dashboard/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-[#1a1f2e] rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}

// app/dashboard/page.tsx
export default async function DashboardPage() {
  // This will show loading.tsx while fetching
  const data = await fetch(...);

  return <DashboardContent data={data} />;
}
```

**Option 2: Skeleton with Same Dimensions (for components)**

```typescript
'use client';

export function Widget() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="bg-[#1a1f2e] rounded-xl border border-white/10 p-6 min-h-[300px]">
      {isLoading ? (
        // Skeleton with SAME dimensions
        <div className="space-y-4">
          <div className="h-6 bg-white/10 rounded animate-pulse w-32" />
          <div className="h-24 bg-white/10 rounded animate-pulse" />
          <div className="h-4 bg-white/10 rounded animate-pulse w-48" />
        </div>
      ) : (
        <Content />
      )}
    </div>
  );
}
```

---

## Next.js App Router Loading Patterns

### Route-Level Loading (loading.tsx)

**File structure:**
```
app/
  dashboard/
    loading.tsx    // Loading UI for dashboard route
    page.tsx       // Dashboard page
    workouts/
      loading.tsx  // Loading UI for workouts route
      page.tsx     // Workouts page
```

**loading.tsx example:**
```typescript
export default function Loading() {
  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Match your actual layout */}
      <div className="h-12 bg-white/10 rounded-lg animate-pulse w-64" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-64 bg-[#1a1f2e] rounded-xl border border-white/10 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
```

### Suspense Boundaries for Streaming

```typescript
import { Suspense } from 'react';

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Each widget loads independently */}
      <Suspense fallback={<WidgetSkeleton />}>
        <AchievementWidget />
      </Suspense>

      <Suspense fallback={<WidgetSkeleton />}>
        <FriendLeaderboard />
      </Suspense>

      <Suspense fallback={<WidgetSkeleton />}>
        <WorkoutStats />
      </Suspense>
    </div>
  );
}

// Async Server Component
async function AchievementWidget() {
  const data = await fetch(...);
  return <Widget data={data} />;
}

function WidgetSkeleton() {
  return (
    <div className="h-64 bg-[#1a1f2e] rounded-xl border border-white/10 animate-pulse" />
  );
}
```

**Benefits:**
- Each section loads independently
- User sees partial content sooner
- Better perceived performance
- Server-rendered by default

---

## Skeleton Components

### Dashboard Widget Skeleton

```typescript
export function DashboardWidgetSkeleton() {
  return (
    <div className="bg-[#1a1f2e] rounded-xl shadow-lg border border-white/10 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-white/10 rounded animate-pulse w-32" />
        <div className="h-4 bg-white/10 rounded animate-pulse w-16" />
      </div>

      {/* Content */}
      <div className="space-y-3">
        <div className="h-20 bg-white/10 rounded animate-pulse" />
        <div className="h-4 bg-white/10 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-white/10 rounded animate-pulse w-1/2" />
      </div>
    </div>
  );
}
```

### Data Visualization Skeleton

```typescript
export function ChartSkeleton() {
  return (
    <div className="bg-[#1a1f2e] rounded-xl p-6 h-64">
      <div className="h-6 bg-white/10 rounded animate-pulse w-40 mb-4" />

      {/* Chart placeholder */}
      <div className="h-40 bg-white/5 rounded-lg flex items-end gap-2 p-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-white/10 rounded-t animate-pulse"
            style={{ height: `${Math.random() * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## Client Component Loading States

### useState with Skeleton

```typescript
'use client';

import { useState, useEffect } from 'react';

export function InteractiveWidget() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData().then((result) => {
      setData(result);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="bg-[#1a1f2e] rounded-xl p-6 min-h-[300px]">
      {isLoading ? (
        <WidgetSkeleton />
      ) : (
        <WidgetContent data={data} />
      )}
    </div>
  );
}
```

### Loading Overlay Pattern

```typescript
'use client';

export function OverlayWidget() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="relative bg-[#1a1f2e] rounded-xl p-6">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Content always rendered (no layout shift) */}
      <WidgetContent />
    </div>
  );
}
```

---

## Error Handling

### error.tsx for Route Errors

**File structure:**
```
app/
  dashboard/
    error.tsx      // Error UI for dashboard route
    page.tsx
```

**error.tsx example:**
```typescript
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-[#1a1f2e] rounded-xl border border-red-500/20 p-8 max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4">
          Something went wrong!
        </h2>

        <p className="text-white/60 mb-6">
          {error.message}
        </p>

        <button
          onClick={reset}
          className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
```

### Client-Side Error Handling

```typescript
'use client';

import { useState } from 'react';

export function DataWidget() {
  const [error, setError] = useState<string | null>(null);

  async function handleAction() {
    try {
      await performAction();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }

  return (
    <div className="bg-[#1a1f2e] rounded-xl p-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <button onClick={handleAction}>
        Perform Action
      </button>
    </div>
  );
}
```

### Toast Notifications

```typescript
'use client';

import { toast } from 'sonner'; // or your toast library

export function ActionWidget() {
  async function handleSave() {
    try {
      await saveData();
      toast.success('Data saved successfully!');
    } catch (error) {
      toast.error('Failed to save data');
    }
  }

  return (
    <button onClick={handleSave}>
      Save
    </button>
  );
}
```

---

## Loading State Anti-Patterns

### ❌ What NOT to Do

```typescript
// ❌ NEVER - Early return with different layout
if (isLoading) {
  return <LoadingSpinner />; // Layout shift!
}

// ❌ NEVER - Conditional rendering with different heights
{isLoading ? (
  <div className="h-20">Loading...</div>
) : (
  <div className="h-64">Content</div> // Different height!
)}

// ❌ NEVER - Unmounted content (data fetching in useEffect)
useEffect(() => {
  fetchData(); // Component already rendered without data
}, []);
```

### ✅ What TO Do

```typescript
// ✅ BEST - Server Component with Suspense
<Suspense fallback={<Skeleton />}>
  <AsyncServerComponent />
</Suspense>

// ✅ GOOD - Same layout dimensions
<div className="min-h-[300px]">
  {isLoading ? <Skeleton /> : <Content />}
</div>

// ✅ ACCEPTABLE - Loading overlay
<div className="relative">
  {isLoading && <LoadingOverlay />}
  <Content />
</div>
```

---

## Complete Examples

### Example 1: Server Component with Suspense

```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react';
import { AchievementWidget } from '@/components/dashboard/widgets/AchievementProgress';
import { DashboardWidgetSkeleton } from '@/components/dashboard/skeletons';

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
      <Suspense fallback={<DashboardWidgetSkeleton />}>
        <AchievementWidget />
      </Suspense>

      <Suspense fallback={<DashboardWidgetSkeleton />}>
        <FriendLeaderboard />
      </Suspense>

      <Suspense fallback={<DashboardWidgetSkeleton />}>
        <WorkoutStats />
      </Suspense>
    </div>
  );
}

// components/dashboard/widgets/AchievementProgress.tsx
import { createClient } from '@/lib/supabase/server';

export async function AchievementWidget() {
  const supabase = createClient();

  const { data } = await supabase
    .from('achievements')
    .select('*')
    .limit(5);

  return (
    <div className="bg-[#1a1f2e] rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Achievements
      </h3>
      {/* Render data */}
    </div>
  );
}
```

### Example 2: Client Component with Loading State

```typescript
'use client';

import { useState, useEffect } from 'react';

export function InteractiveDashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData().then((result) => {
      setData(result);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="bg-[#1a1f2e] rounded-xl p-6 min-h-[400px]">
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-6 bg-white/10 rounded w-40" />
          <div className="h-32 bg-white/10 rounded" />
          <div className="h-4 bg-white/10 rounded w-64" />
        </div>
      ) : (
        <Content data={data} />
      )}
    </div>
  );
}
```

---

## Summary

**Loading Patterns:**
- ✅ **PREFERRED**: loading.tsx for routes (Next.js convention)
- ✅ **BEST**: Suspense boundaries for Server Components
- ✅ **GOOD**: Skeleton states with same dimensions
- ✅ **OK**: Loading overlays when appropriate
- ❌ **NEVER**: Early returns or different layouts

**Error Handling:**
- ✅ **PREFERRED**: error.tsx for route errors
- ✅ Use try/catch in Client Components
- ✅ Toast notifications for user feedback
- ✅ Inline error messages in forms/widgets

**Key Principles:**
1. Maintain consistent layout (no CLS)
2. Server Components by default
3. Suspense for streaming
4. Skeleton states match real content dimensions

**See Also:**
- [component-patterns.md](component-patterns.md) - Server vs Client Components
- [styling-guide.md](styling-guide.md) - Magnus skeleton styles
