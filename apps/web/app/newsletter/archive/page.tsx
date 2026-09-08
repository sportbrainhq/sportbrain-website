import Link from 'next/link';
import type { Metadata } from 'next';
import { Container } from '@/components/layout/container';
import { fetchNewsletterIssues } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';

const DESCRIPTION = 'Every Monday Brief we’ve sent, in one place. The week in sport, explained.';

export const metadata: Metadata = buildMetadata({
  title: 'The Monday Brief Archive',
  description: DESCRIPTION,
  path: '/newsletter/archive',
});

interface ArchivePageProps {
  searchParams: Promise<{ page?: string }>;
}

/**
 * Public archive listing (Phase D7, org spec section 47) — every published
 * issue (`publishedAt IS NOT NULL` only, enforced server-side by
 * `NewsletterArchiveService`), newest first, paginated.
 *
 * "The first Monday Brief is coming soon." empty state (org spec section
 * 67) when no issue has been published yet, rather than an empty list or a
 * fabricated placeholder issue.
 */
export default async function NewsletterArchivePage({ searchParams }: ArchivePageProps) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const result = await fetchNewsletterIssues({ page, limit: 20 });

  return (
    <Container className="py-16 sm:py-20">
      <p className="text-xs font-bold tracking-widest text-muted-foreground">THE MONDAY BRIEF</p>
      <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Archive</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{DESCRIPTION}</p>

      {result.data.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-border bg-card/50 p-10 text-center">
          <p className="text-sm text-muted-foreground">The first Monday Brief is coming soon.</p>
          <Link
            href="/newsletter"
            className="mt-4 inline-block rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
          >
            Subscribe to get it first
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-10 divide-y divide-border">
            {result.data.map((issue) => (
              <li key={issue.id} className="py-5">
                <Link href={`/newsletter/${issue.slug}`} className="group block">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Issue #{issue.issueNumber} &middot;{' '}
                    {new Date(issue.issueDate).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <h2 className="mt-1 text-lg font-bold tracking-tight group-hover:underline">
                    {issue.title}
                  </h2>
                </Link>
              </li>
            ))}
          </ul>

          <nav className="mt-8 flex items-center justify-between text-sm">
            {page > 1 ? (
              <Link href={`/newsletter/archive?page=${page - 1}`} className="hover:underline">
                &larr; Newer
              </Link>
            ) : (
              <span />
            )}
            {result.pagination.hasMore && (
              <Link href={`/newsletter/archive?page=${page + 1}`} className="hover:underline">
                Older &rarr;
              </Link>
            )}
          </nav>
        </>
      )}
    </Container>
  );
}
