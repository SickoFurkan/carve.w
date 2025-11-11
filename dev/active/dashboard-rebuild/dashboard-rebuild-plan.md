# Dashboard Rebuild: RPG-Style Gamification with Fitness Tracking & Social Features

**Last Updated: 2025-01-08**

---

## Executive Summary

Transform the Carve Wiki dashboard from a placeholder into a fully-featured fitness tracking platform with RPG-style gamification and social features. The new dashboard will feature a level/XP progression system, comprehensive workout and nutrition tracking, and a social feed showing friends' highlights.

**Core Vision**: A character profile-style dashboard where users see their fitness journey as a leveling system, track detailed workout/nutrition data, and stay motivated through social engagement.

**Key Features**:
- User level & XP progression with combo multipliers
- Split-screen layout: Personal stats (2/3) + Social feed (1/3)
- Comprehensive workout logging (exercises, sets, reps, weight)
- Nutrition tracking with macro/calorie input
- Friend system with activity feed
- Achievement/badge system
- PR (Personal Record) tracking and leaderboards

---

## Current State Analysis

### Existing Infrastructure
- **Framework**: Next.js 16 with React 19, TypeScript
- **Authentication**: Supabase auth with OAuth (Google & Apple) ✅
- **Database**: Supabase PostgreSQL
- **UI Components**: Tailwind CSS 4, shadcn/ui components (Card, Chart)
- **Icons**: Lucide React
- **Charts**: Recharts library available

### Current Dashboard
- Location: `app/(protected)/dashboard/page.tsx`
- Status: Basic placeholder with 3 empty cards
- Navigation structure defined but pages not implemented

### Planned Navigation Structure
Already defined in `lib/navigation/dashboard-navigation.ts`:
- **OVERVIEW**: Dashboard home
- **TRACKING**: Food, Workouts, Highscores
- **ACCOUNT**: Profile, Settings

### Gaps to Address
1. No database schema for fitness data
2. No user profile/stats tracking
3. No workout/nutrition logging functionality
4. No social/friend system
5. No XP/level calculation system
6. No achievement tracking
7. Placeholder icons (need real Lucide icons)

---

## Proposed Future State

### User Experience Flow

**First Login**:
1. User sees dashboard with Level 1, 0 XP
2. Profile card prompts for basic info (avatar, bio, fitness goals)
3. Quick start guide highlights logging first workout

**Daily Usage**:
1. User logs workout → Earns base XP
2. Completes nutrition tracking → Earns XP with streak bonus
3. Sees friend's PR notification in social feed → Can react/comment
4. Levels up → Achievement unlocked, celebration animation
5. Checks stats to see progress over time

**Social Engagement**:
1. Search/add friends by username
2. Dashboard shows friend highlights (PRs, achievements, level-ups)
3. Navigate to `/dashboard/social` for full activity feed
4. View friend profiles, compare stats (opt-in)

---

## Architecture Overview

### Database Schema

#### Core Tables

**profiles** (extends auth.users)
```sql
- id (uuid, FK to auth.users)
- username (unique)
- display_name
- avatar_url
- bio
- created_at
- updated_at
```

**user_stats**
```sql
- user_id (uuid, FK to profiles)
- level (integer, default: 1)
- total_xp (integer, default: 0)
- current_streak (integer, default: 0)
- longest_streak (integer, default: 0)
- total_workouts (integer, default: 0)
- total_meals_logged (integer, default: 0)
- last_activity_date (date)
- updated_at
```

**workouts**
```sql
- id (uuid)
- user_id (uuid, FK to profiles)
- name (text)
- notes (text, nullable)
- duration_minutes (integer, nullable)
- created_at (timestamptz)
- updated_at
```

**exercises**
```sql
- id (uuid)
- workout_id (uuid, FK to workouts)
- exercise_name (text)
- sets (integer)
- reps (integer, nullable)
- weight (decimal, nullable)
- weight_unit (text, default: 'lbs')
- is_pr (boolean, default: false)
- order_index (integer)
- notes (text, nullable)
```

