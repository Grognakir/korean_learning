import type { Metadata } from "next";
import { Suspense } from "react";

import { CatalogSectionSkeleton } from "@/components/feedback";
import { PageHeader } from "@/components/layout";
import { PageContainer } from "@/wrappers";

import styles from "./page.module.css";
import { TopicsCatalog } from "./TopicsCatalog";

export const metadata: Metadata = {
  title: "Темы",
  description: "Выберите модуль и двигайтесь по коротким темам в своём темпе.",
};

export default function TopicsPage() {
  return (
    <PageContainer className={styles.page}>
      <PageHeader
        description="Выберите модуль и двигайтесь по коротким темам в своём темпе."
        title="Темы"
      />
      <Suspense fallback={<CatalogSectionSkeleton label="Загрузка каталога…" />}>
        <TopicsCatalog />
      </Suspense>
    </PageContainer>
  );
}
