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

  // Form state - General
  const [siteName, setSiteName] = useState('Carve Wiki');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Form state - Users & Roles
  const [userRegistration, setUserRegistration] = useState(true);
  const [defaultRole, setDefaultRole] = useState('user');
  const [requireEmailVerification, setRequireEmailVerification] = useState(true);

  // Form state - Content
  const [enableWikiEditing, setEnableWikiEditing] = useState(true);
  const [moderateEdits, setModerateEdits] = useState(true);
  const [minEditReputation, setMinEditReputation] = useState('100');

  // Form state - Notifications
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [achievementAlerts, setAchievementAlerts] = useState(true);

  // Form state - Security
  const [enableTwoFactor, setEnableTwoFactor] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('24');
  const [maxLoginAttempts, setMaxLoginAttempts] = useState('5');

  // Form state - Integrations (XP)
  const [xpPerWorkout, setXpPerWorkout] = useState('50');
  const [xpPerMeal, setXpPerMeal] = useState('10');

  // Form state - Advanced
  const [weeklyResetDay, setWeeklyResetDay] = useState('1');

  const handleNavigate = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSaveGeneral = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Saving general settings:', { siteName, maintenanceMode });
  };

  const handleSaveUsers = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Saving user settings:', { userRegistration, defaultRole, requireEmailVerification });
  };

  const handleSaveContent = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Saving content settings:', { enableWikiEditing, moderateEdits, minEditReputation });
  };

  const handleSaveNotifications = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Saving notification settings:', { emailNotifications, weeklyDigest, achievementAlerts });
  };

  const handleSaveSecurity = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Saving security settings:', { enableTwoFactor, sessionTimeout, maxLoginAttempts });
  };

  const handleSaveXP = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Saving XP settings:', { xpPerWorkout, xpPerMeal });
  };

  const handleSaveAdvanced = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Saving advanced settings:', { weeklyResetDay });
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
            <SettingItem
              label="User Registration"
              description="Allow new users to register for accounts"
              htmlFor="user-registration"
            >
              <Switch
                id="user-registration"
                checked={userRegistration}
                onCheckedChange={setUserRegistration}
              />
            </SettingItem>

            <SettingItem
              label="Default User Role"
              description="Role assigned to new user accounts"
              htmlFor="default-role"
            >
              <Select value={defaultRole} onValueChange={setDefaultRole}>
                <SelectTrigger className="w-64" id="default-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="contributor">Contributor</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                </SelectContent>
              </Select>
            </SettingItem>

            <SettingItem
              label="Require Email Verification"
              description="Users must verify their email before full access"
              htmlFor="email-verification"
            >
              <Switch
                id="email-verification"
                checked={requireEmailVerification}
                onCheckedChange={setRequireEmailVerification}
              />
            </SettingItem>

            <SettingsSaveButton onSave={handleSaveUsers} />
          </SettingsSection>

          {/* Content Settings */}
          <SettingsSection
            id="content"
            title="Content"
            description="Configure content moderation and wiki settings"
          >
            <SettingItem
              label="Enable Wiki Editing"
              description="Allow users to create and edit wiki articles"
              htmlFor="wiki-editing"
            >
              <Switch
                id="wiki-editing"
                checked={enableWikiEditing}
                onCheckedChange={setEnableWikiEditing}
              />
            </SettingItem>

            <SettingItem
              label="Moderate Edits"
              description="Require admin approval for wiki edits"
              htmlFor="moderate-edits"
            >
              <Switch
                id="moderate-edits"
                checked={moderateEdits}
                onCheckedChange={setModerateEdits}
              />
            </SettingItem>

            <SettingItem
              label="Minimum Edit Reputation"
              description="Reputation required to edit wiki articles"
              htmlFor="min-edit-reputation"
            >
              <Input
                id="min-edit-reputation"
                type="number"
                value={minEditReputation}
                onChange={(e) => setMinEditReputation(e.target.value)}
                className="w-32"
              />
            </SettingItem>

            <SettingsSaveButton onSave={handleSaveContent} />
          </SettingsSection>

          {/* Notifications */}
          <SettingsSection
            id="notifications"
            title="Notifications"
            description="Configure email and notification preferences"
          >
            <SettingItem
              label="Email Notifications"
              description="Send email notifications for important events"
              htmlFor="email-notifications"
            >
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </SettingItem>

            <SettingItem
              label="Weekly Digest"
              description="Send weekly summary of activity and updates"
              htmlFor="weekly-digest"
            >
              <Switch
                id="weekly-digest"
                checked={weeklyDigest}
                onCheckedChange={setWeeklyDigest}
              />
            </SettingItem>

            <SettingItem
              label="Achievement Alerts"
              description="Notify users when they unlock achievements"
              htmlFor="achievement-alerts"
            >
              <Switch
                id="achievement-alerts"
                checked={achievementAlerts}
                onCheckedChange={setAchievementAlerts}
              />
            </SettingItem>

            <SettingsSaveButton onSave={handleSaveNotifications} />
          </SettingsSection>

          {/* Security */}
          <SettingsSection
            id="security"
            title="Security"
            description="Authentication and privacy settings"
          >
            <SettingItem
              label="Enable Two-Factor Authentication"
              description="Require 2FA for admin accounts"
              htmlFor="two-factor"
            >
              <Switch
                id="two-factor"
                checked={enableTwoFactor}
                onCheckedChange={setEnableTwoFactor}
              />
            </SettingItem>

            <SettingItem
              label="Session Timeout"
              description="Hours until inactive sessions expire"
              htmlFor="session-timeout"
            >
              <Input
                id="session-timeout"
                type="number"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                className="w-32"
              />
            </SettingItem>

            <SettingItem
              label="Max Login Attempts"
              description="Failed login attempts before account lockout"
              htmlFor="max-login-attempts"
            >
              <Input
                id="max-login-attempts"
                type="number"
                value={maxLoginAttempts}
                onChange={(e) => setMaxLoginAttempts(e.target.value)}
                className="w-32"
              />
            </SettingItem>

            <SettingsSaveButton onSave={handleSaveSecurity} />
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

            <SettingsSaveButton onSave={handleSaveAdvanced} />
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}
