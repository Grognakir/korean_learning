import { z } from "zod";

const nonEmptyTrimmed = z.string().trim().min(1);

/**
 * Client-safe Supabase env (URL + publishable/anon key).
 * Official Next.js names: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
 * Local CLI still emits a legacy anon JWT — place it in the publishable slot.
 */
export const publicSupabaseEnvSchema = z.strictObject({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: nonEmptyTrimmed,
});

export type PublicSupabaseEnvInput = z.input<typeof publicSupabaseEnvSchema>;
export type PublicSupabaseEnv = {
  url: string;
  publishableKey: string;
};

export class EnvValidationError extends Error {
  readonly code = "ENV_VALIDATION_FAILED" as const;

  constructor(
    message: string,
    readonly issues: readonly string[],
  ) {
    super(message);
    this.name = "EnvValidationError";
  }
}

function formatIssues(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join(".") : "(root)";
    return `${path}: ${issue.message}`;
  });
}

export function parsePublicSupabaseEnv(
  source: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): PublicSupabaseEnv {
  const result = publicSupabaseEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: source.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: source.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });

  if (!result.success) {
    throw new EnvValidationError(
      "Public Supabase environment is missing or invalid.",
      formatIssues(result.error),
    );
  }

  return {
    url: result.data.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: result.data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
}

/** Server-only secret names must never appear in the public schema. */
export const SERVER_ONLY_SUPABASE_ENV_KEYS = ["SUPABASE_SECRET_KEY"] as const;

export function assertPublicSchemaExcludesServerSecrets(
  schemaKeys: readonly string[] = Object.keys(publicSupabaseEnvSchema.shape),
): void {
  const overlap = schemaKeys.filter((key) =>
    (SERVER_ONLY_SUPABASE_ENV_KEYS as readonly string[]).includes(key),
  );

  if (overlap.length > 0) {
    throw new Error(
      `Public Supabase env schema must not include server secrets: ${overlap.join(", ")}`,
    );
  }
}
