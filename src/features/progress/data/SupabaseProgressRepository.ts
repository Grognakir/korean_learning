import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getLearningContent } from "@/modules";
import type { Database } from "@/types/database";

import type { ProgressRepository } from "./ProgressRepository";
import { buildModuleProgressSnapshot, ProgressRepositoryError } from "./progressMapper";

export function createSupabaseProgressRepository(
  client: SupabaseClient<Database>,
): ProgressRepository {
  return {
    async getOverviewForUser(userId) {
      const { moduleRepository } = await getLearningContent();
      const publishedModules = await moduleRepository.getPublished();

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

      const moduleRowsByModuleId = Object.fromEntries(
        (moduleRows ?? []).map((row) => [row.module_id, row]),
      );

      const topicRowsByTopicId = Object.fromEntries(
        (topicRows ?? []).map((row) => [row.topic_id, row]),
      );

      const modules = publishedModules.map((module) =>
        buildModuleProgressSnapshot({
          module,
          ...(moduleRowsByModuleId[module.id]
            ? { moduleRow: moduleRowsByModuleId[module.id] }
            : {}),
          topicRowsByTopicId,
        }),
      );

      return { modules };
    },
  };
}
