import type { ExplainerSeed } from './explainer-types';
import {
  article,
  definition,
  equipment,
  format,
  rankingConcept,
  statistic,
  surface,
} from './tennis-explainer-helpers';
import { TENNIS_REVIEWED, TENNIS_RULE_REVISION } from './tennis-explainers';

/**
 * Statistics, advanced metrics, surfaces, equipment, conditions, careers and
 * the remaining glossary terms.
 *
 * ## Official statistics and derived metrics
 *
 * The brief asks for these to be clearly distinguished, and the distinction is
 * real rather than pedantic. Three tiers appear in this file:
 *
 * **Counted at the match.** Aces, double faults, first-serve percentage, break
 * points. These are recorded by the tournament's own scoring operation and
 * published on the official stat sheet.
 *
 * **Judged at the match.** Winners and unforced errors. These are recorded the
 * same way but are judgment calls, so two scorers watching the same match
 * produce different numbers. Any analysis built on them inherits that.
 *
 * **Derived afterwards.** Elo, hold and break percentages over a career,
 * dominance ratio, surface adjustments. Nobody publishes these as official
 * figures; they are computed by analysts from match results or from tracking
 * data, and different people compute them differently.
 *
 * Every statistic explainer here says which tier it belongs to, because a
 * reader who quotes a derived metric as though it were an official one is
 * making a category error the page should have prevented.
 *
 * ## On numbers
 *
 * Benchmark figures are given as broad ranges and described as typical rather
 * than as fixed thresholds. Serving and returning norms differ between the two
 * tours, between surfaces and between eras, and a single number quoted as "good"
 * would be wrong in most of those contexts.
 */

const RULES = {
  ruleSensitive: true,
  sourceRevision: TENNIS_RULE_REVISION,
  lastReviewedAt: TENNIS_REVIEWED,
  sourceKeys: [{ key: 'itf-rules' }],
};

/* ────────────────────────────────────────────────────────────────────────────
 * Match statistics
 * ────────────────────────────────────────────────────────────────────────── */

const STATISTICS: ExplainerSeed[] = [
  statistic({
    slug: 'tennis-statistics',
    title: 'Tennis Statistics Explained',
    category: 'statistics',
    isStartHere: true,
    isFeatured: true,
    order: 10,
    difficulty: 'beginner',
    readMinutes: 6,
    summary: 'What is on a tennis stat sheet, which numbers are counted and which are judged.',
    oneSentence:
      'A tennis stat sheet reports serving, returning and rally numbers for both players, some of which are objectively counted and some of which are somebody’s opinion.',
    measures:
      'The standard sheet has three blocks.\n\n**Serve:** aces, double faults, first-serve percentage, first-serve points won, second-serve points won, service games won, break points saved.\n\n**Return:** first- and second-serve return points won, break points converted, return games won.\n\n**Points:** winners, unforced errors, net points won, total points won.\n\nMost of these are simple counts. Two are not: **winners** and **unforced errors** are judgment calls made by a scorer, and they are the numbers most often quoted in argument.',
    interpret:
      'Read serving and returning as percentages, never as counts. A player with ten aces in a five-set match served worse than a player with six in two sets.\n\nRead the break-point line first. It usually explains the result faster than anything else on the sheet: chances created, chances taken.\n\nTreat total points won as the last line rather than the first, because it is the number most likely to contradict the result.',
    limitations:
      'The sheet says nothing about **when** anything happened. Twenty winners at 40-0 and twenty winners at 30-40 produce the same line and different matches.\n\nIt also says nothing about court position, shot selection or how the points were constructed, which is why tracking-derived metrics exist at all.',
    related: [
      'reading-a-stat-sheet',
      'winners',
      'unforced-errors',
      'break-points-won',
      'why-total-points-mislead',
    ],
  }),

  statistic({
    slug: 'first-serve-percentage',
    title: 'First Serve Percentage',
    category: 'statistics',
    order: 20,
    difficulty: 'beginner',
    summary: 'How often the first serve lands in, and why higher is not automatically better.',
    oneSentence:
      'First serve percentage is the proportion of first serves that land in, and it is an official counted statistic.',
    measures:
      'The share of service points on which the first serve was good, so the player did not have to hit a second.',
    formula:
      '**First serves in ÷ first serves attempted.**\n\nEvery service point has exactly one first-serve attempt, so the denominator is the number of points served, excluding lets, which are replayed.',
    workedExample:
      'A player serves 80 points and lands 48 first serves.\n\n48 ÷ 80 = **60%**.\n\nThe remaining 32 points were played on a second serve, which is where the returner’s opportunity lies.',
    interpret:
      'Around 60% is typical at professional level, with meaningful variation by player, surface and era. Read it alongside first-serve points won: those two numbers together describe a serving strategy, and neither describes it alone.',
    limitations:
      'It says nothing about the quality of the serves that went in. A player can raise this number substantially by serving slower, and lose more points doing so.\n\nA player at 75% with a modest first-serve points-won figure is probably serving too safely; a player at 50% winning a very high share of first-serve points may be making exactly the right trade.',
    related: [
      'first-serve-points-won',
      'second-serve-points-won',
      'first-serve-vs-second-serve',
      'double-faults-statistic',
    ],
  }),

  statistic({
    slug: 'first-serve-points-won',
    title: 'First Serve Points Won',
    category: 'statistics',
    order: 30,
    difficulty: 'intermediate',
    summary: 'How often a good first serve leads to a won point.',
    oneSentence:
      'First serve points won is the share of points won when the first serve went in, and it is an official counted statistic.',
    measures:
      'The effectiveness of the first serve, including everything that follows it in the rally, not only the serve itself.',
    formula:
      '**Points won on first serve ÷ points where the first serve was in.**\n\nNote the denominator: only points where the first serve landed. It is not a share of all service points.',
    workedExample:
      'A player lands 48 first serves and wins 36 of those points.\n\n36 ÷ 48 = **75%**.',
    interpret:
      'The mid-seventies is a common professional figure, higher for the biggest servers and on faster surfaces. It captures the serve plus the shot after it, which is why it is a better measure of a serving game than the ace count.',
    limitations:
      'It cannot separate the serve from what came next. A player with an ordinary serve and an outstanding forehand can post the same number as a player with a huge serve and an ordinary forehand.',
    related: [
      'first-serve-percentage',
      'second-serve-points-won',
      'serve-plus-one',
      'service-points-won',
    ],
  }),

  statistic({
    slug: 'second-serve-points-won',
    title: 'Second Serve Points Won',
    category: 'statistics',
    order: 40,
    difficulty: 'intermediate',
    summary: 'The most predictive serving number on the sheet.',
    oneSentence:
      'Second serve points won is the share of points won on a second serve, and it is an official counted statistic.',
    measures:
      'How well a player copes when the safety net is gone: the serve must go in, so the returner knows a slower ball is coming.',
    formula:
      '**Points won on second serve ÷ points where a second serve was played.**\n\nDouble faults are included in the denominator and count as points lost, which is correct: a double fault is a second-serve point that was lost.',
    workedExample:
      'A player plays 32 second-serve points, wins 16 of them and double faults 3 times.\n\n16 ÷ 32 = **50%**. The three double faults are already inside that: they are three of the sixteen points lost.',
    interpret:
      'Roughly half is a common figure at professional level, with real variation by tour and surface. It is one of the most predictive single numbers in tennis, because it describes a third of all service points and it is where breaks come from.',
    limitations:
      'Like the first-serve figure, it merges the serve with the rally that follows. And it is affected by how aggressively the returner plays: a passive returner flatters a mediocre second serve.',
    related: [
      'first-serve-vs-second-serve',
      'attacking-second-serves',
      'double-faults-statistic',
      'kick-serve',
      'break-points-saved',
    ],
  }),

  statistic({
    slug: 'aces-statistic',
    title: 'Aces as a Statistic',
    category: 'statistics',
    order: 50,
    difficulty: 'beginner',
    summary: 'A count of untouched serves, and the least informative serving number.',
    oneSentence:
      'The ace count is the number of legal serves the receiver did not touch, and it is an official counted statistic with a judgment element.',
    measures: 'Serves that won the point outright with no contact from the receiver.',
    formula:
      'A simple count. There is no denominator on the standard sheet, which is the first problem with it: aces per service point is far more useful than aces.',
    workedExample:
      'Twelve aces in a match where a player served 120 points is one ace per ten service points. Twelve in a match where they served 60 is twice that rate. The raw count is identical.',
    interpret:
      'Use it as a rate, and use it alongside unreturned serves, which counts both aces and service winners. The rate tells you about the serve; the count tells you mostly about the length of the match.',
    limitations:
      'The count depends on a scorer judging whether the racket touched the ball, so it is not fully objective and can differ between data sources for the same match.\n\nMore importantly, aces are a small share of the points a good serve wins. A serve that produces a weak floating return wins the point just as surely and appears nowhere in this number.',
    related: ['ace', 'service-winner', 'serve-speed', 'first-serve-points-won', 'flat-serve'],
  }),

  statistic({
    slug: 'double-faults-statistic',
    title: 'Double Faults as a Statistic',
    category: 'statistics',
    order: 60,
    difficulty: 'beginner',
    summary: 'A count of points given away on serve, and why low is not always good.',
    oneSentence:
      'The double fault count is the number of points lost by missing both serves, and it is an official counted statistic.',
    measures: 'Points conceded on serve without the opponent playing a ball.',
    formula: 'A simple count. As a rate: **double faults ÷ second-serve points played.**',
    workedExample:
      'Four double faults across 32 second-serve points is a rate of 12.5%. Four across 60 second-serve points is half that. The count alone does not distinguish them.',
    interpret:
      'A handful per match is normal. What matters is the pattern: double faults clustered at 30-30 and break points indicate a player whose second serve fails under pressure, which is a different problem from a player who double faults evenly throughout.',
    limitations:
      'A very low count can indicate a second serve so cautious that the player loses those points anyway. Read it together with second-serve points won, which is where the cost of caution appears.',
    related: [
      'double-fault',
      'second-serve-points-won',
      'first-serve-vs-second-serve',
      'clutch-performance',
    ],
  }),

  statistic({
    slug: 'winners',
    title: 'Winners',
    category: 'statistics',
    order: 70,
    difficulty: 'beginner',
    summary: 'Shots the opponent did not touch, counted by a human making a judgment.',
    oneSentence:
      'A winner is a shot that ends the point without the opponent touching the ball, and it is recorded at the match as a judgment call.',
    measures: 'Points ended by a shot the opponent could not reach.',
    formula:
      'A count made by the match scorer. A serve that is untouched is recorded as an ace rather than a winner, so the two do not overlap.',
    interpret:
      'Winners are best read against unforced errors, as a ratio. A player with 40 winners and 45 unforced errors and a player with 20 and 12 are playing very different matches, and the second may well have won it.\n\nSurface matters: a grass-court match will show more winners and a clay-court match more of everything else, so cross-surface comparison of raw winner counts is close to meaningless.',
    limitations:
      'It is a **judgment**, not a count. Whether a ball the opponent moved towards but did not touch is a winner or a forced error is a scorer’s decision, and different scorers decide differently.\n\nBecause of this, winner totals from different tournaments are not strictly comparable.',
    related: [
      'unforced-errors',
      'forced-vs-unforced-errors',
      'offensive-player',
      'tennis-statistics',
    ],
  }),

  statistic({
    slug: 'unforced-errors',
    title: 'Unforced Errors',
    category: 'statistics',
    order: 80,
    difficulty: 'beginner',
    summary: 'Mistakes made with time to spare, and the most argued-about number in tennis.',
    oneSentence:
      'An unforced error is a missed shot the player had time and balance to make, and it is recorded at the match as a judgment call.',
    measures:
      'Points lost through the player’s own mistake rather than through pressure applied by the opponent.',
    formula:
      'A count made by the match scorer, who decides for every error whether the player was under pressure. Errors judged to be under pressure are recorded as forced errors instead.',
    interpret:
      'Read as a ratio against winners, and read against the surface and the opponent. A high count against a heavy hitter may mean the opponent was excellent rather than the player poor, and that is exactly the distinction the forced/unforced split is trying and failing to make cleanly.',
    limitations:
      'This is the least objective number on the sheet. The line between forced and unforced is a scorer’s opinion, applied hundreds of times per match, with no review.\n\nAny analysis that treats unforced errors as a hard measure of quality is building on that opinion. It is a useful indication and a poor foundation.',
    related: [
      'winners',
      'forced-vs-unforced-errors',
      'building-a-point',
      'defensive-player',
      'tennis-statistics',
    ],
  }),

  statistic({
    slug: 'break-points-won',
    title: 'Break Points Won',
    category: 'statistics',
    order: 90,
    difficulty: 'intermediate',
    summary:
      'Chances taken against chances created, and usually the line that explains the result.',
    oneSentence:
      'Break points won, or converted, is the share of break-point opportunities on which the receiver actually broke serve, and it is an official counted statistic.',
    measures: 'How efficiently a player turns pressure on the opponent’s serve into games.',
    formula: '**Break points converted ÷ break points faced by the opponent.**',
    workedExample:
      'A player reaches break point 12 times and breaks 3 times.\n\n3 ÷ 12 = **25%**.\n\nA typical professional conversion rate sits somewhere around a third to two-fifths, so 25% from twelve chances is a poor return, and a player who lost a close match with that line usually did not lose it on serve.',
    interpret:
      'Read the two numbers separately. Creating twelve break points is a returning achievement; converting three of them is a separate question. A player who creates few and converts most has a different problem from one who creates many and converts few.',
    limitations:
      'Sample sizes are tiny. Twelve break points is not enough to distinguish a good converter from an unlucky one, and single-match conversion rates are close to noise.\n\nIt also treats all break points as equal, and 0-40 at 1-1 is not 30-40 at 5-5.',
    related: [
      'break-point',
      'break-points-saved',
      'break-point-conversion',
      'creating-break-point-pressure',
      'clutch-performance',
    ],
  }),

  statistic({
    slug: 'break-points-saved',
    title: 'Break Points Saved',
    category: 'statistics',
    order: 100,
    difficulty: 'intermediate',
    summary: 'The server’s side of the same ledger.',
    oneSentence:
      'Break points saved is the share of break points against a server that they won, and it is an official counted statistic.',
    measures: 'How well a player serves at the moments where a game is at stake.',
    formula: '**Break points saved ÷ break points faced.**',
    workedExample:
      'A player faces 9 break points and is broken twice.\n\nThey saved 7 of 9, or **78%**.',
    interpret:
      'A high save rate over a season indicates a player whose serve holds up under pressure, which is a genuine and durable trait. Over a single match it indicates very little, because nine break points is not a sample.',
    limitations:
      'It is the mirror image of the opponent’s conversion rate, so the two numbers describe the same events from two sides and cannot both be treated as independent evidence.\n\nIt is also inflated by facing break points against weak returners.',
    related: [
      'break-points-won',
      'break-point-save-rate',
      'hold-serve',
      'second-serve-points-won',
      'clutch-performance',
    ],
  }),

  statistic({
    slug: 'return-points-won',
    title: 'Return Points Won',
    category: 'statistics',
    order: 110,
    difficulty: 'intermediate',
    summary: 'The single best summary of a player’s returning.',
    oneSentence:
      'Return points won is the share of points a player wins when receiving, and it is an official counted statistic.',
    measures: 'Everything the player does on the half of the points where they are not serving.',
    formula:
      '**Points won while receiving ÷ points played while receiving.**\n\nOften split into first-serve return points won and second-serve return points won, which is more informative than the combined figure.',
    workedExample:
      'A player receives 80 points and wins 30.\n\n30 ÷ 80 = **37.5%**.\n\nSomewhere in the mid-thirties to low forties is common at professional level, with the exact norm varying by tour and surface.',
    interpret:
      'Together with service points won, this is one of the two numbers that describe a player’s whole game. The gap between the two also tells you what kind of player they are: a big server has a wide gap, an all-round player a narrow one.',
    limitations:
      'It depends heavily on the quality of the servers faced, so comparing two players’ figures across different draws compares their opponents as much as their returning.',
    related: [
      'service-points-won',
      'return-of-serve',
      'break-percentage',
      'attacking-second-serves',
      'strength-of-schedule',
    ],
  }),

  statistic({
    slug: 'net-points-won',
    title: 'Net Points Won',
    category: 'statistics',
    order: 120,
    difficulty: 'intermediate',
    summary: 'How often coming forward worked, and why the percentage is always high.',
    oneSentence:
      'Net points won is the share of points won when a player came to the net, and it is an official counted statistic.',
    measures: 'The outcome of the points in which the player approached the net.',
    formula: '**Points won at the net ÷ points where the player came to the net.**',
    workedExample:
      'A player approaches 14 times and wins 10.\n\n10 ÷ 14 = **71%**.\n\nThat is a normal figure, and it is high because players mostly approach on balls that were already good.',
    interpret:
      'Read the denominator first. A player who won 71% of 14 approaches has a promising tactic they barely used; one who won 60% of 50 approaches has built their match around it.\n\nThe number is high almost universally, which is why "net points won" alone never settles the question of whether a player should have come forward more.',
    limitations:
      'It is subject to heavy selection bias: players approach when the ball invites it, so the sample is not a random selection of points. It measures the outcome of good decisions, not the value of the tactic.',
    related: [
      'coming-to-the-net',
      'approaching-the-net',
      'volley',
      'serve-and-volley',
      'approach-shot',
    ],
  }),

  statistic({
    slug: 'total-points-won',
    title: 'Total Points Won',
    category: 'statistics',
    order: 130,
    difficulty: 'beginner',
    summary: 'Every point in the match added up, which is not how the match is decided.',
    oneSentence:
      'Total points won is the sum of all points a player won in the match, and it is an official counted statistic that does not determine the winner.',
    measures: 'The raw count of points, regardless of when they were won.',
    formula: '**Points won ÷ total points played**, or reported as a raw count for each player.',
    workedExample:
      'A match ending 6-7(5), 7-5, 6-4 might show the loser winning 138 points to the winner’s 134. Both numbers are correct, and the scoreline stands.',
    interpret:
      'Use it as a check on how close a match really was, not as a verdict on who deserved to win. A large gap in total points with a close scoreline usually means one player was dominant in the sets they lost.',
    limitations:
      'This is the tennis statistic most likely to mislead, and it has an explainer of its own for that reason. Points are not equal, and the scoring system is explicitly designed so that they are not.',
    related: [
      'why-total-points-mislead',
      'tennis-scoring',
      'games-sets-and-matches',
      'dominance-ratio',
    ],
  }),

  statistic({
    slug: 'why-total-points-mislead',
    title: 'Why Total Points Won Can Be Misleading',
    category: 'statistics',
    isFeatured: true,
    order: 140,
    difficulty: 'intermediate',
    summary:
      'Because tennis resets the score constantly, so where points fall matters more than how many.',
    oneSentence:
      'Tennis nests points inside games and games inside sets, so points won in a set you lose heavily are simply discarded, and the player who wins more points can lose the match.',
    measures: 'Nothing, on its own. This explainer is about a failure mode rather than a metric.',
    formula:
      'The reason is structural. Consider a straightforward illustration:\n\n**Set 1:** Player A loses 0-6, winning 12 of 30 points.\n**Set 2:** Player A wins 7-5, winning 45 of 84 points.\n**Set 3:** Player A wins 7-6, winning 48 of 94 points.\n\nA has won the match two sets to one. Whether A or B won more total points depends entirely on the first set, in which A lost every game while still winning 40% of the points.\n\nThose twelve points bought nothing at all, because they were spread across six lost games.',
    workedExample:
      'Roughly one professional match in twenty is won by the player who won fewer points. That is not an anomaly in the data: it is the scoring system working exactly as designed.\n\nThe general pattern is always the same. The player who loses is the one who won points in games and sets they lost, and the player who wins is the one whose points were concentrated at 30-40 and 4-5.',
    interpret:
      'When you see a total-points line contradicting the result, the question to ask is which player won the tight games. That is usually visible in the break-points line.',
    limitations:
      'None of this means total points is useless. Over many matches, a player who consistently wins more points than their opponents will win more matches: the noise averages out. It is single-match conclusions that fail.',
    related: [
      'total-points-won',
      'tennis-scoring',
      'break-points-won',
      'dominance-ratio',
      'games-sets-and-matches',
    ],
  }),

  statistic({
    slug: 'serve-speed',
    title: 'Serve Speed',
    category: 'statistics',
    order: 150,
    difficulty: 'beginner',
    summary: 'How fast the serve left the racket, which is measured rather than counted.',
    oneSentence:
      'Serve speed is the measured velocity of a serve, reported as a fastest serve and an average for first and second serves.',
    measures:
      'The speed of the ball, usually shortly after it leaves the racket rather than when it reaches the returner.',
    formula:
      'Measured by radar or by the camera tracking system, depending on the venue. Reported as fastest serve, average first serve and average second serve.',
    interpret:
      'Average matters more than maximum. A single fast serve is a highlight; a high average first-serve speed sustained through a match is a physical achievement and a tactical fact.\n\nThe gap between average first and second serve speeds tells you how much spin the player is putting on the second: a large gap means a heavy kick serve, a small gap means a flatter, riskier second delivery.',
    limitations:
      'Measurements are not perfectly comparable between venues, because equipment and the point in the ball’s flight at which speed is taken can differ. Cross-tournament comparisons of a few kilometres per hour are not meaningful.\n\nSpeed also is not effectiveness. Placement, spin and disguise all decide points that speed alone does not, which is why the fastest servers are not always the most effective ones.',
    related: [
      'flat-serve',
      'aces-statistic',
      'kick-serve',
      'altitude-in-tennis',
      'first-serve-points-won',
    ],
  }),

  statistic({
    slug: 'rally-length',
    title: 'Rally Length',
    category: 'statistics',
    order: 160,
    difficulty: 'intermediate',
    summary: 'How many shots a point lasted, and what the distribution says about a match.',
    oneSentence:
      'Rally length is the number of shots in a point, and it is derived from tracking or shot-by-shot data rather than appearing on a traditional stat sheet.',
    measures:
      'How long points last, usually counted in shots including the serve, and reported as an average or as a distribution across bands.',
    formula:
      'Counted from shot-by-shot data. Commonly grouped into bands: 0 to 4 shots, 5 to 8, and 9 or more, because those bands map onto serve-dominated points, transitional points and attritional ones.',
    workedExample:
      'A match where 70% of points end within four shots is a serve-dominated match, most likely on a fast surface. A match where 30% of points reach nine shots or more is an attritional one, most likely on clay.\n\nThe average alone hides this: two matches with the same average can have completely different distributions.',
    interpret:
      'Compare a player’s win rate by band. A player who dominates short points and struggles in long ones is a server; the reverse is a grinder. That comparison is far more informative than the average rally length itself.',
    limitations:
      'Whether the serve counts as shot one differs between data sources, which shifts every number by one. Availability is also uneven: shot-level data exists for televised matches at major tournaments and not for most professional tennis.',
    related: [
      'rally-length-analysis',
      'tennis-court-surfaces',
      'serve-plus-one',
      'counterpuncher',
      'hawk-eye',
    ],
  }),

  statistic({
    slug: 'forced-vs-unforced-errors',
    title: 'Forced vs Unforced Errors',
    category: 'statistics',
    order: 170,
    difficulty: 'intermediate',
    summary: 'The distinction that carries most of the weight, and none of the objectivity.',
    oneSentence:
      'A forced error is a mistake made under pressure from the opponent and an unforced error is one made with time to spare, and the line between them is a scorer’s judgment.',
    measures:
      'The intended distinction is whose doing the error was: the player’s, or the opponent’s.',
    formula:
      'Both are counted by the match scorer, who classifies every error as one or the other in real time. There is no formula and no review.',
    interpret:
      'Use the split as a rough guide to the shape of a match, not as evidence. A high forced-error count against a heavy hitter is a signal that the opponent was applying pressure; a high unforced-error count in a match with short rallies suggests a player going for too much.',
    limitations:
      'The classification is subjective by construction. A ball reached at full stretch that goes long could reasonably be called either, and scorers differ.\n\nThe practical consequence is that error splits from different tournaments, and sometimes from different matches at the same tournament, are not strictly comparable. Analysts increasingly prefer measures built from tracking data for exactly this reason.',
    related: [
      'unforced-errors',
      'winners',
      'tennis-statistics',
      'court-position-data',
      'reading-a-stat-sheet',
    ],
  }),

  statistic({
    slug: 'reading-a-stat-sheet',
    title: 'How to Read a Tennis Match Stat Sheet',
    category: 'statistics',
    isFeatured: true,
    order: 180,
    difficulty: 'intermediate',
    readMinutes: 6,
    summary: 'A four-step method that gets you to the story of the match in about a minute.',
    oneSentence:
      'Read the break points first, then the second-serve numbers, then the winners-to-errors ratio, and treat total points won as the last line rather than the first.',
    measures:
      'This is a method rather than a metric, applied to the statistics a tournament publishes.',
    formula:
      '**Step 1: break points.** Look at both players’ chances created and taken. A player who created ten and took one lost a match they were controlling; a player who created three and took two won one they were not.\n\n**Step 2: second serve.** Compare both players’ second-serve points won. This is where breaks come from, and a gap of ten points here usually explains the break-point line above it.\n\n**Step 3: winners against unforced errors.** Read as a ratio, and read both players together. Remember it is a judgment, so treat a small difference as noise.\n\n**Step 4: total points.** Read last. If it contradicts the result, that is information about the shape of the match, not about who deserved to win.',
    workedExample:
      'A sheet showing Player A with 2 of 11 break points, 44% of second-serve points won and 38 winners to 41 unforced errors, against Player B with 4 of 6 break points and 55% of second-serve points won, describes a familiar match: A pressed constantly, could not convert, and was punished by a player who took what few chances they had.\n\nThe total-points line in that match will very often favour A.',
    interpret:
      'The order matters because it moves from the most decisive numbers to the least. Break points decide sets, second serves create break points, and total points decide nothing.',
    limitations:
      'The method reads what is published. It says nothing about court position, shot selection or fatigue, and a stat sheet cannot tell you that a player’s movement changed after the second set.',
    related: [
      'tennis-statistics',
      'break-points-won',
      'second-serve-points-won',
      'why-total-points-mislead',
      'winners',
    ],
  }),
];

