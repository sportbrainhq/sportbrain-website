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
  | 'position_role';

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
  | 'historical_context';

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
