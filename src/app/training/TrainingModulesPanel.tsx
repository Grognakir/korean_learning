import Link from "next/link";

import { CatalogEmptyState, ServiceUnavailableState } from "@/components/feedback";
import { Badge } from "@/components/ui/Badge";
import { GuestSessionImportPrompt } from "@/features/training/components/GuestSessionImportPrompt";
import { ResumeTrainingPrompt } from "@/features/training/components/ResumeTrainingPrompt";
import { DEMO_TRAINING_SESSION_ID } from "@/features/training/sessionConstants";
import {
  getCachedExerciseCountByModuleSlug,
  getCachedPublishedModuleBySlug,
} from "@/modules/cachedLearningContent";
import { HONORIFICS_MODULE_SLUG, HONORIFICS_PREVIEW_SESSION_ID } from "@/modules";

import styles from "./page.module.css";

export async function TrainingModulesPanel() {
  const [sample, honorifics, sampleCount, honorificsCount] = await Promise.all([
    getCachedPublishedModuleBySlug("sample-module"),
    getCachedPublishedModuleBySlug(HONORIFICS_MODULE_SLUG),
    getCachedExerciseCountByModuleSlug("sample-module"),
    getCachedExerciseCountByModuleSlug(HONORIFICS_MODULE_SLUG),
  ]);

  if (
    sample.status === "unavailable" ||
    honorifics.status === "unavailable" ||
    sampleCount.status === "unavailable" ||
    honorificsCount.status === "unavailable"
  ) {
    return <ServiceUnavailableState />;
  }

  const sampleModule = sample.data;
  const honorificsModule = honorifics.data;
  const sampleExerciseCount = sampleCount.data;
  const honorificsExerciseCount = honorificsCount.data;
  const hasModules = Boolean(sampleModule) || Boolean(honorificsModule);

  return (
    <>
      <ResumeTrainingPrompt />
      <GuestSessionImportPrompt
        moduleIdBySlug={{
          ...(sampleModule ? { [sampleModule.slug]: sampleModule.id } : {}),
          ...(honorificsModule ? { [honorificsModule.slug]: honorificsModule.id } : {}),
        }}
      />

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
    </>
  );
}
