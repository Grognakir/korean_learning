"use client";

import { ExerciseText } from "../ExerciseText";
import type { MatchingExerciseView } from "../../presentation";

import styles from "./MatchingExercise.module.css";

export type MatchingExerciseProps = {
  readonly exercise: MatchingExerciseView;
  readonly matches: Readonly<Record<string, string>>;
  readonly disabled?: boolean;
  readonly onChange: (leftPairId: string, rightPairId: string) => void;
};

function labelText(label: { ko: string | null; ru: string | null }): string {
  return [label.ko, label.ru].filter(Boolean).join(" / ");
}

export function MatchingExercise({
  disabled = false,
  exercise,
  matches,
  onChange,
}: MatchingExerciseProps) {
  return (
    <div className={styles.root}>
      <p className={styles.hint}>Сопоставьте пары с помощью выпадающего списка.</p>
      <ul className={styles.list}>
        {exercise.leftItems.map((leftItem) => {
          const selectId = `match-${exercise.id}-${leftItem.pairId}`;
          const selectedRightId = matches[leftItem.pairId] ?? "";

          return (
            <li className={styles.item} key={leftItem.pairId}>
              <label className={styles.left} htmlFor={selectId}>
                <ExerciseText text={leftItem.label} />
              </label>
              <select
                className={styles.select}
                disabled={disabled}
                id={selectId}
                onChange={(event) => onChange(leftItem.pairId, event.currentTarget.value)}
                value={selectedRightId}
              >
                <option value="">Выберите соответствие</option>
                {exercise.rightOptions.map((rightOption) => (
                  <option key={rightOption.pairId} value={rightOption.pairId}>
                    {labelText(rightOption.label)}
                  </option>
                ))}
              </select>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
