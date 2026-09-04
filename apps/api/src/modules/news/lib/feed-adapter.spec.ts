import { describe, expect, it } from 'vitest';
import { GenericRssAdapter, resolveAdapter, type AdapterSourceContext } from './feed-adapter';
import { canonicalUrlHash } from './canonical-url';
import type { RawFeedItem } from './feed-parser';

const source: AdapterSourceContext = {
  id: 'source-1',
  feedUrl: 'https://feed.example.com/rss.xml',
};

describe('GenericRssAdapter', () => {
  const adapter = new GenericRssAdapter();
  const fetchedAt = new Date('2025-06-01T00:00:00Z');

  it('normalizes a complete item', () => {
    const item: RawFeedItem = {
      guid: 'guid-1',
      title: 'Headline',
      description: 'Summary text',
      content: 'Full content',
      link: 'https://example.com/story?utm_source=twitter&id=1',
      author: 'Jane',
      publishedAt: new Date('2025-05-01T10:00:00Z'),
      categories: ['football'],
      imageUrl: 'https://example.com/image.jpg',
    };

    const result = adapter.normalize(item, source, fetchedAt);

    expect(result.headline).toBe('Headline');
    expect(result.summary).toBe('Summary text');
    expect(result.originalUrl).toBe(item.link);
    expect(result.canonicalUrl).toBe(canonicalUrlHash(item.link!).canonicalUrl);
    expect(result.canonicalUrlHash).toBe(canonicalUrlHash(item.link!).hash);
    expect(result.imageUrl).toBe('https://example.com/image.jpg');
    expect(result.publishedAt).toEqual(item.publishedAt);
    expect(result.guid).toBe('guid-1');
    expect(result.externalId).toBe('guid-1');
    expect(result.language).toBe('en');
    expect(result.rawMetadata.author).toBe('Jane');
    expect(result.rawMetadata.categories).toEqual(['football']);
  });

  it('falls back to fetch time when publishedAt is missing', () => {
    const item: RawFeedItem = { title: 'No date', link: 'https://example.com/no-date' };
    const result = adapter.normalize(item, source, fetchedAt);
    expect(result.publishedAt).toEqual(fetchedAt);
  });

  it('falls back to null (not empty string) when summary is missing', () => {
    const item: RawFeedItem = { title: 'No summary', link: 'https://example.com/no-summary' };
    const result = adapter.normalize(item, source, fetchedAt);
    expect(result.summary).toBeNull();
  });

  it('falls back to a placeholder headline when title is missing, without throwing', () => {
    const item: RawFeedItem = { link: 'https://example.com/no-title' };
    expect(() => adapter.normalize(item, source, fetchedAt)).not.toThrow();
    const result = adapter.normalize(item, source, fetchedAt);
    expect(result.headline).toBeTruthy();
  });

  it('falls back to the feed URL when link is missing, without throwing', () => {
    const item: RawFeedItem = { title: 'No link' };
    expect(() => adapter.normalize(item, source, fetchedAt)).not.toThrow();
    const result = adapter.normalize(item, source, fetchedAt);
    expect(result.originalUrl).toBe(source.feedUrl);
  });

  it('produces a stable hash even when the link is not a parseable URL', () => {
    const item: RawFeedItem = { title: 'Bad link', link: 'not a url at all', guid: 'g1' };
    expect(() => adapter.normalize(item, source, fetchedAt)).not.toThrow();
    const result1 = adapter.normalize(item, source, fetchedAt);
    const result2 = adapter.normalize(item, source, fetchedAt);
    expect(result1.canonicalUrlHash).toBe(result2.canonicalUrlHash);
    expect(result1.canonicalUrlHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('treats null/empty imageUrl as null, not empty string', () => {
    const item: RawFeedItem = { title: 'x', link: 'https://example.com/x' };
    const result = adapter.normalize(item, source, fetchedAt);
    expect(result.imageUrl).toBeNull();
  });
});

describe('resolveAdapter', () => {
  it('resolves to GenericRssAdapter for any source (the only adapter in Phase 2)', () => {
    const adapter = resolveAdapter(source);
    expect(adapter).toBeInstanceOf(GenericRssAdapter);
  });
});
