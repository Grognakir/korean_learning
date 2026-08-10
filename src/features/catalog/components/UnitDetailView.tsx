import Link from "next/link";

import { ContentSection } from "@/wrappers";

import type { PublicGrammarTopicSummary, PublicUnitSummary } from "../domain/types";
import { buildTrainingSetupHref } from "../presentation/buildTrainingSetupHref";
import { createDetailAction, DetailActionArea } from "./DetailActionArea";
import { GrammarTopicLink } from "./GrammarTopicLink";

import styles from "./UnitDetailView.module.css";

type UnitPracticeActionsProps = {
  readonly unit: PublicUnitSummary;
  readonly grammarPracticeAvailable: boolean;
  readonly vocabularyPracticeAvailable: boolean;
  readonly readingPracticeAvailable: boolean;
};

type UnitDetailViewProps = {
  readonly unit: PublicUnitSummary;
  readonly grammarTopics: readonly PublicGrammarTopicSummary[];
  readonly vocabularyCount: number;
  readonly readingAvailable: boolean;
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

export function UnitPracticeActions({
  unit,
  grammarPracticeAvailable,
  vocabularyPracticeAvailable,
  readingPracticeAvailable,
}: UnitPracticeActionsProps) {
  return (
    <DetailActionArea
      actions={[
        createDetailAction({
          href: buildTrainingSetupHref({ skill: "grammar", unitSlug: unit.slug }),
          label: "문법 (Грамматика)",
          available: grammarPracticeAvailable,
          unavailableReason: "Нет доступных заданий по грамматике",
        }),
        createDetailAction({
          href: buildTrainingSetupHref({ skill: "vocabulary", unitSlug: unit.slug }),
          label: "어휘 (Словарь)",
          available: vocabularyPracticeAvailable,
          unavailableReason: "Нет доступных заданий по словарю",
        }),
        createDetailAction({
          href: buildTrainingSetupHref({ skill: "reading", unitSlug: unit.slug }),
          label: "읽기 (Чтение)",
          available: readingPracticeAvailable,
          unavailableReason: "Нет доступных заданий по чтению",
        }),
      ]}
    />
  );
}

export function UnitDetailView({
  unit,
  grammarTopics,
  vocabularyCount,
  readingAvailable,
}: UnitDetailViewProps) {
  return (
    <div className={styles.root}>
      <ContentSection title="Грамматика">
        {grammarTopics.length === 0 ? (
          <p className={styles.empty}>Пока нет опубликованной грамматики.</p>
        ) : (
          <ul className={styles.grammarList}>
            {grammarTopics.map((topic) => (
              <li key={topic.logicalId}>
                <GrammarTopicLink topic={topic} />
              </li>
            ))}
          </ul>
        )}
      </ContentSection>

      <ContentSection title="Материалы">
        <ul className={styles.counts}>
          <li>
            <Link className={styles.materialLink} href={`/dictionary?unit=${unit.slug}`} prefetch>
              Открыть словарь · {getWordCountLabel(vocabularyCount)}
            </Link>
          </li>
          <li>{readingAvailable ? "Тексты для чтения доступны" : "Тексты появятся позже"}</li>
        </ul>
      </ContentSection>
    </div>
  );
}
