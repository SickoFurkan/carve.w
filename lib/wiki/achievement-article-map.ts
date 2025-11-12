/**
 * Maps achievement codes to relevant wiki articles
 * Used to suggest reading material when users unlock achievements
 */

export const ACHIEVEMENT_ARTICLES: Record<string, {
  slug: string;
  category: string;
  reason: string; // Why this article is relevant
}> = {
  // Workout achievements
  'first_workout': {
    slug: 'strength-training-basics',
    category: 'training-methods',
    reason: 'Learn the fundamentals of effective training'
  },
  'workout_10': {
    slug: 'progressive-overload',
    category: 'exercise-science',
    reason: 'Understand how to keep making progress'
  },
  'workout_25': {
    slug: 'energy-systems',
    category: 'physiology',
    reason: 'Discover how your body produces energy during workouts'
  },
  'workout_50': {
    slug: 'progressive-overload',
    category: 'exercise-science',
    reason: 'Master the science of continuous improvement'
  },

  // Streak achievements
  'streak_3': {
    slug: 'habit-formation',
    category: 'psychology',
    reason: 'Learn the science behind building lasting habits'
  },
  'streak_7': {
    slug: 'habit-formation',
    category: 'psychology',
    reason: 'Understand how to maintain your momentum'
  },
  'streak_14': {
    slug: 'habit-formation',
    category: 'psychology',
    reason: 'Discover advanced strategies for consistency'
  },
  'streak_30': {
    slug: 'habit-formation',
    category: 'psychology',
    reason: 'Master the psychology of long-term commitment'
  },

  // PR (Personal Record) achievements
  'first_pr': {
    slug: 'progressive-overload',
    category: 'exercise-science',
    reason: 'Learn how to keep breaking personal records'
  },
  'pr_5': {
    slug: 'progressive-overload',
    category: 'exercise-science',
    reason: 'Understand the science of strength gains'
  },

  // Level up achievements
  'level_5': {
    slug: 'energy-systems',
    category: 'physiology',
    reason: 'Learn how your body adapts to training'
  },
  'level_10': {
    slug: 'progressive-overload',
    category: 'exercise-science',
    reason: 'Explore advanced training principles'
  },

  // Nutrition achievements (when added)
  'first_meal': {
    slug: 'protein',
    category: 'nutrition',
    reason: 'Discover the foundation of sports nutrition'
  },
  'meal_7_days': {
    slug: 'protein',
    category: 'nutrition',
    reason: 'Master your macronutrient intake'
  },
};

/**
 * Get article suggestion for an achievement
 */
export function getArticleForAchievement(achievementCode: string) {
  const mapping = ACHIEVEMENT_ARTICLES[achievementCode];

  if (!mapping) {
    return null;
  }

  return {
    ...mapping,
    url: `/${mapping.category}/${mapping.slug}`,
  };
}

/**
 * Get all article suggestions for multiple achievements
 */
export function getArticlesForAchievements(achievementCodes: string[]) {
  return achievementCodes
    .map(code => getArticleForAchievement(code))
    .filter((article): article is NonNullable<typeof article> => article !== null);
}
