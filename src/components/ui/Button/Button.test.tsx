import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./Button";

describe("Button", () => {
  it("активируется с клавиатуры и передаёт ref", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    const ref = createRef<HTMLButtonElement>();

    render(
      <Button onClick={handleClick} ref={ref}>
        Продолжить
      </Button>,
    );

    await user.tab();
    await user.keyboard("{Enter}");

    expect(screen.getByRole("button", { name: "Продолжить" })).toHaveFocus();
    expect(handleClick).toHaveBeenCalledOnce();
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("сохраняет нативные props и блокирует действие", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <Button data-testid="disabled-action" disabled onClick={handleClick} type="submit">
        Недоступно
      </Button>,
    );

    const button = screen.getByTestId("disabled-action");

    await user.click(button);

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("type", "submit");
    expect(handleClick).not.toHaveBeenCalled();
  });
});
