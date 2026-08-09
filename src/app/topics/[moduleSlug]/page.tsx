import type { Metadata } from "next";
import { Suspense } from "react";

import { CatalogSectionSkeleton } from "@/components/feedback";
import {
  getCachedPublishedModules,
  getCachedPublishedModuleBySlug,
} from "@/modules/cachedLearningContent";
import { PLACEHOLDER_MODULE_SLUG } from "@/modules/resolveRouteExistence";
import type { LearningModuleDefinition } from "@/types";

import { ModuleDetailPanel } from "./ModuleDetailPanel";
import styles from "./page.module.css";
import { PageContainer } from "@/wrappers";

type ModulePageProps = {
  params: Promise<{ moduleSlug: string }>;
};

export async function generateMetadata({ params }: ModulePageProps): Promise<Metadata> {
  const { moduleSlug } = await params;
  const result = await getCachedPublishedModuleBySlug(moduleSlug);

  if (result.status === "unavailable") {
    return { title: "Модуль недоступен" };
  }

  return {
    title: result.data?.title.ru ?? "Модуль не найден",
    description: result.data?.description.ru,
  };
}

export async function generateStaticParams() {
  const modules = await getCachedPublishedModules();
  const params =
    modules.status === "ready"
      ? modules.data.map((module: LearningModuleDefinition) => ({ moduleSlug: module.slug }))
      : [];

  return params.length > 0 ? params : [{ moduleSlug: PLACEHOLDER_MODULE_SLUG }];
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
