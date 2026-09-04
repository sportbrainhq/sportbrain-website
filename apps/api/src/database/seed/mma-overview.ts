/**
 * Mixed martial arts overview content.
 *
 * The eighth sport through the machinery built for football, cricket,
 * basketball, tennis, Formula 1, golf and American football, and the first
 * combat sport. The seed shapes are imported rather than redefined, and the
 * page renders them with the same sport-agnostic components.
 *
 * ## Governance: there isn't any, in the sense the schema wants
 *
 * `GoverningBodySeed` was built for a body that writes the rules of a sport
 * and recognises the organisations that play under them: FIFA, FIBA, the ICC,
 * the R&A/USGA, even the NFL at a stretch. MMA has nothing that plays that
 * role globally. The closest thing to a rulebook, the Unified Rules of Mixed
 * Martial Arts, is a US state athletic-commission standard that promotions
 * choose to follow; there is no single body that writes it and no body every
 * promotion answers to. IMMAF exists and governs amateur MMA and pursues
 * Olympic recognition, but it has no authority over the professional
 * promotions this page is mostly about.
 *
 * Rather than force a promotion into a `governingBody` row it would misdescribe
 * (a promotion runs events and signs fighters; it does not recognise member
 * federations the way a governing body does), the governance table is seeded
 * thin: IMMAF as the one body that fits the shape, at `world` level, with a
 * short prose explanation of why nothing else appears there. The promotions
 * themselves, UFC included, are covered as prose and as `FeaturedEntitySeed`
 * rows under `competitions`, the same way golf keeps its tours out of the
 * governance tree.
 *
 * ## What is deliberately absent, and why
 *
 * Following golf's and American football's precedent for durable-vs-live
 * content:
 *
 *   - **No current champions, no current rankings, no current records.** A
 *     champion listed here is one title fight from being wrong, and this page
 *     has no mechanism to update on a Saturday night. Weight-class cards name
 *     the division, not who holds it; the Fighters and Competitions tabs carry
 *     whoever actually holds a belt right now.
 *   - **No detailed technique.** Submissions, guard positions, striking
 *     technique, judging criteria, wrestling entries and weight-cutting
 *     practice are named where the vocabulary requires it and taught nowhere
 *     on this page; all of it is Explainer material, and `explainerSlug` is
 *     set optimistically on the relevant concepts even though most of those
 *     explainers do not exist yet, in the pattern this directory already uses.
 *   - **No single GOAT list.** The Legends section is chronological, grouped
 *     loosely by era and division rather than ranked, for the same reason
 *     golf declines to rank its majors-count leaders against each other:
 *     eras, weight classes and eras of judging differ enough that a single
 *     ordering would assert more than the sport agrees on.
 *
 * ## UFC is a promotion, not a synonym for the sport
 *
 * The brief is explicit about this and it is worth restating here: UFC is the
 * largest and most prominent MMA promotion, not the sport itself. PFL, ONE
 * Championship, Bellator (folded into PFL in 2024) and Rizin are real,
 * separate promotions with their own rosters, rules and rankings. The prose
 * introduces MMA before it introduces the UFC, and the UFC section itself
 * says plainly that it is a promotion within MMA rather than the sport's
 * governing body.
 *
 * ## On sourcing
 *
 * Dates were checked rather than recalled:
 *
 *   - **UFC 1** was held on 3 November 1993 in Denver, Colorado, conceived
 *     partly to showcase Brazilian jiu-jitsu via Royce Gracie, who won the
 *     event. It was a single-night, minimal-rules tournament, not run under
 *     anything resembling the modern Unified Rules.
 *   - **Vale tudo** ("anything goes") predates the UFC by decades as a
 *     Brazilian combat tradition and is recorded as a precursor, not as MMA
 *     itself under an earlier name.
 *   - **Pancrase and Shooto**, Japanese hybrid promotions, began in 1993 and
 *     the mid-1980s respectively, developing in parallel with the American
 *     scene rather than descending from it.
 *   - The **Unified Rules of Mixed Martial Arts** were first adopted by the
 *     New Jersey State Athletic Control Board in 2001, a point usually cited
 *     as when the sport began standardising weight classes, fouls and
 *     officiating across what had been a patchwork of promotion-specific
 *     rules.
 *   - The **UFC was sold to Zuffa** (Frank and Lorenzo Fertitta, with Dana
 *     White) in 2001, a purchase widely credited with funding the push for
 *     regulatory acceptance and cable/PPV distribution that followed.
 *   - **The Ultimate Fighter** debuted in 2005 on Spike TV and is generally
 *     credited with turning the promotion's finances around after years of
 *     losses.
 *   - The **WEC merged into the UFC** in 2010–11, which is when the UFC
 *     absorbed the lighter weight classes (bantamweight, featherweight) it
 *     had not previously contested.
 *   - **Ronda Rousey's UFC debut**, in February 2013, marked the promotion's
 *     first women's division; women's MMA existed earlier in other
 *     promotions, chiefly Strikeforce, and the timeline says so rather than
 *     crediting the UFC with inventing it.
 *   - **WME-IMG bought the UFC** in 2016 for a reported $4.025 billion, at the
 *     time among the largest sports-franchise sales on record.
 *   - **PFL acquired Bellator** in November 2023, with the deal closing in
 *     2024 and Bellator's roster and library folded into PFL rather than the
 *     brand continuing to run events independently.
 *
 * ## Modelling notes specific to this sport
 *
 * `MMA_FORMATS` covers rulesets and match classes (professional, amateur,
 * and the small number of named variants such as grappling-only or catch
 * weight bouts) rather than a tournament-vs-league taxonomy, since MMA has
 * no equivalent of Test-vs-T20; nearly all professional MMA is single bouts
 * on a promoted card. `MMA_MEMBERSHIP` is omitted for the same reason as
 * American football's: no promotion grades its roster into membership tiers
 * the way a federation grades member associations.
 */

import type { GoverningBodySeed, SectionSeed, SourceSeed, TimelineSeed } from './football-overview';
import type { ConceptSeed, FactSeed, FormatSeed } from './cricket-overview';
import type { FeaturedEntitySeed } from './basketball-overview';

