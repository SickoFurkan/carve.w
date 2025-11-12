export const metadata = {
  title: 'Vision - Carve',
  description: 'Our vision for the future of fitness tracking and gamification.',
};

export default function VisionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-20">
          <div className="inline-block p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6">
            <span className="text-6xl">🎯</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Our Vision
          </h1>
          <p className="text-2xl text-gray-600 leading-relaxed">
            To make fitness tracking so engaging and rewarding that it becomes a natural part of daily life.
          </p>
        </div>

        {/* Core Beliefs */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Core Beliefs</h2>
          <div className="space-y-6">
            <BeliefCard
              icon="🎮"
              title="Fitness Should Be Fun"
              description="Traditional fitness tracking is boring. We believe that gamification, achievements, and social features can make working out feel like leveling up in your favorite game."
            />
            <BeliefCard
              icon="📊"
              title="Data Drives Progress"
              description="You can't improve what you don't measure. We make it effortless to track your workouts, nutrition, and progress with beautiful visualizations that tell your fitness story."
            />
            <BeliefCard
              icon="🤝"
              title="Community Amplifies Results"
              description="Working out alone is hard. Training with friends, competing on leaderboards, and sharing achievements creates accountability and motivation that keeps you going."
            />
            <BeliefCard
              icon="🧠"
              title="Knowledge Empowers Change"
              description="Understanding the science behind training and nutrition helps you make better decisions. Our wiki provides evidence-based information to support your journey."
            />
          </div>
        </section>

        {/* The Future */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">The Future</h2>
          <div className="prose prose-lg max-w-none">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <p className="text-gray-700 leading-relaxed mb-4">
                We envision a world where <strong>fitness tracking is seamless, intelligent, and social</strong>. Where your phone automatically logs your workout when you hit the gym. Where AI analyzes your data and suggests exactly what you need to do next. Where you can challenge your friends to a push-up competition and see the results in real-time.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Carve will become the <strong>central hub for your entire fitness journey</strong> - from finding workout partners to discovering new exercises, from tracking your PRs to learning proper nutrition, from celebrating milestones to staying accountable.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We're building more than an app. We're building a <strong>movement</strong> - a community of people who believe that getting stronger, faster, and healthier should be as engaging as any game, and as social as any platform.
              </p>
            </div>
          </div>
        </section>

        {/* Why Now */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Why Now?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <ReasonCard
              title="Fitness Apps Are Stale"
              description="Most tracking apps haven't innovated in years. They're complex, boring, and focused on hardcore athletes rather than everyday people."
            />
            <ReasonCard
              title="Gamification Works"
              description="Games have mastered engagement. It's time to apply those principles to fitness in a meaningful way."
            />
            <ReasonCard
              title="Community Is Everything"
              description="Social platforms have shown us the power of connection. Fitness should be social by default, not an afterthought."
            />
            <ReasonCard
              title="Technology Is Ready"
              description="AI, wearables, and mobile capabilities have reached a point where we can build experiences that were impossible just a few years ago."
            />
          </div>
        </section>

        {/* Join Us */}
        <div className="text-center p-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white">
          <h3 className="text-3xl font-bold mb-4">
            Join Us on This Journey
          </h3>
          <p className="text-xl mb-8 text-blue-100">
            We're just getting started. Be part of building the future of fitness.
          </p>
          <a
            href="/carve/contributing"
            className="inline-block bg-white text-blue-600 font-semibold px-8 py-4 rounded-lg hover:shadow-xl transition-all text-lg"
          >
            Get Involved
          </a>
        </div>
      </div>
    </div>
  );
}

function BeliefCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <span className="text-4xl">{icon}</span>
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}

function ReasonCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
