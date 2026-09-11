import Link from 'next/link';
import type { Metadata } from 'next';
import { Container } from '@/components/layout/container';
import { unsubscribeFromNewsletter } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Unsubscribed',
  noIndex: true,
});

interface UnsubscribePageProps {
  params: Promise<{ token: string }>;
}

/**
 * The no-login unsubscribe link mailed with every send. A Server Component
 * that calls the unsubscribe endpoint on render rather than a client-side
 * effect: the token is single-purpose and the action should complete before
 * the page paints, not after a hydration round trip.
 *
 * Always renders the same "you're unsubscribed" copy even for an
 * already-consumed or unrecognised token — see
 * `NewsletterController.unsubscribe`'s reasoning for why this stays a 200
 * either way, so a link clicked twice from an old email never looks broken.
 */
export default async function UnsubscribePage({ params }: UnsubscribePageProps) {
  const { token } = await params;

  try {
    await unsubscribeFromNewsletter(token);
  } catch {
    // Network/API failure: still show the reassuring copy rather than an
    // error page — an unsubscribe link that appears broken is worse than one
    // that silently no-ops, since the reader's actual intent (stop emailing
    // me) is already understood regardless of what the API returned.
  }

  return (
    <Container className="py-20 sm:py-28">
      <div className="mx-auto max-w-md text-center">
        <p className="text-xs font-bold tracking-widest text-muted-foreground">THE MONDAY BRIEF</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
          YOU&apos;RE UNSUBSCRIBED
        </h1>
        <p className="mt-4 text-muted-foreground">
          You won&apos;t receive The Monday Brief anymore. Changed your mind?
        </p>
        <Link
          href="/newsletter"
          className="mt-6 inline-block rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
        >
          Resubscribe
        </Link>
      </div>
    </Container>
  );
}
