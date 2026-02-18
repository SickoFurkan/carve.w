import Link from 'next/link';

const LINKS = [
  { href: '/carve/roadmap', label: 'Roadmap' },
  { href: '/carve/vision', label: 'Vision' },
  { href: '/carve/faq', label: 'FAQ' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
] as const;

export function CarveFooter() {
  return (
    <div className="border-t border-white/[0.08] pt-8">
      <div className="flex flex-wrap justify-center gap-6 text-sm text-white/30 mb-6">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="hover:text-white/60 transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>
      <p className="text-white/20 text-xs">
        celiker studio 2026 &middot; amsterdam
      </p>
    </div>
  );
}
