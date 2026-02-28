"use client"

import { TravelCard } from "@/components/travel/shared"

interface BudgetBreakdown {
  accommodation: number
  food: number
  activities: number
  transport: number
  other: number
  total: number
}

interface BudgetOverviewProps {
  budget: BudgetBreakdown
  totalBudget?: number
  currency?: string
}

const CATEGORIES = [
  { key: "accommodation", label: "Accommodation", color: "#b8d8e8" },
  { key: "food", label: "Food", color: "#10b981" },
  { key: "activities", label: "Activities", color: "#a78bfa" },
  { key: "transport", label: "Transport", color: "#f59e0b" },
  { key: "other", label: "Other", color: "#9da6b9" },
] as const

export function BudgetOverview({ budget, totalBudget, currency = "EUR" }: BudgetOverviewProps) {
  const limit = totalBudget || budget.total
  const overBudget = totalBudget ? budget.total > totalBudget : false
  const currencySymbol = currency === "EUR" ? "\u20AC" : currency === "USD" ? "$" : currency === "GBP" ? "\u00A3" : currency

  return (
    <TravelCard>
      <h3 className="text-sm font-semibold text-white mb-4">Budget</h3>

      {/* Total with progress bar */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-2xl font-bold text-white">
            {currencySymbol}{budget.total.toFixed(0)}
          </span>
          {totalBudget && (
            <span className="text-sm text-[#7a8299]">
              / {currencySymbol}{totalBudget.toFixed(0)}
            </span>
          )}
        </div>
        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min((budget.total / limit) * 100, 100)}%`,
              backgroundColor: overBudget ? "#ef4444" : "#b8d8e8",
            }}
          />
        </div>
        {overBudget && (
          <p className="text-xs text-red-400 mt-1">
            {currencySymbol}{(budget.total - totalBudget!).toFixed(0)} over budget
          </p>
        )}
      </div>

      {/* Category breakdown */}
      <div className="space-y-2">
        {CATEGORIES.map(({ key, label, color }) => {
          const value = budget[key]
          if (value <= 0) return null
          const pct = budget.total > 0 ? (value / budget.total) * 100 : 0

          return (
            <div key={key} className="flex items-center gap-3">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-[#7a8299] flex-1">{label}</span>
              <span className="text-xs font-medium text-white">
                {currencySymbol}{value.toFixed(0)}
              </span>
              <span className="text-xs text-[#555d70] w-8 text-right">
                {pct.toFixed(0)}%
              </span>
            </div>
          )
        })}
      </div>
    </TravelCard>
  )
}
