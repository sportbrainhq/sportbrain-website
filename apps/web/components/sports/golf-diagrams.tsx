/**
 * Golf diagrams: the hole, the scorecard and the strokes-gained table.
 *
 * Three visual blocks driven by structured data on an explainer section rather
 * than by images, for the same three reasons every other sport's diagrams are:
 * one payload has to drive a thumbnail and a full-width figure, it has to stay
 * legible in both themes, and it has to describe itself to a reader who cannot
 * see it.
 *
 * That last point carries more weight in golf than in most sports, because so
 * much of the beginner vocabulary is simply the names of parts of the ground.
 * A photograph of a hole with "fairway" written on it teaches nothing to a
 * screen reader; a polygon labelled `fairway` in a payload teaches the same
 * thing to everybody.
 *
 * ## Why the hole is drawn portrait, tee at the bottom
 *
 * Because that is how a golfer sees it. A hole is described from the tee
 * looking forward, and a drawing that puts the green at the bottom or the tee
 * on the left forces the reader to rotate it mentally before they can read the
 * caption. `y` therefore runs 0 at the tee to 100 at the green, which is
 * upside down relative to SVG's own coordinate system, and the renderer flips
 * it once here so that no seed author ever has to.
 *
 * ## Why the scorecard is a table and not a drawing
 *
 * Because it is one. A scorecard is a grid of numbers with headers, it is read
 * cell by cell, and a screen reader navigating a real `<table>` with proper
 * headers gets a better experience than any SVG could give it. The only visual
 * work is colouring the cells by score relative to par, which is exactly what a
 * printed card does with circles and squares.
 *
 * Nothing here is imported by another sport's pages. The article renderer picks
 * a block by payload shape, so golf contributes three visuals without any other
 * sport's page growing a branch.
 */

/* ────────────────────────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────────────────────── */

export type HoleFeatureKind =
  | 'fairway'
  | 'rough'
  | 'green'
  | 'fringe'
  | 'bunker'
  | 'water'
  | 'penalty-red'
  | 'penalty-yellow'
  | 'trees'
  | 'out-of-bounds'
  | 'tee';

export interface HoleFeature {
  kind: HoleFeatureKind;
  points: { x: number; y: number }[];
  label?: string;
}

export interface HoleShot {
  kind: 'drive' | 'approach' | 'layup' | 'putt' | 'recovery' | 'carry';
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  label?: string;
  ghost?: boolean;
  curve?: 'draw' | 'fade' | 'straight';
}

export interface HoleMarker {
  x: number;
  y: number;
  label: string;
  kind?: 'pin' | 'tee' | 'ball' | 'target' | 'yardage' | 'trouble';
}

export interface HoleStep {
  caption: string;
  shots?: HoleShot[];
  markers?: HoleMarker[];
  note?: string;
}

export interface HoleShape {
  hole: 'plan';
  par?: 3 | 4 | 5;
  length?: string;
  features: HoleFeature[];
  steps?: HoleStep[];
  caption?: string;
}

export interface ScorecardHole {
  number: number;
  par: number;
  strokeIndex?: number;
  yards?: number;
}

export interface ScorecardRow {
  name: string;
  strokes: number[];
  strokesReceived?: number[];
  note?: string;
  highlight?: boolean;
}

export interface ScorecardShape {
  holes: ScorecardHole[];
  rows: ScorecardRow[];
  caption?: string;
  notes?: { label: string; explanation: string }[];
}

export interface StrokesGainedRow {
  shot: string;
  from?: string;
  baselineBefore: number;
  baselineAfter: number;
  strokesTaken?: number;
  gained: number;
  category?: 'off-the-tee' | 'approach' | 'around-the-green' | 'putting';
}

