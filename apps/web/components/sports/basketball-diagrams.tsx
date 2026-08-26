/**
 * Basketball play diagrams.
 *
 * One visual block, driven by structured data on an explainer section rather
 * than by an image, for the same reasons cricket's field diagrams are: the
 * payload has to describe itself to a reader who cannot see it, it has to stay
 * legible in both themes, and a play is a sequence rather than a single frame.
 *
 * The sequence is the part an image cannot do. A pick and roll drawn as one
 * picture is six arrows overlapping in the middle of the floor; drawn as five
 * steps it is legible, and each step gets a sentence saying what changed. The
 * steps render as a stack rather than an animation, so the whole play is
 * visible at once, works without JavaScript and prints.
 *
 * Nothing here is imported by the football or cricket pages. The article
 * renderer picks a block by payload shape, so a sport contributes a visual
 * without every other sport's pages growing a branch.
 */

export interface CourtPlayer {
  id: string;
  team: 'offense' | 'defense';
  label: string;
  x: number;
  y: number;
  hasBall?: boolean;
  highlight?: boolean;
}

export interface CourtArrow {
  kind: 'move' | 'pass' | 'shot' | 'dribble';
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  label?: string;
}

export interface CourtScreen {
  x: number;
  y: number;
  angle?: number;
  label?: string;
}

export interface CourtZone {
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
}

export interface CourtPlayStep {
  caption: string;
  players: CourtPlayer[];
  arrows?: CourtArrow[];
  screens?: CourtScreen[];
  zones?: CourtZone[];
}

export interface CourtPlayShape {
  court: 'half' | 'full';
  steps: CourtPlayStep[];
  caption?: string;
}

/**
 * Reads a play out of a section's structured payload.
 *
 * Validated here rather than at the contract boundary, matching the formation
 * and field-setting diagrams: only this component reads the shape, and a
 * discriminated union at the boundary would make every other consumer exhaust
 * cases it never touches.
 *
 * Deliberately strict about `steps`. A payload with no usable step renders
 * nothing rather than an empty court, because an empty court beside prose
 * about a pick and roll reads as a broken page.
 */
export function toCourtPlay(value: unknown): CourtPlayShape | null {
  if (!value || typeof value !== 'object' || !('steps' in value)) return null;
  const candidate = value as { steps: unknown; court?: unknown; caption?: unknown };
  if (!Array.isArray(candidate.steps) || candidate.steps.length === 0) return null;

  const steps = candidate.steps.filter((step): step is CourtPlayStep => {
    if (typeof step !== 'object' || step === null) return false;
    const entry = step as Record<string, unknown>;
    return (
      typeof entry.caption === 'string' &&
      Array.isArray(entry.players) &&
      entry.players.every((player) => {
        if (typeof player !== 'object' || player === null) return false;
        const p = player as Record<string, unknown>;
        return typeof p.x === 'number' && typeof p.y === 'number' && typeof p.label === 'string';
      })
    );
  });

  if (steps.length === 0) return null;

  return {
    court: candidate.court === 'full' ? 'full' : 'half',
    steps,
    caption: typeof candidate.caption === 'string' ? candidate.caption : undefined,
  };
}

/**
 * Describes a step in words.
 *
 * The caption says what happens; this says where everyone is. Both are needed:
 * a screen reader user gets the caption from the figure and the positions from
 * the image label, and neither alone is the diagram.
 */
function describeStep(step: CourtPlayStep): string {
  const offense = step.players.filter((p) => p.team === 'offense');
  const defense = step.players.filter((p) => p.team === 'defense');
  const withBall = step.players.find((p) => p.hasBall);

  const parts = [
    `${offense.length} attackers`,
    defense.length > 0 ? `${defense.length} defenders` : null,
    withBall ? `${withBall.label} has the ball` : null,
    step.screens?.length ? `a screen is set` : null,
  ].filter(Boolean);

  return parts.join(', ');
}

/**
 * The court itself.
 *
 * Drawn faint, like cricket's ground: the markers carry the meaning and the
 * lines are there to orient them. Coordinates run 0–100 in both axes, with y=0
 * at the baseline under the attacking basket, so a payload reads the way a
 * coach would describe it (low numbers near the rim).
 */
function CourtMarkings({ court }: { court: 'half' | 'full' }) {
  return (
    <g className="text-border" fill="none" stroke="currentColor" strokeWidth="0.5">
      {/* Boundary. */}
      <rect x="2" y="2" width="96" height="96" rx="1" />

      {/* The paint, and the free-throw circle above it. */}
      <rect x="35" y="2" width="30" height="34" />
      <circle cx="50" cy="36" r="11" strokeDasharray="2 2" />

      {/* The three-point arc: corners running straight off the baseline, then
          the curve. Approximated rather than surveyed, which is right for a
          teaching diagram. */}
      <path d="M 10 2 L 10 20 A 42 42 0 0 0 90 20 L 90 2" />

      {/* Rim and backboard. */}
      <line x1="42" y1="6" x2="58" y2="6" strokeWidth="0.8" />
      <circle cx="50" cy="9.5" r="2.4" strokeWidth="0.8" />

      {/* Half-way line, only where the court extends that far. */}
      {court === 'full' && <line x1="2" y1="98" x2="98" y2="98" />}
    </g>
  );
}

