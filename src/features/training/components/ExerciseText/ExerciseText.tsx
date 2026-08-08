import { classNames } from "@/lib/utilities";

import type { ExerciseTextView } from "../../presentation";

import styles from "./ExerciseText.module.css";

export type ExerciseTextProps = {
  readonly text: ExerciseTextView;
  readonly as?: "span" | "p" | "div";
  readonly className?: string;
};

export function ExerciseText({ as: Component = "span", className, text }: ExerciseTextProps) {
  const hasKorean = Boolean(text.ko);
  const hasRussian = Boolean(text.ru);

  if (!hasKorean && !hasRussian) {
    return null;
  }

  const isStacked = hasKorean && hasRussian;

  return (
    <Component className={classNames(styles.text, isStacked && styles.stacked, className)}>
      {text.ko ? (
        <span className={styles.korean} lang="ko">
          {text.ko}
        </span>
      ) : null}
      {text.ru ? <span className={styles.russian}>{text.ru}</span> : null}
    </Component>
  );
}
