import type { Exercise, ExerciseRepository } from "@/features/training";
import { LocalModuleRepository, ModuleRegistry, type ModuleRepository } from "@/features/training";
import type { LearningModuleDefinition } from "@/types";

import { composeDevelopmentContent } from "./composeDevelopmentContent";
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
  if (nodeEnv === "development") {
    return composeDevelopmentContent();
  }

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

async function composeSupabaseContent(): Promise<LearningContentComposition> {
  const [{ SupabaseModuleRepository }, { SupabaseExerciseRepository }] = await Promise.all([
    import("@/features/training/data/SupabaseModuleRepository"),
    import("@/features/training/data/SupabaseExerciseRepository"),
  ]);

  const moduleRepository = new SupabaseModuleRepository();
  const exerciseRepository = new SupabaseExerciseRepository();
  const modules = await moduleRepository.getAll();
  const exercises = await exerciseRepository.list();
  const learningModuleRegistry = new ModuleRegistry(modules);

  return {
    learningModuleRegistry,
    moduleRepository,
    exerciseRepository,
    modules,
    exercises,
  };
}

let cachedLocalComposition: LearningContentComposition | undefined;
let cachedSupabaseComposition: Promise<LearningContentComposition> | undefined;

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
  const content = await getLearningContent(env);

  return {
    moduleRepository: content.moduleRepository,
    exerciseRepository: content.exerciseRepository,
    modules: content.modules,
    exercises: content.exercises,
  };
}
