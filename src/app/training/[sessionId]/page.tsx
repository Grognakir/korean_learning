import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { ExercisesEmptyState, ServiceUnavailableState } from "@/components/feedback";
import { PageHeader } from "@/components/layout";
import { evaluateTrainingSubmissionAction } from "@/features/training/actions/evaluateTrainingSubmissionAction";
import { TrainingSession } from "@/features/training/components/TrainingSession";
import { getServerAuthUser } from "@/features/authentication/server/getServerAuthUser";
import { toPublicExercises, type PublicExercise } from "@/features/training/presentation";
import {
  DEMO_TRAINING_MODULE_SLUG,
  DEMO_TRAINING_SEED,
  DEMO_TRAINING_SESSION_ID,
} from "@/features/training/sessionConstants";
import {
  getExerciseContent,
  getModuleContent,
  HONORIFICS_MODULE_SLUG,
  HONORIFICS_PREVIEW_SESSION_ID,
  LearningContentError,
} from "@/modules";
import type { LearningModuleDefinition, LearningTopicDefinition } from "@/types";
import { PageContainer } from "@/wrappers";

import styles from "./page.module.css";

type SessionPageProps = {
  params: Promise<{ sessionId: string }>;
};

export const metadata: Metadata = {
  title: "Учебная сессия",
  description: "Короткая учебная сессия с локальным прогрессом и проверкой ответов.",
};

/** Unknown session ids must 404 at the routing layer (avoids soft-200 under streaming). */
export const dynamicParams = false;

export async function generateStaticParams() {
  const params = [{ sessionId: DEMO_TRAINING_SESSION_ID }];

  if (process.env.NODE_ENV === "development") {
    params.push({ sessionId: HONORIFICS_PREVIEW_SESSION_ID });
  }

  return params;
}

async function resolveSession(sessionId: string): Promise<{
  readonly sessionId: string;
  readonly moduleSlug: string;
  readonly description: ReactNode;
} | null> {
  const { moduleRepository } = await getModuleContent();

  if (sessionId === DEMO_TRAINING_SESSION_ID) {
    return {
      sessionId: DEMO_TRAINING_SESSION_ID,
      moduleSlug: DEMO_TRAINING_MODULE_SLUG,
      description: "Отвечайте на задания по очереди. Прогресс считается локально в этой сессии.",
    };
  }

  const honorificsAvailable =
    (await moduleRepository.getBySlug(HONORIFICS_MODULE_SLUG)) !== undefined;

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

export default async function SessionPage({ params }: SessionPageProps) {
  const { sessionId } = await params;

  let session: Awaited<ReturnType<typeof resolveSession>> | undefined;
  let publicExercises: readonly PublicExercise[] | null = null;
  let learningModule: LearningModuleDefinition | undefined;
  let topics: readonly LearningTopicDefinition[] = [];

  try {
    session = await resolveSession(sessionId);

    if (!session) {
      notFound();
    }

    const [{ exerciseRepository }, { moduleRepository }] = await Promise.all([
      getExerciseContent(),
      getModuleContent(),
    ]);
    const [exercises, module] = await Promise.all([
      exerciseRepository.list({ moduleSlug: session.moduleSlug }),
      moduleRepository.getBySlug(session.moduleSlug),
    ]);
    learningModule = module;
    publicExercises = toPublicExercises(exercises, { seed: DEMO_TRAINING_SEED });
    topics = learningModule?.topics ?? [];
  } catch (error) {
    if (error instanceof LearningContentError) {
      return (
        <PageContainer className={styles.page} width="narrow">
          <PageHeader description="Не удалось загрузить задания сессии." title="Учебная сессия" />
          <ServiceUnavailableState />
        </PageContainer>
      );
    }

    throw error;
  }

  if (!session || publicExercises === null) {
    notFound();
  }

  if (publicExercises.length === 0) {
    return (
      <PageContainer className={styles.page} width="narrow">
        <PageHeader description="Для выбранной сессии сейчас нет заданий." title="Учебная сессия" />
        <ExercisesEmptyState />
      </PageContainer>
    );
  }

  const user = await getServerAuthUser();

  return (
    <PageContainer className={styles.page} width="narrow">
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
        topics={topics}
      />
    </PageContainer>
  );
}
