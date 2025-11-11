# Dashboard Rebuild: Context & Key Decisions

**Last Updated: 2025-01-08**

---

## Project Context

**Project**: Carve Wiki - Fitness tracking platform with gamification
**Current State**: Next.js 16 + React 19 + TypeScript + Supabase Auth
**Goal**: Transform placeholder dashboard into full RPG-style fitness tracker

---

## Key Design Decisions

### 1. Layout: Split-Screen (2/3 Personal + 1/3 Social)

**Decision**: Personal stats take 2/3 left column, social feed in 1/3 right sidebar

**Rationale**:
- Users want to see their own progress first (hero content)
- Social feed always visible without scrolling (ambient motivation)
- Natural reading flow: top-to-bottom for personal, glanceable sidebar for social
- Stacks well on mobile (social below personal)

**Alternative Considered**: 50/50 split
- Rejected: Too much competition for attention, personal stats should be hero

---

### 2. Gamification: Level/XP System (Not Full RPG Stats)

**Decision**: User has overall level + XP bar, fitness metrics clearly labeled (not STR/DEX/etc.)

**Rationale**:
- Leveling system is universally understood, feels rewarding
- Avoids confusion of mapping fitness to abstract RPG stats
- Still feels game-like without being too literal
- Balance between fun and functional

**Alternative Considered**: Full D&D stat system (STR/DEX/CON/INT/WIS/CHA)
- Rejected: Too gamified, felt forced, not intuitive for fitness context

**Alternative Considered**: No gamification, just stats
- Rejected: Less engaging, misses opportunity for motivation through progression

---

### 3. XP System: Combo (Base + Streaks + Achievements)

**Decision**: Base XP for activities + streak multipliers + achievement bonuses

**Rationale**:
- Rewards both consistency (streaks) and performance (achievements)
- Combo multipliers feel satisfying, create "momentum"
- Aligns with fitness psychology: consistency > intensity for long-term success

**XP Formula**:
```
Earned XP = (Base XP) × (Streak Multiplier) + Achievement Bonuses
```

**Values**:
- Workout: 50 XP base
- Meal log: 10 XP base
- PR: 100 XP bonus
- Streak multipliers: 1.1x (3d), 1.25x (7d), 1.5x (14d), 2x (30d)

**Alternative Considered**: Activity-only XP (no streaks)
- Rejected: Doesn't reward consistency enough

**Alternative Considered**: Achievement-focused XP
- Rejected: Too spiky, discourages daily engagement

---

### 4. Social Feed: Highlights on Dashboard, Everything on /social

**Decision**: Dashboard sidebar shows only PRs, achievements, level-ups. Full feed on dedicated page.

**Rationale**:
- Dashboard needs high signal-to-noise (highlights only)
- Users interested in details can go to /social
- Keeps dashboard focused on personal progress
- Prevents feed from becoming overwhelming/distracting

**Alternative Considered**: Everything in dashboard feed
- Rejected: Too noisy, every workout log would clutter sidebar

---

### 5. Data Model: Custom Tracking (Build From Scratch)

**Decision**: Build workout logging, meal tracking, social system all custom in-app

**Rationale**:
- Full control over UX, data structure, gamification integration
- No external API dependencies (Strava, MyFitnessPal)
- Can optimize for XP/achievement system
- Simpler onboarding (no OAuth to multiple services)

**Tradeoff**: More development work upfront
**Alternative Considered**: Import from Strava/Apple Health
- Rejected: Harder to integrate with XP system, less control over UX

---

### 6. Level Curve: Exponential (N^1.5)

**Decision**: XP for level N = 100 × N^1.5

**Rationale**:
- Early levels feel achievable (Level 2 = 100 XP, ~2 workouts)
- Late levels require sustained effort (Level 10 = 3162 XP, ~63 workouts)
- Exponential curve maintains challenge without being punishing
- Standard in game design (Pokémon uses similar curve)

**Example Progression**:
- Level 1→2: 100 XP (~2 workouts)
- Level 5→6: 1238 XP (~25 workouts at base rate)
- Level 10→11: 3487 XP (~70 workouts)

**Alternative Considered**: Linear (100 XP per level)
- Rejected: Late levels too easy, no sense of achievement

**Alternative Considered**: Steeper exponential (N^2)
- Rejected: Too grindy, discouraging for long-term users

