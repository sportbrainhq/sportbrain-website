import { concept, definition, technology } from './cricket-explainer-helpers';
import { ICC_PC, REVIEWED } from './cricket-review-metadata';
import type { ExplainerSeed } from './explainer-types';

/**
 * Pitch and conditions, and officials and technology.
 *
 * Two editorial commitments run through this file, both about not overclaiming.
 *
 * **Causal claims about conditions are hedged where the evidence is weak.**
 * Cricket folklore is confident that cloud cover causes swing and that humidity
 * helps it. The experimental evidence for both is genuinely mixed, and stating
 * them as settled fact would be exactly the kind of error this library exists to
 * avoid. Each entry says what is well established, what is plausible and what is
 * contested.
 *
 * **Technology entries separate the concept from the provider.** Ball tracking
 * is a concept; Hawk-Eye is one commercial implementation. Edge detection is a
 * concept; UltraEdge and Snickometer are products. Which are used, where, and at
 * what specification is a competition-by-competition matter, and no technology
 * is available in most cricket played anywhere.
 */

const MCC = { key: 'mcc-laws' } as const;
const ICC = { key: 'icc-playing-conditions' } as const;
const WP_DRS = { key: 'wp-drs' } as const;
const WP_SWING = { key: 'wp-reverse-swing' } as const;

