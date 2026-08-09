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

  const { SupabaseModuleRepository } = await import(
    "@/features/training/data/SupabaseModuleRepository"
  );
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

  const { SupabaseModuleRepository } = await import(
    "@/features/training/data/SupabaseModuleRepository"
  );
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
      counts[learningModule.slug] = (await exerciseRepository.list({ moduleSlug: learningModule.slug }))
        .length;
    }

    return counts;
  }

  const { countApprovedExercisesByModuleSlug } = await import(
    "@/features/training/data/countApprovedExercisesByModuleSlug"
  );

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

  const { SupabaseExerciseRepository } = await import(
    "@/features/training/data/SupabaseExerciseRepository"
  );
  const repository = new SupabaseExerciseRepository();

  try {
    return await repository.list({ moduleSlug });
  } catch (error) {
    wrapContentError(error, "exercises");
  }
}

export async function getCachedPublishedModules(): Promise<readonly LearningModuleDefinition[]> {
  "use cache";
  cacheTag("learning-modules");
  cacheLife("learningContent");
  return readPublishedModules();
}

export async function getCachedPublishedModuleBySlug(
  slug: string,
): Promise<LearningModuleDefinition | undefined> {
  "use cache";
  cacheTag("learning-modules", `learning-module:${slug}`);
  cacheLife("learningContent");
  return readModuleBySlug(slug);
}

export async function getCachedExerciseCountsByModuleSlug(): Promise<
  Readonly<Record<string, number>>
> {
  "use cache";
  cacheTag("learning-exercise-counts");
  cacheLife("learningContent");
  return readExerciseCountsByModuleSlug();
}

export async function getCachedExerciseCountByModuleSlug(moduleSlug: string): Promise<number> {
  const counts = await getCachedExerciseCountsByModuleSlug();
  return counts[moduleSlug] ?? 0;
}

export async function getCachedExercisesByModuleSlug(
  moduleSlug: string,
): Promise<readonly Exercise[]> {
  "use cache";
  cacheTag("learning-exercises", `learning-exercises:${moduleSlug}`);
  cacheLife("learningContent");
  return readExercisesByModuleSlug(moduleSlug);
}
