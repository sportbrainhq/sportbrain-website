import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchRssFeed, hashContent } from './rss-fetcher';

function jsonHeaders(entries: Record<string, string>): Headers {
  return new Headers(entries);
}

describe('fetchRssFeed', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout'] });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.useRealTimers();
  });

  it('rejects a URL that fails the SSRF guard, without ever calling fetch', async () => {
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    const result = await fetchRssFeed({
      url: 'http://169.254.169.254/latest/meta-data',
      timeoutMs: 1000,
      maxResponseBytes: 1000,
      retryCount: 0,
    });

    expect(result.outcome).toBe('rejected');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('handles a 304 Not Modified without treating it as an error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(null, {
        status: 304,
        headers: jsonHeaders({ etag: '"abc"', 'last-modified': 'Wed, 01 Jan 2025 00:00:00 GMT' }),
      }),
    ) as unknown as typeof fetch;

    const result = await fetchRssFeed({
      url: 'https://example.com/feed.xml',
      timeoutMs: 1000,
      maxResponseBytes: 1000,
      retryCount: 0,
      etag: '"abc"',
    });

    expect(result.outcome).toBe('not_modified');
    if (result.outcome === 'not_modified') {
      expect(result.etag).toBe('"abc"');
    }
  });

  it('marks a 200 response as unchanged when its content hash matches the previous fetch', async () => {
    const body = '<rss></rss>';
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(body, { status: 200, headers: jsonHeaders({}) }),
      ) as unknown as typeof fetch;

    const result = await fetchRssFeed({
      url: 'https://example.com/feed.xml',
      timeoutMs: 1000,
      maxResponseBytes: 10_000,
      retryCount: 0,
      previousContentHash: hashContent(body),
    });

    expect(result.outcome).toBe('success');
    if (result.outcome === 'success') {
      expect(result.unchanged).toBe(true);
    }
  });

  it('reports a fresh 200 response as changed when the hash differs', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(
        new Response('<rss>new</rss>', { status: 200, headers: jsonHeaders({}) }),
      ) as unknown as typeof fetch;

    const result = await fetchRssFeed({
      url: 'https://example.com/feed.xml',
      timeoutMs: 1000,
      maxResponseBytes: 10_000,
      retryCount: 0,
      previousContentHash: hashContent('<rss>old</rss>'),
    });

    expect(result.outcome).toBe('success');
    if (result.outcome === 'success') {
      expect(result.unchanged).toBe(false);
    }
  });

  it('retries a 500 up to retryCount times, then succeeds', async () => {
    let calls = 0;
    globalThis.fetch = vi.fn().mockImplementation(() => {
      calls++;
      if (calls < 3) {
        return Promise.resolve(new Response('err', { status: 500 }));
      }
      return Promise.resolve(new Response('<rss>ok</rss>', { status: 200 }));
    }) as unknown as typeof fetch;

    const promise = fetchRssFeed({
      url: 'https://example.com/feed.xml',
      timeoutMs: 1000,
      maxResponseBytes: 10_000,
      retryCount: 2,
    });

    await vi.runAllTimersAsync();
    const result = await promise;

    expect(calls).toBe(3);
    expect(result.outcome).toBe('success');
  });

  it('gives up after exhausting retries on persistent failure', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(new Response('err', { status: 503 })) as unknown as typeof fetch;

    const promise = fetchRssFeed({
      url: 'https://example.com/feed.xml',
      timeoutMs: 1000,
      maxResponseBytes: 10_000,
      retryCount: 2,
    });

    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.outcome).toBe('failed');
  });

  it('does not retry a non-retryable 4xx status', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(new Response('nope', { status: 404 }));
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    const result = await fetchRssFeed({
      url: 'https://example.com/feed.xml',
      timeoutMs: 1000,
      maxResponseBytes: 10_000,
      retryCount: 3,
    });

    expect(result.outcome).toBe('failed');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('aborts and reports failure when the response exceeds maxResponseBytes', async () => {
    const bigBody = 'x'.repeat(1000);
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(new Response(bigBody, { status: 200 })) as unknown as typeof fetch;

    const result = await fetchRssFeed({
      url: 'https://example.com/feed.xml',
      timeoutMs: 1000,
      maxResponseBytes: 10,
      retryCount: 0,
    });

    expect(result.outcome).toBe('failed');
  });
});