/* ────────────────────────────────────────────────────────────────────────────
 * Advanced concepts
 * ────────────────────────────────────────────────────────────────────────── */

const ADVANCED: ExplainerSeed[] = [
  statistic({
    slug: 'elo-ratings',
    title: 'Elo Ratings in Tennis',
    category: 'advanced',
    isFeatured: true,
    order: 10,
    difficulty: 'advanced',
    summary:
      'A rating that measures strength by who you beat, not by which tournaments you entered.',
    oneSentence:
      'Elo is a derived rating system that updates after every match according to the result and the opponent’s rating, and it is computed by analysts rather than published by the tours.',
    measures:
      'An estimate of a player’s current strength, expressed as a number from which the probability of beating any other rated player can be calculated directly.',
    formula:
      'Each player has a rating. Before a match, the ratings produce an expected result: a player 100 points higher is expected to win about 64% of the time, and the gap maps onto a probability by a fixed formula.\n\nAfter the match, both ratings move. The winner gains and the loser loses the same amount, scaled by how surprising the result was: beating a much stronger player moves the ratings a long way, beating a much weaker one barely at all.\n\nThe size of the adjustment is set by a parameter usually written K, and choosing it is one of the several places where two implementations of "tennis Elo" will differ.',
    workedExample:
      'Player A is rated 2100 and Player B 1900, a gap of 200 points. The formula gives A roughly a 76% chance of winning.\n\nIf A wins, that was expected, so A gains only a few points. If B wins, the ratings move substantially, because the system was wrong.\n\nAfter enough matches, a player’s rating converges on the level at which the system stops being surprised by their results.',
    interpret:
      'Elo answers "how good is this player now", where the official ranking answers "what have they achieved over 52 weeks". Elo is generally better at predicting the result of a specific match, which is exactly what it was designed for.\n\nSurface-specific Elo ratings, computed from matches on one surface only, are more predictive still for a match on that surface.',
    limitations:
      'It is **not official**. Neither tour publishes it, several public implementations exist, and they disagree, because each makes its own choices about the K value, how to treat retirements, how much of a career to include and how to seed a new player’s rating.\n\nIt also has no view on achievement. Elo will not tell you who had the better season, and it should never be quoted as though it were a ranking.',
    related: [
      'ranking-vs-elo',
      'atp-rankings',
      'expected-hold-probability',
      'strength-of-schedule',
      'head-to-head-analysis',
    ],
  }),

  statistic({
    slug: 'ranking-vs-elo',
    title: 'Ranking vs Elo',
    category: 'advanced',
    order: 20,
    difficulty: 'advanced',
    summary:
      'One allocates tournament places, the other predicts match results. Neither is a substitute.',
    oneSentence:
      'The official ranking is a 52-week points total used to run the sport, while Elo is a derived rating designed to predict who wins a given match.',
    measures:
      'Two different things, which is the whole explainer. Ranking measures accumulated achievement; Elo estimates current strength.',
    formula:
      '**Ranking:** sum of points from a capped number of best results over 52 weeks. Points depend on the tier of tournament and the round reached, and not at all on who was beaten.\n\n**Elo:** a rating updated after every match, depending entirely on who was beaten and not at all on the tournament’s tier.',
    workedExample:
      'A player who reaches the fourth round of a major by beating three low-ranked opponents earns a large block of ranking points and gains almost nothing in Elo.\n\nA player who loses in the quarter-finals of a small event having beaten two top-ten players earns few ranking points and gains substantially in Elo.\n\nBoth systems are behaving correctly. They are measuring different things.',
    interpret:
      'Use the ranking for anything about entry, seeding, qualification or season achievement. Use Elo for anything about who is likely to win a match.\n\nWhere the two disagree sharply, that disagreement is usually informative: a player rated far higher by Elo than by ranking is often returning from injury, and one rated far lower has usually been accumulating points against weak fields.',
    limitations:
      'Elo is unofficial and implementation-dependent. The ranking is official and is not trying to predict anything. Criticising either for failing at the other’s job is the most common error in this area.',
    related: [
      'elo-ratings',
      'atp-rankings',
      'world-number-one',
      'strength-of-schedule',
      'career-high-ranking',
    ],
  }),

  statistic({
    slug: 'hold-percentage',
    title: 'Hold Percentage',
    category: 'advanced',
    order: 30,
    difficulty: 'advanced',
    summary: 'The share of service games won, and half of the two-number summary of any player.',
    oneSentence:
      'Hold percentage is the proportion of service games a player wins, derived from match results rather than published as an official statistic.',
    measures: 'How reliably a player holds serve across a match, a season or a career.',
    formula: '**Service games won ÷ service games played.**',
    workedExample:
      'A player serves 74 games across a tournament and is broken 9 times.\n\n65 ÷ 74 = **88%**.\n\nAt the top of the men’s game, figures in the high eighties and above are common; women’s tour figures are typically lower, because the return is a larger factor in the women’s game, and both vary by surface.',
    interpret:
      'Hold percentage and break percentage together summarise a player more compactly than any other pair of numbers. A big server has a very high hold and a low break; an all-round player has both moderately high; the difference between the two is more informative than either alone.',
    limitations:
      'It is opponent-dependent: holding against weak returners is easier, and a player’s figure reflects their draw as much as their serve. It is also surface-dependent enough that a single career number hides more than it shows.',
    related: [
      'break-percentage',
      'hold-serve',
      'service-points-won',
      'expected-hold-probability',
      'big-server',
    ],
  }),

  statistic({
    slug: 'break-percentage',
    title: 'Break Percentage',
    category: 'advanced',
    order: 40,
    difficulty: 'advanced',
    summary: 'The share of return games won, and the other half of the summary.',
    oneSentence:
      'Break percentage is the proportion of return games in which a player breaks serve, derived from match results rather than published officially.',
    measures: 'How often a player converts a return game into a break of serve.',
    formula: '**Return games won ÷ return games played.**',
    workedExample: 'A player plays 70 return games and breaks 18 times.\n\n18 ÷ 70 = **26%**.',
    interpret:
      'Read alongside hold percentage. The sum of the two is a compact measure of overall strength: a player who holds 85% and breaks 25% is winning far more games than they lose, and the arithmetic of that gap is what produces a high ranking.\n\nThe balance between them describes the player. A large gap indicates a serve-dominated game; a small gap indicates a returner.',
    limitations:
      'As with hold percentage, it depends on the servers faced. Comparing two players’ break percentages compares their draws and their tours as much as their returning.',
    related: [
      'hold-percentage',
      'break-of-serve',
      'return-points-won',
      'break-point-conversion',
      'strength-of-schedule',
    ],
  }),

  statistic({
    slug: 'service-points-won',
    title: 'Service Points Won',
    category: 'advanced',
    order: 50,
    difficulty: 'advanced',
    summary: 'All service points combined, and the input to most serving models.',
    oneSentence:
      'Service points won is the share of all points a player wins on serve, combining first and second serves into one figure.',
    measures: 'Overall serving effectiveness, including the rallies that follow the serve.',
    formula:
      '**Points won on serve ÷ points served.**\n\nIt can also be reconstructed from the components: (first-serve percentage × first-serve points won) + ((1 − first-serve percentage) × second-serve points won).',
    workedExample:
      'A player lands 60% of first serves, winning 75% of those points, and wins 50% of second-serve points.\n\n(0.60 × 0.75) + (0.40 × 0.50) = 0.45 + 0.20 = **65%**.\n\nThat reconstruction is the useful part: it shows exactly how much a change in first-serve percentage is worth, given what each serve wins.',
    interpret:
      'This is the number most serving models take as their input, because hold probability follows from it almost directly: a player who wins 65% of service points holds a very high proportion of service games, and the relationship is steep.',
    limitations:
      'It merges the serve with everything after it, so it credits a great forehand to the serve. And like every serving statistic, it depends on who was returning.',
    related: [
      'return-points-won',
      'expected-hold-probability',
      'first-serve-points-won',
      'hold-percentage',
      'first-serve-percentage',
    ],
  }),

  statistic({
    slug: 'dominance-ratio',
    title: 'Dominance Ratio',
    category: 'advanced',
    order: 60,
    difficulty: 'advanced',
    summary:
      'Return points won divided by return points conceded: one number for who controlled the match.',
    oneSentence:
      'Dominance ratio compares how well a player returned with how well their opponent returned, and it is a derived analytical metric rather than an official statistic.',
    measures:
      'Which player was more dominant, in a way that strips out the fact that both players win most of their own service points.',
    formula:
      '**Return points won (%) ÷ opponent’s return points won (%).**\n\nEquivalently: the share of the opponent’s service points you won, divided by the share of your service points they won.\n\nAbove 1.0 means you were the more dominant player. Below 1.0 means the opposite. Exactly 1.0 is a genuinely even match.',
    workedExample:
      'Player A wins 40% of return points; Player B wins 32%.\n\n0.40 ÷ 0.32 = **1.25**. A was meaningfully more dominant.\n\nIf A lost that match, the dominance ratio is the number that explains why the result feels wrong: A controlled more of the match and lost the points that decided it.',
    interpret:
      'It is a better one-number summary of a match than total points won, because it is not distorted by the fact that both players hold serve most of the time. Values above about 1.2 usually indicate clear control; a match won with a ratio below 1.0 was won on the important points rather than across the board.',
    limitations:
      'Derived, not official, and defined by analysts rather than by a governing body. It also says nothing about timing: a player can post 1.3 and lose, which is precisely when the number is most interesting and least conclusive.',
    related: [
      'why-total-points-mislead',
      'return-points-won',
      'break-point-conversion',
      'clutch-performance',
      'total-points-won',
    ],
  }),

  statistic({
    slug: 'surface-adjusted-performance',
    title: 'Surface-Adjusted Performance',
    category: 'advanced',
    order: 70,
    difficulty: 'advanced',
    summary: 'Comparing numbers across surfaces by correcting for what the surface does.',
    oneSentence:
      'Surface adjustment rescales a player’s statistics to account for the fact that the same performance produces different numbers on clay, grass and hard courts.',
    measures:
      'A player’s performance relative to what is normal on the surface they were playing on, rather than in absolute terms.',
    formula:
      'The general approach is to compute the tour-wide average for a statistic on each surface, then express a player’s figure as a deviation from that surface’s baseline rather than as a raw number.\n\nA hold percentage of 85% on clay, where holding is harder, is a better performance than 85% on grass, where it is easier. Adjustment makes those two comparable.\n\nSurface-specific Elo is the same idea applied to ratings: a separate rating computed from matches on one surface only.',
    workedExample:
      'Suppose the tour average hold percentage is 80% on grass and 72% on clay. A player holding 82% on grass is two points above the baseline; a player holding 78% on clay is six points above it.\n\nUnadjusted, the grass figure looks better. Adjusted, the clay performance was stronger.',
    interpret:
      'Use adjustment whenever comparing across surfaces, seasons or tours. Raw serving and returning numbers are close to meaningless in a cross-surface comparison.',
    limitations:
      'It is entirely a matter of methodology, and there is no standard one. Different analysts choose different baselines and different periods, so two surface-adjusted figures for the same player are unlikely to agree.\n\nIt also treats "hard court" as one surface, when hard courts vary between venues by more than the gap between some hard courts and some clay ones.',
    related: [
      'tennis-court-surfaces',
      'elo-ratings',
      'hold-percentage',
      'surface-dominance',
      'surface-specialist',
    ],
  }),

  statistic({
    slug: 'strength-of-schedule',
    title: 'Strength of Schedule',
    category: 'advanced',
    order: 80,
    difficulty: 'advanced',
    summary: 'Who a player actually had to beat, which the ranking does not record.',
    oneSentence:
      'Strength of schedule measures the quality of the opponents a player faced, and it is a derived analytical measure with no official version.',
    measures:
      'The average level of a player’s opposition, usually expressed through the opponents’ ratings or rankings at the time the matches were played.',
    formula:
      'Typically the average rating of opponents faced, weighted by how many matches were played against each. Implementations differ in whether they use ranking, Elo, or a surface-specific rating, and in how they weight recent matches.',
    workedExample:
      'Two players both reach the quarter-finals of a major, earning identical ranking points.\n\nOne beat opponents ranked 90, 65 and 40. The other beat opponents ranked 30, 12 and 5.\n\nThe ranking system records these as identical. Elo and strength-of-schedule measures do not, which is the entire reason those measures exist.',
    interpret:
      'Use it to interpret ranking movements that look unearned, and to explain why a player rated highly by Elo may be ranked modestly. It is most useful as context for another number rather than on its own.',
    limitations:
      'No official version, several definitions, and heavy dependence on which rating is used for the opponents. It is also backward-looking: it describes who was beaten, not how well.',
    related: [
      'elo-ratings',
      'ranking-vs-elo',
      'atp-rankings',
      'head-to-head-analysis',
      'surface-adjusted-performance',
    ],
  }),

  statistic({
    slug: 'clutch-performance',
    title: 'Clutch Performance',
    category: 'advanced',
    order: 90,
    difficulty: 'advanced',
    summary: 'Playing better on important points, and how hard it is to demonstrate.',
    oneSentence:
      'Clutch performance is the idea that a player performs differently on high-leverage points, and it is a derived analytical concept with contested measurement.',
    measures:
      'The difference between a player’s performance on important points and their performance on ordinary ones.',
    formula:
      'The usual approach assigns each point a **leverage**: how much winning it would change the probability of winning the match. Break points, set points and tiebreak points have high leverage; 40-0 has almost none.\n\nA player’s clutch measure is then the gap between their win rate on high-leverage points and their overall win rate, adjusted for the fact that high-leverage points are disproportionately played on the opponent’s terms.',
    workedExample:
      'A player wins 52% of all points against a given opponent and 60% of break points. That gap is suggestive.\n\nThe problem is sample size. A season may contain only two or three hundred break points, and a gap of that size across that sample is well within what chance produces. Demonstrating that a player is genuinely clutch, rather than that they had a good year on break points, requires far more data than a season provides.',
    interpret:
      'Treat single-season clutch figures as description rather than as evidence of a trait. Over a very long career, persistent gaps are more suggestive, and even then the effect sizes found are usually smaller than commentary assumes.',
    limitations:
      'This is the area of tennis analytics where the gap between confident commentary and defensible evidence is widest. The concept is plausible, the measurement is noisy, and the standard warning applies: a player who won three tiebreaks is not thereby a clutch player.',
    related: [
      'break-point-conversion',
      'break-point-save-rate',
      'set-point-match-point-championship-point',
      'tiebreak',
      'dominance-ratio',
    ],
  }),

  statistic({
    slug: 'break-point-conversion',
    title: 'Break-Point Conversion',
    category: 'advanced',
    order: 100,
    difficulty: 'advanced',
    summary: 'The season-long version of break points won, and what it does and does not predict.',
    oneSentence:
      'Break-point conversion is the share of break points a player takes across a season or career, derived by aggregating official match statistics.',
    measures: 'Efficiency at converting pressure on the opponent’s serve into breaks.',
    formula: '**Break points converted ÷ break points faced**, aggregated across matches.',
    workedExample:
      'A player converts 180 of 450 break points across a season: **40%**.\n\nCompared with a tour average somewhere in the high thirties, that is a good but not extraordinary figure, and the difference between 40% and 37% across 450 chances is a handful of matches.',
    interpret:
      'The useful question is whether a player’s conversion rate differs from what their overall return-points-won figure would predict. A player who wins 40% of return points and converts 45% of break points is over-performing; the same player at 30% conversion is under-performing.\n\nThat comparison is more informative than the raw rate, because it controls for how good a returner they are.',
    limitations:
      'Conversion rates regress heavily towards the mean between seasons, which is the usual signature of a number driven mostly by chance. A player’s poor conversion year is a weak predictor of their next one.\n\nIt also weights all break points equally, when they are not.',
    related: [
      'break-points-won',
      'break-point-save-rate',
      'clutch-performance',
      'return-points-won',
      'break-percentage',
    ],
  }),

  statistic({
    slug: 'break-point-save-rate',
    title: 'Break-Point Save Rate',
    category: 'advanced',
    order: 110,
    difficulty: 'advanced',
    summary: 'The server’s equivalent, and a slightly more durable trait.',
    oneSentence:
      'Break-point save rate is the share of break points a server saves, aggregated across a season or career.',
    measures: 'How well a player serves at the moments when a break is at stake.',
    formula: '**Break points saved ÷ break points faced**, aggregated across matches.',
    workedExample:
      'A player faces 300 break points in a season and saves 200: **67%**.\n\nAgainst a typical figure somewhere around 60 to 65%, that is a strong return, and for a big server it may simply reflect that they are serving well rather than that they respond to pressure.',
    interpret:
      'Compare against the player’s own overall service-points-won figure. A server who wins 65% of service points and saves 67% of break points is roughly where their serve predicts; one who saves 75% is doing something the base rate does not explain.\n\nThis measure regresses somewhat less than conversion does, which is consistent with the serve being more under the server’s own control than the return is.',
    limitations:
      'Derived by aggregation rather than published, sensitive to who was returning, and subject to the same sample-size problems as every leverage-based measure.',
    related: [
      'break-points-saved',
      'break-point-conversion',
      'service-points-won',
      'clutch-performance',
      'hold-percentage',
    ],
  }),

  statistic({
    slug: 'expected-hold-probability',
    title: 'Expected Hold Probability',
    category: 'advanced',
    order: 120,
    difficulty: 'advanced',
    summary: 'Turning a service-points-won figure into the probability of holding a game.',
    oneSentence:
      'Expected hold probability is the chance a player holds serve, computed from their service-points-won rate under a model of the scoring system.',
    measures: 'What a player’s serving should produce at the level of games, rather than points.',
    formula:
      'The standard model assumes each point on serve is independent with probability *p* of being won, then works out the probability of winning a game under tennis’s scoring rules, including deuce.\n\nThe relationship is steep and non-linear. Small changes in *p* around the professional range produce much larger changes in hold probability, because a game requires four points and deuce compounds an advantage.',
    workedExample:
      'A player winning 60% of service points holds roughly three-quarters of their service games under the model. A player at 65% holds around 83%. A five-point improvement in point win rate produces roughly an eight-point improvement in hold rate.\n\nThat amplification is why serving improvements matter so much: the scoring system magnifies them.',
    interpret:
      'Compare a player’s actual hold percentage with the model’s expectation. A player holding well above expectation is either winning the important points at a rate the model does not capture, or has been lucky, and distinguishing those requires more than one season.',
    limitations:
      'The independence assumption is false: points are not independent, servers change tactics by score, and a first serve missed at 30-40 is not the same event as one missed at 40-0. The model is a useful approximation and not a description of reality.\n\nIt is entirely a derived measure with no official standing.',
    related: [
      'service-points-won',
      'hold-percentage',
      'clutch-performance',
      'break-point-save-rate',
      'tennis-scoring',
    ],
  }),

  statistic({
    slug: 'serve-direction-analysis',
    title: 'Serve Direction Analysis',
    category: 'advanced',
    order: 130,
    difficulty: 'advanced',
    summary: 'Where serves are aimed, how predictable a server is, and what each target wins.',
    oneSentence:
      'Serve direction analysis breaks a player’s serves down by target within the service box, and it is derived from tracking data rather than from the official stat sheet.',
    measures:
      'The distribution of serve targets, usually into three zones per court: wide, body and down the T, split by deuce and ad court and by first and second serve.',
    formula:
      'Each serve is assigned a zone from tracking data. The analysis reports the share of serves to each zone and the points won from each, typically split by court and by serve number.',
    workedExample:
      'A player’s deuce-court first serves might split roughly 40% wide, 25% body, 35% down the T, with the wide serve winning a noticeably higher share of points.\n\nThe interesting question is not which zone wins most, but whether the distribution is predictable. A player who goes down the T on 70% of second serves at 30-40 has a pattern an opponent can exploit, even if that serve is their best one.',
    interpret:
      'Read distribution and effectiveness together, and read them by score. Predictability at high-leverage moments is the finding that changes how a match is played, and it is invisible in aggregate numbers.',
    limitations:
      'Requires ball-tracking, which exists at major tournaments on show courts and not across most professional tennis, so the data is a biased sample of matches.\n\nZone boundaries are also a choice, and different providers draw them differently.',
    related: [
      'hawk-eye',
      'ad-court-and-deuce-court',
      'serve-plus-one',
      'flat-serve',
      'patterns-of-play',
    ],
  }),

  statistic({
    slug: 'rally-length-analysis',
    title: 'Rally-Length Analysis',
    category: 'advanced',
    order: 140,
    difficulty: 'advanced',
    summary: 'Win rates by how long the point lasted, which profiles a player in three numbers.',
    oneSentence:
      'Rally-length analysis reports a player’s win rate by the number of shots in the point, and it is derived from shot-by-shot data.',
    measures: 'Where in the course of a point a player gains or loses their advantage.',
    formula:
      'Points are grouped into bands, most commonly 0 to 4 shots, 5 to 8, and 9 or more, and win rate is computed within each band. The bands are chosen because they correspond to serve-dominated, transitional and attritional points.',
    workedExample:
      'A player might win 55% of points ending within four shots, 48% of points lasting five to eight, and 44% of points of nine or more.\n\nThat profile describes a server whose advantage decays as points extend, and it tells an opponent exactly what to do: extend the points.\n\nThe reverse profile describes a grinder, and the instruction to their opponent is the opposite.',
    interpret:
      'The shape across bands matters more than any single figure. Two players with the same overall win rate can have opposite profiles, and the profile is what determines how a match between them plays out.',
    limitations:
      'Depends on shot-by-shot data availability, which is uneven. The band boundaries are conventional rather than principled, and whether the serve counts as a shot differs between sources, which shifts every point by one band boundary.',
    related: ['rally-length', 'counterpuncher', 'big-server', 'tennis-court-surfaces', 'hawk-eye'],
  }),

  statistic({
    slug: 'court-position-data',
    title: 'Court Position Data',
    category: 'advanced',
    order: 150,
    difficulty: 'advanced',
    summary: 'Where players actually stand, measured rather than eyeballed.',
    oneSentence:
      'Court position data records where players stand and where they strike the ball, and it is derived from tracking systems.',
    measures:
      'Average and distribution of contact positions and standing positions: how far behind the baseline a player returns from, how far inside they take the ball in a rally, how often they are inside the court.',
    formula:
      'Player and ball positions are recorded continuously by the tracking system. Common summaries are average return position relative to the baseline, average contact depth during rallies, and the share of shots struck inside the baseline.',
    workedExample:
      'A player whose average rally contact point moves from half a metre inside the baseline in the first set to two metres behind it in the third has been pushed back, and the number records what a coach would otherwise be describing from memory.\n\nThat shift usually precedes the drop in results rather than following it, which is what makes the measurement useful.',
    interpret:
      'Court position is the most direct measurement of who is dictating, and it is more reliable than winners or errors because it is measured rather than judged.\n\nIt is also the metric most useful within a match: a player’s position drifting backwards is actionable in a way that an error count is not.',
    limitations:
      'Availability is the limitation. Tracking exists on show courts at major events, so any career-level analysis using it is built on a non-random sample of a player’s matches.',
    related: [
      'court-positioning',
      'taking-the-ball-early',
      'hawk-eye',
      'return-positioning',
      'forced-vs-unforced-errors',
    ],
  }),

  statistic({
    slug: 'head-to-head-analysis',
    title: 'Head-to-Head Matchup Analysis',
    category: 'advanced',
    order: 160,
    difficulty: 'advanced',
    summary: 'What two players’ previous meetings do and do not tell you.',
    oneSentence:
      'Head-to-head analysis examines the record between two players, and its main lesson is how little a raw head-to-head count usually means.',
    measures:
      'The results of previous meetings, ideally broken down by surface, by round, by era and by the form of both players at the time.',
    formula:
      'The raw form is a simple count: matches won by each. A useful form conditions on surface and recency, and compares the record with what the players’ ratings would have predicted for those same matches.',
    workedExample:
      'A 7-3 head-to-head sounds decisive. If six of those ten matches were played on clay, and one player is a clay specialist, the record describes a surface rather than a matchup.\n\nIf the matches span eight years, the early ones describe two different players from the current ones.\n\nAnd ten matches is a small sample: a genuinely even matchup produces a 7-3 split about one time in six.',
    interpret:
      'Split by surface, weight by recency, and compare against what the ratings predicted. A player who has beaten an opponent more often than their ratings suggest they should have, on the relevant surface, in recent matches, is the only version of "matchup problem" that is evidence rather than narrative.',
    limitations:
      'Sample sizes are almost always too small for confidence, and selection effects are severe: two players meet in later rounds, so their meetings are drawn from tournaments where both were playing well.\n\nWalkovers and retirements are treated inconsistently between sources, which changes the raw count.',
    related: [
      'elo-ratings',
      'strength-of-schedule',
      'surface-adjusted-performance',
      'retirement',
      'patterns-of-play',
    ],
  }),
];

