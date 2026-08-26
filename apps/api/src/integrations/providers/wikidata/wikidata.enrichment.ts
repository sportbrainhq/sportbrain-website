/**
 * Queries that fill an entity page with detail.
 *
 * Everything here was verified against the live endpoint before being written
 * down, and several plausible-looking properties turned out to be wrong in ways
 * that would have silently produced nonsense:
 *
 *   - **P1351 is the goals qualifier**, not P6509. P6509 is a real property
 *     ("total goals in career") but sits at the top level rather than on a club
 *     spell, so querying it per spell returns nothing at all. P1351 as a
 *     qualifier on P54 is used by 141,414 footballers.
 *   - **P5233 is a film database identifier**, not a crest. The obvious guess
 *     would have populated club pages with links to Filmow.
 *
 * ## Coverage is uneven, and the design has to absorb that
 *
 * Barcelona carries a motto, an anthem, 49 chairmen and 140,000 members. Real
 * Madrid carries none of the first two and one of the third. Both are among the
 * best-documented clubs in the world, so this is not an edge case: it is the
 * normal condition of a community-edited source, and pages must render from
 * what exists rather than from what was expected.
 */

/**
 * Descriptive facts about a club.
 *
 * `GROUP_CONCAT` on the multi-valued properties rather than separate rows,
 * because joining several one-to-many properties in one query multiplies rows
 * combinatorially: a club with ten nicknames and two colours returns twenty
 * rows describing one club.
 */
export function clubProfileQuery(teamQid: string): string {
  return `
SELECT ?nicknames ?motto ?anthemLabel ?venueLabel ?venueCapacity ?colours
       ?websiteUrl ?members ?inception ?ownerLabel ?mascotLabel WHERE {
  {
    SELECT
      (GROUP_CONCAT(DISTINCT ?nickname; separator=" | ") AS ?nicknames)
      (GROUP_CONCAT(DISTINCT ?colourLabel; separator=", ") AS ?colours)
    WHERE {
      OPTIONAL { wd:${teamQid} wdt:P1449 ?nickname }
      OPTIONAL {
        wd:${teamQid} wdt:P6364 ?colour .
        ?colour rdfs:label ?colourLabel . FILTER(LANG(?colourLabel) = "en")
      }
    }
  }
  OPTIONAL { wd:${teamQid} wdt:P1451 ?motto }
  OPTIONAL { wd:${teamQid} wdt:P85 ?anthem . ?anthem rdfs:label ?anthemLabel . FILTER(LANG(?anthemLabel) = "en") }
  OPTIONAL {
    wd:${teamQid} wdt:P115 ?venue .
    ?venue rdfs:label ?venueLabel . FILTER(LANG(?venueLabel) = "en")
    OPTIONAL { ?venue wdt:P1083 ?venueCapacity }
  }
  OPTIONAL { wd:${teamQid} wdt:P856 ?websiteUrl }
  OPTIONAL { wd:${teamQid} wdt:P2124 ?members }
  OPTIONAL { wd:${teamQid} wdt:P571 ?inception }
  OPTIONAL { wd:${teamQid} wdt:P127 ?owner . ?owner rdfs:label ?ownerLabel . FILTER(LANG(?ownerLabel) = "en") }
  OPTIONAL { wd:${teamQid} wdt:P822 ?mascot . ?mascot rdfs:label ?mascotLabel . FILTER(LANG(?mascotLabel) = "en") }
}
ORDER BY ?nicknameRank
LIMIT 1`.trim();
}

/**
 * The current holder of one club role: head coach, chairman or captain.
 *
 * P286, P488 and P634 are historic lists rather than current values, and
 * Barcelona records 64 coaches and 49 chairmen. The incumbent is the statement
 * with no end date, which is what `FILTER NOT EXISTS` selects.
 *
 * **One property per call, deliberately.** The first version unioned all three
 * into a single query and returned HTTP 429 and then 504 for almost every club:
 * three `FILTER NOT EXISTS` subqueries over lists that long is more work than
 * the endpoint will do in one request. Three cheap queries succeed where one
 * expensive query does not, and the extra round trips cost nothing that
 * matters on a job measured in minutes.
 */