**meals**
```sql
- id (uuid)
- user_id (uuid, FK to profiles)
- meal_type (enum: breakfast, lunch, dinner, snack)
- name (text, nullable)
- calories (integer, nullable)
- protein (decimal, nullable)
- carbs (decimal, nullable)
- fat (decimal, nullable)
- notes (text, nullable)
- created_at (timestamptz)
```

**achievements**
```sql
- id (uuid)
- code (text, unique) -- e.g., 'first_workout', 'level_10', '7_day_streak'
- name (text)
- description (text)
- icon (text) -- lucide icon name
- xp_reward (integer)
- tier (enum: bronze, silver, gold, platinum)
```

**user_achievements**
```sql
- user_id (uuid, FK to profiles)
- achievement_id (uuid, FK to achievements)
- unlocked_at (timestamptz)
- PRIMARY KEY (user_id, achievement_id)
```

**friendships**
```sql
- id (uuid)
- user_id (uuid, FK to profiles)
- friend_id (uuid, FK to profiles)
- status (enum: pending, accepted, blocked)
- created_at (timestamptz)
- updated_at
- UNIQUE(user_id, friend_id)
```

**activity_feed**
```sql
- id (uuid)
- user_id (uuid, FK to profiles)
- activity_type (enum: workout, pr, achievement, level_up, meal)
- activity_data (jsonb) -- flexible data storage
- is_public (boolean, default: true)
- created_at (timestamptz)
- INDEX on (user_id, created_at)
- INDEX on (created_at) for feed queries
```

### XP & Leveling System

**XP Formula (Combo System)**:
```
Base XP + Streak Multiplier + Achievement Bonuses
```

**Base XP Sources**:
- Complete workout: 50 XP
- Log meal: 10 XP
- Set new PR: 100 XP
- Daily check-in: 5 XP

**Streak Multiplier**:
- 3-day streak: 1.1x
- 7-day streak: 1.25x
- 14-day streak: 1.5x
- 30-day streak: 2x

**Level Curve**:
```
XP needed for level N = 100 * N^1.5
Level 1→2: 100 XP
Level 2→3: 283 XP
Level 3→4: 520 XP
Level 5: ~1118 XP
Level 10: ~3162 XP
```

**Achievement XP**:
- Bronze: 50 XP
- Silver: 150 XP
- Gold: 300 XP
- Platinum: 500 XP

### Component Architecture

**Dashboard Layout** (`app/(protected)/dashboard/page.tsx`):
```tsx
<DashboardLayout>
  <LeftColumn> {/* 2/3 width */}
    <ProfileHeader /> {/* Level, XP bar, quick actions */}
    <StatsGrid /> {/* 4-6 stat cards */}
  </LeftColumn>

  <RightColumn> {/* 1/3 width */}
    <SocialFeedHighlights /> {/* Friend activity feed */}
  </RightColumn>
</DashboardLayout>
```

**Key Components**:
- `ProfileHeader`: Avatar, display name, level, XP progress bar
- `StatCard`: Reusable card for metrics (PRs, streak, workout count)
- `XPProgressBar`: Visual progress to next level
- `SocialFeedItem`: Single activity item in feed
- `AchievementBadge`: Icon-based achievement display
- `QuickActionButton`: Log workout, track meal shortcuts

**Page Structure**:
- `/dashboard` - Main dashboard (described above)
- `/dashboard/workouts` - Workout history, detailed logging
- `/dashboard/food` - Meal tracking, nutrition stats
- `/dashboard/highscores` - PR leaderboard, personal PRs
- `/dashboard/social` - Full social feed, friend management
- `/dashboard/profile` - Edit profile, view achievements
- `/dashboard/settings` - App preferences

---

## Implementation Phases

### Phase 1: Database Foundation (Estimated: 3-5 days)

**Goal**: Set up all database tables, RLS policies, and core data structures.

#### Tasks

