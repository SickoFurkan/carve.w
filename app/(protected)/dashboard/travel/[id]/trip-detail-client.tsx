"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { TravelChat } from "@/components/travel/chat/TravelChat"
import { PlanDashboard } from "@/components/travel/plan/PlanDashboard"
import type { TripPlan } from "@/lib/ai/travel-schemas"

interface TripDetailClientProps {
  trip: {
    id: string
    title: string
    destination: string
    total_budget: number | null
    currency: string
  }
  days: Array<{
    day_number: number
    title: string | null
    trip_activities: Array<{
      time_slot: string
      title: string
      description: string | null
      location_name: string | null
      latitude: number | null
      longitude: number | null
      estimated_cost: number | null
      cost_category: string | null
      duration_minutes: number | null
    }>
  }>
  accommodations: Array<{
    name: string
    price_per_night: number | null
    rating: number | null
    price_tier: string | null
    booking_url: string | null
    latitude: number | null
    longitude: number | null
    distance_to_center: string | null
  }>
}

function toTripPlan(props: TripDetailClientProps): TripPlan {
  const allActivities = props.days.flatMap(d => d.trip_activities)
  const totalFood = allActivities.filter(a => a.cost_category === "food").reduce((s, a) => s + (a.estimated_cost || 0), 0)
  const totalActivity = allActivities.filter(a => a.cost_category === "activity").reduce((s, a) => s + (a.estimated_cost || 0), 0)
  const totalTransport = allActivities.filter(a => a.cost_category === "transport").reduce((s, a) => s + (a.estimated_cost || 0), 0)
  const totalOther = allActivities.filter(a => !["food", "activity", "transport"].includes(a.cost_category || "")).reduce((s, a) => s + (a.estimated_cost || 0), 0)

  // Pick mid-range accommodation (or first available) for budget calc
  const midRange = props.accommodations.find(a => a.price_tier === "mid-range")
    || props.accommodations[0]
  const accTotal = midRange ? (midRange.price_per_night || 0) * props.days.length : 0

  return {
    title: props.trip.title,
    destination: props.trip.destination,
    days: props.days.map(d => ({
      day_number: d.day_number,
      title: d.title || `Day ${d.day_number}`,
      activities: d.trip_activities.map(a => ({
        time_slot: a.time_slot as "morning" | "afternoon" | "evening",
        title: a.title,
        description: a.description || "",
        location_name: a.location_name || "",
        latitude: a.latitude || 0,
        longitude: a.longitude || 0,
        estimated_cost: a.estimated_cost || 0,
        cost_category: (a.cost_category || "other") as "food" | "activity" | "transport" | "shopping" | "other",
        duration_minutes: a.duration_minutes || 60,
      })),
    })),
    accommodations: props.accommodations.map(a => ({
      name: a.name,
      price_per_night: a.price_per_night || 0,
      rating: a.rating || 0,
      price_tier: (a.price_tier || "mid-range") as "budget" | "mid-range" | "luxury",
      booking_url: a.booking_url || "#",
      latitude: a.latitude || 0,
      longitude: a.longitude || 0,
      distance_to_center: a.distance_to_center || "",
    })),
    budget_breakdown: {
      accommodation: accTotal,
      food: totalFood,
      activities: totalActivity,
      transport: totalTransport,
      other: totalOther,
      total: accTotal + totalFood + totalActivity + totalTransport + totalOther,
    },
  }
}

export function TripDetailClient(props: TripDetailClientProps) {
  const [plan, setPlan] = useState<TripPlan>(() => toTripPlan(props))
  const [chatOpen, setChatOpen] = useState(false)

  return (
    <div className="h-full flex">
      {/* Chat panel (for replanning) */}
      {chatOpen && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 400 }}
          transition={{ duration: 0.3 }}
          className="shrink-0 border-r border-white/[0.06] overflow-hidden bg-[#0c0e14]"
        >
          <div className="w-[400px] h-full">
            <TravelChat
              tripId={props.trip.id}
              onPlanGenerated={setPlan}
            />
          </div>
        </motion.div>
      )}

      {/* Plan dashboard */}
      <div className="flex-1 min-w-0 relative">
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="absolute top-4 right-4 z-10 px-3 py-1.5 text-xs font-medium text-[#b8d8e8] bg-[#b8d8e8]/10 hover:bg-[#b8d8e8]/20 rounded-lg transition-colors"
        >
          {chatOpen ? "Close chat" : "Replan with AI"}
        </button>
        <PlanDashboard plan={plan} currency={props.trip.currency} />
      </div>
    </div>
  )
}
