import type { CuratedCompetition } from './football-competitions';

/**
 * The basketball competitions worth showing, and what each one is.
 *
 * Ingestion inserted every competition the provider returned and judged none of
 * them, which left **605** basketball rows. Almost all of it is noise: 464 were
 * filed as domestic and 141 as international, with every one carrying `tier = 3`
 * and `notability = 0`, so the ordering collapsed to alphabetical and the tab
 * opened on whatever happened to sort first. Among them sat six variants of the
 * NCAA divisions, the NBA G League, the NBA Summer League, EuroLeague Women and
 * an article titled "History of the FIBA Basketball World Cup", which is a
 * history page rather than a competition.
 *
 * This file is the judgement that was missing, and follows
 * `football-competitions.ts` exactly: a short curated list, with everything not
 * named here deleted by `seedCuratedCompetitions`. Curated rather than inferred
 * for the same reason as always: the automatic proxies measure how much has been
 * written about a competition, not whether a reader wants it, and a bad
 * inference cannot be corrected by hand.
 *
 * ## What earns a place
 *
 * Basketball is watched overwhelmingly through the NBA, and the list is
 * deliberately narrow to say so. Six competitions:
 *
 *   - **International**: the FIBA World Cup and the Olympic tournament, which
 *     are the two national-team events anyone follows.
 *   - **Leagues**: the NBA, the EuroLeague, the WNBA, and the NCAA Division I
 *     tournament, better known as March Madness.
 *
 * Everything else is out. That includes competitions that are real and
 * well-followed in their own right, the Liga ACB and the Basketball Champions
 * League among them: the brief here is a very short list, and a line can be
 * added back one at a time.
 *
 * ## On `kind`, and why the NBA is domestic
 *
 * `kind` drives the tab's two filters through `COMPETITION_KIND_GROUPS`, where
 * "Leagues" expands to `domestic` and `continental` while "International" is
 * `international` alone. The split is by **who competes**, not by how far the
 * competition travels, which is why the EuroLeague is `continental` rather than
 * `international`: it is contested by clubs, the same clubs as their domestic
 * leagues, and grouping it with the World Cup would put club and country in one
 * list. The NBA is `domestic` for the same reason, notwithstanding its Canadian
 * team.
 *
 * ## Tiers and notability
 *
 * `tier` groups, `notability` orders within a group. Both are set here because
 * ingestion sets neither, and with both flat the listing has nothing to sort by.
 * The NBA leads on both: it is the competition this sport is watched for.
 */
export const BASKETBALL_CURATED_COMPETITIONS: CuratedCompetition[] = [
  {
    slug: 'nba',
    wikidata: 'Q155223',
    name: 'NBA',
    kind: 'domestic',
    format: 'league',
    country: 'United States',
    tier: 1,
    notability: 100,
    foundedYear: 1946,
  },
  {
    slug: 'fiba-basketball-world-cup',
    wikidata: 'Q26001',
    name: 'FIBA Basketball World Cup',
    kind: 'international',
    format: 'group_knockout',
    country: null,
    tier: 1,
    notability: 92,
    foundedYear: 1950,
  },
  {
    // The Olympic tournament has no competition row of its own at all: the
    // ingest returned none, so this is created rather than corrected.
    slug: 'olympic-basketball',
    wikidata: 'Q208137',
    name: 'Olympic Basketball',
    kind: 'international',
    format: 'group_knockout',
    country: null,
    tier: 1,
    notability: 90,
    foundedYear: 1936,
  },
  {
    slug: 'euroleague',
    wikidata: 'Q185982',
    name: 'EuroLeague',
    // Continental rather than international: contested by clubs, so it belongs
    // beside the leagues in the tab rather than beside the World Cup.
    kind: 'continental',
    format: 'league',
    country: null,
    tier: 2,
    notability: 80,
    foundedYear: 1958,
  },
  {
    // Named for both, because a reader looking for either should find it: the
    // tournament's formal name is the first and nobody calls it that.
    slug: 'ncaa-division-i',
    wikidata: 'Q996954',
    name: 'NCAA Division I (March Madness)',
    kind: 'domestic',
    format: 'knockout',
    country: 'United States',
    tier: 2,
    notability: 78,
    foundedYear: 1939,
  },
  {
    slug: 'wnba',
    wikidata: 'Q2593221',
    name: 'WNBA',
    kind: 'domestic',
    format: 'league',
    country: 'United States',
    tier: 2,
    notability: 74,
    foundedYear: 1996,
  },
];

/** The slugs above, for the delete pass that removes everything else. */
export const BASKETBALL_CURATED_SLUGS: ReadonlySet<string> = new Set(
  BASKETBALL_CURATED_COMPETITIONS.map((entry) => entry.slug),
);
