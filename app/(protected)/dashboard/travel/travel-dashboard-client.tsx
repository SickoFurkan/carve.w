"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { TravelCard } from "@/components/travel/shared"
import { TripCard } from "@/components/travel/widgets/TripCard"

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

export function TravelDashboardClient({ trips }: { trips: Trip[] }) {
  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Carve Travel
          </h1>
          <p className="text-[#9da6b9] mt-1">Your AI-powered travel planner</p>
        </div>
        <Link
          href="/dashboard/travel/new"
          className="px-4 py-2 text-sm font-medium text-[#b8d8e8] bg-[#b8d8e8]/10 hover:bg-[#b8d8e8]/20 rounded-lg transition-colors"
        >
          Plan a trip
        </Link>
      </motion.div>

      {trips.length > 0 ? (
        <div className="space-y-3">
          {trips.map((trip, idx) => (
            <TripCard
              key={trip.id}
              id={trip.id}
              title={trip.title}
              destination={trip.destination}
              startDate={trip.start_date}
              endDate={trip.end_date}
              totalBudget={trip.total_budget}
              currency={trip.currency}
              status={trip.status}
              index={idx}
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Link href="/dashboard/travel/new">
            <TravelCard className="hover:border-[#b8d8e8]/30 transition-colors cursor-pointer group text-center py-16">
              <div className="text-4xl mb-4">✈</div>
              <h3 className="text-lg font-semibold text-white group-hover:text-[#b8d8e8] transition-colors">
                Plan your first trip
              </h3>
              <p className="text-[#9da6b9] text-sm mt-1">
                Tell the AI where you want to go and get a complete travel plan
              </p>
            </TravelCard>
          </Link>
        </motion.div>
      )}
    </div>
  )
}
