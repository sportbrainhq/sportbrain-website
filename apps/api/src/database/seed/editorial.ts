/**
 * Starter editorial content.
 *
 * Written rather than generated, and deliberately small: a handful of genuinely
 * useful explainers per sport beats fifty stubs. This is the layer that is
 * actually ours, so it is worth writing properly.
 *
 * Every sport also gets an `overview`, which is what fills the Overview tab and
 * `sport.summary`. Those two are the same text: the tab shows it in full and the
 * summary is used for metadata and cards.
 */

export interface ExplainerSeed {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  body: string;
  displayOrder: number;
}

export const SPORT_OVERVIEWS: Record<string, string> = {
  football:
    'Association football is played by more people, in more countries, than any other sport. Two teams of eleven contest a single ball across ninety minutes, and the low scoring is the point: a match can turn on one moment, which is why the statistics that describe it have to be read carefully.',
  cricket:
    'Cricket is three sports sharing a name. A Test match lasts five days and can still be drawn; a Twenty20 is over in three hours. The same player carries three separate records, and comparing them directly is the most common mistake in reading the sport.',
  basketball:
    'Basketball is the highest-scoring of the major team sports, which changes how it is measured. Totals matter less than rates: points per game, shooting percentages and efficiency describe a player better than a career sum, because possessions are plentiful and pace varies.',
  tennis:
    'Tennis is an individual sport with no league table and no fixtures in the usual sense. A player is judged by titles, by majors, and by weeks spent at number one, and surface matters enough that clay and grass records are kept apart.',
  'formula-1':
    'Formula One awards two championships from the same races: one for drivers, one for constructors. A driver in a quick car and a quick car with an ordinary driver produce similar results, which is why the sport is read through qualifying pace as much as race wins.',
  golf: 'Golf is scored against par rather than against an opponent, and every stroke counts the same whether it travels three hundred yards or two feet. There is no standard course, so a winning total means little on its own: the same score can be dominant one week and miss the cut the next.',
  mma: 'Mixed martial arts combines striking, wrestling and grappling into a single fight, and it settled that question by testing single-discipline fighters against each other and watching them lose. UFC is its largest promotion, not the sport itself, and a fighter judged only on knockouts or only on submissions is being read by half a game.',
};

