import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TrainingSetupControls } from "./TrainingSetupControls";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/training",
  useRouter: () => ({ replace }),
}));

describe("TrainingSetupControls", () => {
  it("marks the selected skill and drives custom pickers by keyboard", async () => {
    const user = userEvent.setup();
    render(
      <TrainingSetupControls
        difficulty={null}
        difficultyOptions={[{ value: "easy", label: "Лёгкая" }]}
        grammarOptions={[{ value: "grammar.u01.n01", label: "N입니다" }]}
        grammarTopicId={null}
        sessionSize={null}
        sizeOptions={[{ value: "2", label: "2" }]}
        skill="grammar"
        unitOptions={[{ value: "u01", label: "Знакомство" }]}
        unitSlug="u01"
      />,
    );

    expect(screen.getByRole("button", { name: "Грамматика" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(document.querySelector("select")).toBeNull();

    const unit = screen.getByRole("combobox", { name: "Тема" });
    unit.focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(unit).toHaveAttribute("aria-expanded", "false");
    expect(unit).toHaveFocus();
  });
});
