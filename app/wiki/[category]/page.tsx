import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCategoryColor } from '@/lib/wiki/category-colors';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { Eye } from 'lucide-react';

const VALID_CATEGORIES: Record<string, { title: string; emoji: string; description: string }> = {
  'nutrition': {
    title: 'Nutrition',
    emoji: '🍎',
    description: 'Evidence-based articles about macronutrients, micronutrients, meal timing, and dietary strategies',
  },
  'exercise-science': {
    title: 'Exercise Science',
    emoji: '💪',
    description: 'Scientific principles of exercise, biomechanics, and training adaptations',
  },
  'physiology': {
    title: 'Physiology',
    emoji: '🧬',
    description: 'How your body works: energy systems, muscle growth, fat loss, and recovery',
  },
  'training-methods': {
    title: 'Training Methods',
    emoji: '🏋️',
    description: 'Practical training approaches: strength training, cardio, mobility, and programming',
  },
  'psychology': {
    title: 'Psychology',
    emoji: '🧠',
    description: 'Mental aspects of fitness: motivation, habit formation, goal setting, and mindset',
  },
  'injury-health': {
    title: 'Injury & Health',
    emoji: '❤️',
    description: 'Injury prevention, rehabilitation, common issues, and health optimization',
  },
};

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { category } = await params;
  const cat = VALID_CATEGORIES[category];
  if (!cat) return { title: 'Category Not Found' };

  return {
    title: `${cat.title} | Carve Wiki`,
    description: cat.description,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  const cat = VALID_CATEGORIES[category];

  if (!cat) {
    notFound();
  }

  const colors = getCategoryColor(category);

  const supabase = await createClient();
  const { data: articles } = await supabase
    .from('wiki_articles')
    .select('slug, title, summary, evidence_rating, view_count, updated_at, tags')
    .eq('category', category)
    .eq('is_published', true)
    .order('view_count', { ascending: false });

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumbs */}
        <nav className="mb-8 text-sm text-white/40">
          <Link href="/" className="hover:text-white/60">Wiki</Link>
          <span className="mx-2">/</span>
          <span className={colors.text}>{cat.title}</span>
        </nav>

        {/* Category Header */}
        <div className="mb-12">
          <div className="text-5xl mb-4">{cat.emoji}</div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3">
            {cat.title}
          </h1>
          <p className="text-white/50 text-lg max-w-2xl">{cat.description}</p>
          <p className="mt-3 text-[11px] uppercase tracking-[0.15em] text-white/30">
            {articles?.length || 0} {(articles?.length || 0) === 1 ? 'article' : 'articles'}
          </p>
        </div>

        {/* Articles List */}
        {articles && articles.length > 0 ? (
          <div className="space-y-4">
            {articles.map((article, i) => (
              <ScrollReveal key={article.slug} animation="fade-up" delay={i * 0.05}>
                <Link
                  href={`/wiki/${category}/${article.slug}`}
                  className={`group block rounded-xl p-6 bg-[rgba(28,31,39,0.7)] backdrop-blur-xl border border-white/[0.08] transition-all duration-300 hover:-translate-y-0.5 ${colors.borderHover} ${colors.shadow}`}
                >
                  <h2 className="text-lg font-semibold text-white group-hover:text-white/90 mb-2">
                    {article.title}
                  </h2>
                  {article.summary && (
                    <p className="text-sm text-white/50 line-clamp-2 mb-3">
                      {article.summary}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.15em] text-white/30">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{article.view_count}</span>
                    </div>
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex items-center gap-2">
                        {article.tags.slice(0, 3).map((tag: string) => (
                          <span key={tag} className="normal-case tracking-normal text-white/40">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="rounded-xl p-12 bg-[rgba(28,31,39,0.7)] backdrop-blur-xl border border-white/[0.08] text-center">
            <p className="text-white/40 text-lg">No articles yet in this category.</p>
            <Link href="/" className="mt-4 inline-block text-sm text-white/50 hover:text-white/70">
              ← Back to Wiki
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export const revalidate = 3600;
