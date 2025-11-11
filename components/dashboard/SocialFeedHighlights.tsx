import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dumbbell,
  TrendingUp,
  Trophy,
  Zap,
  UserPlus,
  ArrowRight,
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

function getActivityIcon(type: string) {
  switch (type) {
    case "pr":
      return <TrendingUp className="w-4 h-4" />;
    case "achievement":
      return <Trophy className="w-4 h-4" />;
    case "level_up":
      return <Zap className="w-4 h-4" />;
    default:
      return <Dumbbell className="w-4 h-4" />;
  }
}

function getActivityGradient(type: string) {
  switch (type) {
    case "pr":
      return "from-yellow-500 to-orange-500";
    case "achievement":
      return "from-blue-500 to-cyan-500";
    case "level_up":
      return "from-green-500 to-emerald-500";
    default:
      return "from-purple-500 to-pink-500";
  }
}

function getActivityDescription(activity: ActivityFeedItem): string {
  const { activity_type, activity_data } = activity;
  const username = activity.profile?.display_name || activity.profile?.username || "Someone";

  switch (activity_type) {
    case "pr":
      return `${username} set a new PR on ${activity_data.exercise_name}!`;
    case "achievement":
      return `${username} unlocked: ${activity_data.achievement_name}`;
    case "level_up":
      return `${username} reached Level ${activity_data.new_level}!`;
    default:
      return `${username} had an activity`;
  }
}

export async function SocialFeedHighlights({
  activities,
}: {
  activities: ActivityFeedItem[];
}) {
  // Filter to only show highlights (PRs, achievements, level-ups)
  const highlights = activities.filter((a) =>
    ["pr", "achievement", "level_up"].includes(a.activity_type)
  );

  return (
    <Card className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Friend Highlights</h2>
        <Link href="/dashboard/social">
          <Button variant="ghost" size="sm">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {highlights.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
          <div className="w-12 h-12 rounded-full bg-muted mb-3 flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            No friend activity yet
          </p>
          <Link href="/dashboard/social/friends">
            <Button size="sm" variant="outline">
              Add Friends
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3 flex-1 overflow-auto">
          {highlights.slice(0, 10).map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-full bg-gradient-to-br ${getActivityGradient(
                  activity.activity_type
                )} flex items-center justify-center text-white flex-shrink-0`}
              >
                {getActivityIcon(activity.activity_type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-tight">
                  {getActivityDescription(activity)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(activity.created_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          ))}

          {highlights.length > 10 && (
            <Link href="/dashboard/social">
              <Button variant="ghost" size="sm" className="w-full mt-4">
                View All Activity
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      )}
    </Card>
  );
}
