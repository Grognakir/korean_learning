import type { ContentVersion } from "@/types";

/**
 * Small published slice used by local curriculum repositories and parity tests.
 * Canonical authoring remains in content/phase-2 and is never imported into the app graph.
 */
export type FixtureUnit = {
  readonly id: string;
  readonly logicalId: string;
  readonly slug: string;
  readonly unitNumber: number;
  readonly titleKo: string;
  readonly titleRu: string;
  readonly summaryKo: string;
  readonly summaryRu: string;
  readonly contentVersion: ContentVersion;
  readonly status: "published";
};

export type FixtureGrammarTopic = {
  readonly id: string;
  readonly logicalId: string;
  readonly unitLogicalId: string;
  readonly patternKo: string;
  readonly category: string;
  readonly usageKey: string | null;
  readonly titleKo: string;
  readonly titleRu: string;
  readonly summaryKo: string;
  readonly summaryRu: string;
  readonly contentVersion: ContentVersion;
  readonly status: "published";
  readonly detail?: {
    readonly bodyMd?: string;
  } | null;
};

export type FixtureDictionaryEntry = {
  readonly id: string;
  readonly logicalId: string;
  readonly lemma: string;
  readonly senseKey: string;
  readonly glossKo: string;
  readonly glossRu: string;
  readonly transliteration: string | null;
  readonly pos: string | null;
  readonly level: string | null;
  readonly unitLogicalIds: readonly string[];
  readonly contentVersion: ContentVersion;
  readonly status: "published";
};

export type FixtureReadingPassage = {
  readonly id: string;
  readonly logicalId: string;
  readonly unitLogicalId: string;
  readonly titleKo: string;
  readonly titleRu: string;
  readonly bodyKo: string;
  readonly contentVersion: ContentVersion;
  readonly status: "published";
};

export type FixtureCurriculumExercise = {
  readonly id: string;
  readonly logicalId: string;
  readonly unitLogicalId: string;
  readonly skill: "grammar" | "vocabulary" | "reading";
  readonly exerciseType: string;
  readonly difficulty: "easy" | "medium" | "hard";
  readonly promptKo: string;
  readonly promptRu: string;
  readonly options: readonly {
    readonly id: string;
    readonly labelKo: string;
    readonly labelRu: string;
  }[];
  readonly readingPassageLogicalId: string | null;
  readonly grammarTopicLogicalId: string | null;
  readonly correctOptionId: string;
  readonly contentVersion: ContentVersion;
  readonly status: "approved";
};

export type PublishedCurriculumFixture = {
  readonly units: readonly FixtureUnit[];
  readonly grammarTopics: readonly FixtureGrammarTopic[];
  readonly dictionaryEntries: readonly FixtureDictionaryEntry[];
  readonly readingPassages: readonly FixtureReadingPassage[];
  readonly exercises: readonly FixtureCurriculumExercise[];
};

