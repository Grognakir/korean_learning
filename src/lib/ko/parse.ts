import {
  andParticle,
  hasBatchim,
  isHangul,
  subjectParticle,
  topicParticle,
} from "@/lib/ko/hangul";
import { findLexeme, positionWords } from "@/lib/ko/lexicon";
import type { SpatialRelation } from "@/lib/scene/types";

export type ParsedSentence = {
  ok: true;
  subjectId: string;
  relation: SpatialRelation;
  refIds: string[];
};

export type ParseError = {
  ok: false;
  errorRu: string;
  hintRu?: string;
};

export type ParseResult = ParsedSentence | ParseError;

export const conjugationForms = ["있어요", "있습니다", "있다"] as const;

const SUBJECT_PARTICLES = ["이", "가", "은", "는"] as const;
const AND_PARTICLES = ["하고", "과", "와"] as const;

function error(errorRu: string, hintRu?: string): ParseError {
  if (hintRu === undefined) {
    return { ok: false, errorRu };
  }
  return { ok: false, errorRu, hintRu };
}

function normalize(input: string): string {
  return input
    .trim()
    .replace(/\s+/gu, " ")
    .replace(/[.!?。！？]+$/u, "");
}

function stripEnding(
  token: string,
  endings: readonly string[],
): { stem: string; ending: string } | null {
  const ordered = [...endings].sort((a, b) => b.length - a.length);
  for (const ending of ordered) {
    if (token.endsWith(ending) && token.length > ending.length) {
      return { stem: token.slice(0, -ending.length), ending };
    }
  }
  return null;
}

function batchimLabel(word: string): string {
  return hasBatchim(word)
    ? "заканчивается на согласный"
    : "заканчивается на гласный";
}

function expectedSubjectParticle(word: string, particle: string): string {
  if (particle === "은" || particle === "는") {
    return topicParticle(word);
  }
  return subjectParticle(word);
}

function validateSubjectParticle(
  word: string,
  particle: string,
): ParseError | null {
  const expected = expectedSubjectParticle(word, particle);
  if (particle === expected) {
    return null;
  }
  return error(
    `После «${word}» (${batchimLabel(word)}) нужна частица ${expected}`,
    `${word}${expected} …`,
  );
}

function validateAndParticle(word: string, particle: string): ParseError | null {
  if (particle === "하고") {
    return null;
  }
  const expected = andParticle(word);
  if (particle === expected) {
    return null;
  }
  return error(
    `После «${word}» (${batchimLabel(word)}) нужна частица ${expected}`,
    `${word}${expected} …`,
  );
}

type ResolvedLexeme = { id: string; ko: string };

function resolveLexeme(
  ko: string,
  allowedIds: Set<string>,
): ParseError | ResolvedLexeme {
  const lexeme = findLexeme(ko);
  if (!lexeme) {
    return error(`Неизвестное слово: «${ko}»`);
  }
  if (!allowedIds.has(lexeme.id)) {
    return error(`Слово «${ko}» не относится к текущей сцене`);
  }
  return { id: lexeme.id, ko: lexeme.ko };
}

function findRelation(posKo: string): SpatialRelation | null {
  const entry = positionWords.find((item) => item.ko.includes(posKo));
  return entry?.relation ?? null;
}

function parsePosWithE(
  token: string,
): { relation: SpatialRelation; posKo: string } | null {
  if (!token.endsWith("에") || token.length < 2) {
    return null;
  }
  const posKo = token.slice(0, -1);
  const relation = findRelation(posKo);
  if (!relation) {
    return null;
  }
  return { relation, posKo };
}

function parseSubjectToken(
  token: string,
  allowedIds: Set<string>,
): ParseError | ResolvedLexeme {
  const stripped = stripEnding(token, SUBJECT_PARTICLES);
  if (!stripped) {
    return error("Нет подлежащего с частицей 이/가/은/는", "민수가 …");
  }

  const lexeme = findLexeme(stripped.stem);
  if (!lexeme) {
    return error(`Неизвестное слово: «${stripped.stem}»`);
  }

  const particleError = validateSubjectParticle(stripped.stem, stripped.ending);
  if (particleError) {
    return particleError;
  }

  if (!allowedIds.has(lexeme.id)) {
    return error(`Слово «${stripped.stem}» не относится к текущей сцене`);
  }

  return { id: lexeme.id, ko: lexeme.ko };
}

