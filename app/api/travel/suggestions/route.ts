import { generateObject } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/ai/rate-limit"

const suggestionsSchema = z.object({
  activities: z.array(z.object({
    title: z.string(),
    description: z.string(),
    time_slot: z.enum(["morning", "afternoon", "evening"]),
    location_name: z.string(),
    estimated_cost: z.number(),
    cost_category: z.enum(["food", "activity", "transport", "shopping", "other"]),
    duration_minutes: z.number(),
  })),
})

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { allowed } = checkRateLimit(user.id, "travel-suggestions", 30)
  if (!allowed) {
    return new Response("Rate limit exceeded", { status: 429 })
  }

  const { destination, days } = await req.json()

  if (!destination || typeof destination !== "string") {
    return new Response("Destination required", { status: 400 })
  }

  const numDays = days || 1

  const { object } = await generateObject({
    model: anthropic("claude-sonnet-4-20250514"),
    schema: suggestionsSchema,
    prompt: `You are a travel expert. Suggest ${Math.min(numDays * 3, 8)} activities for a solo traveler visiting ${destination}.

Include a good mix:
- 1-2 must-see landmarks/attractions
- 1-2 local food experiences (specific restaurants, markets, or food tours)
- 1-2 cultural/off-the-beaten-path experiences
- 1 evening activity (bar, show, sunset spot)

For each activity provide realistic costs in EUR. Spread activities across morning, afternoon, and evening time slots.
Keep descriptions to 1-2 sentences. Be specific — name actual places, not generic suggestions.`,
  })

  return Response.json(object)
}
