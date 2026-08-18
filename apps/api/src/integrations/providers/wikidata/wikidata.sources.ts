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
}

export const SPORT_SOURCES: Record<string, WikidataSportSource> = {
  football: {
    // association football
    sportQid: 'Q2736',
    // association football club
    teamClassQid: 'Q476028',
    // national association football team
    nationalTeamClassQid: 'Q6979593',
    competitionQids: [
      'Q9448', // Premier League
      'Q324867', // La Liga
      'Q15804', // Serie A
      'Q82595', // Bundesliga
      'Q13394', // Ligue 1
    ],
    defaultTeamKind: 'club',
  },

  cricket: {
    // cricket
    sportQid: 'Q5375',
    // cricket team. NOT Q13393265, which is basketball.
    teamClassQid: 'Q17376093',
    nationalTeamClassQid: 'Q17376093',
    competitionQids: [
      'Q396412', // Indian Premier League
    ],
    defaultTeamKind: 'franchise',
  },

  basketball: {
    // basketball
    sportQid: 'Q5372',
    // basketball team
    teamClassQid: 'Q13393265',
    competitionQids: [
      'Q155223', // National Basketball Association
    ],
    defaultTeamKind: 'club',
  },

  tennis: {
    // tennis
    sportQid: 'Q847',
    // No team classes: tennis has individual competitors, so the Teams tab does
    // not render for it at all. This is the case that proves the model is not
    // football-shaped.
    competitionQids: [],
    defaultTeamKind: 'international',
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
  },
};

/** Sports this adapter can serve, for the scheduler to iterate. */
export const SUPPORTED_SPORT_SLUGS = Object.keys(SPORT_SOURCES);
