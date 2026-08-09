import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getModuleContent } from "@/modules";
import type { Database } from "@/types/database";

import type { ProgressRepository } from "./ProgressRepository";
import { buildModuleProgressSnapshot, ProgressRepositoryError } from "./progressMapper";
import type { LearningSkillId } from "../domain/progress";

export function createSupabaseProgressRepository(
  client: SupabaseClient<Database>,
): ProgressRepository {
  return {
    async getOverviewForUser(userId) {
      const { moduleRepository } = await getModuleContent();
      const publishedModules = await moduleRepository.getPublished();

      const [
        { data: moduleRows, error: moduleProgressError },
        { data: topicRows, error: topicProgressError },
        { data: skillRows, error: skillProgressError },
      ] = await Promise.all([
        client.from("user_module_progress").select("*").eq("user_id", userId),
        client.from("user_topic_progress").select("*").eq("user_id", userId),
        client.from("user_skill_progress").select("*").eq("user_id", userId),
      ]);

      if (moduleProgressError || topicProgressError || skillProgressError) {
        throw new ProgressRepositoryError(
          moduleProgressError?.message ??
            topicProgressError?.message ??
            skillProgressError?.message ??
            "Failed to load learning progress.",
        );
      }

      const moduleRowsByModuleId = Object.fromEntries(
        (moduleRows ?? []).map((row) => [row.module_id, row]),
      );

      const topicRowsByTopicId = Object.fromEntries(
        (topicRows ?? []).map((row) => [row.topic_id, row]),
      );

      const skillRowsByModuleId = new Map<
        string,
        Partial<
          Record<
            LearningSkillId,
            {
              readonly attempts: number;
              readonly correct: number;
              readonly accuracy: number;
              readonly mastery: string;
              readonly last_practiced_at: string | null;
            }
          >
        >
      >();

      for (const row of skillRows ?? []) {
        const current = skillRowsByModuleId.get(row.module_id) ?? {};
        current[row.learning_skill] = {
          attempts: row.attempts,
          correct: row.correct,
          accuracy: row.accuracy,
          mastery: row.mastery,
          last_practiced_at: row.last_practiced_at,
        };
        skillRowsByModuleId.set(row.module_id, current);
      }

      const modules = publishedModules.map((module) => {
        const skillRowsBySkill = skillRowsByModuleId.get(module.id);
        return buildModuleProgressSnapshot({
          module,
          ...(moduleRowsByModuleId[module.id]
            ? { moduleRow: moduleRowsByModuleId[module.id] }
            : {}),
          topicRowsByTopicId,
          ...(skillRowsBySkill ? { skillRowsBySkill } : {}),
        });
      });

      return { modules };
    },
  };
}
