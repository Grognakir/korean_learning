import type { Metadata } from "next";

import { CatalogEmptyState, ServiceUnavailableState } from "@/components/feedback";
import { PageHeader } from "@/components/layout";
import { ModuleCard } from "@/features/training";
import { getLearningContent, LearningContentError } from "@/modules";
import type { LearningModuleDefinition } from "@/types";
import { PageContainer } from "@/wrappers";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Темы",
  description: "Выберите модуль и двигайтесь по коротким темам в своём темпе.",
};

export default async function TopicsPage() {
  let modules: readonly LearningModuleDefinition[] | null = null;

  try {
    const { moduleRepository } = await getLearningContent();
    modules = await moduleRepository.getPublished();
  } catch (error) {
    if (!(error instanceof LearningContentError)) {
      throw error;
    }
  }

  if (modules === null) {
    return (
      <PageContainer className={styles.page}>
        <PageHeader description="Не удалось загрузить каталог модулей." title="Темы" />
        <ServiceUnavailableState />
      </PageContainer>
    );
  }

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        description="Выберите модуль и двигайтесь по коротким темам в своём темпе."
        title="Темы"
      />
      {modules.length === 0 ? (
        <CatalogEmptyState />
      ) : (
        <section aria-label="Доступные учебные модули" className={styles.grid}>
          {modules.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </section>
      )}
    </PageContainer>
  );
}
