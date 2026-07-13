import type { ChoiceExercise, ClozeExercise } from "@/lib/types";
import { grammar } from "./grammar";
import type { GrammarExercise } from "./exercises";

const PARTICLES = ["이", "가", "은", "는", "을", "를", "에", "에서", "도", "만", "의", "와", "과"];

const ALL_EXAMPLE_KO = grammar.flatMap((g) => g.examples.map((e) => e.ko));
const ALL_FORMS = grammar.map((g) => g.form);

const mergedCache = new Map<string, GrammarExercise[]>();

function seededShuffle<T>(items: T[], seed: string): T[] {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    hash = (hash * 1103515245 + 12345) | 0;
    const j = Math.abs(hash) % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function uniqueOptions(answer: string, pool: string[], seed: string, count = 4): string[] {
  const options = new Set<string>([answer]);
  for (const item of pool) {
    if (options.size >= count) break;
    if (item && item !== answer) options.add(item);
  }
  const fillers = PARTICLES.filter((p) => p !== answer);
  for (const item of fillers) {
    if (options.size >= count) break;
    options.add(item);
  }
  return seededShuffle([...options], seed).slice(0, count);
}

function wrongSentences(pointId: string, correct: string): string[] {
  const pointExamples = new Set(
    grammar.find((g) => g.id === pointId)?.examples.map((e) => e.ko) ?? [],
  );
  const pool: string[] = [];
  for (const ko of ALL_EXAMPLE_KO) {
    if (ko !== correct && !pointExamples.has(ko)) pool.push(ko);
    if (pool.length >= 12) break;
  }
  return pool;
}

function buildChoiceFromExample(
  grammarId: string,
  topicId: string,
  index: number,
  ko: string,
  ru: string,
): ChoiceExercise & { kind: "choice" } {
  const distractors = wrongSentences(grammarId, ko);
  return {
    kind: "choice",
    id: `gen-${grammarId}-choice-${index}`,
    promptRu: `Выберите корейское предложение: «${ru}»`,
    options: uniqueOptions(ko, distractors, `${grammarId}-choice-${index}`),
    answer: ko,
    explanation: "Проверка понимания примера из правила.",
    relatedGrammarId: grammarId,
    topicId,
  };
}

function buildFormChoice(
  grammarId: string,
  topicId: string,
  form: string,
): ChoiceExercise & { kind: "choice" } {
  const others = ALL_FORMS.filter((f) => f !== form).slice(0, 6);
  return {
    kind: "choice",
    id: `gen-${grammarId}-form`,
    promptRu: "Какая формула соответствует этому правилу?",
    promptKo: form,
    options: uniqueOptions(form, others, `${grammarId}-form`),
    answer: form,
    relatedGrammarId: grammarId,
    topicId,
  };
}

function buildParticleCloze(
  grammarId: string,
  topicId: string,
  index: number,
  ko: string,
  ru: string,
): (ClozeExercise & { kind: "cloze" }) | null {
  const match = ko.match(/([가-힣]+)([이가은는을를에에서도만의와과])(?=[\s.?!]|$)/);
  if (!match) return null;
  const [, word, particle] = match;
  const sentenceKo = ko.replace(`${word}${particle}`, `${word}{{blank}}`);
  return {
    kind: "cloze",
    id: `gen-${grammarId}-cloze-${index}`,
    sentenceKo,
    answer: particle,
    options: uniqueOptions(particle, PARTICLES, `${grammarId}-cloze-${index}`),
    translationRu: ru,
    relatedGrammarId: grammarId,
    topicId,
  };
}

export function buildGrammarSupplements(
  manual: GrammarExercise[],
  grammarId: string,
  minCount = 3,
): GrammarExercise[] {
  const point = grammar.find((g) => g.id === grammarId);
  if (!point) return [];

  const existing = manual.filter((e) => e.relatedGrammarId === grammarId);
  if (existing.length >= minCount) return [];

  const generated: GrammarExercise[] = [];
  const usedIds = new Set(existing.map((e) => e.id));

  for (let i = 0; i < point.examples.length && existing.length + generated.length < minCount; i += 1) {
    const ex = point.examples[i];
    const choice = buildChoiceFromExample(point.id, point.topicId, i, ex.ko, ex.ru);
    if (!usedIds.has(choice.id)) {
      generated.push(choice);
      usedIds.add(choice.id);
    }
  }

  for (let i = 0; i < point.examples.length && existing.length + generated.length < minCount; i += 1) {
    const ex = point.examples[i];
    const cloze = buildParticleCloze(point.id, point.topicId, i, ex.ko, ex.ru);
    if (cloze && !usedIds.has(cloze.id)) {
      generated.push(cloze);
      usedIds.add(cloze.id);
    }
  }

  if (existing.length + generated.length < minCount) {
    const form = buildFormChoice(point.id, point.topicId, point.form);
    if (!usedIds.has(form.id)) generated.push(form);
  }

  return generated.slice(0, Math.max(0, minCount - existing.length));
}

export function mergeGrammarExercises(
  manual: GrammarExercise[],
  grammarId: string,
): GrammarExercise[] {
  const cached = mergedCache.get(grammarId);
  if (cached) return cached;

  const base = manual.filter((e) => e.relatedGrammarId === grammarId);
  const result = [...base, ...buildGrammarSupplements(manual, grammarId)];
  mergedCache.set(grammarId, result);
  return result;
}