**1.1 Create Core User Tables** [Effort: M]
- Create `profiles` table with RLS
- Create `user_stats` table with triggers for auto-initialization
- Set up database function to create profile on auth signup
- **Acceptance**: New users automatically get profile + stats row

**1.2 Create Fitness Tracking Tables** [Effort: M]
- Create `workouts` table with RLS (users can only see their own)
- Create `exercises` table with cascade delete
- Create `meals` table with RLS
- Add indexes on `user_id` and `created_at` columns
- **Acceptance**: Can insert/query workout and meal data

**1.3 Create Social Tables** [Effort: M]
- Create `friendships` table with bidirectional relationship handling
- Create `activity_feed` table with composite indexes
- Add RLS for friend privacy (users see own + friends' public activities)
- **Acceptance**: Can create friendships, query friend feeds

**1.4 Create Gamification Tables** [Effort: S]
- Create `achievements` table
- Create `user_achievements` junction table
- Seed initial achievements (first workout, level milestones, streaks)
- **Acceptance**: 15-20 achievements seeded, can unlock/query

**1.5 Create Database Functions** [Effort: L]
- XP calculation function (handles base XP + multipliers)
- Level calculation function (determines level from total XP)
- PR detection function (checks if exercise beats previous record)
- Streak calculation function (calculates current/longest streak)
- Activity feed generator (creates feed entries on actions)
- **Acceptance**: All functions tested, return correct values

**1.6 Set Up Database Triggers** [Effort: M]
- Trigger on workout insert → update user_stats, check achievements, create activity
- Trigger on meal insert → update user_stats, check streak
- Trigger on exercise insert → check for PR, award XP if PR
- Trigger on XP change → check for level up, unlock achievements
- **Acceptance**: Logging workout auto-updates stats, XP, level

**Dependencies**: None (can start immediately)

---

### Phase 2: Core UI Components (Estimated: 4-6 days)

**Goal**: Build reusable UI components for dashboard, stats, and gamification.

#### Tasks

**2.1 Update Icon System** [Effort: S]
- Replace placeholder icons in `dashboard-navigation.ts` with Lucide icons
- Create icon mapping utility for achievements/activities
- **Acceptance**: Navigation shows proper icons

**2.2 Build Profile Header Component** [Effort: M]
- `ProfileHeader.tsx`: Avatar, display name, level badge
- Integrate with Supabase to fetch user profile
- **Acceptance**: Shows user data, handles loading/error states

**2.3 Build XP Progress Component** [Effort: M]
- `XPProgressBar.tsx`: Animated progress bar
- Display current XP, XP to next level, percentage
- Add level-up celebration animation (confetti/glow)
- **Acceptance**: Shows accurate progress, animates smoothly

**2.4 Build Stat Card Component** [Effort: S]
- `StatCard.tsx`: Reusable card with icon, label, value, trend
- Support for different stat types (number, streak, PR)
- **Acceptance**: Renders various stat types correctly

**2.5 Build Stats Grid** [Effort: M]
- `StatsGrid.tsx`: Responsive grid of StatCards
- Fetch user stats from database
- Display: Current streak, total workouts, latest PR, workout this week, nutrition score, level
- **Acceptance**: Shows live data, responsive on mobile

**2.6 Build Achievement Badge Component** [Effort: M]
- `AchievementBadge.tsx`: Icon + tooltip, locked/unlocked states
- Visual distinction for tiers (bronze/silver/gold/platinum)
- Click to see achievement details modal
- **Acceptance**: Displays achievements with proper styling

**2.7 Build Quick Action Buttons** [Effort: S]
- `QuickActionButton.tsx`: Floating action button component
- Add "Log Workout" and "Track Meal" buttons to profile header
- **Acceptance**: Buttons route to correct logging pages

**Dependencies**: Phase 1 complete (need database schema for data fetching)

---

### Phase 3: Workout Tracking (Estimated: 5-7 days)

**Goal**: Full workout logging functionality from simple to detailed.

#### Tasks

**3.1 Build Workout Logging Form** [Effort: L]
- `/dashboard/workouts/new` page with multi-step form
- Step 1: Workout name, duration, notes
- Step 2: Add exercises (dynamic list)
- Step 3: For each exercise: name, sets, reps, weight
- Save to `workouts` and `exercises` tables
- **Acceptance**: Can create workout with multiple exercises

**3.2 Implement XP Award on Workout** [Effort: M]
- Hook into workout save to trigger XP calculation
- Display XP earned notification after save
- Update user stats (total_workouts, last_activity_date)
- **Acceptance**: Saving workout awards XP, updates stats

**3.3 Build Workout History View** [Effort: M]
- `/dashboard/workouts` main page showing workout list
- Group by date, show summary (name, exercise count, duration)
- Click to expand and see exercise details
- Pagination or infinite scroll
- **Acceptance**: Shows all user workouts, performant with 100+ workouts

**3.4 Implement PR Detection** [Effort: M]
- On exercise save, compare weight × reps to previous records
- Mark exercise as `is_pr: true` if beats record
- Award bonus XP (100 XP)
- Create activity feed entry for PR
- **Acceptance**: Setting PR triggers detection, awards XP, shows in feed

**3.5 Build Workout Stats Dashboard** [Effort: M]
- Add charts to `/dashboard/workouts` showing:
  - Workouts per week (bar chart)
  - Volume over time (line chart)
  - Top exercises (pie chart or list)
- Use Recharts library
- **Acceptance**: Charts display accurate data, responsive

**3.6 Add Quick Workout Logging** [Effort: S]
- Simplified flow for logging "completed workout" without details
- Just workout name + optional notes
- Still awards base XP
- **Acceptance**: Can log simple workout in <30 seconds

**Dependencies**: Phase 1 & 2 complete

---

### Phase 4: Nutrition Tracking (Estimated: 4-5 days)

**Goal**: Meal logging with macro tracking and nutrition adherence scoring.

#### Tasks

**4.1 Build Meal Logging Form** [Effort: M]
- `/dashboard/food/new` page with meal form
- Fields: Meal type (breakfast/lunch/dinner/snack), name, calories, macros (protein/carbs/fat), notes
- Save to `meals` table
- **Acceptance**: Can log meal with full macro details

**4.2 Implement XP Award on Meal Log** [Effort: S]
- Award 10 XP per meal logged
- Update user stats (total_meals_logged, last_activity_date)
- Check for daily nutrition achievement (log 3+ meals)
- **Acceptance**: Logging meal awards XP, updates stats

**4.3 Build Meal History View** [Effort: M]
- `/dashboard/food` main page showing meal log
- Group by date, show meal type, name, calories, macros
- Daily totals row (sum of calories/macros)
- **Acceptance**: Shows all meals, daily totals accurate

**4.4 Calculate Nutrition Score** [Effort: M]
- Define scoring algorithm:
  - Consistency: % of days with 3+ meals logged (last 7 days)
  - Macro balance: Deviation from target ratios (if user sets goals)
  - Score out of 100
- Display nutrition score in dashboard StatCard
- **Acceptance**: Score updates daily, reflects recent adherence

**4.5 Add Nutrition Charts** [Effort: M]
- Calorie intake over time (line chart)
- Macro breakdown (stacked bar chart by day)
- Weekly average comparison
- **Acceptance**: Charts show nutrition trends

**4.6 Quick Meal Logging** [Effort: S]
- Simplified "thumbs up/down" nutrition adherence tracker
- Just mark day as "on track" or "off track"
- Alternative to detailed logging for busy days
- **Acceptance**: Can log adherence in one click

**Dependencies**: Phase 1 & 2 complete

---

### Phase 5: Social Features (Estimated: 5-7 days)

**Goal**: Friend system and activity feed for social motivation.

#### Tasks

**5.1 Build Friend Search & Add** [Effort: M]
- `/dashboard/social/friends` page with search input
- Search users by username
- Send friend request (insert to `friendships` with status: pending)
- **Acceptance**: Can search and send friend requests

**5.2 Build Friend Request Management** [Effort: M]
- Show pending incoming requests
- Accept/decline actions (update friendship status)
- Show friends list (accepted friendships)
- **Acceptance**: Can manage friend requests, see friends

**5.3 Build Activity Feed Generator** [Effort: L]
- Database function to create activity on:
  - Workout completion
  - PR achieved
  - Achievement unlocked
  - Level up
- Store in `activity_feed` with `activity_data` JSONB
- **Acceptance**: Actions auto-create feed entries

**5.4 Build Social Feed Highlights Component** [Effort: M]
- `SocialFeedHighlights.tsx` for dashboard sidebar
- Query activity_feed for friends' public activities
- Filter to highlights only: PRs, achievements, level-ups
- Show last 10 items, real-time or cached
- Display: Friend avatar, activity type icon, description, time ago
- **Acceptance**: Shows friend highlights, updates on new activity

**5.5 Build Full Social Feed Page** [Effort: M]
- `/dashboard/social` page showing all friend activity
- Include workouts, meals, everything (not just highlights)
- Infinite scroll or pagination
- Filter by activity type, friend, date range
- **Acceptance**: Shows comprehensive feed, performant with 1000+ items

**5.6 Add Activity Interactions** [Effort: M]
- Like/react to activities (create reactions table)
- Comment on activities (create comments table)
- Notification when friend reacts/comments
- **Acceptance**: Can react/comment, see notifications

**5.7 Build Friend Profile View** [Effort: S]
- Click friend in feed → see their profile
- Show: Level, achievements, recent activity, public PRs
- Privacy: Users can mark profile as private (settings)
- **Acceptance**: Can view friend profiles, respects privacy

**Dependencies**: Phase 1 & 2 complete

---

### Phase 6: Dashboard Integration (Estimated: 3-4 days)

**Goal**: Assemble all components into the final split-screen dashboard.

#### Tasks

**6.1 Build Dashboard Layout** [Effort: M]
- Update `app/(protected)/dashboard/page.tsx`
- Implement split-screen: 2/3 left, 1/3 right
- Responsive: Stack on mobile (<768px)
- **Acceptance**: Layout renders correctly on all screen sizes

**6.2 Integrate ProfileHeader** [Effort: S]
- Add ProfileHeader to top of left column
- Fetch user profile, stats from Supabase
- Show level, XP bar, avatar, quick actions
- **Acceptance**: Profile data loads, XP bar accurate

**6.3 Integrate StatsGrid** [Effort: M]
- Add StatsGrid below ProfileHeader
- Configure stats to display:
  - Current streak (days)
  - Total workouts
  - Latest PR (exercise name + weight)
  - Workouts this week
  - Nutrition score
  - Total XP
- Real-time data from database
- **Acceptance**: All stats show live data

**6.4 Integrate SocialFeedHighlights** [Effort: S]
- Add to right column
- Query friend highlights
- Handle empty state (no friends yet)
- **Acceptance**: Feed shows highlights, handles edge cases

**6.5 Add Loading & Error States** [Effort: S]
- Skeleton loaders for profile, stats, feed
- Error boundaries for failed data fetches
- Retry mechanisms
- **Acceptance**: Graceful loading/error handling

**6.6 Optimize Performance** [Effort: M]
- Implement SWR or React Query for data caching
- Prefetch friend data
- Optimize database queries (add indexes if needed)
- Lazy load social feed
- **Acceptance**: Dashboard loads <1s, smooth interactions

**Dependencies**: Phases 2-5 complete

---

### Phase 7: Achievements & Gamification Polish (Estimated: 3-4 days)

**Goal**: Complete achievement system, level-up celebrations, and gamification UX.

#### Tasks

**7.1 Build Achievement System** [Effort: L]
- Define 20+ achievements across categories:
  - **First Steps**: First workout, first meal, first friend
  - **Milestones**: 10/50/100/500 workouts, Level 5/10/25/50
  - **Streaks**: 3/7/14/30/100 day streaks
  - **Social**: 5/10/25 friends, 100 likes given
  - **PRs**: First PR, 10 PRs, bench/squat/deadlift milestones
- Implement unlock detection in database triggers
- **Acceptance**: Achievements unlock automatically on conditions

**7.2 Build Achievements Display** [Effort: M]
- `/dashboard/profile` page showing achievement grid
- Locked (grayscale) vs unlocked (color) states
- Progress bars for incremental achievements (e.g., "10/100 workouts")
- Filter by locked/unlocked, tier, category
- **Acceptance**: Shows all achievements, unlock progress

**7.3 Build Level-Up Celebration** [Effort: M]
- Modal/toast on level up with animation
- Show new level, XP earned, next level preview
- Confetti effect (use canvas or CSS animation)
- Auto-dismiss after 5 seconds or user click
- **Acceptance**: Celebration triggers on level up, feels rewarding

**7.4 Build Achievement Unlock Notification** [Effort: S]
- Toast notification when achievement unlocked
- Show achievement icon, name, XP reward
- Link to achievements page
- **Acceptance**: Notifications appear on unlock

**7.5 Add Streak Tracking Logic** [Effort: M]
- Daily check: If user logged workout/meal today, increment streak
- If missed day, reset current_streak to 0
- Update longest_streak if current exceeds it
- Run via scheduled function (Supabase cron or serverless)
- **Acceptance**: Streaks calculate correctly, reset on missed days

**7.6 Build Leaderboard (Highscores)** [Effort: M]
- `/dashboard/highscores` page with tabs:
  - **Global**: Top users by level/XP (public opt-in)
  - **Friends**: Friend rankings
  - **PRs**: Leaderboard by exercise (e.g., top bench press)
- Privacy: Users can hide from global leaderboard
- **Acceptance**: Leaderboards show rankings, privacy respected

**Dependencies**: Phases 1-6 complete

---

### Phase 8: Polish & Testing (Estimated: 3-4 days)

**Goal**: UI polish, edge case handling, accessibility, testing.

#### Tasks

**8.1 UI/UX Polish** [Effort: M]
- Consistent spacing, typography, colors across all pages
- Hover states, transitions, micro-interactions
- Empty states for all lists (no workouts, no friends, etc.)
- Improve mobile responsiveness (test on 375px, 768px, 1024px)
- **Acceptance**: UI feels polished, professional

**8.2 Accessibility Audit** [Effort: S]
- Add ARIA labels to interactive elements
- Ensure keyboard navigation works (tab order)
- Test with screen reader (VoiceOver/NVDA)
- Color contrast check (WCAG AA)
- **Acceptance**: No critical a11y issues

**8.3 Error Handling** [Effort: M]
- Handle network failures gracefully
- Validate form inputs (client + server)
- Show helpful error messages (not just "Error")
- Add retry logic for failed requests
- **Acceptance**: App doesn't crash on errors

**8.4 Edge Case Testing** [Effort: M]
- Test with 0 workouts, 0 friends, 0 achievements
- Test with 1000+ workouts (performance)
- Test with very long names, special characters
- Test concurrent updates (two devices)
- **Acceptance**: App handles edge cases without breaking

**8.5 Performance Optimization** [Effort: M]
- Analyze bundle size, code split if needed
- Optimize images (avatar uploads)
- Add database indexes if queries slow
- Implement pagination where needed
- **Acceptance**: Lighthouse score >90, no slow queries

**8.6 Write Documentation** [Effort: S]
- Update README with features, setup instructions
- Add inline code comments for complex logic
- Document XP formula, level curve, achievement conditions
- **Acceptance**: New developers can understand codebase

**Dependencies**: Phases 1-7 complete

---

## Risk Assessment & Mitigation

### Technical Risks

**Risk 1: Database Performance with Large Activity Feeds**
- **Likelihood**: Medium
- **Impact**: High
- **Mitigation**:
  - Add composite indexes on `activity_feed` (user_id, created_at)
  - Implement cursor-based pagination
  - Cache friend lists in Redis if needed
  - Limit feed queries to last 30 days by default

**Risk 2: XP Calculation Complexity**
- **Likelihood**: Low
- **Impact**: Medium
- **Mitigation**:
  - Start with simple formula, iterate based on user feedback
  - Use database functions for consistency
  - Log XP transactions for debugging/auditing
  - Add admin tools to adjust XP retroactively if needed

**Risk 3: Real-time Updates Lag**
- **Likelihood**: Medium
- **Impact**: Low
- **Mitigation**:
  - Use Supabase Realtime for critical updates (level-ups, achievements)
  - Optimistic UI updates (show immediately, sync in background)
  - Fallback to polling if Realtime unavailable

**Risk 4: Mobile Performance**
- **Likelihood**: Medium
- **Impact**: Medium
- **Mitigation**:
  - Code split by route
  - Lazy load charts/social feed
  - Use React Suspense for progressive loading
  - Test on real devices, not just simulators

### Product Risks

**Risk 5: Feature Creep**
- **Likelihood**: High
- **Impact**: High
- **Mitigation**:
  - Stick to phased plan, ship MVP first
  - Gather user feedback before adding more features
  - Use feature flags to test new features with subset of users

**Risk 6: User Privacy Concerns**
- **Likelihood**: Low
- **Impact**: High
- **Mitigation**:
  - Default to private profiles, opt-in to public leaderboards
  - Clear privacy controls in settings
  - RLS policies enforce data access rules
  - Comply with data protection regulations (GDPR)

**Risk 7: Low User Engagement**
- **Likelihood**: Medium
- **Impact**: High
- **Mitigation**:
  - A/B test XP values, level curve
  - Add push notifications for streaks, friend activity
  - Gamification should enhance, not replace, core value (tracking)
  - Monitor analytics: retention, DAU, feature usage

---

## Success Metrics

### Launch Metrics (First 30 Days)

**Engagement**:
- 70%+ of users log at least one workout in first week
- 50%+ of users return 3+ days in first week (retention)
- Average 2+ workouts logged per active user per week

**Social**:
- 40%+ of users add at least one friend
- 20%+ of users interact with social feed (view/like/comment)

**Gamification**:
- 60%+ of users reach Level 3 within first 2 weeks
- 5+ achievements unlocked per user on average
- 80%+ of users view their achievements page

**Technical**:
- Dashboard load time <1s (p95)
- <1% error rate on workout/meal logging
- 99.5% uptime

### Long-term Metrics (3+ Months)

**Retention**:
- 30-day retention >40%
- 90-day retention >20%

**Engagement**:
- Average 3+ workouts per user per week
- Average 5+ meals logged per user per week
- 30%+ DAU/MAU ratio

**Social**:
- Average 5+ friends per user
- 50%+ of users engage with social feed weekly

**Gamification**:
- 20%+ of users reach Level 10
- 50%+ of users maintain a 7+ day streak
- 10+ achievements unlocked per user on average

---

## Required Resources & Dependencies

### Technical Dependencies

**External Services**:
- Supabase (Database, Auth, Realtime) - Already set up ✅
- Recharts (Charts) - Already installed ✅
- Lucide React (Icons) - Already installed ✅

**New Dependencies to Add**:
- `date-fns` or `dayjs` - Date manipulation for streaks, activity grouping
- `react-hook-form` - Form handling for workout/meal logging
- `zod` - Schema validation
- `swr` or `@tanstack/react-query` - Data fetching/caching
- `react-confetti` or `canvas-confetti` - Level-up celebrations (optional)

### Team Resources

**Development**:
- 1 Full-stack developer (can be solo)
- Estimated total: 25-35 development days
- Suggested pace: 2-3 weeks for MVP (Phases 1-6), 1 week for polish (Phases 7-8)

**Design** (Optional):
- UI/UX designer for custom achievement badges, celebration animations
- If not available: Use Lucide icons, simple animations

**Testing**:
- QA testing for edge cases, accessibility
- Beta testers for feedback (5-10 users)

### Infrastructure

**Database**:
- Supabase Free Tier supports up to 500MB database, 2GB bandwidth
- Estimate: 100 users = ~50MB data (workouts, meals, activities)
- Scale to paid tier if >500 users

**Hosting**:
- Vercel (Next.js) - Free tier sufficient for MVP
- Upgrade if >100GB bandwidth/month

---

## Timeline Estimates

### Aggressive Timeline (3 weeks, full-time)
- **Week 1**: Phases 1-3 (Database, UI components, Workout tracking)
- **Week 2**: Phases 4-6 (Nutrition, Social, Dashboard integration)
- **Week 3**: Phases 7-8 (Achievements, Polish, Testing)

### Moderate Timeline (5 weeks, part-time ~20hr/week)
- **Week 1-2**: Phases 1-2
- **Week 3**: Phase 3
- **Week 4**: Phases 4-5
- **Week 5**: Phases 6-8

### Conservative Timeline (8 weeks, part-time ~10hr/week)
- **Week 1-2**: Phase 1
- **Week 3-4**: Phases 2-3
- **Week 5**: Phase 4
- **Week 6**: Phase 5
- **Week 7**: Phase 6
- **Week 8**: Phases 7-8

**Recommendation**: Start with Moderate Timeline. Ship MVP (Phases 1-6) in 4 weeks, gather feedback, then complete Phases 7-8 based on user input.

---

## Next Steps

1. **Review & Approve Plan**: Ensure alignment on scope, timeline
2. **Set Up Project Board**: Create tasks in GitHub Issues or Jira
3. **Start Phase 1**: Begin database schema creation
4. **Weekly Check-ins**: Review progress, adjust priorities
5. **Ship MVP**: Deploy Phases 1-6, gather user feedback
6. **Iterate**: Complete Phases 7-8, add features based on feedback

---

## Appendix

### Sample Achievement Definitions

| Code | Name | Description | Tier | XP | Unlock Condition |
|------|------|-------------|------|----|--------------------|
| first_workout | First Rep | Log your first workout | Bronze | 50 | Log 1 workout |
| workout_10 | Getting Strong | Complete 10 workouts | Silver | 150 | Log 10 workouts |
| workout_100 | Fitness Warrior | Complete 100 workouts | Gold | 300 | Log 100 workouts |
| first_pr | Record Breaker | Set your first PR | Bronze | 100 | Set 1 PR |
| streak_7 | Week Warrior | Maintain a 7-day streak | Silver | 150 | 7-day streak |
| streak_30 | Monthly Machine | Maintain a 30-day streak | Gold | 300 | 30-day streak |
| level_5 | Rising Star | Reach Level 5 | Bronze | 50 | Level = 5 |
| level_10 | Power Player | Reach Level 10 | Silver | 150 | Level = 10 |
| first_friend | Social Butterfly | Add your first friend | Bronze | 50 | 1 friend |
| friends_10 | Squad Goals | Have 10 friends | Silver | 150 | 10 friends |

### Database Migration Checklist

- [ ] Create profiles table + RLS
- [ ] Create user_stats table + trigger
- [ ] Create workouts table + RLS
- [ ] Create exercises table + cascade
- [ ] Create meals table + RLS
- [ ] Create achievements table + seed data
- [ ] Create user_achievements table
- [ ] Create friendships table + RLS
- [ ] Create activity_feed table + indexes
- [ ] Create XP calculation function
- [ ] Create level calculation function
- [ ] Create PR detection function
- [ ] Create streak calculation function
- [ ] Create activity generator function
- [ ] Set up workout insert trigger
- [ ] Set up meal insert trigger
- [ ] Set up XP update trigger
- [ ] Test all functions & triggers

---

**End of Plan**
