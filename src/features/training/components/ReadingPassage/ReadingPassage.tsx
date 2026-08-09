import type { ExercisePassageView } from "../../presentation/toExerciseView";

import styles from "./ReadingPassage.module.css";

type ReadingPassageProps = {
  readonly passage: ExercisePassageView;
};

export function ReadingPassage({ passage }: ReadingPassageProps) {
  return (
    <article aria-label="Текст для чтения" className={styles.passage}>
      {passage.title.ko || passage.title.ru ? (
        <h3 className={styles.title}>
          {passage.title.ko ? <span lang="ko">{passage.title.ko}</span> : null}
          {passage.title.ko && passage.title.ru ? " · " : null}
          {passage.title.ru ? <span>{passage.title.ru}</span> : null}
        </h3>
      ) : null}
      <p className={styles.body} lang="ko">
        {passage.bodyKo}
      </p>
    </article>
  );
}
