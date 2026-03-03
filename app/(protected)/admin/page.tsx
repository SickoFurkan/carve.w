import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Fetch analytics data
  const [
    { count: totalUsers },
    { count: activeUsers },
    { count: totalWorkouts },
    { count: totalMeals },
    { count: wikiArticles },
    { count: pendingFeedback }
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).gte("last_active_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase.from("completed_workouts").select("*", { count: "exact", head: true }),
    supabase.from("meals").select("*", { count: "exact", head: true }),
    supabase.from("wiki_articles").select("*", { count: "exact", head: true }),
    supabase.from("feedback").select("*", { count: "exact", head: true }).eq("status", "new")
  ]);

  // Recent activity
  const { data: recentWorkouts } = await supabase
    .from("completed_workouts")
    .select("id, user_id, completed_date, workout_name, total_duration_minutes")
    .order("completed_date", { ascending: false })
    .limit(5);

  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("id, display_name, email, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="border-b border-white/[0.06] pb-4">
          <h1 className="text-3xl font-bold text-white tracking-tight">Admin Dashboard</h1>
          <p className="text-[#9da6b9] mt-1">
            Site analytics and management overview
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Total Users"
            value={totalUsers || 0}
            subtitle={`${activeUsers || 0} active (7 days)`}
            icon="👥"
          />
          <StatCard
            title="Total Workouts"
            value={totalWorkouts || 0}
            subtitle="All-time logged"
            icon="💪"
          />
          <StatCard
            title="Total Meals"
            value={totalMeals || 0}
            subtitle="All-time logged"
            icon="🍽️"
          />
          <StatCard
            title="Wiki Articles"
            value={wikiArticles || 0}
            subtitle="Published articles"
            icon="📚"
          />
          <StatCard
            title="Pending Feedback"
            value={pendingFeedback || 0}
            subtitle="Needs review"
            icon="💬"
            alert={!!pendingFeedback && pendingFeedback > 0}
          />
          <StatCard
            title="System Status"
            value="Healthy"
            subtitle="All systems operational"
            icon="✅"
          />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Workouts */}
          <div className="bg-[#1c1f27] border border-white/[0.06] rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-4">
              Recent Workouts
            </h2>
            <div className="space-y-3">
              {recentWorkouts && recentWorkouts.length > 0 ? (
                recentWorkouts.map((workout) => (
                  <div
                    key={workout.id}
                    className="flex items-center justify-between border-b border-white/[0.06] pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <div className="font-medium text-white">
                        {workout.workout_name}
                      </div>
                      <div className="text-sm text-[#9da6b9]">
                        {workout.total_duration_minutes} min •{" "}
                        {new Date(workout.completed_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No workouts yet</p>
              )}
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-[#1c1f27] border border-white/[0.06] rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-4">
              Recent Signups
            </h2>
            <div className="space-y-3">
              {recentUsers && recentUsers.length > 0 ? (
                recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between border-b border-white/[0.06] pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <div className="font-medium text-white">
                        {user.display_name || user.email || "Anonymous"}
                      </div>
                      <div className="text-sm text-[#9da6b9]">
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No users yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#1c1f27] border border-white/[0.06] rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickAction
              href="/admin/users"
              icon="👥"
              title="Manage Users"
              description="View and manage user accounts"
            />
            <QuickAction
              href="/admin/content"
              icon="📝"
              title="Moderate Content"
              description="Review wiki articles and edits"
            />
            <QuickAction
              href="/admin/feedback"
              icon="💬"
              title="Review Feedback"
              description="Check user feedback and reports"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  alert = false,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  alert?: boolean;
}) {
  return (
    <div className={`bg-[#1c1f27] border border-white/[0.06] rounded-xl p-5 ${alert ? "ring-1 ring-amber-500/30" : ""}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wider text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-white tracking-tight mt-2">{value}</p>
          <p className="mt-1 text-sm text-[#9da6b9]">{subtitle}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <a
      href={href}
      className="block bg-[#1c1f27] border border-white/[0.06] rounded-xl p-4 hover:bg-white/5 transition-colors"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <h3 className="font-medium text-white">{title}</h3>
          <p className="mt-1 text-sm text-[#9da6b9]">{description}</p>
        </div>
      </div>
    </a>
  );
}
