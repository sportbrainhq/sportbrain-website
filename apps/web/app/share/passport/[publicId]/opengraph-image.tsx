import { publicPassportSchema } from '@sportbrain/contracts';
import { apiGet } from '@/lib/api';
import { PASSPORT_CARD_SIZE, renderPassportCard } from '@/lib/passport-card';

export const size = PASSPORT_CARD_SIZE;
export const contentType = 'image/png';

export default async function PassportShareOgImage({
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
