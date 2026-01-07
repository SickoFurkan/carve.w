"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateUserProfile(userId: string, data: {
  display_name?: string;
  username?: string;
  bio?: string;
  role?: string;
}) {
  const supabase = await createClient();

  // Check if current user is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Not authorized" };
  }

  // Update user profile
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: data.display_name,
      username: data.username,
      bio: data.bio,
      role: data.role,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);

  return { success: true };
}

export async function banUser(userId: string) {
  const supabase = await createClient();

  // Check if current user is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Not authorized" };
  }

  // Ban user
  const { error } = await supabase
    .from("profiles")
    .update({
      is_banned: true,
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);

  return { success: true };
}

export async function unbanUser(userId: string) {
  const supabase = await createClient();

  // Check if current user is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Not authorized" };
  }

  // Unban user
  const { error } = await supabase
    .from("profiles")
    .update({
      is_banned: false,
      is_active: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);

  return { success: true };
}

export async function changeUserRole(userId: string, newRole: string) {
  const supabase = await createClient();

  // Check if current user is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Not authorized" };
  }

  // Update user role
  const { error } = await supabase
    .from("profiles")
    .update({
      role: newRole,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);

  return { success: true };
}

export async function deleteUser(userId: string) {
  const supabase = await createClient();

  // Check if current user is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Not authorized" };
  }

  // Don't allow deleting yourself
  if (user.id === userId) {
    return { error: "Cannot delete your own account" };
  }

  // Delete user (this will cascade delete related records due to foreign keys)
  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/users");

  return { success: true, redirect: "/admin/users" };
}
