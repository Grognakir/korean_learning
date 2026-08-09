import type { Metadata } from "next";
import { Suspense } from "react";

import { CatalogSectionSkeleton } from "@/components/feedback";
import { PageHeader } from "@/components/layout";
import { PageContainer } from "@/wrappers";

import { DictionaryCatalog } from "./DictionaryCatalog";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Словарь",
  description: "Проверенные значения по темам программы 1급.",
};

type DictionaryPageProps = {
  searchParams?: Promise<{
    unit?: string | string[];
    pos?: string | string[];
    page?: string | string[];
  }>;
};

export default function DictionaryPage({
  searchParams = Promise.resolve({}),
}: DictionaryPageProps) {
  return (
    <PageContainer className={styles.page}>
      <PageHeader
        description="Проверенные значения по темам. Полнотекстовый поиск отложен до серверного query."
        title="Словарь"
      />
      <Suspense fallback={<CatalogSectionSkeleton label="Загрузка словаря…" />}>
        <DictionaryCatalog searchParams={searchParams} />
      </Suspense>
    </PageContainer>
  );
}
