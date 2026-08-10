import Link from "next/link";

import type { PublicGrammarTopicSummary, PublicUnitSummary } from "../domain/types";
import { formatBilingualLabel } from "../presentation/formatBilingualLabel";
import { groupGrammarTopics } from "../presentation/groupGrammarTopics";
import { GrammarTopicLink } from "./GrammarTopicLink";

import styles from "./GrammarCatalogList.module.css";

type GrammarCatalogListProps = {
  readonly topics: readonly PublicGrammarTopicSummary[];
  readonly units: readonly PublicUnitSummary[];
};

function getConstructionCountLabel(count: number): string {
  const remainder100 = count % 100;
  const remainder10 = count % 10;
  const form =
    remainder100 >= 11 && remainder100 <= 14
      ? "конструкций"
      : remainder10 === 1
        ? "конструкция"
        : remainder10 >= 2 && remainder10 <= 4
          ? "конструкции"
          : "конструкций";

  return `${count} ${form}`;
}

export function GrammarCatalogList({ topics, units }: GrammarCatalogListProps) {
  const unitTitles = new Map(
    units.map((unit) => [unit.slug, formatBilingualLabel(unit.title.ko, unit.title.ru)]),
  );
  const groups = groupGrammarTopics(topics, unitTitles);

  return (
    <div className={styles.list}>
      {groups.map((group) => (
        <details key={group.unitSlug} className={styles.unit} open={group.unitNumber === 1}>
          <summary className={styles.unitSummary}>
            <span className={styles.unitHeading}>
              <span className={styles.unitNumber}>Урок {group.unitNumber}</span>
              {group.unitTitleRu ? (
                <span className={styles.unitTitle}>{group.unitTitleRu}</span>
              ) : null}
            </span>
            <span className={styles.topicCount}>
              {getConstructionCountLabel(
                group.categories.reduce((count, category) => count + category.topics.length, 0),
              )}
            </span>
          </summary>
          <div className={styles.unitBody}>
            <Link className={styles.unitLink} href={`/topics/${group.unitSlug}`}>
              Открыть урок
            </Link>
            {group.categories.map((category) => (
              <div key={category.category} className={styles.category}>
                {group.categories.length > 1 ? (
                  <h3 className={styles.categoryTitle}>
                    {category.category === "syllabus" ? "Основная программа" : "Дополнительно"}
                  </h3>
                ) : null}
                <ul className={styles.topics}>
                  {category.topics.map((topic) => (
                    <li key={topic.logicalId} className={styles.topic}>
                      <GrammarTopicLink topic={topic} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
