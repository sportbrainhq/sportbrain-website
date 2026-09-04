import type { ExplainerSeed, ExplainerSectionSeed } from './explainer-types';

/**
 * Builders for the golf library's shorter entries.
 *
 * The library has two kinds of page and they want different tools. A concept
 * like strokes gained, the World Handicap System or stroke-and-distance earns a
 * hand-written template with a worked example and eight sections. A concept like
 * "fringe", "waggle" or "tailwind" needs three or four, and writing four hundred
 * of those as full object literals would bury the content in punctuation and
 * make an inconsistent heading order inevitable.
 *
 * The long entries stay hand-written in `golf-explainers.ts`; the shorter ones
 * are assembled here. What these helpers do **not** do is generate prose. Every
 * string passed in is written by hand. They decide the section order and drop
 * the sections a given entry has nothing to say for, which is the part that is
 * genuinely mechanical.
 *
 * Modelled on `basketball-explainer-helpers.ts`, with a different section
 * vocabulary: golf entries carry `format_differences` (stroke play against
 * match play) where basketball entries carry `rule_differences`, and the shot
 * and club templates have no basketball analogue.
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
 * The shape most of the slang and the shorter terms want: what it is, what it
 * means in practice, and occasionally what people get wrong about it.
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
 * A scoring term: par, birdie, bogey and the rest.
 *
 * Its own builder rather than a `definition` because these are the library's
 * highest-traffic pages and they all want the same four things in the same
 * order: the number, an example on a real hole, how it appears on a
 * leaderboard, and the confusion that sends people here in the first place.
 */
