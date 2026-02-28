import { streamText, tool, stepCountIs } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { createClient } from "@/lib/supabase/server"
import { REPLAN_SYSTEM_PROMPT } from "@/lib/ai/travel-prompts"
import { tripPlanSchema } from "@/lib/ai/travel-schemas"
import { saveTripPlan, saveConversation } from "@/lib/ai/save-trip-plan"
import { z } from "zod"

export const maxDuration = 60

const requestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string(),
  })).min(1).max(50),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: tripId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  // Verify trip belongs to user
  const { data: trip } = await supabase
    .from("trips")
    .select("id")
    .eq("id", tripId)
    .eq("user_id", user.id)
    .single()

  if (!trip) {
    return new Response("Trip not found", { status: 404 })
  }

  const body = await req.json()
  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return new Response("Invalid request body", { status: 400 })
  }

  const { messages } = parsed.data

  // Load existing trip context
  const { data: days } = await supabase
    .from("trip_days")
    .select("*, trip_activities(*)")
    .eq("trip_id", tripId)
    .order("day_number")

  const existingPlanContext = JSON.stringify(days, null, 2)

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: `${REPLAN_SYSTEM_PROMPT}\n\nExisting trip plan:\n${existingPlanContext}`,
    messages,
    tools: {
      generate_trip_plan: tool({
        description: "Generate the complete modified trip plan. Include ALL days (both changed and unchanged).",
        inputSchema: tripPlanSchema,
        execute: async (plan) => {
          await saveTripPlan(supabase, tripId, plan)
          await saveConversation(supabase, tripId, messages)
          return plan
        },
      }),
    },
    stopWhen: stepCountIs(2),
  })

  return result.toTextStreamResponse()
}
