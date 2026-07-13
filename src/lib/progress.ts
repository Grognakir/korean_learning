import type { ProgressState, SrsCardState, SrsRating } from "@/lib/types";

const STORAGE_KEY = "korean-learning-progress-v1";

const defaultProgress = (): ProgressState => ({
  srs: {},
  studiedGrammar: [],
  studiedTopics: [],
  studiedDomains: [],
});

export function loadProgress(): ProgressState {
  if (typeof window === "undefined") return defaultProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    return { ...defaultProgress(), ...JSON.parse(raw) };
  } catch {
    return defaultProgress();
  }
}

export function saveProgress(progress: ProgressState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function markStudied(
  kind: "studiedGrammar" | "studiedTopics" | "studiedDomains",
  id: string,
) {
  const progress = loadProgress();
  if (!progress[kind].includes(id)) {
    progress[kind] = [...progress[kind], id];
    saveProgress(progress);
  }
  return progress;
}

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

function defaultCard(): SrsCardState {
  return {
    ease: 2.5,
    interval: 0,
    repetitions: 0,
    dueAt: Date.now(),
  };
}

/** Simplified SM-2 */
export function rateCard(state: SrsCardState | undefined, rating: SrsRating): SrsCardState {
  const card = state ?? defaultCard();
  let { ease, interval, repetitions } = card;

  if (rating === "again") {
    repetitions = 0;
    interval = 1 * MINUTE;
    ease = Math.max(1.3, ease - 0.2);
  } else if (rating === "hard") {
    repetitions += 1;
    interval = Math.max(interval * 1.2, 10 * MINUTE);
    ease = Math.max(1.3, ease - 0.15);
  } else if (rating === "good") {
    repetitions += 1;
    if (repetitions === 1) interval = DAY;
    else if (repetitions === 2) interval = 3 * DAY;
    else interval = Math.round(interval * ease);
    ease += 0.0;
  } else {
    repetitions += 1;
    if (repetitions === 1) interval = 3 * DAY;
    else if (repetitions === 2) interval = 7 * DAY;
    else interval = Math.round(interval * ease * 1.3);
    ease += 0.15;
  }

  return {
    ease,
    interval,
    repetitions,
    dueAt: Date.now() + interval,
    lastRating: rating,
  };
}

export function updateSrs(cardId: string, rating: SrsRating): ProgressState {
  const progress = loadProgress();
  progress.srs[cardId] = rateCard(progress.srs[cardId], rating);
  saveProgress(progress);
  return progress;
}

export function getDueCards(cardIds: string[], now = Date.now()): string[] {
  const progress = loadProgress();
  return cardIds.filter((id) => {
    const state = progress.srs[id];
    if (!state) return true;
    return state.dueAt <= now;
  });
}

export function getSrsStats(cardIds: string[]) {
  const progress = loadProgress();
  let newCount = 0;
  let dueCount = 0;
  let learnedCount = 0;
  const now = Date.now();

  for (const id of cardIds) {
    const state = progress.srs[id];
    if (!state) newCount += 1;
    else if (state.dueAt <= now) dueCount += 1;
    else if (state.repetitions > 0) learnedCount += 1;
  }

  return { newCount, dueCount, learnedCount, total: cardIds.length };
}
