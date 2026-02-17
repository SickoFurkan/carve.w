export default function MoneyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full bg-[#111318] overflow-y-auto relative">
      {/* Subtle gradient glow in background */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_rgba(19,91,236,0.08)_0%,_transparent_70%)] pointer-events-none" />
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  )
}
