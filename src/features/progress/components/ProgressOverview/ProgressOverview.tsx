"use client";

import type { LearningProgressOverview } from "../../domain";
import { ModuleProgressCard } from "../ModuleProgressCard";

import styles from "./ProgressOverview.module.css";

export type ProgressOverviewProps = {
  readonly overview: LearningProgressOverview;
};

export function ProgressOverview({ overview }: ProgressOverviewProps) {
  return (
    <section aria-label="Прогресс по модулям" className={styles.grid}>
      {overview.modules.map((module) => (
        <ModuleProgressCard key={module.moduleId} module={module} />
      ))}
    </section>
  );
}
