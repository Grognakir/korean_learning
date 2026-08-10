import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DeleteEntityButton } from "./DeleteEntityButton";

describe("DeleteEntityButton", () => {
  it("opens a confirmation modal and calls the action with the entity id", async () => {
    const user = userEvent.setup();
    const action = vi.fn().mockResolvedValue({ ok: true });

    render(<DeleteEntityButton action={action} entityLabel="юнит" id="unit-id" />);

    await user.click(screen.getByRole("button", { name: "Удалить" }));
    expect(screen.getByRole("dialog", { name: "Удалить юнит?" })).toBeInTheDocument();

    const confirmButtons = screen.getAllByRole("button", { name: "Удалить" });
    await user.click(confirmButtons[confirmButtons.length - 1]!);
    expect(action).toHaveBeenCalledWith("unit-id");
  });

  it("shows the action error inside the modal when deletion is blocked", async () => {
    const user = userEvent.setup();
    const action = vi.fn().mockResolvedValue({
      ok: false,
      error: "Нельзя удалить: есть связанные записи.",
    });

    render(<DeleteEntityButton action={action} entityLabel="юнит" id="unit-id" />);

    await user.click(screen.getByRole("button", { name: "Удалить" }));
    const confirmButtons = screen.getAllByRole("button", { name: "Удалить" });
    await user.click(confirmButtons[confirmButtons.length - 1]!);

    expect(
      await screen.findByText("Нельзя удалить: есть связанные записи."),
    ).toBeInTheDocument();
  });
});
