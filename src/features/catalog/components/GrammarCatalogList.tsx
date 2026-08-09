import Link from "next/link";

import type { PublicGrammarTopicSummary, PublicUnitSummary } from "../domain/types";
import { groupGrammarTopics } from "../presentation/groupGrammarTopics";

import styles from "./GrammarCatalogList.module.css";

type GrammarCatalogListProps = {
  readonly topics: readonly PublicGrammarTopicSummary[];
  readonly units: readonly PublicUnitSummary[];
};

export function GrammarCatalogList({ topics, units }: GrammarCatalogListProps) {
  const unitTitles = new Map(units.map((unit) => [unit.slug, unit.title.ru]));
  const groups = groupGrammarTopics(topics, unitTitles);

  return (
    <div className={styles.list}>
      {groups.map((group) => (
        <section
          key={group.unitSlug}
          aria-label={`Урок ${group.unitNumber}${group.unitTitleRu ? `: ${group.unitTitleRu}` : ""}`}
          className={styles.unit}
        >
          <header className={styles.unitHeader}>
            <h2 className={styles.unitTitle}>
              Урок {group.unitNumber}
              {group.unitTitleRu ? (
                <>
                  {" · "}
                  <span>{group.unitTitleRu}</span>
                </>
              ) : null}
            </h2>
            <Link className={styles.unitLink} href={`/topics/${group.unitSlug}`}>
              Открыть тему
            </Link>
          </header>
          {group.categories.map((category) => (
            <div key={category.category} className={styles.category}>
              <h3 className={styles.categoryTitle}>{category.category}</h3>
              <ul className={styles.topics}>
                {category.topics.map((topic) => (
                  <li key={topic.logicalId} className={styles.topic}>
                    <Link
                      className={styles.topicLink}
                      href={`/topics/${topic.unitSlug}?grammar=${encodeURIComponent(topic.logicalId)}`}
                      prefetch
                    >
                      <span className={styles.pattern} lang="ko">
                        {topic.patternKo}
                      </span>
                      <span className={styles.topicTitle}>{topic.title.ru}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
