import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { TopicsEmptyState } from "@/components/feedback";
import { PageHeader } from "@/components/layout";
import { Badge } from "@/components/ui";
import { selectPublishedTopics } from "@/features/training";
import { learningModuleRegistry } from "@/modules";
import { ContentSection, PageContainer } from "@/wrappers";

import styles from "./page.module.css";

type ModulePageProps = {
  params: Promise<{ moduleSlug: string }>;
};

export async function generateMetadata({ params }: ModulePageProps): Promise<Metadata> {
  const { moduleSlug } = await params;
  const learningModule = learningModuleRegistry.getPublishedBySlug(moduleSlug);

  return {
    title: learningModule?.title.ru ?? "Модуль не найден",
    description: learningModule?.description.ru,
  };
}

/** Unknown module slugs must 404 at the routing layer (avoids soft-200 under streaming). */
export const dynamicParams = false;

export function generateStaticParams() {
  return learningModuleRegistry.getPublished().map((module) => ({ moduleSlug: module.slug }));
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { moduleSlug } = await params;
  const learningModule = learningModuleRegistry.getPublishedBySlug(moduleSlug);

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
        eyebrow={
          <span className={styles.eyebrow}>
            <Badge lang="ko" tone="accent">
              {learningModule.level}
            </Badge>
            Учебный модуль
          </span>
        }
        title={learningModule.title.ru}
      />

      <div className={styles.koreanIntro}>
        <p lang="ko">{learningModule.title.ko}</p>
        <p lang="ko">{learningModule.description.ko}</p>
      </div>

      <ContentSection
        description="Темы расположены от базовых понятий к первым практическим выражениям."
        eyebrow="Содержание"
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
