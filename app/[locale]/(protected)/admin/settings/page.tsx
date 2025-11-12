'use client';

import { useState } from 'react';
import { SettingsNav } from '@/components/admin/settings-nav';
import { SettingsMobileNav } from '@/components/admin/settings-mobile-nav';
import { SettingsSection } from '@/components/admin/settings-section';
import { SettingItem } from '@/components/admin/setting-item';
import { SettingsSaveButton } from '@/components/admin/settings-save-button';
import { useScrollSpy } from '@/hooks/use-scroll-spy';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const SECTION_IDS = [
  'general',
  'users',
  'content',
  'notifications',
  'security',
  'integrations',
  'advanced',
];

export default function AdminSettingsPage() {
  const activeSection = useScrollSpy(SECTION_IDS);

  // Form state
  const [siteName, setSiteName] = useState('Carve Wiki');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [xpPerWorkout, setXpPerWorkout] = useState('50');
  const [xpPerMeal, setXpPerMeal] = useState('10');
  const [weeklyResetDay, setWeeklyResetDay] = useState('1');

  const handleNavigate = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSaveGeneral = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Saving general settings:', { siteName, maintenanceMode });
  };

  const handleSaveXP = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Saving XP settings:', { xpPerWorkout, xpPerMeal });
  };

  const handleSaveLeaderboard = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Saving leaderboard settings:', { weeklyResetDay });
  };

  return (
    <div className="h-full lg:grid lg:grid-cols-[250px_1fr]">
      {/* Mobile Navigation */}
      <SettingsMobileNav
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />

      {/* Desktop Left Navigation */}
      <div className="hidden lg:block">
        <SettingsNav
          activeSection={activeSection}
          onNavigate={handleNavigate}
        />
      </div>

      {/* Right Content */}
      <div className="overflow-y-auto">
        <div className="p-6 max-w-4xl space-y-6">
          {/* General Settings */}
          <SettingsSection
            id="general"
            title="General"
            description="Configure site-wide settings and preferences"
          >
            <SettingItem
              label="Site Name"
              description="The name displayed in the header"
              htmlFor="site-name"
            >
              <Input
                id="site-name"
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-64"
              />
            </SettingItem>

            <SettingItem
              label="Maintenance Mode"
              description="Enable to show maintenance page to users"
              htmlFor="maintenance-mode"
            >
              <Switch
                id="maintenance-mode"
                checked={maintenanceMode}
                onCheckedChange={setMaintenanceMode}
              />
            </SettingItem>

            <SettingsSaveButton onSave={handleSaveGeneral} />
          </SettingsSection>

          {/* Users & Roles */}
          <SettingsSection
            id="users"
            title="Users & Roles"
            description="Manage user permissions and roles"
          >
            <p className="text-sm text-gray-600">
              User management settings coming soon...
            </p>
          </SettingsSection>

          {/* Content Settings */}
          <SettingsSection
            id="content"
            title="Content"
            description="Configure content moderation and wiki settings"
          >
            <p className="text-sm text-gray-600">
              Content settings coming soon...
            </p>
          </SettingsSection>

          {/* Notifications */}
          <SettingsSection
            id="notifications"
            title="Notifications"
            description="Configure email and notification preferences"
          >
            <p className="text-sm text-gray-600">
              Notification settings coming soon...
            </p>
          </SettingsSection>

          {/* Security */}
          <SettingsSection
            id="security"
            title="Security"
            description="Authentication and privacy settings"
          >
            <p className="text-sm text-gray-600">
              Security settings coming soon...
            </p>
          </SettingsSection>

          {/* Integrations */}
          <SettingsSection
            id="integrations"
            title="Integrations"
            description="Third-party services and API configurations"
          >
            <SettingItem
              label="XP per Workout"
              description="Base XP earned per completed workout"
              htmlFor="xp-workout"
            >
              <Input
                id="xp-workout"
                type="number"
                value={xpPerWorkout}
                onChange={(e) => setXpPerWorkout(e.target.value)}
                className="w-32"
              />
            </SettingItem>

            <SettingItem
              label="XP per Meal"
              description="Base XP earned per logged meal"
              htmlFor="xp-meal"
            >
              <Input
                id="xp-meal"
                type="number"
                value={xpPerMeal}
                onChange={(e) => setXpPerMeal(e.target.value)}
                className="w-32"
              />
            </SettingItem>

            <SettingsSaveButton onSave={handleSaveXP} />
          </SettingsSection>

          {/* Advanced */}
          <SettingsSection
            id="advanced"
            title="Advanced"
            description="System settings and danger zone"
          >
            <SettingItem
              label="Weekly Reset Day"
              description="Day of the week to reset leaderboards"
              htmlFor="reset-day"
            >
              <Select value={weeklyResetDay} onValueChange={setWeeklyResetDay}>
                <SelectTrigger className="w-64" id="reset-day">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Monday</SelectItem>
                  <SelectItem value="2">Tuesday</SelectItem>
                  <SelectItem value="3">Wednesday</SelectItem>
                  <SelectItem value="4">Thursday</SelectItem>
                  <SelectItem value="5">Friday</SelectItem>
                  <SelectItem value="6">Saturday</SelectItem>
                  <SelectItem value="0">Sunday</SelectItem>
                </SelectContent>
              </Select>
            </SettingItem>

            <SettingsSaveButton onSave={handleSaveLeaderboard} />
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}
