interface EvidenceRatingProps {
  rating: string;
}

const ratingConfig = {
  'well-established': {
    label: 'Well-Established',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: '🟢',
    description: 'Strong peer-reviewed consensus with multiple meta-analyses',
  },
  'emerging-research': {
    label: 'Emerging Research',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: '🟡',
    description: 'Promising research findings that need more replication studies',
  },
  'expert-consensus': {
    label: 'Expert Consensus',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
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
        <div className="bg-zinc-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
          {config.description}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-zinc-900"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
