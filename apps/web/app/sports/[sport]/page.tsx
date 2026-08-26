import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  ConceptGrid,
  EditorialSection,
  EditorialSectionBody,
  ExploreCards,
  FeaturedEntities,
  FormatTaxonomy,
  GovernanceHierarchy,
  HistoryTimeline,
  MembershipTiers,
  MilestoneStrip,
  QuickFacts,
  SourceList,
} from '@/components/sports/overview';
import { ApiError, fetchSportOverview } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sport: string }>;
}): Promise<Metadata> {
  const { sport: slug } = await params;
  try {
    const { sport } = await fetchSportOverview(slug);
    return buildMetadata({
      title: sport.name,
      description:
        sport.summary ??
        `${sport.name}: history, governance, competitions and how the sport works.`,
      path: `/sports/${slug}`,
    });
  } catch {
    // Metadata must never throw: it would fail the whole route before the page
    // has a chance to render its own 404.
    return buildMetadata({ title: 'Sport', path: `/sports/${slug}` });
  }
}

/**
 * A sport's Overview: an encyclopedia entry, not a dashboard.
 *
 * The page answers what the sport is, how it developed, how it works, how it is
 * organised and how it has changed. Entity detail and statistics live in the
 * Teams, Players and Competitions tabs, and the rules in Explainers, so nothing
 * here duplicates them.
 *
 * Sections render only when their content exists. A sport with no timeline
 * shows no timeline rather than an empty heading, which is what lets the same
 * page serve a fully researched sport and a newly added one.
 */
