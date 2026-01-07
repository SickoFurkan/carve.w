# Admin Settings Two-Column Layout Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a two-column settings layout with sticky category navigation (left) and scrollable content (right) with scroll spy, smooth scrolling, and responsive design.

**Architecture:** Single-page anchor-based navigation using Next.js App Router, client-side scroll spy for active section tracking, CSS Grid for desktop layout, and responsive mobile tabs. All settings live on one page with smooth scroll behavior and URL hash updates.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, lucide-react icons, shadcn/ui components (Button, Input, Label, Switch)

---

## Task 1: Install Required UI Components

**Files:**
- Check: `components/ui/switch.tsx` (may not exist yet)
- Check: `components/ui/select.tsx` (may not exist yet)

**Step 1: Check which shadcn components are missing**

Run: `ls components/ui/`
Expected: List of existing UI components

**Step 2: Install Switch component**

Run: `npx shadcn@latest add switch`
Expected: Creates `components/ui/switch.tsx`

**Step 3: Install Select component**

Run: `npx shadcn@latest add select`
Expected: Creates `components/ui/select.tsx`

**Step 4: Verify installation**

Run: `ls components/ui/ | grep -E "(switch|select)"`
Expected: Both files exist

---

## Task 2: Create Settings Category Navigation Component

**Files:**
- Create: `components/admin/settings-nav.tsx`

**Step 1: Create the component file**

```tsx
'use client';

import { useEffect, useState } from 'react';
import {
  Settings,
  Users,
  FileText,
  Bell,
  Shield,
  Plug,
  Wrench
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsCategory {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const categories: SettingsCategory[] = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'users', label: 'Users & Roles', icon: Users },
  { id: 'content', label: 'Content', icon: FileText },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'advanced', label: 'Advanced', icon: Wrench },
];

interface SettingsNavProps {
  activeSection: string;
  onNavigate: (id: string) => void;
}

export function SettingsNav({ activeSection, onNavigate }: SettingsNavProps) {
  return (
    <nav className="sticky top-0 h-screen overflow-y-auto p-6 border-r border-gray-200 bg-white">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <ul className="space-y-1">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = activeSection === category.id;

          return (
            <li key={category.id}>
              <button
                onClick={() => onNavigate(category.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors',
                  'hover:bg-gray-50',
                  isActive && 'bg-gray-100 font-semibold border-l-4 border-blue-600 -ml-[2px]',
                  !isActive && 'text-gray-700'
                )}
              >
                <Icon className={cn(
                  'w-5 h-5',
                  isActive ? 'text-blue-600' : 'text-gray-400'
                )} />
                <span>{category.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```

**Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add components/admin/settings-nav.tsx
git commit -m "feat(admin): add settings navigation component"
```

---

## Task 3: Create Scroll Spy Hook

**Files:**
- Create: `hooks/use-scroll-spy.ts`

**Step 1: Create hooks directory if needed**

Run: `mkdir -p hooks`

**Step 2: Create the scroll spy hook**

```tsx
'use client';

import { useEffect, useState } from 'react';

export function useScrollSpy(sectionIds: string[], offset: number = 100) {
  const [activeSection, setActiveSection] = useState<string>(sectionIds[0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
            // Update URL hash without scrolling
            window.history.replaceState(null, '', `#${entry.target.id}`);
          }
        });
      },
      {
        rootMargin: `-${offset}px 0px -50% 0px`,
        threshold: 0,
      }
    );

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [sectionIds, offset]);

  return activeSection;
}
```

**Step 3: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add hooks/use-scroll-spy.ts
git commit -m "feat(hooks): add scroll spy hook for section tracking"
```

---

## Task 4: Create Settings Section Component

**Files:**
- Create: `components/admin/settings-section.tsx`

**Step 1: Create the settings section wrapper**

```tsx
import { ReactNode } from 'react';

interface SettingsSectionProps {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export function SettingsSection({
  id,
  title,
  description,
  children
}: SettingsSectionProps) {
  return (
    <section id={id} className="scroll-mt-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          )}
        </div>

        <div className="space-y-6">
          {children}
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add components/admin/settings-section.tsx
git commit -m "feat(admin): add settings section wrapper component"
```

---

