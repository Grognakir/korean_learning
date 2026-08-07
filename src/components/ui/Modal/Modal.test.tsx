import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { Button } from "../Button";
import { Modal } from "./Modal";

function ModalExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Открыть</Button>
      <Modal
        description="Настройки текущего упражнения"
        onClose={() => setOpen(false)}
        open={open}
        title="Настройки"
      >
        <Button variant="secondary">Сохранить</Button>
      </Modal>
    </>
  );
}

describe("Modal", () => {
  it("traps focus and restores it after closing", async () => {
    const user = userEvent.setup();
    render(<ModalExample />);

    const trigger = screen.getByRole("button", { name: "Открыть" });
    await user.click(trigger);

    const dialog = screen.getByRole("dialog", { name: "Настройки" });
    const closeButton = screen.getByRole("button", { name: "Закрыть" });
    const saveButton = screen.getByRole("button", { name: "Сохранить" });

    expect(dialog).toHaveAccessibleDescription("Настройки текущего упражнения");
    expect(closeButton).toHaveFocus();

    saveButton.focus();
    await user.tab();
    expect(closeButton).toHaveFocus();

    await user.click(closeButton);
    expect(trigger).toHaveFocus();
  });

  it("closes with Escape", async () => {
    const user = userEvent.setup();
    render(<ModalExample />);

    await user.click(screen.getByRole("button", { name: "Открыть" }));
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
