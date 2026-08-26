import { concept, definition, tactic } from './cricket-explainer-helpers';
import { ICC_PC, MCC_CODE, REVIEWED } from './cricket-review-metadata';
import type { ExplainerSeed } from './explainer-types';

/**
 * Equipment, terminology, and the one remaining pace-bowling concept.
 *
 * Two editorial rules.
 *
 * **Equipment entries avoid brands.** Bats, balls and pads are described by
 * their regulated dimensions and their function, not by manufacturer. Where a
 * product name has become the common term for a technology or a piece of kit,
 * it is recorded as an alias with its status stated.
 *
 * **Terminology entries label their register.** Cricket's vocabulary mixes Law
 * definitions ("no-ball"), statistical conventions ("five-for") and pure slang
 * ("jaffa", "cow corner"). A reader needs to know which is which, because using
 * a piece of dressing-room slang as though it were a defined term is exactly the
 * error this category should prevent. Each entry says whether it is official,
 * conventional or informal.
 */

const MCC = { key: 'mcc-laws' } as const;

export const CRICKET_EQUIPMENT_AND_TERMS: ExplainerSeed[] = [
  // ── The one outstanding pace concept ──────────────────────────────────────
  tactic({
    slug: 'death-bowling',
    title: 'Death Bowling',
    category: 'pace-bowling',
    alsoIn: ['limited-overs-concepts', 'tactics-and-strategy'],
    difficulty: 'intermediate',
    summary:
      'Bowling the final overs of a limited-overs innings, where the job is denying hittable balls rather than taking wickets.',
    explanation: `Death bowling is the specialist discipline of bowling the closing overs of a limited-overs innings, when the batting side is attacking with almost no regard for wickets.

The objective inverts from normal bowling. A death bowler is not primarily trying to take wickets; they are trying to **not bowl a hittable ball**. Six deliveries that concede four runs is an excellent over even without a wicket, and a wicket in an over that costs sixteen is a poor one.

It is among the highest-value skills in white-ball cricket and among the rarest, which is why death specialists are selected and paid for that ability specifically.`,
    howItWorks: `The deliveries, and each exists because it is hard to hit rather than because it threatens the stumps:

**The yorker.** At the batter's feet, offering no length to work with. The primary weapon, and the hardest to execute.

**The wide yorker.** Full and outside off, denying the batter leverage.

**The slower ball.** Attacks timing, and errors go into the air.

**Back of a length.** Too short to drive, too full to pull comfortably.

The field is as important as the ball: most fielders on the boundary, protecting the areas the batter can reach, with the specific configuration chosen against the batter's strengths.

The bowler is also managing the **arithmetic**: a dot ball at the death is worth more than at any other point, because it removes a delivery from a batting side that has very few left.`,
    tradeoffs: `The margins are brutal in both directions. A yorker missed short is a hittable length ball; missed full it is a **full toss**, the most punished delivery in cricket. So the highest-value delivery is also the one whose failure modes are worst.

There is also a trade between **wicket-taking and containment**. Attacking the stumps at the death can produce bowled and LBW, and it also offers the batter a ball in their arc. Bowling wide denies them leverage and risks a wide being called.

And the plan is **readable**: a batter who knows a yorker is coming can premeditate a ramp or scoop, which is precisely why those shots exist.`,
    whenYouWillSeeIt: `The last four or five overs of a T20 innings and the last ten of an ODI, plus the closing overs of any chase.`,
    formatDifferences: `A limited-overs discipline. Test cricket has no death overs, because there is no fixed end to an innings, though a similar skill set is used against a set batter with a spread field.`,
    misunderstandings: `**"Death bowling is about pace."** Accuracy and variation matter more, and several of the best death bowlers rely primarily on slower balls.

**"A wicket at the death is worth more than a cheap over."** Usually the reverse: with few deliveries left, denying runs is the objective.

**"Yorkers are the whole skill."** The mix, the field and the ability to change the plan mid-over matter as much.`,
    takeaways: `- Denying hittable balls rather than taking wickets.
- Yorker, wide yorker, slower ball, back of a length, with a boundary field.
- The yorker's failure modes are a length ball or a full toss.
- A limited-overs discipline with no Test equivalent.`,
    related: [
      'yorker',
      'wide-yorker',
      'slower-ball',
      'death-overs',
      'death-overs-batting',
      'scoop',
      'managing-overs',
    ],
    order: 210,
  }),

  // ── Equipment ─────────────────────────────────────────────────────────────
  concept({
    slug: 'cricket-bat',
    title: 'Cricket Bat',
    category: 'equipment',
    difficulty: 'beginner',
    summary: 'A wooden blade and handle, regulated in size and, since 2017, in thickness.',
    explanation: `A cricket bat has two parts: a **blade** of willow, and a **handle**, traditionally cane with rubber grips, joined into the blade.

The bat's face is flat and its back is ridged, with the thickest part, the **middle** or **sweet spot**, positioned where a batter most often makes contact. Below the middle is the **toe**; the edges run down each side; the narrow region near the toe and the top of the blade are both less effective for hitting.

Under **Law 5**, the bat is limited in **length** and **width**, and since the 2017 Code also in **depth and edge thickness**. Those depth and edge limits were introduced deliberately: bats had become progressively thicker, and the concern was that the balance between bat and ball had shifted. It is one of the clearest cases of the Laws responding to equipment development.

The bat must also be made of wood, aside from permitted coverings and repairs, which is why composite and metal bats are not legal.`,
    howItWorks: `Only the **bat, or a hand or glove holding it,** counts as the bat for the purposes of the Laws. That matters constantly:

- **Caught** requires contact with the bat or a glove holding it, so a ball off the forearm is not out caught.
- **Batter's ground** requires the bat to be **in hand and grounded**, which is why a dropped or bouncing bat costs run outs.
- **LBW** requires that the ball did not touch the bat first, so an inside edge onto the pad rules it out.

Bats are also regulated in condition: repairs and coverings are permitted within limits, and a bat that does not conform can be ruled out by the umpires.`,
    whyItMatters: `The bat's regulated dimensions are one of the few levers the Laws have over the balance between bat and ball. Boundary sizes vary, pitches vary, and the ball's specification is narrow, so bat size is a rare standardised variable, and the 2017 depth restrictions were an explicit intervention in the contest.`,
    misunderstandings: `**"There are no limits on bat size."** Length, width, depth and edge thickness are all limited under Law 5.

**"Any material is allowed."** The blade must be wood.

**"The forearm counts as the bat."** Only the bat and a hand or glove holding it.`,
    takeaways: `- Willow blade, cane handle, with a defined middle.
- Law 5 limits length, width and, since 2017, depth and edge thickness.
- Only the bat and a hand or glove holding it count as the bat.
- The depth limits were a deliberate intervention in the bat-ball balance.`,
    related: ['cricket-ball', 'batting-gloves', 'batters-ground', 'caught', 'lbw', 'batting-grip'],
    sourceKeys: [{ ...MCC, locator: 'Law 5 (The bat)' }],
    order: 10,
    ruleSensitive: true,
    sourceRevision: MCC_CODE,
    lastReviewedAt: REVIEWED,
  }),

  concept({
    slug: 'cricket-ball',
    title: 'Cricket Ball',
    category: 'equipment',
    difficulty: 'beginner',
    summary:
      'A cork core wound with string and covered in stitched leather, whose seam and condition drive most of what bowlers can do.',
    explanation: `A cricket ball is a **cork core**, tightly wound with string, covered in **leather** — usually two or four pieces — stitched together around the circumference. The raised ridge of stitching is the **seam**, and it is the single most important feature of the ball.

Under **Law 4**, the ball's **weight and circumference** are specified within narrow tolerances, with different specifications for men's, women's and junior cricket.

The ball's condition changes constantly through use, and those changes drive the bowling contest:

**New:** hard, shiny, pronounced seam. Bounce, carry, conventional swing, seam movement.

**Middle-aged:** softer, less shine, seam flattening. Generally the easiest phase to bat.

**Old:** soft, one side worn rough. Possible reverse swing, better grip for spin.`,
    howItWorks: `**Ball maintenance is regulated.** A fielding side may **polish** the ball, **dry** it with a towel under the umpires' supervision, and **remove mud**. Altering its condition by any other means — applying substances, scuffing, lifting the seam — is an offence under **Law 41** with penalties attached.

This is where the recurring ball-tampering controversies live. Reverse swing depends on asymmetric ball condition, that condition can be produced legally by a dry, abrasive outfield, and the boundary between legal maintenance and illegal alteration is a matter for the umpires and the match referee.

Ball **replacement** is also governed: a lost or damaged ball is replaced by one in comparable condition, not a new one, and in Test cricket a second new ball becomes available after a set number of overs.`,
    whyItMatters: `Almost everything a pace bowler can do depends on the ball's condition, and much of what a spinner can do depends on its wear. The arc of a Test innings — new-ball threat, comfortable middle, reverse swing, second new ball — is a story about a leather object degrading.`,
    formatDifferences: `**Red** for Test and most first-class cricket. **White** for limited-overs cricket, being more visible under lights and against coloured clothing. **Pink** for day-night Tests, as a compromise between visibility and red-ball behaviour. The three are not identical in construction or behaviour, and the differences are debated.`,
    misunderstandings: `**"All ball maintenance is cheating."** Polishing, drying and cleaning are expressly permitted.

**"A replacement ball is a new ball."** It should be in comparable condition to the one replaced.

**"Red, white and pink balls behave the same."** They differ, and the differences are a live subject of discussion.`,
    takeaways: `- Cork core, wound string, stitched leather, with a raised seam.
- Law 4 specifies weight and circumference.
- Condition changes drive swing, seam movement and spin through an innings.
- Polishing, drying and cleaning are legal; anything else is a Law 41 offence.`,
    related: [
      'red-ball',
      'white-ball',
      'pink-ball',
      'new-ball',
      'old-ball',
      'seam-position',
      'reverse-swing',
    ],
    sourceKeys: [{ ...MCC, locator: 'Laws 4, 41 (The ball; Unfair play)' }],
    order: 20,
    ruleSensitive: true,
    sourceRevision: `${MCC_CODE}; second new ball from ${ICC_PC}`,
    lastReviewedAt: REVIEWED,
  }),

  definition({
    slug: 'red-ball',
    title: 'Red Ball',
    category: 'equipment',
    alsoIn: ['red-ball-concepts'],
    difficulty: 'beginner',
    summary:
      'The traditional ball, used in Test and most first-class cricket, which lasts long enough to reverse.',
    explanation: `The red ball is cricket's traditional ball, used in Test cricket and most first-class cricket, and the reason the phrase **red-ball cricket** means the long format.

Its characteristics come from being used for a long time in one innings. Under ICC Test playing conditions a single ball is used until a second new one becomes available after a set number of overs, commonly 80. That means the ball goes through its whole life cycle: hard and shiny, then middle-aged, then genuinely old and possibly reversing.

Red is used in daylight because it is visible against grass and a light sky, and it holds its colour reasonably as it wears.`,
    whyItMatters: `The red ball's longevity is what creates red-ball cricket's tactical structure. Reverse swing, the second new ball decision, and the spinners' growing influence as the ball roughens all require a ball that has been in use for fifty or more overs, which no white-ball format allows.`,
    misunderstandings: `**"Red-ball cricket means Test cricket."** It means the long format generally: first-class cricket is red-ball too.

**"The red ball swings more than the white."** They differ in construction and wear behaviour, and comparisons are contested rather than settled.`,
    related: [
      'cricket-ball',
      'white-ball',
      'pink-ball',
      'new-ball',
      'old-ball',
      'reverse-swing',
      'test-cricket',
    ],
    order: 30,
  }),

  definition({
    slug: 'white-ball',
    title: 'White Ball',
    category: 'equipment',
    alsoIn: ['limited-overs-concepts'],
    difficulty: 'beginner',
    summary: 'The limited-overs ball, more visible under lights and against coloured clothing.',
    explanation: `The white ball is used in limited-overs cricket, and gives **white-ball cricket** its name.

It exists for **visibility**: under floodlights and against coloured clothing, a red ball is hard to see, and the switch to white was part of the move to day-night one-day cricket.

Its behaviour differs from the red ball's in ways that are discussed constantly and not fully settled. What is clear is that it **discolours** and becomes harder to see as it wears, which is part of why limited-overs cricket has adopted ball-replacement practices: current ICC ODI conditions use **two new balls per innings**, one from each end, so neither gets old.

That has a real consequence: with two balls in rotation across fifty overs, neither becomes old enough to **reverse**, which removed a phase of ODI cricket that previously existed.`,
    whyItMatters: `The two-new-balls provision is a good example of a playing condition changing the sport's texture. Reverse swing in the late overs of an ODI was a feature of the format and is now largely absent, which has been criticised on those grounds.`,
    misunderstandings: `**"White balls swing more."** Comparisons are contested; construction and wear differ, and the claim is not settled.

**"White-ball cricket means T20."** It covers all limited-overs cricket.

**"One ball is used per ODI innings."** Current ICC conditions use two.`,
    related: [
      'cricket-ball',
      'red-ball',
      'pink-ball',
      'odi',
      'limited-overs-cricket',
      'reverse-swing',
    ],
    sourceKeys: [{ key: 'icc-playing-conditions' }],
    order: 40,
    ruleSensitive: true,
    sourceRevision: ICC_PC,
    lastReviewedAt: REVIEWED,
  }),

  definition({
    slug: 'pink-ball',
    title: 'Pink Ball',
    category: 'equipment',
    difficulty: 'intermediate',
    summary:
      'A ball developed for day-night Test cricket, balancing visibility under lights against red-ball durability.',
    explanation: `The pink ball was developed to make **day-night Test cricket** possible.

The problem it solves: a red ball is hard to see under floodlights, and a white ball does not last the eighty-plus overs a Test innings requires and discolours badly against the traditional white clothing worn in Tests. Pink is a compromise intended to be visible under lights while behaving more like a red ball.

Its behaviour is genuinely **debated**. Players have consistently reported that it behaves differently, particularly under lights in the twilight period, and that it can be harder to pick up at certain times of day. Whether it swings or seams more than a red ball, and how much its extra lacquer affects wear and reverse swing, are not settled questions.

What is widely agreed is that the **twilight session** in a day-night Test is a distinctive and difficult period for batting, and that has become part of the format's character.`,
    whyItMatters: `Day-night Tests exist to address falling attendance and viewership for daytime Test cricket, and the pink ball is the technical enabler. Its contested behaviour means results in day-night Tests are not straightforwardly comparable to daytime ones.`,
    misunderstandings: `**"The pink ball definitely swings more."** Reported and not established; player accounts and studies vary.

**"Pink balls are used in limited-overs cricket."** They are for day-night matches in the long format; white is used for limited-overs.

**"The pink ball behaves like a red one."** It is a compromise, and players consistently report differences.`,
    related: [
      'cricket-ball',
      'red-ball',
      'white-ball',
      'test-cricket',
      'new-ball',
      'swing-conditions',
    ],
    order: 50,
  }),

  definition({
    slug: 'stumps',
    title: 'Stumps',
    category: 'equipment',
    difficulty: 'beginner',
    summary:
      'The three wooden posts at each end of the pitch, which together with the bails form the wicket.',
    explanation: `Three wooden posts are driven into the ground at each end of the pitch. With the two **bails** resting on top, they form the **wicket**.

They have individual names, from the batter's perspective:

- **Off stump** — the one on the batter's off side.
- **Middle stump**.
- **Leg stump** — the one on the batter's leg side.

Because off and leg are defined from the batter, which stump is which **swaps** for a left-hander.

Under **Law 8** the wicket's overall width and the stumps' height are specified, and the gaps between the stumps must be small enough that the ball cannot pass through.

The stumps are the target for **bowled**, **run out**, **stumped** and **hit wicket**, and they define the LBW line: a ball must be heading to hit them.`,
    whyItMatters: `The stumps are the reference frame for almost every decision in cricket. LBW is judged against the line of the stumps; wides are judged relative to the batter's reach from them; fielding positions are described relative to the off and leg sides they define.

The named stumps are also how bowling lines are described: "fourth stump line" means outside off, as though the stumps continued.`,
    misunderstandings: `**"Off stump is on a fixed side of the ground."** It swaps with the batter's handedness.

**"Hitting the stumps is enough for a dismissal."** A bail must be completely dislodged or a stump struck out of the ground.

**"The ball can pass between the stumps."** The gaps are specified to prevent it.`,
    related: ['bails', 'wicket', 'bowled', 'lbw', 'line', 'cricket-pitch'],
    sourceKeys: [{ ...MCC, locator: 'Law 8 (The wickets)' }],
    order: 60,
  }),

  definition({
    slug: 'bails',
    title: 'Bails',
    category: 'equipment',
    difficulty: 'beginner',
    summary:
      'The two small wooden pieces resting on top of the stumps, whose dislodging is what "putting down the wicket" means.',
    explanation: `Two bails rest in grooves on top of the three stumps, one bridging each pair.

Their function is to make a dismissal **unambiguous**. Rather than requiring a judgement about whether the stumps were struck hard enough, the Laws define **putting the wicket down** as at least one bail being **completely removed** from the top of the stumps, or a stump being struck out of the ground.

That precision produces the familiar situation where the ball hits the stumps, the bails wobble and settle back, and the batter is **not out**. It looks like a technicality and it is exactly what Law 29 says.

Under **Law 8** the bails' dimensions are specified, and in high wind the umpires may **dispense with them** entirely, in which case they judge whether the wicket would have been put down.`,
    whyItMatters: `The bail is what makes bowled, run out and stumped objectively decidable events rather than matters of degree, and modern zing or LED bails, used in some competitions, make the moment of dislodging visible on replay to a precision the Laws' drafters never had.`,
    misunderstandings: `**"The stumps just have to be hit."** A bail must be completely removed, or a stump knocked out of the ground.

**"Bails are always used."** The umpires may dispense with them in high wind.

**"A wobbling bail counts."** It must be completely removed from the top of the stumps.`,
    related: ['stumps', 'wicket', 'bowled', 'run-out', 'stumped', 'run-out-review'],
    sourceKeys: [{ ...MCC, locator: 'Laws 8, 29 (The wickets; Wicket is down)' }],
    order: 70,
  }),

  definition({
    slug: 'batting-pads',
    title: 'Batting Pads',
    category: 'equipment',
    difficulty: 'beginner',
    summary: 'Leg guards protecting the shins and knees, and the reason LBW exists as a Law.',
    explanation: `Batting pads are external leg guards covering the shin and knee, worn on both legs by the batter and by the wicketkeeper.

They are protective equipment, and they also created a rules problem the Laws had to solve. A batter with padded legs can block the stumps with their body rather than their bat, which is precisely why **LBW** exists: without it, padding the ball away would be a legitimate defensive technique and bowling would be close to pointless.

Under the Laws, only the **bat, or a hand or glove holding it**, counts as the bat. So a ball hitting the pad is a ball hitting the batter's **person**, which is what LBW and leg byes are about.`,
    whyItMatters: `The interaction of pads and Law is worth understanding because it explains several things that otherwise look arbitrary:

- **LBW** exists because pads make body-blocking viable.
- **Leg byes** require a stroke to have been attempted or the batter to have been avoiding the ball, which stops pads being used as a scoring implement.
- **Bat-pad catches** are a specific fielding target, which is why close catchers are set to spin.`,
    misunderstandings: `**"Pads count as part of the bat."** They do not; only the bat and a hand or glove holding it.

**"Pads mean a batter cannot be hurt."** They cover the shins and knees only, which is why thigh pads, arm guards, chest guards and helmets exist.

**"Hitting the pad is always LBW."** It requires the pitching, impact, bat-contact and would-have-hit conditions to be met.`,
    related: ['lbw', 'leg-bye', 'batting-gloves', 'thigh-pad', 'helmet', 'short-leg'],
    sourceKeys: [{ ...MCC, locator: 'Laws 5, 23, 36' }],
    order: 80,
  }),

  definition({
    slug: 'batting-gloves',
    title: 'Gloves',
    category: 'equipment',
    difficulty: 'beginner',
    summary:
      'Padded gloves protecting the batter’s hands, which count as part of the bat when holding it.',
    explanation: `Batting gloves are padded gloves protecting the fingers and the back of the hand, which are exposed to the ball on the bat handle.

Their significance in the Laws is specific and frequently decisive: **a hand or glove holding the bat counts as the bat**.

That single provision determines several outcomes:

**Caught.** A ball off the glove **on the bat handle** is out caught, because the glove counts as the bat. A ball off a glove not holding the bat is not.

**LBW.** Contact with a glove holding the bat counts as bat contact, which rules out an LBW.

**Batter's ground.** A batter is in their ground if a hand holding the bat is grounded behind the crease.

**Obstructing the field.** Wilfully striking the ball with a **hand not holding the bat** is the conduct that absorbed the old "handled the ball" dismissal.`,
    whyItMatters: `More televised dismissals turn on the glove provision than most viewers realise. "Did it come off the glove or the forearm?" is a real and consequential question, because one is out caught and the other is not, and it is one of the things edge detection and thermal imaging are used to resolve.`,
    misunderstandings: `**"Gloves are just protection."** They are legally part of the bat when holding it.

**"Any glove contact counts as bat contact."** Only a glove **holding** the bat.

**"A ball off the glove cannot be LBW."** Correct, if the glove was holding the bat: that is bat contact, which rules LBW out.`,
    related: [
      'cricket-bat',
      'caught',
      'lbw',
      'batters-ground',
      'obstructing-the-field',
      'wicketkeeping-gloves',
    ],
    sourceKeys: [{ ...MCC, locator: 'Laws 5, 33, 36' }],
    order: 90,
  }),

  concept({
    slug: 'helmet',
    title: 'Helmet',
    category: 'equipment',
    difficulty: 'beginner',
    summary:
      'Head protection with a grille, which changed how batters play the short ball and which carries a penalty-run rule.',
    explanation: `A cricket helmet is a hard shell with a **grille** or faceguard, worn by batters, by wicketkeepers standing up, and by fielders in close catching positions.

Helmets became widespread from the late 1970s and are now effectively mandatory at professional level and required by regulation in many jurisdictions, particularly for junior cricket and for fielders in close positions.

Their effect on the sport was substantial and is not merely protective. Before helmets, the short ball was primarily a survival problem; afterwards, batters were willing to stand and attack it, and shots like the **hook**, the **pull** against genuinely fast bowling and later the **upper cut** became more freely played. The regulatory response to dangerous bowling under Law 41 sits alongside that change.

Standards have tightened following serious injuries, including provisions addressing the gap between the grille and the peak, and neck protectors have been introduced in some regulations.`,
    howItWorks: `The rule that surprises people is the **penalty-run** provision. A **fielder's spare helmet placed on the ground** behind the wicketkeeper is part of the field, and if the ball strikes it, the batting side receives **five penalty runs**.

That is why spare helmets are placed carefully, and why a wayward throw hitting one draws a groan.

A helmet worn by a fielder also counts as part of that fielder for the purposes of a catch, so a ball lodging in a helmet's grille has its own provisions under the Laws.`,
    whyItMatters: `The helmet is the clearest case of equipment changing tactics rather than just safety. The modern willingness to take on short-pitched bowling, and the existence of close catching positions like short leg as routine rather than exceptional, both depend on it.`,
    misunderstandings: `**"Helmets are optional at all levels."** Many regulations mandate them, especially for juniors and close fielders.

**"A helmet on the ground is out of play."** It is part of the field, and striking it concedes five penalty runs.

**"Helmets only matter for safety."** They changed what shots batters are prepared to play.`,
    takeaways: `- Hard shell with a grille, worn by batters, close fielders and keepers standing up.
- Made attacking the short ball viable, changing tactics as well as safety.
- A fielder's helmet on the ground is part of the field: five penalty runs if struck.
- Standards have tightened after serious injuries.`,
    related: [
      'bouncer',
      'short-leg',
      'close-catching',
      'penalty-runs',
      'playing-short-pitched-bowling',
      'hook-shot',
    ],
    sourceKeys: [{ ...MCC, locator: 'Laws 28, 33 (The fielder; Caught)' }],
    order: 100,
    ruleSensitive: true,
    sourceRevision: MCC_CODE,
    lastReviewedAt: REVIEWED,
  }),

  definition({
    slug: 'thigh-pad',
    title: 'Thigh Pad',
    category: 'equipment',
    difficulty: 'beginner',
    summary:
      'Padding worn under the trousers protecting the thigh and hip, where the ball frequently strikes.',
    explanation: `A thigh pad is padding strapped to the front thigh, usually with an additional inner-thigh pad, worn under the trousers.

It protects one of the areas most often struck by the ball. A delivery that is short and directed at the batter's body, or one they attempt to work off the hip, very frequently hits the thigh, and without padding those blows are painful enough to affect a batter's willingness to stay in line.

Being padding worn on the person rather than held, it is not part of the bat, so a ball off the thigh pad is contact with the batter's **person**: relevant to LBW and to leg byes.`,
    whyItMatters: `It contributes to the same shift the helmet did: batters can afford to stay in line against short bowling directed at the body, which is a precondition for playing the pull and the hook rather than simply evading.`,
    misunderstandings: `**"Thigh pads are for comfort."** The thigh and hip are among the most frequently struck areas.

**"A ball off the thigh pad is a dead ball."** It is contact with the person; runs may be scored as leg byes if a stroke was attempted or the batter was avoiding the ball.`,
    related: [
      'batting-pads',
      'helmet',
      'abdominal-guard',
      'leg-bye',
      'playing-short-pitched-bowling',
      'flick',
    ],
    order: 110,
  }),

  definition({
    slug: 'abdominal-guard',
    title: 'Abdominal Guard',
    category: 'equipment',
    difficulty: 'beginner',
    summary:
      'Protective equipment worn inside the clothing, universally used by batters and close fielders.',
    explanation: `An abdominal guard is a hard protective cup worn inside the clothing, colloquially a **box**.

It is basic and universal protective equipment for batters, wicketkeepers and close fielders at every level, and it long predates helmets: it was standard for generations before head protection became common.

Like all worn padding, it is part of the batter's **person** rather than the bat, so contact with it is treated as contact with the batter for the purposes of LBW and leg byes.`,
    whyItMatters: `It is one of the small number of pieces of equipment that is genuinely non-optional in practice at every level of cricket, and its long history is a reminder that cricket's protective equipment developed piecemeal, with the most obviously necessary items arriving first and head protection surprisingly late.`,
    misunderstandings: `**"It is modern equipment."** It was standard long before helmets.

**"Only batters wear one."** Wicketkeepers and close fielders do too.`,
    related: ['batting-pads', 'thigh-pad', 'helmet', 'wicketkeeping-gloves', 'close-catching'],
    order: 120,
  }),

  definition({
    slug: 'wicketkeeping-gloves',
    title: 'Wicketkeeping Gloves',
    category: 'equipment',
    difficulty: 'beginner',
    summary: 'Large padded and webbed gloves, which only the wicketkeeper is permitted to wear.',
    explanation: `Wicketkeeping gloves are large, heavily padded gloves with **webbing** between the thumb and index finger, designed to catch a ball travelling at pace from a few metres away.

Under **Law 27**, the wicketkeeper is the **only** member of the fielding side permitted to wear gloves and external leg guards. That exclusivity is what makes the position possible: no other fielder could take a ball from a fast bowler at that distance repeatedly.

The Law also constrains their use. The keeper must take the ball with the gloves in a fair manner, and there are provisions about the keeper's position: they must remain wholly behind the wicket until the ball reaches the striker or the striker attempts a run, and encroaching in front is a no-ball.

Webbing dimensions are regulated, which is why keeping gloves cannot become baseball mitts.`,
    whyItMatters: `The gloves define the role. Everything distinctive about wicketkeeping — standing up to spin, taking edges from fast bowling, completing stumpings in one movement — depends on equipment nobody else may use, which is why the keeper is a specialist rather than a fielder who happens to stand behind the stumps.`,
    misunderstandings: `**"Any fielder can wear gloves."** Only the wicketkeeper.

**"Keeping gloves are like baseball mitts."** Webbing is regulated to prevent that.

**"The keeper can trap the ball with the pads."** The Laws require a fair take with the gloves.`,
    related: [
      'wicketkeeper',
      'wicketkeeping',
      'collecting',
      'stumping',
      'batting-gloves',
      'standing-up',
    ],
    sourceKeys: [{ ...MCC, locator: 'Law 27 (The wicket-keeper)' }],
    order: 130,
  }),

  definition({
    slug: 'spikes',
    title: 'Spikes',
    category: 'equipment',
    difficulty: 'beginner',
    summary: 'Studded cricket footwear providing grip, and a factor in how pitches wear.',
    explanation: `Cricket boots have **spikes** or studs in the sole, providing grip for bowlers landing in the delivery stride, batters turning for runs, and fielders changing direction.

Bowlers' footwear is the more consequential. A fast bowler lands with very large forces through the front foot, and the spikes both provide the grip that makes that landing safe and **break up the surface** where it happens repeatedly.

That is the direct mechanism behind the **rough**: bowlers' spikes scuffing the same area over days of a match creates the worn patches spinners aim at. Wear from spikes is a normal by-product of bowling, whereas **deliberately** damaging the pitch is an offence under Law 41, and umpires monitor the distinction.`,
    whyItMatters: `The connection between footwear and pitch wear is one of the more elegant chains in cricket: spikes provide necessary grip, which necessarily damages the surface, which creates the rough, which favours spin in the fourth innings, which is why batting last is hardest.`,
    misunderstandings: `**"Spikes are just for grip."** They are the mechanism that creates the rough.

**"Bowlers create rough deliberately."** Deliberate pitch damage is an offence; the rough is an unavoidable by-product.

**"Batters do not need spikes."** Turning and running require grip too.`,
    related: ['rough', 'run-up', 'bowling-action', 'pitch-deterioration', 'wearing-pitch'],
    sourceKeys: [{ ...MCC, locator: 'Law 41 (Damaging the pitch)' }],
    order: 140,
  }),

  // ── Terminology ───────────────────────────────────────────────────────────
  definition({
    slug: 'golden-duck',
    title: 'Golden Duck',
    category: 'terminology',
    difficulty: 'beginner',
    summary: 'Informal: dismissed on the very first ball faced, for no runs.',
    explanation: `A golden duck is a dismissal for **zero runs off the first delivery faced**.

**Register: informal but widely standardised.** It is not a term in the Laws, and it does not appear as a category in official statistics, but its meaning is agreed across cricket and it is used consistently by broadcasters and reference works.

Related informal terms are less consistently used:

- **Diamond duck** — most commonly, out without facing a delivery at all: run out at the non-striker's end, or run out as the non-striker in a mix-up. Some sources use it for a first-ball dismissal in the first over of an innings.
- **Platinum** or **royal duck** — sometimes used for a duck on the very first ball of the innings.

Only "duck" and "golden duck" can be relied upon to mean the same thing across sources.`,
    whyItMatters: `It is worth knowing largely because it is used constantly and because the surrounding varieties are not standardised, which is a good illustration of how much of cricket's vocabulary is convention rather than definition.`,
    misunderstandings: `**"A golden duck is an official statistic."** It is informal; official records show a dismissal for 0 from 1 ball.

**"Diamond duck has one agreed meaning."** Usage genuinely varies.`,
    related: [
      'duck',
      'diamond-duck',
      'pair',
      'king-pair',
      'dismissal',
      'basic-cricket-terminology',
    ],
    order: 10,
  }),

  definition({
    slug: 'diamond-duck',
    title: 'Diamond Duck',
    category: 'terminology',
    difficulty: 'intermediate',
    summary: 'Informal and inconsistently defined: usually, out without facing a ball at all.',
    explanation: `**Register: informal, and genuinely inconsistent between sources.** This entry exists mainly to say so.

The most common usage is a batter dismissed **without facing a single delivery**, which in practice means:

- Run out at the non-striker's end while backing up.
- Run out as the non-striker after a mix-up on a ball the other batter faced.

Some sources instead use "diamond duck" for a batter dismissed on the first ball of the innings, and others for a first-ball dismissal specifically without scoring in the first over.

Because there is no authority to settle it, a reader encountering the term should treat it as approximate and check what the source means.`,
    whyItMatters: `The inconsistency is the point. Cricket's slang vocabulary is often presented with the same confidence as its Law-defined terms, and a reader is better served by knowing which terms are firm and which are not.`,
    misunderstandings: `**"Diamond duck has a settled definition."** It does not.

**"It appears in official records."** It does not; the records show the dismissal and the balls faced.`,
    related: ['duck', 'golden-duck', 'run-out-non-strikers-end', 'non-striker', 'pair'],
    order: 20,
  }),

  definition({
    slug: 'pair',
    title: 'Pair',
    category: 'terminology',
    difficulty: 'intermediate',
    summary: 'Informal: two ducks in the same match, one in each innings.',
    explanation: `A pair is being dismissed for **zero in both innings** of a match. It requires a two-innings match, so it exists only in multi-day cricket.

**Register: informal but consistently used.** The name comes from the two noughts resembling a pair of spectacles, and the older full form is "a pair of spectacles".

A **king pair** is the sharper version: a **golden duck in both innings**, so out for nought off the first ball faced twice in the same match.

Neither term appears in official statistics, which simply record two innings of 0.`,
    whyItMatters: `Chiefly cultural. Cricket has an elaborate vocabulary for batting failure and comparatively little for fielding failure, which is one reason dropped catches go unrecorded while a batter's ducks are enumerated.`,
    misunderstandings: `**"A pair can happen in a one-day match."** It needs two innings, so multi-day cricket only.

**"A pair is an official statistic."** It is informal.`,
    related: ['king-pair', 'duck', 'golden-duck', 'multi-day-cricket', 'first-class-cricket'],
    order: 30,
  }),

  definition({
    slug: 'king-pair',
    title: 'King Pair',
    category: 'terminology',
    difficulty: 'advanced',
    summary: 'Informal: a golden duck in both innings of the same match.',
    explanation: `A king pair is being dismissed for **nought off the first ball faced in both innings** of a match.

**Register: informal.** It is the most extreme version of a **pair**, and like the pair it exists only in two-innings cricket and appears in no official record beyond the underlying scores of 0 from 1 ball twice.

It is rare, and unlike most cricket rarities it is remembered rather than celebrated.`,
    whyItMatters: `Very little, beyond being the terminal point of cricket's vocabulary for batting failure and a good example of how elaborate that vocabulary is.`,
    misunderstandings: `**"A king pair is two ducks."** Two **golden** ducks. Two ordinary ducks is a pair.`,
    related: ['pair', 'golden-duck', 'duck', 'multi-day-cricket'],
    order: 40,
  }),

  definition({
    slug: 'double-century',
    title: 'Double Century',
    category: 'terminology',
    difficulty: 'beginner',
    summary:
      'An individual score of 200 or more: conventional terminology, and a substantial achievement.',
    explanation: `A double century is an individual innings of **200 runs or more**. A **triple century** is 300 or more, and is rare even in Test cricket.

**Register: conventional.** Not a Law term, and not a separate column in most career records, but used consistently everywhere and unambiguous.

Double centuries in **limited-overs** cricket are a different matter. In an ODI a double century requires an extraordinary innings within 300 team deliveries and only a handful exist; in T20, with 120 deliveries in the innings, it is effectively out of reach.`,
    whyItMatters: `In Test cricket a double century usually means a batter has batted for the better part of two sessions or more, which by itself changes a match: the opposition has spent that time bowling rather than batting.

The rarity in limited-overs cricket illustrates the format constraint clearly: the ceiling on an individual score is set by the deliveries available, not by the batter.`,
    misunderstandings: `**"Double centuries are counted separately in records."** Most career records count them within the 100s column.

**"A double century is twice as good as a century."** In Test cricket the marginal value of continuing is arguably higher, since the bowling side is being denied time as well as wickets.`,
    related: ['hundred', 'fifty', 'highest-score', 'batting-average', 'test-cricket'],
    order: 50,
  }),

  definition({
    slug: 'hat-trick',
    title: 'Hat-trick',
    category: 'terminology',
    difficulty: 'beginner',
    summary: 'Conventional: three wickets by one bowler in three consecutive deliveries.',
    explanation: `A hat-trick is **three wickets taken by one bowler in three consecutive deliveries** they bowl.

**Register: conventional and consistently applied.** It is not defined in the Laws but is recorded in official statistics and applied uniformly.

The conditions are precise:

**Consecutive deliveries by that bowler**, which need not be in the same over. A bowler can take the last two wickets of one over and the first of their next over and it counts, and the intervening over from the other end does not break it.

**It can span innings and even matches**, since what matters is consecutive deliveries bowled by that bowler.

**Wickets must be credited to the bowler.** A run out in between does not break the sequence of deliveries, but it does not count as one of the three.

The name comes from the nineteenth-century practice of awarding a bowler a hat for the feat.`,
    whyItMatters: `Beyond rarity, a hat-trick is one of the clearest cases where cricket's statistical conventions are more subtle than they look: the fact that a hat-trick can span overs, innings and matches surprises most people who assume it must be three balls in one over.`,
    misunderstandings: `**"A hat-trick must be in one over."** It must be three consecutive deliveries by that bowler, which can span overs, innings and matches.

**"Any three wickets in three balls counts."** All three must be credited to the same bowler.

**"A hat-trick is a Law-defined term."** It is a convention, though a consistently recorded one.`,
    related: ['five-wicket-haul', 'wickets', 'bowling-scorecard', 'dismissal'],
    order: 60,
  }),

  definition({
    slug: 'bunny',
    title: 'Bunny',
    category: 'terminology',
    difficulty: 'intermediate',
    aliases: ['Rabbit'],
    summary:
      'Informal, with two distinct meanings: a batter repeatedly dismissed by one bowler, or a very weak batter.',
    explanation: `**Register: informal**, and it means two different things depending on context, which is worth knowing because they are easily confused.

**A specific bowler's bunny.** A batter that one particular bowler dismisses repeatedly. "He's Anderson's bunny" means Anderson has dismissed him many times.

**A team's bunny or rabbit.** A very weak batter, usually the worst in the side, who is expected to be dismissed quickly.

The first usage connects to **matchups**, and it carries the same statistical caution: batter-versus-bowler samples are usually far too small to support the inference, so a "bunny" relationship built on four dismissals in nine innings is more likely to be chance than a genuine effect.`,
    whyItMatters: `The bunny idea is where matchup thinking meets small samples, and it is a good illustration of why individual head-to-head records should be treated sceptically. Style-based matchups have real evidence behind them; "X always gets Y out" usually does not.`,
    misunderstandings: `**"A bunny relationship is statistically meaningful."** The samples are almost always too small.

**"Bunny and rabbit mean the same thing."** They overlap, and "bunny" more often means a specific bowler's victim while "rabbit" more often means a weak batter.`,
    related: ['matchups', 'tailender', 'tail', 'dismissal', 'phase-splits'],
    order: 70,
  }),

  definition({
    slug: 'tail',
    title: 'The Tail',
    category: 'terminology',
    difficulty: 'beginner',
    summary: 'Conventional: the last few batters in the order, typically numbers 9 to 11.',
    explanation: `The tail is the group of batters at the end of the order who are not expected to score substantially: conventionally numbers **9, 10 and 11**, and sometimes 8 as well.

**Register: conventional**, with no fixed boundary. Whether the tail starts at 8 or 9 depends on the side and on who is talking.

Related phrases:

**A long tail** — the batting drops off early, so the side effectively has fewer usable wickets than the scoreboard suggests.

**Wagging tail** — the tail scoring unexpected runs, which is a recognised phenomenon and a genuine contributor to Test results.

**Tail-end collapse** — the last wickets falling quickly, often to a burst of short bowling or reverse swing.`,
    whyItMatters: `Tail runs correlate meaningfully with winning Test matches, and a long tail is a real structural weakness rather than a cosmetic one: a side whose batting ends at 7 has to bat differently at the top, because a collapse cannot be recovered.

It also affects the top order's licence: sides that bat deep can attack, and sides with long tails cannot.`,
    misunderstandings: `**"The tail is a fixed set of positions."** It is a convention and varies by side.

**"Tail runs are a bonus."** They are planned for, and correlate with results.`,
    related: [
      'tailender',
      'lower-order-batter',
      'batting-deep',
      'strike-farming',
      'batting-order',
      'reverse-swing',
    ],
    order: 80,
  }),

  definition({
    slug: 'sledging',
    title: 'Sledging',
    category: 'terminology',
    difficulty: 'intermediate',
    summary:
      'Informal: verbal attempts to unsettle an opponent, bounded by the Laws and the code of conduct.',
    explanation: `Sledging is the practice of directing comments at an opposing player, usually a batter, to unsettle their concentration.

**Register: informal**, and the term is not used in the Laws at all. What the Laws and regulations address is **conduct**, not sledging as a category.

The relevant boundaries:

**Law 42** deals with players' conduct, with a graded set of offences and sanctions available to the umpires, including penalty runs and removal from the field for the most serious.

**Codes of conduct**, written by the ICC and by domestic boards, cover abusive language, personal abuse and directing comments at an opponent, with the **match referee** hearing charges and imposing fines and suspensions.

**The Spirit of Cricket preamble** to the Laws addresses the game's expectations in general terms.

So the accurate statement is not "sledging is legal" or "sledging is banned", but that verbal conduct is regulated by a graded framework, and where a comment falls within it determines the consequence.`,
    whyItMatters: `It is one of the areas where cricket's self-image and its rules interact awkwardly, and where the regulations have tightened considerably over recent decades. Behaviour once treated as part of the contest now attracts charges.`,
    misunderstandings: `**"Sledging is against the Laws."** The Laws regulate conduct in graded terms; "sledging" is not a defined offence.

**"Sledging is an accepted part of the game."** Much of what was once accepted now attracts sanction under codes of conduct.

**"Only the umpires deal with it."** Umpires act in-match; the match referee handles charges afterwards.`,
    related: ['match-referee', 'on-field-umpire', 'penalty-runs', 'appeals'],
    sourceKeys: [{ ...MCC, locator: 'Law 42 (Players’ conduct); Preamble' }],
    order: 90,
    ruleSensitive: true,
    sourceRevision: `${MCC_CODE}; codes of conduct from ${ICC_PC}`,
    lastReviewedAt: REVIEWED,
  }),

  definition({
    slug: 'jaffa',
    title: 'Jaffa',
    category: 'terminology',
    difficulty: 'beginner',
    aliases: ['Peach', 'Corker'],
    summary: 'Informal: an outstanding delivery, usually one that beats a good batter completely.',
    explanation: `A jaffa is an exceptional delivery: typically one that swings or seams late, beats the bat and either takes the wicket or beats everything.

**Register: purely informal slang.** There is no definition, no threshold and no record. A jaffa is whatever a commentator calls a jaffa, and **peach** and **corker** are used interchangeably.

The word's origin is generally taken to be the Jaffa orange, as a byword for something of high quality.

The related term **unplayable** carries the same sense with more emphasis: a delivery a batter could not reasonably have survived.`,
    whyItMatters: `Only as vocabulary. Its inclusion here is to mark the boundary between cricket's slang and its defined terms: a jaffa is a compliment, not a category, and nothing follows from a delivery being one.`,
    misunderstandings: `**"A jaffa is a specific type of delivery."** It is a quality judgement, not a delivery type like a yorker or a googly.`,
    related: [
      'dolly',
      'corridor-of-uncertainty',
      'conventional-swing',
      'seam-movement',
      'basic-cricket-terminology',
    ],
    order: 100,
  }),

  definition({
    slug: 'beamer',
    title: 'Beamer',
    category: 'terminology',
    alsoIn: ['laws-and-rules'],
    difficulty: 'intermediate',
    aliases: ['Beam Ball', 'Full Toss Above Waist'],
    summary:
      'Informal name for a delivery passing the batter above waist height without bouncing, which is a no-ball.',
    explanation: `A beamer is a delivery that reaches the batter **above waist height without bouncing**.

**Register: informal name for a Law-defined thing.** The term is slang; the underlying offence is not. Under **Law 21**, a delivery that passes or would have passed the striker above waist height without pitching is a **no-ball**, judged relative to where the striker was standing upright at the crease.

It is treated as a dangerous delivery rather than merely an illegal one. Under **Law 41**, deliberate or repeated high full tosses attract warnings and can result in the bowler being removed from the attack, and playing conditions in some competitions add further provisions.

The reason for the severity is straightforward: a fast, non-bouncing delivery at chest or head height gives a batter almost no time to react.`,
    whyItMatters: `The beamer is where the no-ball Law is doing safety work rather than fairness work, and it is one of the few deliveries that can end a bowler's participation in an innings.

It also explains the visible difference in umpire reaction: a front-foot no-ball is called routinely; a beamer produces a warning and a conversation.`,
    misunderstandings: `**"A beamer is any full toss."** Only one above waist height without bouncing. A full toss at thigh height is legal and simply a bad ball.

**"Beamer is the official term."** It is slang; the Law describes a non-pitching delivery above waist height.

**"It is just a no-ball."** Repeated or deliberate beamers are dealt with as dangerous bowling.`,
    related: ['no-ball', 'full-toss', 'bouncer', 'short-ball-strategy', 'on-field-umpire'],
    sourceKeys: [{ ...MCC, locator: 'Laws 21.10, 41.7' }],
    order: 110,
    ruleSensitive: true,
    sourceRevision: MCC_CODE,
    lastReviewedAt: REVIEWED,
  }),

  definition({
    slug: 'dolly',
    title: 'Dolly',
    category: 'terminology',
    difficulty: 'beginner',
    summary: 'Informal: an extremely easy catch.',
    explanation: `A dolly is a catch so straightforward that dropping it is remarkable: a gentle, high, slow chance arriving directly at a fielder.

**Register: purely informal.** No definition, no threshold, and it is applied retrospectively and often unkindly.

The term's practical use in commentary is to set up the observation that follows, since a dropped dolly is one of the more discussed events in a match precisely because it looked simple.`,
    whyItMatters: `Only as vocabulary, with one substantive connection: because **dropped catches are not recorded** in cricket's statistics, the language around them is all cricket has. A dropped dolly is remembered because there is nowhere to record it.`,
    misunderstandings: `**"A dolly is a defined type of chance."** It is a judgement about difficulty.

**"Dropped dollies show up in statistics."** Drops are not recorded at all.`,
    related: ['catching', 'high-catch', 'catches-statistic', 'caught', 'jaffa'],
    order: 120,
  }),

  definition({
    slug: 'edge',
    title: 'Edge',
    category: 'terminology',
    difficulty: 'beginner',
    aliases: ['Nick', 'Snick', 'Feather'],
    summary:
      'Conventional: contact with the side of the bat rather than the middle, producing a deflection.',
    explanation: `An edge is contact between the ball and the **side of the bat** rather than the face, deflecting the ball at an angle the batter did not intend.

**Register: conventional**, universally understood, and central to how dismissals are described.

The two directions:

**Outside edge** — deflection towards the off side and behind the wicket, which is why the slips and the wicketkeeper stand there.

**Inside edge** — deflection towards the leg side, which can go onto the pads, onto the stumps, or fine to the leg side.

Thickness matters and has its own vocabulary: a **thick edge** deflects less and travels faster and squarer; a **thin** or **feather** edge barely deviates and carries through to the keeper.

**Nick** and **snick** are informal synonyms; **snick** is the origin of the Snickometer's name.`,
    whyItMatters: `Edges are the mechanism behind the majority of dismissals in cricket. Caught is the most common way to be out, and most catches come off edges, which is why fielding sides invest so heavily in slip catching and why swing and seam bowling are built around producing them.

The edge is also the reason **edge detection** technology exists: whether the ball touched the bat determines LBW, caught behind, and sometimes the difference between a wicket and a boundary.`,
    misunderstandings: `**"An edge is a mistake."** Deliberate deflections exist: a late cut, a paddle, and steering the ball to third man are all edge-adjacent by design.

**"An edge to the keeper is always out."** It must be caught cleanly, and the same edge running along the ground is four runs.`,
    related: [
      'outside-edge',
      'inside-edge',
      'caught',
      'slip',
      'edge-detection',
      'french-cut',
      'soft-hands',
    ],
    order: 130,
  }),

  definition({
    slug: 'inside-edge',
    title: 'Inside Edge',
    category: 'terminology',
    difficulty: 'beginner',
    summary:
      'Conventional: a deflection off the inner edge of the bat, towards the batter’s legs and the leg side.',
    explanation: `An inside edge deflects the ball off the edge of the bat nearer the batter's body, sending it towards their legs and the leg side.

**Register: conventional.**

Its consequences are distinctive, and it is the edge most likely to produce a dismissal without a fielder involved:

**Bowled.** An inside edge onto the stumps is out **bowled**, not caught behind and not LBW, because the delivery put the wicket down.

**Onto the pad**, which can pop up to a close leg-side catcher such as short leg.

**Rules out LBW**, since the ball touched the bat first.

**Fine to the leg side** for runs, sometimes four, which is the "lucky" boundary a batter acknowledges apologetically.

It typically results from playing across the line, or from a ball moving in to the batter more than expected: an inswinger, an off break, or a ball nipping back off the seam.`,
    whyItMatters: `The inside edge is the specific reason **through the gate** dismissals happen and the reason **bat and pad together** is such a repeated coaching instruction: the gap between bat and pad is exactly where an inside-edged ball travels onto the stumps.`,
    misunderstandings: `**"An inside edge onto the stumps is caught behind."** It is bowled.

**"An inside edge saves you from LBW."** It does rule LBW out, and it can still bowl you.`,
    related: [
      'edge',
      'outside-edge',
      'bowled',
      'through-the-gate',
      'short-leg',
      'inswinger',
      'lbw',
    ],
    order: 140,
  }),

  definition({
    slug: 'outside-edge',
    title: 'Outside Edge',
    category: 'terminology',
    difficulty: 'beginner',
    summary:
      'Conventional: a deflection off the outer edge of the bat, behind square on the off side.',
    explanation: `An outside edge deflects the ball off the edge of the bat furthest from the batter's body, sending it behind square on the off side.

**Register: conventional.**

It is the single most productive error in cricket for the fielding side, because of **where it goes**. An outside edge travels directly into the region occupied by the wicketkeeper, the slips, gully and third man, which is precisely why those positions exist and why a bowler moving the ball away from the bat is so dangerous.

It is produced by a ball leaving the batter after they have committed: an outswinger to a right-hander, a ball seaming away, or a leg break turning past the bat.`,
    whyItMatters: `The whole architecture of red-ball fielding is built around the outside edge. Three slips and a gully is a field that exists solely to catch it, and the number of slips a captain sets is a live readout of how likely they think it is.

**Soft hands** exist as a technique specifically to stop an outside edge carrying to those catchers.`,
    misunderstandings: `**"An outside edge is always caught."** It has to carry to a fielder; on a pitch with poor carry it falls short.

**"An outside edge means bad batting."** Against a ball moving late, the best batters edge deliveries they played correctly.`,
    related: [
      'edge',
      'inside-edge',
      'slip',
      'caught',
      'outswinger',
      'soft-hands',
      'corridor-of-uncertainty',
    ],
    order: 150,
  }),

  definition({
    slug: 'french-cut',
    title: 'French Cut',
    category: 'terminology',
    difficulty: 'intermediate',
    aliases: ['Chinese Cut', 'Surrey Cut', 'Harrow Drive'],
    summary:
      'Informal: an inside edge that narrowly misses the stumps and runs away to the leg side.',
    explanation: `A French cut is an **unintentional** inside edge, usually from an attempted drive or cut, that deflects off the inner edge, passes close to the stumps, and runs away fine on the leg side for runs.

**Register: informal**, and it has an unusual number of regional synonyms: **Chinese cut**, **Surrey cut**, **Harrow drive**. The variety of names, several of which attribute the shot to somewhere the speaker is not from, is itself the joke.

The shot is a **near-miss**: the same contact a few centimetres differently placed is bowled.`,
    whyItMatters: `Chiefly as vocabulary, with one real point: it illustrates how thin the line is between a dismissal and runs. The French cut and an inside edge onto the stumps are the same shot with a different outcome, which is a useful corrective to the idea that outcomes in cricket closely track execution.`,
    misunderstandings: `**"A French cut is a deliberate shot."** It is a mishit; the deliberate fine leg-side deflection is a **leg glance** or a **paddle**.

**"It is a defined shot."** It is informal, and its several names are regional variants.`,
    related: [
      'inside-edge',
      'edge',
      'cut-shot',
      'leg-glance',
      'bowled',
      'basic-cricket-terminology',
    ],
    order: 160,
  }),

  definition({
    slug: 'nervous-nineties',
    title: 'Nervous Nineties',
    category: 'terminology',
    difficulty: 'beginner',
    summary:
      'Informal: the period between 90 and 99, where batters are said to become cautious approaching a hundred.',
    explanation: `The nervous nineties describes a batter's innings between **90 and 99**, on the premise that the proximity of a century induces caution or anxiety and makes dismissal more likely.

**Register: informal**, and the underlying claim is an **empirical question rather than a fact**.

What can be said carefully: batters and commentators consistently report the phenomenon, and there is a plausible mechanism in that a batter changing their approach — declining risk, refusing singles, playing for the milestone rather than the situation — is behaving differently and may be more vulnerable as a result.

Whether dismissal rates in the nineties are actually elevated relative to the eighties or the hundreds is a statistical question, and analyses of it have not produced an unambiguous answer. Treating it as established would overstate what is known.`,
    whyItMatters: `It is a good example of a widely-believed cricket claim whose evidence base is thinner than its confidence. The behavioural change is observable; the effect on dismissal probability is not clearly demonstrated.`,
    misunderstandings: `**"Batters demonstrably get out more in the nineties."** The claim is not clearly established by analysis.

**"The nervous nineties are a myth."** The behavioural change is real and observable; it is the effect on outcomes that is uncertain.`,
    related: ['hundred', 'fifty', 'batting-tempo', 'risk-management-batting', 'batting-average'],
    order: 170,
  }),

  definition({
    slug: 'nelson',
    title: 'Nelson',
    category: 'terminology',
    difficulty: 'intermediate',
    summary: 'Informal superstition: the score 111, and its multiples, held to be unlucky.',
    explanation: `Nelson is the score **111**, with **222** as double Nelson and **333** as triple Nelson, regarded in English cricket superstition as unlucky for the batting side.

**Register: superstition, not statistics.** There is no evidence that anything unusual happens at 111, and this entry exists to record the custom rather than to endorse the claim.

The name's origin is usually attributed to Admiral Nelson, with various explanations offered about the number corresponding to his attributes or victories. Most of these explanations are demonstrably inaccurate, and the etymology is not settled.

The associated custom is that spectators and players lift their feet off the ground while the score stands at Nelson, and the umpire David Shepherd's habit of hopping at those scores made the superstition widely known.`,
    whyItMatters: `Nothing follows from it cricket-wise. It is included because a viewer will encounter the term and the hopping, and because it is a clean example of the difference between cricket's folklore and its facts: a reference work should record the custom and decline to endorse the claim.`,
    misunderstandings: `**"Something statistically happens at 111."** There is no evidence for it.

**"The Nelson etymology is established."** The explanations offered are various and mostly unreliable.`,
    related: ['team-score', 'basic-cricket-terminology', 'on-field-umpire'],
    order: 180,
  }),

  definition({
    slug: 'corridor-of-uncertainty',
    title: 'Corridor of Uncertainty',
    category: 'terminology',
    alsoIn: ['pace-bowling'],
    difficulty: 'intermediate',
    summary:
      'Conventional: the narrow channel just outside off stump where a batter can neither comfortably play nor leave.',
    explanation: `The corridor of uncertainty is the band of line **just outside off stump** where a batter's decision is genuinely difficult: close enough that leaving it risks being bowled if it moves back, wide enough that playing at it risks the outside edge.

**Register: conventional**, and now standard commentary vocabulary. The phrase is associated with the commentator Geoffrey Boycott, who popularised it.

It describes a **line**, in the same way that "good length" describes a length, and the two together define the classic red-ball bowling target: good length, in the corridor.

Its width is not fixed. It depends on how much the ball is moving, how tall the bowler is, and how far across the batter's guard is, which is why the same line is testing to one batter and comfortably leavable to another.`,
    whyItMatters: `It names the mechanism behind most top-order dismissals in red-ball cricket. A batter forced to make a marginal play-or-leave judgement repeatedly will eventually get one wrong, and the error goes to the slips.

It is also the reason **leaving well** is a skill: a batter who can reliably identify what is outside the corridor removes the bowler's main plan.`,
    misunderstandings: `**"The corridor is a fixed width."** It varies with movement, bounce and the batter's position.

**"It is a Law term."** It is commentary vocabulary, though a precise and useful one.

**"It applies to spin."** It is a pace-bowling concept, tied to the outside edge and the slip cordon.`,
    related: [
      'line',
      'good-length',
      'leaving-the-ball',
      'outside-edge',
      'slip',
      'new-ball-bowling',
      'jaffa',
    ],
    order: 190,
  }),

  definition({
    slug: 'carrying-the-bat',
    title: 'Carrying the Bat',
    category: 'terminology',
    difficulty: 'intermediate',
    summary: 'Conventional: an opener who is not out when all ten wickets have fallen.',
    explanation: `Carrying the bat means **opening the innings and being not out when the innings ends with all ten wickets down**.

**Register: conventional**, and recorded in cricket's statistical records as a distinct feat.

The conditions are specific and are what make it rare:

**The batter must have opened**, so being not out at the end after coming in later does not count.

**All ten wickets must have fallen**, so a declared or overs-limited innings does not count.

It therefore requires a batter to survive while all ten of their teammates are dismissed, which has happened only a small number of times in Test history and is one of the sport's genuinely rare individual achievements.

The full traditional phrase is "carrying his bat through the innings".`,
    whyItMatters: `It is the extreme case of the batting-through-the-innings idea, and it demonstrates the value of pure occupation of the crease: a batter carrying their bat has, by definition, faced a substantial share of the innings without giving the bowlers a wicket.`,
    misunderstandings: `**"Any not-out batter at the end carries the bat."** They must have opened, and all ten wickets must have fallen.

**"It counts in a declared innings."** It does not; the innings must end with ten wickets down.`,
    related: ['batting-through-the-innings', 'opener', 'not-out', 'test-cricket', 'tail'],
    order: 200,
  }),

  definition({
    slug: 'playing-for-the-turn',
    title: 'Playing for the Turn',
    category: 'terminology',
    alsoIn: ['batting'],
    difficulty: 'intermediate',
    summary:
      'Conventional: a batter committing their shot to where they expect a spinning ball to go after pitching.',
    explanation: `Playing for the turn means a batter positioning their bat and body for the **deviation they expect**, rather than for the ball's line in the air.

**Register: conventional**, used in coaching and commentary.

Against an off spinner turning the ball in to a right-hander, playing for the turn means covering the line inside, expecting the ball to come towards the stumps. Against a leg break, it means allowing for the ball to leave them.

It is the correct response to a spinner turning the ball, and it is exactly what makes the **arm ball**, the **googly** and the **doosra** effective: each punishes a batter who has correctly played for the expected turn by not turning that way.

That is the paradox worth understanding: playing for the turn is right, and it creates the vulnerability that spin variations exploit.`,
    whyItMatters: `It explains why spin bowling is a contest of information rather than of force. A spinner does not need to beat a batter physically; they need the batter to have committed to the wrong assumption, which the batter must do because not committing at all is also a losing strategy.`,
    misunderstandings: `**"Playing for the turn is a mistake."** It is the correct default; variations exist precisely because it is.

**"You should play the line instead."** Against a ball that turns, the line is wrong by definition. The alternatives are to get to the pitch of the ball or to use the crease.`,
    related: [
      'playing-against-spin',
      'arm-ball',
      'googly',
      'doosra',
      'off-break',
      'leg-break',
      'footwork',
    ],
    order: 210,
  }),

  definition({
    slug: 'through-the-gate',
    title: 'Through the Gate',
    category: 'terminology',
    difficulty: 'beginner',
    summary: 'Conventional: a ball passing between bat and pad to hit the stumps.',
    explanation: `The **gate** is the gap between a batter's bat and their front pad. A ball going **through the gate** passes between them and hits the stumps.

**Register: conventional**, universally understood.

It is the most demoralising way to be bowled, because it indicates a technical failure rather than an unplayable delivery: the batter played a shot, and the ball went through a gap that should not have been there.

The two deliveries that most often do it:

**A ball turning in** to the batter — an off break, or a leg spinner's googly — which beats a bat committed to covering turn the other way.

**A ball moving in off the seam or through the air**, which does the same thing at pace.

The standard coaching response is **bat and pad together**, closing the gap so a ball beating the bat hits the pad instead.`,
    whyItMatters: `It names the specific failure that connects several otherwise separate things: the coaching instruction about bat and pad, the effectiveness of the googly and the arm ball, and why LBW and bowled are the spinner's characteristic dismissals rather than caught behind.`,
    misunderstandings: `**"Through the gate means through the legs."** It means between bat and front pad.

**"It is bad luck."** It is generally treated as a technical failure, which is why it stings.

**"Only spinners bowl through the gate."** Pace bowlers moving the ball in do it too.`,
    related: [
      'bowled',
      'inside-edge',
      'forward-defence',
      'googly',
      'off-break',
      'inswinger',
      'playing-for-the-turn',
    ],
    order: 220,
  }),
];
