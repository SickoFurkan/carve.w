# Carve Money Dashboard — Design Document

**Date:** 2026-02-17
**Status:** Approved
**Scope:** Frontend-only with sample data. No backend/Supabase integration.

---

## Overview

Carve Money is a financial tracking dashboard within the Carve ecosystem. It lives under the existing authenticated dashboard as a sub-section (`/dashboard/money/*`). The design follows a dark premium aesthetic matching the reference screenshots.

## Design Language

- **Background:** `#0a0e1a` (deep navy)
- **Card background:** `#0f1420` with `border: 1px solid #1a1f2e`
- **Sidebar:** `#0c1017` with blue highlight on active item (`#3b82f6` bg at ~10% opacity, blue left border)
- **Text:** White primary, `#94a3b8` (slate-400) secondary, `#64748b` (slate-500) muted
- **Accent:** Blue `#3b82f6` for interactive elements
- **Positive:** Green `#22c55e` for gains/savings
- **Negative:** Red `#ef4444` for destructive actions, `#f97316` for warnings
- **Cards:** 12-16px border radius, subtle border, no shadow
- **Typography:** Geist Sans (existing), large bold numbers for hero stats

## Routing

```
/dashboard/money/                → Dashboard overview (redirect or main view)
/dashboard/money/analytics       → TreeMap spending breakdown
/dashboard/money/subscriptions   → Subscription management
/dashboard/money/transactions    → Transaction list
/dashboard/money/settings        → Money settings
```

All routes live under the existing `(protected)` route group and inherit auth protection.

## Sidebar Navigation

New `money-sidebar.tsx` detected by `AppSidebarController` on `/dashboard/money/*` paths:

| Icon | Label | Path |
|------|-------|------|
| LayoutDashboard | Dashboard | /dashboard/money |
| TrendingUp | Analytics | /dashboard/money/analytics |
| Wallet | Wallet | /dashboard/money/wallet |
| Receipt | Transactions | /dashboard/money/transactions |
| CreditCard | Subscriptions | /dashboard/money/subscriptions |
| PieChart | Budgeting | /dashboard/money/budgeting |
| Lightbulb | Insights | /dashboard/money/insights |
| Settings | Settings | /dashboard/money/settings |

Bottom of sidebar: User profile card ("Alex Morgan / Pro Member") — reuse existing user data pattern.

## Pages

### 1. Analytics — Spending Breakdown (Screenshot 1)

**Layout:** Two-column. Left ~60%: TreeMap. Right ~40%: Transactions list.

**Header:**
- Breadcrumb: "Analytics > Spending Breakdown"
- Month selector pills (Sep / **Oct** / Nov)
- Hero stats: Total Spend (large), percentage change badge, Highest Category

**TreeMap widget:**
- CSS Grid-based treemap (no heavy library) with category blocks sized by percentage
- Each block: category icon, name, amount, percentage badge
- Color-coded by category (muted tones: teal, purple, blue, pink, amber, etc.)
- "TreeMap View" label/toggle in top-left

**Transactions panel:**
- Category-filtered transaction list
- Each row: icon, merchant name, date + subcategory, amount, optional "Recurring" badge
- "OTHER RECENT" divider for non-category transactions
- "View All Transactions" button at bottom

### 2. Subscriptions — Grid View (Screenshot 2)

**Header:**
- "TOTAL MONTHLY RECURRING" with large dollar amount + change badge
- "Across N active subscriptions" subtitle
- Stats pills: Yearly Forecast, Avg. Cost

**Filters:** Tab pills (All, Entertainment, Utilities, Software) + search bar + filter icons

**Grid:** 3-column grid of subscription cards:
- Service logo/icon + name + plan name
- "COST" label + price/mo
- Due date or "Due Tomorrow" / "12 days left" badge (color-coded urgency)
- Billing cycle progress bar at bottom (colored per service)
- Final card: "+ Add Subscription" placeholder

