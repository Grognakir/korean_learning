import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { sampleExercises } from "@/modules/sample";

import { toExerciseView } from "../../presentation";
import { FillBlankExercise } from "./FillBlankExercise";

const fillBlank = sampleExercises.find((item) => item.logicalId === "fill-greeting");
if (!fillBlank || fillBlank.type !== "fill-blank") {
  throw new Error("Expected fill-blank sample exercise");
}

const fillView = toExerciseView(fillBlank);
if (fillView.type !== "fill-blank") {
  throw new Error("Expected fill-blank view");
}

describe("FillBlankExercise", () => {
  it("renders a readable template and one labeled input per blank without contenteditable", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FillBlankExercise exercise={fillView} onChange={onChange} values={{ greeting: "" }} />);

    expect(screen.getByText(/«greeting»!/)).toBeInTheDocument();
    const input = screen.getByLabelText(/Пропуск 1/);
    expect(input.tagName).toBe("INPUT");
    expect(input).toHaveAttribute("lang", "ko");
    expect(document.querySelector("[contenteditable]")).toBeNull();

    await user.type(input, "안녕하세요");
    expect(onChange).toHaveBeenCalled();
  });
});
