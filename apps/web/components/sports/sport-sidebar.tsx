'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Sport } from '@sportbrain/contracts';

/**
 * The sport-first navigation.
 *
 * Every sport opens the same set of sections, which is the organising idea of
 * the site: a visitor learns the shape once and it holds everywhere.
 *
 * Which sections appear is driven by `sport.traits` rather than by a per-sport
 * conditional. Tennis has no teams, so its Teams tab is absent; Formula 1 has
 * constructors, so its is present. The front end asks rather than knows, which
 * is what keeps adding a sport a data change rather than a code change.
 */

interface SportSidebarProps {
  sports: Sport[];
  activeSport?: string;
}

interface Section {
  slug: string;
  label: string;
  /** Hidden when the sport's traits say the concept does not apply. */
  requiresTeams?: boolean;
}

const SECTIONS: Section[] = [
  { slug: '', label: 'Overview' },
  { slug: 'today', label: 'Today' },
  { slug: 'explainers', label: 'Explainers' },
  { slug: 'teams', label: 'Teams', requiresTeams: true },
  { slug: 'players', label: 'Players' },
  { slug: 'competitions', label: 'Competitions' },
  { slug: 'quiz', label: 'Quiz' },
  { slug: 'stories', label: 'Social Media Stories' },
];

/**
 * Reads the active section from the URL rather than taking it as a prop.
 *
 * The layout that renders this is a server component and has no access to the
 * pathname, so the prop it was supposed to pass was never passed and every
 * section link rendered inactive: a reader on the Teams tab had nothing on the
 * page telling them so. Reading the path here is what makes the highlight
 * correct on every route without threading a value through each page.
 */
export function SportSidebar({ sports, activeSport }: SportSidebarProps) {
  const pathname = usePathname() ?? '';

  return (
    <nav aria-label="Sports" className="text-sm">
      <ul className="space-y-1">
        {sports.map((sport) => {
          const isActive = sport.slug === activeSport;
          const sections = SECTIONS.filter(
            (section) => !section.requiresTeams || sport.traits.hasTeams !== false,
          );

          return (
            <li key={sport.id}>
              <Link
                href={`/sports/${sport.slug}`}
                className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 font-medium transition-colors ${
                  isActive
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span
                  aria-hidden
                  className="grid size-6 shrink-0 place-items-center rounded bg-muted text-2xs font-bold uppercase text-muted-foreground"
                >
                  {sport.shortCode}
                </span>
                {sport.name}
              </Link>

              {/* Sections expand only for the sport being viewed. Showing every
                  sport's seven sections at once is a wall of links. */}
              {isActive && (
                <ul className="mt-1 space-y-0.5 border-l border-border pb-2 pl-4 ml-3">
                  {sections.map((section) => {
                    const href = section.slug
                      ? `/sports/${sport.slug}/${section.slug}`
                      : `/sports/${sport.slug}`;
                    // Compared against the path rather than a prefix match, so
                    // a team's detail page keeps Teams highlighted while the
                    // Overview link does not also light up on every subpage.
                    const current = section.slug ? pathname.startsWith(href) : pathname === href;

                    return (
                      <li key={section.slug || 'overview'}>
                        <Link
                          href={href}
                          // A left rule and a filled background, not just a
                          // heavier font. Weight alone was too quiet to read as
                          // "you are here" against the other six links.
                          className={`-ml-px block border-l-2 py-1 pl-3 pr-2 transition-colors ${
                            current
                              ? 'border-foreground bg-muted/60 font-semibold text-foreground'
                              : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                          }`}
                          aria-current={current ? 'page' : undefined}
                        >
                          {section.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