/* ────────────────────────────────────────────────────────────────────────────
 * Surfaces
 * ────────────────────────────────────────────────────────────────────────── */

const SURFACES: ExplainerSeed[] = [
  surface({
    slug: 'tennis-court-surfaces',
    title: 'Tennis Court Surfaces Explained',
    category: 'surfaces',
    isStartHere: true,
    isFeatured: true,
    order: 10,
    difficulty: 'beginner',
    readMinutes: 6,
    summary: 'Hard, clay and grass, and the four things each one changes.',
    oneSentence:
      'Professional tennis is played on hard courts, clay and grass, and the surface changes the speed of the ball, the height of the bounce, how players move and how long rallies last.',
    howItPlays:
      'Four properties describe any surface, and every tactical consequence follows from them.\n\n**Speed.** How much pace the court takes off the ball when it bounces. A low-friction surface preserves speed; a high-friction one scrubs it off.\n\n**Bounce height.** How high the ball sits up. A gritty surface grips the ball and converts its forward motion into upward motion, producing a high bounce.\n\n**Movement.** Whether players slide or plant. Sliding lets a player reach further and recover differently, and it changes how the whole court can be defended.\n\n**Consistency.** Whether the bounce is predictable. Grass is the least consistent, particularly as a fortnight wears the surface down.\n\nBroadly: **grass** is fast with a low, sometimes irregular bounce; **clay** is slow with a high bounce and sliding movement; **hard courts** sit between and vary substantially from venue to venue.',
    whyItMatters:
      'Surface is the axis the whole sport is organised along. The season is divided into surface swings, records are kept by surface, rankings are analysed by surface, and the reason winning all four majors is so difficult is that they are not played on the same ground.',
    whoItSuits:
      'Fast, low surfaces reward serving, flat hitting and taking the ball early. Slow, high surfaces reward topspin, defence, movement and patience. Hard courts reward whichever of those the specific venue leans towards, which is why "hard-court specialist" is a much weaker category than "clay-court specialist".',
    misunderstandings:
      '**"Hard courts are one surface."** They are a category. Two hard courts can differ from each other by more than one of them differs from clay, depending on the surface texture and the amount of sand in the paint.',
    related: [
      'hard-courts',
      'clay-courts',
      'grass-courts',
      'surface-and-bounce',
      'why-all-four-majors-is-hard',
    ],
  }),

  surface({
    slug: 'hard-courts',
    title: 'Hard Courts Explained',
    category: 'surfaces',
    order: 20,
    difficulty: 'beginner',
    summary:
      'The most common surface, the most variable, and the one most of the season is played on.',
    oneSentence:
      'A hard court is an acrylic surface laid over concrete or asphalt, medium-fast with a true bounce, and its exact speed depends on the texture of the paint.',
    howItPlays:
      'The playing surface is a painted acrylic layer whose speed is set by how much sand is mixed into it: more sand means more friction, more pace taken off the ball and a higher bounce.\n\nThat is why hard courts vary so widely. Two tournaments using the same nominal surface type can play very differently, and tournaments adjust their surface speed between years.\n\nThe bounce is **true**: consistent and predictable, unlike grass. Players plant and push rather than slide, though sliding on hard courts has become a professional skill in its own right.',
    whyItMatters:
      'Most of the season and two of the four majors are played on hard courts, so it is the surface a player’s ranking mostly reflects.\n\nIt is also the surface most associated with joint impact, because the ground does not give in the way clay does, and that is a real factor in professional injury patterns and in the arguments about the calendar.',
    whoItSuits:
      'Nobody in particular, which is the point. A neutral, true surface rewards the more complete player, which is why hard-court results track the rankings more closely than clay or grass results do.',
    related: [
      'clay-courts',
      'grass-courts',
      'indoor-vs-outdoor',
      'tennis-court-surfaces',
      'surface-and-bounce',
    ],
  }),

  surface({
    slug: 'clay-courts',
    title: 'Clay Courts Explained',
    category: 'surfaces',
    order: 30,
    difficulty: 'beginner',
    summary: 'Crushed brick, slow and high-bouncing, where players slide and points last.',
    oneSentence:
      'A clay court is a loose surface of crushed brick or stone that slows the ball, raises the bounce and lets players slide into their shots.',
    howItPlays:
      'The loose top layer grips the ball on impact, scrubbing off pace and converting forward motion into a higher bounce. The result is a slower ball arriving at a more comfortable height for a topspin player.\n\nPlayers **slide** into shots rather than planting. That extends reach substantially, so balls that would be winners on a hard court are retrieved, which is the main reason rallies are longer.\n\nThe surface also **shows the ball’s mark**, which is why chair umpires on clay inspect marks to settle line calls in a way that has no equivalent on other surfaces.\n\nRed clay is the European variety used at Roland-Garros; green clay, or Har-Tru, is common in the United States and plays slightly faster.',
    whyItMatters:
      'Clay rewards a completely different set of skills from grass, and the two majors on them are three weeks apart. That gap is the central difficulty in winning all four majors.',
    whoItSuits:
      'Heavy topspin players, excellent movers and patient point constructors. It punishes flat hitters, because the surface takes the pace off their best shot, and it punishes players who cannot slide.\n\nIt is also the surface where the drop shot is most used, because rallies are played from so far behind the baseline.',
    notablePlayers:
      'Clay-court dominance is the most extreme surface effect in tennis history, and Rafael Nadal’s record at Roland-Garros is its clearest example.',
    misunderstandings:
      '**"Clay is slow, so it favours defence."** It favours whoever can construct points, which includes heavy attacking topspin. Being slow means rallies are longer, not that aggression fails.',
    related: [
      'why-clay-is-slower',
      'grass-courts',
      'surface-and-movement',
      'drop-shot',
      'topspin',
      'clay-court-shoes',
    ],
  }),

  surface({
    slug: 'grass-courts',
    title: 'Grass Courts Explained',
    category: 'surfaces',
    order: 40,
    difficulty: 'beginner',
    summary:
      'The original surface: fast, low, unpredictable, and played on for a few weeks a year.',
    oneSentence:
      'A grass court is a living surface that keeps the ball fast and low, produces the least predictable bounce in tennis, and changes as a tournament progresses.',
    howItPlays:
      'Grass has low friction, so it preserves the ball’s speed, and it is soft enough that the ball skids through rather than gripping and rising. The result is a fast, low ball that stays in the strike zone for a very short time.\n\nThe bounce is the **least consistent** in tennis. Grass wears unevenly, and by the second week of a tournament the areas behind the baseline and around the service line are visibly worn, which changes how the ball behaves on exactly the parts of the court where it lands most.\n\nMovement is different too: players take shorter steps, stay lower, and slide occasionally rather than as a matter of course.',
    whyItMatters:
      'The grass season is only a few weeks long, which makes it the surface where results are noisiest and where a specialist can gain or lose most of a ranking in a month.',
    whoItSuits:
      'Big servers, flat hitters, players who take the ball early, and anybody comfortable at the net. The slice is unusually effective, because a low ball on a low surface stays very low.\n\nIt is the surface on which serve-and-volley lasted longest, for exactly these reasons.',
    misunderstandings:
      '**"Grass is a fixed surface."** It changes daily. A first-round match and a final are played on materially different courts, and preparing for that is part of the skill.',
    related: [
      'why-grass-plays-differently',
      'clay-courts',
      'slice',
      'serve-and-volley',
      'channel-slam',
    ],
  }),

  surface({
    slug: 'why-clay-is-slower',
    title: 'Why Clay Is Slower',
    category: 'surfaces',
    order: 50,
    difficulty: 'intermediate',
    summary: 'Friction: the loose top layer grips the ball and turns speed into height.',
    oneSentence:
      'Clay is slower because its loose, gritty surface has high friction, which removes forward speed from the ball on impact and converts part of it into a higher bounce.',
    howItPlays:
      'When a ball lands, it is briefly in contact with the ground and friction acts on it. On a low-friction surface such as grass, little speed is removed and the ball skids on. On clay, the loose granular layer grips it.\n\nTwo things follow. The ball leaves the bounce **slower**, and because friction acts on the bottom of a spinning ball, more of its energy goes **upward**. So clay is not merely slow: it is slow and high, and the two effects arrive together.\n\nTopspin amplifies both. A heavily spun ball grips the surface more, so the same shot that bounces comfortably on grass jumps above shoulder height on clay.',
    whyItMatters:
      'This single mechanism explains almost every clay-court tactic: why rallies are longer, why topspin dominates, why one-handed backhands struggle, why flat hitters lose their weapon, and why the drop shot works against opponents standing five metres behind the baseline.',
    related: [
      'clay-courts',
      'surface-and-bounce',
      'topspin',
      'why-grass-plays-differently',
      'ball-bounce',
    ],
  }),

  surface({
    slug: 'why-grass-plays-differently',
    title: 'Why Grass Plays Differently',
    category: 'surfaces',
    order: 60,
    difficulty: 'intermediate',
    summary: 'Low friction, a soft surface and a court that changes under the players’ feet.',
    oneSentence:
      'Grass keeps the ball fast and low because it has little friction, and it is unpredictable because it is a living surface that wears during a tournament.',
    howItPlays:
      '**Low friction** means the ball keeps most of its speed through the bounce and does not rise much: it skids through at roughly the height it arrived.\n\n**Softness** means the surface deforms slightly on impact, absorbing some energy, but not in a way that lifts the ball.\n\n**Wear** is the property no other surface has. Grass is worn away by play, most heavily behind the baselines and around the service boxes, so by the end of a fortnight the ball is landing on bare, compacted ground in exactly the places it lands most often. The bounce there differs from the bounce on intact grass a metre away.\n\nMoisture matters too. Grass in the morning or after rain is slower and more slippery than the same court in the afternoon.',
    whyItMatters:
      'The combination rewards a specific set of skills: the serve, because a fast low ball is hard to return; the slice, because a low ball goes lower; taking the ball early, because waiting means letting it skid past.\n\nIt also punishes anticipation. Points are decided by reaction more than on any other surface, which is part of why the grass season produces such variable results.',
    related: ['grass-courts', 'why-clay-is-slower', 'slice', 'flat-serve', 'surface-and-bounce'],
  }),

  surface({
    slug: 'surface-and-bounce',
    title: 'How Surface Changes Ball Bounce',
    category: 'surfaces',
    order: 70,
    difficulty: 'intermediate',
    summary: 'Height and speed after the bounce, and how they trade off against each other.',
    oneSentence:
      'The surface determines how much speed a ball loses at the bounce and how much of that speed becomes height, and the two are linked.',
    howItPlays:
      'The bounce is where the surface acts on the ball, and it does two things at once.\n\n**Speed lost.** High-friction surfaces remove more forward speed. Ordering from most to least: clay, then most hard courts, then grass.\n\n**Height gained.** The same friction acts on a topspinning ball to lift it, so high-friction surfaces produce higher bounces. The ordering is the same.\n\nThat is why "slow" and "high-bouncing" describe the same property. A surface cannot be slow and low, or fast and high, by very much: both come from the same friction.\n\nIncoming spin changes the outcome on any surface. Topspin bounces higher and slice bounces lower, and both effects are exaggerated on high-friction surfaces and muted on low-friction ones.',
    whyItMatters:
      'Strike zone is what a player actually experiences. A ball at hip height is comfortable for everybody; the same shot arriving at shoulder height is comfortable for a two-hander and awkward for a one-hander, and that is a surface effect rather than a shot effect.',
    related: [
      'ball-bounce',
      'why-clay-is-slower',
      'topspin',
      'slice',
      'one-handed-vs-two-handed-backhand',
    ],
  }),

  surface({
    slug: 'surface-and-movement',
    title: 'How Surface Changes Movement',
    category: 'surfaces',
    order: 80,
    difficulty: 'intermediate',
    summary: 'Sliding against planting, and what each does to defence.',
    oneSentence:
      'On clay players slide into shots, on grass and hard courts they mostly plant and push, and the difference changes how much court can be defended.',
    howItPlays:
      '**Sliding**, on clay, lets a player continue moving into the shot while striking it, which extends reach by a substantial margin and allows a controlled recovery out of the slide. It also reduces the impact of stopping, which is why clay is easier on the body.\n\n**Planting**, on hard courts, requires the player to decelerate, stop and push off. That is harder on the joints, gives less reach, and demands more precise footwork because there is no sliding adjustment available for a slight misjudgement.\n\n**Grass** requires low, short steps and a wider base, because the surface is slippery and the ball stays low. Movement there is about staying balanced rather than covering distance.',
    whyItMatters:
      'Reach determines what can be defended, and defence determines rally length. It is why the same defensive player is far more effective on clay than on grass, without their skills having changed at all.',
    related: [
      'clay-courts',
      'grass-courts',
      'tennis-shoes-by-surface',
      'clay-court-shoes',
      'defensive-player',
    ],
  }),

  surface({
    slug: 'surface-and-serve',
    title: 'How Surface Affects the Serve',
    category: 'surfaces',
    order: 90,
    difficulty: 'intermediate',
    summary: 'Fast low surfaces make the serve a weapon; slow high ones make it an opening move.',
    oneSentence:
      'A low-friction surface preserves the serve’s speed and keeps the bounce low, making it far harder to return, while a high-friction surface slows it and lifts it into the returner’s strike zone.',
    howItPlays:
      '**On grass**, the serve keeps its speed and stays low. The returner has less time and has to hit up from below their comfortable height, which is why ace counts and hold percentages are highest here.\n\n**On clay**, the same serve arrives slower and higher. The returner has time to set up and meets it in the strike zone, which is why hold percentages are lowest on clay and why break-heavy matches are a clay phenomenon.\n\n**The kick serve reverses the pattern.** Its whole effect depends on the surface gripping the spin, so a kick serve is at its most dangerous on clay and least effective on grass, where the bounce stays low regardless.',
    whyItMatters:
      'It is why the same player’s hold percentage can vary by ten points or more across surfaces, and why a big server’s ranking is built almost entirely on the hard-court and grass parts of the calendar.',
    related: [
      'kick-serve',
      'flat-serve',
      'hold-percentage',
      'grass-courts',
      'clay-courts',
      'big-server',
    ],
  }),

  surface({
    slug: 'surface-dominance',
    title: 'Why Some Players Dominate Certain Surfaces',
    category: 'surfaces',
    order: 100,
    difficulty: 'intermediate',
    summary: 'Because a surface amplifies some strengths and cancels others.',
    oneSentence:
      'A player dominates a surface when that surface amplifies what they do best and suppresses what their opponents do best.',
    howItPlays:
      'Surfaces do not make players better; they change how much each skill is worth.\n\n**Heavy topspin** is worth far more on clay, where the surface converts spin into an unplayable bounce, than on grass, where the low bounce cancels it.\n\n**A big flat serve** is worth far more on grass than on clay, where the surface removes its speed.\n\n**Elite movement** is worth more on clay, where sliding extends its advantage and rallies are long enough for it to matter.\n\n**Taking the ball early** is worth more on fast surfaces, where the reward for stealing time is greatest.\n\nA player whose main strength is amplified by a surface, and whose main weakness is hidden by it, will have a record on that surface that looks like a different player’s.',
    whyItMatters:
      'It explains records that otherwise look impossible, and it explains why comparing players across surfaces requires adjustment rather than arithmetic.',
    related: [
      'surface-specialist',
      'surface-adjusted-performance',
      'clay-courts',
      'grass-courts',
      'why-all-four-majors-is-hard',
    ],
  }),

  definition({
    slug: 'surface-specialist',
    title: 'What Is a Surface Specialist?',
    category: 'surfaces',
    alsoIn: ['glossary'],
    order: 110,
    difficulty: 'intermediate',
    summary: 'A player whose results are concentrated on one surface.',
    oneSentence:
      'A surface specialist is a player whose results on one surface are much better than their results on the others.',
    explanation:
      'The label describes a distribution of results rather than a deliberate choice. It usually arises because a player’s game has one dominant characteristic, which one surface rewards heavily and another neutralises.\n\nClay specialists are the most common, because clay is the most distinctive surface and the European clay season is long enough to build a ranking on.',
    example:
      'A player ranked outside the top fifty overall who reaches the second week at Roland-Garros most years, and rarely wins a match on grass, is a clay-court specialist by results whether or not anybody planned it.',
    whyItMatters:
      'Specialists distort rankings in predictable ways. A clay specialist’s ranking peaks in June and declines through the autumn, and reading their ranking without knowing the season is misleading.',
    related: [
      'surface-dominance',
      'surface-adjusted-performance',
      'clay-courts',
      'the-tennis-season',
      'defending-points',
    ],
  }),

  surface({
    slug: 'indoor-vs-outdoor',
    title: 'Indoor vs Outdoor Tennis',
    category: 'surfaces',
    alsoIn: ['conditions'],
    order: 120,
    difficulty: 'intermediate',
    summary: 'Same surface, different sport: no wind, no sun, and consistent conditions all day.',
    oneSentence:
      'Indoor tennis removes wind, sun and changing weather, which makes conditions consistent and generally makes the court play faster.',
    howItPlays:
      '**No wind.** Nothing pushes the ball off line, so players can hit closer to the lines and the toss is reliable. Serving is significantly easier.\n\n**No sun.** No end of the court is worse than the other, and overheads are straightforward.\n\n**Consistent air.** Temperature and humidity are controlled, so the ball behaves the same in the first game as in the last.\n\n**Generally faster.** Indoor air is usually cooler and drier than a summer outdoor day, and indoor courts are often laid faster, which together favour servers and flat hitters.',
    whyItMatters:
      'The indoor season closes the year, and it changes who wins. Players whose games depend on conditions being predictable do better indoors, and players who rely on wind and heat to disrupt opponents lose that advantage.',
    whoItSuits:
      'Servers, flat hitters and players who take the ball early. Defensive players lose the help that wind, sun and heat give them against aggressive opponents.',
    related: [
      'indoor-vs-outdoor-conditions',
      'wind-in-tennis',
      'hard-courts',
      'the-tennis-season',
      'big-server',
    ],
  }),
];