export function clubPeopleQuery(teamQid: string, property: 'P286' | 'P488' | 'P634'): string {
  return `
SELECT ?personLabel ?since WHERE {
  wd:${teamQid} p:${property} ?statement .
  ?statement ps:${property} ?person .
  FILTER NOT EXISTS { ?statement pq:P582 ?end }
  OPTIONAL { ?statement pq:P580 ?since }
  ?person rdfs:label ?personLabel . FILTER(LANG(?personLabel) = "en")
}
LIMIT 5`.trim();
}

/**
 * Players who scored or appeared for a club, aggregated across their spells.
 *
 * The qualifiers are P1351 (goals) and P1350 (appearances) on P54. A player with
 * two separate spells at a club has two statements, so the totals are summed.
 *
 * **This is not an authoritative all-time list, and must not be presented as
 * one.** Only about 38% of Barcelona's spells carry a goals figure, and the raw
 * aggregation surfaces at least one figure that is demonstrably wrong: a player
 * credited with 287 goals whose actual club record is a fraction of that, from
 * an erroneous statement on the club entity. Two well-known early figures also
 * disagree with the club's own records.
 *
 * So the results are shipped as "notable scorers" with a visible provenance
 * note. That is honest and still useful; a ranked table captioned "all-time top
 * scorers" would be neither.
 */
export function clubPlayerTotalsQuery(teamQid: string, limit = 25): string {
  return `
SELECT ?player ?playerLabel (SUM(?goals) AS ?totalGoals) (SUM(?apps) AS ?totalApps) WHERE {
  ?player p:P54 ?statement .
  ?statement ps:P54 wd:${teamQid} .
  OPTIONAL { ?statement pq:P1351 ?goals }
  OPTIONAL { ?statement pq:P1350 ?apps }
  ?player rdfs:label ?playerLabel . FILTER(LANG(?playerLabel) = "en")
  FILTER(BOUND(?goals) || BOUND(?apps))
}
GROUP BY ?player ?playerLabel
ORDER BY DESC(?totalGoals)
LIMIT ${limit}`.trim();
}

/**
 * A competition's editions, with winners and hosts.
 *
 * Editions hang off the competition by **P527 (has part)**, not by P31.
 * Verified: querying `?edition wdt:P31 wd:Q19317` for the FIFA World Cup
 * returns zero rows, so the instance-of approach fails silently, which is the
 * worst way for it to fail.
 *
 * Hosts are aggregated rather than joined. A tournament with eight host nations
 * would otherwise return eight rows for one edition, and the page would show the
 * 2007 Cricket World Cup eight times.
 *
 * Coverage differs sharply by competition. The FIFA World Cup returns 58
 * editions with 53 winners, essentially complete. The Cricket World Cup is
 * missing winners for 1975, 1979, 1987, 1992, 1996, 1999, 2003 and 2011 despite
 * those being uncontroversial results. The page renders what is there.
 */
export function competitionEditionsQuery(competitionQid: string): string {
  return `
SELECT ?edition ?editionLabel ?when ?start ?end ?winnerLabel
       (GROUP_CONCAT(DISTINCT ?hostLabel; separator=", ") AS ?hosts) WHERE {
  # Two linking patterns, because two kinds of competition model their
  # instances differently, and neither covers the other. Verified by counting:
  # the FIFA World Cup exposes 28 editions through P527 and one through P3450;
  # the Premier League exposes 36 seasons through P3450 and one through P527.
  # A query using only P527, as the first version did, silently returned nothing
  # for every league in the catalogue.
  { wd:${competitionQid} wdt:P527 ?edition } UNION { ?edition wdt:P3450 wd:${competitionQid} }
  ?edition rdfs:label ?editionLabel . FILTER(LANG(?editionLabel) = "en")
  OPTIONAL { ?edition wdt:P585 ?when }
  # League seasons carry a start time rather than a point in time.
  OPTIONAL { ?edition wdt:P580 ?start }
  # The end date decides whether an edition has actually finished, which the
  # year alone cannot: the 2026 World Cup ended on 19 July 2026 and is a
  # completed tournament, while a 2026 league season running now is not.
  OPTIONAL { ?edition wdt:P582 ?end }
  OPTIONAL {
    ?edition wdt:P1346 ?winner .
    ?winner rdfs:label ?winnerLabel . FILTER(LANG(?winnerLabel) = "en")
  }
  OPTIONAL {
    ?edition wdt:P17 ?host .
    ?host rdfs:label ?hostLabel . FILTER(LANG(?hostLabel) = "en")
  }
}
GROUP BY ?edition ?editionLabel ?when ?start ?end ?winnerLabel
ORDER BY DESC(COALESCE(?when, ?start))
LIMIT 100`.trim();
}

