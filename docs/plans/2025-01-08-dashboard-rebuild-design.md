# Dashboard Rebuild Design Document

**Date**: 2025-01-08
**Status**: Approved
**Author**: Design Session with User

---

## Vision

Transform the Carve Wiki dashboard into a gamified fitness tracking platform where users experience their fitness journey as an RPG-style character progression system, complete with levels, XP, achievements, and social motivation through friend activity feeds.

---

## Core User Experience

### The Character Sheet Metaphor

Users see themselves as a "character" with:
- **Level & XP**: Overall progression metric that increases with all activities
- **Stats**: Real fitness metrics (PRs, streaks, workout count) displayed as stat blocks
- **Achievements**: Unlockable badges for milestones and accomplishments
- **Social Feed**: Friend activity for ambient motivation and friendly competition

**Key Difference from Full RPG**: We don't map fitness to abstract stats (STR/DEX/CON). Instead, we use real fitness terminology but organize and present it in a game-like, rewarding way.

---

## Layout Design

### Split-Screen Dashboard

**Left Column (2/3 width)**:
1. **Profile Header**: Avatar, display name, level badge, XP progress bar, quick action buttons
2. **Stats Grid**: 4-6 cards showing key metrics
   - Current streak
   - Total workouts
   - Latest PR
   - Workouts this week
   - Nutrition score
   - Total XP

**Right Column (1/3 width)**:
1. **Social Feed Highlights**: Friend activity (PRs, achievements, level-ups only)
   - Last 10 items
   - Shows avatar, activity type, description, time ago
   - "See all activity" link to `/dashboard/social`

**Mobile**: Stack vertically (Profile → Stats → Social)

**Rationale**: Personal progress is the hero (what users care about most), but social feed is always visible for ambient motivation without needing to scroll.

---

## Gamification System

### XP & Leveling

**XP Formula** (Combo System):
```
Earned XP = (Base XP) × (Streak Multiplier) + Achievement Bonuses
```

**Base XP Sources**:
- Complete workout: **50 XP**
- Log meal: **10 XP**
- Set new PR: **+100 XP bonus**
- Daily check-in: **5 XP**

**Streak Multipliers**:
- 3-day streak: **1.1x**
- 7-day streak: **1.25x**
- 14-day streak: **1.5x**
- 30-day streak: **2.0x**

**Level Curve** (Exponential):
```
XP for Level N = 100 × N^1.5

Examples:
- Level 1→2: 100 XP (~2 workouts)
- Level 2→3: 283 XP (~6 workouts total)
- Level 5→6: 1,238 XP (~25 workouts total)
- Level 10→11: 3,487 XP (~70 workouts total)
```

**Why Exponential?**: Early levels feel achievable (motivation), late levels require sustained effort (long-term engagement), standard in game design.

---

### Achievements

**Categories**:
1. **First Steps**: First workout, first meal, first friend
2. **Milestones**: 10/50/100/500 workouts, Level 5/10/25/50
3. **Streaks**: 3/7/14/30/100 day streaks
4. **Social**: 5/10/25 friends, 100 reactions given
5. **PRs**: First PR, 10 PRs, specific lift milestones

**Tiers & XP Rewards**:
- Bronze: 50 XP
- Silver: 150 XP
- Gold: 300 XP
- Platinum: 500 XP

**Visual Design**:
- Locked: Grayscale icon with lock overlay
- Unlocked: Full color with tier-specific border/glow
- Progress: Bar for incremental achievements (e.g., "10/100 workouts")

---

### Celebrations

**Level-Up**:
- Modal/toast with confetti animation
- Shows: "Level [N] Reached!", XP earned, next level preview
- Auto-dismiss after 5s or click

**Achievement Unlock**:
- Toast notification with achievement icon
- Shows: Icon, name, XP reward
- Link to view all achievements

---

## Social Features

### Friend System

**Add Friends**:
- Search by username
- Send friend request (pending status)
- Accept/decline incoming requests

**Privacy**:
- Default: Profile private, activities visible to friends only
- Opt-in: Public profile, appear on global leaderboards
- Settings toggle for activity visibility

### Activity Feed

**Dashboard Sidebar** (Highlights Only):
- PRs achieved
- Achievements unlocked
- Level-ups
- Last 10 items, real-time or cached

**/dashboard/social** (Everything):
- All workouts logged
- All meals logged
- All PRs, achievements, level-ups
- Infinite scroll or pagination
- Filter by: activity type, friend, date range

**Interactions** (Post-MVP):
- Like/react to activities
- Comment on activities
- Notifications for reactions/comments

---

## Data Tracking

### Workout Logging

**Full Logging Flow**:
1. Workout name, duration, notes
2. Add exercises (dynamic list)
3. For each exercise: name, sets, reps, weight, notes
4. Save → Awards XP, updates stats, creates activity

**Quick Logging**:
- Just workout name + optional notes
- Still awards base XP
- For users who want speed over detail

