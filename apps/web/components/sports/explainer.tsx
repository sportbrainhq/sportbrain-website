import Link from 'next/link';
import { BasketballPlayDiagram, toCourtPlay } from './basketball-diagrams';
import {
  CricketFieldDiagram,
  ScorecardBreakdown,
  toFieldSetting,
  toScoreBreakdown,
} from './cricket-diagrams';
import type {
  ExplainerCategory,
  ExplainerRelated,
  ExplainerSection,
  ExplainerSource,
  ExplainerSummary,
} from '@sportbrain/contracts';

/**
 * Explainer primitives.
 *
 * Editorial rather than dashboard, matching the Overview: thin rules, restrained
 * type, no coloured cards. A knowledge library should look like a reference work
 * and not like a blog grid, so concepts are rows in a list rather than a wall of
 * identical rectangles.
 *
 * Nothing here knows what sport it is rendering.
 */

/** One concept in a listing. A row, not a card. */
export function ExplainerRow({
  sportSlug,
  explainer,
}: {
  sportSlug: string;
  explainer: ExplainerSummary;
}) {
  return (
    <Link
      href={`/sports/${sportSlug}/explainers/${explainer.slug}`}
      className="group flex items-baseline justify-between gap-4 border-b border-border py-3 transition-colors last:border-b-0 hover:bg-muted/40"
    >
      <span className="min-w-0">
        <span className="block font-medium">{explainer.title}</span>
        {explainer.shortDescription && (
          <span className="mt-0.5 block text-sm leading-snug text-muted-foreground">
            {explainer.shortDescription}
          </span>
        )}
      </span>
      <span className="flex shrink-0 items-baseline gap-3">
        <ExplainerMeta difficulty={explainer.difficulty} readMinutes={explainer.readMinutes} />
        <span
          aria-hidden
          className="text-muted-foreground transition-transform group-hover:translate-x-0.5"
        >
          →
        </span>
      </span>
    </Link>
  );
}

/**
 * Difficulty and reading time.
 *
 * Small, uppercase and grey. It is orientation rather than content, and giving
 * it any more weight would compete with the title it sits beside.
 */
export function ExplainerMeta({
  difficulty,
  readMinutes,
}: {
  difficulty: string;
  readMinutes: number | null;
}) {
  return (
    <span className="hidden text-2xs uppercase tracking-wider text-muted-foreground sm:inline">
      {difficulty}
      {readMinutes ? ` · ${readMinutes} min` : ''}
    </span>
  );
}

/** One category with its preview and a link to the rest. */
export function CategorySection({
  sportSlug,
  category,
}: {
  sportSlug: string;
  category: ExplainerCategory;
}) {
  const hasMore = category.totalCount > category.explainers.length;

  return (
    <section id={category.slug} className="scroll-mt-24">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-lg font-bold tracking-tight">{category.name}</h2>
        {hasMore && (
          <Link
            href={`/sports/${sportSlug}/explainers/category/${category.slug}`}
            className="shrink-0 text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            View all →
          </Link>
        )}
      </div>
      {category.description && (
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{category.description}</p>
      )}
      <div className="mt-3">
        {category.explainers.map((explainer) => (
          <ExplainerRow key={explainer.id} sportSlug={sportSlug} explainer={explainer} />
        ))}
      </div>
    </section>
  );
}

/**
 * The category jump bar.
 *
 * Scrolls horizontally on narrow screens rather than wrapping into several
 * rows, which would push the content below the fold on a phone.
 */
