export type { SourceSeed } from './football-overview';

/**
 * Seed types for the explainer library.
 *
 * Shared by every sport's taxonomy file. Football is the first, cricket will be
 * the second, and neither should need a type of its own: what differs between
 * sports is the categories and the concepts, which are data.
 */

export type ExplainerType =
  | 'standard'
  | 'definition'
  | 'rule'
  | 'formation'
  | 'tactical_concept'
  | 'statistic'
  | 'position_role'
  | 'dismissal'
  | 'bowling_delivery'
  | 'batting_technique'
  | 'field_position'
  | 'format'
  | 'technology'
  | 'play'
  | 'court_area'
  | 'officiating'
  // Tennis.
  | 'shot'
  | 'playing_style'
  | 'surface'
  | 'equipment'
  | 'ranking_concept'
  // Formula 1.
  | 'car_component'
  | 'procedure'
  | 'strategy_concept'
  | 'circuit'
  | 'penalty'
  | 'flag'
  // Golf.
  | 'club'
  | 'hole'
  | 'swing_element'
  | 'handicap_concept'
  | 'scoring_term'
  // MMA.
  | 'technique'
  | 'position'
  | 'ruleset_concept'
  | 'promotion'
  | 'fight_result';

export type ExplainerDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type ExplainerSectionType =
  | 'one_sentence'
  | 'simple_explanation'
  | 'how_it_works'
  | 'example'
  | 'why_it_matters'
  | 'common_misunderstandings'
  | 'key_takeaways'
  | 'the_law'
  | 'in_practice'
  | 'sanctions'
  | 'edge_cases'
  | 'basic_structure'
  | 'in_possession'
  | 'out_of_possession'
  | 'strengths'
  | 'weaknesses'
  | 'variations'
  | 'player_profiles'
  | 'movement'
  | 'responsibilities'
  | 'what_it_measures'
  | 'how_it_is_calculated'
  | 'how_to_interpret'
  | 'what_it_does_not_tell_you'
  | 'provider_differences'
  | 'tactical_application'
  | 'historical_context'
  | 'format_differences'
  | 'when_you_will_see_it'
  | 'step_by_step'
  | 'decision_sequence'
  | 'reviews_and_technology'
  | 'grip_and_release'
  | 'what_the_batter_expects'
  | 'what_actually_happens'
  | 'how_batters_counter_it'
  | 'footwork_and_bat_path'
  | 'scoring_area'
  | 'risk'
  | 'common_mistakes'
  | 'position_on_the_field'
  | 'purpose'
  | 'when_it_is_used'
  | 'duration_and_structure'
  | 'result_types'
  | 'who_plays_it'
  | 'reading_the_score'
  | 'reading_a_batting_line'
  | 'reading_a_bowling_analysis'
  | 'rule_differences'
  | 'how_to_read_it'
  | 'the_action'
  | 'how_it_is_defended'
  | 'counters'
  | 'where_it_happens'
  // Tennis.
  | 'the_shot'
  | 'when_players_use_it'
  | 'advantages'
  | 'risks'
  | 'notable_players'
  | 'worked_example'
  | 'how_it_is_played'
  // Formula 1.
  | 'the_procedure'
  | 'on_the_car'
  | 'strategic_implications'
  | 'driver_technique'
  | 'regulation_era'
  // Golf.
  | 'the_swing'
  | 'on_the_course'
  | 'club_selection'
  | 'penalty_and_relief'
  // MMA.
  | 'the_technique'
  | 'recognition'
  | 'danger_and_stoppage';

export type ExplainerRelationType =
  | 'related_to'
  | 'requires_understanding'
  | 'part_of'
  | 'contrasts_with'
  | 'used_in'
  | 'variation_of'
  | 'measured_by';

export interface ExplainerCategorySeed {
  slug: string;
  name: string;
  /** Used by the category navigation, where the full name is too long. */
  shortName?: string;
  description: string;
  order: number;
}

