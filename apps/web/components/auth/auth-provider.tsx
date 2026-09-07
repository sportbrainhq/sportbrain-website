'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { SafeUser } from '@sportbrain/contracts';
import { fetchCurrentUserClient, logout as logoutRequest } from '@/lib/auth-client';

interface AuthContextValue {
  user: SafeUser | null;
  /** Re-fetches the current user client-side. Called after a redirect back from Google, and after logout. */
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Hydrated from the server (see `app/layout.tsx`, which calls
 * `getCurrentUser()` once per render) so the header never shows a
 * logged-out flash before a client fetch resolves. `refresh()` exists for
 * the two moments the server-rendered value can go stale within one page
 * life: right after the Google redirect lands back on the site, and right
 * after logout.
 */
export function AuthProvider({
  initialUser,
  children,
}: {
  initialUser: SafeUser | null;
  children: ReactNode;
}) {
  const [user, setUser] = useState<SafeUser | null>(initialUser);
  const router = useRouter();

  const refresh = useCallback(async () => {
    setUser(await fetchCurrentUserClient());
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
    // Every /profile/* page is auth-gated; staying put after logout leaves
    // stale server-rendered data (or a redirect loop) on screen. Home is
    // always safe to land on signed out.
    router.push('/');
    router.refresh();
  }, [router]);

  return <AuthContext.Provider value={{ user, refresh, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth() used outside <AuthProvider>');
  return context;
}
