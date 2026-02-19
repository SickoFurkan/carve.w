"use client"

import Link from "next/link"
import { MoneyCard, ChangeBadge } from "@/components/money/shared"
import {
  sampleMonthlySpending,
  sampleSubscriptions,
  CATEGORY_CONFIG,
} from "@/components/money/sample-data"
import { SubscriptionTimeline } from "@/components/money/widgets/SubscriptionTimeline"

export default function MoneyPage() {
  const { totalSpend, changePercent, highestCategory, highestCategoryPercent } =
    sampleMonthlySpending

  const activeSubscriptions = sampleSubscriptions.filter((s) => s.isActive)
  const monthlySubscriptionTotal = activeSubscriptions.reduce(
    (sum, s) => sum + s.cost,
    0
  )

  const topCategoryLabel = CATEGORY_CONFIG[highestCategory].label

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Carve Money
        </h1>
        <p className="text-[#9da6b9] mt-1">Your financial overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MoneyCard>
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">
            Total Spend This Month
          </p>
          <p className="text-3xl font-bold text-white tracking-tight">
            ${totalSpend.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <ChangeBadge value={changePercent} className="mt-2" />
        </MoneyCard>

        <MoneyCard>
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">
            Monthly Subscriptions
          </p>
          <p className="text-3xl font-bold text-white tracking-tight">
            $
            {monthlySubscriptionTotal.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </p>
          <p className="text-[#9da6b9] text-sm mt-2">
            {activeSubscriptions.length} active
          </p>
        </MoneyCard>

        <MoneyCard>
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">
            Top Category
          </p>
          <p className="text-3xl font-bold text-white tracking-tight">
            {topCategoryLabel}
          </p>
          <p className="text-[#9da6b9] text-sm mt-2">
            {highestCategoryPercent}% of spending
          </p>
        </MoneyCard>
      </div>

      {/* Upcoming payments timeline */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Upcoming Payments</h2>
          <Link
            href="/dashboard/money/subscriptions"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            View all
          </Link>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden" style={{ height: '340px' }}>
          <SubscriptionTimeline subscriptions={sampleSubscriptions} />
        </div>
      </div>

      {/* Quick link cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/dashboard/money/analytics">
          <MoneyCard className="hover:border-[#e8e0d4]/30 transition-colors cursor-pointer group">
            <h3 className="text-lg font-semibold text-white group-hover:text-[#e8e0d4] transition-colors">
              Analytics
            </h3>
            <p className="text-[#9da6b9] text-sm mt-1">
              View spending breakdown by category
            </p>
          </MoneyCard>
        </Link>
        <Link href="/dashboard/money/subscriptions">
          <MoneyCard className="hover:border-[#e8e0d4]/30 transition-colors cursor-pointer group">
            <h3 className="text-lg font-semibold text-white group-hover:text-[#e8e0d4] transition-colors">
              Subscriptions
            </h3>
            <p className="text-[#9da6b9] text-sm mt-1">
              Manage and track your recurring payments
            </p>
          </MoneyCard>
        </Link>
      </div>
    </div>
  )
}
