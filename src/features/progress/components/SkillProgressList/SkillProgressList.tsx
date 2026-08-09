"use client";

import { Badge } from "@/components/ui";

import {
  formatAccuracyPercent,
  learningSkillLabel,
  masteryStatusLabel,
  type SkillProgressSnapshot,
} from "../../domain";

import styles from "./SkillProgressList.module.css";

export type SkillProgressListProps = {
  readonly skills: readonly SkillProgressSnapshot[];
};

function masteryTone(
  status: SkillProgressSnapshot["masteryStatus"],
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

export function SkillProgressList({ skills }: SkillProgressListProps) {
  if (skills.length === 0) {
    return null;
  }

  return (
    <section aria-label="Прогресс по навыкам" className={styles.listSection}>
      <h3 className={styles.heading}>Навыки</h3>
      <ul className={styles.list}>
        {skills.map((skill) => {
          const accuracyValue = Math.round(skill.accuracy * 100);
          return (
            <li key={skill.skill}>
              <div className={styles.row}>
                <div className={styles.copy}>
                  <p className={styles.title}>{learningSkillLabel(skill.skill)}</p>
                  <p className={styles.meta}>
                    {skill.attemptsCount > 0
                      ? `${skill.attemptsCount} попыток · ${formatAccuracyPercent(skill.accuracy)}`
                      : "Пока без попыток"}
                  </p>
                  <div
                    aria-label={`Точность навыка ${learningSkillLabel(skill.skill)}: ${accuracyValue}%`}
                    aria-valuemax={100}
                    aria-valuemin={0}
                    aria-valuenow={skill.attemptsCount > 0 ? accuracyValue : 0}
                    className={styles.barTrack}
                    role="progressbar"
                  >
                    <div
                      className={styles.barFill}
                      style={{ width: `${skill.attemptsCount > 0 ? accuracyValue : 0}%` }}
                    />
                  </div>
                </div>
                <Badge tone={masteryTone(skill.masteryStatus)}>
                  {masteryStatusLabel(skill.masteryStatus)}
                </Badge>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
