'use client'

import { cn } from '@/lib/utils'
import type { SavingsInsight } from '@/components/money/sample-data'

// ---------------------------------------------------------------------------
// Icon color configuration based on insight type
// ---------------------------------------------------------------------------

const INSIGHT_STYLES: Record<
  SavingsInsight['type'],
  { iconBg: string; iconText: string; savingsText: string }
> = {
  duplicate: {
    iconBg: 'bg-amber-500/20',
    iconText: 'text-amber-500',
    savingsText: 'text-amber-400',
  },
  price_hike: {
    iconBg: 'bg-red-500/20',
    iconText: 'text-red-500',
    savingsText: 'text-amber-400',
  },
  unused: {
    iconBg: 'bg-blue-500/20',
    iconText: 'text-blue-500',
    savingsText: 'text-amber-400',
  },
}

// ---------------------------------------------------------------------------
// SVG icons per insight type
// ---------------------------------------------------------------------------

function InsightIcon({ type }: { type: SavingsInsight['type'] }) {
  switch (type) {
    case 'duplicate':
      // Duplicate / refresh arrows icon
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
          <path d="M21 2v6h-6" />
          <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
          <path d="M3 22v-6h6" />
          <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
        </svg>
      )
    case 'price_hike':
      // Trending up icon
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
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      )
    case 'unused':
      // Moon / sleep icon
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
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )
  }
}

// ---------------------------------------------------------------------------
// Parse description to highlight service names in white
// ---------------------------------------------------------------------------

function HighlightedDescription({ text }: { text: string }) {
  // Match service names and dollar amounts that should be highlighted
  const highlightPatterns = [
    'Spotify',
    'Apple Music',
    'Comcast',
    'Adobe CC',
    'Netflix',
    'Figma',
    'AWS',
    'X Premium',
    'Equinox',
  ]

  const regex = new RegExp(`(${highlightPatterns.join('|')})`, 'g')
  const parts = text.split(regex)

  return (
    <p className="text-slate-400 text-xs mt-1 leading-relaxed">
      {parts.map((part, i) =>
        highlightPatterns.includes(part) ? (
          <span key={i} className="text-white">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  )
}

// ---------------------------------------------------------------------------
// Individual insight card
// ---------------------------------------------------------------------------

function InsightCard({ insight }: { insight: SavingsInsight }) {
  const styles = INSIGHT_STYLES[insight.type]

  return (
    <div className="rounded-xl border border-white/5 bg-white/5 p-4 flex items-start gap-3 hover:bg-white/10 transition-colors cursor-pointer">
      {/* Icon */}
      <div
        className={cn(
          'size-8 rounded-full flex items-center justify-center shrink-0',
          styles.iconBg,
          styles.iconText
        )}
      >
        <InsightIcon type={insight.type} />
      </div>

      {/* Content */}
      <div className="min-w-0">
        <h4 className="text-white text-sm font-medium">{insight.title}</h4>
        <HighlightedDescription text={insight.description} />
        {insight.savingsAmount != null && (
          <div className={cn('mt-2 text-xs font-medium', styles.savingsText)}>
            Save approx. ${insight.savingsAmount.toFixed(2)}/mo
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// PotentialSavings
// ---------------------------------------------------------------------------

interface PotentialSavingsProps {
  insights: SavingsInsight[]
}

export function PotentialSavings({ insights }: PotentialSavingsProps) {
  return (
    <div className="border-t border-white/[0.08] bg-[rgba(28,31,39,0.5)] px-6 py-5">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {/* Lightbulb icon */}
          <div className="size-6 flex items-center justify-center text-amber-400">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18h6" />
              <path d="M10 22h4" />
              <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
            </svg>
          </div>
          <h3 className="text-white text-sm font-semibold">Potential Savings</h3>
        </div>
        <button className="text-[#e8e0d4] text-xs font-medium hover:text-[#e8e0d4]/80 transition-colors">
          View All Insights
        </button>
      </div>

      {/* Insight cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>
    </div>
  )
}
