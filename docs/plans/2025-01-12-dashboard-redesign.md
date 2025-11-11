# Dashboard Redesign - Modern Widget-Based Layout

**Date**: 2025-01-12
**Status**: Design Complete - Ready for Implementation
**Design Goal**: Transform dashboard from basic split-screen to sophisticated, visual widget-based layout with dark mode aesthetic

---

## Design Philosophy

### Core Principles
- **Quick glance over deep dive** - Dashboard shows high-level overview; detailed pages for interactions
- **Visual over textual** - Data visualizations, gradients, charts over plain text/numbers
- **Dark + Light contrast** - Hero cards dark navy, detail widgets clean white
- **Widget-based flexibility** - Modular cards that can grow/adapt over time
- **Inline contextual actions** - Actions live within relevant widgets

### Inspiration
Modern wellness dashboard aesthetic (Magnus Health reference):
- Deep navy/black backgrounds for hero content
- White cards for detailed data
- Colorful gradient visualizations
- Glassmorphism and subtle borders
- Large, bold typography
- Organic glowing effects

---

## Layout Structure

### Grid System

```
┌────────────────────────────────────────┐ ┌──────────────┐
│ [HERO: Today's Activity Summary]       │ │ [Quick Stat] │
│ • 70% width                            │ │ • 30% width  │
│ • Dark background                      │ │ • Dark bg    │
└────────────────────────────────────────┘ └──────────────┘

┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐
│ [Schedule]   │ │ [Sleep/      │ │ [Nutrition]          │
│ • 1/3 width  │ │  Recovery]   │ │ • 1/3 width          │
│ • White bg   │ │ • 1/3 width  │ │ • White bg           │
│              │ │ • White bg   │ │                      │
└──────────────┘ └──────────────┘ └──────────────────────┘

┌──────────────┐ ┌─────────────────────────────────────────┐
│ [Heatmap]    │ │ [Friend Leaderboard]                    │
│ • 1/3 width  │ │ • 2/3 width                             │
│ • White bg   │ │ • White bg                              │
└──────────────┘ └─────────────────────────────────────────┘
```

### Responsive Behavior
- **Desktop (>1024px)**: Asymmetric grid as shown above
- **Tablet (768-1024px)**: 2 columns, cards reflow
- **Mobile (<768px)**: Single column, full-width cards

---

## Widget Specifications

### 1. Hero Card - Today's Activity Summary

**Purpose**: Primary dashboard focus - shows today's overall activity at a glance

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ Today's Activity              🔥 450  ⏱️ 35   ⭐ 120 │
│ Your Path to Fitness          kcal   min    +2.0x   │
│                                                       │
│ [Gradient sparkline bar - 7 days visualization]      │
│                                    + Start Workout   │
└─────────────────────────────────────────────────────┘
```

**Content:**
- **Title**: "Today's Activity" (large, 32px)
- **Subtitle**: "Your Path to Fitness Excellence" (muted, 14px)
- **3 Metrics** (right-aligned):
  - Calories burned (calculated from workouts)
  - Active minutes (sum of workout durations)
  - XP earned (with streak multiplier shown)
- **7-Day Sparkline**:
  - Vertical bars for Mon-Sun
  - Height = total XP that day
  - Gradient colors (purple → blue → teal → orange)
  - Today highlighted with glow
  - Hover tooltip shows exact values
- **Action**: "+ Start Workout" ghost button (bottom-right)

**Visual Style:**
- Background: `#0a0e1a` (deep navy)
- Primary text: `#ffffff`
- Secondary text: `#8b92a8`
- Gradient: `linear-gradient(90deg, #8b5cf6, #3b82f6, #06b6d4, #f59e0b)`
- Border: `1px solid rgba(255,255,255,0.1)`
- Border radius: `16px`
- Padding: `32px`

**Data Sources:**
- Workouts today (calculate calories/duration)
- XP from user_stats
- 7-day history from user_stats or activity aggregation

---

### 2. Quick Stat Card

**Purpose**: Highlight one impressive metric with visual flair

**Content Options** (rotate or user preference):
- Steps today (if tracking)
- Latest PR (exercise + weight)
- Current streak (with fire emoji)

**Layout:**
```
┌──────────────┐
│ Step Count   │
│              │
│   [Glow]     │
│   7,166      │
│   steps      │
└──────────────┘
```

**Visual Style:**
- Same dark navy background as hero
- Large number: `72px`, white, tabular-nums
- Label: Small gray text
- **Visual element**: Organic blob glow effect
  - CSS backdrop-filter or layered gradients
  - Yellow/green/blue glow (non-data decoration)
  - Creates depth and visual interest
