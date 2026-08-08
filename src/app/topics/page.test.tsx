import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import TopicsPage from "./page";

describe("TopicsPage", () => {
  it("renders modules from the registry", () => {
    render(<TopicsPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Темы" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Первые шаги в корейском" })).toBeInTheDocument();
  });
});
