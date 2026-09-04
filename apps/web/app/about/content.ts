/**
 * Copy and structured content for the /about page.
 *
 * Kept out of the page component so the marketing copy can be reviewed and
 * edited without touching JSX/layout logic.
 */

export const HERO = {
  eyebrow: 'ABOUT SPORTBRAINHQ',
  headline: ['Sports are easy to watch.', 'Harder to understand.'],
  body: 'SportBrainHQ is building a structured home for sports knowledge — bringing together the games, players, teams, competitions, stories and context that make sport worth following.',
  primaryCta: { label: 'Explore Sports', href: '/' },
  // No sport-agnostic quiz landing route exists yet; per-sport quiz pages
  // live at /sports/[sport]/quiz. Football is the most established sport,
  // so it's used as the default entry point until a cross-sport quiz hub
  // exists.
  secondaryCta: { label: 'Take a Quiz', href: '/sports/football/quiz' },
};

export const BUILDING = {
  heading: 'More than scores.',
  body: 'Most sports products are optimised around live scores, breaking news and individual articles. SportBrainHQ is being built around understanding sport — the rules, the history and the context behind what you’re watching.',
  capabilities: [
    {
      title: 'UNDERSTAND',
      description: 'Rules, formats, terminology and explainers.',
    },
    {
      title: 'EXPLORE',
      description: 'Players, teams, competitions and sporting history.',
    },
    {
      title: 'FOLLOW',
      description: 'Current stories, results and developments across sports.',
    },
    {
      title: 'TEST YOURSELF',
      description: 'Quizzes that turn sports knowledge into something measurable.',
    },
  ],
};

export const APPROACH = {
  heading: 'The SportBrain approach',
  pillars: ['CONTEXT', 'DATA', 'STORIES', 'KNOWLEDGE'],
  statements: [
    'Context without data can be misleading.',
    'Data without context can be meaningless.',
    'Stories without history are incomplete.',
  ],
  conclusion: 'SportBrainHQ tries to connect all three.',
};

/**
 * Illustrative list of sports currently live on the platform. This is a
 * static, hand-maintained showcase for the About page — not the source of
 * truth for routing or product coverage. The live sport list is fetched
 * dynamically elsewhere (see `fetchSports()` in `lib/api.ts`); keep this in
 * sync manually when a sport launches or its slug changes.
 */
export const SPORTS_COVERED = [
  { name: 'Football', slug: 'football' },
  { name: 'Cricket', slug: 'cricket' },
  { name: 'Basketball', slug: 'basketball' },
  { name: 'Tennis', slug: 'tennis' },
  { name: 'Formula 1', slug: 'formula-1' },
  { name: 'Golf', slug: 'golf' },
  { name: 'American Football', slug: 'american-football' },
  { name: 'MMA', slug: 'mma' },
  { name: 'Boxing', slug: 'boxing' },
] as const;

export const SPORTS_COVERED_NOTE = 'More sports will join the hub over time.';

export const CONTENT_MODEL = {
  heading: 'How SportBrainHQ is organised',
  body: 'SportBrainHQ is designed as an interconnected sports knowledge system rather than a feed of disconnected articles. Everything is built on the same structure, sport after sport:',
  layers: ['Sport', 'Competitions', 'Teams', 'Players', 'Stories, explainers & quizzes'],
};

export const PRINCIPLES = [
  {
    title: 'ACCURACY OVER SPEED',
    description: 'Being first matters less than being correct.',
  },
  {
    title: 'CONTEXT OVER NOISE',
    description: 'Information should help users understand something.',
  },
  {
    title: 'SPORTS DESERVE DEPTH',
    description: 'Smaller sports and historical stories deserve structured coverage too.',
  },
  {
    title: 'ALWAYS IMPROVING',
    description:
      'Sports data changes and historical records can be complicated. Corrections and improvements are part of the platform.',
  },
];

export const DATA_TRANSPARENCY = {
  heading: 'Data & editorial transparency',
  body: [
    'SportBrainHQ uses information from multiple public, licensed and structured sources depending on the content.',
    'Facts and records should be traceable internally to their source.',
    'As the platform evolves, dedicated methodology and source information will be exposed where appropriate.',
  ],
  link: { label: 'Data & Editorial Standards', href: '/about/data-standards' },
};

export const MISSION = {
  statement: [
    'Build the place where a curious sports fan can go from',
    '“What happened?”',
    'to',
    '“Why did it matter?”',
  ],
};

/**
 * Social links, sourced from `NEXT_PUBLIC_SOCIAL_*` (see `lib/env.ts`) rather
 * than hard-coded here. An empty value means the account doesn't exist yet;
 * consumers render a "coming soon" state for it instead of a dead link.
 */
export { SOCIAL_LINKS } from '@/lib/social-links';

export const FOOTER_CTA = {
  heading: 'Pick a sport. Start exploring.',
  cta: { label: 'Explore Sports', href: '/' },
};
