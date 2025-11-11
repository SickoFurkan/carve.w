# Carve Landing Page: Task Checklist

**Last Updated: 2025-01-11**

Track your progress through the implementation releases. Mark tasks complete as you go!

---

## How to Use This Checklist

### Priority Labels
- **MUST**: Critical for release, blocks shipping
- **SHOULD**: Important but can be deferred to next release
- **COULD**: Nice-to-have, future enhancement

### Release Strategy
Ship in **3 iterative releases** instead of one monolithic MVP:
1. **Release 1** (Week 1-2): Lean MVP → Waitlist only
2. **Release 2** (Week 3): Social Proof → Add hiscores widget
3. **Release 3** (Week 4-5): Showcase → Feature sections + demo

---

## ⚡ Release 1: Lean MVP (MUST Have)

**Goal**: Get a functional waitlist live ASAP
**Timeline**: Week 1-2 (10-15 hours)

### R1.1: Enhanced Waitlist Database [MUST]
- [ ] Create migration file: `YYYYMMDDHHMMSS_create_waitlist.sql`
- [ ] Add waitlist table with all fields:
  - [ ] id, email, created_at, source
  - [ ] consent_given, consent_version, consent_timestamp
  - [ ] verification_token, verified_at
  - [ ] notified, deleted_at, opt_out_reason
  - [ ] ip_address, user_agent
- [ ] Create indexes:
  - [ ] idx_waitlist_email
  - [ ] idx_waitlist_verification (WHERE verified_at IS NULL)
  - [ ] idx_waitlist_verified (WHERE verified_at IS NOT NULL)
- [ ] Add constraint: email_verified_check
- [ ] Enable RLS
- [ ] Create policies:
  - [ ] "Anyone can join waitlist" (INSERT)
  - [ ] "Only service role can read" (SELECT)
- [ ] Run migration
- [ ] Test: Can insert email, token generated, uniqueness enforced

---

### R1.2: Install Dependencies [MUST]
- [ ] Run: `pnpm add zod`
- [ ] Run: `pnpm add @marsidev/react-turnstile`
- [ ] Verify no conflicts
- [ ] Test: Import works in components

---

### R1.3: Waitlist API Route (Multi-Layer Protection) [MUST]
- [ ] Create `app/api/waitlist/route.ts`
- [ ] Add disposable email domain list
- [ ] Create Zod schema:
  - [ ] Email validation
  - [ ] Turnstile token required
  - [ ] Consent checkbox required (literal true)
  - [ ] Source enum
- [ ] POST handler implementation:
  - [ ] Layer 1: Verify Turnstile with Cloudflare API
  - [ ] Layer 2: Insert to waitlist table
  - [ ] Layer 3: Send verification email (stub for now)
  - [ ] Layer 4: Track analytics event (commented)
  - [ ] Error handling: duplicates (409), invalid (400), server (500)
- [ ] Create `app/api/waitlist/verify/route.ts`
- [ ] GET handler:
  - [ ] Validate token param
  - [ ] Update verified_at + consent_given
  - [ ] Only verify once (WHERE verified_at IS NULL)
  - [ ] Redirect to /?verify=success or /?verify=error
- [ ] Add env variables to `.env.local`:
  - [ ] NEXT_PUBLIC_TURNSTILE_SITE_KEY
  - [ ] TURNSTILE_SECRET_KEY
- [ ] Test: Valid email accepted
- [ ] Test: Disposable email blocked
- [ ] Test: Duplicate email returns 409
- [ ] Test: Bot verification works
- [ ] Test: Verification link updates database

---

### R1.4: Waitlist Form Component [MUST]
- [ ] Create `components/landing/WaitlistForm.tsx`
- [ ] Import Turnstile component
- [ ] Add form state: idle | loading | success | error
- [ ] Add fields: email, consent checkbox, turnstile token
- [ ] Handle submit:
  - [ ] POST to /api/waitlist
  - [ ] Show loading state
  - [ ] Handle success (show success message)
  - [ ] Handle errors (show error message)
- [ ] Success state UI:
  - [ ] Green background
  - [ ] "Check your inbox" message
- [ ] Form validation:
  - [ ] Email required
  - [ ] Consent required
  - [ ] Turnstile token required
- [ ] Consent checkbox with link to /privacy
- [ ] Test all states (idle, loading, success, error)
- [ ] Test: Form submits correctly
- [ ] Test: Success message shows after submit
- [ ] Test: Error messages display

---

