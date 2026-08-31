import type { ExplainerSeed, SourceSeed } from './explainer-types';
import { article, definition, format, rule } from './tennis-explainer-helpers';

/**
 * The written tennis explainers: Start Here, and Scoring & Match Rules.
 *
 * These override the taxonomy placeholders in `tennis-explainer-taxonomy.ts` by
 * slug and are the only tennis concepts that reach the site: anything left as a
 * placeholder stays a draft. The remaining categories live in the sibling
 * `tennis-*.ts` files, which are split by subject rather than by size, so that
 * an edit to the serving rules touches one file.
 *
 * ## One concept, one page
 *
 * The rule this library is built around. The final set is decided differently
 * at each of the four majors, coaching is treated differently by the two tours,
 * and the tiebreak that follows 6-6 is not the same tiebreak everywhere. None
 * of that justifies `atp-tiebreak` and `wta-tiebreak` as separate articles:
 * they would agree on nine sentences out of ten and disagree on one, and a
 * reader searching "tiebreak" would have to pick a tour before they could read
 * anything.
 *
 * So each concept is one row with one canonical URL, and the differences live
 * in a `rule_differences` section of it. Basketball reached the same answer for
 * the NBA and FIBA, cricket for Tests and T20s, and the section type existed
 * before this file did.
 *
 * The corollary matters just as much: where the general description would be
 * wrong for a tour or a tournament, the section is not optional.
 *
 * ## On sourcing
 *
 * Facts come from the governing bodies where the question is "what is the
 * rule": the ITF's Rules of Tennis, the ATP and WTA rulebooks, and the majors'
 * own conditions of play. Wikipedia is used for history and background. The
 * prose is SportBrainHQ's own throughout: a rulebook's expression is not ours
 * to reuse, and paraphrasing a rule badly is worse than not citing it.
 *
 * Anything written against a rulebook carries `ruleSensitive: true` and a
 * `sourceRevision`, so the set to re-audit after a rule change is a query
 * rather than a reading of every article.
 *
 * ## On numbers that move
 *
 * Ranking-point tables, prize money and the exact number of tournaments in a
 * tier are deliberately absent from the prose. They are revised most years, and
 * a number baked into an article is wrong within a season with nothing to flag
 * it. The mechanisms are explained; the current figures belong in data with an
 * as-of date. Where a worked example needs a number to be worked at all, it is
 * introduced as an illustration with its own round figures, not as a claim
 * about this season's table.
 */

export const TENNIS_EXPLAINER_SOURCES: SourceSeed[] = [
  {
    key: 'itf-rules',
    provider: 'itf',
    title: 'ITF Rules of Tennis',
    url: 'https://www.itftennis.com/en/about-us/governance/rules-and-regulations/',
    license: 'ITF',
  },
  {
    key: 'atp-rulebook',
    provider: 'atp',
    title: 'ATP Official Rulebook',
    url: 'https://www.atptour.com/en/corporate/rulebook',
    license: 'ATP',
  },
  {
    key: 'wta-rulebook',
    provider: 'wta',
    title: 'WTA Official Rulebook',
    url: 'https://www.wtatennis.com/rulebook',
    license: 'WTA',
  },
  {
    key: 'grand-slam-rulebook',
    provider: 'itf',
    title: 'Grand Slam Rule Book',
    url: 'https://www.itftennis.com/en/about-us/governance/rules-and-regulations/',
    license: 'Grand Slam Board',
  },
  {
    key: 'wp-tennis',
    provider: 'wikipedia',
    title: 'Tennis',
    url: 'https://en.wikipedia.org/wiki/Tennis',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-tennis-scoring',
    provider: 'wikipedia',
    title: 'Tennis scoring system',
    url: 'https://en.wikipedia.org/wiki/Tennis_scoring_system',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-grand-slam',
    provider: 'wikipedia',
    title: 'Grand Slam (tennis)',
    url: 'https://en.wikipedia.org/wiki/Grand_Slam_(tennis)',
    license: 'CC BY-SA 4.0',
  },
];

/**
 * The rule edition this library is written against.
 *
 * One constant rather than a string per entry, because the whole set is
 * re-audited together after a rule change and a typo in one of two hundred
 * copies would hide an article from that audit.
 */
export const TENNIS_RULE_REVISION = 'ITF Rules of Tennis, 2025 edition';
export const TENNIS_REVIEWED = '2026-08-30';

/** Applied to every entry written against a rulebook. */
const RULES = {
  ruleSensitive: true,
  sourceRevision: TENNIS_RULE_REVISION,
  lastReviewedAt: TENNIS_REVIEWED,
  sourceKeys: [{ key: 'itf-rules' }],
};

/* ────────────────────────────────────────────────────────────────────────────
 * Start here
 * ────────────────────────────────────────────────────────────────────────── */

