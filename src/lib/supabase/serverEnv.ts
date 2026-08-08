import "server-only";

import { z } from "zod";

import { EnvValidationError } from "@/lib/validation/env";

const nonEmptyTrimmed = z.string().trim().min(1);

/**
 * Server-only secrets. Validated here for the infrastructure boundary;
 * admin/service-role client factory is intentionally deferred past F1-I25.
 * Prefer the current secret key (`sb_secret_…`); local CLI service_role JWT is also accepted.
 */
export const serverSupabaseEnvSchema = z.strictObject({
  SUPABASE_SECRET_KEY: nonEmptyTrimmed,
});

export type ServerSupabaseEnv = {
  secretKey: string;
};

function formatIssues(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join(".") : "(root)";
    return `${path}: ${issue.message}`;
  });
}

export function parseServerSupabaseEnv(
  source: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): ServerSupabaseEnv {
  const result = serverSupabaseEnvSchema.safeParse({
    SUPABASE_SECRET_KEY: source.SUPABASE_SECRET_KEY,
  });

  if (!result.success) {
    throw new EnvValidationError(
      "Server Supabase environment is missing or invalid.",
      formatIssues(result.error),
    );
  }

  return {
    secretKey: result.data.SUPABASE_SECRET_KEY,
  };
}
