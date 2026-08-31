import type { CarDiagramShape, ExplainerSeed } from './explainer-types';
import { article, component, technical } from './formula1-explainer-helpers';
import { CURRENT_ERA, TECHNICAL } from './formula1-explainers';

/**
 * The car, aerodynamics and the power unit.
 *
 * Three of the brief's categories in one file, because they describe one
 * machine. The brief lists the diffuser, the wings and the floor under both
 * "F1 Car Basics" and "Aerodynamics"; each is a single row here, typed
 * `car_component`, filed under the car and reaching aerodynamics through
 * `alsoIn`. The physics that is not a part of the car, downforce, drag, ground
 * effect, is typed as a concept and filed under aerodynamics.
 *
 * ## On the era problem
 *
 * This is the part of the library most vulnerable to going out of date, and in
 * the most misleading way. A reader who learns how a Formula 1 car generates
 * downforce learns something that was false before 2022 and will be partly
 * false again after the next rewrite. Every entry here therefore carries an
 * explicit era note, and the technical regulations are cited rather than the
 * sporting ones.
 *
 * ## On numbers
 *
 * Power outputs, downforce figures and component counts are deliberately
 * absent or given as rough magnitudes. They are regulated values that change,
 * and a precise figure in prose is a maintenance liability with no reader
 * benefit: nobody needs to know the exact horsepower to understand why a
 * turbocharger exists.
 */

/** The labelled car diagram the brief asks for by name. */
const CAR_ANATOMY: CarDiagramShape = {
  car: 'side',
  caption:
    'The major components of a current Formula 1 car, seen from the side. The floor, which produces most of the downforce, runs the length of the car beneath everything else.',
  parts: [
    { name: 'Front wing', x: 6, y: 72, note: 'Generates downforce and directs air around the car' },
    { name: 'Nose', x: 14, y: 58, note: 'Structural, and shapes the air reaching the floor' },
    { name: 'Front suspension', x: 24, y: 66, note: 'Also an aerodynamic surface' },
    { name: 'Halo', x: 40, y: 30, note: 'Titanium structure protecting the driver’s head' },
    { name: 'Cockpit', x: 38, y: 46, note: 'Part of the survival cell' },
    { name: 'Monocoque', x: 33, y: 55, note: 'The carbon fibre survival cell' },
    {
      name: 'Sidepod',
      x: 52,
      y: 55,
      note: 'Houses radiators; its shape governs airflow to the rear',
    },
    { name: 'Air intake', x: 50, y: 28, note: 'Feeds the engine above the driver’s head' },
    { name: 'Power unit', x: 62, y: 50, note: 'Turbocharged V6 with two energy recovery systems' },
    { name: 'Floor', x: 50, y: 78, highlight: true, note: 'Produces most of the car’s downforce' },
    { name: 'Diffuser', x: 76, y: 76, note: 'Expands airflow leaving the floor' },
    { name: 'Gearbox', x: 74, y: 58, note: 'Eight forward ratios, seamless shift' },
    { name: 'Rear wing', x: 86, y: 34, note: 'Downforce, and the DRS flap' },
    { name: 'Rear suspension', x: 78, y: 66 },
  ],
};

/* ────────────────────────────────────────────────────────────────────────────
 * The car
 * ────────────────────────────────────────────────────────────────────────── */

