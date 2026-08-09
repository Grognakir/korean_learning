import { resolveContentSource } from "./contentSource";

/** Matches the `learningContent` cacheLife revalidate window used by the cached content loaders. */
const SLUG_CACHE_TTL_MS = 300_000;

type SlugCacheEntry = {
  readonly slugs: ReadonlySet<string>;
  readonly expiresAt: number;
};

let slugCache: SlugCacheEntry | undefined;

async function readPublishedModuleSlugs(): Promise<ReadonlySet<string>> {
  if (resolveContentSource() === "local") {
    const [{ getLocalLearningContent }, { getLocalCurriculumRepositories }] = await Promise.all([
      import("./resolveLearningContent"),
      import("./curriculum/resolveCurriculumContent"),
    ]);
    const { moduleRepository } = getLocalLearningContent();
    const modules = await moduleRepository.getPublished();
    const units = await getLocalCurriculumRepositories().catalogRepository.listUnits();
    const slugs = new Set(modules.map((learningModule) => learningModule.slug));
    if (units.status === "ready") {
      for (const unit of units.items) {
        slugs.add(unit.slug);
      }
    }
    return slugs;
  }

  const { createServiceRoleSupabaseClient } = await import("@/lib/supabase/serviceRoleClient");
  const client = createServiceRoleSupabaseClient();
  const { data, error } = await client
    .from("learning_modules")
    .select("slug")
    .eq("status", "published");

  if (error) {
    throw new Error(error.message);
  }

  return new Set((data ?? []).map((row) => row.slug));
}

/**
 * Slug-only lookup safe to call from Proxy: it never loads topics or exercises and memoizes
 * the result so unknown-slug traffic cannot turn into a Supabase read per request.
 */
export async function getPublishedModuleSlugs(): Promise<ReadonlySet<string>> {
  const now = Date.now();

  if (slugCache && slugCache.expiresAt > now) {
    return slugCache.slugs;
  }

  const slugs = await readPublishedModuleSlugs();
  slugCache = { slugs, expiresAt: now + SLUG_CACHE_TTL_MS };

  return slugs;
}

export function resetPublishedModuleSlugsCache(): void {
  slugCache = undefined;
}
