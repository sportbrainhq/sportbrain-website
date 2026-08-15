import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/env';

/**
 * robots.txt, generated at build time.
 *
 * Non-production origins are disallowed wholesale so that staging and preview
 * deployments cannot be indexed and compete with the real site for the same
 * content.
 */
export default function robots(): MetadataRoute.Robots {
  const isProduction = process.env.NODE_ENV === 'production' && !siteUrl.includes('localhost');

  if (!isProduction) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Search result pages are thin, near-duplicate and infinite in
        // combination. They are for users, not crawlers.
        disallow: ['/api/', '/search'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
