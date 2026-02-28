import Link from "next/link"

export default function CarveTravelPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <h1 className="text-4xl font-bold text-white tracking-tight mb-4">
          Carve Travel
        </h1>
        <p className="text-[#9da6b9] text-lg mb-8">
          AI-powered travel planning for solo travelers. Describe your dream trip and get a complete plan in minutes.
        </p>
        <Link
          href="/dashboard/travel"
          className="inline-block px-6 py-3 text-sm font-medium text-white bg-[#b8d8e8]/20 hover:bg-[#b8d8e8]/30 rounded-xl transition-colors"
        >
          Start planning
        </Link>
      </div>
    </div>
  )
}
