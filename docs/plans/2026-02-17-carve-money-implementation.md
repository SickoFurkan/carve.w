# Carve Money Dashboard — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the Carve Money financial tracking dashboard (frontend-only with sample data) as a dark-themed sub-section under `/dashboard/money/*`.

**Architecture:** New route group under the existing protected dashboard. The sidebar controller gets a dark variant for money routes. All money pages are client components using hardcoded sample data. Reuses the existing app shell but overrides content styling to dark.

**Tech Stack:** Next.js 16 App Router, Tailwind CSS v4, React 19, Framer Motion (existing), Recharts (existing for donut chart)

---

### Task 1: Sample Data & Types

**Files:**
- Create: `components/money/sample-data.ts`

**Step 1: Create types and sample data**

Create the file with all TypeScript types and hardcoded data that every other component will consume.

```typescript
// === TYPES ===

export type SpendingCategory =
  | 'housing' | 'dining' | 'shopping' | 'transport'
  | 'travel' | 'entertainment' | 'utilities' | 'subscriptions'

export type SubscriptionCategory = 'entertainment' | 'utilities' | 'software'

export interface Transaction {
  id: string
  merchant: string
  amount: number
  date: string
  category: SpendingCategory
  subcategory: string
  isRecurring: boolean
}

export interface Subscription {
  id: string
  name: string
  plan: string
  cost: number
  frequency: 'monthly' | 'yearly'
  category: SubscriptionCategory
  nextBillDate: string
  icon: string      // emoji or letter
  color: string     // tailwind color class for progress bar
  isActive: boolean
  startDate: string // for billing cycle calculation
}

export interface CategorySpending {
  category: SpendingCategory
  amount: number
  percentage: number
  transactionCount: number
  icon: string
  color: string     // bg color for treemap block
}

export interface MonthlySpending {
  month: string
  totalSpend: number
  changePercent: number
  highestCategory: SpendingCategory
  highestCategoryPercent: number
  categories: CategorySpending[]
}

export interface SavingsInsight {
  id: string
  type: 'duplicate' | 'price_hike' | 'unused'
  title: string
  description: string
  savingsAmount?: number
  icon: string
}

// === SAMPLE DATA ===

export const CATEGORY_CONFIG: Record<SpendingCategory, { icon: string; label: string; color: string }> = {
  housing:        { icon: '🏠', label: 'Housing',        color: 'bg-teal-900/60' },
  dining:         { icon: '🍴', label: 'Dining',         color: 'bg-purple-900/60' },
  shopping:       { icon: '🛍️', label: 'Shopping',       color: 'bg-pink-900/60' },
  transport:      { icon: '🚗', label: 'Transport',      color: 'bg-amber-900/60' },
  travel:         { icon: '✈️', label: 'Travel',         color: 'bg-blue-900/60' },
  entertainment:  { icon: '🎬', label: 'Entertainment',  color: 'bg-indigo-900/60' },
  utilities:      { icon: '⚡', label: 'Utilities',      color: 'bg-green-900/60' },
  subscriptions:  { icon: '💳', label: 'Subscriptions',  color: 'bg-slate-800/60' },
}

export const sampleMonthlySpending: MonthlySpending = {
  month: 'October 2023',
  totalSpend: 12450.00,
  changePercent: 15,
  highestCategory: 'housing',
  highestCategoryPercent: 35,
  categories: [
    { category: 'housing',       amount: 4200, percentage: 35, transactionCount: 2,  icon: '🏠', color: 'bg-teal-900/60' },
    { category: 'dining',        amount: 1800, percentage: 15, transactionCount: 8,  icon: '🍴', color: 'bg-purple-900/60' },
    { category: 'travel',        amount: 1500, percentage: 12, transactionCount: 3,  icon: '✈️', color: 'bg-blue-900/60' },
    { category: 'shopping',      amount: 950,  percentage: 8,  transactionCount: 5,  icon: '🛍️', color: 'bg-pink-900/60' },
    { category: 'transport',     amount: 720,  percentage: 6,  transactionCount: 12, icon: '🚗', color: 'bg-amber-900/60' },
    { category: 'entertainment', amount: 680,  percentage: 5,  transactionCount: 4,  icon: '🎬', color: 'bg-indigo-900/60' },
    { category: 'utilities',     amount: 450,  percentage: 4,  transactionCount: 3,  icon: '⚡', color: 'bg-green-900/60' },
    { category: 'subscriptions', amount: 200,  percentage: 2,  transactionCount: 6,  icon: '💳', color: 'bg-slate-800/60' },
  ],
}

export const sampleTransactions: Transaction[] = [
  { id: '1',  merchant: 'Luxury Rentals LLC', amount: 3800,  date: 'Oct 1, 2023',  category: 'housing',       subcategory: 'Rent',        isRecurring: true },
  { id: '2',  merchant: 'TaskRabbit Inc.',    amount: 250,   date: 'Oct 15, 2023', category: 'housing',       subcategory: 'Maintenance',  isRecurring: false },
  { id: '3',  merchant: 'Home Depot',         amount: 150,   date: 'Oct 20, 2023', category: 'housing',       subcategory: 'Supplies',     isRecurring: false },
  { id: '4',  merchant: 'Uber',               amount: 45.20, date: 'Oct 28, 2023', category: 'transport',     subcategory: 'Transport',    isRecurring: false },
  { id: '5',  merchant: 'Nobu',               amount: 420,   date: 'Oct 26, 2023', category: 'dining',        subcategory: 'Dining',       isRecurring: false },
  { id: '6',  merchant: 'Delta Airlines',     amount: 850,   date: 'Oct 10, 2023', category: 'travel',        subcategory: 'Flights',      isRecurring: false },
  { id: '7',  merchant: 'Zara',               amount: 320,   date: 'Oct 12, 2023', category: 'shopping',      subcategory: 'Clothing',     isRecurring: false },
  { id: '8',  merchant: 'AMC Theatres',       amount: 45,    date: 'Oct 18, 2023', category: 'entertainment', subcategory: 'Movies',       isRecurring: false },
  { id: '9',  merchant: 'ConEdison',          amount: 180,   date: 'Oct 5, 2023',  category: 'utilities',     subcategory: 'Electricity',  isRecurring: true },
  { id: '10', merchant: 'Verizon',            amount: 85,    date: 'Oct 3, 2023',  category: 'utilities',     subcategory: 'Internet',     isRecurring: true },
]

export const sampleSubscriptions: Subscription[] = [
  { id: '1', name: 'Netflix',    plan: 'Premium 4K Plan',  cost: 19.99, frequency: 'monthly', category: 'entertainment', nextBillDate: 'Oct 24, 2023', icon: 'N',   color: 'bg-red-500',    isActive: true,  startDate: '2023-09-24' },
  { id: '2', name: 'Spotify',    plan: 'Duo Plan',         cost: 14.99, frequency: 'monthly', category: 'entertainment', nextBillDate: 'Nov 02, 2023', icon: 'S',   color: 'bg-blue-500',   isActive: true,  startDate: '2023-10-02' },
  { id: '3', name: 'Adobe CC',   plan: 'All Apps',         cost: 54.99, frequency: 'monthly', category: 'software',      nextBillDate: 'Nov 05, 2023', icon: 'A',   color: 'bg-amber-500',  isActive: true,  startDate: '2023-10-05' },
  { id: '4', name: 'Figma',      plan: 'Professional',     cost: 12.00, frequency: 'monthly', category: 'software',      nextBillDate: 'Nov 15, 2023', icon: 'F',   color: 'bg-blue-400',   isActive: true,  startDate: '2023-10-15' },
  { id: '5', name: 'AWS',        plan: 'Infrastructure',   cost: 85.43, frequency: 'monthly', category: 'software',      nextBillDate: 'Nov 01, 2023', icon: 'AWS', color: 'bg-blue-600',   isActive: true,  startDate: '2023-10-01' },
  { id: '6', name: 'X Premium',  plan: 'Social Media',     cost: 8.00,  frequency: 'monthly', category: 'entertainment', nextBillDate: 'Nov 01, 2023', icon: 'X',   color: 'bg-gray-500',   isActive: true,  startDate: '2023-10-01' },
  { id: '7', name: 'Equinox',    plan: 'Health & Fitness', cost: 245,   frequency: 'monthly', category: 'utilities',     nextBillDate: 'Nov 10, 2023', icon: 'E',   color: 'bg-purple-500', isActive: true,  startDate: '2023-10-10' },
]

export const sampleSavingsInsights: SavingsInsight[] = [
  { id: '1', type: 'duplicate',  title: 'Duplicate Detected',     description: 'You have active subscriptions for both Spotify and Apple Music.',        savingsAmount: 10.99, icon: '📋' },
  { id: '2', type: 'price_hike', title: 'Price Hike Alert',       description: 'Your Comcast Internet bill increased by 15% this month.',                               icon: '📈' },
  { id: '3', type: 'unused',     title: 'Unused Subscription',    description: "You haven't opened Adobe Creative Cloud in 21 days.",                    savingsAmount: 54.99, icon: '⏰' },
]
```

