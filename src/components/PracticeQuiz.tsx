"use client";

import { useMemo, useState } from "react";
import type { ClozeExercise, ChoiceExercise } from "@/lib/types";

type Exercise =
  | (ClozeExercise & { kind?: "cloze" })
  | (ChoiceExercise & { kind: "choice" });

function isChoice(ex: Exercise): ex is ChoiceExercise & { kind: "choice" } {
  return ex.kind === "choice" || ("promptRu" in ex && !("sentenceKo" in ex));
}

export function PracticeQuiz({
  exercises,
  title,
}: {
  exercises: Exercise[];
  title: string;
}) {
  const list = useMemo(() => exercises, [exercises]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  if (list.length === 0) {
    return (
      <div className="panel rounded-2xl p-6">
        <p>Пока нет упражнений для этой тренировки.</p>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="panel rounded-2xl p-8 text-center">
        <p className="font-display text-3xl font-semibold">Готово</p>
        <p className="mt-3 text-[var(--ink-soft)]">
          Верных ответов: {correctCount} из {list.length}
        </p>
        <button
          type="button"
          className="mt-6 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white"
          onClick={() => {
            setIndex(0);
            setSelected(null);
            setCorrectCount(0);
            setFinished(false);
          }}
        >
          Ещё раз
        </button>
      </div>
    );
  }

  const current = list[index];
  const answered = selected !== null;
  const isCorrect = selected === current.answer;

  function choose(option: string) {
    if (selected) return;
    setSelected(option);
    if (option === current.answer) setCorrectCount((c) => c + 1);
  }

  function next() {
    if (index + 1 >= list.length) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
  }

  return (
    <div className="panel rounded-2xl p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between gap-3 text-sm text-[var(--ink-soft)]">
        <p className="font-medium text-[var(--ink)]">{title}</p>
        <p>
          {index + 1} / {list.length}
        </p>
      </div>

      {isChoice(current) ? (
        <div>
          <p className="text-lg font-medium">{current.promptRu}</p>
          {current.promptKo && (
            <p className="ko-text mt-2 text-xl text-[var(--accent)]">{current.promptKo}</p>
          )}
        </div>
      ) : (
        <div>
          <p className="ko-text text-2xl font-medium leading-relaxed sm:text-3xl">
            {current.sentenceKo.split("{{blank}}").map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && (
                  <span
                    className={`mx-1 inline-block min-w-16 border-b-2 px-2 text-center ${
                      answered
                        ? isCorrect
                          ? "border-[var(--ok)] text-[var(--ok)]"
                          : "border-[var(--bad)] text-[var(--bad)]"
                        : "border-[var(--accent)]"
                    }`}
                  >
                    {answered ? selected : "···"}
                  </span>
                )}
              </span>
            ))}
          </p>
          <p className="mt-3 text-[var(--ink-soft)]">{current.translationRu}</p>
        </div>
      )}

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {current.options.map((option) => {
          let style = "bg-white/80 hover:bg-white";
          if (answered) {
            if (option === current.answer) style = "bg-[var(--accent-soft)] ring-2 ring-[var(--ok)]";
            else if (option === selected) style = "bg-red-50 ring-2 ring-[var(--bad)]";
            else style = "bg-white/50 opacity-60";
          } else if (selected === option) {
            style = "bg-[var(--accent-soft)]";
          }

          return (
            <button
              key={option}
              type="button"
              onClick={() => choose(option)}
              className={`ko-text rounded-xl border border-[var(--line)] px-4 py-3 text-left text-lg transition ${style}`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className={`font-medium ${isCorrect ? "text-[var(--ok)]" : "text-[var(--bad)]"}`}>
            {isCorrect ? "Верно" : `Правильный ответ: ${current.answer}`}
          </p>
          <button
            type="button"
            onClick={next}
            className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white"
          >
            {index + 1 >= list.length ? "Итог" : "Дальше"}
          </button>
        </div>
      )}
    </div>
  );
}
