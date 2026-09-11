'use client';

import { useState } from 'react';
import { clientEnv } from '@/lib/env';

/**
 * Passport share (Part 47, 50, 79): private by default. Sharing without a
 * public Passport enabled shows what will/won't be visible and offers to
 * enable it — never silently makes the Passport public.
 */
export function SharePassportButton({
  isPublic,
  publicId,
}: {
  isPublic: boolean;
  publicId: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [enabling, setEnabling] = useState(false);
  const [currentIsPublic, setCurrentIsPublic] = useState(isPublic);
  const [currentPublicId, setCurrentPublicId] = useState(publicId);

  const shareUrl =
    currentIsPublic && currentPublicId
      ? new URL(`/passport/${currentPublicId}`, clientEnv.NEXT_PUBLIC_SITE_URL).toString()
      : null;

  async function enableAndShare() {
    setEnabling(true);
    try {
      const response = await fetch(
        new URL('/v1/me/passport/privacy', clientEnv.NEXT_PUBLIC_API_URL),
        {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ isPublic: true }),
        },
      );
      if (response.ok) {
        const body = await response.json();
        setCurrentIsPublic(true);
        setCurrentPublicId(body.data?.publicId ?? null);
      }
    } finally {
      setEnabling(false);
    }
  }

  async function copyLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // Clipboard access can fail silently (permissions, insecure context); the link is still visible in the modal.
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary"
      >
        Share Passport
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-passport-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6">
            <h2 id="share-passport-title" className="text-lg font-bold text-card-foreground">
              Share your SportBrain
            </h2>

            {shareUrl ? (
              <div className="mt-4 space-y-3">
                <p className="break-all rounded-md border border-border bg-secondary px-3 py-2 text-xs text-secondary-foreground">
                  {shareUrl}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={copyLink}
                    className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
                  >
                    Copy Link
                  </button>
                  {typeof navigator !== 'undefined' && 'share' in navigator && (
                    <button
                      type="button"
                      onClick={() =>
                        navigator.share({ url: shareUrl, title: 'My SportBrain Passport' })
                      }
                      className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
                    >
                      Share
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  To share your Passport, enable your public SportBrain profile.
                </p>
                <div className="space-y-1 text-xs">
                  <p className="text-foreground">✓ Display name</p>
                  <p className="text-foreground">✓ SportBrain Score</p>
                  <p className="text-foreground">✓ Sports knowledge</p>
                  <p className="text-foreground">✓ Achievements</p>
                  <p className="text-foreground">✓ Public activity statistics</p>
                  <p className="mt-2 text-muted-foreground">✕ Email</p>
                  <p className="text-muted-foreground">✕ Saved items</p>
                  <p className="text-muted-foreground">✕ Account information</p>
                </div>
                <button
                  type="button"
                  onClick={enableAndShare}
                  disabled={enabling}
                  className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {enabling ? 'Enabling…' : 'Enable & Share'}
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-4 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
