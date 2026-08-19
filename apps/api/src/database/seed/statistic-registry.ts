/**
 * The statistic registry: every sport's statistical vocabulary.
 *
 * This is the data that makes adding a sport a data change rather than a code
 * change. Nothing renders on an entity page unless it is declared here, which
 * is deliberate: ingestion writes whatever a provider supplies, and this file
 * decides what that means, what it is called, how it is formatted, and how it
 * rolls up into a career total.
 *
 * ## Why the definitions exist before the values do
 *
 * Wikidata, the only source funded so far, holds entities and honours but no
 * match statistics. So most of these keys have no values yet. Seeding them
 * anyway is the right order of work for two reasons:
 *
 *   1. The registry is what a paid feed is normalised *into*. Defining it first
 *      means adding that feed is a mapping exercise rather than a design one.
 *   2. Every definition carries a `description`, which is the explainer that
 *      makes a number meaningful. That is editorial work, independent of
 *      whether the number has arrived, and it is the part of the product that
 *      is genuinely ours.
 *
 * ## Aggregation is declared, not inferred
 *
 * The single most common way a sports database goes quietly wrong is averaging
 * an average. A batting average is runs divided by dismissals; the mean of five
 * seasonal averages is a different and incorrect number. Declaring `derived`
 * with a formula keeps that decision here rather than in whichever query
 * happens to need a career total.
 */

export interface StatisticDefinitionSeed {
  key: string;
  label: string;
  shortLabel?: string;
  appliesTo: 'player' | 'team' | 'both';
  category: string;
  aggregation: 'sum' | 'average' | 'max' | 'min' | 'last' | 'none' | 'derived';
  format: 'integer' | 'decimal' | 'percentage' | 'duration' | 'ratio' | 'text';
  precision?: number;
  higherIsBetter?: boolean;
  isHeadline?: boolean;
  displayOrder: number;
  description: string;
  /** Discipline key this belongs to. Omit for a sport-wide definition. */
  discipline?: string;
  /** For `derived`: how to compute it. Interpreted by the aggregation job. */
  formula?: Record<string, unknown>;
}

/**
 * Definitions that apply to every sport.
 *
 * `honours_won` and `titles_won` are the only statistics the current data can
 * actually produce, being counted from the honour table rather than from a
 * match feed. They are declared once here and merged into each sport, because
 * repeating them five times invites them to drift apart.
 */
const UNIVERSAL: StatisticDefinitionSeed[] = [
  {
    key: 'honours_won',
    label: 'Honours',
    shortLabel: 'Hon',
    appliesTo: 'player',
    category: 'Honours',
    aggregation: 'sum',
    format: 'integer',
    isHeadline: true,
    displayOrder: 1,
    description:
      'Awards and titles recorded against this person. Counted from the honours list rather than from match data.',
  },
  {
    key: 'titles_won',
    label: 'Titles',
    shortLabel: 'Titles',
    appliesTo: 'team',
    category: 'Honours',
    aggregation: 'sum',
    format: 'integer',
    isHeadline: true,
    displayOrder: 1,
    description: 'Competitions this team has won, counted from its trophy list.',
  },
];

