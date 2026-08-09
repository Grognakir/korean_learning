import { z } from "zod";

import { parseExerciseDefinition } from "@/lib/validation";
import type { Tables } from "@/types/database";
import type { ContentVersion, ExerciseTypeId } from "@/types";

import {
  EXERCISE_SCHEMA_VERSION,
  type AcceptedAnswer,
  type Exercise,
  type ExerciseDifficulty,
  type ExerciseOption,
  type ExerciseText,
  type MatchingPair,
} from "../../domain";

type ExerciseRow = Tables<"exercises">;
type ExerciseOptionRow = Tables<"exercise_options">;
type AcceptedAnswerRow = Tables<"accepted_answers">;
type ExerciseTopicRow = Tables<"exercise_topics">;

export class ExerciseMapperError extends Error {
  readonly code = "EXERCISE_MAPPER_ERROR" as const;
  readonly exerciseId: string;

  constructor(exerciseId: string, message: string) {
    super(message);
    this.name = "ExerciseMapperError";
    this.exerciseId = exerciseId;
  }
}

const contentVersionSchema = z.custom<ContentVersion>(
  (value) => typeof value === "string" && /^\d+\.\d+\.\d+$/.test(value),
);

const exerciseDifficultySchema = z.enum(["easy", "medium", "hard"]);
const exerciseTypeSchema = z.enum([
  "free-response",
  "meaning-choice",
  "honorific-choice",
  "plain-choice",
  "matching-translation",
  "matching-honorific",
  "fill-blank",
]);

const matchingPairPayloadSchema = z.object({
  id: z.string().trim().min(1),
  left: z.object({
    ko: z.string().nullable(),
    ru: z.string().nullable(),
  }),
  right: z.object({
    ko: z.string().nullable(),
    ru: z.string().nullable(),
  }),
});

const fillBlankPayloadSchema = z.object({
  template: z.string().trim().min(1),
  templateLanguage: z.enum(["ko", "ru"]),
  blanks: z.array(
    z.object({
      id: z.string().trim().min(1),
      acceptedAnswerIds: z.array(z.string()).optional(),
    }),
  ),
});

const choicePayloadSchema = z.object({
  optionIds: z.array(z.string()).optional(),
  correctOptionId: z.string().optional(),
});

const freeResponsePayloadSchema = z.object({
  answerLanguage: z.enum(["ko", "ru"]),
});

const matchingPayloadSchema = z.object({
  pairs: z.array(matchingPairPayloadSchema).min(2),
});

function toExerciseText(ko: string | null, ru: string | null): ExerciseText {
  if (!ko && !ru) {
    throw new Error("Exercise text requires ko or ru value.");
  }

  return {
    ko: ko?.trim() ? ko : null,
    ru: ru?.trim() ? ru : null,
  };
}

function mapAcceptedAnswerRows(rows: readonly AcceptedAnswerRow[]): AcceptedAnswer[] {
  return rows
    .filter((row) => row.review_status === "approved")
    .map((row, index) => ({
      id: row.is_canonical ? "canonical" : `variant-${index + 1}`,
      value: row.raw_value,
      isCanonical: row.is_canonical,
    }));
}

function mapOptionRows(rows: readonly ExerciseOptionRow[]): ExerciseOption[] {
  return [...rows]
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((row) => ({
      id: row.option_key,
      label: toExerciseText(row.label_ko, row.label_ru),
    }));
}

function resolveTopicIds(
  exerciseId: string,
  topicRows: readonly ExerciseTopicRow[],
  primaryTopicId: string | null,
): readonly string[] {
  const linked = topicRows
    .filter((row) => row.exercise_id === exerciseId)
    .sort((left, right) => {
      if (left.role === "primary") {
        return -1;
      }

      if (right.role === "primary") {
        return 1;
      }

      return 0;
    })
    .map((row) => row.topic_id);

  if (linked.length === 0) {
    return primaryTopicId ? [primaryTopicId] : [];
  }

  return linked;
}

