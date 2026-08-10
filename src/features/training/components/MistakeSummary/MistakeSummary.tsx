import { BilingualTitle } from "@/features/catalog/presentation/BilingualTitle";
import { formatGrammarPatternDisplay } from "@/features/catalog/presentation/formatGrammarPatternDisplay";

import type { TrainingResultMistake, TrainingResultTopicBreakdown } from "../../domain";
import { toExerciseTextView } from "../../presentation";
import { ExerciseText } from "../ExerciseText";

import styles from "./MistakeSummary.module.css";

export type MistakeSummaryProps = {
  readonly mistakes: readonly TrainingResultMistake[];
  readonly topics: readonly TrainingResultTopicBreakdown[];
};

function reasonLabel(reasonCode: TrainingResultMistake["reasonCode"]): string {
  switch (reasonCode) {
    case "partially-correct":
      return "Частично верно";
    case "empty-answer":
      return "Пустой ответ";
    case "invalid-submission":
      return "Некорректный ответ";
    case "unknown-reference":
      return "Неизвестный вариант";
    case "incorrect":
    default:
      return "Неверно";
  }
}

export function MistakeSummary({ mistakes, topics }: MistakeSummaryProps) {
  return (
    <div className={styles.root}>
      {topics.length > 0 ? (
        <section aria-labelledby="training-topics-title" className={styles.section}>
          <h2 className={styles.title} id="training-topics-title">
            По темам
          </h2>
          <ul className={styles.topicList}>
            {topics.map((topic) => (
              <li className={styles.topicItem} key={topic.topicId}>
                <div className={styles.topicHeading}>
                  <BilingualTitle
                    ko={topic.title.ko ? formatGrammarPatternDisplay(topic.title.ko) : ""}
                    ru={topic.title.ru}
                  />
                </div>
                <p className={styles.topicMeta}>
                  Верно {topic.correctCount} из {topic.gradedCount} · {topic.score} /{" "}
                  {topic.maxScore} баллов
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="training-mistakes-title" className={styles.section}>
        <h2 className={styles.title} id="training-mistakes-title">
          Ошибки
        </h2>
        {mistakes.length === 0 ? (
          <p className={styles.empty}>Ошибок нет — отличный результат.</p>
        ) : (
          <ul className={styles.mistakeList}>
            {mistakes.map((mistake) => {
              const prompt = toExerciseTextView(mistake.prompt);
              const explanation = toExerciseTextView(mistake.explanation);

              return (
                <li className={styles.mistakeItem} key={mistake.exerciseId}>
                  <p className={styles.mistakeStatus}>{reasonLabel(mistake.reasonCode)}</p>
                  <div className={styles.prompt}>
                    <ExerciseText text={prompt} />
                  </div>
                  <dl className={styles.answerGrid}>
                    <div>
                      <dt>Ваш ответ</dt>
                      <dd>{mistake.userAnswerLabel}</dd>
                    </div>
                    <div>
                      <dt>Правильный ответ</dt>
                      <dd>{mistake.canonicalAnswerLabel}</dd>
                    </div>
                  </dl>
                  {explanation.ko || explanation.ru ? (
                    <div className={styles.explanation}>
                      <ExerciseText as="p" text={explanation} />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
