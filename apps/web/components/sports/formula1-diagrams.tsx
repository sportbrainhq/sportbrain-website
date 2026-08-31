/**
 * Formula 1 diagrams: the track, the car and the strategy chart.
 *
 * Three visual blocks, driven by structured data on an explainer section rather
 * than by images, for the same reasons the cricket field, the basketball play
 * and the tennis court are: one payload has to drive a thumbnail and a
 * full-width figure, it has to stay legible in both themes, and it has to
 * describe itself to a reader who cannot see it.
 *
 * That last point does more work here than anywhere else in the library. An
 * undercut is genuinely hard to explain in prose and easy to show, so the
 * diagram is not decoration; it is the explanation. A picture of one would be
 * useless to a screen reader, which is why every step carries a caption and
 * every figure an accessible description built from the payload.
 *
 * ## Why the track takes lap percentages
 *
 * Positions are given as a percentage of the way around the lap rather than as
 * x/y coordinates. "The detection point is before the corner and the zone
 * starts at the exit" is a statement about distance around a lap, and making a
 * seed author solve for coordinates on a bezier would guarantee arithmetic
 * errors in the data. The component converts a lap percentage into a point on
 * the path using the browser's own path geometry where available, and falls
 * back to a parametric oval otherwise, so a payload never has to know the
 * shape of the circuit it is drawn on.
 *
 * Nothing here is imported by the other sports' pages. The article renderer
 * picks a block by payload shape, so a sport contributes a visual without every
 * other sport's pages growing a branch.
 */

/* ────────────────────────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────────────────────── */

export interface TrackCar {
  id: string;
  label: string;
  lap: number;
  team?: 'a' | 'b' | 'neutral';
  highlight?: boolean;
  ghost?: boolean;
  inPits?: boolean;
}

export interface TrackZone {
  from: number;
  to: number;
  label?: string;
  kind?: 'drs' | 'caution' | 'braking' | 'sector' | 'neutral';
}

export interface TrackMarker {
  lap: number;
  label: string;
  kind?: 'detection' | 'apex' | 'pit-entry' | 'pit-exit' | 'start' | 'flag' | 'neutral';
}

export interface TrackStep {
  caption: string;
  cars?: TrackCar[];
  zones?: TrackZone[];
  markers?: TrackMarker[];
  note?: string;
}

export interface TrackShape {
  track: 'circuit';
  path?: string;
  circuitName?: string;
  steps: TrackStep[];
  caption?: string;
}

export interface CarPart {
  name: string;
  x: number;
  y: number;
  highlight?: boolean;
  note?: string;
}

export interface CarDiagramShape {
  car: 'side' | 'top' | 'front';
  parts: CarPart[];
  caption?: string;
}

export interface StintPlan {
  label: string;
  stints: {
    compound: 'soft' | 'medium' | 'hard' | 'intermediate' | 'wet';
    fromLap: number;
    toLap: number;
    note?: string;
  }[];
  result?: string;
  highlight?: boolean;
}

