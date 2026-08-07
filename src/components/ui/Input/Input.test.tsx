import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";

import { Input } from "./Input";

describe("Input", () => {
  it("связывает label и hint, принимает ввод и передаёт ref", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLInputElement>();

    render(<Input hint="Введите слово по-корейски" label="Ответ" ref={ref} required />);

    const input = screen.getByRole("textbox", { name: "Ответ" });

    await user.type(input, "안녕하세요");

    expect(input).toHaveValue("안녕하세요");
    expect(input).toBeRequired();
    expect(input).toHaveAccessibleDescription("Введите слово по-корейски");
    expect(ref.current).toBe(input);
  });

  it("показывает ошибку и сохраняет внешнее описание", () => {
    render(
      <>
        <span id="external-description">Внешнее описание</span>
        <Input
          aria-describedby="external-description"
          errorMessage="Ответ не распознан"
          label="Проверяемый ответ"
        />
      </>,
    );

    const input = screen.getByRole("textbox", { name: "Проверяемый ответ" });

    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription("Внешнее описание Ответ не распознан");
  });
});
