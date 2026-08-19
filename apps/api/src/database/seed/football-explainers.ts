import type { ExplainerSeed, FormationShape, SourceSeed } from './explainer-types';

/**
 * Written football explainers.
 *
 * These override the taxonomy placeholders by slug and are the only rows that
 * reach the site. Everything else in `football-explainer-taxonomy.ts` stays a
 * draft until it is written here.
 *
 * ## On sourcing
 *
 * Rule explainers are written against the IFAB Laws of the Game rather than
 * from memory or from Wikipedia's summary of them. The Laws change between
 * editions, and a confidently wrong offside explanation is the worst thing this
 * page could contain, so those entries cite the Law number and the edition.
 *
 * Tactical concepts are harder to source and are written more carefully as a
 * result. Where a person is strongly associated with an idea the text says so;
 * it does not say they invented it, because tactical ideas are almost never
 * traceable to one originator and the claim is usually unverifiable.
 *
 * Analytics entries state explicitly where providers differ. Expected goals is
 * not one number: every provider trains its own model, and presenting one
 * methodology as the definition of the metric would be wrong.
 */

/**
 * Sources shared across explainers.
 *
 * Written into `content_source`, the same table the Overview uses, so a reader
 * checking a rule and a reader checking a date land on the same provenance
 * record rather than two parallel citation systems.
 */
export const FOOTBALL_EXPLAINER_SOURCES: SourceSeed[] = [
  {
    key: 'ifab-laws',
    provider: 'ifab',
    title: 'IFAB, Laws of the Game 2026/27',
    url: 'https://www.theifab.com/downloads/laws-of-the-game-202627-single-pages?l=en',
    license: 'IFAB',
  },
  {
    key: 'wp-offside',
    provider: 'wikipedia',
    title: 'Offside (association football)',
    url: 'https://en.wikipedia.org/wiki/Offside_(association_football)',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-xg',
    provider: 'wikipedia',
    title: 'Expected goals',
    url: 'https://en.wikipedia.org/wiki/Expected_goals',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-false-nine',
    provider: 'wikipedia',
    title: 'False 9',
    url: 'https://en.wikipedia.org/wiki/Forward_(association_football)#False_9',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-formation',
    provider: 'wikipedia',
    title: 'Formation (association football)',
    url: 'https://en.wikipedia.org/wiki/Formation_(association_football)',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-promotion-relegation',
    provider: 'wikipedia',
    title: 'Promotion and relegation',
    url: 'https://en.wikipedia.org/wiki/Promotion_and_relegation',
    license: 'CC BY-SA 4.0',
  },
];

/**
 * The 4-3-3, as coordinates.
 *
 * Percentages of a vertical half-pitch: `x` from the left touchline, `y` from
 * the team's own goal line. Structured rather than an image so the same numbers
 * render at any size, stay legible in both themes, and can carry an accessible
 * description that an image cannot.
 */
const SHAPE_4_3_3: FormationShape = {
  positions: [
    { label: 'GK', role: 'Goalkeeper', x: 50, y: 6 },
    { label: 'LB', role: 'Left-back', x: 14, y: 26 },
    { label: 'CB', role: 'Centre-back', x: 38, y: 22 },
    { label: 'CB', role: 'Centre-back', x: 62, y: 22 },
    { label: 'RB', role: 'Right-back', x: 86, y: 26 },
    { label: '6', role: 'Defensive midfielder', x: 50, y: 44 },
    { label: '8', role: 'Central midfielder', x: 30, y: 56 },
    { label: '8', role: 'Central midfielder', x: 70, y: 56 },
    { label: 'LW', role: 'Left winger', x: 12, y: 76 },
    { label: 'ST', role: 'Striker', x: 50, y: 82 },
    { label: 'RW', role: 'Right winger', x: 88, y: 76 },
  ],
};

/**
 * The written entries.
 *
 * Order within the array does not matter; `order` and category membership drive
 * presentation. Slugs must match the taxonomy exactly, since these override by
 * slug and a mismatch would silently create a second concept.
 */
