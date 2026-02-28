import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/travel/preferences
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data } = await supabase
    .from("travel_preferences")
    .select("default_currency, travel_style")
    .eq("user_id", user.id)
    .single()

  return NextResponse.json(data || { default_currency: "EUR", travel_style: "mid-range" })
}

// PUT /api/travel/preferences
export async function PUT(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { default_currency, travel_style } = body

  const { data, error } = await supabase
    .from("travel_preferences")
    .upsert({
      user_id: user.id,
      default_currency: default_currency || "EUR",
      travel_style: travel_style || "mid-range",
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" })
    .select("default_currency, travel_style")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