export default async function SportOverviewPage({
  params,
}: {
  params: Promise<{ sport: string }>;
}) {
  const { sport: slug } = await params;

  let overview;
  try {
    overview = await fetchSportOverview(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const {
    sport,
    quickFacts,
    sections,
    history,
    governance,
    formats,
    concepts,
    membership,
    featured,
    sources,
  } = overview;

  // Featured entities arrive as one list and render as three blocks.
  const featuredIn = (section: string) => featured.filter((entity) => entity.section === section);
  const icons = featuredIn('icons');
  const legendaryTeams = featuredIn('teams');
  const featuredCompetitions = featuredIn('competitions');
  const section = (kind: string) => sections.find((entry) => entry.kind === kind);

  const introduction = section('introduction');
  const basics = section('basics');
  const formatsProse = section('formats');
  const competitions = section('competitions');
  const evolution = section('evolution');
  const womens = section('womens');
  const global = section('global');

  // Sections placed explicitly below, in the slot their subject belongs in.
  const historyProse = section('history');
  const glance = section('glance');
  const structure = section('structure');
  const stages = section('stages');
  const eras = section('eras');
  const culture = section('culture');

  /*
   * Everything else the API returned.
   *
   * Authored sections are keyed by an open-ended string rather than an enum, so
   * a sport can carry prose this page has no dedicated slot for. Rendering the
   * remainder in order means new editorial content appears as soon as it is
   * seeded, instead of being silently dropped until somebody adds a branch
   * here. Basketball's league and international-structure sections arrive this
   * way, and football and cricket have no such sections, so nothing about their
   * pages changes.
   */
  const placed = new Set([
    'introduction',
    'basics',
    'formats',
    'competitions',
    'evolution',
    'womens',
    'global',
    'history',
    'glance',
    'structure',
    'stages',
    'eras',
    'culture',
  ]);
  const additional = sections.filter((entry) => !placed.has(entry.kind));

  /*
   * Whether to split the facts into a hero strip and an at-a-glance grid.
   *
   * Only when `identity` and `gameplay` account for *every* fact the sport has.
   * Testing with `.some()` instead was a real bug: cricket carries facts in
   * both those categories and in four others, so a partial match split its
   * panel and silently dropped the six facts belonging to neither half.
   *
   * Requiring full coverage means a sport either opts into the two-block layout
   * by categorising all of its facts that way, or gets the single grid. Nothing
   * can fall through the gap, which is the property that matters: a fact that
   * has been authored and is not rendered is invisible until somebody notices.
   */
  const splitFacts =
    quickFacts.length > 0 &&
    quickFacts.every((fact) => fact.category === 'identity' || fact.category === 'gameplay');

  return (
    <article className="space-y-12">
      {/* 1. At a glance */}
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Sport
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{sport.name}</h1>
        {sport.summary && (
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {sport.summary}
          </p>
        )}
        <div className="mt-6">
          <QuickFacts facts={quickFacts} categories={splitFacts ? ['identity'] : undefined} />
        </div>
      </header>

      {/* 10. Milestones, condensed for readers who will not read the timeline */}
      {history.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Key milestones
          </h2>
          <MilestoneStrip events={history} />
        </section>
      )}

      {/* 2. What is this sport? */}
      {introduction && <EditorialSection section={introduction} />}

      {/* 2b. At a glance: the shape of a game, for a reader who wants it fast. */}
      {splitFacts && (
        <section>
          <h2 className="text-xl font-bold tracking-tight">
            {glance?.heading ?? `${sport.name} at a glance`}
          </h2>
          <div className="mt-4">
            <QuickFacts facts={quickFacts} categories={['gameplay']} />
          </div>
          {glance && (
            <div className="mt-4 max-w-2xl space-y-4 leading-relaxed text-foreground/90">
              <EditorialSectionBody body={glance.body} />
            </div>
          )}
        </section>
      )}

      {/* 3. The origin story, where the sport has one worth telling as prose. */}
      {historyProse && <EditorialSection section={historyProse} />}

      {/* 3b. Origins and history */}
      {history.length > 0 && (
        <section>
          <h2 className="text-xl font-bold tracking-tight">Origins and history</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Entries are dated from the documentary record, and marked approximate or disputed where
            that record is. Early references, codification, the first international cricket and the
            modern professional game are distinguished rather than run together.
          </p>
          <div className="mt-6">
            <HistoryTimeline events={history} />
          </div>
        </section>
      )}

      {/* 3. Basic anatomy: the vocabulary, before anything is explained with it */}
      {concepts.length > 0 && (
        <section>
          <h2 className="text-xl font-bold tracking-tight">The basic anatomy</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            The terms everything else is described in. Each is introduced here and taught properly
            in the explainers.
          </p>
          <div className="mt-6">
            <ConceptGrid concepts={concepts} sportSlug={slug} />
          </div>
        </section>
      )}

      {/* 4. How the sport works, with rules deferred to Explainers */}
      {basics && (
        <section>
          <EditorialSection section={basics} />
          <Link
            href={`/sports/${slug}/explainers`}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
          >
            Read the {sport.name.toLowerCase()} explainers
            <span aria-hidden>→</span>
          </Link>
        </section>
      )}

      {/*
       * 5. Formats.
       *
       * The prose explains the two questions that define the taxonomy; the tree
       * shows the taxonomy itself. Both, because the distinction between a Test
       * and a first-class match is easy to state and easy to miss, and a reader
       * who skims the paragraph should still see it in the structure.
       */}
      {(formatsProse || formats.length > 0) && (
        <section>
          {formatsProse ? (
            <EditorialSection section={formatsProse} />
          ) : (
            <h2 className="text-xl font-bold tracking-tight">Formats</h2>
          )}
          {formats.length > 0 && (
            <div className="mt-6">
              <FormatTaxonomy formats={formats} />
            </div>
          )}
        </section>
      )}

      {/* 5. How the sport's competitive world is organised, as prose. */}
      {structure && <EditorialSection section={structure} />}

      {/* 5b and 9. Governance, which is also the geographic structure */}
      {governance.length > 0 && (
        <section>
          <h2 className="text-xl font-bold tracking-tight">How the sport is organised</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            A world governing body sits above regional bodies, which recognise the national boards
            beneath them. Each board then runs its own domestic structure, and those structures
            differ from one country to the next rather than following a single template.
          </p>
          <div className="mt-6">
            <GovernanceHierarchy bodies={governance} />
          </div>
          {membership.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Classes of membership
              </h3>
              <MembershipTiers tiers={membership} />
            </div>
          )}
        </section>
      )}

      {/* 6. Competition ecosystem */}
      {competitions && (
        <section>
          <EditorialSection section={competitions} />
          <Link
            href={`/sports/${slug}/competitions`}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
          >
            Browse competitions
            <span aria-hidden>→</span>
          </Link>
        </section>
      )}

      {/* 6a. The competitions themselves, linked to their own pages. */}
      {featuredCompetitions.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-bold tracking-tight">Major competitions</h2>
          <FeaturedEntities entities={featuredCompetitions} />
        </section>
      )}

      {/* 6b. The events that carry more weight than the calendar suggests. */}
      {stages && <EditorialSection section={stages} />}

      {/* 7. Evolution */}
      {evolution && <EditorialSection section={evolution} />}

      {/* 7b. The same history as broad editorial periods rather than dates. */}
      {eras && <EditorialSection section={eras} />}

      {/* 8. Women's football, as a section rather than a sentence */}
      {womens && <EditorialSection section={womens} />}

      {/*
       * 8b. The people and clubs.
       *
       * "Icons" rather than "greatest players": a ranked list of the best ever
       * is an argument, and this is a list of names a new follower will meet.
       */}
      {icons.length > 0 && (
        <section>
          <h2 className="text-xl font-bold tracking-tight">Icons of {sport.name.toLowerCase()}</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Figures a follower of the sport will hear about, in rough chronological order rather
            than ranked. Each links to their full record.
          </p>
          <div className="mt-6">
            <FeaturedEntities entities={icons} />
          </div>
          <Link
            href={`/sports/${slug}/players`}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
          >
            Explore players
            <span aria-hidden>→</span>
          </Link>
        </section>
      )}

      {legendaryTeams.length > 0 && (
        <section>
          <h2 className="text-xl font-bold tracking-tight">
            Teams that shaped {sport.name.toLowerCase()}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Not a ranking. Clubs whose histories are part of how the sport developed, across both
            the professional and the international game.
          </p>
          <div className="mt-6">
            <FeaturedEntities entities={legendaryTeams} />
          </div>
          <Link
            href={`/sports/${slug}/teams`}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
          >
            Explore teams
            <span aria-hidden>→</span>
          </Link>
        </section>
      )}

      {/* 9. Around the world */}
      {global && <EditorialSection section={global} />}

      {/* 9b. The sport beyond its own results. */}
      {culture && <EditorialSection section={culture} />}

      {/* Anything authored that has no dedicated slot above. */}
      {additional.map((entry) => (
        <EditorialSection key={entry.kind} section={entry} />
      ))}

      {/* 11. Explore. Deliberately no counts: the destination matters, not the size. */}
      <section>
        <h2 className="mb-3 text-xl font-bold tracking-tight">Explore {sport.name}</h2>
        <ExploreCards sportSlug={slug} sportName={sport.name} />
      </section>

      {/* 12. Provenance */}
      <SourceList sources={sources} />
    </article>
  );
}
