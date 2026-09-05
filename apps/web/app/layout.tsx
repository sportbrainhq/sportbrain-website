import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/components/auth/auth-provider';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { getCurrentUser } from '@/lib/auth';
import { siteUrl } from '@/lib/env';
import {
  DEFAULT_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  jsonLdScript,
  websiteJsonLd,
} from '@/lib/seo';
import './globals.css';

/**
 * Self-hosted via next/font: the font files are served from this origin, so
 * there is no third-party request blocking first paint and no layout shift
 * from a late-arriving font file.
 */
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  // Makes every relative URL in metadata across the site resolve absolutely.
  // Without it, Open Graph images and canonicals silently emit relative paths,
  // which crawlers and social platforms ignore.
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    // Page titles become "Cricket | SportBrainHQ" without each page repeating
    // the brand.
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  referrer: 'origin-when-cross-origin',
  formatDetection: { telephone: false, address: false, email: false },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_GB',
    url: siteUrl,
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // No maximumScale or userScalable: false. Blocking zoom fails WCAG 1.4.4.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Fetched once per render and passed down, so the header never shows a
  // logged-out flash before a client-side fetch resolves. See
  // `components/auth/auth-provider.tsx`.
  const user = await getCurrentUser();

  return (
    <html lang="en-GB" className={inter.variable} suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col antialiased">
        <AuthProvider initialUser={user}>
          {/* First focusable element on the page, so keyboard users can bypass
              the header rather than tabbing through it on every navigation. */}
          <a href="#main" className="skip-link">
            Skip to main content
          </a>

          <SiteHeader />

          <main id="main" className="flex-1">
            {children}
          </main>

          <SiteFooter />

          <script
            type="application/ld+json"
            // Escaped by jsonLdScript. See the note there on why.
            dangerouslySetInnerHTML={{ __html: jsonLdScript(websiteJsonLd()) }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
