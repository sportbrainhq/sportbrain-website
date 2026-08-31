import type { ExplainerSeed } from './explainer-types';
import { definition, playingStyle, shot, tactic } from './tennis-explainer-helpers';
import { TENNIS_REVIEWED, TENNIS_RULE_REVISION } from './tennis-explainers';

/**
 * Shots, playing styles and tactics.
 *
 * The three categories a reader moves through in order: what the strokes are,
 * how a player combines them into an identity, and what either player is trying
 * to do to the other. Splitting them across files would separate the drop shot
 * from the pattern that sets it up.
 *
 * ## On naming players
 *
 * The brief asks for the players associated with each shot and style, and the
 * `notable_players` section exists for it. Two rules govern what goes in there.
 *
 * First, a name is included when the association is a matter of record rather
 * than of taste: a one-handed backhand is a fact about a player, and a "best
 * forehand ever" is not. Where the claim is an opinion held widely, it is
 * attributed as such rather than asserted.
 *
 * Second, no active player's current form is described. Careers move, articles
 * do not, and a sentence about who is currently the best returner in the game
 * is wrong within a season with nothing to flag it. Historical association is
 * durable; a form assessment is a data problem pretending to be prose.
 */

const RULES = {
  ruleSensitive: true,
  sourceRevision: TENNIS_RULE_REVISION,
  lastReviewedAt: TENNIS_REVIEWED,
  sourceKeys: [{ key: 'itf-rules' }],
};

/* ────────────────────────────────────────────────────────────────────────────
 * Shots & technique
 * ────────────────────────────────────────────────────────────────────────── */

