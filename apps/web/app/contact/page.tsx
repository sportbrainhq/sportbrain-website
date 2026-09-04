import Link from 'next/link';
import type { Metadata } from 'next';
import { Container } from '@/components/layout/container';
import { SocialIcon } from '@/components/about/social-icon';
import { ContactForm } from '@/components/contact/contact-form';
import { fetchContactConfig } from '@/lib/api';
import { buildMetadata, jsonLdScript, SITE_NAME } from '@/lib/seo';
import { SOCIAL_LINKS } from '@/lib/social-links';
import { DIRECT_EMAIL_LABELS, HERO } from './content';

const DESCRIPTION =
  'Contact SportBrainHQ: report incorrect sports information, share feedback, propose a partnership, or reach the press team.';

export const metadata: Metadata = buildMetadata({
  title: 'Contact',
  description: DESCRIPTION,
  path: '/contact',
});

function contactJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: `Contact ${SITE_NAME}`,
    description: DESCRIPTION,
  };
}

const sectionHeading = 'text-2xl font-black tracking-tight sm:text-3xl';

export default async function ContactPage() {
  // Never cached indefinitely at the page level beyond the tag-based policy
  // in fetchContactConfig: a newly configured address should appear within
  // its revalidate window without a deploy.
  const config = await fetchContactConfig();
  const directEmails = Object.entries(config.emails) as Array<
    [keyof typeof DIRECT_EMAIL_LABELS, string]
  >;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(contactJsonLd()) }}
      />

      {/* Hero */}
      <Container className="py-16 sm:py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-bold tracking-widest text-muted-foreground">{HERO.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{HERO.headline}</h1>
          <p className="mt-5 text-lg text-muted-foreground">{HERO.body}</p>
        </div>
      </Container>

      {/* Form */}
      <Container className="pb-16 sm:pb-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="rounded-lg border border-border bg-card p-6 sm:p-8">
            <ContactForm />
          </div>

          {/* Direct contact + socials */}
          <aside className="space-y-8">
            {directEmails.length > 0 && (
              <div>
                <h2 className={sectionHeading}>Direct contact</h2>
                <ul className="mt-4 space-y-3 text-sm">
                  {directEmails.map(([key, address]) => (
                    <li key={key}>
                      <p className="font-semibold">{DIRECT_EMAIL_LABELS[key]}</p>
                      <a
                        href={`mailto:${address}`}
                        className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
                      >
                        {address}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h2 className={sectionHeading}>Follow along</h2>
              <div className="mt-4 flex gap-3">
                {SOCIAL_LINKS.map((social) =>
                  social.href ? (
                    <Link
                      key={social.name}
                      href={social.href}
                      aria-label={social.name}
                      className="grid size-11 place-items-center rounded-full border border-border bg-card transition-colors hover:border-foreground/20 hover:bg-muted/50"
                    >
                      <SocialIcon name={social.name} className="size-5" />
                    </Link>
                  ) : (
                    <span
                      key={social.name}
                      aria-label={`${social.name} (coming soon)`}
                      title="Coming soon"
                      className="grid size-11 place-items-center rounded-full border border-dashed border-border text-muted-foreground"
                    >
                      <SocialIcon name={social.name} className="size-5" />
                    </span>
                  ),
                )}
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}
