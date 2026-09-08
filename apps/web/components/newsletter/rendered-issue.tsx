import Link from 'next/link';
import type { RenderedIssue } from '@sportbrain/contracts';

/**
 * Renders `RenderedIssue` — the same view model
 * `NewsletterIssueRenderService` (D4) produces for the admin preview and the
 * outgoing email — as a public web page (Phase D7, org spec section 25/47:
 * "one render path, three consumers"). This is a React equivalent of
 * `buildIssueEmailHtml` (the email's plain-HTML-string renderer): same
 * sections, same "only render what exists" rule, but styled with this app's
 * own Tailwind components instead of table-based email-safe markup, since a
 * web page has no email-client constraint to work around.
 *
 * The SportBrain Challenge question is deliberately NOT answer-revealing:
 * it links into the real quiz flow (`/quiz/question/:id` — reusing the
 * existing question flow so the answer is checked/tracked the same way any
 * other quiz question is) rather than rendering `isCorrect` inline, per org
 * spec section H.
 */
export function RenderedIssueView({ rendered }: { rendered: RenderedIssue }) {
  return (
    <div className="space-y-10">
      {rendered.intro && (
        <p className="text-lg leading-relaxed text-muted-foreground">{rendered.intro}</p>
      )}

      {rendered.quickRecap.length > 0 && (
        <Section title="60-Second Recap">
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
            {rendered.quickRecap.map((item, index) => (
              <li key={index}>{item.text}</li>
            ))}
          </ul>
        </Section>
      )}

      {rendered.bigStory && (
        <Section title="Big Story">
          <h3 className="text-xl font-bold tracking-tight">{rendered.bigStory.headline}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {rendered.bigStory.summary}
          </p>
          <dl className="mt-4 space-y-2 text-sm">
            <Row label="What happened" value={rendered.bigStory.whatHappened} />
            <Row label="Why it matters" value={rendered.bigStory.whyItMatters} />
            <Row label="What changes now" value={rendered.bigStory.whatChangesNow} />
          </dl>
          {rendered.bigStory.link && (
            <a
              href={rendered.bigStory.link}
              className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
            >
              Read more &rarr;
            </a>
          )}
        </Section>
      )}

      {rendered.scoreboard.length > 0 && (
        <Section title="Scoreboard">
          <div className="space-y-4">
            {rendered.scoreboard.map((group) => (
              <div key={group.sport}>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {group.sport}
                </p>
                <ul className="mt-1 space-y-1 text-sm">
                  {group.items.map((item, index) => (
                    <li key={index} className="flex justify-between gap-4">
                      <span>{item.label}</span>
                      <span className="font-semibold">{item.result}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      )}

      {rendered.numbers.length > 0 && (
        <Section title="Numbers of the Week">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {rendered.numbers.map((item, index) => (
              <div key={index} className="rounded-lg border border-border p-4 text-center">
                <div className="text-2xl font-black">{item.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{item.caption}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {rendered.missedStory && (
        <Section title="Story You May Have Missed">
          <h3 className="font-bold">{rendered.missedStory.headline}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {rendered.missedStory.summary}
          </p>
          {rendered.missedStory.link && (
            <a
              href={rendered.missedStory.link}
              className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
            >
              Read more &rarr;
            </a>
          )}
        </Section>
      )}

      {rendered.history && (
        <Section title="This Week in Sports History">
          <p className="text-xs font-bold text-muted-foreground">{rendered.history.year}</p>
          <h3 className="mt-1 font-bold">{rendered.history.headline}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {rendered.history.summary}
          </p>
        </Section>
      )}

      {rendered.quiz?.questionId && (
        <Section title="The SportBrain Challenge">
          <p className="text-sm text-muted-foreground">
            Think you know this week&apos;s sport? Put it to the test.
          </p>
          <Link
            href={`/quiz/question/${rendered.quiz.questionId}`}
            className="mt-3 inline-block rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
          >
            Take the Challenge
          </Link>
        </Section>
      )}

      {rendered.watchNext.length > 0 && (
        <Section title="What to Watch">
          <div className="space-y-3">
            {rendered.watchNext.map((item, index) => (
              <div key={index}>
                <p className="text-sm font-semibold">
                  {item.sport}: {item.event}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.datetime}
                  {item.context ? ` — ${item.context}` : ''}
                </p>
                {item.link && (
                  <a
                    href={item.link}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Details &rarr;
                  </a>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {rendered.sportbrainLinks.length > 0 && (
        <Section title="From SportBrainHQ">
          <ul className="space-y-2 text-sm">
            {rendered.sportbrainLinks.map((link, index) => (
              <li key={index}>
                <Link href={link.url} className="font-semibold text-primary hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="border-b-2 border-foreground pb-2 text-xs font-black uppercase tracking-widest">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-muted-foreground">{value}</dd>
    </div>
  );
}
