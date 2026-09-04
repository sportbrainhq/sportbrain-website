import type { ExplainerSeed, ExplainerSectionSeed } from './explainer-types';

/**
 * Builders for the boxing library's shorter entries.
 *
 * Modelled directly on `golf-explainer-helpers.ts`: the long, hand-templated
 * Start Here entries stay hand-written in `boxing-explainers.ts` using
 * `standard`, and the shorter glossary-style entries are assembled here. These
 * helpers do not generate prose; every string passed in is written by hand.
 * They decide the section order and drop the sections a given entry has
 * nothing to say for.
 *
 * The section and type vocabulary is reused from MMA wherever the concept is
 * structurally the same kind of thing, rather than inventing near-duplicates:
 * a punch or a stance is `technique`/`position` with MMA's `the_technique` and
 * `recognition` sections; a way a fight ends is `fight_result`; a rule of the
 * sport (a count, a foul, a scoring rule) is `ruleset_concept`. `definition`
 * is used for the Terminology glossary, exactly as golf uses it for its
 * shortest entries.
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
 * The shape the Terminology A-Z entries want: what it is, what it means in
 * practice, and occasionally what people get wrong about it. Directly golf's
 * `definition` builder.
 */
export function definition(
  fields: CommonFields & {
    explanation: string;
    example?: string;
    whyItMatters?: string;
    misunderstandings?: string;
  },
): ExplainerSeed {
  return assemble(fields, 'definition', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'simple_explanation', body: fields.explanation },
    { type: 'example', body: fields.example },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/**
 * A punch or another named technique: a jab, a hook, a slip, a pivot.
 *
 * Reuses MMA's `technique` type and its `the_technique`/`recognition`
 * sections rather than inventing a boxing-specific pair: "how it is thrown"
 * and "how to recognise it happening" are the same two questions a punch and
 * a grappling technique both answer.
 */
export function technique(
  fields: CommonFields & {
    theTechnique: string;
    recognition?: string;
    whenUsed?: string;
    advantages?: string;
    risks?: string;
    misunderstandings?: string;
    diagram?: unknown;
  },
): ExplainerSeed {
  return assemble(fields, 'technique', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'the_technique', body: fields.theTechnique, structuredData: fields.diagram },
    { type: 'recognition', body: fields.recognition },
    { type: 'when_it_is_used', body: fields.whenUsed },
    { type: 'advantages', body: fields.advantages },
    { type: 'risks', body: fields.risks },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/**
 * A stance or body position: orthodox, southpaw, the guard, the clinch.
 *
 * MMA's `position` type. `recognition` carries what a viewer actually sees on
 * screen, which matters for a stance precisely because "orthodox" and
 * "southpaw" are mirror images and the visual cue is the whole explanation.
 */
export function position(
  fields: CommonFields & {
    thePosition: string;
    recognition?: string;
    whenUsed?: string;
    advantages?: string;
    risks?: string;
    misunderstandings?: string;
    diagram?: unknown;
  },
): ExplainerSeed {
  return assemble(fields, 'position', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'the_technique', body: fields.thePosition, structuredData: fields.diagram },
    { type: 'recognition', body: fields.recognition },
    { type: 'when_it_is_used', body: fields.whenUsed },
    { type: 'advantages', body: fields.advantages },
    { type: 'risks', body: fields.risks },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/**
 * A rule of boxing: the count, a foul, the three-knockdown rule.
 *
 * MMA's `ruleset_concept` type. `dangerAndStoppage` reuses MMA's own section
 * for exactly the reason MMA has it: what happens when this rule intersects
 * with a fighter's safety is the part of a combat-sport rule a reader most
 * needs spelled out, distinct from the mechanical procedure.
 */
export function rule(
  fields: CommonFields & {
    theRule: string;
    inPractice?: string;
    dangerAndStoppage?: string;
    formatDifferences?: string;
    misunderstandings?: string;
    diagram?: unknown;
  },
): ExplainerSeed {
  return assemble(fields, 'ruleset_concept', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'the_law', body: fields.theRule, structuredData: fields.diagram },
    { type: 'danger_and_stoppage', body: fields.dangerAndStoppage },
    { type: 'in_practice', body: fields.inPractice },
    { type: 'format_differences', body: fields.formatDifferences },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/**
 * A way a fight ends: KO, TKO, a decision, a draw, a disqualification.
 *
 * MMA's `fight_result` type. `dangerAndStoppage` is mandatory in spirit
 * (though not enforced by the type system) for anything involving a stoppage
 * on safety grounds, and `howItIsScored` carries the judging-adjacent results
 * (decision, split decision) that a fight_result entry needs but a pure rule
 * entry does not.
 */
export function fightResult(
  fields: CommonFields & {
    theResult: string;
    howItIsScored?: string;
    dangerAndStoppage?: string;
    misunderstandings?: string;
    example?: string;
  },
): ExplainerSeed {
  return assemble(fields, 'fight_result', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'the_law', body: fields.theResult },
    { type: 'how_it_is_calculated', body: fields.howItIsScored },
    { type: 'example', body: fields.example },
    { type: 'danger_and_stoppage', body: fields.dangerAndStoppage },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/**
 * A judging or scoring concept: the ten-point must system, effective
 * aggression, a 10-9 round.
 *
 * `ruleset_concept` again, since scoring in boxing is a rule judges apply
 * rather than a computed statistic, but with `how_it_is_calculated` and
 * `how_to_interpret` in place of the danger-and-stoppage pairing, since a
 * scoring entry's reader wants the arithmetic and how to read a card, not a
 * safety consequence.
 */
export function judgingConcept(
  fields: CommonFields & {
    howItWorks: string;
    example?: string;
    howToInterpret?: string;
    misunderstandings?: string;
    scorecard?: unknown;
  },
): ExplainerSeed {
  return assemble(fields, 'ruleset_concept', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'the_law', body: fields.howItWorks, structuredData: fields.scorecard },
    { type: 'example', body: fields.example },
    { type: 'how_to_interpret', body: fields.howToInterpret },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/** Everything else: a general explanation with the standard section set. */
export function standard(
  fields: CommonFields & {
    explanation: string;
    howItWorks?: string;
    example?: string;
    whyItMatters?: string;
    strategy?: string;
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
    { type: 'strategic_implications', body: fields.strategy },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
    { type: 'key_takeaways', body: fields.takeaways },
  ]);
}
