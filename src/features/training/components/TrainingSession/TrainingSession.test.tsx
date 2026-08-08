import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { sampleExercises } from "@/modules/sample";
import type { Exercise } from "../../domain";

import { TrainingSession } from "./TrainingSession";

function byLogicalId(logicalId: string): Exercise {
  const exercise = sampleExercises.find((item) => item.logicalId === logicalId);
  if (!exercise) {
    throw new Error(`Missing sample exercise: ${logicalId}`);
  }

  return exercise;
}

const fixedNow = () => "2026-08-08T12:00:00.000Z";
let submissionCounter = 0;
const createSubmissionId = () => {
  submissionCounter += 1;
  return `submission-${submissionCounter}`;
};

function renderSession(exercises: readonly Exercise[], limit?: number) {
  submissionCounter = 0;
  return render(
    <TrainingSession
      createSubmissionId={createSubmissionId}
      exercises={exercises}
      {...(limit === undefined ? {} : { limit })}
      now={fixedNow}
      seed={1}
    />,
  );
}

async function answerCurrentExercise(user: ReturnType<typeof userEvent.setup>) {
  const prompt = screen.getByRole("heading", { level: 2 });
  const promptText = prompt.textContent ?? "";

  if (screen.queryByRole("radiogroup") || screen.queryByRole("group", { name: /Выберите/ })) {
    const radios = screen.getAllByRole("radio");
    await user.click(radios[0]!);
    return;
  }

  if (screen.queryByLabelText("Ваш ответ")) {
    const answer =
      promptText.includes("Здравствуйте") || promptText.includes("приветств")
        ? "안녕하세요"
        : promptText.includes("Спасибо") || promptText.includes("благодар")
          ? "감사합니다"
          : "안녕하세요";
    await user.type(screen.getByLabelText("Ваш ответ"), answer);
    return;
  }

  if (screen.queryByLabelText(/Пропуск 1/)) {
    const blank = screen.getByLabelText(/Пропуск 1/);
    const answer = (blank.getAttribute("id") ?? "").includes("thanks")
      ? "감사합니다"
      : blank.getAttribute("aria-label")?.includes("thanks")
        ? "감사합니다"
        : "안녕하세요";
    const label = blank.getAttribute("aria-label") ?? "";
    const value = label.includes("thanks") ? "감사합니다" : "안녕하세요";
    await user.type(blank, value);
    void answer;
    return;
  }

  const selects = screen.queryAllByRole("combobox");
  if (selects.length > 0) {
    for (const select of selects) {
      const pairId = select.id.match(/^match-[0-9a-f-]{36}-(.+)$/)?.[1];
      const optionValues = within(select)
        .getAllByRole("option")
        .map((option) => option.getAttribute("value"))
        .filter((value): value is string => Boolean(value));

      if (pairId && optionValues.includes(pairId)) {
        await user.selectOptions(select, pairId);
        continue;
      }

      if (optionValues[0]) {
        await user.selectOptions(select, optionValues[0]);
      }
    }
  }
}

describe("TrainingSession", () => {
  it("renders and submits each of the seven exercise types", async () => {
    const user = userEvent.setup();
    const oneOfEach = [
      byLogicalId("write-greeting"),
      byLogicalId("choose-home-meaning"),
      byLogicalId("choose-honorific-speech"),
      byLogicalId("choose-plain-speech"),
      byLogicalId("match-home-school"),
      byLogicalId("match-honorific-speech-meal"),
      byLogicalId("fill-greeting"),
    ];

    renderSession(oneOfEach);

    for (let index = 0; index < oneOfEach.length; index += 1) {
      expect(screen.getByText(`${index + 1} / ${oneOfEach.length}`)).toBeInTheDocument();
      expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", String(index + 1));

      await answerCurrentExercise(user);
      await user.click(screen.getByRole("button", { name: "Ответить" }));
      const feedback = screen.queryByRole("status") ?? screen.getByRole("alert");
      expect(feedback.textContent).toMatch(/Верно|Неверно|Частично/);

      if (index < oneOfEach.length - 1) {
        await user.click(screen.getByRole("button", { name: "Дальше" }));
      }
    }

    await user.click(screen.getByRole("button", { name: "Дальше" }));
    expect(screen.getByRole("heading", { name: "Тренировка завершена" })).toBeInTheDocument();
  });

  it("blocks empty submit and locks after a successful answer", async () => {
    const user = userEvent.setup();
    renderSession([byLogicalId("write-greeting")]);

    const submit = screen.getByRole("button", { name: "Ответить" });
    expect(submit).toBeDisabled();

    await user.type(screen.getByLabelText("Ваш ответ"), "   ");
    expect(submit).toBeDisabled();

    await user.clear(screen.getByLabelText("Ваш ответ"));
    await user.type(screen.getByLabelText("Ваш ответ"), "안녕하세요");
    expect(submit).toBeEnabled();

    await user.click(submit);
    expect(screen.getByText("Верно")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Ответить" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Дальше" })).toBeInTheDocument();
    expect(screen.getByLabelText("Ваш ответ")).toBeDisabled();
  });

  it("updates progress on next and moves focus to the new prompt", async () => {
    const user = userEvent.setup();
    renderSession([byLogicalId("choose-home-meaning"), byLogicalId("write-thanks")]);

    await answerCurrentExercise(user);
    await user.click(screen.getByRole("button", { name: "Ответить" }));
    expect(screen.getByText("1 / 2")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Дальше" }));
    expect(screen.getByText("2 / 2")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2 })).toHaveFocus();
  });

  it("marks Korean prompt text with lang=ko", () => {
    renderSession([byLogicalId("choose-home-meaning")]);
    expect(screen.getByText("집")).toHaveAttribute("lang", "ko");
  });

  it("completes a short session and offers an exit link", async () => {
    const user = userEvent.setup();
    renderSession([byLogicalId("choose-school-meaning")]);

    await user.click(screen.getByLabelText("школа"));
    await user.click(screen.getByRole("button", { name: "Ответить" }));
    await user.click(screen.getByRole("button", { name: "Дальше" }));

    expect(screen.getByRole("heading", { name: "Тренировка завершена" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "К тренировке" })).toHaveAttribute("href", "/training");
  });

  it("shows incorrect feedback for a wrong choice", async () => {
    const user = userEvent.setup();
    renderSession([byLogicalId("choose-home-meaning")]);

    await user.click(screen.getByLabelText("школа"));
    await user.click(screen.getByRole("button", { name: "Ответить" }));

    expect(screen.getByText("Неверно")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
