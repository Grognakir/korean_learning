import type { Metadata } from "next";
import { Suspense } from "react";

import { CatalogSectionSkeleton } from "@/components/feedback";
import { PageHeader } from "@/components/layout";
import { PageContainer } from "@/wrappers";

import { ProgressDataPanel } from "./ProgressDataPanel";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Прогресс",
  description: "Статистика освоенных тем после завершения сохранённых тренировок.",
};

export default function ProgressPage() {
  return (
    <PageContainer className={styles.page}>
      <PageHeader
        description="Прогресс по темам считается после завершённых тренировок, сохранённых в аккаунте."
        title="Прогресс"
      />
      <Suspense fallback={<CatalogSectionSkeleton label="Загрузка прогресса…" />}>
        <ProgressDataPanel />
      </Suspense>
    </PageContainer>
  );
}
