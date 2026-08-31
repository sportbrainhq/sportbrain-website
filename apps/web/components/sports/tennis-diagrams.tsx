/**
 * Tennis court and bracket diagrams.
 *
 * Two visual blocks, both driven by structured data on an explainer section
 * rather than by an image, for the same reasons the cricket field and the
 * basketball play are: the payload has to describe itself to a reader who
 * cannot see it, it has to stay legible in both themes, and most tennis
 * concepts worth a diagram are sequences rather than single frames.
 *
 * The court is the workhorse. Serving, the lines, the service boxes, the
 * doubles alleys, tiebreak serve order, doubles formations and the tactical
 * patterns all reduce to "points and arrows on a marked rectangle", so one
 * payload type covers eight categories rather than each growing its own.
 *
 * Nothing here is imported by the football, cricket or basketball pages. The
 * article renderer picks a block by payload shape, so a sport contributes a
 * visual without every other sport's pages growing a branch.
 */

/* ────────────────────────────────────────────────────────────────────────────
 * Court
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * A person on court.
 *
 * `side` is stored rather than derived from `y`. "Near end" and "far end" is
 * how a rally is described, and a reader should not have to infer which end a
 * marker is at from a coordinate.
 */
export interface TennisCourtPlayer {
  id: string;
  /** Drawn in the marker: "S", "R", "A", "B". */
  label: string;
  side: 'near' | 'far';
  x: number;
  y: number;
  hasBall?: boolean;
  /** Draws this one filled: the player the step is about. */
  highlight?: boolean;
}

/** A ball flight, a bounce-to-bounce path or a player movement. */
export interface TennisCourtArrow {
  kind: 'ball' | 'move' | 'serve';
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  label?: string;
  /** Renders dashed and faint: the shot that was not played. */
  ghost?: boolean;
}

/** A bounce, a target or a landing point. Drawn as a small marked spot. */
export interface TennisCourtSpot {
  x: number;
  y: number;
  label?: string;
  kind?: 'in' | 'out' | 'target';
}

/** A highlighted region: a service box, an alley, a target zone. */
export interface TennisCourtZone {
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
}

export interface TennisCourtStep {
  /** "The server strikes from behind the baseline, right of the centre mark." */
  caption: string;
  players?: TennisCourtPlayer[];
  arrows?: TennisCourtArrow[];
  spots?: TennisCourtSpot[];
  zones?: TennisCourtZone[];
}

export interface TennisCourtShape {
  /** `doubles` draws the alleys as live; `singles` greys them out. */
  court: 'singles' | 'doubles';
  steps: TennisCourtStep[];
  /** Draws and names the baseline, service line, centre mark and so on. */
  showLabels?: boolean;
  caption?: string;
}

/**
 * Reads a court payload out of a section's structured data.
 *
 * Validated here rather than at the contract boundary, matching the other
 * sports' diagrams: only this component reads the shape, and a discriminated
 * union at the boundary would make every other consumer exhaust cases it never
 * touches.
 *
 * Deliberately strict about `steps`. A payload with no usable step renders
 * nothing rather than an empty court, because an empty court beside prose about
 * a kick serve reads as a broken page.
 */
export function toTennisCourt(value: unknown): TennisCourtShape | null {
  if (!value || typeof value !== 'object' || !('steps' in value)) return null;
  const candidate = value as Record<string, unknown>;
  // `court` is the discriminator against the basketball play, which also has
  // `steps`. Checking it first is what keeps one sport's payload from being
  // rendered by another sport's component.
  if (candidate.court !== 'singles' && candidate.court !== 'doubles') return null;
  if (!Array.isArray(candidate.steps) || candidate.steps.length === 0) return null;

  const steps = candidate.steps.filter((step): step is TennisCourtStep => {
    if (typeof step !== 'object' || step === null) return false;
    return typeof (step as Record<string, unknown>).caption === 'string';
  });

  if (steps.length === 0) return null;

  return {
    court: candidate.court,
    steps,
    showLabels: candidate.showLabels === true,
    caption: typeof candidate.caption === 'string' ? candidate.caption : undefined,
  };
}

