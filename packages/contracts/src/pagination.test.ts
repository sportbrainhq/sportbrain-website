import { describe, expect, it } from 'vitest';
import { buildPaginationMeta, paginationQuerySchema, MAX_PAGE_SIZE } from './pagination';

describe('paginationQuerySchema', () => {
  it('applies defaults when the query is empty', () => {
    expect(paginationQuerySchema.parse({})).toEqual({ page: 1, limit: 20 });
  });

  it('coerces string query params, since Express gives strings', () => {
    expect(paginationQuerySchema.parse({ page: '3', limit: '50' })).toEqual({
      page: 3,
      limit: 50,
    });
  });

  it('rejects a limit above the cap so a client cannot request the whole table', () => {
    expect(() => paginationQuerySchema.parse({ limit: MAX_PAGE_SIZE + 1 })).toThrow();
  });

  it('rejects a page below 1', () => {
    expect(() => paginationQuerySchema.parse({ page: 0 })).toThrow();
  });
});

describe('buildPaginationMeta', () => {
  it('reports more pages when the total exceeds the current page', () => {
    expect(buildPaginationMeta(45, { page: 1, limit: 20 })).toEqual({
      page: 1,
      limit: 20,
      total: 45,
      totalPages: 3,
      hasMore: true,
    });
  });

  it('reports no more pages on the last page', () => {
    expect(buildPaginationMeta(45, { page: 3, limit: 20 }).hasMore).toBe(false);
  });

  it('handles an empty result set without dividing by zero', () => {
    expect(buildPaginationMeta(0, { page: 1, limit: 20 })).toEqual({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      hasMore: false,
    });
  });
});