export interface StrokesGainedShape {
  strokesGained: 'shots' | 'summary';
  rows: StrokesGainedRow[];
  total?: string;
  caption?: string;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Parsers
 *
 * Deliberately strict, matching the contract every other sport's diagrams use:
 * a payload that does not fully validate renders nothing rather than a broken
 * figure, because a reader cannot tell that what they are looking at is wrong.
 * ────────────────────────────────────────────────────────────────────────── */

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

const FEATURE_KINDS = new Set<string>([
  'fairway',
  'rough',
  'green',
  'fringe',
  'bunker',
  'water',
  'penalty-red',
  'penalty-yellow',
  'trees',
  'out-of-bounds',
  'tee',
]);

export function toHoleShape(value: unknown): HoleShape | null {
  if (!value || typeof value !== 'object') return null;
  const c = value as Record<string, unknown>;
  if (c.hole !== 'plan') return null;
  if (!Array.isArray(c.features) || c.features.length === 0) return null;

  const features = c.features.filter((feature): feature is HoleFeature => {
    if (!feature || typeof feature !== 'object') return false;
    const f = feature as Record<string, unknown>;
    if (typeof f.kind !== 'string' || !FEATURE_KINDS.has(f.kind)) return false;
    // Three points is the minimum that encloses an area. Fewer is a line, and a
    // line filled as ground renders as an invisible sliver rather than an error.
    if (!Array.isArray(f.points) || f.points.length < 3) return false;
    return f.points.every((point) => {
      if (!point || typeof point !== 'object') return false;
      const p = point as Record<string, unknown>;
      return isNum(p.x) && isNum(p.y);
    });
  });
  if (features.length !== c.features.length) return null;

  const rawSteps = Array.isArray(c.steps) ? c.steps : [];
  const steps = rawSteps.filter((step): step is HoleStep => {
    if (!step || typeof step !== 'object') return false;
    const s = step as Record<string, unknown>;
    if (typeof s.caption !== 'string') return false;
    if (s.shots !== undefined && !Array.isArray(s.shots)) return false;
    if (s.markers !== undefined && !Array.isArray(s.markers)) return false;
    return true;
  });
  if (steps.length !== rawSteps.length) return null;

  const par = c.par;
  return {
    hole: 'plan',
    par: par === 3 || par === 4 || par === 5 ? par : undefined,
    length: typeof c.length === 'string' ? c.length : undefined,
    features,
    steps: steps.length > 0 ? steps : undefined,
    caption: typeof c.caption === 'string' ? c.caption : undefined,
  };
}

export function toScorecard(value: unknown): ScorecardShape | null {
  if (!value || typeof value !== 'object') return null;
  const c = value as Record<string, unknown>;
  if (!Array.isArray(c.holes) || c.holes.length === 0) return null;
  if (!Array.isArray(c.rows) || c.rows.length === 0) return null;

  const holes = c.holes.filter((hole): hole is ScorecardHole => {
    if (!hole || typeof hole !== 'object') return false;
    const h = hole as Record<string, unknown>;
    return isNum(h.number) && isNum(h.par);
  });
  if (holes.length !== c.holes.length) return null;

  const rows = c.rows.filter((row): row is ScorecardRow => {
    if (!row || typeof row !== 'object') return false;
    const r = row as Record<string, unknown>;
    if (typeof r.name !== 'string') return false;
    if (!Array.isArray(r.strokes) || r.strokes.length !== holes.length) return false;
    if (!r.strokes.every(isNum)) return false;
    if (r.strokesReceived !== undefined) {
      if (!Array.isArray(r.strokesReceived) || r.strokesReceived.length !== holes.length) {
        return false;
      }
      if (!r.strokesReceived.every(isNum)) return false;
    }
    return true;
  });
  if (rows.length !== c.rows.length) return null;

  const notes = Array.isArray(c.notes)
    ? c.notes.filter(
        (note): note is { label: string; explanation: string } =>
          Boolean(note) &&
          typeof note === 'object' &&
          typeof (note as Record<string, unknown>).label === 'string' &&
          typeof (note as Record<string, unknown>).explanation === 'string',
      )
    : undefined;

  return {
    holes,
    rows,
    caption: typeof c.caption === 'string' ? c.caption : undefined,
    notes: notes && notes.length > 0 ? notes : undefined,
  };
}

export function toStrokesGained(value: unknown): StrokesGainedShape | null {
  if (!value || typeof value !== 'object') return null;
  const c = value as Record<string, unknown>;
  if (c.strokesGained !== 'shots' && c.strokesGained !== 'summary') return null;
  if (!Array.isArray(c.rows) || c.rows.length === 0) return null;

  const rows = c.rows.filter((row): row is StrokesGainedRow => {
    if (!row || typeof row !== 'object') return false;
    const r = row as Record<string, unknown>;
    return (
      typeof r.shot === 'string' &&
      isNum(r.baselineBefore) &&
      isNum(r.baselineAfter) &&
      isNum(r.gained)
    );
  });
  if (rows.length !== c.rows.length) return null;

  return {
    strokesGained: c.strokesGained,
    rows,
    total: typeof c.total === 'string' ? c.total : undefined,
    caption: typeof c.caption === 'string' ? c.caption : undefined,
  };
}

/* ────────────────────────────────────────────────────────────────────────────
 * The hole
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Fill and stroke per feature kind.
 *
 * Colour comes from the kind rather than from the payload, so a bunker is the
 * same shade on every page and the legend can be generated instead of written
 * eighteen times. Every value is an alpha over the theme's own tokens rather
 * than a fixed hex, which is what keeps the drawing correct in dark mode
 * without a second palette.
 */
const FEATURE_STYLE: Record<HoleFeatureKind, { className: string; legend: string }> = {
  rough: { className: 'fill-emerald-900/25 dark:fill-emerald-400/15', legend: 'Rough' },
  fairway: { className: 'fill-emerald-600/35 dark:fill-emerald-400/30', legend: 'Fairway' },
  fringe: { className: 'fill-emerald-500/30 dark:fill-emerald-300/25', legend: 'Fringe' },
  green: { className: 'fill-emerald-400/55 dark:fill-emerald-300/45', legend: 'Green' },
  tee: { className: 'fill-emerald-500/45 dark:fill-emerald-300/35', legend: 'Teeing area' },
  bunker: { className: 'fill-amber-300/70 dark:fill-amber-200/55', legend: 'Bunker' },
  water: { className: 'fill-sky-500/45 dark:fill-sky-400/40', legend: 'Water' },
  'penalty-red': { className: 'fill-red-500/30 dark:fill-red-400/30', legend: 'Red penalty area' },
  'penalty-yellow': {
    className: 'fill-yellow-400/40 dark:fill-yellow-300/35',
    legend: 'Yellow penalty area',
  },
  trees: { className: 'fill-green-900/35 dark:fill-green-500/20', legend: 'Trees' },
  'out-of-bounds': {
    className: 'fill-neutral-500/25 dark:fill-neutral-300/20',
    legend: 'Out of bounds',
  },
};

/** Arrow colour by shot kind. Ghosted shots are dashed and faint wherever drawn. */
const SHOT_STYLE: Record<HoleShot['kind'], string> = {
  drive: 'stroke-foreground',
  approach: 'stroke-foreground',
  layup: 'stroke-foreground/70',
  putt: 'stroke-foreground/70',
  recovery: 'stroke-foreground/70',
  carry: 'stroke-foreground/50',
};

/**
 * Flips a payload's y into SVG's y.
 *
 * The payload is written tee-at-the-bottom because that is how a hole is
 * described. SVG's origin is top-left. Doing the flip in one place means a
 * seed author never writes an inverted coordinate, and the alternative,
 * a transform on the group, would flip the text labels upside down too.
 */
const flip = (y: number) => 100 - y;

function polygonPoints(points: { x: number; y: number }[]): string {
  return points.map((point) => `${point.x},${flip(point.y)}`).join(' ');
}

/**
 * A shot arrow, straight or curved.
 *
 * The curve is a quadratic with its control point offset perpendicular to the
 * line, which is enough to show the *shape* of a draw or a fade without
 * pretending to model ball flight. The offset sign is chosen so a draw bends
 * left and a fade bends right from the player's point of view, which is the
 * only orientation a reader will check it against.
 */
function shotPath(shot: HoleShot): string {
  const x1 = shot.fromX;
  const y1 = flip(shot.fromY);
  const x2 = shot.toX;
  const y2 = flip(shot.toY);

  if (!shot.curve || shot.curve === 'straight') return `M ${x1} ${y1} L ${x2} ${y2}`;

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy) || 1;
  // Perpendicular unit vector, scaled to a bend proportional to shot length.
  const bend = Math.min(12, length * 0.16) * (shot.curve === 'draw' ? 1 : -1);
  const cx = midX + (dy / length) * bend;
  const cy = midY - (dx / length) * bend;

  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

const MARKER_GLYPH: Record<NonNullable<HoleMarker['kind']>, string> = {
  pin: '⚑',
  tee: 'T',
  ball: '●',
  target: '×',
  yardage: '·',
  trouble: '!',
};

export function GolfHoleDiagram({ shape, title }: { shape: HoleShape; title: string }) {
  const steps = shape.steps ?? [{ caption: shape.caption ?? title }];
  const legend = [...new Set(shape.features.map((feature) => feature.kind))];

  const groundDescription = legend.map((kind) => FEATURE_STYLE[kind].legend).join(', ');
  const description = [
    shape.par ? `A par ${shape.par}` : 'A golf hole',
    shape.length ? `of ${shape.length}` : null,
    `seen from behind the tee, containing: ${groundDescription}.`,
    steps.map((step) => step.caption).join(' '),
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <figure className="not-prose">
      <div className="grid gap-4 sm:grid-cols-2">
        {steps.map((step, index) => (
          <div key={index}>
            <svg
              viewBox="0 0 100 100"
              role="img"
              aria-label={index === 0 ? description : step.caption}
              className="w-full rounded-lg border border-border bg-card"
            >
              {shape.features.map((feature, featureIndex) => (
                <polygon
                  key={featureIndex}
                  points={polygonPoints(feature.points)}
                  className={FEATURE_STYLE[feature.kind].className}
                />
              ))}

              <defs>
                <marker
                  id="golf-arrow"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="4"
                  markerHeight="4"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" className="fill-foreground" />
                </marker>
              </defs>

              {(step.shots ?? []).map((shot, shotIndex) => (
                <path
                  key={shotIndex}
                  d={shotPath(shot)}
                  fill="none"
                  markerEnd="url(#golf-arrow)"
                  strokeDasharray={shot.ghost ? '3 2' : undefined}
                  className={`${SHOT_STYLE[shot.kind]} ${shot.ghost ? 'opacity-50' : ''} [stroke-width:1.1]`}
                />
              ))}

              {(step.markers ?? []).map((marker, markerIndex) => (
                <g key={markerIndex}>
                  <circle
                    cx={marker.x}
                    cy={flip(marker.y)}
                    r={3}
                    className="fill-card stroke-foreground/70 [stroke-width:0.7]"
                  />
                  <text
                    x={marker.x}
                    y={flip(marker.y) + 1.4}
                    textAnchor="middle"
                    className="fill-foreground [font-size:3.4px]"
                  >
                    {MARKER_GLYPH[marker.kind ?? 'target']}
                  </text>
                </g>
              ))}
            </svg>

            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {steps.length > 1 && (
                <span className="font-semibold text-foreground">Step {index + 1}. </span>
              )}
              {step.caption}
              {step.note && <span className="ml-1 text-foreground/70">({step.note})</span>}
            </p>

            {/* Markers are named beneath rather than on the drawing. Labels on a
                100-unit SVG overlap at any realistic font size, and a list stays
                legible on a phone and reads correctly aloud. */}
            {(step.markers ?? []).length > 0 && (
              <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-2xs text-muted-foreground">
                {(step.markers ?? []).map((marker, markerIndex) => (
                  <li key={markerIndex}>
                    <span aria-hidden className="mr-1 font-semibold text-foreground">
                      {MARKER_GLYPH[marker.kind ?? 'target']}
                    </span>
                    {marker.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-2xs text-muted-foreground">
        {legend.map((kind) => (
          <li key={kind} className="flex items-center gap-1.5">
            <svg viewBox="0 0 10 10" aria-hidden className="h-2.5 w-2.5 rounded-sm">
              <rect x="0" y="0" width="10" height="10" className={FEATURE_STYLE[kind].className} />
            </svg>
            {FEATURE_STYLE[kind].legend}
          </li>
        ))}
      </ul>

      <figcaption className="mt-3 text-xs text-muted-foreground">
        {shape.caption ?? `Hole diagram for ${title}.`}
      </figcaption>
    </figure>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Scorecard
 * ────────────────────────────────────────────────────────────────────────── */

/** Notation matching a printed card: circles under par, squares over it. */
function scoreClass(strokes: number, par: number): string {
  const diff = strokes - par;
  if (diff <= -2)
    return 'font-bold text-emerald-700 ring-2 ring-emerald-600/60 dark:text-emerald-300';
  if (diff === -1)
    return 'font-semibold text-emerald-700 ring-1 ring-emerald-600/50 dark:text-emerald-300';
  if (diff === 0) return 'text-foreground';
  if (diff === 1) return 'text-amber-800 ring-1 ring-amber-600/50 dark:text-amber-200';
  return 'font-semibold text-red-800 ring-2 ring-red-600/50 dark:text-red-300';
}

function formatToPar(value: number): string {
  if (value === 0) return 'E';
  return value > 0 ? `+${value}` : `${value}`;
}

export function GolfScorecard({ shape }: { shape: ScorecardShape }) {
  const parTotal = shape.holes.reduce((sum, hole) => sum + hole.par, 0);
  const hasStrokeIndex = shape.holes.some((hole) => hole.strokeIndex !== undefined);
  const hasStrokesReceived = shape.rows.some((row) => row.strokesReceived !== undefined);

  return (
    <figure className="not-prose">
      {/* Wide content scrolls inside its own container so the page body never
          scrolls sideways on a phone, which an 18-column card otherwise forces. */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse text-center text-xs">
          <caption className="sr-only">
            {shape.caption ?? 'Golf scorecard showing par and strokes taken per hole.'}
          </caption>
          <thead>
            <tr className="bg-muted/50">
              <th scope="col" className="px-3 py-2 text-left font-semibold">
                Hole
              </th>
              {shape.holes.map((hole) => (
                <th key={hole.number} scope="col" className="px-2 py-2 font-semibold">
                  {hole.number}
                </th>
              ))}
              <th scope="col" className="px-3 py-2 font-semibold">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-border">
              <th scope="row" className="px-3 py-1.5 text-left font-medium text-muted-foreground">
                Par
              </th>
              {shape.holes.map((hole) => (
                <td key={hole.number} className="px-2 py-1.5 text-muted-foreground">
                  {hole.par}
                </td>
              ))}
              <td className="px-3 py-1.5 font-medium text-muted-foreground">{parTotal}</td>
            </tr>

            {hasStrokeIndex && (
              <tr className="border-t border-border">
                <th scope="row" className="px-3 py-1.5 text-left font-medium text-muted-foreground">
                  Stroke index
                </th>
                {shape.holes.map((hole) => (
                  <td key={hole.number} className="px-2 py-1.5 text-muted-foreground">
                    {hole.strokeIndex ?? '—'}
                  </td>
                ))}
                <td className="px-3 py-1.5" />
              </tr>
            )}

            {shape.rows.map((row) => {
              const gross = row.strokes.reduce((sum, value) => sum + value, 0);
              const received = (row.strokesReceived ?? []).reduce((sum, value) => sum + value, 0);
              return (
                <tr
                  key={row.name}
                  className={`border-t border-border ${row.highlight ? 'bg-muted/30' : ''}`}
                >
                  <th scope="row" className="px-3 py-1.5 text-left font-medium">
                    {row.name}
                    {row.note && (
                      <span className="ml-1 font-normal text-2xs text-muted-foreground">
                        {row.note}
                      </span>
                    )}
                  </th>
                  {row.strokes.map((strokes, index) => {
                    const hole = shape.holes[index];
                    if (!hole) return null;
                    const shots = row.strokesReceived?.[index] ?? 0;
                    return (
                      <td key={hole.number} className="px-2 py-1.5">
                        <span
                          className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 ${scoreClass(
                            strokes,
                            hole.par,
                          )}`}
                        >
                          {strokes}
                        </span>
                        {shots > 0 && (
                          <span
                            className="ml-0.5 align-super text-2xs text-muted-foreground"
                            title={`${shots} handicap stroke${shots > 1 ? 's' : ''} received`}
                          >
                            {'•'.repeat(shots)}
                          </span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-3 py-1.5 font-semibold">
                    {gross}
                    <span className="ml-1 font-normal text-2xs text-muted-foreground">
                      {formatToPar(gross - parTotal)}
                      {hasStrokesReceived && received > 0 && ` · net ${gross - received}`}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {hasStrokesReceived && (
        <p className="mt-2 text-2xs text-muted-foreground">
          A dot beside a score marks a handicap stroke received on that hole, allocated by stroke
          index.
        </p>
      )}

      {shape.notes && (
        <dl className="mt-3 space-y-1 text-xs text-muted-foreground">
          {shape.notes.map((note) => (
            <div key={note.label} className="flex gap-2">
              <dt className="shrink-0 font-semibold text-foreground">{note.label}:</dt>
              <dd>{note.explanation}</dd>
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

/* ────────────────────────────────────────────────────────────────────────────
 * Strokes gained
 * ────────────────────────────────────────────────────────────────────────── */

const SG_CATEGORY_LABEL: Record<NonNullable<StrokesGainedRow['category']>, string> = {
  'off-the-tee': 'Off the tee',
  approach: 'Approach',
  'around-the-green': 'Around the green',
  putting: 'Putting',
};

/**
 * The table the strokes-gained pages cannot do without.
 *
 * Baseline before, baseline after and the subtraction, in three adjacent
 * columns, because the whole concept is that subtraction and prose describing
 * it does not land. The bar in the final column is a proportional cue only:
 * the number beside it is the fact.
 */
export function StrokesGainedTable({ shape }: { shape: StrokesGainedShape }) {
  const widest = Math.max(...shape.rows.map((row) => Math.abs(row.gained)), 0.5);

  return (
    <figure className="not-prose">
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse text-left text-xs">
          <caption className="sr-only">
            {shape.caption ??
              'Strokes gained, shot by shot, against the expected-strokes baseline.'}
          </caption>
          <thead>
            <tr className="bg-muted/50">
              <th scope="col" className="px-3 py-2 font-semibold">
                Shot
              </th>
              <th scope="col" className="px-3 py-2 text-right font-semibold">
                Expected before
              </th>
              <th scope="col" className="px-3 py-2 text-right font-semibold">
                Expected after
              </th>
              <th scope="col" className="px-3 py-2 text-right font-semibold">
                Strokes taken
              </th>
              <th scope="col" className="px-3 py-2 text-right font-semibold">
                Gained
              </th>
            </tr>
          </thead>
          <tbody>
            {shape.rows.map((row, index) => {
              const taken = row.strokesTaken ?? 1;
              return (
                <tr key={index} className="border-t border-border align-top">
                  <th scope="row" className="px-3 py-2 font-medium">
                    {row.shot}
                    {(row.from ?? row.category) && (
                      <span className="block font-normal text-2xs text-muted-foreground">
                        {[row.from, row.category ? SG_CATEGORY_LABEL[row.category] : null]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    )}
                  </th>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                    {row.baselineBefore.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                    {row.baselineAfter.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                    {taken}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span
                      className={`font-semibold tabular-nums ${
                        row.gained >= 0
                          ? 'text-emerald-700 dark:text-emerald-300'
                          : 'text-red-700 dark:text-red-300'
                      }`}
                    >
                      {row.gained > 0 ? '+' : ''}
                      {row.gained.toFixed(2)}
                    </span>
                    <span
                      aria-hidden
                      className="mt-1 block h-1 rounded-full bg-foreground/20"
                      style={{ width: `${Math.round((Math.abs(row.gained) / widest) * 100)}%` }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {shape.total && <p className="mt-2 text-xs font-medium">{shape.total}</p>}

      {shape.caption && (
        <figcaption className="mt-2 text-xs text-muted-foreground">{shape.caption}</figcaption>
      )}
    </figure>
  );
}
