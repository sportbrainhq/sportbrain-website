/**
 * Cricket diagrams.
 *
 * Two visual blocks, both driven by structured data on an explainer section
 * rather than by an image: a fielding-position map and a worked scoreline.
 *
 * The reason to build them from data is not purity. A field diagram has to serve
 * three jobs from one source, which are highlighting a single position, showing
 * a cordon, and showing a whole setting; it has to stay legible in both themes;
 * and it has to describe itself to a reader who cannot see it, which is exactly
 * the beginner these pages are written for. An image does none of those.
 *
 * Nothing here is imported by the football pages. The article renderer picks a
 * block by section payload, so a sport contributes a visual without every other
 * sport's pages growing a branch.
 */

export interface FieldPositionPoint {
  name: string;
  label?: string;
  side: 'off' | 'leg' | 'straight';
  depth: 'close' | 'inner' | 'deep';
  x: number;
  y: number;
  highlight?: boolean;
}

export interface FieldSettingShape {
  positions: FieldPositionPoint[];
  handedness?: 'right' | 'left';
  caption?: string;
}

export interface ScoreBreakdown {
  display: string;
  kind: 'team' | 'batter' | 'bowler';
  parts: { value: string; label: string; explanation: string }[];
}

/**
 * Reads a field setting out of a section's structured payload.
 *
 * Validated here rather than at the contract boundary, for the same reason the
 * formation diagram validates its own: only this component reads the shape, and
 * a discriminated union at the boundary would make every other consumer exhaust
 * cases it never touches.
 */
export function toFieldSetting(value: unknown): FieldSettingShape | null {
  if (!value || typeof value !== 'object' || !('positions' in value)) return null;
  const positions = (value as { positions: unknown }).positions;
  if (!Array.isArray(positions) || positions.length === 0) return null;

  const parsed = positions.filter((point): point is FieldPositionPoint => {
    if (typeof point !== 'object' || point === null) return false;
    const candidate = point as Record<string, unknown>;
    return (
      typeof candidate.name === 'string' &&
      typeof candidate.x === 'number' &&
      typeof candidate.y === 'number'
    );
  });
  if (parsed.length !== positions.length) return null;

  const record = value as Record<string, unknown>;
  return {
    positions: parsed,
    handedness: record.handedness === 'left' ? 'left' : 'right',
    caption: typeof record.caption === 'string' ? record.caption : undefined,
  };
}

export function toScoreBreakdown(value: unknown): ScoreBreakdown | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  if (typeof record.display !== 'string' || !Array.isArray(record.parts)) return null;

  const parts = record.parts.filter(
    (part): part is ScoreBreakdown['parts'][number] =>
      typeof part === 'object' &&
      part !== null &&
      typeof (part as { value?: unknown }).value === 'string' &&
      typeof (part as { label?: unknown }).label === 'string' &&
      typeof (part as { explanation?: unknown }).explanation === 'string',
  );
  if (parts.length !== record.parts.length || parts.length === 0) return null;

  const kind = record.kind === 'batter' || record.kind === 'bowler' ? record.kind : 'team';
  return { display: record.display, kind, parts };
}

/**
 * A cricket field, drawn from position coordinates.
 *
 * The viewport is a square containing the boundary circle. `x` runs from the
 * leg-side boundary to the off-side boundary and `y` from behind the striker's
 * wicket to straight down the ground, both for a right-handed striker; a
 * left-handed setting is mirrored here rather than stored twice, so the two can
 * never fall out of step.
 */
