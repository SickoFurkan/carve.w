import Link from "next/link";
import { SearchBar } from "@/components/wiki/SearchBar";
import { PopularToday } from "@/components/wiki/PopularToday";
import { createClient } from "@/lib/supabase/server";
import { GlobalSearch } from "@/components/search/global-search";

// Get article counts for each category
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
  description: 'Comprehensive, evidence-based fitness knowledge. Articles on nutrition, exercise science, physiology, training methods, psychology, and injury prevention.',
  openGraph: {
    title: 'Carve Wiki - Evidence-Based Fitness Encyclopedia',
    description: 'Comprehensive, evidence-based fitness knowledge across 6 domains.',
  }
};

export default async function WikiPage() {
  const counts = await getCategoryCounts();

  const categories = [
    {
      title: "Nutrition",
      slug: "nutrition",
      description: "Evidence-based articles about macronutrients, micronutrients, meal timing, and dietary strategies",
      count: counts['nutrition'] || 0,
      emoji: "🍎",
    },
    {
      title: "Exercise Science",
      slug: "exercise-science",
      description: "Scientific principles of exercise, biomechanics, and training adaptations",
      count: counts['exercise-science'] || 0,
      emoji: "💪",
    },
    {
      title: "Physiology",
      slug: "physiology",
      description: "How your body works: energy systems, muscle growth, fat loss, and recovery",
      count: counts['physiology'] || 0,
      emoji: "🧬",
    },
    {
      title: "Training Methods",
      slug: "training-methods",
      description: "Practical training approaches: strength training, cardio, mobility, and programming",
      count: counts['training-methods'] || 0,
      emoji: "🏋️",
    },
    {
      title: "Psychology",
      slug: "psychology",
      description: "Mental aspects of fitness: motivation, habit formation, goal setting, and mindset",
      count: counts['psychology'] || 0,
      emoji: "🧠",
    },
    {
      title: "Injury & Health",
      slug: "injury-health",
      description: "Injury prevention, rehabilitation, common issues, and health optimization",
      count: counts['injury-health'] || 0,
      emoji: "❤️",
    }
  ];

  const totalArticles = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Search Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Your Health & Fitness Knowledge Base
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Search articles, find users, explore rankings
            </p>
            <GlobalSearch variant="large" autoFocus />
          </div>
        </section>

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-zinc-900 mb-4">Carve Wiki</h2>
          <p className="text-xl text-zinc-600 mb-2">
            Evidence-based fitness encyclopedia
          </p>
          <p className="text-sm text-zinc-500">
            {totalArticles} articles • Evidence-rated • Peer-reviewed
          </p>
        </div>

        {/* Search Bar (Hero Element) */}
        <div className="mb-16">
          <SearchBar />
        </div>

        {/* Main Content with Sidebar */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Categories Grid */}
          <div className="lg:col-span-8">
            <h2 className="text-2xl font-bold text-zinc-900 mb-6">Browse by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/${category.slug}`}
                  className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  <div className="p-6">
                    <div className="text-4xl mb-4">{category.emoji}</div>
                    <h3 className="text-xl font-semibold text-zinc-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-sm text-zinc-600 mb-4 line-clamp-2">
                      {category.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-500">
                        {category.count} {category.count === 1 ? 'article' : 'articles'}
                      </span>
                      <span className="text-blue-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                        Browse →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar - Popular Today (Desktop) */}
          <aside className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="lg:sticky lg:top-4">
              <PopularToday />
            </div>
          </aside>
        </div>

        {/* Footer Info */}
        <div className="mt-16 pt-8 border-t border-zinc-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-zinc-900 mb-2">{totalArticles}</div>
              <div className="text-sm text-zinc-600">Expert Articles</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-zinc-900 mb-2">6</div>
              <div className="text-sm text-zinc-600">Knowledge Domains</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-zinc-900 mb-2">100%</div>
              <div className="text-sm text-zinc-600">Evidence-Based</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Revalidate every hour
export const revalidate = 3600;
