"use client";

import { useEffect, useMemo, useState } from "react";
import type { VocabItem } from "@/lib/types";
import { getDueCards, getSrsStats, loadProgress, updateSrs } from "@/lib/progress";
import type { SrsRating } from "@/lib/types";

type Direction = "ko-ru" | "ru-ko";

export function AnkiSession({ words, domainId }: { words: VocabItem[]; domainId: string }) {
  const cardIds = useMemo(() => words.map((w) => `${domainId}:${w.id}`), [words, domainId]);
  const [queue, setQueue] = useState<string[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [direction, setDirection] = useState<Direction>("ko-ru");
  const [stats, setStats] = useState(() => getSrsStats(cardIds));

  useEffect(() => {
    loadProgress();
    const due = getDueCards(cardIds);
    const fresh = due.length > 0 ? due : cardIds.slice(0, Math.min(10, cardIds.length));
    setQueue(fresh);
    setStats(getSrsStats(cardIds));
  }, [cardIds]);

  const currentId = queue[0];
  const word = words.find((w) => `${domainId}:${w.id}` === currentId);

  function rate(rating: SrsRating) {
    if (!currentId) return;
    updateSrs(currentId, rating);
    setFlipped(false);
    setQueue((q) => q.slice(1));
    setStats(getSrsStats(cardIds));
  }

  if (!word) {
    return (
      <div className="panel rounded-2xl p-8 text-center">
        <p className="font-display text-3xl font-semibold">На сегодня всё</p>
        <p className="mt-3 text-[var(--ink-soft)]">
          Новых: {stats.newCount} · К повтору: {stats.dueCount} · В процессе: {stats.learnedCount}
        </p>
        <button
          type="button"
          className="mt-6 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white"
          onClick={() => {
            setQueue(cardIds.slice(0, Math.min(10, cardIds.length)));
            setFlipped(false);
          }}
        >
          Повторить ещё раз
        </button>
      </div>
    );
  }

  const front = direction === "ko-ru" ? word.ko : word.ru;
  const back = direction === "ko-ru" ? word.ru : word.ko;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--ink-soft)]">
        <p>
          Осталось: {queue.length} · новых {stats.newCount} · к повтору {stats.dueCount}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setDirection("ko-ru")}
            className={`rounded-full px-3 py-1.5 ${direction === "ko-ru" ? "bg-[var(--accent)] text-white" : "bg-white/70"}`}
          >
            KO → RU
          </button>
          <button
            type="button"
            onClick={() => setDirection("ru-ko")}
            className={`rounded-full px-3 py-1.5 ${direction === "ru-ko" ? "bg-[var(--accent)] text-white" : "bg-white/70"}`}
          >
            RU → KO
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="panel w-full rounded-3xl px-6 py-16 text-center transition hover:shadow-md"
      >
        <p className={`text-4xl font-semibold sm:text-5xl ${direction === "ko-ru" || flipped ? "ko-text" : ""}`}>
          {flipped ? back : front}
        </p>
        {!flipped && (
          <p className="mt-6 text-sm text-[var(--ink-soft)]">Нажмите, чтобы перевернуть</p>
        )}
        {flipped && word.examples[0] && (
          <div className="mx-auto mt-8 max-w-lg text-left">
            <p className="ko-text text-lg text-[var(--accent)]">{word.examples[0].ko}</p>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">{word.examples[0].ru}</p>
          </div>
        )}
      </button>

      {flipped && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(
            [
              ["again", "Снова", "bg-red-100 text-[var(--bad)]"],
              ["hard", "Трудно", "bg-orange-100 text-[var(--warn)]"],
              ["good", "Хорошо", "bg-emerald-100 text-[var(--ok)]"],
              ["easy", "Легко", "bg-[var(--accent-soft)] text-[var(--accent)]"],
            ] as const
          ).map(([rating, label, cls]) => (
            <button
              key={rating}
              type="button"
              onClick={() => rate(rating)}
              className={`rounded-xl px-3 py-3 text-sm font-semibold ${cls}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
