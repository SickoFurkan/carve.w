import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

// @ai-why: updateSession praat met Supabase over het netwerk. Wat hier telt is niet of
// die aanroep werkt, maar of de middleware de cookies die hij terugkrijgt doorgeeft aan
// de response die de browser krijgt. Dus: een dubbel dat altijd een ververste cookie zet.
const updateSession = vi.hoisted(() => vi.fn())
vi.mock('@/lib/supabase/middleware', () => ({ updateSession }))

const { middleware } = await import('./middleware')

const VERVERST = 'sb-carve-auth-token'

function sessie(user: { id: string } | null) {
  return () => {
    const response = NextResponse.next()
    response.cookies.set(VERVERST, 'nieuw-token', { path: '/' })
    return Promise.resolve({ response, user })
  }
}

beforeEach(() => {
  updateSession.mockReset()
})

describe('middleware geeft de ververste sessiecookie door', () => {
  it('bij de omleiding van / naar /app zonder sessie', async () => {
    updateSession.mockImplementation(sessie(null))

    const res = await middleware(new NextRequest('http://localhost:3000/'))

    expect(res.headers.get('location')).toBe('http://localhost:3000/app')
    expect(res.cookies.get(VERVERST)?.value).toBe('nieuw-token')
  })

  it('bij de omleiding van /login naar / met sessie', async () => {
    updateSession.mockImplementation(sessie({ id: 'furkan' }))

    const res = await middleware(new NextRequest('http://localhost:3000/login'))

    expect(res.headers.get('location')).toBe('http://localhost:3000/')
    expect(res.cookies.get(VERVERST)?.value).toBe('nieuw-token')
  })

  it('bij de omleiding van een beschermde route naar /login', async () => {
    updateSession.mockImplementation(sessie(null))

    const res = await middleware(new NextRequest('http://localhost:3000/dashboard'))

    expect(res.headers.get('location')).toBe('http://localhost:3000/login?redirect=%2Fdashboard')
    expect(res.cookies.get(VERVERST)?.value).toBe('nieuw-token')
  })
})
