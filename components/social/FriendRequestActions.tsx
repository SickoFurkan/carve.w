"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
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
      <Button
        size="sm"
        onClick={handleAccept}
        disabled={loading}
        className="bg-green-600 hover:bg-green-700"
      >
        <Check className="w-4 h-4 mr-1" />
        Accept
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={handleDecline}
        disabled={loading}
      >
        <X className="w-4 h-4 mr-1" />
        Decline
      </Button>
    </div>
  );
}