export const EXPLAINERS: Record<string, ExplainerSeed[]> = {
  football: [
    {
      slug: 'offside-explained',
      title: 'Offside, explained properly',
      excerpt: 'The rule that decides more goals than any other, and why it is so hard to judge.',
      category: 'Rules',
      displayOrder: 10,
      body: `A player is offside if, at the moment the ball is played to them, they are nearer the opponent's goal line than both the ball and the second-last opponent, and they are in the opponent's half.

Three details do most of the work:

**The moment matters, not the arrival.** Position is judged when the ball is played, not when it is received. A player can be level at the pass and several metres clear by the time it reaches them, and that is onside.

**Being offside is not an offence.** It becomes one only when the player interferes with play, interferes with an opponent, or gains an advantage from the position. Standing in an offside position and doing nothing is legal.

**The second-last opponent is usually, but not always, a defender.** It is whoever is second-last, which occasionally means a goalkeeper who has come forward.

The rule exists to stop players waiting by the goal. Everything difficult about it follows from the fact that the decision is made on a single frame of a moving game.`,
    },
    {
      slug: 'reading-expected-goals',
      title: 'What expected goals actually measures',
      excerpt:
        'xG is widely quoted and widely misread. It is a description of chances, not of luck.',
      category: 'Concepts',
      displayOrder: 20,
      body: `Expected goals assigns every shot a probability of being scored, based on how similar shots have historically fared: distance, angle, body part, and what came before it.

A team with 2.4 xG created chances that a league-average finisher would convert about 2.4 times. If they scored one, they underperformed on the day.

**What it is good for.** Over a season, xG predicts future goals better than past goals do. A team scoring far above its xG is usually not sustaining it.

**What it is not.** It is not a verdict on a single match. Football's low scoring means a match is a tiny sample, and a 0.3 xG chance going in is not a fluke, it is a 0.3 xG chance going in about three times in ten.

The most common misuse is treating xG as what *should* have happened. It describes the chances created. The result is what happened.`,
    },
    {
      slug: 'football-positions',
      title: 'Positions, and why the labels keep changing',
      excerpt: 'Formations describe starting positions, not where players spend the game.',
      category: 'Tactics',
      displayOrder: 30,
      body: `A formation is a shorthand for where players begin. It says far less about a modern team than it used to.

**The numbers read from the back.** A 4-3-3 is four defenders, three midfielders, three forwards, with the goalkeeper unstated.

**Roles have split.** "Full-back" once meant a defender who stayed wide and deep. It now covers players who spend much of the match in central midfield, and the label survives mainly out of habit.

**Shape changes with possession.** The same team may defend in a 4-4-2 and attack in something closer to a 3-2-5. A single formation given in a team sheet describes one of those and not the other.

This is why position data in a database is a weak signal. It records what a player is listed as, not what they do.`,
    },
  ],

  cricket: [
    {
      slug: 'three-formats',
      title: 'Test, ODI and T20: three sports, one name',
      excerpt: 'Why a batting average of 50 means something different in each format.',
      category: 'Formats',
      displayOrder: 10,
      body: `Cricket is played in three formats whose statistics are not comparable, and treating them as one record is the single most common error in reading the sport.

**Test cricket** lasts up to five days, with two innings each. There is no limit on deliveries, so batting can be slow and a draw is a legitimate result. An average above 50 marks a very good Test batter.

**One Day Internationals** give each side fifty overs. Scoring must be faster, but there is time to build, so an innings can start slowly.

**Twenty20** gives twenty overs. Almost every ball is an attempt to score, and strike rate matters more than average, because a player who scores 30 from 15 balls has done more than one who scores 40 from 45.

A player's Test average and T20 average describe different skills. This is why they are stored separately here and never summed.`,
    },
    {
      slug: 'batting-average-vs-strike-rate',
      title: 'Average and strike rate, and when each matters',
      excerpt: 'Two numbers that answer different questions about the same innings.',
      category: 'Concepts',
      displayOrder: 20,
      body: `**Batting average** is runs divided by the number of times out. It answers: how many runs does this player produce before losing their wicket?

**Strike rate** is runs per hundred balls. It answers: how quickly?

In Test cricket, where deliveries are effectively unlimited, average dominates. In Twenty20, where balls are the scarce resource, strike rate dominates.

One subtlety worth knowing: a not-out innings does not count as a dismissal, so a player who is frequently unbeaten at the end will have an inflated average. That is not cheating, it is what the number measures.

A career average is computed from career totals, never by averaging seasonal averages. Those are different numbers, and only the first is correct.`,
    },
  ],

  basketball: [
    {
      slug: 'per-game-versus-totals',
      title: 'Why basketball is read per game',
      excerpt: 'Career totals reward longevity. Rates describe the player.',
      category: 'Concepts',
      displayOrder: 10,
      body: `Basketball statistics are conventionally given per game rather than as totals, and the reason is structural.

A season is eighty-two games with roughly a hundred possessions each. Volume is plentiful, so a career total mostly measures how long somebody played. A player with twenty average seasons will out-total a player with eight brilliant ones.

**Points per game** is the headline, but it is affected by minutes and by team pace. A player on a fast team gets more possessions and therefore more chances to score.

**Shooting percentages** are harder to distort. Field goal percentage and three point percentage describe efficiency directly, and are the first place to look when a scoring average seems out of step with a team's results.`,
    },
  ],

  tennis: [
    {
      slug: 'surfaces-matter',
      title: 'Why tennis keeps separate records by surface',
      excerpt: 'Clay, grass and hard courts reward different players, so records are kept apart.',
      category: 'Concepts',
      displayOrder: 10,
      body: `Tennis is played on surfaces that change the game enough to change who wins.

**Clay** is slow and the bounce is high. Rallies are longer, serving is less decisive, and defensive players do better.

**Grass** is fast and the bounce is low and unpredictable. Points are shorter and a strong serve is worth more.

**Hard courts** sit between the two and host most of the tour.

The difference is large enough that a player can be dominant on one surface and ordinary on another, which is why match records are kept per surface rather than combined into one figure that describes no particular kind of tennis.`,
    },
  ],

  'formula-1': [
    {
      slug: 'two-championships',
      title: 'Drivers and constructors: two titles, one race',
      excerpt:
        'Every Grand Prix awards points twice, and the two championships answer different questions.',
      category: 'Formats',
      displayOrder: 10,
      body: `Formula One runs two championships simultaneously from the same races.

**The drivers' championship** counts points scored by each driver individually.

**The constructors' championship** counts the points of both of a team's cars added together.

They can diverge sharply. A team with two consistent drivers can win the constructors' title while neither wins the drivers'.

The split matters when reading a driver's record. A driver in the fastest car will accumulate wins that say as much about the car as about them, which is why qualifying pace against a team-mate, who has the same machinery, is often the more revealing comparison.`,
    },
  ],
};
