/**
 * Breadth-aware sport allocation for the Master Quiz (Part 25). Pure
 * function: given how many eligible (unseen-or-repeatable, per user)
 * questions each sport actually has available, decide how many questions
 * to draw from each sport so the attempt tests breadth rather than
 * happening to reflect whichever sport has the most content.
 *
 * Algorithm:
 *   1. Baseline: every sport with at least one available question gets an
 *      equal floor share (Part 25's "give baseline representation across
 *      sports").
 *   2. Remaining slots are handed out round-robin across sports that still
 *      have inventory left, one at a time, until either the count is
 *      reached or every sport is exhausted.
 *
 * This intentionally does not use fixed per-sport weights (Part 25: "do not
 * permanently hardcode this allocation") — it reacts to whatever inventory
 * actually exists, so a newly launched sport with few questions still gets
 * its baseline share and a sport that's run dry never blocks the rest.
 */
export function allocateMasterQuizSlots(
  availableBySport: Map<string, number>,
  totalCount: number,
): Map<string, number> {
  const sportsWithInventory = [...availableBySport.entries()].filter(
    ([, available]) => available > 0,
  );
  const allocation = new Map<string, number>();
  if (sportsWithInventory.length === 0 || totalCount <= 0) return allocation;

  for (const [sportId] of sportsWithInventory) {
    allocation.set(sportId, 0);
  }

  let remainingSlots = totalCount;

  // Round-robin, one slot at a time, across every sport that still has
  // inventory left relative to what it's already been allocated. This
  // single loop *is* both "baseline" and "backfill": a sport whose inventory
  // runs out simply stops being offered slots on later passes, and whatever
  // it would have received keeps circulating to sports that still have
  // room — there is no separate backfill pass because round-robin already
  // guarantees the total allocated equals total available inventory (up to
  // `totalCount`), never less, as long as at least one sport still has slack.
  while (remainingSlots > 0) {
    let allocatedThisRound = false;
    for (const [sportId, available] of sportsWithInventory) {
      if (remainingSlots <= 0) break;
      const already = allocation.get(sportId) ?? 0;
      if (already >= available) continue; // this sport's inventory is exhausted
      allocation.set(sportId, already + 1);
      remainingSlots -= 1;
      allocatedThisRound = true;
    }
    if (!allocatedThisRound) break; // every sport is exhausted; stop rather than loop forever
  }

  return allocation;
}
