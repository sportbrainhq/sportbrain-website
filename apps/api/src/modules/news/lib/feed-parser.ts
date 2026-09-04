import { Logger } from '@nestjs/common';
import { XMLParser } from 'fast-xml-parser';

/**
 * RSS 2.0 / Atom parsing, internal to the News Engine's ingestion pipeline.
 *
 * `RawFeedItem` is deliberately not part of `@sportbrain/contracts`: it is
 * the shape a feed's own XML happens to produce, before
 * `lib/feed-adapter.ts` normalises it into something the rest of the app can
 * treat uniformly. Exporting it outside this module's ingestion internals
 * would leak "the feed's own item shape" past the boundary the schema's own
 * doc comment (`news.schema.ts`) draws at `news_feed_fetches`.
 *
 * Uses `fast-xml-parser`: it is a small, dependency-free, actively
 * maintained XML→object parser (no native bindings, no DOM), which is the
 * right size for "parse a feed into a plain object and read known fields"
 * rather than pulling in a full DOM implementation (e.g. jsdom/xmldom) that
 * would bring a much larger dependency surface for a need this narrow.
 *
 * Never throws. A malformed document, or a malformed individual item, is
 * reported in `warnings`/`errors` and excluded, so one bad `<item>` cannot
 * take down parsing of the rest of the feed.
 */

export interface RawFeedItem {
  guid?: string;
  title?: string;
  description?: string;
  content?: string;
  link?: string;
  author?: string;
  publishedAt?: Date;
  categories?: string[];
  imageUrl?: string;
}

export interface FeedParseResult {
  items: RawFeedItem[];
  warnings: string[];
  format: 'rss' | 'atom' | 'unknown';
}

const logger = new Logger('FeedParser');

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  trimValues: true,
  // A feed can repeat an element (multiple <category>, multiple
  // <media:content>); without this, fast-xml-parser collapses a single
  // occurrence into a scalar and a repeated one into an array, which forces
  // every read site to defensively branch. Declaring these always-array
  // keeps every read site simple.
  isArray: (name) =>
    ['item', 'entry', 'category', 'media:content', 'enclosure', 'link'].includes(name),
});

export function parseFeed(xml: string): FeedParseResult {
  const warnings: string[] = [];

  let doc: unknown;
  try {
    doc = parser.parse(xml);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn(`Feed XML failed to parse entirely: ${message}`);
    return { items: [], warnings: [`XML parse failed: ${message}`], format: 'unknown' };
  }

  if (!doc || typeof doc !== 'object') {
    return { items: [], warnings: ['Parsed document was not an object'], format: 'unknown' };
  }

  const root = doc as Record<string, unknown>;

  if (root.rss) {
    return parseRss(root.rss as Record<string, unknown>, warnings);
  }
  if (root.feed) {
    return parseAtom(root.feed as Record<string, unknown>, warnings);
  }

  warnings.push('Document root was neither <rss> nor <feed> (Atom)');
  return { items: [], warnings, format: 'unknown' };
}

// ---------------------------------------------------------------------------
// RSS 2.0
// ---------------------------------------------------------------------------

