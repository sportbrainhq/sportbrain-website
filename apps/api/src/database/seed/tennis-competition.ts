import type { DrawShape, ExplainerSeed } from './explainer-types';
import {
  article,
  courtArea,
  definition,
  format,
  officiating,
  rankingConcept,
  rule,
  tactic,
} from './tennis-explainer-helpers';
import { TENNIS_REVIEWED, TENNIS_RULE_REVISION } from './tennis-explainers';

/**
 * The competitive structure of tennis: tournaments, rankings, seeding, the
 * majors, doubles, officiating, equipment and careers.
 *
 * ## On numbers that move
 *
 * This file describes the machinery that publishes numbers, and deliberately
 * publishes almost none of them. Ranking-point tables are revised, tour tiers
 * gain and lose events, prize money changes annually, and the number of seeds
 * in a draw has itself been changed within living memory. A figure written into
 * prose is wrong within a season with nothing to flag it.
 *
 * So the worked examples use round illustrative numbers and say that they are
 * illustrative. Where a real current figure is genuinely needed, it belongs in
 * data with an as-of date, not in an article.
 *
 * ## On the two tours
 *
 * No concept here is split into a men's version and a women's version. The ATP
 * and the WTA run separate ranking systems with different point tables and
 * differently named tiers, and both are described in the one explainer for the
 * concept, with the divergence in `rule_differences`. A reader searching
 * "ranking points" should not have to choose a tour before they can read
 * anything.
 */

const RULES = {
  ruleSensitive: true,
  sourceRevision: TENNIS_RULE_REVISION,
  lastReviewedAt: TENNIS_REVIEWED,
  sourceKeys: [{ key: 'itf-rules' }],
};

const TOUR_RULES = {
  ruleSensitive: true,
  lastReviewedAt: TENNIS_REVIEWED,
  sourceKeys: [{ key: 'atp-rulebook' }, { key: 'wta-rulebook' }],
};

/**
 * A 16-player bracket used by several of the draw and seeding explainers.
 *
 * One payload reused rather than four written, because the bracket is the same
 * fact each time and the entries that differ are the seeds' placement, which is
 * the subject in each case.
 */
const SEEDED_DRAW: DrawShape = {
  rounds: ['Round of 16', 'Quarter-finals', 'Semi-finals', 'Final'],
  caption:
    'A 16-player draw with four seeds. Seeds 1 and 2 are placed at opposite ends, so they can only meet in the final.',
  entrants: [
    { name: 'Player A', seed: 1, highlight: true },
    { name: 'Player H' },
    { name: 'Player E' },
    { name: 'Player D', seed: 4 },
    { name: 'Player C', seed: 3 },
    { name: 'Player F' },
    { name: 'Player G', status: 'Q' },
    { name: 'Player B', seed: 2, highlight: true },
  ],
};

/* ────────────────────────────────────────────────────────────────────────────
 * Tournaments
 * ────────────────────────────────────────────────────────────────────────── */

