import type { CuratedCompetition } from './football-competitions';

/**
 * The golf competitions worth showing, and what each one is.
 *
 * Ingestion left golf with forty-five competitions and not one of them was a
 * major. The catalogue held the Alps Tour, the Big Easy Tour, the Cactus Tour,
 * the Finnish Tour and Women's Golf Day, every one carrying `tier = 3`, and no
 * Masters, no U.S. Open, no Open Championship and no PGA Championship. The four
 * events the sport is actually watched through were simply absent, and with
 * them any possibility of recording that somebody had won one.
 *
 * The consequence was the same one tennis suffered, for the same reason. Golf
 * has no clubs, so `derivePersonPriority` can never award its two large team
 * bonuses, and the `major_titles` term reads from tier-1 competitions of which
 * golf had none. Every golfer therefore scored on capped sitelinks alone, and
 * the Players tab opened with Arnold Palmer, then **Heinrich Harrer**, an
 * Austrian mountaineer who climbed the Eiger and tutored the Dalai Lama, and
 * who is in this catalogue because Wikidata records that he played some golf.
 * Tiger Woods was not in the catalogue at all.
 *
 * This file is the judgement that was missing, and follows
 * `tennis-competitions.ts` exactly: a short curated list, with everything not
 * named here deleted by `seedCuratedCompetitions`.
 *
 * ## What earns a place
 *
 * Golf is watched through the majors and the team events, and the list says so.
 *
 *   - **The four men's majors**: the Masters, the PGA Championship, the U.S.
 *     Open and The Open Championship.
 *   - **The five women's majors**: the Chevron Championship, the U.S. Women's
 *     Open, the Women's PGA Championship, the Evian Championship and the
 *     Women's Open. Five rather than four because the women's game recognises
 *     five, and trimming it to four to match the men's would be inventing a
 *     symmetry the sport does not have.
 *   - **The three biennial team events**: the Ryder Cup, the Solheim Cup and
 *     the Presidents Cup.
 *   - **The tours themselves**, at tier 2: the PGA Tour, the DP World Tour, the
 *     LPGA Tour and the Ladies European Tour. A tour is not a competition in
 *     the way a major is, but a reader looks them up, and the alternative is
 *     deleting the row that a player's `tour` field points at.
 *
 * The Korn Ferry Tour is deliberately absent despite being the recognised route
 * onto the PGA Tour. It is a developmental tour, nobody's career is described
 * by it, and every row on this tab should be a competition a reader has heard
 * of.
 *
 * Everything else is deleted: the Alps Tour, the Cactus Tour, the national
 * development circuits and Women's Golf Day. They are real, and no reader opens
 * a golf site to look them up.
 *
 * The FedExCup and the Race to Dubai are deliberately absent. They are season
 * -long points races rather than tournaments, and modelling one as a
 * competition with a champion would make a season's leading points scorer
 * indistinguishable from a major winner in the honour table.
 *
 * ## On `kind`, and why a major is international
 *
 * `kind` drives the tab's two filters through `COMPETITION_KIND_GROUPS`, where
 * "Leagues" expands to `domestic` and `continental` while "International" is
 * `international` alone. The split is by **who competes**.
 *
 * The majors and the tours are all `international`, which is the same answer
 * tennis reached and for the same reason: golf has no club game, and the majors
 * are open to any player in the world who qualifies. Calling the Masters
 * `domestic` because it is played in Georgia every year would say something
 * false about who may enter it. The three team events are `international` too,
 * since they are contested by continents and nations rather than clubs.
 *
 * ## Tiers and notability
 *
 * `tier` groups, `notability` orders within a group. Both are set here because
 * ingestion sets neither, and with both flat the listing has nothing to sort by.
 * Tier 1 is what `derivePersonPriority` counts as a major title, so the nine
 * majors sit there and nothing else does: a Ryder Cup appearance is an honour
 * and is not a major, and the priority pass must not treat it as one.
 *
 * The men's majors are given four different notability values rather than one.
 * They are not equal in the sport's imagination: the Masters is the one a
 * non-follower can name and The Open is the oldest. The order here is the
 * Masters, The Open, the U.S. Open, then the PGA Championship, which is
 * conventional rather than provable, and it only decides the order of four rows
 * within a tier.
 */