- Square-ish aspect ratio

**Data Sources:**
- Manual step tracking (future: Apple Health/Google Fit)
- Recent PRs from exercises table
- Current streak from user_stats

---

### 3. Weekly Training Schedule

**Purpose**: See week-at-a-glance workout plan and completion status

**Layout:**
```
┌─────────────────────────────────┐
│ Weekly Schedule                 │
│                                 │
│ S  M  T  W  T  F  S            │
│ 5  6  7  8  9 10 11            │
│ ○  ●  ●  ○  ●  ○  ○            │
│ ↑  ↑  ↑     ↑                  │
│                                 │
│ + Plan workout                  │
└─────────────────────────────────┘
```

**Content:**
- 7 columns (Mon-Sun)
- Each day shows:
  - Day abbreviation (S M T W T F S)
  - Date number
  - Status indicator:
    - Green dot = completed
    - Gray dot = planned
    - Empty = rest day
  - Workout type icon (strength/cardio)
- Today: Background highlight

**Color Coding:**
- Strength: `#8b5cf6` (purple)
- Cardio: `#3b82f6` (blue)
- Rest: `#9ca3af` (gray)
- Today highlight: `#f3f4f6`

**Interactions:**
- Click day → opens workout planning modal
- "+ Plan workout" link at bottom

**Data Structure (New):**
- New table: `workout_plans`
  - user_id, date, workout_type, status (planned/completed)
- Query: Get current week's plans + actual workouts

---

### 4. Sleep & Recovery (Future/Optional MVP)

**Purpose**: Track recovery metrics for optimization

**Layout:**
```
┌─────────────────────────────────┐
│ Sleep and Recovery  15.02.24    │
│                                 │
│ Deep sleep  Restful    REM      │
│    72%        60%       30%     │
│   ●●●●●      ●●●●●     ●●●●●    │
└─────────────────────────────────┘
```

**Content:**
- Date displayed
- 3 metrics with percentages
- Dot visualizations (5 dots each, filled by %)
- Manual entry initially

**Data Structure (Future):**
- New table: `sleep_tracking`
  - user_id, date, hours_slept, quality_rating

**MVP Decision**: Can be placeholder or skipped for initial launch

---

### 5. Nutrition Snapshot

**Purpose**: Quick view of today's nutrition status vs goals

**Layout:**
```
┌──────────────────────────────────┐
│ Nutrition Tracking               │
│                                  │
│ 🍽️ Calories  💪 Protein  💧 Water│
│   2,000       35%        2.5L    │
│                                  │
│    [Circular gauge with lines]   │
│         2/240 Kcal/day           │
│                                  │
│                  + Log meal      │
└──────────────────────────────────┘
```

**Content:**
- **Top row**: 3 key metrics
  - Calories consumed vs goal
  - Protein as % of goal
  - Water intake (manual)
- **Bottom**: Circular/arc gauge visualization
  - Shows calorie progress
  - Radiating lines decoration (like reference)
  - Large number in center

**Visual Style:**
- Calorie gauge: Gradient `#3b82f6` → `#06b6d4`
- Protein: `#8b5cf6`
- Hydration: `#06b6d4`
- Arc fills clockwise as goal approaches

**Interactions:**
- "+ Log meal" button (bottom-right)
- Click metrics → navigate to /food page

**Data Sources:**
- Today's meals (sum calories + macros)
- User goals (from user_stats or new goals table)

---

### 6. Activity Heatmap

**Purpose**: GitHub-style visualization showing consistency and effort over time

**Layout:**
```
┌──────────────────────────────────┐
│ Activity Heatmap    Last 90 days │
│                                  │
│ Jan  Feb  Mar  Apr               │
│ ■■■□■■■ ■■□■■■■ ■■■■■□■ ■■■■■■■│
│ ■■□■■■■ □■■■■■□ ■■■■■■■ ■■■■□■■│
│ ...                              │
└──────────────────────────────────┘
```

**Content:**
- 13 weeks × 7 days grid
- Each cell = one day
- Color intensity = XP earned that day
- Month labels above grid
- Today: subtle border

**Color Scale (XP-based):**
- No activity: `#f3f4f6` (light gray)
- 1-50 XP: `#dbeafe` (very light blue)
- 51-150 XP: `#93c5fd` (light blue)
- 151-300 XP: `#3b82f6` (medium blue)
- 301+ XP: `#1e40af` (dark blue)

**Interactions:**
- Hover: Tooltip with date + exact XP
- Click cell: Navigate to that day's detail view (future)

