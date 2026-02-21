export default function WorkoutsLoading() {
  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-36 rounded-lg bg-white/5" />
          <div className="h-4 w-64 rounded-lg bg-white/5 mt-2" />
        </div>
        <div className="h-9 w-32 rounded-lg bg-white/5" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-5">
            <div className="h-3 w-24 rounded bg-white/5 mb-3" />
            <div className="h-8 w-12 rounded bg-white/5" />
          </div>
        ))}
      </div>

      {/* Workout list */}
      {[1, 2].map((i) => (
        <div key={i} className="space-y-3">
          <div className="h-4 w-48 rounded bg-white/5" />
          {[1, 2].map((j) => (
            <div key={j} className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="h-5 w-32 rounded bg-white/5" />
                  <div className="h-3 w-24 rounded bg-white/5 mt-2" />
                </div>
                <div className="h-3 w-16 rounded bg-white/5" />
              </div>
              <div className="space-y-2">
                {[1, 2].map((k) => (
                  <div key={k} className="flex justify-between p-3 rounded-lg bg-white/[0.03]">
                    <div className="h-4 w-28 rounded bg-white/5" />
                    <div className="h-4 w-20 rounded bg-white/5" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
