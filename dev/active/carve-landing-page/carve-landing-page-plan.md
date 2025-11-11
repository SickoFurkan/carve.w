# Carve Landing Page: Marketing Website Implementation Plan

**Last Updated: 2025-01-10**

---

## Executive Summary

Transform the current placeholder homepage (`app/page.tsx`) into a high-converting marketing website for the Carve mobile fitness app. The landing page will showcase the app's unique features (tracking + gamification + social), provide live social proof via public leaderboards, and drive conversions to app downloads (waitlist → store links when launched).

**Core Vision**: Modern, energetic marketing page with "track everything" positioning, featuring live hiscores as social proof and interactive demo using the real dashboard.

**Key Features**:
- Hero section with app download CTA (flexible: waitlist → store links)
- Live "hiscores" widget (top 5 + real-time activity feed)
- Core features showcase (tracking, gamification, social)
- Interactive demo mode (reuses `/dashboard` with sample data)
- Dedicated `/hiscores` page (full leaderboards, multiple tabs, filters)
- Opt-out public profiles for leaderboards
- Conversion-focused (app download primary, web dashboard secondary)

**Timeline**: 4-5 weeks for MVP

---

## Current State Analysis

### Existing Infrastructure
- **Framework**: Next.js 16 with React 19, TypeScript ✅
- **Database**: Supabase with user_stats, profiles, activity_feed tables ✅
- **Styling**: Tailwind CSS 4 ✅
- **Icons**: Lucide React ✅
- **Dashboard**: Being built (can reuse for demo mode) 🚧

### Current Landing Page
- **Location**: `app/page.tsx`
- **Status**: Basic placeholder with 2 sections
- **Content**: Generic "health and fitness" messaging
- **Links**: Wiki and Dashboard (not app-focused)

### Gaps to Address
1. ❌ No app-specific marketing content
2. ❌ No download CTA (App Store/Play Store or waitlist)
3. ❌ No live hiscores/social proof
4. ❌ No feature showcase (tracking, gamification, social)
5. ❌ No interactive demo
6. ❌ No `/hiscores` public leaderboard page
7. ❌ No waitlist system (email capture)

---

## Proposed Future State

### Three-Phase Rollout

**Phase 1: Pre-Launch (App in Development) - THIS PLAN**
- Landing page with "Join Waitlist" CTA
- Email capture system
- Live hiscores from web dashboard users (social proof)
- Interactive demo mode
- Messaging: "Be first when we launch"

**Phase 2: Launch (App Goes Live) - FUTURE**
- Switch CTA to App Store/Play Store links
- Email waitlist: "We're live!"
- Keep all other features

**Phase 3: Growth (Post-Launch) - FUTURE**
- A/B testing headlines/CTAs
- Testimonials from real users
- Press mentions, reviews
- Download count badge

**This plan covers Phase 1 (Pre-Launch).**

---

## Architecture Overview

### Page Structure

```
/ (Landing Page - Replaces current app/page.tsx)
├── Hero Section
│   ├── Headline + Subheadline
│   ├── App mockup/screenshot
│   └── CTA (waitlist or store links)
├── Live Hiscores Widget
│   ├── Top 5 global rankings
│   ├── Live activity feed (scrolling)
│   └── Link to /hiscores
├── Core Features (3 sections)
│   ├── Workout Tracking
│   ├── Nutrition Tracking
│   └── Progress Analytics
├── Gamification Showcase
│   ├── Level/XP system explainer
│   ├── Achievement wall (visual)
│   └── XP formula teaser
├── Social Features
│   ├── Friends/competition
│   └── Activity feed example
├── Demo Teaser
│   ├── "Try Dashboard" CTA
│   └── Links to /dashboard (demo mode)
└── Final CTA
    ├── Join Waitlist (large button)
    └── Social proof (waitlist count)

/hiscores (Public Leaderboards - No login)
├── Tabs (Overall, Workouts, Streaks, PRs)
├── Filters (timeframe, optional: gender, age)
├── Leaderboard table (rank, user, stats)
├── Live activity feed (sidebar)
└── CTA: Join to compete

/dashboard (Already exists, add demo mode)
├── If logged in → real data
├── If not logged in → demo mode
│   ├── Sample data (client-side)
│   ├── Demo banner (sticky)
│   ├── All features work (localStorage)
│   └── CTA: Sign up to track for real
```