function distributeBlankAcceptedAnswers(
  blanks: readonly { readonly id: string; readonly acceptedAnswerIds?: readonly string[] }[],
  acceptedAnswers: readonly AcceptedAnswer[],
): readonly { readonly id: string; readonly acceptedAnswers: readonly AcceptedAnswer[] }[] {
  if (blanks.length === 1) {
    return [
      {
        id: blanks[0]!.id,
        acceptedAnswers,
      },
    ];
  }

  return blanks.map((blank, index) => ({
    id: blank.id,
    acceptedAnswers: acceptedAnswers.filter((_, answerIndex) => answerIndex === index),
  }));
}

export type MapExerciseRowInput = {
  readonly row: ExerciseRow;
  readonly moduleSlug: string;
  readonly topicRows: readonly ExerciseTopicRow[];
  readonly optionRows: readonly ExerciseOptionRow[];
  readonly acceptedAnswerRows: readonly AcceptedAnswerRow[];
};

export function mapExerciseRow(input: MapExerciseRowInput): Exercise {
  const { row, moduleSlug, topicRows, optionRows, acceptedAnswerRows } = input;
  const exerciseId = row.id;

  try {
    const type = exerciseTypeSchema.parse(row.type) as ExerciseTypeId;
    const difficulty = exerciseDifficultySchema.parse(row.difficulty) as ExerciseDifficulty;
    const contentVersion = contentVersionSchema.parse(row.content_version);
    const topicIds = resolveTopicIds(exerciseId, topicRows, row.primary_topic_id);
    const prompt = toExerciseText(row.prompt_ko, row.prompt_ru);
    const explanation = { ko: null, ru: row.explanation_ru };
    const acceptedAnswers = mapAcceptedAnswerRows(
      acceptedAnswerRows.filter((answer) => answer.exercise_id === exerciseId),
    );
    const options = mapOptionRows(optionRows.filter((option) => option.exercise_id === exerciseId));
    const payload = row.payload ?? {};

    const base = {
      schemaVersion: EXERCISE_SCHEMA_VERSION,
      id: exerciseId,
      logicalId: row.logical_id,
      moduleSlug,
      topicIds,
      difficulty,
      prompt,
      explanation,
      contentVersion,
      scoring: { points: 1, partialCredit: false },
    };

    switch (type) {
      case "free-response": {
        const parsedPayload = freeResponsePayloadSchema.parse(payload);
        return parseExerciseDefinition({
          ...base,
          type,
          answerLanguage: parsedPayload.answerLanguage,
          acceptedAnswers,
        });
      }
      case "meaning-choice":
      case "honorific-choice":
      case "plain-choice": {
        choicePayloadSchema.parse(payload);
        const correctOption =
          optionRows.find((option) => option.exercise_id === exerciseId && option.is_correct) ??
          null;

        if (!correctOption) {
          throw new ExerciseMapperError(exerciseId, "Choice exercise is missing a correct option.");
        }

        return parseExerciseDefinition({
          ...base,
          type,
          options,
          correctOptionId: correctOption.option_key,
        });
      }
      case "matching-translation":
      case "matching-honorific": {
        const parsedPayload = matchingPayloadSchema.parse(payload);
        const pairs: MatchingPair[] = parsedPayload.pairs.map((pair) => ({
          id: pair.id,
          left: toExerciseText(pair.left.ko, pair.left.ru),
          right: toExerciseText(pair.right.ko, pair.right.ru),
        }));

        return parseExerciseDefinition({
          ...base,
          type,
          pairs,
        });
      }
      case "fill-blank": {
        const parsedPayload = fillBlankPayloadSchema.parse(payload);
        const blanks = distributeBlankAcceptedAnswers(
          parsedPayload.blanks as readonly {
            readonly id: string;
            readonly acceptedAnswerIds?: readonly string[];
          }[],
          acceptedAnswers,
        );

        return parseExerciseDefinition({
          ...base,
          type,
          template: parsedPayload.template,
          templateLanguage: parsedPayload.templateLanguage,
          blanks,
        });
      }
    }
  } catch (error) {
    if (error instanceof ExerciseMapperError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : "Unknown mapper failure.";
    throw new ExerciseMapperError(exerciseId, message);
  }
}

export function sortExerciseRows<T extends { readonly logical_id: string }>(
  rows: readonly T[],
): readonly T[] {
  return [...rows].sort((left, right) => left.logical_id.localeCompare(right.logical_id));
}
