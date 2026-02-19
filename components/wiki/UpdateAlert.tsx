import { AlertTriangle } from 'lucide-react';

interface UpdateAlertProps {
  message?: string;
}

export function UpdateAlert({ message }: UpdateAlertProps) {
  const defaultMessage = 'This article is being reviewed for accuracy based on new research findings.';

  return (
    <div className="mb-6 p-4 bg-amber-500/10 border-l-4 border-amber-500/50 rounded-xl flex items-start gap-3">
      <div className="flex-shrink-0 mt-0.5">
        <AlertTriangle className="w-5 h-5 text-amber-400" />
      </div>
      <div>
        <div className="font-semibold text-amber-400 text-sm mb-1">
          Under Review
        </div>
        <div className="text-amber-300/80 text-sm">
          {message || defaultMessage}
        </div>
      </div>
    </div>
  );
}
