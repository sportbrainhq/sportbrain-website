import { z } from 'zod';

/**
 * Validated environment for the web app.
 *
 * Same discipline as the API: parsed once, consumed as a typed object, and no
 * component reads `process.env` directly.
 *
 * The Next.js constraint that shapes this file: only variables prefixed
 * `NEXT_PUBLIC_` are inlined into the client bundle, and they must be
 * referenced as full literal property accesses (`process.env.NEXT_PUBLIC_X`)
 * for the compiler to substitute them. Anything else is server-only, which is
 * a feature: `API_URL` stays out of the browser bundle.
 */

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  /** Where server components and route handlers reach the API. */
  API_URL: z.string().url().default('http://localhost:4000'),
  /**
   * Shared secret for the cache revalidation endpoint.
   *
   * Optional, and the endpoint refuses every request when it is unset rather
   * than falling open. An unauthenticated revalidation route is a free way for
   * anyone to evict the whole cache repeatedly, which is a denial-of-service
   * vector against the origin.
   */
  REVALIDATE_SECRET: z.string().min(16).optional(),
});

const clientSchema = z.object({
  /**
   * The public origin of the site. Used for canonical URLs, Open Graph tags
   * and the sitemap, so it must be the real origin in production or every
   * absolute URL the site emits is wrong.
   */
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),

  /**
   * Social links, centralised here rather than hard-coded in a component.
   * Empty string means "account doesn't exist yet" — components render a
   * "coming soon" state for an empty value instead of a dead link.
   */
  NEXT_PUBLIC_SOCIAL_INSTAGRAM: z.string().default(''),
  NEXT_PUBLIC_SOCIAL_X: z.string().default(''),
  NEXT_PUBLIC_SOCIAL_YOUTUBE: z.string().default(''),
  NEXT_PUBLIC_SOCIAL_REDDIT: z.string().default(''),

  /**
   * Where the *browser* reaches the API from — client components' auth
   * calls (sign-in link, logout, save/follow) go directly to the API with
   * `credentials: 'include'`, unlike every other fetch in this app, which
   * goes through server-rendered `apiGet`/`apiPost`. Public by necessity: a
   * client component cannot read the server-only `API_URL`.
   */
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:4000'),
});

function parse<T extends z.ZodTypeAny>(schema: T, input: unknown, label: string): z.infer<T> {
  const result = schema.safeParse(input);

  if (!result.success) {
    const report = result.error.issues
      .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid ${label} environment:\n${report}`);
  }

  return result.data;
}

// Literal accesses, so Next.js can statically replace them at build time.
export const clientEnv = parse(
  clientSchema,
  {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SOCIAL_INSTAGRAM: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM,
    NEXT_PUBLIC_SOCIAL_X: process.env.NEXT_PUBLIC_SOCIAL_X,
    NEXT_PUBLIC_SOCIAL_YOUTUBE: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE,
    NEXT_PUBLIC_SOCIAL_REDDIT: process.env.NEXT_PUBLIC_SOCIAL_REDDIT,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  'client',
);

/**
 * Server-only configuration.
 *
 * Accessed through a function rather than a module-level constant so that it
 * is evaluated lazily on the server and never during a client render.
 */
export function serverEnv(): z.infer<typeof serverSchema> {
  return parse(
    serverSchema,
    {
      NODE_ENV: process.env.NODE_ENV,
      API_URL: process.env.API_URL,
      // Listed explicitly, like the others. The input object is built key by
      // key rather than passed `process.env` wholesale, so a variable added to
      // the schema and not to this list parses as undefined every time.
      REVALIDATE_SECRET: process.env.REVALIDATE_SECRET,
    },
    'server',
  );
}

export const siteUrl = clientEnv.NEXT_PUBLIC_SITE_URL;
