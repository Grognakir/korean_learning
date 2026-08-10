import Link from "next/link";

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

function getWordCountLabel(count: number): string {
  const remainder100 = count % 100;
  const remainder10 = count % 10;
  const form =
    remainder100 >= 11 && remainder100 <= 14
      ? "слов"
      : remainder10 === 1
        ? "слово"
        : remainder10 >= 2 && remainder10 <= 4
          ? "слова"
          : "слов";

  return `${count} ${form}`;
}

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
      <ContentSection description="Конструкции и правила этого урока." title="Грамматика">
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

      <ContentSection description="Слова и тексты по теме урока." title="Материалы">
        <ul className={styles.counts}>
          <li>
            <Link className={styles.materialLink} href={`/dictionary?unit=${unit.slug}`} prefetch>
              Открыть словарь · {getWordCountLabel(vocabularyCount)}
            </Link>
          </li>
          <li>{readingAvailable ? "Тексты для чтения доступны" : "Тексты появятся позже"}</li>
        </ul>
      </ContentSection>

      <ContentSection description="Выберите навык для короткой практики." title="Тренировка">
        <DetailActionArea
          actions={[
            createDetailAction({
              href: buildTrainingSetupHref({ skill: "grammar", unitSlug: unit.slug }),
              label: "Грамматика",
              available: grammarPracticeAvailable,
              unavailableReason: "Нет доступных заданий по грамматике",
            }),
            createDetailAction({
              href: buildTrainingSetupHref({ skill: "vocabulary", unitSlug: unit.slug }),
              label: "Словарь",
              available: vocabularyPracticeAvailable,
              unavailableReason: "Нет доступных заданий по словарю",
            }),
            createDetailAction({
              href: buildTrainingSetupHref({ skill: "reading", unitSlug: unit.slug }),
              label: "Чтение",
              available: readingPracticeAvailable,
              unavailableReason: "Нет доступных заданий по чтению",
            }),
          ]}
        />
      </ContentSection>
    </div>
  );
}
