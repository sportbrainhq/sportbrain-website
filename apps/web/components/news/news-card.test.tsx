import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { NewsArticleSummary } from '@sportbrain/contracts';
import { NewsCard } from './news-card';

function buildArticle(overrides: Partial<NewsArticleSummary> = {}): NewsArticleSummary {
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

describe('NewsCard', () => {
  it('always renders the headline', () => {
    render(
      <ul>
        <NewsCard article={buildArticle({ headline: 'A very specific headline' })} />
      </ul>,
    );

    expect(screen.getByText('A very specific headline')).toBeInTheDocument();
  });

  it('omits the summary slot entirely when summary is null', () => {
    const { container } = render(
      <ul>
        <NewsCard article={buildArticle({ summary: null })} />
      </ul>,
    );

    // No placeholder text implying missing data.
    expect(container.textContent).not.toMatch(/no summary/i);
    expect(container.textContent).not.toMatch(/unavailable/i);
  });

  it('renders the summary when permitted by the source', () => {
    render(
      <ul>
        <NewsCard article={buildArticle({ summary: 'A licensed summary of the story.' })} />
      </ul>,
    );

    expect(screen.getByText('A licensed summary of the story.')).toBeInTheDocument();
  });

  it('omits the image slot when imageUrl is null', () => {
    const { container } = render(
      <ul>
        <NewsCard article={buildArticle({ imageUrl: null })} />
      </ul>,
    );

    expect(container.querySelector('img')).toBeNull();
  });

  it('renders the image when permitted by the source', () => {
    const { container } = render(
      <ul>
        <NewsCard article={buildArticle({ imageUrl: 'https://example.com/photo.jpg' })} />
      </ul>,
    );

    expect(container.querySelector('img')).toHaveAttribute('src', 'https://example.com/photo.jpg');
  });

  it('links to the original publisher, opening in a new tab safely', () => {
    render(
      <ul>
        <NewsCard
          article={buildArticle({
            originalUrl: 'https://example.com/story',
            source: { id: 'source-1', name: 'Example Sports', slug: 'example-sports' },
          })}
        />
      </ul>,
    );

    const link = screen.getByRole('link', { name: /read on example sports/i });
    expect(link).toHaveAttribute('href', 'https://example.com/story');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    expect(link).toHaveAttribute('rel', expect.stringContaining('noreferrer'));
  });
});
