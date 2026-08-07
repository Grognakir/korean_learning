import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PageHeader } from "./PageHeader";

describe("PageHeader", () => {
  it("provides one page-level heading and optional actions", () => {
    render(<PageHeader actions={<button>Действие</button>} title="Темы" />);

    expect(screen.getByRole("heading", { level: 1, name: "Темы" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Действие" })).toBeEnabled();
  });
});