export interface ExplainerSectionSeed {
  type: ExplainerSectionType;
  /** Overrides the type's default heading. */
  heading?: string;
  body?: string;
  structuredData?: unknown;
}

/**
 * One concept.
 *
 * A row with no `sections` is a taxonomy placeholder: the concept is real and
 * named, but unwritten. Those stay `draft` and never reach the site. This is
 * what makes duplication control work before the writing happens, since a new
 * explainer can be checked against every concept we intend to cover rather than
 * only against the ones already finished.
 */
export interface ExplainerSeed {
  slug: string;
  title: string;
  subtitle?: string;
  shortDescription?: string;
  type: ExplainerType;
  difficulty: ExplainerDifficulty;
  /** The category the breadcrumb shows. */
  category: string;
  /** Additional categories. The concept is one row regardless of how many. */
  alsoIn?: string[];
  aliases?: string[];
  sections?: ExplainerSectionSeed[];
  /** Slugs of related concepts. Untyped entries default to `related_to`. */
  related?: (string | { slug: string; type: ExplainerRelationType })[];
  /** Keys into the shared source table. */
  sourceKeys?: { key: string; locator?: string }[];
  /**
   * Content that depends on a rule which changes.
   *
   * Set on anything written against the Laws or a competition's playing
   * conditions, so the set to re-check after an MCC or ICC revision is a query
   * rather than a reading of every article.
   */
  ruleSensitive?: boolean;
  /** The edition the text was written against: "MCC 2017 Code, 4th edition". */
  sourceRevision?: string;
  /** ISO date. When somebody last checked this against the current rules. */
  lastReviewedAt?: string;
  isStartHere?: boolean;
  isFeatured?: boolean;
  readMinutes?: number;
  order?: number;
}

/**
 * A formation's shape, stored on the diagram section.
 *
 * Coordinates are percentages of the attacking half-pitch: `x` runs 0 (left
 * touchline) to 100 (right), `y` runs 0 (own goal line) to 100 (opponent's).
 * Percentages rather than pixels so the diagram is resolution-independent and
 * the same numbers drive a thumbnail and a full-width figure.
 */
/**
 * A set of cricket fielding positions, stored on a diagram section.
 *
 * Coordinates are percentages of a square viewport containing the circular
 * field: `x` runs 0 (leg side boundary for a right-handed striker) to 100 (off
 * side), `y` runs 0 (behind the striker's wicket) to 100 (straight down the
 * ground). Structured rather than an image because the same numbers have to
 * drive a single highlighted position, a slip cordon and a whole field setting,
 * and because a diagram nobody can read out to a screen reader is not a
 * diagram for a beginner.
 *
 * `side` and `depth` are stored alongside the coordinates rather than derived
 * from them: "off side" and "close catching" are how the concepts are taught,
 * and a reader should not have to infer them from an x value.
 */
export interface FieldPositionPoint {
  name: string;
  /** Short label drawn in the marker: "3rd", "P", "MW". */
  label?: string;
  side: 'off' | 'leg' | 'straight';
  depth: 'close' | 'inner' | 'deep';
  x: number;
  y: number;
  /** Draws this one filled: the position the explainer is about. */
  highlight?: boolean;
}

export interface FieldSettingShape {
  positions: FieldPositionPoint[];
  /**
   * Which hand the striker is batting with.
   *
   * Off and leg side mirror for a left-hander, so a diagram that does not say
   * which it assumes is ambiguous rather than merely incomplete.
   */
  handedness?: 'right' | 'left';
  caption?: string;
}

/**
 * A worked scoreline, for the beginner scoring explainers.
 *
 * Each part is labelled separately so the renderer can point at "47.2" and say
 * what it means, instead of the article having to describe the position of a
 * character in a string. Over notation is a string throughout, never a number:
 * treating 47.2 as a decimal is the single most common cricket data bug.
 */
export interface ScoreBreakdown {
  /** "IND 287/6 (47.2)", "75 (62)", "8.2-0-47-3". */
  display: string;
  kind: 'team' | 'batter' | 'bowler';
  parts: { value: string; label: string; explanation: string }[];
}

