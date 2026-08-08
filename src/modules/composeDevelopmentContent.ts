import { LocalExerciseRepository, ModuleRegistry, type Exercise } from "@/features/training";
import type { LearningModuleDefinition } from "@/types";

import type { LearningContentComposition } from "./composeProductionContent";
import { honorificsPreviewExercises, honorificsPreviewModule } from "./honorifics";
import { sampleExercises, sampleModule } from "./sample";

/** Development-only composition: sample module plus draft honorifics preview. */
export function composeDevelopmentContent(): LearningContentComposition {
  const modules: LearningModuleDefinition[] = [sampleModule, honorificsPreviewModule];
  const exercises: Exercise[] = [...sampleExercises, ...honorificsPreviewExercises];
  const learningModuleRegistry = new ModuleRegistry(modules);
  const exerciseRepository = new LocalExerciseRepository(exercises, learningModuleRegistry);

  return {
    learningModuleRegistry,
    exerciseRepository,
    modules,
    exercises,
  };
}
