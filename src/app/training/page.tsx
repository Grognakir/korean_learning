import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout";
import { Badge } from "@/components/ui";
import { exerciseRepository, learningModuleRegistry } from "@/modules";
import { PageContainer } from "@/wrappers";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Тренировка",
};

export default function TrainingPage() {
  const learningModule = learningModuleRegistry.getBySlug("sample-module");
  const exerciseCount = exerciseRepository.list({ moduleSlug: "sample-module" }).length;

  return (
    <PageContainer className={styles.page} width="narrow">
      <PageHeader
        description="Короткая практика на локальном sample-модуле: все семь типов заданий."
        eyebrow="Активная практика"
        title="Тренировка"
      />

      <section aria-label="Доступный модуль для тренировки" className={styles.panel}>
        <div className={styles.meta}>
          <Badge tone="accent">{learningModule?.level ?? "1급"}</Badge>
          <span>{exerciseCount} заданий</span>
        </div>
        <div className={styles.copy}>
          {learningModule?.title.ko ? (
            <p className={styles.koreanTitle} lang="ko">
              {learningModule.title.ko}
            </p>
          ) : null}
          <h2>{learningModule?.title.ru ?? "Первые шаги в корейском"}</h2>
          <p>
            В модуле доступно {exerciseCount} заданий. Запустите демо-сессию и пройдите упражнения
            подряд.
          </p>
        </div>
        <Link className={styles.startAction} href="/training/demo-session">
          Начать тренировку
        </Link>
      </section>
    </PageContainer>
  );
}