## Task 5: Create Setting Item Component

**Files:**
- Create: `components/admin/setting-item.tsx`

**Step 1: Create reusable setting item component**

```tsx
import { ReactNode } from 'react';
import { Label } from '@/components/ui/label';

interface SettingItemProps {
  label: string;
  description: string;
  children: ReactNode;
  htmlFor?: string;
}

export function SettingItem({
  label,
  description,
  children,
  htmlFor
}: SettingItemProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-gray-100 last:border-0 last:pb-0">
      <div className="flex-1">
        <Label
          htmlFor={htmlFor}
          className="font-medium text-gray-900 cursor-pointer"
        >
          {label}
        </Label>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>

      <div className="flex-shrink-0">
        {children}
      </div>
    </div>
  );
}
```

**Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add components/admin/setting-item.tsx
git commit -m "feat(admin): add setting item component"
```

---

## Task 6: Create Save Button Component

**Files:**
- Create: `components/admin/settings-save-button.tsx`

**Step 1: Create save button with loading state**

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface SettingsSaveButtonProps {
  onSave: () => Promise<void>;
  onReset?: () => void;
}

export function SettingsSaveButton({ onSave, onReset }: SettingsSaveButtonProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave();
      // Could add toast notification here
    } catch (error) {
      console.error('Failed to save settings:', error);
      // Could add error toast here
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-3 pt-4">
      {onReset && (
        <Button
          variant="outline"
          onClick={onReset}
          disabled={isSaving}
        >
          Reset
        </Button>
      )}

      <Button
        onClick={handleSave}
        disabled={isSaving}
      >
        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isSaving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
}
```

**Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add components/admin/settings-save-button.tsx
git commit -m "feat(admin): add settings save button with loading state"
```

---

## Task 7: Update Settings Page with Two-Column Layout

**Files:**
- Modify: `app/[locale]/(protected)/admin/settings/page.tsx:1-103`

**Step 1: Replace entire file with new layout**

```tsx
'use client';

import { useState } from 'react';
import { SettingsNav } from '@/components/admin/settings-nav';
import { SettingsSection } from '@/components/admin/settings-section';
import { SettingItem } from '@/components/admin/setting-item';
import { SettingsSaveButton } from '@/components/admin/settings-save-button';
import { useScrollSpy } from '@/hooks/use-scroll-spy';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const SECTION_IDS = [
  'general',
  'users',
  'content',
  'notifications',
  'security',
  'integrations',
  'advanced',
];

