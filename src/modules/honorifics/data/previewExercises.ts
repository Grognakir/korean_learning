import type { Exercise } from "@/features/training";

import { honorificsPreviewModule } from "../domain/previewModule";

const grandparentsAgeTopicId = honorificsPreviewModule.topics[0].id;
const professionTopicId = honorificsPreviewModule.topics[1].id;

const exerciseDefaults = {
  schemaVersion: 1,
  moduleSlug: honorificsPreviewModule.slug,
  difficulty: "easy",
  contentVersion: "0.1.0",
  scoring: { points: 1, partialCredit: false },
} as const;

const ageMeaningOptions = [
  { id: "age-honorific", label: { ko: null, ru: "возраст (уважительно)" } },
  { id: "name", label: { ko: null, ru: "имя" } },
] as const;

const ageHonorificOptions = [
  { id: "age", label: { ko: "연세", ru: null } },
  { id: "name", label: { ko: "성함", ru: null } },
] as const;

const agePlainOptions = [
  { id: "age", label: { ko: "나이", ru: null } },
  { id: "name", label: { ko: "이름", ru: null } },
] as const;

const ageHonorificPairs = [
  { id: "age", left: { ko: "나이", ru: null }, right: { ko: "연세", ru: null } },
  { id: "exist", left: { ko: "있다", ru: null }, right: { ko: "계시다", ru: null } },
] as const;

const grandparentsTranslationPairs = [
  { id: "grandfather", left: { ko: "할아버지", ru: null }, right: { ko: null, ru: "дедушка" } },
  { id: "grandmother", left: { ko: "할머니", ru: null }, right: { ko: null, ru: "бабушка" } },
] as const;

const teacherMeaningOptions = [
  { id: "teacher", label: { ko: null, ru: "учитель / преподаватель" } },
  { id: "doctor", label: { ko: null, ru: "врач" } },
] as const;

const doHonorificOptions = [
  { id: "do", label: { ko: "하시다", ru: null } },
  { id: "exist", label: { ko: "계시다", ru: null } },
] as const;

const professionTranslationPairs = [
  { id: "doctor", left: { ko: "의사", ru: null }, right: { ko: null, ru: "врач" } },
  { id: "teacher", left: { ko: "선생님", ru: null }, right: { ko: null, ru: "учитель" } },
] as const;

/**
 * Draft preview exercises for UI validation only.
 * Keep prompts and accepted answers unambiguous; do not treat as approved content.
 */
