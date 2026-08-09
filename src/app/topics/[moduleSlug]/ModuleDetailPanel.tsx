import Link from "next/link";
import { notFound } from "next/navigation";

import { TopicsEmptyState, ServiceUnavailableState } from "@/components/feedback";
import { PageHeader } from "@/components/layout";
import { Badge } from "@/components/ui/Badge";
import { selectPublishedTopics } from "@/features/training/domain/moduleSelectors";
import { getCachedPublishedModuleBySlug } from "@/modules/cachedLearningContent";
import { LearningContentError } from "@/modules/resolveLearningContent";
import type { LearningModuleDefinition } from "@/types";
import { ContentSection } from "@/wrappers";

import styles from "./page.module.css";

type ModuleDetailPanelProps = {
  readonly moduleSlug: string;
};

export async function ModuleDetailPanel({ moduleSlug }: ModuleDetailPanelProps) {
  let learningModule: LearningModuleDefinition | undefined;

  try {
    learningModule = await getCachedPublishedModuleBySlug(moduleSlug);
  } catch (error) {
    if (error instanceof LearningContentError) {
      return (
        <>
          <PageHeader description="Не удалось загрузить модуль." title="Модуль недоступен" />
          <ServiceUnavailableState />
        </>
      );
    }

    throw error;
  }

  if (!learningModule) {
    notFound();
  }

  const topics = selectPublishedTopics(learningModule);

  return (
    <>
      <PageHeader
        actions={
          <Link className={styles.primaryAction} href="/training">
            Начать тренировку
          </Link>
        }
        description={learningModule.description.ru}
        title={learningModule.title.ru}
      />

      <div className={styles.koreanIntro}>
        <Badge lang="ko" tone="accent">
          {learningModule.level}
        </Badge>
        <p lang="ko">{learningModule.title.ko}</p>
        <p lang="ko">{learningModule.description.ko}</p>
      </div>

      <ContentSection
        description="Темы расположены от базовых понятий к первым практическим выражениям."
        title="Темы модуля"
      >
        {topics.length === 0 ? (
          <TopicsEmptyState />
        ) : (
          <ol className={styles.topicGrid}>
            {topics.map((topic, index) => (
              <li className={styles.topicCard} key={topic.id}>
                <span className={styles.topicNumber}>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <p className={styles.topicKoreanTitle} lang="ko">
                    {topic.title.ko}
                  </p>
                  <h3>{topic.title.ru}</h3>
                  <p>{topic.summary.ru}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </ContentSection>
    </>
  );
}
