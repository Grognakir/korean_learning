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
      <ContentSection description="Краткое объяснение конструкции." title="Правило">
        <p className={styles.rule}>{topic.summary.ru}</p>
        <p className={styles.rule} lang="ko">
          {topic.summary.ko}
        </p>
      </ContentSection>

      <ContentSection description="Связанный урок программы 1급." title="Тема">
        <Link className={styles.unitLink} href={`/topics/${unit.slug}`} prefetch>
          <span lang="ko">{unit.title.ko}</span>
          <span>{unit.title.ru.charAt(0).toUpperCase() + unit.title.ru.slice(1)}</span>
        </Link>
      </ContentSection>

      <ContentSection description="Практика только по этой конструкции." title="Тренировка">
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
              unavailableReason: "Для этой конструкции пока нет заданий",
            }),
          ]}
        />
      </ContentSection>
    </div>
  );
}
