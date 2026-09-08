import type { PassportProgress } from '@sportbrain/contracts';

/**
 * SportBrain Score over time (Part 39-41): a simple SVG line, not a
 * charting library — one series, no interaction needed beyond the
 * accessible text summary alongside it (Part 82).
 */
export function ProgressGraph({ progress }: { progress: PassportProgress }) {
  if (progress.points.length < 2) {
    return (
      <p className="text-sm text-muted-foreground">
        Your progress will appear here as you complete more quizzes.
      </p>
    );
  }

  const width = 600;
  const height = 160;
  const padding = 8;
  const scores = progress.points.map((p) => p.overallScore);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = max - min || 1;

  const points = progress.points.map((p, i) => {
    const x = padding + (i / (progress.points.length - 1)) * (width - padding * 2);
    const y = height - padding - ((p.overallScore - min) / range) * (height - padding * 2);
    return { x, y, point: p };
  });

  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  const summary =
    progress.change !== null
      ? `SportBrain Score ${progress.change >= 0 ? 'increased' : 'decreased'} from ${progress.scoreNDaysAgo} to ${progress.currentScore} over this period.`
      : `Current SportBrain Score: ${progress.currentScore}.`;

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label={summary}>
        <path d={path} fill="none" stroke="currentColor" strokeWidth={2} className="text-primary" />
        {points.length > 0 && (
          <circle
            cx={points[points.length - 1]?.x}
            cy={points[points.length - 1]?.y}
            r={3}
            className="fill-primary"
          />
        )}
      </svg>
      <p className="mt-2 text-xs text-muted-foreground">{summary}</p>
    </div>
  );
}
