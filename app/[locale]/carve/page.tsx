import { Smartphone, Zap, Target, TrendingUp, Award, Users, Rocket, CheckCircle } from 'lucide-react';

export const metadata = {
  title: 'About Carve - The Gamified Fitness App',
  description: 'Learn about Carve, the fitness tracking app that turns your workouts into an RPG experience.',
};

export default function AppPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-20">
          <div className="inline-block p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl mb-8 shadow-xl">
            <Smartphone className="w-20 h-20 text-white" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Welcome to <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Carve</span>
          </h1>
          <p className="text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            The fitness app that turns your workouts into an RPG. Track progress, earn XP, level up, and compete with friends.
          </p>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <StatCard
              icon={<Target className="w-8 h-8" />}
              label="Track Everything"
              value="Workouts, nutrition, habits"
            />
            <StatCard
              icon={<Zap className="w-8 h-8" />}
              label="Gamified"
              value="XP, levels, achievements"
            />
            <StatCard
              icon={<Users className="w-8 h-8" />}
              label="Social"
              value="Compete & connect"
            />
          </div>
        </div>

        {/* What is Carve */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">What is Carve?</h2>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              <strong className="text-gray-900">Carve is a fitness tracking app designed to make getting fit feel like playing a game.</strong> Instead of boring spreadsheets and manual logging, you get instant feedback, visual progress, and rewards for every workout.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Every exercise you log earns you <strong>XP</strong>. Hit personal records and unlock <strong>achievements</strong>. Level up your character as you level up your body. Compete on <strong>leaderboards</strong> with friends and see who's putting in the most work.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Whether you're a beginner taking your first steps or an athlete chasing new PRs, Carve makes the journey engaging, measurable, and social.
            </p>
          </div>
        </section>

        {/* Core Features */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Core Features</h2>
          <div className="space-y-6">
            <FeatureBlock
              icon={<Zap className="w-10 h-10" />}
              title="Gamification System"
              description="Earn XP for workouts, meals, and consistency. Level up your character, unlock achievements for milestones, and see your rank climb on global leaderboards."
              gradient="from-purple-500 to-pink-500"
            />
            <FeatureBlock
              icon={<TrendingUp className="w-10 h-10" />}
              title="Workout Tracking"
              description="Log exercises with ease. Track sets, reps, weight, and rest times. Automatic PR detection celebrates your wins. See your volume and intensity trends over time."
              gradient="from-blue-500 to-cyan-500"
            />
            <FeatureBlock
              icon={<Target className="w-10 h-10" />}
              title="Nutrition Tracking"
              description="Photo-based meal logging with AI recognition. Track macros and calories effortlessly. Build sustainable eating habits with meal prep templates."
              gradient="from-green-500 to-emerald-500"
            />
            <FeatureBlock
              icon={<Users className="w-10 h-10" />}
              title="Social Features"
              description="Follow friends, share achievements, create challenges. Compete on group leaderboards. Find workout partners who share your goals."
              gradient="from-orange-500 to-red-500"
            />
            <FeatureBlock
              icon={<Award className="w-10 h-10" />}
              title="Analytics & Insights"
              description="Beautiful charts showing your transformation. Progress photos, body composition trends, muscle balance analysis, and performance reports."
              gradient="from-indigo-500 to-blue-500"
            />
          </div>
        </section>

        {/* Platform */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Available Platforms</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <PlatformCard
              platform="iOS"
              status="Coming Soon"
              description="Native iPhone and iPad app"
            />
            <PlatformCard
              platform="Android"
              status="Coming Soon"
              description="Native Android app"
            />
            <PlatformCard
              platform="Web"
              status="In Development"
              description="Progressive web app"
              highlight
            />
          </div>
        </section>

        {/* Current Status */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Development Status</h2>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <div className="space-y-4">
              <StatusItem completed title="Website & Landing Page" />
              <StatusItem completed title="Wiki System" />
              <StatusItem completed title="Web Dashboard (Beta)" />
              <StatusItem inProgress title="Mobile Apps" />
              <StatusItem title="Social Features" />
              <StatusItem title="Nutrition Tracking" />
            </div>

            <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-blue-900 font-medium">
                <Rocket className="w-5 h-5 inline mr-2" />
                We're in active development. Check the <a href="/carve/roadmap" className="underline hover:text-blue-700">Roadmap</a> to see what's coming next.
              </p>
            </div>
          </div>
        </section>

        {/* CTAs */}
        <div className="grid md:grid-cols-2 gap-6">
          <CTACard
            title="Explore Features"
            description="See what's on the roadmap"
            href="/carve/roadmap"
            gradient="from-blue-600 to-purple-600"
          />
          <CTACard
            title="Try Demo"
            description="Test the web dashboard"
            href="/demo"
            gradient="from-purple-600 to-pink-600"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="text-blue-600 mb-3">{icon}</div>
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className="font-bold text-gray-900">{value}</div>
    </div>
  );
}

function FeatureBlock({
  icon,
  title,
  description,
  gradient
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 p-3 rounded-xl bg-gradient-to-r ${gradient} text-white`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}

function PlatformCard({
  platform,
  status,
  description,
  highlight = false
}: {
  platform: string;
  status: string;
  description: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl p-6 border-2 ${
      highlight
        ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-300'
        : 'bg-white border-gray-200'
    }`}>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{platform}</h3>
      <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
        highlight
          ? 'bg-blue-600 text-white'
          : 'bg-gray-200 text-gray-700'
      }`}>
        {status}
      </div>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

function StatusItem({ title, completed = false, inProgress = false }: { title: string; completed?: boolean; inProgress?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {completed && <CheckCircle className="w-6 h-6 text-green-600" />}
      {inProgress && (
        <div className="w-6 h-6 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
      )}
      {!completed && !inProgress && <div className="w-6 h-6 rounded-full border-2 border-gray-300" />}
      <span className={`text-lg ${completed ? 'text-gray-700' : inProgress ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
        {title}
      </span>
    </div>
  );
}

function CTACard({
  title,
  description,
  href,
  gradient
}: {
  title: string;
  description: string;
  href: string;
  gradient: string;
}) {
  return (
    <a
      href={href}
      className={`block p-8 rounded-2xl bg-gradient-to-r ${gradient} text-white hover:shadow-xl transition-all`}
    >
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-blue-100">{description}</p>
    </a>
  );
}
