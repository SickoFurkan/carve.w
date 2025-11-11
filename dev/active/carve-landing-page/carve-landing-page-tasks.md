# Carve Landing Page: Task Checklist

**Last Updated: 2025-01-10**

Track your progress through the implementation phases. Mark tasks complete as you go!

---

## Phase 1: Waitlist System & Data Infrastructure

### 1.1 Create Waitlist Database
- [ ] Create migration: `waitlist` table
  - [ ] Fields: id (uuid), email (text unique), created_at, source, notified (boolean)
  - [ ] Index on email
  - [ ] Index on created_at DESC
- [ ] Create RLS policies:
  - [ ] Public INSERT (anyone can join)
  - [ ] Admin-only SELECT
- [ ] Run migration
- [ ] Test: Can insert email, duplicates prevented

### 1.2 Add Public Profile Flag to Users
- [ ] Create migration: Add `show_on_leaderboard` column to profiles
  - [ ] Type: boolean
  - [ ] Default: true (opt-out model)
- [ ] Add index on show_on_leaderboard
- [ ] Run migration
- [ ] Test: Column exists, defaults to true for new users

### 1.3 Create Hiscores Data Queries
- [ ] Create function: `get_global_leaderboard(limit_count, timeframe)`
  - [ ] Join user_stats + profiles
  - [ ] Filter: show_on_leaderboard = true
  - [ ] Order: level DESC, total_xp DESC
  - [ ] Return: rank, username, avatar_url, level, total_xp, current_streak
- [ ] Create function: `get_live_activity_feed(limit_count)`
  - [ ] Query activity_feed
  - [ ] Filter: type IN ('pr', 'level_up', 'achievement'), show_on_leaderboard = true
  - [ ] Order: created_at DESC
  - [ ] Return: username, avatar_url, activity_type, activity_data, created_at
- [ ] Create function: `get_workouts_leaderboard(timeframe, limit_count)`
  - [ ] Count workouts per user in timeframe
  - [ ] Order by count DESC
  - [ ] Return: rank, username, avatar_url, workout_count
- [ ] Create function: `get_streaks_leaderboard(limit_count)`
  - [ ] Order by current_streak DESC
  - [ ] Return: rank, username, avatar_url, current_streak
- [ ] Create function: `get_prs_leaderboard(exercise_type, limit_count)` (for later)
  - [ ] Query exercises where is_pr = true
  - [ ] Group by user, exercise_name
  - [ ] Order by weight DESC
- [ ] Run migration
- [ ] Test: All functions return correct data, respect privacy flags

### 1.4 Create Waitlist API Route
- [ ] Create `app/api/waitlist/route.ts`
- [ ] Install dependency: `pnpm add zod`
- [ ] Create email validation schema (zod)
- [ ] POST handler:
  - [ ] Validate email format
  - [ ] Check if email already exists
  - [ ] Insert to waitlist table with source
  - [ ] Return success or error (duplicate/invalid)
- [ ] Add rate limiting (max 3 per IP per hour - simple check)
- [ ] Test: Valid email accepted, invalid rejected, duplicates prevented

---

## Phase 2: Landing Page Hero & Structure

### 2.1 Update Navigation for Landing Page
- [ ] Update `components/app/app-header.tsx` (or create landing-specific nav)
- [ ] Navigation items: Logo, Wiki, Dashboard, Hiscores, Sign In
- [ ] Highlight current page
- [ ] Mobile: Hamburger menu
- [ ] Test: Nav works on all pages, responsive

### 2.2 Build Hero Section Component
- [ ] Create `components/landing/HeroSection.tsx`
- [ ] Layout: Full viewport height, centered
- [ ] Content:
  - [ ] Logo/brand name
  - [ ] Headline: "Track Everything. Level Up. Win."
  - [ ] Subheadline: 2-sentence pitch
  - [ ] Primary CTA button (will connect in 2.3)
  - [ ] Secondary link: "Try Demo Dashboard"
  - [ ] App mockup/screenshot placeholder
  - [ ] Scroll indicator (animated down arrow)
