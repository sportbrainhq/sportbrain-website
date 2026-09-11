import { z } from 'zod';
import {
  newsletterSubscriptionSummarySchema,
  passportPrivacySettingsSchema,
  userPreferencesSchema,
  type PassportPrivacySettings,
  type UserPreferences,
} from '@sportbrain/contracts';
import { PreferencesForm } from '@/components/profile/preferences-form';
import { MondayBriefSection } from '@/components/newsletter/monday-brief-section';
import { PassportPrivacyForm } from '@/components/passport/passport-privacy-form';
import { apiGetAuthed } from '@/lib/auth';

export const metadata = { title: 'Preferences' };

const DEFAULTS: UserPreferences = {
  contentTypes: [],
  newsletterWeekly: false,
  productUpdates: false,
};

const PASSPORT_PRIVACY_DEFAULTS: PassportPrivacySettings = {
  isPublic: false,
  showAvatarPublicly: true,
  showActivityPublicly: true,
  showStreakPublicly: true,
  showAchievementsPublicly: true,
  allowSearchIndexing: false,
  publicId: null,
};

const passportPrivacyEnvelope = z.object({ data: passportPrivacySettingsSchema });

export default async function PreferencesPage() {
  const [preferences, newsletter, passportPrivacyResult] = await Promise.all([
    apiGetAuthed('/v1/users/me/preferences', userPreferencesSchema),
    // Null both when the account has never subscribed and when the request
    // fails — either way, the section below renders its own "not
    // subscribed yet" state rather than the page failing to render.
    apiGetAuthed('/v1/me/newsletter', newsletterSubscriptionSummarySchema),
    apiGetAuthed('/v1/me/passport/privacy', passportPrivacyEnvelope),
  ]);
  const passportPrivacy = passportPrivacyResult?.data ?? null;

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold text-foreground">Preferences</h1>
      <PreferencesForm initial={preferences ?? DEFAULTS} />
      <MondayBriefSection initial={newsletter} />
      <PassportPrivacyForm initial={passportPrivacy ?? PASSPORT_PRIVACY_DEFAULTS} />
    </div>
  );
}
