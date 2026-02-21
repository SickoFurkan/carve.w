"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function FriendRequestActions({ friendshipId }: { friendshipId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("friendships")
        .update({ status: "accepted" })
        .eq("id", friendshipId);

      if (error) throw error;

      router.refresh();
    } catch (err) {
      console.error("Error accepting friend request:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("friendships")
        .delete()
        .eq("id", friendshipId);

      if (error) throw error;

      router.refresh();
    } catch (err) {
      console.error("Error declining friend request:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleAccept}
        disabled={loading}
        className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors"
      >
        Accept
      </button>
      <button
        onClick={handleDecline}
        disabled={loading}
        className="inline-flex items-center gap-1 rounded-lg border border-white/[0.06] px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:border-white/[0.15] transition-colors"
      >
        Decline
      </button>
    </div>
  );
}
