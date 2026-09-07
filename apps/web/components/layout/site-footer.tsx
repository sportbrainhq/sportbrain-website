import { Container } from './container';
import { NewsletterSubscribe } from '@/components/newsletter/newsletter-subscribe';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/seo';

/**
 * Global site footer. The newsletter sign-up is the one piece of client
 * JavaScript on an otherwise server component, isolated to its own
 * `'use client'` component so the footer itself stays server-rendered.
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
            <p>
              © {new Date().getFullYear()} {SITE_NAME}
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