**Step 2: Verify file compiles**

Run: `cd "/Users/furkanceliker/Celiker Studio/Carve/carve.wiki" && npx tsc --noEmit --strict components/money/sample-data.ts 2>&1 | head -20`

**Step 3: Commit**

```bash
git add components/money/sample-data.ts
git commit -m "feat(money): add sample data and types for Carve Money dashboard"
```

---

### Task 2: Shared UI Primitives

**Files:**
- Create: `components/money/shared/MoneyCard.tsx`
- Create: `components/money/shared/ChangeBadge.tsx`
- Create: `components/money/shared/CategoryIcon.tsx`
- Create: `components/money/shared/MoneyProgressBar.tsx`
- Create: `components/money/shared/index.ts`

**Step 1: Create MoneyCard**

Dark card wrapper matching the screenshot aesthetic. Similar to existing `DarkCard` but with money-specific styling.

```typescript
// components/money/shared/MoneyCard.tsx
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface MoneyCardProps {
  children: ReactNode
  className?: string
}

export function MoneyCard({ children, className }: MoneyCardProps) {
  return (
    <div className={cn(
      "rounded-xl border border-[#1a1f2e] bg-[#0f1420] p-5",
      className
    )}>
      {children}
    </div>
  )
}
```

**Step 2: Create ChangeBadge**

