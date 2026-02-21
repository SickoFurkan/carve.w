import { HealthCard } from "@/components/dashboard/shared"

interface HealthStatCardProps {
  label: string
  value: string | number
  unit?: string
}

export function HealthStatCard({ label, value, unit }: HealthStatCardProps) {
  return (
    <HealthCard>
      <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">
        {label}
      </p>
      <p className="text-3xl font-bold text-white tracking-tight">
        {value}
      </p>
      {unit && (
        <p className="text-[#9da6b9] text-sm mt-1">{unit}</p>
      )}
    </HealthCard>
  )
}
