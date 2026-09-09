import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        // @ai-why: Deze drie stappen moeten in deze volgorde, en de tweede is degene
        // die stil misgaat. `NextResponse.next({ request })` legt de cookies vást op het
        // moment dat je hem aanmaakt; hij zet ze in de header `x-middleware-request-cookie`
        // en dát is wat de server components straks lezen. `request.cookies.set()` daarna
        // verandert die header niet meer. Dus moet de response opnieuw gemaakt worden,
        // ná het bijwerken van het verzoek.
        //
        // @ai-context: Wat er gebeurde toen dat niet zo was: Supabase ververst hier een
        // verlopen access token, de middleware ziet daarmee een geldige sessie en laat je
        // door, maar de pagina erachter krijgt nog het oude token te lezen en ziet géén
        // gebruiker. `app/page.tsx` stuurt dan door naar /app. Je bent ingelogd en komt
        // toch op de marketingpagina uit, één keer per uur als het token verloopt, en aan
        // de code van de pagina is niets te zien.
        //
        // @ai-fragile: Draai de volgorde niet om en haal de hertoewijzing niet weg omdat
        // hij overbodig lijkt. Zonder die regel is er geen foutmelding, alleen een sessie
        // die soms niet aankomt.
        //
        // @ai-sync: middleware.ts (kopieert deze cookies naar elke omleiding)
        // @ai-sync: app/page.tsx (de pagina die het oude token te zien kreeg)
        // @ai-sync: lib/supabase/middleware.test.ts
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { supabase, response: supabaseResponse, user }
}