export interface FormationShape {
  positions: {
    /** Shown in the marker: "GK", "CB", "RW". */
    label: string;
    /** The role's full name, for the caption and the accessible description. */
    role: string;
    x: number;
    y: number;
  }[];
}

/**
 * A basketball play, stored on a diagram section.
 *
 * Structured rather than an image for the same three reasons cricket's field
 * settings are: one payload has to drive several renderings, it has to stay
 * legible in both themes, and it has to describe itself to a reader who cannot
 * see it. A picture of a pick and roll does none of those, and a beginner is
 * exactly the reader who needs the alt text to be real.
 *
 * Coordinates are percentages of the rendered court, so the same numbers drive
 * a thumbnail and a full-width figure: `x` runs 0 (left sideline) to 100
 * (right), `y` runs 0 (baseline under the attacking basket) to 100 (half-way
 * line) on a half court. `court: 'full'` extends `y` to the far baseline.
 *
 * ## Steps
 *
 * A play is taught as a sequence, not a single frozen frame. Each step carries
 * its own positions and arrows, so the reader sees the screen being set and
 * then the roll, rather than one diagram with six arrows on it. A play with a
 * single step is just a static diagram, which is what the court-area and
 * spacing explainers use.
 */
export interface CourtPlayer {
  id: string;
  team: 'offense' | 'defense';
  /** Drawn in the marker: "1", "5", "PG", "C". */
  label: string;
  x: number;
  y: number;
  hasBall?: boolean;
  /** Draws this one emphasised: the player the step is about. */
  highlight?: boolean;
}

/** A player movement, a pass or a shot. Rendered as an arrow of its kind. */
export interface CourtArrow {
  kind: 'move' | 'pass' | 'shot' | 'dribble';
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  label?: string;
}

/** A screen, drawn as a bar perpendicular to the screened defender's path. */
export interface CourtScreen {
  x: number;
  y: number;
  /** Degrees. 0 is a bar parallel to the baseline. */
  angle?: number;
  label?: string;
}

/** A highlighted region: the paint, the corner, a zone's area of responsibility. */
export interface CourtZone {
  /** Percentage rectangle, in the same coordinate space as the players. */
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
}

export interface CourtPlayStep {
  /** "C moves toward the ball handler and sets the screen." */
  caption: string;
  players: CourtPlayer[];
  arrows?: CourtArrow[];
  screens?: CourtScreen[];
  zones?: CourtZone[];
}