const START_HERE: ExplainerSeed[] = [
  article({
    slug: 'tennis-in-five-minutes',
    title: 'Tennis in 5 Minutes',
    category: 'start-here',
    isStartHere: true,
    isFeatured: true,
    order: 10,
    readMinutes: 5,
    summary: 'Everything you need to follow a match, from one player serving to somebody winning.',
    oneSentence:
      'Two players hit a ball over a net into each other’s half of the court, and the one who first wins enough points, then enough games, then enough sets, wins the match.',
    explanation:
      'Tennis is a striking sport played on a rectangular court divided by a net. One player serves to start each point; the ball must land in the diagonally opposite service box. After that, players hit alternately, and the ball may bounce at most once on your side before you return it.\n\nYou win a point when your opponent cannot return the ball into your half of the court, either because they miss, hit it out, hit it into the net, or let it bounce twice.\n\nThe unusual part is the scoring. Points are counted 15, 30, 40, game. Four points wins a game, six games wins a set, and two or three sets wins the match. There are catches at every level, and they are the reason a match can last three hours instead of thirty minutes.',
    howItWorks:
      '**The serve.** One player serves for an entire game. They get two attempts per point: miss both and they lose the point outright, which is called a double fault.\n\n**The rally.** After a successful serve, players hit alternately until one cannot make a legal return.\n\n**The game.** Points go love (zero), 15, 30, 40, game. If both players reach 40 the score is deuce, and somebody must then win two points in a row.\n\n**The set.** First to six games, but you must lead by two. At 6-6, a tiebreak decides it.\n\n**The match.** Best of three sets in almost all professional tennis, and best of five in men’s singles at the four Grand Slams.',
    example:
      'A typical scoreline reads **6-4, 3-6, 7-6(4)**. The winner took the first set six games to four, lost the second, and won the third in a tiebreak by seven points to four.',
    whyItMatters:
      'The nesting is the point. Because sets restart the count, a player can lose far more points than their opponent and still win the match: what matters is *when* the points were won, not how many. That single fact explains most of what commentators talk about.',
    takeaways:
      '- One player serves a whole game, and gets two attempts at each serve.\n- Points run love, 15, 30, 40; four points with a two-point lead wins a game.\n- Six games with a two-game lead wins a set; a tiebreak settles 6-6.\n- Two sets wins a best-of-three; three wins a best-of-five.\n- Winning more points than your opponent does not mean winning the match.',
    related: [
      { slug: 'how-a-tennis-match-works', type: 'part_of' },
      'tennis-scoring',
      'how-serving-works',
      'understanding-the-tennis-court',
      'why-total-points-mislead',
    ],
    sourceKeys: [{ key: 'itf-rules' }, { key: 'wp-tennis' }],
  }),

  article({
    slug: 'how-a-tennis-match-works',
    title: 'How a Tennis Match Works',
    category: 'start-here',
    alsoIn: ['scoring'],
    isStartHere: true,
    order: 20,
    readMinutes: 6,
    summary:
      'The shape of a match from the coin toss to the handshake, and what happens between points.',
    oneSentence:
      'A match is a sequence of points grouped into games, games grouped into sets, and sets grouped into a result, with fixed breaks built into every level.',
    explanation:
      'Before play, a coin toss or racket spin decides who chooses. The winner of the toss picks either to serve or receive first, or which end to start at; the loser takes the remaining choice. Players then warm up, usually for five minutes.\n\nFrom there the match runs in nested loops. Points make games. The server serves the whole game, and the serve passes to the other player at the end of it. Games make sets. Sets make the match.',
    howItWorks:
      '**Between points**, the server has a limited time to begin the next point, enforced at professional level by a serve clock.\n\n**Between games**, players change ends after the first game and then after every second game thereafter, taking a short seated break each time. The odd-numbered pattern exists so that neither player spends the whole match with the sun or wind on the same side.\n\n**Between sets**, there is a slightly longer break. In some competitions a longer break is permitted after a set for reasons such as heat.\n\n**Ends are not changed** during a game, and the sides you occupy in a tiebreak change every six points rather than every two games.',
    example:
      'A player wins the toss and elects to receive. Their opponent serves the first game. After that game they change ends, and change again after the third, fifth and seventh.',
    whyItMatters:
      'Almost every rule a beginner finds arbitrary (why ends change on odd games, why the serve clock exists, why the tiebreak swaps sides at six) exists to keep conditions equal between two people playing on the same court at the same time.',
    misunderstandings:
      '**"Both players serve in a game."** They do not. One player serves the entire game.\n\n**"Winning the toss means serving."** The toss winner chooses, and choosing to receive is a real tactic, particularly in wind or when a player prefers to start by putting the pressure on.',
    related: [
      'tennis-in-five-minutes',
      'tennis-scoring',
      'serving-order',
      'changing-ends',
      { slug: 'time-violations', type: 'related_to' },
    ],
    ...RULES,
  }),

  article({
    slug: 'singles-vs-doubles',
    title: 'Singles vs Doubles',
    category: 'start-here',
    alsoIn: ['doubles'],
    order: 30,
    summary:
      'Same court, two different sports: what changes when there are four players instead of two.',
    oneSentence:
      'Doubles is played by two pairs on a wider court, which shortens rallies, raises the value of the serve and net play, and adds a set of positioning rules singles has no need for.',
    explanation:
      'Singles is one against one on the narrower court, inside the singles sidelines. Doubles is two against two, and the two strips down the sides, the alleys, become live. That extra width is only about 1.4 metres a side, but it changes everything: with four people on court and more ground to cover, the space you can defend as a pair depends far more on where you stand than on how fast you run.',
    howItWorks:
      '**The court.** The alleys are in play for doubles, out for singles. The serve, however, is aimed at the same service boxes in both: the service boxes do not change size.\n\n**The serve.** Each pair sets an order at the start of a set and keeps it for that set, so the serve rotates through four players.\n\n**The return.** Each pair also fixes which partner receives in the deuce court and which in the ad court, and that cannot change within a set.\n\n**The play.** The serving pair usually starts with one player at the net. Points are shorter, first strikes matter more, and the reflex volley is a core skill rather than an occasional one.',
    example:
      'In a doubles point, the server’s partner stands at the net from the first ball. Their job is to intercept anything the returner floats, which is what makes returning low and crosscourt the standard reply.',
    whyItMatters:
      'The two formats reward different players. A doubles specialist may have a modest singles ranking and be world-class in a pair, because the skills that decide a doubles point (serve placement, return depth, volleys, communication) are a subset of singles skills weighted differently.',
    misunderstandings:
      '**"The alleys are in for the serve."** They are not. A serve into the alley is out in doubles exactly as it is in singles.',
    related: [
      'how-doubles-works',
      'doubles-court',
      'singles-court-vs-doubles-court',
      'doubles-serving-order',
      'poaching',
    ],
    ...RULES,
  }),

  rule({
    slug: 'how-you-win-a-tennis-match',
    title: 'How Do You Win a Tennis Match?',
    category: 'start-here',
    alsoIn: ['scoring'],
    isStartHere: true,
    order: 40,
    summary:
      'Win points to win games, games to win sets, and sets to win the match. Each level has a catch.',
    oneSentence:
      'You win by taking a majority of the sets, which requires winning games, which requires winning points, with a two-clear margin demanded at each level.',
    howItWorks:
      '**Points.** Won when the opponent fails to return the ball legally.\n\n**Games.** First to four points, but you must be two clear. 40-40 is deuce, and from deuce a player must win two consecutive points.\n\n**Sets.** First to six games, but two clear. At 6-6 a tiebreak is played, and the set is recorded as 7-6.\n\n**Match.** Two sets in a best-of-three, three sets in a best-of-five.',
    example:
      'A match ending **7-5, 6-7(3), 6-3** shows all three mechanisms: a set that needed a two-game margin, a set settled by tiebreak, and a straightforward third.',
    whyItMatters:
      'The two-clear requirement at every level is what makes tennis comebacks possible and long matches inevitable. A player can be one point from defeat repeatedly and still win, because no lead is decisive until the margin is achieved.',
    ruleDifferences:
      'The final set is the exception, and it is not uniform. All four Grand Slams now decide a deciding set with a tiebreak at 6-6, but the format of that tiebreak has changed within the last few years and is set by the Grand Slam Board rather than by the ITF. Older matches, and some team competitions, used an advantage set played out without a tiebreak, which is how the famous marathon scorelines happened.',
    misunderstandings:
      '**"Most points wins."** No. Roughly one professional match in twenty is won by the player who won fewer total points, because points are not equal: the ones at 30-40 decide games and the ones at 15-0 mostly do not.',
    related: [
      'tennis-scoring',
      'how-you-win-a-set',
      'tiebreak',
      'best-of-three-vs-best-of-five',
      'why-total-points-mislead',
    ],
    ...RULES,
  }),

  article({
    slug: 'understanding-the-tennis-court',
    title: 'Understanding the Tennis Court',
    category: 'start-here',
    alsoIn: ['court'],
    isStartHere: true,
    order: 50,
    summary: 'Every line on a tennis court, what it decides, and which ones you can ignore.',
    oneSentence:
      'A tennis court is a rectangle split by a net, with an inner rectangle for singles, two boxes each side for the serve, and lines that count as in.',
    explanation:
      'There are more lines than a beginner needs. Only four decisions are made by them: is the serve in, is the rally ball in, are we playing singles or doubles, and which half of the court does the server stand behind.',
    howItWorks:
      '**Baselines** are the two lines at each end. In a rally, a ball landing beyond the baseline is out. Servers stand behind it.\n\n**Sidelines** come in pairs. The inner pair bounds the singles court; the outer pair bounds the doubles court. The strip between them is the alley.\n\n**Service lines** run across the court, roughly halfway between the net and the baseline. With the **centre service line**, they make the four service boxes. A serve must land in the box diagonally opposite the server.\n\n**The centre mark** is the small tick in the middle of each baseline. It divides the server’s half: right of it is the deuce court, left is the ad court.\n\nThe net is lower in the middle than at the posts, by design, which is why the safest shot in tennis is played over the centre of the net.',
    diagram: {
      court: 'doubles',
      showLabels: true,
      caption: 'A doubles court. In singles the outer strips, the alleys, are out of play.',
      steps: [
        {
          caption:
            'The four service boxes, the singles sidelines inside the doubles ones, and the centre mark dividing each baseline.',
          zones: [
            { x: 17, y: 26.5, width: 33, height: 23.5, label: 'Deuce box' },
            { x: 50, y: 26.5, width: 33, height: 23.5, label: 'Ad box' },
          ],
        },
      ],
    },
    example:
      'A serve that clips the outer edge of the service line is in, because a ball touching any part of a line is in. The same ball landing a centimetre beyond it is a fault.',
    whyItMatters:
      'Two of the lines carry almost all the tactical weight. The baseline sets how far back a rally is played from, and the service line sets how small the target is on a second serve.',
    misunderstandings:
      '**"The alleys matter in singles."** They do not. In singles they are simply outside the court.\n\n**"The service line is where you stand to serve."** It is not. The server stands behind the baseline, which is the furthest line from the net.',
    related: [
      'tennis-court',
      'service-boxes',
      'doubles-alleys',
      'ball-on-the-line',
      'ad-court-and-deuce-court',
    ],
    ...RULES,
  }),

  format({
    slug: 'tennis-match-formats',
    title: 'Tennis Match Formats',
    category: 'start-here',
    alsoIn: ['scoring'],
    order: 60,
    difficulty: 'beginner',
    summary:
      'Best-of-three, best-of-five, match tiebreaks and no-ad scoring: the shapes a match can take.',
    oneSentence:
      'Professional tennis is played best-of-three sets almost everywhere, best-of-five in men’s Grand Slam singles, with several shortened formats used in doubles and some team events.',
    howItWorks:
      '**Best-of-three sets** is the standard. First to two sets wins.\n\n**Best-of-five sets** is used for men’s singles at the four Grand Slams. First to three sets wins.\n\n**Match tiebreak** replaces a full deciding set with a single tiebreak, usually played to ten points, and is common in doubles and in some team and exhibition competitions.\n\n**No-ad scoring** removes deuce: at 40-40 a single deciding point is played, and the receiver chooses which side it is played from. It is used in most professional doubles and throughout college tennis.\n\n**Short sets** to four games appear in some team formats and in the ATP Next Gen event, which is where several format experiments have run.',
    whyItMatters:
      'Format changes the sport rather than just its length. Best-of-five rewards physical endurance and lets a player recover from a poor start; a match tiebreak turns a whole deciding set into a ten-point shootout where one mini-break decides it. The same two players can be genuinely differently matched under the two formats.',
    ruleDifferences:
      'Women’s singles is best-of-three at every level including the Grand Slams; men’s singles is best-of-five only at the Grand Slams and, historically, in some Davis Cup ties. Doubles at the Grand Slams varies: men’s doubles has been best-of-five at some majors historically and is now best-of-three at all four, with the deciding set decided by a match tiebreak in several competitions. Because these are set by each competition rather than by the ITF, the format is a property of the event, not of the sport.',
    misunderstandings:
      '**"Best-of-five is the men’s format."** Only at the majors. The overwhelming majority of men’s professional matches are best-of-three.',
    related: [
      'best-of-three-vs-best-of-five',
      'match-tiebreak',
      'tiebreak',
      'how-you-win-a-set',
      'mens-vs-womens-tennis',
    ],
    ...RULES,
  }),

  article({
    slug: 'mens-vs-womens-tennis',
    title: "Men's vs Women's Professional Tennis",
    category: 'start-here',
    order: 70,
    summary: 'Two tours, two ranking systems, one shared calendar and four shared majors.',
    oneSentence:
      'The men’s tour is run by the ATP and the women’s by the WTA, and while they share the four Grand Slams and many combined events, they run separate rankings, separate tournament tiers and separate season finales.',
    explanation:
      'The professional game is organised as two parallel tours. Each has its own governing body, its own ranking system, its own tiers of tournament and its own year-end championship. The four Grand Slams are run by neither: they belong to their national federations under the oversight of the Grand Slam Board, which is why the majors can and do set rules the tours do not.',
    howItWorks:
      '**Shared.** The four majors, the Olympic tournament, and a number of combined events where both tours play the same site in the same fortnight.\n\n**Separate.** Rankings, points tables, tournament tiers (Masters 1000 and ATP 500/250 against WTA 1000/500/250/125), the season finale, and the rulebooks governing things like coaching and on-court conduct.\n\n**Different on court.** Men’s singles at the majors is best-of-five sets; women’s singles is best-of-three everywhere. That is the only format difference at the majors, and it is a competition rule rather than a rule of tennis.',
    whyItMatters:
      'Any comparison across the two tours needs care. Ranking points are not on the same scale, the tiers are named differently, and a "1000-level" title does not mean the same thing on both tours. Comparing surface records or head-to-heads within a tour is straightforward; comparing achievements across them requires saying which measure you are using.',
    misunderstandings:
      '**"The ITF runs professional tennis."** The ITF governs the sport, writes the Rules of Tennis and runs the entry-level professional circuit and the international team events, but the two professional tours are run by the ATP and the WTA, and the majors by their own organisers.',
    related: [
      'atp-wta-itf',
      'atp-rankings',
      'wta-rankings',
      'the-grand-slams',
      'tennis-match-formats',
    ],
    sourceKeys: [{ key: 'atp-rulebook' }, { key: 'wta-rulebook' }],
  }),

  format({
    slug: 'atp-wta-itf',
    title: 'ATP vs WTA vs ITF',
    category: 'start-here',
    alsoIn: ['tournaments'],
    order: 80,
    difficulty: 'beginner',
    summary:
      'Three organisations, three jobs: the men’s tour, the women’s tour, and the sport’s governing body.',
    oneSentence:
      'The ITF governs the sport worldwide and runs its entry level, the ATP runs the men’s professional tour, and the WTA runs the women’s.',
    howItWorks:
      '**The ITF** is the international federation. It writes the Rules of Tennis, sanctions the four Grand Slams jointly with their organisers, runs the international team competitions and the Olympic tournament, and operates the World Tennis Tour, which is where professionals begin.\n\n**The ATP** runs the men’s tour above that entry level: the Masters 1000, 500 and 250 events, the Challenger Tour beneath them, the men’s ranking system and the ATP Finals.\n\n**The WTA** does the equivalent for the women’s tour: the 1000, 500, 250 and 125 events, the women’s rankings and the WTA Finals.\n\nThe four majors sit across all three. They are run by their national associations, award ATP and WTA ranking points, and are governed for rules purposes by the Grand Slam Board.',
    example:
      'A player starting out enters ITF World Tennis Tour events. Points earned there build an ATP or WTA ranking, which is what gets them into Challenger events, and then into tour-level qualifying.',
    whyItMatters:
      'Knowing which body owns a rule tells you where a difference will appear. Rules of play come from the ITF; conduct, coaching and scheduling rules come from the tour or from the Grand Slam Board, and that is exactly why the answer to "is coaching allowed" depends on which tournament you are watching.',
    misunderstandings:
      '**"ITF events are amateur."** They are professional tournaments with prize money and ranking points. They are the entry level, not the amateur level.',
    related: [
      'itf-world-tennis-tour',
      'atp-challenger-tour',
      'the-tour-pathway',
      'mens-vs-womens-tennis',
      'the-grand-slams',
    ],
    sourceKeys: [{ key: 'itf-rules' }, { key: 'atp-rulebook' }, { key: 'wta-rulebook' }],
  }),

  format({
    slug: 'the-grand-slams',
    title: 'What Are the Grand Slams?',
    category: 'start-here',
    alsoIn: ['tournaments', 'grand-slams'],
    isStartHere: true,
    isFeatured: true,
    order: 90,
    difficulty: 'beginner',
    summary: 'The four biggest tournaments in tennis: Australia, France, Wimbledon and the US.',
    oneSentence:
      'The Grand Slams, or majors, are the four largest tournaments of the year: the Australian Open, Roland-Garros, Wimbledon and the US Open.',
    howItWorks:
      '**The Australian Open**, in January, on hard courts in Melbourne.\n\n**Roland-Garros**, the French Open, in late spring, on clay in Paris.\n\n**Wimbledon**, at the turn of summer, on grass in London.\n\n**The US Open**, in late summer, on hard courts in New York.\n\nEach has a 128-player singles draw, meaning seven matches to win the title, and each awards substantially more ranking points and prize money than any other tournament. Men’s singles is best-of-five sets; women’s singles is best-of-three.',
    whyItMatters:
      'The majors are how tennis careers are measured. A player’s major count is the first number quoted about them, ahead of their ranking, their titles or their win record, and the reason is partly the field (everybody enters) and partly the length (seven rounds, and five sets in the men’s event, punishes a single good day).',
    ruleDifferences:
      'Each major sets its own conditions within the Grand Slam Rule Book, and they have historically differed on the things that decide long matches: whether the final set has a tiebreak, and at what score. All four now use a final-set tiebreak, but they arrived there separately and at different times, which is why matches from the 2010s and earlier can show deciding sets with no tiebreak at all.',
    misunderstandings:
      '**"A Grand Slam means winning one major."** Strictly, a "Grand Slam" is winning all four in one calendar year, and each individual tournament is a "major" or "Grand Slam tournament". In everyday usage the singular has come to mean one title, and both usages are now common enough that the ambiguity is worth knowing about.',
    related: [
      'why-grand-slams-matter',
      'calendar-grand-slam',
      'career-grand-slam',
      'the-tennis-season',
      'grand-slam-vs-tour-event',
    ],
    sourceKeys: [{ key: 'grand-slam-rulebook' }, { key: 'wp-grand-slam' }],
  }),

  format({
    slug: 'the-tennis-season',
    title: 'How the Tennis Season Works',
    category: 'start-here',
    alsoIn: ['tournaments'],
    order: 100,
    difficulty: 'beginner',
    summary: 'Eleven months, three surfaces, four majors, and a calendar organised into swings.',
    oneSentence:
      'The season runs from January to November and is organised into surface swings, each ending in a major or a tour finale.',
    howItWorks:
      '**January: the Australian swing.** Hard courts, warm-up events, then the Australian Open.\n\n**February to March: the hard-court stretch.** Indoor events in Europe and two large outdoor events in the United States.\n\n**April to June: the clay swing.** European clay events building through the spring, ending at Roland-Garros.\n\n**June to July: the grass swing.** A short, intense few weeks, ending at Wimbledon. It is the shortest swing by some distance, which is why grass results are the noisiest in tennis.\n\n**July to September: the North American hard courts.** Summer events, ending at the US Open.\n\n**September to November: the indoor season.** European indoor hard courts, then the tour finals for the year’s highest-ranked players.',
    whyItMatters:
      'The calendar explains scheduling, form and rankings all at once. Because ranking points are held for fifty-two weeks, a player’s position in June reflects what they did last June; because the grass season is three or four weeks long, a specialist can gain or lose most of their ranking in a month.',
    misunderstandings:
      '**"There is a long off-season."** There is not. The gap between the tour finals and the first events of the next year is a matter of weeks, which is why the calendar is one of the sport’s most persistent arguments.',
    related: [
      'the-grand-slams',
      'defending-points',
      'tennis-court-surfaces',
      'atp-finals',
      'wta-finals',
    ],
    sourceKeys: [{ key: 'atp-rulebook' }, { key: 'wta-rulebook' }],
  }),
];

