import Link from 'next/link';
import type { Highlight } from '@sportbrain/contracts';

/**
 * The discovery rail: generated cards that lead into the catalogue.
 *
 * Not a news feed, and deliberately not dressed as one. Every card states a
 * fact we hold and links to the entity it describes, because no free news API
 * permits commercial use and a fake feed would be worse than an honest one.
 * The heading says so plainly.
 */
export function HighlightRail({ highlights }: { highlights: Highlight[] }) {
  if (highlights.length === 0) return null;

  const labels: Record<string, string> = {
    record: 'Record',
    honour: 'Honour',
    milestone: 'Career',
    entity: 'Profile',
  };

  return (
    <aside className="space-y-3" aria-label="From the archive">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          From the archive
        </h2>
      </div>

      <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
        {highlights.map((highlight, index) => (
          <li key={`${highlight.kind}-${highlight.id}`}>
            <Link
              href={highlight.href}
              className="flex gap-3 px-3 py-2.5 transition-colors hover:bg-muted/60"
            >
              <span className="w-5 shrink-0 pt-0.5 font-mono text-2xs tabular-nums text-muted-foreground">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium leading-snug">{highlight.title}</span>
                {highlight.subtitle && (
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {highlight.subtitle}
                  </span>
                )}
                <span className="mt-1 flex items-center gap-1.5 text-2xs uppercase tracking-wide text-muted-foreground">
                  <span className="font-medium text-foreground/70">{highlight.sportName}</span>
                  <span aria-hidden>·</span>
                  <span>{labels[highlight.kind] ?? highlight.kind}</span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Stated rather than implied. A visitor should not have to guess whether
          these are news items or generated from our own catalogue. */}
      <p className="px-1 text-2xs text-muted-foreground">
        Generated from records and honours in the SportBrainHQ archive.
      </p>
    </aside>
  );
}