export function CategoryNav({ categories }: { categories: ExplainerCategory[] }) {
  if (categories.length === 0) return null;

  return (
    <nav aria-label="Explainer categories" className="scrollbar-thin -mx-1 overflow-x-auto">
      <ul className="flex min-w-max gap-1 px-1 pb-1">
        {categories.map((category) => (
          <li key={category.id}>
            <a
              href={`#${category.slug}`}
              className="block whitespace-nowrap rounded-full border border-border px-3 py-1.5 text-xs transition-colors hover:border-foreground/20 hover:bg-muted/50"
            >
              {category.shortName ?? category.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * A formation, drawn from coordinates.
 *
 * SVG from stored positions rather than an image: it stays sharp at any size,
 * inherits the theme's colours instead of baking in one background, and carries
 * a real text description for readers who cannot see it.
 */
export function FormationDiagram({ shape, title }: { shape: FormationShape; title: string }) {
  return (
    <figure className="mx-auto max-w-sm">
      <svg
        viewBox="0 0 100 110"
        role="img"
        aria-label={`${title}: ${shape.positions.map((position) => position.role).join(', ')}`}
        className="w-full rounded-lg border border-border bg-card"
      >
        {/* Pitch markings, deliberately faint: they orient the reader without
            competing with the players. */}
        <g stroke="currentColor" className="text-border" fill="none" strokeWidth="0.4">
          <rect x="2" y="2" width="96" height="106" rx="1" />
          <line x1="2" y1="100" x2="98" y2="100" />
          <rect x="28" y="2" width="44" height="16" />
          <rect x="40" y="2" width="20" height="7" />
          <circle cx="50" cy="100" r="10" />
        </g>

        {shape.positions.map((position, index) => (
          <g key={`${position.label}-${index}`}>
            <circle cx={position.x} cy={106 - position.y} r="5" className="fill-foreground/85" />
            <text
              x={position.x}
              y={106 - position.y}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-background"
              style={{ fontSize: '4px', fontWeight: 700 }}
            >
              {position.label}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="mt-2 text-center text-xs text-muted-foreground">
        {title}, shown attacking upwards.
      </figcaption>
    </figure>
  );
}

export interface FormationShape {
  positions: { label: string; role: string; x: number; y: number }[];
}

/**
 * Reads a formation shape out of a section's structured data.
 *
 * Validated at the point of use rather than at the contract boundary, because
 * only this component cares what the payload contains and a discriminated union
 * would make every other consumer exhaust cases it never reads.
 */
export function toFormationShape(value: unknown): FormationShape | null {
  if (!value || typeof value !== 'object' || !('positions' in value)) return null;
  const positions = (value as { positions: unknown }).positions;
  if (!Array.isArray(positions) || positions.length === 0) return null;

  const parsed = positions.filter(
    (position): position is FormationShape['positions'][number] =>
      typeof position === 'object' &&
      position !== null &&
      typeof (position as { x?: unknown }).x === 'number' &&
      typeof (position as { y?: unknown }).y === 'number' &&
      typeof (position as { label?: unknown }).label === 'string' &&
      typeof (position as { role?: unknown }).role === 'string',
  );

  return parsed.length === positions.length ? { positions: parsed } : null;
}

/** Default headings, so a section without an explicit one still reads properly. */
const SECTION_HEADINGS: Record<string, string> = {
  one_sentence: 'In one sentence',
  simple_explanation: 'The simple explanation',
  how_it_works: 'How it works',
  example: 'Example',
  why_it_matters: 'Why it matters',
  common_misunderstandings: 'Common misunderstandings',
  key_takeaways: 'Key takeaways',
  the_law: 'What the Law says',
  in_practice: 'In practice',
  sanctions: 'Restart and sanctions',
  edge_cases: 'Edge cases',
  basic_structure: 'Basic structure',
  in_possession: 'In possession',
  out_of_possession: 'Out of possession',
  strengths: 'Strengths',
  weaknesses: 'Weaknesses',
  variations: 'Common variations',
  player_profiles: 'Suitable player profiles',
  movement: 'Movement',
  responsibilities: 'Responsibilities',
  what_it_measures: 'What it measures',
  how_it_is_calculated: 'How it is calculated',
  how_to_interpret: 'How to interpret it',
  what_it_does_not_tell_you: 'What it does not tell you',
  provider_differences: 'Provider differences',
  tactical_application: 'Tactical application',
  historical_context: 'Historical context',
  // Cricket templates. Headings rather than components: a dismissal's decision
  // sequence and a delivery's release are prose with their own name, and giving
  // each a type means a template is a set of rows rather than a parsed blob.
  format_differences: 'Format differences',
  when_you_will_see_it: "When you'll see it",
  step_by_step: 'Step by step',
  decision_sequence: 'The decision, step by step',
  reviews_and_technology: 'Reviews and technology',
  grip_and_release: 'Grip and release',
  what_the_batter_expects: 'What the batter expects',
  what_actually_happens: 'What actually happens',
  how_batters_counter_it: 'How batters counter it',
  footwork_and_bat_path: 'Footwork and bat path',
  scoring_area: 'Scoring area',
  risk: 'Risk',
  common_mistakes: 'Common mistakes',
  position_on_the_field: 'Where it is on the field',
  purpose: 'What it is for',
  when_it_is_used: 'When it is used',
  duration_and_structure: 'Duration and structure',
  result_types: 'How it can end',
  who_plays_it: 'Who plays it',
  reading_the_score: 'Reading the score',
  reading_a_batting_line: 'Reading a batting line',
  reading_a_bowling_analysis: 'Reading a bowling analysis',
  // Basketball templates. `rule_differences` is the one that carries weight: it
  // is where a concept says how the NBA, FIBA, the NCAA and the WNBA diverge,
  // which is what keeps one concept on one page instead of four.
  rule_differences: 'How the competitions differ',
  how_to_read_it: 'How to read it',
  the_action: 'The action',
  how_it_is_defended: 'How it is defended',
  counters: 'Counters',
  where_it_happens: 'Where it happens',
};

/**
 * One article section.
 *
 * `one_sentence` is given its own treatment because it answers the question the
 * reader arrived with, and burying it under a heading identical to every other
 * section's would waste it.
 */
export function ArticleSection({ section, title }: { section: ExplainerSection; title: string }) {
  // One visual per section, chosen by what the payload actually is rather than
  // by the sport. A formation, a fielding setting and a worked scoreline are
  // distinguishable from their shape, so adding a sport's diagram does not add
  // a branch on sport anywhere.
  const formation = toFormationShape(section.structuredData);
  const field = formation ? null : toFieldSetting(section.structuredData);
  const play = formation || field ? null : toCourtPlay(section.structuredData);
  const score = formation || field || play ? null : toScoreBreakdown(section.structuredData);

  if (section.type === 'one_sentence') {
    return (
      <section className="border-y border-border py-5">
        <h2 className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground">
          In one sentence
        </h2>
        <p className="mt-2 max-w-2xl text-lg leading-relaxed">{section.body}</p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-lg font-bold tracking-tight">
        {section.heading ?? SECTION_HEADINGS[section.type] ?? section.type}
      </h2>
      {formation && (
        <div className="mt-4">
          <FormationDiagram shape={formation} title={title} />
        </div>
      )}
      {field && (
        <div className="mt-4">
          <CricketFieldDiagram shape={field} title={title} />
        </div>
      )}
      {play && (
        <div className="mt-4">
          <BasketballPlayDiagram shape={play} title={title} />
        </div>
      )}
      {score && (
        <div className="mt-4">
          <ScorecardBreakdown breakdown={score} />
        </div>
      )}
      {section.body && (
        <div className="mt-3 max-w-2xl space-y-4 leading-relaxed text-foreground/90">
          <Markdown source={section.body} />
        </div>
      )}
    </section>
  );
}

/**
 * Markdown-lite: paragraphs, bullet lists and bold.
 *
 * Deliberately not a markdown library and never `dangerouslySetInnerHTML`. The
 * bodies are authored content bound for an editing pipeline, and stored XSS
 * from such a pipeline is the likeliest serious vulnerability for a content
 * site. Emitting React elements means nothing in the source can become markup.
 */
function Markdown({ source }: { source: string }) {
  const blocks = source.split(/\n\n+/);

  return (
    <>
      {blocks.map((block, index) => {
        const lines = block.split('\n');

        if (lines.every((line) => line.trimStart().startsWith('- '))) {
          return (
            <ul key={index} className="ml-5 list-disc space-y-1.5">
              {lines.map((line, lineIndex) => (
                <li key={lineIndex}>{renderInline(line.trimStart().slice(2))}</li>
              ))}
            </ul>
          );
        }

        return <p key={index}>{renderInline(block)}</p>;
      })}
    </>
  );
}

function renderInline(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={index} className="font-semibold">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
}

/** How each relation type is introduced, so the edge's meaning survives display. */
const RELATION_LABELS: Record<string, string> = {
  requires_understanding: 'Read first',
  part_of: 'Part of',
  contrasts_with: 'Compare with',
  used_in: 'Used in',
  variation_of: 'Variation of',
  measured_by: 'Measured by',
  related_to: 'Related',
};

/**
 * The related-concepts panel.
 *
 * Grouped by relation type rather than listed flat, because "read this first"
 * and "compare with this" are different invitations and flattening them throws
 * away the distinction the graph was built to carry.
 */
export function RelatedConcepts({
  sportSlug,
  related,
}: {
  sportSlug: string;
  related: ExplainerRelated[];
}) {
  if (related.length === 0) return null;

  const grouped = new Map<string, ExplainerRelated[]>();
  for (const entry of related) {
    grouped.set(entry.relationType, [...(grouped.get(entry.relationType) ?? []), entry]);
  }

  // Prerequisites first: if one of these links is worth following before
  // reading on, it should not be at the bottom of the list.
  const order = [
    'requires_understanding',
    'part_of',
    'variation_of',
    'used_in',
    'contrasts_with',
    'measured_by',
    'related_to',
  ];

  return (
    <section>
      <h2 className="text-lg font-bold tracking-tight">Related concepts</h2>
      <div className="mt-3 space-y-4">
        {order
          .filter((type) => grouped.has(type))
          .map((type) => (
            <div key={type}>
              <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground">
                {RELATION_LABELS[type] ?? type}
              </p>
              <ul className="mt-1.5 flex flex-wrap gap-2">
                {(grouped.get(type) ?? []).map((entry) => (
                  <li key={entry.id}>
                    <Link
                      href={`/sports/${sportSlug}/explainers/${entry.slug}`}
                      className="inline-block rounded-full border border-border px-3 py-1.5 text-sm transition-colors hover:border-foreground/20 hover:bg-muted/50"
                    >
                      {entry.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>
    </section>
  );
}

/**
 * The rule-provenance note.
 *
 * Shown only on content flagged as rule-sensitive, and stated plainly rather
 * than tucked into the sources panel. A no-ball or a powerplay explainer has one
 * weakness it cannot engineer away, which is that the rule may have changed
 * since somebody checked, and naming the edition and the review date is the
 * honest way to hand the reader that fact.
 */
export function RuleProvenance({
  isRuleSensitive,
  sourceRevision,
  lastReviewedAt,
}: {
  isRuleSensitive: boolean;
  sourceRevision: string | null;
  lastReviewedAt: string | null;
}) {
  if (!isRuleSensitive) return null;

  return (
    <aside className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
      <p>
        <span className="font-semibold text-foreground">Rule-dependent content.</span> Laws and
        playing conditions are revised, and competitions vary.
        {sourceRevision ? ` Written against ${sourceRevision}.` : ''}
        {lastReviewedAt ? ` Last checked ${lastReviewedAt}.` : ''}
      </p>
    </aside>
  );
}

/** Provenance, folded away, matching the Overview's panel. */
export function ExplainerSources({ sources }: { sources: ExplainerSource[] }) {
  if (sources.length === 0) return null;

  return (
    <details className="rounded-lg border border-border bg-card px-4 py-3">
      <summary className="cursor-pointer text-sm font-medium">Sources</summary>
      <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
        {sources.map((source) => (
          <li key={source.id}>
            <a
              href={source.url}
              rel="noopener noreferrer nofollow"
              target="_blank"
              className="hover:underline"
            >
              {source.title}
            </a>
            {source.locator && <span className="ml-1.5">({source.locator})</span>}
          </li>
        ))}
      </ul>
    </details>
  );
}
