import { DarkCard } from "./shared";

interface QuickStatProps {
  label: string;
  value: number | string;
  unit?: string;
}

export function QuickStat({ label, value, unit }: QuickStatProps) {
  return (
    <DarkCard className="flex min-h-[280px] flex-col items-center justify-center">
      <p className="mb-4 text-sm text-[#8b92a8]">{label}</p>

      {/* Glow effect placeholder - will add in Phase 5 */}
      <div className="relative mb-4 h-24 w-24">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-500/20 to-green-500/20 blur-xl" />
      </div>

      {/* Value */}
      <div className="text-center">
        <div className="text-7xl font-bold tabular-nums text-white">
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
        {unit && (
          <div className="mt-2 text-sm text-[#8b92a8]">{unit}</div>
        )}
      </div>
    </DarkCard>
  );
}
