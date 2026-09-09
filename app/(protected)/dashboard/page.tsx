import { redirect } from "next/navigation"

// @ai-why: /dashboard stuurt door naar de cockpit op de wortel (TDR-0008).
// /dashboard is reserved for admin use only.
export default function DashboardPage() {
  redirect("/")
}
