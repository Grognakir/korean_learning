import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";
import type { LearningModuleDefinition, LearningTopicDefinition } from "@/types";

import {
  computeAccuracy,
  computeModuleMasteryStatus,
  computeTopicMasteryStatus,
  type LearningProgressOverview,
  type MasteryStatus,
  type ModuleProgressSnapshot,
  type TopicProgressSnapshot,
} from "../domain/progress";
import type { ProgressRepository } from "./ProgressRepository";

export class ProgressRepositoryError extends Error {
  readonly code = "PROGRESS_REPOSITORY_ERROR" as const;

  constructor(message: string) {
    super(message);
    this.name = "ProgressRepositoryError";
  }
}

function mapMasteryStatus(value: string): MasteryStatus {
  if (value === "not_started" || value === "learning" || value === "practiced") {
    return value;
  }

  throw new ProgressRepositoryError(`Unsupported mastery status: ${value}`);
}

export function buildModuleProgressSnapshot(input: {
  readonly module: LearningModuleDefinition;
  readonly moduleRow?: {
    readonly attempts_count: number;
    readonly correct_count: number;
    readonly accuracy: number;
    readonly completed_sessions: number;
    readonly mastery_status: string;
    readonly last_practiced_at: string | null;
  };
  readonly topicRowsByTopicId: Readonly<
    Record<
      string,
      {
        readonly attempts_count: number;
        readonly correct_count: number;
        readonly accuracy: number;
        readonly mastery_status: string;
        readonly last_practiced_at: string | null;
      }
    >
  >;
}): ModuleProgressSnapshot {
  const publishedTopics = input.module.topics.filter((topic) => topic.status === "published");

  const topics: TopicProgressSnapshot[] = publishedTopics.map((topic) =>
    mapTopicProgress(topic, input.topicRowsByTopicId[topic.id]),
  );

  const practicedTopicCount = topics.filter((topic) => topic.masteryStatus === "practiced").length;
  const moduleAttemptsCount = input.moduleRow?.attempts_count ?? 0;
  const moduleCorrectCount = input.moduleRow?.correct_count ?? 0;

  return {
    moduleId: input.module.id,
    moduleSlug: input.module.slug,
    titleRu: input.module.title.ru,
    titleKo: input.module.title.ko,
    level: input.module.level,
    attemptsCount: moduleAttemptsCount,
    correctCount: moduleCorrectCount,
    accuracy: input.moduleRow?.accuracy ?? computeAccuracy(moduleCorrectCount, moduleAttemptsCount),
    completedSessions: input.moduleRow?.completed_sessions ?? 0,
    masteryStatus: input.moduleRow
      ? mapMasteryStatus(input.moduleRow.mastery_status)
      : computeModuleMasteryStatus({
          moduleAttemptsCount,
          publishedTopicCount: publishedTopics.length,
          practicedTopicCount,
        }),
    lastPracticedAt: input.moduleRow?.last_practiced_at ?? null,
    topics,
  };
}

function mapTopicProgress(
  topic: LearningTopicDefinition,
  row?: {
    readonly attempts_count: number;
    readonly correct_count: number;
    readonly accuracy: number;
    readonly mastery_status: string;
    readonly last_practiced_at: string | null;
  },
): TopicProgressSnapshot {
  const attemptsCount = row?.attempts_count ?? 0;
  const correctCount = row?.correct_count ?? 0;

  return {
    topicId: topic.id,
    code: topic.code,
    titleRu: topic.title.ru,
    attemptsCount,
    correctCount,
    accuracy: row?.accuracy ?? computeAccuracy(correctCount, attemptsCount),
    masteryStatus: row
      ? mapMasteryStatus(row.mastery_status)
      : computeTopicMasteryStatus(attemptsCount, correctCount),
    lastPracticedAt: row?.last_practiced_at ?? null,
  };
}

export function createSupabaseProgressRepository(
  client: SupabaseClient<Database>,
): ProgressRepository {
  return {
    async getOverviewForUser(userId) {
      const [
        { data: moduleRows, error: moduleProgressError },
        { data: topicRows, error: topicProgressError },
      ] = await Promise.all([
        client.from("user_module_progress").select("*").eq("user_id", userId),
        client.from("user_topic_progress").select("*").eq("user_id", userId),
      ]);

      if (moduleProgressError || topicProgressError) {
        throw new ProgressRepositoryError(
          moduleProgressError?.message ??
            topicProgressError?.message ??
            "Failed to load learning progress.",
        );
      }

      return {
        moduleRows: moduleRows ?? [],
        topicRows: topicRows ?? [],
      } as unknown as LearningProgressOverview;
    },
  };
}
