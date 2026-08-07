import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HomePage from "@/app/page";

describe("HomePage", () => {
  it("показывает название и состояние приложения", () => {
    render(<HomePage />);

    const heading = screen.getByRole("heading", {
      level: 1,
      name: "Корейский язык — шаг за шагом",
    });

    expect(heading).toBeVisible();
    expect(heading.closest("header")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Выбрать тему" })).toHaveAttribute("href", "/topics");
  });
});
