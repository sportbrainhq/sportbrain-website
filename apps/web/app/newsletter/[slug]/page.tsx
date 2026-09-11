import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '@/components/layout/container';
import { NewsletterSubscribe } from '@/components/newsletter/newsletter-subscribe';
import { IssueShareActions } from '@/components/newsletter/issue-share-actions';
import { RenderedIssueView } from '@/components/newsletter/rendered-issue';
import { ApiError, fetchNewsletterIssue } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';
import { siteUrl } from '@/lib/env';

interface IssuePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: IssuePageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { issue } = await fetchNewsletterIssue(slug);
    return buildMetadata({
      title: issue.title,
      description: issue.previewText,
      path: `/newsletter/${slug}`,
      publishedTime: issue.publishedAt,
    });
  } catch {
    return buildMetadata({ title: 'The Monday Brief', path: `/newsletter/${slug}` });
  }
}

/**
 * One published issue (Phase D7, org spec section 48) — renders the exact
 * same `RenderedIssue` view model the admin preview and outgoing email use
 * (see `RenderedIssueView`'s own header). `notFound()` on a 404 covers both
 * "no issue with this slug" and "this issue exists but is not published yet"
 * identically — the API already collapses those into one response (see
 * `NewsletterIssueRepository.findPublishedBySlug`'s own comment), and this
 * page must not be able to tell the two apart either.
 */
export default async function NewsletterIssuePage({ params }: IssuePageProps) {
  const { slug } = await params;

  let detail;
  try {
    detail = await fetchNewsletterIssue(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const { issue, rendered } = detail;
  const canonicalUrl = new URL(`/newsletter/${slug}`, siteUrl).toString();

  return (
    <Container className="py-16 sm:py-20">
      <article className="mx-auto max-w-2xl">
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
          <Link href="/newsletter/archive" className="hover:underline">
            The Monday Brief Archive
          </Link>
        </nav>

        <header className="mt-4 border-b-4 border-foreground pb-6 text-center">
          <p className="text-xs font-bold tracking-widest text-muted-foreground">
            Issue #{rendered.issueNumber} &middot;{' '}
            {new Date(issue.issueDate).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            {rendered.heroTitle}
          </h1>
        </header>

        <div className="mt-10">
          <RenderedIssueView rendered={rendered} />
        </div>

        <div className="mt-12 border-t border-border pt-6">
          <IssueShareActions url={canonicalUrl} title={issue.title} />
        </div>

        <div className="mt-12 rounded-lg border border-border bg-card p-8 text-center">
          <h2 className="text-xl font-black tracking-tight">Get the next one in your inbox</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Every Monday. No spam. Unsubscribe anytime.
          </p>
          <div className="mx-auto mt-6 max-w-sm text-left">
            <NewsletterSubscribe source="ARTICLE" />
          </div>
        </div>
      </article>
    </Container>
  );
}
