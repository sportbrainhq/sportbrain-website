import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ExplainerRow } from '@/components/sports/explainer';
import { ApiError, fetchExplainerCategory, fetchExplainerLibrary } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';

/**
 * Every published concept in one category.
 *
 * A static `category` segment rather than a query parameter on the listing, so
 * the page has its own indexable URL. Next.js resolves static segments before
 * dynamic ones, so this does not collide with `[slug]`.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ sport: string; categorySlug: string }>;
}): Promise<Metadata> {
  const { sport, categorySlug } = await params;
  return buildMetadata({
    title: 'Explainers',
    path: `/sports/${sport}/explainers/category/${categorySlug}`,
  });
}

export default async function ExplainerCategoryPage({
  params,
}: {
  params: Promise<{ sport: string; categorySlug: string }>;
}) {
  const { sport: sportSlug, categorySlug } = await params;

  // The library is fetched for the category's name and description; the
  // concepts come from the dedicated endpoint, because the library caps each
  // category at a preview and this page is what "view all" means.
  let library;
  let explainers;
  try {
    [library, explainers] = await Promise.all([
      fetchExplainerLibrary(sportSlug),
      fetchExplainerCategory(sportSlug, categorySlug),
    ]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const category = library.categories.find((entry) => entry.slug === categorySlug);
  if (!category) notFound();

  return (
    <div className="space-y-6">
      <header>
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
          <Link href={`/sports/${sportSlug}/explainers`} className="hover:underline">
            Explainers
          </Link>
        </nav>
        <h1 className="mt-3 text-3xl font-black tracking-tight">{category.name}</h1>
        {category.description && (
          <p className="mt-2 max-w-2xl text-muted-foreground">{category.description}</p>
        )}
      </header>

      <div>
        {explainers.data.map((explainer) => (
          <ExplainerRow key={explainer.id} sportSlug={sportSlug} explainer={explainer} />
        ))}
      </div>
    </div>
  );
}
