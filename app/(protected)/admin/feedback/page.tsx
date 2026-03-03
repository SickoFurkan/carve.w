import { createClient } from "@/lib/supabase/server";

export default async function AdminFeedbackPage() {
  const supabase = await createClient();

  const { data: feedback } = await supabase
    .from("feedback")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto">
        <div className="border-b border-white/[0.06] pb-4">
          <h1 className="text-3xl font-bold text-white tracking-tight">User Feedback</h1>
          <p className="text-[#9da6b9] mt-1">
            Review and respond to user feedback
          </p>
        </div>

        <div className="space-y-4">
          {feedback && feedback.length > 0 ? (
            feedback.map((item) => (
              <div key={item.id} className="bg-[#1c1f27] border border-white/[0.06] rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.type === "bug"
                          ? "bg-rose-500/10 text-rose-400"
                          : item.type === "feature"
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-white/5 text-slate-500"
                      }`}>
                        {item.type}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.status === "new"
                          ? "bg-amber-500/10 text-amber-400"
                          : item.status === "reviewed"
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-emerald-500/10 text-emerald-400"
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="font-medium text-white mb-1">
                      From: {item.name} ({item.email})
                    </div>
                    <p className="text-[#9da6b9]">{item.message}</p>
                    {item.notes && (
                      <div className="mt-3 p-3 bg-white/5 rounded text-sm text-[#9da6b9]">
                        <strong>Internal Notes:</strong> {item.notes}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-slate-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-500">
              No feedback submissions yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
