'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Subscription, SavingsInsight } from '@/components/money/sample-data'
import { SubscriptionTimeline } from './SubscriptionTimeline'
import { PotentialSavings } from './PotentialSavings'

// ---------------------------------------------------------------------------
// Chevron icons
// ---------------------------------------------------------------------------

function ChevronLeft() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// TimelineView
// ---------------------------------------------------------------------------

interface TimelineViewProps {
  subscriptions: Subscription[]
  insights: SavingsInsight[]
}

export function TimelineView({ subscriptions, insights }: TimelineViewProps) {
  const [activeView, setActiveView] = useState<'timeline' | 'calendar'>('timeline')

  // Total projected cost from subscriptions
  const totalProjected = subscriptions.reduce((sum, sub) => sum + sub.cost, 0)

  return (
    <div className="h-full flex flex-col bg-[#0f1117]">
      {/* Header */}
      <header className="px-6 py-4 border-b border-white/[0.08] shrink-0">
        <div className="flex items-center justify-between">
          {/* Left: Title and projected total */}
          <div className="flex items-center gap-4">
            <h1 className="text-white text-lg font-bold">Timeline</h1>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-sm">Total Projected:</span>
              <span className="text-white text-sm font-semibold">
                ${totalProjected.toFixed(2)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-xs font-medium">
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z" />
                </svg>
                +2.4% vs last mo
              </span>
            </div>
          </div>

          {/* Right: Month nav, view toggle, add button */}
          <div className="flex items-center gap-3">
            {/* Month navigation */}
            <div className="flex items-center gap-1">
              <button
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft />
              </button>
              <span className="text-white text-sm font-medium px-2 min-w-[120px] text-center">
                October 2023
              </span>
              <button
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Next month"
              >
                <ChevronRight />
              </button>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-white/10" />

            {/* Timeline / Calendar toggle */}
            <div className="flex bg-white/5 rounded-lg p-0.5">
              <button
                onClick={() => setActiveView('timeline')}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                  activeView === 'timeline'
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                Timeline
              </button>
              <button
                onClick={() => setActiveView('calendar')}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                  activeView === 'calendar'
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                Calendar
              </button>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-white/10" />

            {/* Add subscription button */}
            <button className="flex items-center gap-1.5 bg-[#135bec] hover:bg-[#135bec]/90 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              <PlusIcon />
              Add Subscription
            </button>
          </div>
        </div>
      </header>

      {/* Timeline area */}
      <SubscriptionTimeline subscriptions={subscriptions} />

      {/* Bottom savings panel */}
      <PotentialSavings insights={insights} />
    </div>
  )
}
