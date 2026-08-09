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

import styles from "./page.module.css";

export async function TrainingModulesPanel() {
  const [sample, sampleCount] = await Promise.all([
    getCachedPublishedModuleBySlug("sample-module"),
    getCachedExerciseCountByModuleSlug("sample-module"),
  ]);

  if (sample.status === "unavailable" || sampleCount.status === "unavailable") {
    return <ServiceUnavailableState />;
  }

  const sampleModule = sample.data;
  const sampleExerciseCount = sampleCount.data;

  return (
    <>
      <ResumeTrainingPrompt />
      <GuestSessionImportPrompt
        moduleIdBySlug={{
          ...(sampleModule ? { [sampleModule.slug]: sampleModule.id } : {}),
        }}
      />

      {!sampleModule ? (
        <CatalogEmptyState />
      ) : (
        <section aria-label="Доступные модули для тренировки" className={styles.grid}>
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
        </section>
      )}
    </>
  );
}
