/**
 * Copy and structured content for the /newsletter page.
 *
 * Kept out of the page component so the marketing copy can be reviewed and
 * edited without touching JSX/layout logic, matching the /about and /contact
 * pages' `content.ts` convention.
 */

export const HERO = {
  eyebrow: 'THE MONDAY BRIEF',
  headline: 'GET THE MONDAY BRIEF',
  body: 'The week in sport, explained. One email, every Monday morning.',
  supporting: 'Every Monday. No spam. Unsubscribe anytime.',
};

export interface NewsletterSectionCard {
  title: string;
  description: string;
}

/** "What You'll Get" editorial cards. */
export const WHAT_YOU_GET: NewsletterSectionCard[] = [
  {
    title: 'The week, in five minutes',
    description: 'The stories that actually mattered across every sport we cover, distilled.',
  },
  {
    title: 'Numbers with context',
    description: 'Records, streaks and stats explained, not just reported.',
  },
  {
    title: 'One thing worth understanding',
    description: 'A rule, a tactic or a piece of history explained properly, every week.',
  },
  {
    title: 'What to watch this week',
    description: 'The fixtures worth clearing your schedule for.',
  },
  {
    title: 'From the archive',
    description: 'A story from sport’s history, resurfaced because it rhymes with this week.',
  },
  {
    title: 'Reader questions, answered',
    description: 'The best sports questions we got this week, answered properly.',
  },
];

export const FOOTER_CTA = {
  headline: 'Start next Monday.',
  body: 'Join readers who get the week in sport delivered, not chased down.',
};
