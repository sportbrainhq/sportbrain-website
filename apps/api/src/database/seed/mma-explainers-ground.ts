import type { SourceSeed } from './football-overview';
import type { ExplainerSeed, MatShape } from './explainer-types';
import { standard, position, technique, definition } from './mma-explainer-helpers';

/**
 * MMA explainers: Ground Positions and Submissions.
 *
 * Phase 2 of the brief's 31-category library. Both categories are the ones
 * the brief itself singles out as "extremely visual": every `position()`
 * entry here carries a `diagram` field, a `MatShape` payload rendered by
 * `mma-diagrams.tsx`, showing the top and bottom fighter's rough placement
 * (and, where useful, the limbs in play) rather than leaving the position to
 * prose alone. Coordinates are 0-100, following `toMatShape`'s validation in
 * that file exactly: every position needs a string `id`/`label`, a role of
 * literally `'top'` or `'bottom'`, and numeric `x`/`y`.
 *
 * For submissions, the brief's own scope instruction applies directly:
 * "avoid instructional detail designed to cause injury; focus on sport
 * understanding and recognition." Every `technique()` entry below describes
 * a hold at the level a viewer needs to recognise it on screen and understand
 * roughly how it works and why it ends a fight (the same depth Phase 1 used
 * for strikes and takedowns), and stops well short of grappling-manual detail:
 * no exact grip sequencing, no pressure-application instructions, and
 * `counters` stays at the level of a general defensive concept rather than a
 * how-to for defeating the hold on a resisting opponent.
 *
 * No real fighters, fights or statistics are used; examples use a generic
 * "a fighter" framing throughout, matching Phase 1.
 */

export const MMA_GROUND_SOURCES: SourceSeed[] = [
  {
    key: 'wp-guard',
    provider: 'wikipedia',
    title: 'Guard (grappling)',
    url: 'https://en.wikipedia.org/wiki/Guard_(grappling)',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-half-guard',
    provider: 'wikipedia',
    title: 'Half guard',
    url: 'https://en.wikipedia.org/wiki/Half_guard',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-mount',
    provider: 'wikipedia',
    title: 'Mount (grappling)',
    url: 'https://en.wikipedia.org/wiki/Mount_(grappling)',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-back-mount',
    provider: 'wikipedia',
    title: 'Back mount',
    url: 'https://en.wikipedia.org/wiki/Back_mount',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-turtle',
    provider: 'wikipedia',
    title: 'Turtle (grappling)',
    url: 'https://en.wikipedia.org/wiki/Turtle_(grappling)',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-side-control',
    provider: 'wikipedia',
    title: 'Pinning position § Side control',
    url: 'https://en.wikipedia.org/wiki/Pinning_position',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-grappling-positions',
    provider: 'wikipedia',
    title: 'List of grappling positions',
    url: 'https://en.wikipedia.org/wiki/List_of_grappling_positions',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-submission-combat',
    provider: 'wikipedia',
    title: 'Submission (combat sports)',
    url: 'https://en.wikipedia.org/wiki/Submission_(combat_sports)',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-rear-naked-choke',
    provider: 'wikipedia',
    title: 'Rear-naked choke',
    url: 'https://en.wikipedia.org/wiki/Rear-naked_choke',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-guillotine',
    provider: 'wikipedia',
    title: 'Guillotine choke',
    url: 'https://en.wikipedia.org/wiki/Guillotine_choke',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-triangle-choke',
    provider: 'wikipedia',
    title: 'Triangle choke',
    url: 'https://en.wikipedia.org/wiki/Triangle_choke',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-arm-triangle',
    provider: 'wikipedia',
    title: 'Arm triangle choke',
    url: 'https://en.wikipedia.org/wiki/Arm_triangle_choke',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-darce',
    provider: 'wikipedia',
    title: "D'Arce choke",
    url: 'https://en.wikipedia.org/wiki/D%27Arce_choke',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-anaconda',
    provider: 'wikipedia',
    title: 'Anaconda choke',
    url: 'https://en.wikipedia.org/wiki/Anaconda_choke',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-armbar',
    provider: 'wikipedia',
    title: 'Armbar',
    url: 'https://en.wikipedia.org/wiki/Armbar',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-kimura',
    provider: 'wikipedia',
    title: 'Kimura lock',
    url: 'https://en.wikipedia.org/wiki/Kimura_lock',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-americana',
    provider: 'wikipedia',
    title: 'Keylock',
    url: 'https://en.wikipedia.org/wiki/Keylock',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-heel-hook',
    provider: 'wikipedia',
    title: 'Heel hook',
    url: 'https://en.wikipedia.org/wiki/Heel_hook',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-kneebar',
    provider: 'wikipedia',
    title: 'Kneebar',
    url: 'https://en.wikipedia.org/wiki/Kneebar',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-ankle-lock',
    provider: 'wikipedia',
    title: 'Ankle lock',
    url: 'https://en.wikipedia.org/wiki/Ankle_lock',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-neck-crank',
    provider: 'wikipedia',
    title: 'Neck crank',
    url: 'https://en.wikipedia.org/wiki/Neck_crank',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-tapping-out',
    provider: 'wikipedia',
    title: 'Tapping (combat sport)',
    url: 'https://en.wikipedia.org/wiki/Tapping_(combat_sport)',
    license: 'CC BY-SA 4.0',
  },
];

/* ─── Diagram helpers ────────────────────────────────────────────────────── */

function mat(steps: MatShape['steps'], caption?: string): MatShape {
  return { mat: 'position', steps, caption };
}

// ─── Ground Positions ───────────────────────────────────────────────────────

