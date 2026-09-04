import type { SourceSeed } from './football-overview';
import type { ExplainerSeed } from './explainer-types';
import { standard, definition, promotion, rulesetConcept } from './mma-explainer-helpers';

/**
 * MMA explainers: Championships, Rankings, Matchmaking, MMA Events, UFC and
 * Other Promotions.
 *
 * Extends Phase 1 (`mma-explainers.ts`) with the deeper, promotion- and
 * event-structure content those Start Here entries pointed forward to. Every
 * entry follows the same template as Phase 1: a one-sentence summary, a
 * detailed explanation, a real-fight (or real-event) scenario described
 * generically, a common misunderstanding, and related concepts, written with
 * the `standard`, `definition`, `promotion` and `rulesetConcept` builders
 * from `mma-explainer-helpers.ts`.
 *
 * SKIP / merge decisions made against Phase 1, so nothing here duplicates a
 * slug that already exists:
 *
 * - `how-mma-championships-work` (start-here, alsoIn championships) already
 *   covers undisputed/interim/vacant/former/double champion at a summary
 *   level; the eleven entries below go one level deeper on each individual
 *   concept rather than repeating that overview.
 * - `how-an-mma-event-works` (start-here, alsoIn mma-events) already covers
 *   the running order (early prelims -> prelims -> main card -> co-main ->
 *   main event) at a summary level; this file's `mma-events` entries define
 *   each of those terms individually instead of re-explaining the order.
 * - `mma-vs-ufc` and `ufc-vs-pfl-vs-one-championship` (start-here) already
 *   cover "UFC is a promotion, not the sport" and the UFC/PFL/ONE three-way
 *   comparison; this file does not write a second UFC-vs-PFL or UFC-vs-ONE
 *   comparison piece, since Phase 1's three-way entry covers exactly that
 *   ground and `alsoIn: ['other-promotions']` already surfaces it there.
 * - "UFC Rankings Explained" from the brief's rankings list is written here
 *   as `ufc-rankings-explained-detail` (distinct slug from any Phase 1 entry)
 *   with `alsoIn: ['ufc']`, rather than as a separate UFC-category entry, to
 *   avoid a near-duplicate of `mma-rankings-explained` under a different
 *   name.
 * - `different-mma-rule-sets` cross-references Phase 1's `mma-rules-explained`
 *   (already linked from that entry's `related` list) rather than repeating
 *   the Unified Rules explanation; this entry's job is the promotion-by-
 *   promotion variation angle specifically.
 * - No fabricated bonus dollar amounts, event numbers, or specific past
 *   results appear anywhere below; Fight of the Night / Performance of the
 *   Night are described structurally (discretionary bonuses awarded by the
 *   promotion) without inventing a dollar figure, since UFC bonus amounts
 *   have changed over time and are not safe to state as a fixed fact.
 */

export const MMA_PROMOTIONS_EVENTS_SOURCES: SourceSeed[] = [
  {
    key: 'wp-ufc-2',
    provider: 'wikipedia',
    title: 'Ultimate Fighting Championship',
    url: 'https://en.wikipedia.org/wiki/Ultimate_Fighting_Championship',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-ufc-apex',
    provider: 'wikipedia',
    title: 'UFC Apex',
    url: 'https://en.wikipedia.org/wiki/UFC_Apex',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-contender-series',
    provider: 'wikipedia',
    title: "Dana White's Contender Series",
    url: 'https://en.wikipedia.org/wiki/Dana_White%27s_Contender_Series',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-tuf',
    provider: 'wikipedia',
    title: 'The Ultimate Fighter',
    url: 'https://en.wikipedia.org/wiki/The_Ultimate_Fighter',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-pfl-2',
    provider: 'wikipedia',
    title: 'Professional Fighters League',
    url: 'https://en.wikipedia.org/wiki/Professional_Fighters_League',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-one-2',
    provider: 'wikipedia',
    title: 'ONE Championship',
    url: 'https://en.wikipedia.org/wiki/ONE_Championship',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-rizin',
    provider: 'wikipedia',
    title: 'Rizin Fighting Federation',
    url: 'https://en.wikipedia.org/wiki/Rizin_Fighting_Federation',
    license: 'CC BY-SA 4.0',
  },
];

// ─── Championships ─────────────────────────────────────────────────────────

