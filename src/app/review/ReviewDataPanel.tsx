import { ServiceUnavailableState } from "@/components/feedback";
import { getServerAuthUser } from "@/features/authentication/server/getServerAuthUser";
import {
  ReviewEmptyState,
  ReviewGuestEmptyState,
} from "@/features/review/components/ReviewEmptyState";
import { ReviewQueueSummary } from "@/features/review/components/ReviewQueueSummary";
import { ReviewRepositoryError } from "@/features/review/data/reviewMapper";
import { createSupabaseReviewRepository } from "@/features/review/data/SupabaseReviewRepository";
import type { ReviewQueueSummary as ReviewQueueSummaryData } from "@/features/review/domain";
import { createServerSupabaseClient } from "@/lib/supabase/serverClient";
import { getCachedPublishedModules } from "@/modules/cachedLearningContent";

async function loadReviewSummary(userId: string): Promise<ReviewQueueSummaryData> {
  const client = await createServerSupabaseClient();
  const repository = createSupabaseReviewRepository(client);
  return repository.getSummaryForUser(userId);
}

export async function ReviewDataPanel() {
  const user = await getServerAuthUser();

  if (!user) {
    return <ReviewGuestEmptyState />;
  }

  let summary: ReviewQueueSummaryData;

  try {
    summary = await loadReviewSummary(user.id);
  } catch (error) {
    if (error instanceof ReviewRepositoryError) {
      return <ServiceUnavailableState />;
    }

    throw error;
  }

  const modulesResult = await getCachedPublishedModules();
  const publishedModules = modulesResult.status === "ready" ? modulesResult.data : [];
  const unitOptions = publishedModules.map((module) => ({
    moduleId: module.id,
    unitSlug: module.slug,
    label: module.title.ru,
  }));

  return summary.dueCount > 0 ||
    summary.scheduledCount > 0 ||
    summary.masteredCount > 0 ||
    summary.suspendedCount > 0 ? (
    <ReviewQueueSummary summary={summary} unitOptions={unitOptions} />
  ) : (
    <ReviewEmptyState />
  );
}
