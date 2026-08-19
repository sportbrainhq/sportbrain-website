import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ApiError, fetchExplainer } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sport: string; slug: string }>;
}): Promise<Metadata> {
  const { sport, slug } = await params;
  try {
    const explainer = await fetchExplainer(slug);
    return buildMetadata({
      title: explainer.title,
      description: explainer.excerpt ?? undefined,
      path: `/sports/${sport}/explainers/${slug}`,
    });
  } catch {
    return buildMetadata({ title: 'Explainer', path: `/sports/${sport}/explainers/${slug}` });
  }
}

export default async function ExplainerPage({
  params,
}: {
  params: Promise<{ sport: string; slug: string }>;
}) {
  const { slug } = await params;

  let explainer;
  try {
    explainer = await fetchExplainer(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <article className="max-w-2xl space-y-6">
      <header>
        {explainer.category && (
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {explainer.category}
          </p>
        )}
        <h1 className="mt-2 text-3xl font-black tracking-tight">{explainer.title}</h1>
        {explainer.excerpt && (
          <p className="mt-3 text-lg text-muted-foreground">{explainer.excerpt}</p>
        )}
      </header>

      {explainer.body && <Markdown source={explainer.body} />}
    </article>
  );
}

/**
 * Minimal markdown rendering: paragraphs and bold.
 *
 * Deliberately not a markdown library, and deliberately not `dangerouslySet
 * InnerHTML`. The body is authored content that will eventually come through a
 * pipeline, and stored XSS from a content pipeline is the highest-likelihood
 * serious vulnerability for a site like this. Splitting on paragraphs and
 * emitting React elements means nothing in the source can become markup.
 *
 * When richer formatting is needed, the answer is a sanitising renderer and a
 * Content Security Policy, added together.
 */
function Markdown({ source }: { source: string }) {
  const paragraphs = source.split(/\n\n+/);

  return (
    <div className="space-y-4 leading-relaxed">
      {paragraphs.map((paragraph, index) => (
        <p key={index}>
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
  );
}
