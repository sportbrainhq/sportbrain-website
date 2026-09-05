'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const SECTIONS = [
  { href: '/profile', label: 'Overview' },
  { href: '/profile/quizzes', label: 'Quiz History' },
  { href: '/profile/saved', label: 'Saved' },
  { href: '/profile/following', label: 'Following' },
  { href: '/profile/preferences', label: 'Preferences' },
  { href: '/profile/account', label: 'Account' },
];

export function ProfileSubnav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Profile" className="-mx-1 flex gap-1 overflow-x-auto border-b border-border">
      {SECTIONS.map((section) => {
        const isActive =
          section.href === '/profile' ? pathname === '/profile' : pathname.startsWith(section.href);
        return (
          <Link
            key={section.href}
            href={section.href}
            className={cn(
              'whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {section.label}
          </Link>
        );
      })}
    </nav>
  );
}
