import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-4xl font-bold text-white mb-4">404</h1>
      <p className="text-white/50 mb-8">The page you're looking for doesn't exist.</p>
      <Link
        href="/"
        className="px-6 py-3 bg-white/[0.08] border border-white/[0.08] text-white rounded-xl hover:bg-white/[0.12] transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}
