"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { TravelCard } from "@/components/travel/shared"
import type { TripActivity } from "@/lib/ai/travel-schemas"

interface Suggestion {
  title: string
  description: string
  time_slot: "morning" | "afternoon" | "evening"
  location_name: string
  estimated_cost: number
  cost_category: "food" | "activity" | "transport" | "shopping" | "other"
  duration_minutes: number
}

interface ActivitySuggestionsProps {
  destination: string
  days: number
  onAdd: (activity: TripActivity) => void
  currency?: string
}

const CATEGORY_COLORS: Record<string, string> = {
  food: "#10b981",
  activity: "#b8d8e8",
  transport: "#f59e0b",
  shopping: "#a78bfa",
  other: "#9da6b9",
}

export function ActivitySuggestions({ destination, days, onAdd, currency = "EUR" }: ActivitySuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState<Set<number>>(new Set())
  const [error, setError] = useState(false)

  const currencySymbol = currency === "EUR" ? "\u20AC" : currency === "USD" ? "$" : currency === "GBP" ? "\u00A3" : currency

  useEffect(() => {
    if (!destination) return

    setLoading(true)
    setError(false)
    fetch("/api/travel/suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destination, days }),
    })
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then((data) => setSuggestions(data.activities || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [destination, days])

  const handleAdd = (suggestion: Suggestion, idx: number) => {
    onAdd({
      ...suggestion,
      latitude: 0,
      longitude: 0,
    })
    setAdded((prev) => new Set(prev).add(idx))
  }

  if (loading) {
    return (
      <TravelCard className="py-8">
        <div className="flex items-center justify-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#b8d8e8]/40 animate-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#b8d8e8]/40 animate-pulse [animation-delay:0.2s]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#b8d8e8]/40 animate-pulse [animation-delay:0.4s]" />
          </div>
          <p className="text-sm text-[#7a8299]">Getting suggestions for {destination}...</p>
        </div>
      </TravelCard>
    )
  }

  if (error || !suggestions.length) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[#7a8299]">
          Suggested activities in {destination}
        </h3>
        <span className="text-xs text-[#555d70]">Click + to add</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {suggestions.map((s, idx) => {
          const isAdded = added.has(idx)

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <TravelCard
                className={`transition-all ${
                  isAdded
                    ? "opacity-40 border-[#b8d8e8]/10"
                    : "hover:border-[#b8d8e8]/20 cursor-pointer"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-white truncate">{s.title}</h4>
                      <span
                        className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full capitalize"
                        style={{
                          color: CATEGORY_COLORS[s.cost_category] || CATEGORY_COLORS.other,
                          backgroundColor: `${CATEGORY_COLORS[s.cost_category] || CATEGORY_COLORS.other}15`,
                        }}
                      >
                        {s.cost_category}
                      </span>
                    </div>
                    <p className="text-xs text-[#555d70] line-clamp-2">{s.description}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[#7a8299]">
                      <span>{s.location_name}</span>
                      {s.estimated_cost > 0 && <span>{currencySymbol}{s.estimated_cost}</span>}
                      <span>{s.duration_minutes}min</span>
                      <span className="capitalize">{s.time_slot}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => !isAdded && handleAdd(s, idx)}
                    disabled={isAdded}
                    className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                      isAdded
                        ? "bg-[#b8d8e8]/10 text-[#b8d8e8]/40"
                        : "bg-[#b8d8e8]/10 text-[#b8d8e8] hover:bg-[#b8d8e8]/20"
                    }`}
                  >
                    {isAdded ? "✓" : "+"}
                  </button>
                </div>
              </TravelCard>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
