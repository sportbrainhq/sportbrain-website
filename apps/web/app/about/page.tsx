import Link from 'next/link';
import type { Metadata } from 'next';
import { Container } from '@/components/layout/container';
import { SocialIcon } from '@/components/about/social-icon';
import { buildMetadata, jsonLdScript, SITE_NAME } from '@/lib/seo';
import {
  APPROACH,
  BUILDING,
  CONTENT_MODEL,
  DATA_TRANSPARENCY,
  FOOTER_CTA,
  HERO,
  MISSION,
  PRINCIPLES,
  SOCIAL_LINKS,
  SPORTS_COVERED,
  SPORTS_COVERED_NOTE,
} from './content';

const DESCRIPTION =
  'SportBrainHQ is building a structured home for sports knowledge — the players, teams, competitions, stories and context behind football, cricket, basketball, tennis, Formula 1 and more.';

export const metadata: Metadata = buildMetadata({
  title: 'About',
  description: DESCRIPTION,
  path: '/about',
});

function aboutJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: `About ${SITE_NAME}`,
    description: DESCRIPTION,
    mainEntity: {
      '@type': 'Organization',
      name: SITE_NAME,
      description: DESCRIPTION,
    },
  };
}

const sectionHeading = 'text-2xl font-black tracking-tight sm:text-3xl';
const cardClass = 'rounded-lg border border-border bg-card p-5 transition-colors';

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(aboutJsonLd()) }}
      />

      {/* Hero */}
      <Container className="py-16 sm:py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-bold tracking-widest text-muted-foreground">{HERO.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            {HERO.headline.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">{HERO.body}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={HERO.primaryCta.href}
              className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
            >
              {HERO.primaryCta.label}
            </Link>
            <Link
              href={HERO.secondaryCta.href}
              className="rounded-md border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-muted/50"
            >
              {HERO.secondaryCta.label}
            </Link>
          </div>
        </div>
      </Container>

      {/* What we're building */}
      <Container className="py-12 sm:py-16">
        <div className="max-w-2xl">
          <h2 className={sectionHeading}>{BUILDING.heading}</h2>
          <p className="mt-3 text-muted-foreground">{BUILDING.body}</p>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {BUILDING.capabilities.map((capability) => (
            <div key={capability.title} className={cardClass}>
              <p className="text-xs font-bold tracking-widest text-muted-foreground">
                {capability.title}
              </p>
              <p className="mt-2 text-sm">{capability.description}</p>
            </div>
          ))}
        </div>
      </Container>

      {/* The SportBrain approach */}
      <Container className="py-12 sm:py-16">
        <div className="rounded-lg border border-border bg-card p-6 sm:p-10">
          <h2 className={sectionHeading}>{APPROACH.heading}</h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {APPROACH.pillars.map((pillar, index) => (
              <span key={pillar} className="flex items-center gap-2">
                <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-bold tracking-widest">
                  {pillar}
                </span>
                {index < APPROACH.pillars.length - 1 && (
                  <span aria-hidden className="text-muted-foreground">
                    →
                  </span>
                )}
              </span>
            ))}
          </div>
          <ul className="mt-6 space-y-2 text-muted-foreground">
            {APPROACH.statements.map((statement) => (
              <li key={statement}>{statement}</li>
            ))}
          </ul>
          <p className="mt-4 font-semibold">{APPROACH.conclusion}</p>
        </div>
      </Container>

      {/* Sports we cover */}
      <Container className="py-12 sm:py-16">
        <h2 className={sectionHeading}>Sports we cover</h2>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {SPORTS_COVERED.map((sport) => (
            <Link
              key={sport.slug}
              href={`/sports/${sport.slug}`}
              className="rounded-lg border border-border bg-card p-4 text-center text-sm font-semibold transition-colors hover:border-foreground/20 hover:bg-muted/50"
            >
              {sport.name}
            </Link>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{SPORTS_COVERED_NOTE}</p>
      </Container>

      {/* How SportBrainHQ is organized */}
      <Container className="py-12 sm:py-16">
        <div className="max-w-2xl">
          <h2 className={sectionHeading}>{CONTENT_MODEL.heading}</h2>
          <p className="mt-3 text-muted-foreground">{CONTENT_MODEL.body}</p>
        </div>
        <div className="mt-8 flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          {CONTENT_MODEL.layers.map((layer, index) => (
            <span key={layer} className="flex items-center gap-2">
              <span className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold">
                {layer}
              </span>
              {index < CONTENT_MODEL.layers.length - 1 && (
                <span aria-hidden className="text-muted-foreground sm:rotate-[-90deg] sm:hidden">
                  ↓
                </span>
              )}
              {index < CONTENT_MODEL.layers.length - 1 && (
                <span aria-hidden className="hidden text-muted-foreground sm:inline">
                  →
                </span>
              )}
            </span>
          ))}
        </div>
      </Container>

      {/* Our principles */}
      <Container className="py-12 sm:py-16">
        <h2 className={sectionHeading}>Our principles</h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {PRINCIPLES.map((principle) => (
            <div key={principle.title} className={cardClass}>
              <p className="text-xs font-bold tracking-widest text-muted-foreground">
                {principle.title}
              </p>
              <p className="mt-2 text-sm">{principle.description}</p>
            </div>
          ))}
        </div>
      </Container>

      {/* Data & editorial transparency */}
      <Container className="py-12 sm:py-16">
        <div className="max-w-2xl">
          <h2 className={sectionHeading}>{DATA_TRANSPARENCY.heading}</h2>
          <div className="mt-3 space-y-3 text-muted-foreground">
            {DATA_TRANSPARENCY.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <Link
            href={DATA_TRANSPARENCY.link.href}
            className="mt-4 inline-block text-sm font-semibold underline underline-offset-4"
          >
            {DATA_TRANSPARENCY.link.label}
          </Link>
        </div>
      </Container>

      {/* Mission */}
      <Container className="py-16 sm:py-20">
        <div className="max-w-3xl border-l-4 border-primary pl-6">
          <p className="text-2xl font-black leading-snug tracking-tight sm:text-3xl">
            {MISSION.statement[0]}
            <br />
            <span className="italic">{MISSION.statement[1]}</span>
            <br />
            {MISSION.statement[2]}
            <br />
            <span className="italic">{MISSION.statement[3]}</span>
          </p>
        </div>
      </Container>

      {/* Connect */}
      <Container className="py-12 sm:py-16">
        <h2 className={sectionHeading}>Connect with SportBrainHQ</h2>
        <div className="mt-6 flex gap-3">
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
      </Container>

      {/* Footer CTA */}
      <Container className="py-16 sm:py-20">
        <div className="rounded-lg border border-border bg-card p-8 text-center sm:p-12">
          <h2 className={sectionHeading}>{FOOTER_CTA.heading}</h2>
          <Link
            href={FOOTER_CTA.cta.href}
            className="mt-6 inline-block rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
          >
            {FOOTER_CTA.cta.label}
          </Link>
        </div>
      </Container>
    </>
  );
}