The `+15%` / `-2.4%` badge used across all pages.

```typescript
// components/money/shared/ChangeBadge.tsx
import { cn } from "@/lib/utils"

interface ChangeBadgeProps {
  value: number  // percentage, positive or negative
  className?: string
}

export function ChangeBadge({ value, className }: ChangeBadgeProps) {
  const isPositive = value >= 0
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
      isPositive
        ? "bg-green-500/10 text-green-400"
        : "bg-red-500/10 text-red-400",
      className
    )}>
      <span>{isPositive ? '↑' : '↓'}</span>
      {Math.abs(value).toFixed(1)}%
    </span>
  )
}
```

**Step 3: Create CategoryIcon**

Circular icon with category-specific background color.

```typescript
// components/money/shared/CategoryIcon.tsx
import { cn } from "@/lib/utils"
import { CATEGORY_CONFIG, type SpendingCategory } from "../sample-data"

interface CategoryIconProps {
  category: SpendingCategory
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function CategoryIcon({ category, size = 'md', className }: CategoryIconProps) {
  const config = CATEGORY_CONFIG[category]
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  }

  return (
    <div className={cn(
      "flex items-center justify-center rounded-lg",
      config.color,
      sizeClasses[size],
      className
    )}>
      {config.icon}
    </div>
  )
}
```

**Step 4: Create MoneyProgressBar**

```typescript
// components/money/shared/MoneyProgressBar.tsx
import { cn } from "@/lib/utils"

interface MoneyProgressBarProps {
  progress: number // 0-100
  color?: string   // tailwind bg class
  className?: string
}

export function MoneyProgressBar({ progress, color = 'bg-blue-500', className }: MoneyProgressBarProps) {
  return (
    <div className={cn("h-1 w-full rounded-full bg-white/10", className)}>
      <div
        className={cn("h-full rounded-full transition-all", color)}
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  )
}
```

**Step 5: Create barrel export**

```typescript
// components/money/shared/index.ts
export { MoneyCard } from './MoneyCard'
export { ChangeBadge } from './ChangeBadge'
export { CategoryIcon } from './CategoryIcon'
export { MoneyProgressBar } from './MoneyProgressBar'
```

**Step 6: Commit**

```bash
git add components/money/shared/
git commit -m "feat(money): add shared UI primitives (MoneyCard, ChangeBadge, CategoryIcon, ProgressBar)"
```

---

### Task 3: Navigation & Sidebar Integration

**Files:**
- Create: `lib/navigation/money-navigation.ts`
- Modify: `components/icons/sidebar-icons.tsx` — add WalletIcon, ReceiptIcon, CreditCardIcon, PieChartIcon, LightbulbIcon
- Modify: `components/app/app-sidebar-controller.tsx` — add money route detection + dark variant
- Modify: `components/app/layout-wrapper.tsx` — add money to edge-to-edge routes

**Step 1: Create money navigation config**

Follow exact pattern from `lib/navigation/dashboard-navigation.ts`:

```typescript
// lib/navigation/money-navigation.ts
export const moneyNavigationGroups = [
  {
    label: 'CARVE MONEY',
    icon: { name: 'WalletIcon' },
    items: [
      {
        title: "Dashboard",
        href: "/dashboard/money",
        icon: { name: 'DashboardIcon' },
        description: "Money overview"
      },
      {
        title: "Analytics",
        href: "/dashboard/money/analytics",
        icon: { name: 'ChartIcon' },
        description: "Spending breakdown"
      },
      {
        title: "Subscriptions",
        href: "/dashboard/money/subscriptions",
        icon: { name: 'CreditCardIcon' },
        description: "Manage subscriptions"
      },
      {
        title: "Transactions",
        href: "/dashboard/money/transactions",
        icon: { name: 'ReceiptIcon' },
        description: "Transaction history"
      },
    ]
  },
  {
    label: 'MANAGE',
    icon: { name: 'SettingsIcon' },
    items: [
      {
        title: "Budgeting",
        href: "/dashboard/money/budgeting",
        icon: { name: 'PieChartIcon' },
        description: "Budget management"
      },
      {
        title: "Insights",
        href: "/dashboard/money/insights",
        icon: { name: 'LightbulbIcon' },
        description: "Savings insights"
      },
      {
        title: "Settings",
        href: "/dashboard/money/settings",
        icon: { name: 'SettingsIcon' },
        description: "Money settings"
      }
    ]
  }
]
```

