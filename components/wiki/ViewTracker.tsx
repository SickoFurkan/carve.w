'use client';

import { useEffect } from 'react';

interface ViewTrackerProps {
  slug: string;
}

// Check if article viewed today (client-side localStorage)
function hasViewedToday(slug: string): boolean {
  if (typeof window === 'undefined') return false;

  const key = `viewed_${slug}`;
  const viewedDate = localStorage.getItem(key);
  const today = new Date().toDateString();

  return viewedDate === today;
}

// Mark article as viewed today
function markViewedToday(slug: string) {
  if (typeof window === 'undefined') return;

  const key = `viewed_${slug}`;
  const today = new Date().toDateString();
  localStorage.setItem(key, today);
}

/**
 * ViewTracker Component
 *
 * Privacy-friendly view tracking using client-side localStorage
 * - No IP storage
 * - No server-side sessions
 * - GDPR-compliant
 * - Deduplicates by article per day
 */
export function ViewTracker({ slug }: ViewTrackerProps) {
  useEffect(() => {
    // Only track if not viewed today
    if (!hasViewedToday(slug)) {
      // Call API to increment view count
      fetch('/api/wiki/track-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      })
        .then((res) => {
          if (res.ok) {
            markViewedToday(slug);
          }
        })
        .catch(() => {
          // Fail silently - view tracking is optional
        });
    }
  }, [slug]);

  // No UI rendering
  return null;
}
