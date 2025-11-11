# Carve Landing Page: Context & Key Decisions

**Last Updated: 2025-01-11**

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
  // Show: "Join Waitlist" → Email capture with double opt-in
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

### 2. Demo Strategy: Separate Demo Route (Clean Architecture)

**Decision**: `/demo` route with same visual components as dashboard, but no auth dependencies

**Architecture**:
```typescript
// app/demo/page.tsx (NO AUTH REQUIRED)
import { getDemoData } from '@/lib/demo/sample-data';

export default function DemoPage() {
  const data = getDemoData(); // Pure client-side, no DB calls

  return (
    <>
      <DemoBanner />
      <DashboardLayout data={data} mode="demo" />
    </>
  );
}

// app/(protected)/dashboard/page.tsx (AUTH REQUIRED)
export default async function Dashboard() {
  const user = await getCurrentUser(); // Always has user
  const data = await fetchRealData(user.id);

  return <DashboardLayout data={data} mode="live" />;
}
```

**Rationale**:
- ✅ Zero auth conflicts (demo never touches protected routes)
- ✅ No risk of data leakage or RLS bypass
- ✅ Same visual components (DashboardLayout accepts data prop)
- ✅ Can show different CTAs in demo mode
- ✅ Easier to test (no auth mocking needed)

**Alternative Considered**: Demo mode inside `(protected)/dashboard`
- Rejected: Auth middleware expects valid session, components call RLS-protected queries

---

### 3. Social Proof: Live Hiscores Widget (Unique Differentiator)

**Decision**: Show real-time leaderboards and activity feed on landing page

**Features**:
- Top 5 global rankings (level/XP)
- Live activity feed (PRs, level-ups, achievements scrolling)
- SSR initial data + client-side updates every 30s
- Edge caching (30s CDN cache)
- Graceful empty states (seed data if <10 users)
- Links to full `/hiscores` page

