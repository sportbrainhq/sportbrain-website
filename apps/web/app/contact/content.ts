/**
 * Copy and structured content for the /contact page.
 *
 * Kept out of the page component so the marketing copy can be reviewed and
 * edited without touching JSX/layout logic, matching the /about page's
 * `content.ts` convention.
 */

export const HERO = {
  eyebrow: 'CONTACT SPORTBRAINHQ',
  headline: 'Talk to SportBrainHQ.',
  body: 'Found something wrong? Have an idea? Want to work together? Send it to the right place.',
};

export interface ContactReasonOption {
  value:
    | 'general'
    | 'correction'
    | 'content_feedback'
    | 'quiz_issue'
    | 'partnerships'
    | 'press'
    | 'feature_request'
    | 'technical_issue'
    | 'other';
  label: string;
  description: string;
}

/** Order here is the order shown in the reason selector. */
export const CONTACT_REASONS: ContactReasonOption[] = [
  { value: 'general', label: 'General', description: 'General questions about SportBrainHQ' },
  {
    value: 'correction',
    label: 'Correction',
    description: 'Report incorrect sports information',
  },
  {
    value: 'content_feedback',
    label: 'Content feedback',
    description: 'Feedback about an article, explainer or story',
  },
  {
    value: 'quiz_issue',
    label: 'Quiz issue',
    description: 'Report an incorrect question/answer',
  },
  {
    value: 'partnerships',
    label: 'Partnerships',
    description: 'Commercial/data/content partnerships',
  },
  { value: 'press', label: 'Press & media', description: 'Media enquiries' },
  {
    value: 'feature_request',
    label: 'Feature request',
    description: 'Suggest something SportBrainHQ should build',
  },
  {
    value: 'technical_issue',
    label: 'Technical issue',
    description: 'Report a website problem',
  },
  { value: 'other', label: 'Other', description: '' },
];

/** Which configured address (see `fetchContactConfig`) a category is best answered by. */
export const CATEGORY_EMAIL_KEY: Partial<
  Record<ContactReasonOption['value'], 'general' | 'corrections' | 'partnerships' | 'press'>
> = {
  correction: 'corrections',
  partnerships: 'partnerships',
  press: 'press',
};

export const DIRECT_EMAIL_LABELS: Record<
  'general' | 'corrections' | 'partnerships' | 'press',
  string
> = {
  general: 'General enquiries',
  corrections: 'Corrections',
  partnerships: 'Partnerships',
  press: 'Press & media',
};