const TOURNAMENTS: ExplainerSeed[] = [
  format({
    slug: 'how-tournaments-work',
    title: 'How Tennis Tournaments Work',
    category: 'tournaments',
    isStartHere: true,
    order: 10,
    difficulty: 'beginner',
    summary:
      'A single-elimination bracket, entered by ranking, with a qualifying event beneath it.',
    oneSentence:
      'A tennis tournament is a knockout: lose once and you are out, so the winner is the only player who does not lose a match.',
    howItWorks:
      '**Entry** is by ranking. A tournament publishes an entry deadline, and the players who enter are accepted in ranking order until the draw is full. Below that cut-off are qualifying, wild cards and alternates.\n\n**The draw** is made publicly a day or two before play, placing the seeds at fixed positions and drawing everybody else at random around them.\n\n**The bracket** is single elimination. A 32-player draw needs five wins for the title, a 64-player draw six, and a 128-player Grand Slam draw seven.\n\n**Points and prize money** are awarded by round reached, so a player earns something for every round they survive, and the totals rise steeply towards the final.',
    diagram: SEEDED_DRAW,
    whyItMatters:
      'The knockout format is why tennis rewards consistency so heavily. There is no group stage to recover in and no league table: one bad afternoon ends the tournament, which is why the ranking system, which averages a year of results, and the tournament, which does not, measure very different things.',
    ruleDifferences:
      'The season-ending Finals are the exception on both tours, using a round-robin group stage before a knockout semi-final. Team competitions also use formats of their own, with ties made up of several matches.',
    related: [
      'tournament-draw',
      'knockout-format',
      'main-draw-vs-qualifying',
      'seed',
      'rankings-and-tournament-entry',
    ],
    ...TOUR_RULES,
  }),

  format({
    slug: 'tournament-draw',
    title: 'What Is a Tournament Draw?',
    category: 'tournaments',
    alsoIn: ['seeding-and-draws'],
    order: 20,
    difficulty: 'beginner',
    summary:
      'The bracket that decides who plays whom, and the path each player would have to take.',
    oneSentence:
      'The draw is the bracket showing every player’s position in the tournament and therefore who they can meet in each round.',
    howItWorks:
      'The draw is a bracket of a power of two: 32, 64 or 128 places. Seeds are placed at fixed positions first, then the remaining players are drawn at random into the empty slots.\n\nA player’s **section** or **quarter** of the draw is who they would meet on the way to the semi-finals, and it is what commentators mean by an "easy draw": not the first opponent, but the four or five players in that part of the bracket.',
    diagram: SEEDED_DRAW,
    example:
      'In a 16-player draw, the top seed and the second seed are placed at opposite ends. They can meet only in the final, and the third and fourth seeds are drawn into the two remaining quarters.',
    whyItMatters:
      'Draws are made publicly and are a genuine event in the tennis calendar, because a player’s path can be much harder than their seeding suggests. The random element is real: a dangerous unseeded player can land in anybody’s section.',
    related: [
      'how-draws-work',
      'seed',
      'separating-top-seeds',
      'top-players-meeting-early',
      'draw-ceremony',
    ],
    ...TOUR_RULES,
  }),

  format({
    slug: 'knockout-format',
    title: 'Knockout Format Explained',
    category: 'tournaments',
    order: 30,
    difficulty: 'beginner',
    summary: 'Single elimination: lose and you are out, with no second chance.',
    oneSentence:
      'Tennis tournaments are single-elimination, so every match eliminates one player and the champion is the only one unbeaten.',
    howItWorks:
      'Each round halves the field. A 128-player draw goes to 64, then 32, 16, 8, 4, 2 and 1: seven rounds, and seven wins for the title.\n\nBecause each round halves the field, the rounds have standard names: round of 128, round of 64, round of 32, round of 16, quarter-final, semi-final, final.\n\nWhere the field is not a power of two, byes are given to the highest seeds so that the bracket resolves cleanly from the second round.',
    whyItMatters:
      'Single elimination maximises variance, which is the format’s feature rather than its flaw: it is what makes an upset in the first round of a major a genuine result rather than an inconvenience to be recovered from.',
    ruleDifferences:
      'The two season-ending Finals use round-robin groups, so a player can lose a match and still win the title. That is a deliberate exception, because eight players flown in for one match each would be a poor event.',
    related: ['how-tournaments-work', 'bye', 'tournament-draw', 'atp-finals', 'wta-finals'],
    ...TOUR_RULES,
  }),

  format({
    slug: 'grand-slam-vs-tour-event',
    title: 'Grand Slam vs Regular Tour Event',
    category: 'tournaments',
    alsoIn: ['grand-slams'],
    order: 40,
    difficulty: 'beginner',
    summary: 'Bigger draw, more rounds, more points, longer matches, two weeks instead of one.',
    oneSentence:
      'A Grand Slam has a 128-player draw played over two weeks with the largest points and prize money on offer, where a regular tour event has a smaller draw played in a week.',
    howItWorks:
      '**Draw size.** A major has 128 players in singles and seven rounds. A tour event has 28, 32, 48, 56 or 96, and four to six rounds.\n\n**Duration.** A major runs a fortnight, with a day off between most rounds. A tour event runs a week, often with matches on consecutive days.\n\n**Format.** Men’s singles is best-of-five at the majors and best-of-three everywhere else. Women’s singles is best-of-three throughout.\n\n**Points.** Majors award substantially more ranking points than any other event, which is why a single major result can move a ranking further than a good month elsewhere.\n\n**Governance.** The majors are run by their national associations under the Grand Slam Board, not by the tours, which is why some of their rules differ from tour rules.',
    whyItMatters:
      'The gap between a major and everything else is the organising fact of a tennis career. Schedules are planned around peaking for four fortnights, and a player’s legacy is measured in majors won rather than in total titles.',
    related: [
      'the-grand-slams',
      'why-grand-slams-matter',
      'atp-masters-1000',
      'wta-1000',
      'best-of-three-vs-best-of-five',
    ],
    sourceKeys: [{ key: 'grand-slam-rulebook' }],
    ruleSensitive: true,
    lastReviewedAt: TENNIS_REVIEWED,
  }),

  format({
    slug: 'atp-masters-1000',
    title: 'ATP Masters 1000 Explained',
    category: 'tournaments',
    order: 50,
    difficulty: 'intermediate',
    summary: 'The tier below the majors on the men’s tour, and largely compulsory for top players.',
    oneSentence:
      'The Masters 1000 events are the highest category of ATP tournament below the Grand Slams, awarding 1,000 ranking points to the winner.',
    howItWorks:
      'The tier takes its name from the points awarded to the champion. The events have the strongest fields outside the majors, because top-ranked players are generally required to enter them under the ATP’s commitment rules, subject to exemptions for injury and for length of service.\n\nDraw sizes and durations vary across the tier, and several have moved to larger draws played over more than a week. Because the composition of the tier and the length of individual events are revised periodically, the current list and calendar are properties of the season rather than fixed facts about the sport.',
    whyItMatters:
      'The commitment element is what makes the tier matter. Because the leading players are required to appear, results at these events are the closest thing the tour has to a like-for-like comparison outside the majors.',
    ruleDifferences:
      'The WTA’s equivalent tier is the WTA 1000, named for the same reason. The two tiers award comparable headline points but sit inside different ranking systems with different tables, so a "1000" on one tour is not arithmetically interchangeable with a "1000" on the other.',
    related: ['atp-500', 'atp-250', 'wta-1000', 'atp-rankings', 'grand-slam-vs-tour-event'],
    ...TOUR_RULES,
  }),

  format({
    slug: 'atp-500',
    title: 'ATP 500 Explained',
    category: 'tournaments',
    order: 60,
    difficulty: 'intermediate',
    summary: 'The middle tier of the men’s tour, awarding 500 points to the winner.',
    oneSentence:
      'ATP 500 events sit between the Masters 1000 and the ATP 250 tier, awarding 500 ranking points to the champion.',
    howItWorks:
      'A tier of tournaments held throughout the season, with draws typically of 32 or 48 players played over a week. Fields are strong but not mandatory in the way the Masters events are, though top players are required to play a certain number of them under ATP commitment rules.\n\nThey are often scheduled as preparation for a major or a Masters event, which is why the entry lists can be much stronger than the tier alone would suggest.',
    whyItMatters:
      'For players ranked outside the very top, the 500 tier is where a ranking is built: the points are substantial and the field is beatable in a way a Masters field is not.',
    related: ['atp-masters-1000', 'atp-250', 'wta-500', 'earning-ranking-points'],
    ...TOUR_RULES,
  }),

  format({
    slug: 'atp-250',
    title: 'ATP 250 Explained',
    category: 'tournaments',
    order: 70,
    difficulty: 'intermediate',
    summary: 'The entry tier of the main men’s tour, awarding 250 points to the winner.',
    oneSentence:
      'ATP 250 events are the lowest tier of the main ATP Tour, awarding 250 ranking points to the champion.',
    howItWorks:
      'The most numerous tier, held throughout the year and often in weeks alongside larger events. Draws are typically 28 or 32 players.\n\nFields vary widely. A 250 held the week before a major will often have a weak entry list because top players are resting; one held in a quiet week can attract a much stronger field.',
    whyItMatters:
      'This is where most players win their first tour title, and where a player ranked between fifty and a hundred can realistically build the points to move up. The tier is the practical bridge between the Challenger Tour and the events above it.',
    related: ['atp-500', 'atp-challenger-tour', 'wta-250', 'the-tour-pathway'],
    ...TOUR_RULES,
  }),

  format({
    slug: 'atp-challenger-tour',
    title: 'ATP Challenger Tour Explained',
    category: 'tournaments',
    alsoIn: ['careers'],
    order: 80,
    difficulty: 'intermediate',
    summary: 'The men’s second tier: where most professionals actually play.',
    oneSentence:
      'The Challenger Tour is the level below the main ATP Tour, where players ranked roughly between 100 and 300 compete for the points needed to move up.',
    howItWorks:
      'Challenger events run year-round across the world, in several categories with different points and prize money. Draws are usually 32 or 48 players with a qualifying event beneath.\n\nThe tour serves three groups at once: players climbing towards the top hundred, established players rebuilding after injury, and players who spend a career at this level.',
    whyItMatters:
      'Almost every professional spends time here, and the economics of the Challenger Tour are the reason the financial gap in tennis is so wide. Prize money at this level frequently does not cover the cost of travelling to earn it.',
    ruleDifferences:
      'The WTA’s equivalent second tier is the WTA 125 series, which is smaller in number of events than the Challenger Tour, and the ITF World Tennis Tour sits beneath both.',
    related: [
      'itf-world-tennis-tour',
      'wta-125',
      'the-tour-pathway',
      'lower-ranked-player-finances',
      'atp-250',
    ],
    ...TOUR_RULES,
  }),

  format({
    slug: 'itf-world-tennis-tour',
    title: 'ITF World Tennis Tour Explained',
    category: 'tournaments',
    alsoIn: ['careers'],
    order: 90,
    difficulty: 'intermediate',
    summary: 'The entry level of professional tennis, run by the sport’s governing body.',
    oneSentence:
      'The ITF World Tennis Tour is the entry level of the professional game, where players with no ranking begin earning the points that let them enter higher events.',
    howItWorks:
      'The ITF runs a global circuit of tournaments in several prize-money categories. A player with no ranking at all enters here, usually through qualifying, and the points earned build an ATP or WTA ranking.\n\nThe structure of this level has been reorganised more than once in recent years, including changes to how junior and entry-level rankings feed into it, so the exact pathway is one of the parts of tennis most worth checking against current ITF regulations rather than assuming.',
    whyItMatters:
      'It is the bottom rung, and how easy it is to climb determines who can become a professional at all. Because prize money here is minimal, reaching the Challenger level quickly is less a sporting question than a financial one for most players.',
    related: [
      'atp-challenger-tour',
      'the-tour-pathway',
      'juniors-to-professional',
      'lower-ranked-player-finances',
      'atp-wta-itf',
    ],
    ruleSensitive: true,
    lastReviewedAt: TENNIS_REVIEWED,
    sourceKeys: [{ key: 'itf-rules' }],
  }),

  format({
    slug: 'wta-1000',
    title: 'WTA 1000 Explained',
    category: 'tournaments',
    order: 100,
    difficulty: 'intermediate',
    summary: 'The highest WTA tier below the majors, awarding 1,000 points to the winner.',
    oneSentence:
      'WTA 1000 events are the top category of WTA tournament below the Grand Slams, awarding 1,000 ranking points to the champion.',
    howItWorks:
      'The strongest fields on the women’s tour outside the majors. As on the men’s side, leading players are generally committed to a number of these events under WTA rules.\n\nThe tier contains events of noticeably different sizes: some are played over a week with a 56-player draw, others over nearly a fortnight with a 96-player draw. The tier name describes the points, not the format.',
    whyItMatters:
      'These are the events where the year-end Finals qualification is largely decided, because the points available are large enough to move a player several places in the Race in a single week.',
    ruleDifferences:
      'The ATP’s equivalent is the Masters 1000. The two are analogous in position and in headline points, but they sit in separate ranking systems and their event lists, draw sizes and commitment rules are set separately.',
    related: ['atp-masters-1000', 'wta-500', 'wta-rankings', 'wta-finals', 'wta-race'],
    ...TOUR_RULES,
  }),

  format({
    slug: 'wta-500',
    title: 'WTA 500 Explained',
    category: 'tournaments',
    order: 110,
    difficulty: 'intermediate',
    summary: 'The middle tier of the women’s tour, awarding 500 points to the winner.',
    oneSentence:
      'WTA 500 events sit between the WTA 1000 and WTA 250 tiers, awarding 500 ranking points to the champion.',
    howItWorks:
      'A tier of week-long events held throughout the season, with draws typically of 28 or 32 players and a qualifying competition beneath. Fields are strong without being mandatory in the way the 1000 events are.',
    whyItMatters:
      'For a player ranked between about twenty and sixty, the 500 tier is where a season is made: enough points to matter, and a draw that does not require beating three top-ten players to reach a final.',
    related: ['wta-1000', 'wta-250', 'atp-500', 'earning-ranking-points'],
    ...TOUR_RULES,
  }),

  format({
    slug: 'wta-250',
    title: 'WTA 250 Explained',
    category: 'tournaments',
    order: 120,
    difficulty: 'intermediate',
    summary: 'The entry tier of the main women’s tour, awarding 250 points to the winner.',
    oneSentence:
      'WTA 250 events are the lowest tier of the main WTA Tour, awarding 250 ranking points to the champion.',
    howItWorks:
      'The most numerous WTA tier, held year-round and often scheduled alongside larger events. Draws are typically 32 players with qualifying beneath.\n\nAs on the men’s tour, the strength of the field depends heavily on where the week sits relative to the majors.',
    whyItMatters:
      'This is where most players win a first tour title and where a ranking inside the top hundred is consolidated into one inside the top fifty.',
    related: ['wta-500', 'wta-125', 'atp-250', 'the-tour-pathway'],
    ...TOUR_RULES,
  }),

  format({
    slug: 'wta-125',
    title: 'WTA 125 Explained',
    category: 'tournaments',
    alsoIn: ['careers'],
    order: 130,
    difficulty: 'intermediate',
    summary: 'The women’s second tier, between the main tour and the ITF circuit.',
    oneSentence:
      'The WTA 125 series is the tier between the main WTA Tour and the ITF World Tennis Tour, awarding 125 ranking points to the champion.',
    howItWorks:
      'These events serve the same function as the men’s Challenger Tour: players ranked outside the level that gets direct entry to tour events compete for enough points to get there.\n\nThe series is smaller in number of events than the Challenger Tour, which means the women’s pathway between the ITF circuit and the main tour has historically had fewer rungs on it.',
    whyItMatters:
      'How many events exist at this level directly affects how quickly a player can climb, and it is one of the clearest structural differences between the two tours’ development pathways.',
    related: ['atp-challenger-tour', 'itf-world-tennis-tour', 'wta-250', 'the-tour-pathway'],
    ...TOUR_RULES,
  }),

  format({
    slug: 'atp-finals',
    title: 'ATP Finals Explained',
    category: 'tournaments',
    order: 140,
    difficulty: 'intermediate',
    summary:
      'The eight-player season finale, played in round-robin groups rather than as a knockout.',
    oneSentence:
      'The ATP Finals brings together the eight highest-ranked men of the season for a round-robin tournament followed by knockout semi-finals and a final.',
    howItWorks:
      'The eight qualifiers are split into two groups of four. Every player plays the other three in their group, and the top two from each group advance to the semi-finals, which are straight knockout.\n\nQualification is by the **Race**, which counts only the current season’s results, not the rolling twelve-month ranking. A separate doubles competition runs alongside with eight teams in the same format.\n\nPoints are awarded per round-robin match won as well as for the semi-final and final, so a player’s total depends on their group results rather than only on how far they went.',
    whyItMatters:
      'It is the only significant event where a player can lose and continue, which makes it the one tournament that measures a week of tennis rather than a single afternoon. Winning it undefeated is treated as a distinct achievement for that reason.',
    ruleDifferences:
      'The WTA Finals uses the same shape: eight qualifiers, two groups, knockout semi-finals. Details such as the number of doubles teams and the qualification tie-breaks are set separately by each tour.',
    related: [
      'wta-finals',
      'atp-race',
      'qualifying-for-the-finals',
      'knockout-format',
      'the-tennis-season',
    ],
    ...TOUR_RULES,
  }),

  format({
    slug: 'wta-finals',
    title: 'WTA Finals Explained',
    category: 'tournaments',
    order: 150,
    difficulty: 'intermediate',
    summary: 'The women’s season finale: eight qualifiers, round-robin groups, then knockout.',
    oneSentence:
      'The WTA Finals brings together the eight highest-ranked women of the season for a round-robin tournament followed by knockout semi-finals and a final.',
    howItWorks:
      'Eight singles players in two groups of four, with the top two from each group reaching the semi-finals. A doubles competition runs alongside.\n\nQualification is by the season-long Race rather than by the rolling ranking, so the field is the eight players who have performed best in that calendar year.',
    whyItMatters:
      'As on the men’s side, it is the only major title decided over a group stage, and qualifying for it is itself a season objective for players outside the very top.',
    related: ['atp-finals', 'wta-race', 'qualifying-for-the-finals', 'wta-rankings'],
    ...TOUR_RULES,
  }),

  format({
    slug: 'how-players-qualify-for-tournaments',
    title: 'How Players Qualify for Tournaments',
    category: 'tournaments',
    alsoIn: ['careers'],
    order: 160,
    difficulty: 'intermediate',
    summary: 'Five ways into a draw: ranking, qualifying, wild card, lucky loser and alternate.',
    oneSentence:
      'Players enter a main draw by ranking, by winning through qualifying, by being given a wild card, as a lucky loser, or as an alternate.',
    howItWorks:
      '**Direct acceptance.** Most of the draw. Players enter by the entry deadline and are accepted in ranking order until the direct-acceptance places are full.\n\n**Qualifying.** A separate small tournament in the days before the main draw, whose winners take the remaining places.\n\n**Wild cards.** Places given at the tournament’s discretion, typically to home players, returning former champions and players whose ranking does not reflect their level.\n\n**Lucky losers.** If a player withdraws after the draw is made, a place goes to a player who lost in the final round of qualifying.\n\n**Alternates.** In some competitions, a reserve list from which a player is called up if the field is short.',
    whyItMatters:
      'The route in explains results that otherwise look strange. A qualifier reaching a quarter-final has already won three or four matches before the tournament started, and a wild card ranked outside the top two hundred may be a former top-ten player returning from injury.',
    related: [
      'main-draw-vs-qualifying',
      'qualifier',
      'wild-card',
      'lucky-loser',
      'alternate',
      'ranking-cutoffs',
    ],
    ...TOUR_RULES,
  }),

  format({
    slug: 'main-draw-vs-qualifying',
    title: 'Main Draw vs Qualifying',
    category: 'tournaments',
    alsoIn: ['seeding-and-draws'],
    order: 170,
    difficulty: 'intermediate',
    summary: 'The tournament, and the smaller tournament played to get into it.',
    oneSentence:
      'The main draw is the tournament proper, and qualifying is a separate knockout played beforehand whose winners take the last few places in it.',
    howItWorks:
      '**The main draw** contains the directly accepted players, the wild cards and the qualifiers, and is what the tournament’s results and points refer to.\n\n**Qualifying** is a small knockout of players ranked below the cut-off, played in the days before the main draw. Each qualifying section produces one winner, who enters the main draw as a qualifier.\n\nA player who loses in the final round of qualifying is not necessarily finished: they become eligible to enter as a lucky loser if somebody withdraws.',
    whyItMatters:
      'Qualifying is where most of professional tennis actually happens. It is also physically significant: a qualifier arriving in the main draw has played two or three matches in the previous three days while their first opponent has been resting.',
    ruleDifferences:
      'Qualifying draw sizes, the number of rounds and whether qualifying is seeded vary by tournament and tier, and at the majors the qualifying event is large enough to be a substantial tournament in its own right.',
    related: ['qualifier', 'qualifying-draw', 'lucky-loser', 'how-players-qualify-for-tournaments'],
    ...TOUR_RULES,
  }),

  definition({
    slug: 'qualifier',
    title: 'What Is a Qualifier?',
    category: 'tournaments',
    alsoIn: ['glossary'],
    order: 180,
    summary: 'A player who won through the pre-tournament qualifying event to reach the main draw.',
    oneSentence:
      'A qualifier is a player who earned their place in the main draw by winning matches in the qualifying tournament.',
    explanation:
      'Qualifiers are marked "Q" on a draw sheet. They are usually ranked below the direct-acceptance cut-off, and they arrive in the main draw already several matches into their week.\n\nThat cuts both ways. They are match-tight and playing well by definition, having just won two or three matches, and they are also more tired than a seeded player who has not yet hit a competitive ball.',
    example:
      'A draw entry reading "(Q) Player G" means that player came through qualifying rather than entering directly.',
    whyItMatters:
      'A deep run by a qualifier is one of the most reliably compelling stories in tennis, and it is also a ranking event: the points for reaching a late round from qualifying can move a player dozens of places.',
    related: ['main-draw-vs-qualifying', 'qualifying-draw', 'lucky-loser', 'wild-card'],
  }),

  definition({
    slug: 'wild-card',
    title: 'What Is a Wild Card?',
    category: 'tournaments',
    alsoIn: ['glossary', 'careers'],
    order: 190,
    summary:
      'A place in the draw given at the tournament’s discretion rather than earned by ranking.',
    oneSentence:
      'A wild card is an entry into a tournament awarded by the organisers rather than obtained through ranking or qualifying.',
    explanation:
      'Each tournament has a small number to award, in the main draw and in qualifying. They typically go to home players, to former champions returning from injury or absence, to promising juniors, and occasionally as part of a reciprocal arrangement between tournaments in different countries.\n\nMarked "WC" on a draw sheet.',
    whyItMatters:
      'Wild cards are one of the few genuinely discretionary elements in a sport otherwise governed by ranking, and they are contested for exactly that reason: a wild card into a major is worth guaranteed prize money and points that a player outside the cut-off has no other route to.',
    misunderstandings:
      '**"A wild card is a weak player."** Often the opposite. A returning former champion with a protected ranking or an injury-hit top-twenty player will frequently be the most dangerous unseeded entrant in the draw.',
    related: [
      'qualifier',
      'protected-ranking',
      'how-players-qualify-for-tournaments',
      'injury-comebacks',
    ],
  }),

  definition({
    slug: 'lucky-loser',
    title: 'What Is a Lucky Loser?',
    category: 'tournaments',
    alsoIn: ['glossary'],
    order: 200,
    difficulty: 'intermediate',
    summary:
      'A player who lost in qualifying and got into the main draw anyway after a withdrawal.',
    oneSentence:
      'A lucky loser is a player who lost in the final round of qualifying and is then admitted to the main draw because another player withdrew.',
    explanation:
      'When a player withdraws after the draw has been made, their place goes to a lucky loser. Which of the qualifying losers gets in is determined by the tournament’s rules, generally favouring the highest-ranked among them, with a draw where several are tied.\n\nMarked "LL" on a draw sheet.',
    whyItMatters:
      'Lucky losers have on rare occasions gone on to reach late rounds of major tournaments, which makes them a recurring statistical curiosity and a real illustration of how narrow the gap is between the players just inside and just outside a main draw.',
    related: ['qualifier', 'main-draw-vs-qualifying', 'alternate', 'walkover'],
  }),

  definition({
    slug: 'alternate',
    title: 'What Is an Alternate?',
    category: 'tournaments',
    alsoIn: ['glossary'],
    order: 210,
    difficulty: 'advanced',
    summary: 'A reserve player who steps in if the field is short.',
    oneSentence:
      'An alternate is a reserve player named to replace an entrant who withdraws, most visibly at the season-ending Finals.',
    explanation:
      'The term is used in two ways. At most tournaments an alternate is a player on the reserve list who is called into a draw when a place opens up before it is made.\n\nAt the ATP and WTA Finals, alternates are the ninth and tenth qualifiers, present at the venue and ready to replace a player who withdraws or retires mid-event. An alternate at the Finals can end up playing a round-robin match and earning points from it.',
    related: ['lucky-loser', 'atp-finals', 'wta-finals', 'how-players-qualify-for-tournaments'],
  }),

  definition({
    slug: 'bye',
    title: 'What Does "Bye" Mean?',
    category: 'tournaments',
    alsoIn: ['glossary', 'seeding-and-draws'],
    order: 220,
    summary: 'A free pass through a round, given to top seeds when the draw is not a power of two.',
    oneSentence:
      'A bye is an automatic advance to the next round, awarded when the draw has fewer players than a full bracket requires.',
    explanation:
      'A knockout bracket needs a power of two. A tournament with, say, 56 players in a 64-place bracket has eight empty slots, and those are given to the eight highest seeds as byes.\n\nA player with a bye does not play in the first round and enters in the second, which is both an advantage in rest and a mild disadvantage in match rhythm.',
    example:
      'In a 48-player draw, the top sixteen seeds receive first-round byes, so the second round is the first time they play.',
    whyItMatters:
      'Byes are one of the concrete benefits of a high seeding, and they are why a top seed at a Masters event can win the title having played fewer matches than a qualifier who reached the semi-finals.',
    related: ['seed', 'knockout-format', 'tournament-draw', 'how-draws-work'],
  }),

  definition({
    slug: 'walkover',
    title: 'What Is a Walkover?',
    category: 'tournaments',
    alsoIn: ['glossary'],
    order: 230,
    summary: 'A win awarded because the opponent did not start the match.',
    oneSentence:
      'A walkover is recorded when a player advances without playing because their opponent withdrew before the match began.',
    explanation:
      'It is marked "w/o" on a draw. The withdrawing player is usually injured or ill, and the withdrawal happens before the first ball.\n\nA walkover is **not** a match. It does not count in a player’s win-loss record, and head-to-head records generally exclude it, because nobody played.',
    whyItMatters:
      'The distinction from a retirement matters for statistics. A retirement is a match that started and is counted as a win and a loss; a walkover is not a match at all.',
    misunderstandings:
      '**"A walkover counts as a win."** It advances the player and earns them the round’s points and prize money, but it is not recorded as a match win in most statistical treatments.',
    related: ['retirement', 'default', 'lucky-loser'],
    ...TOUR_RULES,
  }),

  definition({
    slug: 'retirement',
    title: 'What Is a Retirement?',
    category: 'tournaments',
    alsoIn: ['glossary'],
    order: 240,
    summary: 'A match abandoned mid-play because one player cannot continue.',
    oneSentence:
      'A retirement is when a player stops during a match, usually through injury or illness, and their opponent is awarded the win.',
    explanation:
      'Marked "ret." on a scoreline, with the score at the moment of stopping recorded: "6-3, 2-1 ret." means the player retired trailing in the second set.\n\nUnlike a walkover, the match happened. It counts as a win and a loss, and the score up to that point stands.',
    whyItMatters:
      'Retirements affect statistics in awkward ways. Whether a match that ended after four games should count fully in a head-to-head, or in a serve-percentage average, has no single right answer, and different data sources treat it differently.',
    related: ['walkover', 'default', 'medical-timeouts', 'head-to-head-analysis'],
    ...RULES,
  }),

  definition({
    slug: 'default',
    title: 'What Is a Default?',
    category: 'tournaments',
    alsoIn: ['glossary', 'officiating'],
    order: 250,
    difficulty: 'intermediate',
    summary: 'A player disqualified from a match by the officials.',
    oneSentence:
      'A default is a disqualification: the officials remove a player from the match, usually for conduct.',
    explanation:
      'A default follows either an accumulation of code violations under the point penalty system, or a single act serious enough to be defaulted immediately, such as striking a ball or a racket in a way that endangers somebody.\n\nThe decision is taken by the referee, on the recommendation of the chair umpire, rather than by the chair umpire alone. Defaults typically carry the loss of ranking points and prize money from that tournament, in addition to any fine.',
    whyItMatters:
      'A default is the sport’s ultimate sanction and is rare enough that each instance becomes part of the sport’s history. The mechanism matters because it is not discretionary at the extreme: a ball struck dangerously is defaulted regardless of intent.',
    related: [
      'when-a-player-is-defaulted',
      'point-penalty-system',
      'code-violations',
      'racket-and-ball-abuse',
    ],
    ...TOUR_RULES,
  }),
];

