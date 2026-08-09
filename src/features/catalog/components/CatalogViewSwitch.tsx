"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback, useId, useRef, type KeyboardEvent } from "react";

import type { CatalogView } from "../presentation/parseCatalogView";

import styles from "./CatalogViewSwitch.module.css";

const OPTIONS: ReadonlyArray<{ readonly value: CatalogView; readonly label: string }> = [
  { value: "themes", label: "По темам" },
  { value: "grammar", label: "По грамматике" },
];

type CatalogViewSwitchProps = {
  readonly value: CatalogView;
};

export function CatalogViewSwitch({ value }: CatalogViewSwitchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const baseId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const select = useCallback(
    (next: CatalogView) => {
      const params = new URLSearchParams();
      if (next !== "themes") {
        params.set("view", next);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = OPTIONS.findIndex((option) => option.value === value);
    if (currentIndex < 0) {
      return;
    }

    let nextIndex = currentIndex;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      nextIndex = (currentIndex + 1) % OPTIONS.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      nextIndex = (currentIndex - 1 + OPTIONS.length) % OPTIONS.length;
    } else if (event.key === "Home") {
      event.preventDefault();
      nextIndex = 0;
    } else if (event.key === "End") {
      event.preventDefault();
      nextIndex = OPTIONS.length - 1;
    } else if (event.key === "Enter" || event.key === " ") {
      return;
    } else {
      return;
    }

    const next = OPTIONS[nextIndex]!;
    select(next.value);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <div aria-label="Вид каталога" className={styles.switch} onKeyDown={onKeyDown} role="tablist">
      {OPTIONS.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            aria-controls="catalog-panel"
            aria-selected={selected}
            className={selected ? styles.tabActive : styles.tab}
            id={`${baseId}-${option.value}`}
            role="tab"
            tabIndex={selected ? 0 : -1}
            type="button"
            onClick={() => select(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
