import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

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
      <h2 className="text-2xl font-bold text-zinc-900 mb-6">Related Articles</h2>
      <div className="grid gap-4">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/wiki/${article.category}/${article.slug}`}
            className="block p-4 bg-zinc-50 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <h3 className="font-semibold text-zinc-900 mb-2">
              {article.title}
            </h3>
            {article.summary && (
              <p className="text-sm text-zinc-600 line-clamp-2">
                {article.summary}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
