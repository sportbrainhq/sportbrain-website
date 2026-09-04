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

/**
 * Fact keys that state a present-tense club affiliation.
 *
 * `country` is deliberately absent: a cricketer's country is the fact their
 * profile is built on and survives suppression, while the club does not.
 */
const CURRENT_CLUB_KEYS = new Set(['current_club', 'currentclub', 'club']);

/** Ingested facts, grouped by category. */
export function FactPanel({
  facts,
  suppressCurrentClub = false,
}: {
  facts: EntityProfile['facts'];
  /**
   * Drops the current-club fact.
   *
   * Set for a retired competitor, because the provider records the last club a
   * person played for and the page presented it as present tense: Zidane's
   * profile read "Current club: Juventus FC", a club he left in 2001, and the
   * club history immediately below it said so. The history is the honest
   * rendering of the same fact.
   */
  suppressCurrentClub?: boolean;
}) {
  // Every key that names the club a person turns out for. Three of them,
  // because the fact arrives from three infobox fields and dropping only
  // `current_club` left a cricketer's page showing the same claim under
  // "Club": the heading changed and the arbitrariness did not.
  const visible = suppressCurrentClub
    ? facts.filter((fact) => !CURRENT_CLUB_KEYS.has(fact.key))
    : facts;

  if (visible.length === 0) return null;

  const byCategory = new Map<string, typeof visible>();
  for (const fact of visible) {
    byCategory.set(fact.category, [...(byCategory.get(fact.category) ?? []), fact]);
  }

  // The `career` category is mixed: it holds the current club, but also the
  // draft, the career start and end, and the person's country. Labelling the
  // whole block "Current club" was therefore wrong far more often than it was
  // right. LeBron James's block carried a career start, a draft year and the
  // team that drafted him in 2003, under a heading claiming to name the club he
  // plays for now, which is a different team.
  //
  // So the heading is chosen from what the block actually contains rather than
  // fixed: it names the club only when a club fact is present and nothing else
  // is, and otherwise says "Career", which covers the draft and the dates.
  const careerFacts = byCategory.get('career') ?? [];
  // "Current club" is only honest when the block is nothing but the club.
  const onlyClub =
    careerFacts.length > 0 && careerFacts.every((fact) => CURRENT_CLUB_KEYS.has(fact.key));

  const headings: Record<string, string> = {
    identity: 'Identity',
    people: 'Key people',
    venue: 'Home',
    commercial: 'Club',
    profile: 'Profile',
    // Named explicitly, because the fallback rendered the raw category and a
    // player's page carried two headings called "Career": this block and the
    // club history below it. "Career details" distinguishes the two while
    // staying honest about the mixture.
    career: !suppressCurrentClub && onlyClub ? 'Current club' : 'Career details',
    // The UFC's current champion per weight class, one fact per division.
    titles: 'Current champions',
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

      {/* Every entry is rendered, inside a scrolling box rather than cut off at
          a fixed count. These tables used to stop at fifteen rows, which was
          fine while they were open-ended leaderboards and wrong once they
          became complete records: the World Cup roll of honour holds 23
          champions, and truncating it silently dropped the first eight
          tournaments, Uruguay's 1930 title among them. A reader could not tell
          the difference between a list that ended and a list that was cut. */}
      <div className="scrollbar-thin max-h-[30rem] overflow-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <tbody>
            {ranking.entries.map((entry) => (
              <tr
                key={`${entry.rank}-${entry.name}`}
                className="border-b border-border last:border-0"
              >
                <td className="w-10 px-3 py-2 text-right font-mono text-xs tabular-nums text-muted-foreground">
                  {entry.rank}
                </td>
                {/* Linked only where the row resolved to a page we hold. A
                    roll of honour names teams and a scorers table names
                    players, so either kind of slug may be set; the rest stay
                    plain text rather than becoming links to a 404, which is
                    why the slug is resolved server-side instead of guessed
                    from the name here. */}
                <td className="px-3 py-2 font-medium">
                  {sportSlug && (entry.playerSlug || entry.teamSlug) ? (
                    <Link
                      href={
                        entry.playerSlug
                          ? `/sports/${sportSlug}/players/${entry.playerSlug}`
                          : `/sports/${sportSlug}/teams/${entry.teamSlug}`
                      }
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