### R1.5: Hero Section Component [MUST]
- [ ] Create `components/landing/HeroSection.tsx`
- [ ] Layout: Full viewport height, centered
- [ ] Left column:
  - [ ] Headline: "Track Everything. Level Up. Win."
  - [ ] Subheadline (2 sentences)
  - [ ] WaitlistForm component
  - [ ] Social proof: "Join X athletes waiting"
- [ ] Right column:
  - [ ] App mockup placeholder (aspect-[9/19])
  - [ ] TODO comment to replace with screenshot
- [ ] Scroll indicator (animated arrow)
- [ ] Responsive:
  - [ ] Desktop: 2 columns
  - [ ] Mobile: Stacked, smaller headline
- [ ] Test: Hero displays correctly
- [ ] Test: Responsive on mobile (375px)
- [ ] Test: Scroll indicator animates

---

### R1.6: Update Homepage [MUST]
- [ ] Update `app/page.tsx`
- [ ] Remove old placeholder content
- [ ] Add HeroSection component
- [ ] Update metadata:
  - [ ] Title: "Carve - Track Workouts. Level Up. Win."
  - [ ] Description: Marketing pitch
  - [ ] OpenGraph tags
- [ ] Add TODO for og:image
- [ ] Test: New homepage displays
- [ ] Test: Metadata appears in page source
- [ ] Test: No console errors

---

### R1.7: Privacy Policy & Terms Pages [MUST]
- [ ] Create `app/privacy/page.tsx`
- [ ] Add metadata (title)
- [ ] Content sections:
  - [ ] 1. Information We Collect
  - [ ] 2. How We Use Your Information
  - [ ] 3. Data Retention
  - [ ] 4. Your Rights (GDPR)
  - [ ] Contact email
- [ ] Create `app/terms/page.tsx`
- [ ] Add metadata (title)
- [ ] Basic terms content (TODO for full terms)
- [ ] Test: /privacy loads
- [ ] Test: /terms loads
- [ ] Test: Links from waitlist form work
- [ ] Test: Prose styling applied

---

### R1.8: Analytics Setup [MUST]
- [ ] Sign up for Plausible Analytics
- [ ] Add domain: carve.wiki
- [ ] Create `lib/analytics.ts`
- [ ] Export `track` function
- [ ] Update `app/layout.tsx`:
  - [ ] Add Plausible script tag
  - [ ] data-domain="carve.wiki"
- [ ] Add window.plausible type declaration
- [ ] Test: Plausible script loads
- [ ] Test: Events can be tracked
- [ ] Test: Dashboard shows events

---

### Release 1 Acceptance Criteria (Ship Checklist)
- [ ] Landing page live at carve.wiki
- [ ] Waitlist form accepts emails
- [ ] Double opt-in flow works end-to-end
- [ ] Privacy policy accessible
- [ ] Terms accessible
- [ ] Mobile responsive (test on 375px)
- [ ] Lighthouse performance >90
- [ ] Lighthouse SEO >90
- [ ] No console errors
- [ ] Analytics tracking waitlist signups

**Estimated Effort**: 10-15 hours

---

## 🏆 Release 2: Social Proof (SHOULD Have)

**Goal**: Add live hiscores widget for social proof
**Timeline**: Week 3 (8-12 hours)

### R2.1: Add Leaderboard Consent Column [SHOULD]
- [ ] Create migration: `YYYYMMDDHHMMSS_add_leaderboard_consent.sql`
- [ ] ALTER TABLE profiles ADD COLUMN leaderboard_consent_at TIMESTAMPTZ
- [ ] Create index: idx_profiles_leaderboard_consent
- [ ] Decide: Grandfather existing users (TRUE) or require opt-in (NULL)?
- [ ] Run migration
- [ ] Test: Column exists
- [ ] Test: Index created

---

### R2.2: Create Leaderboard Query Functions [SHOULD]
- [ ] Create migration: `YYYYMMDDHHMMSS_create_leaderboard_functions.sql`
- [ ] Create function: get_global_leaderboard(limit_count INT)
  - [ ] Returns: rank, username, avatar_url, level, total_xp, current_streak
  - [ ] Joins: user_stats + profiles
  - [ ] Filters:
    - [ ] show_on_leaderboard = TRUE
    - [ ] leaderboard_consent_at IS NOT NULL
    - [ ] deleted_at IS NULL
  - [ ] Order: level DESC, total_xp DESC, created_at ASC (tiebreaker)
  - [ ] ROW_NUMBER() for rank
