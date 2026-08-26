import { CRICKET_BASICS_AND_LAWS } from './cricket-basics-and-laws';
import { CRICKET_BATTING } from './cricket-batting';
import { CRICKET_BOWLING } from './cricket-bowling';
import { CRICKET_CONDITIONS } from './cricket-conditions';
import { CRICKET_DISMISSALS } from './cricket-dismissals';
import { CRICKET_EQUIPMENT_AND_TERMS } from './cricket-equipment-and-terms';
import { CRICKET_FIELDING } from './cricket-fielding';
import { CRICKET_FIELD_POSITION_EXPLAINERS } from './cricket-field-position-explainers';
import { CRICKET_FORMATS_AND_STRUCTURE } from './cricket-formats-and-structure';
import { fieldSetting, fullFieldSetting } from './cricket-field-positions';
import { CRICKET_SPIN } from './cricket-spin';
import { CRICKET_STATISTICS } from './cricket-statistics';
import { CRICKET_TACTICS } from './cricket-tactics';
import { ICC_PC, MCC_CODE, REVIEWED } from './cricket-review-metadata';
import type { ExplainerSeed, ScoreBreakdown, SourceSeed } from './explainer-types';

/**
 * Written cricket explainers.
 *
 * These override the taxonomy placeholders in `cricket-explainer-taxonomy.ts` by
 * slug and are the only cricket rows that reach the site.
 *
 * ## On sourcing
 *
 * Cricket has two rule authorities and they are not the same thing. The MCC
 * writes the Laws of Cricket, which govern the game everywhere. The ICC writes
 * playing conditions, which apply to international cricket and change more
 * often; individual competitions write their own on top of those. A powerplay,
 * a free hit, the number of DRS reviews and the availability of DRS itself are
 * playing conditions, not Laws, and an explainer that presents them as Laws is
 * wrong in a way a reader cannot detect.
 *
 * Everything rule-dependent therefore carries `ruleSensitive`, the edition it
 * was written against, and the date it was last checked, so the set to re-read
 * after a revision is a query rather than a memory.
 *
 * Where a numeric threshold is quoted (a follow-on lead, an umpire's-call
 * percentage) the source is named in the text. Where a mechanism is contested or
 * incompletely understood, the text says so: reverse swing and the effect of
 * cloud cover on swing are both areas where the confident popular explanation
 * runs ahead of the evidence, and passing that on as settled fact would be the
 * easiest mistake in this whole category to make.
 */

export const CRICKET_EXPLAINER_SOURCES: SourceSeed[] = [
  {
    key: 'mcc-laws',
    provider: 'mcc',
    title: 'MCC, The Laws of Cricket (2017 Code, 4th edition 2022)',
    url: 'https://www.lords.org/mcc/the-laws-of-cricket',
    license: 'MCC',
  },
  {
    key: 'icc-playing-conditions',
    provider: 'icc',
    title: 'ICC, Standard Playing Conditions',
    url: 'https://www.icc-cricket.com/about/cricket/rules-and-regulations/playing-conditions',
    license: 'ICC',
  },
  {
    key: 'wp-lbw',
    provider: 'wikipedia',
    title: 'Leg before wicket',
    url: 'https://en.wikipedia.org/wiki/Leg_before_wicket',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-no-ball',
    provider: 'wikipedia',
    title: 'No ball',
    url: 'https://en.wikipedia.org/wiki/No_ball',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-over',
    provider: 'wikipedia',
    title: 'Over (cricket)',
    url: 'https://en.wikipedia.org/wiki/Over_(cricket)',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-drs',
    provider: 'wikipedia',
    title: 'Umpire Decision Review System',
    url: 'https://en.wikipedia.org/wiki/Umpire_Decision_Review_System',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-dls',
    provider: 'wikipedia',
    title: 'Duckworth–Lewis–Stern method',
    url: 'https://en.wikipedia.org/wiki/Duckworth%E2%80%93Lewis%E2%80%93Stern_method',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-follow-on',
    provider: 'wikipedia',
    title: 'Follow-on',
    url: 'https://en.wikipedia.org/wiki/Follow-on',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-reverse-swing',
    provider: 'wikipedia',
    title: 'Swing bowling',
    url: 'https://en.wikipedia.org/wiki/Swing_bowling',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-googly',
    provider: 'wikipedia',
    title: 'Googly',
    url: 'https://en.wikipedia.org/wiki/Googly',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-powerplay',
    provider: 'wikipedia',
    title: 'Powerplay (cricket)',
    url: 'https://en.wikipedia.org/wiki/Powerplay_(cricket)',
    license: 'CC BY-SA 4.0',
  },
];

/**
 * Worked scorelines for the beginner scoring explainer.
 *
 * Each component is a labelled part rather than a substring the prose describes
 * by position, so the renderer can put the explanation next to the number it
 * belongs to. Every over figure is a string: `47.2` is not a decimal, and the
 * quickest way to end up computing `47.2 - 40 = 7.2` is to store it as one.
 */
const TEAM_SCORE: ScoreBreakdown = {
  display: 'IND 287/6 (47.2)',
  kind: 'team',
  parts: [
    { value: 'IND', label: 'Team', explanation: 'The batting side.' },
    { value: '287', label: 'Runs', explanation: 'Runs scored in this innings so far.' },
    {
      value: '6',
      label: 'Wickets lost',
      explanation:
        'Six batters are out. Four wickets remain, because the last batter cannot bat alone.',
    },
    {
      value: '47.2',
      label: 'Overs bowled',
      explanation:
        '47 completed overs plus 2 legal balls of the 48th. It is not 47.2 in decimal: the digit after the point counts balls out of six, so the next ball makes it 47.3 and four more make it 48.',
    },
  ],
};

const BATTER_SCORE: ScoreBreakdown = {
  display: '75 (62)',
  kind: 'batter',
  parts: [
    { value: '75', label: 'Runs', explanation: 'Runs this batter has scored.' },
    {
      value: '62',
      label: 'Balls faced',
      explanation:
        'Legal deliveries faced. A strike rate of 75 ÷ 62 × 100 ≈ 121 runs per 100 balls.',
    },
  ],
};

const BOWLER_SCORE: ScoreBreakdown = {
  display: '8.2-0-47-3',
  kind: 'bowler',
  parts: [
    {
      value: '8.2',
      label: 'Overs bowled',
      explanation: '8 completed overs and 2 balls of the ninth.',
    },
    {
      value: '0',
      label: 'Maidens',
      explanation: 'Overs in which no run was conceded off the bat or as a wide or no-ball.',
    },
    {
      value: '47',
      label: 'Runs conceded',
      explanation:
        'Runs charged to this bowler. Byes and leg byes are not: they count to the team but not against the bowler.',
    },
    { value: '3', label: 'Wickets', explanation: 'Wickets credited to this bowler.' },
  ],
};

/**
 * The written entries.
 *
 * Order within the array does not matter; `order` and category membership drive
 * presentation. Slugs must match the taxonomy exactly, since these override by
 * slug and a mismatch would silently create a second concept.
 */
