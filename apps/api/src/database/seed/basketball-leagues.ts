import { definition, format, rule } from './basketball-explainer-helpers';
import type { ExplainerSeed } from './explainer-types';

/**
 * League machinery: the NBA's season and roster rules, and the rest of the
 * basketball world.
 *
 * The two halves belong together because they answer the same question from
 * opposite ends. A reader who has learned how the NBA works has learned one
 * league's arrangements, not the sport's, and almost every mechanism here has
 * no equivalent in Europe: no draft, no salary cap, no trades for matched
 * salary, no conferences, and promotion and relegation instead of a lottery.
 *
 * That contrast is stated repeatedly and deliberately. It is the single easiest
 * thing for a basketball site to get wrong.
 *
 * ## On numbers that move
 *
 * No dollar figures appear anywhere in the salary-cap entries. Every threshold
 * is reset annually under the collective bargaining agreement, and a number
 * written into prose is wrong within a year with nothing to flag it. Mechanisms
 * are explained; current values belong in data with an as-of date.
 */

const CBA = {
  ruleSensitive: true,
  sourceRevision: 'NBA CBA 2023',
  lastReviewedAt: '2026-08-26',
  sourceKeys: [{ key: 'nba-cba' }],
};

const NBA_SRC = [{ key: 'wp-nba' }];

