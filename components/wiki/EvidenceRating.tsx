interface EvidenceRatingProps {
  rating: string;
}

const ratingConfig = {
  'well-established': {
    label: 'Well-Established',
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    icon: '🟢',
    description: 'Strong peer-reviewed consensus with multiple meta-analyses',
  },
  'emerging-research': {
    label: 'Emerging Research',
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    icon: '🟡',
    description: 'Promising research findings that need more replication studies',
  },
  'expert-consensus': {
    label: 'Expert Consensus',
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    icon: '🔵',
    description: 'Based on practitioner experience with limited research',
  },
};

export function EvidenceRating({ rating }: EvidenceRatingProps) {
  const config = ratingConfig[rating as keyof typeof ratingConfig] || ratingConfig['expert-consensus'];

  return (
    <div className="group relative">
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.color} text-sm font-medium`}>
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
        <div className="bg-[rgba(28,31,39,0.95)] backdrop-blur-xl border border-white/[0.08] text-white shadow-[0_4px_30px_rgba(0,0,0,0.5)] text-xs rounded-lg px-3 py-2 whitespace-nowrap">
          {config.description}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-[rgba(28,31,39,0.95)]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