export const honorificsPreviewExercises = [
  {
    ...exerciseDefaults,
    id: "7d1fb0bf-981a-427c-bb62-4776a6eefe0a",
    logicalId: "choose-age-honorific-meaning",
    topicIds: [grandparentsAgeTopicId],
    type: "meaning-choice",
    prompt: { ko: "연세", ru: "Выберите значение слова." },
    explanation: {
      ko: null,
      ru: "연세 — уважительный эквивалент слова «возраст» (나이).",
    },
    options: ageMeaningOptions,
    correctOptionId: "age-honorific",
  },
  {
    ...exerciseDefaults,
    id: "7367e7b2-1846-49c3-a759-adcc7fbb8677",
    logicalId: "choose-honorific-age",
    topicIds: [grandparentsAgeTopicId],
    type: "honorific-choice",
    prompt: { ko: "나이", ru: "Выберите уважительный эквивалент." },
    explanation: { ko: null, ru: "Уважительная форма для 나이 — 연세." },
    options: ageHonorificOptions,
    correctOptionId: "age",
  },
  {
    ...exerciseDefaults,
    id: "959c016b-3163-4f13-8104-d373e78b2f4c",
    logicalId: "choose-plain-age",
    topicIds: [grandparentsAgeTopicId],
    type: "plain-choice",
    prompt: { ko: "연세", ru: "Выберите обычный эквивалент." },
    explanation: { ko: null, ru: "Обычная форма для 연세 — 나이." },
    options: agePlainOptions,
    correctOptionId: "age",
  },
  {
    ...exerciseDefaults,
    id: "5cc8f840-9820-49df-8133-cdf0baf96da5",
    logicalId: "write-age-honorific",
    topicIds: [grandparentsAgeTopicId],
    type: "free-response",
    prompt: {
      ko: null,
      ru: "Напишите по-корейски уважительное слово «возраст».",
    },
    explanation: {
      ko: null,
      ru: "연세 используют, говоря о возрасте старших, например дедушки или бабушки.",
    },
    answerLanguage: "ko",
    acceptedAnswers: [{ id: "canonical", value: "연세", isCanonical: true }],
  },
  {
    ...exerciseDefaults,
    id: "8a723fcc-bb45-49b0-8416-6c7796126a51",
    logicalId: "match-age-exist-honorifics",
    topicIds: [grandparentsAgeTopicId],
    type: "matching-honorific",
    prompt: { ko: null, ru: "Сопоставьте обычные и уважительные формы." },
    explanation: { ko: null, ru: "나이 — 연세, 있다 — 계시다." },
    scoring: { points: 2, partialCredit: true },
    pairs: ageHonorificPairs,
  },
  {
    ...exerciseDefaults,
    id: "ff6fcb3a-6564-4c5a-9477-73a3357f3691",
    logicalId: "fill-grandfather-age",
    topicIds: [grandparentsAgeTopicId],
    type: "fill-blank",
    prompt: {
      ko: null,
      ru: "Вставьте уважительное слово «возраст» в вопрос о дедушке.",
    },
    explanation: {
      ko: null,
      ru: "О возрасте дедушки вежливо спрашивают с 연세: 할아버지 연세가 어떻게 되세요?",
    },
    template: "할아버지 {{age}}가 어떻게 되세요?",
    templateLanguage: "ko",
    blanks: [
      {
        id: "age",
        acceptedAnswers: [{ id: "canonical", value: "연세", isCanonical: true }],
      },
    ],
  },
  {
    ...exerciseDefaults,
    id: "e4c21381-9734-4459-aa01-7da2ffa02edb",
    logicalId: "match-grandparents-translation",
    topicIds: [grandparentsAgeTopicId],
    type: "matching-translation",
    prompt: { ko: null, ru: "Сопоставьте корейские слова и значения." },
    explanation: { ko: null, ru: "할아버지 — дедушка, 할머니 — бабушка." },
    scoring: { points: 2, partialCredit: true },
    pairs: grandparentsTranslationPairs,
  },
  {
    ...exerciseDefaults,
    id: "b79dd415-5519-432a-ba78-cfd126d6e69c",
    logicalId: "choose-teacher-meaning",
    topicIds: [professionTopicId],
    type: "meaning-choice",
    prompt: { ko: "선생님", ru: "Выберите значение слова." },
    explanation: {
      ko: null,
      ru: "선생님 — учитель или преподаватель; вежливое обращение по профессии.",
    },
    options: teacherMeaningOptions,
    correctOptionId: "teacher",
  },
  {
    ...exerciseDefaults,
    id: "aa43ae20-5778-4493-bf89-c4ab1b7948a4",
    logicalId: "choose-honorific-do",
    topicIds: [professionTopicId],
    type: "honorific-choice",
    prompt: { ko: "하다", ru: "Выберите уважительный эквивалент." },
    explanation: {
      ko: null,
      ru: "Уважительная форма глагола 하다 — 하시다 (например, в вопросе о работе).",
    },
    options: doHonorificOptions,
    correctOptionId: "do",
  },
  {
    ...exerciseDefaults,
    id: "96caf41c-cf1f-48ad-91bf-9040f1ad9c77",
    logicalId: "fill-profession-question",
    topicIds: [professionTopicId],
    type: "fill-blank",
    prompt: {
      ko: null,
      ru: "Вставьте вежливую форму глагола в вопрос о профессии.",
    },
    explanation: {
      ko: null,
      ru: "Вежливый вопрос о работе: 무슨 일을 하세요?",
    },
    template: "무슨 일을 {{do}}?",
    templateLanguage: "ko",
    blanks: [
      {
        id: "do",
        acceptedAnswers: [{ id: "canonical", value: "하세요", isCanonical: true }],
      },
    ],
  },
  {
    ...exerciseDefaults,
    id: "27a42e3d-7cc4-4c7e-8691-cec9923e9f50",
    logicalId: "match-profession-translation",
    topicIds: [professionTopicId],
    type: "matching-translation",
    prompt: { ko: null, ru: "Сопоставьте профессии и значения." },
    explanation: { ko: null, ru: "의사 — врач, 선생님 — учитель." },
    scoring: { points: 2, partialCredit: true },
    pairs: professionTranslationPairs,
  },
] as const satisfies readonly Exercise[];
