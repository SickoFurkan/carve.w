'use client';

import { useEffect, useState } from 'react';
import {
  Settings,
  Users,
  FileText,
  Bell,
  Shield,
  Plug,
  Wrench
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsCategory {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const categories: SettingsCategory[] = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'users', label: 'Users & Roles', icon: Users },
  { id: 'content', label: 'Content', icon: FileText },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'advanced', label: 'Advanced', icon: Wrench },
];

interface SettingsNavProps {
  activeSection: string;
  onNavigate: (id: string) => void;
}

export function SettingsNav({ activeSection, onNavigate }: SettingsNavProps) {
  return (
    <nav className="sticky top-0 h-screen overflow-y-auto p-6 border-r border-gray-200 bg-white">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <ul className="space-y-1">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = activeSection === category.id;

          return (
            <li key={category.id}>
              <button
                onClick={() => onNavigate(category.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors',
                  'hover:bg-gray-50',
                  isActive && 'bg-gray-100 font-semibold border-l-4 border-blue-600 -ml-[2px]',
                  !isActive && 'text-gray-700'
                )}
              >
                <Icon className={cn(
                  'w-5 h-5',
                  isActive ? 'text-blue-600' : 'text-gray-400'
                )} />
                <span>{category.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
