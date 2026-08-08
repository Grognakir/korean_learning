"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

import { Alert } from "@/components/feedback";
import { Button, ProgressBar } from "@/components/ui";
import type { LearningTopicDefinition } from "@/types";
import { TrainingShell } from "@/wrappers";

import type { Exercise, TrainingSessionState } from "../../domain";
import {
  buildTrainingResultSnapshot,
  createMistakeRetrySessionConfig,
  createTrainingSession,
} from "../../domain";
import {
  persistTrainingSessionState,
  usePersistedSessionBootstrap,
} from "../../hooks/usePersistedTrainingSession";
import { useTrainingSession, type UseTrainingSessionOptions } from "../../hooks/useTrainingSession";
import { LocalTrainingSessionStore } from "../../persistence";
import type { ExerciseView } from "../../presentation";
import { ExerciseFeedback } from "../ExerciseFeedback";
import { ExerciseRenderer } from "../ExerciseRenderer";
import { ExerciseText } from "../ExerciseText";
import { TrainingResult } from "../TrainingResult";

import styles from "./TrainingSession.module.css";

export type TrainingSessionProps = {
  readonly exercises: readonly Exercise[];
  readonly sessionId?: string;
  readonly moduleSlug?: string;
  readonly seed?: number;
  readonly limit?: number;
  readonly contentVersion?: string;
  readonly topics?: readonly LearningTopicDefinition[];
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

function TrainingSessionRuntime({
  contentVersion,
  createSubmissionId,
  exercises,
  initialState,
  limit,
  moduleSlug,
  notice,
  now,
  onRetryMistakes,
  persist,
  persistCreate,
  seed,
  sessionId,
  store,
  topics,
}: TrainingSessionProps & {
  readonly contentVersion: string;
  readonly initialState?: TrainingSessionState;
  readonly moduleSlug: string;
  readonly notice: string | null;
  readonly onRetryMistakes: (mistakeExerciseIds: readonly string[]) => void;
  readonly persistCreate: boolean;
  readonly store: LocalTrainingSessionStore;
  readonly topics: readonly LearningTopicDefinition[];
}) {
  const didPersistCreate = useRef(false);
  const didClearActiveSession = useRef(false);
  const promptHeadingRef = useRef<HTMLHeadingElement>(null);
  const previousExerciseIdRef = useRef<string | null>(null);

  const exercisesById = useMemo(
    () => new Map(exercises.map((exercise) => [exercise.id, exercise])),
    [exercises],
  );

  const session = useTrainingSession({
    exercises,
    ...(sessionId === undefined ? {} : { sessionId }),
    moduleSlug,
    ...(seed === undefined ? {} : { seed }),
    ...(limit === undefined ? {} : { limit }),
    contentVersion,
    ...(now === undefined ? {} : { now }),
    ...(createSubmissionId === undefined ? {} : { createSubmissionId }),
    ...(initialState ? { initialState } : {}),
    ...(persist
      ? {
          onStateChange: (state: TrainingSessionState) => {
            persistTrainingSessionState(state, store);
          },
        }
      : {}),
  });

  useEffect(() => {
    if (!persist || !persistCreate || didPersistCreate.current) {
      return;
    }

    didPersistCreate.current = true;
    persistTrainingSessionState(session.state, store);
  }, [persist, persistCreate, session.state, store]);

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

  useEffect(() => {
    if (!session.isCompleted || !persist || didClearActiveSession.current) {
      return;
    }

    didClearActiveSession.current = true;
    store.clear();
  }, [persist, session.isCompleted, store]);

  if (session.isCompleted) {
    const snapshot = buildTrainingResultSnapshot(session.state, exercisesById, { topics });

    return (
      <>
        {notice ? (
          <Alert className={styles.notice} title="Сохранение" tone="info">
            {notice}
          </Alert>
        ) : null}
        <TrainingResult
          onRetryMistakes={() => onRetryMistakes(snapshot.mistakeExerciseIds)}
          snapshot={snapshot}
        />
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

export function TrainingSession({
  contentVersion = "1.0.0",
  createSubmissionId,
  exercises,
  limit,
  moduleSlug = "sample-module",
  now,
  persist = true,
  seed,
  sessionId,
  store: storeProp,
  topics = [],
}: TrainingSessionProps) {
  const [fallbackStore] = useState(() => new LocalTrainingSessionStore());
  const store = storeProp ?? fallbackStore;
  const clock = now ?? (() => new Date().toISOString());

  const [runtimeKey, setRuntimeKey] = useState(0);
  const [forcedInitialState, setForcedInitialState] = useState<TrainingSessionState | null>(null);
  const [skipBootstrap, setSkipBootstrap] = useState(false);

  const bootstrap = usePersistedSessionBootstrap({
    persist: persist && !skipBootstrap,
    ...(sessionId === undefined ? {} : { sessionId }),
    moduleSlug,
    contentVersion,
    store,
  });

  function handleRetryMistakes(mistakeExerciseIds: readonly string[]) {
    if (mistakeExerciseIds.length === 0) {
      return;
    }

    store.clear();
    const retryState = createTrainingSession(
      createMistakeRetrySessionConfig({
        sessionId: `${sessionId ?? "session"}-retry-${runtimeKey + 1}`,
        moduleSlug,
        mistakeExerciseIds,
        contentVersion,
        startedAt: clock(),
      }),
    );

    setForcedInitialState(retryState);
    setSkipBootstrap(true);
    setRuntimeKey((value) => value + 1);
  }

  if (!skipBootstrap && bootstrap.status === "pending") {
    return (
      <p aria-busy="true" className={styles.loading}>
        Загрузка сессии…
      </p>
    );
  }

  const readyBootstrap = bootstrap.status === "ready" ? bootstrap : null;
  const initialState = forcedInitialState ?? readyBootstrap?.initialState;
  const notice = skipBootstrap ? null : (readyBootstrap?.notice ?? null);
  const persistCreate = skipBootstrap ? true : (readyBootstrap?.persistCreate ?? false);

  return (
    <TrainingSessionRuntime
      key={runtimeKey}
      contentVersion={contentVersion}
      exercises={exercises}
      moduleSlug={moduleSlug}
      notice={notice}
      onRetryMistakes={handleRetryMistakes}
      persist={persist}
      persistCreate={persistCreate}
      store={store}
      topics={topics}
      {...(createSubmissionId === undefined ? {} : { createSubmissionId })}
      {...(initialState === undefined ? {} : { initialState })}
      {...(limit === undefined ? {} : { limit })}
      {...(now === undefined ? {} : { now })}
      {...(seed === undefined ? {} : { seed })}
      {...(sessionId === undefined ? {} : { sessionId })}
    />
  );
}
