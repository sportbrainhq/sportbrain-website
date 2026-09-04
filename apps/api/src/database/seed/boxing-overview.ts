/**
 * Boxing overview content.
 *
 * The ninth sport through the machinery built for football, cricket,
 * basketball, tennis, golf, American football, MMA and Formula 1, and the
 * second combat sport after MMA. The seed shapes are imported rather than
 * redefined, and the page renders them with the same sport-agnostic
 * components.
 *
 * ## Governance: four sanctioning bodies, and none of them is a governing body
 *
 * `GoverningBodySeed` was built for a body that writes a sport's rules and
 * recognises the organisations that play under them: FIFA, FIBA, the ICC, the
 * R&A/USGA. Professional boxing has nothing that plays that role. The WBA,
 * WBC, IBF and WBO are sanctioning and ranking organisations: each maintains
 * its own rankings, charges sanctioning fees, names mandatory challengers and
 * crowns its own "world" champion per weight class, but none of them writes a
 * single rulebook the others answer to, and none recognises the others as
 * subordinate members the way a continental confederation sits under FIFA.
 * `boxing-competitions.ts`, seeded alongside this file, already made the call
 * that the four bodies belong on the Competitions tab as the titles boxers
 * actually win, not on a governance tree as an organisational hierarchy; this
 * file stays consistent with that and does not re-litigate it. See that
 * file's own doc comment for the full reasoning.
 *
 * That leaves amateur and Olympic boxing, which is where a `GoverningBodySeed`
 * row would normally go, and which is exactly the part of the sport whose
 * governance has been genuinely unstable for the best part of a decade: the
 * International Boxing Association (AIBA, later renamed IBA) lost its Olympic
 * recognition from the IOC in 2019, boxing was retained at the Paris 2024
 * Olympics only under direct IOC administration rather than through a
 * recognised federation, and a new body, World Boxing, formed in 2023-24 and
 * applied for recognition in its place. None of that is a settled fact this
 * page can assert without going stale, possibly before it is even read. The
 * governance table is therefore left empty rather than seeded with a body
 * whose standing may have changed by the time this ships, and the prose says
 * plainly that Olympic boxing's administration has been unsettled rather than
 * naming a current recognised federation.
 *
 * ## What is deliberately absent, and why
 *
 * Following golf's and MMA's precedent for durable-vs-live content:
 *
 *   - **No current champions, no current rankings, no current
 *     pound-for-pound lists.** A champion named here is one fight from being
 *     wrong, across four bodies and roughly seventeen divisions, and this
 *     page has no mechanism to update on a Saturday night. Weight classes are
 *     named as divisions, not as who currently holds which belt; the Fighters
 *     and Competitions tabs carry that.
 *   - **No prize money or purse figures.** They vary by orders of magnitude
 *     fight to fight and mean nothing as a general fact about the sport.
 *   - **No deep technique or scoring mechanics.** Punches, defence, footwork,
 *     the ten-point must system's actual application, standing counts, and
 *     weight-cutting practice are named where the vocabulary requires it and
 *     taught nowhere on this page; all of it is Explainer material, and
 *     `explainerSlug` is set optimistically on the relevant concepts even
 *     though most of those explainers do not exist yet, in the pattern this
 *     directory already uses.
 *   - **No single GOAT list.** The Legends section is chronological, spanning
 *     both the men's and women's game across eras, for the same reason golf
 *     and MMA decline to rank their greats against one another: eras, weight
 *     classes, opposition and scoring conventions differ enough that a single
 *     ordering would assert more than the sport agrees on.
 *   - **No hardcoded current Olympic weight categories.** They have changed
 *     between Games and will again; the Olympic section describes the
 *     tournament's shape rather than a category list.
 *
 * ## On sourcing
 *
 * Dates were checked rather than recalled, and several are treated as
 * approximate or disputed deliberately:
 *
 *   - **Ancient fist-fighting and its presence at the ancient Olympics**
 *     (boxing was added in 688 BC) is recorded as `certainty: 'approximate'`,
 *     since evidence from antiquity is inherently less precise than modern
 *     record-keeping, and no claim is made that it descends directly into the
 *     modern sport.
 *   - **The Marquess of Queensberry Rules** were published in **1867**,
 *     drafted by the Welsh sportsman John Graham Chambers and issued under
 *     the patronage of the 9th Marquess of Queensberry, whose name they carry
 *     though he did not write them himself. This date is the one most often
 *     miscited (occasionally as 1865 or the mid-1860s generally), and it is
 *     recorded here as `certainty: 'established'` on the strength of the
 *     commonly agreed 1867 publication date, while the timeline's surrounding
 *     entries (the earlier London Prize Ring Rules era, the gradual shift to
 *     gloved boxing) are marked `approximate`, since that transition was
 *     gradual rather than a single event.
 *   - **AIBA's loss of IOC recognition (2019)**, **IBA's continued
 *     non-recognition**, and **World Boxing's 2023-24 formation** are
 *     recorded with `certainty: 'approximate'` and deliberately hedged
 *     language ("as of the years around Paris 2024", "unsettled") rather than
 *     a confident present-tense claim, since this is exactly the kind of
 *     governance status that can change after this file is written.
 *   - No specific fighter win-loss-draw records are asserted as exact
 *     figures in prose; where a record is mentioned it is described
 *     qualitatively (e.g. "retired undefeated") rather than with a number
 *     that would need to be re-verified against a database this page does
 *     not query.
 *
 * ## Modelling notes specific to this sport
 *
 * `BOXING_FORMATS` covers level and ruleset (professional, amateur, Olympic)
 * rather than a tournament-vs-league taxonomy, since a professional boxing
 * card is a set of individually contracted bouts, not a fixture list.
 * `BOXING_MEMBERSHIP` is omitted for the same reason as MMA's: no sanctioning
 * body grades a roster of member federations the way a sport's governing body
 * does, and no promoter or commission publishes a comparable figure either.
 */

import type { GoverningBodySeed, SectionSeed, SourceSeed, TimelineSeed } from './football-overview';
import type { ConceptSeed, FactSeed, FormatSeed } from './cricket-overview';
import type { FeaturedEntitySeed } from './basketball-overview';

