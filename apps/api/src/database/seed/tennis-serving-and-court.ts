import type { ExplainerSeed, TennisCourtShape } from './explainer-types';
import { courtArea, definition, rule } from './tennis-explainer-helpers';
import { TENNIS_REVIEWED, TENNIS_RULE_REVISION } from './tennis-explainers';

/**
 * Serving, and the court.
 *
 * One file, because they are one subject. Every serving rule is a statement
 * about a line: where the server may stand is the baseline and the centre mark,
 * where the ball must land is the service box, and what happens when it touches
 * the net is a rule about a piece of equipment stretched across the middle. The
 * brief lists them as two categories, and they are two categories on the site,
 * but splitting the file would put a rule and the diagram that explains it in
 * different places.
 *
 * ## On diagrams
 *
 * This is the diagram-heavy part of the library, and deliberately so: the
 * questions here are spatial, and prose describing a diagonal is worse than the
 * diagonal. The payloads are structured rather than images for the reasons set
 * out on `TennisCourtShape`, the most important of which is that a beginner is
 * exactly the reader who needs the alt text to be real.
 *
 * Coordinates follow the convention documented there: x from 0 at the left
 * doubles sideline to 100 at the right, y from 0 at the near baseline to 100 at
 * the far one, net at 50.
 */

const RULES = {
  ruleSensitive: true,
  sourceRevision: TENNIS_RULE_REVISION,
  lastReviewedAt: TENNIS_REVIEWED,
  sourceKeys: [{ key: 'itf-rules' }],
};

/**
 * The serve, drawn from the deuce court.
 *
 * Reused by several entries rather than copied, because the geometry is the
 * same fact each time and a second copy is a second thing to get wrong.
 */
const DEUCE_COURT_SERVE: TennisCourtShape = {
  court: 'singles',
  caption: 'A serve from the deuce court must land in the service box diagonally opposite.',
  steps: [
    {
      caption:
        'The server stands behind the baseline, right of the centre mark. The target is the far service box on the left of the diagram, which is diagonally opposite.',
      players: [
        { id: 's', label: 'S', side: 'near', x: 62, y: 3, hasBall: true, highlight: true },
        { id: 'r', label: 'R', side: 'far', x: 76, y: 96 },
      ],
      zones: [{ x: 17, y: 50, width: 33, height: 23.5, label: 'Target' }],
      arrows: [{ kind: 'serve', fromX: 62, fromY: 5, toX: 34, toY: 66 }],
    },
  ],
};

