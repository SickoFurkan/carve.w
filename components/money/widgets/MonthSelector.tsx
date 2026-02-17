'use client'

import { cn } from '@/lib/utils'

interface MonthSelectorProps {
  months: string[]
  selected: string
  onSelect: (month: string) => void
}

export function MonthSelector({ months, selected, onSelect }: MonthSelectorProps) {
  return (
    <div className="flex bg-[#1c1f27] p-1 rounded-xl">
      {months.map((month) => {
        const isActive = month === selected
        return (
          <button
            key={month}
            onClick={() => onSelect(month)}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors rounded-lg',
              isActive
                ? 'bg-white dark:bg-[#282e39] text-[#135bec] shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-500 hover:text-white'
            )}
          >
            {month}
          </button>
        )
      })}
    </div>
  )
}
