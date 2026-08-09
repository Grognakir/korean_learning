import type { Exercise } from "@/features/training/domain/exercise";
import { ModuleRegistry } from "@/features/training/domain/ModuleRegistry";
import { LocalModuleRepository } from "@/features/training/data/LocalModuleRepository";
import type { ExerciseRepository } from "@/features/training/data/ExerciseRepository";
import type { ModuleRepository } from "@/features/training/data/ModuleRepository";
import type { LearningModuleDefinition } from "@/types";

import {
  composeProductionContent,
  type LearningContentComposition,
} from "./composeProductionContent";
import { isExplicitLocalContentSource, resolveContentSource } from "./contentSource";

export type { LearningContentComposition } from "./composeProductionContent";

export class LearningContentError extends Error {
  readonly code = "LEARNING_CONTENT_ERROR" as const;

  constructor(message: string) {
    super(message);
    this.name = "LearningContentError";
  }
}

function composeLocalContent(nodeEnv: string): LearningContentComposition {
  void nodeEnv;
  return composeProductionContent();
}

function wrapLocalComposition(composition: LearningContentComposition): LearningContentComposition {
  const learningModuleRegistry = new ModuleRegistry(composition.modules);
  const moduleRepository: ModuleRepository = new LocalModuleRepository(learningModuleRegistry);
  const exerciseRepository: ExerciseRepository = composition.exerciseRepository;

  return {
    ...composition,
    learningModuleRegistry,
    moduleRepository,
    exerciseRepository,
  };
}

async function createSupabaseModuleRepository(): Promise<{
  readonly moduleRepository: ModuleRepository;
  readonly modules: readonly LearningModuleDefinition[];
  readonly learningModuleRegistry: ModuleRegistry;
}> {
  const { SupabaseModuleRepository } =
    await import("@/features/training/data/SupabaseModuleRepository");
  const moduleRepository = new SupabaseModuleRepository();
  const modules = await moduleRepository.getAll();
  const learningModuleRegistry = new ModuleRegistry(modules);

  return {
    moduleRepository,
    modules,
    learningModuleRegistry,
  };
}

async function createSupabaseExerciseRepository(): Promise<{
  readonly exerciseRepository: ExerciseRepository;
  readonly exercises: readonly Exercise[];
}> {
  const { SupabaseExerciseRepository } =
    await import("@/features/training/data/SupabaseExerciseRepository");
  const exerciseRepository = new SupabaseExerciseRepository();
  const exercises = await exerciseRepository.list();

  return {
    exerciseRepository,
    exercises,
  };
}

async function composeSupabaseContent(): Promise<LearningContentComposition> {
  const [moduleContent, exerciseContent] = await Promise.all([
    createSupabaseModuleRepository(),
    createSupabaseExerciseRepository(),
  ]);

  return {
    ...moduleContent,
    ...exerciseContent,
  };
}

let cachedLocalComposition: LearningContentComposition | undefined;
let cachedSupabaseComposition: Promise<LearningContentComposition> | undefined;
let cachedSupabaseModuleContent:
  Promise<Awaited<ReturnType<typeof createSupabaseModuleRepository>>> | undefined;
let cachedSupabaseExerciseContent:
  Promise<Awaited<ReturnType<typeof createSupabaseExerciseRepository>>> | undefined;
let cachedSupabaseExerciseCounts: Promise<Readonly<Record<string, number>>> | undefined;

export function composeLearningContent(
  nodeEnv: string = process.env.NODE_ENV ?? "production",
): LearningContentComposition {
  return wrapLocalComposition(composeLocalContent(nodeEnv));
}

export function getLocalLearningContent(
  nodeEnv: string = process.env.NODE_ENV ?? "production",
): LearningContentComposition {
  if (!cachedLocalComposition) {
    cachedLocalComposition = wrapLocalComposition(composeLocalContent(nodeEnv));

    if (isExplicitLocalContentSource() && process.env.NODE_ENV === "development") {
      console.info("[learning-content] Using explicit local content source.");
    }
  }

  return cachedLocalComposition;
}

