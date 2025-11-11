# Carve Landing Page: Context & Key Decisions

**Last Updated: 2025-01-10**

---

## Project Context

**Project**: Carve Landing Page - Marketing website for Carve mobile fitness app
**Current State**: Basic placeholder homepage linking to wiki and dashboard
**Goal**: High-converting marketing page with live social proof, demo mode, and waitlist system

---

## Key Design Decisions

### 1. Conversion Strategy: Waitlist → Store Links (Flexible)

**Decision**: Build with waitlist system first, easy toggle to store links when app launches

**Implementation**:
```typescript
// Environment variable controls CTA behavior
const APP_STATUS = process.env.NEXT_PUBLIC_APP_STATUS; // 'waitlist' | 'live'

if (APP_STATUS === 'waitlist') {
  // Show: "Join Waitlist" → Email capture
} else {
  // Show: "Download Now" → App Store/Play Store links
}
```

**Rationale**:
- App still in development → can't link to stores yet
- Waitlist builds audience pre-launch
- Email list for launch notification
- One env variable change to switch modes
- No code duplication

**Alternative Considered**: Wait until app is live to build landing page
- Rejected: Miss opportunity to build audience early

---

### 2. Demo Strategy: Reuse Real Dashboard (No Duplication)

**Decision**: `/dashboard` supports demo mode for non-logged-in users with sample data

**Architecture**:
```typescript
// app/(protected)/dashboard/page.tsx
const user = await getCurrentUser();

const data = user
  ? await fetchRealData(user.id)  // Logged in: Supabase
  : getDemoData();                 // Not logged in: Sample data

// Same components for both!
return (
  <>
    {!user && <DemoBanner />}
    <ProfileHeader stats={data.stats} />
    <StatsGrid stats={data.stats} />
    <WorkoutHistory workouts={data.workouts} />
  </>
);
```

**Rationale**:
- ✅ Zero code duplication (same components)
- ✅ Users see EXACT dashboard experience
- ✅ Demo data client-side (no database pollution)
- ✅ Easy to maintain (one set of components)
- ✅ Interactive (can navigate, see all features)

**Alternative Considered**: Dedicated `/demo` route with simplified UI
- Rejected: Duplicate components, users don't see real experience

---

### 3. Social Proof: Live Hiscores Widget (Unique Differentiator)

**Decision**: Show real-time leaderboards and activity feed on landing page

**Features**:
- Top 5 global rankings (level/XP)
- Live activity feed (PRs, level-ups, achievements scrolling)
- Auto-updates every 30 seconds
- Links to full `/hiscores` page

