import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileHeader } from "@/components/dashboard/profile-header";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { SocialFeedHighlights } from "@/components/dashboard/SocialFeedHighlights";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, avatar_image_url")
    .eq("id", user.id)
    .single();

  // Fetch user stats
  const { data: stats } = await supabase
    .from("user_stats")
    .select(
      "level, total_xp, current_workout_streak, longest_workout_streak, total_workouts"
    )
    .eq("user_id", user.id)
    .single();

  // Calculate workouts this week
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const { count: workoutsThisWeek } = await supabase
    .from("workouts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", startOfWeek.toISOString());

  // Fetch friend highlights from activity feed
  // First get friend IDs
  const { data: friendships } = await supabase
    .from("friendships")
    .select("user_id, friend_id")
    .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
    .eq("status", "accepted");

  let friendHighlights: any[] = [];
  if (friendships && friendships.length > 0) {
    const friendIds = friendships.map((f) =>
      f.user_id === user.id ? f.friend_id : f.user_id
    );

    const { data: activities } = await supabase
      .from("activity_feed")
      .select(
        `
        id,
        user_id,
        activity_type,
        activity_data,
        is_public,
        created_at,
        profile:profiles!activity_feed_user_id_fkey(username, display_name)
      `
      )
      .in("user_id", friendIds)
      .in("activity_type", ["pr", "achievement", "level_up"])
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(10);

    friendHighlights = (activities || []).map((activity: any) => ({
      ...activity,
      profile: Array.isArray(activity.profile) ? activity.profile[0] : activity.profile,
    }));
  }

  // MOCK DATA - Use this for testing
  const useMockData = false;

  const mockProfile = {
    username: "fitness_warrior",
    display_name: "Alex Johnson",
    avatar_image_url: null,
  };

  const mockStats = {
    level: 8,
    total_xp: 2850,
    current_workout_streak: 7,
    longest_workout_streak: 14,
    total_workouts: 52,
  };

  const mockWorkoutsThisWeek = 4;

  const mockFriendHighlights = [
    {
      id: "1",
      user_id: "friend-1",
      username: "sarah_fit",
      display_name: "Sarah Martinez",
      avatar_image_url: null,
      activity_type: "pr" as const,
      activity_data: {
        exercise_name: "Bench Press",
        weight: 185,
        reps: 5,
        weight_unit: "lbs",
      },
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    },
    {
      id: "2",
      user_id: "friend-2",
      username: "mike_gains",
      display_name: "Mike Chen",
      avatar_image_url: null,
      activity_type: "level_up" as const,
      activity_data: {
        old_level: 9,
        new_level: 10,
      },
      created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    },
    {
      id: "3",
      user_id: "friend-3",
      username: "emma_strong",
      display_name: "Emma Williams",
      avatar_image_url: null,
      activity_type: "achievement" as const,
      activity_data: {
        achievement_name: "Week Warrior",
        tier: "silver",
      },
      created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    },
    {
      id: "4",
      user_id: "friend-4",
      username: "john_lifts",
      display_name: "John Davis",
      avatar_image_url: null,
      activity_type: "pr" as const,
      activity_data: {
        exercise_name: "Deadlift",
        weight: 405,
        reps: 1,
        weight_unit: "lbs",
      },
      created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    },
    {
      id: "5",
      user_id: "friend-5",
      username: "lisa_athlete",
      display_name: "Lisa Thompson",
      avatar_image_url: null,
      activity_type: "achievement" as const,
      activity_data: {
        achievement_name: "Getting Strong",
        tier: "bronze",
      },
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
  ];

  // Use mock or real data
  const displayProfile = useMockData ? mockProfile : profile;
  const displayStats = useMockData ? mockStats : stats;
  const displayWorkoutsThisWeek = useMockData ? mockWorkoutsThisWeek : workoutsThisWeek;
  const displayFriendHighlights = useMockData ? mockFriendHighlights : friendHighlights;

  return (
    <div className="container mx-auto max-w-7xl space-y-8 p-6">
      {/* Split-Screen Layout */}
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* Left Column (2/3 width) */}
        <div className="flex-1 space-y-8 lg:flex-[2]">
          {/* Profile Header */}
          <ProfileHeader
            username={displayProfile?.username || "user"}
            displayName={displayProfile?.display_name || "User"}
            avatarUrl={displayProfile?.avatar_image_url}
            level={displayStats?.level || 1}
            totalXp={displayStats?.total_xp || 0}
          />

          {/* Stats Grid */}
          <StatsGrid
            currentStreak={displayStats?.current_workout_streak || 0}
            longestStreak={displayStats?.longest_workout_streak || 0}
            totalWorkouts={displayStats?.total_workouts || 0}
            workoutsThisWeek={displayWorkoutsThisWeek || 0}
            totalXp={displayStats?.total_xp || 0}
            level={displayStats?.level || 1}
          />
        </div>

        {/* Right Column (1/3 width) */}
        <div className="w-full lg:w-96 lg:flex-shrink-0">
          <SocialFeedHighlights activities={displayFriendHighlights || []} />
        </div>
      </div>
    </div>
  );
}