const SERVING: ExplainerSeed[] = [
  rule({
    slug: 'how-serving-works',
    title: 'How Serving Works',
    category: 'serving',
    isStartHere: true,
    isFeatured: true,
    order: 10,
    readMinutes: 6,
    summary: 'Two attempts, one diagonal target, and one player serving for a whole game.',
    oneSentence:
      'The server starts every point by hitting the ball from behind their baseline into the service box diagonally opposite, and gets two attempts to do it.',
    howItWorks:
      '**Who serves.** One player serves an entire game. At the end of it, the serve passes to the opponent.\n\n**Where from.** Behind the baseline, between the centre mark and the sideline. The first point of a game is served from the right of the centre mark (the deuce court), the second from the left (the ad court), and they alternate from there.\n\n**Where to.** The service box diagonally opposite. A serve landing anywhere else, including in the wrong box or beyond the service line, is a fault.\n\n**How many attempts.** Two. Miss the first and you serve again; miss the second and you lose the point, which is a double fault.\n\n**The motion.** The ball is released from the hand and struck before it touches the ground. The server may not touch the baseline or the court inside it until the ball is struck, which is what makes a foot fault a fault.',
    diagram: DEUCE_COURT_SERVE,
    example:
      'At 30-15, the server has won three points and so serves the fourth from the deuce court, aiming diagonally at the box on the receiver’s right.',
    whyItMatters:
      'The serve is the only shot in tennis a player hits without interference, and it is why holding serve is the expected outcome of every game. Everything about how a professional match unfolds follows from that single asymmetry.',
    ruleDifferences:
      'Whether a serve that clips the net and lands in is replayed differs by competition: the **let** is standard under the Rules of Tennis, but "no-let" rules, where such a serve is played on, have been used in college tennis and in some experimental professional formats.',
    misunderstandings:
      '**"You have to serve overhead."** You do not. The rules require only that the ball is struck before it bounces; an underarm serve is entirely legal and is used tactically against opponents who stand a long way back.',
    related: [
      'first-serve-vs-second-serve',
      'where-a-serve-must-land',
      'fault',
      'foot-fault',
      'serving-order',
      'the-serve',
    ],
    ...RULES,
  }),

  rule({
    slug: 'first-serve-vs-second-serve',
    title: 'First Serve vs Second Serve',
    category: 'serving',
    isStartHere: true,
    order: 20,
    summary:
      'The same shot played with opposite risk settings, and the reason second serves decide matches.',
    oneSentence:
      'The first serve is hit for maximum effect because missing it costs nothing but the attempt, while the second must go in because missing it loses the point.',
    howItWorks:
      'A server gets two attempts. That means the first serve is effectively free: hit it as hard and as close to the lines as you dare, because the penalty for missing is only that you serve again.\n\nThe second serve has no such safety net. Miss it and the point is lost immediately, so professionals hit it slower, with far more spin, and to a larger margin over the net and inside the lines. A typical professional second serve is twenty to thirty per cent slower than their first and carries several times the spin.\n\nThat spin is the whole trick. Topspin and sidespin make the ball dip into the box, which lets a player swing at full speed while still landing it, and makes the ball kick up awkwardly after it bounces.',
    example:
      'A player’s stat sheet showing 62% first serves in, 78% of first-serve points won and 48% of second-serve points won describes a normal professional: dominant behind the first serve, roughly a coin toss behind the second.',
    whyItMatters:
      'Second-serve points won is one of the most predictive statistics in tennis, because a weak second serve hands the initiative to the returner in a quarter to a third of all points on serve. Attacking second serves is a plan every professional has.',
    misunderstandings:
      '**"A higher first-serve percentage is always better."** Not necessarily. A player can raise their first-serve percentage by hitting it softer, and lose more points doing so. What matters is the combination of the percentage and what those serves win.',
    related: [
      'how-serving-works',
      'double-fault',
      'kick-serve',
      'attacking-second-serves',
      'second-serve-points-won',
    ],
    ...RULES,
  }),

  definition({
    slug: 'ace',
    title: 'What Is an Ace?',
    category: 'serving',
    alsoIn: ['glossary', 'statistics'],
    order: 30,
    summary: 'A legal serve the receiver does not touch.',
    oneSentence:
      'An ace is a serve that lands in and which the receiver fails to make contact with.',
    explanation:
      'The serve must be legal: in the correct box, no foot fault, no let. The receiver must not touch it with the racket at all. If they get a racket to it and fail to return it, the point is still won by the server, but it is a service winner rather than an ace.\n\nAces can be hit on a second serve, and doing so is one of the more spectacular things in tennis precisely because the margin for error is nil.',
    example:
      'A serve down the middle from the deuce court that the receiver leans towards and misses entirely is an ace. The same serve, touched with the frame, is not.',
    whyItMatters:
      'Aces are the visible tip of a much larger effect. A player with a high ace count is usually also winning a great many points on serves the receiver touched but could not use, and the ace count understates their serving advantage rather than measuring it.',
    misunderstandings:
      '**"Any unreturnable serve is an ace."** Only untouched ones. This distinction is why ace counts differ between two data providers watching the same match: judging whether a racket grazed the ball is a real call.',
    related: ['service-winner', 'aces-statistic', 'flat-serve', 'how-serving-works'],
    ...RULES,
  }),

  definition({
    slug: 'service-winner',
    title: 'What Is a Service Winner?',
    category: 'serving',
    alsoIn: ['statistics'],
    order: 40,
    summary: 'A serve the receiver touches but cannot put back in play.',
    oneSentence:
      'A service winner is a serve that wins the point outright despite the receiver getting a racket to it.',
    explanation:
      'The receiver makes contact but the return does not land in the court, or does not come back at all. The distinction from an ace is contact and nothing else.\n\nSome data providers report aces and service winners separately, some fold both into "unreturned serves", and the second is the more useful number because it does not depend on judging whether a racket brushed the ball.',
    whyItMatters:
      'When comparing servers, unreturned serve percentage is the sturdier statistic. Ace counts are sensitive to how a particular tournament’s scorers make a marginal call; the count of serves that came back is not.',
    related: ['ace', 'aces-statistic', 'return-of-serve', 'first-serve-points-won'],
  }),

  rule({
    slug: 'fault',
    title: 'What Is a Fault?',
    category: 'serving',
    alsoIn: ['glossary'],
    order: 50,
    summary: 'A serve that fails, which costs an attempt rather than the point.',
    oneSentence:
      'A fault is a serve that does not land in the correct service box, or that breaks one of the rules about how a serve is struck.',
    howItWorks:
      'A serve is a fault if it:\n\n- lands outside the correct service box, including in the other box, beyond the service line, or in the alley;\n- hits the net and does not go over, or goes over and lands out;\n- is missed entirely on the swing, having been released with intent to strike;\n- is struck while the server’s foot touches the baseline, the court, or the wrong side of the centre mark, which is a foot fault;\n- is struck before the ball has been released, or after it has bounced.\n\nA first fault costs only the attempt. A second fault loses the point.',
    diagram: {
      court: 'singles',
      caption: 'Three serves from the deuce court: one good, one long, one into the wrong box.',
      steps: [
        {
          caption: 'In. The ball lands inside the diagonally opposite service box.',
          spots: [{ x: 34, y: 64, kind: 'in', label: 'In' }],
          arrows: [{ kind: 'serve', fromX: 62, fromY: 5, toX: 34, toY: 64 }],
          zones: [{ x: 17, y: 50, width: 33, height: 23.5 }],
        },
        {
          caption:
            'Long. Past the service line, so it is a fault even though it is inside the court.',
          spots: [{ x: 34, y: 80, kind: 'out', label: 'Fault' }],
          arrows: [{ kind: 'serve', fromX: 62, fromY: 5, toX: 34, toY: 80 }],
          zones: [{ x: 17, y: 50, width: 33, height: 23.5 }],
        },
        {
          caption:
            'Wrong box. A perfectly good-looking serve, into the box the receiver is not standing in.',
          spots: [{ x: 66, y: 64, kind: 'out', label: 'Fault' }],
          arrows: [{ kind: 'serve', fromX: 62, fromY: 5, toX: 66, toY: 64 }],
          zones: [{ x: 17, y: 50, width: 33, height: 23.5 }],
        },
      ],
    },
    whyItMatters:
      'The two-attempt structure is what makes the first serve a free swing and the second serve a liability, and every serving tactic in the sport follows from that.',
    ruleDifferences:
      'A serve that touches the net and lands in the correct box is a **let** under the Rules of Tennis and is replayed. Some competitions, notably college tennis and certain experimental formats, play a no-let rule where that serve is live.',
    misunderstandings:
      '**"A fault means the point is lost."** Only a second one. The first costs the attempt.\n\n**"Missing the ball on the toss is a fault."** Only if the racket swing was made. A player who tosses and catches the ball without swinging may simply toss again, though repeated tosses can draw a time violation.',
    related: ['double-fault', 'foot-fault', 'let', 'where-a-serve-must-land', 'how-serving-works'],
    ...RULES,
  }),

  rule({
    slug: 'double-fault',
    title: 'What Is a Double Fault?',
    category: 'serving',
    alsoIn: ['glossary', 'statistics'],
    order: 60,
    summary: 'Two failed serves in one point, which loses the point outright.',
    oneSentence:
      'A double fault is two consecutive faults on the same point, and the server loses it.',
    howItWorks:
      'The server misses the first serve and then misses the second. The point ends immediately, with the receiver having done nothing.\n\nIt is the only way in tennis to lose a point without your opponent playing a shot, which is why double faults at high-leverage moments are treated as a psychological event as much as a technical one.',
    example:
      'A double fault at 30-40 does not just lose a point: it converts a break point without the returner hitting a ball.',
    whyItMatters:
      'Double faults are cheap in isolation and expensive in pattern. Two or three a set is normal; ten in a match usually means a player has lost trust in their second serve and is either pushing it in or over-hitting it, both of which cost more points than the double faults themselves.',
    misunderstandings:
      '**"Low double faults means a good server."** It can mean a cautious one. A player who never double faults may be hitting a second serve so safe that they lose the following point instead, which does not show up in this statistic at all.',
    related: [
      'fault',
      'first-serve-vs-second-serve',
      'double-faults-statistic',
      'second-serve-points-won',
    ],
    ...RULES,
  }),

  rule({
    slug: 'let',
    title: 'What Is a Let?',
    category: 'serving',
    alsoIn: ['glossary'],
    order: 70,
    summary:
      'A point or a serve replayed, most often because the serve clipped the net and went in.',
    oneSentence:
      'A let is a replayed serve or point, most commonly called when a serve touches the net and still lands in the correct box.',
    howItWorks:
      '**A service let** is called when the serve touches the net, strap or band and lands in the correct service box. The serve is replayed, and it does not cost the server an attempt: a let on a first serve means a fresh first serve.\n\n**A let is also called** when the serve is delivered before the receiver is ready, or when play is interrupted by something outside the point, such as a ball rolling onto the court. In that case the whole point is replayed, unless the interruption came after a fault, in which case only the second serve is replayed.\n\nThere is no limit on lets. A serve can clip the net repeatedly and be replayed every time.',
    whyItMatters:
      'The let rule exists because a net cord is chance rather than skill on the one shot where the ball is not yet in play. Once the rally has started, a ball clipping the net is simply live, which is the deliberate contrast.',
    ruleDifferences:
      'The **no-let rule**, under which a serve clipping the net is played as it lands, is used in college tennis in the United States and has been trialled in some professional formats. Under the Rules of Tennis the let stands, and it is the default at every professional tournament.',
    misunderstandings:
      '**"A let costs you your first serve."** It does not. A let on a first serve is replayed as a first serve.\n\n**"Any net contact is a let."** Only on the serve. A rally ball that clips the net and lands in is in play.',
    related: ['fault', 'ball-hits-the-net', 'how-serving-works', 'net-rules'],
    ...RULES,
  }),

  rule({
    slug: 'where-a-serve-must-land',
    title: 'Where Must a Serve Land?',
    category: 'serving',
    alsoIn: ['court'],
    order: 80,
    summary: 'In the service box diagonally opposite, alleys excluded, lines included.',
    oneSentence:
      'A serve must land inside the service box diagonally opposite the server, and a ball touching any line of that box is in.',
    howItWorks:
      'The court has four service boxes, two each side of the net, bounded by the service line, the centre service line and the singles sidelines.\n\nServing from the **deuce court**, the right of the centre mark, the target is the box to the server’s left as they look across the net: the receiver’s right.\n\nServing from the **ad court**, the left of the centre mark, the target is the other one.\n\nThe doubles alleys are never a legal target, in either format. A serve into the alley is a fault in doubles exactly as it is in singles, because the service boxes do not change size between the two.',
    diagram: {
      court: 'doubles',
      caption:
        'The two targets. The alleys, drawn to the outside, are never in play for a serve, in singles or doubles.',
      steps: [
        {
          caption:
            'From the deuce court, right of the centre mark, the target is the far box on the left.',
          players: [
            { id: 's', label: 'S', side: 'near', x: 62, y: 3, hasBall: true, highlight: true },
          ],
          zones: [{ x: 17, y: 50, width: 33, height: 23.5, label: 'Target' }],
          arrows: [{ kind: 'serve', fromX: 62, fromY: 5, toX: 34, toY: 64 }],
        },
        {
          caption:
            'From the ad court, left of the centre mark, the target is the far box on the right.',
          players: [
            { id: 's', label: 'S', side: 'near', x: 38, y: 3, hasBall: true, highlight: true },
          ],
          zones: [{ x: 50, y: 50, width: 33, height: 23.5, label: 'Target' }],
          arrows: [{ kind: 'serve', fromX: 38, fromY: 5, toX: 66, toY: 64 }],
        },
      ],
    },
    misunderstandings:
      '**"The alleys are in for the serve in doubles."** They are not, and this is the single most common misunderstanding about doubles.',
    related: [
      'service-boxes',
      'ad-court-and-deuce-court',
      'fault',
      'doubles-alleys',
      'ball-on-the-line',
    ],
    ...RULES,
  }),

  rule({
    slug: 'serving-order',
    title: 'Serving Order Explained',
    category: 'serving',
    order: 90,
    summary: 'Who serves when, across games, sets and tiebreaks.',
    oneSentence:
      'Players alternate service games throughout a match, with the order carrying across set boundaries rather than resetting.',
    howItWorks:
      '**Within a game**, one player serves every point, alternating between the deuce court and the ad court.\n\n**Between games**, the serve passes to the opponent. There are no exceptions inside a set.\n\n**Between sets**, the order carries. If a set ends with a player serving the last game, their opponent serves the first game of the next set. The order never resets, which is why the player who served first in a set is not necessarily the one who serves first in the next.\n\n**After a tiebreak**, the player who did *not* serve the first point of the tiebreak serves the first game of the following set. That rule exists purely to keep the alternation intact across the tiebreak’s unusual pattern.',
    example:
      'A set finishing 7-5 has thirteen games. The player who served first in that set served games 1, 3, 5, 7, 9, 11 and 13, so their opponent serves first in the next set.',
    whyItMatters:
      'Serving first in a set is a small but real advantage: it means the opponent is always serving to stay in the set, from 4-5 onwards. It is why the toss winner’s choice is not automatic.',
    related: [
      'how-a-tiebreak-works',
      'changing-ends',
      'doubles-serving-order',
      'how-serving-works',
    ],
    ...RULES,
  }),

  rule({
    slug: 'changing-ends',
    title: 'Changing Ends Explained',
    category: 'serving',
    alsoIn: ['court'],
    order: 100,
    summary: 'After the first game, then every second game, and every six points in a tiebreak.',
    oneSentence:
      'Players change ends after the first game of a set and after every second game thereafter, and every six points during a tiebreak.',
    howItWorks:
      'Ends change after games 1, 3, 5, 7 and so on: the odd-numbered games. Players may sit for a short break at each change, except after the first game of a set, where they change ends and continue.\n\nIn a **tiebreak**, ends change after every six points played, without a seated break.\n\nAt the end of a set, players change ends if the total number of games in that set was odd. If it was even, they change after the first game of the next set instead, which keeps the odd-game pattern running continuously.',
    whyItMatters:
      'The rule exists to share conditions. Sun, wind, a sloping court and a distracting background are all one-sided, and changing on odd games means neither player accumulates an advantage over a long match.',
    misunderstandings:
      '**"You change ends every two games."** After the first game, then every two. The offset is what makes the sequence odd-numbered rather than even.',
    related: [
      'serving-order',
      'how-a-tiebreak-works',
      'wind-in-tennis',
      'how-a-tennis-match-works',
    ],
    ...RULES,
  }),

  rule({
    slug: 'foot-fault',
    title: 'Foot Fault Explained',
    category: 'serving',
    order: 110,
    difficulty: 'intermediate',
    summary: 'Touching the wrong ground before striking the serve, which costs the serve.',
    oneSentence:
      'A foot fault is called when the server touches the baseline, the court inside it, or the wrong side of the centre mark before striking the ball.',
    howItWorks:
      'From the moment the server takes their stance until the ball is struck, they may not:\n\n- touch the baseline or the court inside it with either foot;\n- touch, with either foot, the area beyond the imaginary extension of the sideline;\n- touch, with either foot, the wrong side of the imaginary extension of the centre mark;\n- walk or run, though small movements of the feet are permitted.\n\nA foot fault is a fault. It costs the attempt exactly as a serve into the net does, so a foot fault on the second serve is a double fault.',
    diagram: {
      court: 'singles',
      caption:
        'The server’s legal area: behind the baseline, between the centre mark and the sideline extension.',
      steps: [
        {
          caption:
            'Legal. Both feet behind the baseline, on the correct side of the centre mark, serving to the deuce court.',
          players: [
            { id: 's', label: 'S', side: 'near', x: 64, y: 3, hasBall: true, highlight: true },
          ],
          zones: [{ x: 50, y: 0, width: 44, height: 6, label: 'Legal' }],
        },
        {
          caption: 'Foot fault. The foot has crossed the baseline before contact.',
          players: [
            { id: 's', label: 'S', side: 'near', x: 64, y: 8, hasBall: true, highlight: true },
          ],
          spots: [{ x: 64, y: 6, kind: 'out', label: 'Contact' }],
        },
      ],
    },
    whyItMatters:
      'It is called far less often than it occurs, because a line official has to watch a foot rather than a ball. When it is called at a critical moment it becomes a story, which is a symptom of inconsistent enforcement rather than of the rule.',
    ruleDifferences:
      'Who calls it varies. At tournaments using full electronic line calling, foot faults may be called automatically or may remain a human judgment depending on the system deployed; at tournaments with line judges, it is theirs to call. That is an operational difference between events, not a difference in the rule.',
    misunderstandings:
      '**"You can jump into the court."** You can, and every professional does. The rule governs contact with the ground before the ball is struck, not where you land afterwards.',
    related: ['fault', 'how-serving-works', 'line-judges', 'electronic-line-calling'],
    ...RULES,
  }),

  rule({
    slug: 'serving-in-a-tiebreak',
    title: 'How Serving Works in a Tiebreak',
    category: 'serving',
    alsoIn: ['scoring'],
    order: 120,
    difficulty: 'intermediate',
    summary: 'One point, then two each, changing ends every six.',
    oneSentence:
      'The player due to serve serves the first point of the tiebreak, after which each player serves two points at a time.',
    howItWorks:
      'The player whose turn it is to serve serves **point 1** from the deuce court.\n\nService then passes, and each player serves **two consecutive points**: the first from the ad court, the second from the deuce court.\n\n**Ends change after every six points.**\n\nAfter the tiebreak, the player who did not serve its first point serves the first game of the next set.',
    diagram: {
      court: 'singles',
      caption: 'The first four points of a tiebreak. A serves once, then B serves twice.',
      steps: [
        {
          caption: 'Point 1: A serves from the deuce court.',
          players: [
            { id: 'a', label: 'A', side: 'near', x: 62, y: 3, hasBall: true, highlight: true },
            { id: 'b', label: 'B', side: 'far', x: 76, y: 96 },
          ],
          arrows: [{ kind: 'serve', fromX: 62, fromY: 5, toX: 34, toY: 64 }],
        },
        {
          caption: 'Point 2: service passes. B serves from their ad court.',
          players: [
            { id: 'a', label: 'A', side: 'near', x: 24, y: 4 },
            { id: 'b', label: 'B', side: 'far', x: 62, y: 97, hasBall: true, highlight: true },
          ],
          arrows: [{ kind: 'serve', fromX: 62, fromY: 95, toX: 34, toY: 36 }],
        },
        {
          caption: 'Point 3: B serves again, this time from their deuce court.',
          players: [
            { id: 'a', label: 'A', side: 'near', x: 76, y: 4 },
            { id: 'b', label: 'B', side: 'far', x: 38, y: 97, hasBall: true, highlight: true },
          ],
          arrows: [{ kind: 'serve', fromX: 38, fromY: 95, toX: 66, toY: 36 }],
        },
      ],
    },
    whyItMatters:
      'The one-then-two pattern is what makes a tiebreak fair. If each player served two from the start, one of them would serve first at every even score, and in a format decided by a two-point margin that is a structural edge rather than a detail.',
    ruleDifferences:
      'A ten-point **match tiebreak** uses the same rotation and the same six-point change of ends. The only change is the target.',
    misunderstandings:
      '**"You keep serving until you lose a point."** No. Service rotates on a fixed count regardless of who is winning the points.',
    related: ['how-a-tiebreak-works', 'tiebreak', 'match-tiebreak', 'serving-order'],
    ...RULES,
  }),
];

