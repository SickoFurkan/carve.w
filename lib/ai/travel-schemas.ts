import { z } from "zod"

export const activitySchema = z.object({
  time_slot: z.enum(["morning", "afternoon", "evening"]),
  title: z.string(),
  description: z.string(),
  location_name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  estimated_cost: z.number(),
  cost_category: z.enum(["food", "activity", "transport", "shopping", "other"]),
  duration_minutes: z.number(),
})

export const daySchema = z.object({
  day_number: z.number(),
  title: z.string(),
  activities: z.array(activitySchema),
})

export const accommodationSchema = z.object({
  name: z.string(),
  price_per_night: z.number(),
  rating: z.number(),
  price_tier: z.enum(["budget", "mid-range", "luxury"]),
  booking_url: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  distance_to_center: z.string(),
})

export const tripPlanSchema = z.object({
  title: z.string(),
  destination: z.string(),
  days: z.array(daySchema),
  accommodations: z.array(accommodationSchema),
  budget_breakdown: z.object({
    accommodation: z.number(),
    food: z.number(),
    activities: z.number(),
    transport: z.number(),
    other: z.number(),
    total: z.number(),
  }),
})

export type TripPlan = z.infer<typeof tripPlanSchema>
export type TripDay = z.infer<typeof daySchema>
export type TripActivity = z.infer<typeof activitySchema>
export type TripAccommodation = z.infer<typeof accommodationSchema>
