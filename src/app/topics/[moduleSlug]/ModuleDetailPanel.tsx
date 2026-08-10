import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { TopicsEmptyState, ServiceUnavailableState } from "@/components/feedback";
import { PageHeader } from "@/components/layout";
import { Badge } from "@/components/ui/Badge";
import { GrammarDetailView } from "@/features/catalog/components/GrammarDetailView";
import { UnitDetailView } from "@/features/catalog/components/UnitDetailView";
import { parseGrammarQuery } from "@/features/catalog/presentation/parseGrammarQuery";
import { selectPublishedTopics } from "@/features/training/domain/moduleSelectors";
import { getCachedPublishedModuleBySlug } from "@/modules/cachedLearningContent";
import {
  getCachedApprovedCurriculumExercises,
  getCachedPublicDictionary,
  getCachedPublicGrammarTopic,
  getCachedPublicGrammarTopics,
  getCachedPublicPassages,
  getCachedPublicUnitBySlug,
} from "@/modules/curriculum/cachedCurriculumContent";
import { ContentSection } from "@/wrappers";

import styles from "./page.module.css";

type ModuleDetailPanelProps = {
  readonly moduleSlug: string;
  readonly searchParams: Promise<{
    grammar?: string | string[];
  }>;
};

/**
 * Grammar details use the query route `?grammar=<logicalId>` on `/topics/[moduleSlug]`
 * (chosen over a nested path so F2-I10 catalog links stay stable).
 */
export async function ModuleDetailPanel({
  moduleSlug,
  searchParams,
}: ModuleDetailPanelProps): Promise<ReactNode> {
  const grammarLogicalId = parseGrammarQuery((await searchParams).grammar);

  if (grammarLogicalId) {
    const [topicResult, unitResult, exercisesResult] = await Promise.all([
      getCachedPublicGrammarTopic(grammarLogicalId),
      getCachedPublicUnitBySlug(moduleSlug),
      getCachedApprovedCurriculumExercises({
        unitSlug: moduleSlug,
        grammarTopicId: grammarLogicalId,
        learningSkill: "grammar",
      }),
    ]);

    if (
      topicResult.status === "unavailable" ||
      unitResult.status === "unavailable" ||
      exercisesResult.status === "unavailable"
    ) {
      return (
        <>
          <PageHeader
            description="Не удалось загрузить грамматику."
            title="Грамматика недоступна"
          />
          <ServiceUnavailableState />
        </>
      );
    }

    const topic = topicResult.data;
    const unit = unitResult.data;

    if (!topic || !unit || topic.unitSlug !== moduleSlug) {
      notFound();
    }

    return (
      <>
        <PageHeader
          actions={
            <Link className={styles.secondaryAction} href={`/topics/${moduleSlug}`}>
              К теме
            </Link>
          }
          eyebrow={`Урок ${topic.unitNumber} · Грамматика`}
          title={<span lang="ko">{topic.patternKo}</span>}
        />
        <GrammarDetailView
          practiceAvailable={exercisesResult.data.length > 0}
          topic={topic}
          unit={unit}
        />
      </>
    );
  }

  const curriculumUnit = await getCachedPublicUnitBySlug(moduleSlug);
  if (curriculumUnit.status === "ready" && curriculumUnit.data) {
    const [
      unitResult,
      grammarResult,
      dictionaryResult,
      passagesResult,
      grammarEx,
      vocabEx,
      readingEx,
    ] = await Promise.all([
      getCachedPublicUnitBySlug(moduleSlug),
      getCachedPublicGrammarTopics(moduleSlug),
      getCachedPublicDictionary(moduleSlug),
      getCachedPublicPassages(moduleSlug),
      getCachedApprovedCurriculumExercises({ unitSlug: moduleSlug, learningSkill: "grammar" }),
      getCachedApprovedCurriculumExercises({ unitSlug: moduleSlug, learningSkill: "vocabulary" }),
      getCachedApprovedCurriculumExercises({ unitSlug: moduleSlug, learningSkill: "reading" }),
    ]);

    if (
      unitResult.status === "unavailable" ||
      grammarResult.status === "unavailable" ||
      dictionaryResult.status === "unavailable" ||
      passagesResult.status === "unavailable" ||
      grammarEx.status === "unavailable" ||
      vocabEx.status === "unavailable" ||
      readingEx.status === "unavailable"
    ) {
      return (
        <>
          <PageHeader description="Не удалось загрузить тему." title="Тема недоступна" />
          <ServiceUnavailableState />
        </>
      );
    }

    const unit = unitResult.data;
    if (!unit) {
      notFound();
    }

    return (
      <>
        <PageHeader
          actions={
            <Link className={styles.secondaryAction} href="/topics">
              К каталогу
            </Link>
          }
          description={<span lang="ko">{unit.title.ko}</span>}
          eyebrow={`Урок ${unit.unitNumber} · ${unit.level}`}
          title={unit.title.ru.charAt(0).toUpperCase() + unit.title.ru.slice(1)}
        />
        <UnitDetailView
          grammarPracticeAvailable={grammarEx.data.length > 0}
          grammarTopics={grammarResult.data}
          readingAvailable={passagesResult.data.length > 0}
          readingPracticeAvailable={readingEx.data.length > 0}
          unit={unit}
          vocabularyCount={dictionaryResult.data.length}
          vocabularyPracticeAvailable={vocabEx.data.length > 0}
        />
      </>
    );
  }

  const result = await getCachedPublishedModuleBySlug(moduleSlug);

  if (result.status === "unavailable") {
    return (
      <>
        <PageHeader description="Не удалось загрузить модуль." title="Модуль недоступен" />
        <ServiceUnavailableState />
      </>
    );
  }

  const learningModule = result.data;

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
