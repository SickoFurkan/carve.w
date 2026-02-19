'use client'

import { cn } from '@/lib/utils'
import type { Subscription } from '@/components/money/sample-data'

// ---------------------------------------------------------------------------
// Service icon configuration -- matches SubscriptionCard's SERVICE_ICON_MAP
// ---------------------------------------------------------------------------

const SERVICE_ICON_MAP: Record<
  string,
  { bg: string; label: string; textColor?: string }
> = {
  Netflix: { bg: 'bg-[#E50914]', label: 'N' },
  Spotify: { bg: 'bg-[#1DB954]', label: 'S' },
  'Adobe CC': { bg: 'bg-[#FF0000]', label: 'Ai' },
  Figma: { bg: 'bg-[#1e1e1e]', label: 'F' },
  AWS: { bg: 'bg-[#232f3e]', label: 'AWS', textColor: 'text-[#FF9900]' },
  'X Premium': { bg: 'bg-black', label: 'X' },
  Equinox: { bg: 'bg-black', label: 'EQ' },
}

// ---------------------------------------------------------------------------
// Status assignment for demo purposes
// ---------------------------------------------------------------------------

type TimelineStatus = 'paid' | 'due_soon' | 'upcoming'

const STATUS_OVERRIDES: Record<string, TimelineStatus> = {
  'X Premium': 'paid',
  Netflix: 'due_soon',
}

function getStatus(name: string): TimelineStatus {
  return STATUS_OVERRIDES[name] ?? 'upcoming'
}

// ---------------------------------------------------------------------------
// Category labels
// ---------------------------------------------------------------------------

const CATEGORY_LABELS: Record<string, string> = {
  entertainment: 'Entertainment',
  software: 'Software',
  utilities: 'Utilities',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDay(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getDayOfMonth(dateStr: string): number {
  return new Date(dateStr).getDate()
}

// ---------------------------------------------------------------------------
// Status badge component
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: TimelineStatus }) {
  switch (status) {
    case 'paid':
      return (
        <span className="flex items-center gap-1 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Paid
        </span>
      )
    case 'due_soon':
      return (
        <span className="bg-[#e8e0d4]/20 text-[#e8e0d4] text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
          Due Soon
        </span>
      )
    case 'upcoming':
      return (
        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
          Upcoming
        </span>
      )
  }
}

// ---------------------------------------------------------------------------
// Timeline card component
// ---------------------------------------------------------------------------

function TimelineCard({
  subscription,
  status,
}: {
  subscription: Subscription
  status: TimelineStatus
}) {
  const { name, cost, category } = subscription
  const isPast = status === 'paid'

  const iconCfg = SERVICE_ICON_MAP[name] ?? {
    bg: 'bg-slate-700',
    label: name.charAt(0),
  }

  const categoryLabel = CATEGORY_LABELS[category] ?? category

  return (
    <div
      className={cn(
        'w-[220px] rounded-xl p-3 transition-all duration-300 cursor-pointer',
        'bg-[#1c1f27]',
        'border border-white/[0.05]',
        'hover:bg-white/[0.07] hover:border-white/[0.15] hover:-translate-y-0.5',
        isPast && 'opacity-50 hover:opacity-100'
      )}
    >
      {/* Top row: icon, name + category, status badge */}
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            'size-10 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0',
            iconCfg.bg,
            iconCfg.textColor
          )}
        >
          {iconCfg.label}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-white text-sm font-medium truncate">{name}</h4>
          <p className="text-slate-500 text-[11px] truncate">{categoryLabel}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Separator */}
      <div className="border-t border-white/5 my-2.5" />

      {/* Bottom row: status label and amount */}
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'text-[10px] font-medium uppercase tracking-wider',
            status === 'paid' && 'text-emerald-500',
            status === 'due_soon' && 'text-[#e8e0d4]',
            status === 'upcoming' && 'text-slate-500'
          )}
        >
          {status === 'paid' ? 'Paid' : status === 'due_soon' ? 'Due Soon' : 'Upcoming'}
        </span>
        <span className="text-white font-mono text-sm font-semibold">
          ${cost.toFixed(2)}
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// SubscriptionTimeline
// ---------------------------------------------------------------------------