/** Arrowheads, one per arrow kind, so a pass and a cut are distinguishable. */
function ArrowDefs() {
  return (
    <defs>
      <marker
        id="bb-arrow"
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

function StepDiagram({ step, court }: { step: CourtPlayStep; court: 'half' | 'full' }) {
  // y is flipped so that 0 sits at the baseline under the basket: the payload
  // is written the way the floor is described, and the flip lives here rather
  // than in every seed file.
  const py = (y: number) => 100 - y;

  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label={describeStep(step)}
      className="w-full min-w-[16rem] rounded-lg border border-border bg-card"
    >
      <ArrowDefs />
      <CourtMarkings court={court} />

      {step.zones?.map((zone, index) => (
        <rect
          key={`zone-${index}`}
          x={zone.x}
          y={py(zone.y + zone.height)}
          width={zone.width}
          height={zone.height}
          className="fill-foreground/10"
        />
      ))}

      {step.arrows?.map((arrow, index) => (
        <line
          key={`arrow-${index}`}
          x1={arrow.fromX}
          y1={py(arrow.fromY)}
          x2={arrow.toX}
          y2={py(arrow.toY)}
          className="text-foreground/60"
          stroke="currentColor"
          strokeWidth="0.9"
          strokeDasharray={arrow.kind === 'pass' ? '2.5 2' : undefined}
          markerEnd="url(#bb-arrow)"
        />
      ))}

      {/* A screen is a bar across the screened defender's path, which is what a
          coach draws and what the word describes. */}
      {step.screens?.map((screen, index) => (
        <line
          key={`screen-${index}`}
          x1={screen.x - 4}
          y1={py(screen.y)}
          x2={screen.x + 4}
          y2={py(screen.y)}
          transform={`rotate(${screen.angle ?? 0} ${screen.x} ${py(screen.y)})`}
          className="text-foreground"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      ))}

      {step.players.map((player) => {
        const cx = player.x;
        const cy = py(player.y);
        const isOffense = player.team === 'offense';
        return (
          <g key={player.id}>
            {isOffense ? (
              <circle
                cx={cx}
                cy={cy}
                r={player.highlight ? 4.4 : 3.6}
                className={
                  player.highlight
                    ? 'fill-foreground'
                    : 'fill-card stroke-foreground/50 [stroke-width:0.7]'
                }
              />
            ) : (
              // Defenders are crosses rather than circles: the two groups have
              // to be distinguishable without relying on colour.
              <g
                className="text-muted-foreground"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
              >
                <line x1={cx - 2.6} y1={cy - 2.6} x2={cx + 2.6} y2={cy + 2.6} />
                <line x1={cx + 2.6} y1={cy - 2.6} x2={cx - 2.6} y2={cy + 2.6} />
              </g>
            )}

            {isOffense && (
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                className={player.highlight ? 'fill-background' : 'fill-foreground/75'}
                style={{ fontSize: '2.9px', fontWeight: 700 }}
              >
                {player.label}
              </text>
            )}

            {/* The ball sits beside its carrier rather than on them, so the
                label underneath stays readable. */}
            {player.hasBall && (
              <circle
                cx={cx + 4.6}
                cy={cy - 4.2}
                r="1.7"
                className="fill-card stroke-foreground [stroke-width:0.7]"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

/**
 * A play, as a numbered sequence of diagrams.
 *
 * One column on a phone and two from `sm` upward. A play of five steps is a
 * tall stack on mobile, which is the correct trade: the alternative is five
 * diagrams too small to read.
 */
export function BasketballPlayDiagram({ shape, title }: { shape: CourtPlayShape; title: string }) {
  const single = shape.steps.length === 1;

  return (
    <figure>
      <ol
        className={
          single
            ? 'mx-auto max-w-sm list-none'
            : 'grid list-none grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
        }
      >
        {shape.steps.map((step, index) => (
          <li key={index}>
            <div className="scrollbar-thin overflow-x-auto">
              <StepDiagram step={step} court={shape.court} />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {!single && <span className="font-semibold text-foreground">Step {index + 1}. </span>}
              {step.caption}
            </p>
          </li>
        ))}
      </ol>

      <figcaption className="mt-3 text-xs leading-relaxed text-muted-foreground">
        {shape.caption ?? `${title}, shown step by step.`} Circles are attackers, crosses are
        defenders, and the small circle marks who has the ball. A thick bar is a screen.
      </figcaption>
    </figure>
  );
}
