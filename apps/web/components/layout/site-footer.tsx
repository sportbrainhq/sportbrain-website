import { Container } from './container';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/seo';

/** Global site footer. Server component, no client JavaScript. */
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border py-10">
      <Container>
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
      </Container>
    </footer>
  );
}