export interface CourtPlayShape {
  court: 'half' | 'full';
  steps: CourtPlayStep[];
  caption?: string;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Tennis
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * A tennis court diagram, stored on a section's structured data.
 *
 * Coordinates are percentages of the drawn court, which keeps the real 78-by-36
 * foot proportion rather than squaring it off: half the court explainers exist
 * because the court is long and narrow, and a square drawing teaches the
 * opposite. `x` runs 0 (left doubles sideline) to 100 (right); `y` runs 0 (the
 * near baseline, the reader's end) to 100 (the far baseline), with the net at
 * 50. A payload is therefore written the way a rally is described, from the
 * reader's end forward.
 *
 * The landmarks, for writing coordinates by hand: doubles sidelines at x 6 and
 * 94, singles sidelines at 17 and 83, baselines at y 6 and 94, service lines at
 * y 26.5 and 73.5, centre service line at x 50.
 *
 * `court` is the discriminator against the basketball play, which also carries
 * `steps`. The renderer picks a diagram by payload shape rather than by sport,
 * so 'singles' | 'doubles' has to be present and has to differ from
 * basketball's 'half' | 'full'.
 */
export interface TennisCourtPlayer {
  id: string;
  /** Drawn in the marker: "S" for server, "R" for returner, "A"/"B" in doubles. */
  label: string;
  side: 'near' | 'far';
  x: number;
  y: number;
  hasBall?: boolean;
  /** Draws this one filled: the player the step is about. */
  highlight?: boolean;
}

/** A ball flight, a serve or a player movement. Rendered as an arrow of its kind. */
export interface TennisCourtArrow {
  kind: 'ball' | 'move' | 'serve';
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  label?: string;
  /** Dashed and faint: the shot that was not played, or the one being contrasted. */
  ghost?: boolean;
}

/** A bounce, a landing point or a target. `out` renders as a cross, `in` as a dot. */
export interface TennisCourtSpot {
  x: number;
  y: number;
  label?: string;
  kind?: 'in' | 'out' | 'target';
}

/** A highlighted region: a service box, an alley, an area of the court. */
export interface TennisCourtZone {
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
}

export interface TennisCourtStep {
  caption: string;
  players?: TennisCourtPlayer[];
  arrows?: TennisCourtArrow[];
  spots?: TennisCourtSpot[];
  zones?: TennisCourtZone[];
}

export interface TennisCourtShape {
  /** `doubles` draws the alleys as live; `singles` greys them out. */
  court: 'singles' | 'doubles';
  steps: TennisCourtStep[];
  /** Names the baseline, service line and alley on the drawing itself. */
  showLabels?: boolean;
  caption?: string;
}

/**
 * A knockout draw.
 *
 * `entrants` is the first round in draw order, read two at a time, so a payload
 * cannot express a bracket with an odd player left over in a round. `winners`
 * is optional: omitting it renders an empty bracket, which is what the seeding
 * explainers want, since their subject is the shape of the draw rather than
 * anybody's results.
 */
export interface DrawEntrant {
  name: string;
  seed?: number;
  /** How the player entered: "Q", "WC", "LL", "PR", "Alt". */
  status?: string;
  highlight?: boolean;
}

export interface DrawShape {
  rounds: string[];
  entrants: DrawEntrant[];
  /** By round. `winners[0]` is the second round; each entry indexes the previous round. */
  winners?: number[][];
  caption?: string;
}

/**
 * A worked scoreline.
 *
 * Cricket's `ScoreBreakdown` does the same job for a different shape: it labels
 * the parts of one string like "287/6 (47.2)", where a tennis scoreboard is a
 * grid, and the grid is exactly what a beginner cannot read. `tiebreak` renders
 * as the superscript beside the games, which is the notation every scoreboard
 * uses and nobody explains.
 */
export interface TennisScoreboardShape {
  sets: string[];
  rows: {
    name: string;
    scores: { games: number | string; tiebreak?: number | string }[];
    serving?: boolean;
    /** The live point score: "40", "AD", "30". */
    points?: string;
    won?: boolean;
  }[];
  caption?: string;
  /** Pointed-at explanations rendered beneath the grid. */
  notes?: { label: string; explanation: string }[];
}

/* ────────────────────────────────────────────────────────────────────────────
 * Formula 1
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * A track diagram: a circuit outline with cars, zones and markers on it.
 *
 * Structured rather than an image for the three reasons every other sport's
 * diagram is: one payload drives a thumbnail and a full-width figure, it stays
 * legible in both themes, and it can describe itself to a reader who cannot see
 * it. The last matters more here than anywhere else in the library, because a
 * diagram is the only honest way to explain an undercut and a picture of one is
 * useless to a screen reader.
 *
 * `path` is an SVG path string in a 0-100 coordinate box, so a circuit is
 * written once and reused by every explainer that needs that track. Where the
 * concept does not depend on a real circuit, `path` is omitted and the renderer
 * draws its generic oval: an out-lap diagram should not imply the idea only
 * applies at Silverstone.
 *
 * Positions along the lap are given as `lap` percentages rather than x/y pairs,
 * which is the whole reason this type is worth having. "The DRS detection point
 * is 300 metres before the corner and the activation zone starts at the exit"
 * is a statement about distance around a lap, and making an author solve for
 * coordinates on a bezier would guarantee arithmetic errors in the seed data.
 */
export interface TrackCar {
  id: string;
  /** Drawn in the marker: "1", "VER", "A", "B". */
  label: string;
  /** Percentage of the way around the lap, 0-100. */
  lap: number;
  /** Distinguishes the two cars in a battle without naming real drivers. */
  team?: 'a' | 'b' | 'neutral';
  /** Draws this one emphasised: the car the step is about. */
  highlight?: boolean;
  /** Renders faint: where the car would have been on the other strategy. */
  ghost?: boolean;
  /** "in the pit lane", shown off the racing line. */
  inPits?: boolean;
}

/** A stretch of lap: a DRS zone, a yellow flag sector, a braking zone. */
export interface TrackZone {
  /** Percentages of the lap. `to` may be less than `from` to cross the line. */
  from: number;
  to: number;
  label?: string;
  kind?: 'drs' | 'caution' | 'braking' | 'sector' | 'neutral';
}

/** A point on the lap: a detection line, an apex, a pit entry, a marshal post. */
export interface TrackMarker {
  lap: number;
  label: string;
  kind?: 'detection' | 'apex' | 'pit-entry' | 'pit-exit' | 'start' | 'flag' | 'neutral';
}

export interface TrackStep {
  /** "Car B pits at the end of lap 18 and rejoins on fresh softs." */
  caption: string;
  cars?: TrackCar[];
  zones?: TrackZone[];
  markers?: TrackMarker[];
  /** Shown beside the diagram: "Lap 18 of 57", "Gap: 2.1s". */
  note?: string;
}

export interface TrackShape {
  /** The discriminator. No other sport's payload carries it. */
  track: 'circuit';
  /** SVG path in a 0-100 box. Omitted for a generic illustrative lap. */
  path?: string;
  /** Named when `path` is a real circuit, so the caption can say which. */
  circuitName?: string;
  steps: TrackStep[];
  caption?: string;
}

/**
 * A labelled car diagram, for the components and aerodynamics categories.
 *
 * The brief asks for labelled car diagrams by name. Parts are percentages of a
 * side or top view rather than pixels, and `view` is stored rather than
 * inferred because a floor is only visible from below and a halo only from
 * above, and a reader needs to be told which way they are looking at it.
 */
export interface CarPart {
  /** "Front wing", "Diffuser", "Halo". */
  name: string;
  x: number;
  y: number;
  /** Draws this one emphasised: the part the explainer is about. */
  highlight?: boolean;
  /** One line shown on hover and in the accessible description. */
  note?: string;
}

export interface CarDiagramShape {
  /** The discriminator, alongside `parts`. */
  car: 'side' | 'top' | 'front';
  parts: CarPart[];
  caption?: string;
}

/**
 * A strategy comparison: two or more stint plans on a shared lap axis.
 *
 * The one visual the strategy category genuinely cannot do without. An undercut,
 * an overcut, a one-stop against a two-stop and an offset are all the same
 * claim (these tyres, for these laps, at this pace) and prose describing four
 * of them side by side is unreadable. Laps are absolute rather than
 * percentages, because a strategy argument is conducted in laps.
 */
export interface StintPlan {
  /** "One-stop", "Two-stop", "Car A". */
  label: string;
  stints: {
    /** Matches a tyre explainer's subject: soft, medium, hard, inter, wet. */
    compound: 'soft' | 'medium' | 'hard' | 'intermediate' | 'wet';
    fromLap: number;
    toLap: number;
    /** "Fresh", "Used", "10-lap-old". */
    note?: string;
  }[];
  /** The outcome, shown at the end of the row: "P1, +2.4s". */
  result?: string;
  highlight?: boolean;
}

export interface StrategyChartShape {
  /** The discriminator. */
  strategy: 'stints';
  totalLaps: number;
  plans: StintPlan[];
  caption?: string;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Golf
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * A golf hole, drawn from the tee looking down the hole.
 *
 * Structured rather than an image for the three reasons every other sport's
 * diagram is: one payload drives a thumbnail and a full-width figure, it stays
 * legible in both themes, and it can describe itself to a reader who cannot see
 * it. The last matters here more than it looks: half of golf's beginner
 * vocabulary is the names of parts of the ground, and a picture with the words
 * baked into it teaches nothing to a screen reader.
 *
 * Coordinates are percentages of a portrait viewport: `x` runs 0 (left edge of
 * the corridor) to 100 (right), `y` runs 0 (the tee, at the bottom of the
 * drawing) to 100 (the green, at the top). A hole is therefore written the way
 * it is played, from the tee forward, which is also the order the reader's eye
 * travels.
 *
 * `hole` is the discriminator. No other sport's payload carries it, so the
 * renderer picks a diagram by payload shape rather than by sport, exactly as it
 * does for a circuit and a court.
 */
export interface HoleFeature {
  /**
   * What this patch of ground is.
   *
   * The renderer colours by kind rather than by an author-supplied colour, so
   * a bunker is the same shade in every explainer and the legend is generated
   * rather than written eighteen times.
   */
  kind:
    | 'fairway'
    | 'rough'
    | 'green'
    | 'fringe'
    | 'bunker'
    | 'water'
    | 'penalty-red'
    | 'penalty-yellow'
    | 'trees'
    | 'out-of-bounds'
    | 'tee';
  /**
   * The outline, as points in the 0-100 box.
   *
   * A polygon rather than a rectangle because a fairway that bends is the
   * entire subject of the dogleg explainer, and a shape language that cannot
   * express one would force those pages back to prose.
   */
  points: { x: number; y: number }[];
  label?: string;
}

/** A shot, a target or a carry line. Rendered as an arrow of its kind. */
export interface HoleShot {
  kind: 'drive' | 'approach' | 'layup' | 'putt' | 'recovery' | 'carry';
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  label?: string;
  /**
   * Dashed and faint: the line the explainer is arguing against.
   *
   * Every course-management page is a comparison between the shot a beginner
   * plays and the shot a professional plays, and drawing both is the only way
   * to make that argument visible.
   */
  ghost?: boolean;
  /** Curves the arrow: a draw bends left, a fade right, from the player's view. */
  curve?: 'draw' | 'fade' | 'straight';
}

/** A point of interest: the pin, a landing area, a yardage marker, a hazard carry. */
export interface HoleMarker {
  x: number;
  y: number;
  label: string;
  kind?: 'pin' | 'tee' | 'ball' | 'target' | 'yardage' | 'trouble';
}

export interface HoleStep {
  /** "The tee shot lays up short of the water, leaving 150 yards in." */
  caption: string;
  shots?: HoleShot[];
  markers?: HoleMarker[];
  /** Shown beside the diagram: "Par 4, 430 yards". */
  note?: string;
}

export interface HoleShape {
  /** The discriminator. */
  hole: 'plan';
  /** 3, 4 or 5. Omitted where the drawing illustrates a concept, not a hole. */
  par?: 3 | 4 | 5;
  /** "430 yards", "165 metres". A string, because the unit is part of the fact. */
  length?: string;
  /** The ground, drawn in array order, so later features sit on earlier ones. */
  features: HoleFeature[];
  /** A single static drawing is one step. Several make it a sequence. */
  steps?: HoleStep[];
  caption?: string;
}

/**
 * A golf scorecard, with the arithmetic shown.
 *
 * Cricket's `ScoreBreakdown` labels the parts of one string and tennis's
 * `TennisScoreboardShape` draws a grid of sets. A golf card is a third shape
 * again: eighteen columns of par against strokes, with a running total relative
 * to par, and the relative total is precisely the thing a beginner cannot
 * derive. It is also where the handicap categories do their worked examples,
 * since a net score is a card with strokes deducted on named holes.
 *
 * `holes` is the discriminator.
 */
export interface ScorecardHole {
  /** 1-18. */
  number: number;
  par: number;
  /**
   * Difficulty ranking, 1-18.
   *
   * Where handicap strokes fall, and the column every club golfer reads and no
   * beginner has had explained. Optional, because a gross-scoring example does
   * not need it and showing an unexplained column is worse than omitting it.
   */
  strokeIndex?: number;
  yards?: number;
}

export interface ScorecardRow {
  name: string;
  /** Strokes taken, by hole, in the order of `holes`. */
  strokes: number[];
  /**
   * Handicap strokes received, by hole.
   *
   * Given per hole rather than as a single course handicap so the diagram can
   * show *where* the strokes fall, which is the half of net scoring that
   * arithmetic alone does not teach.
   */
  strokesReceived?: number[];
  /** "Playing handicap 14". Shown beside the name. */
  note?: string;
  highlight?: boolean;
}

export interface ScorecardShape {
  /** The discriminator. */
  holes: ScorecardHole[];
  rows: ScorecardRow[];
  caption?: string;
  /** Pointed-at explanations rendered beneath the card. */
  notes?: { label: string; explanation: string }[];
}

/**
 * A strokes-gained table.
 *
 * The brief asks for strokes gained by name, twice, and asks for worked
 * examples. The metric is a subtraction against a baseline, and every attempt
 * to explain it in prose alone founders on the same point: the reader cannot
 * see that a 25-foot putt holed is worth more than a 3-foot putt holed until
 * the two baselines are next to each other. So the baseline, the strokes
 * actually taken and the difference are three columns, and the sign convention
 * is rendered rather than described.
 *
 * `strokesGained` is the discriminator.
 */
export interface StrokesGainedRow {
  /** "Tee shot, 430-yard par 4", "Putt from 25 feet". */
  shot: string;
  /** "430 yards, tee", "25 feet, green". Where the shot started. */
  from?: string;
  /** Expected strokes to hole out from the starting position. */
  baselineBefore: number;
  /** Expected strokes to hole out from where the ball finished. 0 if holed. */
  baselineAfter: number;
  /** Strokes taken by this shot. Almost always 1; a penalty makes it 2. */
  strokesTaken?: number;
  /** Held rather than computed, so a worked example can show a wrong sum. */
  gained: number;
  category?: 'off-the-tee' | 'approach' | 'around-the-green' | 'putting';
}

export interface StrokesGainedShape {
  /** The discriminator. */
  strokesGained: 'shots' | 'summary';
  rows: StrokesGainedRow[];
  /** "Total: +1.4 strokes gained on the field". */
  total?: string;
  caption?: string;
}

/**
 * A ground or clinch position, drawn as two labelled bodies rather than a
 * pitch or a course.
 *
 * MMA has no equivalent of a formation's coordinates on a pitch or a hole's
 * plan of the ground: the geometry that matters is one fighter relative to
 * the other, not either relative to a fixed playing area. `MatShape` models
 * that directly, as a small sequence of steps (guard to mount, say), each a
 * set of labelled positions and, optionally, the limbs being controlled
 * between them. `mat` is the discriminator, checked first in the client's
 * dispatch chain since it is unambiguous against every other sport's shape
 * key (`hole`, `track`, `holes`, `strokesGained`).
 */
export interface MatPosition {
  id: string;
  /** "Top", "Bottom", "Attacker", "Defender". */
  label: string;
  role: 'top' | 'bottom';
  /** 0-100, normalised to the diagram's own coordinate space. */
  x: number;
  y: number;
  highlight?: boolean;
}

/**
 * A controlled limb, drawn as a line between two positions.
 *
 * Optional on every step: a step showing only body position (mount, back
 * control) does not need one, and a step illustrating a specific control
 * detail (an underhook, a trapped leg) uses it to show what is actually held.
 */
export interface MatLimb {
  kind: 'arm' | 'leg' | 'head' | 'hip';
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  controlledBy?: 'top' | 'bottom';
}

export interface MatStep {
  /** "Fighter in bottom's closed guard", shown above the diagram. */
  caption: string;
  positions: MatPosition[];
  limbs?: MatLimb[];
  /** A short note pointing at what the step is meant to teach. */
  note?: string;
}

export interface MatShape {
  /** The discriminator. */
  mat: 'position';
  steps: MatStep[];
  caption?: string;
}
