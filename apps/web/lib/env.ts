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
});

const clientSchema = z.object({
  /**
   * The public origin of the site. Used for canonical URLs, Open Graph tags
   * and the sitemap, so it must be the real origin in production or every
   * absolute URL the site emits is wrong.
   */
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
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
  { NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL },
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
    { NODE_ENV: process.env.NODE_ENV, API_URL: process.env.API_URL },
    'server',
  );
}

export const siteUrl = clientEnv.NEXT_PUBLIC_SITE_URL;
