import type { ExplainerCategorySeed, ExplainerSeed } from './explainer-types';

/**
 * The boxing taxonomy: the categories, and every concept the library intends
 * to cover.
 *
 * Everything in this file is a draft placeholder except the rows that carry
 * `sections`, none of which do: the written explainers live in
 * `boxing-explainers.ts` and override these by slug, which is why the slugs
 * here have to be right first time. A typo produces a second concept rather
 * than a written version of the first.
 *
 * This is phase 1 of a multi-phase build. Phase 1 writes Category 1 (Start
 * Here) and Category 34 (Terminology) in full; every other category below is
 * taxonomy only, exactly as american-football's below-the-fold categories and
 * golf's below-the-fold categories are: a real slug, a real name, a real
 * description and a real difficulty tier, with the concepts underneath it
 * named but not yet written.
 *
 * ## On categories
 *
 * The brief names thirty-four groupings. Several of those are genuinely
 * distinct destinations a reader would search for on their own (Punches,
 * Scoring & Judging, Weight Classes, Boxing Belts), in the same spirit
 * american-football's thirty stayed mostly unconsolidated. But boxing's brief
 * also contains three pairs that split a single reader-facing idea across two
 * numbered groupings for the writer's convenience rather than the reader's,
 * and golf's precedent (consolidate where a reader would not draw the line
 * the brief drew) applies there:
 *
 *   - **Category 22 (Southpaw vs Orthodox) merges into Category 4
 *     (Stances).** A stance and its mirror are the same concept from two
 *     ends: "orthodox" and "southpaw" are named once each in Stances, and the
 *     comparison ("southpaw vs orthodox", "fighting a southpaw") is a
 *     `related` link away rather than a second category a reader has to
 *     realise exists. Category 20 (Style Matchups) keeps the general
 *     matchup-strategy concepts that are not simply the stance question.
 *   - **Category 23 (Body Punching) merges into Category 2 (Punches).**
 *     Every named item in Category 23 (body jab, body hook, liver shot,
 *     working the body, and so on) is a punch or a punch-selection idea, and
 *     Category 2 already lists body jab, body hook and straight-to-the-body
 *     as punches in their own right. Splitting "a punch" from "a punch aimed
 *     low" into two categories would ask a reader hunting for "liver shot" to
 *     guess which one it lives in. `alsoIn: ['body-punching']` is kept as a
 *     concept-level tag within the merged category's slug space is
 *     unnecessary once the categories are one, so the merge is total rather
 *     than partial.
 *   - **Category 3 (Number System) merges into Category 2 (Punches).** The
 *     brief's Category 3 is one idea, gym numbering notation for punches
 *     (1-2-3 and its regional variants), not a distinct area of the sport;
 *     it is folded in as a couple of concepts inside Punches rather than
 *     given a landing page of its own.
 *
 * Everything else keeps a one-to-one mapping to the brief's numbering, so the
 * category order below still reads as the brief's own sequence with those
 * three folds applied. Nothing is dropped: every named item across the
 * brief's thirty-four groupings appears below as at least a draft row, and
 * where a concept genuinely belongs to more than one shown category (a jab
 * belongs to Punches and is also a Start-Here-level idea; Southpaw is a
 * Terminology entry and a Stances concept) it is one row with `alsoIn`, never
 * two rows, exactly as golf's Slope Rating is one row shared between Course
 * Design and Handicaps.
 *
 * ## On duplication with the overview
 *
 * The brief's content rule applies here exactly as it does for golf and
 * American football: `boxing-overview.ts` answers "what is this" (a jab is a
 * quick lead-hand punch; judges use the ten-point must system), an explainer
 * answers "how exactly does this work" (how a jab is actually thrown and set
 * up; how a judge actually arrives at 10-9 rather than 10-8 on a close
 * round). So there is no `what-is-boxing` here, because the Overview already
 * carries that introduction, and the Start Here spine is written as the
 * mechanics of a fight rather than as a second one.
 *
 * A handful of slugs are chosen to resolve the `explainerSlug` values
 * `boxing-overview.ts` already names optimistically on its `BOXING_CONCEPTS`
 * rows: `boxing-punches-explained`, `boxing-fundamentals-explained`,
 * `boxing-fight-results-explained`, `how-boxing-judging-works`,
 * `how-boxing-titles-work` and `boxing-weight-classes-explained`. Every one
 * of those six is written in full in `boxing-explainers.ts` as part of the
 * Start Here spine, not left as a draft, specifically so the Overview's links
 * resolve rather than silently dropping.
 *
 * ## On specific brief cautions carried into descriptions
 *
 * Three categories carry an explicit caution in their `description` because
 * the brief calls it out and it matters even at draft stage, when only a
 * slug and a one-line summary exist for a reader to misread:
 *
 *   - **Weight Cutting & Weigh-ins** (25): descriptions stay informational,
 *     never instructional, on dehydration and cutting practice.
 *   - **Boxing Statistics** (31): punch-count data is explicitly flagged as
 *     imperfect and provider-dependent, not objective fact.
 *   - **Amateur & Olympic Boxing** (33): no current governing body is named
 *     as though the question were settled; `boxing-overview.ts` already
 *     treats AIBA/IBA's loss of recognition and World Boxing's formation as
 *     unresolved, and this category stays consistent with that.
 *
 * Money & Business (29) draft summaries are kept structural rather than
 * numeric for a different reason: this is an org-wide instruction not to
 * fabricate or imply real dollar figures, not a boxing-specific brief note.
 */

export const BOXING_EXPLAINER_CATEGORIES: ExplainerCategorySeed[] = [
  {
    slug: 'start-here',
    name: 'Start Here',
    shortName: 'Basics',
    description: 'Boxing from zero: how a fight works, how it is won, and how it is judged.',
    order: 10,
  },
  {
    slug: 'punches',
    name: 'Punches & Number System',
    shortName: 'Punches',
    description:
      'Every named punch in the sport, body shots included, plus the gym numbering notation (1, 2, 3...) trainers call them by.',
    order: 20,
  },
  {
    slug: 'stances',
    name: 'Stances',
    description:
      'Orthodox and southpaw, and everything about how a boxer stands to punch and defend.',
    order: 30,
  },
  {
    slug: 'footwork',
    name: 'Footwork',
    description: 'How a boxer moves around the ring: steps, pivots, angles and distance control.',
    order: 40,
  },
  {
    slug: 'defense',
    name: 'Defense',
    description:
      'Guard, blocking, slipping, rolling and every other way a boxer avoids getting hit.',
    order: 50,
  },
  {
    slug: 'counterpunching',
    name: 'Counterpunching',
    description: 'Timing a punch off an opponent’s attack rather than starting one of your own.',
    order: 60,
  },
  {
    slug: 'offensive-concepts',
    name: 'Offensive Concepts',
    shortName: 'Offense',
    description:
      'Setting up punches, combinations, feints and the ideas behind attacking with intent.',
    order: 70,
  },
  {
    slug: 'range-and-distance',
    name: 'Range & Distance',
    shortName: 'Range',
    description: 'The distances a fight is fought at, and how a boxer controls which one applies.',
    order: 80,
  },
  {
    slug: 'inside-fighting',
    name: 'Inside Fighting',
    description:
      'Fighting at close range: short punches, head position and working from the pocket.',
    order: 90,
  },
  {
    slug: 'clinching',
    name: 'Clinching',
    description: 'Close-range grappling contact, why it happens, and how it is broken.',
    order: 100,
  },
  {
    slug: 'knockdowns-and-knockouts',
    name: 'Knockdowns & Knockouts',
    shortName: 'KOs',
    description:
      'What counts as a knockdown, how a count works, and how a fight ends by knockout or stoppage. Specific count and stoppage rules vary by commission and by professional versus amateur rules; this category describes the shared shape rather than one fixed rulebook.',
    order: 110,
  },
  {
    slug: 'scoring-and-judging',
    name: 'Scoring & Judging',
    shortName: 'Judging',
    description:
      'How judges actually score a round under the ten-point must system, and the criteria (clean punching, effective aggression, ring generalship, defense) they weigh to get there. One of the most important categories in the library: this is the part of the sport casual viewers most often misunderstand.',
    order: 120,
  },
  {
    slug: 'decisions-and-results',
    name: 'Decisions & Results',
    shortName: 'Results',
    description:
      'Every way a fight can officially end, once the bell has rung or the fight has stopped.',
    order: 130,
  },
  {
    slug: 'rounds-and-clock',
    name: 'Rounds & Clock',
    shortName: 'Clock',
    description: 'Round length, the bell, rest periods and how a fight’s total time is structured.',
    order: 140,
  },
  {
    slug: 'corner-and-fight-team',
    name: 'Corner & Fight Team',
    shortName: 'Corner',
    description: 'Who works a fighter’s corner, and what each member is actually allowed to do.',
    order: 150,
  },
  {
    slug: 'referees-and-officials',
    name: 'Referees & Officials',
    shortName: 'Officials',
    description:
      'The referee, the judges, and the ringside doctor, and where each one’s authority starts and stops.',
    order: 160,
  },
  {
    slug: 'fouls',
    name: 'Fouls',
    description: 'What is not allowed in the ring, and what happens when a fighter does it anyway.',
    order: 170,
  },
  {
    slug: 'fighting-styles',
    name: 'Fighting Styles',
    description: 'The named archetypes: boxer, puncher, out-fighter, brawler and the rest.',
    order: 180,
  },
  {
    slug: 'style-matchups',
    name: 'Style Matchups',
    description:
      'How named styles tend to play out against one another, beyond the stance question alone.',
    order: 190,
  },
  {
    slug: 'boxing-strategy',
    name: 'Boxing Strategy',
    shortName: 'Strategy',
    description:
      'Game plans, adjustments between rounds, and the tactical thinking behind a fight.',
    order: 200,
  },
  {
    slug: 'weight-classes',
    name: 'Weight Classes',
    description: 'Every named division, and the concepts around moving up, down and across them.',
    order: 210,
  },
  {
    slug: 'weight-cutting-and-weigh-ins',
    name: 'Weight Cutting & Weigh-Ins',
    shortName: 'Weigh-Ins',
    description:
      'How boxers make weight and what a weigh-in involves, described structurally rather than as instructions to follow.',
    order: 220,
  },
  {
    slug: 'boxing-belts',
    name: 'Boxing Belts',
    shortName: 'Belts',
    description:
      'The WBA, WBC, IBF and WBO, and how their titles, tiers and mandatory challenger rules actually work. These are sanctioning bodies, not a governing hierarchy: none writes a rulebook the others answer to.',
    order: 230,
  },
  {
    slug: 'rankings',
    name: 'Rankings',
    description:
      'How a sanctioning body’s rankings are built, and what pound-for-pound lists actually are.',
    order: 240,
  },
  {
    slug: 'matchmaking',
    name: 'Matchmaking',
    description:
      'How two boxers actually end up fighting each other, and who is involved in making that happen.',
    order: 250,
  },
  {
    slug: 'money-and-business',
    name: 'Money & Business',
    shortName: 'Business',
    description:
      'The commercial structure behind a fight: purses, pay-per-view, promotional contracts and sanctioning fees, described structurally rather than with figures that would go stale immediately.',
    order: 260,
  },
  {
    slug: 'professional-records',
    name: 'Professional Records',
    shortName: 'Records',
    description: 'How a boxer’s win-loss-draw record is written, read and compared.',
    order: 270,
  },
  {
    slug: 'boxing-statistics',
    name: 'Boxing Statistics',
    shortName: 'Stats',
    description:
      'Punches thrown, punches landed and the other numbers broadcasts show. These are compiled by trained observers rather than measured automatically, and are not a perfectly objective record of a fight.',
    order: 280,
  },
  {
    slug: 'advanced-analysis',
    name: 'Advanced Analysis',
    shortName: 'Advanced',
    description:
      'Deeper, model-based ways of evaluating a fighter or a fight beyond the basic counting stats.',
    order: 290,
  },
  {
    slug: 'amateur-and-olympic-boxing',
    name: 'Amateur & Olympic Boxing',
    shortName: 'Amateur',
    description:
      'How amateur and Olympic boxing differ from the professional sport. Olympic boxing’s governing arrangements have been unsettled in recent years; this category describes the competition’s shape rather than naming a current recognised federation.',
    order: 300,
  },
  {
    slug: 'terminology',
    name: 'Terminology',
    description: 'A searchable A-Z glossary of the words used throughout the sport.',
    order: 310,
  },
];

/**
 * Every concept, as a draft, for every category this phase does not write in
 * full (everything except Start Here and Terminology, whose written rows
 * live in `boxing-explainers.ts` and override these by slug).
 *
 * `type` and `difficulty` are set explicitly rather than left to default,
 * since they drive the page template and the beginner filter. Types reuse
 * MMA's `technique`, `position`, `ruleset_concept`, `promotion` and
 * `fight_result` wherever a concept is structurally the same kind of thing:
 * a punch or a stance is a `technique`/`position`, a knockdown-count rule is
 * a `ruleset_concept`, a sanctioning body's title is a `promotion`, and a way
 * a fight ends is a `fight_result`. `standard` is used only where nothing
 * more specific fits.
 */
