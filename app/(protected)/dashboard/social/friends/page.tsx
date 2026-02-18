import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Users, Clock, Check, X } from "lucide-react";
import { FriendSearchForm } from "@/components/social/FriendSearchForm";
import { FriendRequestActions } from "@/components/social/FriendRequestActions";

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface Friendship {
  id: string;
  status: "pending" | "accepted" | "blocked";
  created_at: string;
  user_id: string;
  friend_id: string;
  friend_profile?: Profile;
  requester_profile?: Profile;
}

async function getFriends(userId: string) {
  const supabase = await createClient();

  // Get accepted friendships
  const { data: friendships, error } = await supabase
    .from("friendships")
    .select(
      `
      id,
      status,
      created_at,
      user_id,
      friend_id,
      friend_profile:profiles!friendships_friend_id_fkey(id, username, display_name, avatar_url),
      requester_profile:profiles!friendships_user_id_fkey(id, username, display_name, avatar_url)
    `
    )
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
    .eq("status", "accepted")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching friends:", error);
    return [];
  }

  return (friendships || []).map((f: any) => ({
    ...f,
    friend_profile: f.user_id === userId ? f.friend_profile : f.requester_profile,
  }));
}

async function getPendingRequests(userId: string) {
  const supabase = await createClient();

  // Get incoming pending requests (where current user is the friend_id)
  const { data: requests, error } = await supabase
    .from("friendships")
    .select(
      `
      id,
      status,
      created_at,
      user_id,
      friend_id,
      requester_profile:profiles!friendships_user_id_fkey(id, username, display_name, avatar_url)
    `
    )
    .eq("friend_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching pending requests:", error);
    return [];
  }

  return requests || [];
}

async function getSentRequests(userId: string) {
  const supabase = await createClient();

  // Get outgoing pending requests (where current user is the user_id)
  const { data: requests, error } = await supabase
    .from("friendships")
    .select(
      `
      id,
      status,
      created_at,
      user_id,
      friend_id,
      friend_profile:profiles!friendships_friend_id_fkey(id, username, display_name, avatar_url)
    `
    )
    .eq("user_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching sent requests:", error);
    return [];
  }

  return requests || [];
}

export default async function FriendsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/dashboard/login");
  }

  const friends = await getFriends(user.id);
  const pendingRequests = await getPendingRequests(user.id);
  const sentRequests = await getSentRequests(user.id);

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Friends</h1>
        <p className="text-muted-foreground">
          Connect with others and share your fitness journey
        </p>
      </div>

      {/* Search for Friends */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Add Friends</h2>
        </div>
        <FriendSearchForm currentUserId={user.id} />
      </Card>

      {/* Pending Friend Requests */}
      {pendingRequests.length > 0 && (
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5" />
            <h2 className="text-xl font-semibold">
              Pending Requests ({pendingRequests.length})
            </h2>
          </div>
          <div className="space-y-3">
            {pendingRequests.map((request: any) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                    {request.requester_profile.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {request.requester_profile.display_name ||
                        request.requester_profile.username}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      @{request.requester_profile.username}
                    </p>
                  </div>
                </div>
                <FriendRequestActions friendshipId={request.id} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Sent Requests */}
      {sentRequests.length > 0 && (
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5" />
            <h2 className="text-xl font-semibold">
              Sent Requests ({sentRequests.length})
            </h2>
          </div>
          <div className="space-y-3">
            {sentRequests.map((request: any) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                    {request.friend_profile.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {request.friend_profile.display_name ||
                        request.friend_profile.username}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      @{request.friend_profile.username}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">Pending</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Friends List */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5" />
          <h2 className="text-xl font-semibold">
            My Friends ({friends.length})
          </h2>
        </div>

        {friends.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              No friends yet. Search for users to add friends!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {friends.map((friendship: any) => (
              <div
                key={friendship.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-semibold">
                    {friendship.friend_profile?.username
                      ?.charAt(0)
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {friendship.friend_profile?.display_name ||
                        friendship.friend_profile?.username}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      @{friendship.friend_profile?.username}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-muted-foreground">Friends</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
