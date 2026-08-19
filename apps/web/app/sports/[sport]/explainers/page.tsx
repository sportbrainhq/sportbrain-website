import Link from 'next/link';
import type { Metadata } from 'next';
import { fetchExplainers, fetchSport } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sport: string }>;
}): Promise<Metadata> {
  const { sport } = await params;
  return buildMetadata({ title: 'Explainers', path: `/sports/${sport}/explainers` });
}

/**
 * The Explainers tab.
 *
 * Grouped by the editorial category rather than listed flat, because "Rules",
 * "Tactics" and "Concepts" answer different questions and a reader usually
 * arrives wanting one of them.
 */
export default async function ExplainersPage({ params }: { params: Promise<{ sport: string }> }) {
  const { sport: slug } = await params;
  const [sport, explainers] = await Promise.all([fetchSport(slug), fetchExplainers(slug)]);

  const byCategory = new Map<string, typeof explainers.data>();
  for (const item of explainers.data) {
    const key = item.category ?? 'General';
    byCategory.set(key, [...(byCategory.get(key) ?? []), item]);
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{sport.name} explainers</h1>
        <p className="mt-2 text-muted-foreground">
          How the sport works, and how to read what the numbers say.
        </p>
      </header>

      {explainers.data.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No explainers written yet.
        </p>
      ) : (
        [...byCategory].map(([category, items]) => (
          <section key={category}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {category}
            </h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {items.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/sports/${slug}/explainers/${item.slug}`}
                    className="block rounded-lg border border-border bg-card p-4 transition-colors hover:border-foreground/20 hover:bg-muted/50"
                  >
                    <span className="block font-medium">{item.title}</span>
                    {item.excerpt && (
                      <span className="mt-1 block text-sm text-muted-foreground">
                        {item.excerpt}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
