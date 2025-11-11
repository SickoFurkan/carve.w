import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { TrendingUp, Eye } from 'lucide-react';

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
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-orange-500" />
        <h2 className="text-lg font-bold text-zinc-900">Populair Vandaag</h2>
      </div>

      {/* Articles List */}
      <ul className="space-y-3">
        {articles.map((article: any, index: number) => (
          <li key={article.slug}>
            <Link
              href={`/wiki/${article.category}/${article.slug}`}
              className="group flex items-start gap-3 hover:bg-zinc-50 p-2 -mx-2 rounded-lg transition-colors"
            >
              {/* Rank */}
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-900 text-white text-xs font-bold flex items-center justify-center">
                {index + 1}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-zinc-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {article.title}
                </h3>

                {/* Category & Views */}
                <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                  <span className="capitalize">
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
        className="block mt-4 pt-4 border-t border-zinc-100 text-sm text-blue-600 hover:text-blue-700 font-medium text-center"
      >
        Browse All Articles →
      </Link>
    </div>
  );
}
