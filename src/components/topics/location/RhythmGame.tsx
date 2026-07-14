"use client";

import { useEffect, useRef, useState } from "react";
import type { VocabWord } from "@/content/topics/location";

type RhythmGameProps = {
  vocab: VocabWord[];
};

type Phase = "start" | "playing" | "result";

type FallingWord = {
  word: VocabWord;
  lane: number;
  labels: [VocabWord, VocabWord, VocabWord];
  startedAt: number;
  durationMs: number;
};

type Flash = {
  kind: "ok" | "bad";
  lane: number;
  until: number;
  note?: string;
};

const TARGET_WORDS = 30;
const START_LIVES = 3;
const START_DURATION_MS = 4000;
const MIN_DURATION_MS = 1500;
const FEEDBACK_MS = 800;

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

function multiplierForStreak(streak: number): number {
  if (streak >= 10) {
    return 3;
  }
  if (streak >= 5) {
    return 2;
  }
  return 1;
}

function fallDurationMs(resolvedCount: number): number {
  const steps = Math.floor(resolvedCount / 5);
  const duration = START_DURATION_MS * 0.92 ** steps;
  return Math.max(MIN_DURATION_MS, duration);
}

function pickLabels(target: VocabWord, pool: VocabWord[]): [VocabWord, VocabWord, VocabWord] {
  const distractors = shuffle(pool.filter((item) => item.ko !== target.ko)).slice(0, 2);
  while (distractors.length < 2 && pool.length > 0) {
    distractors.push(pool[distractors.length % pool.length]);
  }
  const correctLane = Math.floor(Math.random() * 3);
  const labels: VocabWord[] = [];
  let d = 0;
  for (let lane = 0; lane < 3; lane += 1) {
    if (lane === correctLane) {
      labels.push(target);
    } else {
      labels.push(distractors[d] ?? target);
      d += 1;
    }
  }
  return labels as [VocabWord, VocabWord, VocabWord];
}

