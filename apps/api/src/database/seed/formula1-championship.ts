import type { ExplainerSeed, TrackShape } from './explainer-types';
import {
  article,
  definition,
  format,
  rule,
  technical,
  technique,
} from './formula1-explainer-helpers';
import { CURRENT_ERA, SPORTING, TECHNICAL } from './formula1-explainers';

/**
 * The championship, points and overtaking.
 *
 * Two of the brief's categories in one file. They are unrelated subjects, but
 * each is medium-sized, and the alternative is two files that would both be
 * shorter than every other content file in the library.
 *
 * ## On points numbers
 *
 * The brief is explicit that points regulations change and that the content
 * should be versioned by season. The explainers here therefore describe the
 * *shape* of the system, twenty-five for a win on a sliding scale to tenth, and
 * carry an era note saying that the scale has been rewritten repeatedly. Where
 * a worked example needs figures, they are the current ones and are labelled as
 * such.
 *
 * This is a deliberate exception to the library's usual avoidance of numbers.
 * A points explainer that refuses to say what a win is worth is useless, so the
 * numbers appear and the era note carries the caveat.
 */

/** DRS, drawn as the two points that define it. */
const DRS_DIAGRAM: TrackShape = {
  track: 'circuit',
  caption:
    'DRS has two fixed points: a detection line where the gap is measured, and an activation zone where the wing may be opened.',
  steps: [
    {
      caption:
        'At the detection point, the car behind is measured. If it is within one second of the car ahead, it is granted DRS for the following zone.',
      note: 'Gap measured: 0.8s — within range',
      cars: [
        { id: 'a', label: 'A', lap: 26, team: 'a' },
        { id: 'b', label: 'B', lap: 22, team: 'b', highlight: true },
      ],
      markers: [{ lap: 24, label: 'Detection point', kind: 'detection' }],
    },
    {
      caption:
        'In the activation zone, the chasing car opens its rear wing, cutting drag and gaining speed on the straight. The car ahead cannot use it unless it too is within a second of somebody.',
      note: 'Wing open: ~10-15 km/h advantage',
      cars: [
        { id: 'a', label: 'A', lap: 44, team: 'a' },
        { id: 'b', label: 'B', lap: 41, team: 'b', highlight: true },
      ],
      zones: [{ from: 34, to: 52, label: 'DRS zone', kind: 'drs' }],
      markers: [{ lap: 34, label: 'Activation', kind: 'neutral' }],
    },
    {
      caption:
        'The attacking car arrives at the braking zone alongside. DRS closes automatically the moment the driver brakes.',
      note: 'Overtake attempt into the corner',
      cars: [
        { id: 'b', label: 'B', lap: 55, team: 'b', highlight: true },
        { id: 'a', label: 'A', lap: 54, team: 'a' },
      ],
      markers: [{ lap: 56, label: 'Braking zone', kind: 'apex' }],
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────────────
 * Championship and points
 * ────────────────────────────────────────────────────────────────────────── */

const CHAMPIONSHIP: ExplainerSeed[] = [
  rule({
    slug: 'points-system',
    title: 'F1 Points System Explained',
    category: 'championship',
    isStartHere: true,
    isFeatured: true,
    order: 10,
    readMinutes: 5,
    summary: 'The top ten score on a sliding scale, and the same points feed both championships.',
    oneSentence:
      'The top ten finishers score points on a sliding scale from twenty-five for a win down to one for tenth, and each driver’s points count for both their own championship and their team’s.',
    howItWorks:
      '**The scale.** Currently 25, 18, 15, 12, 10, 8, 6, 4, 2 and 1 point for the first ten finishers. Eleventh and below score nothing.\n\n**The gaps are deliberate.** The difference between first and second is larger than between second and third, and so on, so winning is worth disproportionately more than merely finishing well.\n\n**Both championships, one set of results.** A driver’s points go to their own total and to their constructor’s. A team’s total is simply both its cars added together.\n\n**Sprint races score separately**, on a much smaller scale, at the weekends that include them.\n\n**Shortened races may score less.** If a race is stopped early, a reduced scale can apply depending on how much distance was completed.',
    example:
      'A team finishing first and eleventh scores 25 constructors’ points. A team finishing third and fourth scores 27. The second team has no race winner and has had the better afternoon in the championship that pays the prize money.',
    whyItMatters:
      'The shape of the scale determines how a season is fought. Because the gap from first to second is seven points and from ninth to tenth is one, a driver contending for the title is fighting over far larger increments than a driver fighting for the final points position, and the two are effectively playing different games.',
    strategic:
      'The points scale sets the value of every risk. Defending second place is worth eighteen points; attempting a pass that might yield twenty-five but might yield nothing is a calculation teams make explicitly, and late in a championship the answer changes.',
    misunderstandings:
      '**"The points system has always been like this."** It has been rewritten many times. Earlier eras awarded far fewer points, scored fewer positions, and at times counted only a driver’s best results rather than all of them.\n\n**"A point for fastest lap."** A bonus point for the fastest lap has existed in some seasons and not others, with conditions attached. Whether it applies depends entirely on the season.',
    related: [
      'how-drivers-score-points',
      'constructors-points',
      'drivers-championship',
      'sprint-points',
      'shortened-race-points',
    ],
    era: 'The current scale awards 25 points for a win and scores the top ten. This has been revised repeatedly across the sport’s history, including systems that scored only the top six and systems that counted a limited number of a driver’s best results. A bonus point for fastest lap has applied in some seasons and not others. Always check the season in question before comparing totals across eras.',
    ...SPORTING,
  }),

  rule({
    slug: 'how-drivers-score-points',
    title: 'How Drivers Score Points',
    category: 'championship',
    order: 20,
    summary: 'Finish in the top ten, be classified, and survive the stewards.',
    oneSentence:
      'A driver scores by being classified in the top ten of a race, with points awarded on the standard scale and adjusted afterwards by any post-race penalties.',
    howItWorks:
      '**Classification is the test, not finishing.** A driver who retires late but has completed the required proportion of the distance is still classified and can still score.\n\n**Post-race penalties apply.** A time penalty added after the flag can move a driver out of the points, or into them.\n\n**Disqualification removes the score entirely.**\n\n**Sprint points are separate** and are added to the same championship total.\n\n**No points for pole.** Qualifying position pays nothing directly, though it strongly influences the race result.',
    example:
      'A driver finishes eleventh on the road. The driver who finished eighth receives a five-second time penalty applied after the race, dropping them to twelfth. Everyone below moves up, and the eleventh-placed driver scores a point they did not have at the flag.',
    whyItMatters:
      'Points are the only currency in Formula 1. Fastest laps, poles and leading laps are all recorded and none of them decide championships, which is why teams optimise for finishing position above everything else.',
    strategic:
      'The cliff at tenth place shapes the midfield. A car running eleventh has everything to gain and nothing to lose by taking a risk, while a car running tenth has the opposite incentive, and that asymmetry produces much of the racing in the middle of the field.',
    misunderstandings:
      '**"You have to finish to score."** You have to be classified, which is a lower bar.\n\n**"The result at the flag is the result."** Penalties applied afterwards routinely change who scores.',
    related: [
      'points-system',
      'race-classification',
      'time-penalty',
      'sprint-points',
      'why-every-point-matters',
    ],
    era: 'Scoring positions and the points scale have changed repeatedly. The top-ten scoring described here is current.',
    ...SPORTING,
  }),

  rule({
    slug: 'constructors-points',
    title: "Constructors' Points Explained",
    category: 'championship',
    order: 30,
    summary: 'Both cars’ points added together, which is why the second driver matters enormously.',
    oneSentence:
      'A constructor scores the sum of the points earned by both of its cars, so a team’s championship position depends as much on its second driver as on its first.',
    howItWorks:
      '**Simple addition.** No separate scale, no weighting. Both cars’ points are added.\n\n**Every position counts twice.** A team gains from moving either car up the order, and the points scale means moving a car from eleventh to tenth is worth a point that would otherwise be lost entirely.\n\n**Prize money follows it.** The commercial distribution is based substantially on constructors’ position, which makes a place in this table worth a great deal more than a place in the drivers’ table.\n\n**It rewards reliability across two cars.** A team that finishes both cars every weekend accumulates steadily against one that scores heavily and retires often.',
    example:
      'Two teams end a season with one win each. The first also has fourteen finishes outside the points; the second has two cars regularly finishing sixth and seventh. The second team finishes well ahead in the constructors’ championship and receives substantially more prize money.',
    whyItMatters:
      'It explains team behaviour that looks strange from a driver-centred view: instructing drivers not to race each other, pitting the second car to defend against a rival team, and caring intensely about tenth place. All of it follows from both cars scoring into one total that determines the team’s income.',
    strategic:
      'Because the constructors’ table pays, a team fighting for sixth place in it will make strategic sacrifices with one car to protect the other’s position. That is not favouritism; it is the arithmetic of the championship they are actually being paid for.',
    misunderstandings:
      '**"The constructors’ title is a formality that follows the drivers’ title."** They are frequently won by different teams, because two consistent cars beat one fast car and one unreliable one.',
    related: [
      'constructors-championship',
      'drivers-vs-constructors',
      'points-system',
      'prize-money',
      'team-orders',
    ],
    era: 'The scoring scale has changed repeatedly; the principle of summing both cars has not.',
    ...SPORTING,
  }),

  format({
    slug: 'drivers-championship',
    title: "Drivers' Championship Explained",
    category: 'championship',
    isStartHere: true,
    order: 40,
    summary: 'The individual title, decided by the highest points total after the final race.',
    oneSentence:
      'The drivers’ championship is won by the driver with the most points at the end of the season, with countback used to break a tie.',
    howItWorks:
      '**All races count.** Every result across the season is added together. There is no play-off, no final, and no race worth extra.\n\n**Ties are broken by countback.** The driver with more wins takes the title; if wins are level, more second places, and so on down the order.\n\n**It can be clinched early.** Once a driver’s lead exceeds the maximum their nearest rival could still score, the title is decided mathematically with races still to run.\n\n**The car is not accounted for.** The championship measures results, and results are produced by a driver and a car together.',
    example:
      'Two drivers finish level on points. The one with more race wins is champion. If they also have equal wins, the count moves to second places, and so on until the tie is broken.',
    whyItMatters:
      'Because every race counts equally and reliability is part of the sport, the drivers’ championship rewards accumulating results rather than winning spectacularly. A driver who finishes second twelve times beats one who wins six races and retires from the rest.',
    strategic:
      'Championship position changes how a driver races. A points leader defending a lead late in a season will avoid contact that a challenger will actively seek, and both are behaving rationally given what each needs.',
    misunderstandings:
      '**"The champion is the best driver."** The champion is the driver who scored the most points in the machinery available to them. Those are related and not identical, which is why team-mate comparison exists as a separate measure.\n\n**"Ties are broken by the final race."** They are broken by countback on wins and then lower positions.',
    related: [
      'constructors-championship',
      'how-ties-are-broken',
      'championship-mathematics',
      'clinching-the-championship',
      'points-system',
    ],
    era: 'Tie-break rules and the points scale have both changed over the sport’s history, and earlier eras counted only a driver’s best results rather than every race.',
    ...SPORTING,
  }),

  format({
    slug: 'constructors-championship',
    title: "Constructors' Championship Explained",
    category: 'championship',
    order: 50,
    summary: 'The team title, worth more money than the drivers’ title and often harder to win.',
    oneSentence:
      'The constructors’ championship is won by the team with the highest combined points from both its cars, and it determines how the sport’s prize money is distributed.',
    howItWorks:
      '**Both cars, one total.** Every point either car scores counts.\n\n**All races count**, as in the drivers’ championship.\n\n**Ties are broken by countback**, on the team’s best finishing positions.\n\n**It pays.** Prize money distribution depends heavily on final constructors’ position, so each place in the table is worth a substantial sum.\n\n**It also decides practical things**, historically including garage allocation and other operational privileges for the following season.',
    example:
      'A team finishing fifth rather than sixth may gain a large sum in prize money for the following year, which is why the closing races of a season feature intense battles for positions that attract little broadcast attention.',
    whyItMatters:
      'For a team, this is the championship that matters. It funds next year’s car, and under a cost cap that limits spending, prize money differences translate more directly into competitiveness than they once did.',
    strategic:
      'It is the reason for team orders, for pitting one car to protect another, and for a team caring whether its second car finishes ninth or tenth. A driver fighting a team-mate is spending resources on a contest that pays their team nothing.',
    misunderstandings:
      '**"It is just a team version of the drivers’ title."** It is the commercially significant one, and teams optimise for it in ways that sometimes cost an individual driver.',
    related: [
      'constructors-points',
      'drivers-championship',
      'drivers-vs-constructors',
      'prize-money',
      'team-orders',
    ],
    era: 'The prize money distribution mechanism is commercially negotiated and has changed with each Concorde Agreement.',
    ...SPORTING,
  }),

  rule({
    slug: 'how-ties-are-broken',
    title: 'How Ties Are Broken',
    category: 'championship',
    difficulty: 'intermediate',
    order: 60,
    summary: 'Countback: most wins, then most second places, and onward until somebody leads.',
    oneSentence:
      'A championship tie is resolved by comparing the number of first places, then second places, then third, and so on until a difference is found.',
    howItWorks:
      '**Wins first.** The competitor with more victories takes the title.\n\n**Then each position in turn.** Equal wins go to more second places, then more thirds, continuing down the order.\n\n**It applies to both championships**, with a constructor’s finishes counted across both cars.\n\n**It is rarely needed** but has decided championships, which is why it is worth understanding before the final race rather than after it.',
    example:
      'Two drivers finish level on points. One has five wins and eight second places; the other has five wins and seven second places. The first is champion, decided on the second criterion after the first was level.',
    whyItMatters:
      'Countback means that in a tight championship, a win is worth more than its points value alone. A driver level on points with a rival benefits from having converted their good results into victories rather than into consistent podiums.',
    strategic:
      'Late in a close season, this changes race decisions. A driver level on points who can attempt a risky pass for the lead may take it, because a win carries tie-break value that second place does not.',
    misunderstandings:
      '**"A tie means the title is shared."** It is not. Countback resolves it, and it has done so in practice.\n\n**"Countback uses fastest laps or poles."** It uses finishing positions.',
    related: [
      'drivers-championship',
      'constructors-championship',
      'championship-mathematics',
      'points-system',
      'clinching-the-championship',
    ],
    era: 'The countback method described is current. Tie-break provisions have varied across the sport’s history.',
    ...SPORTING,
  }),

  article({
    slug: 'why-every-point-matters',
    title: 'Why Every Point Matters',
    category: 'championship',
    difficulty: 'intermediate',
    order: 70,
    summary: 'Championships are decided by margins smaller than a single bad afternoon.',
    oneSentence:
      'Because all results count and the field is close, championships are routinely decided by margins smaller than the points available in one race, which makes a single point in March matter in December.',
    explanation:
      'Formula 1 has no mechanism for discarding a bad result. Every race counts, so a point scored in the first race is worth exactly as much as a point scored in the last.\n\nThat sounds obvious and has a consequence teams take seriously: a tenth place that appears meaningless at the time can decide a championship eight months later, and a retirement from a points position is a loss that cannot be recovered by any later performance.',
    howItWorks:
      '**No dropped scores.** Every result counts, unlike eras in which only a driver’s best results were counted.\n\n**The midfield fights for scraps.** With ten scoring positions and twenty cars, half the field scores nothing on a normal weekend, which makes each point genuinely contested.\n\n**Constructors’ points pay.** A single point can change a team’s finishing position and therefore its prize money.\n\n**Reliability compounds.** Two retirements is potentially fifty points, which is more than most seasons’ championship margins.',
    example:
      'A driver takes an unremarkable tenth place in an early race after a difficult weekend. The season ends with them ahead by a handful of points, and that afternoon nobody remembered turns out to have been decisive.',
    whyItMatters:
      'It explains why teams pursue a single position so hard in races that appear to be settled, and why a driver is told to bring a damaged car home rather than retire it. Finishing eleventh scores nothing, but finishing tenth in a car that should have finished fifth is a real result.',
    misunderstandings:
      '**"The midfield races do not matter."** They decide the constructors’ championship and therefore the prize money, which decides next year’s competitiveness.',
    related: [
      'points-system',
      'championship-mathematics',
      'constructors-points',
      'race-classification',
      'reliability-adjusted-performance',
    ],
    era: 'Earlier eras counted only a limited number of a driver’s best results, which changed this calculation substantially.',
    ...SPORTING,
  }),

  rule({
    slug: 'sprint-points',
    title: 'Sprint Points Explained',
    category: 'championship',
    difficulty: 'intermediate',
    order: 80,
    summary: 'A shorter race with a smaller points scale, added to the same championship.',
    oneSentence:
      'Sprint races award points on a reduced scale to the leading finishers, and those points are added to the same drivers’ and constructors’ championship totals as the Grand Prix.',
    howItWorks:
      '**A separate, smaller scale.** The sprint awards fewer points than the Grand Prix and to fewer positions.\n\n**Same championship.** The points are not a separate competition; they go straight into the season totals.\n\n**Its own qualifying.** Sprint weekends have a separate qualifying session that sets the sprint grid.\n\n**The Grand Prix is unaffected in value.** A win on Sunday is worth the same as at any other event.',
    example:
      'A driver finishing outside the points in the Grand Prix but scoring in the sprint still leaves the weekend with a championship contribution, which is the format’s purpose.',
    whyItMatters:
      'The sprint adds points-scoring opportunities to a weekend, which slightly reduces the impact of a single bad Sunday and gives teams a second chance to score. It also changes the weekend structure, cutting practice time and raising the cost of arriving with the wrong setup.',
    strategic:
      'Sprint weekends compress everything. With less practice, teams have less data on tyre degradation, so Sunday’s strategy is built on thinner information and the variance in outcomes rises.',
    misunderstandings:
      '**"Sprint points are a separate championship."** They go into the same totals.\n\n**"The sprint format is fixed."** It has been revised repeatedly since its introduction, including changes to the number of events, the points scale and how the Grand Prix grid is set.',
    related: [
      'sprint-weekend',
      'points-system',
      'how-an-f1-weekend-works',
      'how-drivers-score-points',
      'free-practice',
    ],
    era: 'The sprint format, the number of sprint events per season and the points awarded have all been revised repeatedly since sprints were introduced. This describes the current arrangement.',
    ...SPORTING,
  }),

  rule({
    slug: 'shortened-race-points',
    title: 'What Happens if a Race Is Shortened?',
    category: 'championship',
    difficulty: 'intermediate',
    order: 90,
    summary: 'A reduced points scale applies, depending on how much of the distance was completed.',
    oneSentence:
      'If a race is stopped before its full distance, points are awarded on a reduced scale determined by the proportion of the scheduled distance that was completed.',
    howItWorks:
      '**A minimum distance is required.** Below it, no points are awarded at all.\n\n**Graduated scales apply.** The further the race went, the closer the points are to the full allocation, with several bands between the minimum and the full distance.\n\n**Full distance, full points.** Once enough of the race is complete, the normal scale applies.\n\n**The classification is taken from when the race was stopped**, subject to the usual rules on order and penalties.',
    example:
      'A race abandoned after only a handful of laps behind a safety car may award no points at all, while one stopped past the halfway mark awards a substantial but reduced allocation.',
    whyItMatters:
      'It prevents a race that barely happened from carrying the same championship weight as one that was fully run, which matters because weather can end a race that has not been meaningfully contested.',
    strategic:
      'It creates an unusual incentive during a suspension. If a race is close to a scoring threshold, the value of completing a few more laps can be considerable, and teams track exactly where those boundaries fall.',
    misunderstandings:
      '**"Shortened races always score half points."** The half-points rule was the older arrangement. The current system uses a graduated scale with several bands.',
    related: [
      'suspended-race',
      'race-distance',
      'red-flag',
      'points-system',
      'race-classification',
    ],
    era: 'The graduated reduced-points scale replaced a simpler half-points rule after a race that was abandoned having completed almost no racing. The specifics are recent and should be checked against the season in question.',
    ...SPORTING,
  }),

  article({
    slug: 'championship-mathematics',
    title: 'How Championship Mathematics Works',
    category: 'championship',
    difficulty: 'advanced',
    order: 100,
    summary:
      'Counting the points still available, and working out when a lead becomes unassailable.',
    oneSentence:
      'Championship mathematics is the arithmetic of comparing a points lead against the maximum still available, which determines when a title is clinched and how a contender must race.',
    explanation:
      'With races remaining, each one offers a maximum number of points. Multiply the maximum per race by the races left, add any sprint points still available, and that is the largest total a rival can still gain.\n\nIf a leader’s advantage exceeds that number, the championship is decided regardless of what happens.',
    howItWorks:
      '**Maximum available.** Races remaining times the winner’s points, plus any sprint points still to come.\n\n**The clinching condition.** A lead greater than the maximum a rival can still score means the title is mathematically secure.\n\n**Relative scoring matters more than absolute.** What decides a championship is the difference each weekend, not the total. A leader finishing second to their rival’s win loses seven points, which is a small dent in a large lead.\n\n**Countback provides a margin.** A leader with more wins effectively needs only to be level on points.',
    example:
      'With three races remaining and no sprints, the maximum a rival can score is seventy-five points. A leader with a seventy-six point advantage is champion regardless of the results, and one with a seventy-four point lead is not, though the practical difference between the two situations is negligible.',
    whyItMatters:
      'It determines how the closing races of a season are raced. A leader who needs only to finish near their rival will drive conservatively; one who needs a specific result will take risks that would be irrational earlier in the year.',
    misunderstandings:
      '**"Mathematically possible means realistically possible."** A rival needing to win every remaining race while the leader scores nothing is mathematically alive and practically finished, and the distinction matters for how both drivers actually race.',
    related: [
      'clinching-the-championship',
      'drivers-championship',
      'how-ties-are-broken',
      'points-system',
      'why-every-point-matters',
    ],
    era: 'The arithmetic depends on the current points scale and on how many sprint events remain, both of which vary by season.',
    ...SPORTING,
  }),

  definition({
    slug: 'clinching-the-championship',
    title: 'What Does "Clinching the Championship" Mean?',
    category: 'championship',
    difficulty: 'intermediate',
    order: 110,
    summary: 'Winning the title mathematically, with races still to run.',
    explanation:
      'A championship is clinched when a competitor’s points lead is larger than the total still available to their nearest rival. From that moment the title cannot be lost, whatever happens in the remaining races.\n\nBecause all races count and there is no final, clinching frequently happens before the last round, and the remaining races are then run for everything else that is still open.',
    example:
      'A driver takes the title with two races remaining. Those races still matter: the constructors’ championship may be undecided, and positions throughout the table carry prize money.',
    whyItMatters:
      'It reflects the structure of the sport. A championship decided by accumulation rather than by a final can be settled early, which is a consequence of rewarding season-long consistency rather than a single decisive event.',
    misunderstandings:
      '**"Clinching early means the season is over."** The drivers’ title is one of several contests. The constructors’ championship, the fight for individual positions and the prize money attached to them all continue.\n\n**"The champion must win the final race."** They need only have accumulated more points than anybody can still reach.',
    related: [
      'championship-mathematics',
      'drivers-championship',
      'constructors-championship',
      'how-ties-are-broken',
      'how-an-f1-season-works',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),
];

/* ────────────────────────────────────────────────────────────────────────────
 * Overtaking
 * ────────────────────────────────────────────────────────────────────────── */

const OVERTAKING: ExplainerSeed[] = [
  technical({
    slug: 'how-overtaking-works',
    title: 'How Overtaking Works in F1',
    category: 'overtaking',
    isStartHere: true,
    isFeatured: true,
    order: 10,
    readMinutes: 6,
    summary: 'Why passing is hard, and the three things that make it possible anyway.',
    oneSentence:
      'Overtaking requires a speed advantage at a point where the track allows two cars side by side, which is difficult because following closely costs downforce, and is assisted by slipstream, DRS and tyre difference.',
    howItWorks:
      '**The problem.** An F1 car depends on clean air. Following closely puts it in the wake of the car ahead, which reduces downforce, which reduces cornering speed, which makes it harder to stay close enough to attack.\n\n**Slipstream.** The car ahead punches a hole in the air. On a straight, the following car has less drag and can carry more speed. This is the oldest overtaking aid in the sport.\n\n**DRS.** When within one second at a detection point, the following car may open its rear wing in a designated zone, cutting drag further and adding a substantial speed advantage.\n\n**Tyre difference.** A car on fresher or softer tyres has more grip, and can brake later and accelerate harder.\n\n**The move itself.** Almost all passes happen under braking into a slow corner at the end of a straight, because that is where a speed advantage can be converted into position.',
    diagram: DRS_DIAGRAM,
    whyItMatters:
      'The difficulty of overtaking is the reason qualifying matters, the reason the undercut exists, and the reason races can settle into processions. Almost every regulation change of the last two decades has been aimed at making it easier.',
    example:
      'A driver a second behind through a corner sequence gains half a second on the straight through slipstream and DRS, arrives at the braking zone alongside, and takes the position under braking. The pass took two seconds and the preparation took a lap.',
    tradeoffs:
      'Attacking costs tyres. Following closely overheats them, and a driver who spends ten laps trying to pass may arrive at their pit stop with tyres in far worse condition than the car they were chasing.',
    misunderstandings:
      '**"DRS makes overtaking easy."** It makes it possible. At many circuits a DRS pass still requires a genuine tyre or pace advantage, and where the zone is too short, DRS alone achieves nothing.\n\n**"Faster cars can always pass."** A car half a second a lap quicker can be held up indefinitely at a circuit with no overtaking place, which is why track position is worth so much.',
    related: [
      'drs',
      'slipstream',
      'dirty-air',
      'outbraking',
      'why-following-is-difficult',
      'why-some-circuits-are-hard-to-overtake',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  technical({
    slug: 'drs',
    title: 'DRS Explained',
    category: 'overtaking',
    alsoIn: ['aerodynamics'],
    isStartHere: true,
    order: 20,
    readMinutes: 5,
    summary:
      'A rear wing flap that opens to cut drag, available only when close behind another car.',
    oneSentence:
      'DRS, the Drag Reduction System, opens a flap in the rear wing to reduce drag and raise straight-line speed, and may be used only by a driver within one second of the car ahead in a designated zone.',
    howItWorks:
      '**The mechanism.** A flap in the rear wing pivots open, reducing the wing’s downforce and, more importantly, its drag. Less drag means higher top speed.\n\n**The eligibility test.** At a detection point, the gap to the car ahead is measured. Within one second, the following driver is granted DRS for the next activation zone.\n\n**Activation.** The driver presses a button in the zone. The wing opens.\n\n**Closure.** The flap closes automatically the moment the driver touches the brakes, or leaves the zone.\n\n**Restrictions.** DRS is disabled in the opening laps of a race, after a restart, and whenever conditions are declared unsafe, typically in the wet.',
    diagram: DRS_DIAGRAM,
    whyItMatters:
      'DRS exists because aerodynamic wake makes following so difficult that overtaking had become rare. It is an artificial correction to an aerodynamic problem, and it is openly acknowledged as such.',
    example:
      'A driver is 0.9 seconds behind at the detection point and gains DRS. Down the straight they close from four car lengths to alongside, and the pass happens under braking. Had they been 1.1 seconds behind, none of it would have been available.',
    tradeoffs:
      'DRS is a blunt instrument. Where a zone is too long, passes become inevitable and uncontested, which is criticised as artificial. Where it is too short, it achieves nothing. Getting the length right is a circuit-by-circuit judgement that is frequently revised.',
    misunderstandings:
      '**"DRS is a speed boost."** It reduces drag rather than adding power. The car goes faster because it is pushing less air, not because the engine is producing more.\n\n**"Both cars can use it."** Only a car within one second of another at the detection point. The leading car can use it too, but only if it is itself within a second of a car ahead.\n\n**"The driver chooses when to close it."** It closes automatically on braking.',
    related: [
      'drs-detection-point',
      'drs-activation-zone',
      'slipstream',
      'how-overtaking-works',
      'rear-wing',
      'drag',
    ],
    era: 'DRS was introduced to address overtaking difficulty and did not exist in earlier eras. Zone lengths and the number of zones per circuit are revised regularly, and the one-second activation gap has been the standard throughout.',
    ...SPORTING,
  }),

  rule({
    slug: 'drs-detection-point',
    title: 'DRS Detection Point Explained',
    category: 'overtaking',
    difficulty: 'intermediate',
    order: 30,
    summary:
      'The line where the gap is measured, which decides who gets DRS in the zone that follows.',
    oneSentence:
      'The detection point is a fixed line on the circuit where the gap between cars is measured, granting DRS in the following activation zone to any car within one second of the car ahead.',
    howItWorks:
      '**A fixed point.** Marked on the timing map, usually shortly before the corner preceding a DRS zone.\n\n**One second is the threshold.** Measured at that instant, not averaged.\n\n**It is binary and unforgiving.** A car 0.99 seconds behind gets DRS; a car 1.01 seconds behind does not, and the difference on the following straight is substantial.\n\n**Multiple detection points.** Circuits with several DRS zones have a detection point for each, and they are not always immediately before their zone.',
    example:
      'A driver loses a tenth in the corner before the detection point, arrives 1.05 seconds behind, and loses DRS for the following straight. They then fall further back, and by the next detection point they are outside the window again. One small error has removed their overtaking opportunity for two laps.',
    whyItMatters:
      'It creates a tactical game before the game. Drivers deliberately manage their gap into the detection point, sometimes backing off in the preceding corners to arrive closer, because being inside one second at that exact moment is worth more than being slightly quicker overall.',
    strategic:
      'It also makes DRS trains possible. In a queue of cars each within a second of the one ahead, everybody has DRS, so nobody has an advantage, and the queue can circulate unchanged for many laps.',
    misunderstandings:
      '**"The gap is measured continuously."** It is measured at one instant, at one line. Closing up after the detection point achieves nothing for that zone.',
    related: ['drs', 'drs-activation-zone', 'how-overtaking-works', 'slipstream', 'dirty-air'],
    era: 'Detection point placement is set per circuit and revised regularly.',
    ...SPORTING,
  }),

  rule({
    slug: 'drs-activation-zone',
    title: 'DRS Activation Zone',
    category: 'overtaking',
    difficulty: 'intermediate',
    order: 40,
    summary: 'The stretch of track where an eligible driver may open the wing.',
    oneSentence:
      'An activation zone is a marked section of track, almost always a straight, in which a driver granted DRS at the preceding detection point may open their rear wing.',
    howItWorks:
      '**Marked on track.** A line indicates where the zone begins. The wing may not be opened before it.\n\n**The driver activates it.** DRS is not automatic; the driver presses a button.\n\n**It ends at braking.** The flap closes the instant the brakes are touched, or at the end of the zone.\n\n**Length is set per circuit.** Race organisers and the FIA choose the length and number of zones, and adjust them between seasons based on how the racing has developed.\n\n**Zones are disabled when unsafe**, notably in wet conditions and for the opening laps of a race or restart.',
    example:
      'A circuit with a long main straight and a shorter back straight typically has two zones. A car may gain three tenths in the first and one tenth in the second, so the first is where passes actually happen.',
    whyItMatters:
      'Zone length is the tuning dial for overtaking at each circuit. Too long and passes become automatic, which is widely criticised; too short and DRS makes no difference at all. Adjusting them is one of the few ways the sport can influence racing quality without changing the cars.',
    strategic:
      'Drivers plan around zones. A defending driver will prioritise corner exit onto a DRS straight above all else, and an attacking driver may deliberately hold position through one zone to attack in a more favourable one.',
    misunderstandings:
      '**"DRS zones are the same everywhere."** They vary considerably in number and length, and are revised between seasons.',
    related: [
      'drs',
      'drs-detection-point',
      'how-overtaking-works',
      'why-some-circuits-are-hard-to-overtake',
      'defensive-driving',
    ],
    era: 'Zone number and length are set per circuit and revised regularly.',
    ...SPORTING,
  }),

  technical({
    slug: 'slipstream',
    title: 'Slipstream Explained',
    category: 'overtaking',
    alsoIn: ['aerodynamics'],
    order: 50,
    summary:
      'Following in the hole another car punches through the air, and going faster for free.',
    oneSentence:
      'A slipstream is the region of reduced air pressure directly behind a car, in which a following car experiences less drag and can reach a higher speed on a straight.',
    howItWorks:
      '**The car ahead displaces air.** It leaves behind a pocket of turbulent, lower-pressure air moving in roughly the same direction.\n\n**The following car meets less resistance.** With less drag, the same engine power produces more speed.\n\n**The effect is largest on long straights**, where drag matters most and there are no corners to punish the lost downforce.\n\n**It compounds with DRS.** A car in the slipstream with DRS open has both effects at once, which is what produces most modern overtakes.\n\n**It has a cost.** The same disturbed air reduces downforce, so a car in a slipstream corners worse. On a straight this does not matter; in a corner it matters a great deal.',
    whyItMatters:
      'Slipstream is the oldest overtaking mechanism in motor racing and remains the foundation of most passes. It also explains qualifying tactics, where a driver may deliberately follow a rival down a straight to gain a tow, accepting worse cornering to gain more on the straights.',
    example:
      'Two cars of identical pace run nose to tail down a long straight. The following car arrives at the braking zone travelling several kilometres per hour faster, having done nothing except sit in the right place.',
    tradeoffs:
      'The tow is only worth taking if the circuit has enough straight to repay the cornering deficit. At a track dominated by fast corners, following closely costs more in the corners than the slipstream returns on the straights.',
    misunderstandings:
      '**"Slipstream and dirty air are different things."** They are the same wake described from two points of view: helpful on a straight, harmful in a corner.',
    related: [
      'dirty-air',
      'drs',
      'drag',
      'how-overtaking-works',
      'why-following-is-difficult',
      'q3',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  technical({
    slug: 'dirty-air',
    title: 'Dirty Air Explained',
    category: 'overtaking',
    alsoIn: ['aerodynamics'],
    difficulty: 'intermediate',
    order: 60,
    summary: 'The turbulent wake behind a car, which robs the following car of downforce.',
    oneSentence:
      'Dirty air is the turbulent, disrupted airflow left behind a Formula 1 car, which reduces the downforce available to a following car and makes it slower through corners.',
    howItWorks:
      '**The wake is turbulent.** A car leaves behind air that is disturbed and moving unpredictably rather than in the smooth flow the aerodynamics were designed for.\n\n**Downforce falls.** The following car’s wings and floor cannot work properly in that air, so it has less grip.\n\n**The effect grows as you get closer.** The nearer you follow, the more downforce you lose, which is the opposite of what an attacking driver needs.\n\n**It overheats the tyres.** Less downforce means more sliding, which means more heat, which means faster degradation.\n\n**Cooling suffers too.** Running in another car’s wake means hotter, less dense air entering the radiators, which can force a driver to back off entirely.',
    whyItMatters:
      'Dirty air is the central problem of modern Formula 1 racing. It is why overtaking is hard, why DRS was introduced, and why the technical regulations were rewritten to produce cars that generate more of their downforce from the floor, which is less disrupted by a car ahead than bodywork-mounted wings are.',
    example:
      'A driver a second behind loses a meaningful fraction of their downforce through a fast corner. They slide, the tyres overheat, and after five laps of trying they are slower than the car ahead despite having the quicker car.',
    tradeoffs:
      'The driver must choose between following closely enough to attack, which damages the tyres, and dropping back to cool them, which surrenders the opportunity. Managing that trade over a stint is a real skill.',
    misunderstandings:
      '**"The 2022 regulations fixed dirty air."** They reduced it. Following remains harder than running in clear air, and DRS has remained necessary.\n\n**"Dirty air only matters in corners."** It also raises tyre and power unit temperatures, which affects the whole stint rather than one corner.',
    related: [
      'slipstream',
      'why-following-is-difficult',
      'ground-effect',
      'downforce',
      'tyre-management',
      'drs',
    ],
    era: 'The technical regulations were rewritten specifically to reduce the wake behind a car by moving downforce generation to the floor. The problem is reduced rather than eliminated.',
    ...TECHNICAL,
  }),

  technical({
    slug: 'why-following-is-difficult',
    title: 'Why Following Another Car Is Difficult',
    category: 'overtaking',
    alsoIn: ['aerodynamics'],
    difficulty: 'intermediate',
    order: 70,
    summary:
      'Three compounding penalties: less downforce, hotter tyres, and hotter everything else.',
    oneSentence:
      'Following closely costs a car downforce, overheats its tyres and reduces its cooling, and each of those makes the next one worse.',
    howItWorks:
      '**Downforce loss.** The wake reduces the effectiveness of the wings and floor, so the car has less grip in corners.\n\n**Sliding follows.** Less grip means the tyres slide more for the same cornering speed.\n\n**Heat follows sliding.** Sliding puts energy into the tyres, raising temperatures beyond the working window and accelerating degradation.\n\n**Cooling suffers.** The air entering the radiators is hotter and more turbulent, so power unit and brake temperatures rise, sometimes forcing the driver to back off.\n\n**The cycle compounds.** A driver who tries harder to stay close slides more, overheats the tyres further, and ends up slower than if they had dropped back.',
    whyItMatters:
      'This is why a faster car can sit behind a slower one for an entire stint without passing, and why it eventually falls back. The penalty for following is not fixed; it accumulates, and the car that is attacking is the one paying it.',
    example:
      'A driver closes to within a second and stays there for eight laps. Their tyre temperatures climb steadily, their pace drops, and they finish the stint further behind than when they started attacking. The car ahead did nothing except run in clear air.',
    tradeoffs:
      'The alternative is to drop back deliberately, cool the tyres, and attack in a concentrated burst of two or three laps. That surrenders the chance of a pass in the meantime but preserves the ability to make one at all.',
    misunderstandings:
      '**"They should just push harder."** Pushing harder in dirty air makes the situation worse. The correct response is often to back off, which looks like giving up and is not.',
    related: [
      'dirty-air',
      'slipstream',
      'tyre-management',
      'how-overtaking-works',
      'ground-effect',
      'cooling-system',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  technique({
    slug: 'outbraking',
    title: 'Outbraking Explained',
    category: 'overtaking',
    alsoIn: ['driving'],
    difficulty: 'intermediate',
    order: 80,
    summary: 'Braking later than the car ahead to take the position into a corner.',
    oneSentence:
      'Outbraking is arriving at a corner alongside or behind a rival and braking later than they do, taking the position by carrying the move through to the apex.',
    theTechnique:
      '**Set it up on the straight.** A speed advantage from slipstream, DRS or fresher tyres puts the attacking car close enough to attempt the move.\n\n**Choose the side.** Usually the inside, which is the shorter route to the apex and the side the defender cannot legitimately take back without leaving room.\n\n**Brake later, not harder.** The car has a maximum deceleration; the skill is in using all of it while arriving at a speed the corner can still be taken at.\n\n**Get the car stopped.** A move that carries too much speed runs wide at the exit, which surrenders the position back.\n\n**Hold the line.** The attacking driver must be far enough alongside at the apex that the defender must leave room.',
    whenUsed:
      'At the end of a straight into a slow or medium corner, which is where nearly all overtaking in Formula 1 happens.',
    whyItMatters:
      'Outbraking is the primary overtaking technique in the sport. Every other mechanism, slipstream, DRS, a tyre advantage, exists to put a driver in a position to attempt it.',
    risks:
      'Braking too late means locking a wheel, flat-spotting the tyre, running wide, or hitting the car being passed. A failed outbraking move frequently costs more than the position it was attempting to gain, and a collision can end both races.',
    misunderstandings:
      '**"The best brakers just brake later."** Braking later only works if the car can still make the corner. A driver who brakes latest and runs wide has lost the position and damaged their tyres doing it.',
    related: [
      'late-braking',
      'trail-braking',
      'lock-up',
      'divebomb',
      'how-overtaking-works',
      'racing-room',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  technique({
    slug: 'late-braking',
    title: 'Late Braking Explained',
    category: 'overtaking',
    alsoIn: ['driving'],
    difficulty: 'intermediate',
    order: 90,
    summary: 'Delaying the braking point, and the limits of how far that can be taken.',
    oneSentence:
      'Late braking is delaying the point at which the driver applies the brakes, which gains distance but must still leave enough room to slow the car for the corner.',
    theTechnique:
      '**The braking point is a reference.** Drivers use markers beside the track and brake at a consistent point every lap.\n\n**Moving it later gains time and position**, but the car still needs the same distance to slow down.\n\n**Tyre and brake condition change it.** Worn tyres and cold brakes both require earlier braking, so the same reference point is not correct all race.\n\n**Fuel load changes it.** A heavy car at the start of a race needs to brake earlier than the same car at the end.\n\n**Brake bias is adjusted to suit.** Moving bias rearward helps rotation but risks locking a rear; forward is more stable but risks a front lock-up.',
    whenUsed:
      'Constantly in qualifying, where every metre counts, and specifically when attacking or defending into a braking zone.',
    whyItMatters:
      'The braking zones are where lap time and positions are most concentrated. A driver who can brake five metres later than a rival into every heavy corner has a meaningful advantage over a lap, and a decisive one in a fight.',
    risks:
      'Late braking is the commonest cause of lock-ups, flat spots and first-corner collisions. Because grip changes with tyre wear, fuel and temperature, a braking point that worked on lap one can be too late on lap thirty.',
    misunderstandings:
      '**"Braking later is always faster."** Over-braking destroys corner entry and costs exit speed, which costs the whole straight that follows. The fastest lap usually comes from braking optimally, not latest.',
    related: ['outbraking', 'trail-braking', 'lock-up', 'brake-bias', 'corner-entry', 'flat-spots'],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  technique({
    slug: 'switchback',
    title: 'Switchback Explained',
    category: 'overtaking',
    difficulty: 'advanced',
    order: 100,
    summary: 'Conceding the inside, then crossing behind to take a better exit and the position.',
    oneSentence:
      'A switchback is a counter-move in which a driver lets a rival take the inside line into a corner, then crosses behind them on the exit to take a superior line and pass on the way out.',
    theTechnique:
      '**Let them have the inside.** The attacking car dives up the inside and, having braked late, takes a compromised line through the corner.\n\n**Slow the entry deliberately.** The defending driver brakes earlier and turns in later.\n\n**Cross behind.** As the rival runs wide on exit, the defender crosses behind them to the inside of the following straight.\n\n**Better exit wins.** With a straighter line and earlier throttle, the switchbacking car accelerates past on the exit.',
    whenUsed:
      'Where a slow corner is followed by a straight or another corner, and particularly against a driver who has committed to an over-optimistic move on the inside.',
    whyItMatters:
      'It is the standard punishment for a divebomb. A driver who lunges up the inside without being able to make the corner properly gives the switchback away, which is why the best defensive response to an aggressive move is often to yield the position temporarily.',
    risks:
      'It requires giving up the position first, which is uncomfortable and only works if the rival genuinely compromises their exit. Against a driver who makes the corner cleanly, the switchback simply loses the place.',
    misunderstandings:
      '**"The switchback is a trick."** It is the natural consequence of the geometry: a car that takes a tight line into a corner necessarily has a worse exit, and the switchback is how that is exploited.',
    related: [
      'divebomb',
      'outbraking',
      'racing-line',
      'corner-exit',
      'defensive-driving',
      'inside-vs-outside-line',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  definition({
    slug: 'divebomb',
    title: 'Divebomb Explained',
    category: 'overtaking',
    difficulty: 'intermediate',
    order: 110,
    summary: 'A late, optimistic lunge up the inside, often from too far back.',
    explanation:
      'A divebomb is an overtaking attempt made from a long way back, braking extremely late to force the car up the inside of a corner. It is a term of criticism more often than of praise.\n\nThe move typically leaves the attacking car unable to make the corner properly. It arrives at the apex too fast, runs wide on exit, and either surrenders the position back through a switchback or makes contact with the car it was passing.',
    example:
      'A driver launches down the inside from several car lengths back, locks the inside front, and arrives at the apex with the car barely under control. The defender is forced wide to avoid contact, and the stewards examine whether the attacking car was ever sufficiently alongside to be entitled to the corner.',
    whyItMatters:
      'The divebomb sits at the boundary of acceptable racing. Whether it is a legitimate overtake or a punishable move depends on whether the attacking car was alongside at the apex and whether it could make the corner without leaving the track, which is precisely what the stewards assess.',
    misunderstandings:
      '**"Any late move is a divebomb."** A well-executed late move that makes the corner cleanly is simply an overtake. The word describes an attempt that was never going to work.',
    related: ['outbraking', 'switchback', 'racing-room', 'causing-a-collision', 'late-braking'],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  technical({
    slug: 'racing-line',
    title: 'Racing Line Explained',
    category: 'overtaking',
    alsoIn: ['driving', 'circuits'],
    isStartHere: true,
    order: 120,
    summary: 'The fastest path through a corner, and why it is wide, then tight, then wide again.',
    oneSentence:
      'The racing line is the path through a corner that allows the highest possible speed, which usually means entering from the outside, touching the apex on the inside, and running wide again on exit.',
    howItWorks:
      '**Straighten the corner.** A wider arc has a larger radius, and a larger radius can be taken faster. Using the full width of the track turns a tight corner into a gentler one.\n\n**Entry, apex, exit.** Approach from the outside, clip the inside at the apex, and let the car run to the outside on exit.\n\n**The exit matters most.** Where a corner leads onto a straight, exit speed is carried down the whole straight, so drivers sacrifice entry speed to improve it.\n\n**The apex moves.** A late apex costs entry speed and improves exit; an early apex does the reverse. Which is correct depends on what follows the corner.\n\n**It is not always the fastest line in a race.** Defending a position requires taking the inside, which is slower but cannot be attacked.',
    whyItMatters:
      'The racing line explains most of what a car does on track, and its existence is why overtaking is difficult: two cars cannot both use it, so the attacking car must take a compromised line and still be faster.\n\nIt also explains why the track surface off the line is slower. Rubber accumulates on the line, and the area beside it is dusty and offers less grip.',
    example:
      'A driver defending into a corner takes the inside, a slower line, accepting a worse exit in exchange for making the pass impossible. They lose two tenths and keep the position, which is a trade worth making.',
    tradeoffs:
      'The fastest line and the safest line are not the same. A defending driver deliberately drives a slower line, and a driver in traffic may take a wider entry to set up a better exit for the following straight.',
    misunderstandings:
      '**"There is one racing line."** The optimum varies with the corner that follows, with tyre condition, with fuel load and with whether the driver is attacking or defending.\n\n**"Off the line is just dirty."** It is dirty and also has less rubber, which is a compound disadvantage.',
    related: [
      'apex',
      'corner-entry',
      'corner-exit',
      'inside-vs-outside-line',
      'defensive-driving',
      'track-evolution',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  technical({
    slug: 'inside-vs-outside-line',
    title: 'Inside vs Outside Line',
    category: 'overtaking',
    difficulty: 'intermediate',
    order: 130,
    summary: 'The shorter route and the faster route, and why they are not the same.',
    oneSentence:
      'The inside line is shorter and easier to defend but produces a worse exit; the outside line is longer and faster in isolation but leaves a driver vulnerable and off the rubbered surface.',
    howItWorks:
      '**Inside.** Shorter distance to the apex, and the defender cannot be passed on that side. But the tighter arc means a slower minimum speed and a compromised exit.\n\n**Outside.** A wider, faster arc, but a longer route, less grip off the racing line, and no protection: a car on the inside can simply take the corner.\n\n**Exit determines the next corner.** A car that takes the inside and exits slowly is vulnerable on the following straight, which is what makes the switchback work.\n\n**Around the outside is possible but rare.** It requires a substantial grip advantage and a corner where the outside line rejoins the racing line favourably.',
    whyItMatters:
      'Almost every wheel-to-wheel moment in Formula 1 is a negotiation over these two lines. The attacking driver chooses one, the defending driver responds, and the rules about leaving racing room govern what each is allowed to do.',
    example:
      'A driver completes a pass around the outside of a fast corner. It works because the following corner turns the other way, so the outside of the first becomes the inside of the second, and the position is secured rather than immediately lost.',
    tradeoffs:
      'Taking the inside secures the position now and costs exit speed; taking the outside is faster if it works and loses the position entirely if it does not.',
    misunderstandings:
      '**"The inside line is the racing line."** It usually is not. The inside is the defensive line, and driving it repeatedly costs lap time, which is why a defending driver falls back from the car ahead.',
    related: [
      'racing-line',
      'defensive-driving',
      'switchback',
      'racing-room',
      'outbraking',
      'corner-exit',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  technique({
    slug: 'defensive-driving',
    title: 'Defensive Driving Explained',
    category: 'overtaking',
    alsoIn: ['driving'],
    difficulty: 'intermediate',
    order: 140,
    summary: 'Making yourself impossible to pass, within the limits the rules allow.',
    oneSentence:
      'Defensive driving is positioning the car to remove the attacking driver’s options, principally by taking the inside line into braking zones, while staying within the rules on changing direction and leaving room.',
    theTechnique:
      '**Cover the inside.** Move to the inside of the track on the approach to a braking zone, so the attacking car cannot take the shorter line.\n\n**One move only.** A driver may make one defensive change of direction. Moving back is not permitted.\n\n**Do it early.** Moving under braking is prohibited, so the defensive position must be taken before the braking zone.\n\n**Sacrifice the entry, protect the exit.** Brake earlier, get the car turned, and prioritise acceleration onto the following straight.\n\n**Leave a car’s width.** If the attacking car has its front wheel alongside at the apex, room must be left. Squeezing them off the track is penalised.\n\n**Manage the tyres.** Defending is hard on tyres, and a driver who defends for fifteen laps may have nothing left afterwards.',
    whenUsed: 'Whenever a faster car is behind, which for most of the field is most of the race.',
    whyItMatters:
      'Because overtaking is difficult, competent defending can hold up a substantially faster car indefinitely. That is why track position is so valuable and why the rules constraining defence are as detailed as they are.',
    risks:
      'Defending costs lap time and tyre life, so a driver who defends successfully for ten laps may be slower afterwards than if they had let the car past and followed it. Over-defending also risks a penalty, and the rules on direction changes and racing room are enforced closely.',
    misunderstandings:
      '**"Anything goes in defence."** It does not. One move, no moving under braking, and racing room must be left. Each of those is a specific and enforced rule.\n\n**"Letting a car past is giving up."** Against a much faster car it is often the correct decision, preserving tyres for the cars behind rather than spending them on a fight already lost.',
    related: [
      'defensive-driving-rules',
      'racing-room',
      'moving-under-braking',
      'multiple-direction-changes',
      'inside-vs-outside-line',
      'tyre-management',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  article({
    slug: 'why-some-circuits-are-hard-to-overtake',
    title: 'Why Some Circuits Are Hard to Overtake On',
    category: 'overtaking',
    alsoIn: ['circuits'],
    difficulty: 'intermediate',
    order: 150,
    summary: 'Short straights, fast corners, narrow tracks and no room for error.',
    oneSentence:
      'Overtaking requires a straight long enough to build a speed advantage followed by a braking zone wide enough for two cars, and circuits lacking either combination produce very few passes.',
    explanation:
      'A pass needs two things: somewhere to gain speed, and somewhere to use it. Circuits that lack either are processional regardless of how close the cars are in pace.',
    howItWorks:
      '**Straight length.** A short straight gives too little time for a slipstream or DRS advantage to develop.\n\n**Corner type after the straight.** A heavy braking zone into a slow corner is ideal. A fast, flowing corner offers no opportunity, because there is no braking zone to attack.\n\n**Track width.** A narrow circuit has no room for a second car, and a car alongside has nowhere to go.\n\n**Run-off.** Where a mistake means hitting a wall, drivers attempt fewer moves. Where it means running across asphalt, they attempt more.\n\n**Corner sequences.** A circuit of continuous corners keeps cars in dirty air permanently, so a following driver never gets clean air to recover in.\n\n**Tyre degradation.** High degradation creates pace differences between cars on different tyre ages, which produces overtaking even at difficult circuits.',
    example:
      'A street circuit with short straights, narrow lanes and walls on both sides can produce almost no on-track overtaking across an entire race. The result is decided by qualifying and by pit strategy, and the racing happens on the pit wall.',
    whyItMatters:
      'It explains why the same field produces a thrilling race one weekend and a procession the next, with no change in the cars or the drivers. It is also why teams weight qualifying so heavily at certain events, and why they will take a grid penalty at one circuit rather than another.',
    misunderstandings:
      '**"Boring races mean the cars are too close or too far apart."** More often it is the circuit. The same cars at a different track produce entirely different racing.',
    related: [
      'track-position-vs-fresh-tyres',
      'drs-activation-zone',
      'street-vs-permanent',
      'dirty-air',
      'how-overtaking-works',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),
];

export const FORMULA1_CHAMPIONSHIP: ExplainerSeed[] = [...CHAMPIONSHIP, ...OVERTAKING];
