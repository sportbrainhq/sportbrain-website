import { ImageResponse } from 'next/og';
import { publicAchievementShareSchema } from '@sportbrain/contracts';
import { apiGet } from '@/lib/api';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function AchievementOgImage({
  params,
}: {
  params: Promise<{ userAchievementId: string }>;
}) {
  const { userAchievementId } = await params;

  let share;
  try {
    share = await apiGet(
      `/v1/share/achievement/${userAchievementId}`,
      publicAchievementShareSchema,
      {
        noStore: true,
      },
    );
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

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 64,
        background: '#0f172a',
        color: '#fff',
        fontFamily: 'sans-serif',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 28, letterSpacing: 4, opacity: 0.7 }}>SPORTBRAINHQ</div>
      <div style={{ fontSize: 56, fontWeight: 900, marginTop: 24 }}>{share.achievement.name}</div>
      <div style={{ fontSize: 28, opacity: 0.85, marginTop: 16, maxWidth: 900 }}>
        {share.achievement.description}
      </div>
      <div style={{ fontSize: 22, opacity: 0.6, marginTop: 40 }}>
        Unlocked by {share.displayName}
      </div>
      <div style={{ marginTop: 24, fontSize: 20, opacity: 0.5 }}>sportbrainhq.com</div>
    </div>,
    size,
  );
}
