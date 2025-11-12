import { ReactNode } from 'react';

interface SettingsSectionProps {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export function SettingsSection({
  id,
  title,
  description,
  children
}: SettingsSectionProps) {
  return (
    <section id={id} className="scroll-mt-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          )}
        </div>

        <div className="space-y-6">
          {children}
        </div>
      </div>
    </section>
  );
}
