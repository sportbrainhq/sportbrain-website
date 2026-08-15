import { z } from 'zod';

/**
 * Pagination primitives.
 *
 * Defined now, before any domain exists, so that every future list endpoint
 * inherits one shape. The alternative, letting each module invent its own,
 * is how APIs end up with `page`/`offset`/`cursor` variants side by side.
 *
 * No domain endpoint uses these yet. This is the contract they will adopt.
 */

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
});
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export const paginationMetaSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  hasMore: z.boolean(),
});
export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

/**
 * Wraps an item schema into a paginated envelope.
 *
 * Lists are never returned as a naked array: an array cannot carry a total,
 * and adding one later is a breaking change for every client.
 */
export function paginated<T extends z.ZodTypeAny>(item: T) {
  return z.object({
    data: z.array(item),
    pagination: paginationMetaSchema,
  });
}

export type Paginated<T> = {
  data: T[];
  pagination: PaginationMeta;
};

/** Builds the meta block from a total and the query that produced it. */
export function buildPaginationMeta(
  total: number,
  { page, limit }: PaginationQuery,
): PaginationMeta {
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
  return { page, limit, total, totalPages, hasMore: page < totalPages };
}
