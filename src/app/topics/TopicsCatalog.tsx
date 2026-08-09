import { CatalogEmptyState, ServiceUnavailableState } from "@/components/feedback";
import { CatalogViewSwitch } from "@/features/catalog/components/CatalogViewSwitch";
import { GrammarCatalogList } from "@/features/catalog/components/GrammarCatalogList";
import { UnitSummaryCard } from "@/features/catalog/components/UnitSummaryCard";
import { parseCatalogView } from "@/features/catalog/presentation/parseCatalogView";
import {
  getCachedPublicGrammarTopics,
  getCachedPublicUnits,
} from "@/modules/curriculum/cachedCurriculumContent";

import styles from "./page.module.css";

type TopicsCatalogProps = {
  readonly searchParams: Promise<{
    view?: string | string[];
  }>;
};

export async function TopicsCatalog({ searchParams }: TopicsCatalogProps) {
  const params = await searchParams;
  const view = parseCatalogView(params.view);

  if (view === "grammar") {
    const [units, topics] = await Promise.all([
      getCachedPublicUnits(),
      getCachedPublicGrammarTopics(),
    ]);

    return (
      <>
        <div className={styles.toolbar}>
          <CatalogViewSwitch value={view} />
        </div>
        {units.status === "unavailable" || topics.status === "unavailable" ? (
          <ServiceUnavailableState />
        ) : topics.data.length === 0 ? (
          <CatalogEmptyState />
        ) : (
          <section
            aria-label="Грамматика по урокам"
            className={styles.grammarPanel}
            id="catalog-panel"
          >
            <GrammarCatalogList topics={topics.data} units={units.data} />
          </section>
        )}
      </>
    );
  }

  const units = await getCachedPublicUnits();

  return (
    <>
      <div className={styles.toolbar}>
        <CatalogViewSwitch value={view} />
      </div>
      {units.status === "unavailable" ? (
        <ServiceUnavailableState />
      ) : units.data.length === 0 ? (
        <CatalogEmptyState />
      ) : (
        <section aria-label="Темы по урокам" className={styles.grid} id="catalog-panel">
          {units.data.map((unit) => (
            <UnitSummaryCard key={unit.id} unit={unit} />
          ))}
        </section>
      )}
    </>
  );
}