export interface StrategyChartShape {
  strategy: 'stints';
  totalLaps: number;
  plans: StintPlan[];
  caption?: string;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Parsers
 *
 * Deliberately strict. A payload that does not fully validate renders nothing
 * rather than a broken figure, which is the same contract the other sports'
 * diagrams use: a malformed diagram is worse than no diagram, because a reader
 * cannot tell that what they are looking at is wrong.
 * ────────────────────────────────────────────────────────────────────────── */

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

export function toTrackShape(value: unknown): TrackShape | null {
  if (!value || typeof value !== 'object') return null;
  const c = value as Record<string, unknown>;
  if (c.track !== 'circuit') return null;
  if (!Array.isArray(c.steps) || c.steps.length === 0) return null;

  const steps = c.steps.filter((step): step is TrackStep => {
    if (!step || typeof step !== 'object') return false;
    const s = step as Record<string, unknown>;
    if (typeof s.caption !== 'string') return false;
    if (s.cars !== undefined && !Array.isArray(s.cars)) return false;
    if (s.zones !== undefined && !Array.isArray(s.zones)) return false;
    if (s.markers !== undefined && !Array.isArray(s.markers)) return false;
    return true;
  });
  if (steps.length === 0) return null;

  return {
    track: 'circuit',
    path: typeof c.path === 'string' ? c.path : undefined,
    circuitName: typeof c.circuitName === 'string' ? c.circuitName : undefined,
    caption: typeof c.caption === 'string' ? c.caption : undefined,
    steps,
  };
}

export function toCarDiagram(value: unknown): CarDiagramShape | null {
  if (!value || typeof value !== 'object') return null;
  const c = value as Record<string, unknown>;
  if (c.car !== 'side' && c.car !== 'top' && c.car !== 'front') return null;
  if (!Array.isArray(c.parts) || c.parts.length === 0) return null;

  const parts = c.parts.filter((part): part is CarPart => {
    if (!part || typeof part !== 'object') return false;
    const p = part as Record<string, unknown>;
    return typeof p.name === 'string' && isNum(p.x) && isNum(p.y);
  });
  if (parts.length !== c.parts.length) return null;

  return {
    car: c.car,
    parts,
    caption: typeof c.caption === 'string' ? c.caption : undefined,
  };
}

export function toStrategyChart(value: unknown): StrategyChartShape | null {
  if (!value || typeof value !== 'object') return null;
  const c = value as Record<string, unknown>;
  if (c.strategy !== 'stints') return null;
  if (!isNum(c.totalLaps) || c.totalLaps <= 0) return null;
  if (!Array.isArray(c.plans) || c.plans.length === 0) return null;

  const plans = c.plans.filter((plan): plan is StintPlan => {
    if (!plan || typeof plan !== 'object') return false;
    const p = plan as Record<string, unknown>;
    if (typeof p.label !== 'string') return false;
    if (!Array.isArray(p.stints) || p.stints.length === 0) return false;
    return p.stints.every((stint) => {
      if (!stint || typeof stint !== 'object') return false;
      const s = stint as Record<string, unknown>;
      return isNum(s.fromLap) && isNum(s.toLap) && typeof s.compound === 'string';
    });
  });
  if (plans.length === 0) return null;

  return {
    strategy: 'stints',
    totalLaps: c.totalLaps,
    plans,
    caption: typeof c.caption === 'string' ? c.caption : undefined,
  };
}

/* ────────────────────────────────────────────────────────────────────────────
 * Track
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * The generic lap.
 *
 * Used when a payload names no circuit, which is most of them: an out lap or an
 * undercut is not a property of any particular track, and drawing one on a
 * recognisable circuit would imply that it is. Deliberately not a plain oval,
 * because a circuit with only two corners teaches the wrong shape.
 */
const GENERIC_LAP =
  'M 50 8 C 74 8 88 16 88 30 C 88 42 74 46 66 52 C 60 57 62 66 70 70 C 80 75 84 82 78 88 C 72 93 58 92 46 92 C 30 92 16 88 12 78 C 8 68 14 58 20 50 C 26 42 20 32 24 22 C 28 12 38 8 50 8 Z';

/**
 * Where a lap percentage falls on the drawn circuit.
 *
 * Uses the browser's path geometry when it is available, which is the only way
 * to be accurate for an arbitrary circuit outline. During server rendering, and
 * in browsers without `getPointAtLength`, it falls back to an ellipse that
 * approximates the generic lap. The fallback is not exact and does not need to
 * be: it keeps the markers in a sensible order around the lap until hydration
 * replaces them, and a reader who never gets JavaScript still has the captions
 * and the accessible description, which carry the actual meaning.
 */
function pointOnLap(pathData: string, percent: number): { x: number; y: number } {
  const t = ((percent % 100) + 100) % 100;

  if (typeof document !== 'undefined') {
    try {
      const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      el.setAttribute('d', pathData);
      const total = el.getTotalLength();
      if (total > 0) {
        const p = el.getPointAtLength((t / 100) * total);
        return { x: p.x, y: p.y };
      }
    } catch {
      // Fall through to the parametric approximation.
    }
  }

  // Start at the top and run clockwise, matching the generic path's direction.
  const angle = (t / 100) * Math.PI * 2 - Math.PI / 2;
  return { x: 50 + 38 * Math.cos(angle), y: 50 + 42 * Math.sin(angle) };
}

/** Builds the accessible description a screen reader receives for a step. */
function describeTrackStep(step: TrackStep): string {
  const parts: string[] = [];

  if (step.cars?.length) {
    parts.push(
      step.cars.map((car) => `car ${car.label}${car.inPits ? ' in the pit lane' : ''}`).join(', '),
    );
  }
  if (step.zones?.length) {
    parts.push(step.zones.map((zone) => zone.label ?? `${zone.kind ?? 'marked'} zone`).join(', '));
  }
  if (step.markers?.length) {
    parts.push(step.markers.map((marker) => marker.label).join(', '));
  }

  return parts.length > 0 ? `Circuit diagram showing ${parts.join('; ')}` : 'Circuit diagram';
}

/** The zone kinds, as stroke classes. Colour is never the only signal. */
const ZONE_CLASS: Record<string, string> = {
  drs: 'text-foreground',
  caution: 'text-foreground/70',
  braking: 'text-foreground/70',
  sector: 'text-foreground/40',
  neutral: 'text-foreground/40',
};

function TrackStepDiagram({ step, path }: { step: TrackStep; path: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label={describeTrackStep(step)}
      className="w-full min-w-[14rem] rounded-lg border border-border bg-card"
    >
      <defs>
        <marker
          id="f1-arrow"
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

      {/* The circuit itself, drawn faint: the markers carry the meaning. */}
      <path
        d={path}
        fill="none"
        className="text-border"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinejoin="round"
      />
      <path
        d={path}
        fill="none"
        className="text-muted-foreground/40"
        stroke="currentColor"
        strokeWidth="0.4"
        strokeDasharray="1 2"
        strokeLinejoin="round"
      />

      {/* Zones: a run of dots along the lap, which reads as a stretch of track
          without needing a second path element per zone. */}
      {step.zones?.map((zone, zi) => {
        const span = zone.to >= zone.from ? zone.to - zone.from : 100 - zone.from + zone.to;
        const count = Math.max(2, Math.round(span / 2));
        const dots = Array.from({ length: count }, (_, i) => {
          const pt = pointOnLap(path, zone.from + (span * i) / (count - 1));
          return <circle key={i} cx={pt.x} cy={pt.y} r="1.5" />;
        });
        const mid = pointOnLap(path, zone.from + span / 2);
        return (
          <g key={`zone-${zi}`} className={ZONE_CLASS[zone.kind ?? 'neutral']}>
            <g fill="currentColor" opacity="0.55">
              {dots}
            </g>
            {zone.label && (
              <text
                x={mid.x}
                y={mid.y - 4}
                textAnchor="middle"
                className="fill-muted-foreground [font-size:3.2px]"
              >
                {zone.label}
              </text>
            )}
          </g>
        );
      })}

      {/* Markers: a tick across the track with a label beside it. */}
      {step.markers?.map((marker, mi) => {
        const pt = pointOnLap(path, marker.lap);
        return (
          <g key={`marker-${mi}`}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r="2"
              className="fill-card stroke-foreground [stroke-width:0.8]"
            />
            <text
              x={pt.x}
              y={pt.y + 5.6}
              textAnchor="middle"
              className="fill-muted-foreground [font-size:3px]"
            >
              {marker.label}
            </text>
          </g>
        );
      })}

      {/* Cars. A car in the pit lane is drawn inside the circuit outline, which
          is where the pit lane is at nearly every track. */}
      {step.cars?.map((car) => {
        const pt = pointOnLap(path, car.lap);
        const cx = car.inPits ? 50 + (pt.x - 50) * 0.72 : pt.x;
        const cy = car.inPits ? 50 + (pt.y - 50) * 0.72 : pt.y;
        return (
          <g key={car.id} opacity={car.ghost ? 0.4 : 1}>
            <circle
              cx={cx}
              cy={cy}
              r={car.highlight ? 3.8 : 3.2}
              className={
                car.highlight
                  ? 'fill-foreground'
                  : 'fill-card stroke-foreground/60 [stroke-width:0.8]'
              }
              strokeDasharray={car.ghost ? '1.5 1' : undefined}
            />
            <text
              x={cx}
              y={cy + 1.2}
              textAnchor="middle"
              className={`[font-size:3.2px] ${car.highlight ? 'fill-background' : 'fill-foreground'}`}
            >
              {car.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function TrackDiagram({ shape, title }: { shape: TrackShape; title: string }) {
  const path = shape.path ?? GENERIC_LAP;
  const single = shape.steps.length === 1;

  return (
    <figure className="not-prose">
      <div
        className={
          single
            ? 'max-w-sm'
            : 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(13rem,1fr))]'
        }
      >
        {shape.steps.map((step, index) => (
          <div key={index} className="space-y-2">
            <TrackStepDiagram step={step} path={path} />
            <div className="space-y-0.5">
              {!single && (
                <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Step {index + 1}
                  {step.note ? ` — ${step.note}` : ''}
                </p>
              )}
              <p className="text-xs leading-relaxed text-muted-foreground">{step.caption}</p>
            </div>
          </div>
        ))}
      </div>
      {(shape.caption || shape.circuitName) && (
        <figcaption className="mt-3 text-xs text-muted-foreground">
          {shape.circuitName && <span className="font-medium">{shape.circuitName}. </span>}
          {shape.caption ?? `Circuit diagram for ${title}.`}
        </figcaption>
      )}
    </figure>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Car
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * The car outline.
 *
 * A schematic silhouette rather than an accurate profile. The purpose is to
 * give the labels somewhere to point, and a recognisable but simplified shape
 * does that better than a detailed one, which would compete with the labels for
 * attention and would be wrong within a season anyway.
 */
const CAR_SIDE =
  'M 3 74 L 10 74 L 13 66 L 22 64 L 27 58 L 33 56 L 36 44 L 44 40 L 52 40 L 56 46 L 68 46 L 72 54 L 78 56 L 82 64 L 90 66 L 93 60 L 96 60 L 96 78 L 86 78 L 82 82 L 70 82 L 66 78 L 34 78 L 30 82 L 18 82 L 14 78 L 3 78 Z';

function CarOutline({ view }: { view: 'side' | 'top' | 'front' }) {
  if (view !== 'side') {
    // Top and front views are not yet drawn. The labelled points still render
    // over a plain field, which degrades to a diagram rather than to nothing.
    return <rect x="6" y="20" width="88" height="60" rx="6" className="fill-muted/30" />;
  }

  return (
    <g>
      <path d={CAR_SIDE} className="fill-muted/40 stroke-border [stroke-width:0.6]" />
      {/* Wheels, drawn separately so they read as wheels rather than as body. */}
      <circle cx="24" cy="78" r="9" className="fill-muted/60 stroke-border [stroke-width:0.6]" />
      <circle cx="76" cy="78" r="9" className="fill-muted/60 stroke-border [stroke-width:0.6]" />
      <circle cx="24" cy="78" r="3.5" className="fill-card stroke-border [stroke-width:0.5]" />
      <circle cx="76" cy="78" r="3.5" className="fill-card stroke-border [stroke-width:0.5]" />
      {/* The ground, so "ride height" and "floor" have something to refer to. */}
      <line
        x1="2"
        y1="87.5"
        x2="98"
        y2="87.5"
        className="text-border"
        stroke="currentColor"
        strokeWidth="0.6"
      />
    </g>
  );
}

export function CarDiagram({ shape, title }: { shape: CarDiagramShape; title: string }) {
  const description = `Labelled ${shape.car} view of a Formula 1 car: ${shape.parts
    .map((part) => part.name)
    .join(', ')}`;

  return (
    <figure className="not-prose">
      <svg
        viewBox="0 0 100 100"
        role="img"
        aria-label={description}
        className="w-full rounded-lg border border-border bg-card"
      >
        <CarOutline view={shape.car} />

        {shape.parts.map((part, index) => (
          <g key={index}>
            <circle
              cx={part.x}
              cy={part.y}
              r={part.highlight ? 2.4 : 1.8}
              className={
                part.highlight
                  ? 'fill-foreground'
                  : 'fill-card stroke-foreground/70 [stroke-width:0.7]'
              }
            />
          </g>
        ))}
      </svg>

      {/* The labels sit in a list beneath rather than on the drawing. Twelve
          labels on a 100-unit-wide SVG overlap at any realistic font size, and
          a numbered list stays legible on a phone and reads correctly aloud. */}
      <ol className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1 text-xs text-muted-foreground sm:grid-cols-2">
        {shape.parts.map((part, index) => (
          <li key={index} className="flex gap-2">
            <span
              className={
                part.highlight ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'
              }
            >
              {part.name}
            </span>
            {part.note && <span className="text-muted-foreground">{part.note}</span>}
          </li>
        ))}
      </ol>

      <figcaption className="mt-3 text-xs text-muted-foreground">
        {shape.caption ?? `Component diagram for ${title}.`}
      </figcaption>
    </figure>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Strategy chart
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Compound styling.
 *
 * Pattern and label rather than colour alone. The real tyres are identified by
 * colour, and reproducing that would make the chart unreadable to a colour
 * blind reader and invisible in a dark theme, so each compound gets a distinct
 * fill treatment and its initial printed in the bar.
 */
const COMPOUND: Record<string, { label: string; short: string; className: string }> = {
  soft: { label: 'Soft', short: 'S', className: 'fill-foreground/85' },
  medium: { label: 'Medium', short: 'M', className: 'fill-foreground/55' },
  hard: { label: 'Hard', short: 'H', className: 'fill-foreground/25' },
  intermediate: { label: 'Intermediate', short: 'I', className: 'fill-foreground/70' },
  wet: { label: 'Wet', short: 'W', className: 'fill-foreground/40' },
};

export function StrategyChart({ shape, title }: { shape: StrategyChartShape; title: string }) {
  const description = shape.plans
    .map(
      (plan) =>
        `${plan.label}: ${plan.stints
          .map(
            (stint) =>
              `${COMPOUND[stint.compound]?.label ?? stint.compound} from lap ${stint.fromLap} to ${stint.toLap}`,
          )
          .join(', ')}${plan.result ? `. ${plan.result}` : ''}`,
    )
    .join('. ');

  const used = Array.from(
    new Set(shape.plans.flatMap((plan) => plan.stints.map((stint) => stint.compound))),
  );

  return (
    <figure className="not-prose">
      <div
        role="img"
        aria-label={`Stint chart over ${shape.totalLaps} laps. ${description}`}
        className="space-y-3 rounded-lg border border-border bg-card p-4"
      >
        {shape.plans.map((plan, pi) => (
          <div key={pi} className="space-y-1">
            <div className="flex items-baseline justify-between gap-3">
              <span
                className={`text-xs font-semibold ${plan.highlight ? 'text-foreground' : 'text-foreground/80'}`}
              >
                {plan.label}
              </span>
              {plan.result && <span className="text-2xs text-muted-foreground">{plan.result}</span>}
            </div>

            <div className="flex h-7 w-full overflow-hidden rounded border border-border">
              {plan.stints.map((stint, si) => {
                const laps = Math.max(0, stint.toLap - stint.fromLap + 1);
                const pct = (laps / shape.totalLaps) * 100;
                const compound = COMPOUND[stint.compound] ?? {
                  label: stint.compound,
                  short: '?',
                  className: 'fill-foreground/40',
                };
                return (
                  <div
                    key={si}
                    style={{ width: `${pct}%` }}
                    className={`flex items-center justify-center border-r border-border last:border-r-0 ${compound.className.replace('fill-', 'bg-')}`}
                    title={`${compound.label}, laps ${stint.fromLap}-${stint.toLap}${stint.note ? ` (${stint.note})` : ''}`}
                  >
                    <span className="px-1 text-2xs font-semibold text-background mix-blend-difference">
                      {compound.short} {laps}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* The lap axis, so the bars mean something in laps rather than in
            proportions of an unstated whole. */}
        <div className="flex justify-between text-2xs text-muted-foreground">
          <span>Lap 1</span>
          <span>Lap {shape.totalLaps}</span>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-2 text-2xs text-muted-foreground">
          {used.map((key) => {
            const compound = COMPOUND[key];
            if (!compound) return null;
            return (
              <span key={key} className="flex items-center gap-1.5">
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-sm border border-border ${compound.className.replace('fill-', 'bg-')}`}
                />
                {compound.label}
              </span>
            );
          })}
        </div>
      </div>

      <figcaption className="mt-3 text-xs text-muted-foreground">
        {shape.caption ?? `Stint chart for ${title}.`}
      </figcaption>
    </figure>
  );
}
