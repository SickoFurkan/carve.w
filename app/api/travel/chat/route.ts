import { streamText, tool } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { createClient } from "@/lib/supabase/server"
import { TRAVEL_SYSTEM_PROMPT } from "@/lib/ai/travel-prompts"
import { tripPlanSchema } from "@/lib/ai/travel-schemas"
import { saveTripPlan, saveConversation } from "@/lib/ai/save-trip-plan"
import { z } from "zod"

export const maxDuration = 60

const requestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string(),
  })).min(1).max(50),
  tripId: z.string().uuid().optional(),
})

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const body = await req.json()
  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return new Response("Invalid request body", { status: 400 })
  }

  const { messages, tripId } = parsed.data

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: TRAVEL_SYSTEM_PROMPT,
    messages,
    tools: {
      generate_trip_plan: tool({
        description: "Generate a complete trip plan with daily activities, accommodations, and budget breakdown. Call this when you have enough information to create the plan.",
        parameters: tripPlanSchema,
        execute: async (plan) => {
          if (tripId) {
            await saveTripPlan(supabase, tripId, plan)
            await saveConversation(supabase, tripId, messages)
          }
          return plan
        },
      }),
    },
    maxSteps: 2,
  })

  return result.toDataStreamResponse()
}
