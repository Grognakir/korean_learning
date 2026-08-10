import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { PublicGrammarTopicSummary, PublicUnitSummary } from "../domain/types";

import { UnitDetailView } from "./UnitDetailView";

const unit: PublicUnitSummary = {
  id: "unit-1",
  logicalId: "unit.u01",
  slug: "u01",
  unitNumber: 1,
  title: { ko: "인사와 소개", ru: "приветствие и представление" },
  summary: { ko: "인사와 소개", ru: "Урок о приветствии" },
  level: "1급",
  contentVersion: "1.0.0",
  counts: {
    grammarTopics: 1,
    dictionaryEntries: 2,
    readingPassages: 1,
    approvedExercises: 3,
  },
};

const topic: PublicGrammarTopicSummary = {
  id: "topic-1",
  logicalId: "grammar.u01.n01",
  unitLogicalId: "unit.u01",
  unitSlug: "u01",
  unitNumber: 1,
  patternKo: "N입니다/입니까?",
  category: "syllabus",
  usageKey: null,
  title: { ko: "N입니다/입니까?", ru: "формальная связка" },
  summary: { ko: "N입니다/입니까?", ru: "формальная связка" },
  contentVersion: "1.0.0",
  language: { pattern: "ko", summary: "ru" },
};

describe("UnitDetailView", () => {
  it("renders a compact learner-facing lesson without internal labels", () => {
    render(
      <UnitDetailView
        grammarTopics={[topic]}
        readingAvailable
        unit={unit}
        vocabularyCount={2}
      />,
    );

    expect(screen.getByRole("link", { name: "Открыть словарь · 2 слова" })).toHaveAttribute(
      "href",
      "/dictionary?unit=u01",
    );
    expect(screen.queryByText(/approved|syllabus|Черновики/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Цели" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Тренировка" })).not.toBeInTheDocument();
  });
});
