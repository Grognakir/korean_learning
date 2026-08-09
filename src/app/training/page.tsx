import type { Metadata } from "next";
import { Suspense } from "react";

import { CatalogSectionSkeleton } from "@/components/feedback";
import { PageHeader } from "@/components/layout";
import { PageContainer } from "@/wrappers";

import styles from "./page.module.css";
import { TrainingModulesPanel } from "./TrainingModulesPanel";

export const metadata: Metadata = {
  title: "Тренировка",
  description: "Короткая практика на локальных модулях с активным вспоминанием.",
};

export default function TrainingPage() {
  return (
    <PageContainer className={styles.page}>
      <PageHeader description="Выберите модуль и начните короткую тренировку." title="Тренировка" />
      <Suspense fallback={<CatalogSectionSkeleton label="Загрузка модулей…" />}>
        <TrainingModulesPanel />
      </Suspense>
    </PageContainer>
  );
}
