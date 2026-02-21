# Health Dashboard Redesign

Date: 2026-02-21

## Goal

Rebuild the health dashboard to mirror the iOS Carve app (Feb 2026 dark theme). Replace all old dashboard widgets with new components following the money dashboard pattern (MoneyCard, staggered animations, responsive grid).

## Reference

- iOS app screenshots (Feb 13, 2026 - dark theme)
- Money dashboard: `app/(protected)/dashboard/money/page.tsx`
- Money shared components: `components/money/shared/`

## Layout (Grid Dashboard)

```
Header: "Carve Health" + Season badge (Season 1 · Rookie · 0 pts)

Stats Row (3 columns):
  [Workouts: 0] [Steps: 7.8K] [Worldwide: --]

Two-Column Section:
  [World Ranking]          [Challenges]
  - Legend                 - Daily (0/5)
  - Master                - Monthly (0/12)
  - Elite
  - Advanced
  - Intermediate
  - Beginner
  - ● Rookie (active)

Full Width:
  [Daily Routine]
  - Browse habits + add button

Quick Links (3 columns):
  [Food] [Workouts] [Social]
```

## New Components

| Component | Path | Type |
|-----------|------|------|
| HealthCard | `components/dashboard/shared/HealthCard.tsx` | Shared base card |
| HealthStatCard | `components/dashboard/widgets/HealthStatCard.tsx` | Stat card (label + value + unit) |
| WorldRankingCard | `components/dashboard/widgets/WorldRankingCard.tsx` | Tier progression widget |
| ChallengesCard | `components/dashboard/widgets/ChallengesCard.tsx` | Daily/Monthly challenges |
| DailyRoutineCard | `components/dashboard/widgets/DailyRoutineCard.tsx` | Habits widget |
| QuickLinkCard | `components/dashboard/widgets/QuickLinkCard.tsx` | Nav card to sections |

## Components to Remove

### Widgets (components/dashboard/widgets/)
- TodayActivityHero.tsx
- QuickStat.tsx
- ActivityHeatmap.tsx
- NutritionSnapshot.tsx
- WeeklySchedule.tsx
- AchievementProgress.tsx
- FriendLeaderboard.tsx

### Shared (components/dashboard/widgets/shared/)
- WidgetSkeleton.tsx
- WidgetCard.tsx
- DarkCard.tsx
- ProgressBar.tsx
- CircularGauge.tsx
- Sparkline.tsx
- index.ts

### Other (components/dashboard/)
- DashboardGrid.tsx
- stat-card.tsx
- stats-grid.tsx
- xp-progress-bar.tsx
- profile-header.tsx
- RecommendedArticles.tsx
- SocialFeedHighlights.tsx
- social-feed-highlights.tsx

## Styling

- Cards: `bg-[#1c1f27] border border-white/[0.06] rounded-xl p-5`
- Container: `max-w-7xl mx-auto p-6 lg:p-10 space-y-6`
- Typography: bold white for values, `text-xs uppercase tracking-wider text-slate-500` for labels
- Ranking accent: warm gold/yellow for active rank (matching iOS app)
- Staggered framer-motion entrance animations (0s, 0.1s, 0.2s, etc.)
- Responsive: 1 column mobile → multi-column desktop

## Data Sources

- `user_stats`: level, total_xp, current_workout_streak
- `workouts`: count for current period
- Ranking tiers: UI-only calculation based on points
- Challenges/Habits: placeholder/sample data initially
