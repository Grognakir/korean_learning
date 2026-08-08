import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { sampleExercises } from "@/modules/sample";

import { toExerciseView } from "../../presentation";
import { MatchingExercise } from "./MatchingExercise";

const matching = sampleExercises.find((item) => item.logicalId === "match-home-school");
if (!matching || matching.type !== "matching-translation") {
  throw new Error("Expected matching-translation sample exercise");
}

const matchingView = toExerciseView(matching, { seed: 17 });
if (matchingView.type !== "matching-translation") {
  throw new Error("Expected matching view");
}

describe("MatchingExercise", () => {
  it("matches pairs with a custom dropdown and does not require drag-and-drop", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MatchingExercise
        exercise={matchingView}
        matches={{ home: "", school: "" }}
        onChange={onChange}
      />,
    );

    expect(screen.getByText("집")).toHaveAttribute("lang", "ko");
    expect(document.querySelector("select")).toBeNull();
    expect(screen.getAllByRole("combobox")).toHaveLength(2);
    expect(document.querySelector("[draggable]")).toBeNull();

    const firstCombobox = screen.getAllByRole("combobox")[0]!;
    await user.click(firstCombobox);
    await user.click(screen.getByRole("option", { name: "дом" }));

    expect(onChange).toHaveBeenCalledWith(matchingView.leftItems[0]!.pairId, "home");
  });
});
