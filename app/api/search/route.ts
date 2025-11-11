import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  try {
    const supabase = await createClient();

    // Search wiki articles
    const { data: wikiArticles } = await supabase
      .from("wiki_articles")
      .select("id, title, slug, category")
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .limit(5);

    // Search user profiles
    const { data: userProfiles } = await supabase
      .from("profiles")
      .select("id, username, display_name")
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .eq("is_public", true)
      .limit(3);

    // Build results
    const results = [
      ...(wikiArticles || []).map((article) => ({
        id: article.id,
        type: "wiki" as const,
        title: article.title,
        description: `${article.category}`,
        href: `/wiki/${article.category}/${article.slug}`,
      })),
      ...(userProfiles || []).map((profile) => ({
        id: profile.id,
        type: "user" as const,
        title: profile.display_name || profile.username,
        href: `/profile/${profile.username}`,
      })),
    ];

    // Add hiscores hint if query might be user-related
    if (query.length > 2) {
      results.push({
        id: "hiscores",
        type: "hiscore" as const,
        title: "Search in Hiscores",
        href: `/hiscores?q=${encodeURIComponent(query)}`,
      });
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ results: [], error: "Search failed" }, { status: 500 });
  }
}