/* ────────────────────────────────────────────────────────────────────────────
 * The court & lines
 * ────────────────────────────────────────────────────────────────────────── */

const COURT: ExplainerSeed[] = [
  courtArea({
    slug: 'tennis-court',
    title: 'Tennis Court Explained',
    category: 'court',
    isStartHere: true,
    isFeatured: true,
    order: 10,
    readMinutes: 5,
    summary: 'The dimensions, the lines and the net, and which parts of each are in play.',
    oneSentence:
      'A tennis court is a rectangle 78 feet long, 27 feet wide for singles and 36 for doubles, divided across the middle by a net.',
    whereItIs:
      'The court is **78 feet (23.77 m) long** from baseline to baseline, and **27 feet (8.23 m) wide** for singles. For doubles it widens to **36 feet (10.97 m)**, the extra width being the two alleys.\n\nThe **net** is stretched across the middle. It stands **3 feet 6 inches (1.07 m)** at the posts and **3 feet (0.914 m)** at the centre, held down by a strap. That sag is deliberate, and it is why the safest crosscourt shot in tennis goes over the middle of the net.\n\nThe **service lines** run parallel to the net, 21 feet (6.4 m) from it on each side. With the centre service line they form the four service boxes.\n\nThe **centre mark** is a short tick at the middle of each baseline, dividing the server’s half into the deuce court and the ad court.\n\nBeyond the lines there is run-back and side space, which is not part of the court but is very much part of the sport: how much room a venue leaves behind the baseline changes how a defensive player can play.',
    diagram: {
      court: 'doubles',
      showLabels: true,
      caption: 'The full doubles court, with the four service boxes marked.',
      steps: [
        {
          caption:
            'The outer rectangle is the doubles court; the inner sidelines bound the singles court. The four boxes are where serves must land.',
          zones: [
            { x: 17, y: 26.5, width: 33, height: 23.5 },
            { x: 50, y: 26.5, width: 33, height: 23.5 },
            { x: 17, y: 50, width: 33, height: 23.5 },
            { x: 50, y: 50, width: 33, height: 23.5 },
          ],
        },
      ],
    },
    whyItMatters:
      'Two proportions decide how tennis is played. The court is nearly three times as long as it is wide, which is why running side to side is more punishing than running forward and back. And the net is lower in the middle, which is why the crosscourt rally is the default pattern of the sport.',
    misunderstandings:
      '**"The net is the same height across."** It is not. It is six inches lower in the centre, and that difference is the reason down-the-line shots carry more risk than crosscourt ones.',
    related: [
      'understanding-the-tennis-court',
      'service-boxes',
      'baseline',
      'doubles-alleys',
      'net-rules',
    ],
    ...RULES,
  }),

  courtArea({
    slug: 'singles-court-vs-doubles-court',
    title: 'Singles Court vs Doubles Court',
    category: 'court',
    alsoIn: ['doubles'],
    order: 20,
    summary: 'The same court with two different sets of sidelines in play.',
    oneSentence:
      'The doubles court is 9 feet wider than the singles court, the difference being the two alleys, and the service boxes are identical in both.',
    whereItIs:
      'Both formats use the same rectangle of ground and the same baselines. What changes is which pair of sidelines counts.\n\nIn **singles**, the inner sidelines bound the court: 27 feet wide. The alleys outside them are out.\n\nIn **doubles**, the outer sidelines bound it: 36 feet wide. The alleys are live for every shot in a rally.\n\nThe **service boxes never change**. They are bounded by the singles sidelines in both formats, which is why a serve into the alley is a fault in doubles.',
    diagram: {
      court: 'doubles',
      caption:
        'The alleys, shaded, are live in doubles and out in singles. The service boxes are the same in both.',
      steps: [
        {
          caption:
            'The two alleys: 4 feet 6 inches each, and the entire difference between the formats.',
          zones: [
            { x: 6, y: 6, width: 11, height: 88, label: 'Alley' },
            { x: 83, y: 6, width: 11, height: 88, label: 'Alley' },
          ],
        },
      ],
    },
    whyItMatters:
      'The extra width sounds small and is not. It opens angles that do not exist in singles, which is why the sharp crosscourt volley is a doubles staple, and it is more ground than two players can cover from the baseline, which is why doubles is played at the net.',
    misunderstandings:
      '**"Doubles is played on a bigger court so there is more running."** There is less. Two players covering 36 feet each have a smaller area each than one player covering 27.',
    related: ['doubles-alleys', 'singles-vs-doubles', 'doubles-court', 'where-a-serve-must-land'],
    ...RULES,
  }),

  courtArea({
    slug: 'baseline',
    title: 'Baseline Explained',
    category: 'court',
    alsoIn: ['glossary'],
    order: 30,
    summary:
      'The line at each end: the boundary of the court, and where most tennis is played from.',
    oneSentence:
      'The baseline is the line at each end of the court, marking the far boundary of play and the line the server stands behind.',
    whereItIs:
      'The baseline runs across each end of the court, 39 feet from the net. It is the boundary: a rally ball landing beyond it is out, and a ball landing on it is in.\n\nThe server must stand behind it, between the centre mark and the sideline, until the ball is struck.\n\nIn play, most professionals stand on or a little behind it to return and rally, and how far behind is one of the clearest tells about a player’s style.',
    whyItMatters:
      'Court position relative to the baseline is the single clearest indicator of who is dictating a rally. A player pushed two metres behind it is defending, whatever the shot looks like; a player standing on it or inside it is taking time away from their opponent.',
    misunderstandings:
      '**"Standing behind the baseline is safer."** It buys time and costs angle. From well behind the baseline the geometry of the court works against you: every shot has further to travel and the opponent has more room to aim into.',
    related: [
      'playing-from-the-baseline',
      'court-positioning',
      'baseline-player',
      'taking-the-ball-early',
    ],
    ...RULES,
  }),

  courtArea({
    slug: 'service-boxes',
    title: 'Service Boxes Explained',
    category: 'court',
    order: 40,
    summary:
      'The four rectangles a serve must land in, and the only part of the court the serve uses.',
    oneSentence:
      'The service boxes are the four rectangles between the net and the service lines, bounded by the singles sidelines and divided by the centre service line.',
    whereItIs:
      'Each half of the court contains two service boxes. They run from the net to the service line, 21 feet away, and from the centre service line out to the **singles** sideline on each side.\n\nThat last detail is what surprises people: the boxes are bounded by the singles sidelines in both singles and doubles, so they are the same size regardless of the format being played.\n\nA serve must land inside the box diagonally opposite the server, with a ball touching any of its lines counting as in.',
    diagram: {
      court: 'doubles',
      caption:
        'The four service boxes. They stop at the singles sidelines, which is why the alleys are never a legal serve target.',
      steps: [
        {
          caption: 'Two boxes each side of the net, divided by the centre service line.',
          zones: [
            { x: 17, y: 26.5, width: 33, height: 23.5, label: 'Ad' },
            { x: 50, y: 26.5, width: 33, height: 23.5, label: 'Deuce' },
            { x: 17, y: 50, width: 33, height: 23.5, label: 'Deuce' },
            { x: 50, y: 50, width: 33, height: 23.5, label: 'Ad' },
          ],
        },
      ],
    },
    whyItMatters:
      'The box is a small target hit from a long way away, and getting smaller as the server moves faster. Serving strategy is almost entirely about which corner of that box is used, and how often the pattern is varied.',
    misunderstandings:
      '**"The service box is bigger in doubles."** It is not. The alleys are outside it in both formats.',
    related: [
      'where-a-serve-must-land',
      'ad-court-and-deuce-court',
      'serve-direction-analysis',
      'tennis-court',
    ],
    ...RULES,
  }),

  courtArea({
    slug: 'doubles-alleys',
    title: 'Doubles Alleys Explained',
    category: 'court',
    alsoIn: ['doubles', 'glossary'],
    aliases: ['tramlines'],
    order: 50,
    summary: 'The strips down each side, in for doubles rallies and out for everything else.',
    oneSentence:
      'The alleys are the 4-foot-6-inch strips between the singles and doubles sidelines, live in doubles rallies and out in singles.',
    whereItIs:
      'One down each side of the court, running the full length from baseline to baseline. They are also called the tramlines.\n\nThey are **in play** for every rally shot in doubles.\n\nThey are **out** for every shot in singles, and **out for the serve in both formats**, because the service boxes are bounded by the singles sidelines.',
    whyItMatters:
      'The alley is where doubles angles come from. A volley hit sharply crosscourt into the alley is unreachable in a way it would not be on a singles court, and defending that angle is why the net player stands where they do.',
    misunderstandings:
      '**"The alley is in for the serve in doubles."** It is not, and it is the most common rules misunderstanding in the sport.',
    related: [
      'singles-court-vs-doubles-court',
      'where-a-serve-must-land',
      'doubles-positioning',
      'using-angles',
    ],
    ...RULES,
  }),

  rule({
    slug: 'ball-on-the-line',
    title: 'What Happens When the Ball Hits the Line?',
    category: 'court',
    order: 60,
    summary: 'A ball touching any part of a line is in.',
    oneSentence: 'If any part of the ball touches any part of the line, the ball is in.',
    howItWorks:
      'The lines are part of the court they bound. A ball that touches even a sliver of a line is good, and it does not matter how little of it made contact.\n\nWhat is judged is the ball’s **contact patch**: where the ball actually touched the ground, which is wider than the ball itself because a ball compresses on impact. This is why electronic line calling shows an ellipse rather than a circle, and why a ball that looks out to the naked eye can be shown as touching.\n\nFor the serve, the same rule applies to the lines of the service box.',
    example:
      'A ball whose mark on clay overlaps the outer edge of the sideline by a millimetre is in, and the umpire climbing down to inspect the mark is checking exactly that.',
    ruleDifferences:
      'How the call is made differs by tournament. Events with full electronic line calling have the system make every line call automatically; events with line judges have humans call and, where a challenge system is in place, allow players to ask for a review. On clay, the mark in the surface has traditionally been the evidence, which is why chair umpires on clay inspect marks in a way they never do on hard courts.',
    misunderstandings:
      '**"Mostly out means out."** Any contact at all means in. There is no proportion test.',
    related: ['when-is-a-ball-out', 'electronic-line-calling', 'hawk-eye', 'player-challenges'],
    ...RULES,
  }),

  rule({
    slug: 'ball-hits-the-net',
    title: 'What Happens When the Ball Hits the Net?',
    category: 'court',
    order: 70,
    summary: 'In a rally, play continues. On a serve, it is a let or a fault.',
    oneSentence:
      'A rally ball that clips the net and lands in is live, while a serve that clips the net is replayed if it lands in and a fault if it does not.',
    howItWorks:
      '**In a rally**, the net is simply an obstacle. A ball that touches the net, the strap or the band and lands in the correct court is in play, and the point continues. A net cord that drops dead on the other side wins the point exactly as any other shot would.\n\n**On a serve**, the ball touching the net makes it either a **let**, if it lands in the correct service box, or a **fault**, if it does not.\n\n**A ball that does not cross** the net at all loses the point for the player who hit it.',
    whyItMatters:
      'The contrast is deliberate. Before the ball is in play, chance on the net cord is removed by replaying it; once the rally has started, chance is part of the game.',
    ruleDifferences:
      'The no-let rule used in college tennis removes the distinction on the serve as well, playing a net-cord serve as live if it lands in.',
    misunderstandings:
      '**"A net cord in a rally is a let."** It is not. Play continues, and this catches out beginners more than any other rule in tennis.',
    related: ['let', 'net-rules', 'when-is-a-ball-out'],
    ...RULES,
  }),

  rule({
    slug: 'when-is-a-ball-out',
    title: 'When Is a Ball Out?',
    category: 'court',
    order: 80,
    summary: 'When it lands entirely beyond the lines, and not before.',
    oneSentence:
      'A ball is out when it lands completely outside the boundary lines without touching any part of them.',
    howItWorks:
      'A ball is out if it lands entirely beyond the baseline, entirely beyond the sideline in play for that format, or in the wrong service box on a serve.\n\nA ball is judged where it **lands**, not where it flies. A shot that travels well outside the sideline in the air and curves back to land on it is in.\n\nA ball that hits the ground first and then hits a permanent fixture, such as a post or the umpire’s chair, has already landed, so the landing decides it. A ball that hits the fixture **before** bouncing is out.\n\nA ball may be struck before it bounces at all, in which case where it would have landed is irrelevant: taking a ball out of the air that was travelling out means losing the point.',
    example:
      'A player who volleys a ball that was heading three metres long loses the point. This is a real and regular error at every level, and it is why players are taught to let long balls go.',
    ruleDifferences:
      'Who calls it varies by event: automated line calling at some tournaments, line judges with a challenge system at others, and self-officiating below professional level, where each player calls their own side.',
    misunderstandings:
      '**"It looked out from the side."** Parallax makes a ball look out from any angle other than along the line, which is why line judges sit where they do and why players who challenge from the far corner are usually wrong.',
    related: ['ball-on-the-line', 'electronic-line-calling', 'player-challenges', 'line-judges'],
    ...RULES,
  }),

  rule({
    slug: 'net-rules',
    title: 'Net Rules',
    category: 'court',
    order: 90,
    difficulty: 'intermediate',
    summary: 'What you may not touch, and when you may reach over.',
    oneSentence:
      'A player loses the point if they or anything they carry or wear touches the net while the ball is in play, and may only reach over the net in one specific circumstance.',
    howItWorks:
      '**Touching the net.** While the ball is in play, a player must not touch the net, the posts, the strap or the band with their racket, their body or their clothing. Doing so loses the point immediately, regardless of what the ball was doing.\n\n**Reaching over.** A player may not reach over the net to play a ball, with one exception: if the ball bounces on their side and then spins or is blown back over the net, they may reach over to play it, provided they do not touch the net.\n\n**Crossing under.** A player may not touch the opponent’s court with any part of their body while the ball is in play, though the racket may follow through over the net after contact made on their own side.\n\n**Hitting the opponent.** A ball in play that strikes an opponent, or anything they are wearing or carrying, wins the point for the player who hit it.',
    example:
      'A player racing forward for a drop shot puts the ball away and their momentum carries their shirt into the net. They lose the point, even though the ball was already dead by any ordinary reading of the rally.',
    whyItMatters:
      'The rule is absolute and it decides real points at professional level, most often when a player finishes a winning volley and follows through into the net.',
    misunderstandings:
      '**"You lose the point only if it affects play."** There is no such test. Contact with the net while the ball is in play loses the point, whether or not it changed anything.',
    related: ['ball-hits-the-net', 'volley', 'coming-to-the-net', 'drop-shot'],
    ...RULES,
  }),

  courtArea({
    slug: 'ad-court-and-deuce-court',
    title: 'Deuce Court and Ad Court',
    category: 'court',
    alsoIn: ['glossary', 'serving'],
    aliases: ['ad court', 'deuce side', 'ad side'],
    order: 100,
    summary: 'The two halves of a player’s side, named after the scores usually played from each.',
    oneSentence:
      'The deuce court is the right half of a player’s side as they face the net, and the ad court is the left half.',
    whereItIs:
      'The centre mark on the baseline divides each player’s half in two.\n\nThe **deuce court** is the right-hand half, so called because deuce and every even point score is played from there.\n\nThe **ad court** is the left-hand half, where advantage points are played from.\n\nEvery game starts in the deuce court, and the serve alternates sides on every point.',
    whyItMatters:
      'The two sides are not equivalent, and matchups turn on the difference. For a right-hander serving, the wide serve in the deuce court pulls the returner off the forehand side, while the wide serve in the ad court attacks a right-hander’s backhand. That is why left-handed servers are so awkward: their wide serve in the ad court, at 30-40 and at deuce, drags a right-hander’s backhand off the court at exactly the moments that decide games.',
    misunderstandings:
      '**"Advantage is always played from the ad court."** It is, and that is where the name comes from, but the ad court is a place rather than a score: the second point of every game is played from it whatever the score.',
    related: [
      'where-a-serve-must-land',
      'deuce',
      'advantage',
      'serve-direction-analysis',
      'slice-serve',
    ],
    ...RULES,
  }),
];

export const TENNIS_SERVING_AND_COURT: ExplainerSeed[] = [...SERVING, ...COURT];
