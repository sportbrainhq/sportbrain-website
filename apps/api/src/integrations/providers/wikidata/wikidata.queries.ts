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

/**
 * ## Ordering by notability
 *
 * Every paged query below orders by `wikibase:sitelinks` descending, and this
 * is the single most consequential detail in the file.
 *
 * The obvious ordering, by QID, is effectively random: QIDs reflect the order
 * somebody happened to create the item, not importance. Paging that way filled
 * the first two hundred football players with lower-league German professionals
 * and produced a database with no Beckham in it. Worse, those obscure entities
 * carry almost no honours, positions or images, so the data looked thin when
 * the problem was that we were reading the wrong end of the list.
 *
 * `wikibase:sitelinks` counts the Wikipedia language editions holding an
 * article on the entity. It is an excellent notability proxy, because the
 * players covered in a hundred languages are exactly the ones a visitor will
 * search for. Ordering by it turns page one from anonymity into Beckham (137),
 * Ibrahimovic (119), Suarez (113) and Lewandowski (106).
 *
 * The practical consequence: a partial ingestion is now a *useful* subset
 * rather than an arbitrary one. Stopping after five pages gives the thousand
 * most notable entities, which is the right thousand.
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
 * Players are excluded by ruling out humans rather than by requiring a club
 * class, and that difference is not cosmetic. Requiring "association football
 * club" (Q476028) sounds correct and quietly drops most major clubs: FC
 * Barcelona is classed as a men's association football team, not as a club, so
 * the class filter excluded it entirely and the catalogue was missing one of the
 * most-searched teams in the world. Measured across the five founding leagues,
 * the class filter matches 105 entities while excluding humans matches 128.
 *
 * League membership does not on its own guarantee a club, which the first
 * version assumed. Seasons, drafts and individual matches all carry P118 and
 * none of them is a person, so excluding humans alone let 68 of them into the
 * catalogue: "2023-24 Serie A", "2007 MLS SuperDraft" and
 * "Wellington Phoenix v Brisbane Roar, 31 March 2024" were all stored as teams.
 * The season and event classes are therefore excluded explicitly as well.
 *
 * The `_classQid` parameter is retained so the national-team path can keep
 * passing one, but this query no longer uses it.
 *
 * Note that P118 is historical, so defunct clubs appear. That is correct for an
 * archive product and is what `team.isActive` exists to express.
 */