- [ ] Create function: get_live_activity_feed(limit_count INT)
  - [ ] Returns: username, avatar_url, activity_type, activity_data, created_at
  - [ ] Joins: activity_feed + profiles
  - [ ] Filters:
    - [ ] show_on_leaderboard = TRUE
    - [ ] leaderboard_consent_at IS NOT NULL
    - [ ] activity_type IN ('pr', 'level_up', 'achievement')
    - [ ] is_public = TRUE
  - [ ] Order: created_at DESC
- [ ] Run migration
- [ ] Test both functions with sample data
- [ ] Test: Respect consent flags
- [ ] Run EXPLAIN ANALYZE (ensure <100ms)

---

### R2.3: Leaderboard API Route (with Caching) [SHOULD]
- [ ] Create `app/api/leaderboard/route.ts`
- [ ] GET handler:
  - [ ] Parse limit query param (default 5)
  - [ ] Call supabase.rpc('get_global_leaderboard')
  - [ ] Error handling
  - [ ] Return JSON with caching headers:
    - [ ] Cache-Control: s-maxage=30, stale-while-revalidate=60
- [ ] Test: API returns data
- [ ] Test: Limit parameter works
- [ ] Test: Caching headers present
- [ ] Test: Error handling (if DB down)

---

### R2.4: Hiscores Widget Component [SHOULD]
- [ ] Create `components/landing/HiscoresWidget.tsx`
- [ ] Add type: LeaderboardEntry
- [ ] Add DEMO_USERS constant (2-3 seed users)
- [ ] Component props: initialData (SSR)
- [ ] State: data (from initialData), isLoading
- [ ] useEffect:
  - [ ] Fetch /api/leaderboard?limit=5
  - [ ] Update every 30s (setInterval)
  - [ ] Cleanup interval
- [ ] Empty state handling:
  - [ ] If data.length === 0: Show "Be the First Champion"
  - [ ] If data.length < 5: Merge with DEMO_USERS, label as "Demo"
- [ ] Render:
  - [ ] Section header: "See Who's Winning Right Now"
  - [ ] Left: Top 5 list (cards)
    - [ ] Rank #, avatar, username, level, XP
    - [ ] #1 gets gold background
    - [ ] Demo users get opacity-60 + "Demo" label
  - [ ] Right: Activity feed (placeholder for now)
  - [ ] Footer link: "View Full Leaderboards →" to /hiscores
- [ ] Test: Widget displays top 5
- [ ] Test: Empty state shows
- [ ] Test: Seed data merges correctly
- [ ] Test: Polling works (30s)
- [ ] Test: No flash on initial load (SSR data)

---

### R2.5: Update Homepage with Hiscores Widget [SHOULD]
- [ ] Update `app/page.tsx`
- [ ] Make HomePage async
- [ ] Fetch initial leaderboard data:
  - [ ] await fetch('/api/leaderboard?limit=5')
  - [ ] { next: { revalidate: 30 } } for ISR
  - [ ] .catch(() => []) for error handling
- [ ] Pass initialData to HiscoresWidget
- [ ] Add widget after HeroSection
- [ ] Test: SSR data loads
- [ ] Test: ISR revalidates every 30s
- [ ] Test: Widget displays below hero

---

### Release 2 Acceptance Criteria (Ship v1.1)
- [ ] Hiscores widget shows live data
- [ ] SSR initial data (no flash)
- [ ] Client polls every 30s
- [ ] Edge caching working (check response headers)
- [ ] Empty states graceful (tested with 0 users)
- [ ] Seed data shows if <5 users
- [ ] All queries respect leaderboard_consent_at
- [ ] API response time <100ms
- [ ] No layout shift on updates

**Estimated Effort**: 8-12 hours

---

## 🎨 Release 3: Showcase + Demo (SHOULD Have)

**Goal**: Full feature showcase and interactive demo
**Timeline**: Week 4-5 (12-16 hours)

### R3.1: Demo Data Generator [SHOULD]
- [ ] Create `lib/demo/sample-data.ts`
- [ ] Export function: getDemoData()
- [ ] Generate realistic data:
  - [ ] profile: username, avatar_url, level, total_xp
  - [ ] stats: workouts_count, meals_count, current_streak, max_streak
  - [ ] workouts: 10 sample workouts (varied exercises, last 30 days)
  - [ ] exercises: 3-5 per workout (sets, reps, weight)
  - [ ] meals: 20 sample meals (varied times, macros)
  - [ ] achievements: 5 unlocked badges
  - [ ] activityFeed: 15 sample activities (PRs, level-ups)
- [ ] Test: Data structure matches real schema
- [ ] Test: Data looks realistic

---

