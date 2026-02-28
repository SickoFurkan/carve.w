"use client"

import { useEffect, useState } from "react"
import { TravelCard } from "@/components/travel/shared"

interface CountdownWidgetProps {
  startDate: string | null
  tripTitle: string
  daysCount: number
}

export function CountdownWidget({ startDate, tripTitle, daysCount }: CountdownWidgetProps) {
  const [daysUntil, setDaysUntil] = useState(0)

  useEffect(() => {
    if (!startDate) return
    const calc = () => Math.max(0, Math.ceil((new Date(startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    setDaysUntil(calc())
    const interval = setInterval(() => setDaysUntil(calc()), 60_000)
    return () => clearInterval(interval)
  }, [startDate])

  const progress = startDate ? Math.max(0, Math.min(100, ((30 - daysUntil) / 30) * 100)) : 0

  return (
    <TravelCard>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-[#b8d8e8]/10 flex items-center justify-center">
          <svg className="w-4.5 h-4.5 text-[#b8d8e8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <h3 className="text-sm font-semibold text-white">Countdown</h3>
      <p className="text-xs text-[#555d70] mt-0.5">Days until departure</p>

      <div className="mt-4">
        <div className="text-4xl font-bold text-white tabular-nums">
          {startDate ? daysUntil : "\u2014"}
        </div>
        <p className="text-xs text-[#7a8299] mt-1">
          {daysCount} day trip to {tripTitle}
        </p>
      </div>

      {startDate && (
        <div className="mt-4">
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#b8d8e8]/40 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </TravelCard>
  )
}
