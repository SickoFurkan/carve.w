import { SupabaseClient } from "@supabase/supabase-js";

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

// ─── Dashboard Stats ────────────────────────────────────

export async function getAdminDashboardStats(supabase: SupabaseClient) {
  const [
    { count: totalUsers },
    { count: activeUsers7d },
    { count: newUsers7d },
    { count: totalWorkouts },
    { count: totalMeals },
    { count: totalArticles },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true })
      .gte("last_active_at", daysAgo(7)),
    supabase.from("profiles").select("*", { count: "exact", head: true })
      .gte("created_at", daysAgo(7)),
    supabase.from("completed_workouts").select("*", { count: "exact", head: true }),
    supabase.from("meals").select("*", { count: "exact", head: true }),
    supabase.from("wiki_articles").select("*", { count: "exact", head: true }),
  ]);

  // Previous period for trends
  const [
    { count: activeUsersPrev },
    { count: newUsersPrev },
    { count: workoutsPrev },
    { count: mealsPrev },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true })
      .gte("last_active_at", daysAgo(14)).lt("last_active_at", daysAgo(7)),
    supabase.from("profiles").select("*", { count: "exact", head: true })
      .gte("created_at", daysAgo(14)).lt("created_at", daysAgo(7)),
    supabase.from("completed_workouts").select("*", { count: "exact", head: true })
      .gte("created_at", daysAgo(14)).lt("created_at", daysAgo(7)),
    supabase.from("meals").select("*", { count: "exact", head: true })
      .gte("created_at", daysAgo(14)).lt("created_at", daysAgo(7)),
  ]);

  return {
    totalUsers: totalUsers ?? 0,
    activeUsers7d: activeUsers7d ?? 0,
    activeUsersPrev: activeUsersPrev ?? 0,
    newUsers7d: newUsers7d ?? 0,
    newUsersPrev: newUsersPrev ?? 0,
    totalWorkouts: totalWorkouts ?? 0,
    workoutsPrev: workoutsPrev ?? 0,
    totalMeals: totalMeals ?? 0,
    mealsPrev: mealsPrev ?? 0,
    totalArticles: totalArticles ?? 0,
  };
}

// ─── User Growth (chart) ───────────────────────────────

export async function getUserGrowthData(supabase: SupabaseClient, days = 30) {
  const { data } = await supabase
    .from("profiles")
    .select("created_at")
    .gte("created_at", daysAgo(days))
    .order("created_at", { ascending: true });

  if (!data) return [];

  const grouped: Record<string, number> = {};
  data.forEach((row) => {
    const date = new Date(row.created_at).toISOString().split("T")[0];
    grouped[date] = (grouped[date] || 0) + 1;
  });

  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000).toISOString().split("T")[0];
    result.push({ date, count: grouped[date] || 0 });
  }
  return result;
}

// ─── Activity Trends (chart) ───────────────────────────

export async function getActivityTrends(supabase: SupabaseClient, days = 30) {
  const [{ data: workouts }, { data: meals }] = await Promise.all([
    supabase.from("completed_workouts").select("created_at").gte("created_at", daysAgo(days)),
    supabase.from("meals").select("created_at").gte("created_at", daysAgo(days)),
  ]);

  const wByDay: Record<string, number> = {};
  const mByDay: Record<string, number> = {};

  (workouts || []).forEach((w) => {
    const d = new Date(w.created_at).toISOString().split("T")[0];
    wByDay[d] = (wByDay[d] || 0) + 1;
  });
  (meals || []).forEach((m) => {
    const d = new Date(m.created_at).toISOString().split("T")[0];
    mByDay[d] = (mByDay[d] || 0) + 1;
  });

  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000).toISOString().split("T")[0];
    result.push({ date, workouts: wByDay[date] || 0, meals: mByDay[date] || 0 });
  }
  return result;
}

// ─── Gamification Stats (chart) ────────────────────────
// Note: level and total_xp are on profiles, NOT user_stats

