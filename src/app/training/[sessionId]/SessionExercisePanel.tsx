import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { ExercisesEmptyState, ServiceUnavailableState } from "@/components/feedback";
import { PageHeader } from "@/components/layout";
import type { AuthUser } from "@/features/authentication/domain/types";
import { getServerAuthUser } from "@/features/authentication/server/getServerAuthUser";
import { evaluateTrainingSubmissionAction } from "@/features/training/actions/evaluateTrainingSubmissionAction";
import { TrainingSession } from "@/features/training/components/TrainingSession";
import { toPublicExercises } from "@/features/training/presentation";
import type { PublicExercise } from "@/features/training/presentation";
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
import { LearningContentError } from "@/modules/resolveLearningContent";
import type { LearningModuleDefinition } from "@/types";

export type ResolvedSession = {
  readonly sessionId: string;
  readonly moduleSlug: string;
  readonly description: ReactNode;
};

export async function resolveSession(sessionId: string): Promise<ResolvedSession | null> {
  if (sessionId === DEMO_TRAINING_SESSION_ID) {
    return {
      sessionId: DEMO_TRAINING_SESSION_ID,
      moduleSlug: DEMO_TRAINING_MODULE_SLUG,
      description: "Отвечайте на задания по очереди. Прогресс считается локально в этой сессии.",
    };
  }

  const honorificsAvailable =
    (await getCachedPublishedModuleBySlug(HONORIFICS_MODULE_SLUG)) !== undefined;

  if (sessionId === HONORIFICS_PREVIEW_SESSION_ID && honorificsAvailable) {
    return {
      sessionId: HONORIFICS_PREVIEW_SESSION_ID,
      moduleSlug: HONORIFICS_MODULE_SLUG,
      description: (
        <>
          Черновой preview <span lang="ko">높임말</span>. Контент не утверждён — сессия нужна только
          для проверки общего UI.
        </>
      ),
    };
  }

  return null;
}

type SessionExercisePanelProps = {
  readonly session: ResolvedSession;
};

type SessionExerciseData = {
  readonly publicExercises: readonly PublicExercise[];
  readonly learningModule: LearningModuleDefinition | undefined;
  readonly user: AuthUser | null;
};

async function loadSessionExerciseData(session: ResolvedSession): Promise<SessionExerciseData> {
  const [exercises, learningModule, user] = await Promise.all([
    getCachedExercisesByModuleSlug(session.moduleSlug),
    getCachedPublishedModuleBySlug(session.moduleSlug),
    getServerAuthUser(),
  ]);

  return {
    publicExercises: toPublicExercises(exercises, {
      seed: DEMO_TRAINING_SEED,
    }),
    learningModule,
    user,
  };
}

export async function SessionExercisePanel({ session }: SessionExercisePanelProps) {
  let data: SessionExerciseData;

  try {
    data = await loadSessionExerciseData(session);
  } catch (error) {
    if (error instanceof LearningContentError) {
      return (
        <>
          <PageHeader description="Не удалось загрузить задания сессии." title="Учебная сессия" />
          <ServiceUnavailableState />
        </>
      );
    }

    throw error;
  }

  const { publicExercises, learningModule, user } = data;

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
  const session = await resolveSession(sessionId);

  if (!session) {
    notFound();
  }

  return <SessionExercisePanel session={session} />;
}
