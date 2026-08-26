/**
 * Competition results that Wikidata does not carry, or carries badly.
 *
 * Two separate gaps are filled here, both found by reading the World Cup page
 * against the published record.
 *
 * **Awards lag.** Enrichment reads per-edition awards from Wikidata's P3279
 * statements, and that data trails the tournaments. As of August 2026 it covers
 * the Golden Ball for 7 of 12 editions, the Golden Glove for 6 of 9, and stops
 * short of 2026 entirely, so the most recent tournament was missing from every
 * award table on the page.
 *
 * **Editions are noisy.** The roll of honour reported "34 of 57 recorded
 * editions have no winner listed", but the World Cup has been played 23 times.
 * The edition query returns qualifying tournaments and other artefacts
 * alongside the tournaments themselves, and no winner is recorded for them
 * because they are not the competition. Seeding the finals replaces a list that
 * was both incomplete and wrong about its own coverage.
 *
 * Seeded rows are merged into the crawled tables rather than replacing them
 * wholesale, so an edition the source does carry keeps coming from the source
 * and only the gaps are filled.
 *
 * ## Rules for adding to this file
 *
 * 1. **One published source per competition, named in `source`.** A result with
 *    no attribution cannot be told apart from a guess once it is stored.
 * 2. **Only completed editions.** The crawler's guard exists because sources
 *    attach winners to tournaments before they are played; entering one by hand
 *    defeats that guard rather than working around it.
 * 3. **Delete an entry once the source carries it correctly.** These are a
 *    stopgap for a lagging feed, not a parallel dataset, and a row left here
 *    after Wikidata catches up is a second copy that can drift from the first.
 * 4. **Names as the rest of the database spells them.** Winners are national
 *    teams and are stored under their full names ("Brazil men's national
 *    football team"), so a seeded row must match or the same country appears
 *    under two names in adjacent rows.
 *
 * Keyed by competition slug, matching the convention in `team-rankings.ts`.
 */

export interface SeededAward {
  /** Matches the `kind` enrichment writes, so seeded and crawled rows merge. */
  kind: string;
  /** The heading, matching `humaniseCriterion` in the enrichment service. */
  label: string;
  /** The edition this result belongs to. */
  year: number;
  winner: string;
  /**
   * The figure behind the award, where it has one.
   *
   * Goals for a Golden Boot. Null for the awards that are a judgement rather
   * than a count, and for a roll of honour, where the year is the only figure.
   */
  value: number | null;
}

export interface SeededCompetitionAwards {
  competitionSlug: string;
  source: string;
  /**
   * Replaces the crawled table outright rather than merging into it.
   *
   * Set where the crawled list is wrong rather than merely short, so that
   * merging would preserve the error. Two cases so far: the roll of honour,
   * padded with editions that are not tournaments, and the Golden Ball, where
   * the source carries retrospective "best player" picks for 1930 and 1966 as
   * though they were the award. The Golden Ball was first presented in 1982 and
   * a table listing it for 1930 states something that did not happen.
   */
  replaceKinds?: string[];
  awards: SeededAward[];
}

/** Full name for a national team, as the team table spells it. */
const TEAM = {
  argentina: "Argentina men's national football team",
  brazil: "Brazil men's national football team",
  england: "England men's national association football team",
  france: "France men's national association football team",
  germany: "Germany men's national association football team",
  italy: "Italy men's national association football team",
  spain: "Spain men's national football team",
  uruguay: "Uruguay men's national football team",
  // West Germany competed as a separate nation until 1990 and its titles are
  // recorded under that name rather than folded into Germany's, which is how
  // FIFA and the tournament's own records list them.
  westGermany: 'West Germany national football team',
} as const;

/** Shorthand for a roll-of-honour row, which carries no figure of its own. */
const won = (year: number, winner: string): SeededAward => ({
  kind: 'roll_of_honour',
  label: 'Winners',
  year,
  winner,
  value: null,
});

const award = (
  kind: string,
  label: string,
  year: number,
  winner: string,
  value: number | null = null,
): SeededAward => ({ kind, label, year, winner, value });

const BALL = 'award:most-valuable-player-award';
const BOOT = 'award:more-goals-scored';
const GLOVE = 'award:best-goalkeeper';
const YOUNG = 'award:best-young-player';

