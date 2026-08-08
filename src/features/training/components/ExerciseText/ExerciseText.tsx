import type { ExerciseTextView } from "../../presentation";

import styles from "./ExerciseText.module.css";

export type ExerciseTextProps = {
  readonly text: ExerciseTextView;
  readonly as?: "span" | "p" | "div";
  readonly className?: string;
};

export function ExerciseText({ as: Component = "span", className, text }: ExerciseTextProps) {
  const parts: Array<{ key: string; value: string; lang?: "ko" }> = [];

  if (text.ko) {
    parts.push({ key: "ko", value: text.ko, lang: "ko" });
  }

  if (text.ru) {
    parts.push({ key: "ru", value: text.ru });
  }

  if (parts.length === 0) {
    return null;
  }

  return (
    <Component className={className ? `${styles.text} ${className}` : styles.text}>
      {parts.map((part, index) => (
        <span key={part.key}>
          {index > 0 ? " " : null}
          <span lang={part.lang}>{part.value}</span>
        </span>
      ))}
    </Component>
  );
}
