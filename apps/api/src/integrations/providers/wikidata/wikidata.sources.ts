/**
 * Which Wikidata items correspond to each sport in our catalogue.
 *
 * Every QID here was resolved against the live Wikidata API rather than recalled
 * or guessed, and the checking was worth it: two of the initial guesses were
 * wrong in ways that would have quietly ingested the wrong data.
 *
 *   - `Q13393265` is *basketball team*, not cricket team. Reusing it for both,
 *     as a first pass did, would have filled the cricket catalogue with
 *     basketball sides.
 *   - `Q15804` (Serie A) and `Q192327` returned no English label at all through
 *     the label service, which is exactly the failure mode the queries now guard
 *     against by requiring `rdfs:label`.
 *
 * The lesson generalises: a plausible-looking QID is not a verified one, and a
 * wrong identifier here produces a database full of confidently incorrect rows
 * rather than an error anyone would notice.
 *
 * ## Why competitions are listed explicitly
 *
 * Scoping team and player ingestion to named competitions is a deliberate
 * editorial choice, not a technical limit. Wikidata contains every amateur
 * village club anyone has bothered to record, and an unscoped query returns them
 * in QID order, which is effectively random. Listing the competitions we
 * actually cover keeps the corpus relevant, keeps the entity-resolution review
 * queue to a human size, and means the first thing a visitor searches for is
 * present.
 *
 * Widening coverage is a matter of adding QIDs here.
 */

export interface WikidataSportSource {
  /** The sport item itself, used to filter people and competitions. */
  readonly sportQid: string;

  /** Class of a club or franchise side in this sport. */
  readonly teamClassQid?: string;

  /** Class of a national side, which is not a league member and needs its own query. */
  readonly nationalTeamClassQid?: string;

  /**
   * Competitions whose members we ingest.
   *
   * Empty means "no competition scoping", which is only appropriate for sports
   * with few enough entities that the whole set is manageable.
   */
  readonly competitionQids: readonly string[];

  /** What `team.kind` to assign to rows from the club-scoped query. */
  readonly defaultTeamKind: 'club' | 'franchise' | 'international';

  /**
   * Require a founding date on class-scoped team queries.
   *
   * A quality filter for sports whose entity class is polluted with one-off
   * historical entrants. Formula 1 is the motivating case: without this, the
   * constructor class returns every private individual who ever entered a car,
   * and the famous teams are lost among them.
   */
  readonly requireTeamInception?: boolean;

  /**
   * Class of a competition in this sport.
   *
   * Deliberately specific. The generic "sports competition" class returns every
   * season ever played (180,801 rows for football), because a season is itself a
   * competition. The league class returns leagues.
   */
  readonly competitionClassQid?: string;

  /** Class of a venue in this sport: stadium, cricket ground, circuit. */
  readonly venueClassQid?: string;

  /**
   * Restrict people to those who have competed in something.
   *
   * For sports without teams there is no competition-membership property to
   * scope by, so an unscoped person query returns every recorded amateur.
   * Tennis is the case in point: 15,812 people have "tennis player" as an
   * occupation, but only 2,999 carry P1344 (participant in), and that subset is
   * a far better approximation of the players anyone will search for.
   */
  readonly requireParticipation?: boolean;

  /**
   * Competitions to scope *people* by, when that differs from teams.
   *
   * Exists because query cost is not symmetric. Basketball's team query happily
   * includes NCAA Division I (474 teams), but putting the same league list into
   * the person query, which carries nine OPTIONAL joins and a sitelinks sort,
   * reliably returns HTTP 504. Narrowing the person scope to the professional
   * leagues keeps it inside the Query Service's 60-second budget.
   *
   * Falls back to `competitionQids` when unset.
   */
  readonly personCompetitionQids?: readonly string[];

  /**
   * Occupation QID identifying a competitor, used where P641 (sport) is not
   * populated on the people who matter.
   *
   * Formula 1 is the case: P641 returns 46 people, while P106 "Formula One
   * driver" returns Schumacher, Alonso, Hamilton and Senna. The sport property
   * is simply not the one the community maintains for drivers.
   */
  readonly personOccupationQid?: string;