export const CRICKET_CONDITIONS: ExplainerSeed[] = [
  // ── Pitch and conditions ──────────────────────────────────────────────────
  concept({
    slug: 'pitch-preparation',
    title: 'Pitch Preparation',
    category: 'pitch-and-conditions',
    difficulty: 'intermediate',
    summary:
      'The groundstaff work that determines how a pitch will play, and the single largest controllable variable in cricket.',
    explanation: `A cricket pitch is prepared, not merely mown. Groundstaff spend days on a surface before a match, and the choices they make determine more about how the cricket will look than any tactical decision either captain takes.

Unlike the playing surfaces of most sports, a cricket pitch is **not standardised**. Two Test pitches prepared to the same brief can play completely differently, and that variation is treated as a feature of the sport rather than a defect.`,
    howItWorks: `The main levers, described in general terms because practice varies enormously by soil type and climate:

**Rolling.** Compacting the surface with heavy rollers binds the soil and produces a harder, faster, more predictable pitch. Under-rolled surfaces break up sooner.

**Watering and drying.** Moisture in the surface helps the seam grip and makes the ball deviate. A pitch left with moisture will seam early; one dried out thoroughly will not.

**Grass cover.** How much grass is left, and how long, affects seam movement and how quickly the surface deteriorates. Grass also binds the soil and slows break-up.

**Soil composition.** Clay content is the underlying determinant of how a pitch behaves and cannot be changed on a match-by-match basis. It is why pitches in different countries have recognisable characteristics.

Under the **Laws**, the ground authority is responsible for the pitch's selection and preparation before the match; once the match begins, its maintenance passes to the umpires' control.`,
    whyItMatters: `Preparation decides the balance of the contest. A green, damp pitch can make a good batting side look incompetent; a flat, hard one can make an excellent attack look ordinary.

It also decides how much a pitch will **change**, which is what makes multi-day cricket a different sport in its fourth innings. A well-rolled, grassy pitch holds together; a dry, under-prepared one breaks up and hands the match to spin.

The toss decision is, in large part, a judgement about the preparation.`,
    misunderstandings: `**"Pitches are standardised."** They are the least standardised surface in major sport.

**"Groundstaff can produce any pitch on request."** Soil, climate and time constrain them substantially; a curator in one country cannot readily produce another country's surface.

**"Preparation is neutral."** Home advantage in cricket is real and substantially a function of familiar conditions.`,
    takeaways: `- Rolling, moisture, grass and soil are the main levers.
- Pitches are deliberately not standardised.
- Preparation determines both initial behaviour and rate of deterioration.
- Responsibility shifts from the ground authority to the umpires once play starts.`,
    related: [
      'cricket-pitch',
      'grass-cover',
      'moisture',
      'pitch-deterioration',
      'bounce',
      'spin-friendly-pitch',
    ],
    sourceKeys: [{ ...MCC, locator: 'Laws 6, 9 (The pitch; Preparation and maintenance)' }],
    order: 10,
  }),

  definition({
    slug: 'grass-cover',
    title: 'Grass Cover',
    category: 'pitch-and-conditions',
    difficulty: 'intermediate',
    summary:
      'How much live grass is left on the pitch, which affects seam movement and how fast the surface breaks up.',
    explanation: `Grass cover is the amount of grass left on the pitch at the start of a match, and it is one of the first things commentators and captains assess.

A pitch described as **green** has substantial grass. A **bare** pitch has very little.

Grass does two things. It provides something for the ball's **seam to grip**, which encourages seam movement, particularly when combined with moisture. And it **binds the surface**, slowing the rate at which the pitch breaks up over a long match.

So a green pitch tends to help pace bowlers early and to last longer; a bare pitch tends to offer less initially and to deteriorate and turn more as the match progresses.`,
    whyItMatters: `Grass cover is the most visible clue about how a match will start, and it drives the toss decision more directly than almost anything else. A captain looking at a green pitch on an overcast morning is usually deciding to bowl.

The interaction with **moisture** is what matters most: grass with moisture in it seams substantially; the same grass on a dry, hot day may do very little.`,
    misunderstandings: `**"Green pitches always seam."** Green plus moisture usually does. Green and dry frequently does not.

**"Bare pitches are flat."** Bare pitches often turn, and they deteriorate faster.

**"More grass helps the bowling side."** It helps pace early and reduces the spin assistance later, so it depends on the attack.`,
    related: [
      'pitch-preparation',
      'moisture',
      'seam-movement',
      'seam-bowling',
      'pitch-deterioration',
      'spin-friendly-pitch',
    ],
    order: 20,
  }),

  definition({
    slug: 'moisture',
    title: 'Moisture',
    category: 'pitch-and-conditions',
    difficulty: 'intermediate',
    summary: 'Water in the pitch surface, which helps the seam grip and generally assists bowling.',
    explanation: `Moisture in the pitch is water retained in the surface, from preparation, from rain, from dew or simply from a cool morning.

Its effect on the surface is reasonably well understood: a damp surface **holds the seam** when the ball lands, so seam movement increases, and a damp pitch is usually slower and lower than the same pitch dry.

Moisture is also transient in a way most pitch characteristics are not. A pitch that seams for the first hour can be entirely different by lunch as the sun dries it, which is why the first session of a match is often the most bowler-friendly period of it.`,
    whyItMatters: `The combination of moisture and grass cover is the classic bowling-friendly condition, and it drives the standard decision to bowl first on a green, damp morning.

It is also why **the toss matters more in some conditions than others**: on a pitch that will dry out substantially by mid-afternoon, batting first means facing the worst of it.`,
    misunderstandings: `**"Moisture in the pitch is the same as humidity in the air."** They are different things with different effects. Surface moisture affects seam movement off the pitch; atmospheric humidity is claimed to affect swing in the air, and that claim is far less well supported.

**"Moisture always helps bowling."** It usually helps seam movement and can also slow a pitch down, which makes it easier to bat on once the initial movement has gone.`,
    related: ['grass-cover', 'seam-movement', 'dew', 'humidity', 'pitch-preparation', 'bounce'],
    order: 30,
  }),

  definition({
    slug: 'cracks',
    title: 'Cracks',
    category: 'pitch-and-conditions',
    difficulty: 'intermediate',
    summary: 'Fissures that open in a drying pitch, producing unpredictable bounce and deviation.',
    explanation: `Cracks are fissures that open in the pitch as it dries, and they widen over the course of a multi-day match.

Their effect is **unpredictability** rather than a consistent bias. A ball landing on the edge of a crack can grip and deviate sharply, skid on low, or bounce more than expected. A ball landing beside one does nothing unusual.

That randomness is the point, and it is what makes a heavily cracked pitch difficult to bat on: the batter cannot form a reliable expectation of what any given delivery will do.`,
    whyItMatters: `Cracks are one of the main mechanisms by which a pitch becomes harder to bat on as a match progresses, alongside general wear and the rough.

They also help **pace** bowlers as well as spinners, which distinguishes them from the rough: a fast bowler hitting a crack can produce a ball that either climbs or shoots low, and both are dangerous.`,
    misunderstandings: `**"Cracks mean the pitch will turn."** They produce variable bounce and deviation for all bowlers, not specifically turn.

**"Cracks make a pitch dangerous."** Usually they make it unpredictable; umpires assess separately whether a surface has become genuinely dangerous.

**"A cracked pitch is badly prepared."** Cracking is normal on dry, hot-weather pitches and is expected in some countries.`,
    related: [
      'pitch-deterioration',
      'wearing-pitch',
      'bounce',
      'rough',
      'seam-movement',
      'second-innings',
    ],
    order: 40,
  }),

  concept({
    slug: 'pitch-deterioration',
    title: 'Pitch Deterioration',
    category: 'pitch-and-conditions',
    difficulty: 'advanced',
    summary:
      'How a pitch degrades across a multi-day match, and why batting last is generally hardest.',
    explanation: `Pitch deterioration is the cumulative degradation of the surface over a match. It is one of the two great asymmetries of multi-day cricket, alongside the ageing ball, and it is the reason four innings on the same pitch are not four equivalent contests.

The changes compound in one direction:

**The surface loosens.** Grass dies, the top layer dries and crumbles, loose material gathers.

**Cracks widen.**

**The rough deepens** where bowlers land.

**Bounce becomes uneven.**

**Pace generally drops**, and **spin generally increases**.`,
    howItWorks: `The rate depends heavily on things nobody controls during the match: soil composition, how much the pitch was rolled, the weather, and how much grass was left to bind the surface.

That variability is why "the pitch will deteriorate" is a prediction rather than a certainty, and why captains sometimes get the toss decision wrong for entirely defensible reasons.

The tactical consequences are large and well established:

- **Winning the toss and batting** is usually preferred on a pitch expected to wear.
- **A first-innings lead** is worth more than the raw runs, because it usually means the opposition bats last.
- **Declining the follow-on** is frequently justified by not wanting to bat last.
- **A quality spinner** becomes disproportionately valuable in the fourth innings.`,
    whyItMatters: `It is the single strongest reason Test cricket's fourth innings is the hardest batting assignment in the sport, and the reason fourth-innings targets of 250 are regarded as substantial when a first-innings 400 was routine on the same pitch.`,
    formatDifferences: `A red-ball phenomenon. Limited-overs matches finish before meaningful deterioration occurs, which is one reason white-ball pitches are prepared for consistency rather than for longevity.`,
    misunderstandings: `**"All pitches deteriorate the same way."** Rates and character vary enormously, and some pitches barely change.

**"Deterioration always helps spin."** Usually, and uneven bounce can help pace bowlers too.

**"A deteriorating pitch is a bad pitch."** It is what makes multi-day cricket a four-innings contest rather than the same match played twice.`,
    takeaways: `- Cumulative degradation across a multi-day match.
- Slower, less even, more helpful to spin.
- Rate depends on soil, rolling, weather and grass, and is not fully predictable.
- Drives the toss decision, the value of a lead, and the follow-on choice.`,
    related: [
      'wearing-pitch',
      'cracks',
      'rough',
      'second-innings',
      'follow-on-decision',
      'spin-friendly-pitch',
    ],
    order: 50,
  }),

  definition({
    slug: 'bounce',
    title: 'Bounce',
    category: 'pitch-and-conditions',
    difficulty: 'beginner',
    summary:
      'How high the ball comes off the pitch, and how consistently, which shapes what shots are available.',
    explanation: `Bounce is the height the ball reaches after pitching. It is described in two dimensions, and both matter.

**How much.** A pitch with **high bounce** brings the ball up towards the batter's chest from a good length, which favours pace bowlers and makes the short ball a genuine weapon. A **low** pitch keeps the ball down, which makes driving easier and the bouncer ineffective.

**How consistent.** **Even bounce** lets a batter form reliable expectations. **Variable** or **uneven** bounce, from cracks or a broken surface, is what makes a pitch genuinely difficult, because the batter cannot predict the height of any given ball.

Of the two, consistency matters more. Batters cope with high bounce and struggle with unpredictable bounce.`,
    whyItMatters: `Bounce determines which lengths are dangerous. On a high-bouncing pitch, a good length is fuller than on a low one, because the ball has further to climb. That is why a length that is unplayable at one ground is a half-volley at another, and why bowlers talk about adjusting their length to conditions.

It also determines whether the **slip cordon** is worth staffing: bounce is what makes edges carry.`,
    misunderstandings: `**"High bounce always helps bowlers."** High and even bounce can be excellent for batting, since it is predictable and lets batters play with confidence.

**"Bounce is a property of the pitch alone."** The bowler's height and release point contribute substantially.

**"Low bounce means an easy pitch."** Low and uneven is among the hardest combinations to bat on.`,
    related: [
      'carry',
      'cracks',
      'good-length',
      'bouncer',
      'batting-friendly-pitch',
      'pitch-preparation',
    ],
    order: 60,
  }),

  definition({
    slug: 'carry',
    title: 'Carry',
    category: 'pitch-and-conditions',
    difficulty: 'intermediate',
    summary:
      'How well the ball travels through to the keeper and slips after pitching, which decides whether edges are catchable.',
    explanation: `Carry is how much pace and height the ball retains after bouncing, and specifically whether it reaches the wicketkeeper and the slip cordon at a catchable height.

A pitch with **good carry** sends edges through to the catchers. One with **poor carry** lets the ball die: edges drop short of the slips, the keeper takes the ball around his knees, and catches that would be routine elsewhere fall into the ground.

It is closely related to bounce and not identical to it. A pitch can bounce reasonably and still lack carry if it is slow, taking pace off the ball.`,
    whyItMatters: `Carry decides whether a fielding side's plan works. A bowler beating the bat repeatedly on a pitch with no carry gets nothing, because the edges do not reach anybody, and a captain will remove slips accordingly.

It is one of the main reasons the same bowling attack produces very different results in different countries, and one of the things bowlers mention first when describing an unfamiliar surface.`,
    misunderstandings: `**"Carry and bounce are the same."** A slow pitch can bounce and still not carry.

**"Poor carry only affects slip catching."** It also affects the keeper's position and whether a bouncer is worth bowling.`,
    related: [
      'bounce',
      'slip',
      'standing-back',
      'seam-bowling',
      'pitch-preparation',
      'batting-friendly-pitch',
    ],
    order: 70,
  }),

  concept({
    slug: 'seam-movement',
    title: 'Seam Movement',
    category: 'pitch-and-conditions',
    alsoIn: ['pace-bowling'],
    difficulty: 'intermediate',
    summary:
      'Sideways deviation caused when the ball’s seam lands on the pitch. Distinct from swing, which happens in the air.',
    explanation: `Seam movement is deviation that happens **at the bounce**. The raised seam lands on the surface, grips or catches unevenly, and the ball changes direction.

It must be kept separate from **swing**, which is curvature **in the air** before the ball pitches. The two look similar on television and have entirely different causes:

- **Swing:** aerodynamic, in flight, before the bounce.
- **Seam movement:** mechanical, at the moment of pitching.

The way to distinguish them on a replay is simply to watch whether the ball's path bends before the bounce or at it.

Conflating the two is the most common error in cricket writing and commentary, which is why this library gives each its own entry and each says what the other is.`,
    howItWorks: `The amount available depends overwhelmingly on the **surface**, which means it is largely outside the bowler's control:

- **Grass and moisture** hold the seam and produce movement.
- **Hard, dry surfaces** offer less grip.
- **Cracks and worn patches** produce larger and less predictable deviation.

What the bowler controls is whether the ball has a chance to seam: presenting the seam **upright** rather than angled, and bowling a length that lands the ball on the seam. A **wobble-seam** delivery deliberately randomises the landing orientation, which exploits a surface without needing to predict it.`,
    whyItMatters: `A ball that changes direction after pitching cannot be played on its original line, and there is no time to adjust: the batter has committed. That is why seam-friendly conditions produce such low scores in red-ball cricket.

It is also why the same bowler is transformed by conditions in a way a spinner is less, since the deviation is supplied by the pitch rather than by the bowler.`,
    misunderstandings: `**"Seam movement and swing are the same thing."** Pitch versus air. Different phenomena.

**"A seamer is any pace bowler."** "Seamer" is used loosely for any pace bowler; seam bowling as a technique specifically means exploiting movement off the pitch.

**"A bowler can produce seam movement at will."** The surface decides how much is available.`,
    takeaways: `- Deviation at the bounce, caused by the seam gripping the surface.
- Distinct from swing, which happens in the air.
- Depends mainly on grass, moisture, cracks and hardness.
- The bowler controls whether the ball can seam, not how much it does.`,
    related: [
      'seam-bowling',
      'swing-bowling',
      'seam-position',
      'grass-cover',
      'moisture',
      'cracks',
      'cross-seam-delivery',
    ],
    sourceKeys: [WP_SWING],
    order: 80,
  }),

  concept({
    slug: 'swing-conditions',
    title: 'Swing Conditions',
    category: 'pitch-and-conditions',
    alsoIn: ['pace-bowling'],
    difficulty: 'advanced',
    summary:
      'The atmospheric conditions said to help the ball swing, and an honest account of how well that is actually established.',
    explanation: `Cricket has a confident folklore about when the ball will swing: overcast skies, heavy air, high humidity, and certain grounds where "it always swings".

The honest position is that this folklore is **much less well established than its confidence implies**, and an encyclopaedia should say so rather than repeat it.

What is well supported:

**The ball matters.** A stable, angled seam and a difference in surface condition between the two halves are required for conventional swing. This is not in dispute.

**Speed matters**, in a non-linear way: there are ranges in which swing is more and less pronounced.

**The bowler matters.** Repeatable seam position and wrist stability are what make swing available at all.

What is genuinely contested:

**Cloud cover.** The traditional explanation, and the experimental evidence for a strong causal effect is weak and mixed. Several proposed mechanisms have been examined without clear support.

**Humidity.** Frequently asserted, and studies have produced conflicting results. Some find a small effect, some none.

**"Heavy air".** Not a well-defined physical concept, and air density effects are small over the relevant range.`,
    howItWorks: `Two possibilities are usually offered for why swing appears correlated with overcast conditions even if the atmosphere is not the direct cause.

**Confounding.** Overcast, cool days often coincide with damp outfields and pitches, which keep the ball's condition better for longer and slow down the roughening of the shiny side. That would produce more swing without the cloud doing anything aerodynamically.

**Perception.** Batters and bowlers expect swing in those conditions and interpret ambiguous movement accordingly, and commentary reinforces it.

Neither of those is proven either. The state of knowledge is: swing is real and well-described in general terms; its dependence on specific atmospheric conditions is not settled.`,
    whyItMatters: `This is a case where cricket's received wisdom is repeated as fact by broadcasters and reference works alike. A reader deserves to know which parts are established mechanics and which are traditional belief, particularly since the belief affects real decisions like the toss.`,
    misunderstandings: `**"Cloud cover causes swing."** Widely believed, and the evidence does not support stating it as fact.

**"Humid air makes the ball swing more."** Studies conflict; treat as unresolved.

**"Heavy air holds the ball up."** Not a well-defined mechanism, and air density effects over the relevant range are small.

**"Swing conditions are unpredictable, so nothing is known."** The ball's condition, seam stability and speed are well-established factors.`,
    takeaways: `- The ball's condition, seam stability and speed are the established factors.
- Cloud cover and humidity are traditional explanations with weak and mixed evidence.
- Confounding with damp conditions and perception effects are plausible alternatives.
- Swing itself is real; its atmospheric triggers are not settled.`,
    related: [
      'swing-bowling',
      'conventional-swing',
      'reverse-swing',
      'cloud-cover',
      'humidity',
      'new-ball',
      'seam-position',
    ],
    sourceKeys: [WP_SWING],
    order: 90,
  }),

  concept({
    slug: 'spin-friendly-pitch',
    title: 'Spin-friendly Pitch',
    category: 'pitch-and-conditions',
    difficulty: 'intermediate',
    summary:
      'A surface that grips the ball and lets it turn, usually dry, abrasive and often worn.',
    explanation: `A spin-friendly pitch offers the ball enough **grip** for the spin imparted by the bowler to translate into deviation off the surface.

The characteristics usually cited:

**Dry.** Moisture makes a surface skid; dryness lets it grip.

**Abrasive or rough-textured**, so the ball's surface catches.

**Loose material on top**, which develops with wear.

**Slower pace**, which gives the ball longer to deviate and the batter less pace to work with.

A pitch can be spin-friendly from the first day, which is common in hot, dry climates, or become so through wear over a multi-day match.`,
    howItWorks: `Turn is not the only assistance a pitch gives spinners, and this is often missed. A dry, slow pitch also produces:

**Grip that varies ball to ball**, so the batter cannot predict how much turn is coming.

**Uneven bounce** from a loose surface, which is as dangerous as turn.

**Slower pace**, which makes hitting through the line harder and mistimed shots more likely to go up rather than along.

Spinners on such surfaces bowl fuller, use the rough, and rely on the pitch rather than on extravagant revolutions.`,
    whyItMatters: `Spin-friendly conditions are the clearest case of home advantage in cricket, because sides accustomed to them have both the bowlers to exploit them and the batters with methods to survive them.

They also change the whole balance of a match: a target of 200 on a heavily turning fourth-innings pitch can be beyond a good side.`,
    misunderstandings: `**"Spin-friendly means the ball turns a lot."** Variable grip and low, uneven bounce matter as much as the amount of turn.

**"Only worn pitches help spin."** Dry, dusty pitches can turn from the first hour.

**"Wet pitches help spin."** Moisture generally makes the ball skid rather than grip.`,
    takeaways: `- Dry, abrasive, slow surfaces that grip the ball.
- Variable grip and uneven bounce matter as much as turn.
- Can be spin-friendly from day one or become so through wear.
- The clearest form of home advantage in cricket.`,
    related: [
      'spin-bowling',
      'rough',
      'wearing-pitch',
      'pitch-deterioration',
      'playing-against-spin',
      'moisture',
    ],
    order: 100,
  }),

  concept({
    slug: 'batting-friendly-pitch',
    title: 'Batting-friendly Pitch',
    category: 'pitch-and-conditions',
    difficulty: 'intermediate',
    summary:
      'A hard, true surface with even bounce and little sideways movement, where the ball does what the batter expects.',
    explanation: `A batting-friendly pitch, often called a **flat** pitch or a **good** one, is a surface on which the ball behaves predictably.

Its characteristics:

**Even bounce**, so the batter can rely on the height.

**Hard and true**, so the ball comes through at consistent pace.

**Little seam movement or turn**, so the ball goes where its line suggests.

**Good carry**, which paradoxically helps batters as well as bowlers: predictable pace makes timing easier.

The key property is **predictability** rather than any single measurement. A fast, bouncy pitch with even bounce can be excellent for batting, because batters can trust it.`,
    howItWorks: `On such a surface a bowling side's options narrow. Movement is unavailable, so bowlers rely on:

**Changes of pace**, since the pitch offers no other variation.

**Attacking the stumps** to bring LBW and bowled into play, since edges are less likely.

**Cross-seam and short-of-a-length bowling** to try to extract something from the surface.

**Patience and pressure**, since wickets will come from batting errors rather than from good deliveries.

Batting sides, conversely, can play their shots with confidence, and the totals reflect it.`,
    whyItMatters: `Flat pitches produce the large totals and the high-scoring draws that characterise some eras and venues, and they are a recurring subject of debate: whether the balance between bat and ball has tilted too far is one of cricket's permanent arguments.

For a reader, the practical value is understanding that a bowler's figures on a flat pitch are not comparable to the same figures on a seaming one.`,
    misunderstandings: `**"Batting-friendly means slow."** A fast, bouncy pitch with even bounce is excellent for batting.

**"A flat pitch means no wickets."** Wickets come from batting errors and from pressure, and flat pitches still produce results over five days.

**"A good pitch is one that helps batting."** "Good pitch" is used both for a batting surface and for a well-balanced one, and the ambiguity is genuine.`,
    takeaways: `- Predictability is the defining property, not slowness.
- Even bounce, true pace, little movement.
- Narrows a bowling side to pace variation and attacking the stumps.
- Makes bowling figures non-comparable with seaming conditions.`,
    related: [
      'bounce',
      'carry',
      'cricket-pitch',
      'attacking-the-stumps',
      'cross-seam-delivery',
      'pitch-preparation',
    ],
    order: 110,
  }),

  concept({
    slug: 'dew',
    title: 'Dew',
    category: 'pitch-and-conditions',
    alsoIn: ['limited-overs-concepts'],
    difficulty: 'intermediate',
    summary:
      'Moisture settling on the ground in evening matches, which usually favours the chasing side.',
    explanation: `Dew is water condensing on the outfield and pitch during evening and night matches, typically from the middle of the second innings onwards in humid conditions.

Its effects are practical and well attested by players:

**The ball gets wet.** A wet ball is harder to grip, which makes it difficult for **spinners** to impart revolutions and for pace bowlers to hold a seam position.

**The ball skids.** A wet ball comes off the pitch faster and lower, and turns less, which makes batting easier.

**Fielding is harder.** A wet ball is harder to catch and throw, and the outfield becomes faster.

The combined effect is that batting in the second innings becomes materially easier, which is why dew is one of the main inputs to the toss decision in night matches.`,
    howItWorks: `Sides respond in several ways:

**Choosing to bowl first**, so their batting comes when the dew has arrived.

**Bowling spin early**, before the ball becomes hard to grip, and pace later.

**Drying the ball**, which is permitted under the Laws with a towel under the umpires' supervision.

Ground staff may use ropes dragged across the outfield between innings, and some venues treat the surface, but dew cannot be eliminated.

**Where a competition permits it**, the toss decision effectively becomes a dew decision, and in some tournaments the pattern is strong enough that the side winning the toss almost always bowls.`,
    whyItMatters: `Dew is one of the few conditions effects in cricket that produces a clear, repeatable advantage, and it creates a genuine fairness problem in day-night tournaments: the toss can be worth a material share of the win probability.

That is why some competitions have considered scheduling and format changes to reduce it.`,
    misunderstandings: `**"Dew helps the bowlers because the ball is wet."** It hinders them: grip is lost and the ball skids.

**"Dew affects the pitch's behaviour like rain."** Its main effect is on the ball and the outfield rather than on the surface's bounce.

**"Dew is unpredictable."** In some venues and seasons it is highly predictable, which is exactly why it distorts the toss.`,
    takeaways: `- Evening moisture on the outfield and ball.
- The ball loses grip and skids, which favours batting.
- Usually makes chasing easier, distorting the toss.
- Managed by drying the ball and bowling spin early.`,
    related: [
      'moisture',
      'chase',
      'setting-a-target',
      'spin-bowling',
      'limited-overs-cricket',
      'outfield',
    ],
    sourceKeys: [{ ...MCC, locator: 'Law 41 (Ball maintenance)' }],
    order: 120,
  }),

  concept({
    slug: 'humidity',
    title: 'Humidity',
    category: 'pitch-and-conditions',
    difficulty: 'advanced',
    summary:
      'Atmospheric water vapour, traditionally said to help swing, with evidence that is genuinely mixed.',
    explanation: `Humidity is the amount of water vapour in the air, and cricket has long held that high humidity helps the ball swing.

The honest position is that this is **not well established**. Studies examining the relationship between humidity and swing have produced conflicting results: some report a small effect, others none, and the proposed mechanisms have not been clearly demonstrated.

What can be said with more confidence:

**Humidity affects the ball's condition indirectly.** A humid environment keeps the ball damper, which affects how the shine is maintained and how quickly the surface roughens, and ball condition is a genuine factor in swing.

**Humidity affects the players.** High humidity is physically demanding, affects bowlers' grip through sweat, and is a real factor in fatigue over a long day.

Those indirect effects may be what the folklore is actually observing.`,
    howItWorks: `The claimed direct mechanism is that water vapour changes the air's properties in a way that alters the boundary-layer behaviour producing swing. The difficulty is that water vapour is **less dense** than dry air at the same temperature and pressure, so humid air is slightly less dense, which is the opposite of the "heavy air" intuition often offered alongside it.

That internal inconsistency in the folklore is itself informative: the traditional explanation invokes both greater density and greater humidity, and those pull in opposite directions.`,
    whyItMatters: `Humidity is frequently cited on broadcasts as an explanation for swing, and a reader is entitled to know that the claim is contested rather than settled.

The practical effects on players and on ball condition are real and less often discussed, and they may matter more than the aerodynamic claim.`,
    misunderstandings: `**"Humid air is heavy air."** Humid air is slightly **less** dense than dry air at the same temperature and pressure.

**"Humidity definitely increases swing."** Evidence is mixed and the mechanism is not established.

**"Humidity has no effect on cricket."** It affects ball condition, grip and player fatigue, all of which matter.`,
    takeaways: `- Traditionally said to help swing; evidence is genuinely mixed.
- Humid air is less dense, contradicting the "heavy air" explanation.
- Real indirect effects on ball condition, grip and fatigue.
- Treat direct claims about swing as unresolved.`,
    related: [
      'swing-conditions',
      'swing-bowling',
      'cloud-cover',
      'dew',
      'moisture',
      'conventional-swing',
    ],
    sourceKeys: [WP_SWING],
    order: 130,
  }),

  concept({
    slug: 'cloud-cover',
    title: 'Cloud Cover',
    category: 'pitch-and-conditions',
    difficulty: 'advanced',
    summary:
      'Overcast conditions, traditionally believed to help swing bowling, with weak supporting evidence.',
    explanation: `Overcast skies are the single most-cited condition in cricket commentary as a predictor of swing. "There's cloud cover, the ball should swing" is close to a reflex.

**The evidence for a direct causal effect is weak.** No well-supported aerodynamic mechanism connects cloud cover to swing, and attempts to demonstrate the relationship experimentally have not produced clear results. It is one of the clearest examples of cricket folklore repeated as fact.

That is not the same as saying nothing is happening. Two indirect explanations are plausible:

**Confounding with dampness.** Overcast days are usually cooler and damper, the outfield stays wet longer, and the ball's shine survives better. Ball condition genuinely matters to swing, so the correlation could be real with the cloud itself doing nothing.

**Perception and expectation.** Everybody expects swing under cloud, so ambiguous movement is interpreted as swing, and commentary reinforces it. Batters may also play more cautiously, making bowlers appear more effective.`,
    howItWorks: `The practical effect that **is** well established is on **light**. Heavy cloud reduces visibility, which affects batting against fast bowling and is the trigger for bad-light decisions under the Laws, where the umpires judge whether conditions are dangerous or unreasonable.

Floodlights change that calculation, and in many competitions play continues under lights in conditions that would once have stopped it.`,
    whyItMatters: `Getting this right matters because the belief affects decisions. Captains bowl first under cloud, and if the effect is smaller than believed, that decision is being made on weaker grounds than it appears.

For a reader, the general lesson generalises: cricket's conditions folklore is confidently stated and unevenly supported, and the reverse-swing and humidity entries carry the same caution.`,
    misunderstandings: `**"Cloud cover causes swing."** Widely believed; not demonstrated.

**"There must be something to it, everyone says so."** Universality of belief is not evidence, and the confounding explanation accounts for the observation.

**"Cloud cover has no effect on cricket."** It affects light and visibility, which are real and consequential.`,
    takeaways: `- The most-cited swing explanation, with weak direct evidence.
- Confounding with damp conditions and expectation effects are plausible alternatives.
- Its well-established effect is on light and visibility.
- A good example of confidently-stated cricket folklore.`,
    related: [
      'swing-conditions',
      'humidity',
      'swing-bowling',
      'abandoned-match',
      'moisture',
      'conventional-swing',
    ],
    sourceKeys: [WP_SWING],
    order: 140,
  }),

  definition({
    slug: 'outfield',
    title: 'Outfield',
    category: 'pitch-and-conditions',
    difficulty: 'beginner',
    summary:
      'The grassed area between the pitch and the boundary, whose speed affects scoring and ball condition.',
    explanation: `The outfield is everything between the pitch and the boundary rope: the area fielders patrol and the ball travels across.

Two properties matter.

**Speed.** How quickly the ball travels across it, determined by grass length, moisture and how firm the ground is. A **fast** outfield turns well-timed shots into fours; a **slow** one stops them.

**Abrasiveness.** A dry, hard outfield roughens one side of the ball much faster than a lush, damp one, which is a real factor in when **reverse swing** becomes available.

The outfield is also where the fielding side's run-saving happens, so its speed changes how many fielders a captain needs on the boundary.`,
    whyItMatters: `Outfield speed is one of the least-discussed and most consequential variables in scoring. The same shot is a four on one ground and two on another, and totals at grounds with fast outfields are systematically higher.

The abrasiveness effect connects the outfield to bowling: dry, hard grounds bring reverse swing on sooner, which is one reason it is more commonly seen in some countries.`,
    misunderstandings: `**"The outfield is just the space between the action."** It affects scoring rates and the ball's condition.

**"Outfield speed is fixed for a ground."** It changes with weather, mowing and watering, and can differ between days of the same match.`,
    related: [
      'fast-outfield',
      'slow-outfield',
      'boundary',
      'reverse-swing',
      'boundary-fielding',
      'dew',
    ],
    order: 150,
  }),

  definition({
    slug: 'fast-outfield',
    title: 'Fast Outfield',
    category: 'pitch-and-conditions',
    difficulty: 'intermediate',
    summary:
      'A firm, short-grassed outfield across which the ball travels quickly, inflating scores.',
    explanation: `A fast outfield lets the ball run. Short, dry grass on firm ground means a shot that beats the infield usually reaches the boundary, and fielders have less time to cut it off.

The consequences:

**Higher scores.** Twos become threes and well-timed shots become fours.

**More boundary fielders needed**, which opens gaps in the ring.

**Harder fielding**, since the ball arrives faster and stopping it requires more ground covered.

**Faster ball wear** if the outfield is also abrasive, which brings reverse swing on sooner.`,
    whyItMatters: `Outfield speed is a systematic influence on scores that receives far less attention than the pitch. Comparing totals between grounds without accounting for it, or a batter's record at a home ground with a fast outfield, invites the wrong conclusion.`,
    misunderstandings: `**"A fast outfield only helps batters."** It also helps the fielding side's throws and makes run outs from the deep more likely.

**"Fast outfield means a fast pitch."** They are independent: a slow pitch can sit inside a fast outfield.`,
    related: [
      'outfield',
      'slow-outfield',
      'boundary',
      'boundary-fielding',
      'reverse-swing',
      'run-rate',
    ],
    order: 160,
  }),

  definition({
    slug: 'slow-outfield',
    title: 'Slow Outfield',
    category: 'pitch-and-conditions',
    difficulty: 'intermediate',
    summary: 'A damp or long-grassed outfield that holds the ball up, suppressing scores.',
    explanation: `A slow outfield holds the ball up. Long or damp grass on soft ground means shots that would be boundaries elsewhere are stopped, and the batters have to run.

The consequences:

**Lower scores**, and specifically fewer fours, since well-timed shots along the ground are cut off.

**More running required**, which shifts scoring towards fitness and placement rather than power.

**Fewer boundary fielders needed**, so a captain can keep more in the ring.

**Slower ball wear**, since a damp outfield does not roughen the ball as quickly, which delays reverse swing.

A slow outfield also increases the value of **hitting in the air**, since a shot along the ground will not reach the rope.`,
    whyItMatters: `Along with boundary size, outfield speed is why "par" for a ground differs from par elsewhere, and why a side batting first has to judge conditions rather than aim at a general total.`,
    misunderstandings: `**"A slow outfield means a low-scoring pitch."** They are independent variables.

**"Slow outfields only affect boundaries."** They change the whole scoring method, pushing sides towards aerial shots and hard running.`,
    related: [
      'outfield',
      'fast-outfield',
      'boundary',
      'setting-a-target',
      'par-score',
      'strike-rotation',
    ],
    order: 170,
  }),

  // ── Officials and technology ──────────────────────────────────────────────
  concept({
    slug: 'on-field-umpire',
    title: 'On-field Umpire',
    category: 'officials-and-technology',
    difficulty: 'beginner',
    summary:
      'The two officials on the field who control the match and make every decision in real time.',
    explanation: `Two umpires stand on the field. One is at the **bowler's end**, behind the stumps, and makes the decisions requiring a view down the pitch: LBW, caught behind, no-balls, wides. The other is at **square leg**, side-on to the striker, and rules on stumpings, run outs at the striker's end and hit wicket.

They swap positions every over, since the bowling changes ends.

Under the **Laws**, the umpires are the **sole judges** of fair and unfair play, of the fitness of the ground, weather and light, and of whether play can proceed. Their authority is extensive and, in the Laws' terms, final: even where DRS exists, it operates as a review process under playing conditions rather than a replacement of the umpire's role.`,
    howItWorks: `What an on-field umpire is doing on every ball:

**Watching the bowler's feet** for a front-foot or back-foot no-ball.

**Counting the deliveries** in the over.

**Judging the delivery**: legal, wide, or no-ball for height or double bounce.

**Responding to appeals**, which is a requirement rather than a courtesy: no dismissal without one for judged decisions.

**Signalling** to the scorers, and receiving acknowledgement, for boundaries, byes, leg byes, wides, no-balls, short runs and penalties.

They also manage the players: warnings for time-wasting, dangerous bowling and pitch damage all originate with them.`,
    whyItMatters: `Almost every decision in cricket is made by a person standing twenty metres away in real time, with no replay, on a judgement about a ball travelling at 140 km/h. The **umpire's call** provision in DRS exists precisely because the technology's margin of error is comparable to the human's on the closest decisions.

In the overwhelming majority of cricket played anywhere in the world there is no technology at all, so the on-field umpire's decision is simply the decision.`,
    misunderstandings: `**"DRS has replaced the umpires."** DRS reviews specific decisions where playing conditions provide for it, and most cricket has none.

**"The square-leg umpire is the junior one."** They have distinct responsibilities and swap ends every over.

**"Umpires only rule on dismissals."** Ground, weather, light, fair play and the conduct of the match are all theirs.`,
    takeaways: `- Two umpires, at the bowler's end and at square leg, swapping every over.
- Sole judges of fair play, ground, weather and light under the Laws.
- Appeals are required for judged dismissals.
- In most cricket, their decision is the only one available.`,
    related: ['appeals', 'third-umpire', 'match-referee', 'drs', 'square-leg', 'no-ball'],
    sourceKeys: [{ ...MCC, locator: 'Laws 2, 3 (The umpires)' }],
    order: 10,
  }),

  concept({
    slug: 'third-umpire',
    title: 'Third Umpire',
    category: 'officials-and-technology',
    difficulty: 'beginner',
    aliases: ['TV Umpire', 'Television Umpire'],
    summary:
      'An off-field official with access to replays, who decides referred and reviewed decisions.',
    explanation: `The third umpire sits off the field with access to television replays and the available technology, and rules on decisions referred to them.

Two routes reach them:

**Umpire referrals**, initiated by the on-field umpires, for things replays resolve better than the naked eye: run outs, stumpings, whether a catch carried, boundary decisions and, in many competitions, checking the front foot on every delivery for no-balls.

**Player reviews** under DRS, where a captain or dismissed batter challenges a decision. These are limited in number.

The third umpire's role, and the technology available to them, are set by **playing conditions** rather than by the Laws, so both vary by competition.`,
    howItWorks: `For a referred run out or stumping, the third umpire looks for whether any part of the batter or bat in hand was grounded behind the popping crease when the wicket was broken.

For a player-reviewed LBW they work through the sequence: legal delivery, where the ball pitched, whether the bat was involved, where the impact was, and whether the ball was hitting the stumps, with **umpire's call** applying where the margins are inside the tolerance.

For a catch they consider whether the ball carried, which is the hardest judgement available on a two-dimensional replay, and many competitions instruct deference to the on-field decision where the evidence is inconclusive.

Critically, the third umpire is generally checking whether the original decision was **clearly wrong**, not making a fresh one.`,
    whyItMatters: `The third umpire is where cricket's relationship with technology actually sits: not as an oracle, but as a reviewer working within defined tolerances and protocols that acknowledge the limits of the evidence.

Front-foot no-ball checking on every delivery is the clearest example of the role expanding: it catches no-balls that previously went unnoticed unless a wicket fell.`,
    misunderstandings: `**"The third umpire decides everything."** They rule only on referrals and reviews.

**"Using the third umpire costs a review."** Umpire referrals do not; player reviews do.

**"Every match has a third umpire."** It is a playing-condition provision, absent from most cricket.`,
    takeaways: `- An off-field official with replay access.
- Reached by umpire referrals, which are unlimited, and player reviews, which are not.
- Checks whether the on-field call was clearly wrong.
- Role and available technology are competition-specific.`,
    related: [
      'drs',
      'on-field-umpire',
      'umpires-call',
      'run-out-review',
      'stumping-review',
      'no-ball-technology',
    ],
    sourceKeys: [ICC, WP_DRS],
    order: 20,
    ruleSensitive: true,
    sourceRevision: ICC_PC,
    lastReviewedAt: REVIEWED,
  }),

  concept({
    slug: 'match-referee',
    title: 'Match Referee',
    category: 'officials-and-technology',
    difficulty: 'intermediate',
    summary:
      'An official responsible for conduct, discipline and the code of conduct, separate from the umpires who rule on play.',
    explanation: `The match referee is an official who oversees a match without ruling on play. In international cricket they are appointed from an ICC panel.

Their responsibilities are **conduct and process** rather than cricket decisions:

**Code of conduct.** Hearing charges for dissent, abusive language, excessive appealing, ball tampering and other offences, and imposing sanctions including fines and suspensions.

**Over-rate penalties**, where playing conditions provide for them.

**Reporting suspect bowling actions** for testing.

**Approving concussion replacements** and other playing-condition provisions requiring an official's decision.

**Reporting on pitch and outfield quality**, which feeds into venue assessments.

They do not overrule umpires on cricket decisions. An umpire's LBW decision is not appealable to the referee.`,
    howItWorks: `The referee sits off the field and reviews incidents referred by the umpires or arising from broadcast footage. Charges are laid under a **code of conduct** graded by seriousness, with prescribed ranges of sanction.

Because the code and the penalties are set by the governing body's regulations rather than by the Laws, they differ between international cricket and domestic competitions, and they are revised regularly.`,
    whyItMatters: `The referee is the mechanism separating **discipline** from **umpiring**. Umpires manage the match in real time; the referee handles consequences afterwards, which keeps the on-field officials from having to adjudicate conduct hearings.

The role also carries the ball-tampering jurisdiction, which is why the recurring controversies around ball condition are resolved through the referee rather than through the umpires alone.`,
    misunderstandings: `**"The referee can overturn an umpire's decision."** They have no jurisdiction over cricket decisions.

**"The match referee is the third umpire."** Entirely different roles.

**"Match referees exist in all cricket."** The role belongs to international and higher-level domestic cricket under the relevant regulations.`,
    takeaways: `- Handles conduct, discipline and process, not cricket decisions.
- Code of conduct, over rates, suspect actions, concussion replacements, pitch reports.
- Governed by regulations that vary by competition and are revised often.
- Cannot overrule an umpire on play.`,
    related: [
      'on-field-umpire',
      'third-umpire',
      'over-rate-and-time',
      'substitute-fielder',
      'bowling-action',
      'old-ball',
    ],
    sourceKeys: [ICC],
    order: 30,
    ruleSensitive: true,
    sourceRevision: ICC_PC,
    lastReviewedAt: REVIEWED,
  }),

  technology({
    slug: 'umpires-call',
    title: "Umpire's Call",
    category: 'officials-and-technology',
    difficulty: 'intermediate',
    summary:
      'The DRS provision that leaves a marginal LBW decision with the on-field umpire and retains the team’s review.',
    sourceRevision: ICC_PC,
    lastReviewedAt: REVIEWED,
    explanation: `Umpire's call is the DRS outcome that says: the technology's answer is inside its own margin of error, so the on-field umpire's decision stands.

It applies to LBW reviews, at two of the three checkpoints. If the evidence at **impact** or at **wickets** is marginal, the checkpoint returns umpire's call, the original decision is upheld, and the reviewing side **keeps its review**.

The **pitching** checkpoint carries no such margin: the ball either pitched in the permitted area or it did not.`,
    howItWorks: `Under current ICC playing conditions the margins are expressed in terms of how much of the ball is involved:

**Impact.** If less than half the ball is in line with the stumps at the point of impact, it is umpire's call.

**Wickets.** If less than half the ball is shown as hitting the stumps, it is umpire's call.

The logic is that **ball tracking projects rather than records**. It models where the ball would have gone after being intercepted, and that projection carries uncertainty which grows with the distance from impact to the stumps. Where the modelled answer falls inside that uncertainty, deferring to the human who was there is the honest response rather than pretending the model is exact.

These thresholds have been **revised more than once**, and the specific figures belong to a version of the playing conditions rather than to the concept. The zone's size and even whether it should exist have both been debated publicly.`,
    limitations: `Umpire's call cannot tell you what "really" happened. It is an explicit acknowledgement that on the closest decisions the technology's precision and the umpire's are comparable, so the tie-break goes to the original call.

It also produces the outcome spectators find hardest to accept: the same ball tracking graphic can uphold an out decision and a not-out decision, depending only on what the umpire said first. That is not an inconsistency; it is the provision working as designed.`,
    availability: `Only where DRS operates, which means international cricket and some major competitions. The specific margins are competition-specific and have changed over time. In the majority of cricket played anywhere, there is no umpire's call because there is no review.`,
    misunderstandings: `**"The team loses its review on umpire's call."** Under current conditions the review is retained.

**"Umpire's call means the technology was inconclusive."** It means the margin was inside the defined tolerance.

**"Pitching can be umpire's call."** It cannot; there is no margin at that checkpoint.

**"The thresholds are fixed."** They have been revised more than once.`,
    takeaways: `- Marginal impact or wickets leaves the on-field decision standing.
- The review is retained.
- Exists because ball tracking projects rather than records.
- Thresholds are playing conditions and have changed.`,
    related: ['drs', 'ball-tracking', 'lbw', 'third-umpire', 'reviews-strategy', 'on-field-umpire'],
    sourceKeys: [ICC, WP_DRS],
    order: 40,
  }),

  technology({
    slug: 'ball-tracking',
    title: 'Ball Tracking',
    category: 'officials-and-technology',
    difficulty: 'intermediate',
    summary:
      'Camera systems that reconstruct and project a delivery’s path, used for LBW reviews. A model, not a recording.',
    sourceRevision: ICC_PC,
    lastReviewedAt: REVIEWED,
    explanation: `Ball tracking uses multiple high-frame-rate cameras to reconstruct a delivery's trajectory, and then to **project** where the ball would have continued had the batter not intercepted it.

That projection is what an LBW review needs, because the question "would it have hit the stumps?" is about something that did not happen.

The concept is implemented by competing commercial providers, including **Hawk-Eye** and **Virtual Eye**, which differ in camera counts and frame rates. Which system is in use, and at what specification, is a matter for the competition rather than a property of cricket.`,
    howItWorks: `Cameras positioned around the ground capture the ball's position through its flight. The system fits a trajectory to those positions, identifies the pitching point and the impact point, and extrapolates forward from impact to the stumps.

The three checkpoints an LBW review uses come out of this: **pitching**, **impact**, and **wickets**.

The projection is the part to understand properly. Pitching and impact are **measured**; the path to the stumps is **modelled**. The uncertainty in that model grows with the distance the ball had to travel after impact, which is why an impact a long way down the pitch is treated more cautiously and why the **umpire's call** margins exist at all.`,
    limitations: `**It projects rather than records.** The path shown beyond the point of impact did not happen; it is a model's estimate.

**Uncertainty grows with projection distance.** A pad struck close to the stumps gives a confident projection; one struck well down the pitch does not.

**Specifications vary by provider and competition**, so the precision available in one match is not the precision available in another.

**It cannot resolve bat involvement**, which is what edge detection is for, and it does not judge whether a shot was offered, which stays with the on-field umpire.`,
    availability: `International cricket and major competitions, subject to playing conditions. Absent from most domestic and all recreational cricket. Some competitions use a reduced DRS without ball tracking, in which case LBW reviews are limited to what replays and edge detection can show.`,
    misunderstandings: `**"Ball tracking films the ball hitting the stumps."** It models that portion of the path.

**"The graphic is definitive."** It carries uncertainty, which the umpire's-call margin exists to accommodate.

**"Ball tracking is one system."** Several competing providers exist with different specifications.

**"It decides LBWs."** It informs the third umpire on three of the five LBW conditions.`,
    takeaways: `- Multiple cameras reconstruct the path and project it past the impact point.
- Pitching and impact are measured; the path to the stumps is modelled.
- Uncertainty grows with projection distance, hence umpire's call.
- Provider and specification vary by competition.`,
    related: ['drs', 'umpires-call', 'lbw', 'edge-detection', 'third-umpire', 'no-ball-technology'],
    sourceKeys: [ICC, WP_DRS],
    order: 50,
  }),

  technology({
    slug: 'edge-detection',
    title: 'Edge Detection',
    category: 'officials-and-technology',
    difficulty: 'intermediate',
    aliases: ['UltraEdge', 'Snickometer', 'Snicko', 'Real Time Snicko'],
    summary:
      'Synchronised audio and video used to establish whether the ball touched the bat. The concept, not any one product.',
    sourceRevision: ICC_PC,
    lastReviewedAt: REVIEWED,
    explanation: `Edge detection uses **directional microphones** synchronised with high-speed video to establish whether the ball made contact with the bat, and when.

The output is a waveform displayed against the video: a spike in the audio at the frame where bat and ball were closest suggests contact.

The distinction worth holding on to is between the **concept** and the **products**. Edge detection is the concept; **UltraEdge**, **Snickometer** and **Real Time Snicko** are commercial implementations with different technical characteristics and licensing. Which is used depends on the broadcaster and the competition, and the names are not interchangeable with the concept.`,
    howItWorks: `Microphones near the stumps capture the sound. The system aligns the audio trace with the video timeline so that a spike can be located to a specific frame.

The third umpire then judges: was there a spike, did it occur at the moment of closest approach, and is it consistent with bat-on-ball rather than another source?

That last judgement is the crux, and it is a judgement rather than a reading.`,
    limitations: `**It shows that a sound occurred, not what made it.** Bat on pad, bat hitting the ground, a spike from the batter's clothing, and glove on bat can all produce traces, and distinguishing them is interpretive.

**Synchronisation matters.** A spike slightly out of alignment with the frame of closest approach is ambiguous.

**It cannot show contact with no sound.** Very fine contacts may not register clearly.

**Provider variation.** Sensitivity and presentation differ between implementations.

**Not universally available**, and where a competition uses reduced DRS, edge detection may be present without ball tracking or vice versa.`,
    availability: `International cricket and major competitions, varying by broadcaster and by playing conditions. Thermal imaging, marketed as **Hot Spot**, has been used in some competitions as an additional or alternative method and is not universally available either.`,
    misunderstandings: `**"UltraEdge is the technology."** It is one product implementing edge detection.

**"A spike proves an edge."** It proves a sound; its source is a judgement.

**"Edge detection is objective and ball tracking is not."** Both require interpretation; edge detection's is about what caused a sound.

**"Every review has edge detection available."** Availability varies by competition.`,
    takeaways: `- Directional microphones synchronised to video, showing a sound at a frame.
- UltraEdge and Snickometer are products; edge detection is the concept.
- Shows that a sound occurred, not what caused it.
- Availability and sensitivity vary by competition and broadcaster.`,
    related: ['drs', 'thermal-imaging', 'ball-tracking', 'caught', 'third-umpire', 'edge'],
    sourceKeys: [ICC, WP_DRS],
    order: 60,
  }),

  technology({
    slug: 'thermal-imaging',
    title: 'Thermal Imaging',
    category: 'officials-and-technology',
    difficulty: 'advanced',
    aliases: ['Hot Spot', 'Hotspot', 'Infrared Imaging'],
    summary:
      'Infrared cameras showing friction heat where the ball made contact, used in some competitions only.',
    sourceRevision: ICC_PC,
    lastReviewedAt: REVIEWED,
    explanation: `Thermal imaging uses infrared cameras to detect the small amount of heat generated by friction when the ball strikes an object: bat, pad, glove or ground.

A contact appears as a bright mark at the point of impact, which can distinguish bat from pad in a way audio alone sometimes cannot.

It is marketed as **Hot Spot**, and this is the clearest case in cricket of a technology that is **not** universally available: it has been used in some competitions and countries and not others, its use has varied over time, and cost has been a stated factor in that.`,
    howItWorks: `Cameras positioned at each end of the ground capture infrared images through the delivery and the shot. Where the ball has made contact, friction raises the surface temperature slightly and the camera registers a mark.

The third umpire uses it as one input alongside replays and edge detection, particularly for distinguishing bat-pad contacts, where the sequence of two sounds close together is hard to resolve from audio alone.`,
    limitations: `**Faint contacts may not register.** A very fine edge may generate too little heat to show clearly, which has been the main technical criticism.

**Marks can be ambiguous.** Residual heat from a previous contact, or marks from the ball hitting the ground, complicate interpretation.

**Availability is genuinely limited**, more so than ball tracking or edge detection, and it has been used and then dropped in some competitions.

**It is one input, not a verdict**, and the third umpire weighs it against other evidence.`,
    availability: `Used in some competitions and not others, with availability varying by broadcaster, country and era. It is the clearest illustration of why claims about "what DRS shows" cannot be made in general: the evidence available depends entirely on which technologies the competition has.`,
    misunderstandings: `**"Hot Spot is part of DRS everywhere."** It is available in a minority of cricket.

**"Thermal imaging is conclusive."** Faint contacts may not register and marks can be ambiguous.

**"It replaces edge detection."** It is complementary and used alongside it where available.`,
    takeaways: `- Infrared cameras showing friction heat at the point of contact.
- Particularly useful for bat-pad distinctions.
- Faint contacts may not register.
- Availability is limited and has varied by competition and era.`,
    related: ['edge-detection', 'drs', 'third-umpire', 'caught', 'lbw', 'ball-tracking'],
    sourceKeys: [ICC, WP_DRS],
    order: 70,
  }),

  technology({
    slug: 'no-ball-technology',
    title: 'No-ball Technology',
    category: 'officials-and-technology',
    difficulty: 'intermediate',
    summary:
      'Third-umpire checking of the bowler’s front foot on every delivery, which changed how no-balls are caught.',
    sourceRevision: ICC_PC,
    lastReviewedAt: REVIEWED,
    explanation: `In many international matches the third umpire checks the bowler's **front foot** on every delivery using a dedicated camera feed, and informs the on-field umpire if it was a no-ball.

This is a significant procedural change. Previously the on-field umpire watched the foot and then had to switch attention up the pitch to judge the delivery and any appeal, and front-foot no-balls were routinely missed unless a wicket fell, at which point the replay was checked.

Automating the check means **every** delivery is examined, which catches no-balls that would previously have gone unremarked.`,
    howItWorks: `A camera trained on the crease captures the front-foot landing. The third umpire, or an automated system with third-umpire confirmation, determines whether some part of the front foot was behind the popping crease at landing.

If it was not, the third umpire communicates a no-ball to the on-field umpire, who calls it. The on-field umpire retains the call for everything else: back-foot infringements, height, double bounce and the rest of Law 21.

Implementations differ, and the degree of automation has varied as the technology has developed.`,
    limitations: `**It addresses the front foot only.** Other no-ball grounds remain with the on-field umpire.

**There is a communication delay**, small but real, between the delivery and the call, which is why a call can arrive after the ball has been played.

**Availability varies by competition**, and this is the crucial limitation: it is a playing-condition provision present in some international cricket and absent from the great majority of matches.

**It does not change the Law**, only the reliability of detection.`,
    availability: `Used in many but not all international matches and some major competitions, under the relevant playing conditions. The specifics of implementation have changed over time as the systems have developed.`,
    misunderstandings: `**"No-ball technology changed the no-ball Law."** The Law is unchanged; detection improved.

**"It checks all no-balls."** Front foot only.

**"It is used everywhere."** It is a playing-condition provision, absent from most cricket.

**"It removed the umpire's role."** The on-field umpire still makes the call, and all other no-ball grounds remain theirs.`,
    takeaways: `- Third-umpire checking of the front foot on every delivery.
- Catches no-balls previously missed unless a wicket fell.
- Front foot only; other grounds stay with the on-field umpire.
- A playing-condition provision, not universally available.`,
    related: ['no-ball', 'third-umpire', 'drs', 'on-field-umpire', 'free-hit', 'crease-rules'],
    sourceKeys: [ICC, { ...MCC, locator: 'Law 21' }],
    order: 80,
  }),

  technology({
    slug: 'run-out-review',
    title: 'Run-out Review',
    category: 'officials-and-technology',
    difficulty: 'intermediate',
    summary:
      'A third-umpire referral checking whether the batter was in their ground when the wicket was broken.',
    sourceRevision: ICC_PC,
    lastReviewedAt: REVIEWED,
    explanation: `A run-out review is an **umpire referral**, not a player review: the on-field umpire refers a close run out to the third umpire, and it does not cost either side a review from their DRS allocation.

The question is narrow and factual: at the moment the wicket was broken, was any part of the batter's **person or bat in hand grounded behind the popping crease**?

Because it is a question about two observable events and their relative timing, it is among the decisions replay technology resolves best.`,
    howItWorks: `The third umpire looks for the frame in which the wicket is **broken** — a bail completely dislodged or a stump out of the ground — and then examines whether the batter was in their ground at that instant.

Two details decide most reviews:

**The bat must be grounded and in hand.** A bat bouncing or in the air does not count, and a dropped bat does not count. This is why replays freeze on the bat rather than the batter.

**Airborne is not grounded**, subject to the Law 30 provision protecting a batter who has been in their ground and is diving towards it.

Where available, additional camera angles and higher frame rates make the timing judgement more reliable, and this is one of the reasons run-out decisions are now rarely controversial.`,
    limitations: `**Frame rate limits precision.** Between two frames the ball moves, and on the very closest decisions the evidence can be genuinely inconclusive.

**Camera angle matters.** A side-on view of the crease is far more useful than an oblique one.

**Availability varies**, and in most cricket there is no referral available at all: the square-leg umpire decides in real time.`,
    availability: `Wherever a third umpire and replay facilities exist, which is international cricket and major competitions. As an umpire referral rather than a player review, it is usually available in competitions that have any technology at all, even those without full DRS.`,
    misunderstandings: `**"A run-out review costs a review."** Umpire referrals do not use a team's allocation.

**"The batter is safe if the bat is over the line."** It must be **grounded** behind the line, and in hand.

**"Run-out reviews are part of DRS."** They are umpire referrals, which predate and sit alongside player reviews.`,
    takeaways: `- An umpire referral, not a player review, so no allocation is used.
- Tests whether person or bat in hand was grounded behind the crease.
- The bat must be grounded and in hand; airborne does not count.
- Frame rate and camera angle set the limits.`,
    related: [
      'run-out',
      'batters-ground',
      'third-umpire',
      'stumping-review',
      'direct-hit',
      'run-out-technique',
    ],
    sourceKeys: [ICC, { ...MCC, locator: 'Laws 29, 30, 38' }],
    order: 90,
  }),

  technology({
    slug: 'stumping-review',
    title: 'Stumping Review',
    category: 'officials-and-technology',
    difficulty: 'intermediate',
    summary:
      'A third-umpire referral on a stumping, checking the batter’s ground and, where relevant, whether the ball touched the bat.',
    sourceRevision: ICC_PC,
    lastReviewedAt: REVIEWED,
    explanation: `A stumping review is an **umpire referral** to the third umpire, and like a run-out review it does not cost a team's DRS allocation.

The primary question is the same as for a run out: was any part of the batter's person or bat in hand grounded behind the popping crease when the keeper broke the wicket?

There is a secondary question that makes stumpings more intricate than run outs. If the ball may have touched the **bat** on its way through, the batter could be out **caught** instead, or the contact could have deflected the ball, so the sequence matters.

How much a stumping referral is permitted to examine beyond the stumping itself has been the subject of playing-condition changes, and it is worth knowing that the scope of these referrals has been narrowed and adjusted over time.`,
    howItWorks: `The third umpire finds the frame in which the wicket is broken and assesses the batter's ground, applying the same grounded-and-in-hand test as for a run out.

Where the possibility of bat contact arises, they may examine replays and, where available, edge detection.

Because a stumping typically happens with the batter advancing down the pitch, the margins are often larger than for a run out, and clear-cut decisions are common.`,
    limitations: `**Frame rate and angle limits**, as for run outs.

**Scope.** What a stumping referral may consider has been defined and redefined by playing conditions, so the answer to "can they also check for an edge?" depends on the competition and the season.

**Availability.** Absent from most cricket, where the square-leg umpire decides.`,
    availability: `Wherever a third umpire and replays exist. As with run-out reviews, it is an umpire referral, so it is generally available in competitions with any technology.`,
    misunderstandings: `**"A stumping review uses a team review."** It is an umpire referral.

**"The third umpire can check anything during a stumping review."** The permitted scope is set by playing conditions and has changed.

**"Stumped and caught are decided together."** They are distinct dismissals; if the ball touched the bat and was caught, the dismissal is different.`,
    takeaways: `- An umpire referral; no team allocation used.
- Tests the batter's ground on the same grounded-and-in-hand basis.
- Bat contact raises a secondary question, and the permitted scope has changed over time.
- Absent from most cricket.`,
    related: [
      'stumped',
      'stumping',
      'batters-ground',
      'third-umpire',
      'run-out-review',
      'edge-detection',
    ],
    sourceKeys: [ICC, { ...MCC, locator: 'Laws 30, 39' }],
    order: 100,
  }),
];
