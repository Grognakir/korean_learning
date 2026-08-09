"use client";

import { useMemo, useState } from "react";

import type {
  AnswerSubmission,
  TrainingAttemptSnapshot,
  TrainingSessionProgress,
  TrainingSessionResultSummary,
  TrainingSessionState,
} from "../domain";
import {
  createTrainingSession,
  selectCurrentAttempt,
  selectCurrentExerciseId,
  selectHasAnsweredCurrent,
  selectProgress,
  selectResultSummary,
  submitTrainingAnswer,
  trainingSessionReducer,
} from "../domain";
import type { PublicExercise } from "../presentation";
import type { EvaluateSubmissionFn } from "../testing/createLocalEvaluateSubmission";
import {
  DEMO_TRAINING_MODULE_SLUG,
  DEMO_TRAINING_SEED,
  DEMO_TRAINING_SESSION_ID,
} from "../sessionConstants";

export {
  DEMO_TRAINING_MODULE_SLUG,
  DEMO_TRAINING_SEED,
  DEMO_TRAINING_SESSION_ID,
} from "../sessionConstants";

export type ChoiceAnswerDraft = {
  readonly kind: "choice";
  readonly optionId: string | null;
};

export type FreeResponseAnswerDraft = {
  readonly kind: "free-response";
  readonly answer: string;
};

export type FillBlankAnswerDraft = {
  readonly kind: "fill-blank";
  readonly answers: Readonly<Record<string, string>>;
};

export type MatchingAnswerDraft = {
  readonly kind: "matching";
  readonly matches: Readonly<Record<string, string>>;
};

export type AnswerDraft =
  ChoiceAnswerDraft | FreeResponseAnswerDraft | FillBlankAnswerDraft | MatchingAnswerDraft;

export type UseTrainingSessionOptions = {
  readonly publicExercises: readonly PublicExercise[];
  readonly evaluateSubmission: EvaluateSubmissionFn;
  readonly sessionId?: string;
  readonly moduleSlug?: string;
  readonly mode?: "practice" | "review";
  readonly seed?: number;
  readonly limit?: number;
  readonly contentVersion?: string;
  readonly now?: () => string;
  readonly createSubmissionId?: () => string;
  readonly initialState?: TrainingSessionState;
  readonly onStateChange?: (state: TrainingSessionState) => void;
};

export type UseTrainingSessionResult = {
  readonly state: TrainingSessionState;
  readonly currentExercise: PublicExercise | null;
  readonly currentExerciseView: PublicExercise | null;
  readonly currentExerciseId: string | null;
  readonly progress: TrainingSessionProgress;
  readonly hasAnsweredCurrent: boolean;
  readonly currentAttempt: TrainingAttemptSnapshot | null;
  readonly resultSummary: TrainingSessionResultSummary;
  readonly isCompleted: boolean;
  readonly isSubmitting: boolean;
  readonly draft: AnswerDraft | null;
  readonly canSubmit: boolean;
  readonly setChoiceOption: (optionId: string) => void;
  readonly setFreeResponseAnswer: (answer: string) => void;
  readonly setFillBlankAnswer: (blankId: string, answer: string) => void;
  readonly setMatchingPair: (leftPairId: string, rightPairId: string) => void;
  readonly submit: () => Promise<void>;
  readonly next: () => void;
};

function selectCurrentPublicExercise(
  state: TrainingSessionState,
  exercisesById: ReadonlyMap<string, PublicExercise>,
): PublicExercise | null {
  const exerciseId = selectCurrentExerciseId(state);
  if (!exerciseId) {
    return null;
  }

  return exercisesById.get(exerciseId) ?? null;
}

