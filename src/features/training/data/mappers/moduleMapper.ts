import { z } from "zod";

import { parseLearningModuleDefinition } from "@/lib/validation";
import type { Tables } from "@/types/database";
import {
  EXERCISE_TYPE_IDS,
  type ContentVersion,
  type ExerciseTypeId,
  type LearningLevel,
  type LearningModuleDefinition,
  type LearningTopicDefinition,
  type ModuleStatus,
} from "@/types";

type LearningModuleRow = Tables<"learning_modules">;
type GrammarTopicRow = Tables<"grammar_topics">;

const contentVersionSchema = z.custom<ContentVersion>(
  (value) => typeof value === "string" && /^\d+\.\d+\.\d+$/.test(value),
);

const moduleStatusSchema = z.enum(["draft", "reviewed", "published", "archived"]);
const learningLevelSchema = z.enum(["1급", "2급", "3급", "4급", "5급", "6급"]);

const topicRulePayloadSchema = z
  .object({
    titleKo: z.string().trim().min(1).optional(),
    summaryKo: z.string().trim().min(1).optional(),
  })
  .passthrough();

export function normalizeTopicCode(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function mapTopicRow(row: GrammarTopicRow): LearningTopicDefinition {
  const rulePayload = topicRulePayloadSchema.safeParse(row.rule_payload).data ?? {};

  return {
    id: row.id,
    code: normalizeTopicCode(row.code),
    title: {
      ko: rulePayload.titleKo ?? row.title,
      ru: row.title,
    },
    summary: {
      ko: rulePayload.summaryKo ?? row.summary_ru,
      ru: row.summary_ru,
    },
    level: learningLevelSchema.parse(row.level) as LearningLevel,
    status: moduleStatusSchema.parse(row.status) as ModuleStatus,
    contentVersion: contentVersionSchema.parse(row.content_version),
    sortOrder: row.sort_order,
  };
}

export function mapModuleRows(
  moduleRows: readonly LearningModuleRow[],
  topicRows: readonly GrammarTopicRow[],
  supportedExerciseTypesByModuleId: Readonly<Record<string, readonly ExerciseTypeId[]>> = {},
): readonly LearningModuleDefinition[] {
  const topicsByModuleId = new Map<string, GrammarTopicRow[]>();

  for (const topicRow of topicRows) {
    const current = topicsByModuleId.get(topicRow.module_id) ?? [];
    current.push(topicRow);
    topicsByModuleId.set(topicRow.module_id, current);
  }

  const modules = moduleRows.map((moduleRow) => {
    const topics = (topicsByModuleId.get(moduleRow.id) ?? [])
      .sort((left, right) => left.sort_order - right.sort_order)
      .map(mapTopicRow);

    const supportedExerciseTypes = supportedExerciseTypesByModuleId[moduleRow.id] ?? [
      ...EXERCISE_TYPE_IDS,
    ];

    return parseLearningModuleDefinition({
      id: moduleRow.id,
      slug: moduleRow.slug,
      title: {
        ko: moduleRow.title_ko,
        ru: moduleRow.title_ru,
      },
      description: {
        ko: moduleRow.title_ko,
        ru: moduleRow.description_ru,
      },
      level: moduleRow.level,
      status: moduleRow.status,
      contentVersion: moduleRow.content_version,
      sortOrder: moduleRow.sort_order,
      supportedExerciseTypes,
      topics,
    });
  });

  return modules.sort((left, right) => left.sortOrder - right.sortOrder);
}

export function deriveSupportedExerciseTypes(
  exercises: readonly { readonly moduleId: string; readonly type: ExerciseTypeId }[],
): Record<string, ExerciseTypeId[]> {
  const buckets = new Map<string, Set<ExerciseTypeId>>();

  for (const exercise of exercises) {
    const current = buckets.get(exercise.moduleId) ?? new Set<ExerciseTypeId>();
    current.add(exercise.type);
    buckets.set(exercise.moduleId, current);
  }

  return Object.fromEntries(
    [...buckets.entries()].map(([moduleId, types]) => [
      moduleId,
      [...types].sort(
        (left, right) => EXERCISE_TYPE_IDS.indexOf(left) - EXERCISE_TYPE_IDS.indexOf(right),
      ),
    ]),
  );
}