**Data Sources:**
- Query: Last 90 days of XP from user_stats history
- Aggregate daily totals from workouts/meals

---

### 7. Achievement Progress

**Purpose**: Celebrate wins and motivate toward next goals

**Layout:**
```
┌──────────────────────────────────┐
│ Achievements                     │
│                                  │
│ ✨ Latest Achievement            │
│ [Badge] Week Warrior - Silver    │
│ Unlocked 2 hours ago             │
│                                  │
│ In Progress                      │
│ 🏋️ Strength Master  ████░░  85% │
│ 🔥 Fire Streak      ███░░░  60% │
│ 📈 Volume King      ██░░░░  40% │
│                                  │
│ View all achievements            │
└──────────────────────────────────┘
```

**Split Layout:**

**Top Section** (if recent unlock exists):
- "Latest Achievement" label
- Badge icon with glow effect
- Achievement name + tier (Bronze/Silver/Gold)
- Timestamp relative (e.g., "2 hours ago")
- Subtle gradient background for celebration

**Bottom Section:**
- "In Progress" label
- 2-3 closest achievements to unlocking
- Each shows:
  - Icon + name
  - Progress bar (6px height, rounded)
  - Percentage + fraction (17/20 workouts)

**Progress Bar Colors:**
- Gradient matching achievement category
- Background: `#f3f4f6`
- Smooth transitions on updates

**Interactions:**
- "View all achievements" link → dedicated achievements page

**Data Sources:**
- Recent unlocks from user_achievements (last 24-48 hours)
- All achievements with progress calculation
- Sort by % complete descending

---

### 8. Friend Leaderboard

**Purpose**: Healthy competition and social motivation through weekly rankings

**Layout:**
```
┌──────────────────────────────────────────┐
│ Friend Leaderboard                       │
│ This Week's Warriors    Resets in 3 days │
│                                          │
│ Rank  Name           Level   XP          │
│ ───────────────────────────────────────  │
│ 🥇 1  Sarah Martinez   15    850 XP      │
│ 🥈 2  You              8     720 XP  ←   │
│ 🥉 3  Mike Chen        12    680 XP      │
│    4  Emma Williams    9     620 XP      │
│    5  John Davis       11    580 XP      │
│                                          │
│ View full leaderboard                    │
└──────────────────────────────────────────┘
```

**Content:**
- Header: "This Week's Warriors"
- Reset countdown: "Resets in X days"
- Top 5 friends ranked by weekly XP
- Columns:
  - Rank (with trophy icons for top 3)
  - Name
  - Level badge (shows long-term context)
  - XP this week

**Styling:**
- Your row: Highlighted with light blue bg `#eff6ff`
- Trophy icons: 🥇🥈🥉 (gold, silver, bronze)
- Level badges: Small circular badges
- Alternating row backgrounds (subtle)

**Data Logic:**
- Weekly XP = sum of XP earned since Monday 00:00
- Includes friends from friendships table (status = accepted)
- Level shown for context (shows dedication, not just this week)
- Reset timer: Days until next Monday

**Interactions:**
- "View full leaderboard" → dedicated social/leaderboard page
- Click friend row → navigate to their profile (future)

**Data Structure:**
- Query: Get friends' user_stats
- Calculate weekly XP (from activity_feed or daily aggregates)
- Sort by weekly XP DESC, limit 5 for widget

---

## Color System

### Dark Cards (Hero + Quick Stat)
```css
--bg-dark: #0a0e1a;
--text-primary: #ffffff;
--text-secondary: #8b92a8;
--border-dark: rgba(255, 255, 255, 0.1);
```

### Light Cards (All other widgets)
```css
--bg-light: #ffffff;
--text-dark-primary: #1a1a1a;
--text-dark-secondary: #6b7280;
--border-light: rgba(0, 0, 0, 0.08);
```

### Accent Colors
```css
--purple: #8b5cf6;
--blue: #3b82f6;
--teal: #06b6d4;
--orange: #f59e0b;
--green: #10b981;
--red: #ef4444;
--gray: #9ca3af;
```

### Gradients
```css
--gradient-primary: linear-gradient(90deg, #8b5cf6, #3b82f6, #06b6d4, #f59e0b);
--gradient-blue: linear-gradient(135deg, #3b82f6, #06b6d4);
--gradient-purple: linear-gradient(135deg, #8b5cf6, #a78bfa);
```

---

## Typography

### Font Family
- Primary: SF Pro Display (system-ui fallback)
- Monospace: SF Mono (for numbers, tabular-nums)

