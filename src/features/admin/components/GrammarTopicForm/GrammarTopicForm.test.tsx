import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { GrammarTopicForm } from "./GrammarTopicForm";

vi.mock("@/features/admin/actions/saveGrammarTopicAction", () => ({
  saveGrammarTopicAction: vi.fn(async () => null),
}));

const unitOptions = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    slug: "unit-01",
    titleRu: "Приветствие",
    unitNumber: 1,
  },
];

const initialValues = {
  id: "22222222-2222-4222-8222-222222222222",
  moduleId: "11111111-1111-4111-8111-111111111111",
  code: "n-i-ga",
  logicalId: "grammar.u01.n01",
  patternKo: "N이/가",
  category: "particle",
  usageKey: null,
  titleRu: "Именительный падеж",
  titleKo: null,
  summaryRu: "Кратко",
  summaryKo: null,
  bodyMd: "## Значение\n\n**жирный**",
  level: "1급",
  contentVersion: "1.0.0",
  status: "reviewed" as const,
  sortOrder: 3,
};

describe("GrammarTopicForm", () => {
  it("renders required field labels", () => {
    render(<GrammarTopicForm unitOptions={unitOptions} />);

    expect(screen.getByRole("combobox", { name: /Юнит/ })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Code/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Logical ID/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Pattern \(ko\)/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Описание \(markdown\)/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Сохранить" })).toBeInTheDocument();
  });

  it("prefills values in edit mode", () => {
    render(<GrammarTopicForm initialValues={initialValues} unitOptions={unitOptions} />);

    expect(screen.getByRole("combobox", { name: /Юнит/ })).toHaveTextContent(
      "unit-01 — Приветствие",
    );
    expect(screen.getByLabelText(/^Code/)).toHaveValue("n-i-ga");
    expect(screen.getByLabelText(/Logical ID/)).toHaveValue("grammar.u01.n01");
    expect(screen.getByLabelText(/Pattern \(ko\)/)).toHaveValue("N이/가");
    expect(screen.getByLabelText(/Название \(ru\)/)).toHaveValue("Именительный падеж");
    expect(screen.getByLabelText(/Описание \(markdown\)/)).toHaveValue(
      "## Значение\n\n**жирный**",
    );
    expect(screen.getByRole("combobox", { name: /Статус/ })).toHaveTextContent("Проверено");
  });
});
