import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout";
import { Badge } from "@/components/ui";
import { DEMO_TRAINING_SESSION_ID, ResumeTrainingPrompt } from "@/features/training";
import {
  HONORIFICS_MODULE_SLUG,
  HONORIFICS_PREVIEW_SESSION_ID,
  exerciseRepository,
  learningModuleRegistry,
} from "@/modules";
import { PageContainer } from "@/wrappers";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Тренировка",
};

export default function TrainingPage() {
  const sampleModule = learningModuleRegistry.getBySlug("sample-module");
  const sampleExerciseCount = exerciseRepository.list({ moduleSlug: "sample-module" }).length;
  const honorificsModule = learningModuleRegistry.getBySlug(HONORIFICS_MODULE_SLUG);
  const honorificsExerciseCount = honorificsModule
    ? exerciseRepository.list({ moduleSlug: HONORIFICS_MODULE_SLUG }).length
    : 0;

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        description="Короткая практика на локальных модулях. Draft preview появляется только в development."
        eyebrow="Активная практика"
        title="Тренировка"
      />

      <ResumeTrainingPrompt />

      <section aria-label="Доступные модули для тренировки" className={styles.grid}>
        <article className={styles.panel}>
          <div className={styles.meta}>
            <Badge lang="ko" tone="accent">
              {sampleModule?.level ?? "1급"}
            </Badge>
            <span>{sampleExerciseCount} заданий</span>
          </div>
          <div className={styles.copy}>
            {sampleModule?.title.ko ? (
              <p className={styles.koreanTitle} lang="ko">
                {sampleModule.title.ko}
              </p>
            ) : null}
            <h2>{sampleModule?.title.ru ?? "Первые шаги в корейском"}</h2>
            <p>
              В модуле доступно {sampleExerciseCount} заданий. Запустите демо-сессию и пройдите
              упражнения подряд.
            </p>
          </div>
          <Link className={styles.startAction} href={`/training/${DEMO_TRAINING_SESSION_ID}`}>
            Начать тренировку
          </Link>
        </article>

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
    </PageContainer>
  );
}
