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
  readonly personOccupationQid?: string | readonly string[];

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

  /**
   * Occupations that disqualify a person, whatever else they carry.
   *
   * The counterpart to `personClubClassQid` for sports that have no club to
   * belong to. Occupation scoping reaches players a league filter misses, and
   * on its own it lets in anyone who ever held the occupation: `P106` records
   * what somebody has been, and the sitelink ordering then promotes whoever is
   * most famous rather than whoever is the better player. Golf opened with Ivan
   * Lendl and an actor; American football opened with Gerald Ford and John
   * Wayne, with Tom Brady ninth.
   *
   * See the long note in `peopleQuery` for why this excludes rather than
   * requires, and `OTHER_SPORT_OCCUPATIONS` for the shared list.
   */
  readonly excludeOccupationQids?: readonly string[];
}

/**
 * Occupations that mean "known for something other than this sport".
 *
 * Shared by the sports that scope people by occupation alone, because the list
 * is the same one every time: the other sports in the catalogue, plus the
 * performing careers that a college athlete most often goes on to. Each sport
 * filters out its own entry when it uses the list, since excluding golfers from
 * golf would empty it.
 *
 * Every QID verified against the live API rather than recalled, on the same
 * reasoning as the rest of this file: a wrong QID here silently excludes people
 * who belong, which is harder to notice than a wrong one that includes people
 * who do not.
 */
export const OTHER_SPORT_OCCUPATIONS = {
  // ── The other sports in the catalogue ──────────────────────────────────────
  footballer: 'Q937857',
  basketballPlayer: 'Q3665646',
  cricketer: 'Q12299841',
  tennisPlayer: 'Q10833314',
  americanFootballPlayer: 'Q19204627',
  golfer: 'Q11303721',
  mmaFighter: 'Q11607585',
  boxer: 'Q11338576',
  formulaOneDriver: 'Q10841764',

  // ── The careers a famous ex-athlete most often has instead ─────────────────
  //
  // These are what put John Wayne, Dwayne Johnson and Kathryn Newton at the top
  // of a sporting roster. Each of them really did play, and none is why anyone
  // knows the name.
  actor: 'Q33999',
  professionalWrestler: 'Q13474373',
  politician: 'Q82955',
} as const;