/* ────────────────────────────────────────────────────────────────────────────
 * Equipment
 * ────────────────────────────────────────────────────────────────────────── */

const EQUIPMENT: ExplainerSeed[] = [
  equipment({
    slug: 'tennis-racket',
    title: 'Tennis Racket Explained',
    category: 'equipment',
    order: 10,
    difficulty: 'beginner',
    summary: 'The parts of a racket and the properties that actually change how it plays.',
    oneSentence:
      'A tennis racket is a strung frame whose head size, weight, balance and stiffness determine the trade-off between power, control and manoeuvrability.',
    whatItIs:
      'A racket has a **head**, containing the strung area; a **throat**, connecting head to handle; and a **grip**.\n\nFour properties describe how one plays:\n\n**Head size**, the area of the strung surface. Larger means more power and a bigger forgiving area; smaller means more control.\n\n**Weight**, which sets how much force the racket brings to the ball and how quickly it can be swung.\n\n**Balance**, whether the mass sits towards the head or the handle. Head-heavy rackets hit harder and swing slower.\n\n**Stiffness**, how much the frame flexes. Stiffer frames return more energy to the ball and transmit more shock to the arm.\n\nThe frame is only half the instrument. The strings and their tension change how a given racket plays as much as the frame does.',
    whyItMatters:
      'Every property is a trade-off rather than an improvement. There is no setting that adds power without costing control, or manoeuvrability without costing stability, which is why professionals’ rackets differ so much from each other.',
    misunderstandings:
      '**"Professionals use the racket sold in shops."** Generally not. Professional frames are frequently customised in weight, balance and grip, sometimes to a specification quite different from the retail model they are painted as.',
    related: ['racket-head-size', 'racket-weight', 'tennis-strings', 'string-tension', 'overgrips'],
    ...RULES,
  }),

  equipment({
    slug: 'racket-head-size',
    title: 'Racket Head Size',
    category: 'equipment',
    order: 20,
    difficulty: 'intermediate',
    summary: 'Bigger heads give power and forgiveness; smaller heads give control.',
    oneSentence:
      'Head size is the area of the strung surface, and a larger head produces more power and a larger forgiving area at the cost of precision.',
    whatItIs:
      'Measured in square inches or square centimetres. Professional frames tend towards the smaller end of the range and recreational frames towards the larger.\n\nA larger head has longer main strings, which stretch further on impact and return more energy to the ball. It also puts more strung area further from the centre, so off-centre hits are less punishing.',
    advantages:
      'More power for the same swing, a larger forgiving area, and generally easier access to spin because the longer strings move more.',
    risks:
      'Less precise feedback and less control on full swings, and a larger head increases air resistance and twisting on off-centre hits, which makes the racket feel less stable against pace.',
    misunderstandings:
      '**"Professionals use small heads because small is better."** They use frames suited to swinging fast at full commitment. A player who does not generate their own pace gets more from a larger head, and that is a genuine difference in requirement rather than in standard.',
    related: ['tennis-racket', 'racket-weight', 'string-tension', 'why-string-setups-differ'],
  }),

  equipment({
    slug: 'racket-weight',
    title: 'Racket Weight',
    category: 'equipment',
    order: 30,
    difficulty: 'intermediate',
    summary: 'Heavier means more stability and power; lighter means faster swings.',
    oneSentence:
      'Racket weight sets how much mass meets the ball and how quickly the racket can be moved, and the two pull in opposite directions.',
    whatItIs:
      'Measured strung or unstrung, and usually reported with the **balance point**, because where the weight sits matters as much as how much there is.\n\nA heavier racket carries more momentum into the ball and is less disturbed by a heavy incoming shot. A lighter one can be swung faster and repositioned more quickly, which matters at the net and on the return.',
    advantages:
      'Weight gives stability against pace, more plough-through on groundstrokes and less shock transmitted to the arm, because the frame absorbs rather than being knocked about.',
    risks:
      'A racket too heavy for the player slows the swing, which costs both power and spin, and it becomes a liability in fast exchanges at the net. It is also more tiring over five sets.',
    misunderstandings:
      '**"Lighter rackets are easier on the arm."** Often the reverse. A light frame is deflected more on impact and transmits more shock, which is why arm problems are not solved simply by going lighter.',
    related: ['tennis-racket', 'racket-head-size', 'string-tension', 'volley'],
  }),

  equipment({
    slug: 'string-tension',
    title: 'String Tension',
    category: 'equipment',
    order: 40,
    difficulty: 'intermediate',
    summary: 'How tightly the strings are pulled: lower for power, higher for control.',
    oneSentence:
      'String tension is how tightly the strings are strung, with lower tension giving more power and higher tension giving more control.',
    whatItIs:
      'Measured in kilograms or pounds, and set when the racket is strung.\n\n**Lower tension** lets the string bed deform more on impact and act more like a trampoline, returning more energy to the ball. That means more power and a softer feel.\n\n**Higher tension** deforms less, so less energy is returned and the ball comes off with more control and a firmer feel.\n\nTension is not fixed over time. Strings lose tension from the moment they are strung, which is why professionals restring constantly and why a racket strung a month ago plays differently from the same racket strung yesterday.',
    advantages:
      'Adjusting tension is the cheapest and fastest way to change how a racket plays, and professionals adjust it for conditions: higher in heat and at altitude, where the ball flies further, and lower in cold and damp.',
    risks:
      'Very high tension reduces the forgiving area and transmits more shock to the arm. Very low tension can make control unreliable, particularly on full swings.',
    misunderstandings:
      '**"Tighter strings give more power."** The opposite, within the range players use. Tighter strings return less energy to the ball.',
    related: [
      'tennis-strings',
      'why-string-setups-differ',
      'tennis-racket',
      'altitude-in-tennis',
      'heat-in-tennis',
    ],
  }),

  equipment({
    slug: 'tennis-strings',
    title: 'Tennis Strings Explained',
    category: 'equipment',
    order: 50,
    difficulty: 'intermediate',
    summary: 'Natural gut, polyester and multifilament, and what each is actually for.',
    oneSentence:
      'Tennis strings come in several materials whose differences in elasticity and surface determine power, spin, comfort and durability.',
    whatItIs:
      '**Natural gut** is made from animal intestine. It is the most elastic and the most comfortable, holds tension best, and is expensive and vulnerable to moisture.\n\n**Polyester**, often called poly, is stiff and low-powered, with a surface that lets the strings slide and snap back, which generates spin. It is durable against abrasion but loses tension quickly and is harsh on the arm.\n\n**Multifilament** strings are made of many fine fibres bundled together to imitate gut’s comfort at lower cost, with less durability.\n\n**Hybrid** stringing uses one material for the main strings and another for the crosses, most commonly to combine gut’s comfort with polyester’s spin and durability.',
    whyItMatters:
      'The shift to polyester strings is one of the two technological changes that reshaped modern tennis, alongside frame materials. Poly let players swing at full speed with extreme topspin and still keep the ball in, which is a large part of why the baseline game displaced serve-and-volley.',
    risks:
      'Polyester’s stiffness is associated with arm and elbow problems, particularly at high tension, and it loses playable tension well before it breaks, which means a string that looks fine may already be playing badly.',
    related: [
      'string-tension',
      'why-string-setups-differ',
      'topspin',
      'serve-and-volley',
      'tennis-racket',
    ],
  }),

  equipment({
    slug: 'why-string-setups-differ',
    title: 'Why Players Use Different String Setups',
    category: 'equipment',
    order: 60,
    difficulty: 'advanced',
    summary: 'Because a setup is chosen for a swing, a surface and a set of conditions.',
    oneSentence:
      'String choice and tension are matched to how a player swings, what they need from the ball and the conditions they are playing in.',
    whatItIs:
      'Three factors drive the choice.\n\n**Swing speed.** A player who swings very fast needs a string bed that does not add power, because they are already generating enough: polyester at higher tension. A player who does not generate their own pace needs the opposite.\n\n**What they want from the ball.** Heavy topspin favours polyester, whose sliding and snapping back grips the ball. Comfort and touch favour gut or multifilament.\n\n**Conditions.** Heat, altitude and thin air make the ball fly, so players raise tension. Cold, damp and heavy balls do the reverse.\n\nHybrid setups exist because these requirements conflict, and using different materials for mains and crosses is a way of getting part of each.',
    whyItMatters:
      'It explains why professionals restring several rackets per match and why they carry rackets at different tensions: the setup is a variable they adjust during a tournament as conditions change, not a fixed preference.',
    misunderstandings:
      '**"There is a best setup."** There is a best setup for a given player, swing and day. Copying a professional’s string and tension without their swing speed generally produces a racket that is uncomfortable and underpowered.',
    related: [
      'tennis-strings',
      'string-tension',
      'altitude-in-tennis',
      'heat-in-tennis',
      'topspin',
    ],
  }),

  equipment({
    slug: 'tennis-balls',
    title: 'Tennis Balls Explained',
    category: 'equipment',
    order: 70,
    difficulty: 'beginner',
    summary:
      'Pressurised rubber under felt, and why the type is chosen for the surface and the altitude.',
    oneSentence:
      'A tennis ball is a pressurised hollow rubber core covered in felt, manufactured to a specification with different types for different surfaces and altitudes.',
    whatItIs:
      'The **core** is rubber, and in the standard ball it is pressurised, which is what gives the bounce. The **felt** covering controls how the ball moves through the air and how it grips the court.\n\nThe felt is not cosmetic. A fluffier ball has more air resistance, so it flies slower and shorter; a ball whose felt has been worn flat travels faster.\n\nThe Rules of Tennis specify size, weight, bounce and deformation, and approve several ball types. Different types are used for different surfaces, and a specific type exists for high altitude, where the standard ball flies too far.',
    whyItMatters:
      'The ball is a bigger variable than spectators assume. The same match played with a different approved ball can have noticeably different rally lengths, and disagreements between players and tournaments about ball choice are a recurring professional complaint.',
    related: [
      'why-balls-are-changed',
      'ball-bounce',
      'altitude-in-tennis',
      'why-balls-fly-at-altitude',
      'tennis-court-surfaces',
    ],
    ...RULES,
  }),

  equipment({
    slug: 'why-balls-are-changed',
    title: 'Why Tennis Balls Are Changed During Matches',
    category: 'equipment',
    order: 80,
    difficulty: 'beginner',
    summary: 'Because a worn ball plays differently, and both players should face the same one.',
    oneSentence:
      'Balls are replaced at fixed intervals because they lose pressure and their felt wears, which changes speed and bounce enough to affect the match.',
    whatItIs:
      'New balls are introduced at a defined interval, counted in games. The first change comes after fewer games than subsequent ones, because the balls used for the warm-up have already been struck.\n\nWhat changes as balls age: they lose internal pressure and bounce lower, and the felt fluffs up, which increases air resistance and slows the ball through the air.\n\nThe practical consequence is that new balls are **faster**, which favours the server, and old balls are slower and easier to control, which favours the returner and lengthens rallies.',
    whyItMatters:
      'Players plan around it. The game after new balls is a good one to serve, and a returner is more likely to press in the games before a change. Watching who is serving when new balls arrive is a real tactical detail.',
    advantages:
      'Fixed intervals mean both players face new balls equally often, which is the fairness argument for the rule.',
    related: [
      'tennis-balls',
      'ball-bounce',
      'adapting-during-a-match',
      'first-serve-vs-second-serve',
    ],
    ...RULES,
  }),

  equipment({
    slug: 'tennis-shoes-by-surface',
    title: 'Tennis Shoes by Surface',
    category: 'equipment',
    order: 90,
    difficulty: 'beginner',
    summary: 'Different outsoles for different grounds, because movement differs by surface.',
    oneSentence:
      'Tennis shoes are built with surface-specific outsoles, because sliding on clay, gripping on hard courts and staying stable on grass require different things.',
    whatItIs:
      '**Hard-court shoes** have durable outsoles with a herringbone or modified pattern and substantial cushioning, because hard courts are abrasive and unforgiving.\n\n**Clay-court shoes** have a full herringbone pattern designed to grip enough to push off while still allowing a controlled slide, and a tighter tread that sheds clay rather than packing it in.\n\n**Grass-court shoes** traditionally use small nubs or pimples for grip on a slippery living surface, and are usually not permitted on other courts because of the damage they would do.\n\nMany tournaments and clubs restrict which soles may be worn on their courts, particularly on grass and clay, where the wrong sole damages the surface.',
    whyItMatters:
      'Footwear is genuinely surface-specific rather than a matter of preference. A hard-court sole on clay packs with material and stops gripping; a clay sole on a hard court wears through quickly.',
    related: ['clay-court-shoes', 'surface-and-movement', 'clay-courts', 'grass-courts'],
  }),

  equipment({
    slug: 'clay-court-shoes',
    title: 'Why Clay-Court Shoes Are Different',
    category: 'equipment',
    order: 100,
    difficulty: 'intermediate',
    summary: 'Because sliding is a technique, and the sole has to permit it without losing grip.',
    oneSentence:
      'Clay-court shoes use a full herringbone tread that grips enough to push off while allowing a controlled slide, and that sheds clay instead of clogging with it.',
    whatItIs:
      'The **full herringbone** pattern runs across the whole outsole. The zigzag provides bite in every direction, which is what lets a player stop a slide and change direction, while the shallow, closely spaced tread lets the shoe slide rather than catching.\n\nThe tread is also designed to **release** clay. A deep, widely spaced pattern would pack with material within a few games and become a smooth sole, which is exactly what happens when a hard-court shoe is worn on clay.\n\nThe uppers are usually tighter and more supportive, because sliding puts lateral stress on the foot that planting does not.',
    whyItMatters:
      'Sliding is not incidental on clay: it is how the court is covered. A shoe that cannot slide controllably makes a player slower on clay regardless of their fitness.',
    related: ['tennis-shoes-by-surface', 'surface-and-movement', 'clay-courts'],
  }),

  equipment({
    slug: 'overgrips',
    title: 'Overgrips Explained',
    category: 'equipment',
    order: 110,
    difficulty: 'beginner',
    summary:
      'A thin replaceable wrap over the handle, changed constantly because sweat ruins grip.',
    oneSentence:
      'An overgrip is a thin replaceable layer wrapped over a racket’s existing grip to improve tackiness and absorb sweat.',
    whatItIs:
      'The racket comes with a **base grip**, which is thicker and is rarely replaced. The **overgrip** goes over it, is much thinner, and is designed to be changed frequently.\n\nTwo broad types: tacky overgrips, which stick to the hand, and absorbent ones, which soak up moisture. Which is better depends on the player and the humidity.\n\nProfessionals change overgrips several times per match, often at changeovers, because a wet grip slips and a slipping racket changes the shot.',
    whyItMatters:
      'It is the cheapest piece of equipment in the sport and the one that fails most quickly. It also changes the handle’s size slightly, which is why some players use several layers to reach a grip thickness they cannot buy.',
    related: ['tennis-racket', 'humidity-in-tennis', 'heat-in-tennis'],
  }),
];