const GROUND_POSITIONS: ExplainerSeed[] = [
  standard({
    slug: 'ground-positions-explained',
    title: 'Ground Positions Explained',
    category: 'ground-positions',
    aliases: ['ground positions', 'mma ground positions', 'ground game explained'],
    summary:
      'Once a fight reaches the mat, where each fighter is relative to the other decides who is winning.',
    isStartHere: true,
    isFeatured: true,
    order: 10,
    readMinutes: 4,
    sourceKeys: [{ key: 'wp-grappling-positions' }],
    diagram: mat(
      [
        {
          caption: 'A generic top-versus-bottom ground exchange',
          positions: [
            { id: 'top', label: 'Top fighter', role: 'top', x: 50, y: 32 },
            { id: 'bottom', label: 'Bottom fighter', role: 'bottom', x: 50, y: 70 },
          ],
          note: 'Position on the ground is named by where each fighter is relative to the other, not by any fixed spot on the mat.',
        },
      ],
      'Ground position is always relative: one fighter above, one below, described by where each is facing and controlling.',
    ),
    explanation: `Once a fight moves to the ground, "who is winning" is largely a question of position: where each fighter is relative to the other, and how much control one has over the other's hips, legs, back or head. A fighter can be landing no strikes at all and still be considered to hold the advantageous position, because ground position measures control and access to further attacks, not just what has already landed.

The sport recognises a fixed set of named ground positions: guard (in its several variants), side control, mount, back control, turtle, and north-south among them. Each has a defending fighter and an attacking fighter, though which fighter that is can flip several times within a single exchange.`,
    howItWorks: `Positions form a rough hierarchy of advantage, generally running from guard (roughly even, or a slight edge to the fighter on top), through side control and knee-on-belly, up to mount and back control, which are considered the two most dominant positions in the sport because they leave the bottom fighter with the fewest options to escape or counter-attack. Fighters spend a large part of ground fighting trying to move up this hierarchy while their opponent tries to prevent it or move the other way.`,
    example: `A fighter taken down lands in the top fighter's closed guard, meaning the bottom fighter has their legs locked around the top fighter's waist. Over the next minute, the top fighter works to "pass" that guard, moving around the bottom fighter's legs into side control, then transitions again into mount. Commentary will typically narrate every one of these transitions by name, because each step up the hierarchy is read as the top fighter improving their position.`,
    misunderstandings: `A common one: assuming the fighter landing strikes is automatically "winning" the ground exchange. A fighter can land occasional strikes from an inferior position (from inside an opponent's guard, say) while the fighter underneath is doing the more meaningful work of controlling distance and looking for a sweep or submission.`,
    related: [
      'full-guard',
      'side-control',
      'mount',
      'back-control',
      'what-is-positional-control',
      'dominant-positions-explained',
    ],
  }),

  position({
    slug: 'full-guard',
    title: 'Full Guard',
    category: 'ground-positions',
    difficulty: 'beginner',
    aliases: ['full guard', 'guard position', 'in someone’s guard'],
    summary:
      "The bottom fighter's legs wrap around the top fighter's body, the most common way a takedown settles.",
    order: 20,
    readMinutes: 3,
    sourceKeys: [{ key: 'wp-guard' }],
    diagram: mat(
      [
        {
          caption: 'Bottom fighter holding full guard on the top fighter',
          positions: [
            { id: 'top', label: 'Top fighter', role: 'top', x: 50, y: 30 },
            { id: 'bottom', label: 'Bottom fighter', role: 'bottom', x: 50, y: 72 },
          ],
          limbs: [{ kind: 'leg', fromX: 42, toX: 58, fromY: 55, toY: 30, controlledBy: 'bottom' }],
          note: "The bottom fighter's legs wrap the top fighter's hips or body, controlling distance from underneath.",
        },
      ],
      'Full guard: the bottom fighter uses their legs to control distance and prevent the top fighter from passing.',
    ),
    recognition: `A fighter on their back with their legs wrapped around the other fighter's body or hips, who is kneeling or leaning over them, is in full guard. It is the most commonly seen ground position in MMA, because it is where most takedowns and trips initially land.`,
    explanation: `Full guard describes any position where the bottom fighter has their legs around the top fighter's body and is using them to control range, off-balance the top fighter, and prevent the top fighter's hips from settling into a more dominant position. It is a broad category with several variants: closed guard, where the ankles are locked; and a range of open guards, where the legs are active but not locked together.

Although the top fighter is generally credited with a positional advantage in most scoring, guard is not a purely defensive position for the fighter underneath. Many sweeps (reversals that put the bottom fighter on top) and submissions are attempted from guard, and a fighter comfortable there may deliberately stay in it rather than working to stand back up.`,
    howToEscape: `For the top fighter, escaping the disadvantage of being held in someone's guard generally means "passing" it: clearing the legs aside and establishing a more controlling position such as side control. For the bottom fighter, the alternative to staying in guard is working back to a standing position or attempting a sweep.`,
    misunderstandings: `A common one: treating guard as simply "losing" or "being controlled." Some of the sport's most decorated ground fighters built their reputation specifically on attacking from guard, and a fighter comfortable there can pose more danger to their opponent than a fighter with a supposedly better position but weaker technique.`,
    related: [
      'closed-guard',
      'open-guard',
      'half-guard',
      'butterfly-guard',
      'ground-positions-explained',
      'side-control',
    ],
  }),

  position({
    slug: 'closed-guard',
    title: 'Closed Guard',
    category: 'ground-positions',
    difficulty: 'beginner',
    aliases: ['closed guard', 'locked guard'],
    summary:
      "The tightest form of guard: the bottom fighter's ankles are locked behind the top fighter's back.",
    order: 30,
    readMinutes: 2,
    sourceKeys: [{ key: 'wp-guard' }],
    diagram: mat(
      [
        {
          caption: 'Closed guard, ankles locked',
          positions: [
            { id: 'top', label: 'Top fighter', role: 'top', x: 50, y: 30 },
            {
              id: 'bottom',
              label: 'Bottom fighter',
              role: 'bottom',
              x: 50,
              y: 72,
              highlight: true,
            },
          ],
          limbs: [{ kind: 'leg', fromX: 40, toX: 60, fromY: 58, toY: 26, controlledBy: 'bottom' }],
          note: 'The ankles are crossed and locked behind the top fighter, closing off space to pass.',
        },
      ],
      'Closed guard: the bottom fighter locks their ankles together, keeping the top fighter close and limiting how they can move to pass.',
    ),
    recognition: `The specific tell is the bottom fighter's feet, crossed and locked together behind the top fighter's lower back, rather than simply resting against the top fighter's hips or thighs.`,
    explanation: `Closed guard is the variant of full guard where the bottom fighter's ankles are locked. Locking the legs keeps the top fighter close, restricts how far they can lean back or stand up, and gives the bottom fighter more control over distance and timing for a sweep or submission attempt than an open guard typically allows.

Because it keeps the top fighter close, closed guard also limits how much room the top fighter has to land significant strikes, which is part of why some judging criteria and commentary treat time spent in someone's closed guard differently from time spent in an open guard, where the top fighter has more room to strike.`,
    howToEscape: `Opening a locked closed guard, breaking the ankle lock, is usually the top fighter's first step toward passing it. The bottom fighter resists by keeping the legs locked as long as the position is useful to them, and re-closes the guard if the lock is broken but the top fighter has not yet advanced position.`,
    misunderstandings: `A common one: assuming closed guard and full guard are two different things. Closed guard is a variant of full guard, specifically the one where the ankles are locked; every closed guard is a full guard, but not every full guard is closed.`,
    related: ['full-guard', 'open-guard', 'ground-positions-explained'],
  }),

  position({
    slug: 'open-guard',
    title: 'Open Guard',
    category: 'ground-positions',
    difficulty: 'intermediate',
    aliases: ['open guard'],
    summary:
      "Any guard where the bottom fighter's legs are active but not locked around the top fighter.",
    order: 40,
    readMinutes: 3,
    sourceKeys: [{ key: 'wp-guard' }],
    diagram: mat(
      [
        {
          caption: 'Open guard, legs active but unlocked',
          positions: [
            { id: 'top', label: 'Top fighter', role: 'top', x: 50, y: 28 },
            { id: 'bottom', label: 'Bottom fighter', role: 'bottom', x: 50, y: 74 },
          ],
          limbs: [{ kind: 'leg', fromX: 40, toX: 55, fromY: 60, toY: 36, controlledBy: 'bottom' }],
          note: "Feet and shins are used against the top fighter's hips or biceps rather than locked behind their back.",
        },
      ],
      'Open guard: the bottom fighter keeps space between the two fighters using their feet, shins and hands rather than locking their legs.',
    ),
    recognition: `The bottom fighter's legs are moving, pushing against the top fighter's hips, thighs or arms, rather than locked in place. There are many named variants (butterfly guard among them), but the visible common thread is that the legs stay active rather than static.`,
    explanation: `Open guard covers any guard where the bottom fighter's legs are not locked around the top fighter's body. It trades the tight control of closed guard for more mobility: the bottom fighter can use their feet and shins to manage distance, off-balance the top fighter, and set up sweeps from a wider range of angles than a locked guard allows.

Because there are many recognised open guard variants, each with its own name and characteristic leg placement, "open guard" functions as an umbrella term in commentary more often than a single, specific position.`,
    howToEscape: `Passing an open guard generally means the top fighter controlling or clearing the bottom fighter's legs before they can be used to off-balance or sweep, then advancing past them into a more dominant position such as side control.`,
    misunderstandings: `A common one: assuming open guard is a weaker position than closed guard because the legs aren't locked. Several open guard variants, including butterfly guard, are considered highly effective at setting up sweeps specifically because the legs stay mobile rather than fixed in one place.`,
    related: ['full-guard', 'closed-guard', 'butterfly-guard', 'half-guard'],
  }),

  position({
    slug: 'half-guard',
    title: 'Half Guard',
    category: 'ground-positions',
    difficulty: 'intermediate',
    aliases: ['half guard'],
    summary:
      "The bottom fighter traps one of the top fighter's legs between their own, rather than controlling both.",
    order: 50,
    readMinutes: 3,
    sourceKeys: [{ key: 'wp-half-guard' }],
    diagram: mat(
      [
        {
          caption: "Bottom fighter trapping one of the top fighter's legs",
          positions: [
            { id: 'top', label: 'Top fighter', role: 'top', x: 55, y: 32 },
            { id: 'bottom', label: 'Bottom fighter', role: 'bottom', x: 50, y: 72 },
          ],
          limbs: [{ kind: 'leg', fromX: 52, toX: 58, fromY: 55, toY: 34, controlledBy: 'bottom' }],
          note: "Only one of the top fighter's legs is trapped between the bottom fighter's legs, rather than both hips being controlled.",
        },
      ],
      "Half guard: one of the top fighter's legs is trapped, but their other leg and hip are free, so both fighters are working to change that.",
    ),
    recognition: `The top fighter has one leg trapped between both of the bottom fighter's legs, while their other leg is free and posted on the mat. It is usually reached mid-transition, either as the top fighter is passing guard or as the bottom fighter recovers from a worse position.`,
    explanation: `Half guard sits between full guard and side control: the bottom fighter has stopped the top fighter from fully passing by trapping one leg, but has not maintained control of both, unlike full guard. It is considered a less secure position for the bottom fighter than full guard, since the top fighter has one hip free to work from, but it still gives the bottom fighter options to sweep or work back to a stronger guard.`,
    howToEscape: `For the top fighter, freeing the trapped leg (commonly by flattening the bottom fighter's hips or working the free leg past their control) is the path to side control or mount. For the bottom fighter, half guard is usually a waypoint toward recovering full guard or attempting a sweep rather than a position either fighter tries to hold indefinitely.`,
    misunderstandings: `A common one: assuming half guard is simply a worse version of full guard and nothing more. It has its own recognised sweeps and submission setups distinct from full guard, and some fighters specialise in it as a primary offensive position rather than treating it only as a stop on the way somewhere else.`,
    related: ['full-guard', 'open-guard', 'side-control', 'ground-positions-explained'],
  }),

  position({
    slug: 'butterfly-guard',
    title: 'Butterfly Guard',
    category: 'ground-positions',
    difficulty: 'advanced',
    aliases: ['butterfly guard'],
    summary:
      "An open guard where the bottom fighter's feet hook inside the top fighter's thighs, built for sweeping.",
    order: 60,
    readMinutes: 3,
    sourceKeys: [{ key: 'wp-guard' }],
    diagram: mat(
      [
        {
          caption: 'Butterfly guard hooks',
          positions: [
            { id: 'top', label: 'Top fighter', role: 'top', x: 50, y: 34 },
            { id: 'bottom', label: 'Bottom fighter', role: 'bottom', x: 50, y: 76 },
          ],
          limbs: [
            { kind: 'leg', fromX: 44, toX: 46, fromY: 60, toY: 44, controlledBy: 'bottom' },
            { kind: 'leg', fromX: 56, toX: 54, fromY: 60, toY: 44, controlledBy: 'bottom' },
          ],
          note: "Both feet hook inside the top fighter's thighs, ready to lift and off-balance them for a sweep.",
        },
      ],
      "Butterfly guard: both feet hook inside the top fighter's legs, giving the bottom fighter lift and leverage to sweep.",
    ),
    recognition: `Usually seen with the bottom fighter sitting up rather than lying flat, both feet hooked inside the top fighter's thighs. The sitting posture and the specific hook placement distinguish it from other open guards.`,
    explanation: `Butterfly guard is an open guard variant where the bottom fighter sits up and hooks both feet inside the top fighter's thighs, using their legs to lift and off-balance the top fighter rather than to hold them close as in closed guard. It is generally considered a more advanced guard to use effectively, because it relies more on timing and hip movement than on the top fighter simply being held in place.`,
    howToEscape: `For the top fighter, staying heavy and preventing the bottom fighter from getting the lift needed to off-balance them is the main defensive concept; for the bottom fighter, the position is built specifically around finding that lift to execute a sweep and reverse the position.`,
    misunderstandings: `A common one: confusing butterfly guard with closed guard because both involve the legs wrapping toward the top fighter. Closed guard locks the ankles and pulls the top fighter close; butterfly guard hooks the feet underneath and pushes upward, a fundamentally different mechanism aimed at sweeping rather than holding.`,
    related: ['open-guard', 'full-guard', 'half-guard'],
  }),

  position({
    slug: 'side-control',
    title: 'Side Control',
    category: 'ground-positions',
    difficulty: 'beginner',
    aliases: ['side control', 'side mount'],
    summary:
      "The top fighter is across the bottom fighter's body, chest-to-chest but perpendicular rather than astride.",
    order: 70,
    readMinutes: 3,
    sourceKeys: [{ key: 'wp-side-control' }],
    diagram: mat(
      [
        {
          caption: 'Side control',
          positions: [
            { id: 'top', label: 'Top fighter', role: 'top', x: 50, y: 45, highlight: true },
            { id: 'bottom', label: 'Bottom fighter', role: 'bottom', x: 50, y: 70 },
          ],
          note: "The top fighter lies across the bottom fighter's torso, perpendicular to them, pinning the hips and chest.",
        },
      ],
      "Side control: the top fighter pins across the bottom fighter's body from the side, with neither fighter's legs directly engaged.",
    ),
    recognition: `The top fighter is lying across the bottom fighter, chest to chest but at roughly a right angle rather than facing the same direction, with the bottom fighter's legs no longer between them the way they are in guard.`,
    explanation: `Side control is reached once the top fighter has passed the bottom fighter's guard: the bottom fighter's legs are no longer in play as a barrier, and the top fighter controls across the chest and hips from the side. It is considered a clearly dominant position, well ahead of guard, because the bottom fighter has fewer tools available to sweep or attack from underneath it, though escapes and submissions from side control still exist for both fighters.`,
    howToEscape: `For the bottom fighter, escaping side control generally means recovering guard, reinserting a leg or an arm as a barrier between the two fighters, or "turning in" toward the top fighter to reduce how much of their body weight is pinning them.`,
    misunderstandings: `A common one: assuming side control is a static, unchanging position. In practice fighters move through several recognised variants of it in quick succession (including transitioning toward knee-on-belly, mount or north-south) as each looks for a stronger grip or an opening.`,
    related: [
      'mount',
      'knee-on-belly',
      'north-south-position',
      'full-guard',
      'dominant-positions-explained',
    ],
  }),

  position({
    slug: 'mount',
    title: 'Mount',
    category: 'ground-positions',
    difficulty: 'beginner',
    isFeatured: true,
    aliases: ['mount position', 'full mount', 'mounted'],
    summary:
      "The top fighter sits astride the bottom fighter's torso, one of the two most dominant positions in the sport.",
    order: 80,
    readMinutes: 3,
    sourceKeys: [{ key: 'wp-mount' }],
    diagram: mat(
      [
        {
          caption: 'Full mount',
          positions: [
            { id: 'top', label: 'Top fighter', role: 'top', x: 50, y: 30, highlight: true },
            { id: 'bottom', label: 'Bottom fighter', role: 'bottom', x: 50, y: 70 },
          ],
          note: "The top fighter sits astride the bottom fighter's torso, facing their head, knees pinned to the mat on either side.",
        },
      ],
      "Mount: the top fighter sits astride the bottom fighter, facing them, with both knees on the mat, one of the sport's clearest advantages.",
    ),
    recognition: `The top fighter is sitting directly astride the bottom fighter's torso, facing their head, with a knee pinned to the mat on either side of the bottom fighter's body. It is one of the most visually unambiguous positions in the sport; broadcasts will often say "full mount" the moment it is secured.`,
    explanation: `Mount gives the top fighter's full weight and both hands free to strike downward, with the bottom fighter having comparatively few tools to strike back or to escape cleanly. It is widely regarded, alongside back control, as one of the two most dominant positions in MMA, and holding it for any length of time is scored heavily in the top fighter's favour.

The bottom fighter's main defensive options from underneath mount are to trap an arm or create enough space and hip movement to attempt to buck the top fighter off or recover a leg into half guard.`,
    howToEscape: `Escaping mount generally means the bottom fighter using hip movement to off-balance the top fighter, either bridging to create space and roll them off, or working a leg back inside to recover half guard or full guard, reducing the top fighter's control step by step rather than all at once.`,
    misunderstandings: `A common one: assuming a fighter mounted for a long stretch has no realistic path back into the fight. Escapes from mount happen regularly at every level of the sport, though they require sustained technique under pressure rather than a single move.`,
    related: [
      'back-control',
      'side-control',
      'ground-positions-explained',
      'dominant-positions-explained',
    ],
  }),

  position({
    slug: 'back-control',
    title: 'Back Control',
    category: 'ground-positions',
    difficulty: 'intermediate',
    isFeatured: true,
    aliases: ['back control', 'back mount', 'taking the back'],
    summary:
      "One fighter is behind the other with hooks and a body triangle or seatbelt grip, the sport's single most dominant position.",
    order: 90,
    readMinutes: 4,
    sourceKeys: [{ key: 'wp-back-mount' }],
    diagram: mat(
      [
        {
          caption: 'Back control, hooks in',
          positions: [
            { id: 'top', label: 'Attacking fighter', role: 'top', x: 52, y: 50, highlight: true },
            { id: 'bottom', label: 'Defending fighter', role: 'bottom', x: 50, y: 50 },
          ],
          limbs: [
            { kind: 'leg', fromX: 46, toX: 42, fromY: 58, toY: 62, controlledBy: 'top' },
            { kind: 'arm', fromX: 55, toX: 45, fromY: 42, toY: 44, controlledBy: 'top' },
          ],
          note: "The attacking fighter is behind and attached to the defending fighter's back, with hooks (feet inside the thighs) and an arm across the chest or neck.",
        },
      ],
      "Back control: one fighter attaches to the other's back with hooks or a body triangle, facing the same direction, out of the defender's direct sightline.",
    ),
    recognition: `Both fighters face the same direction, one behind the other, with the attacking fighter's feet ("hooks") inside the defending fighter's thighs or legs crossed around their waist in a body triangle, and an arm typically across the defending fighter's chest, shoulder or neck.`,
    explanation: `Back control is reached when a fighter gets fully behind their opponent and attaches with hooks or a body triangle, removing most of the defending fighter's ability to see or reach their attacker. It is widely considered the single most dominant position in MMA and grappling generally, because the defending fighter cannot see incoming strikes or submission attempts and has very limited ability to strike back, while the attacking fighter has a clear path to the neck for a choke.

Back control can be taken from several other positions, including turtle and from a scramble on the feet, not only from mount.`,
    howToEscape: `The defending fighter's main tools are peeling the attacking fighter's hooks or grip loose and turning to face them, converting the exchange back into a more even, front-facing position, generally regarded as a slow, technical process rather than a single quick move given how secure the position is once fully established.`,
    misunderstandings: `A common one: assuming back control automatically means the fight is nearly over. It is a serious disadvantage for the defending fighter, but back control is regularly defended for extended periods, including to the end of a round, without the attacking fighter finishing the fight.`,
    related: [
      'mount',
      'rear-naked-choke',
      'turtle-position',
      'ground-positions-explained',
      'dominant-positions-explained',
    ],
  }),

  position({
    slug: 'turtle-position',
    title: 'Turtle Position',
    category: 'ground-positions',
    difficulty: 'intermediate',
    aliases: ['turtle position', 'turtling up'],
    summary:
      'A fighter curls face-down onto hands and knees, defending their back and midsection from a takedown or scramble.',
    order: 100,
    readMinutes: 3,
    sourceKeys: [{ key: 'wp-turtle' }],
    diagram: mat(
      [
        {
          caption: 'Turtle, defending fighter curled up',
          positions: [
            { id: 'bottom', label: 'Turtled fighter', role: 'bottom', x: 50, y: 65 },
            { id: 'top', label: 'Attacking fighter', role: 'top', x: 50, y: 40 },
          ],
          note: 'The defending fighter is face-down on hands and knees, elbows tucked in to protect the ribs and neck.',
        },
      ],
      'Turtle: a fighter curls face-down onto hands and knees, a defensive stopgap rather than a position either fighter wants to hold.',
    ),
    recognition: `A fighter face-down on the mat, up on their hands and knees or forearms and knees, with their elbows tucked in tight to protect their ribs and their chin down to protect their neck, is in turtle.`,
    explanation: `Turtle is usually a transitional, defensive position rather than one a fighter aims to hold: it typically appears right after a takedown attempt is stuffed, or when a fighter caught in a bad spot curls up to limit the target area available to their opponent and buy time to improve. From an attacking fighter's perspective, turtle is often the position they are trying to take the back from, since the defending fighter's back is exposed and their hooks are close by.`,
    howToEscape: `For the defending fighter, turtle is generally a waypoint toward either standing back up or rolling through to recover a guard, rather than a place to remain; staying turtled for long stretches invites the attacking fighter to secure hooks and take the back.`,
    misunderstandings: `A common one: assuming turtle is a passive, safe position simply because the fighter is curled up defensively. It is one of the more common routes into back control specifically because the defending fighter's back is directly available to the fighter behind them.`,
    related: ['back-control', 'ground-positions-explained', 'side-control'],
  }),

  position({
    slug: 'north-south-position',
    title: 'North-South Position',
    category: 'ground-positions',
    difficulty: 'advanced',
    aliases: ['north south position', 'north-south'],
    summary:
      'The top fighter lies across the bottom fighter facing the opposite direction, chest over chest, head to hips.',
    order: 110,
    readMinutes: 3,
    sourceKeys: [{ key: 'wp-grappling-positions' }],
    diagram: mat(
      [
        {
          caption: 'North-south, fighters facing opposite ways',
          positions: [
            { id: 'top', label: 'Top fighter', role: 'top', x: 50, y: 35 },
            { id: 'bottom', label: 'Bottom fighter', role: 'bottom', x: 50, y: 68 },
          ],
          note: "The top fighter's head is over the bottom fighter's hips, and the top fighter's hips are over the bottom fighter's head, chest to chest but reversed.",
        },
      ],
      "North-south: both fighters' bodies point in opposite directions, the top fighter's chest pressing down near the bottom fighter's head.",
    ),
    recognition: `Both fighters are chest to chest but facing opposite directions: the top fighter's head is down near the bottom fighter's hips, and the top fighter's hips are up near the bottom fighter's head, roughly forming a straight line when viewed from above.`,
    explanation: `North-south is a control position reached mid-transition, often while the top fighter is moving between side control and mount, or specifically defending against being swept while stopping the bottom fighter from recovering guard. It restricts the bottom fighter's ability to use their legs, since the top fighter's body is out of their leg's normal range, and gives the top fighter access to knee strikes to the body and shoulder pressure that some fighters use to control a scrambling opponent.`,
    howToEscape: `The bottom fighter typically escapes by shrimping (a hip-escaping movement) to reintroduce space and reinsert a leg between the two fighters, working back toward guard rather than trying to reverse the position directly.`,
    misunderstandings: `A common one: assuming north-south is a rarely used or purely academic position. It shows up regularly as a stop on the way between other positions and is a legitimate control position judges credit, not just a technical curiosity.`,
    related: ['side-control', 'mount', 'ground-positions-explained'],
  }),

  position({
    slug: 'knee-on-belly',
    title: 'Knee-on-Belly',
    category: 'ground-positions',
    difficulty: 'advanced',
    aliases: ['knee on belly', 'knee on stomach'],
    summary:
      "The top fighter drives a knee into the bottom fighter's midsection while staying mobile on the other foot.",
    order: 120,
    readMinutes: 3,
    sourceKeys: [{ key: 'wp-grappling-positions' }],
    diagram: mat(
      [
        {
          caption: 'Knee-on-belly',
          positions: [
            { id: 'top', label: 'Top fighter', role: 'top', x: 50, y: 45, highlight: true },
            { id: 'bottom', label: 'Bottom fighter', role: 'bottom', x: 50, y: 68 },
          ],
          note: "One knee drives into the bottom fighter's midsection while the other foot is posted out for balance and mobility.",
        },
      ],
      "Knee-on-belly: the top fighter's weight concentrates through one knee into the midsection, staying light and mobile rather than lying flat.",
    ),
    recognition: `The top fighter has one knee pressed into the bottom fighter's stomach or ribs, with their other leg extended and foot posted on the mat, keeping them up and mobile rather than lying across the bottom fighter's body.`,
    explanation: `Knee-on-belly concentrates the top fighter's weight through a single, small point of contact, which is more uncomfortable for the bottom fighter than side control's broader weight distribution, while leaving the top fighter free to move, switch angles or transition to mount or an arm attack quickly, since they are not committed to lying flat. It is considered a step above side control in the positional hierarchy but generally regarded as harder to hold securely than mount or back control, since the top fighter's base is narrower.`,
    howToEscape: `For the bottom fighter, the discomfort of the position often prompts a reaction, pushing into the top fighter's posted leg or rolling to a side, that the top fighter uses to advance further; staying still and managing the pressure while looking for a chance to recover guard is the general defensive idea.`,
    misunderstandings: `A common one: assuming knee-on-belly is purely a striking position with no control value. It is credited by judges as a controlling, advantageous position in its own right, not simply a launching pad for strikes.`,
    related: ['side-control', 'mount', 'ground-positions-explained'],
  }),

  standard({
    slug: 'top-position-vs-bottom-position',
    title: 'Top Position vs Bottom Position',
    category: 'ground-positions',
    aliases: ['top vs bottom position', 'top position bottom position mma'],
    summary:
      'Being on top is usually, but not always, the advantage; the exceptions are exactly what make ground fighting interesting.',
    order: 130,
    readMinutes: 3,
    sourceKeys: [{ key: 'wp-grappling-positions' }],
    explanation: `As a general rule, the fighter on top of a ground exchange is considered to hold the positional advantage: more freedom to strike, more control over where the fight goes next, and less exposure to submissions. Judges and commentary reflect this by default, crediting top position and its progression (guard passed, mount secured, back taken) as meaningful advancement.

That default is not absolute. A fighter who is a specialist from guard, or who is actively threatening a submission or a sweep from underneath, can be doing the more dangerous work even while positioned "below" their opponent, and a top fighter who is stalling without advancing or striking meaningfully can lose a round despite holding the more favourable position on paper.`,
    howItWorks: `The clearest deciding factor is activity: what each fighter is doing with the position they hold, not only which position they hold. A bottom fighter actively working for a submission or a sweep is treated very differently, by both scoring criteria and by the sport's culture, than a bottom fighter simply covering up and surviving underneath a stalling top fighter.`,
    example: `A fighter spends a round on their back in another fighter's closed guard, deliberately staying there because they consider it their strongest attacking position, actively hunting for a triangle choke or armbar throughout. Read purely as "top versus bottom," this looks lopsided in the top fighter's favour; read for activity and danger, the bottom fighter may well be doing the more significant work of the round.`,
    whyItMatters: `Understanding that top position is a strong default rather than an absolute rule is what lets a viewer follow why a fight can be scored, or discussed, in ways that don't simply track who spent more time on top.`,
    misunderstandings: `A common one: treating "on top" and "winning the fight" as synonyms. They correlate strongly but are not the same claim, and the gap between them is where a meaningful share of scoring controversy in the sport comes from.`,
    related: [
      'ground-positions-explained',
      'what-is-positional-control',
      'dominant-positions-explained',
    ],
  }),

  standard({
    slug: 'what-is-positional-control',
    title: 'What Is Positional Control?',
    category: 'ground-positions',
    aliases: ['positional control mma', 'ground control explained'],
    summary:
      "How much a fighter restricts their opponent's movement and options, one of the ground game's core scoring ideas.",
    order: 140,
    readMinutes: 3,
    sourceKeys: [{ key: 'wp-grappling-positions' }],
    explanation: `Positional control refers to how much one fighter restricts the other's ability to move, escape, strike back, or attack, regardless of whether strikes are currently landing. A fighter holding mount with both hands free, even between strikes, has significant positional control; a fighter briefly on top but constantly being threatened with a sweep does not, even though both might loosely be described as being "on top."

It is one of the criteria judges are instructed to weigh on the ground, alongside effective striking and submission attempts, which is why a fighter can be given credit for a round in which they landed relatively little but held clearly dominant position for most of it.`,
    howItWorks: `Control is generally read through a combination of position (how advantageous the position itself is), duration (how long it was held), and the opponent's ability to do anything meaningful from underneath it. Mount and back control represent the high end of this scale; a scrambling, quickly contested guard represents the low end.`,
    example: `A fighter spends three of five minutes in a round in full mount, landing only a handful of clean strikes because the bottom fighter defends well, but never loses the position and is never seriously threatened by a sweep or submission attempt. That fighter can reasonably win the round on control alone, even against an opponent who lands more total strikes earlier in the same round.`,
    whyItMatters: `Positional control is a large part of why ground fighting rewards patience and technical position over simply throwing the most strikes, and it is one of the concepts most often missing from a casual viewer's read of a ground-heavy round.`,
    misunderstandings: `A common one: assuming control only matters if strikes are landing throughout. Judges are specifically instructed to credit dominant position and its threat even during stretches with little or no landed offence.`,
    related: [
      'ground-positions-explained',
      'top-position-vs-bottom-position',
      'dominant-positions-explained',
    ],
  }),

  standard({
    slug: 'dominant-positions-explained',
    title: 'Dominant Positions Explained',
    category: 'ground-positions',
    aliases: ['dominant position mma', 'most dominant position in mma'],
    summary:
      "Mount and back control sit at the top of the ground game's positional hierarchy, and for the same underlying reason.",
    order: 150,
    readMinutes: 3,
    sourceKeys: [{ key: 'wp-mount' }, { key: 'wp-back-mount' }],
    diagram: mat(
      [
        {
          caption: 'The rough hierarchy from guard up to back control',
          positions: [
            { id: 'guard', label: 'Guard', role: 'bottom', x: 20, y: 75 },
            { id: 'side', label: 'Side control', role: 'top', x: 45, y: 55 },
            { id: 'mount', label: 'Mount', role: 'top', x: 70, y: 35 },
            { id: 'back', label: 'Back control', role: 'top', x: 90, y: 20, highlight: true },
          ],
          note: 'Each position to the right generally gives the attacking fighter more control and fewer options for the fighter underneath.',
        },
      ],
      "A rough view of the ground game's hierarchy, not a fixed sequence every fight follows.",
    ),
    explanation: `MMA and grappling generally treat mount and back control as the two most dominant positions in the sport. Both share the same underlying reason: they leave the disadvantaged fighter with very limited ability to strike back or to escape cleanly, while giving the advantaged fighter free use of both hands and, in back control's case, a direct line to the neck.

Between them, back control is often rated the single most dominant position of all, because the fighter underneath cannot see their attacker and has fewer defensive tools available than a fighter pinned under mount, who can at least see incoming strikes.`,
    howItWorks: `The positions in between, guard, half guard, side control, knee-on-belly and north-south, sit along a rough scale of increasing advantage for the top fighter, though the exact ordering of some of them is debated and situational rather than a fixed law. What all of them share is that moving up the scale generally means the bottom fighter losing options.`,
    example: `A fighter who starts a takedown exchange caught in guard works, step by step, through side control being passed against them, then mount, and finally has their back taken, at which point the finish comes. Described this way, the fight can be read almost entirely through the positional hierarchy it moved through, with the technique used to finish at the end almost secondary to the position that made it available.`,
    whyItMatters: `Recognising the hierarchy is what lets a viewer read a takedown, once it happens, as the start of a story rather than a single event: which position it lands in, and which direction it moves from there, is usually a better predictor of how the exchange ends than the takedown itself.`,
    misunderstandings: `A common one: treating the hierarchy as a strict, universal ranking every fighter and every fight must follow in order. It is a general pattern, not a rule; a skilled bottom fighter can attack effectively from a "lower" position, and the exact ordering below mount and back control varies by who you ask.`,
    related: ['mount', 'back-control', 'ground-positions-explained', 'what-is-positional-control'],
  }),
];

