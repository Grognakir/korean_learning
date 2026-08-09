"use client";

import { Select } from "@/components/ui/Select";

import type { MatchingExerciseView } from "../../presentation";
import { ExerciseText } from "../ExerciseText";

import styles from "./MatchingExercise.module.css";

export type MatchingExerciseProps = {
  readonly exercise: MatchingExerciseView;
  readonly matches: Readonly<Record<string, string>>;
  readonly disabled?: boolean;
  readonly onChange: (leftPairId: string, rightPairId: string) => void;
};

function optionLang(label: { ko: string | null; ru: string | null }): string | undefined {
  if (label.ko && !label.ru) {
    return "ko";
  }

  return undefined;
}

function labelText(label: { ko: string | null; ru: string | null }): string {
  return [label.ko, label.ru].filter(Boolean).join(" / ");
}

export function MatchingExercise({
  disabled = false,
  exercise,
  matches,
  onChange,
}: MatchingExerciseProps) {
  const rightOptions = exercise.rightOptions.map((rightOption) => {
    const lang = optionLang(rightOption.label);
    return {
      value: rightOption.pairId,
      label: labelText(rightOption.label),
      ...(lang ? { lang } : {}),
    };
  });

  return (
    <div className={styles.root}>
      <ul className={styles.list}>
        {exercise.leftItems.map((leftItem) => {
          const selectId = `match-${exercise.id}-${leftItem.pairId}`;
          const labelId = `${selectId}-label`;
          const selectedRightId = matches[leftItem.pairId] ?? "";

          return (
            <li className={styles.item} key={leftItem.pairId}>
              <span className={styles.left} id={labelId}>
                <ExerciseText text={leftItem.label} />
              </span>
              <Select
                aria-labelledby={labelId}
                disabled={disabled}
                id={selectId}
                onChange={(value) => onChange(leftItem.pairId, value)}
                options={rightOptions}
                placeholder="Выберите соответствие"
                value={selectedRightId}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