/* ────────────────────────────────────────────────────────────────────────────
 * Scoring & match rules
 * ────────────────────────────────────────────────────────────────────────── */

const SCORING: ExplainerSeed[] = [
  rule({
    slug: 'tennis-scoring',
    title: 'Tennis Scoring Explained',
    category: 'scoring',
    isStartHere: true,
    isFeatured: true,
    order: 10,
    readMinutes: 7,
    summary: 'Points, games, sets and the two-clear rule that governs all of them.',
    oneSentence:
      'Tennis counts points as 15, 30, 40 and game, four of which wins a game, six games wins a set, and sets win the match, with a two-clear margin required at every level.',
    howItWorks:
      '**Within a game**, the score runs love (zero), 15, 30, 40, game. The server’s score is always called first, so "30-15" means the server leads.\n\nAt 40-40 the score is **deuce**. From there one player must win two points in a row: the first is **advantage**, and the second wins the game. Lose the point at advantage and the score returns to deuce, which can repeat indefinitely.\n\n**Within a set**, you need six games and a two-game lead. 6-4 wins a set; 6-5 does not. At 6-6, a **tiebreak** is played and the set is recorded as 7-6.\n\n**Within a match**, you need two sets in a best-of-three or three in a best-of-five.',
    example:
      'A game reaching deuce three times before being won is recorded exactly as a game won to love: the scoreline shows games, not the effort inside them. That is why "6-4" can describe a twenty-minute set or a fifty-minute one.',
    diagram: {
      sets: ['Set 1', 'Set 2', 'Set 3'],
      caption:
        'A finished match. The superscripts are the tiebreak scores, and they are the part a beginner is never told about.',
      rows: [
        {
          name: 'Player A',
          scores: [{ games: 6 }, { games: 6, tiebreak: 7 }, { games: 7, tiebreak: 7 }],
          won: true,
        },
        {
          name: 'Player B',
          scores: [{ games: 4 }, { games: 7, tiebreak: 9 }, { games: 6, tiebreak: 4 }],
        },
      ],
      notes: [
        { label: '6-4', explanation: 'A set won by two clear games. No tiebreak was needed.' },
        {
          label: '6-7(9)',
          explanation:
            'Player A lost a tiebreak. The superscript is the loser’s score in it, so this tiebreak finished 11-9.',
        },
        {
          label: '7-6(4)',
          explanation: 'Player A won the deciding tiebreak by seven points to four.',
        },
      ],
    },
    whyItMatters:
      'The nesting decides matches. Points reset at the end of every game and games reset at the end of every set, so a heavy defeat in one set costs no more than a narrow one. This is why tennis scorelines are not additive and why the player who wins more points can lose.',
    ruleDifferences:
      '**No-ad scoring** removes deuce entirely: at 40-40 a single point decides the game and the receiver picks the side. It is used in most professional doubles and across college tennis. Deciding-set formats also differ by competition, so what happens at one-set-all is a property of the event.',
    misunderstandings:
      '**"40 should be 45."** It arguably should. The most common explanation is that the sequence began as quarters of a clock face (15, 30, 45, 60) and that 45 was shortened to 40 in speech. It is a plausible account rather than a documented one.\n\n**"Love means something romantic."** The likeliest origin is the phrase "playing for love", meaning for nothing, though the derivation from the French *l’œuf* (the egg, for the shape of a zero) is the story more often told.',
    related: [
      'why-fifteen-thirty-forty',
      'deuce',
      'advantage',
      'games-sets-and-matches',
      'tiebreak',
      { slug: 'love', type: 'part_of' },
    ],
    ...RULES,
    sourceKeys: [{ key: 'itf-rules' }, { key: 'wp-tennis-scoring' }],
  }),

  article({
    slug: 'why-fifteen-thirty-forty',
    title: 'Why Tennis Uses 15, 30 and 40',
    category: 'scoring',
    alsoIn: ['glossary'],
    order: 20,
    summary: 'The most-asked question in tennis, and an honest answer about what is known.',
    oneSentence:
      'Nobody knows for certain, but the most widely accepted explanation is that the numbers came from a clock face, with 45 shortened to 40 as the game was called aloud.',
    explanation:
      'The scoring sequence predates any surviving explanation of it. It appears in French court tennis, the indoor ancestor of the modern game, several centuries before lawn tennis was codified in the 1870s, and the codifiers inherited it rather than designing it.',
    howItWorks:
      'The clock-face account runs like this: a clock face was used to show the score, with the hand moved a quarter turn for each point, giving 15, 30, 45 and 60 for the game. Over time "forty-five" was clipped to "forty" in speech, which is how a quarter-hour sequence lost its symmetry.\n\nA competing account points to the *jeu de paume* courts themselves, where players advanced a set distance up the court after each point, and the numbers recorded feet rather than minutes.\n\nBoth are reconstructions. Neither has direct documentary support of the kind that would settle it, and any source that states one as fact is overstating what the record shows.',
    whyItMatters:
      'It matters less for the history than for what it tells you about tennis rules generally: much of the scoring system is inherited rather than designed, which is why it resists the simplifications that other sports have made.',
    misunderstandings:
      '**"40 is a corruption of 45, and this is documented."** The shortening is plausible and widely repeated, but it is an inference from how the words sound rather than a recorded change.',
    related: ['tennis-scoring', 'love', 'deuce'],
    sourceKeys: [{ key: 'wp-tennis-scoring' }],
  }),

  definition({
    slug: 'love',
    title: 'What Is Love?',
    category: 'scoring',
    alsoIn: ['glossary'],
    order: 30,
    summary: 'Love means zero.',
    oneSentence: 'Love is the tennis word for a score of zero.',
    explanation:
      '"Fifteen-love" means the server leads one point to none. "A love game" is a game won without conceding a point. "Six-love" is a set won six games to none, more often called a bagel.',
    example: 'A game called "love-thirty" means the server has no points and the receiver has two.',
    misunderstandings:
      '**"Love is from the French l’œuf."** Possibly, from the egg shape of a zero, and it is the version most often repeated. The alternative, that it comes from playing "for love" rather than for stakes, is at least as well supported. Neither is settled.',
    related: ['tennis-scoring', 'bagel', 'why-fifteen-thirty-forty'],
    sourceKeys: [{ key: 'wp-tennis-scoring' }],
  }),

  rule({
    slug: 'deuce',
    title: 'What Is Deuce?',
    category: 'scoring',
    alsoIn: ['glossary'],
    order: 40,
    summary:
      'The score at 40-40, from which a player must win two points in a row to take the game.',
    oneSentence:
      'Deuce is 40-40, and from it a player must win two consecutive points to win the game.',
    howItWorks:
      'When both players reach 40, the score is deuce rather than 40-40. The next point won gives that player **advantage**. If they win the following point too, they win the game; if they lose it, the score returns to deuce.\n\nThere is no limit. A game can return to deuce any number of times, which is why a single game can last ten minutes.',
    example:
      'From deuce: the server wins a point (advantage server), loses the next (deuce), wins two in a row (game). Three of those five points were played at deuce or advantage.',
    whyItMatters:
      'Deuce is where the two-clear principle bites hardest, and it is why serving is worth so much: the server gets to start every one of those points with the shot they control most.',
    ruleDifferences:
      'Under **no-ad scoring**, deuce does not exist as a repeating state: at 40-40 a single point decides the game and the receiver chooses which court it is played from. That format is standard in professional doubles and in college tennis, so a deuce that goes on for ten points is a feature of singles rather than of tennis as such.',
    misunderstandings:
      '**"Deuce is 40-40 only."** It is any score where both players have won at least three points and are level, so a game at 40-40 after ten points is still called deuce rather than something else.',
    related: ['advantage', 'tennis-scoring', 'game-point', 'break-point'],
    ...RULES,
  }),

  rule({
    slug: 'advantage',
    title: 'What Is Advantage?',
    category: 'scoring',
    alsoIn: ['glossary'],
    order: 50,
    summary:
      'The score after winning a point from deuce: one point from the game, but not there yet.',
    oneSentence:
      'Advantage is the score when a player has won one point from deuce, and winning the next point wins them the game.',
    howItWorks:
      'From deuce, the player who wins the next point has advantage. It is announced as "advantage" plus the player’s name, or in club play as "ad in" when the server has it and "ad out" when the receiver does.\n\nWin the following point and the game is over. Lose it and the score returns to deuce.',
    example:
      'At advantage receiver, the receiver has a break point: one point from winning a game on the opponent’s serve.',
    whyItMatters:
      'Advantage to the receiver and break point are the same situation described two ways, and it is the highest-leverage score in tennis outside a tiebreak.',
    ruleDifferences:
      'Advantage does not exist under no-ad scoring, which is used in most professional doubles and in college tennis.',
    related: ['deuce', 'break-point', 'tennis-scoring'],
    ...RULES,
  }),

  rule({
    slug: 'games-sets-and-matches',
    title: 'Games, Sets and Matches Explained',
    category: 'scoring',
    order: 60,
    summary: 'The three nested levels of a tennis match, and what resets between them.',
    oneSentence:
      'Points make games, games make sets and sets make matches, and each level resets completely when it is won.',
    howItWorks:
      '**A game** is won by the first player to four points with a two-point lead. One player serves the whole game.\n\n**A set** is won by the first player to six games with a two-game lead, or by winning the tiebreak at 6-6.\n\n**A match** is won by taking two sets of three, or three of five.\n\nThe reset is the important part. When a game ends, the point score vanishes: winning a game to love and winning one after six deuces produce the same entry on the scoreboard. When a set ends, the game score vanishes the same way.',
    example:
      'A player loses the first set 0-6 and wins the next two 7-5, 7-5. They lost twelve more games than they won across the first set, and the scoreline records only that they won two sets to one.',
    whyItMatters:
      'The resets are what make tennis a game of momentum rather than accumulation. There is no equivalent of a points deficit to claw back: at the start of every set, both players are level.',
    misunderstandings:
      '**"A close set is worth more than a one-sided one."** Not on the scoreboard. 7-6 and 6-0 are both one set.',
    related: [
      'tennis-scoring',
      'how-you-win-a-set',
      'how-you-win-a-tennis-match',
      'why-total-points-mislead',
    ],
    ...RULES,
  }),

  rule({
    slug: 'how-you-win-a-set',
    title: 'How Do You Win a Set?',
    category: 'scoring',
    order: 70,
    summary: 'Six games and a two-game lead, or the tiebreak at 6-6.',
    oneSentence:
      'You win a set by reaching six games with a lead of at least two, or by winning the tiebreak played at six games all.',
    howItWorks:
      'Sets can end 6-0, 6-1, 6-2, 6-3 or 6-4 with the two-game margin already achieved.\n\nAt 5-5, six games is no longer enough, because 6-5 is only one clear. The set continues: 7-5 wins it, and 6-6 goes to a tiebreak, which produces 7-6.\n\nThat gives exactly seven possible set scores: 6-0, 6-1, 6-2, 6-3, 6-4, 7-5 and 7-6.',
    example:
      'A set at 5-5 is not "one game from over". The leader at 6-5 still has to break serve or win a tiebreak, which is why sets so often reach 7-6.',
    ruleDifferences:
      'The **advantage set**, played out without a tiebreak until somebody leads by two, was used in deciding sets at the majors for most of the sport’s history and produced the famous marathon scorelines. All four majors have since adopted a final-set tiebreak, though they adopted different versions of it at different times, so a deciding set’s rules are a property of the competition and the year.',
    misunderstandings:
      '**"7-6 means somebody won seven games."** They did. The tiebreak is recorded as a game, so a 7-6 set is genuinely thirteen games long.',
    related: ['tiebreak', 'games-sets-and-matches', 'bagel', 'breadstick', 'tennis-scoring'],
    ...RULES,
  }),

  rule({
    slug: 'tiebreak',
    title: 'What Is a Tiebreak?',
    category: 'scoring',
    isStartHere: true,
    isFeatured: true,
    order: 80,
    readMinutes: 6,
    summary:
      'The game played at 6-6 to decide a set, counted in ordinary numbers rather than 15, 30, 40.',
    oneSentence:
      'A tiebreak is a single game played at six games all to decide the set, won by the first player to seven points with a two-point lead.',
    howItWorks:
      'At 6-6 in a set, a tiebreak is played. Scoring inside it is plain counting: 1, 2, 3, and so on, not 15-30-40.\n\nThe first player to **seven points** wins, provided they lead by two. At 6-6 inside the tiebreak it continues until somebody is two clear, which is how tiebreaks reach 10-8 or 15-13.\n\nThe winner takes the set 7-6, and the tiebreak score is written in brackets afterwards, showing the **loser’s** points: 7-6(4) means the tiebreak finished 7-4.\n\nServing rotates in an unusual pattern, and ends change every six points. Both are covered in **How does a tiebreak work?**',
    example:
      'A set recorded as 6-7(5) means the player lost the set, and lost the tiebreak by seven points to five.',
    diagram: {
      sets: ['Set 1'],
      caption: 'A tiebreak in progress at 5-5. The next two points, if taken together, win it.',
      rows: [
        { name: 'Player A', scores: [{ games: 6 }], points: '5', serving: true },
        { name: 'Player B', scores: [{ games: 6 }], points: '5' },
      ],
      notes: [
        {
          label: '6-6',
          explanation:
            'The set score. The tiebreak is being played to settle it, and will be recorded as 7-6.',
        },
        {
          label: '5-5',
          explanation: 'The tiebreak score. Seven points wins, but only with a two-point lead.',
        },
      ],
    },
    whyItMatters:
      'The tiebreak exists to bound a set’s length, and it changed the sport when it was introduced in the 1970s. It also concentrates a whole set into a dozen points, which is why tiebreak records are quoted as a measure of nerve rather than of quality.',
    ruleDifferences:
      'The **deciding set** is where competitions differ. All four Grand Slams now play a tiebreak at 6-6 in the final set, but they arrived at that separately and have used different lengths, and the format has changed within the last decade. Some team competitions use a match tiebreak instead of a final set. Whether a deciding set has a tiebreak, and to how many points, is therefore always a fact about the specific event.',
    misunderstandings:
      '**"The number in brackets is the winner’s score."** It is the loser’s. 7-6(4) is a tiebreak won 7-4.\n\n**"A tiebreak is first to seven."** First to seven *and* two clear.',
    related: [
      { slug: 'how-a-tiebreak-works', type: 'part_of' },
      'match-tiebreak',
      'serving-in-a-tiebreak',
      'how-you-win-a-set',
    ],
    ...RULES,
  }),

  rule({
    slug: 'how-a-tiebreak-works',
    title: 'How Does a Tiebreak Work?',
    category: 'scoring',
    alsoIn: ['serving'],
    order: 90,
    difficulty: 'beginner',
    readMinutes: 5,
    summary: 'The serving rotation, the change of ends, and why the pattern is one-then-two.',
    oneSentence:
      'The player due to serve serves one point, then the players alternate two points each, with ends changing every six points.',
    howItWorks:
      'The player whose turn it is to serve serves **the first point only**, from the deuce court.\n\nAfter that, service passes and each player serves **two points at a time**: the first from the ad court, the second from the deuce court.\n\nPlayers **change ends after every six points**, and again at the end of the tiebreak.\n\nAfter the tiebreak, the player who did **not** serve the first point of it serves the first game of the next set. That is what keeps the serving order intact across the set boundary.',
    example:
      'If A serves point 1, then B serves points 2 and 3, A serves 4 and 5, B serves 6 and 7, and so on. The one-then-two pattern means each player has served an equal number of points at every even score, which is the whole reason for it.',
    whyItMatters:
      'The single-point start is not an oddity. It is what makes the tiebreak fair: without it, one player would serve first at every even point and hold a structural advantage in a format decided by a two-point margin.',
    ruleDifferences:
      'The pattern is the same in a **match tiebreak** played to ten points, except that ends change every six points there too, which is why a 10-point tiebreak has a change of ends at 6 and not at 5.',
    misunderstandings:
      '**"You change ends every six points including the first."** Ends change after every six points played in total, so after point 6, point 12, and so on.',
    related: ['tiebreak', 'serving-in-a-tiebreak', 'match-tiebreak', 'changing-ends'],
    ...RULES,
  }),

  rule({
    slug: 'match-tiebreak',
    title: 'What Is a Match Tiebreak?',
    category: 'scoring',
    order: 100,
    difficulty: 'intermediate',
    summary: 'A tiebreak played to ten points that replaces an entire deciding set.',
    oneSentence:
      'A match tiebreak is a tiebreak played to ten points, with a two-point margin, used in place of a full final set.',
    howItWorks:
      'It follows the same serving pattern as a normal tiebreak: one point, then two each, with ends changing every six points. The only differences are the target, ten points instead of seven, and what it replaces.\n\nWhere a normal tiebreak decides a set that has reached 6-6, a match tiebreak is played instead of the deciding set entirely. A match won that way is often written with the tiebreak in the set column, such as 6-4, 3-6, [10-7].',
    example:
      'In professional doubles, a match at one set all often goes straight to a ten-point tiebreak rather than a third set, which is why doubles matches finish inside a predictable window.',
    whyItMatters:
      'It is a scheduling instrument as much as a sporting one. Replacing a deciding set with ten points caps the length of a match, which is what lets doubles and mixed doubles share a site with singles.',
    ruleDifferences:
      'Which competitions use it, and whether it appears in singles at all, is set by each event. It is standard in most professional doubles and common in team and exhibition formats; it is not used in Grand Slam singles, where a deciding set is played and settled by a tiebreak at 6-6.',
    misunderstandings:
      '**"A match tiebreak and a final-set tiebreak are the same thing."** They are not. A final-set tiebreak is played after a deciding set has reached 6-6; a match tiebreak replaces the deciding set.',
    related: ['tiebreak', 'how-a-tiebreak-works', 'tennis-match-formats', 'doubles-tiebreak-rules'],
    ...RULES,
  }),

  format({
    slug: 'best-of-three-vs-best-of-five',
    title: 'Best-of-Three vs Best-of-Five',
    category: 'scoring',
    alsoIn: ['start-here'],
    order: 110,
    difficulty: 'beginner',
    summary: 'Two sets or three to win, and what the difference does to who wins.',
    oneSentence:
      'Best-of-three needs two sets to win and best-of-five needs three, and the longer format reduces the chance of an upset.',
    howItWorks:
      '**Best-of-three** is the format for almost all professional tennis: all women’s singles, all tour-level men’s events outside the majors, and most doubles.\n\n**Best-of-five** is used for men’s singles at the four Grand Slams.\n\nThe practical difference is that a best-of-five gives a player a set to lose. Dropping the opener costs a third of the requirement in a best-of-three and a quarter of it in a best-of-five, and there is far more time to change what is not working.',
    whyItMatters:
      'Longer formats favour the better player. A single set is a noisy sample, and the more sets you require, the more the result reflects the gap in quality rather than the gap on the day. That is a large part of why major titles are weighted so heavily in career comparisons.',
    ruleDifferences:
      'The distinction is a competition rule, not a rule of tennis. It applies to men’s singles at the majors and, historically, to some Davis Cup ties and some Grand Slam doubles events. Women’s singles is best-of-three at every level, and proposals to change either have been argued about for decades without changing.',
    misunderstandings:
      '**"Best-of-five is harder because it is longer."** It is harder physically, and easier competitively for the favourite. Those are different axes, and conflating them is how the argument about the format usually goes wrong.',
    related: [
      'tennis-match-formats',
      'how-you-win-a-tennis-match',
      'the-grand-slams',
      'mens-vs-womens-tennis',
    ],
    ...RULES,
  }),

  definition({
    slug: 'hold-serve',
    title: 'What Does "Hold Serve" Mean?',
    category: 'scoring',
    alsoIn: ['glossary'],
    order: 120,
    summary: 'Winning the game you are serving, which is what is supposed to happen.',
    oneSentence: 'To hold serve is to win a game in which you are the server.',
    explanation:
      'Serving is a large enough advantage that holding is the expected result at every level of professional tennis, and a set often consists of both players holding until one fails to.\n\nBecause of that expectation, tennis commentary treats holds as unremarkable and breaks as the events that decide sets. "Holding to love" means winning your service game without losing a point.',
    example:
      'A set scoreline of 6-4 usually means both players held serve throughout except once, when the winner broke.',
    whyItMatters:
      'Hold percentage is one of the two numbers that describe a player’s whole game, the other being break percentage. Together they predict results better than almost any other pair of statistics.',
    related: ['break-of-serve', 'break-point', 'hold-percentage', 'how-serving-works'],
  }),

  definition({
    slug: 'break-of-serve',
    title: 'What Is a Break of Serve?',
    category: 'scoring',
    alsoIn: ['glossary'],
    order: 130,
    summary:
      'Winning a game while your opponent is serving, which is how sets are usually decided.',
    oneSentence: 'A break of serve is a game won by the player who was receiving.',
    explanation:
      'Because holding serve is the expected outcome, a single break is usually enough to win a set. The receiver only has to win one game against the odds; the server then has to hold their remaining games to keep the set alive.\n\n"Breaking back" means the player who was broken breaks in the following game, restoring the balance. "A double break" means two breaks of serve ahead, which is why 5-1 sets happen quickly.',
    example:
      'A set won 6-4 with one break: both players held five games each, and the winner took one extra game on the loser’s serve.',
    whyItMatters:
      'Almost every set is decided by whether one break happens. That is why the receiver’s whole tactical plan is built around a handful of points per set, and why a player who converts break points at a high rate wins matches they should statistically lose.',
    related: ['hold-serve', 'break-point', 'break-points-won', 'break-percentage'],
  }),

  definition({
    slug: 'break-point',
    title: 'What Is a Break Point?',
    category: 'scoring',
    alsoIn: ['glossary'],
    order: 140,
    summary: 'A point which, if the receiver wins it, breaks the opponent’s serve.',
    oneSentence:
      'A break point is any point at which the receiver is one point away from winning the game.',
    explanation:
      'The receiver has a break point at 0-40, 15-40, 30-40 and at advantage receiver. At 0-40 they have three break points in a row, often called triple break point; at 15-40, two.\n\nIf the server wins the point, the break point is **saved**. If the receiver wins it, the break is **converted**.',
    example:
      'At 30-40 the receiver has one break point. If the server wins the point, the score returns to deuce and the break point is gone, though another may arrive immediately.',
    whyItMatters:
      'Break points are the highest-leverage points in tennis outside a tiebreak, and a match’s statistics sheet almost always reports how many each player had and how many they took. A player who created ten break points and converted one has usually lost.',
    misunderstandings:
      '**"Break points won and break points converted are different statistics."** They are the same thing described two ways. The pair that differ are break points **converted** by the receiver and break points **saved** by the server.',
    related: [
      'break-of-serve',
      'break-points-won',
      'break-points-saved',
      'advantage',
      'creating-break-point-pressure',
    ],
  }),

  definition({
    slug: 'set-point-match-point-championship-point',
    title: 'Set Point vs Match Point vs Championship Point',
    category: 'scoring',
    alsoIn: ['glossary'],
    order: 150,
    summary: 'Three names for the same thing at three different stakes.',
    oneSentence:
      'A set point wins the set, a match point wins the match, and a championship point wins the match when that match is a final.',
    explanation:
      '**Set point** is any point which, if won, wins the set.\n\n**Match point** is any point which, if won, wins the match. In a best-of-three, a set point in the second set is a match point when the player already leads a set.\n\n**Championship point** is a match point in a tournament final. It is a commentary term rather than a rule; nothing about the point is different.\n\nThe same point can be more than one at once, and often is. A point at 5-4, 40-30 in the third set of a final is a game point, a set point, a match point and a championship point simultaneously.',
    example:
      'A player leading 6-4, 5-4, 40-0 has three match points. Losing all three does not lose the match, only that game, and they may serve for it again two games later.',
    whyItMatters:
      'The count of match points saved is one of tennis’s standard measures of a comeback, and it exists because the two-clear rule means a match point is never decisive on its own.',
    related: ['break-point', 'game-point', 'tennis-scoring', 'clutch-performance'],
  }),

  definition({
    slug: 'bagel',
    title: 'What Is a Bagel?',
    subtitle: 'A set won 6-0',
    category: 'scoring',
    alsoIn: ['glossary'],
    aliases: ['6-0 set'],
    order: 160,
    summary: 'Slang for a set won 6-0, from the shape of the zero.',
    oneSentence: 'A bagel is a set won six games to love.',
    explanation:
      'The term comes from the shape of the numeral zero. A player who wins a match 6-0, 6-0 has served a "double bagel", which is rare at professional level and usually indicates injury, a mismatch, or a player who has stopped competing.',
    example: 'A scoreline of 6-0, 6-3 contains one bagel, in the first set.',
    misunderstandings:
      '**"A bagel means the loser won no points."** It means no games. A 6-0 set can contain several deuce games and a great many points won by the loser.',
    related: ['breadstick', 'how-you-win-a-set', 'love'],
  }),

  definition({
    slug: 'breadstick',
    title: 'What Is a Breadstick?',
    subtitle: 'A set won 6-1',
    category: 'scoring',
    alsoIn: ['glossary'],
    aliases: ['6-1 set'],
    order: 170,
    summary: 'Slang for a set won 6-1, from the shape of the numeral one.',
    oneSentence: 'A breadstick is a set won six games to one.',
    explanation:
      'Coined by analogy with the bagel, and for the same reason: the numeral one looks like a breadstick. It is informal commentary and fan usage rather than official terminology, and appears on no scoreboard.',
    related: ['bagel', 'how-you-win-a-set'],
  }),

  definition({
    slug: 'game-point',
    title: 'Game Point',
    category: 'glossary',
    alsoIn: ['scoring'],
    order: 10,
    summary: 'A point which, if won, wins the current game.',
    oneSentence: 'A game point is any point at which a player is one point from winning the game.',
    explanation:
      'The server has a game point at 40-0, 40-15, 40-30 and at advantage server. The receiver’s equivalent has its own name: a break point.\n\nBecause the server is expected to hold, a game point on serve is unremarkable and a game point against serve is a break point, which is why the two have different names for what is structurally the same situation.',
    related: ['break-point', 'set-point-match-point-championship-point', 'tennis-scoring'],
  }),
];

export const TENNIS_EXPLAINERS: ExplainerSeed[] = [...START_HERE, ...SCORING];
