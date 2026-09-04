import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchNews, fetchNewsArticle } from './api';

/**
 * Covers the two news fetchers against `apiGet`'s real validation path,
 * mocking only the network boundary (`fetch`) so a contract mismatch would
 * still be caught the same way it would in production.
 */

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function buildArticleSummary(overrides: Record<string, unknown> = {}) {
  return {
    id: 'article-1',
    headline: 'Team wins the league',
    summary: null,
    source: { id: 'source-1', name: 'Example Sports', slug: 'example-sports' },
    originalUrl: 'https://example.com/article',
    canonicalUrl: 'https://sportbrainhq.test/news/article-1',
    imageUrl: null,
    sport: 'football',
    competitions: [],
    teams: [],
    players: [],
    topics: ['result'],
    importanceScore: 1,
    publishedAt: new Date().toISOString(),
    firstSeenAt: new Date().toISOString(),
    ...overrides,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchNews', () => {
  it('parses a populated cursor-paginated list', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        data: [buildArticleSummary()],
        pagination: { limit: 20, hasMore: false },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchNews({ sport: 'football' });

    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.headline).toBe('Team wins the league');
    expect(result.pagination.hasMore).toBe(false);

    const requestedUrl = fetchMock.mock.calls[0]?.[0] as string;
    expect(requestedUrl).toContain('/v1/news');
    expect(requestedUrl).toContain('sport=football');
  });

  it('treats an empty list as a normal successful response, not an error', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ data: [], pagination: { limit: 20, hasMore: false } }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchNews();

    expect(result.data).toEqual([]);
  });

  it('omits filter params that are not set', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ data: [], pagination: { limit: 20, hasMore: false } }));
    vi.stubGlobal('fetch', fetchMock);

    await fetchNews({ limit: 8 });

    const requestedUrl = fetchMock.mock.calls[0]?.[0] as string;
    expect(requestedUrl).not.toContain('sport=');
    expect(requestedUrl).not.toContain('team=');
    expect(requestedUrl).toContain('limit=8');
  });
});

describe('fetchNewsArticle', () => {
  it('parses a full article detail', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        ...buildArticleSummary(),
        processingStatus: 'published',
        entityLinks: [],
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const article = await fetchNewsArticle('article-1');

    expect(article.id).toBe('article-1');
    expect(article.processingStatus).toBe('published');
  });
});
