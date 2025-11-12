import { createClient } from "@/lib/supabase/server";

export default async function AdminFeedbackPage() {
  const supabase = await createClient();

  const { data: feedback } = await supabase
    .from("feedback")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-gray-900">User Feedback</h1>
          <p className="mt-2 text-sm text-gray-600">
            Review and respond to user feedback
          </p>
        </div>

        <div className="space-y-4">
          {feedback && feedback.length > 0 ? (
            feedback.map((item) => (
              <div key={item.id} className="rounded border border-gray-200 bg-white p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.type === "bug"
                          ? "bg-red-100 text-red-800"
                          : item.type === "feature"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {item.type}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.status === "new"
                          ? "bg-yellow-100 text-yellow-800"
                          : item.status === "reviewed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="font-medium text-gray-900 mb-1">
                      From: {item.name} ({item.email})
                    </div>
                    <p className="text-gray-700">{item.message}</p>
                    {item.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-600">
                        <strong>Internal Notes:</strong> {item.notes}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              No feedback submissions yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
