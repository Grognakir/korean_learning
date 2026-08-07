import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TrainingShell } from "./TrainingShell";

describe("TrainingShell", () => {
  it("keeps optional context and actions around the training content", () => {
    render(
      <TrainingShell actions={<button>Продолжить</button>} aside="Подсказка">
        Упражнение
      </TrainingShell>,
    );

    expect(screen.getByText("Упражнение")).toBeInTheDocument();
    expect(screen.getByRole("complementary")).toHaveTextContent("Подсказка");
    expect(screen.getByRole("button", { name: "Продолжить" })).toBeEnabled();
  });
});