export const BOXING_SOURCES: SourceSeed[] = [
  {
    key: 'wp-boxing',
    provider: 'wikipedia',
    title: 'Boxing',
    url: 'https://en.wikipedia.org/wiki/Boxing',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-history-boxing',
    provider: 'wikipedia',
    title: 'History of boxing',
    url: 'https://en.wikipedia.org/wiki/History_of_boxing',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-queensberry-rules',
    provider: 'wikipedia',
    title: 'Marquess of Queensberry Rules',
    url: 'https://en.wikipedia.org/wiki/Marquess_of_Queensberry_Rules',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-london-prize-ring',
    provider: 'wikipedia',
    title: 'London Prize Ring Rules',
    url: 'https://en.wikipedia.org/wiki/London_Prize_Ring_Rules',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-weight-class-boxing',
    provider: 'wikipedia',
    title: 'Boxing weight classes',
    url: 'https://en.wikipedia.org/wiki/Boxing_weight_classes',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-wba',
    provider: 'wikipedia',
    title: 'World Boxing Association',
    url: 'https://en.wikipedia.org/wiki/World_Boxing_Association',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-wbc',
    provider: 'wikipedia',
    title: 'World Boxing Council',
    url: 'https://en.wikipedia.org/wiki/World_Boxing_Council',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-ibf',
    provider: 'wikipedia',
    title: 'International Boxing Federation',
    url: 'https://en.wikipedia.org/wiki/International_Boxing_Federation',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-wbo',
    provider: 'wikipedia',
    title: 'World Boxing Organization',
    url: 'https://en.wikipedia.org/wiki/World_Boxing_Organization',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-undisputed-champion',
    provider: 'wikipedia',
    title: 'Undisputed champion',
    url: 'https://en.wikipedia.org/wiki/Undisputed_champion',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-ten-point-must-boxing',
    provider: 'wikipedia',
    title: 'Ten-point must system',
    url: 'https://en.wikipedia.org/wiki/Ten-point_must_system',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-knockout',
    provider: 'wikipedia',
    title: 'Knockout',
    url: 'https://en.wikipedia.org/wiki/Knockout',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-technical-knockout',
    provider: 'wikipedia',
    title: 'Technical knockout',
    url: 'https://en.wikipedia.org/wiki/Technical_knockout',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-boxing-ring',
    provider: 'wikipedia',
    title: 'Boxing ring',
    url: 'https://en.wikipedia.org/wiki/Boxing_ring',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-boxing-glove',
    provider: 'wikipedia',
    title: 'Boxing glove',
    url: 'https://en.wikipedia.org/wiki/Boxing_glove',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-amateur-boxing',
    provider: 'wikipedia',
    title: 'Amateur boxing',
    url: 'https://en.wikipedia.org/wiki/Amateur_boxing',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-olympic-boxing',
    provider: 'wikipedia',
    title: 'Boxing at the Summer Olympics',
    url: 'https://en.wikipedia.org/wiki/Boxing_at_the_Summer_Olympics',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-world-boxing',
    provider: 'wikipedia',
    title: 'World Boxing (organization)',
    url: 'https://en.wikipedia.org/wiki/World_Boxing_(organization)',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-iba',
    provider: 'wikipedia',
    title: 'International Boxing Association',
    url: 'https://en.wikipedia.org/wiki/International_Boxing_Association',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-ali',
    provider: 'wikipedia',
    title: 'Muhammad Ali',
    url: 'https://en.wikipedia.org/wiki/Muhammad_Ali',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-promoter-boxing',
    provider: 'wikipedia',
    title: 'Boxing promoter',
    url: 'https://en.wikipedia.org/wiki/Boxing_promoter',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-the-ring-magazine',
    provider: 'wikipedia',
    title: 'The Ring (magazine)',
    url: 'https://en.wikipedia.org/wiki/The_Ring_(magazine)',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-pound-for-pound',
    provider: 'wikipedia',
    title: 'Pound for pound',
    url: 'https://en.wikipedia.org/wiki/Pound_for_pound',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-southpaw',
    provider: 'wikipedia',
    title: 'Boxing stance',
    url: 'https://en.wikipedia.org/wiki/Boxing_stance',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-prizefighting',
    provider: 'wikipedia',
    title: 'Bare-knuckle boxing',
    url: 'https://en.wikipedia.org/wiki/Bare-knuckle_boxing',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-clinch',
    provider: 'wikipedia',
    title: 'Clinching',
    url: 'https://en.wikipedia.org/wiki/Clinching',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wd-boxing',
    provider: 'wikidata',
    title: 'Boxing (Q32112)',
    url: 'https://www.wikidata.org/wiki/Q32112',
    externalId: 'Q32112',
    license: 'CC0',
  },
];

/**
 * Quick facts.
 *
 * Split into `identity` and `gameplay`, the same two categories every sport
 * in this directory uses, so the Overview page renders the hero strip and
 * the at-a-glance grid as two blocks.
 */
export const BOXING_FACTS: FactSeed[] = [
  {
    key: 'sport-type',
    label: 'Sport type',
    value: 'Full-contact combat sport using punches only',
    category: 'identity',
    sourceKey: 'wp-boxing',
    order: 10,
  },
  {
    key: 'competitors',
    label: 'Competitors',
    value: '1 vs 1',
    category: 'identity',
    sourceKey: 'wp-boxing',
    order: 20,
  },
  {
    key: 'fight-area',
    label: 'Fight area',
    value: 'A roped square platform, called a ring',
    category: 'identity',
    sourceKey: 'wp-boxing-ring',
    order: 30,
  },
  {
    key: 'sanctioning-bodies',
    label: 'Major sanctioning bodies',
    value: 'WBA, WBC, IBF, WBO',
    category: 'identity',
    sourceKey: 'wp-boxing',
    order: 40,
  },
  {
    key: 'olympic',
    label: 'Olympic sport',
    value: 'Yes, since the 1904 Games (with some exceptions)',
    category: 'identity',
    sourceKey: 'wp-olympic-boxing',
    order: 50,
  },
  {
    key: 'rules-origin',
    label: 'Modern rules basis',
    value: 'Marquess of Queensberry Rules, published 1867',
    category: 'identity',
    sourceKey: 'wp-queensberry-rules',
    order: 60,
  },

  {
    key: 'championship-rounds',
    label: 'Championship fight length',
    value: 'Commonly 12 rounds',
    category: 'gameplay',
    sourceKey: 'wp-boxing',
    order: 110,
  },
  {
    key: 'round-length',
    label: 'Common round length',
    value: '3 minutes, with a 1-minute break between rounds',
    category: 'gameplay',
    sourceKey: 'wp-boxing',
    order: 120,
  },
  {
    key: 'ways-to-win',
    label: 'Ways to win',
    value: 'Knockout, technical knockout, decision, disqualification, other stoppage',
    category: 'gameplay',
    sourceKey: 'wp-boxing',
    order: 130,
  },
  {
    key: 'scoring-system',
    label: 'Judging basis',
    value: 'Ten-point must system, common professional standard',
    category: 'gameplay',
    sourceKey: 'wp-ten-point-must-boxing',
    order: 140,
  },
  {
    key: 'weight-classes',
    label: 'Professional weight classes',
    value: '17 traditional men’s divisions; names and limits vary by organisation',
    category: 'gameplay',
    sourceKey: 'wp-weight-class-boxing',
    order: 150,
  },
];

