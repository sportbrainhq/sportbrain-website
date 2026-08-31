import { type HonourTier, normaliseHonourTitle } from './football-honour-tiers';

/**
 * How much each American football honour is worth, for ordering a profile.
 *
 * ## The tiers
 *
 *   1. **The Super Bowl, and the two awards that define a career.** The
 *      championship itself, the league MVP, and the Super Bowl MVP. Hall of
 *      Fame induction sits here too, which is a departure from the other
 *      sports in this directory: in tennis it is tier 3, but the Pro Football
 *      Hall of Fame is the sport's own verdict on a whole career and is how
 *      the sport itself ranks its players.
 *   2. **The conference championships and the major positional awards.** An
 *      AFC or NFC championship is one round from the Super Bowl. Offensive and
 *      Defensive Player of the Year are the awards a great season is measured
 *      by.
 *   3. **Selections and the honours below that.** First-team All-Pro, Pro Bowl,
 *      Rookie of the Year, Comeback Player, the college awards. Real
 *      distinctions, but a Pro Bowl is an annual selection of dozens rather
 *      than a title.
 *   4. **Everything else.** Weekly and monthly awards, national honours and the
 *      general sporting prizes.
 *
 * ## On matching
 *
 * Matched on a normalised substring, first match wins, so the specific
 * patterns come first. Two collisions drive the ordering:
 *
 *   - "Super Bowl MVP" contains "super bowl", and both are tier 1, so the
 *     order between them does not change the answer. It is written specific
 *     first anyway, so that the tiers can be moved apart later without the
 *     patterns quietly reordering themselves.
 *   - "AP NFL Most Valuable Player" and "Pro Bowl" both contain "bowl". The
 *     bowl patterns are therefore anchored on the full phrase rather than the
 *     word, and "pro bowl" is tested before any bare "bowl" pattern. There is
 *     deliberately no bare "bowl" pattern at all: the college bowl games would
 *     match it and they are not NFL honours.
 */
export const AMERICAN_FOOTBALL_HONOUR_TIERS: HonourTier[] = [
  // ── Selections first, above the patterns they would collide with ───────────
  { pattern: 'pro bowl', tier: 3 },
  { pattern: 'all pro', tier: 3 },

  // ── The championship and the defining awards ───────────────────────────────
  { pattern: 'super bowl mvp', tier: 1 },
  { pattern: 'super bowl most valuable player', tier: 1 },
  { pattern: 'super bowl', tier: 1 },
  { pattern: 'nfl most valuable player', tier: 1 },
  { pattern: 'ap most valuable player', tier: 1 },
  { pattern: 'most valuable player', tier: 1 },
  { pattern: 'pro football hall of fame', tier: 1 },
  { pattern: 'nfl championship', tier: 1 },

  // ── One round short, and the seasonal awards ───────────────────────────────
  { pattern: 'afc championship', tier: 2 },
  { pattern: 'nfc championship', tier: 2 },
  { pattern: 'conference championship', tier: 2 },
  { pattern: 'offensive player of the year', tier: 2 },
  { pattern: 'defensive player of the year', tier: 2 },
  { pattern: 'walter payton', tier: 2 },

  // ── Selections, rookie and college honours ─────────────────────────────────
  { pattern: 'rookie of the year', tier: 3 },
  { pattern: 'comeback player', tier: 3 },
  { pattern: 'heisman', tier: 3 },
  { pattern: 'college football hall of fame', tier: 3 },
  { pattern: 'all american', tier: 3 },
  { pattern: 'player of the year', tier: 3 },
  { pattern: 'coach of the year', tier: 3 },
  { pattern: 'man of the year', tier: 3 },

  // ── Everything else ────────────────────────────────────────────────────────
  { pattern: 'player of the week', tier: 4 },
  { pattern: 'player of the month', tier: 4 },
  { pattern: 'espy', tier: 4 },
  { pattern: 'sports illustrated', tier: 4 },
  { pattern: 'hall of fame', tier: 4 },
  { pattern: 'ring of honor', tier: 4 },
  { pattern: 'ring of honour', tier: 4 },
  { pattern: 'lifetime achievement', tier: 4 },
  { pattern: 'honorary', tier: 4 },
  { pattern: 'medal', tier: 4 },
];

/** The tier for one American football honour title, or null when uncovered. */
export function americanFootballHonourTier(title: string): number | null {
  const normalised = normaliseHonourTitle(title);
  return (
    AMERICAN_FOOTBALL_HONOUR_TIERS.find((entry) => normalised.includes(entry.pattern))?.tier ?? null
  );
}