export const GOLF_CURATED_COMPETITIONS: CuratedCompetition[] = [
  // ── The men's majors ───────────────────────────────────────────────────────
  {
    slug: 'masters-tournament',
    wikidata: 'Q280275',
    name: 'Masters Tournament',
    kind: 'international',
    format: 'league',
    country: null,
    tier: 1,
    notability: 100,
    foundedYear: 1934,
  },
  {
    slug: 'the-open-championship',
    wikidata: 'Q848797',
    name: 'The Open Championship',
    kind: 'international',
    format: 'league',
    country: null,
    tier: 1,
    notability: 98,
    foundedYear: 1860,
  },
  {
    slug: 'us-open-golf',
    wikidata: 'Q259776',
    name: 'U.S. Open',
    kind: 'international',
    format: 'league',
    country: null,
    tier: 1,
    notability: 96,
    foundedYear: 1895,
  },
  {
    slug: 'pga-championship',
    wikidata: 'Q828160',
    name: 'PGA Championship',
    kind: 'international',
    format: 'league',
    country: null,
    tier: 1,
    notability: 94,
    foundedYear: 1916,
  },

  // ── The women's majors ─────────────────────────────────────────────────────
  //
  // Five, because the women's game recognises five. The Chevron Championship
  // and the Women's Open are the current names of events this list also has to
  // match under their historical ones, which is what the ingestion's alias
  // handling is for: an infobox written in 2004 says "Nabisco Championship".
  {
    slug: 'us-womens-open',
    wikidata: 'Q2300124',
    name: "U.S. Women's Open",
    kind: 'international',
    format: 'league',
    country: null,
    tier: 1,
    notability: 90,
    foundedYear: 1946,
  },
  {
    slug: 'womens-pga-championship',
    wikidata: 'Q281917',
    name: "Women's PGA Championship",
    kind: 'international',
    format: 'league',
    country: null,
    tier: 1,
    notability: 88,
    foundedYear: 1955,
  },
  {
    slug: 'womens-british-open',
    wikidata: 'Q429896',
    name: "AIG Women's Open",
    kind: 'international',
    format: 'league',
    country: null,
    tier: 1,
    notability: 86,
    foundedYear: 1976,
  },
  {
    slug: 'chevron-championship',
    wikidata: 'Q1785973',
    name: 'The Chevron Championship',
    kind: 'international',
    format: 'league',
    country: null,
    tier: 1,
    notability: 84,
    foundedYear: 1972,
  },
  {
    slug: 'evian-championship',
    wikidata: 'Q2487426',
    name: 'The Evian Championship',
    kind: 'international',
    format: 'league',
    country: null,
    tier: 1,
    notability: 82,
    foundedYear: 1994,
  },

  // ── The team events ────────────────────────────────────────────────────────
  //
  // Tier 2 rather than tier 1, deliberately. They are among the most watched
  // events in the sport and they are not majors: nobody's major count includes
  // a Ryder Cup, and `derivePersonPriority` reads tier 1 as "won one of this
  // sport's biggest individual events". Putting them in tier 1 would let a
  // player who has never won a major score as though they had.
  {
    slug: 'ryder-cup',
    wikidata: 'Q854376',
    name: 'Ryder Cup',
    kind: 'international',
    format: 'knockout',
    country: null,
    tier: 2,
    notability: 80,
    foundedYear: 1927,
  },
  {
    slug: 'solheim-cup',
    wikidata: 'Q1854372',
    name: 'Solheim Cup',
    kind: 'international',
    format: 'knockout',
    country: null,
    tier: 2,
    notability: 76,
    foundedYear: 1990,
  },
  {
    slug: 'presidents-cup',
    wikidata: 'Q1647788',
    name: 'Presidents Cup',
    kind: 'international',
    format: 'knockout',
    country: null,
    tier: 2,
    notability: 74,
    foundedYear: 1994,
  },

  // ── The tours ──────────────────────────────────────────────────────────────
  //
  // Kept because a player's `tour` field points at them and because readers
  // look them up, not because a tour is a competition in the sense a major is.
  // Tier 2, below the majors and level with the team events.
  {
    slug: 'pga-tour',
    wikidata: 'Q910409',
    name: 'PGA Tour',
    kind: 'international',
    format: 'league',
    country: null,
    tier: 2,
    notability: 70,
    foundedYear: 1929,
  },
  {
    slug: 'pga-european-tour',
    wikidata: 'Q121571',
    name: 'DP World Tour',
    kind: 'international',
    format: 'league',
    country: null,
    tier: 2,
    notability: 68,
    foundedYear: 1972,
  },
  {
    // No `wikidata`, deliberately. The obvious candidate, Q27650, is the LPGA
    // itself: the association of players, which is a different thing from the
    // tour it runs, and enriching a competition from an organisation's entity
    // is the mistake this field's documentation exists to warn about. Better a
    // row that cannot be enriched than one enriched into the wrong facts.
    slug: 'lpga-tour',
    name: 'LPGA Tour',
    kind: 'international',
    format: 'league',
    country: null,
    tier: 2,
    notability: 66,
    foundedYear: 1950,
  },
  {
    slug: 'ladies-european-tour',
    wikidata: 'Q1799946',
    name: 'Ladies European Tour',
    kind: 'international',
    format: 'league',
    country: null,
    tier: 2,
    notability: 62,
    foundedYear: 1978,
  },
];

export const GOLF_CURATED_SLUGS: ReadonlySet<string> = new Set(
  GOLF_CURATED_COMPETITIONS.map((entry) => entry.slug),
);

