import { z } from "zod";

import {
  EXERCISE_TYPE_IDS,
  LEARNING_LEVELS,
  MODULE_STATUSES,
  type ContentVersion,
  type LearningModuleDefinition,
} from "@/types";

const contentVersionPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const contentVersionSchema = z
  .string()
  .regex(contentVersionPattern, "Версия должна соответствовать формату major.minor.patch")
  .transform((value) => value as ContentVersion);

export const localizedTextSchema = z.strictObject({
  ko: z.string().trim().min(1),
  ru: z.string().trim().min(1),
});

export const learningTopicDefinitionSchema = z.strictObject({
  id: z.uuid(),
  code: z.string().trim().regex(slugPattern),
  title: localizedTextSchema,
  summary: localizedTextSchema,
  level: z.enum(LEARNING_LEVELS),
  status: z.enum(MODULE_STATUSES),
  contentVersion: contentVersionSchema,
  sortOrder: z.number().int().nonnegative(),
});

export const learningModuleDefinitionSchema = z
  .strictObject({
    id: z.uuid(),
    slug: z.string().trim().regex(slugPattern),
    title: localizedTextSchema,
    description: localizedTextSchema,
    level: z.enum(LEARNING_LEVELS),
    status: z.enum(MODULE_STATUSES),
    contentVersion: contentVersionSchema,
    sortOrder: z.number().int().nonnegative(),
    supportedExerciseTypes: z.array(z.enum(EXERCISE_TYPE_IDS)).min(1),
    topics: z.array(learningTopicDefinitionSchema).min(1),
  })
  .superRefine((module, context) => {
    const topicIds = new Set<string>();
    const topicCodes = new Set<string>();
    const exerciseTypes = new Set<string>();

    module.topics.forEach((topic, index) => {
      if (topicIds.has(topic.id)) {
        context.addIssue({
          code: "custom",
          message: "Идентификатор темы должен быть уникальным внутри модуля",
          path: ["topics", index, "id"],
        });
      }

      if (topicCodes.has(topic.code)) {
        context.addIssue({
          code: "custom",
          message: "Код темы должен быть уникальным внутри модуля",
          path: ["topics", index, "code"],
        });
      }

      topicIds.add(topic.id);
      topicCodes.add(topic.code);
    });

    module.supportedExerciseTypes.forEach((type, index) => {
      if (exerciseTypes.has(type)) {
        context.addIssue({
          code: "custom",
          message: "Тип упражнения не должен повторяться",
          path: ["supportedExerciseTypes", index],
        });
      }

      exerciseTypes.add(type);
    });
  });

export function parseLearningModuleDefinition(value: unknown): LearningModuleDefinition {
  return learningModuleDefinitionSchema.parse(value);
}
