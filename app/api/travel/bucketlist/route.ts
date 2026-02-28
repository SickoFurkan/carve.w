import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const createSchema = z.object({
  type: z.enum(["destination", "experience"]).default("destination"),
  title: z.string().min(1).max(200),
  destination: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
})

// GET — list user's bucketlist items
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data, error } = await supabase
    .from("bucketlist_items")
    .select("id, type, title, destination, description, completed, trip_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST — create a new bucketlist item
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 })

  const { data, error } = await supabase
    .from("bucketlist_items")
    .insert({ user_id: user.id, ...parsed.data })
    .select("id")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

// DELETE — delete a bucketlist item by id
export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const itemId = req.nextUrl.searchParams.get("id")
  if (!itemId) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const { error } = await supabase
    .from("bucketlist_items")
    .delete()
    .eq("id", itemId)
    .eq("user_id", user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

// PATCH — update a bucketlist item (mark completed, link trip)
export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { id, completed, trip_id } = body as { id: string; completed?: boolean; trip_id?: string }
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const updates: Record<string, unknown> = {}
  if (completed !== undefined) updates.completed = completed
  if (trip_id !== undefined) updates.trip_id = trip_id

  const { error } = await supabase
    .from("bucketlist_items")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
