import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { config as loadDotenv } from 'dotenv';
import type { NextConfig } from 'next';

/**
 * Loads the repository-root .env.
 *
 * Next.js reads .env from the app directory only, and the monorepo keeps one
 * shared file at the root. Nothing had noticed because every server variable
 * happened to have a working default, so `API_URL` resolved to localhost and
 * looked configured. `REVALIDATE_SECRET` has no safe default, and the endpoint
 * that needs it refused every request until this was added.
 *
 * The app's own .env still wins: `dotenv` does not overwrite a variable that is
 * already set, and it is loaded first.
 */
for (const candidate of [
  fileURLToPath(new URL('.env', import.meta.url)),
  fileURLToPath(new URL('../../.env', import.meta.url)),
]) {
  if (existsSync(candidate)) loadDotenv({ path: candidate });
}

/**
 * Security headers applied to every response.
 *
 * No Content-Security-Policy yet: a CSP is only meaningful once the real set
 * of script and image sources is known, and a permissive placeholder policy
 * gives false assurance. It is added with the first real content, and it is
 * the primary defence for a site that will render markdown from a content
 * pipeline.
 */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Pins the workspace root to this repository. Without it, Next.js walks up
  // looking for a lockfile and can settle on an unrelated one outside the
  // project, which produces wrong file tracing in the standalone output.
  outputFileTracingRoot: fileURLToPath(new URL('../../', import.meta.url)),

  // Removes the framework fingerprint from responses.
  poweredByHeader: false,

  // Redirects /path/ to /path, so a page is never reachable at two URLs.
  trailingSlash: false,

  typedRoutes: true,

  images: {
    // AVIF first, WebP as the fallback. Next.js picks per request based on
    // the Accept header.
    formats: ['image/avif', 'image/webp'],
    // Remote hosts must be listed explicitly before images can be optimised
    // from them. Empty until a media host is chosen: an open remote pattern
    // would let anyone use this deployment as a free image proxy.
    remotePatterns: [],
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },

  experimental: {
    // Both apps and the shared packages are transpiled from source in the
    // monorepo, so package imports resolve without a prior build step.
    optimizePackageImports: ['@sportbrain/contracts'],
  },

  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