export function RhythmGame({ vocab }: RhythmGameProps) {
  const [phase, setPhase] = useState<Phase>("start");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(START_LIVES);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [resolved, setResolved] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState<VocabWord[]>([]);
  const [falling, setFalling] = useState<FallingWord | null>(null);
  const [progress, setProgress] = useState(0);
  const [flash, setFlash] = useState<Flash | null>(null);
  const [paused, setPaused] = useState(false);
  const [now, setNow] = useState(0);

  const queueRef = useRef<VocabWord[]>([]);
  const resolvedRef = useRef(0);
  const livesRef = useRef(START_LIVES);
  const streakRef = useRef(0);
  const scoreRef = useRef(0);
  const hitsRef = useRef(0);
  const missesRef = useRef<VocabWord[]>([]);
  const bestStreakRef = useRef(0);
  const fallingRef = useRef<FallingWord | null>(null);
  const flashRef = useRef<Flash | null>(null);
  const pausedRef = useRef(false);
  const phaseRef = useRef<Phase>("start");
  const pauseStartedAtRef = useRef<number | null>(null);
  const finishingRef = useRef(false);
  const resolvingRef = useRef(false);
  const timeoutsRef = useRef<number[]>([]);
  const handleLaneRef = useRef<(lane: number) => void>(() => {});
  const registerMissRef = useRef<
    (word: VocabWord, lane: number, at: number, note: string) => void
  >(() => {});

  function clearTimeouts() {
    for (const id of timeoutsRef.current) {
      window.clearTimeout(id);
    }
    timeoutsRef.current = [];
  }

  function later(fn: () => void, ms: number) {
    const id = window.setTimeout(fn, ms);
    timeoutsRef.current.push(id);
  }

  function spawnWord(at: number) {
    if (finishingRef.current || resolvingRef.current) {
      return;
    }
    if (resolvedRef.current >= TARGET_WORDS || livesRef.current <= 0) {
      finishingRef.current = true;
      clearTimeouts();
      setFalling(null);
      setPhase("result");
      return;
    }
    if (vocab.length === 0) {
      finishingRef.current = true;
      setPhase("result");
      return;
    }
    if (queueRef.current.length === 0) {
      queueRef.current = shuffle(vocab);
    }
    const word = queueRef.current.shift();
    if (!word) {
      finishingRef.current = true;
      setPhase("result");
      return;
    }
    const next: FallingWord = {
      word,
      lane: Math.floor(Math.random() * 3),
      labels: pickLabels(word, vocab),
      startedAt: at,
      durationMs: fallDurationMs(resolvedRef.current),
    };
    fallingRef.current = next;
    setFalling(next);
    setProgress(0);
  }

  function finishGame() {
    if (finishingRef.current) {
      return;
    }
    finishingRef.current = true;
    resolvingRef.current = false;
    clearTimeouts();
    fallingRef.current = null;
    setFalling(null);
    setPhase("result");
  }

  function registerMiss(word: VocabWord, lane: number, at: number, note: string) {
    if (resolvingRef.current) {
      return;
    }
    resolvingRef.current = true;
    livesRef.current = Math.max(0, livesRef.current - 1);
    streakRef.current = 0;
    missesRef.current = [...missesRef.current, word];
    resolvedRef.current += 1;

    setLives(livesRef.current);
    setStreak(0);
    setMisses(missesRef.current);
    setResolved(resolvedRef.current);
    const nextFlash = { kind: "bad" as const, lane, until: at + FEEDBACK_MS, note };
    flashRef.current = nextFlash;
    setFlash(nextFlash);
    fallingRef.current = null;
    setFalling(null);

    if (livesRef.current <= 0 || resolvedRef.current >= TARGET_WORDS) {
      later(() => finishGame(), FEEDBACK_MS);
      return;
    }
    later(() => {
      resolvingRef.current = false;
      if (phaseRef.current === "playing") {
        spawnWord(performance.now());
      }
    }, FEEDBACK_MS);
  }

  function registerHit(lane: number, at: number) {
    if (resolvingRef.current) {
      return;
    }
    resolvingRef.current = true;
    streakRef.current += 1;
    bestStreakRef.current = Math.max(bestStreakRef.current, streakRef.current);
    scoreRef.current += 10 * multiplierForStreak(streakRef.current);
    hitsRef.current += 1;
    resolvedRef.current += 1;

    setStreak(streakRef.current);
    setBestStreak(bestStreakRef.current);
    setScore(scoreRef.current);
    setHits(hitsRef.current);
    setResolved(resolvedRef.current);
    const nextFlash = { kind: "ok" as const, lane, until: at + FEEDBACK_MS };
    flashRef.current = nextFlash;
    setFlash(nextFlash);
    fallingRef.current = null;
    setFalling(null);

    if (resolvedRef.current >= TARGET_WORDS) {
      later(() => finishGame(), FEEDBACK_MS);
      return;
    }
    later(() => {
      resolvingRef.current = false;
      if (phaseRef.current === "playing") {
        spawnWord(performance.now());
      }
    }, FEEDBACK_MS);
  }

  function handleLane(lane: number) {
    if (phaseRef.current !== "playing" || pausedRef.current || resolvingRef.current) {
      return;
    }
    const current = fallingRef.current;
    const at = performance.now();
    if (!current) {
      return;
    }
    if (flashRef.current && flashRef.current.until > at) {
      return;
    }
    if (current.labels[lane].ko === current.word.ko) {
      registerHit(lane, at);
      return;
    }
    registerMiss(current.word, lane, at, `Нужно: ${current.word.ru}`);
  }

  function startGame() {
    clearTimeouts();
    finishingRef.current = false;
    resolvingRef.current = false;
    queueRef.current = shuffle(vocab);
    resolvedRef.current = 0;
    livesRef.current = START_LIVES;
    streakRef.current = 0;
    scoreRef.current = 0;
    hitsRef.current = 0;
    missesRef.current = [];
    bestStreakRef.current = 0;
    pauseStartedAtRef.current = null;

    setScore(0);
    setLives(START_LIVES);
    setStreak(0);
    setBestStreak(0);
    setResolved(0);
    setHits(0);
    setMisses([]);
    setFlash(null);
    flashRef.current = null;
    setPaused(false);
    setPhase("playing");
    spawnWord(performance.now());
  }

  useEffect(() => {
    fallingRef.current = falling;
    flashRef.current = flash;
    pausedRef.current = paused;
    phaseRef.current = phase;
    handleLaneRef.current = handleLane;
    registerMissRef.current = registerMiss;
  });

  useEffect(() => {
    if (phase !== "playing") {
      return;
    }

    let frame = 0;
    let alive = true;

    const onVisibility = () => {
      if (document.hidden) {
        pausedRef.current = true;
        pauseStartedAtRef.current = performance.now();
        setPaused(true);
        return;
      }
      const pauseStarted = pauseStartedAtRef.current;
      const current = fallingRef.current;
      if (pauseStarted !== null && current) {
        const pausedFor = performance.now() - pauseStarted;
        const resumed = { ...current, startedAt: current.startedAt + pausedFor };
        fallingRef.current = resumed;
        setFalling(resumed);
      }
      pauseStartedAtRef.current = null;
      pausedRef.current = false;
      setPaused(false);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "1") {
        handleLaneRef.current(0);
      } else if (event.key === "2") {
        handleLaneRef.current(1);
      } else if (event.key === "3") {
        handleLaneRef.current(2);
      }
    };

    const tick = (timestamp: number) => {
      if (!alive) {
        return;
      }
      setNow(timestamp);
      const currentFlash = flashRef.current;
      if (currentFlash && currentFlash.until <= timestamp) {
        flashRef.current = null;
        setFlash(null);
      }

      const current = fallingRef.current;
      if (current && !pausedRef.current && !resolvingRef.current) {
        const elapsed = timestamp - current.startedAt;
        const ratio = Math.min(1, elapsed / current.durationMs);
        setProgress(ratio);
        if (ratio >= 1) {
          registerMissRef.current(
            current.word,
            current.lane,
            timestamp,
            `Нужно: ${current.word.ru}`,
          );
        }
      }

      frame = window.requestAnimationFrame(tick);
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("keydown", onKey);
    frame = window.requestAnimationFrame(tick);

    return () => {
      alive = false;
      window.cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("keydown", onKey);
      clearTimeouts();
    };
  }, [phase]);

  const uniqueMisses = (() => {
    const seen = new Set<string>();
    const list: VocabWord[] = [];
    for (const item of misses) {
      if (seen.has(item.ko)) {
        continue;
      }
      seen.add(item.ko);
      list.push(item);
    }
    return list;
  })();

  const accuracy = resolved === 0 ? 0 : Math.round((hits / resolved) * 100);

  if (phase === "start") {
    return (
      <section className="panel space-y-4 rounded-2xl p-6">
        <h2 className="font-display text-2xl font-semibold">Ритм-слова</h2>
        <p className="leading-relaxed text-[var(--ink-soft)]">
          Сверху падает корейское слово. Нажмите полосу с нужным переводом
          (клик или клавиши 1 / 2 / 3), пока слово не долетело до низа. Три
          жизни, скорость растёт. Раунд — до 30 слов.
        </p>
        <button
          type="button"
          onClick={startGame}
          className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Начать
        </button>
      </section>
    );
  }

  if (phase === "result") {
    return (
      <section className="panel space-y-4 rounded-2xl p-6">
        <h2 className="font-display text-2xl font-semibold">Результат</h2>
        <ul className="space-y-1 text-[var(--ink-soft)]">
          <li>Очки: {score}</li>
          <li>Точность: {accuracy}%</li>
          <li>Лучшая серия: {bestStreak}</li>
        </ul>
        {uniqueMisses.length > 0 ? (
          <div>
            <p className="mb-2 font-semibold text-[var(--ink)]">Ошибки для повторения</p>
            <ul className="space-y-1">
              {uniqueMisses.map((item) => (
                <li key={item.ko} className="text-sm text-[var(--ink-soft)]">
                  <span className="ko-text font-medium text-[var(--ink)]">{item.ko}</span>
                  {" — "}
                  {item.ru}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-[var(--ok)]">Без ошибок!</p>
        )}
        <button
          type="button"
          onClick={startGame}
          className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Ещё раз
        </button>
      </section>
    );
  }

  return (
    <section className="panel space-y-4 rounded-2xl p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex flex-wrap gap-3 text-[var(--ink-soft)]">
          <span>Очки: {score}</span>
          <span>
            Серия: {streak} (×{multiplierForStreak(streak)})
          </span>
          <span>
            Слова: {resolved}/{TARGET_WORDS}
          </span>
        </div>
        <div className="flex gap-1" aria-label={`Жизни: ${lives}`}>
          {Array.from({ length: START_LIVES }, (_, index) => (
            <span
              key={index}
              className={`inline-block h-3 w-3 rounded-full ${
                index < lives ? "bg-[var(--bad)]" : "bg-[var(--line)]"
              }`}
            />
          ))}
        </div>
      </div>

      {paused ? (
        <p className="rounded-xl bg-[#f8e8dc] px-3 py-2 text-sm text-[var(--warn)]">
          Пауза — вернитесь на вкладку браузера
        </p>
      ) : null}

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {[0, 1, 2].map((lane) => {
          const label = falling?.labels[lane];
          const isFlash = Boolean(flash && flash.lane === lane && flash.until > now);
          return (
            <button
              key={lane}
              type="button"
              onClick={() => handleLane(lane)}
              className={`relative flex min-h-[280px] flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-white/80 text-left transition sm:min-h-[340px] ${
                isFlash && flash?.kind === "ok"
                  ? "ring-2 ring-[var(--ok)]"
                  : isFlash && flash?.kind === "bad"
                    ? "ring-2 ring-[var(--bad)]"
                    : "hover:border-[var(--accent)]"
              }`}
            >
              <div className="relative min-h-0 flex-1">
                {falling && falling.lane === lane ? (
                  <div
                    className="pointer-events-none absolute left-1/2 top-0 z-10"
                    style={{
                      transform: `translate(-50%, ${progress * 100}%)`,
                    }}
                  >
                    <span
                      className={`ko-text block rounded-xl px-3 py-2 text-2xl font-bold sm:text-3xl ${
                        isFlash && flash?.kind === "ok"
                          ? "bg-[var(--accent-soft)] text-[var(--ok)]"
                          : isFlash && flash?.kind === "bad"
                            ? "bg-[#f8e0e0] text-[var(--bad)]"
                            : "bg-[var(--panel-solid)] text-[var(--ink)]"
                      }`}
                    >
                      {falling.word.ko}
                    </span>
                  </div>
                ) : null}
                {isFlash && flash?.note && flash.kind === "bad" ? (
                  <p className="absolute inset-x-2 bottom-2 z-20 rounded-lg bg-[#f8e0e0] px-2 py-1 text-center text-xs text-[var(--bad)]">
                    {flash.note}
                  </p>
                ) : null}
              </div>
              <div className="border-t border-[var(--line)] bg-[var(--accent-soft)]/50 px-2 py-3 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--ink-soft)]">
                  {lane + 1}
                </p>
                <p className="mt-1 min-h-[2.5rem] text-sm font-semibold leading-snug text-[var(--ink)]">
                  {label?.ru ?? "—"}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
