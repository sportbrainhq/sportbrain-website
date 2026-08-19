import Link from 'next/link';
import type { PaginationMeta } from '@sportbrain/contracts';

/** Shared chrome for the three list pages: heading, count, and pagination. */
export function EntityListShell({
  title,
  pagination,
  basePath,
  toolbar,
  children,
}: {
  title: string;
  pagination: PaginationMeta;
  /** May already carry a query string; pagination appends to it correctly. */
  basePath: string;
  /** Filters or other controls, shown under the heading. */
  toolbar?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{title}</h1>
        <p className="text-sm text-muted-foreground">
          {pagination.total.toLocaleString('en-GB')} total
        </p>
      </header>

      {toolbar}

      {pagination.total === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Nothing here yet.
        </p>
      ) : (
        <>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{children}</div>
          <Pagination pagination={pagination} basePath={basePath} />
        </>
      )}
    </div>
  );
}

/**
 * Page links.
 *
 * Real anchors rather than buttons, so a page is a URL: shareable, indexable by
 * a crawler, and navigable without JavaScript. That matters for an SEO-critical
 * site more than the interaction polish a client component would add.
 */
function Pagination({ pagination, basePath }: { pagination: PaginationMeta; basePath: string }) {
  if (pagination.totalPages <= 1) return null;

  const { page, totalPages } = pagination;

  // `?` only when the base path does not already have one. A filtered list
  // passes "…/teams?kind=club", and appending "?page=2" to that produces a URL
  // with two query strings, which drops the filter on every page after the
  // first.
  const href = (target: number) => `${basePath}${basePath.includes('?') ? '&' : '?'}page=${target}`;

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between border-t border-border pt-4 text-sm"
    >
      {page > 1 ? (
        <Link href={href(page - 1)} className="font-medium hover:underline" rel="prev">
          ← Previous
        </Link>
      ) : (
        <span aria-hidden />
      )}

      <span className="text-muted-foreground">
        Page {page} of {totalPages.toLocaleString('en-GB')}
      </span>

      {pagination.hasMore ? (
        <Link href={href(page + 1)} className="font-medium hover:underline" rel="next">
          Next →
        </Link>
      ) : (
        <span aria-hidden />
      )}
    </nav>
  );
}
