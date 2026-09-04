import type { CuratedCompetition } from './football-competitions';

/**
 * The American football competitions worth showing.
 *
 * Generic ingestion for this sport left 167 competition rows and not one of
 * them was the Super Bowl. The catalogue held the NFL, its two conferences,
 * one lone division (NFC North, with the other seven absent), and a hundred
 * and sixty-odd defunct leagues, foreign amateur circuits and college
 * conferences miscategorised as competitions. The event the sport is actually
 * watched through, and the two games that decide who reaches it, were simply
 * absent.
 *
 * This file follows `golf-competitions.ts` exactly: a short curated list, with
 * everything not named here deleted by `seedCuratedCompetitions`. The three
 * rows ingestion had already created (NFL, AFC, NFC) are re-declared here
 * rather than left to ingestion, both so they survive the prune and so their
 * `tier`/`notability` sit correctly alongside the new rows.
 *
 * ## What earns a place
 *
 * - **The NFL itself**, tier 1. The league a reader means by "American
 *   football" in the way "the Premier League" or "the NBA" is meant elsewhere.
 * - **The Super Bowl**, tier 1. Modelled as its own competition rather than
 *   folded into the NFL row, the same way basketball keeps the NBA Finals
 *   distinct from the NBA and golf keeps the Masters distinct from the PGA
 *   Tour: a league is a season-long structure, a championship game is a single
 *   annual event with its own winners list, and collapsing the two would make
 *   "Super Bowl champion" indistinguishable from "regular-season league
 *   leader" in the honour table.
 * - **The AFC and NFC Championship Games**, tier 2. The two conference title
 *   games that decide who reaches the Super Bowl. Kept distinct from the
 *   conferences themselves (which are organisational groupings a team belongs
 *   to, not events a team wins) for the same reason the Super Bowl is kept
 *   distinct from the league.
 * - **The two conferences**, tier 3, unchanged from ingestion's own values.
 *   Kept because team rows and the Overview's governance tree reference them,
 *   not because a reader looks them up as a competition in their own right.
 *
 * ## What is deliberately absent
 *
 * **The eight divisions.** Ingestion produced exactly one (NFC North) and not
 * the other seven, which is worse than none: a single division floating with
 * no siblings implies a structure that is not actually modelled. Adding all
 * eight is a reasonable future addition but is out of scope for this pass,
 * which is about the two entities a reader actually searches for (the league
 * and its championship) plus enough structure for the conferences already in
 * use elsewhere not to dangle.
 *
 * **The NFL Draft.** It is not a competition in the sense every other row
 * here is: nobody "wins" the Draft, there is no winners list, and the schema's
 * `competition` model (kind, format, a table of champions) does not fit an
 * annual personnel event. Modelling it here would mean inventing a "winner"
 * for a thing that does not have one. It belongs as Explainer and Overview
 * content, which this sport already has, not as a competition row.
 *
 * **Every defunct and amateur league** ingestion produced: the AFL, NFL
 * Europe, the XFL, the USFL, the AAF, the Arena Football League, and dozens of
 * foreign and collegiate circuits. They are real, and no reader opens an
 * American football site to look them up.
 *
 * ## On `kind`
 *
 * All six rows are `domestic`: every team and every player in this sport's
 * catalogue is American, so nothing here is contested across national teams
 * the way a World Cup or the Ryder Cup is. This matches what ingestion had
 * already set for the NFL, AFC and NFC.
 */
export const AMERICAN_FOOTBALL_CURATED_COMPETITIONS: CuratedCompetition[] = [
  {
    slug: 'national-football-league',
    wikidata: 'Q1215884',
    name: 'National Football League',
    kind: 'domestic',
    format: 'league',
    country: 'United States',
    tier: 1,
    notability: 100,
    foundedYear: 1920,
  },
  {
    slug: 'super-bowl',
    wikidata: 'Q32096',
    name: 'Super Bowl',
    kind: 'domestic',
    format: 'knockout',
    country: 'United States',
    tier: 1,
    notability: 98,
    foundedYear: 1967,
  },
  {
    slug: 'afc-championship-game',
    wikidata: 'Q291768',
    name: 'AFC Championship Game',
    kind: 'domestic',
    format: 'knockout',
    country: 'United States',
    tier: 2,
    notability: 70,
    foundedYear: 1970,
  },
  {
    slug: 'nfc-championship-game',
    wikidata: 'Q1784597',
    name: 'NFC Championship Game',
    kind: 'domestic',
    format: 'knockout',
    country: 'United States',
    tier: 2,
    notability: 68,
    foundedYear: 1970,
  },
  {
    slug: 'american-football-conference',
    wikidata: 'Q276530',
    name: 'American Football Conference',
    kind: 'domestic',
    format: 'league',
    country: 'United States',
    tier: 3,
    notability: 40,
    foundedYear: 1970,
  },
  {
    slug: 'national-football-conference',
    wikidata: 'Q319007',
    name: 'National Football Conference',
    kind: 'domestic',
    format: 'league',
    country: 'United States',
    tier: 3,
    notability: 38,
    foundedYear: 1970,
  },
];

export const AMERICAN_FOOTBALL_CURATED_SLUGS: ReadonlySet<string> = new Set(
  AMERICAN_FOOTBALL_CURATED_COMPETITIONS.map((entry) => entry.slug),
);
