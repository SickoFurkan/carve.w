import { streamText, tool, stepCountIs } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { createClient } from "@/lib/supabase/server"
import { TRAVEL_SYSTEM_PROMPT } from "@/lib/ai/travel-prompts"
import { tripPlanSchema, type TripPlan } from "@/lib/ai/travel-schemas"
import { saveTripPlan, saveConversation } from "@/lib/ai/save-trip-plan"
import { checkRateLimit } from "@/lib/ai/rate-limit"

export const maxDuration = 60

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { allowed, retryAfterMs } = checkRateLimit(user.id, "travel-chat", 20)
  if (!allowed) {
    return new Response("Rate limit exceeded", {
      status: 429,
      headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
    })
  }

  const body = await req.json()
  const { messages, tripId } = body as { messages: Array<{ role: string; content: string }>; tripId?: string }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return new Response("Messages required", { status: 400 })
  }

  if (tripId) {
    const { data: trip } = await supabase
      .from("trips")
      .select("id")
      .eq("id", tripId)
      .eq("user_id", user.id)
      .single()

    if (!trip) {
      return new Response("Trip not found", { status: 404 })
    }
  }

  // Convert to model messages format
  const modelMessages = messages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }))

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: TRAVEL_SYSTEM_PROMPT,
    messages: modelMessages,
    tools: {
      generate_trip_plan: tool({
        description: "Generate a complete trip plan with daily activities, accommodations, and budget breakdown. Call this when you have enough information to create the plan.",
        inputSchema: tripPlanSchema,
      }),
    },
    stopWhen: stepCountIs(2),
  })

  return result.toUIMessageStreamResponse()
}
