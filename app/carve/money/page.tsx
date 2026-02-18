'use client';

import { motion } from 'framer-motion';
import { Receipt, PiggyBank, TrendingUp } from 'lucide-react';
import { MoneyCard } from '@/components/carve/MoneyCard';
import { CarveFooter } from '@/components/carve/CarveFooter';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

export default function CarveMoneyPage() {
  return (
    <div className="min-h-screen w-full bg-[#0B1120] text-white overflow-y-auto">
      {/* Hero Section */}
      <section className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-20 relative">
        {/* CARVE MONEY logo */}
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
          className="text-3xl md:text-5xl font-bold tracking-[0.3em] text-[#3B82F6] mb-3"
        >
          MONEY
        </motion.span>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg md:text-xl text-white/50 mb-12 font-light"
        >
          Know where your money goes
        </motion.p>

        {/* Money Card */}
        <MoneyCard />

        {/* App Store CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="mt-10 flex flex-col items-center gap-3"
        >
          <div className="px-6 py-3 bg-white text-black rounded-xl font-semibold text-sm flex items-center gap-2 opacity-80 cursor-default">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            Download on the App Store
          </div>
          <p className="text-white/30 text-sm">Coming Spring 2026</p>
        </motion.div>
      </section>

      {/* Value Proposition */}
      <section className="py-24 md:py-32 px-6">
        <ScrollReveal animation="fade-up">
          <h2 className="text-3xl md:text-5xl font-bold text-center text-white mb-16 tracking-tight">
            Track. Save. Grow.
          </h2>
        </ScrollReveal>

        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-4">
          {[
            {
              icon: <Receipt className="w-5 h-5" />,
              title: 'Track',
              text: 'Every subscription, every transaction. Automatically.',
            },
            {
              icon: <PiggyBank className="w-5 h-5" />,
              title: 'Save',
              text: 'AI finds savings you\u2019d miss. Duplicates, price hikes, unused services.',
            },
            {
              icon: <TrendingUp className="w-5 h-5" />,
              title: 'Grow',
              text: 'See where your money goes. Make it go where you want.',
            },
          ].map((card, i) => (
            <ScrollReveal key={card.title} animation="fade-up" delay={i * 0.1}>
              <div className="rounded-xl border border-blue-500/[0.08] bg-blue-950/20 p-6 h-full">
                <div className="w-10 h-10 rounded-lg bg-blue-500/[0.08] flex items-center justify-center text-white/50 mb-4">
                  {card.icon}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{card.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{card.text}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 md:py-32 px-6">
        <ScrollReveal animation="fade-up">
          <div className="text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 tracking-tight">
              Where does your money go?
            </h2>
            <div className="flex flex-col items-center gap-3 mb-16">
              <div className="px-6 py-3 bg-white text-black rounded-xl font-semibold text-sm flex items-center gap-2 opacity-80 cursor-default">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                Download on the App Store
              </div>
              <p className="text-white/30 text-sm">Coming Spring 2026</p>
            </div>

            <CarveFooter />
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
