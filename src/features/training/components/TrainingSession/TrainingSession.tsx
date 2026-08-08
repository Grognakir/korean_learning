"use client";

import Link from "next/link";
import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent } from "react";

import { Button, ProgressBar } from "@/components/ui";
import { TrainingShell } from "@/wrappers";

import type { Exercise } from "../../domain";
import { useTrainingSession, type UseTrainingSessionOptions } from "../../hooks/useTrainingSession";
import { ExerciseFeedback } from "../ExerciseFeedback";
import { ExerciseRenderer } from "../ExerciseRenderer";
import { ExerciseText } from "../ExerciseText";

import styles from "./TrainingSession.module.css";

export type TrainingSessionProps = {
  readonly exercises: readonly Exercise[];
  readonly sessionId?: string;
  readonly moduleSlug?: string;
  readonly seed?: number;
  readonly limit?: number;
  readonly now?: UseTrainingSessionOptions["now"];
  readonly createSubmissionId?: UseTrainingSessionOptions["createSubmissionId"];
};

function isSingleLineTextField(target: EventTarget | null): target is HTMLInputElement {
  return (
    target instanceof HTMLInputElement &&
    (target.type === "text" || target.type === "search" || target.type === "")
  );
}

export function TrainingSession({
  createSubmissionId,
  exercises,
  limit,
  moduleSlug,
  now,
  seed,
  sessionId,
}: TrainingSessionProps) {
  const session = useTrainingSession({
    exercises,
    ...(sessionId === undefined ? {} : { sessionId }),
    ...(moduleSlug === undefined ? {} : { moduleSlug }),
    ...(seed === undefined ? {} : { seed }),
    ...(limit === undefined ? {} : { limit }),
    ...(now === undefined ? {} : { now }),
    ...(createSubmissionId === undefined ? {} : { createSubmissionId }),
  });
  const promptHeadingRef = useRef<HTMLHeadingElement>(null);
  const previousExerciseIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!session.currentExerciseId) {
      return;
    }

    if (previousExerciseIdRef.current === null) {
      previousExerciseIdRef.current = session.currentExerciseId;
      return;
    }

    if (previousExerciseIdRef.current !== session.currentExerciseId) {
      previousExerciseIdRef.current = session.currentExerciseId;
      promptHeadingRef.current?.focus();
    }
  }, [session.currentExerciseId]);

  if (session.isCompleted) {
    return (
      <section aria-labelledby="training-complete-title" className={styles.complete}>
        <h1 className={styles.completeTitle} id="training-complete-title">
          Тренировка завершена
        </h1>
        <p className={styles.completeCopy}>
          Вы прошли все задания этой короткой сессии. Можно вернуться к списку тренировок.
        </p>
        <Link className={styles.exitLink} href="/training">
          К тренировке
        </Link>
      </section>
    );
  }

  if (!session.currentExerciseView || !session.currentExercise) {
    return (
      <section className={styles.complete}>
        <h1 className={styles.completeTitle}>Задание недоступно</h1>
        <p className={styles.completeCopy}>Не удалось загрузить текущее упражнение сессии.</p>
        <Link className={styles.exitLink} href="/training">
          К тренировке
        </Link>
      </section>
    );
  }

  const positionLabel = `Задание ${session.progress.current} из ${session.progress.total}`;
  const completionLabel = `Выполнено заданий: ${session.progress.answeredCount} из ${session.progress.total}`;
  const inputsDisabled = session.hasAnsweredCurrent || session.isSubmitting;

  function submitAnswer() {
    if (session.canSubmit) {
      session.submit();
    }
  }

  function handleSessionKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) {
      return;
    }

    if (event.target instanceof HTMLTextAreaElement) {
      return;
    }

    if (event.target instanceof HTMLElement) {
      const role = event.target.getAttribute("role");
      if (role === "combobox" || role === "listbox" || role === "option") {
        return;
      }

      if (event.target.closest('[role="listbox"]')) {
        return;
      }
    }

    if (!isSingleLineTextField(event.target)) {
      return;
    }

    event.preventDefault();
    submitAnswer();
  }

  return (
    <div className={styles.sessionForm} onKeyDown={handleSessionKeyDown}>
      <TrainingShell
        actions={
          <div className={styles.actions}>
            {session.hasAnsweredCurrent ? (
              <Button onClick={session.next} type="button">
                Дальше
              </Button>
            ) : (
              <Button disabled={!session.canSubmit} onClick={submitAnswer} type="button">
                Ответить
              </Button>
            )}
          </div>
        }
        className={styles.shell}
      >
        <div className={styles.progressBlock}>
          <div className={styles.progressMeta}>
            <p className={styles.eyebrow}>Учебная сессия</p>
            <p aria-live="polite" className={styles.progressText}>
              {positionLabel}
            </p>
          </div>
          <ProgressBar
            label={completionLabel}
            max={session.progress.total}
            value={session.progress.answeredCount}
          />
        </div>

        <section aria-labelledby="training-prompt-heading" className={styles.promptSection}>
          <h2
            className={styles.promptHeading}
            id="training-prompt-heading"
            ref={promptHeadingRef}
            tabIndex={-1}
          >
            <ExerciseText text={session.currentExerciseView.prompt} />
          </h2>

          <ExerciseRenderer
            disabled={inputsDisabled}
            draft={session.draft}
            exercise={session.currentExerciseView}
            onChangeFillBlank={session.setFillBlankAnswer}
            onChangeFreeResponse={session.setFreeResponseAnswer}
            onChangeMatching={session.setMatchingPair}
            onSelectChoice={session.setChoiceOption}
          />
        </section>

        {session.currentAttempt ? <ExerciseFeedback attempt={session.currentAttempt} /> : null}
      </TrainingShell>
    </div>
  );
}
