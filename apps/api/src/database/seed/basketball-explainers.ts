import type { ExplainerSeed, SourceSeed } from './explainer-types';

/**
 * The written basketball explainers.
 *
 * These override the taxonomy placeholders in
 * `basketball-explainer-taxonomy.ts` by slug and are the only basketball
 * concepts that reach the site: anything left as a placeholder stays a draft.
 *
 * ## One concept, one page
 *
 * The rule this file is built around. Travelling is officiated differently by
 * the NBA and FIBA, a quarter is a different length in each, and the three-point
 * arc is at a different distance. None of that justifies `nba-traveling` and
 * `fiba-traveling` as separate articles: they would agree on nine sentences out
 * of ten and disagree on one, and a reader searching "traveling" would have to
 * pick a competition before they could read anything.
 *
 * So each concept is one row with one canonical URL, and the differences live
 * in a `rule_differences` section of it. Cricket reached the same answer with
 * `format_differences` for the same reason (a Test is not a T20), which is why
 * that section type existed before this file did.
 *
 * The corollary matters just as much: where the general description would be
 * wrong for a competition, the section is not optional. An explainer that
 * describes only the NBA and says nothing teaches a reader that the NBA's rules
 * are basketball's rules, which is the single failure mode this library is
 * written to avoid.
 *
 * ## On sourcing
 *
 * Facts come from the governing bodies' own rulebooks where the question is
 * "what is the rule": FIBA's Official Basketball Rules, the NBA rulebook, NCAA
 * and WNBA rules. Wikipedia and Wikidata are used for history and background.
 * The prose is SportBrainHQ's own throughout: a rulebook's expression is not
 * ours to reuse, and paraphrasing a Law badly is worse than not citing it.
 *
 * Anything written against a rulebook carries `ruleSensitive: true` and a
 * `sourceRevision`, so the set to re-audit after a rule change is a query
 * rather than a reading of every article.
 *
 * ## On numbers that move
 *
 * Salary-cap figures, apron thresholds and roster limits are deliberately
 * absent. They change every season under a collective bargaining agreement, and
 * a number baked into prose is wrong within a year with nothing to flag it. The
 * mechanisms are explained; the current dollar figures belong in data with an
 * as-of date, not in an article.
 */

export const BASKETBALL_EXPLAINER_SOURCES: SourceSeed[] = [
  {
    key: 'fiba-rules',
    provider: 'fiba',
    title: 'FIBA Official Basketball Rules',
    url: 'https://www.fiba.basketball/en/official-basketball-rules',
    license: 'FIBA',
  },
  {
    key: 'nba-rulebook',
    provider: 'nba',
    title: 'NBA Official Rulebook',
    url: 'https://official.nba.com/rulebook/',
    license: 'NBA',
  },
  {
    key: 'nba-cba',
    provider: 'nba',
    title: 'NBA Collective Bargaining Agreement',
    url: 'https://cosmic-s3.imgix.net/3c7a0a50-8e11-11ed-b4b8-2f0dc247a3e5-2023-NBA-Collective-Bargaining-Agreement.pdf',
    license: 'NBA',
  },
  {
    key: 'wnba-rules',
    provider: 'wnba',
    title: 'WNBA Official Rules',
    url: 'https://www.wnba.com/officiating',
    license: 'WNBA',
  },
  {
    key: 'ncaa-rules',
    provider: 'ncaa',
    title: 'NCAA Basketball Rules',
    url: 'https://www.ncaa.org/sports/2013/11/25/basketball-rules.aspx',
    license: 'NCAA',
  },
  {
    key: 'wp-basketball',
    provider: 'wikipedia',
    title: 'Basketball',
    url: 'https://en.wikipedia.org/wiki/Basketball',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-nba',
    provider: 'wikipedia',
    title: 'National Basketball Association',
    url: 'https://en.wikipedia.org/wiki/National_Basketball_Association',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-traveling',
    provider: 'wikipedia',
    title: 'Traveling (basketball)',
    url: 'https://en.wikipedia.org/wiki/Traveling_(basketball)',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-pick-and-roll',
    provider: 'wikipedia',
    title: 'Pick and roll',
    url: 'https://en.wikipedia.org/wiki/Pick_and_roll',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-true-shooting',
    provider: 'wikipedia',
    title: 'True shooting percentage',
    url: 'https://en.wikipedia.org/wiki/True_shooting_percentage',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-box-score',
    provider: 'wikipedia',
    title: 'Box score',
    url: 'https://en.wikipedia.org/wiki/Box_score',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-nba-draft',
    provider: 'wikipedia',
    title: 'NBA draft',
    url: 'https://en.wikipedia.org/wiki/NBA_draft',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-nba-playoffs',
    provider: 'wikipedia',
    title: 'NBA playoffs',
    url: 'https://en.wikipedia.org/wiki/NBA_playoffs',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-ncaa',
    provider: 'wikipedia',
    title: 'NCAA Division I men’s basketball tournament',
    url: 'https://en.wikipedia.org/wiki/NCAA_Division_I_men%27s_basketball_tournament',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-wnba',
    provider: 'wikipedia',
    title: "Women's National Basketball Association",
    url: 'https://en.wikipedia.org/wiki/Women%27s_National_Basketball_Association',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-olympics',
    provider: 'wikipedia',
    title: 'Basketball at the Summer Olympics',
    url: 'https://en.wikipedia.org/wiki/Basketball_at_the_Summer_Olympics',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'olympics-basketball',
    provider: 'olympics',
    title: 'Olympics.com, Basketball',
    url: 'https://www.olympics.com/en/sports/basketball/',
    license: 'IOC',
  },
  {
    key: 'wp-world-cup',
    provider: 'wikipedia',
    title: 'FIBA Basketball World Cup',
    url: 'https://en.wikipedia.org/wiki/FIBA_Basketball_World_Cup',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-3x3',
    provider: 'wikipedia',
    title: '3x3 basketball',
    url: 'https://en.wikipedia.org/wiki/3x3_basketball',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-positions',
    provider: 'wikipedia',
    title: 'Basketball positions',
    url: 'https://en.wikipedia.org/wiki/Basketball_positions',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-three-point',
    provider: 'wikipedia',
    title: 'Three-point field goal',
    url: 'https://en.wikipedia.org/wiki/Three-point_field_goal',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-fiba',
    provider: 'wikipedia',
    title: 'FIBA',
    url: 'https://en.wikipedia.org/wiki/FIBA',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-euroleague',
    provider: 'wikipedia',
    title: 'EuroLeague',
    url: 'https://en.wikipedia.org/wiki/EuroLeague',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-zone-defense',
    provider: 'wikipedia',
    title: 'Zone defense',
    url: 'https://en.wikipedia.org/wiki/Zone_defense',
    license: 'CC BY-SA 4.0',
  },
];

/** Written against these editions. Bumped when an explainer is re-audited. */
const FIBA_REVISION = 'FIBA Official Basketball Rules 2024';
const NBA_REVISION = 'NBA Rulebook, 2024/25 season';

