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
      <div className="bg-[#1c1f27] border border-white/[0.06] rounded-xl p-5">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-white">{title}</h2>
          {description && (
            <p className="text-[#9da6b9] mt-1">{description}</p>
          )}
        </div>

        <div className="space-y-6">
          {children}
        </div>
      </div>
    </section>
  );
}
