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
