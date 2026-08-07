import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HomePage from "@/app/page";

describe("HomePage", () => {
  it("показывает название и состояние приложения", () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { level: 1, name: "Korean Learning" })).toBeVisible();
    expect(screen.getByText("Приложение готовится к первому учебному модулю.")).toBeVisible();
  });
});
