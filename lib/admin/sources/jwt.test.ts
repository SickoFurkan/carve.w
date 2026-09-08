import { describe, expect, it } from 'vitest'
import { base64url, normalizePrivateKey, signingInput } from './jwt'

describe('base64url', () => {
  it('gebruikt geen +, / of = zodat het in een header past', () => {
    const uit = base64url(Buffer.from([251, 255, 190, 254, 0]))

    expect(uit).not.toMatch(/[+/=]/)
  })

  it('codeert JSON zonder opvulling', () => {
    expect(base64url(JSON.stringify({ alg: 'ES256' }))).toBe('eyJhbGciOiJFUzI1NiJ9')
  })
})

describe('signingInput', () => {
  it('plakt header en payload met een punt ertussen', () => {
    const uit = signingInput({ alg: 'ES256', kid: 'ABC' }, { iss: 'x', exp: 1 })

    expect(uit.split('.')).toHaveLength(2)
    expect(JSON.parse(Buffer.from(uit.split('.')[0], 'base64url').toString())).toEqual({
      alg: 'ES256',
      kid: 'ABC',
    })
  })
})

describe('normalizePrivateKey', () => {
  const echt = '-----BEGIN PRIVATE KEY-----\nMIGTAgEA\nBgUrgQQAIg==\n-----END PRIVATE KEY-----\n'

  it('zet letterlijke \\n terug naar echte regeleindes', () => {
    // @ai-why: Dit is de valkuil bij env-variabelen. Een sleutel in .env of in de
    // Vercel-omgeving komt binnen met \n als twee tekens, en dan faalt het ondertekenen
    // met een onbegrijpelijke fout uit node:crypto.
    const uitEnv = echt.replace(/\n/g, '\\n')

    expect(normalizePrivateKey(uitEnv)).toBe(echt)
  })

  it('laat de regeleindes binnen de sleutel staan en stript alleen de randen', () => {
    const uit = normalizePrivateKey(echt)

    expect(uit).toBe(echt.trim())
    expect(uit.split('\n')).toHaveLength(4)
  })

  it('haalt omringende aanhalingstekens weg', () => {
    expect(normalizePrivateKey(`"${echt}"`)).toBe(echt)
  })

  it('gooit als het er niet uitziet als een sleutel', () => {
    expect(() => normalizePrivateKey('geen sleutel')).toThrow(/PRIVATE KEY/)
  })
})
