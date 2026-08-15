import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Container } from '@/components/layout/container';
import { PlatformStatus } from '@/components/platform-status';
import { SITE_NAME, SITE_TAGLINE, buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: `${SITE_NAME} — ${SITE_TAGLINE}`,
  path: '/',
});

/**
 * Placeholder homepage.
 *
 * Exists to prove the stack works: routing, layout, tokens, server rendering,
 * the build, and the path from a server component to the API. The real
 * homepage is domain work and is deliberately not started here.
 */
export default function HomePage() {
  return (
    <Container className="py-16 sm:py-24">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Platform foundation
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{SITE_NAME}</h1>

        <p className="mt-4 text-lg text-muted-foreground">
          {SITE_TAGLINE}. This repository holds the web platform: a Next.js site and a NestJS API.
          No product features are built yet.
        </p>

        <div className="mt-10">
          {/* Streamed: the API call must not delay first paint of the content
              above, which is static. */}
          <Suspense
            fallback={
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">Checking API status…</p>
              </div>
            }
          >
            <PlatformStatus />
          </Suspense>
        </div>
      </div>
    </Container>
  );
}
