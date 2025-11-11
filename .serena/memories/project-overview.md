# Carve Wiki - Project Overview

## Project Purpose

**Carve Wiki** is the web companion to the **Carve** mobile app (a social health and fitness tracking app). The website serves three distinct functions:

1. **Carve Landing Page** - Marketing site to promote the mobile app and its features
2. **Carve Wiki** - Wikipedia-style knowledge base with evidence-based health and fitness information
3. **Dashboard** - Personal fitness tracking platform with RPG-style gamification (current development focus)

## The Carve Ecosystem

- **Carve Mobile App** (primary product) - Social health and fitness tracking app
- **Carve Wiki Website** (this project) - Web platform with three sections (landing, wiki, dashboard)

The dashboard being built is a standalone fitness tracker, not just a companion to the mobile app.

## Tech Stack

- **Framework**: Next.js 16 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with OAuth (Google & Apple)
- **UI Components**: Custom components + lucide-react icons
- **Charts**: Recharts for data visualization
- **Package Manager**: pnpm

## Current Dashboard Vision

A character profile-style dashboard where users track their fitness journey as a leveling system with social engagement.

### Key Features:
- **Level/XP Progression**: User gains experience points and levels up
- **Split-Screen Layout**: Personal stats (2/3) + Social feed (1/3)
- **Workout Tracking**: Log exercises with sets, reps, weight
- **Nutrition Tracking**: Meal logging with macros/calories
- **Social Features**: Friend system with activity feed
- **Achievements**: Badge system for milestones
- **PR Tracking**: Personal records with leaderboards
- **Streak System**: Daily activity tracking with combo multipliers

### Gamification System:

**XP Formula**: Base XP × Streak Multiplier + Achievement Bonuses

**Base XP Sources**:
- Complete workout: 50 XP
- Log meal: 10 XP
- Set new PR: 100 XP

**Streak Multipliers**:
- 3-day: 1.1x
- 7-day: 1.25x
- 14-day: 1.5x
- 30-day: 2x

**Level Curve**: XP for level N = 100 × N^1.5 (exponential)

## Database Schema (8 Core Tables)

1. **profiles** - User profiles (username, avatar, bio)
2. **user_stats** - Level, XP, streaks, totals
3. **workouts** - Workout sessions
4. **exercises** - Individual exercises within workouts
5. **meals** - Meal logs with macros
6. **achievements** - Achievement definitions
7. **user_achievements** - Unlocked achievements per user
8. **friendships** - Friend relationships
9. **activity_feed** - Social activity stream

All tables have Row Level Security (RLS) policies for privacy.

## Project Structure

```
app/
├── (auth)/          # Authentication routes
├── (protected)/     # Protected routes
│   └── dashboard/   # Dashboard (being rebuilt)
├── wiki/            # Wiki section (future)
├── layout.tsx       # Root layout with AppShell
└── page.tsx         # Landing page (Carve marketing)

components/
├── app/             # App shell, header, sidebar
└── ui/              # Reusable UI components

lib/
└── supabase/        # Supabase client setup

supabase/migrations/ # Database migrations
```

## Design Philosophy

- **Evidence-based content** (not bro-science)
- **Gamification for motivation** (without being gimmicky)
- **Social accountability** (friends, activity feed)
- **Clean, modern UI** (app-like experience)
- **Privacy-first** (default private, opt-in sharing)

## Development Status

### ✅ Completed (Phase 1 - Database Foundation)
- All 9 database tables created with migrations
- XP/level calculation functions
- PR detection, streak tracking
- Triggers for auto-XP awards
- RLS policies for privacy
- Achievement system seeded

### 🚧 In Progress (Phase 2+)
- UI Components for dashboard
- Workout tracking interface
- Nutrition tracking interface
- Social features (friends, feed)
- Dashboard integration

### 📋 Planned
- Achievement unlock notifications
- Level-up celebrations
- **Wiki Encyclopedia** (comprehensive plan in `dev/active/wiki-encyclopedia/`)
- **Carve Landing Page** (comprehensive plan in `dev/active/carve-landing-page/`)

## Carve Landing Page Status

### 📋 Planned (Ready to Implement)
- Marketing website for Carve mobile app
- Hero section with waitlist CTA (flexible: waitlist → store links)
- Live hiscores widget (top 5 + activity feed)
- Feature showcase (tracking, gamification, social)
- Interactive demo mode (reuses dashboard components)
- Dedicated /hiscores page (public leaderboards)
- 99 tasks across 7 phases (4-5 week timeline)

**Development Docs**: `dev/active/carve-landing-page/` directory
- `carve-landing-page-plan.md` - Complete 7-phase plan (894 lines)
- `carve-landing-page-context.md` - Key decisions & architecture
- `carve-landing-page-tasks.md` - Task checklist (99 tasks)

## Wiki Encyclopedia Status

### 📋 Planned (Phase 1 - Foundation)
- Markdown-based content system with Git version control
- Search-first UX with prominent search bar
- 6 knowledge domain categories (Nutrition, Exercise Science, Physiology, Training Methods, Psychology, Injury & Health)
- Evidence rating system (Well-Established, Emerging Research, Expert Consensus)
- "Populair Vandaag" sidebar showing top 5 daily articles
- 10-20 foundational articles covering core topics
- Light integration with dashboard

**Development Docs**: `dev/active/wiki-encyclopedia/` directory
- `wiki-encyclopedia-plan.md` - Comprehensive 6-phase implementation plan
- `wiki-encyclopedia-context.md` - Key decisions and architecture details
- `wiki-encyclopedia-tasks.md` - Task checklist (102 tasks)

## Implementation Timeline

**8 Phases Total** (131 tasks):
1. Database Foundation (18 tasks) - ✅ Complete
2. Core UI Components (13 tasks)
3. Workout Tracking (16 tasks)
4. Nutrition Tracking (12 tasks)
5. Social Features (16 tasks)
6. Dashboard Integration (16 tasks)
7. Achievements & Gamification (21 tasks)
8. Polish & Testing (19 tasks)

Current focus: **Phase 2** (building core UI components)

## Repository Info

- **Location**: `/Users/furkanceliker/Celiker Studio/carve.wiki`
- **Git Branch**: `main`
- **Package Manager**: pnpm
- **Development Docs**: `dev/active/dashboard-rebuild/` directory

## Key Design Decisions

1. **Split-screen dashboard** (2/3 personal + 1/3 social) - personal progress is hero content
2. **Level/XP system** (not full D&D stats) - accessible and motivating without being confusing
3. **Combo XP system** (base + streaks + achievements) - rewards consistency over intensity
4. **Highlights-only social feed on dashboard** - prevents noise, full feed on dedicated page
5. **Custom tracking** (not API imports) - full control over UX and gamification integration
6. **Exponential level curve** (N^1.5) - early levels achievable, late levels challenging

## Success Metrics (Target)

**Engagement (First 30 days)**:
- 70%+ users log 1+ workout in first week
- 50%+ users return 3+ days in first week

**Social**:
- 40%+ users add at least one friend
- 20%+ users interact with social feed

**Gamification**:
- 60%+ users reach Level 3 in first 2 weeks
- 5+ achievements unlocked per user average

## Three Website Sections Summary

1. **Carve (Marketing)** - Landing page promoting the Carve mobile app
2. **Wiki** - Evidence-based health/fitness knowledge base (Wikipedia-style)
3. **Dashboard** - Personal fitness tracker with RPG gamification (main focus)
