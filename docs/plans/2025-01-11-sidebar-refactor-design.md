# Sidebar Refactor & Enhanced Navigation Design

**Date:** 2025-01-11
**Status:** Design Complete - Ready for Implementation

## Overview

Refactor the application to use separate sidebar components for each major section (Wiki, Dashboard, Carve) with loading states during transitions. Additionally, enhance the header with global search, language switching, and Hiscores navigation.

## Goals

1. **Separate sidebars per section** - Each section gets its own dedicated sidebar component
2. **Loading states** - Skeleton UI during route transitions for smooth UX
3. **Enhanced header** - Add global search, language switcher, and Hiscores navigation
4. **Search-first homepage** - Auto-focus search on landing
5. **Internationalization** - NL + EN language support

## Architecture

### New File Structure

```
components/
├── app/
│   ├── app-sidebar.tsx (DELETE - replaced by section-specific sidebars)
│   ├── app-header.tsx (MODIFY - add search, language, hiscores)
│   └── sidebars/
│       ├── wiki-sidebar.tsx (NEW)
│       ├── dashboard-sidebar.tsx (NEW)
│       ├── carve-sidebar.tsx (NEW)
│       └── sidebar-skeleton.tsx (NEW - shared skeleton)

app/
├── layout.tsx (MODIFY - remove AppSidebar, keep header + shell only)
├── page.tsx (MODIFY - add large hero search with auto-focus)
├── wiki/
│   ├── layout.tsx (NEW - WikiSidebar + Suspense)
│   └── loading.tsx (NEW - skeleton fallback)
├── dashboard/
│   ├── layout.tsx (MODIFY/NEW - DashboardSidebar + Suspense)
│   └── loading.tsx (NEW - skeleton fallback)
└── carve/
    ├── layout.tsx (NEW - CarveSidebar + Suspense)
    └── loading.tsx (NEW - skeleton fallback)
```

## Component Design

### 1. Section-Specific Sidebars

Each sidebar component (WikiSidebar, DashboardSidebar, CarveSidebar):

- Reuses current AppSidebar logic (hover expand, icon mapping, active states)
- Loads its respective navigation groups from `lib/navigation/*`
- Same visual style: #ececf1 background, 64px → 200px on hover
- Client components for interactivity
- Room for section-specific features later (search bars, filters, stats)

**Shared behavior:**
- Hover expand behavior (64px ↔ 200px)
- Icon mapping system (reuse existing iconMap)
- Active route highlighting
- Smooth transition animations

### 2. Sidebar Skeleton

**SidebarSkeleton component:**
- Width: 64px (collapsed state during load)
- 3-4 skeleton nav items with shimmer animation
- Uses shadcn/ui Skeleton component
- Matches exact dimensions of real sidebar (no layout shift)

### 3. Enhanced Header

**Desktop layout (left to right):**
```
[Logo] | [Wiki] [Dashboard] [Hiscores] ············ [Search] [Language] [Login/Avatar]
```

**Components:**

**Left side (Navigation):**
- Logo (link to home)
- Wiki link
- Dashboard link
- Hiscores link (NEW - core feature, always visible)
- All use same styling with active state highlighting

**Right side (Tools & User):**
- **Search bar** - Expandable: `[🔍]` → click → `[🔍 Search everything... ]`
- **Language switcher** - Text dropdown: `[EN ▾]` → `[✓ EN | NL]`
- **User section** - Login button OR Avatar + dropdown menu

**Mobile:**
- Navigation → Hamburger menu
- Search → Icon button (opens full-screen overlay)
- Language → Inside hamburger menu
- User → Stays visible (compact)

### 4. Global Search

**Search scope:**
- Wiki articles (title, content, categories, tags)
- User profiles (usernames for public profiles)
- Hiscores (search users in rankings)
- Future: Exercises, nutrition items, challenges

**Search UX:**

**Header search (compact):**
```
[🔍] → Click/Press "/" → [🔍 Search everything...] [x]
                              ↓ (start typing)
          [Search Results Dropdown]
          ┌─────────────────────────────┐
          │ 📚 Wiki Articles (3)        │
          │ → Protein Intake Guide      │
          │ → Progressive Overload      │
          │                             │
          │ 👤 Users (2)                │
          │ → @username123             │
          │                             │
          │ 🏆 View all in Hiscores     │
          └─────────────────────────────┘
```

**Homepage search (large hero):**
- Large, centered, prominent search bar
- Auto-focus on page load
- Placeholder: "Search articles, users, rankings..."
- Full-width results overlay
- ESC to blur/close

**Technical:**
- Debounced input (300ms)
- Supabase full-text search across tables
- Client-side instant dropdown
- Keyboard navigation (arrow keys + Enter)
- Mobile: Full-screen overlay

**Result prioritization:**
1. Exact matches (usernames, article titles)
2. Wiki articles (most relevant)
3. User profiles
4. Suggested categories

