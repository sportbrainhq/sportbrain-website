'use client';

import { useState } from 'react';
import type {
  BigStory,
  HistoryItem,
  IssueValidationResult,
  MissedStory,
  NewsletterIssueContent,
  NewsletterIssueDetail,
  NumberItem,
  QuickRecapItem,
  ScoreboardGroup,
  WatchNextItem,
} from '@sportbrain/contracts';
import { adminPatch, adminPost } from '@/lib/admin-api';
import { QuestionPickerModal } from './question-picker-modal';
import { ContentPickerModal } from './content-picker-modal';
import { ScheduleSection } from './schedule-section';
import { TestEmailSection } from './test-email-section';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

/**
 * The structured block editor for one issue (Phase D2).
 *
 * Plain forms and repeatable lists, not a Notion-style block canvas — the
 * task is explicit that this stays simple for D2. Each section saves
 * independently via `PATCH .../content`, which the API merges into the
 * stored jsonb rather than requiring the whole document — so saving "60-
 * Second Recap" never risks clobbering "Big Story" if that section hasn't
 * loaded/changed in this render.
 */
export function IssueEditor({ initial }: { initial: NewsletterIssueDetail }) {
  const [issue, setIssue] = useState(initial);
  const [content, setContent] = useState<NewsletterIssueContent>(initial.content);
  const [validation, setValidation] = useState<IssueValidationResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [markingReady, setMarkingReady] = useState(false);
  const [readyError, setReadyError] = useState<string | null>(null);

  async function saveSection(partial: NewsletterIssueContent): Promise<void> {
    const result = (await adminPatch(`/admin/newsletter/issues/${issue.id}/content`, partial)) as {
      data: NewsletterIssueDetail;
    };
    setIssue(result.data);
    setContent(result.data.content);
  }

  async function checkIssue() {
    setChecking(true);
    try {
      const result = (await adminPost(`/admin/newsletter/issues/${issue.id}/validate`)) as {
        data: IssueValidationResult;
      };
      setValidation(result.data);
    } finally {
      setChecking(false);
    }
  }

  async function markReady() {
    setMarkingReady(true);
    setReadyError(null);
    try {
      const result = (await adminPost(`/admin/newsletter/issues/${issue.id}/ready`)) as {
        data: NewsletterIssueDetail;
        validation: IssueValidationResult;
      };
      setIssue(result.data);
      setValidation(result.validation);
    } catch (err) {
      setReadyError(err instanceof Error ? err.message : 'Could not mark ready.');
    } finally {
      setMarkingReady(false);
    }
  }

  return (
    <div className="space-y-10 pb-24">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">
            Issue #{issue.issueNumber}: {issue.subject}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Status: <span className="font-semibold">{issue.status}</span>
          </p>
        </div>
        <a
          href={`/admin/newsletter/issues/${issue.id}/preview`}
          target="_blank"
          rel="noreferrer"
          className="rounded-sm border border-border px-3 py-1.5 text-sm hover:bg-card"
        >
          Preview
        </a>
      </header>

      <QuickRecapSection initial={content.quickRecap ?? []} onSave={saveSection} />
      <BigStorySection initial={content.bigStory} onSave={saveSection} />
      <ScoreboardSection initial={content.scoreboard ?? []} onSave={saveSection} />
      <NumbersSection initial={content.numbers ?? []} onSave={saveSection} />
      <MissedStorySection initial={content.missedStory} onSave={saveSection} />
      <HistorySection initial={content.history} onSave={saveSection} />
      <ChallengeSection issueId={issue.id} initial={content.quiz} onSave={saveSection} />
      <WatchNextSection initial={content.watchNext ?? []} onSave={saveSection} />
      <SportbrainLinksSection
        issueId={issue.id}
        initial={content.sportbrainLinks ?? []}
        onSave={saveSection}
      />

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-lg font-bold">Validation</h2>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => void checkIssue()}
            disabled={checking}
            className="rounded-sm border border-border px-3 py-1.5 text-sm hover:bg-background disabled:opacity-60"
          >
            {checking ? 'Checking…' : 'Check Issue'}
          </button>
          <button
            type="button"
            onClick={() => void markReady()}
            disabled={markingReady}
            className="rounded-sm bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {markingReady ? 'Marking ready…' : 'Mark Ready'}
          </button>
        </div>
        {readyError && <p className="mt-2 text-sm text-destructive">{readyError}</p>}
        {validation && (
          <div className="mt-4 space-y-3">
            {validation.errors.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-destructive">Errors (block Ready)</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-destructive">
                  {validation.errors.map((message, index) => (
                    <li key={index}>{message}</li>
                  ))}
                </ul>
              </div>
            )}
            {validation.warnings.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Warnings</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {validation.warnings.map((message, index) => (
                    <li key={index}>{message}</li>
                  ))}
                </ul>
              </div>
            )}
            {validation.errors.length === 0 && validation.warnings.length === 0 && (
              <p className="text-sm text-success">No issues found.</p>
            )}
          </div>
        )}
      </section>

      <TestEmailSection issueId={issue.id} />

      {(issue.status === 'READY' || issue.status === 'SCHEDULED') && (
        <ScheduleSection issue={issue} onChange={setIssue} />
      )}
    </div>
  );
}

