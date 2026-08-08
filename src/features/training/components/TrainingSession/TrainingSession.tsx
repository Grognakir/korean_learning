"use client";

import Link from "next/link";
import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent } from "react";

import { Alert } from "@/components/feedback";
import { Button, ProgressBar } from "@/components/ui";
import { TrainingShell } from "@/wrappers";

import type { Exercise, TrainingSessionState } from "../../domain";
import {
  persistTrainingSessionState,
  usePersistedSessionBootstrap,
} from "../../hooks/usePersistedTrainingSession";
import {
  useTrainingSession,
  type UseTrainingSessionOptions,
  type UseTrainingSessionResult,
} from "../../hooks/useTrainingSession";
import { LocalTrainingSessionStore } from "../../persistence";
import type { ExerciseView } from "../../presentation";
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
  readonly contentVersion?: string;
  readonly now?: UseTrainingSessionOptions["now"];
  readonly createSubmissionId?: UseTrainingSessionOptions["createSubmissionId"];
  /** When false, skips localStorage (unit tests). Default true. */
  readonly persist?: boolean;
  readonly store?: LocalTrainingSessionStore;
};

function exerciseInstruction(exercise: ExerciseView): string | null {
  switch (exercise.type) {
    case "matching-translation":
    case "matching-honorific":
      return "Сопоставьте пары с помощью выпадающего списка.";
    case "meaning-choice":
    case "honorific-choice":
    case "plain-choice":
      return "Выберите один вариант";
    default:
      return null;
  }
}

function isSingleLineTextField(target: EventTarget | null): target is HTMLInputElement {
  return (
    target instanceof HTMLInputElement &&
    (target.type === "text" || target.type === "search" || target.type === "")
  );
}

function TrainingSessionView({
  notice,
  session,
}: {
  readonly notice: string | null;
  readonly session: UseTrainingSessionResult;
}) {
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
      <>
        {notice ? (
          <Alert className={styles.notice} title="Сохранение" tone="info">
            {notice}
          </Alert>
        ) : null}
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
      </>
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
  const instruction = exerciseInstruction(session.currentExerciseView);

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
      {notice ? (
        <Alert className={styles.notice} title="Сохранение" tone="info">
          {notice}
        </Alert>
      ) : null}
      <TrainingShell className={styles.shell}>
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
          <div className={styles.promptCopy}>
            <h2
              className={styles.promptHeading}
              id="training-prompt-heading"
              ref={promptHeadingRef}
              tabIndex={-1}
            >
              <ExerciseText text={session.currentExerciseView.prompt} />
            </h2>
            {instruction ? (
              <p className={styles.promptInstruction} id="training-exercise-instruction">
                {instruction}
              </p>
            ) : null}
          </div>

          <ExerciseRenderer
            disabled={inputsDisabled}
            draft={session.draft}
            exercise={session.currentExerciseView}
            onChangeFillBlank={session.setFillBlankAnswer}
            onChangeFreeResponse={session.setFreeResponseAnswer}
            onChangeMatching={session.setMatchingPair}
            onSelectChoice={session.setChoiceOption}
          />

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
        </section>

        {session.currentAttempt ? <ExerciseFeedback attempt={session.currentAttempt} /> : null}
      </TrainingShell>
    </div>
  );
}

function TrainingSessionRuntime({
  contentVersion,
  createSubmissionId,
  exercises,
  initialState,
  limit,
  moduleSlug,
  notice,
  now,
  persist,
  persistCreate,
  seed,
  sessionId,
  store,
}: TrainingSessionProps & {
  readonly initialState?: TrainingSessionState;
  readonly notice: string | null;
  readonly persistCreate: boolean;
}) {
  const storeRef = useRef(store ?? new LocalTrainingSessionStore());
  const didPersistCreate = useRef(false);

  const session = useTrainingSession({
    exercises,
    ...(sessionId === undefined ? {} : { sessionId }),
    ...(moduleSlug === undefined ? {} : { moduleSlug }),
    ...(seed === undefined ? {} : { seed }),
    ...(limit === undefined ? {} : { limit }),
    ...(contentVersion === undefined ? {} : { contentVersion }),
    ...(now === undefined ? {} : { now }),
    ...(createSubmissionId === undefined ? {} : { createSubmissionId }),
    ...(initialState ? { initialState } : {}),
    ...(persist
      ? {
          onStateChange: (state: TrainingSessionState) => {
            persistTrainingSessionState(state, storeRef.current);
          },
        }
      : {}),
  });

  useEffect(() => {
    if (!persist || !persistCreate || didPersistCreate.current) {
      return;
    }

    didPersistCreate.current = true;
    persistTrainingSessionState(session.state, storeRef.current);
  }, [persist, persistCreate, session.state]);

  return <TrainingSessionView notice={notice} session={session} />;
}

export function TrainingSession({
  contentVersion,
  createSubmissionId,
  exercises,
  limit,
  moduleSlug,
  now,
  persist = true,
  seed,
  sessionId,
  store,
}: TrainingSessionProps) {
  const bootstrap = usePersistedSessionBootstrap({
    persist,
    ...(sessionId === undefined ? {} : { sessionId }),
    ...(moduleSlug === undefined ? {} : { moduleSlug }),
    ...(contentVersion === undefined ? {} : { contentVersion }),
    ...(store === undefined ? {} : { store }),
  });

  if (bootstrap.status === "pending") {
    return (
      <p aria-busy="true" className={styles.loading}>
        Загрузка сессии…
      </p>
    );
  }

  return (
    <TrainingSessionRuntime
      exercises={exercises}
      notice={bootstrap.notice}
      persist={persist}
      persistCreate={bootstrap.persistCreate}
      {...(contentVersion === undefined ? {} : { contentVersion })}
      {...(createSubmissionId === undefined ? {} : { createSubmissionId })}
      {...(bootstrap.initialState === undefined ? {} : { initialState: bootstrap.initialState })}
      {...(limit === undefined ? {} : { limit })}
      {...(moduleSlug === undefined ? {} : { moduleSlug })}
      {...(now === undefined ? {} : { now })}
      {...(seed === undefined ? {} : { seed })}
      {...(sessionId === undefined ? {} : { sessionId })}
      {...(store === undefined ? {} : { store })}
    />
  );
}
