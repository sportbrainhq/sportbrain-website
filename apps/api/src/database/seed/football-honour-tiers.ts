/**
 * How much each football honour is worth, for ordering a player's profile.
 *
 * Wikidata records that someone won an award and nothing about its standing, so
 * a Ballon d'Or arrives indistinguishable from a regional player-of-the-year
 * vote. Ordered by year alone, Messi's profile led with "diamond Konex award"
 * and buried eight Ballons d'Or below it.
 *
 * Curated rather than inferred. The obvious automatic proxy, how many people
 * have won a thing or how many languages describe it, measures fame rather than
 * prestige and cannot be corrected when it is wrong. A list is auditable: an
 * honour ranked badly is one line to change, and what is covered is legible.
 *
 * ## The tiers
 *
 *   1. Football's highest individual and team prizes. A career is remembered by
 *      these.
 *   2. Major continental and national honours: a domestic league, a continental
 *      club title, a top scorer's award in a major league.
 *   3. Real but narrower: national footballer-of-the-year votes, team-of-the-year
 *      selections, hall-of-fame inductions.
 *   4. Recorded for completeness. Minor, ceremonial, or not really football.
 *
 * Anything absent is left null, which the profile treats as unranked and sorts
 * last. Null is deliberate: it says we have not judged this honour, which is
 * more honest than assigning a tier by guesswork.
 *
 * ## On matching
 *
 * Titles arrive with inconsistent naming, and the same award appears as "Ballon
 * d'Or", "FIFA Ballon d'Or" and "FIFA World Player of the Year" because the
 * award itself was renamed and merged over time. Matching is therefore on a
 * normalised substring rather than equality, and the more specific patterns are
 * listed first so "Ballon d'Or Dream Team", which is a squad selection rather
 * than the prize, does not match the prize.
 */

export interface HonourTier {
  /** Normalised substring to look for in the honour title. */
  pattern: string;
  tier: 1 | 2 | 3 | 4;
}

/**
 * Ordered most specific first.
 *
 * The first pattern that matches wins, so a longer phrase that would otherwise
 * be swallowed by a shorter one has to precede it.
 */
