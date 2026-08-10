import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { BilingualTitle } from "@/features/catalog/presentation/BilingualTitle";
import { formatBilingualLabel } from "@/features/catalog/presentation/formatBilingualLabel";
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
        aria-label={`Открыть модуль «${formatBilingualLabel(module.title.ko, module.title.ru)}»`}
        className={styles.link}
        href={`/topics/${module.slug}`}
      >
        <div className={styles.meta}>
          <Badge lang="ko" tone="accent">
            {module.level}
          </Badge>
          <span>Версия {module.contentVersion}</span>
        </div>
        <div className={styles.copy}>
          <BilingualTitle as="h2" ko={module.title.ko} ru={module.title.ru} />
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
