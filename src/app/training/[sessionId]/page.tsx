import type { Metadata } from "next";
import Link from "next/link";

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
};

export function generateStaticParams() {
  return [{ sessionId: DEMO_TRAINING_SESSION_ID }];
}

function resolveSession(sessionId: string) {
  if (sessionId === DEMO_TRAINING_SESSION_ID) {
    return {
      sessionId: DEMO_TRAINING_SESSION_ID,
      moduleSlug: DEMO_TRAINING_MODULE_SLUG,
      description: "Отвечайте на задания по очереди. Прогресс считается локально в этой сессии.",
    } as const;
  }

  const honorificsAvailable =
    learningModuleRegistry.getBySlug(HONORIFICS_MODULE_SLUG) !== undefined;

  if (sessionId === HONORIFICS_PREVIEW_SESSION_ID && honorificsAvailable) {
    return {
      sessionId: HONORIFICS_PREVIEW_SESSION_ID,
      moduleSlug: HONORIFICS_MODULE_SLUG,
      description:
        "Draft preview 높임말. Контент не утверждён — сессия нужна только для проверки общего UI.",
    } as const;
  }

  return null;
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { sessionId } = await params;
  const session = resolveSession(sessionId);

  if (!session) {
    return (
      <PageContainer className={styles.page} width="narrow">
        <PageHeader
          description="Сейчас доступна только локальная демо-сессия."
          eyebrow="Сессия"
          title="Сессия не найдена"
        />
        <section className={styles.missing}>
          <p>
            Идентификатор <code>{sessionId}</code> не поддерживается. Откройте демо-сессию или
            вернитесь к списку тренировок.
          </p>
          <div className={styles.missingActions}>
            <Link className={styles.primaryAction} href={`/training/${DEMO_TRAINING_SESSION_ID}`}>
              Открыть демо-сессию
            </Link>
            <Link className={styles.secondaryAction} href="/training">
              К тренировке
            </Link>
          </div>
        </section>
      </PageContainer>
    );
  }

  const exercises = exerciseRepository.list({ moduleSlug: session.moduleSlug });

  return (
    <PageContainer className={styles.page} width="narrow">
      <PageHeader description={session.description} eyebrow="Сессия" title="Учебная сессия" />
      <TrainingSession
        exercises={exercises}
        moduleSlug={session.moduleSlug}
        sessionId={session.sessionId}
      />
    </PageContainer>
  );
}
