import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const createTripSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  destination: z.string().min(1).max(200).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  total_budget: z.number().optional(),
  currency: z.string().optional(),
})

// GET /api/travel/trips — list user's trips
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: trips, error } = await supabase
    .from("trips")
    .select("id, title, destination, start_date, end_date, total_budget, currency, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(trips)
}

// POST /api/travel/trips — create a new trip (draft)
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = createTripSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const { title, destination, start_date, end_date, total_budget, currency } = parsed.data

  const { data: trip, error } = await supabase
    .from("trips")
    .insert({
      user_id: user.id,
      title: title || "New Trip",
      destination: destination || "TBD",
      start_date: start_date || null,
      end_date: end_date || null,
      total_budget: total_budget || null,
      currency: currency || "EUR",
      status: "planned",
    })
    .select("id")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(trip, { status: 201 })
}

// DELETE /api/travel/trips — delete a trip by id (query param)
export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const tripId = req.nextUrl.searchParams.get("id")
  if (!tripId) {
    return NextResponse.json({ error: "Missing trip id" }, { status: 400 })
  }

  const { error } = await supabase
    .from("trips")
    .delete()
    .eq("id", tripId)
    .eq("user_id", user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
