import { createClient } from "@/lib/supabase/server";

export default async function AdminContentPage() {
  const supabase = await createClient();

  const { data: articles } = await supabase
    .from("wiki_articles")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(20);

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto">
        <div className="border-b border-white/[0.06] pb-4">
          <h1 className="text-3xl font-bold text-white tracking-tight">Content Moderation</h1>
          <p className="text-[#9da6b9] mt-1">
            Review and moderate wiki articles
          </p>
        </div>

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
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {articles?.map((article) => (
                  <tr key={article.id} className="hover:bg-white/5">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{article.title}</div>
                      <div className="text-sm text-[#9da6b9]">{article.slug}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#9da6b9]">{article.category}</td>
                    <td className="px-6 py-4 text-sm text-[#9da6b9]">{article.view_count}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        article.is_published
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-white/5 text-slate-500"
                      }`}>
                        {article.is_published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#9da6b9]">
                      {new Date(article.updated_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
