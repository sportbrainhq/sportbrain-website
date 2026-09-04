import Link from 'next/link';
import { Container } from './container';

/**
 * Global site header.
 *
 * A server component with no client JavaScript. The sport list is not rendered
 * here: it lives in the sidebar, where the sport-first navigation belongs, and
 * duplicating it across the top would give two competing ways to do the same
 * thing. The mobile menu is still deferred until there is more to put in it.
 */

interface NavItem {
  href: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact Us' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <Container>
        <div className="flex h-16 items-center justify-between gap-6">
          <Link
            href="/"
            className="flex items-baseline gap-1.5 rounded-sm text-lg font-bold tracking-tight"
          >
            <span>SportBrain</span>
            <span className="rounded-sm bg-primary px-1.5 py-0.5 text-xs font-black text-primary-foreground">
              HQ
            </span>
          </Link>

          {NAV_ITEMS.length > 0 && (
            <nav aria-label="Main navigation">
              <ul className="flex items-center gap-6 text-sm font-medium">
                {NAV_ITEMS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </Container>
    </header>
  );
}
