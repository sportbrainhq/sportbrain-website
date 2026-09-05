import { userPreferencesSchema, type UserPreferences } from '@sportbrain/contracts';
import { PreferencesForm } from '@/components/profile/preferences-form';
import { apiGetAuthed } from '@/lib/auth';

export const metadata = { title: 'Preferences' };

const DEFAULTS: UserPreferences = {
  contentTypes: [],
  newsletterWeekly: false,
  productUpdates: false,
};

export default async function PreferencesPage() {
  const preferences =
    (await apiGetAuthed('/v1/users/me/preferences', userPreferencesSchema)) ?? DEFAULTS;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Preferences</h1>
      <PreferencesForm initial={preferences} />
    </div>
  );
}
