import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DictionaryCatalog } from "./DictionaryCatalog";
import DictionaryPage from "./page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/dictionary",
}));

describe("DictionaryPage", () => {
  it("renders the static shell", () => {
    render(<DictionaryPage />);
    expect(screen.getByRole("heading", { level: 1, name: "Словарь" })).toBeInTheDocument();
  });

  it("lists published senses with homonym labels", async () => {
    render(await DictionaryCatalog({ searchParams: Promise.resolve({ unit: "u01" }) }));

    expect(screen.getAllByText("안녕")).toHaveLength(2);
    expect(screen.getByText("привет")).toBeInTheDocument();
    expect(screen.getByText("пока")).toBeInTheDocument();
    expect(screen.getByText("значение: privet")).toBeInTheDocument();
    expect(screen.getByText("значение: poka")).toBeInTheDocument();
    expect(screen.getAllByText("междометие").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Урок 1").length).toBeGreaterThan(0);
    expect(screen.queryByText("interjection")).not.toBeInTheDocument();
  });
});