- [ ] Styling: Clean, modern, #ececf1 background
- [ ] Responsive: Stack on mobile, smaller headline
- [ ] Test: Hero displays, looks professional

### 2.3 Build Waitlist Form Component
- [ ] Create `components/landing/WaitlistForm.tsx`
- [ ] Email input with validation
- [ ] Submit button: "Join Waitlist" or "Get Early Access"
- [ ] States:
  - [ ] Idle: Empty form
  - [ ] Loading: Spinner on button
  - [ ] Success: "You're on the list! Check your email."
  - [ ] Error: "Already signed up" or "Invalid email"
- [ ] Client-side validation (email format)
- [ ] POST to `/api/waitlist`
- [ ] Track source: 'hero', 'footer', etc.
- [ ] Test: All states work, validates email, calls API

### 2.4 Replace Current Homepage
- [ ] Update `app/page.tsx`
- [ ] Remove placeholder hero and features
- [ ] Add HeroSection component
- [ ] Add scroll container for future sections
- [ ] Update page metadata:
  - [ ] Title: "Carve - Track Workouts. Level Up. Win."
  - [ ] Description: Marketing pitch (2 sentences)
  - [ ] OG tags
- [ ] Test: New homepage displays, metadata correct

---

## Phase 3: Live Hiscores Widget

### 3.1 Build Hiscores Widget Component
- [ ] Create `components/landing/HiscoresWidget.tsx`
- [ ] Layout: Full-width section, 2-column grid (desktop)
- [ ] Header: "See Who's Winning Right Now"
- [ ] Left column: Top 5 Global Rankings
  - [ ] Fetch from `get_global_leaderboard(5, 'all_time')`
  - [ ] Display: Rank #, avatar (or placeholder), username, level, XP
  - [ ] Card styling: Border, hover effect
- [ ] Right column: Live Activity Feed
  - [ ] Fetch from `get_live_activity_feed(20)`
  - [ ] Auto-scrolling list (smooth CSS animation)
  - [ ] Items: Avatar, "@username just hit PR on Bench (120kg)"
  - [ ] Time ago: "2m ago", "1h ago"
- [ ] Footer: Link to "/hiscores" → "View Full Leaderboards"
- [ ] Mobile: Stack columns (rankings first, then feed)
- [ ] Test: Widget displays data, looks good

### 3.2 Implement Real-Time Updates
- [ ] Make component client-side ('use client')
- [ ] useEffect: Fetch data every 30 seconds
- [ ] Smooth transition when data updates (no flash)
- [ ] Fallback: Show static data if fetch fails
- [ ] Loading state on initial load
- [ ] Test: Updates without page refresh, smooth transitions

### 3.3 Add to Landing Page
- [ ] Add HiscoresWidget to `app/page.tsx` below Hero
- [ ] Section spacing: Generous padding
- [ ] Background: Light gray or white (contrast with Hero)
- [ ] Test: Widget integrated into homepage

---

## Phase 4: Feature Showcase Sections

### 4.1 Build Feature Card Component
- [ ] Create `components/landing/FeatureCard.tsx`
- [ ] Props: icon (lucide or emoji), title, description, screenshot (optional)
- [ ] Layout: Icon top, title, description, screenshot bottom
- [ ] Styling: Card with border, hover lift effect
- [ ] Responsive: Full width on mobile
- [ ] Test: Renders correctly with sample data

