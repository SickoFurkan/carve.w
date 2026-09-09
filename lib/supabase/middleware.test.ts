import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

// @ai-why: createServerClient praat met Supabase over het netwerk. Wat hier telt is wat
// `updateSession` doet met de cookies die Supabase terúggeeft bij een tokenverversing,
// dus het dubbel roept `setAll` aan alsof het token net is ververst.
const createServerClient = vi.hoisted(() => vi.fn())
vi.mock('@supabase/ssr', () => ({ createServerClient }))

const { updateSession } = await import('./middleware')

const COOKIE = 'sb-carve-auth-token'

/** Een Supabase-dubbel dat tijdens getUser() een nieuw token op de cookies zet. */
function ververstTokenTijdensGetUser(user: { id: string } | null) {
  return (
    _url: string,
    _key: string,
    opties: { cookies: { setAll: (c: { name: string; value: string; options: object }[]) => void } },
  ) => ({
    auth: {
      getUser: async () => {
        opties.cookies.setAll([{ name: COOKIE, value: 'nieuw-token', options: { path: '/' } }])
        return { data: { user } }
      },
    },
  })
}

function verzoekMetOudToken() {
  return new NextRequest('http://localhost:3000/', {
    headers: { cookie: `${COOKIE}=oud-token` },
  })
}

beforeEach(() => {
  createServerClient.mockReset()
})

describe('updateSession na een tokenverversing', () => {
  it('geeft het nieuwe token door aan de pagina, niet het oude', async () => {
    createServerClient.mockImplementation(ververstTokenTijdensGetUser({ id: 'furkan' }))

    const { response, user } = await updateSession(verzoekMetOudToken())

    expect(user).toEqual({ id: 'furkan' })
    // @ai-gotcha: `x-middleware-request-cookie` is hoe Next de cookies doorgeeft aan de
    // server components achter de middleware. Interne header, maar het is de enige plek
    // waar te zien is wát de pagina straks leest — en juist dáár ging het mis: de
    // middleware zag een sessie en app/page.tsx niet, dus stuurde die door naar /app.
    // @ai-sync: app/page.tsx
    expect(response.headers.get('x-middleware-request-cookie')).toBe(`${COOKIE}=nieuw-token`)
  })

  it('zet het nieuwe token ook als cookie op de browser', async () => {
    createServerClient.mockImplementation(ververstTokenTijdensGetUser({ id: 'furkan' }))

    const { response } = await updateSession(verzoekMetOudToken())

    expect(response.cookies.get(COOKIE)?.value).toBe('nieuw-token')
  })
})