/* ────────────────────────────────────────────────────────────────────────────
 * Rankings
 * ────────────────────────────────────────────────────────────────────────── */

const RANKINGS: ExplainerSeed[] = [
  rankingConcept({
    slug: 'atp-rankings',
    title: 'ATP Rankings Explained',
    category: 'rankings',
    isFeatured: true,
    order: 10,
    difficulty: 'intermediate',
    summary: 'A rolling 52-week total of a player’s best results, not a season table.',
    oneSentence:
      'The ATP ranking is the sum of the points a player has earned from a limited number of their best tournaments over the previous 52 weeks.',
    howItWorks:
      '**Rolling, not seasonal.** The ranking always covers the last 52 weeks. Points earned at a tournament are held for a year and then removed when that tournament comes round again.\n\n**Best results, not all results.** A player’s total counts a capped number of tournaments, with the majors and the mandatory events counted whether or not they were good. Playing more events beyond the cap does not add points.\n\n**Published weekly**, on a Monday, which is why a player’s ranking can change without them playing: their own points from last year dropped off, or a rival gained.\n\nThe exact number of counting tournaments, which events are mandatory and the points table itself are set by the ATP and revised periodically, so those specifics are properties of the current rulebook rather than fixed features of the system.',
    workedExample:
      'A player has 3,200 points. Last year they reached the semi-finals of an event starting on Monday and earned 360 there. If they lose in the first round this year and earn nothing, their total becomes 2,840 without any rival doing anything at all.\n\nThat is what "defending points" means, and why a player can drop ten places in a week they played a match.',
    whyItMatters:
      'The rolling window makes the ranking a measure of the last year rather than of the last month or of a career. That is deliberate: it makes the ranking suitable for its actual job, which is deciding tournament entry and seeding, rather than for settling who is best.',
    ruleDifferences:
      'The WTA ranking works on the same rolling 52-week principle but with its own points table, its own count of counting tournaments and its own commitment rules. The two totals are not comparable as numbers.',
    misunderstandings:
      '**"The ranking is the season standings."** That is the **Race**, which counts only the current calendar year and is what decides qualification for the Finals.',
    related: [
      'wta-rankings',
      'defending-points',
      'ranking-vs-race',
      'earning-ranking-points',
      'rankings-and-tournament-entry',
    ],
    ...TOUR_RULES,
  }),

  rankingConcept({
    slug: 'wta-rankings',
    title: 'WTA Rankings Explained',
    category: 'rankings',
    order: 20,
    difficulty: 'intermediate',
    summary:
      'The women’s rolling 52-week ranking, on the same principle as the ATP’s with its own table.',
    oneSentence:
      'The WTA ranking sums a player’s points from a limited number of their best tournaments over the previous 52 weeks.',
    howItWorks:
      'The mechanics match the men’s system in principle: a rolling 52-week window, a capped number of counting tournaments including mandatory events, and weekly publication.\n\nWhat differs is the detail. The WTA sets its own points table, its own list of mandatory events, its own count of counting tournaments and its own rules on how a player’s commitment obligations interact with injury. These have been revised more than once, which is why the current WTA rulebook is the authority rather than a general description.',
    workedExample:
      'The arithmetic is identical in shape to the men’s. A player holding 2,400 points who is defending 470 from a tournament this week starts the week knowing that anything short of the same result reduces their total.',
    whyItMatters:
      'The ranking decides entry, seeding and, through the associated Race, qualification for the WTA Finals, which makes it the single most consequential number in a player’s professional life.',
    misunderstandings:
      '**"ATP and WTA points can be compared."** They cannot. The tables are set independently, so a player with 4,000 points on one tour is not thereby equivalent to a player with 4,000 on the other.',
    related: ['atp-rankings', 'wta-race', 'defending-points', 'earning-ranking-points', 'wta-1000'],
    ...TOUR_RULES,
  }),

  rankingConcept({
    slug: 'earning-ranking-points',
    title: 'How Tennis Players Earn Ranking Points',
    category: 'rankings',
    order: 30,
    difficulty: 'intermediate',
    summary: 'Points come from rounds reached, weighted by the tier of tournament.',
    oneSentence:
      'A player earns ranking points according to how far they go in a tournament and how large that tournament is.',
    howItWorks:
      'Every tournament publishes a table of points by round: so much for losing in the first round, more for the second, and a large jump at the final and the title.\n\nThe tier multiplies everything. Reaching the quarter-finals of a Grand Slam is worth several times reaching the quarter-finals of a 250-level event, which is why a single good major can be worth more than a strong month elsewhere.\n\n**Qualifying** awards points too, in smaller amounts, and a player who qualifies keeps those in addition to whatever they earn in the main draw.\n\nBecause each tour revises its table periodically, the shape of the system is stable and the specific numbers are not.',
    workedExample:
      'Using round illustrative figures rather than a current table: suppose a major awards 10 for a first-round loss, 45 for the second round, 90 for the third, 180 for the fourth, 360 for a quarter-final, 720 for a semi-final, 1,200 for a runner-up and 2,000 for the title.\n\nA player who loses in the third round has 90. A player who reaches the semi-finals has 720, or eight times as much for two extra wins. The steepness is the point: the system deliberately rewards the late rounds far more than the early ones.',
    whyItMatters:
      'The steep curve is why players structure entire seasons around four tournaments. Consistency at small events cannot substitute for a deep run at a major, arithmetically.',
    related: [
      'losing-ranking-points',
      'atp-rankings',
      'wta-rankings',
      'points-vs-prize-money',
      'grand-slam-vs-tour-event',
    ],
    ...TOUR_RULES,
  }),

  rankingConcept({
    slug: 'losing-ranking-points',
    title: 'Why Players Lose Ranking Points',
    category: 'rankings',
    order: 40,
    difficulty: 'intermediate',
    summary: 'Because points expire after 52 weeks, whether or not the player plays.',
    oneSentence:
      'Points drop off the ranking exactly 52 weeks after they were earned, so a player loses them unless they repeat the result.',
    howItWorks:
      'The ranking is a rolling window. Every week, the points earned in the corresponding week last year come off, and whatever is earned this week goes on.\n\nThat produces three ways to lose points:\n\n- **Playing and doing worse** than last year at the same event.\n- **Not playing at all**, in which case the entire previous year’s points from that event are lost with nothing replacing them.\n- **Injury**, which is the same as not playing, and is why a long absence collapses a ranking regardless of how good the player still is.',
    workedExample:
      'A player won a 500-level title last year, earning 500 points. This year they lose in the second round of the same event and earn, say, 45.\n\nTheir total changes by −500 + 45 = −455, in a week when they won a match.',
    whyItMatters:
      'This is why ranking movement so often seems disconnected from how a player is performing. The question is never "how did they play this week" but "how did they play this week compared with the same week last year".',
    misunderstandings:
      '**"Losing early costs you points."** Losing early **fails to replace** points. The loss came from the calendar, not from the defeat.',
    related: [
      'defending-points',
      'atp-rankings',
      'protected-ranking',
      'injury-comebacks',
      'dropping-down-the-rankings',
    ],
    ...TOUR_RULES,
  }),

  rankingConcept({
    slug: 'points-vs-prize-money',
    title: 'Ranking Points vs Prize Money',
    category: 'rankings',
    alsoIn: ['careers'],
    order: 50,
    difficulty: 'beginner',
    summary: 'Two different rewards for the same results, which do not move together.',
    oneSentence:
      'Ranking points determine where a player can play, and prize money determines whether they can afford to, and the two are awarded on different scales.',
    howItWorks:
      'Both are awarded by round reached, but they are not proportional to each other.\n\n**Points** buy access: entry into bigger tournaments, seeding, and a place in the year-end Finals.\n\n**Prize money** pays for a career: travel, coaching, physiotherapy, stringing and tax, all of which a player pays themselves.\n\nA tournament with large prize money and modest points is a different proposition from one with the reverse, and players ranked at different levels rationally choose differently between them.',
    workedExample:
      'A player ranked around 150 reaching a Grand Slam main draw earns first-round prize money that may exceed everything they made in the previous three months on the Challenger circuit, while adding relatively few points. The points may matter less to them that week than the money.',
    whyItMatters:
      'It explains scheduling decisions that look irrational from the outside, including why a player might skip a points-rich event for a lucrative one, or play the week before a major.',
    related: [
      'earning-ranking-points',
      'prize-money-vs-earnings',
      'lower-ranked-player-finances',
      'rankings-and-tournament-entry',
    ],
    ...TOUR_RULES,
  }),

  rankingConcept({
    slug: 'world-number-one',
    title: 'What Does World No. 1 Mean?',
    category: 'rankings',
    isFeatured: true,
    order: 60,
    difficulty: 'beginner',
    summary: 'The top of the rolling 52-week ranking, held for as long as the points last.',
    oneSentence:
      'The world No. 1 is the player with the most ranking points over the previous 52 weeks, as published each Monday.',
    howItWorks:
      'There is nothing more to it than the arithmetic: the highest total is No. 1. Because the ranking rolls, the position can change without a match being played, when the leader’s own points from a year ago expire.\n\nTwo separate records are kept and often confused: **total weeks at No. 1**, which counts every week a player has held it across their career, and **year-end No. 1**, which counts the years in which they held it on the final ranking of the season.',
    workedExample:
      'A player can become No. 1 on a Monday having lost in the first round the previous week, if the player above them was defending a title and lost early.',
    whyItMatters:
      'It is the sport’s headline honour outside the majors, and the two records measure genuinely different things: weeks at No. 1 rewards sustained dominance, and year-end No. 1 rewards holding it at the moment the season closes.',
    misunderstandings:
      '**"The No. 1 is the best player."** They are the player with the most points over 52 weeks. Those usually coincide and do not have to: a player can win two majors and not be No. 1 if another has been more consistent across the year.',
    related: [
      'becoming-world-number-one',
      'year-end-number-one',
      'atp-rankings',
      'ranking-vs-elo',
      'career-high-ranking',
    ],
    ...TOUR_RULES,
  }),

  rankingConcept({
    slug: 'becoming-world-number-one',
    title: 'How Players Become World No. 1',
    category: 'rankings',
    order: 70,
    difficulty: 'intermediate',
    summary:
      'By gaining more than the player above them, or by that player losing points they were defending.',
    oneSentence:
      'A player becomes No. 1 when their 52-week total passes everybody else’s, which can happen by gaining points or by a rival losing them.',
    howItWorks:
      'Two mechanisms, usually working together.\n\n**Gaining.** Winning a large event adds a substantial block of points at once, which is why the No. 1 ranking so often changes hands during or immediately after a Grand Slam.\n\n**A rival dropping.** The current No. 1 loses whatever they earned in the corresponding week last year. If they won a major twelve months ago and lose early this time, a large deficit opens without the challenger doing anything.\n\nThis is why "scenarios" are published before big tournaments: the outcome depends on both players’ results and on what each is defending.',
    workedExample:
      'Player A leads with 8,000 points and is defending 2,000 from last year’s title at this event. Player B has 7,200 and is defending 90.\n\nIf A loses in the second round (earning, say, 90) and B reaches the semi-finals (earning 720), A finishes on 6,090 and B on 7,830. B becomes No. 1 without winning the tournament.',
    whyItMatters:
      'It explains why the ranking can change in a week that looks unremarkable, and why players talk about "points to defend" as a burden rather than an achievement.',
    related: [
      'world-number-one',
      'defending-points',
      'year-end-number-one',
      'atp-race',
      'losing-ranking-points',
    ],
    ...TOUR_RULES,
  }),

  rankingConcept({
    slug: 'year-end-number-one',
    title: 'What Is a Year-End No. 1?',
    category: 'rankings',
    order: 80,
    difficulty: 'intermediate',
    summary: 'Holding the top ranking on the final ranking list of the season.',
    oneSentence:
      'The year-end No. 1 is the player at the top of the ranking when the final list of the season is published.',
    howItWorks:
      'It is decided on the last ranking published after the season’s final event. Because it is a snapshot rather than an average, a player can hold the position for most of the year and lose it in November, or take it having not held it before.\n\nBoth tours recognise the achievement formally, and it is counted separately from total weeks at No. 1.',
    whyItMatters:
      'Year-end No. 1 is the standard measure of who had the best season, in a way that a mid-season No. 1 ranking is not. It is one of the few honours in tennis that cannot be won in a single fortnight.',
    misunderstandings:
      '**"Year-end No. 1 means winning the Finals."** It does not. The Finals award points that can decide it, but a player can win the Finals and finish second, or finish first without playing well there.',
    related: [
      'world-number-one',
      'atp-race',
      'wta-race',
      'atp-finals',
      'qualifying-for-the-finals',
    ],
    ...TOUR_RULES,
  }),

  rankingConcept({
    slug: 'defending-points',
    title: 'What Does "Defending Points" Mean?',
    category: 'rankings',
    isFeatured: true,
    order: 90,
    difficulty: 'intermediate',
    summary: 'Having to repeat last year’s result at a tournament simply to stand still.',
    oneSentence:
      'Defending points means a player is about to lose the points they earned at the same tournament last year, and must match that result to keep their ranking.',
    howItWorks:
      'Because the ranking covers a rolling 52 weeks, arriving at a tournament means the previous year’s points from it are about to expire.\n\nA player who won the title last year is "defending 500", or 1,000, or whatever the tier awards. They must win it again to break even. Anything less is a net loss, and not playing at all is the maximum loss.\n\nThis is the single most useful idea for understanding ranking movement, and the one most often missing from coverage.',
    workedExample:
      'Two players arrive at the same event.\n\n- Player A won it last year: defending 500. They reach the final this year, earning 300. Net change: **−200**.\n- Player B lost in the first round last year: defending 10. They lose in the second round, earning 45. Net change: **+35**.\n\nPlayer A reached a final and lost ground. Player B lost in round two and gained. Neither result tells you anything about the ranking without knowing what was being defended.',
    whyItMatters:
      'It is why a player’s ranking trajectory is often decided before the season starts, by what they did last year, and why commentators talk about a player having "nothing to defend" as an advantage.',
    related: [
      'losing-ranking-points',
      'atp-rankings',
      'becoming-world-number-one',
      'the-tennis-season',
      'protected-ranking',
    ],
    ...TOUR_RULES,
  }),

  rankingConcept({
    slug: 'rankings-and-tournament-entry',
    title: 'How Rankings Affect Tournament Entry',
    category: 'rankings',
    alsoIn: ['tournaments'],
    order: 100,
    difficulty: 'intermediate',
    summary: 'The ranking is not a prize, it is an entry ticket and a seeding.',
    oneSentence:
      'A player’s ranking on the entry deadline determines which tournaments accept them and how they are seeded.',
    howItWorks:
      '**Acceptance.** Tournaments accept entrants in ranking order down to the size of their draw. The ranking that counts is the one on the entry deadline, typically several weeks before the event, not the one on the day.\n\n**Qualifying.** Players below the direct cut-off may enter qualifying, which has its own, lower cut-off.\n\n**Seeding.** Among the accepted players, seeds are assigned by ranking at a later date, usually closer to the tournament.\n\nThe gap between the entry deadline and the tournament is why a player whose ranking has risen sharply can be stuck in qualifying at an event where their current ranking would have got them in directly.',
    whyItMatters:
      'This is the ranking’s actual function. It exists to allocate places and seedings, and everything else about it, including its use as a measure of who is best, is a by-product.',
    related: [
      'ranking-cutoffs',
      'main-draw-vs-qualifying',
      'seed',
      'ranking-vs-seeding',
      'atp-rankings',
    ],
    ...TOUR_RULES,
  }),

  rankingConcept({
    slug: 'protected-ranking',
    title: 'What Is a Protected Ranking?',
    category: 'rankings',
    alsoIn: ['careers'],
    order: 110,
    difficulty: 'advanced',
    summary: 'A frozen ranking that lets an injured player enter tournaments on their return.',
    oneSentence:
      'A protected ranking, also called a special ranking, lets a player returning from a long injury absence enter a limited number of tournaments using their ranking from before the injury.',
    howItWorks:
      'A player absent for an extended period may apply to have their ranking at the start of the absence preserved for entry purposes.\n\nOn return, they may use that protected ranking to enter a limited number of events over a limited period. It gets them **into** tournaments; it does not restore their actual ranking, which has already collapsed, and in general it does not entitle them to a seeding.\n\nThe qualifying absence, the number of events and the window in which they can be used are set by each tour and by the Grand Slam Board, and these rules have been revised, including changes intended to accommodate maternity leave. The current rulebooks are the authority.',
    whyItMatters:
      'Without it, a top player returning after a year out would have to rebuild from ITF events, which would end most careers that a serious injury interrupts. It is the mechanism that makes comebacks possible at all.',
    misunderstandings:
      '**"A protected ranking restores your ranking."** It does not. It is an entry mechanism only, and a returning player is still unseeded and can meet a top seed in the first round, which is why comebacks look so brutal on the draw sheet.',
    related: [
      'injury-comebacks',
      'losing-ranking-points',
      'wild-card',
      'rankings-and-tournament-entry',
      'dropping-down-the-rankings',
    ],
    ...TOUR_RULES,
  }),

  definition({
    slug: 'career-high-ranking',
    title: 'What Is a Career-High Ranking?',
    category: 'rankings',
    alsoIn: ['glossary'],
    order: 120,
    summary: 'The highest ranking a player has ever reached.',
    oneSentence:
      'A career-high ranking is the best position a player has achieved on the weekly ranking list at any point in their career.',
    explanation:
      'Because rankings are published weekly, a career high can be held for a single week. It is recorded with the date it was reached.\n\nIt is a useful shorthand for a player’s peak level, and a limited one: a player whose career high was reached in a weak period of the tour is not thereby equivalent to one who reached the same number against stronger competition.',
    whyItMatters:
      'It appears constantly in commentary as a way of describing a player who is currently ranked lower, most often after injury, and it is the number that gives context to a wild card or a protected ranking.',
    related: ['world-number-one', 'protected-ranking', 'ranking-vs-elo', 'atp-rankings'],
  }),

  rankingConcept({
    slug: 'ranking-vs-race',
    title: 'Ranking vs Race Explained',
    category: 'rankings',
    isFeatured: true,
    order: 130,
    difficulty: 'intermediate',
    summary: 'One counts the last 52 weeks, the other counts this calendar year only.',
    oneSentence:
      'The ranking is a rolling 52-week total used for entry and seeding, while the Race counts only the current calendar year and decides qualification for the Finals.',
    howItWorks:
      '**The ranking** rolls. It always covers the previous 52 weeks, so in June it includes results from the second half of last year.\n\n**The Race** resets. It starts at zero on the first day of the season and counts only this year’s results.\n\nIn January the two are nearly the same thing, because the year is young and almost all the rolling window is last season. By November the Race is the definitive statement of who has had the best season, and the ranking is a statement about the last twelve months.',
    workedExample:
      'A player who won a major last September and has been injured since will still rank highly in June, because September’s points are inside the 52-week window. Their Race position will be near the bottom, because they have earned nothing this calendar year.\n\nThe two numbers are both correct. They answer different questions.',
    whyItMatters:
      'Confusing them is the most common error in ranking coverage. Qualification for the ATP and WTA Finals is by the Race, not by the ranking, and so is the year-end No. 1.',
    related: [
      'atp-race',
      'wta-race',
      'atp-rankings',
      'qualifying-for-the-finals',
      'year-end-number-one',
    ],
    ...TOUR_RULES,
  }),

  rankingConcept({
    slug: 'atp-race',
    title: 'ATP Race Explained',
    category: 'rankings',
    order: 140,
    difficulty: 'intermediate',
    summary: 'The men’s calendar-year standings, which decide who plays the ATP Finals.',
    oneSentence:
      'The ATP Race is a calendar-year points table that determines the eight qualifiers for the ATP Finals and the year-end No. 1.',
    howItWorks:
      'The Race starts at zero in the first week of the season and accumulates the same points a player earns for the rolling ranking. Nothing expires, because there is no rolling window: the table simply grows until the season ends.\n\nThe top eight in the Race at the end of the season qualify for the ATP Finals, with a separate doubles race for teams. The player at the top of the Race at the end of the season is the year-end No. 1.',
    workedExample:
      'A player who starts the season poorly but wins two large titles in the autumn can climb the Race very quickly, because there is nothing being subtracted. The same run moves their ranking more slowly, because it is partly replacing points they already had.',
    related: [
      'ranking-vs-race',
      'wta-race',
      'atp-finals',
      'qualifying-for-the-finals',
      'year-end-number-one',
    ],
    ...TOUR_RULES,
  }),

  rankingConcept({
    slug: 'wta-race',
    title: 'WTA Race Explained',
    category: 'rankings',
    order: 150,
    difficulty: 'intermediate',
    summary: 'The women’s calendar-year standings, which decide who plays the WTA Finals.',
    oneSentence:
      'The WTA Race is a calendar-year points table that determines the eight qualifiers for the WTA Finals and the year-end No. 1.',
    howItWorks:
      'Identical in principle to the ATP Race: a table starting at zero each January, accumulating this season’s points only, with the top eight qualifying for the WTA Finals in singles and eight teams in doubles.\n\nThe details of qualification, including how tie-breaks are resolved and how a player’s Grand Slam results are treated, are set by the WTA and are the part worth checking against the current rulebook.',
    related: [
      'ranking-vs-race',
      'atp-race',
      'wta-finals',
      'wta-rankings',
      'qualifying-for-the-finals',
    ],
    ...TOUR_RULES,
  }),

  rankingConcept({
    slug: 'qualifying-for-the-finals',
    title: 'How Players Qualify for the ATP and WTA Finals',
    category: 'rankings',
    alsoIn: ['tournaments'],
    order: 160,
    difficulty: 'intermediate',
    summary: 'The top eight in the season Race, not the top eight in the ranking.',
    oneSentence:
      'The eight players who qualify for each tour’s season finale are the top eight in that tour’s calendar-year Race.',
    howItWorks:
      'Qualification runs on the Race, so only this season counts. A player who was superb last autumn and ordinary this year will not qualify regardless of their ranking.\n\nEight singles players qualify, along with eight doubles teams. The ninth and tenth in the Race are typically named as alternates and travel to the event in case of withdrawal.\n\nA Grand Slam champion’s position in the Race is often decisive, because the points on offer at a major are large enough to move a player several places in one fortnight.',
    whyItMatters:
      'The qualification race is a season-long subplot in its own right, and it is the reason the autumn events matter to players ranked between eight and fifteen far more than their tier would suggest.',
    related: ['atp-race', 'wta-race', 'atp-finals', 'wta-finals', 'ranking-vs-race', 'alternate'],
    ...TOUR_RULES,
  }),
];