function loadLocalModuleContent(nodeEnv: string) {
  const content = getLocalLearningContent(nodeEnv);

  return {
    moduleRepository: content.moduleRepository,
    modules: content.modules,
    learningModuleRegistry: content.learningModuleRegistry,
  };
}

function loadLocalExerciseContent(nodeEnv: string) {
  const content = getLocalLearningContent(nodeEnv);

  return {
    exerciseRepository: content.exerciseRepository,
    exercises: content.exercises,
  };
}

export async function getModuleContent(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): Promise<{
  readonly moduleRepository: ModuleRepository;
  readonly modules: readonly LearningModuleDefinition[];
  readonly learningModuleRegistry: ModuleRegistry;
}> {
  const source = resolveContentSource(env);

  if (source === "local") {
    return loadLocalModuleContent(env.NODE_ENV ?? "production");
  }

  if (!cachedSupabaseModuleContent) {
    cachedSupabaseModuleContent = createSupabaseModuleRepository().catch((error: unknown) => {
      cachedSupabaseModuleContent = undefined;
      const message = error instanceof Error ? error.message : "Unknown Supabase module error.";
      throw new LearningContentError(message);
    });
  }

  return cachedSupabaseModuleContent;
}

export async function getExerciseContent(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): Promise<{
  readonly exerciseRepository: ExerciseRepository;
  readonly exercises: readonly Exercise[];
}> {
  const source = resolveContentSource(env);

  if (source === "local") {
    return loadLocalExerciseContent(env.NODE_ENV ?? "production");
  }

  if (!cachedSupabaseExerciseContent) {
    cachedSupabaseExerciseContent = createSupabaseExerciseRepository().catch((error: unknown) => {
      cachedSupabaseExerciseContent = undefined;
      const message = error instanceof Error ? error.message : "Unknown Supabase exercise error.";
      throw new LearningContentError(message);
    });
  }

  return cachedSupabaseExerciseContent;
}

async function loadSupabaseExerciseCounts(): Promise<Readonly<Record<string, number>>> {
  const { countApprovedExercisesByModuleSlug } =
    await import("@/features/training/data/countApprovedExercisesByModuleSlug");

  return countApprovedExercisesByModuleSlug();
}

export async function getExerciseCountByModuleSlug(
  moduleSlug: string,
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): Promise<number> {
  const source = resolveContentSource(env);

  if (source === "local") {
    const { exerciseRepository } = loadLocalExerciseContent(env.NODE_ENV ?? "production");
    return (await exerciseRepository.list({ moduleSlug })).length;
  }

  if (!cachedSupabaseExerciseCounts) {
    cachedSupabaseExerciseCounts = loadSupabaseExerciseCounts().catch((error: unknown) => {
      cachedSupabaseExerciseCounts = undefined;
      const message =
        error instanceof Error ? error.message : "Unknown Supabase exercise count error.";
      throw new LearningContentError(message);
    });
  }

  const counts = await cachedSupabaseExerciseCounts;
  return counts[moduleSlug] ?? 0;
}

export async function getLearningContent(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): Promise<LearningContentComposition> {
  const source = resolveContentSource(env);

  if (source === "local") {
    return getLocalLearningContent(env.NODE_ENV ?? "production");
  }

  if (!cachedSupabaseComposition) {
    cachedSupabaseComposition = composeSupabaseContent().catch((error: unknown) => {
      cachedSupabaseComposition = undefined;
      const message = error instanceof Error ? error.message : "Unknown Supabase content error.";
      throw new LearningContentError(message);
    });
  }

  return cachedSupabaseComposition;
}

export type LearningContentRepositories = {
  readonly moduleRepository: ModuleRepository;
  readonly exerciseRepository: ExerciseRepository;
  readonly modules: readonly LearningModuleDefinition[];
  readonly exercises: readonly Exercise[];
};

export async function getLearningContentRepositories(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): Promise<LearningContentRepositories> {
  const [moduleContent, exerciseContent] = await Promise.all([
    getModuleContent(env),
    getExerciseContent(env),
  ]);

  return {
    moduleRepository: moduleContent.moduleRepository,
    exerciseRepository: exerciseContent.exerciseRepository,
    modules: moduleContent.modules,
    exercises: exerciseContent.exercises,
  };
}
