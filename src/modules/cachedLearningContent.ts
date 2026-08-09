import { cacheLife, cacheTag } from "next/cache";

import type { Exercise } from "@/features/training/domain";
import type { LearningModuleDefinition } from "@/types";

import { resolveContentSource } from "./contentSource";
import { getLocalLearningContent, LearningContentError } from "./resolveLearningContent";

function wrapContentError(error: unknown, context: string): never {
  const message = error instanceof Error ? error.message : `Unknown ${context} error.`;
  throw new LearningContentError(message);
}

async function readPublishedModules(): Promise<readonly LearningModuleDefinition[]> {
  if (resolveContentSource() === "local") {
    const { moduleRepository } = getLocalLearningContent();
    return moduleRepository.getPublished();
  }

  const { SupabaseModuleRepository } =
    await import("@/features/training/data/SupabaseModuleRepository");
  const repository = new SupabaseModuleRepository();

  try {
    return await repository.getPublished();
  } catch (error) {
    wrapContentError(error, "module catalog");
  }
}

async function readModuleBySlug(slug: string): Promise<LearningModuleDefinition | undefined> {
  if (resolveContentSource() === "local") {
    const { moduleRepository } = getLocalLearningContent();
    return moduleRepository.getPublishedBySlug(slug);
  }

  const { SupabaseModuleRepository } =
    await import("@/features/training/data/SupabaseModuleRepository");
  const repository = new SupabaseModuleRepository();

  try {
    return await repository.getPublishedBySlug(slug);
  } catch (error) {
    wrapContentError(error, "module");
  }
}

async function readExerciseCountsByModuleSlug(): Promise<Readonly<Record<string, number>>> {
  if (resolveContentSource() === "local") {
    const { exerciseRepository, modules } = getLocalLearningContent();
    const counts: Record<string, number> = {};

    for (const learningModule of modules) {
      counts[learningModule.slug] = (
        await exerciseRepository.list({ moduleSlug: learningModule.slug })
      ).length;
    }

    return counts;
  }

  const { countApprovedExercisesByModuleSlug } =
    await import("@/features/training/data/countApprovedExercisesByModuleSlug");

  try {
    return await countApprovedExercisesByModuleSlug();
  } catch (error) {
    wrapContentError(error, "exercise counts");
  }
}

async function readExercisesByModuleSlug(moduleSlug: string): Promise<readonly Exercise[]> {
  if (resolveContentSource() === "local") {
    const { exerciseRepository } = getLocalLearningContent();
    return exerciseRepository.list({ moduleSlug });
  }

  const { SupabaseExerciseRepository } =
    await import("@/features/training/data/SupabaseExerciseRepository");
  const repository = new SupabaseExerciseRepository();

  try {
    return await repository.list({ moduleSlug });
  } catch (error) {
    wrapContentError(error, "exercises");
  }
}

/**
 * An error thrown inside a `"use cache"` scope aborts prerendering and fails the build even when
 * the consuming component catches it, so a store failure must never cross that boundary. Cached
 * loaders report it as a value instead and keep it on a short `cacheLife`, so a recovered store is
 * picked up without a redeploy.
 */
export type ContentResult<T> =
  { readonly status: "ready"; readonly data: T } | { readonly status: "unavailable" };

async function readContent<T>(read: () => Promise<T>): Promise<ContentResult<T>> {
  try {
    return { status: "ready", data: await read() };
  } catch (error) {
    if (error instanceof LearningContentError) {
      // Reporting the outage as a value hides it from every log, so the cause is recorded here.
      console.error(`Learning content unavailable: ${error.message}`);

      return { status: "unavailable" };
    }

    throw error;
  }
}

function cacheLifeFor(status: ContentResult<unknown>["status"]): void {
  if (status === "ready") {
    cacheLife("learningContent");
    return;
  }

  cacheLife("learningContentUnavailable");
}

export async function getCachedPublishedModules(): Promise<
  ContentResult<readonly LearningModuleDefinition[]>
> {
  "use cache";
  cacheTag("learning-modules");

  const result = await readContent(readPublishedModules);
  cacheLifeFor(result.status);

  return result;
}

export async function getCachedPublishedModuleBySlug(
  slug: string,
): Promise<ContentResult<LearningModuleDefinition | undefined>> {
  "use cache";
  cacheTag("learning-modules", `learning-module:${slug}`);

  const result = await readContent(() => readModuleBySlug(slug));
  cacheLifeFor(result.status);

  return result;
}

export async function getCachedExerciseCountsByModuleSlug(): Promise<
  ContentResult<Readonly<Record<string, number>>>
> {
  "use cache";
  cacheTag("learning-exercise-counts");

  const result = await readContent(readExerciseCountsByModuleSlug);
  cacheLifeFor(result.status);

  return result;
}

export async function getCachedExerciseCountByModuleSlug(
  moduleSlug: string,
): Promise<ContentResult<number>> {
  const counts = await getCachedExerciseCountsByModuleSlug();

  if (counts.status === "unavailable") {
    return counts;
  }

  return { status: "ready", data: counts.data[moduleSlug] ?? 0 };
}

export async function getCachedExercisesByModuleSlug(
  moduleSlug: string,
): Promise<ContentResult<readonly Exercise[]>> {
  "use cache";
  cacheTag("learning-exercises", `learning-exercises:${moduleSlug}`);

  const result = await readContent(() => readExercisesByModuleSlug(moduleSlug));
  cacheLifeFor(result.status);

  return result;
}
