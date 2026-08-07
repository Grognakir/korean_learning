import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { NAVIGATION_ITEMS } from "@/constants";

import { PrimaryNavigation } from "./PrimaryNavigation";

const usePathname = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => usePathname(),
}));

describe("PrimaryNavigation", () => {
  beforeEach(() => {
    usePathname.mockReturnValue("/topics/sample-module");
  });

  it("renders every primary target and marks the active section", () => {
    render(<PrimaryNavigation />);

    for (const item of NAVIGATION_ITEMS) {
      expect(screen.getByRole("link", { name: item.label })).toHaveAttribute("href", item.href);
    }

    expect(screen.getByRole("link", { name: "Темы" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Главная" })).not.toHaveAttribute("aria-current");
  });
});
