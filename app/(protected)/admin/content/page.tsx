import { createClient } from "@/lib/supabase/server";
import { ContentActions } from "@/components/admin/content-actions";
import { StatusBadge } from "@/components/admin/status-badge";
import Link from "next/link";

interface SearchParams {
  page?: string;
  status?: string;
}

const ARTICLES_PER_PAGE = 50;

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const statusFilter = params.status || "all";

  const supabase = await createClient();

  const from = (page - 1) * ARTICLES_PER_PAGE;
  const to = from + ARTICLES_PER_PAGE - 1;

  let query = supabase
    .from("wiki_articles")
    .select("id, title, slug, category, view_count, is_published, updated_at", {
      count: "exact",
    })
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (statusFilter === "published") {
    query = query.eq("is_published", true);
  } else if (statusFilter === "draft") {
    query = query.eq("is_published", false);
  }

  const { data: articles, count } = await query;
  const totalPages = Math.ceil((count || 0) / ARTICLES_PER_PAGE);

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="border-b border-white/[0.06] pb-4">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Content Moderation
          </h1>
          <p className="text-[#9da6b9] mt-1">
            Review and moderate wiki articles
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {["all", "published", "draft"].map((status) => (
            <Link
              key={status}
              href={`?status=${status}&page=1`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === status
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "bg-white/5 text-[#9da6b9] border border-white/[0.06] hover:bg-white/10"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Link>
          ))}
          <span className="ml-auto text-sm text-[#9da6b9]">
            {count || 0} articles
          </span>
        </div>

        {/* Table */}
        <div className="bg-[#1c1f27] border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/[0.06]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Article
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {articles && articles.length > 0 ? (
                  articles.map((article) => (
                    <tr
                      key={article.id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/wiki/${article.slug}`}
                          className="group"
                        >
                          <div className="font-medium text-white group-hover:text-amber-400 transition-colors">
                            {article.title}
                          </div>
                          <div className="text-sm text-[#9da6b9]">
                            {article.slug}
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#9da6b9]">
                        {article.category}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#9da6b9]">
                        {(article.view_count || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge
                          variant={article.is_published ? "published" : "draft"}
                        >
                          {article.is_published ? "Published" : "Draft"}
                        </StatusBadge>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#9da6b9]">
                        {new Date(article.updated_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <ContentActions
                          articleId={article.id}
                          isPublished={article.is_published}
                          title={article.title}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-sm text-[#9da6b9]"
                    >
                      No articles found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Link
              href={`?status=${statusFilter}&page=${Math.max(1, page - 1)}`}
              className={`px-4 py-2 rounded-lg border border-white/[0.06] text-white transition-colors ${
                page === 1
                  ? "opacity-50 pointer-events-none"
                  : "hover:bg-white/5"
              }`}
            >
              Previous
            </Link>

            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pageNum = page - 2 + i;
              if (pageNum < 1 || pageNum > totalPages) return null;
              return (
                <Link
                  key={pageNum}
                  href={`?status=${statusFilter}&page=${pageNum}`}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    pageNum === page
                      ? "bg-amber-500 border-amber-500 text-white"
                      : "border-white/[0.06] text-white hover:bg-white/5"
                  }`}
                >
                  {pageNum}
                </Link>
              );
            })}

            <Link
              href={`?status=${statusFilter}&page=${Math.min(totalPages, page + 1)}`}
              className={`px-4 py-2 rounded-lg border border-white/[0.06] text-white transition-colors ${
                page === totalPages
                  ? "opacity-50 pointer-events-none"
                  : "hover:bg-white/5"
              }`}
            >
              Next
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
