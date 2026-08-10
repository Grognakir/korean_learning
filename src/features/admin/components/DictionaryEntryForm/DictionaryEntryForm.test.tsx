import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DictionaryEntryForm } from "./DictionaryEntryForm";

vi.mock("@/features/admin/actions/saveDictionaryEntryAction", () => ({
  saveDictionaryEntryAction: vi.fn(async () => null),
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
  id: "33333333-3333-4333-8333-333333333333",
  logicalId: "dict.hello",
  senseKey: "default",
  lemmaKo: "안녕",
  partOfSpeech: "감탄사",
  meaningsRu: ["привет", "здравствуй"],
  usageNoteRu: null,
  transliteration: "annyeong",
  level: "1급",
  contentVersion: "1.0.0",
  status: "published" as const,
  primaryModuleId: "11111111-1111-4111-8111-111111111111",
};

describe("DictionaryEntryForm", () => {
  it("renders required field labels", () => {
    render(<DictionaryEntryForm unitOptions={unitOptions} />);

    expect(screen.getByLabelText(/Logical ID/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Lemma \(ko\)/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Часть речи/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Значения \(ru\)/)).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /Основной юнит/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Сохранить" })).toBeInTheDocument();
  });

  it("prefills values in edit mode", () => {
    render(<DictionaryEntryForm initialValues={initialValues} unitOptions={unitOptions} />);

    expect(screen.getByLabelText(/Logical ID/)).toHaveValue("dict.hello");
    expect(screen.getByLabelText(/Lemma \(ko\)/)).toHaveValue("안녕");
    expect(screen.getByLabelText(/Часть речи/)).toHaveValue("감탄사");
    expect(screen.getByLabelText(/Значения \(ru\)/)).toHaveValue("привет\nздравствуй");
    expect(screen.getByLabelText(/Транслитерация/)).toHaveValue("annyeong");
    expect(screen.getByRole("combobox", { name: /Статус/ })).toHaveTextContent("Опубликовано");
    expect(screen.getByRole("combobox", { name: /Основной юнит/ })).toHaveTextContent(
      "unit-01 — Приветствие",
    );
  });
});