**Rationale**:
- Unique feature (most fitness apps don't show live leaderboards publicly)
- Social proof: "Real people are using this right now"
- Motivational: "I want to be on that leaderboard"
- Builds FOMO: "Join before spots fill up"

**Privacy**: Only users with `show_on_leaderboard = true` (opt-out in settings, default true)

---

### 4. Public Leaderboards: Opt-Out Model

**Decision**: Users appear on leaderboards by default, can opt-out in settings

**Rationale**:
- Gamification works better with visibility (competition, recognition)
- Most users WANT to be on leaderboards (ego, motivation)
- Only shows: username, avatar, stats (no personal data)
- Easy opt-out: Settings → "Hide from leaderboards"

**Alternative Considered**: Opt-in (users must enable to appear)
- Rejected: Too few people would opt-in, leaderboards feel empty

**Privacy Compliance**:
- No personal data (email, real name) on leaderboards
- Only public profile info (username, avatar, stats)
- Clear notice in settings
- GDPR-compliant

---

### 5. Tone & Messaging: Direct + Energetic (Not Corporate)

**Decision**: "Track everything. Level up. Win." style messaging

**Examples**:
- ✅ "Track your workouts. Crush your PRs. Level up with friends."
- ✅ "Every rep counts. Every meal matters. See your progress."
- ❌ "Transform your fitness journey with our revolutionary platform"
- ❌ "Empower yourself to achieve optimal wellness outcomes"

**Rationale**:
- Target audience: 18-35 year olds who game/use apps
- Modern, energetic vibe matches brand
- Direct language cuts through noise
- Friendly but not patronizing

**Voice**: Short sentences. Active voice. Clear benefits.

---

### 6. Feature Prioritization: Tracking > Gamification > Social

**Decision**: Lead with tracking (core value), showcase gamification (differentiator), mention social (community)

**Hierarchy**:
1. **Tracking** (Core): "Log every rep, every meal, every PR"
   - This is the functional benefit
   - What the app DOES
2. **Gamification** (Differentiator): "Turn workouts into XP"
   - This is what makes it FUN
   - Why Carve vs other trackers
3. **Social** (Community): "Train with friends"
   - This is the retention hook
   - Why people stick around

**Alternative Considered**: Lead with gamification (most unique)
- Rejected: Gamification is a means, tracking is the end goal

---

### 7. Hiscores Page Design: Multiple Leaderboards + Filters

**Decision**: Dedicated `/hiscores` page with tabs and filters for different competition types

**Leaderboards**:
- Overall (Level/XP)
- Workouts (Total logged)
- Streaks (Longest active)
- PRs (by exercise: Bench, Squat, Deadlift, etc.)

**Filters**:
- Timeframe: All Time, This Month, This Week
- (Future) Gender, Age Group

**Rationale**:
- Different people compete in different ways
- Some want overall ranking (level)
- Some want workout consistency (count)
- Some want streaks (habits)
- Some want strength PRs
- More leaderboards = more ways to "win"

---

### 8. Mobile-First Design (Then Desktop Enhancement)

**Decision**: Design for mobile (375px) first, enhance for desktop

**Rationale**:
- Target audience is mobile-heavy
- App is mobile (landing page should match context)
- Easier to scale up than down
- Forces simplicity, prioritization

**Desktop Enhancements**:
- Hiscores: Side-by-side (top 5 + activity feed)
- Features: 3-column grid
- More whitespace, larger images

**Mobile Adaptations**:
- Hiscores: Stacked (top 5, then feed)
- Features: Single column
- Hamburger menu

---

## Key Files & Structure

### Current Files
- `app/page.tsx` - Placeholder homepage (will be replaced)
- `app/dashboard/page.tsx` - Dashboard (will add demo mode)

### New Files to Create

**Landing Page Components**:
```
components/
  landing/
    HeroSection.tsx          # Main hero with CTA
    HiscoresWidget.tsx       # Live leaderboard widget
    FeatureCard.tsx          # Reusable feature card
    AchievementWall.tsx      # Gamification showcase
    WaitlistForm.tsx         # Email capture form
```

**Hiscores Page**:
```
app/
  hiscores/
    page.tsx                 # Full leaderboards page

components/
  hiscores/
    LeaderboardTabs.tsx      # Tab switcher
    LeaderboardTable.tsx     # Table with rankings
    Filters.tsx              # Timeframe/category filters
```

**Demo Mode**:
```
lib/
  demo/
    sample-data.ts           # Demo user data generator

components/
  dashboard/
    DemoBanner.tsx           # "This is demo data" banner
```

**Database**:
```
supabase/migrations/
  YYYYMMDDHHMMSS_create_waitlist.sql
  YYYYMMDDHHMMSS_add_leaderboard_flag.sql
  YYYYMMDDHHMMSS_create_leaderboard_functions.sql
```

---

## Dependencies

### Already Installed
- `next`: 16.0.1
- `react`: 19.2.0
- `@supabase/supabase-js`: ^2.80.0
- `tailwindcss`: ^4
- `lucide-react`: ^0.553.0

### To Install
```bash
pnpm add zod  # Email validation for waitlist
```

### Optional (Later)
```bash
pnpm add framer-motion  # Scroll animations
pnpm add react-intersection-observer  # Lazy loading
```

---

## Database Schema Summary

### New Tables (1 total)

**waitlist**:
- `id` (uuid)
- `email` (text, unique)
- `created_at` (timestamptz)
- `source` (text - tracking where signup came from)
- `notified` (boolean - sent launch email?)

### Schema Updates

**profiles** (add column):
- `show_on_leaderboard` (boolean, default true)

### Database Functions (5 total)

1. `get_global_leaderboard(limit, timeframe)` → Top users by level/XP
2. `get_live_activity_feed(limit)` → Recent PRs/achievements/level-ups
3. `get_workouts_leaderboard(timeframe, limit)` → Most workouts logged
4. `get_streaks_leaderboard(limit)` → Longest active streaks
5. `get_prs_leaderboard(exercise, limit)` → Top PRs by exercise type

---

## Design Patterns

### Waitlist Form Pattern
```tsx
// components/landing/WaitlistForm.tsx
'use client'

export function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e) => {
    setState('loading');

    const res = await fetch('/api/waitlist', {
      method: 'POST',
      body: JSON.stringify({ email, source: 'hero' })
    });

    setState(res.ok ? 'success' : 'error');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={e => setEmail(e.target.value)} />
      <button disabled={state === 'loading'}>
        {state === 'loading' ? 'Joining...' : 'Join Waitlist'}
      </button>
      {state === 'success' && <p>You're on the list!</p>}
    </form>
  );
}
```

### Environment-Based CTA Pattern
```tsx
// components/landing/CTAButton.tsx
const APP_STATUS = process.env.NEXT_PUBLIC_APP_STATUS;

export function CTAButton() {
  if (APP_STATUS === 'live') {
    return (
      <div>
        <a href="https://apps.apple.com/...">
          <AppStoreButton />
        </a>
        <a href="https://play.google.com/...">
          <PlayStoreButton />
        </a>
      </div>
    );
  }

  return <WaitlistForm />;
}
```

### Demo Mode Pattern
```tsx
// app/(protected)/dashboard/page.tsx
export default async function Dashboard() {
  const user = await getCurrentUser();

  // Different data sources, same components
  const data = user
    ? await fetchRealData(user.id)
    : getDemoData();

  return (
    <>
      {!user && <DemoBanner />}
      <DashboardLayout data={data} />
    </>
  );
}
```

### Live Updates Pattern
```tsx
// components/landing/HiscoresWidget.tsx
'use client'

export function HiscoresWidget() {
  const [data, setData] = useState<Leaderboard[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/leaderboard?limit=5');
      setData(await res.json());
    };

    fetchData(); // Initial load
    const interval = setInterval(fetchData, 30000); // Every 30s

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {data.map((user, i) => (
        <LeaderboardRow key={user.id} rank={i + 1} user={user} />
      ))}
    </div>
  );
}
```

---

## Risks & Mitigations (Summary)

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Dashboard not ready for demo | Medium | High | Phase 5 independent, can use screenshots, fallback to skip demo |
| Privacy issues with leaderboards | Low | High | Opt-out model, only public data, clear settings notice |
| Empty leaderboards early | High | Medium | Seed with demo users, hide if <10 real users, "be first" messaging |
| App launch date unknown | High | Low | Env variable toggle, waitlist builds audience regardless |
| Low conversion rate | Medium | Medium | A/B test, social proof, multiple CTAs, demo reduces friction |

---

## Success Criteria Checklist

**MVP Launch**:
- [ ] Landing page loads <1s
- [ ] Waitlist form works (email validation, duplicates handled)
- [ ] Hiscores widget shows live data (top 5 + activity feed)
- [ ] Feature sections display with mockups/screenshots
- [ ] `/hiscores` page has all tabs working
- [ ] Demo mode works on `/dashboard`
- [ ] Mobile responsive (375px+)
- [ ] Lighthouse performance >90

**Post-Launch**:
- [ ] 500+ waitlist signups in first month
- [ ] 10%+ conversion rate (visitor → signup)
- [ ] 20%+ visitors check hiscores
- [ ] 15%+ visitors try demo
- [ ] When app launches: 30%+ waitlist converts to download

---

**End of Context Document**