**Step 2: Add new icons to sidebar-icons.tsx**

Add these icons to `components/icons/sidebar-icons.tsx` and register them in `iconMap`:

- `WalletIcon` — wallet/purse icon
- `ReceiptIcon` — receipt/document icon
- `CreditCardIcon` — credit card icon
- `PieChartIcon` — pie chart icon
- `LightbulbIcon` — lightbulb icon

**Step 3: Update sidebar controller for money routes**

In `components/app/app-sidebar-controller.tsx`:

1. Import `moneyNavigationGroups` from `@/lib/navigation/money-navigation`
2. In `getSidebarGroups()`, add money detection BEFORE the generic dashboard check:
   ```typescript
   if (path.startsWith('/dashboard/money')) {
     return moneyNavigationGroups as NavigationGroup[];
   }
   ```
3. Add dark variant detection:
   ```typescript
   const isMoneyRoute = stripLocale(pathname).startsWith('/dashboard/money');
   ```
4. Swap color classes based on `isMoneyRoute`:
   - Wrapper: `bg-[#ececf1]` → `bg-[#0c1017]`
   - Active item: `bg-white text-gray-900` → `bg-blue-500/10 text-blue-400 border-l-2 border-blue-500`
   - Inactive: `text-gray-600` → `text-slate-400`
   - Hover: `hover:bg-gray-300/70` → `hover:bg-white/5`
   - Group divider: `bg-gray-300` → `bg-slate-700`
   - Group label: `text-gray-500` → `text-slate-500`

**Step 4: Update layout-wrapper for money routes**

In `components/app/layout-wrapper.tsx`, add `/dashboard/money` to edge-to-edge detection:

```typescript
const isEdgeToEdgeRoute =
  pathname === '/' ||
  pathname?.includes('/wiki') ||
  pathname?.includes('/admin') ||
  pathname?.includes('/carve') ||
  pathname?.includes('/dashboard/money')
```

**Step 5: Verify app builds**

Run: `cd "/Users/furkanceliker/Celiker Studio/Carve/carve.wiki" && npx next build 2>&1 | tail -30`

**Step 6: Commit**

```bash
git add lib/navigation/money-navigation.ts components/icons/sidebar-icons.tsx components/app/app-sidebar-controller.tsx components/app/layout-wrapper.tsx
git commit -m "feat(money): add money navigation, sidebar icons, and dark sidebar variant"
```

---

### Task 4: Money Layout & Dashboard Page

**Files:**
- Create: `app/[locale]/(protected)/dashboard/money/layout.tsx`
- Create: `app/[locale]/(protected)/dashboard/money/page.tsx`

**Step 1: Create money layout**

Provides the dark background wrapper for all money routes:

```typescript
// app/[locale]/(protected)/dashboard/money/layout.tsx
export default function MoneyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full bg-[#0a0e1a] overflow-y-auto">
      {children}
    </div>
  )
}
```

**Step 2: Create money dashboard page**

The overview/landing page for Carve Money. Shows key stats and quick access to all sections. This is a placeholder that we'll iterate on — the main focus pages are Analytics and Subscriptions.

```typescript
// app/[locale]/(protected)/dashboard/money/page.tsx
'use client'

import { MoneyCard, ChangeBadge } from '@/components/money/shared'
import { sampleMonthlySpending, sampleSubscriptions, CATEGORY_CONFIG } from '@/components/money/sample-data'
import Link from 'next/link'

export default function MoneyDashboardPage() {
  const totalSubscriptions = sampleSubscriptions.reduce((sum, s) => sum + s.cost, 0)

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Carve Money</h1>
        <p className="text-slate-400 mt-1">Your financial overview</p>
      </div>

      {/* Top stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MoneyCard>
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Total Spend This Month</p>
          <p className="text-3xl font-bold text-white">${sampleMonthlySpending.totalSpend.toLocaleString()}</p>
          <ChangeBadge value={sampleMonthlySpending.changePercent} className="mt-2" />
        </MoneyCard>
        <MoneyCard>
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Monthly Subscriptions</p>
          <p className="text-3xl font-bold text-white">${totalSubscriptions.toFixed(2)}</p>
          <p className="text-slate-500 text-sm mt-2">{sampleSubscriptions.length} active</p>
        </MoneyCard>
        <MoneyCard>
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Top Category</p>
          <p className="text-3xl font-bold text-white">{CATEGORY_CONFIG[sampleMonthlySpending.highestCategory].label}</p>
          <p className="text-slate-500 text-sm mt-2">{sampleMonthlySpending.highestCategoryPercent}% of spending</p>
        </MoneyCard>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/dashboard/money/analytics">
          <MoneyCard className="hover:border-blue-500/30 transition-colors cursor-pointer">
            <h3 className="text-lg font-semibold text-white">Analytics</h3>
            <p className="text-slate-400 text-sm mt-1">View spending breakdown by category</p>
          </MoneyCard>
        </Link>
        <Link href="/dashboard/money/subscriptions">
          <MoneyCard className="hover:border-blue-500/30 transition-colors cursor-pointer">
            <h3 className="text-lg font-semibold text-white">Subscriptions</h3>
            <p className="text-slate-400 text-sm mt-1">Manage recurring payments and services</p>
          </MoneyCard>
        </Link>
      </div>
    </div>
  )
}
```

