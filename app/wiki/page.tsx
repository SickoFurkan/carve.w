import Link from "next/link";

export default function WikiPage() {
  const categories = [
    {
      title: "Nutrition",
      description: "Evidence-based guidance on diet, macros, and meal planning",
      count: "24 articles",
      emoji: "🍎",
      href: "/wiki/nutrition"
    },
    {
      title: "Fitness",
      description: "Workout routines, form guides, and training principles",
      count: "32 articles",
      emoji: "💪",
      href: "/wiki/fitness"
    },
    {
      title: "Health",
      description: "Sleep, recovery, stress management, and wellness",
      count: "18 articles",
      emoji: "❤️",
      href: "/wiki/health"
    },
    {
      title: "Science",
      description: "Deep dives into the research behind health and fitness",
      count: "15 articles",
      emoji: "📚",
      href: "/wiki/science"
    }
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">Knowledge Base</h1>
            <p className="text-lg text-gray-600">
              Comprehensive articles covering every aspect of health and fitness
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((category) => (
              <Link
                key={category.title}
                href={category.href}
                className="group"
              >
                <div className="bg-white rounded-lg border border-gray-200 p-8 h-full hover:shadow-lg transition-all hover:scale-[1.02]">
                  <div className="text-5xl mb-4">{category.emoji}</div>
                  <h2 className="text-2xl font-semibold mb-2 group-hover:text-gray-600 transition-colors">
                    {category.title}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {category.description}
                  </p>
                  <p className="text-sm text-gray-500">
                    {category.count}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
