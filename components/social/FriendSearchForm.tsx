"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
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

      const { error: insertError } = await supabase.from("friendships").insert({
        user_id: currentUserId,
        friend_id: friendId,
        status: "pending",
      });

      if (insertError) throw insertError;

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
          className="bg-white/5 border-white/[0.06] text-white placeholder:text-slate-600"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 transition-colors disabled:opacity-50"
        >
          Search
        </button>
      </form>

      {error && (
        <div className="p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="space-y-2">
          {searchResults.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 rounded-lg border border-white/[0.06] bg-white/[0.02]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white font-semibold text-sm">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">
                    {user.display_name || user.username}
                  </p>
                  <p className="text-xs text-slate-500">
                    @{user.username}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleSendRequest(user.id)}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/15 transition-colors"
              >
                Add Friend
              </button>
            </div>
          ))}
        </div>
      )}

      {searchQuery && searchResults.length === 0 && !loading && (
        <p className="text-sm text-slate-500 text-center py-4">
          No users found matching &quot;{searchQuery}&quot;
        </p>
      )}
    </div>
  );
}
