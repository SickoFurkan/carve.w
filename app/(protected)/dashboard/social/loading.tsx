export default function SocialLoading() {
  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-36 rounded-lg bg-white/5" />
          <div className="h-4 w-52 rounded-lg bg-white/5 mt-2" />
        </div>
        <div className="h-9 w-36 rounded-lg bg-white/5" />
      </div>

      {/* Activity feed */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white/5 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-white/5" />
                <div className="h-3 w-16 rounded bg-white/5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
