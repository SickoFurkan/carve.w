# Data Fetching with Supabase

Modern data fetching patterns for Carve using Supabase with Next.js App Router, emphasizing Server Components and type safety.

---

## Primary Pattern: Server Components

**PREFERRED for new code**: Use Server Components with direct Supabase queries.

### Why Server Components?

- **Performance**: No client-side JavaScript for data fetching
- **SEO**: Fully server-rendered content
- **Security**: Database queries never exposed to client
- **Type Safety**: Direct TypeScript integration
- **Simplicity**: No loading states or useEffect needed

---

## Server Component Data Fetching

### Basic Pattern

```typescript
// app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = createClient();

  const { data: achievements } = await supabase
    .from('achievements')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {achievements?.map((achievement) => (
        <AchievementCard key={achievement.id} achievement={achievement} />
      ))}
    </div>
  );
}
```

### With Authentication

```typescript
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const supabase = createClient();

  // Get authenticated user
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  // Fetch user's data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="bg-[#1a1f2e] rounded-xl p-6">
      <h1 className="text-2xl font-bold text-white">{profile.username}</h1>
      <p className="text-white/60">{profile.bio}</p>
    </div>
  );
}
```

### Complex Queries with Joins

```typescript
export default async function WorkoutsPage() {
  const supabase = createClient();

  const { data: workouts } = await supabase
    .from('workouts')
    .select(`
      *,
      exercises (
        id,
        name,
        muscle_group
      ),
      user:profiles (
        username,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })
    .limit(20);

  return <WorkoutList workouts={workouts} />;
}
```

---

## Streaming with Suspense

**Pattern**: Split data fetching into multiple Server Components for progressive loading.

```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react';

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Each widget loads independently */}
      <Suspense fallback={<WidgetSkeleton />}>
        <AchievementsWidget />
      </Suspense>

      <Suspense fallback={<WidgetSkeleton />}>
        <FriendsWidget />
      </Suspense>

      <Suspense fallback={<WidgetSkeleton />}>
        <WorkoutsWidget />
      </Suspense>
    </div>
  );
}