---

## Key Files & Structure

### Current Files
- `app/(protected)/dashboard/page.tsx` - Placeholder dashboard (to be rebuilt)
- `lib/navigation/dashboard-navigation.ts` - Nav structure (needs icon updates)
- `components/ui/card.tsx` - Card components (will use for stats)
- `components/ui/chart.tsx` - Chart wrapper (for Recharts)
- `lib/supabase/client.ts` - Supabase client
- `lib/supabase/server.ts` - Supabase server-side client

### New Files to Create

**Database**:
- `supabase/migrations/YYYYMMDDHHMMSS_create_profiles.sql`
- `supabase/migrations/YYYYMMDDHHMMSS_create_user_stats.sql`
- `supabase/migrations/YYYYMMDDHHMMSS_create_workouts.sql`
- `supabase/migrations/YYYYMMDDHHMMSS_create_exercises.sql`
- `supabase/migrations/YYYYMMDDHHMMSS_create_meals.sql`
- `supabase/migrations/YYYYMMDDHHMMSS_create_achievements.sql`
- `supabase/migrations/YYYYMMDDHHMMSS_create_friendships.sql`
- `supabase/migrations/YYYYMMDDHHMMSS_create_activity_feed.sql`
- `supabase/migrations/YYYYMMDDHHMMSS_create_xp_functions.sql`
- `supabase/migrations/YYYYMMDDHHMMSS_create_triggers.sql`

**Components**:
- `components/dashboard/ProfileHeader.tsx`
- `components/dashboard/XPProgressBar.tsx`
- `components/dashboard/StatCard.tsx`
- `components/dashboard/StatsGrid.tsx`
- `components/dashboard/AchievementBadge.tsx`
- `components/dashboard/SocialFeedHighlights.tsx`
- `components/dashboard/SocialFeedItem.tsx`
- `components/dashboard/QuickActionButton.tsx`

**Pages**:
- `app/(protected)/dashboard/page.tsx` - Main dashboard (rebuild)
- `app/(protected)/dashboard/workouts/page.tsx` - Workout history
- `app/(protected)/dashboard/workouts/new/page.tsx` - Log workout
- `app/(protected)/dashboard/food/page.tsx` - Meal history
- `app/(protected)/dashboard/food/new/page.tsx` - Log meal
- `app/(protected)/dashboard/highscores/page.tsx` - Leaderboards
- `app/(protected)/dashboard/social/page.tsx` - Full social feed
- `app/(protected)/dashboard/social/friends/page.tsx` - Friend management
- `app/(protected)/dashboard/profile/page.tsx` - User profile + achievements
- `app/(protected)/dashboard/settings/page.tsx` - Settings

**Utilities**:
- `lib/xp/calculate.ts` - XP calculation logic (mirrors DB function)
- `lib/xp/level.ts` - Level calculation from XP
- `lib/achievements/definitions.ts` - Achievement metadata
- `lib/achievements/unlock.ts` - Check unlock conditions
- `lib/utils/date.ts` - Date helpers for streaks
- `lib/api/workouts.ts` - Workout CRUD operations
- `lib/api/meals.ts` - Meal CRUD operations
- `lib/api/social.ts` - Friend/feed operations

---

## Dependencies

### Already Installed
- `next`: 16.0.1
- `react`: 19.2.0
- `@supabase/supabase-js`: ^2.80.0
- `@supabase/ssr`: ^0.7.0
- `lucide-react`: ^0.553.0
- `recharts`: 2.15.4
- `tailwindcss`: ^4
- `typescript`: ^5

### To Install
```bash
pnpm add react-hook-form zod @hookform/resolvers
pnpm add date-fns
pnpm add @tanstack/react-query
pnpm add canvas-confetti @types/canvas-confetti -D
```

**Rationale**:
- `react-hook-form` + `zod`: Form validation for workout/meal logging
- `date-fns`: Date manipulation for streaks, activity grouping
- `@tanstack/react-query`: Data fetching/caching (better than SWR for this use case)
- `canvas-confetti`: Level-up celebration animation

---

## Database Schema Summary

### Core Tables (8 total)

