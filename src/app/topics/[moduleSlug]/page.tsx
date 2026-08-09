import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { TopicsEmptyState, ServiceUnavailableState } from "@/components/feedback";
import { PageHeader } from "@/components/layout";
import { Badge } from "@/components/ui";
import { selectPublishedTopics } from "@/features/training";
import { getLearningContent, LearningContentError } from "@/modules";
import type { LearningModuleDefinition } from "@/types";
import { ContentSection, PageContainer } from "@/wrappers";

import styles from "./page.module.css";

type ModulePageProps = {
  params: Promise<{ moduleSlug: string }>;
};

export async function generateMetadata({ params }: ModulePageProps): Promise<Metadata> {
  const { moduleSlug } = await params;

  try {
    const { moduleRepository } = await getLearningContent();
    const learningModule = await moduleRepository.getPublishedBySlug(moduleSlug);

    return {
      title: learningModule?.title.ru ?? "Модуль не найден",
      description: learningModule?.description.ru,
    };
  } catch {
    return {
      title: "Модуль недоступен",
    };
  }
}

/** Unknown module slugs must 404 at the routing layer (avoids soft-200 under streaming). */
export const dynamicParams = false;

export async function generateStaticParams() {
  const { moduleRepository } = await getLearningContent();
  const modules = await moduleRepository.getPublished();

  return modules.map((module: LearningModuleDefinition) => ({ moduleSlug: module.slug }));
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { moduleSlug } = await params;
  let learningModule: LearningModuleDefinition | null | undefined;

  try {
    const { moduleRepository } = await getLearningContent();
    learningModule = await moduleRepository.getPublishedBySlug(moduleSlug);
  } catch (error) {
    if (!(error instanceof LearningContentError)) {
      throw error;
    }
    learningModule = null;
  }

  if (learningModule === null) {
    return (
      <PageContainer className={styles.page}>
        <PageHeader description="Не удалось загрузить модуль." title="Модуль недоступен" />
        <ServiceUnavailableState />
      </PageContainer>
    );
  }

  if (!learningModule) {
    notFound();
  }

  const topics = selectPublishedTopics(learningModule);

  return (
    <PageContainer className={styles.page}>
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
    </PageContainer>
  );
}
