import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ExerciseText } from "./ExerciseText";

describe("ExerciseText", () => {
  it("stacks Korean above Russian for bilingual prompts", () => {
    const { container } = render(
      <ExerciseText text={{ ko: "연세", ru: "Выберите значение слова." }} />,
    );

    const korean = screen.getByText("연세");
    const russian = screen.getByText("Выберите значение слова.");

    expect(korean).toHaveAttribute("lang", "ko");
    expect(russian).toBeInTheDocument();
    expect(container.firstElementChild?.className).toMatch(/stacked/);
    expect(korean.compareDocumentPosition(russian) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("keeps single-language labels compact", () => {
    const { container } = render(<ExerciseText text={{ ko: "하시다", ru: null }} />);

    expect(screen.getByText("하시다")).toHaveAttribute("lang", "ko");
    expect(container.firstElementChild?.className).not.toMatch(/stacked/);
  });
});
