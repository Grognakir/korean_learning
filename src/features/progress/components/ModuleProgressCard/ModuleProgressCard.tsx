"use client";

import { Badge } from "@/components/ui";

import {
  formatAccuracyPercent,
  masteryStatusLabel,
  type ModuleProgressSnapshot,
} from "../../domain";

import styles from "./ModuleProgressCard.module.css";
import { SkillProgressList } from "../SkillProgressList";
import { TopicProgressList } from "../TopicProgressList";

export type ModuleProgressCardProps = {
  readonly module: ModuleProgressSnapshot;
};

function masteryTone(
  status: ModuleProgressSnapshot["masteryStatus"],
): "neutral" | "warning" | "success" {
  switch (status) {
    case "not_started":
      return "neutral";
    case "learning":
      return "warning";
    case "practiced":
      return "success";
  }
}

function formatAttemptCount(count: number): string {
  const modulo100 = count % 100;
  const modulo10 = count % 10;

  if (modulo100 >= 11 && modulo100 <= 14) {
    return `${count} попыток`;
  }

  if (modulo10 === 1) {
    return `${count} попытка`;
  }

  if (modulo10 >= 2 && modulo10 <= 4) {
    return `${count} попытки`;
  }

  return `${count} попыток`;
}

export function ModuleProgressCard({ module }: ModuleProgressCardProps) {
  const accuracyLabel = module.attemptsCount > 0 ? formatAccuracyPercent(module.accuracy) : "—";

  return (
    <article aria-labelledby={`module-progress-${module.moduleId}`} className={styles.card}>
      <div className={styles.header}>
        <div className={styles.meta}>
          <Badge lang="ko" tone="accent">
            {module.level}
          </Badge>
          <Badge tone={masteryTone(module.masteryStatus)}>
            {masteryStatusLabel(module.masteryStatus)}
          </Badge>
        </div>
        <div className={styles.copy}>
          <p className={styles.koreanTitle} lang="ko">
            {module.titleKo}
          </p>
          <h2 className={styles.title} id={`module-progress-${module.moduleId}`}>
            {module.titleRu}
          </h2>
        </div>
      </div>

      <dl className={styles.stats}>
        <div>
          <dt>Попытки</dt>
          <dd>{formatAttemptCount(module.attemptsCount)}</dd>
        </div>
        <div>
          <dt>Точность</dt>
          <dd>{accuracyLabel}</dd>
        </div>
        <div>
          <dt>Завершённые сессии</dt>
          <dd>{module.completedSessions}</dd>
        </div>
      </dl>

      <SkillProgressList skills={module.skills} />
      <TopicProgressList topics={module.topics} />
    </article>
  );
}
