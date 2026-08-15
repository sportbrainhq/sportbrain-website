'use client';

import { useEffect } from 'react';
import { Container } from '@/components/layout/container';

/**
 * Route-level error boundary.
 *
 * Must be a client component: React error boundaries rely on component state,
 * which server components do not have.
 *
 * `error.message` is never rendered. In production Next.js replaces it with a
 * generic string anyway, but relying on that would mean a development build
 * leaking internals if this component were ever server-rendered elsewhere.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // The extension point for error reporting (Sentry and similar). The digest
    // correlates this render with the full server-side log entry.
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Route error:', error);
    }
  }, [error]);

  return (
    <Container className="py-24">
      <div className="max-w-lg">
        <h1 className="text-3xl font-bold tracking-tight">Something went wrong</h1>
        <p className="mt-4 text-muted-foreground">
          This page failed to load. Try again, and if it keeps happening the problem is on our side.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-xs text-muted-foreground">Reference: {error.digest}</p>
        )}
        <button
          type="button"
          onClick={reset}
          className="mt-8 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Try again
        </button>
      </div>
    </Container>
  );
}