### Scale
```css
--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 20px;
--text-2xl: 24px;
--text-3xl: 32px;
--text-4xl: 48px;
--text-5xl: 72px; /* Quick stat card */
```

### Weights
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

---

## Data Requirements

### Existing Data (Already Tracked)
✅ Workouts (exercises, sets, reps, weight)
✅ Meals (calories, macros)
✅ XP/Level/Streaks
✅ Achievements
✅ Friendships
✅ Activity feed

### New Data Needed

#### 1. Workout Plans Table
```sql
CREATE TABLE workout_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  workout_type TEXT, -- 'strength' | 'cardio' | 'rest'
  status TEXT DEFAULT 'planned', -- 'planned' | 'completed' | 'skipped'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);
```

#### 2. User Goals Table (for nutrition targets)
```sql
CREATE TABLE user_goals (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  daily_calories INTEGER DEFAULT 2200,
  daily_protein_g INTEGER DEFAULT 150,
  daily_carbs_g INTEGER DEFAULT 220,
  daily_fats_g INTEGER DEFAULT 73,
  daily_water_l DECIMAL DEFAULT 2.5,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3. Daily Steps Tracking (Manual Entry)
```sql
CREATE TABLE daily_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  steps INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);
```

#### 4. Sleep Tracking (Future/Optional)
```sql
CREATE TABLE sleep_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hours_slept DECIMAL,
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);
```

### Calculated Metrics (No Storage Needed)
- **Calories burned**: Estimate from workout duration (e.g., 5-8 cal/min depending on intensity)
- **Active minutes**: Sum of workout durations for the day
- **Weekly XP**: Aggregate XP earned since Monday 00:00
- **Nutrition %**: Compare meals today vs goals table

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
**Goal**: Core layout + dark/light card system

1. Create new dashboard layout component
2. Implement hero card (without sparkline viz)
3. Implement quick stat card (without glow effect)
4. Create white card wrapper component
5. Migrate existing stats to new widgets
6. Test responsive behavior

**Deliverables:**
- New dashboard layout renders
- Basic cards display (no advanced viz yet)
- Mobile responsive

---

### Phase 2: Data Visualizations (Week 2)
**Goal**: Add sparkline, heatmap, circular gauges

1. Implement 7-day sparkline (Recharts or Chart.js)
2. Build activity heatmap component (XP-based)
3. Create circular gauge for nutrition
4. Add gradient colors and transitions
5. Implement hover tooltips

**Deliverables:**
- Hero card with working sparkline
- Activity heatmap showing last 90 days
- Nutrition gauge visualization

---

### Phase 3: New Features (Week 3)
**Goal**: Workout planning + goals system

1. Create workout_plans table migration
2. Create user_goals table migration
3. Build weekly schedule widget
4. Implement "+ Plan workout" modal
5. Build goal setting interface (/settings)
6. Update nutrition widget to use goals

**Deliverables:**
- Users can plan workouts for the week
- Users can set nutrition goals
- Schedule widget shows planned vs completed

---

### Phase 4: Social & Gamification (Week 4)
**Goal**: Friend leaderboard + achievement progress

1. Add weekly XP calculation logic
2. Build friend leaderboard widget
3. Implement achievement progress tracking
4. Create "split view" achievement widget
5. Add achievement unlock notifications (toast)

**Deliverables:**
- Weekly leaderboard functional
- Achievement progress displays correctly
- Recent unlocks celebrated

---

### Phase 5: Manual Tracking & Polish (Week 5)
**Goal**: Steps, glow effects, final touches

1. Create daily_steps table migration
2. Build step tracking modal
3. Implement organic glow effect (quick stat)
4. Add sleep tracking (optional)
5. Polish animations and transitions
6. Accessibility audit (keyboard nav, ARIA labels)
7. Performance optimization (lazy loading, suspense)

**Deliverables:**
- All widgets functional
- Glow effects working
- Smooth animations
- WCAG AA compliant

---

## Technical Considerations

### Component Architecture
```
app/(protected)/dashboard/
├── page.tsx                      # Main dashboard layout
├── loading.tsx                   # Loading skeletons
└── components/
    ├── ActivityHero.tsx          # Hero card
    ├── QuickStat.tsx             # Quick stat card
    ├── WeeklySchedule.tsx        # Schedule widget
    ├── NutritionSnapshot.tsx     # Nutrition widget
    ├── ActivityHeatmap.tsx       # Heatmap widget
    ├── AchievementProgress.tsx   # Achievement widget
    ├── FriendLeaderboard.tsx     # Leaderboard widget
    └── shared/
        ├── WidgetCard.tsx        # White card wrapper
        ├── ProgressBar.tsx       # Reusable progress bar
        ├── CircularGauge.tsx     # Reusable gauge
        └── Sparkline.tsx         # Reusable sparkline
