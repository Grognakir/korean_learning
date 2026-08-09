import { CatalogEmptyState, ServiceUnavailableState } from "@/components/feedback";
import { DictionaryEntryList } from "@/features/dictionary/components/DictionaryEntryList";
import { DictionaryFilters } from "@/features/dictionary/components/DictionaryFilters";
import { parseDictionaryQuery } from "@/features/dictionary/presentation/parseDictionaryQuery";
import {
  getCachedPublicDictionaryPage,
  getCachedPublicUnits,
} from "@/modules/curriculum/cachedCurriculumContent";

import styles from "./page.module.css";

type DictionaryCatalogProps = {
  readonly searchParams: Promise<{
    unit?: string | string[];
    pos?: string | string[];
    page?: string | string[];
  }>;
};

export async function DictionaryCatalog({ searchParams }: DictionaryCatalogProps) {
  const query = parseDictionaryQuery(await searchParams);
  const dictionaryQuery = {
    page: query.page,
    pageSize: 20,
    ...(query.unitSlug ? { unitSlug: query.unitSlug } : {}),
    ...(query.pos ? { pos: query.pos } : {}),
  };
  const [unitsResult, pageResult] = await Promise.all([
    getCachedPublicUnits(),
    getCachedPublicDictionaryPage(dictionaryQuery),
  ]);

  if (unitsResult.status === "unavailable" || pageResult.status === "unavailable") {
    return <ServiceUnavailableState />;
  }

  const unitOptions = unitsResult.data.map((unit) => ({
    value: unit.slug,
    label: `Урок ${unit.unitNumber}: ${unit.title.ru}`,
  }));
  const posOptions = pageResult.data.posOptions.map((value) => ({
    value,
    label: value,
  }));

  return (
    <div className={styles.catalog}>
      <DictionaryFilters
        pos={query.pos}
        posOptions={posOptions}
        unitOptions={unitOptions}
        unitSlug={query.unitSlug}
      />
      {pageResult.data.total === 0 ? (
        <CatalogEmptyState />
      ) : (
        <DictionaryEntryList
          homonymLemmas={pageResult.data.homonymLemmas}
          items={pageResult.data.items}
          page={pageResult.data.page}
          pageSize={pageResult.data.pageSize}
          pos={query.pos}
          total={pageResult.data.total}
          unitSlug={query.unitSlug}
        />
      )}
    </div>
  );
}
