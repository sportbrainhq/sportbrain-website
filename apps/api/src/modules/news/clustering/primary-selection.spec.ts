import { describe, expect, it } from 'vitest';
import { selectPrimaryArticle, type ArticleForPrimarySelection } from './primary-selection';

function article(overrides: Partial<ArticleForPrimarySelection>): ArticleForPrimarySelection {
  return {
    id: 'article-1',
    headline: 'Headline',
    summary: null,
    imageUrl: null,
    publishedAt: new Date('2026-01-01T12:00:00Z'),
    sourceId: 'source-1',
    sourcePriority: 100,
    sourceTrustScore: 0.5,
    ...overrides,
  };
}

describe('selectPrimaryArticle', () => {
  it('throws on an empty list', () => {
    expect(() => selectPrimaryArticle([])).toThrow();
  });

  it('returns the sole article for a single-member cluster', () => {
    const only = article({ id: 'only' });
    expect(selectPrimaryArticle([only]).id).toBe('only');
  });

  it('prefers the higher source trust score', () => {
    const highTrust = article({ id: 'high-trust', sourceTrustScore: 0.9 });
    const lowTrust = article({ id: 'low-trust', sourceTrustScore: 0.2 });
    expect(selectPrimaryArticle([lowTrust, highTrust]).id).toBe('high-trust');
  });

  it('prefers the lower (better) source priority', () => {
    const highPriority = article({
      id: 'better-priority',
      sourcePriority: 10,
      sourceTrustScore: 0.5,
    });
    const lowPriority = article({
      id: 'worse-priority',
      sourcePriority: 190,
      sourceTrustScore: 0.5,
    });
    expect(selectPrimaryArticle([lowPriority, highPriority]).id).toBe('better-priority');
  });

  it('rewards completeness: a summary and image beat neither, all else equal', () => {
    const complete = article({
      id: 'complete',
      summary: 'A full summary of the story.',
      imageUrl: 'https://example.com/image.jpg',
    });
    const bare = article({ id: 'bare' });
    expect(selectPrimaryArticle([bare, complete]).id).toBe('complete');
  });

  it('breaks a tied score by earliest publishedAt', () => {
    const earlier = article({
      id: 'earlier',
      publishedAt: new Date('2026-01-01T08:00:00Z'),
    });
    const later = article({
      id: 'later',
      publishedAt: new Date('2026-01-01T09:00:00Z'),
    });
    expect(selectPrimaryArticle([later, earlier]).id).toBe('earlier');
  });

  it('breaks a fully tied score+time by lexicographically smaller id, deterministically', () => {
    const a = article({ id: 'aaa' });
    const b = article({ id: 'bbb' });
    expect(selectPrimaryArticle([b, a]).id).toBe('aaa');
    expect(selectPrimaryArticle([a, b]).id).toBe('aaa');
  });

  it('lets strong completeness overcome a modest trust-score disadvantage', () => {
    const strongTrustBareContent = article({
      id: 'strong-trust-bare',
      sourceTrustScore: 0.6,
      sourcePriority: 100,
    });
    const weakerTrustFullContent = article({
      id: 'weaker-trust-full',
      sourceTrustScore: 0.5,
      sourcePriority: 100,
      summary: 'A full summary of the story.',
      imageUrl: 'https://example.com/image.jpg',
    });
    // trust delta 0.1 * weight 2 = 0.2 points; completeness = 0.6 + 0.4 = 1.0 points.
    expect(selectPrimaryArticle([strongTrustBareContent, weakerTrustFullContent]).id).toBe(
      'weaker-trust-full',
    );
  });
});
