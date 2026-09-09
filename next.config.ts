import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ai-why: De marketingpagina woont sinds TDR-0007 op /app. Zowel / als /carve
  // sturen daar permanent (308) heen: allebei komen ze terug in oude links, in
  // advertenties en in de App Store-omgeving, en die mogen blijven werken.
  //
  // @ai-gotcha: /carve wijst rechtstreeks naar /app en niet naar /. Een redirect die op
  // een redirect uitkomt kost een tweede hop, en Google waardeert de laatste in de
  // keten. /carve/* (roadmap, faq, ...) blijft ongemoeid.
  //
  // @ai-sync: app/app/page.tsx
  // @ai-sync: app/sitemap.ts (/ staat er niet meer in, /app wel)
  // @ai-sync: docs/tdr/0007-de-marketingpagina-verhuist-naar-app.md
  async redirects() {
    return [
      { source: '/', destination: '/app', permanent: true },
      { source: '/carve', destination: '/app', permanent: true },
    ];
  },
  // @ai-tried: transpilePackages voor @celikerstudio/ui — breekt Turbopack subpath exports resolution.
  // Niet nodig: package shipt compiled JS in dist/ sinds v0.2.0.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
      },
    ],
  },
};

export default nextConfig;
