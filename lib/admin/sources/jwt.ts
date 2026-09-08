/**
 * JWT's ondertekenen voor Apple (ES256) en Google (RS256).
 *
 * @ai-why: Met node:crypto en niet met een SDK. `@google-analytics/data` sleept gRPC en
 * protobuf mee voor één rapportaanroep, en voor App Store Connect bestaat geen officiële
 * JS-client. Wat overblijft is dertig regels ondertekenen die allebei de kanten dekt.
 * Een JWT-library zou hier ook kunnen; het scheelt geen code en kost een afhankelijkheid
 * die meegaat in elke bundle.
 *
 * @ai-gotcha: Dit hoort alleen op de server te draaien. De sleutels staan in env-vars
 * zonder NEXT_PUBLIC_-prefix, dus importeer deze module nooit vanuit een client component;
 * de build faalt dan niet, maar de aanroep wel, en pas op het moment dat je hem nodig hebt.
 */

import { createSign, createPrivateKey, sign as cryptoSign } from 'node:crypto'

export function base64url(input: string | Buffer): string {
  const buf = typeof input === 'string' ? Buffer.from(input) : input
  return buf.toString('base64url')
}

export function signingInput(header: object, payload: object): string {
  return `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`
}

/**
 * @ai-why: Env-variabelen kunnen geen echte regeleindes bevatten, dus een private key
 * komt binnen als `-----BEGIN...\n...` met een letterlijke backslash-n. node:crypto geeft
 * daar geen leesbare fout op maar een generieke DECODER-fout, en dan zoek je een uur in
 * de verkeerde richting. Vandaar de vertaling hier, met een expliciete controle erna.
 */
export function normalizePrivateKey(raw: string): string {
  const zonderQuotes = raw.trim().replace(/^["']|["']$/g, '')
  const key = zonderQuotes.replace(/\\n/g, '\n')

  if (!key.includes('PRIVATE KEY')) {
    throw new Error(
      'De sleutel ziet er niet uit als een PEM private key. Verwacht een blok dat begint met -----BEGIN PRIVATE KEY-----.',
    )
  }

  return key
}

/** App Store Connect: ES256, sleutel uit het `.p8`-bestand. */
export function signES256(header: object, payload: object, privateKeyPem: string): string {
  const input = signingInput(header, payload)
  const key = createPrivateKey(normalizePrivateKey(privateKeyPem))

  // @ai-gotcha: `dsaEncoding: 'ieee-p1363'` is verplicht. De standaard is DER, en Apple
  // wijst een DER-handtekening af met 401 zonder te zeggen waarom.
  const signature = cryptoSign('sha256', Buffer.from(input), {
    key,
    dsaEncoding: 'ieee-p1363',
  })

  return `${input}.${base64url(signature)}`
}

/** Google service account: RS256. */
export function signRS256(header: object, payload: object, privateKeyPem: string): string {
  const input = signingInput(header, payload)
  const signer = createSign('RSA-SHA256')
  signer.update(input)
  signer.end()

  return `${input}.${base64url(signer.sign(normalizePrivateKey(privateKeyPem)))}`
}
