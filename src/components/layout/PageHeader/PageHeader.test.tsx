import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PageHeader } from "./PageHeader";

describe("PageHeader", () => {
  it("provides one page-level heading and optional actions", () => {
    render(<PageHeader actions={<button>Действие</button>} title="Темы" />);

    expect(screen.getByRole("heading", { level: 1, name: "Темы" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Действие" })).toBeEnabled();
  });

  it("attaches a compact back control to the eyebrow row", () => {
    render(
      <PageHeader
        backHref="/topics"
        backLabel="К каталогу"
        eyebrow="Урок 1 · 1급"
        title="인사와 소개"
      />,
    );

    const backLink = screen.getByRole("link", { name: "К каталогу" });
    expect(backLink).toHaveAttribute("href", "/topics");
    expect(backLink).toHaveTextContent("Урок 1 · 1급");
  });
});