export function CricketFieldDiagram({ shape, title }: { shape: FieldSettingShape; title: string }) {
  const mirrored = shape.handedness === 'left';
  const place = (point: FieldPositionPoint) => ({
    cx: mirrored ? 100 - point.x : point.x,
    cy: 100 - point.y,
  });

  const description = shape.positions
    .map((point) => `${point.name}${point.highlight ? ' (highlighted)' : ''}`)
    .join(', ');

  return (
    <figure className="mx-auto max-w-md">
      <div className="scrollbar-thin overflow-x-auto">
        <svg
          viewBox="0 0 100 100"
          role="img"
          aria-label={`${title}. Fielding positions shown for a ${
            mirrored ? 'left' : 'right'
          }-handed striker: ${description}.`}
          className="w-full min-w-[18rem] rounded-lg border border-border bg-card"
        >
          {/* The ground: boundary, fielding circle, pitch. Faint on purpose, so
              the markers carry the meaning rather than competing with it. */}
          <g className="text-border" fill="none" stroke="currentColor" strokeWidth="0.5">
            <circle cx="50" cy="50" r="47" />
            <circle cx="50" cy="50" r="27" strokeDasharray="2 2" />
            <rect x="45" y="28" width="10" height="44" />
          </g>

          {/* The stumps at each end, and the striker's position. Two marks are
              what make the diagram readable at all: without them a reader
              cannot tell which end the batter is at, and every position name
              depends on that. */}
          <g className="text-foreground/70" stroke="currentColor" strokeWidth="1.2">
            <line x1="47" y1="70" x2="53" y2="70" />
            <line x1="47" y1="30" x2="53" y2="30" />
          </g>

          {shape.positions.map((point, index) => {
            const { cx, cy } = place(point);
            return (
              <g key={`${point.name}-${index}`}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={point.highlight ? 4.6 : 3.6}
                  className={
                    point.highlight
                      ? 'fill-foreground'
                      : 'fill-card stroke-foreground/45 [stroke-width:0.6]'
                  }
                />
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={point.highlight ? 'fill-background' : 'fill-foreground/70'}
                  style={{ fontSize: '2.9px', fontWeight: 700 }}
                >
                  {point.label ?? point.name.slice(0, 3)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <figcaption className="mt-2 text-xs leading-relaxed text-muted-foreground">
        {shape.caption ?? `Fielding positions for a ${mirrored ? 'left' : 'right'}-handed striker.`}{' '}
        The dashed ring is the fielding circle; the batter on strike is at the near stumps.
      </figcaption>

      {/* The key is not decoration. Three-letter markers are unreadable to
          somebody meeting the vocabulary for the first time, which is the whole
          audience for this category. */}
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {shape.positions.map((point, index) => (
          <li
            key={`${point.name}-key-${index}`}
            className={point.highlight ? 'text-foreground' : ''}
          >
            <span className="font-medium">{point.label ?? point.name.slice(0, 3)}</span>{' '}
            {point.name}
          </li>
        ))}
      </ul>
    </figure>
  );
}

/**
 * A worked scoreline.
 *
 * The scoreline is shown once at size, then each component is explained beside
 * its own value. That layout is the entire point: the alternative is prose
 * describing the third character of a string, which is how a beginner ends up
 * believing 47.2 is a decimal.
 */
export function ScorecardBreakdown({ breakdown }: { breakdown: ScoreBreakdown }) {
  const kindLabel =
    breakdown.kind === 'batter'
      ? "A batter's line"
      : breakdown.kind === 'bowler'
        ? "A bowler's analysis"
        : 'A team score';

  return (
    <figure className="rounded-lg border border-border bg-card p-4 sm:p-5">
      <figcaption className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground">
        {kindLabel}
      </figcaption>

      <p className="scrollbar-thin mt-2 overflow-x-auto whitespace-nowrap font-mono text-2xl font-bold tracking-tight sm:text-3xl">
        {breakdown.display}
      </p>

      <dl className="mt-4 space-y-3 border-t border-border pt-4">
        {breakdown.parts.map((part) => (
          <div key={`${part.label}-${part.value}`} className="sm:flex sm:gap-4">
            <dt className="flex shrink-0 items-baseline gap-2 sm:w-40">
              <span className="font-mono font-semibold">{part.value}</span>
              <span className="text-2xs uppercase tracking-wider text-muted-foreground">
                {part.label}
              </span>
            </dt>
            <dd className="mt-1 text-sm leading-relaxed text-foreground/90 sm:mt-0">
              {part.explanation}
            </dd>
          </div>
        ))}
      </dl>
    </figure>
  );
}
