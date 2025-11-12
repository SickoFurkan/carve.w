"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: "en", label: "EN", name: "English", flag: "🇬🇧" },
    { code: "nl", label: "NL", name: "Nederlands", flag: "🇳🇱" },
    { code: "de", label: "DE", name: "Deutsch", flag: "🇩🇪" },
    { code: "fr", label: "FR", name: "Français", flag: "🇫🇷" },
    { code: "es", label: "ES", name: "Español", flag: "🇪🇸" },
    { code: "it", label: "IT", name: "Italiano", flag: "🇮🇹" },
    { code: "pt", label: "PT", name: "Português", flag: "🇵🇹" },
    { code: "tr", label: "TR", name: "Türkçe", flag: "🇹🇷" },
    { code: "ar", label: "AR", name: "العربية", flag: "🇸🇦" },
    { code: "zh", label: "ZH", name: "中文", flag: "🇨🇳" },
  ];

  const handleLanguageChange = (newLocale: string) => {
    // Remove current locale from pathname and add new one
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPathname);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-black rounded-md transition-colors"
        aria-label="Select language"
      >
        {locale.toUpperCase()}
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto p-1">
          <div className="grid grid-cols-2 gap-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`text-left px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors rounded-md flex items-center gap-2 ${
                  locale === lang.code ? "font-bold text-black bg-gray-100" : "text-gray-700"
                }`}
              >
                <span className="text-base">{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
