/**
 * SPARQL queries against the Wikidata Query Service.
 *
 * Kept as data rather than built by string concatenation at the call site, so
 * that a query can be pasted into query.wikidata.org unchanged when it
 * misbehaves. That matters: SPARQL fails in ways that are far easier to diagnose
 * in the official editor than through an HTTP client.
 *
 * ## Why Wikidata is ingested first
 *
 * It is CC0. No attribution, no share-alike, unrestricted commercial use,
 * storage and redistribution. Of everything researched it is the only source
 * whose licence imposes no conditions at all, which makes it the safest possible
 * foundation and the one layer that can be populated across every sport before a
 * single subscription is paid for.
 *
 * Note the boundary carefully: **Wikidata's structured statements are CC0, but
 * Wikipedia's article prose is CC BY-SA.** Copying an article paragraph into
 * `team.about` would attach share-alike obligations to our pages. Only the
 * structured claims fetched here are safe; editorial prose is written by us.
 *
 * ## What Wikidata is and is not good for
 *
 * Verified while building this, rather than assumed:
 *
 *   - **People: excellent.** Messi's entity carries 184 external identifiers,
 *     including Transfermarkt (P2446). Cross-referencing a person to another
 *     provider is usually deterministic.
 *   - **Clubs: much weaker.** Real Madrid carries 79 external identifiers but
 *     almost none pointing at the major sports databases. Club matching
 *     therefore falls back to name and country similarity, which is why the
 *     resolution review queue exists rather than being optional.
 *   - **Match statistics: absent.** Wikidata holds entities, honours and
 *     biography. It does not hold per-match statistics, and no amount of
 *     querying will make it. Those arrive from a paid feed or not at all.
 */

/** Wikidata items used as class or value constants, named so the queries read as prose. */
export const WD = {
  /** association football club */
  FOOTBALL_CLUB: 'Q476028',
  /** national association football team */
  NATIONAL_FOOTBALL_TEAM: 'Q6979593',
  /** cricket team */
  CRICKET_TEAM: 'Q13393265',
  /** basketball team */
  BASKETBALL_TEAM: 'Q13393265',
  /** Formula One team */
  F1_TEAM: 'Q10497835',
  /** human */
  HUMAN: 'Q5',
  /** association football */
  SPORT_FOOTBALL: 'Q2736',
  /** cricket */
  SPORT_CRICKET: 'Q5375',
  /** basketball */
  SPORT_BASKETBALL: 'Q5372',
  /** tennis */
  SPORT_TENNIS: 'Q847',
  /** Formula One */
  SPORT_F1: 'Q1968',
} as const;

/**
 * External-identifier properties worth carrying across.
 *
 * Verified as present on real entities rather than guessed: several plausible
 * candidates turned out to be player-scoped only, or absent entirely. An
 * unverified property costs a column of nulls and a false sense of coverage.
 */
export const CROSS_REFERENCE_PROPERTIES = {
  /** Transfermarkt player ID. Densely populated on footballers. */
  P2446: 'transfermarkt',
  /** National-Football-Teams.com player ID. */
  P2574: 'national_football_teams',
  /** FIFA player ID. */
  P1469: 'fifa',
  /** ESPNcricinfo player ID. */
  P2697: 'espncricinfo',
  /** NBA player ID. */
  P3647: 'nba',
  /** ATP player ID. */
  P536: 'atp',
  /** Formula One driver ID (driverdb). */
  P2232: 'f1_driver',
} as const;

