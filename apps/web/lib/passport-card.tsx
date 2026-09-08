import { ImageResponse } from 'next/og';
import type { PublicPassport } from '@sportbrain/contracts';

export const PASSPORT_CARD_SIZE = { width: 1200, height: 630 };

/**
 * Shared Passport share-card renderer (Part 51, 54): used by both the
 * public Passport's `opengraph-image` (link-preview convention) and the
 * dedicated `/share/passport/:publicId` image route (explicit share
 * surface, same spec section). One render function so the two routes can
 * never visually drift apart. Always built from server-fetched
 * `PublicPassport` data — never client-submitted score text (Part 51).
 */
export function renderPassportCard(passport: PublicPassport | null): ImageResponse {
  if (!passport) {
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
      PASSPORT_CARD_SIZE,
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
    PASSPORT_CARD_SIZE,
  );
}