**Rationale**:
- Unique feature (most fitness apps don't show live leaderboards publicly)
- Social proof: "Real people are using this right now"
- Motivational: "I want to be on that leaderboard"
- Builds FOMO: "Join before spots fill up"

**Technical Implementation**:
```typescript
// app/page.tsx (Server Component)
const initialData = await fetch('/api/leaderboard?limit=5', {
  next: { revalidate: 30 } // ISR cache
});

// components/landing/HiscoresWidget.tsx
export function HiscoresWidget({ initialData }) {
  const [data, setData] = useState(initialData); // No flash on load

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch('/api/leaderboard?limit=5');
      setData(await res.json());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Empty state handling
  if (data.length === 0) return <EmptyLeaderboard />;
  if (data.length < 10) return <LeaderboardWithSeedData data={[...data, ...DEMO_USERS]} />;

  return <LeaderboardTable data={data} />;
}
```

**Privacy**: Only users with explicit consent (`leaderboard_consent_at IS NOT NULL`)

---

### 4. Public Leaderboards: Explicit Consent Model (GDPR-Compliant)

**Decision**: Users must explicitly opt-in to appear on public leaderboards

**Implementation**:
```sql
-- profiles table
ALTER TABLE profiles ADD COLUMN leaderboard_consent_at TIMESTAMPTZ;

-- RLS: Only show users who explicitly consented
CREATE POLICY "public_leaderboard"
  ON profiles FOR SELECT
  USING (
    show_on_leaderboard = TRUE
    AND leaderboard_consent_at IS NOT NULL
    AND deleted_at IS NULL
  );
```

**Consent Flow**:
1. During onboarding: "Want to appear on public leaderboards? 🏆"
   - Checkbox: "Yes, show my progress publicly"
   - Default: **Unchecked** (opt-in, not opt-out)
2. Settings page: Toggle with clear explanation
   - "Your username, avatar, and stats will be visible on carve.wiki/hiscores"
   - On enable: Record `leaderboard_consent_at = NOW()`
   - On disable: Set `show_on_leaderboard = FALSE`

**What's Public**:
- ✅ Username, avatar, level, XP, current streak
- ❌ Email, real name, workout details, meal logs

**Privacy Compliance**:
- GDPR Article 6: Consent as legal basis
- Clear opt-in (not dark patterns)
- Easy to revoke in settings
- Data minimization (only necessary fields)
- Audit trail (`leaderboard_consent_at` timestamp)

**Alternative Considered**: Opt-out model (default visible)
- Rejected: GDPR requires explicit consent for public data display

---

### 5. Waitlist: Double Opt-In + Anti-Abuse (Security-First)

**Decision**: Multi-layer protection against spam and GDPR-compliant email collection

**Database Schema**:
```sql
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT, -- 'hero', 'footer', 'demo'

  -- ✅ Consent tracking (GDPR)
  consent_given BOOLEAN DEFAULT FALSE,
  consent_version TEXT, -- e.g., 'privacy-v1.0'
  consent_timestamp TIMESTAMPTZ,
  verification_token UUID,
  verified_at TIMESTAMPTZ,

  -- ✅ Lifecycle
  notified BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ, -- Soft delete (right to be forgotten)
  opt_out_reason TEXT,

  -- ✅ Anti-abuse
  ip_address INET,
  user_agent TEXT
);

CREATE INDEX idx_waitlist_verification ON waitlist(verification_token)
  WHERE verified_at IS NULL;
CREATE INDEX idx_waitlist_verified ON waitlist(verified_at)
  WHERE verified_at IS NOT NULL;
```

**Multi-Layer Protection**:

1. **Client-side: Bot Detection**
   ```tsx
   import { Turnstile } from '@marsidev/react-turnstile';

   <Turnstile
     siteKey={process.env.NEXT_PUBLIC_TURNSTILE_KEY}
     onSuccess={setToken}
   />
   ```

2. **Server-side: Validation**
   ```typescript
   // app/api/waitlist/route.ts
   const schema = z.object({
     email: z.string()
       .email()
       .refine(email => {
         const disposable = ['tempmail.com', 'guerrillamail.com'];
         return !disposable.includes(email.split('@')[1]);
       }),
     turnstileToken: z.string(),
     consentGiven: z.literal(true) // Must explicitly check checkbox
   });
   ```

3. **Rate Limiting: IP + Email**
   ```typescript
   // Edge Function with Upstash Redis
   const { success } = await rateLimit.limit(ip, {
     window: '1h',
     max: 3
   });
   ```

4. **Double Opt-In Flow**:
   - User submits email
   - Send verification email: "Confirm your spot on the waitlist"
   - Click link → `verified_at = NOW()`, `consent_given = TRUE`
   - Show success: "You're on the list! Check your inbox for updates."

**Email Deliverability**:
- Use transactional email service (Resend, SendGrid)
- SPF/DKIM/DMARC configured
- Monitor bounce/complaint rates
- Unsubscribe link in all emails

---

### 6. Tone & Messaging: Direct + Energetic (Not Corporate)

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

### 7. Feature Prioritization: Tracking > Gamification > Social

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

### 8. Hiscores Page Design: Multiple Leaderboards + Filters

**Decision**: Dedicated `/hiscores` page with tabs and filters for different competition types

**Leaderboards**:
- Overall (Level/XP)
- Workouts (Total logged)
- Streaks (Longest active)
- PRs (by exercise: Bench, Squat, Deadlift, etc.)

**Filters**:
- Timeframe: All Time, This Month (rolling 30d), This Week (rolling 7d)
- (Future) Gender, Age Group

**Rationale**:
- Different people compete in different ways
- Some want overall ranking (level)
- Some want workout consistency (count)
- Some want streaks (habits)
- Some want strength PRs
- More leaderboards = more ways to "win"

**Technical Specs** (see plan for full query definitions):
- All queries respect `leaderboard_consent_at IS NOT NULL`
- Pagination: Top 50 per page
- Tiebreakers defined (e.g., older user wins)
- Indexes optimized for each query
- Edge caching: 1 minute stale-while-revalidate

---

### 9. Mobile-First Design (Then Desktop Enhancement)

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

**Implementation**: Test mobile from Week 1, not as afterthought in Phase 7

---

## Key Files & Structure

### Current Files
- `app/page.tsx` - Placeholder homepage (will be replaced)
- `app/(protected)/dashboard/page.tsx` - Dashboard (protected route)

### New Files to Create

**Landing Page Components**:
```
components/
  landing/
    HeroSection.tsx          # Main hero with CTA
    HiscoresWidget.tsx       # Live leaderboard widget
    FeatureCard.tsx          # Reusable feature card
    AchievementWall.tsx      # Gamification showcase
    WaitlistForm.tsx         # Email capture form with Turnstile
```

**Demo Route** (NEW):
```
app/
  demo/
    page.tsx                 # Standalone demo (no auth)
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
  YYYYMMDDHHMMSS_add_leaderboard_consent.sql
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

### To Install (Phase 1)
```bash
pnpm add zod                           # Email validation
pnpm add @marsidev/react-turnstile     # Bot protection
pnpm add @upstash/ratelimit            # Server-side rate limiting
pnpm add @upstash/redis                # Redis for rate limits
```

### Optional (Later)
```bash
pnpm add framer-motion                 # Scroll animations
pnpm add react-intersection-observer   # Lazy loading
```

---

## Database Schema Summary

### New Tables (1 total)

**waitlist** (enhanced with consent + anti-abuse):
- `id` (uuid)
- `email` (text, unique)
- `created_at` (timestamptz)
- `source` (text)
- `consent_given` (boolean, default false)
- `consent_version` (text)
- `consent_timestamp` (timestamptz)
- `verification_token` (uuid)
- `verified_at` (timestamptz)
- `notified` (boolean)
- `deleted_at` (timestamptz)
- `opt_out_reason` (text)
- `ip_address` (inet)
- `user_agent` (text)

### Schema Updates

**profiles** (add consent tracking):
- `show_on_leaderboard` (boolean, default false) -- Changed to opt-in
- `leaderboard_consent_at` (timestamptz) -- NEW: Explicit consent timestamp

### Database Functions (5 total)

All functions enforce `leaderboard_consent_at IS NOT NULL` privacy filter.

1. `get_global_leaderboard(limit, timeframe)` → Top users by level/XP
2. `get_live_activity_feed(limit)` → Recent PRs/achievements/level-ups
3. `get_workouts_leaderboard(timeframe, limit)` → Most workouts logged
4. `get_streaks_leaderboard(limit)` → Longest active streaks
5. `get_prs_leaderboard(exercise, limit)` → Top PRs by exercise type

---

## Analytics & Metrics

### KPI Tracking Matrix

| Metric | Event Name | Tool | Owner | Cadence |
|--------|-----------|------|-------|---------|
| Waitlist signups | `waitlist_verified` | Plausible + Supabase | Marketing | Daily |
| Bounce rate | (automatic) | Plausible | Marketing | Weekly |
| Demo visits | `demo_page_view` | Plausible | Product | Daily |
| Hiscores visits | `hiscores_page_view` | Plausible | Product | Weekly |
| Avg. time on page | (automatic) | Plausible | Marketing | Weekly |
| Waitlist → Download | `app_install` | Branch.io | Growth | Monthly |
| Download → Signup | `user_signup` | Supabase | Growth | Daily |

### Implementation
```typescript
// lib/analytics.ts
export const track = (event: string, props?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    window.plausible?.(event, { props });
  }
};

