"use server";

import { requireAdmin } from "@/lib/admin/auth";
import { revalidatePath } from "next/cache";

const ROLE_IDS: Record<string, string> = {
  admin: "7171e054-3cd4-4cae-b552-f6c6ad2b9114",
  moderator: "f4430f4d-a18d-4e54-a2fa-53293a90e365",
  user: "1d341a14-9656-4857-b783-75fc47880aba",
};

export async function updateUserProfile(userId: string, data: {
  display_name?: string;
  username?: string;
  bio?: string;
}) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: data.display_name,
      username: data.username,
      bio: data.bio,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return { success: true };
}

export async function changeUserRole(userId: string, roleName: string) {
  const { supabase, user } = await requireAdmin();

  if (user.id === userId && roleName !== "admin") {
    return { error: "Cannot change your own admin role" };
  }

  const roleId = ROLE_IDS[roleName];
  if (!roleId) return { error: `Unknown role: ${roleName}` };

  const { error } = await supabase
    .from("profiles")
    .update({
      user_role_id: roleId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return { success: true };
}
