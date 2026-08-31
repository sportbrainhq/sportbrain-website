import { type HonourTier, normaliseHonourTitle } from './football-honour-tiers';

/**
 * How much each MMA or boxing honour is worth, for ordering a profile.
 *
 * One file for two sports, which is a departure from the rest of this
 * directory: football, cricket, basketball, tennis and golf each get their
 * own. The combat sports share it because they share the structure that the
 * tiering actually depends on. Both are organised as sanctioning bodies
 * awarding belts per weight class, both count an undisputed or unified title
 * above a single-body one, and both hand out the same shape of annual award.
 * Splitting the list would produce two files agreeing on most lines, and they
 * would drift.
 *
 * Where the sports genuinely differ, the patterns simply do not collide: no
 * boxer holds a UFC title and no MMA fighter holds a WBC one, so the two
 * vocabularies sit in one list without either sport matching the other's
 * entries.
 *
 * ## The tiers
 *
 *   1. **Undisputed and unified world titles, and the lineal championship.**
 *      Holding every belt in a division at once is the highest thing either
 *      sport recognises, and it is rare enough to be the thing a career is
 *      remembered for.
 *   2. **A world title from a single sanctioning body or promotion.** A WBC,
 *      WBA, IBF or WBO belt; a UFC, Bellator, ONE or PFL championship. Real
 *      championships, and deliberately below tier 1, because the whole reason
 *      "undisputed" is a word in these sports is that one belt is not all of
 *      them.
 *   3. **Interim and regional titles, tournament wins, and the sport's own
 *      annual awards.** Fighter of the Year, hall-of-fame induction, an
 *      Olympic boxing medal, a Grand Prix. An Olympic gold is a serious honour
 *      in amateur boxing and is not a professional world title, which is what
 *      tiers 1 and 2 are for.
 *   4. **Everything below that.** Performance and fight-of-the-night bonuses,
 *      which are per-event and numerous, plus national honours and general
 *      sporting prizes.
 *
 * ## On matching
 *
 * Matched on a normalised substring, first match wins, so specific patterns
 * come first. The ordering carries real weight here: "undisputed welterweight
 * championship" contains "championship", "interim UFC lightweight
 * championship" contains "ufc", and "WBC interim title" contains "wbc". In
 * every case the qualifier changes what the honour is worth, so all of the
 * qualified patterns are tested before the bare body and promotion names.
 */
export const COMBAT_HONOUR_TIERS: HonourTier[] = [
  // ── Qualifiers first ───────────────────────────────────────────────────────
  //
  // Interim and regional belts are matched before the sanctioning bodies and
  // promotions below, because each of those titles contains the body's name
  // and would otherwise be tiered as a full world championship.
  { pattern: 'interim', tier: 3 },
  { pattern: 'regional', tier: 3 },
  { pattern: 'silver champion', tier: 3 },
  { pattern: 'international champion', tier: 3 },
  { pattern: 'intercontinental', tier: 3 },
  { pattern: 'commonwealth', tier: 3 },
  { pattern: 'european champion', tier: 3 },

  // ── Undisputed, unified, lineal ────────────────────────────────────────────
  { pattern: 'undisputed', tier: 1 },
  { pattern: 'unified', tier: 1 },
  { pattern: 'lineal', tier: 1 },
  { pattern: 'the ring championship', tier: 1 },

  // ── World titles: boxing's sanctioning bodies ──────────────────────────────
  { pattern: 'wbc', tier: 2 },
  { pattern: 'wba', tier: 2 },
  { pattern: 'ibf', tier: 2 },
  { pattern: 'wbo', tier: 2 },
  { pattern: 'world boxing council', tier: 2 },
  { pattern: 'world boxing association', tier: 2 },
  { pattern: 'international boxing federation', tier: 2 },
  { pattern: 'world boxing organization', tier: 2 },
  { pattern: 'world boxing organisation', tier: 2 },
  { pattern: 'ibo', tier: 2 },

  // ── World titles: the MMA promotions ───────────────────────────────────────
  { pattern: 'ufc champion', tier: 2 },
  { pattern: 'ufc world', tier: 2 },
  { pattern: 'ufc heavyweight', tier: 2 },
  { pattern: 'ufc light heavyweight', tier: 2 },
  { pattern: 'ufc middleweight', tier: 2 },
  { pattern: 'ufc welterweight', tier: 2 },
  { pattern: 'ufc lightweight', tier: 2 },
  { pattern: 'ufc featherweight', tier: 2 },
  { pattern: 'ufc bantamweight', tier: 2 },
  { pattern: 'ufc flyweight', tier: 2 },
  { pattern: 'ufc strawweight', tier: 2 },
  { pattern: 'bellator', tier: 2 },
  { pattern: 'one championship', tier: 2 },
  { pattern: 'pride', tier: 2 },
  { pattern: 'strikeforce', tier: 2 },
  { pattern: 'world champion', tier: 2 },
  { pattern: 'world title', tier: 2 },

  // ── Tournaments, the amateur game, and annual awards ───────────────────────
  //
  // Sambo and the other grappling championships are here because they are what
  // Wikidata actually holds for MMA fighters, not as an afterthought. Of the 55
  // MMA honours ingested, almost every one is a World or European Sambo
  // Championship, and none is a UFC title: promotions record their champions on
  // their own pages rather than as `P166` awards on the fighter, so the belts
  // that tiers 1 and 2 describe are largely absent from this source.
  //
  // Tier 3 is the honest placement. A World Sambo Championship is a genuine
  // international title in a related sport, and ranking it with a UFC
  // championship would overstate it while leaving it unranked would sort a real
  // honour below nothing at all.
  { pattern: 'sambo', tier: 3 },
  { pattern: 'judo', tier: 3 },
  { pattern: 'wrestling championship', tier: 3 },
  { pattern: 'grand prix', tier: 3 },
  { pattern: 'tournament', tier: 3 },
  { pattern: 'ultimate fighter', tier: 3 },
  { pattern: 'olympic', tier: 3 },
  { pattern: 'amateur', tier: 3 },
  { pattern: 'golden gloves', tier: 3 },
  { pattern: 'fighter of the year', tier: 3 },
  { pattern: 'boxer of the year', tier: 3 },
  { pattern: 'international boxing hall of fame', tier: 3 },
  { pattern: 'ufc hall of fame', tier: 3 },
  { pattern: 'fight of the year', tier: 3 },
  { pattern: 'knockout of the year', tier: 3 },
  { pattern: 'prospect of the year', tier: 3 },
  { pattern: 'laureus', tier: 3 },

  // ── Everything else ────────────────────────────────────────────────────────
  //
  // The night bonuses lead the tier because they are the most numerous honour
  // in MMA by a wide margin: a busy fighter collects a dozen, and left
  // unranked they would decide the order of the Players tab the way ESPYs did
  // in tennis.
  { pattern: 'performance of the night', tier: 4 },
  { pattern: 'fight of the night', tier: 4 },
  { pattern: 'knockout of the night', tier: 4 },
  { pattern: 'submission of the night', tier: 4 },
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

/** The tier for one combat-sport honour title, or null when uncovered. */
export function combatHonourTier(title: string): number | null {
  const normalised = normaliseHonourTitle(title);
  return COMBAT_HONOUR_TIERS.find((entry) => normalised.includes(entry.pattern))?.tier ?? null;
}
