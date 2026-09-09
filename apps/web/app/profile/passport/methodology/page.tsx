import { z } from 'zod';
import { passportMethodologySchema } from '@sportbrain/contracts';
import { apiGetAuthed } from '@/lib/auth';

export const metadata = { title: 'How Your SportBrain Score Works' };

const methodologyEnvelope = z.object({ data: passportMethodologySchema });

const LEVEL_ORDER = [
  'UNRATED',
  'NEWCOMER',
  'EXPLORER',
  'KNOWLEDGEABLE',
  'ADVANCED',
  'EXPERT',
] as const;

export default async function PassportMethodologyPage() {
  const result = await apiGetAuthed('/v1/me/passport/methodology', methodologyEnvelope);
  const methodology = result?.data ?? null;

  if (!methodology) {
    return <p className="text-sm text-muted-foreground">Methodology is unavailable right now.</p>;
  }

  return (
    <div className="max-w-2xl space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-foreground">How your SportBrain Score works</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Scoring version {methodology.scoringVersion}
        </p>
      </header>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Your SportBrain Score considers
        </h2>
        <ul className="list-inside list-disc space-y-1 text-sm text-foreground">
          {methodology.considers.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          It does not measure
        </h2>
        <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
          {methodology.doesNotMeasure.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Knowledge levels
        </h2>
        <dl className="space-y-3">
          {LEVEL_ORDER.map((level) => (
            <div key={level} className="rounded-md border border-border bg-card p-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-foreground">
                {level}
              </dt>
              <dd className="mt-1 text-sm text-muted-foreground">
                {methodology.levelDescriptions[level]}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
