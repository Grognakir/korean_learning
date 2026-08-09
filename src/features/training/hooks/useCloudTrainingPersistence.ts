"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { SubmitTrainingAttemptRequest } from "../api/schemas";
import type { AnswerEvaluation, TrainingSessionMode } from "../domain";
import type { EvaluateSubmissionFn } from "../testing/createLocalEvaluateSubmission";
import {
  completeTrainingSession,
  createTrainingSession,
  submitTrainingAttempt,
} from "../client/trainingApiClient";

export type CloudTrainingPersistenceConfig = {
  readonly moduleId: string;
  readonly clientSessionKey: string;
  readonly contentVersion: string;
  readonly exerciseIds: readonly string[];
  readonly mode?: TrainingSessionMode;
  readonly randomSeed: string;
};

export type CloudSyncStatus = "idle" | "starting" | "ready" | "syncing" | "saved" | "error";

export type UseCloudTrainingPersistenceResult = {
  readonly serverSessionId: string | null;
  readonly syncStatus: CloudSyncStatus;
  readonly syncMessage: string | null;
  readonly evaluateSubmission: EvaluateSubmissionFn;
  readonly retryStart: () => void;
  readonly completeSession: (completedAt: string) => Promise<void>;
};

export function useCloudTrainingPersistence(
  config: CloudTrainingPersistenceConfig | undefined,
): UseCloudTrainingPersistenceResult {
  const [serverSessionId, setServerSessionId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>(() =>
    config ? "starting" : "idle",
  );
  const [syncMessage, setSyncMessage] = useState<string | null>(() =>
    config ? "Подключение к серверу…" : null,
  );
  const startAttemptRef = useRef(0);
  const completionSentRef = useRef(false);

  const startSession = useCallback(() => {
    if (!config) {
      return;
    }

    const attemptId = startAttemptRef.current + 1;
    startAttemptRef.current = attemptId;
    setSyncStatus("starting");
    setSyncMessage("Подключение к серверу…");

    void createTrainingSession({
      moduleId: config.moduleId,
      mode: config.mode ?? "practice",
      contentVersion: config.contentVersion,
      exerciseIds: [...config.exerciseIds],
      idempotencyKey: `start:${config.clientSessionKey}`,
      randomSeed: config.randomSeed,
    })
      .then((session) => {
        if (startAttemptRef.current !== attemptId) {
          return;
        }

        setServerSessionId(session.sessionId);
        setSyncStatus("ready");
        setSyncMessage(null);
      })
      .catch((error) => {
        if (startAttemptRef.current !== attemptId) {
          return;
        }

        setSyncStatus("error");
        setSyncMessage(
          error instanceof Error
            ? error.message
            : "Не удалось создать серверную сессию. Повторите попытку.",
        );
      });
  }, [config]);

  useEffect(() => {
    if (!config) {
      return;
    }

    const attemptId = startAttemptRef.current + 1;
    startAttemptRef.current = attemptId;
    let cancelled = false;

    void createTrainingSession({
      moduleId: config.moduleId,
      mode: config.mode ?? "practice",
      contentVersion: config.contentVersion,
      exerciseIds: [...config.exerciseIds],
      idempotencyKey: `start:${config.clientSessionKey}`,
      randomSeed: config.randomSeed,
    })
      .then((session) => {
        if (cancelled || startAttemptRef.current !== attemptId) {
          return;
        }

        setServerSessionId(session.sessionId);
        setSyncStatus("ready");
        setSyncMessage(null);
      })
      .catch((error) => {
        if (cancelled || startAttemptRef.current !== attemptId) {
          return;
        }

        setSyncStatus("error");
        setSyncMessage(
          error instanceof Error
            ? error.message
            : "Не удалось создать серверную сессию. Повторите попытку.",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [config]);

  const evaluateSubmission = useCallback<EvaluateSubmissionFn>(
    async ({ exerciseId, contentVersion, submission, submissionId }) => {
      if (!config || !serverSessionId) {
        throw new Error("Server session is not ready.");
      }

      if (!submissionId) {
        throw new Error("Submission id is required for cloud persistence.");
      }

      setSyncStatus("syncing");
      setSyncMessage("Сохранение ответа…");

      try {
        const result = await submitTrainingAttempt(serverSessionId, {
          exerciseId,
          contentVersion,
          idempotencyKey: submissionId,
          submission: submission as SubmitTrainingAttemptRequest["submission"],
        });

        setSyncStatus("saved");
        setSyncMessage(null);
        return result.evaluation as AnswerEvaluation;
      } catch (error) {
        setSyncStatus("error");
        setSyncMessage(
          error instanceof Error ? error.message : "Не удалось сохранить ответ. Повторите попытку.",
        );
        throw error;
      }
    },
    [config, serverSessionId],
  );

  const completeSession = useCallback(
    async (completedAt: string) => {
      if (!config || !serverSessionId || completionSentRef.current) {
        return;
      }

      completionSentRef.current = true;
      setSyncStatus("syncing");
      setSyncMessage("Завершение сессии…");

      try {
        await completeTrainingSession(serverSessionId, {
          idempotencyKey: `complete:${config.clientSessionKey}`,
          completedAt,
        });
        setSyncStatus("saved");
        setSyncMessage(null);
      } catch (error) {
        completionSentRef.current = false;
        setSyncStatus("error");
        setSyncMessage(
          error instanceof Error
            ? error.message
            : "Не удалось завершить сессию. Повторите попытку.",
        );
        throw error;
      }
    },
    [config, serverSessionId],
  );

  return {
    serverSessionId: config ? serverSessionId : null,
    syncStatus: config ? syncStatus : "idle",
    syncMessage: config ? syncMessage : null,
    evaluateSubmission,
    retryStart: () => {
      startSession();
    },
    completeSession,
  };
}
