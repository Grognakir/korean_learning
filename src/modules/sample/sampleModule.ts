import type { LearningModuleDefinition } from "@/types";

export const sampleModule = {
  id: "ad66b9f8-61b6-4fd0-9e98-6ec426547dd0",
  slug: "sample-module",
  title: {
    ko: "한국어 첫걸음",
    ru: "Первые шаги в корейском",
  },
  description: {
    ko: "한글과 기본 표현을 차근차근 익혀 보세요.",
    ru: "Познакомьтесь с корейским письмом и базовыми выражениями в коротких темах.",
  },
  level: "1급",
  status: "published",
  contentVersion: "1.0.0",
  sortOrder: 10,
  supportedExerciseTypes: ["meaning-choice", "free-response"],
  topics: [
    {
      id: "d8b1e1e2-97d8-4413-a890-730f85b32b51",
      code: "hangul-basics",
      title: {
        ko: "한글 기초",
        ru: "Основы хангыля",
      },
      summary: {
        ko: "한글의 기본 글자와 음절 구조를 살펴봅니다.",
        ru: "Базовые буквы и принцип построения корейского слога.",
      },
      level: "1급",
      status: "published",
      contentVersion: "1.0.0",
      sortOrder: 10,
    },
    {
      id: "4ded8be2-7e86-4d25-80d0-c0f0e277324f",
      code: "first-phrases",
      title: {
        ko: "첫 표현",
        ru: "Первые выражения",
      },
      summary: {
        ko: "인사와 간단한 자기소개 표현을 배웁니다.",
        ru: "Приветствия и простые фразы для знакомства.",
      },
      level: "1급",
      status: "published",
      contentVersion: "1.0.0",
      sortOrder: 20,
    },
  ],
} as const satisfies LearningModuleDefinition;