export function teamsByCompetitionQuery(
  competitionQids: readonly string[],
  _classQid: string,
  limit: number,
  offset: number,
): string {
  const values = competitionQids.map((qid) => `wd:${qid}`).join(' ');
  return `
SELECT ?item ?itemLabel ?inception ?countryLabel ?shortName ?logo ?sitelinks WHERE {
  VALUES ?league { ${values} }
  ?item wdt:P118 ?league .
  FILTER NOT EXISTS { ?item wdt:P31 wd:${WD.HUMAN} }
  # Sports seasons, competition editions and single matches.
  FILTER NOT EXISTS { ?item wdt:P31/wdt:P279* wd:Q27020041 }
  FILTER NOT EXISTS { ?item wdt:P31/wdt:P279* wd:Q1656682 }
  # A season or match names the competition it belongs to; a club does not.
  FILTER NOT EXISTS { ?item wdt:P3450 ?anySeason }
  ?item rdfs:label ?itemLabel . FILTER(LANG(?itemLabel) = "en")
  OPTIONAL { ?item wdt:P571 ?inception }
  OPTIONAL { ?item wdt:P17 ?country }
  OPTIONAL { ?item wdt:P1813 ?shortName }
  OPTIONAL { ?item wdt:P154 ?logo }
  ?item wikibase:sitelinks ?sitelinks .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
}
ORDER BY DESC(?sitelinks)
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
SELECT ?item ?itemLabel ?inception ?countryLabel ?shortName ?logo ?sitelinks WHERE {
  ?item wdt:P31/wdt:P279* wd:${classQid} .
  ?item rdfs:label ?itemLabel . FILTER(LANG(?itemLabel) = "en")
  ${inceptionClause}
  OPTIONAL { ?item wdt:P17 ?country }
  OPTIONAL { ?item wdt:P1813 ?shortName }
  OPTIONAL { ?item wdt:P154 ?logo }
  ?item wikibase:sitelinks ?sitelinks .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
}
ORDER BY DESC(?sitelinks)
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
  requireParticipation = false,
  occupationQid?: string,
  clubClassQid?: string,
  minSitelinks?: number,
): string {
  // Identity only: who they are and how notable. Every optional detail moves to
  // `peopleDetailQuery`, which is bounded by a VALUES list of the people this
  // query already chose.
  //
  // The split is what makes the query finish at all. Nine OPTIONAL joins over an
  // unbounded candidate set took the Query Service past its 60-second limit on
  // every page; the same joins over a fixed hundred QIDs are trivial. Measured:
  // 21 seconds for this pass, a few for the second, against a 504 for the
  // combined form.
  //
  // Club membership is expressed as FILTER EXISTS rather than a join. A join
  // multiplies the row set by the number of clubs a player has had, which is
  // both wasteful and what pushed the combined query over the limit.
  const clubClause = clubClassQid ? 'FILTER EXISTS { ?item wdt:P54 ?anyClub }' : '';

  const competitionClause =
    !clubClassQid && competitionQids && competitionQids.length > 0
      ? `VALUES ?league { ${competitionQids.map((qid) => `wd:${qid}`).join(' ')} }\n  ?item wdt:P118 ?league .`
      : '';

  const participationClause = requireParticipation ? '?item wdt:P1344 ?participatedIn .' : '';
  const sitelinkClause = minSitelinks ? `FILTER(?sitelinks >= ${minSitelinks})` : '';

  // The name, taken from the English label where one exists and from the
  // English Wikipedia article title where it does not.
  //
  // Requiring `rdfs:label` in English silently drops people who plainly qualify.
  // Allan Border is the case that found this: 19 sitelinks, an English Wikipedia
  // article, `P641 = cricket` and `P106 = cricketer`, but no English *label* on
  // the Wikidata item, only Hindi, Portuguese, German, Bengali and nine others.
  // He was excluded from every page of every run while far more obscure
  // contemporaries were ingested.
  //
  // The sitelink is a sound fallback because it is the title of the article we
  // would map him to anyway, and `external_mapping` stores exactly that string.
  // COALESCE rather than a UNION so the ordering and paging are unaffected.
  return `
SELECT DISTINCT ?item (COALESCE(?label, ?article) AS ?itemLabel) ?sitelinks
WHERE {
  ${competitionClause}
  ${participationClause}
  ?item wdt:P31 wd:${WD.HUMAN} .
  ${occupationQid ? `?item wdt:P106 wd:${occupationQid} .` : `?item wdt:P641 wd:${sportQid} .`}
  ?item wikibase:sitelinks ?sitelinks .
  ${sitelinkClause}
  ${clubClause}
  OPTIONAL { ?item rdfs:label ?label . FILTER(LANG(?label) = "en") }
  OPTIONAL {
    ?sitelink schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> ;
              schema:name ?article .
  }
  # One of the two must exist: a person with neither an English label nor an
  # English article is not someone this catalogue can name.
  FILTER(BOUND(?label) || BOUND(?article))
}
ORDER BY DESC(?sitelinks)
LIMIT ${limit}
OFFSET ${offset}`.trim();
}

/**
 * Biographical detail for one page of people.
 *
 * Bounded by an explicit VALUES list, which is the whole point: the same
 * OPTIONAL joins that time out against every footballer in Wikidata cost almost
 * nothing against a hundred named QIDs.
 */
export function peopleDetailQuery(personQids: readonly string[]): string {
  const values = personQids.map((qid) => `wd:${qid}`).join(' ');

  return `
SELECT ?item
       (SAMPLE(?birth) AS ?birthDate)
       (SAMPLE(?death) AS ?deathDate)
       (MIN(?natLabel) AS ?nationality)
       (SAMPLE(?image) AS ?imageUrl)
       (SAMPLE(?posLabel) AS ?position)
       (SAMPLE(?clubLabel) AS ?currentClub)
       (SAMPLE(?height) AS ?heightCm)
       (SAMPLE(?transfermarkt) AS ?transfermarktId)
       (SAMPLE(?fifa) AS ?fifaId)
       (SAMPLE(?espncricinfo) AS ?espncricinfoId)
       (SAMPLE(?nba) AS ?nbaId)
       (SAMPLE(?atp) AS ?atpId)
WHERE {
  VALUES ?item { ${values} }
  OPTIONAL { ?item wdt:P569 ?birth }
  OPTIONAL { ?item wdt:P570 ?death }
  # MIN rather than SAMPLE on the label: a minority of players carry several
  # P1532 values (Ryan Giggs has both United Kingdom and Wales) and SAMPLE
  # returns an arbitrary one, which is the flaw that made this field wrong in
  # the first place. MIN is at least deterministic, so a re-ingest cannot
  # silently change a published value. Genuinely ambiguous players are resolved
  # from cap counts and article text out of band, not here.
  #
  # P1532 (country for sport), not P27 (citizenship). The question a profile
  # answers is who the player represented, and citizenship does not answer it:
  # Messi holds Argentine, Italian and Spanish citizenship, Klose German and
  # Polish, Kaká Brazilian and Italian, and with SAMPLE over P27 the three of
  # them were published as Spain, Poland and Italy. P1532 also distinguishes
  # England, Scotland, Wales and Northern Ireland, which citizenship reports as
  # a single "United Kingdom" despite there being four national teams.
  #
  # P27 is deliberately not a fallback. It produced Ben Stokes as New Zealand
  # for being born there and Mario Andretti as Italy, so where P1532 is absent
  # the field is left unset rather than filled with a guess.
  OPTIONAL { ?item wdt:P1532 ?nationalityItem .
             ?nationalityItem rdfs:label ?natLabel . FILTER(LANG(?natLabel) = "en") }
  OPTIONAL { ?item wdt:P18 ?image }
  OPTIONAL { ?item wdt:P413 ?positionItem .
             ?positionItem rdfs:label ?posLabel . FILTER(LANG(?posLabel) = "en") }
  OPTIONAL { ?item wdt:P54 ?clubItem .
             ?clubItem rdfs:label ?clubLabel . FILTER(LANG(?clubLabel) = "en") }
  OPTIONAL { ?item wdt:P2048 ?height }
  OPTIONAL { ?item wdt:P2446 ?transfermarkt }
  OPTIONAL { ?item wdt:P1469 ?fifa }
  OPTIONAL { ?item wdt:P2697 ?espncricinfo }
  OPTIONAL { ?item wdt:P3647 ?nba }
  OPTIONAL { ?item wdt:P536 ?atp }
}
GROUP BY ?item`.trim();
}

/**
 * Honours and awards held by one batch of people.
 *
 * Fetched separately from the person query rather than joined into it, for a
 * reason worth stating: a person with twenty awards would multiply their row
 * twenty times, and `SAMPLE` would then discard nineteen of them. Honours are
 * inherently one-to-many and need their own pass.
 *
 * The qualifier `pq:P585` (point in time) carries the year, which is what makes
 * an honours list readable rather than an undated jumble.
 *
 * Verified against live data: Cristiano Ronaldo returns Ballon d'Or and PFA
 * awards correctly, mixed in with state decorations such as the Order of Prince
 * Henry. The caller filters those out; this query stays honest about what
 * Wikidata holds.
 */
export function honoursQuery(personQids: readonly string[]): string {
  const values = personQids.map((qid) => `wd:${qid}`).join(' ');
  return `
SELECT ?item ?awardLabel ?when WHERE {
  VALUES ?item { ${values} }
  ?item p:P166 ?statement .
  ?statement ps:P166 ?award .
  OPTIONAL { ?statement pq:P585 ?when }
  ?award rdfs:label ?awardLabel . FILTER(LANG(?awardLabel) = "en")
}
ORDER BY ?item ?when`.trim();
}

/**
 * Titles and awards held by a batch of teams.
 *
 * Two properties are needed, and they carry genuinely different things:
 *
 *   - **P1346 (winner)**, queried inversely: competitions this team has won.
 *     This is what fills a club's trophy cabinet, and the `pq:P585` qualifier
 *     dates each win, so Real Madrid returns eight separate Supercopa titles
 *     rather than one undated entry.
 *   - **P166 (award received)**: awards given *to* the club rather than
 *     competitions it won, such as IFFHS World's Best Club.
 *
 * Querying only P166, as the person query does, would return a handful of
 * ceremonial awards and none of the trophies, which is the opposite of what a
 * club page is for. Both are unioned so one pass covers the cabinet.
 */
export function teamHonoursQuery(teamQids: readonly string[]): string {
  const values = teamQids.map((qid) => `wd:${qid}`).join(' ');
  return `
SELECT ?item ?awardLabel ?when ?kind WHERE {
  {
    VALUES ?item { ${values} }
    ?competition p:P1346 ?statement .
    ?statement ps:P1346 ?item .
    # Constrained to sports seasons. Without this, P1346 returns every
    # individual match a club has won: "Shakhtar Donetsk vs Juventus,
    # 5 December 2012" is a thing with a winner, and an unconstrained query
    # returned 10,527 of them for three pages of clubs. A season is the grain
    # at which a trophy is actually awarded.
    ?competition wdt:P31/wdt:P279* wd:Q27020041 .
    OPTIONAL { ?statement pq:P585 ?when }
    ?competition rdfs:label ?awardLabel . FILTER(LANG(?awardLabel) = "en")
    BIND("title" AS ?kind)
  } UNION {
    VALUES ?item { ${values} }
    ?item p:P166 ?statement .
    ?statement ps:P166 ?award .
    OPTIONAL { ?statement pq:P585 ?when }
    ?award rdfs:label ?awardLabel . FILTER(LANG(?awardLabel) = "en")
    BIND("award" AS ?kind)
  }
}
ORDER BY ?item ?when`.trim();
}

/**
 * Club and national-side memberships for a batch of people.
 *
 * P54 (member of sports team) with its `pq:P580` and `pq:P582` qualifiers is
 * what turns a player page from a snapshot into a career timeline. Without the
 * qualifiers a player appears to have been at every club simultaneously.
 */
export function membershipsQuery(personQids: readonly string[]): string {
  const values = personQids.map((qid) => `wd:${qid}`).join(' ');
  return `
SELECT ?item ?team ?teamLabel ?start ?end WHERE {
  VALUES ?item { ${values} }
  ?item p:P54 ?statement .
  ?statement ps:P54 ?team .
  OPTIONAL { ?statement pq:P580 ?start }
  OPTIONAL { ?statement pq:P582 ?end }
  ?team rdfs:label ?teamLabel . FILTER(LANG(?teamLabel) = "en")
}
ORDER BY ?item ?start`.trim();
}

/**
 * Competitions for one sport.
 *
 * The class matters enormously here, and getting it wrong is not a subtle
 * failure. The first attempt used `Q13406554` (sports competition), which
 * returns **180,801** football results, because it matches every *season* of
 * every league ever recorded: "2003-04 Premier League" is a sports competition.
 * Ingesting that would have buried the six competitions anyone wants under a
 * hundred thousand season rows.
 *
 * `Q15991303` (association football league) returns 2,009, which is the set of
 * actual leagues. Seasons belong in the `season` table, reached from the
 * competition, and are a separate ingestion concern.
 *
 * Ordered by inception so that long-established competitions arrive first: a
 * proxy for importance, in the absence of any notability ranking in Wikidata.
 */
export function competitionsQuery(
  sportQid: string,
  competitionClassQid: string,
  limit: number,
  offset: number,
): string {
  return `
SELECT ?item ?itemLabel ?inception ?countryLabel ?logo ?sitelinks WHERE {
  ?item wdt:P31/wdt:P279* wd:${competitionClassQid} .
  ?item wdt:P641 wd:${sportQid} .
  ?item rdfs:label ?itemLabel . FILTER(LANG(?itemLabel) = "en")
  OPTIONAL { ?item wdt:P571 ?inception }
  OPTIONAL { ?item wdt:P17 ?countryItem .
             ?countryItem rdfs:label ?countryLabel . FILTER(LANG(?countryLabel) = "en") }
  OPTIONAL { ?item wdt:P154 ?logo }
  ?item wikibase:sitelinks ?sitelinks .
}
ORDER BY DESC(?sitelinks)
LIMIT ${limit}
OFFSET ${offset}`.trim();
}

/**
 * Venues hosting one sport.
 *
 * A capacity is required rather than optional, which is the same quality filter
 * used for Formula 1 constructors and works for the same reason: a venue nobody
 * has recorded a capacity for is almost always a minor ground, and requiring one
 * sorts the notable from the obscure without needing a notability signal
 * Wikidata does not provide.
 *
 * Ordered by capacity descending, so the first page is Camp Nou and the Estadio
 * Azteca rather than a village recreation ground. Verified against live data.
 */
export function venuesQuery(
  sportQid: string,
  venueClassQid: string,
  limit: number,
  offset: number,
  skipSportFilter = false,
): string {
  return `
SELECT ?item ?itemLabel ?capacity ?cityLabel ?countryLabel ?opened WHERE {
  ?item wdt:P31/wdt:P279* wd:${venueClassQid} .
  ${skipSportFilter ? '' : `?item wdt:P641 wd:${sportQid} .`}
  ?item rdfs:label ?itemLabel . FILTER(LANG(?itemLabel) = "en")
  ${skipSportFilter ? 'OPTIONAL { ?item wdt:P1083 ?capacity }' : '?item wdt:P1083 ?capacity .'}
  OPTIONAL { ?item wdt:P131 ?cityItem .
             ?cityItem rdfs:label ?cityLabel . FILTER(LANG(?cityLabel) = "en") }
  OPTIONAL { ?item wdt:P17 ?countryItem .
             ?countryItem rdfs:label ?countryLabel . FILTER(LANG(?countryLabel) = "en") }
  OPTIONAL { ?item wdt:P1619 ?opened }
  ?item wikibase:sitelinks ?sitelinks .
}
ORDER BY DESC(?sitelinks)
LIMIT ${limit}
OFFSET ${offset}`.trim();
}
