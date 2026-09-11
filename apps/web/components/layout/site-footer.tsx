import Link from 'next/link';
import { Container } from './container';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/seo';

/**
 * Global site footer.
 *
 * No newsletter sign-up form here — that lives on `/newsletter` and
 * `/profile/preferences` only. A form repeated on every page read as
 * redundant rather than helpful once the subscribed/unsubscribed states
 * were actually seen in the footer next to another instance of the same
 * form elsewhere on the page.
 *
 * "Newsletter Archive" (Phase D7) still links out from here so the public
 * archive is reachable from every page, not only from `/newsletter` itself.
 */
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border py-10">
      <Container>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              <span className="font-semibold text-foreground">{SITE_NAME}</span>
              {' · '}
              {SITE_TAGLINE}
            </p>
            <Link href="/newsletter/archive" className="hover:underline">
              Newsletter Archive
            </Link>
            <p>
              © {new Date().getFullYear()} {SITE_NAME}
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