/** The list above, for a sport to filter its own occupation out of. */
function otherOccupationsThan(...keep: readonly string[]): readonly string[] {
  return Object.values(OTHER_SPORT_OCCUPATIONS).filter((qid) => !keep.includes(qid));
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
    // It was already excluded from the person scoping below for a separate
    // reason (its team count timed out the person query), so no player coverage
    // is lost by dropping it here.
    //
    // `personCompetitionQids` is deliberately gone, replaced by the occupation
    // and club scoping below. Scoping people by league membership missed
    // players outright rather than merely ordering them late: it requires
    // `P118` on the club, and three of the last five Rookies of the Year carry
    // no such statement, so Stephon Castle, Scottie Barnes and Evan Mobley were
    // unreachable at any page limit. Football hit the same wall and solved it
    // the same way; the note on `personClubClassQid` records that the league
    // property is "close to useless" there too.
    // basketball player
    personOccupationQid: 'Q3665646',
    // Any club at all, which is what turns the league filter off. The class
    // itself is not checked: a basketball club carries several and requiring
    // one would reintroduce the gap this removes.
    personClubClassQid: 'Q13393265',
    defaultTeamKind: 'club',
    competitionClassQid: 'Q623109',
    venueClassQid: 'Q483110',

    /**
     * Notability floor for basketball people.
     *
     * Raised from five with the move to occupation scoping, which widens the
     * candidate set considerably: 13,813 people clear five links, against the
     * 4,351 the league-scoped query produced. Eight is measured rather than
     * guessed, admitting 7,280, which keeps the catalogue about the size it was
     * while covering the players the old scoping missed. Stephon Castle is the
     * least documented of those at 19 links, so the floor costs nothing there.
     *
     * The prose here previously described cricket's 41,160 `P641` people and
     * named Allan Border and Javed Miandad, having been copied from the cricket
     * block.
     */
    personMinSitelinks: 8,
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

  golf: {
    // golf
    sportQid: 'Q5377',
    // No team classes. Golf is played by individuals, so the Teams tab does not
    // render, exactly as for tennis.
    competitionQids: [],
    defaultTeamKind: 'international',
    /**
     * Both golfer items, because the community uses both.
     *
     * This was `Q11303721` ("golfer") alone, on the reasoning that Q490253
     * ("professional golfer") is barely used: 320 people carry it against
     * 5,996 for the general item. That measurement was right and the
     * conclusion from it was wrong, because it counted the population without
     * looking at who was in it.
     *
     * 248 people carry only the professional item, and **Tiger Woods is one of
     * them**. So the sport's most famous player was absent from the catalogue
     * while 748 lesser golfers were in it, and no sitelink floor or ranking fix
     * could have surfaced him: he was never a candidate. Viktor Hovland,
     * Suzann Pettersen, Joaquín Niemann, Emiliano Grillo and Aaron Rai were
     * missing for the same reason.
     *
     * Twenty-one of those 248 clear the five-sitelink floor, and the two of
     * them who are not golfers (the singer Dinah Shore and the actor Akira
     * Kobayashi) are already removed by `excludeOccupationQids`.
     */
    personOccupationQid: ['Q11303721', 'Q490253'],
    /**
     * Notability floor for golfers.
     *
     * Five rather than the eight basketball uses, because golf's corpus is an
     * order of magnitude smaller: eight admits 401 people, which is a thinner
     * roster than any launched sport has. Five admits 852 and keeps the tour
     * winners a reader would search for.
     */
    personMinSitelinks: 5,
    // Without this the roster opened with Ivan Lendl, a Serbian goalkeeper and
    // the actor Kathryn Newton, all of whom carry `golfer` as a second
    // occupation and all of whom outrank Rory McIlroy on sitelinks.
    excludeOccupationQids: otherOccupationsThan(OTHER_SPORT_OCCUPATIONS.golfer),
    // `requireParticipation` is deliberately absent despite golf having no team
    // scoping, which is the situation it exists for. Measured P1344 coverage is
    // 444 of 5,995 golfers, so requiring it would discard seven eighths of the
    // sport. The sitelink floor does the same job here without the false
    // negatives. Tennis is the opposite case: 2,999 of its people carry P1344.
    competitionClassQid: 'Q623109',
    // golf course
    venueClassQid: 'Q1048525',
  },

  'american-football': {
    // American football
    sportQid: 'Q41323',
    // American football team.
    teamClassQid: 'Q17156793',
    /**
     * Scoped to the NFL, because the class alone is unusable.
     *
     * Class scoping was tried first and produced exactly the defect the
     * basketball block above records: 1,748 teams, of which 46 had ten or more
     * sitelinks and 80 had none at all. The rest is college football and the
     * semi-professional game, so the Teams tab filled up with the Arlington
     * Impact, the Capital City Savages and several hundred university
     * programmes, none of which is comparable to an NFL franchise.
     *
     * The NFL's `P118` coverage is good, which is not true of every sport: it
     * returns 53 sides, the 32 current franchises plus the historical ones,
     * ordered Patriots, Chiefs, Giants, Packers, Bears. The Super Bowl carries
     * `P118` too and is excluded by the season and event filters already in
     * `teamsByCompetitionQuery`, not by `teamClassQid`: that query takes the
     * class as `_classQid` and deliberately ignores it.
     *
     * College football is a real subject and is deliberately not here, on the
     * same reasoning that removed NCAA Division I from basketball: a college
     * programme and a professional franchise are not comparable, and mixing
     * them serves neither.
     */
    competitionQids: ['Q1215884'],
    /**
     * Empty, so the NFL scoping above applies to teams only.
     *
     * `competitionQids` is shared by both queries unless this overrides it, and
     * scoping people by it cut the roster to 14: the person query reads league
     * membership as `P118` on the player, which is the property the basketball
     * block above calls close to useless for people and which football
     * abandoned for the same reason. Occupation plus the exclusion list below
     * reaches 1,172 candidates against the same notability floor.
     */
    personCompetitionQids: [],
    defaultTeamKind: 'franchise',
    // American football player, NOT Q14128148 ("gridiron football player"),
    // which spans Canadian football and the other variants.
    personOccupationQid: 'Q19204627',
    /**
     * Notability floor for American football players.
     *
     * The largest corpus of the four sports added here: 48,848 people carry the
     * occupation, and taking them whole would repeat the mistake NCAA Division I
     * made in basketball, where 408 college programmes buried the franchises.
     * Eight admits 1,465, comparable to what the other launched sports carry.
     */
    personMinSitelinks: 8,
    // The worst case measured of the four sports added here. College football
    // is played by a very large number of people who become famous for
    // something else, so the unfiltered roster ran Gerald Ford, John Wayne,
    // Dwayne Johnson, George Marshall, Burt Reynolds, Terry Crews, Ed O'Neill
    // and Roman Reigns before it reached Tom Brady in ninth.
    excludeOccupationQids: otherOccupationsThan(OTHER_SPORT_OCCUPATIONS.americanFootballPlayer),
    competitionClassQid: 'Q623109',
    // stadium
    venueClassQid: 'Q483110',
  },

  mma: {
    // mixed martial arts
    sportQid: 'Q114466',
    // No team classes, deliberately.
    //
    // UFC, Bellator, ONE and the PFL are promotions: organisations that stage
    // bouts and sanction them, not sides that compete. `team` in this schema
    // means an organisation that competes, which is why an F1 constructor
    // qualifies and a promotion does not. They are ingested as competitions
    // below, where they belong.
    competitionQids: [],
    defaultTeamKind: 'international',
    // mixed martial arts fighter
    personOccupationQid: 'Q11607585',
    // Five, matching golf and for the same reason: the corpus is 4,602 people,
    // and eight would cut it to 793.
    personMinSitelinks: 5,
    // Boxing and acting are paired with MMA rather than excluded, both for
    // Conor McGregor's sake specifically: his Wikidata occupation list carries
    // mixed martial artist, boxer AND actor (a minor film credit), and the
    // general exclusion list dropped him for either one on its own before
    // both were added here. `actor` stays excluded for every other sport,
    // where it is doing real work (it is what keeps Dwayne Johnson and John
    // Wayne out of the football and American-football rosters), but an
    // incidental acting credit is common among MMA's biggest names without
    // being their known career, unlike those two.
    //
    // `personOccupationQid` above already requires the MMA occupation to enter
    // this roster at all, so a pure boxer or actor cannot get in through this
    // door; pairing them here only stops re-excluding a fighter for also
    // having done either.
    excludeOccupationQids: otherOccupationsThan(
      OTHER_SPORT_OCCUPATIONS.mmaFighter,
      OTHER_SPORT_OCCUPATIONS.boxer,
      OTHER_SPORT_OCCUPATIONS.actor,
    ),
    // See the golf note. MMA's P1344 coverage is worse still, 218 of 4,602.
    competitionClassQid: 'Q623109',
    venueClassQid: 'Q483110',
  },

  boxing: {
    // boxing
    sportQid: 'Q32112',
    // No team classes. Boxers compete as individuals.
    competitionQids: [],
    defaultTeamKind: 'international',
    // boxer
    personOccupationQid: 'Q11338576',
    // Eight, not five. Boxing's 19,591 people are the second-largest corpus
    // here and the tail is deep in amateur records; eight admits 2,700.
    personMinSitelinks: 8,
    // The professional-wrestling entry earns its place here more than anywhere
    // else: the two draw on each other constantly, and a wrestler with one
    // recorded exhibition bout should not outrank a world champion.
    excludeOccupationQids: otherOccupationsThan(OTHER_SPORT_OCCUPATIONS.boxer),
    /**
     * Competitions are seeded rather than ingested.
     *
     * Boxing is the one sport of the four with no usable competition class on
     * Wikidata: the generic sports-competition class filtered to boxing returns
     * a single obscure row. The sport's real structure is four sanctioning
     * bodies (WBC, WBA, IBF, WBO) awarding titles per weight class, and those
     * are classed as sports organisations, not competitions. Seeding them is
     * honest; pointing this at a class that does not describe the sport would
     * produce a Competitions tab that is wrong rather than empty.
     */
    competitionClassQid: undefined,
    venueClassQid: 'Q483110',
  },
};

/** Sports this adapter can serve, for the scheduler to iterate. */
export const SUPPORTED_SPORT_SLUGS = Object.keys(SPORT_SOURCES);