function createInitialDraft(exercise: PublicExercise | null): AnswerDraft | null {
  if (!exercise) {
    return null;
  }

  switch (exercise.type) {
    case "free-response":
      return { kind: "free-response", answer: "" };
    case "meaning-choice":
    case "honorific-choice":
    case "plain-choice":
      return { kind: "choice", optionId: null };
    case "fill-blank":
      return {
        kind: "fill-blank",
        answers: Object.fromEntries(exercise.blankIds.map((blankId) => [blankId, ""])),
      };
    case "matching-translation":
    case "matching-honorific":
      return {
        kind: "matching",
        matches: Object.fromEntries(exercise.leftItems.map((item) => [item.pairId, ""])),
      };
  }
}

function isDraftComplete(draft: AnswerDraft | null): boolean {
  if (!draft) {
    return false;
  }

  switch (draft.kind) {
    case "choice":
      return draft.optionId !== null && draft.optionId.length > 0;
    case "free-response":
      return draft.answer.trim().length > 0;
    case "fill-blank":
      return Object.values(draft.answers).every((answer) => answer.trim().length > 0);
    case "matching":
      return Object.values(draft.matches).every((rightPairId) => rightPairId.length > 0);
  }
}

function buildSubmission(exercise: PublicExercise, draft: AnswerDraft): AnswerSubmission | null {
  switch (exercise.type) {
    case "free-response": {
      if (draft.kind !== "free-response") {
        return null;
      }

      return {
        exerciseId: exercise.id,
        type: exercise.type,
        answer: draft.answer,
      };
    }
    case "meaning-choice":
    case "honorific-choice":
    case "plain-choice": {
      if (draft.kind !== "choice" || !draft.optionId) {
        return null;
      }

      return {
        exerciseId: exercise.id,
        type: exercise.type,
        optionId: draft.optionId,
      };
    }
    case "fill-blank": {
      if (draft.kind !== "fill-blank") {
        return null;
      }

      return {
        exerciseId: exercise.id,
        type: exercise.type,
        answers: exercise.blankIds.map((blankId) => ({
          blankId,
          answer: draft.answers[blankId] ?? "",
        })),
      };
    }
    case "matching-translation":
    case "matching-honorific": {
      if (draft.kind !== "matching") {
        return null;
      }

      return {
        exerciseId: exercise.id,
        type: exercise.type,
        matches: exercise.leftItems.map((item) => ({
          leftPairId: item.pairId,
          rightPairId: draft.matches[item.pairId] ?? "",
        })),
      };
    }
  }
}

function createSessionState(
  options: UseTrainingSessionOptions,
  now: () => string,
): TrainingSessionState {
  const exerciseIds = options.publicExercises.map((exercise) => exercise.id);
  const startedAt = now();

  return createTrainingSession({
    sessionId: options.sessionId ?? DEMO_TRAINING_SESSION_ID,
    moduleSlug: options.moduleSlug ?? DEMO_TRAINING_MODULE_SLUG,
    mode: options.mode ?? "practice",
    seed: options.seed ?? DEMO_TRAINING_SEED,
    exerciseIds,
    ...(options.limit === undefined ? {} : { limit: options.limit }),
    startedAt,
    contentSnapshot: {
      contentVersion: options.contentVersion ?? "1.0.0",
      exerciseIds,
    },
  });
}