export const BOXING_EXPLAINER_TOPICS: ExplainerSeed[] = [
  // ── Punches & Number System (Categories 2, 3, 23) ─────────────────────────
  {
    slug: 'lead-hook',
    title: 'Lead Hook Explained',
    type: 'technique',
    difficulty: 'beginner',
    category: 'punches',
    shortDescription: 'A hook thrown with the lead hand.',
  },
  {
    slug: 'rear-hook',
    title: 'Rear Hook Explained',
    type: 'technique',
    difficulty: 'beginner',
    category: 'punches',
    shortDescription:
      'A hook thrown with the rear hand, a less common but harder-hitting variation.',
  },
  {
    slug: 'overhand-right',
    title: 'Overhand Right Explained',
    type: 'technique',
    difficulty: 'intermediate',
    category: 'punches',
    shortDescription: 'A looping rear-hand punch thrown over the top of an opponent’s guard.',
  },
  {
    slug: 'body-jab',
    title: 'Body Jab Explained',
    type: 'technique',
    difficulty: 'beginner',
    category: 'punches',
    shortDescription: 'A jab aimed at the body rather than the head.',
  },
  {
    slug: 'body-hook',
    title: 'Body Hook Explained',
    type: 'technique',
    difficulty: 'beginner',
    category: 'punches',
    shortDescription: 'A hook aimed at the ribs or midsection.',
  },
  {
    slug: 'straight-to-the-body',
    title: 'Straight to the Body Explained',
    type: 'technique',
    difficulty: 'intermediate',
    category: 'punches',
    shortDescription:
      'A straight punch aimed below the chest, often used to lower an opponent’s guard.',
  },
  {
    slug: 'check-hook',
    title: 'Check Hook Explained',
    type: 'technique',
    difficulty: 'advanced',
    category: 'punches',
    shortDescription: 'A hook thrown while pivoting away, used to counter an advancing opponent.',
  },
  {
    slug: 'shovel-hook',
    title: 'Shovel Hook Explained',
    type: 'technique',
    difficulty: 'advanced',
    category: 'punches',
    shortDescription: 'A short punch blending a hook and an uppercut, thrown at close range.',
  },
  {
    slug: 'lead-uppercut',
    title: 'Lead Uppercut Explained',
    type: 'technique',
    difficulty: 'intermediate',
    category: 'punches',
    shortDescription: 'An uppercut thrown with the lead hand.',
  },
  {
    slug: 'rear-uppercut',
    title: 'Rear Uppercut Explained',
    type: 'technique',
    difficulty: 'intermediate',
    category: 'punches',
    shortDescription:
      'An uppercut thrown with the rear hand, typically a fight-ending shot at close range.',
  },
  {
    slug: 'double-jab',
    title: 'Double Jab Explained',
    type: 'technique',
    difficulty: 'beginner',
    category: 'punches',
    shortDescription:
      'Two jabs thrown in quick succession, used to disrupt timing and measure distance.',
  },
  {
    slug: 'combination-punching',
    title: 'Combination Punching Explained',
    type: 'technique',
    difficulty: 'intermediate',
    category: 'punches',
    shortDescription: 'Throwing more than one punch as a linked sequence rather than single shots.',
    alsoIn: ['offensive-concepts'],
  },
  {
    slug: 'liver-shot',
    title: 'Liver Shot Explained',
    type: 'technique',
    difficulty: 'intermediate',
    category: 'punches',
    shortDescription:
      'A body punch landed on the liver, disproportionately effective even when it does not land especially hard.',
  },
  {
    slug: 'working-the-body',
    title: 'Working the Body Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'punches',
    shortDescription:
      'Deliberately targeting body punches across a fight to slow an opponent down over time.',
  },
  {
    slug: 'punch-numbering-system',
    title: 'Boxing’s Punch Numbering System Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'punches',
    shortDescription:
      'The 1-2-3-4-5-6 shorthand trainers use to call punches, and why it varies between gyms.',
  },

  // ── Stances (Categories 4, 22) ─────────────────────────────────────────────
  {
    slug: 'orthodox-stance',
    title: 'Orthodox Stance Explained',
    type: 'position',
    difficulty: 'beginner',
    category: 'stances',
    shortDescription:
      'The standard stance, left hand and foot leading, for a right-handed fighter.',
  },
  {
    slug: 'southpaw-stance',
    title: 'Southpaw Stance Explained',
    type: 'position',
    difficulty: 'beginner',
    category: 'stances',
    shortDescription: 'The mirror stance, right hand and foot leading.',
    alsoIn: ['terminology'],
  },
  {
    slug: 'switch-hitting',
    title: 'Switch-Hitting Explained',
    type: 'position',
    difficulty: 'advanced',
    category: 'stances',
    shortDescription:
      'Deliberately alternating between orthodox and southpaw stances within a fight.',
  },
  {
    slug: 'high-guard-stance',
    title: 'High Guard Stance Explained',
    type: 'position',
    difficulty: 'beginner',
    category: 'stances',
    shortDescription:
      'A stance with both hands held high beside the head, prioritising head protection.',
  },
  {
    slug: 'philly-shell-stance',
    title: 'Philly Shell Explained',
    type: 'position',
    difficulty: 'advanced',
    category: 'stances',
    shortDescription:
      'A shoulder-led defensive stance that uses the lead shoulder and a low lead hand to block and counter.',
  },
  {
    slug: 'peek-a-boo-stance',
    title: 'Peek-a-Boo Stance Explained',
    type: 'position',
    difficulty: 'advanced',
    category: 'stances',
    shortDescription:
      'A stance with hands held close to the face and constant head movement, associated with a bobbing, weaving style.',
  },
  {
    slug: 'squared-stance',
    title: 'Squared Stance Explained',
    type: 'position',
    difficulty: 'intermediate',
    category: 'stances',
    shortDescription:
      'A stance with the feet and hips facing the opponent more directly than the classic side-on stance.',
  },
  {
    slug: 'stance-width-and-balance',
    title: 'Stance Width & Balance Explained',
    type: 'position',
    difficulty: 'beginner',
    category: 'stances',
    shortDescription: 'How foot placement affects a boxer’s power, mobility and balance.',
  },
  {
    slug: 'southpaw-vs-orthodox',
    title: 'Southpaw vs Orthodox: Why the Matchup Matters',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'stances',
    shortDescription: 'Why fighting an opposite-stance opponent changes footwork and punch angles.',
    alsoIn: ['style-matchups'],
  },
  {
    slug: 'lead-hand-vs-lead-hand',
    title: 'Lead Hand vs Lead Hand Explained',
    type: 'tactical_concept',
    difficulty: 'advanced',
    category: 'stances',
    shortDescription:
      'The specific jockeying for lead-hand position that happens in a southpaw-orthodox matchup.',
  },

  // ── Footwork (Category 5) ──────────────────────────────────────────────────
  {
    slug: 'boxers-footwork-explained',
    title: 'Boxing Footwork Explained',
    type: 'technique',
    difficulty: 'beginner',
    category: 'footwork',
    shortDescription: 'The general role footwork plays in both attack and defense.',
  },
  {
    slug: 'the-boxing-step',
    title: 'The Step (Push-Step) Explained',
    type: 'technique',
    difficulty: 'beginner',
    category: 'footwork',
    shortDescription:
      'The basic forward and backward step used to close or open distance without crossing the feet.',
  },
  {
    slug: 'pivot-footwork',
    title: 'Pivot Explained',
    type: 'technique',
    difficulty: 'intermediate',
    category: 'footwork',
    shortDescription: 'Turning on the lead or rear foot to change angle relative to an opponent.',
  },
  {
    slug: 'lateral-movement',
    title: 'Lateral Movement Explained',
    type: 'technique',
    difficulty: 'intermediate',
    category: 'footwork',
    shortDescription: 'Moving side to side to create or deny an angle.',
  },
  {
    slug: 'circling-explained',
    title: 'Circling Explained',
    type: 'technique',
    difficulty: 'beginner',
    category: 'footwork',
    shortDescription:
      'Moving around an opponent rather than straight backward, often to circle away from their power hand.',
  },
  {
    slug: 'cutting-off-the-ring',
    title: 'Cutting Off the Ring Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'footwork',
    shortDescription:
      'Using angles and positioning to limit how much space a retreating opponent has to move into.',
  },
  {
    slug: 'ring-cutting-technique',
    title: 'Ring Cutting Technique Explained',
    type: 'technique',
    difficulty: 'advanced',
    category: 'footwork',
    shortDescription:
      'The specific footwork used to close off the ring rather than simply chasing an opponent.',
  },
  {
    slug: 'foot-positioning-for-power',
    title: 'Foot Positioning for Power Explained',
    type: 'technique',
    difficulty: 'intermediate',
    category: 'footwork',
    shortDescription: 'How the position of the feet contributes to punching power.',
  },
  {
    slug: 'in-and-out-movement',
    title: 'In-and-Out Movement Explained',
    type: 'technique',
    difficulty: 'intermediate',
    category: 'footwork',
    shortDescription: 'Stepping in to attack and immediately back out to avoid a return.',
  },
  {
    slug: 'feinting-with-footwork',
    title: 'Feinting With Footwork Explained',
    type: 'technique',
    difficulty: 'advanced',
    category: 'footwork',
    shortDescription: 'Using a false step to draw a reaction without committing to a punch.',
  },
  {
    slug: 'balance-and-weight-transfer',
    title: 'Balance & Weight Transfer Explained',
    type: 'technique',
    difficulty: 'intermediate',
    category: 'footwork',
    shortDescription: 'How weight shifts between the feet during a punch and while moving.',
  },
  {
    slug: 'reach-and-footwork',
    title: 'Reach & Footwork Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'footwork',
    shortDescription:
      'How a fighter uses footwork to make the most of a reach advantage or disadvantage.',
  },
  {
    slug: 'stepping-off-the-line',
    title: 'Stepping Off the Line Explained',
    type: 'technique',
    difficulty: 'advanced',
    category: 'footwork',
    shortDescription:
      'Moving off the straight line between two fighters to avoid a punch while staying in range to counter.',
  },
  {
    slug: 'footwork-under-pressure',
    title: 'Footwork Under Pressure Explained',
    type: 'technique',
    difficulty: 'advanced',
    category: 'footwork',
    shortDescription:
      'Maintaining balance and options while being pressed backward or against the ropes.',
  },
  {
    slug: 'southpaw-footwork-adjustments',
    title: 'Southpaw Footwork Adjustments Explained',
    type: 'technique',
    difficulty: 'advanced',
    category: 'footwork',
    shortDescription:
      'The specific outside-foot positioning boxers use against an opposite-stance opponent.',
  },

  // ── Defense (Category 6) ───────────────────────────────────────────────────
  {
    slug: 'boxing-guard-explained',
    title: 'Boxing Guard Explained',
    type: 'position',
    difficulty: 'beginner',
    category: 'defense',
    shortDescription: 'The hand and arm position used to protect the head and body.',
    alsoIn: ['terminology'],
  },
  {
    slug: 'blocking-explained',
    title: 'Blocking Explained',
    type: 'technique',
    difficulty: 'beginner',
    category: 'defense',
    shortDescription: 'Using the gloves or arms to absorb a punch rather than avoid it entirely.',
  },
  {
    slug: 'parrying-explained',
    title: 'Parrying Explained',
    type: 'technique',
    difficulty: 'intermediate',
    category: 'defense',
    shortDescription: 'Deflecting a punch off its line with a small hand movement.',
  },
  {
    slug: 'slipping-explained',
    title: 'Slipping Explained',
    type: 'technique',
    difficulty: 'intermediate',
    category: 'defense',
    shortDescription:
      'Moving the head just off the line of a straight punch so it misses entirely.',
  },
  {
    slug: 'bobbing-and-weaving',
    title: 'Bobbing & Weaving Explained',
    type: 'technique',
    difficulty: 'intermediate',
    category: 'defense',
    shortDescription: 'Dropping and shifting the head in an arc to avoid hooks.',
  },
  {
    slug: 'rolling-with-punches',
    title: 'Rolling With Punches Explained',
    type: 'technique',
    difficulty: 'intermediate',
    category: 'defense',
    shortDescription:
      'Moving the body backward or sideways with a punch’s momentum to reduce its impact.',
  },
  {
    slug: 'pulling-back-explained',
    title: 'Pulling Back Explained',
    type: 'technique',
    difficulty: 'beginner',
    category: 'defense',
    shortDescription: 'Leaning or stepping straight back out of range of a punch.',
  },
  {
    slug: 'shoulder-roll-defense',
    title: 'Shoulder Roll Explained',
    type: 'technique',
    difficulty: 'advanced',
    category: 'defense',
    shortDescription:
      'Using the lead shoulder to deflect punches aimed at the chin, central to the Philly Shell style.',
  },
  {
    slug: 'high-guard-defense',
    title: 'High Guard Defense Explained',
    type: 'technique',
    difficulty: 'beginner',
    category: 'defense',
    shortDescription: 'Keeping both hands raised beside the head to absorb and block punches.',
  },
  {
    slug: 'cross-arm-defense',
    title: 'Cross-Arm Defense Explained',
    type: 'technique',
    difficulty: 'advanced',
    category: 'defense',
    shortDescription:
      'A defensive posture with the forearms crossed in front of the head and body.',
  },
  {
    slug: 'clinching-as-defense',
    title: 'Clinching as Defense Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'defense',
    shortDescription: 'Using a clinch to interrupt an opponent’s attack rather than to rest.',
  },
  {
    slug: 'lateral-movement-as-defense',
    title: 'Lateral Movement as Defense Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'defense',
    shortDescription: 'Using footwork rather than upper-body movement to avoid punches.',
  },
  {
    slug: 'distance-management-defense',
    title: 'Distance Management (Defense) Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'defense',
    shortDescription: 'Staying just outside an opponent’s effective range as a defensive strategy.',
  },
  {
    slug: 'checking-punches',
    title: 'Checking Punches Explained',
    type: 'technique',
    difficulty: 'intermediate',
    category: 'defense',
    shortDescription: 'Using a raised knee, arm or glove to interrupt a punch as it starts.',
  },
  {
    slug: 'catching-punches',
    title: 'Catching Explained',
    type: 'technique',
    difficulty: 'intermediate',
    category: 'defense',
    shortDescription: 'Receiving a punch in an open glove to absorb it safely.',
  },
  {
    slug: 'tight-defense-explained',
    title: 'Tight Defense Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'defense',
    shortDescription: 'A compact, economical defensive style that minimises unnecessary movement.',
  },
  {
    slug: 'defensive-footwork',
    title: 'Defensive Footwork Explained',
    type: 'technique',
    difficulty: 'intermediate',
    category: 'defense',
    shortDescription:
      'Footwork used specifically to create distance or angle rather than to attack.',
  },

  // ── Counterpunching (Category 7) ───────────────────────────────────────────
  {
    slug: 'counterpunching-explained',
    title: 'Counterpunching Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'counterpunching',
    shortDescription:
      'Throwing a punch in direct response to, or immediately after avoiding, an opponent’s attack.',
    alsoIn: ['terminology'],
  },
  {
    slug: 'slip-and-counter',
    title: 'Slip and Counter Explained',
    type: 'technique',
    difficulty: 'intermediate',
    category: 'counterpunching',
    shortDescription: 'Slipping a punch and immediately returning one of your own.',
  },
  {
    slug: 'parry-and-counter',
    title: 'Parry and Counter Explained',
    type: 'technique',
    difficulty: 'intermediate',
    category: 'counterpunching',
    shortDescription: 'Deflecting a punch and immediately returning one of your own.',
  },
  {
    slug: 'check-hook-as-counter',
    title: 'Check Hook as a Counter Explained',
    type: 'technique',
    difficulty: 'advanced',
    category: 'counterpunching',
    shortDescription: 'Using the check hook specifically against an advancing opponent.',
  },
  {
    slug: 'counter-jab',
    title: 'Counter Jab Explained',
    type: 'technique',
    difficulty: 'intermediate',
    category: 'counterpunching',
    shortDescription: 'Timing a jab as an opponent begins their own attack.',
  },
  {
    slug: 'counter-right-hand',
    title: 'Counter Right Hand Explained',
    type: 'technique',
    difficulty: 'intermediate',
    category: 'counterpunching',
    shortDescription: 'Timing a straight rear-hand punch off an opponent’s jab or lead.',
  },
  {
    slug: 'pull-counter',
    title: 'Pull Counter Explained',
    type: 'technique',
    difficulty: 'advanced',
    category: 'counterpunching',
    shortDescription:
      'Leaning back out of range and returning a punch as the opponent’s attack falls short.',
  },
  {
    slug: 'timing-in-counterpunching',
    title: 'Timing in Counterpunching Explained',
    type: 'tactical_concept',
    difficulty: 'advanced',
    category: 'counterpunching',
    shortDescription: 'Why counterpunching rewards reading an opponent’s rhythm over raw speed.',
  },
  {
    slug: 'reading-an-opponent',
    title: 'Reading an Opponent Explained',
    type: 'tactical_concept',
    difficulty: 'advanced',
    category: 'counterpunching',
    shortDescription:
      'Recognising patterns in an opponent’s attacks to anticipate and counter them.',
  },
  {
    slug: 'baiting-a-punch',
    title: 'Baiting a Punch Explained',
    type: 'tactical_concept',
    difficulty: 'advanced',
    category: 'counterpunching',
    shortDescription: 'Deliberately inviting a specific attack in order to counter it.',
  },
  {
    slug: 'defensive-counterpuncher-style',
    title: 'The Defensive Counterpuncher Style Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'counterpunching',
    shortDescription:
      'A fighting approach built primarily around counters rather than initiating exchanges.',
    alsoIn: ['fighting-styles'],
  },
  {
    slug: 'counter-to-the-body',
    title: 'Countering to the Body Explained',
    type: 'technique',
    difficulty: 'advanced',
    category: 'counterpunching',
    shortDescription: 'Timing a body punch as a counter rather than a lead.',
  },

  // ── Offensive Concepts (Category 8) ────────────────────────────────────────
  {
    slug: 'setting-up-punches',
    title: 'Setting Up Punches Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'offensive-concepts',
    shortDescription: 'Using jabs, feints and footwork to create an opening before a power punch.',
  },
  {
    slug: 'feinting-explained',
    title: 'Feinting Explained',
    type: 'technique',
    difficulty: 'intermediate',
    category: 'offensive-concepts',
    shortDescription:
      'A false movement meant to draw a reaction without committing to a real attack.',
    alsoIn: ['terminology'],
  },
  {
    slug: 'combination-theory',
    title: 'Combination Theory Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'offensive-concepts',
    shortDescription: 'Why certain punches naturally chain together and others do not.',
  },
  {
    slug: 'double-and-triple-punches',
    title: 'Doubling and Tripling Punches Explained',
    type: 'technique',
    difficulty: 'intermediate',
    category: 'offensive-concepts',
    shortDescription:
      'Throwing the same punch twice or three times in a row rather than varying it.',
  },
  {
    slug: 'head-and-body-mixing',
    title: 'Mixing Head and Body Punches Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'offensive-concepts',
    shortDescription: 'Alternating targets to keep an opponent’s guard from settling.',
  },
  {
    slug: 'pressure-fighting',
    title: 'Pressure Fighting Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'offensive-concepts',
    shortDescription: 'Advancing constantly to deny an opponent room and time.',
  },
  {
    slug: 'volume-punching',
    title: 'Volume Punching Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'offensive-concepts',
    shortDescription:
      'Throwing a high number of punches to win rounds on activity rather than power.',
  },
  {
    slug: 'power-punching-approach',
    title: 'Power Punching Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'offensive-concepts',
    shortDescription: 'Prioritising fewer, harder punches over volume.',
  },
  {
    slug: 'broken-rhythm-punching',
    title: 'Broken Rhythm Explained',
    type: 'tactical_concept',
    difficulty: 'advanced',
    category: 'offensive-concepts',
    shortDescription:
      'Varying punch timing deliberately to prevent an opponent from timing a counter.',
  },
  {
    slug: 'angles-in-offense',
    title: 'Punching at Angles Explained',
    type: 'tactical_concept',
    difficulty: 'advanced',
    category: 'offensive-concepts',
    shortDescription: 'Attacking from an angle rather than straight on, to bypass a guard.',
  },
  {
    slug: 'closing-the-distance-offense',
    title: 'Closing the Distance Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'offensive-concepts',
    shortDescription: 'How a boxer safely closes range to land at closer distances.',
  },
  {
    slug: 'lead-hand-control-offense',
    title: 'Lead Hand Control Explained',
    type: 'tactical_concept',
    difficulty: 'advanced',
    category: 'offensive-concepts',
    shortDescription:
      'Using the lead hand to control an opponent’s guard or reaction before committing to a real punch.',
  },
  {
    slug: 'ring-generalship-offense',
    title: 'Ring Generalship (Offense) Explained',
    type: 'tactical_concept',
    difficulty: 'advanced',
    category: 'offensive-concepts',
    shortDescription: 'Controlling pace, position and distance to dictate how the fight is fought.',
  },
  {
    slug: 'feint-to-set-up-power-shot',
    title: 'Feinting to Set Up a Power Shot Explained',
    type: 'tactical_concept',
    difficulty: 'advanced',
    category: 'offensive-concepts',
    shortDescription: 'Using a feint specifically to open a lane for a hard punch.',
  },
  {
    slug: 'attacking-the-guard',
    title: 'Attacking the Guard Explained',
    type: 'tactical_concept',
    difficulty: 'advanced',
    category: 'offensive-concepts',
    shortDescription: 'Deliberately punching through or around a raised guard to wear it down.',
  },
  {
    slug: 'offensive-southpaw-tactics',
    title: 'Southpaw Offensive Tactics Explained',
    type: 'tactical_concept',
    difficulty: 'advanced',
    category: 'offensive-concepts',
    shortDescription: 'How a southpaw’s attacking angles differ from an orthodox fighter’s.',
  },

  // ── Range & Distance (Category 9) ──────────────────────────────────────────
  {
    slug: 'punching-range',
    title: 'Punching Range Explained',
    type: 'tactical_concept',
    difficulty: 'beginner',
    category: 'range-and-distance',
    shortDescription: 'The distance at which a given punch can land cleanly.',
  },
  {
    slug: 'long-range-fighting',
    title: 'Long Range Fighting Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'range-and-distance',
    shortDescription:
      'Fighting primarily at a distance where jabs and straight punches land but hooks do not.',
  },
  {
    slug: 'mid-range-fighting',
    title: 'Mid Range Fighting Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'range-and-distance',
    shortDescription: 'The distance where hooks and uppercuts become effective.',
  },
  {
    slug: 'close-range-fighting',
    title: 'Close Range Fighting Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'range-and-distance',
    shortDescription: 'Fighting at a distance close enough that clinching becomes likely.',
    alsoIn: ['inside-fighting'],
  },
  {
    slug: 'reach-advantage',
    title: 'Reach Advantage Explained',
    type: 'tactical_concept',
    difficulty: 'beginner',
    category: 'range-and-distance',
    shortDescription: 'How a longer reach changes which range favours which fighter.',
  },
  {
    slug: 'measuring-distance',
    title: 'Measuring Distance Explained',
    type: 'technique',
    difficulty: 'intermediate',
    category: 'range-and-distance',
    shortDescription: 'Using the lead hand or jab to gauge exactly how far away an opponent is.',
  },
  {
    slug: 'controlling-the-distance',
    title: 'Controlling the Distance Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'range-and-distance',
    shortDescription:
      'Actively dictating which range a fight is fought at, rather than reacting to an opponent’s preference.',
  },
  {
    slug: 'fighting-off-the-back-foot',
    title: 'Fighting Off the Back Foot Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'range-and-distance',
    shortDescription:
      'Retreating deliberately to control range and counter as an opponent advances.',
  },
  {
    slug: 'closing-distance-safely',
    title: 'Closing Distance Safely Explained',
    type: 'tactical_concept',
    difficulty: 'advanced',
    category: 'range-and-distance',
    shortDescription: 'Techniques for advancing into range without being hit on the way in.',
  },
  {
    slug: 'range-mismatches',
    title: 'Range Mismatches Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'range-and-distance',
    shortDescription:
      'How a fight between a long-range boxer and a close-range fighter tends to unfold.',
  },
  {
    slug: 'jab-as-range-finder',
    title: 'The Jab as a Range Finder Explained',
    type: 'tactical_concept',
    difficulty: 'beginner',
    category: 'range-and-distance',
    shortDescription: 'Using the jab to establish and maintain distance rather than only to score.',
  },
  {
    slug: 'in-fighter-vs-out-fighter-distance',
    title: 'In-Fighter vs Out-Fighter Distance Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'range-and-distance',
    shortDescription: 'How each archetype tries to force the fight into its preferred range.',
    alsoIn: ['style-matchups'],
  },

  // ── Inside Fighting (Category 10) ──────────────────────────────────────────
  {
    slug: 'inside-fighting-explained',
    title: 'Inside Fighting Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'inside-fighting',
    shortDescription: 'The skills specific to fighting at very close range.',
  },
  {
    slug: 'short-punches',
    title: 'Short Punches Explained',
    type: 'technique',
    difficulty: 'intermediate',
    category: 'inside-fighting',
    shortDescription: 'Compact punches with little backswing, thrown at close range.',
  },
  {
    slug: 'head-position-inside',
    title: 'Head Position (Inside Fighting) Explained',
    type: 'technique',
    difficulty: 'advanced',
    category: 'inside-fighting',
    shortDescription:
      'Where the head is placed relative to an opponent’s at close range, for both offense and safety.',
  },
  {
    slug: 'underhooks-and-overhooks',
    title: 'Underhooks & Overhooks Explained',
    type: 'technique',
    difficulty: 'advanced',
    category: 'inside-fighting',
    shortDescription: 'Arm positioning used to control an opponent’s posture at close range.',
  },
  {
    slug: 'infighting-body-work',
    title: 'Body Work at Close Range Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'inside-fighting',
    shortDescription: 'Targeting the body specifically once a fight has closed to short range.',
  },
  {
    slug: 'trading-at-close-range',
    title: 'Trading at Close Range Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'inside-fighting',
    shortDescription: 'Exchanging punches at close range rather than clinching or disengaging.',
  },
  {
    slug: 'pivoting-off-the-inside',
    title: 'Pivoting Off the Inside Explained',
    type: 'technique',
    difficulty: 'advanced',
    category: 'inside-fighting',
    shortDescription: 'Using a pivot to change angle immediately after an inside exchange.',
  },
  {
    slug: 'inside-fighting-defense',
    title: 'Defending at Close Range Explained',
    type: 'technique',
    difficulty: 'advanced',
    category: 'inside-fighting',
    shortDescription:
      'Blocking and reducing punch impact specifically at close range, where head movement has less room to work.',
  },
  {
    slug: 'smothering-punches',
    title: 'Smothering Punches Explained',
    type: 'technique',
    difficulty: 'intermediate',
    category: 'inside-fighting',
    shortDescription:
      'Pressing into an opponent to prevent them from having room to fully extend a punch.',
  },
  {
    slug: 'in-fighter-archetype-skills',
    title: 'The In-Fighter’s Skill Set Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'inside-fighting',
    shortDescription: 'The particular combination of skills a close-range specialist relies on.',
    alsoIn: ['fighting-styles'],
  },
  {
    slug: 'referee-role-at-close-range',
    title: 'The Referee’s Role at Close Range Explained',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'inside-fighting',
    shortDescription:
      'When and why a referee steps in to separate fighters working at close range.',
    alsoIn: ['referees-and-officials'],
  },

  // ── Clinching (Category 11) ────────────────────────────────────────────────
  {
    slug: 'clinch-explained-full',
    title: 'The Clinch Explained',
    type: 'position',
    difficulty: 'beginner',
    category: 'clinching',
    shortDescription: 'Close-range grappling contact between two boxers, broken by the referee.',
    alsoIn: ['terminology'],
  },
  {
    slug: 'why-boxers-clinch',
    title: 'Why Boxers Clinch Explained',
    type: 'tactical_concept',
    difficulty: 'beginner',
    category: 'clinching',
    shortDescription: 'The reasons a fighter initiates a clinch, tactical and defensive.',
  },
  {
    slug: 'breaking-a-clinch',
    title: 'Breaking a Clinch Explained',
    type: 'ruleset_concept',
    difficulty: 'beginner',
    category: 'clinching',
    shortDescription: 'How and when a referee separates two clinched fighters.',
  },
  {
    slug: 'holding-as-a-foul',
    title: 'Holding as a Foul Explained',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'clinching',
    shortDescription: 'When clinching crosses over into an excessive-holding foul.',
    alsoIn: ['fouls'],
  },
  {
    slug: 'clinch-work-punching',
    title: 'Punching Out of a Clinch Explained',
    type: 'technique',
    difficulty: 'advanced',
    category: 'clinching',
    shortDescription:
      'Short punches thrown as a clinch is broken or while it is still loosely held.',
  },
  {
    slug: 'defensive-clinching',
    title: 'Defensive Clinching Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'clinching',
    shortDescription: 'Using a clinch specifically to recover after being hurt.',
  },
  {
    slug: 'clinch-rules-by-jurisdiction',
    title: 'Clinch Rules by Jurisdiction Explained',
    type: 'ruleset_concept',
    difficulty: 'advanced',
    category: 'clinching',
    shortDescription:
      'How strictly clinching is policed varies between commissions and between amateur and professional rules.',
  },
  {
    slug: 'point-deductions-for-clinching',
    title: 'Point Deductions for Excessive Clinching Explained',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'clinching',
    shortDescription: 'When a referee may instruct judges to deduct a point for repeated holding.',
  },
  {
    slug: 'clinch-vs-legitimate-contact',
    title: 'Clinch vs Legitimate Inside Fighting Explained',
    type: 'tactical_concept',
    difficulty: 'advanced',
    category: 'clinching',
    shortDescription:
      'The distinction referees draw between a genuine clinch and fighters simply working at close range.',
  },

  // ── Knockdowns & Knockouts (Category 12) ───────────────────────────────────
  {
    slug: 'knockdown-explained-full',
    title: 'Knockdown Explained',
    type: 'fight_result',
    difficulty: 'beginner',
    category: 'knockdowns-and-knockouts',
    shortDescription:
      'A fighter touches the canvas, or is held up only by the ropes, as a result of a punch.',
    alsoIn: ['terminology'],
  },
  {
    slug: 'knockout-explained-full',
    title: 'Knockout Explained',
    type: 'fight_result',
    difficulty: 'beginner',
    category: 'knockdowns-and-knockouts',
    shortDescription: 'A fighter is unable to rise and continue within the referee’s count.',
    alsoIn: ['terminology'],
  },
  {
    slug: 'the-count',
    title: 'The Referee’s Count Explained',
    type: 'ruleset_concept',
    difficulty: 'beginner',
    category: 'knockdowns-and-knockouts',
    shortDescription:
      'How a referee counts a downed fighter, and what determines whether they can continue.',
  },
  {
    slug: 'standing-eight-count',
    title: 'Standing Eight Count Explained',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'knockdowns-and-knockouts',
    shortDescription:
      'A mandatory pause and fitness check after a count, used in some rule sets even without a fighter going down.',
  },
  {
    slug: 'mandatory-eight-count',
    title: 'Mandatory Eight Count Explained',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'knockdowns-and-knockouts',
    shortDescription:
      'A count a referee must complete to at least eight regardless of how quickly a fighter rises.',
  },
  {
    slug: 'three-knockdown-rule',
    title: 'Three-Knockdown Rule Explained',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'knockdowns-and-knockouts',
    shortDescription:
      'A rule, used in some jurisdictions, stopping a fight automatically after three knockdowns in one round.',
  },
  {
    slug: 'flash-knockdown',
    title: 'Flash Knockdown Explained',
    type: 'fight_result',
    difficulty: 'intermediate',
    category: 'knockdowns-and-knockouts',
    shortDescription: 'A brief knockdown a fighter recovers from almost immediately.',
  },
  {
    slug: 'slip-vs-knockdown',
    title: 'Slip vs Knockdown Explained',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'knockdowns-and-knockouts',
    shortDescription:
      'How a referee distinguishes a genuine knockdown from a loss of balance not caused by a clean punch.',
  },
  {
    slug: 'neutral-corner-rule',
    title: 'Neutral Corner Rule Explained',
    type: 'ruleset_concept',
    difficulty: 'beginner',
    category: 'knockdowns-and-knockouts',
    shortDescription: 'Why the standing fighter is sent to a neutral corner during a count.',
  },
  {
    slug: 'tko-explained-full',
    title: 'Technical Knockout Explained',
    type: 'fight_result',
    difficulty: 'beginner',
    category: 'knockdowns-and-knockouts',
    shortDescription:
      'The referee, a doctor or a corner stops the fight before a full knockout occurs.',
    alsoIn: ['terminology', 'decisions-and-results'],
  },
  {
    slug: 'referee-stoppage',
    title: 'Referee Stoppage Explained',
    type: 'ruleset_concept',
    difficulty: 'beginner',
    category: 'knockdowns-and-knockouts',
    shortDescription: 'When and why a referee stops a fight on safety grounds.',
  },
  {
    slug: 'corner-stoppage',
    title: 'Corner Stoppage (Throwing in the Towel) Explained',
    type: 'ruleset_concept',
    difficulty: 'beginner',
    category: 'knockdowns-and-knockouts',
    shortDescription: 'A fighter’s own corner ending the fight on their behalf.',
  },
  {
    slug: 'doctor-stoppage',
    title: 'Doctor Stoppage Explained',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'knockdowns-and-knockouts',
    shortDescription:
      'A ringside physician ending a fight on medical grounds, often for a cut or swelling.',
  },
  {
    slug: 'ko-vs-tko-difference',
    title: 'KO vs TKO: The Difference Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'knockdowns-and-knockouts',
    shortDescription:
      'Why some stoppages are recorded as a knockout and others as a technical knockout.',
  },
  {
    slug: 'punch-that-knocks-out',
    title: 'What Actually Causes a Knockout Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'knockdowns-and-knockouts',
    shortDescription:
      'The general physiological idea behind why a clean punch can knock a fighter out, described at a non-technical level.',
  },
  {
    slug: 'commission-differences-knockdown-rules',
    title: 'How Knockdown Rules Vary by Commission Explained',
    type: 'ruleset_concept',
    difficulty: 'advanced',
    category: 'knockdowns-and-knockouts',
    shortDescription:
      'Why the count, the standing eight and the three-knockdown rule are not applied identically everywhere.',
  },

  // ── Scoring & Judging (Category 13) ────────────────────────────────────────
  {
    slug: 'ten-point-must-system-detailed',
    title: 'The Ten-Point Must System Explained',
    type: 'ruleset_concept',
    difficulty: 'beginner',
    category: 'scoring-and-judging',
    shortDescription: 'How the standard 10-9, 10-8 scoring for a round actually works.',
  },
  {
    slug: 'clean-and-effective-punching',
    title: 'Clean & Effective Punching Explained',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'scoring-and-judging',
    shortDescription: 'The first, and generally most heavily weighed, judging criterion.',
  },
  {
    slug: 'effective-aggression',
    title: 'Effective Aggression Explained',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'scoring-and-judging',
    shortDescription: 'Why simply moving forward is not, by itself, scored as aggression.',
  },
  {
    slug: 'ring-generalship-judging',
    title: 'Ring Generalship (Judging Criterion) Explained',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'scoring-and-judging',
    shortDescription: 'How judges credit control of pace, distance and position.',
    alsoIn: ['terminology'],
  },
  {
    slug: 'defense-as-judging-criterion',
    title: 'Defense as a Judging Criterion Explained',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'scoring-and-judging',
    shortDescription:
      'How avoiding punches factors into a judge’s score, distinct from landing them.',
  },
  {
    slug: 'how-a-10-9-round-is-scored',
    title: 'How a 10-9 Round Is Scored',
    type: 'ruleset_concept',
    difficulty: 'beginner',
    category: 'scoring-and-judging',
    shortDescription: 'What separates a close round from an even one under the ten-point system.',
  },
  {
    slug: 'how-a-10-8-round-is-scored',
    title: 'How a 10-8 Round Is Scored',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'scoring-and-judging',
    shortDescription: 'What makes a round decisive enough to be scored two points apart.',
  },
  {
    slug: 'point-deductions-explained',
    title: 'Point Deductions Explained',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'scoring-and-judging',
    shortDescription:
      'When and why a referee instructs judges to subtract a point from a fighter’s score.',
  },
  {
    slug: 'judges-scorecards-explained',
    title: 'Judges’ Scorecards Explained',
    type: 'ruleset_concept',
    difficulty: 'beginner',
    category: 'scoring-and-judging',
    shortDescription: 'How individual judges’ round-by-round tallies are read and totalled.',
  },
  {
    slug: 'majority-and-unanimous-scoring',
    title: 'Majority vs Unanimous Scoring Explained',
    type: 'ruleset_concept',
    difficulty: 'beginner',
    category: 'scoring-and-judging',
    shortDescription: 'How three judges’ separate scorecards combine into a single decision.',
    alsoIn: ['decisions-and-results'],
  },
  {
    slug: 'why-judges-disagree',
    title: 'Why Judges Disagree Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'scoring-and-judging',
    shortDescription: 'Why two competent judges can reasonably score the same round differently.',
  },
  {
    slug: 'reading-a-scorecard',
    title: 'Reading a Scorecard Explained',
    type: 'ruleset_concept',
    difficulty: 'beginner',
    category: 'scoring-and-judging',
    shortDescription: 'How to interpret a scorecard as it is read out or shown on broadcast.',
  },
  {
    slug: 'controversial-decisions-concept',
    title: 'What Makes a Decision Controversial Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'scoring-and-judging',
    shortDescription:
      'The general reasons a scored decision can diverge sharply from public perception of a fight.',
  },
  {
    slug: 'judging-differences-amateur-vs-pro',
    title: 'Amateur vs Professional Judging Explained',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'scoring-and-judging',
    shortDescription:
      'How amateur scoring, geared more toward landed legal blows, differs from the professional criteria.',
  },
  {
    slug: 'compubox-and-punch-stats-in-judging',
    title: 'Punch Stats and Judging Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'scoring-and-judging',
    shortDescription: 'Why televised punch-count numbers are not what judges use to score a round.',
  },
  {
    slug: 'judging-a-clinch-heavy-round',
    title: 'Judging a Clinch-Heavy Round Explained',
    type: 'ruleset_concept',
    difficulty: 'advanced',
    category: 'scoring-and-judging',
    shortDescription:
      'How judges weigh a round with significant clinching and little clean punching.',
  },
  {
    slug: 'how-many-judges-score-a-fight',
    title: 'How Many Judges Score a Fight Explained',
    type: 'ruleset_concept',
    difficulty: 'beginner',
    category: 'scoring-and-judging',
    shortDescription:
      'The standard panel of three ringside judges, and their independence from the referee.',
  },

  // ── Decisions & Results (Category 14) ──────────────────────────────────────
  {
    slug: 'unanimous-decision',
    title: 'Unanimous Decision Explained',
    type: 'fight_result',
    difficulty: 'beginner',
    category: 'decisions-and-results',
    shortDescription: 'All three judges score the fight for the same boxer.',
  },
  {
    slug: 'split-decision-explained-full',
    title: 'Split Decision Explained',
    type: 'fight_result',
    difficulty: 'beginner',
    category: 'decisions-and-results',
    shortDescription: 'Two judges score the fight for one boxer, and the third for the other.',
    alsoIn: ['terminology'],
  },
  {
    slug: 'majority-decision',
    title: 'Majority Decision Explained',
    type: 'fight_result',
    difficulty: 'beginner',
    category: 'decisions-and-results',
    shortDescription: 'Two judges score the fight for one boxer, and the third scores it even.',
  },
  {
    slug: 'draw-explained-boxing',
    title: 'Draw Explained',
    type: 'fight_result',
    difficulty: 'beginner',
    category: 'decisions-and-results',
    shortDescription: 'The judges’ scorecards do not agree on a winner.',
  },
  {
    slug: 'technical-decision',
    title: 'Technical Decision Explained',
    type: 'fight_result',
    difficulty: 'intermediate',
    category: 'decisions-and-results',
    shortDescription:
      'A fight stopped early, often by an accidental injury, decided on the scorecards up to that point.',
  },
  {
    slug: 'technical-draw',
    title: 'Technical Draw Explained',
    type: 'fight_result',
    difficulty: 'intermediate',
    category: 'decisions-and-results',
    shortDescription: 'A technical decision in which the scorecards are themselves tied.',
  },
  {
    slug: 'disqualification-explained',
    title: 'Disqualification Explained',
    type: 'fight_result',
    difficulty: 'beginner',
    category: 'decisions-and-results',
    shortDescription: 'A fighter loses because of a serious rule violation.',
  },
  {
    slug: 'no-contest-explained',
    title: 'No Contest Explained',
    type: 'fight_result',
    difficulty: 'intermediate',
    category: 'decisions-and-results',
    shortDescription: 'A fight ends without an official winner under certain circumstances.',
  },
  {
    slug: 'retirement-in-corner',
    title: 'Retirement (In the Corner) Explained',
    type: 'fight_result',
    difficulty: 'intermediate',
    category: 'decisions-and-results',
    shortDescription: 'A fighter does not answer the bell for a round, ending the fight.',
  },
  {
    slug: 'walkover-explained',
    title: 'Walkover Explained',
    type: 'fight_result',
    difficulty: 'beginner',
    category: 'decisions-and-results',
    shortDescription:
      'A fight ending with no contest fought at all, typically because an opponent withdraws.',
  },
  {
    slug: 'result-overturned',
    title: 'Overturned Results Explained',
    type: 'fight_result',
    difficulty: 'intermediate',
    category: 'decisions-and-results',
    shortDescription: 'When and how a commission can change an official result after the fact.',
  },
  {
    slug: 'accidental-headbutt-ruling',
    title: 'Accidental Headbutt Ruling Explained',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'decisions-and-results',
    shortDescription:
      'How a fight’s result is decided when an unintentional clash of heads causes an injury.',
  },
  {
    slug: 'stoppage-due-to-cuts',
    title: 'Stoppage Due to Cuts Explained',
    type: 'fight_result',
    difficulty: 'intermediate',
    category: 'decisions-and-results',
    shortDescription:
      'How a fight can be decided because of an injury rather than a fighter’s performance.',
  },

  // ── Rounds & Clock (Category 15) ───────────────────────────────────────────
  {
    slug: 'round-length-explained',
    title: 'Round Length Explained',
    type: 'ruleset_concept',
    difficulty: 'beginner',
    category: 'rounds-and-clock',
    shortDescription: 'Why professional rounds are commonly three minutes, and how that varies.',
  },
  {
    slug: 'rest-period-between-rounds',
    title: 'Rest Period Between Rounds Explained',
    type: 'ruleset_concept',
    difficulty: 'beginner',
    category: 'rounds-and-clock',
    shortDescription: 'The one-minute break and what a corner does with it.',
  },
  {
    slug: 'number-of-rounds-explained',
    title: 'Number of Rounds Explained',
    type: 'ruleset_concept',
    difficulty: 'beginner',
    category: 'rounds-and-clock',
    shortDescription:
      'Why championship fights are commonly scheduled for 12 rounds and non-title fights for fewer.',
  },
  {
    slug: 'the-bell-explained',
    title: 'The Bell Explained',
    type: 'ruleset_concept',
    difficulty: 'beginner',
    category: 'rounds-and-clock',
    shortDescription:
      'How the round-start and round-end bell, and the ten-second warning clapper, are used.',
  },
  {
    slug: 'amateur-round-structure',
    title: 'Amateur Round Structure Explained',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'rounds-and-clock',
    shortDescription:
      'How amateur bouts are commonly shorter and run over fewer rounds than professional fights.',
    alsoIn: ['amateur-and-olympic-boxing'],
  },
  {
    slug: 'timekeeper-role',
    title: 'The Timekeeper’s Role Explained',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'rounds-and-clock',
    shortDescription:
      'Who is responsible for the official round clock and the count during a knockdown.',
  },
  {
    slug: 'saved-by-the-bell',
    title: 'Saved by the Bell Explained',
    type: 'ruleset_concept',
    difficulty: 'beginner',
    category: 'rounds-and-clock',
    shortDescription:
      'Rules around whether the bell can end a round mid-count, which vary by jurisdiction and by round.',
  },
  {
    slug: 'time-added-for-stoppages',
    title: 'Time Added for In-Round Stoppages Explained',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'rounds-and-clock',
    shortDescription:
      'How the clock is handled when a round is briefly interrupted, for example to treat a cut.',
  },

  // ── Corner & Fight Team (Category 16) ──────────────────────────────────────
  {
    slug: 'head-trainer-role',
    title: 'Head Trainer Explained',
    type: 'position_role',
    difficulty: 'beginner',
    category: 'corner-and-fight-team',
    shortDescription:
      'The lead coach responsible for a fighter’s preparation and in-fight instruction.',
  },
  {
    slug: 'cutman-role',
    title: 'Cutman Explained',
    type: 'position_role',
    difficulty: 'beginner',
    category: 'corner-and-fight-team',
    shortDescription:
      'The corner member responsible for treating cuts and swelling between rounds.',
  },
  {
    slug: 'assistant-trainer-role',
    title: 'Assistant Trainer Explained',
    type: 'position_role',
    difficulty: 'beginner',
    category: 'corner-and-fight-team',
    shortDescription: 'A secondary corner member supporting the head trainer.',
  },
  {
    slug: 'strength-and-conditioning-coach',
    title: 'Strength & Conditioning Coach Explained',
    type: 'position_role',
    difficulty: 'intermediate',
    category: 'corner-and-fight-team',
    shortDescription:
      'The trainer responsible for a fighter’s physical conditioning outside of technical boxing work.',
  },
  {
    slug: 'manager-role-boxing',
    title: 'Manager Explained',
    type: 'position_role',
    difficulty: 'beginner',
    category: 'corner-and-fight-team',
    shortDescription: 'Represents a boxer’s interests, separately from a promoter or trainer.',
    alsoIn: ['matchmaking'],
  },
  {
    slug: 'corner-instructions-between-rounds',
    title: 'Corner Instructions Between Rounds Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'corner-and-fight-team',
    shortDescription: 'What a corner is generally trying to accomplish in the one-minute break.',
  },
  {
    slug: 'how-many-corner-members-allowed',
    title: 'How Many Corner Members Are Allowed Explained',
    type: 'ruleset_concept',
    difficulty: 'beginner',
    category: 'corner-and-fight-team',
    shortDescription:
      'Commission limits on how many people can work a fighter’s corner during a bout.',
  },
  {
    slug: 'throwing-in-the-towel-explained',
    title: 'Throwing in the Towel Explained',
    type: 'ruleset_concept',
    difficulty: 'beginner',
    category: 'corner-and-fight-team',
    shortDescription:
      'How a corner can end a fight on a fighter’s behalf, and what a referee does with that signal.',
  },
  {
    slug: 'sparring-partners-role',
    title: 'Sparring Partners Explained',
    type: 'position_role',
    difficulty: 'beginner',
    category: 'corner-and-fight-team',
    shortDescription:
      'Training partners who help a boxer prepare, not part of the official fight-night corner team.',
  },
  {
    slug: 'coaching-style-differences',
    title: 'Coaching Style Differences Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'corner-and-fight-team',
    shortDescription: 'How trainers’ approaches to strategy and instruction can differ.',
  },
  {
    slug: 'nutritionist-role',
    title: 'Nutritionist Explained',
    type: 'position_role',
    difficulty: 'intermediate',
    category: 'corner-and-fight-team',
    shortDescription:
      'A team member advising on diet, relevant especially to making weight safely.',
    alsoIn: ['weight-cutting-and-weigh-ins'],
  },

  // ── Referees & Officials (Category 17) ─────────────────────────────────────
  {
    slug: 'referee-role-explained',
    title: 'The Referee’s Role Explained',
    type: 'position_role',
    difficulty: 'beginner',
    category: 'referees-and-officials',
    shortDescription:
      'The in-ring official responsible for enforcing the rules and fighter safety.',
  },
  {
    slug: 'judges-role-explained',
    title: 'The Judges’ Role Explained',
    type: 'position_role',
    difficulty: 'beginner',
    category: 'referees-and-officials',
    shortDescription:
      'The ringside officials responsible for scoring the fight, separate from the referee.',
  },
  {
    slug: 'ringside-doctor-role',
    title: 'Ringside Doctor Explained',
    type: 'position_role',
    difficulty: 'beginner',
    category: 'referees-and-officials',
    shortDescription: 'The physician responsible for assessing a fighter’s fitness to continue.',
  },
  {
    slug: 'timekeeper-role-officials',
    title: 'Timekeeper Explained',
    type: 'position_role',
    difficulty: 'beginner',
    category: 'referees-and-officials',
    shortDescription: 'The official responsible for the round clock and the knockdown count.',
    alsoIn: ['rounds-and-clock'],
  },
  {
    slug: 'athletic-commission-role',
    title: 'Athletic Commission Explained',
    type: 'position_role',
    difficulty: 'intermediate',
    category: 'referees-and-officials',
    shortDescription:
      'The state or national body that licenses a fight, appoints officials and enforces safety rules.',
  },
  {
    slug: 'referee-authority-and-limits',
    title: 'What a Referee Can and Cannot Do Explained',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'referees-and-officials',
    shortDescription:
      'The scope of a referee’s in-ring authority, distinct from the judges’ scoring role.',
  },
  {
    slug: 'how-referees-are-assigned',
    title: 'How Referees Are Assigned Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'referees-and-officials',
    shortDescription: 'Who selects the referee and judges for a given fight.',
  },
  {
    slug: 'inspector-role-boxing',
    title: 'Commission Inspector Explained',
    type: 'position_role',
    difficulty: 'intermediate',
    category: 'referees-and-officials',
    shortDescription:
      'A commission representative present at a fight to oversee compliance with its rules.',
  },
  {
    slug: 'supervisor-role-sanctioning-body',
    title: 'Sanctioning Body Supervisor Explained',
    type: 'position_role',
    difficulty: 'intermediate',
    category: 'referees-and-officials',
    shortDescription: 'A sanctioning body’s own representative present at a title fight.',
    alsoIn: ['boxing-belts'],
  },
  {
    slug: 'referee-stopping-a-fight-criteria',
    title: 'How a Referee Decides to Stop a Fight Explained',
    type: 'ruleset_concept',
    difficulty: 'advanced',
    category: 'referees-and-officials',
    shortDescription:
      'The general factors a referee weighs when judging whether a fighter can safely continue.',
  },
  {
    slug: 'judges-independence-from-referee',
    title: 'Why Judges Score Independently of the Referee Explained',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'referees-and-officials',
    shortDescription:
      'Why the referee has no role in scoring and judges have no role in stopping a fight.',
  },

  // ── Fouls (Category 18) ────────────────────────────────────────────────────
  {
    slug: 'low-blow-explained',
    title: 'Low Blow Explained',
    type: 'ruleset_concept',
    difficulty: 'beginner',
    category: 'fouls',
    shortDescription:
      'A punch landed below the belt line, a foul that can carry a mandatory recovery time.',
  },
  {
    slug: 'rabbit-punch-explained',
    title: 'Rabbit Punch Explained',
    type: 'ruleset_concept',
    difficulty: 'beginner',
    category: 'fouls',
    shortDescription: 'An illegal punch to the back of the head or neck.',
  },
  {
    slug: 'headbutt-foul',
    title: 'Headbutt (Foul) Explained',
    type: 'ruleset_concept',
    difficulty: 'beginner',
    category: 'fouls',
    shortDescription:
      'Intentional or careless use of the head against an opponent, an offence distinct from an accidental clash of heads.',
  },
  {
    slug: 'holding-foul',
    title: 'Holding Explained',
    type: 'ruleset_concept',
    difficulty: 'beginner',
    category: 'fouls',
    shortDescription: 'Excessive grabbing or holding an opponent to prevent them punching.',
    alsoIn: ['clinching'],
  },
  {
    slug: 'hitting-on-the-break',
    title: 'Hitting on the Break Explained',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'fouls',
    shortDescription: 'Punching after the referee has ordered a break from a clinch.',
  },
  {
    slug: 'hitting-a-downed-fighter',
    title: 'Hitting a Downed Fighter Explained',
    type: 'ruleset_concept',
    difficulty: 'beginner',
    category: 'fouls',
    shortDescription:
      'Punching an opponent who is down, a serious foul that can end a fight by disqualification.',
  },
  {
    slug: 'holding-and-hitting',
    title: 'Holding and Hitting Explained',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'fouls',
    shortDescription: 'Holding an opponent with one hand while punching with the other.',
  },
  {
    slug: 'elbowing-foul',
    title: 'Elbowing Explained',
    type: 'ruleset_concept',
    difficulty: 'beginner',
    category: 'fouls',
    shortDescription: 'Illegal use of the elbow, which is not a legal striking surface in boxing.',
  },
  {
    slug: 'biting-foul',
    title: 'Biting Explained',
    type: 'ruleset_concept',
    difficulty: 'beginner',
    category: 'fouls',
    shortDescription: 'A serious foul, typically leading to an immediate disqualification.',
  },
  {
    slug: 'kidney-punch-foul',
    title: 'Kidney Punch Explained',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'fouls',
    shortDescription: 'An illegal punch to the back or kidney area.',
  },
  {
    slug: 'shoulder-foul',
    title: 'Illegal Use of the Shoulder Explained',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'fouls',
    shortDescription: 'Using the shoulder to strike or unbalance an opponent illegally.',
  },
  {
    slug: 'stepping-on-foot-foul',
    title: 'Stepping on the Foot Explained',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'fouls',
    shortDescription:
      'Intentionally stepping on an opponent’s foot to unbalance them, an illegal tactic.',
  },
  {
    slug: 'spitting-out-mouthpiece-foul',
    title: 'Spitting Out the Mouthpiece Explained',
    type: 'ruleset_concept',
    difficulty: 'beginner',
    category: 'fouls',
    shortDescription:
      'Deliberately spitting out a mouthpiece to gain a break, treated as a foul in most rule sets.',
  },
  {
    slug: 'foul-warnings-and-point-deductions',
    title: 'Foul Warnings & Point Deductions Explained',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'fouls',
    shortDescription:
      'How a referee typically escalates from a warning to a point deduction to disqualification.',
  },
  {
    slug: 'intentional-vs-accidental-fouls',
    title: 'Intentional vs Accidental Fouls Explained',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'fouls',
    shortDescription:
      'Why the ruling and consequence differ depending on whether a foul appears deliberate.',
  },
  {
    slug: 'low-blow-recovery-time',
    title: 'Low Blow Recovery Time Explained',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'fouls',
    shortDescription:
      'The rules around how long a fighter may be given to recover from a low blow before continuing.',
  },
  {
    slug: 'no-contest-from-fouls',
    title: 'How Fouls Can Lead to a No Contest Explained',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'fouls',
    shortDescription:
      'When an accidental foul, rather than a fighter’s conduct, ends a fight without a winner.',
    alsoIn: ['decisions-and-results'],
  },

  // ── Fighting Styles (Category 19) ──────────────────────────────────────────
  {
    slug: 'boxer-style-archetype',
    title: 'The Boxer (Style) Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'fighting-styles',
    shortDescription: 'A style built around technical skill, footwork and accuracy over power.',
  },
  {
    slug: 'puncher-style-archetype',
    title: 'The Puncher (Style) Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'fighting-styles',
    shortDescription:
      'A style built around one-punch power, looking to end a fight in a single exchange.',
  },
  {
    slug: 'out-fighter-style-archetype',
    title: 'The Out-Fighter Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'fighting-styles',
    shortDescription:
      'A style fought primarily at long range, using footwork and the jab to control distance.',
  },
  {
    slug: 'brawler-style-archetype',
    title: 'The Brawler (Slugger) Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'fighting-styles',
    shortDescription:
      'A style built around constant forward pressure and heavy exchanges over technical refinement.',
  },
  {
    slug: 'boxer-puncher-style',
    title: 'The Boxer-Puncher Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'fighting-styles',
    shortDescription:
      'A hybrid style combining technical boxing skill with genuine one-punch power.',
  },
  {
    slug: 'switch-hitter-style',
    title: 'The Switch-Hitter (Style) Explained',
    type: 'tactical_concept',
    difficulty: 'advanced',
    category: 'fighting-styles',
    shortDescription:
      'A fighter who alternates between orthodox and southpaw as a deliberate stylistic tool.',
  },
  {
    slug: 'pressure-fighter-style',
    title: 'The Pressure Fighter Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'fighting-styles',
    shortDescription:
      'A style built around relentless forward movement to deny an opponent space and time.',
  },
  {
    slug: 'counter-puncher-style',
    title: 'The Counter-Puncher (Style) Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'fighting-styles',
    shortDescription: 'A style built primarily around timing rather than initiating attacks.',
    alsoIn: ['counterpunching'],
  },
  {
    slug: 'volume-puncher-style',
    title: 'The Volume Puncher Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'fighting-styles',
    shortDescription:
      'A style built around throwing a high number of punches to win rounds on activity.',
  },
  {
    slug: 'stylistic-hybrids',
    title: 'Stylistic Hybrids Explained',
    type: 'tactical_concept',
    difficulty: 'advanced',
    category: 'fighting-styles',
    shortDescription:
      'Why most real fighters blend more than one named archetype rather than fitting one cleanly.',
  },
  {
    slug: 'style-evolution-over-a-career',
    title: 'How a Fighter’s Style Evolves Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'fighting-styles',
    shortDescription: 'Why a boxer’s style commonly shifts as they age or move up in weight.',
  },

  // ── Style Matchups (Category 20) ───────────────────────────────────────────
  {
    slug: 'boxer-vs-puncher-matchup',
    title: 'Boxer vs Puncher Matchup Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'style-matchups',
    shortDescription:
      'The classic tactical question of skill against power, and how each side tries to win it.',
  },
  {
    slug: 'pressure-fighter-vs-out-fighter',
    title: 'Pressure Fighter vs Out-Fighter Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'style-matchups',
    shortDescription:
      'How a fight tends to unfold between a forward-moving fighter and one who prefers distance.',
  },
  {
    slug: 'counter-puncher-vs-pressure-fighter',
    title: 'Counter-Puncher vs Pressure Fighter Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'style-matchups',
    shortDescription:
      'Why a counter-punching style can be an especially effective answer to constant forward pressure.',
  },
  {
    slug: 'style-makes-fights',
    title: '"Styles Make Fights" Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'style-matchups',
    shortDescription:
      'The common boxing saying that outcomes depend heavily on stylistic matchup, not just ability.',
  },
  {
    slug: 'awkward-style-matchups',
    title: 'Awkward Style Matchups Explained',
    type: 'tactical_concept',
    difficulty: 'advanced',
    category: 'style-matchups',
    shortDescription:
      'Why some fighters, regardless of skill level, are unusually difficult stylistic puzzles for certain opponents.',
  },
  {
    slug: 'height-and-reach-mismatches',
    title: 'Height & Reach Mismatches Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'style-matchups',
    shortDescription:
      'How a significant size or reach difference tends to shape a fight’s tactics.',
  },
  {
    slug: 'southpaw-matchup-challenges',
    title: 'Why Southpaws Are a Different Challenge Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'style-matchups',
    shortDescription:
      'Why fighters with limited southpaw experience often struggle with the mirrored angles.',
    alsoIn: ['stances'],
  },
  {
    slug: 'style-vs-styles-in-scoring',
    title: 'How Style Affects Scoring Perception Explained',
    type: 'standard',
    difficulty: 'advanced',
    category: 'style-matchups',
    shortDescription:
      'Why certain stylistic matchups are more prone to disputed decisions than others.',
  },
  {
    slug: 'matchmaking-for-style',
    title: 'Matchmaking for Style Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'style-matchups',
    shortDescription:
      'How promoters and managers sometimes select opponents based on stylistic advantage.',
    alsoIn: ['matchmaking'],
  },
  {
    slug: 'style-clash-vs-mismatch',
    title: 'Style Clash vs Talent Mismatch Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'style-matchups',
    shortDescription:
      'The difference between a fight that is close because of styles and one that is close only on paper.',
  },

  // ── Boxing Strategy (Category 21) ──────────────────────────────────────────
  {
    slug: 'game-plan-explained',
    title: 'Game Plan Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'boxing-strategy',
    shortDescription: 'The general strategy a fighter and trainer prepare before a fight.',
  },
  {
    slug: 'adjusting-mid-fight',
    title: 'Adjusting Mid-Fight Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'boxing-strategy',
    shortDescription:
      'How a fighter changes approach between or during rounds based on what is and is not working.',
  },
  {
    slug: 'scouting-an-opponent',
    title: 'Scouting an Opponent Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'boxing-strategy',
    shortDescription:
      'Studying an opponent’s tendencies ahead of a fight to prepare a specific game plan.',
  },
  {
    slug: 'establishing-the-jab-strategy',
    title: 'Establishing the Jab Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'boxing-strategy',
    shortDescription:
      'The common early-fight strategy of using the jab to control range and gather information.',
  },
  {
    slug: 'body-attack-strategy',
    title: 'Body Attack Strategy Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'boxing-strategy',
    shortDescription:
      'A strategy built around wearing an opponent down over the course of a fight through body punching.',
  },
  {
    slug: 'stealing-rounds',
    title: 'Stealing a Round Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'boxing-strategy',
    shortDescription:
      'Winning a close round with a strong final flurry, playing to how judges tend to weigh a round’s ending.',
  },
  {
    slug: 'closing-strong-strategy',
    title: 'Closing Rounds Strong Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'boxing-strategy',
    shortDescription: 'Deliberately increasing output in the final seconds of a round.',
  },
  {
    slug: 'fighting-from-behind-on-scorecards',
    title: 'Fighting From Behind on the Scorecards Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'boxing-strategy',
    shortDescription:
      'How a fighter and corner approach a fight when they believe they need a late knockout or a big finish.',
  },
  {
    slug: 'protecting-a-lead',
    title: 'Protecting a Lead Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'boxing-strategy',
    shortDescription:
      'A conservative strategic approach used by a fighter believed to be ahead on the cards.',
  },
  {
    slug: 'fighting-a-southpaw-strategy',
    title: 'Strategy for Fighting a Southpaw Explained',
    type: 'tactical_concept',
    difficulty: 'advanced',
    category: 'boxing-strategy',
    shortDescription:
      'Common tactical adjustments orthodox fighters make against southpaw opponents.',
    alsoIn: ['stances'],
  },
  {
    slug: 'fighting-a-taller-opponent-strategy',
    title: 'Strategy for Fighting a Taller Opponent Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'boxing-strategy',
    shortDescription:
      'Common tactical adjustments against a significant height or reach disadvantage.',
  },
  {
    slug: 'ring-generalship-strategy',
    title: 'Ring Generalship (Strategy) Explained',
    type: 'tactical_concept',
    difficulty: 'advanced',
    category: 'boxing-strategy',
    shortDescription:
      'Deliberately controlling pace, distance and position as a fight-wide strategy rather than a single tactic.',
    alsoIn: ['scoring-and-judging'],
  },
  {
    slug: 'conserving-energy-strategy',
    title: 'Conserving Energy Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'boxing-strategy',
    shortDescription:
      'Managing output across a full fight rather than fighting each round at maximum effort.',
  },
  {
    slug: 'trainer-instructions-strategy',
    title: 'How Trainers Direct In-Fight Strategy Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'boxing-strategy',
    shortDescription:
      'What a trainer is typically trying to accomplish shouting instructions from the corner.',
  },
  {
    slug: 'adapting-to-a-cut-or-injury',
    title: 'Adapting to a Cut or Injury Mid-Fight Explained',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'boxing-strategy',
    shortDescription:
      'How a fighter’s strategy changes once carrying an injury sustained during the fight.',
  },
  {
    slug: 'championship-rounds-strategy',
    title: 'Championship Rounds Strategy Explained',
    type: 'tactical_concept',
    difficulty: 'advanced',
    category: 'boxing-strategy',
    shortDescription:
      'How pacing strategy changes in the later rounds unique to championship-distance fights.',
  },

  // ── Weight Classes (Category 24) ───────────────────────────────────────────
  {
    slug: 'minimumweight-explained',
    title: 'Minimumweight Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'weight-classes',
    shortDescription: 'The lightest traditional professional division.',
  },
  {
    slug: 'light-flyweight-explained',
    title: 'Light Flyweight Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'weight-classes',
    shortDescription: 'A division above minimumweight and below flyweight.',
  },
  {
    slug: 'flyweight-explained',
    title: 'Flyweight Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'weight-classes',
    shortDescription: 'One of the traditional lighter divisions.',
  },
  {
    slug: 'super-flyweight-explained',
    title: 'Super Flyweight Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'weight-classes',
    shortDescription: 'A division above flyweight and below bantamweight.',
  },
  {
    slug: 'bantamweight-explained',
    title: 'Bantamweight Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'weight-classes',
    shortDescription: 'One of the traditional lighter divisions.',
  },
  {
    slug: 'super-bantamweight-explained',
    title: 'Super Bantamweight Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'weight-classes',
    shortDescription: 'A division above bantamweight and below featherweight.',
  },
  {
    slug: 'featherweight-explained',
    title: 'Featherweight Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'weight-classes',
    shortDescription: 'A traditional lower-middle division.',
  },
  {
    slug: 'super-featherweight-explained',
    title: 'Super Featherweight Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'weight-classes',
    shortDescription: 'A division above featherweight and below lightweight.',
  },
  {
    slug: 'lightweight-explained',
    title: 'Lightweight Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'weight-classes',
    shortDescription: 'One of the sport’s traditionally deepest and most competitive divisions.',
  },
  {
    slug: 'super-lightweight-explained',
    title: 'Super Lightweight (Light Welterweight) Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'weight-classes',
    shortDescription: 'A division above lightweight and below welterweight.',
  },
  {
    slug: 'welterweight-explained',
    title: 'Welterweight Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'weight-classes',
    shortDescription: 'A traditionally deep and historically significant division.',
  },
  {
    slug: 'super-welterweight-explained',
    title: 'Super Welterweight (Light Middleweight) Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'weight-classes',
    shortDescription: 'A division above welterweight and below middleweight.',
  },
  {
    slug: 'middleweight-explained',
    title: 'Middleweight Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'weight-classes',
    shortDescription: 'A historically significant mid-tier division.',
  },
  {
    slug: 'super-middleweight-explained',
    title: 'Super Middleweight Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'weight-classes',
    shortDescription: 'A division above middleweight and below light heavyweight.',
  },
  {
    slug: 'light-heavyweight-explained',
    title: 'Light Heavyweight Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'weight-classes',
    shortDescription: 'A division above super middleweight and below cruiserweight.',
  },
  {
    slug: 'cruiserweight-explained',
    title: 'Cruiserweight Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'weight-classes',
    shortDescription: 'A division above light heavyweight and below heavyweight.',
  },
  {
    slug: 'heavyweight-explained',
    title: 'Heavyweight Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'weight-classes',
    shortDescription: 'The sport’s highest weight division, with no upper weight limit.',
  },
  {
    slug: 'moving-up-in-weight',
    title: 'Moving Up in Weight Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'weight-classes',
    shortDescription: 'What is involved when a boxer campaigns in a heavier division than before.',
  },
  {
    slug: 'moving-down-in-weight',
    title: 'Moving Down in Weight Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'weight-classes',
    shortDescription: 'What is involved when a boxer campaigns in a lighter division than before.',
  },
  {
    slug: 'multi-division-champion-explained',
    title: 'Multi-Division Champion Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'weight-classes',
    shortDescription: 'A fighter who has won recognised titles in more than one weight class.',
    alsoIn: ['boxing-belts'],
  },
  {
    slug: 'catchweight-explained-full',
    title: 'Catchweight Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'weight-classes',
    shortDescription: 'A fight contracted at a weight limit between two standard divisions.',
    alsoIn: ['terminology'],
  },
  {
    slug: 'why-weight-classes-exist',
    title: 'Why Boxing Has Weight Classes Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'weight-classes',
    shortDescription: 'The basic fairness rationale behind dividing boxers by weight.',
  },
  {
    slug: 'womens-weight-classes-explained',
    title: 'Women’s Weight Classes Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'weight-classes',
    shortDescription:
      'How women’s professional boxing’s division structure compares to the men’s ladder.',
  },

  // ── Weight Cutting & Weigh-Ins (Category 25) ───────────────────────────────
  {
    slug: 'making-weight-explained',
    title: 'Making Weight Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'weight-cutting-and-weigh-ins',
    shortDescription:
      'What it means for a boxer to weigh in at or below a division’s limit, described structurally.',
  },
  {
    slug: 'official-weigh-in-explained',
    title: 'Official Weigh-In Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'weight-cutting-and-weigh-ins',
    shortDescription:
      'The formal, commission-supervised weighing that determines whether a fight proceeds at the agreed weight.',
  },
  {
    slug: 'weigh-in-day-timing',
    title: 'Weigh-In Day Timing Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'weight-cutting-and-weigh-ins',
    shortDescription:
      'Why professional weigh-ins commonly happen the day before a fight rather than on fight day.',
  },
  {
    slug: 'missing-weight-consequences',
    title: 'Missing Weight: What Happens Explained',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'weight-cutting-and-weigh-ins',
    shortDescription:
      'The contractual and sanctioning consequences when a boxer weighs in above the agreed limit, described structurally.',
  },
  {
    slug: 'rehydration-clause-explained',
    title: 'Rehydration Clause Explained',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'weight-cutting-and-weigh-ins',
    shortDescription:
      'A contract term limiting how much weight a boxer may regain between the weigh-in and the fight.',
  },
  {
    slug: 'same-day-weigh-ins',
    title: 'Same-Day Weigh-Ins Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'weight-cutting-and-weigh-ins',
    shortDescription:
      'A weigh-in format used in some amateur and championship contexts, closer to fight time than the typical professional weigh-in.',
  },
  {
    slug: 'weight-cutting-overview',
    title: 'How Boxers Manage Weight Before a Fight (Overview)',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'weight-cutting-and-weigh-ins',
    shortDescription:
      'A structural overview of how fighters approach making weight, without instructional detail on specific methods.',
  },
  {
    slug: 'weight-classes-and-cutting-culture',
    title: 'Weight Classes & Cutting Culture Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'weight-cutting-and-weigh-ins',
    shortDescription:
      'Why weight cutting is a widely discussed part of the sport’s culture and its general risks, described at a structural level.',
  },

  // ── Boxing Belts (Category 26) ─────────────────────────────────────────────
  {
    slug: 'wba-world-title-explained',
    title: 'WBA World Title Explained',
    type: 'promotion',
    difficulty: 'beginner',
    category: 'boxing-belts',
    shortDescription:
      'The World Boxing Association’s world championship, the oldest of the four major titles.',
  },
  {
    slug: 'wbc-world-title-explained',
    title: 'WBC World Title Explained',
    type: 'promotion',
    difficulty: 'beginner',
    category: 'boxing-belts',
    shortDescription: 'The World Boxing Council’s world championship.',
  },
  {
    slug: 'ibf-world-title-explained',
    title: 'IBF World Title Explained',
    type: 'promotion',
    difficulty: 'beginner',
    category: 'boxing-belts',
    shortDescription: 'The International Boxing Federation’s world championship.',
  },
  {
    slug: 'wbo-world-title-explained',
    title: 'WBO World Title Explained',
    type: 'promotion',
    difficulty: 'beginner',
    category: 'boxing-belts',
    shortDescription:
      'The World Boxing Organization’s world championship, the youngest of the four major titles.',
  },
  {
    slug: 'the-ring-championship-explained',
    title: 'The Ring Championship Explained',
    type: 'promotion',
    difficulty: 'intermediate',
    category: 'boxing-belts',
    shortDescription:
      'A lineal championship awarded by a magazine rather than a sanctioning body, based on who has beaten whom.',
  },
  {
    slug: 'interim-title-explained',
    title: 'Interim Title Explained',
    type: 'promotion',
    difficulty: 'intermediate',
    category: 'boxing-belts',
    shortDescription:
      'A title recognised temporarily while a full champion is unavailable, pending a unification fight.',
  },
  {
    slug: 'regular-champion-explained',
    title: 'Regular Champion Explained',
    type: 'promotion',
    difficulty: 'intermediate',
    category: 'boxing-belts',
    shortDescription:
      'A secondary tier of recognition some sanctioning bodies use beneath a "super" or full champion.',
  },
  {
    slug: 'super-champion-explained',
    title: 'Super Champion Explained',
    type: 'promotion',
    difficulty: 'intermediate',
    category: 'boxing-belts',
    shortDescription:
      'An additional recognition tier used by some sanctioning bodies above their standard title.',
  },
  {
    slug: 'regional-title-explained',
    title: 'Regional Title Explained',
    type: 'promotion',
    difficulty: 'beginner',
    category: 'boxing-belts',
    shortDescription:
      'A lower-tier title within a sanctioning body’s system, below a world title in prestige.',
  },
  {
    slug: 'vacant-title-explained',
    title: 'Vacant Title Explained',
    type: 'promotion',
    difficulty: 'beginner',
    category: 'boxing-belts',
    shortDescription:
      'A title with no current holder, typically contested between two ranked fighters to fill it.',
  },
  {
    slug: 'title-defence-explained',
    title: 'Title Defence Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'boxing-belts',
    shortDescription: 'A successful fight in which a champion retains their title.',
  },
  {
    slug: 'title-unification-explained',
    title: 'Title Unification Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'boxing-belts',
    shortDescription:
      'A fight in which two titleholders combine their titles into one, held by the winner.',
  },
  {
    slug: 'undisputed-champion-explained-full',
    title: 'Undisputed Champion Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'boxing-belts',
    shortDescription:
      'A boxer who simultaneously holds the WBA, WBC, IBF and WBO titles in one weight class.',
    alsoIn: ['terminology'],
  },
  {
    slug: 'unified-champion-explained',
    title: 'Unified Champion Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'boxing-belts',
    shortDescription:
      'A boxer holding more than one, but not all four, major titles in one division.',
  },
  {
    slug: 'sanctioning-fee-explained',
    title: 'Sanctioning Fee Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'boxing-belts',
    shortDescription:
      'A fee a sanctioning body charges promoters to recognise a fight as being for its title.',
    alsoIn: ['money-and-business'],
  },
  {
    slug: 'belt-vs-title-distinction',
    title: 'Belt vs Title: The Distinction Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'boxing-belts',
    shortDescription:
      'Why the physical belt and the recognised title are related but not identical concepts.',
  },
  {
    slug: 'sanctioning-bodies-are-not-a-governing-hierarchy',
    title: 'Why Sanctioning Bodies Are Not a Governing Hierarchy',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'boxing-belts',
    shortDescription:
      'Why the WBA, WBC, IBF and WBO compete with rather than answer to one another, unlike a sport’s single governing body.',
  },

  // ── Rankings (Category 27) ──────────────────────────────────────────────────
  {
    slug: 'sanctioning-body-rankings-explained',
    title: 'Sanctioning Body Rankings Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'rankings',
    shortDescription:
      'How each sanctioning body compiles and updates its own independent rankings.',
  },
  {
    slug: 'mandatory-challenger-explained-full',
    title: 'Mandatory Challenger Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'rankings',
    shortDescription: 'The challenger a sanctioning body requires its champion to face next.',
    alsoIn: ['terminology', 'boxing-belts'],
  },
  {
    slug: 'voluntary-defence-explained',
    title: 'Voluntary Defence Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'rankings',
    shortDescription:
      'A title defence against a challenger of the champion’s choosing rather than a mandatory one.',
  },
  {
    slug: 'pound-for-pound-explained-full',
    title: 'Pound for Pound Rankings Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'rankings',
    shortDescription:
      'Informal, subjective rankings of fighters as though weight were not a factor, with no single universal list.',
    alsoIn: ['terminology'],
  },
  {
    slug: 'media-rankings-explained',
    title: 'Media Rankings Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'rankings',
    shortDescription:
      'Rankings compiled by outlets and organisations independent of any sanctioning body.',
  },
  {
    slug: 'ranking-disputes-explained',
    title: 'Ranking Disputes Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'rankings',
    shortDescription:
      'Why different rankings for the same division routinely disagree with one another.',
  },
  {
    slug: 'ratings-committee-role',
    title: 'Ratings Committee Explained',
    type: 'standard',
    difficulty: 'advanced',
    category: 'rankings',
    shortDescription:
      'The body within a sanctioning organisation responsible for compiling its rankings.',
  },
  {
    slug: 'how-rankings-affect-title-shots',
    title: 'How Rankings Affect Title Shots Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'rankings',
    shortDescription:
      'How a fighter’s ranking position relates to their path toward a mandatory title shot.',
  },
  {
    slug: 'p4p-criteria-debate',
    title: 'What Goes Into a Pound-for-Pound Ranking Explained',
    type: 'standard',
    difficulty: 'advanced',
    category: 'rankings',
    shortDescription: 'The various, disputed criteria different pound-for-pound lists use.',
  },
  {
    slug: 'former-champion-status',
    title: 'Former Champion Status Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'rankings',
    shortDescription:
      'How a fighter who previously held a title but does not currently is described and ranked.',
  },
  {
    slug: 'divisional-rankings-vs-p4p',
    title: 'Divisional Rankings vs Pound-for-Pound Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'rankings',
    shortDescription:
      'The distinction between a ranking within one weight class and a cross-weight comparison.',
  },
  {
    slug: 'ranking-inactivity-rules',
    title: 'Ranking Inactivity Rules Explained',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'rankings',
    shortDescription:
      'How sanctioning bodies handle a ranked fighter who has not fought in some time.',
  },
  {
    slug: 'debut-and-prospect-rankings',
    title: 'Prospect Rankings Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'rankings',
    shortDescription:
      'How media outlets track and rank rising fighters not yet ranked by a sanctioning body.',
  },

  // ── Matchmaking (Category 28) ──────────────────────────────────────────────
  {
    slug: 'matchmaker-role',
    title: 'Matchmaker Explained',
    type: 'position_role',
    difficulty: 'beginner',
    category: 'matchmaking',
    shortDescription:
      'The person or team responsible for identifying and negotiating opponents for a fighter.',
  },
  {
    slug: 'how-fights-are-made-full',
    title: 'How Fights Are Made (In Depth)',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'matchmaking',
    shortDescription:
      'The factors, from rankings to contracts to purse bids, that shape whether and when two boxers fight.',
  },
  {
    slug: 'purse-bid-explained',
    title: 'Purse Bid Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'matchmaking',
    shortDescription:
      'A process some sanctioning bodies use to award promotional rights to a mandatory fight, described structurally.',
    alsoIn: ['money-and-business'],
  },
  {
    slug: 'step-aside-fee-explained',
    title: 'Step-Aside Fee Explained',
    type: 'standard',
    difficulty: 'advanced',
    category: 'matchmaking',
    shortDescription:
      'A payment made to a mandatory challenger in exchange for allowing a different fight to happen first, described structurally.',
    alsoIn: ['money-and-business'],
  },
  {
    slug: 'voluntary-vs-mandatory-negotiations',
    title: 'Voluntary vs Mandatory Fight Negotiations Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'matchmaking',
    shortDescription:
      'How negotiating a voluntary defence differs from a sanctioning body’s mandatory process.',
  },
  {
    slug: 'crossover-fights-explained',
    title: 'Crossover Fights Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'matchmaking',
    shortDescription:
      'Fights arranged for their broad commercial appeal, sometimes across weight classes or between boxers of very different backgrounds.',
  },
  {
    slug: 'title-unification-negotiations',
    title: 'Title Unification Negotiations Explained',
    type: 'standard',
    difficulty: 'advanced',
    category: 'matchmaking',
    shortDescription:
      'The typically complex process of arranging a fight between two different sanctioning bodies’ champions.',
    alsoIn: ['boxing-belts'],
  },
  {
    slug: 'promotional-conflicts-explained',
    title: 'Promotional Conflicts Explained',
    type: 'standard',
    difficulty: 'advanced',
    category: 'matchmaking',
    shortDescription:
      'How competing promotional or broadcast contracts can prevent two fighters from meeting.',
  },
  {
    slug: 'co-promotion-explained',
    title: 'Co-Promotion Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'matchmaking',
    shortDescription:
      'An arrangement where two promoters jointly stage a fight between fighters they separately represent.',
  },
  {
    slug: 'undercard-matchmaking',
    title: 'Undercard Matchmaking Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'matchmaking',
    shortDescription:
      'How the supporting fights on a card are typically put together, distinct from negotiating the main event.',
  },
  {
    slug: 'showcase-fight-explained',
    title: 'Showcase Fight Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'matchmaking',
    shortDescription:
      'A deliberately lopsided matchup intended to display a fighter’s skills rather than test them severely.',
  },
  {
    slug: 'tune-up-fight-explained',
    title: 'Tune-Up Fight Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'matchmaking',
    shortDescription: 'A lower-risk fight taken to stay active or sharp ahead of a bigger contest.',
  },
  {
    slug: 'stay-busy-fight-explained',
    title: 'Stay-Busy Fight Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'matchmaking',
    shortDescription:
      'A fight taken primarily to maintain activity while a bigger fight is negotiated.',
  },
  {
    slug: 'network-and-streaming-deals-matchmaking',
    title: 'How Broadcast Deals Shape Matchmaking Explained',
    type: 'standard',
    difficulty: 'advanced',
    category: 'matchmaking',
    shortDescription:
      'How a broadcaster or streaming platform’s contracts can influence which fights get made.',
    alsoIn: ['money-and-business'],
  },
  {
    slug: 'risk-vs-reward-matchmaking',
    title: 'Risk vs Reward in Matchmaking Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'matchmaking',
    shortDescription:
      'The general tension a fighter’s team weighs between a safer fight and a more dangerous, higher-reward one.',
  },

  // ── Money & Business (Category 29) ─────────────────────────────────────────
  {
    slug: 'purse-explained',
    title: 'Purse Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'money-and-business',
    shortDescription:
      'What a boxer is contractually guaranteed for a fight, structurally rather than as a figure.',
  },
  {
    slug: 'purse-split-explained',
    title: 'Purse Split Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'money-and-business',
    shortDescription:
      'How the total revenue of a fight is divided between the two boxers, negotiated per fight.',
  },
  {
    slug: 'pay-per-view-explained',
    title: 'Pay-Per-View Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'money-and-business',
    shortDescription:
      'A broadcast model where viewers pay individually to watch a specific event, structurally rather than by revenue figures.',
  },
  {
    slug: 'gate-revenue-explained',
    title: 'Gate Revenue Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'money-and-business',
    shortDescription:
      'Revenue from ticket sales at the live event, one of several revenue streams a fight generates.',
  },
  {
    slug: 'promoter-role-business',
    title: 'The Promoter’s Business Role Explained',
    type: 'position_role',
    difficulty: 'beginner',
    category: 'money-and-business',
    shortDescription:
      'What a promoter organises and finances commercially, distinct from a manager or a sanctioning body.',
    alsoIn: ['terminology'],
  },
  {
    slug: 'broadcast-rights-explained',
    title: 'Broadcast Rights Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'money-and-business',
    shortDescription:
      'How the right to televise or stream a fight is licensed, structurally rather than by deal value.',
  },
  {
    slug: 'sanctioning-fees-business',
    title: 'Sanctioning Fees (Business) Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'money-and-business',
    shortDescription: 'What a sanctioning body charges to recognise a title fight, structurally.',
    alsoIn: ['boxing-belts'],
  },
  {
    slug: 'contract-terms-boxing',
    title: 'Boxing Contract Terms Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'money-and-business',
    shortDescription:
      'The general kinds of terms a fighter’s promotional and bout contracts contain.',
  },
  {
    slug: 'promotional-contract-explained',
    title: 'Promotional Contract Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'money-and-business',
    shortDescription:
      'The agreement binding a fighter to a promoter for a period or number of fights.',
  },
  {
    slug: 'sponsorship-in-boxing',
    title: 'Sponsorship in Boxing Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'money-and-business',
    shortDescription:
      'How sponsors relate to a fighter or an event, structurally rather than by figures.',
  },
  {
    slug: 'undercard-economics',
    title: 'Undercard Economics Explained',
    type: 'standard',
    difficulty: 'advanced',
    category: 'money-and-business',
    shortDescription:
      'How the commercial structure of a card’s supporting fights typically differs from the main event.',
  },
  {
    slug: 'boxing-economics-overview',
    title: 'How the Boxing Business Works (Overview)',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'money-and-business',
    shortDescription:
      'A structural overview of the roles and revenue streams behind a professional fight card.',
  },

  // ── Professional Records (Category 30) ─────────────────────────────────────
  {
    slug: 'win-loss-draw-record-explained',
    title: 'Win-Loss-Draw Record Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'professional-records',
    shortDescription:
      'How a professional boxer’s record is conventionally written, for example 40-2-1.',
  },
  {
    slug: 'ko-percentage-explained',
    title: 'KO Percentage Explained',
    type: 'statistic',
    difficulty: 'beginner',
    category: 'professional-records',
    shortDescription: 'The share of a boxer’s wins that came by knockout or technical knockout.',
  },
  {
    slug: 'no-contest-in-a-record',
    title: 'No Contest in a Record Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'professional-records',
    shortDescription: 'How a no-contest result is denoted separately from a win, loss or draw.',
  },
  {
    slug: 'undefeated-record-explained',
    title: 'Undefeated Record Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'professional-records',
    shortDescription: 'What it means for a boxer to hold a professional record with no losses.',
  },
  {
    slug: 'record-notation-conventions',
    title: 'Record Notation Conventions Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'professional-records',
    shortDescription:
      'How wins, losses, draws, no-contests and KOs are typically abbreviated together.',
  },
  {
    slug: 'amateur-vs-professional-records',
    title: 'Amateur vs Professional Records Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'professional-records',
    shortDescription: 'Why amateur results are not included in a professional record.',
    alsoIn: ['amateur-and-olympic-boxing'],
  },
  {
    slug: 'padded-record-concept',
    title: '"Padded" Record Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'professional-records',
    shortDescription:
      'The informal, disputed idea that a record can look stronger than the level of opposition it was built against.',
  },
  {
    slug: 'quality-of-opposition-concept',
    title: 'Quality of Opposition Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'professional-records',
    shortDescription: 'Why a record alone does not fully describe how strong a boxer’s resume is.',
  },
  {
    slug: 'record-vs-resume-distinction',
    title: 'Record vs Resume: The Distinction Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'professional-records',
    shortDescription:
      'The difference between a numeric record and a qualitative assessment of who a boxer has beaten.',
  },
  {
    slug: 'vacated-results-and-records',
    title: 'How Overturned Results Affect a Record Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'professional-records',
    shortDescription: 'How a record is adjusted when a result is later overturned by a commission.',
  },
  {
    slug: 'first-professional-fight-explained',
    title: 'Professional Debut Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'professional-records',
    shortDescription:
      'A boxer’s first sanctioned fight as a professional, the start of their official record.',
  },
  {
    slug: 'consecutive-title-defences-record',
    title: 'Consecutive Title Defences Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'professional-records',
    shortDescription:
      'A record tracked by how many times a champion has successfully defended a title without interruption.',
  },

  // ── Boxing Statistics (Category 31) ────────────────────────────────────────
  {
    slug: 'punches-thrown-explained',
    title: 'Punches Thrown Explained',
    type: 'statistic',
    difficulty: 'beginner',
    category: 'boxing-statistics',
    shortDescription:
      'A count of every punch attempted by a boxer, compiled by trained observers rather than measured automatically.',
  },
  {
    slug: 'punches-landed-explained',
    title: 'Punches Landed Explained',
    type: 'statistic',
    difficulty: 'beginner',
    category: 'boxing-statistics',
    shortDescription:
      'A count of punches judged to have connected, subject to the same observer-based limitations as punches thrown.',
  },
  {
    slug: 'connect-percentage-explained',
    title: 'Connect Percentage Explained',
    type: 'statistic',
    difficulty: 'beginner',
    category: 'boxing-statistics',
    shortDescription:
      'Landed punches as a share of punches thrown, an imprecise but widely quoted efficiency figure.',
  },
  {
    slug: 'jabs-vs-power-punches-stat',
    title: 'Jabs vs Power Punches (Stat Split) Explained',
    type: 'statistic',
    difficulty: 'intermediate',
    category: 'boxing-statistics',
    shortDescription:
      'How punch-tracking systems commonly separate jabs from power punches in their totals.',
  },
  {
    slug: 'head-vs-body-punch-stats',
    title: 'Head vs Body Punch Stats Explained',
    type: 'statistic',
    difficulty: 'intermediate',
    category: 'boxing-statistics',
    shortDescription: 'How punch-tracking systems commonly split landed punches by target.',
  },
  {
    slug: 'punch-stat-limitations',
    title: 'Why Punch Stats Are Not Perfectly Objective',
    type: 'statistic',
    difficulty: 'intermediate',
    category: 'boxing-statistics',
    shortDescription:
      'Punch counts are compiled by trained human observers reviewing footage, not sensors, and different providers can produce different totals for the same fight.',
  },
  {
    slug: 'round-by-round-punch-stats',
    title: 'Round-by-Round Punch Stats Explained',
    type: 'statistic',
    difficulty: 'beginner',
    category: 'boxing-statistics',
    shortDescription: 'How punch totals are broken down per round on broadcast graphics.',
  },
  {
    slug: 'output-and-activity-stats',
    title: 'Output & Activity Explained',
    type: 'statistic',
    difficulty: 'intermediate',
    category: 'boxing-statistics',
    shortDescription:
      'A general measure of how many punches a fighter throws relative to their opponent.',
  },
  {
    slug: 'accuracy-vs-volume-stats',
    title: 'Accuracy vs Volume Explained',
    type: 'statistic',
    difficulty: 'intermediate',
    category: 'boxing-statistics',
    shortDescription:
      'The trade-off between throwing fewer, more accurate punches and throwing a higher volume.',
  },
  {
    slug: 'defensive-stats-explained',
    title: 'Defensive Statistics Explained',
    type: 'statistic',
    difficulty: 'intermediate',
    category: 'boxing-statistics',
    shortDescription:
      'Punches avoided or blocked, tracked far less consistently across broadcasts than offensive numbers.',
  },
  {
    slug: 'stat-providers-differences',
    title: 'How Punch-Counting Providers Differ Explained',
    type: 'statistic',
    difficulty: 'advanced',
    category: 'boxing-statistics',
    shortDescription:
      'Why different broadcast statistics services can report different totals for the same fight.',
  },
  {
    slug: 'reading-a-broadcast-stat-graphic',
    title: 'Reading a Broadcast Punch-Stat Graphic Explained',
    type: 'statistic',
    difficulty: 'beginner',
    category: 'boxing-statistics',
    shortDescription: 'How to interpret the punch-count overlay shown during a televised fight.',
  },

  // ── Advanced Analysis (Category 32) ────────────────────────────────────────
  {
    slug: 'power-ranking-models',
    title: 'Power Ranking Models Explained',
    type: 'statistic',
    difficulty: 'advanced',
    category: 'advanced-analysis',
    shortDescription:
      'Analyst-built models attempting to rank fighters beyond a simple win-loss record or media poll.',
  },
  {
    slug: 'style-based-matchup-analysis',
    title: 'Style-Based Matchup Analysis Explained',
    type: 'standard',
    difficulty: 'advanced',
    category: 'advanced-analysis',
    shortDescription:
      'Analytical approaches that predict fight outcomes from stylistic tendencies rather than raw record.',
  },
  {
    slug: 'punch-output-trends-analysis',
    title: 'Punch Output Trends Explained',
    type: 'statistic',
    difficulty: 'advanced',
    category: 'advanced-analysis',
    shortDescription:
      'Tracking how a fighter’s output and accuracy change over the course of a career or a fight.',
  },
  {
    slug: 'chin-and-durability-analysis',
    title: 'Chin & Durability (As an Analytical Concept) Explained',
    type: 'standard',
    difficulty: 'advanced',
    category: 'advanced-analysis',
    shortDescription:
      'How analysts informally discuss a fighter’s ability to absorb punches, an inherently qualitative and imprecise idea.',
  },
  {
    slug: 'aging-curve-analysis-boxing',
    title: 'Aging Curve Analysis Explained',
    type: 'statistic',
    difficulty: 'advanced',
    category: 'advanced-analysis',
    shortDescription:
      'How analysts discuss the general pattern of a boxer’s performance changing with age.',
  },
  {
    slug: 'opponent-strength-adjusted-stats',
    title: 'Opponent-Strength-Adjusted Statistics Explained',
    type: 'statistic',
    difficulty: 'advanced',
    category: 'advanced-analysis',
    shortDescription:
      'Attempts to adjust a fighter’s raw statistics for the quality of opposition faced.',
  },
  {
    slug: 'predictive-fight-models',
    title: 'Predictive Fight Models Explained',
    type: 'standard',
    difficulty: 'advanced',
    category: 'advanced-analysis',
    shortDescription:
      'Analyst-built models that estimate a fight’s likely outcome from historical data.',
  },
  {
    slug: 'compubox-methodology-explained',
    title: 'Punch-Counting Methodology Explained',
    type: 'statistic',
    difficulty: 'advanced',
    category: 'advanced-analysis',
    shortDescription:
      'How trained observers compile televised punch statistics, and the limits of that method.',
  },
  {
    slug: 'defensive-efficiency-metrics',
    title: 'Defensive Efficiency Metrics Explained',
    type: 'statistic',
    difficulty: 'advanced',
    category: 'advanced-analysis',
    shortDescription:
      'Derived, less standardised attempts to quantify how well a fighter avoids being hit.',
  },
  {
    slug: 'fight-iq-concept',
    title: '"Fight IQ" Explained',
    type: 'standard',
    difficulty: 'advanced',
    category: 'advanced-analysis',
    shortDescription:
      'An informal, qualitative term for a fighter’s in-ring decision-making, not a measured statistic.',
  },
  {
    slug: 'granular-punch-location-tracking',
    title: 'Punch Location Tracking Explained',
    type: 'statistic',
    difficulty: 'advanced',
    category: 'advanced-analysis',
    shortDescription:
      'More detailed, less widely available tracking of exactly where punches land.',
  },
  {
    slug: 'fight-simulation-analysis',
    title: 'Fight Simulation Analysis Explained',
    type: 'standard',
    difficulty: 'advanced',
    category: 'advanced-analysis',
    shortDescription:
      'Modelling approaches used by some analysts to simulate hypothetical fight outcomes.',
  },
  {
    slug: 'career-trajectory-analysis',
    title: 'Career Trajectory Analysis Explained',
    type: 'standard',
    difficulty: 'advanced',
    category: 'advanced-analysis',
    shortDescription:
      'Analytical approaches to describing how a boxer’s level has changed over a career.',
  },
  {
    slug: 'style-matchup-prediction-models',
    title: 'Style Matchup Prediction Models Explained',
    type: 'standard',
    difficulty: 'advanced',
    category: 'advanced-analysis',
    shortDescription:
      'Models that attempt to predict outcomes from stylistic archetype pairings rather than raw stats alone.',
  },
  {
    slug: 'workrate-analysis',
    title: 'Work Rate Analysis Explained',
    type: 'statistic',
    difficulty: 'advanced',
    category: 'advanced-analysis',
    shortDescription:
      'Analytical approaches to a fighter’s punch output relative to the pace of a fight.',
  },
  {
    slug: 'ring-iq-and-adaptability',
    title: 'Ring IQ & Adaptability Explained',
    type: 'standard',
    difficulty: 'advanced',
    category: 'advanced-analysis',
    shortDescription:
      'An informal analytical concept describing how well a fighter adjusts strategy within a fight.',
  },
  {
    slug: 'limitations-of-boxing-analytics',
    title: 'Limitations of Boxing Analytics Explained',
    type: 'standard',
    difficulty: 'advanced',
    category: 'advanced-analysis',
    shortDescription:
      'Why boxing analytics remain far less standardised than in sports with automated tracking data.',
  },

  // ── Amateur & Olympic Boxing (Category 33) ─────────────────────────────────
  {
    slug: 'amateur-boxing-overview-explainer',
    title: 'Amateur Boxing Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'amateur-and-olympic-boxing',
    shortDescription:
      'How amateur boxing’s structure and scoring differ from the professional sport.',
  },
  {
    slug: 'amateur-scoring-system-explained',
    title: 'Amateur Scoring System Explained',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'amateur-and-olympic-boxing',
    shortDescription:
      'How amateur bouts are scored, geared more toward landed legal blows than the professional criteria.',
  },
  {
    slug: 'headgear-in-amateur-boxing',
    title: 'Headgear in Amateur Boxing Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'amateur-and-olympic-boxing',
    shortDescription:
      'How the use of protective headgear in amateur competition has varied by category and era.',
  },
  {
    slug: 'olympic-qualification-explained',
    title: 'Olympic Boxing Qualification Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'amateur-and-olympic-boxing',
    shortDescription:
      'How boxers earn places at the Games through continental and world qualifying events.',
  },
  {
    slug: 'olympic-boxing-bracket-explained',
    title: 'Olympic Boxing Tournament Bracket Explained',
    type: 'format',
    difficulty: 'beginner',
    category: 'amateur-and-olympic-boxing',
    shortDescription:
      'The single-elimination structure Olympic boxing is contested under, by weight class.',
  },
  {
    slug: 'olympic-boxing-governance-explained',
    title: 'Olympic Boxing Governance Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'amateur-and-olympic-boxing',
    shortDescription:
      'A structural description of how Olympic boxing has been administered in recent cycles, without naming a current recognised federation as settled.',
  },
  {
    slug: 'national-federations-explained',
    title: 'National Boxing Federations Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'amateur-and-olympic-boxing',
    shortDescription:
      'The country-level bodies that oversee amateur boxing and select athletes for international competition.',
  },
  {
    slug: 'golden-gloves-explained',
    title: 'Golden Gloves Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'amateur-and-olympic-boxing',
    shortDescription: 'A well-known tier of national amateur boxing competition.',
  },
  {
    slug: 'amateur-to-professional-transition',
    title: 'Amateur to Professional Transition Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'amateur-and-olympic-boxing',
    shortDescription:
      'What typically changes for a boxer moving from the amateur ranks into professional competition.',
  },
  {
    slug: 'continental-championships-explained',
    title: 'Continental Boxing Championships Explained',
    type: 'standard',
    difficulty: 'intermediate',
    category: 'amateur-and-olympic-boxing',
    shortDescription:
      'Regional amateur championships that sit alongside the Olympics in the amateur competition calendar.',
  },
  {
    slug: 'olympic-medal-rounds-explained',
    title: 'Olympic Medal Rounds Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'amateur-and-olympic-boxing',
    shortDescription:
      'How the bronze and gold medal stages of the Olympic boxing tournament are structured.',
  },
];
