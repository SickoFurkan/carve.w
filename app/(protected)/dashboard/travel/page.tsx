import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function TravelPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/dashboard/login")

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Carve Travel
        </h1>
        <p className="text-[#9da6b9] mt-1">Your AI-powered travel planner</p>
      </div>

      <Link href="/dashboard/travel/new">
        <div className="rounded-xl p-5 bg-[#1c1f27] border border-white/[0.06] hover:border-[#b8d8e8]/30 transition-colors cursor-pointer text-center py-16">
          <div className="text-4xl mb-4">✈</div>
          <h3 className="text-lg font-semibold text-white">
            Plan a new trip
          </h3>
          <p className="text-[#9da6b9] text-sm mt-1">
            Tell the AI where you want to go and get a complete travel plan
          </p>
        </div>
      </Link>
    </div>
  )
}
