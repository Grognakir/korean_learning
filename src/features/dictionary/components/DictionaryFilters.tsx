"use client";

import { usePathname, useRouter } from "next/navigation";

import { Select, type SelectOption } from "@/components/ui/Select";

import styles from "./DictionaryFilters.module.css";

type DictionaryFiltersProps = {
  readonly unitSlug: string | null;
  readonly pos: string | null;
  readonly unitOptions: readonly SelectOption[];
  readonly posOptions: readonly SelectOption[];
};

export function DictionaryFilters({
  unitSlug,
  pos,
  unitOptions,
  posOptions,
}: DictionaryFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  const replace = (next: { unitSlug: string | null; pos: string | null }) => {
    const params = new URLSearchParams();
    if (next.unitSlug) {
      params.set("unit", next.unitSlug);
    }
    if (next.pos) {
      params.set("pos", next.pos);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <div className={styles.filters} role="group" aria-label="Фильтры словаря">
      <label className={styles.field}>
        <span className={styles.label}>Тема</span>
        <Select
          aria-label="Тема"
          options={[{ value: "", label: "Все темы" }, ...unitOptions]}
          value={unitSlug ?? ""}
          onChange={(value) => replace({ unitSlug: value || null, pos })}
        />
      </label>
      <label className={styles.field}>
        <span className={styles.label}>Часть речи</span>
        <Select
          aria-label="Часть речи"
          options={[{ value: "", label: "Все части речи" }, ...posOptions]}
          value={pos ?? ""}
          onChange={(value) => replace({ unitSlug, pos: value || null })}
        />
      </label>
    </div>
  );
}
