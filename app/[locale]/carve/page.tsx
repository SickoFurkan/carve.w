import { HeroSection } from '@/components/landing/HeroSection';
import { FeatureCard } from '@/components/landing/FeatureCard';
import { DetailedFeatureSection } from '@/components/landing/DetailedFeatureSection';
import { HiscoresWidget } from '@/components/landing/HiscoresWidget';
import { ActivityFeed } from '@/components/landing/ActivityFeed';
import { Footer } from '@/components/landing/Footer';
import { Dumbbell, Apple, BarChart3, Zap, Users, Target } from 'lucide-react';

export const metadata = {
  title: 'Carve - Track Workouts. Level Up. Win.',
  description: 'The fitness app that gamifies your progress. Track PRs, earn XP, compete with friends. Join the waitlist today.',
  openGraph: {
    title: 'Carve - Track Workouts. Level Up. Win.',
    description: 'The fitness app that gamifies your progress. Track PRs, earn XP, compete with friends.',
    // TODO: Add og:image when we have app screenshots
  }
};

export default function HomePage() {
  return (
    <main>
      <HeroSection />

      {/* Social Proof - Release 2 */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Join the Community
            </h2>
            <p className="text-xl text-gray-600">
              Real people, real progress. See who's crushing it right now.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <HiscoresWidget />
            <ActivityFeed />
          </div>
        </div>
      </section>

      {/* Detailed Features - Release 3 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 space-y-32">
          {/* Workout Tracking */}
          <DetailedFeatureSection
            icon={Dumbbell}
            title="Track Every Rep"
            description="Your digital workout journal. Log exercises, track progress, beat your personal records."
            gradient="from-blue-500 to-cyan-500"
            features={[
              'Quick exercise logging with preset templates',
              'Automatic PR detection and celebration',
              'Volume and intensity tracking',
              'Rest timer between sets',
              'Exercise library with form guides',
            ]}
            imagePosition="right"
          />

          {/* Gamification */}
          <DetailedFeatureSection
            icon={Zap}
            title="Level Up Your Fitness"
            description="Turn workouts into a game. Earn XP for every activity, level up, unlock achievements, and compete with friends."
            gradient="from-purple-500 to-pink-500"
            features={[
              'Earn XP for workouts, meals, and consistency',
              'Unlock achievements for milestones',
              'Level-based progression system',
              'Daily and weekly challenges',
              'Compete on global leaderboards',
            ]}
            imagePosition="left"
          />

          {/* Nutrition */}
          <DetailedFeatureSection
            icon={Apple}
            title="Fuel Your Progress"
            description="Track meals, hit macro goals, build sustainable eating habits. AI-powered meal logging makes it effortless."
            gradient="from-green-500 to-emerald-500"
            features={[
              'Photo-based meal logging with AI recognition',
              'Macro and calorie tracking',
              'Meal prep planning and templates',
              'Recipe database with nutritional info',
              'Progress toward daily nutrition goals',
            ]}
            imagePosition="right"
          />

          {/* Social */}
          <DetailedFeatureSection
            icon={Users}
            title="Train Together"
            description="Connect with friends, share workouts, create challenges. Fitness is better together."
            gradient="from-orange-500 to-red-500"
            features={[
              'Follow friends and see their progress',
              'Create and join fitness challenges',
              'Share workouts and achievements',
              'Group leaderboards and competitions',
              'Workout partner matching',
            ]}
            imagePosition="left"
          />

          {/* Analytics */}
          <DetailedFeatureSection
            icon={BarChart3}
            title="Track Your Transformation"
            description="Beautiful charts and insights. See exactly what's working and where to improve."
            gradient="from-indigo-500 to-blue-500"
            features={[
              'Progress photos with side-by-side comparison',
              'Body composition trends over time',
              'Volume and intensity analytics',
              'Muscle group balance analysis',
              'Weekly and monthly performance reports',
            ]}
            imagePosition="right"
          />
        </div>
      </section>

      {/* Quick Features Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            And So Much More
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            Everything you need in one powerful app
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Target}
              title="Smart Goals"
              description="Set goals, track progress, get AI-powered recommendations to stay on track."
            />
            <FeatureCard
              icon={Dumbbell}
              title="Workout Plans"
              description="Pre-built programs or create your own. Follow structured training with ease."
            />
            <FeatureCard
              icon={Zap}
              title="AI Coach"
              description="Get personalized insights, form tips, and motivation when you need it."
            />
          </div>

          {/* Demo CTA */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4 text-lg">Want to see it in action?</p>
            <a
              href="/demo"
              className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-8 py-4 rounded-lg hover:shadow-xl transition-all shadow-lg text-lg"
            >
              Try Interactive Demo →
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
