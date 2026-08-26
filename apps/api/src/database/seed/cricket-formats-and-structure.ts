import { concept, definition, format, law, statistic, tactic } from './cricket-explainer-helpers';
import { ICC_PC, MCC_CODE, REVIEWED } from './cricket-review-metadata';
import type { ExplainerSeed } from './explainer-types';

/**
 * Formats, match structure, red-ball concepts and limited-overs concepts.
 *
 * The classification distinctions in this file are the ones cricket data gets
 * wrong most often, so each is stated explicitly rather than left implied:
 *
 * - Test cricket is a **subset** of first-class cricket, not a synonym.
 * - ODI is a **subset** of List A, not a synonym.
 * - T20I is a **subset** of T20, not a synonym.
 * - A **draw** is an unfinished match; a **tie** is level scores. Different things.
 * - Not every domestic T20 team is a franchise.
 *
 * Playing conditions, which is most of what governs limited-overs cricket, are
 * flagged as competition-and-season specific everywhere they appear. Powerplay
 * numbers, review counts and DLS minimums are not properties of cricket.
 */

const MCC = { key: 'mcc-laws' } as const;
const ICC = { key: 'icc-playing-conditions' } as const;

export const CRICKET_FORMATS_AND_STRUCTURE: ExplainerSeed[] = [
  // ── Formats ───────────────────────────────────────────────────────────────
  format({
    slug: 'test-cricket',
    title: 'Test Cricket',
    category: 'formats',
    difficulty: 'beginner',
    summary:
      'The five-day international format: two innings each, no overs limit, and a draw as a genuine result.',
    explanation: `Test cricket is the longest format and the one the sport regards as its highest standard. Two teams play up to **five days**, each with **two innings**, and there is no limit on the number of overs.

Its defining characteristic is that **time**, rather than deliveries, is the constraint. A side cannot simply bat safely for ever, because they have to bowl the opposition out twice to win, and the opposition can bat to survive. That produces the format's distinctive strategic texture: declarations, follow-ons, batting for draws, and matches decided as much by clock management as by run-scoring.

The name comes from the idea of a match being a "test" of a side over an extended period.`,
    structure: `- **Duration:** up to five days, with a minimum number of overs per day set by playing conditions and play extended to make up shortfalls where possible.
- **Innings:** two per side, alternating, unless the follow-on is enforced.
- **Overs:** unlimited. A side bats until ten wickets fall, the captain declares, or time expires.
- **Sessions:** three per day, separated by lunch and tea, with drinks breaks within them.
- **The ball:** red, with a new one available after a set number of overs; pink for matches played under lights.
- **A new ball** is available to the fielding captain after a specified number of overs, commonly 80 under ICC playing conditions.`,
    resultTypes: `Four outcomes, and this is where Test cricket differs most from limited-overs cricket.

**Win / loss.** One side is bowled out or fails to reach the target in the time available.

**Draw.** Time expires without a result. A draw is a **legitimate and frequently sought** outcome: a side facing defeat plays to survive, and doing so successfully is a real achievement rather than a failure to win.

**Tie.** The scores finish level with the match complete. This is **not** a draw, and it has occurred only twice in Test history.

The presence of the draw is what makes Test cricket strategically distinct. Every declaration decision is a judgement about whether there is enough time left to win.`,
    tactical: `**Wickets are the scarce resource.** Batters can leave twenty balls at no cost, so occupying the crease has intrinsic value and a strike rate of 45 can be an excellent contribution.

**The pitch changes.** Over five days a surface deteriorates, which usually favours the bowling side later and specifically favours spin. Batting last is generally harder than batting first, which is what makes the toss consequential.

**The ball changes.** A new ball swings and seams; an old one may reverse; the second new ball resets the cycle.

**Time is a currency.** Declarations, the follow-on decision and over rates all trade runs against overs remaining.`,
    whoPlaysIt: `Only teams with **Test status**, granted by the ICC to its Full Members. That is a small group, and the list has grown slowly over the sport's history.

This is where the most common classification error arises: a Test is a first-class match, but the vast majority of first-class matches are not Tests.`,
    misunderstandings: `**"Test cricket and first-class cricket are the same."** Test matches are the subset of first-class cricket played between Full Member national teams. A county or state match is first-class and not a Test.

**"A draw means nobody tried."** Batting out five sessions to save a match is one of the format's hardest achievements.

**"A draw and a tie are the same."** A tie is level scores with the match complete; a draw is time expiring.

**"Five days always means five days of play."** Weather, and matches finishing early, mean many Tests do not last five days.`,
    takeaways: `- Up to five days, two innings each, no overs limit.
- Time is the constraint; twenty wickets are needed to win.
- Draws are legitimate results and distinct from ties.
- A subset of first-class cricket, played by Full Members only.`,
    related: [
      'first-class-cricket',
      'test-vs-odi-vs-t20',
      'draw',
      'declaration',
      'follow-on',
      'new-ball',
      'session',
    ],
    sourceKeys: [ICC, { ...MCC, locator: 'Laws 12-15' }],
    order: 20,
    ruleSensitive: true,
    sourceRevision: `${MCC_CODE}; new-ball and over-rate conditions from ${ICC_PC}`,
    lastReviewedAt: REVIEWED,
  }),

  format({
    slug: 'first-class-cricket',
    title: 'First-class Cricket',
    category: 'formats',
    difficulty: 'intermediate',
    summary:
      'The classification for multi-day matches of the highest standard: three days or more, two innings a side, including but not limited to Tests.',
    explanation: `First-class cricket is a **match classification** rather than a competition. It covers matches of the highest standard scheduled for **three or more days**, with **two innings per side**, between sides of eleven players, played on natural turf and recognised as first-class by the relevant governing body.

The definition matters because it determines which matches count towards a player's first-class career record. A batter's first-class average includes their Test runs, their county or state runs, and any other match granted the status.

Test cricket is a **subset** of first-class cricket: every Test is first-class, and most first-class matches are not Tests.`,
    structure: `- **Duration:** three days or more as scheduled.
- **Innings:** two per side.
- **Overs:** unlimited.
- **Surface:** natural turf.
- **Recognition:** granted by the governing body of a Full Member country, or by the ICC for international matches.

Domestic first-class competitions include the County Championship in England and Wales, the Sheffield Shield in Australia, the Ranji Trophy in India, and equivalents elsewhere. Each is first-class; none is Test cricket.`,
    resultTypes: `Win, loss, draw or tie, as in Test cricket. Domestic first-class competitions frequently award points for a draw and bonus points for batting and bowling performance, so a draw can be a materially better outcome than a loss in a way it is not in a Test series.`,
    tactical: `Broadly the same as Test cricket, with two differences worth knowing.

**Shorter matches change the follow-on threshold.** The Law scales it by match length: 200 runs for five days or more, 150 for three or four days.

**Points systems shape declarations.** A domestic side chasing bonus points may declare or bat on in ways a Test side would not.`,
    whoPlaysIt: `National teams with Test status, domestic teams in the top competitions of Full Member countries, and various representative sides granted the classification. The decision is the governing body's.`,
    misunderstandings: `**"First-class means international."** It includes domestic competitions and is mostly domestic by volume.

**"First-class statistics exclude Tests."** They include them.

**"Any three-day match is first-class."** It requires recognition by the governing body, along with the other criteria.

**"List A and T20 matches are first-class."** They are separate classifications. First-class is the multi-innings, multi-day category only.`,
    takeaways: `- Three days or more, two innings a side, recognised by the governing body.
- Tests are a subset; most first-class cricket is domestic.
- First-class career statistics include Test performances.
- Distinct classification from List A and T20.`,
    related: [
      'test-cricket',
      'multi-day-cricket',
      'list-a-cricket',
      'international-status',
      'follow-on',
      'declaration',
    ],
    sourceKeys: [ICC],
    order: 30,
  }),

  format({
    slug: 'odi',
    title: 'ODI',
    category: 'formats',
    difficulty: 'beginner',
    aliases: ['One Day International', 'One-day International'],
    summary:
      'A one-day international: fifty overs each, one innings a side, between teams with ODI status.',
    explanation: `An ODI is a **limited-overs international** played over one day, with each side batting once for a maximum of **fifty overs**.

It sits between Test and T20 cricket in every respect: long enough that wickets matter and an innings has phases, short enough that scoring rate is always a live constraint.

ODI is a **subset** of List A cricket. Every ODI is a List A match; most List A matches are domestic and are not ODIs.`,
    structure: `- **Innings:** one per side, 50 overs maximum.
- **Bowling limit:** no bowler may bowl more than 10 overs.
- **Fielding restrictions:** three phases under current ICC playing conditions — overs 1-10 with at most two fielders outside the circle, 11-40 with at most four, 41-50 with at most five.
- **The ball:** white. Current ICC conditions use two new balls per innings, one from each end.
- **Interruptions:** resolved by the DLS method, subject to a minimum number of overs being bowled.

Every one of those numbers is a **playing condition** rather than a Law, and several have changed within the last two decades.`,
    resultTypes: `Win, loss, tie, or **no result**.

There is **no draw** in an ODI: with one innings each and a fixed number of overs, the match either produces a winner, finishes level, or fails to produce a result because of weather.

A tie in a knockout match is commonly resolved by a **Super Over** under the relevant playing conditions.`,
    tactical: `The format's distinctive feature is that the balance shifts **within** the innings.

**Powerplay (1-10):** field up, boundaries available, but the new ball is moving. Attack and risk are both elevated.

**Middle overs (11-40):** field spread, often spin bowling, and the phase where strike rotation and wicket preservation matter most.

**Death overs (41-50):** maximum acceleration, with wickets in hand becoming the enabling resource.

That three-phase structure is why an ODI batting order needs anchors and finishers, and why the format rewards a different profile from either Tests or T20.`,
    whoPlaysIt: `Teams with **ODI status**, which is a larger group than those with Test status: ICC Full Members plus a number of Associate Members who have earned it. Status is granted and reviewed by the ICC.`,
    misunderstandings: `**"ODI and List A are the same."** ODIs are the international subset of List A cricket.

**"ODIs can be drawn."** They cannot. Tie, no result, or a winner.

**"The rules of an ODI are in the Laws."** The overs, powerplays, bowling limits and ball regulations are playing conditions and have changed repeatedly.

**"Fifty overs has always been the length."** Earlier ODIs were played over 60 and 55 overs, among others.`,
    takeaways: `- Fifty overs each, one innings, one day.
- A subset of List A cricket, played by teams with ODI status.
- No draws: win, loss, tie or no result.
- Three phases created by the fielding restrictions.`,
    related: [
      'list-a-cricket',
      'limited-overs-cricket',
      't20i',
      'powerplay',
      'dls-method',
      'super-over',
      'test-vs-odi-vs-t20',
    ],
    sourceKeys: [ICC],
    order: 40,
    ruleSensitive: true,
    sourceRevision: ICC_PC,
    lastReviewedAt: REVIEWED,
  }),

  format({
    slug: 'list-a-cricket',
    title: 'List A Cricket',
    category: 'formats',
    difficulty: 'intermediate',
    summary:
      'The classification for major limited-overs matches of one innings a side, including ODIs and top domestic one-day competitions.',
    explanation: `List A is the **classification** for significant limited-overs matches: one innings per side, a fixed number of overs, played to a standard the governing body recognises as top-level.

It is the limited-overs equivalent of first-class cricket, and it works the same way. **ODIs are a subset of List A**, along with the premier domestic one-day competitions of Full Member countries.

A player's List A career record therefore combines their ODI matches with their domestic one-day matches, which is why List A statistics and ODI statistics differ.`,
    structure: `- **Innings:** one per side.
- **Overs:** a fixed limit, historically 40, 45, 50 or 60 depending on the competition and era. Fifty is now the most common.
- **Recognition:** granted by the governing body.

Twenty20 matches are **not** List A. They form their own classification, which is why a player has separate List A and T20 records.`,
    resultTypes: `Win, loss, tie or no result. No draws, since there is one innings each.

Domestic competitions vary in how they handle ties and abandonment, which is set by their own playing conditions.`,
    tactical: `Broadly as for ODIs, with the caveat that domestic competitions use different overs limits and different fielding restrictions, so the phase structure is not identical everywhere.`,
    whoPlaysIt: `International teams with ODI status, and domestic teams in the recognised top-level one-day competitions of Full Member countries.`,
    misunderstandings: `**"List A means domestic."** It includes ODIs.

**"List A includes T20."** It does not; T20 is a separate classification.

**"List A is always 50 overs."** The limit has varied by competition and era.`,
    takeaways: `- Classification for top-level one-innings limited-overs matches.
- ODIs are a subset; domestic one-day competitions make up the rest.
- Excludes T20, which is classified separately.
- Overs limits have varied historically.`,
    related: [
      'odi',
      'limited-overs-cricket',
      'first-class-cricket',
      'domestic-t20',
      'international-status',
    ],
    sourceKeys: [ICC],
    order: 50,
  }),

  format({
    slug: 't20i',
    title: 'T20 International',
    category: 'formats',
    difficulty: 'beginner',
    aliases: ['T20I', 'Twenty20 International', 'IT20'],
    summary:
      'A twenty-over international: one innings each, about three hours, between teams with T20I status.',
    explanation: `A T20 International is a **twenty-over** match between two international sides, each batting once. It takes roughly three hours.

A T20I is a **subset** of Twenty20 cricket. Franchise and domestic T20 matches are Twenty20 but not T20Is, and their playing conditions frequently differ.

The format's defining constraint is that **deliveries are scarce**. With 120 balls an innings, a batter cannot afford to spend twenty of them settling in, and a bowler can succeed simply by denying runs.`,
    structure: `- **Innings:** one per side, 20 overs maximum.
- **Bowling limit:** no bowler may bowl more than 4 overs.
- **Powerplay:** the first 6 overs under current ICC men's playing conditions, with at most two fielders outside the circle; at most five thereafter.
- **The ball:** white.
- **Interruptions:** DLS, subject to a minimum number of overs, commonly five for the second innings.
- **Free hits** after no-balls, under the relevant playing conditions.

All of these are playing conditions, and the ICC has revised several of them, including how powerplays are scaled in shortened matches.`,
    resultTypes: `Win, loss, tie or no result. No draws.

Ties in knockout matches are typically resolved by a **Super Over**, under the competition's playing conditions.`,
    tactical: `**Deliveries are the scarce resource**, which inverts almost every Test-cricket instinct.

**Phases**, though less formally defined than in an ODI: powerplay, middle overs, death overs.

**Wickets are cheaper.** A side that finishes on 180 for 8 has generally done better than one on 150 for 3, which is the opposite of Test-cricket logic.

**Match-ups dominate.** With four-over limits and twenty overs to allocate, captains deploy bowlers against specific batters rather than in fixed spells.

**Spin has grown in importance**, particularly wrist spin, because mis-hits against turn go in the air and an aerial mis-hit is usually a wicket.`,
    whoPlaysIt: `A large number of teams. The ICC granted **T20I status to all its members**, which means many Associate Members play official T20Is, and the format is the main route into international cricket for emerging nations.

That breadth is a genuine difference from Test cricket and is why T20I records include teams that do not play the longer formats.`,
    misunderstandings: `**"T20I covers all T20 cricket."** Franchise and domestic T20s are not T20Is.

**"T20I status is restricted."** It is held very widely among ICC members, unlike Test status.

**"T20 rules are universal."** Powerplays, free hits and DLS minimums are competition-specific.

**"Wickets do not matter in T20."** They matter less than in Tests, not not at all: a side four down in the powerplay usually cannot accelerate later.`,
    takeaways: `- Twenty overs each, one innings, roughly three hours.
- A subset of T20 cricket; not all T20 is international.
- Held by a very wide range of ICC members.
- Deliveries are scarce, which inverts Test-cricket logic.`,
    related: [
      'domestic-t20',
      'franchise-cricket',
      'powerplay',
      'death-overs',
      'matchups',
      'test-vs-odi-vs-t20',
      'super-over',
    ],
    sourceKeys: [ICC],
    order: 60,
    ruleSensitive: true,
    sourceRevision: ICC_PC,
    lastReviewedAt: REVIEWED,
  }),

  format({
    slug: 'domestic-t20',
    title: 'Domestic T20',
    category: 'formats',
    difficulty: 'intermediate',
    summary:
      'Twenty-over cricket below international level, played by domestic and franchise teams under their own playing conditions.',
    explanation: `Domestic T20 is twenty-over cricket played within a country's own structure rather than between national teams.

It covers two quite different things, and conflating them is a common error:

**Traditional domestic competitions**, contested by a country's existing domestic teams — counties, states, provinces — which typically have long histories and represent geographic areas.

**Franchise competitions**, where teams are commercial entities created for the competition, often with player auctions or drafts.

Both are domestic T20. Only the second is franchise cricket.`,
    structure: `Twenty overs a side, one innings each, with a four-over limit per bowler as standard.

Beyond that, **the playing conditions belong to the competition**. Powerplay lengths, free-hit rules, DLS minimums, substitution rules, timeout provisions and even innovations such as extra-player rules differ between competitions and change between seasons.

That variability is the single most important thing to know about domestic T20: a statement about "the rules of T20" is almost always a statement about one competition in one season.`,
    resultTypes: `Win, loss, tie or no result, with tie-breaking mechanisms set by the competition. Some use Super Overs; others have used other methods historically.`,
    tactical: `Broadly as for T20Is, with two differences.

**Squad construction is different.** Franchise sides pick from a global player pool, so a domestic T20 team may field a stronger XI than some international sides.

**Local conditions dominate.** A competition played on one country's pitches develops its own tactical character: spin-heavy in some, pace-and-bounce in others.`,
    whoPlaysIt: `Domestic teams and franchises, with overseas players subject to each competition's limits.`,
    misunderstandings: `**"Every domestic T20 team is a franchise."** Many are long-standing counties, states or provinces. Franchise cricket is a specific commercial model.

**"Domestic T20 matches are T20Is."** They are not, and their statistics are recorded separately.

**"T20 playing conditions are standard."** They vary by competition and season.`,
    takeaways: `- Twenty-over cricket below international level.
- Includes both traditional domestic teams and franchises; they are not the same.
- Playing conditions are competition-specific and change frequently.
- Not T20Is, and recorded separately.`,
    related: [
      't20i',
      'franchise-cricket',
      'limited-overs-cricket',
      'powerplay',
      'international-status',
    ],
    sourceKeys: [ICC],
    order: 70,
  }),

  format({
    slug: 'franchise-cricket',
    title: 'Franchise Cricket',
    category: 'formats',
    difficulty: 'intermediate',
    summary:
      'Competitions where teams are commercial franchises assembled by auction or draft rather than representing an existing region.',
    explanation: `Franchise cricket describes competitions in which the teams are **commercial entities created for the competition**, rather than pre-existing representative sides.

The distinguishing features are usually:

- Teams **owned** by investors rather than being member clubs or state associations.
- Squads assembled through an **auction or draft**, from a pool that typically includes overseas players.
- **No requirement of geographic continuity** with an existing cricket structure, though most franchises are city-based.

The model has reshaped the sport's economics and its calendar, and it has created a professional pathway independent of national selection.`,
    structure: `Predominantly T20, though the model has been applied to other formats. Playing conditions are set by the competition, and franchise leagues have been the main source of innovation and variation in limited-overs regulations.

Squad rules — overseas player limits, salary caps, retention and auction mechanics — are competition-specific and are a defining part of each league's character.`,
    resultTypes: `As for the format being played, with tie-breaks and playoff structures set by the competition.`,
    tactical: `The global player pool is the structural difference. A franchise can assemble specialists for narrow roles — a death bowler, a powerplay hitter, a wrist spinner for the middle overs — in a way a national side selecting from one country cannot.

That has accelerated role specialisation across the sport, and much of the modern vocabulary of phases and match-ups came out of franchise cricket.`,
    whoPlaysIt: `Contracted players, including internationals, domestic professionals and overseas signings, subject to each competition's rules and to their home board's clearance.`,
    misunderstandings: `**"Franchise cricket means T20."** Predominantly, but the model is not defined by the format.

**"All domestic T20 is franchise cricket."** Traditional county, state and provincial competitions are not.

**"Franchise cricket is not first-class or List A."** Correct for T20 leagues, and it is worth stating: those matches carry T20 classification, not first-class or List A.`,
    takeaways: `- Teams are commercial franchises with squads built by auction or draft.
- Predominantly T20, with competition-specific playing and squad rules.
- Draws on a global player pool, which has driven role specialisation.
- Distinct from traditional domestic competitions.`,
    related: ['domestic-t20', 't20i', 'matchups', 'finisher', 'international-status'],
    order: 80,
  }),

  format({
    slug: 't10',
    title: 'T10',
    category: 'formats',
    difficulty: 'intermediate',
    summary:
      'A ten-over format, shorter and more compressed than T20, played in a small number of competitions.',
    explanation: `T10 is a limited-overs format of **ten overs per side**, taking around ninety minutes.

It compresses T20's logic further. With sixty deliveries an innings, there is effectively no consolidation phase: batters attack from the first ball, and bowlers are judged almost entirely on denying runs.

It is played in a small number of competitions rather than as an international format, and it does not carry the classifications that Tests, List A and T20 do.`,
    structure: `Ten overs a side. Per-bowler limits, powerplay lengths and other conditions are set by the competition and have varied since the format's introduction.

Because the format is young and confined to a few competitions, there is no settled standard set of conditions in the way there is for T20.`,
    resultTypes: `Win, loss, tie or no result, with tie-breaks set by the competition.`,
    tactical: `Extreme compression. Wicket preservation has almost no value relative to scoring rate, sides frequently open with their most aggressive batters, and a single over can decide a match.

Bowlers with a reliable death-overs skill set are disproportionately valuable, since almost every over is effectively a death over.`,
    whoPlaysIt: `Franchise and exhibition competitions. It is not an international format with ICC status in the way T20I is.`,
    misunderstandings: `**"T10 is an official international format."** It is played in specific competitions and does not have the international classification structure of T20I.

**"T10 is just short T20."** The absence of any consolidation phase changes the tactics more than the ten-over reduction suggests.`,
    takeaways: `- Ten overs a side, roughly ninety minutes.
- Played in a small number of competitions, without the established classifications.
- No consolidation phase, so tactics compress further than T20.`,
    related: ['t20i', 'domestic-t20', 'limited-overs-cricket', 'death-overs', 'franchise-cricket'],
    order: 90,
  }),

  format({
    slug: 'multi-day-cricket',
    title: 'Multi-day Cricket',
    category: 'formats',
    difficulty: 'intermediate',
    summary:
      'Cricket played over more than one day with two innings a side, where a draw is possible and the pitch changes.',
    explanation: `Multi-day cricket is the umbrella term for matches played across more than a single day, with **two innings per side** and no limit on overs. Test and first-class cricket are its recognised forms, and it also covers longer matches below first-class standard.

Three features distinguish it from limited-overs cricket, and all three follow from having time rather than deliveries as the constraint:

**A draw is possible.** A match can end unresolved, which creates the strategic option of playing for survival.

**The pitch evolves.** A surface used for four or five days deteriorates, which usually shifts the balance towards bowling and towards spin.

**The ball evolves.** New ball, old ball, second new ball, and possible reverse swing in between.`,
    structure: `- **Duration:** two days or more.
- **Innings:** two per side.
- **Sessions:** typically three a day with intervals.
- **Follow-on thresholds** scale with the scheduled length: 200 runs for five days or more, 150 for three or four days, 100 for two days, 75 for one.`,
    resultTypes: `Win, loss, draw or tie. The draw is the format-defining outcome and the reason declarations exist.`,
    tactical: `Wickets are scarce and time is the currency. That produces the whole apparatus of multi-day tactics: declarations, the follow-on decision, batting for a draw, nightwatchmen, and managing over rates so that enough overs remain to bowl a side out.`,
    whoPlaysIt: `International sides in Tests, domestic sides in first-class competitions, and a wide range of club and age-group cricket at shorter multi-day lengths.`,
    misunderstandings: `**"Multi-day cricket means first-class."** First-class requires three days and governing-body recognition; two-day matches are multi-day but not first-class.

**"Multi-day and Test are interchangeable."** Test cricket is one form of it.`,
    takeaways: `- More than one day, two innings a side, no overs limit.
- The draw, the deteriorating pitch and the ageing ball are its defining features.
- Follow-on thresholds scale with scheduled length.`,
    related: [
      'test-cricket',
      'first-class-cricket',
      'draw',
      'declaration',
      'follow-on',
      'pitch-deterioration',
    ],
    sourceKeys: [{ ...MCC, locator: 'Law 14 (The follow-on)' }],
    order: 100,
  }),

  format({
    slug: 'limited-overs-cricket',
    title: 'Limited-overs Cricket',
    category: 'formats',
    difficulty: 'beginner',
    summary:
      'Cricket where each side bats once for a fixed number of overs, so a result is produced in a single day.',
    explanation: `Limited-overs cricket, sometimes called one-day cricket, gives each side **one innings of a fixed maximum number of overs**.

That single change from multi-day cricket cascades through everything:

**No draws.** With a fixed number of deliveries, the match produces a winner, a tie, or no result.

**Deliveries become the scarce resource.** A batter cannot leave twenty balls, because they will not get them back.

**Fielding restrictions exist.** Because both sides get equal deliveries, competitions add powerplays and circle restrictions to shape the contest.

**Interruptions need a method.** Weather-shortened matches require a recalculation, which is what DLS is for.`,
    structure: `- **Innings:** one per side.
- **Overs:** a fixed maximum: 50 in ODIs and most List A, 20 in T20, 10 in T10, and various figures historically.
- **Per-bowler limits**, typically one fifth of the innings.
- **Fielding restrictions** by phase, set by playing conditions.
- **DLS** for interruptions, with minimum-overs thresholds.`,
    resultTypes: `Win, loss, tie, or no result. Never a draw.

Ties may be resolved by a Super Over where the competition's conditions provide for it, or stand as ties where they do not.`,
    tactical: `The whole tactical apparatus of phases: powerplay, middle overs, death overs, required run rate, par score, and the management of wickets in hand as an enabler of late acceleration rather than as an end in itself.`,
    whoPlaysIt: `Almost everybody. Limited-overs cricket is the dominant form of the game by volume at every level from international to recreational.`,
    misunderstandings: `**"Limited-overs cricket cannot be drawn."** Correct, and worth stating explicitly, because "draw" is often used loosely for a tie.

**"One-day cricket means 50 overs."** It covers any fixed-overs format.

**"Fielding restrictions are part of the Laws."** They come from playing conditions.`,
    takeaways: `- One innings a side, fixed overs, result in a day.
- No draws: win, loss, tie or no result.
- Deliveries are scarce, which drives phase-based tactics.
- Fielding restrictions and DLS are playing conditions.`,
    related: [
      'odi',
      't20i',
      'list-a-cricket',
      'powerplay',
      'dls-method',
      'required-run-rate',
      't10',
      'test-vs-odi-vs-t20',
    ],
    sourceKeys: [ICC],
    order: 110,
  }),

  concept({
    slug: 'international-status',
    title: 'International Status and Match Classification',
    category: 'formats',
    difficulty: 'advanced',
    summary:
      'How the ICC decides which matches count as Tests, ODIs and T20Is, and why classification is separate from format.',
    explanation: `Two distinct things determine what a match is, and cricket data errors almost always come from confusing them.

**Format** is how the match is played: two innings over five days, or fifty overs, or twenty.

**Classification** is what the match officially counts as: Test, first-class, ODI, List A, T20I or T20. Classification is granted by the **ICC** for international matches and by **national governing bodies** for domestic ones.

A match can have the format of a Test and not be one. A fifty-over match between two teams without ODI status is a fifty-over match, not an ODI, and the runs scored in it do not appear in anybody's ODI record.`,
    howItWorks: `The structure, as it currently stands:

**Test status** is held by ICC **Full Members** only, and the list has grown slowly. Test matches are also first-class.

**ODI status** is held by Full Members and by a number of Associate Members who have qualified for it through the ICC's competition structure. ODIs are also List A.

**T20I status** is held very widely: the ICC extended it to **all its members**, which is why many Associate nations play official T20Is and appear in T20I records.

**Domestic classifications** — first-class, List A, T20 — are granted by the national governing body, subject to the ICC's criteria.

This is why status changes matter historically: a country's early matches may pre-date its Test status, and matches involving teams whose status was later granted or withdrawn are classified according to the position at the time.`,
    whyItMatters: `Every career statistic depends on it. A player's Test average includes only matches classified as Tests; their first-class average includes those plus other first-class matches. Comparing a "Test record" against a "first-class record" without knowing the relationship produces nonsense.

It also matters for data modelling. A system that treats format and classification as the same field cannot represent a fifty-over match that is not an ODI, or a T20 that is not a T20I, and both are extremely common.`,
    misunderstandings: `**"All fifty-over internationals are ODIs."** Only those between teams with ODI status, and only where the match is designated as such.

**"T20I status is as exclusive as Test status."** It is held far more widely.

**"Classification follows automatically from format."** It is granted, and the two must be modelled separately.

**"Status never changes."** It has been granted, and in some cases suspended or withdrawn, over the sport's history.`,
    takeaways: `- Format is how a match is played; classification is what it officially counts as.
- Test status is Full Members only; ODI status wider; T20I status very wide.
- Career statistics depend entirely on classification.
- Format and classification must be modelled as separate things.`,
    related: [
      'test-cricket',
      'first-class-cricket',
      'odi',
      'list-a-cricket',
      't20i',
      'domestic-t20',
    ],
    sourceKeys: [ICC],
    order: 120,
    ruleSensitive: true,
    sourceRevision: ICC_PC,
    lastReviewedAt: REVIEWED,
  }),

  // ── Match structure ───────────────────────────────────────────────────────
  definition({
    slug: 'session',
    title: 'Session',
    category: 'match-structure',
    alsoIn: ['red-ball-concepts'],
    difficulty: 'beginner',
    summary:
      'One of the blocks of play a day of multi-day cricket is divided into, separated by intervals.',
    explanation: `A day of Test or first-class cricket is divided into **three sessions**, separated by the lunch and tea intervals. Each is roughly two hours, or around thirty overs.

Sessions are how multi-day cricket is actually discussed and planned. Players and captains talk about "winning the session" rather than the day, because a session is a coherent unit: a new bowling plan, a fresh batting partnership, a period a side can set an objective for.

A common framing is that a Test consists of fifteen sessions, and that a side needs to win a clear majority of them.`,
    whyItMatters: `Sessions structure the tactics. A captain protects a batter until the interval, holds a bowler back for a fresh session, or attacks in the last twenty minutes before a break when batters are tiring.

The last session of a day carries its own logic entirely: this is where the nightwatchman question arises, and where a batting side is trying to survive to the close with wickets intact.`,
    misunderstandings: `**"A session is a fixed number of overs."** It is a period of time with a minimum over requirement, and it can be extended or shortened.

**"Sessions exist in limited-overs cricket."** Limited-overs matches have innings and drinks breaks rather than sessions in this sense.`,
    related: [
      'lunch',
      'tea',
      'drinks-break',
      'nightwatchman',
      'test-cricket',
      'over-rate-and-time',
    ],
    sourceKeys: [{ key: 'mcc-laws', locator: 'Laws 11, 12 (Intervals; Start of play)' }],
    order: 10,
  }),

  definition({
    slug: 'drinks-break',
    title: 'Drinks Break',
    category: 'match-structure',
    difficulty: 'beginner',
    summary: 'A short pause within a session for the players to take on fluids.',
    explanation: `A drinks break is a brief interval, usually a couple of minutes, taken within a session. In multi-day cricket there is typically one per session; in limited-overs cricket there is usually one per innings, sometimes called a strategic timeout depending on the competition.

Under the Laws, the timing and number of drinks intervals are agreed before the match, and the umpires can adjust them for conditions, particularly heat.`,
    whyItMatters: `Beyond hydration, drinks breaks are the points at which a fielding side can talk. A captain, the bowlers and the coach's messages all get exchanged, and plans change at drinks more often than at any other moment within a session.

Some T20 competitions have formalised this with a **strategic timeout**, an explicit tactical break, which is a playing-condition innovation rather than a Law.`,
    misunderstandings: `**"Drinks breaks are fixed."** Timing is agreed in advance and can be adjusted by the umpires for conditions.

**"A strategic timeout is a drinks break."** It is a competition-specific tactical break, though it serves a similar coordinating function.`,
    related: ['session', 'lunch', 'tea', 'bowling-changes', 'over-rate-and-time'],
    sourceKeys: [{ key: 'mcc-laws', locator: 'Law 11 (Intervals)' }],
    order: 20,
  }),

  definition({
    slug: 'lunch',
    title: 'Lunch',
    category: 'match-structure',
    difficulty: 'beginner',
    summary: 'The interval between the first and second sessions of a day in multi-day cricket.',
    explanation: `Lunch is the first main interval of a day's play in Test and first-class cricket, taken after roughly two hours or thirty overs, and lasting around forty minutes.

Under the Laws the timing is agreed before the match, and it can move: if a wicket falls close to the scheduled time, the interval is commonly taken immediately, and in some circumstances lunch is delayed to allow an innings to be completed.`,
    whyItMatters: `It divides the day and resets the contest. A batting pair that survives to lunch has achieved something specific, and a bowling side that takes a wicket in the last over before the interval has done real damage: the incoming batter has to start their innings twice, once before lunch and again after it.

That is why the period immediately before an interval is a recognised pressure point, and why captains often bring a frontline bowler back for it.`,
    misunderstandings: `**"Lunch is at a fixed time."** It is scheduled but movable, particularly around a wicket or the end of an innings.

**"Limited-overs matches have lunch."** They have an innings break instead.`,
    related: ['session', 'tea', 'drinks-break', 'test-cricket', 'nightwatchman'],
    sourceKeys: [{ key: 'mcc-laws', locator: 'Law 11 (Intervals)' }],
    order: 30,
  }),

  definition({
    slug: 'tea',
    title: 'Tea',
    category: 'match-structure',
    difficulty: 'beginner',
    summary: 'The interval between the second and third sessions of a day in multi-day cricket.',
    explanation: `Tea is the second main interval of a day's play, taken after the middle session and lasting around twenty minutes.

Like lunch, its timing is agreed before the match and can be adjusted around wickets and the end of an innings.

The name is a survival from cricket's origins and has no functional meaning beyond marking the interval.`,
    whyItMatters: `The session after tea is the last of the day, and it has a distinctive character: the light is often fading, batters are tired, and the batting side is increasingly focused on surviving to the close rather than scoring.

It is where nightwatchmen appear, where a bowling side pushes hardest for a wicket, and where a captain with a lead may attack knowing the batters cannot simply bat out a full session.`,
    misunderstandings: `**"Tea is a fixed twenty minutes at a fixed time."** Both duration and timing are agreed in advance and adjustable.

**"Tea exists in all cricket."** It is a multi-day convention.`,
    related: ['session', 'lunch', 'drinks-break', 'nightwatchman', 'test-cricket'],
    sourceKeys: [{ key: 'mcc-laws', locator: 'Law 11 (Intervals)' }],
    order: 40,
  }),

  definition({
    slug: 'target',
    title: 'Target',
    category: 'match-structure',
    alsoIn: ['scoring-and-scorecards'],
    difficulty: 'beginner',
    summary:
      'The number of runs the side batting last needs to win, which is one more than the opposition’s relevant total.',
    explanation: `The target is what the chasing side must reach to win. It is always **one more** than the runs required to level the scores, because level scores are a **tie** rather than a win.

**In limited-overs cricket** the target is the first side's total plus one. If Team A make 250, Team B's target is 251: reaching 250 ties the match.

**In multi-day cricket** the target is the opposition's aggregate lead plus one. If a side is 320 behind on aggregate at the start of their final innings, they need 321.

**Where DLS applies**, the target is recalculated by the method and announced, and the same "plus one" logic holds: the DLS **par score** is the level-scores figure, so the target is par plus one.`,
    example: `Team A make 250 in a 50-over match. Team B's target is **251**.

If Team B finish on 250, the match is a **tie**, not a win.

If rain reduces Team B's innings and DLS sets a par of 214 after 38 overs, Team B need **215** to win at that point, and reaching exactly 214 ties.`,
    whyItMatters: `The plus-one rule is the single most common arithmetic error in casual cricket discussion, and it decides matches: several international matches have ended as ties because a side reached the level-scores figure and no further.`,
    misunderstandings: `**"The target is the opposition's score."** It is their score plus one.

**"Reaching the par score wins under DLS."** Par ties; par plus one wins.

**"A tie is a shared win."** It is its own result, and in knockouts it usually triggers a Super Over.`,
    related: ['chase', 'tie', 'required-run-rate', 'dls-method', 'par-score', 'lead'],
    order: 50,
  }),

  tactic({
    slug: 'chase',
    title: 'Chase',
    category: 'match-structure',
    alsoIn: ['limited-overs-concepts', 'tactics-and-strategy'],
    difficulty: 'beginner',
    summary:
      'Batting second with a known target, which is a different mental and tactical problem from setting one.',
    explanation: `A chase is the innings of the side batting second, with a target already known.

It is different from batting first in a way that matters more than it might appear: the chasing side has **perfect information about what is required**, and therefore no excuse for misjudging the tempo, but also no room for the ambiguity that lets a side batting first simply "get as many as possible".

Every ball of a chase has an exact arithmetic context: runs required, balls remaining, wickets in hand.`,
    howItWorks: `The chasing side is managing three quantities simultaneously.

**Required run rate**, which rises whenever the actual rate falls below it.

**Wickets in hand**, which determine how much risk is affordable.

**Which bowlers remain**, since a target is chased against specific bowlers rather than an average. Knowing that the weakest bowler has three overs left changes when to accelerate.

The standard structure of a well-managed chase is to keep the required rate within reach early without losing wickets, then use wickets in hand to accelerate. The characteristic failure is leaving too much for too few overs, which is why sides talk about "staying ahead of the game".`,
    tradeoffs: `Chasing has a real advantage and a real cost.

**Advantage:** certainty. The side knows exactly what is needed, which allows precise risk calibration.

**Cost:** pressure, and the loss of flexibility. A side batting first can adapt to conditions; a chasing side must reach a number regardless of whether the pitch has deteriorated or the dew has arrived.

Whether chasing is easier is genuinely conditions-dependent, and the toss decision usually turns on it: dew in a night match favours chasing, a deteriorating pitch favours batting first.`,
    formatDifferences: `In **T20** and **ODI** cricket a chase is against a fixed target and a fixed number of overs, and DLS may revise it.

In **Test** cricket a fourth-innings chase is against a target **and** the clock, and the chasing side may also settle for a draw, which means the chase can be abandoned mid-innings in a way limited-overs cricket does not allow.`,
    misunderstandings: `**"Chasing is easier because you know the target."** Certainty helps and pressure hurts; which dominates depends on conditions and the size of the target.

**"The required rate tells you what to do."** It tells you the average needed. Wickets in hand and which bowlers remain decide when to take risks.

**"A Test chase is like an ODI chase."** A Test chase has a draw available as an alternative outcome.`,
    takeaways: `- Batting second against a known target.
- Managing required rate, wickets in hand, and which bowlers remain.
- Certainty is the advantage; inflexibility is the cost.
- In Tests, the draw remains an option mid-chase.`,
    related: [
      'target',
      'required-run-rate',
      'par-score',
      'dls-method',
      'batting-tempo',
      'finisher',
      'dew',
    ],
    order: 60,
  }),

  definition({
    slug: 'first-innings',
    title: 'First Innings',
    category: 'match-structure',
    difficulty: 'beginner',
    summary:
      'A side’s first turn with the bat, and in multi-day cricket the one that sets up everything that follows.',
    explanation: `The first innings is a side's first turn batting. In limited-overs cricket it is their only one; in multi-day cricket it is the first of two.

In **multi-day cricket** the first innings of each side does specific work. It establishes the **first-innings lead**, which determines whether the follow-on is available, and it is played on the freshest version of the pitch, which usually means the most predictable conditions of the match.

A large first-innings total in a Test is disproportionately valuable, because it is scored in the easiest batting conditions the match will offer and it forces the opposition to bat under pressure on a deteriorating surface later.`,
    whyItMatters: `First-innings runs are the strongest single predictor of a Test result, for a straightforward reason: the side that gets ahead on first innings can dictate the rest of the match, choosing whether to enforce the follow-on, when to declare, and when to attack.`,
    misunderstandings: `**"The first innings is just the first of four."** It is played on the best surface, and the lead it produces shapes every subsequent tactical option.

**"First innings means the team batting first."** Each side has a first innings; the phrase refers to whichever side's is being discussed.`,
    related: ['second-innings', 'lead', 'deficit', 'follow-on', 'declaration', 'test-cricket'],
    order: 70,
  }),

  definition({
    slug: 'second-innings',
    title: 'Second Innings',
    category: 'match-structure',
    difficulty: 'beginner',
    summary:
      'A side’s second turn with the bat in multi-day cricket, played on a used pitch and usually against a target or a clock.',
    explanation: `In multi-day cricket each side bats twice, and the second innings is materially different from the first.

**The pitch is worn.** Cracks, rough patches from bowlers' follow-throughs, and general deterioration mean the ball behaves less predictably and spin is usually more effective.

**The context is known.** A side batting a second innings knows the first-innings scores and often knows exactly what it must do: set a target, chase one, or survive.

**The fourth innings is the hardest.** Batting last on a five-day pitch, usually against spin and reverse swing, with a target and a clock, is generally considered the most difficult batting assignment in cricket.`,
    whyItMatters: `The asymmetry between first and second innings is why the toss matters and why sides prefer to bat first on a pitch expected to deteriorate. It is also why a first-innings lead is worth more than the raw number suggests: it usually means the opposition, not you, has to bat last.`,
    misunderstandings: `**"The second innings is the same job as the first."** The pitch and the context are both different.

**"Limited-overs matches have second innings in this sense."** They have a second batting innings of the match, but not a second innings per side.`,
    related: [
      'first-innings',
      'pitch-deterioration',
      'rough',
      'chase',
      'batting-for-a-draw',
      'reverse-swing',
    ],
    order: 80,
  }),

  definition({
    slug: 'lead',
    title: 'Lead',
    category: 'match-structure',
    alsoIn: ['red-ball-concepts', 'scoring-and-scorecards'],
    difficulty: 'beginner',
    summary: 'How far ahead a side is on aggregate runs across the innings played so far.',
    explanation: `A lead is the margin by which a side is ahead on aggregate. In multi-day cricket it is calculated across all completed innings, not within a single one.

If Team A make 400 and Team B are bowled out for 250, Team A lead by **150**. If Team A then bat again and reach 200, their overall lead is **350**, which is what a target would be based on.

The **first-innings lead** specifically determines whether the follow-on is available: 200 runs for a match of five days or more, under Law 14.`,
    whyItMatters: `The lead is what converts scoring into a match position. A side 300 ahead with two days left is in a winning position; the same 300 with half a day left is heading for a draw, because the lead has to be convertible into wickets and time.

It is also the number every declaration decision is made against: a captain declares when the lead is large enough that the opposition cannot realistically chase it, but early enough that there is time to bowl them out.`,
    misunderstandings: `**"A lead is the difference in the current innings."** It is the aggregate across all completed innings.

**"A big lead means a win."** It has to be convertible into twenty wickets within the time remaining.

**"Leads exist in limited-overs cricket."** With one innings each, the relevant concept is the target rather than a lead.`,
    related: ['deficit', 'target', 'declaration', 'follow-on', 'first-innings', 'draw'],
    sourceKeys: [{ key: 'mcc-laws', locator: 'Law 14 (The follow-on)' }],
    order: 90,
  }),

  definition({
    slug: 'deficit',
    title: 'Deficit',
    category: 'match-structure',
    alsoIn: ['red-ball-concepts', 'scoring-and-scorecards'],
    difficulty: 'beginner',
    summary: 'How far behind a side is on aggregate runs. The other side of a lead.',
    explanation: `A deficit is the margin by which a side trails on aggregate. If Team A make 400 and Team B are bowled out for 250, Team B's deficit is **150**.

The deficit is what determines whether a side can be made to **follow on**: if it is at least 200 in a match of five days or more, the leading captain may require them to bat again immediately.

A side batting to erase a deficit is doing something specific: their first job is to reach parity, and only after that do they begin to build a lead of their own. Commentary describes this as "batting to save the innings defeat" and then "batting to set a target", and they are genuinely different phases of the same innings.`,
    whyItMatters: `A large deficit changes the range of possible results. A side 300 behind is usually playing for a draw rather than a win, which changes their tempo entirely: they are batting against the clock rather than the scoreboard.`,
    misunderstandings: `**"A deficit is only relevant to the follow-on."** It defines what results remain available.

**"Deficit and target are the same."** A target is what you need to **win**; a deficit is how far behind you are, and erasing it only gets you level.`,
    related: ['lead', 'follow-on', 'target', 'batting-for-a-draw', 'first-innings', 'draw'],
    sourceKeys: [{ key: 'mcc-laws', locator: 'Law 14 (The follow-on)' }],
    order: 100,
  }),

  definition({
    slug: 'draw',
    title: 'Draw',
    category: 'match-structure',
    alsoIn: ['red-ball-concepts'],
    difficulty: 'beginner',
    summary:
      'A multi-day match that ends without a result because time ran out. Not the same as a tie.',
    explanation: `A draw is a match that finishes **unresolved**: the time available expired without either side winning.

It exists only in **multi-day, time-limited cricket**. Test and first-class matches can be drawn; limited-overs matches cannot, because a fixed number of overs always produces a winner, a tie, or no result.

The essential distinction, and the one cricket data most often gets wrong:

- A **draw** means the match did not finish. The scores are usually nothing like level.
- A **tie** means the match finished with the **scores exactly level**.

A Test that ends with one side on 400 for 3 chasing 550 is a draw. A Test that ends with the scores level is a tie, and that has happened twice in history.`,
    example: `Team A make 500 and 300 for 4 declared. Team B make 420, and at the close of the fifth day are 180 for 6, chasing 381.

The match is a **draw**. Team B did not reach the target and were not bowled out; time ran out. The scores are 200 runs apart.

Contrast: if Team B had been bowled out with the aggregate scores exactly level, that would be a **tie**.`,
    whyItMatters: `The draw is what makes multi-day cricket strategically distinct. Because a side can survive rather than win, an entire branch of tactics exists around it: batting for a draw, declaring to leave enough time, and the calculation of whether a target is worth setting.

It also means a side can play for a draw from the first day, and that a series can be decided by a side's ability to avoid defeat rather than to force victory.`,
    misunderstandings: `**"A draw is a tie."** They are different results. Level scores is a tie; time expiring is a draw.

**"A draw means a boring match."** Matches saved by a last-wicket partnership are among the most tense in the sport.

**"Limited-overs matches can be drawn."** They cannot: win, loss, tie or no result.

**"A draw means neither side gained anything."** Domestic competitions award points for draws, and in a series a draw can be a decisive result.`,
    related: [
      'tie',
      'no-result',
      'batting-for-a-draw',
      'declaration',
      'test-cricket',
      'multi-day-cricket',
    ],
    sourceKeys: [{ key: 'mcc-laws', locator: 'Law 16 (The result)' }],
    order: 110,
  }),

  definition({
    slug: 'tie',
    title: 'Tie',
    category: 'match-structure',
    difficulty: 'beginner',
    summary: 'A completed match in which the scores finish exactly level. Distinct from a draw.',
    explanation: `A tie occurs when a match is **completed** and the aggregate scores are **exactly level**.

The completion requirement is what distinguishes it from a draw. Under **Law 16**, a tie requires the match to have finished: in limited-overs cricket that means the second side's innings has ended, either by being bowled out or by the overs running out, with the scores level.

Ties are rare in every format and extremely rare in Tests, where only two have occurred.

In limited-overs knockout matches a tie is usually resolved by a **Super Over** under the competition's playing conditions. Where no such provision exists, the tie stands as the result.`,
    example: `Team A make 250. Team B are bowled out for exactly **250**. Tie.

Note that Team B needed **251** to win: the target is always one more than the level-scores figure, which is why sides occasionally tie by reaching what they mistakenly treated as the target.`,
    whyItMatters: `Beyond its rarity, the tie matters because of how often it is confused with a draw. They are structurally different: a tie is a finished match with equal scores, a draw is an unfinished match. Any dataset that merges them is wrong, and any commentary that uses them interchangeably is misleading.`,
    misunderstandings: `**"A tie and a draw are the same."** A tie is level scores in a completed match; a draw is time expiring.

**"A tie means both sides win."** It is its own result, and in knockouts it triggers a tie-break.

**"A limited-overs match with level scores and overs remaining is a tie."** Only if the innings has ended, which requires the side to be bowled out.`,
    related: ['draw', 'super-over', 'target', 'no-result', 'limited-overs-cricket'],
    sourceKeys: [{ key: 'mcc-laws', locator: 'Law 16 (The result)' }],
    order: 120,
  }),

  definition({
    slug: 'no-result',
    title: 'No Result',
    category: 'match-structure',
    difficulty: 'intermediate',
    summary:
      'A limited-overs match abandoned without enough play for a result, which is neither a draw nor a tie.',
    explanation: `A **no result** is a limited-overs match in which insufficient play took place for a winner to be determined, almost always because of weather.

Limited-overs playing conditions specify a **minimum number of overs** that must be bowled in the second innings for a result to be calculated by DLS. Under ICC conditions that is commonly 20 overs in an ODI and 5 in a T20I, though the figures are competition-specific.

If the match does not reach that minimum, there is no result. The match is not a draw, because limited-overs cricket has no draws, and it is not a tie, because nothing was completed.

In league competitions a no result usually means points are shared.`,
    whyItMatters: `It is the third distinct non-victory outcome in cricket, and keeping the three apart is essential for any records system: **draw** (multi-day, time expired), **tie** (completed, level scores), **no result** (limited-overs, insufficient play).

It also affects tournament arithmetic, since shared points and the effect on net run rate can decide qualification.`,
    misunderstandings: `**"A rained-off match is a draw."** In limited-overs cricket it is a no result.

**"No result means no play happened."** There may have been a full first innings; what matters is whether the second innings reached the minimum.

**"No result and abandoned are the same."** An abandoned match may produce a no result; the terms describe the cause and the outcome respectively.`,
    related: [
      'abandoned-match',
      'draw',
      'tie',
      'dls-method',
      'net-run-rate',
      'limited-overs-cricket',
    ],
    sourceKeys: [ICC],
    order: 130,
    ruleSensitive: true,
    sourceRevision: ICC_PC,
    lastReviewedAt: REVIEWED,
  }),

  definition({
    slug: 'abandoned-match',
    title: 'Abandoned Match',
    category: 'match-structure',
    difficulty: 'intermediate',
    summary: 'A match called off by the umpires, usually for weather, ground conditions or safety.',
    explanation: `A match is abandoned when the umpires decide that play cannot continue or begin at all. The usual causes are rain, an unfit ground, bad light beyond what the Laws allow, or safety concerns.

Abandonment describes the **decision**, not the result. What result follows depends on the format and how much play occurred:

- In **limited-overs cricket**, an abandoned match usually produces a **no result**, unless enough overs were bowled for DLS to determine a winner.
- In **multi-day cricket**, an abandoned match is a **draw**, since time has expired without a result.

Under the Laws, decisions about fitness of ground, weather and light are the **umpires' alone**, and they are required to consider whether conditions are dangerous or unreasonable rather than merely unpleasant.`,
    whyItMatters: `The distinction between the decision and the result is where confusion arises: "the match was abandoned" tells you why play stopped but not what the match is recorded as, and the two are recorded separately.

There is also a practical consequence in tournaments, where an abandonment's effect on points and net run rate can matter as much as a defeat.`,
    misunderstandings: `**"Abandoned means no result."** In multi-day cricket it means a draw; in limited-overs it usually means no result but can still produce a winner via DLS.

**"Abandonment is the captains' decision."** It is the umpires'.

**"Bad light always stops play."** The umpires judge whether conditions are dangerous or unreasonable, and in many competitions floodlights change the calculation.`,
    related: ['no-result', 'draw', 'dls-method', 'on-field-umpire', 'over-rate-and-time'],
    sourceKeys: [{ key: 'mcc-laws', locator: 'Laws 2, 3 (The umpires; The scorers)' }],
    order: 140,
  }),

  // ── Red-ball concepts ─────────────────────────────────────────────────────
  concept({
    slug: 'new-ball',
    title: 'New Ball',
    category: 'red-ball-concepts',
    alsoIn: ['equipment', 'pace-bowling'],
    difficulty: 'beginner',
    summary:
      'A fresh, hard, shiny ball with a pronounced seam, which swings and bounces more than an old one.',
    explanation: `A new ball is the most bowler-friendly object in cricket, and the phase in which it is used is the phase in which most top-order batters get out.

Its properties, all of which decay:

**Hard.** It bounces more and carries further to the keeper and slips, so edges are catchable.

**Shiny, with a smooth surface.** One side can be polished while the other roughens, which is what produces **conventional swing**.

**A pronounced, raised seam.** It grips the pitch, producing **seam movement**, and it holds the aerodynamic asymmetry that produces swing.

As the ball ages, all three diminish: it softens, the shine goes, and the seam flattens. Scoring generally becomes easier, until the ball is old enough that **reverse swing** may appear.`,
    howItWorks: `Under ICC playing conditions in Test cricket, the fielding captain may take a **second new ball** after a specified number of overs, commonly 80. That creates a rhythm across a long innings: new-ball threat, a middle period where the batters are more comfortable, possible reverse swing, then the second new ball resets the cycle.

In **ODIs**, current ICC conditions use **two new balls per innings**, one from each end, which means neither ball becomes old enough to reverse. In **T20**, the innings is too short for the ball to age much at all.`,
    whyItMatters: `The new-ball phase is why openers are specialists. Facing a hard, swinging, seaming ball against the fastest bowlers is a distinct skill, and a side that survives twenty overs with the openers intact has usually won the most difficult part of the innings.

For the fielding side, it is the phase where the field is most attacking: multiple slips, a gully, and few fielders saving runs.`,
    formatDifferences: `**Tests:** one new ball per innings, with a second available after a set number of overs, and reverse swing possible in between. **ODIs:** two new balls per innings under current conditions, so the ball is never very old. **T20:** the ball barely ages.`,
    misunderstandings: `**"The new ball always swings."** It swings more readily than an old one; whether it swings on a given day depends on the ball, the bowler and conditions that are less predictable than commentary implies.

**"The new ball is only about swing."** Hardness and bounce matter as much: edges carry.

**"A new ball is available on demand."** In Tests it becomes available after a set number of overs, and taking it is the captain's choice.`,
    takeaways: `- Hard, shiny, pronounced seam: swing, seam movement and carry.
- Its properties decay, and reverse swing becomes possible much later.
- Tests allow a second new ball after a set number of overs.
- ODIs use two new balls, so neither gets old.`,
    related: [
      'second-new-ball',
      'old-ball',
      'swing-bowling',
      'seam-bowling',
      'reverse-swing',
      'opener',
      'cricket-ball',
    ],
    sourceKeys: [ICC],
    order: 10,
    ruleSensitive: true,
    sourceRevision: ICC_PC,
    lastReviewedAt: REVIEWED,
  }),

  law({
    slug: 'second-new-ball',
    title: 'Second New Ball',
    category: 'red-ball-concepts',
    difficulty: 'intermediate',
    summary:
      'A fresh ball the fielding captain may take after a set number of overs in a long innings.',
    sourceRevision: `${MCC_CODE}; over threshold from ${ICC_PC}`,
    lastReviewedAt: REVIEWED,
    theLaw: `Under **Law 4**, the fielding captain may demand a new ball after a **minimum number of overs** agreed before the match. The Law sets the framework; the actual figure comes from playing conditions.

Under ICC Test playing conditions the threshold is commonly **80 overs**, after which the captain may take a new ball at any time.

It is an option, not an obligation. A captain may decline it, and frequently does.`,
    inPractice: `The decision is a real one, with arguments both ways.

**Take it** when the pitch offers bounce and carry, when the quick bowlers are fresh, or when the existing ball has gone soft and stopped doing anything. A new ball restores hardness, carry and the chance of swing.

**Decline it** when the old ball is **reversing**. A reversing old ball can be more dangerous than a new one, and taking a new ball throws that away and gives the batters an easier eighty overs while it wears in.

That trade is one of the recognisable captaincy decisions in Test cricket, and captains genuinely differ on it.`,
    edgeCasesHeading: 'Interaction with the ageing cycle',
    edgeCases: `The second new ball resets the whole ball-condition cycle, which is why its timing matters beyond the immediate overs.

Take it at 80 and the side gets new-ball conditions immediately but will not have a reversing ball again until roughly over 140. Decline it and keep reversing, and the option remains available whenever they choose.

It also interacts with **declarations** and the clock: a captain wanting a new ball for the final session may hold it back deliberately.`,
    misunderstandings: `**"The new ball is automatic at 80 overs."** It is available; taking it is a choice.

**"Eighty overs is in the Laws."** The Law requires a threshold to be agreed; 80 comes from playing conditions and has varied.

**"A new ball is always better."** A reversing old ball is often more dangerous.`,
    takeaways: `- Available to the fielding captain after a set number of overs, commonly 80 in Tests.
- An option, not an obligation.
- Declining it to keep a reversing ball is a genuine and common choice.
- Resets the ball-ageing cycle.`,
    related: [
      'new-ball',
      'old-ball',
      'reverse-swing',
      'declaration',
      'bowling-changes',
      'cricket-ball',
    ],
    sourceKeys: [{ ...MCC, locator: 'Law 4 (The ball)' }, ICC],
    order: 20,
  }),

  concept({
    slug: 'old-ball',
    title: 'Old Ball',
    category: 'red-ball-concepts',
    alsoIn: ['equipment'],
    difficulty: 'intermediate',
    summary:
      'A ball that has softened and worn, losing bounce and conventional swing but gaining the possibility of reverse swing.',
    explanation: `An old ball is one that has been in use long enough to change its properties materially: softer, less shiny, with a flattened seam and asymmetric wear between the two sides.

The consequences are mixed rather than simply worse for the bowling side.

**Lost.** Bounce and carry, so edges are less likely to reach the slips. Conventional swing, since the seam and surface no longer produce the same asymmetry. Seam movement, since a flattened seam grips less.

**Gained.** The possibility of **reverse swing**, if one side has worn rough while the other has been kept smooth and the bowler has the pace to exploit it. Also more assistance for **spin**, since a worn, rougher ball grips the surface better and the softer ball comes off the pitch more slowly.`,
    howItWorks: `The transition is why a Test innings has a shape. Overs 1 to 25 belong to the new ball; the middle period is generally the easiest batting; and from somewhere around over 40 onwards the ball may begin to reverse and the spinners come into their own.

Ball maintenance is legal and regulated. A side may **polish** the ball, **dry** it and **remove mud** under the umpires' supervision. Altering its condition by any other means is an offence under **Law 41** with match penalties, and this is precisely why reverse swing has attracted recurring controversy: the phenomenon depends on ball condition, and the line between legal maintenance and illegal alteration is a matter of enforcement.`,
    whyItMatters: `Understanding the old ball is what makes the second-new-ball decision comprehensible, and it explains why a batting side's position can be much stronger at over 60 than at over 20 and then deteriorate again at over 80.`,
    formatDifferences: `Only really applies in red-ball cricket. Current ODI conditions use two new balls per innings specifically so that neither ages far enough to reverse, and a T20 innings is too short.`,
    misunderstandings: `**"An old ball is easier to bat against."** Usually in the middle period, and not once it starts reversing.

**"Reverse swing means the ball has been tampered with."** Normal wear on an abrasive surface produces it legally.

**"Old balls do nothing for spinners."** They generally help, because a rougher ball grips more.`,
    takeaways: `- Softer, duller, flatter seam: less bounce and conventional swing.
- Gains possible reverse swing and better assistance for spin.
- Legal maintenance is polishing, drying and cleaning; anything else is an offence.
- Shapes the whole arc of a Test innings.`,
    related: [
      'new-ball',
      'second-new-ball',
      'reverse-swing',
      'spin-bowling',
      'cricket-ball',
      'pitch-deterioration',
    ],
    sourceKeys: [{ ...MCC, locator: 'Laws 4, 41 (The ball; Unfair play)' }],
    order: 30,
  }),

  tactic({
    slug: 'batting-for-a-draw',
    title: 'Batting for a Draw',
    category: 'red-ball-concepts',
    difficulty: 'intermediate',
    summary:
      'Batting to survive rather than to score, playing against the clock instead of the scoreboard.',
    explanation: `Batting for a draw means abandoning the aim of winning and batting to reach the end of the match with wickets remaining.

It only exists in multi-day cricket, and it is one of the format's genuine peculiarities: a side can lose the run-scoring contest comprehensively and still avoid defeat by occupying the crease.

The unit of account changes completely. Runs become almost irrelevant; **overs survived** and **wickets remaining** are the only numbers that matter. A batter scoring at 20 per 100 balls is doing exactly what is required.`,
    howItWorks: `What the batting side is doing:

**Minimising risk on every ball.** Leaving everything possible, playing straight, using soft hands, refusing to drive.

**Batting time rather than runs.** Sessions survived is the metric, and partnerships are valued for duration rather than size.

**Protecting the weaker batters** by farming the strike, since the tail has to survive too.

What the fielding side is doing in response:

**Attacking fields**, with close catchers, since a batter not trying to score can only be dismissed by an error or an unplayable ball.

**Bowling at the rough** and using the worn pitch.

**Applying physical pressure** with short bowling, since a batter blocking for two sessions is being asked to concentrate for hours.

**Managing the clock**, because the fielding side needs overs and slow play costs them the win.`,
    tradeoffs: `The cost is that a side batting for a draw has given up on winning, and that decision is often irreversible: once a side has spent two sessions blocking, the runs required to win are usually out of reach.

There is also a real chance that pure defence fails. A batter who does not score gives the bowlers unlimited attempts, and the historical record contains many sides who blocked for two sessions and were bowled out in the third.`,
    whenYouWillSeeIt: `The fourth and fifth days of Tests, and the final day of first-class matches, where a side facing a large deficit plays out time. It is one of the recognised set pieces of Test cricket and produces some of its most tense finishes.`,
    misunderstandings: `**"Batting for a draw is negative cricket."** It is a legitimate result available in the format, and defending for a session under a full attacking field is among the format's hardest tasks.

**"You can always bat for a draw if you try."** Sides fail at it regularly.

**"Batting for a draw means never scoring."** Scoring occasionally is necessary, both to relieve pressure and because a captain will otherwise simply set a field that concedes nothing.`,
    takeaways: `- Batting to survive to the end of the match rather than to win.
- Overs survived and wickets remaining replace runs as the metric.
- Only possible in multi-day cricket.
- Frequently attempted and frequently unsuccessful.`,
    related: [
      'draw',
      'deficit',
      'defensive-shot',
      'leaving-the-ball',
      'nightwatchman',
      'session',
      'rough',
    ],
    order: 40,
  }),

  concept({
    slug: 'rough',
    title: 'The Rough',
    category: 'red-ball-concepts',
    alsoIn: ['pitch-and-conditions', 'spin-bowling'],
    difficulty: 'intermediate',
    summary:
      'Worn, scuffed patches on the pitch created by bowlers’ footmarks, which spinners aim at for unpredictable turn.',
    explanation: `The rough is the area of the pitch broken up by bowlers' footmarks, principally where their front foot lands in the delivery stride.

Because bowlers land in roughly the same place over and over, the surface there degrades over a match into a patch of loose, scuffed, sometimes cracked earth. A ball landing in it does not behave predictably: it can grip and turn sharply, skid on, or bounce unevenly.

Its **location** is what makes it tactically important. A right-arm bowler's follow-through creates rough outside a **left-hander's off stump** and outside a **right-hander's leg stump**; a left-arm bowler's creates it outside a right-hander's off stump.

That geometry decides which bowler can use it. A left-arm orthodox spinner bowling to a right-hander turns the ball away towards the off side, and can pitch in the rough left by right-arm pace bowlers. This is one of the most productive situations in Test cricket.`,
    howItWorks: `Rough develops over days, which is why it is a red-ball phenomenon. By day four of a Test there are usually well-defined patches at both ends.

A spinner using it is accepting a trade: the ball may turn enormously, and it may also do nothing at all, because the patch is not uniform. Bowling at the rough is therefore a probabilistic tactic rather than a controlled one.

Batters respond by using their feet to get to the pitch of the ball before it lands in the rough, by playing with the turn, or by covering the line with the pad and refusing to play at balls that are turning too far.

Under the Laws, deliberately **damaging the pitch** is an offence, and umpires monitor whether bowlers' follow-throughs are creating rough beyond what is unavoidable.`,
    whyItMatters: `The rough is the main reason batting last on a five-day pitch is so difficult, and the main reason a side with a good spinner wants to bowl fourth. It is also why left-arm spinners and left-handed batters produce such distinctive match-ups.`,
    formatDifferences: `A Test and first-class phenomenon. Limited-overs matches are too short for meaningful rough to develop.`,
    misunderstandings: `**"The rough is where the ball has pitched repeatedly."** It is primarily created by bowlers' **footmarks**, not by the ball.

**"A ball in the rough always turns."** It behaves unpredictably, which is the point and also the limitation.

**"Bowlers create rough deliberately."** Deliberately damaging the pitch is an offence; the rough is a by-product of bowling.`,
    takeaways: `- Scuffed patches from bowlers' footmarks, developing over days.
- Its location determines which bowler and which batter it favours.
- Produces unpredictable rather than reliable turn.
- A major reason batting last in a Test is hardest.`,
    related: [
      'pitch-deterioration',
      'wearing-pitch',
      'orthodox-left-arm-spin',
      'off-spin',
      'second-innings',
      'spin-friendly-pitch',
    ],
    sourceKeys: [{ ...MCC, locator: 'Law 41 (Unfair play: damaging the pitch)' }],
    order: 50,
  }),

  concept({
    slug: 'wearing-pitch',
    title: 'Wearing Pitch',
    category: 'red-ball-concepts',
    alsoIn: ['pitch-and-conditions'],
    difficulty: 'intermediate',
    summary:
      'A pitch that has degraded through a match, becoming slower, less even and more helpful to spin.',
    explanation: `A wearing pitch is one whose surface has broken down over the course of a multi-day match.

The changes are cumulative and mostly in one direction:

**The surface loosens.** Grass dies, the top layer dries and crumbles, and loose material gathers.

**Cracks open.** Existing cracks widen as the surface dries, and a ball landing on the edge of a crack can behave unpredictably.

**Bounce becomes less even.** Some balls sit up, some skid low, and the batter cannot rely on a consistent height.

**Pace slows.** A worn surface generally takes pace off the ball.

**Spin increases.** A rougher, drier surface offers more grip.`,
    howItWorks: `The practical consequence is a shift in the balance of the match over five days. The first innings is played on the most predictable surface; the fourth is played on the least.

That asymmetry drives several tactical staples: winning the toss and batting on a pitch expected to wear, the value of a first-innings lead, the reluctance to enforce a follow-on if it means batting last, and the disproportionate value of a good spinner.

It is also why "the pitch is wearing" is one of the phrases that changes a match's expected result: a target of 250 on day five of a wearing pitch is not comparable to 250 on day one.`,
    whyItMatters: `It is one of the two great asymmetries of Test cricket, alongside the ageing ball, and it is the reason the format cannot be understood as four equivalent innings.`,
    formatDifferences: `Red-ball cricket only, and more pronounced the longer the match. Limited-overs matches are played on a surface that barely changes.`,
    misunderstandings: `**"All pitches wear the same way."** Rates and character vary enormously by soil, preparation and weather.

**"A wearing pitch always favours spin."** Usually, though uneven bounce can help pace bowlers too, and a pitch that simply gets slower can become easier to bat on.

**"Wear is the same as the rough."** The rough is specific patches from footmarks; wear is the general degradation of the surface.`,
    takeaways: `- General degradation of the surface over a multi-day match.
- Slower, less even, more helpful to spin.
- Makes the fourth innings the hardest, which drives toss and follow-on decisions.
- Distinct from the rough, which is footmark-specific.`,
    related: [
      'rough',
      'pitch-deterioration',
      'cracks',
      'second-innings',
      'spin-friendly-pitch',
      'follow-on-decision',
    ],
    order: 60,
  }),

  // ── Limited-overs concepts ────────────────────────────────────────────────
  definition({
    slug: 'middle-overs',
    title: 'Middle Overs',
    category: 'limited-overs-concepts',
    difficulty: 'beginner',
    summary:
      'The phase between the powerplay and the death overs, when the field is spread and scoring is hardest.',
    explanation: `The middle overs are the phase after the fielding restrictions loosen and before the final assault: roughly overs 11 to 40 in an ODI, and 7 to 15 in a T20.

Their defining characteristic is that **boundaries are hard to come by**. With four or five fielders permitted outside the circle, the gaps close, and a batting side that relied on boundaries in the powerplay has to find another method.

This is the phase where **spin** usually bowls, where **strike rotation** matters most, and where a side either builds a platform or loses its way.`,
    whyItMatters: `Most limited-overs matches are decided here rather than at the start or the end, and the reason is that the middle overs are where a side can quietly fall behind. Ten overs at four an over with no wickets lost feels stable and can leave a side needing an impossible rate later.

For the bowling side it is the containment phase: dot-ball pressure, spin bowling into the pitch, and forcing the batters to take risks against good bowling rather than allowing them easy runs.`,
    misunderstandings: `**"The middle overs are the boring part."** They are usually where the match is decided.

**"Wickets matter less here."** Wickets in hand during the middle overs are exactly what enables acceleration later.`,
    related: [
      'powerplay',
      'death-overs',
      'middle-overs-batting',
      'strike-rotation',
      'dot-ball-pressure',
      'spin-bowling',
    ],
    order: 30,
  }),

  definition({
    slug: 'death-overs',
    title: 'Death Overs',
    category: 'limited-overs-concepts',
    difficulty: 'beginner',
    summary:
      'The final overs of a limited-overs innings, when the batting side accelerates hardest and specialist bowling skills matter most.',
    explanation: `The death overs are the closing overs of a limited-overs innings: roughly the last ten in an ODI and the last five in a T20.

Both sides are doing something specialised.

**The batting side** is maximising runs with little regard for wickets, because deliveries are almost exhausted and a wicket costs less than a dot ball.

**The bowling side** is trying to deny hittable balls rather than to take wickets. That means yorkers, wide yorkers, slower balls and back-of-a-length deliveries, bowled to a field with most fielders on the boundary.`,
    whyItMatters: `The death overs are where the highest-value skills in white-ball cricket sit. A bowler who can bowl yorkers under pressure and a batter who can hit them are both scarce, and both are paid accordingly in franchise cricket.

They are also where the largest swings occur: twenty runs in an over is possible, and so is two wickets and four runs.`,
    misunderstandings: `**"Death bowling is about pace."** Accuracy and variation matter more; several of the best death bowlers rely on slower balls.

**"Batters just swing at the death."** The good ones are selecting which ball to attack and which to run, and are using shots specifically designed for yorker-length deliveries.

**"The death overs are a fixed number of overs."** It is a convention, not a defined phase in the playing conditions.`,
    related: [
      'death-bowling',
      'death-overs-batting',
      'yorker',
      'wide-yorker',
      'slower-ball',
      'finisher',
      'middle-overs',
    ],
    order: 40,
  }),

  statistic({
    slug: 'required-run-rate',
    title: 'Required Run Rate',
    category: 'limited-overs-concepts',
    alsoIn: ['scoring-and-scorecards', 'statistics-and-analytics'],
    difficulty: 'beginner',
    aliases: ['RRR', 'Required Rate'],
    summary:
      'The runs per over a chasing side needs from here to win, and the number that defines a chase.',
    measures: `How fast the chasing side must score for the remainder of the innings to reach its target.

It is a **forward-looking** number, unlike run rate, which describes what has already happened. It answers "what is needed from here", which is the only question that matters in a chase.`,
    calculation: `**Required run rate = runs still required ÷ overs remaining**

And because over notation is not decimal, the safe form is:

**Required run rate = runs still required ÷ (balls remaining ÷ 6)**

Runs still required is the **target minus the current score**, where the target is the opposition's total plus one.`,
    example: `A T20 chase. Target 181. The score is 120 for 4 after 15.2 overs.

**Runs required:** 181 − 120 = **61**.

**Balls remaining:** 120 − (15 × 6 + 2) = 120 − 92 = **28**.

**Required rate:** 61 ÷ (28 ÷ 6) = 61 ÷ 4.667 ≈ **13.07** an over.

Note that the overs figure 15.2 was converted to 92 balls first. Using 20 − 15.2 = 4.8 overs would give 12.71, which is wrong.`,
    interpret: `Read it against three other things, never alone.

**The current run rate.** A required rate below the current rate means the side is ahead.

**Wickets in hand.** A required rate of 9 with eight wickets left is comfortable; with two wickets left it is very difficult.

**Which bowlers remain.** Nine an over against a side's fifth bowler is a different proposition from nine against their best death bowler.`,
    limitations: `- **It is an average, not a plan.** A side needing 13 an over does not need 13 from every over; it needs to find boundaries somewhere, which usually means targeting specific bowlers.
- **It ignores wickets entirely**, which is its single biggest weakness as a summary of a chase.
- **It ignores who is bowling and who is batting.**
- **It says nothing about the pitch**, dew, or the size of the boundaries.`,
    formatContext: `A required rate of 8 is routine in a T20 and close to hopeless across thirty overs of an ODI. In a Test-match fourth innings the concept barely applies, since a side can bat for a draw instead of chasing.`,
    misunderstandings: `**"Divide by the overs remaining figure shown."** Convert to balls first. Over notation is not decimal.

**"The required rate tells you who is winning."** Not without wickets in hand.

**"Runs required is the target minus the score."** Yes, where the target is the opposition's score plus one. Using their score alone leaves a side one short, which has decided real matches.`,
    takeaways: `- Runs still required ÷ (balls remaining ÷ 6).
- Forward-looking, unlike run rate.
- Meaningless without wickets in hand and the bowlers remaining.
- Convert overs to balls before calculating.`,
    related: ['run-rate', 'target', 'chase', 'par-score', 'overs-notation', 'batting-tempo'],
    order: 50,
  }),

  statistic({
    slug: 'net-run-rate',
    title: 'Net Run Rate',
    category: 'limited-overs-concepts',
    alsoIn: ['statistics-and-analytics'],
    difficulty: 'intermediate',
    aliases: ['NRR'],
    summary:
      'A tournament tie-breaker: a team’s run rate scored minus the run rate conceded, across a competition.',
    measures: `A side's scoring rate relative to the rate they concede, aggregated across a tournament. It is used as a **tie-breaker** to separate teams level on points.

It is a tournament administration statistic rather than a measure of cricket quality, and it is worth being clear about that: NRR rewards winning by large margins, which is not the same thing as being the better side.`,
    calculation: `**NRR = (total runs scored ÷ total overs faced) − (total runs conceded ÷ total overs bowled)**

Two details do most of the work, and both are set by the competition's playing conditions rather than being universal:

**A side bowled out is treated as having faced its full quota of overs**, not the overs it actually used. So a team bowled out for 100 in 25 overs of a 50-over match is treated as 100 from 50, which is far worse for their NRR than 100 from 25 would be.

**Matches with no result are usually excluded** entirely.

Because the treatment of these cases varies by competition, and has changed, NRR calculations from different tournaments are not always directly comparable.`,
    example: `A side plays two 50-over matches.

**Match 1:** they score 300 from 50 overs; the opposition make 250 from 50.
**Match 2:** they score 200 from 40 overs chasing 199 and win; the opposition made 199 from 50.

**Runs scored:** 500. **Overs faced:** 50 + 40 = 90. Rate = 5.56.
**Runs conceded:** 449. **Overs bowled:** 100. Rate = 4.49.

**NRR** = 5.56 − 4.49 = **+1.07**.

Note that chasing quickly in match 2 helped their NRR, which is why sides in tournaments sometimes chase faster than the situation requires.`,
    interpret: `A positive NRR means a side has generally outscored its opponents per over; a negative one the reverse. The magnitude is not very meaningful in itself, and small differences decide qualification.

Its practical effect is on **behaviour**: sides in tournaments chase faster than necessary, and bat on when a declaration would otherwise be sensible, because NRR may decide qualification.`,
    limitations: `- **It is not a quality measure.** A side that wins five close matches can have a worse NRR than one that wins three by large margins.
- **The bowled-out rule distorts it heavily.** One heavy defeat where a side is bowled out cheaply can be very hard to recover from.
- **It ignores wickets and context entirely.**
- **The rules vary by competition** and have been revised, so cross-tournament comparison is unsafe.
- **Alternative tie-breakers exist**, and some competitions use points, head-to-head records or other methods instead.`,
    formatContext: `Used in limited-overs tournaments. Not applicable to Test cricket, where series are decided on matches won and drawn.`,
    misunderstandings: `**"NRR measures how good a team is."** It measures margin of victory per over, which is different.

**"A side bowled out in 25 overs gets credit for the overs it used."** Under the usual conditions it is treated as having used its full quota.

**"NRR is calculated the same way everywhere."** The handling of bowled-out sides, no results and DLS-affected matches is competition-specific.`,
    takeaways: `- Run rate scored minus run rate conceded across a tournament.
- A tie-breaker, not a quality measure.
- Being bowled out counts as facing the full quota, which distorts it heavily.
- The exact rules are competition-specific.`,
    related: ['run-rate', 'required-run-rate', 'no-result', 'dls-method', 'limited-overs-cricket'],
    sourceKeys: [ICC],
    order: 60,
    ruleSensitive: true,
    sourceRevision: ICC_PC,
    lastReviewedAt: REVIEWED,
  }),

  statistic({
    slug: 'par-score',
    title: 'Par Score',
    category: 'limited-overs-concepts',
    difficulty: 'intermediate',
    summary:
      'The score a chasing side needs to be level at a given point, used to judge a rain-affected match.',
    measures: `Where a chasing side stands relative to a level position at a specific moment in the innings, given the overs used and the wickets lost.

It exists primarily because of rain. If a match is abandoned mid-chase, somebody has to decide who was winning, and the par score is that decision.`,
    calculation: `Par comes from the **DLS** resource tables, not from a formula that can be computed by hand.

The principle is that a chasing side's position depends on both the **overs used** and the **wickets lost**, so par at 25 overs is different for a side four down than for a side one down. That two-dimensional dependence is why simple run-rate arithmetic cannot produce it.

The values used in international cricket come from the licensed DLS software, and the underlying Professional Edition resource figures are **not public**. Any par score quoted in an international match came from that software.

**The critical arithmetic point:** par is the **level-scores** figure. A side exactly on par at the moment of abandonment has **tied**. To win they need par **plus one**.`,
    example: `An ODI chase, target 280 from 50 overs. Rain arrives with the chasing side 176 for 5 after 32 overs, and the match is abandoned.

The scoreboard has been showing a DLS par score throughout. Suppose par at 32 overs with 5 wickets down is **171**.

The chasing side are 176, which is **5 runs ahead of par**, so they win by 5 runs on DLS.

Had they been exactly 171, the match would be a **tie**. Had they been 170, they would have lost by 1.`,
    interpret: `Read par as "where level is". Ahead of par means winning if the match stops now; behind par means losing.

It also functions as a live target during a rain-threatened chase: a side that knows rain is coming bats to get ahead of par rather than to win the match outright, which is a genuine and visible tactical shift.`,
    limitations: `- **It is a snapshot, not a prediction.** Being ahead of par does not mean a side will win if play continues.
- **It depends on wickets**, so a side ahead of par with nine down is in a much weaker real position than the number suggests.
- **It cannot be reproduced by hand** for international matches, since the resource values are proprietary.
- **The method is revised periodically**, so historical par scores were calculated under earlier editions.`,
    formatContext: `Limited-overs cricket only, and only where DLS applies. Competitions specify minimum overs before DLS can produce a result at all.`,
    misunderstandings: `**"Reaching par wins the match."** Par ties it. Par plus one wins.

**"Par is just the required run rate applied backwards."** It depends on wickets as well as overs, which run-rate arithmetic ignores entirely.

**"You can calculate par from published tables."** Standard Edition tables exist for lower-level cricket; the Professional Edition values used internationally are not public.`,
    takeaways: `- The level-scores figure at a given point, from the DLS tables.
- Depends on both overs used and wickets lost.
- Exactly par is a tie; par plus one wins.
- Not reproducible by hand for international matches.`,
    related: ['dls-method', 'target', 'chase', 'required-run-rate', 'no-result', 'tie'],
    sourceKeys: [{ key: 'wp-dls' }, ICC],
    order: 70,
    ruleSensitive: true,
    sourceRevision: ICC_PC,
    lastReviewedAt: REVIEWED,
  }),

  tactic({
    slug: 'batting-deep',
    title: 'Batting Deep',
    category: 'limited-overs-concepts',
    difficulty: 'intermediate',
    summary:
      'Selecting a side whose lower order can bat, so wickets are less constraining and the batting can take more risk.',
    explanation: `A side "bats deep" when its batting extends a long way down the order: batters at 8 and 9 who can genuinely score rather than merely survive.

The value is not the runs those batters make directly. It is that batting depth **changes what the top order can do**. If a side knows that losing five wickets still leaves capable batters, the top order can attack from the start, because the downside of a collapse is smaller.

It is one of the clearest cases in cricket where selection changes tactics rather than just quality.`,
    howItWorks: `The mechanism is risk transfer. A T20 side with batting to number 9 can afford to lose three wickets in the powerplay while attacking; a side whose batting ends at 6 cannot, and must consolidate instead.

The cost is usually bowling. Picking an extra batter or batting all-rounder means one fewer specialist bowler, or a fifth bowler who is not as good, and in limited-overs cricket that can cost more runs than the extra batting depth gains.

That trade-off is one of the standing arguments in limited-overs selection, and different sides resolve it differently in the same conditions.`,
    tradeoffs: `**Gained:** licence for the top order to attack; insurance against collapse; the ability to chase larger totals.

**Lost:** bowling quality or a bowling option; and if the top order fires regularly, the extra batting is never used at all, which makes it a wasted place.

The balance shifts with format. In T20 the deep-batting argument is stronger, because there are only twenty overs to bowl and a fifth bowler's four overs are less exposed. In ODI cricket, fifty overs of bowling makes a weak fifth bowler expensive.`,
    whenYouWillSeeIt: `Frequently discussed in T20 selection, and visible in how a side bats in the powerplay: sides that attack hardest early are usually the ones who bat deepest.`,
    misunderstandings: `**"Batting deep means the tail scores runs."** Its main value is enabling the top order's aggression.

**"Deeper batting is always better."** It costs bowling, and an unused extra batter is a wasted selection.`,
    takeaways: `- Capable batting extending to 8 and 9.
- Its main value is licensing top-order aggression.
- Costs bowling quality or an option.
- The trade is format-dependent and genuinely contested.`,
    related: [
      'all-rounder',
      'lower-order-batter',
      'finisher',
      'powerplay-batting',
      'risk-management-batting',
      'chase',
    ],
    order: 80,
  }),

  law({
    slug: 'super-over',
    title: 'Super Over',
    category: 'limited-overs-concepts',
    difficulty: 'intermediate',
    summary:
      'A one-over-per-side tie-breaker used in limited-overs cricket, and a playing condition rather than a Law.',
    sourceRevision: ICC_PC,
    lastReviewedAt: REVIEWED,
    theLaw: `The Super Over is **not in the Laws of Cricket**. It is a **playing condition**, adopted by the ICC and by most competitions to resolve tied limited-overs matches where a result is required.

The general shape, under current ICC playing conditions:

- Each side bats **one over**, six legal deliveries.
- The side that batted second in the match bats first in the Super Over.
- Each side nominates **three batters** and **one bowler**.
- Losing **two wickets** ends a side's Super Over.
- The side scoring more runs wins.
- If the Super Over is itself tied, further Super Overs are played until there is a winner.

That last provision is a revision. An earlier version of the conditions resolved a tied Super Over by **boundary count**, which was used to decide a World Cup final and was subsequently changed after considerable criticism. Anything written about Super Over tie-breaking therefore belongs to a specific era of the playing conditions.`,
    inPractice: `Tactically it is a compressed and unusual contest. A side has six balls, two wickets to spend and its three best hitters; the bowling side has one bowler, who must be their best available option for six deliveries under maximum pressure.

Fielding restrictions, DLS applicability and other details are set by the competition's conditions, and they differ.`,
    edgeCasesHeading: 'Where it applies, and where a tie just stands',
    edgeCases: `Super Overs are used where a **result is required**: knockout matches, finals, and in some competitions all matches.

In league matches under many conditions, a tie simply **stands as a tie** and the points are shared. So a tied match does not automatically mean a Super Over, and whether one is played is a competition question.

Test cricket has no equivalent: a tied Test stands as a tie.`,
    misunderstandings: `**"The Super Over is part of the Laws."** It is a playing condition.

**"Every tied match goes to a Super Over."** Only where the conditions require a result.

**"A tied Super Over is decided on boundaries."** That was a previous version of the ICC conditions and was changed; current conditions provide for repeated Super Overs.`,
    takeaways: `- One over each, three batters, one bowler, two wickets.
- A playing condition, not a Law, and competition-specific.
- Used where a result is required; elsewhere a tie stands.
- The boundary-count tie-break was removed after 2019.`,
    related: [
      'tie',
      'limited-overs-cricket',
      't20i',
      'odi',
      'death-bowling',
      'death-overs-batting',
    ],
    sourceKeys: [ICC],
    order: 90,
  }),
];