/* ────────────────────────────────────────────────────────────────────────────
 * Seeding & draws
 * ────────────────────────────────────────────────────────────────────────── */

const SEEDING: ExplainerSeed[] = [
  format({
    slug: 'seed',
    title: 'What Is a Seed?',
    category: 'seeding-and-draws',
    alsoIn: ['glossary'],
    isStartHere: true,
    order: 10,
    difficulty: 'beginner',
    summary: 'A ranked player placed in the draw so that the best players are kept apart.',
    oneSentence:
      'A seed is a player given a fixed position in the draw according to their ranking, so that the highest-ranked players cannot meet in the early rounds.',
    howItWorks:
      'Before the draw is made, the highest-ranked entrants are designated seeds and numbered: the top-ranked entrant is the No. 1 seed, and so on.\n\nEach seed number has a defined place in the bracket. The top two seeds go to opposite ends, so they can only meet in the final. Seeds 3 and 4 are drawn into the two remaining quarters, seeds 5 to 8 into the eight remaining eighths, and so on down.\n\nEverybody else is drawn at random into the empty places.',
    diagram: SEEDED_DRAW,
    example:
      'In a 32-player draw with eight seeds, a seeded player cannot meet another seed before the third round.',
    whyItMatters:
      'Seeding is what prevents a tournament from producing a final between the players ranked 40 and 55 because the top four were drawn together. It shapes the entire competitive structure of the event.',
    ruleDifferences:
      'The number of seeds is set by the tournament and has changed over time: the majors have used both 16 and 32 seeds in a 128 draw within recent memory, and the choice materially changes how protected the top players are.',
    related: [
      'why-tournaments-have-seeds',
      'ranking-vs-seeding',
      'separating-top-seeds',
      'seeded-vs-unseeded',
      'how-draws-work',
    ],
    ...TOUR_RULES,
  }),

  format({
    slug: 'why-tournaments-have-seeds',
    title: 'Why Tournaments Have Seeds',
    category: 'seeding-and-draws',
    order: 20,
    difficulty: 'beginner',
    summary:
      'To stop a random draw from eliminating the best players against each other in round one.',
    oneSentence:
      'Seeding exists so that a knockout draw produces a final between two of the strongest players rather than eliminating them against each other early.',
    howItWorks:
      'In a purely random 128-player draw, the two best players would meet in the first round about once every 127 tournaments, and any two of the top eight would meet early far more often than that.\n\nOver a season that would produce finals contested by players who happened to avoid each other, and the tournament would measure luck as much as tennis. Seeding removes that specific form of luck while leaving the rest of the draw random.',
    whyItMatters:
      'It is also a commercial fact. A tournament that loses its biggest names in the first two days has a much less valuable second week, and seeding is what makes the schedule predictable enough to sell.',
    misunderstandings:
      '**"Seeding guarantees the top players reach the later rounds."** It guarantees only that they will not meet each other early. An unseeded player can still beat the top seed in round one, and does.',
    related: ['seed', 'separating-top-seeds', 'top-players-meeting-early', 'knockout-format'],
    ...TOUR_RULES,
  }),

  format({
    slug: 'ranking-vs-seeding',
    title: 'Ranking vs Seeding',
    category: 'seeding-and-draws',
    order: 30,
    difficulty: 'intermediate',
    summary:
      'Seeding is a tournament’s ordering of its own entrants, which usually but not always follows ranking.',
    oneSentence:
      'A ranking is a player’s position on the tour list, while a seeding is their position among the players who entered this particular tournament.',
    howItWorks:
      'Seeds are assigned by ranking **among the entrants**. If the world No. 1, No. 3 and No. 6 are the only top-ten players in a draw, they will be seeds 1, 2 and 3, so a player’s seeding is usually better than their ranking.\n\nA tournament may also adjust seeding in defined circumstances. Wimbledon historically used a formula weighting recent grass-court results when seeding the men’s draw, which produced seedings that deliberately did not match the rankings.\n\nSeedings are set from the ranking on a date closer to the tournament than the entry deadline, which is why a player can be accepted on one ranking and seeded on another.',
    example:
      'A player ranked 20 in the world can be the 8th seed at an event that the seven higher-ranked entrants happen to be the only ones above them.',
    misunderstandings:
      '**"The No. 1 seed is the world No. 1."** Only if they entered. The No. 1 seed is the highest-ranked player in this draw.',
    related: ['seed', 'rankings-and-tournament-entry', 'how-draws-work', 'seeded-vs-unseeded'],
    ...TOUR_RULES,
  }),

  format({
    slug: 'how-draws-work',
    title: 'How Tournament Draws Work',
    category: 'seeding-and-draws',
    order: 40,
    difficulty: 'intermediate',
    summary:
      'Seeds placed by rule, everybody else placed at random, with qualifiers slotted in last.',
    oneSentence:
      'A draw is made by placing the seeds at their designated positions and then drawing every other player at random into the remaining places.',
    howItWorks:
      '**Step one: the bracket.** A blank bracket of 32, 64 or 128 positions, with byes assigned to the top seeds if the field is short of a power of two.\n\n**Step two: the seeds.** Seed 1 goes to the top of the bracket and seed 2 to the bottom. Seeds 3 and 4 are drawn between the two remaining quarters, seeds 5 to 8 between the four remaining eighths, and so on. Which seed lands in which section within their group is random, which is why the No. 3 seed can be in either half.\n\n**Step three: everybody else.** Unseeded players are drawn at random into the empty positions.\n\n**Step four: qualifiers.** Qualifying finishes after the main draw is made, so the draw contains "Qualifier" placeholders which are filled by lot once qualifying is complete.',
    diagram: SEEDED_DRAW,
    whyItMatters:
      'The mix of rule and randomness is why draws are discussed so intensely. The structure is fixed and the contents are not, so one seed can land in a section of dangerous unseeded players while another gets a clear path.',
    related: ['tournament-draw', 'seed', 'separating-top-seeds', 'qualifying-draw', 'bye'],
    ...TOUR_RULES,
  }),

  format({
    slug: 'separating-top-seeds',
    title: 'Why Top Seeds Are Separated',
    category: 'seeding-and-draws',
    order: 50,
    difficulty: 'intermediate',
    summary: 'So that the higher a player is seeded, the later they can meet another seed.',
    oneSentence:
      'Seeds are distributed so that the two highest can only meet in the final, the top four only in the semi-finals, and the top eight only in the quarter-finals.',
    howItWorks:
      'The bracket is divided in halves, quarters and eighths.\n\n**Seeds 1 and 2** go into different halves.\n\n**Seeds 3 and 4** are drawn into the two quarters not containing 1 and 2, one each.\n\n**Seeds 5 to 8** are drawn into the four remaining eighths, one each.\n\nThe pattern continues down the seed list. The consequence is a guarantee about the earliest round in which two given seeds can meet, which is what a seeding is actually promising.',
    diagram: SEEDED_DRAW,
    example:
      'In a draw with 32 seeds, the No. 1 seed cannot meet the No. 2 seed before the final, cannot meet seeds 3 or 4 before the semi-finals, and cannot meet a seeded player at all before the third round.',
    related: ['seed', 'how-draws-work', 'top-players-meeting-early', 'why-tournaments-have-seeds'],
    ...TOUR_RULES,
  }),

  definition({
    slug: 'seeded-vs-unseeded',
    title: 'Seeded vs Unseeded Players',
    category: 'seeding-and-draws',
    alsoIn: ['glossary'],
    order: 60,
    summary: 'Whether a player was given a protected position in the draw.',
    oneSentence:
      'A seeded player has a designated position in the bracket, and an unseeded player is drawn at random into whatever is left.',
    explanation:
      'Seeded players are the highest-ranked entrants, numbered from 1 down to whatever the tournament’s seed count is. Everybody else is unseeded.\n\nThe practical difference is who you can meet and when. An unseeded player can be drawn against the top seed in the first round; a seeded player cannot meet another seed until a defined round.',
    whyItMatters:
      'A dangerous unseeded player is the recurring theme of every draw discussion: a former champion returning from injury, or a young player rising quickly, will be unseeded because of their ranking while being nothing like the rest of the unseeded field.',
    related: ['seed', 'unseeded', 'separating-top-seeds', 'protected-ranking', 'wild-card'],
  }),

  format({
    slug: 'draw-ceremony',
    title: 'What Is a Draw Ceremony?',
    category: 'seeding-and-draws',
    order: 70,
    difficulty: 'beginner',
    summary: 'The public event at which a tournament’s bracket is made.',
    oneSentence:
      'A draw ceremony is the public occasion at which the random element of a tournament’s bracket is drawn, usually a day or two before play begins.',
    howItWorks:
      'The seeds are already fixed by ranking. What is drawn is where the unseeded players go, and which section each seed below the top two falls into.\n\nIt is conducted publicly and witnessed, which matters: the draw determines a substantial part of every player’s tournament, and a private draw would be an obvious integrity risk.',
    whyItMatters:
      'The transparency is the point. The randomness must be visibly random, because the alternative would leave every convenient bracket open to suspicion.',
    related: ['how-draws-work', 'tournament-draw', 'seed'],
    ...TOUR_RULES,
  }),

  format({
    slug: 'qualifying-draw',
    title: 'What Is a Qualifying Draw?',
    category: 'seeding-and-draws',
    alsoIn: ['tournaments'],
    order: 80,
    difficulty: 'intermediate',
    summary: 'A separate bracket played before the tournament, whose winners enter the main draw.',
    oneSentence:
      'The qualifying draw is a small knockout played in the days before the main draw, divided into sections that each produce one qualifier.',
    howItWorks:
      'The qualifying field is drawn into sections, each of two or three rounds. Winning your section means qualifying, so a player must win two or three matches to reach the main draw.\n\nQualifying draws are usually seeded themselves, by ranking among the qualifying entrants.\n\nPlayers who lose in the final round of qualifying are the pool from which lucky losers are drawn if a main-draw player withdraws.',
    example:
      'A 16-section qualifying draw of 48 players produces 16 qualifiers, each having won two matches, who fill the last 16 places in a 128-player main draw.',
    related: ['main-draw-vs-qualifying', 'qualifier', 'lucky-loser', 'how-draws-work'],
    ...TOUR_RULES,
  }),

  format({
    slug: 'top-players-meeting-early',
    title: 'Why Can Two Top Players Meet Before the Final?',
    category: 'seeding-and-draws',
    order: 90,
    difficulty: 'intermediate',
    summary: 'Because seeding protects rank, not quality, and a draw has only so many seeds.',
    oneSentence:
      'Two very good players can meet early because seeding is based on ranking, and a player can be excellent while ranked low, or ranked highly enough to be seeded but not highly enough to be kept apart.',
    howItWorks:
      'Three mechanisms produce an early meeting between two strong players.\n\n**Ranking is not quality.** A former champion returning from injury has a low ranking, so they are unseeded and can be drawn against anybody.\n\n**Seed number matters.** Seeds 1 and 2 cannot meet before the final. Seeds 15 and 18 can meet in the third round, because the guarantee weakens as the seed number rises.\n\n**Seed count is finite.** A tournament with 8 seeds protects far fewer players than one with 32, so the tenth-best player in a small draw is unseeded by construction.',
    diagram: SEEDED_DRAW,
    example:
      'A player ranked 60 who was in the top ten a year earlier is unseeded, and the draw treats them exactly like anybody else ranked 60.',
    whyItMatters:
      'It is why the reaction to a draw is often stronger than the reaction to the first week of results. A bad section is a real disadvantage that no amount of form can undo.',
    related: [
      'seed',
      'separating-top-seeds',
      'seeded-vs-unseeded',
      'protected-ranking',
      'ranking-vs-seeding',
    ],
    ...TOUR_RULES,
  }),
];