export function useTrainingSession(options: UseTrainingSessionOptions): UseTrainingSessionResult {
  const now = options.now ?? (() => new Date().toISOString());
  const createSubmissionId = options.createSubmissionId ?? (() => crypto.randomUUID());
  const onStateChange = options.onStateChange;
  const contentVersion = options.contentVersion ?? "1.0.0";

  const exercisesById = useMemo(() => {
    return new Map(options.publicExercises.map((exercise) => [exercise.id, exercise]));
  }, [options.publicExercises]);

  const [state, setState] = useState(
    () => options.initialState ?? createSessionState(options, now),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const commitState = (updater: (currentState: TrainingSessionState) => TrainingSessionState) => {
    setState((currentState) => {
      const nextState = updater(currentState);
      if (nextState !== currentState) {
        onStateChange?.(nextState);
      }
      return nextState;
    });
  };

  const currentExerciseId = selectCurrentExerciseId(state);
  const currentExercise = selectCurrentPublicExercise(state, exercisesById);
  const hasAnsweredCurrent = selectHasAnsweredCurrent(state);
  const currentAttempt = selectCurrentAttempt(state);
  const progress = selectProgress(state);
  const resultSummary = selectResultSummary(state);
  const isCompleted = state.status === "completed";

  const [draftState, setDraftState] = useState<{
    readonly exerciseId: string | null;
    readonly draft: AnswerDraft | null;
  }>(() => ({
    exerciseId: currentExerciseId,
    draft: createInitialDraft(currentExercise),
  }));

  if (draftState.exerciseId !== currentExerciseId) {
    setDraftState({
      exerciseId: currentExerciseId,
      draft: createInitialDraft(currentExercise),
    });
  }

  const draft =
    draftState.exerciseId === currentExerciseId
      ? draftState.draft
      : createInitialDraft(currentExercise);

  const canSubmit =
    !isCompleted &&
    !isSubmitting &&
    !hasAnsweredCurrent &&
    currentExercise !== null &&
    isDraftComplete(draft);

  const replaceDraft = (nextDraft: AnswerDraft) => {
    setDraftState({
      exerciseId: currentExerciseId,
      draft: nextDraft,
    });
  };

  const setChoiceOption = (optionId: string) => {
    if (hasAnsweredCurrent || isSubmitting) {
      return;
    }

    replaceDraft({ kind: "choice", optionId });
  };

  const setFreeResponseAnswer = (answer: string) => {
    if (hasAnsweredCurrent || isSubmitting) {
      return;
    }

    replaceDraft({ kind: "free-response", answer });
  };

  const setFillBlankAnswer = (blankId: string, answer: string) => {
    if (hasAnsweredCurrent || isSubmitting || draft?.kind !== "fill-blank") {
      return;
    }

    replaceDraft({
      kind: "fill-blank",
      answers: {
        ...draft.answers,
        [blankId]: answer,
      },
    });
  };

  const setMatchingPair = (leftPairId: string, rightPairId: string) => {
    if (hasAnsweredCurrent || isSubmitting || draft?.kind !== "matching") {
      return;
    }

    replaceDraft({
      kind: "matching",
      matches: {
        ...draft.matches,
        [leftPairId]: rightPairId,
      },
    });
  };

  const submit = async () => {
    if (!canSubmit || !currentExercise || !draft) {
      return;
    }

    const submission = buildSubmission(currentExercise, draft);
    if (!submission) {
      return;
    }

    const submissionId = createSubmissionId();
    const occurredAt = now();

    setIsSubmitting(true);

    try {
      const evaluation = await options.evaluateSubmission({
        exerciseId: currentExercise.id,
        contentVersion,
        submission,
        submissionId,
      });

      commitState((currentState) => {
        if (selectHasAnsweredCurrent(currentState) || currentState.status !== "active") {
          return currentState;
        }

        return submitTrainingAnswer(currentState, {
          submission,
          evaluation,
          submissionId,
          occurredAt,
        });
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const next = () => {
    if (!hasAnsweredCurrent || isCompleted || isSubmitting) {
      return;
    }

    const occurredAt = now();

    commitState((currentState) => {
      if (!selectHasAnsweredCurrent(currentState) || currentState.status !== "active") {
        return currentState;
      }

      return trainingSessionReducer(currentState, {
        type: "next",
        occurredAt,
      });
    });
  };

  return {
    state,
    currentExercise,
    currentExerciseView: currentExercise,
    currentExerciseId,
    progress,
    hasAnsweredCurrent,
    currentAttempt,
    resultSummary,
    isCompleted,
    isSubmitting,
    draft,
    canSubmit,
    setChoiceOption,
    setFreeResponseAnswer,
    setFillBlankAnswer,
    setMatchingPair,
    submit,
    next,
  };
}
