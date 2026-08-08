import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { ExercisesEmptyState } from "@/components/feedback";
import { PageHeader } from "@/components/layout";
import {
  DEMO_TRAINING_MODULE_SLUG,
  DEMO_TRAINING_SESSION_ID,
  TrainingSession,
} from "@/features/training";
import {
  HONORIFICS_MODULE_SLUG,
  HONORIFICS_PREVIEW_SESSION_ID,
  exerciseRepository,
  learningModuleRegistry,
} from "@/modules";
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

export function generateStaticParams() {
  const params = [{ sessionId: DEMO_TRAINING_SESSION_ID }];

  if (process.env.NODE_ENV === "development") {
    params.push({ sessionId: HONORIFICS_PREVIEW_SESSION_ID });
  }

  return params;
}

function resolveSession(sessionId: string): {
  readonly sessionId: string;
  readonly moduleSlug: string;
  readonly description: ReactNode;
} | null {
  if (sessionId === DEMO_TRAINING_SESSION_ID) {
    return {
      sessionId: DEMO_TRAINING_SESSION_ID,
      moduleSlug: DEMO_TRAINING_MODULE_SLUG,
      description: "Отвечайте на задания по очереди. Прогресс считается локально в этой сессии.",
    };
  }

  const honorificsAvailable =
    learningModuleRegistry.getBySlug(HONORIFICS_MODULE_SLUG) !== undefined;

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
  const session = resolveSession(sessionId);

  if (!session) {
    notFound();
  }

  const exercises = exerciseRepository.list({ moduleSlug: session.moduleSlug });
  const learningModule = learningModuleRegistry.getBySlug(session.moduleSlug);

  if (exercises.length === 0) {
    return (
      <PageContainer className={styles.page} width="narrow">
        <PageHeader description="Для выбранной сессии сейчас нет заданий." title="Учебная сессия" />
        <ExercisesEmptyState />
      </PageContainer>
    );
  }

  return (
    <PageContainer className={styles.page} width="narrow">
      <PageHeader description={session.description} title="Учебная сессия" />
      <TrainingSession
        contentVersion={learningModule?.contentVersion ?? "1.0.0"}
        exercises={exercises}
        moduleSlug={session.moduleSlug}
        sessionId={session.sessionId}
        topics={learningModule?.topics ?? []}
      />
    </PageContainer>
  );
}