### Component Reuse Strategy

**Landing Page Components** (new):
- `components/landing/HeroSection.tsx`
- `components/landing/HiscoresWidget.tsx`
- `components/landing/FeatureCard.tsx`
- `components/landing/AchievementWall.tsx`
- `components/landing/WaitlistForm.tsx`

**Dashboard Components** (reuse for demo):
- `components/dashboard/*` → Used in demo mode with sample data
- NO duplication → same components, different data source

**Shared Components**:
- `components/ui/*` → Buttons, cards, etc. (already exist)
- `components/app/app-header.tsx` → Navigation (adapt for landing)

---

## Implementation Phases

### Phase 1: Waitlist System & Data Infrastructure (Week 1)

**Goal**: Set up email capture, public profiles flag, and data queries for hiscores.

#### 1.1 Create Waitlist Database [Effort: S]
- Create migration: `waitlist` table
  - `id` (uuid)
  - `email` (text, unique)
  - `created_at` (timestamptz)
  - `source` (text - 'hero', 'footer', 'demo', etc.)
  - `notified` (boolean, default false)
- Add index on `email`
- RLS: Public insert, admin read
- **Acceptance**: Can insert emails, prevent duplicates

#### 1.2 Add Public Profile Flag to Users [Effort: S]
- Add migration: `show_on_leaderboard` column to `profiles` table
  - Type: boolean
  - Default: true (opt-out model)
- Add to settings page later (not this phase)
- **Acceptance**: Column exists, defaults to true

#### 1.3 Create Hiscores Data Queries [Effort: M]
- Create function: `get_global_leaderboard(limit_count, timeframe)`
  - Params: limit (int), timeframe ('all_time', 'month', 'week')
  - Joins: user_stats + profiles
  - Filter: show_on_leaderboard = true, is_published = true
  - Order: level DESC, total_xp DESC
  - Returns: username, avatar_url, level, total_xp, current_streak
- Create function: `get_live_activity_feed(limit_count)`
  - Query: activity_feed where type IN ('pr', 'level_up', 'achievement')
  - Filter: user has show_on_leaderboard = true
  - Order: created_at DESC
  - Returns: username, avatar_url, activity_type, activity_data, created_at
- Create function: `get_workouts_leaderboard(timeframe, limit_count)`
  - Count workouts per user in timeframe
  - Order by workout count DESC
- Create function: `get_streaks_leaderboard(limit_count)`
  - Order by current_streak DESC
- **Acceptance**: Functions return correct data, respect privacy flags

#### 1.4 Create Waitlist API Route [Effort: S]
- Create `app/api/waitlist/route.ts`
- POST handler:
  - Validate email format (zod schema)
  - Check if already exists
  - Insert to waitlist table
  - Return success/error
- Rate limiting: Max 3 requests per IP per hour (simple check)
- **Acceptance**: Can submit email, handles duplicates, validates format

**Dependencies**: None (can start immediately)

---

### Phase 2: Landing Page Hero & Structure (Week 1-2)

**Goal**: Build hero section, overall page structure, and navigation.

#### 2.1 Update Navigation for Landing Page [Effort: S]
- Update `components/app/app-header.tsx`
- Landing page nav: Logo, Wiki, Dashboard, Hiscores, Sign In
- Highlight current page
- Mobile: Hamburger menu
- **Acceptance**: Nav works, responsive

