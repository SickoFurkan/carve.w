import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { EvidenceRating } from '@/components/wiki/EvidenceRating';

interface PageProps {
  params: Promise<{
    category: string;
  }>;
  searchParams: Promise<{
    sort?: string;
  }>;
}

const VALID_CATEGORIES = [
  'nutrition',
  'exercise-science',
  'physiology',
  'training-methods',
  'psychology',
  'injury-health',
];

const CATEGORY_INFO: Record<string, { name: string; description: string; icon: string }> = {
  'nutrition': {
    name: 'Nutrition',
    description: 'Evidence-based articles about macronutrients, micronutrients, meal timing, and dietary strategies',
    icon: '🍎',
  },
  'exercise-science': {
    name: 'Exercise Science',
    description: 'Scientific principles of exercise, biomechanics, and training adaptations',
    icon: '💪',
  },
  'physiology': {
    name: 'Physiology',
    description: 'How your body works: energy systems, muscle growth, fat loss, and recovery',
    icon: '🧬',
  },
  'training-methods': {
    name: 'Training Methods',
    description: 'Practical training approaches: strength training, cardio, mobility, and programming',
    icon: '🏋️',
  },
  'psychology': {
    name: 'Psychology',
    description: 'Mental aspects of fitness: motivation, habit formation, goal setting, and mindset',
    icon: '🧠',
  },
  'injury-health': {
    name: 'Injury & Health',
    description: 'Injury prevention, rehabilitation, common issues, and health optimization',
    icon: '❤️',
  },
};

// Fetch articles for category
async function getArticlesByCategory(category: string, sortBy: string = 'newest') {
  const supabase = await createClient();

  const { data: articles } = await supabase.rpc('get_articles_by_category', {
    article_category: category,
    sort_by: sortBy,
    limit_count: 50,
  });

  return articles || [];
}

// Generate metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;

  if (!VALID_CATEGORIES.includes(category)) {
    return { title: 'Category Not Found' };
  }

  const info = CATEGORY_INFO[category];

  return {
    title: `${info.name} | Carve Wiki`,
    description: info.description,
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { category } = await params;
  const { sort = 'newest' } = await searchParams;

  // Validate category
  if (!VALID_CATEGORIES.includes(category)) {
    notFound();
  }

  const info = CATEGORY_INFO[category];
  const articles = await getArticlesByCategory(category, sort);

  return (
    <div className="min-h-screen bg-[#ececf1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm text-zinc-600">
          <Link href="/wiki" className="hover:text-zinc-900">
            Wiki
          </Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-900">{info.name}</span>
        </nav>

        {/* Category Header */}
        <header className="mb-8 bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-start gap-4">
            <span className="text-5xl">{info.icon}</span>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-zinc-900 mb-2">
                {info.name}
              </h1>
              <p className="text-lg text-zinc-600">{info.description}</p>
            </div>
          </div>
        </header>

        {/* Sorting Options */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-zinc-600">
            {articles.length} {articles.length === 1 ? 'article' : 'articles'}
          </p>
          <div className="flex gap-2">
            <Link
              href={`/wiki/${category}?sort=newest`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sort === 'newest'
                  ? 'bg-zinc-900 text-white'
                  : 'bg-white text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              Newest
            </Link>
            <Link
              href={`/wiki/${category}?sort=popular`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sort === 'popular'
                  ? 'bg-zinc-900 text-white'
                  : 'bg-white text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              Popular
            </Link>
            <Link
              href={`/wiki/${category}?sort=alphabetical`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sort === 'alphabetical'
                  ? 'bg-zinc-900 text-white'
                  : 'bg-white text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              A-Z
            </Link>
          </div>
        </div>

        {/* Articles Grid */}
        {articles.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-zinc-600 mb-4">
              No articles in this category yet. Check back soon!
            </p>
            <Link
              href="/wiki"
              className="inline-block px-6 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Browse Other Categories
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article: any) => (
              <Link
                key={article.slug}
                href={`/wiki/${category}/${article.slug}`}
                className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                <div className="p-6">
                  {/* Evidence Rating */}
                  <div className="mb-3">
                    <EvidenceRating rating={article.evidence_rating} />
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-zinc-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {article.title}
                  </h2>

                  {/* Summary */}
                  {article.summary && (
                    <p className="text-sm text-zinc-600 mb-4 line-clamp-3">
                      {article.summary}
                    </p>
                  )}

                  {/* Tags */}
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.tags.slice(0, 3).map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-zinc-100 text-zinc-600 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span>{article.view_count} views</span>
                    <span>•</span>
                    <span>
                      {new Date(article.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Generate static params
export async function generateStaticParams() {
  return VALID_CATEGORIES.map((category) => ({
    category,
  }));
}

// Revalidate every hour
export const revalidate = 3600;
