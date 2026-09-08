import { describe, expect, it } from 'vitest'
import { parseSalesReport } from './appstore'

// Een sterk ingekort SALES/SUMMARY-rapport: alleen de kolommen die de parser gebruikt,
// in de volgorde waarin Apple ze levert.
const KOP =
  'Provider\tProvider Country\tSKU\tDeveloper\tTitle\tVersion\tProduct Type Identifier\tUnits\tDeveloper Proceeds\tBegin Date\tEnd Date'

function rij(pti: string, units: string) {
  return `APPLE\tNL\tcarve\tCeliker\tCarve\t1.0\t${pti}\t${units}\t0\t09/07/2026\t09/07/2026`
}

describe('parseSalesReport', () => {
  it('telt eerste downloads op', () => {
    const tsv = [KOP, rij('1', '5'), rij('1T', '3')].join('\n')

    expect(parseSalesReport(tsv).downloads).toBe(8)
  })

  it('telt updates niet mee als download', () => {
    // @ai-why: Product type 7 is een update van een bestaande installatie. Meetellen
    // maakt van een actieve gebruikersbasis dagelijkse "groei" die er niet is.
    const tsv = [KOP, rij('1', '5'), rij('7', '40'), rij('7T', '12')].join('\n')

    expect(parseSalesReport(tsv).downloads).toBe(5)
    expect(parseSalesReport(tsv).updates).toBe(52)
  })

  it('telt in-app aankopen niet mee als download', () => {
    const tsv = [KOP, rij('1', '2'), rij('IA1', '9'), rij('IAY', '4')].join('\n')

    expect(parseSalesReport(tsv).downloads).toBe(2)
  })

  it('overleeft een leeg rapport, want een dag zonder verkeer levert alleen een kop', () => {
    expect(parseSalesReport(KOP).downloads).toBe(0)
  })

  it('overleeft een volledig lege body', () => {
    expect(parseSalesReport('').downloads).toBe(0)
  })

  it('slaat lege regels aan het eind over', () => {
    const tsv = [KOP, rij('1', '3'), '', ''].join('\n')

    expect(parseSalesReport(tsv).downloads).toBe(3)
  })

  it('gaat af op de kolomnamen en niet op een vaste positie', () => {
    // @ai-why: Apple heeft kolommen toegevoegd zonder aankondiging. Op index 7 rekenen
    // geeft dan stilletjes het verkeerde getal in plaats van een fout.
    const kop = 'Units\tProduct Type Identifier\tTitle'
    const tsv = [kop, '6\t1\tCarve'].join('\n')

    expect(parseSalesReport(tsv).downloads).toBe(6)
  })

  it('gooit als de kolommen die we nodig hebben ontbreken', () => {
    expect(() => parseSalesReport('Iets\tAnders\n1\t2')).toThrow(/Units/)
  })
})
