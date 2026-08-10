import Link from "next/link";

import { ContentSection } from "@/wrappers";

import { buildGrammarTopicDetail } from "../domain/grammarDetail";
import type { PublicGrammarTopicSummary, PublicUnitSummary } from "../domain/types";
import { BilingualTitle } from "../presentation/BilingualTitle";
import { buildTrainingSetupHref } from "../presentation/buildTrainingSetupHref";
import { GrammarMarkdownBody } from "../presentation/GrammarMarkdownBody";
import { createDetailAction, DetailActionArea } from "./DetailActionArea";

import styles from "./GrammarDetailView.module.css";

type GrammarDetailViewProps = {
  readonly topic: PublicGrammarTopicSummary;
  readonly unit: PublicUnitSummary;
  readonly practiceAvailable: boolean;
};

export function GrammarDetailView({ topic, unit, practiceAvailable }: GrammarDetailViewProps) {
  const detail = buildGrammarTopicDetail({
    patternKo: topic.patternKo,
    summaryRu: topic.summary.ru,
    titleRu: topic.title.ru,
    enrichment: topic.detail,
  });

  return (
    <div className={styles.root}>
      <ContentSection title="Описание">
        <GrammarMarkdownBody markdown={detail.bodyMd} />
      </ContentSection>

      <ContentSection title="Тема">
        <Link className={styles.unitLink} href={`/topics/${unit.slug}`} prefetch>
          <BilingualTitle ko={unit.title.ko} ru={unit.title.ru} />
        </Link>
      </ContentSection>

      <ContentSection title="Тренировка">
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
