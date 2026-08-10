import "server-only";

import { z } from "zod";

import { EnvValidationError } from "@/lib/validation/env";

/**
 * Server-only admin panel credentials. Separate from Supabase user auth.
 */
export const adminEnvSchema = z.strictObject({
  ADMIN_USERNAME: z.string().trim().min(1),
  ADMIN_PASSWORD: z.string().min(1),
  ADMIN_SESSION_SECRET: z.string().trim().min(16),
});

export type AdminEnv = {
  username: string;
  password: string;
  sessionSecret: string;
};

function formatIssues(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join(".") : "(root)";
    return `${path}: ${issue.message}`;
  });
}

export function parseAdminEnv(
  source: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): AdminEnv {
  const result = adminEnvSchema.safeParse({
    ADMIN_USERNAME: source.ADMIN_USERNAME,
    ADMIN_PASSWORD: source.ADMIN_PASSWORD,
    ADMIN_SESSION_SECRET: source.ADMIN_SESSION_SECRET,
  });

  if (!result.success) {
    throw new EnvValidationError(
      "Admin environment is missing or invalid.",
      formatIssues(result.error),
    );
  }

  return {
    username: result.data.ADMIN_USERNAME,
    password: result.data.ADMIN_PASSWORD,
    sessionSecret: result.data.ADMIN_SESSION_SECRET,
  };
}
