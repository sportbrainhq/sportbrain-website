import type { ExplainerSeed, ExplainerSectionSeed } from './explainer-types';

/**
 * Builders for the cricket library's shorter entries.
 *
 * The library has two kinds of page in it and they want different tools. A
 * concept like LBW or reverse swing earns a hand-written template with eight
 * sections. A concept like "gully" or "golden duck" needs three or four, and
 * writing those as full object literals four hundred times would bury the
 * content in punctuation and make an inconsistent heading order inevitable.
 *
 * So the long entries stay hand-written in `cricket-explainers.ts` and the
 * shorter ones are built here. What these helpers do **not** do is generate
 * prose: every string passed in is written by hand. They assemble the section
 * list, in a consistent order, from the parts a given kind of entry has.
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
  /** Extra sections, appended after the built ones. */
  extra?: ExplainerSectionSeed[];
}

function assemble(
  fields: CommonFields,
  type: ExplainerSeed['type'],
  sections: ExplainerSectionSeed[],
): ExplainerSeed {
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
    readMinutes: fields.readMinutes ?? Math.max(2, Math.ceil(sections.length / 2)),
    ruleSensitive: fields.ruleSensitive,
    sourceRevision: fields.sourceRevision,
    lastReviewedAt: fields.lastReviewedAt,
    isStartHere: fields.isStartHere,
    sections: [...sections.filter((section) => Boolean(section.body)), ...(fields.extra ?? [])],
  };
}

/**
 * A glossary entry.
 *
 * One sentence, an explanation, and optionally why it matters or what people get
 * wrong. The shape most of the terminology, equipment and scoring categories
 * want.
 */
export function definition(
  fields: CommonFields & {
    explanation: string;
    whyItMatters?: string;
    misunderstandings?: string;
    example?: string;
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

/** A prose concept: a phase of play, a piece of equipment, a condition. */
export function concept(
  fields: CommonFields & {
    explanation: string;
    howItWorks?: string;
    whyItMatters?: string;
    formatDifferences?: string;
    misunderstandings?: string;
    example?: string;
    takeaways?: string;
  },
): ExplainerSeed {
  return assemble(fields, 'standard', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'simple_explanation', body: fields.explanation },
    { type: 'how_it_works', body: fields.howItWorks },
    { type: 'example', body: fields.example },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'format_differences', body: fields.formatDifferences },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
    { type: 'key_takeaways', body: fields.takeaways },
  ]);
}

/** A Law of Cricket. Always rule-sensitive, so the metadata is required. */
export function law(
  fields: CommonFields & {
    sourceRevision: string;
    lastReviewedAt: string;
    theLaw: string;
    inPractice?: string;
    edgeCases?: string;
    edgeCasesHeading?: string;
    whyItMatters?: string;
    misunderstandings?: string;
    example?: string;
    takeaways?: string;
  },
): ExplainerSeed {
  return assemble({ ...fields, ruleSensitive: true }, 'rule', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'the_law', body: fields.theLaw },
    { type: 'in_practice', body: fields.inPractice },
    { type: 'example', body: fields.example },
    {
      type: 'edge_cases',
      heading: fields.edgeCasesHeading,
      body: fields.edgeCases,
    },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
    { type: 'key_takeaways', body: fields.takeaways },
  ]);
}

/** A way of getting out. */
export function dismissal(
  fields: CommonFields & {
    sourceRevision: string;
    lastReviewedAt: string;
    theLaw: string;
    sequence?: string;
    edgeCases?: string;
    edgeCasesHeading?: string;
    whenYouWillSeeIt?: string;
    misunderstandings?: string;
    takeaways?: string;
  },
): ExplainerSeed {
  return assemble({ ...fields, ruleSensitive: true }, 'dismissal', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'the_law', body: fields.theLaw },
    { type: 'decision_sequence', body: fields.sequence },
    {
      type: 'edge_cases',
      heading: fields.edgeCasesHeading,
      body: fields.edgeCases,
    },
    { type: 'when_you_will_see_it', body: fields.whenYouWillSeeIt },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
    { type: 'key_takeaways', body: fields.takeaways },
  ]);
}

/** A batting shot or technique. */
export function battingTechnique(
  fields: CommonFields & {
    explanation: string;
    footwork?: string;
    scoringArea?: string;
    scoringAreaData?: unknown;
    risk?: string;
    whenYouWillSeeIt?: string;
    commonMistakes?: string;
    takeaways?: string;
  },
): ExplainerSeed {
  return assemble(fields, 'batting_technique', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'simple_explanation', body: fields.explanation },
    { type: 'footwork_and_bat_path', body: fields.footwork },
    {
      type: 'scoring_area',
      body: fields.scoringArea,
      structuredData: fields.scoringAreaData,
    },
    { type: 'risk', body: fields.risk },
    { type: 'when_you_will_see_it', body: fields.whenYouWillSeeIt },
    { type: 'common_mistakes', body: fields.commonMistakes },
    { type: 'key_takeaways', body: fields.takeaways },
  ]);
}

