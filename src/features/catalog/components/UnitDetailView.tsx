import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { ContentSection } from "@/wrappers";

import type { PublicGrammarTopicSummary, PublicUnitSummary } from "../domain/types";
import { buildTrainingSetupHref } from "../presentation/buildTrainingSetupHref";
import { createDetailAction, DetailActionArea } from "./DetailActionArea";

import styles from "./UnitDetailView.module.css";

type UnitDetailViewProps = {
  readonly unit: PublicUnitSummary;
  readonly grammarTopics: readonly PublicGrammarTopicSummary[];
  readonly vocabularyCount: number;
  readonly readingAvailable: boolean;
  readonly grammarPracticeAvailable: boolean;
  readonly vocabularyPracticeAvailable: boolean;
  readonly readingPracticeAvailable: boolean;
};

export function UnitDetailView({
  unit,
  grammarTopics,
  vocabularyCount,
  readingAvailable,
  grammarPracticeAvailable,
  vocabularyPracticeAvailable,
  readingPracticeAvailable,
}: UnitDetailViewProps) {
  return (
    <div className={styles.root}>
      <div className={styles.intro}>
        <Badge lang="ko" tone="accent">
          {unit.level}
        </Badge>
        <p className={styles.meta}>Урок {unit.unitNumber}</p>
        <h2 className={styles.koreanTitle} lang="ko">
          {unit.title.ko}
        </h2>
        <p className={styles.summary}>{unit.summary.ru}</p>
      </div>

      <ContentSection description="Кратко, чему учит этот урок." title="Цели">
        <p className={styles.goal}>{unit.summary.ru}</p>
        <p className={styles.goal} lang="ko">
          {unit.summary.ko}
        </p>
      </ContentSection>

      <ContentSection
        description="Опубликованные конструкции урока. Черновики скрыты."
        title="Грамматика"
      >
        {grammarTopics.length === 0 ? (
          <p className={styles.empty}>Пока нет опубликованной грамматики.</p>
        ) : (
          <ul className={styles.grammarList}>
            {grammarTopics.map((topic) => (
              <li key={topic.logicalId}>
                <Link
                  className={styles.grammarLink}
                  href={`/topics/${unit.slug}?grammar=${encodeURIComponent(topic.logicalId)}`}
                  prefetch
                >
                  <span className={styles.pattern} lang="ko">
                    {topic.patternKo}
                  </span>
                  <span>{topic.title.ru}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </ContentSection>

      <ContentSection description="Только проверенные материалы." title="Словарь и чтение">
        <ul className={styles.counts}>
          <li>Словарь: {vocabularyCount} проверенных записей</li>
          <li>Чтение: {readingAvailable ? "есть опубликованные тексты" : "пока недоступно"}</li>
        </ul>
      </ContentSection>

      <ContentSection
        description="Переход в настройку тренировки с выбранным навыком."
        title="Тренировка"
      >
        <DetailActionArea
          actions={[
            createDetailAction({
              href: buildTrainingSetupHref({ skill: "grammar", unitSlug: unit.slug }),
              label: "Грамматика",
              available: grammarPracticeAvailable,
              unavailableReason: "Нет approved упражнений по грамматике",
            }),
            createDetailAction({
              href: buildTrainingSetupHref({ skill: "vocabulary", unitSlug: unit.slug }),
              label: "Словарь",
              available: vocabularyPracticeAvailable,
              unavailableReason: "Нет approved упражнений по словарю",
            }),
            createDetailAction({
              href: buildTrainingSetupHref({ skill: "reading", unitSlug: unit.slug }),
              label: "Чтение",
              available: readingPracticeAvailable,
              unavailableReason: "Нет approved упражнений по чтению",
            }),
          ]}
        />
      </ContentSection>
    </div>
  );
}
