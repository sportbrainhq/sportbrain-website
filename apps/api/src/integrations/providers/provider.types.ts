/**
 * The contract every provider adapter implements.
 *
 * This file is the barrier described in the architecture: everything upstream of
 * it is provider-shaped and disposable, everything downstream speaks only these
 * types. No provider's JSON shape, field naming or identifier scheme appears
 * past this boundary.
 *
 * The barrier matters more here than in a typical integration. The cheapest
 * viable provider grants no publication licence and reserves the right to
 * terminate access following a rights-holder complaint, so replacement is more
 * likely than a normal vendor swap and may need to happen quickly. The adapter
 * layer exists so that a swap is a weekend rather than a quarter.
 *
 * Adapters are deliberately thicker than an HTTP client wrapper. Provider quirks
 * have to be absorbed somewhere, and the alternative to absorbing them here is
 * leaking them everywhere.
 */

/**
 * An entity as the provider describes it, before it becomes ours.
 *
 * Note what is absent: no canonical id. An adapter never decides identity; it
 * reports what it found and identity resolution decides what that corresponds
 * to. Keeping those separate is what allows several providers to describe the
 * same team without racing to create it.
 */
export interface ProviderEntity {
  /** The provider's own identifier, as text. Providers disagree on type: numeric ids and `Q7156` both occur. */
  externalId: string;

  /** Primary name as the provider gives it, unnormalised. */
  name: string;

  /** Alternative names, transliterations and former names, where the provider supplies them. */
  aliases?: string[];

  /**
   * Cross-references to other providers, where this provider publishes them.
   *
   * Wikidata is the important case: it carries identifiers linking the same
   * entity across many external databases. That turns N-by-N cross-provider
   * matching into N independent problems, which is the single strongest
   * practical reason to ingest Wikidata first.
   */
  crossReferences?: Record<string, string>;

  /** Fields that map onto canonical columns. Adapter-normalised, not provider-shaped. */
  fields: Record<string, unknown>;
}

/** A person as a provider describes them. */
export interface ProviderPerson extends ProviderEntity {
  fields: {
    fullName: string;
    displayName?: string;
    dateOfBirth?: string;
    dateOfDeath?: string;
    nationality?: string;
    imageUrl?: string;
    /** Sport-specific facts destined for `person.attributes`. */
    attributes?: Record<string, unknown>;
  };
}

/** A team as a provider describes it. */
export interface ProviderTeam extends ProviderEntity {
  fields: {
    name: string;
    shortName?: string;
    country?: string;
    foundedYear?: number;
    logoUrl?: string;
    /** `international`, `club`, `franchise` or `invitational`. */
    kind?: string;
    attributes?: Record<string, unknown>;
  };
}

/** A competition as a provider describes it. */
export interface ProviderCompetition extends ProviderEntity {
  fields: {
    name: string;
    shortName?: string;
    country?: string;
    foundedYear?: number;
    logoUrl?: string;
    kind?: string;
    format?: string;
    attributes?: Record<string, unknown>;
  };
}

/** A venue as a provider describes it. */
export interface ProviderVenue extends ProviderEntity {
  fields: {
    name: string;
    city?: string;
    country?: string;
    capacity?: number;
    openedYear?: number;
  };
}

/**
 * What one fetch produced.
 *
 * `cursor` is what makes a job resumable. Historical backfill runs for weeks
 * beneath a daily request quota, so it must be able to stop mid-way and pick up
 * where it left off rather than restarting.
 */
export interface ProviderPage<T> {
  items: T[];
  /** Opaque continuation token. Null when the source is exhausted. */
  cursor: string | null;
  /** Requests consumed, so quota can be reconciled against what actually happened. */
  requestsUsed: number;
}

/**
 * How an adapter reports what it can do.
 *
 * Declared rather than discovered, so the ingestion scheduler can skip a job
 * without issuing a request that would fail. Wikidata has no fixtures; a
 * fixtures job asking it for some is a wasted call against a quota.
 */
export interface ProviderCapabilities {
  readonly people: boolean;
  readonly teams: boolean;
  readonly competitions: boolean;
  readonly venues: boolean;
  readonly fixtures: boolean;
  readonly statistics: boolean;
  readonly live: boolean;
}

/**
 * The interface an adapter satisfies.
 *
 * Optional methods rather than a fat interface every adapter must stub: a source
 * that only supplies entities implements only those, and `capabilities` tells
 * the scheduler which are real.
 */
export interface SportsDataProvider {
  /** Matches a value in the `provider` enum. Used for mapping rows and audit records. */
  readonly key: string;

  readonly capabilities: ProviderCapabilities;

  fetchTeams?(sportSlug: string, cursor?: string): Promise<ProviderPage<ProviderTeam>>;
  fetchPeople?(sportSlug: string, cursor?: string): Promise<ProviderPage<ProviderPerson>>;
  fetchCompetitions?(
    sportSlug: string,
    cursor?: string,
  ): Promise<ProviderPage<ProviderCompetition>>;
  fetchVenues?(sportSlug: string, cursor?: string): Promise<ProviderPage<ProviderVenue>>;
}

/**
 * Thrown when a provider fails in a way the caller should handle deliberately.
 *
 * `retryable` separates a transient network failure from a malformed response.
 * Retrying the latter wastes quota and never succeeds, and on a provider whose
 * terms treat excessive request patterns as a material breach, wasted retries
 * are not merely inefficient.
 */
export class ProviderError extends Error {
  constructor(
    readonly provider: string,
    message: string,
    readonly retryable: boolean,
    readonly cause?: unknown,
  ) {
    super(`[${provider}] ${message}`);
    this.name = 'ProviderError';
  }
}