/** A delivery: pace or spin. */
export function delivery(
  fields: CommonFields & {
    explanation: string;
    gripAndRelease?: string;
    batterExpects?: string;
    actuallyHappens?: string;
    whyEffective?: string;
    whenYouWillSeeIt?: string;
    counteredBy?: string;
    misunderstandings?: string;
    takeaways?: string;
  },
): ExplainerSeed {
  return assemble(fields, 'bowling_delivery', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'simple_explanation', body: fields.explanation },
    { type: 'grip_and_release', body: fields.gripAndRelease },
    { type: 'what_the_batter_expects', body: fields.batterExpects },
    { type: 'what_actually_happens', body: fields.actuallyHappens },
    { type: 'why_it_matters', heading: 'Why it is effective', body: fields.whyEffective },
    { type: 'when_you_will_see_it', body: fields.whenYouWillSeeIt },
    { type: 'how_batters_counter_it', body: fields.counteredBy },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
    { type: 'key_takeaways', body: fields.takeaways },
  ]);
}

/** A fielding position. The diagram payload is the point of the template. */
export function fieldPosition(
  fields: CommonFields & {
    purpose: string;
    location: string;
    locationData: unknown;
    whenUsed?: string;
    whoFieldsThere?: string;
    misunderstandings?: string;
    takeaways?: string;
  },
): ExplainerSeed {
  return assemble(fields, 'field_position', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'purpose', body: fields.purpose },
    {
      type: 'position_on_the_field',
      body: fields.location,
      structuredData: fields.locationData,
    },
    { type: 'when_it_is_used', body: fields.whenUsed },
    { type: 'player_profiles', heading: 'Who fields there', body: fields.whoFieldsThere },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
    { type: 'key_takeaways', body: fields.takeaways },
  ]);
}

/** A format or match classification. */
export function format(
  fields: CommonFields & {
    explanation: string;
    structure: string;
    resultTypes?: string;
    tactical?: string;
    whoPlaysIt?: string;
    misunderstandings?: string;
    takeaways?: string;
  },
): ExplainerSeed {
  return assemble(fields, 'format', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'simple_explanation', body: fields.explanation },
    { type: 'duration_and_structure', body: fields.structure },
    { type: 'result_types', body: fields.resultTypes },
    { type: 'tactical_application', body: fields.tactical },
    { type: 'who_plays_it', body: fields.whoPlaysIt },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
    { type: 'key_takeaways', body: fields.takeaways },
  ]);
}

/** A statistic. Formula and limitations are both mandatory by design. */
export function statistic(
  fields: CommonFields & {
    measures: string;
    calculation: string;
    interpret: string;
    limitations: string;
    formatContext?: string;
    example?: string;
    misunderstandings?: string;
    takeaways?: string;
  },
): ExplainerSeed {
  return assemble(fields, 'statistic', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'what_it_measures', body: fields.measures },
    { type: 'how_it_is_calculated', body: fields.calculation },
    { type: 'example', body: fields.example },
    { type: 'how_to_interpret', body: fields.interpret },
    { type: 'what_it_does_not_tell_you', body: fields.limitations },
    { type: 'format_differences', body: fields.formatContext },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
    { type: 'key_takeaways', body: fields.takeaways },
  ]);
}

/** A tactical idea. Never presented as a rule, hence the mandatory caveat slot. */
export function tactic(
  fields: CommonFields & {
    explanation: string;
    howItWorks?: string;
    tradeoffs: string;
    whenYouWillSeeIt?: string;
    formatDifferences?: string;
    misunderstandings?: string;
    takeaways?: string;
  },
): ExplainerSeed {
  return assemble(fields, 'tactical_concept', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'simple_explanation', body: fields.explanation },
    { type: 'how_it_works', body: fields.howItWorks },
    { type: 'tactical_application', heading: 'Trade-offs', body: fields.tradeoffs },
    { type: 'when_you_will_see_it', body: fields.whenYouWillSeeIt },
    { type: 'format_differences', body: fields.formatDifferences },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
    { type: 'key_takeaways', body: fields.takeaways },
  ]);
}

/** A player role. Roles are conventions, so the caveat slot is mandatory. */
export function role(
  fields: CommonFields & {
    explanation: string;
    responsibilities: string;
    variesBy: string;
    formatDifferences?: string;
    misunderstandings?: string;
    takeaways?: string;
  },
): ExplainerSeed {
  return assemble(fields, 'position_role', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'simple_explanation', body: fields.explanation },
    { type: 'responsibilities', body: fields.responsibilities },
    { type: 'variations', heading: 'How much it varies', body: fields.variesBy },
    { type: 'format_differences', body: fields.formatDifferences },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
    { type: 'key_takeaways', body: fields.takeaways },
  ]);
}

/** Officiating technology. Provider-versus-concept separation is mandatory. */
export function technology(
  fields: CommonFields & {
    sourceRevision: string;
    lastReviewedAt: string;
    explanation: string;
    howItWorks: string;
    limitations: string;
    availability: string;
    misunderstandings?: string;
    takeaways?: string;
  },
): ExplainerSeed {
  return assemble({ ...fields, ruleSensitive: true }, 'technology', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'simple_explanation', body: fields.explanation },
    { type: 'how_it_works', body: fields.howItWorks },
    {
      type: 'what_it_does_not_tell_you',
      heading: 'What it cannot establish',
      body: fields.limitations,
    },
    { type: 'format_differences', heading: 'Where it is used', body: fields.availability },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
    { type: 'key_takeaways', body: fields.takeaways },
  ]);
}
