import Link from 'next/link';

/**
 * Formula 1 overview diagrams.
 *
 * Four visual blocks for the Formula 1 Overview, and one shared primitive
 * beneath all of them: a labelled chain of steps.
 *
 * The reason so much of Formula 1 reduces to a chain is that most of what a
 * newcomer needs is a sequence. A weekend is practice, then qualifying, then a
 * race. A race is a grid, a start, stops, a flag, a classification. A pit stop
 * is an entry, a box, a change, an exit. Each is a list of stages in a fixed
 * order, and drawing them the same way is the point: a reader learns the visual
 * grammar once and then reads three more diagrams for free.
 *
 * The championship block is the exception, and deliberately so. Two drivers
 * feeding one team total is a *join*, not a sequence, and drawing it as a chain
 * would state something false about how the constructors' title works. It gets
 * its own shape because its shape is the information.
 *
 * ## Why these are static
 *
 * Nothing here reads from the API. Every value is structural: the order of a
 * race weekend and the fact that two drivers' points add together are properties
 * of the sport, not of this season. Anything that changes annually, the points
 * values, the calendar, the grid, is deliberately absent and handled as
 * seeded prose instead, so nothing on this page can go stale without a
 * regulation change.
 *
 * Imported only by the Overview page, and only for Formula 1. No other sport's
 * page grows a branch because this exists.
 */

/* ────────────────────────────────────────────────────────────────────────────
 * The shared primitive
 * ────────────────────────────────────────────────────────────────────────── */

/** One stage in a sequence. */
export interface FlowStep {
  label: string;
  /** One line on what happens here. Omitted where the label says it all. */
  detail?: string;
  /**
   * Renders with emphasis: the outcome the sequence exists to produce.
   *
   * The world champion at the end of the season chain, the chequered flag at
   * the end of the race. Used at most once per chain, because emphasising
   * everything emphasises nothing.
   */
  terminal?: boolean;
}

/**
 * A sequence of stages, drawn as a chain.
 *
 * Horizontal with arrows between the steps where there is room, and vertical
 * on a narrow screen. Both are the same markup: an ordered list whose direction
 * is a breakpoint, which keeps it a list to a screen reader in either layout.
 *
 * The arrows are decorative and marked `aria-hidden`. The list is already
 * ordered, so a screen reader announcing "1, 2, 3" carries the sequence, and
 * announcing an arrow between each pair would only add noise.
 */
