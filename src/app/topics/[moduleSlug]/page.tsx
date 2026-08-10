import type { Metadata } from "next";
import { Suspense } from "react";

import { CatalogSectionSkeleton } from "@/components/feedback";
import { formatBilingualLabel } from "@/features/catalog/presentation/formatBilingualLabel";
import {
  getCachedPublishedModules,
  getCachedPublishedModuleBySlug,
} from "@/modules/cachedLearningContent";
import {
  getCachedPublicUnitBySlug,
  getCachedPublicUnits,
} from "@/modules/curriculum/cachedCurriculumContent";
import { PLACEHOLDER_MODULE_SLUG } from "@/modules/resolveRouteExistence";
import type { LearningModuleDefinition } from "@/types";
import { PageContainer } from "@/wrappers";

import { ModuleDetailPanel } from "./ModuleDetailPanel";
import styles from "./page.module.css";

type ModulePageProps = {
  params: Promise<{ moduleSlug: string }>;
  searchParams?: Promise<{
    grammar?: string | string[];
  }>;
};

export async function generateMetadata({ params }: ModulePageProps): Promise<Metadata> {
  const { moduleSlug } = await params;
  const curriculum = await getCachedPublicUnitBySlug(moduleSlug);
  if (curriculum.status === "ready" && curriculum.data) {
    return {
      title: formatBilingualLabel(curriculum.data.title.ko, curriculum.data.title.ru),
      description: curriculum.data.summary.ru,
    };
  }

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
  const [modules, units] = await Promise.all([getCachedPublishedModules(), getCachedPublicUnits()]);

  const slugs = new Set<string>();
  if (modules.status === "ready") {
    for (const learningModule of modules.data as readonly LearningModuleDefinition[]) {
      slugs.add(learningModule.slug);
    }
  }
  if (units.status === "ready") {
    for (const unit of units.data) {
      slugs.add(unit.slug);
    }
  }

  const params = [...slugs].map((moduleSlug) => ({ moduleSlug }));
  return params.length > 0 ? params : [{ moduleSlug: PLACEHOLDER_MODULE_SLUG }];
}

async function ModulePageContent({ params, searchParams = Promise.resolve({}) }: ModulePageProps) {
  const { moduleSlug } = await params;

  return <ModuleDetailPanel moduleSlug={moduleSlug} searchParams={searchParams} />;
}

export default function ModulePage({
  params,
  searchParams = Promise.resolve({}),
}: ModulePageProps) {
  return (
    <PageContainer className={styles.page}>
      <Suspense fallback={<CatalogSectionSkeleton label="Загрузка модуля…" />}>
        <ModulePageContent params={params} searchParams={searchParams} />
      </Suspense>
    </PageContainer>
  );
}
