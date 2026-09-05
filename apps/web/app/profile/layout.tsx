import { Container } from '@/components/layout/container';
import { ProfileSubnav } from '@/components/profile/profile-subnav';
import { requireUser } from '@/lib/auth';

/**
 * Shared shell for every `/profile/*` page: gates the whole section on
 * being signed in (a signed-out visitor is redirected home, per Phase 10 —
 * public browsing stays public everywhere else, only this section is
 * gated) and renders the section sub-nav once rather than per page.
 */
export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  await requireUser();

  return (
    <Container size="default" className="py-8">
      <ProfileSubnav />
      <div className="mt-6">{children}</div>
    </Container>
  );
}
