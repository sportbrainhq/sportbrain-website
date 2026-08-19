import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  EditorialSection,
  ExploreCards,
  GovernanceHierarchy,
  HistoryTimeline,
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

  const { sport, quickFacts, sections, history, governance, sources } = overview;
  const section = (kind: string) => sections.find((entry) => entry.kind === kind);

  const introduction = section('introduction');
  const basics = section('basics');
  const competitions = section('competitions');
  const evolution = section('evolution');
  const womens = section('womens');
  const global = section('global');

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
          <QuickFacts facts={quickFacts} />
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

      {/* 2. What is football? */}
      {introduction && <EditorialSection section={introduction} />}

      {/* 3. Origins and history */}
      {history.length > 0 && (
        <section>
          <h2 className="text-xl font-bold tracking-tight">Origins and history</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Games resembling football were played for centuries before the modern sport was
            codified. The entries below distinguish those predecessors from the codes that became
            association football.
          </p>
          <div className="mt-6">
            <HistoryTimeline events={history} />
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

      {/* 5 and 9. Governance, which is also the geographic structure */}
      {governance.length > 0 && (
        <section>
          <h2 className="text-xl font-bold tracking-tight">How the sport is organised</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            A world governing body sits above continental confederations, which in turn recognise
            national associations. Domestic leagues, cups and clubs sit beneath those.
          </p>
          <div className="mt-6">
            <GovernanceHierarchy bodies={governance} />
          </div>
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

      {/* 7. Evolution */}
      {evolution && <EditorialSection section={evolution} />}

      {/* 8. Women's football, as a section rather than a sentence */}
      {womens && <EditorialSection section={womens} />}

      {/* 9. Around the world */}
      {global && <EditorialSection section={global} />}

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
