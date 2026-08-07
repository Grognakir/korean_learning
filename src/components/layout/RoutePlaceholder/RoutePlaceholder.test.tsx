import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RoutePlaceholder } from "./RoutePlaceholder";

describe("RoutePlaceholder", () => {
  it("provides a page heading and valid route actions", () => {
    render(
      <RoutePlaceholder
        actions={[{ href: "/training", label: "Начать" }]}
        description="Описание"
        eyebrow="Раздел"
        title="Тренировка"
      />,
    );

    expect(screen.getByRole("heading", { level: 1, name: "Тренировка" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Начать" })).toHaveAttribute("href", "/training");
  });
});
