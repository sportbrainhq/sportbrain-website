import type { ExplainerSeed, ExplainerSectionSeed } from './explainer-types';

/**
 * Builders for the tennis library.
 *
 * Same reasoning as the cricket and basketball helpers: the library has two
 * kinds of page and they want different tools. "What is a tiebreak" earns a
 * hand-written template with a scoreboard and eight sections. "What is a
 * breadstick" needs four, and writing two hundred of those as full object
 * literals would bury the content in punctuation and make an inconsistent
 * heading order inevitable.
 *
 * What these do **not** do is generate prose. Every string passed in is written
 * by hand. They decide the section order and drop the sections a given entry
 * has nothing to say for, which is the part that is genuinely mechanical.
 *
 * Tennis needs its own file rather than reusing basketball's because the
 * section vocabulary differs: a stroke wants "when players use it", "advantages"
 * and "risks", which is the shape a reader compares two shots with, and no
 * basketball template has that.
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
 * What most of the terminology, the scoring vocabulary and the draw statuses
 * want: what it is, what it means in practice, and where a reader trips over
 * it.
 */
export function definition(
  fields: CommonFields & {
    explanation: string;
    example?: string;
    whyItMatters?: string;
    ruleDifferences?: string;
    misunderstandings?: string;
    diagram?: unknown;
  },
): ExplainerSeed {
  return assemble(fields, 'definition', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'simple_explanation', body: fields.explanation, structuredData: fields.diagram },
    { type: 'example', body: fields.example },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'rule_differences', body: fields.ruleDifferences },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/**
 * A rule of the game.
 *
 * `ruleDifferences` is prominent by design. Tennis is governed by the ITF's
 * Rules of Tennis but played under four majors' and two tours' own conditions,
 * which disagree on final-set tiebreaks, coaching, lets and shot clocks. A page
 * describing only one of them teaches a reader that one tournament's conditions
 * are the sport's rules.
 */
export function rule(
  fields: CommonFields & {
    howItWorks: string;
    example?: string;
    whyItMatters?: string;
    ruleDifferences?: string;
    misunderstandings?: string;
    diagram?: unknown;
  },
): ExplainerSeed {
  return assemble(fields, 'rule', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'how_it_works', body: fields.howItWorks, structuredData: fields.diagram },
    { type: 'example', body: fields.example },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'rule_differences', body: fields.ruleDifferences },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/**
 * A stroke.
 *
 * The brief's own structure, and the right one: what it is, when it is chosen,
 * what it wins, what it costs, who is known for it. Advantages and risks are
 * separate sections rather than one because they are the two halves a player
 * weighs in the half-second before hitting a drop shot, and collapsing them
 * into a paragraph loses that the choice is a trade.
 */
export function shot(
  fields: CommonFields & {
    theShot: string;
    whenUsed?: string;
    advantages?: string;
    risks?: string;
    notablePlayers?: string;
    misunderstandings?: string;
    diagram?: unknown;
  },
): ExplainerSeed {
  return assemble(fields, 'shot', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'the_shot', body: fields.theShot, structuredData: fields.diagram },
    { type: 'when_players_use_it', body: fields.whenUsed },
    { type: 'advantages', body: fields.advantages },
    { type: 'risks', body: fields.risks },
    { type: 'notable_players', body: fields.notablePlayers },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/** How a player uses their strokes: the archetypes, and what beats each. */
export function playingStyle(
  fields: CommonFields & {
    howItWorks: string;
    advantages?: string;
    risks?: string;
    notablePlayers?: string;
    counters?: string;
    misunderstandings?: string;
  },
): ExplainerSeed {
  return assemble(fields, 'playing_style', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'how_it_works', body: fields.howItWorks },
    { type: 'advantages', body: fields.advantages },
    { type: 'risks', body: fields.risks },
    { type: 'counters', body: fields.counters },
    { type: 'notable_players', body: fields.notablePlayers },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/** A tactical idea: a pattern, a position, a way of building a point. */
export function tactic(
  fields: CommonFields & {
    howItWorks: string;
    whenUsed?: string;
    whyItMatters?: string;
    risks?: string;
    counters?: string;
    notablePlayers?: string;
    diagram?: unknown;
  },
): ExplainerSeed {
  return assemble(fields, 'tactical_concept', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'how_it_works', body: fields.howItWorks, structuredData: fields.diagram },
    { type: 'when_players_use_it', body: fields.whenUsed },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'risks', body: fields.risks },
    { type: 'counters', body: fields.counters },
    { type: 'notable_players', body: fields.notablePlayers },
  ]);
}

