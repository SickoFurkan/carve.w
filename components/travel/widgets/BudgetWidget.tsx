import { TravelCard } from "@/components/travel/shared"

interface BudgetCategory {
  label: string
  amount: number
  color: string
}

interface BudgetWidgetProps {
  totalBudget: number | null
  categories: BudgetCategory[]
  currency: string
}

export function BudgetWidget({ totalBudget, categories, currency }: BudgetWidgetProps) {
  const currencySymbol = currency === "EUR" ? "\u20AC" : currency === "USD" ? "$" : currency === "GBP" ? "\u00A3" : currency
  const spent = categories.reduce((sum, c) => sum + c.amount, 0)
  const budget = totalBudget || spent
  const pct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0

  return (
    <TravelCard>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
          <svg className="w-4.5 h-4.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <h3 className="text-sm font-semibold text-white">Budget</h3>
      <p className="text-xs text-[#555d70] mt-0.5">Estimated costs</p>

      <div className="mt-4">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold text-white tabular-nums">
            {currencySymbol}{spent.toFixed(0)}
          </span>
          {totalBudget && (
            <span className="text-sm text-[#555d70]">
              / {currencySymbol}{totalBudget.toFixed(0)}
            </span>
          )}
        </div>

        <div className="mt-3 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              pct > 90 ? "bg-red-400/60" : pct > 70 ? "bg-amber-400/50" : "bg-[#b8d8e8]/40"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {categories.length > 0 && (
        <div className="mt-4 space-y-2">
          {categories.map((cat) => (
            <div key={cat.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-xs text-[#7a8299] capitalize">{cat.label}</span>
              </div>
              <span className="text-xs font-medium text-[#9da6b9] tabular-nums">
                {currencySymbol}{cat.amount.toFixed(0)}
              </span>
            </div>
          ))}
        </div>
      )}
    </TravelCard>
  )
}
