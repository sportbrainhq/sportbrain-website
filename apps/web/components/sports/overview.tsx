import Link from 'next/link';
import type {
  ContentSource,
  OverviewEntityRef,
  EntityFact,
  GoverningBody,
  MembershipTier,
  OverviewSection,
  SportConcept,
  SportFormat,
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
        <EditorialSectionBody body={section.body} />
      </div>
    </section>
  );
}

/**
 * A section's paragraphs without its heading or wrapper.
 *
 * Split out so prose can be placed inside a block that already has its own
 * heading, which is what the at-a-glance section does: the facts grid and the
 * paragraph explaining it belong under one heading rather than two.
 */
export function EditorialSectionBody({ body }: { body: string }) {
  return (
    <>
      {body.split(/\n\n+/).map((paragraph, index) => (
        <p key={index}>{renderInline(paragraph)}</p>
      ))}
    </>
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
 * Quick facts.
 *
 * A grid of label-above-value cells rather than side-by-side pairs. Several
 * sports carry facts whose values are a sentence or a list (equipment, venue
 * names, Olympic status); a fixed-width label column beside them squeezed the
 * value into a one-word-per-line ribbon and left rows of wildly different
 * heights. Stacking the label gives every value the full cell width, and one
 * rule under each cell keeps the block reading as a single table.
 */
export function QuickFacts({
  facts,
  categories,
}: {
  facts: EntityFact[];
  /**
   * Render only these categories, in this order.
   *
   * Omitted renders everything, which is what football and cricket do and what
   * the ingested fact sets need. Basketball authors its facts in two groups and
   * shows them as two separate blocks: the identity strip under the hero, and
   * the "at a glance" grid further down. Filtering here rather than at the API
   * keeps one query serving both.
   */
  categories?: string[];
}) {
  const selected = categories
    ? categories.flatMap((category) => facts.filter((fact) => fact.category === category))
    : facts;
  if (selected.length === 0) return null;

  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-0 border-t border-border sm:grid-cols-2 lg:grid-cols-3">
      {selected.map((fact) => (
        <div key={`${fact.key}-${fact.value}`} className="border-b border-border py-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {fact.label}
          </dt>
          <dd className="mt-1 text-sm leading-relaxed text-balance">{fact.value}</dd>
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
    <div className="scrollbar-thin overflow-x-auto">
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
              {world.memberCount !== null && hasConfederationCounts(world) && (
                <p className="mt-3 max-w-2xl text-xs leading-relaxed text-muted-foreground">
                  Confederation membership sums to more than the world body&rsquo;s total because
                  confederations also admit associate and non-member territories.
                </p>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Whether the children carry counts that a reader could add up.
 *
 * The reconciling note is only shown when both figures are actually on screen,
 * so a sport whose confederations have no member counts does not explain away a
 * discrepancy the reader cannot see.
 */
function hasConfederationCounts(body: GoverningBody): boolean {
  const children = body.children as GoverningBody[];
  const counted = children.filter((child) => child.memberCount !== null);
  if (counted.length !== children.length || counted.length === 0) return false;

  const total = counted.reduce((sum, child) => sum + (child.memberCount ?? 0), 0);
  return total !== body.memberCount;
}

/** Internal navigation. The call to action matters more than any count. */
export function ExploreCards({ sportSlug, sportName }: { sportSlug: string; sportName: string }) {
  const destinations = [
    // "Clubs and national sides" was football's vocabulary and understates a
    // sport whose teams also include states, counties and franchises. Kept
    // general rather than enumerated per sport: the Teams tab's own filters
    // name the kinds it actually holds.
    {
      label: 'Teams',
      hint: 'National sides and domestic teams',
      href: `/sports/${sportSlug}/teams`,
    },
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

/**
 * The format taxonomy.
 *
 * A nested tree rather than a row of cards, because the nesting carries the
 * meaning. Test cricket sits *beneath* multi-day cricket and *beside*
 * first-class cricket, and a flat list of six formats would lose exactly the
 * relationships the section exists to teach.
 *
 * The international/domestic badge is rendered on every leaf that declares one,
 * because it is the field that separates the pairs a reader most often
 * conflates. A grouping node declares null and gets no badge: "limited-overs
 * cricket" is neither international nor domestic, and a badge saying either
 * would be false.
 */
export function FormatTaxonomy({ formats }: { formats: SportFormat[] }) {
  if (formats.length === 0) return null;

  return (
    <div className="space-y-6">
      {formats.map((branch) => (
        <div key={branch.id} className="border-t border-border pt-4">
          <div className="flex flex-wrap items-baseline gap-x-3">
            <h3 className="text-base font-bold">{branch.label}</h3>
            <FormatMetrics format={branch} />
          </div>
          {branch.description && (
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {branch.description}
            </p>
          )}
          {branch.children.length > 0 && (
            <ul className="mt-4 space-y-3 border-l border-border pl-5">
              {(branch.children as SportFormat[]).map((child) => (
                <FormatNode key={child.id} format={child} />
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

/** One format and its children. Recursive: the tree is three deep for cricket. */
function FormatNode({ format }: { format: SportFormat }) {
  return (
    <li>
      <div className="flex flex-wrap items-baseline gap-x-2.5">
        <span className="font-semibold">{format.label}</span>
        {format.isInternational !== null && (
          <span className="rounded-full border border-border px-2 py-0.5 text-2xs uppercase tracking-wide text-muted-foreground">
            {format.isInternational ? 'International' : 'Domestic'}
          </span>
        )}
        <FormatMetrics format={format} />
      </div>
      {format.description && (
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {format.description}
        </p>
      )}
      {format.children.length > 0 && (
        <ul className="mt-3 space-y-3 border-l border-border pl-5">
          {(format.children as SportFormat[]).map((child) => (
            <FormatNode key={child.id} format={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

/**
 * The numbers that distinguish one format from another.
 *
 * Each is omitted when absent rather than shown as a zero or a dash. A Test has
 * no over limit, and printing "0 overs" would be worse than printing nothing.
 */
function FormatMetrics({ format }: { format: SportFormat }) {
  const parts = [
    format.oversPerSide && `${format.oversPerSide} overs`,
    format.inningsPerSide && `${format.inningsPerSide} inn/side`,
    format.maxDays && `up to ${format.maxDays} ${format.maxDays === 1 ? 'day' : 'days'}`,
    format.drawPossible === true && 'draw possible',
  ].filter(Boolean);

  if (parts.length === 0) return null;

  return (
    <span className="font-mono text-2xs tabular-nums text-muted-foreground">
      {parts.join(' · ')}
    </span>
  );
}

/**
 * The vocabulary grid.
 *
 * Each concept links to its Explainer only where the API resolved one, which is
 * what keeps the Overview honest while the Explainer library is still being
 * written: an unresolved concept renders as plain text rather than as a link to
 * a 404.
 *
 * `ambiguityNote` gets its own line and its own weight. A term meaning three
 * things is the single most useful thing an Overview can tell a newcomer, and
 * burying it inside the summary would waste it.
 */
export function ConceptGrid({
  concepts,
  sportSlug,
}: {
  concepts: SportConcept[];
  sportSlug: string;
}) {
  if (concepts.length === 0) return null;

  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-0 border-t border-border sm:grid-cols-2">
      {concepts.map((concept) => (
        <div key={concept.key} className="border-b border-border py-3">
          <dt className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-semibold">{concept.term}</span>
            <span className="text-2xs uppercase tracking-wide text-muted-foreground">
              {concept.category}
            </span>
          </dt>
          <dd className="mt-1 space-y-1.5">
            <p className="text-sm leading-relaxed text-muted-foreground">{concept.summary}</p>
            {concept.ambiguityNote && (
              <p className="border-l-2 border-border pl-3 text-sm leading-relaxed">
                <span className="font-medium">More than one meaning. </span>
                <span className="text-muted-foreground">{concept.ambiguityNote}</span>
              </p>
            )}
            {concept.explainerSlug && (
              <Link
                href={`/sports/${sportSlug}/explainers/${concept.explainerSlug}`}
                className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
              >
                {concept.term} explained
                <span aria-hidden>→</span>
              </Link>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Membership classes of a world governing body.
 *
 * Separate from `GovernanceHierarchy` because a membership class is not a place
 * in the hierarchy: the ICC does not contain a body called "Full Members", it
 * grades its members that way.
 *
 * The as-of date is printed rather than hidden. Membership changes, and four
 * sources consulted while writing this gave four different totals, so a count
 * presented as timeless would be a quiet falsehood. Dating it turns a stale
 * number into a historical fact, which is the honest failure mode.
 */
export function MembershipTiers({ tiers }: { tiers: MembershipTier[] }) {
  if (tiers.length === 0) return null;

  const asOf = tiers[0]?.asOf;

  return (
    <div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {tiers.map((tier) => (
          <li key={tier.tier} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold tabular-nums">{tier.count}</span>
              <span className="font-semibold">{tier.label}</span>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {tier.description}
            </p>
          </li>
        ))}
      </ul>
      {asOf && (
        <p className="mt-3 text-xs text-muted-foreground">
          Membership as recorded by the governing body on {formatAsOf(asOf)}. Boards are admitted,
          suspended and expelled, so these figures change.
        </p>
      )}
    </div>
  );
}

/** ISO date to a readable one, without pulling in a date library. */
function formatAsOf(iso: string): string {
  const parsed = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Featured entities: icons, clubs, competitions.
 *
 * A card links to the canonical entity where one exists and renders as plain
 * text where it does not, which is what `href` on the payload decides. The two
 * look almost identical on purpose: a reader should not be able to tell that
 * our ingestion has a gap, only that some names are clickable.
 *
 * Deliberately name, context and one line only. Everything else about a player
 * or a club belongs on their own page, and repeating it here is how two places
 * end up disagreeing.
 */
export function FeaturedEntities({ entities }: { entities: OverviewEntityRef[] }) {
  if (entities.length === 0) return null;

  return (
    <ul className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
      {entities.map((entity) => {
        const body = (
          <>
            <span className="block font-semibold">{entity.displayName}</span>
            {entity.meta && (
              <span className="mt-0.5 block text-2xs uppercase tracking-wide text-muted-foreground">
                {entity.meta}
              </span>
            )}
            {entity.blurb && (
              <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground">
                {entity.blurb}
              </span>
            )}
          </>
        );

        return (
          <li key={`${entity.section}-${entity.displayName}`} className="bg-card">
            {entity.href ? (
              <Link
                href={entity.href}
                className="block h-full p-4 transition-colors hover:bg-muted/50"
              >
                {body}
              </Link>
            ) : (
              <div className="h-full p-4">{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
