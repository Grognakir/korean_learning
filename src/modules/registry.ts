import { LocalExerciseRepository, ModuleRegistry } from "@/features/training";

import { sampleExercises, sampleModule } from "./sample";

export const learningModuleRegistry = new ModuleRegistry([sampleModule]);
export const exerciseRepository = new LocalExerciseRepository(
  sampleExercises,
  learningModuleRegistry,
);