export const MMA_PROMOTIONS_EVENTS_EXPLAINERS: ExplainerSeed[] = [
  definition({
    slug: 'title-fight',
    title: 'Title Fight',
    category: 'championships',
    aliases: ['title fight', 'championship fight', 'what is a title fight'],
    summary: 'A bout contested for a promotion’s championship in a weight division.',
    difficulty: 'beginner',
    readMinutes: 2,
    explanation: `A **title fight** is a bout in which a promotion's championship in a given weight division is on the line. It is contested between the reigning champion and a challenger, almost always a highly ranked contender, and is usually scheduled for five rounds rather than the standard three, giving both fighters more time to work and the judges more rounds to score if the fight goes the distance.`,
    example: `A promotion's featherweight champion is booked against the division's number-one-ranked contender, with the title itself, not just a ranking position, at stake. Win or lose, both fighters' next step in the division depends heavily on this result.`,
    misunderstandings: `A common one: assuming every high-profile main event is automatically a title fight. Many main events are simply the most marketable matchup on a card, with no championship at stake; the poster or broadcast graphic will say explicitly whether a bout is "for the title".`,
    related: ['how-mma-championships-work', 'title-shot-explained', 'undisputed-champion'],
  }),

  definition({
    slug: 'title-shot-explained',
    title: 'Title Shot Explained',
    category: 'championships',
    aliases: ['title shot', 'what is a title shot', 'earning a title shot'],
    summary:
      'The opportunity to fight for a championship, earned rather than scheduled automatically.',
    difficulty: 'beginner',
    readMinutes: 2,
    explanation: `A **title shot** is the opportunity to challenge the reigning champion for their title. It is not awarded on a fixed schedule or purely by ranking position; a promotion's matchmakers weigh a fighter's results, ranking, activity, and marketability together when deciding who challenges next, which is why the path to a title shot can look very different from one contender to another.`,
    example: `Two fighters ranked back-to-back in the same division may take very different routes to a title shot: one might get there on the strength of a single standout win over a top contender, while another might need several consecutive wins before being considered.`,
    misunderstandings: `A common one: treating a title shot as something a fighter is automatically "owed" once they reach a certain ranking. Ranking is a major input into that decision, not a guarantee of it; see "Champion vs Number-One Contender" for how that specifically plays out.`,
    related: ['title-fight', 'champion-vs-number-one-contender', 'how-mma-fights-are-made'],
  }),

  definition({
    slug: 'title-defense',
    title: 'Title Defense',
    category: 'championships',
    aliases: ['title defense', 'title defence', 'defending a title'],
    summary: 'A champion successfully retaining their title against a challenger.',
    difficulty: 'beginner',
    readMinutes: 2,
    explanation: `A **title defense** is a title fight the champion wins, retaining the championship rather than handing it to the challenger. Each successful defense is generally counted as part of a champion's reign, and a champion with several consecutive defenses is usually regarded as having had a longer or more dominant reign than one who lost the title in their first defense.`,
    example: `A champion who wins their next three scheduled title fights after first winning the belt is described as having made three successful title defenses before eventually losing the championship, or retiring while still holding it.`,
    misunderstandings: `A common one: assuming a draw or a no contest in a title fight counts as a defense. Typically, a champion retains the title in either outcome, but the record is usually noted as a draw or no contest rather than a "defense" in the sense of a clear win.`,
    related: ['title-fight', 'undisputed-champion', 'former-champion'],
  }),

  definition({
    slug: 'undisputed-champion',
    title: 'Undisputed Champion',
    category: 'championships',
    aliases: ['undisputed champion', 'undisputed title', 'what is an undisputed champion'],
    summary:
      'The single, fully recognised champion of a division within a promotion, as opposed to an interim titleholder.',
    difficulty: 'beginner',
    readMinutes: 2,
    explanation: `An **undisputed champion** is the single, fully recognised holder of a promotion's championship in a weight division, as distinct from an interim champion, who holds a title created to fill a gap. The term becomes relevant mainly by contrast: it is used to make clear a division currently has one clear champion rather than a champion and a separate interim titleholder.`,
    example: `A division might have an undisputed champion who has been unable to compete for an extended period through injury. If the promotion creates an interim title to keep the division active in that time, the original beltholder is still referred to as the undisputed champion until the situation is resolved, usually by a unification bout.`,
    misunderstandings: `A common one: assuming "undisputed" implies something extra about a champion's dominance or quality. It is a structural term about how many title claims exist in the division at once, not a judgement about how convincingly the champion has won.`,
    related: ['interim-champion', 'vacant-championship', 'how-mma-championships-work'],
  }),

  definition({
    slug: 'interim-champion',
    title: 'Interim Champion',
    category: 'championships',
    aliases: ['interim champion', 'interim title', 'what is an interim championship'],
    summary:
      'A title created to keep a division active while the undisputed champion cannot compete.',
    difficulty: 'beginner',
    readMinutes: 2,
    explanation: `An **interim championship** is created by a promotion when the undisputed champion is unavailable, most often through injury or a long layoff, and the promotion wants to keep the division active with a meaningful title fight rather than leaving contenders without a path forward. The interim champion is generally expected to unify the titles against the undisputed champion once they return, becoming the new undisputed champion with a win.`,
    example: `A division's undisputed champion suffers a long-term injury shortly after winning the title. Rather than leave the division without a title fight for an extended period, the promotion books an interim championship bout between two leading contenders, with the winner expected to face the returning champion in a unification bout.`,
    misunderstandings: `A common one: treating an interim title as equivalent in status to the undisputed championship on first being won. It is generally regarded as a step below until it is unified, though promotions and commentators do not always apply the term with perfect consistency.`,
    related: ['undisputed-champion', 'vacant-championship', 'title-fight'],
  }),

  definition({
    slug: 'vacant-championship',
    title: 'Vacant Championship',
    category: 'championships',
    aliases: ['vacant title', 'vacant championship', 'what does vacant mean in mma'],
    summary:
      'A title with no current holder, contested between two fighters rather than defended by a champion.',
    difficulty: 'beginner',
    readMinutes: 2,
    explanation: `A **vacant championship** is a title with no current holder. This happens when a champion retires, is stripped of the title, moves to a different weight division, or is otherwise removed from holding it. The promotion then books a fight between two fighters, usually top contenders, to determine a new champion, described as a bout "for the vacant title".`,
    example: `A champion announces their retirement while still holding the belt. Rather than leave the division without a champion indefinitely, the promotion schedules a fight between the two next-highest-ranked available contenders for the now-vacant title.`,
    misunderstandings: `A common one: assuming a vacant title fight is a lesser event than a normal title fight. It is still a full championship bout; the only difference is that neither fighter is the reigning champion walking in.`,
    related: ['stripped-championship', 'undisputed-champion', 'title-fight'],
  }),

  standard({
    slug: 'stripped-championship',
    title: 'Stripped Championship',
    category: 'championships',
    aliases: ['stripped title', 'stripped of the belt', 'why was a champion stripped'],
    summary:
      'A promotion removing a champion’s title, most often over inactivity, injury, or a serious rule or contract issue.',
    difficulty: 'intermediate',
    readMinutes: 3,
    explanation: `A champion can be **stripped** of their title by the promotion, meaning the title is removed from them without their choosing to give it up. The most common reasons are extended inactivity, most often because of a long-term injury, a failed drug test, or a serious dispute with the promotion, such as a contract issue that leaves the champion unwilling to defend the title within a reasonable timeframe.`,
    howItWorks: `The decision to strip a title rests with the promotion, not with any single sport-wide authority, since a champion holds a title within one promotion rather than across the sport. Once stripped, the division's title becomes vacant and is typically contested by two leading contenders.`,
    example: `A champion is unable to compete for a long period after a serious injury, and with no clear return date, the promotion strips the title so the division can move forward with a new champion, rather than leaving the belt in limbo indefinitely.`,
    whyItMatters: `Being stripped is a different outcome from losing a fight: a stripped champion has not been beaten in the cage, and their standing among fans and future contenders often reflects that distinction, even though the title itself is gone.`,
    misunderstandings: `A common one: assuming being stripped means a fighter did something wrong. It is often simply the practical result of injury or availability, not necessarily a punishment, though it can also follow a rule violation or contract dispute in other cases.`,
    takeaways: `A title can end without a fight: a stripped champion loses the belt by promotional decision, not by defeat, and the vacant title is then usually filled by a fight between contenders.`,
    related: ['vacant-championship', 'former-champion', 'undisputed-champion'],
  }),

  standard({
    slug: 'double-champion',
    title: 'Double Champion',
    category: 'championships',
    aliases: ['double champion', 'two-division champion', 'champ champ'],
    summary:
      'A fighter who holds championships in two weight divisions of the same promotion at once.',
    difficulty: 'intermediate',
    readMinutes: 3,
    explanation: `A **double champion** (sometimes called "champ-champ") is a fighter who simultaneously holds championships in two different weight divisions within the same promotion. It requires beating the champion of a second division while still holding the title in their original one, an unusual and difficult accomplishment because it means competing successfully across two different weight limits.`,
    howItWorks: `Because most promotions expect an active champion to defend their title with reasonable regularity, a double champion typically has to choose, at least for a period, which division to prioritise for their next title defense, and some promotions have introduced their own policies about how long a double champion can hold both without defending one of them.`,
    example: `A fighter wins their division's title, then moves up in weight and challenges for a second division's championship. A win there makes them a double champion, holding both belts at once until they vacate one, lose a title fight, or the promotion otherwise intervenes.`,
    whyItMatters: `Becoming a double champion is one of the clearest ways a fighter can be described as one of the best in the sport pound-for-pound, since it demonstrates high-level skill against elite competition at more than one weight.`,
    misunderstandings: `A common one: assuming a double champion is actively defending both titles at the same time on a normal schedule. In practice, one of the two titles is often the one that receives less immediate attention, and some promotions have moved to vacate a division's title if it goes undefended for too long.`,
    takeaways: `Holding titles in two divisions at once is rare and demanding, and promotions vary in how they manage a champion's competing obligations once it happens.`,
    related: ['undisputed-champion', 'pound-for-pound-rankings', 'title-defense'],
  }),

  definition({
    slug: 'former-champion',
    title: 'Former Champion',
    category: 'championships',
    aliases: ['former champion', 'ex-champion', 'what is a former champion'],
    summary: 'A fighter who has previously held a title but does not currently hold it.',
    difficulty: 'beginner',
    readMinutes: 2,
    explanation: `A **former champion** is a fighter who has held a promotion's title in a division at some point but does not hold it currently, whether they lost it in a title fight, were stripped of it, vacated it voluntarily, or moved divisions. The label typically stays attached to a fighter's name in commentary and graphics for the rest of their career, marking their past achievement regardless of their current ranking.`,
    example: `A fighter who won a title, successfully defended it several times, and then lost it in a later title fight is subsequently introduced and described as a "former champion" in that division, distinct from a fighter who has never held the title at all.`,
    misunderstandings: `A common one: assuming "former champion" implies a fighter is past their competitive best. Many former champions remain highly ranked, active contenders, and some go on to regain the title they previously lost.`,
    related: ['undisputed-champion', 'stripped-championship', 'title-defense'],
  }),

  standard({
    slug: 'lineal-champion-explained',
    title: 'Lineal Champion Explained',
    category: 'championships',
    aliases: ['lineal champion', 'lineal championship mma', 'what is a lineal champion'],
    summary:
      'A championship lineage tracked by who beat whom rather than by promotional recognition, borrowed from boxing.',
    difficulty: 'advanced',
    readMinutes: 3,
    explanation: `A **lineal champion** is the fighter recognised as champion by tracing an unbroken chain of "beat the previous champion" results, rather than by which title belt a promotion currently hands out. The concept is borrowed directly from boxing, where it has a long history of being used to settle disputes between rival sanctioning bodies over who the "real" champion is.`,
    example: `In boxing, a lineal championship might be traced back decades through a chain of champion-beats-champion results, independent of which of several boxing sanctioning bodies currently recognises a given titleholder. Applying the same idea to MMA would mean asking "who last beat the fighter who beat the fighter who beat..." rather than "who holds the promotion's current belt".`,
    whyItMatters: `The idea is worth understanding because it shows there is more than one way to define "the champion", even though MMA rarely uses it in practice. It is far more established and commonly discussed in boxing than in MMA, where a promotion's own recognised title is by far the dominant way fans, media and the promotions themselves track a division's champion.`,
    misunderstandings: `A common one: assuming MMA fans and commentators regularly track lineal championships the way boxing does. In MMA, the concept is mentioned occasionally in analysis or debate but is not a standard, widely tracked designation the way a promotion's own title is.`,
    takeaways: `Lineal championship tracks who-beat-who rather than who holds the belt, a boxing concept that exists in MMA mostly as an occasional point of discussion rather than an established, widely used designation.`,
    related: ['undisputed-champion', 'former-champion', 'different-mma-rule-sets'],
  }),

  standard({
    slug: 'champion-vs-number-one-contender',
    title: 'Champion vs Number-One Contender',
    category: 'championships',
    aliases: [
      'champion vs number one contender',
      'does the number one contender get the next title shot',
      '#1 contender title shot',
    ],
    summary:
      'A promotion’s number-one contender is the natural next challenger, but not a guaranteed one.',
    difficulty: 'intermediate',
    readMinutes: 3,
    explanation: `A promotion's rankings identify a **number-one contender** in each division, the fighter generally regarded as most deserving of the next title shot based on recent results. In practice, promotions do not treat that ranking position as binding: matchmaking, marketability, injuries and scheduling all factor into who actually gets the next title fight, which is why the number-one contender does not always fight next for the belt.`,
    howItWorks: `A number-one contender who is passed over is usually kept in position for a subsequent title shot rather than losing their ranking outright, unless they lose a fight in the meantime. The situation is one of the sport's more common sources of fan frustration, since there is no fixed rule forcing a promotion's hand the way an automatic playoff bracket would.`,
    example: `A division's number-one-ranked contender has been waiting for a title shot for some time while the champion instead defends against a lower-ranked but more commercially attractive opponent. The number-one contender has not done anything to lose their position; the promotion has simply made a different matchmaking choice for its own reasons.`,
    whyItMatters: `Understanding that rankings inform rather than dictate title matchmaking explains a large share of the sport's ongoing rankings debates, and connects directly back to how MMA rankings themselves work.`,
    misunderstandings: `A common one: treating a passed-over number-one contender as evidence the rankings are broken or meaningless. It more often reflects that rankings are one input among several into a promotion's title-fight decisions, not the sole determining factor.`,
    takeaways: `Being ranked number one makes a fighter the leading candidate for the next title shot, not the guaranteed recipient of it.`,
    related: [
      'how-mma-championships-work',
      'mma-rankings-explained',
      'why-rankings-dont-always-decide-fights',
    ],
  }),

  // ─── Rankings ─────────────────────────────────────────────────────────────

  standard({
    slug: 'mma-rankings-explained',
    title: 'MMA Rankings Explained',
    category: 'rankings',
    aliases: ['mma rankings', 'how do mma rankings work', 'fighter rankings explained'],
    summary:
      'A promotion’s ordered list of contenders in each division, used to guide title matchmaking.',
    isFeatured: true,
    difficulty: 'beginner',
    readMinutes: 3,
    explanation: `**MMA rankings** are an ordered list of contenders within a weight division, published by a promotion (or by independent media) to show who is generally regarded as the strongest challengers at that time. A ranking is typically based on recent results, quality of opposition, and, to some extent, subjective judgement by whoever compiles the list, whether that is the promotion itself or a panel of journalists.`,
    howItWorks: `Rankings usually update after fight results, with wins over highly ranked opponents moving a fighter up and losses moving them down or out of the rankings entirely. Because judgement is involved in weighing wins of different quality, two ranking panels looking at the same set of results can reasonably disagree on the exact order.`,
    example: `A fighter who is unranked entering a fight might jump straight into the top ten after a decisive win over a top-five opponent, while a previously highly ranked fighter can drop out of the rankings altogether after a run of losses.`,
    whyItMatters: `Rankings shape which matchups fans and media expect to see next and are the main reference point for judging whether a title fight matchup makes sense, even though, as covered in "Champion vs Number-One Contender", they don't bind a promotion's actual matchmaking decisions.`,
    misunderstandings: `A common one: treating rankings as an objective, mathematically derived result. Most MMA rankings involve real human judgement about which wins matter more, not a fixed formula, which is why rankings from different sources can disagree.`,
    takeaways: `Rankings are a guide to who is doing well in a division, compiled with judgement rather than a strict formula, and they inform matchmaking without controlling it outright.`,
    related: [
      'ufc-rankings-explained-detail',
      'pound-for-pound-rankings',
      'champion-vs-number-one-contender',
    ],
  }),

  standard({
    slug: 'ufc-rankings-explained-detail',
    title: 'UFC Rankings Explained',
    category: 'rankings',
    alsoIn: ['ufc'],
    aliases: ['ufc rankings', 'how ufc rankings work', 'ufc rankings panel'],
    summary:
      'The UFC’s own official rankings, compiled by a panel of media voters rather than by the promotion itself.',
    difficulty: 'beginner',
    readMinutes: 3,
    explanation: `The **UFC's official rankings** are compiled from a panel of media members who vote on the top contenders in each division, rather than being set directly by the promotion's own matchmakers. Each division has a champion at the top, followed by a numbered list of ranked contenders, with the remainder of the roster considered unranked.`,
    howItWorks: `Panel voters submit their own ordering for each division, and those individual ballots are combined into the single published ranking. Because it draws on multiple voters, the UFC's rankings reflect a broad, if imperfect, consensus rather than one person's or one office's judgement.`,
    example: `After a UFC event, a fighter who scored an impressive win over a ranked opponent may enter the rankings for the first time, or move up several places, once the panel's updated ballots are compiled and published.`,
    whyItMatters: `Because the rankings come from an independent media panel rather than the promotion's matchmaking office, they are generally treated as a credible, if not perfectly precise, measure of standing in a division, distinct from the promotion's actual booking decisions.`,
    misunderstandings: `A common one: assuming the UFC's matchmakers set the rankings directly to justify fights they've already decided to book. The rankings panel is intended to operate independently of matchmaking, even though the two inevitably influence each other in practice.`,
    takeaways: `UFC rankings come from a voting media panel, not the promotion's own matchmaking department, giving them a degree of independence from the fights the UFC actually chooses to book.`,
    related: [
      'mma-rankings-explained',
      'promotion-rankings-vs-independent-rankings',
      'champion-vs-number-one-contender',
    ],
  }),

  standard({
    slug: 'pound-for-pound-rankings',
    title: 'Pound-for-Pound Rankings',
    category: 'rankings',
    aliases: ['pound for pound rankings', 'p4p rankings mma', 'best fighter pound for pound'],
    summary:
      'A ranking of the best fighters across all weight classes, as if size differences didn’t exist.',
    isFeatured: true,
    difficulty: 'intermediate',
    readMinutes: 3,
    explanation: `**Pound-for-pound rankings** attempt to rank the best fighters in the sport (or within a promotion) across all weight classes at once, as if weight were not a factor, answering the hypothetical question of who the most skilled fighter is regardless of what division they compete in. It is a comparative exercise across divisions that otherwise never meet in competition.`,
    howItWorks: `Because fighters in different divisions never fight each other, pound-for-pound rankings are inherently more subjective than within-division rankings: voters weigh dominance, quality of opposition, and the difficulty of a fighter's achievements (such as being a double champion) against one another without a common set of results to compare directly.`,
    example: `A dominant flyweight champion and a dominant heavyweight champion might both be considered for a top pound-for-pound spot, even though the two could never fight each other within the sport's normal weight-class structure; the ranking is a judgement about overall skill and dominance, not a prediction of who would win between them.`,
    whyItMatters: `Pound-for-pound status is widely regarded as one of the sport's highest individual honours precisely because it requires being considered elite even against fighters outside a fighter's own weight class.`,
    misunderstandings: `A common one: assuming a pound-for-pound ranking claims to predict who would beat whom if weight didn't matter. It is a judgement about overall quality and dominance, not a literal hypothetical matchup prediction.`,
    takeaways: `Pound-for-pound rankings compare fighters across divisions on overall skill and dominance, a more subjective exercise than ranking within a single weight class.`,
    related: ['what-does-p4p-mean', 'mma-rankings-explained', 'double-champion'],
  }),

  definition({
    slug: 'what-does-p4p-mean',
    title: 'What Does P4P Mean?',
    category: 'rankings',
    aliases: ['p4p meaning', 'what does p4p stand for', 'p4p mma'],
    summary:
      'Shorthand for "pound-for-pound", used in rankings that compare fighters across weight classes.',
    difficulty: 'beginner',
    readMinutes: 1,
    explanation: `**P4P** is shorthand for "pound-for-pound", the term used when comparing fighters from different weight classes on overall skill and dominance rather than on results against one another, since fighters in different divisions do not typically compete against each other.`,
    example: `A commentator describing a fighter as "a top-five P4P guy" is saying that fighter is considered among the best in the sport overall, independent of which weight class they compete in.`,
    misunderstandings: `A common one: assuming P4P is a formal, official category with a fixed, universally agreed list. Different outlets and promotions maintain their own P4P rankings, and they frequently disagree with one another.`,
    related: ['pound-for-pound-rankings', 'mma-rankings-explained'],
  }),

  standard({
    slug: 'why-rankings-are-subjective',
    title: 'Why Rankings Are Subjective',
    category: 'rankings',
    aliases: [
      'are mma rankings subjective',
      'why do rankings disagree',
      'mma rankings controversy',
    ],
    summary:
      'Rankings involve human judgement about which wins matter more, not a fixed mathematical formula.',
    difficulty: 'intermediate',
    readMinutes: 3,
    explanation: `MMA rankings are compiled through human judgement, whether by a media panel or a promotion's own staff, rather than by a single agreed-upon formula. Voters have to weigh questions that don't have one objective answer: how much a win over a declining former champion should count, how a long layoff should affect a fighter's position, or how to compare a dominant finish against a closer decision win.`,
    howItWorks: `Because there is no universal, sport-wide statistical model that every promotion and media outlet defers to, different ranking panels can and do produce different orderings from the same set of results, and reasonable observers frequently disagree about the "correct" ranking for a given fighter.`,
    example: `Two ranking panels might disagree about whether a recent, dominant win over a lower-ranked opponent should count for more than an older win over a higher-ranked one, and rank two contenders in opposite order as a result.`,
    whyItMatters: `Recognising that rankings carry a built-in element of judgement helps explain why rankings controversy is a permanent feature of MMA discussion, rather than a sign that any particular ranking system is broken.`,
    misunderstandings: `A common one: assuming a ranking disagreement means one side must be simply wrong. Often, both orderings are defensible readings of the same results, differing in how much weight they give to different factors.`,
    takeaways: `Rankings reflect judgement calls about how to weigh wins and losses, which is exactly why different rankings sources can reasonably disagree.`,
    related: [
      'mma-rankings-explained',
      'promotion-rankings-vs-independent-rankings',
      'ufc-rankings-explained-detail',
    ],
  }),

  standard({
    slug: 'how-rankings-affect-matchmaking',
    title: 'How Rankings Affect Matchmaking',
    category: 'rankings',
    alsoIn: ['matchmaking'],
    aliases: [
      'rankings and matchmaking',
      'how rankings influence fights',
      'do rankings decide fights',
    ],
    summary:
      'Rankings are one input a promotion weighs when building fights, not a rule that decides them.',
    difficulty: 'intermediate',
    readMinutes: 3,
    explanation: `Rankings give a promotion's matchmakers a shared reference point for which fights make sense: a fight between closely ranked contenders is generally seen as sensible matchmaking, while a fight far outside the expected ranking range can draw scrutiny. But rankings do not mechanically produce a fight schedule; matchmakers still choose from among plausible options.`,
    howItWorks: `A matchmaker weighs a fighter's ranking alongside their availability, their style matchup with a potential opponent, their marketability, and the broader needs of the card and the promotion's schedule, arriving at a specific fight rather than following the rankings automatically down the list.`,
    example: `A promotion might book a lower-ranked but higher-profile fighter into a bout that a strict ranking order would have given to someone else, a choice matchmakers can defend on commercial or stylistic grounds even though it departs from the rankings alone.`,
    whyItMatters: `Understanding this relationship explains why the rankings and the actual fight schedule frequently diverge without either being "wrong": they are answering different questions, one about current standing and one about what fight makes sense to book next.`,
    misunderstandings: `A common one: assuming any fight that skips over the "logical" next ranked opponent must reflect favouritism or bias. It very often reflects ordinary matchmaking considerations like availability and style rather than anything improper.`,
    takeaways: `Rankings inform matchmaking by identifying sensible opponents; they do not replace the judgement matchmakers apply on top of them.`,
    related: [
      'how-mma-fights-are-made',
      'matchmaking-explained',
      'why-rankings-dont-always-decide-fights',
    ],
  }),

  standard({
    slug: 'can-an-unranked-fighter-get-a-title-shot',
    title: 'Can an Unranked Fighter Get a Title Shot?',
    category: 'rankings',
    aliases: [
      'unranked fighter title shot',
      'can an unranked fighter fight for a title',
      'title shot without being ranked',
    ],
    summary:
      'Rare, but it happens: a breakout win or a late-notice opportunity can occasionally bypass the rankings.',
    difficulty: 'intermediate',
    readMinutes: 2,
    explanation: `It is uncommon, but an unranked fighter can occasionally receive a title shot. The most typical routes are a standout, highly impressive win that immediately establishes a fighter as a credible top contender even before a ranking update reflects it, or being asked to step in as a late replacement when an originally scheduled challenger withdraws close to the event.`,
    howItWorks: `In a replacement scenario, a promotion facing a title fight falling through close to the event sometimes has limited options for who can be ready on short notice, and an available, capable unranked fighter can end up receiving an opportunity that would not otherwise have come their way at that point in their career.`,
    example: `A fighter delivers a dominant, highly rated performance against an already-ranked opponent, and instead of simply moving into the rankings first, is offered a direct title opportunity on the strength of that single result. Separately, a title challenger might withdraw from a scheduled title fight close to the event, and an available unranked fighter is offered the opportunity on short notice.`,
    whyItMatters: `Knowing this can happen explains occasional title fights that look like they skip the usual ranked progression entirely, without needing to assume anything irregular occurred.`,
    misunderstandings: `A common one: assuming an unranked title challenger must indicate a broken or manipulated ranking system. It is genuinely rare, but a legitimate, if unusual, outcome of either an exceptional performance or matchmaking necessity.`,
    takeaways: `An unranked title shot is uncommon but real, typically arising from either a breakout performance or a late-replacement situation rather than routine matchmaking.`,
    related: ['title-shot-explained', 'replacement-fighter', 'short-notice-fight'],
  }),

  standard({
    slug: 'promotion-rankings-vs-independent-rankings',
    title: 'Promotion Rankings vs Independent Rankings',
    category: 'rankings',
    aliases: [
      'official vs independent mma rankings',
      'promotion rankings vs media rankings',
      'whose rankings are correct in mma',
    ],
    summary:
      'A promotion’s own rankings and independent media rankings are compiled differently and can disagree.',
    difficulty: 'advanced',
    readMinutes: 3,
    explanation: `A promotion's **official rankings** (such as the UFC's media-panel rankings) exist alongside a range of **independent rankings**, compiled by individual journalists, outlets or long-running media panels that are not affiliated with any single promotion. Both are attempts to rank contenders sensibly, but they can differ in methodology, in who is doing the voting, and in whether the promotion whose fighters are being ranked has any influence over the process.`,
    howItWorks: `An official promotion ranking is generally the one the promotion itself references most prominently in its own broadcasts and marketing, while independent rankings, some spanning multiple promotions or even the sport as a whole, are compiled entirely outside any single promotion's structure and are not bound by its divisional or roster boundaries.`,
    example: `A fighter might be ranked highly in an independent, cross-promotion media ranking of the best fighters in their weight class in the sport overall, while sitting somewhat differently in their own promotion's official, promotion-specific rankings, because the two lists are drawing on different pools of eligible fighters and different voting panels.`,
    whyItMatters: `Recognising the difference matters most when a fan or article cites "the rankings" without specifying which set is meant, since a promotion's own list and an independent list are answering related but not identical questions, and can reasonably diverge as a result.`,
    misunderstandings: `A common one: treating any single ranking list as the sport's one authoritative source. No single ranking, official or independent, holds universal authority across the whole sport; each is a defensible, but not exclusive, attempt to answer the same underlying question.`,
    takeaways: `A promotion's own rankings and independent media rankings are separate exercises with separate voting pools, and neither should be read as the sport's single definitive answer.`,
    related: [
      'mma-rankings-explained',
      'ufc-rankings-explained-detail',
      'why-rankings-are-subjective',
    ],
  }),

  // ─── Matchmaking ────────────────────────────────────────────────────────────

  standard({
    slug: 'how-mma-fights-are-made',
    title: 'How MMA Fights Are Made',
    category: 'matchmaking',
    aliases: ['how mma fights are made', 'who decides mma matchups', 'how are ufc fights booked'],
    summary:
      'A promotion’s matchmakers weigh rankings, availability, style and marketability to build each fight.',
    isFeatured: true,
    difficulty: 'beginner',
    readMinutes: 3,
    explanation: `Fights in MMA are built by a promotion's **matchmakers**, staff whose job is to propose and negotiate matchups that make sense competitively, fit the promotion's event schedule, and appeal to fans. There is no automatic, formula-driven process that pairs fighters purely on ranking, the way a single-elimination bracket might.`,
    howItWorks: `Matchmakers consider a fighter's recent results and ranking, their current availability and health, how their skill set matches up stylistically against a proposed opponent, and how much interest the matchup is likely to generate, then negotiate the fight with both fighters' teams before it is officially announced.`,
    example: `A matchmaker looking to fill a card might propose several possible opponents for a given fighter, weighing which matchup best balances competitive sense, both fighters' availability, and how much attention the fight is likely to draw, before settling on the one that is offered and accepted.`,
    whyItMatters: `Understanding that matchmaking is a negotiated, judgement-based process, not an automatic pairing system, explains why the "obvious" next fight on paper doesn't always happen, and why timing and availability matter as much as results.`,
    misunderstandings: `A common one: assuming a promotion simply pairs fighters straight down a rankings list. In practice matchmaking weighs many factors together, and rankings are only one of them.`,
    takeaways: `Fights are built by matchmakers weighing rankings, availability, style and marketability together, not by an automatic ranking-based pairing process.`,
    related: [
      'matchmaking-explained',
      'how-rankings-affect-matchmaking',
      'number-one-contender-fight',
    ],
  }),

  standard({
    slug: 'matchmaking-explained',
    title: 'Matchmaking Explained',
    category: 'matchmaking',
    aliases: ['matchmaking explained', 'what is matchmaking in mma', 'mma matchmaker role'],
    summary:
      'The ongoing process of proposing, negotiating and finalising fights for a promotion’s upcoming cards.',
    difficulty: 'beginner',
    readMinutes: 3,
    explanation: `**Matchmaking** is the ongoing work of building a promotion's future fight cards: identifying which fighters are ready to compete, proposing opponents for them, and negotiating those matchups into confirmed bouts. It happens continuously, well ahead of any single event, as a promotion works to fill several upcoming cards at once.`,
    howItWorks: `A matchmaker typically has to satisfy several constraints simultaneously: filling each weight class's slots on upcoming cards, keeping active fighters competing at a reasonable pace, developing newer prospects, and building toward eventual title fights, all while both fighters involved in any specific proposed matchup have to actually agree to it.`,
    example: `A matchmaker working several months ahead of a card might have multiple possible opponents in mind for a given fighter and adjust those plans as results come in from other events, injuries arise, or a more compelling opportunity presents itself.`,
    whyItMatters: `Matchmaking is the layer between "here are the rankings" and "here is the actual card", and understanding it explains most of the judgement calls that go into which specific fights get made and when.`,
    misunderstandings: `A common one: assuming matchmaking is a single, one-off decision for each fight. It is an ongoing, continuously adjusted process across many fighters and cards at once, not a series of independent, isolated choices.`,
    related: ['how-mma-fights-are-made', 'title-eliminator', 'replacement-fighter'],
  }),

  definition({
    slug: 'number-one-contender-fight',
    title: 'Number-One Contender Fight',
    category: 'matchmaking',
    aliases: ['number one contender fight', '#1 contender bout', 'contender fight mma'],
    summary: 'A fight explicitly billed as determining the next title challenger.',
    difficulty: 'beginner',
    readMinutes: 2,
    explanation: `A **number-one contender fight** is a matchup explicitly presented as deciding who becomes the next challenger for a division's title. Unlike an ordinary contender bout, it is announced with the specific stakes of the winner earning (or being strongly positioned for) the next title shot.`,
    example: `A promotion books two highly ranked fighters against each other and announces the winner will receive the next title opportunity in that division, turning what would otherwise be a normal ranked matchup into an explicit number-one contender fight.`,
    misunderstandings: `A common one: assuming winning a number-one contender fight guarantees the title shot regardless of what happens afterward. Circumstances such as the champion's availability or the promotion's later plans can still affect the timing, even when the stakes were announced clearly beforehand.`,
    related: ['title-eliminator', 'title-shot-explained', 'champion-vs-number-one-contender'],
  }),

  definition({
    slug: 'title-eliminator',
    title: 'Title Eliminator',
    category: 'matchmaking',
    aliases: ['title eliminator fight', 'eliminator bout mma', 'what is a title eliminator'],
    summary:
      'A high-stakes contender fight used to narrow the field before a title shot is awarded.',
    difficulty: 'beginner',
    readMinutes: 2,
    explanation: `A **title eliminator** is a fight positioned to narrow down the pool of leading contenders in a division, often when several fighters have a credible claim to the next title shot. The winner is generally regarded as having strengthened their claim significantly, though as with any contender fight, the promotion still makes the final call on what happens next.`,
    example: `With three fighters near the top of a division all considered plausible next challengers, a promotion books two of them against each other as a title eliminator, with the winner then the clear frontrunner for the next title opportunity.`,
    misunderstandings: `A common one: treating "title eliminator" and "number-one contender fight" as strictly different formal categories. In practice the terms are used somewhat loosely and overlappingly in commentary and media coverage, both describing a contender fight with unusually high stakes for the next title shot.`,
    related: ['number-one-contender-fight', 'title-shot-explained', 'matchmaking-explained'],
  }),

  definition({
    slug: 'rematch-explained',
    title: 'Rematch Explained',
    category: 'matchmaking',
    aliases: ['rematch mma', 'what is a rematch', 'second fight between same fighters'],
    summary:
      'A second fight between two fighters who have already competed against each other once.',
    difficulty: 'beginner',
    readMinutes: 2,
    explanation: `A **rematch** is a fight between two fighters who have previously competed against one another, booked for a second meeting. Rematches happen for various reasons: a close or contested first result, a rematch clause built into the original fight's terms, continued high interest from fans, or simply both fighters remaining highly ranked contenders who make sense to pair again.`,
    example: `Two fighters who fought a closely contested decision are booked again some time later, both having continued to perform well since their first meeting, giving fans and the promotion a natural reason to run it back.`,
    misunderstandings: `A common one: assuming a rematch is only ever booked after a controversial result. Many rematches happen simply because both fighters remain relevant contenders, regardless of how one-sided or clear-cut their first meeting was.`,
    related: ['immediate-rematch', 'trilogy-fight', 'title-fight'],
  }),

  standard({
    slug: 'immediate-rematch',
    title: 'Immediate Rematch',
    category: 'matchmaking',
    aliases: ['immediate rematch clause', 'instant rematch mma', 'rematch clause title fight'],
    summary:
      'A rematch booked right away, most often after a close, controversial, or title-changing result.',
    difficulty: 'intermediate',
    readMinutes: 3,
    explanation: `An **immediate rematch** is a rematch booked as a fighter's very next fight, ahead of other contenders who might otherwise be next in line. It is most commonly seen after a particularly close or contested decision, a title changing hands in a way that leaves genuine debate about the result, or a rematch clause written into the terms of the original fight.`,
    howItWorks: `Because granting an immediate rematch effectively skips over other ranked contenders who might have had a claim to that title shot or high-profile matchup, it is one of matchmaking's more debated practices: it can be well justified by a genuinely contentious first result, or criticised as unfair to other contenders when the justification is weaker.`,
    example: `A title changes hands on a split decision that many observers and the losing fighter's camp consider debatable. Rather than have the new champion's next defense go to the top-ranked contender, the promotion books an immediate rematch, citing the closeness and contested nature of the first result.`,
    whyItMatters: `Understanding immediate rematches explains one of the more visible tensions in MMA matchmaking: the trade-off between giving a close or disputed result its due and being fair to other contenders waiting for their own opportunity.`,
    misunderstandings: `A common one: assuming every rematch that happens quickly must be controversial. Some immediate rematches follow from a contractual rematch clause agreed before the first fight even happened, independent of how that fight actually turned out.`,
    takeaways: `An immediate rematch skips the normal contender queue, usually justified by a close or contested result, a title change, or a pre-agreed rematch clause, and it remains one of matchmaking's more debated practices.`,
    related: ['rematch-explained', 'trilogy-fight', 'why-rankings-dont-always-decide-fights'],
  }),

  definition({
    slug: 'trilogy-fight',
    title: 'Trilogy Fight',
    category: 'matchmaking',
    aliases: ['trilogy fight mma', 'third fight between same fighters', 'what is a trilogy fight'],
    summary: 'A third fight between two fighters who have already met twice.',
    difficulty: 'beginner',
    readMinutes: 2,
    explanation: `A **trilogy fight** is a third meeting between two fighters who have already fought each other twice, usually with the series tied at one win apiece, making the third fight a natural decider. Trilogies generate significant fan interest because they carry the accumulated history of two closely matched previous results.`,
    example: `Two fighters split their first two meetings, one win each, and are booked for a third fight some time later billed explicitly as the series decider, drawing on the narrative of their first two results.`,
    misunderstandings: `A common one: assuming a trilogy only happens when a series is tied. A third fight can also happen when one fighter has won both previous meetings, if there is still enough competitive or commercial interest in seeing them fight again.`,
    related: ['rematch-explained', 'immediate-rematch'],
  }),

  definition({
    slug: 'replacement-fighter',
    title: 'Replacement Fighter',
    category: 'matchmaking',
    aliases: [
      'replacement fighter mma',
      'injury replacement',
      'stepping in for an injured fighter',
    ],
    summary: 'A fighter who steps into a bout after the originally scheduled opponent withdraws.',
    difficulty: 'beginner',
    readMinutes: 2,
    explanation: `A **replacement fighter** steps into a scheduled bout after the originally booked opponent withdraws, whether because of injury, illness, or another reason. Depending on how close to the event the change happens, a replacement fighter may have significantly less time to prepare than the fighter they are stepping in against.`,
    example: `A fighter is scheduled to face a top contender, and days before the event the contender withdraws due to injury. The promotion finds a replacement fighter willing to step in on short notice, and the fight goes ahead as scheduled with the new opponent.`,
    misunderstandings: `A common one: assuming a replacement fighter is automatically at a serious disadvantage. While a shorter camp is a real factor, replacement fighters have won plenty of fights, and preparation time is only one of several factors in how a fight goes.`,
    related: [
      'short-notice-fight',
      'why-fighters-pull-out',
      'can-an-unranked-fighter-get-a-title-shot',
    ],
  }),

  definition({
    slug: 'short-notice-fight',
    title: 'Short-Notice Fight',
    category: 'matchmaking',
    aliases: ['short notice fight', 'short notice mma bout', 'fighting on short notice'],
    summary:
      'A bout accepted with substantially less preparation time than a fighter’s typical training camp.',
    difficulty: 'beginner',
    readMinutes: 2,
    explanation: `A **short-notice fight** is one a fighter accepts with considerably less time to prepare than the several weeks or months a full training camp usually takes, often because they are stepping in as a replacement or because a new opponent has just been finalised close to the event.`,
    example: `A fighter normally expects a full training camp of eight or more weeks. If they instead accept a fight with only a couple of weeks' notice, that fight is described as short notice, with the fighter relying more heavily on their existing conditioning than on camp-specific preparation.`,
    misunderstandings: `A common one: assuming a short-notice fight automatically means a fighter is underprepared in a way that dooms the outcome. Fighters who maintain good conditioning between fights are sometimes well positioned to accept short-notice opportunities successfully.`,
    related: ['replacement-fighter', 'why-fighters-pull-out'],
  }),

  standard({
    slug: 'why-fighters-pull-out',
    title: 'Why Fighters Pull Out',
    category: 'matchmaking',
    aliases: [
      'why do fighters pull out of fights',
      'fighter withdraws from bout',
      'reasons fighters pull out',
    ],
    summary:
      'Injury, illness, missed weight and contract disputes are the most common reasons a scheduled fight falls through.',
    difficulty: 'beginner',
    readMinutes: 3,
    explanation: `Fighters withdraw from scheduled bouts for several recurring reasons. The most common is **injury**, sustained either in training or, less often, in daily life, that prevents a fighter from being medically cleared to compete. **Illness** close to the event can have the same effect. In some cases a fighter may withdraw or be pulled from a bout after **missing weight** during fight week, if the situation is serious enough that the fight cannot reasonably proceed. Less commonly, a **contract dispute** between a fighter and the promotion can lead to a fighter being pulled from a card.`,
    howItWorks: `A withdrawal can happen at almost any point before the fight, from months out down to the day of the event itself, and how much time is left affects the promotion's options: a long-notice withdrawal usually allows time to find a suitable replacement, while a very late withdrawal, especially on the day of the event, sometimes results in the fight being scrapped entirely rather than replaced.`,
    example: `A fighter suffers an injury in the final weeks of their training camp and is no longer able to safely compete on the scheduled date. The promotion is notified, and depending on the timing, either finds a replacement opponent for the other fighter or removes the bout from the card.`,
    whyItMatters: `Understanding the common, mundane reasons fights fall through, rather than assuming something unusual is going on, helps put a late change to a fight card in its proper context.`,
    misunderstandings: `A common one: assuming a late withdrawal automatically implies a fighter is ducking the matchup. The overwhelming majority of withdrawals are for genuine medical or scheduling reasons rather than any attempt to avoid a fight.`,
    takeaways: `Injury and illness are by far the most common reasons a scheduled fight falls through, with missed weight and contract disputes accounting for a smaller share of cases.`,
    related: ['replacement-fighter', 'short-notice-fight', 'official-weigh-in'],
  }),

  standard({
    slug: 'catchweight-matchmaking',
    title: 'Catchweight Matchmaking',
    category: 'matchmaking',
    alsoIn: ['weight-classes'],
    aliases: ['catchweight fight mma', 'why do catchweight fights happen', 'catchweight bout'],
    summary:
      'A fight contested at a weight limit agreed between the two fighters rather than a standard division limit.',
    difficulty: 'intermediate',
    readMinutes: 3,
    explanation: `A **catchweight** fight is contested at a weight limit that differs from any of the promotion's standard divisional limits, agreed specifically between the two fighters (and the promotion) for that bout. It usually arises for matchmaking reasons: a fighter between two natural weight classes, an opponent unwilling or unable to make a standard limit, or two fighters from different divisions agreeing to meet somewhere in between.`,
    howItWorks: `Because a catchweight fight is not held at a standard division limit, no title is normally contested at that weight, even if both fighters involved hold or are ranked at titles in their usual divisions. The specific limit is negotiated case by case rather than being drawn from a fixed list.`,
    example: `Two fighters from adjacent weight classes want to fight each other, but neither wants to fully commit to competing at the other's standard limit. The promotion agrees a catchweight roughly between the two divisions, and the fight proceeds at that negotiated number rather than at either fighter's usual limit.`,
    whyItMatters: `Catchweight matchmaking shows that weight classes, while central to fairness in the sport, are flexible enough in practice to accommodate fights that wouldn't otherwise happen within the standard divisional structure.`,
    misunderstandings: `A common one: assuming a catchweight fight is automatically unfair to one fighter. The limit is agreed by both sides beforehand, and while it can still favour one fighter's natural size more than the other's, it is a negotiated agreement rather than an imposed mismatch.`,
    takeaways: `A catchweight lets two fighters meet outside the standard division limits by mutual agreement, usually without a title on the line at that weight.`,
    related: ['mma-weight-classes-explained', 'how-mma-fights-are-made'],
  }),

  standard({
    slug: 'why-rankings-dont-always-decide-fights',
    title: "Why Rankings Don't Always Decide Fights",
    category: 'matchmaking',
    alsoIn: ['rankings'],
    aliases: [
      'rankings dont decide fights',
      'why arent fights booked by ranking',
      'mma matchmaking vs rankings',
    ],
    summary:
      'Availability, style, marketability and circumstance regularly outweigh strict ranking order in matchmaking.',
    difficulty: 'intermediate',
    readMinutes: 3,
    explanation: `Although rankings give a clear ordering of contenders, MMA matchmaking regularly departs from that strict order. A fighter's availability, a stylistic matchup considered more compelling, an existing rivalry, or simple commercial appeal can all lead a promotion to book a fight that skips over the "next in line" contender by ranking alone.`,
    howItWorks: `Because two fighters both have to accept a proposed matchup, and because a promotion is also weighing what will make for a compelling card, rankings function as one strong input into matchmaking rather than a strict queue that has to be followed in order.`,
    example: `A promotion might match its third- and fifth-ranked contenders against each other for a stylistically compelling fight, while its second-ranked contender is unavailable or between camps, rather than waiting for every ranking gap to be filled in strict numerical order.`,
    whyItMatters: `Understanding this helps put a "surprising" or "out of order" matchup in context: it is very often simply matchmaking responding to real-world constraints rather than any disregard for the rankings themselves.`,
    misunderstandings: `A common one: assuming any fight that departs from strict ranking order must reflect bias or favouritism toward one fighter. Availability and circumstance alone explain the great majority of such cases.`,
    takeaways: `Rankings are a major input into matchmaking, but availability, style and marketability regularly lead a promotion to book fights that don't follow the ranking order exactly.`,
    related: [
      'how-rankings-affect-matchmaking',
      'champion-vs-number-one-contender',
      'how-mma-fights-are-made',
    ],
  }),

  // ─── MMA Events ─────────────────────────────────────────────────────────────

  standard({
    slug: 'fight-card-explained',
    title: 'Fight Card Explained',
    category: 'mma-events',
    aliases: ['fight card mma', 'what is a fight card', 'mma card structure'],
    summary:
      'The full list of bouts scheduled for one MMA event, organised into a clear running order.',
    difficulty: 'beginner',
    readMinutes: 3,
    explanation: `A **fight card** is the complete list of bouts scheduled for a single MMA event, typically ranging from around ten to fifteen fights depending on the promotion and the size of the event. Fights are arranged in a specific running order, generally moving from the least to the most prominent matchup as the broadcast progresses.`,
    howItWorks: `Building a card involves matchmaking across many weight classes at once, balancing newer prospects on the earlier portions of the card against established, higher-profile fighters closer to the top. The finished card is announced as a full lineup well ahead of the event, though changes, such as a withdrawal and replacement, can still happen up until fight week.`,
    example: `A single event might feature four early prelim bouts, five preliminary card bouts, and five main card bouts, fourteen fights in total, running for several hours from the first prelim to the final main event.`,
    whyItMatters: `Understanding the fight card as a whole, not just its headline fight, is what makes sense of why a broadcast runs for hours and why casual viewers tuning in only for the main event are seeing a small fraction of what actually happened that night.`,
    misunderstandings: `A common one: assuming the entire card is broadcast on the same platform at the same production quality. Early prelims, preliminary card and main card are frequently split across different broadcast platforms or streaming tiers.`,
    takeaways: `A fight card is a full lineup of bouts arranged in ascending order of prominence, not just the single headline fight most casual coverage focuses on.`,
    related: ['how-an-mma-event-works', 'main-card', 'preliminary-card', 'early-prelims'],
  }),

  definition({
    slug: 'main-event',
    title: 'Main Event',
    category: 'mma-events',
    aliases: ['main event mma', 'what is the main event', 'headline fight'],
    summary: 'The single, top-billed fight that closes out an MMA card.',
    difficulty: 'beginner',
    readMinutes: 2,
    explanation: `The **main event** is the single fight that closes an MMA card, typically the matchup judged to have the greatest fan interest, whether because of a title on the line, the fighters' profiles, or both. It is placed last in the running order and is usually the fight most heavily promoted ahead of the event.`,
    example: `A card built around a title fight will almost always place that bout as the main event, closing the show, with every other fight on the card positioned earlier in the running order.`,
    misunderstandings: `A common one: assuming the main event is automatically the most competitively significant fight on the card in a rankings sense. It is chosen primarily for its drawing power; an undercard fight can sometimes carry greater immediate championship implications than the main event itself.`,
    related: ['co-main-event', 'main-card', 'how-an-mma-event-works'],
  }),

  definition({
    slug: 'co-main-event',
    title: 'Co-Main Event',
    category: 'mma-events',
    aliases: ['co-main event mma', 'what is the co-main event', 'second biggest fight on the card'],
    summary: 'The second-most prominent fight on a card, placed immediately before the main event.',
    difficulty: 'beginner',
    readMinutes: 2,
    explanation: `The **co-main event** is the second-billed fight on a card, positioned immediately before the main event in the running order. It is usually a highly ranked or otherwise significant matchup in its own right, sometimes even a title fight on a card that carries two.`,
    example: `A card might feature a non-title fight between two top contenders as its co-main event, immediately preceding a title fight main event, giving the broadcast two genuinely significant fights back to back to close the show.`,
    misunderstandings: `A common one: assuming a co-main event is a minor fight compared to the main event. It is typically one of the most significant bouts on the entire card, simply billed just below the headline fight.`,
    related: ['main-event', 'main-card'],
  }),

  definition({
    slug: 'main-card',
    title: 'Main Card',
    category: 'mma-events',
    aliases: ['main card mma', 'what is the main card', 'main card fights'],
    summary:
      'The block of fights broadcast on an event’s primary platform, building to the main event.',
    difficulty: 'beginner',
    readMinutes: 2,
    explanation: `The **main card** is the block of fights shown on an event's primary broadcast, typically consisting of several fights building up to the co-main event and main event. It follows the preliminary card in the running order and is generally where a promotion places its more prominent, higher-profile matchups.`,
    example: `A pay-per-view event's main card might consist of five fights broadcast on the primary pay-per-view feed, following an earlier preliminary card shown on a separate platform, and finishing with the co-main event and main event.`,
    misunderstandings: `A common one: confusing "main card" with "main event". The main card is an entire block of several fights; the main event is only the single fight that closes it.`,
    related: ['main-event', 'preliminary-card', 'pay-per-view-explained'],
  }),

  definition({
    slug: 'preliminary-card',
    title: 'Preliminary Card',
    category: 'mma-events',
    aliases: ['preliminary card mma', 'prelims mma', 'what are the prelims'],
    summary:
      'The block of fights shown before the main card, usually on a separate broadcast platform.',
    difficulty: 'beginner',
    readMinutes: 2,
    explanation: `The **preliminary card**, commonly called the **prelims**, is the block of fights that airs before the main card, usually on a different broadcast platform or streaming service than the event's primary feed. It typically features fighters earlier in their careers or lower in the rankings than the fighters on the main card, though it can still include competitive, meaningful fights.`,
    example: `A promotion might broadcast its preliminary card on a streaming platform starting some hours before the main card begins on a separate primary broadcast, giving fans access to a large block of the total card even if they don't have access to the main broadcast.`,
    misunderstandings: `A common one: assuming preliminary card fights are unimportant. Prelims regularly feature ranked fighters and can include highly competitive, exciting fights, even if the promotion has judged the main card fights to have greater overall drawing power.`,
    related: ['main-card', 'early-prelims', 'fight-card-explained'],
  }),

  definition({
    slug: 'early-prelims',
    title: 'Early Prelims',
    category: 'mma-events',
    aliases: ['early prelims mma', 'what are early prelims', 'earliest fights on a card'],
    summary:
      'The earliest block of fights on a card, usually streamed on a free or lower-tier platform.',
    difficulty: 'beginner',
    readMinutes: 2,
    explanation: `**Early prelims** are the earliest block of fights on an event's card, typically streamed on a free platform such as the promotion's own social media or website, ahead of the preliminary card and main card. They usually feature fighters newer to the roster or otherwise earlier in their careers.`,
    example: `An event's night might begin with a block of early prelim fights streamed for free online, hours before the preliminary card moves to a paid streaming platform and the main card follows on the primary broadcast.`,
    misunderstandings: `A common one: assuming early prelims are a lesser, unofficial part of the event. They are a full part of the same card and count exactly the same for the fighters' official records as any other fight on the night.`,
    related: ['preliminary-card', 'main-card', 'fight-card-explained'],
  }),

  standard({
    slug: 'numbered-ufc-event',
    title: 'Numbered UFC Event',
    category: 'mma-events',
    alsoIn: ['ufc'],
    aliases: ['numbered ufc events', 'ufc 300 style events', 'what is a numbered ufc event'],
    summary:
      'The UFC’s flagship, sequentially numbered pay-per-view events, distinct from its Fight Night series.',
    difficulty: 'beginner',
    readMinutes: 3,
    explanation: `A **numbered UFC event** (referred to by a number, such as "UFC 300") is one of the promotion's flagship pay-per-view cards, generally featuring the UFC's biggest title fights and highest-profile matchups. It is distinct from the promotion's more frequent **UFC Fight Night** events, which are typically broadcast without a pay-per-view purchase required.`,
    howItWorks: `Numbered events are held less frequently than Fight Nights and are generally reserved for the promotion's most significant fights, often multiple title fights on a single card, reflecting their status as the promotion's premium product.`,
    example: `A numbered event might feature two title fights on the same card, drawing significant promotional attention, while several Fight Night events are held in the same period without a similarly stacked lineup.`,
    whyItMatters: `Knowing the difference between a numbered event and a Fight Night helps a fan gauge, roughly, how significant a given card is expected to be before looking at the actual matchups.`,
    misunderstandings: `A common one: assuming every numbered event is automatically stronger than every Fight Night. While numbered events are generally the promotion's biggest cards, a strong Fight Night lineup can occasionally rival a weaker numbered event.`,
    takeaways: `Numbered UFC events are the promotion's flagship pay-per-view cards, distinct from the more frequent, typically non-pay-per-view UFC Fight Night series.`,
    related: ['ufc-fight-night', 'pay-per-view-explained', 'ufc-explained'],
  }),

  standard({
    slug: 'ufc-fight-night',
    title: 'UFC Fight Night',
    category: 'mma-events',
    alsoIn: ['ufc'],
    aliases: ['ufc fight night', 'what is ufc fight night', 'fight night events'],
    summary:
      'The UFC’s more frequent event series, generally broadcast without requiring a separate pay-per-view purchase.',
    difficulty: 'beginner',
    readMinutes: 3,
    explanation: `**UFC Fight Night** is the promotion's series of events held more frequently than its numbered flagship cards, generally broadcast as part of a standard subscription or broadcast arrangement rather than requiring a separate pay-per-view purchase. Fight Nights still regularly feature ranked contenders and can include a title fight, though this is less common than on a numbered event.`,
    howItWorks: `Fight Nights allow the UFC to run events at a much higher frequency than its numbered cards would alone, giving more of the roster regular opportunities to compete across a calendar year.`,
    example: `A Fight Night card might feature a high-profile main event between two ranked contenders without a title at stake, broadcast to subscribers without a separate purchase, unlike a numbered pay-per-view event.`,
    whyItMatters: `The Fight Night series is a large part of how often the UFC is able to put fighters on cards, and understanding it clarifies why "the UFC has an event this weekend" doesn't necessarily mean a numbered, marquee card.`,
    misunderstandings: `A common one: assuming Fight Night cards are minor or exhibition-style events. They are full, official UFC events with normal stakes for the fighters' records and rankings, simply distributed differently than the promotion's flagship numbered cards.`,
    takeaways: `UFC Fight Night is the promotion's higher-frequency event series, generally without a pay-per-view requirement, run alongside its less frequent numbered flagship events.`,
    related: ['numbered-ufc-event', 'pay-per-view-explained', 'ufc-apex-explained'],
  }),

  standard({
    slug: 'pay-per-view-explained',
    title: 'Pay-Per-View Explained',
    category: 'mma-events',
    aliases: ['ppv mma', 'what is pay per view', 'ppv explained mma'],
    summary:
      'A broadcast model requiring a separate purchase to watch an event, typically used for a promotion’s biggest cards.',
    difficulty: 'beginner',
    readMinutes: 3,
    explanation: `**Pay-per-view (PPV)** is a broadcast model in which viewers pay separately to watch a specific event, rather than the event being included in a standard broadcast or subscription package. In MMA, pay-per-view has historically been used for a promotion's biggest, most marquee cards, since it allows a promotion to charge a premium for its most in-demand events.`,
    howItWorks: `Exactly how pay-per-view is delivered and priced has changed over time and differs by promotion and by broadcasting partner, including a shift in some markets toward bundling pay-per-view access within a broader streaming subscription rather than a fully separate one-off purchase.`,
    example: `A numbered UFC event carrying multiple title fights might be sold as a pay-per-view, requiring an additional purchase beyond a viewer's regular streaming subscription, while a Fight Night the same month is included in that subscription with no extra cost.`,
    whyItMatters: `Understanding pay-per-view explains why some of the sport's biggest cards come with an additional cost to viewers, and why that has historically been one of the largest single sources of revenue for major promotions and for the fighters on those specific cards.`,
    misunderstandings: `A common one: assuming pay-per-view pricing and structure is fixed and identical across all promotions and all time periods. Exact arrangements have varied and continue to change as streaming distribution evolves.`,
    takeaways: `Pay-per-view requires a separate purchase for a specific event and has traditionally been reserved for a promotion's biggest cards, though exact arrangements vary and have shifted over time.`,
    related: ['numbered-ufc-event', 'ufc-fight-night', 'fight-card-explained'],
  }),

  standard({
    slug: 'fight-week',
    title: 'Fight Week',
    category: 'mma-events',
    aliases: ['fight week mma', 'what happens during fight week', 'ufc fight week schedule'],
    summary:
      'The final week before an event, packed with media, weigh-ins and final preparation for every fighter on the card.',
    difficulty: 'beginner',
    readMinutes: 3,
    explanation: `**Fight week** is the final week leading up to an event, when fighters typically arrive at the host city and the promotion runs its media and promotional schedule: press conferences, media day interviews, the ceremonial and official weigh-ins, and the face-offs between opponents, all before the fights themselves take place.`,
    howItWorks: `For most fighters, fight week is the tail end of a weight cut that has been underway for longer, culminating in the official weigh-in, after which they focus on rehydrating and resting ahead of fight night itself.`,
    example: `A fighter arrives in the host city several days before the event, completes media obligations, attends the ceremonial weigh-in and face-off, makes weight at the official weigh-in the day before the event, and then spends fight day resting and rehydrating before competing that night.`,
    whyItMatters: `Fight week is when a fight's promotion and buildup peaks, and it's also when the practical risk of a fight falling through, from a missed weight or a late injury, is at its highest.`,
    misunderstandings: `A common one: assuming a fighter's fight-week media and promotional obligations are a minor part of the job. For many fighters, fight week is demanding in its own right, on top of finishing a weight cut, precisely because of how much attention it involves.`,
    takeaways: `Fight week is the final stretch before an event: promotional obligations, weigh-ins, and the finishing stages of a fighter's weight cut, all in the days immediately before competing.`,
    related: ['official-weigh-in', 'ceremonial-weigh-in', 'face-off', 'press-conference'],
  }),

  definition({
    slug: 'ceremonial-weigh-in',
    title: 'Ceremonial Weigh-In',
    category: 'mma-events',
    aliases: ['ceremonial weigh in mma', 'public weigh in', 'what is the ceremonial weigh-in'],
    summary:
      'A public weigh-in event held for fans and media, separate from the official, commission-recorded weigh-in.',
    difficulty: 'beginner',
    readMinutes: 2,
    explanation: `The **ceremonial weigh-in** is a public event, often held in front of a live audience and broadcast for fans, where fighters step on the scale for show. It is separate from the **official weigh-in**, the one actually recorded by the athletic commission that determines whether a fighter has made weight for the bout.`,
    example: `A fighter might step on stage at a ceremonial weigh-in the evening before an event, posing for the crowd and cameras, with the officially recorded weigh-in having already taken place, or taking place separately, under the commission's own supervision.`,
    misunderstandings: `A common one: assuming the ceremonial weigh-in is the one that determines whether a fighter has made weight. That determination comes from the official weigh-in; the ceremonial version is primarily a promotional event for fans and media.`,
    related: ['official-weigh-in', 'face-off', 'fight-week'],
  }),

  standard({
    slug: 'official-weigh-in',
    title: 'Official Weigh-In',
    category: 'mma-events',
    alsoIn: ['weight-cutting'],
    aliases: ['official weigh in mma', 'commission weigh in', 'what is the official weigh-in'],
    summary:
      'The commission-supervised weigh-in that determines whether each fighter has made the contracted weight.',
    difficulty: 'beginner',
    readMinutes: 3,
    explanation: `The **official weigh-in** is the weigh-in supervised by the relevant athletic commission (or the promotion's own equivalent process, where no commission is involved) that determines whether each fighter has made the weight required for their bout. It usually takes place the day before the event, giving fighters time to rehydrate before competing.`,
    howItWorks: `Each fighter steps on a certified scale under commission supervision, with the reading officially recorded. A fighter who comes in over the contracted limit is typically given a short additional window to lose the remaining weight; failing that, they may be fined a percentage of their purse, and depending on how far over they are and the promotion's rules, the fight may be renegotiated at catchweight or, in serious cases, cancelled.`,
    example: `A fighter steps on the scale at the official weigh-in and is recorded at the contracted limit for their division, clearing them to compete. Another fighter on the same card comes in slightly over the limit and is given a short window to cut the remaining weight before being reweighed.`,
    whyItMatters: `The official weigh-in is the actual regulatory checkpoint behind weight-class fairness: it's the moment a division's weight limit stops being a number on paper and becomes an enforced condition of the fight going ahead as contracted.`,
    misunderstandings: `A common one: confusing the official weigh-in with the ceremonial weigh-in fans see broadcast for entertainment. The official version, sometimes held with less fanfare, is the one with actual regulatory consequences.`,
    takeaways: `The official weigh-in is the commission-recorded check that a fighter has made weight, with real consequences, fines, catchweight renegotiation, or cancellation, if they haven't.`,
    related: ['ceremonial-weigh-in', 'why-fighters-pull-out', 'catchweight-matchmaking'],
  }),

  definition({
    slug: 'face-off',
    title: 'Face-Off',
    category: 'mma-events',
    aliases: ['face off mma', 'staredown mma', 'what is a face-off'],
    summary:
      'The staged staredown between two fighters, usually held at the weigh-in or a press conference.',
    difficulty: 'beginner',
    readMinutes: 1,
    explanation: `A **face-off** is a staged moment, typically at a weigh-in or press conference, where two fighters stand close together and stare each other down for photographers and cameras. It is a promotional tradition rather than a rule-governed part of the event, intended to build anticipation for the fight.`,
    example: `After both fighters are confirmed to have made weight, they are brought together on stage for a face-off, standing close and maintaining eye contact for a period while photographers capture the moment, before being separated.`,
    misunderstandings: `A common one: reading unusual intensity or hostility in a face-off as a reliable predictor of how the actual fight will go. It is a promotional moment, and how a fighter behaves in it says little that reliably predicts what happens once the fight starts.`,
    related: ['ceremonial-weigh-in', 'press-conference', 'fight-week'],
  }),

  definition({
    slug: 'press-conference',
    title: 'Press Conference',
    category: 'mma-events',
    aliases: [
      'fight press conference',
      'ufc press conference',
      'what happens at a press conference',
    ],
    summary:
      'A media event where fighters and promotion officials answer questions ahead of an event.',
    difficulty: 'beginner',
    readMinutes: 1,
    explanation: `A **press conference** is a media event held ahead of a fight card, where fighters (particularly those on the main card or in the main event) and promotion officials take questions from journalists. It is one of several fight-week promotional obligations, alongside media day and the weigh-ins, intended to build interest in the event.`,
    example: `Ahead of a major card, the promotion holds a press conference where the main event fighters sit alongside promotion officials and answer questions from assembled media about the upcoming fight.`,
    misunderstandings: `A common one: assuming everything said in a press conference reflects a fighter's genuine assessment of the matchup. Some of what's said is calculated promotion rather than a fighter's honest prediction, and it's worth reading it with that in mind.`,
    related: ['face-off', 'fight-week'],
  }),

  // ─── UFC ────────────────────────────────────────────────────────────────────

  promotion({
    slug: 'ufc-explained',
    title: 'UFC Explained',
    category: 'ufc',
    aliases: ['ufc explained', 'what is the ufc', 'ultimate fighting championship explained'],
    summary: 'The largest and most widely watched MMA promotion in the world.',
    isFeatured: true,
    difficulty: 'beginner',
    readMinutes: 3,
    sourceKeys: [{ key: 'wp-ufc-2' }],
    explanation: `The **UFC (Ultimate Fighting Championship)** is the largest and most widely watched MMA promotion in the world, running the deepest rankings across the greatest number of weight divisions and generally regarded as having the strongest overall roster in the sport. It is one promotion within MMA, not the sport itself, a distinction covered in "MMA vs UFC".`,
    howItWorks: `The UFC signs its own roster of fighters, maintains its own divisional rankings, crowns its own champions, and runs its own calendar of events, from frequent Fight Night cards to its flagship numbered pay-per-view events. It also runs its own developmental and promotional programmes, including Dana White's Contender Series and, historically, The Ultimate Fighter, as pathways for fighters to join the roster.`,
    whyItMatters: `Because of its scale and visibility, the UFC functions as the sport's most widely recognised reference point for the general public, even though championships, rankings and rosters in other promotions are entirely separate and equally legitimate within their own organisations.`,
    misunderstandings: `A common one: treating "UFC" and "MMA" as interchangeable terms. The UFC is the largest single promotion in the sport, not the sport as a whole; see "MMA vs UFC" for the full distinction.`,
    related: ['mma-vs-ufc', 'ufc-vs-pfl-vs-one-championship', 'ufc-divisions', 'ufc-championships'],
  }),

  standard({
    slug: 'ufc-divisions',
    title: 'UFC Divisions',
    category: 'ufc',
    alsoIn: ['weight-classes'],
    aliases: ['ufc weight classes', 'ufc divisions list', 'ufc weight divisions'],
    summary: 'The specific set of men’s and women’s weight divisions the UFC currently runs.',
    difficulty: 'beginner',
    readMinutes: 3,
    explanation: `The UFC organises its roster into a specific set of weight divisions, separately for men and women. On the men's side, this generally spans from flyweight up through heavyweight; on the women's side, the UFC has historically run a smaller number of divisions than the men's side, reflecting differences in roster depth across the sport more broadly rather than any rule limiting how many divisions could exist.`,
    howItWorks: `Each division carries its own champion, its own set of ranked contenders, and its own specific weight limit, set by the UFC itself rather than by any single sport-wide body; other promotions can and do use different limits for divisions of the same name.`,
    example: `A fighter moving up from one UFC division to the next heavier one is described as "moving up in weight", and is typically judged on how their skill set, and specifically their size and durability, translate against the larger fighters in the new division.`,
    whyItMatters: `Knowing the UFC's specific division structure is necessary context for reading its rankings and its title picture, since a division's depth and competitiveness varies considerably across the roster.`,
    misunderstandings: `A common one: assuming the UFC's specific divisions and weight limits are a universal MMA standard. They are the UFC's own structure; other promotions define their own divisions, which don't always match the UFC's exactly.`,
    takeaways: `The UFC runs a defined set of men's and women's divisions with its own weight limits, distinct from, though broadly similar to, divisions used elsewhere in the sport.`,
    related: ['mma-weight-classes-explained', 'ufc-championships', 'ufc-explained'],
  }),

  standard({
    slug: 'ufc-championships',
    title: 'UFC Championships',
    category: 'ufc',
    alsoIn: ['championships'],
    aliases: ['ufc titles', 'ufc championships list', 'ufc belts'],
    summary:
      'The UFC’s own set of divisional titles, each contested and defended within the promotion’s own roster.',
    difficulty: 'beginner',
    readMinutes: 3,
    explanation: `**UFC championships** are the promotion's own titles, one for each of its weight divisions, contested and defended entirely within the UFC's own roster. Winning a UFC title carries particular prestige within the sport, largely a function of the depth and quality of competition the UFC's rosters are generally regarded as having at most weights.`,
    howItWorks: `A UFC title works the same way as a championship in any other promotion: a champion defends it against ranked challengers, and the belt can become vacant, interim, or stripped under the same general circumstances covered in the Championships category, just applied specifically within the UFC's own divisional structure.`,
    example: `A UFC divisional champion successfully defends their title against the promotion's number-one-ranked contender, extending their reign within that specific division of the UFC's roster.`,
    whyItMatters: `Because of the UFC's scale, its titles are often treated in general sports media as a shorthand for "the" championship in a weight class across the sport, even though titles in other promotions are entirely separate and legitimate in their own right.`,
    misunderstandings: `A common one: treating a UFC title as automatically superior in some formal sense to a championship in another promotion. It reflects the UFC's roster depth and visibility rather than any formal, sport-wide hierarchy of championships.`,
    takeaways: `A UFC championship is a title within the UFC's own divisional structure, working the same way any promotion's title does, distinguished mainly by the roster depth behind it.`,
    related: ['how-mma-championships-work', 'undisputed-champion', 'ufc-divisions'],
  }),

  standard({
    slug: 'ufc-fight-cards',
    title: 'UFC Fight Cards',
    category: 'ufc',
    alsoIn: ['mma-events'],
    aliases: ['ufc fight cards', 'ufc card structure', 'how ufc events are structured'],
    summary:
      'The UFC’s specific application of the general fight-card structure, across its numbered and Fight Night event series.',
    difficulty: 'beginner',
    readMinutes: 3,
    explanation: `**UFC fight cards** follow the same general structure covered in "Fight Card Explained" and "How an MMA Event Works": early prelims, preliminary card, and main card, building to a co-main event and main event, applied across the UFC's two main event tiers, its flagship numbered events and its more frequent Fight Night series.`,
    howItWorks: `The exact size and platform split of a UFC card varies by event, but the promotion consistently uses this same tiered structure whether the card is a major numbered pay-per-view or a standard Fight Night, giving fans a predictable format regardless of the event's overall scale.`,
    example: `A UFC numbered event might run early prelims online, preliminary card fights on a streaming platform, and the main card on the primary pay-per-view broadcast, the same basic structure a smaller Fight Night card uses, just with a bigger overall lineup and pay-per-view pricing attached.`,
    whyItMatters: `Recognising that the UFC applies one consistent card structure across very different scales of event helps a fan know roughly what to expect from any UFC broadcast, regardless of whether it is a numbered flagship card or a routine Fight Night.`,
    misunderstandings: `A common one: assuming a Fight Night card structure differs fundamentally from a numbered event's. The tiered early-prelims-to-main-event structure is the same; what differs is the scale, the pay-per-view status, and typically the calibre of the fighters involved.`,
    takeaways: `The UFC uses the same early-prelims/prelims/main-card structure across both its numbered flagship events and its more frequent Fight Night series.`,
    related: ['how-an-mma-event-works', 'numbered-ufc-event', 'ufc-fight-night'],
  }),

  standard({
    slug: 'ufc-performance-bonuses',
    title: 'UFC Performance Bonuses',
    category: 'ufc',
    aliases: ['ufc bonuses', 'fight night bonuses', 'performance bonuses explained'],
    summary:
      'Discretionary bonuses the UFC awards after each event for standout fights and performances.',
    difficulty: 'beginner',
    readMinutes: 3,
    explanation: `The UFC awards **performance bonuses** after most of its events, additional payments on top of a fighter's contracted purse, given at the promotion's discretion for standout fights or performances on that specific card. The two most commonly cited categories are **Fight of the Night** and **Performance of the Night**.`,
    howItWorks: `Bonuses are decided by the UFC itself after the card has concluded, based on which fights or individual performances stood out that night; there is no fixed public formula for the decision, and the specific amount awarded is a matter the promotion has changed and structured differently at different points, so no single figure should be treated as a fixed, current standard.`,
    whyItMatters: `Performance bonuses give fighters, including those lower on the card without a title on the line, a meaningful additional incentive to perform in an exciting or decisive way, beyond simply winning or losing.`,
    misunderstandings: `A common one: assuming a fighter's bonus history is public, precisely documented, and consistent across every era of the promotion. Bonus structures and amounts have changed over time, and treating any specific figure as universally fixed and current risks being wrong.`,
    related: ['fight-of-the-night', 'performance-of-the-night', 'ufc-explained'],
  }),

  definition({
    slug: 'fight-of-the-night',
    title: 'Fight of the Night',
    category: 'ufc',
    aliases: ['fight of the night bonus', 'fotn', 'what is fight of the night'],
    summary:
      'A UFC bonus awarded to both fighters in the event’s most exciting or competitive bout.',
    difficulty: 'beginner',
    readMinutes: 1,
    explanation: `**Fight of the Night** is a UFC performance bonus awarded to both fighters in the single bout on the card judged to have been the most exciting or competitive, regardless of who won. Because it's awarded to both participants, it recognises the quality of the fight itself rather than an individual fighter's performance.`,
    example: `A closely contested, back-and-forth fight full of exchanges might be selected as Fight of the Night, with both the winner and the loser receiving the bonus, since the award recognises the bout as a whole.`,
    misunderstandings: `A common one: assuming Fight of the Night only goes to the winner. It is awarded to both fighters who competed in the selected bout, win or lose.`,
    related: ['ufc-performance-bonuses', 'performance-of-the-night'],
  }),

  definition({
    slug: 'performance-of-the-night',
    title: 'Performance of the Night',
    category: 'ufc',
    aliases: ['performance of the night bonus', 'potn', 'what is performance of the night'],
    summary:
      'A UFC bonus awarded to one or more individual fighters for a standout performance on the card.',
    difficulty: 'beginner',
    readMinutes: 1,
    explanation: `**Performance of the Night** is a UFC bonus awarded to an individual fighter (occasionally more than one, on the same card) for a standout performance, most often a particularly impressive or decisive finish, rather than for the overall quality of a competitive back-and-forth fight.`,
    example: `A fighter who scores a fast, highlight-reel finish might be awarded Performance of the Night, while the fighter they beat receives nothing from that specific bonus, unlike Fight of the Night, which is shared by both fighters in the selected bout.`,
    misunderstandings: `A common one: confusing Performance of the Night with Fight of the Night. The former recognises an individual fighter's performance; the latter recognises a single bout as a whole, shared by both fighters in it.`,
    related: ['ufc-performance-bonuses', 'fight-of-the-night'],
  }),

  standard({
    slug: 'ufc-apex-explained',
    title: 'UFC Apex Explained',
    category: 'ufc',
    aliases: ['ufc apex', 'what is the ufc apex', 'ufc apex facility'],
    summary:
      'The UFC’s dedicated production facility in Las Vegas, used to host a large share of its Fight Night cards.',
    difficulty: 'beginner',
    readMinutes: 3,
    sourceKeys: [{ key: 'wp-ufc-apex' }],
    explanation: `The **UFC Apex** is a dedicated production facility built by the UFC in Las Vegas, used to host a significant share of its Fight Night events without needing to book a separate arena for each one. It gives the promotion a consistent, purpose-built venue it fully controls for its own production needs.`,
    howItWorks: `Because the UFC owns and operates the facility directly, it can schedule and produce events there with a level of consistency and frequency that would be harder to achieve booking a different arena, in a different city, for every card.`,
    example: `A Fight Night card might be held at the UFC Apex rather than a traditional arena, with a smaller, more intimate crowd setting compared to the promotion's larger numbered events, which are more often held at major arenas.`,
    whyItMatters: `The Apex is a significant part of how the UFC is able to run such a high volume of Fight Night events across a calendar year, since it removes much of the logistical overhead of booking a new venue for every card.`,
    misunderstandings: `A common one: assuming every UFC event is held at the Apex. Numbered flagship events and many larger Fight Nights are still held at major arenas around the world; the Apex is used specifically for a substantial portion of the promotion's more frequent Fight Night cards.`,
    takeaways: `The UFC Apex is a dedicated, promotion-owned production facility in Las Vegas that hosts a large share of the UFC's Fight Night events, distinct from the traditional arenas used for its bigger cards.`,
    related: ['ufc-fight-night', 'ufc-explained', 'ufc-performance-institute'],
  }),

  standard({
    slug: 'contender-series-explained',
    title: 'Contender Series Explained',
    category: 'ufc',
    alsoIn: ['career-path'],
    aliases: [
      "dana white's contender series",
      'contender series explained',
      'how to get signed to the ufc through contender series',
    ],
    summary:
      'A televised UFC showcase where standout winners can be offered a UFC contract on the spot.',
    difficulty: 'beginner',
    readMinutes: 3,
    sourceKeys: [{ key: 'wp-contender-series' }],
    explanation: `**Dana White's Contender Series** is a televised UFC showcase in which fighters from outside the promotion's roster compete for the chance to earn a UFC contract. A standout performance, typically a decisive win, can lead to a fighter being offered a contract immediately after their bout, providing a visible, direct route onto the roster outside of the promotion's usual scouting and signing process.`,
    howItWorks: `Fighters on the series are generally sourced from the broader MMA landscape, including strong records in smaller and regional promotions, and are matched against each other on a dedicated card format distinct from a normal UFC event, with contract offers decided afterward based on how a fighter performed.`,
    example: `A fighter competing on the regional circuit with an impressive record might be invited to compete on the series, and a dominant, exciting win there can lead directly to a UFC contract offer, fast-tracking a step that might otherwise take considerably longer through ordinary promotional visibility.`,
    whyItMatters: `The series gives fighters without an existing high profile a direct, visible path onto the UFC roster, based specifically on how they perform on the night rather than on existing reputation or record alone.`,
    misunderstandings: `A common one: assuming every fighter who competes on the series receives a contract. Only standout performances typically earn one; competing on the show is an opportunity, not a guarantee.`,
    takeaways: `Dana White's Contender Series offers a direct path onto the UFC roster through a standout showcase performance, judged fight by fight rather than by pre-existing reputation.`,
    related: ['the-ultimate-fighter-explained', 'ufc-explained'],
  }),

  standard({
    slug: 'the-ultimate-fighter-explained',
    title: 'The Ultimate Fighter Explained',
    category: 'ufc',
    aliases: ['the ultimate fighter', 'tuf explained', 'what is the ultimate fighter show'],
    summary:
      'The UFC’s long-running reality competition show, historically significant to the promotion’s growth.',
    difficulty: 'beginner',
    readMinutes: 3,
    sourceKeys: [{ key: 'wp-tuf' }],
    explanation: `**The Ultimate Fighter** is the UFC's reality competition television show, which debuted in 2005 on Spike TV. It has typically featured a cast of fighters living and training together, divided into teams coached by established UFC fighters, competing across the season for a UFC contract, with eliminations decided by fights contested within the show itself.`,
    howItWorks: `The show combines a reality-television format, following the competing fighters' training and daily lives, with the actual eliminations decided by real fights, before culminating in a finale event where the season's finalists compete for the contract on offer.`,
    example: `Two fighters selected for opposing teams train separately under their respective coaches for several weeks before facing each other in an elimination bout broadcast as part of the season, with the winner advancing and the loser eliminated from that season's competition.`,
    whyItMatters: `The Ultimate Fighter is widely regarded as a turning point in the UFC's history: its 2005 debut on Spike TV is generally credited with playing a major role in growing the promotion's mainstream audience and commercial success in the United States during a critical period for the sport.`,
    misunderstandings: `A common one: assuming The Ultimate Fighter functions today exactly as it did at its 2005 debut. The show's format and role in the promotion's talent pipeline have evolved over its long run, even as its basic reality-competition structure has remained recognisable.`,
    takeaways: `The Ultimate Fighter, debuting in 2005 on Spike TV, combined reality television with real UFC contract stakes and is widely regarded as historically significant to the promotion's growth.`,
    related: ['contender-series-explained', 'ufc-explained'],
  }),

  standard({
    slug: 'ufc-hall-of-fame',
    title: 'UFC Hall of Fame',
    category: 'ufc',
    aliases: ['ufc hall of fame', 'ufc hof', 'what is the ufc hall of fame'],
    summary:
      'The UFC’s formal recognition of fighters and other figures judged to have made a lasting impact on the promotion.',
    difficulty: 'beginner',
    readMinutes: 2,
    explanation: `The **UFC Hall of Fame** is the promotion's own formal recognition of fighters, and in some cases other significant figures, judged to have made a lasting impact on the UFC and the sport more broadly. Induction is an honour bestowed by the promotion itself rather than by any independent or sport-wide body.`,
    howItWorks: `Inductees are typically recognised at a dedicated event, often around a major fight week, and the Hall of Fame has been organised over time into different categories reflecting different kinds of contribution, though the exact structure has evolved as the Hall itself has grown.`,
    example: `A fighter with a long, accomplished UFC career, including notable title reigns or historically significant fights, might be inducted into the Hall of Fame some years after retiring, in recognition of their overall career impact on the promotion.`,
    whyItMatters: `Hall of Fame induction is one of the clearest ways the UFC itself formally marks a fighter's legacy, separate from statistical achievements like title reigns or win totals.`,
    misunderstandings: `A common one: assuming the UFC Hall of Fame is a sport-wide honour covering MMA as a whole. It specifically recognises contributions to the UFC; other promotions and independent bodies may recognise fighters through their own separate means.`,
    takeaways: `The UFC Hall of Fame is the promotion's own way of formally recognising fighters and contributors judged to have had a lasting impact on the UFC specifically.`,
    related: ['ufc-explained', 'former-champion'],
  }),

  standard({
    slug: 'ufc-performance-institute',
    title: 'UFC Performance Institute',
    category: 'ufc',
    aliases: ['ufc pi', 'performance institute mma', 'what is the ufc performance institute'],
    summary: 'The UFC’s sports-science and training facility, available to fighters on its roster.',
    difficulty: 'beginner',
    readMinutes: 3,
    explanation: `The **UFC Performance Institute** is a dedicated sports-science and training facility operated by the UFC, offering fighters on its roster access to coaching, medical and performance-science resources, including areas such as strength and conditioning, nutrition, and injury recovery, that many fighters would not otherwise have consistent access to on their own.`,
    howItWorks: `Fighters on the UFC roster can use the Performance Institute's resources as part of preparing for a fight or recovering from one, supplementing the training they already do with their own regular coaches and gyms rather than replacing it.`,
    example: `A fighter preparing for an upcoming bout might spend part of their training camp at the Performance Institute, working with its staff on conditioning or recovery, alongside the striking and grappling training done at their primary gym.`,
    whyItMatters: `The Performance Institute reflects a broader trend in the sport toward more structured, sports-science-informed preparation, made available here specifically to fighters on the UFC's own roster.`,
    misunderstandings: `A common one: assuming the Performance Institute replaces a fighter's usual gym and coaching team. It is generally used as a supplementary resource alongside a fighter's existing training setup, not a substitute for it.`,
    takeaways: `The UFC Performance Institute gives roster fighters access to dedicated sports-science and training resources, used alongside, not instead of, their regular coaching and gym.`,
    related: ['ufc-apex-explained', 'ufc-explained'],
  }),

  // ─── Other Promotions ───────────────────────────────────────────────────────

  promotion({
    slug: 'pfl-explained',
    title: 'PFL Explained',
    category: 'other-promotions',
    aliases: ['pfl explained', 'what is pfl', 'professional fighters league explained'],
    summary:
      'A promotion built around a regular-season-and-playoff format, unusual in a sport otherwise built around single-card events.',
    isFeatured: true,
    difficulty: 'beginner',
    readMinutes: 3,
    sourceKeys: [{ key: 'wp-pfl-2' }],
    explanation: `The **Professional Fighters League (PFL)** is an MMA promotion built around a regular-season-and-playoff competition format, closer to a conventional sports league's structure than to the single-card, title-defence model most other MMA promotions use. Fighters compete across a regular season, then a playoff bracket, working toward a season championship in their weight class.`,
    howItWorks: `Within the PFL's competitive format, fighters earn points across their regular-season bouts, with the strongest performers in each weight class advancing to the playoffs, and ultimately a final, to determine that season's champion. The PFL also acquired Bellator MMA's roster in 2023–24, folding Bellator's fighters into the PFL rather than continuing Bellator as a separately run promotion.`,
    whyItMatters: `PFL's format gives it a genuinely distinct identity within MMA: it answers "who is this season's best fighter in this weight class" through an actual season structure, rather than through an open-ended series of title defenses the way most other promotions operate.`,
    misunderstandings: `A common one: assuming PFL operates the same single-card, ongoing-title-defense model as the UFC or ONE Championship. Its season-and-playoff format is a genuinely different competitive structure, not simply a smaller version of the more common promotional model.`,
    related: [
      'ufc-vs-pfl-vs-one-championship',
      'tournament-style-mma-formats',
      'regional-mma-promotions',
    ],
  }),

  promotion({
    slug: 'one-championship-explained',
    title: 'ONE Championship Explained',
    category: 'other-promotions',
    aliases: ['one championship explained', 'what is one championship', 'one fc explained'],
    summary:
      'A Singapore-based promotion and the leading MMA organisation across much of Asia, also promoting kickboxing and Muay Thai.',
    isFeatured: true,
    difficulty: 'beginner',
    readMinutes: 3,
    sourceKeys: [{ key: 'wp-one-2' }],
    explanation: `**ONE Championship** is a promotion based in Singapore and generally regarded as the leading MMA organisation across much of Asia. Alongside MMA, ONE also promotes kickboxing and Muay Thai events, giving it a broader combat-sports footprint than promotions that run MMA exclusively.`,
    howItWorks: `ONE builds individual matchups and title fights within its own divisional and championship structure, broadly similar in shape to the UFC's model, while drawing much of its roster and audience from across Asia specifically, alongside fighters from elsewhere in the world.`,
    whyItMatters: `ONE Championship's scale and regional prominence make it one of the sport's genuinely major promotions outside the UFC, and its multi-discipline promotion of MMA alongside kickboxing and Muay Thai gives it a broader combat-sports identity than most single-discipline MMA promotions.`,
    misunderstandings: `A common one: assuming ONE Championship is a purely regional or minor promotion because it is based outside the United States. It is one of the sport's larger organisations by roster size and reach, particularly prominent across Asia.`,
    related: ['ufc-vs-pfl-vs-one-championship', 'cage-vs-ring-mma', 'regional-mma-promotions'],
  }),

  promotion({
    slug: 'rizin-explained',
    title: 'Rizin Explained',
    category: 'other-promotions',
    aliases: ['rizin explained', 'what is rizin', 'rizin fighting federation explained'],
    summary:
      'A Japan-based promotion continuing the country’s long tradition of hybrid fighting events.',
    difficulty: 'beginner',
    readMinutes: 3,
    sourceKeys: [{ key: 'wp-rizin' }],
    explanation: `**Rizin Fighting Federation** is a promotion based in Japan, continuing a long-running Japanese tradition of hybrid fighting promotions that stretches back to organisations such as Pancrase and Shooto in the 1990s. Rizin runs MMA events and has also featured kickboxing bouts on some of its cards, reflecting that same hybrid promotional tradition.`,
    howItWorks: `Rizin builds its cards around individual matchups, and has also made occasional use of tournament-style formats for some events, a format with deep historical roots in Japanese MMA promotion going back to the sport's earliest years in the country.`,
    whyItMatters: `Rizin represents the continuation of Japan's historically significant role in the sport's early development and popularisation, at a time when much of MMA's global audience and biggest events are concentrated elsewhere.`,
    misunderstandings: `A common one: assuming Rizin is a new or recent entrant to MMA promotion. It continues a Japanese hybrid-promotion tradition with roots going back to the 1990s, even though Rizin itself as an organisation is more recent than that broader tradition.`,
    related: [
      'ufc-vs-pfl-vs-one-championship',
      'tournament-style-mma-formats',
      'regional-mma-promotions',
    ],
  }),

  standard({
    slug: 'regional-mma-promotions',
    title: 'Regional MMA Promotions',
    category: 'other-promotions',
    aliases: ['regional mma promotions', 'smaller mma promotions', 'local mma organisations'],
    summary:
      'Smaller, often country- or region-specific promotions that make up much of the sport’s overall structure below its largest organisations.',
    difficulty: 'beginner',
    readMinutes: 3,
    explanation: `**Regional MMA promotions** are smaller organisations, often based in a single country or region, that run events below the scale of the sport's largest global promotions. They make up a large part of the overall structure of professional MMA, and are frequently where fighters build the early records that eventually earn them opportunities with larger organisations.`,
    howItWorks: `A regional promotion typically operates with its own rosters, its own rankings and titles specific to that organisation, and often its own approach to rules within the bounds of what its local athletic commission, where one exists, allows.`,
    example: `A fighter might build a winning record across several regional promotions in their home country before being scouted or invited to a larger stage, such as a showcase like Dana White's Contender Series, as a pathway toward a contract with a major promotion.`,
    whyItMatters: `Regional promotions are a large part of how new talent enters the sport, and appreciating their role helps put the pathway of most professional fighters' careers in proper context, rather than assuming top fighters arrive on the largest stages fully formed.`,
    misunderstandings: `A common one: assuming a title from a regional promotion is not a "real" championship. It is a legitimate title within that specific organisation, even though its overall competitive depth and profile will generally be smaller than one of the sport's largest promotions.`,
    takeaways: `Regional promotions form much of the sport's overall structure and are a common early step in many professional fighters' career paths toward larger organisations.`,
    related: ['pfl-explained', 'contender-series-explained', 'different-mma-rule-sets'],
  }),

  standard({
    slug: 'cage-vs-ring-mma',
    title: 'Cage vs Ring MMA',
    category: 'other-promotions',
    aliases: ['cage vs ring mma', 'does mma use a cage or a ring', 'octagon vs ring'],
    summary:
      'Most MMA promotions compete in a cage, though some, including ONE Championship, use a ring instead.',
    difficulty: 'beginner',
    readMinutes: 3,
    explanation: `Most major MMA promotions, including the UFC, compete in a **cage**, an enclosed structure (the UFC's specific version is commonly called the **Octagon**) with fencing around the fighting area. Some promotions, including **ONE Championship**, instead use a **ring**, similar in structure to the ropes-and-corner-posts setup used in boxing.`,
    howItWorks: `The practical difference lies mainly in how a fighter can use the boundary: a cage's fencing allows fighters to use it to maintain balance, resist a takedown, or work back to their feet by pushing against it, an option a ring's ropes handle differently, since a ring more readily allows a fighter to fall or be pushed through or over the ropes if contact happens near the edge.`,
    example: `A fighter defending a takedown attempt near the boundary might use a cage's fencing to post against and maintain their balance, an option available specifically because of the cage's solid structure, rather than the give of a ring's ropes.`,
    whyItMatters: `Cage versus ring is one of the more visible structural differences between promotions, and it has genuine tactical implications for how fighters use the boundary of the fighting area during a bout, beyond simply being an aesthetic choice.`,
    misunderstandings: `A common one: assuming the choice between a cage and a ring reflects a difference in the underlying rules of the sport itself. It is a structural and promotional choice, and the two setups can be used under otherwise very similar rulesets.`,
    takeaways: `A cage and a ring lead to genuinely different tactical options near the boundary, even though both are used to contest the same sport under broadly similar rules.`,
    related: ['one-championship-explained', 'ufc-explained', 'different-mma-rule-sets'],
  }),

  rulesetConcept({
    slug: 'different-mma-rule-sets',
    title: 'Different MMA Rule Sets',
    category: 'other-promotions',
    alsoIn: ['start-here'],
    aliases: [
      'different mma rules by promotion',
      'do all mma promotions use the same rules',
      'mma rule variations',
    ],
    summary:
      'Most major promotions use rules closely modelled on the Unified Rules, but specific details can still vary.',
    difficulty: 'intermediate',
    readMinutes: 3,
    recognition: `A fighter moving between promotions may find a technique that was legal in one organisation treated as a foul in another, most commonly around what strikes are permitted against a grounded opponent.`,
    explanation: `As covered in "MMA Rules Explained", most major promotions in the sport's largest markets compete under rules closely modelled on the **Unified Rules of Mixed Martial Arts**. But because the Unified Rules are adopted by individual athletic commissions rather than imposed by one single, universal governing body, a promotion operating in a jurisdiction without such a commission, or one that has adopted its own variations, can and sometimes does apply a ruleset that differs from the Unified Rules on specific points.`,
    example: `A specific technique, such as strikes against a grounded opponent under certain conditions, may be legal under one promotion's ruleset and a foul under another's, even though both organisations broadly describe their rules as closely following the Unified Rules framework.`,
    whyItMatters: `Understanding that rule variation exists between promotions explains why a fighter or commentator might describe a technique as "not allowed here" without that being a contradiction of what's allowed elsewhere in the sport.`,
    misunderstandings: `A common one: assuming every promotion competes under an identical, single global rulebook. The Unified Rules are widely adopted and provide a common baseline, but they are not literally universal or beyond promotion-specific variation.`,
    related: ['mma-rules-explained', 'cage-vs-ring-mma', 'regional-mma-promotions'],
  }),

  standard({
    slug: 'tournament-style-mma-formats',
    title: 'Tournament-Style MMA Formats',
    category: 'other-promotions',
    aliases: ['mma tournament format', 'tournament mma events', 'bracket style mma'],
    summary:
      'A format where fighters compete in a bracket over one or more events, historically significant and still used by some promotions today.',
    difficulty: 'intermediate',
    readMinutes: 3,
    explanation: `**Tournament-style formats**, where fighters compete in a bracket working toward an eventual winner, have a long history in MMA, going back to the sport's earliest widely known events, including the original UFC 1, which was itself structured as a single-night tournament. While the single-card, individually booked title-fight model is now the sport's dominant format, tournament structures remain in use by some promotions.`,
    howItWorks: `PFL's season format is itself a form of tournament structure, moving from a regular season into a playoff bracket toward a season champion, and Rizin has also made occasional use of tournament-style events for specific weight classes or one-off showcase events, drawing on the same historical Japanese tradition of tournament-format shows.`,
    example: `An event structured as a tournament might see four fighters in the same weight class compete in same-night bouts, with the winners of the first-round bouts advancing to fight each other later on the same card to determine the tournament champion.`,
    whyItMatters: `Recognising the tournament format's history helps explain some of the sport's earliest and most historically significant events, and shows that the now-dominant single-fight, ongoing-title-defense model is one structural choice among others the sport has used and continues to use.`,
    misunderstandings: `A common one: assuming tournament formats disappeared entirely once the single-card model became dominant. They remain in occasional use, and PFL's season-and-playoff structure is itself a modern, extended version of the same basic tournament idea.`,
    takeaways: `Tournament-style formats go back to MMA's earliest major events and remain in use today, both in PFL's season structure and in occasional tournament-style cards from other promotions.`,
    related: ['pfl-explained', 'rizin-explained', 'different-mma-rule-sets'],
  }),

  standard({
    slug: 'promotion-specific-championships',
    title: 'Promotion-Specific Championships',
    category: 'other-promotions',
    alsoIn: ['championships'],
    aliases: [
      'promotion specific titles',
      'do all mma titles mean the same thing',
      'championships belong to promotions not the sport',
    ],
    summary:
      'Every MMA championship belongs to one promotion’s own divisional structure, not to the sport as a whole.',
    difficulty: 'beginner',
    readMinutes: 3,
    explanation: `Every championship in MMA is a **promotion-specific title**: it belongs to one organisation's own divisional structure, contested within that promotion's own roster, and is not automatically comparable in any formal sense to a similarly named title held in a different promotion. There is no single, sport-wide governing body that crowns one universal champion per weight class across all of MMA.`,
    howItWorks: `A fighter can hold a title in one promotion, lose it or vacate it, and later compete for and win a title in a completely different promotion, with each championship existing entirely independently of the others within its own organisation's structure.`,
    example: `A fighter might simultaneously be discussed as a former champion of one promotion and, later in their career, a reigning champion of a different one, with the two titles never being formally compared or unified in any official sense.`,
    whyItMatters: `Understanding that a title only means something specific once you know which promotion it belongs to is the single most important framing for reading any championship claim across the sport, tying directly back to the distinction drawn in "MMA vs UFC" between the sport and any one promotion within it.`,
    misunderstandings: `A common one: treating a title from a smaller promotion as somehow not a "real" championship. It is a legitimate title within that promotion's own structure; its perceived weight compared to another promotion's title is a separate, informal judgement about roster depth, not a formal question of legitimacy.`,
    takeaways: `Every MMA title belongs to one promotion's own divisional structure; there is no single sport-wide championship, so any title claim only makes full sense once its promotion is specified.`,
    related: ['how-mma-championships-work', 'mma-vs-ufc', 'ufc-championships'],
  }),
];
