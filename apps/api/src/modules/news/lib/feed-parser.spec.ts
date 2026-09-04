import { describe, expect, it } from 'vitest';
import { parseFeed } from './feed-parser';

const RSS_FIXTURE = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Example Sports Wire</title>
    <item>
      <title>Team A beats Team B</title>
      <link>https://example.com/story/1?utm_source=feed</link>
      <guid>urn:example:story-1</guid>
      <description>A thrilling match.</description>
      <pubDate>Wed, 01 Jan 2025 12:00:00 GMT</pubDate>
      <category>football</category>
      <category>results</category>
      <media:content url="https://example.com/images/1.jpg" medium="image" />
    </item>
    <item>
      <title>Second story</title>
      <link>https://example.com/story/2</link>
      <guid>urn:example:story-2</guid>
      <description>Another report.</description>
      <pubDate>Thu, 02 Jan 2025 08:30:00 GMT</pubDate>
      <enclosure url="https://example.com/images/2.jpg" type="image/jpeg" />
    </item>
  </channel>
</rss>`;

const ATOM_FIXTURE = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <title>Example Atom Feed</title>
  <entry>
    <id>urn:example:atom-1</id>
    <title>Atom story one</title>
    <link rel="alternate" href="https://example.com/atom/1" />
    <summary>Atom summary.</summary>
    <content>Full atom content.</content>
    <published>2025-01-01T12:00:00Z</published>
    <updated>2025-01-01T13:00:00Z</updated>
    <author><name>Jane Reporter</name></author>
    <category term="tennis" />
    <media:thumbnail url="https://example.com/atom/1.jpg" />
  </entry>
  <entry>
    <id>urn:example:atom-2</id>
    <title>Atom story two</title>
    <link href="https://example.com/atom/2" />
    <updated>2025-01-02T10:00:00Z</updated>
  </entry>
</feed>`;

const MALFORMED_FIXTURE = `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <title>Broken feed</title>
    <item>
      <title>Unclosed tag
      <link>https://example.com/broken</link>
    </item>
`;

const MISSING_FIELDS_FIXTURE = `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <title>Sparse feed</title>
    <item>
    </item>
    <item>
      <title>Only a title</title>
    </item>
  </channel>
</rss>`;

describe('parseFeed', () => {
  it('parses RSS 2.0 items with categories, images and tracked links', () => {
    const result = parseFeed(RSS_FIXTURE);

    expect(result.format).toBe('rss');
    expect(result.items).toHaveLength(2);

    const [first, second] = result.items;
    expect(first?.title).toBe('Team A beats Team B');
    expect(first?.link).toBe('https://example.com/story/1?utm_source=feed');
    expect(first?.guid).toBe('urn:example:story-1');
    expect(first?.description).toBe('A thrilling match.');
    expect(first?.categories).toEqual(['football', 'results']);
    expect(first?.imageUrl).toBe('https://example.com/images/1.jpg');
    expect(first?.publishedAt).toBeInstanceOf(Date);

    expect(second?.imageUrl).toBe('https://example.com/images/2.jpg');
  });

  it('parses Atom entries, preferring rel=alternate links and published over updated', () => {
    const result = parseFeed(ATOM_FIXTURE);

    expect(result.format).toBe('atom');
    expect(result.items).toHaveLength(2);

    const [first, second] = result.items;
    expect(first?.title).toBe('Atom story one');
    expect(first?.link).toBe('https://example.com/atom/1');
    expect(first?.description).toBe('Atom summary.');
    expect(first?.content).toBe('Full atom content.');
    expect(first?.author).toBe('Jane Reporter');
    expect(first?.categories).toEqual(['tennis']);
    expect(first?.imageUrl).toBe('https://example.com/atom/1.jpg');
    expect(first?.publishedAt?.toISOString()).toBe('2025-01-01T12:00:00.000Z');

    // No <published>, falls back to <updated>.
    expect(second?.publishedAt?.toISOString()).toBe('2025-01-02T10:00:00.000Z');
    expect(second?.link).toBe('https://example.com/atom/2');
  });

  it('never throws on malformed XML, and reports a warning', () => {
    expect(() => parseFeed(MALFORMED_FIXTURE)).not.toThrow();
    const result = parseFeed(MALFORMED_FIXTURE);
    expect(Array.isArray(result.items)).toBe(true);
  });

  it('never throws on a document that is not RSS or Atom', () => {
    const result = parseFeed('<not-a-feed><thing/></not-a-feed>');
    expect(result.items).toEqual([]);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('handles items missing most fields without throwing, producing undefined rather than crashing', () => {
    const result = parseFeed(MISSING_FIELDS_FIXTURE);

    expect(result.items).toHaveLength(2);
    expect(result.items[0]?.title).toBeUndefined();
    expect(result.items[0]?.link).toBeUndefined();
    expect(result.items[1]?.title).toBe('Only a title');
    expect(result.items[1]?.link).toBeUndefined();
    expect(result.items[1]?.publishedAt).toBeUndefined();
  });

  it('never throws on empty input', () => {
    expect(() => parseFeed('')).not.toThrow();
    const result = parseFeed('');
    expect(result.items).toEqual([]);
  });
});
