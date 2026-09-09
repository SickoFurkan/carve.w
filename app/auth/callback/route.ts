import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // @ai-why: De wortel is sinds TDR-0008 de cockpit. Stond hier `/chat`, wat nog wérkt
  // via de 308, maar dan doet elke login een extra hop en staat de bestemming op twee
  // plekken verschillend.
  // @ai-sync: components/landing/AuthCard.tsx
  // @ai-sync: components/landing/InlineAuth.tsx
  const redirect = requestUrl.searchParams.get('redirect') || '/'

  return NextResponse.redirect(`${origin}${redirect}`)
}
