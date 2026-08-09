import { z, type RefinementCtx } from "zod";

import {
  EXERCISE_DIFFICULTIES,
  EXERCISE_SCHEMA_VERSION,
  type AcceptedAnswer,
  type Exercise,
  type ExerciseText,
} from "@/features/training/domain/exercise";

import { contentVersionSchema } from "./learningModuleSchema";

const identifierPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const logicalIdentifierPattern = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;

export const exerciseTextSchema = z
  .strictObject({
    ko: z.string().trim().min(1).nullable(),
    ru: z.string().trim().min(1).nullable(),
  })
  .refine((text) => text.ko !== null || text.ru !== null, {
    message: "Текст должен содержать корейское или русское значение",
  });

export const acceptedAnswerSchema = z.strictObject({
  id: z.string().trim().regex(identifierPattern),
  value: z.string().trim().min(1),
  isCanonical: z.boolean(),
});

export const exerciseOptionSchema = z.strictObject({
  id: z.string().trim().regex(identifierPattern),
  label: exerciseTextSchema,
});

export const matchingPairSchema = z.strictObject({
  id: z.string().trim().regex(identifierPattern),
  left: exerciseTextSchema,
  right: exerciseTextSchema,
});

export const fillBlankDefinitionSchema = z.strictObject({
  id: z.string().trim().regex(identifierPattern),
  acceptedAnswers: z.array(acceptedAnswerSchema).min(1),
});

const scoringSchema = z.strictObject({
  points: z.number().int().positive(),
  partialCredit: z.boolean(),
});

const exerciseBaseShape = {
  schemaVersion: z.literal(EXERCISE_SCHEMA_VERSION),
  id: z.uuid(),
  logicalId: z.string().trim().regex(logicalIdentifierPattern),
  moduleSlug: z.string().trim().regex(identifierPattern),
  topicIds: z.array(z.string().trim().regex(logicalIdentifierPattern)),
  difficulty: z.enum(EXERCISE_DIFFICULTIES),
  prompt: exerciseTextSchema,
  explanation: exerciseTextSchema,
  contentVersion: contentVersionSchema,
  scoring: scoringSchema,
};

const freeResponseExerciseSchema = z.strictObject({
  ...exerciseBaseShape,
  type: z.literal("free-response"),
  answerLanguage: z.enum(["ko", "ru"]),
  acceptedAnswers: z.array(acceptedAnswerSchema).min(1),
});

const meaningChoiceExerciseSchema = z.strictObject({
  ...exerciseBaseShape,
  type: z.literal("meaning-choice"),
  options: z.array(exerciseOptionSchema).min(2),
  correctOptionId: z.string().trim().regex(identifierPattern),
});

const honorificChoiceExerciseSchema = z.strictObject({
  ...exerciseBaseShape,
  type: z.literal("honorific-choice"),
  options: z.array(exerciseOptionSchema).min(2),
  correctOptionId: z.string().trim().regex(identifierPattern),
});

const plainChoiceExerciseSchema = z.strictObject({
  ...exerciseBaseShape,
  type: z.literal("plain-choice"),
  options: z.array(exerciseOptionSchema).min(2),
  correctOptionId: z.string().trim().regex(identifierPattern),
});

const exercisePassageSchema = z.strictObject({
  logicalId: z.string().trim().min(1),
  title: exerciseTextSchema,
  bodyKo: z.string().trim().min(1),
});

const singleChoiceExerciseSchema = z.strictObject({
  ...exerciseBaseShape,
  type: z.literal("single-choice"),
  options: z.array(exerciseOptionSchema).min(2),
  correctOptionId: z.string().trim().regex(identifierPattern),
  passage: exercisePassageSchema.nullable(),
});

const matchingTranslationExerciseSchema = z.strictObject({
  ...exerciseBaseShape,
  type: z.literal("matching-translation"),
  pairs: z.array(matchingPairSchema).min(2),
});

const matchingHonorificExerciseSchema = z.strictObject({
  ...exerciseBaseShape,
  type: z.literal("matching-honorific"),
  pairs: z.array(matchingPairSchema).min(2),
});

const fillBlankExerciseSchema = z.strictObject({
  ...exerciseBaseShape,
  type: z.literal("fill-blank"),
  template: z.string().trim().min(1),
  templateLanguage: z.enum(["ko", "ru"]),
  blanks: z.array(fillBlankDefinitionSchema).min(1),
});

function textKey(text: ExerciseText) {
  return `${text.ko ?? ""}\u0000${text.ru ?? ""}`;
}

function validateAcceptedAnswers(
  answers: readonly AcceptedAnswer[],
  context: RefinementCtx,
  path: readonly (string | number)[],
) {
  const ids = new Set<string>();
  const values = new Set<string>();

  answers.forEach((answer, index) => {
    if (ids.has(answer.id)) {
      context.addIssue({
        code: "custom",
        message: "Идентификатор допустимого ответа должен быть уникальным",
        path: [...path, index, "id"],
      });
    }

    if (values.has(answer.value)) {
      context.addIssue({
        code: "custom",
        message: "Допустимый ответ не должен повторяться",
        path: [...path, index, "value"],
      });
    }

    ids.add(answer.id);
    values.add(answer.value);
  });

  if (answers.filter((answer) => answer.isCanonical).length !== 1) {
    context.addIssue({
      code: "custom",
      message: "Нужен ровно один канонический ответ",
      path: [...path],
    });
  }
}