export const BOXING_TIMELINE: TimelineSeed[] = [
  {
    year: -1500,
    endYear: -700,
    title: 'Fist-fighting in the ancient world',
    shortDescription:
      'Depictions and records of fist-fighting contests appear across multiple ancient civilisations, including Sumer, Egypt and the Aegean, well before boxing had any codified rules. These are evidence that fist-fighting is old and widespread, not a direct line of descent into the modern sport.',
    category: 'origins',
    certainty: 'approximate',
    sourceKey: 'wp-history-boxing',
    order: 10,
  },
  {
    year: -688,
    title: 'Boxing added to the ancient Olympic Games',
    shortDescription:
      'Boxing (pygmachia) became an Olympic event in ancient Greece, contested with leather hand wrappings rather than gloves and without weight classes or a fixed round structure. It bears little structural resemblance to the modern sport beyond the basic idea of fists only.',
    category: 'origins',
    isMajorMilestone: true,
    certainty: 'approximate',
    sourceKey: 'wp-history-boxing',
    order: 20,
  },
  {
    year: 1681,
    endYear: 1743,
    title: 'Prizefighting emerges in England',
    shortDescription:
      'Bare-knuckle prizefighting developed into an organised, wagered spectacle in 18th-century England. Jack Broughton, a leading prizefighter, drew up an early code of rules in 1743 aimed at reducing serious injury and establishing basic fouls, a precursor to later codified rulesets.',
    category: 'origins',
    certainty: 'approximate',
    sourceKey: 'wp-prizefighting',
    order: 30,
  },
  {
    year: 1838,
    endYear: 1853,
    title: 'The London Prize Ring Rules',
    shortDescription:
      'A more detailed rules code, revised more than once through the mid-19th century, governed British and American bare-knuckle prizefighting: a roped ring, rounds ending on a knockdown, and a basic count for a fallen fighter to rise. It remained the dominant standard until the Queensberry Rules gradually displaced it.',
    category: 'governance',
    certainty: 'approximate',
    sourceKey: 'wp-london-prize-ring',
    order: 40,
  },
  {
    year: 1867,
    title: 'The Marquess of Queensberry Rules are published',
    shortDescription:
      'Drafted by John Graham Chambers and published under the patronage of the 9th Marquess of Queensberry, these rules introduced three-minute rounds with a one-minute rest, a ten-second count for a fallen fighter, and the use of padded gloves. They are the direct ancestor of modern boxing’s rules, though gloved boxing under this code took decades to fully replace bare-knuckle prizefighting.',
    category: 'governance',
    isMajorMilestone: true,
    certainty: 'established',
    sourceKey: 'wp-queensberry-rules',
    order: 50,
  },
  {
    year: 1892,
    title: 'Gloved boxing establishes itself as the professional standard',
    shortDescription:
      'John L. Sullivan’s loss to James J. Corbett under Queensberry Rules, using gloves, is commonly cited as a symbolic turning point away from bare-knuckle prizefighting toward the gloved sport that would become modern professional boxing.',
    category: 'governance',
    certainty: 'approximate',
    sourceKey: 'wp-history-boxing',
    order: 60,
  },
  {
    year: 1904,
    title: 'Boxing joins the modern Olympic Games',
    shortDescription:
      'Boxing was contested at the 1904 St Louis Olympics, the start (with some later exceptions and interruptions) of its long run as an Olympic sport under amateur rules distinct from the professional game.',
    category: 'competition',
    isMajorMilestone: true,
    certainty: 'established',
    sourceKey: 'wp-olympic-boxing',
    order: 70,
  },
  {
    year: 1920,
    endYear: 1921,
    title: 'The forerunner of the WBA is founded',
    shortDescription:
      'The National Boxing Association was formed in the United States to bring some order to a patchwork of state and regional sanctioning; it was renamed the World Boxing Association in 1962. It is the oldest of the four bodies now commonly described as major sanctioning organisations.',
    category: 'governance',
    isMajorMilestone: true,
    certainty: 'approximate',
    sourceKey: 'wp-wba',
    order: 80,
  },
  {
    year: 1963,
    title: 'The World Boxing Council is founded',
    shortDescription:
      'Formed in Mexico City by representatives of several national boxing commissions, partly in response to dissatisfaction with the existing sanctioning landscape. It became one of the sport’s major sanctioning bodies.',
    category: 'governance',
    isMajorMilestone: true,
    certainty: 'established',
    sourceKey: 'wp-wbc',
    order: 90,
  },
  {
    year: 1960,
    endYear: 1981,
    title: 'The Muhammad Ali era',
    shortDescription:
      'Muhammad Ali’s career, from his 1960 Olympic gold through his three reigns as heavyweight champion and retirement in 1981, is widely regarded as the period that brought boxing its greatest global fame, on the strength of both his fighting and his cultural and political significance.',
    category: 'era',
    isMajorMilestone: true,
    certainty: 'established',
    sourceKey: 'wp-ali',
    order: 100,
  },
  {
    year: 1983,
    title: 'The International Boxing Federation is founded',
    shortDescription:
      'Formed initially as the United States Boxing Association before adopting an international scope and its current name, becoming the third of the four bodies commonly described as major sanctioning organisations.',
    category: 'governance',
    isMajorMilestone: true,
    certainty: 'established',
    sourceKey: 'wp-ibf',
    order: 110,
  },
  {
    year: 1980,
    endYear: 1989,
    title: 'The Four Kings era',
    shortDescription:
      'Sugar Ray Leonard, Roberto Durán, Thomas Hearns and Marvin Hagler fought one another repeatedly across the welterweight and middleweight divisions through the 1980s, producing a run of fights still regarded as a high point for depth of competition at those weights.',
    category: 'era',
    isMajorMilestone: true,
    certainty: 'established',
    sourceKey: 'wp-boxing',
    order: 120,
  },
  {
    year: 1988,
    title: 'The World Boxing Organization is founded',
    shortDescription:
      'Formed by a breakaway group of promoters and officials from the WBA, becoming the fourth and most recent of the bodies now commonly described as major sanctioning organisations.',
    category: 'governance',
    isMajorMilestone: true,
    certainty: 'established',
    sourceKey: 'wp-wbo',
    order: 130,
  },
  {
    year: 1990,
    endYear: 1999,
    title: 'Tyson, Holyfield and Lewis define the 1990s heavyweight division',
    shortDescription:
      'Mike Tyson, Evander Holyfield and Lennox Lewis dominated a heavyweight era marked by major upsets, high-profile rivalries and some of the highest pay-per-view revenues the sport had seen up to that point.',
    category: 'era',
    isMajorMilestone: true,
    certainty: 'established',
    sourceKey: 'wp-boxing',
    order: 140,
  },
  {
    year: 2000,
    endYear: 2015,
    title: 'The Mayweather-Pacquiao pay-per-view era',
    shortDescription:
      'Floyd Mayweather Jr. and Manny Pacquiao became the sport’s biggest commercial draws through the 2000s and into the 2010s, culminating in their long-anticipated 2015 fight, one of the highest-grossing pay-per-view events in boxing history.',
    category: 'era',
    isMajorMilestone: true,
    certainty: 'established',
    sourceKey: 'wp-boxing',
    order: 150,
  },
  {
    year: 2019,
    title: 'AIBA loses IOC recognition',
    shortDescription:
      'The International Boxing Association (AIBA), the long-standing governing body for Olympic amateur boxing, had its recognition withdrawn by the International Olympic Committee over governance, financial and integrity concerns, unsettling boxing’s Olympic administration for the years that followed.',
    category: 'governance',
    isMajorMilestone: true,
    certainty: 'approximate',
    sourceKey: 'wp-iba',
    order: 160,
  },
  {
    year: 2023,
    endYear: 2024,
    title: 'World Boxing forms and seeks recognition',
    shortDescription:
      'With the IOC continuing to withhold recognition from IBA (as AIBA had been renamed), a new international federation, World Boxing, was formed and began seeking IOC recognition as boxing’s Olympic governing body. Boxing itself remained on the Paris 2024 programme under direct IOC administration rather than through a recognised federation. This situation is treated here as unsettled rather than resolved, since it may well have changed again by the time this is read.',
    category: 'governance',
    isMajorMilestone: true,
    certainty: 'approximate',
    sourceKey: 'wp-world-boxing',
    order: 170,
  },
  {
    year: 2015,
    endYear: 2026,
    title: 'The streaming era',
    shortDescription:
      'Major fights increasingly moved from traditional pay-per-view cable broadcasts to streaming platforms, changing how fights are bought, watched and promoted, alongside continued growth in the profile and commercial reach of women’s professional boxing.',
    category: 'growth',
    certainty: 'approximate',
    sourceKey: 'wp-boxing',
    order: 180,
  },
];

/**
 * Governance.
 *
 * Deliberately empty. See the file-level doc comment for the full reasoning:
 * the four sanctioning bodies (WBA, WBC, IBF, WBO) are modelled as
 * competitions, not governing bodies, consistent with `boxing-competitions.ts`;
 * and Olympic/amateur boxing's administration has been genuinely unsettled
 * since AIBA/IBA lost IOC recognition, with World Boxing seeking recognition
 * in its place as of the years around Paris 2024. Seeding a row here would
 * assert a current status this page has no way to keep correct, so the table
 * is left empty and the `governance` section explains why in prose instead.
 */
export const BOXING_GOVERNANCE: GoverningBodySeed[] = [];

/**
 * Formats.
 *
 * Boxing has no equivalent of a Test-vs-T20 split; a professional card is a
 * set of individually contracted bouts rather than a fixture list. What
 * varies is level and ruleset, so `matchClass` marks that split, in the same
 * shallow-pathway spirit as MMA's and American football's.
 */
export const BOXING_FORMATS: FormatSeed[] = [
  {
    key: 'professional',
    label: 'Professional boxing',
    matchClass: 'level',
    isInternational: false,
    description:
      'Fights under professional contracts, recorded in an official professional record, sanctioned by a state or national athletic commission, commonly for a sanctioning body’s title at world level.',
    conditionsAuthority: 'athletic commission / sanctioning body',
    sourceKey: 'wp-boxing',
    order: 10,
  },
  {
    key: 'amateur',
    label: 'Amateur boxing',
    matchClass: 'level',
    isInternational: false,
    description:
      'Developmental and points-scored competition, typically shorter in duration than professional bouts and contested under a distinct rule set, including the pathway most professionals come through.',
    conditionsAuthority: 'national federation / World Boxing',
    sourceKey: 'wp-amateur-boxing',
    order: 20,
  },
  {
    key: 'olympic',
    label: 'Olympic boxing',
    matchClass: 'level',
    isInternational: true,
    description:
      'Amateur boxing contested at the Summer Olympics, run as a single-elimination bracket by weight class following a qualification process, with the sport’s Olympic administration itself having been unsettled in recent Games cycles.',
    conditionsAuthority: 'IOC (directly, in recent cycles)',
    sourceKey: 'wp-olympic-boxing',
    order: 30,
  },
];

