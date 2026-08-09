import type { Metadata } from "next";
import Link from "next/link";

import { CatalogEmptyState, ServiceUnavailableState } from "@/components/feedback";
import { PageHeader } from "@/components/layout";
import { Badge } from "@/components/ui";
import { DEMO_TRAINING_SESSION_ID, ResumeTrainingPrompt } from "@/features/training";
import {
  getLearningContent,
  HONORIFICS_MODULE_SLUG,
  HONORIFICS_PREVIEW_SESSION_ID,
  LearningContentError,
} from "@/modules";
import type { LearningModuleDefinition } from "@/types";
import { PageContainer } from "@/wrappers";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Тренировка",
  description: "Короткая практика на локальных модулях с активным вспоминанием.",
};

export default async function TrainingPage() {
  let sampleModule: LearningModuleDefinition | undefined;
  let sampleExerciseCount = 0;
  let honorificsModule: LearningModuleDefinition | undefined;
  let honorificsExerciseCount = 0;

  try {
    const { moduleRepository, exerciseRepository } = await getLearningContent();
    sampleModule = await moduleRepository.getBySlug("sample-module");
    sampleExerciseCount = sampleModule
      ? (await exerciseRepository.list({ moduleSlug: "sample-module" })).length
      : 0;
    honorificsModule = await moduleRepository.getBySlug(HONORIFICS_MODULE_SLUG);
    honorificsExerciseCount = honorificsModule
      ? (await exerciseRepository.list({ moduleSlug: HONORIFICS_MODULE_SLUG })).length
      : 0;
  } catch (error) {
    if (error instanceof LearningContentError) {
      return (
        <PageContainer className={styles.page}>
          <PageHeader
            description="Не удалось загрузить модули для тренировки."
            title="Тренировка"
          />
          <ServiceUnavailableState />
        </PageContainer>
      );
    }

    throw error;
  }

  const hasModules = Boolean(sampleModule) || Boolean(honorificsModule);

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        description="Короткая практика на локальных модулях. Draft preview появляется только в development."
        title="Тренировка"
      />

      <ResumeTrainingPrompt />

      {!hasModules ? (
        <CatalogEmptyState />
      ) : (
        <section aria-label="Доступные модули для тренировки" className={styles.grid}>
          {sampleModule ? (
            <article className={styles.panel}>
              <div className={styles.meta}>
                <Badge lang="ko" tone="accent">
                  {sampleModule.level}
                </Badge>
                <span>{sampleExerciseCount} заданий</span>
              </div>
              <div className={styles.copy}>
                {sampleModule.title.ko ? (
                  <p className={styles.koreanTitle} lang="ko">
                    {sampleModule.title.ko}
                  </p>
                ) : null}
                <h2>{sampleModule.title.ru}</h2>
                <p>
                  В модуле доступно {sampleExerciseCount} заданий. Запустите демо-сессию и пройдите
                  упражнения подряд.
                </p>
              </div>
              <Link className={styles.startAction} href={`/training/${DEMO_TRAINING_SESSION_ID}`}>
                Начать тренировку
              </Link>
            </article>
          ) : null}

          {honorificsModule ? (
            <article className={styles.panel}>
              <div className={styles.meta}>
                <Badge tone="neutral">draft preview</Badge>
                <span>{honorificsExerciseCount} заданий</span>
              </div>
              <div className={styles.copy}>
                <p className={styles.koreanTitle} lang="ko">
                  {honorificsModule.title.ko}
                </p>
                <h2>{honorificsModule.title.ru}</h2>
                <p>{honorificsModule.description.ru}</p>
              </div>
              <Link
                className={styles.startAction}
                href={`/training/${HONORIFICS_PREVIEW_SESSION_ID}`}
              >
                Начать preview-тренировку
              </Link>
            </article>
          ) : null}
        </section>
      )}
    </PageContainer>
  );
}