**Step 3: Verify the page renders**

Run: `cd "/Users/furkanceliker/Celiker Studio/Carve/carve.wiki" && npx next build 2>&1 | tail -20`

Navigate to `http://localhost:3000/dashboard/money` to visually verify.

**Step 4: Commit**

```bash
git add app/\[locale\]/\(protected\)/dashboard/money/
git commit -m "feat(money): add money layout and dashboard overview page"
```

---

### Task 5: Analytics Page — Spending Breakdown (Screenshot 1)

**Files:**
- Create: `components/money/widgets/SpendingTreeMap.tsx`
- Create: `components/money/widgets/TransactionsList.tsx`
- Create: `components/money/widgets/MonthSelector.tsx`
- Create: `app/[locale]/(protected)/dashboard/money/analytics/page.tsx`

**Step 1: Create MonthSelector**

Month navigation pills (Sep / **Oct** / Nov):

```typescript
// components/money/widgets/MonthSelector.tsx
'use client'

import { cn } from '@/lib/utils'

interface MonthSelectorProps {
  months: string[]
  selected: string
  onSelect: (month: string) => void
}

export function MonthSelector({ months, selected, onSelect }: MonthSelectorProps) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-white/5 p-1">
      {months.map((month) => (
        <button
          key={month}
          onClick={() => onSelect(month)}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
            selected === month
              ? "bg-blue-500 text-white"
              : "text-slate-400 hover:text-white"
          )}
        >
          {month}
        </button>
      ))}
    </div>
  )
}
```

**Step 2: Create SpendingTreeMap**

CSS Grid-based treemap matching Screenshot 1. Each category block is sized proportionally using `grid-row-end: span N` based on percentage. The treemap uses a fixed grid layout to match the screenshot's visual structure.

```typescript
// components/money/widgets/SpendingTreeMap.tsx
'use client'

import { cn } from '@/lib/utils'
import type { CategorySpending } from '../sample-data'

interface SpendingTreeMapProps {
  categories: CategorySpending[]
}

export function SpendingTreeMap({ categories }: SpendingTreeMapProps) {
  // Sort by amount descending
  const sorted = [...categories].sort((a, b) => b.amount - a.amount)

  return (
    <div className="rounded-xl border border-[#1a1f2e] bg-[#0f1420] p-4 h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-medium text-slate-400 border border-[#1a1f2e] rounded px-2 py-0.5">
          TreeMap View
        </span>
      </div>

      {/* TreeMap Grid */}
      <div className="grid grid-cols-3 grid-rows-4 gap-2 h-[calc(100%-40px)]">
        {sorted.map((cat, i) => {
          // Determine grid span based on category size
          const spans = getSpan(i, sorted.length)
          return (
            <div
              key={cat.category}
              className={cn(
                "rounded-lg p-3 flex flex-col justify-between relative overflow-hidden",
                cat.color,
                "border border-white/5",
                spans
              )}
            >
              <div className="flex items-start justify-between">
                <span className="text-lg">{cat.icon}</span>
                <span className="text-xs font-medium text-white/60">{cat.percentage}%</span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">{getCategoryLabel(cat.category)}</p>
                <p className="text-white/70 text-sm">${cat.amount.toLocaleString()}</p>
                {cat.transactionCount > 1 && (
                  <p className="text-white/40 text-xs">{cat.transactionCount} transactions</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function getCategoryLabel(cat: string): string {
  return cat.charAt(0).toUpperCase() + cat.slice(1)
}

function getSpan(index: number, total: number): string {
  // First item (largest): spans 2 rows, 1 col
  if (index === 0) return 'row-span-2'
  // Second item: spans 1 row, 1 col (but taller layout area)
  if (index === 1) return 'row-span-2 col-start-2'
  // Third: normal
  if (index === 2) return 'col-start-3'
  // Rest: fill in
  return ''
}
```

**Step 3: Create TransactionsList**

Filterable transaction list for the right panel:

```typescript
// components/money/widgets/TransactionsList.tsx
'use client'

import { cn } from '@/lib/utils'
import type { Transaction, SpendingCategory } from '../sample-data'
import { CategoryIcon } from '../shared'

interface TransactionsListProps {
  transactions: Transaction[]
  filterCategory?: SpendingCategory
  title?: string
}

export function TransactionsList({ transactions, filterCategory, title }: TransactionsListProps) {
  const filtered = filterCategory
    ? transactions.filter(t => t.category === filterCategory)
    : transactions

  const categoryTransactions = filterCategory
    ? filtered
    : []
  const otherTransactions = filterCategory
    ? transactions.filter(t => t.category !== filterCategory).slice(0, 3)
    : transactions

  return (
    <div className="rounded-xl border border-[#1a1f2e] bg-[#0f1420] p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Transactions</h3>
          {filterCategory && (
            <p className="text-slate-500 text-sm capitalize">{filterCategory} Category</p>
          )}
        </div>
        <button className="text-slate-500 hover:text-slate-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </button>
      </div>

      {/* Transaction list */}
      <div className="flex-1 space-y-1 overflow-y-auto">
        {categoryTransactions.map((tx) => (
          <TransactionRow key={tx.id} transaction={tx} />
        ))}

        {otherTransactions.length > 0 && (
          <>
            <p className="text-xs uppercase tracking-wider text-slate-500 pt-3 pb-1">Other Recent</p>
            {otherTransactions.map((tx) => (
              <TransactionRow key={tx.id} transaction={tx} />
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      <button className="mt-4 w-full rounded-lg border border-[#1a1f2e] py-2.5 text-sm text-slate-400 hover:text-white hover:border-slate-600 transition-colors">
        View All Transactions
      </button>
    </div>
  )
}

function TransactionRow({ transaction: tx }: { transaction: Transaction }) {
  return (
    <div className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-white/5">
      <CategoryIcon category={tx.category} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{tx.merchant}</p>
        <p className="text-xs text-slate-500">{tx.date} &middot; {tx.subcategory}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-white">-${tx.amount.toLocaleString()}</p>
        {tx.isRecurring && (
          <span className="text-[10px] border border-slate-600 text-slate-400 rounded px-1.5 py-0.5">Recurring</span>
        )}
      </div>
    </div>
  )
}
```

**Step 4: Create Analytics page**

Combines TreeMap + TransactionsList in the two-column layout from Screenshot 1:

```typescript
// app/[locale]/(protected)/dashboard/money/analytics/page.tsx
'use client'

import { useState } from 'react'
import { SpendingTreeMap } from '@/components/money/widgets/SpendingTreeMap'
import { TransactionsList } from '@/components/money/widgets/TransactionsList'
import { MonthSelector } from '@/components/money/widgets/MonthSelector'
import { ChangeBadge } from '@/components/money/shared'
import { sampleMonthlySpending, sampleTransactions, CATEGORY_CONFIG } from '@/components/money/sample-data'

export default function AnalyticsPage() {
  const [selectedMonth] = useState('Oct')
  const data = sampleMonthlySpending

  return (
    <div className="p-6 h-full flex flex-col max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm text-slate-500 mb-1">Analytics &gt; Spending Breakdown</p>
          <h1 className="text-3xl font-bold text-white">{data.month}</h1>
          <div className="flex items-center gap-4 mt-2">
            <div>
              <p className="text-xs text-slate-500">Total Spend</p>
              <div className="flex items-center gap-2">
                <span className="text-4xl font-bold text-white">${data.totalSpend.toLocaleString()}</span>
                <ChangeBadge value={data.changePercent} />
              </div>
            </div>
            <div className="ml-8">
              <p className="text-xs text-slate-500">Highest Category</p>
              <p className="text-xl font-semibold text-white">
                {CATEGORY_CONFIG[data.highestCategory].label}{' '}
                <span className="text-slate-400 text-base">{data.highestCategoryPercent}%</span>
              </p>
            </div>
          </div>
        </div>
        <MonthSelector months={['Sep', 'Oct', 'Nov']} selected={selectedMonth} onSelect={() => {}} />
      </div>

      {/* Two-column layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4 min-h-0">
        <SpendingTreeMap categories={data.categories} />
        <TransactionsList transactions={sampleTransactions} filterCategory="housing" />
      </div>
    </div>
  )
}
```

**Step 5: Verify page renders**

Run dev server and navigate to `/dashboard/money/analytics`

**Step 6: Commit**

```bash
git add components/money/widgets/SpendingTreeMap.tsx components/money/widgets/TransactionsList.tsx components/money/widgets/MonthSelector.tsx app/\[locale\]/\(protected\)/dashboard/money/analytics/
git commit -m "feat(money): add analytics page with spending treemap and transaction list"
```

---

### Task 6: Subscriptions Page — Grid View (Screenshot 2)

**Files:**
- Create: `components/money/widgets/SubscriptionCard.tsx`
- Create: `components/money/widgets/SubscriptionGrid.tsx`
- Create: `app/[locale]/(protected)/dashboard/money/subscriptions/page.tsx`

**Step 1: Create SubscriptionCard**

Individual subscription card matching Screenshot 2:

```typescript
// components/money/widgets/SubscriptionCard.tsx
'use client'

import { cn } from '@/lib/utils'
import { MoneyProgressBar } from '../shared'
import type { Subscription } from '../sample-data'

interface SubscriptionCardProps {
  subscription: Subscription
  onCancel?: (id: string) => void
}

export function SubscriptionCard({ subscription: sub }: SubscriptionCardProps) {
  // Calculate billing cycle progress (mock: days since startDate vs 30 days)
  const start = new Date(sub.startDate).getTime()
  const now = new Date('2023-10-22').getTime() // mock "today"
  const cycleDays = 30
  const daysPassed = Math.floor((now - start) / (1000 * 60 * 60 * 24)) % cycleDays
  const progress = (daysPassed / cycleDays) * 100

  // Calculate urgency
  const daysUntilBill = Math.max(0, Math.floor((new Date(sub.nextBillDate).getTime() - now) / (1000 * 60 * 60 * 24)))
  const urgencyBadge = daysUntilBill <= 1
    ? { text: 'Due Tomorrow', className: 'bg-red-500/10 text-red-400 border-red-500/20' }
    : daysUntilBill <= 14
    ? { text: `${daysUntilBill} days left`, className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' }
    : null

  return (
    <div className="rounded-xl border border-[#1a1f2e] bg-[#0f1420] p-5 flex flex-col">
      {/* Header: icon + name */}
      <div className="flex items-start gap-3 mb-4">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white",
          sub.color
        )}>
          {sub.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-white">{sub.name}</p>
          <p className="text-xs text-slate-500">{sub.plan}</p>
        </div>
      </div>

      {/* Cost + date */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-0.5">Cost</p>
          <p className="text-2xl font-bold text-white">
            ${sub.cost.toFixed(2)}
            <span className="text-sm font-normal text-slate-500">/mo</span>
          </p>
        </div>
        <div className="text-right">
          {urgencyBadge ? (
            <span className={cn("text-xs border rounded px-2 py-0.5", urgencyBadge.className)}>
              {urgencyBadge.text}
            </span>
          ) : (
            <>
              <p className="text-xs text-slate-500">Next Bill</p>
              <p className="text-sm text-slate-300">{sub.nextBillDate.replace(', 2023', '')}</p>
            </>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <MoneyProgressBar progress={progress} color={sub.color} />
    </div>
  )
}

// "Add Subscription" placeholder card
export function AddSubscriptionCard() {
  return (
    <button className="rounded-xl border border-dashed border-[#1a1f2e] bg-transparent p-5 flex flex-col items-center justify-center gap-2 hover:border-slate-600 transition-colors min-h-[180px]">
      <div className="w-10 h-10 rounded-full border border-[#1a1f2e] flex items-center justify-center">
        <span className="text-xl text-slate-500">+</span>
      </div>
      <p className="text-sm font-medium text-slate-400">Add Subscription</p>
      <p className="text-xs text-slate-600">Track a new recurring expense</p>
    </button>
  )
}
```

**Step 2: Create SubscriptionGrid**

Grid layout with filter tabs:

```typescript
// components/money/widgets/SubscriptionGrid.tsx
'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { SubscriptionCard, AddSubscriptionCard } from './SubscriptionCard'
import type { Subscription, SubscriptionCategory } from '../sample-data'

interface SubscriptionGridProps {
  subscriptions: Subscription[]
}

const FILTER_TABS: { label: string; value: SubscriptionCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Entertainment', value: 'entertainment' },
  { label: 'Utilities', value: 'utilities' },
  { label: 'Software', value: 'software' },
]

export function SubscriptionGrid({ subscriptions }: SubscriptionGridProps) {
  const [filter, setFilter] = useState<SubscriptionCategory | 'all'>('all')
  const [search, setSearch] = useState('')

  const filtered = subscriptions.filter(s => {
    if (filter !== 'all' && s.category !== filter) return false
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div>
      {/* Filters row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1 rounded-full bg-white/5 p-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                filter === tab.value
                  ? "bg-blue-500 text-white"
                  : "text-slate-400 hover:text-white"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search subscriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white/5 border border-[#1a1f2e] rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 w-56"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((sub) => (
          <SubscriptionCard key={sub.id} subscription={sub} />
        ))}
        <AddSubscriptionCard />
      </div>
    </div>
  )
}
```

**Step 3: Create Subscriptions page**

```typescript
// app/[locale]/(protected)/dashboard/money/subscriptions/page.tsx
'use client'

import { useState } from 'react'
import { SubscriptionGrid } from '@/components/money/widgets/SubscriptionGrid'
import { ChangeBadge } from '@/components/money/shared'
import { sampleSubscriptions } from '@/components/money/sample-data'

export default function SubscriptionsPage() {
  const totalMonthly = sampleSubscriptions.reduce((sum, s) => sum + s.cost, 0)
  const yearlyForecast = totalMonthly * 12
  const avgCost = totalMonthly / sampleSubscriptions.length

  return (
    <div className="p-6 h-full overflow-y-auto max-w-7xl mx-auto">
      {/* Hero stats */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Total Monthly Recurring</p>
          <div className="flex items-center gap-3">
            <span className="text-4xl font-bold text-white">${totalMonthly.toFixed(2)}</span>
            <ChangeBadge value={3.5} />
          </div>
          <p className="text-sm text-slate-500 mt-1">Across {sampleSubscriptions.length} active subscriptions</p>
        </div>

        <div className="flex gap-3">
          <div className="rounded-xl border border-[#1a1f2e] bg-[#0f1420] px-5 py-3 text-center">
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-0.5">Yearly Forecast</p>
            <p className="text-xl font-bold text-white">${yearlyForecast.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-[#1a1f2e] bg-[#0f1420] px-5 py-3 text-center">
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-0.5">Avg. Cost</p>
            <p className="text-xl font-bold text-white">${avgCost.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Subscription grid */}
      <SubscriptionGrid subscriptions={sampleSubscriptions} />
    </div>
  )
}
```