  /**
   * Class of club a person must have played for, in place of a league filter.
   *
   * The league filter (P118 on the person) turned out to be close to useless
   * for football: of the players who matter, only some carry it, and the
   * property is essentially never set on anyone retired. Pelé, Neymar, Modrić,
   * Benzema and Casillas all lack it, so the entire first rank of the sport was
   * excluded from ingestion while thousands of squad players were kept.
   *
   * Club membership (P54) is the property the community actually maintains, and
   * requiring it also does the job the league filter was meant to do. Both
   * Albert Camus and Sean Connery carry "association football player" as an
   * occupation, having played in their youth, and both drop out here because
   * neither has a club membership.
   */
  readonly personClubClassQid?: string;

  /**
   * Minimum sitelink count for a person to be worth ingesting.
   *
   * Sitelinks are the notability proxy used throughout: the number of language
   * Wikipedias carrying an article. A floor keeps the roster to people a reader
   * might plausibly search for rather than every recorded squad member.
   */
  readonly personMinSitelinks?: number;

  /**
   * Skip the sport filter on venues.
   *
   * Race circuits do not carry P641, so filtering by it returns nothing at all.
   * Without the filter the class alone gives Spa, Monza and the Nurburgring,
   * along with a few historical oddities such as the Circus Maximus, which is a
   * price worth paying.
   */
  readonly venueSkipSportFilter?: boolean;
}