/* ────────────────────────────────────────────────────────────────────────────
 * Grand Slam concepts
 * ────────────────────────────────────────────────────────────────────────── */

const SLAMS: ExplainerSeed[] = [
  format({
    slug: 'why-grand-slams-matter',
    title: 'Why Grand Slams Matter',
    category: 'grand-slams',
    order: 10,
    difficulty: 'beginner',
    summary: 'Biggest fields, most rounds, most points, and the measure careers are judged by.',
    oneSentence:
      'The majors matter because they have the largest draws, the most ranking points and the longest format, and because the sport has agreed to measure careers by them.',
    howItWorks:
      '**Field.** Everybody enters. Unlike smaller events, a major has no meaningful absentees, so winning one means beating whoever the tour’s best players currently are.\n\n**Length.** Seven rounds, over a fortnight, with men’s singles played best-of-five. A single inspired afternoon is not enough.\n\n**Points.** The largest awards on either tour, so a major shapes a ranking more than any other event.\n\n**History.** The four have been the sport’s pinnacle for a century, and the count of majors won is the number by which players are compared across eras.',
    whyItMatters:
      'The last of those is the real answer, and it is a convention rather than a law. Tennis chose to measure greatness in majors, and because everybody accepts the measure, players plan whole seasons around four fortnights.',
    related: [
      'the-grand-slams',
      'grand-slam-vs-tour-event',
      'career-grand-slam',
      'slam-title-vs-tour-title',
      'why-all-four-majors-is-hard',
    ],
    sourceKeys: [{ key: 'wp-grand-slam' }],
  }),

  definition({
    slug: 'career-grand-slam',
    title: 'Career Grand Slam',
    category: 'grand-slams',
    order: 20,
    difficulty: 'intermediate',
    summary: 'Winning all four majors at some point in a career, in any order and any years.',
    oneSentence:
      'A career Grand Slam is winning each of the four majors at least once over the course of a career.',
    explanation:
      'The four titles need not be consecutive or in the same year. What is required is that each of the Australian Open, Roland-Garros, Wimbledon and the US Open has been won at least once.\n\nIt is rare, and the reason is surfaces: the four are played on hard, clay and grass, and the qualities that make a player dominant on one work against them on another.',
    whyItMatters:
      'It is the standard test of whether a player’s game travels. A career defined by one surface, however dominant, does not produce a career Grand Slam.',
    misunderstandings:
      '**"A career Grand Slam is the same as a Grand Slam."** It is not. A Grand Slam proper means all four in one calendar year, which is far rarer.',
    related: [
      'calendar-grand-slam',
      'career-golden-slam',
      'why-all-four-majors-is-hard',
      'the-grand-slams',
    ],
    sourceKeys: [{ key: 'wp-grand-slam' }],
  }),

  definition({
    slug: 'calendar-grand-slam',
    title: 'Calendar Grand Slam',
    category: 'grand-slams',
    order: 30,
    difficulty: 'intermediate',
    summary: 'Winning all four majors in the same calendar year: the rarest achievement in tennis.',
    oneSentence: 'A calendar Grand Slam is winning all four majors within a single calendar year.',
    explanation:
      'This is the "Grand Slam" in its strict, original sense. It requires winning on hard courts in January, clay in June, grass in July and hard courts again in September, without a single defeat in seven matches on any of the four occasions.\n\nIt has been achieved in singles only a handful of times in the sport’s history, by Don Budge, Rod Laver (twice), Maureen Connolly, Margaret Court and Steffi Graf.',
    whyItMatters:
      'Its rarity is the whole point. Twenty-eight matches must be won across three surfaces in nine months, and one bad afternoon in any of them ends it.',
    related: [
      'non-calendar-grand-slam',
      'career-grand-slam',
      'golden-slam',
      'why-all-four-majors-is-hard',
    ],
    sourceKeys: [{ key: 'wp-grand-slam' }],
  }),

  definition({
    slug: 'non-calendar-grand-slam',
    title: 'Non-Calendar Grand Slam',
    category: 'grand-slams',
    order: 40,
    difficulty: 'advanced',
    summary: 'Holding all four major titles at once, but across two calendar years.',
    oneSentence:
      'A non-calendar Grand Slam is holding all four major titles simultaneously, having won them consecutively across two calendar years.',
    explanation:
      'A player who wins Wimbledon and the US Open one year, then the Australian Open and Roland-Garros the next, holds all four titles at the same time without having won them in one calendar year.\n\nIt is sometimes called a "Serena Slam" or a "Nole Slam" after the players who achieved it, and it is recognised as a distinct feat rather than as a calendar Grand Slam.',
    whyItMatters:
      'The distinction is genuinely contested. Holding all four at once is an extraordinary achievement, and whether the calendar boundary should matter is one of tennis’s recurring arguments. The convention is that it does.',
    related: ['calendar-grand-slam', 'career-grand-slam', 'channel-slam', 'surface-slam'],
    sourceKeys: [{ key: 'wp-grand-slam' }],
  }),

  definition({
    slug: 'golden-slam',
    title: 'Golden Slam',
    category: 'grand-slams',
    order: 50,
    difficulty: 'intermediate',
    summary: 'All four majors plus Olympic gold in the same year.',
    oneSentence:
      'A Golden Slam is winning all four majors and the Olympic singles gold medal in the same calendar year.',
    explanation:
      'The term dates from 1988, when Steffi Graf won all four majors and the Olympic gold in Seoul, tennis having returned to the Olympic programme that year. It remains the only singles Golden Slam.\n\nBecause the Olympics are held every four years, the achievement is only possible in one year out of four, which is part of why it is so rare.',
    related: ['career-golden-slam', 'calendar-grand-slam', 'why-all-four-majors-is-hard'],
    sourceKeys: [{ key: 'wp-grand-slam' }],
  }),

  definition({
    slug: 'career-golden-slam',
    title: 'Career Golden Slam',
    category: 'grand-slams',
    order: 60,
    difficulty: 'intermediate',
    summary: 'All four majors and an Olympic gold, at any point in a career.',
    oneSentence:
      'A career Golden Slam is winning each of the four majors and an Olympic singles gold medal at some point during a career.',
    explanation:
      'The same relaxation the career Grand Slam applies to the majors, extended to include the Olympic title. The wins can come in any order across any years.\n\nBecause the Olympic tournament is held only every four years, and because it is a short event where an upset ends everything, this is a substantially harder achievement than a career Grand Slam.',
    related: ['golden-slam', 'career-grand-slam', 'calendar-grand-slam'],
    sourceKeys: [{ key: 'wp-grand-slam' }],
  }),

  definition({
    slug: 'surface-slam',
    title: 'Surface Slam',
    category: 'grand-slams',
    order: 70,
    difficulty: 'advanced',
    summary: 'Winning majors on all three surfaces in the same year.',
    oneSentence:
      'A Surface Slam is winning at least one major on each of the three surfaces, clay, grass and hard, within a single calendar year.',
    explanation:
      'A player who wins Roland-Garros, Wimbledon and one of the two hard-court majors in the same year has won on all three surfaces in a season without necessarily completing a calendar Grand Slam.\n\nIt is an informal term rather than an official honour, and it exists because the surface transition is the genuinely hard part of a Grand Slam year, so achieving it is worth naming even without the fourth title.',
    related: [
      'calendar-grand-slam',
      'channel-slam',
      'tennis-court-surfaces',
      'why-all-four-majors-is-hard',
    ],
    sourceKeys: [{ key: 'wp-grand-slam' }],
  }),

  definition({
    slug: 'channel-slam',
    title: 'Channel Slam',
    category: 'grand-slams',
    order: 80,
    difficulty: 'advanced',
    summary: 'Winning Roland-Garros and Wimbledon in the same year.',
    oneSentence:
      'A Channel Slam is winning the French Open and Wimbledon in the same year, the two majors separated by the English Channel and by the hardest surface transition in tennis.',
    explanation:
      'The two tournaments are only a few weeks apart and are played on the two most opposite surfaces in the sport: slow, high-bouncing clay and fast, low-bouncing grass. The techniques, footwork and tactics that win one work against the other.\n\nThe short gap between them makes it worse. A player who reaches the final in Paris has days rather than weeks to adapt.',
    whyItMatters:
      'It is the clearest single measure of a game that travels across surfaces, and it is rare enough that each instance is noted.',
    related: [
      'surface-slam',
      'clay-courts',
      'grass-courts',
      'why-grass-plays-differently',
      'why-all-four-majors-is-hard',
    ],
    sourceKeys: [{ key: 'wp-grand-slam' }],
  }),

  format({
    slug: 'slam-title-vs-tour-title',
    title: 'Grand Slam Title vs Tour Title',
    category: 'grand-slams',
    order: 90,
    difficulty: 'beginner',
    summary: 'Both are titles; only one is used to compare careers.',
    oneSentence:
      'A tour title is any tournament won, while a Grand Slam title is one of the four majors, and the sport weighs them very differently.',
    howItWorks:
      'A player’s record contains both numbers: total titles and major titles. A career can contain many of the first and none of the second.\n\nThe majors are weighted more heavily for reasons that are partly structural, the field, the format and the points, and partly conventional: the sport has agreed to keep score that way.',
    whyItMatters:
      'It explains an apparent paradox in career comparisons. A player with fifty tour titles and one major is generally ranked below a player with twenty titles and four majors, and the reason is the convention rather than the arithmetic.',
    related: [
      'why-grand-slams-matter',
      'grand-slam-vs-tour-event',
      'the-grand-slams',
      'career-grand-slam',
    ],
    sourceKeys: [{ key: 'wp-grand-slam' }],
  }),

  article({
    slug: 'why-all-four-majors-is-hard',
    title: 'Why Winning All Four Majors Is So Difficult',
    category: 'grand-slams',
    order: 100,
    difficulty: 'intermediate',
    summary: 'Three surfaces, four conditions and twenty-eight matches, in nine months.',
    oneSentence:
      'The four majors are played on three surfaces in four different climates, and the qualities that win one actively work against winning another.',
    explanation:
      'The obstacle is not that the majors are hard individually. It is that they are hard in incompatible ways.',
    howItWorks:
      '**Surface.** Clay is slow and high-bouncing, rewarding heavy topspin, defence and patience. Grass is fast and low, rewarding the serve, flat hitting and taking the ball early. Hard courts sit between, and even the two hard-court majors play differently from each other.\n\n**Timing.** Roland-Garros and Wimbledon are separated by a few weeks. A player who goes deep in Paris arrives on grass with almost no preparation, which is why the Channel Slam is rare in its own right.\n\n**Conditions.** Melbourne in January and New York in September present heat and humidity; Wimbledon presents changeable weather; the four are physically different events.\n\n**Volume.** Seven wins each, twenty-eight in total, with men’s singles best-of-five. Any single lapse across four fortnights ends it.',
    whyItMatters:
      'This is why the career Grand Slam, rather than a raw title count, is the standard test of a complete game, and why the players who have completed it are a much shorter list than the players with many majors.',
    related: [
      'career-grand-slam',
      'calendar-grand-slam',
      'channel-slam',
      'surface-dominance',
      'tennis-court-surfaces',
    ],
    sourceKeys: [{ key: 'wp-grand-slam' }],
  }),
];