// Separate Server Component for each widget
async function AchievementsWidget() {
  const supabase = createClient();

  const { data } = await supabase
    .from('achievements')
    .select('*')
    .limit(5);

  return (
    <div className="bg-[#1a1f2e] rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Achievements</h3>
      {/* Render achievements */}
    </div>
  );
}
```

**Benefits:**
- User sees content progressively
- Faster Time to First Byte (TTFB)
- Better perceived performance
- Each section loads independently

---

## Client Component Data Fetching

**Use when you need:**
- Real-time subscriptions
- Interactive filtering/sorting
- User-triggered data fetching
- Client-side state management

### Basic Client-Side Fetch

```typescript
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function InteractiveWorkouts() {
  const [workouts, setWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchWorkouts() {
      const { data } = await supabase
        .from('workouts')
        .select('*')
        .order('created_at', { ascending: false});

      setWorkouts(data || []);
      setIsLoading(false);
    }

    fetchWorkouts();
  }, [supabase]);

  return (
    <div className="bg-[#1a1f2e] rounded-xl p-6 min-h-[400px]">
      {isLoading ? (
        <WorkoutsSkeleton />
      ) : (
        <WorkoutsList workouts={workouts} />
      )}
    </div>
  );
}
```

### Real-Time Subscriptions

```typescript
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function LiveLeaderboard() {
  const [scores, setScores] = useState([]);
  const supabase = createClient();

  useEffect(() => {
    // Initial fetch
    supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(10)
      .then(({ data }) => setScores(data || []));

    // Subscribe to changes
    const subscription = supabase
      .channel('leaderboard_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leaderboard'
        },
        (payload) => {
          // Update scores in real-time
          if (payload.eventType === 'INSERT') {
            setScores(prev => [payload.new, ...prev].slice(0, 10));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return <LeaderboardDisplay scores={scores} />;
}
```

---

## Data Mutations

### Server Actions (PREFERRED)

```typescript
// app/actions/workouts.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createWorkout(formData: FormData) {
  const supabase = createClient();

  const workout = {
    name: formData.get('name') as string,
    duration: parseInt(formData.get('duration') as string),
    exercises: JSON.parse(formData.get('exercises') as string),
  };

  const { data, error } = await supabase
    .from('workouts')
    .insert([workout])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Revalidate the workouts page
  revalidatePath('/dashboard/workouts');

  return { data };
}

// Usage in Client Component
'use client';

import { createWorkout } from '@/app/actions/workouts';
import { toast } from 'sonner';

export function CreateWorkoutForm() {
  async function handleSubmit(formData: FormData) {
    const result = await createWorkout(formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Workout created!');
    }
  }

  return (
    <form action={handleSubmit}>
      {/* Form fields */}
      <button type="submit">Create Workout</button>
    </form>
  );
}
```

### Client-Side Mutations

```typescript
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function UpdateProfileForm({ profile }) {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  async function handleUpdate(formData: FormData) {
    setIsLoading(true);

    const updates = {
      username: formData.get('username'),
      bio: formData.get('bio'),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id);

    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated!');
    }

    setIsLoading(false);
  }

  return (
    <form action={handleUpdate}>
      {/* Form fields */}
      <button
        type="submit"
        disabled={isLoading}
        className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg"
      >
        {isLoading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}
```

---

## Type Safety with TypeScript

### Generate Types from Supabase

```bash
npx supabase gen types typescript --project-id your-project-id > types/supabase.ts
```

### Use Generated Types

```typescript
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase';

export default async function WorkoutsPage() {
  const supabase = createClient<Database>();

  // Fully typed query
  const { data: workouts } = await supabase
    .from('workouts')
    .select('*');

  // workouts is typed as Workout[]
  return <WorkoutsList workouts={workouts} />;
}
```

### Custom Types

```typescript
// types/database.ts
export interface Workout {
  id: string;
  user_id: string;
  name: string;
  duration: number;
  exercises: Exercise[];
  created_at: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
}

// Usage
import type { Workout } from '@/types/database';

async function getWorkouts(): Promise<Workout[]> {
  const supabase = createClient();

  const { data } = await supabase
    .from('workouts')
    .select('*');

  return data as Workout[];
}
```

---

## Error Handling

### Server Components

```typescript
export default async function WorkoutsPage() {
  const supabase = createClient();

  const { data: workouts, error } = await supabase
    .from('workouts')
    .select('*');

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-red-400 mb-2">
          Error Loading Workouts
        </h3>
        <p className="text-white/60">{error.message}</p>
      </div>
    );
  }

  if (!workouts || workouts.length === 0) {
    return (
      <div className="bg-[#1a1f2e] rounded-xl p-12 text-center">
        <p className="text-white/60">No workouts yet. Create your first workout!</p>
      </div>
    );
  }

  return <WorkoutsList workouts={workouts} />;
}
```

### Client Components with Toast

```typescript
'use client';

import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function DeleteWorkoutButton({ workoutId }) {
  const supabase = createClient();

  async function handleDelete() {
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', workoutId);

    if (error) {
      toast.error('Failed to delete workout');
      console.error('Delete error:', error);
    } else {
      toast.success('Workout deleted');
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-400 hover:text-red-300"
    >
      Delete
    </button>
  );
}
```

---

## Caching & Revalidation

### Force Dynamic (No Caching)

```typescript
// app/dashboard/page.tsx
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // This page will always be server-rendered on each request
  const supabase = createClient();
  const { data } = await supabase.from('live_data').select('*');

  return <Dashboard data={data} />;
}
```

### Revalidate at Interval

```typescript
// Revalidate every 60 seconds
export const revalidate = 60;

export default async function LeaderboardPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('leaderboard')
    .select('*')
    .order('score', { ascending: false });

  return <Leaderboard scores={data} />;
}
```

### Manual Revalidation (Server Actions)

```typescript
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

export async function updateWorkout(workoutId: string, updates: any) {
  const supabase = createClient();

  await supabase
    .from('workouts')
    .update(updates)
    .eq('id', workoutId);

  // Revalidate specific path
  revalidatePath('/dashboard/workouts');

  // Or revalidate by tag
  revalidateTag('workouts');
}
```

---

## Row Level Security (RLS)

### Authenticated User Queries

```typescript
export default async function MyWorkoutsPage() {
  const supabase = createClient();

  // RLS automatically filters to current user
  const { data: workouts } = await supabase
    .from('workouts')
    .select('*')
    .order('created_at', { ascending: false });

  // Only returns workouts owned by authenticated user
  return <WorkoutsList workouts={workouts} />;
}
```

### Service Role for Admin Operations

```typescript
// lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Server-side only!
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

// Usage in Server Action
'use server';

import { createAdminClient } from '@/lib/supabase/admin';

export async function adminDeleteUser(userId: string) {
  const supabase = createAdminClient();

  // Bypasses RLS
  await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);
}
```

---

## Best Practices Summary

**Data Fetching:**
- ✅ **Server Components by default** (better performance, SEO)
- ✅ **Use Suspense** for progressive loading
- ✅ **Client Components** only when needed (interactivity, real-time)
- ✅ **Type safety** with generated or custom types
- ✅ **Error handling** at component level

**Mutations:**
- ✅ **Server Actions** for form submissions
- ✅ **revalidatePath** after mutations
- ✅ **Toast notifications** for user feedback
- ✅ **Optimistic updates** when appropriate

**Performance:**
- ✅ **Cache strategically** with revalidate
- ✅ **RLS for security** (user-scoped queries)
- ✅ **Limit results** with `.limit()`
- ✅ **Select specific fields** not `*` when possible

**See Also:**
- [component-patterns.md](component-patterns.md) - Server vs Client Components
- [loading-and-error-states.md](loading-and-error-states.md) - Loading patterns
- [complete-examples.md](complete-examples.md) - Full widget examples
