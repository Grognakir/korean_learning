"use client";

import { Alert } from "@/components/feedback";

import type { AnswerDraft } from "../../hooks/useTrainingSession";
import type { ExerciseView } from "../../presentation";
import { ChoiceExercise } from "../ChoiceExercise";
import { FillBlankExercise } from "../FillBlankExercise";
import { MatchingExercise } from "../MatchingExercise";
import { TextAnswerExercise } from "../TextAnswerExercise";

import styles from "./ExerciseRenderer.module.css";

export type ExerciseRendererProps = {
  readonly exercise: ExerciseView;
  readonly draft: AnswerDraft | null;
  readonly disabled?: boolean;
  readonly onSelectChoice: (optionId: string) => void;
  readonly onChangeFreeResponse: (answer: string) => void;
  readonly onChangeFillBlank: (blankId: string, answer: string) => void;
  readonly onChangeMatching: (leftPairId: string, rightPairId: string) => void;
};

export function ExerciseRenderer({
  disabled = false,
  draft,
  exercise,
  onChangeFillBlank,
  onChangeFreeResponse,
  onChangeMatching,
  onSelectChoice,
}: ExerciseRendererProps) {
  switch (exercise.type) {
    case "free-response":
      return (
        <TextAnswerExercise
          disabled={disabled}
          exercise={exercise}
          onChange={onChangeFreeResponse}
          value={draft?.kind === "free-response" ? draft.answer : ""}
        />
      );
    case "meaning-choice":
    case "honorific-choice":
    case "plain-choice":
      return (
        <ChoiceExercise
          disabled={disabled}
          exercise={exercise}
          onSelect={onSelectChoice}
          selectedOptionId={draft?.kind === "choice" ? draft.optionId : null}
        />
      );
    case "fill-blank":
      return (
        <FillBlankExercise
          disabled={disabled}
          exercise={exercise}
          onChange={onChangeFillBlank}
          values={draft?.kind === "fill-blank" ? draft.answers : {}}
        />
      );
    case "matching-translation":
    case "matching-honorific":
      return (
        <MatchingExercise
          disabled={disabled}
          exercise={exercise}
          matches={draft?.kind === "matching" ? draft.matches : {}}
          onChange={onChangeMatching}
        />
      );
    default: {
      const unsupportedType =
        typeof exercise === "object" && exercise !== null && "type" in exercise
          ? String((exercise as { type: unknown }).type)
          : "unknown";

      return (
        <Alert className={styles.unsupported} title="Упражнение недоступно" tone="danger">
          <p>
            Тип задания «{unsupportedType}» не поддерживается этим экраном. Вернитесь к списку
            тренировок или выберите другую сессию.
          </p>
        </Alert>
      );
    }
  }
}