export const FOOTBALL_SEEDED_AWARDS: SeededCompetitionAwards[] = [
  {
    competitionSlug: 'world-cup',
    source: 'https://en.wikipedia.org/wiki/FIFA_World_Cup_awards',
    replaceKinds: ['roll_of_honour', BALL],
    awards: [
      // ── Winners, all 23 tournaments ──────────────────────────────────────
      won(2026, TEAM.spain),
      won(2022, TEAM.argentina),
      won(2018, TEAM.france),
      won(2014, TEAM.germany),
      won(2010, TEAM.spain),
      won(2006, TEAM.italy),
      won(2002, TEAM.brazil),
      won(1998, TEAM.france),
      won(1994, TEAM.brazil),
      won(1990, TEAM.westGermany),
      won(1986, TEAM.argentina),
      won(1982, TEAM.italy),
      won(1978, TEAM.argentina),
      won(1974, TEAM.westGermany),
      won(1970, TEAM.brazil),
      won(1966, TEAM.england),
      won(1962, TEAM.brazil),
      won(1958, TEAM.brazil),
      won(1954, TEAM.westGermany),
      won(1950, TEAM.uruguay),
      won(1938, TEAM.italy),
      won(1934, TEAM.italy),
      won(1930, TEAM.uruguay),

      // ── Golden Ball, awarded since 1982 ──────────────────────────────────
      award(BALL, 'Golden Ball', 2026, 'Rodri'),
      award(BALL, 'Golden Ball', 2022, 'Lionel Messi'),
      award(BALL, 'Golden Ball', 2018, 'Luka Modrić'),
      award(BALL, 'Golden Ball', 2014, 'Lionel Messi'),
      award(BALL, 'Golden Ball', 2010, 'Diego Forlán'),
      award(BALL, 'Golden Ball', 2006, 'Zinedine Zidane'),
      award(BALL, 'Golden Ball', 2002, 'Oliver Kahn'),
      award(BALL, 'Golden Ball', 1998, 'Ronaldo'),
      award(BALL, 'Golden Ball', 1994, 'Romário'),
      award(BALL, 'Golden Ball', 1990, 'Salvatore Schillaci'),
      award(BALL, 'Golden Ball', 1986, 'Diego Maradona'),
      award(BALL, 'Golden Ball', 1982, 'Paolo Rossi'),

      // ── Golden Boot, with the goals that won it ──────────────────────────
      // 1962 and 1994 were shared by several players on the same total and are
      // recorded here under the first name the source lists, because the table
      // holds one winner per edition. The alternative, a row per joint winner,
      // reads as a duplicate edition.
      award(BOOT, 'Golden Boot', 2026, 'Kylian Mbappé', 10),
      award(BOOT, 'Golden Boot', 2022, 'Kylian Mbappé', 8),
      award(BOOT, 'Golden Boot', 2018, 'Harry Kane', 6),
      award(BOOT, 'Golden Boot', 2014, 'James Rodríguez', 6),
      award(BOOT, 'Golden Boot', 2010, 'Thomas Müller', 5),
      award(BOOT, 'Golden Boot', 2006, 'Miroslav Klose', 5),
      award(BOOT, 'Golden Boot', 2002, 'Ronaldo', 8),
      award(BOOT, 'Golden Boot', 1998, 'Davor Šuker', 6),
      award(BOOT, 'Golden Boot', 1994, 'Oleg Salenko', 6),
      award(BOOT, 'Golden Boot', 1990, 'Salvatore Schillaci', 6),
      award(BOOT, 'Golden Boot', 1986, 'Gary Lineker', 6),
      award(BOOT, 'Golden Boot', 1982, 'Paolo Rossi', 6),
      award(BOOT, 'Golden Boot', 1978, 'Mario Kempes', 6),
      award(BOOT, 'Golden Boot', 1974, 'Grzegorz Lato', 7),
      award(BOOT, 'Golden Boot', 1970, 'Gerd Müller', 10),
      award(BOOT, 'Golden Boot', 1966, 'Eusébio', 9),
      award(BOOT, 'Golden Boot', 1962, 'Flórián Albert', 4),
      award(BOOT, 'Golden Boot', 1958, 'Just Fontaine', 13),
      award(BOOT, 'Golden Boot', 1954, 'Sándor Kocsis', 11),
      award(BOOT, 'Golden Boot', 1950, 'Ademir', 9),
      award(BOOT, 'Golden Boot', 1938, 'Leônidas', 7),
      award(BOOT, 'Golden Boot', 1934, 'Oldřich Nejedlý', 5),
      award(BOOT, 'Golden Boot', 1930, 'Guillermo Stábile', 8),

      // ── Golden Glove, awarded since 1994 ─────────────────────────────────
      award(GLOVE, 'Golden Glove', 2026, 'Unai Simón'),
      award(GLOVE, 'Golden Glove', 2022, 'Emiliano Martínez'),
      award(GLOVE, 'Golden Glove', 2018, 'Thibaut Courtois'),
      award(GLOVE, 'Golden Glove', 2014, 'Manuel Neuer'),
      award(GLOVE, 'Golden Glove', 2010, 'Iker Casillas'),
      award(GLOVE, 'Golden Glove', 2006, 'Gianluigi Buffon'),
      award(GLOVE, 'Golden Glove', 2002, 'Oliver Kahn'),
      award(GLOVE, 'Golden Glove', 1998, 'Fabien Barthez'),
      award(GLOVE, 'Golden Glove', 1994, "Michel Preud'homme"),

      // ── Best Young Player, awarded retrospectively from 1958 ─────────────
      award(YOUNG, 'Best Young Player', 2026, 'Pau Cubarsí'),
      award(YOUNG, 'Best Young Player', 2022, 'Enzo Fernández'),
      award(YOUNG, 'Best Young Player', 2018, 'Kylian Mbappé'),
      award(YOUNG, 'Best Young Player', 2014, 'Paul Pogba'),
      award(YOUNG, 'Best Young Player', 2010, 'Thomas Müller'),
      award(YOUNG, 'Best Young Player', 2006, 'Lukas Podolski'),
      award(YOUNG, 'Best Young Player', 2002, 'Landon Donovan'),
      award(YOUNG, 'Best Young Player', 1998, 'Michael Owen'),
      award(YOUNG, 'Best Young Player', 1994, 'Marc Overmars'),
      award(YOUNG, 'Best Young Player', 1990, 'Robert Prosinečki'),
      award(YOUNG, 'Best Young Player', 1986, 'Enzo Scifo'),
      award(YOUNG, 'Best Young Player', 1982, 'Manuel Amoros'),
      award(YOUNG, 'Best Young Player', 1978, 'Antonio Cabrini'),
      award(YOUNG, 'Best Young Player', 1974, 'Władysław Żmuda'),
      award(YOUNG, 'Best Young Player', 1970, 'Teófilo Cubillas'),
      award(YOUNG, 'Best Young Player', 1966, 'Franz Beckenbauer'),
      award(YOUNG, 'Best Young Player', 1962, 'Flórián Albert'),
      award(YOUNG, 'Best Young Player', 1958, 'Pelé'),
    ],
  },
];
