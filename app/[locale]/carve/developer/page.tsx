import { Github, Linkedin, Mail, Coffee } from 'lucide-react';

export const metadata = {
  title: 'Developer - Carve',
  description: 'Meet the developer behind Carve and learn about the tech stack.',
};

export default function DeveloperPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-block p-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6">
            <div className="bg-gray-100 rounded-full p-8">
              <span className="text-6xl">👨‍💻</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Meet the Developer
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Building Carve one commit at a time
          </p>
        </div>

        {/* About */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">About Me</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Hi! I'm <strong>Furkan Celiker</strong>, the developer behind Carve. I'm passionate about fitness, technology, and creating products that make a real difference in people's lives.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                I've been training for years and tried countless fitness apps. They all felt the same - boring spreadsheets with no personality, complex interfaces that get in the way, or social features that feel forced. I wanted something different: an app that makes tracking fun, celebrates progress, and brings people together.
              </p>
              <p className="text-gray-700 leading-relaxed">
                So I decided to build it myself. Carve is my answer to the question: "What if fitness tracking felt like leveling up in a game?"
              </p>
            </div>

            {/* Social Links */}
            <div className="mt-8 flex flex-wrap gap-4">
              <SocialLink
                icon={<Github className="w-5 h-5" />}
                label="GitHub"
                href="#"
              />
              <SocialLink
                icon={<Linkedin className="w-5 h-5" />}
                label="LinkedIn"
                href="#"
              />
              <SocialLink
                icon={<Mail className="w-5 h-5" />}
                label="Email"
                href="mailto:hello@carve.wiki"
              />
            </div>
          </div>
        </section>

        {/* Why Carve */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Why I'm Building Carve</h2>
          <div className="space-y-4">
            <ReasonCard
              emoji="🎮"
              title="Gamification Done Right"
              description="Most fitness apps add points and badges as an afterthought. I want to build a true RPG experience where every workout makes you stronger - both in the app and in real life."
            />
            <ReasonCard
              emoji="🤝"
              title="Community First"
              description="Fitness is better with friends. I want to create a platform where people motivate each other, compete healthily, and celebrate wins together."
            />
            <ReasonCard
              emoji="📚"
              title="Education Matters"
              description="There's so much misinformation in fitness. The Wiki is my way of providing evidence-based knowledge that helps people make informed decisions."
            />
            <ReasonCard
              emoji="🚀"
              title="Building in Public"
              description="I'm developing Carve transparently - sharing progress, listening to feedback, and involving the community in shaping the product."
            />
          </div>
        </section>

        {/* Tech Stack */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Tech Stack</h2>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <p className="text-gray-600 mb-6">
              Carve is built with modern, battle-tested technologies that prioritize performance, scalability, and developer experience.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <TechCategory
                title="Frontend"
                items={[
                  'Next.js 16 (App Router)',
                  'React 19',
                  'TypeScript',
                  'Tailwind CSS',
                  'Shadcn UI'
                ]}
              />
              <TechCategory
                title="Backend"
                items={[
                  'Supabase (PostgreSQL)',
                  'Supabase Auth',
                  'Edge Functions',
                  'Realtime subscriptions'
                ]}
              />
              <TechCategory
                title="Mobile"
                items={[
                  'React Native (planned)',
                  'Expo (planned)',
                  'Native modules for wearables'
                ]}
              />
              <TechCategory
                title="Infrastructure"
                items={[
                  'Vercel (hosting)',
                  'GitHub (version control)',
                  'Supabase (database)',
                  'Cloudflare (CDN)'
                ]}
              />
            </div>
          </div>
        </section>

        {/* Philosophy */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Development Philosophy</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <PhilosophyCard
              title="User First"
              description="Every feature decision is based on what makes the user experience better, not what's easier to build."
            />
            <PhilosophyCard
              title="Ship Fast"
              description="Perfect is the enemy of done. I'd rather iterate quickly based on real feedback than build in isolation."
            />
            <PhilosophyCard
              title="Stay Lean"
              description="Simple solutions are better than complex ones. No feature bloat, just what you need to succeed."
            />
          </div>
        </section>

        {/* Support */}
        <div className="text-center p-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white">
          <Coffee className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-3xl font-bold mb-4">
            Support Development
          </h3>
          <p className="text-xl mb-6 text-blue-100">
            Carve is an independent project. Your support helps keep it alive.
          </p>
          <div className="text-sm text-blue-100">
            Support options coming soon
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialLink({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700 font-medium"
    >
      {icon}
      {label}
    </a>
  );
}

function ReasonCard({ emoji, title, description }: { emoji: string; title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <span className="text-4xl">{emoji}</span>
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
}

function TechCategory({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="font-bold text-gray-900 mb-3">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
            <span className="text-blue-600 mt-0.5">•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PhilosophyCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}
