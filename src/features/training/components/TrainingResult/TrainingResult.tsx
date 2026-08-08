import type { TrainingResultSnapshot } from "../../domain";
import { MistakeSummary } from "../MistakeSummary";
import { ResultActions } from "../ResultActions";
import { ScoreSummary } from "../ScoreSummary";

import styles from "./TrainingResult.module.css";

export type TrainingResultProps = {
  readonly snapshot: TrainingResultSnapshot;
  readonly onRetryMistakes?: () => void;
};

export function TrainingResult({ onRetryMistakes, snapshot }: TrainingResultProps) {
  const canRetryMistakes = snapshot.mistakeExerciseIds.length > 0;

  return (
    <section aria-labelledby="training-complete-title" className={styles.result}>
      <header className={styles.header}>
        <h1 className={styles.title} id="training-complete-title">
          Тренировка завершена
        </h1>
        <p className={styles.copy}>
          Краткий итог по ответам. Можно начать новую сессию
          {canRetryMistakes ? " или повторить только ошибки" : ""}.
        </p>
      </header>

      <ScoreSummary
        correctCount={snapshot.correctCount}
        maxScore={snapshot.maxScore}
        percentage={snapshot.percentage}
        score={snapshot.score}
        totalCount={snapshot.totalCount}
      />

      <MistakeSummary mistakes={snapshot.mistakes} topics={snapshot.topics} />

      <ResultActions
        canRetryMistakes={canRetryMistakes}
        {...(onRetryMistakes === undefined ? {} : { onRetryMistakes })}
      />
    </section>
  );
}
