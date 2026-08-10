import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { PublicGrammarTopicSummary, PublicUnitSummary } from "../domain/types";

import { GrammarDetailView } from "./GrammarDetailView";

const unit: PublicUnitSummary = {
  id: "unit-14",
  logicalId: "unit.u14",
  slug: "u14",
  unitNumber: 14,
  title: { ko: "공공 장소", ru: "общественные места" },
  summary: { ko: "공공 장소", ru: "общественные места" },
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
  id: "topic-14-4",
  logicalId: "grammar.u14.n04",
  unitLogicalId: "unit.u14",
  unitSlug: "u14",
  unitNumber: 14,
  patternKo: "V-아/어/여야 되다/하다",
  category: "syllabus",
  usageKey: null,
  title: {
    ko: "V-아/어/여야 되다/하다",
    ru: "выражает обязанность или необходимость.",
  },
  summary: {
    ko: "V-아/어/여야 되다/하다",
    ru: "выражает обязанность или необходимость.",
  },
  contentVersion: "1.0.0",
  language: { pattern: "ko", summary: "ru" },
  detail: {
    bodyMd: [
      '## V-아/어/여야 되다/하다 — "должен, нужно"',
      "",
      "#### **Значение грамматики**",
      "",
      "Используется для выражения **необходимости или обязанности**",
      "",
      "#### **Примеры**",
      "",
      "- **약을 먹어야 돼요.** - Нужно принять лекарство.",
    ].join("\n"),
  },
};

describe("GrammarDetailView", () => {
  it("renders updated Markdown body for corrected grammar patterns", () => {
    render(<GrammarDetailView practiceAvailable topic={topic} unit={unit} />);

    expect(screen.getByRole("heading", { name: "Описание" })).toBeInTheDocument();
    expect(screen.getByText(/необходимости или обязанности/i)).toBeInTheDocument();
    expect(screen.getByText(/약을 먹어야 돼요/)).toBeInTheDocument();
    expect(screen.queryByText("Краткое объяснение конструкции.")).not.toBeInTheDocument();
  });
});
