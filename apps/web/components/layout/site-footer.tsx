import Link from 'next/link';
import { Container } from './container';
import { NewsletterSubscribe } from '@/components/newsletter/newsletter-subscribe';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/seo';

/**
 * Global site footer. The newsletter sign-up is the one piece of client
 * JavaScript on an otherwise server component, isolated to its own
 * `'use client'` component so the footer itself stays server-rendered.
 *
 * "Newsletter Archive" (Phase D7) links out from here so the public archive
 * is reachable from every page, not only from `/newsletter` itself.
 */
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border py-10">
      <Container>
        <div className="flex flex-col gap-8">
          <NewsletterSubscribe source="FOOTER" className="max-w-sm" />
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