/**
 * A metric.
 *
 * `limitations` is not optional in tennis. "Total points won" is the most
 * misread number in the sport, and a page that reports a statistic without
 * saying what it hides is how a reader ends up arguing that the better player
 * lost.
 */
export function statistic(
  fields: CommonFields & {
    measures: string;
    formula?: string;
    workedExample?: string;
    interpret?: string;
    limitations?: string;
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

/** A court surface. */
export function surface(
  fields: CommonFields & {
    howItPlays: string;
    whyItMatters?: string;
    whoItSuits?: string;
    notablePlayers?: string;
    misunderstandings?: string;
  },
): ExplainerSeed {
  return assemble(fields, 'surface', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'how_it_works', body: fields.howItPlays },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'when_players_use_it', heading: 'Who it suits', body: fields.whoItSuits },
    { type: 'notable_players', body: fields.notablePlayers },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/** A tournament, a tour tier or a competition structure. */
export function format(
  fields: CommonFields & {
    howItWorks: string;
    example?: string;
    whyItMatters?: string;
    ruleDifferences?: string;
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
    { type: 'rule_differences', body: fields.ruleDifferences },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/**
 * A ranking mechanism.
 *
 * Asked for as worked arithmetic rather than paragraphs, which is why
 * `workedExample` sits directly under the mechanics: "you drop the 1,000 points
 * you won here last year whether or not you play" is a sentence a reader
 * believes only once they have watched the subtraction happen.
 */
export function rankingConcept(
  fields: CommonFields & {
    howItWorks: string;
    workedExample?: string;
    whyItMatters?: string;
    ruleDifferences?: string;
    misunderstandings?: string;
  },
): ExplainerSeed {
  return assemble(fields, 'ranking_concept', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'how_it_works', body: fields.howItWorks },
    { type: 'worked_example', body: fields.workedExample },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'rule_differences', body: fields.ruleDifferences },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/** A region of the court, or one of its lines. */
export function courtArea(
  fields: CommonFields & {
    whereItIs: string;
    whyItMatters?: string;
    ruleDifferences?: string;
    misunderstandings?: string;
    diagram?: unknown;
  },
): ExplainerSeed {
  return assemble(fields, 'court_area', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'where_it_happens', body: fields.whereItIs, structuredData: fields.diagram },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'rule_differences', body: fields.ruleDifferences },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/** Officiating: who calls what, the technology, and the penalty system. */
export function officiating(
  fields: CommonFields & {
    howItWorks: string;
    example?: string;
    whyItMatters?: string;
    ruleDifferences?: string;
    misunderstandings?: string;
  },
): ExplainerSeed {
  return assemble(fields, 'officiating', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'how_it_works', body: fields.howItWorks },
    { type: 'example', body: fields.example },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'rule_differences', body: fields.ruleDifferences },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/** A racket, a string, a ball, a shoe. Mechanics and trade-offs, never products. */
export function equipment(
  fields: CommonFields & {
    whatItIs: string;
    whyItMatters?: string;
    advantages?: string;
    risks?: string;
    misunderstandings?: string;
  },
): ExplainerSeed {
  return assemble(fields, 'equipment', [
    { type: 'one_sentence', body: fields.oneSentence ?? fields.summary },
    { type: 'simple_explanation', body: fields.whatItIs },
    { type: 'why_it_matters', body: fields.whyItMatters },
    { type: 'advantages', heading: 'What more of it gives you', body: fields.advantages },
    { type: 'risks', heading: 'What it costs you', body: fields.risks },
    { type: 'common_misunderstandings', body: fields.misunderstandings },
  ]);
}

/**
 * A general article: the start-here pages, the conditions, the career pathway.
 *
 * The fallback template, and the one to reach for last. If an entry fits `shot`
 * or `rule` or `statistic`, that type carries more structure and filters
 * better.
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
