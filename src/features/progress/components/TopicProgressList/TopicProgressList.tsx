"use client";

import { Badge } from "@/components/ui";

import {
  formatAccuracyPercent,
  masteryStatusLabel,
  type TopicProgressSnapshot,
} from "../../domain";

import styles from "./TopicProgressList.module.css";

export type TopicProgressListProps = {
  readonly topics: readonly TopicProgressSnapshot[];
};

function masteryTone(
  status: TopicProgressSnapshot["masteryStatus"],
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

export function TopicProgressList({ topics }: TopicProgressListProps) {
  if (topics.length === 0) {
    return null;
  }

  return (
    <section aria-label="Прогресс по темам модуля" className={styles.listSection}>
      <h3 className={styles.heading}>Темы</h3>
      <ul className={styles.list}>
        {topics.map((topic) => (
          <li key={topic.topicId}>
            <div className={styles.row}>
              <div className={styles.copy}>
                <p className={styles.title}>{topic.titleRu}</p>
                <p className={styles.meta}>
                  {topic.attemptsCount > 0
                    ? `${topic.attemptsCount} попыток · ${formatAccuracyPercent(topic.accuracy)}`
                    : "Пока без попыток"}
                </p>
              </div>
              <Badge tone={masteryTone(topic.masteryStatus)}>
                {masteryStatusLabel(topic.masteryStatus)}
              </Badge>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