function validateChoiceExercise(
  exercise: Extract<
    Exercise,
    { type: "meaning-choice" | "honorific-choice" | "plain-choice" | "single-choice" }
  >,
  context: RefinementCtx,
) {
  const ids = new Set<string>();
  const labels = new Set<string>();

  exercise.options.forEach((option, index) => {
    if (ids.has(option.id)) {
      context.addIssue({
        code: "custom",
        message: "Идентификатор варианта должен быть уникальным",
        path: ["options", index, "id"],
      });
    }

    const label = textKey(option.label);

    if (labels.has(label)) {
      context.addIssue({
        code: "custom",
        message: "Текст варианта не должен повторяться",
        path: ["options", index, "label"],
      });
    }

    ids.add(option.id);
    labels.add(label);
  });

  if (!ids.has(exercise.correctOptionId)) {
    context.addIssue({
      code: "custom",
      message: "Правильный вариант должен ссылаться на существующий option id",
      path: ["correctOptionId"],
    });
  }
}

function validateMatchingExercise(
  exercise: Extract<Exercise, { type: "matching-translation" | "matching-honorific" }>,
  context: RefinementCtx,
) {
  const ids = new Set<string>();
  const leftValues = new Set<string>();
  const rightValues = new Set<string>();

  exercise.pairs.forEach((pair, index) => {
    const left = textKey(pair.left);
    const right = textKey(pair.right);

    if (ids.has(pair.id)) {
      context.addIssue({
        code: "custom",
        message: "Идентификатор пары должен быть уникальным",
        path: ["pairs", index, "id"],
      });
    }

    if (leftValues.has(left) || rightValues.has(right)) {
      context.addIssue({
        code: "custom",
        message: "Сопоставление должно оставаться однозначным",
        path: ["pairs", index],
      });
    }

    ids.add(pair.id);
    leftValues.add(left);
    rightValues.add(right);
  });
}

function validateFillBlankExercise(
  exercise: Extract<Exercise, { type: "fill-blank" }>,
  context: RefinementCtx,
) {
  const blankIds = new Set<string>();

  exercise.blanks.forEach((blank, index) => {
    if (blankIds.has(blank.id)) {
      context.addIssue({
        code: "custom",
        message: "Идентификатор пропуска должен быть уникальным",
        path: ["blanks", index, "id"],
      });
    }

    blankIds.add(blank.id);
    validateAcceptedAnswers(blank.acceptedAnswers, context, ["blanks", index, "acceptedAnswers"]);

    const marker = `{{${blank.id}}}`;
    const occurrences = exercise.template.split(marker).length - 1;

    if (occurrences !== 1) {
      context.addIssue({
        code: "custom",
        message: "Каждый пропуск должен встречаться в шаблоне ровно один раз",
        path: ["template"],
      });
    }
  });

  for (const match of exercise.template.matchAll(/\{\{([a-z0-9]+(?:-[a-z0-9]+)*)\}\}/g)) {
    const markerId = match[1];

    if (markerId && !blankIds.has(markerId)) {
      context.addIssue({
        code: "custom",
        message: "Шаблон содержит неизвестный идентификатор пропуска",
        path: ["template"],
      });
    }
  }
}

export const exerciseDefinitionSchema = z
  .discriminatedUnion("type", [
    freeResponseExerciseSchema,
    meaningChoiceExerciseSchema,
    honorificChoiceExerciseSchema,
    plainChoiceExerciseSchema,
    singleChoiceExerciseSchema,
    matchingTranslationExerciseSchema,
    matchingHonorificExerciseSchema,
    fillBlankExerciseSchema,
  ])
  .superRefine((exercise, context) => {
    const topicIds = new Set<string>();

    exercise.topicIds.forEach((topicId, index) => {
      if (topicIds.has(topicId)) {
        context.addIssue({
          code: "custom",
          message: "Тема упражнения не должна повторяться",
          path: ["topicIds", index],
        });
      }

      topicIds.add(topicId);
    });

    switch (exercise.type) {
      case "free-response":
        validateAcceptedAnswers(exercise.acceptedAnswers, context, ["acceptedAnswers"]);
        break;
      case "meaning-choice":
      case "honorific-choice":
      case "plain-choice":
      case "single-choice":
        validateChoiceExercise(exercise, context);
        break;
      case "matching-translation":
      case "matching-honorific":
        validateMatchingExercise(exercise, context);
        break;
      case "fill-blank":
        validateFillBlankExercise(exercise, context);
        break;
    }
  });

export function parseExerciseDefinition(value: unknown): Exercise {
  return exerciseDefinitionSchema.parse(value);
}
