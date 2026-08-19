import Link from 'next/link';
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
  activeSection?: string;
}

interface Section {
  slug: string;
  label: string;
  /** Hidden when the sport's traits say the concept does not apply. */
  requiresTeams?: boolean;
}

const SECTIONS: Section[] = [
  { slug: '', label: 'Overview' },
  { slug: 'explainers', label: 'Explainers' },
  { slug: 'teams', label: 'Teams', requiresTeams: true },
  { slug: 'players', label: 'Players' },
  { slug: 'competitions', label: 'Competitions' },
  { slug: 'quiz', label: 'Quiz' },
  { slug: 'stories', label: 'Social Media Stories' },
];

export function SportSidebar({ sports, activeSport, activeSection }: SportSidebarProps) {
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
                    const current = (activeSection ?? '') === section.slug;

                    return (
                      <li key={section.slug || 'overview'}>
                        <Link
                          href={href}
                          className={`block rounded-md px-2 py-1 transition-colors ${
                            current
                              ? 'font-medium text-foreground'
                              : 'text-muted-foreground hover:text-foreground'
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