export function FlowChain({ steps, dense = false }: { steps: FlowStep[]; dense?: boolean }) {
  if (steps.length === 0) return null;

  return (
    <ol className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-stretch">
      {/* Keyed by position rather than by label: a chain can legitimately
          revisit a label, as the pit stop sequence does when it leaves the
          track and rejoins it, so the step's identity here is where it sits in
          the sequence rather than what it is called. */}
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
 * The season, and the weekend inside it
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * How a season resolves into a champion.
 *
 * Two chains rather than one long one, because they operate at different
 * scales: the first is a single weekend, the second is the season those
 * weekends add up to. Running them together as fourteen boxes would suggest
 * that "season standings" follows "race" the way "race" follows "qualifying",
 * and it does not.
 */
export function SeasonFlow() {
  return (
    <div className="space-y-6">
      <DiagramBlock
        title="One Grand Prix weekend"
        caption="Practice sets the car up and scores nothing. Qualifying sets the grid. The race is the only session of a standard weekend that awards championship points."
      >
        <FlowChain
          steps={[
            { label: 'Practice', detail: 'Set-up and tyre evaluation' },
            { label: 'Qualifying', detail: 'Sets the starting order' },
            { label: 'Starting grid', detail: 'Fastest first' },
            { label: 'Race', detail: 'The Grand Prix itself' },
            { label: 'Championship points', detail: 'To the leading finishers', terminal: true },
          ]}
        />
      </DiagramBlock>

      <DiagramBlock
        title="A season"
        caption="Points accumulate across every round. There is no play-off and no final: the standings after the last race are the championship."
      >
        <FlowChain
          steps={[
            { label: 'Points from each race' },
            { label: 'Season total' },
            { label: 'Season standings' },
            { label: 'World Champion', terminal: true },
          ]}
        />
      </DiagramBlock>
    </div>
  );
}

/**
 * The three days of a standard weekend, and how a sprint weekend differs.
 *
 * Days rather than sessions, because the day is how a viewer plans around it.
 * The sprint note is prose rather than a second chain: the format has been
 * revised repeatedly, and drawing a definitive sprint schedule would be the
 * one thing on this page most likely to be wrong within a season.
 */
export function WeekendSchedule() {
  const days = [
    {
      day: 'Friday',
      sessions: ['Practice'],
      note: 'Teams learn the circuit and the tyres. Nothing is at stake in the times.',
    },
    {
      day: 'Saturday',
      sessions: ['Final practice', 'Qualifying'],
      note: 'Qualifying sets the grid, and at some circuits that largely settles the race.',
    },
    {
      day: 'Sunday',
      sessions: ['Grand Prix'],
      note: 'The race, over a fixed distance, scoring points for the leading finishers.',
    },
  ];

  return (
    <DiagramBlock
      title="A standard weekend"
      caption="Exact session times differ by event and by time zone. A handful of rounds each season use the sprint format instead, replacing one practice session with a shorter race that scores its own points and has its own qualifying session. The Sunday Grand Prix is unchanged either way."
    >
      <ol className="grid gap-2 sm:grid-cols-3">
        {days.map((entry) => (
          <li key={entry.day} className="rounded-lg border border-border bg-card p-3">
            <span className="block text-2xs font-semibold uppercase tracking-widest text-muted-foreground">
              {entry.day}
            </span>
            <ul className="mt-1.5 space-y-0.5">
              {entry.sessions.map((session) => (
                <li key={session} className="text-sm font-semibold leading-snug">
                  {session}
                </li>
              ))}
            </ul>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{entry.note}</p>
          </li>
        ))}
      </ol>
    </DiagramBlock>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * The two championships
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * How one set of race results produces two championships.
 *
 * The drivers' side is a chain and the constructors' side is a join, and
 * showing them side by side is the whole argument: the difference between the
 * two titles is not what they reward but how the arithmetic reaches them.
 *
 * No points values appear anywhere here. They are set by the Sporting
 * Regulations, they have changed many times, and a diagram that hardcodes them
 * is wrong the season they change and gives no sign of it.
 */
export function ChampionshipSplit({ sportSlug }: { sportSlug: string }) {
  return (
    <DiagramBlock
      title="One race, two championships"
      caption="Both titles are decided from the same race results. A driver keeps the points they personally score; a team’s total is the sum of both its cars. The two titles regularly go to different combinations of driver and team."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-bold">Drivers’ Championship</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Rewards the individual driver with the strongest season of results.
          </p>
          <ol className="mt-3 space-y-1.5">
            {['Driver’s race points', 'Season total', 'Championship standings'].map(
              (step, index) => (
                <li key={index} className="flex items-baseline gap-2 text-sm">
                  <span aria-hidden className="text-2xs text-muted-foreground">
                    ↓
                  </span>
                  <span>{step}</span>
                </li>
              ),
            )}
          </ol>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-bold">Constructors’ Championship</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Rewards the team, on the combined points scored by both of its drivers.
          </p>
          <div className="mt-3">
            {/* The join, drawn as a join. Two sources feeding one total is the
                single structural fact this block exists to convey. */}
            <div className="grid grid-cols-2 gap-2">
              <span className="rounded-md border border-border px-2 py-1.5 text-center text-xs font-medium">
                Driver 1 points
              </span>
              <span className="rounded-md border border-border px-2 py-1.5 text-center text-xs font-medium">
                Driver 2 points
              </span>
            </div>
            <p aria-hidden className="my-1 text-center text-2xs text-muted-foreground">
              ↓
            </p>
            <ol className="space-y-1.5">
              {['Team total', 'Constructors’ standings'].map((step, index) => (
                <li key={index} className="flex items-baseline gap-2 text-sm">
                  <span aria-hidden className="text-2xs text-muted-foreground">
                    ↓
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Points per finishing position are set by the Sporting Regulations and have changed several
        times.{' '}
        <Link href={`/sports/${sportSlug}/explainers`} className="font-medium hover:underline">
          The explainers carry the current values
        </Link>
        .
      </p>
    </DiagramBlock>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * The race, and the pit stop inside it
 * ────────────────────────────────────────────────────────────────────────── */

/** From the grid to the points, and the lap that decides most of it. */
export function RaceFlow() {
  return (
    <div className="space-y-6">
      <DiagramBlock
        title="The race"
        caption="Very little of this is settled by outright pace. Tyres degrade, a stop costs time that has to be won back, a safety car can erase a lead, and a failure ends a race regardless of how it was going."
      >
        <FlowChain
          dense
          steps={[
            { label: 'Starting grid' },
            { label: 'Race start' },
            { label: 'Pit stops' },
            { label: 'Strategy and overtakes' },
            { label: 'Chequered flag' },
            { label: 'Classification' },
            { label: 'Points', terminal: true },
          ]}
        />
      </DiagramBlock>

      <DiagramBlock
        title="A pit stop"
        caption="The stop itself is measured in seconds, but the cost is the whole lap: time lost in the pit lane has to be won back on fresher tyres. Timing it well gains a position that could not have been taken on track."
      >
        <FlowChain
          dense
          steps={[
            { label: 'Track' },
            { label: 'Pit entry' },
            { label: 'Pit box' },
            { label: 'Tyre change' },
            { label: 'Pit exit' },
            { label: 'Track', terminal: true },
          ]}
        />
      </DiagramBlock>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Flags
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * The flag system, at the level of what a viewer needs to follow a race.
 *
 * Each flag carries a swatch, and each swatch carries its meaning in text
 * beside it. Colour is never the only channel: a reader who cannot distinguish
 * the green from the red still gets the whole diagram from the labels, which is
 * a hard requirement rather than a nicety for a block whose entire subject is
 * colour coding.
 *
 * The chequered flag has no single colour, so it is drawn as a pattern. The
 * black-and-white and black flags are summarised rather than enumerated: the
 * variants and what each obliges a driver to do are explainer material.
 */
export function FlagSystem() {
  const flags = [
    {
      name: 'Green',
      swatch: 'bg-emerald-500',
      meaning: 'Racing conditions. The track ahead is clear.',
    },
    {
      name: 'Yellow',
      swatch: 'bg-amber-400',
      meaning: 'Hazard ahead. Drivers must slow and may not overtake.',
    },
    { name: 'Red', swatch: 'bg-red-600', meaning: 'The session is stopped.' },
    {
      name: 'Blue',
      swatch: 'bg-blue-600',
      meaning: 'Shown to a driver about to be caught by faster traffic.',
    },
    {
      name: 'Black',
      swatch: 'bg-neutral-900',
      meaning: 'An instruction to one named driver, up to disqualification.',
    },
    {
      name: 'Chequered',
      swatch:
        'bg-[repeating-conic-gradient(theme(colors.neutral.900)_0%_25%,theme(colors.neutral.100)_0%_50%)] bg-[length:0.5rem_0.5rem]',
      meaning: 'The session or the race has finished.',
    },
  ];

  return (
    <DiagramBlock
      title="Flags"
      caption="What each flag obliges a driver to do, and the variants not shown here, are covered in the explainers."
    >
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {flags.map((flag) => (
          <li
            key={flag.name}
            className="flex items-start gap-3 rounded-lg border border-border bg-card p-3"
          >
            <span
              aria-hidden
              className={`mt-0.5 size-5 shrink-0 rounded-sm border border-border ${flag.swatch}`}
            />
            <span>
              <span className="block text-sm font-semibold">{flag.name}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                {flag.meaning}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </DiagramBlock>
  );
}