interface SubscriptionTimelineProps {
  subscriptions: Subscription[]
}

export function SubscriptionTimeline({ subscriptions }: SubscriptionTimelineProps) {
  // Sort subscriptions by nextBillDate, then by day of month
  const sorted = [...subscriptions].sort(
    (a, b) => getDayOfMonth(a.nextBillDate) - getDayOfMonth(b.nextBillDate)
  )

  const itemSpacing = 280 // horizontal spacing between items in px
  const todayLeftPx = 60  // left offset for TODAY marker

  // Calculate horizontal position for each card.
  // Items are spaced evenly to avoid overlap, offset from the TODAY marker.
  function getLeftPosition(index: number): number {
    return todayLeftPx + 120 + index * itemSpacing
  }

  const totalWidth = todayLeftPx + 120 + sorted.length * itemSpacing + 100

  return (
    <div className="flex-1 relative overflow-x-auto overflow-y-hidden scrollbar-hide">
      <div
        className="relative h-full min-h-[400px]"
        style={{ width: `${totalWidth}px`, minWidth: '100%' }}
      >
        {/* Horizontal timeline line */}
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10" />

        {/* TODAY marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
          style={{ left: `${todayLeftPx}px` }}
        >
          {/* Vertical glow line */}
          <div className="absolute w-[1px] h-24 bg-gradient-to-b from-[#e8e0d4]/0 via-[#e8e0d4]/60 to-[#e8e0d4]/0 -translate-y-1/2" />
          {/* Dot */}
          <div className="w-3 h-3 rounded-full bg-[#e8e0d4] border-2 border-[#111318] shadow-[0_0_10px_rgba(232,224,212,0.8)] z-10" />
          {/* Label */}
          <div className="absolute -top-8">
            <span className="bg-[#e8e0d4] text-[#0c0e14] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-[0_0_10px_rgba(232,224,212,0.3)]">
              Today
            </span>
          </div>
        </div>

        {/* Timeline items */}
        {sorted.map((sub, i) => {
          const status = getStatus(sub.name)
          const isPast = status === 'paid'
          const leftPx = getLeftPosition(i)
          const isAbove = i % 2 === 0

          return (
            <div
              key={sub.id}
              className="absolute flex flex-col items-center"
              style={{ left: `${leftPx}px` }}
            >
              {/* Date dot on the timeline */}
              <div
                className="absolute top-1/2 -translate-y-1/2 z-10"
                style={{ left: '110px' }} // Center of the 220px card
              >
                <div
                  className={cn(
                    'w-3 h-3 rounded-full border-2 border-[#111318]',
                    isPast
                      ? 'bg-slate-700'
                      : 'bg-[#e8e0d4] shadow-[0_0_10px_rgba(232,224,212,0.8)]'
                  )}
                />
              </div>

              {/* Date label */}
              <div
                className={cn(
                  'absolute z-10 text-[11px] font-medium',
                  isPast ? 'text-slate-600' : 'text-slate-400'
                )}
                style={{
                  left: '110px',
                  transform: 'translateX(-50%)',
                  ...(isAbove
                    ? { top: 'calc(50% + 16px)' }
                    : { bottom: 'calc(50% + 16px)' }),
                }}
              >
                {formatDay(sub.nextBillDate)}
              </div>

              {/* Connector line from dot to card */}
              <div
                className={cn(
                  'absolute w-[1px] z-0',
                  isPast ? 'bg-white/5' : 'bg-white/10'
                )}
                style={{
                  left: 'calc(110px)',
                  height: '20px',
                  ...(isAbove
                    ? { bottom: 'calc(50% + 6px)', top: 'auto' }
                    : { top: 'calc(50% + 6px)', bottom: 'auto' }),
                }}
              />

              {/* Card */}
              <div
                className="absolute"
                style={{
                  ...(isAbove
                    ? { bottom: 'calc(50% + 28px)' }
                    : { top: 'calc(50% + 28px)' }),
                }}
              >
                <TimelineCard subscription={sub} status={status} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