/**
 * The vocabulary.
 *
 * One or two sentences each. These are the terms a broadcast uses without
 * explaining them; anything needing a paragraph, how judges actually score a
 * round, punch mechanics, weight-cutting practice, belongs in an Explainer.
 * `explainerSlug` is set optimistically throughout: the API drops a link to a
 * slug that does not resolve rather than rendering a broken one.
 */
export const BOXING_CONCEPTS: ConceptSeed[] = [
  {
    key: 'jab',
    term: 'Jab',
    summary:
      'A quick, straight punch thrown with the lead hand, boxing’s most frequently thrown punch.',
    category: 'technique',
    explainerSlug: 'boxing-punches-explained',
    sourceKey: 'wp-boxing',
    order: 10,
  },
  {
    key: 'cross',
    term: 'Cross',
    summary:
      'A straight punch thrown with the rear hand, typically a fighter’s hardest single punch.',
    category: 'technique',
    explainerSlug: 'boxing-punches-explained',
    sourceKey: 'wp-boxing',
    order: 20,
  },
  {
    key: 'hook',
    term: 'Hook',
    summary: 'A punch thrown in a horizontal, looping arc, aimed at the side of the head or body.',
    category: 'technique',
    explainerSlug: 'boxing-punches-explained',
    sourceKey: 'wp-boxing',
    order: 30,
  },
  {
    key: 'uppercut',
    term: 'Uppercut',
    summary: 'A vertical, rising punch thrown at close range, aimed at the chin or body.',
    category: 'technique',
    explainerSlug: 'boxing-punches-explained',
    sourceKey: 'wp-boxing',
    order: 40,
  },
  {
    key: 'footwork',
    term: 'Footwork',
    summary: 'The positioning and movement of a boxer’s feet, underlying both offence and defence.',
    category: 'technique',
    explainerSlug: 'boxing-fundamentals-explained',
    sourceKey: 'wp-boxing',
    order: 50,
  },
  {
    key: 'guard',
    term: 'Guard',
    summary: 'The defensive hand and arm position a boxer holds to protect the head and body.',
    category: 'technique',
    explainerSlug: 'boxing-fundamentals-explained',
    sourceKey: 'wp-boxing',
    order: 60,
  },
  {
    key: 'counterpunching',
    term: 'Counterpunching',
    summary:
      'Throwing a punch in direct response to, or immediately after avoiding, an opponent’s attack.',
    category: 'technique',
    explainerSlug: 'boxing-fundamentals-explained',
    sourceKey: 'wp-boxing',
    order: 70,
  },
  {
    key: 'orthodox',
    term: 'Orthodox',
    summary: 'The standard boxing stance, left hand and foot leading, for a right-handed fighter.',
    category: 'technique',
    sourceKey: 'wp-southpaw',
    order: 80,
  },
  {
    key: 'southpaw',
    term: 'Southpaw',
    summary: 'A boxing stance with the right hand and foot leading, the mirror of orthodox.',
    category: 'technique',
    sourceKey: 'wp-southpaw',
    order: 90,
  },
  {
    key: 'clinch',
    term: 'Clinch',
    summary:
      'Close-range grappling contact between two boxers, often used to slow an opponent’s attack, broken by the referee.',
    category: 'gameplay',
    sourceKey: 'wp-clinch',
    order: 100,
  },
  {
    key: 'knockdown',
    term: 'Knockdown',
    summary:
      'A fighter touches the canvas with anything other than their feet, or is held up only by the ropes, as a result of a punch.',
    category: 'result',
    explainerSlug: 'boxing-fight-results-explained',
    sourceKey: 'wp-knockout',
    order: 110,
  },
  {
    key: 'knockout',
    term: 'Knockout (KO)',
    summary:
      'A fighter is unable to rise and continue within the referee’s count after being knocked down.',
    category: 'result',
    explainerSlug: 'boxing-fight-results-explained',
    sourceKey: 'wp-knockout',
    order: 120,
  },
  {
    key: 'tko',
    term: 'Technical knockout (TKO)',
    summary:
      'The referee, a doctor or a fighter’s corner stops the fight before a full knockout occurs.',
    category: 'result',
    explainerSlug: 'boxing-fight-results-explained',
    sourceKey: 'wp-technical-knockout',
    order: 130,
  },
  {
    key: 'decision',
    term: 'Decision',
    summary:
      'Judges determine the winner by scorecard after the scheduled rounds are completed with no stoppage.',
    category: 'result',
    explainerSlug: 'how-boxing-judging-works',
    sourceKey: 'wp-ten-point-must-boxing',
    order: 140,
  },
  {
    key: 'undisputed',
    term: 'Undisputed champion',
    summary:
      'A boxer who simultaneously holds the WBA, WBC, IBF and WBO titles in one weight class.',
    category: 'competition',
    sourceKey: 'wp-undisputed-champion',
    order: 150,
  },
  {
    key: 'mandatory',
    term: 'Mandatory challenger',
    summary:
      'The challenger a sanctioning body requires its champion to face next, ahead of any voluntary defence.',
    category: 'competition',
    explainerSlug: 'how-boxing-titles-work',
    sourceKey: 'wp-wbc',
    order: 160,
  },
  {
    key: 'pound-for-pound',
    term: 'Pound for pound',
    summary:
      'An informal, inherently subjective ranking of fighters as though weight were not a factor, with no single universal list.',
    category: 'ranking',
    sourceKey: 'wp-pound-for-pound',
    order: 170,
  },
  {
    key: 'weight-class-concept',
    term: 'Weight class',
    summary:
      'A division defined by a maximum body weight at the official weigh-in, so boxers compete against opponents of similar size.',
    category: 'competition',
    explainerSlug: 'boxing-weight-classes-explained',
    sourceKey: 'wp-weight-class-boxing',
    order: 180,
  },
];

