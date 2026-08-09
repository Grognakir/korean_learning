import type { Metadata } from "next";
import { Suspense } from "react";

import { CatalogSectionSkeleton } from "@/components/feedback";
import { DEMO_TRAINING_SESSION_ID } from "@/features/training/sessionConstants";
import { PageContainer } from "@/wrappers";

import { SessionPageContent } from "./SessionExercisePanel";
import styles from "./page.module.css";

type SessionPageProps = {
  params: Promise<{ sessionId: string }>;
};

export const metadata: Metadata = {
  title: "Учебная сессия",
  description: "Короткая учебная сессия с локальным прогрессом и проверкой ответов.",
};

export async function generateStaticParams() {
  return [{ sessionId: DEMO_TRAINING_SESSION_ID }];
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { sessionId } = await params;

  return (
    <PageContainer className={styles.page} width="narrow">
      <Suspense fallback={<CatalogSectionSkeleton label="Загрузка упражнения…" />}>
        <SessionPageContent sessionId={sessionId} />
      </Suspense>
    </PageContainer>
  );
}
