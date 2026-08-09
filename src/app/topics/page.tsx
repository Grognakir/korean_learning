import type { Metadata } from "next";
import { Suspense } from "react";

import { CatalogSectionSkeleton } from "@/components/feedback";
import { PageHeader } from "@/components/layout";
import { PageContainer } from "@/wrappers";

import styles from "./page.module.css";
import { TopicsCatalog } from "./TopicsCatalog";

export const metadata: Metadata = {
  title: "Темы",
  description: "Выберите тему или грамматику и двигайтесь по коротким урокам в своём темпе.",
};

type TopicsPageProps = {
  searchParams?: Promise<{
    view?: string | string[];
  }>;
};

export default function TopicsPage({ searchParams = Promise.resolve({}) }: TopicsPageProps) {
  return (
    <PageContainer className={styles.page}>
      <PageHeader
        description="Выберите тему или грамматическую конструкцию и двигайтесь по коротким урокам в своём темпе."
        title="Темы"
      />
      <Suspense fallback={<CatalogSectionSkeleton label="Загрузка каталога…" />}>
        <TopicsCatalog searchParams={searchParams} />
      </Suspense>
    </PageContainer>
  );
}