export const FOOTBALL_EXPLAINERS: ExplainerSeed[] = [
  // ── Pressing ──────────────────────────────────────────────────────────────
  {
    slug: 'pressing',
    title: 'Pressing',
    type: 'tactical_concept',
    difficulty: 'beginner',
    category: 'pressing-and-transitions',
    alsoIn: ['tactics-and-styles'],
    shortDescription:
      'Actively trying to win the ball back rather than waiting for it, and the coordination that separates it from chasing.',
    readMinutes: 4,
    order: 10,
    related: [
      { slug: 'high-press', type: 'variation_of' },
      { slug: 'cover-shadow', type: 'used_in' },
      { slug: 'pressing-trigger', type: 'used_in' },
      { slug: 'low-block', type: 'contrasts_with' },
      { slug: 'ppda', type: 'measured_by' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'Applying coordinated pressure to the player with the ball, and to their passing options, in order to win possession back.',
      },
      {
        type: 'simple_explanation',
        body: `Every team has to get the ball back. Broadly there are two ways: wait in shape until the opponent comes to you, or go and take it.

Pressing is the second. Players move toward the ball rather than retreating, closing the space and the time the opponent has to think.

The distinction that matters is coordination. One player sprinting at the ball while the other ten hold position is not pressing, and is usually worse than doing nothing, because the runner has left a hole and closed nothing.`,
      },
      {
        type: 'how_it_works',
        body: `**A trigger starts it.** Pressing continuously is impossible, so teams press on cues: a backward pass, a heavy touch, a ball played to a weaker passer, a player receiving facing their own goal.

**The nearest player engages, the rest shift.** The press is a shape moving together, not one player leaving it. The team compresses toward the ball, which is why pressing and compactness are the same subject.

**Passing options are closed, not just the ball.** A player who approaches from the correct angle blocks the next pass with their body while closing the current one, which is the cover shadow.

**There is usually a destination.** Most presses aim to force the ball somewhere specific, most often a touchline, where the sideline removes half the options.`,
      },
      {
        type: 'why_it_matters',
        body: `Winning the ball higher up the pitch means a shorter route to goal and fewer defenders in the way. That is the direct benefit.

The indirect benefit is often larger. A team expecting to be pressed makes quicker, less accurate decisions, which produces turnovers that never appear as a tackle in the statistics.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**Pressing is not the same as a high press.** Pressing is the behaviour; a high press is doing it in the opponent's half. Teams press in a mid-block and a low block too.

**Pressing is not simply running more.** The best presses often involve less running, because the shape closes options before a sprint is needed.

**A press is not always high-risk.** Pressing in a mid-block is one of the most balanced defensive approaches there is.`,
      },
      {
        type: 'key_takeaways',
        body: `- Pressing is coordinated pressure, not individual chasing.
- Triggers decide when; cover shadows decide how.
- Where you press is a separate choice from whether you press.
- PPDA measures how often, not how well.`,
      },
    ],
  },

  // ── High Defensive Line ───────────────────────────────────────────────────
  {
    slug: 'high-defensive-line',
    title: 'High Defensive Line',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'defensive-concepts',
    shortDescription:
      'Defending with the back line pushed up the pitch, compressing the game and accepting the space behind.',
    readMinutes: 4,
    order: 20,
    related: [
      { slug: 'defensive-line', type: 'variation_of' },
      { slug: 'offside', type: 'requires_understanding' },
      { slug: 'high-press', type: 'related_to' },
      { slug: 'compactness', type: 'related_to' },
      { slug: 'low-block', type: 'contrasts_with' },
      { slug: 'sweeper-keeper', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'A defence that holds its line well up the pitch, often near the halfway line, rather than dropping toward its own goal.',
      },
      {
        type: 'simple_explanation',
        body: `The back four can defend anywhere between their own six-yard box and the halfway line. A high line chooses the far end of that range.

Pushing up squeezes the opponent into a smaller area and keeps the team compact, because the midfield and attack do not have to drop with it.

What it gives away is obvious: a large space between the defence and the goalkeeper. The whole approach is a bet that the space will be harder to use than it looks.`,
      },
      {
        type: 'how_it_works',
        body: `The line depends on the offside law. Because a player is offside relative to the second-last opponent, moving the line forward moves the offside line with it, and an attacker who starts their run early is penalised rather than through.

Three things make it viable.

**Pressure on the ball.** A high line without pressure is indefensible: an unpressured passer will find the space behind eventually. This is why a high line and a press almost always appear together.

**A goalkeeper who sweeps.** The space behind the line has to belong to someone, and a keeper willing to leave their area covers it.

**Simultaneous movement.** The line steps up together. One defender a metre deeper than the rest plays the whole opposition attack onside.`,
      },
      {
        type: 'why_it_matters',
        body: `Compactness is the real prize. Holding the line high keeps the distance between defence and attack short, and a compact team defends a smaller area with the same eleven players.

It also changes where turnovers happen. A high line means the whole team is further forward, so a ball won is won closer to the opponent's goal.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**A high line is not an offside trap.** The trap is a deliberate step forward timed to catch a runner. A high line is a starting position, and most teams playing one are not trying to spring anything.

**Pace in the defenders helps but is not the requirement.** Organisation and pressure on the ball matter more; a quick centre-back covers a mistake rather than preventing one.

**Being caught out is not proof it was wrong.** The line concedes a specific kind of chance by design, and the question is whether it prevented more than it allowed.`,
      },
      {
        type: 'key_takeaways',
        body: `- The offside law is what makes a high line workable.
- It requires pressure on the ball to be viable at all.
- The goalkeeper becomes the last line of cover.
- Its purpose is compactness, not aggression.`,
      },
    ],
  },

  // ── Number 8 ──────────────────────────────────────────────────────────────
  {
    slug: 'number-8',
    title: 'Number 8',
    type: 'position_role',
    difficulty: 'intermediate',
    category: 'positions-and-roles',
    shortDescription:
      'The central midfielder who covers ground between both boxes, linking defence and attack without a fixed station.',
    aliases: ['No. 8', 'Eight'],
    readMinutes: 4,
    order: 50,
    related: [
      { slug: 'central-midfielder', type: 'variation_of' },
      { slug: 'number-10', type: 'contrasts_with' },
      { slug: 'defensive-midfielder', type: 'contrasts_with' },
      { slug: '4-3-3', type: 'used_in' },
      { slug: 'half-space', type: 'used_in' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'A central midfielder who operates between the defensive midfielder and the attack, contributing in both penalty areas.',
      },
      {
        type: 'simple_explanation',
        body: `In a midfield three, the deepest player is the six and the two ahead of them are the eights.

An eight has no fixed station. They drop to help build, carry the ball forward, arrive in the box late, and get back to defend. The role is defined by covering ground between the two boxes rather than by occupying a zone.

It is the least glamorous of the three central roles and often the one that decides whether the shape works.`,
      },
      {
        type: 'movement',
        body: `The characteristic movement is forward into the half-space, arriving rather than waiting. Because the wide forward holds the touchline, the channel inside them is open, and the eight is usually the player who runs into it.

Out of possession the movement reverses at the same speed. An eight who arrives in the box and does not recover leaves the six defending the centre alone.`,
      },
      {
        type: 'responsibilities',
        body: `**Progress the ball**, by carrying or by passing between the lines.

**Arrive in the box.** Runs from midfield are hard to track because defenders are watching the ball, and the eight is the main source of them.

**Press and cover.** In most pressing schemes the eights jump forward onto opposition midfielders.

**Support the six.** When the eight goes, the six holds; when both go, the defence is exposed.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**An eight is not a number ten who defends.** A ten works in the space between the lines; an eight works between the boxes. The difference is range, not just diligence.

**The number is not the role.** Squad numbering separated the two long ago.

**It is not a "box-to-box" synonym exactly.** Box-to-box describes a physical profile; the eight is a positional role in a midfield three, and it can be filled by a technical player as easily as an athletic one.`,
      },
      {
        type: 'key_takeaways',
        body: `- Defined by range between the boxes, not by a zone.
- Usually the player attacking the half-space.
- Its defensive discipline is what protects the six.
- Common in a midfield three, particularly a 4-3-3.`,
      },
    ],
  },

  // ── Positional Play ───────────────────────────────────────────────────────
  {
    slug: 'positional-play',
    title: 'Positional Play',
    subtitle: 'Juego de Posición',
    type: 'tactical_concept',
    difficulty: 'advanced',
    category: 'tactics-and-styles',
    shortDescription:
      'An approach organised around occupying space in a fixed pattern, so that passing options exist before the ball arrives.',
    aliases: ['Juego de Posicion', 'Juego de Posición'],
    readMinutes: 5,
    order: 20,
    related: [
      { slug: 'half-space', type: 'part_of' },
      { slug: 'possession-football', type: 'contrasts_with' },
      { slug: 'positional-superiority', type: 'part_of' },
      { slug: 'width', type: 'used_in' },
      { slug: 'false-nine', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'A method of organising a team around occupying specific zones, so that a player receiving the ball always has predictable options around them.',
      },
      {
        type: 'simple_explanation',
        body: `Most attacking is organised around the ball: players move toward it, and the shape follows play.

Positional play inverts that. Players occupy assigned areas of the pitch and hold them, and the ball moves between those positions. The structure comes first, and it stays roughly the same whether the ball is on the left or the right.

The point is predictability for your own side. If a player knows where their team-mates will be before they receive, they can decide what to do with the ball while it is still travelling.`,
      },
      {
        type: 'how_it_works',
        body: `The pitch is commonly divided into five vertical lanes, and the guiding rules concern how those lanes are occupied.

**No more than two players in the same lane, and no three in the same horizontal line.** This prevents the clustering that gives a defender two markers for the price of one.

**Width is held permanently.** Somebody stands on each touchline whether or not the ball is near, which stretches the defence horizontally.

**Occupy the half-spaces.** The channels between centre and wing are where receiving is most valuable, so they are staffed deliberately.

**Create a spare player.** Much of the movement exists to produce a numerical or positional advantage in a specific area, and then to move the ball there.

Rest defence follows from the same structure: because positions are held rather than chased, players are already distributed sensibly when possession is lost.`,
      },
      {
        type: 'historical_context',
        body: `The ideas are strongly associated with the Dutch and Spanish coaching traditions, and the vocabulary comes from Spanish football, which is why the phrase *juego de posición* is often used untranslated.

They are not the invention of any single coach, and claims that they are usually collapse a long lineage into one name. What can be said accurately is that the approach was developed and popularised through those traditions, and that several coaches who worked within them became closely identified with it.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**It is not the same as possession football.** Keeping the ball is a consequence, not the aim. A positional side that can attack directly will do so; the structure is about where players stand, not how many passes they make.

**It is not rigid.** Positions are occupied rather than owned, and players rotate through them. What stays fixed is which spaces are filled, not who fills them.

**It is not only for teams with better players.** The structure is designed to create advantages, which matters most when individual quality does not settle matters on its own.`,
      },
      {
        type: 'key_takeaways',
        body: `- Structure first, ball second.
- Spaces are occupied permanently, by whoever is nearest.
- The aim is a spare player somewhere, not possession for its own sake.
- Half-spaces and held width are the two defining features.`,
      },
    ],
  },

  // ── Cover Shadow ──────────────────────────────────────────────────────────
  {
    slug: 'cover-shadow',
    title: 'Cover Shadow',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'pressing-and-transitions',
    shortDescription:
      'The area a pressing player blocks with their body, closing a passing lane while approaching the ball.',
    readMinutes: 3,
    order: 40,
    related: [
      { slug: 'pressing', type: 'part_of' },
      { slug: 'high-press', type: 'used_in' },
      { slug: 'pressing-trap', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'The space behind a pressing player, into which the ball cannot easily be passed because their body is in the way.',
      },
      {
        type: 'simple_explanation',
        body: `A player running at the ball casts a shadow behind them, in the sense that any team-mate of the ball carrier standing directly behind them is unreachable by a straight pass.

Good pressers choose their angle so that the shadow falls on the most dangerous option. One player then closes two things at once: the ball, and the pass they most wanted to prevent.

It is why the angle of the run matters more than its speed.`,
      },
      {
        type: 'how_it_works',
        body: `A forward pressing a centre-back can approach from directly in front, closing the ball but leaving both passing options open. Or they can curve their run so that the defensive midfielder sits in their shadow, closing the ball and that pass together.

The second approach lets a team press with fewer players. Two forwards using their shadows correctly can shut four passing options, which is what makes a front-three press viable against a back four.

The cost is that the shadow only covers one lane. A ball played around it, or a receiver who moves out of it, reopens the option, so shadows have to be maintained as the ball moves rather than set once.`,
      },
      {
        type: 'key_takeaways',
        body: `- The shadow is the passing lane a presser blocks with their body.
- It lets one player close two options.
- Angle of approach matters more than speed.
- It must be adjusted continuously as players move.`,
      },
    ],
  },

  // ── Compactness ───────────────────────────────────────────────────────────
  {
    slug: 'compactness',
    title: 'Compactness',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'defensive-concepts',
    shortDescription:
      'Keeping the distances between players short, so eleven defenders cover a smaller area than the pitch gives the attack.',
    readMinutes: 3,
    order: 40,
    related: [
      { slug: 'low-block', type: 'used_in' },
      { slug: 'high-defensive-line', type: 'used_in' },
      { slug: 'defensive-shape', type: 'related_to' },
      { slug: 'pressing', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'Keeping the team’s lines close together vertically and horizontally, so there is no space between them worth passing into.',
      },
      {
        type: 'simple_explanation',
        body: `A pitch is large and a team has eleven players. Spread them evenly and there are gaps everywhere; bunch them together and there are no gaps, but a great deal of unguarded grass elsewhere.

Compactness is the choice to accept the unguarded grass. The team keeps its lines close and shifts as a unit, conceding space far from the ball in order to have none near it.

The far side of the pitch is deliberately left open. A switch of play takes time, and the shape moves across while the ball is in the air.`,
      },
      {
        type: 'how_it_works',
        body: `**Vertically**, the aim is a short distance between the defensive line and the midfield line, commonly cited as fifteen to twenty metres. Beyond that the space between the lines becomes usable, and it is the most dangerous space on the pitch.

**Horizontally**, the team shifts toward the ball rather than covering the full width, so the ball side is crowded.

Both depend on the whole team moving together. A midfield that presses while the defence drops stretches the team, which produces exactly the gap compactness exists to close.

Where the compact block sits is a separate decision. A high line and a low block can be equally compact; they differ in territory, not in structure.`,
      },
      {
        type: 'key_takeaways',
        body: `- Compactness closes space near the ball by conceding it elsewhere.
- Vertical distance between the lines matters most.
- The team must move as a unit or the compactness is lost.
- It is independent of how high the team defends.`,
      },
    ],
  },

  // ── Offside ───────────────────────────────────────────────────────────────
  // Written against Law 11 of the IFAB Laws of the Game 2026/27, pp. 109-112.
  // Law 11 is unchanged in this edition; it appears in neither the summary nor
  // the detailed list of Law changes.
  {
    slug: 'offside',
    title: 'Offside',
    type: 'rule',
    difficulty: 'beginner',
    category: 'rules-and-laws',
    shortDescription:
      'How the offside law works, when a player commits an offence and the situations where it cannot apply.',
    isStartHere: true,
    isFeatured: true,
    readMinutes: 7,
    order: 10,
    sourceKeys: [{ key: 'ifab-laws', locator: 'Law 11, pp. 109-112' }, { key: 'wp-offside' }],
    related: [
      { slug: 'assistant-referee', type: 'related_to' },
      { slug: 'var', type: 'related_to' },
      { slug: 'semi-automated-offside', type: 'related_to' },
      { slug: 'high-defensive-line', type: 'related_to' },
      { slug: 'through-ball', type: 'related_to' },
      { slug: 'indirect-free-kick', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'A player is penalised for offside if, at the moment a team-mate plays the ball, they are ahead of both the ball and the second-last opponent in the opposition half, and they then become involved in play.',
      },
      {
        type: 'simple_explanation',
        body: `Two separate things have to be true. Being in an offside position is not an offence on its own; it becomes one only if the player then gets involved.

**Position.** At the instant a team-mate plays the ball, the attacker is in the opposition half and closer to the goal line than both the ball and the second-last opponent. Level is onside.

**Involvement.** Having been in that position, the player touches the ball, challenges an opponent, or otherwise affects an opponent's ability to play it.

A player can stand in an offside position for the whole match and never commit an offence, provided they never become involved.`,
      },
      {
        type: 'the_law',
        heading: 'What the Law says',
        body: `Law 11 opens by making the distinction explicit: **"It is not an offence to be in an offside position."**

A player is in an offside position if **any part of the head, body or feet** is in the opponents' half, excluding the halfway line, *and* any part of the head, body or feet is nearer the opponents' goal line than both the ball and the second-last opponent.

Two details in that wording do a great deal of work.

**Arms do not count.** The Law states that the hands and arms of all players, including goalkeepers, are not considered, and fixes the boundary precisely: the upper limit of the arm is in line with the bottom of the armpit. That is the same line used for handball.

**Level is onside.** A player is not in an offside position if level with the second-last opponent, or level with the last two opponents.

Being in that position becomes an offence only on becoming involved in active play, which the Law defines in three ways:

- **Interfering with play**, meaning playing or touching a ball passed or touched by a team-mate.
- **Interfering with an opponent**, by clearly obstructing their line of vision, challenging them for the ball, clearly attempting to play a ball which is close when this impacts on an opponent, or making an obvious action which clearly impacts on their ability to play the ball.
- **Gaining an advantage** by playing the ball or interfering with an opponent after it has rebounded or been deflected off a goalpost, crossbar, match official or an opponent, or been deliberately saved by any opponent.`,
      },
      {
        type: 'how_it_works',
        heading: 'The moment of judgement',
        body: `Position is assessed when the ball is played, not when it arrives. A player level at the pass and five metres clear by the time they receive it is onside, and this accounts for a large share of decisions that look wrong at full speed.

The Law is precise about which instant counts: the **first** point of contact of the play or touch is used, except when the ball is thrown by a goalkeeper, where the **last** point of contact applies.

The reference is the **second-last opponent**, not "the last defender". Usually the goalkeeper is the last and a defender the second-last, but the Law does not privilege the goalkeeper, and if a keeper has come forward then two outfield players may be the last two.

Semi-automated offside technology, formally recognised in the 2026/27 Laws, addresses only the positional half of this. It sends offside position information to the video assistant referee, and in an advanced version directly to the assistant referees. Whether an offence occurred remains a judgement for the officials.`,
      },
      {
        type: 'edge_cases',
        heading: 'Deliberate play, and why it resets offside',
        body: `If a player in an offside position receives the ball from an opponent who **deliberately played** it, they have not gained an advantage and there is no offence. If the opponent made a **deliberate save**, the offside stands.

The Law defines deliberate play as a player having control of the ball with the possibility of passing to a team-mate, gaining possession, or clearing it. Crucially, it adds that an inaccurate or unsuccessful pass, attempt to gain possession or clearance **does not** negate deliberate play. A defender who tries to clear and miscues has still deliberately played the ball.

The Law lists indicators of control: the ball travelled from distance with a clear view of it; it was not moving quickly; its direction was not unexpected; the player had time to coordinate their body movement rather than stretching or jumping instinctively; and a ball on the ground is easier to play than one in the air.

A save is defined as stopping, or attempting to stop, a ball going into or very close to the goal with any part of the body except the hands and arms, unless it is the goalkeeper inside their own penalty area. Any player can therefore make a save, not only the keeper.

Deliberate handball by an opponent counts as deliberate play, so it resets the offside. A deliberate save does not.`,
      },
      {
        type: 'example',
        body: `A forward stands two metres beyond the second-last defender as a team-mate shoots. They make no move toward the ball and take no part. The shot goes in. No offence: an offside position without involvement.

Same position, but the shot rebounds off the post to the forward, who scores. That is an offence, because gaining an advantage explicitly includes playing a ball rebounding off the goalpost.

Same position again, but a defender heads a cleared ball straight to the forward, having had a clear sight of it and time to control the header. That is deliberate play, so there is no offence, even if the defender intended the header to go somewhere else entirely.`,
      },
      {
        type: 'why_it_matters',
        body: `Without the law, the most efficient way to attack would be to leave a player standing by the opposition goal and pass to them. Offside is what forces attacks to be built rather than simply delivered.

It also produces the defensive line. Because position is judged relative to the second-last opponent, defenders can move up together and compress the pitch, which is the basis of most modern defensive organisation. The high line, the offside trap and the stepped-up back four all exist because of this one law.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**"He was behind the last defender."** The reference is the second-last opponent. Where the goalkeeper is advanced, the last two opponents may both be defenders.

**"His arm was ahead."** Arms are excluded for every player, goalkeepers included, and the boundary is the bottom of the armpit.

**"Level is offside."** Level with the second-last opponent, or with the last two, is onside.

**"You can't be offside in your own half."** Correct, but by definition rather than exemption: offside position requires being in the opponents' half, and the halfway line itself is excluded.

**"You can't be offside from a free kick."** You can. The Law exempts exactly three restarts: a goal kick, a throw-in and a corner kick. Free kicks are not among them.

**"A deflection always resets it."** A deflection does not; deliberate play does. The distinction is whether the defender had control, and a failed clearance still counts as deliberate play.`,
      },
      {
        type: 'sanctions',
        heading: 'The restart',
        body: `An offside offence is punished with an **indirect free kick where the offence occurred**, including when that is in the offending player's own half.

That last clause surprises people. A player who was in an offside position in the opposition half can run back and touch the ball in their own half, and the free kick is taken from where they touched it.`,
      },
      {
        type: 'key_takeaways',
        body: `- Offside position and offside offence are two separate tests.
- Position is judged when the ball is played, not when it arrives.
- The reference is the second-last opponent; level is onside.
- Arms never count, for anyone.
- Only a goal kick, throw-in and corner kick are exempt.
- Deliberate play by an opponent resets it; a deliberate save does not.
- The restart is an indirect free kick.`,
      },
    ],
  },

  // ── Handball ──────────────────────────────────────────────────────────────
  // Written against Law 12 of the Laws of the Game 2026/27, pp. 115-124.
  // Note that the offence of an attacker *creating* a goal-scoring opportunity
  // after accidental handling no longer exists in the Laws. Many secondary
  // sources still carry that older formulation.
  {
    slug: 'handball',
    title: 'Handball',
    type: 'rule',
    difficulty: 'beginner',
    category: 'rules-and-laws',
    shortDescription:
      'When contact between the ball and a hand or arm is an offence, when it is not, and why so many decisions look inconsistent.',
    readMinutes: 6,
    order: 20,
    sourceKeys: [{ key: 'ifab-laws', locator: 'Law 12, pp. 115-124' }],
    related: [
      { slug: 'fouls', type: 'related_to' },
      { slug: 'penalty-kick', type: 'related_to' },
      { slug: 'var', type: 'related_to' },
      { slug: 'red-card', type: 'related_to' },
      { slug: 'goalkeeper', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'Handball is deliberately touching the ball with the hand or arm, or touching it when the arm has made the body unnaturally bigger, plus any goal scored off the hand or arm even accidentally.',
      },
      {
        type: 'simple_explanation',
        body: `The Law is explicit that **not every touch of the hand or arm is an offence**. That single sentence explains most of the apparent inconsistency in how handball is given.

Three situations are offences. Moving the hand or arm toward the ball. Having the arm in a position that made the body unnaturally bigger. And scoring a goal off the hand or arm, whether it was deliberate or not.

Everything else, a ball striking an arm held in a natural position, is not an offence, however unlucky it looks.`,
      },
      {
        type: 'the_law',
        heading: 'What the Law says',
        body: `Law 12 sets the boundary first: for handball purposes, the **upper limit of the arm is in line with the bottom of the armpit**. Contact above that line is the shoulder, and the shoulder is not the arm.

It then lists three offences. It is an offence if a player:

- **deliberately touches the ball** with their hand or arm, for example by moving the hand or arm toward the ball;
- **touches the ball when it has made their body unnaturally bigger**;
- **scores in the opponents' goal** directly from their hand or arm, even if accidental and including by the goalkeeper, or immediately after the ball has touched their hand or arm, even if accidental.

The Law defines unnaturally bigger rather than leaving it to taste: a player is considered to have made their body unnaturally bigger when the position of the hand or arm **is not a consequence of, or justifiable by, the player's body movement for that specific situation**. It adds the rationale, that by holding the arm in such a position the player takes the risk of it being hit.

That is the whole list. There are three offences, not four.`,
      },
      {
        type: 'how_it_works',
        heading: 'Accidental handling, and the goal exception',
        body: `Accidental contact is generally not punished. The exception concerns goals, and only goals.

A goal scored **directly** from the hand or arm is disallowed even when accidental, including when the goalkeeper scores it. So is a goal scored **immediately after** the ball has touched the scorer's hand or arm.

There is no equivalent provision for creating a chance. An attacker whose arm is accidentally struck and who then sets up a team-mate has committed no offence under the current Law. That offence existed in earlier editions and was removed; secondary sources frequently still describe it, which is a common source of confusion.

"Immediately" is the operative word in the goal case, and the Law does not quantify it.`,
      },
      {
        type: 'edge_cases',
        heading: 'The goalkeeper',
        body: `Outside their own penalty area, the goalkeeper has exactly the same handling restrictions as any other player.

Inside it, illegal handling by the goalkeeper produces an **indirect free kick and no card**. The specific cases are touching the ball with the hand or arm after releasing it and before it has touched another player, and touching it with the hand or arm after it has been deliberately kicked to them by a team-mate or received directly from a team-mate's throw-in, unless they have clearly kicked or attempted to kick it to release it into play.

Separately, and often confused with handling, a goalkeeper who controls the ball with their hands or arms for **more than eight seconds** concedes a **corner kick**, not a free kick. The referee visually counts down the last five seconds with a raised hand.`,
      },
      {
        type: 'sanctions',
        heading: 'Restarts and cards',
        body: `A handball offence is a **direct free kick**, or a penalty kick if committed inside the offender's own penalty area. The exception is the goalkeeper inside their own penalty area, which is an indirect free kick.

The disciplinary outcome turns on deliberateness and location:

- **Deliberate** handball denying a goal or an obvious goal-scoring opportunity is a **red card**, wherever it occurs, except for a goalkeeper inside their own penalty area.
- **Non-deliberate** handball denying a goal or an obvious goal-scoring opportunity is a **red card if outside** the player's own penalty area, but only a **caution** where it happens inside and a penalty kick is awarded.
- Handling to interfere with or stop a promising attack is a caution, except where a penalty is awarded for non-deliberate handball.
- Handling in an attempt to score is a caution, whether or not it succeeds.`,
      },
      {
        type: 'example',
        body: `A defender slides with an arm planted on the ground to support their body and the ball strikes it. The arm's position is justifiable by the movement, so it is not unnaturally bigger, and there is no offence.

A defender jumps to block a cross with both arms raised away from the body. That position is not a consequence of the jump, so it is an offence, and inside the area it is a penalty.

A striker's shoulder deflects a cross into the net. The contact is above the bottom of the armpit, so it is not the arm, and the goal stands.

The same cross strikes the striker's forearm and goes in. The goal is disallowed even though the contact was clearly accidental.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**"Ball to hand is never given."** Mostly true but not a rule. If the arm was in a position not justifiable by the player's movement, the contact is an offence whatever the player intended.

**"Any handball in the box is a penalty."** Only if it is one of the three listed offences.

**"Accidental handball in the build-up cancels the goal."** Only if the ball touched the scorer's own hand or arm, directly or immediately before. An accidental touch by a team-mate earlier in the move is not an offence.

**"It hit his arm, so it's handball."** The boundary is the bottom of the armpit. Shoulder contact is not handball, and a good deal of contact that looks like an arm is shoulder.

**"The goalkeeper can hold the ball as long as they like."** Eight seconds, and the penalty is a corner kick.`,
      },
      {
        type: 'key_takeaways',
        body: `- Three offences: deliberate contact, unnaturally bigger, or a goal off the hand or arm.
- The arm ends at the bottom of the armpit.
- Accidental handling matters only for goals, not for creating chances.
- Deliberate versus non-deliberate, and where it happened, decide red or yellow.
- Goalkeepers are ordinary players outside their own area.`,
      },
    ],
  },

  // ── VAR ───────────────────────────────────────────────────────────────────
  // Written against the VAR protocol in the Laws of the Game 2026/27,
  // pp. 153-160, plus Law 5.2 (p. 73) and Law 6.5 (p. 87).
  //
  // The 2026/27 edition expanded the reviewable categories from four to five.
  // Anything written from memory or from an older source will say four, and
  // will also miss that a clearly incorrect second caution is now reviewable.
  {
    slug: 'var',
    title: 'VAR',
    subtitle: 'Video Assistant Referee',
    type: 'rule',
    difficulty: 'beginner',
    category: 'refereeing-and-technology',
    shortDescription:
      'What the video assistant referee can and cannot review, the threshold for intervening, and who takes the final decision.',
    aliases: ['Video Assistant Referee', 'Video Ref'],
    isStartHere: true,
    readMinutes: 7,
    order: 40,
    sourceKeys: [{ key: 'ifab-laws', locator: 'VAR protocol, pp. 153-160; Law 5.2, p. 73' }],
    related: [
      { slug: 'referee', type: 'requires_understanding' },
      { slug: 'avar', type: 'related_to' },
      { slug: 'on-field-review', type: 'part_of' },
      { slug: 'semi-automated-offside', type: 'related_to' },
      { slug: 'offside', type: 'related_to' },
      { slug: 'goal-line-technology', type: 'contrasts_with' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'A match official with access to replay footage who may assist the referee only where there has been a clear and obvious error, or a serious missed incident, in one of five defined categories.',
      },
      {
        type: 'simple_explanation',
        body: `VAR is not a second referee and does not review the match. It watches for a small set of specific mistakes.

Two things limit it. The mistake has to fall into one of five listed categories, and it has to be a **clear and obvious error** or a **serious missed incident**. A decision that was merely arguable stands.

The referee also has to decide first. VAR cannot be used to avoid making a call, and only the referee can start a review or take the final decision.`,
      },
      {
        type: 'the_law',
        heading: 'The five reviewable categories',
        body: `For 2026/27 the protocol lists **five** categories. It was four in previous editions, and the change is easy to miss:

**Goal or no goal.** Including an attacking offence in the build-up, the ball having gone out of play beforehand, and offences at a penalty kick.

**Penalty or no penalty.** Including an attacking offence in the build-up, the location of the offence relative to the penalty area, a penalty wrongly awarded, and a penalty offence not penalised.

**Red cards**, which now expressly includes **a clearly incorrect second caution**. The category was previously limited to direct red cards.

**Mistaken identity**, where a card has gone to the wrong player. This now covers the wrong player of **either** team, not only the offending side.

**A clearly incorrectly awarded corner kick**, but only if the decision can be changed immediately and without delaying the restart. This one is a **competition option** rather than universal, and it is the only principle in the protocol that does not apply in every VAR match. If the corner is taken quickly, the decision stands.`,
      },
      {
        type: 'how_it_works',
        heading: 'Check, then review',
        body: `Every potential goal, penalty, red card or mistaken identity is automatically **checked**. Most checks are silent: if nothing suggests a clear and obvious error, the VAR says nothing and play continues, which is why most checks are invisible.

If a check does suggest a probable error, the VAR communicates it, and the referee decides whether to begin a **review**. There are two kinds:

**On-field review.** The referee goes to the pitchside monitor and watches the footage before deciding. The protocol says this is appropriate for **subjective** decisions: the intensity of a challenge, interference at offside, handball considerations.

**VAR-only review.** The referee decides from their own perception plus the VAR's information, without watching a replay. This suits **factual** decisions: the position of a player or an offence, the point of contact, whether something was inside the area, whether the ball was out. An on-field review can still be used for a factual decision where it helps manage the match or sell a crucial late call.

At the end of **both** kinds, the referee must show the television signal and then the decision. The signal is not exclusive to on-field reviews.

There is no time limit. The protocol states plainly that accuracy matters more than speed.`,
      },
      {
        type: 'in_practice',
        heading: 'Who decides',
        body: `Only the referee can initiate a review. The VAR and the other officials can recommend one, and nothing more.

The final decision is always the referee's, whether taken on the VAR's information or after an on-field review. The protocol gives the VAR the same status as any other match official: an assistant, not an authority.

The referee must also make an initial decision as though there were no VAR, including any card, except where the incident was genuinely missed. Giving no decision and leaving it to the VAR is expressly not permitted, on the grounds that it produces indecisive officiating and collapses if the technology fails.`,
      },
      {
        type: 'what_it_does_not_tell_you',
        heading: 'What cannot be reviewed',
        body: `**Restart decisions once play has restarted.** Throw-ins and corners cannot be changed after the restart, so they cannot be reviewed. The corner-kick category exists precisely because it has to be corrected before the kick is taken.

**Almost everything, after a restart.** Once play has restarted, the referee may only review a case of mistaken identity, or a potential sending-off for violent conduct, spitting, biting, or extremely offensive, insulting or abusive actions.

**Ordinary yellow cards.** Cautions are reviewable only for mistaken identity, or where a second caution was clearly incorrect.

**The offence itself, in a mistaken-identity review.** Only the identity of the offender is reviewable there.

It is also worth knowing that a match is not invalidated by a VAR technology malfunction, by a wrong decision involving the VAR, by a decision not to review, or even by the review of a non-reviewable situation.`,
      },
      {
        type: 'edge_cases',
        heading: 'Semi-automated offside',
        body: `The 2026/27 Laws formally permit competitions to use technology to assist with offside, naming semi-automated offside technology.

What it does is narrow and worth stating precisely: it **immediately sends offside position information** to the video assistant referee, and in an advanced version directly to the assistant referees. It does not decide whether an offence was committed. Whether a player interfered with play or an opponent remains a judgement for the officials, and the protocol treats interference at offside as a subjective decision suited to an on-field review.

Its use is a competition option, not a requirement. The Laws use the term semi-automated throughout; there is no "automated offside" in the Laws.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**"There are four reviewable categories."** Five, since the 2026/27 edition.

**"VAR decides."** VAR recommends. The referee decides, always.

**"Second yellows can't be reviewed."** A clearly incorrect second caution is now reviewable.

**"Any clear mistake can be corrected."** Only within the five categories, and only where the error is clear and obvious. An arguable decision stands however long the replay runs.

**"The referee should just look at the screen every time."** The protocol assigns on-field reviews to subjective decisions and expects factual ones to be handled without them.

**"VAR takes too long, there's a limit."** There is expressly no time limit.`,
      },
      {
        type: 'key_takeaways',
        body: `- Five categories, one of which (corners) is a competition option.
- The threshold is a clear and obvious error or a serious missed incident.
- The referee must decide first and decides last.
- On-field reviews are for subjective calls, VAR-only for factual ones.
- The television signal is shown after both kinds of review.
- Semi-automated offside supplies position only, not the offence.`,
      },
    ],
  },

  // ── 4-3-3 ─────────────────────────────────────────────────────────────────
  {
    slug: '4-3-3',
    title: '4-3-3',
    type: 'formation',
    difficulty: 'beginner',
    category: 'formations',
    shortDescription:
      'Four defenders, three midfielders and a front three: the shape that gives a team natural width and a spare midfielder.',
    isStartHere: true,
    readMinutes: 6,
    order: 20,
    sourceKeys: [{ key: 'wp-formation' }],
    related: [
      { slug: 'winger', type: 'used_in' },
      { slug: 'number-8', type: 'used_in' },
      { slug: 'false-nine', type: 'variation_of' },
      { slug: 'high-press', type: 'related_to' },
      { slug: 'half-space', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'Four defenders, three central midfielders and three forwards, with the wide forwards holding the touchlines.',
      },
      {
        type: 'basic_structure',
        body: `Read from the back: a goalkeeper, a back four of two centre-backs and two full-backs, a midfield three, and a front three of two wide forwards either side of a central striker.

The midfield three is usually one deeper player and two ahead of them, though some teams invert it. The deeper player is commonly called the six, the two ahead the eights.

The defining feature is the front three. Because the wide forwards start high and wide, the shape occupies the full width of the pitch before anyone has moved.`,
      },
      {
        type: 'in_possession',
        structuredData: SHAPE_4_3_3,
        body: `The wide forwards pin the opposition full-backs. A winger standing on the touchline cannot be ignored, so the full-back marking them cannot tuck inside to help, and the space between the opposition centre-back and full-back stays open.

That space is the half-space, and it is where the eights arrive. The midfield three gives one player to screen in front of the defence and two to push forward, which is why the shape produces so many runs into the box from midfield.

Full-backs decide the character of the attack. Overlapping outside the winger gives width and crosses; underlapping inside them gives an extra body in the half-space.`,
      },
      {
        type: 'out_of_possession',
        body: `The front three press the opposition back four and goalkeeper. Three forwards against two centre-backs and a goalkeeper is close to an even contest high up the pitch, which is why the shape suits teams that want to press.

Defending deeper is harder. Three midfielders across the pitch leaves gaps outside them, so the wide forwards have to drop and the shape becomes a 4-5-1. A front three that does not track back leaves the midfield outnumbered.`,
      },
      {
        type: 'strengths',
        body: `**Natural width without wing-backs.** The wingers provide it from the start, so full-backs are free to choose their moment.

**A spare central midfielder.** Three against two in midfield is the most common numerical advantage in football, and it is built into the shape.

**Pressing balance.** Three forwards match up naturally against a back four playing out.

**Clear passing lanes.** Wide players high and wide, midfielders inside, which makes the switch of play short.`,
      },
      {
        type: 'weaknesses',
        body: `**Exposed full-backs.** Push both forward and the two centre-backs defend the width of the pitch alone against a counter-attack.

**Vulnerable to a midfield three plus a ten.** A 4-2-3-1 can put four players into the midfield zone, and the three can be outnumbered where it matters.

**Demanding of the wide forwards.** They are asked to hold width in attack and cover a full-back in defence, which is a lot of running.

**Isolated striker.** If the eights do not arrive, the centre-forward has two centre-backs and no support.`,
      },
      {
        type: 'variations',
        body: `**4-3-3 with a false nine.** The centre-forward drops into midfield instead of occupying the centre-backs.

**4-3-3 with inverted wingers.** Left-footers on the right and right-footers on the left, cutting inside to shoot rather than staying wide to cross.

**4-1-4-1.** The same players, with the eights dropping into a flat midfield four. Often the same team in its defensive shape.

**Inverted full-backs.** One full-back steps into midfield in possession, turning the back four into a back three with an extra midfielder.`,
      },
      {
        type: 'player_profiles',
        body: `**The six** needs positional discipline more than pace. They screen the back four and set the tempo.

**The eights** cover the most ground of anyone: box to box, and comfortable receiving in the half-space with a defender behind them.

**The wide forwards** must be able to beat a full-back one against one, since that is what the shape sets up.

**The striker** works against two centre-backs, so they need to hold the ball, or to run behind, and ideally both.`,
      },
      {
        type: 'key_takeaways',
        body: `- Width comes from the forwards, not the full-backs.
- The midfield three usually creates a spare player in the centre.
- The trade-off is space behind advanced full-backs.
- 4-3-3 in attack is often 4-5-1 in defence.`,
      },
    ],
  },

  // ── False Nine ────────────────────────────────────────────────────────────
  {
    slug: 'false-nine',
    title: 'False Nine',
    type: 'position_role',
    difficulty: 'intermediate',
    category: 'positions-and-roles',
    shortDescription:
      'A centre-forward who drops into midfield instead of leading the line, creating a problem no defender can solve cleanly.',
    readMinutes: 6,
    order: 40,
    sourceKeys: [{ key: 'wp-false-nine' }],
    related: [
      { slug: 'striker', type: 'variation_of' },
      { slug: 'number-10', type: 'contrasts_with' },
      { slug: '4-3-3', type: 'used_in' },
      { slug: 'half-space', type: 'related_to' },
      { slug: 'positional-play', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'A centre-forward who deliberately drops away from the defence into midfield, forcing defenders to choose between following them and holding their line.',
      },
      {
        type: 'simple_explanation',
        body: `A normal centre-forward plays on the shoulder of the last defender. A false nine starts there and leaves.

They drop into the space between the opposition defence and midfield, and the centre-back marking them has two options. Follow, and they leave a hole in the defensive line for someone else to run into. Stay, and the false nine has the ball, facing forward, with time.

Neither is good, and that is the whole idea. The role does not create a better striker; it creates an unanswerable question.`,
      },
      {
        type: 'movement',
        body: `The movement is between the lines rather than simply backwards. A false nine drops just far enough to be outside the centre-backs' comfortable range and inside the midfielders' blind spot.

Timing matters more than distance. Dropping too early lets the defence reorganise; dropping as the ball arrives in midfield gives the defender no time to decide.

The role only works with runners. Someone has to attack the space the false nine has vacated, usually a wide forward cutting inside or an onrushing midfielder.`,
      },
      {
        type: 'responsibilities',
        body: `**Receive under pressure and face forward.** The whole role collapses if they cannot turn.

**Link play.** They become an extra midfielder, so the passing has to be a midfielder's.

**Draw a marker.** Dropping without being followed still helps, but the space only opens if a defender comes.

**Finish anyway.** Arriving late in the box is a different skill from leading a line, and the best false nines still score.`,
      },
      {
        type: 'why_it_matters',
        body: `The role attacks a structural weakness. Two centre-backs and a defensive midfielder have clearly divided responsibilities, and the false nine plays exactly on the boundary between them, where nobody has been told who picks up.

It also creates a numerical advantage in midfield without changing personnel. A team fielding one striker who drops effectively plays with an extra midfielder while still having someone to attack the box.`,
      },
      {
        type: 'tactical_application',
        body: `Most useful against a defence with two centre-backs who want to mark tightly, since tight marking is what the drop punishes.

Least useful against a low block. If the defence is already deep, there is no space between the lines to drop into, and a false nine simply removes a body from the penalty area where a target man would be more valuable.

Against a back three the role changes character. A spare centre-back can follow the drop without breaking the line, so the advantage shrinks.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**A false nine is not a number ten.** A ten starts between the lines. A false nine starts as the furthest player forward and moves there, which is what drags a centre-back out of position. The starting point is the whole mechanism.

**It is not just a deep-lying forward.** Dropping deep to receive is common. The false nine specifically abandons the striker's position to create a defensive dilemma.

**It is not a modern invention.** Withdrawn centre-forwards have appeared throughout football's history, including in the Hungary side of the 1950s and in Austrian and Italian football before that. The label is recent; the movement is not.`,
      },
      {
        type: 'key_takeaways',
        body: `- The role creates a decision, not an advantage.
- It needs runners to exploit the vacated space.
- It works against tight marking and struggles against a low block.
- The starting position is what separates it from a number ten.`,
      },
    ],
  },

  // ── High Press ────────────────────────────────────────────────────────────
  {
    slug: 'high-press',
    title: 'High Press',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'pressing-and-transitions',
    alsoIn: ['tactics-and-styles'],
    shortDescription:
      'Defending in the opponent’s half to win the ball close to their goal, and what a team risks to do it.',
    readMinutes: 5,
    order: 20,
    related: [
      { slug: 'pressing', type: 'part_of' },
      { slug: 'low-block', type: 'contrasts_with' },
      { slug: 'high-defensive-line', type: 'requires_understanding' },
      { slug: 'cover-shadow', type: 'used_in' },
      { slug: 'ppda', type: 'measured_by' },
      { slug: 'gegenpressing', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'Pressing the opposition inside their own half, so that winning the ball leaves a short distance to goal.',
      },
      {
        type: 'simple_explanation',
        body: `Every team has to win the ball back somewhere. A high press chooses to do it near the opponent's goal.

The logic is distance. A ball won thirty metres from goal is worth far more than one won ninety metres away, because the defence has no time to reorganise and there are fewer players between the ball and the net.

The cost is the space left behind. Pressing high means defending high, and a defensive line near the halfway line has a large area of grass behind it.`,
      },
      {
        type: 'how_it_works',
        body: `A press is coordinated, not enthusiastic. Three things have to hold together.

**A trigger.** The press starts on a cue rather than continuously: a backwards pass, a poor touch, the ball going to a weaker passer, a player receiving with their back to the pitch.

**Cover shadows.** The pressing player approaches from an angle that puts their body between the ball and the next pass, so pressing one option closes two.

**Compactness.** The defensive line pushes up with the press. If the forwards press and the defence stays deep, the team is stretched and the midfield gap becomes the easiest pass on the pitch.

The aim is usually to force the ball into a predetermined area, most often a touchline, where the sideline acts as an extra defender.`,
      },
      {
        type: 'why_it_matters',
        body: `A high press turns defending into attacking. A turnover in the final third is the highest-value possession in football, and teams that press well generate chances no build-up would have produced.

It also constrains the opponent's options before the ball is lost. A team that expects to be pressed plays more direct, less accurate passes, which is a benefit that never shows up as a tackle or an interception.`,
      },
      {
        type: 'what_it_does_not_tell_you',
        heading: 'What it costs',
        body: `**Space behind.** One pass through or over the press meets a defence with the whole pitch behind it.

**Physical load.** Pressing is repeated high-intensity running, and a press that fades in the last twenty minutes is a liability.

**Vulnerability to a good goalkeeper.** A keeper comfortable in possession turns a five against four press into an even contest.

**It can be baited.** Some teams invite the press deliberately, because a press that is beaten leaves the most space of any defensive structure.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**Pressing is not chasing.** Individually running at the ball without the team's structure moving is the opposite of a press: it breaks the shape without closing any options.

**A high press is not the same as gegenpressing.** A high press is a defensive scheme applied to a settled opponent. Counterpressing is the response in the seconds immediately after losing the ball. Teams often do both, but they answer different situations.

**High press does not mean high line by definition,** though in practice the two must go together. A press without a matching line simply stretches the team.`,
      },
      {
        type: 'key_takeaways',
        body: `- The value of a press is where the ball is won, not how often.
- Triggers and cover shadows are what separate a press from chasing.
- The defensive line must move with it.
- PPDA is the usual measure, and an imperfect one.`,
      },
    ],
  },

  // ── Low Block ─────────────────────────────────────────────────────────────
  {
    slug: 'low-block',
    title: 'Low Block',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'defensive-concepts',
    alsoIn: ['tactics-and-styles'],
    shortDescription:
      'Defending deep in a compact shape, conceding territory in exchange for denying space where it hurts.',
    readMinutes: 5,
    order: 30,
    related: [
      { slug: 'high-press', type: 'contrasts_with' },
      { slug: 'compactness', type: 'requires_understanding' },
      { slug: 'defensive-line', type: 'requires_understanding' },
      { slug: 'counter-attack', type: 'related_to' },
      { slug: 'mid-block', type: 'contrasts_with' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'A defensive shape held deep in a team’s own third, prioritising compactness over territory.',
      },
      {
        type: 'simple_explanation',
        body: `A team in a low block gives up the pitch and keeps the space.

Ten players sit close together in front of their own penalty area. The opposition can have the ball wherever they like, right up to the edge of the box, and there is nothing dangerous to do with it.

It looks passive and it is not. Holding a compact shape for long spells against constant pressure is demanding, and one player stepping out of line opens the whole structure.`,
      },
      {
        type: 'how_it_works',
        body: `The shape is usually two banks of four with two ahead of them, or a back five with four in front. What matters is not the numbers but the distances.

**Vertical compactness.** Fifteen to twenty metres between the defensive line and the midfield line. Any more and the space between them becomes playable, which is exactly the space the block exists to deny.

**Horizontal compactness.** The block shifts sideways as a unit toward the ball, deliberately leaving the far side open. A switch of play takes time, and the block moves back across while the ball travels.

**No pressing the ball far from goal.** Stepping out to a player thirty metres from goal breaks the line and gives the opponent what they want.

The block concedes shots from distance and crosses into a crowded box, both of which are low-value chances.`,
      },
      {
        type: 'why_it_matters',
        body: `A low block is how weaker teams beat stronger ones. It removes the space that better players need, and reduces the game to low-probability chances plus set pieces.

It also creates the conditions for a counter-attack. A team committed to attacking a deep block pushes players forward, and the space they leave behind is the point of defending this way. The block is not only a defensive plan.`,
      },
      {
        type: 'tactical_application',
        body: `Most effective against possession sides that rely on combinations between the lines, since the lines are exactly what has been closed.

Least effective against teams with genuine aerial threat or excellent long-range shooting, which are the two ways to hurt a compact block directly.

The recurring problem is escaping it. A team defending deep for long periods has nobody near the halfway line when the ball is won, so clearances come straight back and the pressure resumes.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**A low block is not the same as parking the bus.** The phrase usually implies giving up on attacking entirely. Most low blocks are built to counter-attack, and the deep shape is what makes the counter possible.

**Conceding possession is not conceding chances.** Possession statistics look alarming against a low block and mostly measure sterile passing in front of it. Shot quality is the number that matters.

**It is not automatically defensive-minded.** Choosing where to defend is a tactical decision, not a statement of ambition.`,
      },
      {
        type: 'key_takeaways',
        body: `- Compactness matters more than the formation.
- The block trades territory for space in dangerous areas.
- It is usually paired with a counter-attacking plan.
- Possession conceded to a low block is largely harmless.`,
      },
    ],
  },

  // ── Half-space ────────────────────────────────────────────────────────────
  {
    slug: 'half-space',
    title: 'Half-space',
    type: 'tactical_concept',
    difficulty: 'intermediate',
    category: 'attacking-concepts',
    shortDescription:
      'The vertical channel between the centre and the touchline, and why so much modern attacking happens there.',
    readMinutes: 4,
    order: 50,
    related: [
      { slug: 'positional-play', type: 'part_of' },
      { slug: 'number-8', type: 'used_in' },
      { slug: 'inside-forward', type: 'used_in' },
      { slug: 'cutback', type: 'related_to' },
      { slug: 'underlapping-runs', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'The vertical strip of pitch between the central area and the wing, roughly in line with the edge of the penalty area.',
      },
      {
        type: 'simple_explanation',
        body: `Divide the pitch lengthways into five strips: a left wing, a right wing, a central channel, and two strips between them. Those two are the half-spaces.

They are useful because of who is responsible for them. The centre-back is watching the middle, the full-back is watching the wing, and the half-space is the seam between the two. Neither owns it.

A player receiving there can see the whole goal, can pass in either direction, and is close enough to shoot.`,
      },
      {
        type: 'how_it_works',
        body: `The value comes from angles rather than from the space itself.

**Passing angles.** From the wing, most passes go backwards or into a crowded box. From the half-space, a pass can go inside, outside, forward or square, and the defence has to cover all four.

**Shooting angles.** The half-space is far enough from the touchline that the goal is fully visible, which a wide position is not.

**Defensive confusion.** Marking it requires either a centre-back stepping out, which breaks the line, or a full-back tucking in, which opens the wing.

Occupying it usually requires someone else to hold the width. A winger on the touchline pins the full-back, which is what stops them narrowing into the half-space.`,
      },
      {
        type: 'example',
        body: `A common sequence: the winger holds the touchline and the opposition full-back stays with them. The central midfielder runs into the gap that leaves, receives with the goal in front of them, and plays a low ball back across the six-yard box.

That final pass is a cutback, and it exists because of where it was played from. The same ball from the touchline would be a cross into a defended area; from the half-space it arrives behind the defensive line, where defenders are facing their own goal.`,
      },
      {
        type: 'why_it_matters',
        body: `The half-space is where the two things attackers want meet: time on the ball, and a view of the goal. The centre offers the view without the time, the wing offers the time without the view.

It also explains a change in how teams are built. Wide forwards who cut inside, full-backs who overlap around them, and central midfielders who arrive late are all ways of getting a player into that channel, which is why those roles have become so common.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**The five-lane grid is a coaching tool, not a rule.** The lines are not painted on the pitch and the boundaries are approximate. It is a way of talking about space, not a map.

**Half-spaces are not new.** Inside forwards have occupied those channels for as long as the game has been played. The vocabulary comes from more recent coaching, particularly the positional-play tradition, but the space always existed.

**Being in the half-space is not automatically useful.** It matters when someone else holds the width. Three players drifting into the same channel simply crowds it.`,
      },
      {
        type: 'key_takeaways',
        body: `- The half-space sits between the centre-back's and the full-back's responsibility.
- Its value is passing and shooting angles, not the space itself.
- It only opens if someone holds the width outside it.
- Cutbacks are the characteristic pass from it.`,
      },
    ],
  },

  // ── Expected Goals ────────────────────────────────────────────────────────
  {
    slug: 'expected-goals',
    title: 'Expected Goals',
    subtitle: 'xG',
    type: 'statistic',
    difficulty: 'intermediate',
    category: 'statistics-and-analytics',
    shortDescription:
      'A measure of chance quality: how often a shot like that one is scored. Widely quoted, and widely misread.',
    aliases: ['xG'],
    isStartHere: false,
    readMinutes: 6,
    order: 10,
    sourceKeys: [{ key: 'wp-xg' }],
    related: [
      { slug: 'expected-assists', type: 'related_to' },
      { slug: 'expected-goals-on-target', type: 'contrasts_with' },
      { slug: 'shots', type: 'requires_understanding' },
      { slug: 'big-chance', type: 'related_to' },
      { slug: 'shooting', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'The probability that a shot is scored, estimated from how often historically similar shots were scored.',
      },
      {
        type: 'what_it_measures',
        body: `xG describes the quality of a chance, not the quality of the finish.

Each shot is assigned a value between 0 and 1. A shot with 0.10 xG is one that has historically been scored about one time in ten. A penalty is around 0.75 to 0.79 in most public models, because roughly three in four are converted.

A team's xG for a match is the sum of its shots. Two goals from 0.6 xG means the chances were poor and the finishing was excellent, or that the team was fortunate; xG alone cannot say which.`,
      },
      {
        type: 'how_it_is_calculated',
        body: `A model is trained on a large historical sample of shots, each labelled with whether it was scored. It learns how much each characteristic of a shot changes that likelihood.

The inputs commonly include:

- **Distance from goal.** The strongest single factor.
- **Angle to goal.** A shot from the byline has very little of the goal visible.
- **Body part.** Headers are converted less often than shots with the feet from the same position.
- **Type of assist.** Whether the chance came from a through ball, a cross, a cutback or a set piece.
- **Type of play.** Open play, counter-attack, direct free kick, penalty.
- **Pressure.** Some models include the position of defenders and the goalkeeper; many public ones do not.

The output is the historical conversion rate for shots sharing those characteristics. No model knows who is shooting unless it has been built to include that, and most do not.`,
      },
      {
        type: 'example',
        body: `A shot from the penalty spot with the goal open might carry an xG around 0.3. A shot from twenty-five metres with defenders in the way might be 0.03.

A team taking twenty shots of the second kind accumulates 0.6 xG: twenty shots, and less than one goal's worth of chances. A team taking three of the first kind accumulates roughly 0.9 from three shots.

The shot count says the first team dominated. The chance quality says the opposite, and that gap is the reason xG exists.`,
      },
      {
        type: 'how_to_interpret',
        body: `**Use it over many matches.** A single match contains too few shots for the sum to be reliable. Season-long figures are far more stable.

**It is descriptive first.** xG says what the chances were worth, which is a better record of a match than the score when the sample is small.

**Large gaps between goals and xG tend to shrink.** A player scoring far above their xG usually regresses, though not always: finishing skill is real, it is just smaller and harder to detect than most assume.

**Compare like with like.** Two providers' numbers are not interchangeable.`,
      },
      {
        type: 'what_it_does_not_tell_you',
        body: `**Who took the shot.** Most models exclude the shooter deliberately, so that the number describes the chance rather than the player.

**What did not happen.** A move that ends without a shot contributes nothing, so a team repeatedly opening a defence and choosing the wrong pass shows up as having created nothing.

**Game state.** A team leading by two changes how it attacks, and xG makes no adjustment for that.

**Whether the goalkeeper was any good.** For that, a post-shot model like xGOT is the right tool.`,
      },
      {
        type: 'provider_differences',
        body: `There is no single xG. Opta, StatsBomb, Understat, Wyscout and others each train their own model on their own data, and the same shot can be valued differently by each.

The differences come from the inputs. A model with defender positions and goalkeeper location values a crowded chance differently from one working only with location and body part. A model built on a different league, or a different era, has learned different conversion rates.

Two practical consequences. Do not mix providers in one comparison. And treat any precise-sounding claim about a single shot with suspicion, because the number is a model output rather than a measurement.

This is why the figure quoted on television and the figure on a statistics site often disagree about the same match. Neither is wrong; they are different models.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**xG is not a measure of luck.** It measures chance quality. Outperforming it can be finishing, or shot selection, or variance, and the number does not distinguish them.

**"They should have won" is not what xG says.** It says the chances were worth more. Football is decided by goals, and the model is not a claim about what deserved to happen.

**xG does not accumulate toward a goal.** A team on 0.9 xG has not almost scored; it has created chances that together were worth about nine tenths of a goal.`,
      },
      {
        type: 'key_takeaways',
        body: `- xG values the chance, not the finish.
- It needs a large sample to mean much.
- Every provider has a different model, and the numbers are not interchangeable.
- It ignores everything that did not end in a shot.`,
      },
    ],
  },

  // ── PPDA ──────────────────────────────────────────────────────────────────
  {
    slug: 'ppda',
    title: 'PPDA',
    subtitle: 'Passes Per Defensive Action',
    type: 'statistic',
    difficulty: 'advanced',
    category: 'statistics-and-analytics',
    alsoIn: ['pressing-and-transitions'],
    shortDescription:
      'How many passes a team allows before trying to win the ball back: the standard measure of pressing intensity, and a blunt one.',
    aliases: ['Passes Per Defensive Action'],
    readMinutes: 5,
    order: 60,
    related: [
      { slug: 'pressing', type: 'measured_by' },
      { slug: 'high-press', type: 'measured_by' },
      { slug: 'low-block', type: 'contrasts_with' },
      { slug: 'field-tilt', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'The number of passes an opponent completes in a defined area of the pitch for each defensive action a team makes there.',
      },
      {
        type: 'what_it_measures',
        body: `PPDA estimates how aggressively a team presses.

The reading is inverted, which catches most people out. A **low** PPDA means a team allows few passes before challenging, so it presses hard. A **high** PPDA means it lets the opponent pass freely, so it presses little.

A heavily pressing side might sit near 8. A committed low block might be above 15.`,
      },
      {
        type: 'how_it_is_calculated',
        body: `Opposition passes divided by the defending team's defensive actions, both counted only in a specified attacking zone.

Defensive actions typically mean tackles, interceptions, challenges and fouls. The zone is usually the opponent's defensive area, most commonly defined as the pitch beyond roughly 40% of the way from the opponent's own goal line, which excludes passing between centre-backs.

Both parts of that definition vary by provider, which is why PPDA values from different sources are not directly comparable.`,
      },
      {
        type: 'how_to_interpret',
        body: `**Remember the direction.** Lower is more pressing. It is the most common error in reading it.

**Context is required.** A team that leads early and drops off will record a high PPDA regardless of how it usually plays. Score, opponent and match state all move it.

**Use season averages.** A single match can be distorted by a red card or an early goal.

**Pair it with location data.** PPDA says how often a team engages, not where. Field tilt or average defensive-action height fills that gap.`,
      },
      {
        type: 'what_it_does_not_tell_you',
        body: `**Whether the press worked.** A team can press constantly and be played through every time. PPDA counts attempts, not outcomes.

**Whether the press was coordinated.** One player chasing alone counts the same as eleven pressing in unison.

**Passes that were never attempted.** A good press deters passes rather than intercepting them, and a deterred pass appears nowhere in the numerator.

**Anything outside the defined zone.** Aggressive midfield defending in the wrong band is invisible.`,
      },
      {
        type: 'provider_differences',
        body: `PPDA has no single authoritative definition. Two choices differ between providers and change the number materially.

**Which actions count.** Some include only tackles and interceptions; others add challenges, fouls and pressures. Adding pressures alone can shift the value substantially.

**Where the zone starts.** The 40% threshold is common but not universal, and moving it changes both the numerator and the denominator.

Treat PPDA as comparable within one dataset and not across two.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**Low PPDA is not automatically good.** It describes a choice. A low block is a legitimate plan, and a high PPDA is what it should produce.

**PPDA does not measure pressing success.** For that, look at where possession is won and what follows.

**It is not a player statistic.** It is a team-level rate, and attributing it to individuals is a category error.`,
      },
      {
        type: 'key_takeaways',
        body: `- Lower means more pressing. The scale is inverted.
- It counts attempts to press, not successful ones.
- Match state distorts it badly over one game.
- Definitions vary by provider; do not mix sources.`,
      },
    ],
  },

  // ── Number 10 ─────────────────────────────────────────────────────────────
  {
    slug: 'number-10',
    title: 'Number 10',
    type: 'position_role',
    difficulty: 'beginner',
    category: 'positions-and-roles',
    shortDescription:
      'The attacking midfielder who plays between the opposition midfield and defence, and why the role became harder to field.',
    aliases: ['No. 10', 'Attacking Midfielder', 'Trequartista'],
    readMinutes: 5,
    order: 60,
    related: [
      { slug: 'false-nine', type: 'contrasts_with' },
      { slug: 'number-8', type: 'contrasts_with' },
      { slug: 'half-space', type: 'used_in' },
      { slug: '4-2-3-1', type: 'used_in' },
      { slug: 'second-striker', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'An attacking midfielder who operates in the space between the opposition’s midfield and defensive lines, tasked with creating chances.',
      },
      {
        type: 'simple_explanation',
        body: `The number is a shirt, but the name has come to mean a position: the player just behind the striker.

Their job is to receive in the gap between the opponent's midfield and defence, turn, and produce the pass that breaks the defensive line.

It is the most creative position on the pitch and, in modern football, the most contested. The space a ten needs is precisely the space defensive structures are now organised to remove.`,
      },
      {
        type: 'movement',
        body: `A ten works laterally more than vertically. The space between the lines is not fixed; it appears and closes as the ball moves, so the role is largely about finding where it currently is.

Drifting into the half-spaces is common, and often more productive than staying central, since the centre is where the defensive midfielder is standing.

Good tens position themselves in the blind spot of the player marking them, arriving in space as the ball does rather than waiting in it.`,
      },
      {
        type: 'responsibilities',
        body: `**Receive between the lines and turn.** The defining skill.

**The final pass.** Through balls, cutbacks, and the disguised pass that removes a defender.

**Score.** A ten arriving at the edge of the box is a chance most defences handle poorly.

**Defensive work, now.** Historically the role carried a defensive exemption. Very few teams grant that today, and a ten who does not press is a structural problem.`,
      },
      {
        type: 'historical_context',
        body: `The classic number ten was the team's creative centre, given freedom and excused defensive duties. That role became rarer from the 1990s onward as pressing schemes spread.

Two changes did it. Defensive midfielders were increasingly deployed specifically to occupy the space between the lines, and pressing made an eleventh defender essential, which the traditional ten was not.

The creative function did not disappear; it moved. It is now often carried out by a wide forward cutting inside, or by an advanced central midfielder in a double pivot system, both of which combine creation with defensive work.`,
      },
      {
        type: 'tactical_application',
        body: `Most valuable against teams that leave space between their midfield and defence, which usually means teams pressing high without compactness.

Least valuable against a compact low block, where there is no space between the lines to occupy and an extra player in the box would be worth more.

The recurring design question is what the ten costs defensively. A 4-2-3-1 answers it by putting two holding midfielders behind them.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**The number has not matched the position for a long time.** Shirt numbers stopped tracking roles once squad numbering arrived. Plenty of tens wear other numbers.

**A ten is not a false nine.** The starting position differs, and that is the whole point: a ten starts between the lines, a false nine starts as the centre-forward and drops there.

**The role is not obsolete.** It is less often a dedicated position, but the function of creating between the lines is as valuable as ever.`,
      },
      {
        type: 'key_takeaways',
        body: `- Defined by the space it occupies, not the shirt number.
- The classic defensive exemption is largely gone.
- Its value depends on the opponent leaving space between the lines.
- The creative function has spread to wide forwards and advanced eights.`,
      },
    ],
  },

  // ── Promotion & Relegation ────────────────────────────────────────────────
  {
    slug: 'promotion-and-relegation',
    title: 'Promotion & Relegation',
    type: 'standard',
    difficulty: 'beginner',
    category: 'competition-formats',
    shortDescription:
      'The system that moves teams between divisions by results, and the reason a mid-table match in April still matters.',
    isStartHere: true,
    readMinutes: 5,
    order: 30,
    sourceKeys: [{ key: 'wp-promotion-relegation' }],
    related: [
      { slug: 'league', type: 'requires_understanding' },
      { slug: 'league-table', type: 'requires_understanding' },
      { slug: 'playoffs', type: 'related_to' },
      { slug: 'points-system', type: 'related_to' },
    ],
    sections: [
      {
        type: 'one_sentence',
        body: 'At the end of a season the best teams in a division move up and the worst move down, so league membership is decided by results rather than by invitation.',
      },
      {
        type: 'simple_explanation',
        body: `Football leagues in most countries are stacked in a pyramid. The strongest division sits at the top, with several below it.

Finish near the top of your division and you are promoted into the one above. Finish at the bottom and you are relegated into the one below. The number of places varies by country and by division.

Nobody buys a place. A club's league is decided by how it played last season, which is the structural difference between football and the closed franchise leagues common in North American sport.`,
      },
      {
        type: 'how_it_works',
        body: `The mechanism is the final league table.

**Automatic places.** A fixed number of top finishers go up and a fixed number of bottom finishers go down. Three each way is common in the larger European leagues, but it is a choice, not a rule.

**Playoffs.** Many countries decide one promotion place through a mini-tournament among the teams below the automatic spots, rather than giving it to the next-placed team.

**Ties are broken by rule, not replay.** Goal difference is the most common first tiebreak, then goals scored, then head-to-head record. The order varies by competition.

The consequence is that a division's membership changes every year, and a club can in principle rise from the bottom of the pyramid to the top division through results alone.`,
      },
      {
        type: 'why_it_matters',
        body: `It gives almost every match consequence. In a closed league, a team out of contention has nothing to play for by March. In a pyramid, the bottom of the table is its own competition, often more tense than the title race.

It also changes what a season means financially. Promotion between the top two divisions of a large league is worth a very large sum in broadcast revenue, and relegation removes it, which is why squads are frequently rebuilt on the result.

And it makes the pyramid genuinely open. Clubs have climbed several divisions in a decade, which is impossible where membership is fixed.`,
      },
      {
        type: 'example',
        body: `A twenty-team division plays thirty-eight matches. The champions and the runners-up are promoted automatically; the teams finishing third to sixth enter a playoff for the third place. The bottom three are relegated.

That produces two separate races running to the final day at opposite ends of the table, and a third among the playoff contenders in between.`,
      },
      {
        type: 'common_misunderstandings',
        body: `**The number of places is not universal.** Three up and three down is common in England and Spain, but other countries and other divisions use different numbers, and some use playoffs at both ends.

**Relegation is not always decided by points alone.** Licensing rules, financial failure and disciplinary sanctions can move a club between divisions independently of results.

**Promotion is not guaranteed by finishing high.** Some leagues require the promoted club to meet stadium or financial criteria for the division above.`,
      },
      {
        type: 'key_takeaways',
        body: `- Division membership is earned each season by results.
- The exact number of places varies by country and division.
- Playoffs are common for the final promotion place.
- The financial gap between divisions is what makes the stakes so high.`,
      },
    ],
  },
];
