import Link from 'next/link';
import type { Metadata } from 'next';
import { Container } from '@/components/layout/container';
import { NewsletterSubscribe } from '@/components/newsletter/newsletter-subscribe';
import { fetchNewsletterIssues } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';
import { FOOTER_CTA, HERO, WHAT_YOU_GET } from './content';

const DESCRIPTION =
  'The Monday Brief: the week in sport, explained. One email every Monday, no spam, unsubscribe anytime.';

export const metadata: Metadata = buildMetadata({
  title: 'The Monday Brief',
  description: DESCRIPTION,
  path: '/newsletter',
});

export default async function NewsletterPage() {
  // Latest 5 published issues: the first is the "Sample Issue", the rest
  // back the "Past issues" preview list — one request covers both sections,
  // rather than a separate call for "just the latest one". Never fails the
  // page: an archive fetch failure here falls back to the same coming-soon
  // copy D1 shipped with, exactly as if no issues existed yet.
  let issues: Awaited<ReturnType<typeof fetchNewsletterIssues>>['data'] = [];
  try {
    issues = (await fetchNewsletterIssues({ page: 1, limit: 5 })).data;
  } catch {
    issues = [];
  }
  const [sampleIssue, ...restIssues] = issues;

  return (
    <>
      {/* Hero */}
      <Container className="py-16 sm:py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-bold tracking-widest text-muted-foreground">{HERO.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{HERO.headline}</h1>
          <p className="mt-5 text-lg text-muted-foreground">{HERO.body}</p>

          <div className="mt-8 rounded-lg border border-border bg-card p-6 sm:p-8">
            <NewsletterSubscribe source="NEWSLETTER_PAGE" />
          </div>
        </div>
      </Container>

      {/* What you'll get */}
      <Container className="pb-16 sm:pb-20">
        <h2 className="text-2xl font-black tracking-tight sm:text-3xl">What you&apos;ll get</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WHAT_YOU_GET.map((section) => (
            <div key={section.title} className="rounded-lg border border-border bg-card p-5">
              <h3 className="font-semibold">{section.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{section.description}</p>
            </div>
          ))}
        </div>
      </Container>

      {/* Sample issue */}
      <Container className="pb-16 sm:pb-20">
        <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Sample issue</h2>
        {sampleIssue ? (
          <Link
            href={`/newsletter/${sampleIssue.slug}`}
            className="mt-6 block rounded-lg border border-border bg-card p-6 transition-colors hover:bg-card/70 sm:p-8"
          >
            <p className="text-xs font-semibold text-muted-foreground">
              Issue #{sampleIssue.issueNumber} &middot;{' '}
              {new Date(sampleIssue.issueDate).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
            <h3 className="mt-1 text-lg font-bold tracking-tight">{sampleIssue.title}</h3>
            <p className="mt-2 text-sm font-semibold text-primary">Read it &rarr;</p>
          </Link>
        ) : (
          <div className="mt-6 rounded-lg border border-dashed border-border bg-card/50 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              The first Monday Brief is coming soon. Subscribe above and it&apos;ll land straight in
              your inbox.
            </p>
          </div>
        )}
      </Container>

      {/* Archive preview */}
      <Container className="pb-16 sm:pb-20">
        <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Past issues</h2>
        {restIssues.length > 0 ? (
          <>
            <ul className="mt-6 divide-y divide-border rounded-lg border border-border bg-card">
              {restIssues.map((issue) => (
                <li key={issue.id}>
                  <Link href={`/newsletter/${issue.slug}`} className="block p-4 hover:bg-card/70">
                    <p className="text-xs text-muted-foreground">Issue #{issue.issueNumber}</p>
                    <p className="mt-0.5 font-semibold">{issue.title}</p>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/newsletter/archive"
              className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
            >
              View the full archive &rarr;
            </Link>
          </>
        ) : (
          <div className="mt-6 rounded-lg border border-dashed border-border bg-card/50 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No issues have been sent yet — check back after the first Monday Brief goes out.
            </p>
          </div>
        )}
      </Container>

      {/* Footer CTA */}
      <Container className="pb-20 sm:pb-24">
        <div className="rounded-lg border border-border bg-card p-8 text-center sm:p-12">
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">{FOOTER_CTA.headline}</h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">{FOOTER_CTA.body}</p>
          <div className="mx-auto mt-6 max-w-sm text-left">
            <NewsletterSubscribe source="NEWSLETTER_PAGE" />
          </div>
        </div>
      </Container>
    </>
  );
}
