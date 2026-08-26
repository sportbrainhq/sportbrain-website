/**
 * Shared rule-provenance constants.
 *
 * Pulled out of the content files so that a Law revision or a review pass is one
 * edit rather than four hundred. Every rule-sensitive explainer references these
 * rather than repeating an edition string, which is also what stops two entries
 * claiming to have been written against different editions of the same Law.
 */

/** The date the rule-sensitive entries were last checked against their sources. */
export const REVIEWED = '2026-08-24';

/** The Laws edition all Law-based content is written against. */
export const MCC_CODE = 'MCC Laws of Cricket, 2017 Code (4th edition, 2022)';

/** Playing conditions are revised far more often than the Laws, hence the date. */
export const ICC_PC = 'ICC playing conditions, as at August 2026';