function parseRefToken(
  token: string,
  allowedIds: Set<string>,
  allowUi: boolean,
): ParseError | ResolvedLexeme {
  if (allowUi) {
    const withUi = stripEnding(token, ["의"]);
    if (withUi) {
      return resolveLexeme(withUi.stem, allowedIds);
    }
  }
  return resolveLexeme(token, allowedIds);
}

function requireFinalVerb(
  tokens: string[],
  index: number,
): ParseError | null {
  if (tokens.length !== index + 1) {
    return error(
      "Нет глагола 있다 в допустимой форме",
      conjugationForms.join(" / "),
    );
  }
  const token = tokens[index];
  if (!(conjugationForms as readonly string[]).includes(token)) {
    return error(
      "Нет глагола 있다 в допустимой форме",
      conjugationForms.join(" / "),
    );
  }
  return null;
}

function isParseError(value: ParseError | ResolvedLexeme): value is ParseError {
  return "ok" in value && value.ok === false;
}

export function parseLocationSentence(
  input: string,
  lexemeIds: string[],
): ParseResult {
  const normalized = normalize(input);
  if (!normalized) {
    return error("Пустой ввод");
  }
  if (!isHangul(normalized)) {
    return error("Ввод должен содержать только хангыль");
  }

  const allowedIds = new Set(lexemeIds);
  const tokens = normalized.split(" ");

  const subject = parseSubjectToken(tokens[0], allowedIds);
  if (isParseError(subject)) {
    return subject;
  }

  let index = 1;
  if (index >= tokens.length) {
    return error("Нет позиционного слова / нет 에");
  }

  const andStripped = stripEnding(tokens[index], AND_PARTICLES);
  if (andStripped && findLexeme(andStripped.stem)) {
    const andError = validateAndParticle(andStripped.stem, andStripped.ending);
    if (andError) {
      return andError;
    }

    const ref1 = resolveLexeme(andStripped.stem, allowedIds);
    if (isParseError(ref1)) {
      return ref1;
    }

    index += 1;
    if (index >= tokens.length) {
      return error("사이 требует два ориентира");
    }

    const ref2 = parseRefToken(tokens[index], allowedIds, false);
    if (isParseError(ref2)) {
      return ref2;
    }

    index += 1;
    if (index >= tokens.length) {
      return error("Нет позиционного слова / нет 에");
    }

    const pos = parsePosWithE(tokens[index]);
    if (!pos || pos.relation !== "between" || pos.posKo !== "사이") {
      return error("사이 требует два ориентира");
    }

    index += 1;
    const verbError = requireFinalVerb(tokens, index);
    if (verbError) {
      return verbError;
    }

    return {
      ok: true,
      subjectId: subject.id,
      relation: "between",
      refIds: [ref1.id, ref2.id],
    };
  }

  const maybePos = parsePosWithE(tokens[index]);
  if (maybePos) {
    return error("Нет ориентира (ссылки на объект)");
  }

  const ref = parseRefToken(tokens[index], allowedIds, true);
  if (isParseError(ref)) {
    return ref;
  }

  index += 1;
  if (index >= tokens.length) {
    return error("Нет позиционного слова / нет 에");
  }

  const pos = parsePosWithE(tokens[index]);
  if (!pos) {
    return error("Нет позиционного слова / нет 에");
  }
  if (pos.relation === "between") {
    return error("사이 требует два ориентира");
  }

  index += 1;
  const verbError = requireFinalVerb(tokens, index);
  if (verbError) {
    return verbError;
  }

  return {
    ok: true,
    subjectId: subject.id,
    relation: pos.relation,
    refIds: [ref.id],
  };
}