export function scoringTerm(
  fields: CommonFields & {
    explanation: string;
    example?: string;
    onTheLeaderboard?: string;
    whyItMatters?: string;
    misunderstandings?: string;
    scorecard?: unknown;
  },
): ExplainerSeed {
  return assemble(fields, 'scoring_term', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'simple_explanation', body: fields.explanation },
    { type: 'example', body: fields.example, structuredData: fields.scorecard },
    { type: 'how_to_read_it', body: fields.onTheLeaderboard },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/**
 * A part of the course, or a kind of hole.
 *
 * `whereItIs` comes first because a beginner reading about a fringe does not
 * yet know where to look. The diagram rides on that section, so the drawing and
 * the sentence describing it are never separated.
 */
export function courseFeature(
  fields: CommonFields & {
    whereItIs: string;
    howItPlays?: string;
    strategy?: string;
    whyItMatters?: string;
    misunderstandings?: string;
    diagram?: unknown;
  },
): ExplainerSeed {
  return assemble(fields, 'hole', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'on_the_course', body: fields.whereItIs, structuredData: fields.diagram },
    { type: 'how_it_works', body: fields.howItPlays },
    { type: 'strategic_implications', body: fields.strategy },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/**
 * A club, or a property of one.
 *
 * `whenYouUseIt` is separate from `howItWorks` because the two answer different
 * questions and a beginner only wants the first. Somebody reading about a
 * hybrid wants to know when to pull it out of the bag; the centre of gravity
 * argument is why, and belongs underneath.
 */
export function club(
  fields: CommonFields & {
    whatItIs: string;
    whenYouUseIt?: string;
    howItWorks?: string;
    misunderstandings?: string;
  },
): ExplainerSeed {
  return assemble(fields, 'club', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'simple_explanation', body: fields.whatItIs },
    { type: 'club_selection', body: fields.whenYouUseIt },
    { type: 'how_it_works', body: fields.howItWorks },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/** A piece of equipment that is not a club: the ball, a glove, a yardage book. */
export function equipment(
  fields: CommonFields & {
    whatItIs: string;
    howItWorks?: string;
    whyItMatters?: string;
    misunderstandings?: string;
  },
): ExplainerSeed {
  return assemble(fields, 'equipment', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'simple_explanation', body: fields.whatItIs },
    { type: 'how_it_works', body: fields.howItWorks },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/**
 * A shot.
 *
 * Directly the tennis shot template, because the question is the same one: what
 * the shot is, when a player chooses it, what it wins and what it costs. The
 * `risks` section is not decorative in golf: a flop shot played badly is a
 * worse result than the safe shot played badly, and a page that lists only the
 * upside is teaching a beginner to lose strokes.
 */
export function shot(
  fields: CommonFields & {
    theShot: string;
    whenUsed?: string;
    technique?: string;
    advantages?: string;
    risks?: string;
    misunderstandings?: string;
    diagram?: unknown;
  },
): ExplainerSeed {
  return assemble(fields, 'shot', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'the_shot', body: fields.theShot, structuredData: fields.diagram },
    { type: 'when_players_use_it', body: fields.whenUsed },
    { type: 'the_swing', body: fields.technique },
    { type: 'advantages', body: fields.advantages },
    { type: 'risks', body: fields.risks },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/**
 * A phase of the swing, or a measurement of it.
 *
 * `commonMistakes` is inherited from cricket's batting template and does the
 * same job here. It is also why this builder deliberately does not carry a
 * "correct technique" section: the brief asks for technique to be informational
 * rather than prescriptive, and a section called "what to do" would invite
 * exactly the one-method-fits-all writing it rules out.
 */
export function swingElement(
  fields: CommonFields & {
    theSwing: string;
    whyItMatters?: string;
    variations?: string;
    commonMistakes?: string;
    misunderstandings?: string;
    diagram?: unknown;
  },
): ExplainerSeed {
  return assemble(fields, 'swing_element', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'the_swing', body: fields.theSwing, structuredData: fields.diagram },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'variations', body: fields.variations },
    { type: 'common_mistakes', body: fields.commonMistakes },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/**
 * A rule of golf.
 *
 * `penaltyAndRelief` is the section a reader consulting this mid-round actually
 * wants, so it sits directly under the rule itself rather than at the bottom.
 * Everything built by this helper should carry `ruleSensitive` and a
 * `sourceRevision`, so the set to re-audit after a Rules revision is a query
 * rather than a reading of every article.
 */
export function rule(
  fields: CommonFields & {
    theRule: string;
    inPractice?: string;
    penaltyAndRelief?: string;
    procedure?: string;
    formatDifferences?: string;
    misunderstandings?: string;
    diagram?: unknown;
  },
): ExplainerSeed {
  return assemble(fields, 'rule', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'the_law', body: fields.theRule },
    { type: 'penalty_and_relief', body: fields.penaltyAndRelief },
    { type: 'the_procedure', body: fields.procedure, structuredData: fields.diagram },
    { type: 'in_practice', body: fields.inPractice },
    { type: 'format_differences', body: fields.formatDifferences },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/** A penalty: what it costs, and what you do next. */
export function penalty(
  fields: CommonFields & {
    theRule: string;
    penaltyAndRelief: string;
    procedure?: string;
    formatDifferences?: string;
    misunderstandings?: string;
    diagram?: unknown;
  },
): ExplainerSeed {
  return assemble(fields, 'penalty', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'the_law', body: fields.theRule },
    { type: 'penalty_and_relief', body: fields.penaltyAndRelief },
    { type: 'the_procedure', body: fields.procedure, structuredData: fields.diagram },
    { type: 'format_differences', body: fields.formatDifferences },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/**
 * A handicap concept.
 *
 * The one template where the worked example is mandatory rather than optional.
 * The brief asks for worked examples in this category by name, and for good
 * reason: every handicap concept is a piece of arithmetic, and prose describing
 * arithmetic is how a reader ends up believing their Handicap Index is the
 * number of shots they get.
 */
export function handicapConcept(
  fields: CommonFields & {
    whatItIs: string;
    formula?: string;
    workedExample?: string;
    interpret?: string;
    limitations?: string;
    misunderstandings?: string;
    scorecard?: unknown;
  },
): ExplainerSeed {
  return assemble(fields, 'handicap_concept', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'what_it_measures', body: fields.whatItIs },
    { type: 'how_it_is_calculated', body: fields.formula },
    { type: 'worked_example', body: fields.workedExample, structuredData: fields.scorecard },
    { type: 'how_to_interpret', body: fields.interpret },
    { type: 'what_it_does_not_tell_you', body: fields.limitations },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/**
 * A metric.
 *
 * The section order the brief asks for: what it measures, how it is computed, a
 * worked example, how to read it, and what it misses. The last is not optional
 * in practice. Several of the numbers in golf's statistics category are
 * considerably weaker than their confident single values suggest, and a page
 * that lists no limitations is how a reader ends up settling an argument with
 * putts per round.
 */
export function statistic(
  fields: CommonFields & {
    measures: string;
    formula?: string;
    example?: string;
    interpret?: string;
    limitations?: string;
    isDerived?: boolean;
    table?: unknown;
  },
): ExplainerSeed {
  return assemble(fields, 'statistic', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'what_it_measures', body: fields.measures },
    { type: 'how_it_is_calculated', body: fields.formula },
    { type: 'worked_example', body: fields.example, structuredData: fields.table },
    { type: 'how_to_interpret', body: fields.interpret },
    {
      type: 'what_it_does_not_tell_you',
      body: fields.isDerived
        ? `${fields.limitations ?? ''}\n\n**This is a derived metric, not an official statistic.** No governing body or tour publishes it; it is a model built on top of published shot data, and different analysts build it differently. Treat a figure quoted for it as one analyst's estimate rather than as a record.`.trim()
        : fields.limitations,
    },
  ]);
}

/** A competition structure, a scoring format or a team format. */
export function format(
  fields: CommonFields & {
    howItWorks: string;
    whyItMatters?: string;
    formatDifferences?: string;
    strategy?: string;
    misunderstandings?: string;
    scorecard?: unknown;
  },
): ExplainerSeed {
  return assemble(fields, 'format', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'how_it_works', body: fields.howItWorks, structuredData: fields.scorecard },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'strategic_implications', body: fields.strategy },
    { type: 'format_differences', body: fields.formatDifferences },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/** A course-management or shot-selection idea. */
export function strategy(
  fields: CommonFields & {
    howItWorks: string;
    whenToUseIt?: string;
    advantages?: string;
    risks?: string;
    misunderstandings?: string;
    diagram?: unknown;
  },
): ExplainerSeed {
  return assemble(fields, 'strategy_concept', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'how_it_works', body: fields.howItWorks, structuredData: fields.diagram },
    { type: 'when_it_is_used', body: fields.whenToUseIt },
    { type: 'advantages', body: fields.advantages },
    { type: 'risks', body: fields.risks },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/** A ranking system or a points mechanism. */
export function rankingConcept(
  fields: CommonFields & {
    howItWorks: string;
    formula?: string;
    whyItMatters?: string;
    limitations?: string;
    misunderstandings?: string;
  },
): ExplainerSeed {
  return assemble(fields, 'ranking_concept', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'how_it_works', body: fields.howItWorks },
    { type: 'how_it_is_calculated', body: fields.formula },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'what_it_does_not_tell_you', body: fields.limitations },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/** A conducted sequence: a tee time, a drop, a shotgun start, a playoff. */
export function procedure(
  fields: CommonFields & {
    theProcedure: string;
    whyItMatters?: string;
    formatDifferences?: string;
    misunderstandings?: string;
    diagram?: unknown;
  },
): ExplainerSeed {
  return assemble(fields, 'procedure', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'the_procedure', body: fields.theProcedure, structuredData: fields.diagram },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'format_differences', body: fields.formatDifferences },
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