function parseRss(rss: Record<string, unknown>, warnings: string[]): FeedParseResult {
  const channel = asObject(rss.channel);
  if (!channel) {
    warnings.push('RSS document had no <channel>');
    return { items: [], warnings, format: 'rss' };
  }

  const rawItems = asArray(channel.item);
  const items: RawFeedItem[] = [];

  rawItems.forEach((raw, index) => {
    try {
      const item = asObject(raw);
      if (!item) {
        warnings.push(`RSS item at index ${index} was not an object, skipped`);
        return;
      }
      items.push(parseRssItem(item));
    } catch (error) {
      warnings.push(
        `RSS item at index ${index} failed to parse: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  });

  return { items, warnings, format: 'rss' };
}

function parseRssItem(item: Record<string, unknown>): RawFeedItem {
  const guid = textOf(item.guid) ?? undefined;
  const title = textOf(item.title) ?? undefined;
  const description = textOf(item.description) ?? undefined;
  // <content:encoded> is the common RSS extension for full HTML content.
  const content = textOf(item['content:encoded']) ?? undefined;
  // <link> is declared always-array (see the parser's `isArray` config,
  // needed for Atom's repeatable <link rel="..."> elements); RSS 2.0's
  // <link> is a plain text URL, so read the first array element's text.
  const link = textOf(asArray(item.link)[0]) ?? undefined;
  const author = textOf(item.author) ?? textOf(item['dc:creator']) ?? undefined;
  const publishedAt = parseDate(textOf(item.pubDate));

  const categories = asArray(item.category)
    .map((c) => textOf(c))
    .filter((c): c is string => Boolean(c));

  const imageUrl = extractRssImage(item);

  return {
    guid,
    title,
    description,
    content,
    link,
    author,
    publishedAt,
    categories: categories.length > 0 ? categories : undefined,
    imageUrl,
  };
}

function extractRssImage(item: Record<string, unknown>): string | undefined {
  // media:content or media:thumbnail (Media RSS namespace)
  const mediaContent = asArray(item['media:content'])[0];
  const mediaObj = asObject(mediaContent);
  const mediaUrl = mediaObj?.['@_url'];
  if (typeof mediaUrl === 'string') return mediaUrl;

  const mediaThumb = asObject(item['media:thumbnail']);
  const thumbUrl = mediaThumb?.['@_url'];
  if (typeof thumbUrl === 'string') return thumbUrl;

  // <enclosure url="..." type="image/...">
  const enclosures = asArray(item.enclosure);
  for (const enclosure of enclosures) {
    const obj = asObject(enclosure);
    const type = obj?.['@_type'];
    const url = obj?.['@_url'];
    if (typeof url === 'string' && (typeof type !== 'string' || type.startsWith('image/'))) {
      return url;
    }
  }

  return undefined;
}

// ---------------------------------------------------------------------------
// Atom
// ---------------------------------------------------------------------------

function parseAtom(feed: Record<string, unknown>, warnings: string[]): FeedParseResult {
  const rawEntries = asArray(feed.entry);
  const items: RawFeedItem[] = [];

  rawEntries.forEach((raw, index) => {
    try {
      const entry = asObject(raw);
      if (!entry) {
        warnings.push(`Atom entry at index ${index} was not an object, skipped`);
        return;
      }
      items.push(parseAtomEntry(entry));
    } catch (error) {
      warnings.push(
        `Atom entry at index ${index} failed to parse: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  });

  return { items, warnings, format: 'atom' };
}

function parseAtomEntry(entry: Record<string, unknown>): RawFeedItem {
  const guid = textOf(entry.id) ?? undefined;
  const title = textOf(entry.title) ?? undefined;
  const description = textOf(entry.summary) ?? undefined;
  const content = textOf(entry.content) ?? undefined;
  const link = extractAtomLink(entry);
  const author = textOf(asObject(entry.author)?.name) ?? undefined;
  const publishedAt = parseDate(textOf(entry.published) ?? textOf(entry.updated));

  const categories = asArray(entry.category)
    .map((c) => asObject(c)?.['@_term'])
    .filter((c): c is string => typeof c === 'string');

  const imageUrl = extractAtomImage(entry);

  return {
    guid,
    title,
    description,
    content,
    link,
    author,
    publishedAt,
    categories: categories.length > 0 ? categories : undefined,
    imageUrl,
  };
}

function extractAtomLink(entry: Record<string, unknown>): string | undefined {
  const links = asArray(entry.link);
  if (links.length === 0) return undefined;

  // Prefer rel="alternate" (or no rel, which defaults to alternate per the
  // Atom spec); fall back to the first link present.
  const preferred = links.find((l) => {
    const obj = asObject(l);
    const rel = obj?.['@_rel'];
    return rel === undefined || rel === 'alternate';
  });
  const chosen = asObject(preferred) ?? asObject(links[0]);
  const href = chosen?.['@_href'];
  return typeof href === 'string' ? href : undefined;
}

function extractAtomImage(entry: Record<string, unknown>): string | undefined {
  const mediaContent = asArray(entry['media:content'])[0];
  const mediaUrl = asObject(mediaContent)?.['@_url'];
  if (typeof mediaUrl === 'string') return mediaUrl;

  const mediaThumb = asObject(entry['media:thumbnail']);
  const thumbUrl = mediaThumb?.['@_url'];
  if (typeof thumbUrl === 'string') return thumbUrl;

  // Fall back to a link with rel="enclosure" whose type looks like an image.
  const links = asArray(entry.link);
  for (const l of links) {
    const obj = asObject(l);
    if (obj?.['@_rel'] === 'enclosure') {
      const type = obj['@_type'];
      const href = obj['@_href'];
      if (typeof href === 'string' && (typeof type !== 'string' || type.startsWith('image/'))) {
        return href;
      }
    }
  }

  return undefined;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function asObject(value: unknown): Record<string, unknown> | undefined {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  // An empty element (`<item></item>` or self-closing `<item/>`) parses to
  // an empty string rather than an object. Treated as an object with no
  // fields, so a genuinely empty item still counts as one parseable item
  // with every field undefined, rather than being dropped as "not an
  // object" — the missing-field case is exactly the input a real,
  // partially-broken feed produces and must not silently vanish.
  if (value === '') return {};
  return undefined;
}

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null) return [];
  return [value];
}

/** Reads the text content of a node that fast-xml-parser may hand back as a plain string or as `{ '#text': string }`. */
function textOf(value: unknown): string | undefined {
  if (typeof value === 'string') return value.trim().length > 0 ? value.trim() : undefined;
  if (typeof value === 'number') return String(value);
  const obj = asObject(value);
  if (obj && typeof obj['#text'] === 'string') {
    const text = (obj['#text'] as string).trim();
    return text.length > 0 ? text : undefined;
  }
  return undefined;
}

function parseDate(raw: string | undefined): Date | undefined {
  if (!raw) return undefined;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}