/* ────────────────────────────────────────────────────────────────────────────
 * Doubles
 * ────────────────────────────────────────────────────────────────────────── */

const DOUBLES: ExplainerSeed[] = [
  rule({
    slug: 'how-doubles-works',
    title: 'How Doubles Tennis Works',
    category: 'doubles',
    isStartHere: true,
    order: 10,
    difficulty: 'beginner',
    summary: 'Two against two on a wider court, with fixed serving and receiving orders.',
    oneSentence:
      'Doubles is played by two pairs on the wider court, with each pair fixing a serving order and a receiving order at the start of every set.',
    howItWorks:
      '**The court.** The doubles alleys are in play for rally shots. The service boxes are unchanged, so a serve into the alley is still a fault.\n\n**Serving.** Each pair decides who serves first in each set. The serve then rotates through all four players: one pair’s server, the other pair’s server, the first pair’s partner, the second pair’s partner. That order holds for the whole set and may be changed at the start of the next.\n\n**Receiving.** Each pair also decides which partner receives in the deuce court and which in the ad court. That cannot change during a set.\n\n**Positioning.** The serving pair almost always starts with one player at the net. Points are short, and the first volley decides most of them.',
    example:
      'If A1 serves the first game, B1 serves the second, A2 the third and B2 the fourth, the pattern then repeats for the rest of the set.',
    whyItMatters:
      'The fixed orders are what make doubles tactical rather than chaotic. Because everybody knows who will serve and who will receive, a pair can plan patterns across a whole set.',
    ruleDifferences:
      'Most professional doubles uses **no-ad scoring**, where a single point decides the game at 40-40 and the receiving pair chooses the side. Deciding sets are often replaced by a **match tiebreak** to ten points. Both are competition rules, and they are why professional doubles finishes in a predictable time.',
    related: [
      'doubles-serving-order',
      'doubles-return-order',
      'doubles-positioning',
      'singles-vs-doubles',
      'doubles-tiebreak-rules',
    ],
    ...RULES,
  }),

  courtArea({
    slug: 'doubles-court',
    title: 'Doubles Court Explained',
    category: 'doubles',
    order: 20,
    difficulty: 'beginner',
    summary: 'The full 36-foot width, with the alleys live for everything except the serve.',
    oneSentence:
      'The doubles court is the full width of the marked rectangle, 36 feet across, with the alleys in play for rally shots but not for serves.',
    whereItIs:
      'The doubles court uses the outer sidelines, giving 36 feet of width against singles’ 27. The extra 4 feet 6 inches on each side is the alley.\n\nEverything else is identical: same baselines, same net, same service boxes. The service boxes are bounded by the **singles** sidelines, which is why the alleys are not a legal serve target in either format.',
    diagram: {
      court: 'doubles',
      caption:
        'The doubles court, with the alleys shaded. They are live for rallies and never for the serve.',
      steps: [
        {
          caption:
            'The extra width, and the standard starting positions: one player back, one at the net.',
          zones: [
            { x: 6, y: 6, width: 11, height: 88, label: 'Alley' },
            { x: 83, y: 6, width: 11, height: 88, label: 'Alley' },
          ],
          players: [
            { id: 'a1', label: 'S', side: 'near', x: 62, y: 3, hasBall: true, highlight: true },
            { id: 'a2', label: 'A2', side: 'near', x: 28, y: 38 },
            { id: 'b1', label: 'R', side: 'far', x: 74, y: 95 },
            { id: 'b2', label: 'B2', side: 'far', x: 30, y: 62 },
          ],
        },
      ],
    },
    whyItMatters:
      'The alleys create angles that do not exist in singles, and it is those angles rather than the extra area that make doubles a net game.',
    related: [
      'doubles-alleys',
      'singles-court-vs-doubles-court',
      'doubles-positioning',
      'where-a-serve-must-land',
    ],
    ...RULES,
  }),

  rule({
    slug: 'doubles-serving-order',
    title: 'Doubles Serving Order',
    category: 'doubles',
    order: 30,
    difficulty: 'intermediate',
    summary: 'Four players, one rotation, fixed for the set.',
    oneSentence:
      'Each pair decides which partner serves first at the start of a set, and the four players then serve in that rotation for the whole set.',
    howItWorks:
      'Before each set, each pair nominates who will serve first among them. The rotation is then: pair A’s first server, pair B’s first server, pair A’s other player, pair B’s other player, and repeat.\n\nThe order may be changed at the start of the next set, but not within a set. A pair that serves out of order and is discovered corrects the order immediately, with points already played standing.\n\nIn a **tiebreak**, the rotation continues in the same order, following the standard one-point-then-two-points pattern with each of the four players serving their turn.',
    example:
      'A pair whose stronger server has been serving first may switch the order at the start of the next set so that their stronger server takes the more pressured games in the new rotation.',
    whyItMatters:
      'The order determines who serves at 4-5 and 5-6, which is where sets are decided, and choosing it is a real tactical decision rather than a formality.',
    ruleDifferences:
      'Under no-ad scoring, service games are shorter and the order matters slightly less, because a game cannot extend indefinitely through deuce.',
    related: [
      'how-doubles-works',
      'doubles-return-order',
      'doubles-tiebreak-rules',
      'serving-order',
    ],
    ...RULES,
  }),

  rule({
    slug: 'doubles-return-order',
    title: 'Doubles Return Order',
    category: 'doubles',
    order: 40,
    difficulty: 'intermediate',
    summary:
      'One partner takes the deuce court, the other the ad court, and it cannot change mid-set.',
    oneSentence:
      'Each pair fixes which partner receives in the deuce court and which in the ad court, and that arrangement holds for the entire set.',
    howItWorks:
      'At the start of the first service game they receive in a set, a pair decides who takes which side. That partner then receives every point played from that side for the rest of the set.\n\nThe arrangement may be changed at the start of the next set. It may not be changed within a set, even between games.\n\nIf a pair receives out of order, the error is corrected at the end of the game in which it was discovered, and the points already played stand.',
    whyItMatters:
      'The sides are not equivalent. A left-hander and a right-hander are often arranged so both forehands cover the middle, and a pair will usually put their better returner on the ad side, where break points and deuce points are played.',
    related: [
      'doubles-serving-order',
      'how-doubles-works',
      'ad-court-and-deuce-court',
      'doubles-positioning',
    ],
    ...RULES,
  }),

  tactic({
    slug: 'doubles-positioning',
    title: 'Doubles Positioning',
    category: 'doubles',
    order: 50,
    difficulty: 'intermediate',
    summary: 'The two shapes a pair takes, and why the second is the goal.',
    oneSentence:
      'A doubles pair is either split, with one at the net and one at the back, or level at the net, and the whole point is to get to level at the net.',
    howItWorks:
      '**One up, one back** is the starting shape. The server stands at the baseline and their partner at the net; the receiving pair mirrors it, with the returner back and their partner at the net.\n\n**Both at the net** is the attacking shape. Once a pair gets there, they cover the width and cut off angles, and the opponents have to hit past two volleyers or lob over both.\n\n**Both back** is the defensive shape, adopted when the opponents are at the net and the pair is under pressure.\n\nThe pair also moves as a unit. When one player moves to cover a wide ball, the other shifts with them, because two players moving independently open the middle, which is where doubles points are lost.',
    diagram: {
      court: 'doubles',
      caption: 'The three doubles shapes.',
      steps: [
        {
          caption: 'One up, one back: the standard serving formation.',
          players: [
            { id: 'a1', label: 'S', side: 'near', x: 62, y: 3, hasBall: true },
            { id: 'a2', label: 'A2', side: 'near', x: 28, y: 38 },
          ],
        },
        {
          caption:
            'Both at the net: the attacking shape, covering the width just inside the service line.',
          players: [
            { id: 'a1', label: 'A1', side: 'near', x: 65, y: 36, highlight: true },
            { id: 'a2', label: 'A2', side: 'near', x: 32, y: 36, highlight: true },
          ],
        },
        {
          caption:
            'Both back: defending against a pair at the net, usually after a lob or a weak reply.',
          players: [
            { id: 'a1', label: 'A1', side: 'near', x: 65, y: 6 },
            { id: 'a2', label: 'A2', side: 'near', x: 32, y: 6 },
          ],
        },
      ],
    },
    whyItMatters:
      'Almost every doubles point is a contest over which pair gets to the net first. That is what the serve, the return and the first volley are all for.',
    related: [
      'net-play-in-doubles',
      'poaching',
      'australian-formation',
      'i-formation',
      'doubles-court',
    ],
    ...RULES,
  }),

  tactic({
    slug: 'net-play-in-doubles',
    title: 'Why Net Play Is Important in Doubles',
    category: 'doubles',
    order: 60,
    difficulty: 'intermediate',
    summary: 'Because two players at the net cover angles that two at the baseline cannot.',
    oneSentence:
      'A pair at the net cuts off the angles and takes time away, which is why getting there first decides most doubles points.',
    howItWorks:
      'Two players standing at the net cover the width of the court at the point where the ball has travelled least far, so the opponents’ available angles are at their narrowest.\n\nFrom the baseline, the same two players cover the same width at the point where the angles are widest, which is much harder.\n\nThe consequence is that the pair at the net wins the majority of points where they get there properly, and the pair stuck at the baseline is reduced to passing shots and lobs.',
    whyItMatters:
      'This is why doubles looks so different from singles even though the rules are almost identical. The tactical answer to a wider court is not to run more, it is to stand closer.',
    related: ['doubles-positioning', 'poaching', 'volley', 'net-points-won', 'lob'],
  }),

  tactic({
    slug: 'poaching',
    title: 'What Is Poaching?',
    category: 'doubles',
    alsoIn: ['glossary'],
    order: 70,
    difficulty: 'intermediate',
    summary: 'The net player crossing to intercept a ball intended for their partner.',
    oneSentence:
      'Poaching is when the net player moves across the court to volley a ball that would otherwise have gone to their partner.',
    howItWorks:
      'The server’s partner stands at the net. As the return crosses, they move diagonally forwards and across to intercept it, volleying into the open court.\n\nTiming is everything: moving too early lets the returner change direction down the line into the space just vacated, and moving too late means arriving after the ball.\n\nPairs often signal poaches behind the back before the serve, so the server knows to cover the side their partner is leaving.',
    whenUsed:
      'Against a returner who is hitting the same crosscourt return repeatedly, and as a deliberate percentage play on important points.',
    whyItMatters:
      'The threat matters as much as the act. A returner who has been poached once starts looking at the net player, which is enough to degrade their return even on points where nobody moves.',
    risks:
      'A poach that misses leaves the whole court open, and a returner who reads it and goes down the line wins the point outright.',
    related: [
      'doubles-positioning',
      'i-formation',
      'australian-formation',
      'net-play-in-doubles',
      'volley',
    ],
  }),

  tactic({
    slug: 'australian-formation',
    title: 'Australian Formation',
    category: 'doubles',
    order: 80,
    difficulty: 'advanced',
    summary:
      'The net player stands on the same side as the server, taking away the crosscourt return.',
    oneSentence:
      'In the Australian formation, the serving pair both stand on the same side of the centre line, so the returner’s usual crosscourt reply is covered before it is hit.',
    howItWorks:
      'Normally the server’s partner stands on the opposite side of the court, leaving the crosscourt return open. In the Australian formation they stand on the **same** side as the server.\n\nThat takes away the crosscourt return, which is the returner’s highest-percentage shot, and forces them to go down the line instead: a shorter court over a higher part of the net.\n\nThe server covers the vacated side by moving across immediately after serving.',
    whenUsed:
      'Against a returner with a dominant crosscourt return, most often to take away a strong forehand return in the deuce court or a strong backhand return in the ad court.',
    diagram: {
      court: 'doubles',
      caption: 'Australian formation: both serving players on the same side of the centre line.',
      steps: [
        {
          caption:
            'The server’s partner stands on the same side as the server, closing the crosscourt return and forcing the reply down the line.',
          players: [
            { id: 'a1', label: 'S', side: 'near', x: 58, y: 3, hasBall: true, highlight: true },
            { id: 'a2', label: 'A2', side: 'near', x: 62, y: 38, highlight: true },
            { id: 'b1', label: 'R', side: 'far', x: 74, y: 95 },
          ],
          arrows: [
            { kind: 'serve', fromX: 58, fromY: 5, toX: 34, toY: 64 },
            { kind: 'move', fromX: 58, fromY: 6, toX: 30, toY: 14, label: 'server covers' },
          ],
        },
      ],
    },
    risks:
      'The server has a long way to run to cover the open side, so a returner who can hit down the line consistently will punish it.',
    related: ['i-formation', 'poaching', 'doubles-positioning', 'return-of-serve'],
  }),

  tactic({
    slug: 'i-formation',
    title: 'I-Formation',
    category: 'doubles',
    order: 90,
    difficulty: 'advanced',
    summary:
      'The net player crouches on the centre line, and the returner cannot tell which way they will go.',
    oneSentence:
      'In the I-formation, the server’s partner crouches astride the centre service line before the serve and moves to one side only as the ball is struck.',
    howItWorks:
      'The net player crouches low on the centre line, low enough not to obstruct the server’s view of the box. The two of them agree beforehand which way the net player will move, usually by a hand signal behind the back.\n\nAs the serve is struck, the net player moves to one side and the server covers the other. The returner has to commit to a direction without knowing which side will be covered.',
    whenUsed:
      'Against a returner who is dictating from the return, and on important points where disruption is worth more than the risk.',
    diagram: {
      court: 'doubles',
      caption:
        'I-formation: the net player starts on the centre line and moves as the serve is struck.',
      steps: [
        {
          caption: 'Before the serve: the net player crouches astride the centre service line.',
          players: [
            { id: 'a1', label: 'S', side: 'near', x: 54, y: 3, hasBall: true },
            { id: 'a2', label: 'A2', side: 'near', x: 50, y: 42, highlight: true },
            { id: 'b1', label: 'R', side: 'far', x: 74, y: 95 },
          ],
        },
        {
          caption:
            'As the ball is struck: the net player commits to one side and the server covers the other.',
          players: [
            { id: 'a1', label: 'S', side: 'near', x: 54, y: 3 },
            { id: 'a2', label: 'A2', side: 'near', x: 32, y: 38, highlight: true },
            { id: 'b1', label: 'R', side: 'far', x: 74, y: 95 },
          ],
          arrows: [
            { kind: 'move', fromX: 50, fromY: 42, toX: 32, toY: 38 },
            { kind: 'move', fromX: 54, fromY: 5, toX: 70, toY: 12, label: 'server covers' },
          ],
        },
      ],
    },
    risks:
      'It requires the server to move immediately and reliably, and a mistimed movement leaves both players on the same side of a wide court.',
    related: ['australian-formation', 'poaching', 'doubles-positioning', 'net-play-in-doubles'],
  }),

  rule({
    slug: 'doubles-tiebreak-rules',
    title: 'Doubles Tiebreak Rules',
    category: 'doubles',
    order: 100,
    difficulty: 'intermediate',
    summary: 'The same rotation as singles, with four servers instead of two.',
    oneSentence:
      'A doubles tiebreak follows the normal one-point-then-two-points pattern, with the service passing through all four players in the set’s established order.',
    howItWorks:
      'The player due to serve serves the first point. Service then passes and each player serves two points, following the pair’s established rotation for the set.\n\nEnds change every six points, exactly as in singles.\n\nEach pair keeps their established receiving sides throughout the tiebreak.\n\nA **match tiebreak** to ten points, used in place of a deciding set in most professional doubles, follows the same rotation with the higher target.',
    ruleDifferences:
      'Which competitions replace the deciding set with a match tiebreak, and whether no-ad scoring applies, is set by each event. Most professional doubles uses both; recreational and some team formats do not.',
    related: [
      'how-a-tiebreak-works',
      'match-tiebreak',
      'doubles-serving-order',
      'how-doubles-works',
    ],
    ...RULES,
  }),

  format({
    slug: 'mixed-doubles',
    title: 'Mixed Doubles Explained',
    category: 'doubles',
    order: 110,
    difficulty: 'beginner',
    summary: 'Doubles played by pairs of one man and one woman.',
    oneSentence:
      'Mixed doubles is doubles played by teams of one man and one woman, contested at the Grand Slams and at the Olympics.',
    howItWorks:
      'The rules are the rules of doubles. What differs is the composition of the pair and, in practice, the tactics: the serving and returning matchups vary within a game in a way they do not in same-sex doubles, and pairs plan around which opponent is serving.\n\nIt is contested at all four majors and at the Olympic Games, and generally not at regular tour events, so it is one of the few competitions that exists almost exclusively at the sport’s biggest tournaments.',
    ruleDifferences:
      'Mixed doubles at the majors has used shortened formats, including match tiebreaks in place of a deciding set, and the format and even the structure of the event have been changed by individual majors in recent years. It is worth checking the specific tournament rather than assuming.',
    related: ['how-doubles-works', 'doubles-positioning', 'the-grand-slams', 'match-tiebreak'],
    ...TOUR_RULES,
  }),
];

