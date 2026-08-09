import type { ContentVersion } from "@/types";

import type { Exercise, ExerciseDifficulty } from "../domain";
import { toExerciseView, type ExerciseView, type ToExerciseViewOptions } from "./toExerciseView";

export type PublicExercise = ExerciseView & {
  readonly logicalId: string;
  readonly moduleSlug: string;
  readonly topicIds: readonly string[];
  readonly difficulty: ExerciseDifficulty;
  readonly contentVersion: ContentVersion;
};

export function toPublicExercise(
  exercise: Exercise,
  options: ToExerciseViewOptions = {},
): PublicExercise {
  const view = toExerciseView(exercise, options);

  return {
    ...view,
    logicalId: exercise.logicalId,
    moduleSlug: exercise.moduleSlug,
    topicIds: exercise.topicIds,
    difficulty: exercise.difficulty,
    contentVersion: exercise.contentVersion,
  };
}

export function toPublicExercises(
  exercises: readonly Exercise[],
  options: ToExerciseViewOptions = {},
): readonly PublicExercise[] {
  return exercises.map((exercise) => toPublicExercise(exercise, options));
}

const PUBLIC_EXERCISE_FORBIDDEN_KEYS = [
  "correctOptionId",
  "acceptedAnswers",
  "is_correct",
  "isCorrect",
  "correctAnswer",
] as const;

export function assertPublicExerciseShape(value: unknown): asserts value is PublicExercise {
  const serialized = JSON.stringify(value);

  for (const key of PUBLIC_EXERCISE_FORBIDDEN_KEYS) {
    if (serialized.includes(`"${key}"`)) {
      throw new Error(`Public exercise payload must not include "${key}".`);
    }
  }
}

export function createPublicExerciseLookup(
  exercises: readonly PublicExercise[],
): ReadonlyMap<string, PublicExercise> {
  return new Map(exercises.map((exercise) => [exercise.id, exercise]));
}
