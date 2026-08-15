import type { Metadata } from 'next';
import { siteUrl } from './env';

/**
 * Metadata construction for the site.
 *
 * A single builder rather than hand-written metadata per page, because the
 * parts that are easy to forget (canonical URL, Open Graph image, absolute
 * URLs) are exactly the parts that matter for search and for link previews.
 *
 * Entity-specific metadata belongs with its entity, once entities exist. This
 * file stays domain-agnostic.
 */

export const SITE_NAME = 'SportBrainHQ';
export const SITE_TAGLINE = 'Sports intelligence, explained';
export const DEFAULT_DESCRIPTION =
  'SportBrainHQ explores the stories, records and moments that shaped sport, across cricket, football, basketball, tennis, Formula 1 and more.';

const DEFAULT_OG_IMAGE = {
  url: '/og-default.png',
  width: 1200,
  height: 630,
  alt: SITE_NAME,
};

export interface PageMetadataInput {
  title: string;
  description?: string;
  /** Site-root-relative, e.g. `/sports/cricket`. Becomes the canonical URL. */
  path?: string;
  image?: { url: string; width: number; height: number; alt: string };
  /** Set for articles. Emits `article:published_time`. */
  publishedTime?: string;
  modifiedTime?: string;
  /** Keeps a page out of the index. Use for search results and filtered views. */
  noIndex?: boolean;
}

/** Builds a complete Metadata object for a page. */
export function buildMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  image = DEFAULT_OG_IMAGE,
  publishedTime,
  modifiedTime,
  noIndex = false,
}: PageMetadataInput): Metadata {
  const canonical = new URL(path, siteUrl).toString();

  return {
    title,
    description,
    alternates: { canonical },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
        },
    openGraph: {
      type: publishedTime ? 'article' : 'website',
      siteName: SITE_NAME,
      title,
      description,
      url: canonical,
      images: [image],
      locale: 'en_GB',
      ...(publishedTime ? { publishedTime, modifiedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image.url],
    },
  };
}

/**
 * JSON-LD for the site itself, rendered once in the root layout.
 *
 * The `SearchAction` is what lets a search engine offer a sitelinks search box.
 * It points at a route that does not exist yet, which is harmless: it is only
 * honoured once the route responds.
 */
export function websiteJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${siteUrl}/search?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Serialises JSON-LD for embedding in a script tag.
 *
 * `<` is escaped because an unescaped `</script>` inside the payload would
 * close the tag early and turn structured data into an XSS vector. This
 * matters now rather than later, because entity data will eventually flow
 * through here.
 */
export function jsonLdScript(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
