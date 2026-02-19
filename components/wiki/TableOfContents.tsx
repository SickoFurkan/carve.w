'use client';

import { useEffect, useState } from 'react';
import { getCategoryColor } from '@/lib/wiki/category-colors';

interface TocEntry {
  level: number;
  text: string;
  id: string;
}

interface TableOfContentsProps {
  html: string;
  category?: string;
}

// Extract TOC from HTML (h2-h6 tags with IDs)
function extractTocFromHtml(html: string): TocEntry[] {
  const toc: TocEntry[] = [];
  const headingRegex = /<h([2-6])\s+id="([^"]+)">(.+?)<\/h\1>/g;
  let match;

  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1]);
    const id = match[2];
    const text = match[3].replace(/<[^>]*>/g, ''); // Strip HTML tags

    toc.push({ level, text, id });
  }

  return toc;
}

export function TableOfContents({ html, category }: TableOfContentsProps) {
  const [toc, setToc] = useState<TocEntry[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const colors = category ? getCategoryColor(category) : null;

  useEffect(() => {
    // Extract TOC on mount
    const entries = extractTocFromHtml(html);
    setToc(entries);

    // Set up intersection observer for active section highlighting
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -80% 0px' }
    );

    // Observe all headings
    entries.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [html]);

  if (toc.length === 0) {
    return null;
  }

  return (
    <nav className="bg-[rgba(28,31,39,0.5)] backdrop-blur-xl border border-white/[0.08] rounded-xl p-6">
      <h3 className="text-[11px] font-semibold text-white/30 uppercase tracking-[0.15em] mb-4">
        Contents
      </h3>
      <ul className="space-y-2 text-sm">
        {toc.map((entry) => (
          <li
            key={entry.id}
            style={{ paddingLeft: `${(entry.level - 2) * 12}px` }}
          >
            <a
              href={`#${entry.id}`}
              className={`block py-1 transition-colors ${
                activeId === entry.id
                  ? `${colors?.text || 'text-white'} font-medium border-l-2 pl-2`
                  : 'text-white/50 hover:text-white/80'
              }`}
              style={activeId === entry.id && colors ? { borderLeftColor: colors.hex } : undefined}
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
