import { ServiceUnavailableState } from "@/components/feedback";
import { getServerAuthUser } from "@/features/authentication/server/getServerAuthUser";
import { ProgressEmptyState, ProgressGuestEmptyState } from "@/features/progress/components/ProgressEmptyState";
import { ProgressOverview } from "@/features/progress/components/ProgressOverview";
import { createSupabaseProgressRepository } from "@/features/progress/data/SupabaseProgressRepository";
import { ProgressRepositoryError } from "@/features/progress/data/progressMapper";
import type { LearningProgressOverview } from "@/features/progress/domain";
import { hasAnyRecordedProgress } from "@/features/progress/domain";
import { createServerSupabaseClient } from "@/lib/supabase/serverClient";

async function loadProgressOverview(userId: string) {
  const client = await createServerSupabaseClient();
  const repository = createSupabaseProgressRepository(client);
  return repository.getOverviewForUser(userId);
}

export async function ProgressDataPanel() {
  const user = await getServerAuthUser();

  if (!user) {
    return <ProgressGuestEmptyState />;
  }

  let overview: LearningProgressOverview;

  try {
    overview = await loadProgressOverview(user.id);
  } catch (error) {
    if (error instanceof ProgressRepositoryError) {
      return <ServiceUnavailableState />;
    }

    throw error;
  }

  return hasAnyRecordedProgress(overview) ? (
    <ProgressOverview overview={overview} />
  ) : (
    <ProgressEmptyState />
  );
}
