import { createClient } from '@/lib/supabase/server';

interface RecommendedArticle {
  slug: string;
  title: string;
  category: string;
  summary: string;
  evidence_rating: string;
}

/**
 * Get recommended articles based on user activity
 */
export async function getRecommendedArticles(
  userId: string | null,
  limit: number = 3
): Promise<RecommendedArticle[]> {
  const supabase = await createClient();

  // If not logged in, return popular articles
  if (!userId) {
    return getPopularArticles(limit);
  }

  // Fetch user stats to determine what articles to recommend
  const { data: stats } = await supabase
    .from('user_stats')
    .select('total_workouts, total_meals_logged')
    .eq('user_id', userId)
    .single();

  if (!stats) {
    return getPopularArticles(limit);
  }

  // Build article slug list based on user activity
  const recommendedSlugs: string[] = [];

  // If user has workouts, recommend exercise/training articles
  if (stats.total_workouts && stats.total_workouts > 0) {
    recommendedSlugs.push('progressive-overload', 'strength-training-basics', 'energy-systems');
  }

  // If user logs meals, recommend nutrition articles
  if (stats.total_meals_logged && stats.total_meals_logged > 0) {
    recommendedSlugs.push('protein');
  }

  // If user is new (no activity), recommend getting started articles
  if ((!stats.total_workouts || stats.total_workouts === 0) &&
      (!stats.total_meals_logged || stats.total_meals_logged === 0)) {
    recommendedSlugs.push('strength-training-basics', 'habit-formation', 'protein');
  }

  // Fetch articles from database
  if (recommendedSlugs.length > 0) {
    const { data: articles } = await supabase
      .from('wiki_articles')
      .select('slug, title, category, summary, evidence_rating')
      .in('slug', recommendedSlugs)
      .eq('is_published', true)
      .limit(limit);

    if (articles && articles.length > 0) {
      return articles;
    }
  }

  // Fallback to popular articles
  return getPopularArticles(limit);
}

/**
 * Get most popular articles as fallback
 */
async function getPopularArticles(limit: number): Promise<RecommendedArticle[]> {
  const supabase = await createClient();

  const { data: articles } = await supabase
    .from('wiki_articles')
    .select('slug, title, category, summary, evidence_rating')
    .eq('is_published', true)
    .order('view_count', { ascending: false })
    .limit(limit);

  return articles || [];
}