### 4.2 Build Core Features Section
- [ ] Create section in `app/page.tsx` after Hiscores
- [ ] Header: "Everything You Need to Track"
- [ ] Subheader: Optional tagline
- [ ] 3 FeatureCard components in grid:
  1. **Workout Tracking**
     - [ ] Icon: 💪 or Dumbbell lucide icon
     - [ ] Title: "Log Every Rep"
     - [ ] Description: "Track sets, reps, weight. See progress. Beat PRs."
     - [ ] Screenshot: Workout logging mockup (create or placeholder)
  2. **Nutrition Tracking**
     - [ ] Icon: 🍎 or Apple lucide icon
     - [ ] Title: "Fuel Your Gains"
     - [ ] Description: "Log meals with macros. Hit protein goals. Build consistency."
     - [ ] Screenshot: Meal logging mockup
  3. **Progress Analytics**
     - [ ] Icon: 📊 or BarChart lucide icon
     - [ ] Title: "Watch Yourself Grow"
     - [ ] Description: "Charts, graphs, trends. See what's working."
     - [ ] Screenshot: Analytics/charts mockup
- [ ] Grid: 3 columns desktop, 1 column mobile
- [ ] Test: Section displays, cards responsive

### 4.3 Build Gamification Section
- [ ] Create section after Features
- [ ] Header: "Fitness Meets Gaming"
- [ ] Subheader: "Turn workouts into XP. Level up like an RPG."
- [ ] Content blocks:
  - [ ] Level progression visual (Level 1 → Level 50 with XP bar)
  - [ ] "How It Works" explainer (5 steps):
    1. Complete workout → Earn 50 XP
    2. Log meals → Earn 10 XP
    3. Hit PRs → Earn 100 XP bonus
    4. Build streaks → 2x multiplier at 30 days
    5. Level up → Unlock achievements
  - [ ] Achievement Wall (grid of 6-9 badges)
    - [ ] Use lucide icons: Trophy, Star, Flame, Crown, Medal, Award, Zap, Shield, Target
    - [ ] Label each: "First Workout", "Week Warrior", "Level 10", etc.
    - [ ] Color-coded: Bronze/Silver/Gold gradient
