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
  | 'officiating';

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
  | 'where_it_happens';

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
