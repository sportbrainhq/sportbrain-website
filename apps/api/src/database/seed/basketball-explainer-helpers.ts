import type { ExplainerSeed, ExplainerSectionSeed } from './explainer-types';

/**
 * Builders for the basketball library's shorter entries.
 *
 * The library has two kinds of page and they want different tools. A concept
 * like the pick and roll or true shooting percentage earns a hand-written
 * template with a diagram and six sections. A concept like "airball", "the
 * elbow" or "player option" needs three or four, and writing those as full
 * object literals two hundred times would bury the content in punctuation and
 * make an inconsistent heading order inevitable.
 *
 * The long entries stay hand-written in `basketball-explainers.ts`; the shorter
 * ones are assembled here. What these helpers do **not** do is generate prose.
 * Every string passed in is written by hand. They decide the section order and
 * drop the sections a given entry has nothing to say for, which is the part
 * that is genuinely mechanical.
 *
 * Modelled directly on `cricket-explainer-helpers.ts`. The two are separate
 * files because the section vocabulary differs: cricket entries carry
 * `format_differences` and a decision sequence, basketball entries carry
 * `rule_differences` and how an action is defended.
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
 * A glossary entry or short definition.
 *
 * The shape most of the slang, the shot types and the contract terminology
 * want: what it is, what it means in practice, and occasionally what people get
 * wrong about it.
 */
export function definition(
  fields: CommonFields & {
    explanation: string;
    example?: string;
    whyItMatters?: string;
    misunderstandings?: string;
    ruleDifferences?: string;
  },
): ExplainerSeed {
  return assemble(fields, 'definition', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'simple_explanation', body: fields.explanation },
    { type: 'example', body: fields.example },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'rule_differences', body: fields.ruleDifferences },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/**
 * A region of the floor.
 *
 * `whereItHappens` describes the location; everything else says why that patch
 * of floor is worth naming. A court area with no tactical consequence would not
 * need an explainer at all.
 */
export function courtArea(
  fields: CommonFields & {
    whereItIs: string;
    whyItMatters?: string;
    ruleDifferences?: string;
    misunderstandings?: string;
  },
): ExplainerSeed {
  return assemble(fields, 'court_area', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'where_it_happens', body: fields.whereItIs },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'rule_differences', body: fields.ruleDifferences },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/**
 * A violation or a foul.
 *
 * `ruleDifferences` is prominent by design: how a call is judged is exactly
 * where the NBA, FIBA and the NCAA diverge, and an officiating page that
 * describes only one competition is the failure mode this library exists to
 * avoid.
 */
export function officiating(
  fields: CommonFields & {
    howItWorks: string;
    whyItMatters?: string;
    ruleDifferences?: string;
    misunderstandings?: string;
  },
): ExplainerSeed {
  return assemble(fields, 'officiating', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'how_it_works', body: fields.howItWorks },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'rule_differences', body: fields.ruleDifferences },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/** A rule of the game that is not a foul: the clock, restarts, substitutions. */
export function rule(
  fields: CommonFields & {
    howItWorks: string;
    whyItMatters?: string;
    ruleDifferences?: string;
    misunderstandings?: string;
  },
): ExplainerSeed {
  return assemble(fields, 'rule', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'how_it_works', body: fields.howItWorks },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'rule_differences', body: fields.ruleDifferences },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/** A designed offensive or defensive action. */
export function play(
  fields: CommonFields & {
    theAction: string;
    whyItMatters?: string;
    howItIsDefended?: string;
    variations?: string;
    diagram?: unknown;
  },
): ExplainerSeed {
  return assemble(fields, 'play', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'the_action', body: fields.theAction, structuredData: fields.diagram },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'how_it_is_defended', body: fields.howItIsDefended },
    { type: 'variations', body: fields.variations },
  ]);
}

/** A tactical idea: a scheme, a coverage, a principle. */
export function tactic(
  fields: CommonFields & {
    howItWorks: string;
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
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'counters', body: fields.counters },
    { type: 'variations', body: fields.variations },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/**
 * A metric.
 *
 * The section order is the one the brief asks for: what it is, why it exists,
 * how it is computed, a worked example, how to read it, and what it misses. The
 * last is not optional in practice: a statistic page that lists no limitations
 * is how a reader ends up quoting PER as though it settled an argument.
 */
export function statistic(
  fields: CommonFields & {
    measures: string;
    formula?: string;
    example?: string;
    interpret?: string;
    limitations?: string;
    ruleDifferences?: string;
  },
): ExplainerSeed {
  return assemble(fields, 'statistic', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'what_it_measures', body: fields.measures },
    { type: 'how_it_is_calculated', body: fields.formula },
    { type: 'example', body: fields.example },
    { type: 'how_to_interpret', body: fields.interpret },
    { type: 'rule_differences', body: fields.ruleDifferences },
    { type: 'what_it_does_not_tell_you', body: fields.limitations },
  ]);
}

/** A competition, a season structure or a league mechanism. */
export function format(
  fields: CommonFields & {
    howItWorks: string;
    whyItMatters?: string;
    ruleDifferences?: string;
    misunderstandings?: string;
  },
): ExplainerSeed {
  return assemble(fields, 'format', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'how_it_works', body: fields.howItWorks },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'rule_differences', body: fields.ruleDifferences },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/** A position or a player role. */
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
