import { AccountActions } from '@/components/profile/account-actions';
import { requireUser } from '@/lib/auth';

export const metadata = { title: 'Account' };

export default async function AccountPage() {
  const user = await requireUser();
  const memberSince = new Date(user.memberSince).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-lg space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Account</h1>

      <dl className="space-y-3 rounded-lg border border-border bg-card p-4">
        <Row label="Google account email" value={user.email} />
        <Row label="Display name" value={user.displayName} />
        <Row label="Member since" value={memberSince} />
      </dl>

      <AccountActions />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-card-foreground">{value}</dd>
    </div>
  );
}