export const BOXING_SECTIONS: SectionSeed[] = [
  {
    kind: 'introduction',
    heading: 'What is boxing?',
    order: 10,
    body: `Boxing is a full-contact combat sport in which two competitors, matched by weight, fight using punches only, inside a roped platform called a ring. A fight is divided into rounds, and it can end before the rounds are complete, by knockout or stoppage, or go the distance to a decision on the judges' scorecards.

The sport's basic vocabulary, jab, cross, hook, uppercut, is old and widely known even by people who have never watched a fight. What is less widely understood is how a fight is actually judged, and why there is more than one "world champion" in most weight classes at once. Both of those are covered here at a high level; the mechanics of punching, defence and scoring in detail are Explainer material.

Boxing is contested professionally, worldwide, under sanctioning bodies that each maintain their own rankings and crown their own champions, and separately as an amateur and Olympic sport with its own rules and its own governing arrangements.`,
  },
  {
    kind: 'glance',
    heading: 'Boxing at a glance',
    order: 20,
    body: `**Competitors.** One against one, matched by weight class.

**Fighting area.** A ring: a roped square platform, despite the name.

**Punches only.** No kicks, no grappling beyond a brief, referee-broken clinch.

**Championship fight length.** Commonly 12 rounds.

**Round length.** Commonly 3 minutes, with a 1-minute break between rounds.

**Ways to win.** Knockout, technical knockout, decision, disqualification, or another official stoppage.

**Major sanctioning bodies.** WBA, WBC, IBF, WBO.

**Olympic sport.** Yes, an established part of the Games since 1904, though its Olympic governance has been unsettled in recent cycles.`,
  },
  {
    kind: 'how-it-works',
    heading: 'How a match works',
    order: 30,
    body: `A fight is divided into a scheduled number of rounds, begun and ended by a bell. Between rounds, each fighter returns to their corner, where their team works on cuts, gives instruction and rests them for the minute allowed before the next bell.

The fight ends in one of a small number of ways: the scheduled rounds are completed and the judges' scorecards decide it; a fighter is knocked out or the referee, a doctor or a corner stops the fight (a technical knockout); a fighter is disqualified for a serious rule violation; or, occasionally, the fight is stopped for another reason set out in the applicable rules, such as an accidental injury that prevents it continuing.

The detail of how a round is actually fought, and how judges reach their scores, belongs to the Explainers rather than here.`,
  },
  {
    kind: 'ring',
    heading: 'The boxing ring',
    order: 40,
    body: `Boxing is fought in a **ring**, despite the name a square (occasionally a slightly larger or differently proportioned rectangle) rather than a circle, bounded by several strands of rope strung between corner posts. Each corner has a designated role: two are the fighters' own corners, where their teams work between rounds, and the other two are **neutral corners**, used chiefly during a count after a knockdown, so that the standing fighter is not looming over their opponent while the referee counts.

The fighting surface itself is the **canvas**, a padded platform beneath the ropes. Its size varies somewhat between promotions and venues, and this page does not fix a single dimension as standard.`,
  },
  {
    kind: 'skills',
    heading: 'Basic skills',
    order: 50,
    body: `A boxer's game is usually described across a small number of overlapping skill areas. **Punching** is the sport's only means of scoring or stopping an opponent. **Defence**, avoiding or blocking punches through guard, distance and head movement, is just as central to winning as punching is. **Movement**, footwork around the ring, controls distance and angle and underlies both attack and defence. **Counterpunching**, responding to or immediately following an opponent's attack, is often treated as its own distinct skill, since timing a counter well differently rewards patience and reaction rather than aggression.

None of these is taught in depth on this page; the mechanics belong to the Explainers.`,
  },
  {
    kind: 'punches',
    heading: 'Basic punches',
    order: 60,
    body: `A small number of named punches make up the vocabulary of the sport. The **jab**, a quick lead-hand punch, is thrown more often than any other and sets up most combinations. The **cross**, a straight rear-hand punch, is typically a fighter's hardest single shot. **Hooks** travel in a horizontal arc to the side of the head or body. **Uppercuts** rise vertically at close range. **Body shots**, punches aimed below the chest, are used to wear an opponent down over the course of a fight rather than to end it in a single blow. Punches are also thrown in **combinations**, sequences of more than one punch thrown together.

This page names these terms rather than teaching them; technique belongs to the Explainers.`,
  },
  {
    kind: 'ways-to-win',
    heading: 'Ways to win',
    order: 70,
    body: `**Knockout (KO).** A fighter is unable to rise and continue within the referee's count after being knocked down.

**Technical knockout (TKO).** The referee, a doctor or a fighter's corner stops the fight before a full knockout occurs, because a fighter can no longer safely or competitively continue.

**Decision.** The judges determine the winner by scorecard once the scheduled rounds are completed without a stoppage.

**Disqualification.** A fighter loses because of a serious rule violation.

**Draw.** The judges' scorecards do not agree on a winner.

**Technical decision.** The fight is stopped early, often by an accidental injury, and the winner is determined from the scorecards up to that point, under rules that vary by jurisdiction.

**No contest.** The fight ends without an official winner, under certain circumstances set out in the applicable rules.`,
  },
  {
    kind: 'scoring',
    heading: 'Boxing scoring',
    order: 80,
    body: `Most professional boxing is scored using the **ten-point must system**: the winner of a round is typically awarded 10 points and the loser 9, with a more one-sided round, commonly one including a knockdown, scored 10-8.

Judging is not simple punch-counting. Judges generally weigh clean and effective punching, effective aggression, ring generalship (control of the fight's pace, distance and positioning) and defence, in reaching a round score, and two competent judges can reasonably score the same round differently.

The detailed criteria behind those scores, and how judges actually apply them, are covered in the Explainers rather than here.`,
  },
  {
    kind: 'knockdowns',
    heading: 'Knockdowns',
    order: 90,
    body: `A **knockdown** occurs when a fighter touches the canvas with anything other than their feet, or is held up only by the ropes, as a result of a punch. The referee gives a count, commonly counting toward eight before checking the fighter's condition and, depending on the applicable rules, potentially continuing toward a full count of ten if the fighter cannot continue. A fighter who does not rise, or is judged unfit to continue, within the count loses by knockout.

The standing fighter is sent to a **neutral corner** during the count. The detailed rules around standing eight counts, mandatory counts and how they vary between professional and amateur boxing are Explainer material.`,
  },
  {
    kind: 'weight-classes',
    heading: 'Professional weight classes',
    order: 100,
    body: `Professional boxing is organised into weight classes so that fighters compete against opponents of similar size. The traditional men's professional ladder runs, from lightest to heaviest, through divisions including **Minimumweight**, **Light Flyweight**, **Flyweight**, **Super Flyweight**, **Bantamweight**, **Super Bantamweight**, **Featherweight**, **Super Featherweight**, **Lightweight**, **Super Lightweight**, **Welterweight**, **Super Welterweight**, **Middleweight**, **Super Middleweight**, **Light Heavyweight**, **Cruiserweight** and **Heavyweight**, seventeen divisions in total.

Names and weight limits are not identical across every sanctioning body, and women's professional boxing and amateur boxing each use their own division structures rather than a straight mirror of the men's professional ladder. Treat this list as the traditional shape of the sport rather than a single universal standard.`,
  },
  {
    kind: 'multiple-champions',
    heading: 'Why boxing has multiple world champions',
    order: 110,
    body: `Unlike a league sport with one table and one champion, professional boxing has four major sanctioning bodies, the **WBA**, **WBC**, **IBF** and **WBO**, and each can crown its own "world champion" in every weight class. It is entirely possible, and common, for a single division to have four different title-holders at once, none of whom has fought the others.

An **undisputed champion** is a fighter who holds all four major titles in one weight class simultaneously, a genuinely rare and prestigious achievement precisely because it requires beating (or otherwise unifying with) the other three titleholders rather than only defending against a body's own mandatory challengers. A fighter holding more than one but not all four titles is often described as a **unified champion**.`,
  },
  {
    kind: 'sanctioning-bodies',
    heading: 'The major sanctioning bodies',
    order: 120,
    body: `**The WBA (World Boxing Association)**, originally founded as the National Boxing Association in the United States in the early 1920s and renamed in 1962, is the oldest of the four. **The WBC (World Boxing Council)**, founded in Mexico City in 1963, and **the IBF (International Boxing Federation)**, founded in 1983, followed. **The WBO (World Boxing Organization)**, founded in 1988 by a breakaway group from the WBA, is the youngest of the four.

Each body maintains its own rankings, charges promoters sanctioning fees for title fights, names mandatory challengers for its champions, and can additionally recognise interim, regular or "super" champions within a single division depending on its own internal rules, which has drawn criticism for diluting what a "world title" means.

These four organisations are sanctioning and ranking bodies, not a rule-making hierarchy in the way FIFA or the ICC governs their sports. None of them writes a single rulebook the others defer to, and none sits above the others in an organisational sense; they compete with one another for promoters' business as much as they cooperate. This page does not model them as governing bodies for that reason, and treats them instead as the organisations behind the titles boxers actually fight for.`,
  },
  {
    kind: 'terminology-championships',
    heading: 'Championship terminology',
    order: 130,
    body: `**World champion.** The titleholder recognised by a given sanctioning body in a weight class.

**Undisputed champion.** A fighter holding all four major titles (WBA, WBC, IBF, WBO) in one division at once.

**Unified champion.** A fighter holding more than one, but not all four, major titles in one division.

**Interim champion.** A champion recognised temporarily by a sanctioning body, typically because the full champion is unavailable, pending a unification fight.

**Mandatory challenger.** The challenger a sanctioning body requires its champion to face next.

**Vacant title.** A title with no current holder, typically contested between two ranked fighters to fill it.

**Title defence.** A successful fight in which a champion retains their title.

**Former champion.** A fighter who has held a title previously but does not currently hold it.

**Multi-division champion.** A fighter who has won titles in more than one weight class, not necessarily at the same time.`,
  },
  {
    kind: 'belts-titles',
    heading: 'Belts and titles',
    order: 140,
    body: `A championship **belt** is the physical trophy awarded to a titleholder; the **title** is the recognition itself. The two are often used interchangeably in commentary, but a boxer can hold a title without the specific belt being the point of the conversation, and sanctioning bodies have, at times, produced new belt designs for the same title.

Not every belt carries equal prestige. Beyond a body's **world** title, sanctioning organisations also award **regional**, **international**, **continental** and **youth** titles, and various interim or diamond designations, within the same weight class. These lower tiers exist partly to generate sanctioning fees and rankings activity, and a "champion" of one of them is not equivalent to a world titleholder, even though the terminology can make the distinction easy to miss for a newcomer.`,
  },
  {
    kind: 'rankings',
    heading: 'Rankings',
    order: 150,
    body: `Each of the four major sanctioning bodies maintains its own rankings, independently, for every weight class, and the four lists routinely disagree on where a given fighter belongs, or whether they are ranked at all. There is no single universal ranking of professional boxers, in a division or across the sport as a whole.

**Pound for pound** rankings attempt to compare fighters across weight classes, as though weight were not a factor, and are compiled by various media outlets and organisations rather than by any single authoritative body. They are inherently subjective: there is no objective way to compare a heavyweight to a flyweight, and pound-for-pound lists are best understood as informed opinion rather than a settled ranking.`,
  },
  {
    kind: 'matchmaking',
    heading: 'How fights are made',
    order: 160,
    body: `Boxing has no league structure and no fixed schedule of opponents. Each fight is individually negotiated between the fighters' teams, typically involving promoters, managers and, for a title fight, the relevant sanctioning body.

Factors that shape whether and when two boxers fight include each fighter's ranking, a sanctioning body's mandatory-challenger requirements, the commercial appeal of the matchup, the fighters' respective promotional and broadcast contracts, purse bids in some mandatory situations, and simple availability. A highly ranked fighter is not guaranteed a title shot on any fixed timetable, which is a frequent source of frustration among fighters and fans alike, and a large part of why the sport's biggest fights can take years of negotiation to happen at all.`,
  },
  {
    kind: 'promoters-business',
    heading: 'Promoters and the boxing business',
    order: 170,
    body: `Several distinct roles sit behind a professional fight. A **promoter** organises and finances an event, secures a venue and broadcast deal, and is typically the party that puts fights together commercially. A **manager** represents an individual boxer's interests, separately from the promoter, and in some jurisdictions the two roles are required to be held by different people or entities. A **sanctioning body** (the WBA, WBC, IBF or WBO, for a title fight) recognises the bout as being for its title and collects a sanctioning fee. An **athletic commission**, a state or national regulatory body, licenses the event, oversees weigh-ins, appoints officials and enforces safety rules. A **broadcaster or streaming platform** distributes the fight to viewers, commercially separate from all of the above.

These roles can overlap in practice, and disputes between promoters, sanctioning bodies and broadcasters have shaped the sport's business for decades, but the roles themselves are distinct.`,
  },
  {
    kind: 'event-structure',
    heading: 'Event structure',
    order: 180,
    body: `A professional boxing event typically runs from **prelims** (or preliminary bouts), earlier fights usually featuring less prominent boxers and often not televised in full, through the **undercard**, the fights building up to the night's featured bout, to the **main event**, the headline fight the card is built and promoted around. Title fights are commonly placed as the main event.`,
  },
  {
    kind: 'amateur',
    heading: 'Amateur boxing',
    order: 190,
    body: `Amateur boxing is a different environment from the professional game rather than a smaller version of it. Bouts are typically shorter, contested over fewer rounds, and scored on a points basis geared toward landed, legal blows rather than the professional emphasis on effective aggression and ring generalship across a longer fight. Protective headgear has been used at various points in amateur competition, though its use has varied by category and by era.

Amateur boxers commonly represent their country or region in national and international competition, including continental championships and the Olympics, in a structure that more closely resembles other Olympic combat sports than it does the promoter-driven professional game.`,
  },
  {
    kind: 'olympic',
    heading: 'Olympic boxing',
    order: 200,
    body: `Olympic boxing follows a **qualification** process, in which boxers earn places at the Games through continental and world qualifying events, ahead of a single-elimination **tournament bracket** at the Games themselves, contested by weight class through to **medal** bouts.

The specific weight categories contested at the Olympics have changed between Games and are not fixed permanently, so this page does not list a current set. Olympic boxing's governance has also been genuinely unstable in recent years: the International Boxing Association (AIBA, later renamed IBA), the sport's long-standing governing body for Olympic boxing, lost its recognition from the International Olympic Committee in 2019 over governance and integrity concerns, and boxing was retained on the Paris 2024 programme under direct IOC administration rather than through a recognised federation. A new body, World Boxing, formed around 2023-24 and sought recognition in IBA's place. Given how recently and how much this has shifted, this is described here as an approximately known, disputed situation rather than a settled current status.`,
  },
  {
    kind: 'amateur-vs-professional',
    heading: 'Professional versus amateur boxing',
    order: 210,
    body: `Professional and amateur boxing share the same basic idea, punches only, scored by round or by fight, but differ in most of the specifics. Professional bouts are commonly longer, run to 12 rounds for a championship fight, and are scored by judges weighing overall effectiveness across a round. Amateur bouts are commonly shorter, run over fewer rounds, and score more directly on landed, legal blows. Professional boxers fight for sanctioning-body titles, purses and commercial promotion; amateur boxers commonly compete to represent a country or region, with an eye toward continental championships or the Olympics, and a route into the professional ranks. The rules bodies differ too: professional boxing is regulated by athletic commissions and sanctioning bodies, while amateur boxing is regulated by national federations and, at the Olympic level, whichever body currently holds recognition, itself an unsettled question in recent cycles.`,
  },
  {
    kind: 'history',
    heading: 'How boxing developed',
    order: 220,
    body: `Fist-fighting is ancient and was never unique to one place: depictions survive from Sumer, Egypt and elsewhere from well before boxing became a codified sport, and it was contested at the ancient Olympic Games from 688 BC, without gloves, weight classes or a fixed round structure resembling the modern sport.

The direct ancestor of modern boxing is English **prizefighting**, a bare-knuckle spectacle that developed through the 18th century, with early rules drawn up in **1743** to curb the worst injuries. The **London Prize Ring Rules**, developed and revised through the mid-19th century, formalised a roped ring, rounds ending on a knockdown, and a basic rising count, but remained a bare-knuckle sport.

The turning point toward the modern game was the publication of the **Marquess of Queensberry Rules** in **1867**, drafted by John Graham Chambers and issued under the patronage of the 9th Marquess of Queensberry. These introduced three-minute rounds with a one-minute rest, a ten-second count and the use of gloves, and, though the shift from bare-knuckle prizefighting to gloved Queensberry boxing took decades to complete, they are the direct basis of the rules boxing still uses. By the 1890s, gloved professional boxing under this code was the sport's dominant form.

The 20th century saw the sport organise around the sanctioning bodies that still shape it: the forerunner of the WBA in the early 1920s, the WBC in 1963, the IBF in 1983 and the WBO in 1988, expanding a single-champion-per-division sport into one with multiple concurrent titleholders. Through the middle of the century a series of dominant heavyweights and, from the 1960s, **Muhammad Ali**'s career brought the sport its greatest mainstream fame. The **Four Kings**, Sugar Ray Leonard, Roberto Durán, Thomas Hearns and Marvin Hagler, produced a celebrated run of fights across the welterweight and middleweight divisions through the 1980s, and Mike **Tyson**, Evander **Holyfield** and Lennox **Lewis** did the same for the heavyweight division through the 1990s. From the 2000s into the 2010s, Floyd **Mayweather Jr.** and Manny **Pacquiao** became the sport's dominant commercial draws, culminating in their long-awaited 2015 fight. More recently, boxing has moved increasingly onto streaming platforms alongside its traditional pay-per-view model, and women's professional boxing has grown substantially in profile and commercial reach.`,
  },
  {
    kind: 'legends-intro',
    heading: 'Legends',
    order: 230,
    body: `Boxing has no single, agreed greatest fighter of all time, and this page does not attempt to name one. Eras, weight classes, opposition and even scoring conventions have differed too much across more than a century of the modern sport for a single ranking to mean much. What follows instead is a chronological set of figures a newcomer to the sport is likely to hear about, spanning both the men's and women's game, presented in the order their careers unfolded rather than by any ranking.`,
  },
  {
    kind: 'rivalries',
    heading: 'Iconic rivalries',
    order: 240,
    body: `Some of boxing's fights are remembered as much for the rivalry as for any single result. **Muhammad Ali and Joe Frazier** fought three times in the early-to-mid 1970s, including the "Thrilla in Manila", in what is widely regarded as one of the sport's greatest rivalries. **Sugar Ray Leonard and Roberto Durán** fought three times in the early 1980s, split across a Durán win, a controversial Leonard win, and a lopsided Leonard win. **Marvin Hagler and Thomas Hearns** fought only once, in 1985, a single explosive round widely cited among the most intense in the sport's history. **Manny Pacquiao and Juan Manuel Márquez** fought four times across the 2000s and 2010s, a series with a genuinely contested overall result. **Marco Antonio Barrera and Erik Morales** fought three times in the early 2000s across the featherweight and super featherweight divisions, and **Arturo Gatti and Micky Ward** fought three brutal, closely contested fights in the early 2000s. **Evander Holyfield and Riddick Bowe** fought three times in the early 1990s, a heavyweight rivalry that produced one of the decade's most celebrated fights.`,
  },
  {
    kind: 'record-notation',
    heading: 'Fighter record notation',
    order: 250,
    body: `A professional boxer's record is conventionally written as **wins-losses-draws**, for example 40-2-1, with the number of wins by knockout commonly added in parentheses, for example 40-2-1 (28 KOs). **NC** denotes a no contest, a fight that does not count as a win, loss or draw, and is sometimes appended to a record separately. Records are specific to sanctioned professional bouts and do not include amateur results.`,
  },
  {
    kind: 'global',
    heading: 'Boxing around the world',
    order: 260,
    body: `Boxing has deep, long-standing traditions across a wide range of countries, and no single ranking of them is attempted here. The **United States** has produced a large share of the sport's most commercially significant fighters and events across its history. **Mexico** has a celebrated lower-weight tradition and a fan base often described as among the sport's most passionate. The **United Kingdom** has a long prizefighting and boxing history stretching back to the sport's codification and remains a major hub for the sport commercially. **Japan** has a strong tradition, particularly in the lighter weight classes. The **Philippines** produced one of the sport's biggest global stars in Manny Pacquiao and has a substantial domestic following. **Cuba** has an exceptionally strong amateur and Olympic boxing tradition. **Puerto Rico** has produced a large number of world champions relative to its size. **Ukraine** and **Eastern Europe** more broadly have produced a large number of world-class amateur and professional fighters, particularly since the 1990s. **Latin America** beyond Mexico and Puerto Rico, including countries such as Argentina and Panama, has a long history of world champions across the lower weight divisions. This is a description of where the sport has deep roots, not a ranking of countries by strength.`,
  },
  {
    kind: 'comparison',
    heading: 'Boxing and other combat sports',
    order: 270,
    body: `**Boxing** uses punches only, from a standing position, with a brief, referee-broken clinch. **MMA (mixed martial arts)** combines striking, takedowns and ground fighting into a single ruleset, of which boxing-style punching is one component among several. **Muay Thai** adds knees, elbows and clinch striking on top of punches and kicks. **Kickboxing** adds kicks to boxing's punches, with the specific rules varying by promotion and ruleset. **Bare-knuckle boxing**, boxing without padded gloves, has seen a modern revival as its own sanctioned sport, distinct from mainstream gloved boxing and carrying different injury and stoppage patterns as a result.

Each of these is a related but distinct sport rather than a variant of boxing, and none of them shares boxing's specific rules, scoring or governing arrangements.`,
  },
  {
    kind: 'terminology',
    heading: 'Quick terminology',
    order: 280,
    body: `**Jab.** A quick, straight lead-hand punch.

**Cross.** A straight rear-hand punch.

**Hook.** A punch thrown in a horizontal arc.

**Uppercut.** A rising punch thrown at close range.

**Orthodox.** The standard stance, left hand and foot leading, for a right-handed fighter.

**Southpaw.** The mirror stance, right hand and foot leading.

**Knockdown.** A fighter touches the canvas, or is held up only by the ropes, from a punch.

**Knockout.** A fighter cannot rise and continue within the referee's count.

**TKO.** The fight is stopped before a full knockout occurs.

**Clinch.** Close-range grappling contact, broken by the referee.

**Counter.** A punch thrown in response to an opponent's attack.

**Combination.** A sequence of more than one punch thrown together.

**Guard.** The defensive hand and arm position protecting the head and body.

**Corner.** A fighter's team, and the physical corner of the ring where they work between rounds.

**Canvas.** The padded fighting surface of the ring.

**Decision.** A result determined by the judges' scorecards after the fight goes the distance.

**Undisputed.** Holding all four major titles (WBA, WBC, IBF, WBO) in one division at once.

**Mandatory.** The challenger a sanctioning body requires its champion to face next.

**Pound for pound.** An informal, subjective ranking of fighters as though weight were not a factor.

**Weight class.** A division defined by a maximum body weight at the official weigh-in.`,
  },
];

