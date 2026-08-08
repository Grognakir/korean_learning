import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { sampleExercises } from "@/modules/sample";

import { toExerciseView, type ChoiceExerciseView } from "../../presentation";
import { ChoiceExercise } from "./ChoiceExercise";

const choiceExercise = sampleExercises.find((item) => item.logicalId === "choose-honorific-speech");
if (!choiceExercise || choiceExercise.type !== "honorific-choice") {
  throw new Error("Expected honorific-choice sample exercise");
}

const choiceViewResult = toExerciseView(choiceExercise);
if (choiceViewResult.type !== "honorific-choice") {
  throw new Error("Expected honorific-choice view");
}

const choiceView: ChoiceExerciseView = choiceViewResult;

function ChoiceHarness({ onSelect = vi.fn() }: { onSelect?: (optionId: string) => void }) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  return (
    <ChoiceExercise
      exercise={choiceView}
      onSelect={(optionId) => {
        setSelectedOptionId(optionId);
        onSelect(optionId);
      }}
      selectedOptionId={selectedOptionId}
    />
  );
}

describe("ChoiceExercise", () => {
  it("renders a single-select fieldset with clickable labels and lang=ko", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<ChoiceHarness onSelect={onSelect} />);

    expect(screen.getByRole("group", { name: "Выберите один вариант" })).toBeInTheDocument();
    expect(screen.getByText("말씀")).toHaveAttribute("lang", "ko");

    await user.click(screen.getByLabelText("말씀"));
    expect(onSelect).toHaveBeenCalledWith("speech");
    expect(screen.getByRole("radio", { name: "말씀" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "진지" })).not.toBeChecked();
  });

  it("supports keyboard selection of radio options", async () => {
    const user = userEvent.setup();
    render(<ChoiceHarness />);

    const first = screen.getByRole("radio", { name: "말씀" });
    first.focus();
    await user.keyboard("{ArrowDown}");

    expect(screen.getByRole("radio", { name: "진지" })).toBeChecked();
  });
});
