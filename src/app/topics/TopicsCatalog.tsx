import { CatalogEmptyState, ServiceUnavailableState } from "@/components/feedback";
import { ModuleCard } from "@/features/training/components/ModuleCard";
import { getCachedPublishedModules } from "@/modules/cachedLearningContent";

import styles from "./page.module.css";

export async function TopicsCatalog() {
  const modules = await getCachedPublishedModules();

  if (modules.status === "unavailable") {
    return <ServiceUnavailableState />;
  }

  if (modules.data.length === 0) {
    return <CatalogEmptyState />;
  }

  return (
    <section aria-label="Доступные учебные модули" className={styles.grid}>
      {modules.data.map((module) => (
        <ModuleCard key={module.id} module={module} />
      ))}
    </section>
  );
}