1. **profiles** - User profiles (extends auth.users)
2. **user_stats** - Level, XP, streaks, totals
3. **workouts** - Workout sessions
4. **exercises** - Individual exercises within workouts
5. **meals** - Meal logs with macros
6. **achievements** - Achievement definitions
7. **user_achievements** - Unlocked achievements
8. **friendships** - Friend relationships
9. **activity_feed** - Social activity stream

### Key Relationships
- `profiles.id` → `auth.users.id` (1:1)
- `user_stats.user_id` → `profiles.id` (1:1)
- `workouts.user_id` → `profiles.id` (1:many)
- `exercises.workout_id` → `workouts.id` (1:many, cascade delete)
- `meals.user_id` → `profiles.id` (1:many)
- `user_achievements` → `profiles.id` + `achievements.id` (many:many)
- `friendships.user_id` + `friend_id` → `profiles.id` (many:many, bidirectional)
- `activity_feed.user_id` → `profiles.id` (1:many)

---

## Design Patterns

### Component Patterns

**Data Fetching**:
```tsx
// Use React Query for server state
const { data, isLoading, error } = useQuery({
  queryKey: ['user-stats', userId],
  queryFn: () => fetchUserStats(userId)
});
```

**Form Handling**:
```tsx
// Use react-hook-form + zod
const form = useForm({
  resolver: zodResolver(workoutSchema)
});
```

**Optimistic Updates**:
```tsx
// Update UI immediately, rollback on error
const mutation = useMutation({
  mutationFn: logWorkout,
  onMutate: async (workout) => {
    // Cancel queries, snapshot, optimistic update
  },
  onError: (err, vars, context) => {
    // Rollback
  }
});
```

### Database Patterns

**RLS Policies**:
```sql
-- Users can only see their own workouts
CREATE POLICY "Users can view own workouts"
  ON workouts FOR SELECT
  USING (auth.uid() = user_id);

-- Users can see friends' public activities
CREATE POLICY "Users can view friend activities"
  ON activity_feed FOR SELECT
  USING (
    is_public = true AND
    user_id IN (
      SELECT friend_id FROM friendships
      WHERE user_id = auth.uid() AND status = 'accepted'
    )
  );
```

**Triggers for XP**:
```sql
-- Auto-award XP on workout insert
CREATE TRIGGER award_workout_xp
  AFTER INSERT ON workouts
  FOR EACH ROW
  EXECUTE FUNCTION calculate_and_award_xp('workout');
```

---

## Risks & Mitigations (Summary)

| Risk | Mitigation |
|------|------------|
| Database performance with large feeds | Indexes on (user_id, created_at), pagination, 30-day window |
| XP calculation errors | Database functions for consistency, transaction logs |
| Mobile performance | Code splitting, lazy loading, Suspense |
| Feature creep | Stick to phased plan, ship MVP first |
| Privacy concerns | Default private, RLS policies, clear settings |

---

## Open Questions

1. **Avatar Storage**: Where to store user avatars?
   - Option A: Supabase Storage (recommended)
   - Option B: Cloudinary/external CDN
   - Decision: TBD in Phase 2

2. **Real-time Updates**: Use Supabase Realtime or polling?
   - Option A: Realtime for level-ups, achievements
   - Option B: Polling every 30s for feed
   - Decision: Hybrid approach (Realtime for critical, polling for feed)

3. **Notification System**: In-app only or push notifications?
   - Option A: In-app toasts only (MVP)
   - Option B: Add push later (post-MVP)
   - Decision: Start with A, add B based on feedback

4. **Exercise Database**: Custom or use API?
   - Option A: Free-form text entry (MVP)
   - Option B: Autocomplete from API (e.g., ExerciseDB)
   - Decision: Start with A, add B in Phase 3 if needed

---

## Success Criteria Checklist

**MVP Launch (Phases 1-6)**:
- [ ] User can sign up, see dashboard with level/XP
- [ ] User can log workout with exercises
- [ ] User can log meals with macros
- [ ] User can add friends, see friend highlights in sidebar
- [ ] XP awards correctly, level-ups work
- [ ] Dashboard loads <1s, no critical bugs
- [ ] Mobile responsive (works on 375px)

**Full Launch (Phases 7-8)**:
- [ ] Achievement system unlocks automatically
- [ ] Level-up celebration animation works
- [ ] Leaderboards show rankings
- [ ] Streaks calculate correctly
- [ ] UI polished, accessible
- [ ] Documentation complete

---

**End of Context Document**
