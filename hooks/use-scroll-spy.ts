'use client';

import { useEffect, useState } from 'react';

export function useScrollSpy(sectionIds: string[], offset: number = 100) {
  const [activeSection, setActiveSection] = useState<string>(() => {
    // Check URL hash on mount
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.slice(1);
      if (hash && sectionIds.includes(hash)) {
        return hash;
      }
    }
    return sectionIds[0];
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the most visible intersecting entry
        const intersectingEntries = entries.filter(entry => entry.isIntersecting);
        if (intersectingEntries.length > 0) {
          // Use the entry with highest intersection ratio
          const topEntry = intersectingEntries.sort((a, b) =>
            b.intersectionRatio - a.intersectionRatio
          )[0];

          setActiveSection(topEntry.target.id);
          // Update URL hash without scrolling
          window.history.replaceState(null, '', `#${topEntry.target.id}`);
        }
      },
      {
        rootMargin: `-${offset}px 0px -50% 0px`,
        threshold: 0,
      }
    );

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [sectionIds, offset]);

  return activeSection;
}
