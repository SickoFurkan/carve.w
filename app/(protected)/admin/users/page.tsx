import { createClient } from "@/lib/supabase/server";
import { UserSearch } from "@/components/admin/users/user-search";
import { UserFilters } from "@/components/admin/users/user-filters";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Suspense } from "react";

interface SearchParams {
  q?: string;
  status?: string;
  role?: string;
  page?: string;
  sort?: string;
  order?: "asc" | "desc";
}

interface AdminUsersPageProps {
  searchParams: Promise<SearchParams>;
}

const USERS_PER_PAGE = 50;

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const status = params.status || "all";
  const role = params.role || "all";
  const page = parseInt(params.page || "1");
  const sortBy = params.sort || "created_at";
  const sortOrder = params.order || "desc";

  const supabase = await createClient();

  // Calculate pagination
  const from = (page - 1) * USERS_PER_PAGE;
  const to = from + USERS_PER_PAGE - 1;

  // Build query
  let usersQuery = supabase
    .from("profiles")
    .select(
      `
      id,
      email,
      display_name,
      username,
      role,
      created_at,
      last_active_at,
      is_active,
      is_banned
    `,
      { count: "exact" }
    )
    .range(from, to)
    .order(sortBy as any, { ascending: sortOrder === "asc" });

  // Apply search filter
  if (query) {
    usersQuery = usersQuery.or(
      `email.ilike.%${query}%,username.ilike.%${query}%,display_name.ilike.%${query}%`
    );
  }

  // Apply status filter
  if (status !== "all") {
    if (status === "banned") {
      usersQuery = usersQuery.eq("is_banned", true);
    } else if (status === "active") {
      usersQuery = usersQuery.eq("is_active", true).eq("is_banned", false);
    } else if (status === "inactive") {
      usersQuery = usersQuery.eq("is_active", false).eq("is_banned", false);
    }
  }

  // Apply role filter
  if (role !== "all") {
    usersQuery = usersQuery.eq("role", role);
  }

  const { data: users, count } = await usersQuery;

  const totalPages = Math.ceil((count || 0) / USERS_PER_PAGE);

  return (
    <div className="h-full overflow-y-auto bg-[#0a0e1a]">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">User Management</h1>
            <p className="mt-2 text-sm text-white/60">
              Manage user accounts, roles, and permissions
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Card
                  key={i}
                  className="bg-[#1a1f2e] border-white/10 p-6 h-24 animate-pulse"
                />
              ))}
            </div>
          }
        >
          <UserStatsCards />
        </Suspense>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-[#1a1f2e] p-4 rounded-xl border border-white/10">
          <UserSearch />
          <UserFilters />
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between text-sm text-white/60">
          <div>
            Showing {from + 1}-{Math.min(to + 1, count || 0)} of {count || 0}{" "}
            users
          </div>
          <div>
            Page {page} of {totalPages}
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-xl border border-white/10 bg-[#1a1f2e] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {users && users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-white">
                            {user.display_name || user.username || "Anonymous"}
                          </div>
                          <div className="text-sm text-white/60">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === "admin"
                              ? "bg-purple-500/20 text-purple-300"
                              : user.role === "dedicated"
                              ? "bg-blue-500/20 text-blue-300"
                              : "bg-white/10 text-white/80"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60">
                        {user.last_active_at
                          ? new Date(user.last_active_at).toLocaleDateString()
                          : "Never"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.is_banned ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-500/20 text-red-300">
                            Banned
                          </span>
                        ) : user.is_active ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-300">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-white/10 text-white/60">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-sm text-white/60"
                    >
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Link
              href={`?${new URLSearchParams({
                ...params,
                page: Math.max(1, page - 1).toString(),
              }).toString()}`}
              className={`px-4 py-2 rounded-lg border border-white/10 text-white transition-colors ${
                page === 1
                  ? "opacity-50 pointer-events-none"
                  : "hover:bg-white/5"
              }`}
            >
              Previous
            </Link>

            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pageNum = page - 2 + i;
              if (pageNum < 1 || pageNum > totalPages) return null;

              return (
                <Link
                  key={pageNum}
                  href={`?${new URLSearchParams({
                    ...params,
                    page: pageNum.toString(),
                  }).toString()}`}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    pageNum === page
                      ? "bg-purple-500 border-purple-500 text-white"
                      : "border-white/10 text-white hover:bg-white/5"
                  }`}
                >
                  {pageNum}
                </Link>
              );
            })}

            <Link
              href={`?${new URLSearchParams({
                ...params,
                page: Math.min(totalPages, page + 1).toString(),
              }).toString()}`}
              className={`px-4 py-2 rounded-lg border border-white/10 text-white transition-colors ${
                page === totalPages
                  ? "opacity-50 pointer-events-none"
                  : "hover:bg-white/5"
              }`}
            >
              Next
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// Stats Cards Component (Server Component)
async function UserStatsCards() {
  const supabase = await createClient();

  // Get total users
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  // Get users created today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count: newToday } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", today.toISOString());

  // Get active users in last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { count: active7d } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("last_active_at", sevenDaysAgo.toISOString());

  const stats = [
    {
      label: "Total Users",
      value: totalUsers || 0,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      label: "New Today",
      value: newToday || 0,
      gradient: "from-blue-500 to-teal-500",
    },
    {
      label: "Active (7d)",
      value: active7d || 0,
      gradient: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="bg-[#1a1f2e] border-white/10 p-6 relative overflow-hidden"
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-10`}
          />
          <div className="relative">
            <div className="text-sm text-white/60 mb-1">{stat.label}</div>
            <div className="text-3xl font-bold text-white">{stat.value}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}