export const SPORT_SOURCES: Record<string, WikidataSportSource> = {
  football: {
    // association football
    sportQid: 'Q2736',
    // association football player
    personOccupationQid: 'Q937857',
    // association football club, which the person must have played for
    personClubClassQid: 'Q476028',
    personMinSitelinks: 12,
    // association football club
    teamClassQid: 'Q476028',
    // national association football team
    nationalTeamClassQid: 'Q6979593',
    // Verified individually against the Wikidata search API. Two QIDs recalled
    // from memory during an earlier pass resolved to entirely unrelated
    // entities (a Maltese president, a crossword variant), which is the
    // failure mode that makes verification non-negotiable here: a wrong league
    // QID ingests the wrong clubs silently.
    //
    // Note Spain's second tier is labelled "LaLiga 2" (Q35615); the obvious
    // "Segunda Division" search resolves elsewhere.
    competitionQids: [
      // Top tiers, Europe
      'Q9448', // Premier League
      'Q324867', // La Liga
      'Q15804', // Serie A
      'Q82595', // Bundesliga
      'Q13394', // Ligue 1
      'Q182994', // Liga Portugal
      'Q167541', // Eredivisie
      'Q216022', // Belgian Pro League
      'Q14377162', // Scottish Premiership
      'Q485568', // Super Lig
      'Q182165', // Russian Premier League
      // Top tiers, rest of the world
      'Q206813', // Campeonato Brasileiro Serie A
      'Q223170', // Argentine Primera Division
      'Q18543', // Major League Soccer
      'Q764690', // Liga MX
      'Q255633', // Saudi Pro League
      'Q276445', // J1 League
      'Q2386334', // K League 1
      'Q209318', // Chinese Super League
      'Q16056350', // Indian Super League
      'Q219586', // A-League Men
      'Q680619', // Egyptian Premier League
      'Q16056559', // South African Premier Division
      // Second tiers, which carry many historically significant clubs
      'Q19510', // EFL Championship
      'Q35615', // LaLiga 2
      'Q194052', // Serie B
      'Q152665', // 2. Bundesliga
      'Q217374', // Ligue 2
    ],
    defaultTeamKind: 'club',
    // association football league, NOT the generic sports-competition class.
    competitionClassQid: 'Q15991303',
    // stadium
    venueClassQid: 'Q483110',
  },

  cricket: {
    // cricket
    sportQid: 'Q5375',
    // cricket team. NOT Q13393265, which is basketball.
    teamClassQid: 'Q17376093',
    // A distinct class from the generic cricket team, and using the generic one
    // for both returns the same franchises twice: cricket ended up with six
    // international sides where football had 288. Verified against India, which
    // is classed as a national cricket team rather than merely a cricket team.
    nationalTeamClassQid: 'Q86255944',
    // Deliberately empty despite P118 existing for cricket. Measured coverage
    // is too thin to scope by: the County Championship and T20 Blast return
    // *zero* teams through P118, and the Caribbean Premier League returns one.
    // Scoping by competition would therefore hide most of the sport. The class
    // itself holds 1,273 cricket teams, which is a manageable corpus to take
    // whole.
    competitionQids: [],
    // Was 'franchise', which was wrong for most of what this query returns and
    // labelled 814 cricket teams a franchise: Otago, Queensland and Bengal are
    // representative sides, Manchester Cricket Club is a club, and a franchise
    // is specifically a side created for and owned within a competition.
    //
    // `club` is the least wrong default. Wikidata's generic cricket team class
    // carries no statement distinguishing the three, so the honest options are a
    // default that is right for a plurality and corrected afterwards, or no
    // default at all. Migration 0018 reclassifies what can be identified with
    // confidence; the rest is a curation task rather than an inference.
    defaultTeamKind: 'club',
    competitionClassQid: 'Q623109',
    venueClassQid: 'Q483110',
  },

  basketball: {
    // basketball
    sportQid: 'Q5372',
    // basketball team
    teamClassQid: 'Q13393265',
    // men's national basketball team, NOT Q46351685 ("national basketball
    // team"). The broader class was tried first and is unusable: its 1,480
    // members are dominated by 3x3, wheelchair, under-16 and one-off Olympic
    // squads, and neither the USA nor Spain senior side is classed under it
    // directly, so the famous nations would have been missing while
    // "Kiribati men's national basketball team" ranked eighth. This class holds
    // 221 senior sides ordered sensibly: Spain, USA, France, Lithuania, Russia,
    // Greece, Serbia and Argentina are the top eight.
    nationalTeamClassQid: 'Q135728463',
    competitionQids: [
      'Q155223', // National Basketball Association
      'Q2593221', // WNBA
      'Q185982', // EuroLeague
      'Q1126104', // Liga ACB
      'Q540636', // Basketball Bundesliga
    ],
    // NCAA Division I (Q94861615) was here and is deliberately gone.
    //
    // It contributed 408 college programmes to a 561-team catalogue, so three
    // quarters of the Teams tab was "Dickinson Red Devils men's basketball" and
    // similar: rows with no sitelinks, no honours and no players, which sorted
    // to the bottom and padded the list to 24 pages. College basketball is a
    // real subject, but a college programme is not comparable to an NBA
    // franchise and mixing them serves neither. Removing it leaves the
    // professional leagues plus the national sides.
    //
    // It was already excluded from `personCompetitionQids` below for a separate
    // reason (its team count timed out the person query), so no player coverage
    // is lost by dropping it here.
    personCompetitionQids: ['Q155223', 'Q2593221', 'Q185982'],
    defaultTeamKind: 'club',
    competitionClassQid: 'Q623109',
    venueClassQid: 'Q483110',

    /**
     * Notability floor for basketball people.
     *
     * Kept at five language editions, matching cricket rather than football's
     * twelve. Basketball is documented in fewer languages than football, so the
     * higher floor would cut into players a reader would search for.
     *
     * The prose here previously described cricket's 41,160 `P641` people and
     * named Allan Border and Javed Miandad, having been copied from the cricket
     * block. The number was never re-measured for basketball; the value is
     * retained as a considered default rather than a verified one.
     */
    personMinSitelinks: 5,
  },

  tennis: {
    // tennis
    sportQid: 'Q847',
    // No team classes: tennis has individual competitors, so the Teams tab does
    // not render for it at all. This is the case that proves the model is not
    // football-shaped.
    competitionQids: [],
    defaultTeamKind: 'international',
    requireParticipation: true,
    competitionClassQid: 'Q623109',
    venueClassQid: 'Q483110',
  },

  'formula-1': {
    // Formula One
    sportQid: 'Q1968',
    // Formula One team, i.e. a constructor. A constructor is a competing
    // organisation, which is what `team` means in this schema.
    teamClassQid: 'Q10497835',
    // No league-membership equivalent exists for constructors, so this is
    // class-scoped and relies on the inception filter for quality.
    competitionQids: [],
    defaultTeamKind: 'club',
    requireTeamInception: true,
    competitionClassQid: 'Q623109',
    // race track
    venueClassQid: 'Q1777138',
    // Formula One driver. P641 is not maintained on drivers; occupation is.
    personOccupationQid: 'Q10841764',
    venueSkipSportFilter: true,
  },
};

/** Sports this adapter can serve, for the scheduler to iterate. */
export const SUPPORTED_SPORT_SLUGS = Object.keys(SPORT_SOURCES);
