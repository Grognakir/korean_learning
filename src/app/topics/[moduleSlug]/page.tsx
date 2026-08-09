import type { Metadata } from "next";
import { Suspense } from "react";

import { CatalogSectionSkeleton } from "@/components/feedback";
import {
  getCachedPublishedModules,
  getCachedPublishedModuleBySlug,
} from "@/modules/cachedLearningContent";
import type { LearningModuleDefinition } from "@/types";

import { ModuleDetailPanel } from "./ModuleDetailPanel";
import styles from "./page.module.css";
import { PageContainer } from "@/wrappers";

type ModulePageProps = {
  params: Promise<{ moduleSlug: string }>;
};

export async function generateMetadata({ params }: ModulePageProps): Promise<Metadata> {
  const { moduleSlug } = await params;

  try {
    const learningModule = await getCachedPublishedModuleBySlug(moduleSlug);

    return {
      title: learningModule?.title.ru ?? "Модуль не найден",
      description: learningModule?.description.ru,
    };
  } catch {
    return {
      title: "Модуль недоступен",
    };
  }
}

export async function generateStaticParams() {
  const modules = await getCachedPublishedModules();

  return modules.map((module: LearningModuleDefinition) => ({ moduleSlug: module.slug }));
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { moduleSlug } = await params;

  return (
    <PageContainer className={styles.page}>
      <Suspense fallback={<CatalogSectionSkeleton label="Загрузка модуля…" />}>
        <ModuleDetailPanel moduleSlug={moduleSlug} />
      </Suspense>
    </PageContainer>
  );
}
