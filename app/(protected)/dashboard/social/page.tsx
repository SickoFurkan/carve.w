import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dumbbell,
  TrendingUp,
  Trophy,
  Utensils,
  Zap,
  UserPlus,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityFeedItem {
  id: string;
  user_id: string;
  activity_type: "workout" | "pr" | "achievement" | "level_up" | "meal";
  activity_data: any;
  is_public: boolean;
  created_at: string;
  profile?: {
    username: string;
    display_name: string | null;
  };
}

async function getFriendActivityFeed(userId: string): Promise<ActivityFeedItem[]> {
  const supabase = await createClient();

  // Get friend IDs
  const { data: friendships } = await supabase
    .from("friendships")
    .select("user_id, friend_id")
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
    .eq("status", "accepted");

  if (!friendships || friendships.length === 0) {
    return [];
  }

  // Extract friend IDs
  const friendIds = friendships.map((f) =>
    f.user_id === userId ? f.friend_id : f.user_id
  );

  // Get activity feed for friends
  const { data: activities, error } = await supabase
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
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching activity feed:", error);
    return [];
  }

  return (activities || []).map((activity: any) => ({
    ...activity,
    profile: Array.isArray(activity.profile) ? activity.profile[0] : activity.profile,
  }));
}

function getActivityIcon(type: string) {
  switch (type) {
    case "workout":
      return <Dumbbell className="w-4 h-4" />;
    case "pr":
      return <TrendingUp className="w-4 h-4" />;
    case "achievement":
      return <Trophy className="w-4 h-4" />;
    case "level_up":
      return <Zap className="w-4 h-4" />;
    case "meal":
      return <Utensils className="w-4 h-4" />;
    default:
      return <Dumbbell className="w-4 h-4" />;
  }
}

function getActivityGradient(type: string) {
  switch (type) {
    case "workout":
      return "from-purple-500 to-pink-500";
    case "pr":
      return "from-yellow-500 to-orange-500";
    case "achievement":
      return "from-blue-500 to-cyan-500";
    case "level_up":
      return "from-green-500 to-emerald-500";
    case "meal":
      return "from-green-400 to-teal-400";
    default:
      return "from-gray-500 to-gray-600";
  }
}

function getActivityDescription(activity: ActivityFeedItem): string {
  const { activity_type, activity_data } = activity;
  const username = activity.profile?.display_name || activity.profile?.username || "Someone";

  switch (activity_type) {
    case "workout":
      return `${username} completed a workout${
        activity_data.workout_name ? `: ${activity_data.workout_name}` : ""
      }`;
    case "pr":
      return `${username} set a new PR on ${activity_data.exercise_name}: ${activity_data.weight} ${activity_data.weight_unit}!`;
    case "achievement":
      return `${username} unlocked: ${activity_data.achievement_name}`;
    case "level_up":
      return `${username} leveled up to Level ${activity_data.new_level}!`;
    case "meal":
      return `${username} logged a ${activity_data.meal_type}`;
    default:
      return `${username} had an activity`;
  }
}

export default async function SocialFeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const activities = await getFriendActivityFeed(user.id);

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Social Feed</h1>
          <p className="text-muted-foreground">
            See what your friends are up to
          </p>
        </div>
        <Link href="/dashboard/social/friends">
          <Button variant="outline">
            <UserPlus className="w-4 h-4 mr-2" />
            Manage Friends
          </Button>
        </Link>
      </div>

      {/* Activity Feed */}
      {activities.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <Dumbbell className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
          <p className="text-muted-foreground mb-4">
            Add friends to see their fitness journey!
          </p>
          <Link href="/dashboard/social/friends">
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Friends
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <Card key={activity.id} className="p-5">
              <div className="flex items-start gap-4">
                {/* Activity Icon */}
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${getActivityGradient(
                    activity.activity_type
                  )} flex items-center justify-center text-white flex-shrink-0`}
                >
                  {getActivityIcon(activity.activity_type)}
                </div>

                {/* Activity Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm mb-1">
                    {getActivityDescription(activity)}
                  </p>

                  {/* Additional Details */}
                  {activity.activity_data.xp_earned && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                        +{activity.activity_data.xp_earned} XP
                      </span>
                    </div>
                  )}

                  {/* Timestamp */}
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(activity.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