export const BASKETBALL_EXPLAINERS: ExplainerSeed[] = [
  // ══ Rules & basics ═════════════════════════════════════════════════════════
  {
    slug: 'how-basketball-works',
    title: 'How Basketball Works',
    shortDescription:
      'Two teams of five, one hoop each, and a clock that forces you to shoot. Everything else is detail.',
    type: 'standard',
    isStartHere: true,
    difficulty: 'beginner',
    category: 'rules-and-basics',
    aliases: ['basketball rules', 'how to watch basketball', 'basketball for beginners'],
    isFeatured: true,
    readMinutes: 5,
    order: 10,
    ruleSensitive: true,
    sourceRevision: FIBA_REVISION,
    lastReviewedAt: '2026-08-26',
    sourceKeys: [{ key: 'fiba-rules' }, { key: 'wp-basketball' }],
    related: [
      { slug: 'how-scoring-works', type: 'requires_understanding' },
      { slug: 'possession', type: 'requires_understanding' },
      { slug: 'basketball-court', type: 'related_to' },
      { slug: 'basketball-positions', type: 'related_to' },
      { slug: 'shot-clock', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'Two teams of five try to put a ball through the opponent’s hoop, and the team with more points when the clock runs out wins.',
      },
      {
        type: 'simple_explanation',
        body: `Each team defends one basket and attacks the other. When you have the ball you are on **offense**; the moment you lose it you are on **defense**, and that switch happens dozens of times in a game.

You score by putting the ball through the hoop. A shot from open play is worth **two points**, or **three** if you shoot from behind the arc painted on the floor. A free, unguarded shot awarded after a foul is worth **one**.

You move the ball by passing it or by **dribbling**, which means bouncing it as you walk or run. What you cannot do is simply carry it, and that restriction is the source of most of basketball's rules.`,
      },
      {
        type: 'how_it_works',
        body: `A game is split into four timed quarters. The clock stops constantly, for fouls, for the ball going out of play and for timeouts, so a game lasts far longer than its playing time.

The single rule that shapes how basketball looks is the **shot clock**. Once your team gets the ball you have 24 seconds to get a shot up that hits the rim. Fail, and you hand the ball over. Without it a team in front could hold the ball and refuse to play, which is exactly what happened before it was introduced in 1954.

The consequence is a fast, high-scoring game where possession changes constantly and a large lead can disappear in a few minutes. Both teams will typically have the ball around a hundred times each.`,
      },
      {
        type: 'when_you_will_see_it',
        body: `Watch one possession from start to finish and you will see the whole sport in miniature:

- A guard brings the ball across the halfway line.
- Teammates spread out to give each other room.
- Someone sets a **screen**, standing still to block a defender's path.
- The ball handler uses it to get a step on their defender.
- The defence shifts to help, leaving someone open.
- The ball is passed to that open player, who shoots.
- If it misses, five players fight for the **rebound**, and whoever gets it starts the whole thing again in the other direction.`,
      },
      {
        type: 'rule_differences',
        body: `The sport is the same everywhere, but two numbers are not, and they are the ones a new viewer notices first.

- **Quarter length.** Ten minutes under FIBA rules, which covers the Olympics, the World Cup and most leagues worldwide. Twelve minutes in the NBA. NCAA men's basketball uses two 20-minute halves instead of quarters.
- **Court and arc.** A FIBA court is 28 x 15 m with the three-point arc at 6.75 m. An NBA court is slightly larger, with the arc at 23 ft 9 in (7.24 m) at the top and 22 ft (6.71 m) in the corners.

Neither difference changes what the game is. But learning one set of numbers as *the* numbers is what leaves people confused the first time they watch the other.`,
      },
      {
        type: 'key_takeaways',
        body: `- Five a side, one basket each, more points wins.
- Two points, three from behind the arc, one from a free throw.
- Dribble or pass; you cannot carry the ball.
- 24 seconds to shoot, which is why the game never stalls.
- Quarter length and court size differ between the NBA and FIBA.`,
      },
    ],
  },

  {
    slug: 'how-scoring-works',
    title: 'How Scoring Works',
    shortDescription: 'One point, two points or three, and how the arc decides which.',
    type: 'rule',
    isStartHere: true,
    difficulty: 'beginner',
    category: 'rules-and-basics',
    alsoIn: ['shooting'],
    aliases: ['basketball scoring', 'points', 'how many points is a basket'],
    readMinutes: 3,
    order: 40,
    ruleSensitive: true,
    sourceRevision: FIBA_REVISION,
    lastReviewedAt: '2026-08-26',
    sourceKeys: [{ key: 'fiba-rules' }],
    related: [
      { slug: 'three-point-line', type: 'requires_understanding' },
      { slug: 'free-throw', type: 'related_to' },
      { slug: 'field-goal', type: 'related_to' },
      { slug: 'and-one', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'A basket is worth two points, three if the shooter’s feet were behind the arc, and one for a free throw.',
      },
      {
        type: 'how_it_works',
        body: `Three values, and only three:

- **One point.** A free throw: an unguarded shot from a fixed line, awarded after certain fouls.
- **Two points.** Any shot made from inside the three-point arc.
- **Three points.** Any shot made from behind the arc.

What decides two or three is **where the shooter's feet were when they left the floor**, not where they landed. A player can take off from behind the line, drift forward through the air and still score three. Step on the line, and it is two.

A shot counts the moment the ball passes through the hoop, whether it was a delicate layup or a dunk. Basketball gives no extra credit for difficulty.`,
      },
      {
        type: 'example',
        body: `A team finishes with **112** points. That total could be built many ways, but a typical modern one is:

- 30 two-point baskets = 60
- 12 three-point baskets = 36
- 16 free throws = 16

The arithmetic is why the three-pointer changed basketball. Twelve three-point shots produced more points than would sixteen two-point shots, from fewer attempts.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**"He landed inside the line, so it's two."** No. Only the take-off position matters.

**"A dunk is worth more."** It is not. Two points, exactly like a twelve-foot jump shot.

**"And-one means three points."** No. An and-one is a two-point basket plus one free throw, which totals three but is scored as separate events. A three-pointer with a foul is worth four in total.`,
      },
      {
        type: 'rule_differences',
        body: `The values are identical everywhere: one, two and three points in the NBA, FIBA, the NCAA and the WNBA.

What differs is the **distance of the arc**, so the same shot from the same spot can be worth three in one competition and two in another. FIBA sets it at 6.75 m; the NBA at 7.24 m at the top of the arc, dropping to 6.71 m in the corners.

**3x3 basketball scores differently** and is the one genuine exception: shots inside the arc are worth one point and those outside are worth two.`,
      },
    ],
  },

  {
    slug: 'possession',
    title: 'How Possession Works',
    shortDescription:
      'Who has the ball, how you lose it, and why counting possessions explains modern basketball.',
    type: 'standard',
    isStartHere: true,
    difficulty: 'beginner',
    category: 'rules-and-basics',
    aliases: ['possession', 'turnover', 'change of possession'],
    readMinutes: 4,
    order: 50,
    sourceKeys: [{ key: 'fiba-rules' }, { key: 'wp-basketball' }],
    related: [
      { slug: 'shot-clock', type: 'related_to' },
      { slug: 'turnovers', type: 'measured_by' },
      { slug: 'rebounding', type: 'related_to' },
      { slug: 'pace', type: 'measured_by' },
      { slug: 'points-per-possession', type: 'measured_by' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'A possession is one team’s turn with the ball, and it ends when they score, miss and lose the rebound, or give it away.',
      },
      {
        type: 'how_it_works',
        body: `Your possession ends in one of four ways:

- **You score.** The other team takes the ball from under the basket.
- **You miss and they rebound.** Their ball.
- **You miss and you rebound.** Your possession continues, with a fresh 14 seconds on the shot clock.
- **You turn it over.** A bad pass, a steal, a violation such as travelling, or letting the shot clock expire.

Both teams get almost exactly the same number of possessions in a game, because they alternate. That single fact is what makes basketball statistics work: if you and I both had 100 turns with the ball, then comparing what we did with them is fair.`,
      },
      {
        type: 'why_it_matters',
        body: `Almost every serious basketball number is really a rate per possession, for exactly that reason.

A team scoring 120 points a game is not necessarily better than one scoring 105. If the first plays fast and gets 105 possessions while the second plays slowly and gets 92, the second may well be more efficient with each turn. **Offensive rating**, which is points per 100 possessions, exists to remove that distortion.

It also explains why coaches care so much about turnovers and offensive rebounds. A turnover does not merely waste a possession, it hands one over. An offensive rebound does the reverse: it steals an extra turn that the other team expected to get.`,
      },
      {
        type: 'key_takeaways',
        body: `- A possession is one turn with the ball.
- It ends on a score, a defensive rebound or a turnover.
- An offensive rebound extends it rather than starting a new one.
- Both teams get roughly equal possessions, which is why per-possession rates are the honest way to compare them.`,
      },
    ],
  },

  {
    slug: 'game-clock',
    title: 'Game Clock Explained',
    shortDescription: 'Why a 48-minute game takes two and a half hours, and when the clock stops.',
    type: 'rule',
    difficulty: 'beginner',
    category: 'rules-and-basics',
    aliases: ['game clock', 'quarters', 'how long is a basketball game'],
    readMinutes: 3,
    order: 240,
    ruleSensitive: true,
    sourceRevision: FIBA_REVISION,
    lastReviewedAt: '2026-08-26',
    sourceKeys: [{ key: 'fiba-rules' }, { key: 'nba-rulebook' }],
    related: [
      { slug: 'shot-clock', type: 'contrasts_with' },
      { slug: 'overtime', type: 'related_to' },
      { slug: 'timeouts', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'The game clock counts down the playing time of each quarter, and it stops far more often than it runs.',
      },
      {
        type: 'how_it_works',
        body: `Basketball is played in four quarters. The clock runs only while the ball is live, and it stops for:

- any whistle, meaning every foul and every violation
- the ball going out of bounds
- a timeout
- the end of a quarter
- in the last minute or two, after made baskets as well

Because of all that stopping, a game of 40 or 48 playing minutes takes roughly two to two and a half hours in real time.

The last two minutes are the extreme case. A team that is behind will foul deliberately to stop the clock and force free throws, so two minutes of playing time can take fifteen minutes to complete.`,
      },
      {
        type: 'rule_differences',
        body: `This is one of the biggest practical differences between competitions.

- **FIBA:** four quarters of 10 minutes, so 40 playing minutes.
- **NBA:** four quarters of 12 minutes, so 48 playing minutes.
- **WNBA:** four quarters of 10 minutes.
- **NCAA men:** two halves of 20 minutes.
- **NCAA women:** four quarters of 10 minutes.

This is why raw per-game statistics cannot be compared across competitions. A player averaging 20 points in the NBA has had eight more minutes of game to do it in than one averaging 20 in EuroLeague. Comparing them fairly needs a per-minute or per-possession rate.`,
      },
    ],
  },

  {
    slug: 'shot-clock',
    title: 'Shot Clock Explained',
    shortDescription:
      'The 24-second rule that forces teams to shoot, and the change that made basketball watchable.',
    type: 'rule',
    isStartHere: true,
    difficulty: 'beginner',
    category: 'rules-and-basics',
    aliases: ['shot clock', '24 second clock', 'shot clock reset'],
    isFeatured: true,
    readMinutes: 4,
    order: 90,
    ruleSensitive: true,
    sourceRevision: FIBA_REVISION,
    lastReviewedAt: '2026-08-26',
    sourceKeys: [{ key: 'fiba-rules' }, { key: 'nba-rulebook' }],
    related: [
      { slug: 'shot-clock-violation', type: 'related_to' },
      { slug: 'possession', type: 'requires_understanding' },
      { slug: 'game-clock', type: 'contrasts_with' },
      { slug: 'pace', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'A team has 24 seconds from gaining the ball to get a shot that hits the rim, or they lose possession.',
      },
      {
        type: 'how_it_works',
        body: `The count starts the moment a team gains control. To beat it, a shot must **leave the shooter's hands before the buzzer and then hit the rim**. A shot that beats the buzzer but misses everything is a violation, and so is one released a fraction late even if it goes in.

The clock **resets to 24** when the other team gains possession, and after certain fouls.

It **resets to 14**, not 24, when the attacking team keeps the ball after their own missed shot, or in several other situations where they retain possession in the frontcourt. That shorter reset is deliberate: a team should not get a full new possession's worth of time simply for rebounding its own miss.`,
      },
      {
        type: 'why_it_matters',
        body: `Before 1954 there was no shot clock, and a team in front could hold the ball indefinitely. Games became unwatchable contests of stalling, and the professional game was in real trouble because of it.

The 24-second clock is generally regarded as the single change that saved it. It guarantees roughly a hundred possessions each, it means a deficit can always be overturned, and it is the reason basketball looks continuous rather than episodic.

It also creates the game's most reliable drama. A possession where the clock is running down forces a difficult shot, and "beating the shot clock" is one of the sport's recurring moments of tension.`,
      },
      {
        type: 'rule_differences',
        body: `24 seconds is standard in the NBA, FIBA and the WNBA.

- **NCAA men and women:** 30 seconds.
- **3x3 basketball:** 12 seconds, on a half court, which is why it feels relentless.

The 14-second offensive-rebound reset is now used by the NBA, FIBA and the WNBA, but it is a relatively recent convergence: older footage will show a full 24-second reset in situations that would now give 14.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**"The shot just has to be released in time."** Not quite. It must also hit the rim. A released-in-time airball is still a violation.

**"Getting the rebound gives you 24 again."** Only if the other team touched it last. Your own offensive rebound gives you 14.`,
      },
    ],
  },

  // ══ Court & positions ══════════════════════════════════════════════════════
  {
    slug: 'basketball-court',
    title: 'Basketball Court Explained',
    shortDescription: 'Every line on the floor, what it is called, and what it actually does.',
    type: 'court_area',
    isStartHere: true,
    difficulty: 'beginner',
    category: 'court-and-positions',
    aliases: ['basketball court', 'court markings', 'court lines', 'court dimensions'],
    isFeatured: true,
    readMinutes: 5,
    order: 20,
    ruleSensitive: true,
    sourceRevision: FIBA_REVISION,
    lastReviewedAt: '2026-08-26',
    sourceKeys: [{ key: 'fiba-rules' }, { key: 'nba-rulebook' }],
    related: [
      { slug: 'three-point-line', type: 'part_of' },
      { slug: 'the-paint', type: 'part_of' },
      { slug: 'the-corner', type: 'part_of' },
      { slug: 'backcourt', type: 'part_of' },
      { slug: 'spacing', type: 'used_in' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'A rectangle with a hoop at each end, divided by a halfway line, with an arc and a painted rectangle around each basket.',
      },
      {
        type: 'where_it_happens',
        body: `Working outwards from a basket:

- **The backboard and rim.** The rim is 10 ft (3.05 m) above the floor everywhere in the world, at every level, for every age group above junior. It is the one measurement basketball never varies.
- **The paint, or the key.** The painted rectangle under the basket. Attackers cannot stand in it for more than three seconds, which is why the area never becomes congested.
- **The restricted area.** A small arc directly under the basket. A defender standing inside it cannot draw a charging foul, which stops defenders parking under the rim.
- **The free-throw line.** 15 ft from the backboard, where free throws are taken.
- **The three-point arc.** Everything beyond it is worth three.
- **The corners.** Where the arc runs closest to the sideline, making the corner three the shortest three-point shot on the floor.
- **The halfway line.** Divides your **backcourt** from your **frontcourt**. Once you cross it with the ball you cannot go back.`,
      },
      {
        type: 'why_it_matters',
        body: `The court is not neutral space. Its lines create the geometry that modern tactics exploit.

The arc makes some two-point shots bad value: a long two is nearly as hard as a three and worth less, which is why the mid-range shot declined. The corner is the shortest three, so teams deliberately station shooters there. The restricted area protects attacking players driving to the rim. The three-second rule keeps the paint from being clogged.

Almost every tactical idea in basketball, from spacing to drive-and-kick, is a response to where these lines are.`,
      },
      {
        type: 'rule_differences',
        body: `The 10 ft rim and the 15 ft free-throw line are universal. Almost everything else varies.

- **FIBA:** court 28 x 15 m; arc a uniform 6.75 m, except 6.60 m in the corners.
- **NBA:** court 94 x 50 ft (28.65 x 15.24 m); arc 23 ft 9 in at the top, 22 ft in the corners.
- **NCAA and WNBA:** their own arc distances, both shorter than the NBA's.

The NBA's corner three is over a foot and a half shorter than its arc at the top, which is a large part of why the corner three became such a prized shot.`,
      },
    ],
  },

  {
    slug: 'three-point-line',
    title: 'The Three-Point Line',
    shortDescription:
      'The arc that reshaped basketball, and why one extra point changed everything.',
    type: 'court_area',
    difficulty: 'beginner',
    category: 'court-and-positions',
    alsoIn: ['shooting'],
    aliases: ['three point line', '3pt line', 'the arc', '3 point arc'],
    isFeatured: true,
    readMinutes: 4,
    order: 270,
    ruleSensitive: true,
    sourceRevision: FIBA_REVISION,
    lastReviewedAt: '2026-08-26',
    sourceKeys: [{ key: 'fiba-rules' }, { key: 'nba-rulebook' }],
    related: [
      { slug: 'three-pointer', type: 'related_to' },
      { slug: 'corner-three', type: 'part_of' },
      { slug: 'spacing', type: 'used_in' },
      { slug: 'effective-field-goal-percentage', type: 'measured_by' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'The arc around each basket beyond which a made shot scores three points instead of two.',
      },
      {
        type: 'how_it_works',
        body: `What counts is where the shooter's **feet** were at take-off. Both feet must be entirely behind the line, not touching it. A player may drift forward in the air and land well inside; the shot is still three.

The line is not the same distance from the basket all the way round. It is furthest at the top of the arc and closest in the corners, where it has to stop before running into the sideline.`,
      },
      {
        type: 'why_it_matters',
        body: `The arithmetic is simple and it took basketball thirty years to take seriously.

A 35% three-point shooter produces 1.05 points per attempt. A 50% two-point shooter produces 1.00. The worse-looking percentage is the better shot.

Once teams began measuring shot value systematically in the 2000s and 2010s, the consequences cascaded. Three-point attempts rose sharply. The mid-range shot, worth two and nearly as difficult as a three, largely disappeared from good offences. Big men learned to shoot from distance. Defences had to guard further from the basket, which opened driving lanes, which made **spacing** the organising idea of modern offence.

The line was used by the ABA from 1967 and adopted by the NBA for 1979/80, where it was treated as a novelty for years. FIBA followed in 1984.`,
      },
      {
        type: 'rule_differences',
        body: `- **FIBA:** 6.75 m, and 6.60 m in the corners.
- **NBA:** 23 ft 9 in (7.24 m) at the top, 22 ft (6.71 m) in the corners.
- **NCAA and WNBA:** shorter than the NBA at the top of the arc.

A shot from 7 m at the top of the key is a three in FIBA and a two in the NBA. Players moving between competitions have to recalibrate, and it is one reason shooting percentages do not transfer directly between leagues.`,
      },
    ],
  },

  {
    slug: 'basketball-positions',
    title: 'Basketball Positions Explained',
    subtitle: 'The five positions, and why they matter less than they used to',
    shortDescription:
      'Point guard to centre: what each traditionally does, and why modern teams increasingly ignore the labels.',
    type: 'position_role',
    isStartHere: true,
    difficulty: 'beginner',
    category: 'court-and-positions',
    aliases: ['positions', 'basketball positions', 'pg sg sf pf c', '1 through 5'],
    isFeatured: true,
    readMinutes: 5,
    order: 30,
    sourceKeys: [{ key: 'wp-basketball' }],
    related: [
      { slug: 'point-guard', type: 'part_of' },
      { slug: 'center', type: 'part_of' },
      { slug: 'positionless-basketball', type: 'contrasts_with' },
      { slug: 'stretch-four', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'Five traditional roles numbered 1 to 5, from the smallest ball-handler to the largest player near the basket.',
      },
      {
        type: 'simple_explanation',
        body: `The five, with their numbers, which you will hear commentators use constantly:

- **Point guard (1).** Usually brings the ball up and organises the offence. Traditionally the smallest and the best passer.
- **Shooting guard (2).** Typically the main perimeter scorer, working off the ball to get open.
- **Small forward (3).** The generalist. Expected to score inside and outside and guard several positions.
- **Power forward (4).** Traditionally a physical player near the basket.
- **Centre (5).** Usually the tallest. Rebounds, protects the rim, scores close in.

The numbering runs roughly from smallest to largest, and is used constantly as shorthand: a "switch onto the 5" means a defender has ended up guarding the centre.`,
      },
      {
        type: 'variations',
        body: `The traditional descriptions are now closer to historical starting points than job specifications.

The **power forward** has changed most. It was a back-to-the-basket role; the modern version is often a **stretch four** who plays outside the three-point line, because a big man standing near the rim on offence clogs the space everyone else needs.

**Point guard** has become a role rather than a person. Many teams now share ball-handling among several players, and a tall playmaker who does the job is called a **point forward**.

**Centre** is the position that has divided. Some are traditional rim-protecting rebounders; others shoot threes and are asked to defend on the perimeter.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**"Each team must field one of each."** No. Nothing in the rules mentions positions at all. A team can play five players of the same size and often does.

**"Position tells you what a player does."** Decreasingly. It is a rough guide to size and starting location, not to responsibilities.

**"Positionless means positions are gone."** It means teams select by skill rather than by label. Someone still brings the ball up; someone still guards the biggest opponent. What has gone is the assumption that those must be the same person every time.`,
      },
    ],
  },

  {
    slug: 'traveling',
    title: 'Traveling',
    shortDescription:
      'Moving your feet illegally with the ball, and the most argued-about call in basketball.',
    type: 'officiating',
    isStartHere: true,
    difficulty: 'beginner',
    category: 'fouls-and-violations',
    aliases: ['traveling', 'travelling', 'travel', 'steps', 'walking'],
    isFeatured: true,
    readMinutes: 4,
    order: 60,
    ruleSensitive: true,
    sourceRevision: FIBA_REVISION,
    lastReviewedAt: '2026-08-26',
    sourceKeys: [{ key: 'fiba-rules' }, { key: 'nba-rulebook' }, { key: 'wp-traveling' }],
    related: [
      { slug: 'double-dribble', type: 'related_to' },
      { slug: 'carrying', type: 'related_to' },
      { slug: 'possession', type: 'related_to' },
      { slug: 'step-back', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'Moving your feet illegally while holding the ball, which hands possession to the other team.',
      },
      {
        type: 'how_it_works',
        body: `Once you stop dribbling and hold the ball, one foot becomes your **pivot foot**. You may turn on it freely, but you may not lift it and put it down again before releasing the ball.

While moving, a player who gathers the ball is allowed a **gather step** plus two further steps before shooting or passing. This is the part that surprises people: a player taking the ball at speed genuinely gets what looks like three steps, and it is legal.

The penalty is simple. The whistle blows, play stops, and the other team gets the ball from the sideline. No free throws are involved.`,
      },
      {
        type: 'rule_differences',
        body: `Every competition prohibits travelling. What differs is how the gather is defined and how strictly it is enforced.

- **NBA:** the gather step is explicitly written into the rulebook, and a player may take two steps after it. This is why NBA drives can look like three or four steps to someone used to another competition.
- **FIBA:** the same two-step allowance after the gather, but the interpretation is generally regarded as tighter, particularly on the start of a dribble.
- **NCAA:** stricter again in practice.

The rule is also enforced far more loosely at the professional level than in junior basketball, which is why anyone who learned the game young finds professional footwork infuriating.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**"That was three steps, it's a travel."** Often not. The gather is not counted as a step, so a legal drive can look like three.

**"A step-back is a travel."** A step-back is legal if it happens within the allowed steps after the gather. Many are; some are not, which is why they get argued about.

**"You can never move your pivot foot."** You may lift it to shoot or pass, as long as the ball leaves your hands before it comes back down. What you cannot do is lift it and then dribble.`,
      },
    ],
  },

  {
    slug: 'fouls',
    title: 'Fouls Explained',
    shortDescription:
      'Illegal contact, what it costs, and why a team’s foul count changes how the last quarter is played.',
    type: 'officiating',
    isStartHere: true,
    difficulty: 'beginner',
    category: 'fouls-and-violations',
    aliases: ['foul', 'fouls', 'personal foul', 'basketball fouls'],
    readMinutes: 5,
    order: 80,
    ruleSensitive: true,
    sourceRevision: FIBA_REVISION,
    lastReviewedAt: '2026-08-26',
    sourceKeys: [{ key: 'fiba-rules' }, { key: 'nba-rulebook' }],
    related: [
      { slug: 'charge-vs-block', type: 'related_to' },
      { slug: 'bonus', type: 'related_to' },
      { slug: 'free-throw', type: 'related_to' },
      { slug: 'fouling-out', type: 'related_to' },
      { slug: 'technical-foul', type: 'variation_of' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'Illegal contact with an opponent, which stops play and often gives the other team free throws.',
      },
      {
        type: 'how_it_works',
        body: `Basketball is a contact sport that pretends not to be. Some contact is unavoidable and ignored; contact that gives an unfair advantage is a foul.

What happens next depends on what the fouled player was doing:

- **Fouled while shooting, shot missed:** free throws, two or three depending on where they shot from.
- **Fouled while shooting, shot went in:** the basket counts, plus one free throw. This is an **and-one**.
- **Fouled while not shooting:** normally the ball from the sideline, unless the fouling team is in the **bonus**, in which case free throws.

Every foul is recorded against the player who committed it and against their team.`,
      },
      {
        type: 'why_it_matters',
        body: `Two counters make fouls tactically important rather than merely disciplinary.

**Individual fouls.** Accumulate too many and you are disqualified for the game. A key player in **foul trouble** early is often taken off to protect them, which changes the match regardless of whether they foul again.

**Team fouls.** Once a team commits enough in a quarter, every subsequent foul gives free throws even away from the ball. This is the **bonus**, and it is why fouling gets progressively more expensive as a quarter goes on, and why trailing teams foul deliberately at the end: it is the only way to stop the clock and get the ball back.`,
      },
      {
        type: 'rule_differences',
        body: `The idea is universal; the thresholds are not.

- **Fouling out.** Six personal fouls in the NBA. Five in FIBA, the WNBA and the NCAA.
- **Bonus.** In FIBA, the fifth team foul in a quarter puts the opponent in the bonus for the rest of it. The NBA and NCAA use their own thresholds and reset rules.

The NBA's extra foul is not a small difference. With five fouls a physical defender is genuinely constrained; with six there is more room to be aggressive.`,
      },
    ],
  },

  {
    slug: 'charge-vs-block',
    title: 'Charge vs Block',
    subtitle: 'The same collision, two opposite calls',
    shortDescription:
      'Why identical-looking contact is sometimes the attacker’s foul and sometimes the defender’s.',
    type: 'officiating',
    difficulty: 'intermediate',
    category: 'fouls-and-violations',
    aliases: ['charge', 'block', 'charging', 'blocking foul', 'charge or block'],
    isFeatured: true,
    readMinutes: 4,
    order: 310,
    ruleSensitive: true,
    sourceRevision: FIBA_REVISION,
    lastReviewedAt: '2026-08-26',
    sourceKeys: [{ key: 'fiba-rules' }, { key: 'nba-rulebook' }],
    related: [
      { slug: 'charging', type: 'part_of' },
      { slug: 'blocking-foul', type: 'part_of' },
      { slug: 'restricted-area', type: 'requires_understanding' },
      { slug: 'fouls', type: 'requires_understanding' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'If the defender got there first and stood still, it is a charge on the attacker; if they were still moving or arrived late, it is a block on the defender.',
      },
      {
        type: 'how_it_works',
        body: `A defender is entitled to any spot on the floor they reach first. Getting there first and staying still is called **legal guarding position**, and it requires three things:

- They arrived before the attacker began their upward shooting motion or drive into that space.
- They were facing the attacker.
- They were **stationary**, or moving backwards or sideways rather than forwards into the contact.

Meet all three and the collision is a **charge**: an offensive foul. The attacking team loses the ball, and no free throws are given.

Fail any of them, most commonly by still sliding across or arriving a fraction late, and it is a **block**: a defensive foul, with free throws if the attacker was shooting.`,
      },
      {
        type: 'where_it_happens',
        body: `The **restricted area**, the small arc directly under the basket, exists specifically for this call.

A defender standing inside that arc **cannot draw a charge** on a player driving to the basket. Without that rule, defenders would simply stand under the rim and wait to be run into, which is dangerous and produces no basketball worth watching.

Outside the arc, the ordinary test applies. This is why you will see replays zoom in on a defender's heels: the question is whether they were inside the line.`,
      },
      {
        type: 'why_it_matters',
        body: `It is the highest-swing call in the sport. The same collision either takes the ball away from the attacking team, or gives them two free throws and puts a foul on the defender. Nothing else routinely turns on such a fine margin.

It is also genuinely hard to officiate in real time. The referee must judge the defender's feet, their timing relative to the attacker's gather, and their position relative to an arc, all in a fraction of a second and often while screened.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**"He was standing still, so it's a charge."** Not if he was inside the restricted area, and not if he arrived after the attacker had started their motion.

**"He fell over, so it's a charge."** Falling is not evidence. Players fall deliberately to sell the call, and referees are explicitly instructed to judge position rather than reaction.

**"A charge is worth the same as any other foul."** No. A charge is an offensive foul: no free throws, and possession changes hands.`,
      },
    ],
  },

  // ══ Offense ════════════════════════════════════════════════════════════════
  {
    slug: 'screen',
    title: 'Screen',
    subtitle: 'Also called a pick',
    shortDescription:
      'Standing still to block a teammate’s defender: the building block of nearly every offence.',
    type: 'play',
    difficulty: 'beginner',
    category: 'offense',
    aliases: ['screen', 'pick', 'setting a screen', 'on-ball screen'],
    readMinutes: 3,
    order: 320,
    ruleSensitive: true,
    sourceRevision: FIBA_REVISION,
    lastReviewedAt: '2026-08-26',
    sourceKeys: [{ key: 'fiba-rules' }],
    related: [
      { slug: 'pick-and-roll', type: 'used_in' },
      { slug: 'pick-and-pop', type: 'used_in' },
      { slug: 'switching', type: 'contrasts_with' },
      { slug: 'mismatch', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'A player stands still in a defender’s path so a teammate can get free.',
      },
      {
        type: 'the_action',
        body: `The screener plants their feet and stays motionless while a teammate runs their defender into them. It is legal precisely because the screener does nothing: they occupy a spot, and the defender has to go around.

Move into the defender, stick out a hip or shoulder, or set it so close that the defender has no chance to avoid it, and it becomes an **illegal screen**, which is an offensive foul.

The two roles have names: the **screener** and the **ball handler** if the screen is set on the ball.`,
        structuredData: {
          court: 'half',
          caption:
            'A basic on-ball screen. The screener is stationary; the ball handler runs their defender into it.',
          steps: [
            {
              caption:
                'The ball handler is guarded on the perimeter. The screener starts near the basket.',
              players: [
                { id: 'o1', team: 'offense', label: '1', x: 50, y: 78, hasBall: true },
                { id: 'o5', team: 'offense', label: '5', x: 50, y: 45, highlight: true },
                { id: 'd1', team: 'defense', label: 'X1', x: 50, y: 70 },
                { id: 'd5', team: 'defense', label: 'X5', x: 50, y: 38 },
              ],
              arrows: [
                {
                  kind: 'move',
                  fromX: 50,
                  fromY: 45,
                  toX: 57,
                  toY: 68,
                  label: 'screener steps up',
                },
              ],
            },
            {
              caption:
                'The screener plants their feet beside the on-ball defender and stops moving.',
              players: [
                { id: 'o1', team: 'offense', label: '1', x: 50, y: 78, hasBall: true },
                { id: 'o5', team: 'offense', label: '5', x: 57, y: 68, highlight: true },
                { id: 'd1', team: 'defense', label: 'X1', x: 50, y: 70 },
                { id: 'd5', team: 'defense', label: 'X5', x: 57, y: 60 },
              ],
              screens: [{ x: 57, y: 68, angle: 20, label: 'screen' }],
            },
            {
              caption:
                'The ball handler drives shoulder-to-shoulder past the screen; the defender is delayed.',
              players: [
                {
                  id: 'o1',
                  team: 'offense',
                  label: '1',
                  x: 62,
                  y: 66,
                  hasBall: true,
                  highlight: true,
                },
                { id: 'o5', team: 'offense', label: '5', x: 57, y: 68 },
                { id: 'd1', team: 'defense', label: 'X1', x: 52, y: 71 },
                { id: 'd5', team: 'defense', label: 'X5', x: 57, y: 60 },
              ],
              arrows: [
                {
                  kind: 'dribble',
                  fromX: 50,
                  fromY: 78,
                  toX: 62,
                  toY: 66,
                  label: 'drives off the screen',
                },
              ],
              screens: [{ x: 57, y: 68, angle: 20 }],
            },
          ],
        },
      },
      {
        type: 'why_it_matters',
        body: `A screen is the cheapest way to create an advantage. Nobody has to beat anybody one-on-one: two attackers cooperate, and for a moment the defence is a step behind.

Almost every organised offensive action in basketball is built from screens. The pick and roll, the pick and pop, the dribble hand-off, the pin-down and the elevator screen are all variations on the same idea, which is why understanding this one concept makes most of the rest legible.`,
      },
      {
        type: 'how_it_is_defended',
        body: `The defence has to choose, and every choice concedes something:

- **Go over** the screen: stays attached to a shooter, but risks being beaten to the basket.
- **Go under** it: protects the drive, but gives up an open shot.
- **Switch**: the two defenders swap assignments. Simple, but can leave a small player guarding a large one.
- **Hedge or blitz**: the screener's defender jumps out to slow the ball handler, at the cost of leaving their own player briefly free.

Which of these a team prefers is one of the defining choices of its defensive identity.`,
      },
    ],
  },

  {
    slug: 'pick-and-roll',
    title: 'Pick and Roll',
    shortDescription:
      'Basketball’s most common two-player action, and the problem every defence has to solve.',
    type: 'play',
    isStartHere: true,
    difficulty: 'intermediate',
    category: 'offense',
    aliases: ['pick and roll', 'p&r', 'pnr', 'ball screen', 'screen and roll'],
    isFeatured: true,
    readMinutes: 5,
    order: 100,
    sourceKeys: [{ key: 'wp-pick-and-roll' }],
    related: [
      { slug: 'screen', type: 'requires_understanding' },
      { slug: 'pick-and-pop', type: 'variation_of' },
      { slug: 'drop-coverage', type: 'contrasts_with' },
      { slug: 'switching', type: 'contrasts_with' },
      { slug: 'spacing', type: 'related_to' },
      { slug: 'mismatch', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'One player screens the ball handler’s defender, then cuts to the basket, forcing the defence to cover two threats with too few defenders.',
      },
      {
        type: 'the_action',
        body: `Five steps, and the whole thing takes about four seconds:

1. The ball handler has the ball on the perimeter, usually near the top of the arc.
2. A teammate, traditionally the centre, comes up and sets a screen on the ball handler's defender.
3. The ball handler dribbles tight off that screen.
4. The screener **rolls**: they turn and cut hard toward the basket.
5. The ball handler reads what the defence did and either shoots, drives, passes to the roller, or passes out to a shooter.

The reason it works is arithmetic. Two attackers are now attacking, and the screen has temporarily removed one defender from the play. Somebody has to help, and whoever helps leaves someone open.`,
        structuredData: {
          court: 'half',
          caption: 'A pick and roll from the top of the arc, with shooters spaced to the corners.',
          steps: [
            {
              caption:
                'Starting shape. Three teammates are spaced wide so the defence cannot help easily.',
              players: [
                { id: 'o1', team: 'offense', label: '1', x: 50, y: 80, hasBall: true },
                { id: 'o5', team: 'offense', label: '5', x: 44, y: 50 },
                { id: 'o2', team: 'offense', label: '2', x: 12, y: 70 },
                { id: 'o3', team: 'offense', label: '3', x: 88, y: 70 },
                { id: 'o4', team: 'offense', label: '4', x: 90, y: 40 },
                { id: 'd1', team: 'defense', label: 'X1', x: 50, y: 72 },
                { id: 'd5', team: 'defense', label: 'X5', x: 46, y: 42 },
              ],
            },
            {
              caption: 'The centre sets the screen on the ball handler’s defender.',
              players: [
                { id: 'o1', team: 'offense', label: '1', x: 50, y: 80, hasBall: true },
                { id: 'o5', team: 'offense', label: '5', x: 56, y: 70, highlight: true },
                { id: 'o2', team: 'offense', label: '2', x: 12, y: 70 },
                { id: 'o3', team: 'offense', label: '3', x: 88, y: 70 },
                { id: 'd1', team: 'defense', label: 'X1', x: 50, y: 72 },
                { id: 'd5', team: 'defense', label: 'X5', x: 56, y: 62 },
              ],
              arrows: [{ kind: 'move', fromX: 44, fromY: 50, toX: 56, toY: 70 }],
              screens: [{ x: 56, y: 70, angle: 15, label: 'screen' }],
            },
            {
              caption:
                'The ball handler drives off the screen. Two defenders are now occupied by one ball.',
              players: [
                {
                  id: 'o1',
                  team: 'offense',
                  label: '1',
                  x: 60,
                  y: 66,
                  hasBall: true,
                  highlight: true,
                },
                { id: 'o5', team: 'offense', label: '5', x: 56, y: 70 },
                { id: 'o2', team: 'offense', label: '2', x: 12, y: 70 },
                { id: 'o3', team: 'offense', label: '3', x: 88, y: 70 },
                { id: 'd1', team: 'defense', label: 'X1', x: 52, y: 72 },
                { id: 'd5', team: 'defense', label: 'X5', x: 58, y: 60 },
              ],
              arrows: [{ kind: 'dribble', fromX: 50, fromY: 80, toX: 60, toY: 66 }],
            },
            {
              caption: 'The screener rolls to the basket. The defence must choose who to guard.',
              players: [
                { id: 'o1', team: 'offense', label: '1', x: 62, y: 62, hasBall: true },
                { id: 'o5', team: 'offense', label: '5', x: 50, y: 30, highlight: true },
                { id: 'o2', team: 'offense', label: '2', x: 12, y: 70 },
                { id: 'o3', team: 'offense', label: '3', x: 88, y: 70 },
                { id: 'd1', team: 'defense', label: 'X1', x: 57, y: 66 },
                { id: 'd5', team: 'defense', label: 'X5', x: 56, y: 52 },
              ],
              arrows: [{ kind: 'move', fromX: 56, fromY: 70, toX: 50, toY: 30, label: 'rolls' }],
            },
            {
              caption: 'The read: a pass to the roller, or out to the corner if help arrives.',
              players: [
                { id: 'o1', team: 'offense', label: '1', x: 62, y: 62, hasBall: true },
                { id: 'o5', team: 'offense', label: '5', x: 50, y: 30 },
                { id: 'o2', team: 'offense', label: '2', x: 12, y: 70 },
                { id: 'o3', team: 'offense', label: '3', x: 88, y: 70 },
                { id: 'd1', team: 'defense', label: 'X1', x: 57, y: 66 },
                { id: 'd5', team: 'defense', label: 'X5', x: 52, y: 42 },
              ],
              arrows: [
                { kind: 'pass', fromX: 62, fromY: 62, toX: 50, toY: 30, label: 'to the roller' },
                { kind: 'pass', fromX: 62, fromY: 62, toX: 88, toY: 70, label: 'or kick out' },
              ],
            },
          ],
        },
      },
      {
        type: 'why_it_matters',
        body: `It is the most-used action in professional basketball, and it has become more dominant as spacing has improved.

The reason is that it creates a decision the defence cannot answer without cost. Help off a corner shooter and you concede an open three. Don't help and you concede a layup to the roller. Switch, and you may end up with a guard trying to keep a centre off the rim, or a centre trying to stay in front of a quick guard.

It also needs only two players, which means it can be run at any point in a possession, including with the shot clock running down.`,
      },
      {
        type: 'how_it_is_defended',
        body: `The main coverages, each conceding something different:

- **Drop.** The screener's defender sags toward the basket, protecting the rim and conceding the mid-range pull-up.
- **Switch.** Defenders swap. Concedes a mismatch.
- **Hedge.** The big defender jumps out momentarily to slow the ball, then recovers.
- **Blitz.** Two defenders trap the ball handler outright, forcing the pass and leaving a four-on-three behind it.
- **Under.** The on-ball defender goes beneath the screen, conceding a jump shot to protect the drive. Used against poor shooters.

Which one a team uses often depends on a single player: a centre who can move his feet on the perimeter allows switching, and one who cannot generally requires drop.`,
      },
      {
        type: 'variations',
        body: `- **Pick and pop.** The screener steps out for a jump shot instead of rolling. Requires a big who can shoot.
- **Spain pick and roll.** A third attacker screens the roller's defender from behind, which breaks drop coverage.
- **Double drag.** Two screeners in succession.
- **Ghost screen.** The screener fakes the screen and slips away early.
- **Empty-corner pick and roll.** Run on a side with no attacker in the corner, removing the nearest helper entirely.`,
      },
    ],
  },

  {
    slug: 'spacing',
    title: 'Spacing',
    shortDescription:
      'Standing far enough apart that one defender cannot guard two players: modern offence in one idea.',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'offense',
    aliases: ['spacing', 'floor spacing', 'space the floor'],
    isFeatured: true,
    readMinutes: 4,
    order: 340,
    sourceKeys: [{ key: 'wp-basketball' }],
    related: [
      { slug: 'three-point-line', type: 'requires_understanding' },
      { slug: 'pick-and-roll', type: 'used_in' },
      { slug: 'drive-and-kick', type: 'used_in' },
      { slug: 'corner-three', type: 'related_to' },
      { slug: 'stretch-four', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'Positioning attackers far enough apart that no defender can guard two of them at once.',
      },
      {
        type: 'how_it_works',
        body: `A defender can only cover so much ground. If two attackers stand ten feet apart, one defender can plausibly bother both. If they stand thirty feet apart and both can shoot, they cannot.

Good spacing usually means four attackers positioned around the three-point arc, typically both corners and both wings, with one player operating inside. Every defender is then occupied by somebody who is a genuine threat from where they stand, and nobody is free to help.

The critical word is **threat**. Spacing is not about standing far apart; it is about standing far apart *while being dangerous*. A non-shooter in the corner is not spacing the floor, because their defender can ignore them and help elsewhere.`,
      },
      {
        type: 'why_it_matters',
        body: `Spacing is what makes everything else work. A drive to the basket only succeeds if help defenders are too far away to arrive in time. A pick and roll only creates an advantage if the corner shooter's defender cannot cheat inside.

This is why the three-point line reshaped the sport so thoroughly. Once enough players could shoot from distance, defences had to guard further out, which stretched them, which opened the areas closer to the basket that had previously been crowded. Big men who could shoot became valuable not only for their own scoring but because their defender had to leave the paint.

It is also why the mid-range game declined. A player standing at fifteen feet occupies a defender while threatening only the least valuable shot on the floor.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**"Spacing means everyone stands still."** No. Cutting and moving are part of it. What matters is that the shape stays stretched rather than collapsing toward the ball.

**"Any five players can space the floor."** Only if enough of them can shoot. A lineup with two non-shooters is far harder to space, which is why shooting became so highly valued even in players who do little else.`,
      },
    ],
  },

  {
    slug: 'fast-break',
    title: 'Fast Break',
    shortDescription:
      'Attacking before the defence is set, and why the first four seconds are the most efficient in basketball.',
    type: 'play',
    difficulty: 'beginner',
    category: 'offense',
    aliases: ['fast break', 'break', 'running the floor', 'transition'],
    readMinutes: 3,
    order: 350,
    sourceKeys: [{ key: 'wp-basketball' }],
    related: [
      { slug: 'transition-offense', type: 'part_of' },
      { slug: 'transition-defense', type: 'contrasts_with' },
      { slug: 'possession', type: 'related_to' },
      { slug: 'pace', type: 'measured_by' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'Pushing the ball up the floor immediately after gaining possession, to attack before the defence can organise.',
      },
      {
        type: 'the_action',
        body: `It starts with a defensive rebound, a steal or, increasingly, simply taking the ball out quickly after conceding a basket. The rebounder outlets the ball to a guard, or pushes it themselves, and the team runs.

The advantage is temporary and specific: for a few seconds, the defence is behind the ball, unmatched and unsure who is guarding whom. A three-on-two or two-on-one is not merely a numbers advantage, it is a situation where the defenders must commit to one attacker and concede the other.

The break ends when the defence is set. What follows is ordinary half-court offence.`,
      },
      {
        type: 'why_it_matters',
        body: `Shots taken in the first few seconds of a possession are among the most efficient in basketball, because they are taken against a disorganised defence. Layups against nobody are the best shot in the sport.

This is why teams push after a miss even when they do not have a numerical advantage, and why "getting back" is drilled so heavily on defence. Preventing the break is worth more than any individual defensive stop in the half court.

It is also why turnovers are so costly. A turnover does not simply end your possession; it frequently starts the opponent's at a run, with your defence out of position.`,
      },
      {
        type: 'how_it_is_defended',
        body: `Transition defence has a strict priority order:

1. **Stop the ball.** One defender slows the ball handler, even outnumbered.
2. **Protect the rim.** Another retreats to the basket to prevent a layup.
3. **Find the corners.** Only once those two are covered do defenders match up on shooters.

Teams also send only one or two players to the offensive glass, keeping others back specifically to prevent breaks. That trade-off, offensive rebounds against transition safety, is one of the standing strategic choices in the modern game.`,
      },
    ],
  },

  {
    slug: 'isolation',
    title: 'Isolation',
    subtitle: 'Commonly shortened to "iso"',
    shortDescription:
      'Clearing out the floor to let one attacker beat one defender, with nobody else involved.',
    type: 'play',
    difficulty: 'beginner',
    category: 'offense',
    aliases: ['isolation', 'iso', 'clear out', 'one on one'],
    readMinutes: 3,
    order: 360,
    sourceKeys: [{ key: 'wp-basketball' }],
    related: [
      { slug: 'spacing', type: 'requires_understanding' },
      { slug: 'mismatch', type: 'related_to' },
      { slug: 'double-team', type: 'contrasts_with' },
      { slug: 'usage-rate', type: 'measured_by' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'Giving one attacker the ball and space to attack their defender alone, while teammates deliberately stay out of the way.',
      },
      {
        type: 'the_action',
        body: `Teammates move away from the ball, usually to the opposite side or the corners, and stay there. The attacker then goes to work: driving, backing down, or shooting over their defender.

The point of the clear-out is not politeness. It removes the nearby defenders who would otherwise be positioned to help, so that the defender guarding the ball is genuinely alone.

Isolations are most common late in the shot clock, when there is no time to run anything else, and at the end of close games, when teams want the ball in their best scorer's hands and would rather not risk a complicated action.`,
      },
      {
        type: 'why_it_matters',
        body: `Isolation is basketball's least efficient common action per possession, and it is used constantly anyway, for two good reasons.

The first is **mismatches**. If a switch has left a small guard defending a large forward, isolating that pairing attacks the single weakest point on the floor.

The second is **reliability**. A well-defended isolation from an elite scorer is a mediocre shot; a broken-down set play with two seconds left is worse. Teams accept lower average efficiency in exchange for a shot they can guarantee they will get.

The criticism of isolation-heavy offence is that four players stand and watch, which makes the team predictable and easy to prepare for.`,
      },
      {
        type: 'how_it_is_defended',
        body: `- **Stay in front and take the contest.** Accept the one-on-one if your defender can hold up.
- **Double-team.** Send a second defender, at the cost of leaving somebody open. Effective against a scorer who does not pass well out of pressure.
- **Force a direction.** Push the attacker to their weaker hand or toward the baseline, where help is closest.
- **Pre-switch.** Avoid the mismatch happening in the first place.`,
      },
    ],
  },

  // ══ Defense ════════════════════════════════════════════════════════════════
  {
    slug: 'man-to-man-defense',
    title: 'Man-to-Man Defense',
    shortDescription:
      'Every defender is responsible for one attacker, and the switches and help that complicate it.',
    type: 'tactical_concept',
    isStartHere: true,
    difficulty: 'beginner',
    category: 'defense',
    aliases: ['man to man', 'man defense', 'man-to-man'],
    readMinutes: 4,
    order: 110,
    sourceKeys: [{ key: 'wp-basketball' }],
    related: [
      { slug: 'zone-defense', type: 'contrasts_with' },
      { slug: 'man-vs-zone', type: 'related_to' },
      { slug: 'help-defense', type: 'part_of' },
      { slug: 'switching', type: 'part_of' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'Each defender is assigned one opponent and follows them, wherever they go.',
      },
      {
        type: 'how_it_works',
        body: `Assignments are usually made by size and skill: the best perimeter defender takes the opponent's best perimeter scorer, the centre takes the centre.

Where a defender stands depends on where the ball is:

- **On the ball:** close, contesting.
- **One pass away:** in the passing lane, denying the ball.
- **Two passes away, on the weak side:** sagging toward the middle, ready to help.

That third position is the crucial one. Pure man-to-man, where every defender simply follows their own player and nothing else, is not played at any serious level, because it gives up an uncontested layup every time someone is beaten. Real man-to-man always includes help.`,
      },
      {
        type: 'why_it_matters',
        body: `It remains the base defence at almost every professional level, because it is the most adaptable. Assignments can be tailored, mismatches can be avoided, and the same structure works against any offensive shape.

Its weakness is that it is only as strong as its weakest defender. If one player can be beaten off the dribble repeatedly, the whole defence has to keep helping, and every help creates an open shot somewhere else. Modern offences hunt precisely that: they will run action after action at the defender they think is weakest.`,
      },
      {
        type: 'variations',
        body: `- **Switch-heavy.** Defenders swap assignments on every screen. Simple and disruptive, but produces mismatches.
- **Drop.** The big defender sags on ball screens to protect the rim.
- **Denial.** Aggressive fronting of passing lanes, to stop the ball reaching a scorer at all.
- **Sagging.** Backing off a poor shooter deliberately, using their defender as a permanent extra helper.`,
      },
    ],
  },

  {
    slug: 'zone-defense',
    title: 'Zone Defense',
    shortDescription:
      'Defenders guard areas rather than opponents, and the trade-offs that come with it.',
    type: 'tactical_concept',
    difficulty: 'beginner',
    category: 'defense',
    aliases: ['zone', 'zone defense', 'zone defence', '2-3 zone'],
    readMinutes: 4,
    order: 380,
    ruleSensitive: true,
    sourceRevision: NBA_REVISION,
    lastReviewedAt: '2026-08-26',
    sourceKeys: [{ key: 'wp-zone-defense' }, { key: 'nba-rulebook' }],
    related: [
      { slug: 'man-to-man-defense', type: 'contrasts_with' },
      { slug: 'man-vs-zone', type: 'related_to' },
      { slug: 'two-three-zone', type: 'variation_of' },
      { slug: 'three-second-violation', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'Each defender guards a region of the floor and whoever enters it, rather than a specific opponent.',
      },
      {
        type: 'how_it_works',
        body: `Zones are named by how the defenders are arranged from the top of the arc down toward the baseline. A **2-3** has two defenders up top and three across the back. A **3-2** has three up and two back. A **1-3-1** has one at the point, three across the middle and one at the baseline.

Defenders shift as a unit with the ball, so the whole shape slides toward whichever side the ball is on. Responsibility for an attacker passes from one defender to the next as they move between regions.

The intent is to protect the most valuable areas, particularly the space near the basket, rather than to track individuals.`,
      },
      {
        type: 'why_it_matters',
        body: `A zone is a tool rather than a philosophy, and it is chosen for specific reasons: to hide a slow defender who cannot stay in front of anyone, to protect players in foul trouble, to disrupt a team that has found a rhythm against man-to-man, or to take away driving lanes against a team that cannot shoot.

Its costs are equally specific. Zones are vulnerable to good outside shooting, since the gaps between defenders are shooting space. They are poor at defensive rebounding, because nobody has a specific man to box out. And a well-drilled offence can move the ball faster than the zone can shift.`,
      },
      {
        type: 'rule_differences',
        body: `This is a place where the competitions genuinely diverged for decades.

**The NBA banned zone defence outright until 2001.** Defenders had to guard a specific attacker, which is why older NBA basketball looks so isolation-heavy. Zones are now legal, but the NBA's **defensive three-second rule** still prohibits a defender from staying in the paint for three seconds unless actively guarding someone, which limits how passively a zone can sit.

**FIBA, the NCAA and the WNBA** have no such restriction and have always permitted zones freely. This is one reason college basketball in particular features far more zone than the NBA does, and why teams meeting international opposition often have to prepare for zone looks they rarely face at home.`,
      },
    ],
  },

  {
    slug: 'help-defense',
    title: 'Help Defense',
    shortDescription:
      'Leaving your own assignment to cover a teammate’s, and the chain reaction it starts.',
    type: 'tactical_concept',
    difficulty: 'beginner',
    category: 'defense',
    aliases: ['help defense', 'help', 'help side', 'weak side help'],
    readMinutes: 4,
    order: 390,
    sourceKeys: [{ key: 'wp-basketball' }],
    related: [
      { slug: 'man-to-man-defense', type: 'part_of' },
      { slug: 'defensive-rotation', type: 'related_to' },
      { slug: 'closeout', type: 'related_to' },
      { slug: 'drive-and-kick', type: 'contrasts_with' },
      { slug: 'spacing', type: 'contrasts_with' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'Stepping away from your own assignment to stop a teammate’s opponent, usually one driving to the basket.',
      },
      {
        type: 'how_it_works',
        body: `When an attacker beats their defender, someone must stop them or concede a layup. The nearest defender steps across, and from that moment the defence is playing four against five somewhere else.

That is the whole difficulty. Help is never free: it solves an immediate problem and creates a new one. The attacker who was helped off is now open, so a second defender must **rotate** to cover them, which leaves a third player open, and so on. A well-organised defence rotates as a chain; a poorly organised one gives up an open three.

Help usually comes from the **weak side**, meaning the side of the floor away from the ball, because those defenders are furthest from their own assignments and therefore cheapest to move.`,
      },
      {
        type: 'why_it_matters',
        body: `Help defence is what makes team defence a team activity rather than five individual contests. It is also the reason spacing matters so much on offence: an offence's whole objective is to position players so that helping is as expensive as possible.

The modern tension is direct. Helping off a corner shooter concedes the most valuable shot on the floor. Not helping concedes a layup. Teams differ in which they consider worse, and that choice defines their defensive identity as much as any scheme.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**"Good defenders always help."** No. Helping unnecessarily, often called over-helping, is a common error. If your teammate has their man contained, leaving your own assignment simply gives away an open shot.

**"The open shot was that defender's fault."** Frequently it is the fault of whoever was beaten two passes earlier and forced the rotation. Defensive breakdowns are usually assigned to the last person visible in the replay rather than the person who caused them.`,
      },
    ],
  },

  {
    slug: 'switching',
    title: 'Switching',
    shortDescription:
      'Swapping defensive assignments on a screen: the simplest answer, and the mismatches it creates.',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'defense',
    aliases: ['switch', 'switching', 'switch everything'],
    readMinutes: 4,
    order: 200,
    sourceKeys: [{ key: 'wp-basketball' }],
    related: [
      { slug: 'screen', type: 'requires_understanding' },
      { slug: 'pick-and-roll', type: 'used_in' },
      { slug: 'drop-coverage', type: 'contrasts_with' },
      { slug: 'mismatch', type: 'related_to' },
      { slug: 'three-and-d', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'When a screen is set, the two defenders trade assignments rather than fighting through it.',
      },
      {
        type: 'how_it_works',
        body: `The defender guarding the screener takes the ball handler; the defender who was screened takes the screener. Nobody has to navigate the screen at all, so the offence gains no immediate advantage from setting it.

Its appeal is that it is simple and it never breaks down in the way a mistimed hedge or a blown rotation does. Against a team that runs many screens, switching keeps a defender attached to every attacker at all times.

Its cost arrives immediately afterwards. The assignments are now wrong by size or speed, and the offence's next move is to attack whichever mismatch it just created.`,
      },
      {
        type: 'why_it_matters',
        body: `Switching became far more common as offences ran more and more screens, and it changed how teams are built.

To switch every screen, you need five defenders who can each plausibly guard several positions: guards strong enough not to be overpowered inside, and big men mobile enough to stay in front of a guard on the perimeter. That requirement is the reason "switchable" became one of the most valued defensive attributes, and why the traditional immobile centre became harder to play in the modern game.

The counter is equally direct. Offences now deliberately screen with a big man in order to force a switch and then isolate the guard who ends up defending him.`,
      },
      {
        type: 'variations',
        body: `- **Switch everything.** Every screen is switched regardless. Requires an unusually versatile group.
- **Switch 1 through 4.** Switch among the four smaller positions, but never switch the centre onto a guard.
- **Late switch.** Switch only if the ball handler actually uses the screen.
- **Switch and back.** Switch briefly, then swap back once the danger passes, avoiding a lasting mismatch.`,
      },
    ],
  },

  // ══ Statistics ═════════════════════════════════════════════════════════════
  {
    slug: 'box-score',
    title: 'How to Read a Basketball Box Score',
    shortDescription:
      'Every column in the table, what it means, and which numbers actually tell you something.',
    type: 'statistic',
    isStartHere: true,
    difficulty: 'beginner',
    category: 'statistics',
    aliases: ['box score', 'boxscore', 'stat line', 'reading stats'],
    isFeatured: true,
    readMinutes: 6,
    order: 120,
    sourceKeys: [{ key: 'wp-box-score' }],
    related: [
      { slug: 'field-goal-percentage', type: 'part_of' },
      { slug: 'plus-minus', type: 'part_of' },
      { slug: 'true-shooting-percentage', type: 'related_to' },
      { slug: 'triple-double', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'A table with one row per player, recording what each of them did: minutes, shooting, rebounds, assists and points.',
      },
      {
        type: 'how_to_read_it',
        body: `The columns, in the order they usually appear:

- **MIN.** Minutes played.
- **FG.** Field goals: made and attempted, written as "9-17". Excludes free throws.
- **3P.** Three-pointers made and attempted. These are also counted inside FG, not in addition to it.
- **FT.** Free throws made and attempted.
- **OREB / DREB / REB.** Offensive, defensive and total rebounds.
- **AST.** Assists: passes leading directly to a basket.
- **STL / BLK.** Steals and blocks.
- **TO.** Turnovers.
- **PF.** Personal fouls.
- **+/-.** The team's net score while that player was on the floor.
- **PTS.** Total points.

The single most common misreading is treating FG and 3P as separate. A line of "10-20 FG, 4-8 3P" means twenty shots in total, of which eight were threes, not twenty-eight shots.`,
      },
      {
        type: 'example',
        body: `A line reading **28 PTS, 9-19 FG, 3-7 3P, 7-8 FT, 11 REB, 6 AST, 3 TO, +12**:

Nineteen shots from the floor, nine made. Seven of those nineteen were three-pointers, three of which went in. Eight free throws, seven made.

Check the points: (9 - 3) x 2 for the two-pointers = 12, plus 3 x 3 = 9 for the threes, plus 7 free throws = **28**. That arithmetic always works, and it is the quickest way to confirm you are reading the columns correctly.

Eleven rebounds and six assists alongside 28 points is a strong all-round game, and +12 says the team outscored the opponent by twelve while they played.`,
      },
      {
        type: 'what_it_does_not_tell_you',
        body: `The box score records events, not value, and it systematically misses several things.

**Defence is nearly invisible.** Steals and blocks are the only defensive entries, and they reward gambling rather than positioning. A defender who deters shots entirely, or who never gets beaten, produces no statistic at all.

**Shot difficulty is ignored.** A wide-open three and a contested fadeaway count identically.

**Efficiency needs context.** 28 points looks good, but 28 on 30 shots is poor. This is precisely why **true shooting percentage** exists.

**Plus-minus is noisy in a single game.** Over one game it depends heavily on who else was on the floor. It only becomes meaningful across a season.`,
      },
    ],
  },

  {
    slug: 'field-goal-percentage',
    title: 'Field Goal Percentage (FG%)',
    shortDescription:
      'The simplest shooting number, and why it quietly misleads in the three-point era.',
    type: 'statistic',
    difficulty: 'beginner',
    category: 'statistics',
    aliases: ['fg%', 'fg percentage', 'field goal percentage', 'shooting percentage'],
    readMinutes: 3,
    order: 220,
    sourceKeys: [{ key: 'wp-box-score' }],
    related: [
      { slug: 'effective-field-goal-percentage', type: 'contrasts_with' },
      { slug: 'true-shooting-percentage', type: 'contrasts_with' },
      { slug: 'box-score', type: 'part_of' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'The share of shots from open play that a player makes, ignoring free throws.',
      },
      {
        type: 'how_it_is_calculated',
        body: `**FG% = field goals made ÷ field goals attempted**

A player who makes 9 of 20 shoots 45%. Free throws are excluded entirely. Three-pointers are included, and this is where the trouble starts.`,
      },
      {
        type: 'what_it_does_not_tell_you',
        body: `FG% treats a two-pointer and a three-pointer as the same event, which they are not.

Compare two players who both take ten shots:

- Player A makes 5 of 10 two-pointers. FG% is 50%, and they scored 10 points.
- Player B makes 4 of 10 three-pointers. FG% is 40%, and they scored 12 points.

Player B has the worse percentage and produced more points. Any statistic that ranks A above B is answering the wrong question.

FG% also ignores free throws, so a player who draws fouls constantly and converts them is undervalued.

This is why **effective field goal percentage** exists, which credits a three as worth 1.5 twos, and why **true shooting percentage** exists, which also includes free throws. For judging a modern scorer, either is more informative than FG%.`,
      },
      {
        type: 'how_to_interpret',
        body: `FG% is still useful in narrow contexts where the shot type is roughly constant. It says something real about a centre who takes nothing but shots at the rim, where anything below about 60% is poor.

For a guard who mixes threes, drives and free throws, it says very little on its own. Read it alongside 3P% and FT%, or skip straight to true shooting.`,
      },
    ],
  },

  {
    slug: 'plus-minus',
    title: 'Plus-Minus',
    shortDescription:
      'The score while you were playing, and why one game of it tells you almost nothing.',
    type: 'statistic',
    difficulty: 'intermediate',
    category: 'statistics',
    aliases: ['plus minus', '+/-', 'plus/minus', 'net points'],
    readMinutes: 4,
    order: 230,
    sourceKeys: [{ key: 'wp-box-score' }],
    related: [
      { slug: 'net-rating', type: 'related_to' },
      { slug: 'on-off-rating', type: 'related_to' },
      { slug: 'box-score', type: 'part_of' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'How many points your team outscored the opponent by while you were on the floor.',
      },
      {
        type: 'how_it_is_calculated',
        body: `**+/- = (team points scored − opponent points scored) while the player was on court**

If your team scores 48 and concedes 40 during your minutes, you finish +8. Nothing you personally did enters the calculation, which is both the point and the problem.`,
      },
      {
        type: 'why_it_matters',
        body: `Every other box score statistic records only what a player did with the ball. Plus-minus is the only common number that captures the things the box score cannot see: setting good screens, making the right rotation, deterring a shot without blocking it, being in the right place.

It is the reason a player with unremarkable statistics can be visibly valuable, and it is the starting point for every more sophisticated impact metric.`,
      },
      {
        type: 'what_it_does_not_tell_you',
        body: `Raw plus-minus depends heavily on **who else was on the floor**, and that dependence is severe.

A weak player who shares all their minutes with four excellent teammates will post a strong plus-minus. A strong player on a poor team, or one who plays most of their minutes with the substitutes, will post a bad one. In a single game the figure is close to noise: a couple of three-pointers going in or out while you happened to be resting can swing it by ten.

The fixes are all versions of adding context:

- **Net rating** expresses the same idea per 100 possessions, removing pace.
- **On/off** compares the team's performance with and without the player.
- **Adjusted plus-minus** and its descendants attempt to statistically separate a player's contribution from their teammates'.

Read single-game plus-minus as a rough hint. Read season-long on/off numbers as evidence.`,
      },
    ],
  },

  {
    slug: 'true-shooting-percentage',
    title: 'True Shooting Percentage',
    shortDescription:
      'One number for scoring efficiency that counts threes and free throws properly.',
    type: 'statistic',
    difficulty: 'advanced',
    category: 'statistics',
    aliases: ['ts%', 'true shooting', 'true shooting percentage', 'ts'],
    isFeatured: true,
    readMinutes: 4,
    order: 240,
    sourceKeys: [{ key: 'wp-true-shooting' }],
    related: [
      { slug: 'effective-field-goal-percentage', type: 'related_to' },
      { slug: 'field-goal-percentage', type: 'contrasts_with' },
      { slug: 'usage-rate', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'A single efficiency figure that accounts for two-pointers, three-pointers and free throws together.',
      },
      {
        type: 'what_it_measures',
        body: `How many points a player produces per scoring attempt, where an attempt is any shot or trip to the line.

It exists because FG% and even eFG% answer incomplete questions. FG% ignores that threes are worth more and that free throws exist at all. A player who draws eight fouls a game and converts them is creating real, efficient offence that FG% cannot see.`,
      },
      {
        type: 'how_it_is_calculated',
        body: `**TS% = Points ÷ (2 × (FGA + 0.44 × FTA))**

The **0.44** is the part that needs explaining. Free throws do not map one-to-one onto possessions: most shooting fouls give two attempts, three-point fouls give three, an and-one gives one, and technical free throws belong to no possession at all. Averaged across a season, roughly 0.44 free-throw attempts correspond to one used possession. It is an empirical estimate rather than an exact constant.

The result is scaled so that it can be read on the same axis as a shooting percentage, which is why it looks like a percentage but can exceed the share of shots actually made.`,
      },
      {
        type: 'example',
        body: `A player scores **30 points** on **20 field goal attempts** and **10 free throw attempts**.

Denominator: 2 × (20 + 0.44 × 10) = 2 × 24.4 = **48.8**

TS% = 30 ÷ 48.8 = **61.5%**

Compare with a player who also scores 30, but on 28 field goal attempts and no free throws: 30 ÷ 56 = **53.6%**. Same points, materially different efficiency, and FG% alone would not have told you.`,
      },
      {
        type: 'how_to_interpret',
        body: `Rough guidance for professional basketball:

- Around **60%** and above: excellent.
- Around **55%**: solid; near the league average for an efficient scorer.
- Below **50%**: poor for a high-volume player.

Always read it alongside **usage rate**. High efficiency on few shots is much easier than high efficiency while carrying an offence, and the two numbers together say far more than either alone.`,
      },
      {
        type: 'what_it_does_not_tell_you',
        body: `It measures efficiency, not value or difficulty. A player taking only wide-open corner threes created by teammates will post a fine TS% without generating anything himself. It says nothing about passing, defence or the shots a player creates for others, and it does not adjust for how hard the attempts were.

Benchmarks also drift. League-wide efficiency has risen substantially over the decades, so a TS% that was outstanding in the 1990s is merely good now. Comparing across eras requires comparing to the league average of the time rather than to a fixed number.`,
      },
    ],
  },

  // ══ NBA ════════════════════════════════════════════════════════════════════
  {
    slug: 'nba-regular-season',
    title: 'NBA Regular Season',
    shortDescription: '82 games, two conferences, and what the standings are actually deciding.',
    type: 'format',
    difficulty: 'beginner',
    category: 'nba-explained',
    aliases: ['nba season', 'regular season', '82 games'],
    readMinutes: 4,
    order: 250,
    ruleSensitive: true,
    sourceRevision: NBA_REVISION,
    lastReviewedAt: '2026-08-26',
    sourceKeys: [{ key: 'wp-nba' }, { key: 'nba-rulebook' }],
    related: [
      { slug: 'nba-playoffs', type: 'related_to' },
      { slug: 'nba-conferences', type: 'requires_understanding' },
      { slug: 'nba-play-in-tournament', type: 'related_to' },
      { slug: 'seeding', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'Thirty teams each play 82 games between October and April to determine playoff qualification and seeding.',
      },
      {
        type: 'how_it_works',
        body: `The thirty teams are divided into an **Eastern** and a **Western Conference** of fifteen each, and each conference into three divisions. The divisions matter far less than they once did: they affect the schedule, but seeding is decided at conference level.

Every team plays 82 games, weighted toward opponents in its own conference. There are no draws; any tied game goes to overtime.

Standings are ordered by **win percentage** rather than points, and since every team plays the same number of games, that is simply the win-loss record. Tie-breakers such as head-to-head record settle teams level at the end.

The season's purpose is to decide two things: which teams reach the postseason, and in what order they are seeded.`,
      },
      {
        type: 'why_it_matters',
        body: `Seeding is the real prize, because it determines both who you play and where you play it.

The team with the better regular-season record holds **home-court advantage**, meaning the deciding game of a series is played at their arena. Over an 82-game season that advantage is worth a great deal, and teams will compete hard in April for a single place in the standings because of it.

The length of the season also shapes how it is played. With 82 games in six months, teams manage player workload deliberately, and a result in November is treated very differently from one in April.`,
      },
      {
        type: 'rule_differences',
        body: `An 82-game regular season is an outlier, and it is worth knowing how unusual it is.

- **WNBA:** a 40-plus game season played over the summer.
- **EuroLeague:** a much shorter league phase, and clubs play their domestic league simultaneously, so a European club's season is two competitions at once rather than one long one.
- **NCAA:** roughly 30 games, then conference tournaments, then a single-elimination national tournament.

This is why European and college basketball treat individual games as more consequential: there are far fewer of them, and in the NCAA a single defeat in March ends the season entirely.`,
      },
    ],
  },

  {
    slug: 'nba-playoffs',
    title: 'NBA Playoffs',
    shortDescription: 'Sixteen teams, four rounds, every round a best-of-seven series.',
    type: 'format',
    difficulty: 'beginner',
    category: 'nba-explained',
    aliases: ['nba playoffs', 'playoffs', 'postseason', 'best of seven'],
    readMinutes: 4,
    order: 260,
    ruleSensitive: true,
    sourceRevision: NBA_REVISION,
    lastReviewedAt: '2026-08-26',
    sourceKeys: [{ key: 'wp-nba-playoffs' }],
    related: [
      { slug: 'nba-regular-season', type: 'requires_understanding' },
      { slug: 'nba-play-in-tournament', type: 'related_to' },
      { slug: 'nba-finals', type: 'part_of' },
      { slug: 'home-court-advantage', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'Eight teams from each conference play a knockout bracket of best-of-seven series, ending in the NBA Finals.',
      },
      {
        type: 'how_it_works',
        body: `Eight teams qualify from each conference: the top six directly, and two more through the **play-in tournament** contested by the teams seeded seventh to tenth.

The bracket is seeded 1 v 8, 2 v 7, 3 v 6 and 4 v 5 within each conference. Teams stay inside their own conference until the final, so an Eastern team cannot meet another Eastern team in the Finals.

Every round is a **best-of-seven** series: the first team to four wins advances. Games alternate between the two cities in a 2-2-1-1-1 pattern, with the higher seed hosting games one, two, five and seven.

Four rounds: conference first round, conference semi-finals, conference finals, then the **NBA Finals**.`,
      },
      {
        type: 'why_it_matters',
        body: `Best-of-seven is the defining feature, and it makes the NBA postseason very different from a knockout cup.

A single game can be decided by luck: a few shots falling, a poor night from a star, a bad call. Over seven games those effects largely wash out, which is why NBA playoff series rarely produce the upsets that March Madness generates almost every year.

It also turns each series into a tactical contest. Coaches adjust between games, exploit matchups repeatedly, and target a specific weak defender over the course of a week. A team can lose game one, change its approach, and win the series comfortably. That adjustment cycle is a large part of what people mean by "playoff basketball".`,
      },
      {
        type: 'common_misunderstandings',
        body: `**"The two best teams meet in the Finals."** Only if they are in different conferences. Two outstanding Western teams must eliminate each other before the final.

**"Home-court advantage means more home games."** It means four of the seven, and specifically the deciding seventh, if the series goes that far.`,
      },
    ],
  },

  {
    slug: 'nba-draft',
    title: 'NBA Draft Explained',
    shortDescription:
      'How new players enter the league, and why the worst teams do not simply pick first.',
    type: 'format',
    difficulty: 'beginner',
    category: 'nba-explained',
    aliases: ['nba draft', 'draft', 'draft night', 'first round pick'],
    readMinutes: 5,
    order: 270,
    ruleSensitive: true,
    sourceRevision: 'NBA CBA 2023',
    lastReviewedAt: '2026-08-26',
    sourceKeys: [{ key: 'wp-nba-draft' }, { key: 'nba-cba' }],
    related: [
      { slug: 'draft-lottery', type: 'part_of' },
      { slug: 'draft-pick', type: 'requires_understanding' },
      { slug: 'protected-pick', type: 'related_to' },
      { slug: 'nba-trades', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'An annual event where the thirty teams take turns selecting eligible new players, in an order weighted toward the weakest teams.',
      },
      {
        type: 'how_it_works',
        body: `The draft has **two rounds**, so sixty players in total are selected, one pick per team per round. A team that selects a player holds their exclusive negotiating rights: the player cannot simply sign elsewhere.

The order runs roughly in reverse of the previous season's standings, so weaker teams pick earlier. But the very top of the order is **not** simply given to the worst team. The first four selections are decided by the **draft lottery**, a weighted random draw among the teams that missed the playoffs.

The lottery exists to discourage **tanking**: deliberately losing games to secure a better pick. The weighting has been deliberately flattened over the years so that the three worst teams share identical odds at the top pick, which makes losing on purpose a much poorer strategy than it once was.

Picks are also **assets**. They can be traded years in advance, which is why teams discuss owning "a 2029 first-rounder" and why some franchises hold several picks in one draft while others hold none.`,
      },
      {
        type: 'why_it_matters',
        body: `The draft is the league's main mechanism for competitive balance. In a league without promotion or relegation, it is what stops the strongest teams simply accumulating the best young players indefinitely.

It is also the cheapest way to acquire talent. Players selected in the first round sign contracts on a fixed rookie scale, so a team that drafts well gets several years of production at a price far below what the same player would command in free agency. That gap is the single biggest advantage in NBA roster building, and it is why draft picks are guarded so carefully in trade negotiations.`,
      },
      {
        type: 'rule_differences',
        body: `A draft of this kind is a North American institution rather than a basketball one.

- **The WNBA** runs its own draft on similar principles, with a lottery among non-playoff teams.
- **European basketball has no draft at all.** Clubs develop players in their own academies from a young age and sign them directly, and the competitive-balance mechanism is promotion and relegation rather than redistributing talent.

This is a genuine structural difference between the two basketball worlds, not a detail. It is why a promising European teenager is typically already under contract to a professional club, while an American one of the same age is playing college basketball and waiting to be drafted.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**"The worst team picks first."** No. It has the best odds, currently tied with the second and third worst, but the top four selections are drawn.

**"Every drafted player joins the team."** Second-round picks are not guaranteed contracts, and many never play in the league. Teams also draft players who continue playing abroad for several years, keeping their rights meanwhile.`,
      },
    ],
  },

  {
    slug: 'nba-vs-fiba-rules',
    title: 'NBA Rules vs FIBA Rules',
    subtitle: 'The same sport, governed twice',
    shortDescription:
      'Every difference that matters between the NBA rulebook and the rules used by the rest of the world.',
    type: 'rule',
    difficulty: 'intermediate',
    category: 'international-basketball',
    aliases: ['nba vs fiba', 'fiba rules', 'international rules', 'nba fiba differences'],
    isFeatured: true,
    readMinutes: 6,
    order: 280,
    ruleSensitive: true,
    sourceRevision: `${FIBA_REVISION}; ${NBA_REVISION}`,
    lastReviewedAt: '2026-08-26',
    sourceKeys: [{ key: 'fiba-rules' }, { key: 'nba-rulebook' }],
    related: [
      { slug: 'fiba-basketball', type: 'requires_understanding' },
      { slug: 'game-clock', type: 'related_to' },
      { slug: 'three-point-line', type: 'related_to' },
      { slug: 'goaltending', type: 'related_to' },
      { slug: 'olympic-basketball', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'The NBA writes its own rulebook; everyone else plays under FIBA’s, and the differences are small individually but change how the game is played.',
      },
      {
        type: 'simple_explanation',
        body: `FIBA governs international basketball and its rules are used by the Olympics, the World Cup, EuroLeague and most domestic leagues worldwide. The NBA and WNBA write their own. The NCAA writes its own again.

None of these is a different sport. Five a side, ten-foot rim, one, two and three points, 24-second shot clock. But a player moving between them has genuine adjustments to make, and a viewer who learned one set of rules will notice things that look wrong in the other.`,
      },
      {
        type: 'rule_differences',
        body: `**Game length.** FIBA plays four 10-minute quarters, for 40 minutes. The NBA plays four 12-minute quarters, for 48. This is the largest single difference and it makes per-game statistics incomparable between the two.

**Three-point distance.** FIBA's arc is 6.75 m, and 6.60 m in the corners. The NBA's is 7.24 m at the top and 6.71 m in the corners. Some shots are worth three in Europe and two in the NBA.

**Court size.** FIBA 28 x 15 m; NBA 94 x 50 ft (28.65 x 15.24 m).

**Fouling out.** Five personal fouls in FIBA, six in the NBA. A physical defender is meaningfully more constrained internationally.

**Goaltending.** This is the difference that most surprises viewers. Under FIBA rules the ball may legally be played once it has hit the rim, so a defender can knock it away off the rim and an attacker can tip it in. The NBA prohibits touching the ball while it is on or directly above the rim in the cylinder. Plays that are perfectly legal at the Olympics are violations in the NBA.

**Defensive three seconds.** The NBA prohibits a defender from remaining in the paint for three seconds unless actively guarding an opponent. FIBA has no such rule, so international defences can sit a big man in the paint permanently.

**Timeouts.** In FIBA, only the coach may request a timeout and only during a dead ball. In the NBA, players may call them during live play, which is why NBA players trap opponents in the corner and why a player pinned along the sideline signals frantically to the bench.

**The bonus.** FIBA: the fifth team foul in a quarter puts the opponent in the bonus for the remainder of it. The NBA operates its own threshold and reset arrangement.`,
      },
      {
        type: 'why_it_matters',
        body: `The differences compound into a different-feeling game rather than a different sport.

FIBA basketball with no defensive three-second rule allows a centre to camp in the paint, which makes driving harder and rewards outside shooting and ball movement. The shorter three-point line makes the corner three less distinctly valuable than it is in the NBA. Shorter games and five fouls mean less time for a deficit to be overturned and less margin for a foul-prone defender.

This is why NBA players do not automatically dominate international tournaments, and why teams take preparation time before the Olympics. The adjustment is real, particularly on goaltending, where an instinct built over a career becomes a violation, or vice versa.`,
      },
      {
        type: 'key_takeaways',
        body: `- 40-minute games under FIBA, 48 in the NBA.
- FIBA's three-point arc is closer.
- Five fouls disqualify you internationally, six in the NBA.
- The ball is live off the rim under FIBA rules; not in the NBA.
- No defensive three-second rule internationally.
- Only coaches call timeouts under FIBA, and only during dead balls.`,
      },
    ],
  },

  {
    slug: 'double-dribble',
    title: 'Double Dribble',
    shortDescription:
      'Dribbling again after you have stopped, or using two hands: one of the simplest violations.',
    type: 'officiating',
    isStartHere: true,
    difficulty: 'beginner',
    category: 'fouls-and-violations',
    aliases: ['double dribble', 'double-dribble', 'illegal dribble'],
    readMinutes: 2,
    order: 70,
    ruleSensitive: true,
    sourceRevision: FIBA_REVISION,
    lastReviewedAt: '2026-08-26',
    sourceKeys: [{ key: 'fiba-rules' }],
    related: [
      { slug: 'traveling', type: 'related_to' },
      { slug: 'carrying', type: 'related_to' },
      { slug: 'possession', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'Starting a second dribble after you have already picked the ball up, or dribbling with both hands at once.',
      },
      {
        type: 'how_it_works',
        body: `A dribble ends when you catch the ball in one or both hands, or let it come to rest against your hand. Once it has ended, you have three legal options: shoot, pass, or pivot on one foot. Dribbling again is not among them.

There are two ways to commit it:

- **Restarting.** You dribble, stop and hold the ball, then begin dribbling again.
- **Two hands.** You touch the ball with both hands simultaneously during a dribble and then continue.

The penalty is the same as travelling: play stops, and the other team takes the ball from the sideline. No free throws.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**"He fumbled it, so that's a double dribble."** No. A fumble, where a player loses control accidentally rather than catching the ball deliberately, does not end the dribble. Recovering a fumble and dribbling on is legal.

**"The ball touched his other hand."** Momentary contact is not automatically a violation. What matters is whether the ball came to rest, which is why a hard crossover through both hands is legal and a slow one that pauses is not.

**"It's a double dribble if you dribble too high."** That is **carrying**, a different violation with the same penalty.`,
      },
      {
        type: 'rule_differences',
        body: `Prohibited in identical terms by the NBA, FIBA, the NCAA and the WNBA. This is one of the few rules with no meaningful variation between competitions: the definition of when a dribble ends is essentially the same everywhere.`,
      },
    ],
  },

  {
    slug: 'goaltending',
    title: 'Goaltending',
    shortDescription:
      'Interfering with a shot on its way down, and the rule that differs most between the NBA and FIBA.',
    type: 'officiating',
    difficulty: 'intermediate',
    category: 'fouls-and-violations',
    aliases: ['goaltending', 'goal tending', 'basket interference'],
    readMinutes: 4,
    order: 300,
    ruleSensitive: true,
    sourceRevision: `${FIBA_REVISION}; ${NBA_REVISION}`,
    lastReviewedAt: '2026-08-26',
    sourceKeys: [{ key: 'fiba-rules' }, { key: 'nba-rulebook' }],
    related: [
      { slug: 'basket-interference', type: 'related_to' },
      { slug: 'blocks', type: 'contrasts_with' },
      { slug: 'nba-vs-fiba-rules', type: 'related_to' },
      { slug: 'rim-protection', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'Touching a shot on its downward flight toward the basket, which awards the points as if the shot had gone in.',
      },
      {
        type: 'how_it_works',
        body: `A blocked shot is legal only while the ball is still going **up**, or at the peak of its arc. Once it has begun descending toward the rim with a chance to go in, it may not be touched by anybody.

If a **defender** touches it, the basket is awarded: two or three points, exactly as if the shot had been made. If an **attacker** touches it, the basket is cancelled and the defending team gets the ball.

The related violation is **basket interference**: touching the ball or the rim while the ball is in the cylinder directly above the hoop, or reaching up through the basket from below.

This is why a spectacular block that arrives a fraction late counts as two points against the defender rather than a highlight.`,
      },
      {
        type: 'rule_differences',
        body: `This is the single largest rules divergence between the NBA and the rest of the world, and the one that most often confuses viewers switching between them.

**Under FIBA rules, the ball is live once it has touched the rim.** A defender may knock it away after it hits the ring, and an attacker may tip it in. The play is entirely legal.

**Under NBA rules, that is basket interference.** The ball may not be touched while it is on the rim or in the cylinder above it.

The consequence is that identical plays are legal at the Olympics and violations in the NBA. Players moving between the two have to retrain an instinct built over years, and it is one of the adjustments most often cited by NBA players competing internationally.

The NCAA follows the NBA's approach on the rim, so American players are generally adapting toward FIBA rather than away from it.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**"He got all ball, so it can't be goaltending."** Goaltending has nothing to do with contact with the shooter. It is purely about when and where the ball was touched.

**"It hit the backboard first, so it's fair."** A shot that has hit the backboard and is on its way down toward the basket is still protected.`,
      },
    ],
  },

  {
    slug: 'rebounding',
    title: 'Rebounding Explained',
    shortDescription:
      'Who gets the ball after a miss, why it decides possessions, and what boxing out actually is.',
    type: 'standard',
    difficulty: 'beginner',
    category: 'rebounding',
    aliases: ['rebound', 'rebounding', 'boards', 'crashing the glass'],
    readMinutes: 4,
    order: 310,
    sourceKeys: [{ key: 'wp-basketball' }],
    related: [
      { slug: 'offensive-rebound', type: 'part_of' },
      { slug: 'defensive-rebound', type: 'part_of' },
      { slug: 'boxing-out', type: 'part_of' },
      { slug: 'possession', type: 'requires_understanding' },
      { slug: 'second-chance-points', type: 'measured_by' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'Gaining the ball after a missed shot, which either ends the opponent’s possession or gives your team a second one.',
      },
      {
        type: 'how_it_works',
        body: `Roughly half of all shots miss, so rebounding decides what happens on a large share of possessions.

There are two kinds, and they are worth very different things:

- **Defensive rebound.** The defending team collects the miss. This is the expected outcome, and it simply ends the possession. Around three quarters of misses are rebounded defensively.
- **Offensive rebound.** The attacking team collects its own miss. This is the valuable one: it creates an entirely extra possession that the defence thought it had earned.

The technique that decides most of them is **boxing out**: as the shot goes up, a defender turns to face the basket and puts their body between their opponent and the rim. Position matters more than height, which is why excellent rebounders are not always the tallest players.`,
      },
      {
        type: 'why_it_matters',
        body: `An offensive rebound is close to a turnover in reverse. The defence has done its job, contested the shot and forced a miss, and gets no reward for it. Shots taken immediately after an offensive rebound are also unusually efficient, because the defence is scrambling and nobody is matched up.

That is why **second-chance points** is tracked as its own category, and why teams that rebound their own misses well can sustain poor shooting nights.

There is a genuine strategic trade-off here. Sending players to chase offensive rebounds means fewer defenders back to stop a fast break. Many modern teams deliberately concede offensive rebounds in exchange for transition safety, which is a real choice rather than laziness.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**"Rebounding is about height."** Position and timing matter more. A well-boxed-out taller player cannot reach the ball at all.

**"A team rebound is somebody's rebound."** No. When a miss goes out of bounds or nobody gains individual control, it is credited to the team rather than a player, which is why team totals exceed the sum of individual ones.

**"More rebounds is always better."** Defensive rebound totals depend heavily on how often opponents miss and on whether teammates are also chasing. Rebound **percentage**, the share of available misses a player collects, is the fairer measure.`,
      },
    ],
  },

  {
    slug: 'three-point-percentage',
    title: 'Three-Point Percentage (3P%)',
    shortDescription: 'How often a player makes threes, and why 35% is better than it sounds.',
    type: 'statistic',
    difficulty: 'beginner',
    category: 'statistics',
    aliases: ['3p%', '3pt%', 'three point percentage', 'three-point shooting'],
    readMinutes: 3,
    order: 320,
    sourceKeys: [{ key: 'wp-box-score' }],
    related: [
      { slug: 'field-goal-percentage', type: 'contrasts_with' },
      { slug: 'effective-field-goal-percentage', type: 'related_to' },
      { slug: 'three-point-line', type: 'requires_understanding' },
      { slug: 'corner-three', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'The share of three-point attempts a player makes, where a figure in the mid-thirties is genuinely good.',
      },
      {
        type: 'how_it_is_calculated',
        body: `**3P% = three-pointers made ÷ three-pointers attempted**

A player who makes 3 of 8 shoots 37.5%. These attempts are also counted within total field goals, so they are not additional to FG% but a subset of it.`,
      },
      {
        type: 'how_to_interpret',
        body: `The benchmarks look low compared with two-point shooting, and that is the point:

- **40% and above:** excellent.
- **36–39%:** good, and around the level a professional team wants from its rotation shooters.
- **33–35%:** acceptable at volume.
- **Below 32%:** poor, and defences will start ignoring that player.

The reason a lower percentage is acceptable is arithmetic. A 35% three-point shooter produces 1.05 points per attempt; a 50% two-point shooter produces 1.00. The three-pointer is the better shot despite the worse-looking number, which is why comparing 3P% against FG% directly is a mistake.`,
      },
      {
        type: 'what_it_does_not_tell_you',
        body: `**Sample size is the main trap.** Three-point percentage is extremely noisy over short periods. A player can shoot 45% for a month and 30% for the next on identical shooting ability, and a single game's figure means almost nothing.

**Shot difficulty is invisible.** A player taking wide-open corner threes created by teammates should shoot a much higher percentage than one pulling up off the dribble with a defender closing out. The same 37% means different things in those two cases.

**Volume matters.** 40% on one attempt a game is far less valuable than 37% on nine, because the second player is forcing defences to guard him at all times.`,
      },
    ],
  },

  // ══ P1: offense ════════════════════════════════════════════════════════════
  {
    slug: 'pick-and-pop',
    title: 'Pick and Pop',
    shortDescription:
      'The screener steps out to shoot instead of rolling, and why it punishes drop coverage.',
    type: 'play',
    difficulty: 'intermediate',
    category: 'offense',
    aliases: ['pick and pop', 'screen and pop'],
    readMinutes: 3,
    order: 400,
    sourceKeys: [{ key: 'wp-pick-and-roll' }],
    related: [
      { slug: 'pick-and-roll', type: 'variation_of' },
      { slug: 'screen', type: 'requires_understanding' },
      { slug: 'stretch-four', type: 'related_to' },
      { slug: 'drop-coverage', type: 'contrasts_with' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'A pick and roll where the screener steps out for a jump shot rather than cutting to the basket.',
      },
      {
        type: 'the_action',
        body: `Everything begins identically to a pick and roll: the screener sets the pick and the ball handler drives off it. The difference is what happens next. Instead of rolling toward the rim, the screener steps back, usually behind the three-point line, and waits for a pass.

It requires one thing the ordinary pick and roll does not: a screener who can shoot. That is the whole reason the stretch four and stretch five became valuable positions.`,
      },
      {
        type: 'why_it_matters',
        body: `It exists to punish **drop coverage**. When the defending big man sags back to protect the rim, he is by definition not near the three-point line, and the screener popping out is left wide open.

This is the tactical bind at the centre of modern defence. Drop back and the pick and pop is open; step up and the roll to the basket is open. A screener who can genuinely do both makes the choice unanswerable, which is why those players are paid accordingly.`,
      },
      {
        type: 'how_it_is_defended',
        body: `- **Switch**, so the screener's defender stays attached to him.
- **Hedge**, stepping out to contest before recovering.
- **Have the big defender play higher** at the level of the screen, accepting the risk at the rim.
- **Simply concede it** if the screener is a poor shooter, which is why teams scout that number carefully.`,
      },
    ],
  },

  {
    slug: 'drive-and-kick',
    title: 'Drive and Kick',
    shortDescription:
      'Attack the rim, draw a second defender, and pass out to the shooter they left.',
    type: 'play',
    difficulty: 'intermediate',
    category: 'offense',
    aliases: ['drive and kick', 'kick out', 'penetrate and pitch'],
    readMinutes: 3,
    order: 410,
    sourceKeys: [{ key: 'wp-basketball' }],
    related: [
      { slug: 'spacing', type: 'requires_understanding' },
      { slug: 'help-defense', type: 'contrasts_with' },
      { slug: 'corner-three', type: 'related_to' },
      { slug: 'closeout', type: 'contrasts_with' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'A player drives toward the basket to force help, then passes out to the teammate that help left open.',
      },
      {
        type: 'the_action',
        body: `The driver attacks the rim with genuine intent, because the pass only works if the defence believes the drive. A help defender steps across to stop the layup. That defender came from somewhere, and whoever they were guarding is now free.

The pass out, the "kick", usually goes to the corner or the wing. Often it goes one further: the first shooter is closed out on and swings the ball again, so the defence is chasing the ball around the arc and arriving a step late each time. That second pass is where most open shots actually come from.`,
      },
      {
        type: 'why_it_matters',
        body: `This is the mechanism that converts spacing into points, and it is the most common way a modern team generates a three-pointer.

It also explains why non-shooters cost so much on offence. If the man in the corner cannot shoot, his defender never has to commit to him, so he is free to help on the drive, and the drive-and-kick has nowhere to go.`,
      },
      {
        type: 'how_it_is_defended',
        body: `- **Stay in front of the ball** so no help is needed at all. The cleanest answer, and the hardest.
- **Help from the least dangerous man**, usually a poor shooter or someone furthest from the ball.
- **Closeouts** that arrive under control, contesting the shot without conceding another drive.
- **Load to the strong side** and accept the long cross-court pass, gambling that the extra half-second lets the defence recover.`,
      },
    ],
  },

  {
    slug: 'post-up',
    title: 'Post-Up',
    shortDescription:
      'Receiving the ball with your back to the basket near the rim, and why it declined.',
    type: 'play',
    difficulty: 'beginner',
    category: 'offense',
    aliases: ['post up', 'posting up', 'back to the basket', 'low post play'],
    readMinutes: 3,
    order: 420,
    sourceKeys: [{ key: 'wp-basketball' }],
    related: [
      { slug: 'low-post', type: 'requires_understanding' },
      { slug: 'mismatch', type: 'related_to' },
      { slug: 'double-team', type: 'contrasts_with' },
      { slug: 'spacing', type: 'contrasts_with' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'An attacker establishes position near the basket with their back to it, receives the ball, and scores over their defender.',
      },
      {
        type: 'the_action',
        body: `The attacker works for position on the low block, using their body to hold the defender behind them. A teammate delivers an entry pass. From there they turn and shoot, back the defender down, or pass out if help arrives.

For decades this was how offences were built: get the ball to the biggest player near the rim and let him work. Most great centres of the twentieth century were post scorers first.`,
      },
      {
        type: 'why_it_matters',
        body: `The post-up declined sharply in the 2010s, for two reasons that are worth separating.

The first is **efficiency**. A contested post shot is worth two points and is not an easy two. Measured per possession it compares poorly with a three-pointer or a shot at the rim off a drive.

The second is **spacing**, and it matters more. A player posting up stands exactly where the offence now wants empty floor, and their defender is already positioned to help. The post-up does not merely produce a mediocre shot; it makes everyone else's shot worse.

It survives in specific situations: against a genuine mismatch, late in the shot clock, and as a way to slow a game down. It is a tool rather than a system now.`,
      },
      {
        type: 'how_it_is_defended',
        body: `- **Front the post**, standing between the passer and the attacker so the entry pass cannot arrive.
- **Double-team** on the catch, forcing the pass out.
- **Play behind** and simply contest, if the defender is big enough.
- **Push them off the block**, since a post-up three feet further out is a much worse shot.`,
      },
    ],
  },

  {
    slug: 'cutting',
    title: 'Cutting',
    shortDescription:
      'Moving without the ball to get open, and the actions that punish a ball-watching defence.',
    type: 'play',
    difficulty: 'intermediate',
    category: 'offense',
    aliases: ['cut', 'cutting', 'off-ball movement', 'backdoor'],
    readMinutes: 3,
    order: 430,
    sourceKeys: [{ key: 'wp-basketball' }],
    related: [
      { slug: 'backdoor-cut', type: 'variation_of' },
      { slug: 'give-and-go', type: 'used_in' },
      { slug: 'ball-movement', type: 'related_to' },
      { slug: 'help-defense', type: 'contrasts_with' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'A sharp move without the ball to get free, usually toward the basket.',
      },
      {
        type: 'the_action',
        body: `A cut works by exploiting where a defender is looking. The moment they turn their head to watch the ball, they lose track of their own assignment, and a cut behind them arrives before they can recover.

The common kinds:

- **Backdoor cut.** The defender overplays the passing lane, so the attacker cuts behind them toward the basket.
- **Give and go.** Pass, then immediately cut for the return.
- **Basket cut.** A straight cut through the middle when the defender loses sight of you.
- **Curl or flare** off a screen, choosing direction by how the defender chases.`,
      },
      {
        type: 'why_it_matters',
        body: `Cuts produce layups, which is the most efficient shot in basketball, and they cost nothing: no screen, no isolation, no dribble.

They are also the corrective to a purely perimeter-based offence. A team that only passes around the arc is comfortable to guard, because defenders can sit and watch the ball. Cutting punishes exactly that, which is why the best offences combine spacing with constant movement rather than choosing between them.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**"Cutting is for players who cannot shoot."** The opposite. A cut is most dangerous from a shooter, because their defender cannot sag off to guard the cut.

**"The cutter should always get the ball."** Most cuts do not receive a pass. They still work: a cut drags a defender out of position and opens space for somebody else, which is why coaches value them even when the ball never arrives.`,
      },
    ],
  },

  // ══ P1: defense ════════════════════════════════════════════════════════════
  {
    slug: 'drop-coverage',
    title: 'Drop Coverage',
    shortDescription:
      'The big man sags toward the rim on ball screens, conceding the pull-up to protect the basket.',
    type: 'tactical_concept',
    difficulty: 'advanced',
    category: 'defense',
    aliases: ['drop coverage', 'drop', 'deep drop'],
    readMinutes: 4,
    order: 440,
    sourceKeys: [{ key: 'wp-basketball' }],
    related: [
      { slug: 'pick-and-roll', type: 'contrasts_with' },
      { slug: 'switching', type: 'contrasts_with' },
      { slug: 'drop-vs-switch', type: 'part_of' },
      { slug: 'rim-protection', type: 'related_to' },
      { slug: 'pick-and-pop', type: 'contrasts_with' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'On a ball screen, the screener’s defender retreats toward the basket instead of stepping out, protecting the rim and conceding the jump shot.',
      },
      {
        type: 'how_it_works',
        body: `The on-ball defender fights over the screen and chases from behind. The big defender drops back into the paint, forming a wall in front of the rim. Between them they form a funnel: the ball handler is steered into a mid-range jump shot with a big man waiting below and a defender recovering behind.

The depth of the drop varies. A **deep drop** sits almost under the basket and concedes more shooting space; a **higher drop** meets the ball earlier and gives up more room behind.`,
      },
      {
        type: 'why_it_matters',
        body: `It is the simplest way to protect the rim without creating mismatches, and for a team whose centre cannot move on the perimeter it is often the only viable coverage.

The trade is explicit: you are choosing to give up the pull-up jump shot rather than the layup. Against most players that is a good trade, because a contested mid-range shot is one of the least efficient in basketball.

Against elite pull-up shooters it stops being a good trade, which is why teams that live in drop coverage are so often forced to abandon it in the playoffs, when opponents can attack the same weakness for seven straight games.`,
      },
      {
        type: 'counters',
        body: `- **The pull-up three**, taken directly over the dropping big man.
- **The pick and pop**, since the big is nowhere near the arc.
- **Rejecting the screen**, driving the other way where no help is waiting.
- **Snake dribbles**, weaving across the screen to pin the recovering defender behind.`,
      },
    ],
  },

  {
    slug: 'hedge',
    title: 'Hedge',
    shortDescription: 'The screener’s defender jumps out to slow the ball, then scrambles back.',
    type: 'tactical_concept',
    difficulty: 'advanced',
    category: 'defense',
    aliases: ['hedge', 'hedging', 'show', 'hard hedge'],
    readMinutes: 3,
    order: 450,
    sourceKeys: [{ key: 'wp-basketball' }],
    related: [
      { slug: 'pick-and-roll', type: 'contrasts_with' },
      { slug: 'drop-coverage', type: 'contrasts_with' },
      { slug: 'blitz', type: 'variation_of' },
      { slug: 'defensive-rotation', type: 'requires_understanding' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'The big defender steps out momentarily to block the ball handler’s path, then recovers to their own man.',
      },
      {
        type: 'how_it_works',
        body: `As the ball handler comes off the screen, the screener's defender jumps out to meet them, briefly showing on the ball. That forces the handler wide or backwards and buys time for the on-ball defender to fight over the screen and get back in front. The hedging defender then recovers to the roller.

It is the middle option between dropping and switching: more aggressive than drop, less permanent than a switch.`,
      },
      {
        type: 'why_it_matters',
        body: `A hedge disrupts the timing of the pick and roll without conceding a mismatch, which is what makes it attractive against a strong ball handler who would punish a drop.

The cost is that for a second or two the hedging defender is guarding nobody in particular, so the roller is momentarily free and the rest of the defence must rotate to cover them. It demands more communication than any other coverage, and a hedge that arrives late or recovers slowly is worse than no hedge at all.`,
      },
      {
        type: 'variations',
        body: `- **Soft hedge or show.** A brief appearance, prioritising the recovery.
- **Hard hedge.** Committing fully to stopping the ball, at greater risk behind.
- **Blitz or trap.** Going further still: two defenders commit and force the ball out of the handler's hands entirely.
- **Flat hedge.** Standing square at the level of the screen rather than stepping out beyond it.`,
      },
    ],
  },

  {
    slug: 'transition-defense',
    title: 'Transition Defense',
    shortDescription:
      'Getting back before the fast break arrives, and the order in which you cover things.',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'defense',
    aliases: ['transition defense', 'getting back', 'transition defence'],
    readMinutes: 3,
    order: 460,
    sourceKeys: [{ key: 'wp-basketball' }],
    related: [
      { slug: 'fast-break', type: 'contrasts_with' },
      { slug: 'rebounding', type: 'related_to' },
      { slug: 'turnovers', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'Stopping the opponent’s fast break by retreating quickly and covering the most dangerous things first.',
      },
      {
        type: 'how_it_works',
        body: `The priority order is fixed, and it is taught in this sequence for a reason:

1. **Stop the ball.** One defender slows the ball handler, even outnumbered. A break at full speed is far harder to defend than one that has been forced to slow down.
2. **Protect the rim.** A second defender retreats all the way to the basket.
3. **Match up.** Only once those are covered do defenders find shooters, starting with the corners.

The most common error is inverting this: three defenders running back to guard their own man while nobody stops the ball, which concedes an uncontested layup.`,
      },
      {
        type: 'why_it_matters',
        body: `Transition possessions are the most efficient in basketball, so preventing them is worth more than almost any individual defensive stop in the half court.

It is also the reason teams limit how many players chase offensive rebounds. Sending everyone to the glass and conceding breaks the other way is usually a losing trade, and deciding where that line sits is one of the standing choices in a team's identity.`,
      },
    ],
  },

  // ══ P1: statistics ═════════════════════════════════════════════════════════
  {
    slug: 'effective-field-goal-percentage',
    title: 'Effective Field Goal Percentage',
    shortDescription:
      'Field goal percentage corrected for the fact that a three is worth more than a two.',
    type: 'statistic',
    difficulty: 'advanced',
    category: 'statistics',
    aliases: ['efg', 'efg%', 'effective field goal percentage'],
    readMinutes: 3,
    order: 470,
    sourceKeys: [{ key: 'wp-box-score' }],
    related: [
      { slug: 'field-goal-percentage', type: 'contrasts_with' },
      { slug: 'true-shooting-percentage', type: 'related_to' },
      { slug: 'three-point-percentage', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'Shooting percentage that counts a made three-pointer as worth one and a half made two-pointers.',
      },
      {
        type: 'how_it_is_calculated',
        body: `**eFG% = (FGM + 0.5 × 3PM) ÷ FGA**

The 0.5 is not arbitrary. A three is worth 1.5 times a two, so crediting half an extra make per three-pointer puts both shot types on the same scale.`,
      },
      {
        type: 'example',
        body: `Two players each take **10 shots**:

- **Player A:** 5 made, all twos. eFG% = 5 ÷ 10 = **50%**. Ten points.
- **Player B:** 4 made, all threes. eFG% = (4 + 0.5 × 4) ÷ 10 = 6 ÷ 10 = **60%**. Twelve points.

Ordinary FG% would rank A above B at 50% to 40%, despite B having scored more from the same number of attempts. eFG% gets the ordering right.`,
      },
      {
        type: 'what_it_does_not_tell_you',
        body: `It ignores free throws entirely, which is the one thing **true shooting percentage** adds. A player who draws fouls constantly is undervalued by eFG%.

Use eFG% when you want to judge shooting from the floor specifically, and TS% when you want overall scoring efficiency.`,
      },
    ],
  },

  {
    slug: 'usage-rate',
    title: 'Usage Rate',
    shortDescription:
      'The share of a team’s possessions a player finishes, and why it must be read beside efficiency.',
    type: 'statistic',
    difficulty: 'advanced',
    category: 'statistics',
    aliases: ['usage', 'usg', 'usage rate', 'usage percentage'],
    readMinutes: 4,
    order: 480,
    sourceKeys: [{ key: 'wp-box-score' }],
    related: [
      { slug: 'true-shooting-percentage', type: 'related_to' },
      { slug: 'possessions', type: 'requires_understanding' },
      { slug: 'isolation', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'The percentage of their team’s possessions a player ends while on the floor, by shooting, drawing a shooting foul or turning it over.',
      },
      {
        type: 'what_it_measures',
        body: `How much of the offence runs through someone. A possession is "used" when a player takes a shot, gets to the line, or commits a turnover: in each case the possession ends with them.

Assists are pointedly **not** counted. A pass that leads to a basket ends the possession with the shooter, not the passer, which is why a pass-first point guard can have a modest usage rate while being central to everything the team does.`,
      },
      {
        type: 'how_to_interpret',
        body: `Five players share a hundred percent of possessions, so **20% is exactly average** by construction.

- **30%+:** a primary option carrying the offence.
- **20–25%:** a regular contributor.
- **Under 15%:** a specialist, usually a spot-up shooter or a defensive player.

The number is meaningless alone. It only becomes informative next to **true shooting percentage**, because the interesting question is not how much someone shoots but how well they shoot given how much. High usage with high efficiency is the rarest and most valuable combination in basketball; high usage with poor efficiency is actively harmful, because those possessions could have gone to someone better.`,
      },
      {
        type: 'what_it_does_not_tell_you',
        body: `It says nothing about **shot quality or creation**. A player who only finishes plays others created can post the same usage as one who generates everything himself.

It also ignores the effect of a player on teammates. A high-usage scorer who draws two defenders is creating open shots that show up in somebody else's statistics entirely.`,
      },
    ],
  },

  {
    slug: 'pace',
    title: 'Pace',
    shortDescription:
      'How many possessions a team uses per game, and why it distorts every per-game number.',
    type: 'statistic',
    difficulty: 'advanced',
    category: 'statistics',
    aliases: ['pace', 'pace factor', 'possessions per game', 'tempo'],
    readMinutes: 3,
    order: 490,
    sourceKeys: [{ key: 'wp-box-score' }],
    related: [
      { slug: 'possessions', type: 'requires_understanding' },
      { slug: 'offensive-rating', type: 'related_to' },
      { slug: 'shot-clock', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'The number of possessions a team uses in a game, which sets how many chances both sides get to score.',
      },
      {
        type: 'what_it_measures',
        body: `Speed of play, expressed as possessions rather than as a feeling. A team that pushes after every rebound and shoots early generates more possessions than one that walks the ball up and uses the full shot clock.

Because possessions alternate, pace is close to symmetrical: a fast team makes the game fast for both sides, which is why a slow team facing a fast one still ends up in a high-possession game.`,
      },
      {
        type: 'why_it_matters',
        body: `Pace is the reason raw per-game statistics mislead, and it is the correction that makes team comparison possible at all.

A team averaging 118 points a game at high pace may be scoring less efficiently than one averaging 108 at low pace. Similarly, a defence that concedes 120 is not necessarily bad: if the game had 105 possessions, that is a respectable rate.

This is exactly why **offensive rating** and **defensive rating** are expressed per 100 possessions. They remove pace entirely, so two teams playing completely different styles can be compared on the same axis.

Pace is a style rather than a virtue. Fast and slow teams have both won championships.`,
      },
    ],
  },

  {
    slug: 'offensive-rating',
    title: 'Offensive Rating',
    shortDescription: 'Points scored per 100 possessions: the honest way to measure an offence.',
    type: 'statistic',
    difficulty: 'advanced',
    category: 'statistics',
    aliases: ['offensive rating', 'ortg', 'off rtg', 'offensive efficiency'],
    readMinutes: 3,
    order: 500,
    sourceKeys: [{ key: 'wp-box-score' }],
    related: [
      { slug: 'defensive-rating', type: 'contrasts_with' },
      { slug: 'net-rating', type: 'part_of' },
      { slug: 'pace', type: 'requires_understanding' },
      { slug: 'points-per-possession', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'How many points a team scores per 100 possessions, which removes pace from the comparison.',
      },
      {
        type: 'how_it_is_calculated',
        body: `**ORtg = (points scored ÷ possessions) × 100**

A team scoring 115 points in 100 possessions has an offensive rating of 115. The same team scoring 115 in 90 possessions rates 127.8, which is a substantially better offence producing an identical scoreline.`,
      },
      {
        type: 'how_to_interpret',
        body: `In the modern NBA, roughly:

- **118+:** an excellent offence.
- **113–117:** above average.
- **Below 110:** poor.

These benchmarks drift upward over time as the sport becomes more efficient, so a rating that led the league two decades ago would be unremarkable now. Always compare against the league average of the same season rather than against a fixed number.`,
      },
      {
        type: 'what_it_does_not_tell_you',
        body: `Applied to an individual player it becomes far shakier. A player's offensive rating depends heavily on teammates: a limited player surrounded by excellent shooters will post a strong figure. Team offensive rating is a solid measure; individual offensive rating should be read with the same caution as raw plus-minus.`,
      },
    ],
  },

  {
    slug: 'defensive-rating',
    title: 'Defensive Rating',
    shortDescription:
      'Points conceded per 100 possessions, and the reason a high-scoring game is not a bad defence.',
    type: 'statistic',
    difficulty: 'advanced',
    category: 'statistics',
    aliases: ['defensive rating', 'drtg', 'def rtg', 'defensive efficiency'],
    readMinutes: 3,
    order: 510,
    sourceKeys: [{ key: 'wp-box-score' }],
    related: [
      { slug: 'offensive-rating', type: 'contrasts_with' },
      { slug: 'net-rating', type: 'part_of' },
      { slug: 'pace', type: 'requires_understanding' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'How many points a team concedes per 100 possessions, with lower being better.',
      },
      {
        type: 'how_it_is_calculated',
        body: `**DRtg = (points conceded ÷ possessions) × 100**

It is offensive rating from the other side, and the same benchmarks apply in reverse: under about 110 is strong in the modern NBA, and over 118 is poor.`,
      },
      {
        type: 'why_it_matters',
        body: `It corrects the single most common misreading of a scoreline. "They conceded 125" sounds like a defensive failure, but in a game of 108 possessions that is a rating of 116, which is unremarkable rather than bad.

Conversely a team conceding 98 in a game of 85 possessions has a rating of 115 and is not defending well at all; the game was simply slow.`,
      },
      {
        type: 'what_it_does_not_tell_you',
        body: `At individual level it is the weakest of the common metrics. Basketball's box score barely records defence, so an individual defensive rating leans heavily on team performance and credits players for their teammates' work. A poor defender on an excellent defensive team will look good.

Treat team defensive rating as reliable and individual defensive rating as a weak signal at best.`,
      },
    ],
  },

  {
    slug: 'net-rating',
    title: 'Net Rating',
    shortDescription:
      'Offensive rating minus defensive rating: the single number that best predicts a good team.',
    type: 'statistic',
    difficulty: 'advanced',
    category: 'statistics',
    aliases: ['net rating', 'netrtg', 'net efficiency', 'point differential per 100'],
    readMinutes: 3,
    order: 520,
    sourceKeys: [{ key: 'wp-box-score' }],
    related: [
      { slug: 'offensive-rating', type: 'part_of' },
      { slug: 'defensive-rating', type: 'part_of' },
      { slug: 'plus-minus', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'Points scored minus points conceded per 100 possessions, which is roughly how much better than the opponent a team is.',
      },
      {
        type: 'how_it_is_calculated',
        body: `**Net rating = offensive rating − defensive rating**

A team scoring 118 and conceding 110 per 100 possessions has a net rating of **+8**.`,
      },
      {
        type: 'how_to_interpret',
        body: `- **+8 or better:** championship-calibre.
- **+3 to +7:** a good playoff team.
- **Around 0:** average.
- **−5 or worse:** a poor team.

Net rating over a season predicts future results better than win-loss record does, because record is distorted by performance in close games, which is substantially luck. A team with a strong net rating and a mediocre record is usually the better bet going forward.`,
      },
      {
        type: 'what_it_does_not_tell_you',
        body: `**Garbage time** inflates and deflates it: minutes played with the result decided count the same as everything else.

Applied to a **lineup**, small samples make it extremely noisy. A five-man unit with a +30 net rating over 40 minutes has told you almost nothing.`,
      },
    ],
  },

  // ══ P1: NBA machinery ══════════════════════════════════════════════════════
  {
    slug: 'nba-trades',
    title: 'Trades Explained',
    shortDescription: 'How players change teams mid-season, and why salaries have to match.',
    type: 'format',
    difficulty: 'intermediate',
    category: 'nba-explained',
    aliases: ['trade', 'trades', 'nba trade', 'trading players'],
    readMinutes: 4,
    order: 530,
    ruleSensitive: true,
    sourceRevision: 'NBA CBA 2023',
    lastReviewedAt: '2026-08-26',
    sourceKeys: [{ key: 'nba-cba' }],
    related: [
      { slug: 'trade-deadline', type: 'related_to' },
      { slug: 'salary-cap', type: 'requires_understanding' },
      { slug: 'draft-pick', type: 'related_to' },
      { slug: 'sign-and-trade', type: 'variation_of' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'Teams exchange players and draft picks, subject to salary-matching rules that constrain what is legal.',
      },
      {
        type: 'how_it_works',
        body: `Two or more teams agree to swap players, draft picks, or both. The player has no say in most cases: a contract can be traded without consent, which is one of the sharpest differences between the NBA and football's transfer system.

The complication is **salary matching**. Because the league operates a salary cap, a team over the cap cannot simply absorb an expensive player. The salaries going out and coming in have to be within a defined range of each other.

This is why trades look strange from outside. A team wanting one expensive player often has to include two or three players purely to make the arithmetic work, and those players are traded not because anyone wants them moved but because their contracts are the right size.`,
      },
      {
        type: 'why_it_matters',
        body: `Draft picks function as the currency. A team acquiring a star typically sends multiple future first-round picks, which is why teams talk about their pick inventory years ahead.

Trades are also the main mechanism for rebuilding. A team out of contention trades its established players for picks and young players, deliberately getting worse now to be better later.`,
      },
      {
        type: 'rule_differences',
        body: `This is a North American structure and does not transfer to European basketball or football.

**European clubs use transfers with fees**: one club pays another money for a player, and buying a player for cash is normal. **The NBA prohibits trading players for meaningful amounts of cash**, which is precisely why salary-matched player-for-player swaps exist at all.

There is also no transfer window in the European sense. The NBA has a **trade deadline** partway through the season, after which no trades are permitted until the offseason.`,
      },
    ],
  },

  {
    slug: 'free-agency',
    title: 'Free Agency',
    shortDescription:
      'When a contract expires and a player can choose where to sign, with restrictions.',
    type: 'format',
    difficulty: 'intermediate',
    category: 'nba-explained',
    aliases: ['free agency', 'free agent', 'fa'],
    readMinutes: 4,
    order: 540,
    ruleSensitive: true,
    sourceRevision: 'NBA CBA 2023',
    lastReviewedAt: '2026-08-26',
    sourceKeys: [{ key: 'nba-cba' }],
    related: [
      { slug: 'restricted-free-agent', type: 'part_of' },
      { slug: 'unrestricted-free-agent', type: 'part_of' },
      { slug: 'salary-cap', type: 'requires_understanding' },
      { slug: 'bird-rights', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'A player whose contract has expired can negotiate with other teams, though their existing club may retain rights over the outcome.',
      },
      {
        type: 'how_it_works',
        body: `Free agency opens in the offseason. There are two kinds, and the distinction decides everything:

- **Unrestricted free agent.** Free to sign with any team. The former club has no special rights.
- **Restricted free agent.** May negotiate and sign an offer sheet with another team, but the original club can **match** it and keep the player on those terms. In practice this gives the incumbent club substantial control.

Whether a player is restricted depends chiefly on how long they have been in the league; players are typically restricted after their rookie contract and unrestricted later.

What a team can offer is limited by the salary cap, with **exceptions** that permit certain signings over it. The largest of these is **Bird rights**, which allow a club to exceed the cap to re-sign its own long-serving players. That exception exists specifically so that teams are not forced to lose players they developed.`,
      },
      {
        type: 'why_it_matters',
        body: `Free agency is where rosters change most dramatically, and its rules are deliberately tilted toward continuity. Bird rights and restricted free agency both make it easier for a club to keep its own players than for a rival to take them, which is a designed feature rather than an accident.

The corollary is that a team with cap space is unusual and powerful, and clearing cap space is itself a strategy pursued years in advance.`,
      },
    ],
  },

  {
    slug: 'salary-cap',
    title: 'Salary Cap',
    shortDescription:
      'A limit on what teams can spend, and the exceptions that make it a soft one.',
    type: 'format',
    difficulty: 'advanced',
    category: 'nba-explained',
    aliases: ['salary cap', 'cap', 'cap space', 'soft cap'],
    readMinutes: 5,
    order: 550,
    ruleSensitive: true,
    sourceRevision: 'NBA CBA 2023',
    lastReviewedAt: '2026-08-26',
    sourceKeys: [{ key: 'nba-cba' }],
    related: [
      { slug: 'luxury-tax', type: 'related_to' },
      { slug: 'bird-rights', type: 'part_of' },
      { slug: 'salary-aprons', type: 'related_to' },
      { slug: 'free-agency', type: 'used_in' },
      { slug: 'nba-trades', type: 'used_in' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'A league-wide limit on team payroll, with enough exceptions that teams routinely exceed it.',
      },
      {
        type: 'how_it_works',
        body: `The cap is set each year as a share of league revenue, so it moves with the league's income and every figure attached to it changes annually.

Crucially it is a **soft cap**: teams may exceed it through defined exceptions. The main ones are

- **Bird rights**, to re-sign your own long-serving players,
- the **mid-level exception**, a fixed amount available even to teams over the cap,
- **trade exceptions**, generated when a team trades a player away without taking equivalent salary back.

Because these exist, most teams are above the cap most of the time. Being under it is the exception rather than the rule, and "cap space" is a temporary asset teams work to create.

Above the cap sit further thresholds: the **luxury tax**, a financial penalty on high payrolls, and the **aprons**, which impose restrictions on what a team may do at all, not merely what it pays.`,
      },
      {
        type: 'why_it_matters',
        body: `The cap is the reason NBA roster construction looks the way it does. A team cannot simply buy the best available players, so it must find value: draft picks on rookie-scale contracts, players signed before they improved, and the exceptions.

The apron restrictions matter more than the tax bill for the strongest teams. Beyond certain thresholds a club loses access to particular exceptions and to some kinds of trade entirely, which is a harder constraint than money and is designed to stop the wealthiest owners simply spending their way to a permanent contender.

**No dollar figures appear on this page deliberately.** Every threshold moves each season under the collective bargaining agreement, and a number written into prose would be wrong within a year with nothing to signal it.`,
      },
      {
        type: 'rule_differences',
        body: `Salary caps of this kind are a North American construct.

**European basketball has no league-wide cap.** Clubs spend according to their own resources, as in European football, and competitive balance is handled by promotion and relegation rather than by redistributing money and talent.

**The WNBA operates its own cap** under its own agreement, with substantially lower thresholds.`,
      },
    ],
  },

  {
    slug: 'luxury-tax',
    title: 'Luxury Tax',
    shortDescription:
      'What teams pay for exceeding the threshold, and why it escalates so steeply.',
    type: 'format',
    difficulty: 'advanced',
    category: 'nba-explained',
    aliases: ['luxury tax', 'tax', 'taxpayer', 'repeater tax'],
    readMinutes: 3,
    order: 560,
    ruleSensitive: true,
    sourceRevision: 'NBA CBA 2023',
    lastReviewedAt: '2026-08-26',
    sourceKeys: [{ key: 'nba-cba' }],
    related: [
      { slug: 'salary-cap', type: 'requires_understanding' },
      { slug: 'salary-aprons', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'A financial penalty paid by teams whose payroll exceeds a threshold set above the salary cap.',
      },
      {
        type: 'how_it_works',
        body: `The tax threshold sits above the cap. A team below it pays nothing; a team above it pays a penalty on every dollar of the excess.

Two features make it bite harder than a flat charge would:

- **It escalates.** The rate increases in bands, so each additional increment of overspending costs proportionally more than the last.
- **The repeater rate.** A team that pays the tax in multiple seasons out of a rolling window pays at a higher rate than a first-time payer, which is aimed specifically at clubs treating the tax as a routine cost.

The money collected is distributed among non-taxpaying teams, so overspending funds rivals as well as costing the club directly.`,
      },
      {
        type: 'why_it_matters',
        body: `The tax turns roster decisions into financial ones. A club deep in the tax may find that a modest signing costs several times its salary once the penalty is applied, which is why contending teams often decline to add an obviously useful player.

It also creates the mid-season phenomenon of teams shedding salary to duck below the line before the calculation date, trading useful players purely to avoid the bill.`,
      },
    ],
  },

  {
    slug: 'bird-rights',
    title: 'Bird Rights',
    shortDescription: 'The exception that lets a team exceed the cap to keep its own players.',
    type: 'format',
    difficulty: 'advanced',
    category: 'nba-explained',
    aliases: ['bird rights', 'birds rights', 'larry bird exception', 'bird exception'],
    readMinutes: 3,
    order: 570,
    ruleSensitive: true,
    sourceRevision: 'NBA CBA 2023',
    lastReviewedAt: '2026-08-26',
    sourceKeys: [{ key: 'nba-cba' }],
    related: [
      { slug: 'salary-cap', type: 'part_of' },
      { slug: 'free-agency', type: 'used_in' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'A rule allowing a club to re-sign its own long-serving free agents even when doing so takes it over the salary cap.',
      },
      {
        type: 'how_it_works',
        body: `A player who has been with the same club for a qualifying period, generally three seasons without changing team as a free agent, gives that club "Bird rights" over him.

The club may then re-sign him using an exception to the cap, and may offer more years and larger annual raises than any rival operating with cap space can. Rights can also travel in a trade, which is part of why they are treated as an asset in negotiations.

The name comes from Larry Bird, whose Boston Celtics were the first team the provision applied to.`,
      },
      {
        type: 'why_it_matters',
        body: `Without it, a team that drafted and developed a player would be forced to lose him the moment his contract expired if it happened to be over the cap, which is most of the time. That would make developing players nearly pointless.

The practical effect is that a player's existing club can almost always offer him the largest contract available. When a star leaves anyway, they are usually taking less money to do so, which is why those departures are treated as significant events rather than routine transfers.`,
      },
    ],
  },

  // ══ P1: international, Europe, college, women's, 3x3 ═══════════════════════
  {
    slug: 'euroleague',
    title: 'EuroLeague',
    shortDescription: 'Europe’s premier club competition, and how it differs from the NBA.',
    type: 'format',
    difficulty: 'intermediate',
    category: 'international-basketball',
    aliases: ['euroleague', 'euro league', 'final four'],
    readMinutes: 4,
    order: 580,
    sourceKeys: [{ key: 'wp-euroleague' }],
    related: [
      { slug: 'how-european-basketball-works', type: 'part_of' },
      { slug: 'euroleague-vs-nba', type: 'related_to' },
      { slug: 'nba-vs-fiba-rules', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'The top-level club competition in European basketball, played alongside domestic leagues and decided at a single-weekend Final Four.',
      },
      {
        type: 'how_it_works',
        body: `Clubs play a long regular season in a single group where everyone meets everyone home and away. The leading teams advance to playoffs, and the survivors reach the **Final Four**: two semi-finals and a final, played over one weekend at a single neutral venue.

That format is the competition's signature. Unlike a best-of-seven series, a Final Four gives no second chance, so a single poor evening ends a season's work.

Most places are held by clubs on long-term licences rather than earned annually, which is a persistent source of tension with the federations and with clubs outside that group.`,
      },
      {
        type: 'why_it_matters',
        body: `EuroLeague clubs play it **at the same time as their domestic league**, not instead of it. A Real Madrid or Panathinaikos season involves two competitions running in parallel, which is why European fixture lists look so crowded next to an NBA schedule.

It is widely regarded as the strongest basketball played outside the NBA, and it operates under FIBA rules: 40-minute games, a closer three-point line, and no defensive three-second restriction.`,
      },
    ],
  },

  {
    slug: 'march-madness',
    title: 'March Madness',
    shortDescription:
      'The NCAA knockout tournament, and why single elimination produces so many upsets.',
    type: 'format',
    difficulty: 'beginner',
    category: 'international-basketball',
    aliases: ['march madness', 'ncaa tournament', 'the big dance', 'bracket'],
    readMinutes: 4,
    order: 590,
    sourceKeys: [{ key: 'wp-ncaa' }],
    related: [
      { slug: 'ncaa-basketball', type: 'part_of' },
      { slug: 'selection-sunday', type: 'requires_understanding' },
      { slug: 'final-four', type: 'part_of' },
      { slug: 'cinderella-team', type: 'related_to' },
      { slug: 'nba-playoffs', type: 'contrasts_with' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'A single-elimination tournament of 68 American college teams, played over three weeks each March.',
      },
      {
        type: 'how_it_works',
        body: `Teams qualify two ways: by winning their conference tournament, which guarantees a place, or by selection from the remaining field. The bracket is revealed on **Selection Sunday** and teams are **seeded** 1 to 16 within four regions.

Every game is single elimination. Lose once and the season is over. The rounds have their own names, which is a large part of the event's vocabulary: the Sweet Sixteen, the Elite Eight, and the **Final Four**.

Filling in a bracket predicting every result is a mass participation ritual, and getting one entirely correct is so improbable that it has never been verified.`,
      },
      {
        type: 'why_it_matters',
        body: `Single elimination is what makes it what it is. In a one-off game, a weaker team that shoots well for two hours can beat anybody, so **Cinderella** runs by low-seeded teams happen almost every year.

The contrast with the NBA playoffs is instructive and deliberate. A best-of-seven series is designed to let the better team win; a single-elimination tournament is designed to produce drama. That is why the NBA has far fewer upsets and March Madness is far more watched by people who follow no basketball otherwise.`,
      },
      {
        type: 'rule_differences',
        body: `NCAA men's basketball plays **two 20-minute halves** rather than four quarters, and uses a **30-second shot clock** rather than 24. The three-point line is closer than the NBA's.

The women's tournament runs in parallel with its own bracket and Final Four, and plays four 10-minute quarters.`,
      },
    ],
  },

  {
    slug: 'wnba',
    title: 'WNBA Explained',
    shortDescription:
      'The leading women’s professional league: season, structure and how it differs from the NBA.',
    type: 'format',
    difficulty: 'beginner',
    category: 'international-basketball',
    aliases: ['wnba', 'womens nba', "women's national basketball association"],
    readMinutes: 4,
    order: 600,
    ruleSensitive: true,
    sourceRevision: 'WNBA rules, 2025 season',
    lastReviewedAt: '2026-08-26',
    sourceKeys: [{ key: 'wp-wnba' }, { key: 'wnba-rules' }],
    related: [
      { slug: 'wnba-vs-nba', type: 'related_to' },
      { slug: 'nba-regular-season', type: 'contrasts_with' },
      { slug: 'olympic-basketball', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'The premier women’s professional basketball league, founded in 1996 and played through the North American summer.',
      },
      {
        type: 'how_it_works',
        body: `The league plays a regular season across the summer, considerably shorter than the NBA's 82 games, followed by playoffs and a Finals series.

The summer scheduling is significant rather than incidental. Because the WNBA season is short and does not clash with the European and Asian winter, many players compete in **two leagues in a single year**, playing overseas in the WNBA offseason. That has long been a normal career pattern rather than an exception.`,
      },
      {
        type: 'rule_differences',
        body: `The WNBA writes its own rules, close to the NBA's with specific differences:

- **Four 10-minute quarters**, so 40 minutes rather than 48.
- **Five personal fouls** to disqualify, as in FIBA, rather than six.
- A **shorter three-point line** than the NBA's.
- A **smaller ball**: size 6 rather than the size 7 used in men's basketball.

The 24-second shot clock is the same.`,
      },
      {
        type: 'why_it_matters',
        body: `The WNBA is the most prominent women's league in the world and the reference point for the professional women's game, but it is not the whole of it: strong leagues operate in Spain, France, Turkey, Australia and elsewhere, and the international game under FIBA has its own World Cup and Olympic tournament.

Treating the WNBA as the women's game in the way the NBA is often treated as basketball would make the same mistake twice over.`,
      },
    ],
  },

  {
    slug: 'olympic-basketball',
    title: 'Olympic Basketball',
    shortDescription: 'The tournament that made basketball global, and how qualification works.',
    type: 'format',
    difficulty: 'beginner',
    category: 'international-basketball',
    aliases: ['olympic basketball', 'olympics', 'olympic games basketball'],
    readMinutes: 4,
    order: 610,
    sourceKeys: [{ key: 'wp-olympics' }, { key: 'olympics-basketball' }],
    related: [
      { slug: 'fiba-basketball', type: 'requires_understanding' },
      { slug: 'fiba-world-cup', type: 'related_to' },
      { slug: 'nba-vs-fiba-rules', type: 'related_to' },
      { slug: 'three-by-three-basketball', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'The four-yearly national-team tournament, contested by men since 1936 and women since 1976, and open to professionals since 1992.',
      },
      {
        type: 'how_it_works',
        body: `Twelve national teams contest each tournament. Places come from the host nation, from the FIBA World Cup, and from qualifying tournaments run across the five FIBA zones, which is how a country with a strong side but a weak continental record can still reach the Games.

The format is group stage followed by knockout. Games are played under **FIBA rules**, not the NBA's, regardless of where the players' clubs are.

Since Tokyo 2020, **3x3 basketball** has been a separate Olympic event with its own medals, alongside the main tournament.`,
      },
      {
        type: 'why_it_matters',
        body: `The 1992 decision to admit professionals changed the sport's global trajectory. The United States team at Barcelona was watched by an audience that had never seen basketball played at that level, and the growth of the sport outside North America over the following two decades is usually traced to it.

Olympic basketball also remains the tournament by which national teams are measured, and the rare occasion when NBA players compete under FIBA rules, which is a genuine adjustment rather than a formality.`,
      },
    ],
  },

  {
    slug: 'fiba-world-cup',
    title: 'FIBA Basketball World Cup',
    shortDescription:
      'The sport’s world championship for national teams, and how it feeds the Olympics.',
    type: 'format',
    difficulty: 'beginner',
    category: 'international-basketball',
    aliases: ['fiba world cup', 'world cup', 'basketball world cup', 'world championship'],
    readMinutes: 3,
    order: 620,
    sourceKeys: [{ key: 'wp-world-cup' }],
    related: [
      { slug: 'fiba-basketball', type: 'requires_understanding' },
      { slug: 'olympic-basketball', type: 'related_to' },
      { slug: 'fiba-windows', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'FIBA’s world championship for national teams, held every four years, offset from the Olympics.',
      },
      {
        type: 'how_it_works',
        body: `Thirty-two national teams qualify through continental competition and contest a group stage followed by knockout rounds.

It is scheduled in the even years between Olympic Games, so the international calendar alternates between the two. Leading finishers also earn Olympic qualification, which gives the tournament consequences beyond its own title.

Qualifying is played in **FIBA windows**: short breaks in the calendar during which national teams assemble mid-season. Those windows are a recurring source of friction, because clubs are reluctant to release players and NBA clubs generally do not.`,
      },
      {
        type: 'why_it_matters',
        body: `It is the sport's world championship, and the tournament where a country's basketball programme, rather than its ability to assemble stars for a fortnight, is tested.

Its results are frequently surprising to those who follow only the NBA. Teams built from players in European leagues, with years of continuity together, regularly beat sides with more famous individuals, which is a reasonable illustration of what national-team basketball actually rewards.`,
      },
    ],
  },

  {
    slug: 'three-by-three-basketball',
    title: '3x3 Basketball Explained',
    shortDescription: 'Three a side on a half court: a separate Olympic sport with its own rules.',
    type: 'format',
    difficulty: 'beginner',
    category: 'international-basketball',
    aliases: ['3x3', '3 on 3', 'three by three', '3x3 basketball'],
    readMinutes: 4,
    order: 630,
    ruleSensitive: true,
    sourceRevision: FIBA_REVISION,
    lastReviewedAt: '2026-08-26',
    sourceKeys: [{ key: 'wp-3x3' }, { key: 'fiba-rules' }],
    related: [
      { slug: 'three-by-three-vs-five-on-five', type: 'contrasts_with' },
      { slug: 'olympic-basketball', type: 'related_to' },
      { slug: 'three-by-three-rules', type: 'part_of' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'Three players a side on a half court with one basket, played to 21 points or 10 minutes, and an Olympic sport since 2021.',
      },
      {
        type: 'how_it_works',
        body: `One basket, one half court, three players a side with one substitute.

The scoring is the first thing to unlearn: shots inside the arc are worth **one point** and shots outside it **two**. A game ends when a team reaches **21 points** or when 10 minutes expire, whichever comes first.

The **shot clock is 12 seconds**. Possession does not stop play for a throw-in in most situations; after a made basket the defending team simply takes the ball from under the hoop and play continues. There are no quarters and no lengthy stoppages.

The combined effect is a game with almost no dead time, which is exactly what it was designed for.`,
      },
      {
        type: 'why_it_matters',
        body: `3x3 is a **separate FIBA discipline**, not a casual variant of the main game. It has its own World Cup, its own professional circuit, its own world rankings, and since Tokyo its own Olympic medals.

Its significance is partly practical: it needs one hoop and six players, so it can be played and staged almost anywhere, and it has become FIBA's main route for growing the sport in countries without established leagues.`,
      },
      {
        type: 'rule_differences',
        body: `Against ordinary five-a-side basketball:

- **1 and 2 points** rather than 2 and 3.
- **12-second** shot clock rather than 24.
- Game to **21 points or 10 minutes**, rather than four timed quarters.
- **Half court**, one basket, no change of ends.
- Rosters of four, with three on court.`,
      },
    ],
  },
];
