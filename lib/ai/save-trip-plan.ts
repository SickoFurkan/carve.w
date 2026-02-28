import type { TripPlan } from "@/lib/ai/travel-schemas"

type SupabaseClient = Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>

export async function saveTripPlan(
  supabase: SupabaseClient,
  tripId: string,
  plan: TripPlan
) {
  // Update trip metadata
  const { error: updateError } = await supabase
    .from("trips")
    .update({
      title: plan.title,
      destination: plan.destination,
      total_budget: plan.budget_breakdown.total,
      status: "planned",
    })
    .eq("id", tripId)

  if (updateError) {
    console.error("Failed to update trip:", updateError)
    throw new Error("Failed to save trip plan")
  }

  // Delete existing days/activities for this trip (for replanning)
  await supabase.from("trip_days").delete().eq("trip_id", tripId)
  await supabase.from("trip_accommodations").delete().eq("trip_id", tripId)

  // Insert days and activities
  for (const day of plan.days) {
    const { data: dayRow, error: dayError } = await supabase
      .from("trip_days")
      .insert({
        trip_id: tripId,
        day_number: day.day_number,
        title: day.title,
      })
      .select("id")
      .single()

    if (dayError || !dayRow) {
      console.error("Failed to insert day:", dayError)
      continue
    }

    if (day.activities.length > 0) {
      const activities = day.activities.map((act, idx) => ({
        day_id: dayRow.id,
        time_slot: act.time_slot,
        title: act.title,
        description: act.description,
        location_name: act.location_name,
        latitude: act.latitude,
        longitude: act.longitude,
        estimated_cost: act.estimated_cost,
        cost_category: act.cost_category,
        duration_minutes: act.duration_minutes,
        order_index: idx,
      }))

      const { error: actError } = await supabase.from("trip_activities").insert(activities)
      if (actError) console.error("Failed to insert activities:", actError)
    }
  }

  // Insert accommodations
  if (plan.accommodations.length > 0) {
    const accommodations = plan.accommodations.map((acc) => ({
      trip_id: tripId,
      name: acc.name,
      price_per_night: acc.price_per_night,
      rating: acc.rating,
      price_tier: acc.price_tier,
      booking_url: acc.booking_url,
      latitude: acc.latitude,
      longitude: acc.longitude,
      distance_to_center: acc.distance_to_center,
    }))

    const { error: accError } = await supabase.from("trip_accommodations").insert(accommodations)
    if (accError) console.error("Failed to insert accommodations:", accError)
  }
}

export async function saveConversation(
  supabase: SupabaseClient,
  tripId: string,
  messages: Array<{ role: string; content: string }>
) {
  const toInsert = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .filter((m) => m.content && m.content.trim().length > 0)
    .map((m) => ({
      trip_id: tripId,
      role: m.role,
      content: m.content,
    }))

  if (toInsert.length > 0) {
    // Delete existing conversations for this trip first (overwrite)
    await supabase.from("trip_conversations").delete().eq("trip_id", tripId)
    await supabase.from("trip_conversations").insert(toInsert)
  }
}
