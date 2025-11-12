'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about Carve. Can't find your answer? Reach out to us.
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-12">
          {/* General */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">General</h2>
            <div className="space-y-3">
              <FAQItem
                question="What is Carve?"
                answer="Carve is a fitness tracking app that gamifies your workouts. Track exercises, earn XP, level up, compete with friends, and see your progress visualized in beautiful charts. Think of it as a fitness RPG where you're the main character."
              />
              <FAQItem
                question="When will the app be available?"
                answer="We're currently in active development. The web dashboard is available now, and we're working on the mobile apps for iOS and Android. Join the waitlist to be notified when we launch the beta."
              />
              <FAQItem
                question="How much will it cost?"
                answer="We're still finalizing pricing, but our goal is to keep the core features free with optional premium features for power users. We believe fitness tracking should be accessible to everyone."
              />
              <FAQItem
                question="What platforms will be supported?"
                answer="Carve will be available as a native iOS app, Android app, and progressive web app (PWA). Your data syncs seamlessly across all devices."
              />
            </div>
          </section>

          {/* Features */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Features</h2>
            <div className="space-y-3">
              <FAQItem
                question="What can I track with Carve?"
                answer="You can track workouts (exercises, sets, reps, weight), nutrition (meals, macros, calories), body measurements (weight, body fat, measurements), and daily habits. Everything is gamified with XP, levels, and achievements."
              />
              <FAQItem
                question="Does Carve integrate with other apps or wearables?"
                answer="Wearable integration (Apple Watch, Garmin, Whoop, etc.) is planned for a future release. For now, Carve works standalone but we're designing with integration in mind."
              />
              <FAQItem
                question="Can I compete with friends?"
                answer="Yes! Social features are a core part of Carve. Follow friends, compete on leaderboards, create challenges, and share achievements. You can also keep your profile private if you prefer to train solo."
              />
              <FAQItem
                question="Is there a meal/nutrition tracking feature?"
                answer="Nutrition tracking is planned and will include photo-based meal logging with AI recognition, macro tracking, and meal prep planning. We want to make it as easy as possible to log your food."
              />
            </div>
          </section>

          {/* Privacy & Data */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy & Data</h2>
            <div className="space-y-3">
              <FAQItem
                question="Is my data private?"
                answer="Yes. Your workout and nutrition data is private by default. You choose what to share and with whom. You can also opt-out of public leaderboards entirely while still using all other features."
              />
              <FAQItem
                question="Can I export my data?"
                answer="Absolutely. You own your data. You'll be able to export all your workouts, nutrition logs, and progress data in standard formats (CSV, JSON) at any time."
              />
              <FAQItem
                question="What happens if I delete my account?"
                answer="All your data will be permanently deleted from our servers within 30 days. Before deletion, you'll have the option to download a full export of your data."
              />
            </div>
          </section>

          {/* Development */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Development</h2>
            <div className="space-y-3">
              <FAQItem
                question="Who is building Carve?"
                answer="Carve is being built by an independent developer with a passion for fitness and gamification. Learn more on the Developer page."
              />
              <FAQItem
                question="Can I contribute or suggest features?"
                answer="Yes! We love feedback. Visit the Contributing page to submit bug reports, feature requests, or contribute to the Wiki with fitness articles."
              />
              <FAQItem
                question="Is Carve open source?"
                answer="The core app is currently in private development, but parts of the ecosystem (like the Wiki content) may be opened up in the future. We're focusing on building a great product first."
              />
              <FAQItem
                question="How can I stay updated on development progress?"
                answer="Check the Updates page for the latest changelog, follow the Roadmap to see what's coming, or join the waitlist to receive email updates about major releases."
              />
            </div>
          </section>
        </div>

        {/* Still have questions */}
        <div className="mt-16 text-center p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Still have questions?
          </h3>
          <p className="text-gray-600 mb-6">
            We're here to help. Reach out through our contributing page.
          </p>
          <a
            href="/carve/contributing"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-8 py-3 rounded-lg hover:shadow-xl transition-all"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-gray-700 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}
