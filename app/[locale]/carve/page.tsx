'use client';

import { Smartphone, Zap, Target, TrendingUp, Award, Users, Rocket, ArrowRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/scroll-reveal';
import HowItWorksWithPhone from '@/components/carve/HowItWorksWithPhone';

export default function CarvePage() {
  return (
    <div className="min-h-full w-full bg-white">
      {/* Hero Section with Scroll Expand */}
      <ScrollExpandMedia
        mediaType="image"
        mediaSrc="/screenshots/dashboard.png"
        bgImageSrc="/loginscreen.png"
        title="Welcome to Carve"
        scrollToExpand="Scroll to explore"
      >
        <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mb-6 font-light">
          Turn your workouts into an RPG experience
        </p>
      </ScrollExpandMedia>

      {/* Main Content */}
      <div className="relative z-50 bg-white">
        {/* Intro Section */}
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal animation="fade-up">
              <div className="text-center mb-16">
                <span className="inline-block px-4 py-2 bg-gray-100 border border-gray-200 rounded-full text-sm text-gray-600 mb-6">
                  The Future of Fitness Tracking
                </span>
                <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  Fitness that feels like{' '}
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                    gaming
                  </span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Carve transforms your fitness journey into an immersive experience.
                  Track workouts, earn XP, level up your character, and compete with friends.
                </p>
              </div>
            </ScrollReveal>

            {/* Stats Grid */}
            <StaggerContainer className="grid md:grid-cols-3 gap-6" staggerDelay={0.1}>
              <StaggerItem>
                <StatCard
                  icon={<Target className="w-8 h-8" />}
                  label="Track Everything"
                  value="Workouts, nutrition, habits"
                />
              </StaggerItem>
              <StaggerItem>
                <StatCard
                  icon={<Zap className="w-8 h-8" />}
                  label="Gamified"
                  value="XP, levels, achievements"
                />
              </StaggerItem>
              <StaggerItem>
                <StatCard
                  icon={<Users className="w-8 h-8" />}
                  label="Social"
                  value="Compete & connect"
                />
              </StaggerItem>
            </StaggerContainer>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-6 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal animation="fade-up">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
                Core Features
              </h2>
              <p className="text-gray-600 text-center mb-16 max-w-2xl mx-auto">
                Everything you need to transform your fitness journey
              </p>
            </ScrollReveal>

            <div className="space-y-8">
              <ScrollReveal animation="slide-left" delay={0.1}>
                <FeatureBlock
                  icon={<Zap className="w-10 h-10" />}
                  title="Gamification System"
                  description="Earn XP for workouts, meals, and consistency. Level up your character, unlock achievements for milestones, and see your rank climb on global leaderboards."
                  gradient="from-purple-500 to-pink-500"
                />
              </ScrollReveal>

              <ScrollReveal animation="slide-right" delay={0.1}>
                <FeatureBlock
                  icon={<TrendingUp className="w-10 h-10" />}
                  title="Workout Tracking"
                  description="Log exercises with ease. Track sets, reps, weight, and rest times. Automatic PR detection celebrates your wins. See your volume and intensity trends over time."
                  gradient="from-blue-500 to-cyan-500"
                />
              </ScrollReveal>

              <ScrollReveal animation="slide-left" delay={0.1}>
                <FeatureBlock
                  icon={<Target className="w-10 h-10" />}
                  title="Nutrition Tracking"
                  description="Photo-based meal logging with AI recognition. Track macros and calories effortlessly. Build sustainable eating habits with meal prep templates."
                  gradient="from-green-500 to-emerald-500"
                />
              </ScrollReveal>

              <ScrollReveal animation="slide-right" delay={0.1}>
                <FeatureBlock
                  icon={<Users className="w-10 h-10" />}
                  title="Social Features"
                  description="Follow friends, share achievements, create challenges. Compete on group leaderboards. Find workout partners who share your goals."
                  gradient="from-orange-500 to-red-500"
                />
              </ScrollReveal>

              <ScrollReveal animation="slide-left" delay={0.1}>
                <FeatureBlock
                  icon={<Award className="w-10 h-10" />}
                  title="Analytics & Insights"
                  description="Beautiful charts showing your transformation. Progress photos, body composition trends, muscle balance analysis, and performance reports."
                  gradient="from-indigo-500 to-blue-500"
                />
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* How It Works Section with Phone */}
        <HowItWorksWithPhone />

        {/* Development Status */}
        <section className="py-24 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal animation="fade-up">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                  Development Status
                </h2>
                <p className="text-gray-600">
                  We're actively building Carve. Here's where we are:
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="scale" delay={0.2}>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
                <div className="space-y-4">
                  <StatusItem completed title="Website & Landing Page" />
                  <StatusItem completed title="Wiki System" />
                  <StatusItem completed title="Web Dashboard (Beta)" />
                  <StatusItem inProgress title="Mobile Apps (iOS & Android)" />
                  <StatusItem title="Social Features" />
                  <StatusItem title="Nutrition Tracking" />
                </div>

                <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-blue-700 font-medium flex items-center gap-2">
                    <Rocket className="w-5 h-5" />
                    We're in active development. Check the{' '}
                    <Link href="/carve/roadmap" className="underline hover:text-blue-900">
                      Roadmap
                    </Link>{' '}
                    to see what's coming next.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <StaggerContainer className="grid md:grid-cols-2 gap-6" staggerDelay={0.15}>
              <StaggerItem>
                <CTACard
                  title="Explore Roadmap"
                  description="See what features are coming next"
                  href="/carve/roadmap"
                  gradient="from-blue-600 to-purple-600"
                />
              </StaggerItem>
              <StaggerItem>
                <CTACard
                  title="Read Vision"
                  description="Discover where we're heading"
                  href="/carve/vision"
                  gradient="from-purple-600 to-pink-600"
                />
              </StaggerItem>
            </StaggerContainer>
          </div>
        </section>

        {/* Footer spacer */}
        <div className="h-20" />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:bg-gray-100 transition-colors">
      <div className="text-blue-500 mb-3">{icon}</div>
      <div className="text-sm text-gray-500 mb-1">{label}</div>
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
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all hover:border-gray-300">
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

function StatusItem({ title, completed = false, inProgress = false }: { title: string; completed?: boolean; inProgress?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {completed && (
        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      {inProgress && (
        <div className="w-6 h-6 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
      )}
      {!completed && !inProgress && (
        <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
      )}
      <span className={`text-lg ${
        completed ? 'text-gray-700' : inProgress ? 'text-blue-600 font-medium' : 'text-gray-400'
      }`}>
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
    <Link
      href={href}
      className={`group block p-8 rounded-2xl bg-gradient-to-r ${gradient} text-white hover:shadow-xl hover:shadow-purple-500/20 transition-all`}
    >
      <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
        {title}
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </h3>
      <p className="text-white/80">{description}</p>
    </Link>
  );
}
