"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Input, Select, type SelectOption } from "@/components/ui";
import ui from "@/features/admin/components/adminUi.module.css";
import { STATUS_OPTIONS } from "@/features/admin/domain/statusLabels";
import { buildAdminGrammarHref } from "@/features/admin/presentation/parseAdminGrammarQuery";

export type AdminGrammarFiltersProps = {
  readonly q: string | null;
  readonly status: string | null;
  readonly unitId: string | null;
  readonly unitOptions: readonly SelectOption[];
};

const STATUS_FILTER_OPTIONS: SelectOption[] = [
  { value: "", label: "Все статусы" },
  ...STATUS_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
];

export function AdminGrammarFilters({
  q,
  status,
  unitId,
  unitOptions,
}: AdminGrammarFiltersProps) {
  const router = useRouter();
  const qFromUrl = q ?? "";
  const [urlQ, setUrlQ] = useState(qFromUrl);
  const [search, setSearch] = useState(qFromUrl);

  if (qFromUrl !== urlQ) {
    setUrlQ(qFromUrl);
    setSearch(qFromUrl);
  }

  useEffect(() => {
    const trimmed = search.trim();
    const nextQ = trimmed.length > 0 ? trimmed : null;
    if (nextQ === q) {
      return;
    }

    const timer = window.setTimeout(() => {
      router.replace(
        buildAdminGrammarHref({
          q: nextQ,
          status,
          unitId,
          page: 1,
        }),
        { scroll: false },
      );
    }, 250);

    return () => window.clearTimeout(timer);
  }, [q, router, search, status, unitId]);

  const replaceFilters = (next: {
    status: string | null;
    unitId: string | null;
  }) => {
    router.replace(
      buildAdminGrammarHref({
        q,
        status: next.status,
        unitId: next.unitId,
        page: 1,
      }),
      { scroll: false },
    );
  };

  return (
    <div aria-label="Фильтры грамматики" className={ui.filters} role="group">
      <div className={ui.filterField}>
        <Input
          label="Поиск"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Pattern, название или logical id"
          type="search"
          value={search}
        />
      </div>
      <label className={ui.filterField}>
        <span className={ui.filterLabel}>Статус</span>
        <Select
          aria-label="Статус"
          onChange={(value) => replaceFilters({ status: value || null, unitId })}
          options={STATUS_FILTER_OPTIONS}
          value={status ?? ""}
        />
      </label>
      <label className={ui.filterField}>
        <span className={ui.filterLabel}>Юнит</span>
        <Select
          aria-label="Юнит"
          onChange={(value) => replaceFilters({ status, unitId: value || null })}
          options={[{ value: "", label: "Все юниты" }, ...unitOptions]}
          value={unitId ?? ""}
        />
      </label>
    </div>
  );
}
