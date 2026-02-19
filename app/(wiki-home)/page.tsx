import { WikiHomeContent } from './wiki-home-content';
import { PopularToday } from '@/components/wiki/PopularToday';
import { createClient } from '@/lib/supabase/server';

async function getCategoryCounts() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('wiki_articles')
    .select('category')
    .eq('is_published', true);

  const counts: Record<string, number> = {};
  data?.forEach((article) => {
    counts[article.category] = (counts[article.category] || 0) + 1;
  });
  return counts;
}

export const metadata = {
  title: 'Carve Wiki - Evidence-Based Fitness Encyclopedia',
  description: 'Comprehensive, evidence-based fitness knowledge.',
  openGraph: {
    title: 'Carve Wiki - Evidence-Based Fitness Encyclopedia',
    description: 'Comprehensive, evidence-based fitness knowledge across 6 domains.',
  }
};

export default async function WikiPage() {
  const counts = await getCategoryCounts();
  const totalArticles = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <WikiHomeContent
      counts={counts}
      totalArticles={totalArticles}
      popularToday={<PopularToday />}
    />
  );
}

export const revalidate = 3600;
