import type { ExplainerSeed, ExplainerSectionSeed } from './explainer-types';

/**
 * Builders for the Formula 1 library.
 *
 * Same reasoning as the cricket, basketball and tennis helpers: the library has
 * two kinds of page and they want different tools. "What is an undercut" earns
 * a hand-written template with a strategy chart and eight sections. "What is a
 * backmarker" needs four, and writing four hundred of those as full object
 * literals would bury the content in punctuation and make an inconsistent
 * heading order inevitable.
 *
 * These do not generate prose. Every string passed in is written by hand. They
 * decide section order and drop the sections an entry has nothing to say for,
 * which is the part that is genuinely mechanical.
 *
 * ## Why F1 needs its own file
 *
 * The section vocabulary differs, and in one respect the whole library does.
 * Every other sport's divergence problem is between competitions played at the
 * same time: the NBA and FIBA, the ATP and the WTA, Tests and T20s. Formula 1
 * has one competition, and its divergence is across *time*. The points system,
 * the power unit, the aerodynamic regulations and the tyre allocation have each
 * been rewritten repeatedly, so the question a reader needs answered is not
 * "which league" but "which season".
 *
 * That is why `era` is a first-class field on every template here rather than
 * an optional extra section. The brief asks for it three separate times, for
 * points, for technical content and for regulations, and a field that has to be
 * remembered is a field that will be forgotten on the twentieth entry.
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
  /**
   * Which season or regulation era this describes.
   *
   * Rendered on the page, not just stored for an audit. An explainer about
   * energy recovery that does not say it means the current hybrid formula is
   * wrong about every car built before 2014 without ever admitting it.
   */
  era?: string;
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
    // The era note goes last on the page for the same reason a footnote does:
    // it qualifies what was just read rather than delaying it.
    ...(fields.era ? [{ type: 'regulation_era' as const, body: fields.era }] : []),
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
 * What the terminology category and most of the one-line concepts want: what it
 * is, what it means in practice, and where a reader trips over it.
 */
