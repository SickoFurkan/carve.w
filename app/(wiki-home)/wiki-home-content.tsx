'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SearchBar } from '@/components/wiki/SearchBar';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { getCategoryColor } from '@/lib/wiki/category-colors';

interface WikiHomeContentProps {
  counts: Record<string, number>;
  totalArticles: number;
  popularToday: ReactNode;
}

const categories = [
  { title: "Nutrition", slug: "nutrition", description: "Evidence-based articles about macronutrients, micronutrients, meal timing, and dietary strategies", emoji: "🍎" },
  { title: "Exercise Science", slug: "exercise-science", description: "Scientific principles of exercise, biomechanics, and training adaptations", emoji: "💪" },
  { title: "Physiology", slug: "physiology", description: "How your body works: energy systems, muscle growth, fat loss, and recovery", emoji: "🧬" },
  { title: "Training Methods", slug: "training-methods", description: "Practical training approaches: strength training, cardio, mobility, and programming", emoji: "🏋️" },
  { title: "Psychology", slug: "psychology", description: "Mental aspects of fitness: motivation, habit formation, goal setting, and mindset", emoji: "🧠" },
  { title: "Injury & Health", slug: "injury-health", description: "Injury prevention, rehabilitation, common issues, and health optimization", emoji: "❤️" },
];

export function WikiHomeContent({ counts, totalArticles, popularToday }: WikiHomeContentProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="pt-32 md:pt-44 pb-20 flex flex-col items-center text-center">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-7xl font-bold tracking-[0.3em] text-white mb-1"
        >
          CARVE
        </motion.h1>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-3xl md:text-5xl font-bold tracking-[0.3em] text-white/80 mb-3"
        >
          WIKI
        </motion.span>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg md:text-xl text-white/50 mb-12 font-light"
        >
          Evidence-based fitness knowledge
        </motion.p>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full max-w-2xl mb-8"
        >
          <SearchBar />
        </motion.div>

        {/* Stat pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex items-center gap-3 text-[11px] uppercase tracking-[0.15em] text-white/30"
        >
          <span>{totalArticles} articles</span>
          <span>·</span>
          <span>6 domains</span>
          <span>·</span>
          <span>100% evidence-based</span>
        </motion.div>
      </section>

      {/* Browse by Domain */}
      <section className="pb-20">
        <ScrollReveal animation="fade-up">
          <p className="text-[11px] uppercase tracking-[0.15em] text-white/30 mb-6">Browse by domain</p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category, i) => {
            const colors = getCategoryColor(category.slug);
            return (
              <ScrollReveal key={category.slug} animation="fade-up" delay={i * 0.08}>
                <Link
                  href={`/wiki/${category.slug}`}
                  className={`group block rounded-xl p-6 bg-[rgba(28,31,39,0.7)] backdrop-blur-xl border border-white/[0.08] transition-all duration-300 hover:-translate-y-0.5 ${colors.borderHover} ${colors.shadow}`}
                >
                  <div className="text-3xl mb-4">{category.emoji}</div>
                  <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-white/90">
                    {category.title}
                  </h3>
                  <p className="text-sm text-white/40 mb-4 line-clamp-2">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${colors.text}`}>
                      {counts[category.slug] || 0} {(counts[category.slug] || 0) === 1 ? 'article' : 'articles'}
                    </span>
                    <span className="text-white/30 text-sm group-hover:text-white/50 group-hover:translate-x-1 transition-all">
                      →
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* Trending Section */}
      <section className="pb-20">
        <ScrollReveal animation="fade-up">
          <p className="text-[11px] uppercase tracking-[0.15em] text-white/30 mb-6">Trending now</p>
          {popularToday}
        </ScrollReveal>
      </section>

      {/* Footer Stats */}
      <section className="pb-20">
        <ScrollReveal animation="fade-up">
          <div className="rounded-xl p-8 bg-[rgba(28,31,39,0.7)] backdrop-blur-xl border border-white/[0.08]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-white mb-2">{totalArticles}</div>
                <div className="text-[11px] uppercase tracking-[0.15em] text-white/30">Expert Articles</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">6</div>
                <div className="text-[11px] uppercase tracking-[0.15em] text-white/30">Knowledge Domains</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">100%</div>
                <div className="text-[11px] uppercase tracking-[0.15em] text-white/30">Evidence-Based</div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