/**
 * Teams belonging to a named set of competitions.
 *
 * Two constraints here were added after testing the obvious version against the
 * live endpoint, and both matter:
 *
 *   1. **Scoped to competitions, not to the class.** Querying every item of
 *      class "association football club" returns amateur village sides first,
 *      because ordering is by QID and QID order is arbitrary. Ingesting that
 *      blind fills the database with clubs nobody will ever search for, at the
 *      cost of the request budget and the review queue. Scoping to the leagues
 *      we actually cover keeps the corpus relevant.
 *   2. **`rdfs:label` is required, not optional.** The label service falls back
 *      to the bare QID when no English label exists, so an unfiltered query
 *      happily returns a team whose name is "Q1000185". Requiring a real English
 *      label drops those rather than storing visible nonsense.
 *
 * The class constraint is still needed alongside the competition one: P118
 * (league) is used on *players* as well as clubs, so without it this returns
 * footballers.
 *
 * Note that P118 is historical, so defunct clubs appear. That is correct for an
 * archive product and is what `team.isActive` exists to express.
 */
export function teamsByCompetitionQuery(
  competitionQids: readonly string[],
  classQid: string,
  limit: number,
  offset: number,
): string {
  const values = competitionQids.map((qid) => `wd:${qid}`).join(' ');
  return `
SELECT ?item ?itemLabel ?inception ?countryLabel ?shortName ?logo WHERE {
  VALUES ?league { ${values} }
  ?item wdt:P118 ?league .
  ?item wdt:P31/wdt:P279* wd:${classQid} .
  ?item rdfs:label ?itemLabel . FILTER(LANG(?itemLabel) = "en")
  OPTIONAL { ?item wdt:P571 ?inception }
  OPTIONAL { ?item wdt:P17 ?country }
  OPTIONAL { ?item wdt:P1813 ?shortName }
  OPTIONAL { ?item wdt:P154 ?logo }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
}
ORDER BY ?item
LIMIT ${limit}
OFFSET ${offset}`.trim();
}

/**
 * Teams reachable only by class, for sports with no useful competition scoping.
 *
 * Covers national sides, which are not league members, and Formula 1
 * constructors, which have no equivalent of a league membership property.
 *
 * `requireInception` exists because of a concrete failure found by running this
 * against Formula 1. The constructor class returns **every entrant in the
 * sport's history**, including private individuals who entered a single car in
 * the 1950s: "Adolf Brudes", "A. J. Watson", "Ace Garage - Rotherham". Ingesting
 * those 199 rows buried Ferrari and Mercedes under people nobody is searching
 * for, and every one of them arrived with no country and no founding date.
 *
 * Requiring a founding date is a crude but effective proxy for "this is an
 * organisation somebody has bothered to document properly". It cuts the F1 set
 * to recognisable constructors, at the cost of excluding a handful of genuine
 * but poorly documented teams, which is the right trade for a site whose first
 * job is to have the famous ones.
 *
 * The general lesson, which applies to every source: a query that returns rows
 * is not a query that returns the *right* rows, and the difference only shows up
 * when you look at what actually landed.
 */
export function teamsByClassQuery(
  classQid: string,
  limit: number,
  offset: number,
  requireInception = false,
): string {
  const inceptionClause = requireInception
    ? '?item wdt:P571 ?inception .'
    : 'OPTIONAL { ?item wdt:P571 ?inception }';

  return `
SELECT ?item ?itemLabel ?inception ?countryLabel ?shortName ?logo WHERE {
  ?item wdt:P31/wdt:P279* wd:${classQid} .
  ?item rdfs:label ?itemLabel . FILTER(LANG(?itemLabel) = "en")
  ${inceptionClause}
  OPTIONAL { ?item wdt:P17 ?country }
  OPTIONAL { ?item wdt:P1813 ?shortName }
  OPTIONAL { ?item wdt:P154 ?logo }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
}
ORDER BY ?item
LIMIT ${limit}
OFFSET ${offset}`.trim();
}