### 5. Language Switcher (i18n)

**Implementation: next-intl**
- Routes: `/en/*` and `/nl/*`
- Root redirects to browser language on first visit
- User preference saved in cookie
- Type-safe translations with TypeScript

**UI:**
```
[EN ▾] → Click → ┌──────┐
                  │ ✓ EN │
                  │   NL │
                  └──────┘
```
Text-only (no flag icons)

**Translation scope:**

**Fully translated (UI):**
- Navigation labels
- Search placeholders
- Form labels, buttons
- Error messages
- Loading states

**Mixed strategy (Content):**
- Wiki articles: Markdown per language (`/content/wiki/en/`, `/content/wiki/nl/`)
- User-generated: Original language (usernames, bios)
- Hiscores: Labels translated, names stay original

**Fallback:**
- Missing NL translation → Show EN version
- Display banner: "This article is only available in English"

## Layout & Suspense Implementation

### Root Layout (app/layout.tsx)

```tsx
<AppShell>
  <AppHeader /> {/* Global: search, language, nav, user */}
  <AppBody>
    {children} {/* Nested layouts render here */}
  </AppBody>
</AppShell>
```

### Section Layouts (app/wiki/layout.tsx, etc)

```tsx
<Suspense fallback={<SidebarSkeleton />}>
  <WikiSidebar />
</Suspense>
<AppContent>
  {children}
</AppContent>
```

### Loading Behavior

**First load (SSR):**
- Server renders skeleton → streams sidebar → hydrates

**Client navigation:**
- User clicks section → Sidebar skeleton shows → Section sidebar loads → Smooth transition

**Performance optimizations:**
- Sidebars are client components (interactivity needs)
- Navigation data preloaded (static imports)
- Skeletons match exact sidebar dimensions (no layout shift)
- Search results cached client-side

## Error Handling & Edge Cases

### Search Failures
- No results → "No results for '{query}'" + suggestions
- API error → Fallback to cached results + retry button
- Slow connection → Loading skeleton in dropdown

### Sidebar Loading Errors
- Failed load → Error boundary with retry
- Fallback: Minimal navigation (home link only)

### Language Switching
- Missing translation → Fallback to EN + notification banner
- Route not found → Redirect to section home

### Mobile Responsiveness
- Sidebars → Hidden by default, hamburger menu
- Search → Full-screen overlay
- Language switcher → In hamburger menu
- Touch-optimized interactions

### Authentication States
- Logged out → Some sidebar items disabled/hidden
- Logged in → Full navigation
- Demo mode → Banner indicating limited features

### Progressive Enhancement
- Basic navigation works without JS
- Search requires JS (show graceful degradation message)
- Sidebar animations enhance with JS available

## Navigation Flow Examples

### Homepage → Content
```
User lands on / → Large search auto-focused → Type query →
Select result → Navigate to content
```

### Cross-section Navigation
```
User on /wiki/nutrition → Click "Dashboard" →
Sidebar skeleton → Dashboard content + sidebar load → Complete
```

### Quick Search
```
User on any page → Press "/" → Header search expands →
Type → Results dropdown → Navigate
```

## Implementation Priority

### Phase 1: Core Refactor (MVP)
1. Create sidebar components (Wiki, Dashboard, Carve)
2. Create SidebarSkeleton component
3. Refactor layouts with Suspense boundaries
4. Update root layout (remove AppSidebar)

### Phase 2: Enhanced Header
1. Add Hiscores to navigation
2. Implement language switcher (next-intl setup)
3. Add expandable search to header
4. Update mobile menu

### Phase 3: Search Implementation
1. Build global search backend (Supabase queries)
2. Create search dropdown component
3. Add hero search to homepage
4. Implement keyboard shortcuts ("/" to focus)

### Phase 4: Polish & i18n
1. Create translation files (EN/NL)
2. Translate UI elements
3. Set up fallback strategies
4. Add loading states and error boundaries

## Success Criteria

- [ ] Each section has its own sidebar component
- [ ] Smooth transitions with loading skeletons
- [ ] Hiscores accessible from header
- [ ] Global search working across wiki/users/hiscores
- [ ] Language switcher functional (NL/EN)
- [ ] Homepage search auto-focuses
- [ ] "/" keyboard shortcut works
- [ ] Mobile responsive (hamburger menu)
- [ ] No layout shifts during transitions
- [ ] Error states handled gracefully

## Technical Notes

**Dependencies to add:**
- `next-intl` for internationalization
- Potentially `cmdk` for enhanced search UI (optional)

**Database requirements:**
- Full-text search indexes on wiki articles
- Public profile search capability
- Optimized queries for autocomplete

**Performance targets:**
- Search results: < 200ms
- Sidebar transition: < 100ms
- No CLS (Cumulative Layout Shift)
- First paint: Skeleton visible immediately
