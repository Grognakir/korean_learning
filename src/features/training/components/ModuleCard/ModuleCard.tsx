import Link from "next/link";

import { Badge } from "@/components/ui";
import { selectPublishedTopics } from "@/features/training/domain";
import type { LearningModuleDefinition } from "@/types";

import styles from "./ModuleCard.module.css";

export type ModuleCardProps = {
  module: LearningModuleDefinition;
};

function formatTopicCount(count: number) {
  const modulo100 = count % 100;
  const modulo10 = count % 10;

  if (modulo100 >= 11 && modulo100 <= 14) {
    return `${count} тем`;
  }

  if (modulo10 === 1) {
    return `${count} тема`;
  }

  if (modulo10 >= 2 && modulo10 <= 4) {
    return `${count} темы`;
  }

  return `${count} тем`;
}

export function ModuleCard({ module }: ModuleCardProps) {
  const topicCount = selectPublishedTopics(module).length;

  return (
    <article className={styles.card}>
      <Link
        aria-label={`Открыть модуль «${module.title.ru}»`}
        className={styles.link}
        href={`/topics/${module.slug}`}
      >
        <div className={styles.meta}>
          <Badge tone="accent">{module.level}</Badge>
          <span>Версия {module.contentVersion}</span>
        </div>
        <div className={styles.copy}>
          <p className={styles.koreanTitle} lang="ko">
            {module.title.ko}
          </p>
          <h2>{module.title.ru}</h2>
          <p>{module.description.ru}</p>
        </div>
        <div className={styles.action}>
          <span>{formatTopicCount(topicCount)}</span>
          <span>
            Открыть <span aria-hidden="true">→</span>
          </span>
        </div>
      </Link>
    </article>
  );
}
