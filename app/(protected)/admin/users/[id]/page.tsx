import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { UserEditForm } from "@/components/admin/users/user-edit-form";
import { UserActions } from "@/components/admin/users/user-actions";

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch user details
  const { data: user, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      email,
      display_name,
      username,
      role,
      bio,
      created_at,
      updated_at,
      last_active_at,
      is_active,
      is_banned
    `
    )
    .eq("id", id)
    .single();

  if (error || !user) {
    notFound();
  }

  // Fetch user stats
  const { data: stats } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", id)
    .single();

  // Fetch recent workouts
  const { data: workouts } = await supabase
    .from("workouts")
    .select("id, name, created_at, duration")
    .eq("user_id", id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Fetch recent activity
  const { data: activities } = await supabase
    .from("activity_log")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="h-full overflow-y-auto bg-[#0a0e1a]">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin/users"
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">
              {user.display_name || user.username || "Anonymous"}
            </h1>
            <p className="mt-1 text-sm text-white/60">{user.email}</p>
          </div>
        </div>

        {/* User Status & Actions */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Status Badges */}
          <div className="flex gap-2">
            <span
              className={`inline-flex px-3 py-1.5 text-sm font-semibold rounded-full ${
                user.role === "admin"
                  ? "bg-purple-500/20 text-purple-300"
                  : user.role === "dedicated"
                  ? "bg-blue-500/20 text-blue-300"
                  : "bg-white/10 text-white/80"
              }`}
            >
              {user.role}
            </span>
            {user.is_banned ? (
              <span className="inline-flex px-3 py-1.5 text-sm font-semibold rounded-full bg-red-500/20 text-red-300">
                Banned
              </span>
            ) : user.is_active ? (
              <span className="inline-flex px-3 py-1.5 text-sm font-semibold rounded-full bg-green-500/20 text-green-300">
                Active
              </span>
            ) : (
              <span className="inline-flex px-3 py-1.5 text-sm font-semibold rounded-full bg-white/10 text-white/60">
                Inactive
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="ml-auto">
            <UserActions
              userId={user.id}
              isBanned={user.is_banned}
              displayName={user.display_name || user.username || "this user"}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - User Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Editable Profile Information */}
            <UserEditForm user={user} />

            {/* Account Metadata */}
            <Card className="bg-[#1a1f2e] border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Account Metadata
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-white/60 mb-1">Joined</div>
                  <div className="text-white">
                    {new Date(user.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-white/60 mb-1">Last Active</div>
                  <div className="text-white">
                    {user.last_active_at
                      ? new Date(user.last_active_at).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      : "Never"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-white/60 mb-1">Last Updated</div>
                  <div className="text-white">
                    {user.updated_at
                      ? new Date(user.updated_at).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      : "Never"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-white/60 mb-1">Account Age</div>
                  <div className="text-white">
                    {Math.floor(
                      (Date.now() - new Date(user.created_at).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    days
                  </div>
                </div>
              </div>
            </Card>

            {/* Recent Workouts */}
            <Card className="bg-[#1a1f2e] border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Recent Workouts
              </h2>
              {workouts && workouts.length > 0 ? (
                <div className="space-y-3">
                  {workouts.map((workout) => (
                    <div
                      key={workout.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div>
                        <div className="text-white font-medium">
                          {workout.name}
                        </div>
                        <div className="text-sm text-white/60">
                          {new Date(workout.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-white/60 text-sm">
                        {workout.duration} min
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-white/60">
                  No workouts yet
                </div>
              )}
            </Card>

            {/* Activity Log */}
            <Card className="bg-[#1a1f2e] border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Recent Activity
              </h2>
              {activities && activities.length > 0 ? (
                <div className="space-y-2">
                  {activities.map((activity, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="flex-1">
                        <div className="text-white text-sm">
                          {activity.action || "Activity"}
                        </div>
                        <div className="text-xs text-white/60">
                          {new Date(activity.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-white/60">
                  No recent activity
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-6">
            {/* Stats Card */}
            <Card className="bg-[#1a1f2e] border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Statistics</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                  <div className="text-sm text-white/80 mb-1">Level</div>
                  <div className="text-3xl font-bold text-white">
                    {stats?.level || 1}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/20 to-teal-500/20 border border-blue-500/30">
                  <div className="text-sm text-white/80 mb-1">Total XP</div>
                  <div className="text-2xl font-bold text-white">
                    {stats?.total_xp?.toLocaleString() || 0}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
                  <div className="text-sm text-white/80 mb-1">
                    Total Workouts
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {stats?.total_workouts || 0}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30">
                  <div className="text-sm text-white/80 mb-1">Current Streak</div>
                  <div className="text-2xl font-bold text-white">
                    {stats?.current_streak || 0} days
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
                  <div className="text-sm text-white/80 mb-1">Longest Streak</div>
                  <div className="text-2xl font-bold text-white">
                    {stats?.longest_streak || 0} days
                  </div>
                </div>
              </div>
            </Card>

            {/* Account Status */}
            <Card className="bg-[#1a1f2e] border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Account Status
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="text-sm text-white/60">Active</span>
                  <span
                    className={`text-sm font-semibold px-2 py-1 rounded ${
                      user.is_active
                        ? "bg-green-500/20 text-green-400"
                        : "bg-white/10 text-white/60"
                    }`}
                  >
                    {user.is_active ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="text-sm text-white/60">Banned</span>
                  <span
                    className={`text-sm font-semibold px-2 py-1 rounded ${
                      user.is_banned
                        ? "bg-red-500/20 text-red-400"
                        : "bg-white/10 text-white/60"
                    }`}
                  >
                    {user.is_banned ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="text-sm text-white/60">Role</span>
                  <span className="text-sm font-semibold text-white capitalize">
                    {user.role}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
