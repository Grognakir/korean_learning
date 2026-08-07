import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HomePage from "@/app/page";

describe("HomePage", () => {
  it("показывает название и состояние приложения", () => {
    render(<HomePage />);

    const heading = screen.getByRole("heading", { level: 1, name: "Korean Learning" });

    expect(heading).toBeVisible();
    expect(heading.closest("main")).toHaveAttribute("id", "main-content");
    expect(screen.getByText("Приложение готовится к первому учебному модулю.")).toBeVisible();
  });
});
