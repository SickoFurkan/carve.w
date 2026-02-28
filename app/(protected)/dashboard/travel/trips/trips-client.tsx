"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { TripCard } from "@/components/travel/widgets/TripCard"
import { TravelCard } from "@/components/travel/shared"
import { cn } from "@/lib/utils"

interface Trip {
  id: string
  title: string
  destination: string
  start_date: string | null
  end_date: string | null
  total_budget: number | null
  currency: string
  status: string
  created_at: string
}

type Tab = "upcoming" | "past" | "all"

export function TripsPageClient({ trips: initialTrips }: { trips: Trip[] }) {
  const [trips, setTrips] = useState(initialTrips)
  const [activeTab, setActiveTab] = useState<Tab>("upcoming")

  const filtered = trips.filter((t) => {
    if (activeTab === "upcoming") return t.status === "planned" || t.status === "active"
    if (activeTab === "past") return t.status === "completed"
    return true
  })

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this trip?")) return
    const res = await fetch(`/api/travel/trips?id=${id}`, { method: "DELETE" })
    if (res.ok) setTrips((prev) => prev.filter((t) => t.id !== id))
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "upcoming", label: "Upcoming" },
    { key: "past", label: "Past" },
    { key: "all", label: "All" },
  ]

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Trips</h1>
          <p className="text-[#7a8299] text-sm mt-0.5">
            {trips.length} {trips.length === 1 ? "trip" : "trips"}
          </p>
        </div>
        <Link
          href="/dashboard/travel/new"
          className="px-4 py-2 text-sm font-medium text-[#b8d8e8] bg-[#b8d8e8]/10 hover:bg-[#b8d8e8]/20 rounded-lg transition-colors"
        >
          Plan a trip
        </Link>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/[0.03] rounded-lg p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
              activeTab === tab.key
                ? "bg-white/[0.08] text-white"
                : "text-[#7a8299] hover:text-white"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Trip list */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((t, idx) => (
            <TripCard
              key={t.id}
              id={t.id}
              title={t.title}
              destination={t.destination}
              startDate={t.start_date}
              endDate={t.end_date}
              totalBudget={t.total_budget}
              currency={t.currency}
              status={t.status}
              index={idx}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <Link href="/dashboard/travel/new">
          <TravelCard className="hover:border-[#b8d8e8]/30 transition-colors cursor-pointer group text-center py-16">
            <div className="text-4xl mb-4 opacity-20">✈</div>
            <h3 className="text-lg font-semibold text-white group-hover:text-[#b8d8e8] transition-colors">
              {activeTab === "past" ? "No past trips yet" : "Plan your first trip"}
            </h3>
            <p className="text-[#7a8299] text-sm mt-1">
              Tell the AI where you want to go and get a complete travel plan
            </p>
          </TravelCard>
        </Link>
      )}
    </div>
  )
}
