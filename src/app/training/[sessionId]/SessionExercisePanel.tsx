import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { ExercisesEmptyState, ServiceUnavailableState } from "@/components/feedback";
import { PageHeader } from "@/components/layout";
import { getServerAuthUser } from "@/features/authentication/server/getServerAuthUser";
import { evaluateTrainingSubmissionAction } from "@/features/training/actions/evaluateTrainingSubmissionAction";
import { TrainingSession } from "@/features/training/components/TrainingSession";
import { toPublicExercises } from "@/features/training/presentation";
import {
  DEMO_TRAINING_MODULE_SLUG,
  DEMO_TRAINING_SEED,
  DEMO_TRAINING_SESSION_ID,
} from "@/features/training/sessionConstants";
import {
  getCachedExercisesByModuleSlug,
  getCachedPublishedModuleBySlug,
} from "@/modules/cachedLearningContent";
import { HONORIFICS_MODULE_SLUG, HONORIFICS_PREVIEW_SESSION_ID } from "@/modules";

export type ResolvedSession = {
  readonly sessionId: string;
  readonly moduleSlug: string;
  readonly description: ReactNode;
};

export type SessionResolution =
  | { readonly status: "ready"; readonly session: ResolvedSession }
  | { readonly status: "unknown" }
  | { readonly status: "unavailable" };

export async function resolveSession(sessionId: string): Promise<SessionResolution> {
  if (sessionId === DEMO_TRAINING_SESSION_ID) {
    return {
      status: "ready",
      session: {
        sessionId: DEMO_TRAINING_SESSION_ID,
        moduleSlug: DEMO_TRAINING_MODULE_SLUG,
        description: "Отвечайте на задания по очереди. Прогресс считается локально в этой сессии.",
      },
    };
  }

  if (sessionId !== HONORIFICS_PREVIEW_SESSION_ID) {
    return { status: "unknown" };
  }

  const honorifics = await getCachedPublishedModuleBySlug(HONORIFICS_MODULE_SLUG);

  if (honorifics.status === "unavailable") {
    return { status: "unavailable" };
  }

  if (!honorifics.data) {
    return { status: "unknown" };
  }

  return {
    status: "ready",
    session: {
      sessionId: HONORIFICS_PREVIEW_SESSION_ID,
      moduleSlug: HONORIFICS_MODULE_SLUG,
      description: (
        <>
          Черновой preview <span lang="ko">높임말</span>. Контент не утверждён — сессия нужна только
          для проверки общего UI.
        </>
      ),
    },
  };
}

type SessionExercisePanelProps = {
  readonly session: ResolvedSession;
};

export async function SessionExercisePanel({ session }: SessionExercisePanelProps) {
  const [exercises, module, user] = await Promise.all([
    getCachedExercisesByModuleSlug(session.moduleSlug),
    getCachedPublishedModuleBySlug(session.moduleSlug),
    getServerAuthUser(),
  ]);

  if (exercises.status === "unavailable" || module.status === "unavailable") {
    return (
      <>
        <PageHeader description="Не удалось загрузить задания сессии." title="Учебная сессия" />
        <ServiceUnavailableState />
      </>
    );
  }

  const learningModule = module.data;
  const publicExercises = toPublicExercises(exercises.data, { seed: DEMO_TRAINING_SEED });

  if (publicExercises.length === 0) {
    return (
      <>
        <PageHeader description="Для выбранной сессии сейчас нет заданий." title="Учебная сессия" />
        <ExercisesEmptyState />
      </>
    );
  }

  return (
    <>
      <PageHeader description={session.description} title="Учебная сессия" />
      <TrainingSession
        {...(user && learningModule
          ? {
              cloudPersistence: {
                moduleId: learningModule.id,
                clientSessionKey: session.sessionId,
                contentVersion: learningModule.contentVersion,
                exerciseIds: publicExercises.map((exercise) => exercise.id),
                randomSeed: String(DEMO_TRAINING_SEED),
              },
            }
          : {})}
        contentVersion={learningModule?.contentVersion ?? "1.0.0"}
        evaluateSubmission={evaluateTrainingSubmissionAction}
        moduleSlug={session.moduleSlug}
        publicExercises={publicExercises}
        seed={DEMO_TRAINING_SEED}
        sessionId={session.sessionId}
        topics={learningModule?.topics ?? []}
      />
    </>
  );
}

export async function SessionPageContent({ sessionId }: { readonly sessionId: string }) {
  const resolution = await resolveSession(sessionId);

  if (resolution.status === "unavailable") {
    return (
      <>
        <PageHeader description="Не удалось загрузить сессию." title="Учебная сессия" />
        <ServiceUnavailableState />
      </>
    );
  }

  if (resolution.status === "unknown") {
    notFound();
  }

  return <SessionExercisePanel session={resolution.session} />;
}
