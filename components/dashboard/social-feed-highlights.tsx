"use client";

import { Award, TrendingUp, Star, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

type ActivityType = "pr" | "achievement" | "level_up";

interface Activity {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  avatar_image_url?: string | null;
  activity_type: ActivityType;
  activity_data: Record<string, any>;
  created_at: string;
}

interface SocialFeedHighlightsProps {
  activities: Activity[];
}

function getActivityIcon(type: ActivityType) {
  switch (type) {
    case "pr":
      return TrendingUp;
    case "achievement":
      return Award;
    case "level_up":
      return Star;
    default:
      return Award;
  }
}

function getActivityText(activity: Activity): string {
  const { activity_type, activity_data } = activity;

  switch (activity_type) {
    case "pr":
      return `set a new PR: ${activity_data.exercise_name} - ${activity_data.weight}${activity_data.weight_unit} × ${activity_data.reps} reps`;
    case "achievement":
      return `unlocked "${activity_data.achievement_name}" (${activity_data.tier})`;
    case "level_up":
      return `leveled up to Level ${activity_data.new_level}!`;
    default:
      return "did something awesome";
  }
}

function getActivityColor(type: ActivityType): string {
  switch (type) {
    case "pr":
      return "from-orange-500 to-red-500";
    case "achievement":
      return "from-amber-400 to-yellow-500";
    case "level_up":
      return "from-purple-500 to-pink-500";
    default:
      return "from-blue-500 to-cyan-500";
  }
}

export function SocialFeedHighlights({ activities }: SocialFeedHighlightsProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Friend Highlights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">No friend activity yet</p>
              <p className="text-xs text-muted-foreground">
                Add friends to see their PRs and achievements
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Friend Highlights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {activities.map((activity) => {
            const Icon = getActivityIcon(activity.activity_type);
            const gradientColor = getActivityColor(activity.activity_type);

            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                    {activity.avatar_image_url ? (
                      <img
                        src={activity.avatar_image_url}
                        alt={activity.display_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-white" />
                    )}
                  </div>

                  {/* Activity Type Badge */}
                  <div
                    className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br ${gradientColor} ring-2 ring-background`}
                  >
                    <Icon className="h-3 w-3 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-1">
                  <p className="text-sm">
                    <span className="font-semibold">{activity.display_name}</span>{" "}
                    <span className="text-muted-foreground">
                      {getActivityText(activity)}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Link */}
        <div className="mt-4 text-center">
          <a
            href="/dashboard/social"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            View all activity →
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
