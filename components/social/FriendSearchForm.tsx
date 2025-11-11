"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus, Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchResult {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

export function FriendSearchForm({ currentUserId }: { currentUserId: string }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Search for users by username (case-insensitive)
      const { data: users, error: searchError } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .ilike("username", `%${searchQuery}%`)
        .neq("id", currentUserId)
        .limit(10);

      if (searchError) throw searchError;

      setSearchResults(users || []);
    } catch (err: any) {
      setError(err.message || "Failed to search users");
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (friendId: string) => {
    try {
      const supabase = createClient();

      // Check if friendship already exists
      const { data: existing } = await supabase
        .from("friendships")
        .select("id, status")
        .or(
          `and(user_id.eq.${currentUserId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${currentUserId})`
        )
        .single();

      if (existing) {
        setError("Friendship request already exists");
        return;
      }

      // Create friendship request
      const { error: insertError } = await supabase.from("friendships").insert({
        user_id: currentUserId,
        friend_id: friendId,
        status: "pending",
      });

      if (insertError) throw insertError;

      // Refresh the page to show updated state
      router.refresh();
      setSearchQuery("");
      setSearchResults([]);
    } catch (err: any) {
      setError(err.message || "Failed to send friend request");
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <Input
          placeholder="Search by username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button type="submit" disabled={loading}>
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </form>

      {error && (
        <div className="p-3 mb-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="space-y-2">
          {searchResults.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 rounded-lg border"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">
                    {user.display_name || user.username}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    @{user.username}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => handleSendRequest(user.id)}
                disabled={loading}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Friend
              </Button>
            </div>
          ))}
        </div>
      )}

      {searchQuery && searchResults.length === 0 && !loading && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No users found matching "{searchQuery}"
        </p>
      )}
    </div>
  );
}
