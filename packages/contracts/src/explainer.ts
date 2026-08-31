import { z } from 'zod';
import { contentSourceSchema } from './sport';

/**
 * The explainer library boundary.
 *
 * Nothing here names a sport. The landing page, the article page and the search
 * all take the same shapes for cricket as for football, because what differs
 * between sports is the taxonomy rows and the concepts, not their structure.
 */

export const explainerTypeSchema = z.enum([
  'standard',
  'definition',
  'rule',
  'formation',
  'tactical_concept',
  'statistic',
  'position_role',
  'dismissal',
  'bowling_delivery',
  'batting_technique',
  'field_position',
  'format',
  'technology',
  // Basketball. `play` is a designed action with actors and a sequence, which
  // carries a diagram; `court_area` is a region of the floor; `officiating`
  // covers violations and fouls.
  'play',
  'court_area',
  'officiating',
  // Tennis. A `shot` is a stroke rather than a designed sequence, a
  // `playing_style` is how a player uses those strokes (tennis has no
  // positions), a `surface` is the axis the sport's results are split along,
  // and a `ranking_concept` is one of the points mechanisms rather than a rule
  // of play.
  'shot',
  'playing_style',
  'surface',
  'equipment',
  'ranking_concept',
  // Formula 1. A `car_component` is designed by a team rather than chosen by a
  // competitor, which is what separates it from `equipment`; a `procedure` is
  // conducted rather than played; a `strategy_concept` is pit-wall arithmetic
  // rather than a pattern of play; a `circuit` is the axis performance is split
  // along; and `penalty` and `flag` answer a mid-race lookup on their own.
  'car_component',
  'procedure',
  'strategy_concept',
  'circuit',
  'penalty',
  'flag',
]);
export type ExplainerType = z.infer<typeof explainerTypeSchema>;

export const explainerDifficultySchema = z.enum(['beginner', 'intermediate', 'advanced']);
export type ExplainerDifficulty = z.infer<typeof explainerDifficultySchema>;

export const explainerRelationTypeSchema = z.enum([
  'related_to',
  'requires_understanding',
  'part_of',
  'contrasts_with',
  'used_in',
  'variation_of',
  'measured_by',
]);
export type ExplainerRelationType = z.infer<typeof explainerRelationTypeSchema>;

/** A card in a listing. Deliberately small: listings render hundreds of these. */
export const explainerSummarySchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  subtitle: z.string().nullable(),
  shortDescription: z.string().nullable(),
  type: explainerTypeSchema,
  difficulty: explainerDifficultySchema,
  readMinutes: z.number().int().nullable(),
  categorySlug: z.string().nullable(),
  categoryName: z.string().nullable(),
});
export type ExplainerSummary = z.infer<typeof explainerSummarySchema>;

export const explainerCategorySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  shortName: z.string().nullable(),
  description: z.string().nullable(),
  /** Published concepts in this category. Includes ones whose home is elsewhere. */
  explainers: z.array(explainerSummarySchema),
  /** How many are published in total, since `explainers` is capped for the landing page. */
  totalCount: z.number().int(),
});
export type ExplainerCategory = z.infer<typeof explainerCategorySchema>;

/**
 * One section of an article.
 *
 * `structuredData` is unknown at this boundary on purpose. Its shape depends on
 * the section type, and the alternative is a discriminated union that every
 * consumer would have to exhaust even though only the formation diagram reads
 * it. The renderer validates the shape it needs at the point of use.
 */
export const explainerSectionSchema = z.object({
  type: z.string(),
  heading: z.string().nullable(),
  body: z.string().nullable(),
  structuredData: z.unknown().nullable(),
});
export type ExplainerSection = z.infer<typeof explainerSectionSchema>;

/** An edge in the concept graph, flattened toward its target for rendering. */
export const explainerRelatedSchema = explainerSummarySchema.extend({
  relationType: explainerRelationTypeSchema,
});
export type ExplainerRelated = z.infer<typeof explainerRelatedSchema>;

export const explainerSourceSchema = contentSourceSchema.extend({
  /** Which part of the source: a law number, a page range. */
  locator: z.string().nullable(),
});
export type ExplainerSource = z.infer<typeof explainerSourceSchema>;

export const explainerDetailSchema = explainerSummarySchema.extend({
  /**
   * Rule provenance, for content that goes out of date.
   *
   * Surfaced to the reader rather than kept internal: a no-ball explainer that
   * names the Law edition it was written against is honest about the one thing
   * it cannot guarantee, which is that nothing has changed since.
   */
  isRuleSensitive: z.boolean(),
  sourceRevision: z.string().nullable(),
  lastReviewedAt: z.string().nullable(),
  sections: z.array(explainerSectionSchema),
  related: z.array(explainerRelatedSchema),
  sources: z.array(explainerSourceSchema),
  /** Every category the concept appears under, not only its primary one. */
  categories: z.array(z.object({ slug: z.string(), name: z.string() })),
  aliases: z.array(z.string()),
});
export type ExplainerDetail = z.infer<typeof explainerDetailSchema>;

/** The landing page in one response. */
export const explainerLibrarySchema = z.object({
  sport: z.object({ slug: z.string(), name: z.string() }),
  /** The beginner path. */
  startHere: z.array(explainerSummarySchema),
  categories: z.array(explainerCategorySchema),
  /** Every published concept, for client-side search without a round trip. */
  searchIndex: z.array(
    explainerSummarySchema.extend({
      /** Title, subtitle and aliases, normalised, for matching. */
      terms: z.array(z.string()),
    }),
  ),
});
export type ExplainerLibrary = z.infer<typeof explainerLibrarySchema>;
