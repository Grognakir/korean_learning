import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { sampleExercises } from "@/modules/sample";

import type { AnswerDraft } from "../../hooks/useTrainingSession";
import { toExerciseView, type ExerciseView } from "../../presentation";
import { ExerciseRenderer } from "./ExerciseRenderer";

function byType<T extends (typeof sampleExercises)[number]["type"]>(type: T) {
  const exercise = sampleExercises.find((item) => item.type === type);
  if (!exercise) {
    throw new Error(`Missing sample exercise for type ${type}`);
  }

  return exercise;
}

function draftFor(view: ExerciseView): AnswerDraft {
  switch (view.type) {
    case "free-response":
      return { kind: "free-response", answer: "" };
    case "meaning-choice":
    case "honorific-choice":
    case "plain-choice":
    case "single-choice":
      return { kind: "choice", optionId: null };
    case "fill-blank":
      return {
        kind: "fill-blank",
        answers: Object.fromEntries(view.blankIds.map((blankId) => [blankId, ""])),
      };
    case "matching-translation":
    case "matching-honorific":
      return {
        kind: "matching",
        matches: Object.fromEntries(view.leftItems.map((item) => [item.pairId, ""])),
      };
  }
}

const noopHandlers = {
  onSelectChoice: vi.fn(),
  onChangeFreeResponse: vi.fn(),
  onChangeFillBlank: vi.fn(),
  onChangeMatching: vi.fn(),
};

describe("ExerciseRenderer", () => {
  it.each([
    ["free-response", "label", "Ваш ответ"],
    ["meaning-choice", "text", "Выберите один вариант"],
    ["honorific-choice", "text", "Выберите один вариант"],
    ["plain-choice", "text", "Выберите один вариант"],
    ["single-choice", "text", "Выберите один вариант"],
    ["fill-blank", "label", /Пропуск 1/],
    ["matching-translation", "combobox", null],
    ["matching-honorific", "combobox", null],
  ] as const)("renders %s exercises", (type, assertion, marker) => {
    const view = toExerciseView(byType(type), { seed: 17 });
    render(<ExerciseRenderer draft={draftFor(view)} exercise={view} {...noopHandlers} />);

    if (assertion === "combobox") {
      expect(screen.getAllByRole("combobox").length).toBeGreaterThan(0);
      return;
    }

    if (assertion === "label") {
      expect(screen.getByLabelText(marker as string | RegExp)).toBeInTheDocument();
      return;
    }

    expect(screen.getByText(marker as string)).toBeInTheDocument();
  });

  it("shows a safe error for unsupported exercise types", () => {
    const unsupported = {
      ...toExerciseView(byType("free-response")),
      type: "future-type",
    } as unknown as ExerciseView;

    render(
      <ExerciseRenderer
        draft={{ kind: "free-response", answer: "" }}
        exercise={unsupported}
        {...noopHandlers}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(/future-type/);
    expect(screen.getByText(/не поддерживается/)).toBeInTheDocument();
  });

  it("wires choice selection through the public renderer API", async () => {
    const user = userEvent.setup();
    const onSelectChoice = vi.fn();
    const view = toExerciseView(byType("meaning-choice"));

    render(
      <ExerciseRenderer
        draft={draftFor(view)}
        exercise={view}
        {...noopHandlers}
        onSelectChoice={onSelectChoice}
      />,
    );

    await user.click(screen.getByLabelText("дом"));
    expect(onSelectChoice).toHaveBeenCalledWith("home");
  });
});
