"use server";

import { requireAdmin } from "@/lib/admin/auth";
import { revalidatePath } from "next/cache";

export async function toggleArticlePublished(
  articleId: string,
  isPublished: boolean
) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("wiki_articles")
    .update({
      is_published: isPublished,
      updated_at: new Date().toISOString(),
    })
    .eq("id", articleId);

  if (error) return { error: error.message };

  revalidatePath("/admin/content");
  return { success: true };
}