const SHOTS: ExplainerSeed[] = [
  shot({
    slug: 'forehand',
    title: 'Forehand Explained',
    category: 'shots',
    alsoIn: ['glossary'],
    isStartHere: true,
    order: 10,
    summary: 'The groundstroke hit on your dominant side, and the shot most points are won with.',
    oneSentence:
      'A forehand is a groundstroke hit on the same side of the body as the racket hand, with the palm leading through contact.',
    theShot:
      'For a right-hander, the forehand is played on the right side. The player turns their shoulders away from the net, swings from low to high, and strikes the ball in front of the body.\n\nThe modern professional forehand is hit with a semi-western or western grip, which places the hand further under the handle and makes heavy topspin natural. That is a change from the flatter, eastern-grip forehand of earlier eras, and it is the main reason the modern game is played further behind the baseline: a heavy topspin forehand bounces higher and pushes the opponent back.',
    whenUsed:
      'Whenever a player can reach the ball on their dominant side, and often when they cannot: running around the backhand to hit a forehand instead is one of the most common patterns in professional tennis.',
    advantages:
      '- The stronger side for almost every player, because one arm can be swung faster than two.\n- Accepts more grip variety, so the same wing can produce a heavy topspin ball, a flat drive and a sharp angle.\n- The shot most players can hit hardest, and the one most winners come from.',
    risks:
      '- It is the bigger swing, so it is the one that breaks down first under time pressure.\n- Running around the backhand to hit a forehand leaves a large part of the court open, and a player who does it too often can be exposed by one shot behind them.',
    notablePlayers:
      'The forehand is the shot that most often defines a player’s game. Rafael Nadal’s heavy left-handed topspin forehand, hit with extreme spin into a right-hander’s backhand, is the clearest example of a single stroke shaping an entire era’s tactics.',
    misunderstandings:
      '**"The forehand is the easy side."** It is the stronger side and the harder one to keep consistent, because a bigger swing has more that can go wrong.',
    related: ['backhand', 'topspin', 'inside-out-forehand', 'flat-shot', 'targeting-the-backhand'],
  }),

  shot({
    slug: 'backhand',
    title: 'Backhand Explained',
    category: 'shots',
    alsoIn: ['glossary'],
    isStartHere: true,
    order: 20,
    summary: 'The groundstroke hit on the non-dominant side, played with one hand or two.',
    oneSentence:
      'A backhand is a groundstroke hit on the opposite side of the body to the racket hand, with the back of the hand leading through contact.',
    theShot:
      'For a right-hander, the backhand is played on the left side. The body turns further than on the forehand, and the ball is struck slightly further in front.\n\nIt is hit either with one hand or with two, and the choice changes the shot substantially enough that it has its own explainer. Almost every professional also has a one-handed **slice** backhand regardless of which they drive with, because the slice is the defensive and changing-of-pace version of the wing.',
    whenUsed:
      'On every ball to the non-dominant side that the player does not run around. At professional level that is roughly a third to a half of all groundstrokes, and more against an opponent deliberately targeting it.',
    advantages:
      '- Shorter, more compact swing than the forehand, so it holds up better against pace and on fast surfaces.\n- The two-handed version is more stable against high balls and heavy topspin.\n- Backhand down the line is one of the highest-value shots in tennis, because it changes the direction of a crosscourt rally.',
    risks:
      '- Reach is shorter than on the forehand, particularly with two hands, so wide balls are harder to retrieve.\n- It is the side most opponents will attack, so it is played under pressure more often than the forehand is.',
    notablePlayers:
      'The one-handed backhand has become the minority choice at professional level and is strongly associated with players such as Roger Federer, Stan Wawrinka and Justine Henin. Novak Djokovic’s two-handed backhand is the modern reference point for the shot as a defensive and redirecting weapon.',
    related: [
      'one-handed-vs-two-handed-backhand',
      'slice',
      'targeting-the-backhand',
      'forehand',
      'crosscourt-vs-down-the-line',
    ],
  }),

  shot({
    slug: 'one-handed-vs-two-handed-backhand',
    title: 'One-Handed vs Two-Handed Backhand',
    category: 'shots',
    order: 30,
    difficulty: 'intermediate',
    summary: 'Reach and disguise against stability and power: the trade every player makes once.',
    oneSentence:
      'The one-handed backhand offers more reach, more natural slice and better disguise, and the two-hander offers more stability, easier power and a better answer to high balls.',
    theShot:
      'The **one-hander** is struck with the dominant hand alone, the non-dominant hand having let go during the take-back. The swing is longer, the contact point further in front, and the shoulder turn more complete.\n\nThe **two-hander** keeps both hands on the handle, and the non-dominant hand does much of the work. It is closer to a left-handed forehand for a right-hander than it is to a one-handed backhand.',
    whenUsed:
      'Both are full-time choices rather than situational ones. Almost every two-handed player also hits a one-handed slice, so the distinction is really about which shot they drive with.',
    advantages:
      '**One hand:**\n- Greater reach on wide balls.\n- The slice comes from the same grip, so switching between drive and slice is seamless.\n- Better disguise, because the contact point is not committed as early.\n- Naturally more comfortable at the net, since the volley grip is close to the same.\n\n**Two hands:**\n- More stable against pace: two arms absorb a heavy ball better than one.\n- Easier to hit with power for a smaller or younger player, which is why it dominates in junior development.\n- Far better against high balls above shoulder height, which is the shot that ends one-handed rallies on clay.\n- Easier to redirect the ball down the line late.',
    risks:
      '**One hand:** high balls to the backhand are its structural weakness, which is why heavy topspin to that wing is the standard pattern against a one-hander.\n\n**Two hands:** reach on wide balls is shorter, and the transition to a volley requires a grip change under time pressure.',
    notablePlayers:
      'The one-hander is now a minority at professional level, and its best-known modern exponents are Roger Federer, Stan Wawrinka, Justine Henin and Richard Gasquet. The shift towards two hands over the last several decades is one of the clearest technical trends in the sport’s history.',
    misunderstandings:
      '**"The one-hander is obsolete."** It is rarer, which is not the same. Its weaknesses are exposed most by high-bouncing topspin, so it is disadvantaged more on high-bouncing surfaces than on fast low ones.',
    related: ['backhand', 'slice', 'topspin', 'why-clay-is-slower', 'targeting-the-backhand'],
  }),

  shot({
    slug: 'the-serve',
    title: 'Serve Explained',
    category: 'shots',
    alsoIn: ['serving'],
    isStartHere: true,
    order: 40,
    summary: 'The one shot nobody can interfere with, and the most important in the sport.',
    oneSentence:
      'The serve is the shot that starts every point, struck from a stationary position with the ball tossed by the server themselves.',
    theShot:
      'The server tosses the ball, turns the shoulders, and strikes it at full extension above the head. The motion is a chain: legs drive up, hips and shoulders rotate, and the racket accelerates last, which is why the fastest serves come from players who look relaxed rather than from those who look strong.\n\nThree variants are used, distinguished by where the racket brushes the ball: the **flat serve** for speed, the **slice serve** for sideways movement, and the **kick serve** for a high, awkward bounce.',
    whenUsed:
      'On every point. The choice among the three variants is the tactical decision, and professionals mix them deliberately so a returner cannot commit early.',
    advantages:
      '- The only shot hit without an opponent influencing it: no pace to handle, no position to recover from.\n- It can win the point outright, which no other shot in tennis reliably does.\n- It sets up the following shot, which is why serve-plus-one is a named pattern.',
    risks:
      '- Two attempts and no more, so a failing serve becomes a lost point rather than a bad shot.\n- It is the most technically complex stroke and the first to break down under nerves, which is why double faults cluster at 30-40 rather than at 40-0.',
    notablePlayers:
      'Serving reputation tends to attach to players with both power and disguise: Pete Sampras, John Isner and Ivo Karlović are standard reference points for the serve as a dominant weapon, and Roger Federer for placement and disguise rather than raw speed.',
    related: [
      'how-serving-works',
      'flat-serve',
      'kick-serve',
      'slice-serve',
      'serve-plus-one',
      'big-server',
    ],
    ...RULES,
  }),

  shot({
    slug: 'return-of-serve',
    title: 'Return of Serve',
    category: 'shots',
    alsoIn: ['tactics'],
    order: 50,
    summary: 'The second most important shot in tennis, and the hardest to practise.',
    oneSentence:
      'The return is the receiver’s first shot of the point, played against the only ball in tennis they cannot influence beforehand.',
    theShot:
      'The returner starts with a split step as the server strikes the ball, then plays a shortened version of a groundstroke: less take-back, more body turn, and a shorter swing, because there is no time for a full one.\n\nWhat the return is trying to do depends on the serve. Against a big first serve, getting it back deep is a win in itself. Against a second serve, the return is an attacking shot and the first move in a pattern.',
    whenUsed: 'On every point the player is receiving, which is half of them.',
    advantages:
      '- A deep return neutralises the server’s advantage immediately, turning a serve-plus-one pattern into a neutral rally.\n- Returning aggressively against second serves is the most reliable way to create break points.',
    risks:
      '- Standing in to return early takes time from the server and gives you less of it.\n- An over-ambitious return against a first serve is a free point given away, which is why the best returners miss fewer returns rather than hitting more winners.',
    notablePlayers:
      'Returning is the least glamorous elite skill and the one most associated with Novak Djokovic and Andre Agassi, both of whom built their games on taking the ball early and returning deep rather than on serving.',
    misunderstandings:
      '**"A good return is an aggressive return."** A good return is a return that lands deep. Return-in-play percentage correlates with winning far better than return winners do.',
    related: [
      'return-positioning',
      'attacking-second-serves',
      'return-points-won',
      'the-serve',
      'taking-the-ball-early',
    ],
  }),

  shot({
    slug: 'volley',
    title: 'Volley',
    category: 'shots',
    alsoIn: ['glossary', 'doubles'],
    order: 60,
    summary: 'A ball struck before it bounces, played from near the net.',
    oneSentence: 'A volley is any shot struck out of the air before the ball has bounced.',
    theShot:
      'The volley is a block rather than a swing. The racket face is set, the grip is continental, and the contact comes in front of the body with a short punch and almost no follow-through.\n\nIt is played from anywhere but is a net shot in practice, because volleying from the baseline hands the opponent the whole court.',
    whenUsed:
      'After approaching the net, in doubles from the moment the point starts, and defensively when a ball is on the player faster than they can let it bounce.',
    advantages:
      '- Takes time away from the opponent, because the ball is intercepted rather than allowed to travel.\n- Creates angles that are impossible from the baseline, since the net is closer and lower.\n- Ends points, which is why doubles is played this way.',
    risks:
      '- Being at the net means being passed or lobbed, and a player who approaches on a weak ball is simply a target.\n- The margin over the net is small, and a volley into the net is an outright error rather than a rally continued.',
    notablePlayers:
      'Volleying as a primary skill belongs to the serve-and-volley era, and to players such as Martina Navratilova, Stefan Edberg and Patrick Rafter. It remains a core skill in professional doubles regardless of era.',
    related: [
      'half-volley',
      'coming-to-the-net',
      'passing-shot',
      'approach-shot',
      'net-points-won',
    ],
  }),

  shot({
    slug: 'half-volley',
    title: 'Half Volley',
    category: 'shots',
    order: 70,
    difficulty: 'intermediate',
    summary:
      'A ball taken immediately after the bounce, usually because there was no other option.',
    oneSentence:
      'A half volley is a shot struck immediately after the ball bounces, while it is still rising off the court.',
    theShot:
      'The racket meets the ball just as it comes off the ground. There is no backswing to speak of: the player drops the racket head, keeps the wrist firm, and lets the ball’s own bounce provide the pace.\n\nIt is almost always a shot of necessity rather than choice, played when the ball lands at the player’s feet.',
    whenUsed:
      'Most often by a player caught in the middle of the court while moving forward, and by a serve-and-volleyer whose first volley is played from around the service line.',
    advantages:
      '- Keeps a player moving forward when the alternative is to stop and let the ball bounce up.\n- Takes time from the opponent, since the ball is returned at the earliest possible moment.',
    risks:
      '- The smallest margin of any shot in tennis. There is no time to adjust and the ball is rising, so the racket face has to be right before the bounce.\n- Played from too deep, it simply feeds the opponent a short ball.',
    misunderstandings:
      '**"A half volley is a soft volley."** It is not a volley at all in the strict sense: the ball has bounced.',
    related: ['volley', 'serve-and-volley', 'coming-to-the-net', 'taking-the-ball-early'],
  }),

  shot({
    slug: 'overhead-smash',
    title: 'Overhead / Smash',
    category: 'shots',
    alsoIn: ['glossary'],
    aliases: ['smash'],
    order: 80,
    summary: 'A serve-like swing at a high ball, and the standard answer to a lob.',
    oneSentence:
      'An overhead is a shot struck above the head with a serve-like motion, usually in reply to a lob.',
    theShot:
      'The mechanics are close to a serve, with two differences that make it harder: the ball is not tossed by the player, and they are usually moving backwards while hitting it.\n\nThe player turns sideways, tracks the ball with the non-hitting hand pointed at it, and strikes it at full extension. Hit off the ground or out of the air, both are legal.',
    whenUsed: 'Against a lob, and against any high, short ball that can be attacked from above.',
    advantages:
      '- The highest-percentage put-away in tennis when the ball is in the right place.\n- Punishes the lob, which is what stops the lob from being a free defensive shot.',
    risks:
      '- Moving backwards while swinging upwards is difficult, and a deep lob turns an overhead into an awkward jumping shot.\n- Missing one is disproportionately costly psychologically, because it looks like a gift.',
    misunderstandings:
      '**"An overhead has to be hit out of the air."** It does not. Letting a very high lob bounce first is often the better choice, especially on a windy day.',
    related: ['lob', 'volley', 'coming-to-the-net', 'the-serve'],
  }),

  shot({
    slug: 'drop-shot',
    title: 'Drop Shot',
    category: 'shots',
    alsoIn: ['glossary', 'tactics'],
    order: 90,
    summary: 'A softly played ball just over the net, aimed at an opponent standing too far back.',
    oneSentence:
      'A drop shot is a delicately hit ball designed to land just over the net and bounce twice before the opponent can reach it.',
    theShot:
      'Played with an open racket face and backspin, absorbing pace rather than adding it. The backspin makes the ball sit down rather than bounce forward, which is what buys the extra half-second.\n\nDisguise is most of the shot. A drop shot telegraphed by a change of grip and a slower swing is simply a short ball.',
    whenUsed:
      'Against an opponent standing well behind the baseline, against a player who is slow to move forward, and on high-bouncing surfaces where rallies are played from deep. It is used most on clay for exactly that reason, despite the surface making the ball sit up.',
    advantages:
      '- Wins the point outright against a deep-standing opponent.\n- Changes the geometry of a match: once used, the opponent has to stand closer, which makes them vulnerable to depth.\n- Costs almost no physical effort at a moment when the opponent has been made to run.',
    risks:
      '- A drop shot that sits up is the easiest put-away in tennis.\n- It brings the opponent forward, and if they reach it the player is now the one out of position and defending against a net player.\n- On fast, low-bouncing surfaces the ball skids and gives the opponent more time than expected.',
    notablePlayers:
      'The drop shot is most associated with clay-court players and all-court tacticians rather than any single name, and its rise in the modern game is closely tied to how far behind the baseline points are now played.',
    related: ['slice', 'lob', 'coming-to-the-net', 'clay-courts', 'using-angles'],
  }),

  shot({
    slug: 'lob',
    title: 'Lob',
    category: 'shots',
    alsoIn: ['glossary'],
    order: 100,
    summary:
      'A high ball hit over a net player, defensively to buy time or offensively to win the point.',
    oneSentence:
      'A lob is a shot hit high over the opponent, either to pass a net player or to buy time from a defensive position.',
    theShot:
      'Two versions, with different intentions.\n\nThe **defensive lob** is hit high and deep, with the aim of landing near the baseline and giving the player time to recover their court position.\n\nThe **offensive lob** is hit lower and with topspin, so it dips towards the baseline after passing the net player and bounces away from them. It is meant to win the point rather than to survive.',
    whenUsed:
      'Against a net player who has taken away the passing angles, and from deep defensive positions where a normal groundstroke would be attacked.',
    advantages:
      '- Punishes a net player who has closed too tightly.\n- Resets a point that was being lost, which is what makes it a defensive player’s core skill.\n- A topspin lob is close to unreturnable when it is executed.',
    risks:
      '- Short is fatal. A lob that lands mid-court is an overhead waiting to happen.\n- Outdoors, wind and sun make it the most condition-sensitive shot in tennis.',
    related: [
      'overhead-smash',
      'passing-shot',
      'coming-to-the-net',
      'defensive-player',
      'wind-in-tennis',
    ],
  }),

  shot({
    slug: 'slice',
    title: 'Slice',
    category: 'shots',
    alsoIn: ['glossary'],
    aliases: ['backspin', 'underspin'],
    order: 110,
    difficulty: 'intermediate',
    summary: 'Backspin: a ball that stays low, travels slower and changes the rhythm of a rally.',
    oneSentence:
      'A slice is a shot hit with backspin, produced by a high-to-low swing that makes the ball stay low after the bounce.',
    theShot:
      'The racket travels from high to low with an open face, brushing under the ball. The resulting backspin makes the ball float through the air and skid low off the court rather than bouncing up.\n\nIt is most common on the backhand, where almost every professional has one regardless of whether they drive with one hand or two.',
    whenUsed:
      '- Defensively, to get a difficult ball back deep and buy recovery time.\n- To change pace, breaking up a rhythm of heavy topspin exchanges.\n- As an approach shot, because the low bounce forces the opponent to hit up.\n- Against a one-handed backhand, where a low skidding ball is uncomfortable.\n- On grass, where the low bounce is exaggerated by the surface.',
    advantages:
      '- Stays low, forcing the opponent to generate their own lift from below the net.\n- Slower through the air, which gives the player time to recover position.\n- Can be hit from positions where a full swing is impossible.',
    risks:
      '- Slower means the opponent has more time too, so a floating slice to a good player is an invitation.\n- Hit short, it sits up and is attacked.',
    notablePlayers:
      'The backhand slice as a primary rally shot is associated with players such as Steffi Graf, whose sliced backhand was a defining feature of her game rather than an occasional variation.',
    misunderstandings:
      '**"Slice is a defensive shot."** It is a pace-changing shot that can be either. Sliced approach shots are among the most aggressive plays in tennis.',
    related: [
      'topspin',
      'why-slice-stays-low',
      'approach-shot',
      'grass-courts',
      'one-handed-vs-two-handed-backhand',
    ],
  }),

  shot({
    slug: 'topspin',
    title: 'Topspin',
    category: 'shots',
    alsoIn: ['glossary', 'conditions'],
    order: 120,
    difficulty: 'intermediate',
    summary: 'Forward spin that makes the ball dip into the court and kick up off it.',
    oneSentence:
      'Topspin is forward rotation on the ball, produced by a low-to-high swing, which makes the ball dip in flight and bounce higher.',
    theShot:
      'The racket travels from low to high, brushing up the back of the ball. The ball rotates forwards, and that rotation interacts with the air to push it downwards during flight.\n\nThat downward force is what makes topspin so useful: a player can swing much harder and higher over the net, and the spin brings the ball down inside the baseline anyway.',
    whenUsed:
      'On most modern groundstrokes, on second serves, and on passing shots, where the dip makes the ball drop at a net player’s feet.',
    advantages:
      '- Allows greater margin over the net without hitting long.\n- Produces a high bounce, pushing opponents back and above their comfortable strike zone.\n- Makes passing shots dip below the net player’s reach.\n- Makes an aggressive second serve possible at all.',
    risks:
      '- Spin costs speed. A very heavy ball is slower through the air, which gives a well-positioned opponent time.\n- On low-bouncing surfaces such as grass, the high bounce topspin generates is partly cancelled by the court.',
    notablePlayers:
      'Rafael Nadal’s forehand is the standard example of topspin as a tactical weapon rather than a safety margin, generating rotation rates well above his contemporaries and a bounce that pushed opponents metres behind the baseline.',
    related: ['why-topspin-dips', 'slice', 'kick-serve', 'flat-shot', 'clay-courts'],
  }),

  shot({
    slug: 'flat-shot',
    title: 'Flat Shot',
    category: 'shots',
    order: 130,
    difficulty: 'intermediate',
    summary: 'A ball hit with minimal spin: fastest through the air, smallest margin.',
    oneSentence:
      'A flat shot is struck with little spin, travelling faster and straighter than a topspin ball and with less room for error.',
    theShot:
      'The racket travels more directly through the back of the ball than up it. Without much rotation, nothing pushes the ball down, so it must be hit lower over the net to land in.',
    whenUsed:
      'On short balls that can be driven, on fast low-bouncing surfaces where the ball stays in the strike zone, and by players whose game is built on taking time away rather than on pushing opponents back.',
    advantages:
      '- The fastest ball through the air for a given swing speed, so it gives the opponent the least time.\n- Stays lower after the bounce, which is uncomfortable for a player who likes to hit at shoulder height.',
    risks:
      '- The smallest margin over the net of any groundstroke.\n- Highly sensitive to conditions: the same flat drive that lands on the line in warm air sails long in thin air at altitude.',
    notablePlayers:
      'Flat, early-struck ball-striking is associated with players such as Andre Agassi and Jimmy Connors, and with the fast indoor and grass conditions of earlier eras.',
    related: [
      'topspin',
      'taking-the-ball-early',
      'flat-serve',
      'grass-courts',
      'altitude-in-tennis',
    ],
  }),

  shot({
    slug: 'passing-shot',
    title: 'Passing Shot',
    category: 'shots',
    alsoIn: ['glossary'],
    order: 140,
    summary: 'A groundstroke hit past a net player rather than over them.',
    oneSentence: 'A passing shot is a groundstroke aimed past an opponent who has come to the net.',
    theShot:
      'Usually hit low and with topspin, so the ball dips as it crosses the net and is either out of reach or has to be volleyed upwards from below net height.\n\nIt can be hit crosscourt, which is the higher-percentage option because the net is lower and the court is longer, or down the line, which is shorter and riskier but travels away from a net player who has covered the crosscourt.',
    whenUsed:
      'Whenever an opponent approaches the net, which makes it the counterpart to every approach shot.',
    advantages:
      '- Punishes an approach made on a weak ball, which is what keeps players honest about when they come forward.\n- The topspin dip makes even a reached ball hard to volley.',
    risks:
      '- The margin is small, because the ball must stay low.\n- A net player who has closed properly cuts off the angles, which is why the lob exists as the alternative.',
    related: ['lob', 'volley', 'coming-to-the-net', 'topspin', 'approaching-the-net'],
  }),

  shot({
    slug: 'approach-shot',
    title: 'Approach Shot',
    category: 'shots',
    alsoIn: ['glossary', 'tactics'],
    order: 150,
    difficulty: 'intermediate',
    summary:
      'The shot played on the way to the net, which decides whether coming in was a good idea.',
    oneSentence:
      'An approach shot is the shot a player hits as they move forward to the net, intended to make the following volley easy.',
    theShot:
      'Usually hit deep and often down the line, and frequently with slice, because a low ball forces the opponent to hit upwards and gives the approaching player a volley above net height.\n\nDown the line is the standard direction, for a geometric reason: it is the shortest path, so it gives the opponent least time, and it puts the approaching player on the correct side of the court to cover the reply.',
    whenUsed:
      'On a short ball, against an opponent who is out of position, and as a matter of policy by all-court and serve-and-volley players.',
    advantages:
      '- Converts a short ball into a won point rather than a continued rally.\n- Applies pressure that changes what the opponent does on the following shots.',
    risks:
      '- An approach off a ball that was not short enough is a gift to a passing shot.\n- Approaching crosscourt leaves the down-the-line pass open, which is why it is generally the wrong choice.',
    related: ['coming-to-the-net', 'volley', 'passing-shot', 'slice', 'approaching-the-net'],
  }),

  shot({
    slug: 'inside-out-forehand',
    title: 'Inside-Out Forehand',
    category: 'shots',
    alsoIn: ['tactics'],
    order: 160,
    difficulty: 'intermediate',
    summary:
      'Running around the backhand to hit a forehand crosscourt into the opponent’s backhand.',
    oneSentence:
      'An inside-out forehand is a forehand hit from the backhand side of the court, sent crosscourt into the opponent’s backhand corner.',
    theShot:
      'The player moves to their left (for a right-hander) so that a ball arriving on the backhand side can be struck as a forehand, then hits it diagonally across the court.\n\nFor two right-handers, this sends the player’s best shot into the opponent’s weaker wing, which is why it is one of the most common patterns in professional tennis.',
    whenUsed:
      'On any ball a player has time to run around, and as a deliberate pattern against an opponent with a weaker backhand.',
    advantages:
      '- Puts the strongest groundstroke against the weakest, which is the whole point.\n- Hit crosscourt, so it has the lower part of the net and the longer diagonal to work with.',
    risks:
      '- Running around the backhand vacates a large part of the court, and a ball hit behind the player into the space they just left is the standard counter.\n- Doing it repeatedly makes the pattern predictable, and predictability is what an opponent uses to change direction.',
    related: [
      'inside-in-forehand',
      'targeting-the-backhand',
      'playing-behind-an-opponent',
      'forehand',
      'patterns-of-play',
    ],
  }),

  shot({
    slug: 'inside-in-forehand',
    title: 'Inside-In Forehand',
    category: 'shots',
    alsoIn: ['tactics'],
    order: 170,
    difficulty: 'advanced',
    summary: 'The same run-around forehand, hit down the line instead of crosscourt.',
    oneSentence:
      'An inside-in forehand is a forehand hit from the backhand side of the court straight down the line rather than crosscourt.',
    theShot:
      'The player runs around the backhand exactly as they would for an inside-out forehand, then hits down the line instead. The setup looks identical, which is precisely why it works.',
    whenUsed:
      'As the change-up to the inside-out pattern, usually once the opponent has begun anticipating the crosscourt ball and shading towards their backhand corner.',
    advantages:
      '- Shorter distance, so it arrives sooner and is harder to run down.\n- It goes into the space the opponent has vacated by covering the inside-out pattern.',
    risks:
      '- Higher part of the net and a shorter court, so the margin is smaller than the inside-out.\n- The player is already out of position on the backhand side, so a ball that comes back crosscourt leaves them with a long way to run.',
    related: [
      'inside-out-forehand',
      'changing-direction',
      'crosscourt-vs-down-the-line',
      'patterns-of-play',
    ],
  }),

  shot({
    slug: 'kick-serve',
    title: 'Kick Serve',
    category: 'shots',
    alsoIn: ['serving'],
    aliases: ['topspin serve', 'twist serve'],
    order: 180,
    difficulty: 'intermediate',
    summary: 'A heavily spun serve that clears the net high and bounces up and away.',
    oneSentence:
      'A kick serve is hit with heavy topspin and sidespin so it passes high over the net, dips into the box and bounces high and to the side.',
    theShot:
      'The player tosses the ball slightly further behind and to the left (for a right-hander), arches the back, and brushes up and across the back of the ball from low to high.\n\nThe combination of topspin and sidespin does two things: it drags the ball down into the box despite a high trajectory, and it makes the bounce jump up and away from the receiver.',
    whenUsed:
      'Overwhelmingly as a second serve, where the margin it provides is worth more than speed. Also used on first serves to a returner who struggles with high balls, and heavily on clay, where the surface exaggerates the kick.',
    advantages:
      '- Large margin over the net, which is what makes an aggressive second serve possible.\n- The high bounce takes the returner out of their comfortable strike zone, particularly against a one-handed backhand.\n- The sideways movement drags the returner off the court.',
    risks:
      '- Slower than a flat serve, so a returner who can handle high balls has time to attack it.\n- Physically demanding on the back and shoulder, because of the arching motion.',
    related: ['first-serve-vs-second-serve', 'slice-serve', 'flat-serve', 'topspin', 'clay-courts'],
  }),

  shot({
    slug: 'slice-serve',
    title: 'Slice Serve',
    category: 'shots',
    alsoIn: ['serving'],
    order: 190,
    difficulty: 'intermediate',
    summary:
      'A sidespin serve that curves sideways and stays low, used to drag the returner off court.',
    oneSentence:
      'A slice serve is hit with sidespin so that it curves through the air and skids low and sideways after the bounce.',
    theShot:
      'The racket brushes around the outside of the ball rather than up the back of it. The resulting sidespin curves the ball in flight and makes it move further sideways after it lands.',
    whenUsed:
      'Wide in the deuce court against a right-hander, dragging them off the court and opening the whole court for the next shot. From the ad court a left-hander’s slice serve does the same into a right-hander’s backhand, which is the single most valuable serve pattern in tennis at the deciding points of a game.',
    advantages:
      '- Moves the returner sideways, creating an open court for the serve-plus-one.\n- Stays low, which is uncomfortable and especially effective on grass.\n- Faster than a kick serve, so it can be used on first serves as well as second.',
    risks:
      '- Less net clearance than a kick serve, so it is a riskier second-serve choice.\n- A returner who reads the spin can step across and take it early.',
    notablePlayers:
      'The left-handed slice serve out wide in the ad court is most associated with Rafael Nadal among modern players, and historically with left-handers generally: it is the structural reason left-handedness is an advantage in tennis.',
    related: [
      'kick-serve',
      'flat-serve',
      'ad-court-and-deuce-court',
      'serve-plus-one',
      'grass-courts',
    ],
  }),

  shot({
    slug: 'flat-serve',
    title: 'Flat Serve',
    category: 'shots',
    alsoIn: ['serving'],
    order: 200,
    difficulty: 'intermediate',
    summary: 'The fastest serve, hit with minimal spin and the smallest margin.',
    oneSentence:
      'A flat serve is struck with little spin, travelling in nearly a straight line at the highest speed a player can produce.',
    theShot:
      'The racket goes through the back of the ball rather than around or up it. With almost no spin to bring the ball down, the server must hit almost straight over the net band, which is why height at contact matters so much for this serve specifically.',
    whenUsed:
      'Almost exclusively as a first serve, and most often down the middle from either court, where the net is lowest and the distance shortest.',
    advantages:
      '- The fastest ball in tennis, and the most likely to produce an ace.\n- Down the middle, it has the lowest part of the net and the shortest path, so it is the highest-percentage flat target.',
    risks:
      '- Very small margin. A flat serve is the shot most affected by a poor toss or a change in conditions.\n- Almost never used as a second serve, because the same margin that makes it fast makes it unreliable.',
    notablePlayers:
      'Height is the clearest predictor of a dominant flat serve, and the tallest servers in the sport’s history, John Isner and Ivo Karlović among them, hold most of the ace records because of the angle their contact point creates.',
    related: ['ace', 'kick-serve', 'slice-serve', 'serve-speed', 'big-server'],
  }),
];

