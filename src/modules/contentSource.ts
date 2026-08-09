export type ContentSource = "local" | "supabase";

const EXPLICIT_SOURCES = new Set<ContentSource>(["local", "supabase"]);

function hasSupabaseContentEnv(
  env: NodeJS.ProcessEnv | Record<string, string | undefined>,
): boolean {
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  const secretKey = env.SUPABASE_SECRET_KEY?.trim();

  return Boolean(url && publishableKey && secretKey);
}

/**
 * Selects where published learning content is loaded from.
 * Supabase is used only when explicitly requested or on Vercel with full Supabase env.
 */
export function resolveContentSource(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): ContentSource {
  const explicit = env.CONTENT_SOURCE?.trim().toLowerCase();

  if (explicit && EXPLICIT_SOURCES.has(explicit as ContentSource)) {
    return explicit as ContentSource;
  }

  if (env.NODE_ENV === "test" || env.VITEST === "true") {
    return "local";
  }

  if (env.NODE_ENV === "development") {
    return "local";
  }

  if (env.VERCEL === "1" && hasSupabaseContentEnv(env)) {
    return "supabase";
  }

  return "local";
}

export function isExplicitLocalContentSource(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): boolean {
  return resolveContentSource(env) === "local";
}