/**
 * Court geometry, as percentages of the drawn area.
 *
 * A real court is 78 ft long and 36 ft wide across the doubles lines, and the
 * diagram keeps those proportions rather than squaring them off: the whole
 * point of several of these explainers is that the court is long and narrow,
 * and a square drawing would teach the opposite.
 *
 * x runs 0 (left doubles sideline) to 100 (right). y runs 0 (near baseline) to
 * 100 (far baseline), so a payload is written from the reader's end of the
 * court forward, and the flip into SVG coordinates happens in one place.
 */
const COURT = {
  /** Doubles sidelines. */
  left: 6,
  right: 94,
  /** Singles sidelines: the alleys are 4.5 ft of a 36 ft width. */
  singlesLeft: 17,
  singlesRight: 83,
  /** Baselines. */
  near: 6,
  far: 94,
  /** Service lines: 21 ft from the net on a 39 ft half. */
  nearService: 26.5,
  farService: 73.5,
  net: 50,
  centre: 50,
} as const;

/**
 * Describes a step in words.
 *
 * The caption says what happens; this says where everyone is and where the ball
 * went. Both are needed: a screen reader user gets the caption from the figure
 * and the geometry from the image label, and neither alone is the diagram.
 */
function describeStep(step: TennisCourtStep): string {
  const parts: string[] = [];

  for (const player of step.players ?? []) {
    parts.push(`${player.label} at the ${player.side === 'near' ? 'near' : 'far'} end`);
  }

  const serve = step.arrows?.find((arrow) => arrow.kind === 'serve');
  if (serve) parts.push('a serve is struck across the court');

  const balls = (step.arrows ?? []).filter((arrow) => arrow.kind === 'ball').length;
  if (balls > 0) parts.push(`${balls} ball flight${balls === 1 ? '' : 's'} shown`);

  for (const spot of step.spots ?? []) {
    if (spot.label) parts.push(spot.label);
    else if (spot.kind) parts.push(`a ball marked ${spot.kind}`);
  }

  for (const zone of step.zones ?? []) {
    if (zone.label) parts.push(`${zone.label} highlighted`);
  }

  return parts.length > 0 ? parts.join(', ') : step.caption;
}

/**
 * The court itself.
 *
 * Drawn faint, like the other sports' grounds: the markers carry the meaning
 * and the lines are there to orient them. The one exception is the net, which
 * is drawn solid, because half the concepts in the library are about which side
 * of it something happened on.
 */
function CourtMarkings({
  court,
  showLabels,
}: {
  court: 'singles' | 'doubles';
  showLabels?: boolean;
}) {
  const alleyClass = court === 'doubles' ? 'text-border' : 'text-border/40';

  return (
    <g fill="none" stroke="currentColor" strokeWidth="0.45">
      {/* Outer boundary: the doubles court. */}
      <g className={alleyClass}>
        <rect
          x={COURT.left}
          y={COURT.near}
          width={COURT.right - COURT.left}
          height={COURT.far - COURT.near}
        />
      </g>

      <g className="text-border">
        {/* Singles sidelines. */}
        <line x1={COURT.singlesLeft} y1={COURT.near} x2={COURT.singlesLeft} y2={COURT.far} />
        <line x1={COURT.singlesRight} y1={COURT.near} x2={COURT.singlesRight} y2={COURT.far} />

        {/* Service lines, and the centre service line joining them. */}
        <line
          x1={COURT.singlesLeft}
          y1={COURT.nearService}
          x2={COURT.singlesRight}
          y2={COURT.nearService}
        />
        <line
          x1={COURT.singlesLeft}
          y1={COURT.farService}
          x2={COURT.singlesRight}
          y2={COURT.farService}
        />
        <line x1={COURT.centre} y1={COURT.nearService} x2={COURT.centre} y2={COURT.farService} />

        {/* Centre marks: the short ticks that divide each baseline. */}
        <line x1={COURT.centre} y1={COURT.near} x2={COURT.centre} y2={COURT.near + 2.5} />
        <line x1={COURT.centre} y1={COURT.far} x2={COURT.centre} y2={COURT.far - 2.5} />
      </g>

      {/* The net. Solid, and drawn past the sidelines because the posts are
          outside the court. */}
      <g className="text-foreground/70">
        <line
          x1={COURT.left - 2.5}
          y1={COURT.net}
          x2={COURT.right + 2.5}
          y2={COURT.net}
          strokeWidth="1"
        />
      </g>

      {showLabels && (
        <g
          className="fill-muted-foreground"
          stroke="none"
          style={{ fontSize: '2.4px', fontWeight: 600 }}
        >
          <text x={COURT.centre} y={COURT.near - 1.5} textAnchor="middle">
            Baseline
          </text>
          <text x={COURT.singlesLeft - 1.5} y={COURT.net - 2} textAnchor="end">
            Net
          </text>
          <text x={COURT.centre} y={COURT.nearService - 1.5} textAnchor="middle">
            Service line
          </text>
          <text x={(COURT.left + COURT.singlesLeft) / 2} y={COURT.net + 12} textAnchor="middle">
            Alley
          </text>
        </g>
      )}
    </g>
  );
}

