import { fieldPosition } from './cricket-explainer-helpers';
import { fieldSetting } from './cricket-field-positions';
import type { ExplainerSeed } from './explainer-types';

/**
 * One explainer per fielding position.
 *
 * Every entry carries a diagram built from the shared coordinate table, showing
 * the position filled and a few neighbours outlined. That is deliberate: a lone
 * dot on an empty field teaches nothing, because "backward point" only means
 * something relative to point and gully. The context list for each position is
 * chosen to be the positions a reader would confuse it with.
 *
 * All coordinates are for a right-handed striker; the renderer mirrors for a
 * left-hander. Positions are regions rather than spots, and every entry says so,
 * because a beginner shown a precise dot will otherwise reasonably conclude that
 * cricket has marked fielding positions, which it does not.
 */

const MCC = { key: 'mcc-laws', locator: 'Law 28 (The fielder)' } as const;

/** Shared closing note: these are regions, and the captain moves them constantly. */
const REGION_NOTE = `Fielding positions are **approximate regions**, not marked spots. A captain adjusts most of them by several metres many times in an innings, and two captains will place the same named position differently. The diagram shows a conventional placement, which is what the name means rather than where anybody must stand.`;

export const CRICKET_FIELD_POSITION_EXPLAINERS: ExplainerSeed[] = [
  // ── The slip cordon ───────────────────────────────────────────────────────
  fieldPosition({
    slug: 'first-slip',
    title: 'First Slip',
    category: 'field-positions',
    difficulty: 'intermediate',
    summary:
      'The slip closest to the wicketkeeper, and usually the busiest catching position on the field.',
    purpose: `Catches the outside edge that carries just wide of the keeper. First slip takes the thinnest deflections, the ones where the ball has barely changed direction, which means the least reaction time of any slip.

The position also exists to give the keeper a partner: many chances fall in the gap between them, and first slip and the keeper work as a pair on anything low or wide.`,
    location: `A metre or two wider than the wicketkeeper and slightly deeper, angled off the striker's off side. Depth scales with the bowler's pace: several metres further back to a genuinely fast bowler than to a spinner.`,
    locationData: fieldSetting(
      'first-slip',
      ['second-slip', 'third-slip', 'gully', 'wicketkeeper'],
      'First slip, with the rest of the cordon outlined.',
    ),
    whenUsed: `Whenever a bowler is finding the edge, which in practice means with the new ball in every format and for long spells in red-ball cricket. First slip is usually the last slip a captain removes, because the thin edge is available even when the ball has stopped moving much.`,
    whoFieldsThere: `A specialist, and often the side's best catcher. The combination of proximity, pace and minimal deflection makes it the hardest slip position to field.`,
    misunderstandings: `**"First slip is the furthest from the keeper."** It is the closest. Slips are numbered outwards.`,
    takeaways: `- The slip nearest the keeper, taking the finest edges.
- Depth set by the bowler's pace.
- Usually the last slip to be removed.

${REGION_NOTE}`,
    related: ['slip', 'second-slip', 'third-slip', 'gully', 'slip-catching', 'wicketkeeper'],
    sourceKeys: [MCC],
    order: 30,
  }),

  fieldPosition({
    slug: 'second-slip',
    title: 'Second Slip',
    category: 'field-positions',
    difficulty: 'intermediate',
    summary: 'The second position out from the keeper, catching the slightly thicker edge.',
    purpose: `Takes the edge that has deviated a little more than first slip's: a ball caught nearer the middle of the bat's outside edge, travelling wider and often faster.

Adding a second slip is a statement that the bowler is beating the bat regularly enough to justify two specialists standing where nothing else will come.`,
    location: `A step or two wider and marginally deeper than first slip, on the off side behind square.`,
    locationData: fieldSetting(
      'second-slip',
      ['first-slip', 'third-slip', 'gully', 'wicketkeeper'],
      'Second slip, with the cordon around it.',
    ),
    whenUsed: `With the new ball, and to any bowler getting appreciable movement away from the bat. In limited-overs cricket a second slip is largely a powerplay luxury, because outside it the fielder is needed to save runs.`,
    whoFieldsThere: `A specialist catcher, frequently a senior player. Reaction time is marginally longer than at first slip, which is why a side's most reliable hands are not always placed there.`,
    takeaways: `- One position wider than first slip, for the thicker edge.
- A signal that the ball is doing enough to justify two slips.
- Rarely used outside the powerplay in white-ball cricket.

${REGION_NOTE}`,
    related: ['slip', 'first-slip', 'third-slip', 'gully', 'slip-catching'],
    sourceKeys: [MCC],
    order: 40,
  }),

  fieldPosition({
    slug: 'third-slip',
    title: 'Third Slip',
    category: 'field-positions',
    difficulty: 'intermediate',
    summary:
      'The third slip out from the keeper, used when a bowler is beating the bat repeatedly.',
    purpose: `Catches the thick edge, wider and squarer than second slip's. Between third slip and gully lies the region where a ball squirts off the face of the bat rather than the edge.

Three slips is an aggressive field. It commits three fielders to a single outcome and leaves the off side in front of square largely open, so a captain sets it only when the bowling justifies it.`,
    location: `Wider again than second slip, and starting to move round towards square on the off side.`,
    locationData: fieldSetting(
      'third-slip',
      ['first-slip', 'second-slip', 'gully', 'point'],
      'Third slip, between second slip and gully.',
    ),
    whenUsed: `Early in a red-ball innings on a helpful surface, and to a bowler in a spell where edges are flying regularly. It is often the first slip removed once the ball softens.`,
    whoFieldsThere: `A good catcher, though the marginally greater reaction time makes it a slightly more forgiving position than first slip.`,
    takeaways: `- The widest of the conventional three slips.
- Three slips is a deliberately aggressive field.
- Usually the first slip a captain gives up.

${REGION_NOTE}`,
    related: ['slip', 'second-slip', 'gully', 'fly-slip', 'slip-catching'],
    sourceKeys: [MCC],
    order: 50,
  }),

  fieldPosition({
    slug: 'gully',
    title: 'Gully',
    category: 'field-positions',
    difficulty: 'beginner',
    summary:
      'A close catching position squarer than the slips, for the thick edge and the ball fended off the body.',
    purpose: `Gully covers a specific and surprisingly common chance: the ball that comes off the bat at an angle wider than any slip can reach but still in the air, typically from a batter fending at a short ball or squaring up to one that bounced more than expected.

It is also the catching position most likely to receive a genuinely fast, flat chance, because the deflections that reach it have lost the least pace.`,
    location: `Behind square on the off side, wider and usually a little squarer than third slip, at close-catching depth.`,
    locationData: fieldSetting(
      'gully',
      ['third-slip', 'second-slip', 'point', 'backward-point'],
      'Gully, between the slips and point.',
    ),
    whenUsed: `To pace bowling on a pitch with bounce, and specifically to a bowler using the short ball. A captain who has just seen a batter fend one in the air will often put a gully in immediately.`,
    whoFieldsThere: `A brave and quick-reacting fielder. The chances arrive fast and often at chest height or lower.`,
    misunderstandings: `**"Gully is just a wide slip."** It covers a different chance: the fend and the thick edge rather than the fine deflection.`,
    takeaways: `- Close catching, behind square, wider and squarer than the slips.
- Takes the fend and the thick edge.
- Strongly associated with the short ball and a bouncy pitch.

${REGION_NOTE}`,
    related: ['slip', 'third-slip', 'point', 'leg-gully', 'close-catching', 'bouncer'],
    sourceKeys: [MCC],
    order: 60,
  }),

  fieldPosition({
    slug: 'fly-slip',
    title: 'Fly Slip',
    category: 'field-positions',
    difficulty: 'advanced',
    summary:
      'A deeper slip, set back to catch the ball that flies over the cordon or to cut off a steered single.',
    purpose: `Sits behind the slips, deep enough to catch a deflection that carries over them and to stop the deliberately steered shot behind square that would otherwise be a comfortable single.

It is a compromise position: half catcher, half run-saver, chosen when a captain wants some protection behind square without committing a fielder to the boundary at third man.`,
    location: `Directly behind the slip cordon and considerably deeper, roughly halfway to the boundary on the off side behind square.`,
    locationData: fieldSetting(
      'fly-slip',
      ['first-slip', 'second-slip', 'third-man', 'gully'],
      'Fly slip, behind the cordon and short of third man.',
    ),
    whenUsed: `Against a batter playing deliberately late and steering the ball behind square, and to a bowler getting steep bounce where edges are carrying further than usual. Also in limited-overs cricket as a phase-dependent alternative to a conventional third man.`,
    whoFieldsThere: `A good judge of a high ball who can also cover ground, since the position asks for both catching and run-saving.`,
    takeaways: `- A deep slip: catches what carries over the cordon.
- Part catcher, part run-saver.
- An alternative to third man rather than an addition to the slips.

${REGION_NOTE}`,
    related: ['slip', 'third-man', 'third-slip', 'upper-cut', 'field-setting'],
    sourceKeys: [MCC],
    order: 70,
  }),

  // ── Off side, square ──────────────────────────────────────────────────────
  fieldPosition({
    slug: 'point',
    title: 'Point',
    category: 'field-positions',
    difficulty: 'beginner',
    summary: 'Square on the off side inside the circle, guarding the cut and the square drive.',
    purpose: `Point stops the two shots played squarest on the off side: the **cut**, played off the back foot to a short, wide ball, and the **square drive** off the front foot.

Because both of those shots travel fast along the ground, point is a reflex position as much as a run-saving one, and a sharp catch there is common off a mistimed cut.`,
    location: `Square of the wicket on the off side, inside the fielding circle. "Point" without a modifier means roughly level with the striker.`,
    locationData: fieldSetting(
      'point',
      ['gully', 'backward-point', 'cover', 'deep-point'],
      'Point, square on the off side.',
    ),
    whenUsed: `Almost always. Point is one of the positions a captain fills first, in every format, because the cut is available to every batter against every bowler.`,
    whoFieldsThere: `An athletic fielder with quick hands. In limited-overs cricket point is often one of the side's best fielders, since the position sees a high volume of hard-hit balls and run-out chances.`,
    misunderstandings: `**"Point is behind square."** Plain point is square. **Backward point** is the one behind.`,
    takeaways: `- Square on the off side, inside the circle.
- Guards the cut and the square drive.
- Filled in nearly every field setting.

${REGION_NOTE}`,
    related: ['backward-point', 'deep-point', 'cover', 'gully', 'cut-shot', 'square-drive'],
    sourceKeys: [MCC],
    order: 80,
  }),

  fieldPosition({
    slug: 'backward-point',
    title: 'Backward Point',
    category: 'field-positions',
    difficulty: 'intermediate',
    summary: 'Point moved behind square, between point and gully.',
    purpose: `Covers the ball cut or steered slightly behind square on the off side, the region between a conventional point and gully.

The modifier "backward" does exactly what it says throughout cricket's vocabulary: it moves a named position behind the square line.`,
    location: `Between gully and point, behind square on the off side, inside the circle.`,
    locationData: fieldSetting(
      'backward-point',
      ['point', 'gully', 'third-man', 'cover'],
      'Backward point, between gully and point.',
    ),
    whenUsed: `To a batter who cuts fine rather than square, and as a compromise when a captain wants some cover behind square without a third slip or a gully.`,
    whoFieldsThere: `An agile fielder. The angles are awkward, since the ball frequently arrives at an angle across the fielder rather than towards them.`,
    takeaways: `- Point, shifted behind square.
- Sits between gully and point.
- "Backward" always means behind square in cricket's field vocabulary.

${REGION_NOTE}`,
    related: ['point', 'gully', 'deep-point', 'third-man', 'cut-shot'],
    sourceKeys: [MCC],
    order: 90,
  }),

  fieldPosition({
    slug: 'cover',
    title: 'Cover',
    category: 'field-positions',
    difficulty: 'beginner',
    summary:
      'In front of square on the off side, guarding the cover drive and the single that comes with it.',
    purpose: `Cover stops the cover drive, the most classical attacking shot on the off side, and takes the catch when one is mistimed in the air.

It is also the single most active run-saving position in limited-overs cricket. A large share of ones and twos are pushed into the region between cover and mid-off, so a quick cover fielder turns singles into dot balls and creates run-out chances.`,
    location: `In front of square on the off side, between point and extra cover, inside the circle.`,
    locationData: fieldSetting(
      'cover',
      ['point', 'extra-cover', 'mid-off', 'deep-cover'],
      'Cover, in front of square on the off side.',
    ),
    whenUsed: `Nearly always. Cover is a permanent fixture of almost every field in every format, and it is usually one of the last positions to be moved to the boundary.`,
    whoFieldsThere: `Frequently the side's best fielder in white-ball cricket. Ground fielding, throwing accuracy and speed all matter here more than at any other inner-ring position.`,
    misunderstandings: `**"Cover and extra cover are the same."** Extra cover is wider, closer to straight, between cover and mid-off.`,
    takeaways: `- In front of square on the off side, inside the circle.
- Guards the cover drive and the off-side single.
- Usually staffed by the side's best inner-ring fielder.

${REGION_NOTE}`,
    related: ['extra-cover', 'point', 'mid-off', 'deep-cover', 'cover-drive', 'ground-fielding'],
    sourceKeys: [MCC],
    order: 100,
  }),

  fieldPosition({
    slug: 'extra-cover',
    title: 'Extra Cover',
    category: 'field-positions',
    difficulty: 'intermediate',
    summary: 'Between cover and mid-off, covering the straighter drive on the off side.',
    purpose: `Fills the gap between cover and mid-off, which is exactly where a well-timed drive that is not quite square and not quite straight will go.

Setting an extra cover is often a response to a specific batter: one who drives through that channel repeatedly, and whose most productive scoring area would otherwise be unguarded.`,
    location: `In front of square on the off side, between cover and mid-off, inside the circle.`,
    locationData: fieldSetting(
      'extra-cover',
      ['cover', 'mid-off', 'point', 'deep-cover'],
      'Extra cover, between cover and mid-off.',
    ),
    whenUsed: `To front-foot batters driving through the off side, and as part of a field designed to make a batter hit straighter or squarer than they would like.`,
    whoFieldsThere: `A competent all-round fielder. The position is less specialised than cover, though the same skills apply.`,
    takeaways: `- Between cover and mid-off, in front of square.
- Closes the straighter off-side driving channel.
- Often a batter-specific adjustment.

${REGION_NOTE}`,
    related: ['cover', 'mid-off', 'deep-cover', 'cover-drive', 'straight-drive', 'field-setting'],
    sourceKeys: [MCC],
    order: 110,
  }),

  fieldPosition({
    slug: 'mid-off',
    title: 'Mid-off',
    category: 'field-positions',
    difficulty: 'beginner',
    summary: 'Straight and slightly to the off side of the bowler, guarding the straight drive.',
    purpose: `Stops the straight drive and the pushed single down the ground on the off side, and takes the catch when a drive is hit in the air.

Mid-off has a second, less obvious job: it is where the bowler's captain often stands. The position is close enough to the bowler to talk between deliveries, so a captain who wants to run the over from beside the bowler will field there.`,
    location: `In front of the wicket on the off side, close to straight, inside the circle. Roughly a mirror of mid-on.`,
    locationData: fieldSetting(
      'mid-off',
      ['extra-cover', 'mid-on', 'long-off', 'cover'],
      'Mid-off, straight and slightly off side.',
    ),
    whenUsed: `In virtually every field. It is pushed back to **long off** when a captain accepts a single to protect the straight boundary, which is a routine white-ball adjustment.`,
    whoFieldsThere: `Often the captain, or a senior bowler resting between spells. It demands solid catching and a good arm rather than exceptional speed.`,
    takeaways: `- Straight and slightly off side, in front of the wicket.
- Guards the straight drive.
- Becomes long off when pushed to the boundary.
- Frequently the captain's own position.

${REGION_NOTE}`,
    related: ['mid-on', 'long-off', 'extra-cover', 'straight-drive', 'field-setting'],
    sourceKeys: [MCC],
    order: 120,
  }),

  fieldPosition({
    slug: 'mid-on',
    title: 'Mid-on',
    category: 'field-positions',
    difficulty: 'beginner',
    summary: 'Straight and slightly to the leg side of the bowler, the mirror of mid-off.',
    purpose: `Guards the straight drive and the on drive, and the pushed single down the ground on the leg side.

Together with mid-off it forms the pair of positions that define how straight a batter is permitted to score. Bringing both up saves singles and concedes the drive over the top; pushing both back does the reverse.`,
    location: `In front of the wicket on the leg side, close to straight, inside the circle.`,
    locationData: fieldSetting(
      'mid-on',
      ['mid-off', 'midwicket', 'long-on', 'square-leg'],
      'Mid-on, the leg-side mirror of mid-off.',
    ),
    whenUsed: `In almost every field. Pushed back it becomes **long on**, which along with long off is the standard death-overs configuration in limited-overs cricket.`,
    whoFieldsThere: `Frequently a bowler between spells. Like mid-off it asks for reliability rather than exceptional athleticism.`,
    takeaways: `- Straight and slightly leg side, in front of the wicket.
- Guards the on drive and the straight single.
- Becomes long on at the boundary.

${REGION_NOTE}`,
    related: ['mid-off', 'long-on', 'midwicket', 'on-drive', 'field-setting'],
    sourceKeys: [MCC],
    order: 130,
  }),

  fieldPosition({
    slug: 'midwicket',
    title: 'Midwicket',
    category: 'field-positions',
    difficulty: 'beginner',
    summary:
      'On the leg side between square leg and mid-on, covering the flick, the pull and the leg-side single.',
    purpose: `Midwicket guards the widest range of shots of any leg-side inner-ring position: the flick off the pads, the pull, the mistimed drive that goes to leg, and the worked single that a batter takes almost at will if nobody is there.

It is the leg-side counterpart of cover, and in limited-overs cricket it is comparably busy.`,
    location: `Leg side, in front of square, between square leg and mid-on, inside the circle.`,
    locationData: fieldSetting(
      'midwicket',
      ['square-leg', 'mid-on', 'deep-midwicket', 'cow-corner'],
      'Midwicket, between square leg and mid-on.',
    ),
    whenUsed: `In nearly every field, and especially to bowlers attacking the stumps, since a ball at the pads is worked to midwicket more than anywhere else. Pushed back it becomes **deep midwicket**, one of the most important boundary positions in T20 cricket.`,
    whoFieldsThere: `An athletic fielder with a strong arm. The run-out chances from midwicket are frequent, because a batter turning for a second run there is often committed before the ball is picked up.`,
    misunderstandings: `**"Midwicket is in the middle of the pitch."** It is a leg-side position in front of square, nothing to do with the middle of the wicket.`,
    takeaways: `- Leg side, in front of square, inside the circle.
- Covers the flick, the pull and the leg-side single.
- The leg-side equivalent of cover in workload.

${REGION_NOTE}`,
    related: ['square-leg', 'mid-on', 'deep-midwicket', 'cow-corner', 'pull-shot', 'flick'],
    sourceKeys: [MCC],
    order: 140,
  }),

  fieldPosition({
    slug: 'square-leg',
    title: 'Square Leg',
    category: 'field-positions',
    difficulty: 'beginner',
    summary:
      'Square of the wicket on the leg side, guarding the sweep, the pull and the tuck off the hip.',
    purpose: `Stops the ball played squarest on the leg side: the sweep, the square-ish pull, and the ball tucked off the hip that would otherwise be an easy single.

Square leg is also where the **square-leg umpire** stands, on the opposite side from the striker's stance, which is why the fielder and the umpire are sometimes both in shot and moving around each other.`,
    location: `Square of the wicket on the leg side, inside the circle.`,
    locationData: fieldSetting(
      'square-leg',
      ['midwicket', 'fine-leg', 'deep-square-leg', 'short-leg'],
      'Square leg, square on the leg side.',
    ),
    whenUsed: `To spin, where the sweep is the main threat, and to any bowler bowling straight at the pads. Pushed back it becomes **deep square leg**, a standard boundary position against the sweep and the pull.`,
    whoFieldsThere: `A quick fielder with a flat throw. Many run outs at the striker's end come from square leg, because the angle is short and direct.`,
    misunderstandings: `**"Square leg is where the umpire stands, not a fielder."** Both. The umpire stands there; a fielder can too.`,
    takeaways: `- Square of the wicket on the leg side.
- Guards the sweep, the square pull and the tuck off the hip.
- Shares its name with the umpire's position.

${REGION_NOTE}`,
    related: ['midwicket', 'deep-square-leg', 'fine-leg', 'short-leg', 'sweep', 'on-field-umpire'],
    sourceKeys: [MCC],
    order: 150,
  }),

  fieldPosition({
    slug: 'fine-leg',
    title: 'Fine Leg',
    category: 'field-positions',
    difficulty: 'beginner',
    summary:
      'Deep and fine on the leg side behind square, guarding the glance and the deflection off the pads.',
    purpose: `Covers the ball deflected fine behind square on the leg side: the leg glance, the ball off the hip, the flick that beats the keeper.

Because those deflections need very little bat, fine leg is doing genuine work even when the batter is not attacking. It also collects a high proportion of a bowler's leg-side wides that get away.`,
    location: `Behind square on the leg side, close to straight behind, at or near the boundary.`,
    locationData: fieldSetting(
      'fine-leg',
      ['long-leg', 'square-leg', 'deep-square-leg', 'third-man'],
      'Fine leg, deep and fine on the leg side.',
    ),
    whenUsed: `In almost every field, in every format. To pace bowling it is close to compulsory: without it, every deflection off the pads is four.`,
    whoFieldsThere: `A good boundary fielder with a long throw, often a fast bowler resting after a spell, since the position involves long walks between overs and few decisions.`,
    misunderstandings: `**"Fine leg and long leg are the same."** Long leg is squarer. Fine leg is nearer straight behind.`,
    takeaways: `- Deep, behind square, fine on the leg side.
- Guards the glance and pad deflections.
- Present in nearly every field to pace bowling.

${REGION_NOTE}`,
    related: ['long-leg', 'deep-square-leg', 'leg-glance', 'third-man', 'boundary-fielding'],
    sourceKeys: [MCC],
    order: 160,
  }),

  fieldPosition({
    slug: 'long-leg',
    title: 'Long Leg',
    category: 'field-positions',
    difficulty: 'intermediate',
    summary: 'Deep on the leg side behind square, squarer than fine leg.',
    purpose: `Covers the deep leg-side region between fine leg and deep square leg: the ball hooked or pulled behind square, and the top edge off a short ball.

Long leg is a specific answer to the short-ball plan. A captain bowling bouncers needs somebody deep and squarish on the leg side, because a top-edged hook travels a long way in exactly that direction.`,
    location: `At or near the boundary on the leg side behind square, squarer than fine leg.`,
    locationData: fieldSetting(
      'long-leg',
      ['fine-leg', 'deep-square-leg', 'square-leg', 'deep-midwicket'],
      'Long leg, squarer than fine leg.',
    ),
    whenUsed: `With a short-ball strategy, and to a batter who hooks. Often set in tandem with a second deep leg-side fielder, which is the visual signature of a bouncer plan.`,
    whoFieldsThere: `A boundary fielder with a reliable high catch, since the chances that come are usually top edges arriving steeply.`,
    takeaways: `- Deep, behind square, squarer than fine leg.
- The standard field for a short-ball plan.
- Takes the top-edged hook.

${REGION_NOTE}`,
    related: ['fine-leg', 'deep-square-leg', 'hook-shot', 'bouncer', 'short-ball-strategy'],
    sourceKeys: [MCC],
    order: 170,
  }),

  fieldPosition({
    slug: 'third-man',
    title: 'Third Man',
    category: 'field-positions',
    difficulty: 'beginner',
    summary:
      'Deep behind square on the off side, guarding the edge that beats the slips and the deliberate steer.',
    purpose: `Two jobs, and they are the reason third man is in almost every field.

**Stopping the four that beats the cordon.** An edge that carries past the slips runs away to the boundary unless somebody is there.

**Covering the deliberate shot.** The upper cut, the ramp and the steer behind square are all played into third man's region on purpose, and in T20 cricket they are premeditated scoring shots rather than accidents.`,
    location: `At or near the boundary, behind square on the off side, near to straight behind.`,
    locationData: fieldSetting(
      'third-man',
      ['fly-slip', 'deep-point', 'gully', 'fine-leg'],
      'Third man, deep behind square on the off side.',
    ),
    whenUsed: `Nearly always in red-ball cricket, and phase-dependently in white-ball cricket: absent during a powerplay when only two fielders may be out, and one of the first positions filled once the restrictions loosen.`,
    whoFieldsThere: `A boundary fielder with a strong arm, often a bowler between spells.`,
    misunderstandings: `**"Third man is the third slip."** Unrelated. Third man is a deep position; third slip is a close catcher.`,
    takeaways: `- Deep, behind square, off side.
- Stops the edge through the cordon and covers the upper cut and ramp.
- Phase-dependent in limited-overs cricket.

${REGION_NOTE}`,
    related: ['fly-slip', 'deep-point', 'upper-cut', 'ramp-shot', 'slip', 'boundary-fielding'],
    sourceKeys: [MCC],
    order: 180,
  }),

  // ── Off side, deep ────────────────────────────────────────────────────────
  fieldPosition({
    slug: 'deep-point',
    title: 'Deep Point',
    category: 'field-positions',
    difficulty: 'intermediate',
    summary: 'Point pushed to the boundary, guarding the square boundary on the off side.',
    purpose: `Saves the four from a cut or a square drive, and takes the high catch when one of those shots is hit in the air. Standard practice is to concede the single in exchange for cutting off the boundary, which is the trade every deep fielder represents.`,
    location: `At or near the boundary, square on the off side.`,
    locationData: fieldSetting(
      'deep-point',
      ['point', 'third-man', 'deep-cover', 'backward-point'],
      'Deep point, on the boundary square of the wicket.',
    ),
    whenUsed: `Outside the powerplay in limited-overs cricket, and in red-ball cricket to a batter cutting hard and repeatedly. Often paired with deep cover to shut the off side down.`,
    whoFieldsThere: `A boundary fielder with a good arm and a reliable high catch.`,
    takeaways: `- Point on the boundary.
- Concedes the single to save the four.
- A phase-dependent white-ball position.

${REGION_NOTE}`,
    related: ['point', 'deep-cover', 'third-man', 'cut-shot', 'boundary-fielding'],
    sourceKeys: [MCC],
    order: 190,
  }),

  fieldPosition({
    slug: 'deep-cover',
    title: 'Deep Cover',
    category: 'field-positions',
    difficulty: 'intermediate',
    summary: 'Cover pushed to the boundary, often called the off-side sweeper.',
    purpose: `Guards the off-side boundary in front of square, cutting off the driven four and forcing the batter to take a single instead.

This is the archetypal **sweeper**: a fielder placed on the boundary specifically to convert fours into ones, which is the central arithmetic of limited-overs field setting.`,
    location: `At or near the boundary on the off side, in front of square, between deep point and long off.`,
    locationData: fieldSetting(
      'deep-cover',
      ['cover', 'deep-point', 'long-off', 'extra-cover'],
      'Deep cover, the off-side sweeper.',
    ),
    whenUsed: `Standard outside the powerplay in limited-overs cricket. In Test cricket it appears when a captain has decided a batter's driving is not worth contesting in the ring.`,
    whoFieldsThere: `A quick boundary fielder. The position covers a wide arc and involves a lot of running to cut off angled drives.`,
    takeaways: `- Cover on the boundary; the off-side sweeper.
- Trades a single for a four.
- A defining feature of middle-overs white-ball fields.

${REGION_NOTE}`,
    related: ['cover', 'deep-point', 'long-off', 'cover-drive', 'field-setting'],
    sourceKeys: [MCC],
    order: 200,
  }),

  fieldPosition({
    slug: 'long-off',
    title: 'Long Off',
    category: 'field-positions',
    difficulty: 'beginner',
    summary: 'Mid-off pushed to the boundary, guarding the straight boundary on the off side.',
    purpose: `Stops the lofted straight drive and the hit over mid-off, and takes the catch when the batter does not quite clear the boundary rider.

Long off and long on together are the standard configuration for the end of a limited-overs innings: they protect the straight boundaries, which are the ones a batter can reach with the least risk.`,
    location: `At or near the boundary, straight and slightly off side.`,
    locationData: fieldSetting(
      'long-off',
      ['mid-off', 'long-on', 'deep-cover', 'extra-cover'],
      'Long off, on the straight off-side boundary.',
    ),
    whenUsed: `Almost universal in the middle and death overs of limited-overs cricket, and used in red-ball cricket to a batter hitting a spinner down the ground.`,
    whoFieldsThere: `A reliable high catcher with a long throw. Many of the chances are steep and hit hard.`,
    takeaways: `- Mid-off at the boundary.
- Paired with long on to protect the straight boundaries.
- A staple of death-overs fields.

${REGION_NOTE}`,
    related: ['mid-off', 'long-on', 'deep-cover', 'straight-drive', 'death-bowling'],
    sourceKeys: [MCC],
    order: 210,
  }),

  fieldPosition({
    slug: 'long-on',
    title: 'Long On',
    category: 'field-positions',
    difficulty: 'beginner',
    summary: 'Mid-on pushed to the boundary, the leg-side twin of long off.',
    purpose: `Guards the straight boundary on the leg side, stopping the lofted on drive and the slog over mid-on.

Against spin it is close to essential: hitting straight down the ground over mid-on is the lowest-risk way to attack a slow bowler, and long on is the answer.`,
    location: `At or near the boundary, straight and slightly leg side.`,
    locationData: fieldSetting(
      'long-on',
      ['mid-on', 'long-off', 'deep-midwicket', 'cow-corner'],
      'Long on, on the straight leg-side boundary.',
    ),
    whenUsed: `In the middle and death overs of limited-overs cricket almost without exception, and to spin in every format.`,
    whoFieldsThere: `A reliable high catcher with a long throw.`,
    takeaways: `- Mid-on at the boundary.
- The leg-side twin of long off.
- Close to essential against spin.

${REGION_NOTE}`,
    related: ['mid-on', 'long-off', 'deep-midwicket', 'on-drive', 'slog-sweep'],
    sourceKeys: [MCC],
    order: 220,
  }),

  fieldPosition({
    slug: 'deep-midwicket',
    title: 'Deep Midwicket',
    category: 'field-positions',
    difficulty: 'intermediate',
    summary:
      'Midwicket pushed to the boundary, guarding the most productive hitting region in T20 cricket.',
    purpose: `Covers the leg-side boundary in front of square, which for most batters is the easiest area to clear: the pull, the slog sweep and the flat-batted hit over midwicket all land there.

In T20 cricket deep midwicket is frequently the single most important boundary position, because it is where the highest proportion of sixes go.`,
    location: `At or near the boundary on the leg side, in front of square, between deep square leg and long on.`,
    locationData: fieldSetting(
      'deep-midwicket',
      ['midwicket', 'cow-corner', 'long-on', 'deep-square-leg'],
      'Deep midwicket, in front of square on the leg-side boundary.',
    ),
    whenUsed: `Standard from the end of the powerplay onwards in T20 and ODI cricket, and set for any batter who hits strongly through the leg side.`,
    whoFieldsThere: `A strong boundary fielder and high catcher. The chances arrive with pace and height.`,
    misunderstandings: `**"Deep midwicket and cow corner are the same."** Cow corner is the informal name for the region between deep midwicket and long on, not a distinct formal position.`,
    takeaways: `- Midwicket on the boundary, in front of square.
- Often the highest-value boundary position in T20.
- Covers the pull and the slog sweep.

${REGION_NOTE}`,
    related: [
      'midwicket',
      'cow-corner',
      'long-on',
      'slog-sweep',
      'pull-shot',
      'death-overs-batting',
    ],
    sourceKeys: [MCC],
    order: 230,
  }),

  fieldPosition({
    slug: 'deep-square-leg',
    title: 'Deep Square Leg',
    category: 'field-positions',
    difficulty: 'intermediate',
    summary: 'Square leg pushed to the boundary, the standard answer to the sweep and the pull.',
    purpose: `Saves the four from a sweep or a square pull, and takes the top edge when either is mistimed.

It is the position that makes a sweep a one-run shot rather than a four, which is why setting it is the most common single response to a batter sweeping well.`,
    location: `At or near the boundary, square on the leg side.`,
    locationData: fieldSetting(
      'deep-square-leg',
      ['square-leg', 'long-leg', 'deep-midwicket', 'fine-leg'],
      'Deep square leg, square on the leg-side boundary.',
    ),
    whenUsed: `To spin when a batter is sweeping, to pace with a short-ball plan, and routinely in the middle overs of limited-overs cricket.`,
    whoFieldsThere: `A boundary fielder comfortable with a steeply falling catch, since mistimed sweeps go very high.`,
    takeaways: `- Square leg on the boundary.
- The standard counter to a batter sweeping.
- Takes the top-edged sweep and pull.

${REGION_NOTE}`,
    related: ['square-leg', 'long-leg', 'sweep', 'slog-sweep', 'deep-midwicket'],
    sourceKeys: [MCC],
    order: 240,
  }),

  // ── Close catching, leg side and silly positions ──────────────────────────
  fieldPosition({
    slug: 'short-leg',
    title: 'Short Leg',
    category: 'field-positions',
    difficulty: 'intermediate',
    aliases: ['Bat-pad'],
    summary:
      'A very close leg-side catcher, square and forward of the batter, waiting for the ball that pops off bat or pad.',
    purpose: `Catches the ball that comes off the bat or pad without control: the inside edge, the ball fended from the hip, and above all the bat-pad chance from a spinner turning the ball into a right-hander.

Short leg is a pressure position as much as a catching one. A fielder crouching two or three metres away changes what a batter feels able to do, which is part of why captains set it.`,
    location: `Leg side, very close, roughly square to slightly forward of the striker, inside the circle and inside the reach of a defensive push.`,
    locationData: fieldSetting(
      'short-leg',
      ['silly-mid-on', 'leg-slip', 'square-leg', 'wicketkeeper'],
      'Short leg, very close on the leg side.',
    ),
    whenUsed: `To spin on a turning pitch, above all to an off-spinner or left-arm orthodox bowler turning the ball in to the batter. Also to pace bowling with a short-ball plan, where the fend off the hip is the chance.`,
    whoFieldsThere: `Usually a young player, and always in a **helmet**. It is the most physically exposed position on the field: the ball arrives fast, from very close, at head and chest height.

The presence of a fielder's helmet left on the ground behind the keeper, and the five penalty runs if the ball hits it, is a related detail worth knowing.`,
    misunderstandings: `**"Short leg is the same as square leg."** Square leg is a run-saving position in the ring. Short leg is a close catcher several times nearer the bat.`,
    takeaways: `- Very close on the leg side, square to slightly forward.
- Takes the bat-pad chance and the fend off the hip.
- Set mainly to spin turning in to the batter.
- Always fielded in a helmet.

${REGION_NOTE}`,
    related: [
      'leg-slip',
      'silly-mid-on',
      'close-catching',
      'off-spin',
      'helmet',
      'playing-against-spin',
    ],
    sourceKeys: [MCC],
    order: 250,
  }),

  fieldPosition({
    slug: 'silly-point',
    title: 'Silly Point',
    category: 'field-positions',
    difficulty: 'advanced',
    summary: 'Point brought unusually close, a few metres from the bat on the off side.',
    purpose: `Takes the catch that comes off the face of the bat or the outside edge at very close range, typically from a batter pushing forward defensively at a spinner.

"Silly" is cricket's modifier for a position brought closer than is comfortable, in the same family as "short". It signals a captain expecting a bat-pad chance rather than a run-saving need.`,
    location: `Off side, square to slightly forward, only a few metres from the bat.`,
    locationData: fieldSetting(
      'silly-point',
      ['silly-mid-off', 'point', 'short-leg', 'cover'],
      'Silly point, unusually close on the off side.',
    ),
    whenUsed: `To spin on a pitch offering turn and bounce, and specifically to a bowler turning the ball away from a right-hander, where the outside edge at close range is the chance.`,
    whoFieldsThere: `A brave close catcher in a helmet.`,
    takeaways: `- Point, brought within a few metres of the bat.
- "Silly" means unusually close, like "short".
- A spin-bowling catching position.

${REGION_NOTE}`,
    related: ['point', 'silly-mid-off', 'short-leg', 'close-catching', 'spin-bowling'],
    sourceKeys: [MCC],
    order: 260,
  }),

  fieldPosition({
    slug: 'silly-mid-off',
    title: 'Silly Mid-off',
    category: 'field-positions',
    difficulty: 'advanced',
    summary:
      'Mid-off brought within a few metres of the bat, on the off side in front of the wicket.',
    purpose: `Catches the ball popped up off the front of the bat or off the pad from a defensive push, on the off side in front of square.

Like all the silly positions it is a spin-bowling device: it needs the ball to arrive slowly enough that a fielder that close is not simply in danger without being useful.`,
    location: `Off side, in front of the wicket, a few metres from the bat.`,
    locationData: fieldSetting(
      'silly-mid-off',
      ['silly-point', 'mid-off', 'silly-mid-on', 'extra-cover'],
      'Silly mid-off, close in front of the wicket.',
    ),
    whenUsed: `To spin on a turning pitch, usually alongside a short leg, when a captain expects the batter to be pushing defensively rather than driving.`,
    whoFieldsThere: `A close catcher in a helmet, and often the same specialists who field at short leg.`,
    takeaways: `- Mid-off, brought within a few metres of the bat.
- Takes the ball popped up from a defensive push.
- Used to spin, generally alongside short leg.

${REGION_NOTE}`,
    related: ['mid-off', 'silly-point', 'silly-mid-on', 'close-catching', 'forward-defence'],
    sourceKeys: [MCC],
    order: 270,
  }),

  fieldPosition({
    slug: 'silly-mid-on',
    title: 'Silly Mid-on',
    category: 'field-positions',
    difficulty: 'advanced',
    summary:
      'Mid-on brought within a few metres of the bat, on the leg side in front of the wicket.',
    purpose: `The leg-side counterpart of silly mid-off: catches the ball that pops off bat or pad in front of square on the leg side, typically from a batter playing forward at a spinner turning the ball in.

Set together with short leg it closes off the entire close leg-side region, which is a strong statement that the captain expects the batter to be defending rather than scoring.`,
    location: `Leg side, in front of the wicket, a few metres from the bat.`,
    locationData: fieldSetting(
      'silly-mid-on',
      ['short-leg', 'mid-on', 'silly-mid-off', 'midwicket'],
      'Silly mid-on, close in front of the wicket on the leg side.',
    ),
    whenUsed: `To finger spin turning in to the batter on a helpful pitch, generally in a field that also contains a short leg.`,
    whoFieldsThere: `A close catcher in a helmet.`,
    takeaways: `- Mid-on, brought within a few metres of the bat.
- Leg-side counterpart of silly mid-off.
- Paired with short leg to shut off the close leg side.

${REGION_NOTE}`,
    related: ['mid-on', 'short-leg', 'silly-mid-off', 'close-catching', 'off-spin'],
    sourceKeys: [MCC],
    order: 280,
  }),

  fieldPosition({
    slug: 'leg-slip',
    title: 'Leg Slip',
    category: 'field-positions',
    difficulty: 'advanced',
    summary:
      'A slip on the leg side, catching the glance and the deflection that beats the keeper down the leg side.',
    purpose: `Mirrors the slip position onto the leg side, taking a genuinely different chance: not the outside edge but the **glance**, the deflection off the pads, and the ball the batter tries to work fine and fails to control.

It is uncommon because the chance is uncommon, and because the fielder is doing nothing else while standing there.`,
    location: `Leg side, behind square, close, roughly mirroring first or second slip.`,
    locationData: fieldSetting(
      'leg-slip',
      ['short-leg', 'leg-gully', 'wicketkeeper', 'fine-leg'],
      'Leg slip, the leg-side mirror of a slip.',
    ),
    whenUsed: `To a bowler moving the ball in to the batter, to spin turning in on a pitch with bounce, and occasionally as a specific plan against a batter who glances compulsively.

Note that Law 28 permits at most two fielders behind square on the leg side other than the keeper, so a leg slip uses up one of those two places.`,
    whoFieldsThere: `A close catcher, in a helmet where the position is close enough to warrant one.`,
    misunderstandings: `**"Leg slip catches the same chance as slip."** It catches a glance or a pad deflection, not an outside edge.`,
    takeaways: `- A slip on the leg side, behind square.
- Takes the glance and pad deflections.
- Consumes one of the two permitted leg-side positions behind square.

${REGION_NOTE}`,
    related: ['slip', 'leg-gully', 'short-leg', 'leg-glance', 'fielding-restrictions'],
    sourceKeys: [MCC],
    order: 290,
  }),

  fieldPosition({
    slug: 'leg-gully',
    title: 'Leg Gully',
    category: 'field-positions',
    difficulty: 'advanced',
    summary:
      'The leg-side mirror of gully, squarer than leg slip, for the ball fended off the body.',
    purpose: `Catches the ball that comes off the body or a hurried bat on the leg side behind square, squarer than a leg slip would reach: the fend at a short ball into the ribs, and the mistimed attempt to work one round the corner.

It is strongly associated with the short-ball plan, since a batter fending a bouncer from the hip most often deflects it into exactly this region.`,
    location: `Leg side, behind square, squarer and slightly deeper than leg slip, at close-catching depth.`,
    locationData: fieldSetting(
      'leg-gully',
      ['leg-slip', 'short-leg', 'square-leg', 'fine-leg'],
      'Leg gully, squarer than leg slip.',
    ),
    whenUsed: `With a short-ball strategy against pace, and to spin bouncing sharply. It also uses one of the two leg-side places behind square permitted by Law 28.`,
    whoFieldsThere: `A brave close catcher, in a helmet.`,
    takeaways: `- The leg-side gully: behind square, squarer than leg slip.
- Takes the fend off the body.
- Part of a short-ball field, and limited by Law 28.

${REGION_NOTE}`,
    related: [
      'gully',
      'leg-slip',
      'short-leg',
      'bouncer',
      'short-ball-strategy',
      'fielding-restrictions',
    ],
    sourceKeys: [MCC],
    order: 300,
  }),

  fieldPosition({
    slug: 'cow-corner',
    title: 'Cow Corner',
    category: 'field-positions',
    difficulty: 'intermediate',
    alsoIn: ['terminology'],
    summary:
      'The informal name for the region between deep midwicket and long on, where agricultural hitting goes.',
    purpose: `Not a formal position at all, which is the main thing to know about it. Cow corner is the **informal** name for the arc of boundary between deep midwicket and long on.

The name is a joke at the batter's expense: the implication is that no proper cricket shot goes there, so the area might as well be a field with cows in it. It attached itself to the region because a heaved cross-batted swing, played with more enthusiasm than technique, tends to land exactly there.`,
    location: `Leg side, on the boundary, between deep midwicket and long on.`,
    locationData: fieldSetting(
      'cow-corner',
      ['deep-midwicket', 'long-on', 'midwicket', 'deep-square-leg'],
      'Cow corner, between deep midwicket and long on.',
    ),
    whenUsed: `A captain would say "deep midwicket" or "long on" and adjust; they would not usually instruct a fielder to "cow corner". The term is used by commentators describing where a shot went rather than by captains setting a field.

In modern T20 cricket the joke has worn thin, because deliberate, well-executed hitting into that region is a core scoring method rather than a mishit.`,
    misunderstandings: `**"Cow corner is an official fielding position."** It is informal, and the Laws contain nothing like it.

**"A shot to cow corner is a bad shot."** It was once shorthand for a slog. In T20 cricket it is frequently the intended target.`,
    takeaways: `- Informal name for the boundary between deep midwicket and long on.
- Not a formal position, and not used in setting a field.
- Originally derogatory; now a deliberate T20 target area.

${REGION_NOTE}`,
    related: [
      'deep-midwicket',
      'long-on',
      'slog-sweep',
      'death-overs-batting',
      'basic-cricket-terminology',
    ],
    sourceKeys: [MCC],
    order: 310,
  }),
];
