import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CategoryNav, CategorySection, ExplainerRow } from '@/components/sports/explainer';
import { ExplainerSearch } from '@/components/sports/explainer-search';
import { ApiError, fetchExplainerLibrary } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';

/**
 * Per-sport landing copy.
 *
 * The library structure is identical for every sport, but the standfirst and the
 * search placeholder should name the things a reader of *that* sport would
 * actually type. Keyed by slug with a generic fallback, so a new sport gets a
 * working page immediately and a better one when somebody writes two lines.
 */
const LANDING_COPY: Record<string, { standfirst: string; placeholder: string }> = {
  football: {
    standfirst: 'Rules, tactics, positions, terminology and concepts, explained clearly.',
    placeholder: 'Search offside, xG, false nine, pressing...',
  },
  cricket: {
    standfirst:
      'Rules, batting, bowling, field positions, tactics, statistics and terminology, explained clearly.',
    placeholder: 'Search LBW, googly, powerplay, strike rate...',
  },
  basketball: {
    standfirst:
      'Rules, the court, positions, offence, defence, statistics and league concepts, explained clearly.',
    placeholder: 'Search pick and roll, traveling, TS%, shot clock...',
  },
  tennis: {
    standfirst:
      'Scoring, serving, the court, shots, tactics, surfaces, rankings and statistics, explained clearly.',
    placeholder: 'Search deuce, tiebreak, kick serve, ranking points...',
  },
  'formula-1': {
    standfirst:
      'Race weekends, qualifying, strategy, tyres, aerodynamics, the power unit and the rules, explained clearly.',
    placeholder: 'Search undercut, DRS, degradation, parc fermé...',
  },
};

const FALLBACK_COPY = {
  standfirst: 'Rules, tactics, terminology and concepts, explained clearly.',
  placeholder: 'Search for a rule, a tactic or a term...',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sport: string }>;
}): Promise<Metadata> {
  const { sport: slug } = await params;
  try {
    const { sport } = await fetchExplainerLibrary(slug);
    return buildMetadata({
      title: `${sport.name} Explainers`,
      description: `Rules, tactics, positions, terminology and concepts in ${sport.name.toLowerCase()}, explained clearly.`,
      path: `/sports/${slug}/explainers`,
    });
  } catch {
    return buildMetadata({ title: 'Explainers', path: `/sports/${slug}/explainers` });
  }
}

/**
 * The explainer library.
 *
 * Organised as a reference work rather than a blog: a search box, a short
 * beginner path, then the taxonomy with a preview of each category. Concepts
 * are rows in a list, because a hundred identical cards is a wall the reader has
 * to scan rather than a structure they can navigate.
 *
 * Only the search box is a client component. The categories and every concept
 * are server-rendered, so the library is fully indexable and readable without
 * JavaScript.
 */
export default async function ExplainersPage({ params }: { params: Promise<{ sport: string }> }) {
  const { sport: slug } = await params;

  let library;
  try {
    library = await fetchExplainerLibrary(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const { sport, startHere, categories, searchIndex } = library;
  const copy = LANDING_COPY[slug] ?? FALLBACK_COPY;

  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {sport.name} / Explainers
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          Understand {sport.name}
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          {copy.standfirst}
        </p>
      </header>

      <ExplainerSearch sportSlug={slug} index={searchIndex} placeholder={copy.placeholder} />

      {startHere.length > 0 && (
        <section>
          <h2 className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground">
            Start here
          </h2>
          <div className="mt-3">
            {startHere.map((explainer) => (
              <ExplainerRow key={explainer.id} sportSlug={slug} explainer={explainer} />
            ))}
          </div>
        </section>
      )}

      {categories.length > 0 && <CategoryNav categories={categories} />}

      {categories.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No explainers published yet.
        </p>
      ) : (
        <div className="space-y-10">
          {categories.map((category) => (
            <CategorySection key={category.id} sportSlug={slug} category={category} />
          ))}
        </div>
      )}
    </div>
  );
}