### R3.2: Demo Route [SHOULD]
- [ ] Create `app/demo/page.tsx`
- [ ] Import getDemoData
- [ ] Import DemoBanner, DashboardLayout
- [ ] Add metadata:
  - [ ] title: "Demo Dashboard - Carve"
  - [ ] robots: "noindex"
- [ ] Component:
  - [ ] Call getDemoData()
  - [ ] Render DemoBanner
  - [ ] Render DashboardLayout with data + mode="demo"
- [ ] Test: /demo loads
- [ ] Test: No auth errors
- [ ] Test: Demo data renders

---

### R3.3: Demo Banner Component [SHOULD]
- [ ] Create `components/dashboard/DemoBanner.tsx`
- [ ] Client component ('use client')
- [ ] State: dismissed (from localStorage)
- [ ] useEffect: Check localStorage on mount
- [ ] handleDismiss: Set localStorage, update state
- [ ] Render:
  - [ ] Sticky top-0 z-50
  - [ ] Yellow background (bg-yellow-50)
  - [ ] Message: "Demo Mode: You're viewing sample data"
  - [ ] Link: "Sign up to track for real"
  - [ ] X button to dismiss
- [ ] Return null if dismissed
- [ ] Test: Banner shows in demo
- [ ] Test: Dismiss button works
- [ ] Test: Persists across page refreshes

---

### R3.4: Feature Card Component [SHOULD]
- [ ] Create `components/landing/FeatureCard.tsx`
- [ ] Props: icon (LucideIcon), title, description, screenshot (optional)
- [ ] Layout:
  - [ ] Icon at top (w-12 h-12)
  - [ ] Title (text-xl font-semibold)
  - [ ] Description (text-gray-600)
  - [ ] Screenshot placeholder (if provided)
- [ ] Styling:
  - [ ] White background, border
  - [ ] hover:shadow-lg transition
  - [ ] Padding p-6
- [ ] Test: Renders with props
- [ ] Test: Hover effect works

---

### R3.5: Feature Sections on Homepage [SHOULD]
- [ ] Update `app/page.tsx`
- [ ] Import Lucide icons: Dumbbell, Apple, BarChart3
- [ ] Import FeatureCard
- [ ] Add section after HiscoresWidget:
  - [ ] Section bg-gray-50, py-16
  - [ ] Header: "Everything You Need to Track"
  - [ ] Grid: 3 columns (desktop), 1 column (mobile)
  - [ ] 3 FeatureCards:
    1. Dumbbell: "Log Every Rep" (tracking)
    2. Apple: "Fuel Your Gains" (nutrition)
    3. BarChart3: "Watch Yourself Grow" (analytics)
- [ ] Test: 3 cards display
- [ ] Test: Grid responsive
- [ ] Test: Icons render

---

### R3.6: Update DashboardLayout to Accept Data Prop [SHOULD]
- [ ] Update `components/dashboard/DashboardLayout.tsx`
- [ ] Add props: data (any), mode ('live' | 'demo')
- [ ] Pass data to child components (no DB fetching)
- [ ] Ensure components accept data as props
- [ ] Test: Works with real data (mode='live')
- [ ] Test: Works with demo data (mode='demo')
- [ ] Test: No DB calls when mode='demo'

---

### Release 3 Acceptance Criteria (Ship v1.2)
- [ ] Feature sections tell compelling story
- [ ] `/demo` route works independently
- [ ] Demo banner displays and dismisses
- [ ] Demo data renders in dashboard components
- [ ] No auth errors on demo route
- [ ] 3 feature cards responsive
- [ ] Professional visual hierarchy
- [ ] All CTAs point to /signup or waitlist
- [ ] Mobile tested (375px+)

**Estimated Effort**: 12-16 hours

---

## 🚀 Post-MVP: Future Releases (COULD Have)

**Timeline**: Week 6+ (as needed)

### Full Hiscores Page [COULD]
- [ ] Create `app/hiscores/page.tsx`
- [ ] Multiple tabs: Overall, Workouts, Streaks, PRs
- [ ] Timeframe filters: All Time, Month (rolling 30d), Week (rolling 7d)
- [ ] Leaderboard table (top 50, pagination)
- [ ] Full activity feed sidebar
- [ ] Mobile: Tabs become dropdown
- [ ] Test all tabs + filters

**Estimated Effort**: 20+ hours

---

