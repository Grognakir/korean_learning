import type { Exercise, MeaningChoiceExercise } from "@/features/training";

import { createTestModule } from "./moduleFactory";

const defaults = {
  schemaVersion: 1 as const,
  moduleSlug: createTestModule().slug,
  difficulty: "easy" as const,
  contentVersion: "1.0.0" as const,
  scoring: { points: 1, partialCredit: false },
};

export function createChoiceExercise(
  overrides: Partial<MeaningChoiceExercise> & Pick<MeaningChoiceExercise, "id" | "logicalId">,
): MeaningChoiceExercise {
  const learningModule = createTestModule();

  return {
    ...defaults,
    topicIds: [learningModule.topics[0]!.id],
    type: "meaning-choice",
    prompt: { ko: "집", ru: "Выберите значение." },
    explanation: { ko: null, ru: "집 значит дом." },
    options: [
      { id: "home", label: { ko: null, ru: "дом" } },
      { id: "school", label: { ko: null, ru: "школа" } },
    ],
    correctOptionId: "home",
    ...overrides,
  };
}

export function createExercisePair(): readonly [MeaningChoiceExercise, MeaningChoiceExercise] {
  const learningModule = createTestModule();

  return [
    createChoiceExercise({
      id: "22222222-2222-4222-8222-222222222201",
      logicalId: "integration-home",
      topicIds: [learningModule.topics[0]!.id],
      prompt: { ko: "집", ru: "Выберите значение." },
      correctOptionId: "home",
    }),
    createChoiceExercise({
      id: "22222222-2222-4222-8222-222222222202",
      logicalId: "integration-school",
      topicIds: [learningModule.topics[1]!.id],
      prompt: { ko: "학교", ru: "Выберите значение." },
      options: [
        { id: "home", label: { ko: null, ru: "дом" } },
        { id: "school", label: { ko: null, ru: "школа" } },
      ],
      correctOptionId: "school",
      explanation: { ko: null, ru: "학교 значит школа." },
    }),
  ];
}

export function asExerciseList(exercises: readonly Exercise[]): readonly Exercise[] {
  return exercises;
}
