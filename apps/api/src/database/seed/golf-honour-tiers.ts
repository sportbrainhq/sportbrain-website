import { type HonourTier, normaliseHonourTitle } from './football-honour-tiers';

/**
 * How much each golf honour is worth, for ordering a player's profile.
 *
 * The fifth instance of the mechanism football, cricket, basketball and tennis
 * already use. Without it every golf honour carries a null `prestige`, which
 * the profile treats as unranked and sorts last, so a Masters win would sit
 * level with an ESPY on the same undifferentiated list. Tennis records exactly
 * that defect happening.
 *
 * ## The tiers
 *
 *   1. **The four majors.** What a golf career is counted in: the Masters, the
 *      PGA Championship, the U.S. Open and the Open Championship. Golf is
 *      unusual in how absolute this is, to the point that a player with no
 *      major is described as the best never to have won one.
 *   2. **The Players Championship, the Olympic gold, the FedEx Cup and the
 *      order of merit.** Genuinely big titles that nobody counts as a major.
 *      The Players is deliberately here and not tier 1 despite the field: the
 *      sport itself calls it the fifth major, which is a way of saying it is
 *      not one of the four.
 *   3. **The team competitions and the sport's own awards.** A Ryder Cup, a
 *      Presidents Cup, a Solheim Cup, Player of the Year, a hall-of-fame
 *      induction, the Vardon Trophy for scoring average.
 *   4. **Everything below that.** Individual tour wins, national honours and
 *      the general sporting prizes that arrive attached to famous players.
 *
 * Anything absent is left null, which says we have not judged this honour
 * rather than that it is worthless.
 *
 * ## On matching
 *
 * Matched on a normalised substring, first match wins, so the more specific
 * patterns come first. That ordering matters here for two collisions in
 * particular: "U.S. Open" normalises to "us open" and is a major, while "U.S.
 * Amateur" is not, and "Open Championship" is a major while the many national
 * opens that end in "open" are not. Both are handled by putting the specific
 * pattern above the general one.
 */
export const GOLF_HONOUR_TIERS: HonourTier[] = [
  // ── The four majors ────────────────────────────────────────────────────────
  //
  // The amateur championships come first, above the professional patterns they
  // would otherwise match: "U.S. Amateur" does not contain "us open", but
  // "British Amateur Championship" does contain "championship", and the
  // women's majors are matched before the bare tournament names for the same
  // reason.
  { pattern: 'us amateur', tier: 3 },
  { pattern: 'british amateur', tier: 3 },
  { pattern: 'masters tournament', tier: 1 },
  { pattern: 'the masters', tier: 1 },
  { pattern: 'pga championship', tier: 1 },
  { pattern: 'us open', tier: 1 },
  { pattern: 'u s open', tier: 1 },
  { pattern: 'open championship', tier: 1 },
  { pattern: 'british open', tier: 1 },
  // The women's majors, which are a different five tournaments and equally
  // what a career is counted in.
  { pattern: 'womens pga championship', tier: 1 },
  { pattern: 'womens open', tier: 1 },
  { pattern: 'ana inspiration', tier: 1 },
  { pattern: 'chevron championship', tier: 1 },
  { pattern: 'evian championship', tier: 1 },

  // ── Big, but not majors ────────────────────────────────────────────────────
  { pattern: 'players championship', tier: 2 },
  { pattern: 'olympic', tier: 2 },
  { pattern: 'fedex cup', tier: 2 },
  { pattern: 'race to dubai', tier: 2 },
  { pattern: 'order of merit', tier: 2 },
  { pattern: 'money list', tier: 2 },

  // ── Team golf, and the sport's own awards ──────────────────────────────────
  { pattern: 'ryder cup', tier: 3 },
  { pattern: 'presidents cup', tier: 3 },
  { pattern: 'solheim cup', tier: 3 },
  { pattern: 'walker cup', tier: 3 },
  { pattern: 'curtis cup', tier: 3 },
  { pattern: 'world golf hall of fame', tier: 3 },
  { pattern: 'golf hall of fame', tier: 3 },
  { pattern: 'player of the year', tier: 3 },
  { pattern: 'vardon trophy', tier: 3 },
  { pattern: 'byron nelson award', tier: 3 },
  { pattern: 'rookie of the year', tier: 3 },
  { pattern: 'laureus', tier: 3 },

  // ── Everything else ────────────────────────────────────────────────────────
  { pattern: 'invitational', tier: 4 },
  { pattern: 'classic', tier: 4 },
  { pattern: 'espy', tier: 4 },
  { pattern: 'sports personality', tier: 4 },
  { pattern: 'sports illustrated', tier: 4 },
  { pattern: 'hall of fame', tier: 4 },
  { pattern: 'order of', tier: 4 },
  { pattern: 'medal of freedom', tier: 4 },
  { pattern: 'lifetime achievement', tier: 4 },
  { pattern: 'honorary', tier: 4 },
  { pattern: 'medal', tier: 4 },
];

/** The tier for one golf honour title, or null when the list does not cover it. */
export function golfHonourTier(title: string): number | null {
  const normalised = normaliseHonourTitle(title);
  return GOLF_HONOUR_TIERS.find((entry) => normalised.includes(entry.pattern))?.tier ?? null;
}