/* ────────────────────────────────────────────────────────────────────────────
 * Officiating & technology
 * ────────────────────────────────────────────────────────────────────────── */

const OFFICIATING: ExplainerSeed[] = [
  officiating({
    slug: 'who-officiates-a-match',
    title: 'Who Officiates a Tennis Match?',
    category: 'officiating',
    isStartHere: true,
    order: 10,
    difficulty: 'beginner',
    summary:
      'A chair umpire, sometimes line judges, sometimes a machine, and a referee above them all.',
    oneSentence:
      'A tennis match is run by a chair umpire, assisted by line judges or by electronic line calling, with a tournament referee holding authority over everything the umpire cannot decide alone.',
    howItWorks:
      '**The chair umpire** runs the match: calls the score, enforces the rules and the code of conduct, and rules on anything a line official does not.\n\n**Line judges**, where used, call the lines only. Their calls can be overruled by the chair umpire.\n\n**Electronic line calling**, where used, replaces line judges entirely and makes the calls automatically.\n\n**The tournament referee** is not on court. They rule on suspensions of play, defaults and anything that goes beyond a single match.\n\n**Ball kids** are not officials but are part of the match’s operation, and their positioning is defined.',
    whyItMatters:
      'Knowing who decides what explains why a chair umpire will sometimes say they cannot rule on something: a default, for example, is the referee’s decision on the umpire’s recommendation, not the umpire’s alone.',
    ruleDifferences:
      'Whether a match has line judges at all now depends on the tournament. Full electronic line calling has been adopted across large parts of the professional calendar, and the mix differs by event and by court within an event.',
    related: [
      'chair-umpire',
      'line-judges',
      'electronic-line-calling',
      'when-a-player-is-defaulted',
    ],
    ...TOUR_RULES,
  }),

  officiating({
    slug: 'chair-umpire',
    title: 'Chair Umpire Explained',
    category: 'officiating',
    order: 20,
    difficulty: 'beginner',
    summary: 'The official in the chair who runs the match and has final say on court.',
    oneSentence:
      'The chair umpire is the official who runs the match: they call the score, enforce the rules, and are the final authority on court for everything except a default.',
    howItWorks:
      'They announce the score after every point and every game, time the intervals, enforce the serve clock, and rule on any question of fact or law that arises.\n\nWhere line judges are used, the chair umpire may **overrule** a call if they are certain it was wrong, and this must be done promptly.\n\nThey issue code violations under the point penalty system, and they may recommend a default to the referee, though they do not impose one alone.\n\nOn clay, they may climb down to inspect a ball mark, which is the traditional method of settling a line call on that surface.',
    whyItMatters:
      'The chair umpire has more discretion than officials in most sports, because tennis has no video review of anything but the lines. Judging whether a hindrance occurred, whether a medical timeout is warranted or whether an outburst crosses a line is a human call.',
    ruleDifferences:
      'The point penalty system and the code of conduct differ between the ATP, the WTA and the Grand Slam Rule Book, so what a chair umpire can issue and when is a property of the competition.',
    related: [
      'who-officiates-a-match',
      'code-violations',
      'point-penalty-system',
      'time-violations',
      'line-judges',
    ],
    ...TOUR_RULES,
  }),

  officiating({
    slug: 'line-judges',
    title: 'Line Judges Explained',
    category: 'officiating',
    order: 30,
    difficulty: 'beginner',
    summary: 'Officials who call one line each, and who are being replaced by cameras.',
    oneSentence:
      'Line judges are officials positioned around the court, each responsible for calling whether the ball lands in or out on a specific line.',
    howItWorks:
      'A full complement of line judges covers each line from a position aligned with it, which is essential: judging a line from an angle is unreliable, which is why they sit where they do.\n\nThey call "out" audibly and with a hand signal. A ball not called is in.\n\nThe chair umpire may overrule a line judge’s call. Where a challenge system operates, a player may also ask for an electronic review.',
    whyItMatters:
      'Line judging is the part of officiating most completely changed by technology. Full electronic line calling has removed line judges from a large and growing share of professional tennis, which is one of the most visible changes to how the sport looks in decades.',
    ruleDifferences:
      'Whether a tournament uses line judges, electronic line calling, or a mix on different courts is a decision of each event.',
    related: [
      'electronic-line-calling',
      'hawk-eye',
      'player-challenges',
      'who-officiates-a-match',
      'ball-on-the-line',
    ],
    ...TOUR_RULES,
  }),

  officiating({
    slug: 'electronic-line-calling',
    title: 'Electronic Line Calling Explained',
    category: 'officiating',
    order: 40,
    difficulty: 'intermediate',
    summary: 'Cameras calling the lines automatically, with no line judges and no challenges.',
    oneSentence:
      'Electronic line calling uses camera systems to track the ball and call every line automatically, replacing line judges entirely where it is deployed.',
    howItWorks:
      'Multiple synchronised cameras track the ball’s flight and compute where it landed, producing a call within a fraction of a second. The call is announced by an automated voice, so there is no human line call to challenge.\n\nBecause the system calls everything, the challenge system becomes unnecessary and is removed at events using it in full.\n\nThe chair umpire still runs the match and rules on everything else. What has been removed is one specific job: judging where the ball landed.',
    whyItMatters:
      'It has changed how matches feel as much as how they are officiated. The challenge, with its crowd anticipation and its replay on the big screen, has disappeared from events using full automation, and so has the argument with the umpire about a line call.',
    ruleDifferences:
      'Deployment varies by tournament and by surface. Adoption has been extensive across the professional calendar but is not universal, and clay has historically been the surface where the ball mark was treated as sufficient evidence.',
    misunderstandings:
      '**"The system is exact."** It is a measurement, with a stated margin of error, presented as a definitive call. That is a deliberate design choice: a system that reported uncertainty on close calls would not settle anything.',
    related: [
      'hawk-eye',
      'line-judges',
      'player-challenges',
      'ball-on-the-line',
      'when-is-a-ball-out',
    ],
    ...TOUR_RULES,
  }),

  officiating({
    slug: 'hawk-eye',
    title: 'Hawk-Eye Explained',
    category: 'officiating',
    order: 50,
    difficulty: 'intermediate',
    summary: 'The camera tracking system behind line calls and the on-screen ball graphic.',
    oneSentence:
      'Hawk-Eye is a multi-camera ball-tracking system used to review or make line calls and to generate the familiar graphic of the ball’s bounce.',
    howItWorks:
      'Several high-speed cameras positioned around the court track the ball. Software reconstructs its trajectory and calculates the shape of the contact patch where it touched the ground, which is the ellipse shown on the graphic.\n\nThe contact patch is wider than the ball, because a ball flattens on impact, which is why a ball that looked out can be shown clipping the line.\n\nThe same tracking data drives much of the analytical statistics now published about matches: serve speed and placement, rally length, and court position.',
    whyItMatters:
      'Hawk-Eye is the origin of most of tennis’s modern data. The line calling was the visible application; the by-product was a positional record of every ball hit in a tracked match, which is what makes serve-direction and rally-length analysis possible at all.',
    misunderstandings:
      '**"The graphic is a photograph."** It is a reconstruction from tracking data, not an image of the bounce.',
    related: [
      'electronic-line-calling',
      'player-challenges',
      'serve-direction-analysis',
      'court-position-data',
      'ball-on-the-line',
    ],
    ...TOUR_RULES,
  }),

  officiating({
    slug: 'player-challenges',
    title: 'Player Challenges Explained',
    category: 'officiating',
    order: 60,
    difficulty: 'intermediate',
    summary: 'Asking for an electronic review of a line call, where the system still allows it.',
    oneSentence:
      'A challenge is a player’s request for an electronic review of a line call, permitted a limited number of times per set at tournaments that still use human line calling.',
    howItWorks:
      'A player who disagrees with a line call may challenge it immediately, before the next point begins. The tracking system’s reconstruction is shown, and the call stands or is reversed.\n\nA player is allowed a set number of unsuccessful challenges per set, with the allowance typically topped up in a tiebreak. A successful challenge does not count against the allowance.\n\nAt tournaments using full electronic line calling, challenges do not exist: there is no human call to dispute.',
    whyItMatters:
      'The challenge system was a genuine tactical element for over a decade, with players managing their remaining challenges like a resource. Its disappearance at automated events is a real change to how matches are played, not only to how they are officiated.',
    ruleDifferences:
      'The number of challenges, the tiebreak allowance and whether challenges exist at all depend on the tournament and its line-calling setup.',
    related: ['electronic-line-calling', 'hawk-eye', 'line-judges', 'ball-on-the-line'],
    ...TOUR_RULES,
  }),

  officiating({
    slug: 'code-violations',
    title: 'Code Violations',
    category: 'officiating',
    order: 70,
    difficulty: 'intermediate',
    summary: 'Offences under the code of conduct, punished on an escalating scale.',
    oneSentence:
      'A code violation is a breach of the code of conduct, and repeated violations in a match are punished progressively under the point penalty system.',
    howItWorks:
      'The code covers conduct rather than play: audible and visible obscenity, abuse of the racket or the ball, verbal or physical abuse of anybody, unsportsmanlike conduct, coaching where it is prohibited, and unreasonable delay.\n\nViolations are cumulative within a match. The first is generally a warning, the second costs a point, and subsequent ones cost a game, with a default available for serious cases.\n\nFines may be imposed separately by the tournament or the tour, independently of the on-court penalty.',
    whyItMatters:
      'The escalation is why a trivial-looking second offence can cost a point at a critical moment: the penalty reflects the count, not the severity of the individual act.',
    ruleDifferences:
      'The code is written separately by the ATP, the WTA and the Grand Slam Board. The offences are broadly similar and the specific penalties, thresholds and fine schedules are not identical, so what happens after a given incident depends on the competition.',
    related: [
      'point-penalty-system',
      'time-violations',
      'racket-and-ball-abuse',
      'when-a-player-is-defaulted',
      'coaching-rules',
    ],
    ...TOUR_RULES,
  }),

  officiating({
    slug: 'time-violations',
    title: 'Time Violations',
    category: 'officiating',
    order: 80,
    difficulty: 'intermediate',
    summary: 'Taking too long between points, enforced by a visible serve clock.',
    oneSentence:
      'A time violation is called when a player takes longer than the allowed time between points, measured by a serve clock visible to players and spectators.',
    howItWorks:
      'A clock counts down the time allowed between points, starting when the previous point ends. The server must begin their motion before it expires.\n\nA first offence is generally a warning. Subsequent offences cost the server a first serve, or cost the receiver a point, depending on which competition’s rules apply and who committed the violation.\n\nThe clock is also used to time the warm-up, the changeover and the set break.',
    whyItMatters:
      'The serve clock was introduced to address the slow drift in between-point time, and it changed the rhythm of professional tennis visibly. It also removed most of the argument, because the clock is public and both players can see it.',
    ruleDifferences:
      'The exact time allowed, when the clock starts and what the penalty is for a repeat offence are set separately by each tour and by the Grand Slam Rule Book, and have been adjusted since the clock’s introduction.',
    related: ['code-violations', 'point-penalty-system', 'chair-umpire', 'bathroom-break-rules'],
    ...TOUR_RULES,
  }),

  officiating({
    slug: 'coaching-rules',
    title: 'Coaching Rules',
    category: 'officiating',
    order: 90,
    difficulty: 'intermediate',
    summary: 'The most-changed rule in tennis, and the one that differs most between competitions.',
    oneSentence:
      'Coaching during a match was traditionally prohibited outright, and the tours have since moved towards permitting limited coaching from a designated seat, with the rules differing by competition.',
    howItWorks:
      'Historically, any coaching during a match was a code violation, on the principle that tennis is a contest between two individuals solving problems alone.\n\nThat principle has been substantially relaxed. The tours have introduced limited off-court coaching, generally permitting brief communication from a designated coaching seat under defined conditions, initially as a trial and subsequently more widely.\n\nSeparately, the WTA operated on-court coaching at some events for a number of years, where a coach came onto court during a changeover.',
    whyItMatters:
      'This is the rule where "check the specific competition" matters most. Coaching has been prohibited, trialled, permitted in one form, permitted in another and applied differently at the majors and on the two tours, all within a fairly short period.',
    ruleDifferences:
      'What is permitted depends on the competition and on the current season’s rules, and the majors do not necessarily follow the tours. Any general statement about whether coaching is allowed in tennis is likely to be wrong somewhere, which is why this explainer describes the direction of travel rather than a fixed rule.',
    related: ['code-violations', 'adapting-during-a-match', 'chair-umpire', 'medical-timeouts'],
    ...TOUR_RULES,
  }),

  officiating({
    slug: 'medical-timeouts',
    title: 'Medical Timeouts',
    category: 'officiating',
    order: 100,
    difficulty: 'intermediate',
    summary: 'A limited stoppage for treatment of a genuine medical condition.',
    oneSentence:
      'A medical timeout is a stoppage of defined length during which a player receives treatment for a medical condition, granted at the discretion of the officials after evaluation.',
    howItWorks:
      'A player requests the trainer, who evaluates the condition, usually at the next changeover. If a treatable medical condition is identified, a medical timeout of a fixed length is granted.\n\nThe number of timeouts is limited, generally to one per treatable condition, and treatment for some conditions is permitted only at changeovers rather than as a separate stoppage.\n\nConditions that are not treatable, and general fatigue or loss of physical condition, do not qualify.',
    whyItMatters:
      'The medical timeout is the most disputed stoppage in tennis, because a legitimate one and a tactical one look identical from the stands. The evaluation requirement exists precisely to make that judgment somebody’s job rather than a matter of opinion.',
    ruleDifferences:
      'The length of a timeout, how many are allowed and what counts as a treatable condition are defined by each competition’s rulebook, and heat rules add further provisions at some events.',
    related: [
      'bathroom-break-rules',
      'retirement',
      'heat-in-tennis',
      'chair-umpire',
      'code-violations',
    ],
    ...TOUR_RULES,
  }),

  officiating({
    slug: 'bathroom-break-rules',
    title: 'Bathroom Break Rules',
    category: 'officiating',
    order: 110,
    difficulty: 'intermediate',
    summary: 'A limited, timed break, tightened after years of tactical use.',
    oneSentence:
      'Players are permitted a limited number of toilet breaks per match, taken at defined moments and subject to a time limit.',
    howItWorks:
      'A player may take a break at a set break, and the number permitted in a match is limited. The break is timed, and exceeding the time is a code violation.\n\nRules on where a break may be taken, whether a change of attire is included, and how long is allowed have been progressively tightened, because extended breaks at momentum-shifting moments became a recognised tactic.',
    whyItMatters:
      'It is a small rule that has had a disproportionate effect on matches, and the tightening of it is a clear example of tennis legislating against a tactic rather than against an offence.',
    ruleDifferences:
      'The number of breaks, their permitted timing and the time limit differ between the ATP, the WTA and the Grand Slam Rule Book, and have been revised more than once.',
    related: ['time-violations', 'code-violations', 'medical-timeouts', 'chair-umpire'],
    ...TOUR_RULES,
  }),

  officiating({
    slug: 'racket-and-ball-abuse',
    title: 'Ball Abuse and Racket Abuse Penalties',
    category: 'officiating',
    order: 120,
    difficulty: 'intermediate',
    summary: 'Hitting a ball or a racket in anger, and why one of them can end a match instantly.',
    oneSentence:
      'Racket abuse and ball abuse are code violations, and a ball or racket struck dangerously can lead to immediate default regardless of intent.',
    howItWorks:
      '**Racket abuse** is violently or intentionally damaging a racket, or hitting the court, the net or equipment with it. It draws a code violation under the point penalty system.\n\n**Ball abuse** is hitting a ball dangerously or recklessly out of the court, or with disregard for the consequences.\n\nThe crucial point is that a ball struck in frustration which hits an official or a spectator can be treated as a serious offence warranting immediate default, and **intent is not the test**. Recklessness is enough.',
    whyItMatters:
      'The most famous defaults in tennis history have followed exactly this sequence: a ball hit in frustration, without any intention of hitting anybody, that hit somebody. The rule treats the risk taken rather than the outcome intended, and understanding that explains a class of decision that otherwise looks disproportionate.',
    ruleDifferences:
      'Fine schedules and the precise wording differ by rulebook, but every professional competition treats a dangerously struck ball as potentially defaultable.',
    related: ['code-violations', 'point-penalty-system', 'when-a-player-is-defaulted', 'default'],
    ...TOUR_RULES,
  }),

  officiating({
    slug: 'point-penalty-system',
    title: 'Point Penalty System',
    category: 'officiating',
    order: 130,
    difficulty: 'intermediate',
    summary: 'Warning, point, game: the escalating scale for repeated code violations.',
    oneSentence:
      'The point penalty system escalates the punishment for code violations within a match: a warning first, then a point, then a game, with default available beyond that.',
    howItWorks:
      '**First violation:** a warning.\n\n**Second violation:** a point penalty. The opponent is awarded the point, which at 30-40 can mean the game.\n\n**Third and subsequent violations:** a game penalty.\n\n**Serious cases:** a default, which is decided by the referee on the chair umpire’s recommendation.\n\nThe count runs for the whole match, so a warning in the first set makes a second offence in the third set cost a point.',
    example:
      'A player warned for an audible obscenity in the first set, then penalised for racket abuse in the third, loses a point at whatever score the second offence occurs at, which may be a break point.',
    whyItMatters:
      'The escalation is what makes an early warning consequential. Players and umpires both know that the first violation changes the price of the second.',
    ruleDifferences:
      'The Grand Slam Rule Book and the two tours each define their own version, and there are differences in whether certain offences skip a step and in how time violations are folded in.',
    related: [
      'code-violations',
      'when-a-player-is-defaulted',
      'racket-and-ball-abuse',
      'chair-umpire',
      'time-violations',
    ],
    ...TOUR_RULES,
  }),

  officiating({
    slug: 'when-a-player-is-defaulted',
    title: 'When Can a Player Be Defaulted?',
    category: 'officiating',
    order: 140,
    difficulty: 'intermediate',
    summary: 'After accumulating violations, or immediately for a single serious act.',
    oneSentence:
      'A player can be defaulted after accumulating code violations under the point penalty system, or immediately for a single act serious enough to warrant it.',
    howItWorks:
      '**By accumulation:** each successive violation escalates the penalty, and a further violation after a game penalty can result in default.\n\n**Immediately:** a single act may warrant default without going through the scale. Striking a ball or a racket dangerously, physical abuse, and serious verbal abuse are the categories that most often produce this outcome.\n\nThe decision rests with the **tournament referee**, acting on the chair umpire’s recommendation, not with the umpire alone.\n\nA defaulted player typically forfeits ranking points and prize money from the tournament, in addition to any fine.',
    whyItMatters:
      'The immediate route is what people find surprising. A player can be defaulted with no prior warnings, from a single moment of carelessness, and the fact that no harm was intended is not a defence.',
    ruleDifferences:
      'The offences that permit immediate default, and the forfeiture of points and money that follows, are defined by each competition’s rulebook.',
    related: [
      'default',
      'point-penalty-system',
      'racket-and-ball-abuse',
      'code-violations',
      'who-officiates-a-match',
    ],
    ...TOUR_RULES,
  }),
];

export const TENNIS_COMPETITION: ExplainerSeed[] = [
  ...TOURNAMENTS,
  ...RANKINGS,
  ...SEEDING,
  ...SLAMS,
  ...DOUBLES,
  ...OFFICIATING,
];
