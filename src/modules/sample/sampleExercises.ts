import type { Exercise } from "@/features/training/domain/exercise";

import { sampleModule } from "./sampleModule";

const hangulTopicId = sampleModule.topics[0].id;
const phrasesTopicId = sampleModule.topics[1].id;

const exerciseDefaults = {
  schemaVersion: 1,
  moduleSlug: sampleModule.slug,
  difficulty: "easy",
  contentVersion: "1.0.0",
  scoring: { points: 1, partialCredit: false },
} as const;

const homeSchoolOptions = [
  { id: "home", label: { ko: null, ru: "дом" } },
  { id: "school", label: { ko: null, ru: "школа" } },
] as const;

const speechMealOptions = [
  { id: "speech", label: { ko: "말씀", ru: null } },
  { id: "meal", label: { ko: "진지", ru: null } },
] as const;

const plainSpeechMealOptions = [
  { id: "speech", label: { ko: "말", ru: null } },
  { id: "meal", label: { ko: "밥", ru: null } },
] as const;

const firstTranslationPairs = [
  { id: "home", left: { ko: "집", ru: null }, right: { ko: null, ru: "дом" } },
  { id: "school", left: { ko: "학교", ru: null }, right: { ko: null, ru: "школа" } },
] as const;

const secondTranslationPairs = [
  { id: "person", left: { ko: "사람", ru: null }, right: { ko: null, ru: "человек" } },
  { id: "friend", left: { ko: "친구", ru: null }, right: { ko: null, ru: "друг" } },
] as const;

const firstHonorificPairs = [
  { id: "speech", left: { ko: "말", ru: null }, right: { ko: "말씀", ru: null } },
  { id: "meal", left: { ko: "밥", ru: null }, right: { ko: "진지", ru: null } },
] as const;

const secondHonorificPairs = [
  { id: "home", left: { ko: "집", ru: null }, right: { ko: "댁", ru: null } },
  { id: "name", left: { ko: "이름", ru: null }, right: { ko: "성함", ru: null } },
] as const;

