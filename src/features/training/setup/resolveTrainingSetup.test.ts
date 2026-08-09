import { describe, expect, it } from "vitest";

import type { PublicGrammarTopicSummary, PublicUnitSummary } from "@/features/catalog/domain/types";
import type { PublicCurriculumExercise } from "@/features/reading/domain/types";

import { resolveTrainingSetup } from "./resolveTrainingSetup";

const unit: PublicUnitSummary = {
  id: "1",
  logicalId: "unit.u01",
  slug: "u01",
  unitNumber: 1,
  title: { ko: "인사", ru: "приветствие" },
  summary: { ko: "요약", ru: "краткое" },
  level: "1급",
  contentVersion: "1.0.0",
  counts: {
    grammarTopics: 1,
    dictionaryEntries: 1,
    readingPassages: 1,
    approvedExercises: 1,
  },
};

const topic: PublicGrammarTopicSummary = {
  id: "2",
  logicalId: "grammar.u01.n01",
  unitLogicalId: "unit.u01",
  unitSlug: "u01",
  unitNumber: 1,
  patternKo: "N입니다",
  category: "syllabus",
  usageKey: null,
  title: { ko: "N입니다", ru: "связка" },
  summary: { ko: "N입니다", ru: "связка" },
  contentVersion: "1.0.0",
  language: { pattern: "ko", summary: "ru" },
};

const exercise: PublicCurriculumExercise = {
  id: "3",
  logicalId: "exercise.grammar.fixture.u01.q01",
  unitSlug: "u01",
  skill: "grammar",
  exerciseType: "single-choice",
  difficulty: "easy",
  prompt: { ko: "고르십시오", ru: "Выберите" },
  options: [{ id: "opt1", label: { ko: "입니다", ru: "입니다" } }],
  readingPassageLogicalId: null,
  grammarTopicLogicalId: "grammar.u01.n01",
  contentVersion: "1.0.0",
};

describe("resolveTrainingSetup", () => {
  it("builds a valid request and enables start when approved content exists", () => {
    const result = resolveTrainingSetup({
      url: {
        skill: "grammar",
        unitSlug: "u01",
        grammarTopicId: "grammar.u01.n01",
        difficulty: "easy",
        sessionSize: 5,
      },
      units: [unit],
      grammarTopics: [topic],
      exercises: [exercise],
    });

    expect(result.availableCount).toBe(1);
    expect(result.request).toEqual({
      skill: "grammar",
      unitSlug: "u01",
      grammarTopicId: "grammar.u01.n01",
      difficulty: "easy",
      sessionSize: 1,
    });
    expect(result.canPreview).toBe(true);
    expect(result.blockedReason).toBeNull();
    expect(JSON.stringify(result.request)).not.toContain("correct");
  });
});