// --- Shared bits --------------------------------------------------------------

function SectionShell({
  title,
  children,
  onSave,
  saveState,
}: {
  title: string;
  children: React.ReactNode;
  onSave: () => void;
  saveState: SaveState;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{title}</h2>
        <div className="flex items-center gap-2">
          {saveState === 'saved' && <span className="text-xs text-success">Saved</span>}
          {saveState === 'error' && (
            <span className="text-xs text-destructive">Failed to save</span>
          )}
          <button
            type="button"
            onClick={onSave}
            disabled={saveState === 'saving'}
            className="rounded-sm border border-border px-3 py-1 text-xs font-medium hover:bg-background disabled:opacity-60"
          >
            {saveState === 'saving' ? 'Saving…' : 'Save section'}
          </button>
        </div>
      </div>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function useSectionSave<T>(
  key: keyof NewsletterIssueContent,
  onSave: (partial: NewsletterIssueContent) => Promise<void>,
) {
  const [state, setState] = useState<SaveState>('idle');
  async function save(value: T) {
    setState('saving');
    try {
      await onSave({ [key]: value } as NewsletterIssueContent);
      setState('saved');
    } catch {
      setState('error');
    }
  }
  return { state, save };
}

const inputClass = 'w-full rounded-sm border border-border bg-background px-3 py-2 text-sm';
const textareaClass = `${inputClass} min-h-20`;

// --- 60-Second Recap ------------------------------------------------------------

function QuickRecapSection({
  initial,
  onSave,
}: {
  initial: QuickRecapItem[];
  onSave: (partial: NewsletterIssueContent) => Promise<void>;
}) {
  const [items, setItems] = useState<QuickRecapItem[]>(initial.length ? initial : [{ text: '' }]);
  const { state, save } = useSectionSave<QuickRecapItem[]>('quickRecap', onSave);

  return (
    <SectionShell
      title="60-Second Recap"
      onSave={() => void save(items.filter((item) => item.text.trim()))}
      saveState={state}
    >
      {items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <input
            value={item.text}
            onChange={(event) =>
              setItems((current) =>
                current.map((entry, i) => (i === index ? { text: event.target.value } : entry)),
              )
            }
            placeholder="One recap line"
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => setItems((current) => current.filter((_, i) => i !== index))}
            className="shrink-0 rounded-sm border border-border px-2 text-xs text-muted-foreground hover:bg-background"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setItems((current) => [...current, { text: '' }])}
        className="text-sm text-primary hover:underline"
      >
        + Add line
      </button>
    </SectionShell>
  );
}

// --- Big Story ------------------------------------------------------------------

function BigStorySection({
  initial,
  onSave,
}: {
  initial: BigStory | undefined;
  onSave: (partial: NewsletterIssueContent) => Promise<void>;
}) {
  const [story, setStory] = useState<BigStory>(
    initial ?? {
      headline: '',
      summary: '',
      whatHappened: '',
      whyItMatters: '',
      whatChangesNow: '',
      link: '',
    },
  );
  const { state, save } = useSectionSave<BigStory>('bigStory', onSave);

  function field(key: keyof BigStory, label: string, multiline = false) {
    const value = story[key] ?? '';
    return (
      <label className="block">
        <span className="mb-1 block text-sm font-medium">{label}</span>
        {multiline ? (
          <textarea
            value={value as string}
            onChange={(event) => setStory((current) => ({ ...current, [key]: event.target.value }))}
            className={textareaClass}
          />
        ) : (
          <input
            value={value as string}
            onChange={(event) => setStory((current) => ({ ...current, [key]: event.target.value }))}
            className={inputClass}
          />
        )}
      </label>
    );
  }

  return (
    <SectionShell title="Big Story" onSave={() => void save(story)} saveState={state}>
      {field('headline', 'Headline')}
      {field('summary', 'Summary', true)}
      {field('whatHappened', 'What Happened', true)}
      {field('whyItMatters', 'Why It Matters', true)}
      {field('whatChangesNow', 'What Changes Now', true)}
      {field('link', 'Link (optional)')}
    </SectionShell>
  );
}

// --- Scoreboard -------------------------------------------------------------------

function ScoreboardSection({
  initial,
  onSave,
}: {
  initial: ScoreboardGroup[];
  onSave: (partial: NewsletterIssueContent) => Promise<void>;
}) {
  const [groups, setGroups] = useState<ScoreboardGroup[]>(
    initial.length ? initial : [{ sport: '', items: [] }],
  );
  const { state, save } = useSectionSave<ScoreboardGroup[]>('scoreboard', onSave);

  return (
    <SectionShell
      title="Scoreboard"
      onSave={() => void save(groups.filter((group) => group.sport.trim()))}
      saveState={state}
    >
      {groups.map((group, groupIndex) => (
        <div key={groupIndex} className="rounded-sm border border-border p-3">
          <div className="flex items-center gap-2">
            <input
              value={group.sport}
              onChange={(event) =>
                setGroups((current) =>
                  current.map((g, i) =>
                    i === groupIndex ? { ...g, sport: event.target.value } : g,
                  ),
                )
              }
              placeholder="Sport (e.g. Football)"
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setGroups((current) => current.filter((_, i) => i !== groupIndex))}
              className="shrink-0 rounded-sm border border-border px-2 text-xs text-muted-foreground hover:bg-background"
            >
              Remove group
            </button>
          </div>
          <div className="mt-2 space-y-2">
            {group.items.map((item, itemIndex) => (
              <div key={itemIndex} className="flex gap-2">
                <input
                  value={item.label}
                  onChange={(event) =>
                    setGroups((current) =>
                      current.map((g, i) =>
                        i === groupIndex
                          ? {
                              ...g,
                              items: g.items.map((it, j) =>
                                j === itemIndex ? { ...it, label: event.target.value } : it,
                              ),
                            }
                          : g,
                      ),
                    )
                  }
                  placeholder="Match/label"
                  className={inputClass}
                />
                <input
                  value={item.result}
                  onChange={(event) =>
                    setGroups((current) =>
                      current.map((g, i) =>
                        i === groupIndex
                          ? {
                              ...g,
                              items: g.items.map((it, j) =>
                                j === itemIndex ? { ...it, result: event.target.value } : it,
                              ),
                            }
                          : g,
                      ),
                    )
                  }
                  placeholder="Result"
                  className={inputClass}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setGroups((current) =>
                  current.map((g, i) =>
                    i === groupIndex ? { ...g, items: [...g.items, { label: '', result: '' }] } : g,
                  ),
                )
              }
              className="text-sm text-primary hover:underline"
            >
              + Add result
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setGroups((current) => [...current, { sport: '', items: [] }])}
        className="text-sm text-primary hover:underline"
      >
        + Add sport group
      </button>
    </SectionShell>
  );
}

// --- Numbers of the Week -----------------------------------------------------------

function NumbersSection({
  initial,
  onSave,
}: {
  initial: NumberItem[];
  onSave: (partial: NewsletterIssueContent) => Promise<void>;
}) {
  const [items, setItems] = useState<NumberItem[]>(
    initial.length ? initial : [{ value: '', caption: '' }],
  );
  const { state, save } = useSectionSave<NumberItem[]>('numbers', onSave);

  return (
    <SectionShell
      title="Numbers of the Week"
      onSave={() => void save(items.filter((item) => item.value.trim()))}
      saveState={state}
    >
      {items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <input
            value={item.value}
            onChange={(event) =>
              setItems((current) =>
                current.map((entry, i) =>
                  i === index ? { ...entry, value: event.target.value } : entry,
                ),
              )
            }
            placeholder="e.g. 47"
            className={`${inputClass} max-w-32`}
          />
          <input
            value={item.caption}
            onChange={(event) =>
              setItems((current) =>
                current.map((entry, i) =>
                  i === index ? { ...entry, caption: event.target.value } : entry,
                ),
              )
            }
            placeholder="Caption"
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => setItems((current) => current.filter((_, i) => i !== index))}
            className="shrink-0 rounded-sm border border-border px-2 text-xs text-muted-foreground hover:bg-background"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setItems((current) => [...current, { value: '', caption: '' }])}
        className="text-sm text-primary hover:underline"
      >
        + Add number
      </button>
    </SectionShell>
  );
}

// --- Story You May Have Missed ------------------------------------------------------

function MissedStorySection({
  initial,
  onSave,
}: {
  initial: MissedStory | undefined;
  onSave: (partial: NewsletterIssueContent) => Promise<void>;
}) {
  const [story, setStory] = useState<MissedStory>(
    initial ?? { headline: '', summary: '', link: '' },
  );
  const { state, save } = useSectionSave<MissedStory>('missedStory', onSave);

  return (
    <SectionShell
      title="Story You May Have Missed"
      onSave={() => void save(story)}
      saveState={state}
    >
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Headline</span>
        <input
          value={story.headline}
          onChange={(event) =>
            setStory((current) => ({ ...current, headline: event.target.value }))
          }
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Summary</span>
        <textarea
          value={story.summary}
          onChange={(event) => setStory((current) => ({ ...current, summary: event.target.value }))}
          className={textareaClass}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Link (optional)</span>
        <input
          value={story.link ?? ''}
          onChange={(event) => setStory((current) => ({ ...current, link: event.target.value }))}
          className={inputClass}
        />
      </label>
    </SectionShell>
  );
}

// --- Sports History ----------------------------------------------------------------

function HistorySection({
  initial,
  onSave,
}: {
  initial: HistoryItem | undefined;
  onSave: (partial: NewsletterIssueContent) => Promise<void>;
}) {
  const [item, setItem] = useState<HistoryItem>(initial ?? { year: '', headline: '', summary: '' });
  const { state, save } = useSectionSave<HistoryItem>('history', onSave);

  return (
    <SectionShell
      title="This Week in Sports History"
      onSave={() => void save(item)}
      saveState={state}
    >
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Year</span>
        <input
          value={item.year}
          onChange={(event) => setItem((current) => ({ ...current, year: event.target.value }))}
          className={`${inputClass} max-w-32`}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Headline</span>
        <input
          value={item.headline}
          onChange={(event) => setItem((current) => ({ ...current, headline: event.target.value }))}
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Summary</span>
        <textarea
          value={item.summary}
          onChange={(event) => setItem((current) => ({ ...current, summary: event.target.value }))}
          className={textareaClass}
        />
      </label>
    </SectionShell>
  );
}

// --- SportBrain Challenge -----------------------------------------------------------

function ChallengeSection({
  issueId,
  initial,
  onSave,
}: {
  issueId: string;
  initial: NewsletterIssueContent['quiz'];
  onSave: (partial: NewsletterIssueContent) => Promise<void>;
}) {
  const [quiz, setQuiz] = useState(initial);
  const [pickerOpen, setPickerOpen] = useState(false);
  const { state, save } = useSectionSave<NewsletterIssueContent['quiz']>('quiz', onSave);

  return (
    <SectionShell title="The SportBrain Challenge" onSave={() => void save(quiz)} saveState={state}>
      {quiz?.questionSnapshot ? (
        <div className="rounded-sm border border-border p-3">
          <p className="text-sm font-medium">{quiz.questionSnapshot.questionText}</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {quiz.questionSnapshot.options.map((option) => (
              <li key={option.optionCode}>
                {option.optionCode}. {option.optionText} {option.isCorrect && '✓'}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No question selected yet.</p>
      )}
      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="rounded-sm border border-border px-3 py-1.5 text-sm hover:bg-background"
      >
        {quiz ? 'Change question' : 'Pick a question'}
      </button>
      {pickerOpen && (
        <QuestionPickerModal
          onClose={() => setPickerOpen(false)}
          onPick={(picked) => {
            setQuiz({
              questionId: picked.id,
              questionSnapshot: {
                questionText: picked.questionText,
                options: picked.options.map((option) => ({
                  optionCode: option.optionCode,
                  optionText: option.optionText,
                  isCorrect: Boolean(option.isCorrect),
                })),
                explanation: picked.explanation,
              },
            });
            setPickerOpen(false);
          }}
        />
      )}
      <p className="text-xs text-muted-foreground">Issue: {issueId}</p>
    </SectionShell>
  );
}

// --- What to Watch --------------------------------------------------------------

function WatchNextSection({
  initial,
  onSave,
}: {
  initial: WatchNextItem[];
  onSave: (partial: NewsletterIssueContent) => Promise<void>;
}) {
  const [items, setItems] = useState<WatchNextItem[]>(
    initial.length ? initial : [{ sport: '', event: '', datetime: '', context: '', link: '' }],
  );
  const { state, save } = useSectionSave<WatchNextItem[]>('watchNext', onSave);

  return (
    <SectionShell
      title="What to Watch"
      onSave={() => void save(items.filter((item) => item.event.trim()))}
      saveState={state}
    >
      {items.map((item, index) => (
        <div key={index} className="grid grid-cols-2 gap-2 rounded-sm border border-border p-3">
          <input
            value={item.sport}
            onChange={(event) =>
              setItems((current) =>
                current.map((entry, i) =>
                  i === index ? { ...entry, sport: event.target.value } : entry,
                ),
              )
            }
            placeholder="Sport"
            className={inputClass}
          />
          <input
            value={item.event}
            onChange={(event) =>
              setItems((current) =>
                current.map((entry, i) =>
                  i === index ? { ...entry, event: event.target.value } : entry,
                ),
              )
            }
            placeholder="Event"
            className={inputClass}
          />
          <input
            value={item.datetime}
            onChange={(event) =>
              setItems((current) =>
                current.map((entry, i) =>
                  i === index ? { ...entry, datetime: event.target.value } : entry,
                ),
              )
            }
            placeholder="When (e.g. Sat 3pm ET)"
            className={inputClass}
          />
          <input
            value={item.link ?? ''}
            onChange={(event) =>
              setItems((current) =>
                current.map((entry, i) =>
                  i === index ? { ...entry, link: event.target.value } : entry,
                ),
              )
            }
            placeholder="Link (optional)"
            className={inputClass}
          />
          <input
            value={item.context ?? ''}
            onChange={(event) =>
              setItems((current) =>
                current.map((entry, i) =>
                  i === index ? { ...entry, context: event.target.value } : entry,
                ),
              )
            }
            placeholder="Context (optional)"
            className={`${inputClass} col-span-2`}
          />
          <button
            type="button"
            onClick={() => setItems((current) => current.filter((_, i) => i !== index))}
            className="col-span-2 rounded-sm border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-background"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          setItems((current) => [
            ...current,
            { sport: '', event: '', datetime: '', context: '', link: '' },
          ])
        }
        className="text-sm text-primary hover:underline"
      >
        + Add upcoming event
      </button>
    </SectionShell>
  );
}

// --- From SportBrainHQ -------------------------------------------------------------

function SportbrainLinksSection({
  issueId,
  initial,
  onSave,
}: {
  issueId: string;
  initial: NonNullable<NewsletterIssueContent['sportbrainLinks']>;
  onSave: (partial: NewsletterIssueContent) => Promise<void>;
}) {
  const [links, setLinks] = useState(initial);
  const [pickerOpen, setPickerOpen] = useState(false);
  const { state, save } = useSectionSave<typeof links>('sportbrainLinks', onSave);

  return (
    <SectionShell title="From SportBrainHQ" onSave={() => void save(links)} saveState={state}>
      <ul className="space-y-2">
        {links.map((link, index) => (
          <li
            key={index}
            className="flex items-center justify-between rounded-sm border border-border p-2 text-sm"
          >
            <span>
              {link.label} <span className="text-muted-foreground">({link.type})</span>
            </span>
            <button
              type="button"
              onClick={() => setLinks((current) => current.filter((_, i) => i !== index))}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              Remove
            </button>
          </li>
        ))}
        {links.length === 0 && <p className="text-sm text-muted-foreground">Nothing linked yet.</p>}
      </ul>
      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="rounded-sm border border-border px-3 py-1.5 text-sm hover:bg-background"
      >
        Add content
      </button>
      {pickerOpen && (
        <ContentPickerModal
          onClose={() => setPickerOpen(false)}
          onPick={(picked) => {
            setLinks((current) => [
              ...current,
              {
                type: 'content' as const,
                refId: picked.id,
                label: picked.title,
                url: `https://sportbrainhq.com/${picked.type}s/${picked.slug}`,
              },
            ]);
            setPickerOpen(false);
          }}
        />
      )}
      <p className="text-xs text-muted-foreground">Issue: {issueId}</p>
    </SectionShell>
  );
}