/**
 * Featured entities: legends and titles.
 *
 * `competitions` names the four sanctioning bodies' world championships and
 * the Olympic tournament as prose entries, consistent with how
 * `boxing-competitions.ts` models them: the title a boxer actually wins, not
 * the organisation itself. Where the database holds a matching competition
 * entity the card still resolves via `slug`, following the optimistic-slug
 * pattern used elsewhere in this directory.
 *
 * `icons` is deliberately chronological rather than ranked, spanning both the
 * men's and women's game across eras, per the brief's explicit instruction
 * not to construct a single GOAT ordering. No currently-active-only figure is
 * presented here as though ranked; modern stars belong to the live Fighters
 * tab, which this page does not attempt to simulate.
 */
export const BOXING_FEATURED: FeaturedEntitySeed[] = [
  // ── Major titles ──────────────────────────────────────────────────────────
  {
    section: 'competitions',
    entityType: 'competition',
    slug: 'wbc-world-championship',
    name: 'WBC World Championship',
    meta: 'World Boxing Council · founded 1963',
    blurb:
      'One of the four major sanctioning bodies’ world titles, contested across roughly seventeen divisions.',
    order: 10,
  },
  {
    section: 'competitions',
    entityType: 'competition',
    slug: 'wba-world-championship',
    name: 'WBA World Championship',
    meta: 'World Boxing Association · founded 1921',
    blurb: 'The oldest of the four major sanctioning bodies’ world titles.',
    order: 20,
  },
  {
    section: 'competitions',
    entityType: 'competition',
    slug: 'ibf-world-championship',
    name: 'IBF World Championship',
    meta: 'International Boxing Federation · founded 1983',
    blurb: 'One of the four major sanctioning bodies’ world titles.',
    order: 30,
  },
  {
    section: 'competitions',
    entityType: 'competition',
    slug: 'wbo-world-championship',
    name: 'WBO World Championship',
    meta: 'World Boxing Organization · founded 1988',
    blurb: 'The youngest of the four major sanctioning bodies’ world titles.',
    order: 40,
  },
  {
    section: 'competitions',
    entityType: 'competition',
    slug: 'the-ring-championship',
    name: 'The Ring Championship',
    meta: 'The Ring magazine · founded 1922',
    blurb:
      'A lineal championship awarded by a magazine rather than a sanctioning body, based on who beat whom rather than a sanctioning fee.',
    order: 50,
  },
  {
    section: 'competitions',
    entityType: 'competition',
    slug: 'olympic-boxing',
    name: 'Boxing at the Summer Olympics',
    meta: 'Amateur · since 1904',
    blurb:
      'The amateur sport’s pinnacle event and the route most professionals arrive by, contested as a single-elimination tournament by weight class.',
    order: 60,
  },

  // ── Legends, chronological rather than ranked ───────────────────────────
  {
    section: 'icons',
    entityType: 'person',
    slug: 'jack-johnson',
    name: 'Jack Johnson',
    meta: 'United States · heavyweight · 1897–1938',
    blurb:
      'The first Black heavyweight world champion, a hugely significant and controversial figure in and beyond the ring in the early 20th century.',
    order: 10,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'jack-dempsey',
    name: 'Jack Dempsey',
    meta: 'United States · heavyweight · 1914–1927',
    blurb:
      'A dominant, aggressive heavyweight champion of the 1920s whose fights drew some of the largest live crowds boxing had seen.',
    order: 20,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'joe-louis',
    name: 'Joe Louis',
    meta: 'United States · heavyweight · 1934–1951',
    blurb:
      'Held the heavyweight title for nearly twelve years, the longest single reign in the division’s history, defending it a record number of times.',
    order: 30,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'sugar-ray-robinson',
    name: 'Sugar Ray Robinson',
    meta: 'United States · welterweight, middleweight · 1940–1965',
    blurb:
      'Widely cited as a standard-setter for pound-for-pound greatness, holding titles at two weights across a career spanning a quarter of a century.',
    order: 40,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'rocky-marciano',
    name: 'Rocky Marciano',
    meta: 'United States · heavyweight · 1947–1955',
    blurb:
      'Retired as heavyweight champion with an undefeated professional record, one of the few champions in any weight class to do so.',
    order: 50,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'muhammad-ali',
    name: 'Muhammad Ali',
    meta: 'United States · heavyweight · 1960–1981',
    blurb:
      'A three-time heavyweight champion whose fighting and cultural and political significance made him one of the most famous athletes in the world.',
    order: 60,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'joe-frazier',
    name: 'Joe Frazier',
    meta: 'United States · heavyweight · 1965–1981',
    blurb:
      'An Olympic gold medallist and heavyweight champion whose three fights with Muhammad Ali defined an era of the division.',
    order: 70,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'george-foreman',
    name: 'George Foreman',
    meta: 'United States · heavyweight · 1969–1997',
    blurb:
      'A heavyweight champion in two separate eras two decades apart, the second reign making him the oldest heavyweight champion in history at the time.',
    order: 80,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'sugar-ray-leonard',
    name: 'Sugar Ray Leonard',
    meta: 'United States · welterweight, middleweight · 1977–1997',
    blurb:
      'A central figure of the 1980s "Four Kings" era, winning world titles across multiple weight divisions.',
    order: 90,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'roberto-duran',
    name: 'Roberto Durán',
    meta: 'Panama · lightweight through middleweight · 1968–2001',
    blurb:
      'Won world titles across four weight divisions in a career spanning more than three decades, part of the "Four Kings" rivalries of the 1980s.',
    order: 100,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'thomas-hearns',
    name: 'Thomas Hearns',
    meta: 'United States · welterweight through light heavyweight · 1977–1997',
    blurb:
      'Won world titles across an unusually wide span of weight divisions, and fought in several of the "Four Kings" era’s defining bouts.',
    order: 110,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'marvin-hagler',
    name: 'Marvin Hagler',
    meta: 'United States · middleweight · 1973–1987',
    blurb:
      'A long-reigning, dominant middleweight champion whose 1985 fight with Thomas Hearns is among the most celebrated single rounds in the sport.',
    order: 120,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'mike-tyson',
    name: 'Mike Tyson',
    meta: 'United States · heavyweight · 1985–2005',
    blurb:
      'Became the youngest heavyweight champion in history and one of the most feared punchers the division has produced.',
    order: 130,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'evander-holyfield',
    name: 'Evander Holyfield',
    meta: 'United States · cruiserweight, heavyweight · 1984–2011',
    blurb:
      'A four-time heavyweight world champion and former undisputed cruiserweight champion, central to the sport’s 1990s heavyweight era.',
    order: 140,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'lennox-lewis',
    name: 'Lennox Lewis',
    meta: 'United Kingdom · heavyweight · 1989–2003',
    blurb:
      'Retired as undisputed heavyweight champion, widely regarded as the leading heavyweight of the 1990s and early 2000s.',
    order: 150,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'julio-cesar-chavez',
    name: 'Julio César Chávez',
    meta: 'Mexico · lightweight through super lightweight · 1980–2005',
    blurb:
      'Went unbeaten for the better part of a decade and is widely regarded as Mexico’s greatest boxer.',
    order: 160,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'roy-jones-jr',
    name: 'Roy Jones Jr.',
    meta: 'United States · middleweight through heavyweight · 1989–2018',
    blurb:
      'Won world titles across four weight divisions, including a heavyweight title win widely praised for its rarity for a fighter of his size.',
    order: 170,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'bernard-hopkins',
    name: 'Bernard Hopkins',
    meta: 'United States · middleweight, light heavyweight · 1988–2016',
    blurb:
      'Set records for consecutive middleweight title defences and later became the oldest man to win a world title, at light heavyweight.',
    order: 180,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'claressa-shields',
    name: 'Claressa Shields',
    meta: 'United States · middleweight and above · 2012–present',
    blurb:
      'A two-time Olympic gold medallist who became an undisputed champion across multiple weight divisions as a professional.',
    order: 190,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'floyd-mayweather-jr',
    name: 'Floyd Mayweather Jr.',
    meta: 'United States · super featherweight through light middleweight · 1996–2017',
    blurb:
      'Retired with an undefeated professional record and won world titles across five weight divisions, the dominant commercial draw of his era.',
    order: 200,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'manny-pacquiao',
    name: 'Manny Pacquiao',
    meta: 'Philippines · flyweight through light middleweight · 1995–present',
    blurb:
      'Won world titles across a record eight weight divisions and became one of the sport’s biggest global stars, alongside a career in Philippine politics.',
    order: 210,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'katie-taylor',
    name: 'Katie Taylor',
    meta: 'Ireland · lightweight and above · 2016–present',
    blurb:
      'An Olympic gold medallist who became an undisputed professional champion and one of women’s boxing’s biggest draws.',
    order: 220,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'cecilia-braekhus',
    name: 'Cecilia Brækhus',
    meta: 'Norway · welterweight · 2007–present',
    blurb:
      'Held all four major welterweight titles simultaneously for close to a decade, among the longest undisputed title reigns in the sport, men’s or women’s.',
    order: 230,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'laila-ali',
    name: 'Laila Ali',
    meta: 'United States · super middleweight, light heavyweight · 1999–2007',
    blurb:
      'Retired undefeated as a multi-division champion, and was among the fighters most responsible for raising women’s professional boxing’s profile in the 2000s.',
    order: 240,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'christy-martin',
    name: 'Christy Martin',
    meta: 'United States · lightweight, welterweight · 1989–2012',
    blurb:
      'One of the first women boxers to headline major pay-per-view cards, a significant figure in bringing women’s boxing into the mainstream in the 1990s.',
    order: 250,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'amanda-serrano',
    name: 'Amanda Serrano',
    meta: 'Puerto Rico · featherweight and others · 2009–present',
    blurb:
      'Won world titles across a record number of weight divisions in women’s boxing and headlined one of the sport’s most significant women’s cards.',
    order: 260,
  },
];