const CAR: ExplainerSeed[] = [
  article({
    slug: 'how-an-f1-car-works',
    title: 'How an F1 Car Works',
    category: 'the-car',
    isStartHere: true,
    isFeatured: true,
    order: 10,
    readMinutes: 6,
    summary:
      'Four systems working together: aerodynamics, tyres, brakes and the hybrid power unit.',
    oneSentence:
      'A Formula 1 car is a carbon fibre survival cell with a hybrid power unit behind the driver, wrapped in bodywork whose primary job is to press the car onto the road hard enough to corner at forces a road car cannot approach.',
    explanation:
      'It helps to think of the car as four systems rather than one machine.\n\n**The aerodynamics** produce downforce, which is what allows the extraordinary cornering and braking. Most of it now comes from the floor rather than the wings.\n\n**The tyres** convert that downforce into grip. They are the only part of the car touching the road, and they are the largest performance variable in a race.\n\n**The brakes** are carbon discs that work only when very hot and can decelerate the car at forces that would injure an untrained person.\n\n**The power unit** is a small turbocharged engine combined with two electrical recovery systems, producing a great deal of power from a strictly limited amount of fuel.\n\nAround all of it is the monocoque, a carbon survival cell designed so the driver’s compartment stays intact when everything else is destroyed.',
    howItWorks:
      '**Air does the work.** At speed, the downforce acting on the car exceeds its own weight. This is why the car is far more capable at high speed than at low speed.\n\n**The floor is the main aerodynamic device.** Shaped tunnels underneath accelerate air, lowering its pressure and sucking the car down.\n\n**Power goes to the rear wheels only**, through an eight-speed gearbox with seamless shifts.\n\n**Energy is recovered.** Braking and exhaust heat both charge a battery, which is deployed for additional power.\n\n**Everything is a compromise with everything else.** More downforce means more drag; more cooling means worse aerodynamics; a stiffer car is faster over a smooth track and slower over a bumpy one.',
    diagram: CAR_ANATOMY,
    example:
      'Through a high-speed corner the car generates more downward force than it weighs. In the pit lane, at walking pace, that force is essentially zero and the car has no more mechanical grip than its tyres alone provide.',
    whyItMatters:
      'Understanding that downforce rises with speed explains most of the sport’s behaviour: why following closely is difficult, why the cars look unremarkable through slow corners, why setup is a compromise, and why the same car can be dominant at one circuit and ordinary at another.',
    misunderstandings:
      '**"It is basically a very powerful engine."** The power is comparable to some road cars. The cornering and braking are not remotely comparable, and that is where the lap time is.\n\n**"They are fragile."** The survival cell is extremely strong. What is fragile is the aerodynamic bodywork, which is designed to break away and absorb energy.',
    takeaways:
      '- Downforce, mostly from the floor, is the main reason the car is quick.\n- Grip increases with speed, so the car is least impressive at low speed.\n- The power unit is hybrid and unusually efficient rather than simply powerful.\n- Carbon brakes need heat to work at all.\n- Every setting is a compromise against another.',
    related: [
      'anatomy-of-an-f1-car',
      'downforce',
      'power-unit-explained',
      'brakes',
      'what-makes-an-f1-car-different',
    ],
    era: 'This describes cars built to the current technical regulations, in which most downforce is generated by the floor. Earlier generations produced it largely through bodywork and wings, and behaved differently when following another car.',
    ...TECHNICAL,
  }),

  component({
    slug: 'anatomy-of-an-f1-car',
    title: 'Anatomy of an F1 Car',
    category: 'the-car',
    isStartHere: true,
    order: 20,
    summary: 'Every major component, where it is, and what it does.',
    oneSentence:
      'A Formula 1 car is built around a carbon monocoque, with the power unit behind the driver, aerodynamic surfaces front and rear, and a floor running the length of the car that produces most of the downforce.',
    onTheCar:
      '**Front to back:** front wing, nose, front suspension, monocoque with the cockpit and halo, sidepods housing the radiators, the power unit, the gearbox, rear suspension, and the rear wing. The floor and diffuser run underneath the whole length.',
    howItWorks:
      '**The monocoque** is the structural core. Everything else bolts to it, and it is the part designed to keep the driver alive.\n\n**The front wing** generates downforce and, just as importantly, directs air around the front wheels and toward the floor.\n\n**The floor** produces most of the downforce through shaped tunnels underneath.\n\n**The sidepods** house radiators and shape the airflow travelling to the rear of the car.\n\n**The power unit and gearbox** are structural members as well as mechanical ones: the rear suspension mounts to the gearbox.\n\n**The rear wing** adds downforce at the back and carries the DRS flap.\n\n**The halo** sits above the cockpit, protecting the driver’s head.',
    diagram: CAR_ANATOMY,
    whyItMatters:
      'Knowing where the parts are makes the rest of the technical content legible. A discussion of floor upgrades, porpoising or a damaged front wing endplate assumes the reader can place the component, and most cannot without a diagram.',
    misunderstandings:
      '**"The wings do most of the aerodynamic work."** In the current regulations the floor does. The wings matter, and they are not the main source of downforce.',
    related: ['how-an-f1-car-works', 'monocoque', 'floor', 'front-wing', 'rear-wing', 'halo'],
    era: 'Component layout reflects the current technical regulations. The relative importance of floor and wings has changed substantially between regulation eras.',
    ...TECHNICAL,
  }),

  component({
    slug: 'monocoque',
    title: 'Monocoque Explained',
    category: 'the-car',
    difficulty: 'intermediate',
    order: 40,
    summary: 'The carbon fibre survival cell the whole car is built around.',
    oneSentence:
      'The monocoque is the single-piece carbon fibre structure that contains the cockpit and fuel cell, forms the car’s structural core, and is designed to remain intact in an accident that destroys everything attached to it.',
    onTheCar:
      'The central section of the car. The driver sits inside it, the fuel cell is behind them, the front suspension mounts to its front, and the power unit bolts to its rear.',
    howItWorks:
      '**One piece.** Built from carbon fibre laid up in a mould and cured, rather than assembled from parts.\n\n**Structural.** It carries the loads from the suspension, the power unit and the aerodynamics.\n\n**A survival cell.** It must pass mandatory static and dynamic crash tests before the car may race.\n\n**Energy is absorbed outside it.** Impact structures front and rear, and the bodywork itself, are designed to break up and dissipate energy so the cell does not have to.\n\n**Anti-intrusion panels** protect against penetration from debris in a side impact.',
    whyItMatters:
      'The monocoque is the single largest reason Formula 1 accidents are survivable. Drivers routinely walk away from impacts that destroy the car entirely, which is a direct consequence of the survival cell doing its job while everything around it is sacrificed.',
    misunderstandings:
      '**"The car falling apart is a failure."** It is the design intent. Wings, wheels and bodywork detaching absorbs energy that would otherwise reach the driver.\n\n**"Carbon fibre is brittle."** In this application it is exceptionally strong for its weight, and the structure is engineered so that the parts meant to fail do and the cell does not.',
    related: ['chassis', 'halo', 'anatomy-of-an-f1-car', 'scrutineering', 'minimum-weight'],
    era: 'Crash test requirements have been progressively strengthened throughout the sport’s history and continue to be.',
    ...TECHNICAL,
  }),

  component({
    slug: 'front-wing',
    title: 'Front Wing Explained',
    category: 'the-car',
    alsoIn: ['aerodynamics'],
    order: 50,
    summary: 'Downforce at the front, and the first thing that decides where the air goes.',
    oneSentence:
      'The front wing generates downforce over the front axle and conditions the airflow for the entire rest of the car, which makes it the most aerodynamically influential component despite not producing the most downforce.',
    onTheCar:
      'At the very front, mounted to the nose. It is the first part of the car to meet undisturbed air.',
    howItWorks:
      '**Downforce over the front axle.** Multiple elements generate load, balancing the downforce produced at the rear.\n\n**Flow conditioning.** The wing’s endplates and elements direct air around the front wheels, which are large, rotating, and aerodynamically disastrous if the air is allowed to hit them directly.\n\n**Feeding the floor.** Much of the wing’s job is delivering clean, well-directed air to the floor behind it.\n\n**Adjustable.** The front wing flap angle is one of the few things teams may adjust under parc fermé, which makes it the primary tool for correcting balance between qualifying and the race.\n\n**Fragile by design.** It is the first thing to make contact and is built to break away.',
    whyItMatters:
      'Because it conditions the air for everything downstream, front wing damage costs far more performance than the wing itself produces. A driver who loses part of an endplate can lose significant downforce at the rear of the car, which is why a small piece of visible damage often forces a pit stop.',
    misunderstandings:
      '**"A damaged front wing only affects the front."** It disrupts the airflow to the floor and rear wing, so the effect is felt across the whole car.\n\n**"Front wing adjustment is a minor tweak."** It is the main balance adjustment available to a team once parc fermé applies.',
    related: [
      'front-wing-aerodynamics',
      'front-wing-setup',
      'aerodynamic-balance',
      'floor',
      'parc-ferme',
      'understeer',
    ],
    era: 'Front wing geometry is tightly regulated and has been substantially redesigned at each major regulation change, most recently to reduce the wake the car leaves behind.',
    ...TECHNICAL,
  }),

  component({
    slug: 'rear-wing',
    title: 'Rear Wing Explained',
    category: 'the-car',
    alsoIn: ['aerodynamics'],
    order: 60,
    summary: 'Downforce at the back, stability under braking, and the home of DRS.',
    oneSentence:
      'The rear wing produces downforce over the rear axle, providing the stability that lets a driver brake and accelerate hard, and carries the movable flap used for DRS.',
    onTheCar: 'At the rear of the car, mounted above the diffuser and behind the gearbox.',
    howItWorks:
      '**Rear downforce.** Loads the rear tyres, which is what allows hard acceleration without wheelspin and stable braking without the rear stepping out.\n\n**Drag.** The rear wing is a major source of drag, which is why wing level is the primary setup choice between a fast circuit and a slow one.\n\n**DRS.** The upper flap opens when permitted, reducing both downforce and drag for higher straight-line speed.\n\n**Wing level is a circuit choice.** A high-downforce configuration for a twisty track, a shallow one for a power circuit.',
    whyItMatters:
      'The rear wing is the most visible expression of the downforce-versus-drag trade. Teams arrive at Monaco and Monza with visibly different rear wings, and the difference is a direct statement about which the circuit rewards.',
    misunderstandings:
      '**"More rear wing is always better for grip."** It is better for cornering and worse for straight-line speed, and at a circuit dominated by straights the net effect on lap time is negative.\n\n**"DRS removes the rear wing’s downforce entirely."** It opens a flap, reducing both downforce and drag. The wing still works.',
    related: [
      'rear-wing-aerodynamics',
      'rear-wing-setup',
      'drs',
      'drag',
      'downforce-vs-drag',
      'monaco-vs-monza',
    ],
    era: 'Rear wing regulations, including DRS, are current. DRS did not exist in earlier eras.',
    ...TECHNICAL,
  }),

  component({
    slug: 'floor',
    title: 'Floor Explained',
    category: 'the-car',
    alsoIn: ['aerodynamics'],
    difficulty: 'intermediate',
    order: 70,
    summary: 'The underside of the car, and the source of most of its downforce.',
    oneSentence:
      'The floor is the flat and shaped underside of the car, which under the current regulations generates the majority of its downforce by accelerating air through tunnels beneath it.',
    onTheCar:
      'The entire underside, running from behind the front wheels to the diffuser at the rear.',
    howItWorks:
      '**Ground effect.** Shaped tunnels accelerate air passing under the car. Faster-moving air has lower pressure, so the higher pressure above pushes the car down.\n\n**Ride height is critical.** The effect strengthens as the floor gets closer to the ground, which is why teams run the cars as low as they dare.\n\n**The plank.** A wooden plank beneath the floor must not wear beyond a set limit, which is how the regulations stop teams running the car dangerously low. Excessive wear is a disqualification.\n\n**Edges and fences.** The floor’s edges seal the low-pressure region from the air outside, and much development effort goes into that sealing.\n\n**Sensitive to damage.** Floor damage costs a great deal of downforce and is often invisible from outside the car.',
    whyItMatters:
      'The floor is why the current cars are what they are. Moving downforce generation underneath the car was a deliberate regulatory choice, made because floor-generated downforce is less disrupted by a car ahead, which was intended to make following and overtaking easier.',
    misunderstandings:
      '**"The floor is just a flat panel."** It is the most aerodynamically sophisticated part of the car and the main development battleground.\n\n**"Running lower is always faster."** Lower is faster until the plank wears too much, the car bottoms out, or porpoising begins.',
    related: [
      'ground-effect',
      'venturi-tunnels',
      'diffuser',
      'ride-height',
      'porpoising',
      'floor-aerodynamics',
    ],
    era: 'Floor-generated ground effect is central to the current technical regulations. Earlier eras restricted underbody aerodynamics heavily and generated downforce mostly through bodywork and wings.',
    ...TECHNICAL,
  }),

  component({
    slug: 'diffuser',
    title: 'Diffuser Explained',
    category: 'the-car',
    alsoIn: ['aerodynamics'],
    difficulty: 'advanced',
    order: 80,
    summary: 'The upswept rear section of the floor that makes the whole underbody work.',
    oneSentence:
      'The diffuser is the expanding section at the rear of the floor, which slows and re-pressurises the air leaving the underbody and in doing so increases the suction generated along the whole floor.',
    onTheCar: 'The rearmost part of the floor, sweeping upward beneath the back of the car.',
    howItWorks:
      '**Expansion.** The diffuser’s cross-section grows toward the rear. Air leaving the floor expands into it, slowing down and rising back toward ambient pressure.\n\n**It pulls air through.** By providing somewhere for the air to expand into, the diffuser increases the speed of air under the whole floor, which lowers pressure there and increases downforce.\n\n**Efficiency.** Downforce from the diffuser carries far less drag penalty than downforce from a wing, which makes underbody aerodynamics the most efficient available.\n\n**It is sensitive.** Ride height, rake and the condition of the floor edges all change how well it works, and the rear wing above it influences the flow it operates in.',
    whyItMatters:
      'The diffuser is the reason the floor works at all. Without somewhere for the air to expand, the underbody would not generate the pressure difference that produces ground effect. It is also the clearest example of why aerodynamic downforce is preferred to mechanical grip: it costs very little drag.',
    misunderstandings:
      '**"The diffuser sucks the car down."** It does not act directly. It conditions the air leaving the floor so that the floor generates more suction, which is an indirect but much larger effect.',
    related: ['floor', 'ground-effect', 'venturi-tunnels', 'ride-height', 'rear-wing', 'downforce'],
    era: 'Diffuser dimensions and geometry are tightly regulated and have changed at every major technical rewrite.',
    ...TECHNICAL,
  }),

  component({
    slug: 'brakes',
    title: 'Brakes Explained',
    category: 'the-car',
    alsoIn: ['driving'],
    difficulty: 'intermediate',
    order: 130,
    summary:
      'Carbon discs that only work when glowing, and stop the car harder than it accelerates.',
    oneSentence:
      'Formula 1 brakes use carbon fibre discs and pads that operate at very high temperatures, producing deceleration forces greater than the car’s acceleration and requiring careful thermal management.',
    onTheCar:
      'One disc and caliper inside each wheel, with ducts feeding cooling air to them, sized differently front and rear because the front axle does most of the braking.',
    howItWorks:
      '**Carbon on carbon.** Both disc and pads are carbon composite, which tolerates extreme temperature and is very light.\n\n**They need heat.** Below their operating window carbon brakes have little friction, which is why a driver on an out lap brakes hard for no apparent reason.\n\n**They can overheat.** Above the window they wear rapidly and lose effectiveness, so brake duct sizing is a real setup decision.\n\n**Brake-by-wire at the rear.** The rear brakes are managed electronically to blend friction braking with energy recovery.\n\n**Bias is adjustable.** The driver can shift the front-to-rear split from the cockpit, and does so throughout a race as fuel burns off and tyres wear.',
    whyItMatters:
      'Braking performance is where a large share of lap time and nearly all overtaking lives. It is also a thermal management problem rather than purely a mechanical one, which is why brake temperature appears constantly on team radio.',
    misunderstandings:
      '**"Bigger brakes mean shorter stopping distances."** The limit is tyre grip, not brake capacity. The brakes can lock the wheels at almost any speed; the skill is in not doing so.\n\n**"Brakes work the same all race."** They do not. Cold brakes underperform, hot brakes fade, and the correct braking point moves accordingly.',
    related: [
      'how-f1-cars-brake',
      'brake-balance',
      'brake-by-wire',
      'lock-up',
      'brake-temperature',
      'trail-braking',
    ],
    era: 'Brake-by-wire on the rear axle is a feature of the hybrid era and did not exist before it.',
    ...TECHNICAL,
  }),

  component({
    slug: 'halo',
    title: 'Halo Explained',
    category: 'the-car',
    order: 170,
    summary: 'The titanium loop above the cockpit that has saved lives repeatedly.',
    oneSentence:
      'The halo is a titanium structure mounted above and around the cockpit opening, designed to deflect large objects and prevent them reaching the driver’s head.',
    onTheCar:
      'Above the cockpit, anchored at three points on the monocoque: one at the front centre and two at the sides behind the driver.',
    howItWorks:
      '**Titanium, and standard.** It is supplied to a common specification rather than designed by each team, so every car has the same protection.\n\n**Extremely strong.** It must withstand loads many times the car’s own weight without deforming into the cockpit.\n\n**Deflection, not absorption.** Its job is to redirect a wheel, a car or debris away from the driver’s head.\n\n**Aerodynamically compensated.** Teams fit small fairings to manage the airflow it disturbs, since it sits directly in front of the engine air intake.',
    whyItMatters:
      'The halo was introduced against significant resistance on aesthetic grounds and has since been credited with preventing serious injury or death in several accidents. It is the clearest recent example of a safety measure whose value was disputed until it was demonstrated.',
    misunderstandings:
      '**"It blocks the driver’s view."** The central pillar sits at a point where drivers report it is not a practical obstruction, and drivers adapted within a season.\n\n**"It is optional."** It is mandatory, and its specification is standardised across all cars.',
    related: ['monocoque', 'anatomy-of-an-f1-car', 'chassis', 'how-an-f1-car-works'],
    era: 'The halo was introduced in 2018. Cars before that season had no such structure.',
    ...TECHNICAL,
  }),
];

