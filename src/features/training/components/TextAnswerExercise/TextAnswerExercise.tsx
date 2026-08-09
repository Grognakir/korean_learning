"use client";

import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

import type { FreeResponseExerciseView } from "../../presentation";

import styles from "./TextAnswerExercise.module.css";

export type TextAnswerExerciseProps = {
  readonly exercise: FreeResponseExerciseView;
  readonly value: string;
  readonly disabled?: boolean;
  readonly onChange: (value: string) => void;
};

export function TextAnswerExercise({
  disabled = false,
  exercise,
  onChange,
  value,
}: TextAnswerExerciseProps) {
  const isKorean = exercise.answerLanguage === "ko";
  const sharedProps = {
    disabled,
    label: "Ваш ответ",
    lang: isKorean ? ("ko" as const) : undefined,
    onChange: (event: { currentTarget: { value: string } }) => onChange(event.currentTarget.value),
    value,
  };

  return (
    <div className={styles.field}>
      {isKorean ? (
        <Input {...sharedProps} autoComplete="off" inputMode="text" spellCheck={false} />
      ) : (
        <Textarea {...sharedProps} autoComplete="off" rows={3} />
      )}
    </div>
  );
}
