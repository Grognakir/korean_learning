"use client";

import { Input } from "@/components/ui";

import { describeFillBlankTemplate, type FillBlankExerciseView } from "../../presentation";

import styles from "./FillBlankExercise.module.css";

export type FillBlankExerciseProps = {
  readonly exercise: FillBlankExerciseView;
  readonly values: Readonly<Record<string, string>>;
  readonly disabled?: boolean;
  readonly onChange: (blankId: string, value: string) => void;
};

export function FillBlankExercise({
  disabled = false,
  exercise,
  onChange,
  values,
}: FillBlankExerciseProps) {
  const templatePreview = describeFillBlankTemplate(exercise.segments);
  const templateLang = exercise.templateLanguage === "ko" ? "ko" : undefined;

  return (
    <div className={styles.root}>
      <p className={styles.template} lang={templateLang}>
        <span className={styles.templateLabel}>Шаблон: </span>
        <span className={styles.templateValue}>{templatePreview}</span>
      </p>
      <div className={styles.blanks}>
        {exercise.blankIds.map((blankId, index) => (
          <Input
            autoComplete="off"
            disabled={disabled}
            inputMode="text"
            key={blankId}
            label={`Пропуск ${index + 1} (${blankId})`}
            lang={templateLang}
            onChange={(event) => onChange(blankId, event.currentTarget.value)}
            spellCheck={false}
            value={values[blankId] ?? ""}
          />
        ))}
      </div>
    </div>
  );
}