export const MMA_SOURCES: SourceSeed[] = [
  {
    key: 'wp-mma',
    provider: 'wikipedia',
    title: 'Mixed martial arts',
    url: 'https://en.wikipedia.org/wiki/Mixed_martial_arts',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-history-mma',
    provider: 'wikipedia',
    title: 'History of mixed martial arts',
    url: 'https://en.wikipedia.org/wiki/History_of_mixed_martial_arts',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-vale-tudo',
    provider: 'wikipedia',
    title: 'Vale tudo',
    url: 'https://en.wikipedia.org/wiki/Vale_tudo',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-shooto',
    provider: 'wikipedia',
    title: 'Shooto',
    url: 'https://en.wikipedia.org/wiki/Shooto',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-pancrase',
    provider: 'wikipedia',
    title: 'Pancrase',
    url: 'https://en.wikipedia.org/wiki/Pancrase',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-ufc',
    provider: 'wikipedia',
    title: 'Ultimate Fighting Championship',
    url: 'https://en.wikipedia.org/wiki/Ultimate_Fighting_Championship',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-ufc-1',
    provider: 'wikipedia',
    title: 'UFC 1',
    url: 'https://en.wikipedia.org/wiki/UFC_1',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-unified-rules',
    provider: 'wikipedia',
    title: 'Unified Rules of Mixed Martial Arts',
    url: 'https://en.wikipedia.org/wiki/Unified_Rules_of_Mixed_Martial_Arts',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-zuffa',
    provider: 'wikipedia',
    title: 'Zuffa',
    url: 'https://en.wikipedia.org/wiki/Zuffa',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-tuf',
    provider: 'wikipedia',
    title: 'The Ultimate Fighter',
    url: 'https://en.wikipedia.org/wiki/The_Ultimate_Fighter',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-wec',
    provider: 'wikipedia',
    title: 'World Extreme Cagefighting',
    url: 'https://en.wikipedia.org/wiki/World_Extreme_Cagefighting',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-strikeforce',
    provider: 'wikipedia',
    title: 'Strikeforce (mixed martial arts)',
    url: 'https://en.wikipedia.org/wiki/Strikeforce_(mixed_martial_arts)',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-rousey',
    provider: 'wikipedia',
    title: 'Ronda Rousey',
    url: 'https://en.wikipedia.org/wiki/Ronda_Rousey',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-wme-img',
    provider: 'wikipedia',
    title: 'Endeavor (company)',
    url: 'https://en.wikipedia.org/wiki/Endeavor_(company)',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-pfl',
    provider: 'wikipedia',
    title: 'Professional Fighters League',
    url: 'https://en.wikipedia.org/wiki/Professional_Fighters_League',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-bellator',
    provider: 'wikipedia',
    title: 'Bellator MMA',
    url: 'https://en.wikipedia.org/wiki/Bellator_MMA',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-one',
    provider: 'wikipedia',
    title: 'ONE Championship',
    url: 'https://en.wikipedia.org/wiki/ONE_Championship',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-rizin',
    provider: 'wikipedia',
    title: 'Rizin Fighting Federation',
    url: 'https://en.wikipedia.org/wiki/Rizin_Fighting_Federation',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-immaf',
    provider: 'wikipedia',
    title: 'International Mixed Martial Arts Federation',
    url: 'https://en.wikipedia.org/wiki/International_Mixed_Martial_Arts_Federation',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-weight-class',
    provider: 'wikipedia',
    title: 'Mixed martial arts weight classes',
    url: 'https://en.wikipedia.org/wiki/Mixed_martial_arts_weight_classes',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-octagon',
    provider: 'wikipedia',
    title: 'Octagon (mixed martial arts)',
    url: 'https://en.wikipedia.org/wiki/Octagon_(mixed_martial_arts)',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-tko',
    provider: 'wikipedia',
    title: 'Technical knockout',
    url: 'https://en.wikipedia.org/wiki/Technical_knockout',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-submission',
    provider: 'wikipedia',
    title: 'Submission (combat sports)',
    url: 'https://en.wikipedia.org/wiki/Submission_(combat_sports)',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-ten-point-must',
    provider: 'wikipedia',
    title: 'Ten-point must system',
    url: 'https://en.wikipedia.org/wiki/Ten-point_must_system',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-bjj',
    provider: 'wikipedia',
    title: 'Brazilian jiu-jitsu',
    url: 'https://en.wikipedia.org/wiki/Brazilian_jiu-jitsu',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-muay-thai',
    provider: 'wikipedia',
    title: 'Muay Thai',
    url: 'https://en.wikipedia.org/wiki/Muay_Thai',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-wrestling',
    provider: 'wikipedia',
    title: 'Wrestling',
    url: 'https://en.wikipedia.org/wiki/Wrestling',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-sambo',
    provider: 'wikipedia',
    title: 'Sambo (martial art)',
    url: 'https://en.wikipedia.org/wiki/Sambo_(martial_art)',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wd-mma',
    provider: 'wikidata',
    title: 'Mixed martial arts (Q114466)',
    url: 'https://www.wikidata.org/wiki/Q114466',
    externalId: 'Q114466',
    license: 'CC0',
  },
  {
    key: 'wd-ufc',
    provider: 'wikidata',
    title: 'Ultimate Fighting Championship (Q186428)',
    url: 'https://www.wikidata.org/wiki/Q186428',
    externalId: 'Q186428',
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
export const MMA_FACTS: FactSeed[] = [
  {
    key: 'sport-type',
    label: 'Sport type',
    value: 'Full-contact combat sport combining striking and grappling',
    category: 'identity',
    sourceKey: 'wp-mma',
    order: 10,
  },
  {
    key: 'competitors',
    label: 'Competitors',
    value: '1 vs 1',
    category: 'identity',
    sourceKey: 'wp-mma',
    order: 20,
  },
  {
    key: 'fight-area',
    label: 'Fight area',
    value: 'Cage or ring, depending on the promotion',
    category: 'identity',
    sourceKey: 'wp-octagon',
    order: 30,
  },
  {
    key: 'major-promotion',
    label: 'Largest global promotion',
    value: 'UFC',
    category: 'identity',
    sourceKey: 'wp-ufc',
    order: 40,
  },
  {
    key: 'first-event',
    label: 'First UFC event',
    value: '1993',
    category: 'identity',
    sourceKey: 'wp-ufc-1',
    order: 50,
  },
  {
    key: 'core-disciplines',
    label: 'Core disciplines',
    value: 'Striking, wrestling, grappling',
    category: 'identity',
    sourceKey: 'wp-mma',
    order: 60,
  },

  {
    key: 'fight-length',
    label: 'Standard fight',
    value: 'Usually 3 rounds of 5 minutes',
    category: 'gameplay',
    sourceKey: 'wp-mma',
    order: 110,
  },
  {
    key: 'championship-length',
    label: 'Championship / main-event fight',
    value: 'Usually 5 rounds of 5 minutes',
    category: 'gameplay',
    sourceKey: 'wp-mma',
    order: 120,
  },
  {
    key: 'ways-to-win',
    label: 'Ways to win',
    value: 'Knockout, technical knockout, submission, decision, disqualification, doctor stoppage',
    category: 'gameplay',
    sourceKey: 'wp-mma',
    order: 130,
  },
  {
    key: 'scoring-system',
    label: 'Judging basis',
    value: 'Round-based, derived from the ten-point must system',
    category: 'gameplay',
    sourceKey: 'wp-ten-point-must',
    order: 140,
  },
  {
    key: 'weight-classes',
    label: 'Weight classes',
    value: 'Multiple, defined separately by each promotion',
    category: 'gameplay',
    sourceKey: 'wp-weight-class',
    order: 150,
  },
];

export const MMA_TIMELINE: TimelineSeed[] = [
  {
    year: 1800,
    endYear: 1900,
    title: 'Cross-style contests before MMA had a name',
    shortDescription:
      'Fighters and traditions across multiple societies staged contests pitting one fighting style against another, and Brazil in particular developed vale tudo ("anything goes") as a distinct no-holds-barred tradition. None of this is MMA under an earlier name; the modern sport did not descend from any one of them directly.',
    category: 'origins',
    certainty: 'approximate',
    sourceKey: 'wp-vale-tudo',
    order: 10,
  },
  {
    year: 1925,
    endYear: 1993,
    title: 'Vale tudo and Japanese hybrid promotions develop in parallel',
    shortDescription:
      'The Gracie family popularised vale tudo challenge matches in Brazil from the 1920s onward, testing Brazilian jiu-jitsu against other styles. In Japan, Shooto (mid-1980s) and Pancrase (1993) staged hybrid striking-and-grappling contests independently of the American scene that would soon emerge.',
    category: 'origins',
    certainty: 'approximate',
    sourceKey: 'wp-shooto',
    order: 20,
  },
  {
    year: 1993,
    title: 'UFC 1',
    shortDescription:
      'The Ultimate Fighting Championship staged its first event in Denver, Colorado, on 3 November 1993, framed as a tournament to find which fighting style was most effective. Royce Gracie won using Brazilian jiu-jitsu, introducing ground grappling to a wide American audience. The rules bore little resemblance to the modern sport.',
    category: 'competition',
    isMajorMilestone: true,
    certainty: 'established',
    sourceKey: 'wp-ufc-1',
    order: 30,
  },
  {
    year: 2001,
    title: 'The Unified Rules of Mixed Martial Arts are adopted',
    shortDescription:
      'The New Jersey State Athletic Control Board adopted the Unified Rules, standardising weight classes, fouls, rounds and officiating. Other US state athletic commissions gradually adopted the same standard, replacing a patchwork of promotion-specific rules and giving the sport a path to regulatory acceptance.',
    category: 'governance',
    isMajorMilestone: true,
    certainty: 'established',
    sourceKey: 'wp-unified-rules',
    order: 40,
  },
  {
    year: 2001,
    title: 'Zuffa buys the UFC',
    shortDescription:
      'Frank and Lorenzo Fertitta, with Dana White, purchased the struggling promotion and funded its push for state athletic commission sanctioning and, eventually, cable and pay-per-view distribution.',
    category: 'governance',
    isMajorMilestone: true,
    certainty: 'established',
    sourceKey: 'wp-zuffa',
    order: 50,
  },
  {
    year: 2005,
    title: 'The Ultimate Fighter debuts',
    shortDescription:
      'A reality competition series following fighters through a UFC contract tournament, credited with turning the promotion’s finances around after years of losses and introducing MMA to a much larger television audience.',
    category: 'growth',
    isMajorMilestone: true,
    certainty: 'established',
    sourceKey: 'wp-tuf',
    order: 60,
  },
  {
    year: 2006,
    endYear: 2011,
    title: 'Strikeforce and the growth of women’s MMA',
    shortDescription:
      'Strikeforce, a rival American promotion, staged the sport’s first widely televised women’s bouts, ahead of the UFC, which did not add a women’s division until 2013. The UFC acquired Strikeforce in 2011.',
    category: 'growth',
    certainty: 'approximate',
    sourceKey: 'wp-strikeforce',
    order: 70,
  },
  {
    year: 2011,
    title: 'The WEC merges into the UFC',
    shortDescription:
      'World Extreme Cagefighting, a sister promotion under the same ownership, folded into the UFC, which absorbed its lighter weight classes, bantamweight and featherweight, that the UFC had not previously contested.',
    category: 'governance',
    certainty: 'established',
    sourceKey: 'wp-wec',
    order: 80,
  },
  {
    year: 2013,
    title: 'The UFC adds a women’s division',
    shortDescription:
      'Ronda Rousey’s UFC debut in February 2013 marked the promotion’s first women’s bout and division. Women’s MMA existed earlier elsewhere, chiefly in Strikeforce, and Rousey herself moved from that promotion.',
    category: 'growth',
    isMajorMilestone: true,
    certainty: 'established',
    sourceKey: 'wp-rousey',
    order: 90,
  },
  {
    year: 2016,
    title: 'WME-IMG buys the UFC',
    shortDescription:
      'A reported $4.025 billion sale to the talent and media agency WME-IMG (later Endeavor), at the time among the largest sports-franchise transactions on record, reflecting the promotion’s growth from its near-collapse in the early 2000s.',
    category: 'governance',
    isMajorMilestone: true,
    certainty: 'established',
    sourceKey: 'wp-wme-img',
    order: 100,
  },
  {
    year: 2018,
    endYear: 2026,
    title: 'MMA becomes increasingly global',
    shortDescription:
      'Promotions including ONE Championship, PFL and Rizin expanded MMA’s footprint across Asia and beyond the promotions historically centred on the United States and Brazil, while regional scenes in Russia, the Caucasus, Europe and elsewhere produced growing numbers of top-level fighters.',
    category: 'global',
    certainty: 'approximate',
    sourceKey: 'wp-one',
    order: 110,
  },
  {
    year: 2023,
    endYear: 2024,
    title: 'PFL acquires Bellator',
    shortDescription:
      'The Professional Fighters League agreed to acquire Bellator MMA in November 2023, with the deal closing in 2024 and Bellator’s roster and library folded into PFL rather than the brand continuing to run its own events, consolidating two of the largest promotions outside the UFC.',
    category: 'governance',
    isMajorMilestone: true,
    certainty: 'established',
    sourceKey: 'wp-pfl',
    order: 120,
  },
];

/**
 * Governance.
 *
 * See the file-level doc comment for why this table is thin. IMMAF is the one
 * body that fits the schema's shape, governing amateur MMA and pursuing
 * Olympic recognition; it has no authority over the professional promotions
 * that dominate the sport commercially, and the prose says so.
 */
export const MMA_GOVERNANCE: GoverningBodySeed[] = [
  {
    slug: 'immaf',
    shortName: 'IMMAF',
    name: 'International Mixed Martial Arts Federation',
    level: 'world',
    foundedYear: 2012,
    headquarters: 'London, United Kingdom',
    websiteUrl: 'https://immaf.org',
    order: 10,
  },
];

/**
 * Formats.
 *
 * MMA has no equivalent of a Test-vs-T20 split; nearly all professional MMA
 * is single bouts on a promoted card. What varies is the ruleset and level of
 * competition, so `matchClass` marks that split rather than a match-type
 * taxonomy, in the same shallow-pathway spirit as American football's.
 */
export const MMA_FORMATS: FormatSeed[] = [
  {
    key: 'professional',
    label: 'Professional MMA',
    matchClass: 'level',
    isInternational: false,
    description:
      'Fights under professional contracts, recorded in an official professional record, sanctioned by a state or national athletic commission under a ruleset such as the Unified Rules.',
    conditionsAuthority: 'athletic commission',
    sourceKey: 'wp-unified-rules',
    order: 10,
  },
  {
    key: 'amateur',
    label: 'Amateur MMA',
    matchClass: 'level',
    isInternational: false,
    description:
      'Developmental competition, often with modified rules (such as restrictions on strikes to a grounded opponent), and the pathway most professional fighters come through.',
    conditionsAuthority: 'IMMAF or local body',
    sourceKey: 'wp-immaf',
    order: 20,
  },
  {
    key: 'grappling',
    label: 'Grappling-only rules',
    matchClass: 'ruleset-variant',
    isInternational: false,
    description:
      'A no-striking variant, contested under some promotions and used in developmental and submission-only events, that isolates the wrestling and jiu-jitsu components of the sport.',
    sourceKey: 'wp-mma',
    order: 30,
  },
];

/**
 * The vocabulary.
 *
 * One or two sentences each. These are the terms a broadcast uses without
 * explaining them; anything needing a paragraph, how judges actually score a
 * round, submission mechanics, wrestling entries, weight cutting, belongs in
 * an Explainer. `explainerSlug` is set optimistically throughout: the API
 * drops a link to a slug that does not resolve rather than rendering a broken
 * one.
 */
export const MMA_CONCEPTS: ConceptSeed[] = [
  {
    key: 'ko',
    term: 'Knockout (KO)',
    summary: 'A fighter is rendered unable to intelligently continue by a legal strike.',
    category: 'result',
    explainerSlug: 'every-mma-fight-result-explained',
    sourceKey: 'wp-tko',
    order: 10,
  },
  {
    key: 'tko',
    term: 'Technical knockout (TKO)',
    summary:
      'The referee, a doctor or a fighter’s corner stops the fight, short of a fighter being fully knocked out, because they can no longer intelligently defend themselves.',
    category: 'result',
    explainerSlug: 'every-mma-fight-result-explained',
    sourceKey: 'wp-tko',
    order: 20,
  },
  {
    key: 'submission',
    term: 'Submission',
    summary:
      'A fighter taps or verbally submits, or the referee intervenes, ending the fight immediately.',
    category: 'result',
    explainerSlug: 'every-mma-fight-result-explained',
    sourceKey: 'wp-submission',
    order: 30,
  },
  {
    key: 'decision',
    term: 'Decision',
    summary: 'Judges determine the winner after the scheduled rounds are completed with no finish.',
    category: 'result',
    explainerSlug: 'how-mma-judging-works',
    sourceKey: 'wp-ten-point-must',
    order: 40,
  },
  {
    key: 'tap',
    term: 'Tap',
    summary:
      'The physical signal, tapping the mat, the opponent or oneself, that ends a fight by submission.',
    category: 'gameplay',
    sourceKey: 'wp-submission',
    order: 50,
  },
  {
    key: 'takedown',
    term: 'Takedown',
    summary:
      'Bringing an opponent from standing to the ground, often to move a fight into a fighter’s stronger area.',
    category: 'gameplay',
    explainerSlug: 'mma-positions-and-techniques-explained',
    sourceKey: 'wp-wrestling',
    order: 60,
  },
  {
    key: 'clinch',
    term: 'Clinch',
    summary:
      'Close-range standing contact, used to control an opponent, strike at short range or set up a takedown.',
    category: 'gameplay',
    explainerSlug: 'mma-positions-and-techniques-explained',
    sourceKey: 'wp-mma',
    order: 70,
  },
  {
    key: 'guard',
    term: 'Guard',
    summary:
      'A ground position in which a fighter on their back uses their legs to control the opponent above them.',
    category: 'gameplay',
    explainerSlug: 'mma-positions-and-techniques-explained',
    sourceKey: 'wp-bjj',
    order: 80,
  },
  {
    key: 'mount',
    term: 'Mount',
    summary: 'A dominant ground position, sitting astride an opponent who is on their back.',
    category: 'gameplay',
    explainerSlug: 'mma-positions-and-techniques-explained',
    sourceKey: 'wp-bjj',
    order: 90,
  },
  {
    key: 'back-control',
    term: 'Back control',
    summary:
      'A dominant position behind an opponent, from which strikes and submissions are hard to defend.',
    category: 'gameplay',
    explainerSlug: 'mma-positions-and-techniques-explained',
    sourceKey: 'wp-bjj',
    order: 100,
  },
  {
    key: 'ground-and-pound',
    term: 'Ground-and-pound',
    summary: 'Striking an opponent while in a dominant position on the ground.',
    category: 'gameplay',
    explainerSlug: 'mma-positions-and-techniques-explained',
    sourceKey: 'wp-mma',
    order: 110,
  },
  {
    key: 'sprawl',
    term: 'Sprawl',
    summary: 'A defensive movement that drops the hips to stop a takedown attempt.',
    category: 'gameplay',
    sourceKey: 'wp-wrestling',
    order: 120,
  },
  {
    key: 'striking',
    term: 'Striking',
    summary: 'Fighting while standing, with punches, kicks, knees and elbows.',
    category: 'gameplay',
    sourceKey: 'wp-mma',
    order: 130,
  },
  {
    key: 'grappling',
    term: 'Grappling',
    summary:
      'Fighting through holds, control and submissions rather than strikes, chiefly on the ground.',
    category: 'gameplay',
    sourceKey: 'wp-bjj',
    order: 140,
  },
  {
    key: 'split-decision',
    term: 'Split decision',
    summary: 'A decision in which the judges do not agree unanimously on the winner.',
    category: 'result',
    explainerSlug: 'how-mma-judging-works',
    sourceKey: 'wp-ten-point-must',
    order: 150,
  },
  {
    key: 'unanimous-decision',
    term: 'Unanimous decision',
    summary: 'A decision in which all judges score the fight for the same fighter.',
    category: 'result',
    explainerSlug: 'how-mma-judging-works',
    sourceKey: 'wp-ten-point-must',
    order: 160,
  },
  {
    key: 'weight-cut',
    term: 'Weight cut',
    summary:
      'The process of losing weight before an official weigh-in in order to compete in a lighter division, then recovering much of it before the fight.',
    category: 'preparation',
    explainerSlug: 'mma-weight-cutting-explained',
    sourceKey: 'wp-weight-class',
    order: 170,
  },
  {
    key: 'fight-camp',
    term: 'Fight camp',
    summary:
      'The dedicated training period, typically several weeks, that a fighter undertakes before a bout.',
    category: 'preparation',
    sourceKey: 'wp-mma',
    order: 180,
  },
  {
    key: 'title-shot',
    term: 'Title shot',
    summary: 'An opportunity to fight for a promotion’s championship in a given weight division.',
    category: 'competition',
    sourceKey: 'wp-ufc',
    order: 190,
  },
  {
    key: 'champion',
    term: 'Champion',
    summary:
      'The fighter currently recognised by a promotion as the best in a given weight division.',
    category: 'competition',
    sourceKey: 'wp-ufc',
    order: 200,
  },
  {
    key: 'interim-champion',
    term: 'Interim champion',
    summary:
      'A champion recognised temporarily, usually because the reigning champion is unavailable, until the two can fight to unify the title.',
    category: 'competition',
    sourceKey: 'wp-ufc',
    order: 210,
  },
  {
    key: 'contender',
    term: 'Contender',
    summary: 'A ranked fighter considered a plausible next challenger for a division’s title.',
    category: 'competition',
    sourceKey: 'wp-ufc',
    order: 220,
  },
];

export const MMA_SECTIONS: SectionSeed[] = [
  {
    kind: 'introduction',
    heading: 'What is MMA?',
    order: 10,
    body: `Mixed martial arts is a full-contact combat sport in which two fighters compete using techniques drawn from multiple disciplines: boxing, kickboxing, wrestling, Brazilian jiu-jitsu, judo, Muay Thai and others. A fight can be won standing, in a clinch, or on the ground, and a fighter who can only do one of those things is at a permanent disadvantage against one who can do all three.

That combination is the sport's defining idea. Earlier combat sports had tested one discipline against another, a boxer against a wrestler, a striker against a grappler, and the answer MMA gave, repeatedly and conclusively enough to change the sport, was that no single discipline covers every situation a fight can reach. A striker with no takedown defence can be taken down and controlled. A grappler with no striking can be kept at a distance and hit. Modern MMA fighters train across all three broad areas, striking, wrestling and grappling, because the sport has already shown what happens to those who do not.

MMA is contested at the professional and amateur level worldwide, under promotions that run their own events, sign their own fighters and maintain their own rankings. The UFC is the largest and most widely recognised, but it is one promotion among several, not the sport itself.`,
  },
  {
    kind: 'glance',
    heading: 'MMA at a glance',
    order: 20,
    body: `**Fighters.** One against one.

**Main skill areas.** Striking, wrestling, grappling.

**Round length.** Commonly five minutes.

**Standard fight.** Usually three rounds.

**Championship fight.** Usually five rounds in major promotions.

**Ways to win.** Knockout, technical knockout, submission, decision, or a stoppage such as disqualification or a doctor's decision.

**Major promotions.** UFC, PFL, ONE Championship, Rizin, and other regional promotions.`,
  },
  {
    kind: 'mixed',
    heading: 'What makes MMA "mixed"?',
    order: 30,
    body: `MMA does not have a single technical tradition of its own. It draws on several, and a fighter's game is usually described by which of them they lean on.

**Boxing** contributes punching, footwork and head movement, and remains the technical foundation of most fighters' hand strikes. **Muay Thai** contributes kicks, knees, elbows and clinch striking, and is the source of most of MMA's striking beyond the hands. **Kickboxing** sits between the two, contributing punch-kick combinations and distance management. **Wrestling** contributes takedowns and the positional control that decides where a fight is fought, standing or on the ground. **Brazilian jiu-jitsu** contributes submissions and ground grappling, the discipline Royce Gracie used to win the first UFC event. **Judo** contributes throws, trips and clinch technique. **Sambo**, a Russian discipline, contributes a further set of throws, wrestling and submissions, and has produced a disproportionate number of the sport's most dominant grapplers. **Karate** and **taekwondo** contribute distance management and kicking technique used by a number of prominent strikers.

Few modern fighters rely on only one of these. A complete fighter trains across all of them and blends them into one game, which is what the "mixed" in mixed martial arts actually refers to: not a fixed combination of styles, but the requirement to be competent across all of them at once.`,
  },
  {
    kind: 'how-it-works',
    heading: 'How an MMA fight works',
    order: 40,
    body: `A fight begins with both fighters standing, and from there it can move through several phases in either direction. Fighters may strike at range, enter a clinch, attempt a takedown, grapple on the ground, or attempt a submission, and a fight can pass through all of these more than once before it ends.

If neither fighter finishes the contest, each round is scored by the judges once it ends, and the fight continues to the next round or, if the rounds are complete, to a decision. The winner is determined by a knockout, a technical knockout, a submission, a decision, or another official stoppage such as a disqualification or a doctor's stoppage.

The detail of how positions are entered, contested and escaped, guard, mount, back control, wrestling entries and the rest, is Explainer material rather than an Overview topic.`,
  },
  {
    kind: 'phases',
    heading: 'The three phases of MMA',
    order: 50,
    body: `A fight is usually described in terms of three phases, and a fighter's style is largely a description of which they are most comfortable in.

**Striking** is fighting while standing: punches, kicks, knees and elbows, at a range where neither fighter has hold of the other.

**The clinch** is close-range standing combat: controlling an opponent, working knees and elbows at short range, attempting trips, or looking for a takedown.

**The ground game** is fighting on the mat: controlling position, striking from a dominant position (ground-and-pound), attempting submissions, and escaping or sweeping from a disadvantaged one.

How each phase is actually contested, including specific positions and techniques, belongs in the Explainers.`,
  },
  {
    kind: 'ways-to-win',
    heading: 'Ways to win',
    order: 60,
    body: `**Knockout (KO).** The opponent is unable to intelligently continue after a legal strike.

**Technical knockout (TKO).** The referee, a doctor or a fighter's corner stops the fight, based on the circumstances and the applicable rules, short of a full knockout.

**Submission.** The opponent taps or verbally submits, or the referee intervenes where required.

**Decision.** The judges determine the winner after the scheduled rounds are completed.

**Disqualification.** A fighter loses because of a serious rule violation.

**No contest.** The fight ends without an official winner, under certain circumstances set out in the applicable rules.`,
  },
  {
    kind: 'scoring',
    heading: 'MMA scoring',
    order: 70,
    body: `Most major promotions score rounds using a system derived from the **ten-point must system**: the winner of a round is typically awarded 10 points and the loser 9, with a more one-sided round scored 10–8. Rare, extreme cases may be scored differently depending on the applicable rules.

Judges generally weigh effective striking, effective grappling, aggressiveness where relevant, and control of the fighting area where relevant, in reaching a round score.

The detailed criteria behind those scores, and how judges actually apply them, are covered in the Explainers rather than here.`,
  },
  {
    kind: 'weight-classes',
    heading: 'Weight classes',
    order: 80,
    body: `MMA is contested across weight classes so that fighters compete against others of similar size. Major promotions commonly recognise divisions including **flyweight**, **bantamweight**, **featherweight**, **lightweight**, **welterweight**, **middleweight**, **light heavyweight** and **heavyweight**, with women's divisions commonly including selected categories such as **strawweight**, **flyweight**, **bantamweight** and, depending on the promotion, **featherweight**.

Weight limits differ between organisations, and a division with the same name in two promotions is not guaranteed to carry an identical limit. UFC's specific weight limits should not be read as a universal standard for the sport; other promotions set their own.`,
  },
  {
    kind: 'ufc',
    heading: 'The UFC',
    order: 90,
    body: `The **Ultimate Fighting Championship (UFC)** is currently the most prominent global MMA promotion, and the one most people mean when they say MMA without qualification, though the two are not the same thing.

Within the UFC, structure runs from the promotion down through its weight divisions, each with a champion, a set of ranked fighters, further contenders, and an unranked roster below them.

UFC events come in more than one type. **Numbered events** are the promotion's flagship shows, typically headlined by a title fight. **Fight Night events** are its more frequent, usually smaller-scale cards. Every event is built from a **preliminary card**, contested earlier and often streamed rather than broadcast, and a **main card**, which culminates in the **co-main event** and the **main event**, the fight the card is built around.`,
  },
  {
    kind: 'promotions',
    heading: 'Major MMA promotions',
    order: 100,
    body: `UFC is a promotion within MMA, not a synonym for the sport, and it is not the only one worth knowing.

**UFC** is the largest global promotion, based in the United States, running events worldwide and holding the sport's deepest and most closely watched rankings.

**PFL (Professional Fighters League)** runs a regular-season-and-playoff competition format unusual in MMA, borrowed more from conventional sports leagues than from the sport's usual single-card structure, and acquired Bellator MMA's roster in 2023–24.

**ONE Championship**, based in Singapore, is the leading promotion across much of Asia, and also promotes kickboxing and Muay Thai alongside MMA.

**Rizin Fighting Federation**, based in Japan, continues a long Japanese tradition of hybrid fighting promotions stretching back to Pancrase and Shooto in the 1990s.

A number of other regional promotions operate at a smaller scale across Europe, Latin America, the Middle East and elsewhere, feeding fighters into the larger organisations above them.`,
  },
  {
    kind: 'event-structure',
    heading: 'MMA event structure',
    order: 110,
    body: `An MMA event contains multiple individual fights, each called a **bout**. A typical card runs from **early prelims**, through the **preliminary card**, to the **main card**, which builds to the **co-main event** and finishes with the **main event**, usually the card's highest-profile contest. Title fights are commonly placed as the main event, and occasionally as the co-main event on a card with two title fights.`,
  },
  {
    kind: 'championships',
    heading: 'Championships',
    order: 120,
    body: `Each weight division in a promotion may have its own champion, with a set of ranked contenders beneath them competing for the next opportunity to challenge for the title.

An **undisputed champion** holds the title outright. An **interim champion** is recognised temporarily, typically because the champion is unavailable, until the two can meet to unify the belt. A **title fight** is a bout for the championship itself, and a successful defence of it is a **title defence**. A title can also become **vacant**, when a champion retires, moves division or is stripped of it, and a **former champion** is a fighter who has held the title previously but does not currently hold it. A fighter who holds titles in two divisions at once is a **double champion**.`,
  },
  {
    kind: 'rankings',
    heading: 'MMA rankings',
    order: 130,
    body: `Major promotions maintain their own rankings for each weight division, typically running from the champion through a numbered list of contenders. These rankings can influence matchmaking, title opportunities, a fighter's contender status, and how an event is promoted.

Rankings are specific to the promotion that publishes them. There is no single, universally binding global MMA ranking, and a fighter's position can differ between promotions that both claim to rank the same weight class.`,
  },
  {
    kind: 'matchmaking',
    heading: 'Matchmaking',
    order: 140,
    body: `Unlike league sports, MMA fighters do not follow a fixed, round-robin schedule of opponents. Promotions build each matchup individually, weighing factors that can include rankings, recent results, the stylistic matchup between two fighters, availability, marketability and championship implications, all shaped by the terms of each fighter's agreement with the promotion.

The detail of how fighter contracts and matchmaking negotiations actually work is outside the scope of this page.`,
  },
  {
    kind: 'history',
    heading: 'How modern MMA developed',
    order: 150,
    body: `Contests that pit one fighting style against another are old and were never unique to any one country. Various societies staged their own versions across history, and in Brazil, from the 1920s onward, the Gracie family popularised **vale tudo** ("anything goes") challenge matches testing Brazilian jiu-jitsu against other disciplines. In Japan, hybrid fighting promotions such as **Shooto** and **Pancrase** developed in parallel through the 1980s and into the early 1990s, independently of what was about to happen in the United States.

The direct ancestor of the modern sport is the **UFC**, whose first event, **UFC 1**, was held in Denver in **1993** and framed as a tournament to settle which fighting style was most effective. Royce Gracie's win, using Brazilian jiu-jitsu against larger and heavier opponents trained in other disciplines, is widely credited with introducing ground grappling to a mainstream American audience for the first time.

The 1990s saw MMA evolve rapidly but with little regulatory oversight, and the sport's reputation and legal status in the United States suffered as a result. That changed from **2001**, when the **Unified Rules of Mixed Martial Arts** were adopted by the New Jersey State Athletic Control Board and gradually taken up by other state commissions, standardising weight classes, fouls and officiating. The same year, **Zuffa** bought the UFC and began the long push for sanctioning, cable and pay-per-view distribution that turned the promotion around, helped substantially by the 2005 debut of **The Ultimate Fighter**.

Through the 2000s the UFC expanded significantly, absorbing rival promotions including the WEC in 2010–11, adding a women's division in 2013, and being sold again in 2016 in one of the largest sports-franchise transactions on record. Through the 2010s and into the 2020s, MMA became increasingly global, with promotions such as ONE Championship, PFL and Rizin building large audiences outside the United States and Brazil, and talent pipelines emerging from Russia, the Caucasus, Europe and beyond.

**From style versus style to complete fighters.** Early MMA often tested one martial art against another, a striker against a grappler, a boxer against a wrestler. Modern MMA no longer works that way: fighters train across multiple disciplines as a matter of course, because the sport's own history has already shown what happens to a fighter who cannot.`,
  },
  {
    kind: 'cage',
    heading: 'The fighting area',
    order: 160,
    body: `Many promotions hold their fights in a cage rather than a boxing-style ring, enclosed by a fence rather than ropes, to keep fighters from falling or being thrown out of the fighting area during grappling exchanges. The UFC's cage is an eight-sided enclosure widely known as the **Octagon**. Other promotions use differently shaped cages, and some use a ring instead.

A cage or ring is generally described in terms of its fence or ropes, its canvas, a centre area, and corners where each fighter's team works between rounds, but the detailed dimensions and construction differ by promotion and are not standardised across the sport.`,
  },
  {
    kind: 'equipment',
    heading: 'Equipment',
    order: 170,
    body: `Fighters compete in **MMA gloves**, small, open-fingered gloves that allow both striking and grappling, unlike the heavily padded gloves used in boxing. A **mouthguard** is required to protect the teeth and jaw, and fighters wear **shorts** along with **groin protection** and any further protective equipment required under the applicable rules. **Hand wraps** are worn beneath the gloves to support the wrists and knuckles.

This page does not cover specific equipment brands or buying guidance.`,
  },
  {
    kind: 'global',
    heading: 'MMA around the world',
    order: 180,
    body: `MMA is practised and promoted across a wide range of regions, each shaped by its own martial arts traditions. The **United States** hosts the sport's largest promotion and draws heavily on its wrestling and boxing traditions. **Brazil** contributed Brazilian jiu-jitsu and the vale tudo tradition that fed directly into the sport's founding. The **Russia and Caucasus region**, Dagestan in particular, has produced a disproportionate number of dominant wrestlers and sambists. **Thailand** contributes Muay Thai, one of the sport's core striking disciplines, and **Japan** has its own long history of hybrid fighting promotions and judo and karate traditions.

Beyond these, MMA has an established presence in the **United Kingdom**, **Ireland**, **France**, **Poland**, **South Korea**, **China**, **Australia and New Zealand**, **Central Asia**, the **Middle East**, **Africa** and across **Latin America**, each contributing fighters and, in several cases, its own promotions. This is a description of where the sport has a meaningful presence, not a ranking of regions by strength or size, since no single reliable measure exists for that comparison.`,
  },
  {
    kind: 'amateur-professional',
    heading: 'Amateur versus professional MMA',
    order: 190,
    body: `**Amateur MMA** is developmental competition, often contested under modified rules, typically involving less experienced fighters and smaller events, and governed in many countries by IMMAF or an equivalent national body.

**Professional MMA** is contested under professional fight contracts, with results recorded in an official professional record, at higher-level promotions and for professional purses. Rules vary by jurisdiction and by promotion, and there is no single global standard covering both levels.`,
  },
  {
    kind: 'comparison',
    heading: 'MMA and other combat sports',
    order: 200,
    body: `**MMA** combines striking, takedowns and ground fighting into a single ruleset. **Boxing** is punches only. **Kickboxing** adds kicks to punches, with the specific rules varying by promotion. **Muay Thai** adds knees, elbows and clinch striking on top of punches and kicks. **Brazilian jiu-jitsu** is primarily grappling and submissions, without striking. **Wrestling** is centred on takedowns and positional control, without striking or submissions in most competitive rulesets. **Judo** is centred on throws and grappling from a standing position.

Each of these disciplines contributes to MMA without being equivalent to it; MMA's premise is precisely that no one of them, on its own, covers everything a fight can involve.`,
  },
  {
    kind: 'terminology',
    heading: 'Quick terminology',
    order: 210,
    body: `**KO.** A knockout: the opponent cannot intelligently continue after a legal strike.

**TKO.** A technical knockout: the fight is stopped before a full knockout occurs.

**Submission.** The fight ends because a fighter taps or the referee intervenes.

**Tap.** The physical signal that ends a fight by submission.

**Takedown.** Bringing a standing opponent to the ground.

**Guard.** A ground position controlling an opponent with the legs from underneath.

**Mount.** A dominant ground position, sitting astride the opponent.

**Back control.** A dominant position from behind the opponent.

**Ground-and-pound.** Striking an opponent from a dominant ground position.

**Clinch.** Close-range standing contact.

**Sprawl.** A defensive movement used to stop a takedown.

**Striking.** Fighting while standing, with strikes.

**Grappling.** Fighting through holds, control and submissions.

**Decision.** A result determined by the judges after the fight goes the distance.

**Split decision.** A decision the judges do not agree on unanimously.

**Unanimous decision.** A decision every judge scores for the same fighter.

**Weight cut.** Losing weight before a weigh-in to compete in a lighter division.

**Fight camp.** The dedicated training period before a bout.

**Title shot.** An opportunity to fight for a division's championship.

**Champion.** The fighter currently recognised as the best in a division.

**Interim champion.** A champion recognised temporarily until unifying the title with the reigning champion.

**Contender.** A ranked fighter considered a plausible next title challenger.`,
  },
];

/**
 * Featured entities: promotions and legends.
 *
 * `competitions` names the major promotions as prose entries rather than
 * resolved `competition` rows, since a promotion in this schema is closer to
 * a competition organiser than a single competition; where the database
 * holds a matching competition entity the card still resolves via `slug`,
 * following the optimistic-slug pattern used elsewhere in this directory.
 *
 * `icons` is deliberately chronological rather than ranked, spanning eras and
 * divisions, per the brief's explicit instruction not to construct a single
 * GOAT ordering. No active fighter appears here: modern stars belong to the
 * live Fighters tab, which this page does not attempt to simulate.
 */
export const MMA_FEATURED: FeaturedEntitySeed[] = [
  // ── Major promotions ─────────────────────────────────────────────────────
  {
    section: 'competitions',
    entityType: 'competition',
    slug: 'ufc',
    name: 'UFC',
    meta: 'Largest global promotion · founded 1993',
    blurb:
      'The largest and most prominent MMA promotion worldwide, running numbered events and Fight Night cards across weight divisions with the sport’s deepest rankings.',
    order: 10,
  },
  {
    section: 'competitions',
    entityType: 'competition',
    name: 'PFL',
    meta: 'Professional Fighters League · founded 2017',
    blurb:
      'Runs a regular-season-and-playoff competition format unusual in MMA, and acquired Bellator MMA’s roster in 2023–24.',
    order: 20,
  },
  {
    section: 'competitions',
    entityType: 'competition',
    name: 'ONE Championship',
    meta: 'Singapore · founded 2011',
    blurb:
      'The leading promotion across much of Asia, also promoting kickboxing and Muay Thai alongside its MMA cards.',
    order: 30,
  },
  {
    section: 'competitions',
    entityType: 'competition',
    name: 'Rizin Fighting Federation',
    meta: 'Japan · founded 2015',
    blurb:
      'Continues a long Japanese tradition of hybrid fighting promotion stretching back to Pancrase and Shooto in the 1990s.',
    order: 40,
  },

  // ── Legends, chronological rather than ranked ───────────────────────────
  {
    section: 'icons',
    entityType: 'person',
    slug: 'royce-gracie',
    name: 'Royce Gracie',
    meta: 'Brazil · multiple divisions · 1993–2007',
    blurb:
      'Won UFC 1 in 1993 using Brazilian jiu-jitsu against larger opponents from other disciplines, introducing ground grappling to a mainstream American audience.',
    order: 10,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'fedor-emelianenko',
    name: 'Fedor Emelianenko',
    meta: 'Russia · heavyweight · 2000–2022',
    blurb:
      'Went unbeaten for a decade in the 2000s, mostly outside the UFC, and is widely regarded as one of the most dominant heavyweights the sport has produced.',
    order: 20,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'anderson-silva',
    name: 'Anderson Silva',
    meta: 'Brazil · middleweight · 1997–2020',
    blurb:
      'Held the UFC middleweight title for over six years across the 2000s and 2010s, defending it a record number of consecutive times.',
    order: 30,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'georges-st-pierre',
    name: 'Georges St-Pierre',
    meta: 'Canada · welterweight, middleweight · 2002–2017',
    blurb:
      'A two-division UFC champion known for a well-rounded, wrestling-based game, with one of the sport’s longest reigns at welterweight.',
    order: 40,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'jose-aldo',
    name: 'José Aldo',
    meta: 'Brazil · featherweight · 2004–2022',
    blurb:
      'The first UFC featherweight champion, having previously unified the title as WEC champion, and unbeaten in the division for close to a decade.',
    order: 50,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'demetrious-johnson',
    name: 'Demetrious Johnson',
    meta: 'United States · flyweight · 2007–2021',
    blurb:
      'The first UFC flyweight champion, defending the title a record number of consecutive times against the division’s deepest era of contenders.',
    order: 60,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'jon-jones',
    name: 'Jon Jones',
    meta: 'United States · light heavyweight, heavyweight · 2008–present',
    blurb:
      'Became the youngest UFC champion in history at light heavyweight and later moved up to win the heavyweight title, across a career built on reach and tactical versatility.',
    order: 70,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'ronda-rousey',
    name: 'Ronda Rousey',
    meta: 'United States · bantamweight · 2010–2016',
    blurb:
      'Brought women’s MMA into the UFC with her 2013 debut and became one of the sport’s most prominent global stars during her title reign.',
    order: 80,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'daniel-cormier',
    name: 'Daniel Cormier',
    meta: 'United States · light heavyweight, heavyweight · 2009–2020',
    blurb:
      'A two-division UFC champion and Olympic wrestler whose rivalry with Jon Jones spanned much of his career.',
    order: 90,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'conor-mcgregor',
    name: 'Conor McGregor',
    meta: 'Ireland · featherweight, lightweight · 2008–present',
    blurb:
      'Became the first fighter to hold UFC titles in two weight divisions at the same time, and one of the sport’s most commercially significant stars.',
    order: 100,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'khabib-nurmagomedov',
    name: 'Khabib Nurmagomedov',
    meta: 'Russia · lightweight · 2008–2020',
    blurb:
      'Retired undefeated as UFC lightweight champion, built a career on dominant wrestling-based control, and became one of the sport’s biggest global stars from Dagestan.',
    order: 110,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'stipe-miocic',
    name: 'Stipe Miocic',
    meta: 'United States · heavyweight · 2010–present',
    blurb:
      'Set the record for consecutive UFC heavyweight title defences in an era regarded as one of the division’s most competitive.',
    order: 120,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'valentina-shevchenko',
    name: 'Valentina Shevchenko',
    meta: 'Kyrgyzstan · flyweight · 2003–present',
    blurb:
      'A long-reigning UFC women’s flyweight champion known for a rare combination of striking precision and Muay Thai and Brazilian jiu-jitsu credentials.',
    order: 130,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'amanda-nunes',
    name: 'Amanda Nunes',
    meta: 'Brazil · bantamweight, featherweight · 2008–2023',
    blurb:
      'Held UFC titles in two divisions simultaneously and retired with wins over several of the sport’s most decorated champions.',
    order: 140,
  },
];
