import { ImageResponse } from 'next/og';
import { quizShareSchema } from '@sportbrain/contracts';
import { apiGet } from '@/lib/api';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Same rules as the passport/achievement cards (Part 51/52/54): server-fetched data only, no question text/answers. */
export default async function QuizShareOgImage({
  params,
}: {
  params: Promise<{ publicCode: string }>;
}) {
  const { publicCode } = await params;

  let share;
  try {
    share = await apiGet(`/v1/share/quiz/${publicCode}`, quizShareSchema, { noStore: true });
  } catch {
    share = null;
  }

  if (!share) {
    return new ImageResponse(
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
          color: '#fff',
          fontSize: 48,
        }}
      >
        SportBrainHQ
      </div>,
      size,
    );
  }

  const title =
    share.quizType === 'MASTER' ? 'MASTER QUIZ' : (share.sportName ?? 'QUIZ').toUpperCase();

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: 64,
        background: '#0f172a',
        color: '#fff',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ fontSize: 28, letterSpacing: 4, opacity: 0.7 }}>SPORTBRAINHQ</div>
      <div style={{ fontSize: 40, fontWeight: 700, marginTop: 8 }}>{title}</div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, marginTop: 40 }}>
        <div style={{ fontSize: 120, fontWeight: 900 }}>
          {share.correctCount} / {share.totalCount}
        </div>
        {share.scorePercentage !== null && (
          <div style={{ fontSize: 40, fontWeight: 700, opacity: 0.85 }}>
            {Math.round(share.scorePercentage)}%
          </div>
        )}
      </div>

      {share.sportBreakdown && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 40 }}>
          {share.sportBreakdown.slice(0, 5).map((row) => (
            <div key={row.sportName} style={{ display: 'flex', fontSize: 28, gap: 16 }}>
              <div style={{ width: 220, opacity: 0.85 }}>{row.sportName.toUpperCase()}</div>
              <div style={{ fontWeight: 700 }}>
                {row.correctCount}/{row.totalCount}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 'auto', fontSize: 24, opacity: 0.85 }}>Can you beat this score?</div>
      <div style={{ marginTop: 16, fontSize: 20, opacity: 0.5 }}>sportbrainhq.com</div>
    </div>,
    size,
  );
}