export const publishedCurriculumFixture: PublishedCurriculumFixture = {
  units: [
    {
      id: "11111111-1111-4111-8111-111111111101",
      logicalId: "unit.u01",
      slug: "u01",
      unitNumber: 1,
      titleKo: "인사와 소개",
      titleRu: "приветствие и представление",
      summaryKo: "1과 인사와 소개",
      summaryRu: "Урок 1: приветствие и представление",
      contentVersion: "1.0.0",
      status: "published",
    },
    {
      id: "11111111-1111-4111-8111-111111111102",
      logicalId: "unit.u02",
      slug: "u02",
      unitNumber: 2,
      titleKo: "학교와 집",
      titleRu: "школа и дом",
      summaryKo: "2과 학교와 집",
      summaryRu: "Урок 2: школа и дом",
      contentVersion: "1.0.0",
      status: "published",
    },
  ],
  grammarTopics: [
    {
      id: "22222222-2222-4222-8222-222222222201",
      logicalId: "grammar.u01.n01",
      unitLogicalId: "unit.u01",
      patternKo: "N입니다/입니까?",
      category: "syllabus",
      usageKey: null,
      titleKo: "N입니다/입니까?",
      titleRu: "формальная связка",
      summaryKo: "N입니다/입니까?",
      summaryRu: "формальная связка",
      contentVersion: "1.0.0",
      status: "published",
    },
    {
      id: "22222222-2222-4222-8222-222222222202",
      logicalId: "grammar.u02.n01",
      unitLogicalId: "unit.u02",
      patternKo: "이/그/저",
      category: "syllabus",
      usageKey: null,
      titleKo: "이/그/저",
      titleRu: "указательные определители",
      summaryKo: "이/그/저",
      summaryRu: "указательные определители",
      contentVersion: "1.0.0",
      status: "published",
    },
  ],
  dictionaryEntries: [
    {
      id: "33333333-3333-4333-8333-333333333301",
      logicalId: "dict.annyeong.privet",
      lemma: "안녕",
      senseKey: "privet",
      glossKo: "안녕",
      glossRu: "привет",
      transliteration: "annyeong",
      pos: "interjection",
      level: null,
      unitLogicalIds: ["unit.u01"],
      contentVersion: "1.0.0",
      status: "published",
    },
    {
      id: "33333333-3333-4333-8333-333333333303",
      logicalId: "dict.annyeong.poka",
      lemma: "안녕",
      senseKey: "poka",
      glossKo: "안녕",
      glossRu: "пока",
      transliteration: "annyeong",
      pos: "interjection",
      level: null,
      unitLogicalIds: ["unit.u01"],
      contentVersion: "1.0.0",
      status: "published",
    },
    {
      id: "33333333-3333-4333-8333-333333333302",
      logicalId: "dict.hakgyo.shkola",
      lemma: "학교",
      senseKey: "shkola",
      glossKo: "학교",
      glossRu: "школа",
      transliteration: "hakgyo",
      pos: "noun",
      level: null,
      unitLogicalIds: ["unit.u02"],
      contentVersion: "1.0.0",
      status: "published",
    },
  ],
  readingPassages: [
    {
      id: "44444444-4444-4444-8444-444444444401",
      logicalId: "passage.u01.fixture.intro",
      unitLogicalId: "unit.u01",
      titleKo: "자기소개",
      titleRu: "Самопредставление",
      bodyKo: "안녕하세요? 저는 왕루입니다.",
      contentVersion: "1.0.0",
      status: "published",
    },
  ],
  exercises: [
    {
      id: "55555555-5555-4555-8555-555555555501",
      logicalId: "exercise.reading.fixture.v01.q01",
      unitLogicalId: "unit.u01",
      skill: "reading",
      exerciseType: "single-choice",
      difficulty: "medium",
      promptKo: "무엇에 대한 이야기입니까?",
      promptRu: "О чём этот текст?",
      options: [
        { id: "opt1", labelKo: "음식", labelRu: "еда" },
        { id: "opt2", labelKo: "자기소개", labelRu: "самопредставление" },
      ],
      readingPassageLogicalId: "passage.u01.fixture.intro",
      grammarTopicLogicalId: null,
      correctOptionId: "opt2",
      contentVersion: "1.0.0",
      status: "approved",
    },
    {
      id: "55555555-5555-4555-8555-555555555504",
      logicalId: "exercise.reading.fixture.v01.q02",
      unitLogicalId: "unit.u01",
      skill: "reading",
      exerciseType: "single-choice",
      difficulty: "easy",
      promptKo: "화자는 누구입니까?",
      promptRu: "Кто говорит?",
      options: [
        { id: "opt1", labelKo: "왕루", labelRu: "Ван Лу" },
        { id: "opt2", labelKo: "선생님", labelRu: "учитель" },
      ],
      readingPassageLogicalId: "passage.u01.fixture.intro",
      grammarTopicLogicalId: null,
      correctOptionId: "opt1",
      contentVersion: "1.0.0",
      status: "approved",
    },
    {
      id: "55555555-5555-4555-8555-555555555502",
      logicalId: "exercise.grammar.fixture.u01.q01",
      unitLogicalId: "unit.u01",
      skill: "grammar",
      exerciseType: "single-choice",
      difficulty: "easy",
      promptKo: "알맞은 것을 고르십시오.",
      promptRu: "Выберите подходящее.",
      options: [
        { id: "opt1", labelKo: "입니다", labelRu: "입니다" },
        { id: "opt2", labelKo: "이에요", labelRu: "이에요" },
      ],
      readingPassageLogicalId: null,
      grammarTopicLogicalId: "grammar.u01.n01",
      correctOptionId: "opt1",
      contentVersion: "1.0.0",
      status: "approved",
    },
    {
      id: "55555555-5555-4555-8555-555555555505",
      logicalId: "exercise.grammar.fixture.u01.q02",
      unitLogicalId: "unit.u01",
      skill: "grammar",
      exerciseType: "single-choice",
      difficulty: "medium",
      promptKo: "질문에 알맞은 끝을 고르십시오.",
      promptRu: "Выберите вопросительное окончание.",
      options: [
        { id: "opt1", labelKo: "입니까?", labelRu: "입니까?" },
        { id: "opt2", labelKo: "입니다", labelRu: "입니다" },
      ],
      readingPassageLogicalId: null,
      grammarTopicLogicalId: "grammar.u01.n01",
      correctOptionId: "opt1",
      contentVersion: "1.0.0",
      status: "approved",
    },
    {
      id: "55555555-5555-4555-8555-555555555503",
      logicalId: "exercise.vocabulary.fixture.u01.q01",
      unitLogicalId: "unit.u01",
      skill: "vocabulary",
      exerciseType: "meaning-choice",
      difficulty: "easy",
      promptKo: "안녕",
      promptRu: "Выберите значение слова.",
      options: [
        { id: "opt1", labelKo: "привет", labelRu: "привет" },
        { id: "opt2", labelKo: "школа", labelRu: "школа" },
      ],
      readingPassageLogicalId: null,
      grammarTopicLogicalId: null,
      correctOptionId: "opt1",
      contentVersion: "1.0.0",
      status: "approved",
    },
    {
      id: "55555555-5555-4555-8555-555555555506",
      logicalId: "exercise.vocabulary.fixture.u01.q02",
      unitLogicalId: "unit.u01",
      skill: "vocabulary",
      exerciseType: "meaning-choice",
      difficulty: "medium",
      promptKo: "안녕",
      promptRu: "Выберите значение (прощание).",
      options: [
        { id: "opt1", labelKo: "пока", labelRu: "пока" },
        { id: "opt2", labelKo: "школа", labelRu: "школа" },
      ],
      readingPassageLogicalId: null,
      grammarTopicLogicalId: null,
      correctOptionId: "opt1",
      contentVersion: "1.0.0",
      status: "approved",
    },
  ],
};

/** Draft row kept only to prove public repositories exclude unpublished content. */
export const draftCurriculumUnitFixture = {
  id: "11111111-1111-4111-8111-111111111199",
  logicalId: "unit.u16",
  slug: "u16-draft-only",
  unitNumber: 16,
  titleKo: "가족",
  titleRu: "семья",
  summaryKo: "draft only",
  summaryRu: "draft only",
  contentVersion: "1.0.0" as ContentVersion,
  status: "draft" as const,
};
