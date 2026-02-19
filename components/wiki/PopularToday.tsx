import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { TrendingUp, Eye } from 'lucide-react';
import { getCategoryColor } from '@/lib/wiki/category-colors';

interface PopularArticle {
  slug: string;
  title: string;
  category: string;
  view_count: number;
}

async function getPopularArticles() {
  const supabase = await createClient();

  // Try to get today's popular articles
  const { data } = await supabase.rpc('get_popular_today', {
    limit_count: 5,
  });

  // If no views today, fall back to all-time popular
  if (!data || data.length === 0) {
    const { data: allTimeData } = await supabase
      .from('wiki_articles')
      .select('slug, title, category, view_count')
      .eq('is_published', true)
      .order('view_count', { ascending: false })
      .limit(5);

    return allTimeData || [];
  }

  return data;
}

export async function PopularToday() {
  const articles = await getPopularArticles();

  if (articles.length === 0) {
    return null;
  }

  return (
    <div className="bg-[rgba(28,31,39,0.7)] backdrop-blur-xl border border-white/[0.08] rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-orange-500" />
        <h2 className="text-lg font-semibold text-white">Populair Vandaag</h2>
      </div>

      {/* Articles List */}
      <ul className="space-y-3">
        {articles.map((article: any, index: number) => (
          <li key={article.slug}>
            <Link
              href={`/wiki/${article.category}/${article.slug}`}
              className="group flex items-start gap-3 hover:bg-white/[0.04] p-2 -mx-2 rounded-lg transition-colors"
            >
              {/* Rank */}
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 text-white text-xs font-bold flex items-center justify-center">
                {index + 1}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-white/80 group-hover:text-white transition-colors line-clamp-2">
                  {article.title}
                </h3>

                {/* Category & Views */}
                <div className="flex items-center gap-2 mt-1 text-xs text-white/30">
                  <span className={`capitalize ${getCategoryColor(article.category).text}`}>
                    {article.category.split('-').join(' ')}
                  </span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{article.view_count}</span>
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* View All Link */}
      <Link
        href="/wiki"
        className="block mt-4 pt-4 border-t border-white/[0.06] text-sm text-white/40 hover:text-white/60 font-medium text-center"
      >
        Browse All Articles →
      </Link>
    </div>
  );
}