/**
 * The majors, keyed by the infobox field that reports a player's result.
 *
 * `Infobox golfer` states each major's result in its own field, and the value
 * for a champion reads `'''Won''': [[1997 Masters Tournament|1997]], ...`.
 * That is a far better source for major counts than anything in Wikidata,
 * which records an award for a Hall of Fame induction and nothing at all for
 * fifteen major championships.
 *
 * ## Why the field names are what they are
 *
 * They are the template's own, and several are not what a reader would guess.
 * The Open Championship is `open`, the PGA Championship is `pga`, and the
 * women's fields carry historical names: `nabisco` for what is now the Chevron
 * Championship, `lpga` for the Women's PGA Championship, `wbritish` for the
 * Women's Open. Wikipedia keeps the old parameter names working after an event
 * is renamed, so an article written today and one written in 2004 both parse.
 *
 * The `du Maurier` and `Titleholders` fields are the women's majors that no
 * longer exist. They are read too, and mapped to no competition: a player who
 * won one did win a major, and dropping it would understate her record. The
 * honour row is written with a null `competition_id`, which the ingestion
 * already handles for any title whose competition is missing.
 */
export const GOLF_MAJOR_FIELDS: {
  /** The `Infobox golfer` parameter name, lowercased at the point of lookup. */
  field: string;
  /** The curated competition slug, or null for a discontinued major. */
  slug: string | null;
  name: string;
  tour: 'mens' | 'womens';
  /** Orders the major breakdown on a player's profile, by calendar position. */
  order: number;
}[] = [
  // Men's, in calendar order.
  {
    field: 'masters',
    slug: 'masters-tournament',
    name: 'Masters Tournament',
    tour: 'mens',
    order: 1,
  },
  { field: 'pga', slug: 'pga-championship', name: 'PGA Championship', tour: 'mens', order: 2 },
  { field: 'usopen', slug: 'us-open-golf', name: 'U.S. Open', tour: 'mens', order: 3 },
  {
    field: 'open',
    slug: 'the-open-championship',
    name: 'The Open Championship',
    tour: 'mens',
    order: 4,
  },

  // Women's, in calendar order. `nabisco` and `wbritish` are the template's
  // parameter names for events that have since been renamed.
  {
    field: 'nabisco',
    slug: 'chevron-championship',
    name: 'The Chevron Championship',
    tour: 'womens',
    order: 5,
  },
  {
    field: 'lpga',
    slug: 'womens-pga-championship',
    name: "Women's PGA Championship",
    tour: 'womens',
    order: 6,
  },
  { field: 'wusopen', slug: 'us-womens-open', name: "U.S. Women's Open", tour: 'womens', order: 7 },
  {
    field: 'wbritish',
    slug: 'womens-british-open',
    name: "AIG Women's Open",
    tour: 'womens',
    order: 8,
  },
  {
    field: 'evian',
    slug: 'evian-championship',
    name: 'The Evian Championship',
    tour: 'womens',
    order: 9,
  },

  // Discontinued women's majors. Mapped to no competition on purpose: the win
  // is a fact about the player and the event is not one we carry.
  { field: 'dumaurier', slug: null, name: 'du Maurier Classic', tour: 'womens', order: 10 },
  {
    field: 'titleholders',
    slug: null,
    name: 'Titleholders Championship',
    tour: 'womens',
    order: 11,
  },
  { field: 'westernopen', slug: null, name: "Women's Western Open", tour: 'womens', order: 12 },
];

/**
 * The win-count fields, which are the other half of a golfer's record.
 *
 * A major count alone understates a career: Sam Snead won 82 PGA Tour events
 * and seven majors, and a profile showing only the seven is describing a
 * different player. These are counts rather than dated wins, so they become
 * attributes rather than honour rows.
 *
 * Each value is a count possibly followed by a parenthetical ranking, as in
 * `82 ([[List of golfers with most PGA Tour wins|Tied-1st all-time]])`, which
 * is why they are read with a leading-integer parser rather than a strict one.
 */
export const GOLF_WIN_COUNT_FIELDS: { field: string; key: string; label: string }[] = [
  { field: 'prowins', key: 'proWins', label: 'Professional wins' },
  { field: 'majorwins', key: 'majorWins', label: 'Major championships' },
  { field: 'pgawins', key: 'pgaTourWins', label: 'PGA Tour wins' },
  { field: 'eurowins', key: 'europeanTourWins', label: 'European Tour wins' },
  { field: 'lpgawins', key: 'lpgaTourWins', label: 'LPGA Tour wins' },
  { field: 'letwins', key: 'letWins', label: 'Ladies European Tour wins' },
  { field: 'japwins', key: 'japanTourWins', label: 'Japan Golf Tour wins' },
  { field: 'asiawins', key: 'asianTourWins', label: 'Asian Tour wins' },
  { field: 'auswins', key: 'ausTourWins', label: 'PGA Tour of Australasia wins' },
  { field: 'sunwins', key: 'sunshineTourWins', label: 'Sunshine Tour wins' },
  { field: 'champwins', key: 'championsTourWins', label: 'PGA Tour Champions wins' },
  { field: 'otherwins', key: 'otherWins', label: 'Other wins' },
];
