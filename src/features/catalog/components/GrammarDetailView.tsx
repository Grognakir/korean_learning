import Link from "next/link";

import { ContentSection } from "@/wrappers";

import type { PublicGrammarTopicSummary, PublicUnitSummary } from "../domain/types";
import { buildTrainingSetupHref } from "../presentation/buildTrainingSetupHref";
import { createDetailAction, DetailActionArea } from "./DetailActionArea";

import styles from "./GrammarDetailView.module.css";

type GrammarDetailViewProps = {
  readonly topic: PublicGrammarTopicSummary;
  readonly unit: PublicUnitSummary;
  readonly practiceAvailable: boolean;
};

export function GrammarDetailView({ topic, unit, practiceAvailable }: GrammarDetailViewProps) {
  return (
    <div className={styles.root}>
      <div className={styles.intro}>
        <p className={styles.meta}>
          Урок {topic.unitNumber} · {topic.category}
        </p>
        <h2 className={styles.pattern} lang="ko">
          {topic.patternKo}
        </h2>
        <p className={styles.title}>{topic.title.ru}</p>
      </div>

      <ContentSection description="Краткое правило без review notes." title="Правило">
        <p className={styles.rule}>{topic.summary.ru}</p>
        <p className={styles.rule} lang="ko">
          {topic.summary.ko}
        </p>
      </ContentSection>

      <ContentSection description="Примеры появятся после language review." title="Примеры">
        <p className={styles.empty}>
          Отдельные example records для этой конструкции пока не опубликованы.
        </p>
      </ContentSection>

      <ContentSection description="Связанный урок программы 1급." title="Тема">
        <Link className={styles.unitLink} href={`/topics/${unit.slug}`} prefetch>
          <span lang="ko">{unit.title.ko}</span>
          <span>{unit.title.ru}</span>
        </Link>
      </ContentSection>

      <ContentSection
        description="Тренировка только по этой конструкции, если есть approved банк."
        title="Тренировка"
      >
        <DetailActionArea
          actions={[
            createDetailAction({
              href: buildTrainingSetupHref({
                skill: "grammar",
                unitSlug: unit.slug,
                grammarTopicId: topic.logicalId,
              }),
              label: "Тренировать конструкцию",
              available: practiceAvailable,
              unavailableReason: "Нет approved упражнений для этой конструкции",
            }),
          ]}
        />
      </ContentSection>
    </div>
  );
}
