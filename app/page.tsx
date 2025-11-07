import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col h-full">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6">
            Your complete guide to
            <span className="block text-gray-500 mt-2">health and fitness</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Evidence-based information on nutrition, training, and wellness.
            Track your progress with personalized dashboards.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/wiki"
              className="px-8 py-3 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition-colors"
            >
              Explore Wiki →
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-3 border border-gray-300 font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Track, learn, and optimize your health journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-3">Knowledge Base</h3>
              <p className="text-gray-600">
                Access evidence-based articles on nutrition, fitness, and health
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-3">Track Progress</h3>
              <p className="text-gray-600">
                Monitor your health metrics and fitness goals in real-time
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-3">Personalized</h3>
              <p className="text-gray-600">
                Get customized recommendations based on your data
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
