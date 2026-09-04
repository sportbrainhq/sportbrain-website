import {
  definition,
  fightResult,
  judgingConcept,
  rule,
  standard,
  technique,
} from './boxing-explainer-helpers';
import type { ExplainerSeed, SourceSeed } from './explainer-types';

/**
 * The written boxing explainers: Start Here and Terminology.
 *
 * These override the taxonomy placeholders in `boxing-explainer-taxonomy.ts`
 * by slug. Anything left as a placeholder there stays a draft and never
 * reaches the site. This is phase 1 of the boxing library; every other
 * category is taxonomy only for now, exactly as golf's and American
 * football's below-the-fold categories were before their own later phases.
 *
 * ## On duplication with the overview
 *
 * `boxing-overview.ts` answers "what is this" (a jab is a quick lead-hand
 * punch; judges use the ten-point must system); these explainers answer "how
 * exactly does this work" (how a jab is actually thrown and set up; how a
 * judge actually arrives at 10-9 rather than 10-8 on a close round). Nothing
 * here repeats the Overview's own sentences, and several entries below
 * explicitly go a level deeper than the Overview's equivalent paragraph.
 *
 * ## On the six reserved slugs
 *
 * `boxing-overview.ts` sets `explainerSlug` optimistically on six
 * `BOXING_CONCEPTS` rows, naming: `boxing-punches-explained`,
 * `boxing-fundamentals-explained`, `boxing-fight-results-explained`,
 * `how-boxing-judging-works`, `how-boxing-titles-work` and
 * `boxing-weight-classes-explained`. All six are written in full below, as
 * part of the Start Here spine, so the Overview's links resolve.
 *
 * ## On terminology
 *
 * The A-Z glossary intentionally stays short: 1-3 sentences a broadcast uses
 * without pausing to explain. Where a term has a fuller Start Here entry or a
 * deeper draft elsewhere in the taxonomy, `related` points there rather than
 * the glossary entry trying to teach the whole concept twice.
 */

const GENERAL: ExplainerSeed['sourceKeys'] = [{ key: 'wp-boxing' }];

export const BOXING_EXPLAINER_SOURCES: SourceSeed[] = [
  {
    key: 'wp-boxing',
    provider: 'wikipedia',
    title: 'Boxing',
    url: 'https://en.wikipedia.org/wiki/Boxing',
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
    key: 'wp-promoter-boxing',
    provider: 'wikipedia',
    title: 'Boxing promoter',
    url: 'https://en.wikipedia.org/wiki/Boxing_promoter',
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
    key: 'wp-clinch',
    provider: 'wikipedia',
    title: 'Clinching',
    url: 'https://en.wikipedia.org/wiki/Clinching',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-jab',
    provider: 'wikipedia',
    title: 'Jab',
    url: 'https://en.wikipedia.org/wiki/Jab',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-boxing-stance',
    provider: 'wikipedia',
    title: 'Boxing stance',
    url: 'https://en.wikipedia.org/wiki/Boxing_stance',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-catchweight',
    provider: 'wikipedia',
    title: 'Catchweight',
    url: 'https://en.wikipedia.org/wiki/Catchweight',
    license: 'CC BY-SA 4.0',
  },
];

