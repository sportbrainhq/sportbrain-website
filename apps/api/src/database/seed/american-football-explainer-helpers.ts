import type { ExplainerSeed, ExplainerSectionSeed } from './explainer-types';

/**
 * Builders for the American football library's entries.
 *
 * Modelled directly on `basketball-explainer-helpers.ts` and
 * `golf-explainer-helpers.ts`. American football reuses the generic section
 * vocabulary those two sports already established (`how_it_works`,
 * `why_it_matters`, `common_misunderstandings`, `responsibilities`,
 * `player_profiles`, `what_it_measures`, and so on) rather than adding new
 * section types: a down, a route and a coverage shell are each already well
 * served by `standard`, `rule`, `tactical_concept`, `position_role` and
 * `statistic`, and inventing football-only section names would fragment the
 * schema for no reader-visible benefit.
 *
 * What these helpers do **not** do is generate prose. Every string passed in
 * is written by hand; the helpers only decide section order and drop the
 * sections a given entry has nothing to say for.
 */

interface CommonFields {
  slug: string;
  title: string;
  subtitle?: string;
  category: string;
  alsoIn?: string[];
  aliases?: string[];
  difficulty?: ExplainerSeed['difficulty'];
  /** One line, used for the card, the search result and the meta description. */
  summary: string;
  /** The "in one sentence" body. Falls back to `summary`. */
  oneSentence?: string;
  related?: ExplainerSeed['related'];
  sourceKeys?: ExplainerSeed['sourceKeys'];
  order?: number;
  readMinutes?: number;
  ruleSensitive?: boolean;
  sourceRevision?: string;
  lastReviewedAt?: string;
  isStartHere?: boolean;
  isFeatured?: boolean;
  /** Extra sections, appended after the built ones. */
  extra?: ExplainerSectionSeed[];
}

function assemble(
  fields: CommonFields,
  type: ExplainerSeed['type'],
  sections: ExplainerSectionSeed[],
): ExplainerSeed {
  const built = [
    ...sections.filter((section) => Boolean(section.body ?? section.structuredData)),
    ...(fields.extra ?? []),
  ];

  return {
    slug: fields.slug,
    title: fields.title,
    subtitle: fields.subtitle,
    shortDescription: fields.summary,
    type,
    difficulty: fields.difficulty ?? 'beginner',
    category: fields.category,
    alsoIn: fields.alsoIn,
    aliases: fields.aliases,
    related: fields.related,
    sourceKeys: fields.sourceKeys,
    order: fields.order,
    readMinutes: fields.readMinutes ?? Math.max(2, Math.ceil(built.length / 2)),
    ruleSensitive: fields.ruleSensitive,
    sourceRevision: fields.sourceRevision,
    lastReviewedAt: fields.lastReviewedAt,
    isStartHere: fields.isStartHere,
    isFeatured: fields.isFeatured,
    sections: built,
  };
}

/**
 * The general-purpose template: simple explanation, how it works, a concrete
 * game scenario, why it matters, common misconceptions.
 *
 * Used for the Start Here spine and most of Downs & Yards, where a beginner
 * wants a definition followed immediately by a worked situation rather than a
 * rule citation.
 */
export function standard(
  fields: CommonFields & {
    explanation: string;
    howItWorks?: string;
    example?: string;
    whyItMatters?: string;
    misunderstandings?: string;
    takeaways?: string;
    diagram?: unknown;
  },
): ExplainerSeed {
  return assemble(fields, 'standard', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'simple_explanation', body: fields.explanation },
    { type: 'how_it_works', body: fields.howItWorks, structuredData: fields.diagram },
    { type: 'example', body: fields.example },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
    { type: 'key_takeaways', body: fields.takeaways },
  ]);
}

/** A short glossary-style definition: what it is, an example, why it matters. */
export function definition(
  fields: CommonFields & {
    explanation: string;
    howItWorks?: string;
    example?: string;
    whyItMatters?: string;
    misunderstandings?: string;
  },
): ExplainerSeed {
  return assemble(fields, 'definition', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'simple_explanation', body: fields.explanation },
    { type: 'how_it_works', body: fields.howItWorks },
    { type: 'example', body: fields.example },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/**
 * A rule of the game: a penalty, a scoring rule, a down-and-distance
 * mechanic. Sourced from the NFL Rulebook, never from memory, and carries
 * `ruleSensitive` so the audit query can find it after a rules change.
 */
export function rule(
  fields: CommonFields & {
    howItWorks: string;
    inPractice?: string;
    example?: string;
    whyItMatters?: string;
    misunderstandings?: string;
  },
): ExplainerSeed {
  return assemble(fields, 'rule', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'how_it_works', body: fields.howItWorks },
    { type: 'example', body: fields.example },
    { type: 'in_practice', body: fields.inPractice },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/** A position: what the player does, who plays it, why the role matters. */
export function positionRole(
  fields: CommonFields & {
    responsibilities: string;
    profile?: string;
    whyItMatters?: string;
    variations?: string;
    misunderstandings?: string;
  },
): ExplainerSeed {
  return assemble(fields, 'position_role', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'responsibilities', body: fields.responsibilities },
    { type: 'player_profiles', body: fields.profile },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'variations', body: fields.variations },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/** A scheme, concept or tactical idea: a coverage shell, a blitz package, a route concept. */
export function tactic(
  fields: CommonFields & {
    howItWorks: string;
    example?: string;
    whyItMatters?: string;
    counters?: string;
    variations?: string;
    misunderstandings?: string;
    diagram?: unknown;
  },
): ExplainerSeed {
  return assemble(fields, 'tactical_concept', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'how_it_works', body: fields.howItWorks, structuredData: fields.diagram },
    { type: 'example', body: fields.example },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'counters', body: fields.counters },
    { type: 'variations', body: fields.variations },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/**
 * A metric: an official NFL stat, a provider-specific number (CPOE, ADOT), or
 * a derived analytics model (EPA, win probability). `isDerived` appends the
 * standard disclosure so a reader never mistakes a model's output for a
 * league-published figure.
 */
export function statistic(
  fields: CommonFields & {
    measures: string;
    formula?: string;
    example?: string;
    interpret?: string;
    limitations?: string;
    isDerived?: boolean;
  },
): ExplainerSeed {
  return assemble(fields, 'statistic', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'what_it_measures', body: fields.measures },
    { type: 'how_it_is_calculated', body: fields.formula },
    { type: 'example', body: fields.example },
    { type: 'how_to_interpret', body: fields.interpret },
    {
      type: 'what_it_does_not_tell_you',
      body: fields.isDerived
        ? `${fields.limitations ?? ''}\n\n**This is a derived analytics metric, not an official NFL statistic.** No league office publishes it as a record; it is a model built on top of play-by-play data, and different analytics providers build it slightly differently. Treat a specific figure quoted for it as one provider's estimate rather than as league data.`.trim()
        : fields.limitations,
    },
  ]);
}

/** A competition structure: the regular season, the playoff bracket, the draft. */
export function format(
  fields: CommonFields & {
    howItWorks: string;
    example?: string;
    whyItMatters?: string;
    misunderstandings?: string;
  },
): ExplainerSeed {
  return assemble(fields, 'format', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'how_it_works', body: fields.howItWorks },
    { type: 'example', body: fields.example },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}
