import Link from "next/link"
import { HealthCard } from "@/components/dashboard/shared"

interface QuickLinkCardProps {
  href: string
  title: string
  description: string
  icon: string
}

export function QuickLinkCard({ href, title, description, icon }: QuickLinkCardProps) {
  return (
    <Link href={href}>
      <HealthCard className="hover:border-emerald-400/30 transition-colors cursor-pointer group">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-lg">{icon}</span>
          <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
            {title}
          </h3>
        </div>
        <p className="text-[#9da6b9] text-sm">{description}</p>
      </HealthCard>
    </Link>
  )
}
