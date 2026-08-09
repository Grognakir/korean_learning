import type { Metadata } from "next";

import { ServiceUnavailableState } from "@/components/feedback";
import { PageHeader } from "@/components/layout";
import { getServerAuthUser } from "@/features/authentication/server/getServerAuthUser";
import { createSupabaseProgressRepository } from "@/features/progress/data/SupabaseProgressRepository";
import { ProgressRepositoryError } from "@/features/progress/data/progressMapper";
import { hasAnyRecordedProgress } from "@/features/progress/domain";
import type { LearningProgressOverview } from "@/features/progress/domain";
import { ProgressEmptyState, ProgressGuestEmptyState } from "@/features/progress/components/ProgressEmptyState";
import { ProgressOverview } from "@/features/progress/components/ProgressOverview";
import { createServerSupabaseClient } from "@/lib/supabase/serverClient";
import { PageContainer } from "@/wrappers";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Прогресс",
  description: "Статистика освоенных тем после завершения облачных тренировок.",
};

async function loadProgressOverview(userId: string): Promise<LearningProgressOverview> {
  const client = await createServerSupabaseClient();
  const repository = createSupabaseProgressRepository(client);
  return repository.getOverviewForUser(userId);
}

export default async function ProgressPage() {
  const user = await getServerAuthUser();

  if (!user) {
    return (
      <PageContainer className={styles.page}>
        <PageHeader
          description="После входа здесь появится прогресс по модулям и темам из завершённых облачных сессий."
          title="Прогресс"
        />
        <ProgressGuestEmptyState />
      </PageContainer>
    );
  }

  let overview: LearningProgressOverview | undefined;
  let unavailable = false;

  try {
    overview = await loadProgressOverview(user.id);
  } catch (error) {
    if (error instanceof ProgressRepositoryError) {
      unavailable = true;
    } else {
      throw error;
    }
  }

  if (unavailable || !overview) {
    return (
      <PageContainer className={styles.page}>
        <PageHeader description="Не удалось загрузить прогресс." title="Прогресс" />
        <ServiceUnavailableState />
      </PageContainer>
    );
  }

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        description="Статус по модулям и темам считается только из завершённых облачных тренировок."
        title="Прогресс"
      />
      {hasAnyRecordedProgress(overview) ? (
        <ProgressOverview overview={overview} />
      ) : (
        <ProgressEmptyState />
      )}
    </PageContainer>
  );
}