#### 2.2 Build Hero Section Component [Effort: M]
- Create `components/landing/HeroSection.tsx`
- Layout: Full viewport height, centered content
- Content:
  - Logo
  - Headline: "Track Everything. Level Up. Win."
  - Subheadline: Elevator pitch (2 sentences)
  - Primary CTA: "Join Waitlist" button (large)
  - Secondary CTA: "Try Demo Dashboard" link (subtle)
  - App mockup/screenshot image
  - Scroll indicator (animated arrow)
- Styling: Clean, modern, energetic
- **Acceptance**: Hero looks professional, CTA prominent

#### 2.3 Build Waitlist Form Component [Effort: M]
- Create `components/landing/WaitlistForm.tsx`
- Input: Email (with validation)
- Button: "Join Waitlist" or "Get Early Access"
- States:
  - Default: Empty input
  - Loading: Spinner on button
  - Success: "You're on the list! Check your email."
  - Error: "Already signed up" or "Invalid email"
- Client-side validation (email format)
- Submits to `/api/waitlist`
- **Acceptance**: Form works, shows all states, validates

#### 2.4 Replace Current Homepage [Effort: S]
- Update `app/page.tsx`
- Remove placeholder content
- Add HeroSection component
- Add scroll container for other sections (to be built)
- Update metadata (title, description, OG tags)
- **Acceptance**: New hero displays, old content removed

**Dependencies**: Phase 1 complete (need waitlist API)

---

### Phase 3: Live Hiscores Widget (Week 2)

**Goal**: Build live hiscores widget showing top 5 + activity feed.

#### 3.1 Build Hiscores Widget Component [Effort: M]
- Create `components/landing/HiscoresWidget.tsx`
- Layout: Full-width section, two-column grid
- Left column: Top 5 Global Rankings
  - Fetch from `get_global_leaderboard(5, 'all_time')`
  - Display: Rank #, avatar, username, level, XP
  - Visual: Card with subtle border, hover effect
- Right column: Live Activity Feed
  - Fetch from `get_live_activity_feed(20)`
  - Auto-scrolling list (smooth animation)
  - Items: Avatar, "@username did X" (PR/level-up/achievement)
  - Time ago (e.g., "2m ago")
- Header: "See Who's Winning Right Now"
- Footer link: "View Full Leaderboards →" (to `/hiscores`)
- **Acceptance**: Widget displays live data, activity scrolls

#### 3.2 Implement Real-Time Updates [Effort: S]
- Use client component with periodic refresh
- Fetch every 30 seconds (or use Supabase Realtime)
- Smooth transition on data update (no jarring reload)
- Fallback: Static data if fetch fails
- **Acceptance**: Data updates without page refresh

#### 3.3 Add to Landing Page [Effort: S]
- Add HiscoresWidget below Hero section
- Spacing: Generous padding, centered
- Background: Light gray or white (contrast with Hero)
- **Acceptance**: Widget displays on homepage, looks integrated

**Dependencies**: Phase 1.3 complete (need data queries)

---

### Phase 4: Feature Showcase Sections (Week 2-3)

**Goal**: Build feature cards showcasing tracking, gamification, and social.

#### 4.1 Build Feature Card Component [Effort: S]
- Create `components/landing/FeatureCard.tsx`
- Props: icon, title, description, screenshot (optional)
- Layout: Icon/emoji at top, text below, screenshot at bottom
- Styling: Clean card with border, hover lift effect
- Responsive: Stack on mobile
- **Acceptance**: Reusable card component

#### 4.2 Build Core Features Section [Effort: M]
- Create section below Hiscores Widget
- Header: "Everything You Need to Track"
- 3 Feature Cards in grid:
  1. **Workout Tracking**
     - Icon: 💪
     - Title: "Log Every Rep"
     - Description: "Track sets, reps, weight. See progress. Beat PRs."
     - Screenshot: Workout logging UI (mockup or real)
  2. **Nutrition Tracking**
     - Icon: 🍎
     - Title: "Fuel Your Gains"
     - Description: "Log meals with macros. Hit protein goals. Build consistency."
     - Screenshot: Meal logging UI
  3. **Progress Analytics**
     - Icon: 📊
     - Title: "Watch Yourself Grow"
     - Description: "Charts, graphs, trends. See what's working."
     - Screenshot: Analytics/charts
