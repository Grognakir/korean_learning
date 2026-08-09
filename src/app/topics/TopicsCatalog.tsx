import { CatalogEmptyState, ServiceUnavailableState } from "@/components/feedback";
import { ModuleCard } from "@/features/training/components/ModuleCard";
import { getCachedPublishedModules } from "@/modules/cachedLearningContent";
import { LearningContentError } from "@/modules/resolveLearningContent";
import type { LearningModuleDefinition } from "@/types";

import styles from "./page.module.css";

export async function TopicsCatalog() {
  let modules: readonly LearningModuleDefinition[];

  try {
    modules = await getCachedPublishedModules();
  } catch (error) {
    if (error instanceof LearningContentError) {
      return <ServiceUnavailableState />;
    }

    throw error;
  }

  if (modules.length === 0) {
    return <CatalogEmptyState />;
  }

  return (
    <section aria-label="Доступные учебные модули" className={styles.grid}>
      {modules.map((module) => (
        <ModuleCard key={module.id} module={module} />
      ))}
    </section>
  );
}