const SPORT_DEFINITIONS: Record<string, StatisticDefinitionSeed[]> = {
  // ---------------------------------------------------------------------------
  // FOOTBALL
  // ---------------------------------------------------------------------------
  football: [
    // Sport-wide: true of every player regardless of position.
    {
      key: 'appearances',
      label: 'Appearances',
      shortLabel: 'Apps',
      appliesTo: 'both',
      category: 'General',
      aggregation: 'sum',
      format: 'integer',
      isHeadline: true,
      displayOrder: 10,
      description: 'Matches in which the player took the field, as a starter or a substitute.',
    },
    {
      key: 'minutes_played',
      label: 'Minutes Played',
      shortLabel: 'Mins',
      appliesTo: 'player',
      category: 'General',
      aggregation: 'sum',
      format: 'integer',
      displayOrder: 20,
      description: 'Total minutes on the pitch. A truer measure of involvement than appearances.',
    },
    {
      key: 'yellow_cards',
      label: 'Yellow Cards',
      shortLabel: 'YC',
      appliesTo: 'both',
      category: 'Discipline',
      aggregation: 'sum',
      format: 'integer',
      higherIsBetter: false,
      displayOrder: 10,
      description: 'Cautions received.',
    },
    {
      key: 'red_cards',
      label: 'Red Cards',
      shortLabel: 'RC',
      appliesTo: 'both',
      category: 'Discipline',
      aggregation: 'sum',
      format: 'integer',
      higherIsBetter: false,
      displayOrder: 20,
      description: 'Dismissals, whether straight or by a second caution.',
    },

    // Outfield. A goalkeeper is not judged on these, which is why they carry a
    // discipline rather than being sport-wide.
    {
      key: 'goals',
      label: 'Goals',
      shortLabel: 'G',
      appliesTo: 'both',
      category: 'Attacking',
      aggregation: 'sum',
      format: 'integer',
      isHeadline: true,
      displayOrder: 10,
      discipline: 'outfield',
      description: 'Times the player has scored, excluding own goals.',
    },
    {
      key: 'assists',
      label: 'Assists',
      shortLabel: 'A',
      appliesTo: 'player',
      category: 'Attacking',
      aggregation: 'sum',
      format: 'integer',
      isHeadline: true,
      displayOrder: 20,
      discipline: 'outfield',
      description: 'The final pass or touch before a team-mate scores.',
    },
    {
      key: 'goals_per_90',
      label: 'Goals per 90',
      shortLabel: 'G/90',
      appliesTo: 'player',
      category: 'Attacking',
      aggregation: 'derived',
      format: 'decimal',
      precision: 2,
      displayOrder: 30,
      discipline: 'outfield',
      description:
        'Goals scored per ninety minutes played. Comparable between a regular starter and a substitute in a way that a raw total is not.',
      formula: { numerator: 'goals', denominator: 'minutes_played', multiplier: 90 },
    },

    // Goalkeeping: a disjoint set on the same sport.
    {
      key: 'clean_sheets',
      label: 'Clean Sheets',
      shortLabel: 'CS',
      appliesTo: 'both',
      category: 'Goalkeeping',
      aggregation: 'sum',
      format: 'integer',
      isHeadline: true,
      displayOrder: 10,
      discipline: 'goalkeeper',
      description: 'Matches completed without conceding a goal.',
    },
    {
      key: 'saves',
      label: 'Saves',
      shortLabel: 'Sv',
      appliesTo: 'player',
      category: 'Goalkeeping',
      aggregation: 'sum',
      format: 'integer',
      displayOrder: 20,
      discipline: 'goalkeeper',
      description: 'Shots on target prevented from becoming goals.',
    },
    {
      key: 'save_percentage',
      label: 'Save Percentage',
      shortLabel: 'Sv%',
      appliesTo: 'player',
      category: 'Goalkeeping',
      aggregation: 'derived',
      format: 'percentage',
      precision: 1,
      isHeadline: true,
      displayOrder: 30,
      discipline: 'goalkeeper',
      description: 'Proportion of shots on target that were saved.',
      formula: { numerator: 'saves', denominator: 'shots_faced', multiplier: 100 },
    },

    // Team-level.
    {
      key: 'goals_for',
      label: 'Goals For',
      shortLabel: 'GF',
      appliesTo: 'team',
      category: 'Record',
      aggregation: 'sum',
      format: 'integer',
      isHeadline: true,
      displayOrder: 10,
      description: 'Goals scored by the team.',
    },
    {
      key: 'goals_against',
      label: 'Goals Against',
      shortLabel: 'GA',
      appliesTo: 'team',
      category: 'Record',
      aggregation: 'sum',
      format: 'integer',
      higherIsBetter: false,
      isHeadline: true,
      displayOrder: 20,
      description: 'Goals conceded. Lower is better.',
    },
  ],

  // ---------------------------------------------------------------------------
  // CRICKET
  //
  // The sport that most justifies the discipline mechanism. A batting average of
  // 50 in Tests and 30 in T20 are different achievements, and summing a player's
  // formats produces a number that describes nobody.
  // ---------------------------------------------------------------------------
  cricket: [
    ...(['test', 'odi', 't20i'] as const).flatMap((format, index): StatisticDefinitionSeed[] => [
      {
        key: 'matches',
        label: 'Matches',
        shortLabel: 'M',
        appliesTo: 'both',
        category: 'General',
        aggregation: 'sum',
        format: 'integer',
        isHeadline: true,
        displayOrder: 10 + index,
        discipline: format,
        description: 'Matches played in this format.',
      },
      {
        key: 'runs',
        label: 'Runs',
        shortLabel: 'R',
        appliesTo: 'player',
        category: 'Batting',
        aggregation: 'sum',
        format: 'integer',
        isHeadline: true,
        displayOrder: 20,
        discipline: format,
        description: 'Total runs scored with the bat.',
      },
      {
        key: 'batting_average',
        label: 'Batting Average',
        shortLabel: 'Avg',
        appliesTo: 'player',
        category: 'Batting',
        aggregation: 'derived',
        format: 'decimal',
        precision: 2,
        isHeadline: true,
        displayOrder: 30,
        discipline: format,
        description:
          'Runs divided by the number of times dismissed. Computed from career totals, never as the mean of seasonal averages, which would be a different and wrong number.',
        formula: { numerator: 'runs', denominator: 'dismissals' },
      },
      {
        key: 'strike_rate',
        label: 'Strike Rate',
        shortLabel: 'SR',
        appliesTo: 'player',
        category: 'Batting',
        aggregation: 'derived',
        format: 'decimal',
        precision: 2,
        isHeadline: format === 't20i',
        displayOrder: 40,
        discipline: format,
        description:
          'Runs scored per hundred balls faced. The measure that matters most in the shortest format and least in the longest.',
        formula: { numerator: 'runs', denominator: 'balls_faced', multiplier: 100 },
      },
      {
        key: 'hundreds',
        label: 'Hundreds',
        shortLabel: '100s',
        appliesTo: 'player',
        category: 'Batting',
        aggregation: 'sum',
        format: 'integer',
        displayOrder: 50,
        discipline: format,
        description: 'Individual innings of one hundred runs or more.',
      },
      {
        key: 'highest_score',
        label: 'Highest Score',
        shortLabel: 'HS',
        appliesTo: 'player',
        category: 'Batting',
        aggregation: 'max',
        format: 'integer',
        displayOrder: 60,
        discipline: format,
        description: 'Best individual innings. A maximum, so it never sums.',
      },
      {
        key: 'wickets',
        label: 'Wickets',
        shortLabel: 'W',
        appliesTo: 'player',
        category: 'Bowling',
        aggregation: 'sum',
        format: 'integer',
        isHeadline: true,
        displayOrder: 10,
        discipline: format,
        description: 'Batters dismissed by this bowler.',
      },
      {
        key: 'bowling_average',
        label: 'Bowling Average',
        shortLabel: 'Bowl Avg',
        appliesTo: 'player',
        category: 'Bowling',
        aggregation: 'derived',
        format: 'decimal',
        precision: 2,
        higherIsBetter: false,
        displayOrder: 20,
        discipline: format,
        description: 'Runs conceded per wicket taken. Lower is better, unlike the batting average.',
        formula: { numerator: 'runs_conceded', denominator: 'wickets' },
      },
      {
        key: 'economy',
        label: 'Economy',
        shortLabel: 'Econ',
        appliesTo: 'player',
        category: 'Bowling',
        aggregation: 'derived',
        format: 'decimal',
        precision: 2,
        higherIsBetter: false,
        displayOrder: 30,
        discipline: format,
        description: 'Runs conceded per over bowled. Lower is better.',
        formula: { numerator: 'runs_conceded', denominator: 'overs' },
      },
      {
        key: 'catches',
        label: 'Catches',
        shortLabel: 'Ct',
        appliesTo: 'player',
        category: 'Fielding',
        aggregation: 'sum',
        format: 'integer',
        displayOrder: 10,
        discipline: format,
        description: 'Catches taken in the field or behind the stumps.',
      },
      {
        key: 'stumpings',
        label: 'Stumpings',
        shortLabel: 'St',
        appliesTo: 'player',
        category: 'Fielding',
        aggregation: 'sum',
        format: 'integer',
        displayOrder: 20,
        discipline: format,
        description: 'Dismissals made by a wicketkeeper with the batter out of their ground.',
      },
    ]),
  ],

  // ---------------------------------------------------------------------------
  // BASKETBALL
  //
  // No disciplines: one undivided statistical world, which is why every entry
  // here is sport-wide. Per-game averages are first-class, because basketball
  // is conventionally read that way rather than by career totals.
  // ---------------------------------------------------------------------------
  basketball: [
    {
      key: 'games_played',
      label: 'Games Played',
      shortLabel: 'GP',
      appliesTo: 'both',
      category: 'General',
      aggregation: 'sum',
      format: 'integer',
      isHeadline: true,
      displayOrder: 10,
      description: 'Games in which the player appeared.',
    },
    {
      key: 'points',
      label: 'Points',
      shortLabel: 'PTS',
      appliesTo: 'both',
      category: 'Scoring',
      aggregation: 'sum',
      format: 'integer',
      isHeadline: true,
      displayOrder: 10,
      description: 'Total points scored.',
    },
    {
      key: 'points_per_game',
      label: 'Points Per Game',
      shortLabel: 'PPG',
      appliesTo: 'both',
      category: 'Scoring',
      aggregation: 'derived',
      format: 'decimal',
      precision: 1,
      isHeadline: true,
      displayOrder: 20,
      description: 'Mean points per appearance, the figure basketball is usually judged on.',
      formula: { numerator: 'points', denominator: 'games_played' },
    },
    {
      key: 'field_goal_percentage',
      label: 'Field Goal %',
      shortLabel: 'FG%',
      appliesTo: 'player',
      category: 'Scoring',
      aggregation: 'derived',
      format: 'percentage',
      precision: 1,
      displayOrder: 30,
      description: 'Proportion of shots from the field that were made.',
      formula: {
        numerator: 'field_goals_made',
        denominator: 'field_goals_attempted',
        multiplier: 100,
      },
    },
    {
      key: 'three_point_percentage',
      label: 'Three Point %',
      shortLabel: '3P%',
      appliesTo: 'player',
      category: 'Scoring',
      aggregation: 'derived',
      format: 'percentage',
      precision: 1,
      displayOrder: 40,
      description: 'Proportion of attempts from beyond the arc that were made.',
      formula: {
        numerator: 'three_pointers_made',
        denominator: 'three_pointers_attempted',
        multiplier: 100,
      },
    },
    {
      key: 'rebounds',
      label: 'Rebounds',
      shortLabel: 'REB',
      appliesTo: 'both',
      category: 'Rebounding',
      aggregation: 'sum',
      format: 'integer',
      isHeadline: true,
      displayOrder: 10,
      description: 'Possessions recovered after a missed shot, at either end.',
    },
    {
      key: 'assists',
      label: 'Assists',
      shortLabel: 'AST',
      appliesTo: 'both',
      category: 'Playmaking',
      aggregation: 'sum',
      format: 'integer',
      isHeadline: true,
      displayOrder: 10,
      description: 'Passes leading directly to a score.',
    },
    // Per-game averages, which is how basketball is read. Sourced from the
    // career row of a player's season tables rather than from a live feed: the
    // NBA's own statistics service prohibits use in a commercial database.
    {
      key: 'points_per_game',
      label: 'Points Per Game',
      shortLabel: 'PPG',
      appliesTo: 'player',
      category: 'Scoring',
      aggregation: 'average',
      format: 'decimal',
      precision: 1,
      isHeadline: true,
      displayOrder: 21,
      description: 'Mean points per appearance, the figure basketball is usually judged on.',
    },
    {
      key: 'rebounds_per_game',
      label: 'Rebounds Per Game',
      shortLabel: 'RPG',
      appliesTo: 'player',
      category: 'Rebounding',
      aggregation: 'average',
      format: 'decimal',
      precision: 1,
      isHeadline: true,
      displayOrder: 11,
      description: 'Mean rebounds per appearance.',
    },
    {
      key: 'assists_per_game',
      label: 'Assists Per Game',
      shortLabel: 'APG',
      appliesTo: 'player',
      category: 'Playmaking',
      aggregation: 'average',
      format: 'decimal',
      precision: 1,
      isHeadline: true,
      displayOrder: 11,
      description: 'Mean assists per appearance.',
    },
    {
      key: 'steals_per_game',
      label: 'Steals Per Game',
      shortLabel: 'SPG',
      appliesTo: 'player',
      category: 'Defence',
      aggregation: 'average',
      format: 'decimal',
      precision: 1,
      displayOrder: 11,
      description: 'Mean steals per appearance.',
    },
    {
      key: 'blocks_per_game',
      label: 'Blocks Per Game',
      shortLabel: 'BPG',
      appliesTo: 'player',
      category: 'Defence',
      aggregation: 'average',
      format: 'decimal',
      precision: 1,
      displayOrder: 21,
      description: 'Mean blocks per appearance.',
    },
    {
      key: 'minutes_per_game',
      label: 'Minutes Per Game',
      shortLabel: 'MPG',
      appliesTo: 'player',
      category: 'General',
      aggregation: 'average',
      format: 'decimal',
      precision: 1,
      displayOrder: 20,
      description: 'Mean minutes on court per appearance.',
    },
    {
      key: 'free_throw_percentage',
      label: 'Free Throw %',
      shortLabel: 'FT%',
      appliesTo: 'player',
      category: 'Scoring',
      aggregation: 'derived',
      format: 'percentage',
      precision: 1,
      displayOrder: 45,
      description: 'Proportion of free throws made.',
    },
    {
      key: 'steals',
      label: 'Steals',
      shortLabel: 'STL',
      appliesTo: 'both',
      category: 'Defence',
      aggregation: 'sum',
      format: 'integer',
      displayOrder: 10,
      description: 'Possessions taken directly from an opponent.',
    },
    {
      key: 'blocks',
      label: 'Blocks',
      shortLabel: 'BLK',
      appliesTo: 'both',
      category: 'Defence',
      aggregation: 'sum',
      format: 'integer',
      displayOrder: 20,
      description: 'Shots deflected on their way to the basket.',
    },
  ],

  // ---------------------------------------------------------------------------
  // TENNIS
  //
  // Career totals are sport-wide; surface records are per discipline, because
  // that is how tennis records are actually kept.
  // ---------------------------------------------------------------------------
  tennis: [
    {
      key: 'titles',
      label: 'Titles',
      shortLabel: 'T',
      appliesTo: 'player',
      category: 'Career',
      aggregation: 'sum',
      format: 'integer',
      isHeadline: true,
      displayOrder: 10,
      description: 'Singles tournaments won.',
    },
    {
      key: 'grand_slams',
      label: 'Grand Slams',
      shortLabel: 'GS',
      appliesTo: 'player',
      category: 'Career',
      aggregation: 'sum',
      format: 'integer',
      isHeadline: true,
      displayOrder: 20,
      description:
        'The four majors: the Australian Open, Roland Garros, Wimbledon and the US Open.',
    },
    {
      key: 'weeks_at_no1',
      label: 'Weeks at No. 1',
      shortLabel: 'W1',
      appliesTo: 'player',
      category: 'Career',
      aggregation: 'max',
      format: 'integer',
      isHeadline: true,
      displayOrder: 30,
      description: 'Cumulative weeks ranked first in the world.',
    },
    {
      key: 'career_high_ranking',
      label: 'Career High Ranking',
      shortLabel: 'CH',
      appliesTo: 'player',
      category: 'Career',
      aggregation: 'min',
      format: 'integer',
      higherIsBetter: false,
      displayOrder: 40,
      description: 'Best ranking reached. A minimum, because rank one is the best.',
    },
    ...(['hard', 'clay', 'grass'] as const).flatMap((surface): StatisticDefinitionSeed[] => [
      {
        key: 'match_wins',
        label: 'Match Wins',
        shortLabel: 'W',
        appliesTo: 'player',
        category: 'Record',
        aggregation: 'sum',
        format: 'integer',
        isHeadline: true,
        displayOrder: 10,
        discipline: surface,
        description: 'Matches won on this surface.',
      },
      {
        key: 'match_losses',
        label: 'Match Losses',
        shortLabel: 'L',
        appliesTo: 'player',
        category: 'Record',
        aggregation: 'sum',
        format: 'integer',
        higherIsBetter: false,
        displayOrder: 20,
        discipline: surface,
        description: 'Matches lost on this surface.',
      },
      {
        key: 'win_percentage',
        label: 'Win Percentage',
        shortLabel: 'Win%',
        appliesTo: 'player',
        category: 'Record',
        aggregation: 'derived',
        format: 'percentage',
        precision: 1,
        displayOrder: 30,
        discipline: surface,
        description: 'Proportion of matches won on this surface.',
        formula: {
          numerator: 'match_wins',
          denominator: 'matches_played',
          multiplier: 100,
        },
      },
    ]),
  ],

  // ---------------------------------------------------------------------------
  // FORMULA 1
  //
  // Nearly every key applies to a driver and to a constructor alike, which is
  // what `appliesTo: 'both'` exists for: one definition serves the two parallel
  // championships the same events produce.
  // ---------------------------------------------------------------------------
  'formula-1': [
    {
      key: 'starts',
      label: 'Starts',
      shortLabel: 'S',
      appliesTo: 'both',
      category: 'Race',
      aggregation: 'sum',
      format: 'integer',
      isHeadline: true,
      displayOrder: 5,
      discipline: 'race',
      description: 'Grands Prix started.',
    },
    {
      key: 'wins',
      label: 'Wins',
      shortLabel: 'W',
      appliesTo: 'both',
      category: 'Race',
      aggregation: 'sum',
      format: 'integer',
      isHeadline: true,
      displayOrder: 10,
      discipline: 'race',
      description: 'Grands Prix won.',
    },
    {
      key: 'podiums',
      label: 'Podiums',
      shortLabel: 'P',
      appliesTo: 'both',
      category: 'Race',
      aggregation: 'sum',
      format: 'integer',
      isHeadline: true,
      displayOrder: 20,
      discipline: 'race',
      description: 'Top-three finishes.',
    },
    {
      key: 'fastest_laps',
      label: 'Fastest Laps',
      shortLabel: 'FL',
      appliesTo: 'both',
      category: 'Race',
      aggregation: 'sum',
      format: 'integer',
      displayOrder: 30,
      discipline: 'race',
      description: 'Races in which this was the quickest lap set.',
    },
    {
      key: 'championship_points',
      label: 'Championship Points',
      shortLabel: 'Pts',
      appliesTo: 'both',
      category: 'Race',
      aggregation: 'sum',
      format: 'decimal',
      precision: 1,
      isHeadline: true,
      displayOrder: 40,
      discipline: 'race',
      description:
        'Points accumulated towards a championship. Decimal because half points have been awarded for shortened races.',
    },
    {
      key: 'dnf',
      label: 'Retirements',
      shortLabel: 'DNF',
      appliesTo: 'both',
      category: 'Race',
      aggregation: 'sum',
      format: 'integer',
      higherIsBetter: false,
      displayOrder: 50,
      discipline: 'race',
      description: 'Races not finished, whether through mechanical failure or incident.',
    },
    {
      key: 'pole_positions',
      label: 'Pole Positions',
      shortLabel: 'Pole',
      appliesTo: 'both',
      category: 'Qualifying',
      aggregation: 'sum',
      format: 'integer',
      isHeadline: true,
      displayOrder: 10,
      discipline: 'qualifying',
      description: 'Races started from first on the grid.',
    },
    {
      key: 'front_rows',
      label: 'Front Rows',
      shortLabel: 'FR',
      appliesTo: 'both',
      category: 'Qualifying',
      aggregation: 'sum',
      format: 'integer',
      displayOrder: 20,
      discipline: 'qualifying',
      description: 'Races started from the first or second grid slot.',
    },
    {
      key: 'championships',
      label: 'Championships',
      shortLabel: 'C',
      appliesTo: 'both',
      category: 'Honours',
      aggregation: 'sum',
      format: 'integer',
      isHeadline: true,
      displayOrder: 10,
      description: 'World championships won.',
    },
  ],
};

/**
 * The registry as consumed by the seeder: each sport's own definitions with the
 * universal ones appended.
 */
export const STATISTIC_REGISTRY: Record<string, StatisticDefinitionSeed[]> = Object.fromEntries(
  Object.entries(SPORT_DEFINITIONS).map(([sport, definitions]) => [
    sport,
    [...definitions, ...UNIVERSAL],
  ]),
);