### Gamification Showcase Section [COULD]
- [ ] Level progression visual (1 → 50)
- [ ] Achievement wall grid (9 badges)
- [ ] "How It Works" explainer (5 steps)
- [ ] XP formula teaser
- [ ] Dark background (#2d2d2d)

**Estimated Effort**: 8-12 hours

---

### Performance Optimization [COULD]
- [ ] Code splitting: next/dynamic for below-fold
- [ ] Image optimization: WebP, responsive sizes
- [ ] Lazy load sections with react-intersection-observer
- [ ] Prefetch /hiscores and /demo links
- [ ] Run Lighthouse audit
- [ ] Fix issues (target >95 performance)

**Estimated Effort**: 6-10 hours

---

### Advanced Leaderboard Functions [COULD]
- [ ] get_workouts_leaderboard(timeframe, limit)
- [ ] get_streaks_leaderboard(limit)
- [ ] get_prs_leaderboard(exercise_type, limit)
- [ ] Add indexes for each query
- [ ] Test performance with 10k+ users

**Estimated Effort**: 6-8 hours

---

### A/B Testing Framework [COULD]
- [ ] Choose tool (PostHog, Vercel)
- [ ] Test variant headlines
- [ ] Test CTA button text
- [ ] Track conversion rates
- [ ] Document winning variants

**Estimated Effort**: 4-6 hours

---

### Testimonials Section [COULD]
- [ ] Collect beta user quotes
- [ ] Create TestimonialCard component
- [ ] Add after Social Features section
- [ ] 2-3 quotes with avatar, username, level

**Estimated Effort**: 3-4 hours

---

## Progress Tracking

### Release 1: Lean MVP
**Status**: ☐ Not Started
**Tasks**: 0/47 complete
**Estimated**: 10-15 hours
**Priority**: MUST HAVE (blocks all other releases)

### Release 2: Social Proof
**Status**: ☐ Not Started
**Tasks**: 0/17 complete
**Estimated**: 8-12 hours
**Priority**: SHOULD HAVE (major value add)

### Release 3: Showcase + Demo
**Status**: ☐ Not Started
**Tasks**: 0/14 complete
**Estimated**: 12-16 hours
**Priority**: SHOULD HAVE (completes vision)

### Post-MVP Features
**Status**: ☐ Not Started
**Tasks**: 0/18+ complete
**Estimated**: 40+ hours
**Priority**: COULD HAVE (future enhancements)

---

## Timeline Summary

**Realistic Part-Time Schedule** (20hr/week):

| Week | Release | Tasks | Hours | Ship? |
|------|---------|-------|-------|-------|
| 1-2 | Release 1: Lean MVP | 47 | 10-15 | ✅ SHIP |
| 3 | Release 2: Social Proof | 17 | 8-12 | ✅ SHIP v1.1 |
| 4-5 | Release 3: Showcase | 14 | 12-16 | ✅ SHIP v1.2 |
| 6+ | Post-MVP | TBD | 40+ | Future |

**Total for 3 Releases**: 30-43 hours

---

## Daily Checklist (Use During Development)

**Before Starting Each Day**:
- [ ] Review current release goals
- [ ] Check which tasks are in progress
- [ ] Estimate hours for today's work

**During Development**:
- [ ] Mark tasks as completed immediately (don't batch)
- [ ] Test each task as you complete it
- [ ] Commit frequently with clear messages
- [ ] Update this checklist in real-time

**End of Day**:
- [ ] Count completed tasks
- [ ] Update progress percentages
- [ ] Commit all changes
- [ ] Plan tomorrow's tasks

---

## Acceptance Testing Checklist

### Before Shipping Release 1
- [ ] Waitlist form works on Chrome, Firefox, Safari
- [ ] Mobile tested on iOS Safari, Android Chrome
- [ ] Double opt-in flow tested end-to-end
- [ ] Privacy policy reviewed (legal?)
- [ ] Analytics tracking verified
- [ ] Lighthouse scores >90 (performance + SEO)
- [ ] No console errors or warnings
- [ ] Git committed, pushed
- [ ] Deployed to production
- [ ] Smoke test on live site

### Before Shipping Release 2
- [ ] Hiscores widget displays real data
- [ ] Empty states tested (0 users, <5 users)
- [ ] Polling verified (30s interval)
- [ ] Cache headers verified (check Network tab)
- [ ] Consent flags enforced (test with/without consent)
- [ ] Mobile responsive
- [ ] No performance regression (Lighthouse)

### Before Shipping Release 3
- [ ] `/demo` route tested without login
- [ ] Demo banner dismisses
- [ ] Feature cards look professional
- [ ] All screenshots/mockups high quality
- [ ] CTAs all work (link to correct pages)
- [ ] Mobile tested thoroughly

---

**End of Task Checklist**
