import type { FieldPositionPoint, FieldSettingShape } from './explainer-types';

/**
 * Where every fielding position is, as coordinates.
 *
 * Structured data rather than a set of images. Three things follow from that
 * which an image cannot give: the same numbers draw one highlighted position, a
 * slip cordon and a full field setting; the diagram stays sharp and
 * theme-aware at any size; and each marker carries a name a screen reader can
 * announce, which matters most for exactly the beginner this category is for.
 *
 * ## The coordinate system
 *
 * A square viewport, 0-100 on each axis, containing the circular field.
 *
 * - `x`: 0 is the leg-side boundary, 100 is the off-side boundary.
 * - `y`: 0 is behind the striker's wicket (the wicketkeeper's side), 100 is
 *   straight down the ground past the bowler.
 * - The striker stands at (50, 22); the bowler releases from (50, 78).
 *
 * Coordinates are for a **right-handed striker**. For a left-hander the field
 * mirrors about x = 50, which the renderer does rather than the data: storing
 * both would be two rows to keep in step for no gain.
 *
 * Positions are approximate by nature. "Cover" is a region a captain adjusts by
 * several metres a dozen times an innings, not a marked spot, so these are
 * teaching positions: right relative to each other, which is what a reader
 * needs, rather than a survey of any particular ground.
 */

const striker = { x: 50, y: 22 };

/** Every position, keyed by explainer slug so a page can look up its own marker. */
export const CRICKET_FIELD_POSITIONS: Record<string, FieldPositionPoint> = {
  // ── Off side, behind square ───────────────────────────────────────────────
  'first-slip': { name: 'First slip', label: '1', side: 'off', depth: 'close', x: 60, y: 12 },
  'second-slip': { name: 'Second slip', label: '2', side: 'off', depth: 'close', x: 65, y: 13 },
  'third-slip': { name: 'Third slip', label: '3', side: 'off', depth: 'close', x: 70, y: 15 },
  slip: { name: 'Slip', label: 'SL', side: 'off', depth: 'close', x: 63, y: 13 },
  gully: { name: 'Gully', label: 'GY', side: 'off', depth: 'close', x: 76, y: 18 },
  'fly-slip': { name: 'Fly slip', label: 'FS', side: 'off', depth: 'inner', x: 70, y: 4 },
  'third-man': { name: 'Third man', label: 'TM', side: 'off', depth: 'deep', x: 88, y: 6 },
  'backward-point': {
    name: 'Backward point',
    label: 'BP',
    side: 'off',
    depth: 'inner',
    x: 84,
    y: 19,
  },

  // ── Off side, square and forward ──────────────────────────────────────────
  point: { name: 'Point', label: 'P', side: 'off', depth: 'inner', x: 85, y: 24 },
  cover: { name: 'Cover', label: 'CV', side: 'off', depth: 'inner', x: 80, y: 36 },
  'extra-cover': { name: 'Extra cover', label: 'XC', side: 'off', depth: 'inner', x: 72, y: 45 },
  'mid-off': { name: 'Mid-off', label: 'MO', side: 'off', depth: 'inner', x: 63, y: 55 },
  'silly-point': { name: 'Silly point', label: 'SP', side: 'off', depth: 'close', x: 60, y: 26 },
  'silly-mid-off': {
    name: 'Silly mid-off',
    label: 'SMO',
    side: 'off',
    depth: 'close',
    x: 58,
    y: 33,
  },
  'deep-point': { name: 'Deep point', label: 'DP', side: 'off', depth: 'deep', x: 95, y: 24 },
  'deep-cover': { name: 'Deep cover', label: 'DC', side: 'off', depth: 'deep', x: 90, y: 42 },
  'long-off': { name: 'Long off', label: 'LO', side: 'off', depth: 'deep', x: 72, y: 76 },

  // ── Leg side ──────────────────────────────────────────────────────────────
  'leg-slip': { name: 'Leg slip', label: 'LS', side: 'leg', depth: 'close', x: 38, y: 13 },
  'leg-gully': { name: 'Leg gully', label: 'LG', side: 'leg', depth: 'close', x: 30, y: 17 },
  'short-leg': { name: 'Short leg', label: 'SL', side: 'leg', depth: 'close', x: 40, y: 27 },
  'silly-mid-on': { name: 'Silly mid-on', label: 'SMN', side: 'leg', depth: 'close', x: 42, y: 33 },
  'square-leg': { name: 'Square leg', label: 'SQ', side: 'leg', depth: 'inner', x: 16, y: 24 },
  'fine-leg': { name: 'Fine leg', label: 'FL', side: 'leg', depth: 'deep', x: 14, y: 8 },
  'long-leg': { name: 'Long leg', label: 'LL', side: 'leg', depth: 'deep', x: 6, y: 16 },
  'deep-square-leg': {
    name: 'Deep square leg',
    label: 'DSQ',
    side: 'leg',
    depth: 'deep',
    x: 5,
    y: 26,
  },
  midwicket: { name: 'Midwicket', label: 'MW', side: 'leg', depth: 'inner', x: 22, y: 42 },
  'deep-midwicket': {
    name: 'Deep midwicket',
    label: 'DMW',
    side: 'leg',
    depth: 'deep',
    x: 10,
    y: 47,
  },
  'mid-on': { name: 'Mid-on', label: 'MN', side: 'leg', depth: 'inner', x: 37, y: 55 },
  'long-on': { name: 'Long on', label: 'LN', side: 'leg', depth: 'deep', x: 28, y: 76 },
  'cow-corner': { name: 'Cow corner', label: 'CC', side: 'leg', depth: 'deep', x: 16, y: 63 },

  // ── Fixed ─────────────────────────────────────────────────────────────────
  wicketkeeper: {
    name: 'Wicketkeeper',
    label: 'WK',
    side: 'straight',
    depth: 'close',
    x: 50,
    y: 8,
  },
  bowler: { name: 'Bowler', label: 'B', side: 'straight', depth: 'inner', x: 50, y: 78 },
};

/**
 * Builds a diagram for one position, with a few neighbours for orientation.
 *
 * A single dot on an empty field tells a beginner nothing: "point" means
 * something only next to cover and gully. The highlighted position is filled,
 * the context positions are outlined, and the wicketkeeper is always drawn
 * because it is the one landmark that fixes which end is which.
 */
export function fieldSetting(
  highlight: string,
  context: string[] = [],
  caption?: string,
): FieldSettingShape {
  const names = ['wicketkeeper', ...context.filter((slug) => slug !== highlight)];
  const positions: FieldPositionPoint[] = [];

  const focus = CRICKET_FIELD_POSITIONS[highlight];
  if (focus) positions.push({ ...focus, highlight: true });

  for (const slug of names) {
    const point = CRICKET_FIELD_POSITIONS[slug];
    if (point) positions.push(point);
  }

  return { positions, handedness: 'right', caption };
}

/** A whole field setting, with nothing singled out. */
export function fullFieldSetting(slugs: string[], caption?: string): FieldSettingShape {
  return {
    positions: ['wicketkeeper', ...slugs]
      .map((slug) => CRICKET_FIELD_POSITIONS[slug])
      .filter((point): point is FieldPositionPoint => Boolean(point)),
    handedness: 'right',
    caption,
  };
}

export { striker };