**Step 4: Verify and commit**

```bash
git add components/money/widgets/SubscriptionCard.tsx components/money/widgets/SubscriptionGrid.tsx app/\[locale\]/\(protected\)/dashboard/money/subscriptions/
git commit -m "feat(money): add subscriptions page with grid view and filter tabs"
```

---

### Task 7: Subscriptions Timeline View (Screenshot 3)

**Files:**
- Create: `components/money/widgets/SubscriptionTimeline.tsx`
- Create: `components/money/widgets/PotentialSavings.tsx`

These will be integrated into the subscriptions page as an alternate view tab.

**Step 1: Create SubscriptionTimeline**

Horizontal scrollable timeline with subscription cards positioned by date:

The component renders a horizontal timeline with date markers (Oct 01 through Oct 31) and positions subscription cards at their due dates. Cards show logo, name, category, amount, and status (PAID / DUE SOON / UPCOMING).

**Step 2: Create PotentialSavings**

Row of insight cards showing savings opportunities. Each card has icon, title, description, and optional savings amount in green.

**Step 3: Add view toggle to subscriptions page**

Add state for `view: 'grid' | 'timeline'` with toggle buttons in the header. Render either `SubscriptionGrid` or `SubscriptionTimeline` + `PotentialSavings` based on active view.

**Step 4: Commit**

```bash
git add components/money/widgets/SubscriptionTimeline.tsx components/money/widgets/PotentialSavings.tsx app/\[locale\]/\(protected\)/dashboard/money/subscriptions/
git commit -m "feat(money): add subscription timeline view and potential savings insights"
```

---

### Task 8: Subscriptions Management View (Screenshot 4)

**Files:**
- Create: `components/money/widgets/SubscriptionTable.tsx`
- Create: `components/money/widgets/MonthlyOutlook.tsx`
- Create: `components/money/CancelSubscriptionModal.tsx`

**Step 1: Create SubscriptionTable**

Full table view with columns: Service (icon + name + plan), Category (colored badge), Frequency, Amount, Status toggle.

**Step 2: Create MonthlyOutlook**

Right panel with:
- Donut chart using `recharts` `PieChart` (already in deps) showing category breakdown
- Total amount in center of donut
- Category legend with color dots and amounts
- "INSIGHT" card with contextual tip
- "Download Report" button

**Step 3: Create CancelSubscriptionModal**

Modal dialog matching Screenshot 4:
- Warning icon
- "Cancel [Name] Subscription?" title
- Description text with billing cycle end date
- Service preview card (icon + name + cost)
- "Keep Subscription" + "Confirm Cancellation" buttons

**Step 4: Add 'manage' view to subscriptions page**

Extend view toggle to include 'manage' option. Render two-column layout: SubscriptionTable left, MonthlyOutlook right.

**Step 5: Commit**

```bash
git add components/money/widgets/SubscriptionTable.tsx components/money/widgets/MonthlyOutlook.tsx components/money/CancelSubscriptionModal.tsx app/\[locale\]/\(protected\)/dashboard/money/subscriptions/
git commit -m "feat(money): add subscription management view with table, donut chart, and cancel modal"
```

---

### Task 9: Transactions Page

**Files:**
- Create: `app/[locale]/(protected)/dashboard/money/transactions/page.tsx`

**Step 1: Create full transactions page**

Full page showing all transactions with:
- Search bar + category filter tabs
- Sortable columns (Date, Merchant, Category, Amount)
- Reuses `TransactionsList` component in a full-width layout
- Month filter in header

**Step 2: Commit**

```bash
git add app/\[locale\]/\(protected\)/dashboard/money/transactions/
git commit -m "feat(money): add full transactions page with search and filters"
```

---

### Task 10: Visual Polish & Integration Testing

**Step 1: Run build**

Run: `cd "/Users/furkanceliker/Celiker Studio/Carve/carve.wiki" && npx next build`

Fix any build errors.

**Step 2: Visual review**

Navigate through all pages and verify:
- Sidebar dark styling activates on `/dashboard/money/*`
- Sidebar reverts to light on `/dashboard` (fitness)
- All cards match the dark aesthetic from screenshots
- TreeMap layout looks proportional
- Subscription cards have correct progress bars
- Timeline scrolls horizontally
- Cancel modal opens/closes

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat(money): complete Carve Money dashboard MVP with all views"
```
