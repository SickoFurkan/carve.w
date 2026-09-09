import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { SHOW_WEB_APP } from '@/lib/flags'

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request)
  const pathname = request.nextUrl.pathname

  // @ai-why: De wortel is sinds TDR-0008 de cockpit. Zonder sessie ga je naar /app en
  // niet naar /login: `carve.wiki` is het adres in advertenties, in de App Store-listing
  // en in de bio-link, en een bezoeker die daar een formulier ziet is weg.
  //
  // @ai-gotcha: 307 en niet 308. Een permanente redirect blijft in de browsercache staan,
  // en dan komt dezelfde persoon ná het inloggen nog steeds op /app uit. Dat is niet te
  // debuggen zonder de cache te legen, want er is niets aan de code te zien.
  //
  // @ai-sync: app/page.tsx
  // @ai-sync: next.config.ts (geen config-redirect op /, die zou hier vóór komen)
  // @ai-sync: docs/tdr/0008-de-cockpit-is-de-homepage.md
  if (pathname === '/' && !user) {
    return NextResponse.redirect(new URL('/app', request.url))
  }

  // Redirect unauthenticated users away from protected routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/money') || pathname.startsWith('/travel') || pathname.startsWith('/workouts') || pathname.startsWith('/food') || pathname.startsWith('/social') || pathname.startsWith('/profile') || pathname.startsWith('/settings') || pathname.startsWith('/health') || pathname.startsWith('/inbox')) {
    if (!user) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // @ai-why: Geen nieuwe web-accounts zolang het platform uit staat. Inloggen blijft
  // wél werken: een bestaand account moet erin kunnen en de cockpit in /chat hangt eraan.
  // @ai-sync: lib/flags.ts (SHOW_WEB_APP)
  if (pathname === '/signup' && !SHOW_WEB_APP) {
    return NextResponse.redirect(new URL('/app', request.url))
  }

  // Redirect authenticated users away from auth pages
  if (pathname === '/login' || pathname === '/signup') {
    if (user) {
      // @ai-why: Naar de wortel, want daar zit sinds TDR-0008 de cockpit. Niet meer
      // afhankelijk van SHOW_WEB_APP: die vlag dekt het web-platform en niet de cockpit,
      // en de grens is hier de sessie die we net hebben vastgesteld.
      // @ai-sync: docs/tdr/0008-de-cockpit-is-de-homepage.md
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // @ai-why: Hier stond tot 2026-09-09 een redirect van / naar /chat voor ingelogde
  // bezoekers. Die is weg omdat `next.config.ts` sinds TDR-0007 / permanent naar /app
  // stuurt, en config-redirects komen vóór de middleware. De regel zou dus nooit meer
  // vuren, en een redirect die er wel staat maar nooit werkt is erger dan geen: hij
  // leest als een garantie. Wil je ingelogde bezoekers weghouden van de marketingpagina,
  // dan is /app de plek en niet /.
  // @ai-sync: next.config.ts (redirects)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
