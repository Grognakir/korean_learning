import type { LearningModuleDefinition } from "@/types";

export function createTestModule(
  overrides: Partial<LearningModuleDefinition> = {},
): LearningModuleDefinition {
  const topics = overrides.topics ?? [
    {
      id: "11111111-1111-4111-8111-111111111101",
      code: "integration-topic-a",
      title: { ko: "주제 A", ru: "Тема A" },
      summary: { ko: "요약 A", ru: "Кратко A" },
      level: "1급",
      status: "published",
      contentVersion: "1.0.0",
      sortOrder: 10,
    },
    {
      id: "11111111-1111-4111-8111-111111111102",
      code: "integration-topic-b",
      title: { ko: "주제 B", ru: "Тема B" },
      summary: { ko: "요약 B", ru: "Кратко B" },
      level: "1급",
      status: "published",
      contentVersion: "1.0.0",
      sortOrder: 20,
    },
  ];

  return {
    id: "11111111-1111-4111-8111-111111111100",
    slug: "integration-module",
    title: { ko: "통합 모듈", ru: "Интеграционный модуль" },
    description: { ko: "테스트용 모듈", ru: "Модуль для интеграционных тестов" },
    level: "1급",
    status: "published",
    contentVersion: "1.0.0",
    sortOrder: 10,
    supportedExerciseTypes: [
      "free-response",
      "meaning-choice",
      "honorific-choice",
      "plain-choice",
      "matching-translation",
      "matching-honorific",
      "fill-blank",
    ],
    topics,
    ...overrides,
  };
}