/** Arrowheads. One marker, reused: a shot and a run differ by dash, not by head. */
function ArrowDefs() {
  return (
    <defs>
      <marker
        id="tn-arrow"
        viewBox="0 0 10 10"
        refX="8"
        refY="5"
        markerWidth="4"
        markerHeight="4"
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" className="fill-foreground/60" />
      </marker>
    </defs>
  );
}

function StepDiagram({ step, shape }: { step: TennisCourtStep; shape: TennisCourtShape }) {
  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label={describeStep(step)}
      className="w-full min-w-[11rem] rounded-lg border border-border bg-card"
    >
      <ArrowDefs />

      {step.zones?.map((zone, index) => (
        <g key={`zone-${index}`}>
          <rect
            x={zone.x}
            y={zone.y}
            width={zone.width}
            height={zone.height}
            className="fill-foreground/10"
          />
          {zone.label && (
            <text
              x={zone.x + zone.width / 2}
              y={zone.y + zone.height / 2}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-foreground/70"
              style={{ fontSize: '2.6px', fontWeight: 700 }}
            >
              {zone.label}
            </text>
          )}
        </g>
      ))}

      <CourtMarkings court={shape.court} showLabels={shape.showLabels} />

      {step.arrows?.map((arrow, index) => (
        <g key={`arrow-${index}`}>
          <line
            x1={arrow.fromX}
            y1={arrow.fromY}
            x2={arrow.toX}
            y2={arrow.toY}
            className={arrow.ghost ? 'text-foreground/30' : 'text-foreground/70'}
            stroke="currentColor"
            strokeWidth={arrow.kind === 'move' ? '0.7' : '0.9'}
            strokeDasharray={arrow.ghost ? '1.5 1.5' : arrow.kind === 'move' ? '2.5 2' : undefined}
            markerEnd="url(#tn-arrow)"
          />
          {arrow.label && (
            <text
              x={(arrow.fromX + arrow.toX) / 2}
              y={(arrow.fromY + arrow.toY) / 2 - 1.5}
              textAnchor="middle"
              className="fill-foreground/70"
              style={{ fontSize: '2.5px', fontWeight: 600 }}
            >
              {arrow.label}
            </text>
          )}
        </g>
      ))}

      {step.spots?.map((spot, index) => (
        <g key={`spot-${index}`}>
          {/* An out ball is a cross and an in ball a filled dot, so the two are
              distinguishable without relying on colour. */}
          {spot.kind === 'out' ? (
            <g
              className="text-foreground"
              stroke="currentColor"
              strokeWidth="0.8"
              strokeLinecap="round"
            >
              <line x1={spot.x - 1.8} y1={spot.y - 1.8} x2={spot.x + 1.8} y2={spot.y + 1.8} />
              <line x1={spot.x + 1.8} y1={spot.y - 1.8} x2={spot.x - 1.8} y2={spot.y + 1.8} />
            </g>
          ) : spot.kind === 'target' ? (
            <circle
              cx={spot.x}
              cy={spot.y}
              r="2.2"
              className="fill-none stroke-foreground/70 [stroke-dasharray:1.2_1] [stroke-width:0.7]"
            />
          ) : (
            <circle cx={spot.x} cy={spot.y} r="1.7" className="fill-foreground" />
          )}
          {spot.label && (
            <text
              x={spot.x}
              y={spot.y - 3}
              textAnchor="middle"
              className="fill-foreground/80"
              style={{ fontSize: '2.5px', fontWeight: 600 }}
            >
              {spot.label}
            </text>
          )}
        </g>
      ))}

      {step.players?.map((player) => (
        <g key={player.id}>
          <circle
            cx={player.x}
            cy={player.y}
            r={player.highlight ? 3.6 : 3}
            className={
              player.highlight
                ? 'fill-foreground'
                : 'fill-card stroke-foreground/50 [stroke-width:0.6]'
            }
          />
          <text
            x={player.x}
            y={player.y}
            textAnchor="middle"
            dominantBaseline="central"
            className={player.highlight ? 'fill-background' : 'fill-foreground/75'}
            style={{ fontSize: '2.6px', fontWeight: 700 }}
          >
            {player.label}
          </text>
          {player.hasBall && (
            <circle
              cx={player.x + 3.8}
              cy={player.y - 3.4}
              r="1.4"
              className="fill-card stroke-foreground [stroke-width:0.6]"
            />
          )}
        </g>
      ))}
    </svg>
  );
}

