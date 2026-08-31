import type { CuratedCompetition } from './football-competitions';

/**
 * The tennis competitions worth showing, and what each one is.
 *
 * Ingestion left tennis with thirteen competitions, and the four that matter
 * most were not among them. The catalogue held Wimbledon, six NCAA divisions,
 * the Tennis-Bundesliga, the Czech Extraliga and two Indian franchise leagues,
 * every one carrying `tier = 3` and `notability = 0` except Wimbledon, whose
 * notability was also 0. There was no Australian Open, no Roland-Garros and no
 * US Open: three quarters of the Grand Slams were simply absent, and with them
 * any possibility of recording that somebody had won one.
 *
 * This file is the judgement that was missing, and follows
 * `basketball-competitions.ts` exactly: a short curated list, with everything
 * not named here deleted by `seedCuratedCompetitions`.
 *
 * ## What earns a place
 *
 * Tennis is watched through the four majors, and the list says so. Nine
 * competitions:
 *
 *   - **The four Grand Slams**, which are the sport's pinnacle and the unit
 *     careers are measured in.
 *   - **The Olympic tournament**, which completes the Golden Slam and is the
 *     one event outside the majors with its own historical weight.
 *   - **The two season finales**, the ATP Finals and the WTA Finals, contested
 *     by the eight highest-ranked players of the year.
 *   - **The two national-team competitions**, the Davis Cup and the Billie Jean
 *     King Cup.
 *
 * Everything else is out, including the Masters 1000 and WTA 1000 tiers. Those
 * are real and well-followed, and they are a tier of many events rather than a
 * single competition: adding them means adding thirteen rows, which is a
 * separate decision from this one. A line can be added back at a time.
 *
 * The NCAA divisions and the club leagues are deleted. They are competitions,
 * and no reader opens a tennis site to look them up.
 *
 * ## On `kind`, and why a Grand Slam is international
 *
 * `kind` drives the tab's two filters through `COMPETITION_KIND_GROUPS`, where
 * "Leagues" expands to `domestic` and `continental` while "International" is
 * `international` alone. The split is by **who competes**.
 *
 * Every competition here is `international`, which is unusual and is correct.
 * Tennis has no club game: the majors are open to any player in the world who
 * qualifies, and the Davis Cup and Billie Jean King Cup are contested by
 * countries. There is nothing to put in the Leagues filter, because the sport
 * does not have one, and inventing a `domestic` classification for the
 * Australian Open on the grounds that it is held in Australia would say
 * something false about who may enter it.
 *
 * ## Tiers and notability
 *
 * `tier` groups, `notability` orders within a group. Both are set here because
 * ingestion sets neither, and with both flat the listing has nothing to sort
 * by.
 *
 * The four majors lead and are deliberately given four different notability
 * values rather than one. They are not equal in the sport's imagination:
 * Wimbledon is the oldest and the one a non-follower can name, and the
 * Australian Open is the one most often skipped in the amateur era. The order
 * here is Wimbledon, then the US Open, Roland-Garros and the Australian Open,
 * which is conventional rather than provable, and it only decides the order of
 * four rows within a tier.
 */
