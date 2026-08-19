import Link from 'next/link';
import type { EntityProfile, EntityRanking } from '@sportbrain/contracts';

/**
 * The rich detail on an entity page: facts, authored prose, derived tables.
 *
 * Every section renders only if it has content. Coverage varies enormously
 * between entities even within one sport, so a page has to degrade gracefully
 * rather than leave a row of empty headings: Liverpool has an anthem, a
 * chairman and an owner, while a smaller club may have a name and a country.
 */

/** Ingested facts, grouped by category. */
export function FactPanel({ facts }: { facts: EntityProfile['facts'] }) {
  if (facts.length === 0) return null;

  const byCategory = new Map<string, typeof facts>();
  for (const fact of facts) {
    byCategory.set(fact.category, [...(byCategory.get(fact.category) ?? []), fact]);
  }

  const headings: Record<string, string> = {
    identity: 'Identity',
    people: 'Key people',
    venue: 'Home',
    commercial: 'Club',
    profile: 'Profile',
  };

  return (
    <div className="space-y-6">
      {[...byCategory].map(([category, items]) => (
        <section key={category}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {headings[category] ?? category}
          </h3>
          <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
            {items.map((fact) => (
              <div key={`${fact.key}-${fact.value}`} className="bg-card px-4 py-3">
                <dt className="text-xs text-muted-foreground">{fact.label}</dt>
                <dd className="mt-0.5 font-medium">
                  {fact.value.startsWith('http') ? (
                    <a
                      href={fact.value}
                      rel="noopener noreferrer nofollow"
                      target="_blank"
                      className="break-all hover:underline"
                    >
                      {fact.value.replace(/^https?:\/\//, '')}
                    </a>
                  ) : (
                    fact.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}

/**
 * Authored prose: history, culture, notable eras.
 *
 * The part of the page no provider sells, and the reason to visit rather than
 * read a table elsewhere.
 */
export function SectionPanel({ sections }: { sections: EntityProfile['sections'] }) {
  if (sections.length === 0) return null;

  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <section key={section.kind}>
          <h2 className="mb-3 text-lg font-bold tracking-tight">{section.heading}</h2>
          <div className="max-w-2xl space-y-4 leading-relaxed">
            {section.body.split(/\n\n+/).map((paragraph, index) => (
              <p key={index}>
                {/* Bold is handled by splitting rather than by injecting HTML.
                    This is authored content destined for an editing pipeline,
                    and stored XSS from such a pipeline is the likeliest serious
                    vulnerability for a site like this. */}
                {paragraph.split(/(\*\*[^*]+\*\*)/g).map((part, partIndex) =>
                  part.startsWith('**') && part.endsWith('**') ? (
                    <strong key={partIndex} className="font-semibold">
                      {part.slice(2, -2)}
                    </strong>
                  ) : (
                    part
                  ),
                )}
              </p>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/** Derived leaderboards, each carrying its own confidence. */
export function RankingPanel({
  rankings,
  sportSlug,
}: {
  rankings: EntityProfile['rankings'];
  /** Needed to build player links; without it the rows render as plain text. */
  sportSlug?: string;
}) {
  const populated = rankings.filter((ranking) => ranking.entries.length > 0);
  if (populated.length === 0) return null;

  return (
    <div className="space-y-8">
      {populated.map((ranking) => (
        <RankingTable key={ranking.kind} ranking={ranking} sportSlug={sportSlug} />
      ))}
    </div>
  );
}

function RankingTable({ ranking, sportSlug }: { ranking: EntityRanking; sportSlug?: string }) {
  return (
    <section>
      <div className="mb-2 flex flex-wrap items-baseline gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {ranking.label}
        </h3>
        {/* Confidence is shown, not hidden. Several of these tables are
            aggregated from partial community data and one is known to contain a
            wrong figure; a table that looks authoritative while being a third
            complete misleads a reader who has no way to tell. */}
        {ranking.confidence !== 'high' && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-2xs font-medium uppercase tracking-wide text-muted-foreground">
            {ranking.confidence}
          </span>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <tbody>
            {ranking.entries.slice(0, 15).map((entry) => (
              <tr
                key={`${entry.rank}-${entry.name}`}
                className="border-b border-border last:border-0"
              >
                <td className="w-10 px-3 py-2 text-right font-mono text-xs tabular-nums text-muted-foreground">
                  {entry.rank}
                </td>
                {/* Linked only where the player resolved to a page we hold.
                    The rest stay plain text rather than becoming links to a
                    404, which is why the slug is resolved server-side instead
                    of guessed from the name here. */}
                <td className="px-3 py-2 font-medium">
                  {sportSlug && entry.playerSlug ? (
                    <Link
                      href={`/sports/${sportSlug}/players/${entry.playerSlug}`}
                      className="underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
                    >
                      {entry.name}
                    </Link>
                  ) : (
                    entry.name
                  )}
                </td>
                <td className="px-3 py-2 text-right font-mono tabular-nums">
                  {entry.value ?? '—'}
                </td>
                <td className="hidden px-3 py-2 text-right text-xs text-muted-foreground sm:table-cell">
                  {entry.detail}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {ranking.note && <p className="mt-2 text-xs text-muted-foreground">{ranking.note}</p>}
    </section>
  );
}
