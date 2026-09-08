import { ImageResponse } from 'next/og';
import { publicPassportSchema } from '@sportbrain/contracts';
import { apiGet } from '@/lib/api';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Shareable Passport card (Part 51, 54): server-rendered from the same
 * public-Passport data the page itself shows — never client-submitted
 * score text (Part 51: "never allow client to submit arbitrary score text
 * for official card"). Ownership/visibility is enforced the same way the
 * page enforces it: the underlying `GET /passports/:publicId` 404s for a
 * private or unknown Passport, which this route lets propagate as a plain
 * fallback card rather than leaking anything.
 */
export default async function PassportOgImage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;

  let passport;
  try {
    passport = await apiGet(`/v1/passports/${publicId}`, publicPassportSchema, { noStore: true });
  } catch {
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

  const topSports = passport.sports.slice(0, 3);

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
      <div style={{ fontSize: 40, fontWeight: 700, marginTop: 8 }}>
        {passport.displayName}&rsquo;s SportBrain
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, marginTop: 40 }}>
        {passport.overallScore !== null && (
          <div style={{ fontSize: 120, fontWeight: 900 }}>{passport.overallScore}</div>
        )}
        {passport.overallLevel && (
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: 2,
              padding: '8px 20px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.12)',
            }}
          >
            {passport.overallLevel}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 40 }}>
        {topSports.map((sport) => (
          <div key={sport.sportId} style={{ display: 'flex', fontSize: 28, gap: 16 }}>
            <div style={{ width: 220, opacity: 0.85 }}>{sport.sportName.toUpperCase()}</div>
            <div style={{ fontWeight: 700 }}>{sport.level}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 32, marginTop: 'auto', fontSize: 24, opacity: 0.85 }}>
        <div>{passport.questionsAnswered.toLocaleString()} Questions</div>
        {passport.accuracy !== null && <div>{Math.round(passport.accuracy)}% Accuracy</div>}
      </div>

      <div style={{ marginTop: 16, fontSize: 20, opacity: 0.5 }}>sportbrainhq.com</div>
    </div>,
    size,
  );
}
