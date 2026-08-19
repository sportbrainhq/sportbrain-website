import Link from 'next/link';
import type {
  ContentSource,
  EntityFact,
  GoverningBody,
  OverviewSection,
  TimelineEvent,
} from '@sportbrain/contracts';

/**
 * Overview primitives.
 *
 * Built as a set of small, sport-agnostic components rather than one football
 * page, because football is the first of five. Nothing here knows what sport it
 * is rendering: the content is data, the components are layout.
 *
 * The visual register is editorial rather than dashboard. Thin rules, generous
 * whitespace, restrained type, and no coloured cards competing for attention.
 */

/** Prose. Markdown-lite, rendered without raw HTML. */
export function EditorialSection({ section }: { section: OverviewSection }) {
  return (
    <section>
      <h2 className="text-xl font-bold tracking-tight">{section.heading}</h2>
      <div className="mt-3 max-w-2xl space-y-4 leading-relaxed text-foreground/90">
        {section.body.split(/\n\n+/).map((paragraph, index) => (
          <p key={index}>{renderInline(paragraph)}</p>
        ))}
      </div>
    </section>
  );
}

/**
 * Bold and italic without injecting HTML.
 *
 * Authored content is destined for an editing pipeline, and stored XSS from
 * such a pipeline is the likeliest serious vulnerability for a content site.
 * Splitting into React elements means nothing in the source can become markup.
 */
function renderInline(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={index} className="font-semibold">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
}

/**
 * Quick facts, as a definition list rather than a table.
 *
 * A table of a dozen rows reads as a data dump; a two-column list of labelled
 * values reads as an introduction, which is what this is.
 */
export function QuickFacts({ facts }: { facts: EntityFact[] }) {
  if (facts.length === 0) return null;

  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-3 border-y border-border py-5 sm:grid-cols-2">
      {facts.map((fact) => (
        <div key={`${fact.key}-${fact.value}`} className="flex gap-3 text-sm">
          <dt className="w-36 shrink-0 text-muted-foreground">{fact.label}</dt>
          <dd className="min-w-0 font-medium">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * The history timeline.
 *
 * A single continuous rule with dated entries hanging off it, rather than a row
 * of cards: history is sequential and the layout should say so.
 *
 * `certainty` is surfaced rather than hidden. Football's predecessors cannot be
 * dated precisely, and a timeline that presents an approximate date in the same
 * weight as a documented one is quietly misleading.
 */
export function HistoryTimeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) return null;

  return (
    <ol className="relative space-y-6 border-l border-border pl-6">
      {events.map((event) => (
        <li key={event.id} className="relative">
          <span
            aria-hidden
            className="absolute -left-[1.6875rem] top-1.5 size-2 rounded-full bg-foreground/30 ring-4 ring-background"
          />
          <div className="flex flex-wrap items-baseline gap-x-3">
            <span className="font-mono text-sm font-semibold tabular-nums">
              {event.year}
              {event.endYear ? `–${event.endYear}` : ''}
            </span>
            {event.certainty !== 'established' && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-2xs uppercase tracking-wide text-muted-foreground">
                {event.certainty}
              </span>
            )}
          </div>
          <h3 className="mt-1 font-semibold">{event.title}</h3>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {event.shortDescription}
          </p>
        </li>
      ))}
    </ol>
  );
}

/** The condensed strip, derived from the same rows the full timeline uses. */
export function MilestoneStrip({ events }: { events: TimelineEvent[] }) {
  const milestones = events.filter((event) => event.isMajorMilestone);
  if (milestones.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <ol className="flex min-w-max gap-px bg-border">
        {milestones.map((event) => (
          <li key={event.id} className="min-w-[9rem] flex-1 bg-card px-4 py-3">
            <span className="block font-mono text-sm font-bold tabular-nums">{event.year}</span>
            <span className="mt-1 block text-xs leading-snug text-muted-foreground">
              {event.title}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * The governance hierarchy.
 *
 * Rendered from the nested structure the API returns, so the world body and its
 * confederations keep their relationship rather than being flattened into a
 * list that implies they are peers.
 */
export function GovernanceHierarchy({ bodies }: { bodies: GoverningBody[] }) {
  if (bodies.length === 0) return null;

  return (
    <div className="space-y-6">
      {bodies.map((world) => (
        <div key={world.id}>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-wrap items-baseline gap-x-3">
              <h3 className="text-lg font-bold">{world.shortName}</h3>
              <span className="text-sm text-muted-foreground">{world.name}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {[
                world.foundedYear && `Founded ${world.foundedYear}`,
                world.memberCount && `${world.memberCount} member associations`,
                world.headquarters,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>

          {world.children.length > 0 && (
            <>
              <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Continental confederations
              </p>
              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {(world.children as GoverningBody[]).map((confederation) => (
                  <li
                    key={confederation.id}
                    className="rounded-lg border border-border bg-card p-3"
                  >
                    <span className="block font-semibold">{confederation.shortName}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {confederation.region}
                    </span>
                    <span className="mt-1.5 block text-xs text-muted-foreground">
                      {[
                        confederation.foundedYear,
                        confederation.memberCount && `${confederation.memberCount} members`,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

/** Internal navigation. The call to action matters more than any count. */
export function ExploreCards({ sportSlug, sportName }: { sportSlug: string; sportName: string }) {
  const destinations = [
    { label: 'Teams', hint: 'Clubs and national sides', href: `/sports/${sportSlug}/teams` },
    { label: 'Players', hint: 'Careers and statistics', href: `/sports/${sportSlug}/players` },
    {
      label: 'Competitions',
      hint: 'Leagues, cups and tournaments',
      href: `/sports/${sportSlug}/competitions`,
    },
    { label: 'Explainers', hint: 'How the game works', href: `/sports/${sportSlug}/explainers` },
  ];

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {destinations.map((destination) => (
        <Link
          key={destination.label}
          href={destination.href}
          className="group flex items-baseline justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-foreground/20 hover:bg-muted/50"
        >
          <span>
            <span className="block font-semibold">{destination.label}</span>
            <span className="block text-xs text-muted-foreground">{destination.hint}</span>
          </span>
          <span
            aria-hidden
            className="text-muted-foreground transition-transform group-hover:translate-x-0.5"
          >
            →
          </span>
        </Link>
      ))}
      <span className="sr-only">Browse {sportName}</span>
    </div>
  );
}

/**
 * Provenance, folded away.
 *
 * Every fact on the page is sourced, and a reader who wants to check can, but
 * citations threaded through the prose would wreck it. A closed disclosure at
 * the foot is the compromise.
 */
export function SourceList({ sources }: { sources: ContentSource[] }) {
  if (sources.length === 0) return null;

  return (
    <details className="rounded-lg border border-border bg-card px-4 py-3">
      <summary className="cursor-pointer text-sm font-medium">About this information</summary>
      <div className="mt-3 space-y-2 text-xs text-muted-foreground">
        <p>
          Facts and dates on this page are drawn from the sources below and rewritten in
          SportBrainHQ&rsquo;s own words. Where sources disagree on a date, the entry is marked as
          approximate or disputed rather than presented as settled.
        </p>
        <ul className="space-y-1">
          {sources.map((source) => (
            <li key={source.id}>
              <a
                href={source.url}
                rel="noopener noreferrer nofollow"
                target="_blank"
                className="hover:underline"
              >
                {source.title}
              </a>
              <span className="ml-1.5">
                ({source.provider}
                {source.license ? `, ${source.license}` : ''})
              </span>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
