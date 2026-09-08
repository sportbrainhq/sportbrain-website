'use client';

import { useState } from 'react';
import type { NewsletterIssueDetail, RenderedIssue } from '@sportbrain/contracts';

type PaneWidth = 'desktop' | 'mobile';

/**
 * Renders `RenderedIssue` (Phase D4) — the same view model the email
 * template consumes — inside a switchable desktop-width/mobile-width pane.
 * One render, two container widths: there is no content difference between
 * the two, only how much horizontal room the reader's inbox would actually
 * give it. See `NewsletterIssueRenderService`'s header comment for the full
 * reasoning behind not building three separate render paths.
 */
export function IssuePreview({
  issue,
  rendered,
}: {
  issue: NewsletterIssueDetail;
  rendered: RenderedIssue;
}) {
  const [pane, setPane] = useState<PaneWidth>('desktop');

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">
            Preview: Issue #{issue.issueNumber}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{issue.subject}</p>
        </div>
        <div className="flex items-center gap-1 rounded-sm border border-border p-1">
          <button
            type="button"
            onClick={() => setPane('desktop')}
            className={`rounded-sm px-3 py-1.5 text-sm ${pane === 'desktop' ? 'bg-primary text-primary-foreground' : 'hover:bg-card'}`}
          >
            Desktop
          </button>
          <button
            type="button"
            onClick={() => setPane('mobile')}
            className={`rounded-sm px-3 py-1.5 text-sm ${pane === 'mobile' ? 'bg-primary text-primary-foreground' : 'hover:bg-card'}`}
          >
            Mobile
          </button>
        </div>
      </header>

      <div className="rounded-lg border border-border bg-muted/30 p-6">
        <div
          className="mx-auto bg-white text-black shadow-sm"
          style={{ maxWidth: pane === 'desktop' ? '600px' : '375px' }}
        >
          <RenderedIssueBody rendered={rendered} />
        </div>
      </div>
    </div>
  );
}

function RenderedIssueBody({ rendered }: { rendered: RenderedIssue }) {
  return (
    <div className="p-6 font-sans text-sm">
      <div className="border-b-2 border-black pb-4 text-center">
        <h1 className="text-xl font-black">{rendered.heroTitle}</h1>
        <p className="mt-1 text-xs text-gray-500">
          Issue #{rendered.issueNumber} &middot; {new Date(rendered.issueDate).toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-6 py-6">
        {rendered.intro && <p className="text-sm leading-relaxed">{rendered.intro}</p>}

        {rendered.quickRecap.length > 0 && (
          <Section title="60-Second Recap">
            <ul className="list-disc space-y-1 pl-5">
              {rendered.quickRecap.map((item, index) => (
                <li key={index}>{item.text}</li>
              ))}
            </ul>
          </Section>
        )}

        {rendered.bigStory && (
          <Section title="Big Story">
            <h3 className="font-bold">{rendered.bigStory.headline}</h3>
            <p className="mt-1">{rendered.bigStory.summary}</p>
            <p className="mt-2 text-xs text-gray-600">
              <strong>What changes now:</strong> {rendered.bigStory.whatChangesNow}
            </p>
          </Section>
        )}

        {rendered.scoreboard.length > 0 && (
          <Section title="Scoreboard">
            {rendered.scoreboard.map((group, index) => (
              <div key={index} className="mb-2">
                <p className="text-xs font-bold uppercase text-gray-500">{group.sport}</p>
                {group.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex justify-between text-xs">
                    <span>{item.label}</span>
                    <span className="font-semibold">{item.result}</span>
                  </div>
                ))}
              </div>
            ))}
          </Section>
        )}

        {rendered.numbers.length > 0 && (
          <Section title="Numbers of the Week">
            <div className="grid grid-cols-2 gap-2">
              {rendered.numbers.map((item, index) => (
                <div key={index} className="border border-gray-200 p-2 text-center">
                  <div className="text-lg font-black">{item.value}</div>
                  <div className="text-xs text-gray-500">{item.caption}</div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {rendered.missedStory && (
          <Section title="Story You May Have Missed">
            <h3 className="font-bold">{rendered.missedStory.headline}</h3>
            <p className="mt-1">{rendered.missedStory.summary}</p>
          </Section>
        )}

        {rendered.history && (
          <Section title="This Week in Sports History">
            <p className="text-xs font-bold text-gray-500">{rendered.history.year}</p>
            <h3 className="font-bold">{rendered.history.headline}</h3>
            <p className="mt-1">{rendered.history.summary}</p>
          </Section>
        )}

        {rendered.quiz?.questionSnapshot && (
          <Section title="The SportBrain Challenge">
            <p className="font-semibold">{rendered.quiz.questionSnapshot.questionText}</p>
            <ul className="mt-2 space-y-1">
              {rendered.quiz.questionSnapshot.options.map((option) => (
                <li key={option.optionCode}>
                  {option.optionCode}. {option.optionText} {option.isCorrect && '✓'}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {rendered.watchNext.length > 0 && (
          <Section title="What to Watch">
            {rendered.watchNext.map((item, index) => (
              <div key={index} className="mb-2">
                <p className="font-semibold">
                  {item.sport}: {item.event}
                </p>
                <p className="text-xs text-gray-500">{item.datetime}</p>
              </div>
            ))}
          </Section>
        )}

        {rendered.sportbrainLinks.length > 0 && (
          <Section title="From SportBrainHQ">
            <ul className="list-disc space-y-1 pl-5">
              {rendered.sportbrainLinks.map((link, index) => (
                <li key={index}>{link.label}</li>
              ))}
            </ul>
          </Section>
        )}
      </div>

      <div className="border-t border-gray-200 pt-4 text-center text-xs text-gray-400">
        <p>You&apos;re receiving this because you subscribed to The Monday Brief.</p>
        <p className="mt-1">Manage Preferences &middot; Unsubscribe</p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-2 border-b-2 border-black pb-1 text-xs font-extrabold uppercase tracking-wide">
        {title}
      </h2>
      {children}
    </div>
  );
}
