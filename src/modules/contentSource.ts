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

function supabaseHost(rawUrl: string | undefined): string {
  if (!rawUrl?.trim()) {
    return "no url";
  }

  try {
    return new URL(rawUrl).host;
  } catch {
    return "invalid url";
  }
}

/**
 * Local fixtures and Supabase can publish identical slugs, so neither the build route table nor
 * the rendered pages reveal which store a deployment reads. This line is that evidence; it must
 * stay free of credentials.
 */
export function describeContentSource(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): string {
  if (resolveContentSource(env) === "supabase") {
    return `Content source: supabase (${supabaseHost(env.NEXT_PUBLIC_SUPABASE_URL)})`;
  }

  const explicit = env.CONTENT_SOURCE?.trim();

  return `Content source: local fixtures (CONTENT_SOURCE=${explicit ? explicit : "unset"})`;
}

export function isExplicitLocalContentSource(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): boolean {
  return resolveContentSource(env) === "local";
}
