import { describe, expect, it } from "vitest";

import { EXERCISE_TYPE_IDS, type ExerciseTypeId } from "@/types";

import { exerciseDefinitionSchema } from "./exerciseSchema";

const baseExercise = {
  schemaVersion: 1,
  id: "ff6e1af5-4e47-49bf-8897-77bcc143efad",
  logicalId: "sample-exercise",
  moduleSlug: "sample-module",
  topicIds: ["d8b1e1e2-97d8-4413-a890-730f85b32b51"],
  difficulty: "easy",
  prompt: { ko: "알맞은 답을 고르세요.", ru: "Выберите правильный ответ." },
  explanation: { ko: null, ru: "Это пример объяснения." },
  contentVersion: "1.0.0",
  scoring: { points: 1, partialCredit: false },
} as const;

const acceptedAnswers = [
  { id: "canonical", value: "안녕하세요", isCanonical: true },
  { id: "variant", value: "안녕하십니까", isCanonical: false },
] as const;

const options = [
  { id: "option-one", label: { ko: null, ru: "Здравствуйте" } },
  { id: "option-two", label: { ko: null, ru: "До свидания" } },
] as const;

const pairs = [
  {
    id: "pair-one",
    left: { ko: "집", ru: null },
    right: { ko: null, ru: "дом" },
  },
  {
    id: "pair-two",
    left: { ko: "학교", ru: null },
    right: { ko: null, ru: "школа" },
  },
] as const;

const freeResponseExercise = {
  ...baseExercise,
  type: "free-response",
  answerLanguage: "ko",
  acceptedAnswers,
} as const;

const meaningChoiceExercise = {
  ...baseExercise,
  type: "meaning-choice",
  options,
  correctOptionId: "option-one",
} as const;

const honorificChoiceExercise = {
  ...baseExercise,
  type: "honorific-choice",
  options,
  correctOptionId: "option-one",
} as const;

const plainChoiceExercise = {
  ...baseExercise,
  type: "plain-choice",
  options,
  correctOptionId: "option-two",
} as const;

const matchingTranslationExercise = {
  ...baseExercise,
  type: "matching-translation",
  pairs,
  scoring: { points: 2, partialCredit: true },
} as const;

const matchingHonorificExercise = {
  ...baseExercise,
  type: "matching-honorific",
  pairs,
  scoring: { points: 2, partialCredit: true },
} as const;

const fillBlankExercise = {
  ...baseExercise,
  type: "fill-blank",
  template: "저는 {{name}}입니다.",
  templateLanguage: "ko",
  blanks: [{ id: "name", acceptedAnswers }],
} as const;

const exercisesByType: Record<ExerciseTypeId, unknown> = {
  "free-response": freeResponseExercise,
  "meaning-choice": meaningChoiceExercise,
  "honorific-choice": honorificChoiceExercise,
  "plain-choice": plainChoiceExercise,
  "matching-translation": matchingTranslationExercise,
  "matching-honorific": matchingHonorificExercise,
  "fill-blank": fillBlankExercise,
};

describe("exerciseDefinitionSchema", () => {
  it.each(EXERCISE_TYPE_IDS)("accepts the %s subtype", (type) => {
    expect(exerciseDefinitionSchema.parse(exercisesByType[type])).toMatchObject({ type });
  });

  it("rejects duplicate choice options", () => {
    const result = exerciseDefinitionSchema.safeParse({
      ...meaningChoiceExercise,
      options: [options[0], { ...options[1], label: options[0].label }],
    });

    expect(result.success).toBe(false);
  });

  it("rejects a correct option reference that does not exist", () => {
    const result = exerciseDefinitionSchema.safeParse({
      ...meaningChoiceExercise,
      correctOptionId: "missing-option",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an empty accepted answer list", () => {
    const result = exerciseDefinitionSchema.safeParse({
      ...freeResponseExercise,
      acceptedAnswers: [],
    });

    expect(result.success).toBe(false);
  });

  it("requires exactly one canonical accepted answer", () => {
    const result = exerciseDefinitionSchema.safeParse({
      ...freeResponseExercise,
      acceptedAnswers: acceptedAnswers.map((answer) => ({ ...answer, isCanonical: false })),
    });

    expect(result.success).toBe(false);
  });

  it("rejects ambiguous matching pairs", () => {
    const result = exerciseDefinitionSchema.safeParse({
      ...matchingTranslationExercise,
      pairs: [pairs[0], { ...pairs[1], right: pairs[0].right }],
    });

    expect(result.success).toBe(false);
  });

  it("rejects fill blanks without a matching template marker", () => {
    const result = exerciseDefinitionSchema.safeParse({
      ...fillBlankExercise,
      template: "저는 학생입니다.",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an unknown exercise type", () => {
    const result = exerciseDefinitionSchema.safeParse({
      ...baseExercise,
      type: "audio-response",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an unknown schema version", () => {
    const result = exerciseDefinitionSchema.safeParse({
      ...freeResponseExercise,
      schemaVersion: 2,
    });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid content version", () => {
    const result = exerciseDefinitionSchema.safeParse({
      ...freeResponseExercise,
      contentVersion: "latest",
    });

    expect(result.success).toBe(false);
  });
});
