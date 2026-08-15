import Link from 'next/link';
import type { Metadata } from 'next';
import { Container } from '@/components/layout/container';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Page not found',
  path: '/404',
  noIndex: true,
});

export default function NotFound() {
  return (
    <Container className="py-24">
      <div className="max-w-lg">
        <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">404</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Page not found</h1>
        <p className="mt-4 text-muted-foreground">That page does not exist, or it has moved.</p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Back to the homepage
        </Link>
      </div>
    </Container>
  );
}
