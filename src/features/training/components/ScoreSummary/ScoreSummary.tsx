import styles from "./ScoreSummary.module.css";

export type ScoreSummaryProps = {
  readonly correctCount: number;
  readonly totalCount: number;
  readonly score: number;
  readonly maxScore: number;
  readonly percentage: number;
};

export function ScoreSummary({
  correctCount,
  maxScore,
  percentage,
  score,
  totalCount,
}: ScoreSummaryProps) {
  return (
    <section aria-labelledby="training-score-title" className={styles.summary}>
      <h2 className={styles.title} id="training-score-title">
        Итог
      </h2>
      <dl className={styles.stats}>
        <div className={styles.stat}>
          <dt>Верных ответов</dt>
          <dd>
            <span className={styles.value}>
              {correctCount} из {totalCount}
            </span>
          </dd>
        </div>
        <div className={styles.stat}>
          <dt>Баллы</dt>
          <dd>
            <span className={styles.value}>
              {score} из {maxScore}
            </span>
          </dd>
        </div>
        <div className={styles.stat}>
          <dt>Процент</dt>
          <dd>
            <span aria-label={`Процент успеха: ${percentage}`} className={styles.value}>
              {percentage}%
            </span>
          </dd>
        </div>
      </dl>
    </section>
  );
}