export function definition(
  fields: CommonFields & {
    explanation: string;
    example?: string;
    whyItMatters?: string;
    misunderstandings?: string;
    diagram?: unknown;
  },
): ExplainerSeed {
  return assemble(fields, 'definition', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'simple_explanation', body: fields.explanation, structuredData: fields.diagram },
    { type: 'example', body: fields.example },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/**
 * A sporting or technical regulation.
 *
 * `era` is effectively mandatory on this template. Nothing in the F1 rulebook
 * is permanent, and a rule explainer that does not date itself is the single
 * most likely page in the library to become quietly wrong.
 */
export function rule(
  fields: CommonFields & {
    howItWorks: string;
    example?: string;
    whyItMatters?: string;
    strategic?: string;
    misunderstandings?: string;
    diagram?: unknown;
  },
): ExplainerSeed {
  return assemble(fields, 'rule', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'how_it_works', body: fields.howItWorks, structuredData: fields.diagram },
    { type: 'example', body: fields.example },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'strategic_implications', body: fields.strategic },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/**
 * A sequence the sport conducts rather than plays.
 *
 * The starting procedure, a pit stop, a safety car restart, parc fermé,
 * scrutineering. Steps first, justification second: a reader asking what
 * happens at lights out is not yet asking why it happens that way.
 */
export function procedure(
  fields: CommonFields & {
    theProcedure: string;
    whenItHappens?: string;
    whyItMatters?: string;
    strategic?: string;
    misunderstandings?: string;
    diagram?: unknown;
  },
): ExplainerSeed {
  return assemble(fields, 'procedure', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'the_procedure', body: fields.theProcedure, structuredData: fields.diagram },
    { type: 'when_it_is_used', heading: 'When it happens', body: fields.whenItHappens },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'strategic_implications', body: fields.strategic },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/**
 * A strategic idea.
 *
 * `advantages` and `risks` are separate sections rather than one, for the
 * reason tennis separated them: an undercut's upside and its cost are the two
 * halves a pit wall weighs against each other in the ninety seconds before the
 * call, and a single heading turns a decision into a paragraph.
 */
export function strategy(
  fields: CommonFields & {
    howItWorks: string;
    whenUsed?: string;
    advantages?: string;
    risks?: string;
    example?: string;
    misunderstandings?: string;
    diagram?: unknown;
  },
): ExplainerSeed {
  return assemble(fields, 'strategy_concept', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'how_it_works', body: fields.howItWorks, structuredData: fields.diagram },
    { type: 'when_it_is_used', heading: 'When teams use it', body: fields.whenUsed },
    { type: 'advantages', body: fields.advantages },
    { type: 'risks', body: fields.risks },
    { type: 'example', heading: 'Real race example', body: fields.example },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/**
 * A part of the car.
 *
 * `onTheCar` comes before the mechanism deliberately: "where it is and what it
 * bolts to" is a different question from "what it does", and a reader who
 * cannot place the part is not ready for the aerodynamics.
 */
export function component(
  fields: CommonFields & {
    onTheCar: string;
    howItWorks: string;
    whyItMatters?: string;
    misunderstandings?: string;
    diagram?: unknown;
  },
): ExplainerSeed {
  return assemble(fields, 'car_component', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'on_the_car', body: fields.onTheCar, structuredData: fields.diagram },
    { type: 'how_it_works', body: fields.howItWorks },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/**
 * A technical concept: aerodynamics, the power unit, braking physics.
 *
 * The template for the material that explains *why* rather than *what*. Kept
 * apart from `component` because downforce is not a part of the car, and giving
 * it the component template would force an "on the car" section that has no
 * honest answer.
 */
export function technical(
  fields: CommonFields & {
    howItWorks: string;
    whyItMatters?: string;
    example?: string;
    tradeoffs?: string;
    misunderstandings?: string;
    diagram?: unknown;
  },
): ExplainerSeed {
  return assemble(fields, 'tactical_concept', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'how_it_works', body: fields.howItWorks, structuredData: fields.diagram },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'example', body: fields.example },
    { type: 'risks', heading: 'The trade-off', body: fields.tradeoffs },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/**
 * Something the driver does.
 *
 * Trail braking, tyre management, defensive driving, wet-weather driving. The
 * distinguishing section is `driver_technique`, which is what the driver's
 * hands and feet are actually doing, and which no other sport's template has.
 */
export function technique(
  fields: CommonFields & {
    theTechnique: string;
    whenUsed?: string;
    whyItMatters?: string;
    risks?: string;
    misunderstandings?: string;
    diagram?: unknown;
  },
): ExplainerSeed {
  return assemble(fields, 'tactical_concept', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'driver_technique', body: fields.theTechnique, structuredData: fields.diagram },
    { type: 'when_it_is_used', heading: 'When drivers use it', body: fields.whenUsed },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'risks', body: fields.risks },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/**
 * A metric, a telemetry trace or a derived performance model.
 *
 * `limitations` is not optional. The brief asks for tyre-corrected pace,
 * fuel-corrected lap times and expected race position, none of which is an
 * official FIA statistic, and a page presenting a model without stating its
 * assumptions is how a reader ends up quoting an estimate as a fact.
 */
export function statistic(
  fields: CommonFields & {
    measures: string;
    formula?: string;
    workedExample?: string;
    interpret?: string;
    limitations: string;
    diagram?: unknown;
  },
): ExplainerSeed {
  return assemble(fields, 'statistic', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'what_it_measures', body: fields.measures },
    { type: 'how_it_is_calculated', body: fields.formula },
    { type: 'worked_example', body: fields.workedExample, structuredData: fields.diagram },
    { type: 'how_to_interpret', body: fields.interpret },
    { type: 'what_it_does_not_tell_you', body: fields.limitations },
  ]);
}

/** A flag, or one of the light panel signals that accompanies it. */
export function flag(
  fields: CommonFields & {
    whatItMeans: string;
    whatDriversMustDo?: string;
    whyItMatters?: string;
    strategic?: string;
    misunderstandings?: string;
  },
): ExplainerSeed {
  return assemble(fields, 'flag', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'simple_explanation', heading: 'What it means', body: fields.whatItMeans },
    {
      type: 'in_practice',
      heading: 'What drivers must do',
      body: fields.whatDriversMustDo,
    },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'strategic_implications', body: fields.strategic },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/** A penalty, and how the stewards arrive at it. */
export function penalty(
  fields: CommonFields & {
    whatItIs: string;
    howItIsServed?: string;
    whenItIsGiven?: string;
    whyItMatters?: string;
    misunderstandings?: string;
  },
): ExplainerSeed {
  return assemble(fields, 'penalty', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'simple_explanation', heading: 'What it is', body: fields.whatItIs },
    { type: 'the_procedure', heading: 'How it is served', body: fields.howItIsServed },
    { type: 'when_it_is_used', heading: 'When it is given', body: fields.whenItIsGiven },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/** A circuit, a circuit type, or a feature of one. */
export function circuit(
  fields: CommonFields & {
    howItPlays: string;
    whyItMatters?: string;
    whoItSuits?: string;
    example?: string;
    misunderstandings?: string;
    diagram?: unknown;
  },
): ExplainerSeed {
  return assemble(fields, 'circuit', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'how_it_works', body: fields.howItPlays, structuredData: fields.diagram },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'when_it_is_used', heading: 'Which cars it suits', body: fields.whoItSuits },
    { type: 'example', body: fields.example },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/** A championship or weekend format. */
export function format(
  fields: CommonFields & {
    howItWorks: string;
    example?: string;
    whyItMatters?: string;
    strategic?: string;
    misunderstandings?: string;
    diagram?: unknown;
  },
): ExplainerSeed {
  return assemble(fields, 'format', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    {
      type: 'how_it_is_played',
      heading: 'How it works',
      body: fields.howItWorks,
      structuredData: fields.diagram,
    },
    { type: 'example', body: fields.example },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'strategic_implications', body: fields.strategic },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/** A role within a team, and what that person actually decides. */
export function role(
  fields: CommonFields & {
    whatTheyDo: string;
    responsibilities?: string;
    whyItMatters?: string;
    misunderstandings?: string;
  },
): ExplainerSeed {
  return assemble(fields, 'position_role', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'simple_explanation', heading: 'What they do', body: fields.whatTheyDo },
    { type: 'responsibilities', body: fields.responsibilities },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/**
 * A general article: the start-here pages, the business material, the pathway.
 *
 * The fallback template, and the one to reach for last. If an entry fits
 * `strategy` or `component` or `statistic`, that type carries more structure
 * and filters better.
 */
export function article(
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
