'use client'

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('demo-banner-dismissed');
    setDismissed(!!isDismissed);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('demo-banner-dismissed', 'true');
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div className="sticky top-0 z-50 bg-yellow-50 border-b border-yellow-200 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <p className="text-sm text-yellow-900">
          <strong>Demo Mode:</strong> You're viewing sample data.{' '}
          <a href="/" className="underline font-semibold">
            Join waitlist to track for real
          </a>
        </p>
        <button onClick={handleDismiss} className="text-yellow-600 hover:text-yellow-900">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
