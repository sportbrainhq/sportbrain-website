import type { CuratedCompetition } from './football-competitions';

/**
 * The boxing competitions worth showing, and what each one is.
 *
 * This is the only sport in the catalogue whose Competitions tab is seeded
 * outright rather than curated on top of an ingest, because boxing is the only
 * one Wikidata cannot supply. The generic sports-competition class filtered to
 * boxing returns a single obscure row, and no better class exists: the sport's
 * real structure is four sanctioning bodies awarding a belt per weight class,
 * and those are modelled as sports organisations, which is what they are.
 *
 * Pointing the ingest at a class that does not describe the sport would fill
 * the tab with rows that are wrong rather than leave it empty, so the ingest
 * config sets no `competitionClassQid` for boxing and this file supplies the
 * six rows instead. Every entry therefore carries `create: true`.
 *
 * ## Why a sanctioning body is listed as a competition
 *
 * It is the closest honest fit, and the alternative is worse. A WBC world
 * title is the thing a boxer wins, defends and is remembered for, which is
 * what a competition means to a reader looking at this tab. The body itself is
 * an organisation, but "the WBC world championship" is not: it is a title
 * contested continuously across seventeen weight classes, closer to a
 * championship than to a league or a knockout draw, which is why every row
 * here is `format: 'championship'` rather than `'knockout'`.
 *
 * The honest limitation is that one row stands for seventeen divisional
 * titles. Splitting them would mean sixty-eight rows across the four bodies,
 * which is a decision to take when there are enough fighters ingested to hang
 * on them, not before.
 *
 * ## On `kind`
 *
 * All six are `international`. Nothing about professional boxing is domestic:
 * a sanctioning body's belts are open to any fighter in the world, and the
 * bouts are staged wherever the money is rather than in the body's home
 * country. Classifying the WBC as Mexican because it is headquartered in
 * Mexico City would say something false about who can enter.
 *
 * ## Tiers and notability
 *
 * `tier` groups, `notability` orders within a group.
 *
 * The four sanctioning bodies share tier 1 and are separated only by
 * notability, in the order the sport conventionally lists them: WBC, WBA, IBF,
 * WBO. That ordering is conventional rather than provable, and it decides the
 * order of four rows within one group and nothing else.
 *
 * The Ring's championship sits in tier 2 with them rather than above them,
 * which is a deliberate call. It is a magazine's title and it sanctions
 * nothing, but it is the closest thing boxing has to a lineal championship and
 * is the one belt awarded on the basis of who beat whom rather than on who
 * paid a sanctioning fee. The Olympic tournament is tier 2 as well: it is the
 * amateur sport's pinnacle and the route most professionals arrive by, and it
 * is not a professional world title.
 */
export const BOXING_CURATED_COMPETITIONS: CuratedCompetition[] = [
  // ── The four sanctioning bodies ────────────────────────────────────────────
  {
    slug: 'wbc-world-championship',
    wikidata: 'Q724450',
    name: 'WBC World Championship',
    kind: 'international',
    format: 'championship',
    country: null,
    tier: 1,
    notability: 100,
    foundedYear: 1963,
    create: true,
  },
  {
    slug: 'wba-world-championship',
    wikidata: 'Q725676',
    name: 'WBA World Championship',
    kind: 'international',
    format: 'championship',
    country: null,
    tier: 1,
    notability: 95,
    foundedYear: 1921,
    create: true,
  },
  {
    slug: 'ibf-world-championship',
    wikidata: 'Q742944',
    name: 'IBF World Championship',
    kind: 'international',
    format: 'championship',
    country: null,
    tier: 1,
    notability: 90,
    foundedYear: 1983,
    create: true,
  },
  {
    slug: 'wbo-world-championship',
    wikidata: 'Q830940',
    name: 'WBO World Championship',
    kind: 'international',
    format: 'championship',
    country: null,
    tier: 1,
    notability: 85,
    foundedYear: 1988,
    create: true,
  },

  // ── The lineal title, and the amateur game ─────────────────────────────────
  {
    // Q1140774 is The Ring, the magazine, which is the entity that awards the
    // title and the only one Wikidata holds: there is no separate item for the
    // championship itself. Recorded so enrichment has something to reach, with
    // the understanding that the facts it returns will describe a publication.
    slug: 'the-ring-championship',
    wikidata: 'Q1140774',
    name: 'The Ring Championship',
    kind: 'international',
    format: 'championship',
    country: null,
    tier: 2,
    notability: 70,
    foundedYear: 1922,
    create: true,
  },
  {
    slug: 'olympic-boxing',
    wikidata: 'Q578715',
    name: 'Boxing at the Summer Olympics',
    kind: 'international',
    format: 'knockout',
    country: null,
    tier: 2,
    notability: 65,
    foundedYear: 1904,
    create: true,
  },
];

/** The slugs above, for the delete pass that removes everything else. */
export const BOXING_CURATED_SLUGS: ReadonlySet<string> = new Set(
  BOXING_CURATED_COMPETITIONS.map((entry) => entry.slug),
);