const CRICKET_FEATURE_EXPLAINERS: ExplainerSeed[] = [
  // ── Match basics ──────────────────────────────────────────────────────────
  {
    slug: 'how-a-cricket-match-works',
    title: 'How a Cricket Match Works',
    type: 'standard',
    difficulty: 'beginner',
    category: 'match-basics',
    shortDescription:
      'The whole game in one page: two teams, two innings roles, and the exchange between a bowler and a batter that everything else is built on.',
    readMinutes: 6,
    order: 10,
    isStartHere: true,
    isFeatured: true,
    aliases: ['Cricket Rules for Beginners', 'How Cricket Works'],
    related: [
      { slug: 'over', type: 'requires_understanding' },
      { slug: 'innings', type: 'requires_understanding' },
      { slug: 'batting-vs-bowling', type: 'related_to' },
      { slug: 'how-runs-are-scored', type: 'requires_understanding' },
      { slug: 'wickets-and-dismissals', type: 'requires_understanding' },
      { slug: 'how-to-read-a-cricket-score', type: 'related_to' },
      { slug: 'test-vs-odi-vs-t20', type: 'related_to' },
    ],
    sourceKeys: [{ key: 'mcc-laws', locator: 'Laws 1, 12, 13, 17' }],
    sections: [
      {
        type: 'one_sentence',
        body: 'One team bats and tries to score runs while the other bowls and fields and tries to get them out, then they swap, and whoever has more runs at the end wins.',
      },
      {
        type: 'simple_explanation',
        body: `Two teams of eleven. At any moment one side is **batting** and the other is **bowling and fielding**.

In the middle of the ground is a strip of hard, flat earth called the **pitch**, with three wooden **stumps** at each end. Two batters are on the field at once, one at each end. Only one of them faces the bowling: that batter is the **striker**.

A bowler from the fielding side runs in and bowls the ball at the striker's stumps. The striker tries to hit it and run, or simply to stop it hitting the stumps. The fielding side tries to hit the stumps, catch the ball, or otherwise get the batter **out**.

When a batter is out, the next one in the order replaces them. When ten of the eleven are out, that team's turn with the bat ends: the last batter has nobody to bat with. A turn with the bat is called an **innings**.

Whichever side scores more runs across their innings wins.`,
      },
      {
        type: 'how_it_works',
        body: `Four things repeat, at four different scales.

**A delivery.** One ball bowled at the striker. The smallest unit of the game.

**An over.** Six legal deliveries from one bowler, from one end of the pitch. After it, a different bowler bowls the next over from the other end, so the bowling swaps ends every over and the striker changes accordingly. No bowler may bowl two overs in a row.

**An innings.** One team batting until ten wickets fall, until the allotted overs run out, or until their captain chooses to stop.

**A match.** One or two innings each, depending on format. Test cricket gives each side two innings across up to five days. A one-day international gives each side one innings of fifty overs. A Twenty20 gives each side twenty overs.

The **toss** decides who bats first: the captains toss a coin before play and the winner chooses. On a green, damp morning that choice can matter more than any single player.`,
      },
      {
        type: 'example',
        body: `A T20 match. Team A wins the toss and bats.

They face twenty overs, which is 120 legal deliveries, and finish on 178 for 6: 178 runs, six batters out, four wickets to spare.

Team B now bats knowing exactly what they need: 179 to win, from their own twenty overs. That number is their **target**, and every ball from here has a simple arithmetic behind it. If they are on 100 for 3 after twelve overs, they need 79 from eight overs, which is just under ten an over.

They finish on 174 for 8. Team A wins by four runs.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**"Both teams bat at the same time."** No. The sides alternate, and one full turn with the bat is one innings.

**"A match always finishes with a winner."** Not in cricket. A multi-day match can be **drawn** if neither side gets the other out in time, which is a genuine result and not the same thing as a **tie**. A tie means the scores finished level. A draw means the match ran out of time.

**"The best batters bat first."** The order is a tactical choice, and it changes by format and situation. Openers face the newest ball and the fastest bowling; a finisher is picked to score quickly at the end.

**"Ten wickets means eleven players out."** The eleventh batter is left stranded without a partner, so an innings ends when ten are dismissed.`,
      },
      {
        type: 'format_differences',
        body: `- **Test cricket:** up to five days, two innings each, no limit on overs. A draw is possible and often fought for.
- **ODI:** one innings each of fifty overs, one day.
- **T20:** one innings each of twenty overs, about three hours.

The Laws are the same in all three. What changes is the number of overs, the number of innings, and therefore what counts as a good score, a good economy rate or a sensible risk.`,
      },
      {
        type: 'key_takeaways',
        body: `- One side bats, one side bowls and fields; then they swap.
- Six legal balls make an over, and the bowling changes ends after each one.
- Ten wickets, or the overs running out, ends an innings.
- More runs wins. In multi-day cricket, running out of time can mean a draw.`,
      },
    ],
  },

  {
    slug: 'how-to-read-a-cricket-score',
    title: 'How to Read a Cricket Score',
    type: 'standard',
    difficulty: 'beginner',
    category: 'scoring-and-scorecards',
    alsoIn: ['match-basics'],
    shortDescription:
      'What 287/6 (47.2) means, why 47.2 is not a decimal, and how to read a batting line and a bowling analysis.',
    readMinutes: 7,
    order: 10,
    isStartHere: true,
    isFeatured: true,
    aliases: ['Cricket Score Explained', 'Reading a Scorecard', '287/6'],
    related: [
      { slug: 'how-a-cricket-match-works', type: 'requires_understanding' },
      { slug: 'overs-notation', type: 'part_of' },
      { slug: 'run-rate', type: 'related_to' },
      { slug: 'required-run-rate', type: 'related_to' },
      { slug: 'strike-rate', type: 'related_to' },
      { slug: 'economy-rate', type: 'related_to' },
      { slug: 'extras', type: 'related_to' },
      { slug: 'maiden-over', type: 'related_to' },
    ],
    sourceKeys: [
      { key: 'mcc-laws', locator: 'Laws 17, 18, 23' },
      { key: 'wp-over', locator: 'Over (cricket)' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'A cricket score packs the state of an innings into a handful of numbers: runs, wickets lost, and how much of the innings has been used.',
      },
      {
        type: 'reading_the_score',
        heading: 'The team score',
        body: `Read it as three separate facts, not one number.`,
        structuredData: TEAM_SCORE,
      },
      {
        type: 'how_it_works',
        body: `**287** is runs. **6** is wickets lost, so ten minus six leaves four to fall.

Australian scoreboards and commentary reverse the first two: **6/287** means the same thing, six wickets down for 287. If the smaller number comes first, it is wickets.

**(47.2)** is the part that catches everyone out, and it is worth being exact about.

Over notation is **completed overs, then balls into the current over**. So 47.2 means 47 whole overs plus two legal deliveries. The digit after the point runs 1 to 5 and then rolls over: 47.5, then the next legal ball makes 48.0, written simply as 48.

That means over figures are **not decimals** and cannot be treated as such:

- 47.2 overs is 47 + 2/6 overs, which is about 47.33 in decimal, not 47.2.
- 47.2 + 0.4 is not 47.6. Four more balls takes you to 48.
- To count balls, do 47 × 6 + 2 = 284.

Wides and no-balls are re-bowled and do not advance the count, so an over that concedes three wides takes nine deliveries but still shows as one over.`,
      },
      {
        type: 'reading_a_batting_line',
        heading: 'A batting line',
        body: `On a scorecard each batter shows runs and, in brackets, balls faced. Fours and sixes often follow.`,
        structuredData: BATTER_SCORE,
      },
      {
        type: 'reading_a_bowling_analysis',
        heading: 'A bowling analysis',
        body: `Four figures, always in this order: overs, maidens, runs, wickets.`,
        structuredData: BOWLER_SCORE,
      },
      {
        type: 'example',
        body: `A chase. The scoreboard reads:

**ENG 212/4 (38.3) — need 61 from 69 balls**

Unpack it. England have 212 runs and have lost four wickets. They have used 38 overs and three balls, so 231 balls, of a 50-over innings of 300 balls: 69 remain, which is what the second line says.

Their run rate is 212 ÷ (231 ÷ 6) ≈ 5.51 an over. They need 61 more, which is 61 ÷ (69 ÷ 6) ≈ 5.30 an over. The required rate is below the current rate and six wickets remain, so they are ahead.

Notice that both calculations converted overs to **balls** first. That is the only safe way to do run-rate arithmetic, because the alternative treats 38.3 as thirty-eight and a half overs and quietly gets the wrong answer.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**"47.2 overs is 47 and a fifth."** No: the fraction is out of six, so it is 47 and a third.

**"You can average over figures directly."** Adding 8.2 and 3.5 does not give 11.7; it gives 12.1, because five plus two balls is seven, which is one over and one ball.

**"A bowler's runs conceded is every run scored while they bowled."** Byes and leg byes count to the batting team but not against the bowler. Wides and no-balls do count against them.

**"6/287 is a collapse."** Not if the scoreboard is Australian. Read the smaller number as wickets.`,
      },
      {
        type: 'key_takeaways',
        body: `- Runs first, wickets second, in most of the world; reversed in Australia.
- The number in brackets is overs used, in completed-overs-and-balls notation.
- Convert overs to balls before doing any arithmetic with them.
- A bowling analysis is overs, maidens, runs, wickets.`,
      },
    ],
  },

  {
    slug: 'over',
    title: 'Over',
    type: 'definition',
    difficulty: 'beginner',
    category: 'match-basics',
    alsoIn: ['laws-and-rules', 'match-structure'],
    shortDescription:
      'Six legal deliveries from one end, and the unit that structures everything from bowling changes to run rates.',
    readMinutes: 4,
    order: 20,
    isStartHere: true,
    ruleSensitive: true,
    sourceRevision: MCC_CODE,
    lastReviewedAt: REVIEWED,
    related: [
      { slug: 'delivery', type: 'part_of' },
      { slug: 'no-ball', type: 'related_to' },
      { slug: 'wide', type: 'related_to' },
      { slug: 'maiden-over', type: 'related_to' },
      { slug: 'overs-notation', type: 'related_to' },
      { slug: 'bowling-spell', type: 'related_to' },
      { slug: 'powerplay', type: 'used_in' },
    ],
    sourceKeys: [
      { key: 'mcc-laws', locator: 'Law 17 (The over)' },
      { key: 'wp-over', locator: 'Over (cricket)' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'A set of six legal deliveries bowled by one bowler from one end of the pitch.',
      },
      {
        type: 'the_law',
        body: `Under **Law 17** the ball is bowled from each end alternately in overs of six balls. The umpire calls "over" when six legal deliveries have been completed and any run from the last of them is finished.

Two consequences follow directly from the Law, and both are things a new viewer notices before anyone explains them:

- **The bowling changes ends every over.** The fielders walk across; the batter who was at the far end is now the striker without having run anywhere.
- **No bowler may bowl two overs in succession.** So a captain needs at least two bowlers in rotation, and in practice four or five.`,
      },
      {
        type: 'how_it_works',
        body: `Only **legal** deliveries count towards the six. A **no-ball** or a **wide** is scored as a run to the batting side and then re-bowled, so an over containing two wides takes eight balls to complete.

That is why an over can be expensive in a way the count does not show, and why the scorebook records balls bowled separately from balls that counted.

An over in which no run is conceded off the bat, and no wide or no-ball, is a **maiden over**. Byes and leg byes do not spoil a maiden, because they are not charged to the bowler.`,
      },
      {
        type: 'why_it_matters',
        body: `The over is the clock cricket runs on. Almost every rate in the sport is per over rather than per ball or per minute: run rate, required run rate, economy rate. Fielding restrictions in limited-overs cricket are defined in overs. A bowler's workload is measured in overs, and in limited-overs formats it is capped in overs.

It is also the unit of tactical rhythm. A captain thinks in overs: two more from this bowler, then the spinner, then hold one back for the end.`,
      },
      {
        type: 'historical_context',
        body: `Six has not always been the number. Overs of four, five and eight balls have all been used in first-class cricket at various times and places; eight-ball overs were used in Australia as recently as the 1970s. The six-ball over has been standard in the Laws since the 1980 Code.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**"An over is always six balls bowled."** Six *legal* balls. Wides and no-balls are extra.

**"47.2 overs is a decimal."** It is 47 overs and 2 balls. The fraction is out of six.

**"A bowler bowls until they are taken off."** They bowl one over, then somebody else bowls from the other end. A **spell** is several overs bowled in a row from the same bowler in alternation with a partner, which is different from one continuous stint.`,
      },
      {
        type: 'key_takeaways',
        body: `- Six legal deliveries from one end make an over.
- Wides and no-balls are re-bowled and do not count towards the six.
- The bowling changes ends after every over, and no bowler bowls consecutive overs.
- Almost every rate in cricket is expressed per over.`,
      },
    ],
  },

  {
    slug: 'lbw',
    title: 'LBW',
    subtitle: 'Leg before wicket',
    type: 'dismissal',
    difficulty: 'beginner',
    category: 'dismissals',
    alsoIn: ['laws-and-rules'],
    shortDescription:
      'Out because the ball would have hit the stumps and the batter’s body stopped it. The conditions are precise, and each one is a place a decision can turn.',
    readMinutes: 8,
    order: 30,
    isStartHere: true,
    isFeatured: true,
    ruleSensitive: true,
    sourceRevision: `${MCC_CODE}; DRS detail from ${ICC_PC}`,
    lastReviewedAt: REVIEWED,
    aliases: ['Leg Before Wicket', 'Leg-before', 'Plumb'],
    related: [
      { slug: 'drs', type: 'related_to' },
      { slug: 'umpires-call', type: 'related_to' },
      { slug: 'wicket', type: 'requires_understanding' },
      { slug: 'no-ball', type: 'requires_understanding' },
      { slug: 'appeals', type: 'requires_understanding' },
      { slug: 'leg-spin', type: 'used_in' },
      { slug: 'seam-bowling', type: 'used_in' },
    ],
    sourceKeys: [
      { key: 'mcc-laws', locator: 'Law 36 (Leg before wicket)' },
      { key: 'wp-lbw', locator: 'Leg before wicket' },
      { key: 'icc-playing-conditions', locator: 'DRS protocols' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'The striker is out if a legal delivery, having not touched the bat first, hits their body in front of the stumps and would have gone on to hit the wicket.',
      },
      {
        type: 'simple_explanation',
        body: `Without LBW, batting would be easy in the worst way: stand in front of the stumps, let the ball hit your legs, and you can never be bowled.

So the Law says that if the ball would have hit the stumps and your body got in the way instead, you are out. That is the whole idea. Everything else is the fine print that stops the idea being unfair to the batter.

The fine print exists because the umpire is being asked to judge something that did not happen, which is where the ball **would** have gone. So the Law limits the judgement to situations where it is reasonable to make it.`,
      },
      {
        type: 'decision_sequence',
        heading: 'The decision, one question at a time',
        body: `This is the order an umpire works in, and the order a television replay presents. Any "no" ends it: not out.

**1. Was it a legal delivery?** If the bowler bowled a no-ball, no LBW is possible, regardless of everything that followed.

**2. Where did the ball pitch?** It must pitch in line with the stumps or on the **off side** of them. A ball pitching outside **leg stump** can never be out LBW, however plainly it would have hit. Balls that do not pitch at all before reaching the batter, full tosses, satisfy this condition.

**3. Did it hit the bat first?** If the ball touched the bat, or the glove holding the bat, before the body, it cannot be LBW. An inside edge onto the pad is not out.

**4. Where was the impact?** If the impact is **in line** with the stumps, the appeal stays alive. If the impact is **outside the line of off stump**, it can only be out if the batter **made no genuine attempt to play a stroke**. Offer a shot and get hit outside off, and you are safe.

**5. Would it have hit the wicket?** The umpire must be satisfied that it would have gone on to hit the stumps. Height matters as much as line: a ball bouncing over the stumps is not out even if the line was perfect.

Conditions 2 to 5 come from Law 36. There is also a prior requirement that applies to every dismissal except a few: the fielding side has to **appeal**. An umpire does not give a batter out LBW unbidden.`,
      },
      {
        type: 'edge_cases',
        heading: 'Impact outside off, and shot offered',
        body: `This is the clause that produces the most arguments, and it is worth stating carefully.

- Ball pitches in line or outside off, **impact in line** with the stumps, would have hit: **out**, whether or not a shot was played.
- Ball pitches in line or outside off, **impact outside the line of off stump**, batter **played a shot**: **not out**.
- Same, but batter **offered no shot**: **out**, if it would have hit.

The asymmetry is deliberate. A batter who plays at the ball and is beaten has done what the game asks; a batter who thrusts a pad at it to use their body as a second bat has not.

Judging "no genuine attempt to play a stroke" is a judgement about intent, which is why it stays with the on-field umpire rather than being resolved by technology.`,
      },
      {
        type: 'edge_cases',
        heading: 'Pitching outside leg',
        body: `A ball that pitches outside leg stump cannot be LBW. Full stop, regardless of impact, regardless of shot, regardless of how certainly it was going to hit.

This is why a left-arm spinner bowling to a right-hander from wide of the crease, or a leg-spinner drifting the ball down the leg side, gets fewer LBW decisions than the ball's path might suggest: the pitching point rules the appeal out before anything else is considered.

It is also why round-the-wicket angles are a real tactical choice and not just a change of scenery.`,
      },
      {
        type: 'reviews_and_technology',
        heading: 'DRS and umpire’s call',
        body: `Where the **Decision Review System** is in use, LBW is the decision it changes most.

Ball-tracking presents the same three checkpoints the Law does: **pitching**, **impact**, **wickets**. Two of them carry a margin known as **umpire's call**.

Under ICC playing conditions, if less than half the ball is in line with the stumps at impact, or less than half the ball is projected to be hitting the stumps, the checkpoint returns **umpire's call**: the on-field decision stands, and the reviewing side keeps its review. Pitching is not subject to umpire's call; the ball either pitched in the permitted area or it did not.

Two things worth being clear about:

- DRS is a **playing condition**, not a Law. It is used in international cricket and many major competitions, and it is absent from most cricket played anywhere in the world. Umpire's-call thresholds have been revised more than once and can differ between competitions.
- Ball tracking is a **projection**, not a recording. It models where the ball would have gone. The umpire's-call margin exists precisely because that projection has uncertainty in it.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**"It hit him on the pad in front, that's out."** Only if it also pitched legally, was not edged, and would have hit the stumps. Height and pitching point both rule out plenty of confident-looking appeals.

**"It hit him outside the line, so it can't be out."** It can, if he offered no shot.

**"Leg before wicket means it has to hit the leg."** Any part of the person, glove not holding the bat included. The name is historical.

**"The ball hit the bat and then the pad, so umpire's call applies."** No: bat first ends the appeal entirely.

**"DRS decides LBWs now."** DRS reviews decisions where it exists. In most cricket, and for the intent question in all cricket, the on-field umpire decides.`,
      },
      {
        type: 'format_differences',
        body: `The Law is identical in every format. What differs is the **review** environment: three unsuccessful player reviews per innings in Tests and two in ODIs and T20Is under current ICC playing conditions, and in most domestic and recreational cricket, none at all.`,
      },
      {
        type: 'key_takeaways',
        body: `- Five conditions: legal delivery, pitched in line or off, no bat first, impact judged, would have hit.
- Pitching outside leg is never out.
- Impact outside off is out only if no shot was offered.
- Umpire's call is a DRS margin under playing conditions, not part of the Law.`,
      },
    ],
  },

  {
    slug: 'no-ball',
    title: 'No-ball',
    type: 'rule',
    difficulty: 'beginner',
    category: 'laws-and-rules',
    alsoIn: ['scoring-and-scorecards'],
    shortDescription:
      'An illegal delivery. It costs a run, has to be bowled again, and rules out most ways of getting the batter out.',
    readMinutes: 6,
    order: 20,
    isStartHere: false,
    ruleSensitive: true,
    sourceRevision: `${MCC_CODE}; free hit and technology from ${ICC_PC}`,
    lastReviewedAt: REVIEWED,
    aliases: ['No ball', 'Noball'],
    related: [
      { slug: 'legal-delivery', type: 'contrasts_with' },
      { slug: 'free-hit', type: 'related_to' },
      { slug: 'wide', type: 'contrasts_with' },
      { slug: 'extras', type: 'related_to' },
      { slug: 'beamer', type: 'related_to' },
      { slug: 'bouncer', type: 'related_to' },
      { slug: 'no-ball-technology', type: 'related_to' },
      { slug: 'lbw', type: 'related_to' },
    ],
    sourceKeys: [
      { key: 'mcc-laws', locator: 'Law 21 (No ball)' },
      { key: 'wp-no-ball', locator: 'No ball' },
      { key: 'icc-playing-conditions', locator: 'Free hit; front-foot technology' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'A delivery that breaks one of the Laws governing how the ball may be bowled: the batting side gets a run, the ball is bowled again, and almost nothing can get the batter out from it.',
      },
      {
        type: 'the_law',
        body: `**Law 21** sets out when the umpire calls no-ball. The main grounds, in the order a viewer meets them:

- **Front foot.** Some part of the front foot, raised or grounded, must be behind the popping crease at the moment it lands. Overstep, and it is a no-ball, even if the foot slides back afterwards.
- **Back foot.** The back foot must land within and not touching the return crease.
- **The delivery arm.** The ball must be **bowled**, not thrown. Straightening the elbow beyond the permitted tolerance during the delivery swing is an illegal action, and the umpire calls no-ball.
- **Bouncing more than once,** or the ball coming to rest before reaching the striker.
- **A high full toss.** A delivery that passes or would have passed the striker above waist height without bouncing, judged from where they were standing upright at the crease. Informally, a **beamer**.
- **Underarm bowling,** unless agreed before the match.
- **Breaking the non-striker's wicket** during the act of delivery.
- **Changing the arm or the side of the wicket** without telling the umpire, who tells the batter.

Separately, **Law 41** deals with dangerous and unfair bowling, which is where repeated short-pitched bowling at the batter is dealt with, and **Laws 27 and 28** cover fielding offences that also produce a no-ball, including the wicketkeeper moving in front of the stumps before the ball reaches the batter and a fielder encroaching on the pitch.`,
      },
      {
        type: 'how_it_works',
        body: `Three things follow from a no-ball call.

**One run to the batting side,** recorded as an extra and charged to the bowler.

**The ball does not count** towards the over, so it is re-bowled.

**Most dismissals are off.** From a no-ball the striker cannot be bowled, LBW, caught, stumped or hit wicket. They can still be **run out**, and can be out **obstructing the field** or for **hitting the ball twice**. That is why a wicket falling amid a no-ball call is always followed by a check.

Anything the batter scores off a no-ball counts to them as normal, on top of the penalty run.`,
      },
      {
        type: 'edge_cases',
        heading: 'Free hit, and what varies by competition',
        body: `A **free hit** is not in the Laws. It is a playing condition, used in limited-overs cricket under ICC playing conditions and in most T20 competitions: after a no-ball, the next delivery is a free hit, from which the striker cannot be dismissed by most methods even if the delivery is legal.

Which no-balls trigger a free hit, and in which formats, has changed over time and can differ between competitions. Anything written about free hits therefore belongs to a competition and a season, not to cricket in general.

**Front-foot technology** is the other place practice runs ahead of the Laws. In many international matches the third umpire checks every delivery's front foot on replay and informs the on-field umpire, which catches no-balls that used to go unnoticed unless a wicket fell. That is a playing condition too, and it is not present in most cricket.`,
      },
      {
        type: 'when_you_will_see_it',
        body: `Most often at the death of a limited-overs innings, when bowlers are stretching for pace and yorker length and the front foot creeps forward. Also from a bowler returning from injury, and from spinners far less often than from quick bowlers.

A no-ball in the last over of a tight chase is one of the most expensive events in the sport: a run, a re-bowled ball, and in most white-ball competitions a free hit as well.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**"The whole foot has to be behind the line."** Some part of the front foot behind the popping crease is enough. Heel down behind the line with the toes over is legal.

**"A no-ball means nobody can be out."** A run out is still on, and so are obstructing the field and hitting the ball twice.

**"Waist-high full tosses are a matter of taste."** They are a no-ball under Law 21, judged at the striker's standing position.

**"Every no-ball gives a free hit."** Free hits are a playing condition. They do not exist in Test cricket and are not universal in domestic competitions.`,
      },
      {
        type: 'key_takeaways',
        body: `- A no-ball is an illegal delivery: one run, re-bowled, most dismissals ruled out.
- Front-foot, back-foot, action, double bounce, high full toss and underarm are the common grounds.
- Run out remains possible.
- Free hits and front-foot replay checks are playing conditions, not Laws.`,
      },
    ],
  },

  {
    slug: 'test-vs-odi-vs-t20',
    title: 'Test vs ODI vs T20',
    type: 'standard',
    difficulty: 'beginner',
    category: 'formats',
    shortDescription:
      'The three international formats side by side, and why the same statistic means different things in each.',
    readMinutes: 6,
    order: 10,
    isStartHere: true,
    isFeatured: true,
    aliases: ['Cricket Formats', 'Formats Compared'],
    related: [
      { slug: 'test-cricket', type: 'part_of' },
      { slug: 'odi', type: 'part_of' },
      { slug: 't20i', type: 'part_of' },
      { slug: 'first-class-cricket', type: 'contrasts_with' },
      { slug: 'list-a-cricket', type: 'contrasts_with' },
      { slug: 'draw', type: 'related_to' },
      { slug: 'powerplay', type: 'related_to' },
      { slug: 'strike-rate', type: 'related_to' },
    ],
    sourceKeys: [
      { key: 'icc-playing-conditions', locator: 'Test, ODI and T20I playing conditions' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'Three formats with the same Laws and completely different economics: five days and unlimited overs, one day and fifty overs, or an evening and twenty.',
      },
      {
        type: 'simple_explanation',
        body: `The Laws of Cricket do not change between formats. What changes is how much time and how many deliveries each side gets, and that changes everything downstream: what a good score is, what a good economy rate is, which risks are worth taking, and how a captain uses their bowlers.

A useful way to hold it: in Test cricket the scarce resource is **wickets**, and deliveries are effectively unlimited. In T20 the scarce resource is **deliveries**, and wickets are comparatively cheap. An ODI sits between the two and is the format where the balance shifts most within a single innings.`,
      },
      {
        type: 'duration_and_structure',
        body: `**Test cricket.** Up to five days, two innings per side, no limit on overs. A minimum number of overs per day applies under playing conditions. Played with a red ball, or a pink one under lights.

**ODI (One Day International).** One innings each, fifty overs, one day. White ball, fielding restrictions in phases, two new balls per innings under current ICC playing conditions.

**T20I (Twenty20 International).** One innings each, twenty overs, roughly three hours. White ball, a short powerplay, and bowlers limited to four overs each.`,
      },
      {
        type: 'result_types',
        body: `This is where the formats differ most sharply, and it is the difference newcomers most often miss.

**Test cricket** can be **won**, **lost**, **drawn** or **tied**. A draw means time ran out with the match unresolved, and it is a legitimate result that both sides sometimes play for deliberately. A tie means the scores finished level with the match complete, which has happened twice in Test history. They are not the same thing.

**ODIs and T20Is** cannot be drawn. They can be **tied**, and in knockout matches a tie is usually resolved by a **Super Over**. If weather prevents a result, the match is a **no result**, which is again distinct from a draw.`,
      },
      {
        type: 'format_differences',
        heading: 'What the same numbers mean',
        body: `- **Batting average.** A Test average above 50 marks a very good batter. In T20 the average is a weaker signal, because a batter who is not out at the end of a short innings distorts it and because scoring quickly matters more than surviving.
- **Strike rate.** Near-decisive in T20, informative in ODIs, secondary in Tests where a batter may bat for a day at 45 per 100 balls and win the match by doing so.
- **Economy rate.** Around 3 an over is excellent in a Test; around 4.5 to 5 is excellent in an ODI; under 7 is often excellent in a T20. Comparing them across formats is meaningless without saying which format.
- **Bowling average versus strike rate.** In Tests a bowler needs to take twenty wickets in a match, so strike rate matters. In T20 containment can be worth more than wickets.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**"Test cricket and first-class cricket are the same thing."** No. Test matches are a subset of first-class cricket: the international ones, between teams with Test status. A county or state match is first-class but not a Test.

**"ODI and List A are the same thing."** No. ODIs are the international subset of List A cricket, which also includes domestic one-day competitions.

**"T20I covers all T20 cricket."** No. A T20I is between two international teams. Franchise and domestic T20 matches are T20s but not T20Is, and their playing conditions frequently differ.

**"A draw is a tie by another name."** A tie is level scores. A draw is an unfinished match. Only one of them exists in limited-overs cricket.`,
      },
      {
        type: 'key_takeaways',
        body: `- Same Laws, different quantities of overs, innings and time.
- Draws exist only in multi-innings, time-limited cricket; ties exist everywhere.
- Test, ODI and T20I are the international subsets of first-class, List A and T20 cricket respectively.
- Every batting and bowling statistic needs its format attached to mean anything.`,
      },
    ],
  },

  // ── Batting ───────────────────────────────────────────────────────────────
  {
    slug: 'cover-drive',
    title: 'Cover Drive',
    type: 'batting_technique',
    difficulty: 'beginner',
    category: 'batting',
    shortDescription:
      'A front-foot drive through the off side, played to a fuller ball outside off, and one of the shots batting technique is judged by.',
    readMinutes: 5,
    order: 40,
    related: [
      { slug: 'drive', type: 'variation_of' },
      { slug: 'straight-drive', type: 'related_to' },
      { slug: 'square-drive', type: 'related_to' },
      { slug: 'forward-defence', type: 'related_to' },
      { slug: 'cover', type: 'related_to' },
      { slug: 'extra-cover', type: 'related_to' },
      { slug: 'outswinger', type: 'contrasts_with' },
      { slug: 'footwork', type: 'requires_understanding' },
    ],
    sourceKeys: [{ key: 'mcc-laws', locator: 'Law 5 (The bat)' }],
    sections: [
      {
        type: 'one_sentence',
        body: 'A front-foot attacking shot that sends a fuller-length ball outside off stump through the gap between cover and extra cover.',
      },
      {
        type: 'simple_explanation',
        body: `The cover drive is what most people picture when they picture batting: front foot forward, bat swinging down and through, ball racing away square of the wicket on the off side.

It is played to a ball that is **full enough to reach forward to** and **wide enough of the stumps to hit through the off side** without having to work across the line. When those two things are true it is among the lowest-risk attacking shots in cricket. When they are not, it is among the highest.`,
      },
      {
        type: 'footwork_and_bat_path',
        body: `Described as coaching convention rather than as biomechanical law: players score heavily with variations of all of this, and what follows is the shape most coaching starts from.

**The ball.** Pitched up, on or just outside off stump. Not so full that it is a half-volley to be driven straight, not so short that the ball is rising.

**The stride.** Front foot moves towards the pitch of the ball, not just down the pitch: the aim is to get the head close to the line, so the eyes are over the ball rather than reaching at it.

**The head.** Still, and leading. Most cover-drive faults are described by coaches as the head falling away to the leg side, which pulls the hands away from the body.

**The bat path.** Down and through, close to the front pad, with the face of the bat presented towards cover as contact is made. Contact is under the eyes rather than out in front.

**The finish.** High hands, weight forward. A checked follow-through usually means the ball was not as full as the shot assumed.`,
      },
      {
        type: 'scoring_area',
        body: `Between **cover** and **extra cover**, square to just forward of square on the off side. A finer contact runs down towards **point**; a straighter one towards **mid-off**.

A captain who has been driven through cover twice will usually respond by moving cover squarer or pushing a fielder to **deep cover**, which is the visible sign that the shot is working.`,
        structuredData: fullFieldSetting(
          ['point', 'cover', 'extra-cover', 'mid-off', 'mid-on', 'first-slip'],
          'The off-side field a cover drive is played through: the gap between cover and extra cover.',
        ),
      },
      {
        type: 'risk',
        body: `The cover drive is the shot most associated with early dismissals, and the reason is geometric rather than mystical.

Driving means committing the front foot and the bat to a line before the ball has finished moving. Against a ball that is **swinging or seaming away**, the bat arrives where the ball was going rather than where it went, and the edge carries to the wicketkeeper or the slips. Against a ball that is **not quite full enough**, the batter is reaching, contact is away from the body, and the same edge follows.

Hence the familiar dressing-room instruction to leave the cover drive alone early in an innings, and the familiar sight of a batter driving on the up once the ball has stopped moving.`,
      },
      {
        type: 'when_you_will_see_it',
        body: `Once the shine is off the ball and the pitch has flattened; against spin, where the ball arrives slowly enough to get to the pitch of it; and immediately after a bowler has been driven for four, when they pull their length back and stop offering it.`,
      },
      {
        type: 'common_mistakes',
        body: `- Driving at a ball that is too short, so contact happens away from the body.
- Head falling to the leg side, taking the hands with it.
- Front foot planted across rather than towards the pitch of the ball, closing the off side off.
- Driving through a moving ball early in an innings, when leaving it costs nothing.`,
      },
      {
        type: 'key_takeaways',
        body: `- A front-foot drive to a fuller ball outside off, scored between cover and extra cover.
- Low risk when the ball is full and the head is over it; high risk when either is missing.
- Movement off the seam or through the air is what turns the shot into a chance.`,
      },
    ],
  },

  // ── Pace bowling ──────────────────────────────────────────────────────────
  {
    slug: 'yorker',
    title: 'Yorker',
    type: 'bowling_delivery',
    difficulty: 'beginner',
    category: 'pace-bowling',
    alsoIn: ['terminology', 'tactics-and-strategy'],
    shortDescription:
      'A delivery aimed to land at the batter’s feet, giving them no length to work with. The hardest ball in cricket to hit, and the most expensive to get wrong.',
    readMinutes: 5,
    order: 30,
    related: [
      { slug: 'length', type: 'requires_understanding' },
      { slug: 'full-toss', type: 'contrasts_with' },
      { slug: 'half-volley', type: 'contrasts_with' },
      { slug: 'wide-yorker', type: 'variation_of' },
      { slug: 'death-bowling', type: 'used_in' },
      { slug: 'reverse-swing', type: 'related_to' },
      { slug: 'bowled', type: 'related_to' },
    ],
    sourceKeys: [{ key: 'mcc-laws', locator: 'Law 21 (No ball); Law 41 (Unfair play)' }],
    sections: [
      {
        type: 'one_sentence',
        body: 'A fast delivery pitched right at the batter’s feet, so it arrives too full to cut or pull and too late to drive.',
      },
      {
        type: 'simple_explanation',
        heading: 'What it is',
        body: `Length is the whole shot. Every other delivery gives the batter something to use: a short ball can be pulled because it sits up, a full ball can be driven because it comes to the bat. A yorker lands in the small band right at the base of the stumps, in the batter's blockhole, where there is no time to get the bat down and no bounce to hit against.

Miss the length by a few inches short and it becomes a hittable ball on a length. Miss it full and it becomes a **full toss**, which is the most punished delivery in cricket.`,
      },
      {
        type: 'grip_and_release',
        body: `Bowlers do this differently and no single description covers them all. What is common is that the yorker is a **length** delivery rather than a grip variation: the seam position and the wrist are the bowler's stock ones, and the change is in where the ball is released and how far the bowler aims to land it.

Most fast bowlers describe aiming at the base of the stumps or at the batter's toes rather than at a spot on the pitch, and many talk about a slightly later release to bring the trajectory down. A **wide yorker**, aimed at the same length outside off, is the common white-ball variant.`,
      },
      {
        type: 'what_the_batter_expects',
        body: `At the death of a limited-overs innings the batter is looking to hit, which means they are usually moving: down the pitch, across to leg, or back and deep in the crease to create room. Every one of those movements assumes a certain length.

A yorker punishes the movement rather than the batter. Advance down the pitch and the yorker becomes a ball at your feet you have walked into; back away to leg and it follows you to the stumps.`,
      },
      {
        type: 'why_it_matters',
        heading: 'Why it is effective',
        body: `Two reasons, in order of importance.

**No shot pays well.** A well-directed yorker offers a dig-out for no run, or an edge. There is no percentage attacking stroke against it.

**It threatens the stumps.** Because it is heading for the base of the wicket, a missed yorker is bowled or LBW rather than a harmless dot.

The trade is that the target band is tiny, and the punishment for missing it is a boundary. Bowlers who bowl yorkers well are among the most valuable in T20 cricket for exactly that reason.`,
      },
      {
        type: 'when_you_will_see_it',
        body: `The last four overs of a limited-overs innings, above all. Also to a new batter who is playing from deep in the crease, and to a tail-end batter, where the yorker is simply the most likely ball to hit the stumps.

It is rarer with the new ball, where a bowler is looking for edges on a fuller length outside off rather than aiming at the toes.`,
      },
      {
        type: 'how_batters_counter_it',
        body: `- **Stand still.** Movement is what a yorker exploits, so many batters simply hold their position and dig it out.
- **Get outside the line early** and hit through the leg side before the ball reaches the blockhole.
- **The scoop or ramp**, which uses the pace of a full, straight ball rather than fighting it, at high risk.
- **Force the bowler to change length** by moving late, so the intended yorker becomes a full toss.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**"A yorker is a fast ball."** It is a length. Slower-ball yorkers exist and are common.

**"A yorker is any ball at the stumps."** A full ball at the stumps that the batter can reach forward to is a **half-volley** or a **full toss**, which are the two easiest balls in cricket to hit.

**"Every fast bowler can bowl one on demand."** The margin is a few inches at 140 km/h. Bowlers with a reliable yorker are notable precisely because most do not have one.`,
      },
      {
        type: 'key_takeaways',
        body: `- A yorker is defined by length, not pace: at the batter's feet.
- It offers no attacking stroke and threatens the stumps.
- A few inches short is hittable; a few inches full is a full toss.
- Primarily a death-overs weapon.`,
      },
    ],
  },

  // ── Spin bowling ──────────────────────────────────────────────────────────
  {
    slug: 'googly',
    title: 'Googly',
    type: 'bowling_delivery',
    difficulty: 'intermediate',
    category: 'spin-bowling',
    alsoIn: ['terminology'],
    shortDescription:
      'A leg-spinner’s ball that turns the other way. Bowled from the same action, it is designed to be indistinguishable until it lands.',
    readMinutes: 6,
    order: 30,
    aliases: ["Wrong'un", 'Bosie', 'Bosey'],
    related: [
      { slug: 'leg-spin', type: 'requires_understanding' },
      { slug: 'leg-break', type: 'contrasts_with' },
      { slug: 'wrist-spin', type: 'part_of' },
      { slug: 'topspinner', type: 'related_to' },
      { slug: 'flipper', type: 'related_to' },
      { slug: 'doosra', type: 'contrasts_with' },
      { slug: 'playing-against-spin', type: 'related_to' },
      { slug: 'lbw', type: 'related_to' },
    ],
    sourceKeys: [
      { key: 'wp-googly', locator: 'Googly' },
      { key: 'mcc-laws', locator: 'Law 21 (No ball)' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'A wrist-spinner’s delivery that spins in the opposite direction to their stock leg break, disguised by an identical action.',
      },
      {
        type: 'simple_explanation',
        heading: 'What it is',
        body: `A leg-spinner's normal ball, the **leg break**, turns from leg to off for a right-handed batter: it moves away from them after pitching.

The googly turns the other way, from off to leg, coming **in** to the right-hander. It is bowled with the same run-up, the same arm and, if bowled well, an indistinguishable action. The batter therefore plays it expecting the ball to leave them and finds it coming back.

Its value is entirely in the deception. A ball turning in from outside off, played for the turn away, brings the stumps and the front pad into the game.`,
      },
      {
        type: 'player_profiles',
        heading: 'Who bowls it',
        body: `**Wrist spinners.** Right-arm leg-spinners overwhelmingly, and left-arm wrist spinners, whose googly turns away from a right-hander instead.

Not every wrist spinner has one, and among those who do, the quality varies enormously: some bowl it as a genuine wicket-taking option several times an over, others keep one in reserve for a specific batter. Finger spinners have their own reverse-turning ball, the **doosra**, which is a different delivery with different mechanics and a different history of legality debates. The two are not interchangeable terms.`,
      },
      {
        type: 'grip_and_release',
        body: `Described in general terms. Individual bowlers vary a great deal, and coaching descriptions of wrist positions are conventions rather than measurements.

The grip is usually the bowler's normal leg-break grip. What changes is the **wrist and hand at release**: the back of the hand turns further towards the batter, so the ball comes out over the top of the hand rather than off the side of it, and the spin axis flips. The consequence a batter can sometimes see is that the seam and the blur of the ball rotate the other way in flight.

Because the wrist has to travel further, the googly is usually a fraction slower and often a fraction fuller than the same bowler's leg break, and it commonly bounces slightly more.`,
      },
      {
        type: 'what_the_batter_expects',
        body: `Everything about the approach says leg break: the same arc, the same arm, the same field. A right-hander plays for the ball to pitch and leave them, so they play with the bat coming down inside the line, expecting to cover the turn away.`,
      },
      {
        type: 'what_actually_happens',
        body: `The ball turns back in. The bat is now on the wrong side of the ball, and three outcomes follow in rough order of frequency:

- It goes **through the gate** between bat and pad, and bowls them.
- It hits the pad in front, with an LBW appeal that is often strong because the ball is turning towards the stumps rather than away.
- It takes an **inside edge**, which can go anywhere, including onto the pad and up to short leg.`,
      },
      {
        type: 'how_batters_counter_it',
        body: `- **Watch the hand at release.** Some batters pick the different wrist position; many cannot, and say so.
- **Watch the ball in flight** for the direction of the seam's rotation, which is easier with a new white ball than an old red one.
- **Play the length rather than the spin.** Getting far enough forward, or far enough back, reduces how much the turn matters, because the ball has less distance to deviate.
- **Play with the spin** where possible, working the ball into the leg side rather than trying to hit against the turn.
- **Use the crease.** Coming down the pitch takes the turn out of the equation by meeting the ball before it can work.`,
      },
      {
        type: 'historical_context',
        body: `The delivery is generally credited to **Bernard Bosanquet**, an English cricketer who developed it in the early 1900s, which is why it is still occasionally called a **bosie**. "Wrong'un" is a common informal synonym in Australia and England.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**"A googly and a doosra are the same ball."** No. A googly is a wrist spinner's reverse-turning ball, a doosra a finger spinner's. Different action, different mechanics.

**"Every leg-spinner has a googly."** Many do not, and few have a reliable one.

**"Googlies turn more than leg breaks."** Not inherently. They usually turn less, and are effective because of direction rather than degree.

**"You can always pick it from the hand."** International batters routinely say they cannot pick particular bowlers' googlies, and play length instead.`,
      },
      {
        type: 'key_takeaways',
        body: `- A wrist spinner's ball that turns the opposite way to their leg break.
- Effective through disguise rather than through extra turn.
- Usually slightly slower, fuller and higher-bouncing than the stock ball.
- Distinct from the doosra, which is finger spin's equivalent.`,
      },
    ],
  },

  {
    slug: 'reverse-swing',
    title: 'Reverse Swing',
    type: 'bowling_delivery',
    difficulty: 'intermediate',
    category: 'pace-bowling',
    alsoIn: ['pitch-and-conditions', 'red-ball-concepts', 'tactics-and-strategy'],
    shortDescription:
      'Swing that goes the other way with an old ball, and why the mechanism is less settled than commentary suggests.',
    readMinutes: 7,
    order: 40,
    related: [
      { slug: 'swing-bowling', type: 'variation_of' },
      { slug: 'conventional-swing', type: 'contrasts_with' },
      { slug: 'seam-movement', type: 'contrasts_with' },
      { slug: 'old-ball', type: 'requires_understanding' },
      { slug: 'seam-position', type: 'requires_understanding' },
      { slug: 'yorker', type: 'used_in' },
      { slug: 'death-bowling', type: 'used_in' },
    ],
    sourceKeys: [{ key: 'wp-reverse-swing', locator: 'Swing bowling: reverse swing' }],
    sections: [
      {
        type: 'one_sentence',
        body: 'Swing in the opposite direction to what the bowler’s seam position would conventionally produce, associated with an older ball at higher pace.',
      },
      {
        type: 'simple_explanation',
        body: `A ball held with the seam angled towards the slips normally swings away from a right-handed batter. That is **conventional swing**, and it works best when the ball is new and one side is smooth and shiny.

Reverse swing is the same seam position producing the **opposite** movement. The bowler appears to be setting up an outswinger and the ball comes back in. Batters describe it as the most difficult thing to face in cricket, because the visual cues that normally tell you where the ball is going now tell you the wrong thing.

It is associated with **old balls**, **high pace**, and **abrasive, dry surfaces** where one side of the ball roughens quickly.`,
      },
      {
        type: 'how_it_works',
        body: `Here is where honesty matters more than confidence.

Conventional swing is reasonably well understood: with a new ball, air flows differently over the smooth side and the seam-and-rough side, the pressure difference is asymmetric, and the ball moves towards the rough side.

Reverse swing is explained in terms of the same underlying aerodynamics behaving differently once the ball's surface condition and the delivery speed change: above a certain speed and with sufficient surface roughness, the asymmetry that produces the sideways force can invert, so the ball moves towards the shiny side instead.

The parts that are widely agreed:

- It requires a ball that is no longer new, with a marked difference in condition between the two sides.
- It is associated with higher speeds.
- Dry, abrasive outfields and hard grounds bring it on sooner.
- Bowlers with a wrist and seam position they can hold consistently get more out of it.

The parts that are less settled than commentary implies: the precise speed threshold, how much of the effect is aerodynamic versus how much is the batter misreading the seam, and how much any given ball will reverse on any given day. Descriptions that give exact numbers for "the reverse swing speed" are reporting one study or one bowler, not a constant of nature.

The one thing that should never be conflated: **swing is movement through the air before the ball pitches; seam movement is deviation off the pitch when it lands**. They look similar on television and are different phenomena with different causes.`,
      },
      {
        type: 'when_you_will_see_it',
        body: `Typically in the second half of an innings with the same ball, in the subcontinent and other dry conditions, and from the fastest bowlers in a side. In a Test it is often the reason a captain keeps a front-line quick back for the overs before the second new ball is due.

In white-ball cricket the effect is less common: the balls are changed more often, are of a different construction, and in ODIs two new balls per innings are used under current ICC playing conditions, which limits how old either gets.`,
      },
      {
        type: 'tactical_application',
        body: `Reverse swing pairs with **full length**. A ball moving in late is at its most dangerous when it is heading for the base of the stumps or the front pad, which is why reverse swing and **yorkers** appear together and why LBW and bowled account for a high share of the wickets it takes.

It also changes the field. A captain expecting the ball to come in to a right-hander needs less behind square on the off side and more straight, so slips give way to a fielder in front of square on the leg side.

The counter, from a batting side, is usually to attack the length rather than the movement: hitting a fuller ball down the ground before it can work, and using the crease to change where the ball reaches them.`,
      },
      {
        type: 'edge_cases',
        heading: 'Ball condition and the Laws',
        body: `A team may polish the ball, dry it with a towel and remove mud, under the supervision of the umpires. Anything beyond that, applying substances, scuffing the surface, picking the seam, is **changing the condition of the ball** and is an offence under the Laws with match penalties attached.

The distinction is important because reverse swing depends on the ball's condition, which has made it the subject of recurring controversy. Nothing about reverse swing requires illegal ball-tampering: dry, abrasive grounds roughen one side of a ball perfectly legally over sixty overs.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**"Reverse swing is just seam movement."** It is not. Swing happens in the air; seam movement happens off the pitch.

**"It only happens if the ball has been tampered with."** No. Normal wear on an abrasive surface is enough, and it is legal.

**"Reverse swing needs cloud cover."** Cloud cover is part of the folklore of **conventional** swing, and even there the causal claim is weaker than it is usually stated. Reverse swing is associated with dry, hot, abrasive conditions rather than overcast ones.

**"Any bowler can reverse the ball."** It is strongly associated with pace and with a repeatable seam position, and plenty of good bowlers never get much out of it.`,
      },
      {
        type: 'key_takeaways',
        body: `- The ball swings towards the shiny side, opposite to conventional swing.
- Associated with an old, asymmetrically worn ball and high pace.
- The precise mechanism is more contested than commentary suggests.
- Swing and seam movement are different phenomena.
- Legal ball maintenance and illegal tampering are different things.`,
      },
    ],
  },

  // ── Field positions ───────────────────────────────────────────────────────
  {
    slug: 'cricket-field-positions',
    title: 'Field Positions Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'field-positions',
    shortDescription:
      'The map of the field: off side and leg side, close, inner and deep, and how every position name is built out of a handful of words.',
    readMinutes: 7,
    order: 10,
    isStartHere: true,
    isFeatured: true,
    aliases: ['Cricket Fielding Positions', 'Fielding Positions', 'Field Map'],
    related: [
      { slug: 'slip', type: 'part_of' },
      { slug: 'point', type: 'part_of' },
      { slug: 'cover', type: 'part_of' },
      { slug: 'midwicket', type: 'part_of' },
      { slug: 'third-man', type: 'part_of' },
      { slug: 'short-leg', type: 'part_of' },
      { slug: 'field-setting', type: 'related_to' },
      { slug: 'fielding-restrictions', type: 'related_to' },
    ],
    sourceKeys: [{ key: 'mcc-laws', locator: 'Law 28 (The fielder)' }],
    sections: [
      {
        type: 'one_sentence',
        body: 'Cricket has no fixed positions, only named regions, and every name is a combination of which side of the batter it is on, how square it is, and how deep.',
      },
      {
        type: 'simple_explanation',
        body: `Nine fielders, plus a bowler and a wicketkeeper, can be placed almost anywhere. There are no marked positions on the ground. What cricket has instead is a shared vocabulary for **regions**, so a captain can move somebody with two words instead of walking them there.

Learn three axes and the whole map falls out of them.

**Off side and leg side.** Stand where the batter stands, facing the bowler. The side the bat is held on is the **off side**; the side the legs are on is the **leg side**, also called the **on side**. For a right-hander the off side is to the bowler's left. **The whole map mirrors for a left-handed batter**, which is why fielders move when the strike changes.

**Behind or in front of square.** "Square" is the line through the batter, at right angles to the pitch. Behind square is towards the wicketkeeper; in front is towards the bowler.

**How deep.** **Close** catching positions are within a few metres of the bat. **Inner** positions are inside the fielding circle, saving singles. **Deep** positions are on or near the boundary, saving fours.`,
      },
      {
        type: 'how_it_works',
        heading: 'How the names are built',
        body: `Once you know the base names, the modifiers do the rest.

- **"Deep"** or **"long"** means the same position pushed back to the boundary: cover becomes **deep cover**, off becomes **long off**.
- **"Short"** or **"silly"** means the same position brought unusually close: **short leg**, **silly point**. Those are catching positions, worn with a helmet.
- **"Backward"** means moved behind square: **backward point** sits between point and gully.
- **"Fine"** means closer to straight behind the batter; **square** means closer to the square line: **fine leg** and **deep square leg** are both deep on the leg side, at different angles.
- **"Leg"** attached to an off-side name mirrors it: a **leg slip** is a slip on the leg side.

So "deep backward square leg" is not a joke; it is four modifiers doing exactly what they say.`,
      },
      {
        type: 'position_on_the_field',
        heading: 'The whole field',
        body: `A standard-looking field for a pace bowler to a right-handed batter, with the common positions marked. Nothing about it is fixed: a captain will change three or four of these in an over.`,
        structuredData: fullFieldSetting(
          [
            'first-slip',
            'second-slip',
            'gully',
            'point',
            'cover',
            'mid-off',
            'mid-on',
            'midwicket',
            'square-leg',
            'fine-leg',
            'third-man',
          ],
          'A conventional field to a pace bowler, right-handed striker. Off side to the right.',
        ),
      },
      {
        type: 'tactical_application',
        body: `A field is a statement about what the bowler is trying to do and which shots the captain is prepared to concede.

- **Three slips and a gully** says the bowler is looking for an edge outside off, and that nobody is worried about a single behind square on the leg side.
- **Two deep fielders on the leg side and a short cover** says the opposite: singles are acceptable, boundaries are not.
- **Short leg and a leg slip to a spinner** says the plan is bat-pad and inside edges, and that the batter is expected to play at the ball.
- **A sweeper on the off side** in white-ball cricket concedes one to save four.

In limited-overs cricket the choice is constrained by **fielding restrictions**, which cap how many fielders may be outside the circle in each phase.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**"Positions are fixed spots."** They are approximate regions, and captains adjust them constantly.

**"Off side is always the same side of the ground."** It swaps with the batter's handedness. Nothing about the ground changes; the reference point is the batter.

**"There are eleven fielding positions."** There are nine fielders to place, plus bowler and keeper, chosen from dozens of named regions.

**"Silly and short mean the same as deep."** They mean the opposite: unusually close.`,
      },
      {
        type: 'key_takeaways',
        body: `- Off side and leg side are defined from the batter, and mirror for a left-hander.
- Positions are named by side, angle to square, and depth.
- Modifiers such as deep, long, short, silly, backward and fine compose predictably.
- A field setting is a readable statement of the bowling plan.`,
      },
    ],
  },

  {
    slug: 'slip',
    title: 'Slip',
    type: 'field_position',
    difficulty: 'beginner',
    category: 'field-positions',
    alsoIn: ['fielding-and-wicketkeeping'],
    shortDescription:
      'The catching position next to the wicketkeeper on the off side, where edges from a ball leaving the batter go.',
    readMinutes: 5,
    order: 20,
    aliases: ['Slips', 'Slip Cordon'],
    related: [
      { slug: 'first-slip', type: 'variation_of' },
      { slug: 'second-slip', type: 'variation_of' },
      { slug: 'third-slip', type: 'variation_of' },
      { slug: 'gully', type: 'related_to' },
      { slug: 'leg-slip', type: 'contrasts_with' },
      { slug: 'caught', type: 'related_to' },
      { slug: 'outside-edge', type: 'requires_understanding' },
      { slug: 'swing-bowling', type: 'used_in' },
      { slug: 'slip-catching', type: 'related_to' },
    ],
    sourceKeys: [{ key: 'mcc-laws', locator: 'Law 33 (Caught); Law 28 (The fielder)' }],
    sections: [
      {
        type: 'one_sentence',
        body: 'A close catching position behind the batter on the off side, beside the wicketkeeper, positioned to catch the outside edge.',
      },
      {
        type: 'purpose',
        body: `Slip exists because of one specific event: the batter plays at a ball outside off stump, the ball moves away from them, and the edge of the bat sends it flying behind square on the off side at catchable height.

That is the single most common way a top-order batter gets out to a pace bowler, so slip is the position a captain fills before almost any other.`,
      },
      {
        type: 'position_on_the_field',
        body: `A few metres behind the batter's crease on the off side, alongside the wicketkeeper and angled slightly wider. Where exactly depends on pace and bounce: deeper and wider to a genuinely fast bowler, closer and squarer to a spinner.

Slips are numbered outwards from the keeper. **First slip** is nearest, then **second**, **third** and so on, each a step wider. Beyond them sits **gully**, squarer again, for the thicker edge and the ball fended off the body.`,
        structuredData: fieldSetting(
          'slip',
          ['first-slip', 'second-slip', 'third-slip', 'gully', 'point'],
          'Slip, with the rest of the cordon and gully for orientation. Right-handed striker.',
        ),
      },
      {
        type: 'when_it_is_used',
        body: `- **With the new ball**, when swing and seam movement are at their most pronounced and the batter has least information.
- **To an outswing bowler** to a right-hander, or an inswing bowler to a left-hander: any bowler moving the ball away from the bat.
- **To spin**, in fewer numbers and much closer, for the edge off a ball turning away.
- **When a batter is playing at everything**, which is what makes the position worth staffing.

Slips get taken away as an innings goes on. Once the ball stops moving, the edge is less likely and a captain would rather have the fielder saving runs. Watching how many slips remain is one of the quickest ways to read who is on top.`,
      },
      {
        type: 'player_profiles',
        heading: 'Who fields there',
        body: `Specialists. Catching at slip is a distinct skill: the reaction time is short, the ball arrives with deflection and sometimes at pace, and the catcher has to watch the edge of the bat rather than the ball for the first fraction of a second.

Teams typically have two or three trusted slip catchers and put them there for the whole innings rather than rotating the position.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**"Slip is a fixed distance from the keeper."** It varies substantially with the bowler's pace and the bounce of the pitch.

**"More slips is always more attacking."** Only if the bowler is finding the edge. Three slips to a bowler who is not moving the ball is three fielders doing nothing.

**"Leg slip is a slip."** It mirrors the position onto the leg side and catches a very different ball, usually a glance or a deflection off the pad.`,
      },
      {
        type: 'key_takeaways',
        body: `- Close catching position behind square on the off side, next to the keeper.
- Exists to catch the outside edge off a ball leaving the bat.
- Numbered outwards from the keeper; gully sits wider and squarer.
- The number of slips is a live signal of how much the ball is doing.`,
      },
    ],
  },

  // ── Limited-overs ─────────────────────────────────────────────────────────
  {
    slug: 'powerplay',
    title: 'Powerplay',
    type: 'rule',
    difficulty: 'beginner',
    category: 'limited-overs-concepts',
    alsoIn: ['laws-and-rules', 'tactics-and-strategy'],
    shortDescription:
      'The overs in a limited-overs innings when fewer fielders may stand outside the circle, and why the exact numbers belong to a competition rather than to cricket.',
    readMinutes: 6,
    order: 10,
    isStartHere: false,
    ruleSensitive: true,
    sourceRevision: ICC_PC,
    lastReviewedAt: REVIEWED,
    aliases: ['Power play', 'Fielding Restrictions Phase'],
    related: [
      { slug: 'fielding-restrictions', type: 'requires_understanding' },
      { slug: 'opener', type: 'related_to' },
      { slug: 'run-rate', type: 'related_to' },
      { slug: 'limited-overs-cricket', type: 'part_of' },
      { slug: 'middle-overs', type: 'contrasts_with' },
      { slug: 'death-overs', type: 'contrasts_with' },
      { slug: 'powerplay-batting', type: 'used_in' },
    ],
    sourceKeys: [
      { key: 'icc-playing-conditions', locator: 'ODI and T20I fielding restrictions' },
      { key: 'wp-powerplay', locator: 'Powerplay (cricket)' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'A defined block of overs in a limited-overs innings during which only a small number of fielders may stand outside the inner circle.',
      },
      {
        type: 'simple_explanation',
        body: `In limited-overs cricket a painted circle, thirty yards from the middle of each set of stumps, divides the field into an inner ring and the outfield.

During a powerplay, the fielding side may have only a couple of fielders outside that circle. With the boundary largely unprotected, boundaries are easier to hit, so the batting side attacks and the scoring rate in these overs is typically the highest of the innings.

When the powerplay ends, more fielders move out, the gaps close, and the innings changes character.`,
      },
      {
        type: 'the_law',
        heading: 'Rules, and where they come from',
        body: `The powerplay is **not** in the Laws of Cricket. It is a **playing condition**: a rule written by the body running the competition, on top of the Laws.

That distinction matters more here than almost anywhere else in cricket, because the numbers change. Under **current ICC men's playing conditions**:

- **T20I:** the first **6 overs** of each innings are the powerplay, with at most **2** fielders outside the circle. For the remaining overs, at most 5.
- **ODI:** overs **1 to 10** allow at most **2** outside the circle; overs **11 to 40** allow at most **4**; overs **41 to 50** allow at most **5**.

There are further constraints alongside these, including limits on leg-side fielders and a requirement for close catchers in the early overs, which have themselves been revised over the years.

None of that is universal. A domestic T20 league, a women's competition, a shortened match and a past season can each have different numbers. Shortened matches scale the powerplay to the reduced innings length under a formula in the playing conditions, so an eight-over innings does not simply keep a six-over powerplay.

The safe way to state any powerplay rule is: **which competition, which season**.`,
      },
      {
        type: 'historical_context',
        body: `Fielding restrictions in one-day cricket date to the 1980s and have been reorganised repeatedly since. The most visible change was the era of a **batting powerplay**, a block of overs the batting side could choose when to take, which was introduced, moved around and eventually removed from ODI cricket. Anyone reading older match reports will meet it, and it no longer exists.`,
      },
      {
        type: 'tactical_application',
        body: `**Batting.** With the field up, boundaries are available square of the wicket and over the infield, so openers are usually picked for their ability to score quickly against the new ball. The trade is that the new ball also moves and bounces most, so the powerplay is simultaneously the easiest phase to score in and one of the likeliest to lose wickets in. Different sides resolve that differently, and neither maximum aggression nor preserving wickets is the correct answer in general.

**Bowling.** A captain has very few boundary riders, so the plan tends to be full and straight, or short with a specific catcher in place, rather than trying to contain with a spread field. Sides frequently open with a spinner in T20 specifically because the field restrictions make the usual counter, hitting through the line into the gaps, harder to execute.

**Reading it.** When the powerplay ends and the run rate falls sharply, that is not a batting failure; it is the field moving out.`,
      },
      {
        type: 'format_differences',
        body: `- **T20:** one short powerplay, no phase structure beyond it. Effectively three phases in practice: powerplay, middle overs, death.
- **ODI:** three defined blocks of restrictions, so the innings has a genuine middle phase where the field is neither up nor fully spread.
- **Test cricket:** no powerplays and no fielding restrictions at all. A captain may put every fielder on the boundary if they wish.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**"The powerplay is a Law of cricket."** It is a playing condition, and it differs between competitions.

**"The powerplay is always six overs."** That is the current men's T20I figure. ODIs use a different structure, domestic leagues vary, and shortened matches scale it.

**"Powerplay means the batting side must attack."** It means the field is up. What to do about that is a choice.

**"There are no fielding restrictions after the powerplay."** There are; they are simply looser.`,
      },
      {
        type: 'key_takeaways',
        body: `- A phase with a cap on fielders outside the thirty-yard circle.
- A playing condition, not a Law: the numbers belong to a competition and a season.
- Current men's internationals: 6 overs in T20Is; 1-10, 11-40 and 41-50 blocks in ODIs.
- The end of a powerplay explains most sudden drops in run rate.`,
      },
    ],
  },

  // ── Officials and technology ──────────────────────────────────────────────
  {
    slug: 'drs',
    title: 'Decision Review System',
    type: 'technology',
    difficulty: 'intermediate',
    category: 'officials-and-technology',
    alsoIn: ['laws-and-rules'],
    shortDescription:
      'How a decision gets reviewed, what the technology can and cannot establish, and why umpire’s call exists.',
    readMinutes: 7,
    order: 10,
    ruleSensitive: true,
    sourceRevision: ICC_PC,
    lastReviewedAt: REVIEWED,
    aliases: ['DRS', 'Review System', 'Umpire Decision Review System'],
    related: [
      { slug: 'umpires-call', type: 'part_of' },
      { slug: 'ball-tracking', type: 'part_of' },
      { slug: 'edge-detection', type: 'part_of' },
      { slug: 'third-umpire', type: 'requires_understanding' },
      { slug: 'lbw', type: 'used_in' },
      { slug: 'caught', type: 'used_in' },
      { slug: 'reviews-strategy', type: 'related_to' },
    ],
    sourceKeys: [
      { key: 'icc-playing-conditions', locator: 'DRS protocols' },
      { key: 'wp-drs', locator: 'Umpire Decision Review System' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'A process by which certain on-field decisions can be re-examined by the third umpire using replays and tracking technology, at the request of a player or an umpire.',
      },
      {
        type: 'simple_explanation',
        body: `An umpire standing twenty metres away has to decide, in a fraction of a second, whether a ball would have hit the stumps or whether it brushed the bat on the way through. DRS gives them a way to check the hardest of those calls.

Two kinds of review exist and they are worth separating.

**Player reviews.** The fielding captain, or the batter who has been given out, asks for the decision to be checked. These are limited in number, and using them badly leaves a side without one when it matters.

**Umpire reviews.** The on-field umpires can refer certain things to the third umpire themselves, such as run outs, stumpings, whether a catch carried and boundary decisions. These do not use up a team's allocation.`,
      },
      {
        type: 'how_it_works',
        body: `A player review is signalled by making a **T** with the arms or the bat, within a short time limit after the decision.

The third umpire then works through the available evidence and reports to the on-field umpire, who either changes the decision or lets it stand. For an LBW review that means, in order: was it a legal delivery, where did it pitch, was there bat involvement, where was the impact, and was it hitting the stumps.

The important structural point is that the third umpire is checking whether the original decision was **clearly wrong**, not making a fresh decision from scratch. That is what umpire's call encodes.`,
      },
      {
        type: 'reviews_and_technology',
        heading: 'What the technology actually does',
        body: `**Ball tracking.** Multiple high-frame-rate cameras reconstruct the ball's path and **project** it forward past the point of impact. The projection is a model, not a recording, which is why it carries uncertainty and why the projection distance affects confidence: the further the ball had to travel to the stumps, the less certain the extrapolation.

**Edge detection.** Directional microphones synchronised to the video, so a spike in the audio can be placed against the frame where bat and ball were closest. Marketed under provider names such as UltraEdge and Snickometer; the underlying technique is the same idea. It shows that a sound occurred at a moment; a person still has to judge what made it.

**Thermal imaging.** Infrared cameras to show a heat mark from friction, used in some competitions and not others.

Each of these is supplied by a commercial provider, and which providers are used, at what frame rates, differs between competitions. That is a real limitation, not a footnote: the same appeal reviewed in two competitions may have different evidence available.`,
      },
      {
        type: 'edge_cases',
        heading: 'Umpire’s call',
        body: `For LBW, if the tracking shows the margin is small, the checkpoint returns **umpire's call**: the on-field decision stands and the reviewing team keeps its review.

Under current ICC playing conditions the margins apply at two of the three checkpoints: **impact** and **wickets**. If less than half the ball is in line with the stumps at impact, or less than half of it is shown as hitting the stumps, it is umpire's call. **Pitching** carries no such margin.

The logic is that ball tracking has a margin of error, and where the projected answer falls inside that margin, the honest response is to defer to the human who was there rather than to pretend the model is exact. The thresholds have been revised more than once, so the numbers above belong to a version of the playing conditions rather than to the concept.`,
      },
      {
        type: 'format_differences',
        body: `Under current ICC playing conditions, each side has **three** unsuccessful player reviews per innings in Test cricket and **two** in ODIs and T20Is. An unsuccessful review is deducted; a successful one is not; an umpire's call outcome leaves the review intact.

Beyond internationals, availability is uneven. Some domestic and franchise competitions use full DRS, some use a reduced version without ball tracking, and the overwhelming majority of cricket played anywhere in the world has none of it. **DRS is not part of the Laws**, and it is wrong to describe any cricket decision as though a review were always available.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**"DRS gets the decision right."** It reduces clear errors. On marginal LBWs it deliberately declines to overrule, which is the opposite of claiming certainty.

**"Umpire's call means the technology was inconclusive."** It means the margin was inside the tolerance the playing conditions set.

**"Ball tracking films the ball hitting the stumps."** It projects a modelled path past the point of impact.

**"A team loses a review on umpire's call."** Not under current conditions; the review is retained.

**"Every match has DRS."** Most do not.`,
      },
      {
        type: 'key_takeaways',
        body: `- Player reviews are limited; umpire referrals are not.
- The third umpire checks whether the on-field call was clearly wrong.
- Ball tracking projects rather than records, which is why umpire's call exists.
- DRS is a playing condition and varies by competition; most cricket has none.`,
      },
    ],
  },

  // ── Statistics ────────────────────────────────────────────────────────────
  {
    slug: 'batting-average',
    title: 'Batting Average',
    type: 'statistic',
    difficulty: 'beginner',
    category: 'statistics-and-analytics',
    shortDescription:
      'Runs per dismissal, not runs per innings. The difference is what not-outs do to the number.',
    readMinutes: 5,
    order: 10,
    isStartHere: false,
    aliases: ['Average', 'Batting Avg'],
    related: [
      { slug: 'strike-rate', type: 'contrasts_with' },
      { slug: 'not-out', type: 'requires_understanding' },
      { slug: 'runs', type: 'part_of' },
      { slug: 'balls-faced', type: 'related_to' },
      { slug: 'bowling-average', type: 'contrasts_with' },
      { slug: 'test-cricket', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'Total runs divided by the number of times the batter has been out.',
      },
      {
        type: 'how_it_is_calculated',
        body: `**Average = runs scored ÷ times dismissed**

The denominator is **dismissals**, not innings. Those two numbers differ by exactly the number of times the batter finished an innings **not out**, and that gap is where every misunderstanding about batting average lives.

If a batter has 1,000 runs from 30 innings, 6 of them not out, they were dismissed 24 times, so the average is 1,000 ÷ 24 ≈ 41.67. Dividing by 30 instead gives 33.33, which is a different statistic and not the one cricket uses.

A batter who has never been dismissed has no average at all. The convention is to leave it blank or mark it as undefined rather than print a number.`,
      },
      {
        type: 'example',
        body: `Six innings: **45, 12, 0, 88 not out, 31, 24 not out**.

- Runs: 45 + 12 + 0 + 88 + 31 + 24 = **200**
- Innings: **6**
- Not outs: **2**, so dismissals: **4**

Average = 200 ÷ 4 = **50.00**.

Runs per innings would be 200 ÷ 6 ≈ 33.33. Both numbers describe the same six innings; only the first is the batting average.`,
      },
      {
        type: 'how_to_interpret',
        body: `Read it as: **how many runs the team typically gets from this batter before losing the wicket**. That framing is why dismissals are the right denominator: the cost of a batter's runs is measured in wickets, and a not-out innings did not cost one.

Rough Test-cricket reference points, for specialist batters:

- Above 50: very good, and sustained over a long career, exceptional.
- 40 to 50: a solid international batter.
- Below 30 for a specialist batter: struggling at that level.

Those bands are conventions of Test cricket, not universal constants, and they should not be carried into other formats.`,
      },
      {
        type: 'what_it_does_not_tell_you',
        body: `- **Nothing about speed.** A batter averaging 45 at a strike rate of 40 and one averaging 45 at 90 are different players with the same average.
- **Nothing about when.** Runs in a dead match and runs in a fourth-innings chase count identically.
- **Nothing about who they faced,** on what surface, in what conditions.
- **It is inflated by not-outs,** which is why a lower-order batter who is often stranded at the end can carry an average well above their actual reliability, and why the statistic flatters finishers in T20 cricket in particular.`,
      },
      {
        type: 'format_differences',
        body: `In **Test cricket**, where deliveries are effectively unlimited, average is close to the primary batting number: occupying the crease has value in itself.

In **ODIs** it is informative but incomplete without strike rate.

In **T20**, average is a weak signal. Innings are short, not-outs are frequent, and a batter's job is often to score at a rate rather than to survive. Average and strike rate have to be read together, and neither alone identifies a good T20 batter.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**"Average is runs per innings."** It is runs per dismissal.

**"Not outs don't matter."** They are precisely what separates the two calculations.

**"Averages are comparable across formats."** They are not. 45 in Tests and 45 in T20s describe very different players.

**"A career average of 99.94 means Bradman scored 99.94 every innings."** It means his runs divided by his dismissals came to that. Individual innings varied enormously.`,
      },
      {
        type: 'key_takeaways',
        body: `- Runs ÷ dismissals, never runs ÷ innings.
- Not-outs raise the average and are the source of most confusion.
- Undefined for a batter never dismissed.
- Needs strike rate beside it in limited-overs cricket.`,
      },
    ],
  },

  {
    slug: 'strike-rate',
    title: 'Strike Rate',
    type: 'statistic',
    difficulty: 'beginner',
    category: 'statistics-and-analytics',
    shortDescription:
      'Runs per hundred balls faced. The scoring-speed number, and the one that changes meaning most between formats.',
    readMinutes: 4,
    order: 20,
    aliases: ['Batting Strike Rate', 'SR'],
    related: [
      { slug: 'batting-average', type: 'contrasts_with' },
      { slug: 'balls-faced', type: 'requires_understanding' },
      { slug: 'runs', type: 'part_of' },
      { slug: 'bowling-strike-rate', type: 'contrasts_with' },
      { slug: 't20i', type: 'related_to' },
      { slug: 'run-rate', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'How many runs a batter scores per 100 balls faced.',
      },
      {
        type: 'how_it_is_calculated',
        body: `**Strike rate = (runs ÷ balls faced) × 100**

So a strike rate of 135 means 135 runs per 100 deliveries, or 1.35 runs a ball.

Balls faced counts **legal deliveries** the batter faced. Wides are not faced by the batter and do not count; a no-ball the batter faced does.

Confusingly, cricket uses the phrase "strike rate" for bowlers too, and it means something entirely different there: **balls per wicket**. Same words, unrelated formula. For bowlers, lower is better; for batters, higher is better.`,
      },
      {
        type: 'example',
        body: `A batter makes **75 from 62 balls**.

Strike rate = (75 ÷ 62) × 100 ≈ **121.0**.

Note what the calculation does **not** involve: overs. If you were told the innings lasted "10.4 overs", you would convert that to 64 balls first (10 × 6 + 4) rather than using 10.4 in any arithmetic. Over notation is completed overs and balls, not a decimal.`,
      },
      {
        type: 'how_to_interpret',
        body: `Strike rate answers "how fast", average answers "how reliably". Neither is complete alone, and which one dominates depends entirely on which resource is scarce.

Very rough reference points for specialist batters, and these move over time as scoring rates rise:

- **Test cricket:** 45 to 60 is normal for a top-order batter. Some excellent Test batters score more slowly than that and are valuable anyway.
- **ODI:** roughly 85 to 100 for a middle-order batter, higher for an aggressor.
- **T20:** roughly 130 upwards, and higher again for a finisher facing mostly death overs.

A number without its format and its batting position attached is not interpretable.`,
      },
      {
        type: 'what_it_does_not_tell_you',
        body: `- **Which balls.** A strike rate built against spin in the middle overs and one built against yorkers at the death are not equivalent, and the raw number cannot tell them apart. Phase splits exist for this reason.
- **Risk taken.** Two batters can strike at 140 with very different chances of getting out next ball.
- **Match context.** Scoring at 200 when the required rate is 6 is not obviously better than scoring at 110.`,
      },
      {
        type: 'format_differences',
        body: `The scarcity argument again: in T20 the limited resource is **deliveries**, so strike rate is close to decisive. In Test cricket the limited resource is **wickets**, so a low strike rate is often not a fault at all, and batting slowly to survive a session can be the highest-value contribution of a match.

Comparing strike rates across formats is the single most common misuse of the statistic.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**"Strike rate is runs per over."** That is **run rate**, and it describes a team, not a batter.

**"Batting and bowling strike rate are the same statistic."** They share a name only. Bowling strike rate is balls per wicket.

**"A higher strike rate is always better."** Only against the format and the match situation.

**"Wides count as balls faced."** They do not.`,
      },
      {
        type: 'key_takeaways',
        body: `- (Runs ÷ balls faced) × 100.
- Higher is faster; interpret only alongside format and role.
- Bowling strike rate is a different statistic with the same name.
- Convert over notation to balls before any calculation.`,
      },
    ],
  },

  {
    slug: 'economy-rate',
    title: 'Economy Rate',
    type: 'statistic',
    difficulty: 'beginner',
    category: 'statistics-and-analytics',
    shortDescription:
      'Runs conceded per over. Simple arithmetic, with one trap: the overs figure is not a decimal.',
    readMinutes: 5,
    order: 30,
    aliases: ['Econ', 'Economy'],
    related: [
      { slug: 'bowling-average', type: 'contrasts_with' },
      { slug: 'bowling-strike-rate', type: 'contrasts_with' },
      { slug: 'maiden-over', type: 'related_to' },
      { slug: 'dot-ball', type: 'related_to' },
      { slug: 'overs-notation', type: 'requires_understanding' },
      { slug: 'death-bowling', type: 'related_to' },
      { slug: 'powerplay', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'The average number of runs a bowler concedes per over bowled.',
      },
      {
        type: 'how_it_is_calculated',
        body: `**Economy rate = runs conceded ÷ overs bowled**

The safe way to compute it is in balls:

**Economy rate = runs conceded ÷ (balls bowled ÷ 6)**

Because over figures are written as completed overs and balls, not decimals. A bowler who has bowled **8.2** overs has bowled 8 × 6 + 2 = **50** balls, which is 50 ÷ 6 ≈ 8.33 overs. Dividing by 8.2 would give the wrong answer, and doing it that way is one of the most common errors in amateur cricket statistics.

**What counts as runs conceded:** runs off the bat, plus **wides** and **no-balls**. **Byes** and **leg byes** do not, because they are not attributable to the bowler.`,
      },
      {
        type: 'example',
        body: `A bowling analysis reads **8.2-0-47-3**.

Balls bowled: 8 × 6 + 2 = **50**. Overs: 50 ÷ 6 ≈ **8.33**.

Economy = 47 ÷ 8.33 ≈ **5.64** runs per over.

Using 47 ÷ 8.2 gives 5.73, which is wrong. The error looks small here and grows with the size of the ball remainder.`,
      },
      {
        type: 'how_to_interpret',
        body: `Economy rate measures **containment**. It says nothing about wickets, which is what **bowling average** and **bowling strike rate** are for. A bowler can have an outstanding economy rate and take no wickets, and in some roles that is exactly the job.

Rough reference points, which move over time:

- **Test cricket:** under 3 an over is very good.
- **ODI:** under about 5 is very good.
- **T20:** under about 7 is very good, and around 8 is respectable at the death.

Those bands are not interchangeable, which is the whole point of the next section.`,
      },
      {
        type: 'format_differences',
        heading: 'Reading economy rate across formats',
        body: `An economy rate of 6.5 is a different fact in each format.

- In a **Test**, it would be extraordinary and would usually mean the bowler was being attacked or was bowling badly. Batters are not obliged to score, so a bowler who concedes 6.5 an over is giving away runs nobody was forcing them to give.
- In an **ODI**, 6.5 is mildly expensive but unremarkable, and in the last ten overs it would be good.
- In a **T20**, 6.5 across four overs would be an excellent performance.

The reason is that the batting side's incentives change. Economy rate measures runs conceded against a batting side that is trying to score at a particular rate, and that rate is set by the format.

Two further context effects matter as much as format:

- **Phase.** Four overs at the death and four in the middle overs are not comparable. A death specialist with an economy of 8.5 may be more valuable than a middle-overs bowler at 7.0.
- **Conditions and match state.** Bowling to a side chasing 12 an over inflates every economy rate on the fielding side.

So the honest interpretation is: economy rate is comparable **within** a format, a phase and roughly similar conditions, and misleading across them.`,
      },
      {
        type: 'what_it_does_not_tell_you',
        body: `- **Wickets.** A bowler who concedes 4 an over and takes none has not necessarily helped more than one who concedes 6 and takes three.
- **Which overs.** Powerplay, middle and death overs carry very different expected costs.
- **Whether the runs were their fault.** Dropped catches, boundary misfields and a batter's outside edge running to third man all count against the bowler.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**"Divide runs by the printed overs figure."** Only when it has no ball remainder. Convert to balls first.

**"Byes count against the bowler."** They do not. Wides and no-balls do.

**"A lower economy rate is always a better bowler."** It is a containment number, not a wicket-taking one.

**"Economy rates compare across formats."** They do not, and phase matters almost as much as format.`,
      },
      {
        type: 'key_takeaways',
        body: `- Runs conceded ÷ overs, computed via balls ÷ 6.
- Wides and no-balls count against the bowler; byes and leg byes do not.
- Comparable within a format and a phase, not across them.
- Says nothing about wickets.`,
      },
    ],
  },

  {
    slug: 'dls-method',
    title: 'DLS Method',
    type: 'rule',
    difficulty: 'intermediate',
    category: 'limited-overs-concepts',
    alsoIn: ['laws-and-rules', 'statistics-and-analytics'],
    shortDescription:
      'How a target is recalculated when rain shortens a limited-overs match, and why the actual numbers come from software rather than a formula you can do by hand.',
    readMinutes: 6,
    order: 20,
    ruleSensitive: true,
    sourceRevision: ICC_PC,
    lastReviewedAt: REVIEWED,
    aliases: ['Duckworth-Lewis-Stern', 'Duckworth Lewis', 'DL Method', 'D/L'],
    related: [
      { slug: 'par-score', type: 'related_to' },
      { slug: 'target', type: 'related_to' },
      { slug: 'required-run-rate', type: 'contrasts_with' },
      { slug: 'no-result', type: 'related_to' },
      { slug: 'chase', type: 'related_to' },
      { slug: 'limited-overs-cricket', type: 'part_of' },
    ],
    sourceKeys: [
      { key: 'wp-dls', locator: 'Duckworth–Lewis–Stern method' },
      { key: 'icc-playing-conditions', locator: 'Interrupted matches' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'A method for resetting the target in a limited-overs match shortened by weather, based on the batting resources each side actually had.',
      },
      {
        type: 'simple_explanation',
        body: `Rain interrupts a match and one side ends up with fewer overs than the other. Something has to decide a fair target.

The obvious approach, scale the target by the fraction of overs lost, is badly wrong, and cricket learned that the hard way. Overs are not the only thing a batting side has: it also has **wickets**. A side with ten wickets and twenty overs can attack in a way a side with ten wickets and fifty overs cannot afford to, so twenty overs at the end of an innings are not worth two-fifths of fifty.

DLS treats overs remaining and wickets remaining together as **resources**. Every combination of the two corresponds to a percentage of the innings' total resource. When an interruption changes the resources available to a side, the target is adjusted by the ratio of the two sides' resource percentages.`,
      },
      {
        type: 'how_it_works',
        body: `The mechanism, at the level it can honestly be described:

1. Each combination of overs left and wickets lost maps to a **resource percentage**.
2. Team 1's innings consumed some percentage of resources; so did Team 2's, once interruptions are accounted for.
3. If Team 2 has fewer resources, their target is scaled down in proportion; if more, it is scaled up.
4. During Team 2's innings the same tables produce a **par score**: what they should have reached, at this exact point, to be level. Ahead of par and the match is theirs if it stops now; level is a tie.

That is the concept. What this explainer deliberately does not do is give you the numbers.

**The resource values used in international cricket are not public.** The Professional Edition, in use since the mid-2000s, is implemented in licensed software supplied to match officials, and the underlying values are not published. The Standard Edition tables that circulate are a simplified variant used in lower-level cricket. The model is also revised periodically, most substantially by Steven Stern, whose name was added when he took over its maintenance and updated it for modern scoring rates.

So any DLS number you see quoted came out of the official software or out of the published Standard Edition tables. Anybody reproducing a DLS target from a formula in a blog post is not computing the same thing the match officials are.`,
      },
      {
        type: 'example',
        body: `Illustrative, and deliberately without invented resource percentages.

Team 1 bats their full 50 overs and makes 250. Rain then reduces Team 2's innings to 40 overs before they start.

Team 2 has fewer overs but the same ten wickets, so they have lost **less than** 20% of their batting resource, not exactly 20%. Their target is therefore **more** than 200. The official software produces the exact figure; the direction of the adjustment is the part that is worth understanding, and it is the part a simple run-rate calculation gets wrong.

Mid-innings the scoreboard will show a **par score**. If Team 2 are 150 for 3 after 28 overs and par is 144, they are 6 runs ahead: if the match were abandoned at that moment, they would win.`,
      },
      {
        type: 'edge_cases',
        heading: 'When it applies, and when there is no result',
        body: `DLS needs a minimum amount of play to produce a result at all. Under ICC playing conditions a certain number of overs must be bowled in the second innings, commonly 20 in an ODI and 5 in a T20, and if the match does not reach that, it is a **no result** rather than a DLS decision.

Those minimums, and the details of how interruptions are handled, are **playing conditions** and vary by competition. Domestic leagues sometimes use different thresholds, and older matches were played under earlier editions of the method.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**"DLS is just a run-rate calculation."** It is not, and the difference is the entire reason it exists.

**"You can compute the target yourself."** Not the one that will be used in an international. The Professional Edition values are not published.

**"DLS punishes the chasing side."** It adjusts in whichever direction the resources moved. A side with fewer overs and full wickets gets a target higher than pro-rata; a side losing overs having already lost wickets can get one lower.

**"Reaching par means you win."** Reaching par exactly is a **tie**. You need one more.

**"The method never changes."** It is revised, and it has had three names for that reason.`,
      },
      {
        type: 'key_takeaways',
        body: `- Targets are reset by batting resources, meaning overs and wickets together.
- Not a proportional run-rate adjustment.
- The international resource values are proprietary; DLS numbers come from official software.
- Par exactly is a tie, and minimum-overs thresholds are playing conditions.`,
      },
    ],
  },

  // ── Red-ball concepts ─────────────────────────────────────────────────────
  {
    slug: 'declaration',
    title: 'Declaration',
    type: 'rule',
    difficulty: 'intermediate',
    category: 'match-structure',
    alsoIn: ['red-ball-concepts', 'tactics-and-strategy'],
    shortDescription:
      'A captain ending their own innings voluntarily, and the trade between setting a target and having time to bowl the other side out.',
    readMinutes: 5,
    order: 20,
    ruleSensitive: true,
    sourceRevision: MCC_CODE,
    lastReviewedAt: REVIEWED,
    aliases: ['Declare', 'Declared'],
    related: [
      { slug: 'follow-on', type: 'related_to' },
      { slug: 'draw', type: 'requires_understanding' },
      { slug: 'lead', type: 'requires_understanding' },
      { slug: 'test-cricket', type: 'used_in' },
      { slug: 'declaration-strategy', type: 'related_to' },
      { slug: 'session', type: 'related_to' },
      { slug: 'batting-for-a-draw', type: 'contrasts_with' },
    ],
    sourceKeys: [{ key: 'mcc-laws', locator: 'Law 15 (Declaration and forfeiture)' }],
    sections: [
      {
        type: 'one_sentence',
        body: 'A captain closing their team’s innings before ten wickets have fallen, in order to spend the remaining time bowling instead of batting.',
      },
      {
        type: 'the_law',
        body: `**Law 15** allows the batting captain to declare an innings closed at any time when the ball is dead, provided the umpires and the opposing captain are informed. The same Law allows a captain to **forfeit** an innings entirely, which is rare but has happened.

Declaration exists only where an innings can end for a reason other than wickets or a fixed number of overs. That means multi-innings, time-limited cricket: Tests and other first-class matches. In limited-overs cricket there is nothing to declare, because the innings ends when the overs run out.`,
      },
      {
        type: 'simple_explanation',
        body: `A Test match has a fixed amount of time, not a fixed number of innings-lengths. To win, you have to take twenty wickets. Every over you spend batting is an over you cannot spend bowling.

So a captain batting with a big lead reaches a point where more runs stop being useful and time starts being the scarce thing. Declaring converts unused batting time into bowling time.

The judgement is a trade: declare too early and the opposition can chase the target down; declare too late and there are not enough overs left to bowl them out, and the match is drawn.`,
      },
      {
        type: 'tactical_application',
        body: `What a captain is weighing, roughly in order of how often it decides the call:

- **Overs remaining in the match**, which in a Test is usually thought of in sessions rather than overs.
- **How the pitch is behaving**, and how it is likely to behave later: a deteriorating surface argues for declaring earlier, because bowling gets easier.
- **The state of their bowling attack.** A tiring or injured attack needs a bigger cushion.
- **The series position.** A side leading a series will accept a draw more readily than one that must win, and will therefore declare later.
- **Weather forecast.** Lost time later means the declaration has to be earlier.

A conventional heuristic is to set a target the opposition might plausibly chase, because a side attempting a chase takes risks and loses wickets, whereas a side with no chance simply blocks. A target that looks generous is often a deliberate invitation.

None of this is a rule. Captains declare at very different points from the same position, and the decision is judged almost entirely by whether it worked.`,
      },
      {
        type: 'example',
        body: `Day four of a Test. Team A leads by 320 with two wickets left and about five sessions remaining.

Batting on adds runs the opposition already cannot realistically chase, and each over spent doing it is one fewer to take ten wickets. The captain declares, setting 321, and takes the new ball with roughly 150 overs available.

The alternative reading, on a flat pitch with a tired attack and rain forecast, might be to bat another hour to make a chase impossible and accept a likely draw. Both are defensible from the same scoreboard.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**"Declaring means giving up."** It usually means going for a win, because it buys bowling time.

**"You can declare in an ODI."** There is nothing to declare: the innings is a fixed number of overs.

**"A declaration ends the match."** It ends the innings. The opposition then bat.

**"There is a right time to declare."** There are conventions and there is hindsight. Captains genuinely disagree.`,
      },
      {
        type: 'key_takeaways',
        body: `- Law 15: the batting captain may close an innings at any time.
- Exists only in time-limited, multi-innings cricket.
- Trades batting time for bowling time, because winning needs twenty wickets.
- Declaring too late is as much a decision as declaring too early.`,
      },
    ],
  },

  {
    slug: 'follow-on',
    title: 'Follow-on',
    type: 'rule',
    difficulty: 'intermediate',
    category: 'match-structure',
    alsoIn: ['red-ball-concepts', 'tactics-and-strategy'],
    shortDescription:
      'Making the opposition bat again immediately, available only with a large enough first-innings lead, and optional even then.',
    readMinutes: 5,
    order: 30,
    ruleSensitive: true,
    sourceRevision: MCC_CODE,
    lastReviewedAt: REVIEWED,
    aliases: ['Following On', 'Enforce the Follow-on'],
    related: [
      { slug: 'declaration', type: 'related_to' },
      { slug: 'lead', type: 'requires_understanding' },
      { slug: 'deficit', type: 'requires_understanding' },
      { slug: 'test-cricket', type: 'used_in' },
      { slug: 'first-class-cricket', type: 'used_in' },
      { slug: 'follow-on-decision', type: 'related_to' },
      { slug: 'draw', type: 'related_to' },
    ],
    sourceKeys: [
      { key: 'mcc-laws', locator: 'Law 14 (The follow-on)' },
      { key: 'wp-follow-on', locator: 'Follow-on' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'The option for a side with a large enough first-innings lead to send the opposition straight back in to bat their second innings.',
      },
      {
        type: 'the_law',
        body: `Under **Law 14**, the side that batted first may require the other side to bat again immediately if it leads by at least a set margin. The margin depends on the scheduled length of the match:

- **Five days or more:** 200 runs
- **Three or four days:** 150 runs
- **Two days:** 100 runs
- **One day:** 75 runs

If the start of a match is delayed before play begins, the thresholds are reduced in line with the shortened match. Time lost after play has started does not change the threshold.

The right is **optional**. A captain who qualifies may decline it, and the innings order then proceeds normally.`,
      },
      {
        type: 'simple_explanation',
        body: `Normally the innings alternate: A, B, A, B. The follow-on breaks that pattern into A, B, B.

Its purpose is to save time. If one side is 250 behind, making them bat again straight away skips the leading side's second innings and gives more overs in which to bowl them out twice, which is what a win requires.

The cost is that the leading side's bowlers have to keep bowling, and if the follow-on side bats well, the leading team can end up batting last on a worn pitch chasing a target rather than defending one.`,
      },
      {
        type: 'tactical_application',
        body: `Modern captains decline the follow-on more often than their predecessors did, and the reasons are consistent:

- **Bowler workload.** A four-man attack that has just bowled a long innings may be more use after a rest, particularly in heat.
- **Pitch trajectory.** Batting again now, while the surface is still good, and setting a target later can be safer than batting last on a deteriorating pitch.
- **Risk of an unlikely defeat.** It is rare, but a side following on can bat their opponents out of the match. It has happened in Tests and it is remembered for a long time.
- **Time genuinely available.** If there are four days left, the time saved matters less than the risk.

Enforcing it remains the aggressive, and often correct, choice when the deficit is very large, the pitch is deteriorating and the attack is fresh.`,
      },
      {
        type: 'example',
        body: `A five-day Test. Team A make 520. Team B are bowled out for 260, a deficit of 260, which is more than the 200 required.

Team A may enforce the follow-on and send Team B straight back in, keeping their own second innings in reserve, possibly to be forfeited or declared at speed if needed.

If Team A's lead had been 190, the option would not exist at all: they would bat their second innings, whatever they wanted to do.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**"The follow-on is automatic."** It is entirely the captain's choice.

**"Any lead lets you enforce it."** The threshold depends on match length: 200 for a five-day match.

**"It exists in limited-overs cricket."** It cannot: each side has one innings.

**"Enforcing it always increases the chance of winning."** It saves time and costs bowler freshness, and captains weigh those differently.`,
      },
      {
        type: 'key_takeaways',
        body: `- Law 14, with thresholds of 200, 150, 100 and 75 runs by match length.
- Optional, and increasingly declined.
- Changes the innings order to A, B, B and saves time.
- Trades time gained against bowler workload and batting last.`,
      },
    ],
  },

  // ── Remaining Start Here path ─────────────────────────────────────────────
  {
    slug: 'how-runs-are-scored',
    title: 'How Runs Are Scored',
    type: 'standard',
    difficulty: 'beginner',
    category: 'match-basics',
    alsoIn: ['scoring-and-scorecards'],
    shortDescription:
      'Running, boundaries and extras: every way the total goes up, and which of them are credited to the batter.',
    readMinutes: 5,
    order: 15,
    isStartHere: true,
    related: [
      { slug: 'runs', type: 'part_of' },
      { slug: 'boundary', type: 'part_of' },
      { slug: 'four', type: 'part_of' },
      { slug: 'six', type: 'part_of' },
      { slug: 'extras', type: 'related_to' },
      { slug: 'running-between-wickets', type: 'related_to' },
      { slug: 'how-to-read-a-cricket-score', type: 'related_to' },
    ],
    sourceKeys: [{ key: 'mcc-laws', locator: 'Laws 18, 19, 23' }],
    sections: [
      {
        type: 'one_sentence',
        body: 'Runs come from the two batters running between the wickets, from the ball reaching the boundary, or from penalties against the fielding side.',
      },
      {
        type: 'how_it_works',
        body: `**Running.** After the striker hits the ball, both batters may run the length of the pitch. Each completed exchange of ends is one run, and they may keep running while the ball is still out there. Two runs means they crossed twice, so the same batter is on strike again; one or three leaves the other batter facing.

Both batters must ground some part of the bat or body behind the popping crease at the far end for the run to count. Turning short is a **short run** and that run is disallowed.

**Boundaries.** If the ball reaches or crosses the boundary rope, the runs are awarded automatically and the batters stop.

- **Four**: the ball reaches the boundary having touched the ground first.
- **Six**: it clears the boundary without touching the ground inside it.

**Extras.** Runs that go to the team without the batter having scored them, covered by Law 23:

- **No-ball** and **wide**: one penalty run each, and the ball is re-bowled.
- **Bye**: the striker misses, the keeper misses, and the batters run.
- **Leg bye**: the ball hits the batter's body rather than the bat, and they run.
- **Penalty runs**: awarded for certain fielding offences.

The critical distinction: runs off the bat count to the **batter's** score. Extras count to the **team** total but not to any batter. Wides and no-balls are charged to the **bowler**; byes and leg byes are not.`,
      },
      {
        type: 'example',
        body: `An over that concedes 11 runs.

1. Driven for **4**. Batter +4, team +4.
2. Missed, keeper misses, they run **1**: a **bye**. Team +1, batter +0.
3. Wide down the leg side: **1 wide**. Team +1, charged to the bowler. Re-bowled.
4. Defended, no run. A **dot ball**.
5. Pulled for **2**. Batter +2, team +2.
6. Hit the pad and they ran **1**: a **leg bye**. Team +1, batter +0.
7. Driven for **2**. Batter +2, team +2.

Team total for the over: 4 + 1 + 1 + 0 + 2 + 1 + 2 = **11**. Of those, **8** came off the bat and **3** were extras. Only the wide is charged to the bowler: the bye and the leg bye are not. The over took seven deliveries, since the wide did not count.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**"Every run counts to the batter."** Byes, leg byes, wides and no-balls do not.

**"You have to stop after one run."** The batters may run as many as they can while the ball is live.

**"Six means it went further."** It means it cleared the boundary without bouncing. A flat hit that bounces just inside the rope and goes fifty metres beyond it is four.

**"A leg bye is a bye."** A bye comes off nothing; a leg bye comes off the body.`,
      },
      {
        type: 'key_takeaways',
        body: `- Runs come from running, from boundaries, or from extras.
- Four bounces first, six does not.
- Extras go to the team, never to the batter.
- Wides and no-balls are charged to the bowler; byes and leg byes are not.`,
      },
    ],
  },

  {
    slug: 'wickets-and-dismissals',
    title: 'Wickets & Dismissals',
    type: 'standard',
    difficulty: 'beginner',
    category: 'dismissals',
    shortDescription:
      'Every way a batter can be out, how often each actually happens, and the appeal that has to come first.',
    readMinutes: 6,
    order: 10,
    isStartHere: true,
    ruleSensitive: true,
    sourceRevision: MCC_CODE,
    lastReviewedAt: REVIEWED,
    aliases: ['Ways of Getting Out', 'Modes of Dismissal', 'Out'],
    related: [
      { slug: 'bowled', type: 'part_of' },
      { slug: 'caught', type: 'part_of' },
      { slug: 'lbw', type: 'part_of' },
      { slug: 'run-out', type: 'part_of' },
      { slug: 'stumped', type: 'part_of' },
      { slug: 'hit-the-ball-twice', type: 'part_of' },
      { slug: 'timed-out', type: 'part_of' },
      { slug: 'appeals', type: 'requires_understanding' },
      { slug: 'wicket', type: 'requires_understanding' },
    ],
    sourceKeys: [{ key: 'mcc-laws', locator: 'Laws 30-39' }],
    sections: [
      {
        type: 'one_sentence',
        body: 'There are ten ways to be out under the Laws, but five of them account for almost every dismissal you will ever see.',
      },
      {
        type: 'simple_explanation',
        body: `"Wicket" means three different things in cricket, which is worth sorting out first.

1. The **three stumps and two bails** at each end.
2. The **pitch** itself, as in "a good wicket to bat on".
3. A **dismissal**, as in "England lost three wickets".

This page is about the third. When a batter is out, the fielding side has taken a wicket, and that batter's innings is over.

Ten wickets ends the innings, because the last batter has no partner.`,
      },
      {
        type: 'how_it_works',
        heading: 'The five you will see constantly',
        body: `- **Bowled** (Law 32). The delivery hits the stumps and puts the wicket down.
- **Caught** (Law 33). A fielder catches the ball off the bat before it touches the ground.
- **LBW** (Law 36). The ball hits the batter's body in front of the stumps, having pitched legally, and would have gone on to hit the wicket.
- **Run out** (Law 38). A batter is out of their ground when the wicket is put down while they are attempting a run.
- **Stumped** (Law 39). The wicketkeeper puts the wicket down with the batter out of their ground, not attempting a run.

Across Test history, caught accounts for well over half of all dismissals and bowled for around a fifth, with LBW next. The rarer methods below together make up under two per cent.

Together these are the overwhelming majority of dismissals in any match at any level.`,
      },
      {
        type: 'edge_cases',
        heading: 'The rarer five',
        body: `- **Hit wicket** (Law 35). The striker breaks their own wicket with bat or body while playing the ball or setting off for their first run.
- **Obstructing the field** (Law 37). The batter deliberately obstructs or distracts the fielding side. Since the 2017 Code this also covers deliberately striking the ball with a hand not holding the bat, which is why **handled the ball** no longer exists as a separate method of dismissal.
- **Hit the ball twice** (Law 34). Deliberately striking the ball a second time other than to protect the wicket.
- **Timed out** (Law 40). A new batter is not ready to face a delivery within the allowed time after the previous wicket. It first happened in an international in 2023 and has never happened in a Test.
- **Retired out** (Law 25.4). A batter who leaves the field without the umpire's consent, and does not resume with the opposing captain's consent, is out. Retiring for injury or illness is **retired not out**, which is not a dismissal and does not count against a batting average.

The Laws have been rewritten more than once, and the list has changed with them. Anything you read describing "handled the ball" as a current, separate dismissal is out of date.`,
      },
      {
        type: 'decision_sequence',
        heading: 'The appeal comes first',
        body: `Under **Law 31**, an umpire does not give a batter out unless the fielding side **appeals**. That is the "Howzat?" of cricket, and it is a formal requirement rather than theatre.

In practice the distinction that matters is between the obvious and the judged. When a batter is plainly bowled or caught, the appeal is a formality and is often not made at all, and the umpire is not obliged to wait for one that everybody can see is unnecessary. For anything requiring judgement, above all LBW, no appeal means no dismissal, however plainly out the batter looks.

The umpire then decides. Where DRS is in use, that decision may be reviewable, but DRS is a playing condition and most cricket does not have it.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**"There are eleven ways to be out."** Older lists include "handled the ball", which the current Code folds into obstructing the field.

**"Hit wicket is the same as bowled."** Bowled is the ball hitting the stumps. Hit wicket is the batter doing it.

**"The umpire gives people out when they see it."** Almost always only on appeal.

**"Retiring hurt is a dismissal."** It is not, and the batter may resume.`,
      },
      {
        type: 'key_takeaways',
        body: `- "Wicket" means the stumps, the pitch, or a dismissal, depending on context.
- Bowled, caught, LBW, run out and stumped cover nearly everything.
- An appeal is required for almost every dismissal.
- Ten wickets ends an innings.`,
      },
    ],
  },

  {
    slug: 'overs-notation',
    title: 'Overs Notation',
    type: 'definition',
    difficulty: 'beginner',
    category: 'scoring-and-scorecards',
    shortDescription:
      'Why 47.2 means 47 overs and 2 balls, and what goes wrong when it is treated as a decimal.',
    readMinutes: 3,
    order: 20,
    related: [
      { slug: 'over', type: 'requires_understanding' },
      { slug: 'how-to-read-a-cricket-score', type: 'part_of' },
      { slug: 'run-rate', type: 'used_in' },
      { slug: 'economy-rate', type: 'used_in' },
      { slug: 'required-run-rate', type: 'used_in' },
    ],
    sourceKeys: [{ key: 'wp-over', locator: 'Over (cricket)' }],
    sections: [
      {
        type: 'one_sentence',
        body: 'An overs figure is completed overs before the point and legal balls into the current over after it, so the fraction is out of six rather than out of ten.',
      },
      {
        type: 'how_it_works',
        body: `**47.2** is 47 completed overs plus 2 legal deliveries.

The digit after the point runs **.1 to .5**, and then the sixth ball completes the over, so **47.5** is followed by **48**. You will never see **.6**, **.7**, **.8** or **.9** in a valid overs figure, which is the quickest way to spot a bug in cricket software.

To convert to balls: **overs × 6 + balls**. So 47.2 becomes 47 × 6 + 2 = **284 balls**.

To convert balls back: divide by 6; the quotient is overs and the remainder is balls. 284 ÷ 6 = 47 remainder 2.`,
      },
      {
        type: 'common_misunderstandings',
        heading: 'What goes wrong if you treat it as a decimal',
        body: `Every one of these is a real error that appears in scoreboards, spreadsheets and code.

- **Subtraction.** Overs remaining in a 50-over innings after 47.2 is not 50 − 47.2 = 2.8. It is 300 − 284 = 16 balls, which is **2.4** overs.
- **Addition.** 8.2 + 3.5 is not 11.7. Seven balls is one over and one ball, so the answer is **12.1**.
- **Division.** An economy rate of 47 runs from 8.2 overs is 47 ÷ 8.333, not 47 ÷ 8.2. The first gives 5.64, the second 5.73.
- **Averaging.** The mean of 4.3 and 5.3 overs is not 4.8. Convert both to balls, average those, convert back.
- **Sorting and comparison** happen to work, since the notation is monotonic, which is why the bug often survives until someone does arithmetic.

The safe rule: **store and compute in balls, display in overs notation.**`,
      },
      {
        type: 'example',
        body: `A T20 innings is at **17.4**, having scored 148.

Balls bowled: 17 × 6 + 4 = **106**. Balls remaining: 120 − 106 = **14**, which is **2.2** overs.

Current run rate: 148 ÷ (106 ÷ 6) ≈ **8.38** an over.

If the target is 181, they need 33 from 14 balls, a required rate of 33 ÷ (14 ÷ 6) ≈ **14.14** an over.

Not one of those calculations used 17.4 as a number.`,
      },
      {
        type: 'key_takeaways',
        body: `- The digit after the point counts balls out of six.
- Valid values after the point are 1 to 5 only.
- Convert to balls before any arithmetic.
- Store balls, display overs.`,
      },
    ],
  },

  {
    slug: 'run-out-non-strikers-end',
    title: "Run Out at the Non-striker's End",
    type: 'dismissal',
    difficulty: 'intermediate',
    category: 'dismissals',
    alsoIn: ['laws-and-rules', 'terminology'],
    shortDescription:
      'A legitimate run out under Law 38, commonly called a Mankad, and no longer classed under unfair play.',
    readMinutes: 5,
    order: 60,
    ruleSensitive: true,
    sourceRevision: MCC_CODE,
    lastReviewedAt: REVIEWED,
    aliases: ['Mankad', 'Mankading', 'Backing Up Run Out', 'Non-striker Run Out'],
    related: [
      { slug: 'run-out', type: 'variation_of' },
      { slug: 'non-striker', type: 'requires_understanding' },
      { slug: 'batters-ground', type: 'requires_understanding' },
      { slug: 'crease-rules', type: 'related_to' },
      { slug: 'dead-ball', type: 'related_to' },
    ],
    sourceKeys: [
      { key: 'mcc-laws', locator: 'Law 38 (Run out)' },
      { key: 'wp-over', locator: 'Over (cricket)' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'The bowler may run out the non-striker who has left their ground before the ball would normally have been released, and it is scored as an ordinary run out.',
      },
      {
        type: 'the_law',
        body: `This is dealt with under **Law 38 (Run out)** in the current Code.

That location matters, because it changed. In earlier editions the same wording sat in **Law 41 (Unfair play)**. The MCC moved it to Law 38 in the 2022 revision of the 2017 Code, leaving the wording itself unchanged, explicitly to stop the dismissal being framed as unfair conduct by the bowler.

So the current position is unambiguous: this is a **run out**. It is recorded as one, it counts as one, and it is not an offence by the bowler.

The requirement on the batter is the other half. The non-striker is expected to remain in their ground until the ball would normally be expected to be released. Leaving early is what creates the opportunity; the batter is gaining ground they are not entitled to.`,
      },
      {
        type: 'how_it_works',
        body: `The bowler, in the act of delivering, does not release the ball and instead puts down the wicket at the non-striker's end. If the non-striker is out of their ground at that moment, they are out.

There is a cut-off. Once the bowler has passed the point at which the ball would normally have been released, the attempt is no longer available, and if they break the wicket after that the umpire calls dead ball.

The striker is unaffected. No delivery has been bowled, so the ball does not count towards the over.`,
      },
      {
        type: 'edge_cases',
        heading: 'Terminology',
        body: `The dismissal is widely called a **Mankad**, after Vinoo Mankad, the India bowler who ran out Bill Brown this way in a Test in 1947.

That name is worth understanding but not worth treating as the official term. It is an informal, retrospective label attached to a bowler who did nothing outside the Laws, and it is the reason the dismissal carried a stigma for decades. The correct description is what the scorecard says: **run out**.

You will still hear "Mankad" in commentary constantly, and it is a legitimate alias to search for. It is not the name of a Law.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**"It's against the spirit of cricket."** The MCC, which writes both the Laws and the Preamble on the Spirit of Cricket, moved it out of the unfair play Law specifically to settle that argument. The batter leaving early is the departure from the Laws.

**"The bowler has to warn the batter first."** No warning is required under the Laws.

**"It's a separate method of dismissal."** It is a run out, scored as a run out.

**"It's still under Law 41."** Not since the 2022 revision.`,
      },
      {
        type: 'key_takeaways',
        body: `- Governed by Law 38 (Run out) since the 2022 revision, having previously sat under unfair play.
- The non-striker must stay in their ground until the ball would normally be released.
- No warning is required, and it is scored as an ordinary run out.
- "Mankad" is an informal historical alias, not the Law's terminology.`,
      },
    ],
  },
];

/**
 * Every written cricket explainer.
 *
 * Split across files by category rather than kept in one, because a single file
 * covering four hundred concepts is unreviewable. The feature entries above are
 * the ones with hand-built templates and diagrams; the rest are assembled from
 * the shared section builders in `cricket-explainer-helpers.ts`.
 */
export const CRICKET_EXPLAINERS: ExplainerSeed[] = [
  ...CRICKET_FEATURE_EXPLAINERS,
  ...CRICKET_BASICS_AND_LAWS,
  ...CRICKET_DISMISSALS,
  ...CRICKET_FIELD_POSITION_EXPLAINERS,
  ...CRICKET_BOWLING,
  ...CRICKET_SPIN,
  ...CRICKET_BATTING,
  ...CRICKET_FIELDING,
  ...CRICKET_FORMATS_AND_STRUCTURE,
  ...CRICKET_TACTICS,
  ...CRICKET_STATISTICS,
  ...CRICKET_CONDITIONS,
  ...CRICKET_EQUIPMENT_AND_TERMS,
];
