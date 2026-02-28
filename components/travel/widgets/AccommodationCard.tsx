"use client"

import { TravelCard } from "@/components/travel/shared"
import type { TripAccommodation } from "@/lib/ai/travel-schemas"

interface AccommodationCardProps {
  accommodations: TripAccommodation[]
  currency?: string
}

const TIER_LABELS: Record<string, string> = {
  budget: "Budget",
  "mid-range": "Mid-range",
  luxury: "Luxury",
}

export function AccommodationCard({ accommodations, currency = "EUR" }: AccommodationCardProps) {
  if (!accommodations.length) return null
  const currencySymbol = currency === "EUR" ? "\u20AC" : currency === "USD" ? "$" : currency === "GBP" ? "\u00A3" : currency

  return (
    <TravelCard>
      <h3 className="text-sm font-semibold text-white mb-3">Accommodations</h3>
      <div className="space-y-3">
        {accommodations.map((acc, idx) => (
          <a
            key={idx}
            href={acc.booking_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:border-[#b8d8e8]/20 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-white truncate">
                  {acc.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-[#b8d8e8]">
                    {TIER_LABELS[acc.price_tier] || acc.price_tier}
                  </span>
                  {acc.rating > 0 && (
                    <span className="text-xs text-[#7a8299]">
                      ★ {acc.rating.toFixed(1)}
                    </span>
                  )}
                  {acc.distance_to_center && (
                    <span className="text-xs text-[#555d70]">
                      {acc.distance_to_center}
                    </span>
                  )}
                </div>
              </div>
              <div className="shrink-0 ml-3 text-right">
                <p className="text-sm font-semibold text-white">
                  {currencySymbol}{acc.price_per_night}
                </p>
                <p className="text-xs text-[#555d70]">/ night</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </TravelCard>
  )
}
