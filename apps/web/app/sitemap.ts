import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/env';

/**
 * sitemap.xml.
 *
 * Currently lists the one page that exists. It is written as an async function
 * returning a composed list so that adding dynamic entries later is an
 * addition rather than a rewrite:
 *
 *   const [sports, stories] = await Promise.all([fetchSportEntries(), ...]);
 *   return [...staticRoutes, ...sports, ...stories];
 *
 * Two rules for when that happens:
 *
 *   1. Only published entities appear. A sitemap advertising a draft is how
 *      unfinished pages get indexed.
 *   2. Past 50,000 URLs, split into a sitemap index. Next.js supports this via
 *      generateSitemaps().
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  return staticRoutes;
}
