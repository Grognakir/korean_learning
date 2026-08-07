import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";

import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("поддерживает доступное описание, ввод и ref", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLTextAreaElement>();

    render(<Textarea hint="Необязательная заметка" label="Комментарий" ref={ref} rows={4} />);

    const textarea = screen.getByRole("textbox", { name: "Комментарий" });

    await user.type(textarea, "Сложное окончание");

    expect(textarea).toHaveValue("Сложное окончание");
    expect(textarea).toHaveAttribute("rows", "4");
    expect(textarea).toHaveAccessibleDescription("Необязательная заметка");
    expect(ref.current).toBe(textarea);
  });

  it("помечает ошибочное значение", () => {
    render(<Textarea errorMessage="Текст слишком короткий" label="Развёрнутый ответ" />);

    const textarea = screen.getByRole("textbox", { name: "Развёрнутый ответ" });

    expect(textarea).toBeInvalid();
    expect(textarea).toHaveAccessibleDescription("Текст слишком короткий");
  });
});
