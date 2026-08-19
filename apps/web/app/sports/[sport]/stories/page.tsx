import Link from 'next/link';
import type { Metadata } from 'next';
import { fetchSport, fetchStories } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sport: string }>;
}): Promise<Metadata> {
  const { sport } = await params;
  return buildMetadata({ title: 'Stories', path: `/sports/${sport}/stories` });
}

export default async function StoriesPage({ params }: { params: Promise<{ sport: string }> }) {
  const { sport: slug } = await params;
  const [sport, stories] = await Promise.all([fetchSport(slug), fetchStories(slug)]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
          {sport.name} social media stories
        </h1>
        <p className="mt-2 text-muted-foreground">
          Our best {sport.name.toLowerCase()} stories, as published.
        </p>
      </header>

      {stories.data.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No stories published yet.
        </p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {stories.data.map((story) => (
            <li key={story.id}>
              <Link
                href={`/stories/${story.slug}`}
                className="block rounded-lg border border-border bg-card p-4 transition-colors hover:border-foreground/20 hover:bg-muted/50"
              >
                <span className="block font-medium">{story.title}</span>
                {story.excerpt && (
                  <span className="mt-1 block text-sm text-muted-foreground">{story.excerpt}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
