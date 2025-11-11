'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Search, X } from 'lucide-react';
import { EvidenceRating } from './EvidenceRating';

interface SearchResult {
  slug: string;
  title: string;
  category: string;
  summary: string;
  tags: string[];
  evidence_rating: string;
  combined_rank: number;
}

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.rpc('search_wiki_articles', {
          search_query: query,
          search_language: 'auto',
        });

        if (error) throw error;

        setResults(data || []);
        setShowResults(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showResults || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          navigateToArticle(results[selectedIndex]);
        } else if (results.length > 0) {
          navigateToArticle(results[0]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        inputRef.current?.blur();
        break;
    }
  };

  const navigateToArticle = (result: SearchResult) => {
    router.push(`/wiki/${result.category}/${result.slug}`);
    setShowResults(false);
    setQuery('');
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    inputRef.current?.focus();
  };

  // Highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 text-zinc-900">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          placeholder="Zoek artikelen over fitness, voeding, training..."
          className="w-full pl-12 pr-12 py-4 bg-white rounded-lg shadow-md border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg transition-all"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 rounded-full transition-colors"
            aria-label="Clear search"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-zinc-200 max-h-[70vh] overflow-y-auto z-50">
          {isSearching ? (
            <div className="p-8 text-center text-zinc-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
              <p className="mt-2">Zoeken...</p>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="p-3 border-b border-zinc-100 text-xs text-zinc-500">
                {results.length} resultaten gevonden
              </div>
              <ul>
                {results.map((result, index) => (
                  <li key={result.slug}>
                    <button
                      onClick={() => navigateToArticle(result)}
                      className={`w-full text-left p-4 hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-b-0 ${
                        index === selectedIndex ? 'bg-zinc-50' : ''
                      }`}
                    >
                      {/* Evidence Rating */}
                      <div className="mb-2">
                        <EvidenceRating rating={result.evidence_rating} />
                      </div>

                      {/* Title */}
                      <h3 className="font-semibold text-zinc-900 mb-1">
                        {highlightMatch(result.title, query)}
                      </h3>

                      {/* Category */}
                      <div className="text-xs text-zinc-500 mb-2">
                        {result.category.split('-').map(word =>
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </div>

                      {/* Summary */}
                      {result.summary && (
                        <p className="text-sm text-zinc-600 line-clamp-2 mb-2">
                          {result.summary}
                        </p>
                      )}

                      {/* Tags */}
                      {result.tags && result.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {result.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : query.length >= 2 ? (
            <div className="p-8 text-center text-zinc-500">
              <p className="mb-2">Geen resultaten gevonden voor "{query}"</p>
              <p className="text-sm">Probeer andere zoektermen</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
