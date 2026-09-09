import { describe, expect, it } from 'vitest';
import { weekDemoAction } from '@/components/carve/muscle-week';

describe('weekDemoAction', () => {
  it('zet de weekdemo stil zodra het figuur in de telefoon landt', () => {
    expect(weekDemoAction({ was: false, now: true, visitorPicked: false })).toBe('hold');
  });

  it('zet hem ook stil als de bezoeker zelf een dag koos: het figuur moet op LANDING_DAY landen', () => {
    expect(weekDemoAction({ was: false, now: true, visitorPicked: true })).toBe('hold');
  });

  it('laat hem weer lopen wanneer je terugscrollt naar de hero', () => {
    expect(weekDemoAction({ was: true, now: false, visitorPicked: false })).toBe('resume');
  });

  it('zet de dag van de bezoeker terug bij terugscrollen en laat de cyclus uit', () => {
    expect(weekDemoAction({ was: true, now: false, visitorPicked: true })).toBe('restore');
  });

  it('doet niets zolang de landing niet van staat wisselt', () => {
    expect(weekDemoAction({ was: false, now: false, visitorPicked: false })).toBe('none');
    expect(weekDemoAction({ was: true, now: true, visitorPicked: false })).toBe('none');
  });
});
