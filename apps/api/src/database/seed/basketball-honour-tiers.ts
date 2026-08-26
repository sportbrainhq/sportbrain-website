import { type HonourTier, normaliseHonourTitle } from './football-honour-tiers';

/**
 * How much each basketball honour is worth, for ordering teams and profiles.
 *
 * The third instance of the mechanism football and cricket already use, added
 * because basketball had none: all 760 basketball honours carried a null
 * `prestige`, which `deriveTeamPriority` scores as a flat 1 apiece. Counting
 * flat is what put European clubs above the NBA on the Teams tab. Real Madrid
 * Baloncesto holds 102 recorded honours, mostly Liga ACB and Copa del Rey, and
 * FC Barcelona Bàsquet 67; the Lakers hold 19, of which 17 are NBA
 * championships. Flat counting scored Madrid 102 to the Lakers' 19, so Madrid
 * and Barcelona sat second and sixth on a list a reader opens looking for the
 * NBA.
 *
 * ## The tiers
 *
 *   1. **The NBA championship, and the game's highest individual prize.** What
 *      a franchise and a career are remembered for. The Olympic and FIBA World
 *      Cup titles sit here too: they are the peak of the international game.
 *   2. **Major continental and premier league honours.** A EuroLeague title, a
 *      conference championship, an NBA MVP-adjacent award, a WNBA title.
 *   3. **Premier domestic honours and real individual awards.** A national
 *      league or cup in a major basketball country, a hall-of-fame induction,
 *      a college player-of-the-year award.
 *   4. **Everything below that.** Conference-level college tournaments, defunct
 *      pre-NBA leagues, regional cups, ceremonial and non-basketball awards.
 *
 * Anything absent is left null, which the ordering treats as unranked and sorts
 * last. Null says we have not judged this honour rather than that it is
 * worthless.
 *
 * ## On matching
 *
 * Team honours arrive year-prefixed as "1949–50 NBA season", "2016 Copa del Rey
 * de Baloncesto" and "1948 NCAA basketball tournament", so matching is on a
 * normalised substring and the more specific patterns come first. The first
 * match wins.
 *
 * The NCAA patterns matter more than their tier suggests. Wikidata records a
 * college tournament win as an honour on the programme, and the pre-1950 NBA
 * seasons and the SEC and Southern Conference tournaments make up most of the
 * team honours we hold. Left unranked they would all score the flat 1 and the
 * problem this file exists to fix would persist in a smaller form.
 */
