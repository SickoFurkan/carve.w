import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ChatLayout } from "@/components/chat/ChatLayout"
import { isAdmin } from "@/lib/admin/auth"

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  const userName = profile?.display_name || user.user_metadata?.full_name || 'User'

  // @ai-why: Op de server, want de rol staat in de database en een client mag daar niet
  // over beslissen. Zie app/actions/admin/overview.ts voor de controle die echt telt.
  const admin = await isAdmin()

  return <ChatLayout userId={user.id} userName={userName} isAdmin={admin} />
}
