"use client";

import { ExerciseText } from "../ExerciseText";
import type { ChoiceExerciseView } from "../../presentation";

import styles from "./ChoiceExercise.module.css";

export type ChoiceExerciseProps = {
  readonly exercise: ChoiceExerciseView;
  readonly selectedOptionId: string | null;
  readonly disabled?: boolean;
  readonly onSelect: (optionId: string) => void;
};

export function ChoiceExercise({
  disabled = false,
  exercise,
  onSelect,
  selectedOptionId,
}: ChoiceExerciseProps) {
  const groupName = `choice-${exercise.id}`;

  return (
    <fieldset className={styles.fieldset} disabled={disabled}>
      <legend className={`${styles.legend} visually-hidden`}>Выберите один вариант</legend>
      <div className={styles.options}>
        {exercise.options.map((option) => {
          const optionId = `${groupName}-${option.id}`;
          const isChecked = selectedOptionId === option.id;

          return (
            <label className={styles.option} htmlFor={optionId} key={option.id}>
              <input
                checked={isChecked}
                className={styles.input}
                id={optionId}
                name={groupName}
                onChange={() => onSelect(option.id)}
                type="radio"
                value={option.id}
              />
              <span className={styles.optionLabel}>
                <ExerciseText text={option.label} />
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
