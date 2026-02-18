'use client';

import { motion } from 'framer-motion';
import { Dumbbell, Wallet, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { CarveFooter } from '@/components/carve/CarveFooter';

const products = [
  {
    title: 'Health',
    subtitle: 'Fitness with a scoreboard',
    href: '/carve/health',
    icon: Dumbbell,
    accent: '#D4A843',
  },
  {
    title: 'Money',
    subtitle: 'Know where your money goes',
    href: '/carve/money',
    icon: Wallet,
    accent: '#3B82F6',
  },
] as const;

export default function CarvePage() {
  return (
    <div className="min-h-screen w-full bg-[#0A0A0B] text-white overflow-y-auto">
      {/* Hero — Logo + Tagline */}
      <section className="flex flex-col items-center pt-32 md:pt-44 pb-20 px-6">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-7xl font-bold tracking-[0.3em] text-white mb-3"
        >
          CARVE
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-white/50 font-light"
        >
          Self improvement
        </motion.p>
      </section>

      {/* Product Cards */}
      <section className="max-w-3xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((product, i) => (
            <ScrollReveal key={product.title} animation="fade-up" delay={i * 0.1}>
              <Link
                href={product.href}
                className="group block rounded-xl border border-white/[0.08] bg-white/[0.04] p-8 transition-colors hover:border-white/[0.16]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${product.accent}15` }}
                    >
                      <product.icon
                        className="w-5 h-5"
                        style={{ color: product.accent }}
                      />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">
                        {product.title}
                      </h2>
                      <p className="text-sm text-white/50">{product.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/40 transition-colors" />
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Footer */}
      <section className="py-24 md:py-32 px-6">
        <ScrollReveal animation="fade-up">
          <div className="text-center">
            <CarveFooter />
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