export const BASKETBALL_LEAGUES: ExplainerSeed[] = [
  // ══ NBA: season and structure ══════════════════════════════════════════════
  format({
    slug: 'how-the-nba-works',
    title: 'How the NBA Works',
    category: 'nba-explained',
    aliases: ['how the nba works', 'nba explained', 'nba structure'],
    summary:
      'Thirty teams, two conferences, an 82-game season and a playoff bracket, inside a closed league.',
    order: 2300,
    sourceKeys: NBA_SRC,
    howItWorks: `Thirty franchises, split into an Eastern and a Western Conference of fifteen each. Every team plays 82 regular-season games between October and April.

The regular season decides playoff qualification and seeding. Eight teams from each conference reach the playoffs, six directly and two through the **play-in tournament**. Four rounds of best-of-seven series follow, ending in the NBA Finals.

Roster building is governed by three mechanisms that European basketball does not have: the **draft**, which allocates new players in reverse order of standing; the **salary cap**, which limits spending; and **trades**, which must broadly match salaries.`,
    whyItMatters: `The defining structural fact is that the NBA is a **closed league**. There is no promotion or relegation: the same thirty franchises compete every year regardless of results.

That single fact explains most of the rest. Because a bad team cannot be relegated, something else must stop it staying bad forever, and the draft, the lottery and the salary cap are all mechanisms for redistributing talent toward weaker teams. A European league does not need them because failure is punished by relegation instead.

It also explains **tanking**: in a closed league, losing has a reward attached, which is a problem the lottery exists to blunt.`,
    ruleDifferences: `**European basketball is open.** Clubs are promoted and relegated on results, there is no draft and no league-wide salary cap, and clubs play domestic and continental competitions simultaneously rather than in one unified season.`,
    related: [
      'nba-regular-season',
      'nba-playoffs',
      'nba-draft',
      'salary-cap',
      'how-european-basketball-works',
    ],
  }),

  format({
    slug: 'nba-conferences',
    title: 'Eastern & Western Conferences',
    category: 'nba-explained',
    aliases: ['conferences', 'eastern conference', 'western conference', 'east west'],
    summary: 'The league’s two halves, which teams stay inside until the Finals.',
    order: 2310,
    sourceKeys: NBA_SRC,
    howItWorks: `Fifteen teams in each conference, divided roughly by geography, and each conference further split into three divisions.

Teams play more games against opponents in their own conference than outside it, which reduces travel across a continent-wide league.

Playoff seeding is done **within** each conference, and teams cannot meet a team from the other conference until the Finals.`,
    whyItMatters: `Conference strength is rarely equal, and that has consequences the standings hide. When one conference is stronger, a team with a better record there can face a harder route than a weaker team in the other conference, and the two best teams in the league may have to eliminate each other before the Finals.

Divisions, by contrast, now matter very little: they affect the schedule but no longer guarantee playoff seeding.`,
    misunderstandings: `**"The two best teams meet in the Finals."** Only if they are in different conferences.

**"Winning your division matters."** It affects the schedule and little else in the modern format.`,
    related: ['nba-regular-season', 'nba-standings', 'seeding', 'nba-playoffs'],
  }),

  format({
    slug: 'nba-standings',
    title: 'NBA Standings',
    category: 'nba-explained',
    aliases: ['standings', 'nba standings', 'games behind', 'win percentage'],
    summary: 'The table, ordered by win percentage, that decides playoff places and seeding.',
    order: 2320,
    sourceKeys: NBA_SRC,
    howItWorks: `Teams are ranked by **win percentage** within their conference. Since every team plays 82 games, this is effectively the win-loss record.

There are no draws and no points system: a win is a win regardless of margin.

**Games behind** expresses the gap to the leader, counting each win and each loss as half a game. Ties are broken by head-to-head record, then division and conference records, and other criteria.`,
    whyItMatters: `The standings decide two things that matter more than the ranking itself: whether a team makes the playoffs at all, and its **seeding**, which determines its opponent and whether it holds home-court advantage.

A single place in the standings can be worth a great deal, which is why teams compete hard in April even when qualification is already settled.`,
    misunderstandings: `**"Point difference is a tie-breaker."** It is not, unlike in most football leagues. Head-to-head record and other criteria are used instead.

**"The best record gets an easier route."** It gets a lower-seeded first opponent and home-court advantage, but conference imbalance can still produce a harder path.`,
    related: ['nba-regular-season', 'seeding', 'home-court-advantage', 'nba-play-in-tournament'],
  }),

  format({
    slug: 'nba-play-in-tournament',
    title: 'NBA Play-In Tournament',
    category: 'nba-explained',
    difficulty: 'intermediate',
    aliases: ['play in', 'play-in', 'play in tournament', 'playin'],
    summary: 'A short knockout deciding the last two playoff places in each conference.',
    order: 2330,
    sourceKeys: NBA_SRC,
    howItWorks: `Teams seeded seventh to tenth in each conference compete for the final two playoff places.

The seventh and eighth seeds play each other, with the winner taking the seventh seed outright. The ninth and tenth play, with the loser eliminated. The loser of the first game then plays the winner of the second for the eighth seed.

The result is that the seventh seed gets two chances to qualify and the tenth gets none to spare.`,
    whyItMatters: `It was introduced to address a specific problem: teams out of realistic playoff contention had an incentive to lose, because a worse record improves draft position.

By keeping the ninth and tenth places competitive, the play-in gives several more teams something to play for late in the season, which shortens the window in which **tanking** is rational.

The asymmetry is deliberate: finishing seventh rather than ninth is worth a great deal, so the reward for a marginally better regular season is real.`,
    misunderstandings: `**"The play-in is part of the playoffs."** It is a separate qualifying round. Results do not count as playoff games.`,
    related: ['nba-playoffs', 'seeding', 'nba-standings', 'draft-lottery'],
  }),

  format({
    slug: 'nba-finals',
    title: 'NBA Finals',
    category: 'nba-explained',
    aliases: ['nba finals', 'the finals', 'championship series'],
    summary: 'The best-of-seven series between the two conference champions.',
    order: 2340,
    sourceKeys: [{ key: 'wp-nba-playoffs' }],
    howItWorks: `The Eastern and Western Conference champions meet in a best-of-seven series. The first to four wins is champion.

Home-court advantage goes to the team with the better regular-season record, and games alternate in a 2-2-1-1-1 pattern.

Individual recognition goes to the Finals Most Valuable Player, awarded to the outstanding player of the series.`,
    whyItMatters: `It is the most-watched basketball series in the world and the point at which the sport reaches its largest global audience.

The best-of-seven format also means Finals are rarely fluky. Over seven games, tactical adjustment matters more than a single hot shooting night, which is why Finals series are often decided by which coaching staff adapts better rather than by one performance.`,
    related: ['nba-playoffs', 'home-court-advantage', 'nba-regular-season'],
  }),

  format({
    slug: 'seeding',
    title: 'Seeding',
    category: 'nba-explained',
    difficulty: 'intermediate',
    aliases: ['seeding', 'seed', 'seeds', 'playoff seeding'],
    summary: 'The ranking that decides who plays whom in a knockout bracket, and who hosts.',
    order: 2350,
    sourceKeys: NBA_SRC,
    howItWorks: `Qualified teams are ranked 1 to 8 within each conference by regular-season record. The bracket then pairs 1 v 8, 2 v 7, 3 v 6 and 4 v 5.

The higher seed holds **home-court advantage**, hosting four of the seven games including the seventh.

In the NCAA tournament, seeding works similarly but across four regions with sixteen seeds each.`,
    whyItMatters: `Seeding is what a long regular season is actually deciding. The gap between the third and fourth seed can mean a materially different opponent and losing home-court advantage in a deciding game.

It is also why teams that have already qualified keep competing: the difference between seeds is worth more than the difference between qualifying and not, in terms of how far a team is likely to go.`,
    related: ['nba-standings', 'nba-playoffs', 'home-court-advantage', 'march-madness'],
  }),

  format({
    slug: 'home-court-advantage',
    title: 'Home-Court Advantage',
    category: 'nba-explained',
    aliases: ['home court advantage', 'home court', 'home advantage', 'game 7 at home'],
    summary: 'Hosting the deciding game of a series, awarded to the team with the better record.',
    order: 2360,
    sourceKeys: NBA_SRC,
    howItWorks: `In a best-of-seven series the team with the better regular-season record hosts games one, two, five and seven, in a 2-2-1-1-1 pattern.

The decisive detail is **game seven**. If a series goes the distance, the deciding game is played at the higher seed's arena.`,
    whyItMatters: `Home teams win more often than away teams across basketball, from crowd effect, familiarity and the absence of travel, though the size of the advantage has declined over the decades as travel has become easier.

Its value is concentrated almost entirely in game seven. A team can lose home-court advantage by dropping game one and reclaim it by winning away, which is why "stealing" an away game early is treated as the pivotal moment of many series.`,
    related: ['seeding', 'nba-playoffs', 'nba-finals', 'nba-standings'],
  }),

  format({
    slug: 'nba-cup',
    title: 'NBA Cup',
    subtitle: 'The In-Season Tournament',
    category: 'nba-explained',
    difficulty: 'intermediate',
    aliases: ['nba cup', 'in season tournament', 'in-season tournament'],
    summary: 'A knockout competition played inside the regular season.',
    order: 2370,
    sourceKeys: NBA_SRC,
    howItWorks: `Teams are drawn into groups and play group-stage games that **also count as regular-season fixtures**. Group winners and wildcards advance to a knockout stage, ending in a final at a neutral venue.

Only the final does not count toward regular-season records, which is why teams reaching it play 83 games.`,
    whyItMatters: `It was introduced to give the middle of a very long season some competitive meaning. In an 82-game schedule, a game in December is easy for players and spectators to treat as unimportant.

The design borrows openly from European football's domestic cups, which is unusual for a North American league and an interesting case of the NBA importing a structure from an open-league system.`,
    ruleDifferences: `Cup competitions running alongside a league season are standard in European basketball, where clubs routinely play a domestic league, a domestic cup and a continental competition at once.`,
    related: ['nba-regular-season', 'how-european-basketball-works', 'how-the-nba-works'],
  }),

  format({
    slug: 'all-star-weekend',
    title: 'All-Star Weekend',
    category: 'nba-explained',
    aliases: ['all star', 'all-star weekend', 'all star game', 'dunk contest'],
    summary: 'A mid-season exhibition weekend of contests and a selection match.',
    order: 2380,
    sourceKeys: NBA_SRC,
    howItWorks: `A break in the middle of the season featuring an exhibition game between selected players, alongside the **Slam Dunk Contest**, the **Three-Point Contest**, the Skills Challenge and the Rising Stars game for younger players.

Selection combines fan voting with votes from players and media, and the format of the game itself has been changed repeatedly.`,
    whyItMatters: `Being named an All-Star is a recognised career marker, cited in awards debates and written into contract bonuses, so the selection carries real weight even though the game does not.

The game itself is an exhibition with minimal defence, and the league has changed its format several times attempting to make it competitive. The surrounding contests, particularly the dunk contest, are for many viewers the more memorable part.`,
    related: ['dunk', 'sixth-man', 'nba-regular-season'],
  }),

  // ══ NBA: draft ═════════════════════════════════════════════════════════════
  format({
    ...CBA,
    slug: 'draft-lottery',
    title: 'Draft Lottery',
    category: 'nba-explained',
    difficulty: 'intermediate',
    aliases: ['draft lottery', 'lottery', 'ping pong balls'],
    summary: 'A weighted random draw deciding the top draft picks among non-playoff teams.',
    order: 2390,
    sourceKeys: [{ key: 'wp-nba-draft' }, { key: 'nba-cba' }],
    howItWorks: `The teams that missed the playoffs enter a weighted draw for the first four picks. Worse records get better odds, but not certainty.

The three worst teams share **identical** odds at the first pick, which is the design decision that matters most. Positions five to fourteen are then filled in reverse order of record.

A team can hold the worst record and still fall to fifth, which happens regularly.`,
    whyItMatters: `The lottery exists to make **tanking** unprofitable. If the worst record guaranteed the best player, the rational strategy for a struggling team would be to lose as many games as possible.

The odds have been deliberately flattened over the years so that the reward for being worst is smaller and less certain. Combined with the play-in tournament at the other end, the league has squeezed the range of positions where losing on purpose pays.

It has not eliminated tanking, but it has made it a much worse bet.`,
    ruleDifferences: `**European basketball has no lottery**, because it has no draft. A club that performs badly is relegated rather than rewarded, which addresses the same problem from the opposite direction.`,
    related: ['nba-draft', 'lottery-pick', 'nba-play-in-tournament', 'how-the-nba-works'],
  }),

  definition({
    ...CBA,
    slug: 'draft-pick',
    title: 'Draft Pick',
    category: 'nba-explained',
    aliases: ['draft pick', 'pick', 'first rounder', 'second rounder'],
    summary:
      'The right to select a player at a given position, and a tradeable asset in its own right.',
    order: 2400,
    explanation: `A pick is a team's turn to select in the draft. There are two rounds, so sixty picks in total, and each is identified by year and round: "a 2029 first-rounder".

Crucially, picks can be **traded**, years in advance, which turns them into currency rather than merely an entitlement.

**First-round** picks come with guaranteed contracts on a fixed rookie scale. **Second-round** picks do not, and many second-round selections never play in the league.`,
    whyItMatters: `The rookie scale is what makes first-round picks so valuable. A player selected there is paid according to a fixed schedule well below what an equivalent free agent would command, so a team that drafts well gets several years of production at a discount. That gap is the single largest advantage available in NBA roster building.

It is also why picks dominate trade negotiations. Acquiring an established star typically costs several future first-round picks, and a team that has traded too many can find itself unable to improve for years.`,
    ruleDifferences: `No equivalent exists in European basketball. Clubs develop players through their own academies and sign them directly, so there is nothing to trade.`,
    related: ['nba-draft', 'lottery-pick', 'protected-pick', 'pick-swap', 'nba-trades'],
  }),

  definition({
    ...CBA,
    slug: 'lottery-pick',
    title: 'Lottery Pick',
    category: 'nba-explained',
    difficulty: 'intermediate',
    aliases: ['lottery pick', 'lottery selection', 'top 14 pick'],
    summary: 'One of the first fourteen picks, belonging to teams that missed the playoffs.',
    order: 2410,
    explanation: `The fourteen picks allocated among non-playoff teams, of which the first four are decided by the lottery draw and the rest by reverse order of record.

Being described as a "lottery pick" is shorthand for a highly regarded prospect, since these are the selections most likely to produce a significant player.`,
    whyItMatters: `The distinction matters chiefly in trades. A pick that is likely to fall in the lottery is worth far more than a late first-rounder, and much of the complexity in **protected picks** exists to divide that risk between two teams.`,
    related: ['draft-lottery', 'draft-pick', 'protected-pick', 'nba-draft'],
  }),

  definition({
    ...CBA,
    slug: 'protected-pick',
    title: 'Protected Pick',
    category: 'nba-explained',
    difficulty: 'advanced',
    aliases: ['protected pick', 'protections', 'top 5 protected', 'lottery protected'],
    summary: 'A traded draft pick that only transfers if it falls outside an agreed range.',
    order: 2420,
    explanation: `When a pick is traded, the trading team often attaches **protection**: a condition under which they keep it after all.

"Top-five protected" means the pick transfers only if it lands sixth or later. If it lands in the top five, the original team keeps it, and the obligation usually rolls over to a later year or converts into second-round picks.

Protections can be layered across several years, with the protected range narrowing each time.`,
    whyItMatters: `Protection is how the two sides split risk. A team trading a future pick does not know whether it will be a late selection or, if the season goes badly, a valuable lottery pick. Protection caps that downside.

The consequence is that pick obligations can persist for years and are genuinely difficult to track, which is why front offices maintain detailed ledgers of what they owe and to whom.`,
    related: ['draft-pick', 'pick-swap', 'nba-trades', 'lottery-pick'],
  }),

  definition({
    ...CBA,
    slug: 'pick-swap',
    title: 'Pick Swap',
    category: 'nba-explained',
    difficulty: 'advanced',
    aliases: ['pick swap', 'swap rights', 'right to swap'],
    summary: 'The right to exchange draft positions with another team if theirs turns out better.',
    order: 2430,
    explanation: `Rather than transferring a pick outright, a team acquires the **right to swap**: if the other team's pick lands higher, the two are exchanged. If not, nothing happens.

It is an option rather than an obligation, always exercised in the holder's favour.`,
    whyItMatters: `A swap is a cheaper way of acquiring draft value than a pick outright, and a cheaper concession for the team giving it up, because the cost depends on how badly they perform.

For a team confident it will be good, granting a swap looks harmless. If that confidence proves misplaced, a swap can become one of the most damaging obligations on the books, since it strips value exactly when the team most needs it.`,
    related: ['draft-pick', 'protected-pick', 'nba-trades'],
  }),

  definition({
    ...CBA,
    slug: 'undrafted-player',
    title: 'Undrafted Player',
    category: 'nba-explained',
    difficulty: 'intermediate',
    aliases: ['undrafted', 'undrafted free agent', 'udfa'],
    summary: 'A player not selected in either round, who may then sign with any team.',
    order: 2440,
    explanation: `With only sixty picks available and far more eligible players, most go undrafted. They become free to negotiate with any team, typically on a non-guaranteed deal or a **two-way contract**.`,
    whyItMatters: `Going undrafted is not the end of a career, and a meaningful number of undrafted players have gone on to long and successful ones.

It reflects the limits of scouting rather than any hard boundary of ability: sixty selections cannot capture every player worth having, and teams routinely misjudge prospects.

For a team, undrafted signings are among the cheapest possible additions, which is why development programmes are built around them.`,
    related: ['nba-draft', 'draft-pick', 'two-way-contract', 'free-agency'],
  }),

  // ══ NBA: transactions ══════════════════════════════════════════════════════
  format({
    ...CBA,
    slug: 'trade-deadline',
    title: 'Trade Deadline',
    category: 'nba-explained',
    difficulty: 'intermediate',
    aliases: ['trade deadline', 'deadline', 'deadline day'],
    summary: 'The date after which no trades may be made for the rest of the season.',
    order: 2450,
    howItWorks: `A fixed date roughly two-thirds through the regular season. After it passes, rosters are frozen for trades until the offseason.

A team may still sign players released elsewhere, which is why the **buyout** market matters immediately afterwards.`,
    whyItMatters: `The deadline forces every team to decide publicly what its season is: contending teams add players, and teams out of contention trade established players for picks and young prospects.

That decision is genuinely difficult for teams in the middle, and the deadline removes the option of deferring it.

It also has a financial dimension: teams near the luxury tax threshold often trade purely to reduce salary before the calculation date.`,
    ruleDifferences: `European clubs work to transfer windows rather than a single deadline, and can generally sign free agents outside them under different conditions. The NBA's hard freeze is stricter than most European arrangements.`,
    related: ['nba-trades', 'buyout', 'luxury-tax', 'free-agency'],
  }),

  definition({
    ...CBA,
    slug: 'restricted-free-agent',
    title: 'Restricted Free Agent',
    category: 'nba-explained',
    difficulty: 'advanced',
    aliases: ['restricted free agent', 'rfa', 'restricted', 'offer sheet'],
    summary: 'A free agent whose existing club can match any offer and keep them.',
    order: 2460,
    explanation: `The player may negotiate with other teams and sign an **offer sheet**, but their current club has the right to **match** it within a set period and retain them on identical terms.

Players are typically restricted at the end of their rookie contract, provided the club has made a qualifying offer.`,
    whyItMatters: `In practice the matching right hands the incumbent club most of the power. Rival teams are reluctant to negotiate seriously when the offer may simply be matched, and while an offer sheet is pending their own cap space is tied up.

The result is that restricted free agency usually ends with the player staying, often on terms the club is comfortable with. It is one of several rules designed to help teams keep the players they developed.`,
    ruleDifferences: `No European equivalent. A player out of contract in Europe is simply free, and clubs protect themselves with contract length and buyout clauses instead.`,
    related: ['free-agency', 'unrestricted-free-agent', 'bird-rights', 'sign-and-trade'],
  }),

  definition({
    ...CBA,
    slug: 'unrestricted-free-agent',
    title: 'Unrestricted Free Agent',
    category: 'nba-explained',
    difficulty: 'advanced',
    aliases: ['unrestricted free agent', 'ufa', 'unrestricted'],
    summary: 'A free agent who may sign with any team, with no matching rights held against them.',
    order: 2470,
    explanation: `The player's contract has expired and their former club retains no special rights. They may sign wherever they choose, subject only to the signing team having cap space or an exception.

Players generally become unrestricted after enough seasons in the league, or when a club declines to make a qualifying offer to a restricted free agent.`,
    whyItMatters: `This is the only point at which a player has genuine freedom of movement, which is why unrestricted free agency generates so much attention relative to the number of players involved.

Even here the rules favour continuity: **Bird rights** let the incumbent club exceed the salary cap to re-sign them and offer more years and larger raises than anyone else can. A star leaving as an unrestricted free agent is usually accepting less money to do so.`,
    related: ['free-agency', 'restricted-free-agent', 'bird-rights', 'salary-cap'],
  }),

  definition({
    ...CBA,
    slug: 'sign-and-trade',
    title: 'Sign-and-Trade',
    category: 'nba-explained',
    difficulty: 'advanced',
    aliases: ['sign and trade', 'sign-and-trade', 's&t'],
    summary:
      'A player re-signs with their club and is immediately traded to the team they wanted to join.',
    order: 2480,
    explanation: `Rather than signing directly with a new team, the free agent re-signs with their existing club, which then trades them.

The manoeuvre exists because of **Bird rights**: the incumbent club can exceed the cap to sign them, so the player can receive a larger contract than the destination team could have offered directly. The original club, which would otherwise have lost them for nothing, receives assets in return.`,
    whyItMatters: `It converts a departure into a transaction, which suits everyone. The player gets more money, the new team acquires someone it could not have afforded outright, and the club losing them gets something rather than nothing.

Recent agreements have attached restrictions to sign-and-trades, particularly for teams above the apron thresholds, so the tool is less freely available than it once was.`,
    related: ['free-agency', 'bird-rights', 'nba-trades', 'salary-aprons'],
  }),

  definition({
    ...CBA,
    slug: 'waivers',
    title: 'Waivers',
    category: 'nba-explained',
    difficulty: 'advanced',
    aliases: ['waivers', 'waived', 'waiver wire', 'released'],
    summary:
      'The process by which a released player is offered to other teams before becoming free.',
    order: 2490,
    explanation: `When a team releases a player, they are placed on waivers for a short period. During it, any other team may **claim** them and take on the remainder of their contract in full.

If more than one team claims, the one with the worse record has priority. If nobody claims, the player clears waivers and becomes a free agent able to sign anywhere.

The releasing team generally remains liable for guaranteed money the player was owed, which is why claims are uncommon for expensive contracts.`,
    whyItMatters: `The claiming order gives weaker teams first refusal on released players, which is another of the league's redistribution mechanisms.

In practice most notable players clear waivers, because their remaining salary is more than another team wants to absorb. They then sign elsewhere cheaply, which is the **buyout** market.`,
    related: ['buyout', 'trade-deadline', 'free-agency', 'two-way-contract'],
  }),

  definition({
    ...CBA,
    slug: 'buyout',
    title: 'Buyout',
    category: 'nba-explained',
    difficulty: 'advanced',
    aliases: ['buyout', 'bought out', 'buyout market', 'contract buyout'],
    summary:
      'A negotiated early termination in which the player gives up some salary for freedom to leave.',
    order: 2500,
    explanation: `A player and club agree to end the contract early. The player typically forfeits a portion of the money owed, and the club releases them via waivers.

The buyout market usually follows the trade deadline, when teams out of contention release veterans who then sign with contenders for the run-in.`,
    whyItMatters: `It suits both sides. A club rebuilding gains nothing from an unhappy veteran, and the player would rather compete than sit.

It is also contentious, because it lets the strongest teams add experienced players without giving up assets. Recent agreements have restricted which teams may sign bought-out players, particularly above the apron thresholds, precisely to limit that.`,
    related: ['waivers', 'trade-deadline', 'salary-aprons', 'free-agency'],
  }),

  definition({
    ...CBA,
    slug: 'player-option',
    title: 'Player Option',
    category: 'nba-explained',
    difficulty: 'advanced',
    aliases: ['player option', 'po', 'opt out', 'opt in'],
    summary: 'A final contract year the player alone decides whether to take.',
    order: 2510,
    explanation: `The player chooses whether to play the final year at the agreed salary or **opt out** and become a free agent.

They opt out when they believe they can earn more elsewhere or on a longer deal, and opt in when the guaranteed money is better than what the market would offer, often after injury or a poor season.`,
    whyItMatters: `A player option is a one-sided benefit and is therefore something a player negotiates for. It gives them the upside of a good season without the downside of a bad one.

For the club it is a planning problem: the roster and cap position for next season depend on a decision that is not theirs to make.`,
    related: ['team-option', 'free-agency', 'max-contract', 'salary-cap'],
  }),

  definition({
    ...CBA,
    slug: 'team-option',
    title: 'Team Option',
    category: 'nba-explained',
    difficulty: 'advanced',
    aliases: ['team option', 'club option', 'to'],
    summary: 'A final contract year the club alone decides whether to exercise.',
    order: 2520,
    explanation: `The mirror image of a player option. The club decides whether to keep the player for the final year at the agreed salary or decline and let them become a free agent.

Clubs exercise it when the salary is below market value and decline when it is not.`,
    whyItMatters: `It hands the club flexibility at the player's expense, and is therefore something clubs negotiate for and agents resist.

Rookie-scale first-round contracts contain team options for the third and fourth years, which is part of why drafted players are such efficient assets: the club has several years of low-cost control with an exit each season.`,
    related: ['player-option', 'draft-pick', 'salary-cap', 'free-agency'],
  }),

  definition({
    ...CBA,
    slug: 'two-way-contract',
    title: 'Two-Way Contract',
    category: 'nba-explained',
    difficulty: 'advanced',
    aliases: ['two way contract', 'two-way', 'g league contract'],
    summary:
      'A deal allowing a player to move between the NBA team and its development-league affiliate.',
    order: 2530,
    explanation: `A limited contract under which a player splits time between the NBA roster and the G League affiliate, paid differently depending on where they are.

Teams may carry a small number of two-way players in addition to their standard roster, and the number of NBA games such a player may appear in is capped.`,
    whyItMatters: `It is the main route into the league for undrafted players and second-round picks, giving teams a low-cost way to develop players without using a standard roster place.

For the player it is a genuine opportunity and a precarious one: two-way deals are not guaranteed in the way standard contracts are, and several established players began on them.`,
    related: ['undrafted-player', 'draft-pick', 'waivers', 'salary-cap'],
  }),

  // ══ NBA: cap machinery ═════════════════════════════════════════════════════
  format({
    ...CBA,
    slug: 'salary-aprons',
    title: 'Salary Aprons',
    category: 'nba-explained',
    difficulty: 'advanced',
    aliases: ['apron', 'aprons', 'first apron', 'second apron', 'salary aprons'],
    summary:
      'Spending thresholds above the tax that restrict what a team may do, not merely what it pays.',
    order: 2540,
    howItWorks: `Two thresholds above the luxury tax, generally called the **first** and **second apron**.

Crossing them does not simply cost money. It removes tools:

- Access to certain exceptions, including parts of the mid-level exception.
- The ability to take back more salary than sent out in a trade.
- The ability to sign certain bought-out players.
- Restrictions on aggregating salaries in trades and, above the second apron, on trading future draft picks.`,
    whyItMatters: `The aprons are the most consequential change to NBA roster building in recent years, precisely because they are **not** financial penalties.

A wealthy owner can absorb a luxury tax bill; no owner can buy back a prohibited transaction. The aprons therefore constrain the richest teams in a way the tax never did, which was their explicit purpose.

The practical effect is that teams now dismantle expensive rosters rather than simply paying for them, and long-term contention has become harder to sustain by design.

**No thresholds are quoted here.** They reset annually under the collective bargaining agreement.`,
    related: ['salary-cap', 'luxury-tax', 'nba-trades', 'mid-level-exception', 'buyout'],
  }),

  format({
    ...CBA,
    slug: 'max-contract',
    title: 'Max Contract',
    category: 'nba-explained',
    difficulty: 'advanced',
    aliases: ['max contract', 'maximum contract', 'max deal', 'max'],
    summary: 'The largest salary a player may be paid, set as a share of the salary cap.',
    order: 2550,
    howItWorks: `Individual salaries are capped as a percentage of the salary cap, and the percentage rises with years of service: roughly 25%, 30% and 35% tiers for players with fewer than seven, seven to nine, and ten or more years.

A player's own club can generally offer more years and larger annual raises than a rival, through Bird rights.`,
    whyItMatters: `The maximum is set below what the best players would command in an open market, which has a specific and important consequence: the very best players are systematically **underpaid** relative to their value, and merely very good players at the same maximum are overpaid.

That gap is what makes superteams possible. If the top player earns the same as the fifth-best, a team can afford several of them, which would be impossible in an open market. Much of the NBA's roster-building strategy follows from this single distortion.`,
    ruleDifferences: `No individual maximum exists in European basketball. Clubs pay what they can afford, so the compression effect and the superteam dynamic that follows from it are specific to the NBA.`,
    related: ['supermax', 'salary-cap', 'bird-rights', 'free-agency'],
  }),

  format({
    ...CBA,
    slug: 'supermax',
    title: 'Supermax',
    subtitle: 'The Designated Veteran Player Extension',
    category: 'nba-explained',
    difficulty: 'advanced',
    aliases: ['supermax', 'super max', 'designated veteran extension'],
    summary:
      'A higher maximum available only from a player’s own team, and only if they meet performance criteria.',
    order: 2560,
    howItWorks: `A player who meets specific achievement criteria, such as winning MVP, Defensive Player of the Year, or being named to an All-NBA team within a defined window, may sign an extension worth a larger share of the cap than the ordinary maximum.

It is available **only from their current team**, and only if they have spent their whole career there or arrived by trade on a rookie contract.`,
    whyItMatters: `It is a retention device. The intention is to let smaller-market clubs pay their homegrown stars more than any rival possibly can, so that money is not the reason a franchise player leaves.

The unintended consequence is well documented: because eligibility depends on awards, a single All-NBA selection can obligate a club to an enormous contract, and clubs have found themselves committed to declining players. Awards voting therefore carries direct financial consequences, which is an awkward position for voters.`,
    related: ['max-contract', 'bird-rights', 'salary-cap', 'free-agency'],
  }),

  format({
    ...CBA,
    slug: 'mid-level-exception',
    title: 'Mid-Level Exception',
    category: 'nba-explained',
    difficulty: 'advanced',
    aliases: ['mid level exception', 'mle', 'mid-level', 'taxpayer mle'],
    summary: 'A fixed amount teams over the cap may still use to sign a free agent.',
    order: 2570,
    howItWorks: `An exception permitting a team above the salary cap to sign a player for a set amount, without needing cap space.

It comes in versions: a **non-taxpayer** amount for teams below the tax apron, a smaller **taxpayer** amount for those above it, and a **room** exception for teams under the cap. Teams above the second apron lose access altogether.`,
    whyItMatters: `Most teams are over the cap most of the time, so for many clubs the mid-level is the only meaningful way to add an outside free agent at all.

Because so many teams have the same amount available, mid-level free agents effectively choose their destination rather than the highest bidder, which makes contending teams unusually attractive.

Losing it above the second apron is one of the sharpest practical consequences of the apron system.`,
    related: ['salary-cap', 'salary-aprons', 'free-agency', 'luxury-tax'],
  }),

  format({
    ...CBA,
    slug: 'trade-exception',
    title: 'Trade Exception',
    category: 'nba-explained',
    difficulty: 'advanced',
    aliases: ['trade exception', 'tpe', 'traded player exception'],
    summary: 'A credit created by trading a player away without taking equal salary back.',
    order: 2580,
    howItWorks: `When a team over the cap trades a player and receives less salary in return, it may generate a **traded player exception** equal to the difference.

The exception can be used later to absorb salary in a subsequent trade without matching, and it expires after a fixed period, typically a year.

It cannot be combined with other exceptions or split across several players in most circumstances.`,
    whyItMatters: `It gives a team over the cap a way to acquire a player later without sending salary back, which is otherwise impossible.

Large trade exceptions are treated as assets in their own right, and teams sometimes structure a trade specifically to generate one, accepting less immediate return in exchange for future flexibility.

They frequently expire unused, which is a common and quiet way for teams to lose value.`,
    related: ['nba-trades', 'salary-cap', 'salary-aprons', 'mid-level-exception'],
  }),

  // ══ International and European ═════════════════════════════════════════════
  format({
    slug: 'fiba-basketball',
    title: 'FIBA Basketball Explained',
    category: 'international-basketball',
    aliases: ['fiba', 'fiba basketball', 'international basketball'],
    summary:
      'The world governing body, its five zones, and the rules most of the world plays under.',
    order: 2590,
    ruleSensitive: true,
    sourceRevision: 'FIBA Official Basketball Rules 2024',
    lastReviewedAt: '2026-08-26',
    sourceKeys: [{ key: 'wp-fiba' }, { key: 'fiba-rules' }],
    howItWorks: `FIBA, founded in 1932 and based in Switzerland, is basketball's world governing body. It recognises one national federation per territory, grouped into five continental zones: Africa, the Americas, Asia, Europe and Oceania.

It writes the **Official Basketball Rules** used by the Olympics, the World Cup, the continental championships and most domestic leagues worldwide. It runs the international calendar, including the qualifying **windows** in which national teams assemble mid-season.

It also governs **3x3** as a separate discipline with its own rules, rankings and World Cup.`,
    whyItMatters: `FIBA rules are the global default. The NBA, WNBA and NCAA are the exceptions that write their own, not the other way round, which is the reverse of how it often appears from North American coverage.

FIBA does not govern the NBA, but NBA players compete under FIBA rules whenever they play for their countries, which is why the differences between the two rulebooks are a practical matter rather than a curiosity.`,
    ruleDifferences: `Against the NBA: 40-minute games, a closer three-point arc, five fouls to disqualify, the ball live off the rim, no defensive three-second rule, and timeouts requested only by coaches at dead balls.`,
    related: [
      'nba-vs-fiba-rules',
      'olympic-basketball',
      'fiba-world-cup',
      'fiba-windows',
      'eurobasket',
    ],
  }),

  format({
    slug: 'eurobasket',
    title: 'EuroBasket',
    category: 'international-basketball',
    difficulty: 'intermediate',
    aliases: ['eurobasket', 'euro basket', 'european championship'],
    summary: 'The European championship for national teams.',
    order: 2600,
    sourceKeys: [{ key: 'wp-fiba' }],
    howItWorks: `FIBA Europe's championship for national teams, contested every four years, with a group stage followed by knockout rounds. It is frequently hosted across several countries at once.

Qualification runs through the FIBA windows, and results contribute to qualification for the World Cup and the Olympics.`,
    whyItMatters: `Europe is the deepest region in international basketball, so EuroBasket is often a stronger tournament than its continental status suggests: many of its participants would be competitive at a World Cup.

It is also where NBA players representing European countries meet national-team basketball played under FIBA rules, which regularly produces results that surprise audiences following only the NBA.`,
    related: ['fiba-basketball', 'fiba-world-cup', 'olympic-basketball', 'nba-vs-fiba-rules'],
  }),

  format({
    slug: 'fiba-windows',
    title: 'FIBA Windows',
    category: 'international-basketball',
    difficulty: 'advanced',
    aliases: ['fiba windows', 'windows', 'international windows', 'qualifiers'],
    summary: 'Short breaks in the calendar when national teams assemble for qualifying games.',
    order: 2610,
    sourceKeys: [{ key: 'wp-fiba' }],
    howItWorks: `Rather than holding qualifying in a single block, FIBA schedules short windows through the season in which national teams gather to play qualifying fixtures over about a week.

Domestic leagues in Europe pause for them. The NBA does not.`,
    whyItMatters: `The windows are the main point of friction between the club and international games.

Because the NBA does not pause, NBA players are effectively unavailable for qualifying, so national teams often qualify with squads quite different from the ones they eventually field at a tournament. European clubs release players but resent losing them mid-season.

The result is a recurring structural argument about who owns players' time, and it is the clearest illustration that basketball's global calendar is not centrally coordinated.`,
    related: ['fiba-basketball', 'fiba-world-cup', 'eurobasket', 'how-european-basketball-works'],
  }),

  format({
    slug: 'how-european-basketball-works',
    title: 'How European Basketball Works',
    category: 'international-basketball',
    difficulty: 'intermediate',
    aliases: ['european basketball', 'how european basketball works', 'euro basketball'],
    summary:
      'Clubs play domestic leagues and continental competitions at once, in an open system with promotion and relegation.',
    order: 2620,
    sourceKeys: [{ key: 'wp-euroleague' }],
    howItWorks: `A European club's season contains **several competitions simultaneously**:

- Its **domestic league**, such as Liga ACB in Spain or the Basketball Bundesliga in Germany.
- Its **domestic cup**, a knockout competition.
- A **continental competition** if it qualifies: the EuroLeague, the EuroCup or FIBA's own competitions.

Domestic leagues are **open**: teams are promoted and relegated on results. There is no draft, no lottery, and no league-wide salary cap. Clubs develop players through their own academies from a young age and sign them directly.`,
    whyItMatters: `Almost every structural feature of the NBA is absent here, and the reason is that an open league solves the same problems differently.

The NBA needs a draft and a lottery because a failing team cannot be relegated, so something must redistribute talent toward it. European basketball punishes failure with relegation instead, and rewards success with continental qualification.

The practical consequence for players is that a promising European teenager is typically already under professional contract, while an American of the same age is playing college basketball waiting to be drafted. These are genuinely different development systems, not variations on one.`,
    related: [
      'euroleague',
      'eurocup',
      'promotion-and-relegation-basketball',
      'euroleague-vs-nba',
      'how-the-nba-works',
    ],
  }),

  format({
    slug: 'eurocup',
    title: 'EuroCup',
    category: 'international-basketball',
    difficulty: 'advanced',
    aliases: ['eurocup', 'euro cup', 'second tier europe'],
    summary: 'The second-tier European club competition, below the EuroLeague.',
    order: 2630,
    sourceKeys: [{ key: 'wp-euroleague' }],
    howItWorks: `A pan-European club competition sitting below the EuroLeague, with a group stage followed by knockout rounds.

Its winner traditionally earns a place in the following season's EuroLeague, which is the main sporting route into that competition for a club without a long-term licence.`,
    whyItMatters: `Because most EuroLeague places are held on licences rather than won annually, the EuroCup is one of the few ways a club can play its way up. That makes it the focus of the long-running argument about how open European club basketball should be.

It also runs alongside domestic commitments, so a EuroCup club is playing two or three competitions at once.`,
    related: ['euroleague', 'how-european-basketball-works', 'promotion-and-relegation-basketball'],
  }),

  format({
    slug: 'promotion-and-relegation-basketball',
    title: 'Promotion and Relegation in Basketball',
    category: 'international-basketball',
    difficulty: 'intermediate',
    aliases: ['promotion and relegation', 'relegation', 'promotion', 'open league'],
    summary:
      'The open-league system used across European basketball, and its absence in North America.',
    order: 2640,
    sourceKeys: [{ key: 'wp-euroleague' }],
    howItWorks: `In most European domestic leagues, the worst-performing clubs are relegated to a lower division at the end of the season and the best from that division are promoted.

Membership of the top division is therefore earned annually rather than held permanently.`,
    whyItMatters: `This is the deepest structural difference between European and North American basketball, and most other differences follow from it.

Because failure is punished directly, an open league does not need mechanisms to redistribute talent toward weak clubs: no draft, no lottery, no salary cap. The incentive to lose deliberately does not exist, because losing costs a club its division place.

The trade-off is financial stability. A closed league guarantees every franchise a permanent place and a share of revenue, which makes long-term investment safer. An open one guarantees competitive jeopardy instead.

**Continental competition is the exception.** EuroLeague places are largely held on long-term licences, which makes the top of European club basketball considerably more closed than the leagues beneath it, and that tension is a persistent source of argument.`,
    related: ['how-european-basketball-works', 'how-the-nba-works', 'euroleague', 'draft-lottery'],
  }),

  format({
    slug: 'euroleague-vs-nba',
    title: 'EuroLeague vs NBA',
    category: 'international-basketball',
    difficulty: 'advanced',
    aliases: ['euroleague vs nba', 'nba vs euroleague', 'europe vs nba'],
    summary: 'Two elite competitions with different rules, calendars, structures and styles.',
    order: 2650,
    sourceKeys: [{ key: 'wp-euroleague' }, { key: 'wp-nba' }],
    howItWorks: `| | NBA | EuroLeague |
|---|---|---|
| Teams | 30 franchises | Around 18 clubs |
| Season | 82 games, single competition | Shorter, played alongside domestic league and cup |
| Entry | Closed, permanent franchises | Mostly long-term licences |
| Title decided by | Best-of-seven playoffs | Playoffs then a single-weekend Final Four |
| Rules | Its own rulebook | FIBA rules |
| Player intake | Draft | Academies and direct signings |
| Spending | Salary cap and aprons | No league-wide cap |`,
    whyItMatters: `The rules differences produce genuinely different basketball. FIBA's shorter arc, absence of a defensive three-second rule and 40-minute games all reward ball movement and structured half-court offence, while penalising the isolation-heavy play the NBA's spacing rules encourage.

The calendar difference matters as much. A EuroLeague club plays two or three competitions at once with a small squad, so rotation and continuity are managed quite differently from an 82-game single-competition season.

Neither is a diluted version of the other. They are separate competitive ecosystems whose players move between them regularly, and adjusting in either direction is a real process rather than a formality.`,
    related: [
      'euroleague',
      'nba-vs-fiba-rules',
      'how-european-basketball-works',
      'how-the-nba-works',
    ],
  }),

  // ══ College ════════════════════════════════════════════════════════════════
  format({
    slug: 'ncaa-basketball',
    title: 'NCAA Basketball',
    category: 'international-basketball',
    aliases: ['ncaa', 'ncaa basketball', 'college basketball'],
    summary:
      'American university basketball, and for decades the main route into the professional game.',
    order: 2660,
    ruleSensitive: true,
    sourceRevision: 'NCAA Basketball Rules',
    lastReviewedAt: '2026-08-26',
    sourceKeys: [{ key: 'wp-ncaa' }, { key: 'ncaa-rules' }],
    howItWorks: `Universities compete in **conferences**, playing a regular season of roughly thirty games followed by a conference tournament. Those results determine entry to the national tournament, **March Madness**, which is single elimination.

Division I is the top tier. Men's and women's competitions run in parallel with their own tournaments.`,
    whyItMatters: `College basketball is unusual in world sport: a university competition with crowds, broadcast audiences and revenue that exceed many countries' professional leagues.

For decades it was the primary development route into the NBA, and its role has changed considerably as alternative paths opened and as rules on player compensation changed. It remains the main route for American players.

It has no equivalent anywhere else. European players of the same age are already professionals at club academies, which is the clearest illustration that basketball has two quite separate development systems.`,
    ruleDifferences: `**Men:** two 20-minute halves, a 30-second shot clock, five fouls to disqualify, and a three-point line closer than the NBA's.
**Women:** four 10-minute quarters.

Both differ from the NBA and from FIBA, so a player moving from college to either has adjustments to make.`,
    related: [
      'march-madness',
      'selection-sunday',
      'final-four',
      'nba-draft',
      'womens-ncaa-basketball',
    ],
  }),

  format({
    slug: 'selection-sunday',
    title: 'Selection Sunday',
    category: 'international-basketball',
    difficulty: 'intermediate',
    aliases: ['selection sunday', 'selection', 'bracket reveal', 'bubble'],
    summary:
      'The day the March Madness bracket is announced, including which borderline teams got in.',
    order: 2670,
    sourceKeys: [{ key: 'wp-ncaa' }],
    howItWorks: `A committee announces the full tournament field and bracket on a single Sunday.

Teams qualify two ways. Winning a conference tournament gives an **automatic** place. The remaining places are **at-large** selections, chosen by the committee from teams that did not win their conference.

The committee also assigns **seeds**, which shape the entire bracket.`,
    whyItMatters: `The at-large places are what make the day an event. Teams on the **bubble**, borderline cases that may or may not be selected, find out live, and the committee's reasoning is scrutinised and disputed every year.

Seeding matters nearly as much as selection: a team seeded eighth rather than sixth faces a very different route, and in single elimination that difference can decide a season.`,
    related: ['march-madness', 'ncaa-basketball', 'seeding', 'cinderella-team'],
  }),

  format({
    slug: 'final-four',
    title: 'The Final Four',
    category: 'international-basketball',
    aliases: ['final four', 'the final four', 'semi finals'],
    summary: 'The last four teams in a knockout tournament, and the weekend they contest it.',
    order: 2680,
    sourceKeys: [{ key: 'wp-ncaa' }],
    howItWorks: `In **March Madness**, the four regional winners meet at a single neutral venue: two semi-finals, then the national championship game a couple of days later.

The **EuroLeague Final Four** uses the same idea: two semi-finals and a final at one venue over one weekend, deciding the European club title.`,
    whyItMatters: `Concentrating a championship into one weekend at one venue produces an atmosphere that a home-and-away series cannot, and it is why both competitions treat the Final Four as their signature event rather than merely their closing rounds.

It also raises the variance. A team that has been the best all season can lose one semi-final on a poor shooting night and finish with nothing, which is precisely the drama the format is designed to produce.`,
    related: ['march-madness', 'euroleague', 'ncaa-basketball', 'cinderella-team'],
  }),

  definition({
    slug: 'cinderella-team',
    title: 'Cinderella Team',
    category: 'international-basketball',
    alsoIn: ['glossary'],
    aliases: ['cinderella', 'cinderella team', 'cinderella run', 'upset'],
    summary: 'A low-seeded team that goes far further in a knockout tournament than expected.',
    order: 2690,
    sourceKeys: [{ key: 'wp-ncaa' }],
    explanation: `A team from outside the leading conferences, usually seeded low, that beats several higher-seeded opponents in March Madness.

The archetypal run is a double-digit seed reaching the Sweet Sixteen or beyond.`,
    whyItMatters: `Cinderella runs are a direct product of the **format**, not of chance alone. Single elimination means a weaker team only has to be better for two hours, and college basketball's shorter games and lower possession counts increase variance further.

The contrast with the NBA playoffs is the point: best-of-seven series are designed to let the better team win, and they very largely do. March Madness is designed to produce upsets, and it does so every year.`,
    related: ['march-madness', 'seeding', 'nba-playoffs', 'final-four'],
  }),

  // ══ Women's basketball ═════════════════════════════════════════════════════
  format({
    slug: 'wnba-season',
    title: 'WNBA Season',
    category: 'international-basketball',
    difficulty: 'intermediate',
    aliases: ['wnba season', 'wnba regular season', 'wnba schedule'],
    summary: 'A summer regular season, considerably shorter than the NBA’s.',
    order: 2700,
    sourceKeys: [{ key: 'wp-wnba' }],
    howItWorks: `The WNBA plays through the North American summer, with a regular season of around forty games, followed by playoffs.

Rosters are small, around a dozen players, which makes injuries and foul trouble more consequential than in a deeper league.`,
    whyItMatters: `The summer calendar is the defining structural fact. Because it does not clash with the European and Asian winter seasons, many WNBA players compete in **two leagues in a single year**, playing overseas in the WNBA offseason.

That has long been normal rather than exceptional, and it means the world's leading women's players accumulate far more games per year than their male counterparts, with correspondingly less rest.`,
    related: ['wnba', 'wnba-playoffs', 'wnba-vs-nba', 'nba-regular-season'],
  }),

  format({
    slug: 'wnba-playoffs',
    title: 'WNBA Playoffs',
    category: 'international-basketball',
    difficulty: 'intermediate',
    aliases: ['wnba playoffs', 'wnba postseason', 'wnba finals'],
    summary: 'A knockout postseason ending in the WNBA Finals.',
    order: 2710,
    sourceKeys: [{ key: 'wp-wnba' }],
    howItWorks: `The leading teams from the regular season qualify for a playoff bracket of short series, ending in the **WNBA Finals**.

Unlike the NBA, seeding has generally been league-wide rather than split into conferences, so the bracket is not divided geographically.`,
    whyItMatters: `League-wide seeding means the two best teams can meet in the Finals, which is not guaranteed in a conference system.

Shorter series also raise variance relative to the NBA's uniform best-of-seven, so a single poor game weighs more heavily.`,
    related: ['wnba', 'wnba-season', 'nba-playoffs', 'seeding'],
  }),

  format({
    slug: 'wnba-draft',
    title: 'WNBA Draft',
    category: 'international-basketball',
    difficulty: 'intermediate',
    aliases: ['wnba draft', 'wnba lottery'],
    summary: 'The annual selection of new players, with a lottery among non-playoff teams.',
    order: 2720,
    sourceKeys: [{ key: 'wp-wnba' }],
    howItWorks: `New players, mostly from American college basketball, are selected across a small number of rounds. Order is weighted toward weaker teams, with a lottery deciding the top picks among those that missed the playoffs.

Because rosters are small, far fewer players are drafted than in the NBA, and even high picks are not guaranteed a place.`,
    whyItMatters: `Roster size makes the draft unusually brutal. With around a dozen places per team, a drafted player may be released before the season starts, which happens to selections that would be secure in a league with larger squads.

It also concentrates attention on the top picks, since the practical difference between an early and a late selection is larger than in the NBA.`,
    related: ['wnba', 'nba-draft', 'draft-lottery', 'womens-ncaa-basketball'],
  }),

  format({
    slug: 'wnba-vs-nba',
    title: 'WNBA vs NBA',
    category: 'international-basketball',
    difficulty: 'intermediate',
    aliases: ['wnba vs nba', 'nba vs wnba', 'differences wnba nba'],
    summary: 'Two leagues with different rules, calendars and roster structures.',
    order: 2730,
    ruleSensitive: true,
    sourceRevision: 'WNBA rules, 2025 season',
    lastReviewedAt: '2026-08-26',
    sourceKeys: [{ key: 'wp-wnba' }, { key: 'wnba-rules' }],
    howItWorks: `| | NBA | WNBA |
|---|---|---|
| Season | 82 games, autumn to spring | ~40 games, summer |
| Game length | Four 12-minute quarters | Four 10-minute quarters |
| Fouls to disqualify | Six | Five |
| Three-point line | 23 ft 9 in / 22 ft corner | Shorter |
| Ball | Size 7 | Size 6 |
| Roster | ~15 | ~12 |
| Shot clock | 24 seconds | 24 seconds |`,
    whyItMatters: `The rule differences are modest and mostly bring the WNBA closer to FIBA than to the NBA: 40-minute games and five fouls match international basketball rather than the NBA.

The structural differences matter more. A shorter season with smaller rosters and a summer calendar produces a different professional life, most obviously the widespread practice of playing a second season overseas.`,
    related: ['wnba', 'wnba-season', 'nba-vs-fiba-rules', 'nba-regular-season'],
  }),

  format({
    slug: 'womens-ncaa-basketball',
    title: 'Women’s NCAA Basketball',
    category: 'international-basketball',
    difficulty: 'intermediate',
    aliases: ['womens ncaa', "women's ncaa basketball", 'womens college basketball'],
    summary: 'The American college competition for women, with its own tournament and Final Four.',
    order: 2740,
    ruleSensitive: true,
    sourceRevision: 'NCAA Basketball Rules',
    lastReviewedAt: '2026-08-26',
    sourceKeys: [{ key: 'wp-ncaa' }, { key: 'ncaa-rules' }],
    howItWorks: `Universities compete in conferences and conference tournaments, leading to a 68-team single-elimination national tournament with its own Selection Sunday, bracket and Final Four.

It is the primary development route into the WNBA.`,
    whyItMatters: `Its audience has grown substantially, and championship games have drawn viewing figures comparable to or exceeding many professional events, which has changed how the competition is scheduled and broadcast.

It also functions as the main showcase for players entering the WNBA draft, so college performance carries direct professional consequences in a way that has no European equivalent.`,
    ruleDifferences: `The women's game plays **four 10-minute quarters**, matching FIBA and the WNBA, where NCAA men play two 20-minute halves.`,
    related: ['ncaa-basketball', 'march-madness', 'wnba-draft', 'wnba'],
  }),

  // ══ 3x3 ════════════════════════════════════════════════════════════════════
  rule({
    slug: 'three-by-three-rules',
    title: '3x3 Rules',
    category: 'international-basketball',
    difficulty: 'intermediate',
    aliases: ['3x3 rules', '3x3 scoring', '3x3 shot clock'],
    summary: 'One and two points, a 12-second shot clock, and a game to 21 or 10 minutes.',
    order: 2750,
    ruleSensitive: true,
    sourceRevision: 'FIBA Official Basketball Rules 2024',
    lastReviewedAt: '2026-08-26',
    sourceKeys: [{ key: 'wp-3x3' }, { key: 'fiba-rules' }],
    howItWorks: `**Scoring.** Shots inside the arc are worth **one** point, outside it **two**. Free throws are one.

**Ending.** First to **21 points**, or whoever leads after **10 minutes**. If scores are level at the end, the first team to score two points wins; there is no timed overtime.

**Shot clock.** 12 seconds.

**Possession.** After a made basket the defending team takes the ball from under the hoop and play continues without a throw-in. After a defensive rebound or steal, the ball must be taken back behind the arc before a shot.

**Teams.** Three on court, one substitute. Substitutions happen at dead balls without referee involvement.

**Fouls.** Team fouls, with free throws awarded from the seventh onward.`,
    whyItMatters: `Every one of these rules exists to remove dead time. No quarters, no throw-ins after baskets, a 12-second clock and a points target rather than only a timer.

The result is a game of roughly ten minutes that can be staged on a single half court almost anywhere, which is exactly why FIBA has used it to grow the sport in places without established leagues.`,
    related: ['three-by-three-basketball', 'three-by-three-vs-five-on-five', 'olympic-basketball'],
  }),

  format({
    slug: 'three-by-three-vs-five-on-five',
    title: '3x3 vs 5-on-5',
    category: 'international-basketball',
    difficulty: 'intermediate',
    aliases: ['3x3 vs 5v5', '3x3 vs five on five', 'difference 3x3'],
    summary:
      'Two related but genuinely separate disciplines, with different scoring, timing and skills.',
    order: 2760,
    ruleSensitive: true,
    sourceRevision: 'FIBA Official Basketball Rules 2024',
    lastReviewedAt: '2026-08-26',
    sourceKeys: [{ key: 'wp-3x3' }, { key: 'fiba-rules' }],
    howItWorks: `| | 5-on-5 | 3x3 |
|---|---|---|
| Players | Five a side | Three a side, one substitute |
| Court | Full, two baskets | Half, one basket |
| Scoring | 2 and 3 points | 1 and 2 points |
| Shot clock | 24 seconds | 12 seconds |
| Game ends | Four timed quarters | 21 points or 10 minutes |
| Overtime | Timed period | First to two points |
| After a basket | Throw-in from baseline | Play continues immediately |`,
    whyItMatters: `The differences change which skills matter. With a 12-second clock and no time to run structured actions, 3x3 rewards individual creation, immediate decision-making and endurance, since there is almost no rest.

It also removes most of what five-a-side tactics consist of: there is no weak side to help from, no transition in the usual sense, and far less room for designed plays.

They are separate FIBA disciplines with separate rankings, separate World Cups and separate Olympic medals, and top players increasingly specialise in one rather than both.`,
    related: [
      'three-by-three-basketball',
      'three-by-three-rules',
      'olympic-basketball',
      'half-court',
    ],
  }),
];
