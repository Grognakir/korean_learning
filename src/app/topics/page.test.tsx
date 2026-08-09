import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TopicsCatalog } from "./TopicsCatalog";
import TopicsPage from "./page";

describe("TopicsPage", () => {
  it("renders the static page shell", () => {
    render(<TopicsPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Темы" })).toBeInTheDocument();
  });

  it("renders modules from the registry", async () => {
    render(await TopicsCatalog());

    expect(screen.getByRole("heading", { name: "Первые шаги в корейском" })).toBeInTheDocument();
  });
});
