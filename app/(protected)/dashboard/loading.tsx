export default function DashboardLoading() {
  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 rounded-lg bg-white/5" />
          <div className="h-4 w-32 rounded-lg bg-white/5 mt-2" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-5 w-16 rounded-lg bg-white/5" />
          <div className="h-6 w-20 rounded-full bg-white/5" />
          <div className="h-5 w-12 rounded-lg bg-white/5" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-5">
            <div className="h-3 w-20 rounded bg-white/5 mb-3" />
            <div className="h-8 w-16 rounded bg-white/5" />
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-5 space-y-3">
          <div className="h-4 w-28 rounded bg-white/5" />
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-white/5" />
              <div className="h-4 w-24 rounded bg-white/5" />
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-5 space-y-3">
          <div className="h-4 w-24 rounded bg-white/5" />
          <div className="h-4 w-full rounded bg-white/5" />
          <div className="h-4 w-full rounded bg-white/5" />
        </div>
      </div>

      {/* Daily routine */}
      <div className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-5">
        <div className="h-4 w-28 rounded bg-white/5 mb-4" />
        <div className="h-10 w-full rounded bg-white/5" />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-5">
            <div className="h-5 w-24 rounded bg-white/5 mb-2" />
            <div className="h-4 w-full rounded bg-white/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