/**
 * A court sequence, as a numbered stack of diagrams.
 *
 * One column on a phone and up to three from `sm` upward. A tennis court drawn
 * in portrait is narrow, so three fit across a desktop where three basketball
 * half-courts would not.
 */
export function TennisCourtDiagram({ shape, title }: { shape: TennisCourtShape; title: string }) {
  const single = shape.steps.length === 1;

  return (
    <figure>
      <ol
        className={
          single
            ? 'mx-auto max-w-[13rem] list-none'
            : 'grid list-none grid-cols-2 gap-4 sm:grid-cols-3'
        }
      >
        {shape.steps.map((step, index) => (
          <li key={index}>
            <StepDiagram step={step} shape={shape} />
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {!single && <span className="font-semibold text-foreground">{index + 1}. </span>}
              {step.caption}
            </p>
          </li>
        ))}
      </ol>
      <figcaption className="mt-3 text-xs text-muted-foreground">
        {shape.caption ?? `${title}: ${shape.court} court.`}
      </figcaption>
    </figure>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Draw bracket
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * One entry in a tournament draw.
 *
 * `seed` is separate from `name` so the renderer can set it in the way a draw
 * sheet does, and so an unseeded player is the absence of a number rather than
 * an empty string somebody has to remember not to print.
 */
export interface DrawEntrant {
  name: string;
  seed?: number;
  /** "Q", "WC", "LL", "PR", "Alt": how the player got into the draw. */
  status?: string;
  /** Draws the row emphasised: the player the explainer is about. */
  highlight?: boolean;
}

export interface DrawShape {
  /** "Round of 16", "Quarter-final". Labels the leftmost column. */
  rounds: string[];
  /**
   * The first round, in draw order. Pairs are read off two at a time, which is
   * how a draw sheet is read, and it means a payload cannot express a bracket
   * with an odd player in a round.
   */
  entrants: DrawEntrant[];
  /**
   * Who advances, by round. `winners[0]` is the second round, and each entry is
   * an index into the previous round's list. Omitted entirely for a blank
   * bracket, which is what the seeding explainers want.
   */
  winners?: number[][];
  caption?: string;
}

/** Reads a bracket out of a section's structured payload. */
export function toDrawShape(value: unknown): DrawShape | null {
  if (!value || typeof value !== 'object' || !('entrants' in value)) return null;
  const candidate = value as Record<string, unknown>;
  if (!Array.isArray(candidate.entrants) || candidate.entrants.length < 2) return null;
  if (!Array.isArray(candidate.rounds) || candidate.rounds.length === 0) return null;

  const entrants = candidate.entrants.filter((entrant): entrant is DrawEntrant => {
    if (typeof entrant !== 'object' || entrant === null) return false;
    return typeof (entrant as Record<string, unknown>).name === 'string';
  });
  if (entrants.length < 2) return null;

  return {
    rounds: candidate.rounds.filter((round): round is string => typeof round === 'string'),
    entrants,
    winners: Array.isArray(candidate.winners)
      ? (candidate.winners.filter(Array.isArray) as number[][])
      : undefined,
    caption: typeof candidate.caption === 'string' ? candidate.caption : undefined,
  };
}

function EntrantLabel({ entrant }: { entrant: DrawEntrant }) {
  return (
    <span className={entrant.highlight ? 'font-semibold text-foreground' : 'text-foreground/80'}>
      {entrant.seed !== undefined && (
        <span className="mr-1 text-2xs font-semibold text-muted-foreground">[{entrant.seed}]</span>
      )}
      {entrant.status !== undefined && (
        <span className="mr-1 text-2xs font-semibold text-muted-foreground">
          ({entrant.status})
        </span>
      )}
      {entrant.name}
    </span>
  );
}

/**
 * A knockout draw, as columns of matches.
 *
 * Rendered as nested lists rather than as an SVG with connector lines. A draw
 * is a hierarchy, a list is what a hierarchy is, and it means the bracket reads
 * correctly to a screen reader, reflows on a phone and prints, none of which a
 * hand-drawn set of elbow connectors does.
 */
export function TennisDrawDiagram({ shape, title }: { shape: DrawShape; title: string }) {
  // Each round is derived from the one before it. A round with no recorded
  // winners renders as blank slots, which is exactly what an undrawn bracket
  // looks like on a tournament website.
  const columns: (DrawEntrant | null)[][] = [shape.entrants];
  let current: (DrawEntrant | null)[] = shape.entrants;

  for (let round = 0; round < shape.rounds.length - 1; round += 1) {
    const advancing = shape.winners?.[round];
    const next: (DrawEntrant | null)[] = [];
    for (let pair = 0; pair * 2 < current.length; pair += 1) {
      const pick = advancing?.[pair];
      next.push(pick === undefined ? null : (current[pick] ?? null));
    }
    columns.push(next);
    current = next;
  }

  return (
    <figure className="overflow-x-auto">
      <div className="flex min-w-max gap-4">
        {columns.map((column, roundIndex) => (
          <div key={roundIndex} className="min-w-[11rem] flex-1">
            <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground">
              {shape.rounds[roundIndex] ?? `Round ${roundIndex + 1}`}
            </p>
            <ol className="mt-2 space-y-2">
              {/* Grouped two at a time, so a match is a visual unit rather than
                  two rows the reader has to pair up themselves. */}
              {Array.from({ length: Math.ceil(column.length / 2) }, (_, pair) => (
                <li
                  key={pair}
                  className="rounded-md border border-border bg-card px-2.5 py-1.5 text-xs leading-relaxed"
                >
                  {[column[pair * 2], column[pair * 2 + 1]].map((entrant, slot) => (
                    <div key={slot} className={slot === 1 ? 'mt-0.5' : undefined}>
                      {entrant ? (
                        <EntrantLabel entrant={entrant} />
                      ) : (
                        <span className="text-muted-foreground">&mdash;</span>
                      )}
                    </div>
                  ))}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
      <figcaption className="mt-3 text-xs text-muted-foreground">
        {shape.caption ?? `${title}: the shape of the draw.`}
      </figcaption>
    </figure>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Scoreboard
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * A worked scoreline.
 *
 * Cricket has `ScoreBreakdown` for the same job, and the two are separate
 * because what has to be pointed at differs: cricket labels the parts of one
 * string like "287/6 (47.2)", tennis labels cells in a grid, and the grid is
 * the thing a beginner cannot read.
 */
export interface TennisScoreboardShape {
  /** Column headings above the set columns: "Set 1", "Set 2". */
  sets: string[];
  rows: {
    name: string;
    /** One entry per set. `tiebreak` renders as the superscript on the games. */
    scores: { games: number | string; tiebreak?: number | string }[];
    /** Renders the serving indicator against this row. */
    serving?: boolean;
    /** The current point score: "40", "AD", "30". */
    points?: string;
    won?: boolean;
  }[];
  /** "Second set, 4–5, Djokovic serving to stay in the set." */
  caption?: string;
  /** Pointed-at explanations, rendered beneath the grid. */
  notes?: { label: string; explanation: string }[];
}

export function toTennisScoreboard(value: unknown): TennisScoreboardShape | null {
  if (!value || typeof value !== 'object' || !('rows' in value) || !('sets' in value)) return null;
  const candidate = value as Record<string, unknown>;
  if (!Array.isArray(candidate.rows) || candidate.rows.length === 0) return null;
  if (!Array.isArray(candidate.sets)) return null;

  const rows = candidate.rows.filter((row): row is TennisScoreboardShape['rows'][number] => {
    if (typeof row !== 'object' || row === null) return false;
    const entry = row as Record<string, unknown>;
    return typeof entry.name === 'string' && Array.isArray(entry.scores);
  });
  if (rows.length === 0) return null;

  return {
    sets: candidate.sets.filter((set): set is string => typeof set === 'string'),
    rows,
    caption: typeof candidate.caption === 'string' ? candidate.caption : undefined,
    notes: Array.isArray(candidate.notes)
      ? (candidate.notes.filter(
          (note) =>
            typeof note === 'object' &&
            note !== null &&
            typeof (note as Record<string, unknown>).label === 'string' &&
            typeof (note as Record<string, unknown>).explanation === 'string',
        ) as TennisScoreboardShape['notes'])
      : undefined,
  };
}

/**
 * A scoreboard, as a table.
 *
 * A real table rather than a grid of divs: it is tabular data, the set columns
 * are headers, and a screen reader announcing "Alcaraz, Set 2, 6" is the
 * behaviour that makes the explainer work for the reader who most needs it.
 */
export function TennisScoreboard({ shape }: { shape: TennisScoreboardShape }) {
  const showPoints = shape.rows.some((row) => row.points !== undefined);

  return (
    <figure>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[18rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border">
              <th
                scope="col"
                className="py-1.5 pr-3 text-left text-2xs font-semibold uppercase tracking-widest text-muted-foreground"
              >
                Player
              </th>
              {shape.sets.map((set) => (
                <th
                  key={set}
                  scope="col"
                  className="px-2 py-1.5 text-center text-2xs font-semibold uppercase tracking-widest text-muted-foreground"
                >
                  {set}
                </th>
              ))}
              {showPoints && (
                <th
                  scope="col"
                  className="px-2 py-1.5 text-center text-2xs font-semibold uppercase tracking-widest text-muted-foreground"
                >
                  Points
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {shape.rows.map((row) => (
              <tr key={row.name} className="border-b border-border/60 last:border-0">
                <th
                  scope="row"
                  className={`py-2 pr-3 text-left font-medium ${row.won ? 'text-foreground' : 'text-foreground/80'}`}
                >
                  {/* The serving indicator is a dot with a text alternative,
                      because "who is serving" is the single fact a beginner
                      needs to read the rest of the row. */}
                  {row.serving && (
                    <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-foreground align-middle">
                      <span className="sr-only">serving</span>
                    </span>
                  )}
                  {row.name}
                </th>
                {row.scores.map((score, index) => (
                  <td key={index} className="px-2 py-2 text-center tabular-nums">
                    <span className="font-semibold">{score.games}</span>
                    {score.tiebreak !== undefined && (
                      <sup className="ml-0.5 text-2xs text-muted-foreground">{score.tiebreak}</sup>
                    )}
                  </td>
                ))}
                {showPoints && (
                  <td className="px-2 py-2 text-center font-semibold tabular-nums">
                    {row.points ?? ''}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {shape.notes && shape.notes.length > 0 && (
        <dl className="mt-3 space-y-1.5 text-xs leading-relaxed">
          {shape.notes.map((note) => (
            <div key={note.label} className="flex gap-2">
              <dt className="shrink-0 font-semibold text-foreground">{note.label}</dt>
              <dd className="text-muted-foreground">{note.explanation}</dd>
            </div>
          ))}
        </dl>
      )}

      {shape.caption && (
        <figcaption className="mt-3 text-xs text-muted-foreground">{shape.caption}</figcaption>
      )}
    </figure>
  );
}