// ─── Submissions ────────────────────────────────────────────────────────────

const SUBMISSIONS: ExplainerSeed[] = [
  standard({
    slug: 'mma-submissions-explained',
    title: 'MMA Submissions Explained',
    category: 'submissions',
    aliases: ['mma submissions', 'submission holds explained', 'submissions in mma'],
    summary:
      'A fighter wins by forcing their opponent to give up, or by a choke or joint lock the referee judges too dangerous to continue.',
    isStartHere: true,
    isFeatured: true,
    order: 10,
    readMinutes: 4,
    sourceKeys: [{ key: 'wp-submission-combat' }],
    explanation: `A submission ends a fight when one fighter applies a choke or a joint lock the other fighter cannot escape, and that fighter either taps or verbally submits to signal they cannot continue, or the referee steps in because the danger is judged clear even without a tap. Submissions fall into two broad families: **chokes**, which restrict blood flow or breathing, and **joint locks**, which hyperextend a joint beyond its normal range.

Submissions can be attempted standing, in a clinch, or on the ground, though the large majority in MMA happen once a fight reaches the mat, which is why this category sits alongside Ground Positions in the library.`,
    howItWorks: `Most submissions rely on a fighter first establishing a dominant position, back control or mount especially, from which an arm, neck or leg becomes available to attack. A fighter caught in a submission attempt generally has a window, sometimes brief, to defend before the hold is fully secured; once it is, the options remaining are to tap, to try to survive to the horn (rarely wise against a fully locked choke), or to have the referee intervene.`,
    example: `A fighter takes their opponent's back in the second round, secures both hooks, and works an arm across the opponent's neck. The opponent defends the choke for several seconds by controlling the attacking arm, but the grip is eventually secured and the opponent taps the mat rapidly with an open hand, ending the fight by submission.`,
    whyItMatters: `Submissions are one of the sport's three finishing methods alongside knockouts and technical knockouts, and a fighter's reputation on the ground, their submission record, their known preferred holds, materially changes how an opponent and their corner plan for a fight.`,
    misunderstandings: `A common one: assuming a tap only happens when a fighter is in unbearable pain. Many taps, particularly to chokes, happen because a fighter recognises the position is lost and chooses to stop before losing consciousness or sustaining injury, a judgment call rather than a pain threshold being crossed.`,
    related: [
      'rear-naked-choke',
      'armbar',
      'submission-defense',
      'what-does-tap-out-mean',
      'ground-positions-explained',
      'technical-submission',
    ],
  }),

  technique({
    slug: 'rear-naked-choke',
    title: 'Rear-Naked Choke',
    category: 'submissions',
    difficulty: 'beginner',
    isFeatured: true,
    aliases: ['rear naked choke', 'rnc', 'choke from the back'],
    summary:
      "A choke applied from back control, widely regarded as the sport's most reliable finishing submission.",
    order: 20,
    readMinutes: 4,
    sourceKeys: [{ key: 'wp-rear-naked-choke' }, { key: 'wp-back-mount' }],
    recognition: `Applied from directly behind an opponent, one arm wraps across the front of their neck while the attacking fighter's body stays attached with hooks or a body triangle. A tap is usually a rapid, visible slap of the free hand against the attacker's arm or the mat.`,
    theTechnique: `The attacking fighter wraps an arm around the defending fighter's neck from behind and squeezes, using the other arm and their body position to reinforce the hold and prevent the defending fighter from turning to face them or pulling the choking arm free. Because it is applied from directly behind, the defending fighter cannot see the choke being set up or strike back at the fighter applying it.`,
    whenUsed: `It is the natural follow-up once a fighter has secured back control, since the neck is the most accessible target from directly behind an opponent, and is by far the most common submission finish once the back has been taken, on the ground or, less often, standing.`,
    risks: `Attacking with a rear-naked choke is comparatively low-risk for the attacking fighter, since they are already behind their opponent in a strong controlling position; the main risk is the defending fighter using the time it takes to fully secure the choke to escape the back position entirely.`,
    counters: `Defending a rear-naked choke generally centres on controlling the choking arm with both hands and turning into the attacking fighter to reduce the angle they have on the neck, converting the exchange back toward a more even, front-facing position before the choke fully locks in.`,
    dangerAndStoppage: `A fully locked rear-naked choke restricts blood flow to the brain, and a fighter who does not tap can lose consciousness within seconds; referees are trained to watch for the choke being fully secured and will stop the fight if a fighter goes limp or otherwise cannot intelligently continue, whether or not a tap occurred.`,
    example: `A fighter takes the back midway through a round, works both hooks in, and secures an arm across the neck. The defending fighter fights to peel the arm away for several seconds without success, and taps the mat firmly as the choke locks fully in, ending the fight.`,
    misunderstandings: `A common one: calling any choke applied from behind a "rear-naked choke" regardless of the exact grip. The name refers specifically to this arm-around-the-neck mechanism without using the legs or clothing to reinforce the choke (hence "naked"), distinct from other back-attack chokes that use additional grips.`,
    related: ['back-control', 'guillotine-choke', 'submission-defense', 'what-does-tap-out-mean'],
  }),

  technique({
    slug: 'guillotine-choke',
    title: 'Guillotine Choke',
    category: 'submissions',
    difficulty: 'intermediate',
    aliases: ['guillotine choke', 'guillotine submission'],
    summary:
      'A front-facing choke wrapped around the neck, often caught while defending a takedown attempt.',
    order: 30,
    readMinutes: 3,
    sourceKeys: [{ key: 'wp-guillotine' }],
    recognition: `Both fighters face each other, one with an arm wrapped around the other's neck from the front, head trapped under the attacking fighter's arm, often seen the instant a takedown attempt is stopped or sprawled.`,
    theTechnique: `The attacking fighter wraps an arm around the front of the defending fighter's neck, trapping the head, and squeezes using their arm and often their legs (in a variant applied from guard) to add pressure and prevent the defending fighter from pulling their head free.`,
    whenUsed: `It is most commonly seen defensively, caught by a fighter sprawling against a takedown attempt as their opponent's head comes down and across, though it is also attempted deliberately from guard once a fighter's head and an arm are trapped in the right position.`,
    risks: `Because it is frequently attempted from a scramble or a defended takedown rather than from a fully controlling position, an unfinished guillotine attempt can leave the attacking fighter's own position compromised if the defending fighter passes through it and improves position instead.`,
    counters: `Defending a guillotine typically involves the trapped fighter posturing up and working to free their head before the choke fully locks in, along with controlling the attacking fighter's grip to prevent it from tightening further.`,
    dangerAndStoppage: `Like other chokes, a fully locked guillotine restricts blood flow or breathing and a fighter who does not tap risks losing consciousness; the referee watches for the grip being fully secured and for signs the defending fighter can no longer intelligently continue.`,
    example: `A fighter shoots for a takedown; the opponent sprawls, catching the attacking fighter's neck on the way down and wrapping an arm around it. The trapped fighter, unable to free their head or complete the takedown, taps out before the choke fully locks in.`,
    misunderstandings: `A common one: assuming a guillotine only happens off a stopped takedown. It is also set up deliberately from guard and other ground positions once a fighter's head becomes available, not only as a counter to a shot.`,
    related: ['darce-choke', 'anaconda-choke', 'rear-naked-choke', 'submission-defense'],
  }),

  technique({
    slug: 'triangle-choke',
    title: 'Triangle Choke',
    category: 'submissions',
    difficulty: 'intermediate',
    aliases: ['triangle choke', 'triangle submission'],
    summary:
      "A choke applied with the legs from guard, using the attacker's own leg and the opponent's shoulder to close off the neck.",
    order: 40,
    readMinutes: 3,
    sourceKeys: [{ key: 'wp-triangle-choke' }],
    recognition: `Applied from the bottom fighter's guard, the attacking fighter's legs form a triangle shape around the defending fighter's neck and one trapped arm, rather than an arm doing the choking.`,
    theTechnique: `From guard, the attacking fighter traps one of the defending fighter's arms across their own body and wraps their legs around the defending fighter's neck and the trapped arm, locking one leg behind their own knee to close the triangle. The choke comes from the compression this creates around the neck, using the defending fighter's own trapped shoulder as part of what closes off the blood flow, rather than from an arm.`,
    whenUsed: `It is a guard-based submission, typically attempted when a fighter on their back can trap one of the top fighter's arms and get an angle to swing a leg over the exposed side of the neck, often when the top fighter postures up incorrectly or leaves an arm inside guard.`,
    risks: `Attempting it from guard means the attacking fighter is not in a dominant position to begin with, so an unfinished attempt can leave them exposed to the top fighter passing to a stronger position while the legs are committed to the choke.`,
    counters: `Defending a triangle choke generally involves the trapped fighter freeing the caught arm and posturing away before the legs can be fully locked, or stacking their weight forward to relieve the pressure the choke depends on.`,
    dangerAndStoppage: `Because it compresses the neck from both sides using the legs and the trapped arm together, a locked triangle can cut off blood flow quickly; the referee watches for the lock being fully secured and for the defending fighter losing the ability to intelligently continue.`,
    example: `A fighter caught inside an opponent's guard leaves an arm across their body while trying to posture up to strike. The bottom fighter traps that arm, swings a leg over the exposed shoulder, and locks the triangle; the top fighter taps as the choke tightens.`,
    misunderstandings: `A common one: assuming a triangle choke works by squeezing the head alone. The mechanism specifically uses the defending fighter's own trapped arm and shoulder against their neck, which is why freeing that arm early is central to defending it.`,
    related: ['full-guard', 'armbar', 'submission-defense'],
  }),

  technique({
    slug: 'arm-triangle',
    title: 'Arm Triangle',
    category: 'submissions',
    difficulty: 'intermediate',
    aliases: ['arm triangle choke', 'head and arm choke'],
    summary:
      "A choke from side control or north-south that traps one of the opponent's own arms against their neck.",
    order: 50,
    readMinutes: 3,
    sourceKeys: [{ key: 'wp-arm-triangle' }],
    recognition: `Applied from a top position such as side control or north-south, with the defending fighter's head and one of their own arms trapped together against the attacking fighter's chest or shoulder.`,
    theTechnique: `The attacking fighter traps the defending fighter's head and one arm together, then uses their own arms and body weight to squeeze that trapped arm against the side of the defending fighter's neck, closing off blood flow using the opponent's own shoulder as part of the choke.`,
    whenUsed: `It is set up from dominant top positions, most often side control or north-south, when a fighter's head and near arm become trapped together during a scramble or a failed defensive posture.`,
    risks: `Finishing it typically requires the attacking fighter to commit significant body weight and can require passing to a slightly different position (such as mount) mid-attempt, which briefly changes the control picture if the defending fighter escapes before it locks.`,
    counters: `Defending an arm triangle usually means freeing the trapped arm before the choke is fully locked, or turning into the attacking fighter to relieve the pressure the position depends on.`,
    dangerAndStoppage: `Like other chokes, a fully secured arm triangle restricts blood flow and can render a fighter unconscious if held; the referee watches for the choke locking fully in and for a fighter's inability to continue.`,
    example: `During a scramble, a fighter ends up in side control with an opponent's head and arm trapped against their own body. They work their weight over into a stronger angle, and the opponent taps as the choke closes.`,
    misunderstandings: `A common one: confusing an arm triangle with a triangle choke because of the shared name. A triangle choke is applied with the legs from guard; an arm triangle is applied with the arms from a top position, entirely different mechanisms.`,
    related: ['side-control', 'north-south-position', 'triangle-choke'],
  }),

  technique({
    slug: 'darce-choke',
    title: "D'Arce Choke",
    category: 'submissions',
    difficulty: 'intermediate',
    aliases: ['darce choke', "d'arce choke", 'brabo choke'],
    summary:
      "A front headlock choke that traps the opponent's head and arm from the side, closely related to the anaconda choke.",
    order: 60,
    readMinutes: 3,
    sourceKeys: [{ key: 'wp-darce' }],
    recognition: `Applied from a front headlock-style position, one arm threads under the defending fighter's near arm and around their neck, trapping the head and shoulder together against the attacking fighter's side.`,
    theTechnique: `The attacking fighter threads an arm under the defending fighter's arm and wraps it around the far side of their neck, then locks the grip and squeezes, trapping the defending fighter's head and shoulder together in a way that closes off blood flow through the neck.`,
    whenUsed: `It typically comes from a scramble on the ground, often when a fighter defending a takedown or working from top position ends up with an arm and the head of their opponent both available on the same side.`,
    risks: `As with a guillotine, it is frequently attempted mid-scramble rather than from an already-dominant position, so an unfinished attempt can leave the attacking fighter's position unresolved if the hold is escaped.`,
    counters: `Defending a d'Arce choke generally means freeing the trapped arm and creating space for the head before the grip is fully locked, similar in principle to defending a guillotine.`,
    dangerAndStoppage: `A locked d'Arce restricts blood flow through the neck in the same way other chokes do, and the referee watches for the grip fully securing and for signs the defending fighter cannot continue.`,
    example: `Scrambling for position after a stuffed takedown, a fighter finds an opponent's arm and head available on the same side, threads the choke, and finishes it as the opponent taps rather than risk losing consciousness.`,
    misunderstandings: `A common one: treating the d'Arce and anaconda chokes as identical. Both trap a head and an arm from a similar scrambling position, but the exact grip and finishing mechanism differ between them, and they are named separately for that reason.`,
    related: ['anaconda-choke', 'guillotine-choke', 'submission-defense'],
  }),

  technique({
    slug: 'anaconda-choke',
    title: 'Anaconda Choke',
    category: 'submissions',
    difficulty: 'intermediate',
    aliases: ['anaconda choke', 'anaconda submission'],
    summary:
      "A front headlock choke closely related to the d'Arce, typically finished by rolling the opponent over.",
    order: 70,
    readMinutes: 3,
    sourceKeys: [{ key: 'wp-anaconda' }],
    recognition: `Applied from a front headlock position similar to a d'Arce choke, often recognisable by the attacking fighter rolling their own body over the trapped fighter to finish the choke rather than staying still.`,
    theTechnique: `The attacking fighter wraps an arm around the defending fighter's head and near arm from a front headlock, locks the grip, and typically rolls their body to one side to add compression and complete the choke, trapping the head and shoulder together against the neck.`,
    whenUsed: `Like the d'Arce, it comes from a scramble where a fighter's head and near arm are both caught in a front headlock, most often while defending or transitioning out of a takedown attempt.`,
    risks: `The rolling finish it typically requires briefly changes both fighters' positions on the mat, which can expose the attacking fighter if the roll is stopped or reversed before the choke locks.`,
    counters: `Defending an anaconda choke generally means preventing the roll that completes it and working to free the trapped arm and head early, before the grip is set.`,
    dangerAndStoppage: `Once locked, it restricts blood flow through the neck like other chokes in this family, and the referee watches for the choke fully setting and for the defending fighter's ability to continue.`,
    example: `A fighter catches an opponent's head and arm in a front headlock during a scramble, locks the grip, and rolls through to finish the choke as the opponent taps.`,
    misunderstandings: `A common one: assuming the anaconda and d'Arce are simply two names for the same choke. They share a starting position and family resemblance but differ in the grip and finishing mechanism, and are recognised as distinct techniques.`,
    related: ['darce-choke', 'guillotine-choke'],
  }),

  technique({
    slug: 'armbar',
    title: 'Armbar',
    category: 'submissions',
    difficulty: 'beginner',
    isFeatured: true,
    aliases: ['arm bar', 'straight armbar'],
    summary:
      "A joint lock that hyperextends the elbow, one of the sport's most recognisable and commonly attempted submissions.",
    order: 80,
    readMinutes: 4,
    sourceKeys: [{ key: 'wp-armbar' }],
    recognition: `The attacking fighter controls one of the defending fighter's arms across their own body, usually with their legs across the defending fighter's chest and head, and extends their hips to straighten the trapped arm against the elbow joint.`,
    theTechnique: `The attacking fighter isolates one of the defending fighter's arms, traps it between their legs with the elbow positioned against their hips, and extends their hips upward while pulling the wrist down, straightening the arm past its normal range at the elbow.`,
    whenUsed: `It is attempted from a wide range of positions, including guard, mount and back control, whenever a fighter's arm becomes isolated and extended, and is one of the most frequently attempted submissions in the sport because of how many positions can lead into it.`,
    risks: `Committing to an armbar, particularly from guard, generally means giving up some positional control while the legs are occupied trapping the arm, which can leave the attacking fighter exposed if the hold is escaped before it is finished.`,
    counters: `Defending an armbar generally involves the trapped fighter clasping their hands together or turning their body toward the attacking fighter to relieve the leverage on the joint before it is fully extended, rather than relying on arm strength alone.`,
    dangerAndStoppage: `A fully applied armbar hyperextends the elbow joint, and a fighter who does not tap risks ligament damage; referees and fighters alike treat a slowly and clearly applied armbar as a fight-ending situation the moment it is locked in, since the joint has little further range before injury.`,
    example: `A fighter attacking from guard traps an opponent's arm, swings a leg over their head, and extends their hips. The opponent, unable to free the arm or relieve the pressure, taps before the joint is forced past its limit.`,
    misunderstandings: `A common one: assuming an armbar only works from guard. It is applied from numerous positions, including mount and back control, whenever an arm becomes isolated, not only the version most commonly shown in highlight clips.`,
    related: ['kimura', 'americana', 'full-guard', 'submission-defense'],
  }),

  technique({
    slug: 'kimura',
    title: 'Kimura',
    category: 'submissions',
    difficulty: 'intermediate',
    aliases: ['kimura lock', 'kimura submission'],
    summary:
      "A shoulder lock applied by rotating a bent arm behind the opponent's back, effective from several positions.",
    order: 90,
    readMinutes: 3,
    sourceKeys: [{ key: 'wp-kimura' }],
    recognition: `The attacking fighter controls one of the defending fighter's wrists with both hands, the defending fighter's elbow bent, and rotates the trapped arm up behind their back rather than straightening it.`,
    theTechnique: `The attacking fighter grips the defending fighter's wrist with both hands, using the bent arm as a lever, and rotates it behind the defending fighter's back, applying pressure to the shoulder joint rather than the elbow.`,
    whenUsed: `It is attempted from several positions, including guard, side control and half guard, whenever a fighter's arm is bent and can be isolated behind their body, and is also commonly used as a control and transition tool even when a finish isn't immediately available.`,
    risks: `Because it can be applied from a range of positions with varying levels of control, an unfinished kimura attempt from a less dominant position can leave the attacking fighter's grip and posture compromised if the defending fighter clears it.`,
    counters: `Defending a kimura generally means the trapped fighter clasping their hands together or rolling with the rotation to relieve pressure on the shoulder before the lock is fully applied.`,
    dangerAndStoppage: `A fully applied kimura can dislocate or otherwise injure the shoulder joint through forced rotation, and a fighter who does not tap risks that injury; the referee and the fighter's corner watch for the lock being clearly secured.`,
    example: `A fighter working from side control traps an opponent's bent arm, secures the wrist with both hands, and rotates it up behind the opponent's back. The opponent taps as the shoulder reaches its limit.`,
    misunderstandings: `A common one: assuming a kimura and an armbar attack the same joint. A kimura targets the shoulder through rotation with the elbow kept bent; an armbar targets the elbow directly by straightening the arm.`,
    related: ['americana', 'armbar', 'full-guard'],
  }),

  technique({
    slug: 'americana',
    title: 'Americana',
    category: 'submissions',
    difficulty: 'intermediate',
    aliases: ['americana lock', 'keylock'],
    summary:
      'A shoulder lock similar to the kimura but applied in the opposite direction, usually from a top position.',
    order: 100,
    readMinutes: 3,
    sourceKeys: [{ key: 'wp-americana' }],
    recognition: `Applied from a top position, usually side control or mount, with the defending fighter's arm bent at roughly a right angle and pinned near their head, the attacking fighter's grip working the wrist down toward the hip rather than up behind the back.`,
    theTechnique: `The attacking fighter pins the defending fighter's bent arm near their head, one hand controlling the wrist, and levers the arm down and along the ground, rotating the shoulder in the direction opposite to a kimura.`,
    whenUsed: `It is attempted almost exclusively from a top position, most commonly side control or mount, once a fighter's arm becomes trapped near their own head in a bent, exposed position.`,
    risks: `Because it is applied from an already dominant position, the risk to the attacking fighter is comparatively low, though committing both hands to the lock briefly reduces the fighter's ability to strike or otherwise control the rest of their opponent's body.`,
    counters: `Defending an americana generally involves the trapped fighter rotating their hand and forearm to reduce the leverage available to the attacking fighter and working to free the trapped arm before the lock is set.`,
    dangerAndStoppage: `A fully applied americana rotates the shoulder joint beyond its normal range in the same general way a kimura does, and a fighter who does not tap risks shoulder injury; the referee watches for the lock being clearly secured.`,
    example: `Controlling an opponent in side control, a fighter finds an arm bent and exposed near the head, secures the wrist, and levers it down along the mat. The opponent taps as the shoulder reaches its limit.`,
    misunderstandings: `A common one: treating the americana and kimura as interchangeable names for the same lock. They attack the shoulder from opposite rotational directions and are set up from different arm positions, and are recognised as distinct techniques despite the shared target joint.`,
    related: ['kimura', 'armbar', 'side-control', 'mount'],
  }),

  technique({
    slug: 'heel-hook',
    title: 'Heel Hook',
    category: 'submissions',
    difficulty: 'advanced',
    aliases: ['heel hook submission'],
    summary:
      "A leg lock that rotates the foot and, with it, the knee, considered one of the sport's more dangerous holds.",
    order: 110,
    readMinutes: 4,
    sourceKeys: [{ key: 'wp-heel-hook' }],
    recognition: `Applied by trapping and controlling one of the defending fighter's legs, usually with the attacking fighter's own legs, and rotating the foot, which twists the knee rather than the ankle itself.`,
    theTechnique: `The attacking fighter traps the defending fighter's leg, controlling the foot and heel, and rotates it, which transmits rotational pressure through the ankle into the knee joint rather than bending the ankle up and down the way some other leg locks do.`,
    whenUsed: `It is set up from a range of leg-entanglement positions on the ground, and has become increasingly prominent in modern MMA as more fighters cross-train specifically in leg lock systems developed in grappling.`,
    risks: `Leg entries generally require the attacking fighter to commit their own legs and hips into a tangled position with their opponent, which can leave both fighters' positions harder to read and control compared with an upper-body submission attempt.`,
    counters: `Defending a heel hook generally centres on controlling the foot and hip early, before the rotation is applied, and on recognising the danger of the position quickly, since the warning window before injury is considered shorter than with many other submissions.`,
    dangerAndStoppage: `The heel hook is widely considered one of the more dangerous submissions in grappling and MMA specifically because it attacks the knee's ligaments through rotational force with comparatively little warning discomfort before an injury threshold is reached, unlike a choke's gradual loss of consciousness or an armbar's more perceptible elbow extension; this is why fighters and coaches place a particular premium on recognising and escaping it early rather than testing how far it can be taken.`,
    example: `Tangled in a leg entanglement on the ground, a fighter secures control of an opponent's foot and applies rotation. The opponent, aware of how quickly the position can turn dangerous, taps promptly rather than waiting to feel significant pain.`,
    misunderstandings: `A common one: assuming a heel hook attacks the ankle the way a straight ankle lock does. It primarily endangers the knee through rotation transmitted via the foot, which is exactly why it is treated with more caution than most other leg locks.`,
    related: ['straight-ankle-lock', 'kneebar', 'submission-defense'],
  }),

  technique({
    slug: 'kneebar',
    title: 'Kneebar',
    category: 'submissions',
    difficulty: 'advanced',
    aliases: ['knee bar submission'],
    summary:
      'A joint lock that hyperextends the knee, functioning like an armbar applied to the leg.',
    order: 120,
    readMinutes: 3,
    sourceKeys: [{ key: 'wp-kneebar' }],
    recognition: `The attacking fighter controls one of the defending fighter's legs across their own body, similar in shape to an armbar but applied to the leg, and extends their hips to straighten the knee joint.`,
    theTechnique: `The attacking fighter traps the defending fighter's leg, positioning the knee against their own hips, and extends their body to straighten the leg past its normal range at the knee, the same basic mechanism as an armbar applied to a larger joint.`,
    whenUsed: `It is attempted from leg-entanglement positions on the ground, often when a fighter's straightened leg becomes available during a scramble for leg control.`,
    risks: `Similar to an armbar, committing to a kneebar generally means the attacking fighter's own legs and hips are occupied controlling the target leg, which can leave them exposed if the position is escaped before the lock is finished.`,
    counters: `Defending a kneebar generally involves bending the trapped leg and rotating the hip to relieve pressure on the joint before it is fully extended.`,
    dangerAndStoppage: `A fully applied kneebar hyperextends the knee joint, and a fighter who does not tap risks ligament injury; the referee watches for the lock being clearly and fully secured before the joint's limit is reached.`,
    example: `During a scramble over leg position, a fighter secures a straightened leg, traps it across their hips, and extends. The opponent taps as the knee nears its limit.`,
    misunderstandings: `A common one: confusing a kneebar with a heel hook because both attack the leg. A kneebar hyperextends the knee directly, similar to how an armbar works on the elbow; a heel hook attacks the knee indirectly through rotation of the foot.`,
    related: ['heel-hook', 'straight-ankle-lock', 'armbar'],
  }),

  technique({
    slug: 'straight-ankle-lock',
    title: 'Straight Ankle Lock',
    category: 'submissions',
    difficulty: 'intermediate',
    aliases: ['straight ankle lock', 'straight footlock', 'achilles lock'],
    summary:
      'A leg lock that hyperextends the ankle by prying the foot away from the shin, without the rotation a heel hook uses.',
    order: 130,
    readMinutes: 3,
    sourceKeys: [{ key: 'wp-ankle-lock' }],
    recognition: `The attacking fighter traps one of the defending fighter's legs between their own, arm across the foot near the Achilles tendon, and pulls the foot back while the leg is controlled, without the twisting motion a heel hook uses.`,
    theTechnique: `The attacking fighter isolates the defending fighter's lower leg, positions an arm across the foot near the ankle, and pulls back while controlling the leg with their own body, hyperextending the ankle joint directly rather than through rotation.`,
    whenUsed: `Like other leg locks, it is set up from leg-entanglement positions on the ground, often as one option among several once a fighter has control of an opponent's leg.`,
    risks: `As with other leg attacks, committing to it generally means the attacking fighter's own legs are occupied controlling the target leg, leaving their broader position less flexible while the attempt is in progress.`,
    counters: `Defending a straight ankle lock generally involves rotating the trapped foot and controlling the attacking fighter's grip to relieve the direct pressure on the joint before it locks fully in.`,
    dangerAndStoppage: `A fully applied straight ankle lock hyperextends the ankle joint, and a fighter who does not tap risks ligament or tendon injury around the ankle; the referee watches for the lock being clearly secured.`,
    example: `Working from a leg entanglement, a fighter isolates an opponent's foot and pulls back against the ankle. The opponent taps as the joint nears its limit rather than risk further injury.`,
    misunderstandings: `A common one: assuming any submission attacking the lower leg is a heel hook. A straight ankle lock works through direct extension without the rotational component that makes a heel hook a separate, and generally more dangerous, technique.`,
    related: ['heel-hook', 'kneebar'],
  }),

  technique({
    slug: 'neck-crank',
    title: 'Neck Crank',
    category: 'submissions',
    difficulty: 'advanced',
    aliases: ['neck crank submission'],
    summary:
      'A joint lock applied to the neck itself, distinct from a choke because it targets the spine rather than blood flow or breathing.',
    order: 140,
    readMinutes: 3,
    sourceKeys: [{ key: 'wp-neck-crank' }],
    recognition: `The attacking fighter controls the defending fighter's head and applies force that bends or twists the neck beyond a comfortable range, distinct from a choke in that no pressure is being placed on the front or sides of the throat itself.`,
    theTechnique: `The attacking fighter controls the defending fighter's head, often from a position such as turtle or a compromised guard, and applies leverage that forces the neck into a bent or twisted position beyond its normal range, stressing the cervical spine rather than restricting airflow or blood flow.`,
    whenUsed: `Neck cranks appear less often in MMA than chokes or the more common joint locks, and are typically attempted from positions where a fighter's head is controlled but a standard choke isn't immediately available.`,
    risks: `Because the target area is the spine, attempts are generally applied with particular care, and a poorly controlled attempt risks losing the position without a clean finish if the defending fighter can move their head or shift their body to relieve the angle.`,
    counters: `Defending a neck crank generally involves moving the head and shoulders to relieve the angle of pressure and controlling the attacking fighter's grip before the leverage is fully applied.`,
    dangerAndStoppage: `A fully applied neck crank stresses the cervical spine directly rather than the airway or blood supply, and a fighter who does not tap risks neck injury; referees treat a clearly locked-in neck crank with the same urgency as a choke or joint lock nearing its limit.`,
    example: `From a scramble with an opponent's head controlled but no clean choke available, a fighter applies pressure that bends the neck toward its limit. The opponent taps rather than risk a neck injury.`,
    misunderstandings: `A common one: describing any neck attack as a "choke." A neck crank specifically targets the joint and spine rather than the airway or blood vessels, which is why it is classed separately from chokes despite both targeting the same general area of the body.`,
    related: ['rear-naked-choke', 'guillotine-choke', 'submission-defense'],
  }),

  standard({
    slug: 'submission-chains',
    title: 'Submission Chains',
    category: 'submissions',
    difficulty: 'advanced',
    aliases: ['submission chaining', 'chaining submissions'],
    summary:
      'A defended submission attempt often flows straight into a second, different attempt rather than ending the exchange.',
    order: 150,
    readMinutes: 3,
    sourceKeys: [{ key: 'wp-submission-combat' }],
    explanation: `A submission chain describes a sequence in which a fighter's first submission attempt is defended, but the defence itself creates the opening for a second, often different, attempt, rather than the exchange simply resetting. Because defending one submission typically means moving a limb or the head in a specific direction, that movement can expose a different joint or the neck to a follow-up attack.

Common examples include an armbar attempt that, once defended, flows into a triangle or an omoplata (a shoulder lock using the legs), or a guillotine attempt that transitions into an arm triangle once the defending fighter turns to escape the first.`,
    howItWorks: `The underlying idea is that a fighter defending correctly against one attack often has to commit to a specific defensive movement, and a skilled attacking fighter reads that movement in advance and has a second attempt already prepared for exactly the position it creates, rather than treating each submission attempt as an isolated event.`,
    example: `A fighter attempts an armbar from guard; the opponent defends by clasping their hands together and pulling the arm free. As the opponent does this, the attacking fighter swings a leg across their now-exposed neck and transitions directly into a triangle choke, finishing the fight moments after the first attempt was defended.`,
    whyItMatters: `Recognising submission chains changes how a viewer reads a defended attempt: a fighter surviving one submission is not necessarily out of danger, and often the more experienced ground fighter is the one already moving toward the second attack before the first one is even finished being escaped.`,
    misunderstandings: `A common one: treating a successfully defended submission attempt as the end of the exchange. In a well-executed chain, the defence is exactly what the attacking fighter was expecting, and the real danger is often the position the defence itself creates.`,
    related: ['armbar', 'triangle-choke', 'guillotine-choke', 'arm-triangle'],
  }),

  standard({
    slug: 'submission-defense',
    title: 'Submission Defense',
    category: 'submissions',
    alsoIn: ['defense'],
    aliases: ['submission defence', 'defending a submission', 'escaping a submission'],
    summary:
      'General principles a fighter relies on to survive an opponent’s attempt: control the source, deny the finish, escape the position.',
    order: 160,
    readMinutes: 3,
    sourceKeys: [{ key: 'wp-submission-combat' }],
    explanation: `Submission defence generally rests on a small set of shared ideas across most holds, rather than a completely different approach for each one: controlling the limb or area being attacked before the lock or choke is fully secured, denying the specific grip or leverage the technique depends on, and working to escape the underlying position, since almost every submission depends on a position that made the attempt possible in the first place.

A fighter with strong submission defence isn't relying purely on physical toughness; they are recognising danger early, often before an untrained viewer would see anything happening, and reacting before the technique reaches the point where the only remaining option is to tap.`,
    howItWorks: `Because most attempts telegraph through the position they come from (a triangle needs a trapped arm and an exposed neck, a guillotine needs a trapped head), a large part of defence is positional awareness: recognising the setup for a technique and addressing it before the specific grip is finished, rather than only reacting once a hold is already fully applied.`,
    example: `A fighter senses an opponent working for an arm across their neck from guard and, rather than waiting to see what develops, immediately postures up and frees the arm, preventing a triangle choke from ever being set up rather than escaping it once locked in.`,
    whyItMatters: `A fighter's reputation for good submission defence, being difficult to finish even from bad positions, is treated as seriously in the sport as an offensive submission game, and materially changes how opponents plan a fight against them.`,
    misunderstandings: `A common one: assuming submission defence means simply being strong enough to resist a lock or choke by force. Most effective defence happens earlier, at the position and grip-denial stage, well before physical strength against a fully locked technique becomes the deciding factor.`,
    related: ['mma-submissions-explained', 'submission-chains', 'rear-naked-choke', 'armbar'],
  }),

  definition({
    slug: 'what-does-tap-out-mean',
    title: 'What Does "Tap Out" Mean?',
    category: 'submissions',
    aliases: ['tap out meaning', 'what is tapping out', 'tapping out mma'],
    summary:
      'The signal a fighter gives to end a fight immediately, usually by striking the mat or their opponent repeatedly with an open hand.',
    order: 170,
    readMinutes: 2,
    sourceKeys: [{ key: 'wp-tapping-out' }, { key: 'wp-submission-combat' }],
    explanation: `Tapping out is the physical signal a fighter gives to tell the referee they cannot, or do not wish to, continue, most commonly a rapid, visible tap of an open hand against the mat, their own body, or their opponent. The moment a clear tap is seen, the referee stops the fight immediately and the tapping fighter loses by submission.

A fighter can also submit verbally, saying something the referee accepts as a clear submission, which the library covers separately since it isn't the same physical signal, even though it produces the same result.`,
    example: `Caught in a fully locked armbar with no way to escape, a fighter taps their open hand rapidly against the mat several times. The referee sees it immediately, steps in, and stops the fight, recording the result as a submission.`,
    misunderstandings: `A common one: assuming a fighter only taps when they are in severe pain. Many taps to chokes happen well before real pain, since a fighter recognises unconsciousness is imminent and chooses to stop the fight rather than wait for that to happen.`,
    related: ['verbal-submission', 'mma-submissions-explained', 'rear-naked-choke'],
  }),

  definition({
    slug: 'verbal-submission',
    title: 'Verbal Submission',
    category: 'submissions',
    aliases: ['verbal tap', 'submitting verbally'],
    summary:
      'A fighter can end the fight by telling the referee they are done, without physically tapping.',
    order: 180,
    readMinutes: 2,
    sourceKeys: [{ key: 'wp-tapping-out' }],
    explanation: `A verbal submission ends a fight the same way a physical tap does: a fighter tells the referee, clearly enough to be understood over the noise of the arena, that they cannot or do not want to continue. It is functionally identical to tapping out in its result, a loss by submission, and exists because a fighter's hand isn't always free to tap, most obviously when it is the arm being attacked, or held by a hold the fighter cannot move.`,
    example: `Caught in a kimura with the defending arm fully controlled and no free hand available to tap the mat, a fighter tells the referee they submit. The referee, satisfied the words were clear, stops the fight immediately.`,
    misunderstandings: `A common one: assuming only a physical tap counts as a genuine submission. A clear verbal submission carries exactly the same weight in the official result as a physical tap; the method differs, the outcome does not.`,
    related: ['what-does-tap-out-mean', 'mma-submissions-explained'],
  }),
];

export const MMA_GROUND_EXPLAINERS: ExplainerSeed[] = [...GROUND_POSITIONS, ...SUBMISSIONS];