export async function getGamificationStats(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("profiles")
    .select("level");

  if (!data) return { levelDistribution: [], avgLevel: 0 };

  const buckets: Record<string, number> = { "1-5": 0, "6-10": 0, "11-20": 0, "21+": 0 };
  let totalLevel = 0;

  data.forEach((p) => {
    const lvl = p.level || 1;
    totalLevel += lvl;
    if (lvl <= 5) buckets["1-5"]++;
    else if (lvl <= 10) buckets["6-10"]++;
    else if (lvl <= 20) buckets["11-20"]++;
    else buckets["21+"]++;
  });

  return {
    levelDistribution: Object.entries(buckets).map(([range, count]) => ({ range, count })),
    avgLevel: data.length > 0 ? Math.round(totalLevel / data.length) : 0,
  };
}

// ─── Role Distribution (chart) ─────────────────────────
// Join profiles.user_role_id → user_roles.name

export async function getRoleDistribution(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("profiles")
    .select("user_role_id, user_roles(name)");

  if (!data) return [];

  const counts: Record<string, number> = {};
  data.forEach((p: any) => {
    const role = p.user_roles?.name || "user";
    counts[role] = (counts[role] || 0) + 1;
  });

  return Object.entries(counts).map(([role, count]) => ({ role, count }));
}

// ─── Recent Activity ───────────────────────────────────

export async function getRecentSignups(supabase: SupabaseClient, limit = 10) {
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, email, user_role_id, user_roles(name), created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data || [];
}

export async function getRecentWorkouts(supabase: SupabaseClient, limit = 10) {
  const { data } = await supabase
    .from("completed_workouts")
    .select("id, user_id, name, total_duration_minutes, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data || [];
}

// ─── Wiki Stats ────────────────────────────────────────

export async function getPopularArticles(supabase: SupabaseClient, limit = 5) {
  const { data } = await supabase
    .from("wiki_articles")
    .select("slug, title, view_count, category")
    .order("view_count", { ascending: false })
    .limit(limit);
  return data || [];
}

// ─── Feature Request Stats ─────────────────────────────

export async function getFeatureRequestStats(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("feature_requests")
    .select("status");

  if (!data) return { total: 0, byStatus: [] };

  const counts: Record<string, number> = {};
  data.forEach((fr: any) => {
    const status = fr.status || "new";
    counts[status] = (counts[status] || 0) + 1;
  });

  return {
    total: data.length,
    byStatus: Object.entries(counts).map(([status, count]) => ({ status, count })),
  };
}

// ─── Referral & Promo Stats ────────────────────────────

export async function getReferralStats(supabase: SupabaseClient) {
  const [
    { count: totalReferrals },
    { count: completedReferrals },
    { count: pendingReferrals },
    { data: promoCodes },
  ] = await Promise.all([
    supabase.from("referrals").select("*", { count: "exact", head: true }),
    supabase.from("referrals").select("*", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("referrals").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("promo_codes").select("current_redemptions, days_granted"),
  ]);

  const totalPromoRedemptions = (promoCodes || []).reduce((sum, pc) => sum + (pc.current_redemptions || 0), 0);
  const totalProDaysGranted =
    ((completedReferrals || 0) * 2 * 7) + // referrals: both parties get 7
    (promoCodes || []).reduce((sum, pc) => sum + (pc.current_redemptions || 0) * (pc.days_granted || 0), 0);

  return {
    totalReferrals: totalReferrals || 0,
    completedReferrals: completedReferrals || 0,
    pendingReferrals: pendingReferrals || 0,
    totalPromoRedemptions,
    totalProDaysGranted,
  };
}

export async function getReferralsList(supabase: SupabaseClient, limit = 50) {
  const { data } = await supabase
    .rpc("get_admin_referrals_list");

  return data || [];
}

export async function getPromoCodesList(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("promo_codes")
    .select("code, influencer_name, days_granted, current_redemptions, max_redemptions, is_active, show_in_picker, created_at")
    .order("current_redemptions", { ascending: false });

  return data || [];
}

// ─── Subscription Stats ────────────────────────────────

export async function getSubscriptionStats(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("user_subscriptions")
    .select("tier, will_renew, cancelled_at, trial_ends_at");

  if (!data) return { total: 0, tiers: [] };

  const tierCounts: Record<string, number> = {};
  data.forEach((s: any) => {
    const tier = s.tier || "free";
    tierCounts[tier] = (tierCounts[tier] || 0) + 1;
  });

  return {
    total: data.length,
    tiers: Object.entries(tierCounts).map(([tier, count]) => ({ tier, count })),
  };
}