/**
 * People who compete in one sport, optionally narrowed to given competitions.
 *
 * Three details established by testing against the live endpoint:
 *
 *   1. **Cross-reference coverage on people is excellent.** A sample of Premier
 *      League footballers returned a Transfermarkt identifier for every single
 *      row. Person matching against a commercial provider can therefore usually
 *      be deterministic rather than fuzzy, which is the opposite of the club
 *      case and the main reason Wikidata is worth ingesting first.
 *   2. **Rows multiply.** A person with two English labels, or two values for
 *      any optional property, produces one row per combination. The adapter
 *      deduplicates by QID; without that, ingestion would create duplicate
 *      people. `SAMPLE` is used on the optionals to keep the multiplication
 *      down at source as well.
 *   3. **An English label is required**, for the same reason as teams: the label
 *      service otherwise returns the bare QID as the name.
 *
 * Filtering is on P641 (sport). P106 (occupation) was considered and is worse
 * here: it is populated with generic values like "association football player"
 * that do not distinguish the sport reliably enough to scope a query.
 */
export function peopleQuery(
  sportQid: string,
  competitionQids: readonly string[] | null,
  limit: number,
  offset: number,
): string {
  const competitionClause =
    competitionQids && competitionQids.length > 0
      ? `VALUES ?league { ${competitionQids.map((qid) => `wd:${qid}`).join(' ')} }\n  ?item wdt:P118 ?league .`
      : '';

  return `
SELECT ?item ?itemLabel
       (SAMPLE(?birth) AS ?birthDate)
       (SAMPLE(?death) AS ?deathDate)
       (SAMPLE(?countryLabel) AS ?nationality)
       (SAMPLE(?image) AS ?imageUrl)
       (SAMPLE(?transfermarkt) AS ?transfermarktId)
       (SAMPLE(?fifa) AS ?fifaId)
       (SAMPLE(?espncricinfo) AS ?espncricinfoId)
       (SAMPLE(?nba) AS ?nbaId)
       (SAMPLE(?atp) AS ?atpId)
WHERE {
  ${competitionClause}
  ?item wdt:P31 wd:${WD.HUMAN} .
  ?item wdt:P641 wd:${sportQid} .
  ?item rdfs:label ?itemLabel . FILTER(LANG(?itemLabel) = "en")
  OPTIONAL { ?item wdt:P569 ?birth }
  OPTIONAL { ?item wdt:P570 ?death }
  OPTIONAL { ?item wdt:P27 ?countryItem . ?countryItem rdfs:label ?countryLabel . FILTER(LANG(?countryLabel) = "en") }
  OPTIONAL { ?item wdt:P18 ?image }
  OPTIONAL { ?item wdt:P2446 ?transfermarkt }
  OPTIONAL { ?item wdt:P1469 ?fifa }
  OPTIONAL { ?item wdt:P2697 ?espncricinfo }
  OPTIONAL { ?item wdt:P3647 ?nba }
  OPTIONAL { ?item wdt:P536 ?atp }
}
GROUP BY ?item ?itemLabel
ORDER BY ?item
LIMIT ${limit}
OFFSET ${offset}`.trim();
}

/** Competitions for one sport, via the sport property on the competition itself. */
export function competitionsQuery(sportQid: string, limit: number, offset: number): string {
  return `
SELECT ?item ?itemLabel ?inception ?countryLabel ?logo WHERE {
  ?item wdt:P641 wd:${sportQid} .
  ?item wdt:P31/wdt:P279* wd:Q13406554 .
  OPTIONAL { ?item wdt:P571 ?inception }
  OPTIONAL { ?item wdt:P17 ?country }
  OPTIONAL { ?item wdt:P154 ?logo }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
}
ORDER BY ?item
LIMIT ${limit}
OFFSET ${offset}`.trim();
}

/** Venues that host one sport. */
export function venuesQuery(sportQid: string, limit: number, offset: number): string {
  return `
SELECT ?item ?itemLabel ?capacity ?cityLabel ?countryLabel ?opened WHERE {
  ?item wdt:P641 wd:${sportQid} .
  ?item wdt:P31/wdt:P279* wd:Q1076486 .
  OPTIONAL { ?item wdt:P1083 ?capacity }
  OPTIONAL { ?item wdt:P131 ?city }
  OPTIONAL { ?item wdt:P17 ?country }
  OPTIONAL { ?item wdt:P1619 ?opened }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
}
ORDER BY ?item
LIMIT ${limit}
OFFSET ${offset}`.trim();
}