export const TENNIS_CURATED_COMPETITIONS: CuratedCompetition[] = [
  // ── The Grand Slams ────────────────────────────────────────────────────────
  {
    slug: 'wimbledon',
    wikidata: 'Q41520',
    name: 'Wimbledon',
    kind: 'international',
    format: 'knockout',
    country: null,
    tier: 1,
    notability: 100,
    foundedYear: 1877,
    logoFile: 'Wimbledon.svg',
  },
  {
    slug: 'us-open-tennis',
    wikidata: 'Q123577',
    name: 'US Open',
    kind: 'international',
    format: 'knockout',
    country: null,
    tier: 1,
    notability: 96,
    foundedYear: 1881,
    create: true,
    logoFile: 'Usopen-horizontal-logo.svg',
  },
  {
    slug: 'french-open',
    wikidata: 'Q43605',
    name: 'French Open',
    kind: 'international',
    format: 'knockout',
    country: null,
    tier: 1,
    notability: 94,
    foundedYear: 1891,
    create: true,
    logoFile: 'Logo_Roland-Garros.svg',
  },
  {
    slug: 'australian-open',
    wikidata: 'Q60874',
    name: 'Australian Open',
    kind: 'international',
    format: 'knockout',
    country: null,
    tier: 1,
    notability: 92,
    foundedYear: 1905,
    create: true,
    logoFile: 'Australian_Open_Logo_2017.svg',
  },

  // ── The Olympics ───────────────────────────────────────────────────────────
  //
  // Tier 1 alongside the majors rather than below them. It is played once every
  // four years, which makes an Olympic gold rarer than any single major, and it
  // is the title that separates a Golden Slam from a Grand Slam.
  {
    slug: 'olympic-tennis',
    wikidata: 'Q270163',
    name: 'Olympic Tennis',
    kind: 'international',
    format: 'knockout',
    country: null,
    tier: 1,
    notability: 88,
    foundedYear: 1896,
    create: true,
    logoFile: 'Olympic_rings_without_rims.svg',
  },

  // ── The season finales ─────────────────────────────────────────────────────
  //
  // The only titles in tennis decided over a group stage, contested by the
  // eight players who qualified through the year's Race.
  {
    // No logoFile: the article's only image is `Nitto ATP Finals logo.jpg`,
    // and the backfill rejects a .jpg so a photograph never becomes a logo.
    slug: 'atp-finals',
    wikidata: 'Q270907',
    name: 'ATP Finals',
    kind: 'international',
    format: 'group_knockout',
    country: null,
    tier: 2,
    notability: 80,
    foundedYear: 1970,
    create: true,
  },
  {
    // No logoFile: the article carries no logo image at all upstream.
    slug: 'wta-finals',
    wikidata: 'Q220347',
    name: 'WTA Finals',
    kind: 'international',
    format: 'group_knockout',
    country: null,
    tier: 2,
    notability: 78,
    foundedYear: 1972,
    create: true,
  },

  // ── National teams ─────────────────────────────────────────────────────────
  //
  // The two competitions where tennis is played by country rather than by
  // individual, which is why several hundred players in this catalogue carry a
  // "Davis Cup team" or "Billie Jean King Cup team" as their recorded club.
  {
    slug: 'davis-cup',
    wikidata: 'Q132377',
    name: 'Davis Cup',
    kind: 'international',
    format: 'knockout',
    country: null,
    tier: 2,
    notability: 74,
    foundedYear: 1900,
    create: true,
    logoFile: 'Logo Davis Cup.svg',
  },
  {
    slug: 'billie-jean-king-cup',
    wikidata: 'Q206984',
    name: 'Billie Jean King Cup',
    kind: 'international',
    format: 'knockout',
    country: null,
    tier: 2,
    notability: 72,
    foundedYear: 1963,
    create: true,
    logoFile: 'Billie Jean King Cup Logo.svg',
  },

  // ── The tier below the majors, by example ─────────────────────────────────
  //
  // Two additions beyond the set above, so the tab shows that tennis continues
  // below the majors without listing all nine Masters events and burying them.
  {
    // Routinely called the "fifth Grand Slam": the largest tournament outside
    // the four, and the fair single representative of the Masters tier.
    // No logoFile: upstream carries only `Bnpparibasopen.jpg`.
    slug: 'indian-wells-masters',
    wikidata: 'Q642806',
    name: 'Indian Wells Masters',
    kind: 'international',
    format: 'knockout',
    country: 'United States',
    tier: 3,
    notability: 70,
    foundedYear: 1974,
    create: true,
  },
  {
    // The mixed national-team event that opens the season, and the only one of
    // the three team competitions in which men and women compete for one result.
    // No logoFile: upstream carries only `United Cup logo.jpg`.
    slug: 'united-cup',
    wikidata: 'Q112103192',
    name: 'United Cup',
    kind: 'international',
    format: 'group_knockout',
    country: 'Australia',
    tier: 3,
    notability: 62,
    foundedYear: 2023,
    create: true,
  },
];
/** The slugs above, for the delete pass that removes everything else. */
export const TENNIS_CURATED_SLUGS: ReadonlySet<string> = new Set(
  TENNIS_CURATED_COMPETITIONS.map((entry) => entry.slug),
);

/**
 * The four majors, keyed by the infobox field that reports a player's result.
 *
 * `Infobox tennis biography` states each Grand Slam result in its own field:
 * `AustralianOpenresult`, `FrenchOpenresult`, `Wimbledonresult` and
 * `USOpenresult`, with the value `W (2004, 2006, ...)` for a champion. That is
 * a far better source for slam counts than anything in Wikidata, which records
 * the titles inconsistently and often not at all.
 *
 * Exported here rather than in the ingestion service so the mapping from a
 * field to a competition slug lives beside the competitions themselves: adding
 * a major to one list without the other would silently drop its titles.
 */
export const TENNIS_SLAM_FIELDS: {
  field: string;
  doublesField: string;
  slug: string;
  name: string;
  /** Orders the slam breakdown on a player's profile, by calendar position. */
  order: number;
}[] = [
  {
    field: 'AustralianOpenresult',
    doublesField: 'AustralianOpenDoublesresult',
    slug: 'australian-open',
    name: 'Australian Open',
    order: 1,
  },
  {
    field: 'FrenchOpenresult',
    doublesField: 'FrenchOpenDoublesresult',
    slug: 'french-open',
    name: 'French Open',
    order: 2,
  },
  {
    field: 'Wimbledonresult',
    doublesField: 'WimbledonDoublesresult',
    slug: 'wimbledon',
    name: 'Wimbledon',
    order: 3,
  },
  {
    field: 'USOpenresult',
    doublesField: 'USOpenDoublesresult',
    slug: 'us-open-tennis',
    name: 'US Open',
    order: 4,
  },
];

/**
 * The non-slam competitions read from the same infobox.
 *
 * Kept separate from the majors because they are counted separately everywhere
 * in tennis: "20 majors" never includes an Olympic gold or a Tour Finals title,
 * and a profile that added them together would be stating something the sport
 * does not recognise.
 */
export const TENNIS_OTHER_TITLE_FIELDS: {
  field: string;
  doublesField?: string;
  slug: string;
  name: string;
}[] = [
  {
    field: 'Olympicsresult',
    doublesField: 'OlympicsDoublesresult',
    slug: 'olympic-tennis',
    name: 'Olympic Games',
  },
  { field: 'MastersCupresult', slug: 'atp-finals', name: 'ATP Finals' },
  { field: 'WTAChampionshipsresult', slug: 'wta-finals', name: 'WTA Finals' },
  { field: 'DavisCupresult', slug: 'davis-cup', name: 'Davis Cup' },
  { field: 'FedCupresult', slug: 'billie-jean-king-cup', name: 'Billie Jean King Cup' },
  {
    field: 'BillieJeanKingCupresult',
    slug: 'billie-jean-king-cup',
    name: 'Billie Jean King Cup',
  },
];