/* ────────────────────────────────────────────────────────────────────────────
 * Playing styles
 * ────────────────────────────────────────────────────────────────────────── */

const STYLES: ExplainerSeed[] = [
  playingStyle({
    slug: 'baseline-player',
    title: 'Baseline Player',
    category: 'playing-styles',
    order: 10,
    summary: 'A player who builds points from behind the baseline, which is now almost everybody.',
    oneSentence:
      'A baseline player constructs points with groundstrokes from the back of the court rather than by coming forward.',
    howItWorks:
      'The player takes up position on or near the baseline and rallies, using depth, direction and spin to move the opponent until an opening appears. They come forward to finish rather than as a plan.\n\nThis is the default style in modern professional tennis, to the extent that "baseliner" describes most of the tour and the useful distinctions are within it: aggressive baseliner, counterpuncher, and the all-court player who is not quite either.',
    advantages:
      '- Fewest positional risks, because the player is rarely caught in transition.\n- Modern racket and string technology makes passing shots easier and net approaches costlier, which is why the style became dominant.',
    risks:
      '- Against a player who takes the ball early, standing deep concedes time and court position.\n- Long rallies are physically expensive, and a baseline game plan against another baseliner is a war of attrition.',
    counters:
      'Taking the ball earlier, changing height and pace to break the rhythm, and drop shots against a player standing very deep.',
    misunderstandings:
      '**"Baseline tennis is passive."** Aggressive baseline tennis is the most offensive style in the modern game. Where a player stands and what they intend are different questions.',
    related: [
      'aggressive-baseliner',
      'counterpuncher',
      'all-court-player',
      'playing-from-the-baseline',
      'court-positioning',
    ],
  }),

  playingStyle({
    slug: 'aggressive-baseliner',
    title: 'Aggressive Baseliner',
    category: 'playing-styles',
    order: 20,
    difficulty: 'intermediate',
    summary: 'A baseliner who dictates: takes the ball early, hits through the court, ends points.',
    oneSentence:
      'An aggressive baseliner plays from the back of the court but takes time away from the opponent, hitting to end points rather than to extend them.',
    howItWorks:
      'They stand on or inside the baseline where possible, take the ball early, and look to move the opponent from the first or second shot of a rally rather than the sixth. The serve-plus-one pattern is central: serve to a corner, then attack the reply with a forehand.',
    advantages:
      '- Shortens points, which matters over a fortnight of a Grand Slam.\n- Takes time from the opponent, which degrades even a very good defence.\n- Works on every surface, because it does not depend on the court doing anything.',
    risks:
      '- Higher error rate. The style is built on hitting close to the lines, and on a bad day the same shots miss.\n- Requires standing in against big serving, which is uncomfortable when the returner is not on form.',
    counters:
      'High, heavy balls to push them back off the baseline; changing pace so they have to generate their own; and depth, since the whole style depends on getting a short ball to attack.',
    notablePlayers:
      'This is the dominant style of the modern era, associated historically with Andre Agassi as an early template and with the heavy-hitting baseline games that have followed.',
    related: [
      'baseline-player',
      'taking-the-ball-early',
      'serve-plus-one',
      'counterpuncher',
      'offensive-player',
    ],
  }),

  playingStyle({
    slug: 'counterpuncher',
    title: 'Counterpuncher',
    category: 'playing-styles',
    order: 30,
    difficulty: 'intermediate',
    summary: 'A player who wins by absorbing pressure and using the opponent’s pace against them.',
    oneSentence:
      'A counterpuncher defends exceptionally well and converts defence into offence, winning points the opponent expected to have already won.',
    howItWorks:
      'They cover the court, return everything, and wait. The strategy is not passive: a counterpuncher redirects pace rather than absorbing it, and the shot that hurts is usually the one hit from a defensive position that lands deep in a corner.\n\nThe psychological element is real. Making an aggressive player hit one more ball than they planned to is how counterpunchers win, because errors accumulate when a point refuses to end.',
    advantages:
      '- Extremely difficult to hit through, which frustrates aggressive opponents into over-hitting.\n- Excellent on slow, high-bouncing surfaces where there is time to reach everything.\n- Ages well tactically, because it depends on positioning and reading as much as on power.',
    risks:
      '- Physically punishing, since the style requires covering more ground than anybody else on court.\n- Struggles against a player who consistently finishes at the net, because there is nothing to counter.\n- On fast, low surfaces the time to defend simply is not there.',
    counters:
      'Coming to the net, so there is no ball to counter; drop shots, because counterpunchers often stand deep; and changing direction repeatedly rather than trying to hit through them.',
    notablePlayers:
      'The counterpunching template is most associated with Novak Djokovic among modern players and with Michael Chang and Lleyton Hewitt before him: players who turned defence into a way of attacking rather than a way of surviving.',
    related: [
      'defensive-player',
      'defence-to-offence',
      'baseline-player',
      'clay-courts',
      'aggressive-baseliner',
    ],
  }),

  playingStyle({
    slug: 'serve-and-volley',
    title: 'Serve-and-Volley Player',
    category: 'playing-styles',
    order: 40,
    difficulty: 'intermediate',
    summary: 'Serve, run in, volley: the style that dominated tennis and then nearly disappeared.',
    oneSentence:
      'A serve-and-volley player follows their serve to the net as a matter of policy, aiming to win the point with the first volley.',
    howItWorks:
      'The server strikes, moves forward immediately, and splits at around the service line as the return is struck. The first volley is usually played from an awkward position around the service line and is aimed deep, setting up an easier second volley.\n\nThe intention is to make every point short and to deny the returner a rally at all.',
    advantages:
      '- Puts constant pressure on the returner, who has to hit a passing shot on the very first ball.\n- Points are short, so the physical cost per point is low.\n- Extremely effective on fast, low-bouncing surfaces where the return is hard to control.',
    risks:
      '- Against modern racket and string technology, returners pass more easily than they did, which is the main reason the style declined.\n- Requires an excellent serve. Following a mediocre serve to the net is a way of losing quickly.\n- Almost unusable on slow, high-bouncing surfaces, where the returner has time to set up.',
    counters:
      'Low returns at the feet, topspin passing shots that dip, and lobs against a player who closes too tightly.',
    notablePlayers:
      'The style defined earlier eras of grass-court tennis and is associated with Martina Navratilova, Stefan Edberg, Pete Sampras and Patrick Rafter. Its decline through the 2000s is one of the clearest tactical shifts in the sport’s history, driven by equipment rather than by fashion.',
    related: ['volley', 'half-volley', 'grass-courts', 'coming-to-the-net', 'all-court-player'],
  }),

  playingStyle({
    slug: 'all-court-player',
    title: 'All-Court Player',
    category: 'playing-styles',
    order: 50,
    difficulty: 'intermediate',
    summary:
      'A player comfortable in every part of the court, who chooses a plan rather than having one.',
    oneSentence:
      'An all-court player can rally from the baseline, attack the net and defend, and selects between them according to the opponent and the surface.',
    howItWorks:
      'The defining feature is not a shot but a decision-making range. An all-court player is at home approaching, at home in a long rally, and comfortable enough at the net to make coming forward a real threat rather than a bluff.\n\nIn practice this means a complete set of tools: a slice as well as a drive, a volley as well as a groundstroke, and a serve used to set up patterns rather than only to win free points.',
    advantages:
      '- Adapts to surfaces, which is why all-court players tend to have the best records across all four majors.\n- Difficult to prepare for, because there is no single pattern to take away.',
    risks:
      '- Breadth can mean no single overwhelming weapon, and against a specialist on their best surface that can be decisive.\n- The style takes longer to develop, which is why it is rarer in juniors than the baseline game.',
    counters:
      'Forcing them into the one part of their game that is weakest, which requires knowing which it is; there is no general answer, which is the point of the style.',
    notablePlayers:
      'Roger Federer is the standard modern reference for the all-court game, and the style is closely tied to players with strong records on all three surfaces rather than one.',
    related: [
      'baseline-player',
      'serve-and-volley',
      'coming-to-the-net',
      'surface-specialist',
      'adapting-during-a-match',
    ],
  }),

  playingStyle({
    slug: 'big-server',
    title: 'Big Server',
    category: 'playing-styles',
    order: 60,
    summary: 'A player whose serve dominates their results, for better and worse.',
    oneSentence:
      'A big server relies on holding serve almost automatically and on winning the few points needed to break or to reach a tiebreak.',
    howItWorks:
      'The serve produces free points in volume, so service games are short and rarely in danger. The consequence is that matches turn on a handful of points: a single break, or a tiebreak.\n\nHeight is the structural advantage. A taller player strikes the ball from a higher contact point, which opens the geometry of the service box and makes a flat serve viable at speeds a shorter player cannot use.',
    advantages:
      '- Extremely high hold percentage, which makes them dangerous to anybody in a short format.\n- Points on serve are short, so physical fatigue accumulates slowly.\n- Very effective on fast surfaces and indoors.',
    risks:
      '- Break percentage is usually low, so if the serve is off there is no second plan.\n- Matches decided by tiebreaks are high-variance, which is why big servers’ results swing more than their quality does.\n- Slow, high-bouncing surfaces reduce the serve’s effect and expose the rest of the game.',
    counters:
      'Standing back to return, chipping returns deep rather than attacking them, and accepting that the break will come from two or three points a set rather than from pressure across a game.',
    notablePlayers:
      'Ivo Karlović and John Isner are the clearest modern examples, both holding a large share of the sport’s ace records, and both with career profiles shaped by the tiebreak.',
    related: ['the-serve', 'flat-serve', 'hold-percentage', 'tiebreak', 'serve-speed'],
  }),

  playingStyle({
    slug: 'defensive-player',
    title: 'Defensive Player',
    category: 'playing-styles',
    order: 70,
    summary:
      'A player whose first aim is to keep the ball in play and make the opponent hit one more.',
    oneSentence:
      'A defensive player prioritises retrieval and consistency, winning points by outlasting rather than by finishing.',
    howItWorks:
      'They stand further back, cover the court, and use height and depth to buy time. Errors are the currency: a defensive player wins by making fewer than their opponent, so the plan is to extend rallies until the opponent tries something they should not.',
    advantages:
      '- Very effective against opponents with a high error rate.\n- Excellent on slow surfaces, where there is time to reach almost anything.\n- Rewards fitness, which is a controllable variable in a way that a serve is not.',
    risks:
      '- Physically expensive, and unsustainable across a long tournament without excellent conditioning.\n- Offers little threat, so a patient opponent can construct points without pressure.\n- Standing deep invites drop shots.',
    counters:
      'Coming to the net, drop shots, and taking the ball early to compress the time they need.',
    misunderstandings:
      '**"Defensive and counterpunching are the same."** A counterpuncher converts defence into attack; a purely defensive player does not, and the difference is whether the opponent is ever the one under pressure.',
    related: ['counterpuncher', 'offensive-player', 'drop-shot', 'clay-courts', 'rally-length'],
  }),

  playingStyle({
    slug: 'offensive-player',
    title: 'Offensive Player',
    category: 'playing-styles',
    order: 80,
    summary: 'A player who takes the initiative and accepts the errors that come with it.',
    oneSentence:
      'An offensive player looks to end points early, dictating with the serve and the first groundstroke rather than waiting for an opening.',
    howItWorks:
      'They take the ball early, aim closer to the lines, and move forward on anything short. The trade is explicit: more winners and more errors, in the belief that the balance favours them.',
    advantages:
      '- Short points, which conserves energy over a tournament.\n- Puts the opponent under pressure from the first ball, which degrades their decision-making rather than just their positioning.\n- Works on fast surfaces where defence is hardest.',
    risks:
      '- Error-prone by construction, and a bad day looks much worse than a defensive player’s bad day.\n- Against an excellent defender on a slow court, the same aggression produces the same errors without the same rewards.',
    counters:
      'Depth and height, denying them a short ball; and consistency, since the style depends on the opponent eventually missing first.',
    related: [
      'aggressive-baseliner',
      'defensive-player',
      'winners',
      'unforced-errors',
      'taking-the-ball-early',
    ],
  }),

  definition({
    slug: 'playing-from-the-baseline',
    title: 'What Does "Playing From the Baseline" Mean?',
    category: 'playing-styles',
    alsoIn: ['glossary'],
    order: 90,
    summary: 'Rallying from the back of the court rather than coming forward.',
    oneSentence:
      'Playing from the baseline means contesting rallies from the back of the court, near the baseline, rather than approaching the net.',
    explanation:
      'It describes where a player stands, not how aggressive they are. Two players can both play from the baseline and be doing opposite things: one standing on the line taking the ball early to attack, the other two metres behind it retrieving.\n\nWhere the player stands relative to the baseline is the useful detail, and it is what commentators mean when they talk about a player being "pushed back" during a rally.',
    related: ['baseline', 'baseline-player', 'court-positioning', 'coming-to-the-net'],
  }),

  definition({
    slug: 'coming-to-the-net',
    title: 'What Does "Coming to the Net" Mean?',
    category: 'playing-styles',
    alsoIn: ['glossary', 'tactics'],
    order: 100,
    summary: 'Moving forward to finish the point with a volley.',
    oneSentence:
      'Coming to the net means moving forward from the baseline to finish the point at close range with a volley or an overhead.',
    explanation:
      'A player approaches after an aggressive shot, after a drop shot, or behind their serve. Once there, they intend to volley the reply away rather than to return to the baseline.\n\nThe key detail is the split step. A player who is still running when the opponent strikes the ball cannot change direction, so the approach is timed to arrive and stop rather than to arrive as fast as possible.',
    whyItMatters:
      'Net play is a threat as much as a tactic. An opponent who knows their passing shot must be perfect plays differently even on the points where nobody comes forward.',
    related: ['volley', 'approach-shot', 'passing-shot', 'net-points-won', 'approaching-the-net'],
  }),
];