// Usage
track('waitlist_verified', { source: 'hero' });
track('demo_page_view');
track('hiscores_page_view', { tab: 'overall' });
```

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Spam waitlist signups | High | Medium | Turnstile + double opt-in + rate limiting + disposable email blocking |
| GDPR non-compliance | Medium | **Critical** | Explicit consent checkboxes, audit trail, privacy policy, easy opt-out |
| Demo route breaks auth flow | Low | High | Separate `/demo` route (never touches `(protected)`) |
| Empty leaderboards early | High | Medium | Seed with demo users (labeled), hide if <10 real users, "be first" messaging |
| High database load from polling | Medium | Medium | Edge caching (30s), SSR initial data, consider Supabase Realtime |
| Low conversion rate | Medium | Medium | A/B test, social proof (waitlist count), multiple CTAs, demo reduces friction |

---

## Success Criteria

### MVP Launch (Release 1)
- [ ] Landing page loads <1s (Lighthouse >90)
- [ ] Waitlist form works (double opt-in, bot protection)
- [ ] Privacy policy + Terms of Service pages live
- [ ] Basic navigation responsive
- [ ] SEO metadata configured

### Release 2 (Social Proof)
- [ ] Hiscores widget shows live data (top 5 + activity feed)
- [ ] Edge caching working (30s revalidation)
- [ ] Empty states graceful (seed data or hide)
- [ ] All leaderboard queries respect consent flags

### Release 3 (Showcase + Demo)
- [ ] Feature sections display with mockups/screenshots
- [ ] `/demo` route works independently
- [ ] `/hiscores` page has all tabs working
- [ ] Mobile responsive (375px+)
- [ ] Analytics tracking all key events

### Post-Launch KPIs
- [ ] 500+ **verified** waitlist signups in first month
- [ ] 10%+ conversion rate (visitor → signup)
- [ ] 20%+ visitors check hiscores
- [ ] 15%+ visitors try demo
- [ ] When app launches: 30%+ waitlist converts to download

---

**End of Context Document**
