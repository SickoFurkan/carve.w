'use client';

import { useEffect, useState } from 'react';

interface TocEntry {
  level: number;
  text: string;
  id: string;
}

interface TableOfContentsProps {
  html: string;
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

export function TableOfContents({ html }: TableOfContentsProps) {
  const [toc, setToc] = useState<TocEntry[]>([]);
  const [activeId, setActiveId] = useState<string>('');

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
    <nav className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide mb-4">
        Table of Contents
      </h3>
      <ul className="space-y-2 text-sm">
        {toc.map((entry) => (
          <li
            key={entry.id}
            style={{ paddingLeft: `${(entry.level - 2) * 12}px` }}
          >
            <a
              href={`#${entry.id}`}
              className={`block py-1 hover:text-blue-600 transition-colors ${
                activeId === entry.id
                  ? 'text-blue-600 font-medium'
                  : 'text-zinc-600'
              }`}
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
