import type { ExplainerSeed, ExplainerSectionSeed } from './explainer-types';

/**
 * Builders for the MMA library's entries.
 *
 * Modelled directly on `golf-explainer-helpers.ts`. The brief's own template
 * (title, one-sentence explanation, difficulty, reading time, diagram,
 * real-fight scenario, detailed explanation, common misunderstanding, related
 * concepts) maps onto a fixed section order per explainer type, the same way
 * golf's shot and swing-element templates do, so a builder's job is choosing
 * that order and dropping the sections a given entry has nothing to say for.
 *
 * No prose is generated here. Every string passed in is written by hand.
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
    isStartHere: fields.isStartHere,
    isFeatured: fields.isFeatured,
    sections: built,
  };
}

/**
 * A general explanation with the standard section set.
 *
 * The Category 1 (Start Here) shape: what it is, how it works, a real-fight
 * scenario, why it matters, the misunderstanding it exists to correct, and
 * the takeaways a reader carries into the next page.
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

/**
 * A ruleset concept: scoring, judging, fouls, event structure.
 *
 * `recognition` (what a viewer sees) comes before `simple_explanation` (the
 * mechanics) for the same reason golf's `courseFeature` puts location first:
 * a reader watching a fight live wants to know what they are looking at
 * before they want the underlying machinery explained.
 */
export function rulesetConcept(
  fields: CommonFields & {
    recognition?: string;
    explanation: string;
    example?: string;
    whyItMatters?: string;
    misunderstandings?: string;
    diagram?: unknown;
  },
): ExplainerSeed {
  return assemble(fields, 'ruleset_concept', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'recognition', body: fields.recognition },
    { type: 'simple_explanation', body: fields.explanation, structuredData: fields.diagram },
    { type: 'example', body: fields.example },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/**
 * A way a fight ends: KO, TKO, decision and the rest.
 *
 * `dangerAndStoppage` covers the stoppage criterion, the referee's judgment
 * or the doctor's call that a rule of football or a shot in tennis has no
 * equivalent of, kept apart from the mechanical description so each is its
 * own paragraph.
 */
export function fightResult(
  fields: CommonFields & {
    recognition?: string;
    explanation: string;
    dangerAndStoppage?: string;
    example?: string;
    misunderstandings?: string;
  },
): ExplainerSeed {
  return assemble(fields, 'fight_result', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'recognition', body: fields.recognition },
    { type: 'simple_explanation', body: fields.explanation },
    { type: 'danger_and_stoppage', body: fields.dangerAndStoppage },
    { type: 'example', body: fields.example },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/**
 * A strike, takedown or submission.
 *
 * Not used by Phase 1 (Start Here, Ways to Win, Scoring), but built now so
 * Categories 4, 6 and 9 are pure content when their turn comes: `recognition`
 * for what a viewer sees, `the_technique` for the mechanics, `when_used` and
 * `risks` for the brief's "when used" and "risks" fields, `counters` for
 * common defensive responses, and `danger_and_stoppage` for submissions
 * specifically, where a technique ends the fight rather than merely scoring.
 */
export function technique(
  fields: CommonFields & {
    recognition?: string;
    theTechnique: string;
    whenUsed?: string;
    risks?: string;
    counters?: string;
    dangerAndStoppage?: string;
    example?: string;
    misunderstandings?: string;
    diagram?: unknown;
  },
): ExplainerSeed {
  return assemble(fields, 'technique', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'recognition', body: fields.recognition },
    { type: 'the_technique', body: fields.theTechnique, structuredData: fields.diagram },
    { type: 'when_it_is_used', body: fields.whenUsed },
    { type: 'risks', body: fields.risks },
    { type: 'counters', body: fields.counters },
    { type: 'danger_and_stoppage', body: fields.dangerAndStoppage },
    { type: 'example', body: fields.example },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/**
 * A ground or clinch position.
 *
 * Not used by Phase 1; built now for Categories 7 and 8. `diagram` is where a
 * `MatShape` payload rides, following golf's `courseFeature`/`shot` pattern
 * of attaching structured data to the section that introduces the concept
 * visually.
 */
export function position(
  fields: CommonFields & {
    recognition?: string;
    explanation: string;
    howToEscape?: string;
    misunderstandings?: string;
    diagram?: unknown;
  },
): ExplainerSeed {
  return assemble(fields, 'position', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'recognition', body: fields.recognition },
    { type: 'simple_explanation', body: fields.explanation, structuredData: fields.diagram },
    { type: 'counters', body: fields.howToEscape },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/** A promotion: UFC, PFL, ONE Championship and the rest. */
export function promotion(
  fields: CommonFields & {
    explanation: string;
    howItWorks?: string;
    whyItMatters?: string;
    misunderstandings?: string;
  },
): ExplainerSeed {
  return assemble(fields, 'promotion', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'simple_explanation', body: fields.explanation },
    { type: 'how_it_works', body: fields.howItWorks },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/**
 * A metric: a fighter statistic or an analytics concept.
 *
 * The section order the brief asks for in Categories 24-25: what it measures,
 * how it is computed, a worked example or real-fight illustration, how to
 * read it, and what it misses. `isDerived` mirrors golf's statistic builder:
 * several of the sport's most quoted "advanced" numbers (strike differential,
 * opponent quality, win probability) are not official promotion statistics
 * but analyst-built models, and the brief itself asks these be distinguished
 * from official numbers.
 */
export function statistic(
  fields: CommonFields & {
    measures: string;
    formula?: string;
    example?: string;
    interpret?: string;
    limitations?: string;
    isDerived?: boolean;
    isOfficial?: boolean;
    table?: unknown;
  },
): ExplainerSeed {
  return assemble(fields, 'statistic', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'what_it_measures', body: fields.measures },
    { type: 'how_it_is_calculated', body: fields.formula },
    { type: 'example', body: fields.example, structuredData: fields.table },
    { type: 'how_to_interpret', body: fields.interpret },
    {
      type: 'what_it_does_not_tell_you',
      body: fields.isDerived
        ? `${fields.limitations ?? ''}\n\n**This is a derived, SportBrainHQ-style metric, not an official promotion statistic.** No promotion publishes it directly; it is built on top of published round-by-round or strike data, and different analysts and sites can build it differently. Treat a figure quoted for it as one analyst's estimate rather than an official record.`.trim()
        : fields.isOfficial
          ? `${fields.limitations ?? ''}\n\n**This is an official promotion statistic**, tracked and published by the promotion's own statistics provider (or a licensed third party), rather than a third-party analyst's derived figure.`.trim()
          : fields.limitations,
    },
  ]);
}

/**
 * A glossary entry or short definition.
 *
 * The shape the A-Z glossary (Category 30) will use: what it is, an example,
 * and occasionally what people get wrong about it.
 */
export function definition(
  fields: CommonFields & {
    explanation: string;
    example?: string;
    misunderstandings?: string;
  },
): ExplainerSeed {
  return assemble(fields, 'definition', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'simple_explanation', body: fields.explanation },
    { type: 'example', body: fields.example },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}
