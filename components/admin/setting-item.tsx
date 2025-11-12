import { ReactNode } from 'react';
import { Label } from '@/components/ui/label';

interface SettingItemProps {
  label: string;
  description: string;
  children: ReactNode;
  htmlFor?: string;
}

export function SettingItem({
  label,
  description,
  children,
  htmlFor
}: SettingItemProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-gray-100 last:border-0 last:pb-0">
      <div className="flex-1">
        <Label
          htmlFor={htmlFor}
          className="font-medium text-gray-900 cursor-pointer"
        >
          {label}
        </Label>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>

      <div className="flex-shrink-0">
        {children}
      </div>
    </div>
  );
}
