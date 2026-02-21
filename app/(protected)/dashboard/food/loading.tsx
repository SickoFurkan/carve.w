export default function FoodLoading() {
  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-36 rounded-lg bg-white/5" />
          <div className="h-4 w-52 rounded-lg bg-white/5 mt-2" />
        </div>
        <div className="h-9 w-28 rounded-lg bg-white/5" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-5">
            <div className="h-3 w-20 rounded bg-white/5 mb-3" />
            <div className="h-8 w-12 rounded bg-white/5" />
          </div>
        ))}
      </div>

      {/* Meal list */}
      {[1, 2].map((i) => (
        <div key={i} className="space-y-3">
          <div className="h-4 w-48 rounded bg-white/5" />
          <div className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-5">
            <div className="h-4 w-full rounded bg-white/5" />
          </div>
          {[1, 2].map((j) => (
            <div key={j} className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-5 space-y-2">
              <div className="h-5 w-32 rounded bg-white/5" />
              <div className="h-4 w-48 rounded bg-white/5" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
