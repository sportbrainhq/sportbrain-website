import { publicPassportSchema } from '@sportbrain/contracts';
import { apiGet } from '@/lib/api';
import { PASSPORT_CARD_SIZE, renderPassportCard } from '@/lib/passport-card';

export const size = PASSPORT_CARD_SIZE;
export const contentType = 'image/png';

/**
 * Link-preview image for the public Passport page (Part 51, 54, 80) — same
 * renderer as the dedicated `/share/passport/:publicId` route, so a pasted
 * link and an explicit "Share" download look identical.
 */
export default async function PassportOgImage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;

  try {
    const passport = await apiGet(`/v1/passports/${publicId}`, publicPassportSchema, {
      noStore: true,
    });
    return renderPassportCard(passport);
  } catch {
    return renderPassportCard(null);
  }
}
