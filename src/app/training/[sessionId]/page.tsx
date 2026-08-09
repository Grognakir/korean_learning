import type { Metadata } from "next";
import { Suspense } from "react";

import { CatalogSectionSkeleton } from "@/components/feedback";
import { DEMO_TRAINING_SEED } from "@/features/training/sessionConstants";
import { buildFilteredSessionId } from "@/features/training/setup/filteredSessionId";
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
  return [
    {
      sessionId: buildFilteredSessionId({
        request: {
          skill: "grammar",
          unitSlug: "u01",
          grammarTopicId: "grammar.u01.n01",
          difficulty: null,
          sessionSize: 2,
        },
        seed: DEMO_TRAINING_SEED,
      }),
    },
  ];
}

async function SessionRouteContent({ params }: SessionPageProps) {
  const { sessionId } = await params;

  return <SessionPageContent sessionId={sessionId} />;
}

export default function SessionPage({ params }: SessionPageProps) {
  return (
    <PageContainer className={styles.page} width="narrow">
      <Suspense fallback={<CatalogSectionSkeleton label="Загрузка упражнения…" />}>
        <SessionRouteContent params={params} />
      </Suspense>
    </PageContainer>
  );
}