/**
 * Individual award winners per edition: top scorer, best player, best goalkeeper.
 *
 * P3279 (statistical leader) bundles these together and the `criterion used`
 * qualifier separates them. Verified against the 2022 World Cup, which returns
 * Messi as most valuable player, Mbappé as top scorer with eight goals,
 * Martínez as best goalkeeper and Fernández as best young player.
 *
 * This is the closest thing to a "top scorers" table that exists for a
 * tournament, and unlike the club aggregation it is a recorded fact rather than
 * a sum over partial data.
 */
export function competitionAwardsQuery(competitionQid: string): string {
  return `
SELECT DISTINCT ?editionLabel ?when ?personLabel ?criterionLabel ?value WHERE {
  # DISTINCT above is load-bearing. An edition linked by both P527 and P3450
  # matches each side of this UNION, and without it every award came back twice:
  # the World Cup listed "Emiliano Martínez 2022" at ranks 1 and 2, Mbappé at 1
  # and 2, and so on down every table.
  { wd:${competitionQid} wdt:P527 ?edition } UNION { ?edition wdt:P3450 wd:${competitionQid} }
  ?edition p:P3279 ?statement .
  ?statement ps:P3279 ?person .
  ?person rdfs:label ?personLabel . FILTER(LANG(?personLabel) = "en")
  ?edition rdfs:label ?editionLabel . FILTER(LANG(?editionLabel) = "en")
  OPTIONAL { ?edition wdt:P585 ?when }
  OPTIONAL {
    ?statement pq:P1013 ?criterion .
    ?criterion rdfs:label ?criterionLabel . FILTER(LANG(?criterionLabel) = "en")
  }
  OPTIONAL { ?statement pq:P1351 ?value }
}
ORDER BY DESC(?when)
LIMIT 200`.trim();
}

/**
 * Draft and biographical detail for a player.
 *
 * Works well for basketball, which is the sport where it matters most: Curry
 * returns Golden State, pick 7, 2009. Basketball career statistics are a
 * different matter and are simply absent. Only 252 basketball players in all of
 * Wikidata carry any scoring figure, against 141,414 footballers, so a
 * basketball page is biography, draft and awards, with no statistics section at
 * all rather than an empty one.
 */
export function playerProfileQuery(personQid: string): string {
  return `
SELECT ?draftTeamLabel ?draftPick ?draftYear ?height ?mass ?positionLabel ?countryLabel ?nickname WHERE {
  OPTIONAL {
    wd:${personQid} p:P647 ?draftStatement .
    ?draftStatement ps:P647 ?draftTeam .
    ?draftTeam rdfs:label ?draftTeamLabel . FILTER(LANG(?draftTeamLabel) = "en")
    OPTIONAL { ?draftStatement pq:P1836 ?draftPick }
    OPTIONAL { ?draftStatement pq:P585 ?draftYear }
  }
  OPTIONAL { wd:${personQid} wdt:P2048 ?height }
  OPTIONAL { wd:${personQid} wdt:P2067 ?mass }
  OPTIONAL { wd:${personQid} wdt:P413 ?position . ?position rdfs:label ?positionLabel . FILTER(LANG(?positionLabel) = "en") }
  OPTIONAL { wd:${personQid} wdt:P27 ?country . ?country rdfs:label ?countryLabel . FILTER(LANG(?countryLabel) = "en") }
  # P1449, the nickname property, in any language.
  #
  # English-only returned almost nothing, which is the point: a footballer's
  # nickname is rarely English. Filtering to it dropped Zizou, El Bicho, El Pibe
  # de Oro and il Capitano and left 0 of the top 150 with a nickname; any
  # language leaves 28, all of them the name the player is actually known by.
  #
  # Preferring English where one exists, since the reader is reading English.
  OPTIONAL {
    wd:${personQid} wdt:P1449 ?nickname .
    BIND(IF(LANG(?nickname) = "en", 0, 1) AS ?nicknameRank)
  }
}
ORDER BY ?nicknameRank
LIMIT 1`.trim();
}
