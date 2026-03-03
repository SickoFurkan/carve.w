'use client'

import { cn } from '@/lib/utils'

interface DashboardCardProps {
  children: React.ReactNode
  className?: string
  compact?: boolean
}

export function DashboardCard({ children, className, compact = false }: DashboardCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-[#1c1f27] border border-white/[0.06]',
        compact ? 'p-4' : 'p-5',
        className
      )}
    >
      {children}
    </div>
  )
}
