import type { ExplainerSeed } from './explainer-types';
import { article, definition, technical, technique } from './formula1-explainer-helpers';
import { CURRENT_ERA, SPORTING, TECHNICAL } from './formula1-explainers';

/**
 * Driving, braking, cornering and car setup.
 *
 * The brief separates "Braking & Cornering", "Driver Skills" and "Car Setup".
 * The first two are one subject: trail braking, the racing line and tyre
 * management appear in both lists, and splitting them would put a technique in
 * one file and the skill of applying it in another. They are merged into
 * Driving here.
 *
 * Setup shares the file because the two are inseparable in practice. Brake bias
 * is a setup parameter the driver changes from the cockpit mid-corner, and
 * understeer is simultaneously a handling complaint, a setup problem and a
 * consequence of aerodynamic balance. Keeping them together means the
 * cross-references are short.
 */

/* ────────────────────────────────────────────────────────────────────────────
 * Braking and cornering
 * ────────────────────────────────────────────────────────────────────────── */

const DRIVING: ExplainerSeed[] = [
  technical({
    slug: 'how-f1-cars-brake',
    title: 'How F1 Cars Brake',
    category: 'driving',
    isStartHere: true,
    difficulty: 'intermediate',
    order: 10,
    summary:
      'Carbon brakes, aerodynamic drag and energy recovery, all decelerating the car at once.',
    oneSentence:
      'A Formula 1 car slows through a combination of carbon friction brakes, aerodynamic drag, and the energy recovery system harvesting at the rear axle, producing deceleration far beyond what any road car achieves.',
    howItWorks:
      '**Friction braking.** Carbon discs and pads at each corner, which work only when hot.\n\n**Aerodynamic drag.** At high speed the air itself slows the car substantially, which is why the first part of a braking zone from very high speed produces the greatest deceleration.\n\n**Energy recovery.** The MGU-K harvests at the rear axle, which contributes braking effort and complicates the balance, since that effort varies with the battery’s state of charge.\n\n**Brake-by-wire manages the rear.** Because harvesting varies, the rear friction braking is adjusted electronically to keep total rear braking consistent and the car stable.\n\n**Grip is the real limit.** The brakes can lock the wheels at almost any speed. What limits deceleration is how much grip the tyres have, which is why braking distances lengthen as tyres wear.',
    whyItMatters:
      'Braking is where most overtaking happens and where a large share of lap time is found. It is also the hardest thing to do consistently, because the correct braking point changes with fuel load, tyre condition, brake temperature and battery charge, all of which move throughout a race.',
    example:
      'A car decelerating from very high speed sheds an enormous amount of speed in the first moments of the braking zone, when aerodynamic drag is greatest and downforce presses the tyres hardest. As speed falls, both effects diminish and the driver must progressively release the brake pedal to avoid locking a wheel.',
    tradeoffs:
      'Braking later gains position and risks a lock-up, a flat spot and a compromised corner exit. Braking earlier is safe and slow, and gives away the position to anybody prepared to take the risk.',
    misunderstandings:
      '**"The brakes are what stop the car."** At high speed, drag and downforce do a great deal of the work. The brakes are the part the driver controls.\n\n**"Braking is a single action."** It is a modulation: maximum pressure at the start, progressively released as speed and downforce fall, and blended into steering through the corner.',
    related: [
      'why-f1-brakes-are-powerful',
      'trail-braking',
      'brake-balance',
      'brakes',
      'lock-up',
      'brake-by-wire',
    ],
    era: 'Brake-by-wire and energy recovery under braking are features of the hybrid era. Earlier cars used conventional braking throughout.',
    ...TECHNICAL,
  }),

  technical({
    slug: 'why-f1-brakes-are-powerful',
    title: 'Why F1 Brakes Are So Powerful',
    category: 'driving',
    difficulty: 'intermediate',
    order: 20,
    summary: 'Because downforce lets the tyres take braking loads a road car could never use.',
    oneSentence:
      'F1 braking performance comes less from the brakes themselves than from the downforce pressing the tyres into the road, which allows deceleration forces a road car’s tyres could not transmit.',
    howItWorks:
      '**Grip sets the limit.** Any car’s braking is limited by tyre grip, not brake capacity. Almost any brake can lock a wheel.\n\n**Downforce increases grip.** At high speed the car is pressed onto the road with more force than it weighs, so the tyres can transmit far greater braking loads.\n\n**Carbon brakes tolerate the heat.** The energy converted in a heavy braking zone would destroy conventional brakes. Carbon composite survives the temperatures involved and is much lighter.\n\n**Deceleration falls with speed.** As the car slows, downforce falls, so the available grip falls, and the driver must ease off the pedal to match.',
    whyItMatters:
      'It is another consequence of downforce, and it explains why braking distances lengthen dramatically at low-downforce circuits and why a car following closely in dirty air cannot brake as late as the car ahead.',
    example:
      'The same car, at the same circuit, with less downforce fitted, needs noticeably longer to stop from the same speed. Nothing about the brakes changed; the tyres simply have less load pressing them into the road.',
    tradeoffs:
      'Brake cooling is an aerodynamic cost. Larger ducts keep the brakes in their window and disrupt airflow around the wheels, so teams run the smallest ducts that will survive the race.',
    misunderstandings:
      '**"They have bigger brakes than road cars."** The discs are comparable in size and made of different material. The difference is the grip available to use them against.',
    related: ['how-f1-cars-brake', 'downforce', 'brakes', 'brake-temperature', 'dirty-air'],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  technical({
    slug: 'brake-temperature',
    title: 'Brake Temperature Explained',
    category: 'driving',
    difficulty: 'advanced',
    order: 30,
    summary: 'Carbon brakes have a working window, and both ends of it are dangerous.',
    oneSentence:
      'Carbon brakes only generate their full friction within a specific temperature range, so they must be warmed before they work and cooled to stop them wearing out.',
    howItWorks:
      '**Too cold.** Below the window, carbon brakes have markedly reduced friction. A driver braking from cold can find the pedal simply does not slow the car as expected.\n\n**In the window.** Full braking performance and predictable response.\n\n**Too hot.** Wear accelerates sharply, and in extreme cases the brakes fade or fail.\n\n**Ducts control it.** Brake duct size is a setup choice made per circuit, trading cooling against aerodynamic performance.\n\n**Drivers manage it.** Lifting and coasting reduces brake temperature, and brake shapes on the steering wheel display let a driver see where they are in the window.',
    whyItMatters:
      'Brake temperature explains behaviour that otherwise looks like error: the lock-up on the first lap, the sudden loss of braking after a safety car period, and drivers braking hard on an out lap for no visible reason.',
    example:
      'A driver following a safety car for several laps finds their brakes below the working window. At the restart, their first braking zone is significantly longer than usual, and a rival with better-managed temperatures attacks into exactly that corner.',
    tradeoffs:
      'Cooling and aerodynamics are directly opposed. Bigger ducts mean cooler brakes and a slower car; smaller ducts mean a faster car that may not survive a race with heavy braking.',
    misunderstandings:
      '**"Brakes just work."** Carbon brakes genuinely do not work cold, which is a fundamental difference from road car brakes and the reason for much of what drivers do on out laps.',
    related: [
      'brakes',
      'how-f1-cars-brake',
      'lock-up',
      'cooling-system',
      'out-lap',
      'safety-car-restart',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  technical({
    slug: 'brake-balance',
    title: 'Brake Balance Explained',
    category: 'driving',
    alsoIn: ['car-setup'],
    difficulty: 'advanced',
    order: 40,
    summary: 'The front-to-rear split of braking effort, adjusted from the cockpit lap by lap.',
    oneSentence:
      'Brake balance is the proportion of braking effort sent to the front axle rather than the rear, and drivers adjust it continuously to suit fuel load, tyre wear and individual corners.',
    howItWorks:
      '**Forward bias.** More front braking. Stable under braking, but risks locking a front tyre and produces understeer on entry.\n\n**Rearward bias.** More rear braking. Helps the car rotate into a corner, and risks locking a rear, which spins the car.\n\n**It changes with fuel.** A full car has more weight over the rear; as fuel burns off, the balance needs to move forward.\n\n**It changes with tyre wear.** Whichever axle is more worn wants less braking effort.\n\n**It is adjusted from the cockpit.** A rotary switch on the steering wheel, changed between corners and sometimes within a lap.',
    whyItMatters:
      'Brake balance is the driver’s primary tool for changing how the car behaves during a race. Unlike wings or suspension, it can be altered at any moment, which makes it the main response to a car that is not doing what the driver wants.',
    example:
      'A driver reports the car will not turn into slow corners. Moving brake balance rearward helps the car rotate, at the cost of stability in the fast corners later in the lap, so they move it back for that section and forward again afterwards.',
    tradeoffs:
      'Every setting favours one corner type and one phase of the race over another. A balance that suits a fast corner will not suit a hairpin, and a driver adjusting constantly is trading one problem for another rather than eliminating it.',
    misunderstandings:
      '**"There is a correct brake balance."** There is a correct one for this corner, this fuel load and this tyre condition, which is why it is adjustable rather than set once.',
    related: [
      'trail-braking',
      'lock-up',
      'understeer',
      'oversteer',
      'brakes',
      'car-setup-explained',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  technique({
    slug: 'trail-braking',
    title: 'Trail Braking Explained',
    category: 'driving',
    difficulty: 'advanced',
    order: 50,
    summary: 'Carrying brake pressure into the corner while turning, to help the car rotate.',
    oneSentence:
      'Trail braking is progressively releasing the brake pedal while turning into a corner, keeping weight on the front tyres so the car rotates rather than running wide.',
    theTechnique:
      '**Brake hard in a straight line first.** Maximum deceleration happens before any steering input.\n\n**Begin turning while still braking.** Rather than releasing the brake and then turning, the two overlap.\n\n**Release progressively.** As steering angle increases, brake pressure decreases, because the tyre cannot deliver maximum braking and maximum cornering at once.\n\n**Weight stays forward.** Braking loads the front tyres, which gives them the grip to turn the car.\n\n**Blend to throttle at the apex.** The transition from brake to throttle is continuous rather than a gap.',
    whenUsed:
      'In almost every slow and medium corner, and particularly in corners where the car naturally understeers on entry.',
    whyItMatters:
      'Trail braking is the difference between a car that turns and one that does not. It is also central to overtaking: a driver who trail brakes well can take a tighter line under braking and hold a position on the inside that a driver who brakes in a straight line cannot.',
    risks:
      'The tyre has a finite total grip to divide between braking and cornering. Ask for too much of both and it lets go: a locked front tyre means the car goes straight on, and too much rear braking while turning spins the car.',
    misunderstandings:
      '**"Braking and turning at the same time is a mistake."** In a road car it usually is. In a Formula 1 car it is the correct technique for most corners, and drivers who release the brake too early are slow.',
    related: [
      'corner-entry',
      'brake-balance',
      'lock-up',
      'outbraking',
      'late-braking',
      'oversteer',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  definition({
    slug: 'lock-up',
    title: 'Lock-Up Explained',
    category: 'driving',
    order: 60,
    summary: 'A wheel stops turning under braking, the tyre slides, and grip disappears.',
    explanation:
      'A lock-up happens when the braking force applied to a wheel exceeds the grip available, so the wheel stops rotating while the car is still moving. The tyre then slides across the tarmac instead of rolling.\n\nTwo things follow immediately. The car stops slowing effectively, because a sliding tyre has less grip than a rolling one, and it stops steering, because a locked front wheel cannot generate cornering force. The characteristic puff of tyre smoke is the rubber being ground away.',
    example:
      'A driver attacking into a heavy braking zone locks the inside front. They run wide, lose the position they were attacking, and flat-spot the tyre badly enough that the resulting vibration forces an early pit stop.',
    whyItMatters:
      'Lock-ups are the most common visible driver error, and they are expensive in three ways at once: the corner is compromised, the tyre is permanently damaged, and the position is usually lost anyway.',
    misunderstandings:
      '**"Anti-lock brakes would prevent it."** Driver aids of that kind are prohibited, which is why brake bias adjustment and driver modulation are the only defences.\n\n**"A lock-up means braking too hard."** It means exceeding available grip, which can happen at moderate pressure on cold tyres, worn tyres or a damp patch.',
    related: [
      'flat-spots',
      'brake-balance',
      'trail-braking',
      'late-braking',
      'brake-temperature',
      'outbraking',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  technical({
    slug: 'corner-entry',
    title: 'Corner Entry Explained',
    category: 'driving',
    difficulty: 'intermediate',
    order: 70,
    summary: 'From the braking point to the apex, where the corner is won or lost.',
    oneSentence:
      'Corner entry is the phase from the braking point to the apex, in which the driver sheds speed, turns the car and sets up everything that follows.',
    howItWorks:
      '**Brake in a straight line first**, at maximum pressure.\n\n**Turn in.** The point at which steering begins determines the line through the whole corner.\n\n**Trail the brakes.** Releasing progressively while turning keeps weight forward and helps the car rotate.\n\n**Arrive at the apex at the right speed.** Too fast and the car runs wide on exit; too slow and time is lost that cannot be recovered.\n\n**Entry determines exit.** A driver who compromises entry to protect exit is usually faster overall where a straight follows.',
    whyItMatters:
      'Entry is where the largest share of the risk lives. It contains the braking, the turn-in and the transfer of load, and errors here cost more than errors anywhere else in the corner because they propagate through the exit and onto the following straight.',
    example:
      'Two drivers take the same corner at the same apex speed. One brakes later and turns in later, arriving at the apex pointing further down the road, and is quicker onto the next straight despite an identical minimum speed.',
    tradeoffs:
      'A faster entry produces a slower exit. Where a corner leads onto a long straight, the exit matters more, so the correct entry is deliberately slower than the maximum possible.',
    misunderstandings:
      '**"Carrying more speed into a corner is faster."** Only if it does not compromise the exit. On a corner leading onto a straight, a slower entry that produces a better exit wins.',
    related: ['apex', 'corner-exit', 'trail-braking', 'racing-line', 'understeer', 'brake-balance'],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  definition({
    slug: 'apex',
    title: 'Apex Explained',
    category: 'driving',
    alsoIn: ['glossary'],
    order: 80,
    summary: 'The point where the car is closest to the inside of a corner.',
    explanation:
      'The apex is the point at which the car comes nearest to the inside edge of a corner. It is the pivot of the whole corner: everything before it is entry, everything after is exit.\n\nWhere a driver places the apex changes the shape of the corner. An **early apex** means turning in sooner and touching the inside early, which produces a wide, fast exit that runs out of road. A **late apex** means turning in later and touching the inside further round, which costs entry speed and produces a straighter, faster exit.',
    example:
      'A corner leading onto a long straight is taken with a late apex. The driver sacrifices entry speed, turns in later, and can apply full throttle earlier, carrying that advantage down the entire straight.',
    whyItMatters:
      'Apex placement is one of the clearest expressions of the principle that exit speed matters more than entry speed wherever a straight follows. It is also central to defending, since a driver taking a defensive inside line necessarily takes a very early apex and accepts a poor exit.',
    misunderstandings:
      '**"The apex is the middle of the corner."** It is the closest point to the inside, which is often not the geometric middle and moves depending on what follows the corner.',
    related: [
      'corner-entry',
      'corner-exit',
      'racing-line',
      'inside-vs-outside-line',
      'trail-braking',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  technical({
    slug: 'corner-exit',
    title: 'Corner Exit Explained',
    category: 'driving',
    difficulty: 'intermediate',
    order: 90,
    summary: 'From the apex onward, where speed is converted into everything that follows.',
    oneSentence:
      'Corner exit is the phase from the apex to the point the car is straight again, and where a corner leads onto a straight it is the most valuable part of the lap.',
    howItWorks:
      '**Unwind the steering, apply the throttle.** As the car straightens, more grip becomes available for acceleration.\n\n**Traction is the limit.** Too much throttle too early produces wheelspin, which is slow and hard on the rear tyres.\n\n**Use all the road.** Letting the car run to the outside kerb straightens the exit and allows earlier full throttle.\n\n**The gain compounds.** A tenth gained at the exit is carried down the whole straight, so exits onto long straights are worth several times an equivalent gain elsewhere.',
    whyItMatters:
      'Exit speed is multiplied by the length of the straight that follows. This is why drivers sacrifice entry speed for exit, why the differential and traction settings matter so much, and why a defensive line that ruins the exit is so costly.',
    example:
      'A driver defends into a corner by taking the inside line, which compromises their exit. The car behind, on a better line, exits faster and passes on the straight regardless. The defence worked at the corner and failed immediately afterwards.',
    tradeoffs:
      'Prioritising exit costs entry speed. That is nearly always correct before a straight and nearly always wrong before another corner, so drivers change their approach corner by corner.',
    misunderstandings:
      '**"Full throttle as early as possible."** Only as early as traction allows. Earlier than that produces wheelspin, which is slower and destroys the rear tyres over a stint.',
    related: [
      'corner-entry',
      'apex',
      'racing-line',
      'throttle-control',
      'differential-settings',
      'switchback',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  technical({
    slug: 'understeer',
    title: 'Understeer Explained',
    category: 'driving',
    isStartHere: true,
    order: 110,
    summary: 'The car will not turn: the front tyres lose grip before the rears.',
    oneSentence:
      'Understeer is when the front tyres lose grip before the rears, so the car turns less than the driver has asked and runs wide toward the outside of the corner.',
    howItWorks:
      '**The front gives up first.** The driver applies steering, the front tyres cannot generate enough cornering force, and the car continues in a straighter line than intended.\n\n**Causes.** Too little front downforce, cold or worn front tyres, too much speed on entry, brake balance too far forward, or following another car in dirty air.\n\n**The instinctive response makes it worse.** Adding more steering lock further overloads a tyre that has already lost grip.\n\n**The correct response** is to reduce steering angle and lift slightly, letting the front tyre regain grip.',
    whyItMatters:
      'Understeer is the most common handling complaint in Formula 1, and it is what a following car experiences in dirty air. It is also the safer of the two imbalances, which is why teams tend to set cars up slightly toward it.',
    example:
      'A driver closes to within a second of the car ahead and immediately reports understeer. Nothing has changed on their car: the loss of front downforce in the wake of the car ahead has shifted the balance rearward.',
    tradeoffs:
      'Curing understeer by adding front wing or moving brake balance rearward moves the car toward oversteer, which is faster in the hands of a driver who can use it and slower for one who cannot.',
    misunderstandings:
      '**"Understeer means the driver is going too fast."** It can equally mean cold front tyres, dirty air, or a setup that has moved with fuel burn.\n\n**"Understeer is always bad."** It is predictable and recoverable, which is why most cars are set up slightly toward it rather than toward oversteer.',
    related: [
      'oversteer',
      'aerodynamic-balance',
      'dirty-air',
      'brake-balance',
      'front-wing-setup',
      'graining',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  technical({
    slug: 'oversteer',
    title: 'Oversteer Explained',
    category: 'driving',
    isStartHere: true,
    order: 120,
    summary: 'The car turns too much: the rear tyres lose grip before the fronts.',
    oneSentence:
      'Oversteer is when the rear tyres lose grip before the fronts, so the back of the car slides outward and the car turns more sharply than the driver intended.',
    howItWorks:
      '**The rear gives up first.** The back of the car steps out, rotating the car into the corner and, if uncorrected, into a spin.\n\n**Causes.** Too little rear downforce, worn or cold rear tyres, too much throttle on exit, brake balance too far rearward, or lifting abruptly mid-corner.\n\n**The correction is counter-steering.** The driver steers into the slide and modulates the throttle to bring the rear back into line.\n\n**Power-on and lift-off are different.** Power oversteer comes from too much throttle at the exit; lift-off oversteer comes from suddenly releasing the throttle mid-corner, which unloads the rear tyres.',
    whyItMatters:
      'Oversteer is faster than understeer when it is controlled, because a car that rotates readily can take a tighter line and get on the power earlier. It is also far less forgiving, and a car set up toward oversteer punishes small errors severely.',
    example:
      'A driver applies throttle slightly too early at the exit of a slow corner. The rear steps out, they catch it with opposite lock, and lose two tenths and a good deal of rear tyre life in the process.',
    tradeoffs:
      'A driver who can handle a loose rear end can extract more from the car. One who cannot will be slower and will destroy their rear tyres. This is one of the clearest ways in which the fastest setup differs between two drivers in identical machinery.',
    misunderstandings:
      '**"Oversteer means losing control."** It means the rear has less grip than the front. Controlled oversteer is a technique; uncontrolled oversteer is a spin.\n\n**"Drivers prefer oversteer."** Preferences differ considerably, and it is one of the main reasons two team-mates ask for different setups.',
    related: [
      'understeer',
      'correcting-slides',
      'throttle-control',
      'aerodynamic-balance',
      'brake-balance',
      'corner-exit',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  technique({
    slug: 'correcting-slides',
    title: 'Why Drivers Correct Slides',
    category: 'driving',
    difficulty: 'intermediate',
    order: 130,
    summary: 'Catching the car before a slide becomes a spin, and the cost of every save.',
    oneSentence:
      'Correcting a slide means counter-steering and adjusting the throttle to bring a sliding rear end back into line before the car rotates beyond recovery.',
    theTechnique:
      '**Counter-steer.** Steer into the direction of the slide, so the front wheels point where the car is actually going.\n\n**Modulate the throttle.** Usually easing rather than lifting abruptly, because a sudden lift transfers weight forward and can make the slide worse.\n\n**Catch it early.** The window is a fraction of a second, and a slide caught late requires a much larger correction that unsettles the car for the rest of the corner.\n\n**Unwind smoothly.** Returning the steering to centre too quickly produces a second slide in the opposite direction.',
    whenUsed:
      'Whenever the rear loses grip: on cold tyres, at a restart, in the wet, on worn rubber, or when a driver simply asks for more than the car has.',
    whyItMatters:
      'Car control at this level is largely invisible when it works. A driver who catches three slides in a lap looks smooth on television and is doing continuous corrective work, and the ability to do it without losing time is one of the clearest markers of an elite driver.',
    risks:
      'Every slide costs time and tyre life even when caught. The rubber is scrubbed, heat goes into the tyre, and the lap is compromised. A driver whose car is sliding constantly will have nothing left at the end of the stint.',
    misunderstandings:
      '**"A good save shows a great driver."** It shows a driver who put themselves in a position needing one. The best drivers over a race distance are often those whose cars slide least.',
    related: [
      'oversteer',
      'throttle-control',
      'wet-weather-driving',
      'tyre-management',
      'tyre-temperature',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  article({
    slug: 'what-makes-an-elite-driver',
    title: 'What Makes an Elite F1 Driver?',
    category: 'driving',
    isStartHere: true,
    difficulty: 'intermediate',
    order: 140,
    readMinutes: 6,
    summary: 'Raw speed is the entry requirement. What separates the best is everything else.',
    oneSentence:
      'Every Formula 1 driver is exceptionally fast; what distinguishes the best is consistency, tyre management, racecraft, adaptability and the quality of the technical feedback they give their team.',
    explanation:
      'Outright single-lap pace is the ticket to the grid rather than a distinguishing feature. The differences at the top are elsewhere, and most of them are invisible on a timing screen.',
    howItWorks:
      '**Consistency.** Setting a good lap once is easy for anybody at this level. Setting it sixty times, on degrading tyres, in traffic, is not.\n\n**Tyre management.** Extracting pace while limiting degradation gives a team strategic options that a faster but harder-on-tyres driver does not.\n\n**Racecraft.** Knowing when to attack, when to yield, and how to place the car in a fight.\n\n**Adaptability.** Cars change substantially between and within seasons. A driver whose style suits one car and not another has a narrower career.\n\n**Feedback.** Describing what the car is doing precisely enough that engineers can act on it is a genuine skill, and a driver who can do it makes the whole team faster.\n\n**Wet-weather driving.** Conditions where the car gives less information reward drivers who can find grip that is not obvious.\n\n**Mental load.** Managing energy, tyres, brake balance, radio instructions and a race situation simultaneously, at speed, for two hours.',
    example:
      'Two team-mates qualify within a tenth of each other all season. One consistently finishes ahead, because they arrive at the end of stints with more tyre left, make fewer errors in traffic, and give the engineers information that produces a better car by Sunday.',
    whyItMatters:
      'It explains why qualifying pace and race results diverge, and why teams evaluate drivers on far more than lap times. It also explains why the team-mate comparison is the standard measure: it is the only place the car is close to constant.',
    misunderstandings:
      '**"The fastest driver wins."** The fastest driver over one lap frequently does not. Races are two hours long and reward the whole set of skills, not one of them.\n\n**"You can see it on television."** Most of what separates elite drivers, tyre management, feedback quality, consistency, is not visible in a broadcast.',
    takeaways:
      '- Single-lap speed is the entry requirement, not the differentiator.\n- Tyre management gives a team strategic options nobody else has.\n- Consistency across a race distance decides more results than peak pace.\n- Technical feedback makes the whole team faster.\n- Team-mate comparison is the fairest available measure, because the car is closest to constant.',
    related: [
      'tyre-management',
      'racecraft',
      'driver-consistency',
      'technical-feedback',
      'why-teammates-are-compared',
      'car-vs-driver-performance',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  technique({
    slug: 'throttle-control',
    title: 'Throttle Control',
    category: 'driving',
    difficulty: 'intermediate',
    order: 150,
    summary: 'Applying power at exactly the rate the rear tyres can accept.',
    oneSentence:
      'Throttle control is applying power progressively as the car straightens, using all the traction available without producing wheelspin.',
    theTechnique:
      '**Progressive application.** Power is fed in as steering is unwound, because a tyre cannot deliver maximum cornering and maximum traction at once.\n\n**Feel for the limit.** The driver senses the rear beginning to slip and holds the throttle at that point.\n\n**Short-shifting.** Changing up earlier than optimal reduces torque at the wheels, which helps traction on low-grip surfaces and preserves rear tyres.\n\n**Modulating mid-corner.** Small throttle adjustments change the car’s balance: adding throttle pushes the car wider, lifting tightens the line.',
    whenUsed:
      'At the exit of every corner, and continuously in wet or low-grip conditions where traction is marginal.',
    whyItMatters:
      'Exit speed is multiplied by the straight that follows, so throttle application is one of the highest-value skills in the sport. It is also the main determinant of rear tyre life: a driver who spins the rear tyres out of every slow corner will have nothing left by the end of a stint.',
    risks:
      'Too much throttle produces wheelspin, which is slow and destroys rear tyres. Too little leaves time on the table at every corner exit, which compounds around a lap.',
    misunderstandings:
      '**"Traction control does this."** Traction control is banned. Managing wheelspin is entirely the driver’s job, which is why wet races separate drivers so clearly.',
    related: [
      'corner-exit',
      'oversteer',
      'tyre-management',
      'differential-settings',
      'wet-weather-driving',
    ],
    era: 'Traction control was permitted in some earlier eras and is now prohibited.',
    ...TECHNICAL,
  }),

  technique({
    slug: 'racecraft',
    title: 'Racecraft Explained',
    category: 'driving',
    difficulty: 'intermediate',
    order: 160,
    summary: 'Everything about racing other cars that is not raw pace.',
    oneSentence:
      'Racecraft is the set of judgements a driver makes when racing others: when to attack, when to wait, how to defend, and how to manage the car and tyres while doing it.',
    theTechnique:
      '**Timing an attack.** Recognising when a rival is vulnerable, on old tyres, at a restart, after a mistake, rather than attacking continuously and achieving nothing.\n\n**Positioning.** Placing the car where the rival must respond, and being on the correct side of the track before the braking zone.\n\n**Patience.** Following at a distance that preserves tyres rather than sitting in dirty air for ten laps and ruining them.\n\n**Defending proportionately.** Knowing when a position is worth defending and when letting a much faster car past preserves everything else.\n\n**Awareness.** Tracking where rivals are on strategy as well as on track, since a car alongside may be on a different plan and not a threat at all.',
    whenUsed: 'Whenever there is another car within reach, which is most of a race.',
    whyItMatters:
      'Racecraft converts pace into positions. Two drivers with identical speed can finish several places apart because one chose their moments and the other spent the race attacking from too far back and destroying their tyres.',
    risks:
      'Aggressive racecraft risks contact, penalties and damage. The judgement is not only about what is possible but about what is worth the risk given the championship position and what is at stake.',
    misunderstandings:
      '**"Good racecraft means overtaking a lot."** It often means not attempting a pass that would fail, and taking the position two laps later when it is available cleanly.',
    related: [
      'defensive-driving',
      'how-overtaking-works',
      'tyre-management',
      'what-makes-an-elite-driver',
      'dirty-air',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  technique({
    slug: 'wet-weather-driving',
    title: 'Wet-Weather Driving',
    category: 'driving',
    alsoIn: ['weather'],
    difficulty: 'advanced',
    order: 180,
    summary: 'Less grip, less visibility, less information, and much more separating the drivers.',
    oneSentence:
      'Driving in the wet requires finding grip that varies from corner to corner and lap to lap, with reduced visibility and a car that gives far less warning before it slides.',
    theTechnique:
      '**Off the racing line.** The dry line becomes the slippery line in the wet, because rubber laid into the surface holds water. Drivers deliberately run wide of it.\n\n**Smoother inputs.** Everything is more progressive: braking, steering and throttle, because sudden inputs exceed the reduced grip.\n\n**Earlier braking, later throttle.** Braking distances lengthen substantially and traction is marginal on exit.\n\n**Reading the track.** Standing water, drying patches and streams crossing the circuit all change lap by lap, and a driver has to update continuously.\n\n**Managing visibility.** Following another car in heavy spray means driving with almost no forward vision, which is why drivers back off rather than follow closely.',
    whenUsed: 'Whenever the track is wet or drying, which is a meaningful share of races.',
    whyItMatters:
      'Wet conditions reduce the advantage of the fastest car and increase the influence of the driver. Some of the sport’s most celebrated performances are wet races, precisely because the machinery mattered less than usual.',
    risks:
      'Aquaplaning is the specific danger: a tyre riding on a film of water has no grip at all and no warning, and the driver has no control until it reconnects.',
    misunderstandings:
      '**"Wet driving is just slower dry driving."** The racing line changes, the technique changes, and the information the car gives the driver changes. It is a different skill rather than a diluted one.',
    related: [
      'aquaplaning',
      'intermediate-tyres',
      'visibility-in-the-wet',
      'crossover-point',
      'correcting-slides',
      'how-rain-changes-f1',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),
];

/* ────────────────────────────────────────────────────────────────────────────
 * Car setup
 * ────────────────────────────────────────────────────────────────────────── */

const SETUP: ExplainerSeed[] = [
  technical({
    slug: 'car-setup-explained',
    title: 'F1 Car Setup Explained',
    category: 'car-setup',
    isStartHere: true,
    isFeatured: true,
    difficulty: 'intermediate',
    order: 10,
    readMinutes: 5,
    summary:
      'The adjustable settings that decide how the car behaves, and why every one is a compromise.',
    oneSentence:
      'Setup is the collection of adjustable parameters, wings, ride height, suspension, bias and pressures, chosen before qualifying to give the best compromise across a whole weekend.',
    howItWorks:
      '**Aerodynamic.** Front and rear wing levels, which set the downforce and drag trade.\n\n**Ride height and rake.** How the floor sits relative to the road, which is the most performance-sensitive setting on the car.\n\n**Mechanical.** Springs, dampers and anti-roll bars, governing how the car responds to bumps, kerbs and load transfer.\n\n**Geometry.** Camber and toe, which determine how the tyre contacts the road under cornering loads.\n\n**Cockpit-adjustable.** Brake bias and differential settings, which the driver changes during the race.\n\n**Tyre pressures.** Partly a team choice and partly mandated by the supplier for safety.\n\n**It is frozen at qualifying.** Parc fermé means the setup chosen on Saturday morning is the one raced on Sunday.',
    whyItMatters:
      'Setup is where a team converts an understanding of the circuit into lap time. It is also the clearest illustration that there is no single fastest configuration: every choice helps one thing and hurts another, and the correct answer depends on the track, the weather, the tyres and the driver.',
    example:
      'A team can set the car up for a fast qualifying lap or for consistent race pace. Because parc fermé freezes the setup at the start of qualifying, they must choose one, and the choice is usually a compromise that is optimal for neither.',
    tradeoffs:
      'Every axis is a trade. More downforce costs straight-line speed. Lower ride height gains downforce and risks plank wear. A stiffer car is faster on a smooth track and unusable over kerbs. Higher pressures aid warm-up and hurt degradation.',
    misunderstandings:
      '**"There is an optimal setup."** There is an optimal setup for a specified circuit, condition, tyre and driver. Change any of those and it is no longer optimal.\n\n**"Teams can fix a bad setup on Sunday."** Parc fermé prevents it. A car set up wrongly on Saturday is raced that way, unless the team accepts a pit lane start.',
    related: [
      'parc-ferme',
      'why-teams-compromise-setup',
      'qualifying-vs-race-setup',
      'ride-height',
      'brake-bias',
      'aerodynamic-balance',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  technical({
    slug: 'front-wing-setup',
    title: 'Front Wing Setup',
    category: 'car-setup',
    difficulty: 'intermediate',
    order: 20,
    summary: 'The main balance adjustment, and one of the few permitted under parc fermé.',
    oneSentence:
      'Front wing angle sets how much downforce acts over the front axle, and adjusting it is the primary way of shifting the car’s balance between understeer and oversteer.',
    howItWorks:
      '**More angle.** More front downforce, a sharper front end, more tendency toward oversteer.\n\n**Less angle.** Less front downforce, more stability, more tendency toward understeer.\n\n**It is adjustable under parc fermé.** Front wing flap angle is on the short list of permitted changes between qualifying and the race, which makes it the main tool available once the setup is otherwise frozen.\n\n**It is adjusted on the grid.** Teams frequently change it after the formation lap or during a pit stop, in response to conditions or driver feedback.',
    whyItMatters:
      'Because almost everything else is frozen, front wing angle carries a disproportionate share of the setup work available during a race weekend. A team that reads the conditions correctly on the grid can correct a balance problem that would otherwise last two hours.',
    example:
      'Rain falls before the start. The team adds front wing angle on the grid to compensate for the reduced front grip on a wet track, a change they could not have made to almost any other part of the car.',
    tradeoffs:
      'More front wing improves turn-in and makes the rear less stable, which costs the driver confidence in fast corners and increases rear tyre degradation.',
    misunderstandings:
      '**"Front wing is only about front downforce."** It also conditions the airflow reaching the floor, so a change affects the whole car rather than just the front axle.',
    related: ['front-wing', 'aerodynamic-balance', 'understeer', 'parc-ferme', 'rear-wing-setup'],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  technical({
    slug: 'rear-wing-setup',
    title: 'Rear Wing Setup',
    category: 'car-setup',
    difficulty: 'intermediate',
    order: 30,
    summary: 'The circuit-level choice between cornering grip and straight-line speed.',
    oneSentence:
      'Rear wing specification sets the car’s overall downforce and drag level, and is chosen per circuit according to how much of the lap is spent cornering rather than accelerating.',
    howItWorks:
      '**Bigger wing.** More rear downforce, more traction and stability, more drag and lower top speed.\n\n**Smaller wing.** Less downforce, higher top speed, a less stable car under braking and in fast corners.\n\n**Chosen per circuit.** Teams bring several specifications to each event and select based on simulation and practice.\n\n**It sets the balance target.** The rear wing establishes the overall level, and the front wing is then trimmed to balance against it.\n\n**It is frozen at qualifying.** Unlike front wing angle, the rear wing specification cannot be changed under parc fermé.',
    whyItMatters:
      'The rear wing is the most consequential setup decision of the weekend, because it cannot be changed after qualifying and it determines whether the car is quick in the corners or on the straights for the entire event.',
    example:
      'A team qualifies with a low-drag wing to maximise their grid position on a circuit with long straights. In the race they find they cannot defend in the corners, and they cannot change it, so they race a car optimised for a lap they have already completed.',
    tradeoffs:
      'A low-drag setup makes a car quick on the straights and vulnerable in the corners, and also easier to follow closely, which cuts both ways: it is harder to be passed under DRS and harder to hold a position through a corner sequence.',
    misunderstandings:
      '**"They can swap the rear wing before the race."** Not without breaking parc fermé and starting from the pit lane.',
    related: [
      'rear-wing',
      'downforce-vs-drag',
      'high-downforce-setup',
      'low-downforce-setup',
      'parc-ferme',
      'monaco-vs-monza',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  technical({
    slug: 'suspension-setup',
    title: 'Suspension Setup',
    category: 'car-setup',
    difficulty: 'advanced',
    order: 40,
    summary: 'Springs, dampers and anti-roll bars, controlling how the car responds to everything.',
    oneSentence:
      'Suspension setup governs how the car reacts to bumps, kerbs and load transfer, and in the current era it also controls how consistently the floor is held at its optimal height.',
    howItWorks:
      '**Springs.** Stiffer springs keep the ride height more consistent, which the aerodynamics want, and transmit more of the track surface to the tyres, which they do not.\n\n**Dampers.** Control the rate at which the suspension moves, which determines how the car settles after a bump or a direction change.\n\n**Anti-roll bars.** Control how much the car leans in a corner, and the front-to-rear balance of that determines understeer and oversteer.\n\n**Aerodynamic priority.** Because the floor is so ride-height sensitive, modern cars are set up stiffer than mechanical grip alone would suggest, specifically to keep the aerodynamic platform stable.',
    whyItMatters:
      'Suspension is where the mechanical and aerodynamic requirements of the car conflict most directly. The aerodynamics want a rigid platform at a constant height; the tyres want compliance to follow the road surface. Every setup is a position between those two.',
    example:
      'A team stiffens the car to stabilise the floor and finds lap time on the smooth sections and loses more over the kerbs, where the car now skips rather than absorbing. On a circuit where the kerbs must be used, the stiffer setup is slower despite better aerodynamics.',
    tradeoffs:
      'Stiffer means better aerodynamic consistency and worse mechanical grip, kerb tolerance and tyre life. Softer means the reverse. Bumpy street circuits and smooth permanent circuits pull in opposite directions.',
    misunderstandings:
      '**"Active suspension would solve this."** It would, which is why it is banned. Cars must use passive suspension, and the compromise is deliberate.',
    related: [
      'suspension',
      'ride-height',
      'porpoising',
      'car-setup-explained',
      'kerbs',
      'track-surface',
    ],
    era: 'Active suspension was used briefly and is prohibited. Current suspension must be passive, and its aerodynamic role increased with the reintroduction of ground effect.',
    ...TECHNICAL,
  }),

  technical({
    slug: 'camber',
    title: 'Camber Explained',
    category: 'car-setup',
    difficulty: 'advanced',
    order: 50,
    summary: 'The tilt of the wheel, set so the tyre is flat on the road when it matters most.',
    oneSentence:
      'Camber is the angle at which a wheel leans relative to vertical, set negative so that as the car rolls in a corner the tyre’s contact patch sits flat on the road.',
    howItWorks:
      '**Negative camber** means the top of the wheel leans inward.\n\n**Why it helps.** In a corner the car rolls and the tyre deforms, which would otherwise lift the inside edge of the contact patch. Negative camber pre-compensates so the tyre is flat when loaded.\n\n**The cost.** In a straight line, a cambered tyre runs on its inner edge, which concentrates wear and raises temperature there.\n\n**Limits are set.** The tyre supplier specifies maximum camber for safety, because excessive camber overheats part of the tyre and can cause a failure.',
    whyItMatters:
      'Camber is one of the clearest examples of a setup parameter that helps in one part of the lap and hurts in another. A circuit with long, fast corners rewards more camber; one with long straights punishes it.',
    example:
      'A team runs more negative camber to improve cornering, and the inside shoulders of the front tyres overheat and blister over a long stint. They reduce it, lose a small amount of cornering performance, and gain a tyre that lasts the stint.',
    tradeoffs:
      'More camber means better cornering grip and worse straight-line wear and temperature distribution. It is set at the limit of what the tyre will tolerate over a race distance rather than at the limit of what is fastest in a corner.',
    misunderstandings:
      '**"Camber is a small detail."** It is one of the main levers for controlling tyre temperature across the tread, which makes it a degradation setting as much as a handling one.',
    related: [
      'toe',
      'tyre-pressures',
      'blistering',
      'suspension-setup',
      'car-setup-explained',
      'track-camber',
    ],
    era: 'Camber limits are set by the tyre supplier and revised as compounds change.',
    ...TECHNICAL,
  }),

  technical({
    slug: 'toe',
    title: 'Toe Explained',
    category: 'car-setup',
    difficulty: 'advanced',
    order: 60,
    summary: 'Whether the wheels point slightly inward or outward, trading response against drag.',
    oneSentence:
      'Toe is the angle at which the wheels point inward or outward when viewed from above, trading steering response and stability against tyre wear and drag.',
    howItWorks:
      '**Toe-out at the front** makes the car turn in more eagerly, because the outside wheel is already pointing into the corner.\n\n**Toe-in** increases straight-line stability at the cost of turn-in response.\n\n**It costs drag and temperature.** Any toe angle means the tyres are being dragged slightly sideways at all times, which scrubs speed and generates heat.\n\n**It is a small number with a large effect.** Toe is measured in fractions of a degree and is noticeable to the driver.',
    whyItMatters:
      'Toe is a fine adjustment for how responsive the car feels, and one of the few ways to change turn-in without altering the aerodynamic balance. Its cost in tyre temperature also makes it a tool for getting heat into tyres that are running cold.',
    example:
      'A team adds front toe-out to sharpen turn-in at a circuit with slow corners. The car responds better and the front tyres run hotter all lap, which helps on a cold day and would cause degradation problems on a hot one.',
    tradeoffs:
      'More toe means more response and more drag, wear and heat. Less means a more stable, more efficient car that is less willing to change direction.',
    misunderstandings:
      '**"Toe should be zero for efficiency."** Zero toe is the lowest-drag setting and is rarely the fastest, because the response and tyre temperature benefits usually outweigh the drag cost.',
    related: [
      'camber',
      'suspension-setup',
      'tyre-temperature',
      'understeer',
      'car-setup-explained',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  technical({
    slug: 'brake-bias',
    title: 'Brake Bias',
    category: 'car-setup',
    alsoIn: ['driving'],
    difficulty: 'advanced',
    order: 70,
    summary: 'The cockpit control drivers use most, shifting braking effort front to rear.',
    oneSentence:
      'Brake bias is the adjustable front-to-rear distribution of braking effort, changed by the driver from the cockpit throughout a race as fuel burns off and tyres wear.',
    howItWorks:
      '**Forward.** More stable, less likely to spin, more likely to lock a front and understeer on entry.\n\n**Rearward.** Helps the car rotate into a corner, and risks locking a rear, which usually means a spin.\n\n**It must move during a race.** As fuel burns off, weight comes off the rear, so the bias generally needs to move forward through a stint.\n\n**Corner by corner.** Many drivers adjust between corner types within a single lap.\n\n**It interacts with recovery.** Because the MGU-K harvests at the rear, the effective rear braking varies with battery state, which brake-by-wire compensates for.',
    whyItMatters:
      'Brake bias is the driver’s most immediate tool for changing the car’s behaviour, and one of very few adjustments available once parc fermé applies. Much of what sounds like routine radio traffic is bias management.',
    example:
      'A driver locks a front tyre into a hairpin. They move the bias one click rearward for that corner, and the car rotates properly on the next lap without locking.',
    tradeoffs:
      'The setting that prevents front lock-ups makes rear lock-ups more likely, and a rear lock-up is far more expensive because it usually ends in a spin.',
    misunderstandings:
      '**"Brake bias is set before the race."** A starting value is, and the driver then changes it continuously. It is a live control rather than a static setting.',
    related: [
      'brake-balance',
      'lock-up',
      'trail-braking',
      'brake-by-wire',
      'car-setup-explained',
      'flat-spots',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  technical({
    slug: 'differential-settings',
    title: 'Differential Settings',
    category: 'car-setup',
    difficulty: 'advanced',
    order: 80,
    summary:
      'How much the rear wheels are allowed to turn at different speeds, and what that does to the car.',
    oneSentence:
      'The differential controls how much the two rear wheels may rotate at different speeds, which determines how readily the car turns and how well it puts power down on corner exit.',
    howItWorks:
      '**A locked differential** forces both rear wheels to turn at the same rate. This is good for traction and makes the car reluctant to turn, because the inside and outside wheels want to travel different distances through a corner.\n\n**An open differential** lets them turn freely at different speeds, which helps the car rotate and costs traction.\n\n**Settings vary by phase.** Teams set different behaviour for corner entry, mid-corner and exit, so the differential can help rotation on entry and lock up for traction on exit.\n\n**Driver-adjustable.** The settings can be changed from the cockpit, in the same way as brake bias.',
    whyItMatters:
      'The differential is one of the main tools for curing a car that will not turn in slow corners without changing the aerodynamics. It also has a direct effect on rear tyre life, since a setting that produces wheelspin on exit will destroy the rear tyres over a stint.',
    example:
      'A driver complains of understeer in slow corners. Opening the differential on entry lets the car rotate, solving the complaint at the cost of slightly less traction on the way out.',
    tradeoffs:
      'More locking means better traction and more understeer; less means better rotation and more wheelspin. Both extremes are hard on the rear tyres for opposite reasons.',
    misunderstandings:
      '**"The differential is a fixed mechanical part."** Its behaviour is adjustable and phase-dependent, and drivers change it during a race.',
    related: [
      'corner-exit',
      'throttle-control',
      'understeer',
      'car-setup-explained',
      'tyre-management',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  technical({
    slug: 'tyre-pressures',
    title: 'Tyre Pressures',
    category: 'car-setup',
    alsoIn: ['tyres'],
    difficulty: 'advanced',
    order: 90,
    summary:
      'Partly a setup choice, partly a safety mandate, and a large influence on degradation.',
    oneSentence:
      'Tyre pressures affect the shape and temperature of the contact patch, and minimum pressures are mandated by the supplier for safety, which limits how far teams can optimise them.',
    howItWorks:
      '**Higher pressure.** The tyre is stiffer, warms up faster, and has a smaller contact patch. Less grip, sometimes better degradation, and less risk of structural failure.\n\n**Lower pressure.** A larger contact patch and more grip, with more flexing, more heat build-up in the carcass, and greater risk of failure.\n\n**Minimums are mandated.** The tyre supplier specifies minimum starting pressures for each event, and they are checked. Running below them is a technical infringement.\n\n**Pressure rises with temperature.** The starting pressure is not the running pressure, so teams set the cold value to achieve a target once the tyre is hot.',
    whyItMatters:
      'Pressures are one of the strongest influences on degradation and warm-up, and because the minimums are mandated, everybody is working in a narrow band. That makes small differences in how a team manages pressures a real competitive advantage.',
    example:
      'A team sets a starting pressure knowing it will rise substantially once the tyre reaches working temperature. If the track is cooler than expected, the tyre never reaches the target, the contact patch is wrong, and the car is slower all stint for reasons that have nothing to do with the setup they chose.',
    tradeoffs:
      'Lower pressure gives grip and risks overheating the carcass and failing. The mandated minimum exists precisely because teams would otherwise run pressures that are fast and unsafe.',
    misunderstandings:
      '**"Teams choose their pressures."** They choose within a mandated minimum, and the minimum is set for safety after tyre failures caused by teams running very low pressures.',
    related: [
      'tyre-temperature',
      'tyre-warm-up',
      'tyre-degradation',
      'blistering',
      'camber',
      'technical-infringements',
    ],
    era: 'Mandatory minimum pressures were introduced after tyre failures attributed to low-pressure running, and the values are set per event by the supplier.',
    ...TECHNICAL,
  }),

  technical({
    slug: 'wet-setup',
    title: 'Wet Setup',
    category: 'car-setup',
    alsoIn: ['weather'],
    difficulty: 'advanced',
    order: 100,
    summary: 'More downforce, higher ride height, softer settings, and a bet you cannot take back.',
    oneSentence:
      'A wet setup runs more downforce, a higher ride height and softer mechanical settings to find grip on a low-grip surface, and because of parc fermé it must be chosen before qualifying.',
    howItWorks:
      '**More downforce.** With less mechanical grip available, aerodynamic grip matters more and the drag penalty matters less at lower speeds.\n\n**Higher ride height.** Standing water and reduced downforce both make bottoming out more likely, and the floor is less effective in the wet anyway.\n\n**Softer settings.** More compliance helps the tyres find grip on a slippery surface.\n\n**Higher brake bias forward**, typically, to reduce the risk of locking a rear on a low-grip surface.\n\n**The timing problem.** Parc fermé begins at qualifying, so the wet setup must be chosen before the race conditions are known.',
    whyItMatters:
      'The wet setup decision is one of the highest-stakes bets of a weekend. A team that sets up for rain and races in the dry has compromised its qualifying position and its race pace; a team that sets up for the dry and races in the wet has a car the driver cannot use.',
    example:
      'Rain is forecast for Sunday. A team adds downforce before qualifying, qualifies two places lower than they might have, and the rain does not arrive. They race a draggy car from a worse grid slot, and every part of that was a reasonable decision at the time.',
    tradeoffs:
      'It is an unhedgeable bet. There is no configuration that is good in both conditions, and the choice must be made before the information needed to make it is available.',
    misunderstandings:
      '**"They can change setup if it rains."** Parc fermé prevents it. The only permitted responses are front wing angle, tyre choice and a pit lane start.',
    related: [
      'parc-ferme',
      'weather-strategy',
      'how-rain-changes-f1',
      'wet-weather-driving',
      'car-setup-explained',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  article({
    slug: 'why-teams-compromise-setup',
    title: 'Why Teams Compromise Setup',
    category: 'car-setup',
    difficulty: 'intermediate',
    order: 110,
    summary:
      'Because one car has to do several incompatible jobs and cannot be changed between them.',
    oneSentence:
      'Every setup is a compromise because the car must serve qualifying and the race, fast corners and slow ones, and both drivers, with parc fermé preventing any change between them.',
    explanation:
      'A setup is a single set of values that must work across every situation the weekend contains. Those situations want different things, and the regulations prevent switching between them.',
    howItWorks:
      '**Qualifying against the race.** A low-drag, aggressive setup produces a better lap; a balanced, tyre-friendly one produces a better race. Parc fermé forces one choice.\n\n**Corner types.** A setup optimised for fast corners is rarely optimal for slow ones, and most circuits have both.\n\n**Conditions.** Track temperature changes between sessions, and a setup optimal on a cool Saturday may not be on a hot Sunday.\n\n**Two drivers.** Team-mates often prefer different balances, and while each car is set up separately, both share the same parts and development direction.\n\n**Reliability.** Some fast settings shorten component life, and a team races the setting that survives.',
    example:
      'A car is quickest with a low-drag rear wing and burns its rear tyres doing it. Over a lap that is worth two tenths; over a stint it is worth an extra pit stop. The team fits a larger wing, qualifies lower, and finishes higher.',
    whyItMatters:
      'It explains why teams appear to leave performance on the table. A setup that is not the fastest over one lap is frequently the correct one for the two hours that decide the result.',
    misunderstandings:
      '**"They should just set the car up to be fastest."** Fastest at what? The question has several answers and the regulations allow only one setup to serve them all.',
    related: [
      'car-setup-explained',
      'qualifying-vs-race-setup',
      'parc-ferme',
      'rear-wing-setup',
      'tyre-degradation',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  technical({
    slug: 'qualifying-vs-race-setup',
    title: 'Qualifying Setup vs Race Setup',
    category: 'car-setup',
    difficulty: 'advanced',
    order: 120,
    summary: 'Two incompatible optima, one car, and a rule that makes you pick.',
    oneSentence:
      'A qualifying setup maximises single-lap pace on low fuel and fresh tyres, a race setup maximises consistency over a stint on high fuel, and parc fermé means a team must choose one.',
    howItWorks:
      '**Qualifying wants** less drag, more aggressive geometry, settings that generate tyre temperature quickly, and no concern for degradation.\n\n**The race wants** more stability, gentler tyre usage, better behaviour in traffic and dirty air, and settings that survive a full distance.\n\n**Fuel changes everything.** A car set up on low fuel behaves differently with a full tank, and the balance shifts as the fuel burns off.\n\n**Parc fermé forces the choice.** The setup is frozen from the start of qualifying, so a team cannot optimise for both.\n\n**The choice depends on the circuit.** Where overtaking is impossible, teams lean toward qualifying; where it is easy, toward the race.',
    whyItMatters:
      'This is the decision that most often explains a car qualifying well and racing badly, or the reverse. It is a deliberate strategic choice rather than a failure of execution.',
    example:
      'At a circuit where passing is nearly impossible, a team sets the car up for qualifying, gains two grid positions and races a car that is harder on its tyres. At a circuit with long DRS zones, the same team makes the opposite choice.',
    tradeoffs:
      'Leaning toward qualifying buys track position and costs race pace. Leaning toward the race buys pace and costs the track position needed to use it. Neither is right in general; both are right somewhere.',
    misunderstandings:
      '**"A car that qualifies badly and races well was set up wrongly."** It was frequently set up deliberately, and at the right circuit that is the better choice.',
    related: [
      'parc-ferme',
      'why-teams-compromise-setup',
      'car-setup-explained',
      'track-position-vs-fresh-tyres',
      'why-some-circuits-are-hard-to-overtake',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),
];

export const FORMULA1_DRIVING: ExplainerSeed[] = [...DRIVING, ...SETUP];
