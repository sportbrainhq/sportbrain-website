import Link from 'next/link';

/**
 * Golf overview diagrams.
 *
 * Six visual blocks for the golf Overview, sharing one primitive with the
 * Formula 1 overview's blocks: a labelled chain of steps. The grammar is worth
 * reusing rather than reinventing, because a reader who has learned to read a
 * chain on one sport's page reads the next sport's for free.
 *
 * Golf reduces to a chain more often than most sports. A hole is tee shot,
 * approach, short game, putt. A tournament is four rounds with a cut in the
 * middle. A handicap is a pipeline of four calculations, each feeding the next,
 * and that pipeline is precisely what a reader cannot hold in their head from
 * prose alone.
 *
 * Two blocks are deliberately not chains. `CourseAnatomy` is a labelled drawing,
 * because the parts of a hole are a place rather than a sequence. `ScoringLadder`
 * and `LeaderboardExample` are tables, because a ladder of scores and a
 * leaderboard are grids of numbers that a screen reader navigates better as a
 * real table than as any SVG.
 *
 * ## Why these are static
 *
 * Nothing here reads from the API. Every value is structural: that a par 4 is a
 * tee shot plus an approach plus two putts, and that a Handicap Index becomes a
 * Course Handicap before it becomes strokes, are properties of the sport rather
 * than of this season. Anything that moves annually, prize funds, exemption
 * counts, ranking point allocations, is deliberately absent and handled as
 * seeded prose, so nothing here can go stale without a Rules change.
 *
 * ## Why this is separate from `golf-diagrams.tsx`
 *
 * That file renders payloads carried on explainer sections: a hole plan, a
 * scorecard, a strokes-gained table, each parsed from seeded structured data.
 * These are fixed illustrations for one page with no data behind them. Two
 * different jobs, and keeping them apart means the Overview cannot break when
 * an explainer payload's shape changes.
 *
 * Imported only by the Overview page, and only for golf. No other sport's page
 * grows a branch because this exists.
 */

/* ────────────────────────────────────────────────────────────────────────────
 * Shared primitives
 * ────────────────────────────────────────────────────────────────────────── */

/** One stage in a sequence. */
export interface GolfFlowStep {
  label: string;
  /** One line on what happens here. Omitted where the label says it all. */
  detail?: string;
  /**
   * Renders with emphasis: the outcome the sequence exists to produce.
   *
   * The ball in the hole, the champion, the strokes a player actually receives.
   * Used at most once per chain, because emphasising everything emphasises
   * nothing.
   */
  terminal?: boolean;
}

/**
 * A sequence of stages, drawn as a chain.
 *
 * Horizontal with arrows between the steps where there is room, vertical on a
 * narrow screen. Both are the same markup: an ordered list whose direction is a
 * breakpoint, which keeps it a list to a screen reader in either layout.
 *
 * The arrows are decorative and marked `aria-hidden`. The list is already
 * ordered, so a screen reader announcing "1, 2, 3" carries the sequence, and
 * announcing an arrow between each pair would only add noise.
 */