export const sampleExercises = [
  {
    ...exerciseDefaults,
    id: "0f6808ba-3ce6-4c94-8d29-e2d52ca2c65a",
    logicalId: "write-greeting",
    topicIds: [phrasesTopicId],
    type: "free-response",
    prompt: { ko: null, ru: "Напишите по-корейски «Здравствуйте»." },
    explanation: { ko: null, ru: "안녕하세요 — нейтрально-вежливое приветствие." },
    answerLanguage: "ko",
    acceptedAnswers: [{ id: "canonical", value: "안녕하세요", isCanonical: true }],
  },
  {
    ...exerciseDefaults,
    id: "d4c697dc-2255-48d2-9d3f-0ed624c9c2da",
    logicalId: "write-thanks",
    topicIds: [phrasesTopicId],
    type: "free-response",
    prompt: { ko: null, ru: "Напишите по-корейски «Спасибо»." },
    explanation: { ko: null, ru: "감사합니다 — формальное выражение благодарности." },
    answerLanguage: "ko",
    acceptedAnswers: [{ id: "canonical", value: "감사합니다", isCanonical: true }],
  },
  {
    ...exerciseDefaults,
    id: "39c0c607-38a1-4a70-8e2a-e14061871ded",
    logicalId: "choose-home-meaning",
    topicIds: [hangulTopicId],
    type: "meaning-choice",
    prompt: { ko: "집", ru: "Выберите значение слова." },
    explanation: { ko: null, ru: "집 означает «дом»." },
    options: homeSchoolOptions,
    correctOptionId: "home",
  },
  {
    ...exerciseDefaults,
    id: "eaaf766c-82f8-4a41-b89a-9a275b8148ec",
    logicalId: "choose-school-meaning",
    topicIds: [hangulTopicId],
    type: "meaning-choice",
    prompt: { ko: "학교", ru: "Выберите значение слова." },
    explanation: { ko: null, ru: "학교 означает «школа»." },
    options: homeSchoolOptions,
    correctOptionId: "school",
  },
  {
    ...exerciseDefaults,
    id: "f61a206d-6e89-4728-b11f-2412bca08885",
    logicalId: "choose-honorific-speech",
    topicIds: [phrasesTopicId],
    type: "honorific-choice",
    prompt: { ko: "말", ru: "Выберите уважительный эквивалент." },
    explanation: { ko: null, ru: "Уважительная форма для 말 — 말씀." },
    options: speechMealOptions,
    correctOptionId: "speech",
  },
  {
    ...exerciseDefaults,
    id: "4a6b8c63-75bc-4e7e-a1cc-1674bd7d04b8",
    logicalId: "choose-honorific-meal",
    topicIds: [phrasesTopicId],
    type: "honorific-choice",
    prompt: { ko: "밥", ru: "Выберите уважительный эквивалент." },
    explanation: { ko: null, ru: "Уважительная форма для 밥 — 진지." },
    options: speechMealOptions,
    correctOptionId: "meal",
  },
  {
    ...exerciseDefaults,
    id: "e9ac3a32-e348-4272-aed8-7c9589c4680a",
    logicalId: "choose-plain-speech",
    topicIds: [phrasesTopicId],
    type: "plain-choice",
    prompt: { ko: "말씀", ru: "Выберите обычный эквивалент." },
    explanation: { ko: null, ru: "Обычная форма для 말씀 — 말." },
    options: plainSpeechMealOptions,
    correctOptionId: "speech",
  },
  {
    ...exerciseDefaults,
    id: "25cbb450-eb66-4dd9-a11c-30a4650df992",
    logicalId: "choose-plain-meal",
    topicIds: [phrasesTopicId],
    type: "plain-choice",
    prompt: { ko: "진지", ru: "Выберите обычный эквивалент." },
    explanation: { ko: null, ru: "Обычная форма для 진지 — 밥." },
    options: plainSpeechMealOptions,
    correctOptionId: "meal",
  },
  {
    ...exerciseDefaults,
    id: "b575f3cc-1025-48ca-b80f-d15e57a28a9b",
    logicalId: "match-home-school",
    topicIds: [hangulTopicId],
    type: "matching-translation",
    prompt: { ko: null, ru: "Сопоставьте корейские слова и значения." },
    explanation: { ko: null, ru: "집 — дом, 학교 — школа." },
    scoring: { points: 2, partialCredit: true },
    pairs: firstTranslationPairs,
  },
  {
    ...exerciseDefaults,
    id: "b7bbd9bc-fae7-45f0-a762-7e88020edee0",
    logicalId: "match-person-friend",
    topicIds: [hangulTopicId],
    type: "matching-translation",
    prompt: { ko: null, ru: "Сопоставьте корейские слова и значения." },
    explanation: { ko: null, ru: "사람 — человек, 친구 — друг." },
    scoring: { points: 2, partialCredit: true },
    pairs: secondTranslationPairs,
  },
  {
    ...exerciseDefaults,
    id: "3cfcae48-4606-41f1-b2e7-9408aac6ae3a",
    logicalId: "match-honorific-speech-meal",
    topicIds: [phrasesTopicId],
    type: "matching-honorific",
    prompt: { ko: null, ru: "Сопоставьте обычные и уважительные формы." },
    explanation: { ko: null, ru: "말 — 말씀, 밥 — 진지." },
    scoring: { points: 2, partialCredit: true },
    pairs: firstHonorificPairs,
  },
  {
    ...exerciseDefaults,
    id: "651cbd4d-2693-468c-9265-d6d341be5242",
    logicalId: "match-honorific-home-name",
    topicIds: [phrasesTopicId],
    type: "matching-honorific",
    prompt: { ko: null, ru: "Сопоставьте обычные и уважительные формы." },
    explanation: { ko: null, ru: "집 — 댁, 이름 — 성함." },
    scoring: { points: 2, partialCredit: true },
    pairs: secondHonorificPairs,
  },
  {
    ...exerciseDefaults,
    id: "a22d8f97-51c6-4797-8cdb-3e405591b304",
    logicalId: "fill-greeting",
    topicIds: [phrasesTopicId],
    type: "fill-blank",
    prompt: { ko: null, ru: "Вставьте приветствие." },
    explanation: { ko: null, ru: "В начале разговора можно сказать 안녕하세요." },
    template: "{{greeting}}!",
    templateLanguage: "ko",
    blanks: [
      {
        id: "greeting",
        acceptedAnswers: [{ id: "canonical", value: "안녕하세요", isCanonical: true }],
      },
    ],
  },
  {
    ...exerciseDefaults,
    id: "9a8f240a-a5ea-4d83-86d2-f9b69fc740d3",
    logicalId: "fill-thanks",
    topicIds: [phrasesTopicId],
    type: "fill-blank",
    prompt: { ko: null, ru: "Вставьте выражение благодарности." },
    explanation: { ko: null, ru: "감사합니다 выражает благодарность." },
    template: "{{thanks}}.",
    templateLanguage: "ko",
    blanks: [
      {
        id: "thanks",
        acceptedAnswers: [{ id: "canonical", value: "감사합니다", isCanonical: true }],
      },
    ],
  },
  {
    ...exerciseDefaults,
    id: "6c2f0b8e-5d41-4a7a-9f11-2b8f6d9e4a01",
    logicalId: "single-choice-copula",
    topicIds: [phrasesTopicId],
    type: "single-choice",
    prompt: { ko: "알맞은 것을 고르십시오.", ru: "Выберите подходящую форму." },
    explanation: { ko: null, ru: "В формальном стиле используется 입니다." },
    options: [
      { id: "imnida", label: { ko: "입니다", ru: null } },
      { id: "ieyo", label: { ko: "이에요", ru: null } },
    ],
    correctOptionId: "imnida",
    passage: null,
  },
  {
    ...exerciseDefaults,
    id: "7d3a1c9f-6e52-4b8b-8012-3c9a7e0f5b12",
    logicalId: "single-choice-reading-intro",
    topicIds: [phrasesTopicId],
    type: "single-choice",
    difficulty: "medium",
    prompt: { ko: "무엇에 대한 이야기입니까?", ru: "О чём этот текст?" },
    explanation: { ko: null, ru: "Текст — короткое самопредставление." },
    options: [
      { id: "food", label: { ko: "음식", ru: "еда" } },
      { id: "intro", label: { ko: "자기소개", ru: "самопредставление" } },
    ],
    correctOptionId: "intro",
    passage: {
      logicalId: "sample-reading-intro",
      title: { ko: "자기소개", ru: "Самопредставление" },
      bodyKo: "안녕하세요? 저는 왕루입니다. 학교에 갑니다.",
    },
  },
] as const satisfies readonly Exercise[];
