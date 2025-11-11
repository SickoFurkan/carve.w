# Carve Landing Page - Implementation Plan

**Last Updated: 2025-01-10**

---

## 📋 Plan Status: READY TO IMPLEMENT

Complete implementation plan for the Carve mobile app marketing website.

---

## 📁 Documents in This Directory

### 1. **carve-landing-page-plan.md** (Comprehensive Plan)
**894 lines** - Complete strategic plan with:
- Executive Summary
- 7 Implementation Phases (99 tasks)
- Database schema with SQL
- Risk assessment & mitigation
- Success metrics
- Timeline estimates (4-5 weeks)

### 2. **carve-landing-page-context.md** (Key Decisions)
Design decisions and architecture:
- Waitlist → Store links strategy
- Demo mode (reuse dashboard components)
- Live hiscores (unique differentiator)
- Public leaderboards (opt-out model)
- Tone & messaging guidelines
- Component patterns

### 3. **carve-landing-page-tasks.md** (Task Checklist)
99 actionable tasks organized by phase:
- Phase 1: Waitlist System & Data (12 tasks)
- Phase 2: Hero & Structure (11 tasks)
- Phase 3: Hiscores Widget (9 tasks)
- Phase 4: Feature Sections (15 tasks)
- Phase 5: Demo Mode (13 tasks)
- Phase 6: Full Hiscores Page (18 tasks)
- Phase 7: Polish & Optimization (21 tasks)

---

## 🎯 What We're Building

### Landing Page (/)
- Hero with "Join Waitlist" CTA (flexible: switches to store links when app launches)
- Live hiscores widget (top 5 + activity feed)
- Feature showcase (tracking, gamification, social)
- Demo teaser linking to /dashboard

### Hiscores Page (/hiscores)
- Public leaderboards (no login required)
- Multiple tabs: Overall, Workouts, Streaks, PRs
- Filters: Timeframe, future: gender/age
- Live activity feed

### Demo Mode (/dashboard)
- Non-logged-in users see interactive demo
- Reuses ALL dashboard components (zero duplication)
- Sample data (client-side)
- "Sign up to track for real" CTAs

---

## 🏗️ Key Architecture Decisions

### 1. **Flexible Launch Strategy**
```typescript
// Environment variable controls entire flow
NEXT_PUBLIC_APP_STATUS = 'waitlist' | 'live'

// Waitlist mode: Collect emails
// Live mode: Link to App Store/Play Store
// Switch in seconds when ready
```

### 2. **Zero Component Duplication**
```typescript
// Demo mode reuses real dashboard
const data = user
  ? await fetchRealData(user.id)  // Real user
  : getDemoData();                 // Demo user

// Same components for both!
<DashboardLayout data={data} />
```

### 3. **Social Proof via Live Leaderboards**
- Top 5 users on landing page (updates every 30s)
- Activity feed scrolling (PRs, level-ups, achievements)
- Full leaderboards on /hiscores (50+ users)
- Only users with `show_on_leaderboard = true` (opt-out, default true)

---

## 📊 Database Changes Needed

### New Table
- `waitlist` - Email capture for pre-launch

### Schema Update
- `profiles.show_on_leaderboard` (boolean, default true)

### New Functions (5)
- `get_global_leaderboard(limit, timeframe)`
- `get_live_activity_feed(limit)`
- `get_workouts_leaderboard(timeframe, limit)`
- `get_streaks_leaderboard(limit)`
- `get_prs_leaderboard(exercise, limit)`

See `carve-landing-page-plan.md` for complete SQL.

---

## 📅 Timeline

**4-5 weeks** (moderate pace, part-time ~20hr/week)

- Week 1: Waitlist system + Hero section
- Week 2: Hiscores widget + Feature sections
- Week 3: Demo mode + Full hiscores page
- Week 4: Polish + Optimization
- Week 5: Buffer for testing/fixes

---

## 🚀 Quick Start

1. **Read the plan**: `carve-landing-page-plan.md`
2. **Understand decisions**: `carve-landing-page-context.md`
3. **Start Phase 1**: `carve-landing-page-tasks.md`
4. **Track progress**: Check off tasks as you complete them

---

## ✅ Success Criteria

**MVP Launch**:
- [ ] Landing page loads <1s
- [ ] Waitlist works (500+ signups in first month)
- [ ] Hiscores shows live data
- [ ] Demo mode is fully interactive
- [ ] Mobile responsive (375px+)
- [ ] Lighthouse performance >90

**When App Launches**:
- [ ] Toggle env variable to 'live'
- [ ] Email waitlist: "We're live!"
- [ ] 30%+ waitlist converts to download

---

## 🎨 Design Vibe

**Tone**: Direct, energetic, friendly (not corporate)
- ✅ "Track everything. Level up. Win."
- ❌ "Transform your fitness journey with our revolutionary platform"

**Visuals**: Modern, clean (#ececf1), energetic
- Hero: Bold headline + app mockup
- Features: Cards with icons/screenshots
- Gamification: Dark section (#2d2d2d) for contrast
- Social: Friendly, community vibe

---

## 🔧 Dependencies

**Already Installed**: Next.js 16, React 19, TypeScript, Tailwind CSS 4, Supabase, Lucide icons

**To Install**: `pnpm add zod` (email validation)

**Optional**: `framer-motion` (animations), `react-intersection-observer` (lazy loading)

---

## 📝 Notes

- **Demo mode** depends on dashboard being somewhat functional (Phase 5 can be delayed if needed)
- **Hiscores** need some web dashboard users for data (can seed with demo users if empty)
- **App screenshots** need to be created/obtained (use Figma mockups or real app screenshots)
- **Analytics** choice: GA4 (free but cookies) vs Plausible (paid but privacy-friendly)

---

**Ready to build!** 🎉

Start met Phase 1 in `carve-landing-page-tasks.md` en track je progress!
