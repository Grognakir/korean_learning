import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TopicsCatalog } from "./TopicsCatalog";
import TopicsPage from "./page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/topics",
}));

describe("TopicsPage", () => {
  it("renders the static page shell", () => {
    render(<TopicsPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Темы" })).toBeInTheDocument();
  });

  it("defaults to themes and renders published curriculum units", async () => {
    render(await TopicsCatalog({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("tab", { name: "По темам" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("heading", { name: "인사와 소개" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "학교와 집" })).toBeInTheDocument();
  });

  it("renders grammar grouping for the grammar view", async () => {
    render(await TopicsCatalog({ searchParams: Promise.resolve({ view: "grammar" }) }));

    expect(screen.getByRole("tab", { name: "По грамматике" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText("Урок 1")).toBeInTheDocument();
    expect(screen.queryByText("syllabus")).not.toBeInTheDocument();
    expect(screen.getByText("N입니다/입니까?")).toBeInTheDocument();
  });

  it("falls back to themes for unknown view values", async () => {
    render(await TopicsCatalog({ searchParams: Promise.resolve({ view: "nope" }) }));

    expect(screen.getByRole("tab", { name: "По темам" })).toHaveAttribute("aria-selected", "true");
  });
});
