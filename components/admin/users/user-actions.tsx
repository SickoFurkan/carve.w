"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Ban, UserCheck, Trash2, AlertTriangle } from "lucide-react";
import {
  banUser,
  unbanUser,
  deleteUser,
} from "@/app/actions/admin/users";
import { useRouter } from "next/navigation";

interface UserActionsProps {
  userId: string;
  isBanned: boolean;
  displayName: string;
}

export function UserActions({
  userId,
  isBanned,
  displayName,
}: UserActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  async function handleBanToggle() {
    setError(null);

    startTransition(async () => {
      const result = isBanned ? await unbanUser(userId) : await banUser(userId);

      if (result.error) {
        setError(result.error);
      }
    });
  }

  async function handleDelete() {
    setError(null);

    startTransition(async () => {
      const result = await deleteUser(userId);

      if (result.error) {
        setError(result.error);
      } else if (result.redirect) {
        router.push(result.redirect);
      }
    });
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <div className="flex gap-2">
        {isBanned ? (
          <Button
            onClick={handleBanToggle}
            disabled={isPending}
            size="sm"
            className="bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30"
          >
            <UserCheck className="h-4 w-4 mr-2" />
            {isPending ? "Processing..." : "Unban User"}
          </Button>
        ) : (
          <Button
            onClick={handleBanToggle}
            disabled={isPending}
            size="sm"
            className="bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30"
          >
            <Ban className="h-4 w-4 mr-2" />
            {isPending ? "Processing..." : "Ban User"}
          </Button>
        )}

        {!showDeleteConfirm ? (
          <Button
            onClick={() => setShowDeleteConfirm(true)}
            size="sm"
            className="bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Account
          </Button>
        ) : (
          <div className="flex gap-2 items-center bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/30">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <span className="text-sm text-red-300">
              Delete {displayName}?
            </span>
            <Button
              onClick={handleDelete}
              disabled={isPending}
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isPending ? "Deleting..." : "Confirm"}
            </Button>
            <Button
              onClick={() => setShowDeleteConfirm(false)}
              size="sm"
              variant="outline"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
