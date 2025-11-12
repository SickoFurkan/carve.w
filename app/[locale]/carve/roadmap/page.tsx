export const metadata = {
  title: 'Roadmap - Carve',
  description: 'See what we are building and what is coming next for Carve.',
};

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Product Roadmap
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See what we're building and where Carve is heading. Your feedback shapes our direction.
          </p>
        </div>

        {/* Status Legend */}
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔨</span>
            <span className="text-sm font-medium text-gray-700">In Development</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📋</span>
            <span className="text-sm font-medium text-gray-700">Planned</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">💭</span>
            <span className="text-sm font-medium text-gray-700">Considering</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">✅</span>
            <span className="text-sm font-medium text-gray-700">Completed</span>
          </div>
        </div>

        {/* Roadmap Sections */}
        <div className="space-y-12">
          {/* In Development */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-3xl">🔨</span>
              In Development
            </h2>
            <div className="space-y-4">
              <RoadmapItem
                title="Mobile App Beta"
                description="Native iOS and Android apps with core tracking features"
                priority="high"
              />
              <RoadmapItem
                title="Web Dashboard"
                description="Full-featured web interface for tracking and analytics"
                priority="high"
              />
            </div>
          </section>

          {/* Planned */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-3xl">📋</span>
              Planned
            </h2>
            <div className="space-y-4">
              <RoadmapItem
                title="Social Features"
                description="Follow friends, share workouts, compete on leaderboards"
                priority="high"
              />
              <RoadmapItem
                title="Nutrition Tracking"
                description="AI-powered meal logging and macro tracking"
                priority="medium"
              />
              <RoadmapItem
                title="Workout Programs"
                description="Pre-built training plans and custom program builder"
                priority="medium"
              />
            </div>
          </section>

          {/* Considering */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-3xl">💭</span>
              Considering
            </h2>
            <div className="space-y-4">
              <RoadmapItem
                title="AI Coaching"
                description="Personalized training recommendations based on your data"
                priority="low"
              />
              <RoadmapItem
                title="Wearable Integration"
                description="Sync with Apple Watch, Garmin, Whoop, and other devices"
                priority="low"
              />
              <RoadmapItem
                title="Community Challenges"
                description="Monthly fitness challenges with rewards and prizes"
                priority="low"
              />
            </div>
          </section>

          {/* Completed */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-3xl">✅</span>
              Completed
            </h2>
            <div className="space-y-4">
              <RoadmapItem
                title="Landing Page & Website"
                description="Marketing site with demo and information"
                priority="high"
                completed
              />
              <RoadmapItem
                title="Wiki System"
                description="Knowledge base for fitness education"
                priority="medium"
                completed
              />
            </div>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Have a feature request?
          </h3>
          <p className="text-gray-600 mb-6">
            We'd love to hear your ideas. Help shape the future of Carve.
          </p>
          <a
            href="/carve/contributing"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-8 py-3 rounded-lg hover:shadow-xl transition-all"
          >
            Submit Feedback
          </a>
        </div>
      </div>
    </div>
  );
}

function RoadmapItem({
  title,
  description,
  priority,
  completed = false
}: {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  completed?: boolean;
}) {
  const priorityColors = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-green-100 text-green-700'
  };

  return (
    <div className={`p-6 rounded-xl border-2 transition-all hover:shadow-md ${
      completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200 hover:border-blue-300'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className={`text-lg font-semibold mb-2 ${completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
            {title}
          </h3>
          <p className={`${completed ? 'text-gray-400' : 'text-gray-600'}`}>
            {description}
          </p>
        </div>
        {!completed && (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${priorityColors[priority]}`}>
            {priority.toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
}
