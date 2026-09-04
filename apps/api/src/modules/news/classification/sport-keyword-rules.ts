/**
 * Deterministic sport keyword rules.
 *
 * One maintainable table, not scattered if/else: adding a new sport or a new
 * phrase for an existing one is a one-line change here, never a change to
 * `sport-classifier.ts` itself.
 *
 * Sport slugs are the real ones this repo seeds (see
 * `apps/api/src/database/seed/seed.cli.ts` and `news-sources.ts`), not
 * invented ones. Keep this list in sync if a new sport is launched.
 *
 * Matching is case-insensitive, whole-phrase substring matching against
 * `headline + ' ' + summary`, done by `sport-classifier.ts`. Phrases are
 * ordered longest-first within a sport by the classifier so a more specific
 * phrase is not shadowed by a shorter one that happens to be a substring of
 * it (not needed today, but keeps this data future-proof without a second
 * sort step being added later).
 */

export interface SportKeywordRule {
  /** Real `sport.slug` value this phrase maps to. */
  sportSlug: string;
  /** Lower-cased phrase to look for as a substring of the lower-cased article text. */
  phrase: string;
  /** Relative strength of this phrase as evidence for the sport, 0 to 1. A league/competition name is stronger evidence than a generic term. */
  weight: number;
}

export const SPORT_KEYWORD_RULES: SportKeywordRule[] = [
  // Football
  { sportSlug: 'football', phrase: 'premier league', weight: 1 },
  { sportSlug: 'football', phrase: 'champions league', weight: 1 },
  { sportSlug: 'football', phrase: 'europa league', weight: 0.9 },
  { sportSlug: 'football', phrase: 'la liga', weight: 1 },
  { sportSlug: 'football', phrase: 'serie a', weight: 0.9 },
  { sportSlug: 'football', phrase: 'bundesliga', weight: 1 },
  { sportSlug: 'football', phrase: 'ligue 1', weight: 0.9 },
  { sportSlug: 'football', phrase: 'fifa world cup', weight: 1 },
  { sportSlug: 'football', phrase: 'uefa', weight: 0.7 },
  { sportSlug: 'football', phrase: 'fa cup', weight: 0.9 },
  { sportSlug: 'football', phrase: 'carabao cup', weight: 0.85 },
  { sportSlug: 'football', phrase: 'transfer window', weight: 0.6 },
  { sportSlug: 'football', phrase: 'clean sheet', weight: 0.5 },
  { sportSlug: 'football', phrase: 'red card', weight: 0.4 },
  { sportSlug: 'football', phrase: 'offside', weight: 0.4 },

  // Cricket
  { sportSlug: 'cricket', phrase: 'ipl', weight: 1 },
  { sportSlug: 'cricket', phrase: 'indian premier league', weight: 1 },
  { sportSlug: 'cricket', phrase: 'test match', weight: 0.8 },
  { sportSlug: 'cricket', phrase: 'odi', weight: 0.8 },
  { sportSlug: 'cricket', phrase: 't20i', weight: 0.85 },
  { sportSlug: 'cricket', phrase: 'the ashes', weight: 0.9 },
  { sportSlug: 'cricket', phrase: 'icc world cup', weight: 0.9 },
  { sportSlug: 'cricket', phrase: 'wicket', weight: 0.5 },
  { sportSlug: 'cricket', phrase: 'century (cricket)', weight: 0.3 },
  { sportSlug: 'cricket', phrase: 'bowled out', weight: 0.5 },
  { sportSlug: 'cricket', phrase: 'run chase', weight: 0.5 },

  // Basketball
  { sportSlug: 'basketball', phrase: 'nba', weight: 1 },
  { sportSlug: 'basketball', phrase: 'nba finals', weight: 1 },
  { sportSlug: 'basketball', phrase: 'wnba', weight: 1 },
  { sportSlug: 'basketball', phrase: 'euroleague basketball', weight: 0.9 },
  { sportSlug: 'basketball', phrase: 'slam dunk', weight: 0.5 },
  { sportSlug: 'basketball', phrase: 'triple-double', weight: 0.6 },
  { sportSlug: 'basketball', phrase: 'three-pointer', weight: 0.5 },

  // Tennis
  { sportSlug: 'tennis', phrase: 'wimbledon', weight: 1 },
  { sportSlug: 'tennis', phrase: 'us open tennis', weight: 0.9 },
  { sportSlug: 'tennis', phrase: 'french open', weight: 0.9 },
  { sportSlug: 'tennis', phrase: 'australian open', weight: 0.9 },
  { sportSlug: 'tennis', phrase: 'grand slam', weight: 0.8 },
  { sportSlug: 'tennis', phrase: 'atp tour', weight: 0.9 },
  { sportSlug: 'tennis', phrase: 'atp', weight: 0.7 },
  { sportSlug: 'tennis', phrase: 'wta', weight: 0.7 },
  { sportSlug: 'tennis', phrase: 'break point', weight: 0.4 },
  { sportSlug: 'tennis', phrase: 'straight sets', weight: 0.5 },

  // Formula 1 (repo slug is `formula-1`, not `motorsport`)
  { sportSlug: 'formula-1', phrase: 'formula 1', weight: 1 },
  { sportSlug: 'formula-1', phrase: 'formula one', weight: 1 },
  { sportSlug: 'formula-1', phrase: 'f1 grand prix', weight: 1 },
  { sportSlug: 'formula-1', phrase: 'grand prix', weight: 0.7 },
  { sportSlug: 'formula-1', phrase: 'pole position', weight: 0.5 },
  { sportSlug: 'formula-1', phrase: 'pit stop', weight: 0.4 },
  { sportSlug: 'formula-1', phrase: 'constructors championship', weight: 0.7 },

  // MMA
  { sportSlug: 'mma', phrase: 'ufc', weight: 1 },
  { sportSlug: 'mma', phrase: 'octagon', weight: 0.8 },
  { sportSlug: 'mma', phrase: 'mixed martial arts', weight: 0.9 },
  { sportSlug: 'mma', phrase: 'submission win', weight: 0.5 },
  { sportSlug: 'mma', phrase: 'bellator', weight: 0.8 },

  // Boxing
  { sportSlug: 'boxing', phrase: 'wbc', weight: 0.9 },
  { sportSlug: 'boxing', phrase: 'wba', weight: 0.9 },
  { sportSlug: 'boxing', phrase: 'ibf', weight: 0.9 },
  { sportSlug: 'boxing', phrase: 'wbo', weight: 0.9 },
  { sportSlug: 'boxing', phrase: 'heavyweight title', weight: 0.85 },
  { sportSlug: 'boxing', phrase: 'undisputed champion', weight: 0.6 },
  { sportSlug: 'boxing', phrase: 'knockout', weight: 0.5 },
  { sportSlug: 'boxing', phrase: 'unanimous decision', weight: 0.5 },

  // Golf
  { sportSlug: 'golf', phrase: 'the masters', weight: 0.8 },
  { sportSlug: 'golf', phrase: 'pga tour', weight: 1 },
  { sportSlug: 'golf', phrase: 'pga championship', weight: 0.9 },
  { sportSlug: 'golf', phrase: 'the open championship', weight: 0.85 },
  { sportSlug: 'golf', phrase: 'ryder cup', weight: 0.9 },
  { sportSlug: 'golf', phrase: 'us open golf', weight: 0.9 },
  { sportSlug: 'golf', phrase: 'liv golf', weight: 0.9 },
  { sportSlug: 'golf', phrase: 'birdie', weight: 0.4 },
  { sportSlug: 'golf', phrase: 'eagle (golf)', weight: 0.3 },
  { sportSlug: 'golf', phrase: 'under par', weight: 0.4 },

  // American football
  { sportSlug: 'american-football', phrase: 'nfl', weight: 1 },
  { sportSlug: 'american-football', phrase: 'super bowl', weight: 1 },
  { sportSlug: 'american-football', phrase: 'touchdown', weight: 0.6 },
  { sportSlug: 'american-football', phrase: 'quarterback', weight: 0.6 },
  { sportSlug: 'american-football', phrase: 'field goal', weight: 0.4 },
  { sportSlug: 'american-football', phrase: 'nfl draft', weight: 0.9 },
];