/* ────────────────────────────────────────────────────────────────────────────
 * Tactics
 * ────────────────────────────────────────────────────────────────────────── */

const TACTICS: ExplainerSeed[] = [
  tactic({
    slug: 'targeting-the-backhand',
    title: 'Why Players Target the Backhand',
    category: 'tactics',
    order: 10,
    difficulty: 'intermediate',
    summary: 'The most common plan in tennis, and the geometry that makes it work.',
    oneSentence:
      'Most players are weaker on the backhand than the forehand, so the standard plan is to hit as many balls there as possible until a short one comes back.',
    howItWorks:
      'A right-hander playing another right-hander sends the ball crosscourt into the backhand corner, most often with an inside-out forehand. That puts their best shot against the opponent’s weaker one, repeatedly, on the diagonal where the net is lowest.\n\nThe intention is not usually to win the point with any single ball. It is to force a shorter, weaker reply that can then be attacked, which is why the pattern is a rally pattern rather than a shot.\n\nHeight matters as much as direction. A heavy topspin ball to the backhand pushes the contact point up above the shoulder, which is uncomfortable for a two-hander and structurally difficult for a one-hander.',
    whenUsed:
      'As a default in almost every professional match, and more insistently against a one-handed backhand or against a player whose backhand cannot change direction.',
    whyItMatters:
      'It explains most of what a spectator sees. The long crosscourt exchanges that fill a professional rally are usually not two players failing to find an opening: they are both players trying to make the other hit one more backhand.',
    risks:
      'Predictability. A player who hits every ball to the backhand allows the opponent to cheat towards that side and run around it themselves, which is why the pattern is always paired with an occasional ball behind them.',
    counters:
      'Running around the backhand to hit forehands, slicing to change the height, and taking the ball early so the heavy topspin does not have time to rise.',
    related: [
      'inside-out-forehand',
      'crosscourt-vs-down-the-line',
      'playing-behind-an-opponent',
      'one-handed-vs-two-handed-backhand',
      'patterns-of-play',
    ],
  }),

  tactic({
    slug: 'crosscourt-vs-down-the-line',
    title: 'Playing Crosscourt vs Down the Line',
    category: 'tactics',
    order: 20,
    difficulty: 'intermediate',
    summary: 'The safe direction and the risky one, and why rallies default to the diagonal.',
    oneSentence:
      'Crosscourt is longer, over a lower part of the net, and returns the player towards the middle of the court, which is why it is the default; down the line is shorter, riskier and how points are won.',
    howItWorks:
      '**Crosscourt** has three structural advantages. The diagonal of the court is longer than its length, so there is more court to land in. The net sags six inches in the middle, so the ball crosses at its lowest point. And after hitting crosscourt, the player’s recovery position is close to where they already are.\n\n**Down the line** reverses all three. The court is shorter, the net is higher at the sides, and the player finishes the shot on one side of the court while the ball travels to the other, so a reply crosscourt makes them run the full width.\n\nThat is why professional rallies are mostly crosscourt: not caution, but geometry.',
    whenUsed:
      'Crosscourt as the rally default. Down the line to change the direction, usually off a ball that is short enough or central enough that the extra risk is affordable, and as an approach shot.',
    whyItMatters:
      'Nearly every tactical concept in tennis is a variation on this trade. Changing direction, the inside-in forehand, the down-the-line backhand and the approach shot are all the same decision at different moments.',
    risks:
      'Going down the line off a defensive ball is the most common unforced error pattern in the sport, because the shot demands the most precision at the moment the player has the least balance.',
    related: [
      'changing-direction',
      'using-angles',
      'building-a-point',
      'approach-shot',
      'inside-in-forehand',
    ],
  }),

  tactic({
    slug: 'changing-direction',
    title: 'Changing Direction of the Ball',
    category: 'tactics',
    order: 30,
    difficulty: 'advanced',
    summary: 'The hardest thing to do well in a rally, and the reason rallies end.',
    oneSentence:
      'Changing the direction of an incoming ball means redirecting it across its own line of travel, which is harder and riskier than sending it back where it came from.',
    howItWorks:
      'A ball arriving crosscourt is already travelling diagonally. Sending it back crosscourt means meeting it square; sending it down the line means changing its axis, which requires a different contact point, more precise timing and a shorter target.\n\nThe general rule coaches teach is that direction is changed off a ball that is central, short, or slow: three conditions that give a player time to get around it. Changing direction off a deep, wide, fast ball is where the errors come from.',
    whenUsed:
      'To end a crosscourt exchange, to move an opponent who has settled into a pattern, and to approach the net.',
    whyItMatters:
      'It is the moment a rally stops being neutral. Watching who changes direction first, and off what kind of ball, tells you who is dictating far more reliably than counting winners.',
    risks:
      'The margin is smallest exactly when the temptation is greatest. A player pulled wide who tries to change direction is hitting the shortest, highest-net target from the worst position on the court.',
    related: [
      'crosscourt-vs-down-the-line',
      'building-a-point',
      'unforced-errors',
      'patterns-of-play',
      'taking-the-ball-early',
    ],
  }),

  tactic({
    slug: 'using-angles',
    title: 'Using Angles',
    category: 'tactics',
    order: 40,
    difficulty: 'intermediate',
    summary: 'Moving an opponent sideways off the court rather than trying to hit past them.',
    oneSentence:
      'Playing angles means hitting the ball short and wide so it draws the opponent outside the sidelines, opening the rest of the court.',
    howItWorks:
      'A sharply angled crosscourt ball lands short and wide, so the opponent has to move both forwards and sideways to reach it, finishing outside the court. From there they have almost no angle available themselves and their recovery run is long.\n\nThe next ball is then hit into the space they have left, which is usually the whole other side of the court.\n\nAngles come from topspin, which lets a player hit sharply crosscourt with the ball still dropping inside the sideline, and from taking the ball early, which opens the angle geometrically.',
    whenUsed:
      'On a ball that is short enough to attack without pulling the player forward past their own comfortable position, and particularly on clay, where the opponent slides wide and takes longer to recover.',
    whyItMatters:
      'Angle beats power against a good defender. Hitting harder gives a retriever less time but the same ground to cover; hitting wider makes them cover more ground, and that is a cost they cannot train away.',
    risks:
      'A short angled ball that is not wide enough is a short ball, and a short ball to a good player is an invitation to attack.',
    related: ['topspin', 'doubles-alleys', 'court-positioning', 'building-a-point', 'clay-courts'],
  }),

  tactic({
    slug: 'court-positioning',
    title: 'Court Positioning',
    category: 'tactics',
    order: 50,
    difficulty: 'intermediate',
    summary: 'Where you stand between shots, which decides what you can do with the next one.',
    oneSentence:
      'Court positioning is where a player recovers to between shots, and it determines how much of the court they can defend and how aggressively they can play.',
    howItWorks:
      '**Recovery is not to the middle.** A player recovers to the midpoint of the opponent’s available angles, which after a crosscourt shot is a step or two towards that side of the court, not the centre mark.\n\n**Depth relative to the baseline** sets the trade: standing on the baseline gives the opponent less time and gives you less; standing two metres behind gives you more of both.\n\n**Being pushed back** is the clearest sign a player is losing the rally, and it happens gradually rather than in one shot, which is why a player can be losing a point for four shots before it looks like it.',
    whenUsed:
      'Continuously. It is the aspect of tennis most invisible to a casual viewer and most obvious to a coach.',
    whyItMatters:
      'Most points at professional level are lost from a bad position rather than with a bad shot. The error that ends the rally is usually caused by the two shots before it.',
    related: [
      'playing-from-the-baseline',
      'return-positioning',
      'taking-the-ball-early',
      'court-position-data',
      'baseline',
    ],
  }),

  tactic({
    slug: 'taking-the-ball-early',
    title: 'Taking the Ball Early',
    category: 'tactics',
    order: 60,
    difficulty: 'advanced',
    summary: 'Hitting on the rise to steal time, and what it costs to do it.',
    oneSentence:
      'Taking the ball early means striking it as it rises after the bounce rather than waiting for it to drop, which gives the opponent less time to recover.',
    howItWorks:
      'A ball bounces, rises to a peak and falls. Hitting it on the way up means making contact sooner and closer to the baseline, so the ball goes back sooner and from further up the court.\n\nThat compresses the opponent’s time twice over: less time because the ball was returned earlier, and less time because it was hit from closer to them.\n\nIt also opens angles, because a contact point closer to the net widens the available geometry.',
    whenUsed:
      'By aggressive baseliners as policy; by anybody returning a second serve; and against heavy topspin, where waiting means hitting the ball above shoulder height instead.',
    whyItMatters:
      'It is the main way a player takes control of a rally without hitting harder, and hitting harder has diminishing returns against good defenders in a way that hitting earlier does not.',
    risks:
      'Timing. A rising ball is accelerating and there is no time to adjust, so a small misjudgement is an error rather than a weak shot. It is the highest-skill way to play and the first thing to go when a player is nervous.',
    notablePlayers:
      'Taking the ball early on both wings is most associated with Andre Agassi, whose court position rather than his power was what made him difficult to play.',
    related: [
      'aggressive-baseliner',
      'court-positioning',
      'return-positioning',
      'flat-shot',
      'half-volley',
    ],
  }),

  tactic({
    slug: 'playing-behind-an-opponent',
    title: 'Playing Behind an Opponent',
    category: 'tactics',
    order: 70,
    difficulty: 'advanced',
    summary:
      'Hitting into the space a moving opponent has just left, rather than the space ahead of them.',
    oneSentence:
      'Playing behind an opponent means hitting back to the side they are moving away from, catching them going the wrong way.',
    howItWorks:
      'A player who has been moved wide begins recovering the moment they hit. If the next ball goes to the open court, they are already running towards it. If it goes back where they came from, they have to stop, change direction and reach a ball travelling away from them.\n\nAt professional speeds, changing direction costs far more than covering distance, which is why this shot wins points that a harder shot into the open court would not.',
    whenUsed:
      'Against a player who anticipates well and starts recovering early, and against a player who has been running around their backhand and is therefore committed to one side.',
    whyItMatters:
      'It is the counter to good anticipation. A player who reads patterns reliably is beaten not by more power but by having their own reading used against them.',
    risks:
      'It is a low-percentage shot if the opponent has not committed. Hitting behind a player who is still balanced simply gives them a comfortable ball.',
    related: ['inside-out-forehand', 'changing-direction', 'patterns-of-play', 'court-positioning'],
  }),

  tactic({
    slug: 'serve-plus-one',
    title: 'Serve + 1 Strategy',
    category: 'tactics',
    order: 80,
    difficulty: 'intermediate',
    summary: 'Planning the serve and the shot after it as one two-shot pattern.',
    oneSentence:
      'Serve plus one is the tactic of choosing a serve for the reply it will produce, then attacking that reply with a predetermined shot.',
    howItWorks:
      'The server picks a target that predicts the return. A wide slice serve in the deuce court drags a right-hander off the court, and their reply is most likely to come back crosscourt into the server’s forehand, so the server is already moving to hit an inside-out or an open-court forehand.\n\nThe pattern is planned before the serve, not decided after it. That is the whole idea: the server knows what they intend to hit next, and the returner does not.',
    whenUsed:
      'On first serves at professional level as a matter of routine, and it is why so many points on serve last exactly two or three shots.',
    whyItMatters:
      'Serve-plus-one is where the serve’s advantage is actually cashed. Aces are a minority of points won on serve; most are won because the serve produced a weak reply that was attacked immediately.',
    risks:
      'A returner who reads the pattern can take the expected reply and change its direction, which turns the server’s pre-planned movement into a liability.',
    related: [
      'the-serve',
      'slice-serve',
      'inside-out-forehand',
      'first-serve-points-won',
      'patterns-of-play',
    ],
  }),

  tactic({
    slug: 'return-positioning',
    title: 'Return Positioning',
    category: 'tactics',
    order: 90,
    difficulty: 'intermediate',
    summary: 'How far back to stand, and what the choice gives away.',
    oneSentence:
      'Where a returner stands trades reaction time against court position, and the choice is usually made separately for first and second serves.',
    howItWorks:
      '**Standing back**, several metres behind the baseline, buys time to see and reach a big serve. The cost is that the return is hit from far away, so it arrives late and gives the server time to set up.\n\n**Standing in**, on or inside the baseline, takes time from the server and shortens the angle their serve can use. The cost is that a big first serve is very hard to handle from there.\n\nMost professionals split the difference: back for the first serve, several steps forward for the second. Moving forward for a second serve is the clearest visible sign a returner intends to attack it.',
    whenUsed:
      'On every return, and the position is often adjusted within a game as a returner learns a server’s patterns.',
    whyItMatters:
      'The returner’s position is a public statement of intent, and servers respond to it: a returner who moves in invites a kick serve, and one who stands back invites a body serve or a change of pace.',
    related: [
      'return-of-serve',
      'attacking-second-serves',
      'taking-the-ball-early',
      'court-positioning',
      'return-points-won',
    ],
  }),

  tactic({
    slug: 'attacking-second-serves',
    title: 'Attacking Second Serves',
    category: 'tactics',
    order: 100,
    difficulty: 'intermediate',
    summary: 'The most reliable route to a break of serve in professional tennis.',
    oneSentence:
      'Because the second serve must be safe, it is the slowest ball a server hits, and stepping in to attack it is how most break points are created.',
    howItWorks:
      'The returner moves forward, takes the ball earlier and higher, and hits a deep aggressive return, often running around the backhand to do it with a forehand.\n\nThe aim is rarely a return winner. It is to make the server play a defensive first shot, which reverses the usual advantage of serving.\n\nAgainst a heavy kick serve this is harder: the ball is above shoulder height by the time it arrives, so returning early, before it climbs, is the answer rather than waiting and hitting it at head height.',
    whenUsed:
      'On every second serve at professional level, and more aggressively at 30-30 and 40-30, where a single won point changes the game.',
    whyItMatters:
      'Second-serve points are roughly a third of all points on serve. A returner who wins half of them will break regularly; one who wins a third will not.',
    risks:
      'Over-attacking gives the server free points at exactly the moment they were vulnerable, and a returner who misses aggressive returns at 30-30 hands back the pressure they created.',
    related: [
      'first-serve-vs-second-serve',
      'second-serve-points-won',
      'return-positioning',
      'kick-serve',
      'creating-break-point-pressure',
    ],
  }),

  tactic({
    slug: 'building-a-point',
    title: 'Building a Point',
    category: 'tactics',
    order: 110,
    difficulty: 'intermediate',
    summary:
      'The sequence of shots that manufactures an opening, rather than the shot that takes it.',
    oneSentence:
      'Building a point means using a sequence of shots to move the opponent and create a ball you can attack, rather than trying to win the point outright from a neutral position.',
    howItWorks:
      'A typical construction: a deep crosscourt ball to push the opponent back, a second to the same side to commit them, then a change of direction into the space they have left. Three shots, of which only the last looks like an attacking shot.\n\nThe principle is that an opening is made rather than found. A player who goes for a winner from a neutral ball is trying to skip the construction, which is what an unforced error usually is.',
    whenUsed: 'On every point that is not decided by the serve, which is most of them.',
    whyItMatters:
      'It reframes what a spectator is watching. The interesting shot is often the second one, which set up the winner that gets replayed.',
    risks:
      'Building takes time and shots, and against a player who attacks earlier the construction may never get to its third shot.',
    related: [
      'patterns-of-play',
      'crosscourt-vs-down-the-line',
      'using-angles',
      'changing-direction',
      'unforced-errors',
    ],
  }),

  tactic({
    slug: 'defence-to-offence',
    title: 'Defensive-to-Offensive Transition',
    category: 'tactics',
    order: 120,
    difficulty: 'advanced',
    summary:
      'The shot that turns a point around, and the one thing counterpunchers do better than anyone.',
    oneSentence:
      'The defensive-to-offensive transition is the moment a player stops retrieving and starts dictating, usually with one deep, well-directed ball from a defensive position.',
    howItWorks:
      'A player pulled out of position has two jobs, in order: get the ball back deep, and recover court position. The transition happens when a defensive ball is hit deep enough and high enough that the opponent cannot attack it, which buys the time to recover to a neutral position.\n\nThe shot itself is usually a high, heavy crosscourt ball or a deep slice. It is not a winner and is not trying to be. The skill is judging which defensive ball can be hit with a little more intent without becoming an error.',
    whenUsed:
      'Every time a player is pushed off the court, which at professional level is several times a game.',
    whyItMatters:
      'Points at the top of the game are usually won two or three shots after the moment they appeared decided. The ability to reset a point from a losing position is what separates a defender from a counterpuncher.',
    related: ['counterpuncher', 'court-positioning', 'lob', 'slice', 'dominance-ratio'],
  }),

  tactic({
    slug: 'approaching-the-net',
    title: 'Why Players Approach the Net',
    category: 'tactics',
    order: 130,
    difficulty: 'intermediate',
    summary: 'To take time away and finish, and why it is rarer than it used to be.',
    oneSentence:
      'Players approach the net to cut off the opponent’s time and finish the point with a volley, on a ball good enough that the passing shot is difficult.',
    howItWorks:
      'The approach is a two-part decision: is this ball short or weak enough, and is my approach shot going to land deep enough. Both must be true. Approaching on a good ball is a strong play; approaching on a neutral one is walking into a passing shot.\n\nThe approach is usually hit down the line, so that the player finishes on the same side the ball travelled to and has less court to cover.',
    whenUsed:
      'On short balls, behind an aggressive serve, after a drop shot has pulled the opponent forward, and against opponents whose passing shots are weak.',
    whyItMatters:
      'Net approaches have declined because equipment made passing shots easier, not because the tactic stopped working. Net points won remains one of the highest conversion rates on any stat sheet: players win most of the net points they play, they simply play fewer of them.',
    risks:
      'Being passed, being lobbed, and being caught in transition, which is the worst position on a tennis court because a player is neither able to volley nor to rally.',
    related: ['coming-to-the-net', 'approach-shot', 'volley', 'net-points-won', 'serve-and-volley'],
  }),

  tactic({
    slug: 'creating-break-point-pressure',
    title: 'How Players Create Break-Point Pressure',
    category: 'tactics',
    order: 140,
    difficulty: 'advanced',
    summary: 'Break points come from patterns applied over games, not from one big return.',
    oneSentence:
      'Break points are manufactured by winning the first point of service games, attacking second serves and making the server play extra balls, so that the pressure arrives before the score does.',
    howItWorks:
      '**Win the first point.** 0-15 changes what the server is willing to try, and it doubles the returner’s chance of reaching 30-30.\n\n**Attack second serves consistently**, so the server feels the cost of missing a first serve on every point rather than occasionally.\n\n**Return deep.** Return-in-play percentage matters more than return winners, because a server who has to hit an extra ball on every point makes more errors across a set than they do across a point.\n\n**Apply it at 30-30 rather than at 0-40.** The pressure a server feels at 30-30 on their fourth service game is the pressure that produces the double fault two games later.',
    whenUsed: 'Across a set rather than within a game. This is a strategic concept, not a shot.',
    whyItMatters:
      'A returner who converts one break point in ten has usually created those chances badly rather than executed badly: chances created from a neutral rally are harder to take than chances created from a short second-serve return.',
    related: [
      'break-point',
      'attacking-second-serves',
      'break-point-conversion',
      'return-points-won',
      'clutch-performance',
    ],
  }),

  tactic({
    slug: 'patterns-of-play',
    title: 'Pattern of Play Explained',
    category: 'tactics',
    order: 150,
    difficulty: 'advanced',
    summary: 'The repeated two- and three-shot sequences that make up a professional match.',
    oneSentence:
      'A pattern of play is a recurring sequence of shots a player uses deliberately, such as serve wide then forehand into the open court.',
    howItWorks:
      'Professional points are not improvised from scratch. Each player has a set of sequences they trust, chosen before the point begins and adjusted as it develops.\n\nCommon patterns include serve wide plus forehand to the open court; crosscourt backhand exchange until a short ball allows a down-the-line change; and inside-out forehand repeated until the opponent shades over, then inside-in behind them.\n\nRecognising them changes how a match looks. The apparently repetitive crosscourt rally is one player running a pattern and the other refusing to break first.',
    whenUsed:
      'Constantly, and scouting at professional level is largely the business of identifying which patterns an opponent runs at which scores.',
    whyItMatters:
      'Patterns are also how a player is beaten. Once an opponent knows what comes at 30-30, they can anticipate it, which is why good players deliberately break their own patterns at important moments.',
    related: [
      'serve-plus-one',
      'inside-out-forehand',
      'targeting-the-backhand',
      'adapting-during-a-match',
      'head-to-head-analysis',
    ],
  }),

  tactic({
    slug: 'adapting-during-a-match',
    title: 'How Players Adapt During Matches',
    category: 'tactics',
    order: 160,
    difficulty: 'advanced',
    summary:
      'What actually changes between sets, and why a plan is a starting point rather than a script.',
    oneSentence:
      'Players adapt by changing court position, shot selection, serve patterns and pace, usually one variable at a time rather than by abandoning a plan entirely.',
    howItWorks:
      '**Court position** is the first lever, because it is the cheapest: moving a step forward or back on the return changes the whole exchange without changing technique.\n\n**Serve patterns** are second: a server who has been going wide starts going down the middle once the returner has begun leaning.\n\n**Pace and height** come next. Adding height and spin against an aggressive player takes their timing away without requiring the adapter to hit better shots.\n\n**Style changes** come last and rarely work well mid-match. A baseliner who suddenly starts serve-and-volleying at one set down is usually announcing that they have run out of ideas rather than finding one.\n\nConditions force adaptation too: a court that speeds up in the evening, wind that arrives on one end, or balls that have gone soft all change what the same shot does.',
    whenUsed: 'Between sets most visibly, and continuously in smaller ways within them.',
    whyItMatters:
      'It is the part of tennis that separates the sport from a test of technique. Two players are solving each other in real time with no coach able to intervene in most competitions, which is why coaching rules are contested.',
    related: [
      'patterns-of-play',
      'coaching-rules',
      'all-court-player',
      'wind-in-tennis',
      'why-balls-are-changed',
    ],
  }),
];

export const TENNIS_SHOTS_AND_TACTICS: ExplainerSeed[] = [...SHOTS, ...STYLES, ...TACTICS];
