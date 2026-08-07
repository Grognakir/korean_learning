import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ContentSection } from "./ContentSection";

describe("ContentSection", () => {
  it("labels its region with the section heading", () => {
    render(
      <ContentSection className="custom-section" description="Описание" title="Практика">
        Содержимое
      </ContentSection>,
    );

    const region = screen.getByRole("region", { name: "Практика" });

    expect(region).toHaveClass("custom-section");
    expect(screen.getByRole("heading", { level: 2, name: "Практика" })).toBeInTheDocument();
    expect(region).toHaveTextContent("Описание");
  });
});
