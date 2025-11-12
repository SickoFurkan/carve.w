import { UserCheck } from 'lucide-react';

interface ExpertReviewBadgeProps {
  reviewers: string[];
}

export function ExpertReviewBadge({ reviewers }: ExpertReviewBadgeProps) {
  if (!reviewers || reviewers.length === 0) {
    return null;
  }

  return (
    <div className="flex items-start gap-3 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
      <div className="flex-shrink-0 mt-0.5">
        <UserCheck className="w-5 h-5 text-blue-600" />
      </div>
      <div>
        <div className="font-semibold text-blue-900 text-sm mb-1">
          Expert Reviewed
        </div>
        <div className="text-blue-800 text-sm">
          {reviewers.length === 1 ? (
            <>
              Reviewed by <span className="font-medium">{reviewers[0]}</span>
            </>
          ) : (
            <>
              Reviewed by{' '}
              {reviewers.map((reviewer, index) => (
                <span key={reviewer}>
                  <span className="font-medium">{reviewer}</span>
                  {index < reviewers.length - 2 && ', '}
                  {index === reviewers.length - 2 && ' and '}
                </span>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
