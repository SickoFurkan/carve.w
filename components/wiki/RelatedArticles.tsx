import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCategoryColor } from '@/lib/wiki/category-colors';

interface RelatedArticlesProps {
  currentSlug: string;
  category: string;
}

export async function RelatedArticles({ currentSlug, category }: RelatedArticlesProps) {
  const supabase = await createClient();

  // Get 3 related articles from same category
  const { data: articles } = await supabase
    .from('wiki_articles')
    .select('slug, title, summary, category')
    .eq('category', category)
    .eq('is_published', true)
    .neq('slug', currentSlug)
    .order('view_count', { ascending: false })
    .limit(3);

  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Related Articles</h2>
      <div className="grid gap-4">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/wiki/${article.category}/${article.slug}`}
            className="block p-4 bg-[rgba(28,31,39,0.7)] backdrop-blur-xl border border-white/[0.08] rounded-xl hover:bg-white/[0.06] hover:-translate-y-0.5 transition-all"
          >
            <h3 className="font-semibold text-white mb-2">
              {article.title}
            </h3>
            {article.summary && (
              <p className="text-sm text-white/50 line-clamp-2">
                {article.summary}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
