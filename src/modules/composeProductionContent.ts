import {
  LocalExerciseRepository,
  LocalModuleRepository,
  ModuleRegistry,
  type Exercise,
  type ExerciseRepository,
  type ModuleRepository,
} from "@/features/training";
import type { LearningModuleDefinition } from "@/types";

import { sampleExercises, sampleModule } from "./sample";

export type LearningContentComposition = {
  readonly learningModuleRegistry: ModuleRegistry;
  readonly moduleRepository: ModuleRepository;
  readonly exerciseRepository: ExerciseRepository;
  readonly modules: readonly LearningModuleDefinition[];
  readonly exercises: readonly Exercise[];
};

/** Published/local baseline used by production builds and non-development runtimes. */
export function composeProductionContent(): LearningContentComposition {
  const modules: LearningModuleDefinition[] = [sampleModule];
  const exercises: Exercise[] = [...sampleExercises];
  const learningModuleRegistry = new ModuleRegistry(modules);
  const exerciseRepository = new LocalExerciseRepository(exercises, learningModuleRegistry);

  return {
    learningModuleRegistry,
    moduleRepository: new LocalModuleRepository(learningModuleRegistry),
    exerciseRepository,
    modules,
    exercises,
  };
}