/* ────────────────────────────────────────────────────────────────────────────
 * Conditions & physics
 * ────────────────────────────────────────────────────────────────────────── */

const CONDITIONS: ExplainerSeed[] = [
  article({
    slug: 'wind-in-tennis',
    title: 'How Wind Affects Tennis',
    category: 'conditions',
    order: 10,
    difficulty: 'intermediate',
    summary: 'The most disruptive condition in the sport, and the one players hate most.',
    oneSentence:
      'Wind changes the flight of every ball and the toss on every serve, and because ends are swapped, both players get the good end and the bad one.',
    explanation:
      'A tennis ball is light and travels slowly enough that wind moves it noticeably. The effect is largest on the shots with the most air time: the serve toss, the lob and any high defensive ball.',
    howItWorks:
      '**Into the wind**, the ball is slowed and drops shorter, so players hit with more depth and the surface effectively plays slower. Topspin dips more sharply.\n\n**With the wind**, the ball carries, and shots that would have landed in go long. Players hit with more margin and more spin.\n\n**Crosswind** is the hardest. Every ball drifts sideways, so aiming down the line means aiming somewhere else, and the serve toss drifts away from the player.\n\n**The toss** is where wind hurts most. It is the one moment a player releases the ball with no control over it, which is why double faults rise in wind and why some players resort to a lower toss.',
    example:
      'A player serving into the wind may hit a flatter, harder serve because the wind is providing the braking that spin usually would, and then serve differently after changing ends.',
    whyItMatters:
      'Wind rewards the more adaptable player rather than the better one, which is why upsets cluster on windy days. Playing well in wind is a skill in its own right: lower toss, more margin, more spin, and accepting that some shots will simply misbehave.',
    related: ['changing-ends', 'lob', 'indoor-vs-outdoor', 'adapting-during-a-match', 'the-serve'],
  }),

  article({
    slug: 'heat-in-tennis',
    title: 'How Heat Affects Tennis',
    category: 'conditions',
    order: 20,
    difficulty: 'intermediate',
    summary: 'The ball flies further, the court gets faster, and the players suffer.',
    oneSentence:
      'Heat makes air less dense and balls more lively, so the ball travels further and faster, while placing severe physical demands on the players.',
    explanation:
      'Two separate effects: what heat does to the ball and the air, and what it does to the people.',
    howItWorks:
      '**Air density.** Warm air is less dense, so it offers less resistance. The ball travels further and faster for the same shot, which is why players string tighter in heat.\n\n**The ball itself.** A warm ball is more elastic and bounces higher and faster off the court. Balls stored in the sun play noticeably differently from balls in the shade.\n\n**The court.** Hard courts absorb heat and can reach temperatures far above the air temperature, which affects both the bounce and the players’ feet.\n\n**The players.** Extreme heat is a genuine medical risk, not merely a discomfort, and both tours and the majors operate heat rules that can permit extended breaks or suspend play. Best-of-five in extreme heat is one of the most physically demanding events in professional sport.',
    whyItMatters:
      'Heat policies differ by competition and are among the rules most often revised, so what happens on a very hot day is a property of the tournament rather than of the sport.',
    related: [
      'temperature-and-ball-speed',
      'humidity-in-tennis',
      'string-tension',
      'medical-timeouts',
      'tennis-balls',
    ],
  }),

  article({
    slug: 'humidity-in-tennis',
    title: 'How Humidity Affects Tennis',
    category: 'conditions',
    order: 30,
    difficulty: 'advanced',
    summary: 'Heavy balls, slippery grips, and a much harder time cooling down.',
    oneSentence:
      'High humidity makes balls heavier and slower, makes grips and courts slippery, and severely reduces the body’s ability to cool itself.',
    explanation:
      'Humidity acts on the equipment and on the players, and the second effect is the larger one.',
    howItWorks:
      '**The balls.** Felt absorbs moisture, so balls become heavier and fluffier in humid air. They fly slower and shorter, which lengthens rallies and reduces the serve’s advantage.\n\n**The court.** Humid conditions leave moisture on the surface, which slows a hard court and makes grass genuinely slippery. Play on grass is often suspended for exactly this reason.\n\n**Grip.** Sweating hands and damp overgrips slip, which is why professionals change overgrips repeatedly in humid conditions.\n\n**The body.** Sweat cools by evaporating, and in humid air it evaporates poorly. That is why humid heat is far more dangerous than dry heat at the same temperature, and it is the physiological reason night sessions exist at some tournaments.',
    whyItMatters:
      'A humid evening and a dry afternoon at the same tournament produce measurably different tennis, and players scheduled into one or the other are not playing quite the same event.',
    related: ['heat-in-tennis', 'day-vs-night-tennis', 'overgrips', 'tennis-balls', 'grass-courts'],
  }),

  article({
    slug: 'altitude-in-tennis',
    title: 'Altitude and Tennis',
    category: 'conditions',
    order: 40,
    difficulty: 'advanced',
    summary: 'Thin air, a ball that flies, and a completely different match.',
    oneSentence:
      'At altitude the air is thinner, so the ball travels faster and further and spin has less effect, which makes serving dominant and defence much harder.',
    explanation:
      'Air resistance is what slows a tennis ball and what makes spin work. Reduce the air and you reduce both.',
    howItWorks:
      '**The ball flies.** Less drag means it retains more speed and travels further, so shots that would land in at sea level go long.\n\n**Spin does less.** Topspin dips the ball because the spinning ball interacts with the air. In thinner air that interaction is weaker, so the same topspin produces less dip and less safety margin.\n\n**Serving is dominant.** A fast serve stays fast, and second serves lose the spin-based margin they depend on. Hold percentages rise noticeably.\n\n**Adjustments.** Players string tighter to reduce power, hit with more spin to compensate for its reduced effect, and take more margin over the net. Special high-altitude balls with different pressure characteristics exist and are used at some venues.',
    whyItMatters:
      'Altitude tournaments produce results that look anomalous, and the anomaly is real: the same players are playing a genuinely different game, with defence devalued and serving amplified.',
    related: [
      'why-balls-fly-at-altitude',
      'string-tension',
      'tennis-balls',
      'why-topspin-dips',
      'surface-and-serve',
    ],
  }),

  article({
    slug: 'why-balls-fly-at-altitude',
    title: 'Why Tennis Balls Fly Faster at Altitude',
    category: 'conditions',
    order: 50,
    difficulty: 'advanced',
    summary: 'Because there is less air to push against the ball.',
    oneSentence:
      'Air density falls with altitude, and since drag is proportional to air density, a ball at altitude is slowed far less on its way through the air.',
    explanation:
      'The mechanism is a single physical relationship applied to a light, slow-moving object.',
    howItWorks:
      'A ball in flight experiences **drag**, a backwards force proportional to the density of the air it is passing through. Thinner air means less drag.\n\nA tennis ball is unusually sensitive to this because it is light and fuzzy: the felt gives it a high drag coefficient relative to its mass, so drag is a large part of what governs its flight. A denser, smoother projectile would be less affected.\n\nThe **Magnus effect**, which is what makes a spinning ball curve and dip, also depends on air density. Thinner air weakens it, so topspin provides less of the downward force players rely on to bring the ball into the court.\n\nBoth effects push the same way: the ball goes further, and the usual method of stopping it going further works less well.',
    whyItMatters:
      'It is the clearest example in tennis of physics rather than skill determining how a match plays, and it explains why the adjustments players make at altitude (tighter strings, more spin, more net clearance) are all attempts to replace something the air is no longer doing.',
    related: [
      'altitude-in-tennis',
      'why-topspin-dips',
      'topspin',
      'tennis-balls',
      'string-tension',
    ],
  }),

  article({
    slug: 'indoor-vs-outdoor-conditions',
    title: 'Indoor vs Outdoor Conditions',
    category: 'conditions',
    order: 60,
    difficulty: 'intermediate',
    summary: 'Removing the weather removes a whole category of tennis problem.',
    oneSentence:
      'Indoor conditions are constant: no wind, no sun, no changing temperature, which makes the tennis more predictable and generally faster.',
    explanation:
      'The list of what indoor tennis removes is short and consequential: wind, sun, rain, and the drift in temperature and humidity across a day.',
    howItWorks:
      '**Serving improves** for everybody, because the toss is reliable and nothing moves the ball. First-serve percentages and hold rates rise.\n\n**Aiming improves.** Players hit closer to the lines when nothing is pushing the ball off course.\n\n**Conditions do not drift.** A match starting at eleven in the morning and one starting at nine at night play the same, which is not true outdoors.\n\n**The court is often faster**, because indoor air is usually cooler and drier and indoor surfaces tend to be laid quicker.\n\n**Lighting** replaces the sun, which removes the one-sided disadvantage of an overhead into the light.',
    whyItMatters:
      'The indoor season closes the year and is where several season-defining events are held, and the shift in conditions changes who wins. A player whose game depends on disrupting opponents loses their best ally when the weather is switched off.',
    related: ['indoor-vs-outdoor', 'wind-in-tennis', 'day-vs-night-tennis', 'the-tennis-season'],
  }),

  article({
    slug: 'day-vs-night-tennis',
    title: 'Day vs Night Tennis',
    category: 'conditions',
    order: 70,
    difficulty: 'intermediate',
    summary:
      'Cooler, heavier, slower, and under lights: the same court plays differently after dark.',
    oneSentence:
      'Night matches are played in cooler, denser air under artificial light, which slows the ball and lengthens rallies compared with the same court in the afternoon.',
    explanation:
      'The change is mostly about air temperature, with lighting and moisture as secondary effects.',
    howItWorks:
      '**Cooler air is denser**, so it offers more resistance. The ball travels more slowly and drops shorter, and the court plays slower.\n\n**The ball is cooler** too, and a cooler ball is less lively off the court.\n\n**Moisture** settles as temperatures fall, which slows a hard court further and can make grass unplayable.\n\n**Lighting** is even, which removes the sun problem but introduces its own: judging a high ball under lights is different, and some players find overheads harder at night.\n\nThe practical result is that servers do better in the day and rallies are longer at night, which is why scheduling a match into a day or a night session is itself a competitive factor.',
    whyItMatters:
      'Night sessions exist for broadcast and heat reasons, and their effect on the tennis is a side-effect that players and tournaments both take seriously. A player who wins consistently in one session and not the other is not necessarily imagining it.',
    related: [
      'temperature-and-ball-speed',
      'heat-in-tennis',
      'humidity-in-tennis',
      'indoor-vs-outdoor-conditions',
    ],
  }),

  article({
    slug: 'temperature-and-ball-speed',
    title: 'How Temperature Changes Ball Speed',
    category: 'conditions',
    order: 80,
    difficulty: 'advanced',
    summary: 'Warm air is thinner and warm rubber is livelier, and both make the ball faster.',
    oneSentence:
      'Higher temperatures make the air less dense and the ball’s rubber more elastic, so the ball flies further and bounces higher and faster.',
    explanation: 'Two mechanisms, and they reinforce each other rather than cancelling out.',
    howItWorks:
      '**Air density.** Warm air is less dense, so drag is lower and the ball keeps more of its speed. This is the same mechanism as altitude, operating over a smaller range.\n\n**Ball elasticity.** The rubber core is more elastic when warm, so more of the energy of impact is returned. A warm ball bounces higher and comes off the strings faster. This is why balls stored in direct sun play differently, and why the felt on a cold ball feels dead.\n\n**Internal pressure.** Gas pressure inside a pressurised ball rises slightly with temperature, which adds to the effect.\n\nThe cumulative difference between a cold morning and a hot afternoon at the same venue is large enough that players change string tension between sessions.',
    whyItMatters:
      'It explains why a court is described as playing quick or slow on a given day without anything about the court having changed, and it is one of the reasons professional players carry rackets strung at several tensions.',
    related: [
      'heat-in-tennis',
      'day-vs-night-tennis',
      'string-tension',
      'ball-bounce',
      'tennis-balls',
    ],
  }),

  article({
    slug: 'why-topspin-dips',
    title: 'Why Topspin Makes the Ball Dip',
    category: 'conditions',
    alsoIn: ['shots'],
    order: 90,
    difficulty: 'advanced',
    summary:
      'The Magnus effect: a spinning ball drags air around itself and gets pushed downwards.',
    oneSentence:
      'A ball with topspin drags air faster over its bottom surface than its top, and the resulting pressure difference pushes it downwards.',
    explanation:
      'This is the Magnus effect, and it is the single physical principle that makes modern baseline tennis possible.',
    howItWorks:
      'A ball with topspin is rotating forwards: its top surface moves backwards relative to the direction of travel and its bottom surface moves forwards.\n\nThe fuzzy felt drags a thin layer of air around with the ball as it spins. On the bottom, that dragged air moves in the same direction as the airflow past the ball, so it speeds the air up. On the top, it opposes the airflow and slows it down.\n\nFaster-moving air exerts less pressure. So there is lower pressure beneath the ball and higher pressure above it, and the net force pushes the ball **down**.\n\nThat is why a heavily topspun ball can be hit much harder and much higher over the net and still land in: the spin is actively pulling it down inside the baseline.\n\nThe same spin also makes the ball bounce higher, because the forward rotation grips the court on impact and converts into upward motion.',
    whyItMatters:
      'Every modern groundstroke depends on this. The combination of polyester strings and heavy topspin is what allows professionals to swing at full speed from behind the baseline, and it is the mechanism behind the whole aggressive baseline era.',
    related: [
      'topspin',
      'why-slice-stays-low',
      'why-balls-fly-at-altitude',
      'kick-serve',
      'tennis-strings',
    ],
  }),

  article({
    slug: 'why-slice-stays-low',
    title: 'Why Slice Stays Low',
    category: 'conditions',
    alsoIn: ['shots'],
    order: 100,
    difficulty: 'advanced',
    summary: 'Backspin lifts the ball in flight and kills its bounce on landing.',
    oneSentence:
      'Backspin produces an upward Magnus force that keeps the ball in the air longer and flatter, and on landing the backward rotation fights the bounce so the ball skids low.',
    explanation:
      'Slice is topspin’s mirror image, and the physics runs in the opposite direction at both stages of the ball’s journey.',
    howItWorks:
      '**In flight.** With backspin, the ball’s top surface moves forwards and its bottom backwards. The pressure difference reverses, so the Magnus force points **upwards**. The ball resists gravity slightly, floats, and travels on a flatter trajectory than an unspun ball.\n\n**On the bounce.** The ball arrives rotating backwards. Friction with the court acts against that rotation and against the ball’s forward motion, so instead of gripping and rising, the ball skids forward low. On a low-friction surface such as grass, where there is little friction to convert anything into height, this is exaggerated and the ball stays very low indeed.\n\nThe two effects are what make slice tactically distinct: it takes longer to arrive, giving the hitter time to recover, and it forces the opponent to hit up from below net height.',
    whyItMatters:
      'It explains why slice is a grass-court staple and why a sliced approach shot is aggressive rather than defensive: a ball the opponent must lift is a ball that can be volleyed downwards.',
    related: ['slice', 'why-topspin-dips', 'grass-courts', 'approach-shot', 'surface-and-bounce'],
  }),

  article({
    slug: 'ball-bounce',
    title: 'Tennis Ball Bounce Explained',
    category: 'conditions',
    order: 110,
    difficulty: 'intermediate',
    summary: 'What happens in the few milliseconds the ball is touching the court.',
    oneSentence:
      'A bounce is a brief compression against the court in which the ball loses some energy, has some forward speed converted by friction, and leaves at a new speed and angle.',
    explanation: 'Everything a surface does to the game happens in this contact.',
    howItWorks:
      '**Compression.** The ball flattens against the court and springs back. Some energy is lost as heat, which is why a bounce never returns the ball to its original height, and a warmer, better-pressurised ball loses less.\n\n**Friction.** The court acts on the bottom of the ball. On a high-friction surface it grips, which slows the ball’s forward motion and, if the ball is spinning forwards, converts rotation into upward motion. That is why clay is both slow and high.\n\n**Incoming spin** changes everything. Topspin bounces higher and kicks forward; backspin skids low and sometimes sits up short; sidespin bounces sideways.\n\n**Angle** matters too. A steeply descending ball bounces higher than a flat one arriving at the same speed, which is why a heavy topspin ball hit high over the net produces the most awkward bounce in tennis.',
    whyItMatters:
      'The bounce is where surface, spin, temperature and ball condition all meet. Every explainer in the surfaces and conditions categories is ultimately about this one moment.',
    related: [
      'surface-and-bounce',
      'why-clay-is-slower',
      'topspin',
      'slice',
      'temperature-and-ball-speed',
    ],
  }),
];

