import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { sampleExercises } from "@/modules/sample";

import { toExerciseView } from "../../presentation";
import { TextAnswerExercise } from "./TextAnswerExercise";

const freeResponse = sampleExercises.find((item) => item.logicalId === "write-greeting");
if (!freeResponse || freeResponse.type !== "free-response") {
  throw new Error("Expected free-response sample exercise");
}

const freeView = toExerciseView(freeResponse);
if (freeView.type !== "free-response") {
  throw new Error("Expected free-response view");
}

describe("TextAnswerExercise", () => {
  it("renders a controlled Korean input with lang and inputMode", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TextAnswerExercise exercise={freeView} onChange={onChange} value="" />);

    const input = screen.getByLabelText("Ваш ответ");
    expect(input).toHaveAttribute("lang", "ko");
    expect(input).toHaveAttribute("inputMode", "text");

    await user.type(input, "안녕");
    expect(onChange).toHaveBeenCalled();
  });
});
