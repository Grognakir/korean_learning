import "server-only";

import { unstable_cache } from "next/cache";

import { createServiceRoleSupabaseClient } from "@/lib/supabase/serviceRoleClient";

const CACHE_TAG = "learning-exercise-counts";

async function loadApprovedExerciseCountsByModuleSlug(): Promise<Readonly<Record<string, number>>> {
  const client = createServiceRoleSupabaseClient();

  const [{ data: moduleRows, error: moduleError }, { data: exerciseRows, error: exerciseError }] =
    await Promise.all([
      client.from("learning_modules").select("id,slug,status").eq("status", "published"),
      client.from("exercises").select("module_id,status").eq("status", "approved"),
    ]);

  if (moduleError) {
    throw new Error(moduleError.message);
  }

  if (exerciseError) {
    throw new Error(exerciseError.message);
  }

  const slugByModuleId = Object.fromEntries((moduleRows ?? []).map((row) => [row.id, row.slug]));
  const counts: Record<string, number> = {};

  for (const row of exerciseRows ?? []) {
    const slug = slugByModuleId[row.module_id];

    if (!slug) {
      continue;
    }

    counts[slug] = (counts[slug] ?? 0) + 1;
  }

  return counts;
}

const getCachedExerciseCounts = unstable_cache(
  loadApprovedExerciseCountsByModuleSlug,
  ["learning-exercise-counts"],
  {
    tags: [CACHE_TAG],
    revalidate: 3600,
  },
);

export async function countApprovedExercisesByModuleSlug(): Promise<
  Readonly<Record<string, number>>
> {
  return getCachedExerciseCounts();
}
