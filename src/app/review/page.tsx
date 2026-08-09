import type { Metadata } from "next";
import { Suspense } from "react";

import { CatalogSectionSkeleton } from "@/components/feedback";
import { PageHeader } from "@/components/layout";
import { PageContainer } from "@/wrappers";

import { ReviewDataPanel } from "./ReviewDataPanel";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Повторение",
  description: "Очередь повторения ошибок из облачных тренировок.",
};

export default function ReviewPage() {
  return (
    <PageContainer className={styles.page}>
      <PageHeader
        description="Ошибочные ответы из облачных тренировок попадают сюда и возвращаются по фиксированному расписанию."
        title="Повторение"
      />
      <Suspense fallback={<CatalogSectionSkeleton label="Загрузка очереди повторения…" />}>
        <ReviewDataPanel />
      </Suspense>
    </PageContainer>
  );
}
