'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { googleSignInUrl } from '@/lib/auth-client';

/**
 * The account entry point in the header: a "Sign in" link when signed out,
 * an avatar-triggered menu when signed in. Hand-rolled rather than a UI
 * library's dropdown: this codebase has no `components/ui` primitives yet
 * (see `entity-card.tsx`, styled by hand throughout), and one dropdown does
 * not justify introducing one.
 */
export function AccountMenu() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) {
    return (
      <a
        href={googleSignInUrl(pathname)}
        className="rounded-sm bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Sign in
      </a>
    );
  }

  return (
    <SignedInMenu displayName={user.displayName} email={user.email} avatarUrl={user.avatarUrl} />
  );
}

function SignedInMenu({
  displayName,
  email,
  avatarUrl,
}: {
  displayName: string;
  email: string;
  avatarUrl: string | null;
}) {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const initial = displayName.trim().charAt(0).toUpperCase() || '?';

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-secondary text-sm font-semibold text-secondary-foreground transition-colors hover:bg-accent"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- external Google avatar URL, not an optimizable local asset
          <img
            src={avatarUrl}
            alt=""
            className="size-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          initial
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-md border border-border bg-card py-1 shadow-lg"
        >
          <div className="border-b border-border px-3 py-2">
            <p className="truncate text-sm font-semibold text-card-foreground">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>

          <MenuLink href="/profile" onNavigate={() => setOpen(false)}>
            Profile
          </MenuLink>
          <MenuLink href="/profile/saved" onNavigate={() => setOpen(false)}>
            Saved
          </MenuLink>
          <MenuLink href="/profile/quizzes" onNavigate={() => setOpen(false)}>
            Quiz History
          </MenuLink>
          <MenuLink href="/profile/following" onNavigate={() => setOpen(false)}>
            Following
          </MenuLink>
          <MenuLink href="/profile/preferences" onNavigate={() => setOpen(false)}>
            Preferences
          </MenuLink>
          <MenuLink href="/profile/preferences#newsletter" onNavigate={() => setOpen(false)}>
            Newsletter
          </MenuLink>

          <div className="mt-1 border-t border-border pt-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                void logout();
              }}
              className="block w-full px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  onNavigate,
  children,
}: {
  href: string;
  onNavigate: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onNavigate}
      className="block px-3 py-2 text-sm text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      {children}
    </Link>
  );
}
