import type { ReactNode } from "react";

import styles from "./renderMarkedTerms.module.css";

function hasInlineMarks(text: string): boolean {
  return text.includes("`") || text.includes("**") || text.includes("_");
}

function renderSegment(text: string, keyPrefix: string): ReactNode[] {
  if (!hasInlineMarks(text)) {
    return [text];
  }

  const parts = text
    .split(/(`[^`]+`|\*\*[^*]+\*\*|_[^_]+_)/g)
    .filter((part) => part.length > 0);

  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      const term = part.slice(1, -1);
      return (
        <strong className={styles.term} key={`${keyPrefix}-tick-${term}-${index}`} lang="ko">
          {term}
        </strong>
      );
    }

    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      const term = part.slice(2, -2);
      const isKorean = /[가-힣]/.test(term);
      return (
        <strong
          className={styles.term}
          key={`${keyPrefix}-bold-${term}-${index}`}
          lang={isKorean ? "ko" : undefined}
        >
          {term}
        </strong>
      );
    }

    if (part.startsWith("_") && part.endsWith("_") && part.length > 2) {
      const term = part.slice(1, -1);
      return (
        <em className={styles.italic} key={`${keyPrefix}-italic-${term}-${index}`}>
          {term}
        </em>
      );
    }

    return <span key={`${keyPrefix}-text-${index}`}>{part}</span>;
  });
}

/**
 * Renders authoring marks like `` `이` ``, `**bold**`, and `_italic_` without raw markers.
 */
export function renderMarkedTerms(text: string): ReactNode {
  const paragraphs = text.split(/\n\n+/u).map((part) => part.trim()).filter(Boolean);
  if (paragraphs.length <= 1) {
    const nodes = renderSegment(text, "single");
    return nodes.length === 1 && typeof nodes[0] === "string" ? nodes[0] : nodes;
  }

  return paragraphs.map((paragraph, index) => (
    <span className={styles.paragraph} key={`p-${index}`}>
      {renderSegment(paragraph, `p${index}`)}
    </span>
  ));
}