/* ────────────────────────────────────────────────────────────────────────────
 * Aerodynamics
 * ────────────────────────────────────────────────────────────────────────── */

const AERO: ExplainerSeed[] = [
  technical({
    slug: 'aerodynamics-explained',
    title: 'F1 Aerodynamics Explained',
    category: 'aerodynamics',
    isStartHere: true,
    isFeatured: true,
    difficulty: 'intermediate',
    order: 10,
    readMinutes: 6,
    summary: 'How shaping air produces grip, and why it is the dominant performance factor.',
    oneSentence:
      'Formula 1 aerodynamics is the business of shaping airflow so that it pushes the car onto the track, producing grip that has nothing to do with the car’s weight and everything to do with its speed.',
    howItWorks:
      '**Pressure differences produce force.** Air moving faster has lower pressure. Shape the car so air moves faster underneath than above, and the higher pressure above pushes it down.\n\n**Downforce rises with the square of speed.** Double the speed and you roughly quadruple the downforce, which is why the cars are transformed at high speed.\n\n**The floor does most of it.** Under the current rules, shaped tunnels beneath the car generate the majority of the downforce.\n\n**The wings do the rest, and direct traffic.** They add load and, critically, control where the air goes.\n\n**Drag is the cost.** Every device producing downforce also resists forward motion, and the whole discipline is about maximising the ratio between the two.\n\n**Wake is the side effect.** A car leaves disturbed air behind it, which is what makes following difficult.',
    whyItMatters:
      'Aerodynamics is the largest single differentiator between cars, and because each team designs its own, it is the main reason the field is not equal. It also drives the racing: dirty air, DRS, the difficulty of overtaking and the value of track position all follow from it.',
    example:
      'The same car, at the same circuit, with the rear wing changed from a high-downforce to a low-downforce specification, will be quicker on the straights and slower in the corners. Which configuration is faster over a lap depends entirely on the ratio of straights to corners.',
    tradeoffs:
      'Downforce against drag is the central trade, and it is decided per circuit. There is also a trade against ride height: running the car lower increases downforce and increases the risk of bottoming out, plank wear and porpoising.',
    misunderstandings:
      '**"Aerodynamics is about being slippery."** In Formula 1 it is mostly about generating downward force. A car optimised purely for low drag would be far slower around a lap.\n\n**"The wings are the aerodynamics."** In the current era they are the visible part of a system dominated by the floor.',
    related: ['downforce', 'drag', 'ground-effect', 'floor', 'dirty-air', 'downforce-vs-drag'],
    era: 'This describes the current ground-effect regulations. Earlier eras generated downforce predominantly through bodywork and wings, with underbody aerodynamics restricted.',
    ...TECHNICAL,
  }),

  technical({
    slug: 'downforce',
    title: 'Downforce Explained',
    category: 'aerodynamics',
    isStartHere: true,
    order: 20,
    summary: 'Aerodynamic force pushing the car onto the road, and the reason it corners so fast.',
    oneSentence:
      'Downforce is the downward aerodynamic force generated by the car’s shape as it moves through air, which presses the tyres into the track and increases grip without adding weight.',
    howItWorks:
      '**Grip comes from vertical load.** A tyre grips in proportion to how hard it is pressed onto the road. Adding weight does this and makes the car slower to accelerate; adding downforce does it for free.\n\n**It is produced by pressure differences.** The floor and wings are shaped so air beneath moves faster than air above, producing lower pressure below and a net downward force.\n\n**It scales with speed squared.** At low speed there is very little; at high speed there is more than the car weighs.\n\n**It is why the car is fastest when it is fast.** Cornering ability improves the quicker you go, which is the opposite of a road car and deeply counter-intuitive.',
    whyItMatters:
      'Downforce is the single largest reason a Formula 1 car laps faster than anything else. It is also the source of the sport’s central problem: the same aerodynamics that make one car fast make the car behind it slow.',
    example:
      'Through a fast corner the car can sustain several times the force of gravity laterally. Remove the aerodynamics and the same car, on the same tyres, would take that corner far more slowly, because only the tyres’ mechanical grip would remain.',
    tradeoffs:
      'Downforce always comes with drag, which costs straight-line speed and fuel. It also depends on ride height, so a car set up for maximum downforce is running close to the ground and close to its limits.',
    misunderstandings:
      '**"Downforce is like adding weight."** It adds vertical load without adding mass, so the car gets more grip without becoming harder to accelerate or stop. That is precisely why it is valuable.\n\n**"The cars could drive upside down."** It is often said that at sufficient speed the downforce exceeds the car’s weight, which is true as a comparison of forces. It is a way of expressing the magnitude, not a practical claim.',
    related: [
      'drag',
      'downforce-vs-drag',
      'ground-effect',
      'aerodynamics-explained',
      'dirty-air',
      'high-downforce-setup',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  technical({
    slug: 'drag',
    title: 'Drag Explained',
    category: 'aerodynamics',
    order: 30,
    summary: 'The air resistance that costs straight-line speed, and the price of downforce.',
    oneSentence:
      'Drag is the aerodynamic force resisting the car’s forward motion, which limits top speed and is an unavoidable consequence of generating downforce.',
    howItWorks:
      '**Two main sources.** The car’s frontal area pushing air aside, and the induced drag that comes with generating downforce.\n\n**It rises with speed squared**, like downforce, which is why top speed is limited by power against drag rather than by gearing.\n\n**It costs fuel and energy.** More drag means more energy to maintain speed, which matters under fuel and energy regulations.\n\n**It is reduced deliberately.** DRS opens a flap to cut drag; a low-downforce wing specification does the same permanently.',
    whyItMatters:
      'Drag is the constraint that makes aerodynamics a design problem rather than an exercise in adding wings. If downforce were free, every car would have as much as possible; because it costs drag, every car has exactly as much as that circuit rewards.',
    example:
      'A car with a large rear wing might be several kilometres per hour slower at the end of a long straight than one with a shallow wing, and several tenths quicker through the corners. Over a lap, the circuit decides which is better.',
    tradeoffs:
      'This is the trade. Reducing drag costs downforce; adding downforce costs speed. Efficiency, the ratio of downforce to drag, is what teams actually compete on, because a car that produces more downforce for the same drag is simply better everywhere.',
    misunderstandings:
      '**"Drag is always bad."** It is the cost of downforce, and downforce is usually worth more. A car with no drag would be very fast in a straight line and very slow around a lap.',
    related: [
      'downforce',
      'downforce-vs-drag',
      'drs',
      'slipstream',
      'low-downforce-setup',
      'monaco-vs-monza',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  technical({
    slug: 'downforce-vs-drag',
    title: 'Downforce vs Drag',
    category: 'aerodynamics',
    difficulty: 'intermediate',
    order: 40,
    summary: 'The trade at the centre of every aerodynamic decision, settled circuit by circuit.',
    oneSentence:
      'Downforce makes a car quicker in corners and drag makes it slower on straights, and because they come together, every setup is a judgement about which the circuit rewards more.',
    howItWorks:
      '**They are coupled.** A wing that produces downforce necessarily produces drag. You cannot have one without the other.\n\n**Efficiency is the real goal.** Teams compete to produce more downforce per unit of drag. A more efficient car is faster everywhere, not just in one place.\n\n**Level is a per-circuit choice.** Given a fixed efficiency, teams choose how much downforce to run based on the balance of corners and straights.\n\n**The optimum is a lap time, not a preference.** Simulation finds the wing level that minimises total lap time, which is rarely maximum downforce and rarely minimum drag.',
    whyItMatters:
      'It explains why the same team arrives at different circuits with visibly different cars, and why a car that dominates at one track can be ordinary at the next. It is also why "our car is quick in the corners and slow on the straights" is usually a description of a setup choice rather than a weakness.',
    example:
      'At a circuit that is nearly all straights, teams strip downforce to a minimum. At one that is nearly all corners, they run the largest wings available. The same chassis produces very different lap times in each configuration at each track.',
    tradeoffs:
      'Beyond the straight trade, high downforce means more tyre load and potentially more degradation, while low downforce means the driver has less grip to work with in traffic and in the wet.',
    misunderstandings:
      '**"More downforce is always better in the corners, so run it everywhere."** The straights would cost more than the corners gained, and the car would also be more vulnerable to being passed under DRS.',
    related: [
      'downforce',
      'drag',
      'high-downforce-setup',
      'low-downforce-setup',
      'monaco-vs-monza',
      'rear-wing-setup',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  technical({
    slug: 'ground-effect',
    title: 'Ground Effect Explained',
    category: 'aerodynamics',
    difficulty: 'advanced',
    order: 50,
    summary: 'Using the track surface itself as part of the aerodynamics.',
    oneSentence:
      'Ground effect is the generation of downforce by accelerating air through the gap between the car’s floor and the track, using the road surface as one wall of a duct.',
    howItWorks:
      '**The floor and the road form a duct.** Air entering the gap is squeezed and accelerated.\n\n**Faster air is lower pressure.** The reduced pressure beneath the car pulls it toward the road.\n\n**Proximity matters enormously.** The closer the floor is to the ground, the stronger the effect, which is why ride height is such a sensitive setup parameter.\n\n**The diffuser completes it.** Expanding the air at the rear is what draws it through the whole underbody.\n\n**Sealing matters.** The edges of the floor must prevent higher-pressure air leaking in from the sides, or the low-pressure region collapses.',
    whyItMatters:
      'Ground effect produces downforce far more efficiently than wings, with much less drag. It also produces less wake, which is why the current regulations reintroduced it: cars generating downforce underneath disturb the air behind them less, so following is easier than in the previous era.',
    example:
      'A car running a few millimetres lower can gain a meaningful amount of downforce. That is why teams run as low as they dare, and why the plank wear rule exists to stop them running lower still.',
    tradeoffs:
      'Ground effect is unstable at the extremes. Run too low and the airflow can stall and reattach repeatedly, which produces porpoising. It also makes the car very sensitive to ride height changes from bumps, kerbs and braking.',
    misunderstandings:
      '**"Ground effect is new."** It was used in the late 1970s, banned, and reintroduced by the current regulations. The idea is decades old.\n\n**"It eliminated dirty air."** It reduced the wake. Following is easier than before and still harder than running in clear air.',
    related: ['floor', 'venturi-tunnels', 'diffuser', 'ride-height', 'porpoising', 'dirty-air'],
    era: 'Ground effect was used in the late 1970s and early 1980s, then prohibited for decades, and was deliberately reintroduced by the 2022 technical regulations to reduce the wake behind the cars.',
    ...TECHNICAL,
  }),

  technical({
    slug: 'venturi-tunnels',
    title: 'Venturi Tunnels Explained',
    category: 'aerodynamics',
    difficulty: 'advanced',
    order: 60,
    summary: 'The shaped channels under the floor that make ground effect work.',
    oneSentence:
      'Venturi tunnels are the shaped channels running along the underside of the car, which narrow and then expand to accelerate air and generate the low pressure that produces ground effect downforce.',
    howItWorks:
      '**A venturi is a constriction.** Air forced through a narrowing channel speeds up, and faster air has lower pressure.\n\n**Two tunnels.** The current floor has a pair running either side of the car’s centreline.\n\n**Narrow then expand.** The throat is the tightest point, where the air is fastest and the pressure lowest. Behind it the tunnel expands into the diffuser.\n\n**They must stay sealed.** Air leaking in from the sides raises the pressure and destroys the effect, which is why floor edge design receives so much development attention.',
    whyItMatters:
      'The tunnels are the mechanism by which the current cars generate most of their downforce. Understanding them explains why ride height is critical, why the floor is the main development area, and why porpoising happened when the regulations were introduced.',
    example:
      'Because the effect depends on the size of the gap between the floor and the road, a car that pitches forward under braking or squats under acceleration changes its downforce continuously through a lap, which is a handling characteristic the driver has to work with.',
    tradeoffs:
      'The stronger the tunnels are made, the more sensitive the car becomes to ride height, and the closer it runs to the point where the flow stalls.',
    misunderstandings:
      '**"Flat floors have no ground effect."** A flat floor produces some. Shaped tunnels produce far more, which is why the regulations specify the geometry so precisely.',
    related: [
      'ground-effect',
      'floor',
      'diffuser',
      'porpoising',
      'ride-height',
      'floor-aerodynamics',
    ],
    era: 'Venturi tunnels of this kind are specific to the current technical regulations. The preceding era mandated a substantially flat floor.',
    ...TECHNICAL,
  }),

  technical({
    slug: 'aerodynamic-balance',
    title: 'Aerodynamic Balance',
    category: 'aerodynamics',
    alsoIn: ['car-setup'],
    difficulty: 'advanced',
    order: 110,
    summary: 'Where the downforce acts, front to rear, and why it decides how the car handles.',
    oneSentence:
      'Aerodynamic balance is the front-to-rear distribution of downforce, which determines whether the car understeers or oversteers and changes continuously with speed, ride height and the proximity of other cars.',
    howItWorks:
      '**Balance is a position, not an amount.** It describes where the total downforce acts along the car’s length.\n\n**Too far forward** gives a responsive front end and an unstable rear: oversteer.\n\n**Too far rearward** gives a stable car that will not turn: understeer.\n\n**It moves with speed.** Front and rear downforce do not grow at the same rate, so a car balanced in a slow corner may not be balanced in a fast one.\n\n**It moves with ride height.** Braking pitches the car forward and acceleration squats it, changing the floor’s behaviour and therefore the balance mid-corner.\n\n**It moves in traffic.** Following another car costs more front downforce than rear, which is why cars understeer when following closely.',
    whyItMatters:
      'Balance is what a driver actually feels, and most setup work is aimed at it. A car with plenty of downforce but poor balance is slower than one with less downforce that the driver can commit to, because a driver who does not trust the rear end will not use the grip that is there.',
    example:
      'A driver reports the car is fine in slow corners and unstable in fast ones. Nothing is broken: the aerodynamic balance has shifted rearward or forward with speed, and the fix is a wing or ride height change that trades slow-corner performance for high-speed stability.',
    tradeoffs:
      'Balance is set for the whole lap, so improving it in one corner type usually worsens it in another. Teams choose which corners matter most, usually the ones leading onto long straights.',
    misunderstandings:
      '**"Balance means equal front and rear downforce."** It means the distribution that suits the car, the driver and the circuit, which is never a fifty-fifty split.',
    related: [
      'understeer',
      'oversteer',
      'front-wing-setup',
      'ride-height',
      'dirty-air',
      'car-setup-explained',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  technical({
    slug: 'high-downforce-setup',
    title: 'High-Downforce Setup',
    category: 'aerodynamics',
    alsoIn: ['car-setup'],
    difficulty: 'intermediate',
    order: 120,
    summary: 'Maximum wing for circuits where corners outnumber straights.',
    oneSentence:
      'A high-downforce setup runs the largest practical wing levels to maximise cornering grip, accepting a substantial loss of straight-line speed.',
    howItWorks:
      '**Large front and rear wings.** More elements, steeper angles, more downforce and more drag.\n\n**Used where corners dominate.** Slow, twisty circuits reward cornering grip far more than top speed.\n\n**It aids traction and braking.** More rear load means better acceleration out of slow corners and more stable braking.\n\n**It costs on the straights.** Top speed falls noticeably, and the car becomes more vulnerable to being passed under DRS.',
    whyItMatters:
      'At the circuits where it is used, a high-downforce configuration is not optional. A car running less wing at a twisty track loses far more in the corners than it gains on the straights, and the difference over a lap is large.',
    example:
      'At a slow street circuit, teams run the biggest wings of the year. Top speeds are low, cornering speeds are high relative to the corner radii, and a car set up for a power circuit would be uncompetitive.',
    tradeoffs:
      'The vulnerability to DRS is real. A high-downforce car that is quick in the corners can be unable to defend on the straight, which at a circuit with a long DRS zone can undo the advantage entirely.',
    misunderstandings:
      '**"High downforce means the car is slow."** It means the car is configured for corners. Its lap time at that circuit is lower than a low-drag configuration would achieve.',
    related: [
      'low-downforce-setup',
      'downforce-vs-drag',
      'monaco-vs-monza',
      'rear-wing-setup',
      'why-circuits-suit-different-cars',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  technical({
    slug: 'low-downforce-setup',
    title: 'Low-Downforce Setup',
    category: 'aerodynamics',
    alsoIn: ['car-setup'],
    difficulty: 'intermediate',
    order: 130,
    summary: 'Minimum wing for circuits dominated by straights.',
    oneSentence:
      'A low-downforce setup runs shallow wings to minimise drag and maximise straight-line speed, accepting reduced cornering grip.',
    howItWorks:
      '**Shallow wings, fewer elements.** Less downforce, considerably less drag.\n\n**Used at power circuits.** Long straights, few slow corners.\n\n**Higher top speed.** The car is quicker at the end of every straight and better able to defend and attack under DRS.\n\n**Less grip everywhere else.** Braking distances lengthen, cornering speeds fall, and the car is harder to drive.\n\n**Tyres can suffer.** Less downforce means more sliding in corners, which can raise degradation despite the lower loads.',
    whyItMatters:
      'At a power circuit, a low-drag configuration can be worth a great deal of lap time, and being fast on the straights also makes a car far harder to overtake, which compounds the advantage over a race.',
    example:
      'At a circuit consisting largely of long straights joined by chicanes, teams strip the wings back to their minimum. Cars reach their highest speeds of the season, and cornering grip is the lowest it will be all year.',
    tradeoffs:
      'The car is nervous. With less downforce the driver has less margin, mistakes are more likely, and in changing conditions a low-downforce car is significantly harder to handle.',
    misunderstandings:
      '**"Low downforce is a compromise for weaker teams."** It is the correct configuration for certain circuits, and every team runs it there.',
    related: [
      'high-downforce-setup',
      'downforce-vs-drag',
      'drag',
      'monaco-vs-monza',
      'rear-wing-setup',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  article({
    slug: 'monaco-vs-monza',
    title: 'Why Monaco and Monza Need Different Cars',
    category: 'aerodynamics',
    alsoIn: ['circuits'],
    difficulty: 'intermediate',
    order: 140,
    summary: 'Two circuits at opposite ends of the downforce range, and what teams do about it.',
    oneSentence:
      'Monaco is slow, narrow and entirely corners, while Monza is fast and almost entirely straights, so the same chassis is configured at opposite extremes of the downforce range for each.',
    explanation:
      'These two circuits are the reference points for aerodynamic setup because they sit at the ends of the scale.\n\n**Monaco** has the lowest average speed of the season, no meaningful straights, and walls on both sides. Cornering grip is everything, drag costs almost nothing, and teams run the maximum downforce available.\n\n**Monza** has long straights joined by chicanes and two fast corners. Drag costs a great deal, cornering grip matters comparatively little, and teams run the least downforce of the year.',
    howItWorks:
      '**Same chassis, different configuration.** The monocoque and power unit are unchanged; wings, gear ratios, brake ducts and suspension settings are not.\n\n**Wing level is the visible difference.** The rear wings at these two events look like they belong to different formulae.\n\n**Ride height and suspension differ.** Monaco requires a car that can absorb kerbs and bumps; Monza rewards stability under heavy braking.\n\n**Brake cooling differs.** Monza has heavy braking into chicanes from very high speed; Monaco has constant light braking with little cooling airflow.',
    example:
      'A team’s rear wing at Monaco has a deep, multi-element profile. Two weeks later at Monza it is a shallow blade. The lap time difference between running the wrong one at either circuit would be measured in seconds, not tenths.',
    whyItMatters:
      'It is the clearest demonstration that there is no single fastest setup. It also explains why some cars are competitive at particular circuits: a car with an efficient aerodynamic package suffers less when downforce is stripped away, so it is relatively stronger at Monza than a car that relies on running large wings.',
    misunderstandings:
      '**"Teams build special cars for these races."** They configure the same car differently. The regulations, and the cost cap, make purpose-built cars for individual races impossible.',
    related: [
      'high-downforce-setup',
      'low-downforce-setup',
      'downforce-vs-drag',
      'why-circuits-suit-different-cars',
      'street-vs-permanent',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  technical({
    slug: 'porpoising',
    title: 'Porpoising Explained',
    category: 'aerodynamics',
    difficulty: 'advanced',
    order: 150,
    summary:
      'The violent bouncing that appears when ground effect airflow stalls and recovers repeatedly.',
    oneSentence:
      'Porpoising is a rapid vertical oscillation caused by the underfloor airflow stalling as the car is sucked toward the ground and then recovering as the car rises, repeating many times a second.',
    howItWorks:
      '**Downforce pulls the car down.** As speed rises, ground effect increases and the car is pulled closer to the track.\n\n**The airflow stalls.** Below a certain gap, the air under the floor can no longer flow cleanly and the downforce collapses suddenly.\n\n**The car rises.** With the downforce gone, the suspension pushes the car back up.\n\n**The flow reattaches.** Downforce returns, and the cycle repeats, often several times a second.\n\n**It is violent.** Drivers reported significant physical discomfort and difficulty seeing clearly when it was at its worst.',
    whyItMatters:
      'Porpoising appeared immediately when ground effect was reintroduced, and it constrained how the cars could be run: teams had to raise ride height and give up downforce to control it. It also prompted intervention on safety grounds, because the oscillation loads are transmitted directly to the driver.',
    example:
      'A car is quickest with the floor very close to the ground and undriveable there because of the bouncing. The team raises the ride height, loses downforce, and gains a car the driver can actually use. The lap time is worse in theory and better in practice.',
    tradeoffs:
      'Every fix costs performance. Raising ride height reduces ground effect; stiffening the suspension makes the car worse over kerbs and bumps; changing the floor to be less aggressive gives away downforce deliberately.',
    misunderstandings:
      '**"Porpoising is a suspension problem."** It is aerodynamic in origin. The suspension is part of the system and cannot fix a stall in the underfloor airflow on its own.\n\n**"It was solved."** It was substantially reduced through floor development and regulatory intervention, and it remains a constraint on how low the cars can be run.',
    related: ['ground-effect', 'ride-height', 'floor', 'venturi-tunnels', 'suspension-setup'],
    era: 'Porpoising became prominent when ground effect was reintroduced by the 2022 regulations, and led to floor edge and monitoring changes in the seasons that followed.',
    ...TECHNICAL,
  }),

  technical({
    slug: 'ride-height',
    title: 'Ride Height Explained',
    category: 'aerodynamics',
    alsoIn: ['car-setup'],
    difficulty: 'advanced',
    order: 160,
    summary: 'How far the floor sits above the road, and the most sensitive number on the car.',
    oneSentence:
      'Ride height is the distance between the car’s floor and the track surface, and because ground effect strengthens as that gap closes, it is among the most performance-sensitive settings on the car.',
    howItWorks:
      '**Lower is more downforce.** The ground effect strengthens as the gap narrows.\n\n**Front and rear are set separately.** The difference between them is the rake, which changes how the floor and diffuser work.\n\n**It changes dynamically.** Braking pitches the car forward, acceleration squats it, and downforce compresses the suspension at speed. The static setting is only a starting point.\n\n**The plank limits it.** A wooden plank under the floor must not wear beyond a specified amount, which is checked after the race and enforced by disqualification.\n\n**Porpoising limits it too.** Below a certain height the airflow stalls and the car becomes undriveable.',
    whyItMatters:
      'Ride height is where the largest, cheapest downforce gains live, and also where the largest risks are. A team that runs marginally too low gains lap time all afternoon and is disqualified afterwards for plank wear, which has happened to cars that finished on the podium.',
    example:
      'A team lowers the car by a small amount and finds several tenths a lap. On a bumpy circuit with a long race distance, the same setting wears the plank past its limit and the result is deleted after the race.',
    tradeoffs:
      'Low ride height gives downforce and costs reliability, kerb tolerance and legality margin. High ride height is safe and slow. The whole exercise is finding how close to the limit a team is willing to run.',
    misunderstandings:
      '**"Plank wear is a technicality."** It is the mechanism the regulations use to enforce a minimum ride height, and it is checked precisely because teams would otherwise run the cars lower than is safe.',
    related: [
      'ground-effect',
      'floor',
      'porpoising',
      'suspension-setup',
      'car-legality-checks',
      'technical-infringements',
    ],
    era: 'The plank and its wear limit are long-standing, and ride height sensitivity increased substantially with the reintroduction of ground effect.',
    ...TECHNICAL,
  }),
];

/* ────────────────────────────────────────────────────────────────────────────
 * Power unit
 * ────────────────────────────────────────────────────────────────────────── */

const POWER_UNIT: ExplainerSeed[] = [
  component({
    slug: 'power-unit-explained',
    title: 'F1 Power Unit Explained',
    category: 'power-unit',
    isStartHere: true,
    isFeatured: true,
    difficulty: 'intermediate',
    order: 10,
    readMinutes: 6,
    summary:
      'Not just an engine: a turbocharged V6 plus two energy recovery systems working together.',
    oneSentence:
      'A Formula 1 power unit combines a turbocharged internal combustion engine with two energy recovery systems and a battery, producing very high power from a strictly limited fuel flow.',
    onTheCar:
      'Behind the driver and ahead of the gearbox, mounted directly to the rear of the monocoque as a structural member of the car.',
    howItWorks:
      '**The engine.** A small turbocharged V6, running to high revolutions and burning fuel at a rate the regulations cap.\n\n**The turbocharger.** Exhaust gas spins a turbine, which drives a compressor forcing more air into the engine. More air means more fuel can be burned, which means more power.\n\n**MGU-K.** A motor-generator on the crankshaft that recovers energy under braking and returns it as additional power.\n\n**MGU-H.** A motor-generator on the turbocharger shaft that recovers energy from exhaust heat and can also spin the turbo to eliminate lag.\n\n**Energy store.** A battery holding recovered energy until it is deployed.\n\n**Control electronics.** Manage how energy moves between the components, which is where much of the sophistication lies.\n\nThe term power unit rather than engine exists precisely because the internal combustion engine is only one of six elements.',
    whyItMatters:
      'The hybrid formula is why these engines are among the most thermally efficient ever built: a large share of the energy in the fuel reaches the wheels, which is far better than a conventional engine achieves. It also creates the deployment and energy management that shapes how drivers use a lap.',
    misunderstandings:
      '**"It is just a small engine with a battery."** The recovery systems are integral, not accessories. Removing them would cost a very large fraction of the total power.\n\n**"Hybrid means slower."** These are the most powerful engines the sport has used in most respects, and they achieve it while burning far less fuel than their predecessors.',
    related: [
      'internal-combustion-engine',
      'turbocharger',
      'ers',
      'energy-recovery',
      'energy-deployment',
      'power-unit-penalties',
    ],
    era: 'This describes the turbo-hybrid formula introduced in 2014 and developed since. Earlier eras used naturally aspirated engines of various configurations with no significant energy recovery. The regulations governing power unit architecture are subject to periodic wholesale change.',
    ...TECHNICAL,
  }),

  component({
    slug: 'turbocharger',
    title: 'Turbocharger Explained',
    category: 'power-unit',
    difficulty: 'intermediate',
    order: 30,
    summary: 'Using exhaust gas to force more air into the engine, and more power out of it.',
    oneSentence:
      'A turbocharger uses the energy in exhaust gas to spin a compressor that forces additional air into the engine, allowing more fuel to be burned and more power produced from the same engine size.',
    onTheCar:
      'Mounted with the engine, with the turbine in the exhaust path and the compressor feeding the intake.',
    howItWorks:
      '**Exhaust drives a turbine.** Gas leaving the cylinders spins it at very high speed.\n\n**The turbine drives a compressor.** Connected by a shaft, it pressurises incoming air.\n\n**More air allows more fuel.** Power comes from burning fuel and air together, so forcing in more air permits more power from a smaller engine.\n\n**Split turbo layout.** In Formula 1 the turbine and compressor are separated along the length of the engine, with the MGU-H between them, which improves packaging and cooling.\n\n**Lag is eliminated electrically.** The MGU-H can spin the turbo up before the exhaust flow is sufficient, so the throttle response is immediate.',
    whyItMatters:
      'Turbocharging is what allows the current engines to be small and efficient while producing very high power. It also enables the MGU-H, which recovers energy that would otherwise be wasted as exhaust heat.',
    misunderstandings:
      '**"Turbo lag is a problem in F1."** It largely is not, because the MGU-H keeps the turbo spinning. Drivers of earlier turbo eras dealt with severe lag; current drivers do not.',
    related: [
      'power-unit-explained',
      'internal-combustion-engine',
      'ers',
      'energy-recovery',
      'why-f1-engines-are-efficient',
    ],
    era: 'Turbocharging returned to Formula 1 with the 2014 hybrid regulations after a long period of naturally aspirated engines. An earlier turbo era ran through the 1980s with very different technology.',
    ...TECHNICAL,
  }),

  technical({
    slug: 'energy-recovery',
    title: 'Energy Recovery Explained',
    category: 'power-unit',
    difficulty: 'advanced',
    order: 50,
    summary: 'Capturing energy that would be wasted, from braking and from exhaust heat.',
    oneSentence:
      'Energy recovery captures energy that would otherwise be lost, from the car’s momentum under braking and from heat in the exhaust, storing it in a battery for later deployment as additional power.',
    howItWorks:
      '**Braking recovery.** When a driver brakes, the MGU-K acts as a generator, converting the car’s momentum into electrical energy instead of heat in the brake discs.\n\n**Heat recovery.** The MGU-H recovers energy from the exhaust gas driving the turbocharger, which would otherwise be discarded.\n\n**Storage.** Recovered energy goes to the battery.\n\n**Limits apply.** The regulations cap how much energy may be recovered and deployed per lap, which is what makes deployment a strategic decision rather than simply using everything available.\n\n**It changes braking.** Because the MGU-K resists the rear wheels while harvesting, the rear braking effort is managed electronically to keep the car stable.',
    whyItMatters:
      'Energy recovery is the main reason these engines are so efficient. It is also why drivers talk about lifting and coasting, saving energy and deployment modes: the electrical energy is a limited resource that has to be managed around a lap and across a race.',
    example:
      'A driver braking hard into a slow corner recovers a significant amount of energy. On a circuit with many heavy braking zones there is plenty to harvest; on one with few, the driver may have to lift early on straights specifically to generate harvesting opportunities.',
    tradeoffs:
      'Harvesting takes energy out of the car’s momentum, so a lap spent harvesting aggressively is a slower lap. The gain comes later when that energy is deployed, and choosing where to spend it is a genuine optimisation.',
    misunderstandings:
      '**"Recovery is free energy."** It is energy that would have been wasted, but harvesting under braking does add drag at the rear wheels, and harvesting on a straight costs time immediately.',
    related: [
      'ers',
      'energy-deployment',
      'energy-store',
      'brake-by-wire',
      'why-drivers-save-energy',
      'power-unit-explained',
    ],
    era: 'Energy recovery on this scale is specific to the hybrid era from 2014 onward. A simpler system existed briefly before it, and earlier eras had none.',
    ...TECHNICAL,
  }),

  component({
    slug: 'ers',
    title: 'ERS Explained',
    category: 'power-unit',
    difficulty: 'advanced',
    order: 60,
    summary:
      'The Energy Recovery System: two motor-generators, a battery and the electronics linking them.',
    oneSentence:
      'ERS is the collective name for the car’s energy recovery and deployment hardware: the MGU-K on the crankshaft, the MGU-H on the turbocharger, the energy store and the control electronics.',
    onTheCar:
      'Distributed through the power unit. The MGU-K is at the engine, the MGU-H sits between the turbine and compressor, and the energy store is housed low in the car for a favourable centre of gravity.',
    howItWorks:
      '**MGU-K.** Kinetic. Attached to the crankshaft, it harvests under braking and delivers additional power when deployed.\n\n**MGU-H.** Heat. Attached to the turbocharger shaft, it harvests from exhaust energy and can drive the turbo to eliminate lag.\n\n**Energy store.** The battery. Its capacity and the energy that may pass through it per lap are both regulated.\n\n**Control electronics.** Decide how energy flows between harvesting, storage and deployment, moment by moment.\n\n**Deployment is limited per lap**, which is why a driver cannot simply use maximum electrical power everywhere.',
    whyItMatters:
      'ERS is a large share of the car’s total power output, and because its use is limited per lap, deciding where to spend it is a real performance question. A driver deploying well through the right part of the lap gains time a rival with identical hardware does not.',
    misunderstandings:
      '**"ERS is a boost button."** Deployment is largely automated according to a mapped strategy, though drivers have some control. It is a managed resource rather than a button that makes the car faster on demand.\n\n**"The battery is like a road car hybrid battery."** It is far smaller in capacity and far higher in power density, designed to charge and discharge very rapidly rather than to store energy for range.',
    related: [
      'energy-recovery',
      'energy-deployment',
      'energy-store',
      'engine-modes',
      'power-unit-components',
      'brake-by-wire',
    ],
    era: 'The ERS architecture described is that of the current hybrid regulations. Its components and their permitted use have changed since 2014 and are subject to further wholesale revision.',
    ...TECHNICAL,
  }),

  technical({
    slug: 'energy-deployment',
    title: 'Energy Deployment Explained',
    category: 'power-unit',
    difficulty: 'advanced',
    order: 70,
    summary: 'Choosing where on the lap to spend a limited electrical budget.',
    oneSentence:
      'Deployment is the release of stored electrical energy as additional power, limited per lap by regulation, which makes where it is spent a genuine optimisation problem.',
    howItWorks:
      '**A per-lap budget.** The regulations cap how much energy may be deployed each lap, so it cannot simply be used everywhere.\n\n**Mapped in advance.** Teams plan where on the lap deployment produces most benefit, usually the longest straights and the exits of corners leading onto them.\n\n**Adjusted for the situation.** A driver defending may deploy earlier to protect a position; one attacking may save energy for a specific straight where a pass is possible.\n\n**Harvesting must balance it.** Energy deployed has to be recovered, so a lap is a cycle of harvesting and deployment that must balance over time.',
    whyItMatters:
      'Deployment strategy is a hidden performance differentiator. Two cars with identical power units can be separated by tenths purely on where each spends its electrical energy, and it is one of the main reasons a car can be quick in one sector and ordinary in another.',
    example:
      'A driver saves deployment through the middle sector and uses it all on the final straight, arriving at the line with a speed advantage that gains a position. The same total energy spent evenly around the lap would have gained nothing.',
    tradeoffs:
      'Deploying early in a lap means less available later. Deploying to defend means arriving at the next straight with a deficit, which is why a driver defending hard for several laps eventually becomes vulnerable.',
    misunderstandings:
      '**"They can use it whenever they like."** The per-lap limit is a hard constraint, and using it early means running without it later.',
    related: [
      'energy-recovery',
      'ers',
      'engine-modes',
      'why-drivers-save-energy',
      'how-overtaking-works',
      'defensive-driving',
    ],
    era: 'Per-lap deployment limits are a feature of the current hybrid regulations.',
    ...TECHNICAL,
  }),

  technical({
    slug: 'engine-modes',
    title: 'Engine Modes Explained',
    category: 'power-unit',
    difficulty: 'advanced',
    order: 110,
    summary: 'Preset configurations trading power against fuel, energy and component life.',
    oneSentence:
      'Engine modes are preset configurations of fuel delivery, energy deployment and combustion settings that trade outright power against fuel consumption, energy management and component wear.',
    howItWorks:
      '**Higher modes.** More power, more fuel, more stress, more energy deployed. Used for qualifying, for attacking and for defending.\n\n**Lower modes.** Less power, better fuel and energy economy, less wear. Used to manage a race or to nurse a problem.\n\n**Selected from the cockpit**, though the choice is usually directed by the pit wall.\n\n**Regulation constrains them.** Rules have at points required the same power unit settings between qualifying and the race, specifically to limit the use of very high modes for a single lap.',
    whyItMatters:
      'Modes explain why a car can appear to have more pace available than it is using. A driver holding position in a lower mode has performance in reserve, and the decision to use it is a trade against fuel, energy and the risk of shortening a component’s life.',
    example:
      'A driver is told to turn the engine up to defend for three laps, does so successfully, and is then told to turn it down. The pace they showed was real and not sustainable for a full race distance.',
    tradeoffs:
      'Every high mode costs something: fuel that must then be saved elsewhere, energy that must be harvested back, or component life that pushes the driver closer to a penalty.',
    misunderstandings:
      '**"Teams are sandbagging when they run lower modes."** They are managing finite resources. The pace in a high mode is real and cannot be used for two hours.\n\n**"Party mode is still a thing."** Rules requiring consistent settings between qualifying and the race were introduced specifically to curtail single-lap high-power modes.',
    related: [
      'energy-deployment',
      'why-drivers-save-energy',
      'power-unit-penalties',
      'fuel-rules',
      'qualifying-vs-race-setup',
    ],
    era: 'Regulations on power unit modes have changed, including a requirement for consistent settings between qualifying and the race that curtailed high-power qualifying modes.',
    ...TECHNICAL,
  }),

  technical({
    slug: 'why-drivers-save-energy',
    title: 'Why Drivers Save Energy',
    category: 'power-unit',
    difficulty: 'advanced',
    order: 120,
    summary: 'Fuel and electrical energy are both limited, and running out is not an option.',
    oneSentence:
      'Drivers save fuel and electrical energy because both are limited by regulation and by what the car carries, and running short means either a dramatic loss of pace or failing to finish.',
    howItWorks:
      '**Fuel is finite.** Refuelling is not permitted, so the car starts with everything it will use. Carrying extra costs lap time through weight, so teams start with as little as they safely can.\n\n**Fuel flow is capped.** The regulations limit the rate at which fuel may be delivered, which caps power directly.\n\n**Electrical energy is capped per lap** for both harvesting and deployment.\n\n**Lift and coast.** Releasing the throttle before braking saves fuel and reduces brake temperature, at a small cost in lap time.\n\n**A sample is required.** A car must have enough fuel remaining after the race for a sample to be taken, or it is disqualified.',
    whyItMatters:
      'Energy management is a permanent background constraint on how hard a driver can push. A race is not run at qualifying pace, and the difference is largely fuel and energy rather than tyres alone.',
    example:
      'A driver is told to save fuel for ten laps in the middle of a race. They lift earlier into braking zones, lose a small amount per lap, and bank enough to race hard for the final five laps. The pace they show at the end was purchased in the middle.',
    tradeoffs:
      'Saving costs time now for the ability to push later or to finish at all. A team that starts with more fuel has less need to save and a heavier, slower car for the opening stint.',
    misunderstandings:
      '**"They should just carry more fuel."** Fuel is weight, and weight is lap time throughout the race. Starting heavy to avoid saving late is usually the slower option overall.\n\n**"Fuel saving means the racing is fake."** It is a genuine constraint that drivers manage, in the same way tyre life is.',
    related: [
      'fuel-system',
      'fuel-rules',
      'energy-deployment',
      'engine-modes',
      'minimum-weight',
      'tyre-management',
    ],
    era: 'Fuel flow limits, race fuel allowances and per-lap energy limits are features of the current regulations and have been revised within the hybrid era.',
    ...TECHNICAL,
  }),

  article({
    slug: 'why-f1-engines-are-efficient',
    title: 'Why F1 Engines Are So Efficient',
    category: 'power-unit',
    difficulty: 'advanced',
    order: 130,
    summary: 'A limited fuel flow forced engineers to extract more from every drop.',
    oneSentence:
      'Formula 1 engines are exceptionally thermally efficient because the regulations cap fuel flow rather than power, which makes extracting more energy from each unit of fuel the only route to more performance.',
    explanation:
      'The regulations do not limit power directly. They limit how much fuel may flow into the engine per unit of time. Under that constraint, the only way to make more power is to convert a larger share of the fuel’s energy into useful work.\n\nThat single regulatory choice produced engines that convert a substantially larger fraction of fuel energy into motion than a conventional road car engine, and considerably more than Formula 1 engines of previous eras.',
    howItWorks:
      '**Fuel flow is capped**, so power comes from efficiency rather than from burning more.\n\n**Turbocharging** extracts work from exhaust gas that would otherwise be wasted.\n\n**The MGU-H** recovers further energy from that same exhaust stream.\n\n**The MGU-K** recovers energy from braking that would otherwise become heat.\n\n**Advanced combustion.** Techniques developed to burn fuel more completely and at higher pressures contribute the rest.',
    example:
      'A conventional petrol engine converts roughly a third of the energy in its fuel into motion. The Formula 1 power unit converts a considerably larger share, which is why it produces high power while using far less fuel than the naturally aspirated engines it replaced.',
    whyItMatters:
      'It is the strongest argument that Formula 1 regulation can drive genuinely useful engineering. The efficiency gains came from a rule written to constrain, and the technologies developed under it have relevance beyond the sport.',
    misunderstandings:
      '**"Efficiency means less powerful."** These engines produce more power than their less efficient predecessors while using less fuel. Efficiency and power are not opposed here; the fuel flow cap made them the same problem.',
    related: [
      'power-unit-explained',
      'turbocharger',
      'energy-recovery',
      'fuel-rules',
      'why-drivers-save-energy',
    ],
    era: 'These efficiency figures relate to the turbo-hybrid formula from 2014 onward. Earlier engines were substantially less efficient.',
    ...TECHNICAL,
  }),
];

export const FORMULA1_CAR: ExplainerSeed[] = [...CAR, ...AERO, ...POWER_UNIT];