export const BOXING_EXPLAINERS: ExplainerSeed[] = [
  // ══ Start Here ═══════════════════════════════════════════════════════════
  standard({
    slug: 'boxing-in-5-minutes',
    title: 'Boxing in 5 Minutes',
    category: 'start-here',
    aliases: [
      'boxing in 5 minutes',
      'boxing basics',
      'boxing for beginners',
      'introduction to boxing',
    ],
    summary: 'Everything you need to follow a fight, in the order you need it.',
    isStartHere: true,
    isFeatured: true,
    order: 10,
    readMinutes: 5,
    sourceKeys: GENERAL,
    explanation: `Boxing is a fight between two people, matched by weight, using punches only. It happens inside a roped square called a ring, split into rounds, and it ends either because one fighter cannot continue or because judges decide who did better once the rounds are up.

That is the whole sport at its simplest. Everything else, the punches, the stances, the belts, is detail layered on top of that one contest.`,
    howItWorks: `A fight is scheduled for a set number of **rounds**, commonly 3 minutes each with a 1-minute break between them. Championship fights commonly run 12 rounds; other fights are often shorter.

Each fighter throws punches, jabs, crosses, hooks and uppercuts, trying to land clean and avoid being hit back. If a fighter is knocked down and cannot get up in time, or the referee decides they cannot safely continue, the fight ends by stoppage. If neither happens, the fight goes the full distance and three ringside **judges** decide the winner from their scorecards.

Fighters are matched inside **weight classes** so a fight is between two people of similar size, and professional fighters can hold titles from one of several separate sanctioning bodies at once, which is why boxing often has more than one "world champion" in a division.`,
    example: `A 12-round championship fight. Through six rounds it is close. In round 7, one fighter lands a clean right hand and the other goes down, beating the referee's count but clearly hurt. The fight continues, but that fighter loses every remaining round on two of the three scorecards and the fight goes the distance. The final scorecards read 116-111, 115-112, 114-113: a **unanimous decision** for the fighter who scored the knockdown.`,
    whyItMatters: `Most of what makes boxing confusing to a new viewer, why a "close" fight can end in a wide scorecard, why there can be four different champions in one division, why a fight sometimes stops for reasons that have nothing to do with a knockout, has a specific, learnable answer. None of it is arbitrary once you know where to look.`,
    misunderstandings: `**A knockdown does not end the fight by itself.** A fighter can be knocked down, get back up, and go on to win. Only failing to beat the count, or the referee stepping in, actually ends it there.

**Judges do not simply count landed punches.** They weigh clean punching, effective aggression, ring control and defence together, which is why two competent judges can score the same round differently.

**"World champion" is not one title.** Four separate organisations, the WBA, WBC, IBF and WBO, each crown their own champion per weight class, so being a champion does not automatically mean being the only one.`,
    takeaways: `- Punches only, fought in rounds, decided by stoppage or by judges' scorecards.
- Fighters are matched by weight class.
- A fight can end by knockout, technical knockout, decision, disqualification or another stoppage.
- Judging weighs clean punching, aggression, ring control and defence, not just a punch count.
- Boxing has four major sanctioning bodies rather than one single governing body, so more than one "champion" can exist in a division at once.`,
    related: [
      'how-boxing-works',
      'boxing-fight-results-explained',
      'boxing-rules-explained',
      'how-boxing-judging-works',
      'boxing-punches-explained',
    ],
  }),

  standard({
    slug: 'how-boxing-works',
    title: 'How Boxing Works',
    category: 'start-here',
    aliases: ['how boxing works', 'how does boxing work', 'boxing mechanics'],
    summary:
      'The mechanics of a fight: rounds, the bell, the corner, and how it all fits together.',
    isStartHere: true,
    order: 20,
    readMinutes: 6,
    sourceKeys: GENERAL,
    explanation: `A boxing match is a sequence of short, identical periods, rounds, separated by rest. Nothing about the structure changes from round to round; what changes is what each fighter does inside it and how tired they get doing it.`,
    howItWorks: `**Before the bell.** Fighters are already in the ring, in their own corner, with their team, a head trainer, sometimes an assistant, and for a professional bout a cutman, standing by outside the ropes.

**The round.** A bell starts the round. Both fighters fight for the scheduled length, commonly 3 minutes professionally, until a second bell ends it. A referee is inside the ring throughout, free to stop the action for a foul, a knockdown count, or a safety concern at any point.

**Between rounds.** Fighters return to their corner for a rest, commonly 1 minute. The corner works cuts, gives water, and gives instruction for the next round. This is the only point in a fight where a fighter gets direct coaching.

**Ending early.** A round, and the fight, can end before the scheduled time if a fighter is knocked out, if the fight is stopped for safety, or if a fighter is disqualified for a serious foul.

**Going the distance.** If the fight reaches its final bell without a stoppage, it goes to the judges' scorecards, and whichever fighter has been awarded more rounds overall wins by decision.`,
    example: `A scheduled 8-round fight. Rounds 1 through 8 are fought and scored individually by three judges. No knockdown or stoppage occurs. At the final bell, the judges' round-by-round totals are added up and read out as the final scorecards, deciding the winner by decision.`,
    whyItMatters: `Because a round is a fixed, repeating unit, a fight is really eighteen or so separate small contests (rounds) stacked together rather than one continuous 36-minute battle. A fighter can lose the first six rounds and still win the fight by dominating the rest, which is exactly the shape a genuine "comeback" fight takes.`,
    misunderstandings: `**The referee is not one of the three judges.** The referee controls the fight itself, fouls, counts, stoppages, and does not score rounds. Scoring is done separately by three ringside judges.

**A round is not simply "won" by whoever is more aggressive.** Aggression only counts when it is effective; retreating and countering well can win a round too.`,
    takeaways: `- A fight is a fixed sequence of rounds with rest between them.
- The referee runs the fight; three separate judges score it.
- A fight can end early by stoppage, or go the distance to a decision.
- Corner instruction only happens in the minute between rounds.`,
    related: [
      'boxing-in-5-minutes',
      'boxing-rules-explained',
      'how-boxing-judging-works',
      'how-boxing-fights-are-made',
    ],
  }),

  fightResult({
    slug: 'boxing-fight-results-explained',
    title: 'How Do You Win a Boxing Match?',
    category: 'start-here',
    aliases: ['how to win a boxing match', 'ways to win a boxing fight', 'boxing win conditions'],
    summary: 'Every official way a boxing match can end, in plain terms.',
    difficulty: 'beginner',
    isStartHere: true,
    order: 30,
    readMinutes: 6,
    sourceKeys: [
      { key: 'wp-knockout' },
      { key: 'wp-technical-knockout' },
      { key: 'wp-ten-point-must-boxing' },
    ],
    theResult: `A boxing match ends in one of a small, fixed set of ways, and every one of them is an official result recorded to both fighters' records. There is no other way for a fight to conclude.

**Knockout (KO).** A fighter is knocked down and cannot rise and continue within the referee's count.

**Technical knockout (TKO).** The referee, a doctor, or a fighter's own corner stops the fight before a full knockout, because a fighter can no longer safely or competitively continue.

**Decision.** The fight goes the scheduled distance with no stoppage, and the judges' scorecards decide the winner: unanimous, split, or majority, or the cards do not agree at all and it is a draw.

**Disqualification (DQ).** A fighter is disqualified for a serious rule violation, most often after repeated warnings.

**Technical decision.** The fight is stopped early, most often by an accidental injury such as a clash of heads, and is decided on the scorecards up to that point rather than fought to its scheduled distance.

**No contest.** The fight is ruled to have no official winner at all, under specific circumstances set out in the applicable rules, for instance an injury in an early round before enough of the fight has been scored to decide it fairly.`,
    howItIsScored: `Only decisions and technical decisions actually rely on the judges' scorecards. Every other result on this list is decided by the referee, a doctor, or the fight simply not happening: none of them need a scorecard to be read out.`,
    example: `Fighter A knocks Fighter B down twice in round 4. Fighter B beats both counts and the fight continues. In round 9, Fighter B is caught again, goes down a third time, and the referee waves the fight off without a count, judging Fighter B unable to defend themselves safely. That is a technical knockout (TKO) for Fighter A, not a knockout, because the referee stopped it rather than counting Fighter B out.`,
    dangerAndStoppage: `Every stoppage-based result on this list, KO, TKO, a doctor stoppage, exists specifically to end a fight before a fighter absorbs more punishment than is safe. A referee or doctor can stop a fight even over a fighter's own objection, and this is treated in the sport as a legitimate exercise of authority rather than a failure to let the fighter continue.`,
    misunderstandings: `**A knockout and a technical knockout are not the same result, even though both mean the fight was stopped by punches.** A KO specifically means a fighter failed to beat the referee's count after a knockdown. A TKO covers every other stoppage, cuts, a one-sided beating with no actual count, a doctor's call, and is far more common than a pure KO in modern boxing.

**A draw is a real, official result, not a non-result.** It happens when the judges' scorecards genuinely do not agree on a winner.

**Disqualification is rare and deliberate.** It requires a serious, often repeated rule violation, not a single accidental foul.`,
    related: ['how-boxing-judging-works', 'boxing-rules-explained', 'boxing-in-5-minutes'],
  }),

  rule({
    slug: 'boxing-rules-explained',
    title: 'Boxing Rules Explained',
    category: 'start-here',
    aliases: ['boxing rules', 'rules of boxing', 'basic boxing rules'],
    summary:
      'The core rules that govern a fight: what is allowed, what is not, and who enforces it.',
    difficulty: 'beginner',
    isStartHere: true,
    order: 40,
    readMinutes: 6,
    sourceKeys: [{ key: 'wp-boxing' }, { key: 'wp-queensberry-rules' }],
    theRule: `Modern boxing's rules descend from the **Marquess of Queensberry Rules**, published in 1867, which introduced timed rounds, a ten-second count and gloved fighting. Professional boxing today is regulated at the state or national level by athletic commissions rather than by one single global rulebook, so exact procedures can vary in detail between jurisdictions, but the shared core is consistent almost everywhere.

**Punches only, above the belt.** Only closed-fist punches are legal, and only when aimed at the front or sides of the head and body, above the beltline.

**No hitting a downed fighter.** Once any part of a fighter other than their feet touches the canvas, or they are held up only by the ropes, they may not be struck until they are back up and the referee has resumed the action.

**No holding, no low blows, no illegal contact.** Excessive holding, hitting behind the head (a "rabbit punch"), hitting the kidneys, headbutting, biting, and hitting below the belt are all fouls.

**The referee controls the fight.** Only the referee can stop the action, issue a warning, deduct a point, or stop the fight outright. Judges do not have this authority; they only score.`,
    dangerAndStoppage: `The referee's authority to stop a fight for safety, regardless of the scorecards or either fighter's wishes, sits above every other rule in the sport. A referee who judges a fighter unable to intelligently defend themselves can and will stop a fight even mid-round.`,
    inPractice: `Most fouls in practice are warned first rather than immediately punished. A referee typically warns a fighter for a first low blow or a first bit of excessive holding; repeated or deliberate fouls escalate to a point deduction, and a serious or repeated foul can lead to disqualification.

A low blow that clearly hurts a fighter allows a recovery period, commonly up to five minutes, before the fight resumes, without it being scored as a knockdown.`,
    formatDifferences: `Amateur boxing applies a broadly similar foul framework but is generally scored and refereed with somewhat greater emphasis on landed legal blows and safety, and amateur bouts commonly run shorter than professional ones. Exact scoring and safety procedures differ by federation.`,
    misunderstandings: `**A low blow is not automatically a disqualification.** A single accidental low blow typically earns a warning and, if needed, recovery time, not an ending to the fight.

**Boxing does not have one single worldwide rulebook.** Rules are set and enforced by national and state athletic commissions, and by sanctioning bodies for their own title fights, so small procedural details can differ between jurisdictions even though the core rules are shared.`,
    related: [
      'how-boxing-judging-works',
      'boxing-fight-results-explained',
      'boxing-ring-explained',
      'professional-vs-amateur-boxing',
    ],
  }),

  judgingConcept({
    slug: 'how-boxing-judging-works',
    title: 'Boxing Scoring Explained',
    category: 'start-here',
    aliases: [
      'boxing scoring',
      'boxing scoring explained',
      'how is boxing scored',
      'boxing points system',
    ],
    summary: 'How a round is actually scored, and how those scores add up to a result.',
    difficulty: 'beginner',
    isStartHere: true,
    order: 50,
    readMinutes: 6,
    sourceKeys: [{ key: 'wp-ten-point-must-boxing' }],
    howItWorks: `Professional boxing is commonly scored under the **ten-point must system**. Each of three ringside judges independently scores every round: the round's winner "must" receive 10 points, and the loser receives 9, or fewer if the round was especially one-sided, most often because of a knockdown.

Judges are not just counting landed punches. They weigh, in roughly this order of emphasis: **clean and effective punching** (did meaningful, unblocked shots land), **effective aggression** (did forward pressure actually accomplish something, not just move forward), **ring generalship** (who controlled the pace, distance and position), and **defence** (who avoided being hit). Two competent judges can watch the same round and reasonably score it differently, because these are judgement calls, not a tally.`,
    example: `A close round with no knockdown, where Fighter A lands slightly more clean punches and controls distance, is scored **10-9** for Fighter A. A round where Fighter A also scores a knockdown is typically scored **10-8**. Across a 10-round fight with those patterns repeating, one judge might score it 96-94 for Fighter A while another, weighing a couple of rounds differently, scores it 97-93. Both can be defensible readings of the same fight.`,
    howToInterpret: `A final scorecard, for example "116-111", is simply the sum of that one judge's round-by-round scores. Comparing scorecards from different judges shows how much agreement there was: three very similar totals suggest a fight most people would have scored the same way; totals that diverge sharply suggest a genuinely close or ambiguous fight, or a real difference in how the judges weighed the criteria.`,
    misunderstandings: `**Judges do not simply add up who threw or landed more punches.** Broadcast punch-count graphics are a separate, independently compiled statistic and are not what judges use.

**A knockdown does not automatically make a round 10-8.** It is common, but a judge can still score a round 10-9 despite a knockdown if the rest of the round was clearly won by the fighter who was dropped, and can score a very one-sided round 10-8 even without one.

**A "close" fight on paper is not always close to watch.** Scorecards reflect three individual judgements made live in real time, not a single objective measurement.`,
    related: ['boxing-rules-explained', 'boxing-fight-results-explained'],
  }),

  standard({
    slug: 'boxing-ring-explained',
    title: 'Boxing Ring Explained',
    category: 'start-here',
    aliases: ['boxing ring', 'what is a boxing ring'],
    summary: 'The square platform a fight is contested in, and what each part of it is for.',
    difficulty: 'beginner',
    isStartHere: true,
    order: 60,
    readMinutes: 4,
    sourceKeys: [{ key: 'wp-boxing-ring' }],
    explanation: `A boxing **ring** is, despite the name, square rather than circular: a raised, roped platform where a fight takes place. Its size varies somewhat by promotion and venue, but the basic shape and layout are consistent everywhere the sport is contested.`,
    howItWorks: `The fighting surface is the **canvas**, a padded platform stretched over the ring frame, typically raised above the arena floor so spectators can see over the front rows. Around it, several strands of rope are strung between four corner **posts**, with padding, marking the boundary of play.

Each of the four corners has a role. Two are the fighters' own corners, where their trainers, cutmen and other team members work between rounds. The other two are **neutral corners**: during a knockdown count, the standing fighter is sent to whichever neutral corner is nearest, so they are not looming over their downed opponent while the referee counts.

Outside the ropes sit the three judges, the timekeeper, and, for a professional card, broadcast and ringside medical staff. The referee is the only official who works inside the ropes during the fight itself.`,
    whyItMatters: `The neutral-corner rule exists purely for fairness and safety during a count: a fighter cannot legally stand over a downed opponent waiting to strike again the instant they rise. Knowing to look for an empty neutral corner is often the fastest way to tell, at a glance, that a count is underway.`,
    misunderstandings: `**A boxing "ring" is not round.** The name is historical, from an earlier era when fights were fought in an actual roped circle rather than the square platform used today.

**Ring size is not fixed by a single universal standard.** Commissions and promotions permit a range of sizes, so the ring at one event is not necessarily the same size as at another.`,
    takeaways: `- The ring is square, not round, despite its name.
- The canvas is the padded fighting surface.
- Two corners belong to the fighters; two are neutral, used during a knockdown count.
- Only the referee works inside the ropes during the fight.`,
    related: ['boxing-rules-explained', 'how-boxing-fights-are-made'],
  }),

  standard({
    slug: 'boxing-weight-classes-explained',
    title: 'Boxing Weight Classes Explained',
    category: 'start-here',
    aliases: ['boxing weight classes', 'boxing divisions', 'weight divisions boxing'],
    summary: 'Why boxing is split into divisions, and how the traditional ladder is organised.',
    difficulty: 'beginner',
    isStartHere: true,
    order: 70,
    readMinutes: 5,
    sourceKeys: [{ key: 'wp-weight-class-boxing' }],
    explanation: `A **weight class** is a division defined by a maximum body weight, checked at an official weigh-in, so that fighters compete only against opponents of a similar size. Without weight classes, sheer size would dominate the sport far more than skill.`,
    howItWorks: `Fighters must weigh at or under their division's limit at the official weigh-in, commonly held the day before a professional fight. The traditional men's professional ladder runs from lightest to heaviest through 17 divisions: Minimumweight, Light Flyweight, Flyweight, Super Flyweight, Bantamweight, Super Bantamweight, Featherweight, Super Featherweight, Lightweight, Super Lightweight, Welterweight, Super Welterweight, Middleweight, Super Middleweight, Light Heavyweight, Cruiserweight and Heavyweight.

The "Super" divisions sit between two traditional classes rather than above the top of the ladder; a Super Welterweight, for instance, is heavier than a Welterweight but lighter than a Middleweight. Women's professional boxing and amateur boxing each use their own division structures rather than a direct mirror of the men's professional ladder, and exact weight limits and division names are not identical across every sanctioning body.`,
    example: `A fighter who weighs in at 146 pounds has made weight for Welterweight (147-pound limit) but not for Super Lightweight (140-pound limit); they would need to move up a division, or lose weight, to fight there instead.`,
    whyItMatters: `Weight classes are also why a boxer's career narrative often includes "moving up" or "moving down" in weight, a genuinely significant decision, since strength, punch resistance and speed all change with weight in ways that are not simple to predict.`,
    misunderstandings: `**Weight class limits are not identical everywhere.** Names and exact poundage can vary slightly between sanctioning bodies for the same nominal division.

**A fighter's fight weight is not their walk-around weight.** Many professional fighters weigh noticeably more on fight night than at the previous day's weigh-in, having rehydrated after cutting weight to make the limit.`,
    takeaways: `- Weight classes match fighters of similar size.
- The traditional men's professional ladder has 17 divisions, from Minimumweight to Heavyweight.
- "Super" divisions sit between two traditional classes, not above the top.
- Names and limits vary somewhat by sanctioning body, and women's and amateur boxing use their own structures.`,
    related: [
      'professional-vs-amateur-boxing',
      'why-boxing-has-so-many-belts',
      'how-boxing-titles-work',
    ],
  }),

  technique({
    slug: 'boxing-punches-explained',
    title: 'Boxing Punches Explained',
    category: 'start-here',
    alsoIn: ['punches'],
    aliases: ['boxing punches', 'types of boxing punches', 'punches in boxing'],
    summary: 'The four basic punches, how each is thrown, and what each is for.',
    difficulty: 'beginner',
    isStartHere: true,
    order: 80,
    readMinutes: 6,
    sourceKeys: [{ key: 'wp-jab' }, { key: 'wp-boxing' }],
    theTechnique: `Every punch in boxing is a variation on four basic shots, defined by which hand throws them and the path the fist travels.

**Jab.** A quick, straight punch with the lead hand (the hand nearer the opponent in a fighter's stance), thrown from the shoulder with little windup. It is the sport's most frequently thrown punch by a wide margin.

**Cross.** A straight punch with the rear hand, thrown by rotating the hips and shoulders behind it. Typically a fighter's hardest single straight punch, because the whole body's weight can turn into it.

**Hook.** A punch that travels in a tight, horizontal arc rather than a straight line, thrown with either hand, aimed at the side of the head or body. The elbow stays bent throughout rather than extending, which is what gives a hook its distinctive shape.

**Uppercut.** A punch that rises vertically from below, thrown with either hand at close range, aimed up under the chin or into the body. Because it comes from underneath a fighter's own guard, it is often harder for an opponent to see coming than a straight punch.

Punches are also aimed low, at the body rather than the head, body jabs, body hooks and straight punches to the body among them, used to wear an opponent down across a fight rather than end it in one shot.`,
    recognition: `A jab is the easiest punch to spot: it is thrown often, snaps out and back quickly, and rarely turns the shoulder much. A cross visibly rotates the hips and rear shoulder forward. A hook is recognisable by the bent elbow travelling sideways rather than forward. An uppercut is recognisable by its upward path and is almost always thrown at close range, since it has little reach.`,
    whenUsed: `Fighters typically lead combinations with a jab to measure distance and disrupt an opponent's rhythm before committing to a harder cross, hook or uppercut. Combinations chain these punches together, most famously the "one-two" (jab, then cross), rather than a fighter relying on a single punch type alone.`,
    advantages: `Each punch trades speed for power differently. The jab is fastest and safest to throw, since it exposes the least of a fighter's own guard. The cross carries the most straight-line power. Hooks and uppercuts are shorter-range but harder to see coming and better suited to close-quarters exchanges.`,
    risks: `A missed or overextended cross, hook or uppercut can leave a fighter momentarily out of position and vulnerable to a counter, which is why setting punches up rather than simply throwing them raw is treated as a genuine skill in its own right.`,
    misunderstandings: `**A "jab" is not automatically a weak punch.** It is a fast punch thrown with less commitment than a cross, but a well-timed jab can still stagger an opponent, and some fighters build entire careers around jab dominance.

**A hook does not have to be thrown wide.** A well-thrown hook has a short, tight arc; a looping, wide hook is generally considered a technical flaw, easier to see coming and to slip.

**Punches thrown to the body still count in scoring**, and are not a lesser or purely defensive tactic; sustained body punching is a deliberate offensive strategy.`,
    related: [
      'boxing-defense-explained',
      'boxing-fundamentals-explained',
      'orthodox-stance',
      'southpaw-stance',
    ],
  }),

  standard({
    slug: 'boxing-defense-explained',
    title: 'Boxing Defense Explained',
    category: 'start-here',
    alsoIn: ['defense'],
    aliases: ['boxing defense', 'boxing defence', 'how to defend in boxing'],
    summary: 'The basic ways a boxer avoids getting hit, beyond simply blocking.',
    difficulty: 'beginner',
    isStartHere: true,
    order: 90,
    readMinutes: 5,
    sourceKeys: GENERAL,
    explanation: `Avoiding punches is at least as important to winning as landing them, and boxing has several distinct defensive tools rather than one universal technique. A fighter who can only block, without also moving and countering, tends to absorb a great deal of unnecessary punishment over a career.`,
    howItWorks: `**Guard.** The default defensive hand and arm position, held up to protect the head and body between exchanges.

**Blocking.** Using the gloves or forearms to absorb a punch directly, reducing its impact without avoiding it entirely.

**Slipping.** Moving the head just off the line of a straight punch so it misses completely, without moving the feet much.

**Bobbing and weaving.** Dropping and shifting the head in a small arc, most useful against hooks, which travel a path a simple slip does not clear.

**Parrying.** A small, deliberate hand movement that deflects a punch off its intended line rather than absorbing it.

**Footwork and distance.** Simply not being where a punch can land, by controlling range and angle, is often the most efficient defence of all, since a punch that cannot reach cannot hurt.

**Clinching.** Briefly grabbing hold of an opponent at close range to smother their punches, broken by the referee after a few seconds.`,
    whyItMatters: `A fighter who defends well not only avoids damage, they also set up their own offence: a slipped punch often leaves the opponent's head in a predictable spot for an immediate counter, which is why defence and counterpunching are taught as closely linked skills rather than separate ones.`,
    strategy: `Different defensive tools suit different situations. Blocking works well against single, direct shots but tires the arms and still absorbs some force. Head movement (slipping, bobbing and weaving) avoids force entirely but costs more energy and carries more risk if timed wrong. Footwork-based defence is the least tiring over a long fight but requires the most spatial awareness.`,
    misunderstandings: `**Defence is not passive.** The best defensive fighters are frequently also excellent counterpunchers, using an avoided punch as the trigger for their own attack rather than simply surviving the exchange.

**A high guard does not stop body punches.** Guard position alone leaves the body exposed unless a fighter also actively tucks the elbows or moves to protect it.`,
    takeaways: `- Guard, blocking, slipping, bobbing and weaving, parrying, footwork and clinching are the core defensive tools.
- Head movement avoids a punch's force entirely; blocking absorbs it.
- Good defence sets up counterpunching rather than only preventing damage.`,
    related: ['boxing-punches-explained', 'boxing-fundamentals-explained', 'orthodox-stance'],
  }),

  standard({
    slug: 'boxing-fundamentals-explained',
    title: 'Boxing Fundamentals: Footwork, Guard and Counterpunching',
    category: 'start-here',
    alsoIn: ['footwork', 'defense', 'counterpunching'],
    aliases: [
      'boxing fundamentals',
      'boxing basics footwork guard counterpunching',
      'boxing stance and footwork basics',
    ],
    summary:
      'The three skills that sit underneath both attack and defence: footwork, guard and counterpunching.',
    difficulty: 'beginner',
    isStartHere: true,
    order: 95,
    readMinutes: 5,
    sourceKeys: GENERAL,
    explanation: `Punches get the attention, but three quieter skills, footwork, guard and counterpunching, are what actually let a fighter throw punches safely and avoid the ones coming back. A boxer strong in these three is difficult to beat even with an ordinary set of punches; a boxer weak in them is vulnerable even with excellent ones.`,
    howItWorks: `**Footwork** is the positioning and movement of a boxer's feet, and it underlies both offence and defence. Small forward and backward steps close or open distance; circling moves a fighter around an opponent rather than straight back; pivoting changes the angle a fighter is fighting from entirely. Balance matters as much as speed: a fighter caught with their weight on the wrong foot cannot punch or defend effectively until it is corrected.

**Guard** is the default hand and arm position that protects the head and body between exchanges. It is not one fixed shape: a high guard keeps both hands beside the head, a shoulder-led guard (as in the Philly Shell style) uses the lead shoulder to block punches aimed at the chin, and different guards trade some protection in one area for better protection, or better counterpunching access, in another.

**Counterpunching** is throwing a punch in direct response to, or immediately after avoiding, an opponent's attack. Because an attacking opponent is briefly out of position, a well-timed counter often lands more easily and more cleanly than a punch thrown independently.`,
    example: `A fighter circles away from an opponent's power hand using footwork, keeps a tight guard as the opponent throws a jab, slips it with a small head movement, and immediately returns a right hand while the opponent is still recovering their stance: footwork to create the angle, guard to stay safe in the exchange, and a counter to capitalise on it, all in the same few seconds.`,
    whyItMatters: `These three skills are why some fighters look "hard to hit" and others look "always in the wrong place" even when neither is obviously landing more punches: footwork and guard largely decide how much offence an opponent's punches actually get to attempt, before counterpunching decides how much of that attempt gets turned back on them.`,
    strategy: `Fighters weight these skills differently by style. An out-fighter leans heavily on footwork to control distance and rarely needs to counter from very close range. A pressure fighter needs a tighter, more compact guard, since footwork alone will not keep them out of range by design. A counterpuncher invests specifically in reading an opponent's rhythm rather than in initiating exchanges.`,
    misunderstandings: `**Good footwork is not the same as constant movement.** Excessive, purposeless movement wastes energy; good footwork is deliberate, used to create or deny a specific angle or distance.

**A guard is not meant to be a static wall.** It is adjusted continuously depending on range, the opponent's stance, and what punch is expected next.`,
    takeaways: `- Footwork controls distance and angle for both attack and defence.
- Guard is not one fixed shape; different guards trade protection in different areas.
- Counterpunching rewards timing an opponent's own attack rather than raw speed.
- These three skills, more than any single punch, separate a hard-to-hit fighter from an easy one.`,
    related: [
      'boxing-punches-explained',
      'boxing-defense-explained',
      'orthodox-stance',
      'southpaw-stance',
    ],
  }),

  standard({
    slug: 'professional-vs-amateur-boxing',
    title: 'Professional vs Amateur Boxing',
    category: 'start-here',
    aliases: [
      'pro vs amateur boxing',
      'amateur boxing vs professional',
      'difference between amateur and professional boxing',
    ],
    summary: 'How the amateur and professional versions of the sport actually differ.',
    difficulty: 'beginner',
    isStartHere: true,
    order: 100,
    readMinutes: 5,
    sourceKeys: [{ key: 'wp-amateur-boxing' }, { key: 'wp-olympic-boxing' }],
    explanation: `Professional and amateur boxing share the same basic idea, punches only, scored by round or fight, but differ in most of the specifics, enough that they are best understood as two related sports rather than one sport played at two levels.`,
    howItWorks: `**Length.** Professional bouts are commonly longer, up to 12 rounds for a championship fight. Amateur bouts are commonly shorter, run over fewer rounds.

**Scoring emphasis.** Professional judging weighs overall effectiveness across a round, clean punching, aggression, ring control and defence together. Amateur scoring is geared more directly toward landed, legal blows.

**What is at stake.** Professional boxers fight for sanctioning-body titles, purses and commercial promotion, under contracts negotiated between promoters, managers and broadcasters. Amateur boxers commonly compete to represent a country or region, aiming toward continental championships or the Olympics, and amateur competition is a common route into the professional ranks.

**Governance.** Professional boxing is regulated by state or national athletic commissions and by the sanctioning bodies for title fights. Amateur boxing is regulated by national federations and, at Olympic level, whichever body currently holds recognition to run it, itself an unsettled question in recent Olympic cycles.`,
    whyItMatters: `Almost every professional boxer started as an amateur, so the two systems are connected even though they are scored and run differently: amateur results build the resume and reputation that shapes a fighter's early professional matchmaking, even though amateur bouts are not included in a professional record.`,
    misunderstandings: `**Amateur results do not appear in a professional record.** A boxer's professional win-loss-draw record starts from their first sanctioned professional fight, regardless of amateur experience.

**Neither version is simply "easier" than the other.** They reward somewhat different skills, amateur boxing's shorter, higher-output format against professional boxing's longer, more strategically varied one.`,
    takeaways: `- Amateur bouts are shorter and scored more directly on landed legal blows.
- Professional bouts are longer and judged on overall round effectiveness.
- Amateur boxing is the common pathway into the professional ranks, but the record does not carry over.
- The two are regulated by different kinds of body entirely.`,
    related: [
      'boxing-weight-classes-explained',
      'how-boxing-judging-works',
      'how-boxing-records-work',
    ],
  }),

  standard({
    slug: 'how-boxing-titles-work',
    title: 'How Boxing Championships Work',
    category: 'start-here',
    aliases: [
      'how boxing titles work',
      'how boxing championships work',
      'boxing world title explained',
    ],
    summary: 'How a boxer actually becomes, and stays, a champion.',
    difficulty: 'beginner',
    isStartHere: true,
    order: 110,
    readMinutes: 6,
    sourceKeys: [{ key: 'wp-wbc' }, { key: 'wp-wba' }],
    explanation: `A boxing "world title" is not awarded by one central authority the way, say, a league title is. It is recognition from one of several independent sanctioning bodies, and becoming a champion means satisfying that specific body's own process.`,
    howItWorks: `Each sanctioning body, the WBA, WBC, IBF and WBO chief among them, maintains its own **rankings** for every weight class. A **vacant** title, one with no current holder, is commonly contested between two highly ranked fighters to fill it. An existing champion defends their title periodically against a **voluntary** challenger of the champion's choosing, or against a **mandatory challenger**, a specific opponent the sanctioning body requires the champion to face next, typically the body's top-ranked available contender.

A champion who successfully defends keeps the title; a champion who loses hands it to the winner. A title can also become vacant without a fight, for instance if a champion moves up in weight, retires, or fails to defend within a required timeframe.

Because there are four major bodies, a fighter can hold more than one title in the same division at once. Holding two or three is commonly called being a **unified** champion; holding all four simultaneously is called being an **undisputed** champion, a genuinely rare achievement since it requires beating or otherwise unifying with every other titleholder rather than only defending against one body's own mandatory challengers.`,
    example: `A fighter holds the WBC title and beats the WBA champion in a unification bout, absorbing both belts. They are now a two-belt unified champion. If they go on to also add the IBF and WBO titles, they become the undisputed champion of that weight class, a status very few boxers ever reach.`,
    whyItMatters: `This structure is the direct reason boxing so often has multiple simultaneous "world champions" in one division, something that puzzles newcomers used to sports with a single table and one crown. It is not a flaw in the sport's bookkeeping; it reflects that the four bodies are independent organisations competing with, not subordinate to, one another.`,
    strategy: `A champion's own team often has to weigh a lucrative voluntary defence against the far less flexible requirement to eventually face a mandatory challenger, and a body can strip a champion of its title for repeatedly avoiding a mandatory defence.`,
    misunderstandings: `**A "world champion" is not automatically the best fighter in the division.** It reflects having satisfied one specific sanctioning body's process, not a universal judgement of ability.

**Losing a title fight does not end a career**, and champions who lose a belt commonly continue fighting, sometimes for a different body's title later.`,
    takeaways: `- Titles come from independent sanctioning bodies, not one central authority.
- Champions defend voluntarily or against a required mandatory challenger.
- Unified means holding more than one major title; undisputed means holding all four.
- Multiple simultaneous "champions" in one division is a normal, structural feature of the sport, not an error.`,
    related: [
      'why-boxing-has-so-many-belts',
      'boxing-weight-classes-explained',
      'how-boxing-fights-are-made',
    ],
  }),

  standard({
    slug: 'why-boxing-has-so-many-belts',
    title: 'Why Boxing Has So Many Belts',
    category: 'start-here',
    aliases: [
      'why does boxing have so many belts',
      'boxing belts explained',
      'too many boxing titles',
    ],
    summary:
      'The specific reason boxing ends up with several "champions" per division, and several tiers of belt.',
    difficulty: 'beginner',
    isStartHere: true,
    order: 120,
    readMinutes: 5,
    sourceKeys: [{ key: 'wp-wba' }, { key: 'wp-wbc' }, { key: 'wp-ibf' }, { key: 'wp-wbo' }],
    explanation: `Boxing has no single governing body that runs the sport's rules and titles the way many other sports do. Instead, four organisations, the WBA, WBC, IBF and WBO, each independently rank fighters and crown their own champion per weight class, and none of them answers to, or sits above, the others.`,
    howItWorks: `**The four major bodies formed at different times, for different reasons.** The WBA traces back to the National Boxing Association, founded in the United States in the early 1920s. The WBC formed in Mexico City in 1963. The IBF formed in 1983. The WBO, the youngest, formed in 1988 after a breakaway from the WBA. Each competes for promoters' business and sanctioning fees rather than cooperating as parts of one system.

**Each body can also recognise more than one titleholder within its own division.** Beyond its main "world" title, a body may separately recognise an **interim** champion (a temporary titleholder, typically while the full champion is unavailable), a "**super**" champion, and regional, continental or international titles below world level. These lower tiers exist partly to generate additional sanctioning fees and rankings activity, and a champion of one of them is not equivalent to a genuine world titleholder, even though the terminology (and often the belt's physical design) can make that easy to miss.

**A physical belt and the title it represents are related but distinct.** The belt is the trophy; the title is the recognition. Bodies have, at times, issued new belt designs for a title that has not otherwise changed hands.`,
    whyItMatters: `Understanding this is the single most useful thing for making sense of professional boxing coverage: a division can have a WBA champion, a WBC champion, an IBF champion and a WBO champion simultaneously, none of whom has necessarily fought any of the others, and all four can accurately be called a "world champion" at the same time.`,
    misunderstandings: `**This is not a modern problem the sport is trying to fix.** Multiple sanctioning bodies have existed since 1983 at the latest (with two bodies since 1963), and the structure reflects competing organisations rather than an accident awaiting correction.

**Not every belt is equally prestigious**, even from the same body: a regional or interim title is a real, sanctioned result, but is not the same achievement as that body's main world title.`,
    takeaways: `- No single body governs boxing's titles; four major sanctioning bodies operate independently.
- Each can crown its own world champion per weight class.
- Bodies also recognise lower tiers (interim, regional, continental) beneath their main title.
- An undisputed champion, holding all four major titles at once, is genuinely rare precisely because of this structure.`,
    related: [
      'how-boxing-titles-work',
      'boxing-weight-classes-explained',
      'how-boxing-records-work',
    ],
  }),

  standard({
    slug: 'how-boxing-records-work',
    title: 'How Boxing Records Work',
    category: 'start-here',
    aliases: ['boxing record explained', 'how to read a boxing record', 'boxing win loss draw'],
    summary: 'How a professional boxer’s win-loss-draw record is written, read and compared.',
    difficulty: 'beginner',
    isStartHere: true,
    order: 130,
    readMinutes: 4,
    sourceKeys: GENERAL,
    explanation: `A professional boxer's **record** is a running tally of every sanctioned professional result they have fought, written in a compact, standard notation that appears on every fight poster and broadcast graphic.`,
    howItWorks: `A record is written as **wins-losses-draws**, for example **40-2-1**. The number of those wins that came by knockout or technical knockout is commonly added in parentheses, for example **40-2-1 (28 KOs)**, meaning 28 of the 40 wins were stoppages rather than decisions. A **no contest (NC)** is tracked separately from a loss, since it is not a defeat, and is sometimes appended to a record on its own, for example "(1 NC)".

Records are specific to sanctioned professional bouts. Amateur results are not included, so a boxer's professional record always starts at 0-0-0 regardless of how accomplished they were as an amateur.`,
    example: `A record of **27-1-1 (19 KOs)** reads as 27 wins, 1 loss, 1 draw, with 19 of those 27 wins coming by knockout or technical knockout, meaning 8 wins came by decision.`,
    whyItMatters: `A record is the single most-quoted number in boxing, but it is a summary, not a full picture: it says nothing on its own about the level of opposition a fighter beat to build it, which is why experienced fans and matchmakers look past the raw numbers to who specifically is on a fighter's resume.`,
    misunderstandings: `**A perfect record does not automatically mean an elite fighter.** A high win total built against weak opposition is viewed very differently in the sport than the same total built against ranked contenders, an informal distinction sometimes called a "padded" record.

**A loss does not end a career the way it might suggest.** Many respected former champions carry one or more losses, sometimes to fighters who went on to become champions themselves.

**KO percentage is not the same as overall skill.** It reflects punching power and stoppage ability specifically, not a complete measure of how good a boxer is.`,
    takeaways: `- Records are written wins-losses-draws, with KOs commonly noted in parentheses.
- No contests are tracked separately from losses.
- Amateur results are never included in the professional record.
- A record alone does not describe quality of opposition; context matters as much as the number.`,
    related: ['how-boxing-titles-work', 'professional-vs-amateur-boxing'],
  }),

  standard({
    slug: 'how-boxing-fights-are-made',
    title: 'How Boxing Fights Are Made',
    category: 'start-here',
    aliases: [
      'how boxing matchmaking works',
      'how are boxing fights made',
      'boxing matchmaking explained',
    ],
    summary:
      'Why two boxers actually end up fighting each other, and who is involved in making that happen.',
    difficulty: 'intermediate',
    isStartHere: true,
    order: 140,
    readMinutes: 5,
    sourceKeys: [{ key: 'wp-promoter-boxing' }],
    explanation: `Boxing has no league schedule and no fixture list handing a fighter their next opponent. Every fight is individually negotiated, which is a major structural difference from most other major sports and the reason the sport's biggest fights can take years to actually happen.`,
    howItWorks: `A **promoter** organises and finances an event and is typically the party that puts a fight together commercially, securing a venue and a broadcast deal. A **manager**, separate from the promoter, represents an individual boxer's own interests in negotiations. For a title fight, the relevant **sanctioning body** must also recognise the bout, and may require a **mandatory challenger** to be faced rather than a fighter's preferred opponent.

Getting two specific boxers into the ring together depends on several things lining up at once: each fighter's ranking, sanctioning-body mandatory requirements, how commercially appealing the matchup is to broadcasters and promoters, the fighters' existing promotional and broadcast contracts (which can make cross-promotional fights logistically difficult even when both sides want them), and, in some mandatory situations, a **purse bid**, a process where promoters bid for the right to stage the fight and the fighters are guaranteed a cut of the winning bid.`,
    whyItMatters: `A highly ranked fighter is not guaranteed a title shot on any fixed schedule, and this is a frequent source of frustration among fighters and fans, and a large part of why some of the sport's most anticipated fights take years of negotiation, or never happen at all.`,
    strategy: `A fighter's own team has to weigh several competing priorities when picking a next opponent: an easier, lower-risk fight that keeps a record clean and builds an audience, against a harder, more prestigious fight that raises a fighter's standing but also raises the risk of a first loss.`,
    misunderstandings: `**A ranked contender is not entitled to a title shot on demand.** Rankings inform matchmaking but do not force a match by themselves outside of a formal mandatory-challenger requirement.

**Promotional and broadcast contracts are a genuine obstacle to matchmaking**, not just a negotiating tactic; two fighters signed to competing promoters or broadcasters can find a fight logistically very difficult to arrange even when both are willing.`,
    takeaways: `- Every fight is individually negotiated; there is no fixed schedule.
- Promoters, managers and sanctioning bodies are all typically involved.
- Ranking, commercial appeal, contracts and mandatory rules all shape whether and when a fight happens.
- This is why some of boxing's biggest fights take years to make.`,
    related: ['how-boxing-titles-work', 'boxing-weight-classes-explained'],
  }),

  // ══ Terminology (A-Z glossary) ═══════════════════════════════════════════
  definition({
    slug: 'a-side',
    title: 'A-Side',
    category: 'terminology',
    summary:
      'The fighter with greater commercial standing or negotiating leverage in a matchup, informally.',
    difficulty: 'beginner',
    order: 10,
    sourceKeys: GENERAL,
    explanation: `The "A-side" is the fighter with the greater commercial pull, fan following or negotiating leverage in a given matchup, an informal industry term rather than an official designation. The A-side commonly has more say over terms such as venue, broadcaster and, in some cases, choice of officials.`,
    whyItMatters: `Being the A-side does not affect the rules of the fight itself, but it shapes the negotiation that gets a fight made at all.`,
    related: ['how-boxing-fights-are-made'],
  }),

  definition({
    slug: 'bout',
    title: 'Bout',
    category: 'terminology',
    summary: 'Another word for an individual boxing match or fight.',
    difficulty: 'beginner',
    order: 20,
    sourceKeys: GENERAL,
    explanation: `A "bout" is simply a single boxing match, used interchangeably with "fight" in official and broadcast language, particularly on fight cards listing several bouts across an evening.`,
    related: ['boxing-in-5-minutes'],
  }),

  definition({
    slug: 'canvas',
    title: 'Canvas',
    category: 'terminology',
    summary: 'The padded fighting surface of a boxing ring.',
    difficulty: 'beginner',
    order: 30,
    sourceKeys: [{ key: 'wp-boxing-ring' }],
    explanation: `The **canvas** is the padded platform beneath the ropes that fighters actually stand and fight on. "Hitting the canvas" is a common way of describing a knockdown.`,
    related: ['boxing-ring-explained', 'knockdown'],
  }),

  definition({
    slug: 'catchweight',
    title: 'Catchweight',
    category: 'terminology',
    summary:
      'A fight contracted at a weight limit that falls between two standard divisions, or otherwise off a division’s usual limit.',
    difficulty: 'intermediate',
    order: 40,
    sourceKeys: [{ key: 'wp-catchweight' }],
    explanation: `A **catchweight** bout is agreed at a weight limit that does not match either fighter's usual division exactly, often a compromise point between two standard weight classes. Catchweight fights are not eligible for a division's standard world titles, since they are not fought at that division's official limit.`,
    whyItMatters: `Catchweights let two fighters from adjoining weight classes meet without either having to fully move up or down, but they have also drawn criticism at times for being used to give one fighter a size or strength advantage over the other.`,
    related: ['boxing-weight-classes-explained'],
  }),

  definition({
    slug: 'clinch',
    title: 'Clinch',
    category: 'terminology',
    summary: 'Close-range grappling contact between two fighters, broken by the referee.',
    difficulty: 'beginner',
    order: 50,
    sourceKeys: [{ key: 'wp-clinch' }],
    explanation: `A **clinch** is close-range contact where the fighters hold onto one another, often used to slow an opponent's attack or to recover a moment's rest. The referee separates a clinch after a few seconds; excessive holding can be penalised as a foul.`,
    related: ['boxing-defense-explained', 'boxing-rules-explained'],
  }),

  definition({
    slug: 'combination',
    title: 'Combination',
    category: 'terminology',
    summary: 'A sequence of more than one punch thrown together, rather than a single shot.',
    difficulty: 'beginner',
    order: 60,
    sourceKeys: GENERAL,
    explanation: `A **combination** ("combo") is two or more punches thrown as a linked sequence, most famously the "one-two", a jab followed immediately by a cross. Combinations are used to overwhelm a guard that can defend against a single punch more easily than a connected series.`,
    related: ['boxing-punches-explained'],
  }),

  definition({
    slug: 'corner',
    title: 'Corner',
    category: 'terminology',
    summary:
      'A fighter’s team, and the physical corner of the ring where they work between rounds.',
    difficulty: 'beginner',
    order: 70,
    sourceKeys: GENERAL,
    explanation: `"Corner" refers both to a fighter's own section of the ring, where their team works between rounds, and, informally, to that team itself, trainers, cutmen and other staff collectively.`,
    related: ['how-boxing-works'],
  }),

  definition({
    slug: 'counter',
    title: 'Counter',
    category: 'terminology',
    summary:
      'A punch thrown in direct response to, or immediately after avoiding, an opponent’s attack.',
    difficulty: 'beginner',
    order: 80,
    sourceKeys: GENERAL,
    explanation: `A **counter** (or counterpunch) is a punch timed off an opponent's own attack rather than started independently, often landed while the opponent is still out of position from throwing their own shot.`,
    related: ['boxing-defense-explained', 'boxing-punches-explained'],
  }),

  definition({
    slug: 'cross',
    title: 'Cross',
    category: 'terminology',
    summary:
      'A straight punch thrown with the rear hand, typically a fighter’s hardest single punch.',
    difficulty: 'beginner',
    order: 90,
    sourceKeys: [{ key: 'wp-boxing' }],
    explanation: `The **cross** is a straight punch thrown with the rear hand, powered by rotating the hips and shoulders behind it. It is commonly a fighter's hardest single straight punch, and is frequently thrown right after a jab in the classic "one-two" combination.`,
    related: ['boxing-punches-explained'],
  }),

  definition({
    slug: 'decision',
    title: 'Decision',
    category: 'terminology',
    summary:
      'A result determined by the judges’ scorecards after a fight goes the scheduled distance without a stoppage.',
    difficulty: 'beginner',
    order: 100,
    sourceKeys: [{ key: 'wp-ten-point-must-boxing' }],
    explanation: `A **decision** is the result when a fight completes its scheduled rounds with no knockout, stoppage or disqualification, and the three judges' scorecards determine the winner: unanimous (all three agree), split (two against one), majority (two for one, one even), or a draw if the cards do not favour either fighter overall.`,
    related: ['boxing-fight-results-explained', 'how-boxing-judging-works'],
  }),

  definition({
    slug: 'feint',
    title: 'Feint',
    category: 'terminology',
    summary:
      'A false movement meant to draw a reaction from an opponent without committing to a real attack.',
    difficulty: 'intermediate',
    order: 110,
    sourceKeys: GENERAL,
    explanation: `A **feint** is a deliberately false movement, a fake punch, a false step, meant to provoke a reaction (a flinch, a guard shift, a counter) that opens a real opportunity a moment later.`,
    related: ['boxing-punches-explained', 'boxing-defense-explained'],
  }),

  definition({
    slug: 'guard',
    title: 'Guard',
    category: 'terminology',
    summary: 'The defensive hand and arm position a boxer holds to protect the head and body.',
    difficulty: 'beginner',
    order: 120,
    sourceKeys: GENERAL,
    explanation: `The **guard** is a fighter's default defensive posture, hands and arms raised to protect the head and body between exchanges. Different stances and styles favour different guard positions, from a high, tight guard to a lower, shoulder-led one.`,
    related: ['boxing-defense-explained', 'orthodox-stance'],
  }),

  definition({
    slug: 'hook',
    title: 'Hook',
    category: 'terminology',
    summary: 'A punch thrown in a horizontal, looping arc, aimed at the side of the head or body.',
    difficulty: 'beginner',
    order: 130,
    sourceKeys: [{ key: 'wp-boxing' }],
    explanation: `A **hook** travels in a tight horizontal arc with the elbow bent throughout, thrown with either hand at the side of an opponent's head or body. Its sideways path makes it harder for a straight-punch defence like a simple slip to avoid.`,
    related: ['boxing-punches-explained'],
  }),

  definition({
    slug: 'jab',
    title: 'Jab',
    category: 'terminology',
    summary:
      'A quick, straight punch thrown with the lead hand, boxing’s most frequently thrown punch.',
    difficulty: 'beginner',
    order: 140,
    sourceKeys: [{ key: 'wp-jab' }],
    explanation: `The **jab** is a fast, straight punch thrown with the lead hand and little windup, used to measure distance, disrupt an opponent's rhythm and set up harder punches. It is thrown more often than any other punch in the sport.`,
    related: ['boxing-punches-explained'],
  }),

  definition({
    slug: 'knockdown',
    title: 'Knockdown',
    category: 'terminology',
    summary:
      'A fighter touches the canvas with anything other than their feet, or is held up only by the ropes, as a result of a punch.',
    difficulty: 'beginner',
    order: 150,
    sourceKeys: [{ key: 'wp-knockout' }],
    explanation: `A **knockdown** occurs when a fighter touches the canvas with any part of their body other than their feet, or is held up only by the ropes, because of a punch. The referee gives a count, and a fighter who does not rise and demonstrate they can continue within it loses by knockout.`,
    related: ['boxing-fight-results-explained', 'knockout', 'boxing-ring-explained'],
  }),

  definition({
    slug: 'knockout',
    title: 'Knockout',
    category: 'terminology',
    summary:
      'A fighter is unable to rise and continue within the referee’s count after being knocked down.',
    difficulty: 'beginner',
    order: 160,
    sourceKeys: [{ key: 'wp-knockout' }],
    explanation: `A **knockout (KO)** is recorded when a knocked-down fighter cannot rise and demonstrate they are fit to continue within the referee's count, ending the fight immediately.`,
    misunderstandings: `A knockout specifically follows an actual count; a fight stopped without a count, for a one-sided beating, a cut, or a doctor's call, is recorded as a technical knockout (TKO) instead.`,
    related: ['boxing-fight-results-explained', 'tko', 'knockdown'],
  }),

  definition({
    slug: 'mandatory',
    title: 'Mandatory',
    category: 'terminology',
    summary:
      'The challenger a sanctioning body requires its champion to face next, ahead of any voluntary defence.',
    difficulty: 'intermediate',
    order: 170,
    sourceKeys: [{ key: 'wp-wbc' }],
    explanation: `A **mandatory challenger** is the opponent a sanctioning body requires its champion to defend against next, typically its own top-ranked available contender. A champion who avoids a required mandatory defence risks being stripped of the title.`,
    related: ['how-boxing-titles-work'],
  }),

  definition({
    slug: 'orthodox',
    title: 'Orthodox',
    category: 'terminology',
    summary: 'The standard boxing stance, left hand and foot leading, for a right-handed fighter.',
    difficulty: 'beginner',
    order: 180,
    sourceKeys: [{ key: 'wp-boxing-stance' }],
    explanation: `**Orthodox** is the standard boxing stance, with the left hand and foot leading, used by the majority of fighters (most of whom are right-handed). Its mirror image is the southpaw stance.`,
    related: ['southpaw', 'boxing-punches-explained'],
  }),

  definition({
    slug: 'pound-for-pound',
    title: 'Pound-for-Pound',
    category: 'terminology',
    summary:
      'An informal, inherently subjective ranking of fighters as though weight were not a factor.',
    difficulty: 'beginner',
    order: 190,
    sourceKeys: [{ key: 'wp-pound-for-pound' }],
    explanation: `**Pound-for-pound** rankings attempt to compare fighters across different weight classes as though size were not a variable, compiled informally by media outlets and organisations rather than any single authoritative body.`,
    misunderstandings: `There is no single, universally agreed pound-for-pound list; different publications maintain their own, and disagreements between them are normal rather than a sign one is simply wrong.`,
    related: ['how-boxing-titles-work'],
  }),

  definition({
    slug: 'promoter',
    title: 'Promoter',
    category: 'terminology',
    summary: 'The party that organises and finances a boxing event commercially.',
    difficulty: 'beginner',
    order: 200,
    sourceKeys: [{ key: 'wp-promoter-boxing' }],
    explanation: `A **promoter** organises and finances a boxing event: securing a venue, arranging a broadcast deal, and typically putting the fight together commercially. A promoter is distinct from a manager, who represents an individual boxer's own interests.`,
    related: ['how-boxing-fights-are-made'],
  }),

  definition({
    slug: 'ring-generalship',
    title: 'Ring Generalship',
    category: 'terminology',
    summary:
      'Control of a fight’s pace, distance and positioning, one of the criteria judges weigh when scoring a round.',
    difficulty: 'intermediate',
    order: 210,
    sourceKeys: [{ key: 'wp-ten-point-must-boxing' }],
    explanation: `**Ring generalship** describes which fighter is dictating how and where the fight is being fought, forcing their preferred range, cutting off the ring, or otherwise controlling the terms of engagement, independent of who lands more punches.`,
    related: ['how-boxing-judging-works'],
  }),

  definition({
    slug: 'southpaw',
    title: 'Southpaw',
    category: 'terminology',
    summary: 'A boxing stance with the right hand and foot leading, the mirror of orthodox.',
    difficulty: 'beginner',
    order: 220,
    sourceKeys: [{ key: 'wp-southpaw' }],
    explanation: `**Southpaw** is the mirror-image boxing stance to orthodox, right hand and foot leading, commonly but not always used by left-handed fighters. A southpaw facing an orthodox opponent changes both fighters' usual footwork and punch angles.`,
    related: ['orthodox'],
  }),

  definition({
    slug: 'split-decision',
    title: 'Split Decision',
    category: 'terminology',
    summary: 'Two judges score the fight for one boxer, and the third for the other.',
    difficulty: 'beginner',
    order: 230,
    sourceKeys: [{ key: 'wp-ten-point-must-boxing' }],
    explanation: `A **split decision** occurs when two of the three judges score the fight for one boxer and the remaining judge scores it for the other, producing a winner despite the judges disagreeing on who actually won.`,
    related: ['decision', 'how-boxing-judging-works'],
  }),

  definition({
    slug: 'tko',
    title: 'TKO',
    category: 'terminology',
    summary:
      'The referee, a doctor or a fighter’s corner stops the fight before a full knockout occurs.',
    difficulty: 'beginner',
    order: 240,
    sourceKeys: [{ key: 'wp-technical-knockout' }],
    explanation: `A **technical knockout (TKO)** covers every stoppage that is not a countable knockout: the referee judging a fighter unable to safely continue, a doctor ending the fight over an injury, or a fighter's own corner throwing in the towel.`,
    related: ['knockout', 'boxing-fight-results-explained'],
  }),

  definition({
    slug: 'undercard',
    title: 'Undercard',
    category: 'terminology',
    summary: 'The fights on a card that build up to the night’s featured main event.',
    difficulty: 'beginner',
    order: 250,
    sourceKeys: GENERAL,
    explanation: `The **undercard** is the set of bouts, usually featuring less prominent boxers, that precede the **main event**, the headline fight the whole card is built and promoted around.`,
    related: ['how-boxing-fights-are-made'],
  }),

  definition({
    slug: 'undisputed',
    title: 'Undisputed',
    category: 'terminology',
    summary: 'Holding the WBA, WBC, IBF and WBO titles in one weight class simultaneously.',
    difficulty: 'intermediate',
    order: 260,
    sourceKeys: [{ key: 'wp-undisputed-champion' }],
    explanation: `An **undisputed champion** holds all four major sanctioning titles, WBA, WBC, IBF and WBO, in a single weight class at the same time, a rare achievement since it requires beating or unifying with every other titleholder rather than only a single body's own mandatory challengers.`,
    related: ['how-boxing-titles-work', 'why-boxing-has-so-many-belts'],
  }),

  definition({
    slug: 'uppercut',
    title: 'Uppercut',
    category: 'terminology',
    summary: 'A vertical, rising punch thrown at close range, aimed at the chin or body.',
    difficulty: 'beginner',
    order: 270,
    sourceKeys: [{ key: 'wp-boxing' }],
    explanation: `An **uppercut** rises vertically from below, thrown with either hand at close range, aimed up under the chin or into the body. Because it travels up from beneath a fighter's own guard, it is often harder for an opponent to see coming than a straight punch.`,
    related: ['boxing-punches-explained'],
  }),

  definition({
    slug: 'weight-class',
    title: 'Weight Class',
    category: 'terminology',
    summary:
      'A division defined by a maximum body weight at the official weigh-in, so boxers compete against opponents of similar size.',
    difficulty: 'beginner',
    order: 280,
    sourceKeys: [{ key: 'wp-weight-class-boxing' }],
    explanation: `A **weight class** sets a maximum body weight, checked at an official weigh-in, so that a fight is contested between two opponents of broadly similar size rather than being decided by size mismatch alone.`,
    related: ['boxing-weight-classes-explained'],
  }),
];