**Sidebar CTA:** "Save more" insight card + "+ Add New" button

### 3. Subscriptions — Timeline View (Screenshot 3)

**Header:**
- "Timeline" title + Total Projected amount + change vs last month
- Month navigation (< October 2023 >) + Timeline/Calendar toggle
- "+ Add Subscription" blue button

**Timeline:**
- Horizontal scrollable timeline with date markers
- "TODAY" indicator
- Subscription cards positioned on their due dates
- Card shows: logo, name, category, amount, status (PAID / DUE SOON / UPCOMING)

**Bottom section:** "Potential Savings" cards:
- Duplicate Detected, Price Hike Alert, Unused Subscription
- Each with icon, description, potential savings amount in green/red

### 4. Subscriptions — Management View (Screenshot 4)

**Layout:** Two-column. Left ~65%: Table. Right ~35%: Monthly Outlook.

**Header:** "Subscriptions" + subtitle + "+ Add New" button + notification bell

**Table:** Full subscription table with columns (Service, Category badge, Frequency, Amount, Status)

**Monthly Outlook panel:**
- Donut chart with category breakdown (Utilities, Software, Entertainment)
- Total in center
- Category legend with amounts
- "INSIGHT" card with contextual tip
- "Download Report" button

**Cancel Modal:**
- Warning icon + "Cancel [Service] Subscription?" title
- Description with end-of-cycle date
- Service preview card
- "Keep Subscription" (secondary) + "Confirm Cancellation" (red) buttons

## Component Architecture

```
components/money/
├── widgets/
│   ├── SpendingTreeMap.tsx         # CSS Grid treemap
│   ├── TransactionsList.tsx       # Filterable transaction list
│   ├── SubscriptionCard.tsx       # Individual subscription card
│   ├── SubscriptionTimeline.tsx   # Horizontal timeline
│   ├── SubscriptionTable.tsx      # Table view
│   ├── MonthlyOutlook.tsx         # Donut chart + breakdown
│   ├── PotentialSavings.tsx       # Savings insight cards
│   ├── MonthSelector.tsx          # Month navigation pills
│   ├── StatsBar.tsx               # Hero stats row
│   └── shared/
│       ├── MoneyCard.tsx          # Dark card wrapper
│       ├── CategoryIcon.tsx       # Icon per spending category
│       ├── CategoryBadge.tsx      # Colored category label
│       ├── ChangeBadge.tsx        # +/-% change indicator
│       └── ProgressBar.tsx        # Colored progress bar
├── MoneySidebar.tsx               # Sidebar navigation
├── CancelSubscriptionModal.tsx    # Cancel confirmation
├── money-navigation.ts           # Nav config
└── sample-data.ts                 # All hardcoded data
```

## Sample Data Structure

```typescript
// Categories with icons and colors
type SpendingCategory = 'housing' | 'dining' | 'shopping' | 'transport' | 'travel' | 'entertainment' | 'utilities' | 'subscriptions'

// Transactions
interface Transaction {
  id: string
  merchant: string
  amount: number
  date: string
  category: SpendingCategory
  subcategory: string
  isRecurring: boolean
}

// Subscriptions
interface Subscription {
  id: string
  name: string
  plan: string
  cost: number
  frequency: 'monthly' | 'yearly'
  category: 'entertainment' | 'utilities' | 'software'
  nextBillDate: string
  logoIcon: string
  color: string
  isActive: boolean
}

// Monthly spending summary
interface MonthlySpending {
  month: string
  totalSpend: number
  changePercent: number
  highestCategory: SpendingCategory
  categories: { category: SpendingCategory; amount: number; percentage: number; transactionCount: number }[]
}
```

## What's Excluded (For Now)

- No Supabase tables or RPC functions
- No real authentication checks (uses existing protected layout)
- No i18n translations
- No mobile responsiveness (desktop-first)
- No real subscription cancellation logic
- No data persistence