**PR Detection**:
- Automatic: Compare weight × reps to previous records
- Mark as PR, award +100 XP bonus
- Create activity feed entry

### Nutrition Logging

**Full Logging**:
- Meal type (breakfast/lunch/dinner/snack)
- Name, calories, macros (protein/carbs/fat), notes
- Awards 10 XP per meal

**Quick Adherence**:
- Thumbs up/down for "on track" / "off track"
- Alternative to detailed logging

**Nutrition Score**:
- Algorithm: (% days with 3+ meals in last 7 days) × (macro balance score)
- Out of 100
- Displayed in dashboard stats

---

## Technical Architecture

### Database Schema

**Core Tables**:
1. `profiles` - User profiles (extends auth.users)
2. `user_stats` - Level, XP, streaks, totals
3. `workouts` - Workout sessions
4. `exercises` - Individual exercises in workouts
5. `meals` - Meal logs with macros
6. `achievements` - Achievement definitions
7. `user_achievements` - Unlocked achievements
8. `friendships` - Friend relationships
9. `activity_feed` - Social activity stream

**Key Functions**:
- `calculate_xp()` - Base XP + streak multipliers
- `calculate_level()` - XP → level conversion
- `detect_pr()` - Check if beats previous record
- `calculate_streak()` - Current/longest streak
- `generate_activity()` - Create feed entry

**Triggers**:
- Workout insert → Update stats, award XP, check achievements, create activity
- Meal insert → Update stats, check daily nutrition achievement
- XP update → Check for level-up, unlock level-based achievements

### Component Architecture

**Dashboard Page Structure**:
```tsx
<DashboardLayout>
  <LeftColumn>
    <ProfileHeader /> {/* Level, XP, avatar, quick actions */}
    <StatsGrid /> {/* 6 stat cards */}
  </LeftColumn>
  <RightColumn>
    <SocialFeedHighlights /> {/* Friend activity */}
  </RightColumn>
</DashboardLayout>
```

**Reusable Components**:
- `StatCard` - Icon, label, value, optional trend
- `XPProgressBar` - Animated progress to next level
- `AchievementBadge` - Icon, locked/unlocked state, tooltip
- `SocialFeedItem` - Avatar, activity description, timestamp
- `QuickActionButton` - Floating buttons for quick actions

---

## Navigation Structure

Already defined in `lib/navigation/dashboard-navigation.ts`:

**OVERVIEW**:
- Dashboard - Main dashboard (this design)

**TRACKING**:
- Food - Meal history, nutrition stats, logging
- Workouts - Workout history, analytics, logging
- Highscores - PR leaderboards (global, friends, by exercise)

**ACCOUNT**:
- Profile - User profile, achievements display
- Settings - Privacy, notifications, preferences

---

## Design Principles

1. **Personal Progress First**: Users see their own stats before social content
2. **Celebrate Wins**: Animations and notifications for achievements/level-ups
3. **Consistency Rewarded**: Streak multipliers encourage daily engagement
4. **Social as Motivation**: Friend activity creates ambient inspiration, not pressure
5. **Quick or Detailed**: Support both quick logging and detailed tracking
6. **Privacy Conscious**: Default private, opt-in to public features

---

## Success Metrics

**Engagement** (First 30 Days):
- 70%+ log at least one workout in first week
- 50%+ return 3+ days in first week
- Average 2+ workouts per active user per week

**Social**:
- 40%+ add at least one friend
- 20%+ interact with social feed

**Gamification**:
- 60%+ reach Level 3 within 2 weeks
- 5+ achievements unlocked per user on average

**Technical**:
- Dashboard load time <1s (p95)
- <1% error rate on logging
- 99.5% uptime

---

## Implementation Approach

**Phase 1**: Database foundation (tables, functions, triggers)
**Phase 2**: Core UI components (profile, stats, XP bar, badges)
**Phase 3**: Workout tracking
**Phase 4**: Nutrition tracking
**Phase 5**: Social features
**Phase 6**: Dashboard integration
**Phase 7**: Achievements & gamification polish
**Phase 8**: Polish & testing

**MVP**: Phases 1-6 (estimated 4 weeks part-time)
**Full Launch**: Phases 7-8 (estimated +1 week)

**Total Estimated Effort**: 5 weeks part-time (20 hrs/week) or 3 weeks full-time

---

## Open Questions & Future Considerations

**Post-MVP Features**:
- Push notifications for streaks, friend activity
- Exercise autocomplete from external API
- Workout templates (save favorite routines)
- Progress photos upload
- Integration with wearables (Apple Watch, Fitbit)
- Challenges (30-day challenges with friends)
- Nutrition goals (custom macro targets)

**Analytics to Monitor**:
- Which XP sources drive most engagement?
- Do streaks actually improve retention?
- Social vs. solo users: engagement differences?
- Achievement unlock distribution (are some too easy/hard?)

---

**End of Design Document**
