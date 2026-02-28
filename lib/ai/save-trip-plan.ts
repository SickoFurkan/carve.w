import type { TripPlan } from "@/lib/ai/travel-schemas"

type SupabaseClient = Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>

export async function saveTripPlan(
  supabase: SupabaseClient,
  tripId: string,
  plan: TripPlan
) {
  const { error } = await supabase.rpc("save_trip_plan", {
    p_trip_id: tripId,
    p_title: plan.title,
    p_destination: plan.destination,
    p_total_budget: plan.budget_breakdown.total,
    p_days: JSON.stringify(plan.days),
    p_accommodations: JSON.stringify(plan.accommodations),
  })

  if (error) {
    console.error("Failed to save trip plan:", error)
    throw new Error("Failed to save trip plan")
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
    await supabase.from("trip_conversations").delete().eq("trip_id", tripId)
    await supabase.from("trip_conversations").insert(toInsert)
  }
}
