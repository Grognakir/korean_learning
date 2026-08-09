import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

import type { ReviewRepository } from "./ReviewRepository";
import { ReviewRepositoryError, buildReviewQueueSummary, mapReviewQueueItem } from "./reviewMapper";

export function createSupabaseReviewRepository(client: SupabaseClient<Database>): ReviewRepository {
  return {
    async listDueItems(_userId, now = new Date().toISOString()) {
      const { data, error } = await client.rpc("sync_review_queue_availability", {
        p_now: now,
      });

      if (error) {
        throw new ReviewRepositoryError(error.message);
      }

      return (data ?? []).map(mapReviewQueueItem);
    },

    async getSummaryForUser(userId, now = new Date().toISOString()) {
      const dueItems = await this.listDueItems(userId, now);

      const { data, error } = await client.from("review_queue").select("*").eq("user_id", userId);

      if (error) {
        throw new ReviewRepositoryError(error.message);
      }

      return buildReviewQueueSummary(data ?? [], dueItems);
    },
  };
}