export const FOOTBALL_HONOUR_TIERS: HonourTier[] = [
  // ── Exclusions dressed as specifics ──────────────────────────────────────
  // Squad selections and lists that contain the name of a major prize. Placed
  // first so they cannot be mistaken for the prize itself.
  { pattern: 'ballon d or dream team', tier: 3 },
  { pattern: 'world cup dream team', tier: 3 },
  { pattern: 'world cup all star team', tier: 3 },
  // "list of ..." titles are Wikipedia list articles, not honours. They carry a
  // competition name and would otherwise take that competition's tier: "list of
  // UEFA Champions League top scorers" was ranked as highly as winning the
  // competition.
  { pattern: 'list of', tier: 4 },
  // Top-scorer and appearance records within a competition, ranked before the
  // competition itself for the same reason.
  { pattern: 'top scorers', tier: 3 },
  { pattern: 'top scorer', tier: 3 },
  { pattern: 'all time appearances', tier: 3 },

  // ── Tier 1: the honours a career is remembered by ────────────────────────
  { pattern: 'fifa world cup', tier: 1 },
  { pattern: 'ballon d or', tier: 1 },
  { pattern: 'fifa world player of the year', tier: 1 },
  { pattern: 'the best fifa mens player', tier: 1 },
  { pattern: 'the best fifa womens player', tier: 1 },
  { pattern: 'fifa player of the year', tier: 1 },
  { pattern: 'uefa mens player of the year', tier: 1 },
  { pattern: 'uefa womens player of the year', tier: 1 },
  { pattern: 'uefa best player in europe', tier: 1 },
  { pattern: 'golden ball', tier: 1 },
  { pattern: 'golden boot', tier: 1 },
  { pattern: 'european golden shoe', tier: 1 },
  { pattern: 'uefa champions league', tier: 1 },
  { pattern: 'european cup', tier: 1 },
  { pattern: 'copa libertadores', tier: 1 },
  { pattern: 'uefa european championship', tier: 1 },
  { pattern: 'copa america', tier: 1 },
  { pattern: 'africa cup of nations', tier: 1 },
  { pattern: 'olympic', tier: 1 },

  // ── Tier 2: major continental and national honours ───────────────────────
  { pattern: 'fifa club world cup', tier: 2 },
  { pattern: 'intercontinental cup', tier: 2 },
  { pattern: 'uefa super cup', tier: 2 },
  { pattern: 'uefa europa league', tier: 2 },
  { pattern: 'uefa cup', tier: 2 },
  { pattern: 'uefa cup winners cup', tier: 2 },
  { pattern: 'uefa conference league', tier: 2 },
  { pattern: 'premier league', tier: 2 },
  { pattern: 'la liga', tier: 2 },
  { pattern: 'serie a', tier: 2 },
  { pattern: 'bundesliga', tier: 2 },
  { pattern: 'ligue 1', tier: 2 },
  { pattern: 'eredivisie', tier: 2 },
  { pattern: 'primeira liga', tier: 2 },
  { pattern: 'fa cup', tier: 2 },
  { pattern: 'copa del rey', tier: 2 },
  { pattern: 'coppa italia', tier: 2 },
  { pattern: 'dfb pokal', tier: 2 },
  { pattern: 'confederations cup', tier: 2 },
  { pattern: 'fifa puskas award', tier: 2 },
  { pattern: 'pichichi', tier: 2 },
  { pattern: 'capocannoniere', tier: 2 },
  { pattern: 'torjagerkanone', tier: 2 },
  { pattern: 'pfa players player of the year', tier: 2 },
  { pattern: 'fwa footballer of the year', tier: 2 },
  { pattern: 'african footballer of the year', tier: 2 },
  { pattern: 'south american footballer of the year', tier: 2 },
  { pattern: 'asian footballer of the year', tier: 2 },
  { pattern: 'laureus', tier: 2 },

  // ── Tier 3: real but narrower ────────────────────────────────────────────
  { pattern: 'footballer of the year', tier: 3 },
  { pattern: 'player of the year', tier: 3 },
  { pattern: 'young player of the year', tier: 3 },
  { pattern: 'team of the year', tier: 3 },
  { pattern: 'hall of fame', tier: 3 },
  { pattern: 'iffhs', tier: 3 },
  { pattern: 'world soccer award', tier: 3 },
  { pattern: 'onze d or', tier: 3 },
  { pattern: 'bravo award', tier: 3 },
  { pattern: 'don balon', tier: 3 },
  { pattern: 'golden player', tier: 3 },
  { pattern: 'best goalkeeper', tier: 3 },
  { pattern: 'clean sheet', tier: 3 },
  { pattern: 'espy', tier: 3 },
  { pattern: 'guardian 100', tier: 3 },
  { pattern: 'uefa club football awards', tier: 3 },
  { pattern: 'lfp awards', tier: 3 },

  // ── Tier 4: recorded, but not what a career is judged on ─────────────────
  { pattern: 'order of merit', tier: 4 },
  { pattern: 'order of', tier: 4 },
  { pattern: 'medal', tier: 4 },
  { pattern: 'honorary', tier: 4 },
  { pattern: 'sports personality', tier: 4 },
  { pattern: 'konex', tier: 4 },
  { pattern: 'star to sports merit', tier: 4 },
  { pattern: 'presidents award', tier: 4 },
  { pattern: 'princess of asturias', tier: 4 },
  { pattern: 'olimpia award', tier: 4 },
];

/**
 * Normalises a title for pattern matching.
 *
 * Accents folded and punctuation replaced with a space, so "Ballon d'Or" and
 * "Ballon d’Or" with a typographic apostrophe both reduce to "ballon d or".
 *
 * Note that punctuation becomes a space rather than vanishing, which the
 * patterns above have to match: a pattern of "ballon dor" never fires, and that
 * left every Ballon d'Or unranked while the rest of the list worked.
 */
export function normaliseHonourTitle(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** The tier for one honour title, or null when the list does not cover it. */
export function honourTier(title: string): number | null {
  const normalised = normaliseHonourTitle(title);
  return FOOTBALL_HONOUR_TIERS.find((entry) => normalised.includes(entry.pattern))?.tier ?? null;
}