- **Acceptance**: 3 cards display, responsive layout

#### 4.3 Build Gamification Section [Effort: M]
- Create section after Features
- Header: "Fitness Meets Gaming"
- Subheader: "Turn workouts into XP. Level up like an RPG."
- Content:
  - Visual: Level progression (Level 1 → Level 50)
  - "How It Works" explainer (5 steps with icons)
  - Achievement Wall: Grid of 6-9 badge icons
    - Use lucide-react icons (Trophy, Star, Flame, Crown, etc.)
    - Color-coded by tier (bronze/silver/gold)
  - Button: "See All Achievements" (future: link to achievements page)
- Background: Dark (#2d2d2d) for contrast
- **Acceptance**: Section looks gamified, visually appealing

#### 4.4 Build Social Features Section [Effort: S]
- Create section after Gamification
- Header: "Train With Friends"
- Layout: 2-column (image + text)
- Left: Screenshot of social activity feed
- Right: Feature list
  - "Add friends, follow progress"
  - "See PRs and achievements"
  - "Compete on leaderboards"
  - "React and comment"
  - "Stay motivated together"
- Optional: Testimonial quote from beta user
- **Acceptance**: Section displays, social vibe

**Dependencies**: None (can work in parallel with Phase 3)

---

### Phase 5: Demo Mode for Dashboard (Week 3)

**Goal**: Enable demo mode on `/dashboard` for non-logged-in users.

#### 5.1 Create Demo Data Generator [Effort: M]
- Create `lib/demo/sample-data.ts`
- Generate realistic sample data:
  - User: "Demo User", Level 15, 2500 XP
  - user_stats: Workouts: 42, Meals: 89, Streak: 7 days
  - workouts: 10 sample workouts (last 30 days)
  - exercises: 3-5 exercises per workout
  - meals: 20 sample meals
  - achievements: 5 unlocked (First Workout, Week Warrior, etc.)
  - activity_feed: 15 sample activities (PRs, level-ups)
- Data structure matches real database schema
- **Acceptance**: Sample data looks realistic

#### 5.2 Update Dashboard to Support Demo Mode [Effort: M]
- Update `app/(protected)/dashboard/page.tsx`
- Check if user logged in:
  - If yes → fetch real data from Supabase
  - If no → load demo data from `sample-data.ts`
- Pass data as props to all dashboard components
- Ensure components accept data as props (not fetch directly)
- **Acceptance**: Dashboard works for both logged-in and demo users

#### 5.3 Build Demo Banner Component [Effort: S]
- Create `components/dashboard/DemoBanner.tsx`
- Sticky banner at top of dashboard (below header)
- Content: "You're viewing demo data - Sign up to track for real"
- CTA button: "Create Account"
- Dismissible: X button (hides banner, stores in localStorage)
- Styling: Subtle yellow/orange background, not intrusive
- **Acceptance**: Banner displays only in demo mode

#### 5.4 Add Demo CTA Throughout Dashboard [Effort: S]
- Add "Create Account" buttons strategically:
  - In demo banner
  - In empty states (e.g., "Log your first real workout")
  - In navigation (replace "Log Out" with "Sign Up")
- Link to `/signup` or show signup modal
- **Acceptance**: Multiple conversion points, not overwhelming

#### 5.5 Test Demo Mode Fully Interactive [Effort: M]
- Test all dashboard features with demo data:
  - Navigation works
  - Charts render
  - Stats display
  - Social feed shows sample activity
  - Achievement badges appear
- Optional: Allow "fake logging" (saves to localStorage, not database)
- **Acceptance**: Demo feels like real dashboard

**Dependencies**: Dashboard components exist (Phase 2+ of dashboard rebuild)

---

### Phase 6: Full Hiscores Page (Week 3-4)

**Goal**: Build dedicated `/hiscores` public leaderboard page.

#### 6.1 Create Hiscores Page Structure [Effort: M]
- Create `app/hiscores/page.tsx`
- Layout: Dashboard-style (reuse AppShell if makes sense)
- Header: "Global Leaderboards"
- Subtext: "See who's dominating. Join to compete."
- Tabs component for switching leaderboards
- Filters component (timeframe, optional: gender, age)
- Leaderboard table component
- Live activity feed (sidebar or bottom)
- CTA section: "Want to see your name here? Join Waitlist"
- **Acceptance**: Page structure renders

#### 6.2 Build Leaderboard Tabs Component [Effort: M]
- Create `components/hiscores/LeaderboardTabs.tsx`
- Tabs:
  - Overall (Level/XP)
  - Workouts (Total logged)
  - Streaks (Longest active)
  - PRs (by exercise - dropdown: Bench, Squat, Deadlift, etc.)
- State management: URL query params (?tab=overall)
- Active tab styling
- Mobile: Dropdown instead of tabs
- **Acceptance**: Tabs switch, update URL

#### 6.3 Build Filters Component [Effort: S]
- Create `components/hiscores/Filters.tsx`
- Filters:
  - Timeframe: All Time, This Month, This Week (default: All Time)
  - Optional: Gender, Age Group (can add later)
- Update URL query params
- **Acceptance**: Filters update data query

#### 6.4 Build Leaderboard Table Component [Effort: M]
- Create `components/hiscores/LeaderboardTable.tsx`
- Columns: Rank, Avatar, Username, Level, XP, Streak, Action
- Rows: Top 50 users (pagination optional)
- Styling: Alternating row colors, hover effect
- Top 3: Special styling (gold/silver/bronze highlights)
- Click username → View profile (future: user profile page)
- **Acceptance**: Table displays data, top 3 highlighted

#### 6.5 Integrate Data Queries [Effort: M]
- Fetch data based on active tab + filters
- Overall tab → `get_global_leaderboard(50, timeframe)`
- Workouts tab → `get_workouts_leaderboard(timeframe, 50)`
- Streaks tab → `get_streaks_leaderboard(50)`
- PRs tab → `get_prs_leaderboard(exercise_type, 50)` (create this function)
- Loading states, error handling
- **Acceptance**: Data loads for all tabs/filters

#### 6.6 Add Live Activity Feed [Effort: S]
- Reuse `HiscoresWidget` activity feed component
- Display on sidebar (desktop) or bottom (mobile)
- Header: "Recent Achievements"
- Auto-refresh every 30s
- **Acceptance**: Activity feed displays, updates

#### 6.7 Add Metadata & SEO [Effort: S]
- Page title: "Carve Leaderboards - See Top Fitness Athletes"
- Description: "Global fitness leaderboards. See who's crushing PRs, hitting streaks, and leveling up."
- OG image: Screenshot of leaderboard
- Canonical URL
- **Acceptance**: SEO optimized

**Dependencies**: Phase 1.3 complete (data queries)

---

### Phase 7: Polish & Conversion Optimization (Week 4)

**Goal**: Final polish, mobile optimization, conversion rate improvements.

#### 7.1 Mobile Optimization [Effort: M]
- Test all landing page sections on mobile (375px, 768px)
  - Hero: Stack vertically, smaller headline
  - Hiscores: Stack columns, activity feed below
  - Features: Single column grid
  - Gamification: Adjust dark section for readability
  - Social: Stack image/text
- Test `/hiscores` page on mobile
  - Tabs → Dropdown
  - Table: Horizontal scroll or simplified columns
  - Filters: Stack vertically
- Test demo dashboard on mobile (already should be responsive)
- **Acceptance**: All pages work well on mobile

#### 7.2 Add App Screenshots/Mockups [Effort: M]
- Create or obtain high-quality app mockups:
  - Hero section: iPhone with dashboard screenshot
  - Feature cards: Individual feature screenshots
  - Social section: Activity feed screenshot
- Optimize images (use next/image, lazy loading)
- Add subtle shadows, 3D effects
- **Acceptance**: Visual assets look professional

#### 7.3 Implement Environment-Based CTA [Effort: S]
- Create env variable: `NEXT_PUBLIC_APP_STATUS`
  - Values: 'waitlist' | 'live'
- If 'waitlist':
  - CTA: "Join Waitlist"
  - Forms collect emails
- If 'live':
  - CTA: "Download Now"
  - Buttons link to App Store / Play Store
  - Hide waitlist forms
- Easy switch when app launches
- **Acceptance**: Can toggle between waitlist/live mode

#### 7.4 Add Social Proof Elements [Effort: S]
- Waitlist count: "Join 1,247 people on the waitlist"
  - Query: `SELECT COUNT(*) FROM waitlist`
  - Update dynamically
- Testimonial section (optional, if have beta users):
  - 2-3 short quotes
  - Username, level, avatar
- Trust badges (optional):
  - "Featured on Product Hunt"
  - "4.9★ Beta Reviews"
- **Acceptance**: Social proof visible, dynamic count

#### 7.5 Performance Optimization [Effort: M]
- Code split landing page components
- Lazy load below-fold sections (use next/dynamic)
- Optimize images (WebP format, responsive sizes)
- Prefetch /hiscores and /dashboard links
- Cache hiscores data (1 minute stale-while-revalidate)
- Run Lighthouse audit
- **Acceptance**: Lighthouse performance >90

#### 7.6 SEO & Metadata [Effort: S]
- Landing page metadata:
  - Title: "Carve - Track Workouts. Level Up. Win."
  - Description: "The fitness app that gamifies your progress. Track PRs, earn XP, compete with friends."
  - OG image: Hero section screenshot
- Sitemap: Include /, /hiscores, /wiki, /dashboard
- Robots.txt: Allow all
- Structured data (schema.org):
  - WebSite
  - Organization
  - SoftwareApplication (when app live)
- **Acceptance**: SEO score >90

#### 7.7 Analytics & Tracking [Effort: S]
- Add event tracking (choose: Google Analytics, Plausible, or Mixpanel)
- Track key events:
  - Waitlist signup
  - Demo dashboard visit
  - Hiscores page visit
  - CTA clicks
- Privacy-compliant (GDPR)
- **Acceptance**: Events tracked, dashboard set up

**Dependencies**: Phases 1-6 complete

---

## Database Schema Details

### waitlist Table
```sql
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT, -- 'hero', 'footer', 'demo', 'hiscores'
  notified BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_waitlist_email ON waitlist(email);
CREATE INDEX idx_waitlist_created_at ON waitlist(created_at DESC);

-- RLS: Public can insert, only admin can read
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join waitlist"
  ON waitlist FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only admin can view waitlist"
  ON waitlist FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');
```

### profiles Update (Public Leaderboard Flag)
```sql
ALTER TABLE profiles
  ADD COLUMN show_on_leaderboard BOOLEAN DEFAULT TRUE;

CREATE INDEX idx_profiles_leaderboard ON profiles(show_on_leaderboard);
```

### Leaderboard Functions

**Global Leaderboard**:
```sql
CREATE OR REPLACE FUNCTION get_global_leaderboard(
  limit_count INT DEFAULT 50,
  timeframe TEXT DEFAULT 'all_time'
)
RETURNS TABLE (
  rank INT,
  username TEXT,
  avatar_url TEXT,
  level INT,
  total_xp INT,
  current_streak INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROW_NUMBER() OVER (ORDER BY us.level DESC, us.total_xp DESC)::INT AS rank,
    p.username,
    p.avatar_url,
    us.level,
    us.total_xp,
    us.current_streak
  FROM user_stats us
  JOIN profiles p ON p.id = us.user_id
  WHERE p.show_on_leaderboard = TRUE
    AND p.is_public = TRUE -- Optional: add is_public flag
  ORDER BY us.level DESC, us.total_xp DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
```

**Live Activity Feed**:
```sql
CREATE OR REPLACE FUNCTION get_live_activity_feed(limit_count INT DEFAULT 20)
RETURNS TABLE (
  username TEXT,
  avatar_url TEXT,
  activity_type TEXT,
  activity_data JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.username,
    p.avatar_url,
    af.activity_type,
    af.activity_data,
    af.created_at
  FROM activity_feed af
  JOIN profiles p ON p.id = af.user_id
  WHERE p.show_on_leaderboard = TRUE
    AND af.activity_type IN ('pr', 'level_up', 'achievement')
    AND af.is_public = TRUE
  ORDER BY af.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
```

**Workouts Leaderboard** (counts workouts in timeframe):
```sql
CREATE OR REPLACE FUNCTION get_workouts_leaderboard(
  timeframe TEXT DEFAULT 'all_time',
  limit_count INT DEFAULT 50
)
RETURNS TABLE (
  rank INT,
  username TEXT,
  avatar_url TEXT,
  workout_count BIGINT
) AS $$
DECLARE
  since_date TIMESTAMPTZ;
BEGIN
  -- Calculate date filter based on timeframe
  CASE timeframe
    WHEN 'week' THEN since_date := NOW() - INTERVAL '7 days';
    WHEN 'month' THEN since_date := NOW() - INTERVAL '30 days';
    ELSE since_date := '1970-01-01'::TIMESTAMPTZ; -- all_time
  END CASE;

  RETURN QUERY
  SELECT
    ROW_NUMBER() OVER (ORDER BY COUNT(w.id) DESC)::INT AS rank,
    p.username,
    p.avatar_url,
    COUNT(w.id) AS workout_count
  FROM workouts w
  JOIN profiles p ON p.id = w.user_id
  WHERE p.show_on_leaderboard = TRUE
    AND w.created_at >= since_date
  GROUP BY p.id, p.username, p.avatar_url
  ORDER BY workout_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
```

---

## Technology Stack

### Core Dependencies (Already Installed)
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase client
- Lucide React icons

### New Dependencies to Install
```bash
pnpm add zod  # Email validation
```

**Rationale**:
- `zod`: Schema validation for waitlist form (email format, required fields)

**Optional** (can add later):
```bash
pnpm add framer-motion  # Scroll animations, transitions
pnpm add react-intersection-observer  # Lazy load sections on scroll
```

---

## Risk Assessment & Mitigation

### Technical Risks

**Risk 1: Dashboard Not Ready for Demo Mode**
- **Likelihood**: Medium
- **Impact**: High
- **Mitigation**:
  - Phase 5 (demo mode) is independent of dashboard rebuild
  - Can use placeholder dashboard if needed
  - Demo data is client-side (doesn't need database)
  - Fallback: Skip demo, just show screenshots

**Risk 2: Hiscores Data Privacy Issues**
- **Likelihood**: Low
- **Impact**: High
- **Mitigation**:
  - Default opt-out model (show_on_leaderboard = true)
  - Clear in settings: "You're on public leaderboards"
  - Only show username, avatar, stats (no personal data)
  - Users can opt-out anytime

**Risk 3: Empty Leaderboards (Not Enough Users)**
- **Likelihood**: High (early on)
- **Impact**: Medium
- **Mitigation**:
  - Seed leaderboards with demo users (clearly labeled)
  - Show web dashboard users only (still social proof)
  - Hide leaderboard section if <10 users
  - Messaging: "Be among the first on the leaderboard"

**Risk 4: App Launch Date Unknown**
- **Likelihood**: High
- **Impact**: Low
- **Mitigation**:
  - Environment variable toggle (waitlist → store links)
  - Can switch in 1 minute when ready
  - Waitlist builds audience (win regardless of timeline)

### Product Risks

**Risk 5: Conversion Rate Too Low**
- **Likelihood**: Medium
- **Impact**: Medium
- **Mitigation**:
  - A/B test headlines (Phase 7)
  - Multiple CTA placements
  - Social proof (waitlist count)
  - Interactive demo reduces friction

**Risk 6: Demo Mode Confuses Users**
- **Likelihood**: Low
- **Impact**: Low
- **Mitigation**:
  - Clear "Demo Data" banner
  - Multiple "Sign Up" CTAs
  - Different styling (subtle visual cue)

---

## Success Metrics

### Launch Metrics (First 30 Days)

**Waitlist**:
- 500+ email signups
- <5% bounce rate on landing page
- 10%+ conversion rate (visitor → signup)

**Engagement**:
- 20%+ visitors check hiscores page
- 15%+ visitors try demo dashboard
- Average time on page >2 minutes

**Social Proof**:
- 50+ users on leaderboard (web dashboard users)
- Activity feed has 100+ events
- Top user reaches Level 20+

**Technical**:
- Landing page load <1s (p95)
- Lighthouse performance >90
- Zero critical bugs
- 99.5% uptime

### Post-Launch Metrics (When App Live)

**App Downloads**:
- 30%+ of waitlist converts to download
- 1000+ downloads in first month
- 4.5+ star rating

**Retention**:
- 50%+ of downloads create account
- 30%+ log first workout
- 20%+ return next day

---

## Timeline Estimates

### Aggressive Timeline (4 weeks, full-time)
- **Week 1**: Phases 1-2 (Waitlist, Hero, Navigation)
- **Week 2**: Phase 3-4 (Hiscores widget, Feature sections)
- **Week 3**: Phase 5-6 (Demo mode, Full hiscores page)
- **Week 4**: Phase 7 (Polish, optimization)

### Moderate Timeline (5 weeks, part-time ~20hr/week)
- **Week 1**: Phase 1
- **Week 2**: Phase 2-3
- **Week 3**: Phase 4
- **Week 4**: Phase 5-6
- **Week 5**: Phase 7

### Conservative Timeline (6 weeks, part-time ~10hr/week)
- **Week 1-2**: Phases 1-2
- **Week 3**: Phase 3
- **Week 4**: Phases 4-5
- **Week 5**: Phase 6
- **Week 6**: Phase 7

**Recommendation**: Moderate timeline (5 weeks). Demo mode can be delayed if dashboard isn't ready.

---

## Required Resources & Dependencies

### Development Resources
- 1 Full-stack developer (can be solo)
- Estimated: 50-70 development hours
- Design assets: App screenshots/mockups (create or use Figma)

### External Dependencies
- **Dashboard components**: Need basic dashboard for demo mode (Phase 5)
  - Can work around: Use screenshots if dashboard not ready
  - Fallback: Skip demo, just show features
- **User data**: Need some web dashboard users for hiscores
  - Mitigation: Seed with demo users if needed

### Tools & Services
- Supabase (already set up) ✅
- Image optimization tool (optional: Figma, Photoshop)
- Analytics (choose: GA4, Plausible, or Mixpanel)

---

## Next Steps

1. **Review & Approve Plan**: Ensure alignment on scope, timeline
2. **Set Up Project Board**: Create tasks from this plan
3. **Start Phase 1**: Waitlist system and data infrastructure
4. **Weekly Progress Check**: Review completed tasks, adjust
5. **Ship MVP**: Deploy with waitlist, iterate based on signups
6. **Switch to Live**: When app ready, toggle env variable

---

**End of Plan**