```

### Chart Library Decision
**Recommendation**: Recharts
- Pros: React-native, composable, responsive, good docs
- Cons: Bundle size (~100kb), but acceptable for dashboard
- Alternative: Chart.js (lighter but less React-friendly)

### State Management
- Server Components for data fetching (default)
- Client Components only where needed:
  - Hover interactions (tooltips, highlights)
  - Modal dialogs (plan workout, log meal)
  - Animations and transitions
- No global state library needed initially

### Performance Targets
- Initial load: <2s
- Widget render: <100ms
- Chart interactions: 60fps
- Lighthouse Performance: >90

---

## Migration Strategy

### Approach: Parallel Development
1. Build new dashboard at `/dashboard/v2` initially
2. Test thoroughly with real data
3. Switch route when ready (rename old to `/dashboard/classic`)
4. Keep old dashboard for 1-2 weeks as fallback
5. Remove old dashboard after validation

### Data Migration
- No data migration needed (using existing tables)
- New tables (workout_plans, user_goals) start empty
- Users gradually populate as they use features

---

## Success Metrics

### User Engagement (First 30 Days)
- **Dashboard views**: 80%+ of daily active users visit dashboard
- **Widget interactions**: 60%+ users click into at least one widget
- **Quick actions used**: 40%+ users log workout/meal from inline buttons

### Feature Adoption
- **Workout planning**: 30%+ users plan at least one workout
- **Goal setting**: 50%+ users set nutrition goals
- **Leaderboard engagement**: 40%+ users with friends check weekly rankings

### Technical Performance
- **Lighthouse Performance**: >90
- **Lighthouse Accessibility**: >90
- **Core Web Vitals**: All green (LCP <2.5s, FID <100ms, CLS <0.1)

---

## Future Enhancements (Post-MVP)

### Phase 6: Advanced Features
- **Activity sync**: Apple Health / Google Fit integration
- **Custom widgets**: Users choose which widgets to show
- **Widget reordering**: Drag-and-drop layout customization
- **Dark mode toggle**: User preference for light/dark
- **Export data**: Download activity CSV/PDF reports

### Phase 7: Social Expansion
- **Global leaderboards**: Beyond just friends
- **Challenges**: Weekly/monthly team challenges
- **Social feed**: Full activity stream on dedicated page
- **Workout templates**: Share workout plans with friends

### Phase 8: AI & Insights
- **Trend analysis**: "You're lifting 15% more this month"
- **Recommendations**: "Based on your schedule, try..."
- **Predictive goals**: "At this rate, you'll hit Level 20 in 6 weeks"
- **Recovery insights**: "You've worked out 5 days straight, consider rest"

---

## Design Rationale

### Why Widget-Based Layout?
- **Scalability**: Easy to add/remove/rearrange features
- **Clarity**: Each widget has single, clear purpose
- **Mobile-friendly**: Cards stack naturally on small screens
- **Modern**: Matches contemporary wellness app design

### Why Dark Hero + White Details?
- **Visual hierarchy**: Dark hero draws immediate attention
- **Contrast**: White cards feel clean and data-focused
- **Aesthetics**: Matches reference design, feels premium
- **Functionality**: Dark mode for frequently-viewed, light for detailed reading

### Why Weekly Leaderboard vs Activity Feed?
- **Motivation**: Competition drives engagement more than passive feed
- **Fairness**: Weekly reset gives everyone a fresh chance
- **Simplicity**: Single number (XP) easier to understand than feed complexity
- **Action-oriented**: "I'm #3, let me log a workout to catch up"

---

## Conclusion

This redesign transforms the Carve dashboard from a functional but basic interface into a visually stunning, motivation-driving hub for fitness tracking. The widget-based architecture provides flexibility for future growth while the dark/light contrast creates visual hierarchy and modern appeal.

**Key Innovations:**
✅ Multi-metric activity hero with gradient visualization
✅ XP-based heatmap for consistency tracking
✅ Weekly friend leaderboard for social motivation
✅ Split achievement view (celebrate + motivate)
✅ Inline contextual actions (no hunting for buttons)
✅ Calculated metrics (calories, active time) without manual entry

**Ready to implement in 5 phases over ~5 weeks.**

---

**Next Steps:**
1. Review and approve design
2. Create detailed implementation tasks
3. Begin Phase 1: Foundation
4. Iterate based on user feedback
