import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout";
import { DEMO_TRAINING_SESSION_ID, TrainingSession } from "@/features/training";
import { exerciseRepository } from "@/modules";
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

export default async function SessionPage({ params }: SessionPageProps) {
  const { sessionId } = await params;

  if (sessionId !== DEMO_TRAINING_SESSION_ID) {
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
            <Link className={styles.primaryAction} href="/training/demo-session">
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

  const exercises = exerciseRepository.list({ moduleSlug: "sample-module" });

  return (
    <PageContainer className={styles.page} width="narrow">
      <PageHeader
        description="Отвечайте на задания по очереди. Прогресс считается локально в этой сессии."
        eyebrow="Сессия"
        title="Учебная сессия"
      />
      <TrainingSession exercises={exercises} sessionId={DEMO_TRAINING_SESSION_ID} />
    </PageContainer>
  );
}
