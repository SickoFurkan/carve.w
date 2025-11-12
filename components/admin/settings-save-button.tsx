'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface SettingsSaveButtonProps {
  onSave: () => Promise<void>;
  onReset?: () => void;
}

export function SettingsSaveButton({ onSave, onReset }: SettingsSaveButtonProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave();
      // Could add toast notification here
    } catch (error) {
      console.error('Failed to save settings:', error);
      // Could add error toast here
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-3 pt-4">
      {onReset && (
        <Button
          variant="outline"
          onClick={onReset}
          disabled={isSaving}
        >
          Reset
        </Button>
      )}

      <Button
        onClick={handleSave}
        disabled={isSaving}
      >
        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isSaving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
}
