import Link from "next/link";

import type { PublicUnitSummary } from "../domain/types";
import { BilingualTitle } from "../presentation/BilingualTitle";

import styles from "./UnitSummaryCard.module.css";

type UnitSummaryCardProps = {
  readonly unit: PublicUnitSummary;
};

export function UnitSummaryCard({ unit }: UnitSummaryCardProps) {
  const available =
    unit.counts.grammarTopics +
    unit.counts.dictionaryEntries +
    unit.counts.readingPassages +
    unit.counts.approvedExercises;

  return (
    <article className={styles.card}>
      <Link className={styles.link} href={`/topics/${unit.slug}`} prefetch>
        <p className={styles.meta}>Урок {unit.unitNumber}</p>
        <BilingualTitle
          as="h2"
          className={styles.title}
          ko={unit.title.ko}
          ru={unit.title.ru}
        />
        <p className={styles.counts}>
          {available > 0
            ? `Доступно материалов: ${available}`
            : "Пока нет опубликованных материалов"}
        </p>
      </Link>
    </article>
  );
}