export const BASKETBALL_HONOUR_TIERS: HonourTier[] = [
  // ── Exclusions dressed as specifics ──────────────────────────────────────
  // Wikipedia list and record articles that carry a competition name. Placed
  // first so they cannot inherit that competition's tier.
  { pattern: 'list of', tier: 4 },
  // A squad selection, not a title. Must precede the plain 'nba' patterns and
  // the All-Star MVP, which is a genuine award.
  { pattern: 'nba all star game kobe bryant most valuable player', tier: 2 },
  { pattern: 'all nba team', tier: 3 },
  { pattern: 'all defensive team', tier: 3 },
  { pattern: 'all rookie team', tier: 3 },
  { pattern: 'all star game', tier: 3 },
  { pattern: 'all star selection', tier: 3 },
  // An artefact of winning the championship rather than a separate honour, and
  // ranked below it so it cannot double-count as a tier 1.
  { pattern: 'nba championship ring', tier: 3 },
  // The draft is an event, not an honour.
  { pattern: 'expansion draft', tier: 4 },
  { pattern: 'draft', tier: 4 },

  // ── Tier 1: what a franchise and a career are remembered for ─────────────
  // "1949–50 NBA season" and similar: Wikidata records a title as the season
  // the team won. This is the pattern that has to outrank Madrid's ACB titles.
  { pattern: 'nba finals', tier: 1 },
  { pattern: 'nba season', tier: 1 },
  { pattern: 'nba world championship', tier: 1 },
  { pattern: 'bill russell nba finals most valuable player', tier: 1 },
  { pattern: 'nba most valuable player', tier: 1 },
  // The international peak.
  { pattern: 'olympic', tier: 1 },
  { pattern: 'fiba basketball world cup', tier: 1 },
  { pattern: 'fiba world championship', tier: 1 },
  { pattern: 'naismith memorial basketball hall of fame', tier: 1 },

  // ── Tier 2: major continental and premier league honours ────────────────
  { pattern: 'euroleague', tier: 2 },
  { pattern: 'euroleague mvp', tier: 2 },
  { pattern: 'fiba european champions cup', tier: 2 },
  { pattern: 'fiba intercontinental cup', tier: 2 },
  { pattern: 'basketball champions league', tier: 2 },
  { pattern: 'eurobasket', tier: 2 },
  { pattern: 'fiba americas championship', tier: 2 },
  { pattern: 'fiba asia cup', tier: 2 },
  { pattern: 'afrobasket', tier: 2 },
  { pattern: 'eastern conference', tier: 2 },
  { pattern: 'western conference', tier: 2 },
  { pattern: 'wnba finals most valuable player', tier: 2 },
  { pattern: 'wnba most valuable player', tier: 2 },
  { pattern: 'wnba season', tier: 2 },
  { pattern: 'nba defensive player of the year', tier: 2 },
  { pattern: 'nba rookie of the year', tier: 2 },
  { pattern: 'nba coach of the year', tier: 2 },

  // ── Tier 3: premier domestic honours and real individual awards ─────────
  { pattern: 'liga acb', tier: 3 },
  { pattern: 'copa del rey de baloncesto', tier: 3 },
  { pattern: 'supercopa de espana de baloncesto', tier: 3 },
  { pattern: 'basketball bundesliga', tier: 3 },
  { pattern: 'lega basket serie a', tier: 3 },
  { pattern: 'lnb pro a', tier: 3 },
  { pattern: 'greek basket league', tier: 3 },
  { pattern: 'turkish basketball super league', tier: 3 },
  { pattern: 'vtb united league', tier: 3 },
  { pattern: 'adriatic league', tier: 3 },
  { pattern: 'philippine basketball association', tier: 3 },
  { pattern: 'nbl', tier: 3 },
  { pattern: 'fiba hall of fame', tier: 3 },
  { pattern: 'womens basketball hall of fame', tier: 3 },
  { pattern: 'hall of fame', tier: 3 },
  { pattern: 'nba most improved player', tier: 3 },
  { pattern: 'nba sixth man of the year', tier: 3 },
  { pattern: 'nba executive of the year', tier: 3 },
  { pattern: 'fiba europe player of the year', tier: 3 },
  { pattern: 'john r wooden award', tier: 3 },
  { pattern: 'naismith college player of the year', tier: 3 },
  { pattern: 'oscar robertson trophy', tier: 3 },
  { pattern: 'nabc player of the year', tier: 3 },
  { pattern: 'usbwa', tier: 3 },
  { pattern: 'associated press college basketball player of the year', tier: 3 },
  { pattern: 'wade trophy', tier: 3 },
  { pattern: 'nancy lieberman award', tier: 3 },
  { pattern: 'honda sports award', tier: 3 },
  // The national college title. Below the NBA championship deliberately: this
  // is a product about the professional game first, and a 1939 NCAA tournament
  // is not what a reader scanning the Teams tab is looking for.
  { pattern: 'ncaa mens division i basketball tournament', tier: 3 },
  { pattern: 'ncaa basketball tournament', tier: 3 },

  // ── Tier 4: recorded, but not what the list should be ordered by ────────
  // Conference-level college tournaments. These are the bulk of the team
  // honours we hold and the reason college programmes need a low tier.
  { pattern: 'conference mens basketball tournament', tier: 4 },
  { pattern: 'conference womens basketball tournament', tier: 4 },
  { pattern: 'conference mens basketball player of the year', tier: 4 },
  { pattern: 'conference womens basketball player of the year', tier: 4 },
  { pattern: 'sec basketball tournament', tier: 4 },
  { pattern: 'southern conference', tier: 4 },
  { pattern: 'conference tournament', tier: 4 },
  // Pre-NBA and defunct leagues.
  { pattern: 'baa season', tier: 4 },
  { pattern: 'national basketball league', tier: 4 },
  { pattern: 'american basketball association', tier: 4 },
  { pattern: 'continental basketball association', tier: 4 },
  // Regional and Franco-era Spanish cups.
  { pattern: 'lliga catalana', tier: 4 },
  { pattern: 'copa del generalisimo', tier: 4 },
  // Media, ceremonial and non-basketball awards. The ESPYs and BET awards are
  // popularity votes, and a state hall of fame is civic recognition.
  { pattern: 'espy', tier: 4 },
  { pattern: 'bet award', tier: 4 },
  { pattern: 'bet humanitarian', tier: 4 },
  { pattern: 'sports illustrated', tier: 4 },
  { pattern: 'sportsmanship award', tier: 4 },
  { pattern: 'citizenship award', tier: 4 },
  { pattern: 'teammate of the year', tier: 4 },
  { pattern: 'lifetime achievement', tier: 4 },
  { pattern: 'great immigrants', tier: 4 },
  { pattern: 'princess of asturias', tier: 4 },
  { pattern: 'order of', tier: 4 },
  { pattern: 'medal', tier: 4 },
  { pattern: 'honorary', tier: 4 },
];

/** The tier for one basketball honour title, or null when the list does not cover it. */
export function basketballHonourTier(title: string): number | null {
  const normalised = normaliseHonourTitle(title);
  return BASKETBALL_HONOUR_TIERS.find((entry) => normalised.includes(entry.pattern))?.tier ?? null;
}
