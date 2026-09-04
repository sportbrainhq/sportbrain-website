/**
 * MMA diagrams: ground and clinch positions.
 *
 * One visual block, driven by structured data on an explainer section the same
 * way golf's hole plan and F1's track map are: a payload has to drive both a
 * thumbnail and a full-width figure, stay legible in both themes, and describe
 * itself to a reader who cannot see it.
 *
 * MMA has no pitch, court or circuit for a position to sit on. What matters is
 * one fighter relative to the other, so the diagram draws two labelled bodies
 * (top and bottom) rather than a playing area, optionally with a line showing
 * which limb is controlled. `mat: 'position'` is the discriminator, checked
 * first in the article renderer's dispatch chain: it collides with nothing
 * else in use (`hole`, `track`, `holes`, `strokesGained`).
 *
 * Nothing here is imported by another sport's pages, in the same spirit as
 * `golf-diagrams.tsx`: the article renderer picks a block by payload shape, so
 * MMA contributes one visual without any other sport's page growing a branch.
 */

/* ────────────────────────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────────────────────── */

export interface MatPosition {
  id: string;
  label: string;
  role: 'top' | 'bottom';
  x: number;
  y: number;
  highlight?: boolean;
}

export interface MatLimb {
  kind: 'arm' | 'leg' | 'head' | 'hip';
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  controlledBy?: 'top' | 'bottom';
}

export interface MatStep {
  caption: string;
  positions: MatPosition[];
  limbs?: MatLimb[];
  note?: string;
}

export interface MatShape {
  mat: 'position';
  steps: MatStep[];
  caption?: string;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Parsing
 * ────────────────────────────────────────────────────────────────────────── */

const isNum = (value: unknown): value is number =>
  typeof value === 'number' && !Number.isNaN(value);

const LIMB_KINDS = new Set(['arm', 'leg', 'head', 'hip']);

export function toMatShape(value: unknown): MatShape | null {
  if (!value || typeof value !== 'object') return null;
  const c = value as Record<string, unknown>;
  if (c.mat !== 'position') return null;
  if (!Array.isArray(c.steps) || c.steps.length === 0) return null;

  const steps = c.steps.filter((step): step is MatStep => {
    if (!step || typeof step !== 'object') return false;
    const s = step as Record<string, unknown>;
    if (typeof s.caption !== 'string') return false;
    if (!Array.isArray(s.positions) || s.positions.length === 0) return false;

    const positionsValid = s.positions.every((position) => {
      if (!position || typeof position !== 'object') return false;
      const p = position as Record<string, unknown>;
      return (
        typeof p.id === 'string' &&
        typeof p.label === 'string' &&
        (p.role === 'top' || p.role === 'bottom') &&
        isNum(p.x) &&
        isNum(p.y)
      );
    });
    if (!positionsValid) return false;

    if (s.limbs !== undefined) {
      if (!Array.isArray(s.limbs)) return false;
      const limbsValid = s.limbs.every((limb) => {
        if (!limb || typeof limb !== 'object') return false;
        const l = limb as Record<string, unknown>;
        return (
          typeof l.kind === 'string' &&
          LIMB_KINDS.has(l.kind) &&
          isNum(l.fromX) &&
          isNum(l.fromY) &&
          isNum(l.toX) &&
          isNum(l.toY)
        );
      });
      if (!limbsValid) return false;
    }

    return true;
  });
  if (steps.length !== c.steps.length) return null;

  return {
    mat: 'position',
    steps,
    caption: typeof c.caption === 'string' ? c.caption : undefined,
  };
}

/* ────────────────────────────────────────────────────────────────────────────
 * Rendering
 * ────────────────────────────────────────────────────────────────────────── */

const ROLE_STYLE: Record<MatPosition['role'], string> = {
  top: 'fill-foreground text-background',
  bottom: 'fill-muted stroke-foreground/40 text-foreground',
};

export function MmaPositionDiagram({ shape, title }: { shape: MatShape; title: string }) {
  const description = [title, shape.caption, shape.steps.map((step) => step.caption).join(' ')]
    .filter(Boolean)
    .join(' — ');

  return (
    <figure className="not-prose">
      <div className="grid gap-4 sm:grid-cols-2">
        {shape.steps.map((step, index) => (
          <div key={index}>
            <svg
              viewBox="0 0 100 100"
              role="img"
              aria-label={index === 0 ? description : step.caption}
              className="w-full rounded-lg border border-border bg-card"
            >
              {step.limbs?.map((limb, limbIndex) => (
                <line
                  key={limbIndex}
                  x1={limb.fromX}
                  y1={limb.fromY}
                  x2={limb.toX}
                  y2={limb.toY}
                  className="stroke-foreground/60"
                  strokeWidth={1.5}
                  strokeDasharray={limb.kind === 'leg' ? '3 2' : undefined}
                />
              ))}

              {step.positions.map((position) => (
                <g key={position.id}>
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r={position.highlight ? 10 : 8}
                    className={`${ROLE_STYLE[position.role]} ${
                      position.highlight ? 'stroke-2 stroke-foreground' : ''
                    }`}
                  />
                  <text
                    x={position.x}
                    y={position.y + 16}
                    textAnchor="middle"
                    className="fill-foreground text-[6px]"
                  >
                    {position.label}
                  </text>
                </g>
              ))}
            </svg>
            <p className="mt-1 text-sm text-muted-foreground">{step.caption}</p>
            {step.note ? <p className="text-xs text-muted-foreground/80">{step.note}</p> : null}
          </div>
        ))}
      </div>
    </figure>
  );
}
