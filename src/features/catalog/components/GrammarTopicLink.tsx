import Link from "next/link";
import type { ReactNode } from "react";

import type { PublicGrammarTopicSummary } from "../domain/types";
import { formatGrammarPatternDisplay } from "../presentation/formatGrammarPatternDisplay";
import { renderMarkedTerms } from "../presentation/renderMarkedTerms";

import styles from "./GrammarTopicLink.module.css";

type GrammarTopicLinkProps = {
  readonly topic: PublicGrammarTopicSummary;
  readonly href?: string;
  readonly description?: ReactNode;
};

export function GrammarTopicLink({ topic, href, description }: GrammarTopicLinkProps) {
  const target =
    href ?? `/topics/${topic.unitSlug}?grammar=${encodeURIComponent(topic.logicalId)}`;
  const body = description ?? renderMarkedTerms(topic.title.ru);

  return (
    <Link className={styles.link} href={target} prefetch>
      <span className={styles.pattern} lang="ko">
        {formatGrammarPatternDisplay(topic.patternKo)}
      </span>
      {body ? <span className={styles.description}>{body}</span> : null}
    </Link>
  );
}
