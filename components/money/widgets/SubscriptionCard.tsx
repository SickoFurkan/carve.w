"use client"

import { cn } from "@/lib/utils"
import { MoneyProgressBar } from "@/components/money/shared"
import type { Subscription } from "@/components/money/sample-data"

// ---------------------------------------------------------------------------
// Service icon configuration -- colored square with letter/abbreviation
// ---------------------------------------------------------------------------

const SERVICE_ICON_MAP: Record<
  string,
  { bg: string; label: string; textColor?: string }
> = {
  Netflix: { bg: "bg-[#E50914]", label: "N" },
  Spotify: { bg: "bg-[#1DB954]", label: "S" },
  "Adobe CC": { bg: "bg-[#FF0000]", label: "Ai" },
  Figma: { bg: "bg-[#1e1e1e]", label: "F" },
  AWS: { bg: "bg-[#232f3e]", label: "AWS", textColor: "text-[#FF9900]" },
  "X Premium": { bg: "bg-black", label: "X" },
  Equinox: { bg: "bg-black", label: "EQ" },
}

// Progress percentages per subscription (mock billing-cycle progress)
const PROGRESS_MAP: Record<string, { value: number; color: string }> = {
  Netflix: { value: 95, color: "bg-rose-500" },
  Spotify: { value: 25, color: "bg-[#135bec]" },
  "Adobe CC": { value: 65, color: "bg-amber-500" },
  Figma: { value: 15, color: "bg-[#135bec]" },
  AWS: { value: 80, color: "bg-[#135bec]" },
  "X Premium": { value: 45, color: "bg-[#135bec]" },
  Equinox: { value: 55, color: "bg-[#135bec]" },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDaysUntilBill(nextBillDate: string): number {
  const now = new Date()
  const bill = new Date(nextBillDate)
  const diffMs = bill.getTime() - now.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

function formatBillDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

// ---------------------------------------------------------------------------
// SubscriptionCard
// ---------------------------------------------------------------------------

interface SubscriptionCardProps {
  subscription: Subscription
  className?: string
}

export function SubscriptionCard({
  subscription,
  className,
}: SubscriptionCardProps) {
  const { name, plan, cost, nextBillDate } = subscription

  const daysUntilBill = getDaysUntilBill(nextBillDate)

  // Icon config
  const iconCfg = SERVICE_ICON_MAP[name] ?? {
    bg: "bg-slate-700",
    label: name.charAt(0),
  }

  // Progress config
  const progressCfg = PROGRESS_MAP[name] ?? {
    value: 50,
    color: "bg-[#135bec]",
  }

  // Urgency badge
  let urgencyEl: React.ReactNode = null
  if (daysUntilBill <= 1) {
    urgencyEl = (
      <span className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium text-rose-400 bg-rose-500/10 border-rose-500/20">
        Due Tomorrow
      </span>
    )
  } else if (daysUntilBill <= 14) {
    urgencyEl = (
      <span className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium text-amber-400 bg-amber-500/10 border-amber-500/20">
        {daysUntilBill} days left
      </span>
    )
  } else {
    urgencyEl = (
      <div className="flex flex-col items-end">
        <span className="text-[10px] uppercase tracking-wider text-slate-500">
          Next Bill
        </span>
        <span className="text-sm text-slate-300">
          {formatBillDate(nextBillDate)}
        </span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "group relative rounded-xl p-5 transition-all duration-200 cursor-pointer",
        "bg-[rgba(30,35,45,0.4)] backdrop-blur-xl",
        "border border-white/[0.08]",
        "shadow-[0_4px_30px_rgba(0,0,0,0.3)]",
        "hover:bg-[rgba(30,35,45,0.6)] hover:border-[#135bec]/30",
        "hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(19,91,236,0.15)]",
        className
      )}
    >
      {/* Top row: icon, name+plan, three-dot menu */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Service icon */}
          <div
            className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0",
              iconCfg.bg,
              iconCfg.textColor
            )}
          >
            {iconCfg.label}
          </div>
          <div className="min-w-0">
            <h3 className="text-white font-semibold text-sm leading-tight truncate">
              {name}
            </h3>
            <p className="text-slate-400 text-xs mt-0.5 truncate">{plan}</p>
          </div>
        </div>

        {/* Three-dot menu */}
        <button
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-white/10"
          aria-label="More options"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="text-slate-400"
          >
            <circle cx="8" cy="3" r="1.5" />
            <circle cx="8" cy="8" r="1.5" />
            <circle cx="8" cy="13" r="1.5" />
          </svg>
        </button>
      </div>

      {/* Middle row: cost + urgency */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-slate-500 block">
            Cost
          </span>
          <span className="text-white text-lg font-bold">
            ${cost.toFixed(2)}
            <span className="text-slate-500 text-xs font-normal">/mo</span>
          </span>
        </div>
        {urgencyEl}
      </div>

      {/* Bottom: progress bar */}
      <MoneyProgressBar value={progressCfg.value} color={progressCfg.color} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// AddSubscriptionCard -- dashed border placeholder
// ---------------------------------------------------------------------------

export function AddSubscriptionCard({ className }: { className?: string }) {
  return (
    <button
      className={cn(
        "group rounded-xl p-5 transition-all duration-200 cursor-pointer",
        "bg-transparent",
        "border-2 border-dashed border-white/[0.12]",
        "hover:border-[#135bec]/40 hover:bg-[rgba(30,35,45,0.2)]",
        "flex flex-col items-center justify-center gap-3 min-h-[180px]",
        className
      )}
    >
      {/* Plus icon */}
      <div className="w-12 h-12 rounded-lg border border-dashed border-white/20 flex items-center justify-center group-hover:border-[#135bec]/40 transition-colors">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-slate-500 group-hover:text-[#135bec] transition-colors"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </div>
      <span className="text-sm font-medium text-slate-500 group-hover:text-slate-300 transition-colors">
        Add Subscription
      </span>
    </button>
  )
}
