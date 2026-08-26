import { type HonourTier, normaliseHonourTitle } from './football-honour-tiers';

/**
 * How much each cricket honour is worth, for ordering teams and profiles.
 *
 * The same mechanism football uses, for the same reason: Wikidata records that a
 * team won something and nothing about its standing, so a Sheffield Shield from
 * 1896 arrives indistinguishable from a World Cup.
 *
 * Counting honours flat is what broke the Teams tab. New South Wales holds 48
 * Sheffield Shields and India holds 8 honours including two World Cups, so at 40
 * points an honour NSW scored 1,920 against India's 320 and a state side opened
 * the list ahead of every Test nation.
 *
 * ## The tiers
 *
 *   1. **Global international honours.** An ICC world event, or the World Test
 *      Championship. What a nation is remembered for.
 *   2. **Major international and premier franchise honours.** A continental
 *      championship, the Ashes, or a title in a leading T20 league.
 *   3. **Premier domestic honours.** A first-class or top-tier limited-overs
 *      title in a major cricket nation: the Sheffield Shield, the County
 *      Championship, the Ranji Trophy. Real achievements, narrower reach.
 *   4. **Everything below that.** Second-tier and minor competitions, defunct
 *      sponsor-named leagues, age-group and development titles.
 *
 * Anything absent is left null, which the ordering treats as unranked. Null says
 * we have not judged this honour, which is more honest than guessing.
 *
 * ## On matching
 *
 * Titles arrive as "1896–97 Sheffield Shield season" and "2013 Indian Premier
 * League", so matching is on a normalised substring rather than equality, and
 * more specific patterns precede the general ones they would otherwise be
 * swallowed by. Ordered most specific first: the first match wins.
 */
export const CRICKET_HONOUR_TIERS: HonourTier[] = [
  // ── Exclusions dressed as specifics ──────────────────────────────────────
  // Wikipedia list and record articles that carry a competition name. Placed
  // first so they cannot inherit that competition's tier: "list of Indian
  // Premier League records" is not a title won.
  { pattern: 'list of', tier: 4 },
  { pattern: 'records', tier: 4 },
  { pattern: 'statistics', tier: 4 },

  // Age-group and development titles, which carry senior competition names.
  // Before the senior patterns for that reason.
  { pattern: 'under 19', tier: 4 },
  { pattern: 'under 17', tier: 4 },
  { pattern: 'youth', tier: 4 },
  { pattern: 'a team', tier: 4 },
  { pattern: 'tri nation', tier: 4 },

  // ── Tier 1: global international ─────────────────────────────────────────
  // "world test championship" before "test", and both before any pattern
  // containing "world".
  { pattern: 'world test championship', tier: 1 },
  { pattern: 'cricket world cup', tier: 1 },
  { pattern: 't20 world cup', tier: 1 },
  { pattern: 'world twenty20', tier: 1 },
  { pattern: 'world cup', tier: 1 },
  { pattern: 'champions trophy', tier: 1 },

  // ── Tier 2: major international and premier franchise ────────────────────
  { pattern: 'ashes', tier: 2 },
  { pattern: 'asia cup', tier: 2 },
  { pattern: 'indian premier league', tier: 2 },
  { pattern: 'champions league twenty20', tier: 2 },
  { pattern: 'pakistan super league', tier: 2 },
  { pattern: 'big bash league', tier: 2 },
  { pattern: 'kfc twenty20 big bash', tier: 2 },
  { pattern: 'sa20', tier: 2 },
  { pattern: 'caribbean premier league', tier: 2 },
  { pattern: 'the hundred', tier: 2 },
  { pattern: 'major league cricket', tier: 2 },
  { pattern: 'lanka premier league', tier: 2 },
  { pattern: 'bangladesh premier league', tier: 2 },
  { pattern: 'international league t20', tier: 2 },
  { pattern: 'super smash', tier: 2 },

  // ── Tier 3: premier domestic ─────────────────────────────────────────────
  // First-class competitions of the major nations.
  { pattern: 'sheffield shield', tier: 3 },
  { pattern: 'county championship', tier: 3 },
  { pattern: 'ranji trophy', tier: 3 },
  { pattern: 'currie cup', tier: 3 },
  { pattern: 'plunket shield', tier: 3 },
  { pattern: 'quaid e azam trophy', tier: 3 },
  { pattern: 'regional four day', tier: 3 },
  { pattern: 'duleep trophy', tier: 3 },
  { pattern: 'irani cup', tier: 3 },
  // Premier domestic limited-overs.
  { pattern: 'vijay hazare trophy', tier: 3 },
  { pattern: 'syed mushtaq ali trophy', tier: 3 },
  { pattern: 'royal london one day cup', tier: 3 },
  { pattern: 'one day cup', tier: 3 },
  { pattern: 'marsh cup', tier: 3 },
  { pattern: 'ryobi one day cup', tier: 3 },
  { pattern: 't20 blast', tier: 3 },
  { pattern: 'twenty20 cup', tier: 3 },

  // ── Tier 4: historical, sponsor-named and minor ──────────────────────────
  // England's domestic one-day competitions were renamed with each sponsor, so
  // these are the same few trophies under many names. Kept at 4 rather than 3
  // because they are defunct and a reader is unlikely to be looking for them.
  { pattern: 'benson hedges cup', tier: 4 },
  { pattern: 'gillette cup', tier: 4 },
  { pattern: 'natwest trophy', tier: 4 },
  { pattern: 'natwest pro40', tier: 4 },
  { pattern: 'john player', tier: 4 },
  { pattern: 'refuge assurance', tier: 4 },
  { pattern: 'cheltenham gloucester trophy', tier: 4 },
  { pattern: 'axa equity law league', tier: 4 },
  { pattern: 'clydesdale bank', tier: 4 },
  { pattern: 'friends provident', tier: 4 },
  { pattern: 'yorkshire bank', tier: 4 },
  { pattern: 'sunday league', tier: 4 },
  { pattern: 'minor counties', tier: 4 },
  { pattern: 'second xi', tier: 4 },
  { pattern: 'deodhar trophy', tier: 4 },
  { pattern: 'nissan shield', tier: 4 },
  { pattern: 'benson and hedges', tier: 4 },
];

/** The tier for one cricket honour title, or null when the list does not cover it. */
export function cricketHonourTier(title: string): number | null {
  const normalised = normaliseHonourTitle(title);
  return CRICKET_HONOUR_TIERS.find((entry) => normalised.includes(entry.pattern))?.tier ?? null;
}
