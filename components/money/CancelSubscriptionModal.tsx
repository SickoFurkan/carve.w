"use client"

import { cn } from "@/lib/utils"
import type { Subscription } from "@/components/money/sample-data"

// ---------------------------------------------------------------------------
// Service icon configuration -- matches SubscriptionCard / SubscriptionTable
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

// ---------------------------------------------------------------------------
// Service color mapping for the icon background tint in the preview card
// ---------------------------------------------------------------------------

const SERVICE_COLOR_MAP: Record<string, string> = {
  Netflix: "#E50914",
  Spotify: "#1DB954",
  "Adobe CC": "#FF0000",
  Figma: "#A259FF",
  AWS: "#FF9900",
  "X Premium": "#1DA1F2",
  Equinox: "#000000",
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatBillDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

// ---------------------------------------------------------------------------
// CancelSubscriptionModal
// ---------------------------------------------------------------------------

interface CancelSubscriptionModalProps {
  subscription: Subscription | null
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function CancelSubscriptionModal({
  subscription,
  isOpen,
  onClose,
  onConfirm,
}: CancelSubscriptionModalProps) {
  if (!isOpen || !subscription) return null

  const iconCfg = SERVICE_ICON_MAP[subscription.name] ?? {
    bg: "bg-slate-700",
    label: subscription.name.charAt(0),
  }

  const serviceColor =
    SERVICE_COLOR_MAP[subscription.name] ?? subscription.color

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className={cn(
          "w-full max-w-md rounded-2xl p-6 flex flex-col gap-6",
          "bg-[rgba(28,31,39,0.9)] backdrop-blur-[24px]",
          "border border-white/10",
          "shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]"
        )}
      >
        {/* Warning icon + close button */}
        <div className="flex items-start justify-between">
          <div className="p-3 bg-red-500/10 rounded-full border border-red-500/20 text-red-500">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <button
            onClick={onClose}
            className="text-[#9da6b9] hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            aria-label="Close modal"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Title and description */}
        <div>
          <h3 className="text-xl font-bold text-white">
            Cancel {subscription.name} Subscription?
          </h3>
          <p className="text-[#9da6b9] text-sm mt-2 leading-relaxed">
            Are you sure you want to cancel your {subscription.name}{" "}
            subscription? You will still have access until the end of your
            current billing cycle on{" "}
            <span className="text-white font-medium">
              {formatBillDate(subscription.nextBillDate)}
            </span>
            .
          </p>
        </div>

        {/* Service preview card */}
        <div className="p-4 rounded-xl bg-[#111318]/50 border border-[#3b4354]/30 flex items-center gap-4">
          <div
            className={cn(
              "size-10 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0",
              iconCfg.bg,
              iconCfg.textColor
            )}
            style={{
              backgroundColor: iconCfg.bg.startsWith("bg-")
                ? undefined
                : serviceColor,
            }}
          >
            {iconCfg.label}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white">
              {subscription.name}{" "}
              <span className="text-[#9da6b9] font-normal">
                {subscription.plan}
              </span>
            </p>
            <p className="text-xs text-[#9da6b9]">
              ${subscription.cost.toFixed(2)} /{" "}
              {subscription.frequency === "monthly" ? "month" : "year"}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className={cn(
              "flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors",
              "border border-[#3b4354]/50 text-white",
              "hover:bg-[#282e39]"
            )}
          >
            Keep Subscription
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              "flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors",
              "bg-red-500 hover:bg-red-600 text-white",
              "shadow-lg shadow-red-500/20"
            )}
          >
            Confirm Cancellation
          </button>
        </div>
      </div>
    </div>
  )
}
