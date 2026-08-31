import { type HonourTier, normaliseHonourTitle } from './football-honour-tiers';

/**
 * How much each tennis honour is worth, for ordering a player's profile.
 *
 * The fourth instance of the mechanism football, cricket and basketball
 * already use, added because tennis had none: every tennis honour carried a
 * null `prestige`, which the profile treats as unranked and sorts last. With
 * the majors now ingested that would have been actively wrong, putting
 * Federer's twenty Grand Slam titles below his one ESPY award in the same
 * undifferentiated list.
 *
 * ## The tiers
 *
 *   1. **The four Grand Slams, in singles.** What a tennis career is measured
 *      in. An Olympic singles gold sits here too: it is contested once every
 *      four years and it is the title that separates a Golden Slam from a
 *      Grand Slam.
 *   2. **Doubles majors, the season finales, and Olympic doubles.** Real
 *      titles at the top of the sport, and deliberately below the singles
 *      majors, because that is how tennis itself counts them: nobody's "23
 *      majors" includes their doubles.
 *   3. **The national-team competitions and the sport's genuine individual
 *      awards.** A Davis Cup, a Billie Jean King Cup, a hall-of-fame
 *      induction, a Laureus or an ITF world champion award.
 *   4. **Everything below that.** ESPYs, national honours, ceremonial awards
 *      and the non-tennis prizes that arrive attached to famous players.
 *
 * Anything absent is left null, which the ordering treats as unranked and
 * sorts last. Null says we have not judged this honour rather than that it is
 * worthless.
 *
 * ## On matching
 *
 * Matched on a normalised substring, first match wins, so the more specific
 * patterns come first. That ordering carries real weight here because the
 * doubles titles are written as "Wimbledon (doubles)" by the tennis career
 * ingester: the doubles patterns must be tested before the bare tournament
 * names, or every doubles major would match the singles pattern above it and
 * be tiered as a singles major.
 */
export const TENNIS_HONOUR_TIERS: HonourTier[] = [
  // ── Doubles, first ─────────────────────────────────────────────────────────
  // Before the singles patterns, because "wimbledon doubles" contains
  // "wimbledon" and would otherwise be tiered 1.
  //
  // Written without the brackets the title carries, because
  // `normaliseHonourTitle` replaces every run of non-alphanumerics with a
  // single space: "Wimbledon (doubles)" normalises to "wimbledon doubles", and
  // a pattern containing a bracket could never match anything.
  { pattern: 'australian open doubles', tier: 2 },
  { pattern: 'french open doubles', tier: 2 },
  { pattern: 'wimbledon doubles', tier: 2 },
  { pattern: 'us open doubles', tier: 2 },
  { pattern: 'olympic games doubles', tier: 2 },
  { pattern: 'atp finals doubles', tier: 2 },
  { pattern: 'wta finals doubles', tier: 2 },
  { pattern: 'davis cup doubles', tier: 3 },
  { pattern: 'billie jean king cup doubles', tier: 3 },

  // ── The majors, in singles ─────────────────────────────────────────────────
  { pattern: 'australian open', tier: 1 },
  { pattern: 'french open', tier: 1 },
  { pattern: 'roland garros', tier: 1 },
  { pattern: 'wimbledon', tier: 1 },
  { pattern: 'us open', tier: 1 },
  { pattern: 'olympic games', tier: 1 },
  { pattern: 'olympic gold', tier: 1 },

  // ── The season finales ─────────────────────────────────────────────────────
  { pattern: 'atp finals', tier: 2 },
  { pattern: 'wta finals', tier: 2 },
  { pattern: 'tour finals', tier: 2 },
  { pattern: 'masters cup', tier: 2 },
  { pattern: 'year end championship', tier: 2 },

  // ── National teams, and the sport's own awards ─────────────────────────────
  { pattern: 'davis cup', tier: 3 },
  { pattern: 'billie jean king cup', tier: 3 },
  { pattern: 'fed cup', tier: 3 },
  { pattern: 'hopman cup', tier: 3 },
  { pattern: 'international tennis hall of fame', tier: 3 },
  { pattern: 'tennis hall of fame', tier: 3 },
  { pattern: 'itf world champion', tier: 3 },
  { pattern: 'world champion', tier: 3 },
  { pattern: 'laureus', tier: 3 },
  { pattern: 'player of the year', tier: 3 },
  { pattern: 'sportsman of the year', tier: 3 },
  { pattern: 'sportswoman of the year', tier: 3 },
  { pattern: 'masters 1000', tier: 3 },
  { pattern: 'wta 1000', tier: 3 },

  // ── Everything else ────────────────────────────────────────────────────────
  //
  // ESPYs lead the tier because they are the single most common tennis honour
  // in the catalogue: the awards ingest recorded ten of them for Serena
  // Williams and one for Federer, which is how an ESPY count came to decide
  // the order of the Players tab.
  { pattern: 'espy', tier: 4 },
  { pattern: 'sports personality', tier: 4 },
  { pattern: 'sports illustrated', tier: 4 },
  { pattern: 'princess of asturias', tier: 4 },
  { pattern: 'prince of asturias', tier: 4 },
  { pattern: 'naacp', tier: 4 },
  { pattern: 'hall of fame', tier: 4 },
  { pattern: 'order of', tier: 4 },
  { pattern: 'medal of freedom', tier: 4 },
  { pattern: 'legion of honour', tier: 4 },
  { pattern: 'sportsmanship', tier: 4 },
  { pattern: 'humanitarian', tier: 4 },
  { pattern: 'lifetime achievement', tier: 4 },
  { pattern: 'honorary', tier: 4 },
  { pattern: 'medal', tier: 4 },
];

/** The tier for one tennis honour title, or null when the list does not cover it. */
export function tennisHonourTier(title: string): number | null {
  const normalised = normaliseHonourTitle(title);
  return TENNIS_HONOUR_TIERS.find((entry) => normalised.includes(entry.pattern))?.tier ?? null;
}
