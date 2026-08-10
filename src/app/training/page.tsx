import type { Metadata } from "next";
import { Suspense } from "react";

import { CatalogSectionSkeleton } from "@/components/feedback";
import { PageHeader } from "@/components/layout";
import { PageContainer } from "@/wrappers";

import styles from "./page.module.css";
import { TrainingModulesPanel } from "./TrainingModulesPanel";

export const metadata: Metadata = {
  title: "Тренировка",
  description: "Выберите навык и тему для короткой практики.",
};

type TrainingPageProps = {
  searchParams?: Promise<{
    skill?: string | string[];
    unit?: string | string[];
    grammar?: string | string[];
    difficulty?: string | string[];
    size?: string | string[];
  }>;
};

export default function TrainingPage({ searchParams = Promise.resolve({}) }: TrainingPageProps) {
  return (
    <PageContainer className={styles.page}>
      <PageHeader
        description="Выберите навык и тему, затем начните короткую тренировку."
        title="Тренировка"
      />
      <Suspense fallback={<CatalogSectionSkeleton label="Загрузка настройки…" />}>
        <TrainingModulesPanel searchParams={searchParams} />
      </Suspense>
    </PageContainer>
  );
}
