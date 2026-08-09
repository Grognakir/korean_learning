import type { Metadata } from "next";
import { Suspense } from "react";

import { CatalogSectionSkeleton } from "@/components/feedback";
import { PageContainer } from "@/wrappers";

import { HONORIFICS_PREVIEW_SESSION_ID } from "@/modules";
import { DEMO_TRAINING_SESSION_ID } from "@/features/training/sessionConstants";

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
  const params = [{ sessionId: DEMO_TRAINING_SESSION_ID }];

  if (process.env.NODE_ENV === "development") {
    params.push({ sessionId: HONORIFICS_PREVIEW_SESSION_ID });
  }

  return params;
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