/* ────────────────────────────────────────────────────────────────────────────
 * Player careers
 * ────────────────────────────────────────────────────────────────────────── */

const CAREERS: ExplainerSeed[] = [
  article({
    slug: 'how-tennis-careers-work',
    title: 'How Professional Tennis Careers Work',
    category: 'careers',
    isStartHere: true,
    order: 10,
    difficulty: 'beginner',
    summary: 'Individual, unsalaried, self-funded, and governed entirely by a ranking.',
    oneSentence:
      'A professional tennis player is a self-employed individual whose income and access to tournaments both depend on a ranking they must continuously defend.',
    explanation:
      'There is no team, no contract and no salary. A player earns prize money by winning matches, pays their own costs from it, and can only enter the tournaments their ranking allows.',
    howItWorks:
      '**No salary.** Income is prize money, plus sponsorship for those who attract it. A player who loses in the first round earns first-round money and pays a week’s expenses out of it.\n\n**Costs are the player’s own.** Coaching, physiotherapy, travel, accommodation, stringing and entry logistics are all paid by the player, and a full support team is a substantial annual cost.\n\n**Access depends on ranking.** A ranking is not only a status: it determines which tournaments will accept an entry, which determines what can be earned.\n\n**The ranking must be defended continuously**, because it rolls over 52 weeks. A player cannot bank a good year.\n\n**Injury is uninsured** in the ordinary sense: an absence costs the ranking, which costs access, which costs income.',
    whyItMatters:
      'This structure explains most of what looks strange about professional tennis: why players compete injured, why the calendar is so relentless, and why the financial gap between the top hundred and the top thousand is so extreme.',
    related: [
      'the-tour-pathway',
      'lower-ranked-player-finances',
      'prize-money-vs-earnings',
      'protected-ranking',
      'ranking-cutoffs',
    ],
  }),

  article({
    slug: 'juniors-to-professional',
    title: 'Junior Tennis to Professional Tennis',
    category: 'careers',
    order: 20,
    difficulty: 'intermediate',
    summary:
      'A separate circuit with its own ranking, and a transition most juniors do not complete.',
    oneSentence:
      'Junior tennis has its own international circuit and ranking, and a strong junior record improves the odds of a professional career without guaranteeing one.',
    explanation:
      'The ITF runs a junior circuit culminating in junior events at the four majors, with its own world ranking.',
    howItWorks:
      '**The junior circuit** is age-restricted and organised in tiers, with a junior ranking that determines entry to the biggest junior events.\n\n**The transition** happens gradually. Players begin entering entry-level professional events while still competing as juniors, because professional points earned as a teenager count towards a professional ranking.\n\n**Age restrictions** limit how many professional tournaments a very young player may enter in a year. These rules exist because of a history of young players being over-scheduled and burning out, and they are among the sport’s more consequential welfare provisions.\n\n**The success rate is low.** The relationship between junior ranking and eventual professional ranking is positive and far from deterministic: many junior champions do not establish themselves, and many top professionals had unremarkable junior careers.',
    whyItMatters:
      'It is why a strong junior result should be read as an indication rather than a prediction, and why the age rules exist at all.',
    related: [
      'the-tour-pathway',
      'itf-world-tennis-tour',
      'how-tennis-careers-work',
      'entering-professional-tournaments',
    ],
  }),

  article({
    slug: 'the-tour-pathway',
    title: 'ITF to Challenger to ATP and WTA: the Pathway',
    category: 'careers',
    isFeatured: true,
    order: 30,
    difficulty: 'intermediate',
    summary: 'Three levels, each requiring a ranking earned at the one below.',
    oneSentence:
      'A player climbs from the ITF entry level to the second tier and then to the main tour, with each level’s entry requiring a ranking that can only be built at the level below.',
    explanation:
      'The pathway is a ladder where each rung must be earned by results on the rung beneath it.',
    howItWorks:
      '**Level one: ITF World Tennis Tour.** Where a player with no ranking starts, usually through qualifying. Points here build the first professional ranking.\n\n**Level two: Challenger Tour (men) or WTA 125 series (women).** Entered once a ranking is high enough. Larger points and prize money, and the level where a top-hundred ranking is built.\n\n**Level three: the main tour.** ATP 250/500/1000 or WTA 250/500/1000, plus qualifying at the majors. Entered directly once the ranking is high enough.\n\nProgress is not linear. A player moves between levels constantly, entering a Challenger one week and tour qualifying the next, according to what their current ranking gets them into.\n\n**The bottleneck is economic as much as sporting.** The prize money at level one does not cover the cost of competing there, so a player who takes several years to climb may run out of money before they run out of ability.',
    whyItMatters:
      'The structure explains why the ranking is the organising fact of a career, and why reforms to the entry level are argued about so intensely: shortening the ladder changes who can afford to climb it.',
    related: [
      'itf-world-tennis-tour',
      'atp-challenger-tour',
      'wta-125',
      'lower-ranked-player-finances',
      'ranking-cutoffs',
    ],
  }),

  format({
    slug: 'entering-professional-tournaments',
    title: 'How Players Enter Professional Tournaments',
    category: 'careers',
    order: 40,
    difficulty: 'intermediate',
    summary:
      'Enter by deadline, be accepted by ranking, and take qualifying or a wild card if you are below the line.',
    oneSentence:
      'A player enters a tournament by the published deadline and is accepted, placed in qualifying, or left out, according to their ranking relative to everybody else who entered.',
    howItWorks:
      '**The entry deadline** is typically several weeks before the tournament. A player submits an entry, and acceptance is decided by ranking order among all entrants.\n\n**The cut-off** is the ranking of the last player accepted directly. It moves as players withdraw, so somebody initially outside the cut can be accepted later.\n\n**Qualifying** has its own, lower cut-off. Players below the main-draw line enter that instead.\n\n**Wild cards** are the discretionary route for those below both lines.\n\n**Withdrawal rules** matter: withdrawing after the deadline without a valid reason can carry a penalty, which is why players enter events selectively rather than entering everything.',
    whyItMatters:
      'The gap between the entry deadline and the tournament means a player’s schedule is set weeks in advance on a ranking that may have changed substantially since. Planning around it is a real professional skill.',
    related: [
      'ranking-cutoffs',
      'main-draw-vs-qualifying',
      'wild-card',
      'how-players-qualify-for-tournaments',
      'rankings-and-tournament-entry',
    ],
  }),

  rankingConcept({
    slug: 'ranking-cutoffs',
    title: 'Ranking Cutoffs Explained',
    category: 'careers',
    alsoIn: ['rankings'],
    order: 50,
    difficulty: 'intermediate',
    summary: 'The ranking of the last player who got in, which decides a player’s season.',
    oneSentence:
      'A cut-off is the ranking of the last player accepted into a draw, and it determines whether a player’s next few weeks are spent on the main tour or a level below it.',
    howItWorks:
      'Each tournament and each level has an effective cut-off, set by which players entered rather than by a fixed number. A weak entry list means a lower cut-off, and a strong one means a higher.\n\nCut-offs move after the deadline, as accepted players withdraw and the next players on the list are admitted.\n\nThe cut-offs that matter most in a career are the ones for direct entry into Grand Slam main draws and qualifying, because they carry both the most points and the most prize money.',
    workedExample:
      'A player ranked 108 who needs to be inside about 104 for direct acceptance into a major’s main draw is a handful of ranking places from a very large difference in guaranteed income, and may schedule several extra tournaments specifically to cross that line before the deadline.',
    whyItMatters:
      'The cut-offs are why ranking positions in the hundreds matter so much more than the raw numbers suggest. The difference between 100 and 110 is not ten places: it is whether a player’s year contains four Grand Slam main draws.',
    related: [
      'entering-professional-tournaments',
      'rankings-and-tournament-entry',
      'main-draw-vs-qualifying',
      'the-tour-pathway',
      'lower-ranked-player-finances',
    ],
  }),

  article({
    slug: 'injury-comebacks',
    title: 'Injury Comebacks',
    category: 'careers',
    order: 60,
    difficulty: 'intermediate',
    summary: 'Why returning is hard for reasons that have nothing to do with the injury.',
    oneSentence:
      'A player returning from a long absence has lost their ranking, so they face the double problem of regaining match sharpness while entering tournaments they can barely get into.',
    explanation:
      'The physical recovery is only part of the difficulty. The ranking system creates a second problem that arrives exactly when the player is least equipped to handle it.',
    howItWorks:
      '**The ranking collapses.** Points expire after 52 weeks regardless of why the player was absent, so a year out leaves a player with almost nothing.\n\n**Entry becomes hard.** With no ranking, a returning former top-ten player may not get into tour events at all.\n\n**Protected rankings help partially.** They permit entry to a limited number of events using the pre-injury ranking, but generally do not confer a seeding, so a returning player is unseeded and can draw a top seed immediately.\n\n**Wild cards fill the gap**, which is why tournaments give them to returning champions.\n\n**Match sharpness returns slowly**, and it returns while playing the strongest opponents the draw can produce, because unseeded players meet seeds early.',
    whyItMatters:
      'It explains why comebacks so often look worse than the player’s actual level for several months, and why a returning player’s early results are a poor guide to whether the comeback will succeed.',
    related: [
      'protected-ranking',
      'wild-card',
      'losing-ranking-points',
      'dropping-down-the-rankings',
      'seeded-vs-unseeded',
    ],
  }),

  article({
    slug: 'dropping-down-the-rankings',
    title: 'What Happens When Players Drop Down the Rankings?',
    category: 'careers',
    order: 70,
    difficulty: 'intermediate',
    summary: 'Worse tournaments, less money, harder draws: the decline compounds itself.',
    oneSentence:
      'A falling ranking reduces access to the biggest tournaments, which reduces both earnings and the opportunity to earn points, which accelerates the fall.',
    explanation: 'The ranking system has a feedback loop in it, and it runs in both directions.',
    howItWorks:
      '**Access narrows.** Below the direct-entry cut-offs, a player must qualify, which means playing more matches for fewer points.\n\n**Earnings fall faster than the ranking.** Prize money rises steeply with tournament tier, so dropping from tour level to Challenger level cuts income by far more than it cuts ranking places.\n\n**Costs do not fall.** Coaching and travel cost the same at every level.\n\n**Draws get harder in a specific way.** Playing qualifying means three extra matches before the tournament starts, and arriving in a main draw unseeded means meeting a seed early.\n\n**The loop.** Fewer points available means a lower ranking next quarter, which means less access again.',
    whyItMatters:
      'It is why the middle of professional tennis is so unstable, and why players fight so hard for the specific ranking positions that sit just above a cut-off.',
    related: [
      'ranking-cutoffs',
      'losing-ranking-points',
      'lower-ranked-player-finances',
      'the-tour-pathway',
      'injury-comebacks',
    ],
  }),

  article({
    slug: 'prize-money-vs-earnings',
    title: 'Prize Money vs Player Earnings',
    category: 'careers',
    order: 80,
    difficulty: 'intermediate',
    summary: 'The published figure is revenue, not income, and the difference is large.',
    oneSentence:
      'A player’s published career prize money is gross revenue before tax, coaching, travel and every other cost, all of which they pay themselves.',
    explanation:
      'Prize money totals are published and quoted constantly, and they are one of the most misleading figures in sport, because they are compared against salaries in other sports which are net of nothing at all.',
    howItWorks:
      'Deducted from prize money before a player sees anything:\n\n- **Tax**, often withheld in the country where the money was won, with the complexity of a player earning in a dozen jurisdictions a year.\n- **Coaching**, typically a salary plus expenses, or a percentage.\n- **Physiotherapy and fitness**, where a player travels with a team.\n- **Travel and accommodation** for the player and everybody with them, across a calendar spanning several continents.\n- **Stringing, equipment and entry logistics.**\n\n**Endorsements** are separate and are where top players’ income mostly comes from. They are also highly concentrated: sponsorship falls away far more steeply with ranking than prize money does.',
    whyItMatters:
      'It is why a published career prize money figure of a few hundred thousand pounds can correspond to a player who has never made a profit, and why the sport’s income distribution is far more unequal than the prize money tables suggest.',
    related: [
      'lower-ranked-player-finances',
      'points-vs-prize-money',
      'how-tennis-careers-work',
      'dropping-down-the-rankings',
    ],
  }),

  article({
    slug: 'lower-ranked-player-finances',
    title: 'Why Lower-Ranked Tennis Players Struggle Financially',
    category: 'careers',
    isFeatured: true,
    order: 90,
    difficulty: 'intermediate',
    summary: 'Costs are flat, prize money is steeply tiered, and there is no salary underneath.',
    oneSentence:
      'Prize money falls away much faster than costs do as ranking declines, so below a certain level a full professional season costs more than it earns.',
    explanation:
      'The economics are structural rather than incidental, and they follow directly from how the sport is organised.',
    howItWorks:
      '**Prize money is steeply tiered.** The gap between a major and an entry-level event is enormous, and the gap between a first-round loss and a title within any event is large too.\n\n**Costs are broadly flat.** A flight, a hotel and a coach cost roughly the same whether the tournament is a major or an ITF event in a small town.\n\n**There is no floor.** No salary, no minimum, no guaranteed appearance money for most players. A first-round loss earns first-round money.\n\n**Travel is unavoidable.** Entry-level tournaments are scattered globally, so a player builds a ranking by flying between countries for prize money that may be a few hundred pounds.\n\n**Injury has no safety net.** Time off means no earnings and a collapsing ranking simultaneously.\n\nThe practical consequence, reported repeatedly in studies of the sport’s economics, is that only a few hundred players worldwide make a living from prize money alone, and the rest are supported by federations, families, sponsors or other work.',
    whyItMatters:
      'It shapes who becomes a professional at all. A player who needs several years to climb the pathway needs several years of funding, and that requirement selects on wealth and on national federation support rather than only on ability.',
    related: [
      'the-tour-pathway',
      'prize-money-vs-earnings',
      'itf-world-tennis-tour',
      'ranking-cutoffs',
      'how-tennis-careers-work',
    ],
  }),
];

