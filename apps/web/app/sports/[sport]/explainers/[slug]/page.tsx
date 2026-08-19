import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticleSection, ExplainerSources, RelatedConcepts } from '@/components/sports/explainer';
import { ApiError, fetchExplainerDetail } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sport: string; slug: string }>;
}): Promise<Metadata> {
  const { sport, slug } = await params;
  try {
    const explainer = await fetchExplainerDetail(sport, slug);
    return buildMetadata({
      // "Offside Explained" rather than "Offside": the page answers a question,
      // and the title is what a reader sees in a list of search results.
      title: `${explainer.title} Explained`,
      description:
        explainer.shortDescription ??
        `What ${explainer.title.toLowerCase()} means and how it works.`,
      path: `/sports/${sport}/explainers/${slug}`,
    });
  } catch {
    return buildMetadata({ title: 'Explainer', path: `/sports/${sport}/explainers/${slug}` });
  }
}

/**
 * One explainer.
 *
 * Sections are rendered in the order the API returns them, and only the ones
 * that exist. A rule shows what the Law says and its sanctions; a formation
 * shows a diagram and its strengths; neither renders an empty heading for a
 * section the other has, which is what makes one page serve every template.
 */
export default async function ExplainerPage({
  params,
}: {
  params: Promise<{ sport: string; slug: string }>;
}) {
  const { sport: sportSlug, slug } = await params;

  let explainer;
  try {
    explainer = await fetchExplainerDetail(sportSlug, slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <article className="space-y-8">
      <header>
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
          <Link href={`/sports/${sportSlug}/explainers`} className="hover:underline">
            Explainers
          </Link>
          {explainer.categoryName && explainer.categorySlug && (
            <>
              <span aria-hidden className="mx-1.5">
                /
              </span>
              <Link
                href={`/sports/${sportSlug}/explainers/category/${explainer.categorySlug}`}
                className="hover:underline"
              >
                {explainer.categoryName}
              </Link>
            </>
          )}
        </nav>

        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{explainer.title}</h1>
        {explainer.subtitle && (
          <p className="mt-1 text-lg text-muted-foreground">{explainer.subtitle}</p>
        )}
        {explainer.shortDescription && (
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {explainer.shortDescription}
          </p>
        )}

        <p className="mt-4 text-2xs font-semibold uppercase tracking-widest text-muted-foreground">
          {explainer.difficulty}
          {explainer.readMinutes ? ` · ${explainer.readMinutes} min read` : ''}
        </p>
      </header>

      {explainer.sections.map((section) => (
        <ArticleSection key={section.type} section={section} title={explainer.title} />
      ))}

      <RelatedConcepts sportSlug={sportSlug} related={explainer.related} />

      <ExplainerSources sources={explainer.sources} />
    </article>
  );
}