export default function AdminSettingsPage() {
  const activeSection = useScrollSpy(SECTION_IDS);

  // Form state
  const [siteName, setSiteName] = useState('Carve Wiki');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [xpPerWorkout, setXpPerWorkout] = useState('50');
  const [xpPerMeal, setXpPerMeal] = useState('10');
  const [weeklyResetDay, setWeeklyResetDay] = useState('1');

  const handleNavigate = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 24; // 6 * 4px (space-y-6)
      const top = element.offsetTop - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const handleSaveGeneral = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Saving general settings:', { siteName, maintenanceMode });
  };

  const handleSaveXP = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Saving XP settings:', { xpPerWorkout, xpPerMeal });
  };

  const handleSaveLeaderboard = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Saving leaderboard settings:', { weeklyResetDay });
  };

  return (
    <div className="grid grid-cols-[250px_1fr] h-full">
      {/* Left Navigation */}
      <SettingsNav
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />

      {/* Right Content */}
      <div className="overflow-y-auto">
        <div className="p-6 max-w-4xl space-y-6">
          {/* General Settings */}
          <SettingsSection
            id="general"
            title="General"
            description="Configure site-wide settings and preferences"
          >
            <SettingItem
              label="Site Name"
              description="The name displayed in the header"
              htmlFor="site-name"
            >
              <Input
                id="site-name"
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-64"
              />
            </SettingItem>

            <SettingItem
              label="Maintenance Mode"
              description="Enable to show maintenance page to users"
              htmlFor="maintenance-mode"
            >
              <Switch
                id="maintenance-mode"
                checked={maintenanceMode}
                onCheckedChange={setMaintenanceMode}
              />
            </SettingItem>

            <SettingsSaveButton onSave={handleSaveGeneral} />
          </SettingsSection>

          {/* Users & Roles */}
          <SettingsSection
            id="users"
            title="Users & Roles"
            description="Manage user permissions and roles"
          >
            <p className="text-sm text-gray-600">
              User management settings coming soon...
            </p>
          </SettingsSection>

          {/* Content Settings */}
          <SettingsSection
            id="content"
            title="Content"
            description="Configure content moderation and wiki settings"
          >
            <p className="text-sm text-gray-600">
              Content settings coming soon...
            </p>
          </SettingsSection>

          {/* Notifications */}
          <SettingsSection
            id="notifications"
            title="Notifications"
            description="Configure email and notification preferences"
          >
            <p className="text-sm text-gray-600">
              Notification settings coming soon...
            </p>
          </SettingsSection>

          {/* Security */}
          <SettingsSection
            id="security"
            title="Security"
            description="Authentication and privacy settings"
          >
            <p className="text-sm text-gray-600">
              Security settings coming soon...
            </p>
          </SettingsSection>

          {/* Integrations */}
          <SettingsSection
            id="integrations"
            title="Integrations"
            description="Third-party services and API configurations"
          >
            <SettingItem
              label="XP per Workout"
              description="Base XP earned per completed workout"
              htmlFor="xp-workout"
            >
              <Input
                id="xp-workout"
                type="number"
                value={xpPerWorkout}
                onChange={(e) => setXpPerWorkout(e.target.value)}
                className="w-32"
              />
            </SettingItem>

            <SettingItem
              label="XP per Meal"
              description="Base XP earned per logged meal"
              htmlFor="xp-meal"
            >
              <Input
                id="xp-meal"
                type="number"
                value={xpPerMeal}
                onChange={(e) => setXpPerMeal(e.target.value)}
                className="w-32"
              />
            </SettingItem>

            <SettingsSaveButton onSave={handleSaveXP} />
          </SettingsSection>

          {/* Advanced */}
          <SettingsSection
            id="advanced"
            title="Advanced"
            description="System settings and danger zone"
          >
            <SettingItem
              label="Weekly Reset Day"
              description="Day of the week to reset leaderboards"
              htmlFor="reset-day"
            >
              <Select value={weeklyResetDay} onValueChange={setWeeklyResetDay}>
                <SelectTrigger className="w-64" id="reset-day">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Monday</SelectItem>
                  <SelectItem value="2">Tuesday</SelectItem>
                  <SelectItem value="3">Wednesday</SelectItem>
                  <SelectItem value="4">Thursday</SelectItem>
                  <SelectItem value="5">Friday</SelectItem>
                  <SelectItem value="6">Saturday</SelectItem>
                  <SelectItem value="0">Sunday</SelectItem>
                </SelectContent>
              </Select>
            </SettingItem>

            <SettingsSaveButton onSave={handleSaveLeaderboard} />
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Test in browser**

1. Navigate to `http://localhost:3000/admin/settings`
2. Verify two-column layout appears
3. Click categories in left nav
4. Verify smooth scrolling to sections
5. Scroll content manually
6. Verify active section highlights in nav

Expected: All navigation and scrolling works smoothly

**Step 4: Commit**

```bash
git add app/[locale]/(protected)/admin/settings/page.tsx
git commit -m "feat(admin): implement two-column settings layout with scroll spy"
```

---

## Task 8: Add Responsive Mobile Layout

**Files:**
- Modify: `app/[locale]/(protected)/admin/settings/page.tsx:64-66`

**Step 1: Add responsive classes to grid container**

Replace line 64:
```tsx
<div className="grid grid-cols-[250px_1fr] h-full">
```

With:
```tsx
<div className="h-full lg:grid lg:grid-cols-[250px_1fr]">
```

**Step 2: Create mobile navigation component**

Create: `components/admin/settings-mobile-nav.tsx`

```tsx
'use client';

import {
  Settings,
  Users,
  FileText,
  Bell,
  Shield,
  Plug,
  Wrench
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsCategory {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const categories: SettingsCategory[] = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'content', label: 'Content', icon: FileText },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'advanced', label: 'Advanced', icon: Wrench },
];

interface SettingsMobileNavProps {
  activeSection: string;
  onNavigate: (id: string) => void;
}

export function SettingsMobileNav({
  activeSection,
  onNavigate
}: SettingsMobileNavProps) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 lg:hidden">
      <h1 className="text-xl font-bold text-gray-900 mb-3">Settings</h1>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = activeSection === category.id;

          return (
            <button
              key={category.id}
              onClick={() => onNavigate(category.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors flex-shrink-0',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{category.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

**Step 3: Update settings page to include mobile nav**

Modify `app/[locale]/(protected)/admin/settings/page.tsx`

Add import:
```tsx
import { SettingsMobileNav } from '@/components/admin/settings-mobile-nav';
```

Update return statement (after line 63):
```tsx
return (
  <div className="h-full lg:grid lg:grid-cols-[250px_1fr]">
    {/* Mobile Navigation */}
    <SettingsMobileNav
      activeSection={activeSection}
      onNavigate={handleNavigate}
    />

    {/* Desktop Left Navigation */}
    <div className="hidden lg:block">
      <SettingsNav
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />
    </div>

    {/* Right Content */}
    <div className="overflow-y-auto">
      {/* ... rest of content ... */}
    </div>
  </div>
);
```

**Step 4: Add scrollbar-hide utility to global CSS**

Add to `app/globals.css`:
```css
@layer utilities {
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
}
```

**Step 5: Test responsive behavior**

1. Open browser DevTools
2. Toggle device emulation (mobile view)
3. Verify horizontal scrolling tabs appear
4. Verify desktop sidebar hidden
5. Test navigation on mobile
6. Switch back to desktop view
7. Verify sidebar navigation works

Expected: Clean responsive transition between layouts

**Step 6: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 7: Commit**

```bash
git add components/admin/settings-mobile-nav.tsx app/[locale]/(protected)/admin/settings/page.tsx app/globals.css
git commit -m "feat(admin): add responsive mobile navigation for settings"
```

---

## Task 9: Add Smooth Scroll CSS

**Files:**
- Modify: `app/globals.css`

**Step 1: Add smooth scroll behavior**

Add to `app/globals.css`:
```css
html {
  scroll-behavior: smooth;
}
```

**Step 2: Test smooth scrolling**

1. Navigate to settings page
2. Click different categories rapidly
3. Verify smooth scroll animation

Expected: Smooth scrolling between sections

**Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat(admin): add smooth scroll behavior to settings"
```

---

## Task 10: Final Testing & Polish

**Files:**
- Test: All settings page functionality

**Step 1: Test desktop navigation**

Test checklist:
- [ ] Sticky left sidebar stays in place while scrolling
- [ ] Active section highlights correctly
- [ ] Clicking categories scrolls to correct section
- [ ] URL hash updates when scrolling (#general, #users, etc.)
- [ ] Save buttons show loading state
- [ ] Form inputs work correctly

**Step 2: Test mobile navigation**

Test checklist:
- [ ] Horizontal tabs visible on mobile (<1024px)
- [ ] Tabs scroll horizontally
- [ ] Active tab highlighted correctly
- [ ] Clicking tabs scrolls to section
- [ ] Desktop sidebar hidden on mobile

**Step 3: Test interactions**

Test checklist:
- [ ] Input fields accept and display values
- [ ] Toggle switches work
- [ ] Select dropdowns open and select values
- [ ] Save buttons trigger (check console logs)
- [ ] Loading states appear during save

**Step 4: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No TypeScript errors

**Step 5: Build test**

Run: `pnpm build`
Expected: Successful build with no errors

**Step 6: Final commit**

```bash
git add -A
git commit -m "test(admin): verify settings layout functionality"
```

---

## Summary

**Total Tasks:** 10
**Estimated Time:** 2-3 hours

**What was built:**
- Two-column settings layout (sticky nav + scrollable content)
- Scroll spy for active section tracking
- Smooth scroll navigation with URL hash updates
- Responsive mobile layout with horizontal tabs
- Reusable setting components (Section, Item, SaveButton)
- Form state management with loading states
- 7 settings categories ready for content

**Next steps:**
- Add actual API integration for saving settings
- Add toast notifications for save success/error
- Implement unsaved changes warning
- Add more settings to each category
- Connect to Supabase for persistent storage