/* ────────────────────────────────────────────────────────────────────────────
 * Remaining glossary terms
 * ────────────────────────────────────────────────────────────────────────── */

const GLOSSARY: ExplainerSeed[] = [
  definition({
    slug: 'rally',
    title: 'Rally',
    category: 'glossary',
    order: 20,
    summary: 'The exchange of shots that makes up a point.',
    oneSentence:
      'A rally is the sequence of shots played between the serve and the end of the point.',
    explanation:
      'Every point that is not an ace or a double fault contains a rally. Its length is counted in shots, and rally length is one of the clearest indicators of the surface being played on and of the styles meeting.',
    related: ['rally-length', 'building-a-point', 'rally-length-analysis'],
  }),

  definition({
    slug: 'crosscourt',
    title: 'Crosscourt',
    category: 'glossary',
    order: 30,
    summary: 'A shot hit diagonally, from one corner towards the opposite one.',
    oneSentence:
      'A crosscourt shot travels diagonally across the court rather than parallel to the sidelines.',
    explanation:
      'It is the default direction in tennis for three reasons: the diagonal is longer than the length of the court, the net is six inches lower in the middle, and the player finishes closer to their recovery position.\n\nMost professional rallies are crosscourt exchanges, and the moment somebody goes down the line is usually the moment the point is decided one way or the other.',
    related: ['down-the-line', 'crosscourt-vs-down-the-line', 'changing-direction', 'using-angles'],
  }),

  definition({
    slug: 'down-the-line',
    title: 'Down the Line',
    category: 'glossary',
    order: 40,
    summary: 'A shot hit parallel to the sideline, straight down the court.',
    oneSentence: 'A down-the-line shot travels parallel to the sideline rather than diagonally.',
    explanation:
      'It is the shorter, riskier direction: less court to land in, a higher part of the net to clear, and a longer recovery run afterwards.\n\nIt is also how points are won, because it changes the direction of a rally and hits into space the opponent has not covered.',
    related: ['crosscourt', 'crosscourt-vs-down-the-line', 'changing-direction', 'passing-shot'],
  }),

  definition({
    slug: 'unseeded',
    title: 'Unseeded',
    category: 'glossary',
    order: 50,
    summary: 'Not among the players given a protected position in the draw.',
    oneSentence:
      'An unseeded player is one not ranked highly enough among the entrants to receive a seeding, and is therefore drawn at random anywhere in the bracket.',
    explanation:
      'Being unseeded means a player can meet the top seed in the first round. It is a statement about their ranking relative to the other entrants, not about their standard: a returning former champion on a protected ranking is unseeded and is nobody’s idea of an easy draw.',
    related: ['seeded-vs-unseeded', 'seed', 'top-players-meeting-early', 'protected-ranking'],
  }),
];

export const TENNIS_STATS_AND_ADVANCED: ExplainerSeed[] = [
  ...STATISTICS,
  ...ADVANCED,
  ...SURFACES,
  ...EQUIPMENT,
  ...CONDITIONS,
  ...CAREERS,
  ...GLOSSARY,
];