export function GolfFlowChain({
  steps,
  dense = false,
}: {
  steps: GolfFlowStep[];
  dense?: boolean;
}) {
  if (steps.length === 0) return null;

  return (
    <ol className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-stretch">
      {/* Keyed by position rather than by label: a chain can legitimately
          revisit a label, as the tournament chain does when round three follows
          round two, so a step's identity is where it sits rather than its name. */}
      {steps.map((step, index) => (
        <li key={index} className="flex items-center gap-2 sm:flex-1 sm:basis-40">
          <div
            className={[
              'w-full rounded-lg border bg-card px-3',
              dense ? 'py-2' : 'py-2.5',
              step.terminal ? 'border-foreground/30' : 'border-border',
            ].join(' ')}
          >
            <span
              className={[
                'block text-xs leading-snug',
                step.terminal ? 'font-bold' : 'font-semibold',
              ].join(' ')}
            >
              {step.label}
            </span>
            {step.detail && (
              <span className="mt-0.5 block text-2xs leading-snug text-muted-foreground">
                {step.detail}
              </span>
            )}
          </div>
          {index < steps.length - 1 && (
            <span
              aria-hidden
              className="shrink-0 text-xs text-muted-foreground max-sm:rotate-90 max-sm:self-center"
            >
              →
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

/** A titled block wrapping one diagram, with its explanatory caption. */
function DiagramBlock({
  title,
  caption,
  children,
}: {
  title: string;
  caption?: string;
  children: React.ReactNode;
}) {
  return (
    <figure>
      <figcaption className="mb-2 text-2xs font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </figcaption>
      {children}
      {caption && (
        <p className="mt-2 max-w-2xl text-xs leading-relaxed text-muted-foreground">{caption}</p>
      )}
    </figure>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * How a hole is played
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * A hole, then the round those holes add up to.
 *
 * Two chains rather than one, because they operate at different scales. Running
 * them together would suggest that "the next hole" follows "the putt" the way
 * "the putt" follows "the approach", and it does not: a hole ends, the score is
 * written down, and a new one starts from nothing.
 */
export function HoleFlow() {
  return (
    <div className="space-y-6">
      <DiagramBlock
        title="One hole, from tee to cup"
        caption="A par 4 in its textbook form: a tee shot, an approach to the green, and two putts. A par 3 is short enough to skip the tee shot's separate role, since the tee shot is the approach. A par 5 adds a third full shot before the green."
      >
        <GolfFlowChain
          steps={[
            { label: 'Tee shot', detail: 'From the teeing area, ball on a tee' },
            { label: 'Approach', detail: 'To the putting green' },
            { label: 'Short game', detail: 'Only if the approach missed' },
            { label: 'Putting', detail: 'On the green, usually two putts' },
            { label: 'Ball in the hole', detail: 'Count the strokes taken', terminal: true },
          ]}
        />
      </DiagramBlock>

      <DiagramBlock
        title="One round"
        caption="Eighteen separate contests played in a fixed order, with nothing carried between them except the running total. The front nine was historically played away from the clubhouse and the back nine back towards it, which is where the names come from."
      >
        <GolfFlowChain
          dense
          steps={[
            { label: 'Holes 1 to 9', detail: 'The front nine, "out"' },
            { label: 'Turn', detail: 'The walk back past the clubhouse' },
            { label: 'Holes 10 to 18', detail: 'The back nine, "in"' },
            { label: 'Total strokes', detail: 'Quoted against par', terminal: true },
          ]}
        />
      </DiagramBlock>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * The ground
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * The parts of a hole, drawn rather than listed.
 *
 * The one block here that is genuinely a picture, because the subject is a
 * place. A reader who does not know where the fringe is relative to the green
 * cannot be told in a sentence, and the words themselves are half of what a
 * beginner is missing.
 *
 * The drawing is portrait with the tee at the bottom, which is how a golfer
 * sees a hole: from behind the ball, looking forward. The labels sit in a list
 * beneath rather than on the drawing, because six labels on a 100-unit SVG
 * overlap at any readable font size, and a list stays legible on a phone and
 * reads correctly aloud.
 */
const HOLE_PARTS: { name: string; detail: string; className: string }[] = [
  {
    name: 'Teeing area',
    detail: 'Where each hole starts, and the only place a tee peg may be used.',
    className: 'fill-emerald-500/45 dark:fill-emerald-300/35',
  },
  {
    name: 'Fairway',
    detail: 'Closely mown, so the ball sits up and the strike is predictable.',
    className: 'fill-emerald-600/35 dark:fill-emerald-400/30',
  },
  {
    name: 'Rough',
    detail: 'Longer grass either side. The ball sits down and control disappears.',
    className: 'fill-emerald-900/25 dark:fill-emerald-400/15',
  },
  {
    name: 'Bunker',
    detail: 'A prepared area of sand, with its own restrictions on what you may touch.',
    className: 'fill-amber-300/70 dark:fill-amber-200/55',
  },
  {
    name: 'Penalty area',
    detail: 'Water or marked ground. One stroke to take relief from it.',
    className: 'fill-sky-500/45 dark:fill-sky-400/40',
  },
  {
    name: 'Green',
    detail: 'The very short grass holding the cup, where the ball is putted.',
    className: 'fill-emerald-400/55 dark:fill-emerald-300/45',
  },
];

export function CourseAnatomy() {
  return (
    <DiagramBlock
      title="The anatomy of a hole"
      caption="Seen from behind the tee, playing from the bottom of the drawing to the top. The proportions are illustrative: a real hole is far longer than it is wide, and the fairway on a 400-yard par 4 is roughly thirty yards across."
    >
      <div className="grid gap-4 sm:grid-cols-[minmax(0,15rem)_1fr] sm:items-start">
        <svg
          viewBox="0 0 100 100"
          role="img"
          aria-label="A golf hole seen from behind the tee: a teeing area at the bottom, a fairway running up the middle flanked by rough, a bunker beside the fairway, a penalty area short of the green, and the green with the flag at the top."
          className="w-full rounded-lg border border-border bg-card"
        >
          {/* Rough first, as the ground everything else sits on. */}
          <rect x="0" y="0" width="100" height="100" className={HOLE_PARTS[2]!.className} />

          {/* Fairway, narrowing towards the green the way a real hole does. */}
          <polygon points="34,92 66,92 70,52 42,42 32,58" className={HOLE_PARTS[1]!.className} />

          {/* Teeing area. */}
          <rect x="42" y="92" width="16" height="6" className={HOLE_PARTS[0]!.className} />

          {/* Fairway bunker, on the side of the hole a player is tempted by. */}
          <ellipse cx="74" cy="56" rx="6" ry="4" className={HOLE_PARTS[3]!.className} />

          {/* Penalty area guarding the front of the green. */}
          <rect x="30" y="30" width="44" height="8" className={HOLE_PARTS[4]!.className} />

          {/* Green, with a greenside bunker and the flag. */}
          <ellipse cx="53" cy="18" rx="18" ry="11" className={HOLE_PARTS[5]!.className} />
          <ellipse cx="74" cy="22" rx="6" ry="4" className={HOLE_PARTS[3]!.className} />
          <line x1="53" y1="18" x2="53" y2="8" className="stroke-foreground [stroke-width:0.8]" />
          <polygon points="53,8 61,10.5 53,13" className="fill-foreground" />
        </svg>

        <ol className="space-y-1.5 text-xs">
          {HOLE_PARTS.map((part) => (
            <li key={part.name} className="flex gap-2">
              <svg viewBox="0 0 10 10" aria-hidden className="mt-0.5 h-3 w-3 shrink-0 rounded-sm">
                <rect x="0" y="0" width="10" height="10" className={part.className} />
              </svg>
              <span>
                <span className="font-semibold">{part.name}.</span>{' '}
                <span className="text-muted-foreground">{part.detail}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </DiagramBlock>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Scoring
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * The names for a hole's score, as a ladder against par.
 *
 * A table rather than a chain, because the relationship is a scale rather than
 * a sequence: these are not steps that follow one another, they are positions
 * on a number line, and the middle of that line is par.
 *
 * The par 3, 4 and 5 columns exist because the single most common beginner
 * question is not "what is a birdie" but "what number is a birdie", and the
 * answer depends on which hole you are standing on.
 */
const SCORE_LADDER: { name: string; relative: string; par3: string; par4: string; par5: string }[] =
  [
    { name: 'Albatross', relative: '3 under', par3: '—', par4: '1', par5: '2' },
    { name: 'Eagle', relative: '2 under', par3: '1', par4: '2', par5: '3' },
    { name: 'Birdie', relative: '1 under', par3: '2', par4: '3', par5: '4' },
    { name: 'Par', relative: 'Level', par3: '3', par4: '4', par5: '5' },
    { name: 'Bogey', relative: '1 over', par3: '4', par4: '5', par5: '6' },
    { name: 'Double bogey', relative: '2 over', par3: '5', par4: '6', par5: '7' },
    { name: 'Triple bogey', relative: '3 over', par3: '6', par4: '7', par5: '8' },
  ];

export function ScoringLadder() {
  return (
    <DiagramBlock
      title="The names for a score"
      caption="A hole-in-one is simply a score of one, which on a par 3 is an eagle and on a par 4 an albatross. Nobody calls it either: it has its own name because it is the shot golfers remember."
    >
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse text-left text-xs">
          <caption className="sr-only">
            Golf scoring names against par, with the stroke count each represents on a par 3, par 4
            and par 5.
          </caption>
          <thead>
            <tr className="bg-muted/50">
              <th scope="col" className="px-3 py-2 font-semibold">
                Name
              </th>
              <th scope="col" className="px-3 py-2 font-semibold">
                Against par
              </th>
              <th scope="col" className="px-3 py-2 text-center font-semibold">
                Par 3
              </th>
              <th scope="col" className="px-3 py-2 text-center font-semibold">
                Par 4
              </th>
              <th scope="col" className="px-3 py-2 text-center font-semibold">
                Par 5
              </th>
            </tr>
          </thead>
          <tbody>
            {SCORE_LADDER.map((row) => {
              const isPar = row.name === 'Par';
              return (
                <tr
                  key={row.name}
                  className={`border-t border-border ${isPar ? 'bg-muted/30' : ''}`}
                >
                  <th scope="row" className={`px-3 py-1.5 ${isPar ? 'font-bold' : 'font-medium'}`}>
                    {row.name}
                  </th>
                  <td className="px-3 py-1.5 text-muted-foreground">{row.relative}</td>
                  <td className="px-3 py-1.5 text-center tabular-nums">{row.par3}</td>
                  <td className="px-3 py-1.5 text-center tabular-nums">{row.par4}</td>
                  <td className="px-3 py-1.5 text-center tabular-nums">{row.par5}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </DiagramBlock>
  );
}

/**
 * A leaderboard, with the columns explained.
 *
 * The single most useful thing this page can show a newcomer, because a golf
 * leaderboard is sorted by a number that gets smaller as the golf gets better,
 * and nothing on the broadcast ever says so.
 *
 * The THRU column is why this is a table and not a paragraph. Different players
 * are at different points in their round, so the top of the board at any given
 * hour is frequently somebody who started early and will be passed, and that is
 * invisible unless the column is in front of you.
 */
const LEADERBOARD_ROWS: {
  pos: string;
  player: string;
  total: string;
  today: string;
  thru: string;
}[] = [
  { pos: '1', player: 'Player A', total: '-11', today: '-4', thru: 'F' },
  { pos: 'T2', player: 'Player B', total: '-9', today: '-2', thru: '13' },
  { pos: 'T2', player: 'Player C', total: '-9', today: '-5', thru: 'F' },
  { pos: '4', player: 'Player D', total: '-6', today: '+1', thru: '16' },
  { pos: '5', player: 'Player E', total: 'E', today: '-3', thru: 'F' },
];

export function LeaderboardExample() {
  return (
    <DiagramBlock
      title="Reading a leaderboard"
      caption="Player B and Player C are both 9 under, but B has five holes left to play and C has finished. On a live board those are very different positions, and the THRU column is the only thing that says so."
    >
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse text-left text-xs">
          <caption className="sr-only">
            An illustrative golf leaderboard showing position, player, tournament score to par,
            score to par for the current round, and holes completed.
          </caption>
          <thead>
            <tr className="bg-muted/50">
              <th scope="col" className="px-3 py-2 font-semibold">
                POS
              </th>
              <th scope="col" className="px-3 py-2 font-semibold">
                Player
              </th>
              <th scope="col" className="px-3 py-2 text-right font-semibold">
                TOTAL
              </th>
              <th scope="col" className="px-3 py-2 text-right font-semibold">
                TODAY
              </th>
              <th scope="col" className="px-3 py-2 text-right font-semibold">
                THRU
              </th>
            </tr>
          </thead>
          <tbody>
            {LEADERBOARD_ROWS.map((row) => (
              <tr key={row.player} className="border-t border-border">
                <td className="px-3 py-1.5 tabular-nums text-muted-foreground">{row.pos}</td>
                <th scope="row" className="px-3 py-1.5 font-medium">
                  {row.player}
                </th>
                <td
                  className={`px-3 py-1.5 text-right font-semibold tabular-nums ${
                    row.total.startsWith('-') ? 'text-red-700 dark:text-red-300' : ''
                  }`}
                >
                  {row.total}
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums text-muted-foreground">
                  {row.today}
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums text-muted-foreground">
                  {row.thru}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dl className="mt-3 space-y-1 text-xs text-muted-foreground">
        <div className="flex gap-2">
          <dt className="shrink-0 font-semibold text-foreground">TOTAL:</dt>
          <dd>
            Strokes against par for the whole tournament. Lower is better, so the leader carries the
            most negative number and sits at the top.
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="shrink-0 font-semibold text-foreground">TODAY:</dt>
          <dd>The same figure for the current round only.</dd>
        </div>
        <div className="flex gap-2">
          <dt className="shrink-0 font-semibold text-foreground">THRU:</dt>
          <dd>Holes completed in the current round. F means finished.</dd>
        </div>
        <div className="flex gap-2">
          <dt className="shrink-0 font-semibold text-foreground">E:</dt>
          <dd>Even par: exactly level with the standard, never written as 0.</dd>
        </div>
      </dl>
    </DiagramBlock>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * The tournament
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Four rounds and a cut.
 *
 * The cut gets its own emphasis because it is the structural feature that makes
 * professional golf unlike most sports: roughly half the field is eliminated
 * halfway through, having played the same golf as everybody else, and they
 * leave without a finishing position.
 */
export function TournamentFlow({ sportSlug }: { sportSlug: string }) {
  return (
    <DiagramBlock
      title="A four-round tournament"
      caption="Every player plays two rounds, then the field is cut to those inside a threshold and only they play the weekend. A tie after the fourth round goes to a playoff, most often sudden death, replaying a hole until somebody wins it outright."
    >
      <GolfFlowChain
        dense
        steps={[
          { label: 'Round 1', detail: 'Thursday' },
          { label: 'Round 2', detail: 'Friday' },
          { label: 'The cut', detail: 'Roughly half the field goes home' },
          { label: 'Round 3', detail: 'Saturday' },
          { label: 'Round 4', detail: 'Sunday' },
          { label: 'Lowest 72-hole total wins', terminal: true },
        ]}
      />

      <p className="mt-3 max-w-2xl text-xs leading-relaxed text-muted-foreground">
        The cut line is a score, not a fixed number of players, so it moves as scores come in and
        ties are carried rather than broken.{' '}
        <Link href={`/sports/${sportSlug}/explainers`} className="font-medium hover:underline">
          The explainers cover the cut, playoffs and how a field is filled
        </Link>
        .
      </p>
    </DiagramBlock>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Handicapping
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * How a handicap becomes strokes.
 *
 * A pipeline, drawn as one, because the single most common misunderstanding in
 * club golf is that a Handicap Index is a number of shots. It is not: it is
 * converted twice before anybody receives anything, and each conversion depends
 * on the course being played.
 *
 * The worked figures are illustrative and marked as such. They are here because
 * a pipeline of four named quantities is abstract until it has numbers in it,
 * and because the gap between an Index of 14.6 and 19 strokes is exactly the
 * thing the diagram exists to make visible.
 */
const HANDICAP_PIPELINE: { label: string; value: string; detail: string }[] = [
  {
    label: 'Score Differential',
    value: '17.5',
    detail: 'One round, corrected for the difficulty of the course and the tees played.',
  },
  {
    label: 'Handicap Index',
    value: '14.6',
    detail: 'The average of the best 8 differentials from the last 20 rounds. Portable anywhere.',
  },
  {
    label: 'Course Handicap',
    value: '19',
    detail: 'The Index converted for this course and these tees. A whole number of strokes.',
  },
  {
    label: 'Playing Handicap',
    value: '19',
    detail: 'After any competition allowance. In team formats this is often a percentage.',
  },
];

export function HandicapFlow({ sportSlug }: { sportSlug: string }) {
  return (
    <DiagramBlock
      title="From a round played to strokes received"
      caption="The figures are illustrative. The point is the chain: an Index is not a number of shots, and the same Index gives a different Course Handicap at every course and from every set of tees."
    >
      <ol className="space-y-2">
        {HANDICAP_PIPELINE.map((stage, index) => (
          <li key={stage.label} className="flex items-start gap-3">
            <span aria-hidden className="mt-2 shrink-0 text-2xs text-muted-foreground">
              {index === 0 ? '•' : '↓'}
            </span>
            <div
              className={[
                'w-full rounded-lg border bg-card px-3 py-2.5',
                index === HANDICAP_PIPELINE.length - 1 ? 'border-foreground/30' : 'border-border',
              ].join(' ')}
            >
              <div className="flex items-baseline justify-between gap-3">
                <span
                  className={[
                    'text-xs',
                    index === HANDICAP_PIPELINE.length - 1 ? 'font-bold' : 'font-semibold',
                  ].join(' ')}
                >
                  {stage.label}
                </span>
                <span className="shrink-0 font-semibold tabular-nums">{stage.value}</span>
              </div>
              <span className="mt-0.5 block text-2xs leading-snug text-muted-foreground">
                {stage.detail}
              </span>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-3 max-w-2xl text-xs leading-relaxed text-muted-foreground">
        The strokes are then allocated hole by hole using the stroke index printed on the card, so a
        player receiving nineteen gets one on every hole and a second on the hardest.{' '}
        <Link href={`/sports/${sportSlug}/explainers`} className="font-medium hover:underline">
          The explainers work each calculation through
        </Link>
        .
      </p>
    </DiagramBlock>
  );
}