- [ ] Background: Dark (#2d2d2d) for contrast
- [ ] Button (optional): "See All Achievements"
- [ ] Test: Section looks gamified, visually appealing

### 4.4 Build Social Features Section
- [ ] Create section after Gamification
- [ ] Header: "Train With Friends"
- [ ] Layout: 2-column (image left, text right)
- [ ] Left: Screenshot of activity feed (mockup)
- [ ] Right: Feature list bullets
  - [ ] "Add friends, follow their progress"
  - [ ] "See PRs and achievements in your feed"
  - [ ] "Compete on leaderboards"
  - [ ] "React and comment on workouts"
  - [ ] "Stay motivated together"
- [ ] Optional: Testimonial quote
- [ ] Mobile: Stack image above text
- [ ] Test: Section displays, friendly vibe

---

## Phase 5: Demo Mode for Dashboard

### 5.1 Create Demo Data Generator
- [ ] Create `lib/demo/sample-data.ts`
- [ ] Export function: `getDemoData()`
- [ ] Generate sample data:
  - [ ] User profile: "Demo User", Level 15, 2500 XP
  - [ ] user_stats: 42 workouts, 89 meals, 7-day streak
  - [ ] workouts: 10 sample workouts (varied exercises, last 30 days)
  - [ ] exercises: 3-5 per workout (realistic sets/reps/weight)
  - [ ] meals: 20 sample meals (varied times, macros)
  - [ ] achievements: 5 unlocked (First Workout, Week Warrior, Level 10, etc.)
  - [ ] activity_feed: 15 sample activities (PRs, level-ups, achievements)
- [ ] Data structure matches real schema
- [ ] Test: Data looks realistic

### 5.2 Update Dashboard to Support Demo Mode
- [ ] Update `app/(protected)/dashboard/page.tsx`
- [ ] Check if user is logged in: `const user = await getCurrentUser()`
- [ ] If user exists:
  - [ ] Fetch real data from Supabase
- [ ] If user is null:
  - [ ] Load demo data: `const data = getDemoData()`
- [ ] Pass data to dashboard components (ensure they accept props)
- [ ] Test: Dashboard works for both logged-in and non-logged-in states

### 5.3 Build Demo Banner Component
- [ ] Create `components/dashboard/DemoBanner.tsx`
- [ ] Sticky banner at top of dashboard content
- [ ] Content: "You're viewing demo data - Sign up to track for real"
- [ ] CTA button: "Create Account" → links to /signup
- [ ] Dismiss button: X (stores in localStorage: 'demo-banner-dismissed')
- [ ] Styling: Subtle yellow/orange background, not overwhelming
- [ ] Only show when: not logged in AND banner not dismissed
- [ ] Test: Banner displays only in demo mode, dismisses correctly

### 5.4 Add Demo CTA Throughout Dashboard
- [ ] Add "Create Account" / "Sign Up" buttons:
  - [ ] In DemoBanner
  - [ ] In navigation (replace "Log Out" with "Sign Up")
  - [ ] In empty states (e.g., "Log your first real workout")
- [ ] All link to `/signup` or trigger signup modal
- [ ] Test: CTAs visible but not intrusive

### 5.5 Test Demo Mode Fully Interactive
- [ ] Navigate to `/dashboard` without logging in
- [ ] Verify:
  - [ ] Demo banner displays
  - [ ] Profile header shows demo user (Level 15, 2500 XP)
  - [ ] Stats cards show sample data
  - [ ] Workout history displays 10 sample workouts
  - [ ] Charts render (if implemented)
  - [ ] Achievement badges show 5 unlocked
  - [ ] Social feed shows sample activity
  - [ ] Navigation works (can click around)
- [ ] Optional: Test "fake logging" (save to localStorage)
- [ ] Test: Demo feels like real dashboard

---

## Phase 6: Full Hiscores Page

### 6.1 Create Hiscores Page Structure
- [ ] Create `app/hiscores/page.tsx`
- [ ] Layout: Use AppShell or custom full-page layout
- [ ] Header: "Global Leaderboards"
- [ ] Subtext: "See who's dominating. Join to compete."
- [ ] Add sections:
  - [ ] Tabs component (to be built)
  - [ ] Filters component (to be built)
  - [ ] Leaderboard table (to be built)
  - [ ] Live activity feed (sidebar or bottom)
  - [ ] CTA: "Want to see your name here? Join Waitlist"
- [ ] Metadata: Title, description, OG tags
- [ ] Test: Page renders skeleton

### 6.2 Build Leaderboard Tabs Component
- [ ] Create `components/hiscores/LeaderboardTabs.tsx`
- [ ] Tabs:
  - [ ] Overall (Level/XP) - default
  - [ ] Workouts (Total logged)
  - [ ] Streaks (Longest active)
  - [ ] PRs (by exercise) - has dropdown: Bench, Squat, Deadlift, etc.
- [ ] Use URL query params: ?tab=overall
- [ ] Active tab styling
- [ ] Mobile: Dropdown select instead of tabs
- [ ] onClick: Update URL, trigger data refetch
- [ ] Test: Tabs switch, URL updates

### 6.3 Build Filters Component
- [ ] Create `components/hiscores/Filters.tsx`
- [ ] Filters:
  - [ ] Timeframe: All Time, This Month, This Week (default: All Time)
  - [ ] Optional (future): Gender, Age Group
- [ ] Dropdown or button group
- [ ] Update URL query params: ?timeframe=week
- [ ] Test: Filters update, URL reflects state

### 6.4 Build Leaderboard Table Component
- [ ] Create `components/hiscores/LeaderboardTable.tsx`
- [ ] Columns: Rank, Avatar, Username, Level, XP, Streak, Action (optional: View Profile)
- [ ] Rows: Display top 50 users
- [ ] Styling:
  - [ ] Alternating row colors (zebra stripes)
  - [ ] Hover effect on rows
  - [ ] Top 3: Special styling (gold/silver/bronze background or border)
- [ ] Avatar: Show image or placeholder
- [ ] Username: Link to user profile (future)
- [ ] Mobile: Hide less important columns (e.g., Streak), show on expand
- [ ] Test: Table displays data, top 3 highlighted

### 6.5 Integrate Data Queries
- [ ] Fetch data based on active tab + filters
- [ ] Overall tab:
  - [ ] Call `get_global_leaderboard(50, timeframe)`
- [ ] Workouts tab:
  - [ ] Call `get_workouts_leaderboard(timeframe, 50)`
- [ ] Streaks tab:
  - [ ] Call `get_streaks_leaderboard(50)`
- [ ] PRs tab:
  - [ ] Call `get_prs_leaderboard(exercise_type, 50)`
  - [ ] (Create this function if not exists)
- [ ] Loading states (skeleton or spinner)
- [ ] Error handling (show error message if query fails)
- [ ] Empty state (if no users on leaderboard)
- [ ] Test: Data loads for all tabs/filters, handles errors

### 6.6 Add Live Activity Feed
- [ ] Reuse activity feed from HiscoresWidget
- [ ] Display in sidebar (desktop) or bottom (mobile)
- [ ] Header: "Recent Achievements"
- [ ] Auto-refresh every 30 seconds
- [ ] Test: Activity feed displays, updates

### 6.7 Add Metadata & SEO
- [ ] Page metadata:
  - [ ] Title: "Carve Leaderboards - See Top Fitness Athletes"
  - [ ] Description: "Global fitness leaderboards. See who's crushing PRs, hitting streaks, and leveling up."
  - [ ] OG tags (image: screenshot of leaderboard)
- [ ] Add canonical URL
- [ ] Test: Metadata appears in page source

---

## Phase 7: Polish & Conversion Optimization

### 7.1 Mobile Optimization
- [ ] Test landing page on mobile (375px, 768px, 1024px):
  - [ ] Hero: Stack vertically, smaller headline, CTA full-width
  - [ ] Hiscores widget: Stack columns (rankings first, feed second)
  - [ ] Features: Single column grid
  - [ ] Gamification: Adjust dark section padding, smaller fonts
  - [ ] Social: Stack image/text, full-width
- [ ] Test `/hiscores` page on mobile:
  - [ ] Tabs → Dropdown select
  - [ ] Table: Horizontal scroll or hide columns, show on row tap
  - [ ] Filters: Stack vertically, dropdowns full-width
  - [ ] Activity feed: Below table on mobile
- [ ] Test demo dashboard on mobile (should already be responsive)
- [ ] Fix any layout issues
- [ ] Test: All pages work well on 375px+ devices

### 7.2 Add App Screenshots/Mockups
- [ ] Create or obtain app mockups:
  - [ ] Hero: iPhone mockup with dashboard screenshot
  - [ ] Workout Tracking feature: Workout logging screen
  - [ ] Nutrition Tracking feature: Meal logging screen
  - [ ] Progress Analytics feature: Charts/graphs screen
  - [ ] Social section: Activity feed screen
- [ ] Optimize images:
  - [ ] Use next/image component
  - [ ] WebP format
  - [ ] Responsive sizes
  - [ ] Lazy loading (below fold)
- [ ] Add subtle shadows, 3D tilt effects (optional)
- [ ] Test: Images load fast, look professional

### 7.3 Implement Environment-Based CTA
- [ ] Create environment variable: `NEXT_PUBLIC_APP_STATUS`
  - [ ] Add to `.env.local`: NEXT_PUBLIC_APP_STATUS=waitlist
  - [ ] Values: 'waitlist' | 'live'
- [ ] Update CTA components:
  - [ ] If 'waitlist': Show WaitlistForm ("Join Waitlist")
  - [ ] If 'live': Show App Store + Play Store buttons
- [ ] Test both modes:
  - [ ] Set to 'waitlist': Waitlist form shows
  - [ ] Set to 'live': Store links show
- [ ] Document switch process in README
- [ ] Test: Easy toggle between modes

### 7.4 Add Social Proof Elements
- [ ] Waitlist count:
  - [ ] Query: `SELECT COUNT(*) FROM waitlist`
  - [ ] Display: "Join 1,247 people on the waitlist"
  - [ ] Update dynamically (cache for 1 hour)
  - [ ] Location: Final CTA section
- [ ] Testimonials (optional, if have beta users):
  - [ ] Create section after Social
  - [ ] 2-3 short quotes
  - [ ] Include: Quote, username, level, avatar
- [ ] Trust badges (optional):
  - [ ] "Featured on Product Hunt" (when applicable)
  - [ ] "4.9★ Beta Reviews" (if have reviews)
  - [ ] Location: Footer or near CTA
- [ ] Test: Social proof displays, count updates

### 7.5 Performance Optimization
- [ ] Code split landing page:
  - [ ] Use next/dynamic for below-fold components
  - [ ] Lazy load Gamification, Social, Final CTA sections
- [ ] Optimize images:
  - [ ] Convert to WebP
  - [ ] Serve responsive sizes (srcset)
  - [ ] Use blur placeholders
- [ ] Prefetch critical links:
  - [ ] Prefetch /hiscores
  - [ ] Prefetch /dashboard
- [ ] Cache hiscores data:
  - [ ] stale-while-revalidate (1 minute)
- [ ] Run Lighthouse audit
- [ ] Fix performance issues (target: >90 score)
- [ ] Test: Page loads <1s, smooth scroll

### 7.6 SEO & Metadata
- [ ] Landing page metadata:
  - [ ] Title: "Carve - Track Workouts. Level Up. Win."
  - [ ] Description: "The fitness app that gamifies your progress. Track PRs, earn XP, compete with friends."
  - [ ] OG image: Hero screenshot
  - [ ] Twitter card
- [ ] Generate sitemap:
  - [ ] Include: /, /hiscores, /wiki, /dashboard
  - [ ] Create `app/sitemap.ts`
- [ ] Create/update robots.txt:
  - [ ] Allow all
  - [ ] Point to sitemap
- [ ] Add structured data (schema.org):
  - [ ] WebSite schema
  - [ ] Organization schema
  - [ ] (Future) SoftwareApplication schema when app live
- [ ] Run Lighthouse SEO audit
- [ ] Test: SEO score >90

### 7.7 Analytics & Tracking
- [ ] Choose analytics tool: Google Analytics 4, Plausible, or Mixpanel
- [ ] Install tracking code
- [ ] Set up key events:
  - [ ] Waitlist signup (conversion event)
  - [ ] Demo dashboard visit
  - [ ] Hiscores page visit
  - [ ] CTA clicks (all buttons)
  - [ ] Section visibility (scroll tracking)
- [ ] Privacy compliance:
  - [ ] Cookie banner if using GA4
  - [ ] Or use privacy-friendly (Plausible = no cookie banner needed)
- [ ] Test: Events fire correctly, dashboard shows data

---

## Quick Reference: Task Counts

- **Phase 1**: 12 tasks (Waitlist & Data Infrastructure)
- **Phase 2**: 11 tasks (Hero & Structure)
- **Phase 3**: 9 tasks (Hiscores Widget)
- **Phase 4**: 15 tasks (Feature Sections)
- **Phase 5**: 13 tasks (Demo Mode)
- **Phase 6**: 18 tasks (Full Hiscores Page)
- **Phase 7**: 21 tasks (Polish & Optimization)

**Total**: 99 tasks

---

## Progress Tracking

**Phase 1**: ☐ 0/12 tasks complete
**Phase 2**: ☐ 0/11 tasks complete
**Phase 3**: ☐ 0/9 tasks complete
**Phase 4**: ☐ 0/15 tasks complete
**Phase 5**: ☐ 0/13 tasks complete
**Phase 6**: ☐ 0/18 tasks complete
**Phase 7**: ☐ 0/21 tasks complete

**Overall**: ☐ 0/99 tasks complete (0%)

---

**Timeline Estimate**: 4-5 weeks (moderate pace, part-time ~20hr/week)

**End of Task Checklist**
