import type { Metadata } from "next";

import { GuestFeatureEmptyState } from "@/components/feedback";
import { PageHeader } from "@/components/layout";
import { PageContainer } from "@/wrappers";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Прогресс",
};

export default function ProgressPage() {
  return (
    <PageContainer className={styles.page}>
      <PageHeader
        description="Статистика регулярности и освоенных тем появится после облачной синхронизации."
        eyebrow="Результаты"
        title="Прогресс"
      />
      <GuestFeatureEmptyState
        description="Пока доступна только локальная тренировка. Облачный прогресс гостя появится после подключения аккаунта."
        title="Прогресс пока недоступен"
      />
    </PageContainer>
  );
}
