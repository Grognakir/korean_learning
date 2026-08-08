import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { sampleExercises } from "@/modules/sample";
import type { Exercise, FillBlankExercise, FreeResponseExercise } from "../../domain";

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
      persist={false}
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
    const label = blank.getAttribute("aria-label") ?? "";
    const value = label.includes("thanks") ? "감사합니다" : "안녕하세요";
    await user.type(blank, value);
    return;
  }

  const comboboxes = screen.queryAllByRole("combobox");
  if (comboboxes.length > 0) {
    for (const combobox of comboboxes) {
      const pairId = combobox.id.match(/^match-[0-9a-f-]{36}-(.+)$/)?.[1];
      await user.click(combobox);

      const preferredOption =
        pairId === undefined ? null : document.getElementById(`${combobox.id}-option-${pairId}`);
      if (preferredOption) {
        await user.click(preferredOption);
        continue;
      }

      const options = screen.getAllByRole("option");
      if (options[0]) {
        await user.click(options[0]);
      }
    }
  }
}
const twoBlankExercise: FillBlankExercise = {
  schemaVersion: 1,
  id: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeee1",
  logicalId: "fill-two-for-enter",
  moduleSlug: "sample-module",
  topicIds: byLogicalId("fill-greeting").topicIds,
  type: "fill-blank",
  difficulty: "easy",
  prompt: { ko: null, ru: "Заполните оба пропуска." },
  explanation: { ko: null, ru: "Нужны оба ответа." },
  contentVersion: "1.0.0",
  scoring: { points: 2, partialCredit: false },
  template: "{{a}} {{b}}",
  templateLanguage: "ko",
  blanks: [
    {
      id: "a",
      acceptedAnswers: [{ id: "canonical", value: "안녕하세요", isCanonical: true }],
    },
    {
      id: "b",
      acceptedAnswers: [{ id: "canonical", value: "감사합니다", isCanonical: true }],
    },
  ],
};

const russianTextareaExercise: FreeResponseExercise = {
  schemaVersion: 1,
  id: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeee2",
  logicalId: "write-russian-textarea",
  moduleSlug: "sample-module",
  topicIds: byLogicalId("write-greeting").topicIds,
  type: "free-response",
  difficulty: "easy",
  prompt: { ko: null, ru: "Напишите перевод." },
  explanation: { ko: null, ru: "Канонический ответ — дом." },
  contentVersion: "1.0.0",
  scoring: { points: 1, partialCredit: false },
  answerLanguage: "ru",
  acceptedAnswers: [{ id: "canonical", value: "дом", isCanonical: true }],
};

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
      expect(screen.getByText(`Задание ${index + 1} из ${oneOfEach.length}`)).toBeInTheDocument();
      expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", String(index));

      await answerCurrentExercise(user);
      await user.click(screen.getByRole("button", { name: "Ответить" }));
      const feedback = screen.queryByRole("status") ?? screen.getByRole("alert");
      expect(feedback.textContent).toMatch(/Верно|Неверно|Частично/);
      expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", String(index + 1));

      if (index < oneOfEach.length - 1) {
        await user.click(screen.getByRole("button", { name: "Дальше" }));
      }
    }

    await user.click(screen.getByRole("button", { name: "Дальше" }));
    expect(screen.getByRole("heading", { name: "Тренировка завершена" })).toBeInTheDocument();
  });

  it("shows position 1 of N and aria-valuenow 0 before the first answer", () => {
    renderSession([byLogicalId("write-greeting"), byLogicalId("write-thanks")]);

    expect(screen.getByText("Задание 1 из 2")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Выполнено заданий: 0 из 2" })).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
  });

  it("increments completed progress after submit and before next", async () => {
    const user = userEvent.setup();
    renderSession([byLogicalId("write-greeting"), byLogicalId("write-thanks")]);

    await user.type(screen.getByLabelText("Ваш ответ"), "안녕하세요");
    await user.click(screen.getByRole("button", { name: "Ответить" }));

    expect(screen.getByText("Задание 1 из 2")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Выполнено заданий: 1 из 2" })).toHaveAttribute(
      "aria-valuenow",
      "1",
    );
  });

  it("keeps last-item progress at N-1 until the final answer is accepted", async () => {
    const user = userEvent.setup();
    renderSession([byLogicalId("choose-home-meaning"), byLogicalId("write-thanks")]);

    await user.click(screen.getByLabelText("дом"));
    await user.click(screen.getByRole("button", { name: "Ответить" }));
    await user.click(screen.getByRole("button", { name: "Дальше" }));

    expect(screen.getByText("Задание 2 из 2")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");

    await user.type(screen.getByLabelText("Ваш ответ"), "감사합니다");
    await user.click(screen.getByRole("button", { name: "Ответить" }));

    expect(screen.getByRole("progressbar", { name: "Выполнено заданий: 2 из 2" })).toHaveAttribute(
      "aria-valuenow",
      "2",
    );
  });

  it("submits a single-line free response on Enter without clicking the button", async () => {
    const user = userEvent.setup();
    renderSession([byLogicalId("write-greeting")]);

    await user.type(screen.getByLabelText("Ваш ответ"), "안녕하세요{Enter}");

    expect(screen.getByText("Верно")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Дальше" })).toBeInTheDocument();
  });

  it("does not submit on Enter when the single-line answer is empty or whitespace", async () => {
    const user = userEvent.setup();
    renderSession([byLogicalId("write-greeting")]);

    await user.type(screen.getByLabelText("Ваш ответ"), "   {Enter}");

    expect(screen.queryByText("Верно")).not.toBeInTheDocument();
    expect(screen.queryByText("Неверно")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ответить" })).toBeDisabled();
  });

  it("keeps Enter as a newline inside textarea and does not submit the form", async () => {
    const user = userEvent.setup();
    renderSession([russianTextareaExercise]);

    const field = screen.getByLabelText("Ваш ответ");
    await user.type(field, "первая{Enter}вторая");

    expect(field).toHaveValue("первая\nвторая");
    expect(screen.queryByText("Верно")).not.toBeInTheDocument();
    expect(screen.queryByText("Неверно")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ответить" })).toBeInTheDocument();
  });

  it("does not submit multi-blank fill exercises on Enter until every blank is filled", async () => {
    const user = userEvent.setup();
    renderSession([twoBlankExercise]);

    const firstBlank = screen.getByLabelText(/Пропуск 1/);
    await user.type(firstBlank, "안녕하세요{Enter}");

    expect(screen.queryByText("Верно")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ответить" })).toBeDisabled();

    await user.type(screen.getByLabelText(/Пропуск 2/), "감사합니다{Enter}");

    expect(screen.getByText("Верно")).toBeInTheDocument();
  });

  it("ignores repeated Enter after an accepted answer without advancing", async () => {
    const user = userEvent.setup();
    renderSession([byLogicalId("write-greeting"), byLogicalId("write-thanks")]);

    await user.type(screen.getByLabelText("Ваш ответ"), "안녕하세요{Enter}");
    expect(screen.getByText("Верно")).toBeInTheDocument();

    await user.keyboard("{Enter}");

    expect(screen.getByText("Задание 1 из 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Дальше" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Ответить" })).not.toBeInTheDocument();
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
    expect(screen.getByText("Задание 1 из 2")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Дальше" }));
    expect(screen.getByText("Задание 2 из 2")).toBeInTheDocument();
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
