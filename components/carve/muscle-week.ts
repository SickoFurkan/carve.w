export type MuscleKey = 'shoulders' | 'chest' | 'biceps' | 'forearms' | 'abs' | 'legs' | 'calves';

export interface TrainingDay {
  short: string;
  label: string;
  /** Spiergroepen die deze dag oplichten; leeg is een rustdag. */
  muscles: MuscleKey[];
}

// @ai-context: Het weekschema uit de app (Push / Pull / Legs / Rest / Upper /
// Lower / Rest), dezelfde week als op de goal-screenshot in de App Store-set.
// Het figuur toont de voorkant, dus "pull" licht biceps en onderarmen op en
// niet de rug.
export const WEEK: TrainingDay[] = [
  { short: 'Mon', label: 'Push', muscles: ['chest', 'shoulders'] },
  { short: 'Tue', label: 'Pull', muscles: ['biceps', 'forearms'] },
  { short: 'Wed', label: 'Legs', muscles: ['legs', 'calves'] },
  { short: 'Thu', label: 'Rest', muscles: [] },
  { short: 'Fri', label: 'Upper', muscles: ['chest', 'shoulders', 'biceps', 'abs'] },
  { short: 'Sat', label: 'Lower', muscles: ['legs', 'calves'] },
  { short: 'Sun', label: 'Rest', muscles: [] },
];

/** Index in WEEK van de dag waarop het figuur in de telefoon landt. */
export const LANDING_DAY = 2;

export interface MuscleRegion {
  m: MuscleKey;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

// Ellipsen in de 360×1100-ruimte van public/muscle-front.png. Handmatig op het
// figuur gelegd; de tint wordt door de PNG zelf gemaskerd, dus een ellips die
// iets over de rand valt is niet zichtbaar.
export const REGIONS: MuscleRegion[] = [
  { m: 'shoulders', cx: 68, cy: 232, rx: 40, ry: 44 }, { m: 'shoulders', cx: 292, cy: 232, rx: 40, ry: 44 },
  { m: 'chest', cx: 132, cy: 278, rx: 52, ry: 44 }, { m: 'chest', cx: 228, cy: 278, rx: 52, ry: 44 },
  { m: 'biceps', cx: 50, cy: 345, rx: 30, ry: 62 }, { m: 'biceps', cx: 310, cy: 345, rx: 30, ry: 62 },
  { m: 'forearms', cx: 34, cy: 478, rx: 26, ry: 72 }, { m: 'forearms', cx: 326, cy: 478, rx: 26, ry: 72 },
  { m: 'abs', cx: 180, cy: 400, rx: 48, ry: 84 },
  { m: 'legs', cx: 128, cy: 785, rx: 44, ry: 95 }, { m: 'legs', cx: 232, cy: 785, rx: 44, ry: 95 },
  { m: 'calves', cx: 116, cy: 955, rx: 30, ry: 75 }, { m: 'calves', cx: 244, cy: 955, rx: 30, ry: 75 },
];

export const FIGURE_SRC = '/muscle-front.png';
export const FIGURE_WIDTH = 360;
export const FIGURE_HEIGHT = 1100;

/**
 * Wat er met de weekstrip moet gebeuren als de landing van staat wisselt.
 * `hold` zet de cyclus stil op LANDING_DAY, `resume` laat hem weer lopen,
 * `restore` zet de dag terug die de bezoeker zelf koos (cyclus blijft uit),
 * `none` niets.
 *
 * @ai-why: De strip liep tot 2026-09-08 eenmalig vast. `hold` was er wel (het
 * reizende figuur moet tijdens de landing op LANDING_DAY staan, anders wisselt
 * het van spieren terwijl het de telefoon in vliegt), maar de tegenhanger niet:
 * wie terugscrollde naar de hero zag de strip voor altijd op Legs staan.
 *
 * @ai-why: `restore` en niet gewoon `resume` voor wie zelf een dag aanwees. Die
 * klik zet de cyclus bewust stil, dus opnieuw laten lopen overschrijft een keuze
 * die iemand net maakte. Maar op LANDING_DAY blijven staan is net zo fout: dat is
 * Legs, en dat koos hij niet. Dus terug naar zijn eigen dag, cyclus uit.
 *
 * De regel woont hier als pure functie omdat de vitest-opstelling van deze repo
 * node is, zonder DOM; zo is het vastlopen met een test te pinnen.
 *
 * @ai-sync: components/carve/PhoneStory.tsx (de enige aanroeper, in de rAF-handler)
 */
export type WeekDemoAction = 'hold' | 'resume' | 'restore' | 'none';

export interface WeekDemoState {
  /** Stond de landing de vorige frame al voorbij het omslagpunt? */
  was: boolean;
  /** En nu? */
  now: boolean;
  /** Heeft de bezoeker zelf een dag aangewezen (klik of hover)? */
  visitorPicked: boolean;
}

export function weekDemoAction({ was, now, visitorPicked }: WeekDemoState): WeekDemoAction {
  if (was === now) return 'none';
  if (now) return 'hold';
  return visitorPicked ? 'restore' : 'resume';
}
